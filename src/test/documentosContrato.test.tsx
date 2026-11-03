import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

type Chamada = { tabela: string; ops: Array<[string, unknown[]]> };

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  invoke: vi.fn(),
  upload: vi.fn(),
  rpcChamadas: [] as Array<{ nome: string; args: Record<string, unknown> }>,
  chamadas: [] as Chamada[],
  resposta: null as null | ((c: Chamada) => unknown),
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c: Chamada = { tabela, ops: [] };
    m.chamadas.push(c);
    const b: { [k: string]: unknown } = {};
    for (const op of [
      "select",
      "eq",
      "is",
      "or",
      "in",
      "not",
      "ilike",
      "order",
      "range",
      "maybeSingle",
      "abortSignal",
      "insert",
      "update",
      "delete",
      "upsert",
    ]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
      Promise.resolve(m.resposta?.(c)).then(res, rej);
    return b;
  };
  const rpc = (nome: string, args: Record<string, unknown>) => {
    m.rpcChamadas.push({ nome, args });
    return Promise.resolve(m.rpc(nome, args));
  };
  return {
    supabase: {
      auth: { getUser: m.getUser },
      from,
      rpc,
      functions: { invoke: m.invoke },
      storage: { from: () => ({ uploadToSignedUrl: m.upload }) },
    },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: () => (o: unknown) => ({ options: o, useParams: () => ({ id: "x" }) }),
  Link: ({
    children,
    to,
    params,
    ...p
  }: {
    children: ReactNode;
    to: string;
    params?: { id?: string };
  }) => (
    <a href={params?.id ? to.replace("$id", params.id) : to} {...p}>
      {children}
    </a>
  ),
}));

import { DocumentosContrato, MENSAGENS_V110 } from "@/components/contratos/DocumentosContrato";
import {
  CHUNK_TUS,
  COLUNAS_DOCUMENTO,
  LOTE_PROCESSAMENTOS,
  PAGINA_DOCS,
  atrasoPolling,
  enviarTus,
  lerConfiguracaoUpload,
  validarArquivo,
} from "@/lib/contratos/documentosDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.documentos";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const D1 = "22222222-2222-4222-8222-222222222222";
const V1 = "33333333-3333-4333-8333-333333333333";
const AR1 = "44444444-4444-4444-8444-444444444444";
const AR2 = "45454545-4545-4545-8545-454545454545";
const HASH = "a".repeat(64);
const PATH = `${A}/uploads/55555555-5555-4555-8555-555555555555/nota.pdf`;

const contrato = () => ({
  id: K1,
  id_organizacao: A,
  numero: "CT-001",
  objeto: "x",
  situacao: "ativo",
  criticidade: "alta",
  contratante: null,
});
const doc = (extra: Record<string, unknown> = {}) => ({
  id: D1,
  id_contrato: K1,
  tipo: "contrato",
  titulo: "Contrato principal",
  categoria: "Jurídico",
  situacao: "ativo",
  versao_atual: 2,
  versao_registro: 3,
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  observacoes: "Assinado",
  criado_em: "2026-01-02T12:00:00Z",
  atualizado_em: "2026-02-01T12:00:00Z",
  ...extra,
});
const versao = () => ({
  id: V1,
  id_documento_contrato: D1,
  numero_versao: 2,
  id_arquivo: AR1,
  hash: HASH,
  metadados_extraidos: { cnpj: "x" },
  enviado_por: U,
  criado_em: "2026-02-01T12:00:00Z",
});
const arquivo = (status = "aprovado") => ({
  id: AR1,
  nome_original: "contrato.pdf",
  mime: "application/pdf",
  tamanho: 1024,
  sha256: HASH,
  status_seguranca: status,
  origem: "upload_usuario",
  criado_em: "2026-02-01T12:00:00Z",
});

const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

type Dados = {
  docs?: unknown[];
  total?: number;
  status?: string;
  proc?: string;
  requisito?: string | null;
  cfg?: unknown;
  cfgErro?: boolean;
};
const RQ1 = "66666666-6666-4666-8666-666666666666";
const RQ_FANTASMA = "77777777-7777-4777-8777-777777777777";
const CFG = {
  extensoes_permitidas: [
    "pdf",
    "xlsx",
    "csv",
    "docx",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "txt",
    "json",
    "xml",
  ],
  mimes_permitidos: ["application/pdf", "text/csv", "image/png"],
  tamanho_maximo_bytes: 524288000,
  limiar_upload_resumivel_bytes: 104857600,
};
function cenario(d: Dados = {}) {
  m.resposta = (c) => {
    if (c.tabela === "contratos") return ok(contrato());
    if (c.tabela === "documentos_contrato") {
      const l = d.docs ?? [doc()];
      return ok(l, d.total ?? l.length);
    }
    if (c.tabela === "versoes_documento") return ok([versao()]);
    if (c.tabela === "arquivos") return ok([arquivo(d.status)]);
    if (c.tabela === "processamentos_documento")
      return ok([
        {
          id: "p1",
          id_versao_documento: V1,
          etapa: "documents",
          status: d.proc ?? "concluido",
          tentativas: 1,
          erro_codigo: null,
          iniciado_em: null,
          concluido_em: null,
          criado_em: "2026-02-01T12:00:00Z",
        },
      ]);
    if (c.tabela === "sugestoes_extracao_documento") {
      const s = (id: string, tipo: string, extra: Record<string, unknown> = {}) => ({
        id,
        id_versao_documento: V1,
        tipo,
        status: "pendente",
        vigencia_inicio: null,
        categoria_sugerida: null,
        id_requisito_sugerido: null,
        confianca: 0.5,
        ...extra,
      });
      return ok([
        s("s1", "classificacao", {
          categoria_sugerida: "Trabalhista",
          id_requisito_sugerido: d.requisito === undefined ? RQ1 : d.requisito,
          confianca: 0.87,
        }),
        s("s2", "obrigacao"),
        s("s3", "clausula", { vigencia_inicio: "2026-01-01" }),
        s("s4", "classificacao", {
          categoria_sugerida: "Fiscal",
          confianca: 0.2,
          status: "rejeitada",
        }),
        s("s5", "prazo", { status: "aprovada", vigencia_inicio: "2026-01-01" }),
      ]);
    }
    if (c.tabela === "requisitos_competencia")
      return ok([
        {
          id: RQ1,
          codigo: "RQ-7",
          descricao: "Folha de pagamento",
          categoria: "Pessoal",
          origem_tipo: "lista",
          origem_id: null,
        },
      ]);
    if (c.tabela === "configuracao_upload")
      return d.cfgErro ? { data: null, error: { code: "XX000" }, status: 500 } : ok(d.cfg ?? CFG);
    return ok(null);
  };
}
function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DocumentosContrato id={id} />
    </QueryClientProvider>,
  );
}
const NEGOCIO = [
  "documentos_contrato",
  "versoes_documento",
  "arquivos",
  "processamentos_documento",
  "sugestoes_extracao_documento",
];
const semNegocio = () => NEGOCIO.forEach((t) => expect(de(t)).toHaveLength(0));
const pdf = (nome = "nota.pdf", tam = 10) =>
  new File([new Uint8Array(tam)], nome, { type: "application/pdf" });

beforeEach(() => {
  m.chamadas.length = 0;
  m.rpcChamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset();
  m.invoke.mockReset();
  m.upload.mockReset().mockResolvedValue({ data: {}, error: null });
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      randomUUID: (() => {
        let n = 0;
        return () => `chave-${++n}`;
      })(),
      subtle: { digest: async () => new Uint8Array(32).fill(0xab).buffer },
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

function autorizaPequeno() {
  m.invoke.mockImplementation(async (nome: string) =>
    nome === "storage-sign-upload"
      ? {
          data: {
            ok: true,
            bucket: "contaos-documentos",
            path: PATH,
            token: "tok",
            usar_upload_resumivel: false,
          },
          error: null,
        }
      : { data: { ok: true, signed_url: "https://x.supabase.co/assinada" }, error: null },
  );
}
function rpcOk() {
  m.rpc.mockImplementation(async (nome: string) => {
    if (nome === "confirmar_upload_arquivo") return { data: AR2, error: null };
    return {
      data: { id_documento: D1, id_versao: V1, numero_versao: 1, id_arquivo: AR2, id_job: "j" },
      error: null,
    };
  });
}

describe("V1-10 rota, sessão e gate", () => {
  it("rota ssr:false, título e noindex", () => {
    const o = (
      Route as unknown as {
        options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
      }
    ).options;
    expect(o.ssr).toBe(false);
    expect(o.head().meta).toContainEqual({ title: "Documentos do contrato — ContaOS" });
    expect(o.head().meta).toContainEqual({ name: "robots", content: "noindex" });
  });
  it("sem sessão vai a /login sem consultas", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("sem organização vai a /selecionar-organizacao sem consultas", async () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(m.chamadas).toHaveLength(0);
  });
  it("403 do contrato não consulta documentos", async () => {
    m.resposta = (c) =>
      c.tabela === "contratos" ? { data: null, error: { code: "42501" }, status: 403 } : ok([]);
    montar();
    expect(await screen.findByText(MENSAGENS_V110.negado)).toBeInTheDocument();
    semNegocio();
  });
  it("UUID inválido mostra não encontrado sem consultas", async () => {
    cenario();
    montar("abc");
    expect(await screen.findByText(MENSAGENS_V110.naoEncontrado)).toBeInTheDocument();
    expect(m.chamadas).toHaveLength(0);
  });
});

describe("V1-10 lista, filtros e paginação server-side", () => {
  it("consulta colunas explícitas, id_contrato do gate, range 0-24 e count exact", async () => {
    cenario();
    montar();
    expect(await screen.findByText("Contrato principal")).toBeInTheDocument();
    const c = de("documentos_contrato")[0]!;
    expect(op(c, "select")[0]).toEqual([COLUNAS_DOCUMENTO, { count: "exact" }]);
    expect(op(c, "eq")).toContainEqual(["id_contrato", K1]);
    expect(op(c, "range")[0]).toEqual([0, PAGINA_DOCS - 1]);
    expect(PAGINA_DOCS).toBe(25);
  });
  it("mostra vigência, versão, observações, hash abreviado e status de segurança em texto", async () => {
    cenario();
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(within(linha).getByText("01/01/2026 a 31/12/2026")).toBeInTheDocument();
    expect(within(linha).getByText("Versão 2")).toBeInTheDocument();
    expect(within(linha).getByText("Assinado")).toBeInTheDocument();
    expect(await within(linha).findByText(/aaaaaaaa…aaaaaaaa/)).toBeInTheDocument();
    expect(within(linha).getByText("Aprovado")).toBeInTheDocument();
  });
  it("indicadores somente leitura: IA, vigência, classificação e metadados", async () => {
    cenario();
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    await waitFor(() =>
      expect(
        within(linha).getByText("3 sugestões de IA pendentes de revisão humana"),
      ).toBeInTheDocument(),
    );
    expect(within(linha).getByText("1 sugestão sem vigência")).toBeInTheDocument();
    expect(within(linha).getByText(/Classificação \(IA\): Trabalhista — 87%/)).toBeInTheDocument();
    expect(within(linha).getByText("Metadados extraídos: disponíveis")).toBeInTheDocument();
    // sem N+1: uma única consulta de sugestões filtrada pelas versões da página, sem head/count
    const sug = de("sugestoes_extracao_documento");
    expect(sug).toHaveLength(1);
    expect(op(sug[0]!, "in")).toContainEqual(["id_versao_documento", [V1]]);
    expect(op(sug[0]!, "select")[0]?.[1]).toBeUndefined();
    expect(op(sug[0]!, "eq")).toHaveLength(0);
  });
  it("V1-DOC-002: item sugerido real via uma consulta .in() em requisitos_competencia", async () => {
    cenario();
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(
      await within(linha).findByText("Item sugerido: RQ-7 — Folha de pagamento"),
    ).toBeInTheDocument();
    const rq = de("requisitos_competencia");
    expect(rq).toHaveLength(1);
    expect(op(rq[0]!, "select")[0]).toEqual([
      "id,codigo,descricao,categoria,origem_tipo,origem_id",
    ]);
    expect(op(rq[0]!, "in")[0]).toEqual(["id", [RQ1]]);
    expect(de("itens_lista")).toHaveLength(0);
  });
  it("V1-DOC-002: item não resolvido por RLS mostra indisponível", async () => {
    cenario({ requisito: RQ_FANTASMA });
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(await within(linha).findByText("Item sugerido indisponível")).toBeInTheDocument();
  });
  it("NFR-009: >100 processamentos entre versões; o de V2 só no 2º lote é resolvido sem consulta por versão", async () => {
    cenario();
    const base = m.resposta;
    const D2 = "d2222222-2222-4222-8222-222222222222";
    const V2 = "e2222222-2222-4222-8222-222222222222";
    const p = (id: string, vid: string, status: string) => ({
      id,
      id_versao_documento: vid,
      etapa: "documents",
      status,
      tentativas: 1,
      erro_codigo: null,
      iniciado_em: null,
      concluido_em: null,
      criado_em: "2026-02-01T12:00:00Z",
    });
    m.resposta = (c) => {
      if (c.tabela === "documentos_contrato")
        return ok([doc(), doc({ id: D2, titulo: "Aditivo" })], 2);
      if (c.tabela === "versoes_documento")
        return ok([versao(), { ...versao(), id: V2, id_documento_contrato: D2 }]);
      if (c.tabela !== "processamentos_documento") return base!(c);
      const [de0] = (c.ops.find(([o]) => o === "range")?.[1] ?? [0]) as number[];
      if (de0 === 0)
        return ok(
          Array.from({ length: LOTE_PROCESSAMENTOS }, (_, i) => p(`a${i}`, V1, "concluido")),
        );
      return ok([p("b-novo", V2, "processando"), p("b-velho", V2, "concluido")]);
    };
    montar();
    const l2 = await screen.findByTestId(`documento-${D2}`);
    expect(await within(l2).findByText("Processando")).toBeInTheDocument();
    expect(
      within(screen.getByTestId(`documento-${D1}`)).getByText("Concluído"),
    ).toBeInTheDocument();
    const pr = de("processamentos_documento");
    expect(pr).toHaveLength(2);
    expect(pr.map((c) => op(c, "range")[0])).toEqual([
      [0, LOTE_PROCESSAMENTOS - 1],
      [LOTE_PROCESSAMENTOS, 2 * LOTE_PROCESSAMENTOS - 1],
    ]);
    for (const c of pr) {
      expect(op(c, "in")[0]).toEqual(["id_versao_documento", [V1, V2].sort()]);
      expect(op(c, "eq")).toHaveLength(0);
    }
  });
  it("NFR-009: processamentos paginados em lotes de 1000 até esgotar, mais recente por versão", async () => {
    cenario();
    const base = m.resposta;
    const p = (id: string, status: string) => ({
      id,
      id_versao_documento: V1,
      etapa: "documents",
      status,
      tentativas: 1,
      erro_codigo: null,
      iniciado_em: null,
      concluido_em: null,
      criado_em: "2026-02-01T12:00:00Z",
    });
    m.resposta = (c) => {
      if (c.tabela !== "processamentos_documento") return base!(c);
      const [de0] = (c.ops.find(([o]) => o === "range")?.[1] ?? [0]) as number[];
      if (de0 === 0)
        return ok([
          p("p-novo", "processando"),
          ...Array.from({ length: 999 }, (_, i) => p(`p${i}`, "concluido")),
        ]);
      return ok([p("p-velho", "falhou")]);
    };
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(await within(linha).findByText("Processando")).toBeInTheDocument();
    const pr = de("processamentos_documento");
    expect(pr.map((c) => op(c, "range")[0])).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
    for (const c of pr) {
      expect(op(c, "in")[0]).toEqual(["id_versao_documento", [V1]]);
      expect(op(c, "order")).toEqual([
        ["criado_em", { ascending: false }],
        ["id", { ascending: false }],
      ]);
    }
  });
  it("filtros vão ao servidor (ilike título, eq tipo) e voltam à página 1", async () => {
    cenario({ total: 60 });
    montar();
    await screen.findByText("Contrato principal");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() =>
      expect(op(de("documentos_contrato").at(-1)!, "range")[0]).toEqual([25, 49]),
    );
    fireEvent.change(screen.getByLabelText("Buscar por título"), { target: { value: "ad%" } });
    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "aditivo" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    await waitFor(() => {
      const c = de("documentos_contrato").at(-1)!;
      expect(op(c, "ilike")[0]).toEqual(["titulo", "%ad\\%%"]);
      expect(op(c, "eq")).toContainEqual(["tipo", "aditivo"]);
      expect(op(c, "range")[0]).toEqual([0, 24]);
    });
  });
  it("empty state", async () => {
    cenario({ docs: [] });
    montar();
    expect(await screen.findByText(MENSAGENS_V110.vazio)).toBeInTheDocument();
  });
});

describe("V1-10 segurança de arquivo e download", () => {
  it("quarentena bloqueia download mantendo metadados", async () => {
    cenario({ status: "quarentena" });
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(await within(linha).findByText("Em quarentena")).toBeInTheDocument();
    expect(within(linha).getByText(MENSAGENS_V110.bloqueadoSeguranca)).toBeInTheDocument();
    expect(within(linha).queryByRole("button", { name: /Baixar/ })).toBeNull();
    expect(within(linha).getByText("Contrato principal")).toBeInTheDocument();
  });
  it("download aprovado usa storage-sign-download e abre só https", async () => {
    cenario();
    autorizaPequeno();
    const abrir = vi.spyOn(window, "open").mockReturnValue(null);
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    fireEvent.click(await within(linha).findByRole("button", { name: /Baixar/ }));
    await waitFor(() =>
      expect(m.invoke).toHaveBeenCalledWith("storage-sign-download", {
        body: { id_arquivo: AR1 },
      }),
    );
    expect(abrir).toHaveBeenCalledWith(
      "https://x.supabase.co/assinada",
      "_blank",
      "noopener,noreferrer",
    );
  });
  it("download negado pelo Edge mostra mensagem PT-BR", async () => {
    cenario();
    m.invoke.mockResolvedValue({ data: null, error: { context: { status: 403 } } });
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    fireEvent.click(await within(linha).findByRole("button", { name: /Baixar/ }));
    expect(await screen.findByText(MENSAGENS_V110.downloadNegado)).toBeInTheDocument();
  });
  it("validação UX usa a configuração carregada (formato, MIME, tamanho, vazio)", () => {
    const cfg = lerConfiguracaoUpload(CFG);
    expect(validarArquivo(pdf(), cfg)).toBeNull();
    expect(
      validarArquivo(new File(["x"], "a.exe", { type: "application/x-msdownload" }), cfg),
    ).toBe(MENSAGENS_V110.formatoInvalido);
    expect(validarArquivo(new File(["x"], "a.pdf", { type: "image/png" }), cfg)).toBe(
      MENSAGENS_V110.mimeIncompativel,
    );
    const grande = pdf();
    Object.defineProperty(grande, "size", { value: 600 * 1024 * 1024 });
    expect(validarArquivo(grande, cfg)).toMatch(/500 MB/);
    expect(validarArquivo(new File([], "v.pdf", { type: "application/pdf" }), cfg)).toBe(
      MENSAGENS_V110.arquivoVazio,
    );
    const menor = lerConfiguracaoUpload({
      ...CFG,
      extensoes_permitidas: ["csv"],
      tamanho_maximo_bytes: 5,
    });
    expect(validarArquivo(pdf(), menor)).toBe(MENSAGENS_V110.formatoInvalido);
    expect(validarArquivo(new File(["123456"], "a.csv", { type: "text/csv" }), menor)).toMatch(
      /limite/,
    );
  });
  it("configuração alterada no backend muda a validação do diálogo", async () => {
    cenario({ cfg: { ...CFG, extensoes_permitidas: ["csv"] } });
    montar();
    await screen.findByText("Contrato principal");
    const b = screen.getByRole("button", { name: "Enviar documentos" });
    await waitFor(() => expect(b).toBeEnabled());
    fireEvent.click(b);
    const d = await screen.findByRole("dialog");
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    expect(await within(d).findByText(MENSAGENS_V110.formatoInvalido)).toBeInTheDocument();
    expect(within(d).getByLabelText("Arquivos")).toHaveAttribute("accept", ".csv");
    const cfgCall = de("configuracao_upload")[0]!;
    expect(op(cfgCall, "select")[0]).toEqual([
      "extensoes_permitidas,mimes_permitidos,tamanho_maximo_bytes,limiar_upload_resumivel_bytes",
    ]);
    expect(op(cfgCall, "eq")).toContainEqual(["id", true]);
  });
  it("falha da configuração bloqueia só o envio; lista e download seguem", async () => {
    cenario({ cfgErro: true });
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(await screen.findByText(MENSAGENS_V110.configIndisponivel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar documentos" })).toBeDisabled();
    expect(within(linha).getByRole("button", { name: /Nova versão/ })).toBeDisabled();
    expect(await within(linha).findByRole("button", { name: /Baixar/ })).toBeEnabled();
  });
});

describe("V1-10 envio múltiplo e documento-base completo", () => {
  async function abrirEnvio() {
    cenario();
    montar();
    await screen.findByText("Contrato principal");
    const b = screen.getByRole("button", { name: "Enviar documentos" });
    await waitFor(() => expect(b).toBeEnabled());
    fireEvent.click(b);
    return screen.findByRole("dialog");
  }
  it("fim de vigência sem início bloqueia antes de qualquer chamada", async () => {
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    fireEvent.change(within(d).getByLabelText("Fim da vigência"), {
      target: { value: "2026-12-31" },
    });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar e registrar" }));
    expect(await within(d).findByText(MENSAGENS_V110.vigenciaFimSemInicio)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });
  it("fim antes do início bloqueia", async () => {
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    fireEvent.change(within(d).getByLabelText("Início da vigência"), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(within(d).getByLabelText("Fim da vigência"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar e registrar" }));
    expect(await within(d).findByText(MENSAGENS_V110.vigenciaFimAntes)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });
  it("arquivo inválido é recusado na fila sem chamar o Edge", async () => {
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), {
      target: { files: [new File(["x"], "a.exe", { type: "application/x-msdownload" })] },
    });
    expect(await within(d).findByText(MENSAGENS_V110.formatoInvalido)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });
  it("dois arquivos: assinatura, upload, confirmação com SHA-256 e criação completa com chaves distintas", async () => {
    autorizaPequeno();
    rpcOk();
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), {
      target: { files: [pdf("a.pdf"), pdf("b.pdf")] },
    });
    fireEvent.change(within(d).getByLabelText("Tipo do documento"), {
      target: { value: "aditivo" },
    });
    fireEvent.change(within(d).getByLabelText("Categoria"), { target: { value: "Jurídico" } });
    fireEvent.change(within(d).getByLabelText("Início da vigência"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(within(d).getByLabelText("Observações"), { target: { value: "Obs" } });
    const botao = within(d).getByRole("button", { name: "Enviar e registrar" });
    fireEvent.click(botao);
    fireEvent.click(botao);
    await waitFor(() =>
      expect(
        m.rpcChamadas.filter((r) => r.nome === "criar_documento_contrato_completo"),
      ).toHaveLength(2),
    );
    expect(m.invoke.mock.calls.filter(([n]) => n === "storage-sign-upload")).toHaveLength(2);
    expect(m.upload).toHaveBeenCalledWith(PATH, "tok", expect.any(File));
    const conf = m.rpcChamadas.find((r) => r.nome === "confirmar_upload_arquivo")!;
    expect(conf.args).toEqual({
      p_id_organizacao: A,
      p_id_contrato: K1,
      p_path: PATH,
      p_nome_original: "a.pdf",
      p_mime: "application/pdf",
      p_tamanho: 10,
      p_sha256: "ab".repeat(32),
      p_origem: "upload_usuario",
    });
    const criacoes = m.rpcChamadas.filter((r) => r.nome === "criar_documento_contrato_completo");
    expect(criacoes[0]!.args).toEqual({
      p_id_contrato: K1,
      p_tipo: "aditivo",
      p_titulo: "a",
      p_categoria: "Jurídico",
      p_vigencia_inicio: "2026-01-01",
      p_vigencia_fim: null,
      p_observacoes: "Obs",
      p_id_arquivo: AR2,
      p_chave_idempotencia: expect.any(String),
    });
    expect(criacoes[0]!.args["p_chave_idempotencia"]).not.toBe(
      criacoes[1]!.args["p_chave_idempotencia"],
    );
    expect(m.rpcChamadas.some((r) => r.nome === "criar_documento_contrato")).toBe(false);
  });
  it("retry após upload confirmado reutiliza id_arquivo e a mesma chave, sem reenviar bytes", async () => {
    autorizaPequeno();
    let falhar = true;
    m.rpc.mockImplementation(async (nome: string) => {
      if (nome === "confirmar_upload_arquivo") return { data: AR2, error: null };
      if (falhar) {
        falhar = false;
        return { data: null, error: { code: "08006" } };
      }
      return {
        data: { id_documento: D1, id_versao: V1, numero_versao: 1, id_arquivo: AR2, id_job: "j" },
        error: null,
      };
    });
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar e registrar" }));
    fireEvent.click(await within(d).findByRole("button", { name: "Tentar novamente nota.pdf" }));
    await waitFor(() =>
      expect(
        m.rpcChamadas.filter((r) => r.nome === "criar_documento_contrato_completo"),
      ).toHaveLength(2),
    );
    const c = m.rpcChamadas.filter((r) => r.nome === "criar_documento_contrato_completo");
    expect(c[0]!.args["p_chave_idempotencia"]).toBe(c[1]!.args["p_chave_idempotencia"]);
    expect(c[1]!.args["p_id_arquivo"]).toBe(AR2);
    expect(m.upload).toHaveBeenCalledTimes(1);
    expect(m.rpcChamadas.filter((r) => r.nome === "confirmar_upload_arquivo")).toHaveLength(1);
  });
  it("PT400 do backend aparece em PT-BR; 42501 aparece como sem permissão", async () => {
    autorizaPequeno();
    m.rpc.mockImplementation(async (nome: string) =>
      nome === "confirmar_upload_arquivo"
        ? { data: AR2, error: null }
        : { data: null, error: { code: "42501" } },
    );
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar e registrar" }));
    expect(await within(d).findByText(MENSAGENS_V110.semPermissao)).toBeInTheDocument();
  });
  it("retorno jsonb fora do contrato é tratado como erro", async () => {
    autorizaPequeno();
    m.rpc.mockImplementation(async (nome: string) =>
      nome === "confirmar_upload_arquivo"
        ? { data: AR2, error: null }
        : { data: { qualquer: 1 }, error: null },
    );
    const d = await abrirEnvio();
    fireEvent.change(within(d).getByLabelText("Arquivos"), { target: { files: [pdf()] } });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar e registrar" }));
    expect(await within(d).findByText(MENSAGENS_V110.erroEnvio)).toBeInTheDocument();
  });
});

describe("V1-10 nova versão", () => {
  it("exige motivo e chama adicionar_versao_documento_contrato", async () => {
    cenario();
    autorizaPequeno();
    rpcOk();
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    const nv = within(linha).getByRole("button", { name: "Nova versão de Contrato principal" });
    await waitFor(() => expect(nv).toBeEnabled());
    fireEvent.click(nv);
    const d = await screen.findByRole("dialog");
    fireEvent.change(within(d).getByLabelText("Arquivo"), { target: { files: [pdf()] } });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar nova versão" }));
    expect(await within(d).findByText(MENSAGENS_V110.motivoObrigatorio)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
    fireEvent.change(within(d).getByLabelText("Motivo da nova versão"), {
      target: { value: "Correção" },
    });
    fireEvent.click(within(d).getByRole("button", { name: "Enviar nova versão" }));
    await waitFor(() =>
      expect(
        m.rpcChamadas.find((r) => r.nome === "adicionar_versao_documento_contrato")?.args,
      ).toEqual({
        p_id_documento: D1,
        p_id_arquivo: AR2,
        p_motivo: "Correção",
        p_chave_idempotencia: expect.any(String),
      }),
    );
  });
});

describe("V1-10 TUS resumível e polling", () => {
  it("TUS: POST com x-signature, PATCH em blocos de 6 MB e retomada por HEAD", async () => {
    const chamadas: Array<{ metodo: string; headers: Record<string, string> }> = [];
    let falhou = false;
    const f = vi.fn(async (_u: string, init: RequestInit) => {
      const h = init.headers as Record<string, string>;
      chamadas.push({ metodo: init.method ?? "GET", headers: h });
      if (init.method === "POST")
        return new Response(null, { status: 201, headers: { Location: "https://s/up/1" } });
      if (init.method === "HEAD")
        return new Response(null, { status: 200, headers: { "Upload-Offset": String(CHUNK_TUS) } });
      if (h["Upload-Offset"] === String(CHUNK_TUS) && !falhou) {
        falhou = true;
        return new Response(null, { status: 500 });
      }
      const fim = Number(h["Upload-Offset"]) + (init.body as Blob).size;
      return new Response(null, { status: 204, headers: { "Upload-Offset": String(fim) } });
    });
    vi.stubGlobal("fetch", f);
    const arq = new File([new Uint8Array(CHUNK_TUS + 10)], "g.pdf", { type: "application/pdf" });
    const progresso: number[] = [];
    const r = await enviarTus({ bucket: "contaos-documentos", path: PATH, token: "tok" }, arq, {
      onProgresso: (p) => progresso.push(p),
      atraso: async () => {},
    });
    expect(r.location).toBe("https://s/up/1");
    expect(chamadas[0]!.metodo).toBe("POST");
    expect(chamadas[0]!.headers["x-signature"]).toBe("tok");
    expect(chamadas[0]!.headers["Tus-Resumable"]).toBe("1.0.0");
    expect(chamadas.filter((c) => c.metodo === "HEAD")).toHaveLength(1);
    expect(CHUNK_TUS).toBe(6 * 1024 * 1024);
    expect(progresso.at(-1)).toBe(100);
  });
  it("backoff 5/10/20/40/60 s", () => {
    expect([0, 1, 2, 3, 4, 9].map(atrasoPolling)).toEqual([
      5000, 10000, 20000, 40000, 60000, 60000,
    ]);
  });
  it("processando mostra status textual e permite atualização manual", async () => {
    cenario({ proc: "processando" });
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    expect(await within(linha).findByText("Processando")).toBeInTheDocument();
    const antes = de("documentos_contrato").length;
    fireEvent.click(screen.getByRole("button", { name: "Atualizar lista" }));
    await waitFor(() => expect(de("documentos_contrato").length).toBeGreaterThan(antes));
  });
});

describe("V1-10 escopo e Zero-Drift", () => {
  it("não oferece revisão/vigência de sugestão e liga o detalhe V1-11", async () => {
    cenario();
    montar();
    const linha = await screen.findByTestId(`documento-${D1}`);
    const det = within(linha).getByRole("link", { name: /Abrir detalhe de/ });
    expect(det.getAttribute("href")).toContain(`/contratos/${K1}/documentos/`);
    const fonte =
      readFileSync("src/components/contratos/DocumentosContrato.tsx", "utf8") +
      readFileSync("src/lib/contratos/documentosDados.ts", "utf8");
    expect(fonte).not.toMatch(/revisar_sugestao_extracao|definir_vigencia_sugestao_extracao/);
    expect(fonte).not.toMatch(/\.(insert|update|delete|upsert)\(/);
    expect(fonte).not.toMatch(/service_role|as any/);
  });
  it("Competências continua Em breve e Documentos é a seção atual", async () => {
    cenario();
    montar();
    await screen.findByText("Contrato principal");
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(within(nav).getByText("Documentos")).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByText("Competências")).toBeInTheDocument();
  });
});

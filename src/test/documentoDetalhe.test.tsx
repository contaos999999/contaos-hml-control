import { describe, expect, it, vi, beforeEach } from "vitest";
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
      "in",
      "lte",
      "gte",
      "order",
      "range",
      "maybeSingle",
      "abortSignal",
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
    supabase: { auth: { getUser: m.getUser }, from, rpc, functions: { invoke: m.invoke } },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: () => (o: unknown) => ({
    options: o,
    useParams: () => ({ id: "x", idDocumento: "y" }),
    useSearch: () => ({}),
  }),
  Link: ({
    children,
    to,
    params,
    search: _s,
    activeOptions: _a,
    ...p
  }: {
    children: ReactNode;
    to: string;
    params?: { id?: string; idDocumento?: string };
    search?: unknown;
    activeOptions?: unknown;
  }) => (
    <a
      href={to
        .replace("$id", params?.id ?? "")
        .replace("$idDocumento", params?.idDocumento ?? "")
        .replace(/\$id$/, params?.id ?? "")}
      {...p}
    >
      {children}
    </a>
  ),
}));

import { DocumentoDetalhe, MENSAGENS_V111 } from "@/components/contratos/DocumentoDetalhe";
import {
  PAGINA_SUGESTOES,
  PAGINA_VERSOES,
  bloqueioAprovacao,
} from "@/lib/contratos/documentoDetalheDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.documentos_.$idDocumento";

const U = "99999999-9999-4999-8999-999999999999";
const OUTRO = "abcdef12-3456-4789-8abc-def123456789";
const A = "88888888-8888-4888-8888-888888888888";
const K1 = "11111111-1111-4111-8111-111111111111";
const D1 = "22222222-2222-4222-8222-222222222222";
const V2 = "33333333-3333-4333-8333-333333333333";
const V1 = "34444444-3333-4333-8333-333333333333";
const AR2 = "44444444-4444-4444-8444-444444444444";
const AR1 = "45555555-4444-4444-8444-444444444444";
const RQ = "66666666-6666-4666-8666-666666666666";
const H = "a".repeat(64);

const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, n: string) => c.ops.filter(([o]) => o === n).map(([, a]) => a);
const eqDe = (c: Chamada, col: string) => op(c, "eq").find((a) => a[0] === col)?.[1];

const doc = () => ({
  id: D1,
  id_contrato: K1,
  tipo: "contrato",
  titulo: "Contrato principal",
  categoria: "Jurídico",
  situacao: "ativo",
  versao_atual: 2,
  versao_registro: 3,
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
  observacoes: "Assinado",
  criado_em: "2026-01-02T12:00:00Z",
  atualizado_em: "2026-02-01T12:00:00Z",
});
const versoes = (o: { hash2?: string; meta?: unknown } = {}) => [
  {
    id: V2,
    id_documento_contrato: D1,
    numero_versao: 2,
    id_arquivo: AR2,
    hash: o.hash2 ?? H,
    motivo_substituicao: "Aditivo assinado",
    metadados_extraidos:
      o.meta === undefined
        ? { cnpj: "12.345.678/0001-90", banco: { agencia: "0001", conta: "123-4" } }
        : o.meta,
    enviado_por: U,
    criado_em: "2026-02-01T12:00:00Z",
  },
  {
    id: V1,
    id_documento_contrato: D1,
    numero_versao: 1,
    id_arquivo: AR1,
    hash: "b".repeat(64),
    motivo_substituicao: null,
    metadados_extraidos: null,
    enviado_por: OUTRO,
    criado_em: "2026-01-02T12:00:00Z",
  },
];
const arq = (id: string, sha: string, status = "aprovado") => ({
  id,
  nome_original: id === AR2 ? "contrato-v2.pdf" : "contrato-v1.pdf",
  mime: "application/pdf",
  tamanho: 2048,
  sha256: sha,
  status_seguranca: status,
  origem: "upload_usuario",
  criado_por: id === AR2 ? U : OUTRO,
  criado_em: "2026-02-01T12:00:00Z",
});
const sug = (id: string, tipo: string, extra: Record<string, unknown> = {}) => ({
  id,
  id_versao_documento: V2,
  tipo,
  categoria_sugerida: null,
  id_requisito_sugerido: null,
  conteudo: `Conteúdo ${tipo}`,
  pagina: 3,
  trecho_fonte: "Cláusula 5.1 — pagamento mensal",
  confianca: 0.6,
  status: "pendente",
  revisado_por: null,
  revisado_em: null,
  metadados: {},
  criado_em: "2026-02-01T12:00:00Z",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
  ...extra,
});
type Cen = {
  docNulo?: boolean;
  status?: string;
  hash2?: string;
  meta?: unknown;
  proc?: string;
  sugs?: unknown[];
};
let sugAtuais: unknown[] = [];
function cenario(o: Cen = {}) {
  sugAtuais = o.sugs ?? [
    sug("s-class", "classificacao", {
      categoria_sugerida: "Trabalhista",
      id_requisito_sugerido: RQ,
      confianca: 0.87,
      pagina: null,
      trecho_fonte: null,
      vigencia_inicio: null,
    }),
    sug("s-obr", "obrigacao"),
    sug("s-sem-fonte", "prazo", { pagina: null }),
    sug("s-sem-vig", "restricao", { vigencia_inicio: null }),
    sug("s-aprov", "clausula", { status: "aprovada", revisado_por: U, revisado_em: "2026-02-02T12:00:00Z" }),
  ];
  m.resposta = (c) => {
    if (c.tabela === "contratos")
      return ok({ id: K1, id_organizacao: A, numero: "CT-001", objeto: "x", situacao: "ativo" });
    if (c.tabela === "documentos_contrato") return ok(o.docNulo ? null : doc());
    if (c.tabela === "versoes_documento") return ok(versoes(o), 2);
    if (c.tabela === "arquivos") return ok([arq(AR2, H, o.status), arq(AR1, "b".repeat(64))]);
    if (c.tabela === "processamentos_documento")
      return ok(
        [
          {
            id: "p1",
            id_versao_documento: eqDe(c, "id_versao_documento"),
            etapa: "documents",
            status: o.proc ?? "falhou",
            tentativas: 2,
            erro_codigo: "ocr_timeout",
            iniciado_em: "2026-02-01T12:01:00Z",
            concluido_em: null,
            criado_em: "2026-02-01T12:00:00Z",
            atualizado_em: "2026-02-01T12:02:00Z",
          },
        ],
        1,
      );
    if (c.tabela === "paginas_documento")
      return ok(
        [
          {
            id: "pg1",
            id_versao_documento: V2,
            numero_pagina: 1,
            texto_extraido: "<script>alert(1)</script> Texto da página",
            hash_texto: "c".repeat(64),
            criado_em: "2026-02-01T12:00:00Z",
          },
        ],
        1,
      );
    if (c.tabela === "fragmentos_documento")
      return ok(
        [
          {
            id: "f1",
            id_versao_documento: V2,
            pagina_inicio: 1,
            pagina_fim: 2,
            indice_fragmento: 0,
            texto: "Fragmento um",
            criado_em: "2026-02-01T12:00:00Z",
          },
        ],
        1,
      );
    if (c.tabela === "sugestoes_extracao_documento") return ok(sugAtuais, sugAtuais.length);
    if (c.tabela === "requisitos_competencia")
      return ok([
        {
          id: RQ,
          codigo: "RQ-7",
          descricao: "Folha de pagamento",
          categoria: "Pessoal",
          origem_tipo: "lista",
          origem_id: null,
        },
      ]);
    return ok(null);
  };
}
function montar(id = K1, idDoc = D1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DocumentoDetalhe id={id} idDocumento={idDoc} retorno={{}} />
    </QueryClientProvider>,
  );
}
const DETALHE = [
  "versoes_documento",
  "arquivos",
  "processamentos_documento",
  "paginas_documento",
  "fragmentos_documento",
  "sugestoes_extracao_documento",
];
const semDetalhe = () => DETALHE.forEach((t) => expect(de(t)).toHaveLength(0));
const cartao = (id: string) => screen.findByTestId(`sugestao-${id}`);

beforeEach(() => {
  m.chamadas.length = 0;
  m.rpcChamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset();
  m.invoke.mockReset();
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-11 rota e gate", () => {
  it("rota ssr:false, título e noindex", () => {
    const o = (
      Route as unknown as {
        options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
      }
    ).options;
    expect(o.ssr).toBe(false);
    expect(o.head().meta).toContainEqual({ title: "Detalhe do documento — ContaOS" });
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
  it("UUID de documento inválido: não encontrado sem consultas", async () => {
    cenario();
    montar(K1, "abc");
    expect(await screen.findByText(MENSAGENS_V111.docNaoEncontrado)).toBeInTheDocument();
    expect(m.chamadas).toHaveLength(0);
  });
  it("403 do contrato não consulta documento nem detalhe", async () => {
    m.resposta = (c) =>
      c.tabela === "contratos" ? { data: null, error: { code: "42501" }, status: 403 } : ok([]);
    montar();
    expect(await screen.findByText(MENSAGENS_V111.negado)).toBeInTheDocument();
    expect(de("documentos_contrato")).toHaveLength(0);
    semDetalhe();
  });
  it("documento de outro contrato/tenant: mesma mensagem de não encontrado, sem detalhe", async () => {
    cenario({ docNulo: true });
    montar();
    expect(await screen.findByText(MENSAGENS_V111.docNaoEncontrado)).toBeInTheDocument();
    const d = de("documentos_contrato")[0]!;
    expect(eqDe(d, "id")).toBe(D1);
    expect(eqDe(d, "id_contrato")).toBe(K1);
    expect(op(d, "maybeSingle")).toHaveLength(1);
    semDetalhe();
  });
});

describe("V1-11 versões e cadeia de evidência", () => {
  it("versões paginadas server-side, colunas explícitas, atual marcada, motivo visível, arquivos em um .in()", async () => {
    cenario();
    montar();
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato principal" })).toBeInTheDocument();
    const hist = await screen.findByRole("region", { name: "Histórico de versões" });
    expect(await within(hist).findByText("Versão atual")).toBeInTheDocument();
    expect(within(hist).getByText(/Aditivo assinado/)).toBeInTheDocument();
    const v = de("versoes_documento")[0]!;
    expect(op(v, "select")[0]).toEqual([
      "id,id_documento_contrato,numero_versao,id_arquivo,hash,motivo_substituicao,metadados_extraidos,enviado_por,criado_em",
      { count: "exact" },
    ]);
    expect(eqDe(v, "id_documento_contrato")).toBe(D1);
    expect(op(v, "order")).toEqual([
      ["numero_versao", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(op(v, "range")[0]).toEqual([0, PAGINA_VERSOES - 1]);
    const a = de("arquivos");
    expect(a).toHaveLength(1);
    expect(op(a[0]!, "select")[0]![0]).not.toMatch(/bucket|path/);
    expect(op(a[0]!, "in")[0]).toEqual(["id", [AR2, AR1].sort()]);
    expect(document.body.innerHTML).not.toMatch(/bucket|uploads\//);
  });
  it("cadeia: hash, origem, usuário 'Você' e terceiro abreviado; sem alerta quando hashes coincidem", async () => {
    cenario();
    montar();
    const cad = await screen.findByRole("region", { name: "Cadeia de evidência" });
    expect(await within(cad).findByText("Você")).toBeInTheDocument();
    expect(within(cad).getByText("contrato-v2.pdf")).toBeInTheDocument();
    expect(within(cad).getByText("Envio pelo usuário")).toBeInTheDocument();
    expect(within(cad).queryByText(MENSAGENS_V111.hashDivergente)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Selecionar versão 1/ }));
    expect(await within(cad).findByText("abcdef12…")).toBeInTheDocument();
  });
  it("hash da versão diferente do SHA do arquivo: alerta de inconsistência sem afirmar causa", async () => {
    cenario({ hash2: "f".repeat(64) });
    montar();
    expect(await screen.findByText(MENSAGENS_V111.hashDivergente)).toBeInTheDocument();
    expect(MENSAGENS_V111.hashDivergente).not.toMatch(/adulter|fraude|violad/i);
  });
  it("selecionar outra versão só refaz leituras da versão, sem RPC", async () => {
    cenario();
    montar();
    await screen.findByRole("region", { name: "Cadeia de evidência" });
    await waitFor(() => expect(de("sugestoes_extracao_documento").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /Selecionar versão 1/ }));
    await waitFor(() =>
      expect(
        de("sugestoes_extracao_documento").some((c) => eqDe(c, "id_versao_documento") === V1),
      ).toBe(true),
    );
    expect(m.rpcChamadas).toHaveLength(0);
  });
});

describe("V1-11 arquivo e download", () => {
  it("aprovado: download por storage-sign-download com id_arquivo e abre só https", async () => {
    cenario();
    const abrir = vi.spyOn(window, "open").mockReturnValue(null);
    m.invoke.mockResolvedValue({
      data: { ok: true, signed_url: "https://x.supabase.co/assinada" },
      error: null,
    });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Baixar contrato-v2.pdf" }));
    await waitFor(() =>
      expect(m.invoke).toHaveBeenCalledWith("storage-sign-download", {
        body: { id_arquivo: AR2 },
      }),
    );
    expect(abrir).toHaveBeenCalledWith("https://x.supabase.co/assinada", "_blank", "noopener,noreferrer");
    abrir.mockRestore();
  });
  it.each(["quarentena", "bloqueado", "pendente"])("%s: sem download, metadados visíveis", async (s) => {
    cenario({ status: s });
    montar();
    const cad = await screen.findByRole("region", { name: "Cadeia de evidência" });
    expect(await within(cad).findByText("contrato-v2.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Baixar/ })).not.toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });
});

describe("V1-11 metadados, páginas, fragmentos e processamento", () => {
  it("metadados com rótulos PT-BR e objetos aninhados, como texto", async () => {
    cenario();
    montar();
    const r = await screen.findByRole("region", { name: "Metadados extraídos" });
    expect(within(r).getByText("CNPJ")).toBeInTheDocument();
    expect(within(r).getByText("12.345.678/0001-90")).toBeInTheDocument();
    expect(within(r).getByText("Agência")).toBeInTheDocument();
    expect(within(r).getByText("0001")).toBeInTheDocument();
  });
  it("sem metadados mostra estado vazio sem inventar valor", async () => {
    cenario({ meta: null });
    montar();
    const r = await screen.findByRole("region", { name: "Metadados extraídos" });
    expect(within(r).getByText(MENSAGENS_V111.semMetadados)).toBeInTheDocument();
  });
  it("páginas por versão ordenadas e paginadas; texto renderizado como texto puro", async () => {
    cenario();
    montar();
    const r = await screen.findByRole("region", { name: "Páginas extraídas" });
    expect(await within(r).findByText(/<script>alert\(1\)<\/script> Texto da página/)).toBeInTheDocument();
    expect(document.querySelector("main script")).toBeNull();
    const p = de("paginas_documento")[0]!;
    expect(op(p, "select")[0]![0]).toBe(
      "id,id_versao_documento,numero_pagina,texto_extraido,hash_texto,criado_em",
    );
    expect(op(p, "order")[0]).toEqual(["numero_pagina", { ascending: true }]);
    expect(op(p, "range")[0]).toEqual([0, 9]);
  });
  it("fragmentos sem embedding, filtro por página no servidor", async () => {
    cenario();
    montar();
    const r = await screen.findByRole("region", { name: "Fragmentos" });
    expect(await within(r).findByText("Fragmento um")).toBeInTheDocument();
    const f0 = de("fragmentos_documento")[0]!;
    expect(op(f0, "select")[0]![0]).not.toMatch(/embedding/);
    fireEvent.change(within(r).getByLabelText("Filtrar por página"), { target: { value: "2" } });
    fireEvent.click(within(r).getByRole("button", { name: "Aplicar" }));
    await waitFor(() => {
      const u = de("fragmentos_documento").at(-1)!;
      expect(op(u, "lte")[0]).toEqual(["pagina_inicio", 2]);
      expect(op(u, "gte")[0]).toEqual(["pagina_fim", 2]);
    });
  });
  it("processamento: status em texto, erro sanitizado, paginado e mais recente primeiro", async () => {
    cenario();
    montar();
    const r = await screen.findByRole("region", { name: "Processamento" });
    expect(await within(r).findByText("Falhou")).toBeInTheDocument();
    expect(within(r).getByText(/Tentativas: 2/)).toBeInTheDocument();
    expect(within(r).getByText(MENSAGENS_V111.erroProcessamento)).toBeInTheDocument();
    expect(r.textContent).not.toMatch(/ocr_timeout/);
    const p = de("processamentos_documento")[0]!;
    expect(op(p, "order")).toEqual([
      ["criado_em", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(op(p, "range")[0]).toEqual([0, 9]);
    const antes = de("processamentos_documento").length;
    fireEvent.click(within(r).getByRole("button", { name: "Atualizar processamento" }));
    await waitFor(() => expect(de("processamentos_documento").length).toBeGreaterThan(antes));
  });
});

describe("V1-11 sugestões de IA e revisão humana", () => {
  it("lista paginada por versão com filtros server-side e item real em um .in()", async () => {
    cenario();
    montar();
    const c = await cartao("s-class");
    expect(within(c).getByText(/Trabalhista/)).toBeInTheDocument();
    expect(await within(c).findByText("Item sugerido: RQ-7 — Folha de pagamento")).toBeInTheDocument();
    expect(within(c).getByText("Confiança: 87%")).toBeInTheDocument();
    const s = de("sugestoes_extracao_documento")[0]!;
    expect(eqDe(s, "id_versao_documento")).toBe(V2);
    expect(op(s, "range")[0]).toEqual([0, PAGINA_SUGESTOES - 1]);
    expect(op(s, "order")).toEqual([
      ["criado_em", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    const rq = de("requisitos_competencia");
    expect(rq).toHaveLength(1);
    expect(op(rq[0]!, "in")[0]).toEqual(["id", [RQ]]);
    const r = screen.getByRole("region", { name: "Sugestões de IA" });
    fireEvent.change(within(r).getByLabelText("Status"), { target: { value: "pendente" } });
    fireEvent.change(within(r).getByLabelText("Tipo de sugestão"), { target: { value: "obrigacao" } });
    await waitFor(() => {
      const u = de("sugestoes_extracao_documento").at(-1)!;
      expect(eqDe(u, "status")).toBe("pendente");
      expect(eqDe(u, "tipo")).toBe("obrigacao");
    });
  });
  it("material mostra fonte página/trecho; IA separada de decisão humana", async () => {
    cenario();
    montar();
    const c = await cartao("s-obr");
    expect(within(c).getByText("Sugestão de IA")).toBeInTheDocument();
    expect(within(c).getByText("Página 3")).toBeInTheDocument();
    expect(within(c).getByText(/Cláusula 5.1 — pagamento mensal/)).toBeInTheDocument();
    const ap = await cartao("s-aprov");
    expect(within(ap).getByText(/Decisão humana: aprovada por Você/)).toBeInTheDocument();
    expect(within(ap).queryByRole("button", { name: /Aprovar/ })).not.toBeInTheDocument();
  });
  it("material sem fonte: aprovação bloqueada com motivo; sem vigência: bloqueada + Definir vigência", async () => {
    cenario();
    montar();
    const sf = await cartao("s-sem-fonte");
    expect(within(sf).getByRole("button", { name: /Aprovar/ })).toBeDisabled();
    expect(within(sf).getByText(MENSAGENS_V111.semFonte)).toBeInTheDocument();
    const sv = await cartao("s-sem-vig");
    expect(within(sv).getByRole("button", { name: /Aprovar/ })).toBeDisabled();
    expect(within(sv).getByText(MENSAGENS_V111.semVigencia)).toBeInTheDocument();
    expect(within(sv).getByRole("button", { name: /Definir vigência/ })).toBeEnabled();
    expect(bloqueioAprovacao({ tipo: "obrigacao", pagina: 1, trecho_fonte: "  ", vigencia_inicio: "2026-01-01" })).toBe("sem_fonte");
    expect(bloqueioAprovacao({ tipo: "classificacao", pagina: null, trecho_fonte: null, vigencia_inicio: null })).toBeNull();
  });
  it("definir vigência: PT400 mostra erro; atualizada envia args e refaz leitura", async () => {
    cenario();
    m.rpc
      .mockResolvedValueOnce({ data: null, error: { code: "PT400", message: "x" } })
      .mockResolvedValueOnce({ data: { status: "atualizada" }, error: null });
    montar();
    fireEvent.click(within(await cartao("s-sem-vig")).getByRole("button", { name: /Definir vigência/ }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"), { target: { value: "2026-03-01" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vigência" }));
    expect(await within(dlg).findByText(MENSAGENS_V111.vigenciaInvalida)).toBeInTheDocument();
    const antes = de("sugestoes_extracao_documento").length;
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vigência" }));
    expect(await screen.findByText(MENSAGENS_V111.vigenciaSalva)).toBeInTheDocument();
    expect(m.rpcChamadas.at(-1)).toEqual({
      nome: "definir_vigencia_sugestao_extracao",
      args: { p_id_sugestao: "s-sem-vig", p_vigencia_inicio: "2026-03-01", p_vigencia_fim: null },
    });
    await waitFor(() => expect(de("sugestoes_extracao_documento").length).toBeGreaterThan(antes));
  });
  it("definir vigência: fim antes do início bloqueia antes da RPC; sem_alteracao informa", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: { status: "sem_alteracao" }, error: null });
    montar();
    fireEvent.click(within(await cartao("s-sem-vig")).getByRole("button", { name: /Definir vigência/ }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"), { target: { value: "2026-03-01" } });
    fireEvent.change(within(dlg).getByLabelText("Fim da vigência (opcional)"), { target: { value: "2026-02-01" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vigência" }));
    expect(await within(dlg).findByText(MENSAGENS_V111.fimAntes)).toBeInTheDocument();
    expect(m.rpcChamadas).toHaveLength(0);
    fireEvent.change(within(dlg).getByLabelText("Fim da vigência (opcional)"), { target: { value: "" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vigência" }));
    expect(await screen.findByText(MENSAGENS_V111.vigenciaSemAlteracao)).toBeInTheDocument();
  });
  it("definir vigência: PT409 refaz leitura e informa já revisada", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: null, error: { code: "PT409", message: "x" } });
    montar();
    fireEvent.click(within(await cartao("s-sem-vig")).getByRole("button", { name: /Definir vigência/ }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"), { target: { value: "2026-03-01" } });
    const antes = de("sugestoes_extracao_documento").length;
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vigência" }));
    expect(await screen.findByText(MENSAGENS_V111.jaRevisada)).toBeInTheDocument();
    await waitFor(() => expect(de("sugestoes_extracao_documento").length).toBeGreaterThan(antes));
  });
  it("aprovar material: uma chamada mesmo com duplo clique; mensagem de rascunho, nunca ativada", async () => {
    cenario();
    let liberar: (v: unknown) => void = () => {};
    m.rpc.mockImplementation(() => new Promise((ok) => (liberar = ok)));
    montar();
    fireEvent.click(within(await cartao("s-obr")).getByRole("button", { name: /Aprovar/ }));
    const dlg = await screen.findByRole("dialog");
    const conf = within(dlg).getByRole("button", { name: "Confirmar aprovação" });
    fireEvent.click(conf);
    fireEvent.click(conf);
    liberar({ data: { status: "aprovada", id_regra_rascunho: "r1", mensagem: "x" }, error: null });
    expect(await screen.findByText(MENSAGENS_V111.aprovadaRascunho)).toBeInTheDocument();
    expect(m.rpcChamadas).toHaveLength(1);
    expect(m.rpcChamadas[0]).toEqual({
      nome: "revisar_sugestao_extracao",
      args: {
        p_id_sugestao: "s-obr",
        p_aprovar: true,
        p_conteudo_revisado: null,
        p_categoria_revisada: null,
        p_id_requisito_revisado: null,
      },
    });
    expect(document.body.textContent).not.toMatch(/regra ativada|regra ativa\b/i);
  });
  it("aprovar classificação envia categoria revisada; rejeitar envia p_aprovar=false", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: { status: "aprovada", id_regra_rascunho: null }, error: null });
    montar();
    fireEvent.click(within(await cartao("s-class")).getByRole("button", { name: /Aprovar/ }));
    let dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Categoria revisada (opcional)"), {
      target: { value: "Fiscal" },
    });
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    expect(await screen.findByText(MENSAGENS_V111.aprovadaAplicada)).toBeInTheDocument();
    expect(m.rpcChamadas[0]!.args).toMatchObject({ p_aprovar: true, p_categoria_revisada: "Fiscal" });
    m.rpc.mockResolvedValue({ data: { status: "rejeitada" }, error: null });
    fireEvent.click(within(await cartao("s-obr")).getByRole("button", { name: /Rejeitar/ }));
    dlg = await screen.findByRole("dialog");
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar rejeição" }));
    expect(await screen.findByText(MENSAGENS_V111.rejeitada)).toBeInTheDocument();
    expect(m.rpcChamadas[1]!.args).toMatchObject({ p_id_sugestao: "s-obr", p_aprovar: false });
  });
  it("erro P0001 'já revisada' da revisão: mensagem fixa e refetch antes de nova tentativa", async () => {
    cenario();
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "Esta sugestão já foi revisada anteriormente." },
    });
    montar();
    fireEvent.click(within(await cartao("s-obr")).getByRole("button", { name: /Aprovar/ }));
    const dlg = await screen.findByRole("dialog");
    const antes = de("sugestoes_extracao_documento").length;
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    expect(await screen.findByText(MENSAGENS_V111.jaRevisada)).toBeInTheDocument();
    await waitFor(() => expect(de("sugestoes_extracao_documento").length).toBeGreaterThan(antes));
  });
  it("erro desconhecido da revisão não exibe texto bruto do backend", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "stack secreto /bucket/x" } });
    montar();
    fireEvent.click(within(await cartao("s-obr")).getByRole("button", { name: /Rejeitar/ }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar rejeição" }));
    expect(await screen.findByText(MENSAGENS_V111.erroRevisao)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/stack secreto|\/bucket/);
  });
});

describe("V1-11 escopo e Zero-Drift", () => {
  it("sem escrita direta, sem embedding, sem service_role/as any, sem itens_lista", () => {
    const fonte =
      readFileSync("src/components/contratos/DocumentoDetalhe.tsx", "utf8") +
      readFileSync("src/lib/contratos/documentoDetalheDados.ts", "utf8");
    expect(fonte).not.toMatch(/\.(insert|update|delete|upsert)\(/);
    expect(fonte).not.toMatch(/service_role|as any|itens_lista|getPublicUrl|dangerouslySetInnerHTML/);
    expect(fonte).not.toMatch(/"[^"]*embedding[^"]*"/);
  });
});

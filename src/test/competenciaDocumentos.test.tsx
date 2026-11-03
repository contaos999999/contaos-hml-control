import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  invoke: vi.fn(),
  upload: vi.fn(),
  publicUrl: vi.fn(),
  open: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => {
  const rpc = (nome: string, args: Record<string, unknown>) => {
    let p: Promise<unknown> | null = null;
    const run = () => (p ??= Promise.resolve().then(() => m.rpc(nome, args)));
    return {
      abortSignal: () => run(),
      then: (a: (v: unknown) => unknown, b?: (e: unknown) => unknown) => run().then(a, b),
    };
  };
  const cfg = {
    select: () => cfg,
    eq: () => cfg,
    abortSignal: () => cfg,
    maybeSingle: () => {
      m.from("configuracao_upload");
      return Promise.resolve({
        data: {
          extensoes_permitidas: ["pdf"],
          mimes_permitidos: ["application/pdf"],
          tamanho_maximo_bytes: 1000000,
          limiar_upload_resumivel_bytes: 500000,
        },
        error: null,
      });
    },
  };
  return {
    supabase: {
      auth: { getUser: m.getUser },
      from: () => cfg,
      rpc,
      functions: { invoke: m.invoke },
      storage: {
        from: () => ({ uploadToSignedUrl: m.upload, getPublicUrl: m.publicUrl }),
      },
    },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: (p: string) => (o: unknown) => ({
    path: p,
    options: o,
    useParams: () => ({ id: "x" }),
  }),
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

import { CompetenciaDocumentos } from "@/components/competencias/CompetenciaDocumentos";
import {
  classificarErroV115,
  parseLeituraV115,
  tiposParaRequisito,
} from "@/lib/competencias/competenciaDocumentosDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/competencias_.$id_.documentos";

const U = "user-1";
const ID = "44444444-4444-4444-8444-444444444444";
const K = "11111111-1111-4111-8111-111111111111";
const ORG = "22222222-2222-4222-8222-222222222222";
const ARQ = "66666666-6666-4666-8666-666666666666";
const DOC = "77777777-7777-4777-8777-777777777777";
const REQ = "88888888-8888-4888-8888-888888888888";

type Op = {
  estado?: string;
  docs?: unknown[];
  reqs?: unknown[];
  docsTotal?: number;
  reqsTotal?: number;
  pendentes?: number;
  enviar?: boolean;
  versao?: boolean;
  motivo?: boolean;
};
function doc(o: { seg?: string; proc?: string | null; id?: string } = {}) {
  return {
    id: o.id ?? DOC,
    tipo: "nota_fiscal",
    titulo: "Nota de março",
    categoria: null,
    situacao: "ativo",
    versao_atual: 1,
    versao_registro: 1,
    criado_em: "2026-03-10T12:00:00Z",
    atualizado_em: "2026-03-10T12:00:00Z",
    id_requisito_competencia: REQ,
    requisito: { id: REQ, codigo: "R1", descricao: "Nota fiscal do mês" },
    versao: {
      id: "v1",
      numero_versao: 1,
      hash: "abcdef0123456789",
      motivo_substituicao: null,
      metadados_extraidos: null,
      criado_em: "2026-03-10T12:00:00Z",
      id_arquivo: ARQ,
    },
    arquivo: {
      id: ARQ,
      nome_original: "nota.pdf",
      mime: "application/pdf",
      tamanho: 10,
      sha256: "abcdef0123456789",
      status_seguranca: o.seg ?? "aprovado",
      origem: "upload_usuario",
      criado_em: "2026-03-10T12:00:00Z",
    },
    processamento:
      o.proc === null
        ? null
        : { id: "p1", etapa: "documents", status: o.proc ?? "concluido", tentativas: 1 },
  };
}
function req(tipos: string[] = [], atendido = false, id = REQ) {
  return {
    id,
    codigo: "R1",
    descricao: "Nota fiscal do mês",
    categoria: "fiscal",
    obrigatorio: true,
    aplicavel: true,
    impeditivo: true,
    criticidade: "alta",
    ordem: 1,
    tipos_esperados: tipos,
    atendido,
  };
}
function leitura(o: Op = {}) {
  const docs = o.docs ?? [doc()];
  const reqs = o.reqs ?? [req(["nota_fiscal", "tipo_sem_rotulo"])];
  return {
    schema_versao: "v115-v1",
    competencia: {
      id: ID,
      id_contrato: K,
      id_organizacao: ORG,
      competencia_referencia: "2026-03-01",
      situacao: "preparando",
      versao_registro: 1,
      atualizado_em: "2026-03-10T12:00:00Z",
    },
    estado_documental: o.estado ?? "missing_docs",
    resumo: {
      documentos_total: o.docsTotal ?? docs.length,
      requisitos_documentais_total: o.reqsTotal ?? reqs.length,
      requisitos_documentais_aplicaveis: o.reqsTotal ?? reqs.length,
      requisitos_documentais_pendentes: o.pendentes ?? 1,
    },
    documentos: docs,
    documentos_paginacao: { offset: 0, limite: 25, total: o.docsTotal ?? docs.length },
    requisitos_documentais: reqs,
    requisitos_paginacao: { offset: 0, limite: 25, total: o.reqsTotal ?? reqs.length },
    capacidades: {
      pode_enviar: o.enviar ?? true,
      pode_nova_versao: o.versao ?? true,
      motivo_nova_versao_obrigatorio: o.motivo ?? false,
    },
  };
}
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const RET = { id_documento: DOC, id_versao: "v2", numero_versao: 1, id_arquivo: ARQ };

let leituraAtual: unknown;
function rpcPadrao(nome: string) {
  if (nome === "obter_documentos_competencia_v115") return ok(leituraAtual);
  if (nome === "confirmar_upload_arquivo") return ok(ARQ);
  if (nome === "criar_documento_competencia_v115") return ok(RET);
  if (nome === "adicionar_versao_documento_competencia_v115") return ok({ ...RET, numero_versao: 2 });
  return { data: null, error: { code: "XX" } };
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.localStorage.clear();
  definirPreferenciaOrganizacao(U, ORG);
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  leituraAtual = leitura();
  m.rpc.mockImplementation(rpcPadrao);
  m.invoke.mockImplementation((nome: string) =>
    Promise.resolve(
      nome === "storage-sign-upload"
        ? {
            data: { ok: true, bucket: "documentos", path: "o/c/x.pdf", token: "t", usar_upload_resumivel: false },
            error: null,
          }
        : { data: { ok: true, signed_url: "https://exemplo.test/s" }, error: null },
    ),
  );
  m.upload.mockResolvedValue({ error: null });
  vi.stubGlobal("open", m.open);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const montar = (id = ID) => render(<CompetenciaDocumentos id={id} />);
const pronto = () => screen.findByTestId("resumo-documental");
const leituras = () => m.rpc.mock.calls.filter((c) => c[0] === "obter_documentos_competencia_v115");
const pdf = (n = "nota.pdf") => new File(["%PDF-1"], n, { type: "application/pdf" });

describe("V1-15 rota e gate", () => {
  it("rota /competencias_/$id_/documentos, ssr:false e head PT-BR", () => {
    const r = Route as unknown as { path: string; options: { ssr: boolean; head: () => { meta: Record<string, string>[] } } };
    expect(r.path).toBe("/competencias_/$id_/documentos");
    expect(r.options.ssr).toBe(false);
    const meta = r.options.head().meta;
    expect(meta.find((x) => x["title"])?.["title"]).toMatch(/Documentos/);
    for (const k of ["og:title", "og:description", "og:type"])
      expect(meta.some((x) => x["property"] === k)).toBe(true);
    expect(meta.some((x) => x["name"] === "twitter:card")).toBe(true);
  });

  it("UUID inválido: zero Auth, zero RPC, zero Edge", async () => {
    montar("abc");
    expect(await screen.findByText("Competência não encontrada ou indisponível.")).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.invoke).not.toHaveBeenCalled();
  });

  it("sem sessão → /login sem RPC", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("sem organização → /selecionar-organizacao sem RPC", async () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("ordem sessão → leitura V1-15 com paginação 25/25", async () => {
    montar();
    await pronto();
    expect(leituras()).toHaveLength(1);
    expect(m.rpc).toHaveBeenCalledWith("obter_documentos_competencia_v115", {
      p_id_competencia: ID,
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    });
    expect(m.getUser.mock.invocationCallOrder[0]).toBeLessThan(m.rpc.mock.invocationCallOrder[0]!);
  });

  it.each([
    [{ code: "42501", message: "RAW denied" }, 400],
    [{ message: "RAW" }, 403],
  ])("403/RLS não vira vazio (%o)", async (error, status) => {
    m.rpc.mockResolvedValue({ data: null, error, status });
    montar();
    expect(await screen.findByText("Você não tem acesso a esta competência.")).toBeInTheDocument();
    expect(screen.queryByText(/RAW/)).toBeNull();
    expect(screen.queryByText(/Nenhum documento/)).toBeNull();
  });

  it("PT404 → não encontrada", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "PT404", message: "RAW" }, status: 404 });
    montar();
    expect(await screen.findByText("Competência não encontrada ou indisponível.")).toBeInTheDocument();
  });

  it("transporte → erro sanitizado e retry manual", async () => {
    m.rpc.mockRejectedValueOnce(new TypeError("RAW fetch"));
    montar();
    expect((await screen.findByRole("alert")).textContent).toMatch(/Não foi possível carregar/);
    expect(screen.queryByText(/RAW/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    await pronto();
    expect(leituras()).toHaveLength(2);
  });

  it("classificador: P0001 nunca sem_permissao; 23505 duplicada", () => {
    expect(classificarErroV115({ code: "P0001" })).toBe("erro");
    expect(classificarErroV115({ code: "42501" })).toBe("sem_permissao");
    expect(classificarErroV115({}, 401)).toBe("sem_permissao");
    expect(classificarErroV115({ code: "PT404" })).toBe("nao_encontrada");
    expect(classificarErroV115({ code: "23505" })).toBe("duplicada");
    expect(classificarErroV115({ code: "PT409" })).toBe("conflito");
    expect(classificarErroV115({ code: "PT400" })).toBe("erro");
  });

  it("shape inválido → erro", () => {
    expect(parseLeituraV115({ schema_versao: "v115-v1" })).toBeNull();
    expect(parseLeituraV115({ ...leitura(), schema_versao: "outro" })).toBeNull();
    expect(parseLeituraV115(leitura())).not.toBeNull();
  });
});

describe("V1-15 resumo e tabela (backend é autoridade)", () => {
  it.each([
    ["missing_docs", "Documentos pendentes"],
    ["processing", "Em processamento"],
    ["complete", "Documentação completa"],
    ["error", "Documentos com erro"],
  ])("estado %s exibido como veio do backend", async (estado, rotulo) => {
    leituraAtual = leitura({ estado, pendentes: 0 });
    montar();
    const r = await pronto();
    expect(r.getAttribute("data-estado")).toBe(estado);
    expect(r.textContent).toContain(rotulo);
  });

  it("estado incoerente com contadores não é recalculado", async () => {
    leituraAtual = leitura({ estado: "complete", pendentes: 5 });
    montar();
    expect((await pronto()).getAttribute("data-estado")).toBe("complete");
  });

  it("paginação server-side: próxima página de documentos muda só offset de documentos", async () => {
    leituraAtual = leitura({ docsTotal: 30 });
    montar();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: "Próxima página de documentos" }));
    await waitFor(() => expect(leituras()).toHaveLength(2));
    expect(leituras()[1]![1]).toMatchObject({ p_documentos_offset: 25, p_requisitos_offset: 0 });
  });

  it("paginação de requisitos muda só offset de requisitos", async () => {
    leituraAtual = leitura({ reqsTotal: 40 });
    montar();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: "Próxima página de requisitos" }));
    await waitFor(() => expect(leituras()).toHaveLength(2));
    expect(leituras()[1]![1]).toMatchObject({ p_documentos_offset: 0, p_requisitos_offset: 25 });
  });

  it("vazio ≠ sem permissão", async () => {
    leituraAtual = leitura({ docs: [] });
    montar();
    await pronto();
    expect(screen.getByText("Nenhum documento vinculado a esta competência.")).toBeInTheDocument();
  });

  it("capacidades false: Enviar e Nova versão bloqueados", async () => {
    leituraAtual = leitura({ enviar: false, versao: false });
    montar();
    await pronto();
    expect(screen.queryByRole("button", { name: "Enviar" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Nova versão/ })).toBeNull();
    expect(screen.getAllByText(/Bloqueado pelo backend/).length).toBeGreaterThan(0);
  });
});

describe("V1-15 envio reutiliza uploader V1-10", () => {
  async function selecionar(f = pdf()) {
    montar();
    await pronto();
    const input = await screen.findByLabelText("Arquivo");
    fireEvent.change(input, { target: { files: [f] } });
  }

  it("tipos_esperados do backend são exatamente as opções; valor sem rótulo usa o próprio valor", async () => {
    await selecionar();
    fireEvent.change(screen.getByLabelText("Requisito documental (opcional)"), { target: { value: REQ } });
    const tipo = screen.getByLabelText("Tipo do documento") as HTMLSelectElement;
    const vals = Array.from(tipo.options).map((o) => o.value).filter(Boolean);
    expect(vals).toEqual(["nota_fiscal", "tipo_sem_rotulo"]);
    expect(Array.from(tipo.options).some((o) => o.textContent === "tipo_sem_rotulo")).toBe(true);
  });

  it("tipos_esperados vazio → catálogo genérico V1-10", () => {
    expect(tiposParaRequisito(req([])).map((t) => t[0])).toContain("outro");
    expect(tiposParaRequisito(null).map((t) => t[0])).toContain("contrato");
    expect(tiposParaRequisito(req(["x"]))).toEqual([["x", "x"]]);
  });

  it("upload → confirmar (org/contrato da competência) → criar V1-15 idempotente; duplo clique = 1", async () => {
    await selecionar();
    fireEvent.change(screen.getByLabelText("Requisito documental (opcional)"), { target: { value: REQ } });
    fireEvent.change(screen.getByLabelText("Tipo do documento"), { target: { value: "nota_fiscal" } });
    const b = screen.getByRole("button", { name: "Enviar" });
    fireEvent.click(b);
    fireEvent.click(b);
    expect(await screen.findByText(/Envio concluído/)).toBeInTheDocument();
    expect(m.invoke).toHaveBeenCalledWith("storage-sign-upload", expect.objectContaining({ body: expect.objectContaining({ id_organizacao: ORG, id_contrato: K }) }));
    expect(m.upload).toHaveBeenCalledTimes(1);
    const conf = m.rpc.mock.calls.find((c) => c[0] === "confirmar_upload_arquivo")!;
    expect(conf[1]).toMatchObject({ p_id_organizacao: ORG, p_id_contrato: K, p_path: "o/c/x.pdf" });
    const criar = m.rpc.mock.calls.filter((c) => c[0] === "criar_documento_competencia_v115");
    expect(criar).toHaveLength(1);
    expect(criar[0]![1]).toMatchObject({
      p_id_competencia: ID,
      p_tipo: "nota_fiscal",
      p_id_requisito: REQ,
      p_id_arquivo: ARQ,
    });
    expect(typeof criar[0]![1].p_chave_idempotencia).toBe("string");
    expect(m.publicUrl).not.toHaveBeenCalled();
  });

  it("erro na criação: retry manual reutiliza a mesma chave e não reenvia bytes", async () => {
    let n = 0;
    m.rpc.mockImplementation((nome: string, a: unknown) =>
      nome === "criar_documento_competencia_v115" && n++ === 0
        ? { data: null, error: { code: "XX000", message: "RAW" } }
        : rpcPadrao(nome, a),
    );
    await selecionar();
    fireEvent.change(screen.getByLabelText("Tipo do documento"), { target: { value: "contrato" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText(/Não foi possível concluir o envio/)).toBeInTheDocument();
    expect(screen.queryByText(/RAW/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText(/Envio concluído/)).toBeInTheDocument();
    const criar = m.rpc.mock.calls.filter((c) => c[0] === "criar_documento_competencia_v115");
    expect(criar).toHaveLength(2);
    expect(criar[0]![1].p_chave_idempotencia).toBe(criar[1]![1].p_chave_idempotencia);
    expect(m.upload).toHaveBeenCalledTimes(1);
  });

  it("arquivo inválido usa validação V1-10 e não chama Edge", async () => {
    await selecionar(new File(["x"], "a.exe", { type: "application/x-msdownload" }));
    expect(await screen.findByText("Este formato de arquivo não é aceito pelo ContaOS.")).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });

  it("estático: V1-15 não reimplementa uploader/constantes", () => {
    for (const f of [
      "src/components/competencias/CompetenciaDocumentos.tsx",
      "src/lib/competencias/competenciaDocumentosDados.ts",
    ]) {
      const s = readFileSync(f, "utf8");
      expect(s).toContain("@/lib/contratos/documentosDados");
      for (const proibido of [
        "storage-sign-upload",
        "storage-sign-download",
        "Tus-Resumable",
        "uploadToSignedUrl",
        "getPublicUrl",
        "MIMES_POR_EXTENSAO =",
        "CHUNK_TUS =",
        "crypto.subtle",
      ])
        expect(s).not.toContain(proibido);
    }
  });
});

describe("V1-15 nova versão, abrir e polling", () => {
  it("motivo exigido só quando a capacidade manda; chave estável", async () => {
    leituraAtual = leitura({ motivo: true });
    montar();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Nova versão/ }));
    fireEvent.change(await screen.findByLabelText("Arquivo da nova versão"), { target: { files: [pdf()] } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar nova versão" }));
    expect(await screen.findByText(/Informe o motivo da nova versão/)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Motivo da nova versão/), { target: { value: "Correção" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar nova versão" }));
    expect(await screen.findByText(/Envio concluído/)).toBeInTheDocument();
    const v = m.rpc.mock.calls.find((c) => c[0] === "adicionar_versao_documento_competencia_v115")!;
    expect(v[1]).toMatchObject({ p_id_documento: DOC, p_id_arquivo: ARQ, p_motivo: "Correção" });
    expect(typeof v[1].p_chave_idempotencia).toBe("string");
  });

  it("motivo opcional quando capacidade=false → p_motivo null", async () => {
    montar();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Nova versão/ }));
    fireEvent.change(await screen.findByLabelText("Arquivo da nova versão"), { target: { files: [pdf()] } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar nova versão" }));
    expect(await screen.findByText(/Envio concluído/)).toBeInTheDocument();
    const v = m.rpc.mock.calls.find((c) => c[0] === "adicionar_versao_documento_competencia_v115")!;
    expect(v[1].p_motivo).toBeNull();
  });

  it("Abrir usa download assinado V1-10", async () => {
    montar();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Abrir/ }));
    await waitFor(() =>
      expect(m.invoke).toHaveBeenCalledWith("storage-sign-download", { body: { id_arquivo: ARQ } }),
    );
    expect(m.open).toHaveBeenCalledWith("https://exemplo.test/s", "_blank", "noopener,noreferrer");
  });

  it.each(["quarentena", "bloqueado"])("%s → Abrir desabilitado", async (seg) => {
    leituraAtual = leitura({ docs: [doc({ seg })] });
    montar();
    await pronto();
    expect(screen.getByRole("button", { name: /Abrir/ })).toBeDisabled();
    expect(m.invoke).not.toHaveBeenCalled();
  });

  it("polling só em processing, não agressivo, para em terminal e no unmount", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    leituraAtual = leitura({ estado: "processing" });
    const r = montar();
    await pronto();
    expect(leituras()).toHaveLength(1);
    await act(async () => void vi.advanceTimersByTime(4000));
    expect(leituras()).toHaveLength(1);
    leituraAtual = leitura({ estado: "complete" });
    await act(async () => void vi.advanceTimersByTime(1500));
    console.log("DBG", leituras().length, m.rpc.mock.calls.map(c=>c[0]));
    await waitFor(() => expect(leituras()).toHaveLength(2));
    await act(async () => void vi.advanceTimersByTime(120000));
    expect(leituras()).toHaveLength(2);
    r.unmount();
  });

  it("sem polling quando estado não é processing", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    montar();
    await pronto();
    await act(async () => void vi.advanceTimersByTime(120000));
    expect(leituras()).toHaveLength(1);
  });
});

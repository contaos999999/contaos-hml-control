import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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
  bucket: [] as string[],
  rpcChamadas: [] as Array<{ nome: string; args: Record<string, unknown> }>,
  chamadas: [] as Chamada[],
  resposta: null as null | ((c: Chamada) => unknown),
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c: Chamada = { tabela, ops: [] };
    m.chamadas.push(c);
    const b: { [k: string]: unknown } = {};
    for (const op of ["select", "eq", "is", "or", "in", "order", "range", "maybeSingle", "abortSignal", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(m.resposta?.(c)).then(res, rej);
    return b;
  };
  const rpc = (nome: string, args: Record<string, unknown>) => {
    m.rpcChamadas.push({ nome, args });
    const b: { [k: string]: unknown } = {};
    b["abortSignal"] = () => b;
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(m.rpc(nome, args)).then(res, rej);
    return b;
  };
  const storage = { from: (b: string) => { m.bucket.push(b); return { uploadToSignedUrl: (...a: unknown[]) => m.upload(...a) }; } };
  return { supabase: { auth: { getUser: m.getUser }, from, rpc, functions: { invoke: m.invoke }, storage } };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: () => (o: unknown) => ({ options: o, useParams: () => ({ id: "x" }) }),
  Link: ({ children, to, params, ...p }: { children: ReactNode; to: string; params?: { id?: string } }) => (
    <a href={params?.id ? to.replace("$id", params.id) : to} {...p}>
      {children}
    </a>
  ),
}));

import { BaseNormativaContrato, MENSAGENS_V107 } from "@/components/contratos/BaseNormativaContrato";
import { COLUNAS_FONTE, COLUNAS_VERSAO, COLUNAS_APLICABILIDADE, LIMITE_TEXTO, rotuloAplicabilidade } from "@/lib/contratos/baseNormativaDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.base-normativa";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const K2 = "22222222-2222-4222-8222-222222222222";
const F1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FG = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const V1 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const contrato = (id = K1) => ({ id, id_organizacao: A, numero: "CT-001", objeto: "x", situacao: "ativo", criticidade: "alta", contratante: null });
const fonte = (id: string, titulo: string, idContrato: string | null, situacao = "rascunho") => ({
  id, id_organizacao: A, id_contrato: idContrato, tipo: "lei", titulo, referencia: "Art. 1", descricao: null, situacao, versao_registro: 3, criado_em: "2026-01-02T12:00:00Z", atualizado_em: "2026-01-02T12:00:00Z",
});
const versao = (id = V1, extra: Record<string, unknown> = {}) => ({
  id, id_fonte: F1, versao: 2, inicio_vigencia: "2026-01-01", fim_vigencia: null, id_arquivo: null, hash: "abc123", aprovado_por: null, aprovado_em: null, criado_em: "2026-01-02T12:00:00Z", ...extra,
});
const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

type Dados = { fontes?: unknown[]; total?: number; versoes?: unknown[]; aplic?: unknown[]; texto?: unknown; arquivos?: unknown[]; contrato?: unknown };
function cenario(d: Dados = {}) {
  m.resposta = (c) => {
    if (c.tabela === "contratos") return ok(d.contrato === undefined ? contrato() : d.contrato);
    if (c.tabela === "fontes_normativas") return ok(d.fontes ?? [], d.total ?? (d.fontes ?? []).length);
    if (c.tabela === "versoes_fontes_normativas") {
      if (op(c, "select")[0]?.[0] === "conteudo_texto,metadados") return ok(d.texto ?? null);
      return ok(d.versoes ?? [], (d.versoes ?? []).length);
    }
    if (c.tabela === "aplicabilidades_fonte") return ok(d.aplic ?? []);
    if (c.tabela === "arquivos") return ok(d.arquivos ?? [], (d.arquivos ?? []).length);
    return ok(null);
  };
}

function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><BaseNormativaContrato id={id} /></QueryClientProvider>);
}

beforeEach(() => {
  m.chamadas.length = 0;
  m.rpcChamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset();
  m.invoke.mockReset();
  m.upload.mockReset();
  m.bucket.length = 0;
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-07 rota e gate", () => {
  it("rota ssr:false, título e noindex", () => {
    const o = (Route as unknown as { options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } } }).options;
    expect(o.ssr).toBe(false);
    const meta = o.head().meta;
    expect(meta).toContainEqual({ title: "Base normativa — ContaOS" });
    expect(meta).toContainEqual({ name: "robots", content: "noindex" });
  });
  it("sem sessão vai a /login; sem preferência vai a /selecionar-organizacao", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const r = montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    r.unmount();
    window.sessionStorage.clear();
    window.localStorage.clear();
    m.nav.mockReset();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("UUID inválido não consulta nada e mostra 404", async () => {
    cenario();
    montar("nao-uuid");
    await screen.findByText(MENSAGENS_V107.naoEncontrado);
    expect(m.chamadas).toHaveLength(0);
    expect(m.rpcChamadas).toHaveLength(0);
  });
  it("UUID maiúsculo é canonizado antes das consultas", async () => {
    cenario();
    montar(K1.toUpperCase());
    await screen.findByText(MENSAGENS_V107.vazio);
    expect(op(de("contratos")[0]!, "eq")[0]).toEqual(["id", K1]);
  });
  it("403 via SELECT não chama classificador nem carrega normas", async () => {
    m.resposta = () => ({ data: null, error: { code: "42501" }, status: 403 });
    montar();
    await screen.findByText(MENSAGENS_V107.negado);
    expect(m.rpcChamadas).toHaveLength(0);
    expect(de("fontes_normativas")).toHaveLength(0);
  });
  it("zero linhas chama classificador: nao_encontrado → 404, negado → 403", async () => {
    cenario({ contrato: null });
    m.rpc.mockResolvedValueOnce({ data: "nao_encontrado", error: null });
    const r = montar();
    await screen.findByText(MENSAGENS_V107.naoEncontrado);
    expect(m.rpcChamadas.map((c) => c.nome)).toEqual(["classificar_acesso_contrato_v106"]);
    r.unmount();
    m.rpc.mockResolvedValueOnce({ data: "negado", error: null });
    montar();
    await screen.findByText(MENSAGENS_V107.negado);
    expect(de("fontes_normativas")).toHaveLength(0);
  });
});

describe("V1-07 lista de fontes", () => {
  it("consulta leve exata: colunas, org, escopo ambos, ordem titulo/id, range 0–24, count", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1), fonte(FG, "Norma global", null)] });
    montar();
    await screen.findByText("Lei do contrato");
    const c = de("fontes_normativas")[0]!;
    expect(op(c, "select")[0]).toEqual([COLUNAS_FONTE, { count: "exact" }]);
    expect(COLUNAS_FONTE).not.toMatch(/conteudo_texto|metadados/);
    expect(op(c, "eq")).toContainEqual(["id_organizacao", A]);
    expect(op(c, "or")[0]).toEqual([`id_contrato.eq.${K1},id_contrato.is.null`]);
    expect(op(c, "order")).toEqual([["titulo", { ascending: true }], ["id", { ascending: true }]]);
    expect(op(c, "range")[0]).toEqual([0, 24]);
    const lista = screen.getByText("Lei do contrato").closest("ul")!;
    expect(within(lista).getByText("Do contrato")).toBeTruthy();
    expect(within(lista).getByText("Global da organização")).toBeTruthy();
    expect(de("versoes_fontes_normativas")).toHaveLength(0);
    expect(de("aplicabilidades_fonte")).toHaveLength(0);
    expect(de("arquivos")).toHaveLength(0);
  });
  it("filtros escopo/situação e paginação 2 refazem consulta com key nova", async () => {
    cenario({ fontes: Array.from({ length: 25 }, (_, i) => fonte(`f${i}`, `Fonte ${String(i).padStart(2, "0")}`, K1)), total: 30 });
    montar();
    await screen.findByText("Fonte 00");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(op(de("fontes_normativas").at(-1)!, "range")[0]).toEqual([25, 49]));
    fireEvent.change(screen.getByLabelText("Escopo"), { target: { value: "global" } });
    await waitFor(() => expect(op(de("fontes_normativas").at(-1)!, "is")[0]).toEqual(["id_contrato", null]));
    expect(op(de("fontes_normativas").at(-1)!, "range")[0]).toEqual([0, 24]);
    fireEvent.change(screen.getByLabelText("Escopo"), { target: { value: "contrato" } });
    fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "ativa" } });
    await waitFor(() => expect(op(de("fontes_normativas").at(-1)!, "eq")).toContainEqual(["situacao", "ativa"]));
    expect(op(de("fontes_normativas").at(-1)!, "eq")).toContainEqual(["id_contrato", K1]);
  });
  it("vazio distinto de erro; erro sanitizado com retry", async () => {
    m.resposta = (c) => (c.tabela === "contratos" ? ok(contrato()) : { data: null, error: { code: "XX000", message: "stack secreta", hint: "dica" }, status: 500 });
    montar();
    await screen.findByText(MENSAGENS_V107.erroLista);
    expect(screen.queryByText(/stack secreta|dica|XX000/)).toBeNull();
    cenario();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    await screen.findByText(MENSAGENS_V107.vazio);
  });
  it("situação desconhecida exibida literal", async () => {
    cenario({ fontes: [fonte(F1, "Lei X", K1, "zz_nova")] });
    montar();
    expect(await screen.findByText("zz_nova")).toBeTruthy();
  });
  it("H1 único e navegação canônica", async () => {
    cenario();
    montar();
    await screen.findByText(MENSAGENS_V107.vazio);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(within(nav).getByRole("link", { name: "Visão geral" }).getAttribute("href")).toBe(`/contratos/${K1}`);
    expect(within(nav).getByText("Base normativa").closest("[aria-current]")?.getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Orçamento" }).getAttribute("href")).toBe(
      `/contratos/${K1}/orcamento`,
    );
    expect(within(nav).getByRole("link", { name: "Regras" }).getAttribute("href")).toBe(
      `/contratos/${K1}/regras`,
    );
    expect(within(nav).getByRole("link", { name: "Documentos" }).getAttribute("href")).toBe(
      `/contratos/${K1}/documentos`,
    );
    expect(within(nav).getByRole("link", { name: "Competências" }).getAttribute("href")).toBe(
      `/contratos/${K1}/competencias`,
    );
  });
});

describe("V1-07 detalhe sob demanda", () => {
  async function abrir(d: Dados) {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], ...d });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    return screen.findByRole("dialog");
  }
  it("versões paginadas leves + uma consulta de aplicabilidade por página; sem texto", async () => {
    const dlg = await abrir({ versoes: [versao(V1), versao("v2", { versao: 1 })] });
    await within(dlg).findByText("Versão 2");
    const v = de("versoes_fontes_normativas");
    expect(v).toHaveLength(1);
    expect(op(v[0]!, "select")[0]).toEqual([COLUNAS_VERSAO, { count: "exact" }]);
    expect(COLUNAS_VERSAO).not.toMatch(/conteudo_texto|metadados/);
    expect(op(v[0]!, "order")).toEqual([["versao", { ascending: false }], ["id", { ascending: true }]]);
    expect(op(v[0]!, "range")[0]).toEqual([0, 24]);
    const a = de("aplicabilidades_fonte");
    expect(a).toHaveLength(1);
    expect(op(a[0]!, "select")[0]).toEqual([COLUNAS_APLICABILIDADE]);
    expect(op(a[0]!, "eq")).toContainEqual(["id_contrato", K1]);
    expect(op(a[0]!, "in")[0]).toEqual(["id_fonte_versao", [V1, "v2"]]);
  });
  it("vigência não é aprovação; aprovado só com aprovado_em; texto só ao expandir e truncado", async () => {
    const dlg = await abrir({ versoes: [versao(V1), versao("v2", { versao: 1, aprovado_em: "2026-03-10T15:30:00Z" })], texto: { conteudo_texto: "x".repeat(LIMITE_TEXTO + 50), metadados: {} } });
    await within(dlg).findByText("Versão 2");
    expect(within(dlg).getByText("Sem aprovação registrada")).toBeTruthy();
    expect(within(dlg).getByText(/Aprovada em 10\/03\/2026 12:30/)).toBeTruthy();
    expect(within(dlg).getAllByText(/01\/01\/2026/).length).toBe(2);
    fireEvent.click(within(dlg).getAllByRole("button", { name: /Ver texto registrado/ })[0]!);
    await within(dlg).findByText(/não constitui aprovação normativa/);
    expect(within(dlg).getByText(/Exibição limitada/)).toBeTruthy();
    const t = de("versoes_fontes_normativas").filter((c) => op(c, "select")[0]?.[0] === "conteudo_texto,metadados");
    expect(t).toHaveLength(1);
    expect(op(t[0]!, "eq")[0]).toEqual(["id", V1]);
  });
  it("rótulos de aplicabilidade oficiais e fonte global sem registro nunca aplicável", () => {
    expect(rotuloAplicabilidade(undefined, true)).toBe("Sem aplicabilidade aprovada para este contrato");
    expect(rotuloAplicabilidade(undefined, false)).toBe("Sem registro de aplicabilidade");
    expect(rotuloAplicabilidade({ aplicavel: true, aprovado_em: null }, true)).toBe("Aplicabilidade sem aprovação registrada");
    expect(rotuloAplicabilidade({ aplicavel: true, aprovado_em: "2026-01-01T00:00:00Z" }, true)).toBe("Aplicável");
    expect(rotuloAplicabilidade({ aplicavel: false, aprovado_em: "2026-01-01T00:00:00Z" }, false)).toBe("Não aplicável");
  });
  it("Esc fecha o detalhe e devolve o foco ao gatilho", async () => {
    const dlg = await abrir({ versoes: [] });
    fireEvent.keyDown(dlg, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement?.getAttribute("aria-label")).toBe("Detalhes de Lei do contrato"));
  });
  it("versões vazias distintas", async () => {
    const dlg = await abrir({ versoes: [] });
    expect(await within(dlg).findByText(MENSAGENS_V107.semVersoes)).toBeTruthy();
    expect(de("aplicabilidades_fonte")).toHaveLength(0);
  });
});

describe("V1-07 mutações por RPC V107", () => {
  it("nova fonte: salvar_fonte_normativa_v107 com rascunho, versão nula e chave; sucesso com correlation_id", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: { fonte: { id: F1 }, schema_versao: "v107-v1", correlation_id: "corr-1" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Nova fonte" }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Tipo"), { target: { value: "lei" } });
    fireEvent.change(within(dlg).getByLabelText("Título"), { target: { value: "Lei nova" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await screen.findByText(/corr-1/);
    const c = m.rpcChamadas.find((r) => r.nome === "salvar_fonte_normativa_v107")!;
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_contrato: K1, p_id_fonte: null, p_tipo: "lei", p_titulo: "Lei nova", p_situacao: "rascunho", p_versao_esperada: null });
    expect(typeof c.args["p_chave_idempotencia"]).toBe("string");
    expect(Object.keys(c.args).some((k) => /aprovado|hash/.test(k))).toBe(false);
  });
  it("nova fonte global envia p_id_contrato null", async () => {
    cenario();
    m.rpc.mockResolvedValue({ data: { correlation_id: "c" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Nova fonte" }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.change(within(dlg).getByLabelText("Escopo da fonte"), { target: { value: "global" } });
    fireEvent.change(within(dlg).getByLabelText("Tipo"), { target: { value: "lei" } });
    fireEvent.change(within(dlg).getByLabelText("Título"), { target: { value: "G" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]!.args["p_id_contrato"]).toBeNull();
  });
  it("editar envia versao_esperada lida; 409 mostra conflito + recarregar sem reenvio; retry mantém chave", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)] });
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "PT409", message: "conflict detail" } });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Editar Lei do contrato" }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await within(dlg).findByText(MENSAGENS_V107.conflito);
    expect(within(dlg).queryByText(/conflict detail|PT409/)).toBeNull();
    expect(m.rpcChamadas[0]!.args).toMatchObject({ p_id_fonte: F1, p_versao_esperada: 3 });
    expect(m.rpcChamadas).toHaveLength(1);
    expect(within(dlg).getByRole("button", { name: /Recarregar/ })).toBeTruthy();
    m.rpc.mockResolvedValueOnce({ data: null, error: { message: "Failed to fetch" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await within(dlg).findByText(MENSAGENS_V107.erroAcao);
    m.rpc.mockResolvedValueOnce({ data: { correlation_id: "c2" }, error: null });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await screen.findByText(/c2/);
    expect(m.rpcChamadas[1]!.args["p_chave_idempotencia"]).toBe(m.rpcChamadas[2]!.args["p_chave_idempotencia"]);
  });
  it("alteração material renova a chave", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)] });
    m.rpc.mockResolvedValue({ data: null, error: { code: "PT400" } });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Editar Lei do contrato" }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await within(dlg).findByText(MENSAGENS_V107.validacao);
    fireEvent.change(within(dlg).getByLabelText("Título"), { target: { value: "Outro" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(2));
    expect(m.rpcChamadas[0]!.args["p_chave_idempotencia"]).not.toBe(m.rpcChamadas[1]!.args["p_chave_idempotencia"]);
  });
  it("42501 e PT404 sanitizados", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)] });
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "42501" } }).mockResolvedValueOnce({ data: null, error: { code: "PT404" } });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Editar Lei do contrato" }));
    const dlg = await screen.findByRole("dialog");
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await within(dlg).findByText(MENSAGENS_V107.semPermissao);
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar" }));
    await within(dlg).findByText(MENSAGENS_V107.obsoleto);
  });
  it("nova versão por texto: registrar_versao_fonte_v107 sem versão/hash", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [] });
    m.rpc.mockResolvedValue({ data: { correlation_id: "cv" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    fireEvent.click(await within(det).findByRole("button", { name: "Nova versão" }));
    const dlg = await screen.findByRole("dialog", { name: "Nova versão" });
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"), { target: { value: "2026-02-01" } });
    fireEvent.change(within(dlg).getByLabelText("Texto da versão"), { target: { value: "Conteúdo" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Registrar versão" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    const c = m.rpcChamadas[0]!;
    expect(c.nome).toBe("registrar_versao_fonte_v107");
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_fonte: F1, p_inicio_vigencia: "2026-02-01", p_fim_vigencia: null, p_id_arquivo: null, p_conteudo_texto: "Conteúdo", p_metadados: {} });
    expect(Object.keys(c.args).some((k) => /hash|p_versao$/.test(k))).toBe(false);
  });
  it("arquivo pendente não pode ser anexado; aprovado pode", async () => {
    cenario({
      fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [],
      arquivos: [
        { id: "arq-p", nome_original: "pendente.pdf", mime: "application/pdf", tamanho: 10, status_seguranca: "pendente", criado_em: "2026-01-01T00:00:00Z" },
        { id: "arq-a", nome_original: "ok.pdf", mime: "application/pdf", tamanho: 10, status_seguranca: "aprovado", criado_em: "2026-01-01T00:00:00Z" },
      ],
    });
    m.rpc.mockResolvedValue({ data: { correlation_id: "x" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    fireEvent.click(await within(det).findByRole("button", { name: "Nova versão" }));
    const dlg = await screen.findByRole("dialog", { name: "Nova versão" });
    fireEvent.click(within(dlg).getByLabelText("Arquivo já aprovado"));
    const pend = await within(dlg).findByLabelText(/pendente\.pdf/);
    expect((pend as HTMLInputElement).disabled).toBe(true);
    expect(within(dlg).getByText("Em análise de segurança")).toBeTruthy();
    const arq = de("arquivos")[0]!;
    expect(op(arq, "eq")).toContainEqual(["id_contrato", K1]);
    expect(op(arq, "select")[0]?.[0]).not.toMatch(/path/);
    fireEvent.click(within(dlg).getByLabelText(/ok\.pdf/));
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"), { target: { value: "2026-02-01" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Registrar versão" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]!.args).toMatchObject({ p_id_arquivo: "arq-a", p_conteudo_texto: null });
  });
  it("aprovar versão exige fundamento e confirmação; envia hash exibido", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [versao(V1)] });
    m.rpc.mockResolvedValue({ data: { correlation_id: "ap" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    fireEvent.click(await within(det).findByRole("button", { name: "Aprovar versão 2" }));
    const dlg = await screen.findByRole("dialog", { name: "Aprovar versão 2" });
    expect(within(dlg).getByText("abc123")).toBeTruthy();
    const btn = within(dlg).getByRole("button", { name: "Aprovar" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.change(within(dlg).getByLabelText("Fundamento"), { target: { value: "Revisado" } });
    expect(btn.disabled).toBe(true);
    fireEvent.click(within(dlg).getByLabelText(/Confirmo que revisei/));
    fireEvent.click(btn);
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]!.nome).toBe("aprovar_versao_fonte_v107");
    expect(m.rpcChamadas[0]!.args).toMatchObject({ p_id_organizacao: A, p_id_versao: V1, p_hash_esperado: "abc123", p_fundamento: "Revisado" });
  });
  it("aplicabilidade envia atualizado_em lido (CAS) e fundamento", async () => {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [versao(V1)], aplic: [{ id: "ap1", id_fonte_versao: V1, aplicavel: false, fundamento: "f", aprovado_por: "u", aprovado_em: "2026-01-01T00:00:00Z", atualizado_em: "2026-01-05T10:00:00Z" }] });
    m.rpc.mockResolvedValue({ data: { correlation_id: "apl" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    await within(det).findByText("Não aplicável");
    fireEvent.click(within(det).getByRole("button", { name: "Definir aplicabilidade da versão 2" }));
    const dlg = await screen.findByRole("dialog", { name: "Aplicabilidade da versão 2" });
    fireEvent.click(within(dlg).getByLabelText("Aplicável"));
    fireEvent.change(within(dlg).getByLabelText("Fundamento"), { target: { value: "Contrato prevê" } });
    fireEvent.click(within(dlg).getByRole("button", { name: "Salvar aplicabilidade" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]!.nome).toBe("definir_aplicabilidade_fonte_v107");
    expect(m.rpcChamadas[0]!.args).toMatchObject({ p_id_organizacao: A, p_id_contrato: K1, p_id_versao: V1, p_aplicavel: true, p_fundamento: "Contrato prevê", p_atualizado_em_esperado: "2026-01-05T10:00:00Z" });
  });
});

describe("V1-07 arquivos (Edges reais)", () => {
  async function abrirVersaoArquivo() {
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [] });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    fireEvent.click(await within(det).findByRole("button", { name: "Nova versão" }));
    const dlg = await screen.findByRole("dialog", { name: "Nova versão" });
    fireEvent.click(within(dlg).getByLabelText("Arquivo já aprovado"));
    const arq = new File(["abc"], "Edital.PDF", { type: "APPLICATION/PDF" });
    fireEvent.change(within(dlg).getByLabelText("Enviar novo arquivo"), { target: { files: [arq] } });
    return { dlg, arq };
  }
  it("upload: sign-upload → uploadToSignedUrl(path, token) → confirmar_upload_arquivo com sha256; pendente; sem path/token na UI", async () => {
    m.invoke.mockResolvedValue({ data: { ok: true, bucket: "contaos-documentos", path: "org-A/segredo/x.pdf", token: "tok-secreto", signed_url: "https://x", usar_upload_resumivel: false, limiar_upload_resumivel_bytes: 1 }, error: null });
    m.upload.mockResolvedValue({ data: {}, error: null });
    m.rpc.mockResolvedValue({ data: "arq-novo", error: null });
    const { dlg, arq } = await abrirVersaoArquivo();
    fireEvent.click(within(dlg).getByRole("button", { name: "Enviar arquivo" }));
    await within(dlg).findByText(/Arquivo enviado e em análise de segurança/);
    expect(m.invoke).toHaveBeenCalledWith("storage-sign-upload", { body: { id_organizacao: A, id_contrato: K1, nome_arquivo: "Edital.PDF", mime: "application/pdf", tamanho: 3 } });
    expect(m.bucket).toEqual(["contaos-documentos"]);
    expect(m.upload.mock.calls[0]!.slice(0, 3)).toEqual(["org-A/segredo/x.pdf", "tok-secreto", arq]);
    const c = m.rpcChamadas.find((r) => r.nome === "confirmar_upload_arquivo")!;
    expect(c.args).toEqual({ p_id_organizacao: A, p_id_contrato: K1, p_path: "org-A/segredo/x.pdf", p_nome_original: "Edital.PDF", p_mime: "application/pdf", p_tamanho: 3, p_sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", p_origem: "upload_usuario" });
    expect(document.body.textContent).not.toMatch(/segredo|tok-secreto/);
    expect(m.rpcChamadas.some((r) => r.nome === "registrar_versao_fonte_v107")).toBe(false);
  });
  it("usar_upload_resumivel=true interrompe sem upload nem confirmação", async () => {
    m.invoke.mockResolvedValue({ data: { ok: true, bucket: "b", path: "p", token: "t", usar_upload_resumivel: true }, error: null });
    const { dlg } = await abrirVersaoArquivo();
    fireEvent.click(within(dlg).getByRole("button", { name: "Enviar arquivo" }));
    await within(dlg).findByText("Upload retomável não está disponível nesta tela.");
    expect(m.upload).not.toHaveBeenCalled();
    expect(m.rpcChamadas).toHaveLength(0);
  });
  it("erro do Edge é sanitizado", async () => {
    m.invoke.mockResolvedValue({ data: null, error: { message: "bucket contaos-documentos path x", context: { status: 500 } } });
    const { dlg } = await abrirVersaoArquivo();
    fireEvent.click(within(dlg).getByRole("button", { name: "Enviar arquivo" }));
    await within(dlg).findByText(MENSAGENS_V107.erroEnvio);
    expect(document.body.textContent).not.toMatch(/contaos-documentos|path x/);
  });
  it("download só por clique, por id_arquivo, abre apenas signed_url https retornada", async () => {
    const abrir = vi.spyOn(window, "open").mockReturnValue(null);
    cenario({ fontes: [fonte(F1, "Lei do contrato", K1)], versoes: [versao(V1, { id_arquivo: "arq-1" })] });
    m.invoke.mockResolvedValue({ data: { ok: true, signed_url: "https://assinado/x", nome_arquivo: "a.pdf", valido_ate: "2026-01-01T00:00:00Z", timezone: "America/Sao_Paulo" }, error: null });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Detalhes de Lei do contrato" }));
    const det = await screen.findByRole("dialog");
    await within(det).findByText("Versão 2", { exact: true });
    expect(m.invoke).not.toHaveBeenCalled();
    fireEvent.click(within(det).getByRole("button", { name: "Baixar arquivo da versão 2" }));
    await waitFor(() => expect(abrir).toHaveBeenCalledWith("https://assinado/x", "_blank", "noopener,noreferrer"));
    expect(m.invoke).toHaveBeenCalledWith("storage-sign-download", { body: { id_arquivo: "arq-1" } });
    m.invoke.mockResolvedValue({ data: { ok: true, signed_url: "javascript:alert(1)" }, error: null });
    abrir.mockClear();
    fireEvent.click(within(det).getByRole("button", { name: "Baixar arquivo da versão 2" }));
    await within(det).findByText(MENSAGENS_V107.erroDownload);
    expect(abrir).not.toHaveBeenCalled();
    abrir.mockRestore();
  });
});

describe("V1-07 scan", () => {
  it("sem DML direto, secrets, casts proibidos; RPCs só V107 + nenhum outro", () => {
    const fs = ["src/components/contratos/BaseNormativaContrato.tsx", "src/lib/contratos/baseNormativaDados.ts", "src/routes/contratos_.$id_.base-normativa.tsx"].map((p) => readFileSync(p, "utf8")).join("\n");
    for (const t of [".insert(", ".update(", ".delete(", ".upsert(", "service_role", "sb_secret", "as any", "as never", "placeholderData", "keepPreviousData", "!inner", "aprovado_por:", "p_hash:"]) expect(fs).not.toContain(t);
    const nomes = [...fs.matchAll(/"([a-z_]+_v107)"/g)].map((x) => x[1]);
    expect(new Set(nomes)).toEqual(new Set(["salvar_fonte_normativa_v107", "registrar_versao_fonte_v107", "aprovar_versao_fonte_v107", "definir_aplicabilidade_fonte_v107"]));
    expect((fs.match(/as unknown as/g) ?? []).length).toBeLessThanOrEqual(1);
  });
});

void K2;

describe("P0 CRUD: arquivos e envio normativo", () => {
  async function abrirVersao() {
    montar();
    fireEvent.click(await screen.findByRole("button", {name:"Detalhes de Lei do contrato"}));
    fireEvent.click(await within(await screen.findByRole("dialog")).findByRole("button", {name:"Nova versão"}));
    return screen.findByRole("dialog", {name:"Nova versão"});
  }
  it("alcança arquivo aprovado na segunda página e preserva seleção ao voltar", async () => {
    cenario({fontes:[fonte(F1,"Lei do contrato",K1)],versoes:[]});
    const anterior=m.resposta;
    const arquivos=Array.from({length:26},(_,i)=>({id:"arquivo-"+i,nome_original:i===25?"antigo.pdf":"recente-"+i+".pdf",mime:"application/pdf",tamanho:10,status_seguranca:i===25?"aprovado":"pendente",criado_em:"2026-01-01T00:00:00Z"}));
    m.resposta=(c)=>{
      if(c.tabela!=="arquivos") return anterior?.(c);
      const faixa=op(c,"range")[0] as number[] | undefined;
      return ok(arquivos.slice(faixa?.[0]??0,(faixa?.[1]??24)+1),26);
    };
    m.rpc.mockResolvedValue({data:{correlation_id:"pagina"},error:null});
    const dlg=await abrirVersao();
    fireEvent.click(within(dlg).getByLabelText("Arquivo já aprovado"));
    fireEvent.click(await within(dlg).findByRole("button",{name:"Próxima página de arquivos"}));
    fireEvent.click(await within(dlg).findByLabelText(/antigo.pdf/));
    fireEvent.click(within(dlg).getByRole("button",{name:"Página anterior de arquivos"}));
    await within(dlg).findByLabelText(/recente-0.pdf/);
    expect(within(dlg).getByText("Arquivo selecionado: antigo.pdf")).toBeInTheDocument();
    fireEvent.change(within(dlg).getByLabelText("Início da vigência"),{target:{value:"2026-02-01"}});
    fireEvent.click(within(dlg).getByRole("button",{name:"Registrar versão"}));
    await waitFor(()=>expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]?.args["p_id_arquivo"]).toBe("arquivo-25");
    expect(de("arquivos").some((c)=>JSON.stringify(op(c,"range")[0])==="[25,49]")).toBe(true);
  });
  it.each(["fonte","versao"])("não renova intenção nem fecha durante envio de %s", async (tipo) => {
    cenario({fontes:[fonte(F1,"Lei do contrato",K1)],versoes:[]});
    const concluir: Array<(v:unknown)=>void>=[];
    m.rpc.mockImplementation(()=>new Promise((r)=>concluir.push(r)));
    let dlg: HTMLElement;
    if(tipo==="fonte"){
      montar();
      fireEvent.click(await screen.findByRole("button",{name:"Nova fonte"}));
      dlg=await screen.findByRole("dialog");
      fireEvent.change(within(dlg).getByLabelText("Tipo"),{target:{value:"lei"}});
      fireEvent.change(within(dlg).getByLabelText("Título"),{target:{value:"Nova lei"}});
    } else {
      dlg=await abrirVersao();
      fireEvent.change(within(dlg).getByLabelText("Início da vigência"),{target:{value:"2026-02-01"}});
      fireEvent.change(within(dlg).getByLabelText("Texto da versão"),{target:{value:"Texto original"}});
    }
    fireEvent.click(within(dlg).getByRole("button",{name:tipo==="fonte"?"Salvar":"Registrar versão"}));
    await waitFor(()=>expect(m.rpcChamadas).toHaveLength(1));
    const campo=within(dlg).getByLabelText(tipo==="fonte"?"Título":"Texto da versão");
    fireEvent.change(campo,{target:{value:"Alteração durante envio"}});
    fireEvent.click(within(dlg).getByRole("button",{name:tipo==="fonte"?/Salvando|Salvar/:/Registrando|Registrar versão/}));
    await act(async()=>{await Promise.resolve();});
    expect(m.rpcChamadas).toHaveLength(1);
    expect(campo).toBeDisabled();
    expect(within(dlg).getByRole("button",{name:"Cancelar"})).toBeDisabled();
    fireEvent.keyDown(dlg,{key:"Escape",code:"Escape"});
    expect(dlg).toBeInTheDocument();
    await act(async()=>{concluir.forEach((r)=>r({data:{correlation_id:"unica"},error:null}));});
  });
});

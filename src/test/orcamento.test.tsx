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
  const storage = { from: () => ({ uploadToSignedUrl: (...a: unknown[]) => m.upload(...a) }) };
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

import { OrcamentoContrato, MENSAGENS_V108 } from "@/components/contratos/OrcamentoContrato";
import { COLUNAS_PROPOSTA, COLUNAS_VERSAO_PROPOSTA, COLUNAS_RUBRICA, criarGerenciadorChave, lerValorBr } from "@/lib/contratos/orcamentoDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.orcamento";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const P1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const V1 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const V0 = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const L1 = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ARQ = "ffffffff-ffff-4fff-8fff-ffffffffffff";

const contrato = () => ({ id: K1, id_organizacao: A, numero: "CT-001", objeto: "x", situacao: "ativo", criticidade: "alta", contratante: null });
const proposta = (extra: Record<string, unknown> = {}) => ({ id: P1, id_organizacao: A, id_contrato: K1, titulo: "Proposta 2026", situacao: "rascunho", versao_atual: null, versao_registro: 2, criado_em: "2026-01-02T12:00:00Z", atualizado_em: "2026-01-02T12:00:00Z", ...extra });
const versao = (extra: Record<string, unknown> = {}) => ({ id: V1, id_proposta: P1, numero_versao: 1, vigencia_inicio: "2026-01-01", vigencia_fim: "2026-12-31", valor_total: 1200, hash: "hash-servidor-xyz", situacao: "rascunho", aprovado_por: null, aprovado_em: null, criado_em: "2026-01-02T12:00:00Z", id_arquivo_origem: ARQ, ...extra });
const rubrica = (extra: Record<string, unknown> = {}) => ({ id: L1, id_versao_proposta: V1, codigo: "RUB-0001", grupo: "Pessoal", rubrica: "Salários", subrubrica: "Base", descricao: null, valor_mensal_previsto: 100, valor_anual_previsto: 1200, permite_remanejamento: true, limite_remanejamento_percentual: 25, observacoes: "Obs A", versao_registro: 4, criado_em: "2026-01-02T12:00:00Z", ...extra });
const arquivo = (status = "aprovado") => ({ id: ARQ, nome_original: "base.pdf", mime: "application/pdf", tamanho: 10, status_seguranca: status, criado_em: "2026-01-02T12:00:00Z" });

const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

type Dados = { propostas?: unknown[]; versoes?: unknown[]; rubricas?: unknown[]; arquivos?: unknown[]; erroPropostas?: unknown; totalRubricas?: number };
function cenario(d: Dados = {}) {
  m.resposta = (c) => {
    if (c.tabela === "contratos") return ok(contrato());
    if (c.tabela === "propostas_orcamentarias") return d.erroPropostas ?? ok(d.propostas ?? [], (d.propostas ?? []).length);
    if (c.tabela === "versoes_proposta") return ok(d.versoes ?? [], (d.versoes ?? []).length);
    if (c.tabela === "linhas_orcamentarias") return ok(d.rubricas ?? [], d.totalRubricas ?? (d.rubricas ?? []).length);
    if (c.tabela === "arquivos") return ok(d.arquivos ?? [], (d.arquivos ?? []).length);
    return ok(null);
  };
}
function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><OrcamentoContrato id={id} /></QueryClientProvider>);
}

beforeEach(() => {
  m.chamadas.length = 0;
  m.rpcChamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset().mockResolvedValue({ data: { ok: true, correlation_id: "corr-123" }, error: null });
  m.invoke.mockReset();
  m.upload.mockReset();
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-08 rota, sessão e gate", () => {
  it("rota ssr:false, título e noindex", () => {
    const o = (Route as unknown as { options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } } }).options;
    expect(o.ssr).toBe(false);
    expect(o.head().meta).toContainEqual({ title: "Orçamento — ContaOS" });
    expect(o.head().meta).toContainEqual({ name: "robots", content: "noindex" });
  });
  it("sem sessão vai a /login sem consultas", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("sem organização vai a /selecionar-organizacao", async () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });
  it("403 do contrato não carrega orçamento nem classificador", async () => {
    m.resposta = () => ({ data: null, error: { code: "42501" }, status: 403 });
    montar();
    await screen.findByText(MENSAGENS_V108.negado);
    expect(de("propostas_orcamentarias")).toHaveLength(0);
    expect(m.rpcChamadas).toHaveLength(0);
  });
  it("zero linhas chama classificador V106 e mostra 404", async () => {
    m.resposta = (c) => (c.tabela === "contratos" ? ok(null) : ok([]));
    m.rpc.mockResolvedValue({ data: "nao_encontrado", error: null });
    montar();
    await screen.findByText(MENSAGENS_V108.naoEncontrado);
    expect(m.rpcChamadas.map((r) => r.nome)).toEqual(["classificar_acesso_contrato_v106"]);
    expect(de("propostas_orcamentarias")).toHaveLength(0);
  });
});

describe("V1-08 leituras", () => {
  it("empty real com H1 único, nav e Criar proposta", async () => {
    cenario();
    montar();
    await screen.findByText(MENSAGENS_V108.vazio);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Orçamento");
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(within(nav).getByText("Orçamento").getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Visão geral" })).toBeTruthy();
    expect(within(nav).getByRole("link", { name: "Base normativa" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Criar proposta" })).toBeTruthy();
    expect(de("versoes_proposta")).toHaveLength(0);
    expect(de("linhas_orcamentarias")).toHaveLength(0);
  });
  it("erro e 403 do orçamento não mascaram como vazio", async () => {
    cenario({ erroPropostas: { data: null, error: { code: "XX000" }, status: 500 } });
    const r = montar();
    await screen.findByText(MENSAGENS_V108.erroLista);
    expect(screen.queryByText(MENSAGENS_V108.vazio)).toBeNull();
    r.unmount();
    cenario({ erroPropostas: { data: null, error: { code: "42501" }, status: 403 } });
    montar();
    await screen.findByText(MENSAGENS_V108.negadoLista);
    expect(screen.queryByText(MENSAGENS_V108.vazio)).toBeNull();
  });
  it("colunas explícitas, range 0–24 e ordem estável; arquivos em uma consulta sem path", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo("pendente")] });
    montar();
    await screen.findByText("Salários");
    const p = de("propostas_orcamentarias")[0]!;
    expect(op(p, "select")[0]).toEqual([COLUNAS_PROPOSTA, { count: "exact" }]);
    expect(op(p, "eq")).toContainEqual(["id_contrato", K1]);
    expect(op(p, "range")[0]).toEqual([0, 24]);
    const v = de("versoes_proposta")[0]!;
    expect(op(v, "select")[0]).toEqual([COLUNAS_VERSAO_PROPOSTA, { count: "exact" }]);
    expect(op(v, "order")).toEqual([["numero_versao", { ascending: false }], ["id", { ascending: true }]]);
    expect(op(v, "range")[0]).toEqual([0, 24]);
    const l = de("linhas_orcamentarias")[0]!;
    expect(op(l, "select")[0]).toEqual([COLUNAS_RUBRICA, { count: "exact" }]);
    expect(op(l, "eq")).toContainEqual(["id_versao_proposta", V1]);
    expect(op(l, "range")[0]).toEqual([0, 24]);
    expect(op(l, "order").map((o) => o[0])).toEqual(["grupo", "rubrica", "subrubrica", "id"]);
    expect(de("arquivos")).toHaveLength(1);
    expect(op(de("arquivos")[0]!, "in")[0]).toEqual(["id", [ARQ]]);
    expect(String(op(de("arquivos")[0]!, "select")[0]?.[0])).not.toContain("path");
    for (const c of m.chamadas) for (const o of ["insert", "update", "delete", "upsert"]) expect(op(c, o)).toHaveLength(0);
  });
  it("exibe campos V1-CON-003 em BRL e datas BR", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    await screen.findByText("Salários");
    for (const t of ["Pessoal", "Base", "RUB-0001", "Obs A", "25%"]) expect(screen.getAllByText(t).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$\s?100,00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R\$\s?1\.200,00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/01\/01\/2026/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
  });
  it("paginação de rubricas solicita 25–49", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], totalRubricas: 30, arquivos: [arquivo()] });
    montar();
    await screen.findByText("Salários");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página de rubricas" }));
    await waitFor(() => expect(de("linhas_orcamentarias").some((c) => JSON.stringify(op(c, "range")[0]) === "[25,49]")).toBe(true));
  });
});

describe("V1-08 RPCs V108", () => {
  it("criar proposta: args exatos e protocolo", async () => {
    cenario();
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Criar proposta" }));
    fireEvent.change(screen.getByLabelText("Título da proposta"), { target: { value: "Nova" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar proposta" }));
    await screen.findByText(/corr-123/);
    const c = m.rpcChamadas.find((r) => r.nome === "salvar_proposta_orcamentaria_v108")!;
    expect(Object.keys(c.args).sort()).toEqual(["p_chave_idempotencia", "p_id_contrato", "p_id_organizacao", "p_id_proposta", "p_titulo", "p_versao_esperada"]);
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_contrato: K1, p_id_proposta: null, p_titulo: "Nova", p_versao_esperada: null });
    expect(typeof c.args["p_chave_idempotencia"]).toBe("string");
  });
  it("salvar rubrica com código opcional nulo e valores pt-BR", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [], arquivos: [arquivo("pendente")] });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Nova rubrica" }));
    fireEvent.change(screen.getByLabelText("Grupo"), { target: { value: "Pessoal" } });
    fireEvent.change(screen.getByLabelText("Rubrica"), { target: { value: "Salários" } });
    fireEvent.change(screen.getByLabelText("Valor mensal previsto (R$)"), { target: { value: "1.234,56" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar rubrica" }));
    await screen.findByText(/corr-123/);
    const c = m.rpcChamadas.find((r) => r.nome === "salvar_linha_orcamentaria_v108")!;
    expect(Object.keys(c.args)).toHaveLength(15);
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_versao_proposta: V1, p_id_linha: null, p_codigo: null, p_grupo: "Pessoal", p_rubrica: "Salários", p_valor_mensal: 1234.56, p_valor_anual: null, p_permite_remanejamento: false, p_limite_remanejamento_percentual: null, p_versao_esperada: null });
  });
  it("PT409 mostra conflito, não reenvia e retry de transporte preserva chave", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo()] });
    m.rpc.mockReset().mockRejectedValueOnce(new Error("rede")).mockResolvedValueOnce({ data: null, error: { code: "PT409" } });
    montar();
    fireEvent.click((await screen.findAllByRole("button", { name: "Editar rubrica Salários" }))[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rubrica" }));
    await screen.findByText(MENSAGENS_V108.erroAcao);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rubrica" }));
    await screen.findByText(MENSAGENS_V108.conflito);
    const cs = m.rpcChamadas.filter((r) => r.nome === "salvar_linha_orcamentaria_v108");
    expect(cs).toHaveLength(2);
    expect(cs[0]!.args["p_chave_idempotencia"]).toBe(cs[1]!.args["p_chave_idempotencia"]);
    expect(cs[0]!.args["p_versao_esperada"]).toBe(4);
    expect(screen.getByRole("button", { name: "Recarregar" })).toBeTruthy();
    await new Promise((r) => setTimeout(r, 30));
    expect(m.rpcChamadas.filter((r) => r.nome === "salvar_linha_orcamentaria_v108")).toHaveLength(2);
  });
  it("remover exige confirmação e envia args exatos", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    fireEvent.click((await screen.findAllByRole("button", { name: "Remover rubrica Salários" }))[0]!);
    expect(m.rpcChamadas).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar remoção" }));
    await screen.findByText(/corr-123/);
    const c = m.rpcChamadas.find((r) => r.nome === "remover_linha_orcamentaria_v108")!;
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_versao_proposta: V1, p_id_linha: L1, p_versao_esperada: 4 });
    expect(Object.keys(c.args)).toHaveLength(5);
  });
  it("nova versão: oculta com rascunho existente; envia vigência e documento", async () => {
    cenario({ propostas: [proposta({ situacao: "ativa", versao_atual: 1 })], versoes: [versao({ situacao: "publicada" })], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Nova versão" }));
    fireEvent.change(screen.getByLabelText("Início da vigência"), { target: { value: "2027-01-01" } });
    fireEvent.change(screen.getByLabelText("Documento-base"), { target: { value: ARQ } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar versão" }));
    await screen.findByText(/corr-123/);
    const c = m.rpcChamadas.find((r) => r.nome === "registrar_versao_proposta_v108")!;
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_proposta: P1, p_vigencia_inicio: "2027-01-01", p_vigencia_fim: null, p_id_arquivo_origem: ARQ });
    expect(Object.keys(c.args)).toHaveLength(6);
  });
});

describe("V1-08 publicação e imutabilidade", () => {
  it("documento pendente bloqueia publicar", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo("pendente")] });
    montar();
    await screen.findByText("Salários");
    expect((screen.getByRole("button", { name: "Publicar versão" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(MENSAGENS_V108.docNaoAprovado)).toBeTruthy();
  });
  it("publicar exige fundamento + confirmação e envia hash do servidor", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Publicar versão" }));
    const dlg = screen.getByRole("dialog");
    expect(within(dlg).getByText("hash-servidor-xyz")).toBeTruthy();
    const conf = within(dlg).getByRole("button", { name: "Confirmar publicação" }) as HTMLButtonElement;
    expect(conf.disabled).toBe(true);
    fireEvent.change(within(dlg).getByLabelText("Fundamento da publicação"), { target: { value: "Aprovado pela diretoria" } });
    expect(conf.disabled).toBe(true);
    fireEvent.click(within(dlg).getByLabelText(/Confirmo/));
    expect(conf.disabled).toBe(false);
    fireEvent.click(conf);
    await screen.findByText(/corr-123/);
    const c = m.rpcChamadas.find((r) => r.nome === "publicar_versao_proposta_v108")!;
    expect(c.args).toMatchObject({ p_id_organizacao: A, p_id_versao: V1, p_hash_esperado: "hash-servidor-xyz", p_fundamento: "Aprovado pela diretoria" });
    expect(Object.keys(c.args)).toHaveLength(5);
  });
  it("versão publicada não oferece mutação de rubricas", async () => {
    cenario({ propostas: [proposta({ situacao: "ativa", versao_atual: 1 })], versoes: [versao({ situacao: "publicada" })], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    await screen.findByText("Salários");
    expect(screen.queryByRole("button", { name: "Nova rubrica" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Editar rubrica/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remover rubrica/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Publicar versão" })).toBeNull();
  });
  it("Esc fecha diálogo e devolve foco ao gatilho", async () => {
    cenario({ propostas: [proposta()], versoes: [versao()], rubricas: [rubrica()], arquivos: [arquivo()] });
    montar();
    const b = await screen.findByRole("button", { name: "Nova rubrica" });
    b.focus();
    fireEvent.click(b);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(b));
  });
});

describe("V1-08 utilitários e scan estático", () => {
  it("chave idempotente: mesma intenção preserva, payload novo renova", () => {
    const g = criarGerenciadorChave();
    const a = g({ x: 1 });
    expect(g({ x: 1 })).toBe(a);
    expect(g({ x: 2 })).not.toBe(a);
  });
  it("lerValorBr", () => {
    expect(lerValorBr("1.234,56")).toBe(1234.56);
    expect(lerValorBr("")).toBeNull();
    expect(Number.isNaN(lerValorBr("abc"))).toBe(true);
  });
  it("código sem mutação direta, sem as any/never, sem secrets; navs habilitam Orçamento", () => {
    const fontes = ["src/lib/contratos/orcamentoDados.ts", "src/components/contratos/OrcamentoContrato.tsx", "src/routes/contratos_.$id_.orcamento.tsx"].map((f) => readFileSync(f, "utf8")).join("\n");
    expect(fontes).not.toMatch(/\.(insert|update|delete|upsert)\(/);
    expect(fontes).not.toMatch(/as any|as never/);
    expect(fontes).not.toMatch(/service_role|SERVICE_ROLE|sk-[a-zA-Z0-9]/);
    expect(fontes).toContain("ContaOSMarca");
    for (const f of ["src/components/contratos/VisaoGeralContrato.tsx", "src/components/contratos/BaseNormativaContrato.tsx"]) {
      const s = readFileSync(f, "utf8");
      expect(s).toContain("/contratos/$id/orcamento");
      expect(s).not.toMatch(/SECOES_FUTURAS = \["Orçamento"/);
    }
  });
});

/** F5.1 CODE only: real selector, preference and dashboard. Distinct identities;
 * canned Supabase transport responses do not certify remote authorization. */
import { afterAll, afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { writeFileSync } from "node:fs";
import type { ReactNode } from "react";
const m = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn(), signOut: vi.fn(), nav: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: m.rpc, from: vi.fn(), auth: { getUser: m.getUser, signOut: m.signOut } },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/cadastros/GerenciarCadastro", () => ({ GerenciarCadastro: () => null }));
vi.mock("@/components/organizacao/CriarOrganizacaoForm", () => ({
  CriarOrganizacaoForm: () => null,
}));
import { OrganizationSelector } from "@/components/organizacao/OrganizationSelector";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import { salvarVinculo, type PayloadSalvar } from "@/lib/administracao/admUsuariosRpc";
import {
  listarOrganizacoesDisponiveis,
  resolverDestinoPosLogin,
} from "@/lib/auth/resolverDestinoPosLogin";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
const A = "a1111111-1111-4111-8111-111111111111",
  B = "a2222222-2222-4222-8222-222222222222";
const U = "a3333333-3333-4333-8333-333333333333",
  V = "b3333333-3333-4333-8333-333333333333";
const DASH = "obter_resumo_dashboard",
  LIST = "listar_organizacoes_disponiveis";
const SAVE = "salvar_vinculo_usuario_adm";
const bindingId = "a5000000-0000-4000-8000-000000000001";
const correlationId = "a5000000-0000-4000-8000-000000000002";
const binding: PayloadSalvar = {
  p_id_organizacao: A,
  p_id_usuario: U,
  p_email: null,
  p_perfil: "leitor",
  p_escopo_todos_contratos: true,
  p_ativo: true,
  p_ids_contratos_ativar: [],
  p_ids_contratos_revogar: [],
  p_versao_esperada: 1,
};
const bindingRequest = "f5-1-dashboard-context";
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const org = (id: string) => ({
  id,
  razao_social: id === A ? "Alfa F5" : "Beta F5",
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil: "leitor",
});
const dash = (id: string, n: number) => ({
  schema_versao: "sys05-v1",
  gerado_em: "25/11/2026",
  organizacao: {
    id,
    razao_social: id === A ? "Alfa F5" : "Beta F5",
    nome_fantasia: null,
    situacao: "ativa",
  },
  resumo: {
    contratos_visiveis: n,
    contratos_ativos: 2,
    competencias_em_fluxo: 1,
    competencias_exigem_atencao: 4,
    itens_com_prazo_vencido: 5,
    atencoes_abertas: 6,
  },
  contratos_por_situacao: [],
  competencias_por_situacao: [],
  proximos_prazos: [],
  atencoes_prioritarias: [],
});
let actor: string, qc: QueryClient;
const observations: Record<string, unknown>[] = [];
function mount(n: ReactNode) {
  return render(<QueryClientProvider client={qc}>{n}</QueryClientProvider>);
}
function identity(user: string) {
  actor = user;
  m.getUser.mockImplementation(async () => ({ data: { user: { id: actor } }, error: null }));
}
function transport(entries: Record<string, unknown>) {
  m.rpc.mockImplementation(async (name: string, args?: Record<string, unknown>) => {
    const k = name === LIST ? LIST : name + ":" + String(args?.["p_id_organizacao"]);
    if (!Object.hasOwn(entries, k)) throw Error("unexpected fixture transport: " + k);
    return entries[k];
  });
}
function observe(
  id: string,
  kind: string,
  tenant: string,
  target: string,
  frontier: string,
  operation: string,
  decision: string,
  readback: Record<string, unknown>,
) {
  observations.push({
    caseId: "IFV1-F5-C" + id,
    kind,
    mode: "CODE_FIXTURE",
    actor,
    role: "leitor",
    tenant,
    target,
    frontier,
    operation,
    decision,
    frontend: process.env["F5_FRONTEND_SHA"] ?? "",
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? "",
    job: process.env["JOB_ID"] ?? "",
    readback,
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  identity(U);
  m.signOut.mockResolvedValue({ error: null });
});
afterEach(() => {
  cleanup();
  qc.clear();
});
const key = (user: string, orgId: string) => ["sys05", "resumo", user, orgId];
async function show(id: string, n: number) {
  const view = mount(<Dashboard />);
  await screen.findByRole("region", { name: "Indicadores de resumo" });
  expect(screen.getByText(String(n))).toBeTruthy();
  expect(m.rpc).toHaveBeenCalledWith(DASH, { p_id_organizacao: id });
  return view;
}
async function choose(id: string) {
  const view = mount(<OrganizationSelector />);
  fireEvent.click(await screen.findByRole("radio", { name: id === A ? /Alfa F5/ : /Beta F5/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  await waitFor(() => expect(obterPreferenciaOrganizacao(actor)).toBe(id));
  view.unmount();
}
describe("F5 context material isolation", () => {
  it("IFV1-F5-C0005 positive: authorized reader sees own dashboard", async () => {
    identity("a5000000-0000-4000-8000-000000000003");
    transport({
      [SAVE + ":" + A]: ok({
        schema_versao: "adm01-v2",
        correlation_id: correlationId,
        id_usuario: U,
        vinculo: { id: bindingId, perfil: "leitor", ativo: true, versao_registro: 2 },
      }),
      [DASH + ":" + A]: ok(dash(A, 31)),
    });
    const saved = await salvarVinculo(binding, bindingRequest, "salvarEdicao");
    expect(m.rpc).toHaveBeenNthCalledWith(1, SAVE, {
      ...binding,
      p_chave_idempotencia: bindingRequest,
    });
    expect(saved).toMatchObject({
      id_usuario: U,
      correlation_id: correlationId,
      vinculo: { id: bindingId, perfil: "leitor", ativo: true, versao_registro: 2 },
    });
    identity(U);
    definirPreferenciaOrganizacao(U, A);
    await show(A, 31);
    expect(screen.queryByText("72")).toBeNull();
    expect(qc.getQueryData(key(U, A))).toMatchObject({ organizacao: { id: A } });
    observe("0005", "positive", A, A, "dashboard", "read", "ALLOW", {
      visible: screen.getByText("31") !== null,
      bindingCorrelationId: saved.correlation_id,
      bindingVersion: (saved.vinculo as { versao_registro: number }).versao_registro,
      selected: obterPreferenciaOrganizacao(U),
      foreignVisible: screen.queryByText("72") !== null,
    });
  });
  it("IFV1-F5-C0005 negative: forged organization receives denial without dashboard", async () => {
    identity(V);
    const denial = { data: null, error: { code: "42501" }, status: 403 };
    transport({ [SAVE + ":" + A]: denial, [DASH + ":" + A]: denial });
    await expect(salvarVinculo(binding, bindingRequest, "salvarEdicao")).rejects.toMatchObject({
      tipo: "negado",
    });
    definirPreferenciaOrganizacao(V, A);
    mount(<Dashboard />);
    await screen.findByText(MENSAGENS_SYS05.negado);
    expect(m.rpc).toHaveBeenCalledWith(DASH, { p_id_organizacao: A });
    expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
    expect(screen.queryByText("31")).toBeNull();
    expect(qc.getQueryData(key(V, A))).toBeUndefined();
    expect(m.rpc.mock.calls.map(([name]) => name)).toEqual([SAVE, DASH]);
    const rejectedWrite = await m.rpc.mock.results[0]?.value;
    const dashboardResponse = await m.rpc.mock.results[1]?.value;
    expect(rejectedWrite).toEqual(denial);
    expect(dashboardResponse).toEqual(denial);
    observe("0005", "negative", B, A, "dashboard", "read", "DENY", {
      status: dashboardResponse.status,
      code: dashboardResponse.error.code,
      bindingStatus: rejectedWrite.status,
      bindingCode: rejectedWrite.error.code,
      denialRendered: screen.queryByText(MENSAGENS_SYS05.negado) !== null,
      foreignVisible: screen.queryByText("31") !== null,
      mutationCount: Number(rejectedWrite.data !== null),
    });
  });
  it("IFV1-F5-C0036 positive: B identity sees and selects B only", async () => {
    definirPreferenciaOrganizacao(U, A);
    identity(V);
    transport({ [LIST]: ok([org(B)]) });
    expect(obterPreferenciaOrganizacao(V)).toBeNull();
    const list = await listarOrganizacoesDisponiveis();
    expect(list.map((x) => x.id)).toEqual([B]);
    expect(resolverDestinoPosLogin(list)).toEqual({ tipo: "rota", rota: "/" });
    const view = mount(<OrganizationSelector />);
    await screen.findByRole("radio", { name: /Beta F5/ });
    expect(screen.queryByRole("radio", { name: /Alfa F5/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() => expect(obterPreferenciaOrganizacao(V)).toBe(B));
    observe("0036", "positive", B, B, "selector", "list", "ALLOW", {
      visible: screen.queryByRole("radio", { name: /Beta F5/ }) !== null,
      selected: obterPreferenciaOrganizacao(V),
      foreignVisible: screen.queryByRole("radio", { name: /Alfa F5/ }) !== null,
    });
    view.unmount();
  });
  it("IFV1-F5-C0036 negative: old identity preference cannot select A", async () => {
    definirPreferenciaOrganizacao(U, A);
    identity(V);
    transport({ [LIST]: ok([org(B)]) });
    expect(obterPreferenciaOrganizacao(V)).toBeNull();
    mount(<OrganizationSelector />);
    await screen.findByRole("radio", { name: /Beta F5/ });
    expect(screen.queryByRole("radio", { name: /Alfa F5/ })).toBeNull();
    expect(m.nav).not.toHaveBeenCalled();
    observe("0036", "negative", B, A, "selector", "list", "ISOLATED", {
      foreignVisible: screen.queryByRole("radio", { name: /Alfa F5/ }) !== null,
      mutationCount: m.rpc.mock.calls.filter(([n]) => n !== LIST).length,
      isolationObserved: obterPreferenciaOrganizacao(V) === null,
      oldCacheRendered: screen.queryByRole("radio", { name: /Alfa F5/ }) !== null,
    });
  });
  it("IFV1-F5-C0037 positive: login list and dashboard use authenticated A", async () => {
    transport({ [LIST]: ok([org(A)]), [DASH + ":" + A]: ok(dash(A, 31)) });
    const list = await listarOrganizacoesDisponiveis();
    expect(list.map((x) => x.id)).toEqual([A]);
    expect(resolverDestinoPosLogin(list)).toEqual({ tipo: "rota", rota: "/" });
    await choose(A);
    await show(A, 31);
    expect(screen.queryByText("72")).toBeNull();
    observe("0037", "positive", A, A, "dashboard", "read", "ALLOW", {
      visible: screen.queryByText("31") !== null,
      selected: obterPreferenciaOrganizacao(U),
      foreignVisible: screen.queryByText("72") !== null,
    });
  });
  it("IFV1-F5-C0037 negative: second identity does not inherit first cache", async () => {
    transport({ [DASH + ":" + A]: ok(dash(A, 31)) });
    definirPreferenciaOrganizacao(U, A);
    const old = await show(A, 31);
    old.unmount();
    expect(qc.getQueryData(key(U, A))).toBeTruthy();
    identity(V);
    expect(obterPreferenciaOrganizacao(V)).toBeNull();
    transport({ [DASH + ":" + B]: ok(dash(B, 72)) });
    definirPreferenciaOrganizacao(V, B);
    m.rpc.mockClear();
    await show(B, 72);
    expect(screen.queryByText("31")).toBeNull();
    expect(m.rpc).not.toHaveBeenCalledWith(DASH, { p_id_organizacao: A });
    expect(qc.getQueryData(key(V, A))).toBeUndefined();
    observe("0037", "negative", B, A, "dashboard", "read", "ISOLATED", {
      foreignVisible: screen.queryByText("31") !== null,
      mutationCount: m.rpc.mock.calls.filter(([n]) => n !== DASH).length,
      isolationObserved: qc.getQueryData(key(V, A)) === undefined,
      oldCacheRendered: screen.queryByText("31") !== null,
    });
  });
  it("IFV1-F5-C0043 positive: real selector switch invalidates A cache", async () => {
    transport({
      [LIST]: ok([org(A), org(B)]),
      [DASH + ":" + A]: ok(dash(A, 31)),
      [DASH + ":" + B]: ok(dash(B, 72)),
    });
    definirPreferenciaOrganizacao(U, A);
    const old = await show(A, 31);
    old.unmount();
    expect(qc.getQueryData(key(U, A))).toBeTruthy();
    await choose(B);
    expect(qc.getQueryData(key(U, A))).toBeUndefined();
    await show(B, 72);
    expect(screen.queryByText("31")).toBeNull();
    observe("0043", "positive", B, B, "dashboard", "switch", "ALLOW", {
      visible: screen.queryByText("72") !== null,
      selected: obterPreferenciaOrganizacao(U),
      foreignVisible: screen.queryByText("31") !== null,
    });
  });
  it("IFV1-F5-C0043 negative: delayed A data cannot render after B switch", async () => {
    let release!: (x: unknown) => void;
    const late = new Promise((r) => {
      release = r;
    });
    transport({
      [LIST]: ok([org(A), org(B)]),
      [DASH + ":" + A]: late,
      [DASH + ":" + B]: ok(dash(B, 72)),
    });
    definirPreferenciaOrganizacao(U, A);
    const old = mount(<Dashboard />);
    await waitFor(() => expect(m.rpc).toHaveBeenCalledWith(DASH, { p_id_organizacao: A }));
    old.unmount();
    await choose(B);
    await show(B, 72);
    await act(async () => {
      release(ok(dash(A, 31)));
      await late;
    });
    expect(screen.getByText("72")).toBeTruthy();
    expect(screen.queryByText("31")).toBeNull();
    expect(qc.getQueryData(key(U, A))).toBeUndefined();
    observe("0043", "negative", B, A, "dashboard", "switch", "ISOLATED", {
      foreignVisible: screen.queryByText("31") !== null,
      mutationCount: m.rpc.mock.calls.filter(([n]) => n !== DASH && n !== LIST).length,
      isolationObserved: qc.getQueryData(key(U, A)) === undefined,
      oldCacheRendered: screen.queryByText("31") !== null,
    });
  });
});
afterAll(() => {
  const p = process.env["F5_OBSERVATIONS"];
  if (p) {
    expect(observations).toHaveLength(8);
    writeFileSync(p, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

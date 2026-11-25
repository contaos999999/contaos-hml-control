import { beforeEach, afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn(), nav: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: m.rpc, from: vi.fn(), auth: { getUser: m.getUser } },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
import { salvarVinculo, listarUsuarios } from "@/lib/administracao/admUsuariosRpc";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
const CASE = "IFV1-F3-C0005",
  CONSUMER = "obter_resumo_dashboard",
  SOURCE = "src/test/f3-code-adm01-dashboard.test.tsx";
const ORG = "a1111111-1111-4111-8111-111111111111",
  USER = "a3333333-3333-4333-8333-333333333333",
  LINK = "a4444444-4444-4444-8444-444444444444",
  KEY = "a5555555-5555-4555-8555-555555555555",
  OTHER = "a2222222-2222-4222-8222-222222222222";
let actor = "master",
  binding: Record<string, unknown> | null = null,
  writes = 0;
const observations: Record<string, unknown>[] = [];
const payload = {
  p_id_organizacao: ORG,
  p_id_usuario: USER,
  p_email: null,
  p_perfil: "leitor",
  p_escopo_todos_contratos: true,
  p_ativo: true,
  p_ids_contratos_ativar: [],
  p_ids_contratos_revogar: [],
  p_versao_esperada: null,
};
const ok = (data: unknown) => ({ data, error: null, status: 200 }),
  deny = () => ({ data: null, error: { code: "42501" }, status: 403 });
function rpc(name: string, args: Record<string, unknown>) {
  if (name === "salvar_vinculo_usuario_adm") {
    if (actor !== "master") return deny();
    expect(args.p_id_organizacao).toBe(ORG);
    expect(args.p_id_usuario).toBe(USER);
    binding = {
      id: LINK,
      perfil: "leitor",
      ativo: args.p_ativo === true,
      escopo_todos_contratos: args.p_escopo_todos_contratos === true,
      versao_registro: 1,
    };
    writes++;
    return ok({
      schema_versao: "adm01-v2",
      correlation_id: KEY,
      id_usuario: USER,
      vinculo: binding,
    });
  }
  if (name === "listar_usuarios_vinculos_adm") {
    if (actor !== "master" || args.p_id_organizacao !== ORG) return deny();
    return ok({
      schema_versao: "adm01-v2",
      pagina: 1,
      tamanho_pagina: 25,
      total: binding ? 1 : 0,
      total_paginas: 1,
      itens: binding ? [{ id_usuario: USER, vinculo: binding }] : [],
      perfis_disponiveis: [],
    });
  }
  if (name === CONSUMER) {
    if (
      args.p_id_organizacao !== ORG ||
      !(
        actor === "master" ||
        (actor === USER && binding?.ativo === true && binding?.escopo_todos_contratos === true)
      )
    )
      return deny();
    return ok({
      schema_versao: "sys05-v1",
      gerado_em: "24/11/2026 12:00",
      organizacao: {
        id: ORG,
        razao_social: "Organização F3",
        nome_fantasia: null,
        situacao: "ativa",
      },
      resumo: {
        contratos_visiveis: 3,
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
  }
  throw new Error(name);
}
async function produce() {
  actor = "master";
  const before = await listarUsuarios(ORG, { pagina: 1, busca: null, ativo: true });
  expect(before.itens).toEqual([]);
  const receipt = await salvarVinculo(payload, KEY, "salvarNovo");
  expect(receipt.vinculo).toMatchObject({ id: LINK, ativo: true, perfil: "leitor" });
  const v = await listarUsuarios(ORG, { pagina: 1, busca: null, ativo: true });
  expect(v.itens[0]).toMatchObject({
    id_usuario: USER,
    vinculo: { id: LINK, ativo: true, perfil: "leitor" },
  });
  expect(writes).toBe(1);
  return v.itens[0].vinculo.id;
}
function mount(user: string, org: string) {
  actor = user;
  definirPreferenciaOrganizacao(user, org);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Dashboard />
    </QueryClientProvider>,
  );
}
describe("ADM01 binding to SYS05 actual dashboard", () => {
  beforeEach(() => {
    actor = "master";
    binding = null;
    writes = 0;
    sessionStorage.clear();
    m.rpc.mockReset();
    m.getUser.mockReset();
    m.getUser.mockImplementation(async () => ({ data: { user: { id: actor } }, error: null }));
    m.rpc.mockImplementation((n: string, a: Record<string, unknown>) =>
      Promise.resolve().then(() => rpc(n, a)),
    );
  });
  afterEach(cleanup);
  it(CASE + " positive: bound reader and master render organization KPIs", async () => {
    const id = await produce();
    for (const user of ["master", USER]) {
      const view = mount(user, ORG);
      expect(await screen.findByRole("region", { name: "Indicadores de resumo" })).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();
      expect(m.rpc).toHaveBeenLastCalledWith(CONSUMER, { p_id_organizacao: ORG });
      view.unmount();
    }
    observations.push({
      caseId: CASE,
      consumer: CONSUMER,
      producerOrder: 4,
      kind: "positive",
      testId: SOURCE + ":positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: id,
      network: { method: "POST", status: 200, rpc: CONSUMER, fixture: true },
      readback: {
        matched: true,
        bindingId: id,
        roles: 2,
        contractsVisible: 3,
        organizationId: ORG,
      },
    });
  });
  it(CASE + " negative: unbound outsider and wrong org have no private data", async () => {
    const id = await produce();
    actor = USER;
    await expect(salvarVinculo(payload, KEY, "salvarNovo")).rejects.toBeTruthy();
    for (const [user, org] of [
      ["outsider", ORG],
      [USER, OTHER],
    ]) {
      const view = mount(user, org);
      expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();
      expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
      expect(screen.queryByText("3")).toBeNull();
      expect(m.rpc).toHaveBeenLastCalledWith(CONSUMER, { p_id_organizacao: org });
      view.unmount();
    }
    expect(writes).toBe(1);
    observations.push({
      caseId: CASE,
      consumer: CONSUMER,
      producerOrder: 4,
      kind: "negative",
      testId: SOURCE + ":negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: id,
      network: { method: "POST", status: 403, rpc: CONSUMER, fixture: true },
      readback: {
        outcome: "DENY",
        bindingId: id,
        noPrivateData: true,
        wrongOrgDenied: true,
        mutationDenied: true,
      },
    });
  });
  afterAll(() => {
    const p = process.env.F3_CODE_ADM_DASH_OBSERVATIONS;
    if (p) {
      expect(observations).toHaveLength(2);
      writeFileSync(p, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

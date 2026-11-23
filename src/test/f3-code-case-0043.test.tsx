/**
 * F3 CODE C0043 — SYS04 → SYS05, consumidor real Dashboard.
 * Fixture de RPC isolada. Não testa RLS remota nem substitui HML pós-V5.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { writeFileSync } from "node:fs";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  rpc: vi.fn(),
  nav: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser, signOut: m.signOut },
    rpc: m.rpc,
    from: vi.fn(),
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const CASE_ID = "IFV1-F3-C0043";
const CONSUMER = "obter_resumo_dashboard";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const USER = "f3-code-preference-user";
const observations: Record<string, unknown>[] = [];

function mountDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Dashboard />
    </QueryClientProvider>,
  );
}

function dashboardResponse() {
  return {
    schema_versao: "sys05-v1",
    gerado_em: "23/11/2026 05:00",
    organizacao: {
      id: ORG,
      razao_social: "Organização F3",
      nome_fantasia: "F3",
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
  };
}

describe("F3 CODE C0043: dashboard recebe contexto organizacional do SYS04", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    m.getUser.mockResolvedValue({ data: { user: { id: USER } }, error: null });
    m.signOut.mockResolvedValue({ error: null });
    definirPreferenciaOrganizacao(USER, ORG);
  });

  it("positive: Dashboard invoca a RPC real com organização isolada e renderiza KPIs", async () => {
    expect(obterPreferenciaOrganizacao(USER)).toBe(ORG);
    expect(obterPreferenciaOrganizacao("f3-foreign-user")).toBeNull();
    m.rpc.mockResolvedValue({ data: dashboardResponse(), error: null, status: 200 });
    mountDashboard();
    expect(await screen.findByRole("region", { name: "Indicadores de resumo" })).toBeTruthy();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith(CONSUMER, { p_id_organizacao: ORG });
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Atualizado em 23/11/2026 05:00")).toBeTruthy();
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "positive",
      testId: "src/test/f3-code-case-0043.test.tsx:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 200, rpc: CONSUMER, fixture: true },
      readback: {
        matched: true,
        organizationId: ORG,
        contractsVisible: 3,
        preferenceMatched: true,
      },
    });
  });

  it("negative: erro 403 no consumidor recusa exibição de dados de outra organização", async () => {
    expect(obterPreferenciaOrganizacao("f3-foreign-user")).toBeNull();
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "Proibido", details: null, hint: null },
      status: 403,
    });
    mountDashboard();
    expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();
    expect(m.rpc).toHaveBeenCalledWith(CONSUMER, { p_id_organizacao: ORG });
    expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
    expect(screen.queryByText("3")).toBeNull();
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 1,
      kind: "negative",
      testId: "src/test/f3-code-case-0043.test.tsx:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 403, rpc: CONSUMER, fixture: true },
      readback: {
        outcome: "DENY",
        protected: true,
        noPrivateData: true,
        preferenceNotAuthorization: true,
      },
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0043_OBSERVATIONS;
    if (target) {
      expect(observations).toHaveLength(2);
      expect(observations.map((event) => event.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

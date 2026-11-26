import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ContaOSOrganizationHeader } from "@/components/layout/ContaOSOrganizationHeader";
import { OrganizationSelector } from "@/components/organizacao/OrganizationSelector";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  A,
  B,
  createTransport,
  evidenceStep as step,
  forbidden,
  journeyRecorder,
  response,
  type Scope,
} from "./f6-code-journey-fixture";

const wire = vi.hoisted(() => ({
  fetch: vi.fn(),
  actor: "",
  nav: vi.fn(),
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient("https://f6-journeys.invalid", "fixture-key", {
    accessToken: async () => "fixture-" + wire.actor,
    global: { fetch: (request, init) => wire.fetch(request, init) },
  });
  return {
    supabase: { rpc: client.rpc.bind(client), from: client.from.bind(client), auth: wire.auth },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => wire.nav,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

const proofs = journeyRecorder("context");
const orgLabel = (s: Scope) =>
  s.org === A.org ? "Organização Alfa Jornada" : "Organização Beta Jornada";
const organization = (s: Scope) => ({
  id: s.org,
  razao_social: orgLabel(s),
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil: "leitor",
});
const value = (scope: Scope) => (scope.org === A.org ? 13 : 27);
function summary(s: Scope) {
  return {
    schema_versao: "sys05-v1",
    gerado_em: "01/11/2026",
    organizacao: organization(s),
    resumo: {
      contratos_visiveis: value(s),
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
let qc: QueryClient;
let routePause: Promise<void> | undefined;
let recovered: Scope;
let transport: ReturnType<typeof createTransport>;
const key = (actor: Scope, target: Scope) => ["sys05", "resumo", actor.actor, target.org];
const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 1_000 } } });
beforeEach(() => {
  sessionStorage.clear();
  vi.resetAllMocks();
  wire.actor = "";
  recovered = A;
  routePause = undefined;
  qc = client();
  wire.auth.getSession.mockImplementation(async () => ({
    data: { session: wire.actor ? {} : null },
  }));
  wire.auth.getUser.mockImplementation(async () => ({
    data: { user: wire.actor ? { id: wire.actor } : null },
    error: wire.actor ? null : { code: "session_not_found", status: 401 },
  }));
  wire.auth.signInWithPassword.mockImplementation(async () => {
    wire.actor = recovered.actor;
    return { error: null };
  });
  wire.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  wire.auth.signOut.mockImplementation(async () => {
    wire.actor = "";
    return { error: null };
  });
  transport = createTransport(async (actor, route, fields) => {
    const accessible = actor.actor === A.actor ? [A, B] : [B];
    if (route === "rpc/listar_organizacoes_disponiveis") {
      expect(fields).toEqual({});
      return response(accessible.map(organization));
    }
    if (route !== "rpc/obter_resumo_dashboard") throw Error("Unexpected request " + route);
    const target = accessible.find((s) => s.org === fields["p_id_organizacao"]);
    if (!target) return response(forbidden, 403);
    if (target.org === A.org && routePause) await routePause;
    return response(summary(target));
  });
  wire.fetch.mockImplementation(transport.fetch);
});
afterEach(() => {
  cleanup();
  qc.clear();
  sessionStorage.clear();
});
afterAll(proofs.write);

function mount(element: ReactNode) {
  return render(<QueryClientProvider client={qc}>{element}</QueryClientProvider>);
}
async function login(actor: Scope, destination: string) {
  expect(wire.actor).toBe("");
  recovered = actor;
  const navigate = vi.fn();
  const form = mount(<LoginForm onNavegar={navigate} />);
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "fixture@example.invalid" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "synthetic-credential" } });
  fireEvent.click(screen.getByRole("button", { name: /^Entrar$/ }));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith(destination));
  expect(wire.actor).toBe(actor.actor);
  expect(transport.trace.at(-1)).toMatchObject({
    route: "rpc/listar_organizacoes_disponiveis",
    actor: actor.actor,
    status: 200,
  });
  form.unmount();
}
async function selector(actor: Scope, target: Scope) {
  const view = mount(<OrganizationSelector />);
  const radio = await screen.findByRole("radio", { name: new RegExp(orgLabel(target)) });
  fireEvent.click(radio);
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  await waitFor(() => expect(obterPreferenciaOrganizacao(actor.actor)).toBe(target.org));
  view.unmount();
}
async function dashboard(actor: Scope, target: Scope) {
  const view = mount(<Dashboard />);
  const region = await screen.findByRole("region", { name: "Indicadores de resumo" });
  expect(within(region).getByText(String(value(target)))).toBeVisible();
  expect(qc.getQueryData(key(actor, target))).toMatchObject({ organizacao: { id: target.org } });
  const visible = { organization: target.org, contracts: value(target) };
  view.unmount();
  return visible;
}
async function reload(actor: Scope, target: Scope) {
  qc.clear();
  qc = client();
  expect(obterPreferenciaOrganizacao(actor.actor)).toBe(target.org);
  return dashboard(actor, target);
}
async function signOut() {
  const count = wire.auth.signOut.mock.calls.length;
  const view = mount(<ContaOSOrganizationHeader />);
  const button = await screen.findByRole("button", { name: "Sair" });
  fireEvent.click(button);
  await waitFor(() => {
    expect(wire.nav).toHaveBeenCalledWith({ to: "/login", replace: true });
    expect(wire.auth.signOut).toHaveBeenCalledTimes(count + 1);
    expect(wire.actor).toBe("");
  });
  expect(qc.getQueryCache().getAll()).toEqual([]);
  view.unmount();
}

describe("F6 context journeys", () => {
  for (const c of proofs.cases) {
    it(
      c.caseId + " positive: authenticates, selects or switches and reloads the authorized view",
      async () => {
        const initial = {
          session: wire.actor || null,
          preference: obterPreferenciaOrganizacao(A.actor),
        };
        expect(initial).toEqual({ session: null, preference: null });
        await login(A, "/selecionar-organizacao");
        let previous: object | null = null;
        if (c.sourceConnectionId === "C0043") {
          await selector(A, A);
          previous = await dashboard(A, A);
        }
        await selector(A, B);
        expect(qc.getQueryData(key(A, A))).toBeUndefined();
        const selected = obterPreferenciaOrganizacao(A.actor);
        const shown = await dashboard(A, B);
        const reloaded = await reload(A, B);
        expect(reloaded).toEqual(shown);
        await signOut();
        expect(qc.getQueryData(key(A, B))).toBeUndefined();
        const result = { ...shown, previous, selected, signedOut: wire.actor === "" };
        proofs.record(c.sourceConnectionId, "positive", A, {
          preconditions: initial,
          steps: [
            step("precondition", initial),
            step("producer", { actor: A.actor, selected }),
            step("consumer", shown),
            step("recovery", reloaded),
          ],
          observed: result,
          postconditions: {
            loggedOut: wire.actor === "",
            cacheRemoved: qc.getQueryData(key(A, B)) === undefined,
          },
          recoveryProof: reloaded,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(
      c.caseId + " negative: blocks stale context and resumes with the authorized identity",
      async () => {
        await login(A, "/selecionar-organizacao");
        await selector(A, A);
        const initial = { actor: A.actor, selected: obterPreferenciaOrganizacao(A.actor) };
        let observed;
        let actor = B;
        if (c.sourceConnectionId === "C0043") {
          actor = A;
          let release!: () => void;
          routePause = new Promise<void>((resolve) => {
            release = resolve;
          });
          const prior = mount(<Dashboard />);
          await waitFor(() =>
            expect(
              wire.fetch.mock.calls.some(([input]) =>
                String(input).endsWith("/obter_resumo_dashboard"),
              ),
            ).toBe(true),
          );
          prior.unmount();
          await selector(A, B);
          observed = await dashboard(A, B);
          await act(async () => {
            release();
            await routePause;
          });
          expect(qc.getQueryData(key(A, A))).toBeUndefined();
        } else {
          await dashboard(A, A);
          await signOut();
          wire.nav.mockClear();
          const inaccessible = mount(<Dashboard />);
          await waitFor(() =>
            expect(wire.nav).toHaveBeenCalledWith({ to: "/login", replace: true }),
          );
          expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
          inaccessible.unmount();
          expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
          await login(B, "/");
          await selector(B, B);
          observed = await dashboard(B, B);
          expect(qc.getQueryData(key(B, A))).toBeUndefined();
        }
        const reloaded = await reload(actor, B);
        expect(reloaded).toEqual(observed);
        const selected = obterPreferenciaOrganizacao(actor.actor);
        await signOut();
        proofs.record(c.sourceConnectionId, "negative", actor, {
          preconditions: initial,
          steps: [
            step("precondition", initial),
            step("producer", { actor: actor.actor, selected }),
            step("consumer", observed),
            step("recovery", reloaded),
          ],
          observed: { ...observed, isolation: true },
          postconditions: {
            loggedOut: wire.actor === "",
            previousContextAbsent: qc.getQueryData(key(actor, A)) === undefined,
          },
          recoveryProof: reloaded,
          negativeProof: { decision: "ISOLATED", effects: 0, disclosed: false },
          cleanupStatus: "CLEAN",
        });
      },
    );
  }
});

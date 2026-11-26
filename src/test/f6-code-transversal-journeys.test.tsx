import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CompetenciaAnalise, MENSAGENS_V116 } from "@/components/competencias/CompetenciaAnalise";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  A,
  B,
  createTransport,
  eq,
  evidenceStep as step,
  forbidden,
  journeyRecorder,
  moment,
  pagination,
  response,
  type Fields,
  type Scope,
} from "./f6-code-journey-fixture";

const wire = vi.hoisted(() => ({ actor: "", fetch: vi.fn() }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient("https://f6-journeys.invalid", "fixture-key", {
    accessToken: async () => "fixture-" + wire.actor,
    global: { fetch: (input, init) => wire.fetch(input, init) },
  });
  return {
    supabase: {
      rpc: client.rpc.bind(client),
      from: client.from.bind(client),
      auth: {
        getUser: async () => ({
          data: { user: wire.actor ? { id: wire.actor } : null },
          error: wire.actor ? null : { code: "session_not_found", status: 401 },
        }),
      },
    },
  };
});

const proofs = journeyRecorder("transversal");
const readRoute = "rpc/obter_analise_competencia_v116";
const commandRoute = "rpc/solicitar_analise_competencia";
const auditRoute = "eventos_auditoria";
const timeout = { code: "FIXTURE_TIMEOUT", message: "Tempo de resposta expirado." };
const canary = "versao-de-sessao-anterior";
const month = (s: Scope) => (s === A ? "11/2026" : "12/2026");
const urlFor = (s: Scope) => "/competencias/" + s.competence + "/analise";

function event(s: Scope) {
  return {
    id: s.link,
    evento: "AnaliseSolicitada",
    entidade: "execucoes_analise",
    origem: "rpc",
    criado_em: moment,
    id_usuario: s.actor,
    id_entidade: s.version,
    correlation_id: s.correlation,
  };
}

function payload(s: Scope, queued: boolean) {
  const execution = queued ? { id: s.version, tipo: "completa", status: "queued" } : null;
  return {
    schema_versao: "v116-v1",
    competencia: {
      id: s.competence,
      competencia_referencia: s === A ? "2026-11-01" : "2026-12-01",
      situacao: queued ? "em_analise" : "rascunho",
    },
    estado_analise: queued ? "queued" : "not_analyzed",
    execucao_atual: execution,
    stale: false,
    percentual: 0,
    blocking_summary: {},
    allowed_actions: {
      executar_analise: s === A && !queued,
      reanalisar: false,
      abrir_requisito: false,
    },
    mecanismos: queued ? { deterministico: 0, semantico: 0, humano: 0, nao_identificado: 0 } : {},
    resultados: [],
    resultados_paginacao: pagination(25),
    execucoes: execution ? [execution] : [],
    execucoes_paginacao: pagination(10, Number(queued)),
    apontamentos: [],
    apontamentos_paginacao: pagination(25),
  };
}

let transport: ReturnType<typeof createTransport>;
let fault: "timeout" | "invalid" | null;
let commandTimeout: boolean;
let queue: Set<string>;
let audit: ReturnType<typeof event>[];
let commands: number;
let routeGate: {
  signal: AbortSignal | null;
  release: () => void;
  completion: Promise<void>;
} | null;
const histories: Array<ReturnType<typeof createMemoryHistory>> = [];

beforeEach(() => {
  sessionStorage.clear();
  wire.actor = "";
  fault = null;
  commandTimeout = false;
  queue = new Set();
  audit = [];
  commands = 0;
  routeGate = null;
  transport = createTransport((actor, route, fields, method) => {
    if (route === auditRoute) {
      expect(method).toBe("GET");
      if (fields["id_organizacao"] !== eq(actor.org) || actor === B)
        return response(forbidden, 403);
      return response(audit.filter((e) => eq(e.correlation_id) === fields["correlation_id"]));
    }
    expect(method).toBe("POST");
    if (fields["p_id_competencia"] !== actor.competence) return response(forbidden, 403);
    if (route === readRoute) {
      if (fault === "timeout") return response(timeout, 504);
      const result = payload(actor, queue.has(actor.competence));
      if (fault === "invalid") return response({ ...result, stale: canary, allowed_actions: {} });
      return response(result);
    }
    if (route !== commandRoute) throw Error("Unexpected synthetic command " + route);
    if (actor === B) return response(forbidden, 403);
    expect(fields).toEqual({ p_id_competencia: actor.competence, p_tipo: "completa" });
    commands += 1;
    if (!queue.has(actor.competence)) {
      queue.add(actor.competence);
      audit.push(event(actor));
    }
    return commandTimeout ? response(timeout, 504) : response(actor.version);
  });
  wire.fetch
    .mockReset()
    .mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const result = await transport.fetch(input, init);
      if (
        routeGate &&
        wire.actor === A.actor &&
        new URL(String(input)).pathname.endsWith(readRoute)
      ) {
        const gate = routeGate;
        gate.signal = init?.signal ?? null;
        await gate.completion;
      }
      return result;
    });
});

afterEach(() => {
  routeGate?.release();
  cleanup();
  for (const history of histories.splice(0)) history.destroy();
  sessionStorage.clear();
});
afterAll(proofs.write);

function signIn(s: Scope) {
  wire.actor = s.actor;
  definirPreferenciaOrganizacao(s.actor, s.org);
}

function open(s: Scope) {
  const root = createRootRoute({ component: Outlet });
  const analysis = createRoute({
    getParentRoute: () => root,
    path: "/competencias/$id/analise",
  });
  analysis.update({
    component: function AnalysisPage() {
      const { id } = analysis.useParams();
      return <CompetenciaAnalise id={id} />;
    },
  });
  const overview = createRoute({
    getParentRoute: () => root,
    path: "/competencias/$id",
    component: () => <h1>Competência selecionada</h1>,
  });
  const login = createRoute({
    getParentRoute: () => root,
    path: "/login",
    component: () => <h1>Entrada da sessão</h1>,
  });
  const history = createMemoryHistory({ initialEntries: [urlFor(s)] });
  histories.push(history);
  const router = createRouter({
    history,
    routeTree: root.addChildren([analysis, overview, login]),
  });
  const view = render(<RouterProvider router={router} />);
  const navigate = async (target: Scope) => {
    await act(async () => {
      await router.navigate({ to: "/competencias/$id/analise", params: { id: target.competence } });
    });
  };
  return { view, router, navigate };
}

async function ready(s: Scope) {
  await screen.findByRole("heading", { level: 2, name: "Situação da análise" });
  expect(screen.getByText("Competência " + month(s))).toBeVisible();
  const status = screen.getByRole("status", { name: "Estado da análise" });
  return { competence: s.competence, month: month(s), state: status.textContent };
}

function closed() {
  expect(screen.queryByRole("heading", { name: "Situação da análise" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Executar análise" })).toBeNull();
  expect(screen.queryByText(canary)).toBeNull();
  expect(screen.queryByText("Competência " + month(A))).toBeNull();
}

function finish(view: ReturnType<typeof render>) {
  view.unmount();
  sessionStorage.clear();
  expect(screen.queryByRole("heading", { name: "Análise da competência" })).toBeNull();
  expect(obterPreferenciaOrganizacao(A.actor)).toBeNull();
  expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
}

function record(
  connection: string,
  kind: "positive" | "negative",
  actor: Scope,
  [preconditions, producer, observed, recoveryProof]: [Fields, Fields, Fields, Fields],
) {
  const refusal = [...transport.trace]
    .reverse()
    .find((t) => t.actor === actor.actor && t.status === 403);
  if (kind === "negative" && refusal) {
    expect(refusal.code).toBe("42501");
    expect(commands).toBe(0);
    expect(audit).toEqual([]);
  }
  proofs.record(connection, kind, actor, {
    preconditions,
    steps: [
      step("precondition", preconditions),
      step("producer", producer),
      step("consumer", observed),
      step("recovery", recoveryProof),
    ],
    observed,
    postconditions: { commands, queue: [...queue], auditCount: audit.length },
    recoveryProof,
    cleanupStatus: "CLEAN",
    ...(kind === "negative" && {
      negativeProof: refusal
        ? {
            decision: "DENIED",
            status: refusal.status,
            code: "42501",
            effects: 0,
            disclosed: false,
          }
        : { decision: "ISOLATED", effects: 0, disclosed: false },
    }),
  });
}

async function rejectForeignThenOwn() {
  signIn(B);
  const flow = open(A);
  expect(await screen.findByText(MENSAGENS_V116.negado)).toBeVisible();
  closed();
  expect(transport.trace.at(-1)).toMatchObject({ route: readRoute, status: 403, code: "42501" });
  await flow.navigate(B);
  const recovered = await ready(B);
  expect(screen.queryByText("Competência " + month(A))).toBeNull();
  expect(screen.queryByRole("button", { name: "Executar análise" })).toBeNull();
  return { ...flow, recovered };
}

describe("F6 transversal journeys", () => {
  it("IFV1-F6-T0001 positive: recovers the same protected analysis after a gateway timeout", async () => {
    signIn(A);
    fault = "timeout";
    const flow = open(A);
    expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_V116.erro);
    expect(transport.trace.at(-1)).toMatchObject({ route: readRoute, status: 504 });
    closed();
    const timeoutRead = transport.trace.at(-1);
    fault = null;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    const recovered = await ready(A);
    expect(transport.trace.at(-1)).toMatchObject({ route: readRoute, status: 200 });
    expect(commands).toBe(0);
    finish(flow.view);
    record("T0001", "positive", A, [
      { context: A.org },
      { timeoutRead },
      { blocked: MENSAGENS_V116.erro },
      recovered,
    ]);
  });

  it("IFV1-F6-T0001 negative: preserves denial after recovery from a timeout in the same browser", async () => {
    signIn(B);
    fault = "timeout";
    const flow = open(B);
    expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_V116.erro);
    const timeoutRead = transport.trace.at(-1);
    expect(timeoutRead?.status).toBe(504);
    fault = null;
    await flow.navigate(A);
    expect(await screen.findByText(MENSAGENS_V116.negado)).toBeVisible();
    closed();
    const deniedRead = transport.trace.at(-1);
    expect(deniedRead?.status).toBe(403);
    await flow.navigate(B);
    const recovered = await ready(B);
    finish(flow.view);
    record("T0001", "negative", B, [
      { context: B.org },
      { timeoutRead },
      { deniedRead },
      recovered,
    ]);
  });

  it("IFV1-F6-T0002 positive: retries an invalid authoritative payload without exposing commands", async () => {
    signIn(A);
    fault = "invalid";
    const flow = open(A);
    expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_V116.erro);
    closed();
    const malformed = transport.trace.at(-1);
    expect(malformed?.status).toBe(200);
    fault = null;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    const recovered = await ready(A);
    expect(screen.getByRole("button", { name: "Executar análise" })).toBeEnabled();
    expect(commands).toBe(0);
    finish(flow.view);
    record("T0002", "positive", A, [
      { context: A.org },
      { malformed, invalidFields: ["stale", "allowed_actions"] },
      { blocked: MENSAGENS_V116.erro },
      recovered,
    ]);
  });

  it("IFV1-F6-T0002 negative: withholds a malformed view from a reader before valid reread", async () => {
    signIn(B);
    fault = "invalid";
    const flow = open(B);
    expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_V116.erro);
    closed();
    const malformed = transport.trace.at(-1);
    expect(malformed?.status).toBe(200);
    fault = null;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    const recovered = await ready(B);
    expect(screen.queryByRole("button", { name: "Executar análise" })).toBeNull();
    expect(commands).toBe(0);
    finish(flow.view);
    record("T0002", "negative", B, [
      { context: B.org },
      { malformed },
      { isolation: true, blocked: MENSAGENS_V116.erro },
      recovered,
    ]);
  });

  it("IFV1-F6-T0003 positive: reconciles one queued execution and one audit event after a double click and lost response", async () => {
    signIn(A);
    commandTimeout = true;
    const flow = open(A);
    const before = await ready(A);
    const execute = screen.getByRole("button", { name: "Executar análise" });
    act(() => {
      execute.click();
      execute.click();
    });
    expect(await screen.findByText(MENSAGENS_V116.reconciliada)).toBeVisible();
    const queued = await ready(A);
    expect(queued.state).toContain("Na fila");
    expect(queue.size).toBe(1);
    expect(commands).toBe(1);
    const command = transport.trace.filter((t) => t.route === commandRoute);
    expect(command).toHaveLength(1);
    expect(command[0]).toMatchObject({ code: "FIXTURE_TIMEOUT", status: 504 });
    const trail = await obterEventosAuditoria({
      idOrganizacao: A.org,
      pagina: 0,
      correlationId: A.correlation,
    });
    expect(trail).toEqual({ eventos: [event(A)], total: 1 });
    flow.view.unmount();
    const next = open(A);
    const recovered = await ready(A);
    expect(recovered).toEqual(queued);
    expect(commands).toBe(1);
    finish(next.view);
    record("T0003", "positive", A, [before, { command, commands }, { queued, trail }, recovered]);
  });

  it("IFV1-F6-T0003 negative: withholds the foreign queue command and its audit trail from a reader", async () => {
    const flow = await rejectForeignThenOwn();
    await expect(
      obterEventosAuditoria({ idOrganizacao: A.org, pagina: 0, correlationId: A.correlation }),
    ).rejects.toThrow("Acesso não autorizado");
    expect(transport.trace.at(-1)).toMatchObject({ route: auditRoute, status: 403 });
    expect(queue.size).toBe(0);
    finish(flow.view);
    record("T0003", "negative", B, [
      { context: B.org },
      { foreignAnalysis: 403, foreignAudit: 403 },
      { commandVisible: false, auditVisible: false },
      flow.recovered,
    ]);
  });

  it("IFV1-F6-T0004 positive: ignores an old read after changing route and restores the correct session view", async () => {
    signIn(A);
    let release = () => undefined as void;
    const completion = new Promise<void>((resolve) => {
      release = resolve;
    });
    const gate = { signal: null as AbortSignal | null, release, completion };
    routeGate = gate;
    const flow = open(A);
    await waitFor(() => expect(gate.signal).toBeInstanceOf(AbortSignal));
    const oldRead = transport.trace.at(-1);
    signIn(B);
    expect(obterPreferenciaOrganizacao(A.actor)).toBeNull();
    await flow.navigate(B);
    const visible = await ready(B);
    expect(gate.signal?.aborted).toBe(true);
    await act(async () => release());
    expect(await ready(B)).toEqual(visible);
    expect(screen.queryByText("Competência " + month(A))).toBeNull();
    expect(screen.getByRole("link", { name: "Voltar para a competência" })).toHaveAttribute(
      "href",
      "/competencias/" + B.competence,
    );
    signIn(A);
    routeGate = null;
    await flow.navigate(A);
    const recovered = await ready(A);
    finish(flow.view);
    record("T0004", "positive", A, [
      { context: A.org, oldRead },
      { route: urlFor(B), aborted: gate.signal?.aborted },
      visible,
      recovered,
    ]);
  });

  it("IFV1-F6-T0004 negative: redirects an expired session before the protected read and accepts the restored reader", async () => {
    const flow = open(A);
    expect(await screen.findByRole("heading", { name: "Entrada da sessão" })).toBeVisible();
    expect(flow.router.state.location.pathname).toBe("/login");
    expect(transport.trace).toEqual([]);
    closed();
    signIn(B);
    await flow.navigate(B);
    const recovered = await ready(B);
    expect(transport.trace).toHaveLength(1);
    expect(transport.trace[0]).toMatchObject({ actor: B.actor, route: readRoute, status: 200 });
    finish(flow.view);
    record("T0004", "negative", B, [
      { expired: true },
      { location: "/login", protectedReads: 0 },
      { isolation: true },
      recovered,
    ]);
  });
});

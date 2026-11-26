import {
  A as identityBase,
  evidenceStep as step,
  journeyRecorder,
} from "./f6-code-journey-fixture";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { buscarOpcoesContratantes } from "@/lib/contratos/novoContratoDados";
import {
  listarContratantes,
  verificarAcessoOrganizacao,
} from "@/lib/contratantes/contratantesDados";
import {
  atualizarContratante,
  buscarContratante,
  formularioDe,
  montarArgsAtualizacao,
  type ContratanteEdicao,
} from "@/lib/contratantes/editarContratanteDados";
import { inserirContratante, montarPayload } from "@/lib/contratantes/novoContratanteDados";

const boundary = vi.hoisted(() => ({ fetch: vi.fn(), session: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f6-fixture.invalid", "fixture-key", {
      accessToken: async () => boundary.session,
      global: { fetch: (input, init) => boundary.fetch(input, init) },
    }),
  };
});

const key = (side: string, offset: number) =>
  side + "5200000-0000-4000-8000-" + String(offset).padStart(12, "0");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  session: "fixture-party-" + side,
  party: key(side, 1),
  contract: key(side, 2),
  event: key(side, 3),
  correlation: key(side, 4),
  label: "Contratante sintético " + side.toUpperCase(),
});
const A = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
  "administrador",
);
const B = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
  "leitor",
);
type Scope = typeof A;
type Exchange = {
  method: "GET" | "POST";
  path: string;
  filters?: Record<string, string>;
  body?: Record<string, unknown>;
  status: number;
  data: unknown;
  commit?: () => void;
  readback?: () => unknown;
};
const queue: Exchange[] = [];
const observed: Exchange[] = [];
const date = "2026-10-20T12:00:00Z";
const deny = { code: "42501", message: "Escopo não autorizado" };
const get = (path: string, filters: Record<string, string>, data: unknown[]): Exchange => ({
  method: "GET",
  path,
  filters,
  status: 200,
  data,
});
const post = (
  path: string,
  body: Record<string, unknown>,
  data: unknown,
  status = 200,
): Exchange => ({
  method: "POST",
  path,
  body,
  status,
  data,
});
const rpc = (name: string, body: Record<string, unknown>, data: unknown, status = 200) =>
  post("rpc/" + name, body, data, status);
const orgFilter = (s: Scope) => ({ id_organizacao: "eq." + s.org });

beforeEach(() => {
  queue.length = 0;
  observed.length = 0;
  boundary.fetch.mockReset().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const step = queue.shift();
    if (!step) throw new Error("Unexpected synthetic request");
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f6-fixture.invalid");
    expect(url.pathname).toBe("/rest/v1/" + step.path);
    expect(init?.method).toBe(step.method);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer " + boundary.session);
    const filters = Object.fromEntries(
      [...url.searchParams].filter(
        ([field]) => !["select", "order", "offset", "limit"].includes(field),
      ),
    );
    expect(filters).toEqual(step.filters ?? {});
    expect(init?.body ? JSON.parse(String(init.body)) : undefined).toEqual(step.body);
    step.commit?.();
    const currentData = step.readback ? step.readback() : step.data;
    observed.push(step);
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(currentData)) {
      headers.set("content-range", currentData.length ? "0-0/" + currentData.length : "*/0");
    }
    return new Response(JSON.stringify(currentData), { status: step.status, headers });
  });
});
afterEach(() => {
  expect(queue).toHaveLength(0);
  expect(boundary.fetch).toHaveBeenCalledTimes(observed.length);
});
function use(s: Scope, ...steps: Exchange[]) {
  expect(queue).toHaveLength(0);
  boundary.session = s.session;
  queue.push(...steps);
}

const row = (s: Scope, version = 1): ContratanteEdicao => ({
  id: s.party,
  id_organizacao: s.org,
  razao_social: s.label + (version === 2 ? " atualizado" : ""),
  nome_fantasia: null,
  documento: null,
  tipo_pessoa: "juridica",
  situacao: "ativo",
  contato: {},
  versao_registro: version,
  atualizado_em: date,
});
type Party = ReturnType<typeof row>;
const brief = (p: Party) => ({
  id: p.id,
  razao_social: p.razao_social,
  nome_fantasia: p.nome_fantasia,
  documento: p.documento,
  tipo_pessoa: p.tipo_pessoa,
  situacao: p.situacao,
  atualizado_em: p.atualizado_em,
});
const contract = (s: Scope) => ({
  id: s.contract,
  id_organizacao: s.org,
  numero: "F6.2-" + s.contract.slice(0, 1),
  objeto: "Contrato sintético",
  situacao: "ativo",
  criticidade: "baixa",
  inicio: "2026-10-01",
  fim: null,
  valor_global: null,
});
const detail = (s: Scope, p: Party) => ({
  ...contract(s),
  id_contratante: p.id,
  contratante: {
    razao_social: p.razao_social,
    nome_fantasia: p.nome_fantasia,
    documento: p.documento,
  },
});
const readParty = (s: Scope, value?: Party) =>
  get("contratantes", { ...orgFilter(s), id: "eq." + s.party }, value ? [value] : []);
const readOrg = (s: Scope, visible: boolean) =>
  get("organizacoes", { id: "eq." + s.org }, visible ? [{ id: s.org }] : []);
const readContract = (s: Scope, value?: Party) =>
  get("contratos", { id: "eq." + s.contract }, value ? [detail(s, value)] : []);
const editCall = (s: Scope, p: Party, version = 1) => ({
  p_id_organizacao: s.org,
  p_id_contratante: p.id,
  p_versao_esperada: version,
  p_tipo_pessoa: "juridica",
  p_documento: "",
  p_razao_social: p.razao_social,
  p_nome_fantasia: "",
  p_contato: {},
  p_situacao: "ativo",
});
const createForm = (p: Party) => ({
  razaoSocial: p.razao_social + "  ",
  tipoPessoa: "juridica",
  documento: "",
  nomeFantasia: "",
  email: "",
  telefone: "",
  situacao: "ativo",
});
const createCall = (p: Party) => ({
  id_organizacao: p.id_organizacao,
  tipo_pessoa: p.tipo_pessoa,
  documento: null,
  razao_social: p.razao_social,
  nome_fantasia: null,
  contato: {},
  situacao: p.situacao,
});

const cases = [
  ["0093", "V102", "V101", "contratantes"],
  ["0096", "V102", "V103", "contratantes"],
  ["0098", "V102", "V105", "contratantes"],
  ["0100", "V102", "V123", "eventos_auditoria"],
  ["0107", "V103", "V101", "contratantes"],
  ["0111", "V103", "V104", "contratos"],
  ["0113", "V103", "V105", "contratantes"],
  ["0115", "V103", "V106", "contratantes"],
  ["0116", "V103", "V123", "eventos_auditoria"],
] as const;
type PartyCase = (typeof cases)[number];
const producer = (c: PartyCase) => (c[1] === "V102" ? "contratantes" : "rpc/atualizar_contratante");
const eventName = (c: PartyCase) =>
  c[1] === "V102" ? "ContratanteCriado" : "ContratanteAtualizado";
const eventFilters = (c: PartyCase, s: Scope) => ({
  ...orgFilter(s),
  evento: "eq." + eventName(c),
  entidade: "eq.contratantes",
  correlation_id: "eq." + s.correlation,
});
const eventRow = (c: PartyCase, s: Scope) => ({
  id: s.event,
  criado_em: date,
  evento: eventName(c),
  entidade: "contratantes",
  origem: "usuario",
  id_usuario: s.actor,
  id_entidade: s.party,
  correlation_id: s.correlation,
});

function queueConsumer(c: PartyCase, s: Scope, p?: Party): Exchange[] {
  const list = p ? [brief(p)] : [];
  switch (c[2]) {
    case "V101":
      return [readOrg(s, !!p), get("contratantes", orgFilter(s), list)];
    case "V103":
      return [readParty(s, p)];
    case "V105":
      return [
        get(
          "contratantes",
          orgFilter(s),
          list.map((item) => ({
            id: item.id,
            razao_social: item.razao_social,
            nome_fantasia: item.nome_fantasia,
            documento: item.documento,
            situacao: item.situacao,
          })),
        ),
      ];
    case "V104":
      return [
        readOrg(s, !!p),
        get("contratos", orgFilter(s), p ? [contract(s)] : []),
        ...contractAccess(s, p),
      ];
    case "V106":
      return contractAccess(s, p);
    case "V123":
      return [
        rpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, !!p),
        get("eventos_auditoria", eventFilters(c, s), p ? [eventRow(c, s)] : []),
      ];
  }
}
function contractAccess(s: Scope, p?: Party) {
  return p
    ? [readContract(s, p)]
    : [
        readContract(s),
        rpc("classificar_acesso_contrato_v106", { p_id_contrato: s.contract }, "negado"),
      ];
}

async function verifyOrg(s: Scope, visible: boolean) {
  const check = verificarAcessoOrganizacao(s.org);
  if (visible) await expect(check).resolves.toBe(true);
  else await expect(check).rejects.toMatchObject({ tipo: "negado" });
}
async function verifyContract(s: Scope, p?: Party) {
  const selected = obterContrato(s.contract);
  if (!p) {
    await expect(selected).rejects.toMatchObject({ tipo: "negado" });
    return;
  }
  await expect(selected).resolves.toMatchObject({
    id: s.contract,
    id_organizacao: s.org,
    id_contratante: p.id,
    contratante: { razao_social: p.razao_social },
  });
}
async function verifyConsumer(c: PartyCase, s: Scope, p?: Party) {
  switch (c[2]) {
    case "V101": {
      await verifyOrg(s, !!p);
      const result = await listarContratantes({
        idOrganizacao: s.org,
        pagina: 1,
        busca: "",
        situacao: "todos",
      });
      expect(result.itens).toEqual(p ? [brief(p)] : []);
      return { visible: result.total, resultId: result.itens[0]?.id };
    }
    case "V103": {
      const result = buscarContratante(s.org, s.party);
      if (p) await expect(result).resolves.toEqual(p);
      else await expect(result).rejects.toMatchObject({ tipo: "nao_encontrado" });
      return { visible: p ? 1 : 0, resultId: p?.id };
    }
    case "V105": {
      const result = await buscarOpcoesContratantes({ idOrganizacao: s.org, pagina: 1, busca: "" });
      expect(result.itens.map((item) => [item.id, item.razao_social])).toEqual(
        p ? [[p.id, p.razao_social]] : [],
      );
      return { visible: result.total, resultId: result.itens[0]?.id };
    }
    case "V104": {
      await verifyOrg(s, !!p);
      const result = await listarContratos({ idOrganizacao: s.org, pagina: 1 });
      expect(result.itens).toEqual(p ? [contract(s)] : []);
      await verifyContract(s, p);
      return { visible: result.total, resultId: result.itens[0]?.id, relatedPartyId: p?.id };
    }
    case "V106":
      await verifyContract(s, p);
      return { visible: p ? 1 : 0, resultId: p ? s.contract : undefined, relatedPartyId: p?.id };
    case "V123": {
      expect(await podeConsultarAuditoria(s.org)).toBe(!!p);
      const result = await obterEventosAuditoria({
        idOrganizacao: s.org,
        pagina: 0,
        evento: eventName(c),
        entidade: "contratantes",
        correlationId: s.correlation,
      });
      expect(result.eventos).toEqual(p ? [eventRow(c, s)] : []);
      return {
        visible: result.total,
        resultId: result.eventos[0]?.id,
        correlationId: result.eventos[0]?.correlation_id,
        event: result.eventos[0]?.evento,
        eventEntityId: result.eventos[0]?.id_entidade,
      };
    }
  }
}

function mutation(c: PartyCase, p: Party, status = 200, error: unknown = deny): Exchange {
  if (c[1] === "V102") {
    return post(
      "contratantes",
      createCall(p),
      status >= 400
        ? error
        : {
            id: p.id,
            razao_social: p.razao_social,
            situacao: p.situacao,
          },
      status >= 400 ? status : 201,
    );
  }
  return rpc(
    "atualizar_contratante",
    editCall(A, p),
    status >= 400
      ? error
      : {
          schema_versao: "v103-v1",
          contratante: p,
        },
    status,
  );
}
const applyMutation = (c: PartyCase, p: Party) =>
  c[1] === "V102"
    ? inserirContratante(montarPayload(A.org, createForm(p)))
    : atualizarContratante(montarArgsAtualizacao(A.org, A.party, 1, formularioDe(p)));

const proofs = journeyRecorder("parties");
const interruption = {
  code: "XX000",
  message: "Resposta sintética interrompida depois da gravação.",
};
const stale = { code: "PT409", message: "A versão da edição já mudou." };
const identity = (s: Scope) => ({ ...identityBase, actor: s.actor, org: s.org, role: s.role });
describe("F6 party journeys", () => {
  for (const c of cases) {
    const creation = c[1] === "V102";
    const baseline = creation ? undefined : row(A);
    const next = row(A, creation ? 1 : 2);
    const name = "IFV1-F6-C" + c[0];
    it(
      name + " positive: reconciles a lost response and reads the linked party twice",
      async () => {
        let persisted = baseline;
        let writes = 0;
        use(
          A,
          readParty(A, baseline),
          {
            ...mutation(c, next, 502, interruption),
            commit: () => {
              persisted = next;
              writes++;
            },
          },
          {
            ...readParty(A, next),
            readback: () => (persisted ? [persisted] : []),
          },
        );
        if (baseline) expect(await buscarContratante(A.org, A.party)).toEqual(baseline);
        else
          await expect(buscarContratante(A.org, A.party)).rejects.toMatchObject({
            tipo: "nao_encontrado",
          });
        await expect(applyMutation(c, next)).rejects.toMatchObject({ tipo: "erro" });
        expect(observed.at(-1)).toMatchObject({
          path: producer(c),
          status: 502,
          data: interruption,
        });
        const saved = await buscarContratante(A.org, A.party);
        expect(saved).toEqual(next);
        use(A, ...queueConsumer(c, A, saved));
        const first = await verifyConsumer(c, A, saved);
        expect(first.visible).toBe(1);
        const attempt = observed.find((x) => x.path === producer(c) && x.method === "POST")!;
        use(
          A,
          ...(!creation ? [rpc("atualizar_contratante", editCall(A, next), stale, 409)] : []),
          { ...readParty(A, saved), readback: () => (persisted ? [persisted] : []) },
          ...queueConsumer(c, A, saved),
        );
        if (!creation)
          await expect(applyMutation(c, next)).rejects.toMatchObject({ tipo: "conflito" });
        const readback = await buscarContratante(A.org, A.party);
        expect(readback).toEqual(saved);
        const reloaded = await verifyConsumer(c, A, readback);
        expect(reloaded).toEqual(first);
        expect(writes).toBe(1);
        const start = {
          registered: !!baseline,
          version: baseline?.versao_registro ?? null,
          organization: A.org,
        };
        const end = { ...reloaded, partyId: readback.id, version: readback.versao_registro };
        proofs.record("C" + c[0], "positive", identity(A), {
          preconditions: start,
          steps: [
            step("precondition", start),
            step("producer", {
              method: attempt.method,
              status: attempt.status,
              correlation: A.correlation,
            }),
            step("consumer", { ...first, identity: saved.id }),
            step("recovery", end),
          ],
          observed: end,
          postconditions: { writes, organization: readback.id_organizacao },
          recoveryProof: end,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(name + " negative: denies a foreign change and reloads the preserved party", async () => {
      const own = row(B);
      use(B, readParty(B, own), mutation(c, next, 403), ...queueConsumer(c, A), readParty(B, own));
      const before = await buscarContratante(B.org, B.party);
      await expect(applyMutation(c, next)).rejects.toMatchObject({ tipo: "negado" });
      const blocked = await verifyConsumer(c, A);
      expect(blocked).toMatchObject({ visible: 0, resultId: undefined });
      const confirmed = await buscarContratante(B.org, B.party);
      expect(confirmed).toEqual(before);
      const writes = observed.filter((x) => x.method === "POST" && x.path === producer(c));
      expect(writes).toHaveLength(1);
      const [denial] = writes;
      expect(denial).toMatchObject({ status: 403, data: { code: "42501" } });
      use(A, readParty(A, baseline));
      if (baseline) expect(await buscarContratante(A.org, A.party)).toEqual(baseline);
      else
        await expect(buscarContratante(A.org, A.party)).rejects.toMatchObject({
          tipo: "nao_encontrado",
        });
      const resumed = {
        id: confirmed.id,
        version: confirmed.versao_registro,
        org: confirmed.id_organizacao,
      };
      proofs.record("C" + c[0], "negative", identity(B), {
        preconditions: before,
        steps: [
          step("precondition", before),
          step("producer", { status: denial!.status, code: "42501" }),
          step("consumer", blocked),
          step("recovery", resumed),
        ],
        observed: { status: 403, code: "42501", visible: blocked.visible },
        postconditions: { changed: false, confirmed: resumed },
        recoveryProof: resumed,
        cleanupStatus: "CLEAN",
        negativeProof: {
          decision: "DENIED",
          status: 403,
          code: "42501",
          effects: 0,
          disclosed: false,
        },
      });
    });
  }
});
afterAll(proofs.write);

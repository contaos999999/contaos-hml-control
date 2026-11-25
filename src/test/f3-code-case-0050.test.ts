/**
 * F3 CODE C0050: SYS04 → V106. Real preference, contract selection and
 * consumer query. Only the Supabase boundary is a local fixture; not LIVE/RLS proof.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

type Call = { table: string; ops: Array<[string, unknown[]]> };
type Response = { data: unknown; error: unknown; status: number; count?: number };
const m = vi.hoisted(() => ({
  calls: [] as Call[],
  responses: new Map<string, Response>(),
  detail: {} as Response,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(() => { throw new Error("unexpected RPC"); }),
    from: (table: string) => {
      const call: Call = { table, ops: [] };
      m.calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const name of ["select", "eq", "order", "range", "abortSignal", "maybeSingle"]) {
        builder[name] = (...args: unknown[]) => {
          call.ops.push([name, args]);
          return builder;
        };
      }
      builder.then = (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) => {
        const response = call.ops.some(([op])=>op==="maybeSingle") ? m.detail : m.responses.get(table);
        if (!response) return Promise.reject(new Error("unexpected table")).then(ok, fail);
        return Promise.resolve(response).then(ok, fail);
      };
      return builder;
    },
  },
}));

import { definirPreferenciaOrganizacao, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterContrato, COLUNAS_DETALHE } from "@/lib/contratos/contratoDetalheDados";

const CASE_ID = "IFV1-F3-C0050";
const CONSUMER = "contratos";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CONTRACT = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ROW = CONTRACT;
const observations: Record<string, unknown>[] = [];
const ops = (call: Call, name: string) => call.ops.filter(([op]) => op === name).map(([, args]) => args);

async function selectContract(user: string) {
  definirPreferenciaOrganizacao(user, ORG);
  const org = obterPreferenciaOrganizacao(user);
  expect(org).toBe(ORG);
  if (!org) throw new Error("missing preference");
  const result = await listarContratos({ idOrganizacao: org, pagina: 1 });
  expect(result.itens).toHaveLength(1);
  const contract = result.itens[0];
  expect(contract.id_organizacao).toBe(org);
  expect(ops(m.calls.at(-1)!, "eq")).toEqual([["id_organizacao", org]]);
  return {org, id: contract.id};
}

async function readConsumer(org: string, id: string) {
  return obterContrato(id, new AbortController().signal);
}

function checkConsumer(org: string, id: string) {
  const call = m.calls.at(-1)!;
  expect(call.table).toBe(CONSUMER);
  expect(ops(call, "select")).toEqual([[COLUNAS_DETALHE]]);
  expect(ops(call, "eq")).toEqual([["id", id]]);
  expect(ops(call, "maybeSingle")).toEqual([[]]);
}

describe("F3 CODE C0050: preference, linked contract and contratos", () => {
  beforeEach(() => {
    sessionStorage.clear();
    m.calls.length = 0;
    m.responses.clear();
    m.responses.set("contratos", {data: [{id: CONTRACT, id_organizacao: ORG}], error: null, status: 200, count: 1});
  });

  it("positive: both local authorized identities query the selected contract", async () => {
    m.detail = {data:{id:CONTRACT,id_organizacao:ORG,numero:"F3-001"},error:null,status:200};
    const users = ["f3-master", "f3-leitor"];
    for (const user of users) {
      const {org, id} = await selectContract(user);
      const result = await readConsumer(org, id);
      expect(result.id).toBe(ROW);
      expect(result.id_organizacao).toBe(org);
      checkConsumer(org, id);
    }
    expect(m.calls.map(c => c.table)).toEqual(["contratos", CONSUMER, "contratos", CONSUMER]);
    observations.push({
      caseId: CASE_ID, consumer: CONSUMER, producerOrder: 3, kind: "positive",
      testId: "src/test/f3-code-case-0050.test.ts:positive",
      state: "EXECUTED", assertion: "PASS", organizationId: ORG, producerEntityId: ORG,
      network: {method: "GET", status: 200, table: CONSUMER, fixture: true},
      readback: {matched: true, contractId: CONTRACT, rowId: ROW, authorizedLocalIdentities: users.length},
    });
  });

  it("negative: stale organization preference cannot override a denied consumer response", async () => {
    const {org, id} = await selectContract("f3-outsider");
    expect(obterPreferenciaOrganizacao("unrelated-user")).toBeNull();
    m.detail = {data:null,error:{code:"42501"},status:403};
    await expect(readConsumer(org, id)).rejects.toMatchObject({tipo: "negado"});
    checkConsumer(org, id);
    expect(m.calls.map(c => c.table)).toEqual(["contratos", CONSUMER]);
    observations.push({
      caseId: CASE_ID, consumer: CONSUMER, producerOrder: 3, kind: "negative",
      testId: "src/test/f3-code-case-0050.test.ts:negative",
      state: "EXECUTED", assertion: "PASS", organizationId: ORG, producerEntityId: ORG,
      network: {method: "GET", status: 403, table: CONSUMER, fixture: true},
      readback: {outcome: "DENY", contractId: CONTRACT, preferenceNotAuthorization: true},
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0050_OBSERVATIONS;
    if (target) {
      expect(observations.map(o => o.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", {flag: "wx"});
    }
  });
});

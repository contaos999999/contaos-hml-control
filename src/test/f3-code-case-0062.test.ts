/**
 * F3 CODE C0062: SYS04 → V118. Real preference, contract selection and
 * consumer query. Only the Supabase boundary is a local fixture; not LIVE/RLS proof.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

type Call = { table: string; ops: Array<[string, unknown[]]> };
type Response = { data: unknown; error: unknown; status: number; count?: number };
const m = vi.hoisted(() => ({
  calls: [] as Call[],
  responses: new Map<string, Response>(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(() => { throw new Error("unexpected RPC"); }),
    from: (table: string) => {
      const call: Call = { table, ops: [] };
      m.calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const name of ["select", "eq", "order", "range", "abortSignal"]) {
        builder[name] = (...args: unknown[]) => {
          call.ops.push([name, args]);
          return builder;
        };
      }
      builder.then = (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) => {
        const response = m.responses.get(table);
        if (!response) return Promise.reject(new Error("unexpected table")).then(ok, fail);
        return Promise.resolve(response).then(ok, fail);
      };
      return builder;
    },
  },
}));

import { definirPreferenciaOrganizacao, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { listarPareceres, COLUNAS_PARECERES } from "@/lib/competencias/parecerInternoDados";
import { listarCompetencias, FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";

const CASE_ID = "IFV1-F3-C0062";
const CONSUMER = "pareceres_internos";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CONTRACT = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const COMP = "a9999999-9999-4999-8999-999999999999";
const ROW = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
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
  const selected = await listarCompetencias(contract.id, FILTROS_COMPETENCIA_VAZIOS, 0);
  expect(selected.itens).toHaveLength(1);
  expect(ops(m.calls.at(-1)!, "eq")).toEqual([["id_contrato", contract.id]]);
  const competence = selected.itens[0].id;
  expect(competence).toBe(COMP);
  return {org, id: contract.id, competence};
}

async function readConsumer(org: string, id: string, competence: string) {
  return listarPareceres(competence, org, id, 0, new AbortController().signal);
}

function checkConsumer(org: string, id: string, competence: string) {
  const call = m.calls.at(-1)!;
  expect(call.table).toBe(CONSUMER);
  expect(ops(call, "select")).toEqual([[COLUNAS_PARECERES, { count: "exact" }]]);
  expect(ops(call, "eq")).toEqual([["id_competencia", competence],["id_organizacao", org],["id_contrato", id]]);
  expect(ops(call, "order")).toEqual([["versao", { ascending: false }], ["id", { ascending: false }]]);
  expect(ops(call, "range")).toEqual([[0, 24]]);
}

describe("F3 CODE C0062: preference, linked contract and pareceres_internos", () => {
  beforeEach(() => {
    sessionStorage.clear();
    m.calls.length = 0;
    m.responses.clear();
    m.responses.set("competencias", {data:[{id:COMP,competencia_referencia:"2026-01-01",situacao:"rascunho"}],error:null,status:200,count:1});
    m.responses.set("contratos", {data: [{id: CONTRACT, id_organizacao: ORG}], error: null, status: 200, count: 1});
  });

  it("positive: both local authorized identities query the selected contract", async () => {
    m.responses.set(CONSUMER, {data: [{id: ROW, id_competencia: COMP, id_contrato: CONTRACT, id_organizacao: ORG, autor:null, texto:"Parecer F3", status:"aprovado",versao:1,hash:"a".repeat(64),criado_em:"2026-01-01T12:00:00Z",aprovado_por:null,aprovado_em:"2026-01-01T12:00:00Z"}], error: null, status: 200, count: 1});
    const users = ["f3-master", "f3-leitor"];
    for (const user of users) {
      const {org, id, competence} = await selectContract(user);
      const result = await readConsumer(org, id, competence);
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].id).toBe(ROW);
      expect(result.itens[0]).toMatchObject({id_organizacao:org,id_contrato:id,id_competencia:competence});
      expect(result.total).toBe(1);
      checkConsumer(org, id, competence);
    }
    expect(m.calls.map(c => c.table)).toEqual(["contratos","competencias",CONSUMER,"contratos","competencias",CONSUMER]);
    observations.push({
      caseId: CASE_ID, consumer: CONSUMER, producerOrder: 3, kind: "positive",
      testId: "src/test/f3-code-case-0062.test.ts:positive",
      state: "EXECUTED", assertion: "PASS", organizationId: ORG, producerEntityId: ORG,
      network: {method: "GET", status: 200, table: CONSUMER, fixture: true},
      readback: {matched: true, contractId: CONTRACT, rowId: ROW, authorizedLocalIdentities: users.length},
    });
  });

  it("negative: stale organization preference cannot override a denied consumer response", async () => {
    const {org, id, competence} = await selectContract("f3-outsider");
    expect(obterPreferenciaOrganizacao("unrelated-user")).toBeNull();
    m.responses.set(CONSUMER, {data: null, error: {code: "42501"}, status: 403});
    await expect(readConsumer(org, id, competence)).rejects.toMatchObject({tipo: "sem_permissao"});
    checkConsumer(org, id, competence);
    expect(m.calls.map(c => c.table)).toEqual(["contratos","competencias",CONSUMER]);
    observations.push({
      caseId: CASE_ID, consumer: CONSUMER, producerOrder: 3, kind: "negative",
      testId: "src/test/f3-code-case-0062.test.ts:negative",
      state: "EXECUTED", assertion: "PASS", organizationId: ORG, producerEntityId: ORG,
      network: {method: "GET", status: 403, table: CONSUMER, fixture: true},
      readback: {outcome: "DENY", contractId: CONTRACT, preferenceNotAuthorization: true},
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0062_OBSERVATIONS;
    if (target) {
      expect(observations.map(o => o.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", {flag: "wx"});
    }
  });
});

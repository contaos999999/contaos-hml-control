/**
 * F3 CODE C0054: SYS04 → V110. Real preference, contract selection and
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
    rpc: vi.fn(() => {
      throw new Error("unexpected RPC");
    }),
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

import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos } from "@/lib/contratos/contratosDados";
import {
  listarDocumentos,
  COLUNAS_DOCUMENTO,
  FILTROS_VAZIOS,
} from "@/lib/contratos/documentosDados";

const CASE_ID = "IFV1-F3-C0054";
const CONSUMER = "documentos_contrato";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CONTRACT = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ROW = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const observations: Record<string, unknown>[] = [];
const ops = (call: Call, name: string) =>
  call.ops.filter(([op]) => op === name).map(([, args]) => args);

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
  return { org, id: contract.id };
}

async function readConsumer(org: string, id: string) {
  return listarDocumentos(id, FILTROS_VAZIOS, 0);
}

function checkConsumer(org: string, id: string) {
  const call = m.calls.at(-1)!;
  expect(call.table).toBe(CONSUMER);
  expect(ops(call, "select")).toEqual([[COLUNAS_DOCUMENTO, { count: "exact" }]]);
  expect(ops(call, "eq")).toEqual([["id_contrato", id]]);
  expect(ops(call, "order")).toEqual([
    ["atualizado_em", { ascending: false }],
    ["id", { ascending: false }],
  ]);
  expect(ops(call, "range")).toEqual([[0, 24]]);
}

describe("F3 CODE C0054: preference, linked contract and documentos_contrato", () => {
  beforeEach(() => {
    sessionStorage.clear();
    m.calls.length = 0;
    m.responses.clear();
    m.responses.set("contratos", {
      data: [{ id: CONTRACT, id_organizacao: ORG }],
      error: null,
      status: 200,
      count: 1,
    });
  });

  it("positive: both local authorized identities query the selected contract", async () => {
    m.responses.set(CONSUMER, {
      data: [
        {
          id: ROW,
          id_contrato: CONTRACT,
          titulo: "Documento F3",
          tipo: "contrato",
          versao_atual: 1,
        },
      ],
      error: null,
      status: 200,
      count: 1,
    });
    const users = ["f3-master", "f3-leitor"];
    for (const user of users) {
      const { org, id } = await selectContract(user);
      const result = await readConsumer(org, id);
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].id).toBe(ROW);
      expect(result.itens[0].id_contrato).toBe(id);
      expect(result.total).toBe(1);
      checkConsumer(org, id);
    }
    expect(m.calls.map((c) => c.table)).toEqual(["contratos", CONSUMER, "contratos", CONSUMER]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "positive",
      testId: "src/test/f3-code-case-0054.test.ts:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 200, table: CONSUMER, fixture: true },
      readback: {
        matched: true,
        contractId: CONTRACT,
        rowId: ROW,
        authorizedLocalIdentities: users.length,
      },
    });
  });

  it("negative: stale organization preference cannot override a denied consumer response", async () => {
    const { org, id } = await selectContract("f3-outsider");
    expect(obterPreferenciaOrganizacao("unrelated-user")).toBeNull();
    m.responses.set(CONSUMER, { data: null, error: { code: "42501" }, status: 403 });
    await expect(readConsumer(org, id)).rejects.toMatchObject({ tipo: "negado" });
    checkConsumer(org, id);
    expect(m.calls.map((c) => c.table)).toEqual(["contratos", CONSUMER]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "negative",
      testId: "src/test/f3-code-case-0054.test.ts:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 403, table: CONSUMER, fixture: true },
      readback: { outcome: "DENY", contractId: CONTRACT, preferenceNotAuthorization: true },
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0054_OBSERVATIONS;
    if (target) {
      expect(observations.map((o) => o.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

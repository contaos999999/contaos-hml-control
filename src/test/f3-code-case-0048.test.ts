/**
 * F3 CODE C0048: SYS04 → V104, preferência local e consulta real de contratos
 * com filtro por organização, paginação e 403, sob fixture CODE isolada.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

type Call = { table: string; ops: Array<[string, unknown[]]> };
const m = vi.hoisted(() => ({
  calls: [] as Call[],
  response: {} as { data: unknown; error: unknown; status: number; count?: number },
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
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
      builder["then"] = (onResolved: (v: unknown) => unknown, onError: (e: unknown) => unknown) =>
        Promise.resolve(m.response).then(onResolved, onError);
      return builder;
    },
  },
}));

import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos, COLUNAS_CONTRATO } from "@/lib/contratos/contratosDados";

const CASE_ID = "IFV1-F3-C0048";
const CONSUMER = "contratos";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const USER = "f3-code-contratos-user";
const observations: Record<string, unknown>[] = [];
const operations = (name: string) =>
  m.calls[0]?.ops.filter(([op]) => op === name).map(([, args]) => args);

describe("F3 CODE C0048: consulta de contratos filtrada pela preferência", () => {
  beforeEach(() => {
    sessionStorage.clear();
    m.calls.length = 0;
    definirPreferenciaOrganizacao(USER, ORG);
  });

  it("positive: lista somente contratos vinculados com colunas e range fixos", async () => {
    const org = obterPreferenciaOrganizacao(USER);
    expect(org).toBe(ORG);
    m.response = {
      data: [
        {
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          id_organizacao: ORG,
          numero: "F3-001",
          objeto: "Teste integracao",
          situacao: "ativo",
          criticidade: "baixa",
          inicio: null,
          fim: null,
          valor_global: 100,
        },
      ],
      error: null,
      status: 200,
      count: 1,
    };
    const result = await listarContratos({ idOrganizacao: org!, pagina: 1 });
    expect(result.itens).toHaveLength(1);
    expect(result.itens[0]?.id_organizacao).toBe(ORG);
    expect(result.total).toBe(1);
    expect(m.calls.map((call) => call.table)).toEqual(["contratos"]);
    expect(operations("select")).toEqual([[COLUNAS_CONTRATO, { count: "exact" }]]);
    expect(operations("eq")).toEqual([["id_organizacao", ORG]]);
    expect(operations("range")).toEqual([[0, 24]]);
    expect(operations("order")).toEqual([
      ["numero", { ascending: true }],
      ["id", { ascending: true }],
    ]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "positive",
      testId: "src/test/f3-code-case-0048.test.ts:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 200, table: CONSUMER, fixture: true },
      readback: { matched: true, filteredOrganization: ORG, contractCount: 1 },
    });
  });

  it("negative: erro 403 de contratos não permite leitura apesar da preferência", async () => {
    const org = obterPreferenciaOrganizacao(USER);
    expect(org).toBe(ORG);
    expect(obterPreferenciaOrganizacao("usuario-externo")).toBeNull();
    m.response = {
      data: null,
      error: { code: "42501", message: "Negado" },
      status: 403,
    };
    await expect(listarContratos({ idOrganizacao: org!, pagina: 1 })).rejects.toMatchObject({
      tipo: "negado",
    });
    expect(m.calls.map((call) => call.table)).toEqual(["contratos"]);
    expect(operations("eq")).toEqual([["id_organizacao", ORG]]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "negative",
      testId: "src/test/f3-code-case-0048.test.ts:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 403, table: CONSUMER, fixture: true },
      readback: { outcome: "DENY", preferenceNotAuthorization: true },
    });
  });

  afterAll(() => {
    const target = process.env["F3_CODE_C0048_OBSERVATIONS"];
    if (target) {
      expect(observations).toHaveLength(2);
      expect(observations.map((o) => o["kind"])).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

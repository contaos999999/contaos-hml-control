/**
 * F3 CODE C0045, SYS04 → V101: preferência de org + consultas reais do módulo
 * contratantesDados, ambas sobre fixture Data API com autorizacao isolada.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

type Call = {
  table: string;
  ops: Array<[string, unknown[]]>;
};
const m = vi.hoisted(() => ({
  calls: [] as Call[],
  handlers: {} as Record<string, (call: Call) => unknown>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      const call: Call = { table, ops: [] };
      m.calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const name of ["select", "eq", "order", "range", "maybeSingle", "or"]) {
        builder[name] = (...args: unknown[]) => {
          call.ops.push([name, args]);
          return builder;
        };
      }
      builder.then = (done: (v: unknown) => unknown, fail: (e: unknown) => unknown) => {
        try {
          return Promise.resolve(m.handlers[table]?.(call)).then(done, fail);
        } catch (error) {
          return Promise.reject(error).then(done, fail);
        }
      };
      return builder;
    },
  },
}));

import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  listarContratantes,
  verificarAcessoOrganizacao,
  COLUNAS_CONTRATANTE,
} from "@/lib/contratantes/contratantesDados";

const CASE_ID = "IFV1-F3-C0045";
const CONSUMER = "contratantes";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const FOREIGN = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const USER = "f3-code-contratante-user";
const observations: Record<string, unknown>[] = [];
const operations = (call: Call, name: string) =>
  call.ops.filter(([operation]) => operation === name).map(([, args]) => args);

describe("F3 CODE C0045: preferência alimenta V101, mas autorização vem da Data API", () => {
  beforeEach(() => {
    m.calls.length = 0;
    m.handlers = {};
    sessionStorage.clear();
  });

  it("positive: organização vinculada lê contratantes somente via org e paginação", async () => {
    definirPreferenciaOrganizacao(USER, ORG);
    const selected = obterPreferenciaOrganizacao(USER);
    expect(selected).toBe(ORG);
    expect(obterPreferenciaOrganizacao("outro-usuario")).toBeNull();
    m.handlers.organizacoes = () => ({
      data: { id: ORG },
      error: null,
      status: 200,
    });
    m.handlers.contratantes = () => ({
      data: [
        {
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          razao_social: "Contratante F3",
          nome_fantasia: null,
          documento: null,
          tipo_pessoa: "juridica",
          situacao: "ativo",
          atualizado_em: null,
        },
      ],
      count: 1,
      error: null,
      status: 200,
    });
    await expect(verificarAcessoOrganizacao(selected!)).resolves.toBe(true);
    const result = await listarContratantes({
      idOrganizacao: selected!,
      pagina: 1,
      busca: "",
      situacao: "todos",
    });
    expect(result.total).toBe(1);
    expect(result.itens[0]?.razao_social).toBe("Contratante F3");
    expect(m.calls.map((c) => c.table)).toEqual(["organizacoes", "contratantes"]);
    const orgCall = m.calls[0]!;
    const tableCall = m.calls[1]!;
    expect(operations(orgCall, "eq")).toEqual([["id", ORG]]);
    expect(operations(tableCall, "select")).toEqual([[COLUNAS_CONTRATANTE, { count: "exact" }]]);
    expect(operations(tableCall, "eq")).toEqual([["id_organizacao", ORG]]);
    expect(operations(tableCall, "range")).toEqual([[0, 24]]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "positive",
      testId: "src/test/f3-code-case-0045.test.ts:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 200, table: CONSUMER, fixture: true },
      readback: { matched: true, isolatedOrgId: ORG, count: 1 },
    });
  });

  it("negative: preferência estrangeira não concede leitura, Data API nega sem consultar dados", async () => {
    definirPreferenciaOrganizacao(USER, ORG);
    expect(obterPreferenciaOrganizacao("outro-usuario")).toBeNull();
    m.handlers.organizacoes = () => ({
      data: null,
      error: { code: "42501", message: "Negado" },
      status: 403,
    });
    await expect(verificarAcessoOrganizacao(FOREIGN)).rejects.toMatchObject({
      tipo: "negado",
    });
    expect(m.calls.map((c) => c.table)).toEqual(["organizacoes"]);
    expect(operations(m.calls[0]!, "eq")).toEqual([["id", FOREIGN]]);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "negative",
      testId: "src/test/f3-code-case-0045.test.ts:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "GET", status: 403, table: CONSUMER, fixture: true },
      readback: { outcome: "DENY", foreignOrgId: FOREIGN, noForeignRows: true },
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0045_OBSERVATIONS;
    if (target) {
      expect(observations).toHaveLength(2);
      expect(observations.map((x) => x.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

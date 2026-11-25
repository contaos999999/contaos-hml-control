/** F5.1 SYS04 data reads through production query builders and synthetic transport. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { listarFontes } from "@/lib/contratos/baseNormativaDados";
import { listarPropostas } from "@/lib/contratos/orcamentoDados";
import { listarListas } from "@/lib/contratos/regrasDados";
import { listarDocumentos, FILTROS_VAZIOS } from "@/lib/contratos/documentosDados";
import { obterDocumento, listarVersoes } from "@/lib/contratos/documentoDetalheDados";
import { listarCompetencias, FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const boundary = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: boundary }));

const uuid = (side: "a" | "b", slot: number) =>
  `${side}7000000-0000-4000-8000-${String(slot).padStart(12, "0")}`;
const scope = (side: "a" | "b", org: string, actor: string) => ({
  org,
  actor,
  contract: uuid(side, 1),
  competence: uuid(side, 2),
  row: uuid(side, 3),
  document: uuid(side, 4),
  version: uuid(side, 5),
  file: uuid(side, 6),
  packageId: uuid(side, 7),
  label: side.toUpperCase() + "-F5",
});
const A = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
);
const B = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
);
type Scope = typeof A;
type Row = { id: string };
type Filter = [column: string, value: unknown];
type Reply = { data: unknown; error: { code: string } | null; status: number; count: number };
type Step = { table: string; eq: Filter[]; in?: Filter[]; single?: boolean; response: Reply };
type DataCase = {
  id: string;
  table: string;
  expectedError: "negado" | "sem_permissao";
  requests: (s: Scope) => Step[];
  load: (s: Scope) => Promise<Row>;
};
const contractFilter = (s: Scope): Filter[] => [["id_contrato", s.contract]];
const organizationFilter = (s: Scope): Filter[] => [["id_organizacao", s.org]];
const competenceFilter = (s: Scope): Filter[] => [
  ["id_competencia", s.competence],
  ...organizationFilter(s),
  ...contractFilter(s),
];
const fields = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.contract });
const document = (s: Scope) => ({
  ...fields(s),
  id: s.document,
  titulo: s.label,
  tipo: "contrato",
  versao_atual: 1,
});
const signal = () => new AbortController().signal;
const success = (data: unknown): Reply => ({ data, error: null, status: 200, count: 1 });
function one<T extends Row>(table: string, eq: Filter[], row: T, single = false): Step {
  return { table, eq, single, response: success(single ? row : [row]) };
}
const deny: Reply = { data: null, error: { code: "42501" }, status: 403, count: 0 };
const date = "2026-08-01T12:00:00Z";

function first<T extends Row>(page: { itens: T[]; total: number }): T {
  expect(page.total).toBe(1);
  expect(page.itens).toHaveLength(1);
  return page.itens[0]!;
}

const cases: DataCase[] = [
  {
    id: "0050",
    table: "contratos",
    expectedError: "negado",
    requests: (s) => [
      one(
        "contratos",
        [["id", s.contract]],
        { ...fields(s), id: s.contract, numero: s.label, situacao: "ativo" },
        true,
      ),
    ],
    load: (s) => obterContrato(s.contract, signal()),
  },
  {
    id: "0051",
    table: "fontes_normativas",
    expectedError: "negado",
    requests: (s) => [
      one("fontes_normativas", [...organizationFilter(s), ...contractFilter(s)], {
        ...fields(s),
        id: s.row,
        titulo: s.label,
        situacao: "ativa",
      }),
    ],
    load: async (s) =>
      first(
        await listarFontes(
          { org: s.org, contrato: s.contract, escopo: "contrato", situacao: "", pagina: 0 },
          signal(),
        ),
      ),
  },
  {
    id: "0052",
    table: "propostas_orcamentarias",
    expectedError: "negado",
    requests: (s) => [
      one("propostas_orcamentarias", contractFilter(s), {
        ...fields(s),
        id: s.row,
        titulo: s.label,
        situacao: "rascunho",
      }),
    ],
    load: async (s) => first(await listarPropostas(s.contract, 0, signal())),
  },
  {
    id: "0053",
    table: "listas_verificacao",
    expectedError: "negado",
    requests: (s) => [
      one("listas_verificacao", contractFilter(s), {
        ...fields(s),
        id: s.row,
        nome: s.label,
        situacao: "ativa",
        versao_atual: 2,
      }),
    ],
    load: async (s) => first(await listarListas(s.contract, 0, signal())),
  },
  {
    id: "0054",
    table: "documentos_contrato",
    expectedError: "negado",
    requests: (s) => [one("documentos_contrato", contractFilter(s), document(s))],
    load: async (s) => first(await listarDocumentos(s.contract, FILTROS_VAZIOS, 0, signal())),
  },
  {
    id: "0055",
    table: "documentos_contrato",
    expectedError: "negado",
    requests: (s) => [
      one("documentos_contrato", [["id", s.document], ...contractFilter(s)], document(s), true),
      one("versoes_documento", [["id_documento_contrato", s.document]], {
        id: s.version,
        id_documento_contrato: s.document,
        id_arquivo: s.file,
        numero_versao: 1,
      }),
      {
        table: "arquivos",
        eq: [],
        in: [["id", [s.file]]],
        response: success([{ id: s.file, status_seguranca: "aprovado" }]),
      },
    ],
    load: async (s) => {
      const doc = await obterDocumento(s.contract, s.document, signal());
      const versions = await listarVersoes(doc.id, 0, signal());
      expect(first(versions)).toMatchObject({ id: s.version, id_arquivo: s.file });
      expect(Object.keys(versions.arquivos)).toEqual([s.file]);
      expect(versions.arquivos[s.file]?.status_seguranca).toBe("aprovado");
      return doc;
    },
  },
  {
    id: "0056",
    table: "competencias",
    expectedError: "negado",
    requests: (s) => [
      one("competencias", contractFilter(s), {
        ...fields(s),
        id: s.competence,
        competencia_referencia: "2026-08-01",
        situacao: "rascunho",
      }),
    ],
    load: async (s) => first(await listarCompetencias(s.contract, FILTROS_COMPETENCIA_VAZIOS, 0)),
  },
  {
    id: "0062",
    table: "pareceres_internos",
    expectedError: "sem_permissao",
    requests: (s) => [
      one("pareceres_internos", competenceFilter(s), {
        ...fields(s),
        id: s.row,
        id_competencia: s.competence,
        versao: 1,
        texto: s.label,
        status: "aprovado",
        hash: "b".repeat(64),
        autor: null,
        criado_em: date,
        aprovado_por: null,
        aprovado_em: date,
      }),
    ],
    load: async (s) => first(await listarPareceres(s.competence, s.org, s.contract, 0, signal())),
  },
  {
    id: "0064",
    table: "apresentacoes_contratante",
    expectedError: "sem_permissao",
    requests: (s) => [
      one("apresentacoes_contratante", competenceFilter(s), {
        ...fields(s),
        id: s.row,
        id_competencia: s.competence,
        id_pacote: s.packageId,
        protocolo: s.label,
        forma_apresentacao: "eletronica",
        apresentado_em: date,
        tipo: "original",
        numero_rodada: 1,
      }),
    ],
    load: async (s) =>
      first(await listarApresentacoes(s.competence, s.org, s.contract, 0, signal())),
  },
  {
    id: "0065",
    table: "relatorios_historicos_contratante",
    expectedError: "negado",
    requests: (s) => [
      one("relatorios_historicos_contratante", [...contractFilter(s), ...organizationFilter(s)], {
        ...fields(s),
        id: s.row,
        id_arquivo: s.file,
        numero_documento: s.label,
        tipo: "relatorio",
        origem_temporal: "historico",
        status_processamento: "concluido",
        competencia_referencia: "2026-08-01",
        data_documento: null,
        resultado_geral: null,
        criado_em: date,
      }),
    ],
    load: async (s) => first(await listarRelatoriosHistoricos(s.contract, s.org, 0, signal())),
  },
];

const replies: Array<{ table: string; status: number; code: string | null }> = [];
function queue(steps: Step[]) {
  boundary.from.mockReset();
  replies.length = 0;
  for (const step of steps) {
    boundary.from.mockImplementationOnce((table: string) => {
      expect(table).toBe(step.table);
      const eq: Filter[] = [];
      const inFilter: Filter[] = [];
      const finish = (single: boolean) => {
        expect(eq).toEqual(step.eq);
        expect(inFilter).toEqual(step.in ?? []);
        expect(single).toBe(step.single ?? false);
        replies.push({
          table,
          status: step.response.status,
          code: step.response.error?.code ?? null,
        });
        return structuredClone(step.response);
      };
      const query = {
        select: () => query,
        order: () => query,
        range: () => query,
        abortSignal: () => query,
        eq: (...pair: Filter) => {
          eq.push(pair);
          return query;
        },
        in: (...pair: Filter) => {
          inFilter.push(pair);
          return query;
        },
        maybeSingle: async () => finish(true),
        then: (resolve: (response: Reply) => unknown, reject: (error: unknown) => unknown) =>
          Promise.resolve()
            .then(() => finish(false))
            .then(resolve, reject),
      };
      return query;
    });
  }
  boundary.from.mockImplementation(() => {
    throw Error("Excesso de consultas nesta prova");
  });
}

const observations: Record<string, unknown>[] = [];
function observe(c: DataCase, kind: "positive" | "negative", readback: Record<string, unknown>) {
  const actor = kind === "positive" ? A : B;
  observations.push({
    caseId: "IFV1-F5-C" + c.id,
    kind,
    mode: "CODE_FIXTURE",
    actor: actor.actor,
    role: "leitor",
    tenant: actor.org,
    target: A.org,
    frontier: c.table,
    operation: "read",
    decision: kind === "positive" ? "ALLOW" : "DENY",
    frontend: process.env["F5_FRONTEND_SHA"] ?? "",
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? "",
    job: process.env["JOB_ID"] ?? "",
    readback,
  });
}

async function ownResource(c: DataCase, s: Scope) {
  const steps = c.requests(s);
  queue(steps);
  const row = await c.load(s);
  const payload = steps[0]!.response.data;
  expect(row).toMatchObject(Array.isArray(payload) ? payload[0] : payload);
  expect(replies.map(({ table }) => table)).toEqual(steps.map(({ table }) => table));
  expect(boundary.rpc).not.toHaveBeenCalled();
  return row;
}

beforeEach(() => {
  sessionStorage.clear();
  boundary.rpc.mockReset().mockImplementation(() => {
    throw Error("RPC fora da prova de leitura");
  });
});

describe("F5 SYS04 data isolation", () => {
  for (const c of cases) {
    it(`IFV1-F5-C${c.id} positive: scoped query returns only the selected tenant material`, async () => {
      definirPreferenciaOrganizacao(A.actor, A.org);
      const row = await ownResource(c, A);
      const foreignVisible =
        JSON.stringify(row).includes(B.contract) || JSON.stringify(row).includes(B.org);
      expect(foreignVisible).toBe(false);
      observe(c, "positive", {
        selected: obterPreferenciaOrganizacao(A.actor),
        materialId: row.id,
        contractId: A.contract,
        foreignVisible,
        queries: replies.map(({ table }) => table),
      });
    });

    it(`IFV1-F5-C${c.id} negative: previous tenant data is denied without follow-on reads`, async () => {
      definirPreferenciaOrganizacao(A.actor, A.org);
      expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
      definirPreferenciaOrganizacao(B.actor, B.org);
      const own = await ownResource(c, B);
      const target = c.id === "0055" ? { ...A, contract: B.contract } : A;
      const [firstRequest] = c.requests(target);
      if (!firstRequest) throw Error("Prova sem consulta");
      queue([{ ...firstRequest, response: deny }]);
      let leaked: Row | null = null;
      const result = c.load(target).then((row) => {
        leaked = row;
        return row;
      });
      await expect(result).rejects.toMatchObject({ tipo: c.expectedError });
      expect(leaked).toBeNull();
      expect(replies).toEqual([{ table: c.table, status: 403, code: "42501" }]);
      expect(obterPreferenciaOrganizacao(B.actor)).toBe(B.org);
      expect(boundary.rpc).not.toHaveBeenCalled();
      observe(c, "negative", {
        selected: obterPreferenciaOrganizacao(B.actor),
        ownMaterialId: own.id,
        foreignVisible: leaked !== null,
        status: replies[0]?.status,
        code: replies[0]?.code,
        classified: c.expectedError,
        queries: replies.map(({ table }) => table),
        mutationCount: boundary.rpc.mock.calls.length,
      });
    });
  }
});

afterAll(() => {
  const file = process.env["F5_OBSERVATIONS"];
  if (file) {
    expect(observations).toHaveLength(cases.length * 2);
    writeFileSync(file, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

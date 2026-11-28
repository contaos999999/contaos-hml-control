/** CODE_FIXTURE: actual SYS04 preference and the four versioned competence adapters. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import {
  classificarErroVisaoGeral,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  classificarErroV115,
  obterDocumentosCompetencia,
  parseLeituraV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  classificarErroV116,
  FILTROS_VAZIOS,
  obterAnaliseCompetencia,
  OFFSETS_ZERO,
  parseAnaliseV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const transport = vi.hoisted(() => ({ rpc: vi.fn(), abortSignal: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: transport.rpc } }));

const backend = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
const contexts = {
  A: {
    actor: "a3333333-3333-4333-8333-333333333333",
    tenant: "a1111111-1111-4111-8111-111111111111",
    contract: "a6000000-0000-4000-8000-000000000001",
    competence: "a6000000-0000-4000-8000-000000000002",
    requirement: "a6000000-0000-4000-8000-000000000003",
    material: "a6000000-0000-4000-8000-000000000004",
  },
  B: {
    actor: "b3333333-3333-4333-8333-333333333333",
    tenant: "a2222222-2222-4222-8222-222222222222",
    contract: "b6000000-0000-4000-8000-000000000001",
    competence: "b6000000-0000-4000-8000-000000000002",
    requirement: "b6000000-0000-4000-8000-000000000003",
    material: "b6000000-0000-4000-8000-000000000004",
  },
};
type Context = (typeof contexts)["A"];
type Response = { data: unknown; error: unknown; status?: number };
type Material = {
  competencia: { id: string; competencia_referencia: string | null };
};
type Consumer = {
  id: string;
  rpc: string;
  args: (s: Context) => Record<string, unknown>;
  read: (s: Context, signal: AbortSignal) => PromiseLike<Response>;
  fixture: (s: Context) => unknown;
  parse: (data: unknown, s: Context) => Material | null;
  classify: (error: unknown, status?: number) => string;
  assertMaterial: (data: unknown, s: Context) => string | undefined;
};

const pag = (limite: number, total = 0) => ({ offset: 0, limite, total });
const competence = (s: Context) => ({
  id: s.competence,
  id_contrato: s.contract,
  id_organizacao: s.tenant,
  competencia_referencia: "2026-08-01",
  situacao: "pode_apresentar_contratante",
});
const competenceArg = (s: Context) => ({ p_id_competencia: s.competence });
const competenceIdentity = (s: Context) => ({
  id: s.competence,
  competencia_referencia: "2026-08-01",
});
const counts = {
  pendentes: 0,
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
};
const readonlyActions = { executar_analise: false, reanalisar: false, abrir_requisito: true };
const overview = {
  rpc: "obter_visao_geral_competencia",
  args: competenceArg,
  read: (s: Context, signal: AbortSignal) => obterVisaoGeral(s.competence, signal),
  fixture: (s: Context) => ({
    competencia: {
      ...competence(s),
      periodo_inicio: null,
      periodo_fim: null,
      data_limite: null,
      atualizado_em: null,
      percentual_conformidade: 100,
      versao_pacote_atual: 1,
      versao_registro: 2,
    },
    portao: { ...counts, liberado: true, total: 1, conformes_ou_na_validos: 1, percentual: 100 },
    blocking_summary: {
      ...counts,
      parecer_aprovado: true,
      analise_concluida_atual: true,
      aprovacao_apresentacao_atual: true,
    },
    allowed_actions: {
      abrir_documentos: true,
      analisar: false,
      abrir_parecer: true,
      apresentar: false,
    },
  }),
  parse: parseVisaoGeral,
  classify: classificarErroVisaoGeral,
};
const consumers: Consumer[] = [
  {
    ...overview,
    id: "0058",
    assertMaterial(data) {
      const parsed = parseVisaoGeral(data);
      expect(parsed?.portao).toMatchObject({ liberado: true, total: 1, avaliados: 1 });
      return parsed?.competencia.id;
    },
  },
  {
    id: "0059",
    rpc: "obter_documentos_competencia_v115",
    args: (s) => ({
      ...competenceArg(s),
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    }),
    read: (s, signal) => obterDocumentosCompetencia(s.competence, 0, 0, signal),
    fixture: (s) => ({
      schema_versao: "v115-v1",
      competencia: competence(s),
      estado_documental: "complete",
      resumo: {
        documentos_total: 1,
        requisitos_documentais_total: 0,
        requisitos_documentais_aplicaveis: 0,
        requisitos_documentais_pendentes: 0,
      },
      documentos: [{ id: s.material, tipo: "contrato", titulo: "Documento F5", situacao: "ativo" }],
      requisitos_documentais: [],
      documentos_paginacao: pag(25, 1),
      requisitos_paginacao: pag(25),
      capacidades: {
        pode_enviar: false,
        pode_nova_versao: false,
        motivo_nova_versao_obrigatorio: true,
      },
    }),
    parse: parseLeituraV115,
    classify: classificarErroV115,
    assertMaterial(data, s) {
      const parsed = parseLeituraV115(data);
      expect(parsed?.documentos.map((doc) => doc.id)).toEqual([s.material]);
      expect(parsed?.capacidades).toMatchObject({ pode_enviar: false, pode_nova_versao: false });
      return parsed?.documentos[0]?.id;
    },
  },
  {
    id: "0060",
    rpc: "obter_analise_competencia_v116",
    args: (s) => ({
      ...competenceArg(s),
      p_resultados_offset: 0,
      p_resultados_limite: 25,
      p_execucoes_offset: 0,
      p_execucoes_limite: 10,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
      p_filtro_resultado: null,
      p_filtro_criticidade: null,
      p_filtro_mecanismo: null,
      p_filtro_apontamento_status: null,
      p_busca: null,
    }),
    read: (s, signal) =>
      obterAnaliseCompetencia(s.competence, FILTROS_VAZIOS, OFFSETS_ZERO, signal),
    fixture: (s) => ({
      schema_versao: "v116-v1",
      competencia: competence(s),
      estado_analise: "complete",
      stale: false,
      percentual: 100,
      blocking_summary: { pendentes: 0 },
      allowed_actions: readonlyActions,
      execucao_atual: { id: s.material, status: "concluido" },
      mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
      resultados: [
        {
          id_resultado: s.material,
          id_requisito: s.requirement,
          mecanismo: "deterministico",
          resultado: "conforme",
          requisito: { criticidade: "alta", codigo: "REQ-F5" },
          evidencias: [],
        },
      ],
      resultados_paginacao: pag(25, 1),
      execucoes: [],
      execucoes_paginacao: pag(10),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    }),
    parse: parseAnaliseV116,
    classify: classificarErroV116,
    assertMaterial(data, s) {
      const parsed = parseAnaliseV116(data);
      expect(parsed?.resultados[0]).toMatchObject({
        id_resultado: s.material,
        id_requisito: s.requirement,
        resultado: "conforme",
      });
      expect(parsed?.allowed_actions.executar_analise).toBe(false);
      return parsed?.resultados[0]?.id_resultado;
    },
  },
  {
    id: "0061",
    rpc: "obter_detalhe_requisito_v117",
    args: (s) => ({
      ...competenceArg(s),
      p_id_requisito: s.requirement,
      p_evidencias_offset: 0,
      p_evidencias_limite: 25,
      p_historico_offset: 0,
      p_historico_limite: 25,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
    }),
    read: (s, signal) =>
      obterDetalheRequisito(s.competence, s.requirement, OFFSETS_DETALHE_ZERO, signal),
    fixture: (s) => ({
      schema_versao: "v117-v1",
      competencia: competence(s),
      requisito: { id: s.requirement, codigo: "REQ-F5", aplicavel: true },
      execucao_atual: null,
      resultado_atual: null,
      resultado_referencia: null,
      na_validade: null,
      allowed_actions: readonlyActions,
      evidencias: [],
      evidencias_paginacao: pag(25),
      historico: [],
      historico_paginacao: pag(25),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    }),
    parse: (data, s) => parseDetalheV117(data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO),
    classify: classificarErroV117,
    assertMaterial(data, s) {
      const parsed = parseDetalheV117(data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO);
      expect(parsed?.requisito).toMatchObject({ id: s.requirement, codigo: "REQ-F5" });
      expect(
        parseDetalheV117(data, s.competence, contexts.B.requirement, OFFSETS_DETALHE_ZERO),
      ).toBeNull();
      return parsed?.requisito.id;
    },
  },
  {
    ...overview,
    id: "0063",
    assertMaterial(data) {
      const parsed = parseVisaoGeral(data);
      expect(parsed?.portao.percentual).toBe(100);
      expect(parsed?.allowed_actions.apresentar).toBe(false);
      return parsed?.competencia.id;
    },
  },
];

const observations: Record<string, unknown>[] = [];
function observe(c: Consumer, kind: "positive" | "negative", readback: Record<string, unknown>) {
  const s = kind === "positive" ? contexts.A : contexts.B;
  observations.push({
    caseId: "IFV1-F5-C" + c.id,
    kind,
    mode: "CODE_FIXTURE",
    actor: s.actor,
    role: "leitor",
    tenant: s.tenant,
    target: contexts.A.tenant,
    frontier: c.rpc,
    operation: "read",
    decision: kind === "positive" ? "ALLOW" : "DENY",
    frontend: process.env["F5_FRONTEND_SHA"] ?? "",
    backend,
    harness: process.env["F5_HARNESS_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? "",
    job: process.env["JOB_ID"] ?? "",
    readback,
  });
}

async function read(c: Consumer, s: Context, response: Response) {
  const signal = new AbortController().signal;
  transport.rpc.mockClear();
  transport.abortSignal.mockClear().mockResolvedValueOnce(response);
  const observed = await c.read(s, signal);
  expect(transport.rpc.mock.calls).toEqual([[c.rpc, c.args(s)]]);
  expect(transport.abortSignal.mock.calls).toEqual([[signal]]);
  return observed;
}

beforeEach(() => {
  sessionStorage.clear();
  transport.rpc.mockReset().mockReturnValue({ abortSignal: transport.abortSignal });
  transport.abortSignal.mockReset();
});

describe("F5 SYS04 competence isolation", () => {
  for (const c of consumers) {
    it(`IFV1-F5-C${c.id} positive: material read in the selected tenant`, async () => {
      const s = contexts.A;
      definirPreferenciaOrganizacao(s.actor, s.tenant);
      expect(obterPreferenciaOrganizacao(s.actor)).toBe(s.tenant);
      const result = await read(c, s, { data: c.fixture(s), error: null, status: 200 });
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({ competencia: competence(s) });
      const parsed = c.parse(result.data, s);
      expect(parsed?.competencia).toMatchObject(competenceIdentity(s));
      const materialId = c.assertMaterial(result.data, s);
      expect(materialId).toBeTruthy();
      const foreignVisible = JSON.stringify(parsed).includes(contexts.B.competence);
      expect(foreignVisible).toBe(false);
      observe(c, "positive", {
        selected: obterPreferenciaOrganizacao(s.actor),
        materialId,
        competenceId: parsed?.competencia.id,
        organizationId: (result.data as { competencia: { id_organizacao: string } }).competencia
          .id_organizacao,
        foreignVisible,
      });
    });

    it(`IFV1-F5-C${c.id} negative: stale case is denied after switching identity`, async () => {
      const { A, B } = contexts;
      definirPreferenciaOrganizacao(A.actor, A.tenant);
      expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
      definirPreferenciaOrganizacao(B.actor, B.tenant);
      const own = await read(c, B, { data: c.fixture(B), error: null, status: 200 });
      expect(own.data).toMatchObject({ competencia: competence(B) });
      expect(c.parse(own.data, B)?.competencia).toMatchObject(competenceIdentity(B));
      const result = await read(c, A, { data: null, error: { code: "42501" }, status: 403 });
      const denial = c.classify(result.error, result.status);
      expect(denial).toBe("sem_permissao");
      expect(result.error).toEqual({ code: "42501" });
      expect(result.status).toBe(403);
      const leaked = c.parse(result.data, A);
      expect(leaked).toBeNull();
      expect(obterPreferenciaOrganizacao(B.actor)).toBe(B.tenant);
      observe(c, "negative", {
        selected: obterPreferenciaOrganizacao(B.actor),
        ownCompetenceId: c.parse(own.data, B)?.competencia.id,
        targetCompetenceId: A.competence,
        foreignVisible: leaked !== null,
        status: result.status,
        code: "42501",
        classified: denial,
        mutationCount: transport.rpc.mock.calls.filter(([name]) => name !== c.rpc).length,
      });
    });
  }
});

afterAll(() => {
  const file = process.env["F5_OBSERVATIONS"];
  if (file) {
    expect(observations).toHaveLength(consumers.length * 2);
    writeFileSync(file, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

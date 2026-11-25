/**
 * SYS04 -> competence RPCs. Actual preference, contract and competence
 * adapters, exact calls, real product parsers; local Supabase boundary fixture.
 */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), denied: "", actor: "master" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { listarCompetencias, FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";
import {
  obterVisaoGeral,
  parseVisaoGeral,
  classificarErroVisaoGeral,
  derivarEstadoVisual,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  obterDocumentosCompetencia,
  parseLeituraV115,
  classificarErroV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  obterAnaliseCompetencia,
  parseAnaliseV116,
  classificarErroV116,
  FILTROS_VAZIOS,
  OFFSETS_ZERO,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  obterDetalheRequisito,
  parseDetalheV117,
  classificarErroV117,
  OFFSETS_DETALHE_ZERO,
} from "@/lib/competencias/requisitoDetalheDados";

const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CONTRACT = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const COMP = "a9999999-9999-4999-8999-999999999999";
const REQ = "b1111111-1111-4111-8111-111111111111";
const ROW = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const SOURCE = "src/test/f3-code-sys04-competence-rpc.test.ts";
const cases = [
  {
    caseId: "IFV1-F3-C0058",
    destination: "V114",
    rpc: "obter_visao_geral_competencia",
  },
  {
    caseId: "IFV1-F3-C0059",
    destination: "V115",
    rpc: "obter_documentos_competencia_v115",
  },
  {
    caseId: "IFV1-F3-C0060",
    destination: "V116",
    rpc: "obter_analise_competencia_v116",
  },
  {
    caseId: "IFV1-F3-C0061",
    destination: "V117",
    rpc: "obter_detalhe_requisito_v117",
  },
  {
    caseId: "IFV1-F3-C0063",
    destination: "V119",
    rpc: "obter_visao_geral_competencia",
  },
];
type Case = (typeof cases)[number];
const observations: Record<string, unknown>[] = [];
const calls: Array<{ table: string; filters: unknown[][] }> = [];
const pag = (limite: number, total = 0) => ({ offset: 0, limite, total });
const competence = {
  id: COMP,
  id_contrato: CONTRACT,
  id_organizacao: ORG,
  competencia_referencia: "2026-01-01",
  situacao: "pode_apresentar_contratante",
};
const action = () => ({
  executar_analise: m.actor === "master",
  reanalisar: m.actor === "master",
  abrir_requisito: true,
});
const ok = (data: unknown, count = 1) => ({ data, error: null, status: 200, count });
function response(name: string, args: Record<string, unknown>) {
  if (args["p_id_competencia"] !== COMP) throw new Error("wrong competence");
  if (name === m.denied) return { data: null, error: { code: "42501" }, status: 403 };
  switch (name) {
    case "obter_visao_geral_competencia": {
      const counts = {
        pendentes: 0,
        nao_conformes: 0,
        inconclusivos: 0,
        em_analise: 0,
        nao_conformidades_bloqueantes: 0,
      };
      return ok({
        competencia: {
          ...competence,
          periodo_inicio: null,
          periodo_fim: null,
          data_limite: null,
          atualizado_em: null,
          percentual_conformidade: 100,
          versao_pacote_atual: 1,
          versao_registro: 1,
        },
        portao: {
          ...counts,
          liberado: true,
          total: 1,
          conformes_ou_na_validos: 1,
          percentual: 100,
        },
        blocking_summary: {
          ...counts,
          parecer_aprovado: true,
          analise_concluida_atual: true,
          aprovacao_apresentacao_atual: true,
        },
        allowed_actions: {
          abrir_documentos: true,
          analisar: m.actor === "master",
          abrir_parecer: true,
          apresentar: m.actor === "master",
        },
      });
    }
    case "obter_documentos_competencia_v115":
      return ok({
        schema_versao: "v115-v1",
        competencia: competence,
        estado_documental: "complete",
        resumo: {
          documentos_total: 1,
          requisitos_documentais_total: 0,
          requisitos_documentais_aplicaveis: 0,
          requisitos_documentais_pendentes: 0,
        },
        documentos: [{ id: ROW, tipo: "contrato", titulo: "Documento F3", situacao: "ativo" }],
        requisitos_documentais: [],
        documentos_paginacao: pag(25, 1),
        requisitos_paginacao: pag(25),
        capacidades: {
          pode_enviar: m.actor === "master",
          pode_nova_versao: m.actor === "master",
          motivo_nova_versao_obrigatorio: true,
        },
      });
    case "obter_analise_competencia_v116":
      return ok({
        schema_versao: "v116-v1",
        competencia: competence,
        estado_analise: "complete",
        stale: false,
        percentual: 100,
        blocking_summary: { pendentes: 0 },
        allowed_actions: action(),
        execucao_atual: { id: ROW, status: "concluido" },
        mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
        resultados: [
          {
            id_resultado: ROW,
            id_requisito: REQ,
            mecanismo: "deterministico",
            resultado: "conforme",
            requisito: { criticidade: "alta", codigo: "F3" },
            evidencias: [],
          },
        ],
        resultados_paginacao: pag(25, 1),
        execucoes: [],
        execucoes_paginacao: pag(10),
        apontamentos: [],
        apontamentos_paginacao: pag(25),
      });
    case "obter_detalhe_requisito_v117":
      if (args["p_id_requisito"] !== REQ) throw new Error("wrong requirement");
      return ok({
        schema_versao: "v117-v1",
        competencia: competence,
        requisito: { id: REQ, codigo: "F3", aplicavel: true },
        execucao_atual: null,
        resultado_atual: null,
        resultado_referencia: null,
        na_validade: null,
        allowed_actions: action(),
        evidencias: [],
        evidencias_paginacao: pag(25),
        historico: [],
        historico_paginacao: pag(25),
        apontamentos: [],
        apontamentos_paginacao: pag(25),
      });
    default:
      throw new Error("unexpected RPC " + name);
  }
}
async function selectContext(user: string) {
  definirPreferenciaOrganizacao(user, ORG);
  const org = obterPreferenciaOrganizacao(user);
  expect(org).toBe(ORG);
  if (!org) throw new Error("missing preference");
  const contracts = await listarContratos({ idOrganizacao: org, pagina: 1 });
  expect(contracts.itens).toHaveLength(1);
  const contract = contracts.itens[0];
  expect(contract!.id_organizacao).toBe(org);
  expect(calls.at(-1)?.filters).toEqual([["id_organizacao", org]]);
  const comp = await listarCompetencias(contract!.id, FILTROS_COMPETENCIA_VAZIOS, 0);
  expect(comp.itens).toHaveLength(1);
  expect(calls.at(-1)?.filters).toEqual([["id_contrato", contract!.id]]);
  expect(comp.itens[0]!.id).toBe(COMP);
  return { org, contract: contract!.id, competence: comp.itens[0]!.id };
}
async function consume(c: Case, id: string, denied: boolean) {
  const signal = new AbortController().signal;
  if (c.destination === "V114" || c.destination === "V119") {
    const res = await obterVisaoGeral(id, signal);
    expect(m.rpc).toHaveBeenLastCalledWith(c.rpc, { p_id_competencia: id });
    if (denied) {
      expect(classificarErroVisaoGeral(res.error, res.status)).toBe("sem_permissao");
      expect(parseVisaoGeral(res.data)).toBeNull();
      return null;
    }
    expect(res.error).toBeNull();
    const parsed = parseVisaoGeral(res.data);
    expect(parsed?.competencia).toMatchObject({ id, id_organizacao: ORG, id_contrato: CONTRACT });
    if (!parsed) throw new Error("invalid overview");
    expect(parsed.portao.avaliados).toBe(1);
    if (c.destination === "V119") {
      expect(derivarEstadoVisual(parsed)).toBe("ready");
      expect(parsed.allowed_actions.apresentar).toBe(m.actor === "master");
    }
    return parsed.competencia.id;
  }
  if (c.destination === "V115") {
    const res = await obterDocumentosCompetencia(id, 0, 0, signal);
    expect(m.rpc).toHaveBeenLastCalledWith(c.rpc, {
      p_id_competencia: id,
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    });
    if (denied) {
      expect(classificarErroV115(res.error, res.status)).toBe("sem_permissao");
      expect(parseLeituraV115(res.data)).toBeNull();
      return null;
    }
    expect(res.error).toBeNull();
    const parsed = parseLeituraV115(res.data);
    expect(parsed?.competencia).toMatchObject({ id, id_organizacao: ORG, id_contrato: CONTRACT });
    expect(parsed?.documentos[0]!.id).toBe(ROW);
    expect(parsed?.capacidades.pode_enviar).toBe(m.actor === "master");
    return parsed?.competencia.id;
  }
  const analysis = await obterAnaliseCompetencia(id, FILTROS_VAZIOS, OFFSETS_ZERO, signal);
  const analysisArgs = {
    p_id_competencia: id,
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
  };
  expect(m.rpc).toHaveBeenLastCalledWith("obter_analise_competencia_v116", analysisArgs);
  if (c.destination === "V116" && denied) {
    expect(classificarErroV116(analysis.error, analysis.status)).toBe("sem_permissao");
    expect(parseAnaliseV116(analysis.data)).toBeNull();
    return null;
  }
  expect(analysis.error).toBeNull();
  const parsed = parseAnaliseV116(analysis.data);
  expect(parsed?.competencia.id).toBe(id);
  expect(parsed?.resultados[0]!.id_requisito).toBe(REQ);
  expect(parsed?.mecanismos?.deterministico).toBe(1);
  expect(parsed?.allowed_actions.executar_analise).toBe(m.actor === "master");
  if (!parsed) throw new Error("invalid analysis");
  if (c.destination === "V116") return parsed.competencia.id;
  const requirement = parsed.resultados[0]!.id_requisito;
  const detail = await obterDetalheRequisito(id, requirement, OFFSETS_DETALHE_ZERO, signal);
  expect(m.rpc).toHaveBeenLastCalledWith(c.rpc, {
    p_id_competencia: id,
    p_id_requisito: requirement,
    p_evidencias_offset: 0,
    p_evidencias_limite: 25,
    p_historico_offset: 0,
    p_historico_limite: 25,
    p_apontamentos_offset: 0,
    p_apontamentos_limite: 25,
  });
  if (denied) {
    expect(classificarErroV117(detail.error, detail.status)).toBe("sem_permissao");
    expect(parseDetalheV117(detail.data, id, requirement, OFFSETS_DETALHE_ZERO)).toBeNull();
    return null;
  }
  expect(detail.error).toBeNull();
  const checked = parseDetalheV117(detail.data, id, requirement, OFFSETS_DETALHE_ZERO);
  expect(checked?.requisito.id).toBe(requirement);
  expect(checked?.competencia.id).toBe(id);
  expect(parseDetalheV117(detail.data, id, ROW, OFFSETS_DETALHE_ZERO)).toBeNull();
  return checked?.competencia.id;
}
describe("SYS04 -> five competence RPC contracts", () => {
  beforeEach(() => {
    sessionStorage.clear();
    calls.length = 0;
    m.rpc.mockReset();
    m.from.mockReset();
    m.denied = "";
    m.actor = "master";
    m.rpc.mockImplementation((name: string, args: Record<string, unknown>) => ({
      abortSignal: () => Promise.resolve(response(name, args)),
    }));
    m.from.mockImplementation((table: string) => {
      const call = { table, filters: [] as unknown[][] };
      calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const method of ["select", "order", "range"]) builder[method] = () => builder;
      builder["eq"] = (...args: unknown[]) => {
        call.filters.push(args);
        return builder;
      };
      builder["then"] = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => {
            if (table === "contratos") return ok([{ id: CONTRACT, id_organizacao: ORG }]);
            if (table === "competencias") return ok([competence]);
            throw new Error("unexpected table");
          })
          .then(resolve, reject);
      return builder;
    });
  });
  for (const c of cases) {
    it(c.caseId + " positive: real RPC and parser for both local roles", async () => {
      for (const role of ["master", "leitor"]) {
        m.actor = role;
        const ctx = await selectContext(role);
        expect(await consume(c, ctx.competence, false)).toBe(COMP);
      }
      observations.push({
        caseId: c.caseId,
        consumer: c.rpc,
        producerOrder: 3,
        kind: "positive",
        testId: SOURCE + ":" + c.caseId + ":positive",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
        producerEntityId: ORG,
        network: { method: "POST", status: 200, rpc: c.rpc, fixture: true },
        readback: {
          matched: true,
          destination: c.destination,
          contractId: CONTRACT,
          competenceId: COMP,
          authorizedLocalIdentities: 2,
        },
      });
    });
    it(c.caseId + " negative: preference cannot override RPC denial", async () => {
      m.actor = "outsider";
      const ctx = await selectContext("outsider");
      expect(obterPreferenciaOrganizacao("unrelated")).toBeNull();
      m.denied = c.rpc;
      expect(await consume(c, ctx.competence, true)).toBeNull();
      observations.push({
        caseId: c.caseId,
        consumer: c.rpc,
        producerOrder: 3,
        kind: "negative",
        testId: SOURCE + ":" + c.caseId + ":negative",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
        producerEntityId: ORG,
        network: { method: "POST", status: 403, rpc: c.rpc, fixture: true },
        readback: {
          outcome: "DENY",
          destination: c.destination,
          contractId: CONTRACT,
          competenceId: COMP,
          preferenceNotAuthorization: true,
        },
      });
    });
  }
  afterAll(() => {
    const path = process.env["F3_CODE_SYS04_COMPETENCE_RPC_OBSERVATIONS"];
    if (path) {
      expect(observations).toHaveLength(cases.length * 2);
      writeFileSync(path, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

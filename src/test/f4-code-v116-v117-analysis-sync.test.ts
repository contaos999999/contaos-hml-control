/** V116/V117 real producer wrappers and consumer parsers; local, stateful CODE fixture. */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import {
  solicitarAnaliseCompetencia,
  obterAnaliseCompetencia,
  parseAnaliseV116,
  FILTROS_VAZIOS,
  OFFSETS_ZERO,
  classificarErroV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  obterContextoRevisao,
  montarRevisao,
  registrarRevisao,
  listarEvidencias,
  type ComandoRevisao,
} from "@/lib/competencias/revisaoRequisitoDados";
import {
  obterDetalheRequisito,
  parseDetalheV117,
  OFFSETS_DETALHE_ZERO,
  classificarErroV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  obterVisaoGeral,
  parseVisaoGeral,
  classificarErroVisaoGeral,
  derivarEstadoVisual,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
const ORG = "c1600000-0000-4000-8000-000000000001",
  CONTRACT = "c1600000-0000-4000-8000-000000000002",
  COMP = "c1600000-0000-4000-8000-000000000003",
  REQ = "c1600000-0000-4000-8000-000000000004",
  OLD = "c1600000-0000-4000-8000-000000000005",
  EXEC = "c1600000-0000-4000-8000-000000000006",
  OLD_RESULT = "c1600000-0000-4000-8000-000000000007",
  RESULT = "c1600000-0000-4000-8000-000000000008",
  VERSION = "c1600000-0000-4000-8000-000000000009",
  EVIDENCE = "c1600000-0000-4000-8000-000000000010",
  EVENT = "c1600000-0000-4000-8000-000000000011",
  KEY = "c1600000-0000-4000-8000-000000000012";
const OLD_HASH = "a".repeat(64),
  HASH = "b".repeat(64),
  JUST = "Justificativa F4 documentada",
  FUND = "Fundamento F4";
const cases = [
  {
    caseId: "IFV1-F4-C0433",
    order: 16,
    destination: "V114",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0437",
    order: 16,
    destination: "V117",
    consumer: "obter_detalhe_requisito_v117",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0439",
    order: 16,
    destination: "V118",
    consumer: "pareceres_internos",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0441",
    order: 16,
    destination: "V119",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0443",
    order: 16,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0455",
    order: 17,
    destination: "V114",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0458",
    order: 17,
    destination: "V116",
    consumer: "obter_analise_competencia_v116",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0461",
    order: 17,
    destination: "V118",
    consumer: "pareceres_internos",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0463",
    order: 17,
    destination: "V119",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0465",
    order: 17,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
];
type Case = (typeof cases)[number];
let actor = "master",
  order = 16,
  writes = 0,
  execId = OLD,
  resultId = OLD_RESULT,
  hash = OLD_HASH,
  stale = true,
  review = false,
  queued = false;
let evidence: Record<string, unknown>[] = [];
let event: Record<string, unknown> | null = null;
let revision: ComandoRevisao | undefined;
const observations: Record<string, unknown>[] = [];
const ok = (data: unknown, count = 0) => ({ data: structuredClone(data), error: null, status: 200, count });
let receipt:{payload:string,response:unknown}|null=null;
let transportFailure=false;
const RETRY="c1600000-0000-4000-8000-000000000099";
const deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
const pag = (limite: number, total = 0) => ({ offset: 0, limite, total });
const cmd = () =>
  order === 16 ? "solicitar_analise_competencia" : "registrar_revisao_requisito_v117";
function materialize() {
  // Local fixture transition represents the backend response after the queued job.
  queued = false;
  stale = false;
  resultId = RESULT;
  evidence = [
    {
      id: EVIDENCE,
      pagina: 1,
      trecho: "Trecho F4",
      tipo_evidencia: "documento",
      hash: HASH,
      documento: {
        id_versao_documento: VERSION,
        numero_versao: 2,
        hash_versao: HASH,
        status_seguranca: "aprovado",
      },
    },
  ];
}
function record() {
  event = {
    id: EVENT,
    criado_em: "2026-11-01T12:00:00Z",
    evento: cmd(),
    entidade: order === 16 ? "execucoes_analise" : "resultados_requisito",
    origem: "rpc",
    id_usuario: null,
    id_entidade: order === 16 ? EXEC : RESULT,
    correlation_id: KEY,
  };
}
function rpc(name: string, args: Record<string, unknown>) {
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args["p_id_organizacao"] === ORG);
  if (actor === "outsider" || args["p_id_competencia"] !== COMP) return deny();
  if (name === "solicitar_analise_competencia") {
    if (actor !== "master") return deny();
    if(transportFailure)throw Error("synthetic outage before queue commit");
    if(queued || writes!==0)return {data:null,error:{code:"PT409"},status:409};
    if(args["p_tipo"]!=="completa")throw Error("unexpected analysis command");
    writes++;
    execId = EXEC;
    hash = HASH;
    queued = true;
    record();
    return ok(EXEC);
  }
  if (name === "obter_contexto_revisao_v117") {
    if (args["p_id_requisito"] !== REQ) return deny();
    return ok({
      schema_versao: "revisao-v117",
      id_competencia: COMP,
      id_requisito: REQ,
      id_organizacao: ORG,
      id_contrato: CONTRACT,
      id_execucao_esperada: execId,
      id_resultado_esperado: resultId,
      hash_esperado: hash,
      pode_revisar: actor === "master",
    });
  }
  if (name === "registrar_revisao_requisito_v117") {
    if (actor !== "master") return deny();
    if(transportFailure)throw Error("synthetic outage before review commit");
    const payload=JSON.stringify(args);
    if(receipt && args["p_request_id"]===KEY)return receipt.payload===payload?ok(receipt.response):{data:null,error:{code:"PT409"},status:409};
    if (
      args["p_id_execucao_esperada"] !== execId ||
      args["p_id_resultado_esperado"] !== resultId ||
      args["p_hash_esperado"] !== hash
    )
      return { data: null, error: { code: "PT409" }, status: 409 };
    if (
      args["p_id_requisito"] !== REQ ||
      args["p_resultado"] !== "conforme" ||
      args["p_justificativa"] !== JUST ||
      args["p_fundamento"] !== FUND ||
      args["p_request_id"] !== KEY
    )
      throw new Error("wrong revision");
    const items = args["p_evidencias"] as Record<string, unknown>[];
    if (
      items.length !== 1 ||
      items[0]!["id_versao_documento"] !== VERSION ||
      items[0]!["pagina"] !== 1
    )
      throw new Error("wrong evidence");
    writes++;
    review = true;
    execId = EXEC;
    hash = HASH;
    materialize();
    record();
    const result={
      schema_versao: "revisao-v117",
      request_id: KEY,
      id_competencia: COMP,
      id_requisito: REQ,
      id_execucao: EXEC,
      id_resultado: RESULT,
    };
    receipt={payload,response:structuredClone(result)};
    return ok(result);
  }
  const competence = {
    id: COMP,
    id_contrato: CONTRACT,
    id_organizacao: ORG,
    competencia_referencia: "2026-11-01",
    situacao: queued ? "em_analise" : "pendente_correcao",
  };
  const counts = {
    pendentes: 1,
    nao_conformes: 0,
    inconclusivos: 0,
    em_analise: queued ? 1 : 0,
    nao_conformidades_bloqueantes: 0,
  };
  const execution = { id: execId, status: queued ? "pendente" : "concluido", hash_entrada: hash };
  const result = {
    id: resultId,
    id_execucao: execId,
    resultado: "conforme",
    mecanismo: review ? "humano" : "deterministico",
    justificativa: review ? JUST : "Análise F4",
    fundamento: review ? FUND : "Fonte F4",
    hash_evidencias: hash,
  };
  const actions = {
    executar_analise: actor === "master",
    reanalisar: actor === "master",
    abrir_requisito: true,
  };
  if (name === "obter_visao_geral_competencia")
    return ok({
      competencia: {
        ...competence,
        periodo_inicio: null,
        periodo_fim: null,
        data_limite: null,
        atualizado_em: null,
        percentual_conformidade: 50,
        versao_pacote_atual: null,
        versao_registro: 2,
      },
      portao: { ...counts, liberado: false, total: 2, conformes_ou_na_validos: 1, percentual: 50 },
      blocking_summary: {
        ...counts,
        parecer_aprovado: false,
        analise_concluida_atual: !stale && !queued,
        aprovacao_apresentacao_atual: false,
      },
      allowed_actions: {
        abrir_documentos: true,
        analisar: actor === "master",
        abrir_parecer: true,
        apresentar: false,
      },
    });
  if (name === "obter_analise_competencia_v116")
    return ok({
      schema_versao: "v116-v1",
      competencia: competence,
      estado_analise: queued ? "queued" : stale ? "stale" : "complete",
      stale: stale && !queued,
      percentual: 50,
      blocking_summary: counts,
      allowed_actions: actions,
      execucao_atual: execution,
      mecanismos: {
        deterministico: review ? 0 : 1,
        semantico: 0,
        humano: review ? 1 : 0,
        nao_identificado: 0,
      },
      resultados: queued
        ? []
        : [
            {
              ...result,
              id_resultado: resultId,
              id_requisito: REQ,
              requisito: { codigo: "F4", criticidade: "alta" },
              evidencias: evidence,
            },
          ],
      resultados_paginacao: pag(25, queued ? 0 : 1),
      execucoes: [execution],
      execucoes_paginacao: pag(10, 1),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  if (name === "obter_detalhe_requisito_v117") {
    if (args["p_id_requisito"] !== REQ) return deny();
    return ok({
      schema_versao: "v117-v1",
      competencia: competence,
      requisito: { id: REQ, codigo: "F4", aplicavel: true },
      execucao_atual: execution,
      resultado_atual: result,
      resultado_referencia: result,
      na_validade: null,
      allowed_actions: actions,
      evidencias: evidence,
      evidencias_paginacao: pag(25, evidence.length),
      historico: [
        {
          id_resultado: OLD_RESULT,
          id_execucao: OLD,
          resultado: "inconclusivo",
          hash_entrada: OLD_HASH,
        },
      ],
      historico_paginacao: pag(25, 1),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  }
  throw new Error("unexpected RPC " + name);
}
function data(table: string, filters: unknown[][]) {
  const has = (k: string, v: string) => filters.some(([key, value]) => key === k && value === v);
  if (actor === "outsider" || !has("id_organizacao", ORG)) return deny();
  if (table === "eventos_auditoria") {
    if (actor !== "master") return deny();
    const found = event && has("correlation_id", KEY) ? [event] : [];
    return ok(found, found.length);
  }
  if (!has("id_contrato", CONTRACT)) return deny();
  if (table === "versoes_documento") {
    if (
      !has("documentos_competencia.id_competencia", COMP) ||
      !has("arquivos.status_seguranca", "aprovado")
    )
      throw new Error("wrong evidence scope");
    return ok(
      [
        {
          id: VERSION,
          numero_versao: 2,
          id_organizacao: ORG,
          id_contrato: CONTRACT,
          documentos_competencia: { id_competencia: COMP, titulo: "F4", situacao: "ativo" },
          arquivos: { nome_original: "f4.pdf", status_seguranca: "aprovado" },
        },
      ],
      1,
    );
  }
  if (table === "pareceres_internos") {
    if (!has("id_competencia", COMP)) return deny();
    // A fresh analysis/review invalidates any current approval; no new opinion yet.
    return ok([], 0);
  }
  throw new Error("unexpected table " + table);
}
async function analysis() {
  const r = await obterAnaliseCompetencia(
    COMP,
    FILTROS_VAZIOS,
    OFFSETS_ZERO,
    new AbortController().signal,
  );
  expect(m.rpc).toHaveBeenLastCalledWith(
    "obter_analise_competencia_v116",
    expect.objectContaining({ p_id_competencia: COMP }),
  );
  const v = parseAnaliseV116(r.data);
  expect(v?.competencia.id).toBe(COMP);
  if (!v) throw new Error("invalid analysis");
  return v;
}
async function produce(c: Case) {
  actor = "master";
  order = c.order;
  const old = await analysis();
  expect(old.execucao_atual?.id).toBe(OLD);
  expect(old.execucao_atual?.hash_entrada).toBe(OLD_HASH);
  if (c.order === 16) {
    const id = await solicitarAnaliseCompetencia(COMP, "completa");
    expect(id).toBe(EXEC);
    expect(m.rpc).toHaveBeenLastCalledWith(cmd(), { p_id_competencia: COMP, p_tipo: "completa" });
    const pending = await analysis();
    expect(pending.estado_analise).toBe("queued");
    expect(pending.execucao_atual?.id).toBe(id);
    expect(pending.resultados).toEqual([]);
    await expect(solicitarAnaliseCompetencia(COMP,"completa")).rejects.toThrow();
    expect(await analysis()).toEqual(pending);
    materialize();
  } else {
    const ctx = await obterContextoRevisao(COMP, REQ, ORG);
    expect(ctx).toMatchObject({
      id_contrato: CONTRACT,
      id_execucao_esperada: OLD,
      id_resultado_esperado: OLD_RESULT,
      hash_esperado: OLD_HASH,
    });
    const page = await listarEvidencias(ctx, 0);
    expect(page.itens).toEqual([{ id: VERSION, nome: "f4.pdf", versao: 2 }]);
    revision = montarRevisao(
      ctx,
      {
        resultado: "conforme",
        justificativa: JUST,
        fundamento: FUND,
        evidencias: [{ id_versao_documento: page.itens[0]!.id, pagina: 1, trecho: "Trecho F4" }],
      },
      KEY,
    );
    await registrarRevisao(revision);
    expect(m.rpc).toHaveBeenLastCalledWith(cmd(), revision);
    await registrarRevisao(revision);
    await expect(registrarRevisao({...revision,p_request_id:RETRY})).rejects.toMatchObject({tipo:"conflito"});
    await expect(registrarRevisao({...revision,p_justificativa:JUST+" divergente"})).rejects.toMatchObject({tipo:"conflito"});
  }
  const next = await analysis();
  expect(next.estado_analise).toBe("complete");
  expect(next.stale).toBe(false);
  expect(next.execucao_atual).toMatchObject({ id: EXEC, hash_entrada: HASH });
  expect(next.resultados[0]).toMatchObject({
    id_resultado: RESULT,
    id_requisito: REQ,
    mecanismo: c.order === 17 ? "humano" : "deterministico",
    evidencias: [{ id: EVIDENCE, pagina: 1, trecho: "Trecho F4" }],
  });
  expect(writes).toBe(1);
  return {old,next,id:c.order===16?EXEC:RESULT};
}
async function consume(c: Case, negative: boolean) {
  const signal = new AbortController().signal;
  if (c.destination === "V123") {
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const p = obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0, correlationId: KEY });
    if (negative) {
      await expect(p).rejects.toThrow("Acesso não autorizado");
      return null;
    }
    const v = await p;
    expect(v.total).toBe(1);
    expect(v.eventos[0]).toMatchObject({
      id: EVENT,
      id_entidade: c.order === 16 ? EXEC : RESULT,
      correlation_id: KEY,
      evento: cmd(),
    });
    return {
      eventId: v.eventos[0]!.id,
      entity: v.eventos[0]!.id_entidade,
      correlation: v.eventos[0]!.correlation_id,
    };
  }
  if (c.destination === "V118") {
    const p = listarPareceres(COMP, ORG, CONTRACT, 0, signal);
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "sem_permissao" });
      return null;
    }
    const v = await p;
    expect(v.itens).toEqual([]);
    expect(v.total).toBe(0);
    return { scope: COMP, opinions: v.total };
  }
  if (c.destination === "V116") {
    const r = await obterAnaliseCompetencia(COMP, FILTROS_VAZIOS, OFFSETS_ZERO, signal);
    if (negative) {
      expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
      expect(parseAnaliseV116(r.data)).toBeNull();
      return null;
    }
    const v = parseAnaliseV116(r.data);
    expect(v?.execucao_atual).toMatchObject({ id: EXEC, hash_entrada: HASH });
    expect(v?.resultados[0]).toMatchObject({
      id_resultado: RESULT,
      id_requisito: REQ,
      mecanismo: "humano",
      justificativa: JUST,
      fundamento: FUND,
      evidencias: [{ id: EVIDENCE }],
    });
    return {
      scope: v?.competencia.id,
      execution: v?.execucao_atual?.id,
      result: v?.resultados[0]!.id_resultado,
      justification: v?.resultados[0]!.justificativa,
      evidence: v?.resultados[0]!.evidencias[0]!.id,
    };
  }
  if (c.destination === "V117") {
    const r = await obterDetalheRequisito(COMP, REQ, OFFSETS_DETALHE_ZERO, signal);
    expect(m.rpc).toHaveBeenLastCalledWith(
      c.consumer,
      expect.objectContaining({ p_id_competencia: COMP, p_id_requisito: REQ }),
    );
    if (negative) {
      expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
      expect(parseDetalheV117(r.data, COMP, REQ, OFFSETS_DETALHE_ZERO)).toBeNull();
      return null;
    }
    const v = parseDetalheV117(r.data, COMP, REQ, OFFSETS_DETALHE_ZERO);
    expect(v?.execucao_atual).toMatchObject({ id: EXEC, hash_entrada: HASH });
    expect(v?.resultado_atual).toMatchObject({ id: RESULT, id_execucao: EXEC });
    expect(v?.evidencias[0]).toMatchObject({
      id: EVIDENCE,
      documento: { id_versao_documento: VERSION, numero_versao: 2 },
    });
    expect(v?.historico[0]).toMatchObject({ id_execucao: OLD, hash_entrada: OLD_HASH });
    return {
      scope: v?.competencia.id,
      execution: v?.execucao_atual?.id,
      result: v?.resultado_atual?.id,
      version: v?.evidencias[0]!.documento?.id_versao_documento,
      oldExecution: v?.historico[0]!.id_execucao,
    };
  }
  const r = await obterVisaoGeral(COMP, signal);
  if (negative) {
    expect(classificarErroVisaoGeral(r.error, r.status)).toBe("sem_permissao");
    expect(parseVisaoGeral(r.data)).toBeNull();
    return null;
  }
  const v = parseVisaoGeral(r.data);
  expect(v?.competencia).toMatchObject({ id: COMP, id_contrato: CONTRACT, id_organizacao: ORG });
  expect(v?.blocking_summary.analise_concluida_atual).toBe(true);
  expect(v?.blocking_summary.parecer_aprovado).toBe(false);
  expect(v?.portao.liberado).toBe(false);
  expect(v?.allowed_actions.apresentar).toBe(false);
  if (!v) throw new Error("invalid overview");
  if (c.destination === "V119") expect(derivarEstadoVisual(v)).not.toBe("ready");
  return {
    scope: v.competencia.id,
    current: v.blocking_summary.analise_concluida_atual,
    gate: v.portao.liberado,
    canPresent: v.allowed_actions.apresentar,
  };
}
describe("V116/V117 stateful material commands", () => {
  beforeEach(() => {
    actor = "master";
    order = 16;
    writes = 0;
    execId = OLD;
    resultId = OLD_RESULT;
    hash = OLD_HASH;
    stale = true;
    review = false;
    queued = false;
    evidence = [];
    event = null;
    revision = undefined;
    receipt=null;
    transportFailure=false;
    m.rpc.mockReset();
    m.from.mockReset();
    m.rpc.mockImplementation((n: string, a: Record<string, unknown>) => {
      const p = Promise.resolve().then(() => rpc(n, a));
      return Object.assign(p, { abortSignal: () => p });
    });
    m.from.mockImplementation((table: string) => {
      const filters: unknown[][] = [],
        b: Record<string, unknown> = {};
      for (const n of ["select", "order", "range", "abortSignal"]) b[n] = () => b;
      b["eq"] = (...args: unknown[]) => {
        filters.push(args);
        return b;
      };
      b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => data(table, filters))
          .then(res, rej);
      return b;
    });
  });
  async function buildRevision(){
    const ctx=await obterContextoRevisao(COMP,REQ,ORG);
    const page=await listarEvidencias(ctx,0);
    return montarRevisao(ctx,{resultado:"conforme",justificativa:JUST,fundamento:FUND,evidencias:[{id_versao_documento:page.itens[0]!.id,pagina:1,trecho:"Trecho F4"}]},KEY);
  }
  for(const c of cases){
    it(c.caseId+" positive: independently reconcile queued or revised execution and fresh consumer",async()=>{
      const progress=await produce(c);expect(progress.next.execucao_atual?.id).not.toBe(progress.old.execucao_atual?.id);
      const witnesses=[];
      for(const role of c.reader?["master","leitor"]:["master"]){
        actor=role;const witness=await consume(c,false);expect(witness).not.toBeNull();witnesses.push({role,witness});
      }
      actor="master";expect(await analysis()).toEqual(progress.next);expect(writes).toBe(1);
      observations.push({caseId:c.caseId,kind:"positive",mode:"CODE_FIXTURE",readback:{progress,witnesses,writes}});
    });
    it(c.caseId+" negative: precommit outage, concurrent queue or stale revision and denial preserve result",async()=>{
      actor="master";order=c.order;const initial=await analysis();
      const draft=order===17?await buildRevision():null;
      transportFailure=true;
      if(draft)await expect(registrarRevisao(draft)).rejects.toMatchObject({tipo:"incerto"});
      else await expect(solicitarAnaliseCompetencia(COMP,"completa")).rejects.toThrow();
      transportFailure=false;expect(await analysis()).toEqual(initial);expect(writes).toBe(0);
      const progress=await produce(c);
      if(revision){
        await expect(registrarRevisao({...revision,p_request_id:RETRY})).rejects.toMatchObject({tipo:"conflito"});
        await registrarRevisao(revision);
      }
      actor="leitor";
      if(c.order===16)await expect(solicitarAnaliseCompetencia(COMP,"completa")).rejects.toThrow();
      else {if(!revision)throw Error("missing command");await expect(registrarRevisao(revision)).rejects.toMatchObject({tipo:"negado"});}
      actor=c.reader?"outsider":"leitor";expect(await consume(c,true)).toBeNull();
      actor="master";expect(await analysis()).toEqual(progress.next);expect(await consume(c,false)).not.toBeNull();expect(writes).toBe(1);
      observations.push({caseId:c.caseId,kind:"negative",mode:"CODE_FIXTURE",readback:{initial,progress,transportRejected:true,conflictRejected:true,denied:true,writes}});
    });
  }
  afterAll(()=>{const path=process.env["F4_CODE_ANALYSIS_OBSERVATIONS"];if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}});
});

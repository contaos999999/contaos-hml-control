/** CODE fixture only. Real domain adapters and independent scope/readback assertions. */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import {
  chamarV108,
  listarPropostas,
  listarVersoesProposta,
  listarRubricas,
} from "@/lib/contratos/orcamentoDados";
import { chamarV107, listarAplicabilidades } from "@/lib/contratos/baseNormativaDados";
import {
  obterLista,
  montarComandoLista,
  executarComandoLista,
} from "@/lib/contratos/listaOperacionalDados";
import { listarListas, listarVersoesLista, listarItens } from "@/lib/contratos/regrasDados";
import {
  registrarRelatorioHistorico,
  consultarEstadoDocumentoHistorico,
  podeFinalizarIngestao,
} from "@/lib/contratos/ingestaoHistoricoDados";
import {
  listarRelatoriosHistoricos,
  listarApontamentosVinculados,
} from "@/lib/contratos/historicoContratoDados";
import {
  criarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";
import {
  obterDocumentosCompetencia,
  parseLeituraV115,
  classificarErroV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  obterAnaliseCompetencia,
  parseAnaliseV116,
  FILTROS_VAZIOS,
  OFFSETS_ZERO,
  classificarErroV116,
} from "@/lib/competencias/competenciaAnaliseDados";
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
const id = (n: number) => "c0900000-0000-4000-8000-" + String(n).padStart(12, "0");
const ORG = id(1),
  CONTRACT = id(2),
  COMP = id(3),
  PROPOSAL = id(4),
  VERSION = id(5),
  LINE = id(6),
  SOURCE_VERSION = id(7),
  APPLICATION = id(8),
  LIST = id(9),
  LIST_VERSION = id(10),
  ITEM = id(11),
  REPORT = id(12),
  FILE = id(13),
  FILE_VERSION = id(14),
  REQ = id(15),
  EXEC = id(16),
  RESULT = id(17),
  EVENT = id(18),
  KEY = id(19),
  APO = id(20),
  RESPONSE = id(21),
  OUTCOME = id(22);
const HASH = createHash("sha256").update("F4 material version").digest("hex"),
  OLD_HASH = createHash("sha256").update("F4 previous snapshot").digest("hex");
const DATE = "2026-11-01T12:00:00Z",
  MONTH = "2026-11",
  REF = MONTH + "-01",
  SCOPE = { id_organizacao: ORG, id_contrato: CONTRACT };
const cases = [
    {
      caseId: "IFV1-F4-C0562",
      order: 20,
      destination: "V116",
      consumer: "obter_analise_competencia_v116",
      method: "POST",
      reader: true,
    },
    {
      caseId: "IFV1-F4-C0563",
      order: 20,
      destination: "V117",
      consumer: "obter_detalhe_requisito_v117",
      method: "POST",
      reader: true,
    },
    {
      caseId: "IFV1-F4-C0564",
      order: 20,
      destination: "V121",
      consumer: "relatorios_historicos_contratante",
      method: "GET",
      reader: true,
    },
    {
      caseId: "IFV1-F4-C0567",
      order: 20,
      destination: "V123",
      consumer: "eventos_auditoria",
      method: "GET",
      reader: false,
    },
  ];
type Case = (typeof cases)[number];
let actor = "master",
  order = 9,
  writes = 0,
  compCreated = false;
let published = false,
  applicable = false,
  listPublished = false,
  registered = false;
const observations: Record<string, unknown>[] = [];
let transport:"none"|"before"|"after"="none";
let security:"aprovado"|"bloqueado"="aprovado";
const calls: Array<{ table: string; ops: Array<[string, unknown[]]> }> = [];
const ok = (data: unknown, count = 0) => ({ data: structuredClone(data), error: null, status: 200, count }),
  deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
const pag = (limite: number, total = 0) => ({ offset: 0, limite, total });
const command = () =>
  (
    ({
      9: "publicar_versao_proposta_v108",
      10: "definir_aplicabilidade_fonte_v107",
      11: "executar_comando_lista_v1",
      20: "registrar_relatorio_historico_hml",
    }) as Record<number, string>
  )[order];
const entity = () =>
  (({ 9: VERSION, 10: APPLICATION, 11: LIST, 20: REPORT }) as Record<number, string>)[order];
const ctx = { idUsuario: "master", idOrganizacao: ORG, idContrato: CONTRACT };
const listHeader = () => ({
  id: LIST,
  ...SCOPE,
  nome: "Lista F4",
  descricao: null,
  situacao: listPublished ? "ativa" : "rascunho",
  versao_registro: listPublished ? 2 : 1,
  versao_atual: listPublished ? 1 : 0,
});
const listVersion = () => ({
  id: LIST_VERSION,
  ...SCOPE,
  id_lista: LIST,
  numero_versao: 1,
  situacao: listPublished ? "publicada" : "rascunho",
  vigencia_inicio: REF,
  vigencia_fim: null,
});
const item = () => ({
  id: ITEM,
  ...SCOPE,
  id_versao_lista: LIST_VERSION,
  codigo: "F4",
  descricao: "Requisito documental F4",
  categoria: "documental",
  obrigatorio: true,
  aplicavel: order === 10 ? applicable : true,
  impeditivo: true,
  criticidade: "alta",
  id_fonte_versao: SOURCE_VERSION,
  regra_validacao: { tipo: "documento" },
  ordem: 1,
  pode_remover: false,
});
const historical = () => ({
  id: REPORT,
  ...SCOPE,
  id_arquivo: FILE,
  numero_documento: "F4 histórico",
  tipo: "relatorio_contratante",
  competencia_referencia: "2026-10-01",
  data_documento: null,
  status_processamento: "concluido",
  resultado_geral: null,
  origem_temporal: "historico",
  criado_em: DATE,
});
const application = () => ({
  id: APPLICATION,
  id_fonte_versao: SOURCE_VERSION,
  aplicavel: applicable,
  fundamento: applicable ? "Fonte F4 vigente" : null,
  aprovado_por: null,
  aprovado_em: applicable ? DATE : null,
  atualizado_em: DATE,
});
const commandArgs = () =>
  order === 9
    ? {
        p_id_organizacao: ORG,
        p_id_versao: VERSION,
        p_hash_esperado: HASH,
        p_fundamento: "Publicação F4",
        p_chave_idempotencia: KEY,
      }
    : order === 10
      ? {
          p_id_organizacao: ORG,
          p_id_contrato: CONTRACT,
          p_id_versao: SOURCE_VERSION,
          p_aplicavel: true,
          p_fundamento: "Fonte F4 vigente",
          p_atualizado_em_esperado: DATE,
          p_chave_idempotencia: KEY,
        }
      : order === 11
        ? montarComandoLista(
            ctx,
            LIST,
            1,
            "publicar_versao",
            { id_versao: LIST_VERSION },
            "Publicação F4",
            KEY,
          )
        : { p_id_arquivo: FILE, p_competencia: "2026-10-01", p_tipo: "relatorio_contratante" };
function rpc(name: string, args: Record<string, unknown> = {}) {
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args["p_id_organizacao"] === ORG);
  if(name===command()){
    if(actor!=="master")return deny();
    if(transport==="before")throw Error("synthetic outage before history write");
    expect(args).toEqual(commandArgs());
    if(security!=="aprovado")return {data:null,error:{code:"P0001"},status:400};
    if(registered)return ok(REPORT);
    writes++;registered=true;
    if(transport==="after")throw Error("synthetic lost history receipt");
    return ok(REPORT);
  }
  if (name === "obter_lista_operacional_v1") {
    if (
      actor === "outsider" ||
      args["p_id_organizacao"] !== ORG ||
      args["p_id_contrato"] !== CONTRACT
    )
      return deny();
    return ok({
      schema_versao: "crud-lista-v1",
      ...SCOPE,
      lista: listHeader(),
      versao: listVersion(),
      versoes: [listVersion()],
      itens: [item()],
      total_versoes: 1,
      total_itens: 1,
      pagina_versoes: 0,
      pagina_itens: 0,
      acoes: Object.fromEntries(
        [
          "criar_lista",
          "editar_lista",
          "criar_versao",
          "editar_vigencia_rascunho",
          "criar_item",
          "editar_item",
          "remover_item",
          "publicar_versao",
          "encerrar_vigencia",
          "alterar_situacao",
          "descartar_rascunho",
        ].map((k) => [k, actor === "master"]),
      ),
      exclusao_lista_permitida: false,
      motivo_retencao: "Preservar histórico",
      vigencia_fim_minima: null,
    });
  }
  if (name === "criar_competencia") {
    if (actor !== "master" || args["p_id_contrato"] !== CONTRACT) return deny();
    expect(args["p_competencia_referencia"]).toBe(REF);
    expect(order === 10 ? applicable : listPublished).toBe(true);
    compCreated = true;
    return ok(COMP);
  }
  if (actor === "outsider" || args["p_id_competencia"] !== COMP) return deny();
  const stale = order !== 20 && writes > 0,
    materialized = (order === 11 && listPublished) || (order === 10 && applicable);
  const competence = {
    id: COMP,
    ...SCOPE,
    competencia_referencia: REF,
    situacao: stale ? "pendente_correcao" : "pode_apresentar_contratante",
  };
  const counts = {
    pendentes: stale ? 1 : 0,
    nao_conformes: 0,
    inconclusivos: 0,
    em_analise: 0,
    nao_conformidades_bloqueantes: 0,
  };
  const execution = { id: EXEC, status: "concluido", hash_entrada: OLD_HASH };
  const result = {
    id: RESULT,
    id_execucao: EXEC,
    resultado: "conforme",
    mecanismo: "deterministico",
    justificativa: "Resultado anterior",
    hash_evidencias: OLD_HASH,
  };
  const actions = {
    executar_analise: actor === "master",
    reanalisar: actor === "master" && stale,
    abrir_requisito: true,
  };
  const requirement = {
    id: REQ,
    codigo: "F4",
    descricao: "Requisito documental F4",
    criticidade: "alta",
    origem_tipo: "lista",
    origem_id: ITEM,
    origem_versao: LIST_VERSION,
    fonte_tipo: "normativa",
    fonte_referencia: SOURCE_VERSION,
    fonte_detalhe: { vigencia_inicio: REF, fonte_versao: SOURCE_VERSION },
    hash_snapshot: OLD_HASH,
    aplicavel: true,
    obrigatorio: true,
    impeditivo: true,
    efeito_portao: true,
  };
  if (name === "obter_visao_geral_competencia")
    return ok({
      competencia: {
        ...competence,
        periodo_inicio: null,
        periodo_fim: null,
        data_limite: null,
        atualizado_em: DATE,
        percentual_conformidade: stale ? 0 : 100,
        versao_pacote_atual: null,
        versao_registro: 2,
      },
      portao: {
        ...counts,
        liberado: !stale,
        total: 1,
        conformes_ou_na_validos: stale ? 0 : 1,
        percentual: stale ? 0 : 100,
      },
      blocking_summary: {
        ...counts,
        parecer_aprovado: !stale,
        analise_concluida_atual: !stale,
        aprovacao_apresentacao_atual: !stale,
      },
      allowed_actions: {
        abrir_documentos: true,
        analisar: actor === "master",
        abrir_parecer: true,
        apresentar: !stale && actor === "master",
      },
    });
  if (name === "obter_documentos_competencia_v115")
    return ok({
      schema_versao: "v115-v1",
      competencia: competence,
      estado_documental: "missing_docs",
      resumo: {
        documentos_total: 0,
        requisitos_documentais_total: materialized ? 1 : 0,
        requisitos_documentais_aplicaveis: materialized ? 1 : 0,
        requisitos_documentais_pendentes: materialized ? 1 : 0,
      },
      documentos: [],
      requisitos_documentais: materialized
        ? [{ ...requirement, tipos_esperados: ["contrato"], atendido: false }]
        : [],
      documentos_paginacao: pag(25),
      requisitos_paginacao: pag(25, materialized ? 1 : 0),
      capacidades: {
        pode_enviar: actor === "master",
        pode_nova_versao: actor === "master",
        motivo_nova_versao_obrigatorio: true,
      },
    });
  if (name === "obter_analise_competencia_v116")
    return ok({
      schema_versao: "v116-v1",
      competencia: competence,
      estado_analise: stale ? "stale" : "complete",
      stale,
      percentual: stale ? 0 : 100,
      blocking_summary: counts,
      allowed_actions: actions,
      execucao_atual: execution,
      mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
      resultados: [
        {
          ...result,
          id_resultado: RESULT,
          id_requisito: REQ,
          requisito: requirement,
          evidencias: [],
        },
      ],
      resultados_paginacao: pag(25, 1),
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
      requisito: requirement,
      execucao_atual: execution,
      resultado_atual: stale ? null : result,
      resultado_referencia: result,
      na_validade: null,
      allowed_actions: actions,
      evidencias: [],
      evidencias_paginacao: pag(25),
      historico: [
        { id_resultado: RESULT, id_execucao: EXEC, resultado: "conforme", hash_entrada: OLD_HASH },
      ],
      historico_paginacao: pag(25, 1),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  }
  throw new Error(name);
}
function response(c: (typeof calls)[number], single: boolean) {
  if (actor === "outsider") return deny();
  const has = (k: string, v: unknown) =>
    c.ops.some(([op, a]) => op === "eq" && a[0] === k && a[1] === v);
  if (c.table === "propostas_orcamentarias") {
    expect(has("id_contrato", CONTRACT)).toBe(true);
    return ok(
      [
        {
          id: PROPOSAL,
          ...SCOPE,
          titulo: "Proposta F4",
          situacao: published ? "ativa" : "rascunho",
          versao_atual: published ? 1 : null,
        },
      ],
      1,
    );
  }
  if (c.table === "versoes_proposta") {
    expect(has("id_proposta", PROPOSAL)).toBe(true);
    return ok(
      [
        {
          id: VERSION,
          id_proposta: PROPOSAL,
          numero_versao: 1,
          hash: HASH,
          situacao: published ? "publicada" : "rascunho",
          vigencia_inicio: REF,
          valor_total: 1200,
        },
      ],
      1,
    );
  }
  if (c.table === "linhas_orcamentarias") {
    expect(has("id_versao_proposta", VERSION)).toBe(true);
    return ok(
      [
        {
          id: LINE,
          id_versao_proposta: VERSION,
          codigo: "F4",
          grupo: "Pessoal",
          rubrica: "Salários",
          valor_anual_previsto: 1200,
        },
      ],
      1,
    );
  }
  if (c.table === "aplicabilidades_fonte") {
    expect(has("id_contrato", CONTRACT)).toBe(true);
    expect(
      c.ops.some(
        ([op, a]) =>
          op === "in" &&
          a[0] === "id_fonte_versao" &&
          JSON.stringify(a[1]) === JSON.stringify([SOURCE_VERSION]),
      ),
    ).toBe(true);
    return ok([application()], 1);
  }
  if (c.table === "listas_verificacao") {
    expect(has("id_contrato", CONTRACT)).toBe(true);
    return ok([listHeader()], 1);
  }
  if (c.table === "versoes_lista") {
    expect(has("id_lista", LIST)).toBe(true);
    return ok([listVersion()], 1);
  }
  if (c.table === "itens_lista") {
    expect(has("id_versao_lista", LIST_VERSION)).toBe(true);
    return ok([item()], 1);
  }
  if (c.table === "competencias") {
    expect(has("id_contrato", CONTRACT)).toBe(true);
    return ok(compCreated ? { id: COMP } : null);
  }
  if (c.table === "arquivos") {
    expect(has("id", FILE) && has("id_organizacao", ORG) && has("id_contrato", CONTRACT)).toBe(
      true,
    );
    return ok({ id: FILE, ...SCOPE, status_seguranca: security });
  }
  if (c.table === "versoes_documento") {
    expect(
      has("id", FILE_VERSION) && has("id_organizacao", ORG) && has("id_contrato", CONTRACT),
    ).toBe(true);
    return ok({ id: FILE_VERSION, ...SCOPE, id_arquivo: FILE });
  }
  if (c.table === "processamentos_documento") {
    expect(has("id_versao_documento", FILE_VERSION)).toBe(true);
    return ok({
      id: EVENT,
      ...SCOPE,
      id_versao_documento: FILE_VERSION,
      status: "concluido",
      criado_em: DATE,
    });
  }
  if (c.table === "relatorios_historicos_contratante") {
    expect(has("id_contrato", CONTRACT) && has("id_organizacao", ORG)).toBe(true);
    return ok(registered ? [historical()] : [], registered ? 1 : 0);
  }
  if (c.table === "apontamentos_historicos") {
    expect(has("id_relatorio", REPORT)).toBe(true);
    return ok(
      [
        {
          id: APO,
          id_relatorio: REPORT,
          ...SCOPE,
          item: "F4",
          problema: "Apontamento histórico",
          severidade: "media",
          fonte_pagina: 1,
          fundamento: "Relatório F4",
          criado_em: DATE,
        },
      ],
      1,
    );
  }
  if (c.table === "respostas_historicas")
    return ok(
      [{ id: RESPONSE, id_apontamento: APO, ...SCOPE, texto: "Resposta F4", criado_em: DATE }],
      1,
    );
  if (c.table === "desfechos_historicos")
    return ok(
      [
        {
          id: OUTCOME,
          id_apontamento: APO,
          ...SCOPE,
          resultado: "acolhido",
          data: null,
          criado_em: DATE,
        },
      ],
      1,
    );
  if (c.table === "pareceres_internos") {
    expect(
      has("id_competencia", COMP) && has("id_organizacao", ORG) && has("id_contrato", CONTRACT),
    ).toBe(true);
    return ok([], 0);
  }
  if (c.table === "eventos_auditoria") {
    if (actor !== "master") return deny();
    expect(has("id_organizacao", ORG) && has("correlation_id", KEY)).toBe(true);
    return ok(
      writes
        ? [
            {
              id: EVENT,
              criado_em: DATE,
              evento: command(),
              entidade: order === 20 ? "relatorios_historicos_contratante" : "contratos",
              origem: "rpc",
              id_usuario: null,
              id_entidade: entity(),
              correlation_id: KEY,
            },
          ]
        : [],
      writes,
    );
  }
  throw new Error(c.table);
}
async function mutate() {
  if (order === 9)
    return chamarV108(
      "publicar_versao_proposta_v108",
      commandArgs() as Parameters<typeof chamarV108<"publicar_versao_proposta_v108">>[1],
    );
  if (order === 10)
    return chamarV107(
      "definir_aplicabilidade_fonte_v107",
      commandArgs() as Parameters<typeof chamarV107<"definir_aplicabilidade_fonte_v107">>[1],
    );
  if (order === 11)
    return executarComandoLista(
      ctx,
      montarComandoLista(
        ctx,
        LIST,
        1,
        "publicar_versao",
        { id_versao: LIST_VERSION },
        "Publicação F4",
        KEY,
      ),
    );
  return registrarRelatorioHistorico(FILE, "2026-10", "relatorio_contratante");
}
async function readMaterial(after: boolean) {
  const signal = new AbortController().signal;
  if (order === 9) {
    const p = await listarPropostas(CONTRACT, 0, signal),
      v = await listarVersoesProposta(p.itens[0]!.id, 0, signal),
      rows = await listarRubricas(v.itens[0]!.id, 0, signal);
    expect(p.itens[0]).toMatchObject({ id: PROPOSAL, id_contrato: CONTRACT });
    expect(v.itens[0]).toMatchObject({
      id: VERSION,
      id_proposta: PROPOSAL,
      situacao: after ? "publicada" : "rascunho",
      hash: HASH,
      vigencia_inicio: REF,
    });
    expect(rows.itens[0]).toMatchObject({
      id: LINE,
      id_versao_proposta: VERSION,
      valor_anual_previsto: 1200,
    });
  } else if (order === 10) {
    const a = await listarAplicabilidades(CONTRACT, [SOURCE_VERSION], signal);
    expect(a[0]).toMatchObject({
      id: APPLICATION,
      id_fonte_versao: SOURCE_VERSION,
      aplicavel: after,
      fundamento: after ? "Fonte F4 vigente" : null,
    });
  } else if (order === 11) {
    const a = await obterLista(ctx, LIST, LIST_VERSION);
    expect(a.lista).toMatchObject({ id: LIST, versao_registro: after ? 2 : 1 });
    expect(a.versao).toMatchObject({
      id: LIST_VERSION,
      situacao: after ? "publicada" : "rascunho",
      vigencia_inicio: REF,
    });
    expect(a.itens[0]).toMatchObject({
      id: ITEM,
      id_fonte_versao: SOURCE_VERSION,
      aplicavel: true,
    });
  } else {
    const a = await listarRelatoriosHistoricos(CONTRACT, ORG, 0, signal);
    expect(a.total).toBe(after ? 1 : 0);
    if (after)
      expect(a.itens[0]).toMatchObject({
        id: REPORT,
        id_arquivo: FILE,
        origem_temporal: "historico",
        competencia_referencia: "2026-10-01",
      });
  }
}
async function state(){
  const signal=new AbortController().signal;
  const history=await listarRelatoriosHistoricos(CONTRACT,ORG,0,signal);
  const a=parseAnaliseV116((await obterAnaliseCompetencia(COMP,FILTROS_VAZIOS,OFFSETS_ZERO,signal)).data);
  const r=parseDetalheV117((await obterDetalheRequisito(COMP,REQ,OFFSETS_DETALHE_ZERO,signal)).data,COMP,REQ,OFFSETS_DETALHE_ZERO);
  expect(a?.stale).toBe(false);
  expect(a?.execucao_atual).toMatchObject({id:EXEC,hash_entrada:OLD_HASH});
  expect(r?.resultado_atual?.id).toBe(RESULT);
  return {history,analysis:a,requirement:r};
}
async function produce(c:Case){
  actor="master";order=c.order;
  const before=await state();expect(before.history.total).toBe(0);
  const file=await consultarEstadoDocumentoHistorico(ORG,CONTRACT,FILE,FILE_VERSION,new AbortController().signal);
  expect(podeFinalizarIngestao(file.seguranca,file.processamento)).toBe(true);
  const receipt=await mutate();expect(receipt).toBe(REPORT);
  const after=await state();
  expect(after.history.total).toBe(1);
  expect(after.history.itens[0]).toMatchObject({id:REPORT,id_arquivo:FILE,competencia_referencia:"2026-10-01"});
  expect(after.analysis).toEqual(before.analysis);
  expect(after.requirement).toEqual(before.requirement);
  expect(await mutate()).toBe(REPORT);expect(await state()).toEqual(after);expect(writes).toBe(1);
  return {before,after,receipt};
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
      id_entidade: entity(),
      evento: command(),
      correlation_id: KEY,
    });
    return {
      event: v.eventos[0]!.id,
      entity: v.eventos[0]!.id_entidade,
      correlation: v.eventos[0]!.correlation_id,
    };
  }
  if (c.destination === "V109") {
    const p = listarListas(CONTRACT, 0, signal);
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const a = await p,
      v = await listarVersoesLista(a.itens[0]!.id, 0, signal),
      items = await listarItens(v.itens[0]!.id, 0, signal);
    expect(items.itens[0]).toMatchObject({
      id: ITEM,
      id_fonte_versao: SOURCE_VERSION,
      aplicavel: true,
    });
    expect(v.itens[0]!.vigencia_inicio).toBe(REF);
    return {
      item: items.itens[0]!.id,
      source: items.itens[0]!.id_fonte_versao,
      validFrom: v.itens[0]!.vigencia_inicio,
    };
  }
  if (c.destination === "V113") {
    if (negative) {
      await expect(criarCompetencia(CONTRACT, MONTH)).rejects.toMatchObject({
        tipo: "sem_permissao",
      });
      return null;
    }
    const comp = await criarCompetencia(CONTRACT, MONTH);
    expect(await verificarCompetenciaExistente(CONTRACT, MONTH)).toBe(comp);
    const rr = await obterDetalheRequisito(comp, REQ, OFFSETS_DETALHE_ZERO, signal),
      v = parseDetalheV117(rr.data, comp, REQ, OFFSETS_DETALHE_ZERO);
    expect(v?.requisito).toMatchObject({
      id: REQ,
      origem_id: ITEM,
      origem_versao: LIST_VERSION,
      fonte_referencia: SOURCE_VERSION,
      aplicavel: true,
    });
    return { comp, source: v?.requisito.fonte_referencia, item: v?.requisito.origem_id };
  }
  if (c.destination === "V121") {
    const p = listarRelatoriosHistoricos(CONTRACT, ORG, 0, signal);
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const a = await p;
    expect(a.itens[0]).toMatchObject({
      id: REPORT,
      id_arquivo: FILE,
      origem_temporal: "historico",
      id_contrato: CONTRACT,
    });
    const b = await listarApontamentosVinculados(CONTRACT, ORG, REPORT, 0, signal);
    expect(b.itens[0]).toMatchObject({
      id: APO,
      id_relatorio: REPORT,
      respostas: [{ id: RESPONSE, id_apontamento: APO }],
      desfechos: [{ id: OUTCOME, id_apontamento: APO }],
    });
    return {
      report: a.itens[0]!.id,
      origin: a.itens[0]!.origem_temporal,
      point: b.itens[0]!.id,
      response: b.itens[0]!.respostas[0]!.id,
      outcome: b.itens[0]!.desfechos[0]!.id,
    };
  }
  if (c.destination === "V118") {
    const p = listarPareceres(COMP, ORG, CONTRACT, 0, signal);
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "sem_permissao" });
      return null;
    }
    const a = await p;
    expect(a.itens).toEqual([]);
    return { scope: COMP, opinions: a.total };
  }
  if (c.destination === "V115") {
    const rr = await obterDocumentosCompetencia(COMP, 0, 0, signal);
    if (negative) {
      expect(classificarErroV115(rr.error, rr.status)).toBe("sem_permissao");
      expect(parseLeituraV115(rr.data)).toBeNull();
      return null;
    }
    const a = parseLeituraV115(rr.data);
    expect(a?.competencia.id).toBe(COMP);
    expect(a?.requisitos[0]).toMatchObject({
      id: REQ,
      codigo: "F4",
      aplicavel: true,
      obrigatorio: true,
      atendido: false,
    });
    return {
      scope: a?.competencia.id,
      requirement: a?.requisitos[0]!.id,
      missing: a?.requisitos[0]!.atendido === false,
    };
  }
  if (c.destination === "V116") {
    const rr = await obterAnaliseCompetencia(COMP, FILTROS_VAZIOS, OFFSETS_ZERO, signal);
    if (negative) {
      expect(classificarErroV116(rr.error, rr.status)).toBe("sem_permissao");
      expect(parseAnaliseV116(rr.data)).toBeNull();
      return null;
    }
    const a = parseAnaliseV116(rr.data);
    expect(a?.competencia.id).toBe(COMP);
    expect(a?.stale).toBe(order !== 20);
    expect(a?.execucao_atual).toMatchObject({ id: EXEC, hash_entrada: OLD_HASH });
    expect(a?.resultados[0]).toMatchObject({ id_requisito: REQ, fonte_referencia: SOURCE_VERSION });
    return {
      scope: a?.competencia.id,
      stale: a?.stale,
      hash: a?.execucao_atual?.hash_entrada,
      source: a?.resultados[0]!.fonte_referencia,
    };
  }
  if (c.destination === "V117") {
    const rr = await obterDetalheRequisito(COMP, REQ, OFFSETS_DETALHE_ZERO, signal);
    if (negative) {
      expect(classificarErroV117(rr.error, rr.status)).toBe("sem_permissao");
      expect(parseDetalheV117(rr.data, COMP, REQ, OFFSETS_DETALHE_ZERO)).toBeNull();
      return null;
    }
    const a = parseDetalheV117(rr.data, COMP, REQ, OFFSETS_DETALHE_ZERO);
    expect(a?.requisito).toMatchObject({
      id: REQ,
      origem_id: ITEM,
      origem_versao: LIST_VERSION,
      fonte_referencia: SOURCE_VERSION,
      hash_snapshot: OLD_HASH,
    });
    expect(a?.resultado_atual?.id ?? null).toBe(order === 20 ? RESULT : null);
    return {
      scope: a?.competencia.id,
      source: a?.requisito.fonte_referencia,
      version: a?.requisito.origem_versao,
      hash: a?.requisito.hash_snapshot,
      current: a?.resultado_atual?.id ?? null,
    };
  }
  const rr = await obterVisaoGeral(COMP, signal);
  if (negative) {
    expect(classificarErroVisaoGeral(rr.error, rr.status)).toBe("sem_permissao");
    expect(parseVisaoGeral(rr.data)).toBeNull();
    return null;
  }
  const a = parseVisaoGeral(rr.data);
  expect(a?.competencia.id).toBe(COMP);
  expect(a?.portao.liberado).toBe(false);
  expect(a?.blocking_summary.analise_concluida_atual).toBe(false);
  expect(a?.allowed_actions.apresentar).toBe(false);
  if (!a) throw new Error("missing overview");
  if (c.destination === "V119") expect(derivarEstadoVisual(a)).not.toBe("ready");
  return {
    scope: a.competencia.id,
    gate: a.portao.liberado,
    current: a.blocking_summary.analise_concluida_atual,
    canPresent: a.allowed_actions.apresentar,
  };
}
describe("material sources and governed historical context", () => {
  beforeEach(() => {
    actor = "master";
    order = 9;
    writes = 0;
    compCreated = false;
    published = false;
    applicable = false;
    listPublished = false;
    registered = false;
    transport="none";
    security="aprovado";
    calls.length = 0;
    m.rpc.mockReset();
    m.from.mockReset();
    m.rpc.mockImplementation((n: string, a: Record<string, unknown>) => {
      const p = Promise.resolve().then(() => rpc(n, a));
      return Object.assign(p, { abortSignal: () => p });
    });
    m.from.mockImplementation((table: string) => {
      const call = { table, ops: [] as Array<[string, unknown[]]> };
      calls.push(call);
      const b: Record<string, unknown> = {};
      for (const n of ["select", "eq", "order", "range", "abortSignal", "in", "limit"])
        b[n] = (...args: unknown[]) => {
          call.ops.push([n, args]);
          return b;
        };
      b["maybeSingle"] = () => Promise.resolve().then(() => response(call, true));
      b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => response(call, false))
          .then(res, rej);
      return b;
    });
  });
  for(const c of cases){
    it(c.caseId+" positive: history registration replay and independent current-analysis readback",async()=>{
      const progress=await produce(c);const witnesses=[];
      for(const role of c.reader?["master","leitor"]:["master"]){
        actor=role;const witness=await consume(c,false);expect(witness).not.toBeNull();witnesses.push({role,witness});
      }
      actor="master";expect(await state()).toEqual(progress.after);expect(writes).toBe(1);
      observations.push({caseId:c.caseId,kind:"positive",mode:"CODE_FIXTURE",readback:{progress,witnesses,writes}});
    });
    it(c.caseId+" negative: blocked file, lost receipt and revoked access preserve historical and current data",async()=>{
      actor="master";order=c.order;const before=await state();
      security="bloqueado";
      const blocked=await consultarEstadoDocumentoHistorico(ORG,CONTRACT,FILE,FILE_VERSION,new AbortController().signal);
      expect(podeFinalizarIngestao(blocked.seguranca,blocked.processamento)).toBe(false);
      await expect(mutate()).rejects.toBeTruthy();expect(await state()).toEqual(before);
      security="aprovado";transport="before";await expect(mutate()).rejects.toBeTruthy();
      transport="none";expect(await state()).toEqual(before);
      transport="after";await expect(mutate()).rejects.toBeTruthy();
      transport="none";const recovered=await state();expect(recovered.history.total).toBe(1);
      expect(recovered.history.itens[0]?.id).toBe(REPORT);expect(recovered.analysis).toEqual(before.analysis);expect(recovered.requirement).toEqual(before.requirement);
      expect(await mutate()).toBe(REPORT);expect(await state()).toEqual(recovered);
      const witness=await consume(c,false);expect(witness).not.toBeNull();
      actor="leitor";await expect(mutate()).rejects.toMatchObject({tipo:"negado"});
      actor=c.reader?"outsider":"leitor";expect(await consume(c,true)).toBeNull();
      actor="master";expect(await state()).toEqual(recovered);expect(writes).toBe(1);
      observations.push({caseId:c.caseId,kind:"negative",mode:"CODE_FIXTURE",readback:{before,recovered,witness,writes,blockedRejected:true,lostReceiptReconciled:true}});
    });
  }
  afterAll(()=>{const path=process.env["F4_CODE_HISTORY_OBSERVATIONS"];if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}});
});

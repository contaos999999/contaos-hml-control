import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const competencia = "44444444-4444-4444-8444-444444444444";
export const CICLO_V2_FIXTURE = "77777777-7777-4777-8777-777777777777";
export const APONTAMENTO_V2_FIXTURE = "abababab-abab-4bab-8bab-abababababab";
const cicloAnterior = "88888888-8888-4888-8888-888888888888";
const protocoloId = "33333333-3333-4333-8333-333333333333";
const cicloPath = "/diligencias/" + CICLO_V2_FIXTURE;
const itemPath = cicloPath + "/apontamentos/" + APONTAMENTO_V2_FIXTURE;
const wizardPath = cicloPath + "/reapresentar";
const protocoloNovo = "46000000-0000-4000-8000-000000000021";
const novoPath = "/competencias/" + competencia + "/apresentacoes/" + protocoloNovo;
const protocoloPath = "/competencias/" + competencia + "/apresentacoes/" + protocoloId;
const overview = "/competencias/" + competencia;
const diligencias = overview + "/diligencias";
const parecerPath = overview + "/pareceres-contratante";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function diligenciasVisualCases(widths, themes) {
  return widths.flatMap((width) => themes.map((theme) => ({ width, theme })));
}

export function diligenciasFixtureFiles(root, baseFixtures) {
  return {
    "base-client.ts": baseFixtures["client.ts"],
    "router.tsx": baseFixtures["router.tsx"],
    "build.mjs": baseFixtures["build.mjs"],
    "client.ts": `
import { C, O, K, A, P, supabase as baseline } from "./base-client";
export { C, O, K, A };

const comum = {
  id_competencia: C, id_organizacao: O, id_contrato: K,
  recebido_em: "2026-11-08T15:00:00Z", prazo_resposta: "2026-11-21",
  encerrado_em: null, versao_registro: 1,
};
const rodadas = [
  { ...comum, id: "${CICLO_V2_FIXTURE}", numero_rodada: 2, status: "em_tratamento" },
  { ...comum, id: "${cicloAnterior}", numero_rodada: 1, status: "reapresentado" },
];
const chaves = { id_ciclo: rodadas[0].id, id_competencia: C, id_contrato: K, id_organizacao: O };
const pareceres = [{
  ...chaves, id: "99999999-9999-4999-8999-999999999999",
  recebido_em: comum.recebido_em, numero_documento: "PARECER-SINTETICO-02", data_emissao: "2026-11-07",
  resultado_geral: "Diligência", id_apresentacao: A,
  apresentacao: { id: A, id_competencia: C, id_contrato: K, id_organizacao: O },
}];
const apontamentos = [{
  ...chaves, id: "${APONTAMENTO_V2_FIXTURE}", fundamento: "Fundamento registrado no parecer",
  criado_em: comum.recebido_em, codigo: "AP-02",
  descricao: "Valor de serviço apontado nesta rodada", classificacao_sugerida: "Financeiro",
  status: "em_analise", severidade: "alta",
  valor_questionado: "9999999999999999.99", glosa_potencial: "0.00",
  valor_aceito: null, impacto_financeiro_estimado: "-0.01",
}];

const identificador = (n: number) => "46000000-0000-4000-8000-" + String(n).padStart(12, "0");
const arquivo = identificador(1);
const analise = identificador(2);
const tarefa = identificador(3);
const revisor = identificador(4);
const evento = identificador(5);
const documento = identificador(6);
const versao1 = identificador(7);
const versao2 = identificador(8);
const ref = { ...chaves, id_apontamento: apontamentos[0].id };
const hashVersao = "c".repeat(64);
const versao = (id: string, numero: number, criado: string) => ({
  id, id_organizacao: O, id_contrato: K, id_documento_contrato: null, id_documento_competencia: documento,
  numero_versao: numero, hash: hashVersao, criado_em: criado, documentoContrato: null,
  documentoCompetencia: { ...chaves, id: documento, titulo: "Comprovante da competência" },
});
const tabelas: Record<string, unknown[]> = {
  analises_apontamentos: [{ ...ref, id: analise, classificacao: "inconclusivo",
    fundamento: "Análise documentada para revisão", evidencias: [{ id_versao_documento: versao1 }],
    criado_em: comum.recebido_em }],
  tarefas_diligencia: [{ ...ref, id: tarefa, descricao: "Conferir a versão juntada", id_evidencia_versao_documento: versao2 }],
  eventos_auditoria: [{ id: evento, id_organizacao: O, id_usuario: revisor, id_entidade: tarefa,
    entidade: "tarefas_diligencia", evento: "SolucaoTarefaDiligenciaRevisada",
    criado_em: "2026-11-12T14:00:00Z", depois: { aprovada: true, fundamento: "Conferência humana registrada", revisor } }],
  desfechos_apontamentos: [],
  versoes_documento: [versao(versao1, 1, "2026-11-09T12:00:00Z"), versao(versao2, 2, "2026-11-12T12:00:00Z")],
  itens_pacote_competencia: [{ ...chaves, id: identificador(9), id_pacote: P,
    entidade_tipo: "documento_competencia", entidade_id: documento, versao_id: versao1, hash: hashVersao }],
};

const novaTarefa = identificador(10);
const revalidacao = identificador(11);
const correlacao = identificador(12);
let etapa = "pendente";
let leiturasPendentes = 0;
const tarefaVisual = {
  id: novaTarefa, descricao: "Obter assinatura do comprovante", id_plano: null,
  responsavel: revisor, prazo: "2026-11-20", tipo_acao: "obter_assinatura", prioridade: "alta",
  depende_de: [],
};
const rpcRespond = (data: unknown, code?: string) => ({
  async abortSignal(signal: AbortSignal) {
    signal.throwIfAborted();
    return { data, error: code ? { code } : null, status: code ? 403 : 200 };
  },
});

let etapaContestacao = "vazia";
let leituraMinuta = 0;
const idContestacao = identificador(14);
const idDecisao = identificador(15);
const idMinuta = identificador(16);
const mapaContestacao = [{ id: identificador(17), id_versao_documento: versao2,
  titulo: "Comprovante da competência", versao_documento: 2, pagina: 3, hash: hashVersao,
  descricao: "Serviço comprovado", trecho: "Atendimento registrado na competência." }];
function contestacaoFixture(name: string, args: Record<string, unknown>) {
  const pendente = etapaContestacao === "pendente";
  const aprovada = etapaContestacao === "aprovada";
  if (name === "obter_contestacoes_v2") {
    if (location.search.includes("contestacao-negada")) return rpcRespond(null, "42501");
    if (args.p_id_ciclo !== rodadas[0].id || args.p_id_apontamento !== apontamentos[0].id ||
        args.p_offset !== 0 || args.p_limite !== 10 || args.p_offset_fontes !== 0) throw Error("ESCOPO_V248_CONSULTA");
    if (etapaContestacao === "fila" && ++leituraMinuta > 1) etapaContestacao = "rascunho";
    const rascunho = etapaContestacao === "rascunho";
    const versaoAtual = pendente || aprovada ? 2 : rascunho ? 1 : 0;
    const base = {
      texto: "Síntese da minuta e pedido de revisão", fundamento: "Prova documental da rodada",
      hash: hashVersao, criado_em: comum.recebido_em,
      resultado_final: null, resultado_registrado_em: null, mapa: mapaContestacao,
    };
    const anterior = { ...base, id: idContestacao, versao: 1, status_aprovacao: "rascunho",
      recomendada: true, justificativa_recomendacao: "Há suporte documental.", revisar: false,
      aprovado_por: null, aprovado_em: null };
    return rpcRespond({ id_ciclo: rodadas[0].id, id_apontamento: apontamentos[0].id,
      versao_atual: versaoAtual, versao_apontamento: 1, submeter: true, solicitar_minuta: !pendente,
      offset: 0, limite: 10, total: versaoAtual, offset_fontes: 0, total_fontes: 1,
      fontes: [{ id: versao2, titulo: "Comprovante da competência", numero: 2, hash: hashVersao, vigente: true }],
      contestacoes: versaoAtual === 2 ? [{ ...base, id: idDecisao, versao: 2,
        status_aprovacao: aprovada ? "aprovada" : "pendente", recomendada: false, justificativa_recomendacao: null,
        revisar: pendente, aprovado_por: aprovada ? revisor : null, aprovado_em: aprovada ? comum.recebido_em : null }, anterior]
        : rascunho ? [anterior] : [],
      minuta: etapaContestacao === "vazia" ? null :
        { id: idMinuta, estado: etapaContestacao === "fila" ? "enfileirado" : "concluido" }
    });
  }
  if (name === "solicitar_minuta_contestacao_v2") {
    if (args.p_id_apontamento !== apontamentos[0].id || args.p_versao_esperada !== 0 ||
       typeof args.p_chave !== "string") throw Error("ESCOPO_V248_MINUTA");
    etapaContestacao = "fila";
    return rpcRespond({ id_execucao: idMinuta, id_apontamento: apontamentos[0].id, versao_esperada: 0 });
  }
  if (name === "salvar_contestacao_v2") {
    const e = (args.p_evidencias as Array<Record<string, unknown>>)?.[0];
    if (args.p_id_apontamento !== apontamentos[0].id || args.p_versao_esperada !== 1 ||
        e?.id_versao_documento !== versao2 || e?.hash !== hashVersao || e?.pagina !== 3 ||
        typeof args.p_chave !== "string") throw Error("ESCOPO_V248_MAPA");
    etapaContestacao = "pendente";
    return rpcRespond({ schema_versao: "v248-v1", id_contestacao: idDecisao, id_apontamento: apontamentos[0].id,
      versao: 2, hash: hashVersao, status_aprovacao: "pendente", correlation_id: correlacao });
  }
  if (name === "revisar_contestacao_v2") {
    if (!pendente || args.p_id_contestacao !== idDecisao || args.p_versao_esperada !== 2 ||
        args.p_aprovar !== true || args.p_fundamento !== "Versão e página conferidas" ||
        typeof args.p_chave !== "string") throw Error("ESCOPO_V248_REVISAO");
    etapaContestacao = "aprovada";
    apontamentos[0].status = "contestado_aprovado";
    return rpcRespond({ schema_versao: "v248-v1", id_contestacao: idDecisao, id_apontamento: apontamentos[0].id,
      versao: 2, hash: hashVersao, status_aprovacao: "aprovada", correlation_id: correlacao });
  }
}

let estadoReapresentacao = "aberto";
const hashReap = "d".repeat(64);
const pacoteReap = identificador(22);
const pacoteCiclo = identificador(23);
const comprovanteReap = identificador(24);
const apresentacaoReap = { id: "${protocoloNovo}", id_competencia: C, id_organizacao: O, id_contrato: K,
  id_pacote: pacoteReap, protocolo: "REAP-SINT-49", forma_apresentacao: "Portal",
  apresentado_em: comum.recebido_em, tipo: "reapresentacao", numero_rodada: 3 };

function reapresentacaoFixture(name: string, args: Record<string, unknown>) {
  const wizard = location.pathname === "${wizardPath}";
  const fixture = new URLSearchParams(location.search).get("fixture");
  if (name === "obter_visao_geral_competencia" && (wizard || estadoReapresentacao === "registrado")) {
    if (args.p_id_competencia !== C) throw Error("ESCOPO_V249_COMPETENCIA");
    return { async abortSignal(signal: AbortSignal) {
      const resposta = await baseline.rpc(name).abortSignal();
      signal.throwIfAborted();
      return { ...resposta, data: { ...resposta.data,
        competencia: { ...resposta.data.competencia, situacao: estadoReapresentacao === "registrado" ? "reapresentado" :
          estadoReapresentacao === "liberado" ? "pode_reapresentar_contratante" : "em_diligencia" },
        allowed_actions: { ...resposta.data.allowed_actions, apresentar: fixture !== "wizard-denied" },
      } };
    } };
  }
  if (name === "avaliar_portao_reapresentacao" && wizard) {
    if (args.p_id_ciclo !== rodadas[0].id) throw Error("ESCOPO_V249_PORTAO");
    const livre = fixture !== "wizard-blocked";
    return rpcRespond({ total: 1, tratados: Number(livre), abertos: Number(!livre), liberado: livre });
  }
  if (name === "liberar_reapresentacao") {
    if (!wizard || args.p_id_ciclo !== rodadas[0].id || args.p_fundamento !== "Reanálise conferida" ||
        estadoReapresentacao !== "aberto") throw Error("ESCOPO_V249_LIBERACAO");
    estadoReapresentacao = "liberado";
    rodadas[0].status = "pronto_reapresentar";
    return rpcRespond({ id_aprovacao: identificador(25), situacao: "pode_reapresentar_contratante", hash_contexto: hashReap });
  }
  if (name === "registrar_reapresentacao") {
    if (!wizard || estadoReapresentacao !== "liberado" || args.p_id_ciclo !== rodadas[0].id ||
        args.p_protocolo !== apresentacaoReap.protocolo || args.p_forma_apresentacao !== apresentacaoReap.forma_apresentacao ||
        args.p_id_comprovante_arquivo !== comprovanteReap || typeof args.p_idempotency_key !== "string")
      throw Error("ESCOPO_V249_REGISTRO");
    estadoReapresentacao = "registrado";
    rodadas[0].status = "reapresentado";
    return rpcRespond(apresentacaoReap.id);
  }
}

function tabelasReapresentacao(table: string) {
  if (!["${wizardPath}", "${novoPath}"].includes(location.pathname) ||
      !["apresentacoes_contratante","pacotes_competencia","pacotes_reapresentacao","itens_pacote_competencia","arquivos"].includes(table))
    return null;
  const scope = new Map<string, unknown>();
  let signal: AbortSignal | undefined;
  const query = {
    select() { return query; },
    eq(k: string, v: unknown) { scope.set(k, v); return query; },
    order() { return query; },
    limit() { return query; },
    range() { return query; },
    abortSignal(s: AbortSignal) { signal = s; return query; },
    async maybeSingle() { const d = dados(); return { data: d[0] ?? null, error: null, status: 200 }; },
    then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
      return Promise.resolve().then(() => {
        const data = dados(); return { data, count: data.length, error: null, status: 200 };
      }).then(resolve, reject);
    }
  };
  function dados() {
    signal?.throwIfAborted();
    if (scope.get("id_organizacao") !== O || scope.get("id_contrato") !== K) throw Error("ESCOPO_V249_ORG");
    if (table === "arquivos") {
      if (scope.get("status_seguranca") !== "aprovado") throw Error("ESCOPO_V249_ARQUIVO");
      return [{ id: comprovanteReap, nome_original: "comprovante-sintetico.pdf", id_organizacao: O, id_contrato: K, status_seguranca: "aprovado" }];
    }
    if (scope.get("id_competencia") !== C) throw Error("ESCOPO_V249_DADOS");
    if (table === "apresentacoes_contratante") {
      if (scope.get("numero_rodada") === 2) return [{ id: A }];
      if ((scope.get("numero_rodada") === 3 && scope.get("tipo") === "reapresentacao") ||
          scope.get("id") === apresentacaoReap.id) return estadoReapresentacao === "registrado" ? [apresentacaoReap] : [];
      throw Error("ESCOPO_V249_APRESENTACAO");
    }
    if (table === "pacotes_reapresentacao") {
      if (scope.get("id_ciclo") !== rodadas[0].id || scope.get("hash") !== hashReap || scope.get("numero") !== 1)
        throw Error("ESCOPO_V249_PACOTE_RODADA");
      return [{ id: pacoteCiclo, id_organizacao: O, id_contrato: K, id_competencia: C, id_ciclo: rodadas[0].id,
        numero: 1, hash: hashReap, reapresentado_em: comum.recebido_em }];
    }
    if (table === "pacotes_competencia") {
      if (scope.get("id") !== pacoteReap) throw Error("ESCOPO_V249_PACOTE_COMPETENCIA");
      return [{ id: pacoteReap, id_organizacao: O, id_contrato: K, id_competencia: C, tipo: "reapresentacao",
        numero: 1, hash_pacote: hashReap, status: "apresentado", congelado_em: comum.recebido_em }];
    }
    if (scope.get("id_pacote") !== pacoteReap) throw Error("ESCOPO_V249_ITENS");
    return [];
  }
  return query;
}

function parecerFixture(name: string, args: Record<string, unknown>) {
  if (name !== "obter_processamento_parecer_v2") return;
  if (args.p_id_competencia !== C || args.p_id_parecer !== pareceres[0].id)
    throw Error("ESCOPO_V276_PROCESSAMENTO");
  return rpcRespond({ id_parecer: pareceres[0].id, id_ciclo: rodadas[0].id,
    id_competencia: C, status: "enfileirado", tentativas: 0, iniciado_em: null,
    concluido_em: null, atualizado_em: comum.recebido_em, correlation_id: correlacao });
}
function tabelasParecer(table: string) {
  if (location.pathname !== "${parecerPath}" && !(location.pathname === "${diligencias}" && table === "pareceres_contratante")) return null;
  if (!["pareceres_contratante", "apresentacoes_contratante", "configuracao_upload"].includes(table)) return null;
  const scope = new Map<string, unknown>();
  let signal: AbortSignal | undefined;
  let offset = 0;
  const query = {
    select() { return query; },
    eq(k: string, v: unknown) { scope.set(k, v); return query; },
    order() { return query; },
    range(a: number, b: number) { if (b-a !== 24) throw Error("PAGINA_V276"); offset = a; return query; },
    abortSignal(s: AbortSignal) { signal = s; return query; },
    async maybeSingle() {
      signal?.throwIfAborted();
      if (table === "configuracao_upload") {
        if (scope.get("id") !== true) throw Error("CONFIG_V276");
        return { data: { extensoes_permitidas: ["pdf"], mimes_permitidos: ["application/pdf"],
          tamanho_maximo_bytes: 10485760, limiar_upload_resumivel_bytes: 6291456 }, error: null, status: 200 };
      }
      const r = dados();
      return { ...r, data: Array.isArray(r.data) ? r.data[0] ?? null : null };
    },
    then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
      return Promise.resolve().then(dados).then(resolve, reject);
    }
  };
  function dados() {
    signal?.throwIfAborted();
    if (scope.get("id_organizacao") !== O || scope.get("id_contrato") !== K || scope.get("id_competencia") !== C)
      throw Error("ESCOPO_V276_LISTA");
    const fixture = new URLSearchParams(location.search).get("fixture");
    if (fixture === "parecer-denied") return { data: null, count: null, error: { code: "42501" }, status: 403 };
    if (table === "apresentacoes_contratante") {
      const a = { id: A, id_organizacao: O, id_contrato: K, id_competencia: C, protocolo: "PROTOCOLO-SINT-76", numero_rodada: 2, apresentado_em: comum.recebido_em };
      const data = offset || (scope.has("id") && scope.get("id") !== A) ? [] : [a];
      return { data, count: 1, error: null, status: 200 };
    }
    const item = { ...pareceres[0], id_arquivo: arquivo, registrado_por: revisor, parecer_final_favoravel: false };
    const total = fixture === "parecer-empty" ? 0 : 1;
    return { data: total && !offset ? [item] : [], count: total, error: null, status: 200 };
  }
  return query;
}

function planoFixture(name: string, args: Record<string, unknown>) {
  if (name === "obter_plano_acao_diligencia_v2") {
    if (args.p_id_ciclo !== rodadas[0].id || args.p_id_apontamento !== apontamentos[0].id ||
        args.p_offset !== 0 || args.p_limite !== 10) throw Error("ESCOPO_PLANO_V2");
    if (new URLSearchParams(location.search).get("fixture") === "plano-negado") return rpcRespond(null, "42501");
    if (etapa === "enfileirado" && ++leiturasPendentes > 1) etapa = "revalidado";
    const aprovada = etapa === "aprovado";
    const pendente = etapa === "pendente";
    return rpcRespond({
      id_ciclo: rodadas[0].id, id_apontamento: apontamentos[0].id, total: 1, offset: 0, limite: 10, criar: true,
      perfil_preferencia: "gestor_contrato", planos: [], dependencias: [],
      responsaveis: [{ id: revisor, nome: "Pessoa sintética da rodada" }],
      tarefas: [{ ...tarefaVisual, status: pendente ? "pendente" : "concluida",
        validacao_solucao: pendente ? "pendente" : aprovada ? "aprovada" : "em_analise",
        versao_registro: pendente ? 1 : aprovada ? 3 : 2, id_execucao: pendente ? null : revalidacao,
        id_evidencia: pendente ? null : versao2, estado_execucao: pendente ? null : etapa === "enfileirado" ? "enfileirado" : "concluido",
        prova: etapa === "revalidado" || aprovada ? { id_analise: analise, id_execucao: revalidacao, id_apontamento: apontamentos[0].id,
          id_evidencia: versao2, id_tarefa: novaTarefa, registrado_em: comum.recebido_em,
          confianca: 0.95, evidencia_suficiente: true, classificacao: "procedente" } : null,
        editar: pendente, submeter: pendente, revisar: etapa === "revalidado", aprovar: etapa === "revalidado",
      }],
    });
  }
  if (name === "avaliar_portao_reapresentacao") {
    if (args.p_id_ciclo !== rodadas[0].id) throw Error("ESCOPO_PORTAO_V2");
    const tratado = etapa === "aprovado" || etapaContestacao === "aprovada";
    return rpcRespond({ total: 1, tratados: Number(tratado), abertos: Number(!tratado), liberado: tratado });
  }
  if (name === "obter_documentos_competencia_v115" && location.pathname === "${itemPath}") {
    if (args.p_id_competencia !== C || args.p_documentos_offset !== 0) throw Error("ESCOPO_VERSAO_V2");
    return rpcRespond({ competencia: { id: C, id_contrato: K, id_organizacao: O }, documentos_total: 1,
      documentos: [{ id: documento, titulo: "Comprovante da competência", situacao: "ativo", versao_atual: 2,
        versao: { id: versao2, numero_versao: 2, hash: hashVersao } }],
    });
  }
  if (name === "submeter_solucao_tarefa_diligencia_v2") {
    if (etapa !== "pendente" || args.p_id_tarefa !== novaTarefa || args.p_id_evidencia !== versao2 ||
        args.p_versao_esperada !== 1 || typeof args.p_chave_idempotencia !== "string") throw Error("ESCOPO_SUBMISSAO_V2");
    etapa = "enfileirado";
    tabelas.tarefas_diligencia.push({ ...ref, id: novaTarefa, descricao: tarefaVisual.descricao, id_evidencia_versao_documento: versao2 });
    return rpcRespond({ schema_versao: "v247-v1", id_tarefa: novaTarefa, versao_registro: 2, status: "concluida",
      validacao_solucao: "em_analise", id_execucao: revalidacao, id_evidencia: versao2, correlation_id: correlacao });
  }
  if (name === "revisar_solucao_tarefa_diligencia_v2") {
    if (etapa !== "revalidado" || args.p_id_tarefa !== novaTarefa || args.p_versao_esperada !== 2 ||
        args.p_aprovar !== true || args.p_fundamento !== "Assinatura conferida na versão 2" ||
        typeof args.p_chave_idempotencia !== "string") throw Error("ESCOPO_REVISAO_V2");
    etapa = "aprovado";
    apontamentos[0].status = "resolvido";
    tabelas.eventos_auditoria.push({ id: identificador(13), id_organizacao: O, id_usuario: revisor,
      id_entidade: novaTarefa, entidade: "tarefas_diligencia", evento: "SolucaoTarefaDiligenciaRevisada",
      criado_em: comum.recebido_em, depois: { aprovada: true, fundamento: args.p_fundamento, revisor } });
    return rpcRespond({ schema_versao: "v247-v1", id_tarefa: novaTarefa, versao_registro: 3, status: "concluida",
      validacao_solucao: "aprovada", id_execucao: revalidacao, id_evidencia: versao2, correlation_id: correlacao });
  }
}

export const supabase = {
  ...baseline,
  auth: {
    ...baseline.auth,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  rpc(name: string, args: Record<string, unknown>) {
    const parecer = parecerFixture(name, args);
    if (parecer) return parecer;
    const reapresentacao = reapresentacaoFixture(name, args);
    if (reapresentacao) return reapresentacao;
    const contestacao = contestacaoFixture(name, args);
    if (contestacao) return contestacao;
    const plano = planoFixture(name, args);
    if (plano) return plano;
    if (name !== "obter_fonte_apontamento_contratante") return baseline.rpc(name);
    if (args.p_id_ciclo !== rodadas[0].id || args.p_id_apontamento !== apontamentos[0].id)
      throw Error("ESCOPO_ORIGEM_APONTAMENTO");
    return { async abortSignal(signal: AbortSignal) {
      signal.throwIfAborted();
      return { data: { ...ref, estado: "REGISTRADA", fonte: { id_parecer: pareceres[0].id,
        id_arquivo: arquivo, id_apresentacao: A, nome_original: "parecer-de-origem-02.pdf",
        numero_documento: pareceres[0].numero_documento, arquivo_sha256: "a".repeat(64),
        pagina: 3, trecho: "Trecho do parecer de origem" } }, error: null, status: 200 };
    } };
  },
  from(table: string) {
    const parecer = tabelasParecer(table);
    if (parecer) return parecer;
    const reapresentacao = tabelasReapresentacao(table);
    if (reapresentacao) return reapresentacao;
    if (Object.hasOwn(tabelas, table) && (table !== "itens_pacote_competencia" || location.pathname === "${itemPath}")) {
      const filtros = new Map<string, string>();
      const listas = new Map<string, string[]>();
      let signal: AbortSignal | undefined;
      const consulta = {
        select() { return consulta; },
        eq(chave: string, valor: string) { filtros.set(chave, valor); return consulta; },
        in(chave: string, valores: string[]) { listas.set(chave, valores); return consulta; },
        order() { return consulta; },
        limit() { return consulta; },
        abortSignal(valor: AbortSignal) { signal = valor; return consulta; },
        then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
          return Promise.resolve().then(() => {
            signal?.throwIfAborted();
            if (filtros.get("id_organizacao") !== O) throw Error("ESCOPO_EVIDENCIAS_ORG");
            if (table === "eventos_auditoria") {
              if (!listas.get("id_entidade")?.includes(tarefa) || filtros.get("evento") !== "SolucaoTarefaDiligenciaRevisada")
                throw Error("ESCOPO_REVISAO_AUDITORIA");
            } else {
              if (filtros.get("id_contrato") !== K) throw Error("ESCOPO_EVIDENCIAS_CONTRATO");
              if (table !== "versoes_documento" && filtros.get("id_competencia") !== C)
                throw Error("ESCOPO_EVIDENCIAS_COMPETENCIA");
              if (table === "itens_pacote_competencia" && filtros.get("id_pacote") !== P)
                throw Error("ESCOPO_PACOTE_APONTAMENTO");
              if (["analises_apontamentos", "tarefas_diligencia", "desfechos_apontamentos"].includes(table) &&
                  filtros.get("id_apontamento") !== apontamentos[0].id)
                throw Error("ESCOPO_ITEM_APONTAMENTO");
            }
            return { data: tabelas[table], error: null, status: 200 };
          }).then(resolve, reject);
        },
      };
      return consulta;
    }
    if (table !== "ciclos_diligencia" && table !== "pareceres_contratante" &&
        table !== "apontamentos_contratante") return baseline.from(table);
    const scope = new Map<string, string>();
    const ordem: string[] = [];
    let select = "";
    let signal: AbortSignal | undefined;
    const fixture = () => new URLSearchParams(location.search).get("fixture");
    const ok = (data: unknown[], status = 200) => ({ data, error: null, status, count: data.length });
    const query = {
      select(campos: string) { select = campos; return query; },
      eq(key: string, value: string) { scope.set(key, value); return query; },
      order(key: string, options: { ascending: boolean }) {
        if (options.ascending !== false) throw Error("ORDEM_V2");
        ordem.push(key);
        return query;
      },
      range(from: number, to: number) {
        if (from !== 0 || to !== 24) throw Error("PAGINACAO_V2");
        return query;
      },
      abortSignal(value: AbortSignal) { signal = value; return query; },
      async maybeSingle() {
        signal?.throwIfAborted();
        if (table === "apontamentos_contratante") {
          if (scope.size !== 5 || scope.get("id_ciclo") !== chaves.id_ciclo || scope.get("id_competencia") !== C ||
              scope.get("id_contrato") !== K || scope.get("id_organizacao") !== O || scope.get("id") !== apontamentos[0].id)
            throw Error("ESCOPO_DETALHE_APONTAMENTO");
          if (fixture() === "item-denied") return { data: null, error: { code: "42501" }, status: 403 };
          return { data: apontamentos[0], error: null, status: 200 };
        }
        if (table !== "ciclos_diligencia" || scope.size !== 2 || scope.get("id_organizacao") !== O) {
          throw Error("ESCOPO_CICLO_V2");
        }
        const data = fixture() === "cycle-denied" ? null :
          (rodadas.find((rodada) => rodada.id === scope.get("id")) ?? null);
        return { data, error: null, status: 200 };
      },
      then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
        const consultar = () => {
          signal?.throwIfAborted();
          if (scope.get("id_competencia") !== C || scope.get("id_contrato") !== K ||
              scope.get("id_organizacao") !== O) throw Error("ESCOPO_V2");
          if (table === "ciclos_diligencia") {
            if (scope.size !== 3 || ordem.join(",") !== "numero_rodada,id") throw Error("ESCOPO_V2_LISTA");
            if (fixture() === "denied") return { data: null, error: { code: "42501" }, status: 403, count: null };
            return ok(rodadas);
          }
          if (scope.size !== 4 || scope.get("id_ciclo") !== chaves.id_ciclo) throw Error("ESCOPO_DOS_FILHOS_V2");
          if (table === "pareceres_contratante") {
            if (!select.includes("pareceres_contratante_id_apresentacao_fkey") ||
                ordem.join(",") !== "recebido_em,id") throw Error("CONTRATO_PARECER_V2");
            return ok(pareceres);
          }
          if (!select.includes("valor_questionado::text") ||
              ordem.join(",") !== "criado_em,id") throw Error("CONTRATO_APONTAMENTO_V2");
          return ok(apontamentos);
        };
        return Promise.resolve().then(consultar).then(resolve, reject);
      },
    };
    return query;
  },
};
`,
    "entry.tsx": `
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CompetenciaVisaoGeral } from ${JSON.stringify(root + "/src/components/competencias/CompetenciaVisaoGeral.tsx")};
import { DiligenciasCompetencia } from ${JSON.stringify(root + "/src/components/diligencias/DiligenciasCompetencia.tsx")};
import { ApontamentoDiligencia } from ${JSON.stringify(root + "/src/components/diligencias/ApontamentoDiligencia.tsx")};
import { CicloDiligencia } from ${JSON.stringify(root + "/src/components/diligencias/CicloDiligencia.tsx")};
import { ReapresentacaoDiligencia } from ${JSON.stringify(root + "/src/components/diligencias/ReapresentacaoDiligencia.tsx")};
import { PareceresContratante } from ${JSON.stringify(root + "/src/components/diligencias/PareceresContratante.tsx")};
import { CompetenciaProtocolo } from ${JSON.stringify(root + "/src/components/competencias/CompetenciaProtocolo.tsx")};
import { definirPreferenciaOrganizacao } from ${JSON.stringify(root + "/src/lib/organizacao/preferenciaOrganizacao.ts")};
import { C, O } from "./client";

definirPreferenciaOrganizacao("fixture-user", O);
function ApresentacaoFixture() {
  const [path, setPath] = useState(location.pathname + location.search);
  useEffect(() => {
    const atualizar = () => setPath(location.pathname + location.search);
    window.addEventListener("popstate", atualizar);
    return () => window.removeEventListener("popstate", atualizar);
  }, []);
  const endereco = new URL(path, location.origin);
  const [, modulo, id, subrota, origem] = endereco.pathname.split("/");
  const foco = endereco.searchParams.get("foco") ?? undefined;
  const offset = Number(endereco.searchParams.get("offset")) || undefined;
  if (modulo === "diligencias" && subrota === "apontamentos")
    return <ApontamentoDiligencia cicloId={id} id={origem} offset={offset} />;
  if (modulo === "diligencias" && subrota === "reapresentar") return <ReapresentacaoDiligencia cicloId={id} offset={offset} />;
  if (modulo === "diligencias") return <CicloDiligencia id={id} foco={foco} offset={offset} />;
  if (subrota === "diligencias") return <DiligenciasCompetencia id={id} />;
  if (subrota === "pareceres-contratante") return <PareceresContratante id={id} apresentacaoId={endereco.searchParams.get("apresentacaoId") ?? undefined} />;
  if (subrota === "apresentacoes") return <CompetenciaProtocolo id={id} apresentacaoId={origem} />;
  return <CompetenciaVisaoGeral id={C} />;
}
createRoot(document.getElementById("root")!).render(<ApresentacaoFixture />);
`,
  };
}

export async function collectDiligenciasVisual(
  browser,
  { base, output, headSha, widths, themes, baseFixtures },
) {
  const root = process.cwd();
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const source = new URL(base);
  if (
    source.protocol !== "http:" ||
    source.hostname !== "127.0.0.1" ||
    git("rev-parse", "HEAD") !== headSha
  ) {
    throw Error("TESTE_C_V2_SOURCE");
  }
  const dir = mkdtempSync(join(tmpdir(), "contaos-v2-testec-"));
  const target = join(output, "v2-diligencias");
  const cases = diligenciasVisualCases(widths, themes);
  const records = [];
  const cycleRecords = [];
  const itemRecords = [];
  const planoRecords = [];
  const contestacaoRecords = [];
  const reapresentacaoRecords = [];
  const parecerRecords = [];
  let server;

  try {
    mkdirSync(join(target, "screenshots"), { recursive: true });
    symlinkSync(join(root, "node_modules"), join(dir, "node_modules"), "dir");
    for (const [name, content] of Object.entries(diligenciasFixtureFiles(root, baseFixtures))) {
      writeFileSync(join(dir, name), content);
    }
    execFileSync("bun", [join(dir, "build.mjs")], {
      cwd: root,
      timeout: 30000,
      maxBuffer: 262144,
      env: { PATH: process.env.PATH },
    });
    const js = readFileSync(join(dir, "entry.js"));
    const response = await fetch(new URL("/src/styles.css?direct", source), {
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw Error("TESTE_C_V2_CSS");
    const css = Buffer.from(await response.arrayBuffer());
    if (css.length === 0 || css.length > 4194304) throw Error("TESTE_C_V2_CSS");
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/style.css"></head>
<body><div id="root"></div><script type="module" src="/entry.js"></script></body></html>`;
    server = createServer((request, reply) => {
      const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (path === "/entry.js") {
        reply.setHeader("content-type", "text/javascript");
        reply.end(js);
      } else if (path === "/style.css") {
        reply.setHeader("content-type", "text/css");
        reply.end(css);
      } else if (
        [overview, diligencias, cicloPath, protocoloPath, itemPath, wizardPath, novoPath, parecerPath].includes(
          path,
        )
      ) {
        reply.setHeader("content-type", "text/html");
        reply.end(html);
      } else {
        reply.statusCode = path === "/favicon.ico" ? 204 : 404;
        reply.end();
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = "http://127.0.0.1:" + server.address().port;

    for (const { width, theme } of cases) {
      let etapaVisual = "V2_CUMULATIVO";
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: "pt-BR",
        reducedMotion: "reduce",
        permissions: [],
      });
      let externa = 0;
      let erros = 0;
      try {
        await context.route("**/*", (route) => {
          if (new URL(route.request().url()).origin === origin) return route.continue();
          externa++;
          return route.abort();
        });
        await context.addInitScript((value) => {
          const apply = () => document.documentElement.classList.toggle("dark", value === "dark");
          if (document.documentElement) apply();
          else document.addEventListener("DOMContentLoaded", apply, { once: true });
        }, theme);
        const page = await context.newPage();
        page.on("pageerror", () => erros++);
        page.on("console", (message) => {
          if (message.type() === "error") erros++;
        });
        await page.goto(origin + overview);
        const atalho = page.getByRole("link", { name: "Diligências", exact: true });
        await atalho.focus();
        if (!(await atalho.evaluate((element) => document.activeElement === element))) {
          throw Error("TESTE_C_V2_FOCO");
        }
        await atalho.press("Enter");
        await page.waitForURL(origin + diligencias);
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        await page.getByRole("heading", { name: "Rodada 1", exact: true }).waitFor();
        await page.reload();
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        const metrics = await page.evaluate(() => ({
          overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          dark: document.documentElement.classList.contains("dark"),
          titles: [...document.querySelectorAll("main li h2")].map(
            (element) => element.textContent,
          ),
        }));
        if (
          metrics.overflow > 1 ||
          metrics.dark !== (theme === "dark") ||
          metrics.titles.join(",") !== "Rodada 2,Rodada 1"
        ) {
          throw Error("TESTE_C_V2_LISTA");
        }
        const screenshot = "screenshots/V2-01_" + width + "_" + theme + ".png";
        const bytes = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, screenshot), bytes);
        const abrirCiclo = page.getByRole("link", { name: "Abrir rodada 2" });
        await abrirCiclo.focus();
        if (!(await abrirCiclo.evaluate((link) => document.activeElement === link)))
          throw Error("TESTE_C_CICLO_FOCO");
        await abrirCiclo.press("Enter");
        await page.waitForURL(origin + cicloPath);
        const verificarCiclo = async () => {
          await page.getByRole("heading", { name: "Ciclo de diligência", exact: true }).waitFor();
          await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
          await page.getByText("PARECER-SINTETICO-02", { exact: true }).waitFor();
          await page.getByText("Valor de serviço apontado nesta rodada", { exact: true }).waitFor();
          await page.getByText(/R\$\s*9\.999\.999\.999\.999\.999,99/).waitFor();
          const overflow = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth),
          );
          if (overflow > 1) throw Error("TESTE_C_V2_CICLO_OVERFLOW");
          return overflow;
        };
        await verificarCiclo();
        await page.reload();
        const overflowCiclo = await verificarCiclo();
        const imagemCiclo = "screenshots/V2-02_" + width + "_" + theme + ".png";
        const bytesCiclo = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemCiclo), bytesCiclo);
        const protocolo = page.getByRole("link", { name: "Ver protocolo de origem" });
        await protocolo.press("Enter");
        await page.waitForURL(origin + protocoloPath);
        await page.getByText("PROTOCOLO-SINTETICO-2026-09", { exact: true }).waitFor();
        await page.goBack();
        await page.waitForURL(origin + cicloPath);
        await verificarCiclo();
        const abrirItem = page.getByRole("link", { name: "Abrir apontamento AP-02" });
        await abrirItem.focus();
        if (!(await abrirItem.evaluate((element) => document.activeElement === element)))
          throw Error("TESTE_C_V2_APONTAMENTO_FOCO");
        await abrirItem.press("Enter");
        await page.waitForURL(origin + itemPath);
        const verificarItem = async () => {
          await page.getByRole("heading", { name: "Detalhe do apontamento" }).waitFor();
          await page.getByText("parecer-de-origem-02.pdf", { exact: true }).waitFor();
          await page.getByText("Versão presente no pacote de origem", { exact: true }).waitFor();
          await page.getByText("Versão criada após o congelamento", { exact: true }).waitFor();
          await page
            .getByRole("region", { name: "Revisões humanas das tarefas" })
            .getByText("Solução validada", { exact: true })
            .waitFor();
          const largura = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth),
          );
          if (largura > 1) throw Error("TESTE_C_V2_APONTAMENTO_OVERFLOW");
          return largura;
        };
        await verificarItem();
        await page.reload();
        const overflowItem = await verificarItem();
        const imagemItem = "screenshots/V2-03_" + width + "_" + theme + ".png";
        const bytesItem = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemItem), bytesItem);

        etapaVisual = "V2_04_ABERTURA";
        const gatilhoPlano = page.getByRole("button", { name: "Abrir plano de ação" });
        await gatilhoPlano.focus();
        await gatilhoPlano.press("Enter");
        const plano = page.getByRole("dialog", { name: "Plano de ação" });
        await plano.getByRole("heading", { name: "Obter assinatura do comprovante" }).waitFor();
        await plano.getByText("Apontamentos tratados na rodada 0 de 1.", { exact: true }).waitFor();
        etapaVisual = "V2_04_CAPTURA";
        await plano.evaluate(async (element) => {
          await Promise.allSettled(element.getAnimations().map((item) => item.finished));
        });
        const overflowPlano = await plano.evaluate((element) =>
          Math.max(
            0,
            element.scrollWidth - element.clientWidth,
            element.getBoundingClientRect().right - innerWidth,
          ),
        );
        if (overflowPlano > 1) throw Error("TESTE_C_V2_PLANO_OVERFLOW");
        const imagemPlano = "screenshots/V2-04_" + width + "_" + theme + ".png";
        const bytesPlano = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemPlano), bytesPlano);
        etapaVisual = "V2_04_SUBMISSAO";
        await plano.getByRole("button", { name: "Submeter evidência" }).click();
        await plano
          .getByLabel("Versão da evidência")
          .selectOption({ label: "Comprovante da competência · versão 2" });
        await plano.getByRole("button", { name: "Enviar para revalidação" }).click();
        await plano.getByText("Revalidação em processamento.", { exact: true }).waitFor();
        if (await plano.getByRole("button", { name: "Revisar solução" }).count())
          throw Error("TESTE_C_V2_PLANO_REVISAO_ANTES");
        etapaVisual = "V2_04_REVISAO";
        await plano.getByRole("button", { name: "Atualizar plano" }).click();
        await plano.getByRole("button", { name: "Revisar solução" }).click();
        await plano.getByLabel("Decisão").selectOption("aprovar");
        await plano.getByLabel("Fundamento da revisão").fill("Assinatura conferida na versão 2");
        await plano.getByRole("button", { name: "Registrar revisão" }).click();
        await plano.getByText("Revisão registrada.", { exact: true }).waitFor();
        await plano.getByText("Apontamentos tratados na rodada 1 de 1.", { exact: true }).waitFor();
        await plano.getByText("Solução validada", { exact: true }).waitFor();
        etapaVisual = "V2_04_RETORNO";
        await page.keyboard.press("Escape");
        await plano.waitFor({ state: "hidden" });
        await page.waitForFunction(
          () => document.activeElement?.textContent?.trim() === "Abrir plano de ação",
        );
        await page.getByText("Resolvido", { exact: true }).waitFor();
        await page.getByText("Assinatura conferida na versão 2", { exact: true }).waitFor();
        await page.getByRole("link", { name: "Voltar ao ciclo" }).press("Enter");
        await page.waitForURL((url) => url.pathname === cicloPath);
        await page
          .getByRole("region", { name: "Apontamentos da rodada" })
          .getByRole("listitem")
          .filter({ has: page.getByRole("heading", { name: "AP-02", exact: true }) })
          .getByText("Resolvido", { exact: true })
          .waitFor();
        etapaVisual = "V2_04_RLS";
        await page.goto(origin + itemPath + "?fixture=plano-negado");
        await verificarItem();
        await page.getByRole("button", { name: "Abrir plano de ação" }).click();
        await plano
          .getByRole("alert")
          .filter({ hasText: "Seu perfil não tem permissão para esta operação no plano de ação." })
          .waitFor();
        if (
          (await plano.getByText("Obter assinatura do comprovante", { exact: true }).count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_PLANO_ISOLAMENTO");
        await plano.getByRole("button", { name: "Fechar plano de ação" }).click();
        await plano.waitFor({ state: "hidden" });
        planoRecords.push({
          width,
          theme,
          screenshot: imagemPlano,
          sha256: digest(bytesPlano),
          status: "PASS",
          foco: true,
          retorno: true,
          versaoVigente: true,
          revalidacao: true,
          revisaoHumana: true,
          portaoAtualizado: true,
          cicloAtualizado: true,
          negacaoSemDados: true,
          overflow: overflowPlano,
          chamadasExternas: externa,
          errosDePagina: erros,
        });

        await page.getByRole("link", { name: "Voltar ao ciclo" }).press("Enter");
        await page.waitForURL(
          (url) =>
            url.pathname === cicloPath && url.searchParams.get("foco") === APONTAMENTO_V2_FIXTURE,
        );
        await page.waitForFunction(
          (id) => document.activeElement?.id === "abrir-apontamento-" + id,
          APONTAMENTO_V2_FIXTURE,
        );
        await page.goto(origin + itemPath + "?fixture=item-denied");
        await page.getByRole("alert").filter({ hasText: "não possui permissão" }).waitFor();
        if (
          (await page.getByText("parecer-de-origem-02.pdf", { exact: true }).count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_APONTAMENTO_ISOLAMENTO");
        itemRecords.push({
          width,
          theme,
          screenshot: imagemItem,
          sha256: digest(bytesItem),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          origemVerificada: true,
          pacoteVerificado: true,
          revisaoVerificada: true,
          negacaoSemDados: true,
          overflow: overflowItem,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        etapaVisual = "V2_05_ABERTURA";
        await page.goto(origin + itemPath);
        const gatilhoContestacao = page.getByRole("button", { name: "Abrir contestação" });
        await gatilhoContestacao.focus();
        await gatilhoContestacao.press("Enter");
        const contestacao = page.getByRole("dialog", { name: "Contestação" });
        await contestacao.getByText("Nenhuma versão registrada para este apontamento.").waitFor();
        etapaVisual = "V2_05_FILA_MINUTA";
        await contestacao.getByRole("button", { name: "Solicitar minuta" }).click();
        await contestacao.getByText("Minuta na fila.").waitFor();
        etapaVisual = "V2_05_LEITURA_MINUTA";
        await contestacao.getByRole("button", { name: "Atualizar contestação" }).click();
        await contestacao.getByText("Contestação recomendada para avaliação humana.").waitFor();
        await contestacao.getByText("Comprovante da competência · versão 2 · página 3").waitFor();
        if (await contestacao.getByRole("button", { name: "Revisar versão 1" }).count())
          throw Error("TESTE_C_V248_MINUTA_SEM_REVISAO");
        etapaVisual = "V2_05_MAPA";
        await contestacao.getByRole("button", { name: "Usar versão 1 como base" }).click();
        await contestacao
          .getByLabel("Manifestação")
          .fill("Manifestação humana com prova documental");
        await contestacao.getByRole("button", { name: "Submeter versão" }).click();
        await contestacao.getByRole("button", { name: "Revisar versão 2" }).click();
        await contestacao.getByLabel("Decisão").selectOption("aprovar");
        await contestacao.getByLabel("Fundamento da revisão").fill("Versão e página conferidas");
        await contestacao.getByRole("button", { name: "Registrar decisão" }).click();
        await contestacao.getByText("Revisão da contestação registrada.").waitFor();
        await contestacao.getByText("Apontamentos tratados na rodada 1 de 1.").waitFor();
        await contestacao.getByRole("link", { name: "Abrir auditoria" }).waitFor();
        await contestacao.evaluate(async (element) => {
          await Promise.allSettled(element.getAnimations().map((item) => item.finished));
        });
        const overflowContestacao = await contestacao.evaluate((element) =>
          Math.max(
            0,
            element.scrollWidth - element.clientWidth,
            element.getBoundingClientRect().right - innerWidth,
          ),
        );
        if (overflowContestacao > 1) throw Error("TESTE_C_V248_OVERFLOW");
        const imagemContestacao = "screenshots/V2-05_" + width + "_" + theme + ".png";
        const bytesContestacao = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemContestacao), bytesContestacao);
        await page.keyboard.press("Escape");
        await contestacao.waitFor({ state: "hidden" });
        await page.waitForFunction(
          () => document.activeElement?.textContent?.trim() === "Abrir contestação",
        );
        etapaVisual = "V2_05_RLS";
        await page.goto(origin + itemPath + "?fixture=contestacao-negada");
        await page.getByRole("button", { name: "Abrir contestação" }).click();
        await contestacao.getByRole("alert").filter({ hasText: "não tem permissão" }).waitFor();
        if (
          (await contestacao.getByRole("heading", { name: "Histórico de versões" }).count()) ||
          externa ||
          erros
        )
          throw Error("TESTE_C_V248_ISOLAMENTO");
        contestacaoRecords.push({
          width,
          theme,
          screenshot: imagemContestacao,
          sha256: digest(bytesContestacao),
          status: "PASS",
          foco: true,
          retorno: true,
          mapa: true,
          versaoExata: true,
          minuta: true,
          revisaoHumana: true,
          portaoAtualizado: true,
          auditoria: true,
          negacaoSemDados: true,
          overflow: overflowContestacao,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        await page.goto(origin + cicloPath);
        await verificarCiclo();
        await page.getByRole("link", { name: "Voltar às diligências" }).press("Enter");
        await page.waitForURL(origin + diligencias);
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        await page.goto(origin + cicloPath + "?fixture=cycle-denied");
        await page
          .getByRole("alert")
          .filter({ hasText: "Ciclo indisponível para consulta." })
          .waitFor();
        if (
          (await page.getByText("PARECER-SINTETICO-02", { exact: true }).count()) ||
          (await page
            .getByText("Valor de serviço apontado nesta rodada", { exact: true })
            .count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_CICLO_ISOLAMENTO");
        cycleRecords.push({
          width,
          theme,
          screenshot: imagemCiclo,
          sha256: digest(bytesCiclo),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          protocoloV120: true,
          negacaoSemDados: true,
          overflow: overflowCiclo,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        await page.goto(origin + diligencias);
        await page.getByRole("link", { name: "Voltar à competência" }).click();
        await page.waitForURL(origin + overview);
        await page.goto(origin + diligencias + "?fixture=denied");
        await page.getByText(/não possui permissão para consultar as diligências/i).waitFor();
        if ((await page.getByRole("heading", { name: /Rodada \d/ }).count()) || erros || externa) {
          throw Error("TESTE_C_V2_ISOLAMENTO_FIXTURE");
        }
        etapaVisual = "V2_06_PORTAO";
        await page.goto(origin + wizardPath + "?fixture=wizard-blocked");
        await page
          .getByText("O portão exige que todos os apontamentos da rodada estejam tratados.")
          .waitFor();
        if (await page.getByRole("button", { name: "Revisar liberação" }).count())
          throw Error("TESTE_C_V2_49_PORTAO");
        etapaVisual = "V2_06_NAVEGACAO";
        await page.goto(origin + cicloPath);
        await page.getByRole("link", { name: "Abrir reapresentação" }).press("Enter");
        await page.waitForURL(origin + wizardPath);
        await page.getByRole("link", { name: "Ver protocolo da rodada anterior" }).waitFor();
        etapaVisual = "V2_06_LIBERACAO";
        await page.getByLabel("Fundamento da liberação").fill("Reanálise conferida");
        await page.getByRole("button", { name: "Revisar liberação" }).click();
        await page.getByRole("button", { name: "Confirmar liberação" }).click();
        etapaVisual = "V2_06_REGISTRO";
        await page.getByLabel("Protocolo", { exact: true }).fill("REAP-SINT-49");
        await page.getByLabel("Forma da reapresentação").fill("Portal");
        await page
          .getByLabel("Comprovante aprovado (opcional)")
          .selectOption({ label: "comprovante-sintetico.pdf" });
        await page.getByRole("button", { name: "Revisar registro" }).click();
        await page.getByRole("button", { name: "Confirmar reapresentação" }).click();
        etapaVisual = "V2_06_RECIBO";
        await page.getByRole("heading", { name: "Recibo da reapresentação" }).waitFor();
        await page.getByText("Protocolo REAP-SINT-49 · rodada 3").waitFor();
        await page.getByRole("link", { name: "Abrir auditoria" }).waitFor();
        const overflowReapresentacao = await page.evaluate(() =>
          Math.max(0, document.documentElement.scrollWidth - innerWidth),
        );
        if (overflowReapresentacao > 1) throw Error("TESTE_C_V2_49_OVERFLOW");
        const imagemReapresentacao = "screenshots/V2-06_" + width + "_" + theme + ".png";
        const bytesReapresentacao = await page.screenshot({
          fullPage: true,
          animations: "disabled",
        });
        writeFileSync(join(target, imagemReapresentacao), bytesReapresentacao);
        await page.getByRole("link", { name: "Abrir protocolo da reapresentação" }).press("Enter");
        await page.waitForURL(origin + novoPath);
        await page.getByText("REAP-SINT-49", { exact: true }).waitFor();
        etapaVisual = "V2_06_RLS";
        await page.goto(origin + wizardPath + "?fixture=wizard-denied");
        await page.getByRole("alert").filter({ hasText: "não tem permissão" }).waitFor();
        if (
          (await page.getByRole("button", { name: "Revisar liberação" }).count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_49_ISOLAMENTO");
        reapresentacaoRecords.push({
          width,
          theme,
          screenshot: imagemReapresentacao,
          sha256: digest(bytesReapresentacao),
          status: "PASS",
          portao: true,
          liberacao: true,
          comprovante: true,
          protocoloV120: true,
          anteriorPreservado: true,
          auditoria: true,
          negacaoSemDados: true,
          overflow: overflowReapresentacao,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        etapaVisual = "V2_07_PARECER";
        await page.goto(origin + diligencias);
        await page.getByText("Processamento: Enfileirado", { exact: true }).waitFor();
        const atalhoParecer = page.getByRole("link", { name: "Pareceres do contratante" });
        await atalhoParecer.focus();
        if (!(await atalhoParecer.evaluate((element) => document.activeElement === element)))
          throw Error("TESTE_C_V2_76_FOCO");
        await atalhoParecer.press("Enter");
        await page.waitForURL(origin + parecerPath);
        await page.getByRole("heading", { name: "PARECER-SINTETICO-02" }).waitFor();
        await page.getByText("Enfileirado", { exact: true }).waitFor();
        await page.getByRole("link", { name: "Protocolo original" }).waitFor();
        await page.getByLabel("Classificação").focus();
        if (!(await page.getByLabel("Classificação").evaluate((element) => document.activeElement === element)))
          throw Error("TESTE_C_V2_76_FORMULARIO");
        await page.getByLabel("Classificação").fill("Conferência sintética");
        if (!(await page.getByRole("button", { name: "Registrar parecer", exact: true }).isDisabled()))
          throw Error("TESTE_C_V2_76_ARQUIVO");
        const overflowParecer = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
        if (overflowParecer > 1) throw Error("TESTE_C_V2_76_OVERFLOW");
        const imagemParecer = "screenshots/V2-07_" + width + "_" + theme + ".png";
        const bytesParecer = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemParecer), bytesParecer);
        await page.getByRole("link", { name: "Protocolo original" }).press("Enter");
        await page.waitForURL(origin + protocoloPath);
        await page.getByRole("link", { name: "Pareceres do contratante" }).press("Enter");
        await page.waitForURL(origin + parecerPath + "?apresentacaoId=" + protocoloId);
        await page.getByRole("heading", { name: "PARECER-SINTETICO-02" }).waitFor();
        if (!(await page.getByLabel("Apresentação", { exact: true }).isDisabled()) ||
            (await page.getByLabel("Apresentação", { exact: true }).inputValue()) !== protocoloId)
          throw Error("TESTE_C_V2_76_VINCULO");
        await page.goto(origin + parecerPath + "?fixture=parecer-empty");
        await page.getByText("Nenhum parecer recebido.", { exact: true }).waitFor();
        await page.goto(origin + parecerPath + "?fixture=parecer-denied");
        await page.getByRole("alert").filter({ hasText: "Sem permissão" }).waitFor();
        if (await page.getByRole("heading", { name: "PARECER-SINTETICO-02" }).count() ||
            await page.getByRole("button", { name: "Registrar parecer", exact: true }).count() || externa || erros)
          throw Error("TESTE_C_V2_76_ISOLAMENTO");
        parecerRecords.push({ width, theme, screenshot: imagemParecer, sha256: digest(bytesParecer),
          status: "PASS", foco: true, arquivoObrigatorio: true, protocoloV120: true,
          vazio: true, negacaoSemDados: true, overflow: overflowParecer, chamadasExternas: externa, errosDePagina: erros });
        records.push({
          width,
          theme,
          screenshot,
          sha256: digest(bytes),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          negacaoSemDados: true,
          overflow: metrics.overflow,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : "";
        const codigo = /^TESTE_C_V2_[A-Z0-9_]+$/.test(mensagem)
          ? mensagem
          : erro instanceof Error && erro.name === "TimeoutError"
            ? "TEMPO_ESGOTADO"
            : "EXECUCAO_INTERROMPIDA";
        console.error("TESTE_C_V2", etapaVisual, width, theme, codigo);
        throw erro;
      } finally {
        await context.close();
      }
    }
    if (
      cases.length !== 8 ||
      records.length !== cases.length ||
      cycleRecords.length !== cases.length ||
      itemRecords.length !== cases.length ||
      planoRecords.length !== cases.length ||
      contestacaoRecords.length !== cases.length ||
      reapresentacaoRecords.length !== cases.length ||
      parecerRecords.length !== cases.length
    ) {
      throw Error("TESTE_C_V2_COBERTURA");
    }
    const record = {
      schema: "contaos.v2-diligencias.offline-visual.v7",
      mode: "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS",
      headSha,
      sourceTree: git("rev-parse", "HEAD^{tree}"),
      styleSha256: digest(css),
      sourceHashes: Object.fromEntries(
        [
          "src/routeTree.gen.ts",
          "src/components/competencias/CompetenciaVisaoGeral.tsx",
          "src/components/diligencias/DiligenciasCompetencia.tsx",
          "src/lib/diligencias/diligenciasDados.ts",
          "src/components/diligencias/CicloDiligencia.tsx",
          "src/components/competencias/CompetenciaProtocolo.tsx",
          "src/lib/diligencias/cicloDiligenciaDados.ts",
          "src/components/diligencias/ApontamentoDiligencia.tsx",
          "src/components/diligencias/PlanoAcaoDiligencia.tsx",
          "src/lib/diligencias/planoAcaoDiligenciaDados.ts",
          "src/components/diligencias/ContestacaoDiligencia.tsx",
          "src/lib/diligencias/contestacaoDiligenciaDados.ts",
          "src/components/diligencias/ReapresentacaoDiligencia.tsx",
          "src/lib/diligencias/reapresentacaoDiligenciaDados.ts",
          "src/components/diligencias/PareceresContratante.tsx",
          "src/lib/diligencias/pareceresContratanteDados.ts",
          "src/routes/competencias_.$id_.pareceres-contratante.tsx",
          "src/routes/diligencias_.$cicloId_.reapresentar.tsx",
          "src/lib/diligencias/apontamentoDiligenciaDados.ts",
          "src/lib/diligencias/apontamentoEvidenciasDados.ts",
          "src/routes/diligencias_.$cicloId_.apontamentos_.$id.tsx",
        ].map((file) => [file, digest(readFileSync(join(root, file)))]),
      ),
      complete: true,
      records,
      cycleRecords,
      itemRecords,
      planoRecords,
      contestacaoRecords,
      reapresentacaoRecords,
      parecerRecords,
    };
    const report = JSON.stringify(record, null, 2) + "\n";
    writeFileSync(join(target, "report.json"), report);
    writeFileSync(
      join(target, "SHA256SUMS"),
      [
        ...[
          ...records,
          ...cycleRecords,
          ...itemRecords,
          ...planoRecords,
          ...contestacaoRecords,
          ...reapresentacaoRecords,
          ...parecerRecords,
        ].map((r) => r.sha256 + "  " + r.screenshot),
        digest(report) + "  report.json",
      ].join("\n") + "\n",
    );
    console.log("V2_01_OFFLINE_VISUAL_PASS_8");
    console.log("V2_02_OFFLINE_VISUAL_PASS_8");
    console.log("V2_03_OFFLINE_VISUAL_PASS_8");
    console.log("V2_04_OFFLINE_VISUAL_PASS_8");
    console.log("V2_05_OFFLINE_VISUAL_PASS_8");
    console.log("V2_06_OFFLINE_VISUAL_PASS_8");
    console.log("V2_07_OFFLINE_VISUAL_PASS_8");
    return record;
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
}

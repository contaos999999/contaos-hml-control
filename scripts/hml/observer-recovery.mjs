/**
 * RECONSTRUCTED RECOVERY, 2026-11-08. Not byte-identical to lost /tmp originals.
 * Historical 26/26 results and original SHA256 do NOT attest this reconstruction.
 * Requires fresh Node tests, integration review and CI before incorporation/use.
 * Self-contained observer only: no browser launch, credentials, HML or mutations.
 * Sources: PR373 parser/projection block blob f64689d0fa1bf01908a85243b686202a7975a97d;
 * SDK SELECTs read at main d8594696b315d28658143f4bae19ac5727a2d681.
 * read(table,where,{select}) / observedAfter(name,where,ordinal,{select}):
 * explicit independent projections NEVER inherit another projection's freshness.
 */
import {Buffer} from "node:buffer";
export const FIXTURE=Object.freeze({api:"https://gklhhhyosgasnyoxlrui.supabase.co",organization:"e87f7e68-c5ae-4077-943b-02a4afd8b6ee",contract:"be89ef7e-d839-46c0-9cfb-4da81edf8b74",source:"8b942e46-a29b-40d9-8ad4-04aaf9124a34",contractualDocument:"525e54fc-feec-4dc0-b540-1510a3c52485"});
const err=code=>{throw new Error(code)};
const obj=v=>v!==null&&typeof v==="object"&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const uuid=v=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v);
export const BUSINESS_RPCS = Object.freeze([
  "registrar_versao_fonte_v107",
  "aprovar_versao_fonte_v107",
  "salvar_fonte_normativa_v107",
  "executar_comando_lista_v1",
  "criar_competencia",
  "criar_documento_competencia_v115",
  "solicitar_analise_competencia",
  "registrar_revisao_requisito_v117",
  "solicitar_parecer_interno",
  "aprovar_parecer_interno",
  "aprovar_apresentacao",
  "registrar_apresentacao",
]);
export function parseBusinessJson(text) {
  if (typeof text !== "string" || Buffer.byteLength(text) > 65536) err("BODY_LIMIT");
  let i = 0;
  const ws = () => {
    while (/\s/.test(text[i] || "") && i < text.length) i++;
  };
  function str() {
    const start = i++;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i++] === '"') return JSON.parse(text.slice(start, i));
    }
    err("BODY_JSON");
  }
  function value(depth = 0) {
    if (depth > 30) err("BODY_JSON");
    ws();
    if (text[i] === '"') return str();
    if (text[i] === "{") {
      i++;
      const out = {},
        seen = new Set();
      ws();
      if (text[i] === "}") {
        i++;
        return out;
      }
      for (;;) {
        ws();
        if (text[i] !== '"') err("BODY_JSON");
        const k = str();
        if (seen.has(k) || ["__proto__", "constructor", "prototype"].includes(k)) err("BODY_JSON");
        seen.add(k);
        ws();
        if (text[i++] !== ":") err("BODY_JSON");
        out[k] = value(depth + 1);
        ws();
        const c = text[i++];
        if (c === "}") return out;
        if (c !== ",") err("BODY_JSON");
      }
    }
    if (text[i] === "[") {
      i++;
      const out = [];
      ws();
      if (text[i] === "]") {
        i++;
        return out;
      }
      for (;;) {
        out.push(value(depth + 1));
        ws();
        const c = text[i++];
        if (c === "]") return out;
        if (c !== ",") err("BODY_JSON");
      }
    }
    const m = /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
      text.slice(i),
    );
    if (!m) err("BODY_JSON");
    i += m[0].length;
    const v = JSON.parse(m[0]);
    if (typeof v === "number" && !Number.isFinite(v)) err("BODY_JSON");
    return v;
  }
  const out = value();
  ws();
  if (i !== text.length || !obj(out)) err("BODY_JSON");
  return out;
}

const OBSERVED_TABLES = new Set([
  "contratos",
  "fontes_normativas",
  "versoes_fontes_normativas",
  "listas_verificacao",
  "versoes_lista",
  "itens_lista",
  "competencias",
  "requisitos_competencia",
  "arquivos",
  "documentos_contrato",
  "documentos_competencia",
  "versoes_documento",
  "processamentos_documento",
  "pareceres_internos",
  "apresentacoes_contratante",
  "pacotes_competencia",
  "itens_pacote_competencia",
  "aprovacoes_apresentacao",
]);
const OBSERVED_RPCS = new Set([
  ...BUSINESS_RPCS,
  "consultar_permissoes_efetivas",
  "obter_matriz_rbac_master",
  "obter_lista_operacional_v1",
  "obter_visao_geral_competencia",
  "obter_documentos_competencia_v115",
  "obter_analise_competencia_v116",
  "obter_detalhe_requisito_v117",
  "obter_contexto_revisao_v117",
]);
const PRIVATE_RESPONSE_KEYS = new Set([
  "autor",
  "aprovado_por",
  "criado_por",
  "atualizado_por",
  "enviado_por",
  "id_usuario",
  "correlation_id",
  "user",
  "users",
  "email",
  "access_token",
  "refresh_token",
  "token",
  "senha",
  "password",
  "headers",
  "cookies",
  "storage_path",
  "path",
  "texto",
]);
const OBSERVED_KEYS = new Set(
  `id id_organizacao id_contrato id_contratante id_fonte id_arquivo id_versao id_lista id_versao_lista id_fonte_versao id_competencia id_requisito id_execucao id_resultado id_resultado_esperado id_execucao_esperada id_versao_documento id_documento id_documento_competencia id_parecer id_apresentacao id_pacote id_aprovacao entidade_id versao_id origem_id origem_tipo fonte versao lista competencia requisito documento documentos requisitos capacidades execucao_atual execucoes resultados resultado portao blocking_summary allowed_actions apontamentos evidencias parecer itens versoes permissoes perfil recurso acao permitido master schema_versao request_id evento_id tipo titulo nome nome_original numero descricao referencia situacao status etapa versao_registro versao_atual numero_versao inicio_vigencia fim_vigencia vigencia_inicio vigencia_fim competencia_referencia periodo_inicio periodo_fim data_limite criado_em atualizado_em aprovado_em apresentado_em congelado_em iniciado_em concluido_em tamanho mime sha256 hash hash_entrada hash_esperado hash_pacote conteudo_texto metadados codigo categoria obrigatorio aplicavel impeditivo criticidade ordem regra_validacao condicao sempre tipos documento obrigatorio acoes criar_lista editar_lista criar_versao editar_vigencia_rascunho criar_item editar_item remover_item publicar_versao encerrar_vigencia alterar_situacao descartar_rascunho pode_remover total_versoes total_itens pagina_versoes pagina_itens exclusao_lista_permitida motivo_retencao vigencia_fim_minima p_id_organizacao p_id_contrato p_id_lista p_id_versao p_id_competencia p_id_requisito p_pagina_versoes p_pagina_itens p_pagina_resultados p_pagina_execucoes p_pagina_apontamentos p_request_id percentual percentual_conformidade conformes_ou_na_validos total_obrigatorios_aplicaveis conformes nao_conformes nao_avaliados impeditivos bloqueantes pode_enviar pode_nova_versao executar_analise reanalisar abrir_requisito apresentar stale estado_analise mecanismo fonte_referencia pagina trecho paginas numero_rodada protocolo forma_apresentacao pode_revisar ultima_analise parecer_aprovado analise_atual atual total pagina_atual total_paginas content is_current erro_codigo tentativas estado acao id_versao_origem status_seguranca id_documento_contrato id_documento_competencia abrir_documentos abrir_parecer analisar analise_concluida_atual apontamentos_paginacao apresentacao aprovacao_apresentacao_atual arquivo arquivos atendido avaliados busca confianca contrato documentos_competencia documentos_paginacao documentos_total efeito_portao em_analise entidade_tipo evidencias_paginacao execucoes_paginacao fonte_detalhe fonte_tipo fundamento hash_evidencias hash_snapshot hash_versao historico historico_paginacao inconclusivos iniciada_em concluida_em justificativa liberado limite mecanismos modelo motivo motivo_nova_versao_obrigatorio motor na_validade nao_conformidades_bloqueantes offset organizacao origem origem_versao pendentes possui_evidencia possui_fundamento processamento prompt_versao provedor referencia_externa regra_violada requisitos_documentais requisitos_documentais_aplicaveis requisitos_documentais_pendentes requisitos_documentais_total requisitos_paginacao requisitos_total resultado_atual resultado_referencia resultados_paginacao resumo severidade status_execucao tipo_evidencia tipo_execucao tipos_esperados valido versao_motor versao_pacote_atual p_apontamentos_limite p_apontamentos_offset p_busca p_categoria p_documentos_limite p_documentos_offset p_evidencias_limite p_evidencias_offset p_execucoes_limite p_execucoes_offset p_filtro_apontamento_status p_filtro_criticidade p_filtro_mecanismo p_filtro_resultado p_historico_limite p_historico_offset p_id_documento p_requisitos p_requisitos_limite p_requisitos_offset p_resultados_limite p_resultados_offset`.split(
    /\s+/,
  ),
);
const TABLE_RESPONSE_FIELDS = Object.freeze({
  contratos: "id id_organizacao id_contratante numero situacao inicio_vigencia fim_vigencia",
  fontes_normativas:
    "id id_organizacao id_contrato tipo titulo referencia descricao situacao versao_registro criado_em atualizado_em",
  versoes_fontes_normativas:
    "id id_organizacao id_contrato id_fonte versao inicio_vigencia fim_vigencia id_arquivo hash aprovado_em criado_em conteudo_texto metadados",
  listas_verificacao:
    "id id_organizacao id_contrato nome descricao situacao versao_registro versao_atual",
  versoes_lista:
    "id id_organizacao id_contrato id_lista numero_versao situacao vigencia_inicio vigencia_fim",
  itens_lista:
    "id id_organizacao id_contrato id_versao_lista codigo descricao categoria obrigatorio aplicavel impeditivo criticidade id_fonte_versao regra_validacao ordem",
  competencias:
    "id id_contrato id_organizacao competencia_referencia periodo_inicio periodo_fim data_limite situacao percentual_conformidade versao_pacote_atual versao_registro atualizado_em",
  requisitos_competencia:
    "id id_organizacao id_contrato id_competencia codigo descricao obrigatorio aplicavel impeditivo criticidade origem_tipo origem_id id_fonte_versao regra_validacao ordem",
  arquivos: "id nome_original mime tamanho sha256 status_seguranca origem criado_em",
  documentos_contrato:
    "id id_contrato tipo titulo categoria situacao versao_atual versao_registro vigencia_inicio vigencia_fim criado_em atualizado_em",
  documentos_competencia:
    "id id_organizacao id_contrato id_competencia id_requisito tipo titulo categoria situacao versao_atual versao_registro",
  versoes_documento:
    "id id_organizacao id_contrato id_documento_contrato id_documento_competencia numero_versao id_arquivo hash criado_em documentos_competencia arquivos",
  processamentos_documento:
    "id id_versao_documento etapa status tentativas erro_codigo iniciado_em concluido_em criado_em atualizado_em",
  pareceres_internos:
    "id id_competencia id_contrato id_organizacao status versao hash criado_em aprovado_em",
  apresentacoes_contratante:
    "id id_competencia id_contrato id_organizacao id_pacote protocolo forma_apresentacao apresentado_em tipo numero_rodada",
  pacotes_competencia:
    "id id_competencia id_contrato id_organizacao hash_pacote numero tipo status congelado_em",
  itens_pacote_competencia:
    "id id_pacote id_competencia id_contrato id_organizacao entidade_tipo entidade_id versao_id hash ordem",
  aprovacoes_apresentacao: "id id_competencia id_contrato id_organizacao criado_em",
});
const RPC_RESPONSE_FIELDS = Object.freeze({
  consultar_permissoes_efetivas: "schema_versao versao master permissoes",
  obter_matriz_rbac_master: "schema_versao versao permissoes",
  obter_lista_operacional_v1:
    "schema_versao id_organizacao id_contrato lista versao versoes itens total_versoes total_itens pagina_versoes pagina_itens acoes exclusao_lista_permitida motivo_retencao vigencia_fim_minima",
  obter_visao_geral_competencia: "competencia portao blocking_summary allowed_actions",
  obter_documentos_competencia_v115:
    "schema_versao competencia resumo capacidades documentos documentos_paginacao requisitos_documentais requisitos_paginacao estado_documental",
  obter_analise_competencia_v116:
    "schema_versao competencia estado_analise stale execucao_atual percentual blocking_summary allowed_actions resultados resultados_paginacao execucoes execucoes_paginacao apontamentos apontamentos_paginacao",
  obter_detalhe_requisito_v117:
    "schema_versao competencia requisito execucao_atual resultado_atual resultado_referencia na_validade allowed_actions evidencias evidencias_paginacao historico historico_paginacao apontamentos apontamentos_paginacao",
  obter_contexto_revisao_v117:
    "schema_versao id_competencia id_requisito id_organizacao id_contrato id_execucao_esperada id_resultado_esperado hash_esperado pode_revisar",
});
const BUSINESS_RESPONSE_FIELDS =
  "schema_versao fonte versao lista id_organizacao id_contrato id_versao acao request_id evento_id id_competencia id_requisito id_execucao id_resultado id_aprovacao situacao percentual_conformidade";
export function projectOfficialResponse(value, depth = 0, strict = false, rootFields = null) {
  if (depth > 24) err("OBSERVATION_LIMIT");
  if (Array.isArray(value)) {
    if (value.length > 1000) err("OBSERVATION_LIMIT");
    return value.map((v) => projectOfficialResponse(v, depth + 1, strict, rootFields));
  }
  if (obj(value)) {
    const result = {};
    for (const [key, v] of Object.entries(value)) {
      if (
        PRIVATE_RESPONSE_KEYS.has(key) ||
        /(?:email|password|secret|token|cookie|authorization)/i.test(key)
      )
        continue;
      if (["__proto__", "prototype", "constructor"].includes(key)) err("OBSERVATION_SCHEMA");
      if (!(rootFields || OBSERVED_KEYS).has(key)) {
        if (strict) result.__unapproved_fields = true;
        continue;
      }
      if (key === "metadados" && (!obj(v) || Object.keys(v).length)) err("OBSERVATION_METADATA");
      result[key] = projectOfficialResponse(v, depth + 1, strict || key === "regra_validacao");
    }
    return result;
  }
  if (typeof value === "string" && value.length > 65536) err("OBSERVATION_LIMIT");
  if (value === null || ["string", "boolean", "number"].includes(typeof value)) return value;
  err("OBSERVATION_SCHEMA");
}

const EXACT_SELECTS=Object.freeze({
  "contratos": [
    "id,id_organizacao,id_contratante,numero,objeto,situacao,criticidade,inicio,fim,tipo_contrato,unidade_vinculada,fonte_recurso,valor_global,valor_mensal_referencia,periodicidade,prazo_prestacao_dias,dia_limite_apresentacao,contratante:contratantes!contratos_contratante_org_fk(razao_social,nome_fantasia,documento)"
  ],
  "fontes_normativas": [
    "id,id_organizacao,id_contrato,tipo,titulo,referencia,descricao,situacao,versao_registro,criado_em,atualizado_em"
  ],
  "versoes_fontes_normativas": [
    "id,id_fonte,versao,inicio_vigencia,fim_vigencia,id_arquivo,hash,aprovado_por,aprovado_em,criado_em",
    "conteudo_texto,metadados"
  ],
  "listas_verificacao": [
    "id,nome,descricao,situacao,versao_atual,versao_registro,atualizado_em"
  ],
  "versoes_lista": [
    "id,id_lista,numero_versao,vigencia_inicio,vigencia_fim,situacao,aprovado_em"
  ],
  "itens_lista": [
    "id,codigo,descricao,categoria,obrigatorio,aplicavel,impeditivo,criticidade,id_fonte_versao,regra_validacao,ordem"
  ],
  "competencias": [
    "id_contrato",
    "id",
    "id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em"
  ],
  "arquivos": [
    "id,nome_original,mime,tamanho,status_seguranca,criado_em",
    "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_em",
    "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_por,criado_em",
    "id,id_organizacao,id_contrato,status_seguranca"
  ],
  "documentos_contrato": [
    "id,id_contrato,tipo,titulo,categoria,situacao,versao_atual,versao_registro,vigencia_inicio,vigencia_fim,observacoes,criado_em,atualizado_em"
  ],
  "versoes_documento": [
    "id,id_documento_contrato,numero_versao,id_arquivo,hash,metadados_extraidos,enviado_por,criado_em",
    "id,id_documento_contrato,numero_versao,id_arquivo,hash,motivo_substituicao,metadados_extraidos,enviado_por,criado_em",
    "id,numero_versao,id_organizacao,id_contrato,documentos_competencia!inner(id_competencia,titulo,situacao),arquivos!versoes_documento_arquivo_org_contrato_fk!inner(nome_original,status_seguranca)",
    "id,id_organizacao,id_contrato,id_arquivo"
  ],
  "processamentos_documento": [
    "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em",
    "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em,atualizado_em"
  ],
  "pareceres_internos": [
    "id,id_competencia,id_contrato,id_organizacao,autor,texto,status,versao,hash,criado_em,aprovado_por,aprovado_em"
  ],
  "apresentacoes_contratante": [
    "id,id_competencia,id_contrato,id_organizacao,id_pacote,protocolo,forma_apresentacao,apresentado_em,tipo,numero_rodada"
  ],
  "pacotes_competencia": [
    "id,id_competencia,id_contrato,id_organizacao,hash_pacote,numero,tipo,status,congelado_em"
  ],
  "itens_pacote_competencia": [
    "id,id_pacote,id_competencia,id_contrato,id_organizacao,entidade_tipo,entidade_id,versao_id,hash,ordem"
  ]
});
const REVIEW_SELECT="id,numero_versao,id_organizacao,id_contrato,documentos_competencia!inner(id_competencia,titulo,situacao),arquivos!versoes_documento_arquivo_org_contrato_fk!inner(nome_original,status_seguranca)";

const QUERY_KEYS=Object.freeze({
 contratos:"select id",fontes_normativas:"select id_organizacao id_contrato or situacao order offset limit",
 versoes_fontes_normativas:"select id id_fonte order offset limit",listas_verificacao:"select id_contrato order offset limit",
 versoes_lista:"select id_lista order offset limit",itens_lista:"select id_versao_lista order offset limit",
 competencias:"select id id_organizacao id_contrato competencia_referencia situacao order offset limit",
 arquivos:"select id id_organizacao id_contrato order offset limit",
 documentos_contrato:"select id id_contrato tipo categoria situacao titulo order offset limit",
 versoes_documento:"select id id_documento_contrato id_organizacao id_contrato documentos_competencia.id_competencia documentos_competencia.situacao arquivos.status_seguranca or order offset limit",
 processamentos_documento:"select id_versao_documento order offset limit",
 pareceres_internos:"select id_competencia id_organizacao id_contrato order offset limit",
 apresentacoes_contratante:"select id id_competencia id_organizacao id_contrato",
 pacotes_competencia:"select id id_competencia id_organizacao id_contrato",
 itens_pacote_competencia:"select id_pacote id_competencia id_organizacao id_contrato order offset limit"
});
const SDK_ORDERS=Object.freeze({
 fontes_normativas:["titulo.asc,id.asc"],versoes_fontes_normativas:["versao.desc,id.asc"],
 listas_verificacao:["atualizado_em.desc,id.desc"],versoes_lista:["numero_versao.desc,id.desc"],
 itens_lista:["ordem.asc,id.asc"],competencias:["competencia_referencia.desc,id.desc"],
 arquivos:["criado_em.desc,id.asc"],documentos_contrato:["atualizado_em.desc,id.desc"],
 versoes_documento:["numero_versao.desc,id.desc","criado_em.desc,id.desc"],
 processamentos_documento:["criado_em.desc,id.desc"],pareceres_internos:["versao.desc,id.desc"],
 itens_pacote_competencia:["ordem.asc,id.asc"]
});
function sdkShape(table,q){
 const exact=(required,optional=[])=>required.every(k=>Object.hasOwn(q,k))&&Object.keys(q).every(k=>required.includes(k)||optional.includes(k));
 const page=size=>q.limit===String(size)&&/^(0|[1-9]\d*)$/.test(q.offset||"")&&Number(q.offset)%size===0;
 let ok=false;
 switch(table){
 case "contratos":ok=exact(["select","id"]);break;
 case "fontes_normativas":ok=exact(["select","id_organizacao","order","offset","limit"],["id_contrato","or","situacao"])&&page(25)&&((Object.hasOwn(q,"id_contrato")?1:0)+(Object.hasOwn(q,"or")?1:0)===1)&&(!q.situacao||["eq.rascunho","eq.ativa","eq.inativa","eq.revogada"].includes(q.situacao));break;
 case "versoes_fontes_normativas":ok=q.select==="conteudo_texto,metadados"?exact(["select","id"]):exact(["select","id_fonte","order","offset","limit"])&&page(25);break;
 case "listas_verificacao":ok=exact(["select","id_contrato","order","offset","limit"])&&page(25);break;
 case "versoes_lista":ok=exact(["select","id_lista","order","offset","limit"])&&page(25);break;
 case "itens_lista":ok=exact(["select","id_versao_lista","order","offset","limit"])&&page(25);break;
 case "competencias":ok=q.select==="id_contrato"?exact(["select","id","id_organizacao"]):q.select==="id"?exact(["select","id_contrato","competencia_referencia"]):exact(["select","id_contrato","order","offset","limit"],["competencia_referencia","situacao"])&&page(25);break;
 case "arquivos":ok=exact(["select","id"])||exact(["select","id","id_organizacao","id_contrato"])||(exact(["select","id_organizacao","id_contrato","order","offset","limit"])&&page(25));break;
 case "documentos_contrato":ok=exact(["select","id","id_contrato"])||(exact(["select","id_contrato","order","offset","limit"],["tipo","categoria","situacao","titulo"])&&page(25));break;
 case "versoes_documento":
  if(q.select===REVIEW_SELECT)ok=exact(["select","id_organizacao","id_contrato","documentos_competencia.id_competencia","documentos_competencia.situacao","arquivos.status_seguranca","order","offset","limit"])&&page(25)&&q.order==="criado_em.desc,id.desc";
  else if(q.or)ok=exact(["select","or"]);
  else if(q.id)ok=exact(["select","id","id_organizacao","id_contrato"]);
  else ok=exact(["select","id_documento_contrato","order","offset","limit"])&&page(20)&&q.order==="numero_versao.desc,id.desc";
  break;
 case "processamentos_documento":ok=exact(["select","id_versao_documento","order","offset","limit"])&&(q.id_versao_documento?.startsWith("in.(")?page(1000):page(10));break;
 case "pareceres_internos":ok=exact(["select","id_competencia","id_organizacao","id_contrato","order","offset","limit"])&&page(25);break;
 case "apresentacoes_contratante":case "pacotes_competencia":ok=exact(["select","id","id_competencia","id_organizacao","id_contrato"]);break;
 case "itens_pacote_competencia":ok=exact(["select","id_pacote","id_competencia","id_organizacao","id_contrato","order","offset","limit"])&&page(25);break;
 }
 if(!ok)err("OBSERVATION_QUERY");
}
const pathValue=(row,key)=>key.split(".").reduce((v,k)=>obj(v)&&Object.hasOwn(v,k)?v[k]:undefined,row);
function parseObservedQuery(table,url){
 if(url.pathname!=="/rest/v1/"+table||url.pathname.includes("%"))err("OBSERVATION_QUERY");
 const q=Object.fromEntries(url.searchParams),pairs=[...url.searchParams];
 if(pairs.length!==Object.keys(q).length||!QUERY_KEYS[table]||pairs.some(([k])=>!QUERY_KEYS[table].split(" ").includes(k)))err("OBSERVATION_QUERY");
 if(!EXACT_SELECTS[table]?.includes(q.select))err("OBSERVATION_PROJECTION");
 const predicates=new Map();
 for(const[k,v]of pairs){
  if(k==="select")continue;
  if(k==="order"){if(!SDK_ORDERS[table]?.includes(v))err("OBSERVATION_QUERY");continue;}
  if(k==="offset"){if(!/^(0|[1-9]\d{0,5})$/.test(v))err("OBSERVATION_QUERY");continue;}
  if(k==="limit"){if(!["10","20","25","1000"].includes(v))err("OBSERVATION_QUERY");continue;}
  if(k==="or"){
   const sourceOr="(id_contrato.eq."+FIXTURE.contract+",id_contrato.is.null)";
   const docOr=new RegExp("^\\(and\\(id_documento_contrato\\.eq\\."+FIXTURE.contractualDocument+",numero_versao\\.eq\\.[1-9][0-9]*\\)\\)$");
   if((table!=="fontes_normativas"||v!==sourceOr)&&(table!=="versoes_documento"||!docOr.test(v)))err("OBSERVATION_QUERY");
   continue;
  }
  if(v.startsWith("eq.")){
   const value=v.slice(3);
   if(k==="id_organizacao"&&value!==FIXTURE.organization)err("OBSERVATION_CONTEXT");
   if(k==="id_contrato"&&value!==FIXTURE.contract)err("OBSERVATION_CONTEXT");
   if(k==="id_fonte"&&value!==FIXTURE.source)err("OBSERVATION_CONTEXT");
   if(k==="id_documento_contrato"&&value!==FIXTURE.contractualDocument)err("OBSERVATION_CONTEXT");
   if((k==="id"||k.startsWith("id_")||k.endsWith(".id_competencia"))&&!uuid(value))err("OBSERVATION_QUERY");
   if(k==="competencia_referencia"&&!["2026-09-01","2026-10-01","2026-11-01"].includes(value))err("OBSERVATION_CONTEXT");
   if(k==="documentos_competencia.situacao"&&value!=="ativo")err("OBSERVATION_QUERY");
   if(k==="arquivos.status_seguranca"&&value!=="aprovado")err("OBSERVATION_QUERY");
   predicates.set(k,{kind:"eq",value});
  }else if(v.startsWith("in.(")&&v.endsWith(")")&&["id","id_versao_documento"].includes(k)){
   const values=v.slice(4,-1).split(",");
   if(!values.length||values.length>1000||values.some(x=>!uuid(x))||new Set(values).size!==values.length)err("OBSERVATION_QUERY");
   predicates.set(k,{kind:"in",values});
  }else if(v==="is.null"&&k==="id_contrato"&&["fontes_normativas","arquivos"].includes(table))predicates.set(k,{kind:"eq",value:null});
  else err("OBSERVATION_QUERY");
 }
 sdkShape(table,q);
 return{q,predicates,key:JSON.stringify(Object.entries(q).sort(([a],[b])=>a.localeCompare(b)))};
}
function matchesObservation(entry,row,where){
 return Object.entries(where).every(([key,value])=>{
  const actual=pathValue(row,key);
  if(actual!==undefined)return actual===value;
  const bound=entry.predicates.get(key);return bound?.kind==="eq"&&bound.value===value;
 });
}
function coversAbsence(entry,where){
 const pairs=Object.entries(where);
 if(!pairs.length||Number(entry.q.offset||0)!==0)return false;
 if(!pairs.every(([k,v])=>entry.predicates.get(k)?.kind==="eq"&&entry.predicates.get(k).value===v))return false;
 return[...entry.predicates].every(([k,p])=>p.kind==="eq"&&(Object.hasOwn(where,k)||(["id_organizacao","id_contrato"].includes(k)&&p.value===FIXTURE[k==="id_contrato"?"contract":"organization"])));
}
export function createOfficialObserver(page){
 const pending=new Set(),tables=new Map(),rpcs=new Map(),sequences=new WeakMap();let sequence=0,failed=false,closed=false;
 const checkBudget=()=>{
  let bytes=0,count=0;
  for(const ledger of tables.values())for(const entry of ledger.values()){bytes+=Buffer.byteLength(JSON.stringify(entry.rows));count++;}
  for(const ledger of rpcs.values())for(const entry of ledger){bytes+=Buffer.byteLength(JSON.stringify([entry.args,entry.value]));count++;}
  if(bytes>8*1024*1024||count>1024)err("OBSERVATION_LIMIT");
 };
 const onRequest=request=>{if(!closed)sequences.set(request,++sequence);};
 const onResponse=response=>{
  if(closed)return;let request,url,table,rpc;
  try{
   request=response.request();url=new URL(response.url());
   if(url.origin!==FIXTURE.api||url.username||url.password||url.hash)return;
   const tm=/^\/rest\/v1\/([a-z_0-9]+)$/.exec(url.pathname),rm=/^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname);
   if(tm&&request.method()==="GET"&&OBSERVED_TABLES.has(tm[1]))table=tm[1];
   else if(rm&&request.method()==="POST"&&!url.search&&OBSERVED_RPCS.has(rm[1]))rpc=rm[1];
   else return;
  }catch{failed=true;return;}
  const ordinal=sequences.get(request);
  const task=(async()=>{
   if(!ordinal)return;
   let query=null;
   if(table){try{query=parseObservedQuery(table,url);}catch{return;}}
   let args={};
   if(rpc&&request.postData()){
    args=projectOfficialResponse(parseBusinessJson(request.postData()));
    if((Object.hasOwn(args,"p_id_organizacao")&&args.p_id_organizacao!==FIXTURE.organization)||(Object.hasOwn(args,"p_id_contrato")&&args.p_id_contrato!==FIXTURE.contract))return;
   }
   if(response.status()<200||response.status()>=300)err("OBSERVATION_RESPONSE");
   const bytes=await response.body();let value;
   try{
    if(bytes.length>1048576)err("OBSERVATION_LIMIT");
    const fields=table?TABLE_RESPONSE_FIELDS[table]:RPC_RESPONSE_FIELDS[rpc]||(BUSINESS_RPCS.includes(rpc)?BUSINESS_RESPONSE_FIELDS:null);
    if(!fields)err("OBSERVATION_ENDPOINT");
    value=projectOfficialResponse(JSON.parse(bytes.toString("utf8")),0,false,new Set(fields.split(" ")));
   }finally{bytes.fill(0);}
   if(closed)return;
   if(table){
    const rows=value===null?[]:Array.isArray(value)?value:[value];
    if(rows.length>1000)err("OBSERVATION_LIMIT");const ids=new Set();
    for(const row of rows){
     if(!obj(row))err("OBSERVATION_SCHEMA");
     for(const[k,p]of query.predicates){const v=pathValue(row,k);if(v!==undefined&&(p.kind==="eq"?v!==p.value:!p.values.includes(v)))err("OBSERVATION_CONTEXT");}
     const id=row.id??(query.predicates.get("id")?.kind==="eq"?query.predicates.get("id").value:undefined);
     if(!uuid(id)||ids.has(id))err("OBSERVATION_SCHEMA");ids.add(id);
    }
    const ledger=tables.get(table)||new Map(),prior=ledger.get(query.key);
    if(!prior||prior.ordinal<ordinal)ledger.set(query.key,{...query,ordinal,rows});
    if(ledger.size>1024)err("OBSERVATION_LIMIT");tables.set(table,ledger);
   }else{
    const cache=rpcs.get(rpc)||[];cache.push({ordinal,args,value});cache.sort((a,b)=>b.ordinal-a.ordinal);rpcs.set(rpc,cache.slice(0,64));
   }
   checkBudget();
  })();
  pending.add(task);task.catch(()=>{failed=true;}).finally(()=>pending.delete(task));
 };
 page.on("request",onRequest);page.on("response",onResponse);
 const flush=async()=>{await Promise.allSettled([...pending]);if(failed||closed)err("OBSERVATION_FAILED");};
 function rpcName(name){const bare=name.startsWith("rpc:")?name.slice(4):name;return OBSERVED_RPCS.has(bare)?bare:null;}
 function entries(table){return[...(tables.get(table)?.values()||[])].sort((a,b)=>b.ordinal-a.ordinal);}
 function selectLatest(table,options){
  if(!obj(options)||Object.keys(options).some(k=>k!=="select")||(options.select!==undefined&&!EXACT_SELECTS[table]?.includes(options.select)))err("OBSERVATION_PROJECTION");
  const ledger=entries(table).filter(e=>options.select===undefined||e.q.select===options.select),latest=new Map();
  // Deduplicate identity BEFORE filtering state or omitted values.
  for(const e of ledger)for(const row of e.rows){const id=row.id??e.predicates.get("id")?.value;if(!latest.has(id))latest.set(id,{e,row});}
  return{ledger,latest};
 }
 return Object.freeze({
  flush,generation:()=>sequence,
  async observedAfter(name,where={},after,options={}){
   await flush();const rpc=rpcName(name);
   if(rpc)return(rpcs.get(rpc)||[]).some(e=>e.ordinal>after&&Object.entries(where).every(([k,v])=>pathValue(e.args,k)===v));
   if(!OBSERVED_TABLES.has(name))return false;
   const{latest,ledger}=selectLatest(name,options);
   for(const e of ledger)if(e.ordinal>after&&e.rows.length===0&&coversAbsence(e,where))return true;
   const empty=ledger.find(e=>e.rows.length===0&&coversAbsence(e,where));
   return[...latest.values()].some(({e,row})=>e.ordinal>after&&(!empty||e.ordinal>=empty.ordinal)&&matchesObservation(e,row,where));
  },
  async read(table,where={},options={}){
   await flush();if(!OBSERVED_TABLES.has(table)||!tables.has(table))err("OBSERVATION_TABLE");
   const{latest,ledger}=selectLatest(table,options),empty=ledger.find(e=>e.rows.length===0&&coversAbsence(e,where));
   return[...latest.values()].filter(({e,row})=>(!empty||e.ordinal>=empty.ordinal)&&matchesObservation(e,row,where)).map(({row})=>structuredClone(row));
  },
  async rpcRead(name,where={}){
   await flush();const rpc=rpcName(name);if(!rpc)err("OBSERVATION_RPC");
   const item=(rpcs.get(rpc)||[]).find(e=>Object.entries(where).every(([k,v])=>pathValue(e.args,k)===v));return item?structuredClone(item.value):null;
  },
  close(){closed=true;tables.clear();rpcs.clear();page.off("request",onRequest);page.off("response",onResponse);}
 });
}

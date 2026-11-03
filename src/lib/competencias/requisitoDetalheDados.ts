/**
 * V1-17 — Detalhe do requisito (drawer na Análise).
 * Adapter local tipado para as RPCs certificadas `obter_detalhe_requisito_v117` e
 * `solicitar_reanalise_requisitos` (ausentes do client gerado; types.ts intocado).
 * Parser fail-closed: qualquer desvio de contrato → null (sem dados parciais).
 * Resultado, mecanismo, N/A, efeito no portão e allowed_actions são autoridade do backend.
 */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export const PAGINA_DETALHE = 25;
export const SCHEMA_V117 = "v117-v1";

type RespostaRpc = { data: unknown; error: unknown; status?: number };
type ArgsV117 = {
  obter_detalhe_requisito_v117: {
    p_id_competencia: string;
    p_id_requisito: string;
    p_evidencias_offset: number;
    p_evidencias_limite: number;
    p_historico_offset: number;
    p_historico_limite: number;
    p_apontamentos_offset: number;
    p_apontamentos_limite: number;
  };
  solicitar_reanalise_requisitos: { p_id_competencia: string; p_requisitos: string[] };
};
type Consulta = PromiseLike<RespostaRpc> & {
  abortSignal(s: AbortSignal): PromiseLike<RespostaRpc>;
};
const cliente = supabase as unknown as {
  rpc<N extends keyof ArgsV117>(fn: N, args: ArgsV117[N]): Consulta;
};

export type OffsetsDetalhe = { ev: number; hist: number; ap: number };
export const OFFSETS_DETALHE_ZERO: OffsetsDetalhe = { ev: 0, hist: 0, ap: 0 };

export function obterDetalheRequisito(
  idCompetencia: string,
  idRequisito: string,
  o: OffsetsDetalhe,
  signal: AbortSignal,
): PromiseLike<RespostaRpc> {
  return cliente
    .rpc("obter_detalhe_requisito_v117", {
      p_id_competencia: idCompetencia,
      p_id_requisito: idRequisito,
      p_evidencias_offset: o.ev,
      p_evidencias_limite: PAGINA_DETALHE,
      p_historico_offset: o.hist,
      p_historico_limite: PAGINA_DETALHE,
      p_apontamentos_offset: o.ap,
      p_apontamentos_limite: PAGINA_DETALHE,
    })
    .abortSignal(signal);
}

export type TipoErroV117 = "sem_permissao" | "nao_encontrado" | "invalida" | "conflito" | "erro";
const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export function classificarErroV117(error: unknown, status?: number): TipoErroV117 {
  const code = obj(error) && typeof error["code"] === "string" ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301")
    return "sem_permissao";
  if (code === "PT404") return "nao_encontrado";
  if (code === "PT400") return "invalida";
  if (code === "PT409") return "conflito";
  return "erro";
}

export const MENSAGENS_V117 = {
  carregando: "Carregando detalhe do requisito…",
  sem_permissao: "Você não tem acesso a este requisito.",
  nao_encontrado: "Requisito não encontrado ou indisponível.",
  invalida: "Solicitação inválida para este requisito.",
  conflito: "Já existe uma análise ativa com escopo diferente. Aguarde a conclusão e tente novamente.",
  erro: "Não foi possível carregar o detalhe agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  reanaliseOk: "Reanálise deste requisito solicitada. Acompanhe o andamento na análise.",
  reanaliseReconciliada: "Solicitação registrada. Os dados abaixo foram atualizados pelo sistema.",
  reanaliseFalha: "Não foi possível solicitar a reanálise agora. Tente novamente em instantes.",
  downloadFalha: "Não foi possível baixar o documento agora. Tente novamente em instantes.",
} as const;

export class ErroReanalise extends Error {
  constructor(public tipo: TipoErroV117) {
    super(tipo);
  }
}
/** Uma única chamada com [idRequisito]. Retorna o uuid da execução (nova ou idempotente). */
export async function solicitarReanaliseRequisito(
  idCompetencia: string,
  idRequisito: string,
): Promise<string> {
  let r: RespostaRpc;
  try {
    r = await cliente.rpc("solicitar_reanalise_requisitos", {
      p_id_competencia: idCompetencia,
      p_requisitos: [idRequisito],
    });
  } catch {
    throw new ErroReanalise("erro");
  }
  if (r.error) throw new ErroReanalise(classificarErroV117(r.error, r.status));
  if (typeof r.data !== "string" || !uuidValido(r.data)) throw new ErroReanalise("erro");
  return r.data;
}

// ---------- tipos ----------
export type PaginacaoV117 = { offset: number; limite: number; total: number };
export type RequisitoV117 = {
  id: string;
  codigo: string | null;
  descricao: string | null;
  categoria: string | null;
  origem_tipo: string | null;
  origem_id: string | null;
  origem_versao: string | null;
  obrigatorio: boolean | null;
  aplicavel: boolean | null;
  impeditivo: boolean | null;
  criticidade: string | null;
  fonte_tipo: string | null;
  fonte_referencia: string | null;
  fonte_detalhe: string | null;
  efeito_portao: string | null;
  hash_snapshot: string | null;
  regra_validacao: string | null;
  condicao_aplicabilidade: string | null;
};
export type ExecucaoV117 = {
  id: string;
  tipo: string | null;
  status: string | null;
  hash_entrada: string | null;
  motor: string | null;
  versao_motor: string | null;
  provedor: string | null;
  modelo: string | null;
  prompt_versao: string | null;
  iniciada_em: string | null;
  concluida_em: string | null;
  criado_em: string | null;
};
export type ResultadoV117 = {
  id: string;
  id_execucao: string | null;
  resultado: string;
  mecanismo: string | null;
  confianca: number | null;
  justificativa: string | null;
  fundamento: string | null;
  hash_evidencias: string | null;
  criado_em: string | null;
};
export type NaValidade = {
  valido: boolean;
  possui_fundamento: boolean | null;
  possui_evidencia: boolean | null;
};
export type DocumentoV117 = {
  id_versao_documento: string;
  numero_versao: number | null;
  hash_versao: string | null;
  id_arquivo: string | null;
  nome_original: string | null;
  mime: string | null;
  status_seguranca: string | null;
};
export type EvidenciaV117 = {
  id: string;
  pagina: number | null;
  trecho: string | null;
  tipo_evidencia: string | null;
  referencia_externa: string | null;
  hash: string | null;
  criado_em: string | null;
  documento: DocumentoV117 | null;
};
export type HistoricoV117 = {
  id_resultado: string;
  id_execucao: string;
  resultado: string;
  mecanismo: string | null;
  confianca: number | null;
  fundamento: string | null;
  justificativa: string | null;
  hash_evidencias: string | null;
  criado_em: string | null;
  tipo_execucao: string | null;
  status_execucao: string | null;
  motor: string | null;
  versao_motor: string | null;
  provedor: string | null;
  modelo: string | null;
  prompt_versao: string | null;
  hash_entrada: string | null;
  iniciada_em: string | null;
  concluida_em: string | null;
};
export type ApontamentoV117 = {
  id: string;
  descricao: string | null;
  severidade: string | null;
  status: string | null;
  origem: string | null;
  regra_violada: string | null;
  acao_sugerida: string | null;
  fonte: Array<[string, string]>;
  criado_em: string | null;
  atualizado_em: string | null;
};
export type DetalheV117 = {
  competencia: { id: string; competencia_referencia: string | null; situacao: string | null };
  requisito: RequisitoV117;
  execucao_atual: ExecucaoV117 | null;
  resultado_atual: ResultadoV117 | null;
  resultado_referencia: ResultadoV117 | null;
  na_validade: NaValidade | null;
  allowed_actions: { executar_analise: boolean; reanalisar: boolean; abrir_requisito: boolean };
  evidencias: EvidenciaV117[];
  evidencias_paginacao: PaginacaoV117;
  historico: HistoricoV117[];
  historico_paginacao: PaginacaoV117;
  apontamentos: ApontamentoV117[];
  apontamentos_paginacao: PaginacaoV117;
};

// ---------- parser ----------
class Invalido extends Error {}
const falha = (): never => {
  throw new Invalido();
};
const s = (v: unknown): string | null =>
  v === null || v === undefined
    ? null
    : typeof v === "string"
      ? v
      : typeof v === "number" && Number.isFinite(v)
        ? String(v)
        : falha();
const n = (v: unknown): number | null =>
  v === null || v === undefined
    ? null
    : typeof v === "number" && Number.isFinite(v)
      ? v
      : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : falha();
const b = (v: unknown): boolean | null =>
  v === null || v === undefined ? null : typeof v === "boolean" ? v : falha();
const u = (v: unknown): string =>
  typeof v === "string" && uuidValido(v) ? uuidCanonico(v) : falha();
const uOuNull = (v: unknown): string | null => (v === null || v === undefined ? null : u(v));
const o = (v: unknown): Record<string, unknown> => (obj(v) ? v : falha());
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : falha());
const inteiro = (v: unknown): number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : falha();

function pag(v: unknown, offsetEsperado: number): PaginacaoV117 {
  const p = o(v);
  const r = { offset: inteiro(p["offset"]), limite: inteiro(p["limite"]), total: inteiro(p["total"]) };
  if (r.limite !== PAGINA_DETALHE || r.offset !== offsetEsperado) falha();
  return r;
}
function req(v: unknown): RequisitoV117 {
  const q = o(v);
  return {
    id: u(q["id"]),
    codigo: s(q["codigo"]),
    descricao: s(q["descricao"]),
    categoria: s(q["categoria"]),
    origem_tipo: s(q["origem_tipo"]),
    origem_id: s(q["origem_id"]),
    origem_versao: s(q["origem_versao"]),
    obrigatorio: b(q["obrigatorio"]),
    aplicavel: b(q["aplicavel"]),
    impeditivo: b(q["impeditivo"]),
    criticidade: s(q["criticidade"]),
    fonte_tipo: s(q["fonte_tipo"]),
    fonte_referencia: s(q["fonte_referencia"]),
    fonte_detalhe: s(q["fonte_detalhe"]),
    efeito_portao: s(q["efeito_portao"]),
    hash_snapshot: s(q["hash_snapshot"]),
    regra_validacao: s(q["regra_validacao"]),
    condicao_aplicabilidade: s(q["condicao_aplicabilidade"]),
  };
}
function exec(v: unknown): ExecucaoV117 | null {
  if (v === null) return null;
  const e = o(v);
  return {
    id: u(e["id"]),
    tipo: s(e["tipo"]),
    status: s(e["status"]),
    hash_entrada: s(e["hash_entrada"]),
    motor: s(e["motor"]),
    versao_motor: s(e["versao_motor"]),
    provedor: s(e["provedor"]),
    modelo: s(e["modelo"]),
    prompt_versao: s(e["prompt_versao"]),
    iniciada_em: s(e["iniciada_em"]),
    concluida_em: s(e["concluida_em"]),
    criado_em: s(e["criado_em"]),
  };
}
function res(v: unknown): ResultadoV117 | null {
  if (v === null) return null;
  const r = o(v);
  const resultado = s(r["resultado"]);
  if (!resultado) falha();
  return {
    id: u(r["id"]),
    id_execucao: uOuNull(r["id_execucao"]),
    resultado: resultado as string,
    mecanismo: s(r["mecanismo"]),
    confianca: n(r["confianca"]),
    justificativa: s(r["justificativa"]),
    fundamento: s(r["fundamento"]),
    hash_evidencias: s(r["hash_evidencias"]),
    criado_em: s(r["criado_em"]),
  };
}
function doc(v: unknown): DocumentoV117 | null {
  if (v === null || v === undefined) return null;
  const d = o(v);
  return {
    id_versao_documento: u(d["id_versao_documento"]),
    numero_versao: n(d["numero_versao"]),
    hash_versao: s(d["hash_versao"]),
    id_arquivo: uOuNull(d["id_arquivo"]),
    nome_original: s(d["nome_original"]),
    mime: s(d["mime"]),
    status_seguranca: s(d["status_seguranca"]),
  };
}
function ev(v: unknown): EvidenciaV117 {
  const e = o(v);
  return {
    id: u(e["id"]),
    pagina: n(e["pagina"]),
    trecho: s(e["trecho"]),
    tipo_evidencia: s(e["tipo_evidencia"]),
    referencia_externa: s(e["referencia_externa"]),
    hash: s(e["hash"]),
    criado_em: s(e["criado_em"]),
    documento: doc(e["documento"]),
  };
}
function hist(v: unknown): HistoricoV117 {
  const h = o(v);
  const resultado = s(h["resultado"]);
  if (!resultado) falha();
  return {
    id_resultado: u(h["id_resultado"]),
    id_execucao: u(h["id_execucao"]),
    resultado: resultado as string,
    mecanismo: s(h["mecanismo"]),
    confianca: n(h["confianca"]),
    fundamento: s(h["fundamento"]),
    justificativa: s(h["justificativa"]),
    hash_evidencias: s(h["hash_evidencias"]),
    criado_em: s(h["criado_em"]),
    tipo_execucao: s(h["tipo_execucao"]),
    status_execucao: s(h["status_execucao"]),
    motor: s(h["motor"]),
    versao_motor: s(h["versao_motor"]),
    provedor: s(h["provedor"]),
    modelo: s(h["modelo"]),
    prompt_versao: s(h["prompt_versao"]),
    hash_entrada: s(h["hash_entrada"]),
    iniciada_em: s(h["iniciada_em"]),
    concluida_em: s(h["concluida_em"]),
  };
}
function apont(v: unknown): ApontamentoV117 {
  const a = o(v);
  const fo = a["fonte"];
  if (fo !== undefined && fo !== null && !obj(fo)) falha();
  const fonte: Array<[string, string]> = [];
  if (obj(fo))
    for (const [k, x] of Object.entries(fo)) {
      const t = typeof x === "string" ? x : typeof x === "number" ? String(x) : null;
      if (t !== null && t !== "") fonte.push([k, t]);
    }
  return {
    id: u(a["id"]),
    descricao: s(a["descricao"]),
    severidade: s(a["severidade"]),
    status: s(a["status"]),
    origem: s(a["origem"]),
    regra_violada: s(a["regra_violada"]),
    acao_sugerida: s(a["acao_sugerida"]),
    fonte,
    criado_em: s(a["criado_em"]),
    atualizado_em: s(a["atualizado_em"]),
  };
}

export function parseDetalheV117(
  data: unknown,
  idCompetencia: string,
  idRequisito: string,
  offsets: OffsetsDetalhe,
): DetalheV117 | null {
  try {
    const d = o(data);
    if (d["schema_versao"] !== SCHEMA_V117) falha();
    const c = o(d["competencia"]);
    const competencia = {
      id: u(c["id"]),
      competencia_referencia: s(c["competencia_referencia"]),
      situacao: s(c["situacao"]),
    };
    const requisito = req(d["requisito"]);
    if (competencia.id !== uuidCanonico(idCompetencia) || requisito.id !== uuidCanonico(idRequisito))
      falha();
    for (const k of ["execucao_atual", "resultado_atual", "resultado_referencia", "na_validade"])
      if (!(k in d)) falha();
    const resultado_referencia = res(d["resultado_referencia"]);
    const nv = d["na_validade"];
    let na_validade: NaValidade | null = null;
    if (resultado_referencia?.resultado === "nao_aplicavel") {
      const x = o(nv);
      if (typeof x["valido"] !== "boolean") falha();
      na_validade = {
        valido: x["valido"] as boolean,
        possui_fundamento: b(x["possui_fundamento"]),
        possui_evidencia: b(x["possui_evidencia"]),
      };
    } else if (nv !== null) falha();
    const aa = o(d["allowed_actions"]);
    const allowed_actions = {
      executar_analise: aa["executar_analise"],
      reanalisar: aa["reanalisar"],
      abrir_requisito: aa["abrir_requisito"],
    };
    if (Object.values(allowed_actions).some((x) => typeof x !== "boolean")) falha();
    return {
      competencia,
      requisito,
      execucao_atual: exec(d["execucao_atual"]),
      resultado_atual: res(d["resultado_atual"]),
      resultado_referencia,
      na_validade,
      allowed_actions: allowed_actions as DetalheV117["allowed_actions"],
      evidencias: arr(d["evidencias"]).map(ev),
      evidencias_paginacao: pag(d["evidencias_paginacao"], offsets.ev),
      historico: arr(d["historico"]).map(hist),
      historico_paginacao: pag(d["historico_paginacao"], offsets.hist),
      apontamentos: arr(d["apontamentos"]).map(apont),
      apontamentos_paginacao: pag(d["apontamentos_paginacao"], offsets.ap),
    };
  } catch {
    return null;
  }
}

/** Download somente para documento com arquivo e status de segurança "aprovado". */
export const podeBaixar = (d: DocumentoV117 | null): d is DocumentoV117 & { id_arquivo: string } =>
  !!d && !!d.id_arquivo && d.status_seguranca === "aprovado";

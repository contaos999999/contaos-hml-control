/**
 * V1-16 — Competência: análise.
 * Adapter local tipado para a RPC certificada `obter_analise_competencia_v116` (ausente do
 * client gerado; types.ts intocado) e para `solicitar_analise_competencia`.
 * Estado, stale, percentual, blocking_summary, allowed_actions e mecanismos são autoridade
 * exclusiva do backend. Parser fail-closed: campo autoritativo ausente/inválido → null.
 */
import { supabase } from "@/integrations/supabase/client";

export const PAGINA_RESULTADOS = 25;
export const PAGINA_EXECUCOES = 10;
export const PAGINA_APONTAMENTOS = 25;

type RespostaRpc = { data: unknown; error: unknown; status?: number };
type ArgsV116 = {
  obter_analise_competencia_v116: {
    p_id_competencia: string;
    p_resultados_offset: number;
    p_resultados_limite: number;
    p_execucoes_offset: number;
    p_execucoes_limite: number;
    p_apontamentos_offset: number;
    p_apontamentos_limite: number;
    p_filtro_resultado: string | null;
    p_filtro_criticidade: string | null;
    p_filtro_mecanismo: string | null;
    p_filtro_apontamento_status: string | null;
    p_busca: string | null;
  };
  solicitar_analise_competencia: { p_id_competencia: string; p_tipo: TipoSolicitacao };
};
type Consulta = PromiseLike<RespostaRpc> & {
  abortSignal(s: AbortSignal): PromiseLike<RespostaRpc>;
};
const cliente = supabase as unknown as {
  rpc<N extends keyof ArgsV116>(fn: N, args: ArgsV116[N]): Consulta;
};

export const ESTADOS_ANALISE = [
  "not_analyzed",
  "queued",
  "processing",
  "failed",
  "complete",
  "stale",
] as const;
export type EstadoAnalise = (typeof ESTADOS_ANALISE)[number];
export const MECANISMOS = ["deterministico", "semantico", "humano", "nao_identificado"] as const;
export type Mecanismo = (typeof MECANISMOS)[number];
export const CRITICIDADES = ["critica", "alta", "media", "baixa", "informativo"] as const;
export const RESULTADOS = [
  "nao_enviado",
  "recebido",
  "pendente",
  "em_analise",
  "conforme",
  "nao_conforme",
  "inconclusivo",
  "requer_revisao",
  "nao_aplicavel",
] as const;
export const STATUS_APONTAMENTO = ["aberto", "em_tratamento", "resolvido", "descartado"] as const;
export type TipoSolicitacao = "completa" | "reanálise";

export type Filtros = {
  resultado: string;
  criticidade: string;
  mecanismo: string;
  apStatus: string;
  busca: string;
};
export type Offsets = { res: number; exec: number; ap: number };
export const FILTROS_VAZIOS: Filtros = {
  resultado: "",
  criticidade: "",
  mecanismo: "",
  apStatus: "",
  busca: "",
};
export const OFFSETS_ZERO: Offsets = { res: 0, exec: 0, ap: 0 };

export type ExecucaoV116 = {
  id: string;
  tipo: string | null;
  status: string | null;
  motor: string | null;
  versao_motor: string | null;
  provedor: string | null;
  modelo: string | null;
  prompt_versao: string | null;
  hash_entrada: string | null;
  iniciada_em: string | null;
  concluida_em: string | null;
  erro_codigo: string | null;
  criado_em: string | null;
};
export type EvidenciaV116 = {
  id: string;
  pagina: number | null;
  trecho: string | null;
  tipo_evidencia: string | null;
  referencia_externa: string | null;
};
export type ResultadoV116 = {
  id_resultado: string;
  id_requisito: string;
  codigo: string | null;
  descricao: string | null;
  criticidade: string | null;
  fonte_referencia: string | null;
  resultado: string;
  mecanismo: Mecanismo;
  confianca: number | null;
  justificativa: string | null;
  fundamento: string | null;
  evidencias: EvidenciaV116[];
};
export type ApontamentoV116 = {
  id: string;
  codigo: string | null;
  descricao: string | null;
  severidade: string | null;
  status: string | null;
  origem: string | null;
  regra_violada: string | null;
  acao_sugerida: string | null;
  criado_em: string | null;
};
export type Paginacao = { offset: number; limite: number; total: number };
export type LeituraV116 = {
  competencia: { id: string; competencia_referencia: string; situacao: string };
  estado_analise: EstadoAnalise;
  stale: boolean;
  execucao_atual: ExecucaoV116 | null;
  percentual: number;
  blocking_summary: Record<string, unknown>;
  allowed_actions: { executar_analise: boolean; reanalisar: boolean; abrir_requisito: boolean };
  /** null somente quando o backend não tem execução e devolve `{}` (sem inventar zeros). */
  mecanismos: Record<Mecanismo, number> | null;
  resultados: ResultadoV116[];
  resultados_paginacao: Paginacao;
  execucoes: ExecucaoV116[];
  execucoes_paginacao: Paginacao;
  apontamentos: ApontamentoV116[];
  apontamentos_paginacao: Paginacao;
};

export function obterAnaliseCompetencia(
  id: string,
  f: Filtros,
  o: Offsets,
  signal: AbortSignal,
): PromiseLike<RespostaRpc> {
  const nul = (v: string) => (v.trim() ? v.trim() : null);
  return cliente
    .rpc("obter_analise_competencia_v116", {
      p_id_competencia: id,
      p_resultados_offset: o.res,
      p_resultados_limite: PAGINA_RESULTADOS,
      p_execucoes_offset: o.exec,
      p_execucoes_limite: PAGINA_EXECUCOES,
      p_apontamentos_offset: o.ap,
      p_apontamentos_limite: PAGINA_APONTAMENTOS,
      p_filtro_resultado: nul(f.resultado),
      p_filtro_criticidade: nul(f.criticidade),
      p_filtro_mecanismo: nul(f.mecanismo),
      p_filtro_apontamento_status: nul(f.apStatus),
      p_busca: nul(f.busca),
    })
    .abortSignal(signal);
}

export type TipoErroV116 = "sem_permissao" | "nao_encontrada" | "erro";
const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export function classificarErroV116(error: unknown, status?: number): TipoErroV116 {
  const code = obj(error) && typeof error["code"] === "string" ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301")
    return "sem_permissao";
  if (code === "PT404") return "nao_encontrada";
  return "erro";
}

export class ErroSolicitacao extends Error {}
/** Retorna o uuid da execução (nova ou existente — concorrência é autoridade do backend). */
export async function solicitarAnaliseCompetencia(
  id: string,
  tipo: TipoSolicitacao,
): Promise<string> {
  let r: RespostaRpc;
  try {
    r = await cliente.rpc("solicitar_analise_competencia", { p_id_competencia: id, p_tipo: tipo });
  } catch {
    throw new ErroSolicitacao();
  }
  if (r.error || typeof r.data !== "string") throw new ErroSolicitacao();
  return r.data;
}

// ---------- parser ----------
const str = (v: unknown) => (typeof v === "string" ? v : null);
const numOuNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const ehNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ehBool = (v: unknown): v is boolean => typeof v === "boolean";
const textoOuNumero = (v: unknown) =>
  typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : null;
const critOk = (v: unknown, lista: readonly string[]) =>
  v === null || v === undefined || (typeof v === "string" && lista.includes(v));

function parsePag(v: unknown): Paginacao | null {
  if (!obj(v) || !ehNum(v["offset"]) || !ehNum(v["limite"]) || !ehNum(v["total"])) return null;
  return { offset: v["offset"], limite: v["limite"], total: v["total"] };
}
function parseExec(e: unknown): ExecucaoV116 | null {
  if (!obj(e) || typeof e["id"] !== "string") return null;
  return {
    id: e["id"],
    tipo: str(e["tipo"]),
    status: str(e["status"]),
    motor: textoOuNumero(e["motor"]),
    versao_motor: textoOuNumero(e["versao_motor"]),
    provedor: textoOuNumero(e["provedor"]),
    modelo: textoOuNumero(e["modelo"]),
    prompt_versao: textoOuNumero(e["prompt_versao"]),
    hash_entrada: str(e["hash_entrada"]),
    iniciada_em: str(e["iniciada_em"]),
    concluida_em: str(e["concluida_em"]),
    erro_codigo: textoOuNumero(e["erro_codigo"]),
    criado_em: str(e["criado_em"]),
  };
}
function parseEv(e: unknown): EvidenciaV116 | null {
  if (!obj(e)) return null;
  return {
    id: str(e["id"]) ?? "",
    pagina: numOuNull(e["pagina"]),
    trecho: str(e["trecho"]),
    tipo_evidencia: str(e["tipo_evidencia"]),
    referencia_externa: str(e["referencia_externa"]),
  };
}
function parseRes(r: unknown): ResultadoV116 | null {
  if (!obj(r) || typeof r["id_resultado"] !== "string" || typeof r["id_requisito"] !== "string")
    return null;
  const mec = r["mecanismo"];
  if (typeof mec !== "string" || !(MECANISMOS as readonly string[]).includes(mec)) return null;
  if (typeof r["resultado"] !== "string") return null;
  const q = r["requisito"];
  if (!obj(q) || !critOk(q["criticidade"], CRITICIDADES)) return null;
  const evs = r["evidencias"];
  if (!Array.isArray(evs)) return null;
  const evidencias = evs.map(parseEv);
  if (evidencias.some((x) => x === null)) return null;
  return {
    id_resultado: r["id_resultado"],
    id_requisito: r["id_requisito"],
    codigo: str(q["codigo"]),
    descricao: str(q["descricao"]),
    criticidade: str(q["criticidade"]),
    fonte_referencia: str(q["fonte_referencia"]),
    resultado: r["resultado"],
    mecanismo: mec as Mecanismo,
    confianca: numOuNull(r["confianca"]),
    justificativa: str(r["justificativa"]),
    fundamento: str(r["fundamento"]),
    evidencias: evidencias as EvidenciaV116[],
  };
}
function parseAp(a: unknown): ApontamentoV116 | null {
  if (!obj(a) || typeof a["id"] !== "string") return null;
  if (!critOk(a["severidade"], CRITICIDADES)) return null;
  const q = obj(a["requisito"]) ? a["requisito"] : null;
  return {
    id: a["id"],
    codigo: q ? str(q["codigo"]) : null,
    descricao: str(a["descricao"]),
    severidade: str(a["severidade"]),
    status: str(a["status"]),
    origem: str(a["origem"]),
    regra_violada: str(a["regra_violada"]),
    acao_sugerida: str(a["acao_sugerida"]),
    criado_em: str(a["criado_em"]),
  };
}
function lista<T>(v: unknown, f: (x: unknown) => T | null): T[] | null {
  if (!Array.isArray(v)) return null;
  const r = v.map(f);
  return r.some((x) => x === null) ? null : (r as T[]);
}

export function parseAnaliseV116(raw: unknown): LeituraV116 | null {
  if (!obj(raw) || raw["schema_versao"] !== "v116-v1") return null;
  const c = raw["competencia"];
  if (!obj(c) || typeof c["id"] !== "string" || typeof c["competencia_referencia"] !== "string")
    return null;
  const estado = raw["estado_analise"];
  if (typeof estado !== "string" || !(ESTADOS_ANALISE as readonly string[]).includes(estado))
    return null;
  if (!ehBool(raw["stale"]) || !ehNum(raw["percentual"])) return null;
  const bs = raw["blocking_summary"];
  if (!obj(bs)) return null;
  const aa = raw["allowed_actions"];
  if (
    !obj(aa) ||
    !ehBool(aa["executar_analise"]) ||
    !ehBool(aa["reanalisar"]) ||
    !ehBool(aa["abrir_requisito"])
  )
    return null;
  const ex = raw["execucao_atual"];
  let execucao_atual: ExecucaoV116 | null = null;
  if (ex !== null) {
    execucao_atual = parseExec(ex);
    if (!execucao_atual) return null;
  }
  const mc = raw["mecanismos"];
  if (!obj(mc)) return null;
  let mecanismos: Record<Mecanismo, number> | null = null;
  if (execucao_atual || Object.keys(mc).length > 0) {
    if (!MECANISMOS.every((k) => ehNum(mc[k]))) return null;
    mecanismos = Object.fromEntries(MECANISMOS.map((k) => [k, mc[k] as number])) as Record<
      Mecanismo,
      number
    >;
  }
  const rp = parsePag(raw["resultados_paginacao"]);
  const ep = parsePag(raw["execucoes_paginacao"]);
  const ap = parsePag(raw["apontamentos_paginacao"]);
  const resultados = lista(raw["resultados"], parseRes);
  const execucoes = lista(raw["execucoes"], parseExec);
  const apontamentos = lista(raw["apontamentos"], parseAp);
  if (!rp || !ep || !ap || !resultados || !execucoes || !apontamentos) return null;
  return {
    competencia: {
      id: c["id"],
      competencia_referencia: c["competencia_referencia"],
      situacao: str(c["situacao"]) ?? "",
    },
    estado_analise: estado as EstadoAnalise,
    stale: raw["stale"],
    execucao_atual,
    percentual: raw["percentual"],
    blocking_summary: bs,
    allowed_actions: {
      executar_analise: aa["executar_analise"],
      reanalisar: aa["reanalisar"],
      abrir_requisito: aa["abrir_requisito"],
    },
    mecanismos,
    resultados,
    resultados_paginacao: rp,
    execucoes,
    execucoes_paginacao: ep,
    apontamentos,
    apontamentos_paginacao: ap,
  };
}

// ---------- rótulos PT-BR (valor desconhecido → literal) ----------
export const ROTULO_ESTADO_ANALISE: Record<EstadoAnalise, string> = {
  not_analyzed: "Não analisada",
  queued: "Na fila",
  processing: "Processando",
  failed: "Falhou",
  complete: "Concluída",
  stale: "Desatualizada",
};
export const ROTULO_MECANISMO: Record<Mecanismo, string> = {
  deterministico: "Determinístico",
  semantico: "Semântico",
  humano: "Humano",
  nao_identificado: "Não identificado",
};
const ROT_CRIT: Record<string, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  informativo: "Informativo",
};
const ROT_RES: Record<string, string> = {
  nao_enviado: "Não enviado",
  recebido: "Recebido",
  pendente: "Pendente",
  em_analise: "Em análise",
  conforme: "Conforme",
  nao_conforme: "Não conforme",
  inconclusivo: "Inconclusivo",
  requer_revisao: "Requer revisão",
  nao_aplicavel: "Não aplicável",
};
const ROT_AP: Record<string, string> = {
  aberto: "Aberto",
  em_tratamento: "Em tratamento",
  resolvido: "Resolvido",
  descartado: "Descartado",
};
export const rotuloCriticidade = (v: string) => ROT_CRIT[v] ?? v;
export const rotuloResultado = (v: string) => ROT_RES[v] ?? v;
export const rotuloStatusApontamento = (v: string) => ROT_AP[v] ?? v;

/** Chaves conhecidas do `blocking_summary` (portão backend) com rótulo PT-BR. */
export const ROTULOS_BLOQUEIO: Array<[string, string]> = [
  ["total", "Requisitos avaliados"],
  ["conformes_ou_na_validos", "Conformes ou não aplicáveis válidos"],
  ["pendentes", "Pendentes"],
  ["nao_conformes", "Não conformes"],
  ["inconclusivos", "Inconclusivos"],
  ["em_analise", "Em análise"],
  ["nao_conformidades_bloqueantes", "Não conformidades bloqueantes"],
];

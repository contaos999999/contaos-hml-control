/**
 * V1-14 — Competência: visão geral.
 * Adapter local tipado para `obter_visao_geral_competencia` (RPC certificada no HML,
 * ausente do client gerado). Não altera types.ts nem client.ts.
 * O frontend apenas apresenta dados; portão e ações são autoridade do backend.
 */
import { supabase } from "@/integrations/supabase/client";

type RespostaRpc = { data: unknown; error: unknown; status?: number };
type RpcVisaoGeral = {
  rpc(
    fn: "obter_visao_geral_competencia",
    args: { p_id_competencia: string },
  ): { abortSignal(signal: AbortSignal): PromiseLike<RespostaRpc> };
};
const cliente = supabase as unknown as RpcVisaoGeral;

export function obterVisaoGeral(id: string, signal: AbortSignal): PromiseLike<RespostaRpc> {
  return cliente.rpc("obter_visao_geral_competencia", { p_id_competencia: id }).abortSignal(signal);
}

export type CompetenciaVG = {
  id: string;
  id_contrato: string;
  id_organizacao: string;
  competencia_referencia: string;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  data_limite: string | null;
  situacao: string;
  percentual_conformidade: number | null;
  versao_pacote_atual: number | null;
  versao_registro: number | null;
  atualizado_em: string | null;
};
export type PortaoVG = {
  liberado: boolean;
  total: number;
  avaliados: number;
  pendentes: number;
  nao_conformes: number;
  inconclusivos: number;
  em_analise: number;
  nao_conformidades_bloqueantes: number;
  percentual: number | null;
};
export type BlockingSummaryVG = {
  pendentes: number;
  nao_conformes: number;
  inconclusivos: number;
  em_analise: number;
  nao_conformidades_bloqueantes: number;
  parecer_aprovado: boolean;
  analise_concluida_atual: boolean;
  aprovacao_apresentacao_atual: boolean;
};
export type AllowedActionsVG = {
  abrir_documentos: boolean;
  analisar: boolean;
  abrir_parecer: boolean;
  apresentar: boolean;
};
export type VisaoGeral = {
  competencia: CompetenciaVG;
  portao: PortaoVG;
  blocking_summary: BlockingSummaryVG;
  allowed_actions: AllowedActionsVG;
};

type Obj = Record<string, unknown>;
const ehObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string";
const strN = (v: unknown) => v === null || typeof v === "string";
const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const numN = (v: unknown) => v === null || num(v);
const bool = (v: unknown) => typeof v === "boolean";
const todos = (o: Obj, ks: string[], f: (v: unknown) => boolean) => ks.every((k) => f(o[k]));

export function parseVisaoGeral(data: unknown): VisaoGeral | null {
  if (!ehObj(data)) return null;
  const { competencia: c, portao: p, blocking_summary: b, allowed_actions: a } = data;
  if (!ehObj(c) || !ehObj(p) || !ehObj(b) || !ehObj(a)) return null;
  // A RPC canônica retorna conformes_ou_na_validos; `avaliados` é somente
  // um alias de apresentação. Não modificar portão nem permissões no cliente.
  const avaliados = p["conformes_ou_na_validos"];
  if (!num(avaliados)) return null;
  const ok =
    todos(c, ["id", "id_contrato", "id_organizacao", "competencia_referencia", "situacao"], str) &&
    todos(c, ["periodo_inicio", "periodo_fim", "data_limite", "atualizado_em"], strN) &&
    todos(c, ["percentual_conformidade", "versao_pacote_atual", "versao_registro"], numN) &&
    bool(p["liberado"]) &&
    todos(
      p,
      [
        "total",
        "pendentes",
        "nao_conformes",
        "inconclusivos",
        "em_analise",
        "nao_conformidades_bloqueantes",
      ],
      num,
    ) &&
    numN(p["percentual"]) &&
    todos(
      b,
      [
        "pendentes",
        "nao_conformes",
        "inconclusivos",
        "em_analise",
        "nao_conformidades_bloqueantes",
      ],
      num,
    ) &&
    todos(
      b,
      ["parecer_aprovado", "analise_concluida_atual", "aprovacao_apresentacao_atual"],
      bool,
    ) &&
    todos(a, ["abrir_documentos", "analisar", "abrir_parecer", "apresentar"], bool);
  if (!ok) return null;
  return { ...(data as Obj), portao: { ...p, avaliados } } as VisaoGeral;
}

export type TipoErroVisaoGeral = "sem_permissao" | "nao_encontrada" | "erro";

export function classificarErroVisaoGeral(error: unknown, status?: number): TipoErroVisaoGeral {
  const code = ehObj(error) && typeof error["code"] === "string" ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501") return "sem_permissao";
  if (code === "P0001") return "nao_encontrada";
  return "erro";
}

export function rotuloSituacao(s: string): string {
  if (s === "pode_apresentar_contratante") return "PODE APRESENTAR AO CONTRATANTE";
  if (s === "pode_reapresentar_contratante") return "PODE REAPRESENTAR AO CONTRATANTE";
  return s;
}

export type EstadoVisual = "preparation" | "analysis" | "blocked" | "ready" | "presented";
const APRESENTADAS = new Set([
  "apresentado",
  "aguardando_contratante",
  "com_apontamentos",
  "reapresentado",
  "validada",
  "encerrada",
]);
const PRONTAS = new Set(["pode_apresentar_contratante", "pode_reapresentar_contratante"]);
const EM_ANALISE = new Set(["em_analise", "em_reanalise"]);

/** Apresentação apenas — nunca usada para habilitar ações. */
export function derivarEstadoVisual(vg: VisaoGeral): EstadoVisual {
  const s = vg.competencia.situacao;
  if (APRESENTADAS.has(s)) return "presented";
  if (PRONTAS.has(s)) return "ready";
  const b = vg.blocking_summary;
  if (!vg.portao.liberado && (b.nao_conformidades_bloqueantes > 0 || b.nao_conformes > 0))
    return "blocked";
  if (EM_ANALISE.has(s)) return "analysis";
  return "preparation";
}

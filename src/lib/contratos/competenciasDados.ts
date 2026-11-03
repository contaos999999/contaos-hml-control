/**
 * V1-12 — Competências do contrato (somente leitura).
 * Data API SELECT em `competencias` sob RLS `usuario_tem_acesso_contrato`.
 * Paginação e filtros server-side; status e percentual exibidos como vêm do backend.
 */
import { supabase } from "@/integrations/supabase/client";

export const PAGINA_COMPETENCIAS = 25;
export const COLUNAS_COMPETENCIA =
  "id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em";

/** Tokens exatos do CHECK HML; exibidos sem tradução. */
export const SITUACOES_COMPETENCIA = [
  "rascunho",
  "preparando",
  "em_analise",
  "pendente_correcao",
  "em_reanalise",
  "pode_apresentar_contratante",
  "apresentado",
  "aguardando_contratante",
  "com_apontamentos",
  "pode_reapresentar_contratante",
  "reapresentado",
  "validada",
  "encerrada",
  "cancelada",
] as const;

export type Competencia = {
  id: string;
  competencia_referencia: string;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  data_limite: string | null;
  situacao: string;
  percentual_conformidade: number | null;
  versao_pacote_atual: number | null;
  atualizado_em: string | null;
};
export type FiltrosCompetencia = { mes: string; situacao: string };
export const FILTROS_COMPETENCIA_VAZIOS: FiltrosCompetencia = { mes: "", situacao: "" };

export type TipoErroCompetencia = "negado" | "erro";
export class ErroCompetencia extends Error {
  constructor(public tipo: TipoErroCompetencia) {
    super(tipo);
  }
}

/** `YYYY-MM` (input month) → `YYYY-MM-01`; inválido → null. */
export function mesParaReferencia(mes: string): string | null {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? `${mes}-01` : null;
}
/** `YYYY-MM-DD` → `MM/AAAA`, sem fuso. */
export function formatarCompetencia(ref: string | null | undefined): string {
  const r = /^(\d{4})-(\d{2})/.exec(ref ?? "");
  return r ? `${r[2]}/${r[1]}` : "—";
}
export function formatarPercentual(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
  return `${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function classificarErroCompetencia(error: unknown, status?: number): TipoErroCompetencia {
  const code = (error as { code?: string } | null)?.code;
  return code === "42501" || code === "PGRST301" || status === 401 || status === 403 ? "negado" : "erro";
}

export async function listarCompetencias(
  idContrato: string,
  filtros: FiltrosCompetencia,
  pagina: number,
  signal?: AbortSignal,
): Promise<{ itens: Competencia[]; total: number }> {
  let q = supabase
    .from("competencias")
    .select(COLUNAS_COMPETENCIA, { count: "exact" })
    .eq("id_contrato", idContrato);
  const ref = mesParaReferencia(filtros.mes);
  if (ref) q = q.eq("competencia_referencia", ref);
  if (filtros.situacao) q = q.eq("situacao", filtros.situacao);
  const ini = pagina * PAGINA_COMPETENCIAS;
  let r = q
    .order("competencia_referencia", { ascending: false })
    .order("id", { ascending: false })
    .range(ini, ini + PAGINA_COMPETENCIAS - 1);
  if (signal) r = r.abortSignal(signal);
  const { data, error, count, status } = await r;
  if (error) throw new ErroCompetencia(classificarErroCompetencia(error, status));
  return { itens: (data ?? []) as Competencia[], total: count ?? 0 };
}

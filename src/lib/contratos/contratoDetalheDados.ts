/**
 * V1-06 — Contrato: visão geral (somente leitura).
 * SELECT por id sob RLS `contratos_select`. Classificador oficial
 * `classificar_acesso_contrato_v106` somente após zero linhas reais.
 * Sem filtro local por organização: preferência é contexto, não autorização.
 */
import { supabase } from "@/integrations/supabase/client";

export const COLUNAS_DETALHE =
  "id,id_organizacao,id_contratante,numero,objeto,situacao,criticidade,inicio,fim,tipo_contrato,unidade_vinculada,fonte_recurso,valor_global,valor_mensal_referencia,periodicidade,prazo_prestacao_dias,dia_limite_apresentacao,contratante:contratantes!contratos_contratante_org_fk(razao_social,nome_fantasia,documento)";

export type ContratoDetalhe = {
  id: string;
  id_organizacao: string;
  id_contratante: string;
  numero: string;
  objeto: string;
  situacao: string;
  criticidade: string;
  inicio: string | null;
  fim: string | null;
  tipo_contrato: string | null;
  unidade_vinculada: string | null;
  fonte_recurso: string | null;
  valor_global: number | null;
  valor_mensal_referencia: number | null;
  periodicidade: string | null;
  prazo_prestacao_dias: number | null;
  dia_limite_apresentacao: number | null;
  contratante: { razao_social: string | null; nome_fantasia: string | null; documento: string | null } | null;
};

export type TipoErroDetalhe = "negado" | "nao_encontrado" | "consistencia" | "erro";
export class ErroDetalhe extends Error {
  constructor(public tipo: TipoErroDetalhe) {
    super(tipo);
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuidValido = (v: string) => UUID.test(v);

function erroNegado(error: unknown, status?: number) {
  const code = (error as { code?: string } | null)?.code;
  return code === "42501" || code === "PGRST301" || status === 401 || status === 403;
}

async function classificar(id: string): Promise<never> {
  let r: { data: unknown; error: unknown };
  try {
    r = await supabase.rpc("classificar_acesso_contrato_v106", { p_id_contrato: id });
  } catch {
    throw new ErroDetalhe("erro");
  }
  if (r.error) throw new ErroDetalhe("erro");
  if (r.data === "negado") throw new ErroDetalhe("negado");
  if (r.data === "nao_encontrado") throw new ErroDetalhe("nao_encontrado");
  if (r.data === "permitido") throw new ErroDetalhe("consistencia");
  throw new ErroDetalhe("erro");
}

export async function obterContrato(id: string, signal?: AbortSignal): Promise<ContratoDetalhe> {
  if (!uuidValido(id)) throw new ErroDetalhe("nao_encontrado");
  let q = supabase.from("contratos").select(COLUNAS_DETALHE).eq("id", id);
  if (signal) q = q.abortSignal(signal);
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await q.maybeSingle();
  } catch {
    throw new ErroDetalhe("erro");
  }
  if (r.error) throw new ErroDetalhe(erroNegado(r.error, r.status) ? "negado" : "erro");
  if (!r.data) return classificar(id);
  return r.data as ContratoDetalhe;
}

export function formatarDataBr(d: string | null | undefined): string {
  const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarBrl = (v: number | null) => (v === null || v === undefined ? "—" : moeda.format(v));
export const texto = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? "—" : String(v));

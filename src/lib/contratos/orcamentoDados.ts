/**
 * V1-08 — Contrato: orçamento.
 * Leituras leves sob RLS; mutações exclusivamente pelos 5 RPCs V108.
 * Hash, numeração, situação oficial e autorização são do backend; nada é calculado aqui.
 */
import { supabase } from "@/integrations/supabase/client";
import { COLUNAS_ARQUIVO, ErroBn, classificarErroRpc, type ArquivoResumo, type Pagina } from "@/lib/contratos/baseNormativaDados";

export const PAGINA_ORC = 25;
export const COLUNAS_PROPOSTA = "id,id_organizacao,id_contrato,titulo,situacao,versao_atual,versao_registro,criado_em,atualizado_em";
export const COLUNAS_VERSAO_PROPOSTA = "id,id_proposta,numero_versao,vigencia_inicio,vigencia_fim,valor_total,hash,situacao,aprovado_por,aprovado_em,criado_em,id_arquivo_origem";
export const COLUNAS_RUBRICA = "id,id_versao_proposta,codigo,grupo,rubrica,subrubrica,descricao,valor_mensal_previsto,valor_anual_previsto,permite_remanejamento,limite_remanejamento_percentual,observacoes,versao_registro,criado_em";

// Tipos estruturais locais (types.ts gerado permanece intocado).
export type Proposta = { id: string; id_organizacao: string; id_contrato: string; titulo: string; situacao: string; versao_atual: number | null; versao_registro: number; criado_em: string; atualizado_em: string };
export type VersaoProposta = { id: string; id_proposta: string; numero_versao: number; vigencia_inicio: string | null; vigencia_fim: string | null; valor_total: number | null; hash: string | null; situacao: string; aprovado_por: string | null; aprovado_em: string | null; criado_em: string; id_arquivo_origem: string | null };
export type Rubrica = { id: string; id_versao_proposta: string; codigo: string | null; grupo: string | null; rubrica: string | null; subrubrica: string | null; descricao: string | null; valor_mensal_previsto: number | null; valor_anual_previsto: number | null; permite_remanejamento: boolean | null; limite_remanejamento_percentual: number | null; observacoes: string | null; versao_registro: number; criado_em: string };
export type { ArquivoResumo, Pagina };

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
const abortar = (s?: AbortSignal) => {
  if (s?.aborted) throw s.reason ?? new DOMException("Aborted", "AbortError");
};
async function executar(q: PromiseLike<Resp>, signal?: AbortSignal): Promise<Resp> {
  let r: Resp;
  try {
    r = await q;
  } catch {
    abortar(signal);
    throw new ErroBn("erro");
  }
  abortar(signal);
  if (r.error) {
    const code = (r.error as { code?: string }).code;
    throw new ErroBn(code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403 ? "negado" : "erro");
  }
  return r;
}
const faixa = (p: number) => [p * PAGINA_ORC, p * PAGINA_ORC + PAGINA_ORC - 1] as const;

export async function listarPropostas(contrato: string, pagina: number, signal?: AbortSignal): Promise<Pagina<Proposta>> {
  const [a, b] = faixa(pagina);
  let q = supabase.from("propostas_orcamentarias").select(COLUNAS_PROPOSTA, { count: "exact" }).eq("id_contrato", contrato)
    .order("criado_em", { ascending: false }).order("id", { ascending: true }).range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as Proposta[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarVersoesProposta(idProposta: string, pagina: number, signal?: AbortSignal): Promise<Pagina<VersaoProposta>> {
  const [a, b] = faixa(pagina);
  let q = supabase.from("versoes_proposta").select(COLUNAS_VERSAO_PROPOSTA, { count: "exact" }).eq("id_proposta", idProposta)
    .order("numero_versao", { ascending: false }).order("id", { ascending: true }).range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as VersaoProposta[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarRubricas(idVersao: string, pagina: number, signal?: AbortSignal): Promise<Pagina<Rubrica>> {
  const [a, b] = faixa(pagina);
  let q = supabase.from("linhas_orcamentarias").select(COLUNAS_RUBRICA, { count: "exact" }).eq("id_versao_proposta", idVersao)
    .order("grupo", { ascending: true }).order("rubrica", { ascending: true }).order("subrubrica", { ascending: true }).order("id", { ascending: true }).range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as Rubrica[] | null) ?? [], total: r.count ?? 0 };
}

/** Metadados seguros dos documentos-base de uma página de versões (uma consulta, sem N+1, sem path). */
export async function obterArquivosPorIds(ids: string[], signal?: AbortSignal): Promise<ArquivoResumo[]> {
  if (ids.length === 0) return [];
  let q = supabase.from("arquivos").select(COLUNAS_ARQUIVO).in("id", ids);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return (r.data as ArquivoResumo[] | null) ?? [];
}

// ---------- RPCs V108 ----------
// LACUNA DE TIPOS: types.ts (gerado, não editável) não declara as RPCs V108.
// Fronteira única e estritamente tipada (assinaturas lidas do HML), no padrão V1-07.
type ArgsV108 = {
  salvar_proposta_orcamentaria_v108: { p_id_organizacao: string; p_id_contrato: string; p_id_proposta: string | null; p_titulo: string; p_versao_esperada: number | null; p_chave_idempotencia: string };
  registrar_versao_proposta_v108: { p_id_organizacao: string; p_id_proposta: string; p_vigencia_inicio: string; p_vigencia_fim: string | null; p_id_arquivo_origem: string; p_chave_idempotencia: string };
  salvar_linha_orcamentaria_v108: {
    p_id_organizacao: string; p_id_versao_proposta: string; p_id_linha: string | null; p_codigo: string | null; p_grupo: string; p_rubrica: string; p_subrubrica: string | null; p_descricao: string | null;
    p_valor_mensal: number | null; p_valor_anual: number | null; p_permite_remanejamento: boolean; p_limite_remanejamento_percentual: number | null; p_observacoes: string | null; p_versao_esperada: number | null; p_chave_idempotencia: string;
  };
  remover_linha_orcamentaria_v108: { p_id_organizacao: string; p_id_versao_proposta: string; p_id_linha: string; p_versao_esperada: number; p_chave_idempotencia: string };
  publicar_versao_proposta_v108: { p_id_organizacao: string; p_id_versao: string; p_hash_esperado: string; p_fundamento: string; p_chave_idempotencia: string };
};
export type NomeV108 = keyof ArgsV108;
export type ArgsRpcV108<N extends NomeV108> = ArgsV108[N];
type RpcV108 = <N extends NomeV108>(nome: N, args: ArgsV108[N]) => PromiseLike<{ data: unknown; error: unknown }>;
const rpcV108 = supabase.rpc.bind(supabase) as unknown as RpcV108;

export async function chamarV108<N extends NomeV108>(nome: N, args: ArgsV108[N]): Promise<{ correlationId: string | null }> {
  let r: { data: unknown; error: unknown };
  try {
    r = await rpcV108(nome, args);
  } catch {
    throw new ErroBn("erro");
  }
  if (r.error) throw new ErroBn(classificarErroRpc(r.error));
  const c = (r.data as { correlation_id?: unknown } | null)?.correlation_id;
  return { correlationId: typeof c === "string" ? c : null };
}

/** Mesma intenção (payload igual) preserva a chave; alteração material renova. */
export function criarGerenciadorChave() {
  let ultimo: string | null = null;
  let chave = "";
  return (payload: unknown): string => {
    const s = JSON.stringify(payload);
    if (s !== ultimo) {
      ultimo = s;
      chave = crypto.randomUUID();
    }
    return chave;
  };
}

/** "1.234,56" → 1234.56; vazio → null; inválido → NaN. */
export function lerValorBr(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return Number.NaN;
  return Number(t.replace(/\./g, "").replace(",", "."));
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarBrl = (v: number | null | undefined) => (v === null || v === undefined ? "—" : moeda.format(v));
export const valorParaCampo = (v: number | null | undefined) => (v === null || v === undefined ? "" : v.toFixed(2).replace(".", ","));

export const ROTULO_SITUACAO_PROPOSTA: Record<string, string> = { rascunho: "Rascunho", ativa: "Ativa", substituida: "Substituída", encerrada: "Encerrada" };
export const ROTULO_SITUACAO_VERSAO: Record<string, string> = { rascunho: "Rascunho", publicada: "Publicada", substituida: "Substituída" };
export const ROTULO_STATUS_ARQUIVO: Record<string, string> = { pendente: "Pendente de análise", processando: "Em análise", aprovado: "Aprovado", rejeitado: "Rejeitado" };

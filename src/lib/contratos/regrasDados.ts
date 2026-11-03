/**
 * V1-09 — Contrato: listas e regras.
 * Leituras leves sob RLS (filtro id_contrato é escopo de UX; RLS é a autoridade).
 * Única mutação: RPC oficial `aprovar_regra_preventiva`. Nada de portão é calculado aqui.
 */
import { supabase } from "@/integrations/supabase/client";
import { ErroBn } from "@/lib/contratos/baseNormativaDados";
import type { Pagina } from "@/lib/contratos/baseNormativaDados";

export const PAGINA_REGRAS = 25;
export const COLUNAS_LISTA =
  "id,nome,descricao,situacao,versao_atual,versao_registro,atualizado_em";
export const COLUNAS_VERSAO_LISTA =
  "id,id_lista,numero_versao,vigencia_inicio,vigencia_fim,situacao,aprovado_em";
export const COLUNAS_ITEM =
  "id,codigo,descricao,categoria,obrigatorio,aplicavel,impeditivo,criticidade,id_fonte_versao,regra_validacao,ordem";
export const COLUNAS_REGRA_CONFORMIDADE =
  "id,codigo,descricao,tipo,efeito_portao,id_fonte_versao,situacao,atualizado_em";
export const COLUNAS_REGRA_PREVENTIVA =
  "id,codigo_regra,descricao,efeito,criticidade,escopo_aplicacao,vigencia_inicio,vigencia_fim,numero_versao,situacao,fonte,id_fonte_formal_versao,versao_registro,aprovada_em";
export const COLUNAS_FONTE_FORMAL =
  "id,id_versao_fonte_normativa,fundamento_aplicabilidade,validado_em";

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
export type Lista = {
  id: string;
  nome: string;
  descricao: string | null;
  situacao: string;
  versao_atual: number;
  versao_registro: number;
  atualizado_em: string;
};
export type VersaoLista = {
  id: string;
  id_lista: string;
  numero_versao: number;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  situacao: string;
  aprovado_em: string | null;
};
export type ItemLista = {
  id: string;
  codigo: string;
  descricao: string;
  categoria: string | null;
  obrigatorio: boolean;
  aplicavel: boolean;
  impeditivo: boolean;
  criticidade: string;
  id_fonte_versao: string | null;
  regra_validacao: Json;
  ordem: number;
};
export type RegraConformidade = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  efeito_portao: boolean;
  id_fonte_versao: string | null;
  situacao: string;
  atualizado_em: string;
};
export type RegraPreventiva = {
  id: string;
  codigo_regra: string;
  descricao: string;
  efeito: string;
  criticidade: string;
  escopo_aplicacao: string;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  numero_versao: number;
  situacao: string;
  fonte: Json;
  id_fonte_formal_versao: string | null;
  versao_registro: number;
  aprovada_em: string | null;
};
export type FonteFormal = {
  id: string;
  id_versao_fonte_normativa: string;
  fundamento_aplicabilidade: string;
  validado_em: string;
};
export type { Pagina };

export const SITUACOES_PREVENTIVA = [
  "candidata",
  "ativa",
  "inativa",
  "rejeitada",
  "substituida",
] as const;
export const ROTULO_SITUACAO_PREVENTIVA: Record<string, string> = {
  candidata: "Candidata",
  ativa: "Ativa",
  inativa: "Inativa",
  rejeitada: "Rejeitada",
  substituida: "Substituída",
};
export const ROTULO_SITUACAO_LISTA: Record<string, string> = {
  rascunho: "Rascunho",
  ativa: "Ativa",
  inativa: "Inativa",
  publicada: "Publicada",
  substituida: "Substituída",
};
export const ROTULO_ESCOPO: Record<string, string> = {
  contrato: "Contrato",
  contratante: "Contratante",
  organizacao: "Organização",
  tipo_contrato: "Tipo de contrato",
};
export const ROTULO_CRITICIDADE: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};
export const rotulo = (mapa: Record<string, string>, v: string | null | undefined) =>
  v ? (mapa[v] ?? v) : "—";

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
async function executar(q: PromiseLike<Resp>, signal?: AbortSignal): Promise<Resp> {
  let r: Resp;
  try {
    r = await q;
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ErroBn("erro");
  }
  if (r.error) {
    const code = (r.error as { code?: string }).code;
    throw new ErroBn(
      code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403
        ? "negado"
        : "erro",
    );
  }
  return r;
}
const faixa = (p: number) => [p * PAGINA_REGRAS, p * PAGINA_REGRAS + PAGINA_REGRAS - 1] as const;

export async function listarListas(
  contrato: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<Lista>> {
  const [a, b] = faixa(pagina);
  let q = supabase
    .from("listas_verificacao")
    .select(COLUNAS_LISTA, { count: "exact" })
    .eq("id_contrato", contrato)
    .order("atualizado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as Lista[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarVersoesLista(
  idLista: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<VersaoLista>> {
  const [a, b] = faixa(pagina);
  let q = supabase
    .from("versoes_lista")
    .select(COLUNAS_VERSAO_LISTA, { count: "exact" })
    .eq("id_lista", idLista)
    .order("numero_versao", { ascending: false })
    .order("id", { ascending: false })
    .range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as VersaoLista[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarItens(
  idVersao: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<ItemLista>> {
  const [a, b] = faixa(pagina);
  let q = supabase
    .from("itens_lista")
    .select(COLUNAS_ITEM, { count: "exact" })
    .eq("id_versao_lista", idVersao)
    .order("ordem", { ascending: true })
    .order("id", { ascending: true })
    .range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as ItemLista[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarRegrasConformidade(
  contrato: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<RegraConformidade>> {
  const [a, b] = faixa(pagina);
  let q = supabase
    .from("regras_conformidade")
    .select(COLUNAS_REGRA_CONFORMIDADE, { count: "exact" })
    .eq("id_contrato", contrato)
    .order("codigo", { ascending: true })
    .order("id", { ascending: true })
    .range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as RegraConformidade[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarRegrasPreventivas(
  contrato: string,
  situacao: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<RegraPreventiva>> {
  const [a, b] = faixa(pagina);
  let base = supabase
    .from("regras_preventivas")
    .select(COLUNAS_REGRA_PREVENTIVA, { count: "exact" })
    .eq("id_contrato", contrato);
  if (situacao) base = base.eq("situacao", situacao);
  let q = base
    .order("situacao", { ascending: true })
    .order("codigo_regra", { ascending: true })
    .order("id", { ascending: true })
    .range(a, b);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as RegraPreventiva[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarFontesFormais(
  idRegra: string,
  signal?: AbortSignal,
): Promise<FonteFormal[]> {
  let q = supabase
    .from("fontes_formais_regras_preventivas")
    .select(COLUNAS_FONTE_FORMAL)
    .eq("id_regra_preventiva", idRegra)
    .order("validado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(0, PAGINA_REGRAS - 1);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return (r.data as FonteFormal[] | null) ?? [];
}

/** Rótulos "Título — versão N" somente para ids presentes na página (sem dataset completo). */
export async function obterRotulosFontes(
  idsVersao: string[],
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  const ids = [...new Set(idsVersao.filter(Boolean))].sort();
  if (ids.length === 0) return {};
  let qv = supabase.from("versoes_fontes_normativas").select("id,id_fonte,versao").in("id", ids);
  if (signal) qv = qv.abortSignal(signal);
  const rv = await executar(qv, signal);
  const versoes = (rv.data as Array<{ id: string; id_fonte: string; versao: number }> | null) ?? [];
  const idsFonte = [...new Set(versoes.map((v) => v.id_fonte))].sort();
  let titulos: Record<string, string> = {};
  if (idsFonte.length) {
    let qf = supabase.from("fontes_normativas").select("id,titulo").in("id", idsFonte);
    if (signal) qf = qf.abortSignal(signal);
    const rf = await executar(qf, signal);
    titulos = Object.fromEntries(
      ((rf.data as Array<{ id: string; titulo: string }> | null) ?? []).map((f) => [
        f.id,
        f.titulo,
      ]),
    );
  }
  return Object.fromEntries(
    versoes.map((v) => [v.id, `${titulos[v.id_fonte] ?? "Fonte"} — versão ${v.versao}`]),
  );
}

/** Converte JSON em pares chave/valor legíveis (nunca JSON cru). */
export function paresLegiveis(v: Json, prefixo = ""): Array<[string, string]> {
  if (v === null || v === undefined) return [];
  if (Array.isArray(v)) {
    if (v.every((x) => x === null || typeof x !== "object"))
      return prefixo ? [[prefixo, v.map((x) => valorLegivel(x)).join(", ")]] : [];
    return v.flatMap((x, i) => paresLegiveis(x, `${prefixo || "item"} ${i + 1}`));
  }
  if (typeof v === "object")
    return Object.entries(v).flatMap(([k, x]) =>
      paresLegiveis(x, prefixo ? `${prefixo} › ${k}` : k),
    );
  return prefixo ? [[prefixo, valorLegivel(v)]] : [["valor", valorLegivel(v)]];
}
function valorLegivel(x: Json): string {
  if (x === true) return "Sim";
  if (x === false) return "Não";
  if (x === null) return "—";
  return String(x);
}

// ---------- Aprovação (RPC oficial) ----------
export type TipoErroAprovacao = "negado" | "nao_encontrada" | "conflito" | "validacao" | "erro";
export class ErroAprovacao extends Error {
  constructor(public tipo: TipoErroAprovacao) {
    super(tipo);
  }
}
export function classificarErroAprovacao(error: unknown): TipoErroAprovacao {
  const code = (error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PT403" || code === "PGRST301") return "negado";
  if (code === "P0002" || code === "PT404") return "nao_encontrada";
  if (code === "PT409" || code === "40001") return "conflito";
  if (code === "PT400" || code === "P0001" || code === "22023" || code === "23514")
    return "validacao";
  return "erro";
}

type ArgsAprovacao = { p_id_regra_preventiva: string; p_parecer: string | null };
type ArgsGerados = { p_id_regra_preventiva: string; p_parecer?: string };

export async function aprovarRegraPreventiva(idRegra: string, parecer: string): Promise<string> {
  const args: ArgsAprovacao = { p_id_regra_preventiva: idRegra, p_parecer: parecer.trim() || null };
  // Fronteira única: o tipo gerado declara p_parecer opcional sem null; a RPC aceita null (default).
  let r: { data: unknown; error: unknown };
  try {
    r = await supabase.rpc("aprovar_regra_preventiva", args as unknown as ArgsGerados);
  } catch {
    throw new ErroAprovacao("erro");
  }
  if (r.error) throw new ErroAprovacao(classificarErroAprovacao(r.error));
  if (typeof r.data !== "string" || !r.data) throw new ErroAprovacao("erro");
  return r.data;
}

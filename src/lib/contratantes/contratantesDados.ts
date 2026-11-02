/**
 * V1-01 — Contratantes (somente leitura).
 * Acesso exclusivo via Data API com RLS. A autorização é do backend:
 * - Q1 `organizacoes` usa o mesmo predicado RLS de `contratantes`
 *   (`privado.usuario_tem_acesso_organizacao`) para distinguir negado de vazio.
 * - Q2 `contratantes` paginada no servidor (NFR-009).
 * Nenhuma escrita, RPC ou Edge neste módulo.
 */
import { supabase } from "@/integrations/supabase/client";

export const TAMANHO_PAGINA = 25;
export const COLUNAS_CONTRATANTE = "id,razao_social,nome_fantasia,documento,tipo_pessoa,situacao,atualizado_em";

export type FiltroSituacao = "todos" | "ativo" | "inativo";

export type Contratante = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  documento: string | null;
  tipo_pessoa: string;
  situacao: string;
  atualizado_em: string | null;
};

export type ParametrosLista = { idOrganizacao: string; pagina: number; busca: string; situacao: FiltroSituacao };
export type PaginaContratantes = { itens: Contratante[]; total: number; pagina: number; totalPaginas: number };

export class ErroContratantes extends Error {
  constructor(public tipo: "negado" | "erro" | "faixa") {
    super(tipo);
  }
}

type RespostaPg = { error: unknown; status?: number };

function classificar(r: RespostaPg): ErroContratantes {
  const code = (r.error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403) return new ErroContratantes("negado");
  if (code === "PGRST103" || r.status === 416) return new ErroContratantes("faixa");
  return new ErroContratantes("erro");
}

/** Q1: a organização é visível pelo mesmo predicado RLS? 0 linhas = negado. */
export async function verificarAcessoOrganizacao(idOrganizacao: string): Promise<true> {
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase.from("organizacoes").select("id").eq("id", idOrganizacao).maybeSingle();
  } catch {
    throw new ErroContratantes("erro");
  }
  if (r.error) throw classificar(r);
  const d = r.data as { id?: unknown } | null;
  if (!d) throw new ErroContratantes("negado");
  if (d.id !== idOrganizacao) throw new ErroContratantes("erro");
  return true;
}

/** Busca recusada: `*` é alias de `%` no LIKE do PostgREST e não é permitido em V1-01. */
export class ErroBuscaInvalida extends Error {
  constructor(public motivo: "asterisco") {
    super(motivo);
  }
}

export const buscaContemAsterisco = (texto: string) => texto.trim().includes("*");

/**
 * Valor seguro para `.or()` (sintaxe PostgREST crua):
 * 1) trim + limite de 100 caracteres; `*` é recusado (ErroBuscaInvalida);
 * 2) LIKE: escapa `\\`, `%` e `_` como literais;
 * 3) curingas próprios `%...%`;
 * 4) delimita como UM valor entre aspas duplas, escapando `"` e `\\` — vírgula, ponto,
 *    dois-pontos e parênteses ficam literais e não podem formar operador/condição.
 */
export function montarPadraoBusca(texto: string): string | null {
  if (buscaContemAsterisco(texto)) throw new ErroBuscaInvalida("asterisco");
  const t = texto.trim().slice(0, 100);
  if (!t) return null;
  const like = t.replace(/[\\%_]/g, (c) => `\\${c}`);
  const valor = `%${like}%`.replace(/["\\]/g, (c) => `\\${c}`);
  return `"${valor}"`;
}

export async function listarContratantes(p: ParametrosLista): Promise<PaginaContratantes> {
  const pagina = Math.max(1, Math.floor(p.pagina));
  const from = (pagina - 1) * TAMANHO_PAGINA;
  const to = from + TAMANHO_PAGINA - 1;
  let q = supabase.from("contratantes").select(COLUNAS_CONTRATANTE, { count: "exact" }).eq("id_organizacao", p.idOrganizacao);
  if (p.situacao !== "todos") q = q.eq("situacao", p.situacao);
  const padrao = montarPadraoBusca(p.busca);
  if (padrao) q = q.or(`razao_social.ilike.${padrao},nome_fantasia.ilike.${padrao},documento.ilike.${padrao}`);
  let r: { data: unknown; error: unknown; status?: number; count?: number | null };
  try {
    r = await q.order("razao_social", { ascending: true }).order("id", { ascending: true }).range(from, to);
  } catch {
    throw new ErroContratantes("erro");
  }
  if (r.error) throw classificar(r);
  if (!Array.isArray(r.data) || typeof r.count !== "number") throw new ErroContratantes("erro");
  const total = r.count;
  return { itens: r.data as Contratante[], total, pagina, totalPaginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA)) };
}

const TIPOS: Record<string, string> = {
  juridica: "Pessoa jurídica",
  fisica: "Pessoa física",
  orgao_publico: "Órgão público",
  outro: "Outro",
};
export const rotuloTipoPessoa = (t: string) => TIPOS[t] ?? t;

const SITUACOES: Record<string, string> = { ativo: "Ativo", inativo: "Inativo" };
export const rotuloSituacao = (s: string) => SITUACOES[s] ?? s;

/** Máscara apenas visual; o valor original nunca é alterado. */
export function formatarDocumento(d: string | null): string {
  if (!d || !d.trim()) return "Não informado";
  if (/^\d{14}$/.test(d)) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (/^\d{11}$/.test(d)) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return d;
}

const FMT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export function formatarDataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return FMT.format(d).replace(",", "");
}

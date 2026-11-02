/**
 * V1-07 — Contrato: base normativa.
 * Leituras leves sob RLS; mutações exclusivamente pelos 4 RPCs V107.
 * Autoridade de perfil/escopo/aprovação é do backend; nada é calculado aqui.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export const PAGINA_BN = 25;
export const LIMITE_TEXTO = 5000;

export const COLUNAS_FONTE = "id,id_organizacao,id_contrato,tipo,titulo,referencia,descricao,situacao,versao_registro,criado_em,atualizado_em";
export const COLUNAS_VERSAO = "id,id_fonte,versao,inicio_vigencia,fim_vigencia,id_arquivo,hash,aprovado_por,aprovado_em,criado_em";
export const COLUNAS_APLICABILIDADE = "id,id_fonte_versao,aplicavel,fundamento,aprovado_por,aprovado_em,atualizado_em";
export const COLUNAS_ARQUIVO = "id,nome_original,mime,tamanho,status_seguranca,criado_em";

type FonteRow = T["fontes_normativas"]["Row"];
type VersaoRow = T["versoes_fontes_normativas"]["Row"];
type AplicRow = T["aplicabilidades_fonte"]["Row"];
type ArquivoRow = T["arquivos"]["Row"];
export type Fonte = Pick<FonteRow, "id" | "id_organizacao" | "id_contrato" | "tipo" | "titulo" | "referencia" | "descricao" | "situacao" | "versao_registro" | "criado_em" | "atualizado_em">;
export type Versao = Pick<VersaoRow, "id" | "id_fonte" | "versao" | "inicio_vigencia" | "fim_vigencia" | "id_arquivo" | "hash" | "aprovado_por" | "aprovado_em" | "criado_em">;
export type Aplicabilidade = Pick<AplicRow, "id" | "id_fonte_versao" | "aplicavel" | "fundamento" | "aprovado_por" | "aprovado_em" | "atualizado_em">;
export type ArquivoResumo = Pick<ArquivoRow, "id" | "nome_original" | "mime" | "tamanho" | "status_seguranca" | "criado_em">;
export type Escopo = "ambos" | "contrato" | "global";
export const SITUACOES_FONTE = ["rascunho", "ativa", "inativa", "revogada"] as const;

export type TipoErroBn = "negado" | "erro" | "conflito" | "validacao" | "obsoleto" | "resumivel";
export class ErroBn extends Error {
  constructor(public tipo: TipoErroBn) {
    super(tipo);
  }
}

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
function negado(r: Resp) {
  const code = (r.error as { code?: string } | null)?.code;
  return code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403;
}
async function executar(q: PromiseLike<Resp>, signal?: AbortSignal): Promise<Resp> {
  let r: Resp;
  try {
    r = await q;
  } catch {
    if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
    throw new ErroBn("erro");
  }
  if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
  if (r.error) throw new ErroBn(negado(r) ? "negado" : "erro");
  return r;
}
const faixa = (p: number) => [p * PAGINA_BN, p * PAGINA_BN + PAGINA_BN - 1] as const;

export type Pagina<X> = { itens: X[]; total: number };

export async function listarFontes(a: { org: string; contrato: string; escopo: Escopo; situacao: string; pagina: number }, signal?: AbortSignal): Promise<Pagina<Fonte>> {
  let q = supabase.from("fontes_normativas").select(COLUNAS_FONTE, { count: "exact" }).eq("id_organizacao", a.org);
  if (a.escopo === "contrato") q = q.eq("id_contrato", a.contrato);
  else if (a.escopo === "global") q = q.is("id_contrato", null);
  else q = q.or(`id_contrato.eq.${a.contrato},id_contrato.is.null`);
  if (a.situacao) q = q.eq("situacao", a.situacao);
  const [de, ate] = faixa(a.pagina);
  let f = q.order("titulo", { ascending: true }).order("id", { ascending: true }).range(de, ate);
  if (signal) f = f.abortSignal(signal);
  const r = await executar(f, signal);
  return { itens: (r.data as Fonte[] | null) ?? [], total: r.count ?? 0 };
}

export async function listarVersoes(idFonte: string, pagina: number, signal?: AbortSignal): Promise<Pagina<Versao>> {
  const [de, ate] = faixa(pagina);
  let q = supabase.from("versoes_fontes_normativas").select(COLUNAS_VERSAO, { count: "exact" }).eq("id_fonte", idFonte)
    .order("versao", { ascending: false }).order("id", { ascending: true }).range(de, ate);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return { itens: (r.data as Versao[] | null) ?? [], total: r.count ?? 0 };
}

/** Uma consulta por página de versões (sem N+1). */
export async function listarAplicabilidades(contrato: string, idsVersoes: string[], signal?: AbortSignal): Promise<Aplicabilidade[]> {
  if (idsVersoes.length === 0) return [];
  let q = supabase.from("aplicabilidades_fonte").select(COLUNAS_APLICABILIDADE).eq("id_contrato", contrato).in("id_fonte_versao", idsVersoes);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  return (r.data as Aplicabilidade[] | null) ?? [];
}

export type TextoVersao = { texto: string | null; truncado: boolean; metadados: string | null };
export async function obterTextoVersao(idVersao: string, signal?: AbortSignal): Promise<TextoVersao> {
  let q = supabase.from("versoes_fontes_normativas").select("conteudo_texto,metadados").eq("id", idVersao);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q.maybeSingle(), signal);
  const d = r.data as { conteudo_texto: string | null; metadados: unknown } | null;
  const t = d?.conteudo_texto ?? null;
  const meta = d?.metadados && typeof d.metadados === "object" && Object.keys(d.metadados).length > 0 ? JSON.stringify(d.metadados, null, 2).slice(0, LIMITE_TEXTO) : null;
  return { texto: t ? t.slice(0, LIMITE_TEXTO) : null, truncado: !!t && t.length > LIMITE_TEXTO, metadados: meta };
}

export async function listarArquivos(org: string, contrato: string | null, pagina: number, signal?: AbortSignal): Promise<Pagina<ArquivoResumo>> {
  const [de, ate] = faixa(pagina);
  let q = supabase.from("arquivos").select(COLUNAS_ARQUIVO, { count: "exact" }).eq("id_organizacao", org);
  q = contrato ? q.eq("id_contrato", contrato) : q.is("id_contrato", null);
  let f = q.order("criado_em", { ascending: false }).order("id", { ascending: true }).range(de, ate);
  if (signal) f = f.abortSignal(signal);
  const r = await executar(f, signal);
  return { itens: (r.data as ArquivoResumo[] | null) ?? [], total: r.count ?? 0 };
}

export function rotuloAplicabilidade(a: Pick<Aplicabilidade, "aplicavel" | "aprovado_em"> | undefined, fonteGlobal: boolean): string {
  if (!a) return fonteGlobal ? "Sem aplicabilidade aprovada para este contrato" : "Sem registro de aplicabilidade";
  if (!a.aprovado_em) return "Aplicabilidade sem aprovação registrada";
  return a.aplicavel ? "Aplicável" : "Não aplicável";
}

// ---------- RPCs V107 ----------
// LACUNA DE TIPOS: os 4 RPCs V107 ainda não constam em types.ts (arquivo gerado, não editável).
// Fronteira única e estritamente tipada (assinaturas lidas do HML), no padrão ADM01.
type ArgsV107 = {
  salvar_fonte_normativa_v107: { p_id_organizacao: string; p_id_contrato: string | null; p_id_fonte: string | null; p_tipo: string; p_titulo: string; p_referencia: string | null; p_descricao: string | null; p_situacao: string; p_versao_esperada: number | null; p_chave_idempotencia: string };
  registrar_versao_fonte_v107: { p_id_organizacao: string; p_id_fonte: string; p_inicio_vigencia: string; p_fim_vigencia: string | null; p_id_arquivo: string | null; p_conteudo_texto: string | null; p_metadados: Record<string, never>; p_chave_idempotencia: string };
  aprovar_versao_fonte_v107: { p_id_organizacao: string; p_id_versao: string; p_hash_esperado: string; p_fundamento: string; p_chave_idempotencia: string };
  // types.ts declara p_id_contrato como string; o HML aceita null (fonte global).
  confirmar_upload_arquivo: { p_id_organizacao: string; p_id_contrato: string | null; p_path: string; p_nome_original: string; p_mime: string; p_tamanho: number; p_sha256: string; p_origem: "upload_usuario" };
  definir_aplicabilidade_fonte_v107: { p_id_organizacao: string; p_id_contrato: string; p_id_versao: string; p_aplicavel: boolean; p_fundamento: string; p_atualizado_em_esperado: string | null; p_chave_idempotencia: string };
};
export type NomeV107 = keyof ArgsV107;
type RpcV107 = <N extends NomeV107>(nome: N, args: ArgsV107[N]) => PromiseLike<{ data: unknown; error: unknown }>;
const rpcV107 = supabase.rpc.bind(supabase) as unknown as RpcV107;

export function classificarErroRpc(error: unknown): TipoErroBn {
  const code = (error as { code?: string } | null)?.code;
  if (code === "PT409") return "conflito";
  if (code === "PT400") return "validacao";
  if (code === "PT404") return "obsoleto";
  if (code === "42501" || code === "PGRST301") return "negado";
  return "erro";
}

// ---------- Arquivos (Edges existentes storage-sign-upload / storage-sign-download) ----------
function statusEdge(error: unknown): number | undefined {
  const c = (error as { context?: { status?: unknown } } | null)?.context;
  return typeof c?.status === "number" ? c.status : undefined;
}
async function invocar(nome: "storage-sign-upload" | "storage-sign-download", body: Record<string, unknown>): Promise<Record<string, unknown>> {
  let r: { data: unknown; error: unknown };
  try {
    r = await supabase.functions.invoke(nome, { body });
  } catch {
    throw new ErroBn("erro");
  }
  if (r.error) {
    const st = statusEdge(r.error);
    throw new ErroBn(st === 401 || st === 403 ? "negado" : "erro");
  }
  const d = r.data as Record<string, unknown> | null;
  if (!d || d["ok"] !== true) throw new ErroBn("erro");
  return d;
}
async function sha256Hex(arquivo: File): Promise<string> {
  const bytes = typeof arquivo.arrayBuffer === "function"
    ? await arquivo.arrayBuffer()
    : await new Promise<ArrayBuffer>((ok, falha) => {
        const leitor = new FileReader();
        leitor.onload = () => ok(leitor.result as ArrayBuffer);
        leitor.onerror = () => falha(leitor.error);
        leitor.readAsArrayBuffer(arquivo);
      });
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(h, (b) => b.toString(16).padStart(2, "0")).join("");
}
/** Upload simples: retorna o id do arquivo (status inicial pendente). Nunca expõe path/token. */
export async function enviarArquivo(org: string, contrato: string | null, arquivo: File): Promise<string> {
  const mime = arquivo.type.toLowerCase();
  const d = await invocar("storage-sign-upload", { id_organizacao: org, id_contrato: contrato, nome_arquivo: arquivo.name, mime, tamanho: arquivo.size });
  if (d["usar_upload_resumivel"] === true) throw new ErroBn("resumivel");
  const { bucket, path, token } = d;
  if (typeof bucket !== "string" || typeof path !== "string" || typeof token !== "string") throw new ErroBn("erro");
  let up: { error: unknown };
  try {
    up = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, arquivo);
  } catch {
    throw new ErroBn("erro");
  }
  if (up.error) throw new ErroBn("erro");
  let sha: string;
  try {
    sha = await sha256Hex(arquivo);
  } catch {
    throw new ErroBn("erro");
  }
  let r: { data: unknown; error: unknown };
  try {
    r = await rpcV107("confirmar_upload_arquivo", { p_id_organizacao: org, p_id_contrato: contrato, p_path: path, p_nome_original: arquivo.name, p_mime: mime, p_tamanho: arquivo.size, p_sha256: sha, p_origem: "upload_usuario" });
  } catch {
    throw new ErroBn("erro");
  }
  if (r.error) throw new ErroBn(classificarErroRpc(r.error));
  if (typeof r.data !== "string") throw new ErroBn("erro");
  return r.data;
}
/** Download somente por ação explícita; abre apenas a signed_url https retornada. */
export async function baixarArquivo(idArquivo: string): Promise<void> {
  const d = await invocar("storage-sign-download", { id_arquivo: idArquivo });
  const u = d["signed_url"];
  let ok = false;
  try { ok = typeof u === "string" && new URL(u).protocol === "https:"; } catch { ok = false; }
  if (!ok) throw new ErroBn("erro");
  window.open(u as string, "_blank", "noopener,noreferrer");
}

export async function chamarV107<N extends Exclude<NomeV107, "confirmar_upload_arquivo">>(nome: N, args: ArgsV107[N]): Promise<{ correlationId: string | null }> {
  let r: { data: unknown; error: unknown };
  try {
    r = await rpcV107(nome, args);
  } catch {
    throw new ErroBn("erro");
  }
  if (r.error) throw new ErroBn(classificarErroRpc(r.error));
  const c = (r.data as { correlation_id?: unknown } | null)?.correlation_id;
  return { correlationId: typeof c === "string" ? c : null };
}

const dataHora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export function formatarDataHoraBr(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : dataHora.format(d).replace(",", "");
}

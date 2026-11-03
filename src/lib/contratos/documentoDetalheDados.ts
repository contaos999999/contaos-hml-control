/**
 * V1-11 — Detalhe e versões de documento do contrato.
 * Leituras sob RLS, paginadas no servidor e com colunas explícitas (nunca `embedding`, bucket ou path).
 * Mutações somente pelas RPCs oficiais `definir_vigencia_sugestao_extracao` e
 * `revisar_sugestao_extracao`; o backend decide permissão, lock e efeito.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Pagina } from "@/lib/contratos/baseNormativaDados";
import {
  COLUNAS_DOCUMENTO,
  COLUNAS_REQUISITO,
  ErroDoc,
  TIPOS_SUGESTAO_REGRA,
  classificarErroDoc,
  type Documento,
  type Requisito,
} from "@/lib/contratos/documentosDados";

export const PAGINA_VERSOES = 20;
export const PAGINA_PROCESSAMENTOS = 10;
export const PAGINA_PAGINAS = 10;
export const PAGINA_FRAGMENTOS = 20;
export const PAGINA_SUGESTOES = 20;

export const COLUNAS_VERSAO_DETALHE =
  "id,id_documento_contrato,numero_versao,id_arquivo,hash,motivo_substituicao,metadados_extraidos,enviado_por,criado_em";
export const COLUNAS_ARQUIVO_DETALHE =
  "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_por,criado_em";
export const COLUNAS_PROCESSAMENTO_DETALHE =
  "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em,atualizado_em";
export const COLUNAS_PAGINA =
  "id,id_versao_documento,numero_pagina,texto_extraido,hash_texto,criado_em";
export const COLUNAS_FRAGMENTO =
  "id,id_versao_documento,pagina_inicio,pagina_fim,indice_fragmento,texto,criado_em";
export const COLUNAS_SUGESTAO_DETALHE =
  "id,id_versao_documento,tipo,categoria_sugerida,id_requisito_sugerido,conteudo,pagina,trecho_fonte,confianca,status,revisado_por,revisado_em,metadados,criado_em,vigencia_inicio,vigencia_fim";

export type VersaoDetalhe = {
  id: string;
  id_documento_contrato: string;
  numero_versao: number;
  id_arquivo: string;
  hash: string | null;
  motivo_substituicao: string | null;
  metadados_extraidos: unknown;
  enviado_por: string | null;
  criado_em: string;
};
export type ArquivoDetalhe = {
  id: string;
  nome_original: string;
  mime: string;
  tamanho: number;
  sha256: string | null;
  status_seguranca: string;
  origem: string | null;
  criado_por: string | null;
  criado_em: string;
};
export type ProcessamentoDetalhe = {
  id: string;
  id_versao_documento: string;
  etapa: string;
  status: string;
  tentativas: number;
  erro_codigo: string | null;
  iniciado_em: string | null;
  concluido_em: string | null;
  criado_em: string;
  atualizado_em: string | null;
};
export type PaginaDocumento = {
  id: string;
  id_versao_documento: string;
  numero_pagina: number;
  texto_extraido: string | null;
  hash_texto: string | null;
  criado_em: string;
};
export type Fragmento = {
  id: string;
  id_versao_documento: string;
  pagina_inicio: number | null;
  pagina_fim: number | null;
  indice_fragmento: number;
  texto: string;
  criado_em: string;
};
export type Sugestao = {
  id: string;
  id_versao_documento: string;
  tipo: string;
  categoria_sugerida: string | null;
  id_requisito_sugerido: string | null;
  conteudo: string | null;
  pagina: number | null;
  trecho_fonte: string | null;
  confianca: number | null;
  status: string;
  revisado_por: string | null;
  revisado_em: string | null;
  metadados: unknown;
  criado_em: string;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
};
export type PaginaVersoes = Pagina<VersaoDetalhe> & { arquivos: Record<string, ArquivoDetalhe> };
export type PaginaSugestoes = Pagina<Sugestao> & { requisitos: Record<string, Requisito> };
export type FiltrosSugestao = { status: string; tipo: string };

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
async function executar(q: PromiseLike<Resp>, signal?: AbortSignal): Promise<Resp> {
  let r: Resp;
  try {
    r = await q;
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ErroDoc("erro");
  }
  if (r.error) {
    const code = (r.error as { code?: string }).code;
    throw new ErroDoc(
      code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403
        ? "negado"
        : "erro",
    );
  }
  return r;
}
const faixa = (pagina: number, tam: number): [number, number] => [
  pagina * tam,
  pagina * tam + tam - 1,
];

/** Gate do documento: precisa pertencer ao contrato do gate (inexistente ≡ outro tenant). */
export async function obterDocumento(
  contrato: string,
  idDocumento: string,
  signal?: AbortSignal,
): Promise<Documento> {
  let q = supabase
    .from("documentos_contrato")
    .select(COLUNAS_DOCUMENTO)
    .eq("id", idDocumento)
    .eq("id_contrato", contrato);
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q.maybeSingle(), signal);
  const d = r.data as Documento | null;
  if (!d || d.id.toLowerCase() !== idDocumento || d.id_contrato.toLowerCase() !== contrato)
    throw new ErroDoc("nao_encontrado");
  return d;
}

export async function listarVersoes(
  idDocumento: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<PaginaVersoes> {
  let q = supabase
    .from("versoes_documento")
    .select(COLUNAS_VERSAO_DETALHE, { count: "exact" })
    .eq("id_documento_contrato", idDocumento)
    .order("numero_versao", { ascending: false })
    .order("id", { ascending: false })
    .range(...faixa(pagina, PAGINA_VERSOES));
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  const itens = (r.data as VersaoDetalhe[] | null) ?? [];
  const ids = [...new Set(itens.map((v) => v.id_arquivo))].sort();
  let arquivos: Record<string, ArquivoDetalhe> = {};
  if (ids.length) {
    let qa = supabase.from("arquivos").select(COLUNAS_ARQUIVO_DETALHE).in("id", ids);
    if (signal) qa = qa.abortSignal(signal);
    const ra = await executar(qa, signal);
    arquivos = Object.fromEntries(
      ((ra.data as ArquivoDetalhe[] | null) ?? []).map((a) => [a.id, a]),
    );
  }
  return { itens, total: r.count ?? itens.length, arquivos };
}

export async function listarProcessamentos(
  idVersao: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<ProcessamentoDetalhe>> {
  let q = supabase
    .from("processamentos_documento")
    .select(COLUNAS_PROCESSAMENTO_DETALHE, { count: "exact" })
    .eq("id_versao_documento", idVersao)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(...faixa(pagina, PAGINA_PROCESSAMENTOS));
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  const itens = (r.data as ProcessamentoDetalhe[] | null) ?? [];
  return { itens, total: r.count ?? itens.length };
}

export async function listarPaginas(
  idVersao: string,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<PaginaDocumento>> {
  let q = supabase
    .from("paginas_documento")
    .select(COLUNAS_PAGINA, { count: "exact" })
    .eq("id_versao_documento", idVersao)
    .order("numero_pagina", { ascending: true })
    .range(...faixa(pagina, PAGINA_PAGINAS));
  if (signal) q = q.abortSignal(signal);
  const r = await executar(q, signal);
  const itens = (r.data as PaginaDocumento[] | null) ?? [];
  return { itens, total: r.count ?? itens.length };
}

export async function listarFragmentos(
  idVersao: string,
  pagina: number,
  paginaDoc: number | null,
  signal?: AbortSignal,
): Promise<Pagina<Fragmento>> {
  let q = supabase
    .from("fragmentos_documento")
    .select(COLUNAS_FRAGMENTO, { count: "exact" })
    .eq("id_versao_documento", idVersao);
  if (paginaDoc !== null) q = q.lte("pagina_inicio", paginaDoc).gte("pagina_fim", paginaDoc);
  let qo = q
    .order("indice_fragmento", { ascending: true })
    .order("id", { ascending: true })
    .range(...faixa(pagina, PAGINA_FRAGMENTOS));
  if (signal) qo = qo.abortSignal(signal);
  const r = await executar(qo, signal);
  const itens = (r.data as Fragmento[] | null) ?? [];
  return { itens, total: r.count ?? itens.length };
}

export async function listarSugestoes(
  idVersao: string,
  f: FiltrosSugestao,
  pagina: number,
  signal?: AbortSignal,
): Promise<PaginaSugestoes> {
  let q = supabase
    .from("sugestoes_extracao_documento")
    .select(COLUNAS_SUGESTAO_DETALHE, { count: "exact" })
    .eq("id_versao_documento", idVersao);
  if (f.status) q = q.eq("status", f.status);
  if (f.tipo) q = q.eq("tipo", f.tipo);
  let qo = q
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(...faixa(pagina, PAGINA_SUGESTOES));
  if (signal) qo = qo.abortSignal(signal);
  const r = await executar(qo, signal);
  const itens = (r.data as Sugestao[] | null) ?? [];
  const rids = [
    ...new Set(itens.map((s) => s.id_requisito_sugerido).filter((x): x is string => !!x)),
  ].sort();
  let requisitos: Record<string, Requisito> = {};
  if (rids.length) {
    let qr = supabase.from("requisitos_competencia").select(COLUNAS_REQUISITO).in("id", rids);
    if (signal) qr = qr.abortSignal(signal);
    const rr = await executar(qr, signal);
    requisitos = Object.fromEntries(((rr.data as Requisito[] | null) ?? []).map((x) => [x.id, x]));
  }
  return { itens, total: r.count ?? itens.length, requisitos };
}

// ---------- Regras de UX (o backend é a autoridade) ----------
const MATERIAIS = new Set<string>(TIPOS_SUGESTAO_REGRA);
export const ehMaterial = (tipo: string) => MATERIAIS.has(tipo);
export function bloqueioAprovacao(
  s: Pick<Sugestao, "tipo" | "pagina" | "trecho_fonte" | "vigencia_inicio">,
): "sem_fonte" | "sem_vigencia" | null {
  if (!ehMaterial(s.tipo)) return null;
  if (s.pagina === null || s.pagina === undefined || !s.trecho_fonte?.trim()) return "sem_fonte";
  if (!s.vigencia_inicio) return "sem_vigencia";
  return null;
}
export const hashDiverge = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() !== b.trim().toLowerCase();
export const rotuloUsuario = (id: string | null | undefined, atual: string) =>
  !id ? "—" : id === atual ? "Você" : `${id.slice(0, 8)}…`;
export const emProcessamento = (s: string | undefined) => s === "pendente" || s === "processando";

// ---------- RPCs oficiais V1-11 (tipos locais; types.ts intocado) ----------
type ArgsV111 = {
  definir_vigencia_sugestao_extracao: {
    p_id_sugestao: string;
    p_vigencia_inicio: string;
    p_vigencia_fim: string | null;
  };
  revisar_sugestao_extracao: {
    p_id_sugestao: string;
    p_aprovar: boolean;
    p_conteudo_revisado: string | null;
    p_categoria_revisada: string | null;
    p_id_requisito_revisado: string | null;
  };
};
type RpcV111 = <N extends keyof ArgsV111>(
  nome: N,
  args: ArgsV111[N],
) => PromiseLike<{ data: unknown; error: unknown }>;
// Fronteira única: as RPCs V111 não constam no types.ts certificado (proibido regenerar).
const rpcV111 = supabase.rpc.bind(supabase) as unknown as RpcV111;

/** Frases conhecidas de `privado.revisar_sugestao_extracao` (exceções sem SQLSTATE próprio). */
const FRASES_REVISAO: Array<[string, TipoErroRevisao]> = [
  ["Não encontramos a sugestão informada.", "nao_encontrado"],
  ["Você não possui acesso ao contrato desta sugestão.", "negado"],
  ["Seu perfil atual não permite revisar esta sugestão.", "negado"],
  ["Esta sugestão já foi revisada anteriormente.", "conflito"],
];
export type TipoErroRevisao = "negado" | "nao_encontrado" | "conflito" | "validacao" | "erro";
export class ErroRevisao extends Error {
  constructor(public tipo: TipoErroRevisao) {
    super(tipo);
  }
}
export function classificarErroRevisao(error: unknown): TipoErroRevisao {
  const e = error as { code?: string; message?: string } | null;
  const frase = FRASES_REVISAO.find(([f]) => e?.message?.trim() === f);
  if (frase) return frase[1];
  const t = classificarErroDoc(error);
  if (t === "negado" || t === "nao_encontrado" || t === "conflito") return t;
  if (e?.code === "PT400") return "validacao";
  return "erro";
}
async function chamar<N extends keyof ArgsV111>(nome: N, args: ArgsV111[N]): Promise<unknown> {
  let r: { data: unknown; error: unknown };
  try {
    r = await rpcV111(nome, args);
  } catch {
    throw new ErroRevisao("erro");
  }
  if (r.error) throw new ErroRevisao(classificarErroRevisao(r.error));
  return r.data;
}

export async function definirVigenciaSugestao(
  id: string,
  inicio: string,
  fim: string | null,
): Promise<"atualizada" | "sem_alteracao"> {
  const d = (await chamar("definir_vigencia_sugestao_extracao", {
    p_id_sugestao: id,
    p_vigencia_inicio: inicio,
    p_vigencia_fim: fim,
  })) as { status?: unknown } | null;
  if (d?.status === "atualizada" || d?.status === "sem_alteracao") return d.status;
  throw new ErroRevisao("erro");
}

export type ResultadoRevisao = "rejeitada" | "aprovada_rascunho" | "aprovada_aplicada";
export async function revisarSugestao(
  id: string,
  aprovar: boolean,
  conteudo: string,
  categoria: string,
): Promise<ResultadoRevisao> {
  const d = (await chamar("revisar_sugestao_extracao", {
    p_id_sugestao: id,
    p_aprovar: aprovar,
    p_conteudo_revisado: conteudo.trim() || null,
    p_categoria_revisada: categoria.trim() || null,
    p_id_requisito_revisado: null,
  })) as { status?: unknown; id_regra_rascunho?: unknown } | null;
  if (d?.status === "rejeitada") return "rejeitada";
  if (d?.status === "aprovada")
    return typeof d.id_regra_rascunho === "string" ? "aprovada_rascunho" : "aprovada_aplicada";
  throw new ErroRevisao("erro");
}

// ---------- Rótulos ----------
export const ROTULO_TIPO_SUGESTAO: Record<string, string> = {
  classificacao: "Classificação",
  metadado: "Metadado",
  clausula: "Cláusula",
  obrigacao: "Obrigação",
  prazo: "Prazo",
  documento_exigido: "Documento exigido",
  restricao: "Restrição",
  regra_candidata: "Regra candidata",
};
export const ROTULO_STATUS_SUGESTAO: Record<string, string> = {
  pendente: "Pendente de revisão",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  substituida: "Substituída",
};
export const ROTULO_ORIGEM: Record<string, string> = {
  upload_usuario: "Envio pelo usuário",
  integracao: "Integração",
  sistema: "Sistema",
};
const ROTULOS_METADADO: Record<string, string> = {
  cnpj: "CNPJ",
  cpf: "CPF",
  fornecedor: "Fornecedor",
  numero: "Número",
  numero_documento: "Número do documento",
  data: "Data",
  data_emissao: "Data de emissão",
  data_vencimento: "Data de vencimento",
  valor: "Valor",
  valor_total: "Valor total",
  competencia: "Competência",
  banco: "Banco",
  agencia: "Agência",
  conta: "Conta",
  resumo_revisado: "Resumo revisado",
  revisado_por: "Revisado por",
  revisado_em: "Revisado em",
};
export const rotuloMetadado = (k: string) =>
  ROTULOS_METADADO[k] ?? (k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) || k);

export const MENSAGENS_V111 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando documento…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado ou sem acesso.",
  docNaoEncontrado: "Documento não encontrado ou sem acesso.",
  erro: "Não foi possível carregar os dados agora. Tente novamente.",
  erroSessao: "Não foi possível verificar sua sessão. Tente novamente.",
  consistencia: "Os dados do contrato estão inconsistentes. Tente novamente.",
  semVersoes: "Este documento ainda não possui versões registradas.",
  semProcessamento: "Esta versão ainda não possui processamento registrado.",
  semMetadados: "Sem metadados extraídos para esta versão.",
  semPaginas: "Nenhuma página extraída para esta versão.",
  semFragmentos: "Nenhum fragmento encontrado.",
  semSugestoes: "Nenhuma sugestão de IA para esta versão.",
  hashDivergente:
    "Inconsistência entre o hash registrado na versão e o SHA-256 do arquivo. Verifique com a equipe responsável.",
  erroProcessamento: "O processamento não foi concluído. Use Atualizar ou aguarde nova tentativa.",
  bloqueadoSeguranca:
    "Download indisponível: o arquivo não foi aprovado na verificação de segurança. Os metadados continuam visíveis.",
  verificacaoPendente: "A verificação de segurança ainda está em andamento.",
  downloadNegado: "Você não tem permissão para baixar este arquivo.",
  downloadErro: "Não foi possível gerar o link de download agora. Tente novamente.",
  semFonte: "Aprovação indisponível: a sugestão não tem página e trecho da fonte.",
  semVigencia: "Aprovação indisponível: defina o início da vigência antes de aprovar.",
  inicioObrigatorio: "Informe o início da vigência.",
  fimAntes: "O fim da vigência não pode ser anterior ao início.",
  vigenciaInvalida: "A vigência informada foi recusada. Revise as datas.",
  vigenciaSalva: "Vigência definida com sucesso.",
  vigenciaSemAlteracao: "A vigência informada já estava registrada; nada foi alterado.",
  jaRevisada: "Esta sugestão já foi revisada. Os dados foram atualizados.",
  semPermissao: "Seu perfil não permite esta ação.",
  sugestaoNaoEncontrada: "Sugestão não encontrada. Os dados foram atualizados.",
  erroRevisao:
    "Não foi possível concluir a ação agora. Os dados foram atualizados; tente novamente.",
  aprovadaRascunho: "A sugestão foi aprovada e gerou uma regra em rascunho para revisão material.",
  aprovadaAplicada: "A sugestão foi aprovada e aplicada ao documento.",
  rejeitada: "A sugestão foi rejeitada e nenhuma regra ou metadado foi alterado.",
};
export function mensagemErroRevisao(t: TipoErroRevisao, vigencia = false): string {
  if (t === "conflito") return MENSAGENS_V111.jaRevisada;
  if (t === "negado") return MENSAGENS_V111.semPermissao;
  if (t === "nao_encontrado") return MENSAGENS_V111.sugestaoNaoEncontrada;
  if (t === "validacao" && vigencia) return MENSAGENS_V111.vigenciaInvalida;
  return MENSAGENS_V111.erroRevisao;
}

// ---------- Retorno à Central (busca/filtros/página preservados) ----------
export type BuscaCentral = {
  busca?: string;
  tipo?: string;
  categoria?: string;
  situacao?: string;
  pagina?: number;
};
const textoBusca = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined;
export function lerBuscaCentral(s: Record<string, unknown>): BuscaCentral {
  const r: BuscaCentral = {};
  for (const k of ["busca", "tipo", "categoria", "situacao"] as const) {
    const t = textoBusca(s[k]);
    if (t) r[k] = t;
  }
  const p = Number(s["pagina"]);
  if (Number.isInteger(p) && p > 0 && p < 100000) r.pagina = p;
  return r;
}

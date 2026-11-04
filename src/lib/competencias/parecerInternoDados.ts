/**
 * PROMPT 39 / V1-18 — Parecer interno.
 * Toda decisão de autorização, criação, aprovação e portão pertence ao Supabase HML.
 * Lista apenas por escopo RLS validado e competência; nunca faz update direto.
 */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export const PAGINA_PARECERES = 25;
export const COLUNAS_PARECERES =
  "id,id_competencia,id_contrato,id_organizacao,autor,texto,status,versao,hash,criado_em,aprovado_por,aprovado_em";

export type TipoErroParecer = "sem_permissao" | "nao_encontrado" | "conflito" | "invalido" | "erro";
export class ErroParecer extends Error {
  constructor(public tipo: TipoErroParecer) {
    super(tipo);
  }
}
type RespostaRpc = { data: unknown; error: unknown; status?: number };
const cliente = supabase as unknown as {
  rpc(
    name: "solicitar_parecer_interno",
    args: { p_id_competencia: string },
  ): PromiseLike<RespostaRpc>;
  rpc(
    name: "aprovar_parecer_interno",
    args: { p_id_parecer: string; p_aprovar: boolean; p_fundamento: string | undefined },
  ): PromiseLike<RespostaRpc>;
};

const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown): v is string => typeof v === "string";
const textoNulo = (v: unknown): v is string | null => v === null || texto(v);
const dataIso = (v: unknown) => texto(v) && !Number.isNaN(Date.parse(v));
const hashValido = (v: unknown) => texto(v) && /^[a-f0-9]{64}$/i.test(v);

export type ParecerInterno = {
  id: string;
  id_competencia: string;
  id_contrato: string;
  id_organizacao: string;
  autor: string | null;
  texto: string;
  status: string;
  versao: number;
  hash: string;
  criado_em: string;
  aprovado_por: string | null;
  aprovado_em: string | null;
};

export function parseParecerInterno(
  v: unknown,
  idCompetencia: string,
  idOrganizacao: string,
  idContrato: string,
): ParecerInterno | null {
  if (!obj(v) || !uuidValido(idCompetencia) || !uuidValido(idContrato)) return null;
  if (
    !texto(v.id) || !uuidValido(v.id) ||
    v.id_competencia !== idCompetencia ||
    v.id_organizacao !== idOrganizacao ||
    v.id_contrato !== idContrato ||
    !textoNulo(v.autor) ||
    !texto(v.texto) ||
    !texto(v.status) || !v.status.trim() ||
    !Number.isSafeInteger(v.versao) || (v.versao as number) < 1 ||
    !hashValido(v.hash) ||
    !dataIso(v.criado_em) ||
    !textoNulo(v.aprovado_por) ||
    !textoNulo(v.aprovado_em) ||
    (v.aprovado_em !== null && !dataIso(v.aprovado_em))
  ) return null;
  return v as ParecerInterno;
}

export function classificarErroParecer(error: unknown, status?: number): TipoErroParecer {
  const code = obj(error) && texto(error.code) ? error.code : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301")
    return "sem_permissao";
  if (code === "PT409" || status === 409) return "conflito";
  if (code === "PT404" || status === 404 || code === "P0001") return "nao_encontrado";
  if (code === "PT400") return "invalido";
  return "erro";
}

export const MENSAGENS_V118: Record<TipoErroParecer, string> & {
  carregando: string; vazio: string; sessao: string; indisponivel: string;
} = {
  carregando: "Carregando pareceres da competência…",
  vazio: "Nenhum parecer interno registrado nesta competência.",
  sessao: "Não foi possível verificar sua sessão agora. Tente novamente.",
  indisponivel: "A consulta de parecer não está disponível para esta competência.",
  sem_permissao: "Você não tem acesso a esta competência ou aos seus pareceres.",
  nao_encontrado: "Competência não encontrada ou indisponível.",
  conflito: "O parecer foi atualizado por outra operação. Recarregue e confira a versão.",
  invalido: "Os dados enviados não são válidos para esta operação.",
  erro: "Não foi possível consultar os pareceres agora. Tente novamente.",
};

export type PaginaPareceres = { itens: ParecerInterno[]; total: number; offset: number };
export async function listarPareceres(
  idCompetencia: string,
  idOrganizacao: string,
  idContrato: string,
  offset: number,
  signal: AbortSignal,
): Promise<PaginaPareceres> {
  if (!uuidValido(idCompetencia) || !uuidValido(idContrato) ||
      !idOrganizacao || !Number.isSafeInteger(offset) || offset < 0)
    throw new ErroParecer("invalido");
  const r = await supabase.from("pareceres_internos")
    .select(COLUNAS_PARECERES, { count: "exact" })
    .eq("id_competencia", idCompetencia)
    .eq("id_organizacao", idOrganizacao)
    .eq("id_contrato", idContrato)
    .order("versao", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGINA_PARECERES - 1)
    .abortSignal(signal);
  if (r.error) throw new ErroParecer(classificarErroParecer(r.error, r.status));
  if (
    !Array.isArray(r.data) ||
    !Number.isSafeInteger(r.count) ||
    (r.count as number) < 0 ||
    r.data.length > PAGINA_PARECERES
  ) throw new ErroParecer("erro");
  const itens = r.data.map((v) =>
    parseParecerInterno(v, idCompetencia, idOrganizacao, idContrato));
  if (itens.some((v) => v === null)) throw new ErroParecer("erro");
  return { itens: itens as ParecerInterno[], total: r.count as number, offset };
}

/** Uma única RPC, sem retry automático em resultado ambíguo. */
export async function solicitarParecer(idCompetencia: string): Promise<string> {
  if (!uuidValido(idCompetencia)) throw new ErroParecer("invalido");
  let r: RespostaRpc;
  try {
    r = await cliente.rpc("solicitar_parecer_interno", { p_id_competencia: uuidCanonico(idCompetencia) });
  } catch {
    throw new ErroParecer("erro");
  }
  if (r.error) throw new ErroParecer(classificarErroParecer(r.error, r.status));
  if (!texto(r.data) || !uuidValido(r.data)) throw new ErroParecer("erro");
  return r.data;
}

/** Backend efetua autorização e aprovação; o frontend nunca escreve status diretamente. */
export async function decidirParecer(
  idParecer: string, aprovar: boolean, fundamento: string,
): Promise<void> {
  if (!uuidValido(idParecer) || typeof aprovar !== "boolean" ||
      (!aprovar && !fundamento.trim()) || fundamento.length > 4000)
    throw new ErroParecer("invalido");
  let r: RespostaRpc;
  try {
    r = await cliente.rpc("aprovar_parecer_interno", {
      p_id_parecer: uuidCanonico(idParecer),
      p_aprovar: aprovar,
      p_fundamento: fundamento.trim() || undefined,
    });
  } catch {
    throw new ErroParecer("erro");
  }
  if (r.error) throw new ErroParecer(classificarErroParecer(r.error, r.status));
}

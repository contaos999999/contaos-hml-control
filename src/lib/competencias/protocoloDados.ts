/** PROMPT 41 / V1-20. Detalhe somente leitura do snapshot congelado no Supabase. */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export type TipoErroProtocolo = "sem_permissao" | "nao_encontrado" | "invalido" | "erro";
export class ErroProtocolo extends Error {
  constructor(public tipo: TipoErroProtocolo) {
    super(tipo);
    this.name = "ErroProtocolo";
  }
}
export const MENSAGENS_PROTOCOLO: Record<TipoErroProtocolo, string> = {
  sem_permissao: "Você não possui permissão para consultar esta apresentação.",
  nao_encontrado: "Apresentação não encontrada ou indisponível.",
  invalido: "O endereço informado não é válido.",
  erro: "Não foi possível consultar a apresentação. Atualize e tente novamente.",
};
export const PAGINA_ITENS_PROTOCOLO = 25;
const COL_AP = "id,id_competencia,id_contrato,id_organizacao,id_pacote,protocolo,forma_apresentacao,apresentado_em,tipo,numero_rodada";
const COL_PK = "id,id_competencia,id_contrato,id_organizacao,hash_pacote,numero,tipo,status,congelado_em";
const COL_ITENS = "id,id_pacote,id_competencia,id_contrato,id_organizacao,entidade_tipo,entidade_id,versao_id,hash,ordem";

type Objeto = Record<string, unknown>;
const obj = (v: unknown): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown): v is string => typeof v === "string";
const textoNulo = (v: unknown): v is string | null => v === null || texto(v);
const inteiro = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const hash = (v: unknown): v is string => texto(v) && /^[0-9a-f]{64}$/i.test(v);
const data = (v: unknown): v is string => texto(v) && Number.isFinite(Date.parse(v));
export function classificarErroProtocolo(error: unknown, status?: number): TipoErroProtocolo {
  const code = obj(error) && texto(error["code"]) ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301") return "sem_permissao";
  if (status === 404 || code === "PGRST116" || code === "P0001") return "nao_encontrado";
  return "erro";
}
export type ApresentacaoProtocolo = {
  id: string; id_competencia: string; id_contrato: string; id_organizacao: string; id_pacote: string;
  protocolo: string | null; forma_apresentacao: string | null; apresentado_em: string;
  tipo: string; numero_rodada: number;
};
export type PacoteProtocolo = {
  id: string; id_competencia: string; id_contrato: string; id_organizacao: string;
  hash_pacote: string; numero: number; tipo: string; status: string; congelado_em: string | null;
};
export type ItemProtocolo = {
  id: string; id_pacote: string; id_competencia: string; id_contrato: string;
  id_organizacao: string; entidade_tipo: string; entidade_id: string;
  versao_id: string | null; hash: string; ordem: number;
};
export type ConsultaProtocolo = {
  apresentacao: ApresentacaoProtocolo; pacote: PacoteProtocolo;
  itens: ItemProtocolo[]; total: number; offset: number;
};
function escopo(v: Objeto, c: string, o: string, contrato: string) {
  return v["id_competencia"] === c && v["id_organizacao"] === o && v["id_contrato"] === contrato;
}
function parseAp(v: unknown, c: string, ap: string, o: string, contrato: string): ApresentacaoProtocolo {
  if (!obj(v) || !escopo(v,c,o,contrato) || v["id"] !== ap || !uuidValido(v["id_pacote"] as string) ||
      !textoNulo(v["protocolo"]) || !textoNulo(v["forma_apresentacao"]) ||
      !data(v["apresentado_em"]) || !texto(v["tipo"]) || !v["tipo"].trim() ||
      !inteiro(v["numero_rodada"]) || v["numero_rodada"] < 1) throw new ErroProtocolo("erro");
  return v as ApresentacaoProtocolo;
}
function parsePk(v: unknown, c: string, pk: string, o: string, contrato: string): PacoteProtocolo {
  if (!obj(v) || !escopo(v,c,o,contrato) || v["id"] !== pk ||
      !hash(v["hash_pacote"]) || !inteiro(v["numero"]) || v["numero"] < 1 ||
      !texto(v["tipo"]) || !texto(v["status"]) || !v["status"].trim() ||
      !textoNulo(v["congelado_em"]) || (v["congelado_em"] !== null && !data(v["congelado_em"])))
    throw new ErroProtocolo("erro");
  return v as PacoteProtocolo;
}
function parseItem(v: unknown, c: string, pk: string, o: string, contrato: string): ItemProtocolo {
  if (!obj(v) || !escopo(v,c,o,contrato) || v["id_pacote"] !== pk ||
      !uuidValido(v["id"] as string) || !uuidValido(v["entidade_id"] as string) ||
      !texto(v["entidade_tipo"]) || !v["entidade_tipo"].trim() ||
      !(v["versao_id"] === null || (texto(v["versao_id"]) && uuidValido(v["versao_id"]))) ||
      !hash(v["hash"]) || !inteiro(v["ordem"]))
    throw new ErroProtocolo("erro");
  return v as ItemProtocolo;
}

/** Exibe somente os itens arquivados em um pacote existente, sem ler documentos correntes. */
export async function consultarProtocolo(
  competencia: string, apresentacao: string, organizacao: string, contrato: string,
  offset: number, signal: AbortSignal,
): Promise<ConsultaProtocolo | null> {
  if (!uuidValido(competencia) || !uuidValido(apresentacao) || !uuidValido(contrato) ||
      !organizacao || !inteiro(offset) || offset % PAGINA_ITENS_PROTOCOLO !== 0)
    throw new ErroProtocolo("invalido");
  const c = uuidCanonico(competencia), ap = uuidCanonico(apresentacao), co = uuidCanonico(contrato);
  try {
    const r1 = await supabase.from("apresentacoes_contratante").select(COL_AP)
      .eq("id", ap).eq("id_competencia", c).eq("id_organizacao", organizacao)
      .eq("id_contrato", co).abortSignal(signal).maybeSingle();
    if (r1.error) throw new ErroProtocolo(classificarErroProtocolo(r1.error, r1.status));
    if (r1.data === null) return null;
    const a = parseAp(r1.data, c, ap, organizacao, co);
    const pk = uuidCanonico(a.id_pacote);
    const r2 = await supabase.from("pacotes_competencia").select(COL_PK)
      .eq("id", pk).eq("id_competencia", c).eq("id_organizacao", organizacao)
      .eq("id_contrato", co).abortSignal(signal).maybeSingle();
    if (r2.error) throw new ErroProtocolo(classificarErroProtocolo(r2.error, r2.status));
    const pacote = parsePk(r2.data, c, pk, organizacao, co);
    const r3 = await supabase.from("itens_pacote_competencia")
      .select(COL_ITENS, { count: "exact" }).eq("id_pacote", pk)
      .eq("id_competencia", c).eq("id_organizacao", organizacao).eq("id_contrato", co)
      .order("ordem", { ascending: true }).order("id", { ascending: true })
      .range(offset, offset + PAGINA_ITENS_PROTOCOLO - 1).abortSignal(signal);
    if (r3.error) throw new ErroProtocolo(classificarErroProtocolo(r3.error, r3.status));
    if (!Array.isArray(r3.data) || !inteiro(r3.count) || r3.data.length > PAGINA_ITENS_PROTOCOLO)
      throw new ErroProtocolo("erro");
    const itens = r3.data.map(v => parseItem(v, c, pk, organizacao, co));
    return { apresentacao: a, pacote, itens, total: r3.count, offset };
  } catch (e) {
    if (e instanceof ErroProtocolo) throw e;
    if (obj(e) && e["name"] === "AbortError") throw e;
    throw new ErroProtocolo("erro");
  }
}

/**
 * PROMPT 40 / V1-19 — operações oficiais de aprovação e registro da apresentação.
 * A autoridade é o Supabase. Nenhum status ou portão é calculado neste adapter.
 */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export type TipoErroApresentacao =
  | "sem_permissao"
  | "nao_encontrado"
  | "conflito"
  | "invalido"
  | "erro";

export class ErroApresentacao extends Error {
  constructor(public tipo: TipoErroApresentacao) {
    super(tipo);
    this.name = "ErroApresentacao";
  }
}

export const MENSAGENS_APRESENTACAO: Record<TipoErroApresentacao, string> = {
  sem_permissao: "Você não tem permissão para realizar esta apresentação.",
  nao_encontrado: "Competência não encontrada ou indisponível.",
  conflito: "O registro mudou ou já existe. Atualize a competência e confira o estado antes de tentar novamente.",
  invalido: "Confira os dados informados e tente novamente.",
  erro: "Não foi possível concluir a operação. Atualize a situação antes de uma nova tentativa.",
};

const objeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function classificarErroApresentacao(
  error: unknown,
  status?: number,
): TipoErroApresentacao {
  const code = objeto(error) && typeof error["code"] === "string" ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301")
    return "sem_permissao";
  if (status === 409 || code === "23505" || code === "PT409") return "conflito";
  if (code === "P0001") return "nao_encontrado";
  return "erro";
}

/** Uma chave por intenção expressa; nunca usar Math.random ou timestamp. */
export function criarChaveIdempotencia(): string {
  const seguro = globalThis.crypto;
  if (!seguro || typeof seguro.getRandomValues !== "function") throw new ErroApresentacao("erro");
  const bytes = seguro.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16),
    hex.slice(16, 20), hex.slice(20)].join("-");
}

/** A aprovação humana e a passagem ao estado oficial são exclusivas da RPC. */
export async function aprovarApresentacao(
  competencia: string,
  fundamento: string,
): Promise<{ id_aprovacao: string }> {
  if (!uuidValido(competencia) || fundamento.length > 4000)
    throw new ErroApresentacao("invalido");
  let resposta;
  try {
    resposta = await supabase.rpc("aprovar_apresentacao", {
      p_id_competencia: uuidCanonico(competencia),
      p_fundamento: fundamento.trim() || undefined,
    });
  } catch {
    throw new ErroApresentacao("erro");
  }
  if (resposta.error)
    throw new ErroApresentacao(classificarErroApresentacao(resposta.error, resposta.status));
  const valor: unknown = resposta.data;
  if (!objeto(valor) || typeof valor["id_aprovacao"] !== "string" ||
      !uuidValido(valor["id_aprovacao"]) ||
      valor["situacao"] !== "pode_apresentar_contratante" ||
      valor["percentual_conformidade"] !== 100)
    throw new ErroApresentacao("erro");
  return { id_aprovacao: uuidCanonico(valor["id_aprovacao"]) };
}

/**
 * A mesma chave deve ser conservada por uma intenção até reconciliação explícita.
 * O snapshot do pacote só é criado pelo backend nesta operação, nunca no browser.
 */
export async function registrarApresentacao(
  competencia: string,
  chave: string,
  protocolo: string,
  forma: string,
): Promise<string> {
  if (!uuidValido(competencia) || !uuidValido(chave) ||
      protocolo.length > 120 || forma.length > 120)
    throw new ErroApresentacao("invalido");
  let resposta;
  try {
    resposta = await supabase.rpc("registrar_apresentacao", {
      p_id_competencia: uuidCanonico(competencia),
      p_idempotency_key: chave,
      p_protocolo: protocolo.trim() || undefined,
      p_forma_apresentacao: forma.trim() || undefined,
    });
  } catch {
    throw new ErroApresentacao("erro");
  }
  if (resposta.error)
    throw new ErroApresentacao(classificarErroApresentacao(resposta.error, resposta.status));
  const registro: unknown = resposta.data;
  if (typeof registro !== "string" || !uuidValido(registro))
    throw new ErroApresentacao("erro");
  return uuidCanonico(registro);
}

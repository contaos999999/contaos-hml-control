import { supabase } from "@/integrations/supabase/client";

export type AcaoCopiloto = "listar_sessoes" | "historico" | "encerrar_sessao";
export type SessaoCopiloto = {
  id: string;
  titulo: string | null;
  status: "ativa" | "encerrada";
  data_referencia: string | null;
};
export type MensagemHistorica = {
  id: string;
  papel: "usuario" | "assistente";
  conteudo: string | null;
  conteudo_disponivel: boolean;
  fontes?: Array<{ fonte_tipo?: string; pagina?: number | null; trecho?: string }>;
  incerteza?: boolean | null;
  conflito_historico?: boolean | null;
  baixa_confianca?: boolean | null;
};
export type PaginaSessoes = { sessoes: SessaoCopiloto[]; proximo_cursor: string | null };
export type PaginaHistorico = {
  sessao: { id: string; status: "ativa" | "encerrada" };
  mensagens: MensagemHistorica[];
  proximo_cursor: string | null;
};
const valido = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const cursorValido = (v: unknown): v is string | null =>
  v === null || (typeof v === "string" && v.length > 0);
const statusValido = (v: unknown): v is "ativa" | "encerrada" =>
  v === "ativa" || v === "encerrada";
const flagValida = (v: unknown) =>
  v === undefined || v === null || typeof v === "boolean";

export function validarPaginaSessoes(v: unknown): PaginaSessoes {
  if (!valido(v) || v["ok"] !== true || !Array.isArray(v["sessoes"]) ||
      !cursorValido(v["proximo_cursor"]) || !v["sessoes"].every((s: unknown) =>
        valido(s) && typeof s["id"] === "string" && s["id"].length > 0 &&
        (s["titulo"] === null || typeof s["titulo"] === "string") &&
        statusValido(s["status"]) &&
        (s["data_referencia"] === null || typeof s["data_referencia"] === "string")))
    throw new Error("Resposta de sessões inválida");
  return v as unknown as PaginaSessoes;
}
export function validarPaginaHistorico(v: unknown): PaginaHistorico {
  if (!valido(v) || v["ok"] !== true || !valido(v["sessao"]) ||
      typeof v["sessao"].id !== "string" || !statusValido(v["sessao"].status) ||
      !Array.isArray(v["mensagens"]) || !cursorValido(v["proximo_cursor"]) ||
      !v["mensagens"].every((m: unknown) =>
        valido(m) && typeof m["id"] === "string" &&
        (m["papel"] === "usuario" || m["papel"] === "assistente") &&
        (m["conteudo"] === null || typeof m["conteudo"] === "string") &&
        typeof m["conteudo_disponivel"] === "boolean" &&
        (m["fontes"] === undefined || Array.isArray(m["fontes"])) &&
        flagValida(m["incerteza"]) && flagValida(m["conflito_historico"]) &&
        flagValida(m["baixa_confianca"])))
    throw new Error("Histórico inválido");
  return v as unknown as PaginaHistorico;
}
export async function acaoCopiloto<T>(
  acao: AcaoCopiloto,
  contratoId: string,
  opcoes: { sessaoId?: string; referencia?: string | null; cursor?: string | null; signal?: AbortSignal } = {},
): Promise<T> {
  if (!contratoId) throw new Error("Contrato obrigatório");
  if (acao !== "listar_sessoes" && !opcoes.sessaoId) throw new Error("Sessão obrigatória");
  const { data, error } = await supabase.functions.invoke("copilot-query", {
    ...(opcoes.signal ? { signal: opcoes.signal } : {}),
    body: {
      action: acao,
      id_contrato: contratoId,
      ...(opcoes.sessaoId ? { id_sessao: opcoes.sessaoId } : {}),
      ...(opcoes.referencia ? { data_referencia: opcoes.referencia } : {}),
      ...(opcoes.cursor ? { cursor: opcoes.cursor } : {}),
      limite: 20,
    },
  });
  if (error || !valido(data) || data["ok"] !== true) throw new Error("Consulta indisponível ou acesso negado");
  if (acao === "listar_sessoes") return validarPaginaSessoes(data) as T;
  if (acao === "historico") return validarPaginaHistorico(data) as T;
  if (data["id_sessao"] !== opcoes.sessaoId || data["status"] !== "encerrada")
    throw new Error("Encerramento não confirmado");
  return data as T;
}

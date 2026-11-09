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
const statusValido = (v: unknown): v is "ativa" | "encerrada" => v === "ativa" || v === "encerrada";
const flagValida = (v: unknown) => v === undefined || v === null || typeof v === "boolean";

/** Somente valores renderizáveis do DTO canônico; nunca coagir objetos em texto. */
export function fontesValidas(v: unknown): v is NonNullable<MensagemHistorica["fontes"]> {
  return (
    Array.isArray(v) &&
    v.every(
      (f) =>
        valido(f) &&
        (f["fonte_tipo"] === undefined || typeof f["fonte_tipo"] === "string") &&
        (f["trecho"] === undefined || typeof f["trecho"] === "string") &&
        (f["pagina"] === undefined ||
          f["pagina"] === null ||
          (typeof f["pagina"] === "number" &&
            Number.isSafeInteger(f["pagina"]) &&
            f["pagina"] > 0)),
    )
  );
}

/** Prazo UI único: abortar não significa desfazer a operação no servidor. */
export async function invocarCopiloto<T>(body: Record<string, unknown>, signal?: AbortSignal) {
  const controller = new AbortController();
  const abortar = () => controller.abort();
  let cancelar: () => void = () => {};
  const cancelamento = new Promise<never>((_, reject) => {
    cancelar = () => reject(new Error("Consulta interrompida; resultado não confirmado"));
    controller.signal.addEventListener("abort", cancelar, { once: true });
  });
  signal?.addEventListener("abort", abortar, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = window.setTimeout(abortar, 50000);
  try {
    if (controller.signal.aborted) return await cancelamento;
    return await Promise.race([
      supabase.functions.invoke<T>("copilot-query", { body, signal: controller.signal }),
      cancelamento,
    ]);
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", abortar);
    controller.signal.removeEventListener("abort", cancelar);
  }
}

export function validarPaginaSessoes(v: unknown): PaginaSessoes {
  if (
    !valido(v) ||
    v["ok"] !== true ||
    !Array.isArray(v["sessoes"]) ||
    !cursorValido(v["proximo_cursor"]) ||
    !v["sessoes"].every(
      (s: unknown) =>
        valido(s) &&
        typeof s["id"] === "string" &&
        s["id"].length > 0 &&
        (s["titulo"] === null || typeof s["titulo"] === "string") &&
        statusValido(s["status"]) &&
        (s["data_referencia"] === null || typeof s["data_referencia"] === "string"),
    )
  )
    throw new Error("Resposta de sessões inválida");
  return v as unknown as PaginaSessoes;
}
export function validarPaginaHistorico(v: unknown): PaginaHistorico {
  if (
    !valido(v) ||
    v["ok"] !== true ||
    !valido(v["sessao"]) ||
    typeof v["sessao"]["id"] !== "string" ||
    !statusValido(v["sessao"]["status"]) ||
    !Array.isArray(v["mensagens"]) ||
    !cursorValido(v["proximo_cursor"]) ||
    !v["mensagens"].every(
      (m: unknown) =>
        valido(m) &&
        typeof m["id"] === "string" &&
        (m["papel"] === "usuario" || m["papel"] === "assistente") &&
        (m["conteudo"] === null || typeof m["conteudo"] === "string") &&
        typeof m["conteudo_disponivel"] === "boolean" &&
        (m["fontes"] === undefined || fontesValidas(m["fontes"])) &&
        flagValida(m["incerteza"]) &&
        flagValida(m["conflito_historico"]) &&
        flagValida(m["baixa_confianca"]),
    )
  )
    throw new Error("Histórico inválido");
  return v as unknown as PaginaHistorico;
}
export async function acaoCopiloto<T>(
  acao: AcaoCopiloto,
  contratoId: string,
  opcoes: {
    sessaoId?: string;
    referencia?: string | null;
    cursor?: string | null;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  if (!contratoId) throw new Error("Contrato obrigatório");
  if (acao !== "listar_sessoes" && !opcoes.sessaoId) throw new Error("Sessão obrigatória");
  const { data, error } = await invocarCopiloto<Record<string, unknown>>(
    {
      action: acao,
      id_contrato: contratoId,
      ...(opcoes.sessaoId ? { id_sessao: opcoes.sessaoId } : {}),
      ...(opcoes.referencia ? { data_referencia: opcoes.referencia } : {}),
      ...(opcoes.cursor ? { cursor: opcoes.cursor } : {}),
      limite: 20,
    },
    opcoes.signal,
  );
  if (error || !valido(data) || data["ok"] !== true)
    throw new Error("Consulta indisponível ou acesso negado");
  if (acao === "listar_sessoes") return validarPaginaSessoes(data) as T;
  if (acao === "historico") return validarPaginaHistorico(data) as T;
  if (data["id_sessao"] !== opcoes.sessaoId || data["status"] !== "encerrada")
    throw new Error("Encerramento não confirmado");
  return data as T;
}

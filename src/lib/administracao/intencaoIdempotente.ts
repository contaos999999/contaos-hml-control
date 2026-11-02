/**
 * ADM-01 / 092 — Chave de idempotência da intenção lógica CORRENTE.
 * Guarda no máximo `{ key, assinaturaPayload }`. Não é cache global de payload:
 * mesma intenção + mesmo payload reutiliza a chave; payload alterado substitui a intenção;
 * `encerrar()` (sucesso, cancelamento, fechamento, recarregar e revisar) descarta a chave.
 */
export type Intencao = { key: string; assinaturaPayload: string };

export function criarGerenciadorIntencao(gerar: () => string = () => globalThis.crypto.randomUUID()) {
  let atual: Intencao | null = null;
  return {
    chavePara(assinaturaPayload: string): string {
      if (atual && atual.assinaturaPayload === assinaturaPayload) return atual.key;
      atual = { key: gerar(), assinaturaPayload };
      return atual.key;
    },
    encerrar() {
      atual = null;
    },
    atual(): Intencao | null {
      return atual ? { ...atual } : null;
    },
  };
}

function normalizar(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(normalizar).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, normalizar((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

export function assinarPayload(p: unknown): string {
  return JSON.stringify(normalizar(p));
}

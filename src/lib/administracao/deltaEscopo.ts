/**
 * ADM-01 — Deltas de escopo contratual por intenção (ativar/revogar).
 * Baseline = `selecionado` explícito retornado pelo backend na primeira leitura de cada contrato.
 * `acesso_efetivo` nunca é baseline. Contrato não visitado nunca entra em delta.
 */
export type EstadoDelta = {
  baseline: ReadonlyMap<string, boolean>;
  ativar: ReadonlySet<string>;
  revogar: ReadonlySet<string>;
};

export function criarDelta(): EstadoDelta {
  return { baseline: new Map(), ativar: new Set(), revogar: new Set() };
}

export function registrarBaseline(e: EstadoDelta, itens: ReadonlyArray<{ id: string; selecionado: boolean }>): EstadoDelta {
  let mudou = false;
  const baseline = new Map(e.baseline);
  for (const i of itens) {
    if (!baseline.has(i.id)) {
      baseline.set(i.id, i.selecionado === true);
      mudou = true;
    }
  }
  return mudou ? { ...e, baseline } : e;
}

export function valorExibido(e: EstadoDelta, id: string): boolean {
  if (e.ativar.has(id)) return true;
  if (e.revogar.has(id)) return false;
  return e.baseline.get(id) ?? false;
}

export function alternar(e: EstadoDelta, id: string, novo: boolean): EstadoDelta {
  const ativar = new Set(e.ativar);
  const revogar = new Set(e.revogar);
  ativar.delete(id);
  revogar.delete(id);
  const base = e.baseline.get(id) ?? false;
  if (novo !== base) (novo ? ativar : revogar).add(id);
  return { ...e, ativar, revogar };
}

export const idsAtivar = (e: EstadoDelta) => [...e.ativar].sort();
export const idsRevogar = (e: EstadoDelta) => [...e.revogar].sort();

/** SYS-05 — Formatação de apresentação apenas. Não classifica nem calcula status. */

export function formatarDataBr(v: string | null | undefined): string {
  if (!v) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return "—";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function formatarDataHoraBr(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  const p = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("day")}/${g("month")}/${g("year")} ${g("hour")}:${g("minute")}`;
}

const ROTULOS_TIPO: Record<string, string> = {
  competencia: "Competência",
  tarefa_diligencia: "Tarefa de diligência",
  nao_conformidade: "Não conformidade",
  apontamento_interno: "Apontamento interno",
  apontamento_contratante: "Apontamento do contratante",
};

export function rotuloTipo(tipo: string | null | undefined): string {
  if (!tipo) return "—";
  return ROTULOS_TIPO[tipo] ?? tipo;
}

export function formatarNumero(n: unknown): string {
  return typeof n === "number" ? n.toLocaleString("pt-BR") : "—";
}

/**
 * V1-04 — Contratos (somente leitura).
 * Data API com RLS (`contratos_select` → privado.usuario_tem_acesso_contrato).
 * Q1 de contexto organizacional reutiliza o gate V1-01 (não autoritativo).
 * Q2 paginada no servidor (25), sem joins. Nenhuma escrita, RPC ou Edge.
 */
import { supabase } from "@/integrations/supabase/client";

export const TAMANHO_PAGINA = 25;
export const COLUNAS_CONTRATO = "id,id_organizacao,numero,objeto,situacao,criticidade,inicio,fim,valor_global";

export type Contrato = {
  id: string;
  id_organizacao: string;
  numero: string;
  objeto: string;
  situacao: string;
  criticidade: string;
  inicio: string | null;
  fim: string | null;
  valor_global: number | null;
};
export type PaginaContratos = { itens: Contrato[]; total: number; pagina: number; totalPaginas: number };

export class ErroContratos extends Error {
  constructor(public tipo: "negado" | "erro") {
    super(tipo);
  }
}

export function classificarErroContratos(error: unknown, status?: number): ErroContratos {
  const code = (error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PGRST301" || status === 401 || status === 403) return new ErroContratos("negado");
  return new ErroContratos("erro");
}

export async function listarContratos(p: { idOrganizacao: string; pagina: number }, signal?: AbortSignal): Promise<PaginaContratos> {
  const pagina = Math.max(1, Math.floor(p.pagina));
  const de = (pagina - 1) * TAMANHO_PAGINA;
  let q = supabase
    .from("contratos")
    .select(COLUNAS_CONTRATO, { count: "exact" })
    .eq("id_organizacao", p.idOrganizacao)
    .order("numero", { ascending: true })
    .order("id", { ascending: true })
    .range(de, de + TAMANHO_PAGINA - 1);
  if (signal) q = q.abortSignal(signal);
  let r: { data: unknown; error: unknown; status?: number; count?: number | null };
  try {
    r = await q;
  } catch {
    throw new ErroContratos("erro");
  }
  if (r.error) throw classificarErroContratos(r.error, r.status);
  const itens = (r.data as Contrato[] | null) ?? [];
  const total = r.count ?? itens.length;
  return { itens, total, pagina, totalPaginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA)) };
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarMoeda = (v: number | null) => (v === null || v === undefined ? "—" : moeda.format(v));

function data(d: string | null): string | null {
  const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}
export function formatarVigencia(inicio: string | null, fim: string | null): string {
  const i = data(inicio);
  const f = data(fim);
  if (!i && !f) return "—";
  return `${i ?? "—"} – ${f ?? "—"}`;
}

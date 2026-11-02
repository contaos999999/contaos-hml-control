import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import type { OrganizacaoDisponivel } from "@/lib/auth/resolverDestinoPosLogin";
import { montarPadraoBusca } from "@/lib/contratantes/contratantesDados";

/** V1-05 — Novo contrato. INSERT via Data API; RLS (contratos_insert) é a autoridade final. */

export const PERFIS_NOVO_CONTRATO = ["administrador", "gestor_contrato", "administrador_master"] as const;

/** Gate visual: usa a RPC certificada (reconhece Master global); não substitui RLS. */
export function organizacaoPermiteCadastro(orgs: OrganizacaoDisponivel[], idOrganizacao: string): boolean {
  const linha = orgs.find((o) => o.id === idOrganizacao);
  return !!linha && (PERFIS_NOVO_CONTRATO as readonly string[]).includes(linha.perfil);
}

export const TAMANHO_PAGINA_OPCOES = 20;
export type OpcaoContratante = { id: string; razao_social: string; nome_fantasia: string | null; documento: string | null; situacao: string };
export type PaginaOpcoes = { itens: OpcaoContratante[]; total: number; proximaPagina: number | null };

export class ErroV105 extends Error {
  constructor(public tipo: "negado" | "invalido" | "duplicado" | "erro") {
    super(tipo);
  }
}

type RespostaPg = { error: unknown; status?: number };

export function classificarErroV105(r: RespostaPg): ErroV105 {
  const code = (r.error as { code?: string } | null)?.code ?? "";
  const s = r.status ?? 0;
  if (s === 401 || s === 403 || code === "42501" || code === "PGRST301") return new ErroV105("negado");
  if (code === "23505") return new ErroV105("duplicado");
  if (s === 422 || code === "PT400" || code === "23502" || code === "23514" || code === "23503" || code.startsWith("22")) return new ErroV105("invalido");
  return new ErroV105("erro");
}

export async function buscarOpcoesContratantes(
  p: { idOrganizacao: string; busca: string; pagina: number },
  signal?: AbortSignal,
): Promise<PaginaOpcoes> {
  const from = (p.pagina - 1) * TAMANHO_PAGINA_OPCOES;
  const to = from + TAMANHO_PAGINA_OPCOES - 1;
  let q = supabase
    .from("contratantes")
    .select("id,razao_social,nome_fantasia,documento,situacao", { count: "exact" })
    .eq("id_organizacao", p.idOrganizacao);
  const padrao = montarPadraoBusca(p.busca);
  if (padrao) q = q.or(`razao_social.ilike.${padrao},nome_fantasia.ilike.${padrao},documento.ilike.${padrao}`);
  let q2 = q.order("razao_social", { ascending: true }).order("id", { ascending: true }).range(from, to);
  if (signal) q2 = q2.abortSignal(signal);
  let r: { data: unknown; error: unknown; status?: number; count?: number | null };
  try {
    r = await q2;
  } catch {
    throw new ErroV105("erro");
  }
  if (r.error) throw classificarErroV105(r);
  if (!Array.isArray(r.data) || typeof r.count !== "number") throw new ErroV105("erro");
  const total = r.count;
  return { itens: r.data as OpcaoContratante[], total, proximaPagina: to + 1 < total ? p.pagina + 1 : null };
}

export type FormularioContrato = {
  numero: string;
  objeto: string;
  idContratante: string;
  inicio: string;
  fim: string;
  valorGlobal: string;
  valorMensal: string;
  tipoContrato: string;
  unidadeVinculada: string;
  fonteRecurso: string;
};
export type CampoContrato = "numero" | "objeto" | "contratante" | "inicio" | "fim" | "valorGlobal" | "valorMensal";

/** "1.234,56" -> 1234.56; vazio -> null; inválido -> NaN. */
export function converterMoedaBR(texto: string): number | null {
  const t = texto.trim().replace(/^R\$\s*/, "");
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return Number.NaN;
  return Number(t.replace(/\./g, "").replace(",", "."));
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Validação apenas de UX (formato/coerência simples); regras jurídicas ficam no backend. */
export function validarFormularioContrato(f: FormularioContrato): CampoContrato[] {
  const inv: CampoContrato[] = [];
  if (!f.numero.trim()) inv.push("numero");
  if (!f.objeto.trim()) inv.push("objeto");
  if (!f.idContratante) inv.push("contratante");
  if (!DATA.test(f.inicio)) inv.push("inicio");
  if (f.fim && (!DATA.test(f.fim) || (DATA.test(f.inicio) && f.fim < f.inicio))) inv.push("fim");
  const vg = converterMoedaBR(f.valorGlobal);
  if (vg !== null && (Number.isNaN(vg) || vg < 0)) inv.push("valorGlobal");
  const vm = converterMoedaBR(f.valorMensal);
  if (vm !== null && (Number.isNaN(vm) || vm < 0)) inv.push("valorMensal");
  return inv;
}

export type PayloadContrato = Pick<TablesInsert<"contratos">, "id_organizacao" | "id_contratante" | "numero" | "objeto" | "inicio"> &
  Partial<Pick<TablesInsert<"contratos">, "fim" | "valor_global" | "valor_mensal_referencia" | "tipo_contrato" | "unidade_vinculada" | "fonte_recurso">>;

/** Somente campos escolhidos + organização ativa; defaults (situação, criticidade, versão) ficam no servidor. */
export function montarPayloadContrato(idOrganizacao: string, f: FormularioContrato): PayloadContrato {
  const p: PayloadContrato = {
    id_organizacao: idOrganizacao,
    id_contratante: f.idContratante,
    numero: f.numero.trim(),
    objeto: f.objeto.trim(),
    inicio: f.inicio,
  };
  if (f.fim) p.fim = f.fim;
  const vg = converterMoedaBR(f.valorGlobal);
  if (vg !== null) p.valor_global = vg;
  const vm = converterMoedaBR(f.valorMensal);
  if (vm !== null) p.valor_mensal_referencia = vm;
  if (f.tipoContrato.trim()) p.tipo_contrato = f.tipoContrato.trim();
  if (f.unidadeVinculada.trim()) p.unidade_vinculada = f.unidadeVinculada.trim();
  if (f.fonteRecurso.trim()) p.fonte_recurso = f.fonteRecurso.trim();
  return p;
}

/** INSERT exato, sem RETURNING: o backend atribui auditoria e escopo do criador. */
export async function inserirContrato(payload: PayloadContrato): Promise<void> {
  let r: RespostaPg;
  try {
    r = await supabase.from("contratos").insert(payload);
  } catch {
    throw new ErroV105("erro");
  }
  if (r.error) throw classificarErroV105(r);
}

/**
 * V1-13 — Nova competência.
 * Comando único: RPC `criar_competencia` (backend valida acesso/perfil e materializa o snapshot).
 * O frontend nunca monta requisitos/snapshot e nunca escreve direto em tabelas.
 */
import { supabase } from "@/integrations/supabase/client";
import { mesParaReferencia } from "@/lib/contratos/competenciasDados";

/** Somente UX: o backend é a autoridade final sobre quem pode criar. */
export const PERFIS_CRIAR_COMPETENCIA = [
  "administrador",
  "gestor_contrato",
  "prestacao_contas",
] as const;
export const perfilPodeCriar = (p: string | null) =>
  !!p && (PERFIS_CRIAR_COMPETENCIA as readonly string[]).includes(p);

export type TipoErroNovaCompetencia =
  "duplicada" | "sem_permissao" | "ambiguo" | "erro" | "validacao";
export class ErroNovaCompetencia extends Error {
  constructor(public tipo: TipoErroNovaCompetencia) {
    super(tipo);
  }
}

/** 23505 duplicada; 401/403/42501 sem permissão; P0001 e demais = erro genérico; sem código = ambíguo. */
export function classificarErroNovaCompetencia(
  error: unknown,
  status?: number,
): TipoErroNovaCompetencia {
  const code = (error as { code?: string } | null)?.code;
  if (code === "23505") return "duplicada";
  if (code === "42501" || status === 401 || status === 403) return "sem_permissao";
  if (!code && (!status || status >= 500)) return "ambiguo";
  return "erro";
}

export async function lerPerfilAtivo(
  idUsuario: string,
  idOrganizacao: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("vinculos_usuarios")
    .select("perfil")
    .eq("id_usuario", idUsuario)
    .eq("id_organizacao", idOrganizacao)
    .eq("ativo", true)
    .maybeSingle();
  if (error) throw new ErroNovaCompetencia("erro");
  const p = (data as { perfil?: unknown } | null)?.perfil;
  return typeof p === "string" ? p : null;
}

export async function criarCompetencia(idContrato: string, mes: string): Promise<string> {
  const ref = mesParaReferencia(mes);
  if (!ref) throw new ErroNovaCompetencia("validacao");
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase.rpc("criar_competencia", {
      p_id_contrato: idContrato,
      p_competencia_referencia: ref,
    });
  } catch {
    throw new ErroNovaCompetencia("ambiguo");
  }
  if (r.error) throw new ErroNovaCompetencia(classificarErroNovaCompetencia(r.error, r.status));
  if (typeof r.data !== "string") throw new ErroNovaCompetencia("ambiguo");
  return r.data;
}

/** Leitura exata (sem dataset) para reconciliar resultado ambíguo. */
export async function verificarCompetenciaExistente(
  idContrato: string,
  mes: string,
): Promise<string | null> {
  const ref = mesParaReferencia(mes);
  if (!ref) return null;
  const { data, error } = await supabase
    .from("competencias")
    .select("id")
    .eq("id_contrato", idContrato)
    .eq("competencia_referencia", ref)
    .maybeSingle();
  if (error) return null;
  const id = (data as { id?: unknown } | null)?.id;
  return typeof id === "string" ? id : null;
}

/**
 * SYS-01/SYS-04 — Organizações disponíveis ao usuário, exclusivamente via a RPC
 * certificada `listar_organizacoes_disponiveis()` (RLS é a autoridade; inclui
 * Administrador Master sem vínculo físico). Não decide autorização: apenas
 * conta quantas organizações o backend entregou.
 */
import { supabase } from "@/integrations/supabase/client";

export type OrganizacaoDisponivel = {
  id: string | null;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  situacao: string;
  perfil: string;
};

export type DestinoPosLogin =
  | { tipo: "rota"; rota: "/selecionar-organizacao" | "/" }
  | { tipo: "sem-acesso" };

export function resolverDestinoPosLogin(orgs: readonly OrganizacaoDisponivel[]): DestinoPosLogin {
  if (orgs.length === 0) return { tipo: "sem-acesso" };
  if (orgs.length === 1) return { tipo: "rota", rota: "/" };
  return { tipo: "rota", rota: "/selecionar-organizacao" };
}

const ROTULOS: Record<string, string> = { administrador_master: "Administrador Master" };
export function rotuloPerfil(perfil: string): string {
  return ROTULOS[perfil] ?? perfil;
}

export type TipoErroOrganizacoes = "negado" | "erro";
export class ErroOrganizacoes extends Error {
  constructor(public tipo: TipoErroOrganizacoes) {
    super(tipo);
  }
}

export function classificarErroOrganizacoes(
  error: { code?: string; status?: number } | null,
): TipoErroOrganizacoes {
  if (!error) return "erro";
  if (error.code === "42501" || error.code === "PGRST301" || error.status === 401 || error.status === 403)
    return "negado";
  return "erro";
}

// LACUNA DE TIPOS: a RPC certificada ainda não consta em types.ts (arquivo
// gerado). Cast restrito à assinatura desta RPC; remover após regeneração.
type RpcSemArgs = (
  fn: "listar_organizacoes_disponiveis",
) => PromiseLike<{ data: OrganizacaoDisponivel[] | null; error: { code?: string; status?: number } | null }>;

export async function listarOrganizacoesDisponiveis(): Promise<OrganizacaoDisponivel[]> {
  const rpc = (supabase.rpc as unknown as RpcSemArgs).bind(supabase);
  const { data, error } = await rpc("listar_organizacoes_disponiveis");
  if (error) throw new ErroOrganizacoes(classificarErroOrganizacoes(error));
  return data ?? [];
}

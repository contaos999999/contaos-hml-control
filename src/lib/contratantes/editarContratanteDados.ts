/**
 * V1-03 — Editar contratante.
 * Leitura: Data API + RLS (org + id). Escrita: SOMENTE RPC certificada `atualizar_contratante`
 * com concorrência otimista; a versão é incrementada no backend.
 */
import { supabase } from "@/integrations/supabase/client";
import { consultarPermissoesEfetivas, ErroRbac, temPermissao } from "@/lib/administracao/rbacRpc";
import type { FormularioContratante } from "@/lib/contratantes/novoContratanteDados";

export const COLUNAS_V103 =
  "id,id_organizacao,tipo_pessoa,documento,razao_social,nome_fantasia,contato,situacao,versao_registro,atualizado_em";

export type ContratanteEdicao = {
  id: string;
  id_organizacao: string;
  tipo_pessoa: string;
  documento: string | null;
  razao_social: string;
  nome_fantasia: string | null;
  contato: { email?: string; telefone?: string } | null;
  situacao: string;
  versao_registro: number;
  atualizado_em: string;
};

export type ArgsAtualizacao = {
  p_id_organizacao: string;
  p_id_contratante: string;
  p_versao_esperada: number;
  p_tipo_pessoa: string;
  p_documento: string;
  p_razao_social: string;
  p_nome_fantasia: string;
  p_contato: { email?: string; telefone?: string };
  p_situacao: string;
};

export type TipoErroV103 = "negado" | "nao_encontrado" | "conflito" | "duplicado" | "invalido" | "erro";

export class ErroV103 extends Error {
  constructor(public tipo: TipoErroV103) {
    super(tipo);
  }
}

/** Capacidade de UX retornada pelo backend; a RPC de escrita revalida a autorização. */
export async function consultarCapacidadeEdicaoContratante(idOrganizacao: string): Promise<boolean> {
  try {
    const resultado = await consultarPermissoesEfetivas(idOrganizacao, null);
    return temPermissao(resultado.permissoes, "contratantes", "editar");
  } catch (erro) {
    throw new ErroV103(erro instanceof ErroRbac && erro.tipo === "negado" ? "negado" : "erro");
  }
}

export function classificarErroV103(r: { error: unknown; status?: number }): ErroV103 {
  const code = (r.error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403) return new ErroV103("negado");
  if (code === "PT409") return new ErroV103("conflito");
  if (code === "PT404") return new ErroV103("nao_encontrado");
  if (code === "23505") return new ErroV103("duplicado");
  if (code === "PT422" || code === "23502" || code === "23514") return new ErroV103("invalido");
  return new ErroV103("erro");
}

export async function buscarContratante(idOrganizacao: string, id: string): Promise<ContratanteEdicao> {
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase.from("contratantes").select(COLUNAS_V103).eq("id_organizacao", idOrganizacao).eq("id", id).maybeSingle();
  } catch {
    throw new ErroV103("erro");
  }
  if (r.error) {
    const e = classificarErroV103(r);
    throw e.tipo === "negado" ? e : new ErroV103("erro");
  }
  if (!r.data) throw new ErroV103("nao_encontrado");
  return r.data as ContratanteEdicao;
}

export function formularioDe(c: ContratanteEdicao): FormularioContratante {
  return {
    razaoSocial: c.razao_social ?? "",
    tipoPessoa: c.tipo_pessoa ?? "",
    documento: c.documento ?? "",
    nomeFantasia: c.nome_fantasia ?? "",
    email: c.contato?.email ?? "",
    telefone: c.contato?.telefone ?? "",
    situacao: c.situacao ?? "ativo",
  };
}

export function montarArgsAtualizacao(idOrganizacao: string, id: string, versaoLida: number, f: FormularioContratante): ArgsAtualizacao {
  const contato: ArgsAtualizacao["p_contato"] = {};
  const email = f.email.trim();
  const telefone = f.telefone.trim();
  if (email) contato.email = email;
  if (telefone) contato.telefone = telefone;
  return {
    p_id_organizacao: idOrganizacao,
    p_id_contratante: id,
    p_versao_esperada: versaoLida,
    p_tipo_pessoa: f.tipoPessoa,
    p_documento: f.documento.trim(),
    p_razao_social: f.razaoSocial.trim(),
    p_nome_fantasia: f.nomeFantasia.trim(),
    p_contato: contato,
    p_situacao: f.situacao,
  };
}

export async function atualizarContratante(args: ArgsAtualizacao): Promise<ContratanteEdicao> {
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase.rpc("atualizar_contratante", args);
  } catch {
    throw new ErroV103("erro");
  }
  if (r.error) throw classificarErroV103(r);
  const d = r.data as { schema_versao?: string; contratante?: ContratanteEdicao } | null;
  if (!d || d.schema_versao !== "v103-v1" || !d.contratante || typeof d.contratante.versao_registro !== "number") {
    throw new ErroV103("erro");
  }
  return d.contratante;
}

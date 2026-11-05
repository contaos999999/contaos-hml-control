/**
 * V1-02 — Novo contratante. Data API + RLS.
 * O gate de vínculo é apenas UX; a autoridade é a RLS do INSERT em `contratantes`.
 */
import { supabase } from "@/integrations/supabase/client";
import { listarOrganizacoesDisponiveis, type OrganizacaoDisponivel } from "@/lib/auth/resolverDestinoPosLogin";

export const PERFIS_CADASTRO = ["administrador", "gestor_contrato"] as const;

export type VinculoProprio = { perfil: string; ativo: boolean; inicio_em: string; fim_em: string | null };

export type FormularioContratante = {
  razaoSocial: string;
  tipoPessoa: string;
  documento: string;
  nomeFantasia: string;
  email: string;
  telefone: string;
  situacao: string;
};

export type CampoFormulario = "razaoSocial" | "tipoPessoa" | "email";

export type PayloadContratante = {
  id_organizacao: string;
  tipo_pessoa: string;
  documento: string | null;
  razao_social: string;
  nome_fantasia: string | null;
  contato: { email?: string; telefone?: string };
  situacao: string;
};

export type ContratanteCriado = { id: string; razao_social: string; situacao: string };

export type TipoErroV102 = "negado" | "duplicado" | "invalido" | "erro";

export class ErroV102 extends Error {
  constructor(public tipo: TipoErroV102) {
    super(tipo);
  }
}

type RespostaPg = { error: unknown; status?: number };

export function classificarErro(r: RespostaPg): ErroV102 {
  const code = (r.error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403) return new ErroV102("negado");
  if (code === "23505") return new ErroV102("duplicado");
  if (code === "23502" || code === "23514") return new ErroV102("invalido");
  return new ErroV102("erro");
}

/** Gate UX: somente o próprio vínculo do usuário na organização preferida. */
export async function consultarVinculoProprio(idOrganizacao: string, idUsuario: string): Promise<VinculoProprio | null> {
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase
      .from("vinculos_usuarios")
      .select("perfil,ativo,inicio_em,fim_em")
      .eq("id_organizacao", idOrganizacao)
      .eq("id_usuario", idUsuario)
      .maybeSingle();
  } catch {
    throw new ErroV102("erro");
  }
  if (r.error) {
    const e = classificarErro(r);
    throw e.tipo === "negado" ? e : new ErroV102("erro");
  }
  return (r.data as VinculoProprio | null) ?? null;
}

export function vinculoPermiteCadastro(v: VinculoProprio | null, agora: Date = new Date()): boolean {
  if (!v || v.ativo !== true) return false;
  if (!(PERFIS_CADASTRO as readonly string[]).includes(v.perfil)) return false;
  const inicio = Date.parse(v.inicio_em);
  if (Number.isNaN(inicio) || inicio > agora.getTime()) return false;
  if (v.fim_em !== null) {
    const fim = Date.parse(v.fim_em);
    if (Number.isNaN(fim) || fim <= agora.getTime()) return false;
  }
  return true;
}

export type CapacidadeCadastro = OrganizacaoDisponivel;
/** Gate UX exclusivamente pela RPC autenticada; o INSERT continua sob RLS. */
export async function consultarCapacidadeCadastro(idOrganizacao: string, _idUsuario: string): Promise<CapacidadeCadastro | null> {
  try {
    const organizacoes = await listarOrganizacoesDisponiveis();
    if (!Array.isArray(organizacoes)) throw new ErroV102("erro");
    return organizacoes.find((o) => o.id === idOrganizacao) ?? null;
  } catch (erro) {
    if (erro instanceof ErroV102) throw erro;
    const e = erro as { tipo?: string };
    throw new ErroV102(e?.tipo === "negado" ? "negado" : "erro");
  }
}

export function capacidadePermiteCadastro(v: CapacidadeCadastro | null): boolean {
  return !!v && typeof v.id === "string" && (PERFIS_CADASTRO as readonly string[]).includes(v.perfil);
}


const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TIPOS_PESSOA = ["juridica", "fisica", "orgao_publico", "outro"] as const;

/** Validação local de UX; retorna campos inválidos na ordem visual. */
export function validarFormulario(f: FormularioContratante): CampoFormulario[] {
  const inval: CampoFormulario[] = [];
  if (!f.razaoSocial.trim()) inval.push("razaoSocial");
  if (!(TIPOS_PESSOA as readonly string[]).includes(f.tipoPessoa)) inval.push("tipoPessoa");
  const email = f.email.trim();
  if (email && !EMAIL.test(email)) inval.push("email");
  return inval;
}

const ouNulo = (s: string) => {
  const t = s.trim();
  return t ? t : null;
};

export function montarPayload(idOrganizacao: string, f: FormularioContratante): PayloadContratante {
  const contato: PayloadContratante["contato"] = {};
  const email = f.email.trim();
  const telefone = f.telefone.trim();
  if (email) contato.email = email;
  if (telefone) contato.telefone = telefone;
  return {
    id_organizacao: idOrganizacao,
    tipo_pessoa: f.tipoPessoa,
    documento: ouNulo(f.documento),
    razao_social: f.razaoSocial.trim(),
    nome_fantasia: ouNulo(f.nomeFantasia),
    contato,
    situacao: f.situacao,
  };
}

/** Único DML do domínio V1-02. */
export async function inserirContratante(payload: PayloadContratante): Promise<ContratanteCriado> {
  let r: { data: unknown; error: unknown; status?: number };
  try {
    r = await supabase.from("contratantes").insert(payload).select("id,razao_social,situacao").single();
  } catch {
    throw new ErroV102("erro");
  }
  if (r.error) throw classificarErro(r);
  if (!r.data) throw new ErroV102("erro");
  return r.data as ContratanteCriado;
}

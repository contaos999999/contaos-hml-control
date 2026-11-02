/**
 * ADM-01 — Acesso às 5 RPCs oficiais e à Edge `admin-invite-user` (backend HML certificado).
 * A autoridade é o backend/RLS; aqui só há transporte, validação de versão do contrato e
 * classificação contextual de erro para mensagens PT-BR seguras.
 */
import { supabase } from "@/integrations/supabase/client";

export const MENSAGENS_ADM01 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando usuários…",
  vazio: "Nenhum usuário vinculado encontrado para os filtros atuais.",
  negado: "Você não tem permissão para administrar usuários desta organização.",
  erro: "Não foi possível carregar os dados agora. Tente novamente em instantes.",
  conflito: "Este vínculo foi alterado desde a sua última leitura. Recarregue e revise antes de salvar novamente.",
  contaInexistente: "Não existe conta ContaOS com este e-mail. A pessoa precisa ter uma conta antes de ser vinculada.",
  vinculoDesatualizado: "Este vínculo não foi encontrado ou está desatualizado. Recarregue a lista e tente novamente.",
  validacao: "Revise os dados informados e tente novamente.",
  erroSalvar: "Não foi possível salvar agora. Tente novamente.",
  salvo: "Vínculo salvo.",
  escopoVazio: "Nenhum contrato encontrado.",
  auditoriaVazia: "Nenhum evento registrado para este vínculo.",
  usuarioExistente: "Conta existente localizada e vinculada.",
  usuarioConvidado: "Convite enviado e vínculo salvo.",
  conflitoIdempotencia: "Esta solicitação conflita com outra já registrada. Revise os dados e envie novamente.",
  emProcessamento: "Esta solicitação ainda está em processamento. Aguarde e consulte novamente.",
  conviteNaoEnviado: "Não foi possível enviar o convite para este e-mail. Revise o endereço e tente novamente.",
  muitoGrande: "Os dados enviados excedem o tamanho permitido. Reduza as informações e tente novamente.",
  sessaoInvalida: "Sua sessão expirou ou é inválida. Entre novamente para continuar.",
} as const;

export type Operacao = "listar" | "escopo" | "escopoNovo" | "auditoria" | "salvarNovo" | "salvarEdicao";
export type TipoErro =
  | "negado"
  | "conflito"
  | "contaInexistente"
  | "vinculoDesatualizado"
  | "validacao"
  | "conflitoIdempotencia"
  | "emProcessamento"
  | "conviteNaoEnviado"
  | "muitoGrande"
  | "sessaoInvalida"
  | "erro";

export class ErroAdm extends Error {
  constructor(public tipo: TipoErro) {
    super(tipo);
  }
}

export function classificarErroAdm(op: Operacao, error: unknown, status: number): TipoErro {
  const code = (error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PGRST301" || status === 401 || status === 403) return "negado";
  if (code === "PT409") return "conflito";
  if (code === "PT404") {
    if (op === "salvarNovo") return "contaInexistente";
    if (op === "escopo" || op === "auditoria" || op === "salvarEdicao") return "vinculoDesatualizado";
    return "erro";
  }
  if (code === "PT400") return "validacao";
  return "erro";
}

export type Perfil = { codigo: string; nome: string; descricao: string | null };
export type Vinculo = {
  id: string;
  perfil: string;
  escopo_todos_contratos: boolean;
  ativo: boolean;
  inicio_em: string | null;
  fim_em: string | null;
  versao_registro: number;
  atualizado_em: string | null;
};
export type UsuarioVinculo = {
  id_usuario: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  situacao_usuario: string | null;
  vinculo: Vinculo;
};
type Pagina<T> = { schema_versao: string; pagina: number; tamanho_pagina: number; total: number; total_paginas: number; itens: T[] };
export type ListaUsuarios = Pagina<UsuarioVinculo> & { perfis_disponiveis: Perfil[] };
export type ContratoEscopo = {
  id: string;
  numero: string | null;
  objeto: string | null;
  situacao: string | null;
  criticidade: string | null;
  selecionado: boolean;
  acesso_efetivo: boolean;
};
export type ListaEscopo = Pagina<ContratoEscopo> & { escopo_todos_contratos: boolean };
export type EventoAuditoria = {
  id: string;
  correlation_id: string | null;
  evento: string;
  entidade: string;
  ator_nome: string | null;
  ator_email: string | null;
  antes: Record<string, unknown> | null;
  depois: Record<string, unknown> | null;
  criado_em: string;
};
export type ListaAuditoria = Pagina<EventoAuditoria>;
export type RespostaSalvar = { schema_versao: string; correlation_id: string; id_usuario: string; vinculo: unknown };

export const TAMANHO_LISTA = 25;
export const TAMANHO_ESCOPO = 25;
export const TAMANHO_AUDITORIA = 20;

// Contrato canônico: somente "adm01-v2". Outro valor = incompatibilidade técnica, sem fallback.
const VERSAO = "adm01-v2";

type Rpc = (nome: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown; status: number }>;
// Cast pontual: os tipos gerados declaram `p_id_usuario`/`p_email`/`p_versao_esperada` como não-nulos,
// mas o contrato adm01-v2 aceita null nesses parâmetros.
const rpc: Rpc = (nome, args) => (supabase.rpc as unknown as Rpc).call(supabase, nome, args);

async function chamar<T>(nome: string, args: Record<string, unknown>, op: Operacao): Promise<T> {
  const { data, error, status } = await rpc(nome, args);
  if (error) throw new ErroAdm(classificarErroAdm(op, error, status));
  if ((data as { schema_versao?: string } | null)?.schema_versao !== VERSAO) throw new ErroAdm("erro");
  return data as T;
}

/** Autorização administrativa decidida no backend. `false` = negado. */
export async function validarAdministrador(org: string): Promise<boolean> {
  const { data, error, status } = await rpc("validar_administrador_organizacao", { p_id_organizacao: org });
  if (error) throw new ErroAdm(classificarErroAdm("listar", error, status));
  if (typeof data !== "boolean") throw new ErroAdm("erro");
  return data;
}

export function listarUsuarios(org: string, p: { pagina: number; busca: string | null; ativo: boolean | null }) {
  return chamar<ListaUsuarios>(
    "listar_usuarios_vinculos_adm",
    { p_id_organizacao: org, p_pagina: p.pagina, p_tamanho_pagina: TAMANHO_LISTA, p_busca: p.busca, p_ativo: p.ativo },
    "listar",
  );
}

export function listarEscopo(org: string, idUsuario: string | null, pagina: number, busca: string | null) {
  return chamar<ListaEscopo>(
    "listar_escopo_contratos_usuario_adm",
    { p_id_organizacao: org, p_id_usuario: idUsuario, p_pagina: pagina, p_tamanho_pagina: TAMANHO_ESCOPO, p_busca: busca },
    idUsuario ? "escopo" : "escopoNovo",
  );
}

export function listarAuditoria(org: string, idUsuario: string, pagina: number) {
  return chamar<ListaAuditoria>(
    "listar_auditoria_vinculo_usuario_adm",
    { p_id_organizacao: org, p_id_usuario: idUsuario, p_pagina: pagina, p_tamanho_pagina: TAMANHO_AUDITORIA },
    "auditoria",
  );
}

export type PayloadSalvar = {
  p_id_organizacao: string;
  p_id_usuario: string | null;
  p_email: string | null;
  p_perfil: string;
  p_escopo_todos_contratos: boolean;
  p_ativo: boolean;
  p_ids_contratos_ativar: string[];
  p_ids_contratos_revogar: string[];
  p_versao_esperada: number | null;
};

export function salvarVinculo(payload: PayloadSalvar, chave: string, op: "salvarNovo" | "salvarEdicao") {
  return chamar<RespostaSalvar>("salvar_vinculo_usuario_adm", { ...payload, p_chave_idempotencia: chave }, op);
}

// ---- Edge Function oficial admin-invite-user (verify_jwt=true; JWT anexado pelo cliente existente) ----
export type CorpoConvite = { id_organizacao: string; email: string; nome?: string; chave_idempotencia: string };
export type RespostaConvite = { codigo: "USUARIO_EXISTENTE" | "USUARIO_CONVIDADO"; id_usuario: string };

export function classificarErroConvite(status: number, codigo: string | null): TipoErro {
  if (status === 401) return "sessaoInvalida";
  if (status === 403) return "negado";
  if (status === 409 && codigo === "CONFLITO_IDEMPOTENCIA") return "conflitoIdempotencia";
  if (status === 409 && codigo === "OPERACAO_EM_PROCESSAMENTO") return "emProcessamento";
  if (status === 422 && codigo === "CONVITE_NAO_ENVIADO") return "conviteNaoEnviado";
  if (status === 422) return "validacao";
  if (status === 413) return "muitoGrande";
  return "erro";
}

function lerCodigo(b: unknown): string | null {
  const o = b as { codigo?: unknown } | null;
  const c = o?.codigo;
  return typeof c === "string" ? c : null;
}

export async function convidarUsuario(corpo: CorpoConvite): Promise<RespostaConvite> {
  let resp: { data: unknown; error: unknown };
  try {
    resp = await supabase.functions.invoke("admin-invite-user", { body: corpo });
  } catch {
    throw new ErroAdm("erro");
  }
  if (resp.error) {
    const ctx = (resp.error as { context?: { status?: number; json?: () => Promise<unknown> } }).context;
    const status = typeof ctx?.status === "number" ? ctx.status : 0;
    const corpoErro = ctx?.json ? await ctx.json().catch(() => null) : null;
    throw new ErroAdm(classificarErroConvite(status, lerCodigo(corpoErro)));
  }
  const d = resp.data as { codigo?: unknown; usuario?: { id_usuario?: unknown } } | null;
  const codigo = d?.codigo;
  const id = typeof d?.usuario?.id_usuario === "string" ? d.usuario.id_usuario : null;
  if ((codigo !== "USUARIO_EXISTENTE" && codigo !== "USUARIO_CONVIDADO") || !id) throw new ErroAdm("erro");
  return { codigo, id_usuario: id };
}

export function textoErro(e: unknown): string {
  const t = e instanceof ErroAdm ? e.tipo : "erro";
  return t === "erro" ? MENSAGENS_ADM01.erro : MENSAGENS_ADM01[t];
}

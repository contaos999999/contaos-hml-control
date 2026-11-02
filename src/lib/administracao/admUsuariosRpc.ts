/**
 * ADM-01 — Acesso às 4 RPCs oficiais (backend HML certificado). Nenhuma outra operação.
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
} as const;

export type Operacao = "listar" | "escopo" | "escopoNovo" | "auditoria" | "salvarNovo" | "salvarEdicao";
export type TipoErro = "negado" | "conflito" | "contaInexistente" | "vinculoDesatualizado" | "validacao" | "erro";

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

// O backend HML retorna "adm01-v2" em todas as RPCs; lista/auditoria aceitam também "adm01-v1".
const VERSOES: Record<string, string[]> = {
  listar: ["adm01-v1", "adm01-v2"],
  auditoria: ["adm01-v1", "adm01-v2"],
  escopo: ["adm01-v2"],
  salvar: ["adm01-v2"],
};

type Rpc = (nome: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown; status: number }>;
// Cast pontual: os tipos gerados declaram `p_id_usuario`/`p_email`/`p_versao_esperada` como não-nulos,
// mas o contrato adm01-v2 aceita null nesses parâmetros.
const rpc = supabase.rpc.bind(supabase) as unknown as Rpc;

async function chamar<T>(nome: string, args: Record<string, unknown>, op: Operacao, grupo: keyof typeof VERSOES): Promise<T> {
  const { data, error, status } = await rpc(nome, args);
  if (error) throw new ErroAdm(classificarErroAdm(op, error, status));
  const v = (data as { schema_versao?: string } | null)?.schema_versao;
  if (!v || !VERSOES[grupo]!.includes(v)) throw new ErroAdm("erro");
  return data as T;
}

export function listarUsuarios(org: string, p: { pagina: number; busca: string | null; ativo: boolean | null }) {
  return chamar<ListaUsuarios>(
    "listar_usuarios_vinculos_adm",
    { p_id_organizacao: org, p_pagina: p.pagina, p_tamanho_pagina: TAMANHO_LISTA, p_busca: p.busca, p_ativo: p.ativo },
    "listar",
    "listar",
  );
}

export function listarEscopo(org: string, idUsuario: string | null, pagina: number, busca: string | null) {
  return chamar<ListaEscopo>(
    "listar_escopo_contratos_usuario_adm",
    { p_id_organizacao: org, p_id_usuario: idUsuario, p_pagina: pagina, p_tamanho_pagina: TAMANHO_ESCOPO, p_busca: busca },
    idUsuario ? "escopo" : "escopoNovo",
    "escopo",
  );
}

export function listarAuditoria(org: string, idUsuario: string, pagina: number) {
  return chamar<ListaAuditoria>(
    "listar_auditoria_vinculo_usuario_adm",
    { p_id_organizacao: org, p_id_usuario: idUsuario, p_pagina: pagina, p_tamanho_pagina: TAMANHO_AUDITORIA },
    "auditoria",
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

export function salvarVinculo(payload: PayloadSalvar, chave: string) {
  return chamar<RespostaSalvar>(
    "salvar_vinculo_usuario_adm",
    { ...payload, p_chave_idempotencia: chave },
    payload.p_id_usuario ? "salvarEdicao" : "salvarNovo",
    "salvar",
  );
}

export function textoErro(e: unknown): string {
  const t = e instanceof ErroAdm ? e.tipo : "erro";
  return t === "erro" ? MENSAGENS_ADM01.erro : MENSAGENS_ADM01[t];
}

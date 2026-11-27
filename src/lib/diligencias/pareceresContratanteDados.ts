import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { sha256Diligencia } from "@/lib/diligencias/apontamentoEvidenciasDados";
import { dataCalendario, instante, offsetDiligenciasValido, PAGINA_DILIGENCIAS } from "@/lib/diligencias/diligenciasDados";

const id = z.string().refine(uuidValido);
const data = z.string().refine(dataCalendario);
const horario = z.string().refine(instante);
const escopo = z.object({ id_organizacao: id, id_contrato: id, id_competencia: id });
const parecer = escopo.extend({
  id,
  id_apresentacao: id.nullable(),
  id_arquivo: id,
  id_ciclo: id.nullable(),
  registrado_por: id.nullable(),
  resultado_geral: z.string().nullable(),
  numero_documento: z.string().nullable(),
  parecer_final_favoravel: z.boolean(),
  data_emissao: data.nullable(),
  recebido_em: horario,
});
const apresentacao = escopo.extend({
  id,
  protocolo: z.string().nullable(),
  numero_rodada: z.number().int().positive(),
  apresentado_em: horario,
});
const arquivo = z.object({
  id,
  id_organizacao: id,
  id_contrato: id,
  status_seguranca: z.literal("aprovado"),
  sha256: z.string().refine(sha256Diligencia),
  nome_original: z.string(),
});
const processamento = z.object({
  id_parecer: id,
  id_ciclo: id.nullable(),
  id_competencia: id,
  status: z.enum(["enfileirado", "processando", "concluido", "falhou", "cancelado", "indisponivel", "dispensado"]),
  tentativas: z.number().int().nonnegative(),
  iniciado_em: horario.nullable(),
  concluido_em: horario.nullable(),
  atualizado_em: horario.nullable(),
  correlation_id: id.nullable(),
});
const pedido = z.object({
  apresentacao: id,
  arquivo: id,
  resultado: z.string().trim().min(1).max(200),
  finalFavoravel: z.boolean(),
  numero: z.string().trim().max(120),
  emissao: z.union([data, z.literal("")]),
  prazo: z.union([data, z.literal("")]),
});
export type EscopoParecer = z.infer<typeof escopo>;
export type ParecerContratante = z.infer<typeof parecer>;
export type PedidoParecer = z.infer<typeof pedido>;
export type ProcessamentoParecer = z.infer<typeof processamento>;
export type ApresentacaoParecer = z.infer<typeof apresentacao>;
export type ArquivoParecer = z.infer<typeof arquivo>;

export class ErroParecer extends Error {
  constructor(public readonly tipo: "sem_permissao" | "invalido" | "conflito" | "erro") {
    super(tipo);
    this.name = "ErroParecer";
  }
}
type Resposta = { data: unknown; error: { code?: string } | null; status: number };
const clienteFila = supabase as unknown as {
  rpc(
    nome: "obter_processamento_parecer_v2",
    args: { p_id_competencia: string; p_id_parecer: string },
  ): { abortSignal(signal: AbortSignal): PromiseLike<Resposta> };
  rpc(
    nome: "obter_fonte_apontamento_contratante",
    args: { p_id_ciclo: string; p_id_apontamento: string },
  ): { abortSignal(signal: AbortSignal): PromiseLike<Resposta> };
};

function interpretar<T>(schema: z.ZodType<T>, resposta: Resposta, signal: AbortSignal): T {
  signal.throwIfAborted();
  if (resposta.error) {
    const codigo = resposta.error.code;
    if (resposta.status === 401 || resposta.status === 403 || codigo === "42501" || codigo === "PGRST301" || codigo === "PGRST303")
      throw new ErroParecer("sem_permissao");
    if (resposta.status === 409 || codigo === "PT409") throw new ErroParecer("conflito");
    if (resposta.status === 400 || codigo === "PT400") throw new ErroParecer("invalido");
    throw new ErroParecer("erro");
  }
  const valor = schema.safeParse(resposta.data);
  if (!valor.success) throw new ErroParecer("erro");
  return valor.data;
}

function validarEscopo(contexto: EscopoParecer) {
  if (!escopo.safeParse(contexto).success) throw new ErroParecer("invalido");
}

function mesmoEscopo(linha: EscopoParecer, contexto: EscopoParecer) {
  return linha.id_organizacao === contexto.id_organizacao &&
    linha.id_contrato === contexto.id_contrato &&
    linha.id_competencia === contexto.id_competencia;
}

function validarPagina<T extends { id: string }>(
  itens: T[], total: number | null, offset: number,
) {
  if (total === null || !Number.isSafeInteger(total) || total < 0 ||
      itens.length !== Math.max(0, Math.min(PAGINA_DILIGENCIAS, total - offset)) ||
      new Set(itens.map((item) => item.id)).size !== itens.length)
    throw new ErroParecer("erro");
  return { itens, total };
}

export async function listarPareceres(contexto: EscopoParecer, offset: number, signal: AbortSignal) {
  validarEscopo(contexto);
  if (!offsetDiligenciasValido(offset)) throw new ErroParecer("invalido");
  signal.throwIfAborted();
  const r = await supabase.from("pareceres_contratante")
    .select("id,id_organizacao,id_contrato,id_competencia,id_apresentacao,id_arquivo,id_ciclo,registrado_por,resultado_geral,numero_documento,parecer_final_favoravel,data_emissao,recebido_em", { count: "exact" })
    .eq("id_organizacao", contexto.id_organizacao)
    .eq("id_contrato", contexto.id_contrato)
    .eq("id_competencia", contexto.id_competencia)
    .order("recebido_em", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_DILIGENCIAS - 1).abortSignal(signal);
  const itens = interpretar(z.array(parecer), r, signal);
  if (itens.some((item) => !mesmoEscopo(item, contexto))) throw new ErroParecer("sem_permissao");
  return validarPagina(itens, r.count, offset);
}

export async function listarApresentacoesParecer(contexto: EscopoParecer, offset: number, signal: AbortSignal) {
  validarEscopo(contexto);
  if (!offsetDiligenciasValido(offset)) throw new ErroParecer("invalido");
  signal.throwIfAborted();
  const r = await supabase.from("apresentacoes_contratante")
    .select("id,id_organizacao,id_contrato,id_competencia,protocolo,numero_rodada,apresentado_em", { count: "exact" })
    .eq("id_organizacao", contexto.id_organizacao)
    .eq("id_contrato", contexto.id_contrato)
    .eq("id_competencia", contexto.id_competencia)
    .order("numero_rodada", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_DILIGENCIAS - 1).abortSignal(signal);
  const itens = interpretar(z.array(apresentacao), r, signal);
  if (itens.some((item) => !mesmoEscopo(item, contexto))) throw new ErroParecer("sem_permissao");
  return validarPagina(itens, r.count, offset);
}

export async function conferirApresentacaoParecer(contexto: EscopoParecer, referencia: string, signal: AbortSignal) {
  validarEscopo(contexto);
  if (!uuidValido(referencia)) throw new ErroParecer("invalido");
  signal.throwIfAborted();
  const r = await supabase.from("apresentacoes_contratante")
    .select("id,id_organizacao,id_contrato,id_competencia,protocolo,numero_rodada,apresentado_em")
    .eq("id", referencia).eq("id_organizacao", contexto.id_organizacao)
    .eq("id_contrato", contexto.id_contrato).eq("id_competencia", contexto.id_competencia)
    .abortSignal(signal).maybeSingle();
  const valor = interpretar(apresentacao.nullable(), r, signal);
  if (!valor || valor.id !== referencia || !mesmoEscopo(valor, contexto))
    throw new ErroParecer("sem_permissao");
  return valor;
}

export async function conferirArquivoParecer(contexto: EscopoParecer, referencia: string, signal: AbortSignal) {
  validarEscopo(contexto);
  if (!uuidValido(referencia)) throw new ErroParecer("invalido");
  signal.throwIfAborted();
  const r = await supabase.from("arquivos")
    .select("id,id_organizacao,id_contrato,status_seguranca,sha256,nome_original")
    .eq("id", referencia).eq("id_organizacao", contexto.id_organizacao)
    .eq("id_contrato", contexto.id_contrato).eq("status_seguranca", "aprovado")
    .abortSignal(signal).maybeSingle();
  const valor = interpretar(arquivo.nullable(), r, signal);
  if (!valor || valor.id !== referencia || valor.id_organizacao !== contexto.id_organizacao ||
      valor.id_contrato !== contexto.id_contrato) throw new ErroParecer("sem_permissao");
  return valor;
}

export function prepararPedidoParecer(valor: PedidoParecer) {
  const parsed = pedido.safeParse(valor);
  if (!parsed.success) throw new ErroParecer("invalido");
  return parsed.data;
}

export async function registrarParecer(contexto: EscopoParecer, valor: PedidoParecer, signal: AbortSignal) {
  validarEscopo(contexto);
  const p = prepararPedidoParecer(valor);
  await conferirApresentacaoParecer(contexto, p.apresentacao, signal);
  await conferirArquivoParecer(contexto, p.arquivo, signal);
  signal.throwIfAborted();
  return interpretar(id, await supabase.rpc("registrar_parecer_contratante", {
    p_id_competencia: contexto.id_competencia,
    p_id_apresentacao: p.apresentacao,
    p_id_arquivo: p.arquivo,
    p_resultado_geral: p.resultado,
    p_parecer_final_favoravel: p.finalFavoravel,
    ...(p.numero ? { p_numero_documento: p.numero } : {}),
    ...(p.emissao ? { p_data_emissao: p.emissao } : {}),
    ...(p.prazo ? { p_prazo_resposta: p.prazo } : {}),
  }).abortSignal(signal), signal);
}

export async function consultarProcessamentoParecer(contexto: EscopoParecer, item: ParecerContratante, signal: AbortSignal) {
  validarEscopo(contexto);
  if (!parecer.safeParse(item).success || !mesmoEscopo(item, contexto))
    throw new ErroParecer("sem_permissao");
  signal.throwIfAborted();
  const valor = interpretar(processamento, await clienteFila.rpc("obter_processamento_parecer_v2", {
    p_id_competencia: contexto.id_competencia,
    p_id_parecer: item.id,
  }).abortSignal(signal), signal);
  if (valor.id_parecer !== item.id || valor.id_competencia !== contexto.id_competencia ||
      valor.id_ciclo !== item.id_ciclo || (valor.status === "dispensado") !== item.parecer_final_favoravel)
    throw new ErroParecer("erro");
  return valor;
}

export const ROTULOS_PROCESSAMENTO_PARECER: Record<ProcessamentoParecer["status"], string> = {
  enfileirado: "Enfileirado",
  processando: "Em processamento",
  concluido: "Concluído",
  falhou: "Falha no processamento",
  cancelado: "Cancelado",
  indisponivel: "Indisponível",
  dispensado: "Extração dispensada",
};

export async function consultarUltimoParecer(contexto: EscopoParecer, signal: AbortSignal) {
  const { itens } = await listarPareceres(contexto, 0, signal);
  const ultimo = itens[0];
  if (!ultimo) return null;
  const situacao = await consultarProcessamentoParecer(contexto, ultimo, signal);
  return { parecer: ultimo, processamento: situacao };
}

const candidato = escopo.extend({
  id,
  id_ciclo: id,
  codigo: z.string().nullable(),
  descricao: z.string(),
});
const origem = escopo.extend({
  id_apontamento: id,
  id_ciclo: id,
  estado: z.enum(["REGISTRADA", "ORIGEM_INDISPONIVEL", "ORIGEM_NAO_REGISTRADA"]),
  fonte: z.object({
    id_parecer: id,
    id_arquivo: id,
    id_apresentacao: id.nullable(),
    arquivo_sha256: z.string().refine(sha256Diligencia),
  }).nullable(),
});
export type ApontamentoParecer = z.infer<typeof candidato>;

/** Pagina candidatos do ciclo; só expõe vínculos confirmados pela RPC de origem. */
export async function listarApontamentosParecer(
  contexto: EscopoParecer,
  item: ParecerContratante,
  offset: number,
  signal: AbortSignal,
) {
  validarEscopo(contexto);
  if (!parecer.safeParse(item).success || !mesmoEscopo(item, contexto))
    throw new ErroParecer("sem_permissao");
  if (!item.id_ciclo || !offsetDiligenciasValido(offset))
    throw new ErroParecer("invalido");
  const ciclo = item.id_ciclo;
  signal.throwIfAborted();
  const r = await supabase
    .from("apontamentos_contratante")
    .select("id,id_ciclo,id_organizacao,id_contrato,id_competencia,codigo,descricao", { count: "exact" })
    .eq("id_organizacao", contexto.id_organizacao)
    .eq("id_contrato", contexto.id_contrato)
    .eq("id_competencia", contexto.id_competencia)
    .eq("id_ciclo", ciclo)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGINA_DILIGENCIAS - 1)
    .abortSignal(signal);
  const candidatos = interpretar(z.array(candidato), r, signal);
  const pagina = validarPagina(candidatos, r.count, offset);
  if (candidatos.some((a) => !mesmoEscopo(a, contexto) || a.id_ciclo !== ciclo))
    throw new ErroParecer("sem_permissao");
  const conferidos = await Promise.all(candidatos.map(async (a) => {
    const resposta = interpretar(origem, await clienteFila.rpc("obter_fonte_apontamento_contratante", {
      p_id_ciclo: ciclo,
      p_id_apontamento: a.id,
    }).abortSignal(signal), signal);
    if (!mesmoEscopo(resposta, contexto) || resposta.id_ciclo !== ciclo || resposta.id_apontamento !== a.id)
      throw new ErroParecer("erro");
    if (resposta.estado !== "REGISTRADA") {
      if (resposta.fonte !== null) throw new ErroParecer("erro");
      return null;
    }
    const fonte = resposta.fonte;
    if (!fonte) throw new ErroParecer("erro");
    if (fonte.id_parecer !== item.id) return null;
    if (fonte.id_arquivo !== item.id_arquivo || fonte.id_apresentacao !== item.id_apresentacao)
      throw new ErroParecer("erro");
    return a;
  }));
  signal.throwIfAborted();
  return { itens: conferidos.filter((a): a is ApontamentoParecer => a !== null), totalCandidatos: pagina.total };
}

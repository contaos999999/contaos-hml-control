import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { obterDocumentosCompetencia } from "@/lib/competencias/competenciaDocumentosDados";
import { PAGINA_DOCS } from "@/lib/contratos/documentosDados";
import { uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { sha256Diligencia } from "@/lib/diligencias/apontamentoEvidenciasDados";
import { dataCalendario, instante, type CicloDiligencia } from "@/lib/diligencias/diligenciasDados";

export const PAGINA_PLANO = 10;
export const PRIORIDADES_TAREFA = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
} as const;
export const SITUACOES_TAREFA = {
  pendente: "Pendente",
  em_execucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
} as const;
export const VALIDACOES_TAREFA = {
  pendente: "Aguardando submissão",
  em_analise: "Aguardando revisão da solução",
  aprovada: "Solução validada",
  rejeitada: "Devolvida para ajuste",
} as const;
export const TIPOS_TAREFA = {
  corrigir_documento: "Corrigir documento",
  anexar_complemento: "Anexar complemento",
  refazer_planilha: "Refazer planilha",
  justificar: "Justificar",
  contestar: "Contestar",
  obter_assinatura: "Obter assinatura",
  reconciliar_valor: "Reconciliar valor",
  solicitar_documento_terceiro: "Solicitar documento a terceiro",
} as const;
export const EVENTOS_TAREFA = {
  TarefaDiligenciaAtribuida: "Atribuição de tarefa",
  TarefaDiligenciaPrazoAlterado: "Alteração de prazo",
} as const;

const id = z.string().refine(uuidValido);
const versao = z.number().int().positive();
const prioridade = z.enum(["baixa", "media", "alta", "critica"]);
const statusTarefa = z.enum(["pendente", "em_execucao", "concluida", "cancelada"]);
const statusValidacao = z.enum(["pendente", "em_analise", "aprovada", "rejeitada"]);
const textoOpcao = z.string().min(1);
const prazo = z.string().refine(dataCalendario);
const perfil = z.string().regex(/^[a-z][a-z0-9_]{0,59}$/);
const prova = z.object({
  id_analise: id,
  id_execucao: id,
  id_tarefa: id,
  id_apontamento: id,
  id_evidencia: id,
  classificacao: z.enum([
    "procedente",
    "parcialmente_procedente",
    "nao_procedente",
    "inconclusivo",
  ]),
  confianca: z.number().min(0).max(1),
  evidencia_suficiente: z.boolean(),
  registrado_em: z.string().refine(instante),
});
const resumoTarefa = z.object({
  id,
  descricao: textoOpcao,
  status: statusTarefa,
  validacao_solucao: statusValidacao,
});
const tarefa = resumoTarefa.extend({
  id_plano: id.nullable(),
  responsavel: id.nullable(),
  prazo: prazo.nullable(),
  tipo_acao: z.string().nullable(),
  prioridade,
  depende_de: z.array(id),
  versao_registro: versao,
  id_execucao: id.nullable(),
  id_evidencia: id.nullable(),
  prova: prova.nullable(),
  estado_execucao: z
    .enum(["enfileirado", "processando", "concluido", "falhou", "cancelado"])
    .nullable(),
  editar: z.boolean(),
  submeter: z.boolean(),
  revisar: z.boolean(),
  aprovar: z.boolean(),
});
const leituraPlano = z.object({
  id_ciclo: id,
  id_apontamento: id,
  total: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  limite: z.literal(PAGINA_PLANO),
  criar: z.boolean(),
  perfil_preferencia: perfil.nullable(),
  tarefas: z.array(tarefa).max(PAGINA_PLANO),
  planos: z.array(
    z.object({
      id,
      titulo: textoOpcao,
      status: z.enum(["aberto", "em_execucao", "concluido", "cancelado"]),
    }),
  ),
  responsaveis: z.array(z.object({ id, nome: z.string().nullable() })),
  dependencias: z.array(resumoTarefa),
});
const reciboOperacao = z.object({
  schema_versao: z.literal("v247-v1"),
  id_tarefa: id,
  versao_registro: versao,
  status: statusTarefa,
  validacao_solucao: statusValidacao,
  id_execucao: id.nullable(),
  correlation_id: id,
  id_evidencia: id.optional(),
});
const leituraPortao = z.object({
  total: z.number().int().nonnegative(),
  tratados: z.number().int().nonnegative(),
  abertos: z.number().int().nonnegative(),
  liberado: z.boolean(),
});
const documentos = z.object({
  competencia: z.object({ id, id_contrato: id, id_organizacao: id }),
  documentos_total: z.number().int().nonnegative(),
  documentos: z
    .array(
      z.object({
        id,
        titulo: textoOpcao,
        situacao: z.string(),
        versao_atual: z.number().int().nonnegative(),
        versao: z
          .object({
            id,
            numero_versao: versao,
            hash: z.string().refine(sha256Diligencia),
          })
          .nullable(),
      }),
    )
    .max(PAGINA_DOCS),
});
const linhaPreferencia = z.object({
  evento: z.string(),
  canal: z.enum(["in_app", "email"]),
  habilitado: z.boolean(),
});

export type EscopoPlanoAcao = Pick<
  CicloDiligencia,
  "id" | "id_competencia" | "id_contrato" | "id_organizacao"
>;
export type TarefaDiligencia = z.infer<typeof tarefa>;
export type PlanoAcao = z.infer<typeof leituraPlano>;
export type PortaoRodada = z.infer<typeof leituraPortao>;
export type PreferenciaTarefa = z.infer<typeof linhaPreferencia>;
export type EvidenciaElegivel = { id: string; titulo: string; numero: number; hash: string };
export type PaginaEvidencias = { total: number; opcoes: EvidenciaElegivel[] };
export type DadosTarefa = {
  descricao: string;
  responsavel: string;
  prazo: string;
  tipo_acao: string;
  prioridade: TarefaDiligencia["prioridade"];
  depende_de: string[];
  id_plano?: string;
};
export type AcaoTarefa =
  | { tipo: "salvar"; tarefa: TarefaDiligencia | null; dados: DadosTarefa }
  | { tipo: "submeter"; tarefa: TarefaDiligencia; evidencia: string }
  | { tipo: "revisar"; tarefa: TarefaDiligencia; aprovar: boolean; fundamento: string };

type TipoFalha = "sem_permissao" | "invalido" | "conflito" | "erro";
export class ErroPlanoAcao extends Error {
  constructor(public readonly tipo: TipoFalha) {
    super(tipo);
    this.name = "ErroPlanoAcao";
  }
}

type Resposta = { data: unknown; error: { code?: string } | null; status: number };
type ContextoRpc = { p_id_ciclo: string; p_id_apontamento: string };
type VersaoRpc = { p_id_tarefa: string; p_versao_esperada: number; p_chave_idempotencia: string };
type Args = {
  obter_plano_acao_diligencia_v2: ContextoRpc & { p_offset: number; p_limite: number };
  salvar_tarefa_diligencia_v2: ContextoRpc & {
    p_id_tarefa: string | null;
    p_versao_esperada: number | null;
    p_dados: DadosTarefa;
    p_chave_idempotencia: string;
  };
  submeter_solucao_tarefa_diligencia_v2: VersaoRpc & { p_id_evidencia: string };
  revisar_solucao_tarefa_diligencia_v2: VersaoRpc & { p_aprovar: boolean; p_fundamento: string };
  avaliar_portao_reapresentacao: { p_id_ciclo: string };
};
const cliente = supabase as unknown as {
  rpc<N extends keyof Args>(
    nome: N,
    args: Args[N],
  ): {
    abortSignal(signal: AbortSignal): PromiseLike<Resposta>;
  };
};

function verificarResposta(
  resposta: { data: unknown; error: unknown; status?: number | undefined },
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  if (!resposta.error) return resposta.data;
  const code = (resposta.error as { code?: string }).code;
  if (resposta.status === 401 || resposta.status === 403 || code === "42501" || code === "PGRST301")
    throw new ErroPlanoAcao("sem_permissao");
  if (resposta.status === 409 || code === "PT409") throw new ErroPlanoAcao("conflito");
  if (resposta.status === 400 || code === "PT400") throw new ErroPlanoAcao("invalido");
  throw new ErroPlanoAcao("erro");
}

function decodificar<T>(schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new ErroPlanoAcao("erro");
  return parsed.data;
}

export async function consultarPlanoAcao(
  escopo: EscopoPlanoAcao,
  apontamento: string,
  offset: number,
  signal: AbortSignal,
) {
  const resposta = await cliente
    .rpc("obter_plano_acao_diligencia_v2", {
      p_id_ciclo: escopo.id,
      p_id_apontamento: apontamento,
      p_offset: offset,
      p_limite: PAGINA_PLANO,
    })
    .abortSignal(signal);
  const plano = decodificar(leituraPlano, verificarResposta(resposta, signal));
  if (
    plano.id_ciclo !== escopo.id ||
    plano.id_apontamento !== apontamento ||
    plano.offset !== offset ||
    plano.tarefas.length !== Math.max(0, Math.min(plano.total - offset, PAGINA_PLANO)) ||
    new Set(plano.tarefas.map((t) => t.id)).size !== plano.tarefas.length
  )
    throw new ErroPlanoAcao("erro");
  for (const t of plano.tarefas) {
    if (
      (t.aprovar && (!t.revisar || !t.prova?.evidencia_suficiente)) ||
      (t.prova &&
        (t.prova.id_tarefa !== t.id ||
          t.prova.id_apontamento !== apontamento ||
          t.prova.id_execucao !== t.id_execucao ||
          t.prova.id_evidencia !== t.id_evidencia))
    )
      throw new ErroPlanoAcao("erro");
  }
  return plano;
}

export async function consultarPortaoRodada(ciclo: string, signal: AbortSignal) {
  const resultado = await cliente
    .rpc("avaliar_portao_reapresentacao", {
      p_id_ciclo: ciclo,
    })
    .abortSignal(signal);
  return decodificar(leituraPortao, verificarResposta(resultado, signal));
}

export async function consultarEvidenciasElegiveis(
  escopo: EscopoPlanoAcao,
  offset: number,
  signal: AbortSignal,
): Promise<PaginaEvidencias> {
  const resposta = await obterDocumentosCompetencia(escopo.id_competencia, offset, 0, signal);
  const pacote = decodificar(documentos, verificarResposta(resposta, signal));
  const comp = pacote.competencia;
  if (
    comp.id !== escopo.id_competencia ||
    comp.id_organizacao !== escopo.id_organizacao ||
    comp.id_contrato !== escopo.id_contrato
  )
    throw new ErroPlanoAcao("erro");
  return {
    total: pacote.documentos_total,
    opcoes: pacote.documentos.flatMap((doc) =>
      doc.situacao === "ativo" && doc.versao && doc.versao.numero_versao === doc.versao_atual
        ? [
            {
              id: doc.versao.id,
              titulo: doc.titulo,
              numero: doc.versao.numero_versao,
              hash: doc.versao.hash,
            },
          ]
        : [],
    ),
  };
}

export { PAGINA_DOCS };

export async function registrarAcaoTarefa(
  escopo: EscopoPlanoAcao,
  apontamento: string,
  acao: AcaoTarefa,
  chave: string,
  signal: AbortSignal,
) {
  const contexto = { p_id_ciclo: escopo.id, p_id_apontamento: apontamento };
  const versao = {
    p_id_tarefa: acao.tarefa?.id ?? null,
    p_versao_esperada: acao.tarefa?.versao_registro ?? null,
    p_chave_idempotencia: chave,
  };
  let resposta: Resposta;
  if (acao.tipo === "salvar") {
    resposta = await cliente
      .rpc("salvar_tarefa_diligencia_v2", {
        ...contexto,
        ...versao,
        p_dados: acao.dados,
      })
      .abortSignal(signal);
  } else {
    const tarefa = {
      p_id_tarefa: acao.tarefa.id,
      p_versao_esperada: acao.tarefa.versao_registro,
      p_chave_idempotencia: chave,
    };
    resposta =
      acao.tipo === "submeter"
        ? await cliente
            .rpc("submeter_solucao_tarefa_diligencia_v2", {
              ...tarefa,
              p_id_evidencia: acao.evidencia,
            })
            .abortSignal(signal)
        : await cliente
            .rpc("revisar_solucao_tarefa_diligencia_v2", {
              ...tarefa,
              p_aprovar: acao.aprovar,
              p_fundamento: acao.fundamento,
            })
            .abortSignal(signal);
  }
  const recibo = decodificar(reciboOperacao, verificarResposta(resposta, signal));
  if (
    (acao.tarefa &&
      (recibo.id_tarefa !== acao.tarefa.id ||
        recibo.versao_registro <= acao.tarefa.versao_registro)) ||
    (acao.tipo === "submeter" && (recibo.id_evidencia !== acao.evidencia || !recibo.id_execucao)) ||
    (acao.tipo === "revisar" &&
      recibo.validacao_solucao !== (acao.aprovar ? "aprovada" : "rejeitada"))
  )
    throw new ErroPlanoAcao("erro");
  return recibo;
}

export function eventosPreferencia(papel: string | null) {
  const eventos = Object.keys(EVENTOS_TAREFA);
  return papel ? [...eventos, ...eventos.map((evento) => evento + ":" + papel)] : eventos;
}

export async function consultarPreferenciasTarefa(
  organizacao: string,
  usuario: string,
  papel: string | null,
  signal: AbortSignal,
) {
  const eventos = eventosPreferencia(papel);
  const resultado = await supabase
    .from("preferencias_notificacao")
    .select("evento,canal,habilitado")
    .eq("id_organizacao", organizacao)
    .eq("id_usuario", usuario)
    .in("evento", eventos)
    .abortSignal(signal);
  const prefs = decodificar(z.array(linhaPreferencia), verificarResposta(resultado, signal));
  if (prefs.some((p) => !eventos.includes(p.evento))) throw new ErroPlanoAcao("erro");
  return prefs;
}

export async function salvarPreferenciaTarefa(
  organizacao: string,
  usuario: string,
  preferencia: PreferenciaTarefa,
  signal: AbortSignal,
) {
  const resposta = await supabase
    .from("preferencias_notificacao")
    .upsert(
      {
        id_organizacao: organizacao,
        id_usuario: usuario,
        ...preferencia,
      },
      { onConflict: "id_organizacao,id_usuario,evento,canal" },
    )
    .abortSignal(signal);
  verificarResposta(resposta, signal);
}

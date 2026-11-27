import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  consultarEvidenciasDiligencia,
  sha256Diligencia,
} from "@/lib/diligencias/apontamentoEvidenciasDados";
import { instante, type CicloDiligencia } from "@/lib/diligencias/diligenciasDados";

const TAMANHO_HISTORICO = 10;
const TAMANHO_FONTES = 20;
const id = z.string().refine(uuidValido);
const hash = z.string().refine(sha256Diligencia);
const versao = z.number().int().positive();
const natural = z.number().int().nonnegative();
const data = z.string().refine(instante);
const estado = z.enum(["rascunho", "pendente", "aprovada", "rejeitada", "substituida"]);
const campo = (limite: number) => z.string().trim().min(1).max(limite);
const evidencia = z.object({
  id_versao_documento: id,
  pagina: versao,
  descricao: campo(1500),
  trecho: campo(2000),
  hash,
});
const fonte = z.object({ id, titulo: campo(1000), numero: versao, hash, vigente: z.boolean() });
const versaoContestacao = z.object({
  id,
  versao,
  texto: z.string().nullable(),
  fundamento: z.string().nullable(),
  hash: hash.nullable(),
  recomendada: z.boolean().nullable(),
  justificativa_recomendacao: z.string().nullable(),
  criado_em: data,
  status_aprovacao: estado,
  aprovado_por: id.nullable(),
  aprovado_em: data.nullable(),
  resultado_final: z.string().nullable(),
  resultado_registrado_em: data.nullable(),
  revisar: z.boolean(),
  mapa: z.array(evidencia.extend({ id, titulo: campo(1000), versao_documento: versao })).max(40),
});
const painel = z.object({
  id_ciclo: id,
  id_apontamento: id,
  versao_atual: natural,
  versao_apontamento: versao,
  submeter: z.boolean(),
  solicitar_minuta: z.boolean(),
  offset: natural,
  limite: z.literal(TAMANHO_HISTORICO),
  total: natural,
  contestacoes: z.array(versaoContestacao).max(TAMANHO_HISTORICO),
  offset_fontes: natural,
  total_fontes: natural,
  fontes: z.array(fonte).max(TAMANHO_FONTES),
  minuta: z
    .object({
      id,
      estado: z.enum(["enfileirado", "processando", "concluido", "falhou", "cancelado"]),
    })
    .nullable(),
});
const recibo = z.object({
  schema_versao: z.literal("v248-v1"),
  id_contestacao: id,
  id_apontamento: id,
  versao,
  hash,
  status_aprovacao: estado,
  correlation_id: id,
});
const reciboMinuta = z.object({ id_execucao: id, id_apontamento: id, versao_esperada: natural });

export type PainelContestacao = z.infer<typeof painel>;
export type Contestacao = z.infer<typeof versaoContestacao>;
export type EvidenciaContestacao = z.infer<typeof evidencia>;
export type AcaoContestacao =
  | { tipo: "minuta"; versao: number }
  | {
      tipo: "submeter";
      versao: number;
      texto: string;
      fundamento: string;
      evidencias: EvidenciaContestacao[];
    }
  | { tipo: "revisar"; versao: number; id: string; aprovar: boolean; fundamento: string };

type TipoFalha = "sem_permissao" | "invalido" | "conflito" | "erro";
export class ErroContestacao extends Error {
  constructor(public readonly tipo: TipoFalha) {
    super(tipo);
    this.name = "ErroContestacao";
  }
}

type RespostaRpc = { data: unknown; error: { code?: string } | null; status: number };
type VersaoRpc = { p_versao_esperada: number; p_chave: string };
type Args = {
  obter_contestacoes_v2: {
    p_id_ciclo: string;
    p_id_apontamento: string;
    p_offset: number;
    p_limite: number;
    p_offset_fontes: number;
  };
  salvar_contestacao_v2: VersaoRpc & {
    p_id_apontamento: string;
    p_texto: string;
    p_fundamento: string;
    p_evidencias: EvidenciaContestacao[];
  };
  revisar_contestacao_v2: VersaoRpc & {
    p_id_contestacao: string;
    p_aprovar: boolean;
    p_fundamento: string;
  };
  solicitar_minuta_contestacao_v2: VersaoRpc & { p_id_apontamento: string };
};
const cliente = supabase as unknown as {
  rpc<N extends keyof Args>(
    nome: N,
    args: Args[N],
  ): { abortSignal(signal: AbortSignal): PromiseLike<RespostaRpc> };
};

function interpretar<T>(schema: z.ZodType<T>, resposta: RespostaRpc, signal: AbortSignal): T {
  signal.throwIfAborted();
  const code = resposta.error?.code;
  if (resposta.error) {
    if (
      resposta.status === 401 ||
      resposta.status === 403 ||
      code === "42501" ||
      code === "PGRST301"
    )
      throw new ErroContestacao("sem_permissao");
    if (resposta.status === 409 || code === "PT409") throw new ErroContestacao("conflito");
    if (resposta.status === 400 || code === "PT400") throw new ErroContestacao("invalido");
    throw new ErroContestacao("erro");
  }
  const dados = schema.safeParse(resposta.data);
  if (!dados.success) throw new ErroContestacao("erro");
  return dados.data;
}

function quantidade(offset: number, total: number, limite: number) {
  return Math.max(0, Math.min(total - offset, limite));
}

export async function consultarContestacoes(
  ciclo: string,
  apontamento: string,
  offset: number,
  offsetFontes: number,
  signal: AbortSignal,
) {
  const dados = interpretar(
    painel,
    await cliente
      .rpc("obter_contestacoes_v2", {
        p_id_ciclo: ciclo,
        p_id_apontamento: apontamento,
        p_offset: offset,
        p_limite: TAMANHO_HISTORICO,
        p_offset_fontes: offsetFontes,
      })
      .abortSignal(signal),
    signal,
  );
  if (
    dados.id_ciclo !== ciclo ||
    dados.id_apontamento !== apontamento ||
    dados.offset !== offset ||
    dados.offset_fontes !== offsetFontes ||
    dados.contestacoes.length !== quantidade(offset, dados.total, TAMANHO_HISTORICO) ||
    dados.fontes.length !== quantidade(offsetFontes, dados.total_fontes, TAMANHO_FONTES) ||
    new Set(dados.contestacoes.map((c) => c.id)).size !== dados.contestacoes.length ||
    new Set(dados.fontes.map((f) => f.id)).size !== dados.fontes.length ||
    dados.contestacoes.some(
      (c, i) =>
        c.versao > dados.versao_atual ||
        (i > 0 && c.versao >= (dados.contestacoes[i - 1]?.versao ?? 0)) ||
        (c.revisar && (c.status_aprovacao !== "pendente" || c.versao !== dados.versao_atual)),
    )
  )
    throw new ErroContestacao("erro");
  return dados;
}

export async function consultarVinculosContestacao(
  dados: PainelContestacao,
  ciclo: CicloDiligencia,
  signal: AbortSignal,
) {
  const referencias = new Map<string, string>();
  for (const fonte of dados.fontes) referencias.set(fonte.id, fonte.hash);
  for (const linha of dados.contestacoes.flatMap((c) => c.mapa)) {
    if (
      referencias.has(linha.id_versao_documento) &&
      referencias.get(linha.id_versao_documento) !== linha.hash
    )
      throw new ErroContestacao("erro");
    referencias.set(linha.id_versao_documento, linha.hash);
  }
  const { versoes } = await consultarEvidenciasDiligencia(
    [...referencias.keys()],
    ciclo,
    null,
    signal,
  );
  return new Map(
    versoes.filter((v) => referencias.get(v.versaoId) === v.hash).map((v) => [v.versaoId, v]),
  );
}

export async function registrarContestacao(
  apontamento: string,
  acao: AcaoContestacao,
  chave: string,
  signal: AbortSignal,
) {
  const comum = { p_versao_esperada: acao.versao, p_chave: chave };
  if (acao.tipo === "minuta") {
    const dados = interpretar(
      reciboMinuta,
      await cliente
        .rpc("solicitar_minuta_contestacao_v2", {
          ...comum,
          p_id_apontamento: apontamento,
        })
        .abortSignal(signal),
      signal,
    );
    if (dados.id_apontamento !== apontamento || dados.versao_esperada !== acao.versao)
      throw new ErroContestacao("erro");
    return { tipo: acao.tipo, referencia: dados.id_execucao };
  }
  const resultado =
    acao.tipo === "submeter"
      ? await cliente
          .rpc("salvar_contestacao_v2", {
            ...comum,
            p_id_apontamento: apontamento,
            p_texto: acao.texto,
            p_fundamento: acao.fundamento,
            p_evidencias: acao.evidencias,
          })
          .abortSignal(signal)
      : await cliente
          .rpc("revisar_contestacao_v2", {
            ...comum,
            p_id_contestacao: acao.id,
            p_aprovar: acao.aprovar,
            p_fundamento: acao.fundamento,
          })
          .abortSignal(signal);
  const dados = interpretar(recibo, resultado, signal);
  const esperado =
    acao.tipo === "submeter"
      ? dados.versao === acao.versao + 1 && dados.status_aprovacao === "pendente"
      : dados.versao === acao.versao &&
        dados.id_contestacao === acao.id &&
        dados.status_aprovacao === (acao.aprovar ? "aprovada" : "rejeitada");
  if (dados.id_apontamento !== apontamento || !esperado) throw new ErroContestacao("erro");
  return { tipo: acao.tipo, referencia: dados.correlation_id };
}

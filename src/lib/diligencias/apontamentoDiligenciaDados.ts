import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico } from "@/lib/contratos/contratoDetalheDados";
import {
  consultarApresentacaoOriginal,
  consultarEvidenciasDiligencia,
  idDiligencia,
  sha256Diligencia,
} from "@/lib/diligencias/apontamentoEvidenciasDados";
import {
  CAMPOS_APONTAMENTO,
  consultarEscopoCicloDiligencia,
  lerApontamento,
  mesmoEscopo,
} from "@/lib/diligencias/cicloDiligenciaDados";
import {
  ErroDiligencias,
  erroLeituraDiligencia,
  instante,
  inteiro,
  registro,
  type CicloDiligencia,
} from "@/lib/diligencias/diligenciasDados";

export type LeituraApontamento<T> =
  { estado: "ok"; dados: T } | { estado: "sem_permissao" | "erro" };

export type FonteApontamento =
  | { estado: "ORIGEM_NAO_REGISTRADA" | "ORIGEM_INDISPONIVEL" }
  | {
      estado: "REGISTRADA";
      parecerId: string;
      arquivoId: string;
      apresentacaoId: string | null;
      nome: string;
      numero: string | null;
      sha256: string;
      pagina: number | null;
      trecho: string | null;
    };

type OrigemRpc = {
  rpc(
    nome: "obter_fonte_apontamento_contratante",
    args: { p_id_ciclo: string; p_id_apontamento: string },
  ): {
    abortSignal(signal: AbortSignal): PromiseLike<{
      data: unknown;
      error: { code?: string } | null;
      status: number;
    }>;
  };
};

const origemRpc = supabase as unknown as OrigemRpc;
const ESCOPO = "id,id_organizacao,id_contrato,id_competencia,id_apontamento";
const MAX_REGISTROS = 25;
const EVENTO_REVISAO = "SolucaoTarefaDiligenciaRevisada";

const textoNulo = (valor: unknown): valor is string | null =>
  valor === null || typeof valor === "string";

async function lerSecao<T>(
  consulta: Promise<T>,
  signal: AbortSignal,
): Promise<LeituraApontamento<T>> {
  try {
    const dados = await consulta;
    signal.throwIfAborted();
    return { estado: "ok", dados };
  } catch (erro) {
    signal.throwIfAborted();
    return {
      estado:
        erro instanceof ErroDiligencias && erro.tipo === "sem_permissao" ? "sem_permissao" : "erro",
    };
  }
}

function validarLinha(
  linha: unknown,
  ciclo: CicloDiligencia,
  id: string,
): Record<string, unknown> & { id: string } {
  if (
    !registro(linha) ||
    !idDiligencia(linha["id"]) ||
    !mesmoEscopo(linha, ciclo) ||
    linha["id_apontamento"] !== id
  )
    throw new ErroDiligencias("erro");
  return { ...linha, id: linha["id"] };
}

async function consultarFonte(
  ciclo: CicloDiligencia,
  id: string,
  signal: AbortSignal,
): Promise<FonteApontamento> {
  const resposta = await origemRpc
    .rpc("obter_fonte_apontamento_contratante", { p_id_ciclo: ciclo.id, p_id_apontamento: id })
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  const raw = resposta.data;
  if (
    !registro(raw) ||
    raw["id_apontamento"] !== id ||
    raw["id_ciclo"] !== ciclo.id ||
    !mesmoEscopo(raw, ciclo)
  )
    throw new ErroDiligencias("erro");

  if (
    (raw["estado"] === "ORIGEM_INDISPONIVEL" || raw["estado"] === "ORIGEM_NAO_REGISTRADA") &&
    raw["fonte"] === null
  )
    return { estado: raw["estado"] };
  const fonte = raw["fonte"];
  if (
    raw["estado"] !== "REGISTRADA" ||
    !registro(fonte) ||
    !idDiligencia(fonte["id_parecer"]) ||
    !idDiligencia(fonte["id_arquivo"]) ||
    !sha256Diligencia(fonte["arquivo_sha256"]) ||
    (fonte["id_apresentacao"] !== null && !idDiligencia(fonte["id_apresentacao"])) ||
    typeof fonte["nome_original"] !== "string" ||
    !textoNulo(fonte["numero_documento"]) ||
    !textoNulo(fonte["trecho"]) ||
    (fonte["pagina"] !== null && !inteiro(fonte["pagina"], 1))
  )
    throw new ErroDiligencias("erro");
  return {
    estado: raw["estado"],
    parecerId: fonte["id_parecer"],
    arquivoId: fonte["id_arquivo"],
    apresentacaoId: fonte["id_apresentacao"],
    nome: fonte["nome_original"],
    numero: fonte["numero_documento"],
    sha256: fonte["arquivo_sha256"].toLowerCase(),
    trecho: fonte["trecho"],
    pagina: fonte["pagina"],
  };
}

function versoesReferidas(evidencias: unknown): string[] {
  if (!Array.isArray(evidencias)) throw new ErroDiligencias("erro");
  return evidencias.flatMap((referencia) => {
    if (!registro(referencia)) throw new ErroDiligencias("erro");
    if (!Object.hasOwn(referencia, "id_versao_documento")) return [];
    if (!idDiligencia(referencia["id_versao_documento"])) throw new ErroDiligencias("erro");
    return [referencia["id_versao_documento"]];
  });
}

async function consultarAnalises(ciclo: CicloDiligencia, id: string, signal: AbortSignal) {
  const resposta = await supabase
    .from("analises_apontamentos")
    .select(ESCOPO + ",classificacao,fundamento,evidencias,criado_em")
    .eq("id_apontamento", id)
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(MAX_REGISTROS)
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
  return (resposta.data as unknown[]).map((item) => {
    const linha = validarLinha(item, ciclo, id);
    if (
      typeof linha["fundamento"] !== "string" ||
      typeof linha["classificacao"] !== "string" ||
      !instante(linha["criado_em"])
    )
      throw new ErroDiligencias("erro");
    return {
      id: linha.id,
      classificacao: linha["classificacao"],
      fundamento: linha["fundamento"],
      criadaEm: linha["criado_em"],
      versoes: versoesReferidas(linha["evidencias"]),
    };
  });
}

async function consultarTarefas(ciclo: CicloDiligencia, id: string, signal: AbortSignal) {
  const resposta = await supabase
    .from("tarefas_diligencia")
    .select(ESCOPO + ",id_ciclo,descricao,id_evidencia_versao_documento")
    .eq("id_apontamento", id)
    .eq("id_ciclo", ciclo.id)
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(MAX_REGISTROS)
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
  return (resposta.data as unknown[]).map((item) => {
    const linha = validarLinha(item, ciclo, id);
    if (
      linha["id_ciclo"] !== ciclo.id ||
      typeof linha["descricao"] !== "string" ||
      (linha["id_evidencia_versao_documento"] !== null &&
        !idDiligencia(linha["id_evidencia_versao_documento"]))
    )
      throw new ErroDiligencias("erro");
    return {
      id: linha.id,
      descricao: linha["descricao"],
      versaoId: linha["id_evidencia_versao_documento"],
    };
  });
}

async function consultarRevisoes(
  ciclo: CicloDiligencia,
  tarefas: Awaited<ReturnType<typeof consultarTarefas>>,
  signal: AbortSignal,
) {
  if (!tarefas.length) return [];
  const porId = new Map(tarefas.map((tarefa) => [tarefa.id, tarefa]));
  const resposta = await supabase
    .from("eventos_auditoria")
    .select("id,id_organizacao,id_usuario,id_entidade,entidade,evento,depois,criado_em")
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("entidade", "tarefas_diligencia")
    .eq("evento", EVENTO_REVISAO)
    .in("id_entidade", [...porId.keys()])
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(MAX_REGISTROS)
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
  return (resposta.data as unknown[]).map((linha) => {
    if (
      !registro(linha) ||
      !idDiligencia(linha["id"]) ||
      linha["id_organizacao"] !== ciclo.id_organizacao ||
      linha["evento"] !== EVENTO_REVISAO ||
      linha["entidade"] !== "tarefas_diligencia" ||
      !idDiligencia(linha["id_entidade"]) ||
      !idDiligencia(linha["id_usuario"]) ||
      !instante(linha["criado_em"]) ||
      !registro(linha["depois"]) ||
      linha["depois"]["revisor"] !== linha["id_usuario"] ||
      typeof linha["depois"]["aprovada"] !== "boolean" ||
      typeof linha["depois"]["fundamento"] !== "string"
    )
      throw new ErroDiligencias("erro");
    const tarefa = porId.get(linha["id_entidade"]);
    if (!tarefa) throw new ErroDiligencias("erro");
    return {
      id: linha["id"],
      tarefaId: tarefa.id,
      tarefa: tarefa.descricao,
      aprovada: linha["depois"]["aprovada"],
      fundamento: linha["depois"]["fundamento"],
      revisadaEm: linha["criado_em"],
    };
  });
}

async function consultarDesfechos(ciclo: CicloDiligencia, id: string, signal: AbortSignal) {
  const resposta = await supabase
    .from("desfechos_apontamentos")
    .select(ESCOPO + ",tipo_desfecho,texto,criado_em")
    .eq("id_apontamento", id)
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(MAX_REGISTROS)
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
  return (resposta.data as unknown[]).map((item) => {
    const linha = validarLinha(item, ciclo, id);
    if (
      typeof linha["tipo_desfecho"] !== "string" ||
      !instante(linha["criado_em"]) ||
      !textoNulo(linha["texto"])
    )
      throw new ErroDiligencias("erro");
    return {
      id: linha.id,
      tipo: linha["tipo_desfecho"],
      texto: linha["texto"],
      registradoEm: linha["criado_em"],
    };
  });
}

export async function consultarApontamentoDiligencia(
  cicloId: string,
  apontamentoId: string,
  organizacao: string,
  signal: AbortSignal,
) {
  if (!idDiligencia(apontamentoId)) throw new ErroDiligencias("invalido");
  const id = uuidCanonico(apontamentoId);
  const ciclo = await consultarEscopoCicloDiligencia(cicloId, organizacao, signal);
  const resposta = await supabase
    .from("apontamentos_contratante")
    .select(CAMPOS_APONTAMENTO + ",fundamento")
    .eq("id", id)
    .eq("id_ciclo", ciclo.id)
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .abortSignal(signal)
    .maybeSingle();
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (resposta.data === null) throw new ErroDiligencias("nao_encontrado");
  const linha: unknown = resposta.data;
  if (
    !registro(linha) ||
    linha["id"] !== id ||
    linha["id_ciclo"] !== ciclo.id ||
    !mesmoEscopo(linha, ciclo) ||
    !textoNulo(linha["fundamento"])
  )
    throw new ErroDiligencias("erro");

  const item = { ...lerApontamento(linha), fundamento: linha["fundamento"] };
  const [fonte, analises, tarefas, desfechos] = await Promise.all([
    lerSecao(consultarFonte(ciclo, id, signal), signal),
    lerSecao(consultarAnalises(ciclo, id, signal), signal),
    lerSecao(consultarTarefas(ciclo, id, signal), signal),
    lerSecao(consultarDesfechos(ciclo, id, signal), signal),
  ]);
  const origemId =
    fonte.estado === "ok" && fonte.dados.estado === "REGISTRADA"
      ? fonte.dados.apresentacaoId
      : null;
  const apresentacao = await lerSecao(
    consultarApresentacaoOriginal(origemId, ciclo, signal),
    signal,
  );
  const referencias = [
    ...(analises.estado === "ok" ? analises.dados.flatMap((v) => v.versoes) : []),
    ...(tarefas.estado === "ok"
      ? tarefas.dados.flatMap((v) => (v.versaoId ? [v.versaoId] : []))
      : []),
  ];
  const [evidencias, revisoes] = await Promise.all([
    lerSecao(
      consultarEvidenciasDiligencia(
        referencias,
        ciclo,
        apresentacao.estado === "ok" ? apresentacao.dados : null,
        signal,
      ),
      signal,
    ),
    tarefas.estado === "ok"
      ? lerSecao(consultarRevisoes(ciclo, tarefas.dados, signal), signal)
      : tarefas,
  ]);
  return { ciclo, item, fonte, apresentacao, analises, tarefas, evidencias, revisoes, desfechos };
}

export type DetalheApontamentoDiligencia = Awaited<
  ReturnType<typeof consultarApontamentoDiligencia>
>;

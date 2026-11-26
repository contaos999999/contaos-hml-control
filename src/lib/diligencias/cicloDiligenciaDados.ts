import { supabase } from "@/integrations/supabase/client";
import {
  classificarErroVisaoGeral,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  CAMPOS_CICLO_DILIGENCIA,
  ErroDiligencias,
  PAGINA_DILIGENCIAS,
  dataCalendario,
  erroLeituraDiligencia,
  instante,
  inteiro,
  lerCiclo,
  offsetDiligenciasValido,
  registro,
  type CicloDiligencia,
} from "@/lib/diligencias/diligenciasDados";

export const ROTULOS_APONTAMENTO = {
  aberto: "Aberto",
  em_analise: "Em análise",
  procedente: "Procedente",
  nao_procedente: "Não procedente",
  em_tratamento: "Em tratamento",
  resolvido: "Resolvido",
  contestado: "Contestado",
  contestado_aprovado: "Contestação aprovada",
  encerrado: "Encerrado",
} as const;

export const ROTULOS_SEVERIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
} as const;

type ParecerDaRodada = {
  id: string;
  numeroDocumento: string | null;
  recebidoEm: string;
  dataEmissao: string | null;
  resultado: string | null;
  apresentacaoId: string | null;
};

type ApontamentoDaRodada = {
  id: string;
  codigo: string | null;
  descricao: string;
  classificacao: string | null;
  situacao: keyof typeof ROTULOS_APONTAMENTO;
  severidade: keyof typeof ROTULOS_SEVERIDADE;
  valorQuestionado: string | null;
  glosaPotencial: string | null;
  valorAceito: string | null;
  impactoEstimado: string | null;
};

type Pagina<T> = { itens: T[]; total: number };

export type DetalheCicloDiligencia = {
  ciclo: CicloDiligencia;
  pareceres: Pagina<ParecerDaRodada>;
  apontamentos: Pagina<ApontamentoDaRodada>;
};

const CHAVES_RODADA = "id,id_ciclo,id_competencia,id_contrato,id_organizacao";
const CAMPOS_PARECER =
  CHAVES_RODADA +
  ",numero_documento,recebido_em,data_emissao,resultado_geral,id_apresentacao," +
  "apresentacao:apresentacoes_contratante!pareceres_contratante_id_apresentacao_fkey(id,id_competencia,id_contrato,id_organizacao)";
const CAMPOS_APONTAMENTO =
  CHAVES_RODADA +
  ",codigo,descricao,classificacao_sugerida,status,severidade,criado_em," +
  "valor_questionado::text,glosa_potencial::text,valor_aceito::text,impacto_financeiro_estimado::text";

const uuid = (v: unknown): v is string => typeof v === "string" && uuidValido(v);
const textoNulo = (v: unknown): v is string | null => v === null || typeof v === "string";
const valorExato = (v: unknown): v is string | null =>
  v === null || (typeof v === "string" && /^-?(0|[1-9]\d{0,15})\.\d{2}$/.test(v));

function chaveOficial<T extends object>(valores: T, v: unknown): v is keyof T {
  return typeof v === "string" && Object.hasOwn(valores, v);
}

function mesmoEscopo(valor: Record<string, unknown>, ciclo: CicloDiligencia) {
  return (
    valor["id_competencia"] === ciclo.id_competencia &&
    valor["id_contrato"] === ciclo.id_contrato &&
    valor["id_organizacao"] === ciclo.id_organizacao
  );
}

function lerParecer(dados: Record<string, unknown>, ciclo: CicloDiligencia): ParecerDaRodada {
  const {
    id,
    numero_documento,
    recebido_em,
    data_emissao,
    resultado_geral,
    id_apresentacao,
    apresentacao,
  } = dados;
  if (
    !uuid(id) ||
    !textoNulo(numero_documento) ||
    !instante(recebido_em) ||
    (data_emissao !== null && !dataCalendario(data_emissao)) ||
    !textoNulo(resultado_geral) ||
    (id_apresentacao !== null && !uuid(id_apresentacao))
  ) {
    throw new ErroDiligencias("erro");
  }
  if (
    apresentacao !== null &&
    (!registro(apresentacao) ||
      !uuid(id_apresentacao) ||
      apresentacao["id"] !== id_apresentacao ||
      !mesmoEscopo(apresentacao, ciclo))
  ) {
    throw new ErroDiligencias("erro");
  }
  return {
    id,
    numeroDocumento: numero_documento,
    recebidoEm: recebido_em,
    dataEmissao: data_emissao,
    resultado: resultado_geral,
    apresentacaoId: apresentacao === null ? null : id_apresentacao,
  };
}

function lerApontamento(dados: Record<string, unknown>): ApontamentoDaRodada {
  const {
    id,
    codigo,
    descricao,
    classificacao_sugerida,
    status,
    severidade,
    valor_questionado,
    glosa_potencial,
    valor_aceito,
    impacto_financeiro_estimado,
  } = dados;
  if (
    !uuid(id) ||
    typeof descricao !== "string" ||
    !textoNulo(codigo) ||
    !textoNulo(classificacao_sugerida) ||
    !chaveOficial(ROTULOS_APONTAMENTO, status) ||
    !chaveOficial(ROTULOS_SEVERIDADE, severidade) ||
    !valorExato(valor_questionado) ||
    !valorExato(glosa_potencial) ||
    !valorExato(valor_aceito) ||
    !valorExato(impacto_financeiro_estimado)
  ) {
    throw new ErroDiligencias("erro");
  }
  return {
    id,
    codigo,
    descricao,
    classificacao: classificacao_sugerida,
    situacao: status,
    severidade,
    valorQuestionado: valor_questionado,
    glosaPotencial: glosa_potencial,
    valorAceito: valor_aceito,
    impactoEstimado: impacto_financeiro_estimado,
  };
}

async function consultarPagina<T>(
  tabela: "pareceres_contratante" | "apontamentos_contratante",
  colunas: string,
  dataDaOrdem: "recebido_em" | "criado_em",
  ciclo: CicloDiligencia,
  offset: number,
  signal: AbortSignal,
  ler: (linha: Record<string, unknown>, ciclo: CicloDiligencia) => T,
): Promise<Pagina<T>> {
  const resposta = await supabase
    .from(tabela)
    .select(colunas, { count: "exact" })
    .eq("id_ciclo", ciclo.id)
    .eq("id_competencia", ciclo.id_competencia)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_organizacao", ciclo.id_organizacao)
    .order(dataDaOrdem, { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGINA_DILIGENCIAS - 1)
    .abortSignal(signal);

  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (
    !Array.isArray(resposta.data) ||
    !inteiro(resposta.count, 0) ||
    resposta.data.length !== Math.min(PAGINA_DILIGENCIAS, Math.max(0, resposta.count - offset))
  ) {
    throw new ErroDiligencias("erro");
  }

  const ids = new Set<string>();
  let anterior: { id: string; data: string } | undefined;
  const itens = (resposta.data as unknown[]).map((linha) => {
    if (!registro(linha) || !mesmoEscopo(linha, ciclo) || linha["id_ciclo"] !== ciclo.id) {
      throw new ErroDiligencias("erro");
    }
    const id = linha["id"];
    const data = linha[dataDaOrdem];
    if (
      !uuid(id) ||
      !instante(data) ||
      ids.has(id) ||
      (anterior &&
        (Date.parse(anterior.data) < Date.parse(data) ||
          (anterior.data === data && anterior.id <= id)))
    ) {
      throw new ErroDiligencias("erro");
    }
    ids.add(id);
    anterior = { id, data };
    return ler(linha, ciclo);
  });
  return { itens, total: resposta.count };
}

export async function consultarCicloDiligencia(
  id: string,
  organizacao: string,
  offsets: { pareceres: number; apontamentos: number },
  signal: AbortSignal,
): Promise<DetalheCicloDiligencia> {
  if (
    !uuid(id) ||
    !uuid(organizacao) ||
    !offsetDiligenciasValido(offsets.pareceres) ||
    !offsetDiligenciasValido(offsets.apontamentos)
  )
    throw new ErroDiligencias("invalido");

  signal.throwIfAborted();
  const cicloId = uuidCanonico(id);
  const orgId = uuidCanonico(organizacao);
  const resposta = await supabase
    .from("ciclos_diligencia")
    .select(CAMPOS_CICLO_DILIGENCIA)
    .eq("id", cicloId)
    .eq("id_organizacao", orgId)
    .abortSignal(signal)
    .maybeSingle();
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (resposta.data === null) throw new ErroDiligencias("nao_encontrado");

  const raw: unknown = resposta.data;
  if (
    !registro(raw) ||
    raw["id"] !== cicloId ||
    !uuid(raw["id_competencia"]) ||
    !uuid(raw["id_contrato"])
  )
    throw new ErroDiligencias("erro");
  if (raw["id_organizacao"] !== orgId) throw new ErroDiligencias("sem_permissao");
  const ciclo = lerCiclo(raw, raw["id_competencia"], orgId, raw["id_contrato"]);

  const visao = await obterVisaoGeral(ciclo.id_competencia, signal);
  signal.throwIfAborted();
  if (visao.error) {
    const tipo = classificarErroVisaoGeral(visao.error, visao.status);
    throw new ErroDiligencias(tipo === "nao_encontrada" ? "nao_encontrado" : tipo);
  }
  if (visao.data === null) throw new ErroDiligencias("nao_encontrado");
  const vg = parseVisaoGeral(visao.data);
  if (!vg) throw new ErroDiligencias("erro");
  const comp = vg.competencia;
  if (
    comp.id !== ciclo.id_competencia ||
    comp.id_contrato !== ciclo.id_contrato ||
    comp.id_organizacao !== orgId
  )
    throw new ErroDiligencias("sem_permissao");

  const [pareceres, apontamentos] = await Promise.all([
    consultarPagina(
      "pareceres_contratante",
      CAMPOS_PARECER,
      "recebido_em",
      ciclo,
      offsets.pareceres,
      signal,
      lerParecer,
    ),
    consultarPagina(
      "apontamentos_contratante",
      CAMPOS_APONTAMENTO,
      "criado_em",
      ciclo,
      offsets.apontamentos,
      signal,
      lerApontamento,
    ),
  ]);
  signal.throwIfAborted();
  return { ciclo, pareceres, apontamentos };
}

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarValorDiligencia(valor: string | null): string {
  if (valor === null) return "Não informado";
  const inteira = valor.slice(0, -3);
  const centavos = valor.slice(-2);
  const unidades = BigInt(inteira);
  const numero = unidades === 0n && inteira.startsWith("-") ? -0 : unidades;
  return reais
    .formatToParts(numero)
    .map((p) => (p.type === "fraction" ? centavos : p.value))
    .join("");
}

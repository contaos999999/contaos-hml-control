import { supabase } from "@/integrations/supabase/client";
import { uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { mesmoEscopo } from "@/lib/diligencias/cicloDiligenciaDados";
import {
  ErroDiligencias,
  erroLeituraDiligencia,
  instante,
  inteiro,
  registro,
  type CicloDiligencia,
} from "@/lib/diligencias/diligenciasDados";

export type ApresentacaoOriginal = { id: string; pacoteId: string; congeladoEm: string };
export type EvidenciaDiligencia = {
  versaoId: string;
  numero: number;
  hash: string;
  documentoId: string;
  titulo: string;
  tipo: "contrato" | "competencia";
  pacote: "incluida" | "posterior" | "fora" | "indisponivel";
};

const ESCOPO = "id,id_competencia,id_organizacao,id_contrato";
const CAMPOS_VERSAO =
  "id,id_organizacao,id_contrato,id_documento_contrato,id_documento_competencia,numero_versao,hash,criado_em," +
  "documentoContrato:documentos_contrato!versoes_documento_id_documento_contrato_fkey(id,id_contrato,id_organizacao,titulo)," +
  "documentoCompetencia:documentos_competencia!versoes_documento_id_documento_competencia_fkey(id,id_competencia,id_contrato,id_organizacao,titulo)";

export function idDiligencia(valor: unknown): valor is string {
  return typeof valor === "string" && uuidValido(valor);
}

export function sha256Diligencia(valor: unknown): valor is string {
  return typeof valor === "string" && /^[a-f0-9]{64}$/i.test(valor);
}

export async function consultarApresentacaoOriginal(
  id: string | null,
  ciclo: CicloDiligencia,
  signal: AbortSignal,
): Promise<ApresentacaoOriginal | null> {
  if (id === null) return null;
  const resposta = await supabase
    .from("apresentacoes_contratante")
    .select(ESCOPO + ",id_pacote")
    .eq("id", id)
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .abortSignal(signal)
    .maybeSingle();
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (resposta.data === null) return null;
  const raw: unknown = resposta.data;
  if (
    !registro(raw) ||
    raw["id"] !== id ||
    !mesmoEscopo(raw, ciclo) ||
    !idDiligencia(raw["id_pacote"])
  )
    throw new ErroDiligencias("erro");

  const pacote = await supabase
    .from("pacotes_competencia")
    .select(ESCOPO + ",hash_pacote,congelado_em,status")
    .eq("id", raw["id_pacote"])
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .abortSignal(signal)
    .maybeSingle();
  signal.throwIfAborted();
  if (pacote.error) throw erroLeituraDiligencia(pacote.status, pacote.error.code);
  if (pacote.data === null) return null;
  const congelado: unknown = pacote.data;
  if (
    !registro(congelado) ||
    congelado["id"] !== raw["id_pacote"] ||
    !mesmoEscopo(congelado, ciclo) ||
    !sha256Diligencia(congelado["hash_pacote"]) ||
    !instante(congelado["congelado_em"]) ||
    !["congelado", "apresentado", "substituido"].includes(String(congelado["status"]))
  )
    throw new ErroDiligencias("erro");
  return { id, pacoteId: raw["id_pacote"], congeladoEm: congelado["congelado_em"] };
}

type ItemCongelado = { versao: string; documento: string; hash: string };

async function lerItensCongelados(
  ids: string[],
  apresentacao: ApresentacaoOriginal,
  ciclo: CicloDiligencia,
  signal: AbortSignal,
): Promise<ItemCongelado[]> {
  const resposta = await supabase
    .from("itens_pacote_competencia")
    .select(ESCOPO + ",id_pacote,entidade_id,entidade_tipo,versao_id,hash")
    .eq("id_pacote", apresentacao.pacoteId)
    .eq("entidade_tipo", "documento_competencia")
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .in("versao_id", ids)
    .abortSignal(signal);
  signal.throwIfAborted();
  if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
  if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
  return (resposta.data as unknown[]).map((item) => {
    if (
      !registro(item) ||
      !mesmoEscopo(item, ciclo) ||
      item["id_pacote"] !== apresentacao.pacoteId ||
      item["entidade_tipo"] !== "documento_competencia" ||
      !idDiligencia(item["entidade_id"]) ||
      !idDiligencia(item["versao_id"]) ||
      !ids.includes(item["versao_id"]) ||
      !sha256Diligencia(item["hash"])
    )
      throw new ErroDiligencias("erro");
    return {
      versao: item["versao_id"],
      documento: item["entidade_id"],
      hash: item["hash"].toLowerCase(),
    };
  });
}

function lerVersao(
  linha: Record<string, unknown>,
  ids: string[],
  ciclo: CicloDiligencia,
  apresentacao: ApresentacaoOriginal | null,
  itens: ItemCongelado[],
): EvidenciaDiligencia | null {
  if (
    !idDiligencia(linha["id"]) ||
    !ids.includes(linha["id"]) ||
    linha["id_organizacao"] !== ciclo.id_organizacao ||
    linha["id_contrato"] !== ciclo.id_contrato ||
    !inteiro(linha["numero_versao"], 1) ||
    !sha256Diligencia(linha["hash"]) ||
    !instante(linha["criado_em"])
  )
    throw new ErroDiligencias("erro");

  const competencia = linha["id_documento_competencia"] !== null;
  const documentoId = competencia
    ? linha["id_documento_competencia"]
    : linha["id_documento_contrato"];
  const documento = competencia ? linha["documentoCompetencia"] : linha["documentoContrato"];
  if (documento === null) return null;
  if (
    !idDiligencia(documentoId) ||
    !registro(documento) ||
    documento["id"] !== documentoId ||
    documento["id_contrato"] !== ciclo.id_contrato ||
    documento["id_organizacao"] !== ciclo.id_organizacao ||
    typeof documento["titulo"] !== "string"
  )
    throw new ErroDiligencias("erro");
  if (competencia && documento["id_competencia"] !== ciclo.id_competencia) return null;

  const hash = linha["hash"].toLowerCase();
  const provas = itens.filter((item) => item.versao === linha["id"]);
  let pacote: EvidenciaDiligencia["pacote"] = "indisponivel";
  if (provas.length) {
    if (
      !competencia ||
      provas.some((prova) => prova.documento !== documentoId || prova.hash !== hash)
    )
      throw new ErroDiligencias("erro");
    pacote = "incluida";
  } else if (apresentacao && competencia) {
    pacote =
      Date.parse(linha["criado_em"]) > Date.parse(apresentacao.congeladoEm) ? "posterior" : "fora";
  }
  return {
    versaoId: linha["id"],
    numero: linha["numero_versao"],
    documentoId,
    titulo: documento["titulo"],
    tipo: competencia ? "competencia" : "contrato",
    pacote,
    hash,
  };
}

export async function consultarEvidenciasDiligencia(
  ids: string[],
  ciclo: CicloDiligencia,
  apresentacao: ApresentacaoOriginal | null,
  signal: AbortSignal,
): Promise<{ versoes: EvidenciaDiligencia[]; indisponiveis: number }> {
  const versoes: EvidenciaDiligencia[] = [];
  const unicos = [...new Set(ids)].sort();
  for (let i = 0; i < unicos.length; i += 25) {
    const lote = unicos.slice(i, i + 25);
    const [resposta, itens] = await Promise.all([
      supabase
        .from("versoes_documento")
        .select(CAMPOS_VERSAO)
        .eq("id_organizacao", ciclo.id_organizacao)
        .eq("id_contrato", ciclo.id_contrato)
        .in("id", lote)
        .abortSignal(signal),
      apresentacao ? lerItensCongelados(lote, apresentacao, ciclo, signal) : [],
    ]);
    signal.throwIfAborted();
    if (resposta.error) throw erroLeituraDiligencia(resposta.status, resposta.error.code);
    if (!Array.isArray(resposta.data)) throw new ErroDiligencias("erro");
    const vistas = new Set<unknown>();
    for (const linha of resposta.data as unknown[]) {
      if (!registro(linha) || vistas.has(linha["id"])) throw new ErroDiligencias("erro");
      vistas.add(linha["id"]);
      const versao = lerVersao(linha, lote, ciclo, apresentacao, itens);
      if (versao) versoes.push(versao);
    }
  }
  return { versoes, indisponiveis: unicos.length - versoes.length };
}

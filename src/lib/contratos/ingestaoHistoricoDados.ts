/** PROMPT 43 / V1-22. Orquestração cliente, sem permissão local substituindo RPC/RLS. */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export const TIPOS_RELATORIO_HISTORICO = [
  { codigo: "relatorio_contratante", rotulo: "Relatório do contratante" },
  { codigo: "parecer_contratante", rotulo: "Parecer do contratante" },
  { codigo: "resposta_contratante", rotulo: "Resposta ao contratante" },
  { codigo: "outro", rotulo: "Outro documento histórico" },
] as const;
export type TipoRelatorioHistorico = typeof TIPOS_RELATORIO_HISTORICO[number]["codigo"];
export class ErroIngestaoHistorico extends Error {
  constructor(public readonly tipo: "negado" | "validacao" | "nao_encontrado" | "inconsistente" | "erro") {
    super(tipo); this.name = "ErroIngestaoHistorico";
  }
}
const UUID = (id: string) => {
  if (!uuidValido(id)) throw new ErroIngestaoHistorico("validacao");
  return uuidCanonico(id);
};
export function competenciaPrimeiroDia(competencia: string): string {
  if (!/^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])$/.test(competencia))
    throw new ErroIngestaoHistorico("validacao");
  return `${competencia}-01`;
}
export function podeFinalizarIngestao(statusSeguranca: string, statusDocumento: string): boolean {
  return statusSeguranca === "aprovado" && statusDocumento === "concluido";
}
export function validarItemHistorico(
  v: { id_organizacao: string; id_contrato: string; id_arquivo: string; id_versao: string },
  org: string, contrato: string, arquivo: string, versao: string,
): boolean {
  return [v.id_organizacao, v.id_contrato, v.id_arquivo, v.id_versao].every(uuidValido)
    && v.id_organizacao.toLowerCase() === org.toLowerCase()
    && v.id_contrato.toLowerCase() === contrato.toLowerCase()
    && v.id_arquivo.toLowerCase() === arquivo.toLowerCase()
    && v.id_versao.toLowerCase() === versao.toLowerCase();
}
export function mensagemErroIngestao(e: unknown): string {
  if (e instanceof ErroIngestaoHistorico) {
    return ({
      negado: "Você não possui permissão para importar documentos deste contrato.",
      validacao: "Revise as informações do documento e tente novamente.",
      nao_encontrado: "Documento ou contrato não encontrado. Recarregue e tente novamente.",
      inconsistente: "Os dados não pertencem ao contrato selecionado. Operação interrompida.",
      erro: "Não foi possível concluir esta etapa. Atualize e tente novamente.",
    })[e.tipo];
  }
  const codigo = e && typeof e === "object" && "code" in e ? String(e.code) : "";
  if (codigo === "42501" || codigo === "PT403" || codigo === "PGRST301")
    return "Você não possui permissão para realizar esta operação.";
  if (codigo === "PT404" || codigo === "PGRST116") return "Documento não encontrado. Atualize e tente novamente.";
  if (codigo === "PT400" || codigo === "22023") return "Revise os dados informados e tente novamente.";
  if (codigo === "PT409" || codigo === "23505")
    return "Já existe um registro para este arquivo ou a operação mudou de estado. Atualize antes de continuar.";
  return "Não foi possível concluir esta etapa. Atualize e tente novamente.";
}
async function rpcHistorico(nome: string, parametros: Record<string, unknown>): Promise<unknown> {
  let r: { data: unknown; error: unknown; status: number };
  try {
    r = await supabase.rpc(nome as never, parametros as never);
  } catch {
    throw new ErroIngestaoHistorico("erro");
  }
  if (r.error) throw new ErroIngestaoHistorico(
    r.status === 401 || r.status === 403 || (r.error as {code?:string}).code === "42501" ? "negado" :
    (r.error as {code?:string}).code === "PT404" ? "nao_encontrado" :
    (r.error as {code?:string}).code === "PT400" ? "validacao" : "erro",
  );
  return r.data;
}
export async function registrarRelatorioHistorico(
  idArquivo: string, competencia: string, tipo: TipoRelatorioHistorico,
): Promise<string> {
  const id = UUID(idArquivo);
  if (!TIPOS_RELATORIO_HISTORICO.some(x => x.codigo === tipo)) throw new ErroIngestaoHistorico("validacao");
  const resultado = await rpcHistorico("registrar_relatorio_historico_hml", {
    p_id_arquivo: id, p_competencia: competenciaPrimeiroDia(competencia), p_tipo: tipo,
  });
  if (typeof resultado !== "string" || !uuidValido(resultado))
    throw new ErroIngestaoHistorico("inconsistente");
  return uuidCanonico(resultado);
}
export async function enfileirarRelatorioHistorico(relatorio: string, versao: string): Promise<string> {
  const resultado = await rpcHistorico("enfileirar_ingestao_historica_hml", {
    p_id_relatorio: UUID(relatorio), p_id_versao_documento: UUID(versao),
  });
  if (typeof resultado !== "string" || !uuidValido(resultado))
    throw new ErroIngestaoHistorico("inconsistente");
  return uuidCanonico(resultado);
}
export async function vincularTratamentoHistorico(
  apontamento: string, resposta: string, desfecho: string, fundamento: string,
): Promise<{ id_resposta: string | null; id_desfecho: string | null }> {
  const id = UUID(apontamento);
  if (!resposta.trim() && !desfecho.trim()) throw new ErroIngestaoHistorico("validacao");
  const ret = await rpcHistorico("vincular_tratamento_historico_hml", {
    p_id_apontamento: id,
    p_resposta: resposta.trim() || null,
    p_desfecho: desfecho.trim() || null,
    p_fundamento: fundamento.trim() || null,
  });
  if (!ret || typeof ret !== "object" || !("id_resposta" in ret) || !("id_desfecho" in ret))
    throw new ErroIngestaoHistorico("inconsistente");
  const r = ret as {id_resposta: unknown; id_desfecho: unknown};
  if (![r.id_resposta,r.id_desfecho].every(x => x === null || (typeof x === "string" && uuidValido(x))))
    throw new ErroIngestaoHistorico("inconsistente");
  return {id_resposta: r.id_resposta as string|null,id_desfecho:r.id_desfecho as string|null};
}
export type EstadoDocumentoHistorico = {
  seguranca: string;
  processamento: string;
};
/** O backend/RLS segue autoritativo; SELECT duplamente escopado evita dados stale. */
export async function consultarEstadoDocumentoHistorico(
  org: string, contrato: string, arquivo: string, versao: string, signal: AbortSignal,
): Promise<EstadoDocumentoHistorico> {
  const o=UUID(org), c=UUID(contrato), a=UUID(arquivo), v=UUID(versao);
  if (signal.aborted) throw new DOMException("Cancelado","AbortError");
  const [ra,rv,rp] = await Promise.all([
    supabase.from("arquivos").select("id,id_organizacao,id_contrato,status_seguranca")
      .eq("id",a).eq("id_organizacao",o).eq("id_contrato",c).abortSignal(signal).maybeSingle(),
    supabase.from("versoes_documento").select("id,id_organizacao,id_contrato,id_arquivo")
      .eq("id",v).eq("id_organizacao",o).eq("id_contrato",c).abortSignal(signal).maybeSingle(),
    supabase.from("processamentos_documento").select("id,id_organizacao,id_contrato,id_versao_documento,status,criado_em")
      .eq("id_versao_documento",v).eq("id_organizacao",o).eq("id_contrato",c)
      .order("criado_em",{ascending:false}).order("id",{ascending:false}).limit(1).abortSignal(signal).maybeSingle(),
  ]);
  if (signal.aborted) throw new DOMException("Cancelado","AbortError");
  if (ra.error || rv.error || rp.error) {
    const code = String(ra.error?.code ?? rv.error?.code ?? rp.error?.code ?? "");
    throw new ErroIngestaoHistorico(code === "42501" ? "negado":"erro");
  }
  if (!ra.data || !rv.data ||
      !validarItemHistorico({...rv.data,id_versao:rv.data.id},o,c,a,v) ||
      ra.data.id_organizacao !== o || ra.data.id_contrato !== c || ra.data.id !== a)
    throw new ErroIngestaoHistorico("inconsistente");
  if (rp.data && (rp.data.id_organizacao !== o || rp.data.id_contrato !== c || rp.data.id_versao_documento !== v))
    throw new ErroIngestaoHistorico("inconsistente");
  return { seguranca: ra.data.status_seguranca, processamento:rp.data?.status ?? "pendente" };
}

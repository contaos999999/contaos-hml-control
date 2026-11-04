/** PROMPT 42 / V1-21: histórico somente leitura, tipado e escopado. */
import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export const PAGINA_HISTORICO = 25;
export type TipoErroHistorico = "negado" | "nao_encontrado" | "invalido" | "inconsistente" | "erro";
export class ErroHistorico extends Error {
  constructor(public tipo: TipoErroHistorico) {
    super(tipo);
    this.name = "ErroHistorico";
  }
}
export function classificarErroHistorico(error: unknown, status?: number): TipoErroHistorico {
  const code =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301") return "negado";
  if (status === 404 || code === "PGRST116") return "nao_encontrado";
  return "erro";
}
export const MENSAGENS_HISTORICO: Record<TipoErroHistorico, string> = {
  negado: "Você não possui permissão para consultar o histórico deste contrato.",
  nao_encontrado: "Histórico não encontrado ou indisponível.",
  invalido: "Os dados de navegação informados não são válidos.",
  inconsistente: "Não foi possível confirmar o vínculo dos registros históricos. Tente novamente.",
  erro: "Não foi possível consultar o histórico agora. Atualize e tente novamente.",
};
export type RelatorioHistorico = {
  id: string; id_contrato: string; id_organizacao: string; id_arquivo: string;
  numero_documento: string | null; tipo: string; competencia_referencia: string | null;
  data_documento: string | null; status_processamento: string; resultado_geral: string | null;
  origem_temporal: string; criado_em: string;
};
export type ApontamentoHistorico = {
  id: string; id_relatorio: string; id_contrato: string; id_organizacao: string;
  item: string | null; problema: string; severidade: string | null;
  fonte_pagina: number | null; fundamento: string | null; criado_em: string;
};
export type RespostaHistorica = {
  id: string; id_apontamento: string; id_contrato: string; id_organizacao: string;
  texto: string; criado_em: string;
};
export type DesfechoHistorico = {
  id: string; id_apontamento: string; id_contrato: string; id_organizacao: string;
  resultado: string; data: string | null; criado_em: string;
};
export type ApontamentoVinculado = ApontamentoHistorico & {
  respostas: RespostaHistorica[]; desfechos: DesfechoHistorico[];
};
export type PrecedenteHistorico = {
  id: string; id_organizacao: string; id_contrato_origem: string;
  id_apontamento_historico: string | null; fonte_tipo: string; titulo: string | null;
  problema: string; solucao: string | null; desfecho: string | null; status: string;
  criado_em: string;
};
export type RegraHistorica = {
  id: string; id_organizacao: string; id_contrato: string; codigo_regra: string;
  descricao: string; efeito: string; situacao: string; criado_em: string;
};
export type PaginaHistorico<T> = { itens: T[]; total: number; offset: number };
type Linha = Record<string, unknown>;
const obj = (v: unknown): v is Linha => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown): v is string => typeof v === "string";
const textoOuNulo = (v: unknown) => v === null || texto(v);
function validarContexto(contrato: string, org: string, offset: number, signal: AbortSignal) {
  if (!uuidValido(contrato) || !uuidValido(org) || !Number.isSafeInteger(offset) ||
      offset < 0 || offset % PAGINA_HISTORICO !== 0) throw new ErroHistorico("invalido");
  if (signal.aborted) throw new DOMException("Consulta cancelada.", "AbortError");
  return { c: uuidCanonico(contrato), o: uuidCanonico(org) };
}
function validarId(id: string) {
  if (!uuidValido(id)) throw new ErroHistorico("invalido");
  return uuidCanonico(id);
}
function escopo(row: Linha, c: string, o: string) {
  if (row.id_contrato !== c || row.id_organizacao !== o || !texto(row.id) ||
      !uuidValido(row.id)) throw new ErroHistorico("inconsistente");
}
function garantirResposta(
  r: { data: unknown; count?: number | null; error: unknown; status: number },
  c: string, o: string, offset: number, parse: (v: Linha, c: string, o: string) => unknown,
) {
  if (r.error) throw new ErroHistorico(classificarErroHistorico(r.error, r.status));
  if (!Array.isArray(r.data) || !Number.isSafeInteger(r.count) || r.count === null ||
      r.count === undefined || r.count < 0 || r.data.length > PAGINA_HISTORICO)
    throw new ErroHistorico("inconsistente");
  const itens = r.data.map((v: unknown) => {
    if (!obj(v)) throw new ErroHistorico("inconsistente");
    return parse(v, c, o);
  });
  return { itens, total: r.count, offset };
}
const COL_REL =
  "id,id_contrato,id_organizacao,id_arquivo,numero_documento,tipo,competencia_referencia,data_documento,status_processamento,resultado_geral,origem_temporal,criado_em";
const COL_APO =
  "id,id_relatorio,id_contrato,id_organizacao,item,problema,severidade,fonte_pagina,fundamento,criado_em";
const COL_RES = "id,id_apontamento,id_contrato,id_organizacao,texto,criado_em";
const COL_DES = "id,id_apontamento,id_contrato,id_organizacao,resultado,data,criado_em";
const COL_PRE =
  "id,id_organizacao,id_contrato_origem,id_apontamento_historico,fonte_tipo,titulo,problema,solucao,desfecho,status,criado_em";
const COL_REG = "id,id_organizacao,id_contrato,codigo_regra,descricao,efeito,situacao,criado_em";
function parseRel(v: Linha, c: string, o: string): RelatorioHistorico {
  escopo(v, c, o);
  if (!texto(v.id_arquivo) || !uuidValido(v.id_arquivo) ||
      !textoOuNulo(v.numero_documento) || !texto(v.tipo) ||
      !textoOuNulo(v.competencia_referencia) || !textoOuNulo(v.data_documento) ||
      !texto(v.status_processamento) || !textoOuNulo(v.resultado_geral) ||
      !texto(v.origem_temporal) || !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as RelatorioHistorico;
}
function parseApo(v: Linha, c: string, o: string, idRelatorio: string): ApontamentoHistorico {
  escopo(v, c, o);
  if (v.id_relatorio !== idRelatorio || !texto(v.problema) || !textoOuNulo(v.item) ||
      !textoOuNulo(v.severidade) ||
      !(v.fonte_pagina === null || (typeof v.fonte_pagina === "number" && Number.isInteger(v.fonte_pagina) && v.fonte_pagina > 0)) ||
      !textoOuNulo(v.fundamento) || !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as ApontamentoHistorico;
}
function parseResposta(v: Linha, c: string, o: string, ids: Set<string>): RespostaHistorica {
  escopo(v, c, o);
  if (!texto(v.id_apontamento) || !ids.has(v.id_apontamento) ||
      !texto(v.texto) || !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as RespostaHistorica;
}
function parseDesfecho(v: Linha, c: string, o: string, ids: Set<string>): DesfechoHistorico {
  escopo(v, c, o);
  if (!texto(v.id_apontamento) || !ids.has(v.id_apontamento) ||
      !texto(v.resultado) || !textoOuNulo(v.data) ||
      !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as DesfechoHistorico;
}
function parsePre(v: Linha, c: string, o: string): PrecedenteHistorico {
  if (v.id_contrato_origem !== c || v.id_organizacao !== o ||
      !texto(v.id) || !uuidValido(v.id) || !texto(v.fonte_tipo) ||
      !textoOuNulo(v.titulo) || !texto(v.problema) ||
      !textoOuNulo(v.solucao) || !textoOuNulo(v.desfecho) ||
      !texto(v.status) || !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as PrecedenteHistorico;
}
function parseReg(v: Linha, c: string, o: string): RegraHistorica {
  escopo(v, c, o);
  if (!texto(v.codigo_regra) || !texto(v.descricao) || !texto(v.efeito) ||
      !texto(v.situacao) || !texto(v.criado_em)) throw new ErroHistorico("inconsistente");
  return v as RegraHistorica;
}
function validarArray(r: { data: unknown; error: unknown; status: number }, c: string,
  o: string, ids: Set<string>, parser: (v: Linha, c: string, o: string, ids: Set<string>) => unknown) {
  if (r.error) throw new ErroHistorico(classificarErroHistorico(r.error, r.status));
  if (!Array.isArray(r.data) || r.data.length > 100) throw new ErroHistorico("inconsistente");
  return r.data.map((v: unknown) => {
    if (!obj(v)) throw new ErroHistorico("inconsistente");
    return parser(v, c, o, ids);
  });
}
export async function listarRelatoriosHistoricos(
  contrato: string, org: string, offset: number, signal: AbortSignal,
): Promise<PaginaHistorico<RelatorioHistorico>> {
  const { c, o } = validarContexto(contrato, org, offset, signal);
  const r = await supabase.from("relatorios_historicos_contratante")
    .select(COL_REL, { count: "exact" }).eq("id_contrato", c).eq("id_organizacao", o)
    .order("criado_em", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_HISTORICO - 1).abortSignal(signal);
  const p = garantirResposta(r, c, o, offset, parseRel);
  return { ...p, itens: p.itens as RelatorioHistorico[] };
}
export async function listarApontamentosVinculados(
  contrato: string, org: string, relatorio: string, offset: number, signal: AbortSignal,
): Promise<PaginaHistorico<ApontamentoVinculado>> {
  const { c, o } = validarContexto(contrato, org, offset, signal);
  const idRelatorio = validarId(relatorio);
  const r = await supabase.from("apontamentos_historicos").select(COL_APO, { count: "exact" })
    .eq("id_contrato", c).eq("id_organizacao", o).eq("id_relatorio", idRelatorio)
    .order("criado_em", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_HISTORICO - 1).abortSignal(signal);
  const page = garantirResposta(r, c, o, offset, (v, con, orgId) => parseApo(v, con, orgId, idRelatorio));
  const a = page.itens as ApontamentoHistorico[];
  if (!a.length) return { itens: [], total: page.total, offset };
  const ids = new Set(a.map(x => x.id));
  const keys = [...ids];
  const [resp, dest] = await Promise.all([
    supabase.from("respostas_historicas").select(COL_RES)
      .eq("id_contrato", c).eq("id_organizacao", o)
      .in("id_apontamento", keys).order("criado_em", { ascending: true }).abortSignal(signal),
    supabase.from("desfechos_historicos").select(COL_DES)
      .eq("id_contrato", c).eq("id_organizacao", o)
      .in("id_apontamento", keys).order("criado_em", { ascending: true }).abortSignal(signal),
  ]);
  const respostas = validarArray(resp, c, o, ids, parseResposta) as RespostaHistorica[];
  const desfechos = validarArray(dest, c, o, ids, parseDesfecho) as DesfechoHistorico[];
  return {
    total: page.total, offset,
    itens: a.map(item => ({
      ...item,
      respostas: respostas.filter(x => x.id_apontamento === item.id),
      desfechos: desfechos.filter(x => x.id_apontamento === item.id),
    })),
  };
}
export async function listarPrecedentesHistoricos(
  contrato: string, org: string, offset: number, signal: AbortSignal,
): Promise<PaginaHistorico<PrecedenteHistorico>> {
  const { c, o } = validarContexto(contrato, org, offset, signal);
  const r = await supabase.from("precedentes").select(COL_PRE, { count: "exact" })
    .eq("id_contrato_origem", c).eq("id_organizacao", o)
    .order("criado_em", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_HISTORICO - 1).abortSignal(signal);
  const p = garantirResposta(r, c, o, offset, parsePre);
  return { ...p, itens: p.itens as PrecedenteHistorico[] };
}
export async function listarRegrasHistoricas(
  contrato: string, org: string, offset: number, signal: AbortSignal,
): Promise<PaginaHistorico<RegraHistorica>> {
  const { c, o } = validarContexto(contrato, org, offset, signal);
  const r = await supabase.from("regras_preventivas").select(COL_REG, { count: "exact" })
    .eq("id_contrato", c).eq("id_organizacao", o)
    .order("criado_em", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGINA_HISTORICO - 1).abortSignal(signal);
  const p = garantirResposta(r, c, o, offset, parseReg);
  return { ...p, itens: p.itens as RegraHistorica[] };
}

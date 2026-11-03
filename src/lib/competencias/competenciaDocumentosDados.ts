/**
 * V1-15 — Competência: documentos.
 * Adapter local tipado para as RPCs certificadas `*_v115` (ausentes do client gerado;
 * types.ts intocado). Estado documental, paginação e capacidades vêm somente do backend.
 * Upload/download reutilizam o pipeline certificado V1-10 (`documentosDados`).
 */
import { supabase } from "@/integrations/supabase/client";
import {
  PAGINA_DOCS,
  TIPOS_DOCUMENTO,
  ROTULO_TIPO,
  lerRetornoDocumento,
  type RetornoDocumento,
} from "@/lib/contratos/documentosDados";

type RespostaRpc = { data: unknown; error: unknown; status?: number };
type ArgsV115 = {
  obter_documentos_competencia_v115: {
    p_id_competencia: string;
    p_documentos_offset: number;
    p_documentos_limite: number;
    p_requisitos_offset: number;
    p_requisitos_limite: number;
  };
  criar_documento_competencia_v115: {
    p_id_competencia: string;
    p_tipo: string;
    p_titulo: string;
    p_categoria: string | null;
    p_id_requisito: string | null;
    p_id_arquivo: string;
    p_chave_idempotencia: string;
  };
  adicionar_versao_documento_competencia_v115: {
    p_id_documento: string;
    p_id_arquivo: string;
    p_motivo: string | null;
    p_chave_idempotencia: string;
  };
};
type Consulta = PromiseLike<RespostaRpc> & {
  abortSignal(s: AbortSignal): PromiseLike<RespostaRpc>;
};
const cliente = supabase as unknown as {
  rpc<N extends keyof ArgsV115>(fn: N, args: ArgsV115[N]): Consulta;
};

export type EstadoDocumental = "missing_docs" | "processing" | "complete" | "error";
const ESTADOS: EstadoDocumental[] = ["missing_docs", "processing", "complete", "error"];

export type ArquivoV115 = {
  id: string;
  nome_original: string | null;
  mime: string | null;
  tamanho: number | null;
  sha256: string | null;
  status_seguranca: string | null;
};
export type DocV115 = {
  id: string;
  tipo: string;
  titulo: string;
  categoria: string | null;
  situacao: string;
  versao_atual: number | null;
  atualizado_em: string | null;
  requisito: { id: string; codigo: string | null; descricao: string | null } | null;
  versao: { numero_versao: number | null; hash: string | null; id_arquivo: string | null } | null;
  arquivo: ArquivoV115 | null;
  processamento: { status: string | null; etapa: string | null } | null;
};
export type ReqV115 = {
  id: string;
  codigo: string | null;
  descricao: string | null;
  categoria: string | null;
  obrigatorio: boolean;
  aplicavel: boolean;
  impeditivo: boolean;
  criticidade: string | null;
  tipos_esperados: string[];
  atendido: boolean;
};
export type LeituraV115 = {
  competencia: {
    id: string;
    id_contrato: string;
    id_organizacao: string;
    competencia_referencia: string;
  };
  estado_documental: EstadoDocumental;
  resumo: {
    documentos_total: number;
    requisitos_documentais_total: number;
    requisitos_documentais_aplicaveis: number;
    requisitos_documentais_pendentes: number;
  };
  documentos: DocV115[];
  documentos_total: number;
  requisitos: ReqV115[];
  requisitos_total: number;
  capacidades: {
    pode_enviar: boolean;
    pode_nova_versao: boolean;
    motivo_nova_versao_obrigatorio: boolean;
  };
};

export function obterDocumentosCompetencia(
  id: string,
  offDocs: number,
  offReqs: number,
  signal: AbortSignal,
): PromiseLike<RespostaRpc> {
  return cliente
    .rpc("obter_documentos_competencia_v115", {
      p_id_competencia: id,
      p_documentos_offset: offDocs,
      p_documentos_limite: PAGINA_DOCS,
      p_requisitos_offset: offReqs,
      p_requisitos_limite: PAGINA_DOCS,
    })
    .abortSignal(signal);
}

const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function parseDoc(d: unknown): DocV115 | null {
  if (!obj(d) || typeof d["id"] !== "string" || typeof d["tipo"] !== "string") return null;
  const r = d["requisito"];
  const v = d["versao"];
  const a = d["arquivo"];
  const p = d["processamento"];
  return {
    id: d["id"],
    tipo: d["tipo"],
    titulo: str(d["titulo"]) ?? "",
    categoria: str(d["categoria"]),
    situacao: str(d["situacao"]) ?? "",
    versao_atual: num(d["versao_atual"]),
    atualizado_em: str(d["atualizado_em"]),
    requisito:
      obj(r) && typeof r["id"] === "string"
        ? { id: r["id"], codigo: str(r["codigo"]), descricao: str(r["descricao"]) }
        : null,
    versao: obj(v)
      ? {
          numero_versao: num(v["numero_versao"]),
          hash: str(v["hash"]),
          id_arquivo: str(v["id_arquivo"]),
        }
      : null,
    arquivo:
      obj(a) && typeof a["id"] === "string"
        ? {
            id: a["id"],
            nome_original: str(a["nome_original"]),
            mime: str(a["mime"]),
            tamanho: num(a["tamanho"]),
            sha256: str(a["sha256"]),
            status_seguranca: str(a["status_seguranca"]),
          }
        : null,
    processamento: obj(p) ? { status: str(p["status"]), etapa: str(p["etapa"]) } : null,
  };
}
function parseReq(r: unknown): ReqV115 | null {
  if (
    !obj(r) ||
    typeof r["id"] !== "string" ||
    typeof r["obrigatorio"] !== "boolean" ||
    typeof r["aplicavel"] !== "boolean" ||
    typeof r["impeditivo"] !== "boolean" ||
    typeof r["atendido"] !== "boolean"
  ) return null;
  const t = r["tipos_esperados"];
  return {
    id: r["id"],
    codigo: str(r["codigo"]),
    descricao: str(r["descricao"]),
    categoria: str(r["categoria"]),
    obrigatorio: r["obrigatorio"],
    aplicavel: r["aplicavel"],
    impeditivo: r["impeditivo"],
    criticidade: str(r["criticidade"]),
    tipos_esperados: Array.isArray(t) ? t.filter((x): x is string => typeof x === "string") : [],
    atendido: r["atendido"],
  };
}

export function parseLeituraV115(data: unknown): LeituraV115 | null {
  if (!obj(data) || data["schema_versao"] !== "v115-v1") return null;
  const c = data["competencia"];
  const res = data["resumo"];
  const cap = data["capacidades"];
  const pd = data["documentos_paginacao"];
  const pr = data["requisitos_paginacao"];
  const e = data["estado_documental"];
  if (
    !obj(c) ||
    typeof c["id"] !== "string" ||
    typeof c["id_contrato"] !== "string" ||
    typeof c["id_organizacao"] !== "string" ||
    !obj(res) ||
    !obj(cap) ||
    typeof cap["pode_enviar"] !== "boolean" ||
    typeof cap["pode_nova_versao"] !== "boolean" ||
    typeof cap["motivo_nova_versao_obrigatorio"] !== "boolean" ||
    !obj(pd) ||
    !obj(pr) ||
    !ESTADOS.includes(e as EstadoDocumental) ||
    !Array.isArray(data["documentos"]) ||
    !Array.isArray(data["requisitos_documentais"])
  )
    return null;
  const docs = (data["documentos"] as unknown[]).map(parseDoc);
  const reqs = (data["requisitos_documentais"] as unknown[]).map(parseReq);
  if (docs.some((x) => !x) || reqs.some((x) => !x)) return null;
  const dt = num(pd["total"]);
  const rt = num(pr["total"]);
  if (dt === null || rt === null) return null;
  const documentosTotal = num(res["documentos_total"]);
  const requisitosTotal = num(res["requisitos_documentais_total"]);
  const requisitosAplicaveis = num(res["requisitos_documentais_aplicaveis"]);
  const requisitosPendentes = num(res["requisitos_documentais_pendentes"]);
  if (
    documentosTotal === null || requisitosTotal === null ||
    requisitosAplicaveis === null || requisitosPendentes === null
  ) return null;
  return {
    competencia: {
      id: c["id"],
      id_contrato: c["id_contrato"],
      id_organizacao: c["id_organizacao"],
      competencia_referencia: str(c["competencia_referencia"]) ?? "",
    },
    estado_documental: e as EstadoDocumental,
    resumo: {
      documentos_total: documentosTotal,
      requisitos_documentais_total: requisitosTotal,
      requisitos_documentais_aplicaveis: requisitosAplicaveis,
      requisitos_documentais_pendentes: requisitosPendentes,
    },
    documentos: docs as DocV115[],
    documentos_total: dt,
    requisitos: reqs as ReqV115[],
    requisitos_total: rt,
    capacidades: {
      pode_enviar: cap["pode_enviar"],
      pode_nova_versao: cap["pode_nova_versao"],
      motivo_nova_versao_obrigatorio: cap["motivo_nova_versao_obrigatorio"],
    },
  };
}

export type TipoErroV115 = "sem_permissao" | "nao_encontrada" | "duplicada" | "conflito" | "erro";
/** P0001/PT400 nunca viram sem_permissao: são erro genérico sanitizado. */
export function classificarErroV115(error: unknown, status?: number): TipoErroV115 {
  const code = obj(error) && typeof error["code"] === "string" ? error["code"] : "";
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301")
    return "sem_permissao";
  if (code === "PT404" || code === "P0002") return "nao_encontrada";
  if (code === "23505") return "duplicada";
  if (code === "PT409" || code === "40001") return "conflito";
  return "erro";
}
export class ErroV115 extends Error {
  constructor(public tipo: TipoErroV115) {
    super(tipo);
  }
}

async function escrever<N extends keyof ArgsV115>(
  fn: N,
  args: ArgsV115[N],
): Promise<RetornoDocumento> {
  let r: RespostaRpc;
  try {
    r = await cliente.rpc(fn, args);
  } catch {
    throw new ErroV115("erro");
  }
  if (r.error) throw new ErroV115(classificarErroV115(r.error, r.status));
  try {
    return lerRetornoDocumento(r.data);
  } catch {
    throw new ErroV115("erro");
  }
}

export function criarDocumentoCompetencia(a: {
  idCompetencia: string;
  tipo: string;
  titulo: string;
  categoria: string;
  idRequisito: string | null;
  idArquivo: string;
  chave: string;
}): Promise<RetornoDocumento> {
  return escrever("criar_documento_competencia_v115", {
    p_id_competencia: a.idCompetencia,
    p_tipo: a.tipo,
    p_titulo: a.titulo.trim(),
    p_categoria: a.categoria.trim() || null,
    p_id_requisito: a.idRequisito,
    p_id_arquivo: a.idArquivo,
    p_chave_idempotencia: a.chave,
  });
}
export function adicionarVersaoCompetencia(a: {
  idDocumento: string;
  idArquivo: string;
  motivo: string;
  chave: string;
}): Promise<RetornoDocumento> {
  return escrever("adicionar_versao_documento_competencia_v115", {
    p_id_documento: a.idDocumento,
    p_id_arquivo: a.idArquivo,
    p_motivo: a.motivo.trim() || null,
    p_chave_idempotencia: a.chave,
  });
}

/**
 * Opções de tipo: `tipos_esperados` do backend é autoritativo quando não vazio
 * (rótulo amigável V1-10 quando existir; senão o próprio valor). Vazio → catálogo genérico V1-10.
 */
export function tiposParaRequisito(r: ReqV115 | null): Array<[string, string]> {
  if (r && r.tipos_esperados.length > 0)
    return r.tipos_esperados.map((t) => [t, ROTULO_TIPO[t] ?? t]);
  return TIPOS_DOCUMENTO;
}

export const ROTULO_ESTADO_DOCUMENTAL: Record<EstadoDocumental, string> = {
  missing_docs: "Documentos pendentes",
  processing: "Em processamento",
  complete: "Documentação completa",
  error: "Documentos com erro",
};

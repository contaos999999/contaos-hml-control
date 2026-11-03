/**
 * V1-10 — Central de documentos do contrato.
 * Leituras sob RLS (filtro id_contrato é escopo de UX; RLS é a autoridade).
 * Mutações somente por RPCs oficiais e Edges `storage-sign-upload`/`storage-sign-download`.
 * Nenhuma regra material (portão, vigência de sugestão, revisão de IA) é decidida aqui.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Pagina } from "@/lib/contratos/baseNormativaDados";

export const PAGINA_DOCS = 25;
export const CHUNK_TUS = 6 * 1024 * 1024;
/** Pré-validação UX espelhando `configuracao_upload` (HML); o Edge/RPC é a autoridade. */
export const TAMANHO_MAXIMO = 500 * 1024 * 1024;
export const MIMES_POR_EXTENSAO: Record<string, string[]> = {
  pdf: ["application/pdf"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  csv: ["text/csv"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  txt: ["text/plain"],
  json: ["application/json"],
  xml: ["application/xml", "text/xml"],
};
export const ACEITE = Object.keys(MIMES_POR_EXTENSAO)
  .map((e) => `.${e}`)
  .join(",");

export const COLUNAS_DOCUMENTO =
  "id,id_contrato,tipo,titulo,categoria,situacao,versao_atual,versao_registro,vigencia_inicio,vigencia_fim,observacoes,criado_em,atualizado_em";
export const COLUNAS_VERSAO_DOC =
  "id,id_documento_contrato,numero_versao,id_arquivo,hash,metadados_extraidos,enviado_por,criado_em";
export const COLUNAS_ARQUIVO_DOC =
  "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_em";
export const COLUNAS_PROCESSAMENTO =
  "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em";
export const COLUNAS_CLASSIFICACAO =
  "id,id_versao_documento,categoria_sugerida,id_requisito_sugerido,confianca,status";
/** Tipos de sugestão que originam regra e, portanto, exigem vigência (V1-CON-002). */
export const TIPOS_SUGESTAO_REGRA = [
  "clausula",
  "obrigacao",
  "prazo",
  "documento_exigido",
  "restricao",
  "regra_candidata",
] as const;

export type Documento = {
  id: string;
  id_contrato: string;
  tipo: string;
  titulo: string;
  categoria: string | null;
  situacao: string;
  versao_atual: number;
  versao_registro: number;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};
export type VersaoDoc = {
  id: string;
  id_documento_contrato: string;
  numero_versao: number;
  id_arquivo: string;
  hash: string;
  metadados_extraidos: unknown;
  enviado_por: string | null;
  criado_em: string;
};
export type ArquivoDoc = {
  id: string;
  nome_original: string;
  mime: string;
  tamanho: number;
  sha256: string;
  status_seguranca: string;
  origem: string;
  criado_em: string;
};
export type Processamento = {
  id: string;
  id_versao_documento: string;
  etapa: string;
  status: string;
  tentativas: number;
  erro_codigo: string | null;
  iniciado_em: string | null;
  concluido_em: string | null;
  criado_em: string;
};
export type Classificacao = {
  id: string;
  id_versao_documento: string;
  categoria_sugerida: string | null;
  id_requisito_sugerido: string | null;
  confianca: number | null;
  status: string;
};
export type Resumo = {
  versao?: VersaoDoc;
  arquivo?: ArquivoDoc;
  processamento?: Processamento;
  classificacao?: Classificacao;
  iaPendentes: number;
  semVigencia: number;
};
export type Filtros = { busca: string; tipo: string; categoria: string; situacao: string };
export const FILTROS_VAZIOS: Filtros = { busca: "", tipo: "", categoria: "", situacao: "" };

export const TIPOS_DOCUMENTO: Array<[string, string]> = [
  ["contrato", "Contrato"],
  ["proposta", "Proposta"],
  ["aditivo", "Aditivo"],
  ["legislacao", "Legislação"],
  ["portaria", "Portaria"],
  ["decreto", "Decreto"],
  ["resolucao", "Resolução"],
  ["manual", "Manual"],
  ["lista_verificacao", "Lista de verificação"],
  ["instrucao", "Instrução"],
  ["outro", "Outro"],
];
export const ROTULO_TIPO: Record<string, string> = Object.fromEntries(TIPOS_DOCUMENTO);
export const ROTULO_SITUACAO_DOC: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  substituido: "Substituído",
};
export const ROTULO_SEGURANCA: Record<string, string> = {
  pendente: "Verificação pendente",
  aprovado: "Aprovado",
  quarentena: "Em quarentena",
  bloqueado: "Bloqueado",
};
export const ROTULO_PROCESSAMENTO: Record<string, string> = {
  pendente: "Na fila",
  processando: "Processando",
  concluido: "Concluído",
  falhou: "Falhou",
  cancelado: "Cancelado",
};

export type TipoErroDoc =
  "negado" | "nao_encontrado" | "conflito" | "validacao" | "edge_recusa" | "erro";
export class ErroDoc extends Error {
  constructor(public tipo: TipoErroDoc) {
    super(tipo);
  }
}
export function classificarErroDoc(error: unknown): TipoErroDoc {
  const code = (error as { code?: string } | null)?.code;
  if (code === "42501" || code === "PT403" || code === "PGRST301") return "negado";
  if (code === "PT404" || code === "P0002") return "nao_encontrado";
  if (code === "PT409" || code === "40001") return "conflito";
  if (code === "PT400" || code === "P0001" || code === "22023" || code === "23514")
    return "validacao";
  return "erro";
}

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
async function executar(q: PromiseLike<Resp>, signal?: AbortSignal): Promise<Resp> {
  let r: Resp;
  try {
    r = await q;
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ErroDoc("erro");
  }
  if (r.error) {
    const code = (r.error as { code?: string }).code;
    throw new ErroDoc(
      code === "42501" || code === "PGRST301" || r.status === 401 || r.status === 403
        ? "negado"
        : "erro",
    );
  }
  return r;
}

/** Escapa curingas do ILIKE para busca literal. */
export const escaparIlike = (t: string) => t.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function listarDocumentos(
  contrato: string,
  f: Filtros,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<Documento>> {
  let q = supabase
    .from("documentos_contrato")
    .select(COLUNAS_DOCUMENTO, { count: "exact" })
    .eq("id_contrato", contrato);
  const busca = f.busca.trim();
  if (busca) q = q.ilike("titulo", `%${escaparIlike(busca)}%`);
  if (f.tipo) q = q.eq("tipo", f.tipo);
  if (f.categoria.trim()) q = q.eq("categoria", f.categoria.trim());
  if (f.situacao) q = q.eq("situacao", f.situacao);
  let qo = q
    .order("atualizado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(pagina * PAGINA_DOCS, pagina * PAGINA_DOCS + PAGINA_DOCS - 1);
  if (signal) qo = qo.abortSignal(signal);
  const r = await executar(qo, signal);
  return { itens: (r.data as Documento[] | null) ?? [], total: r.count ?? 0 };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resumo da versão atual de cada documento da página (só ids da página). */
export async function obterResumos(
  docs: Documento[],
  signal?: AbortSignal,
): Promise<Record<string, Resumo>> {
  const base: Record<string, Resumo> = Object.fromEntries(
    docs.map((d) => [d.id, { iaPendentes: 0, semVigencia: 0 }]),
  );
  const alvo = docs.filter((d) => UUID.test(d.id) && Number.isInteger(d.versao_atual));
  if (alvo.length === 0) return base;
  const filtro = alvo
    .map((d) => `and(id_documento_contrato.eq.${d.id},numero_versao.eq.${d.versao_atual})`)
    .join(",");
  let qv = supabase.from("versoes_documento").select(COLUNAS_VERSAO_DOC).or(filtro);
  if (signal) qv = qv.abortSignal(signal);
  const versoes = ((await executar(qv, signal)).data as VersaoDoc[] | null) ?? [];
  for (const v of versoes)
    if (base[v.id_documento_contrato]) base[v.id_documento_contrato].versao = v;
  const vids = versoes.map((v) => v.id).sort();
  const aids = [...new Set(versoes.map((v) => v.id_arquivo))].sort();
  if (vids.length === 0) return base;
  const porVersao = Object.fromEntries(versoes.map((v) => [v.id, v.id_documento_contrato]));

  let qa = supabase.from("arquivos").select(COLUNAS_ARQUIVO_DOC).in("id", aids);
  let qp = supabase
    .from("processamentos_documento")
    .select(COLUNAS_PROCESSAMENTO)
    .in("id_versao_documento", vids)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(0, 99);
  let qc = supabase
    .from("sugestoes_extracao_documento")
    .select(COLUNAS_CLASSIFICACAO)
    .in("id_versao_documento", vids)
    .eq("tipo", "classificacao")
    .order("confianca", { ascending: false })
    .order("id", { ascending: true })
    .range(0, 99);
  if (signal) {
    qa = qa.abortSignal(signal);
    qp = qp.abortSignal(signal);
    qc = qc.abortSignal(signal);
  }
  const contar = (vid: string, semVig: boolean) => {
    let q = supabase
      .from("sugestoes_extracao_documento")
      .select("id", { count: "exact", head: true })
      .eq("id_versao_documento", vid);
    q = semVig
      ? q.in("tipo", [...TIPOS_SUGESTAO_REGRA]).is("vigencia_inicio", null)
      : q.eq("status", "pendente");
    if (signal) q = q.abortSignal(signal);
    return executar(q, signal).then((r) => r.count ?? 0);
  };
  const [ra, rp, rc, contagens] = await Promise.all([
    executar(qa, signal),
    executar(qp, signal),
    executar(qc, signal),
    Promise.all(
      vids.map(async (vid) => [vid, await contar(vid, false), await contar(vid, true)] as const),
    ),
  ]);
  const arquivos = Object.fromEntries(
    ((ra.data as ArquivoDoc[] | null) ?? []).map((a) => [a.id, a]),
  );
  for (const v of versoes) base[v.id_documento_contrato].arquivo = arquivos[v.id_arquivo];
  for (const p of (rp.data as Processamento[] | null) ?? []) {
    const d = porVersao[p.id_versao_documento];
    if (d && !base[d].processamento) base[d].processamento = p;
  }
  for (const c of (rc.data as Classificacao[] | null) ?? []) {
    const d = porVersao[c.id_versao_documento];
    if (d && !base[d].classificacao) base[d].classificacao = c;
  }
  for (const [vid, pend, sem] of contagens) {
    const d = porVersao[vid];
    base[d].iaPendentes = pend;
    base[d].semVigencia = sem;
  }
  return base;
}

/** Há processamento/verificação em andamento? (somente para decidir polling, nunca regra material) */
export const emAndamento = (r: Record<string, Resumo> | undefined) =>
  !!r &&
  Object.values(r).some(
    (x) =>
      x.processamento?.status === "pendente" ||
      x.processamento?.status === "processando" ||
      x.arquivo?.status_seguranca === "pendente",
  );
const BACKOFF = [5000, 10000, 20000, 40000, 60000];
export const atrasoPolling = (n: number) => BACKOFF[Math.min(Math.max(n, 0), BACKOFF.length - 1)];

// ---------- Validação UX de arquivo (autoridade: Edge/RPC) ----------
export type MotivoInvalido = "formato" | "mime" | "tamanho" | "vazio";
export function motivoInvalido(f: File): MotivoInvalido | null {
  const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "";
  const mimes = MIMES_POR_EXTENSAO[ext];
  if (!mimes) return "formato";
  if (!mimes.includes(f.type.toLowerCase())) return "mime";
  if (f.size === 0) return "vazio";
  if (f.size > TAMANHO_MAXIMO) return "tamanho";
  return null;
}

// ---------- Edges ----------
function statusEdge(error: unknown): number | undefined {
  const c = (error as { context?: { status?: unknown } } | null)?.context;
  return typeof c?.status === "number" ? c.status : undefined;
}
async function invocar(
  nome: "storage-sign-upload" | "storage-sign-download",
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let r: { data: unknown; error: unknown };
  try {
    r = await supabase.functions.invoke(nome, { body });
  } catch {
    throw new ErroDoc("erro");
  }
  if (r.error) {
    const st = statusEdge(r.error);
    throw new ErroDoc(
      st === 401 || st === 403
        ? "negado"
        : st === 400 || st === 413 || st === 415
          ? "edge_recusa"
          : "erro",
    );
  }
  const d = r.data as Record<string, unknown> | null;
  if (!d || d["ok"] !== true) throw new ErroDoc("erro");
  return d;
}

export type Autorizacao = { bucket: string; path: string; token: string; resumivel: boolean };
export async function autorizarUpload(
  org: string,
  contrato: string,
  f: File,
): Promise<Autorizacao> {
  const d = await invocar("storage-sign-upload", {
    id_organizacao: org,
    id_contrato: contrato,
    nome_arquivo: f.name,
    mime: f.type.toLowerCase(),
    tamanho: f.size,
  });
  const { bucket, path, token } = d;
  if (typeof bucket !== "string" || typeof path !== "string" || typeof token !== "string")
    throw new ErroDoc("erro");
  return { bucket, path, token, resumivel: d["usar_upload_resumivel"] === true };
}

export async function enviarSimples(a: Autorizacao, f: File): Promise<void> {
  let up: { error: unknown };
  try {
    up = await supabase.storage.from(a.bucket).uploadToSignedUrl(a.path, a.token, f);
  } catch {
    throw new ErroDoc("erro");
  }
  if (up.error) throw new ErroDoc("erro");
}

/** Endpoint TUS oficial do Storage do projeto conectado (direto navegador↔Storage). */
export function endpointTus(): string {
  const base = String(import.meta.env.VITE_SUPABASE_URL ?? "");
  try {
    const u = new URL(base);
    u.hostname = u.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co");
    return `${u.origin}/storage/v1/upload/resumable`;
  } catch {
    return "";
  }
}
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s)));
const dormir = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms));

export type OpcoesTus = {
  location?: string;
  onProgresso?: (pct: number) => void;
  onLocation?: (l: string) => void;
  signal?: AbortSignal;
  atraso?: (ms: number) => Promise<void>;
  tentativas?: number;
};
/** TUS 1.0 por fetch, blocos de 6 MB, retomada por HEAD. Sem proxy pelo app. */
export async function enviarTus(
  a: Pick<Autorizacao, "bucket" | "path" | "token">,
  f: File,
  o: OpcoesTus = {},
): Promise<{ location: string }> {
  const espera = o.atraso ?? dormir;
  const max = o.tentativas ?? 3;
  const apikey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
  const comuns = { "Tus-Resumable": "1.0.0", "x-signature": a.token, apikey };
  let location = o.location;
  let offset = 0;
  if (!location) {
    let r: Response;
    try {
      r = await fetch(endpointTus(), {
        method: "POST",
        signal: o.signal,
        headers: {
          ...comuns,
          "Upload-Length": String(f.size),
          "Upload-Metadata": [
            `bucketName ${b64(a.bucket)}`,
            `objectName ${b64(a.path)}`,
            `contentType ${b64(f.type)}`,
            `cacheControl ${b64("3600")}`,
          ].join(","),
        },
      });
    } catch {
      throw new ErroDoc("erro");
    }
    const loc = r.headers.get("Location");
    if (r.status === 401 || r.status === 403) throw new ErroDoc("negado");
    if (!r.ok || !loc) throw new ErroDoc("erro");
    location = loc;
    o.onLocation?.(loc);
  } else {
    offset = await consultarOffset(location, comuns, o.signal);
  }
  let falhas = 0;
  while (offset < f.size) {
    const bloco = f.slice(offset, Math.min(offset + CHUNK_TUS, f.size));
    let r: Response | null = null;
    try {
      r = await fetch(location, {
        method: "PATCH",
        signal: o.signal,
        headers: {
          ...comuns,
          "Upload-Offset": String(offset),
          "Content-Type": "application/offset+octet-stream",
        },
        body: bloco,
      });
    } catch {
      if (o.signal?.aborted) throw new ErroDoc("erro");
      r = null;
    }
    if (r && (r.status === 401 || r.status === 403)) throw new ErroDoc("negado");
    if (r && r.ok) {
      const novo = Number(r.headers.get("Upload-Offset"));
      offset = Number.isFinite(novo) && novo > offset ? novo : offset + bloco.size;
      falhas = 0;
      o.onProgresso?.(Math.round((offset / f.size) * 100));
      continue;
    }
    falhas += 1;
    if (falhas > max) throw new ErroDoc("erro");
    await espera(1000 * 2 ** (falhas - 1));
    offset = await consultarOffset(location, comuns, o.signal);
  }
  o.onProgresso?.(100);
  return { location };
}
async function consultarOffset(
  location: string,
  comuns: Record<string, string>,
  signal?: AbortSignal,
): Promise<number> {
  let r: Response;
  try {
    r = await fetch(location, { method: "HEAD", signal, headers: comuns });
  } catch {
    throw new ErroDoc("erro");
  }
  const v = Number(r.headers.get("Upload-Offset"));
  if (!r.ok || !Number.isFinite(v)) throw new ErroDoc("erro");
  return v;
}

export async function sha256Hex(f: File): Promise<string> {
  const bytes =
    typeof f.arrayBuffer === "function"
      ? await f.arrayBuffer()
      : await new Promise<ArrayBuffer>((ok, falha) => {
          const l = new FileReader();
          l.onload = () => ok(l.result as ArrayBuffer);
          l.onerror = () => falha(l.error);
          l.readAsArrayBuffer(f);
        });
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(h, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- RPCs oficiais (tipos locais; types.ts intocado) ----------
type ArgsV110 = {
  confirmar_upload_arquivo: {
    p_id_organizacao: string;
    p_id_contrato: string;
    p_path: string;
    p_nome_original: string;
    p_mime: string;
    p_tamanho: number;
    p_sha256: string;
    p_origem: "upload_usuario";
  };
  criar_documento_contrato_completo: {
    p_id_contrato: string;
    p_tipo: string;
    p_titulo: string;
    p_categoria: string | null;
    p_vigencia_inicio: string | null;
    p_vigencia_fim: string | null;
    p_observacoes: string | null;
    p_id_arquivo: string;
    p_chave_idempotencia: string;
  };
  adicionar_versao_documento_contrato: {
    p_id_documento: string;
    p_id_arquivo: string;
    p_motivo: string;
    p_chave_idempotencia: string;
  };
};
type RpcV110 = <N extends keyof ArgsV110>(
  nome: N,
  args: ArgsV110[N],
) => PromiseLike<{ data: unknown; error: unknown }>;
// Fronteira única: as RPCs V111 não constam no types.ts certificado (proibido regenerar).
const rpcV110 = supabase.rpc.bind(supabase) as unknown as RpcV110;

async function chamar<N extends keyof ArgsV110>(nome: N, args: ArgsV110[N]): Promise<unknown> {
  let r: { data: unknown; error: unknown };
  try {
    r = await rpcV110(nome, args);
  } catch {
    throw new ErroDoc("erro");
  }
  if (r.error) throw new ErroDoc(classificarErroDoc(r.error));
  return r.data;
}

export async function confirmarUpload(
  org: string,
  contrato: string,
  path: string,
  f: File,
  sha: string,
): Promise<string> {
  const d = await chamar("confirmar_upload_arquivo", {
    p_id_organizacao: org,
    p_id_contrato: contrato,
    p_path: path,
    p_nome_original: f.name,
    p_mime: f.type.toLowerCase(),
    p_tamanho: f.size,
    p_sha256: sha,
    p_origem: "upload_usuario",
  });
  if (typeof d !== "string" || !UUID.test(d)) throw new ErroDoc("erro");
  return d;
}

/** Contrato real (privado.*_v110/_v111): id_documento, id_versao, numero_versao, id_arquivo, id_job. */
export type RetornoDocumento = {
  id_documento: string;
  id_versao: string;
  numero_versao: number;
  id_arquivo: string;
};
export function lerRetornoDocumento(d: unknown): RetornoDocumento {
  const o = d as Record<string, unknown> | null;
  if (
    !o ||
    typeof o !== "object" ||
    typeof o["id_documento"] !== "string" ||
    typeof o["id_versao"] !== "string" ||
    typeof o["numero_versao"] !== "number" ||
    typeof o["id_arquivo"] !== "string"
  )
    throw new ErroDoc("erro");
  return {
    id_documento: o["id_documento"],
    id_versao: o["id_versao"],
    numero_versao: o["numero_versao"],
    id_arquivo: o["id_arquivo"],
  };
}

export type DadosDocumento = {
  tipo: string;
  titulo: string;
  categoria: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  observacoes: string;
};
const nulo = (s: string) => (s.trim() ? s.trim() : null);
export async function criarDocumentoCompleto(
  contrato: string,
  m: DadosDocumento,
  idArquivo: string,
  chave: string,
): Promise<RetornoDocumento> {
  return lerRetornoDocumento(
    await chamar("criar_documento_contrato_completo", {
      p_id_contrato: contrato,
      p_tipo: m.tipo,
      p_titulo: m.titulo.trim(),
      p_categoria: nulo(m.categoria),
      p_vigencia_inicio: nulo(m.vigenciaInicio),
      p_vigencia_fim: nulo(m.vigenciaFim),
      p_observacoes: nulo(m.observacoes),
      p_id_arquivo: idArquivo,
      p_chave_idempotencia: chave,
    }),
  );
}
export async function adicionarVersao(
  idDocumento: string,
  idArquivo: string,
  motivo: string,
  chave: string,
): Promise<RetornoDocumento> {
  return lerRetornoDocumento(
    await chamar("adicionar_versao_documento_contrato", {
      p_id_documento: idDocumento,
      p_id_arquivo: idArquivo,
      p_motivo: motivo.trim(),
      p_chave_idempotencia: chave,
    }),
  );
}

/** Download somente por ação explícita; abre apenas a signed_url https retornada. */
export async function baixarDocumento(idArquivo: string): Promise<void> {
  const d = await invocar("storage-sign-download", { id_arquivo: idArquivo });
  const u = d["signed_url"];
  let ok = false;
  try {
    ok = typeof u === "string" && new URL(u).protocol === "https:";
  } catch {
    ok = false;
  }
  if (!ok) throw new ErroDoc("erro");
  window.open(u as string, "_blank", "noopener,noreferrer");
}

/** Vigência UX (o CHECK/RPC do backend é a autoridade). */
export function erroVigencia(inicio: string, fim: string): "fim_sem_inicio" | "fim_antes" | null {
  if (fim && !inicio) return "fim_sem_inicio";
  if (fim && inicio && fim < inicio) return "fim_antes";
  return null;
}
export const hashCurto = (h: string | null | undefined) =>
  h && h.length > 16 ? `${h.slice(0, 8)}…${h.slice(-8)}` : (h ?? "—");
export const tituloDeArquivo = (nome: string) => nome.replace(/\.[^.]+$/, "") || nome;
export const temMetadados = (v: unknown) =>
  v !== null &&
  v !== undefined &&
  !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0) &&
  !(Array.isArray(v) && v.length === 0);

export const MENSAGENS_V110 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  carregandoSecao: "Carregando documentos…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia:
    "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  erroSecao: "Não foi possível carregar os documentos agora. Tente novamente em instantes.",
  negadoSecao: "Você não tem acesso a estes documentos.",
  vazio: "Nenhum documento encontrado para este contrato.",
  bloqueadoSeguranca: "Bloqueado pela verificação de segurança — download e análise indisponíveis.",
  verificacaoPendente: "Download disponível após a verificação de segurança.",
  downloadNegado: "Você não tem permissão para baixar este arquivo.",
  downloadErro: "Não foi possível gerar o link temporário de download. Tente novamente.",
  formatoInvalido: "Este formato de arquivo não é aceito pelo ContaOS.",
  mimeIncompativel: "A extensão e o tipo do arquivo não são compatíveis.",
  tamanhoExcedido: "O arquivo ultrapassa o limite de 500 MB deste ambiente.",
  arquivoVazio: "O arquivo está vazio.",
  semArquivos: "Selecione ao menos um arquivo válido.",
  semTitulo: "Informe o título de todos os documentos.",
  vigenciaFimSemInicio: "Informe o início da vigência quando houver fim de vigência.",
  vigenciaFimAntes: "O fim da vigência não pode ser anterior ao início.",
  motivoObrigatorio: "Informe o motivo da nova versão para preservar a rastreabilidade documental.",
  semPermissao: "Seu perfil atual não permite incluir documentos neste contrato.",
  validacaoBackend: "O ContaOS recusou os dados informados. Revise os campos e tente novamente.",
  conflito: "Os dados mudaram desde a abertura. Atualize a lista antes de tentar novamente.",
  naoEncontradoEnvio: "O contrato ou documento não foi encontrado.",
  recusadoSeguranca: "O arquivo foi recusado pela validação de segurança do envio.",
  erroEnvio: "Não foi possível concluir o envio agora. Tente novamente.",
  sucesso: "Envio concluído. O processamento segue em segundo plano.",
  detalheEmBreve: "O detalhe com histórico de versões e revisão de IA chega na próxima etapa.",
} as const;

export function validarArquivo(f: File): string | null {
  const m = motivoInvalido(f);
  if (m === "formato") return MENSAGENS_V110.formatoInvalido;
  if (m === "mime") return MENSAGENS_V110.mimeIncompativel;
  if (m === "vazio") return MENSAGENS_V110.arquivoVazio;
  if (m === "tamanho") return MENSAGENS_V110.tamanhoExcedido;
  return null;
}
export function mensagemErroEnvio(t: TipoErroDoc): string {
  return {
    negado: MENSAGENS_V110.semPermissao,
    validacao: MENSAGENS_V110.validacaoBackend,
    conflito: MENSAGENS_V110.conflito,
    nao_encontrado: MENSAGENS_V110.naoEncontradoEnvio,
    edge_recusa: MENSAGENS_V110.recusadoSeguranca,
    erro: MENSAGENS_V110.erroEnvio,
  }[t];
}

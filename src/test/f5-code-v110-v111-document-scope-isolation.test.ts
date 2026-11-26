import { createHash, webcrypto } from "node:crypto";
import { writeFileSync } from "node:fs";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  classificarErroV116,
  FILTROS_VAZIOS,
  obterAnaliseCompetencia,
  OFFSETS_ZERO,
  parseAnaliseV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  listarFontes,
  listarVersoes as listarVersoesNormativas,
  obterTextoVersao,
} from "@/lib/contratos/baseNormativaDados";
import {
  hashDiverge,
  listarFragmentos,
  listarPaginas,
  listarVersoes,
  obterDocumento,
} from "@/lib/contratos/documentoDetalheDados";
import {
  adicionarVersao,
  baixarDocumento,
  criarDocumentoCompleto,
  enviarArquivoCertificado,
  FILTROS_VAZIOS as DOC_FILTERS,
  listarDocumentos,
} from "@/lib/contratos/documentosDados";

const transport = vi.hoisted(() => ({ fetch: vi.fn(), identity: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f54.invalid", "fixture-key", {
      accessToken: async () => transport.identity,
      global: { fetch: (input, init) => transport.fetch(input, init) },
    }),
  };
});

const uid = (side: string, n: number) =>
  side + "5410000-0000-4000-8000-" + String(n).padStart(12, "0");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  session: "fixture-" + side,
  contract: uid(side, 1),
  document: uid(side, 2),
  version: uid(side, 3),
  file: uid(side, 4),
  oldVersion: uid(side, 5),
  oldFile: uid(side, 6),
  competence: uid(side, 7),
  requirement: uid(side, 8),
  evidence: uid(side, 9),
  event: uid(side, 10),
  correlation: uid(side, 11),
  request: uid(side, 12),
  source: uid(side, 13),
  sourceVersion: uid(side, 14),
  priorSourceVersion: uid(side, 15),
  execution: uid(side, 16),
  result: uid(side, 17),
  page: uid(side, 18),
  fragment: uid(side, 19),
  content: "%PDF-1.4\nF5.4 " + side,
  oldHash: hash("versão anterior " + side),
});
const A = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
  "administrador",
);
const B = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
  "leitor",
);
type Scope = typeof A;
type Exchange = {
  method: "GET" | "POST" | "PUT";
  path: string;
  status: number;
  data: unknown;
  args?: Record<string, unknown>;
  query?: Record<string, string>;
  file?: File;
};
const queue: Exchange[] = [];
const calls: Exchange[] = [];
const observations: object[] = [];
const date = "2026-11-01T12:00:00Z";
const form = {
  tipo: "contrato",
  titulo: "Documento sintético",
  categoria: "contratual",
  vigenciaInicio: "2026-11-01",
  vigenciaFim: "",
  observacoes: "",
};
const denied = { code: "42501", message: "Operação não autorizada" };
const rest = (table: string, query: Record<string, string>, data: object[]): Exchange => ({
  method: "GET",
  path: "/rest/v1/" + table,
  query,
  data,
  status: 200,
});
const post = (
  path: string,
  args: Record<string, unknown>,
  data: unknown,
  status = 200,
): Exchange => ({ method: "POST", path, args, data, status });
const rpc = (name: string, args: Record<string, unknown>, data: unknown, status = 200) =>
  post("/rest/v1/rpc/" + name, args, data, status);
const edge = (name: string, args: Record<string, unknown>, data: unknown, status = 200) =>
  post("/functions/v1/" + name, args, data, status);
const on = (field: string, value: string) => ({ [field]: "eq." + value });

beforeEach(() => {
  queue.length = 0;
  calls.length = 0;
  vi.stubGlobal("crypto", webcrypto);
  vi.spyOn(window, "open").mockReturnValue(null);
  transport.fetch.mockReset().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const expected = queue.shift();
    if (!expected) throw new Error("Unexpected synthetic request");
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f54.invalid");
    expect(url.pathname).toBe(expected.path);
    expect(init?.method).toBe(expected.method);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer " + transport.identity);
    const query = Object.fromEntries(
      [...url.searchParams].filter(([k]) => !["select", "order", "offset", "limit"].includes(k)),
    );
    expect(query).toEqual(expected.query ?? {});
    if (expected.file) {
      const sent = (init?.body as FormData).get("");
      expect(sent).toMatchObject({ size: expected.file.size, type: expected.file.type });
    } else {
      expect(init?.body ? JSON.parse(String(init.body)) : undefined).toEqual(expected.args);
    }
    calls.push(expected);
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(expected.data))
      headers.set("content-range", expected.data.length ? "0-0/" + expected.data.length : "*/0");
    return new Response(JSON.stringify(expected.data), { status: expected.status, headers });
  });
});
afterEach(() => {
  expect(queue).toEqual([]);
  expect(transport.fetch).toHaveBeenCalledTimes(calls.length);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function use(s: Scope, ...steps: Exchange[]) {
  expect(queue).toEqual([]);
  transport.identity = s.session;
  queue.push(...steps);
}

const cases = [
  ["0288", "V110", "V111", "documentos_contrato"],
  ["0294", "V110", "V116", "obter_analise_competencia_v116"],
  ["0297", "V110", "V123", "eventos_auditoria"],
  ["0311", "V111", "V107", "fontes_normativas"],
  ["0315", "V111", "V110", "documentos_contrato"],
  ["0320", "V111", "V116", "obter_analise_competencia_v116"],
  ["0321", "V111", "V117", "obter_detalhe_requisito_v117"],
  ["0324", "V111", "V123", "eventos_auditoria"],
] as const;
type Case = (typeof cases)[number];
const producer = (c: Case) =>
  c[1] === "V110" ? "criar_documento_contrato_completo" : "adicionar_versao_documento_contrato";
const number = (c: Case) => (c[1] === "V110" ? 1 : 2);
const relation = (c: Case, s: Scope) => (c[1] === "V110" ? s.document : s.version);
const name = (c: Case) =>
  c[1] === "V110" ? "DocumentoContratoMetadadosCompletos" : "VersaoDocumentoContratoCriada";
const entity = (c: Case) => (c[1] === "V110" ? "documentos_contrato" : "versoes_documento");
const documentRow = (s: Scope, version: number) => ({
  id: s.document,
  id_contrato: s.contract,
  tipo: "contrato",
  titulo: form.titulo,
  categoria: form.categoria,
  situacao: "ativo",
  versao_atual: version,
  vigencia_inicio: form.vigenciaInicio,
});
const fileRow = (s: Scope, latest: boolean) => ({
  id: latest ? s.file : s.oldFile,
  mime: "application/pdf",
  status_seguranca: "aprovado",
  sha256: latest ? hash(s.content) : s.oldHash,
  criado_em: date,
});
const versionRow = (s: Scope, version: number, latest: boolean) => ({
  id: latest ? s.version : s.oldVersion,
  id_documento_contrato: s.document,
  numero_versao: version,
  id_arquivo: latest ? s.file : s.oldFile,
  hash: latest ? hash(s.content) : s.oldHash,
  criado_em: date,
});
const byContract = (s: Scope) => on("id_contrato", s.contract);
const contractList = (s: Scope, n: number) =>
  rest("documentos_contrato", byContract(s), n ? [documentRow(s, n)] : []);
const detail = (s: Scope, n: number) =>
  rest(
    "documentos_contrato",
    { ...on("id", s.document), ...byContract(s) },
    n ? [documentRow(s, n)] : [],
  );
function versionReads(s: Scope, n: number, updated: boolean): Exchange[] {
  const versions = updated
    ? [versionRow(s, n, true), ...(n === 2 ? [versionRow(s, 1, false)] : [])]
    : [versionRow(s, 1, false)];
  const ids = versions.map((v) => v.id_arquivo).sort();
  return [
    rest("versoes_documento", on("id_documento_contrato", s.document), versions),
    rest(
      "arquivos",
      { id: "in.(" + ids.join(",") + ")" },
      ids.map((id) => fileRow(s, id === s.file)),
    ),
  ];
}
async function readDocument(s: Scope, n: number, updated: boolean) {
  const docs = await listarDocumentos(s.contract, DOC_FILTERS, 0);
  expect(docs.itens).toEqual(n ? [documentRow(s, n)] : []);
  expect(docs.total).toBe(Number(!!n));
  if (!n) return undefined;
  const doc = await obterDocumento(s.contract, docs.itens[0]!.id);
  expect(doc).toEqual(documentRow(s, n));
  const versions = await listarVersoes(doc.id, 0);
  const current = versions.itens[0]!;
  expect(current).toEqual(versionRow(s, n, updated));
  expect(versions.itens).toHaveLength(n);
  if (n === 2) expect(versions.itens[1]).toEqual(versionRow(s, 1, false));
  for (const version of versions.itens) {
    const file = versions.arquivos[version.id_arquivo]!;
    expect(file).toEqual(fileRow(s, version.id_arquivo === s.file));
    expect(hashDiverge(version.hash, file.sha256)).toBe(false);
  }
  return { doc, current, old: versions.itens[1] };
}
const documentReads = (s: Scope, n: number, updated: boolean) =>
  n ? [contractList(s, n), detail(s, n), ...versionReads(s, n, updated)] : [contractList(s, 0)];

const uploadArgs = (s: Scope, f: File) => ({
  id_organizacao: s.org,
  id_contrato: s.contract,
  nome_arquivo: f.name,
  mime: f.type,
  tamanho: f.size,
});
function upload(s: Scope, f: File, allowed: boolean): Exchange[] {
  const path = s.org + "/" + s.contract + "/documento.pdf";
  const sign = edge(
    "storage-sign-upload",
    uploadArgs(s, f),
    allowed
      ? {
          ok: true,
          bucket: "fixture-documents",
          path,
          token: "fixture-upload",
          usar_upload_resumivel: false,
        }
      : { ok: false, codigo: "AUTH_ACESSO_NEGADO" },
    allowed ? 200 : 403,
  );
  return allowed
    ? [
        sign,
        {
          method: "PUT",
          path: "/storage/v1/object/upload/sign/fixture-documents/" + path,
          query: { token: "fixture-upload" },
          file: f,
          status: 200,
          data: { Key: path },
        },
        rpc(
          "confirmar_upload_arquivo",
          {
            p_id_organizacao: s.org,
            p_id_contrato: s.contract,
            p_path: path,
            p_nome_original: f.name,
            p_mime: f.type,
            p_tamanho: f.size,
            p_sha256: hash(s.content),
            p_origem: "upload_usuario",
          },
          s.file,
        ),
      ]
    : [sign];
}
const url = (s: Scope) => "https://f54.invalid/fixture/" + s.file;
const download = (s: Scope, allowed: boolean) =>
  edge(
    "storage-sign-download",
    { id_arquivo: s.file },
    allowed ? { ok: true, signed_url: url(s) } : { ok: false, codigo: "REGISTRO_NAO_ENCONTRADO" },
    allowed ? 200 : 404,
  );
function writeStep(c: Case, s: Scope, status = 200, code = denied.code) {
  const args =
    c[1] === "V110"
      ? {
          p_id_contrato: s.contract,
          p_tipo: form.tipo,
          p_titulo: form.titulo,
          p_categoria: form.categoria,
          p_vigencia_inicio: form.vigenciaInicio,
          p_vigencia_fim: null,
          p_observacoes: null,
          p_id_arquivo: s.file,
          p_chave_idempotencia: s.request,
        }
      : {
          p_id_documento: s.document,
          p_id_arquivo: s.file,
          p_motivo: "Nova versão F5.4",
          p_chave_idempotencia: s.request,
        };
  return rpc(
    producer(c),
    args,
    status === 200
      ? {
          id_documento: s.document,
          id_versao: s.version,
          numero_versao: number(c),
          id_arquivo: s.file,
          correlation_id: s.correlation,
        }
      : { ...denied, code },
    status,
  );
}
const write = (c: Case, s: Scope, file = s.file) =>
  c[1] === "V110"
    ? criarDocumentoCompleto(s.contract, form, file, s.request)
    : adicionarVersao(s.document, file, " Nova versão F5.4 ", s.request);

const signal = () => new AbortController().signal;
const page = (limite: number, total = 0) => ({ offset: 0, limite, total });
const counts = {
  pendentes: 1,
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
};
const actions = { executar_analise: true, reanalisar: true, abrir_requisito: true };
const competence = (s: Scope) => ({
  id: s.competence,
  id_contrato: s.contract,
  id_organizacao: s.org,
  competencia_referencia: "2026-11-01",
  situacao: "pendente_correcao",
});
const execution = (s: Scope) => ({ id: s.execution, status: "concluido", hash_entrada: s.oldHash });
const result = (s: Scope) => ({
  id: s.result,
  id_execucao: s.execution,
  resultado: "conforme",
  mecanismo: "deterministico",
  hash_evidencias: s.oldHash,
});
const priorText = "Trecho sintético da versão anterior";
const evidence = (s: Scope) => ({
  id: s.evidence,
  pagina: 1,
  trecho: priorText,
  tipo_evidencia: "documento",
  hash: s.oldHash,
  documento: {
    id_versao_documento: s.oldVersion,
    numero_versao: 1,
    hash_versao: s.oldHash,
    id_arquivo: s.oldFile,
    status_seguranca: "aprovado",
  },
});
const analysisArgs = (s: Scope) => ({
  p_id_competencia: s.competence,
  p_resultados_offset: 0,
  p_resultados_limite: 25,
  p_execucoes_offset: 0,
  p_execucoes_limite: 10,
  p_apontamentos_offset: 0,
  p_apontamentos_limite: 25,
  p_filtro_resultado: null,
  p_filtro_criticidade: null,
  p_filtro_mecanismo: null,
  p_filtro_apontamento_status: null,
  p_busca: null,
});
const detailArgs = (s: Scope) => ({
  p_id_competencia: s.competence,
  p_id_requisito: s.requirement,
  p_evidencias_offset: 0,
  p_evidencias_limite: 25,
  p_historico_offset: 0,
  p_historico_limite: 25,
  p_apontamentos_offset: 0,
  p_apontamentos_limite: 25,
});
const audit = (c: Case, s: Scope) => ({
  id: s.event,
  criado_em: date,
  evento: name(c),
  entidade: entity(c),
  origem: "usuario",
  id_usuario: s.actor,
  id_entidade: relation(c, s),
  correlation_id: s.correlation,
});
type Readback = {
  resultId?: string;
  event?: string;
  entityId?: string | null;
  correlation?: string;
  previousHash?: string | null;
  stale?: boolean;
  sourceVersion?: string;
  sourceHash?: string | null;
  page?: number;
  retainedVersion?: string | null;
};
function consumer(c: Case, s: Scope, allowed: boolean): Exchange[] {
  if (c[2] === "V110" || c[2] === "V111")
    return [detail(s, allowed ? number(c) : 0), download(s, allowed)];
  if (c[2] === "V107") {
    const row = rest(
      "fontes_normativas",
      { ...on("id_organizacao", s.org), ...byContract(s) },
      allowed
        ? [{ id: s.source, id_organizacao: s.org, id_contrato: s.contract, titulo: form.titulo }]
        : [],
    );
    if (!allowed) return [row];
    return [
      row,
      rest("versoes_fontes_normativas", on("id_fonte", s.source), [
        {
          id: s.sourceVersion,
          id_fonte: s.source,
          id_arquivo: s.file,
          hash: hash(s.content),
          versao: 2,
        },
        {
          id: s.priorSourceVersion,
          id_fonte: s.source,
          id_arquivo: s.oldFile,
          hash: s.oldHash,
          versao: 1,
        },
      ]),
      rest("versoes_fontes_normativas", on("id", s.sourceVersion), [
        { conteudo_texto: "Trecho sintético atual", metadados: { pagina: 2 } },
      ]),
      rest("paginas_documento", on("id_versao_documento", s.version), [
        {
          id: s.page,
          id_versao_documento: s.version,
          numero_pagina: 2,
          texto_extraido: "Trecho sintético atual",
        },
      ]),
      rest(
        "fragmentos_documento",
        { ...on("id_versao_documento", s.version), pagina_inicio: "lte.2", pagina_fim: "gte.2" },
        [
          {
            id: s.fragment,
            id_versao_documento: s.version,
            pagina_inicio: 2,
            pagina_fim: 2,
            texto: "Trecho sintético atual",
          },
        ],
      ),
    ];
  }
  if (c[2] === "V123")
    return [
      rpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, allowed),
      rest(
        c[3],
        {
          ...on("id_organizacao", s.org),
          ...on("evento", name(c)),
          ...on("entidade", entity(c)),
          ...on("correlation_id", s.correlation),
        },
        allowed ? [audit(c, s)] : [],
      ),
    ];
  if (c[2] === "V116")
    return [
      rpc(
        c[3],
        analysisArgs(s),
        allowed
          ? {
              schema_versao: "v116-v1",
              competencia: competence(s),
              estado_analise: "stale",
              stale: true,
              percentual: 0,
              blocking_summary: counts,
              allowed_actions: actions,
              execucao_atual: execution(s),
              mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
              resultados: [
                {
                  ...result(s),
                  id_resultado: s.result,
                  id_requisito: s.requirement,
                  requisito: { codigo: "F54" },
                  evidencias: [evidence(s)],
                },
              ],
              resultados_paginacao: page(25, 1),
              execucoes: [execution(s)],
              execucoes_paginacao: page(10, 1),
              apontamentos: [],
              apontamentos_paginacao: page(25),
            }
          : denied,
        allowed ? 200 : 403,
      ),
    ];
  return [
    rpc(
      c[3],
      detailArgs(s),
      allowed
        ? {
            schema_versao: "v117-v1",
            competencia: competence(s),
            requisito: { id: s.requirement, codigo: "F54", aplicavel: true },
            execucao_atual: execution(s),
            resultado_atual: null,
            resultado_referencia: result(s),
            na_validade: null,
            allowed_actions: actions,
            evidencias: [evidence(s)],
            evidencias_paginacao: page(25, 1),
            historico: [
              {
                id_resultado: s.result,
                id_execucao: s.execution,
                resultado: "conforme",
                hash_entrada: s.oldHash,
              },
            ],
            historico_paginacao: page(25, 1),
            apontamentos: [],
            apontamentos_paginacao: page(25),
          }
        : denied,
      allowed ? 200 : 403,
    ),
  ];
}

async function consume(c: Case, s: Scope, allowed: boolean): Promise<Readback> {
  if (c[2] === "V110" || c[2] === "V111") {
    const request = obterDocumento(s.contract, s.document);
    if (!allowed) {
      await expect(request).rejects.toMatchObject({ tipo: "nao_encontrado" });
      await expect(baixarDocumento(s.file)).rejects.toMatchObject({ tipo: "erro" });
      expect(window.open).not.toHaveBeenCalled();
      return {};
    }
    const read = await request;
    expect(read).toEqual(documentRow(s, number(c)));
    await baixarDocumento(s.file);
    expect(window.open).toHaveBeenCalledWith(url(s), "_blank", "noopener,noreferrer");
    return { resultId: read.id };
  }
  if (c[2] === "V107") {
    const sources = await listarFontes({
      org: s.org,
      contrato: s.contract,
      escopo: "contrato",
      situacao: "",
      pagina: 0,
    });
    expect(sources.itens.map((x) => [x.id, x.id_contrato, x.id_organizacao])).toEqual(
      allowed ? [[s.source, s.contract, s.org]] : [],
    );
    if (!allowed) return {};
    const versions = await listarVersoesNormativas(sources.itens[0]!.id, 0);
    expect(versions.itens).toMatchObject([
      { id: s.sourceVersion, id_arquivo: s.file, hash: hash(s.content), versao: 2 },
      { id: s.priorSourceVersion, id_arquivo: s.oldFile, hash: s.oldHash, versao: 1 },
    ]);
    const text = await obterTextoVersao(versions.itens[0]!.id);
    const pages = await listarPaginas(s.version, 0);
    const fragments = await listarFragmentos(s.version, 0, 2);
    expect(text).toMatchObject({ texto: pages.itens[0]!.texto_extraido, truncado: false });
    expect(JSON.parse(text.metadados!)).toEqual({ pagina: pages.itens[0]!.numero_pagina });
    expect(fragments.itens[0]).toMatchObject({
      id: s.fragment,
      id_versao_documento: s.version,
      pagina_inicio: 2,
      texto: text.texto,
    });
    return {
      resultId: sources.itens[0]!.id,
      sourceVersion: versions.itens[0]!.id,
      sourceHash: versions.itens[0]!.hash,
      page: pages.itens[0]!.numero_pagina,
    };
  }
  if (c[2] === "V123") {
    expect(await podeConsultarAuditoria(s.org)).toBe(allowed);
    const rows = await obterEventosAuditoria({
      idOrganizacao: s.org,
      pagina: 0,
      evento: name(c),
      entidade: entity(c),
      correlationId: s.correlation,
    });
    expect(rows.eventos).toEqual(allowed ? [audit(c, s)] : []);
    const row = rows.eventos[0];
    return row
      ? {
          resultId: row.id,
          event: row.evento,
          entityId: row.id_entidade,
          correlation: row.correlation_id,
        }
      : {};
  }
  if (c[2] === "V116") {
    const result = await obterAnaliseCompetencia(
      s.competence,
      FILTROS_VAZIOS,
      OFFSETS_ZERO,
      signal(),
    );
    const view = parseAnaliseV116(result.data);
    if (!allowed) {
      expect(classificarErroV116(result.error, result.status)).toBe("sem_permissao");
      expect(view).toBeNull();
      return {};
    }
    expect(result.data).toMatchObject({ competencia: competence(s) });
    expect(view).toMatchObject({
      competencia: { id: s.competence },
      stale: true,
      execucao_atual: { id: s.execution, hash_entrada: s.oldHash },
      allowed_actions: { reanalisar: true },
    });
    return {
      resultId: view!.competencia.id,
      stale: view!.stale,
      previousHash: view!.execucao_atual!.hash_entrada,
    };
  }
  const reply = await obterDetalheRequisito(
    s.competence,
    s.requirement,
    OFFSETS_DETALHE_ZERO,
    signal(),
  );
  const view = parseDetalheV117(reply.data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO);
  if (!allowed) {
    expect(classificarErroV117(reply.error, reply.status)).toBe("sem_permissao");
    expect(view).toBeNull();
    return {};
  }
  expect(reply.data).toMatchObject({ competencia: competence(s) });
  expect(view).toMatchObject({
    requisito: { id: s.requirement },
    resultado_atual: null,
    resultado_referencia: { id: s.result },
    evidencias: [evidence(s)],
  });
  return {
    resultId: view!.requisito.id,
    page: view!.evidencias[0]!.pagina!,
    retainedVersion: view!.evidencias[0]!.documento!.id_versao_documento,
  };
}

function observe(c: Case, actor: Scope, kind: "positive" | "negative", readback: object) {
  observations.push({
    caseId: "IFV1-F5-C" + c[0],
    kind,
    mode: "CODE_FIXTURE",
    origin: c[1],
    destination: c[2],
    frontier: c[3],
    actor: actor.actor,
    role: actor.role,
    tenant: actor.org,
    target: A.org,
    operation: c[1] === "V110" ? "create" : "add_version",
    decision: kind === "positive" ? "ALLOW" : "DENY",
    frontend: process.env["F5_FRONTEND_SHA"],
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"],
    run: process.env["GITHUB_RUN_ID"],
    attempt: process.env["GITHUB_RUN_ATTEMPT"],
    job: process.env["JOB_ID"],
    readback,
  });
}

describe("F5 V110/V111 document scope isolation", () => {
  for (const c of cases) {
    const runUpload = c[0] === "0288";
    const n = number(c);
    const caseId = "IFV1-F5-C" + c[0];
    it(caseId + " positive: document change and lineage remain scoped", async () => {
      const f = new File([A.content], "documento.pdf", { type: "application/pdf" });
      use(
        A,
        ...documentReads(A, n - 1, false),
        ...(runUpload ? upload(A, f, true) : []),
        writeStep(c, A),
        ...documentReads(A, n, true),
        ...consumer(c, A, true),
      );
      const before = await readDocument(A, n - 1, false);
      const id = runUpload ? await enviarArquivoCertificado(A.org, A.contract, f, {}) : A.file;
      expect(id).toBe(A.file);
      const written = await write(c, A, id);
      const saved = await readDocument(A, n, true);
      expect(written).toEqual({
        id_documento: saved!.doc.id,
        id_versao: saved!.current.id,
        id_arquivo: saved!.current.id_arquivo,
        numero_versao: n,
      });
      if (before) expect(saved?.old).toEqual(before.current);
      const linked = await consume(c, A, true);
      const mutation = calls.find((q) => q.path === "/rest/v1/rpc/" + producer(c))!;
      if (c[2] === "V123")
        expect(linked.correlation).toBe(
          (mutation.data as { correlation_id: string }).correlation_id,
        );
      observe(c, A, "positive", {
        ...linked,
        producer: producer(c),
        organizationId: A.org,
        contractId: A.contract,
        documentId: written.id_documento,
        versionId: written.id_versao,
        fileId: written.id_arquivo,
        number: n,
        sha256: saved!.current.hash,
        oldVersionId: saved!.old?.id,
        oldFileId: saved!.old?.id_arquivo,
        oldHash: saved!.old?.hash,
        uploadVerified: runUpload
          ? calls.some((q) => q.path.endsWith("/confirmar_upload_arquivo"))
          : undefined,
        downloadVerified:
          c[2] === "V110" || c[2] === "V111"
            ? vi.mocked(window.open).mock.calls.length === 1
            : undefined,
        foreignVisible: false,
      });
    });
    it(caseId + " negative: foreign document action has no effect or link", async () => {
      const f = new File([A.content], "documento.pdf", { type: "application/pdf" });
      use(
        B,
        ...documentReads(B, 1, false),
        ...(runUpload ? upload(A, f, false) : []),
        writeStep(c, A, 403),
        contractList(A, 0),
        ...consumer(c, A, false),
        ...documentReads(B, 1, false),
      );
      const before = await readDocument(B, 1, false);
      if (runUpload)
        await expect(enviarArquivoCertificado(A.org, A.contract, f, {})).rejects.toMatchObject({
          tipo: "negado",
        });
      await expect(write(c, A)).rejects.toMatchObject({ tipo: "negado" });
      expect(await readDocument(A, 0, false)).toBeUndefined();
      expect(await consume(c, A, false)).toEqual({});
      expect(await readDocument(B, 1, false)).toEqual(before);
      const mutations = calls.filter((q) => q.path === "/rest/v1/rpc/" + producer(c));
      expect(mutations).toHaveLength(1);
      expect(mutations[0]?.status).toBe(403);
      expect(window.open).not.toHaveBeenCalled();
      const conflict = c[0] === "0315";
      use(
        A,
        ...(conflict ? [writeStep(c, A, 409, "PT409"), writeStep(c, A, 502, "XX000")] : []),
        ...documentReads(A, n - 1, false),
      );
      if (conflict) {
        await expect(write(c, A)).rejects.toMatchObject({ tipo: "conflito" });
        await expect(write(c, A)).rejects.toMatchObject({ tipo: "erro" });
        expect(hashDiverge(hash(A.content), A.oldHash)).toBe(true);
      }
      const unchanged = await readDocument(A, n - 1, false);
      observe(c, B, "negative", {
        producer: producer(c),
        ownOrganizationId: B.org,
        ownContractId: B.contract,
        ownMaterialId: before!.doc.id,
        ownVersionId: before!.current.id,
        ownSha256: before!.current.hash,
        targetNumber: unchanged?.doc.versao_atual ?? 0,
        foreignVisible: false,
        mutationCount: 0,
        status: mutations[0]!.status,
        code: (mutations[0]!.data as typeof denied).code,
        urlOpened: false,
        uploadDenied: runUpload
          ? calls.some((q) => q.path.endsWith("/storage-sign-upload") && q.status === 403)
          : undefined,
        classifiedConflict: conflict ? "conflito" : undefined,
        classifiedTransport: conflict ? "erro" : undefined,
      });
    });
  }
});
afterAll(() => {
  const dest = process.env["F5_OBSERVATIONS"];
  if (dest) writeFileSync(dest, JSON.stringify(observations, null, 2) + "\n");
});

import { createHash } from "node:crypto";
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
  classificarErroV115,
  obterDocumentosCompetencia,
  parseLeituraV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  classificarErroVisaoGeral,
  derivarEstadoVisual,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  chamarV107,
  listarAplicabilidades,
  listarVersoes,
} from "@/lib/contratos/baseNormativaDados";
import {
  executarComandoLista,
  montarComandoLista,
  obterLista,
  type ContextoLista,
} from "@/lib/contratos/listaOperacionalDados";
import {
  criarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";
import {
  chamarV108,
  listarPropostas,
  listarRubricas,
  listarVersoesProposta,
  obterArquivosPorIds,
} from "@/lib/contratos/orcamentoDados";
import { listarItens, listarListas, listarVersoesLista } from "@/lib/contratos/regrasDados";

const boundary = vi.hoisted(() => ({ fetch: vi.fn(), session: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f5-fixture.invalid", "fixture-key", {
      accessToken: async () => boundary.session,
      global: { fetch: (input, init) => boundary.fetch(input, init) },
    }),
  };
});

const uid = (side: string, n: number) =>
  side + "5300000-0000-4000-8000-" + String(n).padStart(12, "0");
const hash = (data: string) => createHash("sha256").update(data).digest("hex");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  approver: role === "administrador" ? actor : uid(side, 3),
  session: "fixture-f53-" + side,
  contract: uid(side, 1),
  source: uid(side, 11),
  sourceVersion: uid(side, 12),
  application: uid(side, 13),
  budget: uid(side, 21),
  budgetVersion: uid(side, 22),
  rubrica: uid(side, 23),
  sourceFile: uid(side, 24),
  list: uid(side, 31),
  listVersion: uid(side, 32),
  item: uid(side, 33),
  competence: uid(side, 41),
  requirement: uid(side, 42),
  execution: uid(side, 43),
  result: uid(side, 44),
  opinion: uid(side, 45),
  event: uid(side, 50),
  correlation: uid(side, 51),
  request: uid(side, 52),
  retry: uid(side, 53),
  sourceHash: hash("Fonte F5.3 " + side),
  budgetHash: hash("Orçamento F5.3 " + side),
  snapshotHash: hash("Histórico F5.3 " + side),
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
const date = "2026-11-01T12:00:00Z";
const updated = "2026-11-02T12:00:00Z";
const month = "2026-11";
const validFrom = month + "-01";
const reason = "Conferência material F5.3";
const issue = (code: string) => ({ code, message: "Resposta sintética " + code });
const denied = issue("42501");
const signal = () => new AbortController().signal;

type Fields = Record<string, string>;
type Query = {
  method: "GET" | "POST";
  path: string;
  filters?: Fields;
  select?: string[];
  args?: Record<string, unknown>;
  status: number;
  data: unknown;
};
const pending: Query[] = [];
const executed: Query[] = [];
const observations: object[] = [];
const from = (path: string, filters: Fields, select: string[], data: unknown[]): Query => ({
  method: "GET",
  path,
  filters,
  select,
  status: 200,
  data,
});
const rpc = (name: string, args: Record<string, unknown>, data: unknown, status = 200): Query => ({
  method: "POST",
  path: "rpc/" + name,
  args,
  status,
  data,
});
const eq = (field: string, value: string) => ({ [field]: "eq." + value });
const ids = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.contract });
const page = (limite: number, total = 0) => ({ offset: 0, limite, total });

beforeEach(() => {
  pending.length = 0;
  executed.length = 0;
  boundary.fetch.mockReset().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const expected = pending.shift();
    if (!expected) throw new Error("Unexpected synthetic request");
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f5-fixture.invalid");
    expect(url.pathname).toBe("/rest/v1/" + expected.path);
    expect(init?.method).toBe(expected.method);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer " + boundary.session);
    const filters = Object.fromEntries(
      [...url.searchParams].filter(
        ([key]) => !["select", "order", "offset", "limit"].includes(key),
      ),
    );
    expect(filters).toEqual(expected.filters ?? {});
    for (const col of expected.select ?? []) {
      expect((url.searchParams.get("select") ?? "").split(",")).toContain(col);
    }
    expect(init?.body ? JSON.parse(String(init.body)) : undefined).toEqual(expected.args);
    executed.push(expected);
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(expected.data)) {
      headers.set("content-range", expected.data.length ? "0-0/" + expected.data.length : "*/0");
    }
    return new Response(JSON.stringify(expected.data), { status: expected.status, headers });
  });
});
afterEach(() => {
  expect(pending).toHaveLength(0);
  expect(boundary.fetch).toHaveBeenCalledTimes(executed.length);
});
function requests(actor: Scope, ...queries: Query[]) {
  expect(pending).toHaveLength(0);
  boundary.session = actor.session;
  pending.push(...queries);
}

const cases = [
  ["0192", "V107", "V109", "listas_verificacao"],
  ["0200", "V107", "V113", "criar_competencia"],
  ["0202", "V107", "V116", "obter_analise_competencia_v116"],
  ["0203", "V107", "V117", "obter_detalhe_requisito_v117"],
  ["0204", "V107", "V118", "pareceres_internos"],
  ["0205", "V107", "V119", "obter_visao_geral_competencia"],
  ["0208", "V107", "V123", "eventos_auditoria"],
  ["0232", "V108", "V116", "obter_analise_competencia_v116"],
  ["0233", "V108", "V118", "pareceres_internos"],
  ["0234", "V108", "V119", "obter_visao_geral_competencia"],
  ["0237", "V108", "V123", "eventos_auditoria"],
  ["0260", "V109", "V113", "criar_competencia"],
  ["0262", "V109", "V114", "obter_visao_geral_competencia"],
  ["0263", "V109", "V115", "obter_documentos_competencia_v115"],
  ["0264", "V109", "V116", "obter_analise_competencia_v116"],
  ["0265", "V109", "V117", "obter_detalhe_requisito_v117"],
  ["0268", "V109", "V123", "eventos_auditoria"],
] as const;
type Case = (typeof cases)[number];
type Origin = Case[1];
const producers = {
  V107: "definir_aplicabilidade_fonte_v107",
  V108: "publicar_versao_proposta_v108",
  V109: "executar_comando_lista_v1",
} as const;
const auditContracts = {
  V107: { name: "V107AplicabilidadeDefinida", table: "aplicabilidades_fonte" },
  V108: { name: "V108VersaoPublicada", table: "versoes_proposta" },
  V109: { name: "ListaOperacionalAlterada", table: "listas_verificacao" },
} as const;
const sourceVersion = (s: Scope) => ({
  id: s.sourceVersion,
  id_fonte: s.source,
  versao: 2,
  inicio_vigencia: validFrom,
  fim_vigencia: null,
  id_arquivo: s.sourceFile,
  hash: s.sourceHash,
  aprovado_por: s.approver,
  aprovado_em: date,
  criado_em: date,
});
const application = (s: Scope, applied: boolean) => ({
  id: s.application,
  id_fonte_versao: s.sourceVersion,
  aplicavel: applied,
  fundamento: applied ? reason : null,
  aprovado_por: applied ? s.approver : null,
  aprovado_em: applied ? updated : null,
  atualizado_em: applied ? updated : date,
});
const budget = (s: Scope, published: boolean) => ({
  id: s.budget,
  ...ids(s),
  titulo: "Proposta sintética",
  situacao: published ? "ativa" : "rascunho",
  versao_atual: published ? 1 : null,
  versao_registro: published ? 2 : 1,
  criado_em: date,
  atualizado_em: published ? updated : date,
});
const budgetVersion = (s: Scope, published: boolean) => ({
  id: s.budgetVersion,
  id_proposta: s.budget,
  numero_versao: 1,
  vigencia_inicio: validFrom,
  vigencia_fim: null,
  valor_total: 1200,
  hash: s.budgetHash,
  situacao: published ? "publicada" : "rascunho",
  aprovado_por: published ? s.approver : null,
  aprovado_em: published ? updated : null,
  criado_em: date,
  id_arquivo_origem: s.sourceFile,
});
const rubrica = (s: Scope) => ({
  id: s.rubrica,
  id_versao_proposta: s.budgetVersion,
  codigo: "F53",
  grupo: "Custeio",
  rubrica: "Serviço",
  valor_mensal_previsto: 100,
  valor_anual_previsto: 1200,
  versao_registro: 1,
  criado_em: date,
});
const file = (s: Scope) => ({
  id: s.sourceFile,
  nome_original: "base-sintetica.pdf",
  mime: "application/pdf",
  tamanho: 256,
  status_seguranca: "aprovado",
  criado_em: date,
});
const listHeader = (s: Scope, published: boolean) => ({
  id: s.list,
  ...ids(s),
  nome: "Lista sintética",
  descricao: null,
  situacao: published ? "ativa" : "rascunho",
  versao_registro: published ? 2 : 1,
  versao_atual: published ? 1 : 0,
  atualizado_em: published ? updated : date,
});
const listVersion = (s: Scope, published: boolean) => ({
  id: s.listVersion,
  ...ids(s),
  id_lista: s.list,
  numero_versao: 1,
  situacao: published ? "publicada" : "rascunho",
  vigencia_inicio: validFrom,
  vigencia_fim: null,
  aprovado_em: published ? updated : null,
});
const listItem = (s: Scope) => ({
  id: s.item,
  ...ids(s),
  id_versao_lista: s.listVersion,
  codigo: "F53",
  descricao: "Requisito documental",
  categoria: "documental",
  obrigatorio: true,
  aplicavel: true,
  impeditivo: true,
  criticidade: "alta",
  id_fonte_versao: s.sourceVersion,
  regra_validacao: { tipo: "documento" },
  ordem: 1,
  pode_remover: false,
});
const listContext = (s: Scope, actor = s): ContextoLista => ({
  idUsuario: actor.actor,
  idOrganizacao: s.org,
  idContrato: s.contract,
});
const listReadArgs = (s: Scope) => ({
  p_id_organizacao: s.org,
  p_id_contrato: s.contract,
  p_id_lista: s.list,
  p_id_versao: s.listVersion,
  p_pagina_versoes: 0,
  p_pagina_itens: 0,
});
function listState(s: Scope, published: boolean) {
  const edit = s.role === "administrador";
  return {
    schema_versao: "crud-lista-v1",
    ...ids(s),
    lista: listHeader(s, published),
    versao: listVersion(s, published),
    versoes: [listVersion(s, published)],
    itens: [listItem(s)],
    total_versoes: 1,
    total_itens: 1,
    pagina_versoes: 0,
    pagina_itens: 0,
    acoes: {
      criar_lista: edit,
      editar_lista: edit,
      criar_versao: edit,
      editar_vigencia_rascunho: edit && !published,
      criar_item: edit && !published,
      editar_item: edit && !published,
      remover_item: false,
      publicar_versao: edit && !published,
      encerrar_vigencia: edit && published,
      alterar_situacao: edit,
      descartar_rascunho: false,
    },
    exclusao_lista_permitida: false,
    motivo_retencao: "Preservar histórico",
    vigencia_fim_minima: null,
  };
}

const sourceQuery = (s: Scope) =>
  from(
    "versoes_fontes_normativas",
    eq("id_fonte", s.source),
    ["id", "id_fonte", "hash", "inicio_vigencia", "aprovado_em"],
    [sourceVersion(s)],
  );
function materialQueries(origin: Origin, s: Scope, changed: boolean) {
  if (origin === "V107")
    return [
      sourceQuery(s),
      from(
        "aplicabilidades_fonte",
        { ...eq("id_contrato", s.contract), id_fonte_versao: "in.(" + s.sourceVersion + ")" },
        ["id", "id_fonte_versao", "aplicavel", "fundamento"],
        [application(s, changed)],
      ),
    ];
  if (origin === "V108")
    return [
      from(
        "propostas_orcamentarias",
        eq("id_contrato", s.contract),
        ["id", "id_organizacao", "id_contrato", "versao_atual"],
        [budget(s, changed)],
      ),
      from(
        "versoes_proposta",
        eq("id_proposta", s.budget),
        ["id", "hash", "vigencia_inicio", "situacao"],
        [budgetVersion(s, changed)],
      ),
      from(
        "linhas_orcamentarias",
        eq("id_versao_proposta", s.budgetVersion),
        ["id", "id_versao_proposta", "valor_anual_previsto"],
        [rubrica(s)],
      ),
      from("arquivos", { id: "in.(" + s.sourceFile + ")" }, ["id", "status_seguranca"], [file(s)]),
    ];
  return [
    rpc("obter_lista_operacional_v1", listReadArgs(s), listState(s, changed)),
    sourceQuery(s),
  ];
}
async function material(origin: Origin, s: Scope, changed: boolean) {
  if (origin === "V107") {
    const versions = await listarVersoes(s.source, 0);
    expect(versions.itens).toEqual([sourceVersion(s)]);
    const version = versions.itens[0]!;
    const records = await listarAplicabilidades(s.contract, [version.id]);
    expect(records).toEqual([application(s, changed)]);
    return {
      ref: records[0]!.id,
      version: version.id,
      validFrom: version.inicio_vigencia,
      checksum: version.hash,
      state: records[0]!.aplicavel ? "aplicavel" : "nao_aplicavel",
    };
  }
  if (origin === "V108") {
    const proposals = await listarPropostas(s.contract, 0);
    expect(proposals.itens).toEqual([budget(s, changed)]);
    const versions = await listarVersoesProposta(proposals.itens[0]!.id, 0);
    expect(versions.itens).toEqual([budgetVersion(s, changed)]);
    const v = versions.itens[0]!;
    const rows = await listarRubricas(v.id, 0);
    expect(rows.itens).toEqual([rubrica(s)]);
    const files = await obterArquivosPorIds([v.id_arquivo_origem!]);
    expect(files).toEqual([file(s)]);
    return {
      ref: v.id,
      version: v.id,
      validFrom: v.vigencia_inicio,
      checksum: v.hash,
      state: v.situacao,
      linkedItem: rows.itens[0]!.id,
      sourceDocId: files[0]!.id,
    };
  }
  const state = await obterLista(listContext(s), s.list, s.listVersion);
  expect(state).toMatchObject(listState(s, changed));
  const versions = await listarVersoes(s.source, 0);
  expect(versions.itens).toEqual([sourceVersion(s)]);
  expect(state.itens[0]!.id_fonte_versao).toBe(versions.itens[0]!.id);
  return {
    ref: state.lista!.id,
    version: state.versao!.id,
    validFrom: state.versao!.vigencia_inicio,
    state: state.versao!.situacao,
    linkedItem: state.itens[0]!.id,
    sourceRef: state.itens[0]!.id_fonte_versao,
    checksum: versions.itens[0]!.hash,
  };
}
function viewDenied(origin: Origin, s: Scope): Query {
  const first = materialQueries(origin, s, false)[0]!;
  return first.method === "GET" ? { ...first, data: [] } : { ...first, status: 403, data: denied };
}
async function foreignMaterialIsHidden(origin: Origin, s: Scope) {
  if (origin === "V107") {
    const p = await listarVersoes(s.source, 0);
    expect(p.itens).toEqual([]);
  } else if (origin === "V108") {
    const p = await listarPropostas(s.contract, 0);
    expect(p.itens).toEqual([]);
  } else {
    await expect(obterLista(listContext(s, B), s.list, s.listVersion)).rejects.toMatchObject({
      tipo: "negado",
    });
  }
}

const sourceArgs = (s: Scope, key: string) => ({
  p_id_organizacao: s.org,
  p_id_contrato: s.contract,
  p_id_versao: s.sourceVersion,
  p_aplicavel: true,
  p_fundamento: reason,
  p_atualizado_em_esperado: date,
  p_chave_idempotencia: key,
});
const budgetArgs = (s: Scope, key: string, expected: string) => ({
  p_id_organizacao: s.org,
  p_id_versao: s.budgetVersion,
  p_hash_esperado: expected,
  p_fundamento: reason,
  p_chave_idempotencia: key,
});
const listArgs = (s: Scope) => ({
  p_id_organizacao: s.org,
  p_id_contrato: s.contract,
  p_id_lista: s.list,
  p_versao_esperada: 1,
  p_acao: "publicar_versao",
  p_payload: { id_versao: s.listVersion },
  p_motivo: reason,
  p_request_id: s.request,
});
type MutationOptions = { status?: number; code?: string; expectedHash?: string; key?: string };
function writeQuery(origin: Origin, s: Scope, options: MutationOptions = {}) {
  const { status = 200, code = "42501", expectedHash = s.budgetHash, key = s.request } = options;
  const args =
    origin === "V107"
      ? sourceArgs(s, key)
      : origin === "V108"
        ? budgetArgs(s, key, expectedHash)
        : listArgs(s);
  const reply =
    origin === "V109"
      ? {
          schema_versao: "crud-lista-v1",
          acao: "publicar_versao",
          ...ids(s),
          lista: listHeader(s, true),
          id_versao: s.listVersion,
          request_id: s.request,
          evento_id: s.event,
        }
      : { correlation_id: s.correlation };
  return rpc(producers[origin], args, status >= 400 ? issue(code) : reply, status);
}
async function write(origin: Origin, actor: Scope, target: Scope, opts: MutationOptions = {}) {
  const key = opts.key ?? target.request;
  if (origin === "V107") return chamarV107(producers.V107, sourceArgs(target, key));
  if (origin === "V108")
    return chamarV108(
      producers.V108,
      budgetArgs(target, key, opts.expectedHash ?? target.budgetHash),
    );
  const c = listContext(target, actor);
  return executarComandoLista(
    c,
    montarComandoLista(
      c,
      target.list,
      1,
      "publicar_versao",
      { id_versao: target.listVersion },
      reason,
      target.request,
    ),
  );
}

const counts = {
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
};
const competence = (s: Scope, stale: boolean) => ({
  id: s.competence,
  ...ids(s),
  competencia_referencia: validFrom,
  situacao: stale ? "pendente_correcao" : "pode_apresentar_contratante",
  periodo_inicio: null,
  periodo_fim: null,
  data_limite: null,
  atualizado_em: date,
  percentual_conformidade: stale ? 0 : 100,
  versao_pacote_atual: null,
  versao_registro: 2,
});
const requirement = (s: Scope) => ({
  id: s.requirement,
  codigo: "F53",
  descricao: "Requisito documental",
  criticidade: "alta",
  origem_tipo: "lista",
  origem_id: s.item,
  origem_versao: s.listVersion,
  fonte_tipo: "normativa",
  fonte_referencia: s.sourceVersion,
  fonte_detalhe: { vigencia_inicio: validFrom },
  hash_snapshot: s.snapshotHash,
  aplicavel: true,
  obrigatorio: true,
  impeditivo: true,
  efeito_portao: true,
});
const execution = (s: Scope) => ({
  id: s.execution,
  status: "concluido",
  hash_entrada: s.snapshotHash,
});
const result = (s: Scope) => ({
  id: s.result,
  id_execucao: s.execution,
  resultado: "conforme",
  mecanismo: "deterministico",
  justificativa: "Registro anterior",
  hash_evidencias: s.snapshotHash,
});
const overview = (s: Scope, stale: boolean) => ({
  competencia: competence(s, stale),
  portao: {
    ...counts,
    pendentes: stale ? 1 : 0,
    liberado: !stale,
    total: 1,
    conformes_ou_na_validos: stale ? 0 : 1,
    percentual: stale ? 0 : 100,
  },
  blocking_summary: {
    ...counts,
    pendentes: stale ? 1 : 0,
    parecer_aprovado: !stale,
    analise_concluida_atual: !stale,
    aprovacao_apresentacao_atual: !stale,
  },
  allowed_actions: {
    abrir_documentos: true,
    analisar: true,
    abrir_parecer: true,
    apresentar: !stale,
  },
});
const analysisBody = (s: Scope) => ({
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
const analysisData = (s: Scope, stale: boolean) => ({
  schema_versao: "v116-v1",
  competencia: competence(s, stale),
  estado_analise: stale ? "stale" : "complete",
  stale,
  percentual: stale ? 0 : 100,
  blocking_summary: { ...counts, pendentes: Number(stale) },
  allowed_actions: { executar_analise: true, reanalisar: stale, abrir_requisito: true },
  execucao_atual: execution(s),
  mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
  resultados: [
    {
      ...result(s),
      id_resultado: s.result,
      id_requisito: s.requirement,
      requisito: requirement(s),
      evidencias: [],
    },
  ],
  resultados_paginacao: page(25, 1),
  execucoes: [execution(s)],
  execucoes_paginacao: page(10, 1),
  apontamentos: [],
  apontamentos_paginacao: page(25),
});
const detailBody = (s: Scope) => ({
  p_id_competencia: s.competence,
  p_id_requisito: s.requirement,
  p_evidencias_offset: 0,
  p_evidencias_limite: 25,
  p_historico_offset: 0,
  p_historico_limite: 25,
  p_apontamentos_offset: 0,
  p_apontamentos_limite: 25,
});
const detailData = (s: Scope, stale: boolean) => ({
  schema_versao: "v117-v1",
  competencia: competence(s, stale),
  requisito: requirement(s),
  execucao_atual: execution(s),
  resultado_atual: stale ? null : result(s),
  resultado_referencia: result(s),
  na_validade: null,
  allowed_actions: { executar_analise: true, reanalisar: stale, abrir_requisito: true },
  evidencias: [],
  evidencias_paginacao: page(25),
  historico_paginacao: page(25, 1),
  historico: [
    {
      id_resultado: s.result,
      id_execucao: s.execution,
      resultado: "conforme",
      hash_entrada: s.snapshotHash,
    },
  ],
  apontamentos: [],
  apontamentos_paginacao: page(25),
});
const documentData = (s: Scope) => ({
  schema_versao: "v115-v1",
  competencia: competence(s, true),
  estado_documental: "missing_docs",
  resumo: {
    documentos_total: 0,
    requisitos_documentais_total: 1,
    requisitos_documentais_aplicaveis: 1,
    requisitos_documentais_pendentes: 1,
  },
  documentos: [],
  requisitos_documentais: [{ ...requirement(s), tipos_esperados: ["contrato"], atendido: false }],
  documentos_paginacao: page(25),
  requisitos_paginacao: page(25, 1),
  capacidades: { pode_enviar: true, pode_nova_versao: true, motivo_nova_versao_obrigatorio: true },
});
const opinion = (s: Scope) => ({
  id: s.opinion,
  ...ids(s),
  id_competencia: s.competence,
  versao: 1,
  texto: "Histórico sintético",
  status: "aprovado",
  hash: s.snapshotHash,
  autor: null,
  criado_em: date,
  aprovado_por: null,
  aprovado_em: date,
});
const entityId = (origin: Origin, s: Scope) =>
  origin === "V107" ? s.application : origin === "V108" ? s.budgetVersion : s.list;
const event = (origin: Origin, s: Scope) => ({
  id: s.event,
  criado_em: updated,
  evento: auditContracts[origin].name,
  entidade: auditContracts[origin].table,
  origem: "usuario",
  id_usuario: s.actor,
  id_entidade: entityId(origin, s),
  correlation_id: s.correlation,
});
const overviewQuery = (s: Scope, allowed: boolean, stale = true) =>
  rpc(
    "obter_visao_geral_competencia",
    { p_id_competencia: s.competence },
    allowed ? overview(s, stale) : denied,
    allowed ? 200 : 403,
  );

function consumeQueries(c: Case, s: Scope, allowed: boolean, stale = true): Query[] {
  const read = (name: string, args: Record<string, unknown>, payload: object | string) =>
    rpc(name, args, allowed ? payload : denied, allowed ? 200 : 403);
  switch (c[2]) {
    case "V109": {
      const listing = from(
        "listas_verificacao",
        eq("id_contrato", s.contract),
        ["id", "versao_atual"],
        allowed ? [listHeader(s, true)] : [],
      );
      return allowed
        ? [
            listing,
            from(
              "versoes_lista",
              eq("id_lista", s.list),
              ["id", "id_lista", "vigencia_inicio"],
              [listVersion(s, true)],
            ),
            from(
              "itens_lista",
              eq("id_versao_lista", s.listVersion),
              ["id", "id_fonte_versao", "aplicavel"],
              [listItem(s)],
            ),
          ]
        : [listing];
    }
    case "V113": {
      const creation = read(
        c[3],
        { p_id_contrato: s.contract, p_competencia_referencia: validFrom },
        s.competence,
      );
      return allowed
        ? [
            creation,
            from(
              "competencias",
              { ...eq("id_contrato", s.contract), ...eq("competencia_referencia", validFrom) },
              ["id"],
              [{ id: s.competence }],
            ),
            read("obter_detalhe_requisito_v117", detailBody(s), detailData(s, false)),
          ]
        : [creation];
    }
    case "V114":
    case "V119":
      return [overviewQuery(s, allowed, stale)];
    case "V115":
      return [
        read(
          c[3],
          {
            p_id_competencia: s.competence,
            p_documentos_offset: 0,
            p_documentos_limite: 25,
            p_requisitos_offset: 0,
            p_requisitos_limite: 25,
          },
          documentData(s),
        ),
      ];
    case "V116":
      return [read(c[3], analysisBody(s), analysisData(s, stale))];
    case "V117":
      return [read(c[3], detailBody(s), detailData(s, stale))];
    case "V118":
      return [
        from(
          c[3],
          {
            ...eq("id_competencia", s.competence),
            ...eq("id_organizacao", s.org),
            ...eq("id_contrato", s.contract),
          },
          ["id", "id_organizacao", "id_contrato", "id_competencia", "hash"],
          allowed ? [opinion(s)] : [],
        ),
        overviewQuery(s, allowed, stale),
      ];
    case "V123": {
      const audit = event(c[1], s);
      return [
        rpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, allowed),
        from(
          c[3],
          {
            ...eq("id_organizacao", s.org),
            ...eq("evento", audit.evento),
            ...eq("entidade", audit.entidade),
            ...eq("correlation_id", audit.correlation_id),
          },
          ["id", "id_entidade", "correlation_id"],
          allowed ? [audit] : [],
        ),
      ];
    }
  }
}
async function consumeOverview(s: Scope, allowed: boolean, stale: boolean) {
  const reply = await obterVisaoGeral(s.competence, signal());
  const value = parseVisaoGeral(reply.data);
  if (!allowed) {
    expect(classificarErroVisaoGeral(reply.error, reply.status)).toBe("sem_permissao");
    expect(value).toBeNull();
    return undefined;
  }
  expect(value).toMatchObject({
    competencia: { id: s.competence, ...ids(s) },
    portao: { liberado: !stale },
    blocking_summary: { analise_concluida_atual: !stale },
    allowed_actions: { apresentar: !stale },
  });
  return value!;
}
async function consumeDetail(s: Scope, allowed: boolean, stale: boolean) {
  const r = await obterDetalheRequisito(
    s.competence,
    s.requirement,
    OFFSETS_DETALHE_ZERO,
    signal(),
  );
  const view = parseDetalheV117(r.data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO);
  if (!allowed) {
    expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
    expect(view).toBeNull();
    return undefined;
  }
  expect(r.data).toMatchObject({ competencia: { id: s.competence, ...ids(s) } });
  const original = requirement(s);
  expect(view).toMatchObject({
    competencia: { id: s.competence },
    requisito: { ...original, fonte_detalhe: JSON.stringify(original.fonte_detalhe) },
    resultado_referencia: { id: s.result, id_execucao: s.execution },
  });
  expect(view?.resultado_atual?.id ?? null).toBe(stale ? null : s.result);
  return view!;
}
type ConsumerRead = {
  downstreamId?: string;
  downstreamSource?: string | null;
  snapshot?: string | null;
  canPresent?: boolean;
  stale?: boolean;
  missing?: boolean;
  eventName?: string;
  eventEntity?: string | null;
  correlation?: string;
};
async function consume(c: Case, s: Scope, allowed: boolean, stale = true): Promise<ConsumerRead> {
  switch (c[2]) {
    case "V109": {
      const l = await listarListas(s.contract, 0);
      expect(l.itens.map((v) => v.id)).toEqual(allowed ? [s.list] : []);
      if (!allowed) return {};
      const versions = await listarVersoesLista(l.itens[0]!.id, 0);
      expect(versions.itens[0]).toMatchObject({ id: s.listVersion, vigencia_inicio: validFrom });
      const items = await listarItens(versions.itens[0]!.id, 0);
      expect(items.itens[0]).toMatchObject({
        id: s.item,
        id_fonte_versao: s.sourceVersion,
        aplicavel: true,
      });
      return {
        downstreamId: items.itens[0]!.id,
        downstreamSource: items.itens[0]!.id_fonte_versao,
      };
    }
    case "V113": {
      const creation = criarCompetencia(s.contract, month);
      if (!allowed) {
        await expect(creation).rejects.toMatchObject({ tipo: "sem_permissao" });
        return {};
      }
      const id = await creation;
      expect(id).toBe(s.competence);
      expect(await verificarCompetenciaExistente(s.contract, month)).toBe(id);
      const view = await consumeDetail(s, true, false);
      expect(view?.requisito.origem_versao).toBe(s.listVersion);
      return {
        downstreamId: view!.requisito.id,
        downstreamSource: view!.requisito.fonte_referencia,
        snapshot: view!.requisito.hash_snapshot,
      };
    }
    case "V114":
    case "V119": {
      const view = await consumeOverview(s, allowed, stale);
      if (!view) return {};
      if (c[2] === "V119" && stale) expect(derivarEstadoVisual(view)).not.toBe("ready");
      return { downstreamId: view.competencia.id, canPresent: view.allowed_actions.apresentar };
    }
    case "V115": {
      const r = await obterDocumentosCompetencia(s.competence, 0, 0, signal());
      const view = parseLeituraV115(r.data);
      if (!allowed) {
        expect(classificarErroV115(r.error, r.status)).toBe("sem_permissao");
        expect(view).toBeNull();
        return {};
      }
      expect(view).toMatchObject({
        competencia: { id: s.competence, ...ids(s) },
        requisitos: [
          { id: s.requirement, codigo: "F53", aplicavel: true, obrigatorio: true, atendido: false },
        ],
      });
      return { downstreamId: view!.requisitos[0]!.id, missing: !view!.requisitos[0]!.atendido };
    }
    case "V116": {
      const r = await obterAnaliseCompetencia(s.competence, FILTROS_VAZIOS, OFFSETS_ZERO, signal());
      const view = parseAnaliseV116(r.data);
      if (!allowed) {
        expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
        expect(view).toBeNull();
        return {};
      }
      expect(r.data).toMatchObject({ competencia: { id: s.competence, ...ids(s) } });
      expect(view).toMatchObject({
        competencia: { id: s.competence },
        stale,
        execucao_atual: { id: s.execution, hash_entrada: s.snapshotHash },
        resultados: [{ id_requisito: s.requirement, fonte_referencia: s.sourceVersion }],
      });
      return {
        downstreamId: view!.resultados[0]!.id_requisito,
        downstreamSource: view!.resultados[0]!.fonte_referencia,
        snapshot: view!.execucao_atual!.hash_entrada,
        stale: view!.stale,
      };
    }
    case "V117": {
      const view = await consumeDetail(s, allowed, stale);
      return view
        ? {
            downstreamId: view.requisito.id,
            downstreamSource: view.requisito.fonte_referencia,
            snapshot: view.requisito.hash_snapshot,
          }
        : {};
    }
    case "V118": {
      const r = await listarPareceres(s.competence, s.org, s.contract, 0, signal());
      expect(r.itens.map((p) => p.id)).toEqual(allowed ? [s.opinion] : []);
      const view = await consumeOverview(s, allowed, stale);
      if (!allowed) return {};
      expect(r.itens[0]).toMatchObject({
        id_competencia: s.competence,
        hash: s.snapshotHash,
        status: "aprovado",
      });
      return {
        downstreamId: r.itens[0]!.id,
        snapshot: r.itens[0]!.hash,
        canPresent: view!.allowed_actions.apresentar,
      };
    }
    case "V123": {
      expect(await podeConsultarAuditoria(s.org)).toBe(allowed);
      const expected = event(c[1], s);
      const events = await obterEventosAuditoria({
        idOrganizacao: s.org,
        pagina: 0,
        evento: expected.evento,
        entidade: expected.entidade,
        correlationId: s.correlation,
      });
      expect(events.eventos).toEqual(allowed ? [expected] : []);
      if (!allowed) return {};
      const row = events.eventos[0]!;
      return {
        downstreamId: row.id,
        eventName: row.evento,
        eventEntity: row.id_entidade,
        correlation: row.correlation_id,
      };
    }
  }
}

const assertRefresh = (c: Case) => ["V114", "V116", "V118", "V119"].includes(c[2]);
function record(c: Case, actor: Scope, kind: "positive" | "negative", readback: object) {
  observations.push({
    caseId: "IFV1-F5-C" + c[0],
    kind,
    mode: "CODE_FIXTURE",
    frontend: process.env["F5_FRONTEND_SHA"],
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"],
    run: process.env["GITHUB_RUN_ID"],
    attempt: process.env["GITHUB_RUN_ATTEMPT"],
    job: process.env["JOB_ID"],
    origin: c[1],
    destination: c[2],
    frontier: c[3],
    actor: actor.actor,
    role: actor.role,
    tenant: actor.org,
    target: A.org,
    decision: kind === "positive" ? "ALLOW" : "DENY",
    operation: c[1] === "V107" ? "apply" : "publish",
    readback,
  });
}

describe("F5 V107/V108/V109 normative scope isolation", () => {
  for (const c of cases) {
    const origin = c[1];
    const label = "IFV1-F5-C" + c[0];
    it(label + " positive: authorized material change reaches the scoped consumer", async () => {
      requests(
        A,
        ...materialQueries(origin, A, false),
        ...(assertRefresh(c) ? consumeQueries(c, A, true, false) : []),
        writeQuery(origin, A),
        ...materialQueries(origin, A, true),
        ...consumeQueries(c, A, true),
      );
      const before = await material(origin, A, false);
      const previous = assertRefresh(c) ? await consume(c, A, true, false) : undefined;
      const written = await write(origin, A, A);
      if (origin === "V109")
        expect(written).toMatchObject({
          lista: { id: A.list, ...ids(A), versao_registro: 2 },
          id_versao: A.listVersion,
          request_id: A.request,
          evento_id: A.event,
        });
      else expect(written).toEqual({ correlationId: A.correlation });
      const saved = await material(origin, A, true);
      expect(saved).toMatchObject({
        ref: before.ref,
        version: before.version,
        validFrom: before.validFrom,
      });
      expect(saved.state).not.toBe(before.state);
      if ("checksum" in before) expect(saved).toMatchObject({ checksum: before.checksum });
      const downstream = await consume(c, A, true);
      expect(downstream.downstreamId).toBeDefined();
      if (previous?.downstreamId) expect(downstream.downstreamId).toBe(previous.downstreamId);
      if (previous?.snapshot) expect(downstream.snapshot).toBe(previous.snapshot);
      if (c[2] === "V123") {
        if ("correlationId" in written) expect(downstream.correlation).toBe(written.correlationId);
        else expect(downstream.downstreamId).toBe(A.event);
      }
      const mutation = executed.find((q) => q.path === "rpc/" + producers[origin]);
      expect(mutation?.status).toBe(200);
      record(c, A, "positive", {
        ...saved,
        ...downstream,
        producer: mutation?.path,
        previousState: before.state,
        previousCanPresent: previous?.canPresent,
        previousStale: previous?.stale,
        foreignVisible: false,
        organizationId: A.org,
        contractId: A.contract,
        correlation:
          downstream.correlation ??
          ("correlationId" in written ? written.correlationId : undefined),
        requestId: origin === "V109" ? mutation?.args?.["p_request_id"] : undefined,
      });
    });
    it(label + " negative: foreign material change is denied and remains hidden", async () => {
      requests(
        B,
        ...materialQueries(origin, B, true),
        writeQuery(origin, A, { status: 403 }),
        viewDenied(origin, A),
        ...consumeQueries(c, A, false),
        ...materialQueries(origin, B, true),
      );
      const ownBefore = await material(origin, B, true);
      await expect(write(origin, B, A)).rejects.toMatchObject({ tipo: "negado" });
      await foreignMaterialIsHidden(origin, A);
      const hidden = await consume(c, A, false);
      expect(hidden).toEqual({});
      const ownAfter = await material(origin, B, true);
      expect(ownAfter).toEqual(ownBefore);
      const actions = executed.filter((q) => q.path === "rpc/" + producers[origin]);
      expect(actions).toHaveLength(1);
      const blocked = actions[0]!;
      const effects = actions.filter((q) => q.status < 300).length;
      expect(effects).toBe(0);
      const conflict = c[0] === "0232";
      const unavailable = c[0] === "0264";
      const staleHash = { status: 409, code: "PT409", key: A.retry, expectedHash: A.snapshotHash };
      const transport = { status: 502, code: "XX000" };
      requests(
        A,
        ...(conflict ? [writeQuery(origin, A, staleHash)] : []),
        ...(unavailable ? [writeQuery(origin, A, transport)] : []),
        ...materialQueries(origin, A, false),
      );
      if (conflict)
        await expect(write(origin, A, A, staleHash)).rejects.toMatchObject({ tipo: "conflito" });
      if (unavailable)
        await expect(write(origin, A, A, transport)).rejects.toMatchObject({ tipo: "incerto" });
      const stillUnchanged = await material(origin, A, false);
      expect(stillUnchanged.state).toBe(origin === "V107" ? "nao_aplicavel" : "rascunho");
      record(c, B, "negative", {
        producer: blocked.path,
        ownMaterialId: ownAfter.ref,
        ownVersionId: ownAfter.version,
        ownOrganizationId: B.org,
        ownContractId: B.contract,
        targetMaterialId: stillUnchanged.ref,
        targetState: stillUnchanged.state,
        foreignVisible: hidden.downstreamId !== undefined,
        mutationCount: effects,
        status: blocked.status,
        code: (blocked.data as typeof denied).code,
        rejectedHashAsConflict: conflict ? true : undefined,
        transportSeparated: unavailable ? true : undefined,
      });
    });
  }
});

afterAll(() => {
  const target = process.env["F5_OBSERVATIONS"];
  if (target) writeFileSync(target, JSON.stringify(observations, null, 2) + "\n");
});

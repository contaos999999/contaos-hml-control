/**
 * Executor mutante da Fase 3 da integração funcional V1 (cadastros e relacionamentos).
 * PLAN/GATE: docs/frontend/planos/INTEGRACAO_V1_FASE3_CADASTROS_RELACIONAMENTOS_PLAN_GATE_2026-11-13.md
 *
 * BUILD-1: catálogo derivado da matriz, validadores estritos, orçamento, enums e guarda de escopo.
 * BUILD-2a: esperado por tela (MASTER e leitor) fixado no catálogo, com fonte no código e a
 * fotografia RBAC v6 do perfil leitor.
 * BUILD-2b-1: relatório e SHA256SUMS (também parcial), ledger append-only, livro de intenções,
 * releitura do RBAC, classificador de negação explícita e contrato do YAML.
 * BUILD-2b-2a: proveniência amarrada ao livro (M2), execução do ledger ligada ao artefato (M3),
 * conferência de isolamento que encerra a execução e cerca de mutação ligada ao livro. Os drivers
 * de UI vêm nos incrementos seguintes do BUILD-2b-2; até lá a execução HML grava o relatório
 * BLOCKED, já com o livro, e falha com F3_DRIVER_PENDING.
 * Nunca importado pelo auditor somente leitura.
 */
import { createHash } from "node:crypto";
import { isProxy } from "node:util/types";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import {
  API_ORIGIN,
  INTEGRACAO_V1_FASE3_SCOPE,
  loadSingleRequestProof,
  requestAllowed,
  singleRequestFixturesScope,
} from "./authenticated-visual-audit.mjs";

const fail = (code) => {
  throw Object.assign(new Error(code), { code });
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const F3_MATRIX = Object.freeze({
  path: "docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv",
  blob: "bb7ce43f9c334f2f03e9aafab405addadfe5e19a",
  sha256: "b8b4980bab5f841adc1db9c642e960f45a6874baad660bd18cd6a60ce87e32d9",
  rows: 138,
  mandatory: 120,
  conditional: 18,
});
export const F3_CASES_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json";
// SHA-256 do catálogo publicado (PLAN 7.5); muda só por PR com nova derivação revisada.
export const F3_CASES_SHA256 = "bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb";
// Baseline normativo fixo (PLAN 7.5, M-R2-1): nenhuma leitura nova do repositório develop.
export const F3_BACKEND_SHA = "5eca44aebead3183e81b5c1af0d1dffa5fb8feb6";
export const F3_BUDGET = Object.freeze({ total: 60, perRun: 30, planned: 33, minutes: 45 });
export const F3_CASE_STATUS = Object.freeze(["PASS", "FAIL", "BLOCKED", "N_A_JUSTIFICADO"]);
export const F3_CLEANUP_STATUS = Object.freeze([
  "ISOLATED_NO_DELETE",
  "NO_MUTATION",
  "CLEANUP_FAILED",
]);
export const F3_ERROR_CLASS = Object.freeze(["UI", "VALIDACAO", "BACKEND", "PERMISSAO"]);
export const F3_SECOND_USER_PROFILE = "leitor";

// Ordem de dependência da seção 3 do PLAN; contagens conferidas contra a matriz.
export const F3_PRODUCERS = Object.freeze(
  [
    ["SYS01", "listar_organizacoes_disponiveis", 2],
    ["SYS04", "criar_organizacao", 1],
    ["SYS04", "preferencia_de_organizacao_selecionada", 25],
    ["ADM01", "salvar_vinculo_usuario_adm", 26],
    ["V102", "contratantes", 4],
    ["V103", "atualizar_contratante", 5],
    ["V105", "contratos", 4],
    ["V106", "atualizar_contrato_v1", 11],
    ["V108", "publicar_versao_proposta_v108", 4],
    ["V107", "definir_aplicabilidade_fonte_v107", 7],
    ["V109", "executar_comando_lista_v1", 6],
    ["V110", "criar_documento_contrato_completo", 3],
    ["V111", "adicionar_versao_documento_contrato", 5],
    ["V113", "criar_competencia", 9],
    ["V115", "criar_documento_competencia_v115", 6],
    ["V116", "solicitar_analise_competencia", 5],
    ["V117", "registrar_revisao_requisito_v117", 5],
    ["V118", "aprovar_parecer_interno", 3],
    ["V119", "registrar_apresentacao", 3],
    ["V122", "registrar_relatorio_historico_hml", 4],
  ].map(([origin, producer, connections], index) =>
    Object.freeze({ order: index + 1, origin, producer, connections }),
  ),
);

// Acesso exigido por tela de destino (PLAN 4.4, M-R2-4), com fonte no código do produto.
// source = "arquivo:linhaInicial-linhaFinal" contendo recurso e ação; screenGuard aponta a decisão
// da própria tela quando ela difere do menu. "rota-mae" marca telas sem item de menu próprio:
// o driver do BUILD-2b confirma o estado negado pela UI.
const M = "src/lib/navegacao/menuV1.ts:";
export const F3_SCREEN_ACCESS = Object.freeze(
  Object.fromEntries(
    [
      ["SYS04", null, null, M + "7-7", "publica", null],
      ["SYS05", "dashboard", "consultar", M + "10-10", "menu", null],
      [
        "ADM01",
        "usuarios",
        "administrar",
        "src/components/layout/ContaOSAppShell.tsx:203-203",
        "guarda",
        "src/components/administracao/usuarios/AdminUsuarios.tsx:106:validarAdministrador",
      ],
      ["V101", "contratantes", "consultar", M + "11-11", "menu", null],
      ["V102", "contratantes", "criar", M + "15-16", "menu", null],
      ["V103", "contratantes", "editar", M + "58-63", "menu", null],
      ["V104", "contratos", "consultar", M + "18-18", "menu", null],
      ["V105", "contratos", "criar", M + "19-19", "menu", null],
      ["V106", "contratos", "consultar", M + "48-48", "menu", null],
      ["V107", "normativos", "consultar", M + "49-49", "menu", null],
      ["V108", "orcamentos", "consultar", M + "50-50", "menu", null],
      ["V109", "listas", "consultar", M + "51-51", "menu", null],
      ["V110", "documentos_contrato", "consultar", M + "52-52", "menu", null],
      ["V111", "documentos_contrato", "consultar", M + "52-52", "rota-mae", null],
      ["V112", "competencias", "consultar", M + "53-53", "menu", null],
      ["V113", "competencias", "criar", M + "54-54", "menu", null],
      ["V114", "competencias", "consultar", M + "40-40", "menu", null],
      ["V115", "documentos_competencia", "consultar", M + "41-41", "menu", null],
      ["V116", "analises", "consultar", M + "42-42", "menu", null],
      ["V117", "analises", "consultar", M + "42-42", "rota-mae", null],
      ["V118", "pareceres", "consultar", M + "43-43", "menu", null],
      ["V119", "apresentacoes", "consultar", M + "44-44", "menu", null],
      ["V120", "apresentacoes", "consultar", M + "44-44", "rota-mae", null],
      ["V121", "historico", "consultar", M + "55-55", "menu", null],
      // A tela decide por historico/criar (o menu usa historico/processar); vale a tela.
      [
        "V122",
        "historico",
        "criar",
        "src/components/contratos/ImportarHistorico.tsx:70-70",
        "guarda",
        null,
      ],
      [
        "V123",
        "auditoria",
        "consultar",
        "src/components/layout/ContaOSAppShell.tsx:209-209",
        "guarda",
        "src/components/administracao/auditoria/TrilhaAuditoria.tsx:41:podeConsultarAuditoria",
      ],
    ].map(([screen, resource, action, source, kind, screenGuard]) => [
      screen,
      Object.freeze({ resource, action, source, kind, screenGuard }),
    ]),
  ),
);
// Matriz RBAC do perfil leitor na HML, versão 6, lida em 13/11/2026 por SELECT autorizado pelo
// titular (privado.rbac_permissoes_perfis). A execução relê as permissões efetivas e falha se
// divergirem desta fotografia.
export const F3_RBAC_LEITOR = Object.freeze({
  version: 6,
  allowed: Object.freeze(
    [
      "analises/consultar",
      "apresentacoes/consultar",
      "arquivos/consultar",
      "competencias/consultar",
      "contratantes/consultar",
      "contratos/consultar",
      "dashboard/consultar",
      "documentos_competencia/consultar",
      "documentos_contrato/consultar",
      "historico/consultar",
      "listas/consultar",
      "normativos/consultar",
      "orcamentos/consultar",
      "organizacoes/consultar",
      "pareceres/consultar",
    ].sort(),
  ),
  denied: 33,
});
export function expectedAccess(screen, profile) {
  if (typeof screen !== "string" || !Object.hasOwn(F3_SCREEN_ACCESS, screen))
    fail("F3_SCREEN_ACCESS");
  const access = F3_SCREEN_ACCESS[screen];
  if (profile === "master") return "ALLOW";
  if (profile !== F3_SECOND_USER_PROFILE) fail("F3_PROFILE");
  if (access.resource === null) return "ALLOW";
  return F3_RBAC_LEITOR.allowed.includes(access.resource + "/" + access.action) ? "ALLOW" : "DENY";
}

const MATRIX_HEADER = Object.freeze([
  "id_conexao",
  "tela_origem",
  "tela_destino",
  "classe_original",
  "tipo_original",
  "fases_origem",
  "caso_fase3",
  "caso_fase4",
  "caso_fase5",
  "caso_fase6",
  "produtor_original",
  "consumidor_original",
  "invariante_original",
  "evidencia_codigo_original",
  "estado_executado",
  "origem",
  "estado_proposta",
]);

/** RFC 4180 estrito: aspas duplas, vírgula, CRLF ou LF; rejeita aspas soltas. */
export function parseCsv(text) {
  if (typeof text !== "string" || text.length > 1048576) fail("F3_MATRIX_CSV");
  const rows = [];
  let row = [],
    field = "",
    i = 0,
    quoted = false;
  while (i < text.length) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        if (i < text.length && ![",", "\n", "\r"].includes(text[i])) fail("F3_MATRIX_CSV");
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      if (field !== "") fail("F3_MATRIX_CSV");
      quoted = true;
      i++;
    } else if (c === ",") {
      row.push(field);
      field = "";
      i++;
    } else if (c === "\r" || c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += c === "\r" && text[i + 1] === "\n" ? 2 : 1;
    } else {
      field += c;
      i++;
    }
  }
  if (quoted) fail("F3_MATRIX_CSV");
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Catálogo determinístico dos 138 casos IFV1-F3-*, derivado só da matriz aceita. */
export function buildF3Cases(csvText) {
  if (sha256(csvText) !== F3_MATRIX.sha256) fail("F3_MATRIX_HASH");
  const [header, ...rows] = parseCsv(csvText);
  if (JSON.stringify(header) !== JSON.stringify(MATRIX_HEADER)) fail("F3_MATRIX_HEADER");
  if (rows.length !== F3_MATRIX.rows) fail("F3_MATRIX_ROWS");
  const order = new Map(F3_PRODUCERS.map((p) => [p.origin + "|" + p.producer, p]));
  const seen = new Set(),
    perProducer = new Map();
  const cases = rows.map((cells) => {
    if (cells.length !== MATRIX_HEADER.length) fail("F3_MATRIX_ROW");
    const r = Object.fromEntries(MATRIX_HEADER.map((k, j) => [k, cells[j]]));
    if (!/^C[0-9]{4}$/.test(r.id_conexao) || seen.has(r.id_conexao)) fail("F3_MATRIX_ID");
    seen.add(r.id_conexao);
    if (r.caso_fase3 !== "IFV1-F3-" + r.id_conexao) fail("F3_MATRIX_CASE_ID");
    const producer = order.get(r.tela_origem + "|" + r.produtor_original);
    if (!producer) fail("F3_MATRIX_PRODUCER");
    perProducer.set(producer.order, (perProducer.get(producer.order) || 0) + 1);
    const classification = r.classe_original;
    const mandatoryRow = classification === "OBRIGATORIA" && r.tipo_original === "dados_esperados";
    const conditionalRow =
      classification === "CONDICIONAL" &&
      r.tipo_original === "auditoria_esperada" &&
      r.tela_destino === "V123";
    if (!mandatoryRow && !conditionalRow) fail("F3_MATRIX_CLASS");
    return Object.freeze({
      caseId: r.caso_fase3,
      sourceConnectionId: r.id_conexao,
      phase: 3,
      origin: r.tela_origem,
      destination: r.tela_destino,
      classification,
      producer: r.produtor_original,
      producerOrder: producer.order,
      consumer: r.consumidor_original,
      // Esperado por sessão, fixado antes de qualquer execução (F3_SCREEN_ACCESS + RBAC v6).
      expected: Object.freeze({
        master: expectedAccess(r.tela_destino, "master"),
        leitor: expectedAccess(r.tela_destino, F3_SECOND_USER_PROFILE),
      }),
    });
  });
  for (const p of F3_PRODUCERS)
    if (perProducer.get(p.order) !== p.connections) fail("F3_MATRIX_PRODUCER_COUNT");
  const mandatory = cases.filter((c) => c.classification === "OBRIGATORIA").length;
  if (mandatory !== F3_MATRIX.mandatory || cases.length - mandatory !== F3_MATRIX.conditional)
    fail("F3_MATRIX_CLASS_COUNT");
  cases.sort(
    (a, b) =>
      a.producerOrder - b.producerOrder || a.sourceConnectionId.localeCompare(b.sourceConnectionId),
  );
  return registerCatalogue({
    schema: "contaos.integracao-v1.f3.cases.v1",
    matrixPath: F3_MATRIX.path,
    matrixSha256: F3_MATRIX.sha256,
    scope: INTEGRACAO_V1_FASE3_SCOPE.id,
    count: cases.length,
    cases,
  });
}

const CASE_KEYS = Object.freeze([
  "caseId",
  "sourceConnectionId",
  "phase",
  "origin",
  "destination",
  "classification",
  "producer",
  "producerOrder",
  "consumer",
  "expected",
]);
function strictPlain(value, keys, code) {
  if (!value || typeof value !== "object" || Array.isArray(value) || isProxy(value)) fail(code);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) fail(code);
  const own = Reflect.ownKeys(value);
  if (own.length !== keys.length || own.some((k) => typeof k !== "string" || !keys.includes(k)))
    fail(code);
  for (const k of keys) {
    const d = Object.getOwnPropertyDescriptor(value, k);
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true) fail(code);
  }
}

/** Valida o catálogo publicado contra a derivação da matriz; qualquer divergência falha. */
export function validateF3Cases(value, csvText) {
  const code = "F3_CASES";
  assertJsonTree(value, code);
  strictPlain(value, ["schema", "matrixPath", "matrixSha256", "scope", "count", "cases"], code);
  if (!Array.isArray(value.cases) || isProxy(value.cases)) fail(code);
  for (const c of value.cases) {
    strictPlain(c, CASE_KEYS, code);
    strictPlain(c.expected, ["master", "leitor"], code);
  }
  const derived = buildF3Cases(csvText);
  if (JSON.stringify(value) !== JSON.stringify(derived)) fail(code);
  return true;
}

/** Orçamento de intenções: tentativa enviada conta, inclusive duplicidade rejeitada. */
export function assertF3Budget({ priorSent, newIntents }) {
  // priorSent: intenções já enviadas em execuções anteriores, derivadas do ledger (PLAN 7.2).
  if (
    !Number.isSafeInteger(priorSent) ||
    !Number.isSafeInteger(newIntents) ||
    priorSent < 0 ||
    newIntents < 0
  )
    fail("F3_BUDGET");
  if (newIntents > F3_BUDGET.perRun || priorSent + newIntents > F3_BUDGET.total) fail("F3_BUDGET");
  return true;
}

/** Guarda de escopo: só a solicitação F3 provada nesta execução autoriza o executor. */
export function assertF3Scope(scope) {
  if (scope !== INTEGRACAO_V1_FASE3_SCOPE.id) fail("FIXTURES_SCOPE_NOT_F3");
  return true;
}

// ---------------------------------------------------------------------------------------------
// BUILD-2b-1: infraestrutura offline. Relatório e SHA256SUMS (também em resultado parcial),
// ledger append-only (regra C) com execuções e intenções, livro de intenções idempotente,
// releitura do RBAC do leitor, classificador de negação explícita e contrato do YAML.
// R2 atende à revisão 5900926490 (B1, I1–I4, M1–M5). Os drivers de UI ficam no BUILD-2b-2.
// ---------------------------------------------------------------------------------------------
export const F3_E87_ORG = "e87f7e68-c5ae-4077-943b-02a4afd8b6ee";
export const F3_REPORT_SCHEMA = "contaos.integracao-v1.f3.report.v1";
export const F3_LEDGER_SCHEMA = "contaos.integracao-v1.f3.ledger.v1";
export const F3_LEDGER_PATH =
  "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json";
// SHA-256 do ledger publicado; muda só por PR que estende o ledger com evidência verificada.
export const F3_LEDGER_SHA256 = "1d402a1a4946c2aad8cc7715fa86b45c4aae6f68ab63aab9f77d0ec94e93c236";
export const F3_WORKFLOW_PATH = ".github/workflows/contaos-trilha-a-fixtures.yml";
// SHA-256 do YAML aprovado no BUILD-1; o executor recusa rodar sob YAML diferente.
export const F3_WORKFLOW_SHA256 =
  "8da83394d6018f9ac473970020bea693f8c3be996595ccc9573288eb29fe618c";
export const F3_ARTIFACT_DIR = "artifacts/integracao-v1-fase3";
// Produtores que mutam (ordens 2 e 4 a 20). SYS01 (1) é leitura e a preferência (3) é local.
export const F3_MUTATING_ORDERS = Object.freeze(
  F3_PRODUCERS.map((p) => p.order).filter((o) => o !== 1 && o !== 3),
);
// Emendas de N/A aprovadas expressamente pelo titular (PLAN 4.5). Vazio: nenhum N/A vale.
export const F3_NA_AMENDMENTS = Object.freeze([]);
// Telas de lista da e87f7e68 cujos contadores provam zero mutação fora da F3 (PLAN 2). O
// BUILD-2b-2 confirma pela UI que cada uma expõe contador e emenda este conjunto se preciso.
export const F3_E87_COUNTER_SCREENS = Object.freeze(["V101", "V104", "V112", "V121"]);
// Equivalências de harness revisadas para preservar PASS do ledger (plano mestre 16.3). Cada
// item {from, to, reviewId} entra só por PR revisada. Vazio: só o mesmo harness preserva.
export const F3_HARNESS_EQUIVALENCES = Object.freeze([]);
// Política de duplicidade por produtor (PLAN 4.3). null = ainda sem fonte no código: nenhum caso
// do produtor fecha PASS. O BUILD-2b-2 preenche cada produtor mutante com REJECTED ou
// DUPLICATE_NOT_DEFINED e a fonte no código do produto, por PR revisada.
const NO_MUTATION_POLICY = Object.freeze({
  result: "DUPLICATE_NOT_DEFINED",
  source: "PLAN 7.2: produtor sem mutação",
});
export const F3_DUPLICATE_POLICY = Object.freeze(
  Object.fromEntries(
    F3_PRODUCERS.map((p) => [
      String(p.order),
      F3_MUTATING_ORDERS.includes(p.order) ? null : NO_MUTATION_POLICY,
    ]),
  ),
);
// Estados explícitos de negação por tela (BUILD2A_ESPERADO_POR_TELA.md, obrigação 5). Qualquer
// outro estado, tela vazia, erro ou timeout é ERROR. V111 e V120 entram por emenda no BUILD-2b-2,
// depois de confirmados pela UI.
export const F3_DENIAL_TOKENS = Object.freeze({
  V102: "aviso-negado",
  V103: "aviso-negado",
  V105: "negadoGate",
  V113: "perfilNegado",
  V122: "sem_permissao",
  ADM01: "fase-negado",
  V123: "acessoNegado",
});
// Negação parcial que não nega a tela (V117: !pode_revisar com leitura liberada).
export const F3_PARTIAL_DENIALS = Object.freeze({ V117: "revisao-negada" });
export const F3_V123_RPC = "pode_consultar_auditoria_organizacao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA40 = /^[0-9a-f]{40}$/;
const SHA64 = /^[0-9a-f]{64}$/;
const DPL = /^dpl_[A-Za-z0-9]{8,80}$/;
const DIGITS = /^[1-9][0-9]{0,19}$/;
const CODE = /^[A-Z0-9_]{1,80}$/;
const isUuid = (v) => typeof v === "string" && UUID.test(v);
const isCount = (v) => Number.isSafeInteger(v) && v >= 0;
const enumOf = (v, list) => list.includes(v);
const own = (object, key) => typeof key === "string" && Object.hasOwn(object, key);
const ACCESS = Object.freeze(["ALLOW", "DENY"]);
const OBSERVED = Object.freeze(["ALLOW", "DENY", "ERROR", null]);
const POSITIVE = Object.freeze(["PASS", "FAIL", "NOT_RUN"]);
const NEGATIVE = Object.freeze(["NEGADO", "VAZAMENTO", "SEM_ENTIDADE", "NOT_RUN"]);
const DUPLICATE = Object.freeze(["REJECTED", "DUPLICATE_NOT_DEFINED", "ACCEPTED", "NOT_RUN"]);
const APPLICABILITY = Object.freeze(["APLICAVEL", "N_A_JUSTIFICADO"]);
const PROVENANCE_KEYS = Object.freeze([
  "frontendSha",
  "backendSha",
  "harnessSha",
  "deploymentId",
  "workflowRunId",
]);
export const F3_RECEIPT_KEYS = Object.freeze([
  ...CASE_KEYS,
  "applicability",
  "operation",
  "observed",
  "positive",
  "negatives",
  "duplicate",
  "requestId",
  "entityIds",
  "errorClass",
  "status",
  ...PROVENANCE_KEYS,
  "artifactId",
  "sha256",
  "reviewId",
  "cleanupStatus",
  "preservedFrom",
]);

/** Política fechada: 20 produtores; mutante com null ou {result, source}; demais sem mutação. */
export function validateF3DuplicatePolicy(policy) {
  const code = "F3_DUPLICATE_POLICY";
  strictPlain(
    policy,
    F3_PRODUCERS.map((p) => String(p.order)),
    code,
  );
  for (const p of F3_PRODUCERS) {
    const v = policy[String(p.order)];
    if (!F3_MUTATING_ORDERS.includes(p.order)) {
      if (v !== NO_MUTATION_POLICY) fail(code);
      continue;
    }
    if (v === null) continue;
    strictPlain(v, ["result", "source"], code);
    if (!["REJECTED", "DUPLICATE_NOT_DEFINED"].includes(v.result)) fail(code);
    if (typeof v.source !== "string" || !/^src\/[A-Za-z0-9_./-]+:[0-9]+-[0-9]+$/.test(v.source))
      fail(code);
  }
  return true;
}
validateF3DuplicatePolicy(F3_DUPLICATE_POLICY);
function duplicatePolicy(order, policy) {
  const key = String(order);
  if (!own(policy, key)) fail("F3_DUPLICATE_POLICY");
  return policy[key];
}

/** Campos do catálogo e de proveniência de um recibo; o resto vem do driver. */
export function f3ReceiptBase(c, provenance) {
  return {
    caseId: c.caseId,
    sourceConnectionId: c.sourceConnectionId,
    phase: c.phase,
    origin: c.origin,
    destination: c.destination,
    classification: c.classification,
    producer: c.producer,
    producerOrder: c.producerOrder,
    consumer: c.consumer,
    expected: { master: c.expected.master, leitor: c.expected.leitor },
    operation: c.producer,
    frontendSha: provenance?.frontendSha ?? null,
    backendSha: F3_BACKEND_SHA,
    harnessSha: provenance?.harnessSha ?? null,
    deploymentId: provenance?.deploymentId ?? null,
    workflowRunId: provenance?.workflowRunId ?? null,
    artifactId: null,
    sha256: null,
    reviewId: null,
    preservedFrom: null,
  };
}

/**
 * Status derivado das provas do recibo; nunca declarado pelo driver. FAIL prevalece sobre
 * BLOCKED. Produtor sem política de duplicidade com fonte nunca fecha PASS. A coerência com o
 * livro de intenções e o inventário é conferida por validateF3Report.
 */
export function deriveF3Status(r, policy = F3_DUPLICATE_POLICY) {
  if (r.applicability === "N_A_JUSTIFICADO") return "N_A_JUSTIFICADO";
  const leitorRequired = r.origin === "ADM01";
  const negatives = [r.negatives.inexistente, r.negatives.outraOrganizacao];
  const mismatch = (observed, expected) => ACCESS.includes(observed) && observed !== expected;
  if (
    r.positive === "FAIL" ||
    negatives.includes("VAZAMENTO") ||
    r.duplicate === "ACCEPTED" ||
    r.cleanupStatus === "CLEANUP_FAILED" ||
    r.errorClass !== null ||
    mismatch(r.observed.master, r.expected.master) ||
    (leitorRequired && mismatch(r.observed.leitor, r.expected.leitor))
  )
    return "FAIL";
  const rule = duplicatePolicy(r.producerOrder, policy);
  if (
    rule === null ||
    r.duplicate !== rule.result ||
    r.positive !== "PASS" ||
    negatives.some((n) => n !== "NEGADO") ||
    !ACCESS.includes(r.observed.master) ||
    (leitorRequired && !ACCESS.includes(r.observed.leitor))
  )
    return "BLOCKED";
  return "PASS";
}

export function f3Summary(receipts) {
  const s = { PASS: 0, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 };
  for (const r of receipts) s[r.status] += 1;
  return s;
}

function plainArray(value, code, max) {
  if (!Array.isArray(value) || isProxy(value) || value.length > max) fail(code);
  if (Object.getPrototypeOf(value) !== Array.prototype) fail(code);
  // Só índices de dados próprios e enumeráveis, sem buraco, getter ou chave extra.
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1) fail(code);
  for (let i = 0; i < value.length; i++) {
    const d = Object.getOwnPropertyDescriptor(value, String(i));
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true) fail(code);
  }
  return value;
}

function plainCounters(counters, code) {
  if (!counters || typeof counters !== "object" || Array.isArray(counters) || isProxy(counters))
    fail(code);
  if (![Object.prototype, null].includes(Object.getPrototypeOf(counters))) fail(code);
  for (const k of Reflect.ownKeys(counters)) {
    const d = Object.getOwnPropertyDescriptor(counters, k);
    if (!F3_E87_COUNTER_SCREENS.includes(k) || !Object.hasOwn(d, "value") || !d.enumerable)
      fail(code);
    if (!isCount(d.value)) fail(code);
  }
}

function validateProvenance(p, blocked, code) {
  strictPlain(p, PROVENANCE_KEYS, code);
  if (p.backendSha !== F3_BACKEND_SHA) fail(code);
  const formats = {
    frontendSha: SHA40,
    harnessSha: SHA40,
    deploymentId: DPL,
    workflowRunId: DIGITS,
  };
  for (const [k, re] of Object.entries(formats))
    if (!(typeof p[k] === "string" && re.test(p[k])) && !(blocked && p[k] === null)) fail(code);
}

// ---------------------------------------------------------------------------------------------
// Fontes de verdade emitidas pelo próprio módulo (revisão final de causa raiz). Os validadores
// não confiam em referências escolhidas por quem chama: o catálogo só vale se foi gerado por
// buildF3Cases, o ledger só se foi validado por validateF3Ledger (com o SHA do bruto), e toda
// entrada é uma árvore JSON pura, de modo que a igualdade por JSON é exata.
// ---------------------------------------------------------------------------------------------
const CATALOGUES = new WeakSet();
const LEDGERS = new WeakMap();
const BOOKS = new WeakMap();
const deepFreeze = (v) => {
  if (v && typeof v === "object" && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v)) deepFreeze(v[k]);
  }
  return v;
};
function registerCatalogue(catalogue) {
  CATALOGUES.add(deepFreeze(catalogue));
  return catalogue;
}
function assertCatalogue(catalogue, code) {
  if (catalogue !== null && !CATALOGUES.has(catalogue)) fail(code);
}
function ledgerRecord(ledger) {
  const record = ledger && typeof ledger === "object" ? LEDGERS.get(ledger) : undefined;
  if (!record) fail("F3_LEDGER_REQUIRED");
  return record;
}

/** Só objetos simples, arrays densos e folhas string, número finito, booleano ou null. */
export function assertJsonTree(value, code, depth = 0) {
  if (depth > 16) fail(code);
  if (value === null || typeof value === "boolean" || typeof value === "string") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(code);
    return;
  }
  if (typeof value !== "object" || isProxy(value)) fail(code);
  if (Array.isArray(value)) {
    plainArray(value, code, 4096);
    for (const item of value) assertJsonTree(item, code, depth + 1);
    return;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) fail(code);
  for (const k of Reflect.ownKeys(value)) {
    const d = Object.getOwnPropertyDescriptor(value, k);
    if (typeof k !== "string" || !Object.hasOwn(d, "value") || d.enumerable !== true) fail(code);
    assertJsonTree(d.value, code, depth + 1);
  }
}

// ---------------------------------------------------------------------------------------------
// Núcleo único das intenções. Uma só máquina de estados (applyEvent) define as transições; o
// livro grava cada transição como evento; relatório e ledger carregam os eventos e os
// validadores os reexecutam. Intenções têm tipo: principal (a criação do produtor, uma aberta
// por produtor), prerequisito (no máximo 5 na fase, PLAN 7.2) e duplicidade (no máximo uma por
// principal, PLAN 4.3). Uma intenção ausente por readback pode ser abandonada; abandonada não
// conta como pendente, mas precisa ser relida na execução que fecha a matriz.
// ---------------------------------------------------------------------------------------------
export const F3_INTENT_KINDS = Object.freeze(["principal", "prerequisito", "duplicidade"]);
export const F3_MAX_PREREQUISITES = 5;
// Teto provado: no máximo 8 eventos por intenção por execução (selar, incerto, ausente, reenviar,
// incerto, ausente, abandonar, encontrada) e no máximo 60 intenções na fase.
export const F3_MAX_EVENTS_PER_RUN = 8 * 60;
const EVENT_KEYS = Object.freeze([
  "op",
  "requestId",
  "producerOrder",
  "kind",
  "duplicateOf",
  "entityId",
  "organizationId",
]);
const EVENT_OPS = Object.freeze([
  "seal",
  "confirm",
  "reject",
  "uncertain",
  "found",
  "absent",
  "resend",
  "abandon",
]);
const INTENT_KEYS = Object.freeze([
  "requestId",
  "producerOrder",
  "kind",
  "duplicateOf",
  "outcome",
  "prior",
  "entityId",
  "sends",
  "rechecked",
]);
const INTENTS_KEYS = Object.freeze([
  "priorSent",
  "sent",
  "confirmed",
  "uncertain",
  "rejected",
  "abandoned",
  "requests",
  "events",
]);
const OPEN = (i) => i.state !== "rejected" && i.state !== "abandoned";

function emptyState() {
  return {
    organizationF3: null,
    priorSent: 0,
    intents: new Map(),
    created: [],
    entities: new Set(),
  };
}
function cloneState(st) {
  return {
    organizationF3: st.organizationF3,
    priorSent: st.priorSent,
    intents: new Map([...st.intents].map(([id, i]) => [id, { ...i }])),
    created: st.created.map((c) => ({ ...c })),
    entities: new Set(st.entities),
  };
}

function validateEvent(e) {
  const code = "F3_INTENT_EVENT";
  strictPlain(e, EVENT_KEYS, code);
  if (!enumOf(e.op, EVENT_OPS) || !isUuid(e.requestId)) fail(code);
  const entity = e.op === "confirm" || e.op === "found";
  if (e.op === "seal") {
    if (!Number.isSafeInteger(e.producerOrder) || !enumOf(e.kind, F3_INTENT_KINDS)) fail(code);
    if ((e.kind === "duplicidade") !== (e.duplicateOf !== null)) fail(code);
    if (e.duplicateOf !== null && !isUuid(e.duplicateOf)) fail(code);
  } else if (e.producerOrder !== null || e.kind !== null || e.duplicateOf !== null) fail(code);
  if (entity) {
    if (!isUuid(e.entityId) || !isUuid(e.organizationId)) fail(code);
  } else if (e.entityId !== null || e.organizationId !== null) fail(code);
}

function sealIntent(st, e) {
  if (!F3_MUTATING_ORDERS.includes(e.producerOrder)) fail("F3_INTENT_PRODUCER");
  if (st.intents.has(e.requestId)) fail("F3_INTENT_REPLAY");
  const all = [...st.intents.values()];
  const same = all.filter((i) => i.producerOrder === e.producerOrder);
  if (e.kind === "duplicidade") {
    const base = st.intents.get(e.duplicateOf);
    if (!base || base.kind !== "principal" || base.state !== "confirmed")
      fail("F3_INTENT_DUPLICATE_OF");
    if (base.producerOrder !== e.producerOrder) fail("F3_INTENT_DUPLICATE_OF");
    if (all.some((i) => i.kind === "duplicidade" && i.duplicateOf === e.duplicateOf))
      fail("F3_INTENT_DUPLICATE_OF");
    return;
  }
  if (e.kind === "prerequisito") {
    if (e.producerOrder === 2 || st.organizationF3 === null) fail("F3_INTENT_PRODUCER");
    if (all.filter((i) => i.kind === "prerequisito").length >= F3_MAX_PREREQUISITES)
      fail("F3_INTENT_PREREQUISITES");
    return;
  }
  // Principal: uma aberta por produtor; a da organização só antes de a organização existir e
  // antes de qualquer outra mutação.
  if (same.some((i) => i.kind === "principal" && OPEN(i))) fail("F3_INTENT_PRODUCER");
  if (e.producerOrder === 2 && st.organizationF3 !== null) fail("F3_INTENT_PRODUCER");
  if (e.producerOrder !== 2 && st.organizationF3 === null) fail("F3_FOREIGN_ORG");
}

// Tipos de entidade do inventário. Só organizacao e registro são isolados na F3; os demais são
// fatos observados que o livro registra (nunca descarta) e que reprovam o critério ISOLATION.
export const F3_ENTITY_KINDS = Object.freeze([
  "organizacao",
  "registro",
  "organizacao_duplicada",
  "fora_da_f3",
  "entidade_repetida",
]);
const ISOLATED_KINDS = Object.freeze(["organizacao", "registro"]);

/**
 * Registra a entidade devolvida pelo produto. O que o produto devolve é fato observado e sempre
 * entra no inventário com o tipo correspondente; só a violação de protocolo do driver (organização
 * criada com organizationId diferente do próprio ID) é recusada.
 */
function recordEntity(st, e, i) {
  if (i.producerOrder === 2 && e.organizationId !== e.entityId) fail("F3_INTENT_ENTITY");
  let kind;
  if (st.entities.has(e.entityId)) kind = "entidade_repetida";
  else if (e.entityId === F3_E87_ORG || e.organizationId === F3_E87_ORG) kind = "fora_da_f3";
  else if (i.producerOrder === 2)
    kind =
      i.kind === "principal" && st.organizationF3 === null
        ? "organizacao"
        : "organizacao_duplicada";
  else kind = e.organizationId === st.organizationF3 ? "registro" : "fora_da_f3";
  if (kind === "organizacao") st.organizationF3 = e.entityId;
  st.entities.add(e.entityId);
  st.created.push({
    id: e.entityId,
    kind,
    organizationId: e.organizationId,
    requestId: e.requestId,
  });
  i.entityId = e.entityId;
  i.state = "confirmed";
}

/** Aplica um evento ao estado. É a única definição das transições válidas. */
function applyEvent(st, run, e) {
  validateEvent(e);
  if (run.events.length >= F3_MAX_EVENTS_PER_RUN) fail("F3_INTENT_EVENTS");
  const send = () => {
    assertF3Budget({ priorSent: st.priorSent, newIntents: run.sent + 1 });
    run.sent += 1;
  };
  if (e.op === "seal") {
    sealIntent(st, e);
    send();
    st.intents.set(e.requestId, {
      state: "sealed",
      producerOrder: e.producerOrder,
      kind: e.kind,
      duplicateOf: e.duplicateOf,
      entityId: null,
      resent: false,
      prior: false,
      sends: 1,
      rechecked: false,
    });
    return;
  }
  const i = st.intents.get(e.requestId);
  if (!i) fail("F3_INTENT_UNKNOWN");
  const from = {
    confirm: ["sealed"],
    reject: ["sealed"],
    uncertain: ["sealed"],
    found: ["uncertain", "abandoned"],
    absent: ["uncertain", "abandoned"],
    resend: ["absent"],
    abandon: ["absent"],
  }[e.op];
  if (!from.includes(i.state)) fail(e.op === "resend" ? "F3_UNCERTAIN_RESEND" : "F3_INTENT_STATE");
  // Log canônico: todo evento muda o estado. A releitura de uma abandonada vale uma vez por
  // execução; repeti-la seria um evento sem efeito, removível sem deixar rastro.
  if (e.op === "absent" && i.state === "abandoned" && i.rechecked) fail("F3_INTENT_STATE");
  if (e.op === "found" || e.op === "absent") i.rechecked = true;
  if (e.op === "resend") {
    if (i.resent) fail("F3_UNCERTAIN_RESEND");
    send();
    i.resent = true;
    i.sends += 1;
    i.state = "sealed";
  } else if (e.op === "confirm" || e.op === "found") recordEntity(st, e, i);
  else if (e.op === "absent") i.state = i.state === "abandoned" ? "abandoned" : "absent";
  else i.state = { reject: "rejected", uncertain: "uncertain", abandon: "abandoned" }[e.op];
}

// O resumo expõe o estado exato (selado, incerto e ausente são pendentes distintos): com o log
// canônico, remover ou trocar qualquer evento muda o resumo ou quebra o replay.
const PENDING = Object.freeze(["sealed", "uncertain", "absent"]);
function summarize(st, run) {
  const requests = [...st.intents].map(([requestId, i]) => {
    const outcome = i.state;
    return {
      requestId,
      producerOrder: i.producerOrder,
      kind: i.kind,
      duplicateOf: i.duplicateOf,
      outcome,
      prior: i.prior,
      entityId: outcome === "confirmed" ? i.entityId : null,
      sends: i.sends,
      rechecked: i.rechecked,
    };
  });
  const count = (o) => requests.filter((q) => q.outcome === o).length;
  return {
    priorSent: st.priorSent,
    sent: run.sent,
    confirmed: count("confirmed"),
    uncertain: requests.filter((q) => PENDING.includes(q.outcome)).length,
    rejected: count("rejected"),
    abandoned: count("abandoned"),
    requests,
    events: run.events.map((e) => ({ ...e })),
  };
}

/** Estado para a execução seguinte: tudo vira anterior; selado sem desfecho vira incerto. */
function closeRun(st, run) {
  const next = cloneState(st);
  next.priorSent += run.sent;
  for (const i of next.intents.values()) {
    i.prior = true;
    i.sends = 0;
    i.rechecked = false;
    if (i.state === "sealed") i.state = "uncertain";
  }
  return next;
}

function replayRun(state, events) {
  plainArray(events, "F3_INTENT_EVENT", F3_MAX_EVENTS_PER_RUN);
  const st = cloneState(state),
    run = { sent: 0, events: [] };
  for (const e of events) {
    applyEvent(st, run, e);
    run.events.push({ ...e });
  }
  return { st, run };
}

/**
 * Livro de intenções da Fase 3, sobre o ledger validado. Só o MASTER muta. Antes de existir a
 * organização F3, só a sua criação (produtor 2, principal) pode ser selada, com organizationId
 * null; depois, toda intenção exige organizationId igual à organização F3.
 */
export function createF3IntentBook(options = {}) {
  if (Object.keys(options).some((k) => k !== "ledger" && k !== "provenance"))
    fail("F3_INTENT_OPTIONS");
  const record = ledgerRecord(options.ledger);
  // Proveniência amarrada à mutação (parecer R7, M2): o livro só existe com a proveniência
  // completa, e todo relatório gerado a partir dele carrega exatamente essa proveniência.
  assertJsonTree(options.provenance, "F3_PROVENANCE");
  validateProvenance(options.provenance, false, "F3_PROVENANCE");
  const provenance = Object.freeze({ ...options.provenance });
  let st = cloneState(record.state),
    run = { sent: 0, events: [] };
  // Transação: o evento é aplicado numa cópia e só substitui o estado se tudo der certo.
  // Controle de segurança do livro (parecer R2, grupo C): no máximo uma cerca, e o congelamento
  // é do livro, não do objeto cerca. Livro congelado não sela nem reenvia; fatos ainda entram.
  const control = { fenced: false, frozen: false };
  const apply = (e) => {
    if (control.frozen && (e.op === "seal" || e.op === "resend")) fail("F3_FENCE_FROZEN");
    const next = cloneState(st),
      nextRun = { sent: run.sent, events: run.events };
    applyEvent(next, nextRun, e);
    st = next;
    run = { sent: nextRun.sent, events: [...run.events, Object.freeze({ ...e })] };
  };
  const ev = (op, requestId, extra = {}) => ({
    op,
    requestId,
    producerOrder: null,
    kind: null,
    duplicateOf: null,
    entityId: null,
    organizationId: null,
    ...extra,
  });
  const book = Object.freeze({
    seal({
      requestId,
      producerOrder,
      actor,
      organizationId,
      kind = "principal",
      duplicateOf = null,
    }) {
      if (actor !== "master") fail("F3_SECOND_USER_MUTATION");
      if (!Number.isSafeInteger(producerOrder)) fail("F3_INTENT_PRODUCER");
      if (!isUuid(requestId) || (duplicateOf !== null && !isUuid(duplicateOf)))
        fail("F3_INTENT_ID");
      if (!enumOf(kind, F3_INTENT_KINDS)) fail("F3_INTENT_KIND");
      if ((kind === "duplicidade") !== (duplicateOf !== null)) fail("F3_INTENT_KIND");
      if (organizationId !== st.organizationF3) fail("F3_FOREIGN_ORG");
      apply(ev("seal", requestId, { producerOrder, kind, duplicateOf }));
    },
    /** Confirma a criação; numa tentativa de duplicidade, sinaliza duplicateAccepted (FAIL). */
    confirm(requestId, { entityId, organizationId }) {
      apply(ev("confirm", requestId, { entityId, organizationId }));
      return { duplicateAccepted: st.intents.get(requestId).kind === "duplicidade" };
    },
    rejected: (requestId) => apply(ev("reject", requestId)),
    uncertain: (requestId) => apply(ev("uncertain", requestId)),
    /** Readback de intenção incerta ou abandonada: found registra a entidade, inclusive tardia. */
    reconcile(requestId, { found, entityId, organizationId }) {
      if (typeof found !== "boolean") fail("F3_INTENT_STATE");
      apply(found ? ev("found", requestId, { entityId, organizationId }) : ev("absent", requestId));
    },
    resend: (requestId) => apply(ev("resend", requestId)),
    /**
     * Simula um selo ou reenvio sobre uma cópia do estado, com a mesma applyEvent: a cerca
     * valida a intenção ao armar com a regra do livro, sem reescrevê-la (parecer 2b-2a, grupo B).
     */
    check(input) {
      assertJsonTree(input, "F3_INTENT_STATE");
      const keys = ["op", "requestId", "producerOrder", "kind", "duplicateOf"];
      if (Object.keys(input).some((k) => !keys.includes(k))) fail("F3_INTENT_STATE");
      const { op, requestId, producerOrder = null, kind = null, duplicateOf = null } = input;
      if (op !== "seal" && op !== "resend") fail("F3_INTENT_STATE");
      if (control.frozen) fail("F3_FENCE_FROZEN");
      const e =
        op === "seal"
          ? ev("seal", requestId, { producerOrder, kind, duplicateOf })
          : ev("resend", requestId);
      applyEvent(cloneState(st), { sent: run.sent, events: run.events }, e);
      return true;
    },
    abandon: (requestId) => apply(ev("abandon", requestId)),
    state: (requestId) => (st.intents.get(requestId) ?? fail("F3_INTENT_UNKNOWN")).state,
    organizationF3: () => st.organizationF3,
    created: () => st.created.map((c) => ({ ...c })),
    summary: () => summarize(st, run),
    provenance: () => ({ ...provenance }),
    frozen: () => control.frozen,
    /**
     * Conferência de isolamento (BUILD2B1_INFRA, obrigação de pré-requisitos). Encerram a
     * execução com código: entidade fora da F3, de qualquer intenção (houve mutação fora do
     * isolamento, e seguir só aumentaria o dano), e entidade não isolada de pré-requisito, que
     * não tem recibo onde o critério ISOLATION a reprovaria. Entidade repetida ou organização
     * duplicada de principal ou duplicidade fica no recibo e reprova o gate, sem encerrar. O fato
     * já está no inventário; a exceção só impede que a execução siga mutando.
     */
    assertIsolation() {
      for (const c of st.created) {
        const i = st.intents.get(c.requestId);
        if (c.kind === "fora_da_f3") fail("F3_ISOLATION_BREACH");
        if (i.kind === "prerequisito" && !ISOLATED_KINDS.includes(c.kind))
          fail("F3_ISOLATION_BREACH");
      }
      return true;
    },
  });
  BOOKS.set(book, () => ({ st, run, record, provenance, control }));
  return book;
}

// ---------------------------------------------------------------------------------------------
// Cerca de mutação da F3 (BUILD-2b-2a). A cerca nativa do auditor recebe esta política.
// Classificação pelo significado (destino e método), nunca pela forma do texto:
// - GET e HEAD nunca são mutação e vão à allowlist somente leitura do auditor;
// - OPTIONS nunca é mutação: passa se a allowlist aceitar ou se for o preflight do próximo passo
//   da intenção armada, sem selo;
// - qualquer outro método numa RPC de fluxo, numa tabela, numa Edge de fluxo ou no Storage é
//   mutação e só passa como o próximo passo da intenção armada, com corpo canônico igual ao
//   armado; a primeira requisição da intenção sela (ou reenvia) no livro antes de sair.
// Não há parâmetro de política: allowlist, relógio e ID são os de produção (parecer, grupo C).

/**
 * Passo de fluxo. target: rpc (POST /rest/v1/rpc/name), table (POST /rest/v1/name + query
 * exata do cliente), edge (POST /functions/v1/name) ou storage (PUT
 * /storage/v1/object/upload/sign/bucket/caminho?token=..., corpo opaco). free: campos de topo
 * cujo valor é gerado em tempo de execução (chave de idempotência da UI, ID devolvido por passo
 * anterior) e só podem levar uma vaga (f3Slot); qualquer outro UUID do corpo tem de ser a
 * organização F3 ou entidade isolada do inventário do livro.
 */
const step = (target, name, { query = "", free = [], source }) =>
  Object.freeze({ target, name, query, free: Object.freeze([...free]), source });
const DOC = "src/lib/administracao/admUsuariosRpc.ts:";
// Por produtor e tipo de intenção: principal (também usado pela duplicidade) e prerequisito.
const flow = (principal, prerequisito = null) =>
  Object.freeze({
    principal: Object.freeze(principal),
    prerequisito: prerequisito && Object.freeze(prerequisito),
  });
export const F3_MUTATION_FLOWS = Object.freeze({
  2: flow([
    step("rpc", "criar_organizacao", {
      source: "src/lib/organizacao/criarOrganizacaoDados.ts:35-40",
    }),
  ]),
  4: flow([
    step("edge", "admin-invite-user", {
      free: ["chave_idempotencia"],
      source: DOC + "188-211",
    }),
    step("rpc", "salvar_vinculo_usuario_adm", {
      free: ["p_id_usuario", "p_chave_idempotencia"],
      source: DOC + "171-185",
    }),
  ]),
  5: flow([
    step("table", "contratantes", {
      query: "?select=id%2Crazao_social%2Csituacao",
      source: "src/lib/contratantes/novoContratanteDados.ts:148-148",
    }),
  ]),
  8: flow([
    step("rpc", "atualizar_contrato_v1", {
      free: ["p_request_id"],
      source: "src/lib/cadastros/cadastroOperacionalDados.ts:210-225",
    }),
  ]),
});
export const F3_FENCE_WINDOW_MS = 60000;
const STORAGE_ORIGIN = API_ORIGIN.replace(/\.supabase\.co$/, ".storage.supabase.co");
const SAFE = Object.freeze(["GET", "HEAD"]);
const SLOT = "\u0000f3:";
const SLOT_RE = /^\u0000f3:(uuid|path):([a-z][a-z0-9_]{0,40})$/;
/** Vaga de valor gerado em tempo de execução: uuid (chave, ID) ou path (caminho do Storage). */
export const f3Slot = (kind, name) => {
  const v = SLOT + kind + ":" + name;
  if (!SLOT_RE.test(v)) fail("F3_FENCE_ARM");
  return v;
};

function canonicalJson(v) {
  if (Array.isArray(v)) return "[" + v.map(canonicalJson).join(",") + "]";
  if (v !== null && typeof v === "object")
    return (
      "{" +
      Object.keys(v)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + canonicalJson(v[k]))
        .join(",") +
      "}"
    );
  return JSON.stringify(v);
}
function parseJsonBody(postData) {
  if (typeof postData !== "string" || postData.length > 65536) return undefined;
  try {
    const v = JSON.parse(postData);
    assertJsonTree(v, "F3_FENCE_BODY");
    return v;
  } catch {
    return undefined;
  }
}
function parseUrl(raw) {
  try {
    const u = new URL(raw);
    const rawPath = /^https:\/\/[^/]+([^?#]*)/.exec(raw)?.[1];
    if (u.protocol !== "https:" || u.username || u.password || u.hash) return null;
    if (rawPath !== u.pathname || u.pathname.includes("%") || u.pathname.includes("//"))
      return null;
    return u;
  } catch {
    return null;
  }
}
const ALL_STEPS = Object.values(F3_MUTATION_FLOWS).flatMap((f) => [
  ...f.principal,
  ...(f.prerequisito ?? []),
]);
const flowNames = (target) =>
  new Set(ALL_STEPS.filter((s) => s.target === target).map((s) => s.name));
const FLOW_RPCS = flowNames("rpc"),
  FLOW_EDGES = flowNames("edge");

// Invariante de carregamento (parecer R2, grupo G): RPC fora de fluxo vai à allowlist de leitura,
// então nenhuma RPC produtora do PLAN 3, nem variante conhecida de cadastro, pode ser aceita
// por ela em POST. Se o auditor passar a aceitar uma, o executor não carrega.
export const F3_PRODUCER_RPC_VARIANTS = Object.freeze([
  "alterar_situacao_contrato_v1",
  "atualizar_organizacao_v1",
  "alterar_situacao_organizacao_v1",
]);
for (const name of new Set([
  ...F3_PRODUCERS.filter((p) => F3_MUTATING_ORDERS.includes(p.order)).map((p) => p.producer),
  ...ALL_STEPS.map((x) => x.name),
  ...F3_PRODUCER_RPC_VARIANTS,
]))
  if (requestAllowed({ url: API_ORIGIN + "/rest/v1/rpc/" + name, method: "POST" }) === true)
    fail("F3_READ_ALLOWLIST_MUTATION");

/**
 * Mutação pelo significado: método fora de GET, HEAD e OPTIONS em RPC de fluxo, em tabela, em
 * Edge de fluxo ou no Storage (API e origem do Storage). URL malformada também é tratada como
 * mutação, para nunca ser decidida pela leitura. O resto é leitura.
 */
export function isF3Mutation(request) {
  if (SAFE.includes(request.method) || request.method === "OPTIONS") return false;
  const u = parseUrl(request.url);
  if (!u) return true;
  if (u.origin === STORAGE_ORIGIN) return true;
  if (u.origin !== API_ORIGIN) return false;
  const p = u.pathname;
  const rpc = /^\/rest\/v1\/rpc\/(.+)$/.exec(p);
  if (rpc) return FLOW_RPCS.has(rpc[1]);
  if (p.startsWith("/rest/v1/") || p.startsWith("/storage/")) return true;
  const edge = /^\/functions\/v1\/(.+)$/.exec(p);
  return Boolean(edge && FLOW_EDGES.has(edge[1]));
}

/** Confere corpo observado contra o armado pela forma canônica; vagas capturam ou comparam. */
function matchBody(seen, armed, slots, got) {
  if (typeof armed === "string" && armed.startsWith(SLOT)) {
    const [, kind, name] = SLOT_RE.exec(armed);
    const okKind =
      kind === "uuid"
        ? isUuid(seen)
        : typeof seen === "string" &&
          /^[A-Za-z0-9_\-./]{1,512}$/.test(seen) &&
          !seen.includes("..");
    if (!okKind) return false;
    const known = Object.hasOwn(slots, name) ? slots[name] : got[name];
    if (known !== undefined && known !== seen) return false;
    got[name] = seen;
    return true;
  }
  if (Array.isArray(armed))
    return (
      Array.isArray(seen) &&
      seen.length === armed.length &&
      armed.every((a, i) => matchBody(seen[i], a, slots, got))
    );
  if (armed !== null && typeof armed === "object") {
    if (seen === null || typeof seen !== "object" || Array.isArray(seen)) return false;
    const a = Object.keys(armed).sort(),
      b = Object.keys(seen).sort();
    return (
      a.length === b.length &&
      a.every((k, i) => k === b[i] && matchBody(seen[k], armed[k], slots, got))
    );
  }
  return canonicalJson(seen) === canonicalJson(armed);
}

/**
 * Corpo armado de passo JSON: vaga só uuid e só nos campos free de topo do passo; todo UUID
 * literal (inteiro ou dentro de texto) é a organização F3 ou entidade isolada do inventário.
 * Referência a organização, contrato ou registro alheio nunca é armada (PLAN 9.3).
 */
const UUID_ANY = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
function assertArmedBody(body, s, isolated) {
  const walk = (v, top) => {
    if (typeof v === "string") {
      if (v.startsWith(SLOT)) {
        if (!SLOT_RE.test(v) || !v.startsWith(SLOT + "uuid:")) fail("F3_FENCE_ARM");
        if (top === null || !s.free.includes(top)) fail("F3_FENCE_ARM");
      } else
        for (const m of v.matchAll(UUID_ANY))
          if (!isolated.has(m[0].toLowerCase())) fail("F3_FOREIGN_ORG");
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, null));
    else if (v !== null && typeof v === "object") Object.values(v).forEach((x) => walk(x, null));
  };
  for (const [k, v] of Object.entries(body)) walk(v, k);
}

/** URL do passo; no Storage, o caminho é a vaga path e o token é opaco. */
function matchUrl(u, s, armed, slots, got) {
  if (s.target === "storage") {
    if (u.origin !== API_ORIGIN) return false;
    const prefix = "/storage/v1/object/upload/sign/" + s.name + "/";
    if (!u.pathname.startsWith(prefix)) return false;
    if ([...u.searchParams.keys()].join() !== "token" || !u.searchParams.get("token")) return false;
    return matchBody(u.pathname.slice(prefix.length), armed.path, slots, got);
  }
  const path = { rpc: "/rest/v1/rpc/", table: "/rest/v1/", edge: "/functions/v1/" }[s.target];
  return u.origin === API_ORIGIN && u.pathname === path + s.name && u.search === s.query;
}

/**
 * Política de mutação ligada ao livro. arm() declara a intenção (produtor, tipo, ou resendOf
 * para o reenvio depois de readback) e, para cada passo do fluxo, o corpo armado: valores
 * literais e vagas f3Slot nos campos free do passo (no Storage, { path: vaga }). A intenção é
 * validada ao armar pela regra do próprio livro (book.check) e pela conferência de isolamento.
 * policy() vai para installNativeFence. settle() devolve o que saiu e as vagas capturadas; o
 * desfecho (confirm, rejected, uncertain) é do driver, pela UI e pela releitura.
 */
export function createF3MutationFence(options = {}) {
  if (Object.keys(options).some((k) => k !== "book")) fail("F3_FENCE_OPTIONS");
  const book = options.book;
  if (!BOOKS.has(book)) fail("F3_FENCE_BOOK");
  const control = BOOKS.get(book)().control;
  // Uma cerca por livro: uma cerca nova não pode contornar o congelamento nem abrir intenções
  // em paralelo. O contexto do leitor usa f3ReadOnlyPolicy, que nunca admite mutação.
  if (control.fenced) fail("F3_FENCE_DUPLICATE");
  control.fenced = true;
  let active = null;
  const tickets = new Map();
  const ticketOf = (r) =>
    typeof r.sessionId === "string" && typeof r.interceptionId === "string"
      ? r.sessionId + "\u0000" + r.interceptionId
      : null;
  const freeze = () => {
    control.frozen = true;
    return false;
  };
  const nextUrlMatches = (u) => {
    const s = active && active.flow[active.done];
    return Boolean(s && matchUrl(u, s, active.bodies[active.done], active.slots, {}));
  };
  function decide(request) {
    const ticket = ticketOf(request);
    if (request.stage === "RESPONSE") {
      const t = ticket && tickets.get(ticket);
      if (t) {
        tickets.delete(ticket);
        if (t.url !== request.url || t.method !== request.method) return freeze();
        if (t.body !== null && canonicalJson(parseJsonBody(request.postData)) !== t.body)
          return freeze();
        return true;
      }
      if (isF3Mutation(request)) return freeze();
      return requestAllowed(request) === true;
    }
    if (request.stage !== "REQUEST") return false;
    if (request.method === "OPTIONS") {
      if (requestAllowed(request) === true) return true;
      const u = parseUrl(request.url);
      if (control.frozen || !ticket || !u || !nextUrlMatches(u)) return false;
      tickets.set(ticket, { url: request.url, method: "OPTIONS", body: null });
      return true;
    }
    if (!isF3Mutation(request)) return requestAllowed(request) === true;
    if (control.frozen || !active || !ticket || tickets.has(ticket)) return freeze();
    if (performance.now() - active.armedAt >= F3_FENCE_WINDOW_MS) return freeze();
    const s = active.flow[active.done];
    const u = parseUrl(request.url);
    if (!s || !u) return freeze();
    const armed = active.bodies[active.done],
      got = {};
    if (!matchUrl(u, s, armed, active.slots, got)) return freeze();
    let body = null;
    if (s.target === "storage") {
      if (request.method !== "PUT") return freeze();
    } else {
      if (request.method !== "POST") return freeze();
      body = parseJsonBody(request.postData);
      if (body === undefined || !matchBody(body, armed, active.slots, got)) return freeze();
    }
    // A primeira requisição da intenção é a que conta: sela (ou reenvia) antes de sair.
    if (active.done === 0) {
      try {
        if (active.resend) book.resend(active.requestId);
        else
          book.seal({
            requestId: active.requestId,
            producerOrder: active.producerOrder,
            actor: "master",
            organizationId: book.organizationF3(),
            kind: active.kind,
            duplicateOf: active.duplicateOf,
          });
      } catch {
        return freeze();
      }
      active.sealed = true;
    }
    Object.assign(active.slots, got);
    active.done += 1;
    tickets.set(ticket, {
      url: request.url,
      method: request.method,
      body: body === null ? null : canonicalJson(body),
    });
    return true;
  }
  return Object.freeze({
    policy(request) {
      try {
        if (typeof request !== "object" || request === null || typeof request.url !== "string")
          return false;
        return decide(request);
      } catch {
        return freeze();
      }
    },
    arm(input = {}) {
      if (control.frozen) fail("F3_FENCE_FROZEN");
      if (active) fail("F3_FENCE_PENDING");
      const ARM_KEYS = ["producerOrder", "kind", "duplicateOf", "resendOf", "bodies"];
      assertJsonTree(input, "F3_FENCE_ARM");
      if (Object.keys(input).some((k) => !ARM_KEYS.includes(k))) fail("F3_FENCE_ARM");
      const { producerOrder, bodies, resendOf = null } = input;
      let { kind = "principal", duplicateOf = null } = input;
      // Isolamento antes de qualquer mutação nova: violação anterior impede seguir mutando.
      book.assertIsolation();
      if (!Number.isSafeInteger(producerOrder) || !Object.hasOwn(F3_MUTATION_FLOWS, producerOrder))
        fail("F3_FLOW_UNDEFINED");
      let requestId;
      if (resendOf !== null) {
        // Reenvio depois de readback (PLAN 7.2): mesma intenção, mesmo tipo, envio pelo livro.
        if (input.kind !== undefined || input.duplicateOf !== undefined) fail("F3_FENCE_ARM");
        book.check({ op: "resend", requestId: resendOf });
        const prior = book.summary().requests.find((q) => q.requestId === resendOf);
        if (prior.producerOrder !== producerOrder) fail("F3_INTENT_PRODUCER");
        ({ kind, duplicateOf } = prior);
        requestId = resendOf;
      } else {
        requestId = crypto.randomUUID();
        // A regra do livro decide ao armar, sobre uma cópia do estado; o selo real reconfere.
        book.check({ op: "seal", requestId, producerOrder, kind, duplicateOf });
      }
      const steps = F3_MUTATION_FLOWS[producerOrder][kind === "prerequisito" ? kind : "principal"];
      if (!steps) fail("F3_FLOW_UNDEFINED");
      if (!Array.isArray(bodies) || bodies.length !== steps.length) fail("F3_FENCE_ARM");
      const isolated = new Set([
        ...(book.organizationF3() ? [book.organizationF3()] : []),
        ...book
          .created()
          .filter((c) => ISOLATED_KINDS.includes(c.kind))
          .map((c) => c.id),
      ]);
      steps.forEach((s, i) => {
        const b = bodies[i];
        if (b === null || typeof b !== "object" || Array.isArray(b)) fail("F3_FENCE_ARM");
        if (s.target === "storage") {
          strictPlain(b, ["path"], "F3_FENCE_ARM");
          if (typeof b.path !== "string" || !b.path.startsWith(SLOT + "path:"))
            fail("F3_FENCE_ARM");
          if (!SLOT_RE.test(b.path)) fail("F3_FENCE_ARM");
        } else assertArmedBody(b, s, isolated);
      });
      active = {
        requestId,
        producerOrder,
        kind,
        duplicateOf,
        resend: resendOf !== null,
        flow: steps,
        bodies: structuredClone(bodies),
        done: 0,
        sealed: false,
        slots: {},
        armedAt: performance.now(),
      };
      return requestId;
    },
    /** Fecha a intenção armada. sealed false: nada saiu e nada foi registrado no livro. */
    settle() {
      if (!active) fail("F3_FENCE_IDLE");
      const out = {
        requestId: active.requestId,
        sealed: active.sealed,
        complete: active.done === active.flow.length,
        slots: { ...active.slots },
      };
      active = null;
      return out;
    },
    frozen: () => control.frozen,
  });
}

/**
 * Política do contexto do 2º usuário (leitor): só leitura da allowlist do auditor, e nenhuma
 * requisição classificada como mutação, em nenhum estágio.
 */
export function f3ReadOnlyPolicy(request) {
  try {
    if (typeof request !== "object" || request === null || typeof request.url !== "string")
      return false;
    if (request.stage !== "REQUEST" && request.stage !== "RESPONSE") return false;
    return !isF3Mutation(request) && requestAllowed(request) === true;
  } catch {
    return false;
  }
}

/** Intenções do relatório: os eventos desta execução, reexecutados sobre o ledger. */
function validateIntents(n, code, state) {
  strictPlain(n, INTENTS_KEYS, code);
  plainArray(n.requests, code, F3_BUDGET.total);
  for (const q of n.requests) strictPlain(q, INTENT_KEYS, code);
  let replay;
  try {
    replay = replayRun(state, n.events);
  } catch {
    fail(code);
  }
  if (JSON.stringify(n) !== JSON.stringify(summarize(replay.st, replay.run))) fail(code);
  return replay.st;
}

function validateIsolation(iso, state) {
  const code = "F3_ISOLATION";
  strictPlain(iso, ["organizationF3", "created", "e87Before", "e87After"], code);
  if (iso.organizationF3 !== state.organizationF3) fail(code);
  plainArray(iso.created, code, F3_BUDGET.total);
  for (const e of iso.created) strictPlain(e, ["id", "kind", "organizationId", "requestId"], code);
  if (JSON.stringify(iso.created) !== JSON.stringify(state.created)) fail(code);
  plainCounters(iso.e87Before, code);
  plainCounters(iso.e87After, code);
  const before = Object.keys(iso.e87Before).sort(),
    after = Object.keys(iso.e87After).sort();
  if (JSON.stringify(before) !== JSON.stringify(after)) fail(code);
}

function validateReceipt(r, c, report, policy, ledger) {
  const code = "F3_REPORT";
  strictPlain(r, F3_RECEIPT_KEYS, code);
  strictPlain(r.expected, ["master", "leitor"], code);
  strictPlain(r.observed, ["master", "leitor"], code);
  strictPlain(r.negatives, ["inexistente", "outraOrganizacao"], code);
  for (const k of CASE_KEYS) if (JSON.stringify(r[k]) !== JSON.stringify(c[k])) fail(code);
  if (r.operation !== c.producer) fail(code);
  if (r.artifactId !== null || r.sha256 !== null || r.reviewId !== null) fail(code);
  // Recibo desta execução, ou PASS preservado do ledger (regra C, PLAN 7.3).
  if (r.preservedFrom === null) {
    for (const k of PROVENANCE_KEYS) if (r[k] !== report.provenance[k]) fail(code);
  } else {
    const entry = (ledger?.entries ?? []).find((e) => e.caseId === r.caseId);
    if (!entry || entry.workflowRunId !== r.preservedFrom || r.status !== "PASS") fail(code);
    for (const k of PROVENANCE_KEYS) if (r[k] !== entry[k]) fail(code);
    if (!preservable(entry, report.provenance)) fail(code);
    if (r.requestId !== entry.requestId) fail(code);
    if (JSON.stringify(r.entityIds) !== JSON.stringify(entry.entityIds)) fail(code);
  }
  if (!enumOf(r.applicability, APPLICABILITY)) fail(code);
  if (!enumOf(r.observed.master, OBSERVED) || !enumOf(r.observed.leitor, OBSERVED)) fail(code);
  if (r.origin !== "ADM01" && r.observed.leitor !== null) fail(code);
  if (!enumOf(r.positive, POSITIVE) || !enumOf(r.duplicate, DUPLICATE)) fail(code);
  if (!enumOf(r.negatives.inexistente, NEGATIVE) || !enumOf(r.negatives.outraOrganizacao, NEGATIVE))
    fail(code);
  if (r.errorClass !== null && !enumOf(r.errorClass, F3_ERROR_CLASS)) fail(code);
  if (!enumOf(r.cleanupStatus, F3_CLEANUP_STATUS) || !enumOf(r.status, F3_CASE_STATUS)) fail(code);
  if (r.requestId !== null && !isUuid(r.requestId)) fail(code);
  plainArray(r.entityIds, code, 8);
  if (!r.entityIds.every(isUuid) || new Set(r.entityIds).size !== r.entityIds.length) fail(code);
  const mutating = F3_MUTATING_ORDERS.includes(r.producerOrder);
  if (r.cleanupStatus === "ISOLATED_NO_DELETE" && (!mutating || r.requestId === null)) fail(code);
  if (r.cleanupStatus === "NO_MUTATION" && (r.requestId !== null || r.entityIds.length)) fail(code);
  if (!mutating && r.duplicate !== "NOT_RUN" && r.duplicate !== NO_MUTATION_POLICY.result)
    fail(code);
  if (r.applicability === "N_A_JUSTIFICADO") {
    if (r.classification !== "CONDICIONAL" || !F3_NA_AMENDMENTS.includes(r.caseId))
      fail("F3_NA_UNAPPROVED");
  }
  const rule = duplicatePolicy(r.producerOrder, policy);
  if (rule === null && !["NOT_RUN", "ACCEPTED"].includes(r.duplicate)) fail(code);
  if (rule !== null && !["NOT_RUN", "ACCEPTED", rule.result].includes(r.duplicate)) fail(code);
  if (r.status !== deriveF3Status(r, policy)) fail(code);
  if (r.status === "PASS") {
    if (mutating && (r.cleanupStatus !== "ISOLATED_NO_DELETE" || !r.entityIds.length)) fail(code);
    if (!mutating && r.cleanupStatus !== "NO_MUTATION") fail(code);
  }
}

/**
 * Cruza os recibos com o replay. Os casos de um produtor compartilham requestId (a intenção
 * principal), entidades e duplicidade; requestId é único entre produtores; entidade só da
 * principal do próprio recibo; duplicidade igual às tentativas registradas contra essa principal.
 */
function crossCheck(report, requests, created) {
  const code = "F3_REPORT";
  const byId = new Map(requests.map((q) => [q.requestId, q]));
  const groups = new Map();
  for (const r of report.cases) {
    const g = groups.get(r.producerOrder) ?? [];
    g.push(r);
    groups.set(r.producerOrder, g);
  }
  const seen = new Set();
  for (const [order, group] of groups) {
    const head = group[0];
    const shared = (r) => JSON.stringify([r.requestId, r.entityIds, r.duplicate, r.cleanupStatus]);
    if (group.some((r) => shared(r) !== shared(head))) fail(code);
    const duplicates = requests.filter(
      (q) => q.producerOrder === order && q.kind === "duplicidade",
    );
    if (head.requestId === null) {
      if (head.entityIds.length) fail(code);
      if (head.duplicate === "DUPLICATE_NOT_DEFINED" && duplicates.length) fail(code);
      if (!["NOT_RUN", "DUPLICATE_NOT_DEFINED"].includes(head.duplicate)) fail(code);
      continue;
    }
    if (seen.has(head.requestId)) fail(code);
    seen.add(head.requestId);
    const q = byId.get(head.requestId);
    if (!q || q.producerOrder !== order || q.kind !== "principal") fail(code);
    const made = created.find((e) => e.requestId === head.requestId);
    if (head.entityIds.some((id) => id !== made?.id)) fail("F3_ISOLATION");
    if (head.status === "PASS" && !ISOLATED_KINDS.includes(made?.kind)) fail("F3_ISOLATION");
    if (q.outcome !== "confirmed" && head.entityIds.length) fail(code);
    if (head.status === "PASS" && q.outcome !== "confirmed") fail(code);
    const of = duplicates.filter((d) => d.duplicateOf === head.requestId);
    if (of.length !== duplicates.length) fail(code);
    const accepted = of.some((d) => d.outcome === "confirmed"),
      rejected = of.some((d) => d.outcome === "rejected");
    const expected = accepted ? "ACCEPTED" : rejected ? "REJECTED" : of.length ? "NOT_RUN" : null;
    if (expected === null) {
      if (!["NOT_RUN", "DUPLICATE_NOT_DEFINED"].includes(head.duplicate)) fail(code);
    } else if (head.duplicate !== expected) fail(code);
  }
}

const REPORT_KEYS = Object.freeze([
  "schema",
  "scope",
  "nonce",
  "casesSha256",
  "ledgerSha256",
  "state",
  "blockCode",
  "provenance",
  "globals",
  "intents",
  "isolation",
  "summary",
  "cases",
]);
const GLOBAL_KEYS = Object.freeze([
  "masterSession",
  "masterLogout",
  "secondSession",
  "secondLogout",
  "secondProfile",
  "rbacLeitorVersion",
  "masterPermissionsUnchanged",
  "transportErrors",
  "httpErrors",
  "pageErrors",
]);

/**
 * Valida o relatório: árvore JSON pura, só IDs, enums, contadores e booleanos (PLAN 7.5). O
 * status de cada recibo e o resumo são recalculados; intenções e inventário são o replay dos
 * eventos sobre o ledger cujo SHA o relatório declara; recibos são cruzados com o replay.
 * ledgerSha256 null só num relatório BLOCKED gravado antes de o ledger ser lido.
 */
export function validateF3Report(report, catalogue, { policy = F3_DUPLICATE_POLICY, ledger } = {}) {
  const code = "F3_REPORT";
  assertJsonTree(report, code);
  validateF3DuplicatePolicy(policy);
  assertCatalogue(catalogue, code);
  strictPlain(report, REPORT_KEYS, code);
  if (report.schema !== F3_REPORT_SCHEMA || report.scope !== INTEGRACAO_V1_FASE3_SCOPE.id)
    fail(code);
  if (report.nonce !== INTEGRACAO_V1_FASE3_SCOPE.nonce || report.casesSha256 !== F3_CASES_SHA256)
    fail(code);
  if (!["COMPLETE", "PARTIAL", "BLOCKED"].includes(report.state)) fail(code);
  const blocked = report.state === "BLOCKED";
  if (
    blocked
      ? !(typeof report.blockCode === "string" && CODE.test(report.blockCode))
      : report.blockCode !== null
  )
    fail(code);
  let state, record;
  if (report.ledgerSha256 === null) {
    if (!blocked || (ledger !== undefined && ledger !== null)) fail(code);
    state = emptyState();
  } else {
    record = ledgerRecord(ledger);
    if (report.ledgerSha256 !== record.sha256) fail(code);
    state = record.state;
  }
  validateProvenance(report.provenance, blocked, code);
  const g = report.globals;
  strictPlain(g, GLOBAL_KEYS, code);
  for (const k of ["masterSession", "masterLogout", "secondSession", "secondLogout"])
    if (typeof g[k] !== "boolean") fail(code);
  if (![F3_SECOND_USER_PROFILE, null].includes(g.secondProfile)) fail(code);
  if (![F3_RBAC_LEITOR.version, null].includes(g.rbacLeitorVersion)) fail(code);
  if (![true, false, null].includes(g.masterPermissionsUnchanged)) fail(code);
  for (const k of ["transportErrors", "httpErrors", "pageErrors"]) if (!isCount(g[k])) fail(code);
  const after = validateIntents(report.intents, code, state);
  // M2: relatório com eventos desta execução exige proveniência completa, mesmo BLOCKED; sem
  // isso a execução não poderia entrar no ledger e os envios ficariam sem registro.
  if (report.intents.events.length) validateProvenance(report.provenance, false, code);
  validateIsolation(report.isolation, after);
  plainArray(report.cases, code, F3_MATRIX.rows);
  if (catalogue === null) {
    if (!blocked || report.cases.length !== 0) fail(code);
  } else {
    if (report.cases.length !== catalogue.cases.length) fail(code);
    report.cases.forEach((r, i) => validateReceipt(r, catalogue.cases[i], report, policy, ledger));
    crossCheck(report, report.intents.requests, after.created);
  }
  strictPlain(report.summary, F3_CASE_STATUS, code);
  if (JSON.stringify(report.summary) !== JSON.stringify(f3Summary(report.cases))) fail(code);
  return true;
}

/**
 * Critérios da seção 5 do PLAN não atendidos, sobre um relatório validado com a política dada.
 * Ferramenta de diagnóstico: nunca devolve PASS. Quem decide é f3Gate.
 */
export function f3GateCriteria(report, catalogue, options = {}) {
  validateF3Report(report, catalogue, options);
  const g = report.globals,
    iso = report.isolation,
    s = report.summary,
    n = report.intents;
  const counters = Object.keys(iso.e87Before).sort();
  const checks = [
    ["STATE", report.state === "COMPLETE"],
    ["CATALOGUE", catalogue !== null],
    ["CASES", s.FAIL === 0 && s.BLOCKED === 0 && s.PASS + s.N_A_JUSTIFICADO === F3_MATRIX.rows],
    ["SESSIONS", g.masterSession && g.masterLogout && g.secondSession && g.secondLogout],
    ["SECOND_PROFILE", g.secondProfile === F3_SECOND_USER_PROFILE],
    ["RBAC", g.rbacLeitorVersion === F3_RBAC_LEITOR.version],
    ["MASTER_PERMISSIONS", g.masterPermissionsUnchanged === true],
    ["ERRORS", g.transportErrors + g.httpErrors + g.pageErrors === 0],
    ["PENDING", n.uncertain === 0],
    ["ABANDONED_RECHECKED", n.requests.every((q) => q.outcome !== "abandoned" || q.rechecked)],
    ["ORGANIZATION", iso.organizationF3 !== null],
    [
      "ISOLATION",
      iso.created.every((e) => ISOLATED_KINDS.includes(e.kind)) &&
        iso.created.filter((e) => e.kind === "organizacao").length === 1,
    ],
    [
      "PRINCIPALS",
      F3_MUTATING_ORDERS.every(
        (o) =>
          n.requests.filter(
            (q) => q.producerOrder === o && q.kind === "principal" && q.outcome === "confirmed",
          ).length <= 1,
      ),
    ],
    [
      "E87_COUNTERS",
      JSON.stringify(counters) === JSON.stringify([...F3_E87_COUNTER_SCREENS].sort()) &&
        JSON.stringify(iso.e87Before, counters) === JSON.stringify(iso.e87After, counters),
    ],
  ];
  return checks.filter(([, ok]) => !ok).map(([name]) => name);
}

/**
 * Gate quantitativo da seção 5 do PLAN. Sempre com a política de produção e o ledger fixado no
 * código: nem a política nem o ledger podem ser escolhidos por quem chama.
 */
export function f3Gate(report, catalogue, options = {}) {
  if (Object.keys(options).some((k) => k !== "ledger")) fail("F3_REPORT");
  const unmet = f3GateCriteria(report, catalogue, { ledger: options.ledger });
  if (report.ledgerSha256 !== F3_LEDGER_SHA256) unmet.push("LEDGER_PIN");
  return unmet.length === 0 ? "PASS" : "FAIL";
}

/** Proveniência a partir do ambiente do job, saneada: formato divergente vira null. */
export function f3ProvenanceFromEnv(env) {
  const pick = (key, re) => {
    const v = env[key];
    return typeof v === "string" && re.test(v) ? v : null;
  };
  return {
    frontendSha: pick("CONTAOS_FRONTEND_SHA", SHA40),
    backendSha: F3_BACKEND_SHA,
    harnessSha: pick("CONTAOS_HARNESS_SHA", SHA40),
    deploymentId: pick("CONTAOS_DEPLOYMENT_ID", DPL),
    workflowRunId: pick("GITHUB_RUN_ID", DIGITS),
  };
}

/**
 * Relatório BLOCKED: todo caso não executado fica BLOCKED, nunca PASS. Com o livro, carrega a
 * execução inteira (eventos, envios e inventário); sem livro e com ledger lido, carrega o estado
 * do ledger; sem ledger lido, ledgerSha256 é null e não há estado.
 */
export function blockedF3Report({ code, catalogue, provenance, ledger = null, book = null }) {
  if (typeof code !== "string" || !CODE.test(code)) fail("F3_REPORT");
  assertCatalogue(catalogue, "F3_REPORT");
  // Com o livro, o relatório parcial carrega tudo o que a execução já fez: eventos, envios e
  // inventário. Sem livro, carrega o estado do ledger; sem ledger lido, nenhum estado.
  const live = book === null ? null : (BOOKS.get(book) ?? fail("F3_REPORT"))();
  if (live && ledger !== null && ledgerRecord(ledger) !== live.record) fail("F3_REPORT");
  const record = live ? live.record : ledger === null ? null : ledgerRecord(ledger);
  const state = live ? live.st : record ? record.state : emptyState();
  const thisRun = live ? live.run : { sent: 0, events: [] };
  // Com o livro, a proveniência é a do livro (M2); outra proveniência é divergência, não escolha.
  if (
    live &&
    provenance != null &&
    (Object.keys(provenance).length !== PROVENANCE_KEYS.length ||
      PROVENANCE_KEYS.some((k) => provenance[k] !== live.provenance[k]))
  )
    fail("F3_REPORT");
  const prov = live ? live.provenance : (provenance ?? f3ProvenanceFromEnv({}));
  const cases = (catalogue?.cases ?? []).map((c) => {
    const r = {
      ...f3ReceiptBase(c, prov),
      applicability: "APLICAVEL",
      observed: { master: null, leitor: null },
      positive: "NOT_RUN",
      negatives: { inexistente: "NOT_RUN", outraOrganizacao: "NOT_RUN" },
      duplicate: "NOT_RUN",
      requestId: null,
      entityIds: [],
      errorClass: null,
      cleanupStatus: "NO_MUTATION",
      status: "BLOCKED",
    };
    return Object.fromEntries(F3_RECEIPT_KEYS.map((k) => [k, r[k]]));
  });
  return {
    schema: F3_REPORT_SCHEMA,
    scope: INTEGRACAO_V1_FASE3_SCOPE.id,
    nonce: INTEGRACAO_V1_FASE3_SCOPE.nonce,
    casesSha256: F3_CASES_SHA256,
    ledgerSha256: record ? record.sha256 : null,
    state: "BLOCKED",
    blockCode: code,
    provenance: { ...prov },
    globals: {
      masterSession: false,
      masterLogout: false,
      secondSession: false,
      secondLogout: false,
      secondProfile: null,
      rbacLeitorVersion: null,
      masterPermissionsUnchanged: null,
      transportErrors: 0,
      httpErrors: 0,
      pageErrors: 0,
    },
    intents: summarize(state, thisRun),
    isolation: {
      organizationF3: state.organizationF3,
      created: state.created.map((c) => ({ ...c })),
      e87Before: {},
      e87After: {},
    },
    summary: f3Summary(cases),
    cases,
  };
}

/**
 * Grava F3_REPORT.json, a cópia do catálogo e SHA256SUMS. Valida o objeto, serializa uma vez,
 * valida de novo o que vai para o disco e exige que casesRaw seja o catálogo publicado e o mesmo
 * catálogo emitido por buildF3Cases. Relatório inválido nunca é gravado.
 */
export async function writeF3Artifacts(dir, report, catalogue, casesRaw, options = {}) {
  // Como o gate: só o ledger vem de quem chama; a política é sempre a de produção.
  if (Object.keys(options).some((k) => k !== "ledger")) fail("F3_REPORT");
  options = { ledger: options.ledger };
  validateF3Report(report, catalogue, options);
  const body = JSON.stringify(report, null, 2) + "\n";
  validateF3Report(JSON.parse(body), catalogue, options);
  if (catalogue !== null) {
    if (typeof casesRaw !== "string" || sha256(casesRaw) !== F3_CASES_SHA256) fail("F3_CASES_HASH");
    if (JSON.stringify(JSON.parse(casesRaw)) !== JSON.stringify(catalogue)) fail("F3_CASES_HASH");
  }
  await mkdir(dir, { recursive: true });
  const files = [["F3_REPORT.json", body]];
  if (catalogue !== null) files.push(["F3_CASES.json", casesRaw]);
  files.sort(([a], [b]) => a.localeCompare(b));
  for (const [name, content] of files) await writeFile(join(dir, name), content, { flag: "w" });
  const sums = files.map(([name, content]) => sha256(content) + "  " + name + "\n").join("");
  await writeFile(join(dir, "SHA256SUMS"), sums, { flag: "w" });
  return true;
}

export function assertF3SecondUserProfile(profile) {
  if (profile !== F3_SECOND_USER_PROFILE) fail("F3_SECOND_USER_PROFILE");
  return true;
}

/** Releitura do RBAC efetivo do leitor durante a execução contra a fotografia v6. */
export function assertF3LeitorRbac(observed) {
  const code = "F3_RBAC_DRIFT";
  try {
    strictPlain(observed, ["version", "allowed"], code);
    plainArray(observed.allowed, code, 64);
  } catch {
    fail(code);
  }
  const allowed = [...observed.allowed].sort();
  if (observed.version !== F3_RBAC_LEITOR.version || new Set(allowed).size !== allowed.length)
    fail(code);
  if (JSON.stringify(allowed) !== JSON.stringify(F3_RBAC_LEITOR.allowed)) fail(code);
  return true;
}

/**
 * Classifica uma observação de acesso. DENY só com o estado explícito registrado para a tela e
 * sem conteúdo; ALLOW só com conteúdo e sem negação. Em V123, DENY exige a RPC
 * pode_consultar_auditoria_organizacao com HTTP 200 e corpo false (o catch(() => false) da tela
 * não pode transformar erro em negação).
 */
export function classifyF3Access(screen, observation) {
  if (!own(F3_SCREEN_ACCESS, screen)) fail("F3_SCREEN_ACCESS");
  const code = "F3_ACCESS_OBSERVATION";
  strictPlain(observation, ["denialToken", "content", "rpc"], code);
  const { content, rpc } = observation;
  let token = observation.denialToken;
  if (typeof content !== "boolean" || (token !== null && typeof token !== "string")) fail(code);
  if (own(F3_PARTIAL_DENIALS, screen) && token === F3_PARTIAL_DENIALS[screen]) token = null;
  const denial = own(F3_DENIAL_TOKENS, screen) ? F3_DENIAL_TOKENS[screen] : null;
  if (screen === "V123") {
    if (rpc === null || typeof rpc !== "object" || isProxy(rpc)) return "ERROR";
    strictPlain(rpc, ["name", "status", "body"], code);
    if (rpc.name !== F3_V123_RPC || rpc.status !== 200 || typeof rpc.body !== "boolean")
      return "ERROR";
    if (rpc.body === false) return token === denial && !content ? "DENY" : "ERROR";
    return token === null && content ? "ALLOW" : "ERROR";
  }
  if (rpc !== null) fail(code);
  if (token !== null) return denial !== null && token === denial && !content ? "DENY" : "ERROR";
  return content ? "ALLOW" : "ERROR";
}

const LEDGER_ENTRY_KEYS = Object.freeze([
  "caseId",
  "status",
  ...PROVENANCE_KEYS,
  "requestId",
  "entityIds",
  "artifactId",
  "sha256",
  "reviewId",
]);
const LEDGER_RUN_KEYS = Object.freeze([
  "workflowRunId",
  "frontendSha",
  "harnessSha",
  "deploymentId",
  "artifactId",
  "sha256",
  "reviewId",
  "events",
]);
/**
 * Ledger append-only: os eventos do livro de cada execução e os PASS verificados (regra C). O
 * estado acumulado sai do replay dos eventos; cada PASS cita uma execução registrada, com a mesma
 * proveniência (frontend, harness e deployment), e a principal confirmada e isolada no estado ao
 * fim dessa execução, com a entidade que o replay registra para ela.
 * O ledger validado fica congelado e guarda o SHA-256 do bruto.
 */
export function validateF3Ledger(raw, catalogue) {
  const code = "F3_LEDGER";
  if (typeof raw !== "string" || raw.length > 1048576) fail(code);
  let value;
  try {
    value = JSON.parse(raw);
    assertJsonTree(value, code);
    strictPlain(
      value,
      ["schema", "scope", "matrixSha256", "casesSha256", "backendSha", "runs", "entries"],
      code,
    );
    plainArray(value.entries, code, F3_MATRIX.rows);
    plainArray(value.runs, code, 16);
    assertCatalogue(catalogue, code);
  } catch {
    fail(code);
  }
  if (value.schema !== F3_LEDGER_SCHEMA || value.scope !== INTEGRACAO_V1_FASE3_SCOPE.id) fail(code);
  if (value.matrixSha256 !== F3_MATRIX.sha256 || value.casesSha256 !== F3_CASES_SHA256) fail(code);
  if (value.backendSha !== F3_BACKEND_SHA) fail(code);
  if (catalogue === null && value.entries.length) fail(code);
  const runs = new Map();
  let state = emptyState();
  for (const run of value.runs) {
    try {
      strictPlain(run, LEDGER_RUN_KEYS, code);
      if (!DIGITS.test(run.workflowRunId) || runs.has(run.workflowRunId)) fail(code);
      if (!SHA40.test(run.harnessSha) || !SHA40.test(run.frontendSha)) fail(code);
      if (!DPL.test(run.deploymentId)) fail(code);
      // M3: a execução aponta o artefato (ID e SHA-256 do ZIP, PLAN 7.5) e a revisão que
      // conferiu os eventos contra o F3_REPORT.json dele; um prefixo válido passaria no replay.
      if (!DIGITS.test(run.artifactId) || !SHA64.test(run.sha256) || !DIGITS.test(run.reviewId))
        fail(code);
      const replay = replayRun(state, run.events);
      state = closeRun(replay.st, replay.run);
    } catch {
      fail(code);
    }
    // Estado ao fim desta execução: a entrada PASS é conferida contra ele, não contra o final.
    runs.set(run.workflowRunId, { run, state: cloneState(state) });
  }
  const cases = new Map((catalogue?.cases ?? []).map((c) => [c.caseId, c])),
    seen = new Set();
  for (const e of value.entries) {
    try {
      strictPlain(e, LEDGER_ENTRY_KEYS, code);
      validateProvenance(Object.fromEntries(PROVENANCE_KEYS.map((k) => [k, e[k]])), false, code);
      plainArray(e.entityIds, code, 8);
    } catch {
      fail(code);
    }
    const c = cases.get(e.caseId);
    if (e.status !== "PASS" || !c || seen.has(e.caseId)) fail(code);
    const cited = runs.get(e.workflowRunId);
    if (!cited) fail(code);
    // A entrada herda da execução citada o produto, o artefato e a revisão: uma só fonte (M3).
    for (const k of [
      "harnessSha",
      "frontendSha",
      "deploymentId",
      "artifactId",
      "sha256",
      "reviewId",
    ])
      if (cited.run[k] !== e[k]) fail(code);
    if (!DIGITS.test(e.artifactId) || !SHA64.test(e.sha256) || !DIGITS.test(e.reviewId)) fail(code);
    if (F3_MUTATING_ORDERS.includes(c.producerOrder)) {
      const at = cited.state;
      const i = isUuid(e.requestId) ? at.intents.get(e.requestId) : undefined;
      if (!i || i.kind !== "principal" || i.producerOrder !== c.producerOrder) fail(code);
      if (i.state !== "confirmed" || JSON.stringify(e.entityIds) !== JSON.stringify([i.entityId]))
        fail(code);
      const made = at.created.find((x) => x.requestId === e.requestId);
      if (!ISOLATED_KINDS.includes(made?.kind)) fail(code);
    } else if (e.requestId !== null || e.entityIds.length) fail(code);
    seen.add(e.caseId);
  }
  deepFreeze(value);
  LEDGERS.set(value, { state, sha256: sha256(raw) });
  return value;
}

/** Ledger vazio validado, sem catálogo, para testes e ferramentas. */
export function emptyF3Ledger() {
  return validateF3Ledger(
    JSON.stringify({
      schema: F3_LEDGER_SCHEMA,
      scope: INTEGRACAO_V1_FASE3_SCOPE.id,
      matrixSha256: F3_MATRIX.sha256,
      casesSha256: F3_CASES_SHA256,
      backendSha: F3_BACKEND_SHA,
      runs: [],
      entries: [],
    }),
    null,
  );
}

/** Resumo do estado derivado de um ledger validado (organização, envios, intenções e SHA). */
export function f3LedgerState(ledger) {
  const record = ledgerRecord(ledger);
  const { requests, priorSent } = summarize(record.state, { sent: 0, events: [] });
  return {
    organizationF3: record.state.organizationF3,
    priorSent,
    requests,
    created: record.state.created.map((c) => ({ ...c })),
    sha256: record.sha256,
  };
}

/** Extensão do ledger fixado no código: só acrescenta execuções e entradas. */
export function validateF3LedgerExtension(previousRaw, raw, catalogue) {
  if (sha256(previousRaw) !== F3_LEDGER_SHA256) fail("F3_LEDGER");
  const prev = validateF3Ledger(previousRaw, catalogue),
    next = validateF3Ledger(raw, catalogue);
  for (const key of ["runs", "entries"]) {
    if (next[key].length < prev[key].length) fail("F3_LEDGER");
    prev[key].forEach((e, i) => {
      if (JSON.stringify(e) !== JSON.stringify(next[key][i])) fail("F3_LEDGER");
    });
  }
  return true;
}

/** PASS do ledger reaproveitável no produto atual (plano mestre 16.3): mesmo produto, backend,
 * deployment e harness, ou equivalência revisada em F3_HARNESS_EQUIVALENCES. */
function preservable(entry, provenance) {
  const harness =
    entry.harnessSha === provenance.harnessSha ||
    F3_HARNESS_EQUIVALENCES.some(
      (e) =>
        e.from === entry.harnessSha && e.to === provenance.harnessSha && DIGITS.test(e.reviewId),
    );
  return (
    harness &&
    entry.frontendSha === provenance.frontendSha &&
    entry.backendSha === provenance.backendSha &&
    entry.deploymentId === provenance.deploymentId
  );
}

/** Casos do ledger validado que podem entrar preservados no relatório desta execução. */
export function preservedF3Cases(ledger, provenance) {
  ledgerRecord(ledger);
  assertJsonTree(provenance, "F3_LEDGER");
  strictPlain(provenance, PROVENANCE_KEYS, "F3_LEDGER");
  return ledger.entries.filter((e) => preservable(e, provenance)).map((e) => e.caseId);
}

// Trechos exatos do YAML aprovado (PLAN 7.4, itens a–d). A estrutura não depende só do SHA:
// passos críticos, gatilhos e permissões são comparados por texto literal.
const WORKFLOW_ON = `on:
  pull_request:
    branches: [main]
    paths:
      - "scripts/ci/install-pinned-bun.mjs"
      - "scripts/ci/install-pinned-bun.test.mjs"
      - scripts/hml/prepare-visual-fixtures.mjs
      - scripts/hml/prepare-visual-fixtures.test.mjs
      - scripts/hml/integracao-v1-fase3.mjs
      - scripts/hml/integracao-v1-fase3.test.mjs
      - scripts/hml/authenticated-visual-audit.mjs
      - scripts/hml/authenticated-visual-audit.test.mjs
      - .github/workflows/contaos-trilha-a-fixtures.yml
      - package.json
      - bun.lock
  workflow_run:
    workflows: ["ContaOS Frontend Zero-Drift"]
    types: [completed]
    branches: [main]
  workflow_dispatch:
`;
const JOB_PERMISSIONS = `    permissions:
      contents: read
      actions: read
      pull-requests: read
`;
const STEP_REVALIDATE = `name: Revalidar main e unicidade dentro da concorrencia antes de secrets
        id: revalidate
        if: github.event_name == 'workflow_run'
        env:
          CONTAOS_ACTIONS_READ_TOKEN: \${{ github.token }}
        run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate`;
const STEP_TRILHA = `name: Somente agora fornecer o par sintetico ao preparador separado
        if: steps.revalidate.outputs.scope == 'TRILHA_A'
        env:
          CONTAOS_HML_SYNTHETIC_EMAIL: \${{ secrets.CONTAOS_HML_SYNTHETIC_EMAIL }}
          CONTAOS_HML_SYNTHETIC_PASSWORD: \${{ secrets.CONTAOS_HML_SYNTHETIC_PASSWORD }}
        run: node scripts/hml/prepare-visual-fixtures.mjs --prepare-fixtures`;
const STEP_F3 = `name: Somente agora fornecer os pares sinteticos ao executor da Fase 3
        if: steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'
        env:
          CONTAOS_HML_SYNTHETIC_EMAIL: \${{ secrets.CONTAOS_HML_SYNTHETIC_EMAIL }}
          CONTAOS_HML_SYNTHETIC_PASSWORD: \${{ secrets.CONTAOS_HML_SYNTHETIC_PASSWORD }}
          CONTAOS_HML_SYNTHETIC_2_EMAIL: \${{ secrets.CONTAOS_HML_SYNTHETIC_2_EMAIL }}
          CONTAOS_HML_SYNTHETIC_2_PASSWORD: \${{ secrets.CONTAOS_HML_SYNTHETIC_2_PASSWORD }}
        run: node scripts/hml/integracao-v1-fase3.mjs --run-f3`;
const STEP_HASHES = `name: Verificar hashes da Fase 3, inclusive em resultado parcial
        if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'
        working-directory: artifacts/integracao-v1-fase3
        run: sha256sum --check SHA256SUMS`;
const STEP_UPLOAD = `name: Evidencia privada da Fase 3 por 90 dias
        if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'
        uses: actions/upload-artifact@v4
        with:
          name: integracao-v1-fase3-\${{ github.run_id }}-\${{ github.run_attempt }}
          path: artifacts/integracao-v1-fase3/
          retention-days: 90
          if-no-files-found: error`;

/**
 * Estrutura exigida do YAML (PLAN 7.4, itens a–d): gatilhos e permissões fixos, pares
 * sintéticos só nos passos dos executores, o do 2º usuário só no executor F3, depois da barreira
 * nativa e da revalidação por escopo, e evidência F3 sempre gravada.
 */
export function assertF3WorkflowStructure(yaml) {
  const ok = (cond) => {
    if (!cond) fail("F3_WORKFLOW");
  };
  ok(typeof yaml === "string" && yaml.length < 262144);
  const count = (n) => yaml.split(n).length - 1;
  ok(yaml.startsWith("name: ContaOS Trilha A Fixtures\n" + WORKFLOW_ON));
  ok(count("\non:") === 1 && count("\npermissions:\n  contents: read\njobs:\n") === 1);
  ok(count("permissions:") === 3 && count(JOB_PERMISSIONS) === 2);
  ok(count("environment:") === 1 && count("    environment: hml\n") === 1);
  ok(!/continue-on-error|toJSON|secrets\s*\[|github\.token\s*\|\||\bvars\./.test(yaml));
  // Toda referência a secrets é secrets.NOME, e só os quatro pares aprovados.
  const expressions = (yaml.match(/\$\{\{[^}]*\}\}/g) ?? []).filter((e) => /\bsecrets\b/.test(e));
  ok(expressions.length === 6 && (yaml.match(/\bsecrets\b/g) ?? []).length === 9);
  ok(
    expressions.every((e) =>
      /^\$\{\{ secrets\.CONTAOS_HML_SYNTHETIC_(2_)?(EMAIL|PASSWORD) \}\}$/.test(e),
    ),
  );
  for (const name of ["CONTAOS_HML_SYNTHETIC_EMAIL", "CONTAOS_HML_SYNTHETIC_PASSWORD"])
    ok(count(name) === 4);
  for (const name of ["CONTAOS_HML_SYNTHETIC_2_EMAIL", "CONTAOS_HML_SYNTHETIC_2_PASSWORD"])
    ok(count(name) === 2);
  const protocol = yaml.slice(yaml.indexOf("\n  protocol:\n"), yaml.indexOf("\n  private:\n"));
  const line = (needle) => protocol.split("\n").find((l) => l.includes(needle)) ?? "";
  ok(line("node --test scripts/hml/").includes("scripts/hml/integracao-v1-fase3.test.mjs"));
  for (const tool of ["bunx eslint", "bunx prettier --check"])
    for (const f of ["integracao-v1-fase3.mjs", "integracao-v1-fase3.test.mjs"])
      ok(line(tool).includes("scripts/hml/" + f));
  ok(yaml.indexOf("\n  private:\n") > 0);
  const privateJob = yaml.slice(yaml.indexOf("\n  private:\n"));
  const header = privateJob.slice(0, privateJob.indexOf("    steps:"));
  ok(!header.includes("secrets") && header.includes(JOB_PERMISSIONS));
  ok(header.includes("    environment: hml\n    timeout-minutes: 80\n"));
  const steps = privateJob.split("\n      - ").slice(1);
  const at = (needle) => {
    const found = steps.map((s, i) => [i, s]).filter(([, s]) => s.includes(needle));
    ok(found.length === 1);
    return found[0][0];
  };
  const exact = (text) => {
    const i = at(text.split("\n")[0] + "\n");
    ok(steps[i].replace(/\n+$/, "") === text);
    return i;
  };
  const guard = at("run: node scripts/hml/authenticated-visual-audit.mjs --native-guard"),
    revalidate = exact(STEP_REVALIDATE),
    trilha = exact(STEP_TRILHA),
    f3 = exact(STEP_F3),
    hashes = exact(STEP_HASHES),
    upload = exact(STEP_UPLOAD);
  ok(
    steps[guard] ===
      "name: Barreira nativa no mesmo HEAD antes de secrets\n        run: node scripts/hml/authenticated-visual-audit.mjs --native-guard",
  );
  ok(guard < revalidate && revalidate < trilha && trilha < f3 && f3 < hashes && hashes < upload);
  const withSecrets = steps.map((s, i) => [i, s]).filter(([, s]) => s.includes("secrets."));
  ok(JSON.stringify(withSecrets.map(([i]) => i)) === JSON.stringify([trilha, f3]));
  return true;
}

/** Contrato completo: estrutura e SHA-256 do YAML aprovado. */
export function assertF3WorkflowContract(yaml) {
  assertF3WorkflowStructure(yaml);
  if (sha256(yaml) !== F3_WORKFLOW_SHA256) fail("F3_WORKFLOW");
  return true;
}

/** Driver de produção: até os incrementos seguintes do BUILD-2b-2, nenhum produtor roda. */
async function pendingDriver() {
  fail("F3_DRIVER_PENDING");
}

// Prazo interno da sessão (parecer R2, grupo D), abaixo dos 45 minutos do PLAN 7.2 e do limite
// do job: o relatório parcial é gravado pelo próprio executor, nunca perdido num job morto.
export const F3_SESSION_DEADLINE_MS = 40 * 60 * 1000;

/**
 * Sessão da execução, depois do ledger validado: confere o catálogo, cria o livro com a
 * proveniência (M2), roda o driver dentro do prazo, faz a conferência final de isolamento e
 * devolve o relatório. Prazo esgotado ou cancelamento (signal, ligado a SIGTERM e SIGINT no
 * runCli) congelam o livro, que deixa de selar, e devolvem o parcial. Toda falha depois de
 * criado o livro gera o relatório parcial com o livro: eventos, envios e inventário. Livro
 * congelado por desvio da cerca encerra com F3_FENCE_FROZEN.
 */
export async function runF3Session({
  catalogue,
  ledger,
  provenance,
  drive = pendingDriver,
  signal,
}) {
  let book = null,
    timer = null,
    onAbort = null;
  const freezeBook = () => {
    if (book) BOOKS.get(book)().control.frozen = true;
  };
  try {
    assertCatalogue(catalogue, "F3_REPORT");
    if (catalogue === null) fail("F3_REPORT");
    // Proveniência incompleta para o livro: nenhuma mutação pode ser registrada (M2).
    book = createF3IntentBook({ ledger, provenance });
    const stop = new Promise((_, reject) => {
      timer = setTimeout(() => {
        freezeBook();
        reject(Object.assign(new Error("F3_SESSION_DEADLINE"), { code: "F3_SESSION_DEADLINE" }));
      }, F3_SESSION_DEADLINE_MS);
      onAbort = () => {
        freezeBook();
        reject(Object.assign(new Error("F3_SESSION_ABORTED"), { code: "F3_SESSION_ABORTED" }));
      };
      if (signal?.aborted) onAbort();
      else signal?.addEventListener("abort", onAbort, { once: true });
    });
    stop.catch(() => {});
    await Promise.race([Promise.resolve().then(() => drive(book)), stop]);
    if (book.frozen()) fail("F3_FENCE_FROZEN");
    book.assertIsolation();
    fail("F3_DRIVER_PENDING");
  } catch (error) {
    let code = CODE.test(error?.code || "") ? error.code : "F3_FAILURE";
    // Congelamento por desvio da cerca é a causa, não o sintoma que o driver viu depois.
    if (book?.frozen() && !["F3_SESSION_DEADLINE", "F3_SESSION_ABORTED"].includes(code))
      code = "F3_FENCE_FROZEN";
    freezeBook();
    return {
      code,
      report: blockedF3Report({ code, catalogue, provenance, ledger, book }),
    };
  } finally {
    clearTimeout(timer);
    if (onAbort) signal?.removeEventListener("abort", onAbort);
  }
}

export async function runCli(args = process.argv.slice(2), env = process.env) {
  if (!Array.isArray(args) || args.length !== 1 || args[0] !== "--run-f3") fail("F3_CLI_USAGE");
  if (env.GITHUB_EVENT_NAME !== "workflow_run") fail("F3_MAIN_ONLY");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const provenance = f3ProvenanceFromEnv(env);
  let catalogue = null,
    casesRaw = null,
    ledger = null,
    session = null;
  try {
    await loadSingleRequestProof({ operation: "fixtures", fresh: true });
    assertF3Scope(singleRequestFixturesScope());
    assertF3WorkflowContract(await readFile(join(root, F3_WORKFLOW_PATH), "utf8"));
    const csv = await readFile(join(root, F3_MATRIX.path), "utf8");
    const raw = await readFile(join(root, F3_CASES_PATH), "utf8");
    if (sha256(raw) !== F3_CASES_SHA256) fail("F3_CASES_HASH");
    validateF3Cases(JSON.parse(raw), csv);
    [catalogue, casesRaw] = [buildF3Cases(csv), raw];
    const ledgerRaw = await readFile(join(root, F3_LEDGER_PATH), "utf8");
    if (sha256(ledgerRaw) !== F3_LEDGER_SHA256) fail("F3_LEDGER_HASH");
    ledger = validateF3Ledger(ledgerRaw, catalogue);
    // Cancelamento do job (SIGTERM ou SIGINT) congela o livro e grava o parcial.
    const abort = new AbortController();
    const onSignal = () => abort.abort();
    process.once("SIGTERM", onSignal);
    process.once("SIGINT", onSignal);
    try {
      session = await runF3Session({ catalogue, ledger, provenance, signal: abort.signal });
    } finally {
      process.off("SIGTERM", onSignal);
      process.off("SIGINT", onSignal);
    }
    fail(session.code);
  } catch (error) {
    // Resultado parcial ou bloqueado também gera F3_REPORT.json e SHA256SUMS (BUILD-1, obrigação 1).
    const code = CODE.test(error?.code || "") ? error.code : "F3_FAILURE";
    const report = session?.report ?? blockedF3Report({ code, catalogue, provenance, ledger });
    await writeF3Artifacts(join(root, F3_ARTIFACT_DIR), report, catalogue, casesRaw, { ledger });
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli()
    .catch((error) => {
      const code = /^[A-Z0-9_]{1,80}$/.test(error?.code || "") ? error.code : "F3_FAILURE";
      process.stderr.write(JSON.stringify({ state: "BLOCKED", code }) + "\n");
      process.exitCode = 1;
    })
    // Artefatos já gravados: sai mesmo que o driver tenha deixado navegador ou timer vivos.
    .finally(() => process.exit(process.exitCode ?? 0));
}

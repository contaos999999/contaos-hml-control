/**
 * Executor mutante da Fase 3 da integração funcional V1 (cadastros e relacionamentos).
 * PLAN/GATE: docs/frontend/planos/INTEGRACAO_V1_FASE3_CADASTROS_RELACIONAMENTOS_PLAN_GATE_2026-11-13.md
 *
 * BUILD-1: catálogo derivado da matriz, validadores estritos, orçamento, enums e guarda de escopo.
 * BUILD-2a: esperado por tela (MASTER e leitor) fixado no catálogo, com fonte no código e a
 * fotografia RBAC v6 do perfil leitor.
 * BUILD-2b-1: relatório e SHA256SUMS (também parcial), ledger append-only, livro de intenções,
 * releitura do RBAC, classificador de negação explícita e contrato do YAML. Os drivers de UI vêm
 * no BUILD-2b-2; até lá a execução HML grava o relatório BLOCKED e falha com F3_DRIVER_PENDING.
 * Nunca importado pelo auditor somente leitura.
 */
import { createHash } from "node:crypto";
import { isProxy } from "node:util/types";
import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import {
  INTEGRACAO_V1_FASE3_SCOPE,
  loadSingleRequestProof,
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
  const access = F3_SCREEN_ACCESS[screen];
  if (!access) fail("F3_SCREEN_ACCESS");
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
  return Object.freeze({
    schema: "contaos.integracao-v1.f3.cases.v1",
    matrixPath: F3_MATRIX.path,
    matrixSha256: F3_MATRIX.sha256,
    scope: INTEGRACAO_V1_FASE3_SCOPE.id,
    count: cases.length,
    cases: Object.freeze(cases),
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
export function assertF3Budget({ priorConfirmed, newIntents }) {
  if (
    !Number.isSafeInteger(priorConfirmed) ||
    !Number.isSafeInteger(newIntents) ||
    priorConfirmed < 0 ||
    newIntents < 0
  )
    fail("F3_BUDGET");
  if (newIntents > F3_BUDGET.perRun || priorConfirmed + newIntents > F3_BUDGET.total)
    fail("F3_BUDGET");
  return true;
}

/** Guarda de escopo: só a solicitação F3 provada nesta execução autoriza o executor. */
export function assertF3Scope(scope) {
  if (scope !== INTEGRACAO_V1_FASE3_SCOPE.id) fail("FIXTURES_SCOPE_NOT_F3");
  return true;
}

// ---------------------------------------------------------------------------------------------
// BUILD-2b-1: infraestrutura offline. Relatório e SHA256SUMS (também em resultado parcial),
// ledger append-only (regra C), livro de intenções idempotente, releitura do RBAC do leitor,
// classificador de negação explícita e contrato do YAML. Os drivers de UI ficam no BUILD-2b-2.
// ---------------------------------------------------------------------------------------------
export const F3_E87_ORG = "e87f7e68-c5ae-4077-943b-02a4afd8b6ee";
export const F3_REPORT_SCHEMA = "contaos.integracao-v1.f3.report.v1";
export const F3_LEDGER_SCHEMA = "contaos.integracao-v1.f3.ledger.v1";
export const F3_LEDGER_PATH =
  "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json";
// SHA-256 do ledger publicado; muda só por PR que estende o ledger com evidência verificada.
export const F3_LEDGER_SHA256 = "3cd3a1b67cc1eee8ce74fe194eadbe22c97d995c04fe433e28c6094158a8a486";
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
]);

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
  };
}

/** Status derivado das provas; nunca declarado pelo driver. FAIL prevalece sobre BLOCKED. */
export function deriveF3Status(r) {
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
  if (
    r.positive !== "PASS" ||
    negatives.some((n) => n !== "NEGADO") ||
    r.duplicate === "NOT_RUN" ||
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
  return value;
}

function validateProvenance(p, blocked, code) {
  strictPlain(p, PROVENANCE_KEYS, code);
  if (p.backendSha !== F3_BACKEND_SHA) fail(code);
  const ok = {
    frontendSha: SHA40,
    harnessSha: SHA40,
    deploymentId: DPL,
    workflowRunId: DIGITS,
  };
  for (const [k, re] of Object.entries(ok))
    if (!(typeof p[k] === "string" && re.test(p[k])) && !(blocked && p[k] === null)) fail(code);
}

function validateReceipt(r, c, report, mutatingCreated) {
  const code = "F3_REPORT";
  strictPlain(r, F3_RECEIPT_KEYS, code);
  strictPlain(r.expected, ["master", "leitor"], code);
  strictPlain(r.observed, ["master", "leitor"], code);
  strictPlain(r.negatives, ["inexistente", "outraOrganizacao"], code);
  for (const k of CASE_KEYS) if (JSON.stringify(r[k]) !== JSON.stringify(c[k])) fail(code);
  if (r.operation !== c.producer) fail(code);
  for (const k of PROVENANCE_KEYS) if (r[k] !== report.provenance[k]) fail(code);
  if (r.artifactId !== null || r.sha256 !== null || r.reviewId !== null) fail(code);
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
  for (const id of r.entityIds) if (!mutatingCreated.has(id)) fail("F3_ISOLATION");
  const mutating = F3_MUTATING_ORDERS.includes(r.producerOrder);
  if (r.cleanupStatus === "ISOLATED_NO_DELETE" && (!mutating || r.requestId === null)) fail(code);
  if (r.cleanupStatus === "NO_MUTATION" && (r.requestId !== null || r.entityIds.length)) fail(code);
  if (r.applicability === "N_A_JUSTIFICADO") {
    if (r.classification !== "CONDICIONAL" || !F3_NA_AMENDMENTS.includes(r.caseId))
      fail("F3_NA_UNAPPROVED");
  }
  if (r.status !== deriveF3Status(r)) fail(code);
  if (r.status === "PASS") {
    if (mutating && (r.cleanupStatus !== "ISOLATED_NO_DELETE" || !r.entityIds.length)) fail(code);
    if (!mutating && r.cleanupStatus !== "NO_MUTATION") fail(code);
  }
}

function validateIsolation(iso, blocked) {
  const code = "F3_ISOLATION";
  strictPlain(iso, ["organizationF3", "created", "e87Before", "e87After"], code);
  if (iso.organizationF3 === null) {
    if (!blocked) fail(code);
  } else if (!isUuid(iso.organizationF3) || iso.organizationF3 === F3_E87_ORG) fail(code);
  plainArray(iso.created, code, 64);
  const ids = new Set();
  for (const e of iso.created) {
    strictPlain(e, ["id", "kind", "organizationId"], code);
    if (!isUuid(e.id) || ids.has(e.id) || !["organizacao", "registro"].includes(e.kind)) fail(code);
    ids.add(e.id);
    if (e.organizationId !== iso.organizationF3 || e.organizationId === F3_E87_ORG) fail(code);
    if (e.kind === "organizacao" && e.id !== iso.organizationF3) fail(code);
  }
  for (const counters of [iso.e87Before, iso.e87After]) {
    if (!counters || typeof counters !== "object" || Array.isArray(counters) || isProxy(counters))
      fail(code);
    if (![Object.prototype, null].includes(Object.getPrototypeOf(counters))) fail(code);
    for (const k of Reflect.ownKeys(counters)) {
      const d = Object.getOwnPropertyDescriptor(counters, k);
      if (typeof k !== "string" || !F3_SCREEN_ACCESS[k] || !Object.hasOwn(d, "value")) fail(code);
      if (!isCount(d.value)) fail(code);
    }
  }
  const before = Object.keys(iso.e87Before).sort(),
    after = Object.keys(iso.e87After).sort();
  if (JSON.stringify(before) !== JSON.stringify(after)) fail(code);
  return ids;
}

/**
 * Valida o relatório: só IDs, enums, contadores e booleanos (PLAN 7.5). Qualquer string fora do
 * formato fechado do campo (texto livre, e-mail, JWT, HTML) falha. O status de cada recibo e o
 * resumo são recalculados, impedindo falso PASS.
 */
export function validateF3Report(report, catalogue) {
  const code = "F3_REPORT";
  strictPlain(
    report,
    [
      "schema",
      "scope",
      "nonce",
      "casesSha256",
      "state",
      "blockCode",
      "provenance",
      "globals",
      "intents",
      "isolation",
      "summary",
      "cases",
    ],
    code,
  );
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
  validateProvenance(report.provenance, blocked, code);
  const g = report.globals;
  strictPlain(
    g,
    [
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
    ],
    code,
  );
  for (const k of ["masterSession", "masterLogout", "secondSession", "secondLogout"])
    if (typeof g[k] !== "boolean") fail(code);
  if (![F3_SECOND_USER_PROFILE, null].includes(g.secondProfile)) fail(code);
  if (![F3_RBAC_LEITOR.version, null].includes(g.rbacLeitorVersion)) fail(code);
  if (![true, false, null].includes(g.masterPermissionsUnchanged)) fail(code);
  for (const k of ["transportErrors", "httpErrors", "pageErrors"]) if (!isCount(g[k])) fail(code);
  const n = report.intents;
  strictPlain(n, ["priorConfirmed", "sent", "confirmed", "uncertain", "rejected"], code);
  for (const v of Object.values(n)) if (!isCount(v)) fail(code);
  if (n.confirmed + n.uncertain + n.rejected > n.sent) fail(code);
  assertF3Budget({ priorConfirmed: n.priorConfirmed, newIntents: n.sent });
  const created = validateIsolation(report.isolation, blocked);
  plainArray(report.cases, code, F3_MATRIX.rows);
  if (catalogue === null) {
    if (!blocked || report.cases.length !== 0) fail(code);
  } else {
    if (report.cases.length !== catalogue.cases.length) fail(code);
    report.cases.forEach((r, i) => validateReceipt(r, catalogue.cases[i], report, created));
  }
  strictPlain(report.summary, F3_CASE_STATUS, code);
  if (JSON.stringify(report.summary) !== JSON.stringify(f3Summary(report.cases))) fail(code);
  return true;
}

/** Gate quantitativo da seção 5 do PLAN sobre um relatório já validado. */
export function f3Gate(report, catalogue) {
  validateF3Report(report, catalogue);
  const g = report.globals,
    iso = report.isolation,
    s = report.summary;
  const ok =
    report.state === "COMPLETE" &&
    catalogue !== null &&
    s.FAIL === 0 &&
    s.BLOCKED === 0 &&
    s.PASS + s.N_A_JUSTIFICADO === F3_MATRIX.rows &&
    g.masterSession &&
    g.masterLogout &&
    g.secondSession &&
    g.secondLogout &&
    g.secondProfile === F3_SECOND_USER_PROFILE &&
    g.rbacLeitorVersion === F3_RBAC_LEITOR.version &&
    g.masterPermissionsUnchanged === true &&
    g.transportErrors + g.httpErrors + g.pageErrors === 0 &&
    iso.organizationF3 !== null &&
    Object.keys(iso.e87Before).length > 0 &&
    JSON.stringify(iso.e87Before) === JSON.stringify(iso.e87After);
  return ok ? "PASS" : "FAIL";
}

/** Proveniência a partir do ambiente do job, saneada: formato divergente vira null. */
export function f3ProvenanceFromEnv(env) {
  const pick = (v, re) => (typeof v === "string" && re.test(v) ? v : null);
  return {
    frontendSha: pick(env.CONTAOS_FRONTEND_SHA, SHA40),
    backendSha: F3_BACKEND_SHA,
    harnessSha: pick(env.CONTAOS_HARNESS_SHA, SHA40),
    deploymentId: pick(env.CONTAOS_DEPLOYMENT_ID, DPL),
    workflowRunId: pick(env.GITHUB_RUN_ID, DIGITS),
  };
}

/** Relatório BLOCKED: todo caso não executado fica BLOCKED, nunca PASS. */
export function blockedF3Report({ code, catalogue, provenance }) {
  if (typeof code !== "string" || !CODE.test(code)) fail("F3_REPORT");
  const prov = provenance ?? f3ProvenanceFromEnv({});
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
    intents: { priorConfirmed: 0, sent: 0, confirmed: 0, uncertain: 0, rejected: 0 },
    isolation: { organizationF3: null, created: [], e87Before: {}, e87After: {} },
    summary: f3Summary(cases),
    cases,
  };
}

/** Grava F3_REPORT.json, a cópia do catálogo e SHA256SUMS; relatório inválido nunca é gravado. */
export async function writeF3Artifacts(dir, report, catalogue, casesRaw) {
  validateF3Report(report, catalogue);
  if (catalogue !== null && sha256(casesRaw) !== F3_CASES_SHA256) fail("F3_CASES_HASH");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
  const files = [["F3_REPORT.json", JSON.stringify(report, null, 2) + "\n"]];
  if (catalogue !== null) files.push(["F3_CASES.json", casesRaw]);
  files.sort(([a], [b]) => a.localeCompare(b));
  for (const [name, body] of files) await writeFile(join(dir, name), body, { flag: "w" });
  const sums = files.map(([name, body]) => sha256(body) + "  " + name + "\n").join("");
  await writeFile(join(dir, "SHA256SUMS"), sums, { flag: "w" });
  return true;
}

/**
 * Livro de intenções da Fase 3. Só o MASTER muta, só na organização F3, só pelos produtores
 * mutantes. Cada requestId é selado uma vez; intenção incerta só é reenviada depois de readback
 * que prove ausência, e cada envio (inclusive duplicidade rejeitada) conta no orçamento.
 */
export function createF3IntentBook({ organizationF3, priorConfirmed = 0 } = {}) {
  if (!isUuid(organizationF3) || organizationF3 === F3_E87_ORG) fail("F3_FOREIGN_ORG");
  assertF3Budget({ priorConfirmed, newIntents: 0 });
  const intents = new Map(),
    created = [];
  let sent = 0;
  const get = (id) => intents.get(id) ?? fail("F3_INTENT_UNKNOWN");
  const send = () => {
    assertF3Budget({ priorConfirmed, newIntents: sent + 1 });
    sent += 1;
  };
  const record = (entityId, organizationId) => {
    if (organizationId !== organizationF3) fail("F3_FOREIGN_ORG");
    if (!isUuid(entityId)) fail("F3_INTENT_ENTITY");
    created.push({ id: entityId, organizationId });
  };
  return Object.freeze({
    seal({ requestId, producerOrder, actor, organizationId, duplicateOf = null }) {
      if (actor !== "master") fail("F3_SECOND_USER_MUTATION");
      if (!F3_MUTATING_ORDERS.includes(producerOrder)) fail("F3_INTENT_PRODUCER");
      if (!isUuid(requestId) || (duplicateOf !== null && !isUuid(duplicateOf)))
        fail("F3_INTENT_ID");
      if (organizationId !== organizationF3) fail("F3_FOREIGN_ORG");
      if (intents.has(requestId)) fail("F3_INTENT_REPLAY");
      send();
      intents.set(requestId, { state: "sealed", producerOrder, duplicateOf, resent: false });
    },
    confirm(requestId, { entityId, organizationId }) {
      const i = get(requestId);
      if (i.state !== "sealed") fail("F3_INTENT_STATE");
      record(entityId, organizationId);
      i.state = "confirmed";
    },
    rejected(requestId) {
      const i = get(requestId);
      if (i.state !== "sealed") fail("F3_INTENT_STATE");
      i.state = "rejected";
    },
    uncertain(requestId) {
      const i = get(requestId);
      if (i.state !== "sealed") fail("F3_INTENT_STATE");
      i.state = "uncertain";
    },
    reconcile(requestId, { found, entityId, organizationId }) {
      const i = get(requestId);
      if (i.state !== "uncertain" || typeof found !== "boolean") fail("F3_INTENT_STATE");
      if (found) {
        record(entityId, organizationId);
        i.state = "confirmed";
      } else i.state = "absent";
    },
    resend(requestId) {
      const i = get(requestId);
      if (i.state !== "absent" || i.resent) fail("F3_UNCERTAIN_RESEND");
      send();
      i.resent = true;
      i.state = "sealed";
    },
    state: (requestId) => get(requestId).state,
    created: () => created.map((c) => ({ ...c })),
    summary() {
      const states = [...intents.values()].map((i) => i.state);
      const count = (s) => states.filter((x) => x === s).length;
      return {
        priorConfirmed,
        sent,
        confirmed: count("confirmed"),
        uncertain: count("uncertain") + count("absent"),
        rejected: count("rejected"),
      };
    },
  });
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
  if (!F3_SCREEN_ACCESS[screen]) fail("F3_SCREEN_ACCESS");
  const code = "F3_ACCESS_OBSERVATION";
  strictPlain(observation, ["denialToken", "content", "rpc"], code);
  const { content, rpc } = observation;
  let token = observation.denialToken;
  if (typeof content !== "boolean" || (token !== null && typeof token !== "string")) fail(code);
  if (F3_PARTIAL_DENIALS[screen] !== undefined && token === F3_PARTIAL_DENIALS[screen])
    token = null;
  if (screen === "V123") {
    if (rpc === null || typeof rpc !== "object" || isProxy(rpc)) return "ERROR";
    strictPlain(rpc, ["name", "status", "body"], code);
    if (rpc.name !== F3_V123_RPC || rpc.status !== 200 || typeof rpc.body !== "boolean")
      return "ERROR";
    if (rpc.body === false) return token === F3_DENIAL_TOKENS.V123 && !content ? "DENY" : "ERROR";
    return token === null && content ? "ALLOW" : "ERROR";
  }
  if (rpc !== null) fail(code);
  if (token !== null) return token === F3_DENIAL_TOKENS[screen] && !content ? "DENY" : "ERROR";
  return content ? "ALLOW" : "ERROR";
}

const LEDGER_ENTRY_KEYS = Object.freeze([
  "caseId",
  "status",
  ...PROVENANCE_KEYS,
  "artifactId",
  "sha256",
  "reviewId",
]);
/** Ledger append-only: só PASS verificados, um por caso do catálogo, com proveniência completa. */
export function validateF3Ledger(raw, catalogue) {
  const code = "F3_LEDGER";
  if (typeof raw !== "string" || raw.length > 1048576) fail(code);
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    fail(code);
  }
  try {
    strictPlain(
      value,
      ["schema", "scope", "matrixSha256", "casesSha256", "backendSha", "entries"],
      code,
    );
    plainArray(value.entries, code, F3_MATRIX.rows);
  } catch {
    fail(code);
  }
  if (value.schema !== F3_LEDGER_SCHEMA || value.scope !== INTEGRACAO_V1_FASE3_SCOPE.id) fail(code);
  if (value.matrixSha256 !== F3_MATRIX.sha256 || value.casesSha256 !== F3_CASES_SHA256) fail(code);
  if (value.backendSha !== F3_BACKEND_SHA) fail(code);
  const ids = new Set(catalogue.cases.map((c) => c.caseId)),
    seen = new Set();
  for (const e of value.entries) {
    try {
      strictPlain(e, LEDGER_ENTRY_KEYS, code);
      validateProvenance(Object.fromEntries(PROVENANCE_KEYS.map((k) => [k, e[k]])), false, code);
    } catch {
      fail(code);
    }
    if (e.status !== "PASS" || !ids.has(e.caseId) || seen.has(e.caseId)) fail(code);
    if (
      !DIGITS.test(e.artifactId ?? "") ||
      !SHA64.test(e.sha256 ?? "") ||
      !DIGITS.test(e.reviewId ?? "")
    )
      fail(code);
    seen.add(e.caseId);
  }
  return value;
}

export function validateF3LedgerExtension(previousRaw, raw, catalogue) {
  const prev = validateF3Ledger(previousRaw, catalogue),
    next = validateF3Ledger(raw, catalogue);
  if (next.entries.length < prev.entries.length) fail("F3_LEDGER");
  prev.entries.forEach((e, i) => {
    if (JSON.stringify(e) !== JSON.stringify(next.entries[i])) fail("F3_LEDGER");
  });
  return true;
}

/** Casos preservados: PASS com mesmo produto, backend e deployment, e harness ancestral. */
export function preservedF3Cases(ledger, provenance, isAncestor) {
  return ledger.entries
    .filter(
      (e) =>
        e.frontendSha === provenance.frontendSha &&
        e.backendSha === provenance.backendSha &&
        e.deploymentId === provenance.deploymentId &&
        isAncestor(e.harnessSha) === true,
    )
    .map((e) => e.caseId);
}

/**
 * Estrutura exigida do YAML (PLAN 7.4, itens a–d): pares sintéticos só nos passos dos executores,
 * o do 2º usuário só no executor F3, depois da barreira nativa e da revalidação por escopo.
 */
export function assertF3WorkflowStructure(yaml) {
  const ok = (cond) => {
    if (!cond) fail("F3_WORKFLOW");
  };
  ok(typeof yaml === "string" && yaml.length < 262144);
  const count = (s, n) => yaml.split(n).length - 1;
  ok(count(yaml, "\npermissions:\n  contents: read\njobs:\n") === 1);
  ok(count(yaml, "    environment: hml\n") === 1 && count(yaml, "environment:") === 1);
  for (const f of ["integracao-v1-fase3.mjs", "integracao-v1-fase3.test.mjs"])
    ok(yaml.includes("      - scripts/hml/" + f + "\n"));
  const protocol = yaml.slice(yaml.indexOf("\n  protocol:\n"), yaml.indexOf("\n  private:\n"));
  const line = (needle) => protocol.split("\n").find((l) => l.includes(needle)) ?? "";
  ok(line("node --test scripts/hml/").includes("scripts/hml/integracao-v1-fase3.test.mjs"));
  for (const tool of ["bunx eslint", "bunx prettier --check"])
    for (const f of ["integracao-v1-fase3.mjs", "integracao-v1-fase3.test.mjs"])
      ok(line(tool).includes("scripts/hml/" + f));
  const privateJob = yaml.slice(yaml.indexOf("\n  private:\n"));
  ok(yaml.indexOf("\n  private:\n") > 0);
  const header = privateJob.slice(0, privateJob.indexOf("    steps:"));
  ok(!header.includes("secrets."));
  const steps = privateJob.split("\n      - ").slice(1);
  const at = (needle) => {
    const found = steps.map((s, i) => [i, s]).filter(([, s]) => s.includes(needle));
    ok(found.length === 1);
    return found[0][0];
  };
  const guard = at("authenticated-visual-audit.mjs --native-guard"),
    revalidate = at("id: revalidate"),
    trilha = at("prepare-visual-fixtures.mjs --prepare-fixtures"),
    f3 = at("integracao-v1-fase3.mjs --run-f3");
  ok(guard < revalidate && revalidate < trilha && revalidate < f3);
  ok(steps[revalidate].includes("if: github.event_name == 'workflow_run'\n"));
  ok(
    steps[revalidate].includes(
      "run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate",
    ),
  );
  ok(steps[trilha].includes("if: steps.revalidate.outputs.scope == 'TRILHA_A'\n"));
  ok(steps[f3].includes("if: steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n"));
  const secret = (name) => "          " + name + ": ${{ secrets." + name + " }}\n";
  for (const name of ["CONTAOS_HML_SYNTHETIC_EMAIL", "CONTAOS_HML_SYNTHETIC_PASSWORD"]) {
    ok(steps[trilha].includes(secret(name)) && steps[f3].includes(secret(name)));
    ok(count(yaml, name) === 4);
  }
  for (const name of ["CONTAOS_HML_SYNTHETIC_2_EMAIL", "CONTAOS_HML_SYNTHETIC_2_PASSWORD"]) {
    ok(steps[f3].includes(secret(name)) && count(yaml, name) === 2);
  }
  ok(count(yaml, "CONTAOS_HML_SYNTHETIC_2_") === 4);
  ok(count(yaml, "secrets.") === 6);
  const withSecrets = steps.map((s, i) => [i, s]).filter(([, s]) => s.includes("secrets."));
  ok(JSON.stringify(withSecrets.map(([i]) => i)) === JSON.stringify([trilha, f3]));
  const gate = "if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n";
  const hashes = at("working-directory: artifacts/integracao-v1-fase3\n"),
    upload = at("path: artifacts/integracao-v1-fase3/\n");
  ok(hashes > f3 && upload > hashes);
  ok(steps[hashes].includes(gate) && steps[hashes].includes("run: sha256sum --check SHA256SUMS"));
  ok(steps[upload].includes(gate) && steps[upload].includes("if-no-files-found: error"));
  return true;
}

/** Contrato completo: estrutura e SHA-256 do YAML aprovado. */
export function assertF3WorkflowContract(yaml) {
  assertF3WorkflowStructure(yaml);
  if (sha256(yaml) !== F3_WORKFLOW_SHA256) fail("F3_WORKFLOW");
  return true;
}

export async function runCli(args = process.argv.slice(2), env = process.env) {
  if (!Array.isArray(args) || args.length !== 1 || args[0] !== "--run-f3") fail("F3_CLI_USAGE");
  if (env.GITHUB_EVENT_NAME !== "workflow_run") fail("F3_MAIN_ONLY");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const provenance = f3ProvenanceFromEnv(env);
  let catalogue = null,
    casesRaw = null;
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
    validateF3Ledger(ledgerRaw, catalogue);
    fail("F3_DRIVER_PENDING");
  } catch (error) {
    // Resultado parcial ou bloqueado também gera F3_REPORT.json e SHA256SUMS (BUILD-1, obrigação 1).
    const code = CODE.test(error?.code || "") ? error.code : "F3_FAILURE";
    const report = blockedF3Report({ code, catalogue, provenance });
    await writeF3Artifacts(join(root, F3_ARTIFACT_DIR), report, catalogue, casesRaw);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch((error) => {
    const code = /^[A-Z0-9_]{1,80}$/.test(error?.code || "") ? error.code : "F3_FAILURE";
    process.stderr.write(JSON.stringify({ state: "BLOCKED", code }) + "\n");
    process.exitCode = 1;
  });
}

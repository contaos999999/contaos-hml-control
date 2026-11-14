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
import { readFile, mkdir, writeFile } from "node:fs/promises";
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
// Núcleo único das intenções (revisão de causa raiz depois das revisões 5900926490, 5901072418 e
// 5901160351). Uma só máquina de estados decide toda transição; o livro do executor grava cada
// transição como evento, e o relatório e o ledger carregam esses eventos. Os validadores não
// reimplementam regras: reexecutam os eventos nesta mesma máquina e exigem que contadores,
// intenções, envios e inventário declarados sejam exatamente o resultado do replay.
// ---------------------------------------------------------------------------------------------
const EVENT_KEYS = Object.freeze([
  "op",
  "requestId",
  "producerOrder",
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
]);
export const F3_MAX_EVENTS_PER_RUN = 200;
const INTENT_KEYS = Object.freeze([
  "requestId",
  "producerOrder",
  "duplicateOf",
  "outcome",
  "prior",
  "entityId",
  "sends",
]);
const INTENTS_KEYS = Object.freeze([
  "priorSent",
  "sent",
  "confirmed",
  "uncertain",
  "rejected",
  "requests",
  "events",
]);

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
const kindFor = (i) =>
  i.producerOrder !== 2
    ? "registro"
    : i.duplicateOf === null
      ? "organizacao"
      : "organizacao_duplicada";

function validateEvent(e) {
  const code = "F3_INTENT_EVENT";
  strictPlain(e, EVENT_KEYS, code);
  if (!enumOf(e.op, EVENT_OPS) || !isUuid(e.requestId)) fail(code);
  const seal = e.op === "seal",
    entity = e.op === "confirm" || e.op === "found";
  if (seal) {
    if (!Number.isSafeInteger(e.producerOrder)) fail(code);
    if (e.duplicateOf !== null && !isUuid(e.duplicateOf)) fail(code);
  } else if (e.producerOrder !== null || e.duplicateOf !== null) fail(code);
  if (entity) {
    if (!isUuid(e.entityId) || !isUuid(e.organizationId)) fail(code);
  } else if (e.entityId !== null || e.organizationId !== null) fail(code);
}

/** Aplica um evento ao estado. É a única definição das transições válidas. */
function applyEvent(st, run, e) {
  validateEvent(e);
  const send = () => {
    assertF3Budget({ priorSent: st.priorSent, newIntents: run.sent + 1 });
    run.sent += 1;
  };
  if (e.op === "seal") {
    if (!F3_MUTATING_ORDERS.includes(e.producerOrder)) fail("F3_INTENT_PRODUCER");
    if (st.intents.has(e.requestId)) fail("F3_INTENT_REPLAY");
    if (e.duplicateOf !== null) {
      const base = st.intents.get(e.duplicateOf);
      if (!base || base.state !== "confirmed" || base.duplicateOf !== null)
        fail("F3_INTENT_DUPLICATE_OF");
      if (base.producerOrder !== e.producerOrder) fail("F3_INTENT_DUPLICATE_OF");
    } else if (e.producerOrder === 2) {
      // Uma única criação da organização F3, antes de qualquer outra mutação. Só uma tentativa
      // rejeitada (nada criado) libera nova tentativa; pendente exige readback antes.
      if (st.organizationF3 !== null) fail("F3_INTENT_PRODUCER");
      const open = (i) => i.producerOrder === 2 && i.duplicateOf === null && i.state !== "rejected";
      if ([...st.intents.values()].some(open)) fail("F3_INTENT_PRODUCER");
    } else if (st.organizationF3 === null) fail("F3_FOREIGN_ORG");
    send();
    st.intents.set(e.requestId, {
      state: "sealed",
      producerOrder: e.producerOrder,
      duplicateOf: e.duplicateOf,
      entityId: null,
      resent: false,
      prior: false,
      sends: 1,
    });
    return;
  }
  const i = st.intents.get(e.requestId);
  if (!i) fail("F3_INTENT_UNKNOWN");
  const from = {
    confirm: "sealed",
    reject: "sealed",
    uncertain: "sealed",
    found: "uncertain",
    absent: "uncertain",
    resend: "absent",
  }[e.op];
  if (i.state !== from) fail(e.op === "resend" ? "F3_UNCERTAIN_RESEND" : "F3_INTENT_STATE");
  if (e.op === "resend") {
    if (i.resent) fail("F3_UNCERTAIN_RESEND");
    send();
    i.resent = true;
    i.sends += 1;
    i.state = "sealed";
  } else if (e.op === "confirm" || e.op === "found") {
    const kind = kindFor(i);
    if (e.entityId === F3_E87_ORG || e.organizationId === F3_E87_ORG) fail("F3_FOREIGN_ORG");
    if (st.entities.has(e.entityId)) fail("F3_INTENT_ENTITY");
    if (kind === "registro") {
      if (e.organizationId !== st.organizationF3) fail("F3_FOREIGN_ORG");
    } else {
      // A organização é a própria entidade; a duplicada é outra organização, inventariada.
      if (e.organizationId !== e.entityId) fail("F3_INTENT_ENTITY");
      if (kind === "organizacao_duplicada" && e.entityId === st.organizationF3)
        fail("F3_INTENT_ENTITY");
    }
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
  } else i.state = { reject: "rejected", uncertain: "uncertain", absent: "absent" }[e.op];
}

function summarize(st, run) {
  const requests = [...st.intents].map(([requestId, i]) => {
    const outcome =
      i.state === "confirmed" ? "confirmed" : i.state === "rejected" ? "rejected" : "pending";
    return {
      requestId,
      producerOrder: i.producerOrder,
      duplicateOf: i.duplicateOf,
      outcome,
      prior: i.prior,
      entityId: outcome === "confirmed" ? i.entityId : null,
      sends: i.sends,
    };
  });
  const count = (o) => requests.filter((q) => q.outcome === o).length;
  return {
    priorSent: st.priorSent,
    sent: run.sent,
    confirmed: count("confirmed"),
    uncertain: count("pending"),
    rejected: count("rejected"),
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

// Ledgers validados e o estado derivado do replay de todas as suas execuções.
const LEDGER_STATES = new WeakMap();
function ledgerState(ledger) {
  const st = ledger && typeof ledger === "object" ? LEDGER_STATES.get(ledger) : undefined;
  if (!st) fail("F3_LEDGER_REQUIRED");
  return st;
}
const deepFreeze = (v) => {
  if (v && typeof v === "object" && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v)) deepFreeze(v[k]);
  }
  return v;
};

/**
 * Livro de intenções da Fase 3, sobre o ledger validado (validateF3Ledger). Só o MASTER muta.
 * Antes de existir a organização F3, só a sua criação (produtor 2) pode ser selada, com
 * organizationId null; depois, toda intenção exige organizationId igual à organização F3. Cada
 * transição passa por applyEvent e vira evento; o resumo e o inventário são derivados.
 */
export function createF3IntentBook(options = {}) {
  if (Object.keys(options).some((k) => k !== "ledger")) fail("F3_INTENT_OPTIONS");
  const st = cloneState(ledgerState(options.ledger)),
    run = { sent: 0, events: [] };
  const apply = (e) => {
    applyEvent(st, run, e);
    run.events.push(Object.freeze({ ...e }));
  };
  const ev = (op, requestId, extra = {}) => ({
    op,
    requestId,
    producerOrder: null,
    duplicateOf: null,
    entityId: null,
    organizationId: null,
    ...extra,
  });
  return Object.freeze({
    seal({ requestId, producerOrder, actor, organizationId, duplicateOf = null }) {
      if (actor !== "master") fail("F3_SECOND_USER_MUTATION");
      if (!Number.isSafeInteger(producerOrder)) fail("F3_INTENT_PRODUCER");
      if (!isUuid(requestId) || (duplicateOf !== null && !isUuid(duplicateOf)))
        fail("F3_INTENT_ID");
      if (organizationId !== st.organizationF3) fail("F3_FOREIGN_ORG");
      apply(ev("seal", requestId, { producerOrder, duplicateOf }));
    },
    /** Confirma a criação; numa tentativa de duplicidade, sinaliza duplicateAccepted (FAIL). */
    confirm(requestId, { entityId, organizationId }) {
      apply(ev("confirm", requestId, { entityId, organizationId }));
      return { duplicateAccepted: st.intents.get(requestId).duplicateOf !== null };
    },
    rejected: (requestId) => apply(ev("reject", requestId)),
    uncertain: (requestId) => apply(ev("uncertain", requestId)),
    reconcile(requestId, { found, entityId, organizationId }) {
      if (typeof found !== "boolean") fail("F3_INTENT_STATE");
      apply(found ? ev("found", requestId, { entityId, organizationId }) : ev("absent", requestId));
    },
    resend: (requestId) => apply(ev("resend", requestId)),
    state: (requestId) => (st.intents.get(requestId) ?? fail("F3_INTENT_UNKNOWN")).state,
    organizationF3: () => st.organizationF3,
    created: () => st.created.map((c) => ({ ...c })),
    summary: () => summarize(st, run),
  });
}

/** Intenções do relatório: os eventos desta execução, reexecutados sobre o ledger. */
function validateIntents(n, code, ledger) {
  strictPlain(n, INTENTS_KEYS, code);
  plainArray(n.requests, code, F3_BUDGET.total);
  for (const q of n.requests) strictPlain(q, INTENT_KEYS, code);
  let replay;
  try {
    replay = replayRun(ledgerState(ledger), n.events);
  } catch (error) {
    if (error?.code === "F3_LEDGER_REQUIRED") throw error;
    fail(code);
  }
  const derived = summarize(replay.st, replay.run);
  if (JSON.stringify(n) !== JSON.stringify(derived)) fail(code);
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
  const byRequest = new Map();
  for (const e of state.created) byRequest.set(e.requestId, [e.id]);
  return byRequest;
}

function validateReceipt(r, c, report, policy) {
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
 * Cruza recibos, intenções e inventário (revisão 5900926490, B1, I2 e M1). Os casos de um mesmo
 * produtor compartilham requestId, entidades e duplicidade; requestId é único entre produtores;
 * toda entidade citada foi criada pela intenção confirmada do próprio recibo; o resultado de
 * duplicidade bate com as tentativas registradas no livro.
 */
function crossCheck(report, byId, createdByRequest) {
  const code = "F3_REPORT";
  const groups = new Map();
  for (const r of report.cases) {
    const g = groups.get(r.producerOrder) ?? [];
    g.push(r);
    groups.set(r.producerOrder, g);
  }
  const seenRequests = new Set();
  for (const [order, group] of groups) {
    const head = group[0];
    const shared = (r) => JSON.stringify([r.requestId, r.entityIds, r.duplicate, r.cleanupStatus]);
    if (group.some((r) => shared(r) !== shared(head))) fail(code);
    const duplicates = [...byId.values()].filter(
      (q) => q.producerOrder === order && q.duplicateOf !== null,
    );
    if (head.requestId === null) {
      // Sem intenção associada, o recibo não afirma nada sobre duplicidade: só NOT_RUN, ou
      // DUPLICATE_NOT_DEFINED sem nenhuma tentativa registrada no livro.
      if (head.entityIds.length) fail(code);
      if (head.duplicate === "DUPLICATE_NOT_DEFINED" && duplicates.length) fail(code);
      if (!["NOT_RUN", "DUPLICATE_NOT_DEFINED"].includes(head.duplicate)) fail(code);
      continue;
    }
    if (seenRequests.has(head.requestId)) fail(code);
    seenRequests.add(head.requestId);
    const q = byId.get(head.requestId);
    if (!q || q.producerOrder !== order || q.duplicateOf !== null) fail(code);
    const entities = createdByRequest.get(head.requestId) ?? [];
    if (head.entityIds.some((id) => !entities.includes(id))) fail("F3_ISOLATION");
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

/**
 * Valida o relatório: só IDs, enums, contadores e booleanos (PLAN 7.5). Qualquer string fora do
 * formato fechado do campo (texto livre, e-mail, JWT, HTML) falha. O status de cada recibo e o
 * resumo são recalculados, e recibos, intenções e inventário são cruzados, impedindo falso PASS.
 */
export function validateF3Report(report, catalogue, { policy = F3_DUPLICATE_POLICY, ledger } = {}) {
  const code = "F3_REPORT";
  validateF3DuplicatePolicy(policy);
  ledgerState(ledger);
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
  // Intenções e inventário são o replay dos eventos desta execução sobre o ledger.
  const state = validateIntents(report.intents, code, ledger);
  const createdByRequest = validateIsolation(report.isolation, state);
  const byId = new Map(report.intents.requests.map((q) => [q.requestId, q]));
  plainArray(report.cases, code, F3_MATRIX.rows);
  if (catalogue === null) {
    if (!blocked || report.cases.length !== 0) fail(code);
  } else {
    if (report.cases.length !== catalogue.cases.length) fail(code);
    report.cases.forEach((r, i) => validateReceipt(r, catalogue.cases[i], report, policy));
    crossCheck(report, byId, createdByRequest);
  }
  strictPlain(report.summary, F3_CASE_STATUS, code);
  if (JSON.stringify(report.summary) !== JSON.stringify(f3Summary(report.cases))) fail(code);
  return true;
}

/** Gate quantitativo da seção 5 do PLAN sobre um relatório já validado. */
export function f3Gate(report, catalogue, options = {}) {
  // Valida e decide sobre o mesmo objeto; getter, proxy e toJSON já são recusados na validação.
  validateF3Report(report, catalogue, options);
  const g = report.globals,
    iso = report.isolation,
    s = report.summary,
    n = report.intents;
  const counters = (c) => JSON.stringify(Object.keys(c).sort());
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
    n.uncertain === 0 &&
    n.requests.every((q) => q.outcome !== "pending") &&
    iso.organizationF3 !== null &&
    iso.created.filter((e) => e.kind === "organizacao").length === 1 &&
    counters(iso.e87Before) === JSON.stringify([...F3_E87_COUNTER_SCREENS].sort()) &&
    JSON.stringify(iso.e87Before, Object.keys(iso.e87Before).sort()) ===
      JSON.stringify(iso.e87After, Object.keys(iso.e87Before).sort());
  return ok ? "PASS" : "FAIL";
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

/** Relatório BLOCKED: todo caso não executado fica BLOCKED, nunca PASS. */
export function blockedF3Report({ code, catalogue, provenance, ledger }) {
  if (typeof code !== "string" || !CODE.test(code)) fail("F3_REPORT");
  // O bloqueado carrega o estado do ledger sem nenhum evento novo, sem exceção (revisão, N-3).
  const state = ledgerState(ledger);
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
    intents: summarize(state, { sent: 0, events: [] }),
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
 * Grava F3_REPORT.json, a cópia do catálogo e SHA256SUMS. O relatório é serializado uma vez, e o
 * que se valida é o resultado dessa serialização, que é exatamente o que vai para o disco: getter
 * ou proxy não conseguem mostrar um valor ao validador e outro ao arquivo (revisão, E).
 * Relatório inválido nunca é gravado.
 */
export async function writeF3Artifacts(dir, report, catalogue, casesRaw, options = {}) {
  validateF3Report(report, catalogue, options);
  let snapshot;
  try {
    snapshot = JSON.parse(JSON.stringify(report));
  } catch {
    fail("F3_REPORT");
  }
  validateF3Report(snapshot, catalogue, options);
  if (catalogue !== null && sha256(casesRaw) !== F3_CASES_SHA256) fail("F3_CASES_HASH");
  await mkdir(dir, { recursive: true });
  const files = [["F3_REPORT.json", JSON.stringify(snapshot, null, 2) + "\n"]];
  if (catalogue !== null) files.push(["F3_CASES.json", casesRaw]);
  files.sort(([a], [b]) => a.localeCompare(b));
  for (const [name, body] of files) await writeFile(join(dir, name), body, { flag: "w" });
  const sums = files.map(([name, body]) => sha256(body) + "  " + name + "\n").join("");
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
  "artifactId",
  "sha256",
  "reviewId",
]);
const LEDGER_RUN_KEYS = Object.freeze(["workflowRunId", "harnessSha", "events"]);
/**
 * Ledger append-only: PASS verificados (um por caso, com proveniência completa) e os eventos do
 * livro de cada execução. O estado acumulado sai do replay dos eventos, nunca de contadores
 * declarados.
 */
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
      ["schema", "scope", "matrixSha256", "casesSha256", "backendSha", "runs", "entries"],
      code,
    );
    plainArray(value.entries, code, F3_MATRIX.rows);
    plainArray(value.runs, code, 16);
  } catch {
    fail(code);
  }
  if (value.schema !== F3_LEDGER_SCHEMA || value.scope !== INTEGRACAO_V1_FASE3_SCOPE.id) fail(code);
  if (value.matrixSha256 !== F3_MATRIX.sha256 || value.casesSha256 !== F3_CASES_SHA256) fail(code);
  if (value.backendSha !== F3_BACKEND_SHA) fail(code);
  // As execuções são reexecutadas em ordem na mesma máquina de estados do livro: orçamento
  // acumulado, reserva de requestId, organização única, entidades e reconciliações vêm do replay.
  const runs = new Map();
  let state = emptyState();
  for (const run of value.runs) {
    try {
      strictPlain(run, LEDGER_RUN_KEYS, code);
    } catch {
      fail(code);
    }
    if (!DIGITS.test(run.workflowRunId ?? "") || runs.has(run.workflowRunId)) fail(code);
    if (!SHA40.test(run.harnessSha ?? "")) fail(code);
    try {
      const replay = replayRun(state, run.events);
      state = closeRun(replay.st, replay.run);
    } catch {
      fail(code);
    }
    runs.set(run.workflowRunId, run);
  }
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
    const run = runs.get(e.workflowRunId);
    if (!run || run.harnessSha !== e.harnessSha) fail(code);
    if (
      !DIGITS.test(e.artifactId ?? "") ||
      !SHA64.test(e.sha256 ?? "") ||
      !DIGITS.test(e.reviewId ?? "")
    )
      fail(code);
    seen.add(e.caseId);
  }
  deepFreeze(value);
  LEDGER_STATES.set(value, state);
  return value;
}

/** Ledger vazio validado, usado quando o ledger publicado não pôde ser lido. */
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
    { cases: [] },
  );
}

/** Resumo do estado derivado de um ledger validado (organização, envios e intenções). */
export function f3LedgerState(ledger) {
  const { requests, priorSent } = summarize(ledgerState(ledger), { sent: 0, events: [] });
  return { organizationF3: ledgerState(ledger).organizationF3, priorSent, requests };
}

export function validateF3LedgerExtension(previousRaw, raw, catalogue, pinned = F3_LEDGER_SHA256) {
  // O anterior é sempre o ledger fixado no código; a extensão só acrescenta.
  if (sha256(previousRaw) !== pinned) fail("F3_LEDGER");
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

/**
 * Casos preservados: PASS com mesmo produto, backend e deployment, e com o mesmo harness ou uma
 * equivalência revisada em F3_HARNESS_EQUIVALENCES (plano mestre 16.3). Ancestralidade não basta.
 */
export function preservedF3Cases(ledger, provenance, equivalences = F3_HARNESS_EQUIVALENCES) {
  const equivalent = (from) =>
    from === provenance.harnessSha ||
    equivalences.some(
      (e) => e.from === from && e.to === provenance.harnessSha && DIGITS.test(e.reviewId ?? ""),
    );
  return ledger.entries
    .filter(
      (e) =>
        e.frontendSha === provenance.frontendSha &&
        e.backendSha === provenance.backendSha &&
        e.deploymentId === provenance.deploymentId &&
        equivalent(e.harnessSha),
    )
    .map((e) => e.caseId);
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

export async function runCli(args = process.argv.slice(2), env = process.env) {
  if (!Array.isArray(args) || args.length !== 1 || args[0] !== "--run-f3") fail("F3_CLI_USAGE");
  if (env.GITHUB_EVENT_NAME !== "workflow_run") fail("F3_MAIN_ONLY");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const provenance = f3ProvenanceFromEnv(env);
  let catalogue = null,
    casesRaw = null,
    ledger = emptyF3Ledger();
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
    fail("F3_DRIVER_PENDING");
  } catch (error) {
    // Resultado parcial ou bloqueado também gera F3_REPORT.json e SHA256SUMS (BUILD-1, obrigação 1).
    const code = CODE.test(error?.code || "") ? error.code : "F3_FAILURE";
    const report = blockedF3Report({ code, catalogue, provenance, ledger });
    await writeF3Artifacts(join(root, F3_ARTIFACT_DIR), report, catalogue, casesRaw, { ledger });
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

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
import { collectF3CodeEvidence } from "./integracao-v1-fase3-code-executor.mjs";
import {
  API_ORIGIN,
  HML_ORIGIN,
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
export const F3_BUDGET = Object.freeze({ total: 60, perRun: 40, planned: 39, minutes: 45 });
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
// Espelho normativo do catálogo real de src/lib/administracao/rbacRpc.ts;
// o autoteste de fonte rejeita drift do frontend. MASTER deve expor os 48 pares.
export const F3_RBAC_MASTER_CATALOG = Object.freeze({
  organizacoes: ["consultar", "administrar"],
  usuarios: ["consultar", "administrar"],
  auditoria: ["consultar"],
  contratantes: ["consultar", "criar", "editar"],
  contratos: ["consultar", "criar", "editar"],
  orcamentos: ["consultar", "criar", "editar", "aprovar"],
  normativos: ["consultar", "criar", "editar", "aprovar"],
  listas: ["consultar", "criar", "editar"],
  documentos_contrato: ["consultar", "criar", "editar"],
  documentos_competencia: ["consultar", "criar", "editar"],
  competencias: ["consultar", "criar"],
  analises: ["consultar", "criar", "processar", "editar"],
  pareceres: ["consultar", "criar", "aprovar"],
  apresentacoes: ["consultar", "aprovar", "apresentar"],
  historico: ["consultar", "criar", "editar", "processar"],
  arquivos: ["consultar", "criar", "editar"],
  dashboard: ["consultar"],
});
export const F3_RBAC_MASTER_ALLOWED = Object.freeze(
  Object.entries(F3_RBAC_MASTER_CATALOG)
    .flatMap(([recurso, acoes]) => acoes.map((acao) => recurso + "/" + acao))
    .sort(),
);

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
// por produtor), prerequisito (no máximo 11 na fase, PLAN §12.1) e duplicidade (no máximo uma por
// principal, PLAN 4.3). Uma intenção ausente por readback pode ser abandonada; abandonada não
// conta como pendente, mas precisa ser relida na execução que fecha a matriz. Cada passo que sai
// gera um vínculo (bind) no livro: SHA-256 do corpo canônico, SHA-256 de cada valor gerado em
// tempo de execução (chave da UI, ID capturado) e as referências usadas (inventário e versão
// observada). As regras de origem e a do reenvio (vínculo idêntico ao original) são do livro.
// ---------------------------------------------------------------------------------------------
export const F3_INTENT_KINDS = Object.freeze(["principal", "prerequisito", "duplicidade"]);
export const F3_MAX_PREREQUISITES = 11;
// Teto provado por intenção e execução: selar, F3_MAX_STEPS vínculos, incerto, ausente, reenviar,
// F3_MAX_STEPS vínculos, incerto, ausente, abandonar e encontrada; no máximo 60 intenções na fase.
export const F3_MAX_STEPS = 4;
export const F3_MAX_EVENTS_PER_RUN = (8 + 2 * F3_MAX_STEPS) * 60;
const BIND_KEYS = Object.freeze(["op", "requestId", "step", "bodySha256", "slots", "refs"]);
const F3_MAX_BIND_ITEMS = 16;
const sha256hex = (v) => createHash("sha256").update(v).digest("hex");
const EVENT_KEYS = Object.freeze([
  "op",
  "requestId",
  "producerOrder",
  "kind",
  "duplicateOf",
  "entityId",
  "organizationId",
]);
const ACTION_EVENT_KEYS = Object.freeze([...EVENT_KEYS, "action"]);
const F3_ACTION_RE = /^[a-z][a-z0-9_]{0,40}$/;
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
  "binds",
]);
const ACTION_INTENT_KEYS = Object.freeze([...INTENT_KEYS, "action"]);
const INTENTS_KEYS = Object.freeze([
  "priorSent",
  "sent",
  "confirmed",
  "uncertain",
  "rejected",
  "abandoned",
  "requests",
  "events",
  "eventsSha256",
]);
// PLAN §12.5 e F3_FLUXOS_PRODUTORES §3: após incerteza, estas ações só admitem releitura.
const READBACK_ONLY_ORDERS = new Set([2, 5, 6, 7, 14, 16, 18, 20]);
export const f3AllowsResend = ({ producerOrder, kind }) =>
  kind === "prerequisito"
    ? producerOrder !== 18 && producerOrder !== 19
    : !READBACK_ONLY_ORDERS.has(producerOrder);

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
    // binds é substituído, nunca alterado no lugar: a cópia rasa basta.
    intents: new Map([...st.intents].map(([id, i]) => [id, { ...i }])),
    created: st.created.map((c) => ({ ...c })),
    entities: new Set(st.entities),
  };
}

function validateEvent(e) {
  const code = "F3_INTENT_EVENT";
  if (e.op === "bind") {
    const sha = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
    strictPlain(e, BIND_KEYS, code);
    if (!isUuid(e.requestId) || !sha(e.bodySha256)) fail(code);
    if (!Number.isSafeInteger(e.step) || e.step < 0 || e.step >= F3_MAX_STEPS) fail(code);
    plainArray(e.slots, code, F3_MAX_BIND_ITEMS);
    if (!e.slots.every(sha)) fail(code);
    plainArray(e.refs, code, F3_MAX_BIND_ITEMS);
    for (const ref of e.refs) {
      strictPlain(ref, ["field", "entityId", "version"], code);
      if (typeof ref.field !== "string" || !/^[a-z_]{1,60}$/.test(ref.field)) fail(code);
      if (!isUuid(ref.entityId)) fail(code);
      if (ref.version !== null && (!Number.isSafeInteger(ref.version) || ref.version < 1))
        fail(code);
    }
    return;
  }
  const action = Object.hasOwn(e, "action");
  strictPlain(e, action ? ACTION_EVENT_KEYS : EVENT_KEYS, code);
  if (!enumOf(e.op, EVENT_OPS) || !isUuid(e.requestId)) fail(code);
  if (
    action &&
    (e.op !== "seal" ||
      e.kind !== "prerequisito" ||
      typeof e.action !== "string" ||
      !F3_ACTION_RE.test(e.action))
  )
    fail(code);
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
    const declared = F3_MUTATION_FLOWS[e.producerOrder]?.prerequisito;
    if (declared && !Array.isArray(declared)) {
      if (!Object.hasOwn(declared, e.action)) fail("F3_PREREQUISITE_ACTION");
      if (same.some((i) => i.kind === "prerequisito" && i.action === e.action && OPEN(i)))
        fail("F3_INTENT_PREREQUISITES");
    } else if (e.action !== undefined) fail("F3_PREREQUISITE_ACTION");
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

// V103 e V106 editam o registro criado por V102 e V105: o mesmo UUID é um vínculo
// legítimo, não uma segunda criação. A exceção é restrita ao produtor e à identidade
// principal original; reuso em qualquer outro contexto continua sendo duplicidade.
export const F3_UPDATE_IDENTITY_SOURCE = Object.freeze({ 6: 5, 8: 7 });

function authorizedF3IdentityReuse(state, event, intent) {
  if (event.organizationId !== state.organizationF3) return false;
  // Aprovar a versão normativa não cria outra versão: é uma transição do mesmo UUID.
  const approval =
    intent.producerOrder === 10 && intent.kind === "prerequisito" && intent.action === "aprovacao";
  const opinionApproval = intent.producerOrder === 18 && intent.kind === "principal";
  const proposalPublication = intent.producerOrder === 9 && intent.kind === "principal";
  const listTransition =
    intent.producerOrder === 11 &&
    intent.kind === "prerequisito" &&
    ["item", "publicacao"].includes(intent.action);
  const docVersion = intent.producerOrder === 13 && intent.kind === "principal";
  const source = F3_UPDATE_IDENTITY_SOURCE[intent.producerOrder];
  if (
    !approval &&
    !opinionApproval &&
    !proposalPublication &&
    !listTransition &&
    !docVersion &&
    (!source || intent.kind !== "principal")
  )
    return false;
  return state.created.some((entry) => {
    const maker = state.intents.get(entry.requestId);
    return (
      entry.id === event.entityId &&
      entry.organizationId === event.organizationId &&
      entry.kind === "registro" &&
      (approval
        ? maker?.producerOrder === 10 && maker.kind === "prerequisito" && maker.action === "versao"
        : opinionApproval
          ? maker?.producerOrder === 18 &&
            maker.kind === "prerequisito" &&
            maker.action === "parecer"
          : proposalPublication
            ? maker?.producerOrder === 9 &&
              maker.kind === "prerequisito" &&
              maker.action === "versao"
            : listTransition
              ? maker?.producerOrder === 11 && maker.kind === "principal"
              : docVersion
                ? maker?.producerOrder === 12 && maker.kind === "principal"
                : maker?.producerOrder === source && maker.kind === "principal")
    );
  });
}

/**
 * Registra a entidade devolvida pelo produto. O que o produto devolve é fato observado e sempre
 * entra no inventário com o tipo correspondente; só a violação de protocolo do driver (organização
 * criada com organizationId diferente do próprio ID) é recusada.
 */
function recordEntity(st, e, i) {
  if (i.producerOrder === 2 && e.organizationId !== e.entityId) fail("F3_INTENT_ENTITY");
  let kind;
  if (st.entities.has(e.entityId))
    kind = authorizedF3IdentityReuse(st, e, i) ? "registro" : "entidade_repetida";
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
      ...(e.action !== undefined ? { action: e.action } : {}),
      duplicateOf: e.duplicateOf,
      entityId: null,
      resent: false,
      prior: false,
      sends: 1,
      rechecked: false,
      binds: [],
      sendBinds: 0,
    });
    return;
  }
  const i = st.intents.get(e.requestId);
  if (!i) fail("F3_INTENT_UNKNOWN");
  if (e.op === "bind") return bindIntent(st, e, i);
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
  // Desfecho do envio corrente só com vínculo: sem ele, o evento bind seria removível sem
  // rastro. Confirmação só com todos os passos do fluxo declarado.
  if (["confirm", "reject", "uncertain"].includes(e.op)) {
    const steps = stepsOf(i);
    if (!i.sendBinds || (e.op === "confirm" && steps && i.sendBinds !== steps.length))
      fail("F3_INTENT_BIND");
  }
  // Readback não transforma envio parcial em confirmação. O histórico durável
  // continua válido se o contador da tentativa foi zerado por um reenvio.
  if (e.op === "found") {
    const steps = stepsOf(i);
    if (!i.binds.length || (steps && i.binds.length !== steps.length)) fail("F3_INTENT_BIND");
  }
  // Abandono trazido de execução ANTERIOR exige uma só releitura por novo run.
  // A intenção abandonada dentro do run atual ainda admite materialização tardia, sem
  // suprimir o evento absent que precedeu o abandon e é necessário ao replay.
  if ((e.op === "absent" || e.op === "found") && i.state === "abandoned" && i.prior && i.rechecked)
    fail("F3_INTENT_STATE");
  if (e.op === "found" || e.op === "absent") i.rechecked = true;
  if (e.op === "resend") {
    // Reenvio só de ação com chave, uma vez. A intenção sempre tem vínculo registrado (o
    // desfecho incerto o exige), e os vínculos do reenvio têm de ser idênticos aos originais.
    if (i.resent || !f3AllowsResend(i)) fail("F3_UNCERTAIN_RESEND");
    send();
    i.resent = true;
    i.sends += 1;
    i.sendBinds = 0;
    i.state = "sealed";
  } else if (e.op === "confirm" || e.op === "found") recordEntity(st, e, i);
  else if (e.op === "absent") i.state = i.state === "abandoned" ? "abandoned" : "absent";
  else i.state = { reject: "rejected", uncertain: "uncertain", abandon: "abandoned" }[e.op];
}

/** Passos do fluxo declarado da intenção (a duplicidade usa o da principal), ou null. */
function stepsOf(i) {
  const f = Object.hasOwn(F3_MUTATION_FLOWS, i.producerOrder)
    ? F3_MUTATION_FLOWS[i.producerOrder]
    : null;
  if (!f) return null;
  if (i.kind !== "prerequisito") return f.principal;
  if (!f.prerequisito) return null;
  if (Array.isArray(f.prerequisito)) return f.prerequisito;
  return f.prerequisito[i.action] ?? null;
}

/**
 * Vínculo de um passo que saiu (PLAN §12.5). Regras, todas reexecutadas no replay:
 * - passos em ordem, dentro do envio corrente;
 * - no reenvio, vínculo idêntico ao original do mesmo passo (mesmo corpo, mesmos valores);
 * - valor gerado em tempo de execução (chave da UI, ID capturado) é novo: não é a e87f7e68, a
 *   organização F3, entidade do inventário, requestId nem valor de outra intenção;
 * - com fluxo declarado, as referências são exatamente as posições declaradas: inventário é a
 *   organização F3 ou registro isolado criado pelo produtor declarado; versão observada
 *   refere-se à entidade da posição de inventário declarada.
 */
function bindIntent(st, e, i) {
  if (i.state !== "sealed") fail("F3_INTENT_STATE");
  const steps = stepsOf(i);
  if (e.step !== i.sendBinds || (steps && e.step >= steps.length)) fail("F3_INTENT_BIND");
  const bind = {
    step: e.step,
    bodySha256: e.bodySha256,
    slots: [...e.slots],
    refs: e.refs.map((x) => ({ ...x })),
  };
  if (i.resent) {
    const original = i.binds[e.step];
    if (!original || JSON.stringify(original) !== JSON.stringify(bind))
      fail("F3_INTENT_RESEND_BIND");
    i.sendBinds += 1;
    return;
  }
  const taken = new Set(
    // A organização F3 e toda entidade observada estão em st.entities.
    [F3_E87_ORG, ...st.entities, ...st.intents.keys()].map(sha256hex),
  );
  for (const [id, other] of st.intents)
    if (id !== e.requestId) for (const b of other.binds) for (const v of b.slots) taken.add(v);
  if (e.slots.some((v) => taken.has(v))) fail("F3_VALUE_ORIGIN");
  if (steps) {
    const s = steps[e.step];
    if (e.slots.length !== s.free.length) fail("F3_INTENT_BIND");
    const declared = [...Object.keys(s.inventory), ...Object.keys(s.derived)];
    if (JSON.stringify(e.refs.map((x) => x.field)) !== JSON.stringify(declared))
      fail("F3_INTENT_BIND");
    for (const ref of e.refs) {
      const field = Object.hasOwn(s.inventory, ref.field) ? ref.field : s.derived[ref.field];
      const origin = s.inventory[field];
      const ok =
        origin === 2
          ? ref.entityId === st.organizationF3
          : st.created.some((c) => {
              const source = st.intents.get(c.requestId);
              const order = typeof origin === "number" ? origin : origin?.producerOrder;
              return (
                c.id === ref.entityId &&
                c.kind === "registro" &&
                c.organizationId === st.organizationF3 &&
                source?.producerOrder === order &&
                (typeof origin === "number" || source?.action === origin.action)
              );
            });
      if (!ok) fail("F3_FOREIGN_ORG");
      if ((ref.version !== null) !== Object.hasOwn(s.derived, ref.field)) fail("F3_VALUE_ORIGIN");
      if (
        Object.hasOwn(s.derived, ref.field) &&
        e.refs.find((r) => r.field === s.derived[ref.field])?.entityId !== ref.entityId
      )
        fail("F3_VALUE_ORIGIN");
    }
  }
  i.binds = [...i.binds, bind];
  i.sendBinds += 1;
}

// O resumo expõe o estado exato (selado, incerto e ausente são pendentes distintos) e o SHA-256
// dos vínculos da intenção: com o log canônico, remover ou trocar qualquer evento muda o resumo
// ou quebra o replay.
const PENDING = Object.freeze(["sealed", "uncertain", "absent"]);
function summarize(st, run) {
  const requests = [...st.intents].map(([requestId, i]) => {
    const outcome = i.state;
    return {
      requestId,
      producerOrder: i.producerOrder,
      kind: i.kind,
      ...(i.action !== undefined ? { action: i.action } : {}),
      duplicateOf: i.duplicateOf,
      outcome,
      prior: i.prior,
      entityId: outcome === "confirmed" ? i.entityId : null,
      sends: i.sends,
      rechecked: i.rechecked,
      binds: i.binds.length ? sha256hex(JSON.stringify(i.binds)) : null,
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
    // Compromisso de integridade do transcript: remover eventos redundantes nao pode
    // passar pela comparacao de estados do replay. O SHA do artefato e ligado pelo CI.
    eventsSha256: sha256hex(JSON.stringify(run.events)),
  };
}

/** Estado para a execução seguinte: tudo vira anterior; selado sem desfecho vira incerto. */
function closeRun(st, run) {
  const next = cloneState(st);
  next.priorSent += run.sent;
  for (const i of next.intents.values()) {
    i.prior = true;
    i.sends = 0;
    i.sendBinds = 0;
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
  const control = { fenced: false, frozen: false, failure: null };
  const SENDING = ["seal", "resend", "bind"];
  const replayOn = (events) => {
    const next = cloneState(st),
      nextRun = { sent: run.sent, events: [...run.events] };
    for (const e of events) {
      applyEvent(next, nextRun, e);
      nextRun.events.push(Object.freeze({ ...e }));
    }
    return { next, nextRun };
  };
  // Um ou mais eventos numa só transação: selo (ou reenvio) e vínculo entram juntos ou não entram.
  const apply = (...events) => {
    if (control.frozen && events.some((e) => SENDING.includes(e.op))) fail("F3_FENCE_FROZEN");
    const { next, nextRun } = replayOn(events);
    st = next;
    run = nextRun;
  };
  /** Simula eventos sobre uma cópia do estado, com a mesma applyEvent, sem gravar. */
  const simulate = (...events) => {
    if (control.frozen) fail("F3_FENCE_FROZEN");
    replayOn(events);
    return true;
  };
  const bindEvent = (requestId, { step, bodySha256, slots, refs }) => ({
    op: "bind",
    requestId,
    step,
    bodySha256,
    slots: [...slots],
    refs: refs.map((x) => ({ ...x })),
  });
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
      action,
    }) {
      if (actor !== "master") fail("F3_SECOND_USER_MUTATION");
      if (!Number.isSafeInteger(producerOrder)) fail("F3_INTENT_PRODUCER");
      if (!isUuid(requestId) || (duplicateOf !== null && !isUuid(duplicateOf)))
        fail("F3_INTENT_ID");
      if (!enumOf(kind, F3_INTENT_KINDS)) fail("F3_INTENT_KIND");
      if ((kind === "duplicidade") !== (duplicateOf !== null)) fail("F3_INTENT_KIND");
      if (organizationId !== st.organizationF3) fail("F3_FOREIGN_ORG");
      apply(
        ev("seal", requestId, {
          producerOrder,
          kind,
          duplicateOf,
          ...(action !== undefined ? { action } : {}),
        }),
      );
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
    /** Vínculo de um passo que saiu; a cerca o grava junto com o selo ou o reenvio. */
    bind: (requestId, b) => apply(bindEvent(requestId, b)),
    /**
     * Simula um selo ou reenvio sobre uma cópia do estado, com a mesma applyEvent: a cerca
     * valida a intenção ao armar com a regra do livro, sem reescrevê-la (parecer 2b-2a, grupo B).
     */
    check(input) {
      assertJsonTree(input, "F3_INTENT_STATE");
      const keys = ["op", "requestId", "producerOrder", "kind", "duplicateOf", "action"];
      if (Object.keys(input).some((k) => !keys.includes(k))) fail("F3_INTENT_STATE");
      const {
        op,
        requestId,
        producerOrder = null,
        kind = null,
        duplicateOf = null,
        action,
      } = input;
      if (op !== "seal" && op !== "resend") fail("F3_INTENT_STATE");
      if (control.frozen) fail("F3_FENCE_FROZEN");
      const e =
        op === "seal"
          ? ev("seal", requestId, {
              producerOrder,
              kind,
              duplicateOf,
              ...(action !== undefined ? { action } : {}),
            })
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
  BOOKS.set(book, () => ({ st, run, record, provenance, control, apply, simulate, ev, bindEvent }));
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
// Origens por posição (levantamento, seção 1): free são as vagas (gerado_ui e capturado);
// inventory liga o campo à ordem do produtor que criou a entidade (2 é a organização F3);
// derived liga o campo de versão observada ao campo de inventário da entidade lida. O que não é
// declarado é literal (gerado_harness) e nunca contém UUID fora do inventário isolado.
const step = (target, name, { query = "", free = [], pathFields = [], inventory = {}, derived = {}, source }) =>
  Object.freeze({
    target,
    name,
    query,
    free: Object.freeze([...free]),
    pathFields: Object.freeze([...pathFields]),
    inventory: Object.freeze(
      Object.fromEntries(
        Object.entries(inventory).map(([field, origin]) => [
          field,
          typeof origin === "number" ? origin : Object.freeze({ ...origin }),
        ]),
      ),
    ),
    derived: Object.freeze({ ...derived }),
    source,
  });
const DOC = "src/lib/administracao/admUsuariosRpc.ts:";
// Por produtor e tipo de intenção: principal (também usado pela duplicidade) e prerequisito.
const flow = (principal, prerequisito = null) =>
  Object.freeze({
    principal: Object.freeze(principal),
    prerequisito:
      prerequisito &&
      Object.freeze(
        Array.isArray(prerequisito)
          ? prerequisito
          : Object.fromEntries(
              Object.entries(prerequisito).map(([key, steps]) => [key, Object.freeze(steps)]),
            ),
      ),
  });
/**
 * Quatro passos reais do upload simples V110/V111/V115/V122.
 * Storage somente no bucket homologado pelo backend, path gerado e vinculado
 * entre PUT e confirmar_upload_arquivo. TUS continua proibido.
 */
const f3UploadSteps = (businessStep) => [
  step("edge", "storage-sign-upload", {
    inventory: { id_organizacao: 2, id_contrato: 7 },
    source: "src/lib/contratos/documentosDados.ts:410-454",
  }),
  step("storage", "contaos-documentos", {
    free: ["path"],
    pathFields: ["path"],
    source: "src/lib/contratos/documentosDados.ts:454-461",
  }),
  step("rpc", "confirmar_upload_arquivo", {
    free: ["p_path"],
    pathFields: ["p_path"],
    inventory: { p_id_organizacao: 2, p_id_contrato: 7 },
    source: "src/lib/contratos/documentosDados.ts:639-660",
  }),
  businessStep,
];
export const F3_MUTATION_FLOWS = Object.freeze({
  2: flow([
    step("rpc", "criar_organizacao", {
      source: "src/lib/organizacao/criarOrganizacaoDados.ts:35-40",
    }),
  ]),
  4: flow([
    step("edge", "admin-invite-user", {
      free: ["chave_idempotencia"],
      inventory: { id_organizacao: 2 },
      source: DOC + "188-211",
    }),
    step("rpc", "salvar_vinculo_usuario_adm", {
      free: ["p_id_usuario", "p_chave_idempotencia"],
      inventory: { p_id_organizacao: 2 },
      source: DOC + "171-185",
    }),
  ]),
  5: flow([
    step("table", "contratantes", {
      query: "?select=id%2Crazao_social%2Csituacao",
      inventory: { id_organizacao: 2 },
      source: "src/lib/contratantes/novoContratanteDados.ts:148-148",
    }),
  ]),
  6: flow([
    step("rpc", "atualizar_contratante", {
      inventory: { p_id_organizacao: 2, p_id_contratante: 5 },
      derived: { p_versao_esperada: "p_id_contratante" },
      source: "src/lib/contratantes/editarContratanteDados.ts:94-115",
    }),
  ]),
  7: flow([
    step("table", "contratos", {
      inventory: { id_organizacao: 2, id_contratante: 5 },
      source: "src/lib/contratos/novoContratoDados.ts:107-129",
    }),
  ]),
  8: flow([
    step("rpc", "atualizar_contrato_v1", {
      free: ["p_request_id"],
      inventory: { p_id_organizacao: 2, p_id_contrato: 7 },
      derived: { p_versao_esperada: "p_id_contrato" },
      source: "src/lib/cadastros/cadastroOperacionalDados.ts:210-225",
    }),
  ]),
  10: flow(
    [
      step("rpc", "definir_aplicabilidade_fonte_v107", {
        free: ["p_chave_idempotencia"],
        inventory: {
          p_id_organizacao: 2,
          p_id_contrato: 7,
          p_id_versao: { producerOrder: 10, action: "versao" },
        },
        source: "src/components/contratos/BaseNormativaContrato.tsx:1465-1472",
      }),
    ],
    {
      fonte: [
        step("rpc", "salvar_fonte_normativa_v107", {
          free: ["p_chave_idempotencia"],
          inventory: { p_id_organizacao: 2, p_id_contrato: 7 },
          source: "src/components/contratos/BaseNormativaContrato.tsx:921-942",
        }),
      ],
      versao: [
        step("rpc", "registrar_versao_fonte_v107", {
          free: ["p_chave_idempotencia"],
          inventory: {
            p_id_organizacao: 2,
            p_id_fonte: { producerOrder: 10, action: "fonte" },
          },
          source: "src/components/contratos/BaseNormativaContrato.tsx:1098-1110",
        }),
      ],
      aprovacao: [
        step("rpc", "aprovar_versao_fonte_v107", {
          free: ["p_chave_idempotencia"],
          inventory: {
            p_id_organizacao: 2,
            p_id_versao: { producerOrder: 10, action: "versao" },
          },
          source: "src/components/contratos/BaseNormativaContrato.tsx:1366-1375",
        }),
      ],
    },
  ),
  // V108: três preparações genuínas e publicação da versão previamente inventariada.
  9: flow(
    [
      step("rpc", "publicar_versao_proposta_v108", {
        free: ["p_chave_idempotencia"],
        inventory: { p_id_versao: { producerOrder: 9, action: "versao" } },
        source: "src/components/contratos/OrcamentoContrato.tsx:1500-1517",
      }),
    ],
    {
      proposta: [
        step("rpc", "salvar_proposta_orcamentaria_v108", {
          free: ["p_chave_idempotencia"],
          inventory: { p_id_contrato: 7 },
          source: "src/components/contratos/OrcamentoContrato.tsx:1044-1061",
        }),
      ],
      versao: [
        step("rpc", "registrar_versao_proposta_v108", {
          free: ["p_id_arquivo_origem", "p_chave_idempotencia"],
          inventory: { p_id_proposta: { producerOrder: 9, action: "proposta" } },
          source: "src/components/contratos/OrcamentoContrato.tsx:1130-1150",
        }),
      ],
      rubrica: [
        step("rpc", "salvar_linha_orcamentaria_v108", {
          free: ["p_chave_idempotencia"],
          inventory: { p_id_versao_proposta: { producerOrder: 9, action: "versao" } },
          source: "src/components/contratos/OrcamentoContrato.tsx:1268-1305",
        }),
      ],
    },
  ),
  // V109: lista base, item e publicação por um único adaptador RPC do produto.
  11: flow(
    [
      step("rpc", "executar_comando_lista_v1", {
        free: ["p_request_id"],
        inventory: { p_id_contrato: 7 },
        source: "src/lib/contratos/listaOperacionalDados.ts:276-317",
      }),
    ],
    {
      item: [
        step("rpc", "executar_comando_lista_v1", {
          free: ["p_request_id"],
          inventory: { p_id_lista: 11, p_id_contrato: 7 },
          derived: { p_versao_esperada: "p_id_lista" },
          source: "src/components/contratos/GerenciarListas.tsx:517-530",
        }),
      ],
      publicacao: [
        step("rpc", "executar_comando_lista_v1", {
          free: ["p_request_id"],
          inventory: { p_id_lista: 11, p_id_contrato: 7 },
          derived: { p_versao_esperada: "p_id_lista" },
          source: "src/components/contratos/GerenciarListas.tsx:506-514",
        }),
      ],
    },
  ),
  12: flow(
    f3UploadSteps(
      step("rpc", "criar_documento_contrato_completo", {
        free: ["p_id_arquivo", "p_chave_idempotencia"],
        inventory: { p_id_contrato: 7 },
        source: "src/lib/contratos/documentosDados.ts:755-774",
      }),
    ),
  ),
  13: flow(
    f3UploadSteps(
      step("rpc", "adicionar_versao_documento_contrato", {
        free: ["p_id_arquivo", "p_chave_idempotencia"],
        inventory: { p_id_documento: 12 },
        source: "src/lib/contratos/documentosDados.ts:776-791",
      }),
    ),
  ),
  15: flow(
    f3UploadSteps(
      step("rpc", "criar_documento_competencia_v115", {
        free: ["p_id_requisito", "p_id_arquivo", "p_chave_idempotencia"],
        inventory: { p_id_competencia: 14 },
        source: "src/lib/competencias/competenciaDocumentosDados.ts:299-317",
      }),
    ),
  ),
  20: flow(
    [
      step("rpc", "registrar_relatorio_historico_hml", {
        inventory: { p_id_arquivo: { producerOrder: 20, action: "documento" } },
        source: "src/lib/contratos/ingestaoHistoricoDados.ts:72-82",
      }),
      step("rpc", "enfileirar_ingestao_historica_hml", {
        free: ["p_id_versao_documento"],
        inventory: { p_id_relatorio: 20 },
        source: "src/lib/contratos/ingestaoHistoricoDados.ts:84-90",
      }),
    ],
    {
      documento: f3UploadSteps(
        step("rpc", "criar_documento_contrato_completo", {
          free: ["p_id_arquivo", "p_chave_idempotencia"],
          inventory: { p_id_contrato: 7 },
          source: "src/components/contratos/ImportarHistorico.tsx:134-152",
        }),
      ),
    },
  ),
  // S3: contratos de mutacao oficiais sem upload (fluxos de competencia e parecer).
  14: flow([
    step("rpc", "criar_competencia", {
      inventory: { p_id_contrato: 7 },
      source: "src/lib/contratos/novaCompetenciaDados.ts:65-75",
    }),
  ]),
  16: flow([
    step("rpc", "solicitar_analise_competencia", {
      inventory: { p_id_competencia: 14 },
      source: "src/lib/competencias/competenciaAnaliseDados.ts:188-197",
    }),
  ]),
  // V117: revisão humana efetiva, amarrada à competência F3 e com idempotência do produto.
  17: flow([
    step("rpc", "registrar_revisao_requisito_v117", {
      free: ["p_request_id"],
      inventory: { p_id_competencia: 14 },
      source: "src/lib/competencias/revisaoRequisitoDados.ts:112-177",
    }),
  ]),
  18: flow(
    [
      step("rpc", "aprovar_parecer_interno", {
        inventory: { p_id_parecer: { producerOrder: 18, action: "parecer" } },
        source: "src/lib/competencias/parecerInternoDados.ts:150-166",
      }),
    ],
    {
      parecer: [
        step("rpc", "solicitar_parecer_interno", {
          inventory: { p_id_competencia: 14 },
          source: "src/lib/competencias/parecerInternoDados.ts:136-146",
        }),
      ],
    },
  ),
  19: flow(
    [
      step("rpc", "registrar_apresentacao", {
        free: ["p_idempotency_key"],
        inventory: { p_id_competencia: 14 },
        source: "src/lib/competencias/apresentacaoDados.ts:88-104",
      }),
    ],
    {
      aprovacao: [
        step("rpc", "aprovar_apresentacao", {
          inventory: { p_id_competencia: 14 },
          source: "src/lib/competencias/apresentacaoDados.ts:56-70",
        }),
      ],
    },
  ),
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
  ...(Array.isArray(f.prerequisito) ? f.prerequisito : Object.values(f.prerequisito ?? {}).flat()),
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
        if (!SLOT_RE.test(v) || top === null || !s.free.includes(top)) fail("F3_FENCE_ARM");
        const expected = s.pathFields.includes(top) ? "path" : "uuid";
        if (!v.startsWith(SLOT + expected + ":")) fail("F3_FENCE_ARM");
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
 * Vínculo de um passo a partir do corpo: SHA-256 do corpo canônico, de cada valor de vaga (na
 * ordem declarada em free) e as referências declaradas (inventário e versão observada).
 * placeholder: ao armar, as vagas ainda não têm valor e entram com um valor novo.
 */
function bindOf(s, stepIndex, body, placeholder = false) {
  const slots = s.free.map((k) => {
    const pathField = s.pathFields.includes(k);
    const v = placeholder
      ? pathField ? "isolated/uploads/" + crypto.randomUUID() + "/proof.pdf" : crypto.randomUUID()
      : body[k];
    if (
      pathField
        ? typeof v !== "string" || !/^[A-Za-z0-9_.\/-]{1,512}$/.test(v) ||
          v.includes("..") || !v.includes("/uploads/")
        : !isUuid(v)
    ) fail("F3_VALUE_ORIGIN");
    return sha256hex(v);
  });
  const refs = [
    ...Object.keys(s.inventory).map((field) => ({ field, entityId: body[field], version: null })),
    ...Object.entries(s.derived).map(([field, of]) => ({
      field,
      entityId: body[of],
      version: body[field],
    })),
  ];
  for (const ref of refs) {
    if (!isUuid(ref.entityId)) fail("F3_FOREIGN_ORG");
    if (ref.version !== null && (!Number.isSafeInteger(ref.version) || ref.version < 1))
      fail("F3_VALUE_ORIGIN");
  }
  return { step: stepIndex, bodySha256: sha256hex(canonicalJson(body)), slots, refs };
}
const ORIGIN_CODES = Object.freeze(["F3_FOREIGN_ORG", "F3_VALUE_ORIGIN"]);

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
  const observedVersions = new Map();
  const tickets = new Map();
  const ticketOf = (r) =>
    typeof r.sessionId === "string" && typeof r.interceptionId === "string"
      ? r.sessionId + "\u0000" + r.interceptionId
      : null;
  const freeze = (code = "F3_FENCE_FROZEN") => {
    control.failure ??= code;
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
    // Envio resumível (TUS, PLAN §12.3): bloqueado com causa própria desde o preflight, em
    // qualquer método e nas duas origens.
    const target = parseUrl(request.url);
    if (
      target &&
      [API_ORIGIN, STORAGE_ORIGIN].includes(target.origin) &&
      /^\/storage\/v1\/upload\/resumable(?:\/|$)/.test(target.pathname)
    )
      return freeze("F3_UPLOAD_RESUMABLE");
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
      const scope = book.organizationF3() + "/uploads/";
      const path = u.pathname.slice(("/storage/v1/object/upload/sign/" + s.name + "/").length);
      if (!path.startsWith(scope) || !/^[0-9a-f-]{36}\/[^/]+$/.test(path.slice(scope.length))) {
        return freeze("F3_FOREIGN_ORG");
      }
      body = { path };
    } else {
      if (request.method !== "POST") return freeze();
      body = parseJsonBody(request.postData);
      if (body === undefined || !matchBody(body, armed, active.slots, got)) return freeze();
    }
    // A primeira requisição da intenção é a que conta: sela (ou reenvia) e vincula antes de
    // sair; os passos seguintes vinculam. Tudo pela applyEvent do livro, numa só transação, e a
    // regra de origem e a do reenvio são as do livro.
    try {
      const internal = BOOKS.get(book)();
      const events = [];
      if (active.done === 0)
        events.push(
          active.resend
            ? internal.ev("resend", active.requestId)
            : internal.ev("seal", active.requestId, {
                producerOrder: active.producerOrder,
                kind: active.kind,
                duplicateOf: active.duplicateOf,
                ...(active.action !== undefined ? { action: active.action } : {}),
              }),
        );
      events.push(internal.bindEvent(active.requestId, bindOf(s, active.done, body)));
      internal.apply(...events);
    } catch {
      return freeze();
    }
    active.sealed = true;
    Object.assign(active.slots, got);
    active.done += 1;
    tickets.set(ticket, {
      url: request.url,
      method: request.method,
      body: s.target === "storage" ? null : canonicalJson(body),
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
    // Called from the MASTER page's Playwright response listener.
    async observeVersion(response) {
      if (control.frozen || response.status() !== 200) return false;
      const request = response.request();
      const url = parseUrl(response.url());
      const org = book.organizationF3();
      if (!org || url?.origin !== API_ORIGIN || request.url() !== response.url()) return false;
      let id, order;
      if (request.method() === "GET" && url.pathname === "/rest/v1/contratantes") {
        if (url.searchParams.getAll("id_organizacao").join() !== "eq." + org) return false;
        const filter = url.searchParams.getAll("id").join();
        if (!filter.startsWith("eq.")) return false;
        id = filter.slice(3);
        order = 6;
      } else if (
        request.method() === "POST" &&
        url.pathname === "/rest/v1/rpc/obter_cadastro_operacional_v1" &&
        !url.search
      ) {
        const args = parseJsonBody(request.postData());
        if (args?.p_id_organizacao !== org || args.p_entidade !== "contratos") return false;
        id = args.p_id;
        order = 8;
      } else return false;
      if (!isUuid(id)) return false;
      const data = await response.json();
      const row =
        order === 8
          ? data?.schema_versao === "crud-cadastro-v1" &&
            data.entidade === "contratos" &&
            data.registro
          : Array.isArray(data) && data.length === 1
            ? data[0]
            : data;
      if (
        control.frozen ||
        row?.id !== id ||
        row.id_organizacao !== org ||
        !Number.isSafeInteger(row.versao_registro) ||
        row.versao_registro < 1
      )
        return false;
      const reference = order + ":" + id;
      if ((observedVersions.get(reference) ?? 0) > row.versao_registro) return false;
      observedVersions.set(reference, row.versao_registro);
      return true;
    },
    arm(input = {}) {
      if (control.frozen) fail("F3_FENCE_FROZEN");
      if (active) fail("F3_FENCE_PENDING");
      const ARM_KEYS = ["producerOrder", "kind", "duplicateOf", "resendOf", "bodies", "action"];
      assertJsonTree(input, "F3_FENCE_ARM");
      if (Object.keys(input).some((k) => !ARM_KEYS.includes(k))) fail("F3_FENCE_ARM");
      const { producerOrder, bodies, resendOf = null } = input;
      let { kind = "principal", duplicateOf = null, action } = input;
      // Isolamento antes de qualquer mutação nova: violação anterior impede seguir mutando.
      book.assertIsolation();
      if (!Number.isSafeInteger(producerOrder) || !Object.hasOwn(F3_MUTATION_FLOWS, producerOrder))
        fail("F3_FLOW_UNDEFINED");
      let requestId;
      if (resendOf !== null) {
        // Reenvio depois de readback (PLAN 7.2): mesma intenção, mesmo tipo, envio pelo livro.
        if (
          input.kind !== undefined ||
          input.duplicateOf !== undefined ||
          input.action !== undefined
        )
          fail("F3_FENCE_ARM");
        book.check({ op: "resend", requestId: resendOf });
        const prior = book.summary().requests.find((q) => q.requestId === resendOf);
        if (prior.producerOrder !== producerOrder) fail("F3_INTENT_PRODUCER");
        ({ kind, duplicateOf, action } = prior);
        requestId = resendOf;
      } else {
        requestId = crypto.randomUUID();
        // A regra do livro decide ao armar, sobre uma cópia do estado; o selo real reconfere.
        book.check({
          op: "seal",
          requestId,
          producerOrder,
          kind,
          duplicateOf,
          ...(action !== undefined ? { action } : {}),
        });
      }
      const chosen = F3_MUTATION_FLOWS[producerOrder];
      const steps =
        kind === "prerequisito"
          ? Array.isArray(chosen.prerequisito)
            ? chosen.prerequisito
            : chosen.prerequisito?.[action]
          : chosen.principal;
      if (!steps) fail("F3_FLOW_UNDEFINED");
      if (!Array.isArray(bodies) || bodies.length !== steps.length) fail("F3_FENCE_ARM");
      const isolated = new Set([
        ...(book.organizationF3() ? [book.organizationF3()] : []),
        ...book
          .created()
          .filter((c) => ISOLATED_KINDS.includes(c.kind))
          .map((c) => c.id),
      ]);
      // Origem por posição, por um verificador único: a forma do corpo armado, a versão
      // observada e, pela regra do próprio livro (simulação do selo e dos vínculos), o
      // inventário. Toda recusa de origem congela a cerca (PLAN §12.6).
      try {
        const binds = steps.map((s, i) => {
          const b = bodies[i];
          if (b === null || typeof b !== "object" || Array.isArray(b)) fail("F3_FENCE_ARM");
          if (s.target === "storage") {
            strictPlain(b, ["path"], "F3_FENCE_ARM");
            if (typeof b.path !== "string" || !b.path.startsWith(SLOT + "path:"))
              fail("F3_FENCE_ARM");
            if (!SLOT_RE.test(b.path)) fail("F3_FENCE_ARM");
            return null;
          }
          for (const field of Object.keys(s.inventory))
            if (!isUuid(b[field])) fail("F3_FOREIGN_ORG");
          assertArmedBody(b, s, isolated);
          return bindOf(s, i, b, true);
        });
        if (resendOf === null) {
          const internal = BOOKS.get(book)();
          internal.simulate(
            internal.ev("seal", requestId, {
              producerOrder,
              kind,
              duplicateOf,
              ...(action !== undefined ? { action } : {}),
            }),
            ...binds.filter(Boolean).map((b) => internal.bindEvent(requestId, b)),
          );
        }
        // Versão observada (derivado): a que a UI do MASTER leu por último para a entidade.
        steps.forEach((s, i) => {
          for (const [field, of] of Object.entries(s.derived)) {
            const observed = observedVersions.get(producerOrder + ":" + bodies[i][of]);
            if (observed === undefined || bodies[i][field] !== observed) fail("F3_VALUE_ORIGIN");
          }
        });
      } catch (error) {
        if (ORIGIN_CODES.includes(error?.code)) freeze();
        throw error;
      }
      active = {
        requestId,
        producerOrder,
        kind,
        action,
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
  for (const q of n.requests)
    strictPlain(q, Object.hasOwn(q, "action") ? ACTION_INTENT_KEYS : INTENT_KEYS, code);
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

/**
 * BUILD-2b-2b S1: piloto UI de quatro produtores. Sem fetch de mutação, sem SQL e sem
 * acesso direto a segredo por este módulo. O navegador chega com a cerca CDP instalada.
 * F3 --run-f3 continua bloqueado até todos os 20 produtores estarem implementados.
 */
export const F3_S1_UI = Object.freeze({
  login: "/login",
  organizations: "/selecionar-organizacao",
  users: "/administracao/usuarios",
  originalMasterOrganization: "ContaOS HML Teste",
  originalMasterRole: "Administrador Master",
  secondRole: "leitor",
  timeout: 15000,
});
const F3_S1_AUTH = API_ORIGIN + "/auth/v1/token?grant_type=password";
const F3_S1_ORGS = API_ORIGIN + "/rest/v1/rpc/listar_organizacoes_disponiveis";
const F3_S1_CREATE = API_ORIGIN + "/rest/v1/rpc/criar_organizacao";
const F3_S1_EDGE = API_ORIGIN + "/functions/v1/admin-invite-user";
const F3_S1_LINK = API_ORIGIN + "/rest/v1/rpc/salvar_vinculo_usuario_adm";
const F3_S1_LIST = API_ORIGIN + "/rest/v1/rpc/listar_usuarios_vinculos_adm";

function f3S1Credentials(credentials) {
  if (
    !credentials ||
    typeof credentials.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) ||
    typeof credentials.password !== "string" ||
    !credentials.password ||
    credentials.password.length > 4096
  )
    fail("F3_UI_CREDENTIALS");
}

const F3_S1_RBAC = API_ORIGIN + "/rest/v1/rpc/consultar_permissoes_efetivas";

/** Snapshot apenas da resposta RPC observada no navegador, nunca por acesso direto ao backend. */
export function parseF3S1EffectiveRbac(dto, expectMaster) {
  const code = "F3_UI_RBAC_RESPONSE";
  if (
    !dto ||
    typeof expectMaster !== "boolean" ||
    Object.keys(dto).sort().join(",") !== "master,permissoes,schema_versao,versao" ||
    dto.schema_versao !== "rbac-v1" ||
    dto.versao !== F3_RBAC_LEITOR.version ||
    dto.master !== expectMaster ||
    !Array.isArray(dto.permissoes)
  )
    fail(code);
  const allowed = [];
  for (const p of dto.permissoes) {
    if (
      !p ||
      Object.keys(p).sort().join(",") !== "acao,recurso" ||
      typeof p.acao !== "string" ||
      typeof p.recurso !== "string" ||
      !/^[a-z_]+$/.test(p.acao) ||
      !/^[a-z_]+$/.test(p.recurso)
    )
      fail(code);
    allowed.push(p.recurso + "/" + p.acao);
  }
  if (new Set(allowed).size !== allowed.length) fail(code);
  if (expectMaster) {
    if (JSON.stringify([...allowed].sort()) !== JSON.stringify(F3_RBAC_MASTER_ALLOWED)) fail(code);
  } else assertF3LeitorRbac({ version: dto.versao, allowed });
  return Object.freeze({ version: dto.versao, allowed: Object.freeze(allowed.sort()) });
}

/** A recarga da UI deve emitir o POST RPC real com organização e contrato esperado. */
export async function readF3S1EffectiveRbac(page, organizationId, expectMaster) {
  if (!isUuid(organizationId) || typeof expectMaster !== "boolean" || !page)
    fail("F3_UI_RBAC_READBACK");
  const pending = page.waitForResponse(
    (r) => r.url() === F3_S1_RBAC && r.request().method() === "POST",
    { timeout: F3_S1_UI.timeout },
  );
  await page.reload({ waitUntil: "networkidle" });
  const response = await pending;
  if (response.status() !== 200) fail("F3_UI_RBAC_READBACK");
  let args;
  try {
    args = response.request().postDataJSON();
  } catch {
    fail("F3_UI_RBAC_READBACK");
  }
  if (
    !args ||
    Object.keys(args).sort().join(",") !== "p_id_contrato,p_id_organizacao" ||
    args.p_id_contrato !== null ||
    args.p_id_organizacao !== organizationId
  )
    fail("F3_UI_RBAC_READBACK");
  return parseF3S1EffectiveRbac(await response.json(), expectMaster);
}

/** A inclusão do leitor jamais deve alterar as permissões efetivas do MASTER. */
export function assertF3S1MasterRbacUnchanged(before, after) {
  if (
    !before ||
    !after ||
    before.version !== after.version ||
    JSON.stringify(before.allowed) !== JSON.stringify(after.allowed)
  )
    fail("F3_UI_MASTER_RBAC_DRIFT");
  return true;
}

/** Login exclusivamente pela interface. Não retorna token, email nem dados de Auth. */
export async function f3S1Login(page, credentials, { readerBeforeLink = false } = {}) {
  f3S1Credentials(credentials);
  await page.goto(HML_ORIGIN + F3_S1_UI.login, { waitUntil: "networkidle" });
  await page.locator("#login-email").fill(credentials.email);
  await page.locator("#login-senha").fill(credentials.password);
  const auth = page.waitForResponse(
    (r) => r.url() === F3_S1_AUTH && r.request().method() === "POST",
    { timeout: F3_S1_UI.timeout },
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  if ((await auth).status() !== 200) fail("F3_UI_LOGIN_FAILED");
  if (readerBeforeLink) {
    await page
      .getByText(
        "Seu usuário não possui acesso ativo a nenhuma organização. Procure o administrador.",
        { exact: true },
      )
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    const logout = page.waitForResponse(
      (r) => r.url() === API_ORIGIN + "/auth/v1/logout" && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    if ((await logout).status() !== 204) fail("F3_UI_LOGOUT");
    await page.locator("#login-senha").waitFor({ state: "visible" });
    return "NO_ACTIVE_MEMBERSHIP";
  }
  await page.waitForURL((url) => url.origin === HML_ORIGIN && url.pathname !== F3_S1_UI.login, {
    timeout: F3_S1_UI.timeout,
  });
  return "AUTHENTICATED";
}

async function f3S1Logout(page, fence) {
  const logout = page.waitForResponse(
    (r) => r.url() === API_ORIGIN + "/auth/v1/logout" && r.request().method() === "POST",
    { timeout: F3_S1_UI.timeout },
  );
  await page
    .getByRole("navigation", { name: "Ações da sessão", exact: true })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  if ((await logout).status() !== 204) fail("F3_UI_LOGOUT");
  await page.waitForURL((u) => u.origin === HML_ORIGIN && u.pathname === F3_S1_UI.login);
  await fence.drain();
  fence.assertSafe();
  return true;
}

async function f3S1MasterSelect(page, fence) {
  await page.goto(HML_ORIGIN + F3_S1_UI.organizations, { waitUntil: "networkidle" });
  await fence.drain();
  fence.assertSafe();
  const master = page
    .getByRole("radio")
    .filter({ hasText: F3_S1_UI.originalMasterOrganization })
    .filter({ hasText: F3_S1_UI.originalMasterRole });
  if ((await master.count()) !== 1) fail("F3_UI_MASTER_ROLE");
  return true;
}

export async function f3S1CreateOrganization({ page, fence, mutationFence, book, name }) {
  if (!/^ContaOS HML F3 [1-9][0-9]{3,19}$/.test(name) || book.organizationF3() !== null)
    fail("F3_UI_ORG_PRECONDITION");
  if ((await page.getByRole("radio").filter({ hasText: name }).count()) !== 0)
    fail("F3_UI_ORG_RECONCILE_REQUIRED");
  await page.getByRole("button", { name: "Nova organização", exact: true }).click();
  await page.locator("#org-criar-razao").fill(name);
  await page.locator("#org-criar-nome").fill("");
  await page.locator("#org-criar-cnpj").fill("");
  const requestId = mutationFence.arm({
    producerOrder: 2,
    bodies: [{ p_razao_social: name, p_timezone: "America/Sao_Paulo" }],
  });
  try {
    const created = page.waitForResponse(
      (r) => r.url() === F3_S1_CREATE && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    const listed = page.waitForResponse(
      (r) => r.url() === F3_S1_ORGS && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Criar organização", exact: true }).click();
    const response = await created;
    if (response.status() !== 200) fail("F3_UI_ORG_HTTP");
    const organizationId = await response.json();
    if (!isUuid(organizationId)) fail("F3_UI_ORG_RESPONSE");
    const readback = await listed;
    if (readback.status() !== 200) fail("F3_UI_ORG_READBACK");
    const rows = await readback.json();
    if (
      !Array.isArray(rows) ||
      rows.filter(
        (v) =>
          v?.id === organizationId &&
          v.razao_social === name &&
          v.perfil === "administrador_master",
      ).length !== 1
    )
      fail("F3_UI_ORG_READBACK");
    const card = page.getByRole("radio").filter({ hasText: name });
    await card.waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    if ((await card.count()) !== 1) fail("F3_UI_ORG_READBACK");
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId)
      fail("F3_UI_ORG_UNCERTAIN");
    book.confirm(requestId, { entityId: organizationId, organizationId });
    await card.click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.waitForURL((u) => u.origin === HML_ORIGIN && u.pathname === "/");
    await fence.drain();
    fence.assertSafe();
    return organizationId;
  } catch (error) {
    // criar_organizacao não tem chave: nenhuma repetição automática em falha incerta.
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Selo não emitido: não inventar envio nem mascarar a falha original.
    }
    throw error;
  }
}

/** Conferência posterior à escrita: o retorno do save, sozinho, não é persistência. */
export function assertF3S1ReaderReadback(snapshot, userId, email) {
  if (
    !isUuid(userId) ||
    typeof email !== "string" ||
    !email ||
    snapshot?.schema_versao !== "adm01-v2" ||
    !Array.isArray(snapshot?.itens)
  ) {
    fail("F3_UI_READER_READBACK");
  }
  const matching = snapshot.itens.filter(
    (item) =>
      item?.id_usuario === userId &&
      typeof item.email === "string" &&
      item.email.toLowerCase() === email.toLowerCase() &&
      item.vinculo?.perfil === "leitor" &&
      item.vinculo?.ativo === true &&
      item.vinculo?.escopo_todos_contratos === false,
  );
  if (matching.length !== 1) {
    fail("F3_UI_READER_READBACK");
  }
  return true;
}

export async function f3S1LinkReader({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  readerEmail,
}) {
  if (!isUuid(organizationId) || book.organizationF3() !== organizationId) fail("F3_UI_READER_ORG");
  await page.goto(HML_ORIGIN + F3_S1_UI.users, { waitUntil: "networkidle" });
  await fence.drain();
  fence.assertSafe();
  await page.getByRole("button", { name: "Convidar ou vincular usuário", exact: true }).click();
  await page.locator("#adm01-email").fill(readerEmail);
  await page.locator("#adm01-nome").fill("");
  await page.locator("#adm01-perfil").selectOption("leitor");
  const dialog = page.getByRole("dialog", { name: "Convidar ou vincular usuário" });
  if ((await dialog.count()) !== 1) fail("F3_UI_READER_DIALOG");
  if (!(await dialog.getByLabel("Vínculo ativo", { exact: true }).isChecked()))
    fail("F3_UI_READER_INACTIVE");
  if (await dialog.getByLabel("Acesso a todos os contratos", { exact: true }).isChecked())
    fail("F3_UI_READER_SCOPE");
  const requestId = mutationFence.arm({
    producerOrder: 4,
    bodies: [
      {
        id_organizacao: organizationId,
        email: readerEmail,
        chave_idempotencia: f3Slot("uuid", "convite"),
      },
      {
        p_id_organizacao: organizationId,
        p_id_usuario: f3Slot("uuid", "usuario"),
        p_email: readerEmail,
        p_perfil: "leitor",
        p_escopo_todos_contratos: false,
        p_ativo: true,
        p_ids_contratos_ativar: [],
        p_ids_contratos_revogar: [],
        p_versao_esperada: null,
        p_chave_idempotencia: f3Slot("uuid", "vinculo"),
      },
    ],
  });
  try {
    const invite = page.waitForResponse(
      (r) => r.url() === F3_S1_EDGE && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    const save = page.waitForResponse(
      (r) => r.url() === F3_S1_LINK && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    const readback = page.waitForResponse(
      (r) => r.url() === F3_S1_LIST && r.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    await dialog.getByRole("button", { name: "Salvar vínculo", exact: true }).click();
    const invited = await invite;
    if (invited.status() !== 200) fail("F3_UI_READER_INVITE");
    const invitedBody = await invited.json();
    const userId = invitedBody?.usuario?.id_usuario;
    if (invitedBody?.codigo !== "USUARIO_EXISTENTE" || !isUuid(userId))
      fail("F3_UI_READER_PREEXISTENCE");
    const saved = await save;
    if (saved.status() !== 200) fail("F3_UI_READER_LINK_HTTP");
    const data = await saved.json();
    if (
      data?.schema_versao !== "adm01-v2" ||
      data?.id_usuario !== userId ||
      data?.vinculo?.perfil !== "leitor" ||
      data?.vinculo?.ativo !== true
    )
      fail("F3_UI_READER_LINK_RESPONSE");
    const listed = await readback;
    if (listed.status() !== 200) {
      fail("F3_UI_READER_READBACK");
    }
    const query = listed.request().postDataJSON();
    if (query?.p_id_organizacao !== organizationId || query?.p_pagina !== 1) {
      fail("F3_UI_READER_READBACK");
    }
    assertF3S1ReaderReadback(await listed.json(), userId, readerEmail);
    await dialog.waitFor({ state: "hidden", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId)
      fail("F3_UI_READER_LINK_UNCERTAIN");
    book.confirm(requestId, { entityId: userId, organizationId });
    return userId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Selo não emitido: não inventar envio.
    }
    throw error;
  }
}

/** Executa S1 sem produzir PASS das 138 linhas, sem logar tokens nem credenciais. */
export async function driveF3S1Ui({
  masterPage,
  readerPage,
  masterFence,
  readerFence,
  mutationFence,
  book,
  masterCredentials,
  readerCredentials,
} = {}) {
  if (
    !masterPage ||
    !readerPage ||
    masterPage === readerPage ||
    masterPage.context() === readerPage.context() ||
    !masterFence ||
    !readerFence ||
    !mutationFence ||
    !BOOKS.has(book)
  )
    fail("F3_UI_SESSION_CONFIGURATION");
  f3S1Credentials(masterCredentials);
  f3S1Credentials(readerCredentials);
  if (masterCredentials.email === readerCredentials.email) fail("F3_UI_SAME_USER");
  const name = "ContaOS HML F3 " + book.provenance().workflowRunId;
  if (!/^ContaOS HML F3 [1-9][0-9]{3,19}$/.test(name)) fail("F3_UI_ORG_NONCE");
  let masterSignedIn = false;
  let readerSignedIn = false;
  try {
    // Antes de mutações: leitor preexistente autentica e não possui vínculo ativo.
    const before = await f3S1Login(readerPage, readerCredentials, { readerBeforeLink: true });
    await readerFence.drain();
    readerFence.assertSafe();
    if (before !== "NO_ACTIVE_MEMBERSHIP") fail("F3_UI_READER_PRELINK");
    await f3S1Login(masterPage, masterCredentials);
    masterSignedIn = true;
    await f3S1MasterSelect(masterPage, masterFence);
    const organizationId = await f3S1CreateOrganization({
      page: masterPage,
      fence: masterFence,
      mutationFence,
      book,
      name,
    });
    const masterBefore = await readF3S1EffectiveRbac(masterPage, organizationId, true);
    await masterFence.drain();
    masterFence.assertSafe();
    const userId = await f3S1LinkReader({
      page: masterPage,
      fence: masterFence,
      mutationFence,
      book,
      organizationId,
      readerEmail: readerCredentials.email,
    });
    const masterAfter = await readF3S1EffectiveRbac(masterPage, organizationId, true);
    assertF3S1MasterRbacUnchanged(masterBefore, masterAfter);
    await masterFence.drain();
    masterFence.assertSafe();
    await f3S1Login(readerPage, readerCredentials);
    readerSignedIn = true;
    await readerPage.goto(HML_ORIGIN + F3_S1_UI.organizations, { waitUntil: "networkidle" });
    await readerFence.drain();
    readerFence.assertSafe();
    const cards = readerPage.getByRole("radio");
    if ((await cards.count()) !== 1) fail("F3_UI_READER_ORGANIZATION_LEAK");
    const card = cards.filter({ hasText: name }).filter({ hasText: "leitor" });
    if ((await card.count()) !== 1) fail("F3_UI_READER_ROLE");
    await card.click();
    await readerPage.getByRole("button", { name: "Continuar", exact: true }).click();
    await readerPage.waitForURL((u) => u.origin === HML_ORIGIN && u.pathname === "/");
    await readerFence.drain();
    readerFence.assertSafe();
    const readerRbac = await readF3S1EffectiveRbac(readerPage, organizationId, false);
    await readerFence.drain();
    readerFence.assertSafe();
    await readerPage.goto(HML_ORIGIN + F3_S1_UI.users, { waitUntil: "networkidle" });
    await readerPage
      .getByText("Você não tem permissão para administrar usuários desta organização.", {
        exact: true,
      })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await readerFence.drain();
    readerFence.assertSafe();
    await f3S1Logout(readerPage, readerFence);
    readerSignedIn = false;
    await f3S1Logout(masterPage, masterFence);
    masterSignedIn = false;
    book.assertIsolation();
    return Object.freeze({
      state: "S1_UI_OBSERVED_NOT_CERTIFIED",
      organizationId,
      userId,
      masterLogout: true,
      readerLogout: true,
      rbacLeitorVersion: readerRbac.version,
      masterPermissionsUnchanged: true,
    });
  } finally {
    if (readerSignedIn) await f3S1Logout(readerPage, readerFence).catch(() => undefined);
    if (masterSignedIn) await f3S1Logout(masterPage, masterFence).catch(() => undefined);
  }
}

/**
 * S2, produtor 5 (V102). Executa a ação exclusivamente pela UI e pela cerca CDP já instalada.
 * Confirma o INSERT apenas depois da releitura da lista filtrada à organização F3.
 * Não cria tokens, não consulta uma entidade com service_role, nem repete POST incerto.
 */
export function assertF3S2ContractorReadback({ created, rows, organizationId, name, query }) {
  if (
    !isUuid(organizationId) ||
    typeof name !== "string" ||
    !name.startsWith("ContaOS HML F3 ") ||
    !created ||
    !isUuid(created.id) ||
    created.razao_social !== name ||
    created.situacao !== "ativo" ||
    !(query instanceof URL) ||
    query.origin !== API_ORIGIN ||
    query.pathname !== "/rest/v1/contratantes" ||
    query.searchParams.getAll("id_organizacao").length !== 1 ||
    query.searchParams.get("id_organizacao") !== "eq." + organizationId ||
    !Array.isArray(rows)
  ) {
    fail("F3_S2_V102_READBACK");
  }
  const matches = rows.filter(
    (row) => row?.id === created.id && row.razao_social === name && row.situacao === "ativo",
  );
  if (
    matches.length !== 1 ||
    rows.some((row) => row?.id === created.id && !matches.includes(row))
  ) {
    fail("F3_S2_V102_READBACK");
  }
  return created.id;
}

export async function f3S2CreateContractor({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  name,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(organizationId) ||
    book.organizationF3() !== organizationId ||
    name !== "ContaOS HML F3 " + book.provenance().workflowRunId + " Contratante"
  ) {
    fail("F3_S2_V102_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/contratantes/novo", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Novo contratante" }).waitFor({
    state: "visible",
    timeout: F3_S1_UI.timeout,
  });
  await fence.drain();
  fence.assertSafe();
  await page.locator("#v102-razao").fill(name);
  await page.locator("#v102-tipo").selectOption("juridica");
  await page.locator("#v102-documento").fill("");
  const payload = {
    id_organizacao: organizationId,
    tipo_pessoa: "juridica",
    documento: null,
    razao_social: name,
    nome_fantasia: null,
    contato: {},
    situacao: "ativo",
  };
  const requestId = mutationFence.arm({ producerOrder: 5, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (response) => {
        const target = new URL(response.url());
        return (
          response.request().method() === "POST" &&
          target.origin === API_ORIGIN &&
          target.pathname === "/rest/v1/contratantes" &&
          target.search === "?select=id%2Crazao_social%2Csituacao"
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    const reply = await posted;
    if (reply.status() !== 201) fail("F3_S2_V102_HTTP");
    const created = await reply.json();
    if (!isUuid(created?.id) || created.razao_social !== name || created.situacao !== "ativo") {
      fail("F3_S2_V102_RESPONSE");
    }
    await page
      .getByRole("heading", { name: "Contratante cadastrado com sucesso." })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_S2_V102_UNCERTAIN");
    }
    const listing = page.waitForResponse(
      (response) => {
        const target = new URL(response.url());
        return (
          response.request().method() === "GET" &&
          target.origin === API_ORIGIN &&
          target.pathname === "/rest/v1/contratantes" &&
          target.searchParams.get("id_organizacao") === "eq." + organizationId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.goto(HML_ORIGIN + "/contratantes", { waitUntil: "networkidle" });
    const listed = await listing;
    if (listed.status() !== 200) fail("F3_S2_V102_READBACK");
    const id = assertF3S2ContractorReadback({
      created,
      rows: await listed.json(),
      organizationId,
      name,
      query: new URL(listed.url()),
    });
    const row = page.getByRole("row").filter({ hasText: name });
    await row.waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    if ((await row.count()) !== 1) fail("F3_S2_V102_UI_READBACK");
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: id, organizationId });
    book.assertIsolation();
    return id;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Nenhum envio comprovado: não inventar mutação nem descartar a causa original.
    }
    throw error;
  }
}

/** V103 atualiza a identidade inventariada em V102; nunca cria uma segunda entidade. */
export function assertF3S2ContractorUpdate({
  before,
  result,
  after,
  organizationId,
  contractorId,
  fantasy,
}) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractorId) ||
    typeof fantasy !== "string" ||
    !fantasy.startsWith("ContaOS HML F3 ") ||
    before?.id !== contractorId ||
    before?.id_organizacao !== organizationId ||
    !Number.isSafeInteger(before.versao_registro) ||
    before.versao_registro < 1 ||
    result?.schema_versao !== "v103-v1" ||
    result.contratante?.id !== contractorId ||
    result.contratante?.id_organizacao !== organizationId ||
    after?.id !== contractorId ||
    after.id_organizacao !== organizationId ||
    after.nome_fantasia !== fantasy ||
    !Number.isSafeInteger(after.versao_registro) ||
    after.versao_registro !== before.versao_registro + 1 ||
    result.contratante.versao_registro !== after.versao_registro ||
    result.contratante.nome_fantasia !== fantasy
  ) {
    fail("F3_S2_V103_READBACK");
  }
  return contractorId;
}

export async function f3S2UpdateContractor({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractorId,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(contractorId) ||
    book.organizationF3() !== organizationId ||
    !book
      .created()
      .some(
        (e) =>
          e.id === contractorId &&
          e.kind === "registro" &&
          e.organizationId === organizationId &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === e.requestId && q.producerOrder === 5 && q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_S2_V103_PRECONDITION");
  }
  const route = HML_ORIGIN + "/contratantes/" + contractorId + "/editar";
  const matchingRead = (r) => {
    const u = new URL(r.url());
    return (
      r.request().method() === "GET" &&
      u.origin === API_ORIGIN &&
      u.pathname === "/rest/v1/contratantes" &&
      u.searchParams.get("id_organizacao") === "eq." + organizationId &&
      u.searchParams.get("id") === "eq." + contractorId
    );
  };
  const initial = page.waitForResponse(matchingRead, { timeout: F3_S1_UI.timeout });
  await page.goto(route, { waitUntil: "networkidle" });
  const first = await initial;
  if (first.status() !== 200 || !(await mutationFence.observeVersion(first))) {
    fail("F3_S2_V103_VERSION");
  }
  const before = await first.json();
  if (
    before?.id !== contractorId ||
    before.id_organizacao !== organizationId ||
    !Number.isSafeInteger(before.versao_registro) ||
    before.versao_registro < 1
  ) {
    fail("F3_S2_V103_VERSION");
  }
  await fence.drain();
  fence.assertSafe();
  const fantasy = "ContaOS HML F3 " + book.provenance().workflowRunId + " Atualizado";
  await page.locator("#v103-fantasia").fill(fantasy);
  const contact = {};
  for (const key of ["email", "telefone"]) {
    const value = before.contato?.[key];
    if (typeof value === "string" && value.trim()) contact[key] = value.trim();
  }
  const payload = {
    p_id_organizacao: organizationId,
    p_id_contratante: contractorId,
    p_versao_esperada: before.versao_registro,
    p_tipo_pessoa: before.tipo_pessoa,
    p_documento: before.documento ?? "",
    p_razao_social: before.razao_social,
    p_nome_fantasia: fantasy,
    p_contato: contact,
    p_situacao: before.situacao,
  };
  const requestId = mutationFence.arm({ producerOrder: 6, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url() === API_ORIGIN + "/rest/v1/rpc/atualizar_contratante",
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    const reply = await posted;
    if (reply.status() !== 200) fail("F3_S2_V103_HTTP");
    const result = await reply.json();
    if (
      result?.schema_versao !== "v103-v1" ||
      result.contratante?.id !== contractorId ||
      result.contratante.id_organizacao !== organizationId
    ) {
      fail("F3_S2_V103_RESPONSE");
    }
    await page
      .getByRole("heading", { name: "Contratante atualizado com sucesso." })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_S2_V103_UNCERTAIN");
    }
    const reloaded = page.waitForResponse(matchingRead, { timeout: F3_S1_UI.timeout });
    await page.goto(route, { waitUntil: "networkidle" });
    const readback = await reloaded;
    if (readback.status() !== 200) fail("F3_S2_V103_READBACK");
    const updated = await readback.json();
    assertF3S2ContractorUpdate({
      before,
      result,
      after: updated,
      organizationId,
      contractorId,
      fantasy,
    });
    await page
      .getByRole("heading", { name: "Editar contratante" })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    if ((await page.locator("#v103-fantasia").inputValue()) !== fantasy) {
      fail("F3_S2_V103_UI_READBACK");
    }
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: contractorId, organizationId });
    book.assertIsolation();
    return contractorId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Sem envio comprovado, não inventar evento nem perder a causa original.
    }
    throw error;
  }
}

/**
 * V105 não usa RETURNING: só uma GET posterior, com org e número sintético exato,
 * descobre o UUID do contrato. Não inventar id no harness.
 */
export function assertF3S2ContractReadback({
  rows,
  query,
  organizationId,
  contractorId,
  number,
  object,
}) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractorId) ||
    !/^F3-[1-9][0-9]{3,19}$/.test(number) ||
    object !== "Contrato sintético F3 " + number.slice(3) ||
    !Array.isArray(rows) ||
    !(query instanceof URL) ||
    query.origin !== API_ORIGIN ||
    query.pathname !== "/rest/v1/contratos" ||
    query.searchParams.getAll("id_organizacao").length !== 1 ||
    query.searchParams.get("id_organizacao") !== "eq." + organizationId
  ) {
    fail("F3_S2_V105_READBACK");
  }
  const matching = rows.filter(
    (row) =>
      isUuid(row?.id) &&
      row.id_organizacao === organizationId &&
      row.numero === number &&
      row.objeto === object,
  );
  if (matching.length !== 1) fail("F3_S2_V105_READBACK");
  if (rows.some((row) => row.numero === number && row.id !== matching[0].id)) {
    fail("F3_S2_V105_READBACK");
  }
  return matching[0].id;
}

export async function f3S2CreateContract({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractorId,
  contractorName,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(contractorId) ||
    organizationId !== book.organizationF3() ||
    contractorName !== "ContaOS HML F3 " + book.provenance().workflowRunId + " Contratante" ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === contractorId &&
          entry.kind === "registro" &&
          entry.organizationId === organizationId &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 5 &&
                q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_S2_V105_PRECONDITION");
  }
  const number = "F3-" + book.provenance().workflowRunId;
  const object = "Contrato sintético F3 " + book.provenance().workflowRunId;
  await page.goto(HML_ORIGIN + "/contratos/novo", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Novo contrato" }).waitFor({
    state: "visible",
    timeout: F3_S1_UI.timeout,
  });
  await fence.drain();
  fence.assertSafe();
  await page.locator("#v105-numero").fill(number);
  await page.locator("#v105-objeto").fill(object);
  await page.locator("#v105-inicio").fill("2026-11-01");
  await page.locator("#v105-contratante").fill(contractorName);
  await page
    .getByRole("option")
    .filter({ hasText: contractorName })
    .click({ timeout: F3_S1_UI.timeout });
  const payload = {
    id_organizacao: organizationId,
    id_contratante: contractorId,
    numero: number,
    objeto: object,
    inicio: "2026-11-01",
  };
  const requestId = mutationFence.arm({ producerOrder: 7, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url() === API_ORIGIN + "/rest/v1/contratos",
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    const submitted = await posted;
    if (submitted.status() !== 201) fail("F3_S2_V105_HTTP");
    await page
      .getByRole("heading", { name: "Contrato cadastrado com sucesso." })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_S2_V105_UNCERTAIN");
    }
    const list = page.waitForResponse(
      (r) => {
        const u = new URL(r.url());
        return (
          r.request().method() === "GET" &&
          u.origin === API_ORIGIN &&
          u.pathname === "/rest/v1/contratos" &&
          u.searchParams.get("id_organizacao") === "eq." + organizationId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.goto(HML_ORIGIN + "/contratos", { waitUntil: "networkidle" });
    const listed = await list;
    if (listed.status() !== 200) fail("F3_S2_V105_READBACK");
    const contractId = assertF3S2ContractReadback({
      rows: await listed.json(),
      query: new URL(listed.url()),
      organizationId,
      contractorId,
      number,
      object,
    });
    await page
      .getByRole("link", { name: "Abrir contrato " + number })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: contractId, organizationId });
    book.assertIsolation();
    return contractId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Contrato sem resposta definitiva não é reenviado por falta de chave idempotente.
    }
    throw error;
  }
}

/** V106: alteração do mesmo contrato V105, com versão derivada da leitura UI. */
export function assertF3S2ContractUpdate({
  before,
  result,
  after,
  organizationId,
  contractId,
  object,
  requestId,
}) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    !isUuid(requestId) ||
    !before ||
    before.schema_versao !== "crud-cadastro-v1" ||
    before.entidade !== "contratos" ||
    before.registro?.id !== contractId ||
    before.registro?.id_organizacao !== organizationId ||
    !Number.isSafeInteger(before.registro.versao_registro) ||
    before.registro.versao_registro < 1 ||
    !result ||
    result.schema_versao !== "crud-cadastro-v1" ||
    result.entidade !== "contratos" ||
    result.request_id !== requestId ||
    !isUuid(result.evento_id) ||
    result.registro?.id !== contractId ||
    result.registro?.id_organizacao !== organizationId ||
    !after ||
    after.schema_versao !== "crud-cadastro-v1" ||
    after.entidade !== "contratos" ||
    after.registro?.id !== contractId ||
    after.registro?.id_organizacao !== organizationId ||
    after.registro?.objeto !== object ||
    !Number.isSafeInteger(after.registro.versao_registro) ||
    after.registro.versao_registro !== before.registro.versao_registro + 1 ||
    result.registro?.versao_registro !== after.registro.versao_registro ||
    result.registro.objeto !== object
  ) {
    fail("F3_S2_V106_READBACK");
  }
  return contractId;
}

export async function f3S2UpdateContract({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(contractId) ||
    organizationId !== book.organizationF3() ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === contractId &&
          entry.organizationId === organizationId &&
          entry.kind === "registro" &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 7 &&
                q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_S2_V106_PRECONDITION");
  }
  const route = HML_ORIGIN + "/contratos/" + contractId;
  const rpcRead = (r) =>
    r.request().method() === "POST" &&
    r.url() === API_ORIGIN + "/rest/v1/rpc/obter_cadastro_operacional_v1";
  const native = page.waitForResponse(rpcRead, { timeout: F3_S1_UI.timeout });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Editar e gerenciar contrato" }).click();
  const first = await native;
  if (first.status() !== 200 || !(await mutationFence.observeVersion(first))) {
    fail("F3_S2_V106_VERSION");
  }
  const before = await first.json();
  if (
    before?.schema_versao !== "crud-cadastro-v1" ||
    before.entidade !== "contratos" ||
    before.registro?.id !== contractId ||
    before.registro.id_organizacao !== organizationId ||
    !before.pode_editar
  ) {
    fail("F3_S2_V106_VERSION");
  }
  await fence.drain();
  fence.assertSafe();
  const object = "Contrato sintético F3 " + book.provenance().workflowRunId + " atualizado";
  const selector = "#cadastro-contratos-" + contractId;
  await page.locator(selector + "-objeto").fill(object);
  await page.locator(selector + "-motivo").fill("Validação integrada F3");
  await page.getByRole("button", { name: "Revisar edição", exact: true }).click();
  const confirm = page.getByRole("group", { name: "Confirmar alteração" });
  await confirm.waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
  const payload = {
    p_id_organizacao: organizationId,
    p_id_contrato: contractId,
    p_versao_esperada: before.registro.versao_registro,
    p_motivo: "Validação integrada F3",
    p_request_id: f3Slot("uuid", "v106request"),
    p_alteracoes: { objeto: object },
  };
  const requestId = mutationFence.arm({ producerOrder: 8, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url() === API_ORIGIN + "/rest/v1/rpc/atualizar_contrato_v1",
      { timeout: F3_S1_UI.timeout },
    );
    await confirm.getByRole("button", { name: "Confirmar edição", exact: true }).click();
    const submitted = await posted;
    if (submitted.status() !== 200) fail("F3_S2_V106_HTTP");
    const result = await submitted.json();
    await page
      .getByText("Alteração confirmada e registrada na auditoria.", { exact: true })
      .waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_S2_V106_UNCERTAIN");
    }
    const idempotency = settled.slots.v106request;
    if (!isUuid(idempotency)) fail("F3_S2_V106_IDEMPOTENCY");
    await page.getByRole("button", { name: "Fechar gestão" }).click();
    const reopened = page.waitForResponse(rpcRead, { timeout: F3_S1_UI.timeout });
    await page.getByRole("button", { name: "Editar e gerenciar contrato" }).click();
    const read = await reopened;
    if (read.status() !== 200) fail("F3_S2_V106_READBACK");
    const after = await read.json();
    assertF3S2ContractUpdate({
      before,
      result,
      after,
      organizationId,
      contractId,
      object,
      requestId: idempotency,
    });
    if ((await page.locator(selector + "-objeto").inputValue()) !== object) {
      fail("F3_S2_V106_UI_READBACK");
    }
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: contractId, organizationId });
    book.assertIsolation();
    return contractId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Reenvio só com mesma chave após readback, nunca novo UUID automático.
    }
    throw error;
  }
}

/** V113: nunca confiar apenas no UUID retornado. A lista RLS precisa conter exatamente o
 * registro solicitado, dentro do contrato F3 e da competência do mês corrente.
 * Isto é um driver de código/UI, NÃO uma contraprova LIVE do GATE PROD. */
export function assertF3S4CompetenceReadback({ rows, rpcId, contractId, reference, query }) {
  if (
    !isUuid(rpcId) ||
    !isUuid(contractId) ||
    typeof reference !== "string" ||
    !/^\d{4}-(0[1-9]|1[0-2])-01$/.test(reference) ||
    !(query instanceof URL) ||
    query.origin !== API_ORIGIN ||
    query.pathname !== "/rest/v1/competencias" ||
    query.searchParams.get("id_contrato") !== "eq." + contractId ||
    !Array.isArray(rows) ||
    rows.length > 25
  )
    fail("F3_S4_V113_READBACK");
  const matches = rows.filter((row) => row?.competencia_referencia === reference);
  if (matches.length !== 1 || matches[0]?.id !== rpcId) fail("F3_S4_V113_READBACK");
  if (rows.some((row) => !isUuid(row?.id) || typeof row?.competencia_referencia !== "string"))
    fail("F3_S4_V113_READBACK");
  return rpcId;
}

/** V113: UI oficial → RPC observada pela cerca → readback do consumidor de competências.
 * Um erro após a emissão congela a tentativa: não há reenvio sem chave idempotente. */
export async function f3S4CreateCompetence({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    organizationId !== book.organizationF3() ||
    !book
      .created()
      .some(
        (e) =>
          e.id === contractId &&
          e.organizationId === organizationId &&
          e.kind === "registro" &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === e.requestId &&
                q.producerOrder === 7 &&
                q.kind === "principal" &&
                q.outcome === "confirmed",
            ),
      )
  )
    fail("F3_S4_V113_PRECONDITION");

  // A competência mensal é gerada pelo driver no momento da execução, não pela resposta da API.
  const month = new Date().toISOString().slice(0, 7);
  const reference = month + "-01";
  const route = "/contratos/" + contractId + "/competencias/nova";
  await page.goto(HML_ORIGIN + route, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Nova competência" }).waitFor({
    state: "visible",
    timeout: F3_S1_UI.timeout,
  });
  await page.locator("#v113-mes").waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
  await fence.drain();
  fence.assertSafe();
  await page.locator("#v113-mes").fill(month);
  const payload = {
    p_id_contrato: contractId,
    p_competencia_referencia: reference,
  };
  const requestId = mutationFence.arm({ producerOrder: 14, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url() === API_ORIGIN + "/rest/v1/rpc/criar_competencia",
      { timeout: F3_S1_UI.timeout },
    );
    await page.getByRole("button", { name: "Criar competência", exact: true }).click();
    const submitted = await posted;
    if (submitted.status() !== 200) fail("F3_S4_V113_HTTP");
    const rpcId = await submitted.json();
    if (!isUuid(rpcId)) fail("F3_S4_V113_RESPONSE");
    await page.getByRole("status").filter({ hasText: "criada." }).waitFor({
      state: "visible",
      timeout: F3_S1_UI.timeout,
    });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId)
      fail("F3_S4_V113_UNCERTAIN");

    // Verifica o consumidor real de competências, não a resposta da própria mutação.
    const listed = page.waitForResponse(
      (r) => {
        const url = new URL(r.url());
        return (
          r.request().method() === "GET" &&
          url.origin === API_ORIGIN &&
          url.pathname === "/rest/v1/competencias" &&
          url.searchParams.get("id_contrato") === "eq." + contractId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.goto(HML_ORIGIN + "/contratos/" + contractId + "/competencias", {
      waitUntil: "networkidle",
    });
    const response = await listed;
    if (response.status() !== 200) fail("F3_S4_V113_READBACK");
    const id = assertF3S4CompetenceReadback({
      rows: await response.json(),
      rpcId,
      contractId,
      reference,
      query: new URL(response.url()),
    });
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: id, organizationId });
    book.assertIsolation();
    return id;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Uma confirmação incerta não autoriza novo envio de criar_competencia.
    }
    throw error;
  }
}

/** V116: a resposta de solicitação não comprova, sozinha, que a análise foi enfileirada.
 * Exigir uma leitura posterior do consumidor oficial, ancorada na mesma competência.
 * Não equivale a execução concluída do motor ou a PASS de qualquer caseId. */
export function assertF3S4AnalysisReadback({ before, after, rpcId, competenceId }) {
  if (
    !isUuid(rpcId) ||
    !isUuid(competenceId) ||
    before?.competencia?.id !== competenceId ||
    before.estado_analise !== "not_analyzed" ||
    before.execucao_atual !== null ||
    before.allowed_actions?.executar_analise !== true ||
    after?.competencia?.id !== competenceId ||
    !["queued", "processing", "complete"].includes(after.estado_analise) ||
    after.stale !== false ||
    after.execucao_atual?.id !== rpcId ||
    before.execucao_atual?.id === rpcId
  ) {
    fail("F3_S4_V116_READBACK");
  }
  return rpcId;
}

/** V116: aciona a UI nativa sob a cerca CDP e confirma pela RPC leitora da própria tela.
 * V113 deve ter criado a competência no livro isolado. W3 continuará obrigatório
 * posteriormente para qualquer prova dos consumidores V114/V117/V118/V119/V123. */
export async function f3S4RequestAnalysis({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  competenceId,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(organizationId) ||
    !isUuid(competenceId) ||
    book.organizationF3() !== organizationId ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === competenceId &&
          entry.organizationId === organizationId &&
          entry.kind === "registro" &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 14 &&
                q.kind === "principal" &&
                q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_S4_V116_PRECONDITION");
  }
  const readRpc = (response) =>
    response.request().method() === "POST" &&
    response.url() === API_ORIGIN + "/rest/v1/rpc/obter_analise_competencia_v116";
  const initial = page.waitForResponse(readRpc, { timeout: F3_S1_UI.timeout });
  await page.goto(HML_ORIGIN + "/competencias/" + competenceId + "/analise", {
    waitUntil: "networkidle",
  });
  const original = await initial;
  if (original.status() !== 200) fail("F3_S4_V116_INITIAL");
  const before = await original.json();
  if (
    before?.competencia?.id !== competenceId ||
    before.estado_analise !== "not_analyzed" ||
    before.execucao_atual !== null ||
    before.allowed_actions?.executar_analise !== true
  ) {
    fail("F3_S4_V116_PRECONDITION");
  }
  const button = page.getByRole("button", { name: "Executar análise", exact: true });
  await button.waitFor({ state: "visible", timeout: F3_S1_UI.timeout });
  await fence.drain();
  fence.assertSafe();
  const payload = { p_id_competencia: competenceId, p_tipo: "completa" };
  const requestId = mutationFence.arm({ producerOrder: 16, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/solicitar_analise_competencia",
      { timeout: F3_S1_UI.timeout },
    );
    const fresh = page.waitForResponse(readRpc, { timeout: F3_S1_UI.timeout });
    await button.click();
    const submitted = await posted;
    if (submitted.status() !== 200) fail("F3_S4_V116_HTTP");
    const rpcId = await submitted.json();
    if (!isUuid(rpcId)) fail("F3_S4_V116_RESPONSE");
    const read = await fresh;
    if (read.status() !== 200) fail("F3_S4_V116_READBACK");
    const id = assertF3S4AnalysisReadback({
      before,
      after: await read.json(),
      rpcId,
      competenceId,
    });
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_S4_V116_UNCERTAIN");
    }
    book.confirm(requestId, { entityId: id, organizationId });
    book.assertIsolation();
    return id;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Não reenviar execução incerta: primeiro confirmar com leitura autoritativa.
    }
    throw error;
  }
}

/** V117: conferir a resposta RPC com o comando e o contexto que a UI realmente leu.
 * Esta verificação de contrato NÃO substitui execução integrada de seus cinco caseIds.
 * O resultado só é correlacionado; não é uma aprovação funcional nem certificado CODE. */
export function assertF3V117ReviewReceipt({
  context,
  command,
  result,
  organizationId,
  contractId,
  competenceId,
  requirementId,
  documentVersionId,
}) {
  const invalid = () => fail("F3_V117_RECEIPT_MISMATCH");
  const required = [
    "p_id_competencia",
    "p_id_requisito",
    "p_id_execucao_esperada",
    "p_id_resultado_esperado",
    "p_hash_esperado",
    "p_resultado",
    "p_justificativa",
    "p_fundamento",
    "p_evidencias",
    "p_request_id",
  ];
  if (
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    !isUuid(competenceId) ||
    !isUuid(requirementId) ||
    !isUuid(documentVersionId) ||
    !context ||
    typeof context !== "object" ||
    context.schema_versao !== "revisao-v117" ||
    context.id_organizacao !== organizationId ||
    context.id_contrato !== contractId ||
    context.id_competencia !== competenceId ||
    context.id_requisito !== requirementId ||
    context.pode_revisar !== true ||
    !isUuid(context.id_execucao_esperada) ||
    !(context.id_resultado_esperado === null || isUuid(context.id_resultado_esperado)) ||
    !/^[a-f0-9]{64}$/i.test(context.hash_esperado ?? "") ||
    !command ||
    typeof command !== "object" ||
    Array.isArray(command) ||
    Object.keys(command).length !== required.length ||
    required.some((key) => !Object.hasOwn(command, key)) ||
    command.p_id_competencia !== competenceId ||
    command.p_id_requisito !== requirementId ||
    command.p_id_execucao_esperada !== context.id_execucao_esperada ||
    command.p_id_resultado_esperado !== context.id_resultado_esperado ||
    command.p_hash_esperado !== context.hash_esperado ||
    command.p_resultado !== "conforme" ||
    typeof command.p_justificativa !== "string" ||
    command.p_justificativa.trim().length < 3 ||
    typeof command.p_fundamento !== "string" ||
    !isUuid(command.p_request_id) ||
    command.p_request_id === context.id_execucao_esperada ||
    command.p_request_id === documentVersionId ||
    !Array.isArray(command.p_evidencias) ||
    command.p_evidencias.length !== 1 ||
    command.p_evidencias[0]?.id_versao_documento !== documentVersionId ||
    !result ||
    typeof result !== "object" ||
    result.schema_versao !== "revisao-v117" ||
    result.request_id !== command.p_request_id ||
    result.id_competencia !== competenceId ||
    result.id_requisito !== requirementId ||
    !isUuid(result.id_execucao) ||
    !isUuid(result.id_resultado) ||
    result.id_execucao === context.id_execucao_esperada ||
    (context.id_resultado_esperado !== null &&
      result.id_resultado === context.id_resultado_esperado)
  ) {
    invalid();
  }
  return Object.freeze({
    state: "CONTRACT_CORRELATED_NOT_CERTIFIED",
    requestId: command.p_request_id,
    executionId: result.id_execucao,
    resultId: result.id_resultado,
  });
}

/** C0458 (V117 -> V116): vínculo entre recibo novo e resultado observado.
 * Este verificador roda sobre respostas do consumidor oficial: não cria nem substitui
 * a execução de UI, a prova dos perfis MASTER/leitor ou o certificado CODE. */
export function assertF3V117V116ConsumerReadback({
  receipt,
  before,
  after,
  competenceId,
  requirementId,
}) {
  const invalid = () => fail("F3_V117_V116_CONSUMER_MISMATCH");
  if (
    !isUuid(competenceId) ||
    !isUuid(requirementId) ||
    !isUuid(receipt?.executionId) ||
    !isUuid(receipt?.resultId) ||
    receipt?.state !== "CONTRACT_CORRELATED_NOT_CERTIFIED" ||
    before?.competencia?.id !== competenceId ||
    after?.competencia?.id !== competenceId ||
    after?.estado_analise !== "complete" ||
    after?.stale !== false ||
    after?.execucao_atual?.id !== receipt.executionId ||
    !Array.isArray(after?.resultados) ||
    before?.execucao_atual?.id === receipt.executionId
  ) {
    invalid();
  }
  const matches = after.resultados.filter((row) => row?.id_requisito === requirementId);
  if (
    matches.length !== 1 ||
    matches[0].id_resultado !== receipt.resultId ||
    matches[0].resultado !== "conforme"
  ) {
    invalid();
  }
  return Object.freeze({
    state: "CONSUMER_CODE_CONTRACT_NOT_CERTIFIED",
    caseId: "IFV1-F3-C0458",
    competenceId,
    requirementId,
    executionId: receipt.executionId,
    resultId: receipt.resultId,
  });
}

/** C0455 / C0463: visão geral após V117 invalida os portões anteriores.
 * A tela de origem distingue os caseIds; a RPC consumidora é a mesma V114.
 * Contrato CODE não comprova execução dos dois perfis nem libera o ledger. */
export function assertF3V117OverviewConsumer({
  before,
  after,
  organizationId,
  contractId,
  competenceId,
  caseId,
}) {
  if (
    !["IFV1-F3-C0455", "IFV1-F3-C0463"].includes(caseId) ||
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    !isUuid(competenceId) ||
    before?.competencia?.id !== competenceId ||
    before.competencia.id_organizacao !== organizationId ||
    before.competencia.id_contrato !== contractId ||
    after?.competencia?.id !== competenceId ||
    after.competencia.id_organizacao !== organizationId ||
    after.competencia.id_contrato !== contractId ||
    after.portao?.liberado !== false ||
    after.blocking_summary?.parecer_aprovado !== false ||
    after.blocking_summary?.aprovacao_apresentacao_atual !== false ||
    after.allowed_actions?.apresentar !== false
  ) {
    fail("F3_V117_OVERVIEW_CONSUMER_MISMATCH");
  }
  return Object.freeze({
    state: "CONSUMER_CODE_CONTRACT_NOT_CERTIFIED",
    caseId,
    competenceId,
  });
}

/** C0461: a revisão substitui pareceres antigos, nunca produz aprovação nova. */
export function assertF3V117OpinionsConsumer({
  before,
  after,
  organizationId,
  contractId,
  competenceId,
}) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    !isUuid(competenceId) ||
    !Array.isArray(before) ||
    !Array.isArray(after) ||
    before.some(
      (row) =>
        !isUuid(row?.id) ||
        row.id_organizacao !== organizationId ||
        row.id_contrato !== contractId ||
        row.id_competencia !== competenceId,
    ) ||
    after.some(
      (row) =>
        !isUuid(row?.id) ||
        row.id_organizacao !== organizationId ||
        row.id_contrato !== contractId ||
        row.id_competencia !== competenceId,
    ) ||
    new Set(after.map((row) => row.id)).size !== after.length ||
    after.some((row) => row.status === "aprovado")
  ) {
    fail("F3_V117_OPINION_CONSUMER_MISMATCH");
  }
  const oldApproved = before.filter(
    (row) => row.status === "aprovado" || row.status === "rascunho",
  );
  if (
    oldApproved.some(
      (row) =>
        after.filter((later) => later.id === row.id && later.status === "substituido").length !== 1,
    )
  ) {
    fail("F3_V117_OPINION_CONSUMER_MISMATCH");
  }
  return Object.freeze({
    state: "CONSUMER_CODE_CONTRACT_NOT_CERTIFIED",
    caseId: "IFV1-F3-C0461",
    competenceId,
    replaced: oldApproved.length,
  });
}

/** C0465: prova de payload do evento, não prova autenticada RBAC do leitor.
 * O contrato da superfície de auditoria exige DENY para leitor no catálogo. */
export function assertF3V117AuditConsumer({
  events,
  receipt,
  organizationId,
  queryOrganizationId,
}) {
  if (
    !isUuid(organizationId) ||
    queryOrganizationId !== organizationId ||
    !isUuid(receipt?.resultId) ||
    !Array.isArray(events) ||
    events.filter(
      (row) =>
        row?.evento === "RevisaoRequisitoRegistrada" &&
        row.entidade === "resultados_requisitos" &&
        row.id_entidade === receipt.resultId &&
        isUuid(row.id) &&
        typeof row.correlation_id === "string" &&
        row.correlation_id.length > 0,
    ).length !== 1
  ) {
    fail("F3_V117_AUDIT_CONSUMER_MISMATCH");
  }
  return Object.freeze({
    state: "CONSUMER_CODE_CONTRACT_NOT_CERTIFIED",
    caseId: "IFV1-F3-C0465",
    auditRoleContract: Object.freeze({ master: "ALLOW", leitor: "DENY" }),
    resultId: receipt.resultId,
  });
}

/**
 * SYS04 preferência: estado local de navegação, jamais prova de autorização/RLS.
 * Lê a escolha que a tela realmente persistiu, em vez de inferir pelo clique.
 */
export function assertF3S1PreferenceReadback({ value, userId, organizationId }) {
  if (
    !isUuid(userId) ||
    !isUuid(organizationId) ||
    value?.idUsuario !== userId ||
    value?.idOrganizacao !== organizationId
  ) {
    fail("F3_SYS04_PREFERENCE_READBACK");
  }
  return organizationId;
}
export async function f3S1SelectPreference({ page, fence, book, userId, organizationId, name }) {
  if (
    !page ||
    !fence ||
    !BOOKS.has(book) ||
    !isUuid(userId) ||
    !isUuid(organizationId) ||
    organizationId !== book.organizationF3() ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    fail("F3_SYS04_PREFERENCE_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/selecionar-organizacao", { waitUntil: "networkidle" });
  const radio = page.getByRole("radio").filter({ hasText: name });
  if ((await radio.count()) !== 1) fail("F3_SYS04_PREFERENCE_CARD");
  await fence.drain();
  fence.assertSafe();
  await radio.click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL((url) => url.origin === HML_ORIGIN && url.pathname === "/");
  const stored = await page.evaluate(() =>
    sessionStorage.getItem("contaos.preferenciaOrganizacao"),
  );
  let value;
  try {
    value = JSON.parse(stored);
  } catch {
    fail("F3_SYS04_PREFERENCE_READBACK");
  }
  assertF3S1PreferenceReadback({ value, userId, organizationId });
  await fence.drain();
  fence.assertSafe();
  book.assertIsolation();
  return organizationId;
}

/** A aplicabilidade V107 só pode ser salva depois de fonte, versão e aprovação no livro. */
export function assertF3S3ApplicabilityReadback({ before, after, versionId }) {
  if (
    !isUuid(versionId) ||
    (before !== null && before?.id_fonte_versao !== versionId) ||
    after?.id_fonte_versao !== versionId ||
    after.aplicavel !== true ||
    typeof after.atualizado_em !== "string" ||
    !after.atualizado_em ||
    after.atualizado_em === before?.atualizado_em
  ) {
    fail("F3_V107_APPLICABILITY_READBACK");
  }
  return versionId;
}
export async function f3S3SetApplicability({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
  versionId,
  versionNumber,
  before,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    organizationId !== book.organizationF3() ||
    !isUuid(contractId) ||
    !isUuid(versionId) ||
    !Number.isSafeInteger(versionNumber) ||
    versionNumber < 1 ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === versionId &&
          entry.organizationId === organizationId &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 10 &&
                q.action === "versao" &&
                q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_V107_APPLICABILITY_PRECONDITION");
  }
  if (before !== null && before?.id_fonte_versao !== versionId) {
    fail("F3_V107_APPLICABILITY_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/contratos/" + contractId + "/base-normativa", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", {
      name: "Definir aplicabilidade da versão " + versionNumber,
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Aplicável", { exact: true }).check();
  await dialog.getByLabel("Fundamento").fill("Teste funcional isolado F3 CODE");
  await fence.drain();
  fence.assertSafe();
  const body = {
    p_id_organizacao: organizationId,
    p_id_contrato: contractId,
    p_id_versao: versionId,
    p_aplicavel: true,
    p_fundamento: "Teste funcional isolado F3 CODE",
    p_atualizado_em_esperado: before?.atualizado_em ?? null,
    p_chave_idempotencia: f3Slot("uuid", "v107_aplicabilidade"),
  };
  const requestId = mutationFence.arm({ producerOrder: 10, bodies: [body] });
  try {
    const posted = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/definir_aplicabilidade_fonte_v107",
      { timeout: F3_S1_UI.timeout },
    );
    await dialog.getByRole("button", { name: "Salvar aplicabilidade", exact: true }).click();
    const response = await posted;
    if (response.status() !== 200) fail("F3_V107_APPLICABILITY_HTTP");
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_V107_APPLICABILITY_UNCERTAIN");
    }
    const listed = page.waitForResponse(
      (r) => {
        const u = new URL(r.url());
        return (
          r.request().method() === "GET" &&
          u.origin === API_ORIGIN &&
          u.pathname === "/rest/v1/aplicabilidades_fonte" &&
          u.searchParams.get("id_contrato") === "eq." + contractId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.reload({ waitUntil: "networkidle" });
    const listResponse = await listed;
    if (listResponse.status() !== 200) fail("F3_V107_APPLICABILITY_READBACK");
    const rows = await listResponse.json();
    const relevant = Array.isArray(rows)
      ? rows.filter((row) => row?.id_fonte_versao === versionId)
      : [];
    if (relevant.length !== 1) fail("F3_V107_APPLICABILITY_READBACK");
    assertF3S3ApplicabilityReadback({ before, after: relevant[0], versionId });
    if (!isUuid(relevant[0].id)) fail("F3_V107_APPLICABILITY_READBACK");
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: relevant[0].id, organizationId });
    book.assertIsolation();
    return relevant[0].id;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Falha incerta: nenhuma repetição com outra chave.
    }
    throw error;
  }
}

/** V118: aprovação é sobre o parecer real do job e exige leitura posterior. */
export function assertF3S5OpinionReadback({ before, after, opinionId, competenceId }) {
  if (
    !isUuid(opinionId) ||
    !isUuid(competenceId) ||
    before?.id !== opinionId ||
    before.id_competencia !== competenceId ||
    before.status === "aprovado" ||
    after?.id !== opinionId ||
    after.id_competencia !== competenceId ||
    after.status !== "aprovado" ||
    !after.aprovado_em ||
    after.versao < before.versao
  ) {
    fail("F3_V118_OPINION_READBACK");
  }
  return opinionId;
}
export async function f3S5ApproveOpinion({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  competenceId,
  opinionId,
  before,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    organizationId !== book.organizationF3() ||
    !isUuid(competenceId) ||
    !isUuid(opinionId) ||
    before?.id !== opinionId ||
    before.id_competencia !== competenceId ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === opinionId &&
          entry.organizationId === organizationId &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 18 &&
                q.action === "parecer" &&
                q.outcome === "confirmed",
            ),
      )
  ) {
    fail("F3_V118_OPINION_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/competencias/" + competenceId + "/parecer", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Aprovar parecer", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirmar aprovação" });
  await dialog.locator("#v118-fundamento").fill("Revisão técnica isolada F3 CODE");
  await fence.drain();
  fence.assertSafe();
  const payload = {
    p_id_parecer: opinionId,
    p_aprovar: true,
    p_fundamento: "Revisão técnica isolada F3 CODE",
  };
  const requestId = mutationFence.arm({ producerOrder: 18, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/aprovar_parecer_interno",
      { timeout: F3_S1_UI.timeout },
    );
    await dialog.getByRole("button", { name: "Confirmar decisão", exact: true }).click();
    if ((await posted).status() !== 200) fail("F3_V118_OPINION_HTTP");
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_V118_OPINION_UNCERTAIN");
    }
    const reread = page.waitForResponse(
      (response) => {
        const url = new URL(response.url());
        return (
          response.request().method() === "GET" &&
          url.origin === API_ORIGIN &&
          url.pathname === "/rest/v1/pareceres_internos" &&
          url.searchParams.get("id_competencia") === "eq." + competenceId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.reload({ waitUntil: "networkidle" });
    const response = await reread;
    if (response.status() !== 200) fail("F3_V118_OPINION_READBACK");
    const rows = await response.json();
    const matches = Array.isArray(rows) ? rows.filter((row) => row?.id === opinionId) : [];
    if (matches.length !== 1) fail("F3_V118_OPINION_READBACK");
    assertF3S5OpinionReadback({ before, after: matches[0], opinionId, competenceId });
    book.confirm(requestId, { entityId: opinionId, organizationId });
    book.assertIsolation();
    return requestId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Não repetir aprovação incerta.
    }
    throw error;
  }
}

/** V119 registra somente após a pré-aprovação de apresentação (V119, action aprovacao). */
export function hasF3V119PresentationApproval(requests) {
  return (
    Array.isArray(requests) &&
    requests.some(
      (q) => q?.producerOrder === 19 && q.action === "aprovacao" && q.outcome === "confirmed",
    )
  );
}

/** V119: registro gera um pacote novo e não é confirmação da aprovação anterior. */
export function assertF3S5PresentationReadback({ presentationId, rows, competenceId }) {
  if (
    !isUuid(presentationId) ||
    !isUuid(competenceId) ||
    !Array.isArray(rows) ||
    rows.filter((row) => row?.id === presentationId && row.id_competencia === competenceId)
      .length !== 1
  ) {
    fail("F3_V119_PRESENTATION_READBACK");
  }
  return presentationId;
}
export async function f3S5RegisterPresentation({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  competenceId,
  contractId,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    organizationId !== book.organizationF3() ||
    !isUuid(competenceId) ||
    !isUuid(contractId) ||
    !book
      .created()
      .some(
        (entry) =>
          entry.id === contractId &&
          entry.organizationId === organizationId &&
          book
            .summary()
            .requests.some(
              (q) =>
                q.requestId === entry.requestId &&
                q.producerOrder === 7 &&
                q.outcome === "confirmed",
            ),
      ) ||
    !hasF3V119PresentationApproval(book.summary().requests)
  ) {
    fail("F3_V119_PRESENTATION_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/competencias/" + competenceId + "/apresentar", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Registrar apresentação", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirmar envio ao contratante" });
  await fence.drain();
  fence.assertSafe();
  const payload = {
    p_id_competencia: competenceId,
    p_idempotency_key: f3Slot("uuid", "v119_presentation"),
  };
  const requestId = mutationFence.arm({ producerOrder: 19, bodies: [payload] });
  try {
    const posted = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/registrar_apresentacao",
      { timeout: F3_S1_UI.timeout },
    );
    await dialog.getByRole("button", { name: "Confirmar registro", exact: true }).click();
    const response = await posted;
    if (response.status() !== 200) fail("F3_V119_PRESENTATION_HTTP");
    const presentationId = await response.json();
    if (!isUuid(presentationId)) fail("F3_V119_PRESENTATION_RESPONSE");
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_V119_PRESENTATION_UNCERTAIN");
    }
    const listed = page.waitForResponse(
      (r) => {
        const url = new URL(r.url());
        return (
          r.request().method() === "GET" &&
          url.origin === API_ORIGIN &&
          url.pathname === "/rest/v1/apresentacoes_contratante" &&
          url.searchParams.get("id_competencia") === "eq." + competenceId &&
          url.searchParams.get("id_organizacao") === "eq." + organizationId &&
          url.searchParams.get("id_contrato") === "eq." + contractId
        );
      },
      { timeout: F3_S1_UI.timeout },
    );
    await page.goto(HML_ORIGIN + "/competencias/" + competenceId, {
      waitUntil: "networkidle",
    });
    const listedResponse = await listed;
    if (listedResponse.status() !== 200) fail("F3_V119_PRESENTATION_READBACK");
    assertF3S5PresentationReadback({
      presentationId,
      rows: await listedResponse.json(),
      competenceId,
    });
    book.confirm(requestId, { entityId: presentationId, organizationId });
    book.assertIsolation();
    return presentationId;
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Uma apresentação incerta não pode ser repetida com nova chave.
    }
    throw error;
  }
}

/** V108 — prova CODE do resultado publicado; não substitui UP e W1. */
export function assertF3V108ProposalReadback({ before, after, contractId, versionId }) {
  if (
    !isUuid(contractId) ||
    !isUuid(versionId) ||
    before?.id !== versionId ||
    before.id_contrato !== contractId ||
    before.situacao !== "rascunho" ||
    after?.id !== versionId ||
    after.id_contrato !== contractId ||
    after.situacao !== "publicada" ||
    after.hash !== before.hash ||
    !/^[a-f0-9]{64}$/i.test(after.hash ?? "") ||
    after.rubricas_count < 1 ||
    after.arquivo_origem?.status_seguranca !== "aprovado"
  ) {
    fail("F3_V108_PROPOSAL_READBACK");
  }
  return Object.freeze({ state: "CONTRACT_NOT_CERTIFIED", producerOrder: 9, versionId });
}

/** V108: publicação pela interface com mutação cercada e três readbacks autoritativos. */
export async function f3S3PublishProposal({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
  versionId,
  before,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(organizationId) ||
    organizationId !== book.organizationF3() ||
    !isUuid(contractId) ||
    !isUuid(versionId) ||
    before?.id !== versionId ||
    before.id_contrato !== contractId ||
    !isUuid(before.id_proposta) ||
    !isUuid(before.id_arquivo_origem) ||
    !Number.isSafeInteger(before.numero_versao) ||
    before.numero_versao < 1 ||
    before.situacao !== "rascunho" ||
    !SHA64.test(before.hash ?? "") ||
    before.arquivo_origem?.status_seguranca !== "aprovado" ||
    !book.created().some((entry) =>
      entry.id === versionId &&
      entry.organizationId === organizationId &&
      book.summary().requests.some((request) =>
        request.requestId === entry.requestId &&
        request.producerOrder === 9 &&
        request.kind === "prerequisito" &&
        request.action === "versao" &&
        request.outcome === "confirmed",
      ),
    )
  ) {
    fail("F3_V108_PUBLISH_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/contratos/" + contractId + "/orcamento", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", {
    name: "Ver rubricas da versão " + before.numero_versao,
    exact: true,
  }).click();
  await page.getByRole("button", { name: "Publicar versão", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const fundamento = "Publicação F3 isolada com versão e documento-base aprovados";
  await dialog.getByLabel("Fundamento da publicação").fill(fundamento);
  await dialog.getByRole("checkbox", {
    name: "Confirmo que revisei a versão e desejo publicá-la.",
  }).check();
  await fence.drain();
  fence.assertSafe();
  const requestId = mutationFence.arm({
    producerOrder: 9,
    bodies: [{
      p_id_organizacao: organizationId,
      p_id_versao: versionId,
      p_hash_esperado: before.hash,
      p_fundamento: fundamento,
      p_chave_idempotencia: f3Slot("uuid", "v108_publicar"),
    }],
  });
  try {
    const sent = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/publicar_versao_proposta_v108",
      { timeout: F3_S1_UI.timeout },
    );
    await dialog.getByRole("button", { name: "Confirmar publicação", exact: true }).click();
    if ((await sent).status() !== 200) fail("F3_V108_PUBLISH_HTTP");
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_V108_PUBLISH_UNCERTAIN");
    }
    const matchingGet = (table, field, value) => (response) => {
      if (response.request().method() !== "GET") return false;
      const url = new URL(response.url());
      return (
        url.origin === API_ORIGIN &&
        url.pathname === "/rest/v1/" + table &&
        url.searchParams.get(field) === "eq." + value
      );
    };
    const propostaPending = page.waitForResponse(
      matchingGet("propostas_orcamentarias", "id_contrato", contractId),
      { timeout: F3_S1_UI.timeout },
    );
    const versaoPending = page.waitForResponse(
      matchingGet("versoes_proposta", "id_proposta", before.id_proposta),
      { timeout: F3_S1_UI.timeout },
    );
    const rubricaPending = page.waitForResponse(
      matchingGet("linhas_orcamentarias", "id_versao_proposta", versionId),
      { timeout: F3_S1_UI.timeout },
    );
    const arquivoPending = page.waitForResponse((response) => {
      if (response.request().method() !== "GET") return false;
      const url = new URL(response.url());
      return (
        url.origin === API_ORIGIN &&
        url.pathname === "/rest/v1/arquivos" &&
        (url.searchParams.get("id") ?? "").includes(before.id_arquivo_origem)
      );
    }, { timeout: F3_S1_UI.timeout });
    await page.reload({ waitUntil: "networkidle" });
    const observed = await Promise.all([
      propostaPending,
      versaoPending,
      rubricaPending,
      arquivoPending,
    ]);
    if (observed.some((response) => response.status() !== 200)) {
      fail("F3_V108_PUBLISH_READBACK");
    }
    const [propostas, versoes, rubricas, arquivos] = await Promise.all(
      observed.map((response) => response.json()),
    );
    if (
      ![propostas, versoes, rubricas, arquivos].every(Array.isArray) ||
      propostas.filter((row) =>
        row?.id === before.id_proposta &&
        row.id_contrato === contractId &&
        row.id_organizacao === organizationId,
      ).length !== 1
    ) {
      fail("F3_V108_PUBLISH_READBACK");
    }
    const matchingVersions = versoes.filter((row) =>
      row?.id === versionId &&
      row.id_proposta === before.id_proposta &&
      row.id_arquivo_origem === before.id_arquivo_origem,
    );
    // A projeção real COLUNAS_ARQUIVO não contém id_organizacao/id_contrato.
    // A origem do arquivo é vinculada pela versão da proposta, cuja organização
    // e contrato foram comprovados no readback da proposta acima.
    const matchingFiles = arquivos.filter((row) =>
      row?.id === before.id_arquivo_origem,
    );
    if (matchingVersions.length !== 1 || matchingFiles.length !== 1 || rubricas.length < 1) {
      fail("F3_V108_PUBLISH_READBACK");
    }
    assertF3V108ProposalReadback({
      before,
      after: {
        ...matchingVersions[0],
        id_contrato: contractId,
        rubricas_count: rubricas.filter((row) => row?.id_versao_proposta === versionId).length,
        arquivo_origem: matchingFiles[0],
      },
      contractId,
      versionId,
    });
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: versionId, organizationId });
    book.assertIsolation();
    return Object.freeze({ requestId, versionId, state: "UI_OBSERVED_NOT_CERTIFIED" });
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Readback incerto não autoriza nova publicação com outra chave.
    }
    throw error;
  }
}

/** V109 — lista só libera o snapshot após uma versão publicada e item material válido. */
export function assertF3V109ListReadback({ before, after, organizationId, contractId, listId }) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    !isUuid(listId) ||
    before?.id === undefined ||
    before.id !== listId ||
    before.id_organizacao !== organizationId ||
    before.id_contrato !== contractId ||
    after?.id !== listId ||
    after.id_organizacao !== organizationId ||
    after.id_contrato !== contractId ||
    after.versao_registro <= before.versao_registro ||
    !isUuid(after.id_versao_publicada) ||
    !Array.isArray(after.itens) ||
    !after.itens.some(
      (item) =>
        item.obrigatorio === true &&
        item.aplicavel === true &&
        isUuid(item.id_fonte_versao) &&
        item.regra_validacao?.documento?.obrigatorio === true,
    )
  ) {
    fail("F3_V109_LIST_READBACK");
  }
  return Object.freeze({ state: "CONTRACT_NOT_CERTIFIED", producerOrder: 11, listId });
}

/** V109: resultado do comando conferido contra uma segunda consulta do produto. */
export function assertF3S3ListCreationReadback({
  receipt,
  snapshot,
  organizationId,
  contractId,
  name,
}) {
  if (
    !isUuid(organizationId) ||
    !isUuid(contractId) ||
    typeof name !== "string" ||
    !name.trim() ||
    receipt?.schema_versao !== "crud-lista-v1" ||
    receipt.acao !== "criar_lista" ||
    receipt.id_organizacao !== organizationId ||
    receipt.id_contrato !== contractId ||
    !isUuid(receipt.request_id) ||
    !isUuid(receipt.lista?.id) ||
    receipt.lista.id_organizacao !== organizationId ||
    receipt.lista.id_contrato !== contractId ||
    receipt.lista.nome !== name ||
    !isUuid(receipt.id_versao) ||
    snapshot?.schema_versao !== "crud-lista-v1" ||
    snapshot.id_organizacao !== organizationId ||
    snapshot.id_contrato !== contractId ||
    snapshot.lista?.id !== receipt.lista.id ||
    snapshot.lista.nome !== name ||
    snapshot.lista.id_organizacao !== organizationId ||
    snapshot.lista.id_contrato !== contractId ||
    snapshot.versao?.id !== receipt.id_versao ||
    snapshot.versao.id_lista !== receipt.lista.id ||
    snapshot.versao.id_organizacao !== organizationId ||
    snapshot.versao.id_contrato !== contractId ||
    snapshot.total_versoes < 1
  ) {
    fail("F3_V109_CREATE_READBACK");
  }
  return Object.freeze({
    state: "UI_OBSERVED_NOT_CERTIFIED",
    listId: receipt.lista.id,
    versionId: receipt.id_versao,
    requestId: receipt.request_id,
  });
}

/** Criar lista pela UI real, com cerca do comando e leitura posterior da RPC consumidora. */
export async function f3S3CreateList({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
  name,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    book.organizationF3() !== organizationId ||
    !isUuid(contractId) ||
    typeof name !== "string" ||
    name !== "ContaOS HML F3 " + book.provenance().workflowRunId + " Lista" ||
    !book.created().some((item) =>
      item.id === contractId &&
      item.organizationId === organizationId &&
      book.summary().requests.some(
        (r) => r.requestId === item.requestId && r.producerOrder === 7 &&
          r.outcome === "confirmed",
      ),
    )
  ) {
    fail("F3_V109_CREATE_PRECONDITION");
  }
  await page.goto(HML_ORIGIN + "/contratos/" + contractId + "/regras", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Gerenciar listas", exact: true }).click();
  const panel = page.getByRole("region", { name: "Gestão de listas" });
  await panel.getByRole("button", { name: "Criar lista", exact: true }).click();
  await panel.getByLabel("Nome", { exact: true }).fill(name);
  const motive = "Criação isolada de lista e leitura do consumidor V109";
  await panel.getByLabel("Motivo", { exact: true }).fill(motive);
  await panel.getByRole("button", { name: "Revisar operação", exact: true }).click();
  await fence.drain();
  fence.assertSafe();
  const intent = mutationFence.arm({
    producerOrder: 11,
    bodies: [{
      p_id_organizacao: organizationId,
      p_id_contrato: contractId,
      p_id_lista: null,
      p_versao_esperada: null,
      p_acao: "criar_lista",
      p_payload: { nome: name, descricao: null, vigencia_inicio: null, vigencia_fim: null },
      p_motivo: motive,
      p_request_id: f3Slot("uuid", "v109_criar"),
    }],
  });
  try {
    const posted = page.waitForResponse(
      (response) => response.url() === API_ORIGIN +
        "/rest/v1/rpc/executar_comando_lista_v1" &&
        response.request().method() === "POST",
      { timeout: F3_S1_UI.timeout },
    );
    const readback = page.waitForResponse(
      (response) => response.url() === API_ORIGIN +
        "/rest/v1/rpc/obter_lista_operacional_v1" &&
        response.request().method() === "POST" &&
        (() => {
          try {
            const args = response.request().postDataJSON();
            return args.p_id_organizacao === organizationId &&
              args.p_id_contrato === contractId &&
              isUuid(args.p_id_lista);
          } catch {
            return false;
          }
        })(),
      { timeout: F3_S1_UI.timeout },
    );
    await panel.getByRole("button", { name: "Confirmar operação", exact: true }).click();
    const response = await posted;
    if (response.status() !== 200) fail("F3_V109_CREATE_HTTP");
    const cmd = response.request().postDataJSON();
    const receipt = await response.json();
    if (
      cmd?.p_id_contrato !== contractId ||
      cmd.p_id_organizacao !== organizationId ||
      cmd.p_acao !== "criar_lista" ||
      cmd.p_request_id !== receipt.request_id
    ) {
      fail("F3_V109_CREATE_RESPONSE");
    }
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== intent) {
      fail("F3_V109_CREATE_UNCERTAIN");
    }
    const observed = await readback;
    if (observed.status() !== 200) fail("F3_V109_CREATE_READBACK");
    const snapshot = await observed.json();
    const result = assertF3S3ListCreationReadback({
      receipt, snapshot, organizationId, contractId, name,
    });
    await fence.drain();
    fence.assertSafe();
    book.confirm(intent, { entityId: result.listId, organizationId });
    book.assertIsolation();
    return result;
  } catch (error) {
    try {
      if (book.state(intent) === "sealed") book.uncertain(intent);
    } catch {
      // Um comando incerto não pode ser repetido com nova chave.
    }
    throw error;
  }
}

/** V110 — arquivo confirmado não é prova de documento até leitura da nova versão. */
export function assertF3V110DocumentReadback({ after, contractId, fileId }) {
  if (
    !isUuid(contractId) ||
    !isUuid(fileId) ||
    !isUuid(after?.id) ||
    after.id_contrato !== contractId ||
    after.numero_versao !== 1 ||
    after.id_arquivo !== fileId ||
    !["pendente", "aprovado"].includes(after.status_seguranca)
  ) {
    fail("F3_V110_DOCUMENT_READBACK");
  }
  return Object.freeze({
    state: "CONTRACT_NOT_CERTIFIED",
    producerOrder: 12,
    documentId: after.id,
  });
}

/** V111 — incremento não pode substituir ou destruir a versão anterior. */
export function assertF3V111DocumentVersionReadback({ before, after, documentId, fileId }) {
  if (
    !isUuid(documentId) ||
    !isUuid(fileId) ||
    before?.id !== documentId ||
    after?.id !== documentId ||
    !Number.isSafeInteger(before.numero_versao) ||
    after.numero_versao !== before.numero_versao + 1 ||
    after.id_arquivo !== fileId ||
    before.id_arquivo === fileId ||
    !["pendente", "aprovado"].includes(after.status_seguranca)
  ) {
    fail("F3_V111_VERSION_READBACK");
  }
  return Object.freeze({ state: "CONTRACT_NOT_CERTIFIED", producerOrder: 13, documentId });
}

/** V115 — evidência do requisito deve pertencer à competência e à versão segura. */
export function assertF3V115CompetenceDocumentReadback({
  document,
  competenceId,
  requirementId,
  fileId,
}) {
  if (
    !isUuid(competenceId) ||
    !isUuid(requirementId) ||
    !isUuid(fileId) ||
    !isUuid(document?.id) ||
    document.id_competencia !== competenceId ||
    document.id_requisito !== requirementId ||
    document.id_arquivo !== fileId ||
    !["pendente", "aprovado"].includes(document.status_seguranca)
  ) {
    fail("F3_V115_COMPETENCE_DOCUMENT_READBACK");
  }
  return Object.freeze({
    state: "CONTRACT_NOT_CERTIFIED",
    producerOrder: 15,
    documentId: document.id,
  });
}

/** V117 — concatena os contratos CODE já integrados, nunca declara PASS de caso. */
export function assertF3V117DriverCodeContract({
  review,
  analysisBefore,
  analysisAfter,
  organizationId,
  contractId,
  competenceId,
  requirementId,
  documentVersionId,
}) {
  const receipt = assertF3V117ReviewReceipt({
    ...review,
    organizationId,
    contractId,
    competenceId,
    requirementId,
    documentVersionId,
  });
  const consumer = assertF3V117V116ConsumerReadback({
    receipt,
    before: analysisBefore,
    after: analysisAfter,
    competenceId,
    requirementId,
  });
  return Object.freeze({
    state: "CONTRACT_NOT_CERTIFIED",
    producerOrder: 17,
    requestId: receipt.requestId,
    resultId: consumer.resultId,
  });
}

/** V117: revisão pela UI e leitura posterior V116; não certifica caseId. */
export async function f3S4ReviewRequirement({
  page,
  fence,
  mutationFence,
  book,
  organizationId,
  contractId,
  competenceId,
  requirementId,
  requirementCode,
  documentVersionId,
  documentName,
  documentVersionNumber,
}) {
  if (
    !page ||
    !fence ||
    !mutationFence ||
    !BOOKS.has(book) ||
    !isUuid(organizationId) ||
    book.organizationF3() !== organizationId ||
    !isUuid(contractId) ||
    !isUuid(competenceId) ||
    !isUuid(requirementId) ||
    !isUuid(documentVersionId) ||
    typeof requirementCode !== "string" ||
    !requirementCode.trim() ||
    typeof documentName !== "string" ||
    !documentName.trim() ||
    !Number.isSafeInteger(documentVersionNumber) ||
    documentVersionNumber < 1 ||
    !book.created().some((entry) =>
      entry.id === competenceId &&
      entry.organizationId === organizationId &&
      book.summary().requests.some(
        (request) =>
          request.requestId === entry.requestId &&
          request.producerOrder === 14 &&
          request.outcome === "confirmed",
      ),
    ) ||
    !book.created().some((entry) =>
      entry.id === documentVersionId &&
      entry.organizationId === organizationId &&
      book.summary().requests.some(
        (request) =>
          request.requestId === entry.requestId &&
          request.producerOrder === 15 &&
          request.outcome === "confirmed",
      ),
    )
  ) {
    fail("F3_V117_UI_PRECONDITION");
  }
  const reading = (response) =>
    response.request().method() === "POST" &&
    response.url() === API_ORIGIN + "/rest/v1/rpc/obter_analise_competencia_v116";
  const initial = page.waitForResponse(reading, { timeout: F3_S1_UI.timeout });
  await page.goto(HML_ORIGIN + "/competencias/" + competenceId + "/analise", {
    waitUntil: "networkidle",
  });
  const initialResponse = await initial;
  if (initialResponse.status() !== 200) fail("F3_V117_UI_INITIAL");
  const analysisBefore = await initialResponse.json();
  if (
    analysisBefore?.competencia?.id !== competenceId ||
    analysisBefore.competencia.id_organizacao !== organizationId ||
    analysisBefore.competencia.id_contrato !== contractId ||
    analysisBefore.estado_analise !== "complete" ||
    analysisBefore.stale !== false ||
    !isUuid(analysisBefore.execucao_atual?.id)
  ) {
    fail("F3_V117_UI_PRECONDITION");
  }
  await page.getByRole("button", {
    name: "Abrir requisito " + requirementCode,
    exact: true,
  }).click();
  const editor = page.getByRole("region", { name: "Revisão humana do requisito" });
  const contextRead = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url() === API_ORIGIN + "/rest/v1/rpc/obter_contexto_revisao_v117",
    { timeout: F3_S1_UI.timeout },
  );
  await editor.getByRole("button", { name: "Revisar resultado", exact: true }).click();
  const contextResponse = await contextRead;
  if (contextResponse.status() !== 200) fail("F3_V117_UI_CONTEXT");
  const contextRequest = contextResponse.request().postDataJSON();
  if (
    contextRequest?.p_id_competencia !== competenceId ||
    contextRequest?.p_id_requisito !== requirementId
  ) {
    fail("F3_V117_UI_CONTEXT");
  }
  const context = await contextResponse.json();
  if (
    context?.schema_versao !== "revisao-v117" ||
    context.id_organizacao !== organizationId ||
    context.id_contrato !== contractId ||
    context.id_competencia !== competenceId ||
    context.id_requisito !== requirementId ||
    context.pode_revisar !== true ||
    context.id_execucao_esperada !== analysisBefore.execucao_atual.id
  ) {
    fail("F3_V117_UI_PRECONDITION");
  }
  await editor.getByLabel("Resultado da revisão").selectOption("conforme");
  const justificativa = "Revisão funcional F3 vinculada ao requisito e evidência aprovada";
  const fundamento = "Validação de integração F3 CODE";
  await editor.getByLabel("Justificativa da revisão").fill(justificativa);
  await editor.getByLabel("Fundamento da revisão").fill(fundamento);
  await editor.getByRole("checkbox", {
    name: "Selecionar " + documentName + " versão " + documentVersionNumber,
    exact: true,
  }).check();
  await editor.getByRole("button", { name: "Revisar e confirmar", exact: true }).click();
  await fence.drain();
  fence.assertSafe();
  const payload = {
    p_id_competencia: competenceId,
    p_id_requisito: requirementId,
    p_id_execucao_esperada: context.id_execucao_esperada,
    p_id_resultado_esperado: context.id_resultado_esperado,
    p_hash_esperado: context.hash_esperado,
    p_resultado: "conforme",
    p_justificativa: justificativa,
    p_fundamento: fundamento,
    p_evidencias: [{ id_versao_documento: documentVersionId }],
    p_request_id: f3Slot("uuid", "v117_review"),
  };
  const requestId = mutationFence.arm({ producerOrder: 17, bodies: [payload] });
  try {
    const sent = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url() === API_ORIGIN + "/rest/v1/rpc/registrar_revisao_requisito_v117",
      { timeout: F3_S1_UI.timeout },
    );
    await editor.getByRole("button", { name: "Confirmar revisão", exact: true }).click();
    const posted = await sent;
    if (posted.status() !== 200) fail("F3_V117_UI_HTTP");
    const command = posted.request().postDataJSON();
    const result = await posted.json();
    await fence.drain();
    fence.assertSafe();
    const settled = mutationFence.settle();
    if (!settled.sealed || !settled.complete || settled.requestId !== requestId) {
      fail("F3_V117_UI_UNCERTAIN");
    }
    const reread = page.waitForResponse(reading, { timeout: F3_S1_UI.timeout });
    await page.reload({ waitUntil: "networkidle" });
    const consumer = await reread;
    if (consumer.status() !== 200) fail("F3_V117_UI_READBACK");
    const correlated = assertF3V117DriverCodeContract({
      review: { context, command, result },
      analysisBefore,
      analysisAfter: await consumer.json(),
      organizationId,
      contractId,
      competenceId,
      requirementId,
      documentVersionId,
    });
    await fence.drain();
    fence.assertSafe();
    book.confirm(requestId, { entityId: correlated.resultId, organizationId });
    book.assertIsolation();
    return Object.freeze({
      state: "UI_OBSERVED_NOT_CERTIFIED",
      requestId,
      resultId: correlated.resultId,
    });
  } catch (error) {
    try {
      if (book.state(requestId) === "sealed") book.uncertain(requestId);
    } catch {
      // Resultado incerto: exige readback e nunca repete com outra chave.
    }
    throw error;
  }
}

/** V122 — só há relatório utilizável quando a ingestão foi vinculada ao arquivo seguro. */
export function assertF3V122HistoricalReadback({ before, after, reportId, fileId, executionId }) {
  if (
    !isUuid(reportId) ||
    !isUuid(fileId) ||
    !isUuid(executionId) ||
    before?.id_arquivo !== fileId ||
    before.status_seguranca !== "aprovado" ||
    after?.id !== reportId ||
    after.id_arquivo !== fileId ||
    after.id_execucao !== executionId ||
    !["enfileirada", "processando", "concluida"].includes(after.status_ingestao) ||
    after.processamento_documental !== "concluido"
  ) {
    fail("F3_V122_HISTORICAL_READBACK");
  }
  return Object.freeze({ state: "CONTRACT_NOT_CERTIFIED", producerOrder: 20, reportId });
}

/**
 * Liga o coletor CODE aos contratos exatos de cada caseId, sem atalhos por produtor.
 * Ausência de driver falha; verificador ausente jamais aprova um recibo.
 * Somente drivers reais geram provas. A coleta continua UNREVIEWED_NOT_CERTIFIED.
 */
export function bindF3CodeCaseDrivers({ catalogue, caseDrivers, caseVerifiers }) {
  if (
    !catalogue ||
    catalogue.count !== 138 ||
    !Array.isArray(catalogue.cases) ||
    catalogue.cases.length !== 138 ||
    !caseDrivers ||
    typeof caseDrivers !== "object" ||
    Array.isArray(caseDrivers) ||
    !caseVerifiers ||
    typeof caseVerifiers !== "object" ||
    Array.isArray(caseVerifiers)
  ) {
    fail("F3_CODE_DRIVER_REGISTRY");
  }
  const cases = new Map(catalogue.cases.map((c) => [c.caseId, c]));
  if (
    cases.size !== 138 ||
    Object.keys(caseDrivers).some((id) => !cases.has(id)) ||
    Object.keys(caseVerifiers).some((id) => !cases.has(id))
  ) {
    fail("F3_CODE_DRIVER_REGISTRY");
  }
  const assertCase = (c) => {
    const expected = cases.get(c?.caseId);
    if (!expected || canonicalJson(expected) !== canonicalJson(c)) {
      fail("F3_CODE_CASE_MISMATCH");
    }
  };
  return Object.freeze({
    executeCase: async (c) => {
      assertCase(c);
      const run = Object.getOwnPropertyDescriptor(caseDrivers, c.caseId)?.value;
      if (typeof run !== "function") fail("F3_DRIVER_PENDING");
      return run(Object.freeze(structuredClone(c)));
    },
    verifyCase: async (c, tests) => {
      assertCase(c);
      const verify = Object.getOwnPropertyDescriptor(caseVerifiers, c.caseId)?.value;
      if (typeof verify !== "function") return false;
      return (await verify(Object.freeze(structuredClone(c)), Object.freeze(structuredClone(tests)))) === true;
    },
    registeredCaseIds: Object.freeze(
      catalogue.cases
        .filter((c) =>
          typeof Object.getOwnPropertyDescriptor(caseDrivers, c.caseId)?.value === "function" &&
          typeof Object.getOwnPropertyDescriptor(caseVerifiers, c.caseId)?.value === "function",
        )
        .map((c) => c.caseId),
    ),
  });
}

/** Executor CODE, com validação do catálogo e dos recibos pelo coletor existente. */
export async function collectF3CodeCaseEvidence({
  catalogue,
  catalogueRaw,
  provenance,
  caseDrivers,
  caseVerifiers,
}) {
  const binding = bindF3CodeCaseDrivers({ catalogue, caseDrivers, caseVerifiers });
  return collectF3CodeEvidence({
    catalogue,
    catalogueRaw,
    provenance,
    executeCase: binding.executeCase,
    verifyCase: binding.verifyCase,
  });
}

async function pendingDriver() {
  fail("F3_DRIVER_PENDING");
}

// Prazo interno da sessão (parecer R2, grupo D), abaixo dos 45 minutos do PLAN 7.2 e do limite
// do job: o relatório parcial é gravado pelo próprio executor, nunca perdido num job morto.
const waitPolicy = (minutes, timeout, failure) =>
  Object.freeze({ timeoutMs: minutes * 60000, timeout, failure });
const verificationWait = waitPolicy(8, "F3_WAIT_VERIFICADOR_PRAZO", "F3_WAIT_VERIFICADOR_RECUSA");
export const F3_WAIT_POLICIES = Object.freeze({
  W1: verificationWait,
  W2: verificationWait,
  W3: waitPolicy(6, "F3_WAIT_ANALISE_PRAZO", "F3_WAIT_ANALISE_FALHA"),
  W4: waitPolicy(6, "F3_WAIT_PARECER_PRAZO", "F3_WAIT_PARECER_FALHA"),
  W5: waitPolicy(8, "F3_WAIT_PROCESSAMENTO_PRAZO", "F3_WAIT_PROCESSAMENTO_FALHA"),
});

/** Observa uma vez por leitura. O driver agenda novas observações apenas para PENDING. */
export async function observeF3Wait(waitId, sealedAt, read) {
  // O instante do selo vem do driver; um instante futuro estenderia o prazo e é recusado.
  if (
    !own(F3_WAIT_POLICIES, waitId) ||
    !Number.isFinite(sealedAt) ||
    sealedAt > performance.now() ||
    typeof read !== "function"
  )
    fail("F3_WAIT_INPUT");
  const policy = F3_WAIT_POLICIES[waitId];
  const deadline = sealedAt + policy.timeoutMs;
  const timedOut = { status: "BLOCKED", code: policy.timeout };
  if (performance.now() >= deadline) return timedOut;
  const state = await read();
  if (performance.now() >= deadline) return timedOut;
  if (state === "ready") return { status: "READY", code: null };
  if (state === "pending") return { status: "PENDING", code: null };
  if (state === "failed") return { status: "BLOCKED", code: policy.failure };
  fail("F3_WAIT_OBSERVATION");
}

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
    const result = await Promise.race([Promise.resolve().then(() => drive(book)), stop]);
    if (book.frozen()) fail("F3_FENCE_FROZEN");
    book.assertIsolation();
    // Um driver parcial (inclusive S1) nunca pode certificar os 138 casos.
    // O retorno completo deve trazer relatório validado pelo gate existente.
    if (result?.state !== "F3_COMPLETE" || !result.report) fail("F3_DRIVER_PENDING");
    // O relatório deve pertencer a ESTA execução, não a outro driver ou sessão anterior.
    // O livro é a fonte canônica de eventos, inventário e proveniência das mutações.
    if (
      JSON.stringify(result.report.provenance) !== JSON.stringify(book.provenance()) ||
      JSON.stringify(result.report.intents) !== JSON.stringify(book.summary()) ||
      result.report.isolation?.organizationF3 !== book.organizationF3() ||
      JSON.stringify(result.report.isolation?.created) !== JSON.stringify(book.created())
    )
      fail("F3_DRIVER_REPORT_MISMATCH");
    if (f3Gate(result.report, catalogue, { ledger }) !== "PASS") fail("F3_GATE_INCOMPLETE");
    return { code: "F3_COMPLETE", report: result.report };
  } catch (error) {
    let code = CODE.test(error?.code || "") ? error.code : "F3_FAILURE";
    // Congelamento por desvio da cerca é a causa, não o sintoma que o driver viu depois.
    if (book?.frozen() && !["F3_SESSION_DEADLINE", "F3_SESSION_ABORTED"].includes(code))
      code = BOOKS.get(book)().control.failure ?? "F3_FENCE_FROZEN";
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
    if (session.code === "F3_COMPLETE") {
      // O resultado aprovado é persistido antes de retornar sucesso ao workflow.
      await writeF3Artifacts(join(root, F3_ARTIFACT_DIR), session.report, catalogue, casesRaw, {
        ledger,
      });
      return true;
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

/**
 * Read-only R8 artifact inspection. No application imports, browser, Auth or SQL.
 * Contracts snapshot producer c32f51c9 and GATE467; GATE458 reader policy is preserved.
 */
import { createHash } from "node:crypto";
import {
  constants,
  lstatSync,
  openSync,
  fstatSync,
  closeSync,
  readSync,
  readdirSync,
  realpathSync,
  mkdirSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { isProxy } from "node:util/types";
import { pathToFileURL } from "node:url";

export const PIN = Object.freeze({
  repository: "contaos999999/contaos-hml-control",
  repositoryId: 1442722734,
  run: 42611391440,
  workflow: 411426169,
  head: "dea3ab73c9b47de1126054380b002c37b060ff84",
  upstream: 42611241610,
  artifact: 13670961904,
  size: 11240,
  name: "trilha-a-fixtures-42611391440-1",
  digest: "698e58fe9184b194cc1866b4c119d4df45ba23ccc5704665469a99793cce2fa9",
  tool: "d3f86a106a0bac45b974a628896c90dbdf5c8093",
  bundle: "374211f852b2a8155a0211c72e85dacc81bb69f3",
  frontend: "437c788e32f0325dd15c9d2e7277c10129bcb462",
  deployment: "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",
  organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
  contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
  source: "8b942e46-a29b-40d9-8ad4-04aaf9124a34",
});
export const FILES = Object.freeze([
  "receipts.json",
  "report.json",
  "receipts-r1.json",
  "recovery-r2.json",
  "receipts-r3.json",
  "recovery-r3.json",
  "receipts-r5.json",
  "recovery-r5.json",
  "receipts-r6.json",
  "recovery-r6.json",
  "recovery-r7.json",
]);
export const HISTORY = Object.freeze({
  "receipts-r1.json": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",
  "recovery-r2.json": "d4772f47294aefa08d3683c79156414d9f5984053ea2ffe0cd8360c082527d45",
  "receipts-r3.json": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",
  "recovery-r3.json": "db27ca1ab4a4ba6da14dab4c2879670e420c969fde183f0fd6730c654c197f4f",
  "receipts-r5.json": "fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb",
  "recovery-r5.json": "a92027cc0a7c9e2ce97f233c7aa1920205a158282ba6b955f7279cd9d8ae2dae",
  "receipts-r6.json": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  "recovery-r6.json": "98136adfe0c84c274ca31534b847b640a35f2577d2ad6197e451324a51ac7e03",
  "recovery-r7.json": "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e",
});
const HISTORICAL_IDS = new Set([
  "08141ffd-56c1-4c50-b58f-32912d1006b2",
  "437a3c66-4bed-45e3-b73e-8696bdf4a791",
  "309caf6c-5551-4e2b-ae33-4607a95ea025",
  "da4e924e-2ed1-4ccd-b847-fc95a44cc383",
  "31ddaf25-fb66-4cdc-be84-8612e77b17dc",
  "cf429997-d0b6-45bd-880a-be4b103f79bb",
  "499dc2a2-c0a2-4a19-9ccb-11c534096f7e",
  "655ae00f-ed36-4a13-a637-bc8b77375783",
]);
const SUBPHASES = new Set([
  "PREFLIGHT",
  "LOGIN",
  "SOURCE_AND_LIST",
  "COMPETENCIES",
  "FINAL_READBACK",
  "SOURCE_NAVIGATE",
  "SOURCE_GET",
  "SOURCE_VERSION_GET",
  "SOURCE_TEXT_PROOF",
  "SOURCE_RECONCILE",
  "SOURCE_VERSION_READ",
  "SOURCE_UI_CONTROL",
  "SOURCE_FORM_FIELD",
  "SOURCE_REGISTER_COMMAND",
  "SOURCE_APPROVE_COMMAND",
  "SOURCE_ACTIVATE_COMMAND",
  "SOURCE_SHEET_CLOSE",
  "SOURCE_REFRESH",
  "RECOVERY_READ",
  "RECOVERY_RETURN",
  "V109_NAVIGATE",
  "LIST_PANEL_OPEN",
  "LIST_GET",
  "LIST_MODEL_READ",
  "LIST_UI_CONTROL",
  "LIST_FORM_FIELD",
  "LIST_COMMAND",
  "LIST_REFRESH",
  "COMPETENCY_UI",
  "COMPETENCY_GET",
  "COMPETENCY_COMMAND",
  "COMPETENCY_RECONCILE",
  "UI_CONFIRM_FENCE",
  "UI_CONFIRM_CONTROL",
  "UI_CONFIRM_CLICK",
  "UI_CONFIRM_BEFORE",
  "UI_CONFIRM_AFTER",
  "RUNTIME_FRESH",
  "RUNTIME_NAVIGATE",
  "RUNTIME_CONTEXT",
  "RUNTIME_COMMAND",
  "LOGOUT",
  "CLEANUP",
  "SOURCE_NAVIGATION",
  "SOURCE_RECONCILIATION",
  "SOURCE_REGISTER",
  "SOURCE_REGISTER_READBACK",
  "SOURCE_APPROVAL",
  "SOURCE_APPROVAL_READBACK",
  "SOURCE_CLOSE",
  "SOURCE_VERIFICATION",
  "SOURCE_ACTIVATION",
  "SOURCE_ACTIVATION_READBACK",
  "LIST_NAVIGATION",
  "LIST_RECONCILIATION",
]);
const RPCS = new Set([
  "executar_comando_lista_v1",
  "criar_competencia",
  "criar_documento_competencia_v115",
  "solicitar_analise_competencia",
  "registrar_revisao_requisito_v117",
  "solicitar_parecer_interno",
  "aprovar_parecer_interno",
  "aprovar_apresentacao",
  "registrar_apresentacao",
]);
const FAILURES = new Set([
  "RECOVERY_R7_PROOF",
  "PREPARE_SECRET_ENV",
  "RECOVERY_R7_LEDGER",
  "RECOVERY_R6_LEDGER",
  "RECOVERY_R5_LEDGER",
  "RECOVERY_R4_PROOF",
  "RECOVERY_R3_LEDGER",
  "RECOVERY_SOURCE_INACTIVE",
  "FLOW_LIST_READBACK_VERSION",
  "OBSERVATION_MUTATION",
  "OBSERVATION_ORDINAL",
  "RECOVERY_LEDGER",
  "RECOVERY_STATE",
  "RECOVERY_LIST",
  "RECOVERY_READ_ONLY",
  "RECOVERY_PROOF",
  "RECOVERY_CONFIRMED_OPERATION",
  "DIAGNOSTIC_SUBPHASE",
  "DIAGNOSTIC_REENTRANT",
  "PREPARER_TIMEOUT",
  "PREPARER_CLEANUP",
  "BINDING_CODE",
  "BINDING_HASH",
  "BINDING_ID",
  "BINDING_PACKAGE",
  "BINDING_SCHEMA",
  "BODY_JSON",
  "BODY_LIMIT",
  "COMPETENCE_AMBIGUOUS",
  "COMPETENCE_ANALYSIS_DENIED",
  "COMPETENCE_ANALYSIS_FAILED",
  "COMPETENCE_ANALYSIS_RELATION",
  "COMPETENCE_APPROVED_FILE",
  "COMPETENCE_APPROVED_FILE_CONTEXT",
  "COMPETENCE_APPROVED_FILE_RELATION",
  "COMPETENCE_APPROVED_FILE_VERSION",
  "COMPETENCE_CONTEXT",
  "COMPETENCE_CONTROL_UNAVAILABLE",
  "COMPETENCE_CREATE_UNCERTAIN",
  "COMPETENCE_DEPENDENCY_BLOCKED",
  "COMPETENCE_DETAIL_RELATION",
  "COMPETENCE_DOCUMENT_AMBIGUOUS",
  "COMPETENCE_DOCUMENT_FAILED",
  "COMPETENCE_DOCUMENT_RELATION",
  "COMPETENCE_DOCUMENT_SHAPE",
  "COMPETENCE_EXISTING_REGISTRATION_LINK_UNAVAILABLE",
  "COMPETENCE_IO_CONFIGURATION",
  "COMPETENCE_LIST_NOT_ACTIVE",
  "COMPETENCE_MONTH",
  "COMPETENCE_OFFICIAL",
  "COMPETENCE_OPINION_AMBIGUOUS",
  "COMPETENCE_OPINION_FAILED",
  "COMPETENCE_OPINION_GATE",
  "COMPETENCE_OPINION_RELATION",
  "COMPETENCE_PACKAGE_EMPTY",
  "COMPETENCE_PACKAGE_ITEM_RELATION",
  "COMPETENCE_PACKAGE_RELATION",
  "COMPETENCE_PACKAGE_UNPROVEN",
  "COMPETENCE_PHASE_ABORTED",
  "COMPETENCE_PHASE_TIMEOUT",
  "COMPETENCE_PRESENTATION_GATE",
  "COMPETENCE_PRESENTATION_STATE",
  "COMPETENCE_READ_SHAPE",
  "COMPETENCE_REGISTER_GATE",
  "COMPETENCE_REGISTER_STATE_UNPROVEN",
  "COMPETENCE_REGISTER_UNCERTAIN",
  "COMPETENCE_RELATION",
  "COMPETENCE_REQUIREMENT_AMBIGUOUS",
  "COMPETENCE_REQUIREMENT_RULE",
  "COMPETENCE_RESULT_UNPROVEN",
  "COMPETENCE_REVIEW_CONTEXT",
  "COMPETENCE_REVIEW_DOCUMENT_VERSION",
  "COMPETENCE_REVIEW_EVIDENCE_AMBIGUOUS",
  "COMPETENCE_REVIEW_MATERIAL_UNPROVEN",
  "COMPETENCE_REVIEW_STALE",
  "COMPETENCE_RULE_UNPROVEN",
  "COMPETENCE_SNAPSHOT_SOURCE_RELATION",
  "COMPETENCE_SOURCE_ITEM",
  "COMPETENCE_SOURCE_LIST",
  "COMPETENCE_STALE_OBSERVATION",
  "COMPETENCE_TERMINAL",
  "DOCUMENT_CONFIGURATION",
  "DOCUMENT_RECONCILIATION",
  "DOCUMENT_REJECTED",
  "DOCUMENT_RUNTIME",
  "DOCUMENT_SESSION",
  "DOCUMENT_UNCERTAIN",
  "FLOW_ACTIVATE_DENIED",
  "FLOW_ACTIVE_NOT_READBACK",
  "FLOW_APPROVAL_NOT_READBACK",
  "FLOW_APPROVE_DENIED",
  "FLOW_BUTTON_UNAVAILABLE",
  "FLOW_CAPABILITY_OBSERVER_REQUIRED",
  "FLOW_CREATED_VERSION_NONUNIQUE",
  "FLOW_CREATED_VERSION_TEXT_MISMATCH",
  "FLOW_DUPLICATE_EQUIVALENT_VERSION",
  "FLOW_EQUIVALENT_VERSION_NONUNIQUE",
  "FLOW_FINAL_NOT_READY",
  "FLOW_LIST_CAPABILITY_DENIED",
  "FLOW_LIST_DUPLICATE",
  "FLOW_LIST_FORM_NONUNIQUE",
  "FLOW_LIST_STATE_MISMATCH",
  "FLOW_LIST_UI_MISSING",
  "FLOW_MODEL_CONTEXT",
  "FLOW_PAGE_LIMIT",
  "FLOW_PUBLICATION_NOT_READBACK",
  "FLOW_PUBLISHED_EMPTY_LIST",
  "FLOW_REGISTER_DENIED",
  "FLOW_ROW_ID",
  "FLOW_SOURCE_CAPABILITY_CONTEXT",
  "FLOW_SOURCE_CONTEXT",
  "FLOW_SOURCE_NONUNIQUE",
  "FLOW_SOURCE_NOT_IN_UI_GET",
  "FLOW_SOURCE_UI_MISSING",
  "FLOW_SOURCE_VERSION_MISMATCH",
  "FLOW_TXT_HASH",
  "FLOW_VERSION_CANDIDATE_UI_MISSING",
  "FLOW_VERSION_ID_HASH",
  "FLOW_VERSION_STATE",
  "FLOW_VERSION_TEXT_UI_MISSING",
  "FLOW_VERSION_TEXT_UNOBSERVED",
  "FLOW_VERSION_UI_MISSING",
  "FLOW_VERSION_READBACK_UNOBSERVED",
  "GATE_AMENDMENT",
  "INTENT_BUDGET",
  "INTENT_FROZEN",
  "INTENT_KEY",
  "INTENT_NOT_SENT",
  "INTENT_PAYLOAD",
  "INTENT_PENDING",
  "INTENT_PERSIST",
  "INTENT_PERSIST_REQUIRED",
  "INTENT_RESULT",
  "LOGIN_AUTH",
  "LOGIN_CONFIGURATION",
  "LOGIN_FAILED",
  "LOGIN_MASTER",
  "LOGOUT_FAILED",
  "OBSERVATION_ENDPOINT",
  "OBSERVATION_FAILED",
  "OBSERVATION_LIMIT",
  "OBSERVATION_METADATA",
  "OBSERVATION_RPC",
  "OBSERVATION_SCHEMA",
  "OBSERVATION_TABLE",
  "PHASE_CONFIGURATION",
  "PHASE_DENIED",
  "PHASE_TIMEOUT",
  "PREPARER_CAPABILITY",
  "PREPARER_CLI_USAGE",
  "PREPARER_CONTEXT",
  "PREPARER_IDENTITY",
  "PREPARER_INCOMPLETE",
  "PREPARER_MAIN_ONLY",
  "PREPARER_RECONCILIATION",
  "PREPARER_RESPONSE_UNCONFIRMED",
  "PREPARER_SCRIPT",
  "PREPARER_SPA_LINK",
  "PREPARER_SPA_PATH",
  "PREPARER_SSR_PATH",
  "RECEIPT_CONTEXT",
  "RECEIPT_HASH",
  "RECEIPT_IDENTITY",
  "RECEIPT_RPC",
  "RECEIPT_SCHEMA",
  "RECEIPT_STATE",
  "RECEIPT_UUID",
  "SESSION_CONTEXT",
  "UI_CAPABILITY",
  "UI_CONFIGURATION",
  "UI_RECONCILIATION",
  "UI_UNCERTAIN",
  "FENCE_ASYNC",
  "FENCE_BODY_LIMIT",
  "FENCE_CDP_CLOSED",
  "FENCE_CONFIGURATION",
  "FENCE_CONTEXT_FOREIGN",
  "FENCE_CONTEXT_UNKNOWN",
  "FENCE_DOCUMENT_BODY",
  "FENCE_DRAIN_TIMEOUT",
  "FENCE_HEADERS",
  "FENCE_INITIALIZATION",
  "FENCE_LIFECYCLE_FRAME",
  "FENCE_LIFECYCLE_NO_NETWORK",
  "FENCE_LIFECYCLE_TERMINAL",
  "FENCE_LIFECYCLE_TYPE",
  "FENCE_NOT_PROVEN",
  "FENCE_POPUP",
  "FENCE_READY",
  "FENCE_REDIRECT",
  "FENCE_REQUEST",
  "FENCE_REQUEST_LIFECYCLE",
  "FENCE_SOURCE",
  "FENCE_TARGET_DETACHED",
  "FENCE_TARGET_FAILED",
  "FENCE_TARGET_TIMEOUT",
  "FENCE_TRANSPORT",
  "FENCE_WORKER_PAUSED",
  "FENCE_WORKER_RUNNING",
  "PREPARER_UNCLASSIFIED",
]);
const NATIVE = new Set([
  "FENCE_ASYNC",
  "FENCE_BODY_LIMIT",
  "FENCE_CDP_CLOSED",
  "FENCE_CONFIGURATION",
  "FENCE_CONTEXT_FOREIGN",
  "FENCE_CONTEXT_UNKNOWN",
  "FENCE_DOCUMENT_BODY",
  "FENCE_DRAIN_TIMEOUT",
  "FENCE_HEADERS",
  "FENCE_INITIALIZATION",
  "FENCE_LIFECYCLE_FRAME",
  "FENCE_LIFECYCLE_NO_NETWORK",
  "FENCE_LIFECYCLE_TERMINAL",
  "FENCE_LIFECYCLE_TYPE",
  "FENCE_NOT_PROVEN",
  "FENCE_POPUP",
  "FENCE_READY",
  "FENCE_REDIRECT",
  "FENCE_REQUEST",
  "FENCE_REQUEST_LIFECYCLE",
  "FENCE_SOURCE",
  "FENCE_TARGET_DETACHED",
  "FENCE_TARGET_FAILED",
  "FENCE_TARGET_TIMEOUT",
  "FENCE_TRANSPORT",
  "FENCE_WORKER_PAUSED",
  "FENCE_WORKER_RUNNING",
]);
const CLEANUP = new Set([
  "LOGOUT_NOT_VERIFIED",
  "LOGOUT_FAILED",
  "RUNTIME_CLEAR_FAILED",
  "OBSERVER_CLOSE_FAILED",
  "FENCE_CLOSE_FAILED",
  "BROWSER_CLOSE_FAILED",
  "PROXY_CLOSE_FAILED",
]);
const PHASES = new Set(["PREFLIGHT", "LOGIN", "SOURCE_AND_LIST", "COMPETENCIES", "FINAL_READBACK"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HASH = /^[0-9a-f]{64}$/;
const bool = (v) => typeof v === "boolean";
const uuid = (v) => typeof v === "string" && UUID.test(v);
const hash = (v) => typeof v === "string" && HASH.test(v);
const integer = (v, lo, hi) => Number.isSafeInteger(v) && v >= lo && v <= hi;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function fail(code) {
  throw new Error(code);
}
function check(ok, code = "INSPECTION_SCHEMA") {
  if (!ok) fail(code);
}
function object(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function keys(v, names) {
  return (
    object(v) && Object.keys(v).length === names.length && names.every((k) => Object.hasOwn(v, k))
  );
}
function closed(v, required, optional = []) {
  return (
    object(v) &&
    required.every((k) => Object.hasOwn(v, k)) &&
    Object.keys(v).every((k) => required.includes(k) || optional.includes(k))
  );
}
// External test/API values cannot invoke getters or Proxy traps.
function plain(value, depth = 0, budget = { n: 0 }) {
  check(depth <= 24 && ++budget.n <= 32768);
  if (value === null || ["string", "boolean", "number"].includes(typeof value)) return value;
  check(typeof value === "object" && !isProxy(value));
  const proto = Object.getPrototypeOf(value);
  check(
    Array.isArray(value) ? proto === Array.prototype : proto === Object.prototype || proto === null,
  );
  const ds = Object.getOwnPropertyDescriptors(value);
  check(Reflect.ownKeys(ds).every((k) => typeof k === "string"));
  const out = Array.isArray(value) ? [] : Object.create(null);
  for (const [k, d] of Object.entries(ds)) {
    if (Array.isArray(value) && k === "length") continue;
    check(
      Object.hasOwn(d, "value") &&
        d.enumerable === true &&
        !["__proto__", "constructor", "prototype"].includes(k),
    );
    out[k] = plain(d.value, depth + 1, budget);
  }
  return out;
}
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function canonicalJson(bytes, kind = "report") {
  check(Buffer.isBuffer(bytes) && bytes.length <= 65536, "INSPECTION_JSON");
  let raw, value;
  try {
    raw = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    check(!raw.startsWith("\uFEFF"), "INSPECTION_JSON");
    value = JSON.parse(raw);
  } catch {
    fail("INSPECTION_JSON");
  }
  plain(value);
  const canonical =
    kind === "receipts" && Array.isArray(value?.receipts) && value.receipts.length === 0
      ? JSON.stringify(value) + "\n"
      : JSON.stringify(value, null, 2) + "\n";
  check(raw === canonical, "INSPECTION_CANONICAL");
  return { raw, value };
}
function identity(v) {
  return (
    v.frontendSha === PIN.frontend &&
    v.harnessSha === PIN.head &&
    v.deploymentId === PIN.deployment &&
    v.workflowRun === String(PIN.run)
  );
}
export function validateRecords(reportInput, receiptsInput) {
  const r = plain(reportInput),
    e = plain(receiptsInput);
  check(
    keys(r, [
      "schema",
      "failure",
      "diagnostics",
      "intentLedger",
      "recovery",
      "bindings",
      "frontendSha",
      "harnessSha",
      "deploymentId",
      "workflowRun",
      "phase",
      "completed",
      "logoutVerified",
      "ids",
      "v1Certified",
    ]),
  );
  check(
    r.schema === "contaos.fixture.preparation.v1" &&
      identity(r) &&
      PHASES.has(r.phase) &&
      bool(r.completed) &&
      bool(r.logoutVerified) &&
      r.v1Certified === false,
  );
  check(r.failure === null || FAILURES.has(r.failure));
  check(
    Array.isArray(r.ids) &&
      r.ids.length <= 32 &&
      r.ids.every(uuid) &&
      new Set(r.ids).size === r.ids.length,
  );
  const d = r.diagnostics;
  check(
    keys(d, [
      "primaryFailure",
      "failureClass",
      "errorName",
      "subphase",
      "subphasePath",
      "lastCompletedSubphase",
      "logoutAttempted",
      "logoutVerified",
      "cleanupFailure",
    ]),
  );
  check(d.primaryFailure === null || FAILURES.has(d.primaryFailure));
  check(
    d.failureClass === null ||
      ["NATIVE_FENCE", "TIMEOUT", "UNKNOWN", "PROTOCOL"].includes(d.failureClass),
  );
  check(
    d.errorName === null ||
      ["Error", "TypeError", "ReferenceError", "SyntaxError", "TimeoutError", "UNKNOWN"].includes(
        d.errorName,
      ),
  );
  check(
    SUBPHASES.has(d.subphase) &&
      (d.lastCompletedSubphase === null || SUBPHASES.has(d.lastCompletedSubphase)),
  );
  check(
    Array.isArray(d.subphasePath) &&
      d.subphasePath.length <= 12 &&
      d.subphasePath.every((x) => SUBPHASES.has(x)),
  );
  check(
    bool(d.logoutAttempted) &&
      bool(d.logoutVerified) &&
      d.logoutVerified === r.logoutVerified &&
      (d.cleanupFailure === null || CLEANUP.has(d.cleanupFailure)),
  );
  check(
    d.primaryFailure === null
      ? d.failureClass === null && d.errorName === null
      : d.failureClass !== null && d.errorName !== null,
  );
  if (d.primaryFailure !== null) {
    const expected = NATIVE.has(d.primaryFailure)
      ? "NATIVE_FENCE"
      : d.errorName === "TimeoutError"
        ? "TIMEOUT"
        : d.primaryFailure === "PREPARER_UNCLASSIFIED"
          ? "UNKNOWN"
          : "PROTOCOL";
    check(d.failureClass === expected && r.failure === d.primaryFailure);
  }
  check(!r.completed || (r.logoutVerified && d.cleanupFailure === null && r.failure === null));
  const ledger = r.intentLedger;
  if (ledger !== null) {
    check(
      keys(ledger, [
        "count",
        "frozen",
        "pending",
        "sent",
        "priorConfirmed",
        "newArmedCount",
        "maxIntentions",
        "maxNewIntentions",
      ]),
    );
    check(
      integer(ledger.count, 8, 24) &&
        ledger.priorConfirmed === 8 &&
        ledger.newArmedCount === ledger.count - 8 &&
        ledger.maxIntentions === 24 &&
        ledger.maxNewIntentions === 16,
    );
    check(
      bool(ledger.frozen) &&
        bool(ledger.pending) &&
        bool(ledger.sent) &&
        (!ledger.sent || ledger.pending),
    );
  }
  const q = r.recovery;
  check(
    keys(q, [
      "ledgerSha256",
      "priorWorkflowRun",
      "confirmedBefore",
      "maxNewIntentions",
      "r3ReceiptsSha256",
      "r3WorkflowRun",
      "r4ZeroAuth",
      "reconciled",
      "sourceVersion",
      "sourceHash",
    ]),
  );
  check(
    q.ledgerSha256 === HISTORY["receipts-r1.json"] &&
      q.priorWorkflowRun === "42540864527" &&
      q.confirmedBefore === 8 &&
      q.maxNewIntentions === 16 &&
      q.r3ReceiptsSha256 === HISTORY["receipts-r3.json"] &&
      q.r3WorkflowRun === "42559214436",
  );
  const z = q.r4ZeroAuth;
  check(
    keys(z, [
      "schema",
      "headSha",
      "upstreamRun",
      "fixturesRun",
      "auditRun",
      "attempt",
      "derivedNewBusinessIntents",
      "proof",
    ]),
  );
  check(
    z.schema === "contaos.fixture.recovery-r4.v1" &&
      z.headSha === "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72" &&
      z.upstreamRun === 42568309807 &&
      z.fixturesRun === 42568382053 &&
      z.auditRun === 42568382029 &&
      z.attempt === 1 &&
      z.derivedNewBusinessIntents === 0 &&
      z.proof === "GITHUB_ACTIONS_LIVE_METADATA",
  );
  check(
    bool(q.reconciled) &&
      (q.sourceVersion === null || uuid(q.sourceVersion)) &&
      (q.sourceHash === null || hash(q.sourceHash)),
  );
  check(
    q.reconciled
      ? uuid(q.sourceVersion) && hash(q.sourceHash)
      : q.sourceVersion === null && q.sourceHash === null,
  );
  if (q.reconciled)
    check(
      q.sourceVersion === "1ebbfd0b-c50c-405d-8806-321f18e179e0" &&
        q.sourceHash === "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1",
    );
  if (r.bindings !== null) {
    const b = r.bindings;
    check(
      b.sourceVersionId === "1ebbfd0b-c50c-405d-8806-321f18e179e0" &&
        b.listId === "bf71906b-87a4-42f5-8371-5f597ef2ad9b" &&
        b.listVersionId === "e49ef6dd-13b0-491d-8646-5a7bcd5298cf" &&
        b.itemId === "e7065876-a620-4dbb-9b4e-992fa4fead83",
    );
    check(
      closed(
        b,
        [
          "sourceVersionId",
          "listId",
          "listVersionId",
          "itemId",
          "organization",
          "contract",
          "source",
        ],
        ["competencies"],
      ),
    );
    check(
      ["sourceVersionId", "listId", "listVersionId", "itemId"].every((k) => uuid(b[k])) &&
        b.organization === PIN.organization &&
        b.contract === PIN.contract &&
        b.source === PIN.source,
    );
    if (q.reconciled) check(b.sourceVersionId === q.sourceVersion);
    if (Object.hasOwn(b, "competencies")) {
      check(Array.isArray(b.competencies) && b.competencies.length === 2);
      const months = new Set();
      for (const c of b.competencies) {
        check(
          closed(
            c,
            ["month", "state"],
            [
              "id",
              "requirementId",
              "documentId",
              "documentVersionId",
              "executionId",
              "opinionId",
              "presentationId",
              "packageId",
              "packageHash",
              "code",
            ],
          ),
        );
        check(["2026-09-01", "2026-10-01"].includes(c.month) && !months.has(c.month));
        months.add(c.month);
        check(
          ["partial", "pode_apresentar_contratante", "aguardando_contratante"].includes(c.state),
        );
        for (const k of [
          "id",
          "requirementId",
          "documentId",
          "documentVersionId",
          "executionId",
          "opinionId",
          "presentationId",
          "packageId",
        ])
          if (Object.hasOwn(c, k)) check(uuid(c[k]));
        if (Object.hasOwn(c, "packageHash")) check(hash(c.packageHash));
        if (Object.hasOwn(c, "code"))
          check(FAILURES.has(c.code) && c.code.startsWith("COMPETENCE_"));
        if (Object.hasOwn(c, "id"))
          check(
            c.id ===
              (c.month === "2026-09-01"
                ? "79bdc139-ed10-4c91-905e-b32b9a824d27"
                : "50c26274-a36f-48e0-b2fe-5a1caf5d6a49"),
          );
        if (c.state !== "partial") check(uuid(c.id));
        if (c.month === "2026-09-01" && c.state === "aguardando_contratante")
          check(uuid(c.presentationId) && uuid(c.packageId) && hash(c.packageHash));
      }
    }
  }
  const collected = [];
  const collect = (value) => {
    if (uuid(value)) collected.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (object(value)) Object.values(value).forEach(collect);
  };
  collect(r.bindings);
  check(equal(r.ids, [...new Set(collected)].slice(0, 32)));
  check(
    keys(e, ["schema", "receipts"]) &&
      e.schema === "contaos.fixture.receipts.v1" &&
      Array.isArray(e.receipts) &&
      e.receipts.length <= 32,
  );
  const seen = new Map();
  for (const row of e.receipts) {
    check(
      keys(row, [
        "frontendSha",
        "harnessSha",
        "deploymentId",
        "workflowRun",
        "schema",
        "rpc",
        "requestId",
        "state",
        "organization",
        "contract",
        "payloadSha256",
      ]),
    );
    check(
      identity(row) &&
        row.schema === "contaos.fixture.intent.v1" &&
        RPCS.has(row.rpc) &&
        uuid(row.requestId) &&
        !HISTORICAL_IDS.has(row.requestId) &&
        row.organization === PIN.organization &&
        row.contract === PIN.contract &&
        hash(row.payloadSha256),
    );
    check(["sealed", "confirmed", "uncertain", "denied", "stale", "partial"].includes(row.state));
    const before = seen.get(row.requestId);
    if (before)
      check(
        before.state === "sealed" &&
          row.state !== "sealed" &&
          equal({ ...before, state: row.state }, row),
      );
    else check(row.state === "sealed");
    seen.set(row.requestId, row);
  }
  check(seen.size <= 16 && (ledger !== null ? seen.size <= ledger.newArmedCount : seen.size === 0));
  return {
    report: r,
    receipts: e,
    observations: {
      priorConfirmed: 8,
      newArmedCount: ledger?.newArmedCount ?? "UNKNOWN",
      newConfirmed:
        ledger === null ||
        ledger.frozen ||
        ledger.pending ||
        ledger.sent ||
        seen.size !== ledger.newArmedCount ||
        [...seen.values()].some((x) => x.state !== "confirmed")
          ? "UNKNOWN"
          : [...seen.values()].filter((x) => x.state === "confirmed").length,
      logoutVerified: r.logoutVerified,
      bindings: r.bindings === null ? "UNKNOWN" : "PRESENT",
    },
  };
}
export function validateDownloadOutput(input) {
  const r = plain(input);
  check(
    keys(r, ["status", "stdout", "stderr"]) &&
      r.status === 0 &&
      typeof r.stdout === "string" &&
      typeof r.stderr === "string",
    "INSPECTION_DOWNLOAD",
  );
  check(
    Buffer.byteLength(r.stdout) + Buffer.byteLength(r.stderr) <= 1048576,
    "INSPECTION_DOWNLOAD",
  );
  const all = r.stdout + "\n" + r.stderr;
  check(
    !/::(?:warning|error)(?: |::)|digest validation failed|digestMismatch/i.test(all),
    "INSPECTION_DOWNLOAD",
  );
  const lines = all
    .split(/\r?\n/)
    .filter((x) => x.includes("SHA256 digest of downloaded artifact is"));
  check(
    lines.length === 1 && lines[0] === "SHA256 digest of downloaded artifact is " + PIN.digest,
    "INSPECTION_DIGEST",
  );
  return true;
}
export function validateMetadata(input) {
  const { run, upstream, artifact, artifacts, jobs } = plain(input);
  const repo = (r) =>
    r?.id === PIN.repositoryId &&
    r?.full_name === PIN.repository &&
    r?.owner?.login === "contaos999999" &&
    r?.owner?.id === 352205055;
  const runShape = (r, id, workflow, event, path, conclusion) =>
    r?.id === id &&
    r.workflow_id === workflow &&
    r.event === event &&
    r.path === path &&
    r.head_branch === "main" &&
    r.head_sha === PIN.head &&
    r.run_attempt === 1 &&
    r.status === "completed" &&
    r.conclusion === conclusion &&
    repo(r.repository) &&
    repo(r.head_repository);
  check(
    runShape(
      run,
      PIN.run,
      PIN.workflow,
      "workflow_run",
      ".github/workflows/contaos-trilha-a-fixtures.yml",
      "failure",
    ),
    "INSPECTION_METADATA",
  );
  check(
    runShape(
      upstream,
      PIN.upstream,
      406076025,
      "push",
      ".github/workflows/contaos-frontend-zero-drift.yml",
      "success",
    ),
    "INSPECTION_METADATA",
  );
  const art = (a) =>
    a?.id === PIN.artifact &&
    a.name === PIN.name &&
    a.size_in_bytes === PIN.size &&
    a.expired === false &&
    a.digest === "sha256:" + PIN.digest &&
    a.workflow_run?.id === PIN.run &&
    a.workflow_run.repository_id === PIN.repositoryId &&
    a.workflow_run.head_repository_id === PIN.repositoryId &&
    a.workflow_run.head_sha === PIN.head &&
    a.workflow_run.head_branch === "main";
  check(
    art(artifact) &&
      artifacts.total_count === 1 &&
      Array.isArray(artifacts.artifacts) &&
      artifacts.artifacts.length === 1 &&
      art(artifacts.artifacts[0]),
    "INSPECTION_METADATA",
  );
  const specs = [
    [129140419219, "Trilha A solicitacao unica sem credenciais", "success"],
    [129140421628, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
    [129140789918, "Trilha A preparacao sintetica HML", "failure"],
  ];
  check(
    jobs.total_count === 3 && Array.isArray(jobs.jobs) && jobs.jobs.length === 3,
    "INSPECTION_METADATA",
  );
  for (const [id, name, conclusion] of specs)
    check(
      jobs.jobs.filter(
        (j) =>
          j.id === id &&
          j.name === name &&
          j.conclusion === conclusion &&
          j.status === "completed" &&
          j.run_id === PIN.run &&
          j.run_attempt === 1 &&
          j.head_sha === PIN.head,
      ).length === 1,
      "INSPECTION_METADATA",
    );
  return true;
}
function sameStat(a, b) {
  return (
    a.dev === b.dev &&
    a.ino === b.ino &&
    a.size === b.size &&
    a.mode === b.mode &&
    a.mtimeMs === b.mtimeMs &&
    a.ctimeMs === b.ctimeMs
  );
}
export function readManifest(root, deadline = () => {}) {
  const dir = lstatSync(root);
  check(
    dir.isDirectory() && !dir.isSymbolicLink() && realpathSync(root) === root,
    "INSPECTION_FILES",
  );
  check(
    typeof constants.O_DIRECTORY === "number" && typeof constants.O_NOFOLLOW === "number",
    "INSPECTION_FILES",
  );
  const dirfd = openSync(root, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  try {
    check(sameStat(dir, fstatSync(dirfd)), "INSPECTION_FILES");
    // Linux fd anchor prevents a renamed/replaced parent path from redirecting reads.
    const anchored = "/proc/self/fd/" + dirfd;
    const names = readdirSync(anchored);
    check(
      names.length === 12 && names.every((n) => FILES.includes(n) || n === "SHA256SUMS"),
      "INSPECTION_FILES",
    );
    const buffers = {};
    let total = 0;
    for (const name of [...FILES, "SHA256SUMS"]) {
      deadline();
      const path = join(anchored, name),
        before = lstatSync(path);
      check(
        before.isFile() &&
          !before.isSymbolicLink() &&
          before.nlink === 1 &&
          before.size >= 0 &&
          before.size <= (name === "SHA256SUMS" ? 4096 : 65536),
        "INSPECTION_FILES",
      );
      total += before.size;
      check(total <= 262144, "INSPECTION_FILES");
      const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        const opened = fstatSync(fd);
        check(sameStat(before, opened), "INSPECTION_FILES");
        const data = Buffer.alloc(before.size + 1);
        let size = 0,
          n;
        while ((n = readSync(fd, data, size, data.length - size, null)) > 0) {
          size += n;
          check(size <= before.size, "INSPECTION_FILES");
        }
        check(
          size === before.size &&
            sameStat(opened, fstatSync(fd)) &&
            sameStat(opened, lstatSync(path)),
          "INSPECTION_FILES",
        );
        buffers[name] = data.subarray(0, size);
      } finally {
        closeSync(fd);
      }
    }
    check(
      sameStat(dir, fstatSync(dirfd)) &&
        sameStat(dir, lstatSync(root)) &&
        realpathSync(root) === root,
      "INSPECTION_FILES",
    );
    const manifest = FILES.map((name) => sha256(buffers[name]) + "  " + name + "\n").join("");
    check(buffers.SHA256SUMS.equals(Buffer.from(manifest)), "INSPECTION_MANIFEST");
    for (const [name, digest] of Object.entries(HISTORY))
      check(sha256(buffers[name]) === digest, "INSPECTION_HISTORY");
    deadline();
    return {
      buffers,
      manifest: FILES.map((name) => ({
        name,
        bytes: buffers[name].length,
        sha256: sha256(buffers[name]),
      })),
    };
  } finally {
    closeSync(dirfd);
  }
}
export function buildProof(root, inspection, deadline = () => {}) {
  inspection = plain(inspection);
  check(
    keys(inspection, ["run", "head"]) &&
      /^\d+$/.test(inspection.run) &&
      /^[0-9a-f]{40}$/.test(inspection.head),
    "INSPECTION_OUTPUT",
  );
  const { buffers, manifest } = readManifest(root, deadline);
  const { raw: reportRaw, value: report } = canonicalJson(buffers["report.json"]);
  const { raw: receiptsRaw, value: receipts } = canonicalJson(buffers["receipts.json"], "receipts");
  const { observations } = validateRecords(report, receipts);
  const result =
    JSON.stringify({
      type: "FIXTURE_INSPECTION_PROOF",
      inspection,
      source: { run: PIN.run, head: PIN.head, artifact: PIN.artifact, zipSha256: PIN.digest },
      manifest,
      observations,
      reportRaw,
      receiptsRaw,
    }) + "\n";
  check(Buffer.byteLength(result) <= 65536, "INSPECTION_OUTPUT");
  deadline();
  return result;
}
async function metadata(token, deadline) {
  const base = "https://api.github.com/repos/" + PIN.repository;
  async function get(path) {
    const remaining = deadline();
    const response = await fetch(base + path, {
      method: "GET",
      redirect: "error",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(remaining),
    });
    check(response.status === 200, "INSPECTION_METADATA");
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      length += chunk.length;
      check(length <= 262144, "INSPECTION_METADATA");
      chunks.push(chunk);
      deadline();
    }
    try {
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    } catch {
      fail("INSPECTION_METADATA");
    }
  }
  const run = await get("/actions/runs/" + PIN.run);
  const upstream = await get("/actions/runs/" + PIN.upstream);
  const artifact = await get("/actions/artifacts/" + PIN.artifact);
  const artifacts = await get("/actions/runs/" + PIN.run + "/artifacts?per_page=100");
  const jobs = await get("/actions/runs/" + PIN.run + "/attempts/1/jobs?per_page=100");
  validateMetadata({ run, upstream, artifact, artifacts, jobs });
  deadline();
}
function toolReady(tool, remaining) {
  const git = (args) => {
    const r = spawnSync("git", ["-C", tool, ...args], {
      encoding: "utf8",
      env: { PATH: "/usr/bin:/bin" },
      timeout: remaining(),
      maxBuffer: 65536,
    });
    check(r.status === 0, "INSPECTION_TOOL");
    return r.stdout.trim();
  };
  check(git(["rev-parse", "HEAD"]) === PIN.tool, "INSPECTION_TOOL");
  git(["diff", "--quiet", "HEAD"]);
  check(git(["status", "--porcelain"]) === "", "INSPECTION_TOOL");
  check(git(["hash-object", "dist/index.js"]) === PIN.bundle, "INSPECTION_TOOL");
}
export function executeOfficialTool(tool, root, token, remaining, spawn = spawnSync) {
  const result = spawn(process.execPath, [join(tool, "dist/index.js")], {
    cwd: tool,
    encoding: "utf8",
    env: {
      "INPUT_ARTIFACT-IDS": String(PIN.artifact),
      "INPUT_RUN-ID": String(PIN.run),
      INPUT_REPOSITORY: PIN.repository,
      "INPUT_GITHUB-TOKEN": token,
      "INPUT_MERGE-MULTIPLE": "true",
      INPUT_PATH: root,
      INPUT_NAME: "",
      INPUT_PATTERN: "",
      GITHUB_API_URL: "https://api.github.com",
      GITHUB_SERVER_URL: "https://github.com",
    },
    stdio: "pipe",
    timeout: remaining(),
    killSignal: "SIGKILL",
    maxBuffer: 524288,
  });
  remaining();
  check(!result.error && !result.signal, "INSPECTION_DOWNLOAD");
  validateDownloadOutput({ status: result.status, stdout: result.stdout, stderr: result.stderr });
  return true;
}
export async function runInspection() {
  const started = performance.now();
  const remaining = () => {
    const left = 30000 - (performance.now() - started);
    check(left > 0, "INSPECTION_DEADLINE");
    return Math.max(1, Math.floor(left));
  };
  check(
    process.versions.node.split(".")[0] === "24" && process.argv.length === 2,
    "INSPECTION_RUNTIME",
  );
  check(
    process.env.GITHUB_EVENT_NAME === "push" &&
      process.env.GITHUB_REF === "refs/heads/main" &&
      process.env.GITHUB_REPOSITORY === PIN.repository,
    "INSPECTION_RUNTIME",
  );
  check(
    typeof process.env.GITHUB_TOKEN === "string" && process.env.GITHUB_TOKEN.length > 0,
    "INSPECTION_RUNTIME",
  );
  check(
    /^\d+$/.test(process.env.GITHUB_RUN_ID || "") &&
      /^[0-9a-f]{40}$/.test(process.env.GITHUB_SHA || ""),
    "INSPECTION_RUNTIME",
  );
  const inspection = { run: process.env.GITHUB_RUN_ID, head: process.env.GITHUB_SHA };
  const temp = realpathSync(process.env.RUNNER_TEMP),
    root = join(temp, "r6-inspection"),
    tool = resolve(".fixture-inspection-tool");
  check(temp === resolve(process.env.RUNNER_TEMP), "INSPECTION_FILES");
  toolReady(tool, remaining);
  await metadata(process.env.GITHUB_TOKEN, remaining);
  mkdirSync(root, { mode: 0o700 });
  check((lstatSync(root).mode & 0o777) === 0o700, "INSPECTION_FILES");
  executeOfficialTool(tool, root, process.env.GITHUB_TOKEN, remaining);
  const output = buildProof(root, inspection, remaining);
  remaining();
  process.stdout.write(output);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runInspection().catch(() => {
    process.stderr.write("FIXTURE_INSPECTION_FAILED\n");
    process.exitCode = 1;
  });
}

/**
 * F3 CODE — executor individual de 138 caseIds.
 * Não executa HML LIVE, não altera ledger/certificados e nunca gera PASS
 * a partir de sourceHints, catálogo ou testes de formato.
 *
 * O registro fornece operações reais (produtores, consumidores, negativos)
 * e verificador separado. A saída sempre informa o estado de cada caseId.
 */
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import {
  createF3CodeCaseRuntime,
  collectF3CodeCaseEvidence,
  F3_BACKEND_SHA,
} from "./integracao-v1-fase3.mjs";
import { collectF3CodeEvidence } from "./integracao-v1-fase3-code-executor.mjs";
import {
  producerDrivers,
  consumerDrivers,
  negativeDrivers,
  independentVerifier,
} from "./f3-code-functional-drivers.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const F3 = "docs/frontend/auditorias/integracao-funcional-v1/fase3";
const HASH = (value) => createHash("sha256").update(value).digest("hex");
const COMMIT = /^[a-f0-9]{40}$/;
const ID = /^[1-9][0-9]*$/;
const REQUIRED = 138;
const TESTS = 276;

function error(code) {
  throw Object.assign(new Error(code), { code });
}
function assert(condition, code) {
  if (!condition) error(code);
}
function validObject(input) {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

export function f3CodeProvenance(env) {
  const p = Object.freeze({
    frontendSha: String(env.GITHUB_SHA ?? "").toLowerCase(),
    backendSha: F3_BACKEND_SHA,
    workflowRunId: String(env.GITHUB_RUN_ID ?? ""),
    jobId: String(env.F3_JOB_ID ?? ""),
  });
  assert(
    COMMIT.test(p.frontendSha) &&
      COMMIT.test(p.backendSha) &&
      ID.test(p.workflowRunId) &&
      ID.test(p.jobId),
    "F3_CODE_REAL_PROVENANCE_REQUIRED",
  );
  return p;
}

export function validateF3FunctionalReport(report, catalogue) {
  assert(validObject(report) && report.schema === "contaos.ifv1.f3.code-execution.v1",
    "F3_CODE_REPORT_SCHEMA");
  assert(report.state === "UNREVIEWED_NOT_CERTIFIED" &&
    Array.isArray(report.entries) &&
    report.entries.length === REQUIRED &&
    catalogue?.cases?.length === REQUIRED, "F3_CODE_REPORT_ENTRIES");
  const ids = new Set();
  for (let i = 0; i < REQUIRED; i++) {
    const e = report.entries[i];
    const c = catalogue.cases[i];
    assert(e.caseId === c.caseId && !ids.has(e.caseId) &&
      e.classification === c.classification, "F3_CODE_REPORT_MISMATCH");
    ids.add(e.caseId);
    assert(
      ["FAIL", "BLOCKED", "SUBMITTED_UNVERIFIED"].includes(e.status),
      "F3_CODE_REPORT_STATUS",
    );
    if (e.status === "SUBMITTED_UNVERIFIED") {
      assert(e.reason === null && e.tests?.length === 2,
        "F3_CODE_REPORT_UNVERIFIED");
      assert(
        e.tests[0].kind === "positive" &&
        e.tests[1].kind === "negative" &&
        e.tests[0].testId !== e.tests[1].testId,
        "F3_CODE_REPORT_TWO_TESTS",
      );
    } else {
      assert(typeof e.reason === "string" && e.reason.startsWith("F3_") &&
        Array.isArray(e.tests) && e.tests.length === 0,
        "F3_CODE_REPORT_FAIL_CLOSED");
    }
  }
  const submitted = report.entries.filter((e) => e.status === "SUBMITTED_UNVERIFIED").length;
  const blocked = report.entries.filter((e) => e.status === "BLOCKED").length;
  const failed = report.entries.filter((e) => e.status === "FAIL").length;
  assert(
    report.counts?.submittedUnverified === submitted &&
    report.counts?.blocked === blocked &&
    report.counts?.failed === failed &&
    submitted + blocked + failed === REQUIRED,
    "F3_CODE_REPORT_COUNTS",
  );
  return Object.freeze({
    complete: submitted === REQUIRED && blocked === 0 && failed === 0,
    submittedUnverified: submitted,
    blocked,
    failed,
    cases: REQUIRED,
    requiredTests: TESTS,
    observedTests: report.entries.reduce((n, e) => n + e.tests.length, 0),
  });
}

export async function executeF3Functional138({
  provenance,
  load = async (path) => readFile(join(REPO_ROOT, F3, path), "utf8"),
  drivers = { producerDrivers, consumerDrivers, negativeDrivers, independentVerifier },
  collector = collectF3CodeEvidence,
} = {}) {
  assert(validObject(provenance), "F3_CODE_REAL_PROVENANCE_REQUIRED");
  const [raw, coverageRaw] = await Promise.all([
    load("F3_CASES.json"), load("F3_CODE_COVERAGE_MATRIX.json"),
  ]);
  const catalogue = JSON.parse(raw);
  const coverage = JSON.parse(coverageRaw);
  assert(
    coverage.count === REQUIRED &&
    coverage.certification === "NOT_CERTIFIED" &&
    coverage.cases?.length === REQUIRED &&
    coverage.cases.every((c) => c.proofState === "NOT_RUN"),
    "F3_CODE_COVERAGE_DRIFT",
  );
  const runtime = createF3CodeCaseRuntime({
    catalogue,
    coverage,
    producerDrivers: drivers.producerDrivers,
    consumerDrivers: drivers.consumerDrivers,
    negativeDrivers: drivers.negativeDrivers,
    independentVerifier: drivers.independentVerifier,
  });
  assert(runtime.coveredCaseIds.length === REQUIRED,
    "F3_CODE_DISPATCH_INCOMPLETE");
  const report = await collectF3CodeCaseEvidence({
    catalogue,
    catalogueRaw: raw,
    provenance,
    caseDrivers: runtime.caseDrivers,
    caseVerifiers: runtime.caseVerifiers,
    collector,
  });
  return Object.freeze({
    report,
    tally: validateF3FunctionalReport(report, catalogue),
  });
}

export async function persistF3Diagnostic({ report, tally }, outputDir) {
  assert(typeof outputDir === "string" && outputDir.length > 0,
    "F3_CODE_OUTPUT_PATH");
  const out = resolve(outputDir);
  await mkdir(out, { recursive: true });
  const canonical = JSON.stringify(report, null, 2) + "\n";
  const manifest = report.entries.map((item) => JSON.stringify(item)).join("\n") + "\n";
  const summary = {
    schema: "contaos.ifv1.f3.code-functional-diagnostic.v1",
    status: tally.complete ? "SUBMITTED_UNVERIFIED" : "INCOMPLETE",
    note: "Nao constitui certificacao. Requer contraditorio independente.",
    ...tally,
    provenance: report.provenance,
    reportSha256: report.reportSha256,
  };
  const summaryJson = JSON.stringify(summary, null, 2) + "\n";
  await Promise.all([
    writeFile(join(out, "F3_CODE_FUNCTIONAL_138_REPORT.json"), canonical, { flag: "wx" }),
    writeFile(join(out, "F3_CODE_CASE_RESULTS.jsonl"), manifest, { flag: "wx" }),
    writeFile(join(out, "F3_CODE_FUNCTIONAL_SUMMARY.json"), summaryJson, { flag: "wx" }),
  ]);
  const hashes = [
    [HASH(canonical), "F3_CODE_FUNCTIONAL_138_REPORT.json"],
    [HASH(manifest), "F3_CODE_CASE_RESULTS.jsonl"],
    [HASH(summaryJson), "F3_CODE_FUNCTIONAL_SUMMARY.json"],
  ];
  await writeFile(join(out, "SHA256SUMS"), hashes.map(([hash, name]) =>
    hash + "  " + name).join("\n") + "\n", { flag: "wx" });
  return Object.freeze(summary);
}

export async function runF3FunctionalCli(env = process.env) {
  const provenance = f3CodeProvenance(env);
  const outcome = await executeF3Functional138({ provenance });
  const outputDir = env.F3_CODE_OUTPUT_DIR ?? join(REPO_ROOT, "artifacts/f3-code-functional-138");
  const summary = await persistF3Diagnostic(outcome, outputDir);
  const message = [
    "## F3 CODE — execução funcional de 138 caseId",
    "",
    "- HEAD: `" + provenance.frontendSha + "`",
    "- Casos analisados: " + summary.cases,
    "- Provas reais recebidas: " + summary.observedTests + "/" + summary.requiredTests,
    "- SUBMITTED_UNVERIFIED: " + summary.submittedUnverified,
    "- BLOCKED: " + summary.blocked,
    "- FAIL: " + summary.failed,
    "- Situação: **" + summary.status + "**",
    "- Sem PASS/certificação automática e sem alterar ledger.",
    "",
  ].join("\n");
  if (env.GITHUB_STEP_SUMMARY) {
    await writeFile(env.GITHUB_STEP_SUMMARY, message, { flag: "a" });
  }
  console.log(JSON.stringify({
    phase: "F3_CODE_FUNCTIONAL_138",
    status: summary.status,
    cases: summary.cases,
    observedTests: summary.observedTests,
    requiredTests: summary.requiredTests,
    blocked: summary.blocked,
    failed: summary.failed,
    submittedUnverified: summary.submittedUnverified,
    reportSha256: summary.reportSha256,
  }));
  return summary.status === "SUBMITTED_UNVERIFIED";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3 || process.argv[2] !== "--run") error("F3_CODE_CLI_USAGE");
  try {
    const complete = await runF3FunctionalCli();
    if (!complete) process.exitCode = 1;
  } catch (cause) {
    // No tokens, payloads or raw fixture values in logs.
    console.error("F3_CODE_FUNCTIONAL_ERROR " +
      (typeof cause?.code === "string" && /^F3_/.test(cause.code) ?
        cause.code : "F3_CODE_EXECUTION_FAILURE"));
    process.exitCode = 1;
  }
}

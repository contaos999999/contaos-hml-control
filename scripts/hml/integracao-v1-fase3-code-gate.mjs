import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const F3_CODE_SCHEMA = "contaos.ifv1.f3.code-coverage-matrix.v1";
export const F3_CODE_LEDGER_SCHEMA = "contaos.ifv1.f3.code-evidence-ledger.v1";
export const F3_CODE_SCOPE = "INTEGRACAO_V1_FASE3_CODE";
export const F3_CODE_CASES_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json";
export const F3_CODE_MATRIX_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_COVERAGE_MATRIX.json";
export const F3_CODE_LEDGER_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_EVIDENCE_LEDGER.json";
export const F3_CODE_CATALOGUE_HASH = "bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb";
export const F3_CODE_CSV_HASH = "b8b4980bab5f841adc1db9c642e960f45a6874baad660bd18cd6a60ce87e32d9";

function reject(code) {
  throw Object.assign(new Error(code), { code });
}
const exact = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);
const keys = (obj, allowed, code) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) reject(code);
  if (!exact(Object.keys(obj).sort(), [...allowed].sort())) reject(code);
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");

/**
 * ONLY a non-certifying inventory gate. SourceHints point to source code, not executed functional
 * proof. This function never emits PASS, even if caller supplies forged entries or booleans.
 * A separate trusted, independently reviewed CI evidence attestation is required by F3 CODE PLAN.
 */
export function assessF3CodeInventory(catalogueRaw, coverageRaw, ledgerRaw) {
  if (sha256(catalogueRaw) !== F3_CODE_CATALOGUE_HASH) reject("F3_CODE_CASES_DRIFT");
  const catalogue = JSON.parse(catalogueRaw);
  const coverage = JSON.parse(coverageRaw);
  const ledger = JSON.parse(ledgerRaw);
  keys(catalogue, ["schema", "matrixPath", "matrixSha256", "scope", "count", "cases"], "F3_CODE_CASES_SCHEMA");
  keys(coverage, [
    "schema", "scope", "sourceCatalogueSha256", "sourceCsvSha256", "count",
    "mandatory", "conditional", "certification", "notes", "cases",
  ], "F3_CODE_MATRIX_SCHEMA");
  keys(ledger, ["schema", "scope", "sourceCatalogueSha256", "state", "runs", "entries", "note"], "F3_CODE_LEDGER_SCHEMA");
  if (coverage.schema !== F3_CODE_SCHEMA || ledger.schema !== F3_CODE_LEDGER_SCHEMA ||
      coverage.scope !== F3_CODE_SCOPE || ledger.scope !== F3_CODE_SCOPE ||
      coverage.sourceCatalogueSha256 !== F3_CODE_CATALOGUE_HASH ||
      ledger.sourceCatalogueSha256 !== F3_CODE_CATALOGUE_HASH ||
      coverage.sourceCsvSha256 !== F3_CODE_CSV_HASH ||
      catalogue.count !== 138 || coverage.count !== 138 ||
      coverage.mandatory !== 120 || coverage.conditional !== 18 ||
      catalogue.cases.length !== 138 || coverage.cases.length !== 138)
    reject("F3_CODE_MATRIX_DRIFT");
  const seen = new Set();
  let sourceHints = 0;
  for (let i = 0; i < 138; i++) {
    const actual = coverage.cases[i];
    const canonical = catalogue.cases[i];
    keys(actual, [
      "caseId", "sourceConnectionId", "producerOrder", "origin", "destination",
      "producer", "consumer", "classification", "expected", "sourceHints",
      "proofState", "testIds",
    ], "F3_CODE_MATRIX_CASE");
    for (const field of [
      "caseId", "sourceConnectionId", "producerOrder", "origin", "destination",
      "producer", "consumer", "classification",
    ]) if (actual[field] !== canonical[field]) reject("F3_CODE_MATRIX_MISMATCH");
    if (!exact(actual.expected, canonical.expected) ||
        seen.has(actual.caseId) ||
        !Array.isArray(actual.sourceHints) || actual.sourceHints.length !== 2 ||
        !actual.sourceHints.every((s) => /^src\/[A-Za-z0-9_./-]+\.(?:ts|tsx):[0-9]+$/.test(s)))
      reject("F3_CODE_SOURCE_MAP");
    seen.add(actual.caseId);
    sourceHints += actual.sourceHints.length;
    if (actual.proofState !== "NOT_RUN" ||
        !Array.isArray(actual.testIds) || actual.testIds.length !== 0)
      reject("F3_CODE_UNVERIFIED_RECEIPT");
  }
  if (seen.size !== 138 || sourceHints !== 276) reject("F3_CODE_INVENTORY_INCOMPLETE");
  if (coverage.certification !== "NOT_CERTIFIED" ||
      ledger.state !== "NOT_CERTIFIED" ||
      !Array.isArray(ledger.runs) || !Array.isArray(ledger.entries) ||
      ledger.runs.length !== 0 || ledger.entries.length !== 0)
    reject("F3_CODE_UNVERIFIED_RECEIPT");
  return Object.freeze({
    state: "NOT_CERTIFIED",
    total: 138,
    mandatory: 120,
    conditional: 18,
    sourceHints,
    verifiedSourcePaths: false,
    executedCases: 0,
    verifiedCases: 0,
    remainingCases: 138,
    nextGate: "F3_CODE_EXECUTION_EVIDENCE",
  });
}

export async function assessF3CodeInventoryFromRepo(root = fileURLToPath(new URL("../../", import.meta.url))) {
  const files = await Promise.all(
    [F3_CODE_CASES_PATH, F3_CODE_MATRIX_PATH, F3_CODE_LEDGER_PATH]
      .map((path) => readFile(join(root, path), "utf8")),
  );
  return assessF3CodeInventory(...files);
}

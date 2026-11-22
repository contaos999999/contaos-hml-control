import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { collectF3CodeEvidence, F3_CODE_EXECUTION_SCHEMA } from "./integracao-v1-fase3-code-executor.mjs";

const catalogueRaw = await readFile(
  fileURLToPath(new URL("../../docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json", import.meta.url)),
  "utf8",
);
const catalogue = JSON.parse(catalogueRaw);
const provenance = {
  frontendSha: "a".repeat(40),
  backendSha: "b".repeat(40),
  workflowRunId: "12345",
  jobId: "12346",
};
function proof(c, kind) {
  return {
    caseId: c.caseId,
    kind,
    testId: "test:" + c.caseId + ":" + kind,
    outcome: "PASS",
    sourcePath: "src/lib/auth/resolverDestinoPosLogin.ts",
    outputSha256: "c".repeat(64),
  };
}
test("F3 CODE executor: 138 caseIds, no missing runs ever becomes certified", async () => {
  const report = await collectF3CodeEvidence({
    catalogue, catalogueRaw, provenance,
    executeCase: async () => { throw Object.assign(new Error("not implemented"), { code: "F3_DRIVER_PENDING" }); },
    verifyCase: async () => true,
  });
  assert.equal(report.schema, F3_CODE_EXECUTION_SCHEMA);
  assert.equal(report.state, "UNREVIEWED_NOT_CERTIFIED");
  assert.equal(report.entries.length, 138);
  assert.equal(report.counts.failed, 138);
  assert.equal(report.counts.collected, 0);
  assert.equal(report.entries[0].reason, "F3_DRIVER_PENDING");
  assert.match(report.reportSha256, /^[a-f0-9]{64}$/);
});
test("F3 CODE executor: N/A without approved amendment remains blocked", async () => {
  const report = await collectF3CodeEvidence({
    catalogue, catalogueRaw, provenance,
    executeCase: async () => ({ applicability: "NOT_APPLICABLE" }),
    verifyCase: async () => true,
  });
  assert.equal(report.counts.blocked, 138);
  assert.ok(report.entries.every((e) => e.reason === "F3_CODE_NA_REQUIRES_APPROVED_AMENDMENT"));
});
test("F3 CODE executor: incomplete evidence and negative omission fail closed", async () => {
  const report = await collectF3CodeEvidence({
    catalogue, catalogueRaw, provenance,
    executeCase: async (c) => ({ applicability: "APPLICABLE", tests: [proof(c, "positive")] }),
    verifyCase: async () => true,
  });
  assert.equal(report.counts.blocked, 138);
  assert.ok(report.entries.every((e) => e.reason === "F3_CODE_TEST_EVIDENCE"));
});
test("F3 CODE executor: full evidence is still unreviewed, never self-certified", async () => {
  const report = await collectF3CodeEvidence({
    catalogue, catalogueRaw, provenance,
    executeCase: async (c) => ({
      applicability: "APPLICABLE",
      tests: [proof(c, "positive"), proof(c, "negative")],
    }),
    verifyCase: async () => true,
  });
  assert.equal(report.counts.collected, 138);
  assert.equal(report.state, "UNREVIEWED_NOT_CERTIFIED");
  assert.equal(report.entries.length, 138);
  assert.ok(report.entries.every((e) => e.status === "EVIDENCE_COLLECTED"));
});
test("F3 CODE executor: verification rejection forbids collected status", async () => {
  const report = await collectF3CodeEvidence({
    catalogue, catalogueRaw, provenance,
    executeCase: async (c) => ({
      applicability: "APPLICABLE",
      tests: [proof(c, "positive"), proof(c, "negative")],
    }),
    verifyCase: async () => false,
  });
  assert.equal(report.counts.failed, 138);
  assert.equal(report.counts.collected, 0);
});
test("F3 CODE executor: invalid provenance and duplicate catalogue IDs reject execution", async () => {
  const args = {
    catalogue, catalogueRaw, provenance,
    executeCase: async () => ({ applicability: "NOT_APPLICABLE" }),
    verifyCase: async () => true,
  };
  await assert.rejects(collectF3CodeEvidence({
    ...args, provenance: { ...provenance, frontendSha: "fake" },
  }), { code: "F3_CODE_PROVENANCE" });
  const copy = structuredClone(catalogue);
  copy.cases[1].caseId = copy.cases[0].caseId;
  await assert.rejects(collectF3CodeEvidence({ ...args, catalogue: copy }), {
    code: "F3_CODE_CATALOGUE_DRIFT",
  });
  await assert.rejects(collectF3CodeEvidence({ ...args, catalogueRaw: catalogueRaw + " " }), {
    code: "F3_CODE_CATALOGUE_DRIFT",
  });
  await assert.rejects(collectF3CodeEvidence({ ...args, catalogue: { ...catalogue, count: 137 } }), {
    code: "F3_CODE_CATALOGUE_DRIFT",
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  f3CodeProvenance,
  executeF3Functional138,
  persistF3Diagnostic,
  validateF3FunctionalReport,
  validateF3AutomaticGate,
} from "./integracao-v1-fase3-functional-138.mjs";

const provenance = Object.freeze({
  frontendSha: "a".repeat(40),
  backendSha: "5eca44aebead3183e81b5c1af0d1dffa5fb8feb6",
  workflowRunId: "12345",
  jobId: "12346",
});
const noDrivers = {
  producerDrivers: Object.create(null),
  consumerDrivers: Object.create(null),
  negativeDrivers: Object.create(null),
  independentVerifier: async () => false,
};

test("F3 CODE 138: despachante chama todos os IDs e marca driver ausente como FAIL", async () => {
  const { report, tally } = await executeF3Functional138({
    provenance,
    drivers: noDrivers,
  });
  assert.equal(tally.cases, 138);
  assert.equal(tally.observedTests, 0);
  assert.equal(tally.requiredTests, 276);
  assert.equal(tally.submittedUnverified, 0);
  assert.equal(tally.blocked, 0);
  assert.equal(tally.failed, 138);
  assert.equal(tally.complete, false);
  assert.equal(report.state, "UNREVIEWED_NOT_CERTIFIED");
  assert.equal(new Set(report.entries.map((entry) => entry.caseId)).size, 138);
  for (const entry of report.entries) {
    assert.equal(entry.status, "FAIL");
    assert.equal(entry.reason, "F3_DRIVER_PENDING");
    assert.deepEqual(entry.tests, []);
  }
});

test("F3 CODE 138: proveniência do GitHub exige jobId real", () => {
  const env = {
    GITHUB_SHA: "a".repeat(40),
    GITHUB_RUN_ID: "12345",
    F3_JOB_ID: "12346",
  };
  assert.deepEqual(f3CodeProvenance(env), provenance);
  for (const bad of [
    { ...env, F3_JOB_ID: undefined },
    { ...env, F3_JOB_ID: "fake" },
    { ...env, GITHUB_SHA: "not-a-sha" },
    { ...env, GITHUB_RUN_ID: "0" },
  ])
    assert.throws(() => f3CodeProvenance(bad), {
      code: "F3_CODE_REAL_PROVENANCE_REQUIRED",
    });
});

test("F3 CODE 138: relatório adulterado é recusado sem promovê-lo", async () => {
  const { report } = await executeF3Functional138({ provenance, drivers: noDrivers });
  const raw = await readFile(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json",
      import.meta.url,
    ),
    "utf8",
  );
  const catalogue = JSON.parse(raw);
  const altered = structuredClone(report);
  altered.entries.pop();
  assert.throws(() => validateF3FunctionalReport(altered, catalogue), {
    code: "F3_CODE_REPORT_ENTRIES",
  });
  const tampered = structuredClone(report);
  tampered.entries[0].status = "SUBMITTED_UNVERIFIED";
  assert.throws(() => validateF3FunctionalReport(tampered, catalogue), {
    code: "F3_CODE_REPORT_UNVERIFIED",
  });
  const invented = structuredClone(report);
  invented.entries[1].tests = [{ kind: "positive" }];
  assert.throws(() => validateF3FunctionalReport(invented, catalogue), {
    code: "F3_CODE_REPORT_FAIL_CLOSED",
  });
});

test("F3 CODE 138: artefato de diagnóstico rastreia 138 casos e SHA256", async () => {
  const dir = await mkdtemp(join(tmpdir(), "f3-code-138-"));
  try {
    const outcome = await executeF3Functional138({ provenance, drivers: noDrivers });
    const summary = await persistF3Diagnostic(outcome, dir);
    assert.equal(summary.status, "INCOMPLETE");
    assert.equal(summary.cases, 138);
    assert.equal(summary.observedTests, 0);
    const results = await readFile(join(dir, "F3_CODE_CASE_RESULTS.jsonl"), "utf8");
    const parsed = results
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.equal(parsed.length, 138);
    assert.equal(parsed.filter((x) => x.status === "FAIL").length, 138);
    const checksums = await readFile(join(dir, "SHA256SUMS"), "utf8");
    for (const line of checksums.trim().split("\n")) {
      const match = line.match(/^([a-f0-9]{64})  ([A-Za-z0-9_.-]+)$/);
      assert.ok(match, "checksum malformado");
      const bytes = await readFile(join(dir, match[2]));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), match[1]);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("F3 automated gate rejects missing proofs, provenance and tampered summaries", async () => {
  const dir = await mkdtemp(join(tmpdir(), "f3-gate-"));
  try {
    const outcome = await executeF3Functional138({ provenance, drivers: noDrivers });
    const summary = await persistF3Diagnostic(outcome, dir);
    const catalogue = JSON.parse(
      await readFile(
        new URL(
          "../../docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const input = {
      report: outcome.report,
      summary,
      manifest: outcome.report.entries,
      catalogue,
      provenance,
    };
    assert.equal(validateF3AutomaticGate(input).gate, "FAIL_CODE");
    assert.throws(
      () => validateF3AutomaticGate({ ...input, summary: { ...summary, observedTests: 276 } }),
      { code: "F3_CODE_GATE_SUMMARY" },
    );
    assert.throws(
      () => validateF3AutomaticGate({ ...input, provenance: { ...provenance, jobId: "999" } }),
      { code: "F3_CODE_GATE_PROVENANCE" },
    );
    assert.throws(() => validateF3AutomaticGate({ ...input, manifest: [] }), {
      code: "F3_CODE_GATE_MANIFEST",
    });
    assert.throws(
      () =>
        validateF3AutomaticGate({
          ...input,
          report: { ...input.report, reportSha256: "0".repeat(64) },
        }),
      { code: "F3_CODE_GATE_REPORT_HASH" },
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

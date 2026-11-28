import assert from "node:assert/strict";
import test from "node:test";
import { backendSha, loadMatrix, validateMaterial } from "./f6-code-material-evidence.mjs";

const identity = {
  frontendSha: "a".repeat(40),
  backendSha,
  harnessSha: "b".repeat(40),
  runId: "1",
  attempt: "1",
  jobId: "2",
};
function fixture() {
  const caseId = "IFV1-F6-C0002";
  const file = "src/test/f6-code-adm01-journeys.test.tsx";
  const suite = "F6 ADM01 journeys";
  const c = {
    caseId,
    batch: "adm01",
    journeyId: "F6.1-ADM01-SYS04-C0002",
    classification: "OBRIGATORIA",
  };
  const matrix = { cases: [c], activeBatches: { adm01: { file, suite } } };
  const proof = {
    ...c,
    identity,
    scope: "CODE_FIXTURE",
    applicability: "APLICAVEL",
    status: "PASS",
    tenant: "a6100000-0000-4000-8000-000000000002",
    actor: "a6100000-0000-4000-8000-000000000001",
    profile: "leitor",
    preconditions: { state: "before" },
    observed: { state: "after" },
    postconditions: { count: 1 },
    recoveryProof: { newRead: true },
    cleanupStatus: "CLEAN",
    steps: ["precondition", "producer", "consumer", "recovery"].map((phase) => ({
      phase,
      observed: { phase },
    })),
  };
  const observations = [
    { ...proof, kind: "positive" },
    {
      ...proof,
      kind: "negative",
      negativeProof: {
        decision: "DENIED",
        status: 403,
        code: "42501",
        effects: 0,
        disclosed: false,
      },
    },
  ];
  const report = {
    success: true,
    numTotalTests: 2,
    numPassedTests: 2,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    testResults: [
      {
        name: "/checkout/" + file,
        status: "passed",
        assertionResults: observations.map((o) => ({
          status: "passed",
          ancestorTitles: [suite],
          title: caseId + " " + o.kind + ": tested",
        })),
      },
    ],
  };
  return { matrix, observations, report };
}
const verify = ({ matrix, observations, report }) =>
  validateMaterial(matrix, "adm01", observations, report, identity);

test("F6 checks the 138 canonical case bindings", () => {
  assert.equal(loadMatrix().cases.length, 138);
});
test("F6 validates a pair and marks it partial", () => {
  assert.equal(verify(fixture()).certification, "NOT_CERTIFIED");
});
test("F6 rejects a replacement case, missing pair, or duplicate polarity", () => {
  const replaced = fixture();
  replaced.observations[0].caseId = "IFV1-F6-C9999";
  assert.throws(() => verify(replaced), /observation pairs/);
  const missing = fixture();
  missing.observations.pop();
  assert.throws(() => verify(missing), /observation pairs/);
  const duplicate = fixture();
  duplicate.observations[1] = duplicate.observations[0];
  assert.throws(() => verify(duplicate), /duplicates/);
});
test("F6 rejects absent recovery and a transport fault presented as authorization", () => {
  const absent = fixture();
  absent.observations[0].recoveryProof = {};
  assert.throws(() => verify(absent), /Incomplete journey/);
  const failed = fixture();
  failed.observations[1].negativeProof.status = 503;
  assert.throws(() => verify(failed), /Transport failure/);
});
test("F6 rejects foreign provenance, effects, and skipped tests", () => {
  const elsewhere = fixture();
  elsewhere.observations[0].identity = { ...identity, jobId: "3" };
  assert.throws(() => verify(elsewhere), /Provenance mismatch/);
  const effects = fixture();
  effects.observations[1].negativeProof.effects = 1;
  assert.throws(() => verify(effects), /Negative side effects/);
  const skipped = fixture();
  skipped.report.numPendingTests = 1;
  assert.throws(() => verify(skipped), /Incomplete Vitest/);
});

test("F6.1 binds all 54 journeys and their paired proofs", () => {
  const matrix = loadMatrix();
  const cases = matrix.cases.filter((row) => row.slice === "F6.1");
  assert.equal(cases.length, 54);
  assert.deepEqual(
    Object.fromEntries(
      ["adm01", "context", "sys04"].map((b) => [b, cases.filter((c) => c.batch === b).length]),
    ),
    { adm01: 26, context: 3, sys04: 25 },
  );
  assert.equal(
    cases.flatMap((row) => [row.caseId + ":positive", row.caseId + ":negative"]).length,
    108,
  );
});

test("F6.7 supplementary evidence stays outside the canonical ledger", () => {
  const matrix = loadMatrix();
  assert.equal(matrix.cases.length, 138);
  assert.equal(matrix.transversal.length, 4);
  assert(matrix.cases.every((row) => row.batch !== "transversal"));
  const drifted = structuredClone(matrix);
  drifted.transversal[0].relatedCaseIds[0] = "IFV1-F6-C9999";
  assert.throws(() => loadMatrix(JSON.stringify(drifted)), /Unbound supplementary/);
  drifted.transversal = matrix.transversal;
  drifted.cases[0].batch = "transversal";
  assert.throws(() => loadMatrix(JSON.stringify(drifted)), /Unconfigured active batch/);
});

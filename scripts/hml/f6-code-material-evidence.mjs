import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const matrixPath =
  "docs/frontend/auditorias/integracao-funcional-v1/fase6/F6_JOURNEY_MATRIX.json";
const canonPath = "docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv";
export const backendSha = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
const requiredPhases = ["precondition", "producer", "consumer", "recovery"];
const statuses = new Set(["42501", "PGRST301", "session_not_found"]);
const sha = (v) => typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
const number = (v) => typeof v === "string" && /^[1-9][0-9]*$/.test(v);
const uuid = (v) =>
  typeof v === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v);
const data = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const source = (file) => readFileSync(new URL("../../" + file, import.meta.url), "utf8");

function sameMembers(actual, expected, label) {
  assert.equal(actual.length, new Set(actual).size, label + " duplicates");
  assert.deepEqual([...actual].sort(), [...expected].sort(), label);
}
function rows(csv) {
  const [head, ...lines] = csv.trim().split(/\r?\n/);
  const fields = head.split(",");
  return lines.map((line) => {
    const quoted = [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)];
    assert(
      quoted.length === fields.length && quoted.map((q) => q[0]).join("") === line,
      "Invalid canonical row",
    );
    return Object.fromEntries(quoted.map((q, i) => [fields[i], q[1].replace(/""/g, '"')]));
  });
}

export function loadMatrix(json = source(matrixPath), csv = source(canonPath)) {
  const matrix = JSON.parse(json);
  assert.equal(matrix.schema, "contaos.ifv1.f6.journeys.v1");
  assert.equal(matrix.scope, "CODE_FIXTURE");
  assert.equal(matrix.backendSha, backendSha);
  assert.deepEqual(matrix.counts, {
    canonical: 138,
    mandatory: 120,
    conditional: 18,
    minimumProofs: 276,
  });
  const original = rows(csv);
  sameMembers(
    matrix.cases.map((c) => c.caseId),
    original.map((c) => c.caso_fase6),
    "Canonical cases",
  );
  const canon = new Map(original.map((c) => [c.caso_fase6, c]));
  const counts = new Map();
  const classes = new Map();
  const paths = new Set();
  for (const [name, spec] of Object.entries(matrix.activeBatches)) {
    assert(
      /^[a-z0-9]+$/.test(name) &&
        /^src\/test\/f6-code-[a-z0-9-]+\.test\.tsx?$/.test(spec.file) &&
        !paths.has(spec.file) &&
        typeof spec.suite === "string" &&
        spec.suite.length >= 8,
      "Unexpected batch spec",
    );
    paths.add(spec.file);
  }
  for (const c of matrix.cases) {
    const row = canon.get(c.caseId);
    assert.deepEqual(
      [
        c.sourceConnectionId,
        c.origin,
        c.destination,
        c.classification,
        c.producer,
        c.consumer,
        c.normativeSource,
        c.expected,
      ],
      [
        row.id_conexao,
        row.tela_origem,
        row.tela_destino,
        row.classe_original,
        row.produtor_original,
        row.consumidor_original,
        row.evidencia_codigo_original,
        row.invariante_original,
      ],
      "Canonical source " + c.caseId,
    );
    assert.equal(c.journeyId, [c.slice, c.origin, c.destination, c.sourceConnectionId].join("-"));
    if (c.batch !== null)
      assert(
        Object.hasOwn(matrix.activeBatches, c.batch),
        "Unconfigured active batch for " + c.caseId,
      );
    counts.set(c.slice, (counts.get(c.slice) ?? 0) + 1);
    classes.set(c.classification, (classes.get(c.classification) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries([...counts].sort()), {
    "F6.1": 54,
    "F6.2": 24,
    "F6.3": 17,
    "F6.4": 14,
    "F6.5": 19,
    "F6.6": 10,
  });
  assert.deepEqual(Object.fromEntries([...classes].sort()), { CONDICIONAL: 18, OBRIGATORIA: 120 });
  return matrix;
}

export function validateMaterial(matrix, batch, observations, report, identity) {
  const spec = matrix.activeBatches[batch];
  assert(spec, "Unknown F6 batch");
  assert(
    [identity.frontendSha, identity.backendSha, identity.harnessSha].every(sha) &&
      identity.backendSha === backendSha &&
      [identity.runId, identity.attempt, identity.jobId].every(number),
    "Invalid execution identity",
  );
  const expected = matrix.cases.filter((c) => c.batch === batch);
  assert(expected.length > 0, "Empty F6 batch");
  const cases = new Map(expected.map((c) => [c.caseId, c]));
  const pairs = expected.flatMap((c) =>
    ["positive", "negative"].map((kind) => c.caseId + ":" + kind),
  );
  sameMembers(
    observations.map((o) => o.caseId + ":" + o.kind),
    pairs,
    "Material observation pairs",
  );
  for (const o of observations) {
    const c = cases.get(o.caseId);
    for (const [k, value] of Object.entries(c))
      assert.deepEqual(o[k], value, "Observed case binding " + k);
    assert.deepEqual(o.identity, identity, "Provenance mismatch");
    assert(
      o.scope === "CODE_FIXTURE" &&
        o.applicability === "APLICAVEL" &&
        o.status === "PASS" &&
        uuid(o.actor) &&
        uuid(o.tenant) &&
        typeof o.profile === "string" &&
        o.profile.length > 0,
      "Observed scope",
    );
    assert(
      o.cleanupStatus === "CLEAN" &&
        data(o.preconditions) &&
        data(o.observed) &&
        data(o.postconditions) &&
        data(o.recoveryProof),
      "Incomplete journey or cleanup",
    );
    assert.deepEqual(
      o.steps.map((step) => step.phase),
      requiredPhases,
      "Missing or reordered journey phase",
    );
    assert(
      o.steps.every((step) => data(step.observed)),
      "Unobserved journey phase",
    );
    if (o.kind === "positive") {
      assert(o.negativeProof === undefined, "Negative outcome presented as positive");
      continue;
    }
    const refusal = o.negativeProof;
    assert(
      refusal?.effects === 0 && refusal.disclosed === false,
      "Negative side effects or disclosure",
    );
    if (refusal.decision === "DENIED") {
      assert(
        [401, 403].includes(refusal.status) && statuses.has(refusal.code),
        "Transport failure presented as authorization",
      );
    } else {
      assert(
        refusal.decision === "ISOLATED" &&
          refusal.status === undefined &&
          o.observed.isolation === true,
        "Unobserved isolation",
      );
    }
  }
  assert(
    report.success === true &&
      report.numTotalTests === pairs.length &&
      report.numPassedTests === pairs.length &&
      report.numFailedTests === 0 &&
      report.numPendingTests === 0 &&
      report.numTodoTests === 0 &&
      report.testResults.length === 1,
    "Incomplete Vitest run",
  );
  const suite = report.testResults[0];
  assert(
    suite.status === "passed" && suite.name.endsWith("/" + spec.file),
    "Unexpected executed suite",
  );
  const names = suite.assertionResults.map((test) => {
    assert(
      test.status === "passed" &&
        test.ancestorTitles.length === 1 &&
        test.ancestorTitles[0] === spec.suite,
      "Unverified test",
    );
    const title = /^(IFV1-F6-C\d{4}) (positive|negative): .+$/.exec(test.title);
    assert(title, "Invalid material title");
    return title[1] + ":" + title[2];
  });
  sameMembers(names, pairs, "Executed test pairs");
  return {
    schema: "contaos.ifv1.f6.material-partial.v1",
    batch,
    covered: expected.length,
    proofs: pairs.length,
    caseIds: expected.map((c) => c.caseId),
    identity,
    scope: "CODE_FIXTURE",
    certification: "NOT_CERTIFIED",
    live: "NOT_RUN",
    production: "NO-GO",
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [flag, batch] = process.argv.slice(2);
  assert.equal(flag, "--batch");
  assert.equal(batch, process.env.F6_BATCH);
  const root = "artifacts/f6-code/";
  const observations = readFileSync(root + "observations.json");
  const report = readFileSync(root + "vitest.json");
  const identity = {
    frontendSha: process.env.F6_FRONTEND_SHA,
    backendSha,
    harnessSha: process.env.F6_HARNESS_SHA,
    runId: process.env.GITHUB_RUN_ID,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
    jobId: process.env.JOB_ID,
  };
  const receipt = validateMaterial(
    loadMatrix(),
    batch,
    JSON.parse(observations),
    JSON.parse(report),
    identity,
  );
  writeFileSync(
    root + "receipt.json",
    JSON.stringify(
      {
        ...receipt,
        observationsSha256: digest(observations),
        reportSha256: digest(report),
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
  console.log(receipt.covered + " jornadas e " + receipt.proofs + " provas de " + batch);
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  backendSha,
  loadMatrix,
  matrixPath,
  validateMaterial,
} from "./f6-code-material-evidence.mjs";
import { extract } from "./integracao-v1-fase4-code-attestation-live.mjs";

export const repository = "contaos999999/contaos-hml-control";
export const apiRoot = "repos/" + repository;
export const phaseDirectory = "docs/frontend/auditorias/integracao-funcional-v1/fase6/";
export const candidateFile = "F6_CODE_ATTESTATION_CANDIDATE.json";
const canonicalCsvPath = "docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv";
const inventoryPath = phaseDirectory + "F6_CANONICAL_CASES.json";
const fixturePath = "src/test/f6-code-journey-fixture.ts";
const protectedTypesPath = "src/integrations/supabase/types.ts";
const lockedTypes = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const originalMatrix = "bb7ce43f9c334f2f03e9aafab405addadfe5e19a";
const validatorPath = "scripts/hml/f6-code-material-evidence.mjs";
const workflowPath = ".github/workflows/contaos-f6-code-material.yml";
const workflowNames = [
  "ContaOS F6 CODE - jornadas e provas CODE",
  "ContaOS Frontend Zero-Drift",
  "ContaOS LOCK-TYPES-01 Double Barrier",
  "ContaOS P0-NR-001 Anti-Reincidencia",
  "ContaOS F3 CODE - 138 case preflight (not certification)",
  "ContaOS F3 CODE - 138 execucoes funcionais individuais",
  "ContaOS F3 CODE - Coletor offline (nao certificador)",
];
export const operations = (target, binary = false) =>
  execFileSync("gh", ["api", target], {
    encoding: binary ? null : "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
export const api = (target) => JSON.parse(operations(target));
export const download = (id) => operations(apiRoot + "/actions/artifacts/" + id + "/zip", true);
export const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const sha40 = (v) => typeof v === "string" && /^[0-9a-f]{40}$/.test(v);
const sha64 = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const positiveInteger = (v) => Number.isSafeInteger(v) && v > 0;

function uniqueEqual(a, b, message) {
  assert.equal(new Set(a).size, a.length, message);
  assert.equal(new Set(b).size, b.length, message);
  assert.deepEqual([...a].sort(), [...b].sort(), message);
}

export function checkInventory(matrix, inventory) {
  assert.equal(inventory.schema, "contaos.ifv1.f6.canonical-cases.v1");
  assert.equal(inventory.sourceBlob, originalMatrix);
  assert.deepEqual(inventory.counts, matrix.counts);
  assert.deepEqual(inventory.cases, matrix.cases, "Canonical inventory changed");
  assert.equal(matrix.cases.length, 138);
  assert.equal(matrix.transversal?.length, 4);
  assert(
    matrix.cases.every((row) => row.batch !== null),
    "Inactive canonical case",
  );
  return matrix;
}

export function verifySource(s, matrix, read = api, getGit = git) {
  assert(
    positiveInteger(s.pr) && s.repository === repository && s.backend === backendSha,
    "Invalid pinned material source",
  );
  assert(
    [s.base, s.head, s.merge, s.harness, s.tree].every(sha40) && s.head !== s.merge,
    "Missing code identity",
  );
  assert([s.review, s.run, s.attempt].every(positiveInteger), "Missing execution identity");
  uniqueEqual(
    s.runs.map((r) => r.name),
    workflowNames,
    "Required workflows",
  );
  uniqueEqual(
    s.batches.map((b) => b.name),
    Object.keys(matrix.activeBatches),
    "Required batches",
  );
  assert(
    s.runs.every((r) => positiveInteger(r.id) && positiveInteger(r.attempt)) &&
      new Set(s.runs.map((r) => r.id)).size === workflowNames.length,
    "Invalid workflow identities",
  );
  const seenBatches = new Set();
  const seenArtifacts = new Set();
  for (const b of s.batches) {
    assert(
      positiveInteger(b.job) &&
        positiveInteger(b.artifact) &&
        [b.digest, b.receiptDigest, b.observationsDigest, b.reportDigest].every(sha64) &&
        b.path === matrix.activeBatches[b.name].file,
      "Invalid batch identity",
    );
    assert(!seenBatches.has(b.job) && !seenArtifacts.has(b.artifact), "Duplicate job or artifact");
    seenBatches.add(b.job);
    seenArtifacts.add(b.artifact);
  }
  const pr = read(apiRoot + "/pulls/" + s.pr);
  const review = read(apiRoot + "/pulls/" + s.pr + "/reviews/" + s.review);
  assert(
    pr.number === s.pr &&
      pr.base.ref === "main" &&
      pr.head.sha === s.head &&
      pr.merged === true &&
      pr.merge_commit_sha === s.merge,
    "Material PR is not integrated",
  );
  assert(
    review.id === s.review &&
      review.state === "APPROVED" &&
      review.commit_id === s.head &&
      review.user.login.toLowerCase() === "edivan5002" &&
      review.user.id !== pr.user.id,
    "Invalid assisted review",
  );
  const tested = read(apiRoot + "/git/commits/" + s.head);
  const merged = read(apiRoot + "/git/commits/" + s.merge);
  assert(
    tested.sha === s.head &&
      merged.sha === s.merge &&
      tested.tree.sha === s.tree &&
      merged.tree.sha === s.tree,
    "Material tree mismatch",
  );
  assert.deepEqual(
    merged.parents.map((p) => p.sha),
    [s.base, s.head],
    "Merge parents mismatch",
  );
  getGit("merge-base", "--is-ancestor", s.merge, "HEAD");
  getGit(
    "diff",
    "--exit-code",
    s.merge,
    "HEAD",
    "--",
    "src/",
    matrixPath,
    validatorPath,
    workflowPath,
    canonicalCsvPath,
    inventoryPath,
    fixturePath,
  );
  const blob = (path) => {
    const value = getGit("rev-parse", s.merge + ":" + path);
    assert(sha40(value), "Missing material blob " + path);
    return value;
  };
  assert.equal(blob(validatorPath), s.harness, "Harness blob mismatch");
  assert.equal(blob(canonicalCsvPath), originalMatrix, "Matrix blob mismatch");
  assert.equal(blob(protectedTypesPath), lockedTypes, "Protected types drift");
  for (const pin of s.runs) {
    const run = read(apiRoot + "/actions/runs/" + pin.id);
    assert(
      run.id === pin.id &&
        run.name === pin.name &&
        run.path === pin.path &&
        run.head_sha === s.head &&
        run.event === "pull_request" &&
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.run_attempt === pin.attempt,
      "Run mismatch " + pin.id,
    );
    if (pin.name === workflowNames[0])
      assert(pin.id === s.run && pin.attempt === s.attempt, "Material attempt mismatch");
    if (pin.name === workflowNames[1]) {
      const visualPin = s.visual;
      assert(
        visualPin?.run === pin.id &&
          visualPin.attempt === pin.attempt &&
          visualPin.tree === s.tree &&
          positiveInteger(visualPin.artifact) &&
          sha64(visualPin.digest) &&
          Number.isSafeInteger(visualPin.screenshots) &&
          visualPin.screenshots >= 8,
        "Invalid Teste C pin",
      );
      assert.deepEqual(visualPin.viewports, [390, 768, 1280, 1440], "Missing Teste C viewports");
      const artifact = read(apiRoot + "/actions/artifacts/" + visualPin.artifact);
      assert(
        artifact.id === visualPin.artifact &&
          artifact.digest === "sha256:" + visualPin.digest &&
          artifact.expired === false &&
          artifact.workflow_run?.id === pin.id &&
          artifact.workflow_run?.head_sha === s.head &&
          artifact.name === "contaos-teste-c-" + pin.id + "-" + pin.attempt,
        "Teste C artifact origin mismatch",
      );
      const jobs = read(
        apiRoot + "/actions/runs/" + pin.id + "/attempts/" + pin.attempt + "/jobs?per_page=100",
      ).jobs;
      const visual = jobs.find((j) => j.name.includes("Teste C Independente"));
      const zero = jobs.find((j) => j.name === "ContaOS Frontend Zero-Drift");
      assert(
        jobs.every((j) => j.conclusion === "success" && j.head_sha === s.head) &&
          visual?.steps.some(
            (t) => t.name.startsWith("Teste C Playwright") && t.conclusion === "success",
          ) &&
          visual.steps.some(
            (t) =>
              t.name.startsWith("Evidencia permanente de screenshots") &&
              t.conclusion === "success",
          ) &&
          zero?.steps.some(
            (t) =>
              t.name.startsWith("P0 RCA V1-V5 — verificar escopo") && t.conclusion === "success",
          ),
        "Zero-Drift, RCA or Test C evidence missing",
      );
    }
  }
  const jobs = read(
    apiRoot + "/actions/runs/" + s.run + "/attempts/" + s.attempt + "/jobs?per_page=100",
  );
  assert.equal(jobs.total_count, s.batches.length);
  assert.equal(jobs.jobs.length, jobs.total_count);
  uniqueEqual(
    jobs.jobs.map((j) => j.id),
    s.batches.map((b) => b.job),
    "Material job inventory",
  );
  for (const b of s.batches) {
    const job = jobs.jobs.find((j) => j.id === b.job);
    assert(
      job.name === "F6 CODE " + b.name + " - jornadas CODE_FIXTURE" &&
        job.head_sha === s.head &&
        job.run_id === s.run &&
        job.run_attempt === s.attempt &&
        job.conclusion === "success" &&
        ["Autotestes e provas materiais do lote", "Validar material parcial e proveniência"].every(
          (n) => job.steps.some((step) => step.name === n && step.conclusion === "success"),
        ),
      "Unverified material job " + b.name,
    );
    const art = read(apiRoot + "/actions/artifacts/" + b.artifact);
    assert(
      art.id === b.artifact &&
        art.expired === false &&
        art.digest === "sha256:" + b.digest &&
        art.workflow_run.id === s.run &&
        art.workflow_run.head_sha === s.head &&
        art.name === "f6-code-" + b.name + "-" + s.head + "-r" + s.attempt,
      "Artifact provenance mismatch " + b.name,
    );
  }
  return {
    ...s,
    blobs: [
      matrixPath,
      validatorPath,
      workflowPath,
      canonicalCsvPath,
      inventoryPath,
      protectedTypesPath,
      fixturePath,
      ...s.batches.map((b) => b.path),
    ].map((path) => ({ path, sha: blob(path) })),
  };
}

export function replayBatch(matrix, s, b, zip, contents = extract(zip)) {
  assert.equal(sha256(zip), b.digest, "ZIP digest mismatch " + b.name);
  const expected = ["observations.json", "receipt.json", "vitest.json"];
  uniqueEqual(Object.keys(contents), [...expected, "SHA256SUMS"], "ZIP file inventory");
  const sums = contents.SHA256SUMS.toString("utf8")
    .trim()
    .split(/\r?\n/)
    .map((row) => /^([0-9a-f]{64})  (observations\.json|receipt\.json|vitest\.json)$/.exec(row));
  assert(sums.every(Boolean), "Invalid SHA256SUMS");
  uniqueEqual(
    sums.map((r) => r[2]),
    expected,
    "SHA256SUMS inventory",
  );
  for (const [, digest, path] of sums)
    assert.equal(sha256(contents[path]), digest, "Corrupted " + path);
  assert.deepEqual(
    expected.map((p) => sha256(contents[p])),
    [b.observationsDigest, b.receiptDigest, b.reportDigest],
    "Pinned content digest mismatch",
  );
  const reports = JSON.parse(contents["vitest.json"]);
  const observations = JSON.parse(contents["observations.json"]);
  const identity = {
    frontendSha: s.head,
    backendSha: s.backend,
    harnessSha: s.harness,
    runId: String(s.run),
    attempt: String(s.attempt),
    jobId: String(b.job),
  };
  const reproduced = validateMaterial(matrix, b.name, observations, reports, identity);
  assert.deepEqual(
    JSON.parse(contents["receipt.json"]),
    {
      ...reproduced,
      observationsSha256: b.observationsDigest,
      reportSha256: b.reportDigest,
    },
    "Replayed receipt mismatch",
  );
  const suite = reports.testResults[0];
  assert(suite.name.endsWith("/" + b.path), "Pinned test path mismatch");
  return observations.map((o) => {
    const test = suite.assertionResults.find((t) =>
      t.title.startsWith(o.caseId + " " + o.kind + ": "),
    );
    assert(test?.status === "passed", "Observation without matched passed test");
    return {
      caseId: o.caseId,
      polarity: o.kind,
      outcome: "PASS",
      batch: b.name,
      title: test.title,
      actor: o.actor,
      profile: o.profile,
      tenant: o.tenant,
      preconditions: o.preconditions,
      observed: o.observed,
      postconditions: o.postconditions,
      recovery: o.recoveryProof,
      negative: o.negativeProof,
      cleanup: o.cleanupStatus,
      stepDigests: o.steps.map(({ phase, observed }) => ({
        phase,
        sha256: sha256(JSON.stringify(observed)),
      })),
      observationDigest: sha256(JSON.stringify(o)),
      scope: o.scope,
    };
  });
}

export function buildCandidate(source, matrix, proofs) {
  assert.equal(matrix.cases.length, 138);
  assert.equal(matrix.transversal.length, 4);
  const allCases = [...matrix.cases, ...matrix.transversal];
  const polarities = ["positive", "negative"];
  const key = (id, kind) => id + ":" + kind;
  uniqueEqual(
    proofs.map((row) => key(row.caseId, row.polarity)),
    allCases.flatMap((c) => polarities.map((kind) => key(c.caseId, kind))),
    "Positive and negative coverage",
  );
  const observed = new Map(proofs.map((row) => [key(row.caseId, row.polarity), row]));
  const buildEntry = (c) => ({
    ...c,
    status: "SUBMITTED_UNVERIFIED",
    tests: polarities.map((kind) => {
      const proof = observed.get(key(c.caseId, kind));
      assert(
        proof.outcome === "PASS" &&
          proof.batch === c.batch &&
          proof.scope === "CODE_FIXTURE" &&
          proof.cleanup === "CLEAN" &&
          sha64(proof.observationDigest),
        "Invalid proof scope",
      );
      return proof;
    }),
  });
  return {
    schema: "contaos.ifv1.f6.code-attestation-candidate.v1",
    state: "CANDIDATE_NOT_CERTIFIED",
    scope: "CODE_FIXTURE",
    source,
    counts: {
      cases: 138,
      mandatory: 120,
      conditional: 18,
      positive: 138,
      negative: 138,
      proofs: 276,
      supplementaryCases: 4,
      supplementaryProofs: 8,
      failed: 0,
      blocked: 0,
      skipped: 0,
      notRun: 0,
      notApplicable: 0,
    },
    entries: matrix.cases.map(buildEntry),
    supplementary: matrix.transversal.map(buildEntry),
    certification: "NOT_CERTIFIED",
    live: "NOT_RUN",
    production: "NO-GO",
  };
}

export function reproduce(source, read = api, fetchArchive = download, getGit = git) {
  const matrix = checkInventory(loadMatrix(), JSON.parse(readFileSync(inventoryPath, "utf8")));
  const verified = verifySource(source, matrix, read, getGit);
  const proofs = verified.batches.flatMap((b) =>
    replayBatch(matrix, verified, b, fetchArchive(b.artifact)),
  );
  return Buffer.from(JSON.stringify(buildCandidate(verified, matrix, proofs)) + "\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  const [source, output] = process.argv.slice(2);
  assert(source && output, "Source and output required");
  const candidate = reproduce(JSON.parse(readFileSync(source, "utf8")));
  writeFileSync(output, candidate, { flag: "wx" });
  console.log("F6 candidate SHA-256 " + sha256(candidate));
}

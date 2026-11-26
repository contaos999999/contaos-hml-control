import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BACKEND,
  BATCHES,
  validateMaterial,
} from "./f5-code-material-evidence.mjs";
import { extract } from "./integracao-v1-fase4-code-attestation-live.mjs";

export const repository = "contaos999999/contaos-hml-control";
export const apiRoot = "repos/" + repository;
export const phaseDirectory =
  "docs/frontend/auditorias/integracao-funcional-v1/fase5/";
export const candidateFile = "F5_CODE_ATTESTATION_CANDIDATE.json";
export const matrixPath =
  "docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv";
const files = Array.from(
  { length: 6 },
  (_, i) => phaseDirectory + "F5_" + (i + 1) + "_CASE_CONTRACTS_PROPOSAL.json",
);
const validatorPath = "scripts/hml/f5-code-material-evidence.mjs";
const workflowPath = ".github/workflows/contaos-f5-code-material.yml";
const workflowNames = [
  "ContaOS F5 CODE - provas materiais parciais",
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
export const download = (id) =>
  operations(apiRoot + "/actions/artifacts/" + id + "/zip", true);
export const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const sha40 = (v) => typeof v === "string" && /^[0-9a-f]{40}$/.test(v);
const sha64 = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const positiveInteger = (v) => Number.isSafeInteger(v) && v > 0;

function uniqueEqual(a, b, message) {
  assert.equal(new Set(a).size, a.length, message);
  assert.equal(new Set(b).size, b.length, message);
  assert.deepEqual([...a].sort(), [...b].sort(), message);
}

export function catalogue(csv, inventory) {
  const [head, ...lines] = csv.trim().split(/\r?\n/);
  const fields = head.split(",");
  const rows = lines.map((line) => {
    const matches = [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)];
    assert(
      matches.length === fields.length &&
        matches.map((m) => m[0]).join("") === line,
      "Invalid matrix row",
    );
    return Object.fromEntries(
      matches.map((match, i) => [fields[i], match[1].replace(/""/g, '"')]),
    );
  });
  assert.equal(rows.length, 138);
  const mandatory = rows.filter(
    (r) => r.classe_original === "OBRIGATORIA",
  ).length;
  const conditional = rows.filter(
    (r) => r.classe_original === "CONDICIONAL",
  ).length;
  assert.deepEqual(
    [mandatory, conditional],
    [120, 18],
    "Matrix classification",
  );
  const ids = rows.map((r) => r.caso_fase5);
  uniqueEqual(
    ids,
    inventory.map((r) => r.caseId),
    "Inventory IDs",
  );
  uniqueEqual(
    ids,
    Object.values(BATCHES)
      .flat()
      .map((id) => "IFV1-F5-C" + id),
    "Material batch IDs",
  );
  const pinned = new Map(inventory.map((r) => [r.caseId, r]));
  return rows.map((r) => {
    const row = pinned.get(r.caso_fase5);
    assert(/^IFV1-F5-C\d{4}$/.test(row.caseId), "Invalid case identity");
    assert.deepEqual(
      [
        row.connection,
        row.origin,
        row.destination,
        row.classification,
        row.producer,
        row.consumer,
        row.sourceReferences,
      ],
      [
        r.id_conexao,
        r.tela_origem,
        r.tela_destino,
        r.classe_original,
        r.produtor_original,
        r.consumidor_original,
        r.evidencia_codigo_original,
      ],
      "Matrix binding for " + row.caseId,
    );
    return {
      caseId: row.caseId,
      sourceConnectionId: row.connection,
      origin: row.origin,
      destination: row.destination,
      classification: row.classification,
      producer: row.producer,
      consumer: row.consumer,
      expectation: r.invariante_original,
      references: row.sourceReferences,
    };
  });
}

export function verifySource(s, read = api, getGit = git) {
  assert(
    s.pr === 790 && s.repository === repository && s.backend === BACKEND,
    "Invalid pinned material source",
  );
  assert(
    [s.base, s.head, s.merge, s.harness, s.tree].every(sha40) &&
      s.head !== s.merge,
    "Missing code identity",
  );
  assert(
    [s.review, s.run, s.attempt].every(positiveInteger),
    "Missing execution identity",
  );
  uniqueEqual(
    s.runs.map((r) => r.name),
    workflowNames,
    "Required workflows",
  );
  uniqueEqual(
    s.batches.map((b) => b.name),
    Object.keys(BATCHES),
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
        [b.digest, b.receiptDigest, b.observationsDigest, b.reportDigest].every(
          sha64,
        ) &&
        /^src\/test\/f5-code-[a-z0-9-]+\.test\.tsx?$/.test(b.path),
      "Invalid batch identity",
    );
    assert(
      !seenBatches.has(b.job) && !seenArtifacts.has(b.artifact),
      "Duplicate job or artifact",
    );
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
    ...files,
  );
  const blob = (path) => {
    const value = getGit("rev-parse", s.merge + ":" + path);
    assert(sha40(value), "Missing material blob " + path);
    return value;
  };
  assert.equal(blob(validatorPath), s.harness, "Harness blob mismatch");
  assert.equal(
    blob(matrixPath),
    "bb7ce43f9c334f2f03e9aafab405addadfe5e19a",
    "Matrix blob mismatch",
  );
  for (const pin of s.runs) {
    const run = read(apiRoot + "/actions/runs/" + pin.id);
    assert(
      run.id === pin.id &&
        run.name === pin.name &&
        run.head_sha === s.head &&
        run.event === "pull_request" &&
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.run_attempt === pin.attempt,
      "Run mismatch " + pin.id,
    );
    if (pin.name === workflowNames[0])
      assert(
        pin.id === s.run && pin.attempt === s.attempt,
        "Material attempt mismatch",
      );
    if (pin.name === workflowNames[1]) {
      const jobs = read(
        apiRoot +
          "/actions/runs/" +
          pin.id +
          "/attempts/" +
          pin.attempt +
          "/jobs?per_page=100",
      ).jobs;
      const visual = jobs.find((j) => j.name.includes("Teste C Independente"));
      const zero = jobs.find((j) => j.name === "ContaOS Frontend Zero-Drift");
      assert(
        jobs.every(
          (j) => j.conclusion === "success" && j.head_sha === s.head,
        ) &&
          visual?.steps.some(
            (t) =>
              t.name.startsWith("Teste C Playwright") &&
              t.conclusion === "success",
          ) &&
          visual.steps.some(
            (t) =>
              t.name.startsWith("Evidencia permanente de screenshots") &&
              t.conclusion === "success",
          ) &&
          zero?.steps.some(
            (t) =>
              t.name.startsWith("P0 RCA V1-V5 — verificar escopo") &&
              t.conclusion === "success",
          ),
        "Zero-Drift, RCA or Test C evidence missing",
      );
    }
  }
  const jobs = read(
    apiRoot +
      "/actions/runs/" +
      s.run +
      "/attempts/" +
      s.attempt +
      "/jobs?per_page=100",
  );
  assert.equal(jobs.total_count, s.batches.length);
  uniqueEqual(
    jobs.jobs.map((j) => j.id),
    s.batches.map((b) => b.job),
    "Material job inventory",
  );
  for (const b of s.batches) {
    const job = jobs.jobs.find((j) => j.id === b.job);
    assert(
      job.name === "F5 CODE " + b.name + " - material e isolamento" &&
        job.head_sha === s.head &&
        job.run_id === s.run &&
        job.run_attempt === s.attempt &&
        job.conclusion === "success" &&
        [
          "Autotestes e provas materiais do lote",
          "Validar material parcial e proveniência",
        ].every((n) =>
          job.steps.some(
            (step) => step.name === n && step.conclusion === "success",
          ),
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
        art.name === "f5-code-" + b.name + "-" + s.head + "-r" + s.attempt,
      "Artifact provenance mismatch " + b.name,
    );
  }
  return {
    ...s,
    blobs: [
      matrixPath,
      validatorPath,
      workflowPath,
      ...files,
      ...s.batches.map((b) => b.path),
    ].map((path) => ({ path, sha: blob(path) })),
  };
}

export function replayBatch(s, b, zip, contents = extract(zip)) {
  assert.equal(sha256(zip), b.digest, "ZIP digest mismatch " + b.name);
  const expected = ["observations.json", "receipt.json", "vitest.json"];
  uniqueEqual(
    Object.keys(contents),
    [...expected, "SHA256SUMS"],
    "ZIP file inventory",
  );
  const sums = contents.SHA256SUMS.toString("utf8")
    .trim()
    .split(/\r?\n/)
    .map((row) =>
      /^([0-9a-f]{64})  (observations\.json|receipt\.json|vitest\.json)$/.exec(
        row,
      ),
    );
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
    frontend: s.head,
    backend: s.backend,
    harness: s.harness,
    run: String(s.run),
    attempt: String(s.attempt),
    job: String(b.job),
  };
  const reproduced = validateMaterial(b.name, observations, reports, identity);
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
    assert(
      test?.status === "passed",
      "Observation without matched passed test",
    );
    return {
      caseId: o.caseId,
      polarity: o.kind,
      outcome: "PASS",
      batch: b.name,
      title: test.title,
      actor: o.actor,
      role: o.role ?? null,
      tenant: o.tenant,
      target: o.target,
      operation: o.operation,
      frontier: o.frontier,
      decision: o.decision,
      observation: o.readback,
      observationDigest: sha256(JSON.stringify(o)),
      mode: o.mode,
    };
  });
}

export function buildCandidate(source, cases, proofs) {
  assert.equal(cases.length, 138);
  assert.equal(proofs.length, 276);
  const key = (id, kind) => id + ":" + kind;
  uniqueEqual(
    proofs.map((row) => key(row.caseId, row.polarity)),
    cases.flatMap((c) =>
      ["positive", "negative"].map((kind) => key(c.caseId, kind)),
    ),
    "Positive and negative coverage",
  );
  const observed = new Map(
    proofs.map((row) => [key(row.caseId, row.polarity), row]),
  );
  const entries = cases.map((c) => ({
    ...c,
    status: "SUBMITTED_UNVERIFIED",
    tests: ["positive", "negative"].map((kind) => {
      const proof = observed.get(key(c.caseId, kind));
      assert(
        proof.outcome === "PASS" &&
          proof.mode === "CODE_FIXTURE" &&
          sha64(proof.observationDigest),
        "Invalid proof scope",
      );
      return proof;
    }),
  }));
  return {
    schema: "contaos.ifv1.f5.code-attestation-candidate.v1",
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
      failed: 0,
      blocked: 0,
    },
    entries,
    certification: "NOT_CERTIFIED",
    live: "NOT_RUN",
    production: "NO-GO",
  };
}

export function reproduce(
  source,
  read = api,
  fetchArchive = download,
  getGit = git,
) {
  const verified = verifySource(source, read, getGit);
  const inventory = files.flatMap(
    (path) => JSON.parse(readFileSync(path, "utf8")).cases,
  );
  const items = catalogue(readFileSync(matrixPath, "utf8"), inventory);
  const proofs = verified.batches.flatMap((b) =>
    replayBatch(verified, b, fetchArchive(b.artifact)),
  );
  return Buffer.from(
    JSON.stringify(buildCandidate(verified, items, proofs)) + "\n",
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  const [source, output] = process.argv.slice(2);
  assert(source && output, "Source and output required");
  const candidate = reproduce(JSON.parse(readFileSync(source, "utf8")));
  writeFileSync(output, candidate, { flag: "wx" });
  console.log("F5 candidate SHA-256 " + sha256(candidate));
}

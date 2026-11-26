import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicIds, regularIds, validateLedger } from "../p0-v1-traceability-gate.mjs";
import {
  apiRoot,
  git,
  operations,
  repository,
  sha256,
} from "./integracao-v1-fase6-code-attestation.mjs";
import { checkArtifact, checkRun, verifyMember } from "./integracao-v1-fase7-code-reconcile.mjs";

const sourceFile = "docs/frontend/auditorias/integracao-funcional-v1/fase8/F8_CODE_SOURCES.json";
const f7 = "docs/frontend/auditorias/integracao-funcional-v1/fase7/";
const backendRoot = "repos/contaos999999/develop";
const locked = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const backend = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
const limits = { live: "NOT_RUN", production: "NO-GO", accepted: ["R-01", "R-02", "R-03"] };
const inheritedExceptions = [
  "R01_UPLOAD_E2E_REAL",
  "R02_WORKER_E2E_REAL",
  "R03_ISOLAMENTO_REAL_MULTIUSUARIO",
];
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const text = (s) => s.replace(/\s+/g, " ").trim();
const key = (regular, index) => regular + ":" + index;

function collect(rows, makeKey) {
  const result = new Map(rows.map((r) => [makeKey(r), r]));
  assert.equal(result.size, rows.length, "Duplicate criterion or requirement");
  return result;
}

function verifyReferences(rows, checkpoints) {
  for (const row of rows) {
    assert(
      Array.isArray(row.proof) &&
        row.proof.length > 0 &&
        row.proof.every((p) => typeof p === "string" && p.trim()),
      "Missing historical proof reference",
    );
    for (const link of row.proof) {
      const match = /^phase(\d+):(\d+)$/.exec(link);
      if (match)
        assert.equal(Number(match[2]), checkpoints[match[1]], "Unbound historical checkpoint");
    }
  }
}

export function reconcileCriteria(legacy, inventory, checkpoints) {
  assert.deepEqual(validateLedger(inventory), [], "Current V1 inventory invalid");
  assert.equal(legacy.schema, "contaos.v1.phase8.reconciliation.v1");
  assert.deepEqual(
    legacy.accepted_exceptions,
    inheritedExceptions,
    "Historical exceptions changed",
  );
  assert.equal(legacy.prod_untouched, true);
  assert.deepEqual(legacy.phase_certificates, checkpoints, "Historical checkpoint map changed");
  assert.deepEqual([legacy.criteria_total, legacy.unresolved_count], [488, 0]);
  const criteria = collect(legacy.criteria, (r) => key(r.regular_id, r.criterion_index));
  const original = inventory.regular.flatMap((p) =>
    p.criteria.map((r) => ({ regular: p.id, ...r })),
  );
  assert.equal(collect(original, (r) => key(r.regular, r.index)).size, 488);
  assert.equal(criteria.size, 488, "Missing historical criterion");
  assert.deepEqual([...new Set(legacy.criteria.map((r) => r.regular_id))].sort(), regularIds);
  const caveats = new Set(
    Array.from({ length: 15 }, (_, i) => key(String(i + 1).padStart(2, "0"), 4)),
  );
  const rows = original.map((item) => {
    const id = key(item.regular, item.index),
      record = criteria.get(id);
    assert(
      record && text(record.criterion_text) === text(item.text),
      "Criterion text/source mismatch " + id,
    );
    assert.equal(
      record.decision,
      caveats.has(id) ? "ACEITE_RESSALVA_R03" : "PASS_REAL",
      "Decision or R-03 scope changed " + id,
    );
    return [id, record.decision, record.proof];
  });
  const decisionTotals = {
    PASS_REAL: rows.filter((r) => r[1] === "PASS_REAL").length,
    ACEITE_RESSALVA_R03: rows.filter((r) => r[1] === "ACEITE_RESSALVA_R03").length,
  };
  assert.deepEqual(decisionTotals, { PASS_REAL: 473, ACEITE_RESSALVA_R03: 15 });
  assert.deepEqual(legacy.criteria_summary, decisionTotals);
  const atomics = collect(legacy.atomics_v1, (a) => a.atomic_id);
  assert.deepEqual([...atomics.keys()], atomicIds);
  const functional = legacy.atomics_v1.filter((a) => Number(a.atomic_id) <= 24);
  const assessments = collect(legacy.nfr_assessment, (a) => a.atomic_id);
  assert.deepEqual(
    [...assessments.keys()],
    atomicIds.slice(25),
    "Missing historical NFR assessment",
  );
  assert(
    functional.every(
      (a) => a.requirement_id && /^PASS_(REAL|COM_RESSALVA_R0[12])$/.test(a.decision),
    ),
    "Invalid historical atomic decision",
  );
  assert(
    legacy.nfr_assessment.every((a) => atomics.get(a.atomic_id).requirement_id === a.id && a.note),
    "Missing historical NFR limits",
  );
  assert.deepEqual(
    legacy.nfr_assessment.map((a) => a.decision),
    [
      "PASS_ESCOPADO_HML",
      "PASS_ESCOPADO_HML",
      "PASS_COM_RESSALVA_R01",
      "PASS_COM_RESSALVA_R01",
      "PASS_COM_RESSALVA_R02",
      "PASS_ESCOPADO_HML",
      "PASS_REAL",
      "PASS_REAL",
      "PASS_REAL",
      "PASS_IMPLEMENTACAO_HML_PROD_NA",
      "PASS_REAL",
      "PASS_ESCOPADO_HML_PROD_GATE",
    ],
    "Historical NFR scope changed",
  );
  verifyReferences([...legacy.criteria, ...atomics.values(), ...assessments.values()], checkpoints);
  return {
    criteria: 488,
    legacyCriteria: 416,
    normalizedCriteria: 72,
    regulares: regularIds.length,
    atomicV1Brand: functional.length,
    nfr: assessments.size,
    historicalDecisions: decisionTotals,
    unresolved: 0,
    criteriaTraceSha256: sha256(JSON.stringify(rows)),
  };
}

export function checkF7(manifest, receipt, pin) {
  assert.deepEqual(
    [manifest.phase, manifest.result, manifest.scope, manifest.live, manifest.production],
    ["IFV1_F7_CODE", "PASS", "INTEGRACAO_FUNCIONAL_V1_CODE", "NOT_RUN", "NO-GO"],
  );
  assert.deepEqual(
    manifest.predecessors.map((p) => ({
      phase: p.phase,
      pr: p.pr,
      merge: p.merge,
      certificate: p.certificate,
    })),
    pin.predecessors,
  );
  assert.deepEqual(
    pin.predecessors.map((p) => p.phase),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    { ...manifest.material, receiptSha256: manifest.receipt.sha256 },
    pin.material,
    "F7 material provenance changed",
  );
  assert(
    receipt.head === pin.material.head &&
      receipt.tree === pin.material.tree &&
      receipt.run === pin.material.run &&
      receipt.attempt === pin.material.attempt &&
      receipt.state === "EVIDENCE_VERIFIED_CERTIFICATE_PENDING",
  );
  assert.deepEqual(receipt.counts, manifest.counts);
  assert.deepEqual(receipt.provenance, manifest.verified);
  assert.deepEqual(receipt.limits, limits);
  const r = receipt.counts;
  assert.deepEqual(
    [
      r.certificates,
      r.navigation,
      r.canonical,
      r.mandatory,
      r.conditional,
      r.codeProofs,
      r.supplementaryProofs,
    ],
    [6, 52, 138, 120, 18, 1104, 8],
  );
  assert.equal(manifest.traceability.sha256, receipt.traceSha256);
}

function checkFile(pin) {
  assert.equal(sha256(readFileSync(pin.path)), pin.sha256, "File bytes changed " + pin.path);
  assert.equal(git("hash-object", pin.path), pin.blob, "Protected blob changed " + pin.path);
}

const productPaths = [
  "src/",
  "public/",
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "vite.config.ts",
  ":!src/test/",
];

function checkBaseline(source) {
  assert.deepEqual(
    [source.schema, source.repository, source.backend, source.typesBlob],
    ["contaos.ifv1.f8.code-sources.v1", repository, backend, locked],
  );
  assert.deepEqual(source.limits, limits);
  assert.equal(source.baseline, source.f7.merge);
  assert.equal(git("rev-parse", "HEAD:src/integrations/supabase/types.ts"), locked);
  assert.equal(source.historical.files[0].blob, "7045c0a02243b242835e7ea6817b850287917141");
  assert.equal(source.historical.files[1].blob, "6c8021a6f09a22a773e55482571021b993ee75f1");
  assert.equal(source.governance.priorityOrder.blob, "8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff");
  assert.equal(source.governance.inventory.blob, "9f9dd3d56a12183e0462f7d831822bb09cd658a5");
  git("merge-base", "--is-ancestor", source.baseline, "HEAD");
  for (const pin of [source.historical, source.f7]) {
    git("merge-base", "--is-ancestor", pin.merge, source.baseline);
    assert.equal(
      git("show", "-s", "--format=%P", pin.merge),
      pin.base + " " + pin.head,
      "Certificate parents changed",
    );
    assert.equal(git("rev-parse", pin.merge + "^{tree}"), pin.tree, "Certified merge tree changed");
    assert.equal(git("rev-parse", pin.head + "^{tree}"), pin.tree, "Reviewed tree changed");
    for (const file of pin.files) {
      checkFile(file);
      assert.equal(git("rev-parse", pin.merge + ":" + file.path), file.blob);
    }
  }
  for (const p of source.f7.predecessors) {
    git("merge-base", "--is-ancestor", p.merge, source.f7.merge);
    checkFile(p.certificate);
    assert.equal(git("rev-parse", p.merge + ":" + p.certificate.path), p.certificate.blob);
  }
  for (const file of Object.values(source.governance)) checkFile(file);
  const changed = git(
    "diff",
    "--name-only",
    source.product.historical,
    source.product.navigation,
    "--",
    ...productPaths,
  ).split("\n");
  assert.equal(changed.length, 5);
  assert.deepEqual(changed, source.product.pathsChanged, "Historical product delta changed");
  git("diff", "--exit-code", source.product.navigation, "HEAD", "--", ...productPaths);
  execFileSync("sha256sum", ["-c", "SHA256SUMS"], { cwd: dirname(f7 + "SHA256SUMS") });
}

export function checkReview(pr, pin, review) {
  assert(
    pr.number === pin.pr &&
      pr.merged &&
      pr.head.sha === pin.head &&
      pr.base.ref === "main" &&
      pr.merge_commit_sha === pin.merge,
    "Unverified certificate PR",
  );
  if (pin.review === null) {
    assert.equal(pin.pr, 591, "Historical review mode assigned to wrong PR");
  } else {
    assert(
      review.id === pin.review &&
        review.user.login.toLowerCase() === "edivan5002" &&
        review.user.id !== pr.user.id &&
        review.commit_id === pin.head &&
        review.state === "APPROVED",
      "Assisted review mismatch",
    );
  }
}

function request(target, binary = false) {
  for (let attempt = 0; ; attempt++) {
    try {
      return operations(target, binary);
    } catch (error) {
      if (attempt >= 2 || !/\(HTTP (502|503|504)\)/.test(String(error.stderr))) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000 * (attempt + 1));
    }
  }
}

function verifyNative(source) {
  const get = (path) => JSON.parse(request(path));
  const local = (path) => get(apiRoot + path);
  assert.equal(
    get(backendRoot + "/git/ref/heads/main").object.sha,
    backend,
    "Normative backend HEAD changed",
  );
  for (const pin of [source.historical, source.f7]) {
    const pr = local("/pulls/" + pin.pr);
    checkReview(
      pr,
      pin,
      pin.review === null ? null : local("/pulls/" + pin.pr + "/reviews/" + pin.review),
    );
    assert.equal(pin.runs.length, pin.pr === 591 ? 2 : 6);
    for (const r of pin.runs) {
      assert(r.head === pin.head && r.conclusion === "success");
      checkRun(r, local("/actions/runs/" + r.id));
    }
  }
  for (const checkpoint of source.historical.checkpoints) {
    const note = get(backendRoot + "/issues/comments/" + checkpoint.id);
    assert(
      note.id === checkpoint.id &&
        note.issue_url.endsWith("/develop/issues/138") &&
        note.user.login === checkpoint.author &&
        note.body.includes("COMPLETED") &&
        sha256(note.body) === checkpoint.bodySha256,
      "Historical gate checkpoint changed",
    );
  }
  for (const number of source.product.fixPrs) {
    const p = local("/pulls/" + number);
    assert(p.merged && p.base.ref === "main" && p.number === number);
    git("merge-base", "--is-ancestor", p.merge_commit_sha, source.product.navigation);
  }
  const material = source.f7.material;
  const run = local("/actions/runs/" + material.run);
  assert(
    run.head_sha === material.head &&
      run.run_attempt === material.attempt &&
      run.conclusion === "success" &&
      run.path === ".github/workflows/contaos-f7-code-reconcile.yml" &&
      run.event === "pull_request",
    "F7 material run changed",
  );
  const prefix = "/actions/runs/" + material.run;
  const jobs = local(prefix + "/attempts/" + material.attempt + "/jobs?per_page=100");
  const job = jobs.jobs.find((item) => item.id === material.job);
  assert(
    jobs.total_count === 1 &&
      job?.head_sha === material.head &&
      job.run_id === material.run &&
      job.run_attempt === material.attempt &&
      job.conclusion === "success" &&
      job.name === "F7 CODE - conferir cadeia e cobertura",
    "F7 material job changed",
  );
  const { artifacts } = local(prefix + "/artifacts?per_page=100");
  const pin = {
    id: material.artifact,
    name: "f7-code-reconciliation-" + material.head + "-r" + material.attempt,
    zipSha256: material.zipSha256,
    memberSha256: material.receiptSha256,
  };
  checkArtifact(
    pin,
    { id: material.run, head: material.head },
    artifacts.find((a) => a.id === pin.id),
  );
  verifyMember(pin, request(apiRoot + "/actions/artifacts/" + pin.id + "/zip", true));
  return {
    historicalCheckpoints: 7,
    historicalRequiredRuns: 2,
    f7RequiredRuns: 6,
    nativeF7Artifact: pin.id,
    compatibleCodeFixes: 4,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, output] = process.argv.slice(2),
    source = read(sourceFile);
  checkBaseline(source);
  const legacy = read(source.historical.files[1].path),
    indexed = read(source.governance.inventory.path);
  assert.equal(legacy.source_ledger_sha, source.governance.inventory.blob);
  assert.equal(legacy.backend_head, source.historicBackend);
  assert.equal(legacy.frontend_head, source.historical.base);
  const manifest = read(f7 + "F7_CODE_CERTIFICATION.json"),
    receipt = read(f7 + "F7_CODE_RECONCILIATION_RECEIPT.json");
  checkF7(manifest, receipt, source.f7);
  const checkpoints = Object.fromEntries(
    source.historical.checkpoints.map(({ phase, id }) => [phase, id]),
  );
  assert.equal(Object.keys(checkpoints).length, 7);
  const counts = reconcileCriteria(legacy, indexed, checkpoints);
  if (mode === "--local") {
    console.log(JSON.stringify(counts));
  } else {
    assert.equal(mode, "--verify");
    assert.equal(process.env.GITHUB_REPOSITORY, repository);
    assert.equal(git("rev-parse", "HEAD"), process.env.F8_EXPECTED_HEAD);
    const out = {
      schema: "contaos.ifv1.f8.code-consolidation-receipt.v1",
      state: "CONSOLIDATED_CERTIFICATE_PENDING",
      scope: "INTEGRACAO_FUNCIONAL_V1_CODE",
      head: git("rev-parse", "HEAD"),
      tree: git("rev-parse", "HEAD^{tree}"),
      run: Number(process.env.GITHUB_RUN_ID),
      attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      backend,
      sourceSha256: sha256(readFileSync(sourceFile)),
      criteria: counts,
      f7Counts: receipt.counts,
      previous: {
        historical: source.historical.merge,
        integrationF7: source.f7.merge,
        receipt: source.f7.material.receiptSha256,
      },
      governance: verifyNative(source),
      limits,
    };
    assert(out.run > 0 && out.attempt > 0 && output);
    writeFileSync(output, JSON.stringify(out, null, 2) + "\n", { flag: "wx" });
    console.log(
      "F8 criterios reconciliados " + counts.criteria + " SHA-256 " + counts.criteriaTraceSha256,
    );
  }
}

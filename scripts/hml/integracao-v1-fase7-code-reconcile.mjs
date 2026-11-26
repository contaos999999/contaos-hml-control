import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  apiRoot,
  git,
  operations,
  repository,
  sha256,
} from "./integracao-v1-fase6-code-attestation.mjs";

const root = "docs/frontend/auditorias/integracao-funcional-v1/";
const prefix = (phase) => root + "fase" + phase + "/";
const sourceFile = prefix(7) + "F7_CODE_SOURCES.json";
const traceFile = prefix(7) + "F7_CODE_TRACEABILITY.json";
const backend = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
const locked = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const canonical = "bb7ce43f9c334f2f03e9aafab405addadfe5e19a";
const sha64 = (s) => typeof s === "string" && /^[a-f0-9]{64}$/.test(s);
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const ledgerPath = (phase) => prefix(phase) + "F" + phase + "_CODE_ATTESTATION_CANDIDATE.json";
const receiptPath = (phase) => prefix(phase) + "F" + phase + "_CODE_PROMOTION_RECEIPT.json";
const manifestPath = (phase) => prefix(phase) + "F" + phase + "_CODE_CERTIFICATION.json";
const csv = (path) =>
  JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        "import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],newline='',encoding='utf-8')))))",
        path,
      ],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    ),
  );

function index(rows, key) {
  const map = new Map(rows.map((row) => [key(row), row]));
  assert.equal(rows.length, map.size, "Duplicate evidence identity");
  return map;
}

function checkFile(file) {
  assert.equal(sha256(readFileSync(file.path)), file.sha256, "File digest " + file.path);
  assert.equal(git("hash-object", file.path), file.blob, "Git blob " + file.path);
}

export function checkEvidenceFiles(source) {
  assert.equal(source.schema, "contaos.ifv1.f7.code-sources.v1");
  assert.equal(source.repository, repository);
  assert.equal(source.backend, backend);
  assert.equal(source.typesBlob, locked);
  assert.equal(source.canonical.blob, canonical);
  assert.equal(git("rev-parse", "HEAD:src/integrations/supabase/types.ts"), locked);
  assert.deepEqual(source.limits, {
    live: "NOT_RUN",
    production: "NO-GO",
    accepted: ["R-01", "R-02", "R-03"],
  });
  assert.deepEqual(
    source.phaseCertificates.map((p) => p.phase),
    [1, 2, 3, 4, 5, 6],
  );
  assert.equal(new Set(source.phaseCertificates.map((p) => p.pr)).size, 6);
  git("merge-base", "--is-ancestor", source.baseline, "HEAD");
  git(
    "diff",
    "--exit-code",
    source.navigation.frontend,
    "HEAD",
    "--",
    "src/",
    "public/",
    "package.json",
    "bun.lock",
    "bunfig.toml",
    "vite.config.ts",
    ":!src/test/",
  );
  for (const file of [source.canonical, source.masterPlan]) checkFile(file);
  for (const p of source.phaseCertificates) {
    git("merge-base", "--is-ancestor", p.merge, source.baseline);
    assert.equal(
      git("show", "-s", "--format=%P", p.merge),
      p.base + " " + p.head,
      "Merge parents F" + p.phase,
    );
    assert.equal(git("rev-parse", p.merge + "^{tree}"), p.tree, "Merge tree F" + p.phase);
    assert.equal(git("rev-parse", p.head + "^{tree}"), p.tree, "Reviewed tree F" + p.phase);
    for (const file of [p.certificate, ...p.files]) {
      checkFile(file);
      assert.equal(
        git("rev-parse", p.merge + ":" + file.path),
        file.blob,
        "Certificate version F" + p.phase,
      );
    }
  }
}

function checkCodeLedger(phase, ledger, receipt, manifest, cert) {
  assert.equal(ledger.state, "CANDIDATE_NOT_CERTIFIED");
  assert.equal(receipt.state, "LEDGER_VERIFIED_CERTIFICATE_PENDING");
  const c = ledger.counts;
  assert.deepEqual(
    [c.cases, c.mandatory, c.conditional, c.proofs ?? c.tests, c.failed, c.blocked],
    [138, 120, 18, 276, 0, 0],
    "Incomplete ledger F" + phase,
  );
  assert.equal(ledger.entries.length, 138);
  assert.deepEqual(receipt.counts, c, "Ledger/receipt counts F" + phase);
  const file = cert.files.find((f) => f.path === ledgerPath(phase));
  const digest = receipt.ledgerSha256 ?? receipt.candidateSha256;
  assert.equal(digest, file?.sha256, "Promoted ledger digest F" + phase);
  if (phase < 4) return;
  assert.deepEqual(
    [manifest.phase, manifest.result, manifest.scope, manifest.live, manifest.production],
    ["IFV1_F" + phase + "_CODE", "PASS", "CODE_FIXTURE", "NOT_RUN", "NO-GO"],
  );
  const official = manifest.counts;
  assert.deepEqual(
    [
      official.cases,
      official.mandatory,
      official.conditional,
      official.proofs,
      official.failed,
      official.blocked,
      official.skipped,
      official.notRun,
      official.notApplicable,
    ],
    [138, 120, 18, 276, 0, 0, 0, 0, 0],
    "Incomplete certification F" + phase,
  );
  assert.equal(manifest.ledger.sha256, file.sha256);
  assert.equal(manifest.ledger.blob, file.blob);
  assert.equal(
    manifest.receipt.sha256,
    cert.files.find((f) => f.path === receiptPath(phase))?.sha256,
  );
}

export function checkPair(id, tests) {
  assert.equal(tests.length, 2, "Missing or extra proof for " + id);
  const pairs = index(tests, (t) => t.kind ?? t.polarity);
  return ["positive", "negative"].map((kind) => {
    const t = pairs.get(kind);
    assert(t && t.caseId === id && t.outcome === "PASS", "Invalid " + kind + " proof for " + id);
    const digest = t.outputSha256 ?? t.observationSha256 ?? t.observationDigest;
    assert(sha64(digest), "Missing material digest for " + id);
    return [t, digest];
  });
}

function materialPair(phase, entry, ledger, group) {
  const native = index(group.archives, (a) => a.id);
  return checkPair(entry.caseId, entry.tests).map(([proof, digest]) => {
    const b = ledger.source.batches?.find((batch) => batch.name === proof.batch);
    const id = proof.artifact ? Number(proof.artifact) : (b?.artifact ?? ledger.source.artifactId);
    const artifact = native.get(id);
    assert(artifact, "Unbound artifact for " + entry.caseId);
    const claimed = proof.artifactDigest ?? b?.digest ?? ledger.source.artifactSha256;
    assert.equal(artifact.zipSha256, claimed, "Artifact digest " + entry.caseId);
    assert.equal(
      group.run.id,
      Number(proof.run ?? ledger.source.run ?? ledger.source.functionalRun),
    );
    const job = Number(proof.job ?? b?.job ?? ledger.source.functionalJob);
    assert.equal(artifact.job, job, "Wrong proof job " + entry.caseId);
    return [id, job, digest];
  });
}

export function readInputs(source) {
  const ledgers = [3, 4, 5, 6].map((phase) => {
    const ledger = json(ledgerPath(phase));
    checkCodeLedger(
      phase,
      ledger,
      json(receiptPath(phase)),
      phase > 3 && json(manifestPath(phase)),
      source.phaseCertificates[phase - 1],
    );
    return ledger;
  });
  return {
    canonicalRows: csv(source.canonical.path),
    links: csv(prefix(1) + "CONEXOES.csv"),
    surfaces: csv(prefix(1) + "TELAS.csv"),
    navigation: json(prefix(2) + "NAV_LEDGER.json").entries,
    ledgers,
  };
}

export function reconcile(source, data) {
  const { canonicalRows, links, surfaces, navigation, ledgers } = data;
  assert.deepEqual([links.length, surfaces.length, canonicalRows.length], [577, 29, 138]);
  const classification = canonicalRows.map((x) => x.classe_original);
  assert.equal(classification.filter((x) => x === "OBRIGATORIA").length, 120);
  assert.equal(classification.filter((x) => x === "CONDICIONAL").length, 18);
  const connections = index(links, (x) => x.id);
  index(canonicalRows, (x) => x.id_conexao);
  const screens = index(surfaces, (x) => x.id);
  const nav = navigation.filter(
    (x) =>
      x.status === "PASS" &&
      x.frontendSha === source.navigation.frontend &&
      x.deploymentId === source.navigation.deployment,
  );
  assert.equal(nav.length, 52);
  assert.deepEqual(
    nav.map((x) => x.index).sort((a, b) => a - b),
    Array.from({ length: 52 }, (_, i) => i + 1),
  );
  const navPairs = index(nav, (x) => x.surface + "/" + x.width);
  assert.equal(navPairs.size, 52);
  for (const n of nav) {
    assert(
      screens.has(n.surface) &&
        ((n.width === 1440 && n.theme === "light") || (n.width === 390 && n.theme === "dark")),
    );
    const run = source.materialGroups.find((g) => g.phase === 2 && g.run.id === n.runId);
    assert(
      run &&
        run.run.attempt === n.attempt &&
        run.run.head === n.harnessSha &&
        run.archives.some(
          (a) =>
            a.id === n.artifactId &&
            a.zipSha256 === n.artifactSha256 &&
            a.memberSha256 === n.reportSha256,
        ),
      "Invalid historical navigation provenance",
    );
  }
  assert.equal(new Set(nav.map((x) => x.surface)).size, 26);
  for (const n of nav)
    assert(
      navPairs.has(n.surface + "/" + (n.width === 1440 ? 390 : 1440)),
      "Missing viewport " + n.surface,
    );
  const certified = ledgers.map((ledger) => index(ledger.entries, (row) => row.caseId));
  const materialGroups = [3, 4, 5, 6].map((phase) =>
    source.materialGroups.find((g) => g.phase === phase && g.role === "material"),
  );
  const rows = canonicalRows.map((r) => {
    const ref = connections.get(r.id_conexao);
    assert(
      ref &&
        ref.origem === r.tela_origem &&
        ref.destino === r.tela_destino &&
        ref.classe === r.classe_original &&
        ref.invariante === r.invariante_original,
      "Canonical connection changed " + r.id_conexao,
    );
    assert(screens.has(ref.origem) && screens.has(ref.destino), "Missing surface " + r.id_conexao);
    const proofs = certified.map((cases, i) => {
      const phase = i + 3,
        id = r["caso_fase" + phase],
        entry = cases.get(id);
      assert(
        entry &&
          id === "IFV1-F" + phase + "-" + r.id_conexao &&
          entry.classification === r.classe_original,
        "Missing or changed case " + id,
      );
      if (phase > 3)
        assert(
          entry.sourceConnectionId === r.id_conexao &&
            entry.origin === ref.origem &&
            entry.destination === ref.destino,
          "Unbound case " + id,
        );
      return {
        phase,
        caseId: id,
        run: materialGroups[i].run.id,
        pair: materialPair(phase, entry, ledgers[i], materialGroups[i]),
        certificatePr: source.phaseCertificates[phase - 1].pr,
      };
    });
    return {
      connection: r.id_conexao,
      requirement: ref.invariante,
      classification: ref.classe,
      origin: ref.origem,
      destination: ref.destino,
      producer: r.produtor_original,
      consumer: r.consumidor_original,
      sourceReference: r.evidencia_codigo_original,
      navigation: nav
        .filter((n) => n.surface === ref.origem || n.surface === ref.destino)
        .map((n) => n.index),
      proofs,
    };
  });
  const supplementary = ledgers[3].supplementary;
  assert.deepEqual(supplementary.map((c) => c.caseId).sort(), [
    "IFV1-F6-T0001",
    "IFV1-F6-T0002",
    "IFV1-F6-T0003",
    "IFV1-F6-T0004",
  ]);
  return {
    schema: "contaos.ifv1.f7.traceability.v1",
    scope: "IFV1_CODE",
    counts: {
      certificates: 6,
      navigation: 52,
      canonical: 138,
      mandatory: 120,
      conditional: 18,
      codeProofs: 1104,
      supplementaryProofs: 8,
    },
    proofOrder: ["positive", "negative"],
    proofColumns: ["artifact", "job", "sha256"],
    rows,
    supplementary: supplementary.map((x) => ({
      caseId: x.caseId,
      relatesTo: x.relatedCaseIds,
      pair: materialPair(6, x, ledgers[3], materialGroups[3]),
    })),
  };
}

export function checkRun(pin, actual) {
  assert.deepEqual(
    [
      actual.id,
      actual.name,
      actual.path,
      actual.head_sha,
      actual.event,
      actual.run_attempt,
      actual.status,
      actual.conclusion,
    ],
    [pin.id, pin.name, pin.path, pin.head, pin.event, pin.attempt, "completed", pin.conclusion],
    "Native run mismatch " + pin.id,
  );
}

export function checkArtifact(pin, run, artifact) {
  assert(
    artifact &&
      artifact.id === pin.id &&
      artifact.name === pin.name &&
      artifact.expired === false &&
      artifact.digest === "sha256:" + pin.zipSha256 &&
      artifact.workflow_run?.head_sha === run.head &&
      artifact.workflow_run?.id === run.id,
    "Artifact origin mismatch " + pin.id,
  );
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

export function verifyMember(pin, archive) {
  assert.equal(sha256(archive), pin.zipSha256, "Original archive bytes " + pin.id);
  const member = execFileSync(
    "python3",
    [
      "-c",
      String.raw`import hashlib, io, sys, zipfile
with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as z:
    matches = [f for f in z.infolist() if f.filename.endswith('.json') and f.file_size <= 8_388_608 and hashlib.sha256(z.read(f)).hexdigest() == sys.argv[1]]
    if len(matches) != 1: raise ValueError('Pinned JSON member missing or ambiguous')
    sys.stdout.buffer.write(z.read(matches[0]))
`,
      pin.memberSha256,
    ],
    { input: archive, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 8 * 1024 * 1024 },
  );
  if (pin.reportSha256) {
    const { reportSha256, ...unsigned } = JSON.parse(member);
    assert.equal(reportSha256, pin.reportSha256, "Original report identity " + pin.id);
    assert.equal(
      sha256(JSON.stringify(unsigned)),
      reportSha256,
      "Original report content " + pin.id,
    );
  }
}

export function verifyNative(source, read, fetchArchive) {
  for (const c of source.phaseCertificates) {
    const pr = read("/pulls/" + c.pr);
    assert(
      pr.number === c.pr &&
        pr.merged &&
        pr.head.sha === c.head &&
        pr.base.ref === "main" &&
        pr.merge_commit_sha === c.merge,
      "Certificate PR F" + c.phase,
    );
    if (c.review.mode === "HISTORICAL_DOCUMENTARY") {
      assert.equal(c.phase, 1);
      const note = read("/issues/comments/" + c.review.comment);
      assert(
        note.issue_url.endsWith("/issues/" + c.pr) &&
          [c.head, c.merge, c.tree, c.certificate.sha256, ...c.runs.map((r) => String(r.id))].every(
            (v) => note.body.includes(v),
          ),
        "Missing original F1 closing receipt",
      );
    } else {
      const r = read("/pulls/" + c.pr + "/reviews/" + c.review.id);
      assert(
        r.id === c.review.id &&
          r.user.login.toLowerCase() === "edivan5002" &&
          r.user.id !== pr.user.id &&
          r.commit_id === c.head &&
          r.state === "APPROVED",
        "Certificate review F" + c.phase,
      );
    }
    assert(
      c.runs.length >= 2 && c.runs.every((r) => r.head === c.head && r.conclusion === "success"),
      "Missing certified CI F" + c.phase,
    );
    for (const run of c.runs) checkRun(run, read("/actions/runs/" + run.id));
  }
  const anchors = index(source.materialGroups, (g) => g.run.id);
  const originals = source.materialGroups.flatMap((g) => g.archives);
  assert.equal(index(originals, (a) => a.id).size, 48);
  for (const g of anchors.values()) {
    checkRun(g.run, read("/actions/runs/" + g.run.id));
    const base = "/actions/runs/" + g.run.id;
    const { artifacts, total_count } = read(base + "/artifacts?per_page=100");
    assert.equal(artifacts.length, total_count, "Artifact inventory truncated");
    const repositoryJobs = g.archives.some((x) => x.job)
      ? read(base + "/attempts/" + g.run.attempt + "/jobs?per_page=100")
      : null;
    if (repositoryJobs)
      assert.equal(
        repositoryJobs.total_count,
        repositoryJobs.jobs.length,
        "Job inventory truncated",
      );
    for (const a of g.archives) {
      checkArtifact(
        a,
        g.run,
        artifacts.find((item) => item.id === a.id),
      );
      if (a.job) {
        const j = repositoryJobs.jobs.find((item) => item.id === a.job);
        assert(
          j &&
            j.head_sha === g.run.head &&
            j.run_id === g.run.id &&
            j.run_attempt === g.run.attempt &&
            j.conclusion === "success",
          "Missing material job " + a.job,
        );
        if (g.role === "test-c")
          assert(
            j.steps.some(
              (s) => s.name.startsWith("Teste C Playwright") && s.conclusion === "success",
            ) &&
              j.steps.some(
                (s) =>
                  s.name.startsWith("Evidencia permanente de screenshots") &&
                  s.conclusion === "success",
              ),
          );
      }
      if (a.memberSha256) verifyMember(a, fetchArchive(a.id));
    }
  }
  return {
    certificates: 6,
    archives: originals.length,
    originalMembers: originals.filter((a) => a.memberSha256).length,
    checkedRuns: source.phaseCertificates.reduce((sum, p) => sum + p.runs.length, 0) + anchors.size,
  };
}

function replayInventory(source) {
  const checkout = mkdtempSync(join(tmpdir(), "contaos-f7-f1-"));
  let created = false;
  try {
    git("worktree", "add", "--detach", checkout, source.phaseCertificates[0].merge);
    created = true;
    const report = execFileSync("python3", [prefix(1) + "verificar.py", "--verificar"], {
      cwd: checkout,
      encoding: "utf8",
    });
    console.log(report.trim());
  } finally {
    if (created) git("worktree", "remove", "--force", checkout);
    rmSync(checkout, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, output] = process.argv.slice(2);
  const source = json(sourceFile);
  checkEvidenceFiles(source);
  const trace = Buffer.from(JSON.stringify(reconcile(source, readInputs(source))) + "\n");
  if (mode === "--write-trace") {
    writeFileSync(traceFile, trace);
  } else {
    assert.equal(mode, "--verify");
    assert.equal(process.env.GITHUB_REPOSITORY, repository);
    assert.equal(git("rev-parse", "HEAD"), process.env.F7_EXPECTED_HEAD);
    assert(trace.equals(readFileSync(traceFile)), "Versioned matrix differs");
    const native = verifyNative(
      source,
      (path) => JSON.parse(request(apiRoot + path)),
      (id) => request(apiRoot + "/actions/artifacts/" + id + "/zip", true),
    );
    replayInventory(source);
    const out = {
      schema: "contaos.ifv1.f7.code-reconciliation-receipt.v1",
      state: "EVIDENCE_VERIFIED_CERTIFICATE_PENDING",
      scope: "IFV1_CODE",
      head: git("rev-parse", "HEAD"),
      tree: git("rev-parse", "HEAD^{tree}"),
      run: Number(process.env.GITHUB_RUN_ID),
      attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      backend,
      sourceSha256: sha256(readFileSync(sourceFile)),
      traceSha256: sha256(trace),
      counts: JSON.parse(trace).counts,
      provenance: native,
      limits: source.limits,
    };
    assert(out.run > 0 && out.attempt > 0 && output);
    writeFileSync(output, JSON.stringify(out, null, 2) + "\n", { flag: "wx" });
    console.log("F7 ledger SHA-256 " + out.traceSha256);
  }
}

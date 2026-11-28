import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  api,
  apiRoot,
  candidateFile,
  download,
  git,
  phaseDirectory,
  repository,
  reproduce,
  sha256,
} from "./integracao-v1-fase5-code-attestation.mjs";

const sha40 = (v) => typeof v === "string" && /^[0-9a-f]{40}$/.test(v);
const sha64 = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const isId = (n) => Number.isSafeInteger(n) && n > 0;

export function verifyCandidateSource(
  pin,
  material,
  read = api,
  checkGit = git,
) {
  assert(
    [pin.pr, pin.review, pin.run, pin.attempt, pin.job, pin.artifact].every(
      isId,
    ),
    "Missing candidate identities",
  );
  assert(
    [pin.base, pin.head, pin.merge, pin.tree].every(sha40) &&
      [pin.zipDigest, pin.candidateDigest].every(sha64) &&
      pin.materialPr === material.pr &&
      pin.materialHead === material.head,
    "Candidate source does not bind the material build",
  );
  const p = read(apiRoot + "/pulls/" + pin.pr);
  const review = read(apiRoot + "/pulls/" + pin.pr + "/reviews/" + pin.review);
  assert(
    p.number === pin.pr &&
      p.merged &&
      p.merge_commit_sha === pin.merge &&
      p.base.ref === "main" &&
      p.head.sha === pin.head,
    "Attestation must be merged",
  );
  assert(
    review.id === pin.review &&
      review.user.login.toLowerCase() === "edivan5002" &&
      review.user.id !== p.user.id &&
      review.state === "APPROVED" &&
      review.commit_id === pin.head,
    "Attestation assisted review mismatch",
  );
  const head = read(apiRoot + "/git/commits/" + pin.head);
  const merge = read(apiRoot + "/git/commits/" + pin.merge);
  assert(
    head.sha === pin.head &&
      merge.sha === pin.merge &&
      head.tree.sha === pin.tree &&
      merge.tree.sha === pin.tree,
    "Attestation tree mismatch",
  );
  assert.deepEqual(
    merge.parents.map((p) => p.sha),
    [pin.base, pin.head],
    "Attestation merge parents mismatch",
  );
  checkGit("merge-base", "--is-ancestor", pin.merge, "HEAD");
  const run = read(apiRoot + "/actions/runs/" + pin.run);
  assert(
    run.id === pin.run &&
      run.name === "ContaOS F5 CODE - atestacao de provas" &&
      run.head_sha === pin.head &&
      run.run_attempt === pin.attempt &&
      run.event === "pull_request" &&
      run.status === "completed" &&
      run.conclusion === "success",
    "Attestation workflow mismatch",
  );
  const jobs = read(
    apiRoot +
      "/actions/runs/" +
      pin.run +
      "/attempts/" +
      pin.attempt +
      "/jobs?per_page=100",
  );
  const job = jobs.jobs.find((j) => j.id === pin.job);
  assert(
    jobs.total_count === 1 &&
      job?.head_sha === pin.head &&
      job.run_id === pin.run &&
      job.run_attempt === pin.attempt &&
      job.name === "F5 CODE - reproduzir candidato" &&
      job.conclusion === "success" &&
      [
        "Contraprovas de integridade e proveniencia",
        "Reproduzir os doze artefatos originais",
        "Preservar candidato nao certificado",
      ].every((name) =>
        job.steps.some((s) => s.name === name && s.conclusion === "success"),
      ),
    "Attestation job mismatch",
  );
  const a = read(apiRoot + "/actions/artifacts/" + pin.artifact);
  assert(
    a.id === pin.artifact &&
      a.expired === false &&
      a.digest === "sha256:" + pin.zipDigest &&
      a.workflow_run.id === pin.run &&
      a.workflow_run.head_sha === pin.head &&
      a.name ===
        "f5-code-attestation-candidate-" + pin.head + "-r" + pin.attempt,
    "Candidate artifact mismatch",
  );
}

const unpackCandidate = String.raw`import base64, io, stat, sys, zipfile
name = sys.argv[1]
with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as archive:
    entries = archive.infolist()
    if len(entries) != 2 or {x.filename for x in entries} != {name, 'SHA256SUMS'}:
        raise ValueError('Candidate ZIP entries mismatch')
    for entry in entries:
        if entry.is_dir() or stat.S_IFMT(entry.external_attr >> 16) not in (0, stat.S_IFREG) or entry.flag_bits & 1:
            raise ValueError('Candidate ZIP entry is not a regular file')
        if entry.file_size > 8 * 1024 * 1024:
            raise ValueError('Candidate ZIP entry too large')
    print(base64.b64encode(archive.read(name)).decode('ascii'))
    print(base64.b64encode(archive.read('SHA256SUMS')).decode('ascii'))
`;

export function verifyBytes(pin, archive, reproduced, versioned) {
  assert.equal(
    sha256(archive),
    pin.zipDigest,
    "Candidate archive digest mismatch",
  );
  const extracted = execFileSync(
    "python3",
    ["-c", unpackCandidate, candidateFile],
    {
      input: archive,
      encoding: "ascii",
      maxBuffer: 16 * 1024 * 1024,
    },
  )
    .trim()
    .split("\n")
    .map((data) => Buffer.from(data, "base64"));
  const [candidate, sum] = extracted;
  assert.equal(
    sum.toString("utf8"),
    pin.candidateDigest + "  " + candidateFile + "\n",
    "Candidate SHA256SUMS mismatch",
  );
  assert.equal(
    sha256(candidate),
    pin.candidateDigest,
    "Candidate content integrity",
  );
  assert(candidate.equals(reproduced), "Candidate reproduction differs");
  assert(candidate.equals(versioned), "Versioned ledger differs");
  const record = JSON.parse(candidate);
  assert(
    record.schema === "contaos.ifv1.f5.code-attestation-candidate.v1" &&
      record.state === "CANDIDATE_NOT_CERTIFIED" &&
      record.scope === "CODE_FIXTURE" &&
      record.certification === "NOT_CERTIFIED" &&
      record.live === "NOT_RUN" &&
      record.production === "NO-GO" &&
      record.source.pr === pin.materialPr &&
      record.source.head === pin.materialHead &&
      record.entries.length === 138 &&
      record.counts.proofs === 276,
    "Candidate scope mismatch",
  );
  return {
    schema: "contaos.ifv1.f5.code-promotion-receipt.v1",
    state: "LEDGER_VERIFIED_CERTIFICATE_PENDING",
    candidate: pin,
    source: record.source,
    ledgerSha256: sha256(versioned),
    counts: record.counts,
    certification: "NOT_CERTIFIED",
    live: "NOT_RUN",
    production: "NO-GO",
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  const [, , output] = process.argv;
  assert(output, "Receipt output required");
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  assert(
    event.pull_request?.base.ref === "main",
    "Expected protected promotion pull request",
  );
  const base = event.pull_request.base.sha;
  const path = phaseDirectory + candidateFile;
  assert(sha40(base), "Invalid promotion base");
  assert.equal(
    git("ls-tree", "--name-only", base, "--", path),
    "",
    "Ledger already exists on protected base",
  );
  const readJson = (name) =>
    JSON.parse(readFileSync(phaseDirectory + name, "utf8"));
  const source = readJson("F5_CODE_ATTESTATION_SOURCE.json");
  const pin = readJson("F5_CODE_PROMOTION_SOURCE.json");
  verifyCandidateSource(pin, source);
  const receipt = verifyBytes(
    pin,
    download(pin.artifact),
    reproduce(source),
    readFileSync(path),
  );
  writeFileSync(output, JSON.stringify(receipt, null, 2) + "\n", {
    flag: "wx",
  });
  console.log("F5 versioned ledger SHA-256 " + receipt.ledgerSha256);
}

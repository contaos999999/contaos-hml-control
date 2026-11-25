import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "contaos999999/contaos-hml-control";
const PREFIX = "repos/" + REPO;
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const DIR = "docs/frontend/auditorias/integracao-funcional-v1/fase3";
export const CANDIDATE = DIR + "/F3_CODE_ATTESTATION_CANDIDATE.json";
export const SOURCE = Object.freeze({
  pr: 754,
  head: "b26ece8c0b03485aeeb7091aaed548ec284986cd",
  merge: "a162574386e752d3f9b928dbf8e3296d3a62255b",
  review: 6050561220,
  run: 45530510437,
  job: 138924335258,
  artifact: 14985165418,
  artifactDigest: "340a69e7b7d49e98d1ab8074544dd8108103837c18a5d0bd5397ab5904925695",
  candidateDigest: "de6fdd18468868fc163574fccda016322a2eb7e412bb984a0212fb783c770c06",
});
export const RUNS = Object.freeze([
  [45530510437, "ContaOS F3 CODE - atestacao candidata (nao certificador)"],
  [45530510409, "ContaOS Frontend Zero-Drift"],
  [45530510453, "ContaOS F3 CODE - 138 execucoes funcionais individuais"],
  [45530510402, "ContaOS LOCK-TYPES-01 Double Barrier"],
  [45530510416, "ContaOS F3 CODE - 138 case preflight (not certification)"],
  [45530510587, "ContaOS P0-NR-001 Anti-Reincidencia"],
  [45530510411, "ContaOS F3 CODE - Coletor offline (nao certificador)"],
]);
const assert = (value, reason) => { if (!value) throw Error("F3_PROMOTION_" + reason); };
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const hex = x => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
const gh = path => JSON.parse(execFileSync("gh", ["api", path], {encoding:"utf8",maxBuffer:12*1024*1024}));
export function verifyMetadata({pr, review, artifact, runs, jobs, compare}) {
  assert(pr.number === SOURCE.pr && pr.merged === true && pr.base.ref === "main" &&
    pr.head.sha === SOURCE.head && pr.merge_commit_sha === SOURCE.merge, "PR");
  assert(review.id === SOURCE.review && review.state === "APPROVED" && review.commit_id === SOURCE.head &&
    review.user.login === "Edivan5002" && review.user.login !== pr.user.login, "REVIEW");
  assert(artifact.id === SOURCE.artifact && artifact.expired === false &&
    artifact.digest === "sha256:" + SOURCE.artifactDigest &&
    artifact.workflow_run.id === SOURCE.run && artifact.workflow_run.head_sha === SOURCE.head, "ARTIFACT");
  assert(runs.length === RUNS.length && new Set(runs.map(r=>r.id)).size === RUNS.length &&
    RUNS.every(([id,name])=>runs.some(r=>r.id===id && r.name===name && r.head_sha===SOURCE.head &&
      r.status==="completed" && r.conclusion==="success")), "RUNS");
  assert(jobs.some(j=>j.id===SOURCE.job && j.run_id===SOURCE.run && j.name==="attest" &&
    j.conclusion==="success" && ["Test negative provenance","Verify source and execution provenance against GitHub live","Confirm immutable checkout"].every(name=>
      j.steps.some(s=>s.name===name && s.conclusion==="success"))), "JOB");
  assert(Array.isArray(compare.files) && compare.files.length===0, "TREE");
  return true;
}
export function verifyEntries(candidate, catalogue) {
  assert(candidate.schema==="contaos.ifv1.f3.code-attestation-candidate.v1" &&
    candidate.state==="CANDIDATE_NOT_CERTIFIED" && candidate.entries.length===138 &&
    catalogue.cases.length===138, "SCHEMA");
  const seen=new Set(), proofs=new Set();
  for (let i=0;i<138;i++) {
    const e=candidate.entries[i], c=catalogue.cases[i];
    assert(e.caseId===c.caseId && !seen.has(e.caseId) && e.classification===c.classification &&
      e.producer===c.producer && e.consumer===c.consumer &&
      JSON.stringify(e.expected)===JSON.stringify(c.expected) &&
      e.status==="SUBMITTED_UNVERIFIED" && e.tests.length===2, "CASE");
    seen.add(e.caseId);
    for (const [index,p] of e.tests.entries()) {
      assert(p.caseId===e.caseId && p.kind===["positive","negative"][index] && p.outcome==="PASS" &&
        typeof p.testId==="string" && p.testId.startsWith("src/test/f3-code-") &&
        typeof p.sourcePath==="string" && p.sourcePath.startsWith("src/") &&
        !p.sourcePath.includes("..") && !p.testId.includes("..") &&
        hex(p.outputSha256) && !proofs.has(p.testId), "PROOF");
      proofs.add(p.testId);
    }
  }
  assert(seen.size===138 && proofs.size===276 &&
    candidate.entries.filter(x=>x.classification==="OBRIGATORIA").length===120 &&
    candidate.entries.filter(x=>x.classification==="CONDICIONAL").length===18, "COUNTS");
  assert(candidate.counts.cases===138 && candidate.counts.mandatory===120 &&
    candidate.counts.conditional===18 && candidate.counts.tests===276 &&
    candidate.counts.failed===0 && candidate.counts.blocked===0, "SUMMARY");
  return true;
}
export function verifyBytes(versioned, downloaded, reproduced, zip) {
  assert(sha(zip)===SOURCE.artifactDigest, "ZIP");
  assert(sha(versioned)===SOURCE.candidateDigest && versioned.equals(downloaded) &&
    versioned.equals(reproduced), "BYTES");
  return true;
}
export function liveMetadata() {
  return {
    pr:gh(PREFIX+"/pulls/"+SOURCE.pr),
    review:gh(PREFIX+"/pulls/"+SOURCE.pr+"/reviews/"+SOURCE.review),
    artifact:gh(PREFIX+"/actions/artifacts/"+SOURCE.artifact),
    runs:RUNS.map(([id])=>gh(PREFIX+"/actions/runs/"+id)),
    jobs:gh(PREFIX+"/actions/runs/"+SOURCE.run+"/jobs?per_page=100").jobs,
    compare:gh(PREFIX+"/compare/"+SOURCE.head+"..."+SOURCE.merge),
  };
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [zip, downloaded, reproduced, output]=process.argv.slice(2);
  assert(zip && downloaded && reproduced && output, "CLI");
  const bytes=readFileSync(resolve(ROOT,CANDIDATE));
  verifyMetadata(liveMetadata());
  verifyBytes(bytes, readFileSync(downloaded),readFileSync(reproduced),readFileSync(zip));
  const candidate=JSON.parse(bytes);
  const catalogue=JSON.parse(readFileSync(resolve(ROOT,DIR,"F3_CASES.json")));
  verifyEntries(candidate,catalogue);
  const receipt={schema:"contaos.ifv1.f3.code-promotion-receipt.v1",state:"LEDGER_VERIFIED_CERTIFICATE_PENDING",
    scope:"CODE_ONLY",source:SOURCE,counts:candidate.counts,ledgerPath:CANDIDATE,
    ledgerSha256:sha(bytes),promotionExecution:{sha:process.env.GITHUB_SHA,run:process.env.GITHUB_RUN_ID},
    limitations:candidate.limitations,certification:"NOT_CERTIFIED",f4:"NOT_AUTHORIZED",production:"NO-GO"};
  assert(/^[a-f0-9]{40}$/.test(receipt.promotionExecution.sha??"") &&
    /^[1-9][0-9]*$/.test(receipt.promotionExecution.run??""), "EXECUTION");
  writeFileSync(output,JSON.stringify(receipt,null,2)+"\n",{flag:"wx"});
  console.log(JSON.stringify(receipt));
}

/** F3 S3: candidate ledger attestation, separate from the non-certifying inventory and LIVE.
 * No caller booleans, no production access, no automatic promotion to CERTIFIED.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateF3AutomaticGate } from "./integracao-v1-fase3-functional-138.mjs";

const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const assert = (v, reason) => { if (!v) throw Error("F3_ATTEST_" + reason); };
const root = fileURLToPath(new URL("../../", import.meta.url));
const dir = "docs/frontend/auditorias/integracao-funcional-v1/fase3";
const reportName = "F3_CODE_FUNCTIONAL_138_REPORT.json";
const manifestName = "F3_CODE_CASE_RESULTS.jsonl";
const summaryName = "F3_CODE_FUNCTIONAL_SUMMARY.json";
const catalogueHash = "bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb";

export function validateBuildMetadata(s, m) {
  assert(s.schema === "contaos.ifv1.f3.code-attestation-source.v1" &&
    s.state === "CANDIDATE_NOT_CERTIFIED" && s.repository === "contaos999999/contaos-hml-control" &&
    s.reviewMode === "AUTHORIZED_AGENT_ASSISTED_TECHNICAL_REVIEW_NOT_HUMAN_INDEPENDENT", "SPEC");
  const {pr, review, artifact, runs, jobs, zeroJobs, headCompare, mergeCompare} = m;
  assert(pr.number === s.buildPr && pr.merged === true && pr.base.ref === "main" &&
    pr.head.sha === s.head && pr.merge_commit_sha === s.mergeSha, "BUILD_PR");
  assert(review.id === s.reviewId && review.user.login === s.reviewer && review.user.login !== pr.user.login &&
    review.state === "APPROVED" && review.commit_id === s.head, "REVIEW");
  assert(artifact.id === s.artifactId && !artifact.expired &&
    artifact.digest === "sha256:" + s.artifactSha256 &&
    artifact.workflow_run.id === s.functionalRun && artifact.workflow_run.head_sha === s.head, "ARTIFACT");
  const names = ["ContaOS F3 CODE - 138 execucoes funcionais individuais","ContaOS Frontend Zero-Drift",
    "ContaOS LOCK-TYPES-01 Double Barrier","ContaOS F3 CODE - Coletor offline (nao certificador)",
    "ContaOS P0-NR-001 Anti-Reincidencia","ContaOS F3 CODE - 138 case preflight (not certification)"];
  assert(s.runs.length === 6 && runs.length === 6 && new Set(runs.map(x=>x.id)).size === 6 &&
    names.every(name=>runs.some(x=>x.name === name)), "RUN_SET");
  for (const want of s.runs) {
    const run = runs.find(x=>x.id === want.id);
    assert(run && run.name === want.name && run.head_sha === s.head && run.status === "completed" && run.conclusion === "success", "RUN");
  }
  const functional = jobs.find(x=>x.id === s.functionalJob);
  assert(functional && functional.run_id === s.functionalRun && functional.conclusion === "success" &&
    functional.name === "F3 CODE 138 - executor e evidencias", "FUNCTIONAL_JOB");
  assert(zeroJobs.length >= 2 && zeroJobs.every(x=>x.conclusion === "success"), "ZERO_DRIFT");
  const steps = zeroJobs.flatMap(x=>x.steps ?? []);
  for (const name of ["TypeScript typecheck","Full regression — Vitest 2 workers",
    "Production build — geração canônica TanStack antes dos testes longos","Teste C Playwright — 24 telas, 4 larguras, 2 temas",
    "P0 RCA V1-V5 — verificar escopo, RED GitHub e executar GREEN/REG reais"]) {
    assert(steps.some(x=>x.name === name && x.conclusion === "success"), "REQUIRED_STEP");
  }
  for (const c of [headCompare,mergeCompare]) assert(Array.isArray(c.files) && c.files.length === 0, "TREE_DRIFT");
  return true;
}

export function validateArtifact({s, metadata, zip, reportRaw, manifestRaw, summaryRaw, sums, catalogueRaw, coverage, verifyPath}) {
  validateBuildMetadata(s, metadata);
  assert(sha(zip) === s.artifactSha256, "ZIP_SHA");
  const expected = [[reportRaw,reportName],[manifestRaw,manifestName],[summaryRaw,summaryName]];
  assert(sums.trim().split("\n").length === 3 && expected.every(([raw,name])=>sums.trim().split("\n").includes(sha(raw)+"  "+name)), "FILES_SHA");
  assert(sha(catalogueRaw) === catalogueHash, "CATALOGUE_SHA");
  const catalogue = JSON.parse(catalogueRaw), report = JSON.parse(reportRaw), summary = JSON.parse(summaryRaw);
  const manifest = manifestRaw.trim().split("\n").map(JSON.parse);
  const provenance = {frontendSha:s.executionSha,backendSha:s.backendSha,workflowRunId:String(s.functionalRun),jobId:String(s.functionalJob)};
  const tally = validateF3AutomaticGate({report,summary,manifest,catalogue,provenance});
  assert(tally.gate === "PASS_CODE" && tally.complete && tally.observedTests === 276 && report.reportSha256 === s.reportSha256, "FUNCTIONAL_RESULT");
  assert(coverage.count === 138 && coverage.cases.length === 138 && coverage.sourceCatalogueSha256 === catalogueHash, "MATRIX");
  const entries = report.entries.map((e,i)=>{
    const c = catalogue.cases[i], map = coverage.cases[i];
    assert(c.caseId === e.caseId && map.caseId === e.caseId && c.classification === e.classification, "CASE");
    for (const proof of e.tests) {
      const testFile = proof.testId.split(":")[0];
      assert(/^src\/test\/f3-code-[A-Za-z0-9_.-]+\.tsx?$/.test(testFile) && /^src\/[A-Za-z0-9_./-]+\.tsx?$/.test(proof.sourcePath) &&
        !testFile.includes("..") && !proof.sourcePath.includes("..") &&
        verifyPath(testFile) && verifyPath(proof.sourcePath), "SOURCE_FILE");
    }
    return {caseId:e.caseId,classification:e.classification,producer:c.producer,consumer:c.consumer,expected:c.expected,sourceHints:map.sourceHints,
      status:"SUBMITTED_UNVERIFIED",tests:e.tests};
  });
  assert(entries.filter(x=>x.classification==="OBRIGATORIA").length===120 && entries.filter(x=>x.classification==="CONDICIONAL").length===18, "CLASS_COUNTS");
  return {schema:"contaos.ifv1.f3.code-attestation-candidate.v1",state:"CANDIDATE_NOT_CERTIFIED",sourceCatalogueSha256:catalogueHash,
    source:s,counts:{cases:138,mandatory:120,conditional:18,tests:276,failed:0,blocked:0},entries,
    limitations:["CODE fixtures and real frontend adapters; no remote RLS or LIVE claims.",
      "Output hashes bind observations, but report does not include their full raw payloads.",
      "Review account differs from author; review assisted by same agent, not independent human audit.",
      "Requires separate formal attestation/ledger promotion and governance approval; no authorization of F4 or PROD."]};
}

const gh = path => JSON.parse(execFileSync("gh",["api",path],{encoding:"utf8",maxBuffer:12*1024*1024}));
export function collectLiveMetadata(s) {
  const prefix = "repos/"+s.repository;
  const zeroRun = s.runs.find(x=>x.name==="ContaOS Frontend Zero-Drift").id;
  return {pr:gh(prefix+"/pulls/"+s.buildPr),review:gh(prefix+"/pulls/"+s.buildPr+"/reviews/"+s.reviewId),
    artifact:gh(prefix+"/actions/artifacts/"+s.artifactId),runs:s.runs.map(x=>gh(prefix+"/actions/runs/"+x.id)),
    jobs:gh(prefix+"/actions/runs/"+s.functionalRun+"/jobs?per_page=100").jobs,
    zeroJobs:gh(prefix+"/actions/runs/"+zeroRun+"/jobs?per_page=100").jobs,
    headCompare:gh(prefix+"/compare/"+s.head+"..."+s.executionSha),
    mergeCompare:gh(prefix+"/compare/"+s.executionSha+"..."+s.mergeSha)};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const s = JSON.parse(readFileSync(join(root,dir,"F3_CODE_ATTESTATION_SOURCE.json"),"utf8"));
  const zipPath = process.argv[2], artifactDir = process.argv[3], output = process.argv[4];
  assert(zipPath && artifactDir && output, "CLI");
  const metadata = collectLiveMetadata(s);
  const cache = new Map();
  const verifyPath = p=>{
    if (!cache.has(p)) {
      try { execFileSync("git",["cat-file","-e",s.mergeSha+":"+p],{cwd:root,stdio:"ignore"}); cache.set(p,true); }
      catch {cache.set(p,false);}
    }
    return cache.get(p);
  };
  const read = name=>readFileSync(join(artifactDir,name),"utf8");
  const candidate = validateArtifact({s,metadata,zip:readFileSync(zipPath),reportRaw:read(reportName),
    manifestRaw:read(manifestName),summaryRaw:read(summaryName),sums:read("SHA256SUMS"),
    catalogueRaw:readFileSync(join(root,dir,"F3_CASES.json"),"utf8"),
    coverage:JSON.parse(readFileSync(join(root,dir,"F3_CODE_COVERAGE_MATRIX.json"),"utf8")),verifyPath});
  mkdirSync(output,{recursive:true});
  const raw=JSON.stringify(candidate,null,2)+"\n";
  writeFileSync(join(output,"F3_CODE_ATTESTATION_CANDIDATE.json"),raw,{flag:"wx"});
  console.log(JSON.stringify({gate:"CANDIDATE_VERIFIED_NOT_CERTIFIED",cases:candidate.counts.cases,tests:candidate.counts.tests,candidateSha256:sha(raw)}));
  const b64=Buffer.from(raw).toString("base64");
  console.log("F3_ATTESTATION_LEDGER_START");
  for(const part of b64.match(/.{1,2048}/g))console.log("F3_ATTESTATION_LEDGER_DATA "+part);
  console.log("F3_ATTESTATION_LEDGER_END");
}

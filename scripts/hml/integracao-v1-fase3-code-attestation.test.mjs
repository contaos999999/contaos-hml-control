import test from "node:test";
import assert from "node:assert/strict";
import {validateBuildMetadata} from "./integracao-v1-fase3-code-attestation.mjs";
const names=["ContaOS F3 CODE - 138 execucoes funcionais individuais","ContaOS Frontend Zero-Drift","ContaOS LOCK-TYPES-01 Double Barrier","ContaOS F3 CODE - Coletor offline (nao certificador)","ContaOS P0-NR-001 Anti-Reincidencia","ContaOS F3 CODE - 138 case preflight (not certification)"];
function sample(){
  const s={schema:"contaos.ifv1.f3.code-attestation-source.v1",state:"CANDIDATE_NOT_CERTIFIED",repository:"contaos999999/contaos-hml-control",buildPr:1,head:"head",mergeSha:"merge",executionSha:"execution",reviewId:12,reviewer:"reviewer",reviewMode:"AUTHORIZED_AGENT_ASSISTED_TECHNICAL_REVIEW_NOT_HUMAN_INDEPENDENT",artifactId:4,artifactSha256:"hash",functionalRun:1,functionalJob:8,runs:names.map((name,i)=>({id:i+1,name}))};
  const steps=["TypeScript typecheck","Full regression — Vitest 2 workers","Production build — geração canônica TanStack antes dos testes longos","Teste C Playwright — 24 telas, 4 larguras, 2 temas","P0 RCA V1-V5 — verificar escopo, RED GitHub e executar GREEN/REG reais"].map(name=>({name,conclusion:"success"}));
  const m={pr:{number:1,merged:true,base:{ref:"main"},head:{sha:"head"},merge_commit_sha:"merge",user:{login:"author"}},review:{id:12,user:{login:"reviewer"},state:"APPROVED",commit_id:"head"},artifact:{id:4,expired:false,digest:"sha256:hash",workflow_run:{id:1,head_sha:"head"}},runs:s.runs.map(x=>({...x,head_sha:"head",status:"completed",conclusion:"success"})),jobs:[{id:8,run_id:1,name:"F3 CODE 138 - executor e evidencias",conclusion:"success"}],zeroJobs:[{conclusion:"success",steps},{conclusion:"success",steps:[]}],headCompare:{files:[]},mergeCompare:{files:[]}};
  return {s,m};
}
test("F3 candidate attestation requires merged BUILD and all live metadata",()=>{const {s,m}=sample();assert.equal(validateBuildMetadata(s,m),true);});
for(const [label,mutate] of Object.entries({
  unmerged:m=>m.pr.merged=false,
  wrongHead:m=>m.pr.head.sha="other",
  wrongReview:m=>m.review.commit_id="other",
  selfReview:m=>m.review.user.login="author",
  reviewNotApproved:m=>m.review.state="COMMENTED",
  wrongArtifact:m=>m.artifact.digest="sha256:other",
  expiredArtifact:m=>m.artifact.expired=true,
  missingRun:m=>m.runs.pop(),
  failedRun:m=>m.runs[0].conclusion="failure",
  wrongRunHead:m=>m.runs[0].head_sha="other",
  badJob:m=>m.jobs[0].conclusion="failure",
  missingStep:m=>m.zeroJobs[0].steps.pop(),
  treeDrift:m=>m.mergeCompare.files.push({filename:"src/bad.ts"}),
})){
  test("F3 candidate rejects "+label,()=>{const {s,m}=sample();mutate(m);assert.throws(()=>validateBuildMetadata(s,m),/F3_ATTEST_/);});
}

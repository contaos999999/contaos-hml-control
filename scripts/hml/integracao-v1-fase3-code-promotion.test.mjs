import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CANDIDATE, SOURCE, RUNS, verifyEntries, verifyMetadata, verifyBytes, verifyCandidateBytes } from "./integracao-v1-fase3-code-promotion.mjs";
const root=new URL("../../",import.meta.url);
const candidate=()=>JSON.parse(readFileSync(new URL(CANDIDATE,root)));
const catalogue=()=>JSON.parse(readFileSync(new URL("docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json",root)));
test("F3 promotion: real candidate closes 138 unique pairs",()=>assert.equal(verifyEntries(candidate(),catalogue()),true));
for(const [label,mutate] of Object.entries({
  omission:c=>c.entries.pop(),
  duplicate:c=>c.entries[1]=c.entries[0],
  swapped:c=>c.entries[0].tests.reverse(),
  proofReused:c=>c.entries[1].tests[0].testId=c.entries[0].tests[0].testId,
  wrongExpectation:c=>c.entries[0].expected={master:"DENY"},
  fakePass:c=>c.entries[0].status="PASS",
  hash:c=>c.entries[0].tests[0].outputSha256="wrong",
  wrongCase:c=>c.entries[0].tests[0].caseId="wrong",
})) test("F3 promotion rejects "+label,()=>{const c=candidate();mutate(c);assert.throws(()=>verifyEntries(c,catalogue()),/F3_PROMOTION_/);});
function metadata(){return {
  pr:{number:SOURCE.pr,merged:true,base:{ref:"main"},head:{sha:SOURCE.head},merge_commit_sha:SOURCE.merge,user:{login:"contaos9999"}},
  review:{id:SOURCE.review,state:"APPROVED",commit_id:SOURCE.head,user:{login:"Edivan5002"}},
  artifact:{id:SOURCE.artifact,expired:false,digest:"sha256:"+SOURCE.artifactDigest,workflow_run:{id:SOURCE.run,head_sha:SOURCE.head}},
  runs:RUNS.map(([id,name])=>({id,name,head_sha:SOURCE.head,status:"completed",conclusion:"success"})),
  jobs:[{id:SOURCE.job,run_id:SOURCE.run,name:"attest",conclusion:"success",steps:["Test negative provenance","Verify source and execution provenance against GitHub live","Confirm immutable checkout"].map(name=>({name,conclusion:"success"}))}],
  compare:{files:[]},
};}
test("F3 promotion metadata contract",()=>assert.equal(verifyMetadata(metadata()),true));
for(const [label,mutate] of Object.entries({
  unmerged:m=>m.pr.merged=false,
  wrongHead:m=>m.pr.head.sha="wrong",
  selfReview:m=>m.review.user.login="contaos9999",
  reviewNotApproved:m=>m.review.state="COMMENTED",
  failedCI:m=>m.runs[0].conclusion="failure",
  omittedCI:m=>m.runs.pop(),
  fakeArtifact:m=>m.artifact.digest="sha256:fake",
  badJob:m=>m.jobs[0].steps.pop(),
  drift:m=>m.compare.files.push({filename:"src/bad.ts"}),
})) test("F3 promotion rejects "+label,()=>{const m=metadata();mutate(m);assert.throws(()=>verifyMetadata(m),/F3_PROMOTION_/);});
test("F3 promotion rejects forged archive and content",()=>{const b=Buffer.from("fake");assert.throws(()=>verifyBytes(b,b,b,b),/F3_PROMOTION_ZIP/);});
test("F3 promotion rejects any altered versioned, downloaded or reproduced byte",()=>{
  const real=readFileSync(new URL(CANDIDATE,root));
  assert.equal(verifyCandidateBytes(real,real,real),true);
  const changed=Buffer.from(real);changed[0]^=1;
  for(const args of [[changed,real,real],[real,changed,real],[real,real,changed],[changed,changed,changed]])
    assert.throws(()=>verifyCandidateBytes(...args),/F3_PROMOTION_BYTES/);
});

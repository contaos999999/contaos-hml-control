import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {checkCandidateProvenance,verifyCandidateBytes,extractCandidate} from "./integracao-v1-fase4-code-promotion.mjs";
import {execFileSync} from "node:child_process";
const sha=b=>createHash("sha256").update(b).digest("hex");
const HEAD="a".repeat(40),MERGE="b".repeat(40),TESTED="c".repeat(40),TREE="d".repeat(40);
const P="repos/contaos999999/contaos-hml-control";
function fixture(){
 const c={schema:"contaos.ifv1.f4.code-attestation-candidate.v1",state:"CANDIDATE_NOT_CERTIFIED",certification:"NOT_CERTIFIED",scope:"CODE_FIXTURE",live:"NOT_RUN",production:"NO-GO",source:{testedSha:TESTED,testedTree:TREE,mergedTree:TREE},counts:{cases:138,tests:276,mandatory:120,conditional:18,failed:0,blocked:0},entries:Array.from({length:138},(_,i)=>{const caseId="IFV1-F4-C"+String(i+1).padStart(4,"0");return {caseId,status:"SUBMITTED_UNVERIFIED",tests:["positive","negative"].map(kind=>({caseId,kind,outcome:"PASS",mode:"CODE_FIXTURE",testedSha:TESTED,observationSha256:"e".repeat(64)}))};})};
 const archive=Buffer.from("synthetic ZIP bytes"),candidate=Buffer.from(JSON.stringify(c)+"\n");
 const s={pr:774,head:HEAD,merge:MERGE,testedSha:TESTED,review:1,run:2,attempt:1,job:3,artifact:4,archiveDigest:sha(archive),candidateDigest:sha(candidate)};
 const map=new Map([
  [P+"/pulls/774",{merged:true,base:{ref:"main"},head:{sha:HEAD},merge_commit_sha:MERGE,user:{login:"author"}}],
  [P+"/pulls/774/reviews/1",{id:1,state:"APPROVED",commit_id:HEAD,user:{login:"Edivan5002"}}],
  [P+"/git/commits/"+TESTED,{sha:TESTED,tree:{sha:TREE}}],
  [P+"/git/commits/"+MERGE,{sha:MERGE,tree:{sha:TREE}}],
  [P+"/actions/runs/2",{id:2,name:"ContaOS F4 CODE - atestacao de provas",head_sha:HEAD,event:"pull_request",status:"completed",conclusion:"success",run_attempt:1}],
  [P+"/actions/runs/2/attempts/1/jobs?per_page=100",{jobs:[{id:3,name:"attest",conclusion:"success",steps:["Contraprovas de integridade e proveniencia","Conferir 13 arquivos oficiais e reproduzir ledger candidato","Preservar candidato nao certificado"].map(name=>({name,conclusion:"success"}))}]}],
  [P+"/actions/artifacts/4",{id:4,expired:false,name:"f4-code-attestation-candidate-"+TESTED,digest:"sha256:"+s.archiveDigest,workflow_run:{id:2,head_sha:HEAD}}]
 ]);
 const read=p=>{assert.ok(map.has(p),p);return map.get(p);};
 return {c,archive,candidate,s,map,read};
}
test("candidate review, exact head, tree and successful run are pinned",()=>{const {s,read}=fixture();assert.equal(checkCandidateProvenance(s,read).tree,TREE);});
test("reject wrong review, unequal tree, attempt, skipped job step and expired artifact",()=>{
 for(const [p,key,value,err] of [["/pulls/774/reviews/1","commit_id",MERGE,/REVIEW/],["/git/commits/"+TESTED,"tree",{sha:HEAD},/TREE/],["/actions/runs/2","run_attempt",2,/RUN/],["/actions/artifacts/4","expired",true,/ARTIFACT/]]){
  const {s,map,read}=fixture();map.get(P+p)[key]=value;assert.throws(()=>checkCandidateProvenance(s,read),err);
 }
 const {s,map,read}=fixture();map.get(P+"/actions/runs/2/attempts/1/jobs?per_page=100").jobs[0].steps.pop();assert.throws(()=>checkCandidateProvenance(s,read),/JOB/);
});
test("candidate bytes must match archive digest, reproduced and versioned bytes",()=>{const {s,archive,candidate}=fixture();assert.equal(verifyCandidateBytes(s,archive,candidate,candidate,candidate).counts.tests,276);assert.throws(()=>verifyCandidateBytes(s,Buffer.from("other"),candidate,candidate,candidate),/ARCHIVE_DIGEST/);assert.throws(()=>verifyCandidateBytes(s,archive,candidate,Buffer.from("changed"),candidate),/CANDIDATE_BYTES/);assert.throws(()=>verifyCandidateBytes(s,archive,candidate,candidate,Buffer.from("changed")),/CANDIDATE_BYTES/);});
test("reject forged candidate even with recomputed hash",()=>{for(const [mutate,err] of [[c=>c.certification="PASS",/STATE/],[c=>c.entries.pop(),/COUNTS/],[c=>c.entries[1].caseId=c.entries[0].caseId,/CASE/],[c=>c.entries[0].tests[1]=c.entries[0].tests[0],/PROOF/],[c=>c.entries[0].tests[0].outcome="NOT_RUN",/PROOF/]]){const {c,s,archive}=fixture();mutate(c);const b=Buffer.from(JSON.stringify(c));s.candidateDigest=sha(b);assert.throws(()=>verifyCandidateBytes(s,archive,b,b,b),err);}});
function zip(kind){const b=Buffer.from("synthetic candidate");return execFileSync("python3",["-c",`import io,zipfile,sys
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 z.writestr('F4_CODE_ATTESTATION_CANDIDATE.json',sys.argv[1])
 z.writestr('SHA256SUMS',sys.argv[2]+'  F4_CODE_ATTESTATION_CANDIDATE.json\\n')
 if sys.argv[3]=='extra':z.writestr('../bad','bad')
sys.stdout.buffer.write(b.getvalue())`,b.toString(),kind==="bad"?"0".repeat(64):sha(b),kind]);}
test("candidate ZIP rejects traversal and wrong checksum",()=>{assert.equal(extractCandidate(zip("ok")).toString(),"synthetic candidate");assert.throws(()=>extractCandidate(zip("bad")),/CHECKSUM/);assert.throws(()=>extractCandidate(zip("extra")));});

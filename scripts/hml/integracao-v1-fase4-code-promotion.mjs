/**
 * F4 CODE promotion: verify the actual candidate bytes against a fresh
 * independent reproduction from the 13 pinned source archives.
 * This program cannot issue the phase certificate.
 */
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
const REPO="contaos999999/contaos-hml-control",P="repos/"+REPO;
const DIR="docs/frontend/auditorias/integracao-funcional-v1/fase4/";
const check=(v,r)=>{if(!v)throw Error("F4_PROMOTION_"+r);};
const hash=b=>createHash("sha256").update(b).digest("hex");
const sha40=v=>typeof v==="string"&&/^[a-f0-9]{40}$/.test(v);
const sha64=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const int=v=>Number.isSafeInteger(v)&&v>0;
const gh=(p,binary=false)=>execFileSync("gh",["api",p],{encoding:binary?null:"utf8",maxBuffer:64*1024*1024});
const api=p=>JSON.parse(gh(p));
export function checkCandidateProvenance(s,read=api){
 check(s.pr===774&&[s.head,s.merge,s.testedSha].every(sha40)&&[s.review,s.run,s.attempt,s.job,s.artifact].every(int)&&[s.archiveDigest,s.candidateDigest].every(sha64),"PIN");
 const p=read(P+"/pulls/"+s.pr),r=read(P+"/pulls/"+s.pr+"/reviews/"+s.review);
 check(p.merged===true&&p.base.ref==="main"&&p.head.sha===s.head&&p.merge_commit_sha===s.merge,"PR");
 check(r.state==="APPROVED"&&r.id===s.review&&r.commit_id===s.head&&r.user.login.toLowerCase()==="edivan5002"&&r.user.login!==p.user.login,"REVIEW");
 const tested=read(P+"/git/commits/"+s.testedSha),merged=read(P+"/git/commits/"+s.merge);
 check(tested.sha===s.testedSha&&merged.sha===s.merge&&sha40(tested.tree.sha)&&tested.tree.sha===merged.tree.sha,"TREE");
 const run=read(P+"/actions/runs/"+s.run);
 check(run.id===s.run&&run.name==="ContaOS F4 CODE - atestacao de provas"&&run.head_sha===s.head&&run.event==="pull_request"&&run.status==="completed"&&run.conclusion==="success"&&run.run_attempt===s.attempt,"RUN");
 const jobs=read(P+"/actions/runs/"+s.run+"/attempts/"+s.attempt+"/jobs?per_page=100").jobs;
 const job=jobs.find(x=>x.id===s.job);
 check(jobs.length===1&&job&&job.name==="attest"&&job.conclusion==="success"&&["Contraprovas de integridade e proveniencia","Conferir 13 arquivos oficiais e reproduzir ledger candidato","Preservar candidato nao certificado"].every(n=>job.steps.some(x=>x.name===n&&x.conclusion==="success")),"JOB");
 const a=read(P+"/actions/artifacts/"+s.artifact);
 check(a.id===s.artifact&&!a.expired&&a.name==="f4-code-attestation-candidate-"+s.testedSha&&a.digest==="sha256:"+s.archiveDigest&&a.workflow_run.id===s.run&&a.workflow_run.head_sha===s.head,"ARTIFACT");
 return {tree:tested.tree.sha};
}
export function verifyCandidateBytes(s,archive,downloaded,reproduced,versioned){
 check(hash(archive)===s.archiveDigest,"ARCHIVE_DIGEST");
 check(hash(downloaded)===s.candidateDigest&&downloaded.equals(reproduced)&&downloaded.equals(versioned),"CANDIDATE_BYTES");
 const c=JSON.parse(downloaded);
 check(c.schema==="contaos.ifv1.f4.code-attestation-candidate.v1"&&c.state==="CANDIDATE_NOT_CERTIFIED"&&c.certification==="NOT_CERTIFIED"&&c.scope==="CODE_FIXTURE"&&c.live==="NOT_RUN"&&c.production==="NO-GO","STATE");
 check(c.counts.cases===138&&c.counts.tests===276&&c.counts.mandatory===120&&c.counts.conditional===18&&c.counts.failed===0&&c.counts.blocked===0&&c.entries.length===138,"COUNTS");
 const ids=new Set(),keys=new Set();
 for(const e of c.entries){
  check(/^IFV1-F4-C\d{4}$/.test(e.caseId)&&!ids.has(e.caseId)&&e.tests.length===2&&e.status==="SUBMITTED_UNVERIFIED","CASE");
  ids.add(e.caseId);
  for(const t of e.tests){
   const k=t.caseId+":"+t.kind;
   check(t.caseId===e.caseId&&["positive","negative"].includes(t.kind)&&!keys.has(k)&&t.outcome==="PASS"&&t.mode==="CODE_FIXTURE"&&t.testedSha===c.source.testedSha&&sha64(t.observationSha256),"PROOF");
   keys.add(k);
  }
 }
 check(ids.size===138&&keys.size===276&&c.source.testedTree===c.source.mergedTree&&sha40(c.source.testedTree),"COVERAGE");
 return {candidateSha256:s.candidateDigest,source:c.source,counts:c.counts};
}
const PY=String.raw`import io,sys,zipfile,base64,json,stat
raw=sys.stdin.buffer.read()
with zipfile.ZipFile(io.BytesIO(raw)) as z:
    entries=z.infolist()
    if len(entries)!=2 or {x.filename for x in entries}!={"F4_CODE_ATTESTATION_CANDIDATE.json","SHA256SUMS"}:
        raise ValueError("unexpected candidate ZIP")
    out={}
    for x in entries:
        if x.is_dir() or stat.S_IFMT((x.external_attr>>16)&0xffff) not in (0,stat.S_IFREG) or x.flag_bits&1 or x.file_size>16*1024*1024:
            raise ValueError("unsafe ZIP entry")
        out[x.filename]=base64.b64encode(z.read(x)).decode("ascii")
    print(json.dumps(out))
`;
export function extractCandidate(archive){
 const raw=JSON.parse(execFileSync("python3",["-c",PY],{input:archive,encoding:"utf8",maxBuffer:64*1024*1024}));
 const ledger=Buffer.from(raw["F4_CODE_ATTESTATION_CANDIDATE.json"],"base64");
 const sums=Buffer.from(raw.SHA256SUMS,"base64").toString("utf8").trim();
 check(sums===hash(ledger)+"  F4_CODE_ATTESTATION_CANDIDATE.json","CHECKSUM");
 return ledger;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [config,reproducedPath,output]=process.argv.slice(2);
 check(config&&reproducedPath&&output&&process.env.GITHUB_REPOSITORY===REPO,"CLI");
 const s=JSON.parse(readFileSync(config,"utf8")),verified=checkCandidateProvenance(s);
 const archive=gh(P+"/actions/artifacts/"+s.artifact+"/zip",true);
 check(hash(archive)===s.archiveDigest,"ARCHIVE_DIGEST");
 const result=verifyCandidateBytes(s,archive,extractCandidate(archive),readFileSync(reproducedPath),readFileSync(DIR+"F4_CODE_ATTESTATION_CANDIDATE.json"));
 const receipt={schema:"contaos.ifv1.f4.code-promotion-receipt.v1",state:"LEDGER_VERIFIED_CERTIFICATE_PENDING",candidate:s,candidateTree:verified.tree,...result,certification:"NOT_CERTIFIED",live:"NOT_RUN",production:"NO-GO"};
 const bytes=Buffer.from(JSON.stringify(receipt,null,2)+"\n");
 writeFileSync(output,bytes,{flag:"wx"});
 console.log(JSON.stringify({gate:receipt.state,cases:result.counts.cases,tests:result.counts.tests,receiptSha256:hash(bytes)}));
 console.log("F4_PROMOTION_RECEIPT_DATA "+bytes.toString("base64"));
}

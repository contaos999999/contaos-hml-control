/**
 * Reserved read-only provenance runner. Requires a final pinned source config
 * from the merged #771 execution; never accepts invented or incomplete metadata.
 */
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {canonicalCatalogue,verifyArchiveContents,buildCandidate,sha} from "./integracao-v1-fase4-code-attestation.mjs";
const REPO="contaos999999/contaos-hml-control",PREFIX="repos/"+REPO;
const DIR="docs/frontend/auditorias/integracao-funcional-v1/fase4/";
const check=(v,r)=>{if(!v)throw Error("F4_PROVENANCE_"+r);};
const gh=(path,binary=false)=>execFileSync("gh",["api",path],{encoding:binary?null:"utf8",maxBuffer:64*1024*1024});
const api=path=>JSON.parse(gh(path));
const number=v=>Number.isSafeInteger(v)&&v>0;
const sha40=v=>typeof v==="string"&&/^[a-f0-9]{40}$/.test(v);
const sha64=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const names=[
 "ContaOS F4 CODE - provas materiais",
 "ContaOS Frontend Zero-Drift",
 "ContaOS LOCK-TYPES-01 Double Barrier",
 "ContaOS P0-NR-001 Anti-Reincidencia",
 "ContaOS F3 CODE - 138 case preflight (not certification)",
 "ContaOS F3 CODE - 138 execucoes funcionais individuais",
 "ContaOS F3 CODE - Coletor offline (nao certificador)",
];
const requiredBatches=["adm01","context","sys04-competence","sys04-data","sys04-actions","contracting-party","contracts","material-source","documents","competence","analysis","opinion-presentation","history"];
function same(a,b){return a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));}
function validateConfig(s){
 check(s.pr===771&&[s.head,s.merge,s.testedSha,s.backendSha].every(sha40)&&((s.testedTree===undefined&&s.mergedTree===undefined)||(sha40(s.testedTree)&&s.testedTree===s.mergedTree)),"PINNED_SOURCE");
 check(number(s.review)&&number(s.run)&&number(s.attempt)&&Array.isArray(s.runs)&&Array.isArray(s.batches),"PINNED_IDS");
 check(same(s.runs.map(r=>r.name),names)&&s.runs.every(r=>number(r.id))&&new Set(s.runs.map(r=>r.id)).size===7&&s.runs.find(r=>r.name===names[0]).id===s.run,"PINNED_RUNS");
 check(same(s.batches.map(b=>b.name),requiredBatches)&&s.batches.every(b=>number(b.job)&&number(b.artifact)&&sha64(b.digest)&&typeof b.path==="string"&&/^src\/test\/f4-code-[a-z0-9-]+\.test\.tsx?$/.test(b.path))&&new Set(s.batches.map(b=>b.job)).size===13&&new Set(s.batches.map(b=>b.artifact)).size===13&&new Set(s.batches.map(b=>b.path)).size===13,"PINNED_BATCHES");
}
function jobName(n){return "F4 CODE "+(n==="adm01"?"ADM01":n==="context"?"contexto":n)+" - material e readback";}
export function verifyLive(s,readApi=api){
 validateConfig(s);
 const p=readApi(PREFIX+"/pulls/"+s.pr),r=readApi(PREFIX+"/pulls/"+s.pr+"/reviews/"+s.review);
 check(p.number===s.pr&&p.merged===true&&p.base.ref==="main"&&p.head.sha===s.head&&p.merge_commit_sha===s.merge,"PR");
 check(r.id===s.review&&r.state==="APPROVED"&&r.commit_id===s.head&&r.user.login.toLowerCase()==="edivan5002"&&r.user.login!==p.user.login,"REVIEW");
 const tested=readApi(PREFIX+"/git/commits/"+s.testedSha),merged=readApi(PREFIX+"/git/commits/"+s.merge);
 check(tested.sha===s.testedSha&&merged.sha===s.merge&&sha40(tested.tree.sha)&&tested.tree.sha===merged.tree.sha&&(s.testedTree===undefined||tested.tree.sha===s.testedTree)&&(s.mergedTree===undefined||merged.tree.sha===s.mergedTree),"TREE");
 for(const pin of s.runs){
   const live=readApi(PREFIX+"/actions/runs/"+pin.id);
   check(live.id===pin.id&&live.name===pin.name&&live.head_sha===s.head&&live.event==="pull_request"&&live.status==="completed"&&live.conclusion==="success","RUN_"+pin.id);
   if(pin.id===s.run)check(live.run_attempt===s.attempt,"ATTEMPT");
   if(pin.name===names[1]){
     const jobs=readApi(PREFIX+"/actions/runs/"+pin.id+"/jobs?per_page=100").jobs;
     check(jobs.length>=2&&jobs.every(j=>j.conclusion==="success")&&jobs.some(j=>j.name.includes("Teste C Independente")),"ZERO_DRIFT_TEST_C");
   }
 }
 const jobs=readApi(PREFIX+"/actions/runs/"+s.run+"/attempts/"+s.attempt+"/jobs?per_page=100").jobs;
 check(jobs.length===13&&jobs.every(j=>j.conclusion==="success"),"JOBS");
 for(const b of s.batches){
   const j=jobs.find(j=>j.id===b.job);
   check(j&&j.name===jobName(b.name)&&j.run_id===s.run&&j.conclusion==="success"&&["Executar testes materiais","Conferir resultados e identidade real","Preservar relatorios e observacoes"].every(n=>j.steps.some(x=>x.name===n&&x.conclusion==="success")),"JOB_"+b.name);
   const a=readApi(PREFIX+"/actions/artifacts/"+b.artifact);
   check(a.id===b.artifact&&a.name==="f4-code-"+b.name+"-"+s.testedSha&&a.expired===false&&a.digest==="sha256:"+b.digest&&a.workflow_run.id===s.run&&a.workflow_run.head_sha===s.head,"ARTIFACT_"+b.name);
 }
 return {...s,testedTree:tested.tree.sha,mergedTree:merged.tree.sha};
}
export function verifyCheckout(source,git=(args)=>execFileSync("git",args,{encoding:"utf8"})){
 const matrix="docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv";
 const validator="scripts/hml/f4-code-material-evidence.mjs";
 const materialWorkflow=".github/workflows/contaos-f4-code-material.yml";
 const proposalPaths=[DIR+"F4_1_CASE_CONTRACTS_PROPOSAL.json",DIR+"F4_2_6_CASE_CONTRACTS_PROPOSAL.json"];
 check(sha40(source.merge)&&source.testedTree===source.mergedTree,"CHECKOUT_SOURCE");
 // Any changes to product/test sources or the material verifier since the
 // verified merge invalidate reuse of the previous execution.
 git(["diff","--exit-code",source.merge,"HEAD","--","src/",matrix,validator,materialWorkflow,...proposalPaths]);
 const blob=p=>{const v=git(["rev-parse",source.merge+":"+p]).trim();check(sha40(v),"BLOB_"+p);return v;};
 return {...source,sourceBlobs:{matrix:blob(matrix),validator:blob(validator),workflow:blob(materialWorkflow),proposals:proposalPaths.map(path=>({path,sha:blob(path)})),tests:source.batches.map(b=>({path:b.path,sha:blob(b.path)}))}};
}
const PY=String.raw`import sys,io,zipfile,json,base64,stat
raw=sys.stdin.buffer.read()
with zipfile.ZipFile(io.BytesIO(raw)) as z:
    entries=z.infolist()
    expected={"observations.json","receipt.json","vitest.json","SHA256SUMS"}
    if len(entries)!=4 or {x.filename for x in entries}!=expected:
        raise ValueError("unexpected or duplicate ZIP entries")
    out={}
    for x in entries:
        mode=(x.external_attr>>16)&0xffff
        if x.is_dir() or stat.S_IFMT(mode) not in (0,stat.S_IFREG) or x.flag_bits&1 or x.file_size>16*1024*1024:
            raise ValueError("unsafe ZIP entry")
        out[x.filename]=base64.b64encode(z.read(x)).decode("ascii")
    print(json.dumps(out))
`;
export function extract(zip){
 const result=JSON.parse(execFileSync("python3",["-c",PY],{input:zip,encoding:"utf8",maxBuffer:64*1024*1024}));
 return Object.fromEntries(Object.entries(result).map(([k,v])=>[k,Buffer.from(v,"base64")]));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
const [sourcePath,output]=process.argv.slice(2);
check(sourcePath&&output,"CLI");
check(process.env.GITHUB_REPOSITORY===REPO,"REPOSITORY");
const s=verifyCheckout(verifyLive(JSON.parse(readFileSync(resolve(sourcePath),"utf8"))));
const csv=readFileSync("docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv","utf8");
const proposals=["F4_1_CASE_CONTRACTS_PROPOSAL.json","F4_2_6_CASE_CONTRACTS_PROPOSAL.json"].flatMap(p=>JSON.parse(readFileSync(DIR+p,"utf8")).cases);
const catalogue=canonicalCatalogue(csv,proposals);
const proofs=[];
for(const b of s.batches){
 const zip=gh(PREFIX+"/actions/artifacts/"+b.artifact+"/zip",true);
 check(sha(zip)===b.digest,"ZIP_"+b.name);
 proofs.push(...verifyArchiveContents(s,b,zip,extract(zip)));
}
const candidate=buildCandidate(catalogue,s,proofs);
const bytes=Buffer.from(JSON.stringify(candidate)+"\n");
writeFileSync(resolve(output),bytes,{flag:"wx"});
console.log(JSON.stringify({gate:"CANDIDATE_NOT_CERTIFIED",cases:candidate.counts.cases,tests:candidate.counts.tests,candidateSha256:sha(bytes)}));
}

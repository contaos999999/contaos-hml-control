import {test} from "node:test";
import assert from "node:assert/strict";
import {verifyLive,verifyCheckout,extract} from "./integracao-v1-fase4-code-attestation-live.mjs";
import {execFileSync} from "node:child_process";
const HEAD="a".repeat(40),MERGE="b".repeat(40),TESTED="c".repeat(40),TREE="d".repeat(40),BACKEND="e".repeat(40);
const PREFIX="repos/contaos999999/contaos-hml-control";
const names=["ContaOS F4 CODE - provas materiais","ContaOS Frontend Zero-Drift","ContaOS LOCK-TYPES-01 Double Barrier","ContaOS P0-NR-001 Anti-Reincidencia","ContaOS F3 CODE - 138 case preflight (not certification)","ContaOS F3 CODE - 138 execucoes funcionais individuais","ContaOS F3 CODE - Coletor offline (nao certificador)"];
const batches=["adm01","context","sys04-competence","sys04-data","sys04-actions","contracting-party","contracts","material-source","documents","competence","analysis","opinion-presentation","history"];
function fixture(){
 const s={pr:771,head:HEAD,merge:MERGE,testedSha:TESTED,testedTree:TREE,mergedTree:TREE,backendSha:BACKEND,review:10,run:100,attempt:1,runs:names.map((name,i)=>({name,id:100+i})),batches:batches.map((name,i)=>({name,path:"src/test/f4-code-"+name+".test.ts",job:200+i,artifact:300+i,digest:"f".repeat(64)}))};
 const map=new Map();
 map.set(PREFIX+"/pulls/771",{number:771,merged:true,base:{ref:"main"},head:{sha:HEAD},merge_commit_sha:MERGE,user:{login:"author"}});
 map.set(PREFIX+"/pulls/771/reviews/10",{id:10,state:"APPROVED",commit_id:HEAD,user:{login:"Edivan5002"}});
 map.set(PREFIX+"/git/commits/"+TESTED,{sha:TESTED,tree:{sha:TREE}});
 map.set(PREFIX+"/git/commits/"+MERGE,{sha:MERGE,tree:{sha:TREE}});
 for(const r of s.runs)map.set(PREFIX+"/actions/runs/"+r.id,{...r,head_sha:HEAD,event:"pull_request",status:"completed",conclusion:"success",run_attempt:1});
 map.set(PREFIX+"/actions/runs/101/jobs?per_page=100",{jobs:[{name:"Zero-Drift",conclusion:"success"},{name:"Teste C Independente",conclusion:"success"}]});
 map.set(PREFIX+"/actions/runs/100/attempts/1/jobs?per_page=100",{jobs:s.batches.map(b=>({id:b.job,name:"F4 CODE "+(b.name==="adm01"?"ADM01":b.name==="context"?"contexto":b.name)+" - material e readback",run_id:100,conclusion:"success",steps:["Executar testes materiais","Conferir resultados e identidade real","Preservar relatorios e observacoes"].map(name=>({name,conclusion:"success"}))}))});
 for(const b of s.batches)map.set(PREFIX+"/actions/artifacts/"+b.artifact,{id:b.artifact,name:"f4-code-"+b.name+"-"+TESTED,expired:false,digest:"sha256:"+b.digest,workflow_run:{id:100,head_sha:HEAD}});
 const read=p=>{assert.ok(map.has(p),"unexpected API "+p);return map.get(p);};
 return {s,map,read};
}
test("pinned complete provenance accepts only verified CODE metadata",()=>{const {s,read}=fixture();verifyLive(s,read);});
test("reject wrong review, PR and tree",()=>{for(const [p,k,v,err] of [["/pulls/771/reviews/10","commit_id",MERGE,/REVIEW/],["/pulls/771","merged",false,/PR/],["/git/commits/"+TESTED,"tree",{sha:BACKEND},/TREE/]]){const {s,map,read}=fixture();map.get(PREFIX+p)[k]=v;assert.throws(()=>verifyLive(s,read),err);}});
test("reject missing batch, failed run, wrong attempt, failed Test C",()=>{let f=fixture();f.s.batches.pop();assert.throws(()=>verifyLive(f.s,f.read),/PINNED_BATCHES/);f=fixture();f.map.get(PREFIX+"/actions/runs/102").conclusion="failure";assert.throws(()=>verifyLive(f.s,f.read),/RUN_102/);f=fixture();f.map.get(PREFIX+"/actions/runs/100").run_attempt=2;assert.throws(()=>verifyLive(f.s,f.read),/ATTEMPT/);f=fixture();f.map.get(PREFIX+"/actions/runs/101/jobs?per_page=100").jobs[1].conclusion="failure";assert.throws(()=>verifyLive(f.s,f.read),/ZERO_DRIFT_TEST_C/);});
test("reject job without executed identity step and altered or expired artifact",()=>{let f=fixture();f.map.get(PREFIX+"/actions/runs/100/attempts/1/jobs?per_page=100").jobs[0].steps.pop();assert.throws(()=>verifyLive(f.s,f.read),/JOB_adm01/);f=fixture();f.map.get(PREFIX+"/actions/artifacts/300").expired=true;assert.throws(()=>verifyLive(f.s,f.read),/ARTIFACT_adm01/);f=fixture();f.map.get(PREFIX+"/actions/artifacts/300").digest="sha256:"+"1".repeat(64);assert.throws(()=>verifyLive(f.s,f.read),/ARTIFACT_adm01/);});
function zip(extra){return execFileSync("python3",["-c",`import io,zipfile,sys
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 for n in ['observations.json','receipt.json','vitest.json','SHA256SUMS']:z.writestr(n,'synthetic')
 if sys.argv[1]=='traversal':z.writestr('../outside','bad')
 if sys.argv[1]=='duplicate':z.writestr('receipt.json','bad')
sys.stdout.buffer.write(b.getvalue())
`,extra]);}
test("ZIP extraction reads only exact regular members and rejects extra or duplicate paths",()=>{assert.equal(Object.keys(extract(zip("valid"))).length,4);assert.throws(()=>extract(zip("traversal")));assert.throws(()=>extract(zip("duplicate")));});

test("derive actual tree identities when no tree SHA is supplied",()=>{const {s,read,map}=fixture();delete s.testedTree;delete s.mergedTree;const checked=verifyLive(s,read);assert.equal(checked.testedTree,TREE);assert.equal(checked.mergedTree,TREE);map.get(PREFIX+"/git/commits/"+MERGE).tree.sha=BACKEND;assert.throws(()=>verifyLive(s,read),/TREE/);});

test("checkout protects product, matrix, proposals, verifier and material workflow",()=>{
 const {s,read}=fixture();const checked=verifyLive(s,read);let sawDiff=false;
 const git=args=>{if(args[0]==="diff"){sawDiff=true;assert.ok(args.includes("src/"));assert.ok(args.includes("scripts/hml/f4-code-material-evidence.mjs"));assert.ok(args.includes(".github/workflows/contaos-f4-code-material.yml"));return "";}assert.equal(args[0],"rev-parse");return TREE+"\n";};
 const verified=verifyCheckout(checked,git);assert.equal(verified.sourceBlobs.tests.length,13);assert.equal(verified.sourceBlobs.matrix,TREE);assert.ok(sawDiff);
 assert.throws(()=>verifyCheckout(checked,()=>{throw Error("changed source");}),/changed source/);
});

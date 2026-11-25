import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {canonicalCatalogue,verifyArchiveContents,buildCandidate,sha} from "./integracao-v1-fase4-code-attestation.mjs";
const root=new URL("../../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const csv=read("docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv");
const dir="docs/frontend/auditorias/integracao-funcional-v1/fase4/";
const proposals=["F4_1_CASE_CONTRACTS_PROPOSAL.json","F4_2_6_CASE_CONTRACTS_PROPOSAL.json"].flatMap(p=>JSON.parse(read(dir+p)).cases);
const catalogue=canonicalCatalogue(csv,proposals);
const id="a".repeat(40),source={head:id,merge:id,testedSha:id,backendSha:id,testedTree:id,mergedTree:id,run:"11",attempt:"1"};
const ids=["0005","0036","0037","0043"].map(x=>"IFV1-F4-C"+x);
const observations=ids.flatMap(caseId=>["positive","negative"].map(kind=>({caseId,kind,mode:"CODE_FIXTURE",readback:{syntheticUnitTest:true}})));
const batch={name:"context",path:"src/test/f4-code-context-dashboard-sync.test.tsx",job:"21",artifact:"31",digest:sha(Buffer.from("synthetic zip test bytes"))};
const zip=Buffer.from("synthetic zip test bytes");
const report={numPassedTests:8,numTotalTests:8,numFailedTests:0,numPendingTests:0,success:true,testResults:[{name:"/runner/repo/"+batch.path,assertionResults:observations.map(x=>({title:x.caseId+" "+x.kind+": synthetic unit test",status:"passed"}))}]};
const receipt={schema:"contaos.ifv1.f4.material-partial.v1",scope:"CONTEXT_CODE_FIXTURE",sha:id,run:"11",attempt:"1",job:"21",covered:4,proofs:8,caseIds:ids,phaseTotal:138,certification:"NOT_CERTIFIED"};
function make(overrides={}){
 const content={ "observations.json":Buffer.from(JSON.stringify(overrides.obs??observations)),
 "receipt.json":Buffer.from(JSON.stringify(overrides.receipt??receipt)),
 "vitest.json":Buffer.from(JSON.stringify(overrides.report??report))};
 content.SHA256SUMS=Buffer.from(Object.entries(content).map(([k,v])=>sha(v)+"  "+k).join("\n")+"\n");
 return content;
}
test("canonical catalogue binds all 138 cases to source matrix",()=>{assert.equal(catalogue.length,138);assert.equal(catalogue.filter(x=>x.classification==="OBRIGATORIA").length,120);});
test("matrix rejects missing and substituted cases",()=>{assert.throws(()=>canonicalCatalogue(csv,proposals.slice(1)),/MATRIX_IDS/);assert.throws(()=>canonicalCatalogue(csv,[{...proposals[0],sourceReferences:"src/foreign.ts"},...proposals.slice(1)]),/MATRIX_BINDING/);});
test("canonical partial archive checks bytes and real report identity",()=>{const v=verifyArchiveContents(source,batch,zip,make());assert.equal(v.length,8);assert.ok(v.every(x=>x.outcome==="PASS"&&x.testPath===batch.path));});
test("reject altered ZIP and checksum",()=>{assert.throws(()=>verifyArchiveContents(source,batch,Buffer.from("other"),make()),/ARCHIVE_DIGEST/);const v=make();v["observations.json"]=Buffer.from("other");assert.throws(()=>verifyArchiveContents(source,batch,zip,v),/SUMS_BYTES/);});
test("reject unexpected files and swapped receipt identity",()=>{assert.throws(()=>verifyArchiveContents(source,batch,zip,{...make(),"../foreign":Buffer.from("x")}),/ARCHIVE_FILES/);assert.throws(()=>verifyArchiveContents(source,batch,zip,make({receipt:{...receipt,attempt:"2"}})),/RECEIPT_BINDING/);assert.throws(()=>verifyArchiveContents(source,batch,zip,make({receipt:{...receipt,job:"22"}})),/RECEIPT_BINDING/);});
test("reject swapped source and skipped test",()=>{const other=structuredClone(report);other.testResults[0].name="src/test/f3-code-other.test.ts";assert.throws(()=>verifyArchiveContents(source,batch,zip,make({report:other})),/SOURCE_FILE/);const skipped=structuredClone(report);skipped.testResults[0].assertionResults[0].status="skipped";assert.throws(()=>verifyArchiveContents(source,batch,zip,make({report:skipped})),/nonexecuted/);});
test("reject duplicate and foreign case with recomputed checksums",()=>{const dup=structuredClone(observations);dup[1]=dup[0];assert.throws(()=>verifyArchiveContents(source,batch,zip,make({obs:dup})),/duplicate/);const foreign=structuredClone(observations);foreign[0].caseId="IFV1-F4-C9999";assert.throws(()=>verifyArchiveContents(source,batch,zip,make({obs:foreign})),/noncanonical/);});
test("candidate only, never certification; reject incomplete coverage and unequal tree",()=>{const proofs=catalogue.flatMap(c=>["positive","negative"].map(kind=>({caseId:c.caseId,kind,mode:"CODE_FIXTURE",outcome:"PASS",testedSha:id,observationSha256:"b".repeat(64)})));const result=buildCandidate(catalogue,source,proofs);assert.equal(result.state,"CANDIDATE_NOT_CERTIFIED");assert.equal(result.certification,"NOT_CERTIFIED");assert.equal(result.counts.tests,276);assert.throws(()=>buildCandidate(catalogue,source,proofs.slice(1)),/SOURCE_TREE/);assert.throws(()=>buildCandidate(catalogue,{...source,mergedTree:"b".repeat(40)},proofs),/SOURCE_TREE/);const dup=[...proofs];dup[1]=dup[0];assert.throws(()=>buildCandidate(catalogue,source,dup),/COVERAGE/);});

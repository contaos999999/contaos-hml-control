import test from "node:test";
import assert from "node:assert/strict";
import {F3_PRODUCERS} from "./integracao-v1-fase3.mjs";
import {F3_DRIVER_NAMES,createF3CodeDrivers,runF3CodeDrivers} from "./integracao-v1-fase3-code-drivers.mjs";

const context={frontendSha:"a".repeat(40),workflowRunId:"123"};
const catalogue={count:138,cases:F3_PRODUCERS.flatMap(p=>Array.from({length:p.connections},(_,i)=>({
  caseId:"IFV1-F3-C"+String(p.order*100+i).padStart(4,"0"),
  producer:p.producer,producerOrder:p.order
})))};
test("F3 drivers: exactly 20 unique producer adapters covering 138 cases",()=>{
  assert.equal(F3_DRIVER_NAMES.length,20);
  assert.equal(new Set(F3_DRIVER_NAMES).size,20);
  assert.equal(catalogue.cases.length,138);
  const drivers=createF3CodeDrivers({});
  assert.deepEqual(Object.keys(drivers),F3_DRIVER_NAMES);
});
test("F3 drivers: missing implementation fails closed",async()=>{
  const drivers=createF3CodeDrivers({});
  await assert.rejects(drivers[F3_PRODUCERS[0].producer](
    catalogue.cases.filter(c=>c.producerOrder===1),context),/F3_DRIVER_NOT_IMPLEMENTED/);
});
test("F3 drivers: incomplete or invented evidence fails closed",async()=>{
  const p=F3_PRODUCERS[0],cases=catalogue.cases.filter(c=>c.producerOrder===p.order);
  const drivers=createF3CodeDrivers({[p.producer]:async()=>cases.map(c=>({
    caseId:c.caseId,executed:false,positiveTest:"PASS",negativeTest:"PASS",state:"PASS",
    frontendSha:context.frontendSha,workflowRunId:context.workflowRunId,
    testName:"source-only",logSha256:"b".repeat(64)
  }))});
  await assert.rejects(drivers[p.producer](cases,context),/F3_DRIVER_EVIDENCE_UNPROVEN/);
});
test("F3 drivers: accepts 138 individual verified results from injected executors",async()=>{
  const implementations=Object.fromEntries(F3_PRODUCERS.map(p=>[p.producer,async cases=>cases.map(c=>({
    caseId:c.caseId,executed:true,positiveTest:"PASS",negativeTest:"PASS",state:"PASS",
    frontendSha:context.frontendSha,workflowRunId:context.workflowRunId,
    testName:"test-"+c.caseId,logSha256:"b".repeat(64)
  }))]));
  const out=await runF3CodeDrivers(catalogue,implementations,context);
  assert.equal(out.results.length,138);
  assert.match(out.sha256,/^[a-f0-9]{64}$/);
});

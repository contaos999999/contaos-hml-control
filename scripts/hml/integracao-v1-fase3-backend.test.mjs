import test from "node:test";
import assert from "node:assert/strict";
import {createF3BackendTransport} from "./integracao-v1-fase3-backend.mjs";
import {F3_MUTATION_FLOWS} from "./integracao-v1-fase3.mjs";

const context={frontendSha:"a".repeat(40),workflowRunId:"123"};
const caseInput={producerOrder:14,producer:"criar_competencia",caseId:"C14",
  contract:F3_MUTATION_FLOWS[14],context};
test("F3 backend: rejects missing authenticated dependencies",()=>{
  assert.throws(()=>createF3BackendTransport({}),/F3_BACKEND_DEPENDENCIES/);
});
test("F3 backend: executes real RPC client and checks denied negative",async()=>{
  const calls=[];
  const master={rpc:async(name,args)=>{calls.push({name,args,actor:"master"});return {data:"ok",error:null};}};
  const leitor={rpc:async(name,args)=>{calls.push({name,args,actor:"leitor"});return {data:null,error:{code:"42501"}};}};
  const transport=createF3BackendTransport({
    master,leitor,
    plan:async()=>({positive:[{actor:"master",step:F3_MUTATION_FLOWS[14].principal[0],
      args:{p_id_contrato:"contract-id"},expect:"success"}],
      negative:[{actor:"leitor",step:F3_MUTATION_FLOWS[14].principal[0],
      args:{p_id_contrato:"contract-id"},expect:"denied"}]}),
    recordEvidence:async({caseId})=>({caseId,executed:true,positiveTest:"PASS",
      negativeTest:"PASS",state:"PASS",frontendSha:context.frontendSha,
      workflowRunId:context.workflowRunId,logSha256:"b".repeat(64),testName:"rpc-authz"})
  });
  const evidence=await transport.execute(caseInput);
  assert.equal(evidence.state,"PASS");
  assert.equal(calls.length,2);
  assert.deepEqual(calls.map(c=>c.actor),["master","leitor"]);
});
test("F3 backend: rejects false denial assertion",async()=>{
  const client={rpc:async()=>({data:"unexpected",error:null})};
  const transport=createF3BackendTransport({
    master:client,leitor:client,
    plan:async()=>({positive:[{actor:"master",step:F3_MUTATION_FLOWS[14].principal[0],
      args:{},expect:"success"}],
      negative:[{actor:"leitor",step:F3_MUTATION_FLOWS[14].principal[0],
      args:{},expect:"denied"}]}),
    recordEvidence:async()=>{throw Error("must not record");}
  });
  await assert.rejects(transport.execute(caseInput),/F3_BACKEND_ASSERTION_FAILED/);
});

test("F3 backend: network failure must not count as denied",async()=>{
  const client={rpc:async()=>({data:null,error:{code:"ECONNRESET"}})};
  const transport=createF3BackendTransport({master:client,leitor:client,
    plan:async()=>({positive:[{actor:"master",step:F3_MUTATION_FLOWS[14].principal[0],args:{},expect:"success"}],negative:[{actor:"leitor",step:F3_MUTATION_FLOWS[14].principal[0],args:{},expect:"denied"}]}),
    recordEvidence:async()=>{throw Error("must not record");}});
  await assert.rejects(transport.execute(caseInput),/F3_BACKEND_TRANSPORT_ERROR/);
});

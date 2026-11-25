import test from "node:test";
import assert from "node:assert/strict";
import {executeF3Backend138} from "./integracao-v1-fase3-backend-138.mjs";

const context={frontendSha:"a".repeat(40),workflowRunId:"123"};
const identity=id=>({auth:{getUser:async()=>({data:{user:{id}},error:null})}});
test("F3 backend 138: rejects absent providers",async()=>{
  await assert.rejects(executeF3Backend138({context}),/F3_HML_PROVIDERS_REQUIRED/);
});
test("F3 backend 138: rejects same session",async()=>{
  const client=identity("master");
  await assert.rejects(executeF3Backend138({context,
    sessionProvider:async()=>({master:client,leitor:client}),
    scenarioProvider:async()=>({}),evidenceRecorder:async()=>({})
  }),/F3_HML_DISTINCT_SESSIONS_REQUIRED/);
});
test("F3 backend 138: rejects same authenticated user",async()=>{
  await assert.rejects(executeF3Backend138({context,
    sessionProvider:async()=>({master:identity("same"),leitor:identity("same")}),
    scenarioProvider:async()=>({}),evidenceRecorder:async()=>({})
  }),/F3_HML_SESSION_AUTH_FAILED/);
});
test("F3 backend 138: no empty catalogue certification",async()=>{
  await assert.rejects(executeF3Backend138({context,catalogue:{count:0,cases:[]},
    sessionProvider:async()=>({master:identity("master"),leitor:identity("leitor")}),
    scenarioProvider:async()=>({}),evidenceRecorder:async()=>({})
  }),/F3_DRIVER_CATALOGUE/);
});

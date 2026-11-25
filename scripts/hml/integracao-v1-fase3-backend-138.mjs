/**
 * F3 code-level integration orchestration.
 * HML session and fixture providers must supply authenticated clients and
 * executable per-case scenarios. Missing prerequisites block certification.
 */
import {createF3BackendTransport} from "./integracao-v1-fase3-backend.mjs";
import {runF3CodeDrivers} from "./integracao-v1-fase3-code-drivers.mjs";

const fail=code=>{throw Object.assign(new Error(code),{code});};
const sha=/^[a-f0-9]{40}$/;
const run=/^[1-9]\d*$/;
export async function executeF3Backend138({
  catalogue,sessionProvider,scenarioProvider,evidenceRecorder,context
}={}){
  if(!context||!sha.test(context.frontendSha)||!run.test(String(context.workflowRunId)))
    fail("F3_HML_PROVENANCE_REQUIRED");
  if(typeof sessionProvider!=="function"||
     typeof scenarioProvider!=="function"||
     typeof evidenceRecorder!=="function")
    fail("F3_HML_PROVIDERS_REQUIRED");
  const sessions=await sessionProvider(context);
  if(!sessions||!sessions.master||!sessions.leitor||
     sessions.master===sessions.leitor||
     typeof sessions.master.auth?.getUser!=="function"||
     typeof sessions.leitor.auth?.getUser!=="function")
    fail("F3_HML_DISTINCT_SESSIONS_REQUIRED");
  const [master,leitor]=await Promise.all([
    sessions.master.auth.getUser(),sessions.leitor.auth.getUser()
  ]);
  if(master.error||leitor.error||!master.data?.user?.id||!leitor.data?.user?.id||
     master.data.user.id===leitor.data.user.id)
    fail("F3_HML_SESSION_AUTH_FAILED");
  const transport=createF3BackendTransport({
    master:sessions.master,leitor:sessions.leitor,
    plan:scenarioProvider,recordEvidence:evidenceRecorder
  });
  return runF3CodeDrivers(catalogue,transport.implementations,context);
}

/**
 * Authenticated F3 backend transport. Executes actual Supabase RPC, table and
 * Edge requests with caller JWT/RLS. No service_role and no implicit writes.
 * Scenario plans are mandatory: the transport cannot invent safe test fixtures.
 */
import {createHash} from "node:crypto";
import {F3_MUTATION_FLOWS} from "./integracao-v1-fase3.mjs";
import {connectF3ProductFlows} from "./integracao-v1-fase3-code-drivers.mjs";

const fail=code=>{throw Object.assign(new Error(code),{code});};
const hash=v=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
const isRecord=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const validStep=(step)=>step&&["rpc","table","edge"].includes(step.target)&&
  /^[a-z][a-z0-9_-]*$/.test(step.name);

/** The client is created by the authenticated HML test session, never here. */
export function createF3BackendTransport({master,leitor,plan,recordEvidence}) {
  if(!master||!leitor||typeof plan!=="function"||typeof recordEvidence!=="function")
    fail("F3_BACKEND_DEPENDENCIES");
  async function dispatch(client,step,args,operation) {
    if(!validStep(step)||!isRecord(args))fail("F3_BACKEND_STEP");
    if(step.target==="rpc"){
      if(typeof client.rpc!=="function")fail("F3_BACKEND_CLIENT");
      return client.rpc(step.name,args);
    }
    if(step.target==="edge"){
      if(typeof client.functions?.invoke!=="function")fail("F3_BACKEND_CLIENT");
      return client.functions.invoke(step.name,{body:args});
    }
    if(!["select","insert","update"].includes(operation)||typeof client.from!=="function")
      fail("F3_BACKEND_TABLE_OPERATION");
    const table=client.from(step.name);
    if(operation==="select")return table.select(args.columns??"*");
    if(operation==="insert")return table.insert(args.values).select();
    if(!isRecord(args.match))fail("F3_BACKEND_UPDATE_SCOPE");
    let q=table.update(args.values);
    for(const [key,value] of Object.entries(args.match))q=q.eq(key,value);
    return q.select();
  }
  async function execute({producerOrder,producer,caseId,contract,context}){
    const scenario=await plan({producerOrder,producer,caseId,contract,context});
    if(!isRecord(scenario)||!Array.isArray(scenario.positive)||
       !Array.isArray(scenario.negative)||scenario.positive.length===0||
       scenario.negative.length===0)fail("F3_BACKEND_SCENARIO_REQUIRED");
    const traces=[];
    for(const [kind,steps] of [["positive",scenario.positive],["negative",scenario.negative]]){
      for(const item of steps){
        if(!isRecord(item)||!["master","leitor"].includes(item.actor)||
           !validStep(item.step)||!isRecord(item.args)||
           !["success","denied"].includes(item.expect))fail("F3_BACKEND_SCENARIO_INVALID");
        const allowed=contract&&[
          ...(contract.principal??[]),
          ...Object.values(contract.prerequisito??{}).flat()
        ].some(s=>s.target===item.step.target&&s.name===item.step.name);
        if(!allowed)fail("F3_BACKEND_OPERATION_NOT_IN_CONTRACT");
        const client=item.actor==="master"?master:leitor;
        const result=await dispatch(client,item.step,item.args,item.operation);
        const denied=Boolean(result?.error);
        if((item.expect==="denied")!==denied)fail("F3_BACKEND_ASSERTION_FAILED");
        traces.push({kind,actor:item.actor,target:item.step.target,
          operation:item.step.name,denied,errorCode:result?.error?.code??null});
      }
    }
    const evidence=await recordEvidence({caseId,producer,context,traces,traceSha256:hash(traces)});
    if(!isRecord(evidence)||evidence.caseId!==caseId||
       evidence.executed!==true||evidence.positiveTest!=="PASS"||
       evidence.negativeTest!=="PASS"||evidence.state!=="PASS")
      fail("F3_BACKEND_EVIDENCE_MISSING");
    return evidence;
  }
  return Object.freeze({execute,implementations:connectF3ProductFlows(execute)});
}

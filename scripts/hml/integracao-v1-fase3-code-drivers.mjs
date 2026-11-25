/**
 * F3 CODE: 20 producer adapters with fail-closed real executor injection.
 * No fake PASS, no synthetic request, and no LIVE prerequisite.
 */
import {createHash} from "node:crypto";
import {F3_PRODUCERS} from "./integracao-v1-fase3.mjs";
import {certifyF3Code138} from "./integracao-v1-fase3-code-138-runner.mjs";

const sha256=value=>createHash("sha256").update(value).digest("hex");
const SHA40=/^[a-f0-9]{40}$/;
const SHA64=/^[a-f0-9]{64}$/;
const error=code=>Object.assign(new Error(code),{code});
export const F3_DRIVER_NAMES=Object.freeze(F3_PRODUCERS.map(p=>p.producer));
if(F3_DRIVER_NAMES.length!==20||new Set(F3_DRIVER_NAMES).size!==20)
  throw error("F3_DRIVER_REGISTRY_INCOMPLETE");

/**
 * Each implementation must execute its actual code path and return per-case evidence.
 * No default handler: absent integrations block certification.
 */
export function createF3CodeDrivers(implementations) {
  if(!implementations||typeof implementations!=="object"||Array.isArray(implementations))
    throw error("F3_DRIVER_IMPLEMENTATIONS_REQUIRED");
  const expected=new Set(F3_DRIVER_NAMES);
  for(const name of Object.keys(implementations))
    if(!expected.has(name))throw error("F3_DRIVER_UNKNOWN");
  const drivers=Object.fromEntries(F3_PRODUCERS.map(p=>[
    p.producer,async function runProducer(cases,context){
      if(!Array.isArray(cases)||cases.length!==p.connections||
        cases.some(c=>c.producer!==p.producer||c.producerOrder!==p.order)||
        new Set(cases.map(c=>c.caseId)).size!==cases.length)
        throw error("F3_DRIVER_CASE_MAPPING");
      const impl=implementations[p.producer];
      if(typeof impl!=="function")throw error("F3_DRIVER_NOT_IMPLEMENTED");
      if(!context||!SHA40.test(context.frontendSha)||!String(context.workflowRunId).match(/^[1-9]\d*$/))
        throw error("F3_DRIVER_PROVENANCE");
      const evidence=await impl(Object.freeze([...cases]),Object.freeze({...context}));
      if(!Array.isArray(evidence)||evidence.length!==cases.length)
        throw error("F3_DRIVER_EVIDENCE_COUNT");
      const byId=new Map();
      for(const e of evidence){
        if(!e||byId.has(e.caseId))throw error("F3_DRIVER_DUPLICATE_EVIDENCE");
        byId.set(e.caseId,e);
      }
      return cases.map(c=>{
        const e=byId.get(c.caseId);
        if(!e||e.executed!==true||e.positiveTest!=="PASS"||
          e.negativeTest!=="PASS"||e.state!=="PASS"||
          e.frontendSha!==context.frontendSha||
          String(e.workflowRunId)!==String(context.workflowRunId)||
          typeof e.testName!=="string"||!e.testName||
          !SHA64.test(e.logSha256))
          throw error("F3_DRIVER_EVIDENCE_UNPROVEN");
        return Object.freeze({...e});
      });
    }
  ]));
  return Object.freeze(drivers);
}
export async function runF3CodeDrivers(catalogue,implementations,context) {
  if(catalogue?.count!==138||catalogue.cases?.length!==138)
    throw error("F3_DRIVER_CATALOGUE");
  const drivers=createF3CodeDrivers(implementations);
  const results=[];
  for(const p of F3_PRODUCERS){
    const group=catalogue.cases.filter(c=>c.producerOrder===p.order);
    results.push(...await drivers[p.producer](group,context));
  }
  if(results.length!==138||new Set(results.map(r=>r.caseId)).size!==138)
    throw error("F3_DRIVER_COVERAGE");
  const certificate=certifyF3Code138(catalogue,results,context);
  return Object.freeze({results,sha256:sha256(JSON.stringify(results)),certificate});
}

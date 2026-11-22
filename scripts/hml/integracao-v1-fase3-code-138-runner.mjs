/**
 * F3 CODE: source-map preflight for exactly 138 caseIds, never functional certification.
 * A source line is not proof that a producer/consumer integration ran.
 */
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assessF3CodeInventoryFromRepo, F3_CODE_CASES_PATH, F3_CODE_MATRIX_PATH } from "./integracao-v1-fase3-code-gate.mjs";

const SHA40 = /^[a-f0-9]{40}$/;
const CASE = /^IFV1-F3-C\d{4}$/;
const sourceHint = /^(src\/[A-Za-z0-9_./-]+\.(?:ts|tsx)):(\d+)$/;
const sha = v => createHash("sha256").update(v).digest("hex");
const knownProducerSource = new Set([1,2,3,4,5,6,7,8,14]);
export const SCHEMA = "contaos.ifv1.f3.code-138-preflight.v1";
function checked(ok, code) {
  if (!ok) throw Object.assign(new Error(code), { code });
}

export function buildF3Code138Preflight(catalogue, coverage, sources,
  { frontendSha, backendSha = null, workflowRunId, jobName }) {
  checked(catalogue?.count === 138 && catalogue.cases?.length === 138 &&
    coverage?.cases?.length === 138, "F3_138_CATALOGUE");
  checked(SHA40.test(frontendSha) && (backendSha === null || SHA40.test(backendSha)), "F3_138_SHA");
  checked(/^[1-9]\d*$/.test(String(workflowRunId)) &&
    typeof jobName === "string" && jobName.length > 0, "F3_138_CI_PROVENANCE");
  const entries = catalogue.cases.map((c,i) => {
    const m = coverage.cases[i];
    checked(CASE.test(c.caseId) && c.caseId === m?.caseId &&
      c.producerOrder === m?.producerOrder && c.producer === m?.producer &&
      c.consumer === m?.consumer && c.classification === m?.classification,
      "F3_138_MATRIX_MISMATCH");
    checked(Array.isArray(m.sourceHints) && m.sourceHints.length === 2, "F3_138_SOURCE_HINTS");
    const hints = m.sourceHints.map(h => {
      const match = sourceHint.exec(h);
      checked(match && !match[1].split("/").includes(".."), "F3_138_SOURCE_PATH");
      const [,path,loc] = match;
      const lines = sources[path]?.split("\n");
      return { path, line:Number(loc), sourcePresent: !!lines && Number(loc)>0 && Number(loc)<=lines.length };
    });
    const producerSourcePresent = knownProducerSource.has(c.producerOrder);
    return {
      caseId:c.caseId, classification:c.classification, producerOrder:c.producerOrder,
      producer:c.producer, consumer:c.consumer, sourceHints:hints,
      producerDriverSourcePresent:producerSourcePresent,
      positiveTest:"NOT_RUN", negativeTest:"NOT_RUN", state:"BLOCKED",
      reason: hints.some(h=>!h.sourcePresent) ? "F3_SOURCE_HINT_MISSING" :
        producerSourcePresent ? "F3_CASE_CONSUMER_INTEGRATION_NOT_EXECUTED" :
        "F3_PRODUCER_DRIVER_NOT_IMPLEMENTED",
      functionalEvidence:null,
    };
  });
  checked(new Set(entries.map(e=>e.caseId)).size===138,"F3_138_DUPLICATES");
  checked(entries.filter(e=>e.classification==="OBRIGATORIA").length===120 &&
    entries.filter(e=>e.classification==="CONDICIONAL").length===18,
    "F3_138_CLASSIFICATION");
  const summary = {
    total:138, required:120, conditional:18,
    executedFunctional:0, certified:0, blocked:138,
    brokenSourceHints:entries.filter(e=>e.sourceHints.some(h=>!h.sourcePresent)).length,
  };
  const report = {
    schema:SCHEMA, state:"NOT_CERTIFIED",
    note:"STATIC SOURCE PREFLIGHT ONLY; no functional case was executed; NEVER PASS.",
    provenance:{frontendSha,backendSha,workflowRunId:String(workflowRunId),jobName,jobId:null},
    summary,entries,
  };
  return {...report,reportSha256:sha(JSON.stringify(report))};
}

async function runCli(root=fileURLToPath(new URL("../../",import.meta.url)),env=process.env) {
  await assessF3CodeInventoryFromRepo(root);
  const [catRaw,mapRaw]=await Promise.all([F3_CODE_CASES_PATH,F3_CODE_MATRIX_PATH]
    .map(p=>readFile(join(root,p),"utf8")));
  const catalogue=JSON.parse(catRaw),coverage=JSON.parse(mapRaw);
  const sourceFiles=[...new Set(coverage.cases.flatMap(c=>c.sourceHints.map(h=>h.split(":")[0])))];
  const sources={};
  for(const path of sourceFiles) {
    checked(path.startsWith("src/") && !path.split("/").includes(".."),"F3_138_SOURCE_PATH");
    try {sources[path]=await readFile(join(root,path),"utf8");} catch {sources[path]=null;}
  }
  const report=buildF3Code138Preflight(catalogue,coverage,sources,{
    frontendSha:env.GITHUB_SHA,backendSha:env.F3_BACKEND_SHA,
    workflowRunId:env.GITHUB_RUN_ID,jobName:env.GITHUB_JOB,
  });
  const dir=join(root,"artifacts","f3-code-138-preflight");
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,"F3_CODE_138_PREFLIGHT.json"),JSON.stringify(report,null,2)+"\n");
  process.stdout.write(JSON.stringify({state:report.state,summary:report.summary,
    reportSha256:report.reportSha256})+"\n");
  if(report.summary.blocked||report.summary.brokenSourceHints)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===new URL("file://"+resolve(process.argv[1])).href){
  runCli().catch(e=>{process.stderr.write(JSON.stringify({state:"FAIL",
    code:e.code||"F3_138_RUNTIME"})+"\n");process.exitCode=1;});
}

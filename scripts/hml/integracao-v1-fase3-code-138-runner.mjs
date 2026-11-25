/**
 * F3 CODE: source-map preflight for exactly 138 caseIds, never functional certification.
 * A source line is not proof that a producer/consumer integration ran.
 */
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const F3_CODE_CASES_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json";
const F3_CODE_MATRIX_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_COVERAGE_MATRIX.json";
const F3_CODE_LEDGER_PATH = "docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_EVIDENCE_LEDGER.json";
const F3_CODE_CSV_PATH = "docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv";
const CATALOGUE_HASH = "bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb";
const CSV_HASH = "b8b4980bab5f841adc1db9c642e960f45a6874baad660bd18cd6a60ce87e32d9";

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

/** Validates real per-case automated results. Source-map success is never evidence. */
export function certifyF3Code138(catalogue, results, {frontendSha,workflowRunId}) {
  checked(catalogue?.count===138 && catalogue.cases?.length===138,"F3_CERT_CATALOGUE");
  checked(SHA40.test(frontendSha) && /^[1-9]\\d*$/.test(String(workflowRunId)),"F3_CERT_PROVENANCE");
  checked(Array.isArray(results) && results.length===138,"F3_CERT_RESULT_COUNT");
  const byId=new Map();
  for(const r of results){
    checked(r && CASE.test(r.caseId) && !byId.has(r.caseId),"F3_CERT_DUPLICATE_OR_INVALID");
    byId.set(r.caseId,r);
  }
  const entries=catalogue.cases.map(c=>{
    const r=byId.get(c.caseId);
    checked(r && r.frontendSha===frontendSha &&
      String(r.workflowRunId)===String(workflowRunId),"F3_CERT_MISSING_OR_STALE");
    checked(r.positiveTest==="PASS" && r.negativeTest==="PASS" &&
      r.state==="PASS" && r.executed===true &&
      typeof r.testName==="string" && r.testName.length>0 &&
      typeof r.logSha256==="string" && /^[a-f0-9]{64}$/.test(r.logSha256),
      "F3_CERT_UNPROVEN_CASE");
    return {caseId:c.caseId,classification:c.classification,testName:r.testName,
      logSha256:r.logSha256,positiveTest:"PASS",negativeTest:"PASS",state:"PASS"};
  });
  checked(new Set(entries.map(e=>e.caseId)).size===138,"F3_CERT_COVERAGE");
  const report={schema:"contaos.ifv1.f3.code-138-certification.v1",
    state:"CERTIFIED_CODE_ONLY",provenance:{frontendSha,workflowRunId:String(workflowRunId)},
    summary:{total:138,passed:138,failed:0},entries};
  return {...report,reportSha256:sha(JSON.stringify(report))};
}

async function runCli(root=fileURLToPath(new URL("../../",import.meta.url)),env=process.env) {
  const [catRaw,mapRaw,ledgerRaw,csvRaw]=await Promise.all(
    [F3_CODE_CASES_PATH,F3_CODE_MATRIX_PATH,F3_CODE_LEDGER_PATH,F3_CODE_CSV_PATH]
    .map(p=>readFile(join(root,p),"utf8")));
  checked(sha(catRaw)===CATALOGUE_HASH && sha(csvRaw)===CSV_HASH,"F3_138_CANONICAL_HASH");
  const catalogue=JSON.parse(catRaw),coverage=JSON.parse(mapRaw),ledger=JSON.parse(ledgerRaw);
  checked(coverage.sourceCatalogueSha256===CATALOGUE_HASH &&
    coverage.sourceCsvSha256===CSV_HASH && coverage.mandatory===120 &&
    coverage.conditional===18 && coverage.certification==="NOT_CERTIFIED" &&
    ledger.sourceCatalogueSha256===CATALOGUE_HASH && ledger.state==="NOT_CERTIFIED" &&
    Array.isArray(ledger.entries)&&ledger.entries.length===0 &&
    Array.isArray(ledger.runs)&&ledger.runs.length===0,"F3_138_LEDGER_INTEGRITY");
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

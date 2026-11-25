import { mkdirSync, writeFileSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fixtureProofValid, loadAttestation, verifyBrowserReport } from './guard.mjs';
const output = 'artifacts/hml-counterproofs';
mkdirSync(output, { recursive:true });
const context = {sha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,repository:process.env.GITHUB_REPOSITORY};
const fixture=loadAttestation();
const liveFixturePass=fixtureProofValid(fixture,context);
const browserReportPath=output+'/playwright-results.json';
let browserReport=null;
try {
  if(statSync(browserReportPath).size <= 4*1024*1024) {
    browserReport=JSON.parse(readFileSync(browserReportPath,'utf8'));
  }
} catch { /* fail closed, no provider output */ }
finally { try { unlinkSync(browserReportPath); } catch { /* missing is a failure */ } }
const browserCasesExecuted=process.env.CONTAOS_HML_TEST_EXIT==='0' && verifyBrowserReport(browserReport);
const status = liveFixturePass && browserCasesExecuted ? 'AUTH_RLS_BROWSER_CASES_EXECUTED' : 'BLOCKED_OR_FAILED';
const receipt={
  schema:'contaos.hml.counterproofs.v2',repository:context.repository??null,
  frontend_sha:context.sha??null,backend_source_sha:process.env.CONTAOS_HML_EXPECTED_BACKEND_SHA||null,
  backend_deployment_parity:'NOT_CERTIFIED',frontend_deployment_parity:'REQUIRES_PROVIDER_READBACK',
  run_id:context.runId??null,run_attempt:context.runAttempt??null,
  environment:'hml',test_ids:['HML-AUTH-001','HML-AUTH-002','HML-AUTH-003'],
  live_auth_rls_attested:liveFixturePass,browser_cases_executed:browserCasesExecuted,
  status,semantic_completeness:'INCONCLUSIVE',full_rls_coverage:'NOT_CERTIFIED',
  scope:'HML live Auth, two synthetic identities, bilateral tenant RLS and three browser checks only; no global backend/PROD certification',
  generated_at:new Date().toISOString()
};
const json=JSON.stringify(receipt,null,2)+'\n';
writeFileSync(output+'/receipt.json',json,{mode:0o600});
writeFileSync(output+'/SHA256SUMS',createHash('sha256').update(json).digest('hex')+'  receipt.json\n',{mode:0o600});
console.log(JSON.stringify({status,live_auth_rls_attested:liveFixturePass,browser_cases_executed:browserCasesExecuted,backend_deployment_parity:'NOT_CERTIFIED'}));
if(status!=='AUTH_RLS_BROWSER_CASES_EXECUTED') process.exitCode=1;

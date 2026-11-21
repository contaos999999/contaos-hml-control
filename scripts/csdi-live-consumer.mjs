#!/usr/bin/env node
// Live GitHub evidence consumer. Read-only, fail-closed; no secret printed.
// A structurally valid receipt cannot certify itself. Fetch and verify live
// GitHub Actions run/job/commit from GitHub REST with an authorized token.
import { readFileSync } from 'node:fs';
import { validateCSDI } from './csdi-receipt-validator.mjs';
export async function validateLiveCSDI(receipt,{fetchImpl=fetch,token=process.env.GITHUB_TOKEN,repository=process.env.GITHUB_REPOSITORY}={}) {
  const structural=validateCSDI(receipt);
  const issues=[...structural.issues];
  if (!/^[-\w.]+\/[-\w.]+$/.test(repository||'')) issues.push('INVALID_REPOSITORY');
  if (!token) issues.push('MISSING_GITHUB_TOKEN');
  if (!Number.isSafeInteger(receipt?.github_run_id) || receipt.github_run_id<=0) issues.push('INVALID_RUN_ID');
  if (!Number.isSafeInteger(receipt?.github_job_id) || receipt.github_job_id<=0) issues.push('INVALID_JOB_ID');
  if (issues.length) return {pass:false,verdict:'BLOCKED',issues};
  const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  async function get(path) {
    const response=await fetchImpl(`https://api.github.com/repos/${repository}/${path}`,{headers,redirect:'error'});
    if (!response.ok) throw Error('GITHUB_FETCH_FAILED');
    return response.json();
  }
  try {
    const [run,jobs,commit]=await Promise.all([
      get(`actions/runs/${receipt.github_run_id}`),
      get(`actions/runs/${receipt.github_run_id}/jobs?per_page=100`),
      get(`commits/${receipt.head}`)
    ]);
    if (run.head_sha!==receipt.head || run.status!=='completed' || run.conclusion!=='success') issues.push('RUN_NOT_SUCCESS_ON_HEAD');
    if (!Array.isArray(jobs.jobs) || !jobs.jobs.some(j=>j.id===receipt.github_job_id && j.run_id===receipt.github_run_id && j.conclusion==='success')) issues.push('JOB_NOT_SUCCESS_ON_RUN');
    if (commit.sha!==receipt.head) issues.push('COMMIT_MISMATCH');
    if (run.repository?.full_name!==repository) issues.push('RUN_REPOSITORY_MISMATCH');
    // Important: this consumer does NOT validate witness artifacts, reviewer identity,
    // PLAN origin, run attempt or protected main ancestry. It cannot issue final PASS.
    issues.push('FULL_AUTHENTICATED_EVIDENCE_CONSUMER_NOT_IMPLEMENTED');
  } catch { issues.push('LIVE_EVIDENCE_UNAVAILABLE'); }
  return {pass:false,verdict:'BLOCKED',issues};
}
if(process.argv[1]?.endsWith('csdi-live-consumer.mjs')) {
  let result;
  try { result=await validateLiveCSDI(JSON.parse(readFileSync(process.argv[2],'utf8'))); }
  catch {result={pass:false,verdict:'BLOCKED',issues:['INVALID_RECEIPT_INPUT']};}
  console.log(JSON.stringify(result));process.exitCode=2;
}

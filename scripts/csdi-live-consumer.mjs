#!/usr/bin/env node
// Live GitHub evidence consumer. Read-only, fail-closed; no secret printed.
// A structurally valid receipt cannot certify itself. Fetch and verify live
// GitHub Actions run/job/commit from GitHub REST with an authorized token.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateCSDI } from './csdi-receipt-validator.mjs';
export async function validateLiveCSDI(receipt,{fetchImpl=fetch,token=process.env.GITHUB_TOKEN,repository=process.env.GITHUB_REPOSITORY}={}) {
  const structural=validateCSDI(receipt);
  const issues=[...structural.issues];
  if (!/^[-\w.]+\/[-\w.]+$/.test(repository||'')) issues.push('INVALID_REPOSITORY');
  if (!token) issues.push('MISSING_GITHUB_TOKEN');
  if (!Number.isSafeInteger(receipt?.github_run_id) || receipt.github_run_id<=0) issues.push('INVALID_RUN_ID');
  if (!Number.isSafeInteger(receipt?.github_job_id) || receipt.github_job_id<=0) issues.push('INVALID_JOB_ID');
  if (!Number.isSafeInteger(receipt?.github_run_attempt) || receipt.github_run_attempt<=0) issues.push('INVALID_RUN_ATTEMPT');
  if (!Number.isSafeInteger(receipt?.github_artifact_id) || receipt.github_artifact_id<=0) issues.push('INVALID_ARTIFACT_ID');
  if (typeof receipt?.artifact_archive_sha256!=='string' || !/^[a-f0-9]{64}$/i.test(receipt.artifact_archive_sha256)) issues.push('INVALID_ARTIFACT_ARCHIVE_DIGEST');
  if (!Number.isSafeInteger(receipt?.pr_number) || receipt.pr_number<=0) issues.push('INVALID_PR_NUMBER');
  if (typeof receipt?.reviewer_login!=='string' || !/^[a-zA-Z0-9-]{1,39}$/.test(receipt.reviewer_login)) issues.push('INVALID_REVIEWER_LOGIN');
  if (issues.length) return {pass:false,verdict:'BLOCKED',issues};
  const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  async function get(path) {
    const response=await fetchImpl(`https://api.github.com/repos/${repository}/${path}`,{headers,redirect:'error'});
    if (!response.ok) throw Error('GITHUB_FETCH_FAILED');
    return response.json();
  }
  try {
    const [run,jobs,commit,artifacts,pr,reviews,plan]=await Promise.all([
      get(`actions/runs/${receipt.github_run_id}`),
      get(`actions/runs/${receipt.github_run_id}/jobs?per_page=100`),
      get(`commits/${receipt.head}`),
      get(`actions/runs/${receipt.github_run_id}/artifacts?per_page=100`),
      get(`pulls/${receipt.pr_number}`),
      get(`pulls/${receipt.pr_number}/reviews?per_page=100`),
      get(`contents/docs/frontend/planos/P0_GOV_PLAN_${receipt.pr_number}.json?ref=main`)
    ]);
    if (jobs.total_count>100 || artifacts.total_count>100 || reviews.length===100) issues.push('PAGINATION_INCOMPLETE');
    if (run.head_sha!==receipt.head || run.status!=='completed' || run.conclusion!=='success') issues.push('RUN_NOT_SUCCESS_ON_HEAD');
    if (!Array.isArray(jobs.jobs) || !jobs.jobs.some(j=>j.id===receipt.github_job_id && j.run_id===receipt.github_run_id && j.conclusion==='success' && j.status==='completed')) issues.push('JOB_NOT_SUCCESS_ON_RUN');
    if (commit.sha!==receipt.head) issues.push('COMMIT_MISMATCH');
    if (run.repository?.full_name!==repository) issues.push('RUN_REPOSITORY_MISMATCH');
    if (run.run_attempt!==receipt.github_run_attempt) issues.push('RUN_ATTEMPT_MISMATCH');
    const artifact=Array.isArray(artifacts.artifacts) ? artifacts.artifacts.find(a=>a.id===receipt.github_artifact_id && a.workflow_run?.id===receipt.github_run_id && !a.expired && a.size_in_bytes>0) : null;
    if (!artifact) issues.push('ARTIFACT_NOT_VERIFIED');
    else {
      const archive=await fetchImpl(`https://api.github.com/repos/${repository}/actions/artifacts/${receipt.github_artifact_id}/zip`,{headers,redirect:'follow'});
      if (!archive.ok) issues.push('ARTIFACT_DOWNLOAD_FAILED');
      else {
        const bytes=Buffer.from(await archive.arrayBuffer());
        if (bytes.length<4 || bytes.subarray(0,2).toString()!=='PK') issues.push('ARTIFACT_ARCHIVE_INVALID');
        if (bytes.length>100*1024*1024) issues.push('ARTIFACT_TOO_LARGE');
        const actual=createHash('sha256').update(bytes).digest('hex');
        if (actual.toLowerCase()!==receipt.artifact_archive_sha256.toLowerCase()) issues.push('ARTIFACT_ARCHIVE_DIGEST_MISMATCH');
      }
    }
    if (pr.head?.sha!==receipt.head || pr.base?.sha!==receipt.base || pr.number!==receipt.pr_number) issues.push('PR_HEAD_BASE_MISMATCH');
    if (!Array.isArray(reviews) || !reviews.some(x=>x.user?.login?.toLowerCase()===receipt.reviewer_login.toLowerCase() && x.state==='APPROVED' && x.commit_id===receipt.head && x.user?.login!==pr.user?.login)) issues.push('INDEPENDENT_REVIEW_NOT_VERIFIED');
    if (plan.path!==`docs/frontend/planos/P0_GOV_PLAN_${receipt.pr_number}.json` || !plan.sha || !plan.content) issues.push('PROTECTED_PLAN_NOT_FOUND');
    else {
      const decoded=Buffer.from(plan.content.replace(/\s/g,''),'base64').toString('utf8');
      const parsed=JSON.parse(decoded);
      if(parsed.approved!==true || parsed.pr_number!==receipt.pr_number || parsed.ativacao_autorizada!==false || !parsed.files?.includes('scripts/csdi-live-consumer.mjs')) issues.push('PROTECTED_PLAN_SCOPE_MISMATCH');
    }
    // ZIP digest proves archive bytes only. Semantic witness contents, complete
    // clause/pair inventory and seven-axis executions are not yet authenticated.
    issues.push('SEMANTIC_WITNESS_CONTENT_NOT_VERIFIED');
  } catch { issues.push('LIVE_EVIDENCE_UNAVAILABLE'); }
  return {pass:false,verdict:'BLOCKED',issues};
}
if(process.argv[1]?.endsWith('csdi-live-consumer.mjs')) {
  let result;
  try { result=await validateLiveCSDI(JSON.parse(readFileSync(process.argv[2],'utf8'))); }
  catch {result={pass:false,verdict:'BLOCKED',issues:['INVALID_RECEIPT_INPUT']};}
  console.log(JSON.stringify(result));process.exitCode=2;
}

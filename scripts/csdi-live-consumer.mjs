#!/usr/bin/env node
// Live GitHub evidence consumer. Read-only, fail-closed; no secret printed.
// A structurally valid receipt cannot certify itself. Fetch and verify live
// GitHub Actions run/job/commit from GitHub REST with an authorized token.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { validateCSDI } from './csdi-receipt-validator.mjs';

function crc32(bytes) {
  let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++) crc=(crc>>>1) ^ ((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
function readWitnessArchive(zip) {
  if(zip.length>100*1024*1024) throw Error('ARCHIVE_TOO_LARGE');
  const eocd=zip.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));
  if(eocd<0 || eocd+22>zip.length) throw Error('ZIP_EOCD_MISSING');
  if(eocd+22+zip.readUInt16LE(eocd+20)!==zip.length) throw Error('ZIP_TRAILING_DATA');
  const count=zip.readUInt16LE(eocd+10), offset=zip.readUInt32LE(eocd+16), centralSize=zip.readUInt32LE(eocd+12);
  if(count===0xffff || offset===0xffffffff || centralSize===0xffffffff || offset+centralSize!==eocd) throw Error('ZIP64_OR_CENTRAL_BOUNDS');
  if(zip.readUInt16LE(eocd+4)!==0 || zip.readUInt16LE(eocd+6)!==0 || zip.readUInt16LE(eocd+8)!==1 || count!==1 || offset>=zip.length) throw Error('ZIP_ENTRY_COUNT_INVALID');
  if(zip.readUInt32LE(offset)!==0x02014b50) throw Error('ZIP_CENTRAL_INVALID');
  const flags=zip.readUInt16LE(offset+8), method=zip.readUInt16LE(offset+10), compressed=zip.readUInt32LE(offset+20), uncompressed=zip.readUInt32LE(offset+24);
  if(flags & 0x1 || flags & 0x40 || flags & 0x2000) throw Error('ZIP_UNSUPPORTED_FLAGS');
  const nameLen=zip.readUInt16LE(offset+28), extraLen=zip.readUInt16LE(offset+30), commentLen=zip.readUInt16LE(offset+32);
  if(offset+46+nameLen+extraLen+commentLen!==eocd) throw Error('ZIP_CENTRAL_ENTRY_BOUNDS');
  const name=zip.subarray(offset+46,offset+46+nameLen).toString('utf8');
  if(name!=='csdi-witnesses.json' || extraLen>4096 || commentLen>4096 || uncompressed>5*1024*1024 || compressed>5*1024*1024 || ![0,8].includes(method)) throw Error('ZIP_WITNESS_INVALID');
  const local=zip.readUInt32LE(offset+42);
  if(local===0xffffffff || compressed===0xffffffff || uncompressed===0xffffffff) throw Error('ZIP64_UNSUPPORTED');
  if(local+30>zip.length || zip.readUInt32LE(local)!==0x04034b50) throw Error('ZIP_LOCAL_INVALID');
  if(flags & 0x8) throw Error('ZIP_DATA_DESCRIPTOR_UNSUPPORTED');
  if(zip.readUInt16LE(local+8)!==method || zip.readUInt16LE(local+6)!==flags || zip.readUInt32LE(local+18)!==compressed || zip.readUInt32LE(local+22)!==uncompressed || zip.readUInt32LE(local+14)!==zip.readUInt32LE(offset+16)) throw Error('ZIP_HEADER_MISMATCH');
  if(zip.subarray(local+30,local+30+zip.readUInt16LE(local+26)).toString('utf8')!==name) throw Error('ZIP_FILENAME_MISMATCH');
  const start=local+30+zip.readUInt16LE(local+26)+zip.readUInt16LE(local+28);
  if(start+compressed>offset) throw Error('ZIP_DATA_TRUNCATED');
  const payload=zip.subarray(start,start+compressed);
  const decoded=method===8?inflateRawSync(payload,{maxOutputLength:5*1024*1024}):payload;
  if(decoded.length!==uncompressed) throw Error('ZIP_SIZE_MISMATCH');
  if(crc32(decoded)!==zip.readUInt32LE(offset+16)) throw Error('ZIP_CRC_MISMATCH');
  return {bytes:decoded,witnesses:JSON.parse(decoded.toString('utf8'))};
}
export function validateWitnessContents(w,receipt) {
  if(!w || w.schema!=='contaos.csdi.witnesses.v1' || w.head!==receipt.head || w.base!==receipt.base) return false;
  const axes=['literal','systematic','teleological','temporal','security','operational','adversarial'];
  if(!Array.isArray(w.clauses) || w.clauses.length!==receipt.coverage.clauses_total || !Array.isArray(w.rules) || w.rules.length!==receipt.coverage.rules_total || !Array.isArray(w.pairs) || w.pairs.length!==receipt.coverage.pairs_total) return false;
  const unique=(arr)=>arr.every(x=>x && typeof x==='object') && new Set(arr.map(x=>x.id)).size===arr.length && arr.every(x=>typeof x.id==='string' && x.id.length>0 && x.status==='PASS' && typeof x.evidence_ref==='string' && x.evidence_ref.length>0 && /^[a-f0-9]{64}$/i.test(x.evidence_sha256||''));
  if(!unique(w.clauses) || !unique(w.rules) || !unique(w.pairs)) return false;
  // A digest declared by the witness is not evidence unless recomputed from
  // the canonical payload and linked to the exact normative item.
  if(!Array.isArray(w.evidence) || !w.evidence.length) return false;
  const evidenceById=new Map();
  for(const e of w.evidence){
    if(typeof e?.id!=='string' || evidenceById.has(e.id) || typeof e?.payload!=='string' || !e.payload || typeof e?.sha256!=='string') return false;
    if(createHash('sha256').update(e.payload,'utf8').digest('hex')!==e.sha256.toLowerCase()) return false;
    evidenceById.set(e.id,e);
  }
  const hasEvidence=(item)=>{const e=evidenceById.get(item.evidence_ref);return e && e.sha256.toLowerCase()===item.evidence_sha256.toLowerCase() && e.subject_id===item.id;};
  if(![...w.clauses,...w.rules,...w.pairs].every(hasEvidence)) return false;
  if(!w.clauses.every(c=>axes.every(name=>c.axes?.[name]?.status==='PASS' && /^[a-f0-9]{64}$/i.test(c.axes[name].evidence_sha256||'')))) return false;
  if(!w.rules.every(r=>axes.every(name=>r.axes?.[name]?.status==='PASS' && /^[a-f0-9]{64}$/i.test(r.axes[name].evidence_sha256||'')))) return false;
  if(!w.pairs.every(p=>axes.every(name=>p.axes?.[name]?.status==='PASS' && /^[a-f0-9]{64}$/i.test(p.axes[name].evidence_sha256||'')))) return false;
  if(![...w.clauses,...w.rules,...w.pairs].every(item=>axes.every(name=>{const x=item.axes[name],e=evidenceById.get(x.evidence_ref);return e && e.subject_id===item.id && e.axis===name && e.sha256.toLowerCase()===x.evidence_sha256.toLowerCase();}))) return false;
  if(!Array.isArray(w.normative_inventory) || !w.normative_inventory.length || !w.normative_source || typeof w.normative_source.sha256!=='string' || !/^[a-f0-9]{64}$/i.test(w.normative_source.sha256)) return false;
  const inventory=w.normative_inventory;
  // A source digest without immutable repository, commit and path is not provenance.
  if(!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(w.normative_source.repository||'') || !/^[a-f0-9]{40}$/i.test(w.normative_source.commit||'') || typeof w.normative_source.path!=='string' || !/^[a-zA-Z0-9_./-]+$/.test(w.normative_source.path) || w.normative_source.path.includes('..')) return false;
  if(inventory.some(x=>!x || typeof x!=='object') || new Set(inventory.map(x=>x.id)).size!==inventory.length || inventory.some(x=>!['clause','rule','pair'].includes(x.kind) || typeof x.id!=='string' || !x.id || !x.source_ref)) return false;
  for(const [kind,items] of [['clause',w.clauses],['rule',w.rules],['pair',w.pairs]]) {
    const expected=new Set(inventory.filter(x=>x.kind===kind).map(x=>x.id));
    if(expected.size!==items.length || items.some(x=>!expected.has(x.id))) return false;
  }
  if(!Array.isArray(w.axes) || w.axes.length!==7 || w.axes.some(a=>!a || typeof a!=='object') || new Set(w.axes.map(a=>a?.name)).size!==7 || !axes.every(name=>w.axes.some(a=>a.name===name && a.status==='PASS' && Array.isArray(a.witness_ids) && a.witness_ids.length>0 && a.witness_ids.every(id=>w.clauses.some(c=>c.id===id))))) return false;
  return true;
}

export async function verifyNormativeSource(source,{fetchImpl=fetch,token}={}) {
  if(!source || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(source.repository||'') || !/^[a-f0-9]{40}$/i.test(source.commit||'') || !/^[a-f0-9]{64}$/i.test(source.sha256||'') || typeof source.path!=='string' || !/^[a-zA-Z0-9_./-]+$/.test(source.path) || source.path.includes('..') || !token) return false;
  const url=`https://api.github.com/repos/${source.repository}/contents/${source.path}?ref=${source.commit}`;
  try {
    const response=await fetchImpl(url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'},redirect:'error'});
    if(!response.ok) return false;
    const file=await response.json();
    if(file.type!=='file' || file.path!==source.path || file.encoding!=='base64' || typeof file.content!=='string') return false;
    const bytes=Buffer.from(file.content.replace(/\\s/g,''),'base64');
    return createHash('sha256').update(bytes).digest('hex')===source.sha256.toLowerCase();
  }catch{return false;}
}

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
      if(artifact.size_in_bytes>100*1024*1024) throw Error('ARTIFACT_SIZE_LIMIT');
      // Never forward a bearer token across a cross-origin redirect.
      const archive=await fetchImpl(`https://api.github.com/repos/${repository}/actions/artifacts/${receipt.github_artifact_id}/zip`,{headers,redirect:'manual'});
      if(archive.status>=300 && archive.status<400) {issues.push('ARTIFACT_REDIRECT_REQUIRES_TRUSTED_FETCH');}
      if (!archive.ok) issues.push('ARTIFACT_DOWNLOAD_FAILED');
      else {
        const bytes=Buffer.from(await archive.arrayBuffer());
        if (bytes.length<4 || bytes.subarray(0,2).toString()!=='PK') issues.push('ARTIFACT_ARCHIVE_INVALID');
        if (bytes.length>100*1024*1024) issues.push('ARTIFACT_TOO_LARGE');
        if (bytes.length!==artifact.size_in_bytes) issues.push('ARTIFACT_METADATA_SIZE_MISMATCH');
        const actual=createHash('sha256').update(bytes).digest('hex');
        if (actual.toLowerCase()!==receipt.artifact_archive_sha256.toLowerCase()) issues.push('ARTIFACT_ARCHIVE_DIGEST_MISMATCH');
        else {
          try {
            const {bytes:witnessBytes,witnesses}=readWitnessArchive(bytes);
            const digest=createHash('sha256').update(witnessBytes).digest('hex');
            if(digest!==receipt.evidence_sha256.toLowerCase()) issues.push('WITNESS_BYTES_DIGEST_MISMATCH');
            if(!validateWitnessContents(witnesses,receipt)) issues.push('WITNESS_CONTENT_INCOMPLETE');
            if(!await verifyNormativeSource(witnesses.normative_source,{fetchImpl,token})) issues.push('NORMATIVE_SOURCE_NOT_AUTHENTICATED');
          } catch {issues.push('WITNESS_ARCHIVE_UNREADABLE');}
        }
      }
    }
    if (pr.head?.sha!==receipt.head || pr.base?.sha!==receipt.base || pr.number!==receipt.pr_number) issues.push('PR_HEAD_BASE_MISMATCH');
    const reviewerEvents=Array.isArray(reviews)?reviews.filter(x=>x.user?.login?.toLowerCase()===receipt.reviewer_login.toLowerCase() && ['APPROVED','CHANGES_REQUESTED','DISMISSED'].includes(x.state)).sort((a,b)=>new Date(a.submitted_at||0)-new Date(b.submitted_at||0)):[];
    const latestReview=reviewerEvents.at(-1);
    if (!latestReview || latestReview.state!=='APPROVED' || latestReview.commit_id!==receipt.head || latestReview.user?.login===pr.user?.login) issues.push('INDEPENDENT_REVIEW_NOT_VERIFIED');
    if (!latestReview || receipt.second_read?.review_id!==latestReview.id || receipt.second_read?.commit_sha!==latestReview.commit_id || receipt.second_read?.reviewer?.toLowerCase()!==latestReview.user?.login?.toLowerCase() || receipt.reviewer_login.toLowerCase()!==latestReview.user?.login?.toLowerCase()) issues.push('SECOND_READ_GITHUB_MISMATCH');
    if (plan.path!==`docs/frontend/planos/P0_GOV_PLAN_${receipt.pr_number}.json` || !plan.sha || !plan.content) issues.push('PROTECTED_PLAN_NOT_FOUND');
    else {
      const decoded=Buffer.from(plan.content.replace(/\s/g,''),'base64').toString('utf8');
      const parsed=JSON.parse(decoded);
      if(parsed.approved!==true || parsed.pr_number!==receipt.pr_number || parsed.ativacao_autorizada!==false || !parsed.files?.includes('scripts/csdi-live-consumer.mjs')) issues.push('PROTECTED_PLAN_SCOPE_MISMATCH');
    }
    // Witness structural validation does not prove truth of semantic interpretations
    // or actual test executions. Independent adjudication and execution provenance
    // remain mandatory before a definitive semantic PASS.
    issues.push('SEMANTIC_EXECUTION_PROVENANCE_NOT_VERIFIED');
  } catch { issues.push('LIVE_EVIDENCE_UNAVAILABLE'); }
  return {pass:false,verdict:'BLOCKED',issues};
}
if(process.argv[1]?.endsWith('csdi-live-consumer.mjs')) {
  let result;
  try { result=await validateLiveCSDI(JSON.parse(readFileSync(process.argv[2],'utf8'))); }
  catch {result={pass:false,verdict:'BLOCKED',issues:['INVALID_RECEIPT_INPUT']};}
  console.log(JSON.stringify(result));process.exitCode=2;
}

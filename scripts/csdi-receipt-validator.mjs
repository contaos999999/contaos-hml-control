#!/usr/bin/env node
// Fail-closed CSDI receipt validation. This validator checks structure and evidence references,
// not truth of semantic claims; external LIVE provenance remains a separate gate.
import { readFileSync } from 'node:fs';
const REQUIRED_AXES = ['literal','systematic','teleological','temporal','security','operational','adversarial'];
export function validateCSDI(receipt) {
  const issues = [];
  const obj = receipt && typeof receipt === 'object' && !Array.isArray(receipt) ? receipt : {};
  if (obj.schema !== 'contaos.semantic-certification.v1') issues.push('INVALID_SCHEMA');
  if (obj.marker !== 'CONTAOS_SEMANTIC_CERTIFICATION_V1') issues.push('INVALID_MARKER');
  for (const field of ['head','base','plan_sha','manifest_sha','evidence_sha256','run_id']) {
    const value = obj[field];
    const pattern = field.endsWith('_sha256') ? /^[a-f0-9]{64}$/i : field.endsWith('_sha') || ['head','base'].includes(field) ? /^[a-f0-9]{40}$/i : /^\S+$/;
    if (typeof value !== 'string' || !pattern.test(value)) issues.push('INVALID_' + field.toUpperCase());
  }
  const counts = obj.coverage || {};
  for (const key of ['clauses_total','clauses_proven','rules_total','rules_proven','pairs_total','pairs_adjudicated']) {
    if (!Number.isSafeInteger(counts[key]) || counts[key] < 0) issues.push('INVALID_COUNT_' + key);
  }
  for (const [a,b] of [['clauses_total','clauses_proven'],['rules_total','rules_proven'],['pairs_total','pairs_adjudicated']]) {
    if (counts[a] === 0 || counts[a] !== counts[b]) issues.push('INCOMPLETE_' + a);
  }
  if (!Array.isArray(obj.axes) || REQUIRED_AXES.some(name => !obj.axes.some(x => x?.name === name && x?.verdict === 'PASS' && Array.isArray(x?.witnesses) && x.witnesses.length > 0))) issues.push('INCOMPLETE_SEVEN_AXES');
  for (const field of ['ambiguities_unresolved','unproven_rules','unadjudicated_pairs','active_vetoes']) {
    if (obj[field] !== 0) issues.push('NOT_ZERO_' + field.toUpperCase());
  }
  if (!Array.isArray(obj.positive_tests) || obj.positive_tests.length === 0 || obj.positive_tests.some(x => x?.status !== 'PASS' || !x?.run_id)) issues.push('POSITIVE_TESTS_MISSING');
  if (!Array.isArray(obj.negative_tests) || obj.negative_tests.length === 0 || obj.negative_tests.some(x => x?.status !== 'PASS' || !x?.run_id)) issues.push('NEGATIVE_TESTS_MISSING');
  if (obj.second_read?.verdict !== 'PASS' || !obj.second_read?.reviewer || !obj.second_read?.evidence_ref || !/^[a-f0-9]{40}$/i.test(obj.second_read?.commit_sha||'') || obj.second_read?.commit_sha!==obj.head || !Number.isSafeInteger(obj.second_read?.review_id) || obj.second_read.review_id<=0 || !Array.isArray(obj.second_read?.findings) || obj.second_read.findings.some(x=>x?.resolution!=='VERIFIED')) issues.push('SECOND_READ_MISSING');
  if (obj.live_provenance_verified !== true) issues.push('LIVE_PROVENANCE_NOT_VERIFIED');
  if (obj.drift_detected !== false) issues.push('DRIFT_UNRESOLVED');
  if (obj.verdict !== 'PASS') issues.push('RECEIPT_NOT_PASS');
  return {pass:issues.length===0,verdict:issues.length===0?'PASS':'BLOCKED',issues};
}
if (process.argv[1]?.endsWith('csdi-receipt-validator.mjs')) {
  try { const receipt = JSON.parse(readFileSync(process.argv[2], 'utf8')); const result = validateCSDI(receipt); console.log(JSON.stringify(result)); if (!result.pass) process.exitCode=2; }
  catch (e) { console.log(JSON.stringify({pass:false,verdict:'BLOCKED',issues:['INVALID_RECEIPT_INPUT']})); process.exitCode=2; }
}

import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { classifyActor, classifyIsolation } from './fixture-attestation.mjs';

const ATTESTATION = 'artifacts/hml-counterproofs/fixture-attestation.json';
const ATTESTATION_SHA = 'artifacts/hml-counterproofs/fixture-attestation.SHA256';
export function verifyAttestationDigest(raw, checksumLine) {
 if (typeof raw !== 'string' || typeof checksumLine !== 'string') return false;
 const hash=createHash('sha256').update(raw).digest('hex');
 return checksumLine.trim() === hash + '  fixture-attestation.json';
}
export function loadAttestation() {
 try {
  const raw=readFileSync(ATTESTATION,'utf8');
  const checksum=readFileSync(ATTESTATION_SHA,'utf8');
  if (!verifyAttestationDigest(raw,checksum)) return null;
  return JSON.parse(raw);
 } catch {return null;}
}
const BACKEND_SNAPSHOT = 'docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json';
export function canonicalBackendSource() {
 try {
  const snap=JSON.parse(readFileSync(BACKEND_SNAPSHOT,'utf8'));
  if(snap.schema!=='contaos.frontend.canonical-source-snapshot.v1' ||
     snap.source_repo!=='contaos999999/develop' || snap.source_branch!=='main') return null;
  return /^[a-f0-9]{40}$/.test(snap.source_commit||'')?snap.source_commit:null;
 } catch {return null;}
}
export const REQUIRED = [
  'CONTAOS_HML_FRONTEND_URL', 'CONTAOS_HML_ALLOWED_HOST',
  'CONTAOS_HML_USER_A_EMAIL', 'CONTAOS_HML_USER_A_PASSWORD',
  'CONTAOS_HML_USER_B_EMAIL', 'CONTAOS_HML_USER_B_PASSWORD',
  'CONTAOS_HML_EXPECTED_FRONTEND_SHA', 'CONTAOS_HML_EXPECTED_BACKEND_SHA'
];
export function fixtureProofValid(proof, context = {}) {
  if (!proof || proof.schema !== 'contaos.hml.real-fixtures.v1' ||
      proof.status !== 'AUTH_RLS_LIVE_PASS' || proof.environment !== 'hml' ||
      proof.evidence_class !== 'LIVE_AUTH_AND_RLS_NOT_MOCKED') return false;
  if (proof.repository !== context.repository || proof.frontend_sha !== context.sha ||
      proof.run_id !== context.runId || proof.run_attempt !== context.runAttempt) return false;
  return classifyActor(proof.actor_A) && classifyActor(proof.actor_B) &&
         classifyIsolation(proof.tenant_rls);
}
export function preflight(env, context = {}, evidence = null) {
  const errors = [];
  for (const name of REQUIRED) if (typeof env[name] !== 'string' || !env[name].trim()) errors.push('MISSING_' + name);
  let url;
  try { url = new URL(env.CONTAOS_HML_FRONTEND_URL); } catch { errors.push('INVALID_HML_URL'); }
  if (url && (url.protocol !== 'https:' || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash ||
      url.hostname !== 'contaos-41-hml.vercel.app' ||
      env.CONTAOS_HML_ALLOWED_HOST !== 'contaos-41-hml.vercel.app')) errors.push('UNTRUSTED_HML_HOST');
  const emailA = env.CONTAOS_HML_USER_A_EMAIL, emailB = env.CONTAOS_HML_USER_B_EMAIL;
  // Neither email text nor a prefix string is proof of fixture status. Only the LIVE Auth app_metadata attestation is.
  if (emailA && !/^[^\s@]+@[^\s@]+$/.test(emailA)) errors.push('INVALID_IDENTITY_A');
  if (emailB && !/^[^\s@]+@[^\s@]+$/.test(emailB)) errors.push('INVALID_IDENTITY_B');
  if (emailA && emailB && emailA.toLowerCase() === emailB.toLowerCase()) errors.push('IDENTICAL_IDENTITIES');
  if (!/^[a-f0-9]{40}$/i.test(env.CONTAOS_HML_EXPECTED_FRONTEND_SHA || '') ||
      env.CONTAOS_HML_EXPECTED_FRONTEND_SHA !== context.sha) errors.push('FRONTEND_SHA_MISMATCH');
  // This is only source SHA syntax. Backend publication parity remains an independent NO-GO gate.
  if (!/^[a-f0-9]{40}$/i.test(env.CONTAOS_HML_EXPECTED_BACKEND_SHA || '')) errors.push('BACKEND_SHA_UNVERIFIED');
  const canonicalSource=canonicalBackendSource();
  if (!canonicalSource || env.CONTAOS_HML_EXPECTED_BACKEND_SHA !== canonicalSource) errors.push('BACKEND_SOURCE_SHA_MISMATCH');
  if (!context.runId || !context.runAttempt || context.repository !== 'contaos999999/contaos-hml-control') errors.push('MISSING_RUN_PROVENANCE');
  if (!fixtureProofValid(evidence, context)) errors.push('LIVE_AUTH_RLS_ATTESTATION_MISSING_OR_FAILED');
  return { pass: errors.length === 0, errors, release: 'HML_AUTH_RLS_ONLY_NO_BACKEND_CERTIFICATION' };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const proof = loadAttestation();
  const context = { sha: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID, runAttempt: process.env.GITHUB_RUN_ATTEMPT, repository: process.env.GITHUB_REPOSITORY };
  const result = preflight(process.env, context, proof);
  console.log(JSON.stringify({status: result.pass ? 'PREFLIGHT_HML_AUTH_RLS_PASS' : 'BLOCKED', release: result.release, errors: result.errors}));
  if (!result.pass) process.exitCode = 1;
}

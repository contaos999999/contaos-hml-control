import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const REQUIRED = ['CONTAOS_HML_FRONTEND_URL','CONTAOS_HML_USER_A_EMAIL','CONTAOS_HML_USER_A_PASSWORD','CONTAOS_HML_USER_B_EMAIL','CONTAOS_HML_USER_B_PASSWORD','CONTAOS_HML_EXPECTED_FRONTEND_SHA','CONTAOS_HML_EXPECTED_BACKEND_SHA'];
export function preflight(env, context = {}) {
  const errors = [];
  for (const name of REQUIRED) if (!env[name]?.trim()) errors.push('MISSING_'+name);
  let url;
  try { url = new URL(env.CONTAOS_HML_FRONTEND_URL); } catch { errors.push('INVALID_HML_URL'); }
  if (url && (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !/^[a-z0-9.-]+$/i.test(url.hostname) || !env.CONTAOS_HML_ALLOWED_HOST || url.hostname !== env.CONTAOS_HML_ALLOWED_HOST)) errors.push('UNTRUSTED_HML_HOST');
  if (env.CONTAOS_HML_USER_A_EMAIL && !env.CONTAOS_HML_USER_A_EMAIL.startsWith('contaos-hml-')) errors.push('NON_SYNTHETIC_USER_A');
  if (env.CONTAOS_HML_USER_B_EMAIL && !env.CONTAOS_HML_USER_B_EMAIL.startsWith('contaos-hml-')) errors.push('NON_SYNTHETIC_USER_B');
  if (env.CONTAOS_HML_USER_A_EMAIL && env.CONTAOS_HML_USER_A_EMAIL === env.CONTAOS_HML_USER_B_EMAIL) errors.push('IDENTICAL_IDENTITIES');
  if (!/^[a-f0-9]{40}$/i.test(env.CONTAOS_HML_EXPECTED_FRONTEND_SHA || '') || env.CONTAOS_HML_EXPECTED_FRONTEND_SHA !== context.sha) errors.push('FRONTEND_SHA_MISMATCH');
  if (!/^[a-f0-9]{40}$/i.test(env.CONTAOS_HML_EXPECTED_BACKEND_SHA || '')) errors.push('BACKEND_SHA_UNVERIFIED');
  if (!context.runId || !context.runAttempt || !context.repository) errors.push('MISSING_RUN_PROVENANCE');
  if (env.CONTAOS_HML_ISOLATED_FIXTURES !== 'true') errors.push('ISOLATION_NOT_ATTESTED');
  return { pass: errors.length === 0, errors };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = preflight(process.env,{sha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,repository:process.env.GITHUB_REPOSITORY});
  console.log(JSON.stringify({status:result.pass?'PREFLIGHT_PASS':'BLOCKED',errors:result.errors}));
  if (!result.pass) process.exitCode = 1;
}

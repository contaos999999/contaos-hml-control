// HML-only real Supabase Auth and bilateral tenant-RLS counterproof.
// Never emit emails, UUIDs, tokens, request bodies, headers or provider errors.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const HML_URL = 'https://gklhhhyosgasnyoxlrui.supabase.co';
const OUTPUT = 'artifacts/hml-counterproofs';
const RESULT_PATH = OUTPUT + '/fixture-attestation.json';
export function classifyActor({ login, emailMatch, confirmed, synthetic } = {}) {
  return login === true && emailMatch === true && confirmed === true && synthetic === true;
}
export function classifyIsolation({ distinctUsers, distinctOrgs, aOwn, bOwn, aCannotReadB, bCannotReadA, noExtraTenantLinks } = {}) {
  return [distinctUsers, distinctOrgs, aOwn, bOwn, aCannotReadB, bCannotReadA, noExtraTenantLinks].every(v => v === true);
}
export function classifyOutcome(a, b, isolation) {
  return classifyActor(a) && classifyActor(b) && classifyIsolation(isolation) ? 'AUTH_RLS_LIVE_PASS' : 'BLOCKED';
}
function buildClient(url, key) {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
function credentials(label) {
  const suffix = label === 'a' ? '' : '_2';
  return { email: process.env['CONTAOS_HML_SYNTHETIC' + suffix + '_EMAIL'] ?? '',
           password: process.env['CONTAOS_HML_SYNTHETIC' + suffix + '_PASSWORD'] ?? '' };
}
async function verifyActor(client, { email, password }) {
  const proof = { login: false, emailMatch: false, confirmed: false, synthetic: false };
  if (!email || !password || !email.includes('@')) return { proof, client, user: null };
  // Do not use user_metadata. Only immutable server-controlled app_metadata can prove a synthetic fixture.
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.user || !data.session?.access_token) return { proof, client, user: null };
  proof.login = true;
  proof.emailMatch = (data.user.email ?? '').toLowerCase() === email.toLowerCase();
  proof.confirmed = Boolean(data.user.email_confirmed_at);
  proof.synthetic = data.user.app_metadata?.synthetic === true;
  return { proof, client, user: data.user };
}
async function visibleActiveOrgs(client) {
  const { data, error } = await client.from('vinculos_usuarios').select('id_organizacao,ativo').eq('ativo', true);
  if (error || !Array.isArray(data)) return null;
  return [...new Set(data.filter(x => x.ativo === true).map(x => x.id_organizacao))];
}
async function visibleOrg(client, org) {
  if (!org) return null;
  const { data, error } = await client.from('organizacoes').select('id').eq('id', org);
  if (error || !Array.isArray(data)) return null;
  return data.length === 1 && data[0].id === org;
}
async function deniedOtherOrg(client, org) {
  if (!org) return false;
  const { data, error } = await client.from('organizacoes').select('id').eq('id', org);
  // A read hidden by RLS returns 200 + zero rows; any transport or permission error is not counted as a pass.
  return !error && Array.isArray(data) && data.length === 0;
}
function safeReceipt(a, b, i, provenance) {
  const status = classifyOutcome(a, b, i);
  return {
    schema: 'contaos.hml.real-fixtures.v1', status, environment: 'hml',
    repository: provenance.repo, frontend_sha: provenance.sha, run_id: provenance.runId, run_attempt: provenance.attempt,
    backend_parity: 'NOT_ATTESTED', // Separate gate. Never infer from login.
    actor_A: a, actor_B: b, tenant_rls: i,
    evidence_class: 'LIVE_AUTH_AND_RLS_NOT_MOCKED', generated_at: new Date().toISOString()
  };
}
function writeSanitized(receipt) {
  mkdirSync(OUTPUT, { recursive: true });
  const serialized = JSON.stringify(receipt, null, 2) + '\n';
  writeFileSync(RESULT_PATH, serialized, { mode: 0o600 });
  writeFileSync(OUTPUT + '/fixture-attestation.SHA256', createHash('sha256').update(serialized).digest('hex') + '  fixture-attestation.json\n', { mode: 0o600 });
}
export async function main() {
  const provenance = { repo: process.env.GITHUB_REPOSITORY ?? null, sha: process.env.GITHUB_SHA ?? null,
                       runId: process.env.GITHUB_RUN_ID ?? null, attempt: process.env.GITHUB_RUN_ATTEMPT ?? null };
  const aProof = { login: false, emailMatch: false, confirmed: false, synthetic: false };
  const bProof = { login: false, emailMatch: false, confirmed: false, synthetic: false };
  const isolation = { distinctUsers: false, distinctOrgs: false, aOwn: false, bOwn: false, aCannotReadB: false, bCannotReadA: false, noExtraTenantLinks: false };
  let a = null, b = null;
  try {
    if (provenance.repo !== 'contaos999999/contaos-hml-control' || !/^[a-f0-9]{40}$/.test(provenance.sha ?? '') || !provenance.runId || !provenance.attempt) throw Error('PROVENANCE_INVALID');
    const source = readFileSync('src/integrations/supabase/client.ts', 'utf8');
    const url = source.match(/const SUPABASE_URL = "([^"]+)"/)?.[1];
    const key = source.match(/const SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/)?.[1];
    if (url !== HML_URL || !key?.startsWith('sb_publishable_')) throw Error('HML_CLIENT_NOT_CANONICAL');
    const ac = buildClient(url, key), bc = buildClient(url, key);
    a = await verifyActor(ac, credentials('a'));
    b = await verifyActor(bc, credentials('b'));
    Object.assign(aProof, a.proof); Object.assign(bProof, b.proof);
    if (classifyActor(aProof) && classifyActor(bProof)) {
      isolation.distinctUsers = a.user.id !== b.user.id;
      const [aLinks, bLinks] = await Promise.all([visibleActiveOrgs(ac), visibleActiveOrgs(bc)]);
      isolation.noExtraTenantLinks = aLinks?.length === 1 && bLinks?.length === 1;
      if (isolation.distinctUsers && isolation.noExtraTenantLinks) {
        const aOrg = aLinks[0], bOrg = bLinks[0];
        isolation.distinctOrgs = aOrg !== bOrg;
        if (isolation.distinctOrgs) {
          [isolation.aOwn, isolation.bOwn, isolation.aCannotReadB, isolation.bCannotReadA] =
            await Promise.all([visibleOrg(ac, aOrg), visibleOrg(bc, bOrg), deniedOtherOrg(ac, bOrg), deniedOtherOrg(bc, aOrg)]);
        }
      }
    }
  } catch {
    // Sanitized classification only. Never echo sensitive transport errors or credentials.
  } finally {
    // No browser persistence, no storageState and no token serialization. Revoke these temporary sessions.
    if (a?.client) await a.client.auth.signOut({ scope: 'local' }).catch(() => {});
    if (b?.client) await b.client.auth.signOut({ scope: 'local' }).catch(() => {});
  }
  const receipt = safeReceipt(aProof, bProof, isolation, provenance);
  writeSanitized(receipt);
  console.log(JSON.stringify({status:receipt.status, actor_A:aProof, actor_B:bProof, tenant_rls:isolation}));
  if (receipt.status !== 'AUTH_RLS_LIVE_PASS') process.exitCode = 1;
  return receipt;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();

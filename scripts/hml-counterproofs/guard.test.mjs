import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preflight, fixtureProofValid } from './guard.mjs';
const sha = 'a'.repeat(40);
const context = { sha, runId: '123', runAttempt: '1', repository: 'contaos999999/contaos-hml-control' };
const env = {
  CONTAOS_HML_FRONTEND_URL: 'https://contaos-41-hml.vercel.app',
  CONTAOS_HML_ALLOWED_HOST: 'contaos-41-hml.vercel.app',
  CONTAOS_HML_USER_A_EMAIL: 'actor-a@example.invalid',
  CONTAOS_HML_USER_A_PASSWORD: 'synthetic-fixture-one',
  CONTAOS_HML_USER_B_EMAIL: 'actor-b@example.invalid',
  CONTAOS_HML_USER_B_PASSWORD: 'synthetic-fixture-two',
  CONTAOS_HML_EXPECTED_FRONTEND_SHA: sha,
  CONTAOS_HML_EXPECTED_BACKEND_SHA: 'b'.repeat(40),
};
const actor = {login:true,emailMatch:true,confirmed:true,synthetic:true};
const tenant = {distinctUsers:true,distinctOrgs:true,aOwn:true,bOwn:true,aCannotReadB:true,bCannotReadA:true,noExtraTenantLinks:true};
const proof = {schema:'contaos.hml.real-fixtures.v1',status:'AUTH_RLS_LIVE_PASS',environment:'hml',evidence_class:'LIVE_AUTH_AND_RLS_NOT_MOCKED',repository:context.repository,frontend_sha:sha,run_id:'123',run_attempt:'1',actor_A:actor,actor_B:actor,tenant_rls:tenant,backend_parity:'NOT_ATTESTED'};
test('GREEN structural: complete Auth/RLS receipt allows only HML preflight',()=>{
 assert.equal(fixtureProofValid(proof,context),true);
 const r=preflight(env,context,proof);
 assert.equal(r.pass,true);
 assert.equal(r.release,'HML_AUTH_RLS_ONLY_NO_BACKEND_CERTIFICATION');
});
for(const [name,change,expected] of [
 ['missing secret',e=>delete e.CONTAOS_HML_USER_A_PASSWORD,'MISSING_CONTAOS_HML_USER_A_PASSWORD'],
 ['untrusted origin',e=>e.CONTAOS_HML_FRONTEND_URL='https://prod.example.com','UNTRUSTED_HML_HOST'],
 ['HEAD mismatch',e=>e.CONTAOS_HML_EXPECTED_FRONTEND_SHA='c'.repeat(40),'FRONTEND_SHA_MISMATCH'],
 ['identical actors',e=>e.CONTAOS_HML_USER_B_EMAIL=e.CONTAOS_HML_USER_A_EMAIL,'IDENTICAL_IDENTITIES'],
 ['invalid email',e=>e.CONTAOS_HML_USER_A_EMAIL='not-an-email','INVALID_IDENTITY_A'],
 ['missing backend SHA',e=>e.CONTAOS_HML_EXPECTED_BACKEND_SHA='','MISSING_CONTAOS_HML_EXPECTED_BACKEND_SHA'],
]) test('RED structural: '+name,()=>{
 const e={...env};change(e);const r=preflight(e,context,proof);
 assert.equal(r.pass,false);assert.ok(r.errors.includes(expected));
});
test('RED: missing attestation cannot be made PASS with old ISOLATED_FIXTURES flag',()=>{
 const e={...env,CONTAOS_HML_ISOLATED_FIXTURES:'true'};
 assert.equal(preflight(e,context,null).pass,false);
 assert.ok(preflight(e,context,null).errors.includes('LIVE_AUTH_RLS_ATTESTATION_MISSING_OR_FAILED'));
});
for(const [name,mutation] of [
 ['unconfirmed user',p=>p.actor_A={...actor,confirmed:false}],
 ['personal identity',p=>p.actor_B={...actor,synthetic:false}],
 ['cross tenant exposure',p=>p.tenant_rls={...tenant,bCannotReadA:false}],
 ['orgs identical',p=>p.tenant_rls={...tenant,distinctOrgs:false}],
 ['source spoofing',p=>p.frontend_sha='c'.repeat(40)],
 ['run replay',p=>p.run_id='other-run'],
 ['false status',p=>p.status='BLOCKED'],
]) test('RED: forged or incomplete fixture attestation: '+name,()=>{
 const p=structuredClone(proof);mutation(p);
 assert.equal(fixtureProofValid(p,context),false);
 assert.equal(preflight(env,context,p).pass,false);
});
test('RED: missing immutable GitHub provenance blocks',()=>{
 assert.ok(preflight(env,{},proof).errors.includes('MISSING_RUN_PROVENANCE'));
});

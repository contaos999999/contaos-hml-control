import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preflight } from './guard.mjs';
const sha='a'.repeat(40);
const env={CONTAOS_HML_FRONTEND_URL:'https://hml.example.test',CONTAOS_HML_ALLOWED_HOST:'hml.example.test',CONTAOS_HML_USER_A_EMAIL:'contaos-hml-a@example.test',CONTAOS_HML_USER_B_EMAIL:'contaos-hml-b@example.test',CONTAOS_HML_USER_A_PASSWORD:'synthetic-one',CONTAOS_HML_USER_B_PASSWORD:'synthetic-two',CONTAOS_HML_EXPECTED_FRONTEND_SHA:sha,CONTAOS_HML_EXPECTED_BACKEND_SHA:'b'.repeat(40),CONTAOS_HML_ISOLATED_FIXTURES:'true'};
const context={sha,runId:'123',runAttempt:'1',repository:'contaos999999/contaos-hml-control'};
test('GREEN: complete isolated HML fixture passes',()=>assert.equal(preflight(env,context).pass,true));
for(const [name,mutation,expected] of [
['missing secret',e=>delete e.CONTAOS_HML_USER_A_PASSWORD,'MISSING_CONTAOS_HML_USER_A_PASSWORD'],
['production-like host',e=>e.CONTAOS_HML_FRONTEND_URL='https://prod.example.test','UNTRUSTED_HML_HOST'],
['mismatched commit',e=>e.CONTAOS_HML_EXPECTED_FRONTEND_SHA='c'.repeat(40),'FRONTEND_SHA_MISMATCH'],
['identical users',e=>e.CONTAOS_HML_USER_B_EMAIL=e.CONTAOS_HML_USER_A_EMAIL,'IDENTICAL_IDENTITIES'],
['non synthetic identity',e=>e.CONTAOS_HML_USER_A_EMAIL='person@example.test','NON_SYNTHETIC_USER_A'],
['unattested isolation',e=>e.CONTAOS_HML_ISOLATED_FIXTURES='false','ISOLATION_NOT_ATTESTED']
]) test('RED counterproof: '+name,()=>{const e={...env};mutation(e);const r=preflight(e,context);assert.equal(r.pass,false);assert.ok(r.errors.includes(expected));});
test('RED: missing immutable run provenance blocks',()=>assert.ok(preflight(env,{}).errors.includes('MISSING_RUN_PROVENANCE')));

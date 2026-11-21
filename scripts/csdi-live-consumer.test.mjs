import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLiveCSDI } from './csdi-live-consumer.mjs';
test('fail closed when receipt absent',async()=>{const r=await validateLiveCSDI(null,{token:'x',repository:'owner/repo'});assert.equal(r.pass,false);assert.equal(r.verdict,'BLOCKED')});
test('fail closed when credentials absent',async()=>{const r=await validateLiveCSDI({}, {token:'',repository:'owner/repo'});assert.ok(r.issues.includes('MISSING_GITHUB_TOKEN'))});
test('fail closed when run absent',async()=>{const r=await validateLiveCSDI({}, {token:'x',repository:'owner/repo'});assert.ok(r.issues.includes('INVALID_RUN_ID'))});
test('never fetch remote when receipt is invalid',async()=>{let called=false;const r=await validateLiveCSDI({}, {token:'x',repository:'owner/repo',fetchImpl:async()=>{called=true;throw Error('should not fetch')}});assert.equal(called,false);assert.equal(r.pass,false)});

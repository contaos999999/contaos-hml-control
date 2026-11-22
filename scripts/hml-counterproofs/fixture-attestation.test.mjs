import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyActor, classifyIsolation, classifyOutcome, HML_URL } from './fixture-attestation.mjs';

const validActor = {login:true,emailMatch:true,confirmed:true,synthetic:true};
const validIsolation = {distinctUsers:true,distinctOrgs:true,aOwn:true,bOwn:true,aCannotReadB:true,bCannotReadA:true,noExtraTenantLinks:true};

test('GREEN unit: strict synthetic actor and bilateral isolation require all properties',()=>{
  assert.equal(classifyActor(validActor),true);
  assert.equal(classifyIsolation(validIsolation),true);
  assert.equal(classifyOutcome(validActor,validActor,validIsolation),'AUTH_RLS_LIVE_PASS');
  assert.equal(HML_URL,'https://gklhhhyosgasnyoxlrui.supabase.co');
});
for(const key of Object.keys(validActor)){
  test('RED unit: missing or false actor proof is rejected: '+key,()=>{
    assert.equal(classifyActor({...validActor,[key]:false}),false);
    assert.equal(classifyOutcome({...validActor,[key]:false},validActor,validIsolation),'BLOCKED');
    assert.equal(classifyActor({...validActor,[key]:'true'}),false);
  });
}
for(const key of Object.keys(validIsolation)){
  test('RED unit: incomplete RLS proof is rejected: '+key,()=>{
    assert.equal(classifyIsolation({...validIsolation,[key]:false}),false);
    assert.equal(classifyOutcome(validActor,validActor,{...validIsolation,[key]:false}),'BLOCKED');
    assert.equal(classifyIsolation({...validIsolation,[key]:'true'}),false);
  });
}
test('RED unit: undefined object and absence of evidence block',()=>{
 assert.equal(classifyActor(),false);assert.equal(classifyIsolation(),false);
 assert.equal(classifyOutcome({}, {}, {}),'BLOCKED');
});

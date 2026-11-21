import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import { validateLiveCSDI, validateWitnessContents } from './csdi-live-consumer.mjs';
test('fail closed when receipt absent',async()=>{const r=await validateLiveCSDI(null,{token:'x',repository:'owner/repo'});assert.equal(r.pass,false);assert.equal(r.verdict,'BLOCKED')});
test('fail closed when credentials absent',async()=>{const r=await validateLiveCSDI({}, {token:'',repository:'owner/repo'});assert.ok(r.issues.includes('MISSING_GITHUB_TOKEN'))});
test('fail closed when run absent',async()=>{const r=await validateLiveCSDI({}, {token:'x',repository:'owner/repo'});assert.ok(r.issues.includes('INVALID_RUN_ID'))});
test('never fetch remote when receipt is invalid',async()=>{let called=false;const r=await validateLiveCSDI({}, {token:'x',repository:'owner/repo',fetchImpl:async()=>{called=true;throw Error('should not fetch')}});assert.equal(called,false);assert.equal(r.pass,false)});

const axes=['literal','systematic','teleological','temporal','security','operational','adversarial'];
function witnessFixture(){
 const evidence=[];
 const add=(subject_id,axis)=>{const id=subject_id+':'+(axis||'item');const payload='fixture:'+id;const sha256=createHash('sha256').update(payload).digest('hex');evidence.push({id,subject_id,axis,payload,sha256});return {evidence_ref:id,evidence_sha256:sha256};};
 const entry=id=>({id,status:'PASS',...add(id,null),axes:Object.fromEntries(axes.map(axis=>[axis,{status:'PASS',...add(id,axis)}]))});
 return {w:{schema:'contaos.csdi.witnesses.v1',head:'b'.repeat(40),base:'c'.repeat(40),clauses:[entry('c1')],rules:[entry('r1')],pairs:[entry('p1')],evidence,axes:axes.map(name=>({name,status:'PASS',witness_ids:['c1']}))},receipt:{head:'b'.repeat(40),base:'c'.repeat(40),coverage:{clauses_total:1,rules_total:1,pairs_total:1}}};
}

test('witness coverage structure with seven axes and digest passes only structural check',()=>{const {w,receipt}=witnessFixture();assert.equal(validateWitnessContents(w,receipt),true)});
for(const axis of axes){
 test('witness counterproof '+axis+' clause digest absent',()=>{const {w,receipt}=witnessFixture();delete w.clauses[0].axes[axis].evidence_sha256;assert.equal(validateWitnessContents(w,receipt),false)});
 test('witness counterproof '+axis+' rule FAIL',()=>{const {w,receipt}=witnessFixture();w.rules[0].axes[axis].status='FAIL';assert.equal(validateWitnessContents(w,receipt),false)});
 test('witness counterproof '+axis+' pair absent',()=>{const {w,receipt}=witnessFixture();delete w.pairs[0].axes[axis];assert.equal(validateWitnessContents(w,receipt),false)});
}
test('witness duplicate clause id blocked',()=>{const {w,receipt}=witnessFixture();w.clauses.push({...w.clauses[0]});receipt.coverage.clauses_total=2;assert.equal(validateWitnessContents(w,receipt),false)});

test('witness forged payload digest blocked',()=>{const {w,receipt}=witnessFixture();w.evidence[0].payload='forged';assert.equal(validateWitnessContents(w,receipt),false)});
test('witness swapped subject blocked',()=>{const {w,receipt}=witnessFixture();w.evidence[0].subject_id='r1';assert.equal(validateWitnessContents(w,receipt),false)});
test('witness swapped axis blocked',()=>{const {w,receipt}=witnessFixture();w.evidence.find(e=>e.axis==='literal').axis='security';assert.equal(validateWitnessContents(w,receipt),false)});

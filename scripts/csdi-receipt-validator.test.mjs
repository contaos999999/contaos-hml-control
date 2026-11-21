import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCSDI } from './csdi-receipt-validator.mjs';
const sha40='a'.repeat(40), sha256='b'.repeat(64);
const axes=['literal','systematic','teleological','temporal','security','operational','adversarial'];
function fixture() {return {
 schema:'contaos.semantic-certification.v1',marker:'CONTAOS_SEMANTIC_CERTIFICATION_V1',
 head:sha40,base:sha40,plan_sha:sha40,manifest_sha:sha40,evidence_sha256:sha256,run_id:'run-123',
 coverage:{clauses_total:118,clauses_proven:118,rules_total:137,rules_proven:137,pairs_total:9316,pairs_adjudicated:9316},
 axes:axes.map(name=>({name,verdict:'PASS',witnesses:['test-run-123']})),
 ambiguities_unresolved:0,unproven_rules:0,unadjudicated_pairs:0,active_vetoes:0,
 positive_tests:[{status:'PASS',run_id:'p1'}],negative_tests:[{status:'PASS',run_id:'n1'}],
 second_read:{verdict:'PASS',reviewer:'reviewer2',evidence_ref:'review-1'},
 live_provenance_verified:true,drift_detected:false,verdict:'PASS'
};}
test('receipt completo estruturalmente passa, sem equivaler a autenticacao externa',()=>assert.equal(validateCSDI(fixture()).pass,true));
for(const [name,mutate,code] of [
 ['schema',r=>r.schema='other','INVALID_SCHEMA'],
 ['head stale',r=>r.head='stale','INVALID_HEAD'],
 ['clausulas descobertas',r=>r.coverage.clauses_proven=117,'INCOMPLETE_clauses_total'],
 ['regras sem prova',r=>r.coverage.rules_proven=136,'INCOMPLETE_rules_total'],
 ['pares sem adjudicacao',r=>r.coverage.pairs_adjudicated=9315,'INCOMPLETE_pairs_total'],
 ['eixo ausente',r=>r.axes.pop(),'INCOMPLETE_SEVEN_AXES'],
 ['ambiguidade',r=>r.ambiguities_unresolved=1,'NOT_ZERO_AMBIGUITIES_UNRESOLVED'],
 ['veto',r=>r.active_vetoes=1,'NOT_ZERO_ACTIVE_VETOES'],
 ['teste negativo',r=>r.negative_tests=[],'NEGATIVE_TESTS_MISSING'],
 ['segunda leitura',r=>r.second_read=null,'SECOND_READ_MISSING'],
 ['proveniencia',r=>r.live_provenance_verified=false,'LIVE_PROVENANCE_NOT_VERIFIED'],
 ['drift',r=>r.drift_detected=true,'DRIFT_UNRESOLVED'],
 ['veredito',r=>r.verdict='INCONCLUSIVE','RECEIPT_NOT_PASS']
])test('fail-closed: '+name,()=>{let r=fixture();mutate(r);let result=validateCSDI(r);assert.equal(result.pass,false);assert.ok(result.issues.includes(code));});
test('ausencia de auditor externo nao e requisito do gate CSDI',()=>{let r=fixture();r.independent_auditor_report=null;assert.equal(validateCSDI(r).pass,true)});

// Contraprovas independentes por eixo: um único eixo não comprovado bloqueia CSDI.
for (const axis of axes) {
  test('contraprova sete eixos: '+axis+' sem testemunho bloqueia PASS',()=>{
    const receipt=fixture();receipt.axes.find(x=>x.name===axis).witnesses=[];
    const verdict=validateCSDI(receipt);
    assert.equal(verdict.pass,false);
    assert.ok(verdict.issues.includes('INCOMPLETE_SEVEN_AXES'));
  });
  test('contraprova sete eixos: '+axis+' com falha bloqueia PASS',()=>{
    const receipt=fixture();receipt.axes.find(x=>x.name===axis).verdict='FAIL';
    const verdict=validateCSDI(receipt);
    assert.equal(verdict.pass,false);
    assert.ok(verdict.issues.includes('INCOMPLETE_SEVEN_AXES'));
  });
}

import {mkdirSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const output='artifacts/hml-counterproofs';mkdirSync(output,{recursive:true});
const tests=['HML-AUTH-001','HML-AUTH-002','HML-AUTH-003'];
const status=process.env.CONTAOS_HML_TEST_EXIT==='0'?'EXECUTED_TESTS_EXIT_ZERO':'BLOCKED_OR_FAILED';
const receipt={schema:'contaos.hml.counterproofs.v1',repository:process.env.GITHUB_REPOSITORY||null,frontend_sha:process.env.GITHUB_SHA||null,backend_sha:process.env.CONTAOS_HML_EXPECTED_BACKEND_SHA||null,run_id:process.env.GITHUB_RUN_ID||null,run_attempt:process.env.GITHUB_RUN_ATTEMPT||null,environment:'hml-counterproofs',test_ids:tests,status,semantic_completeness:'INCONCLUSIVE',rls_coverage:'NOT_CERTIFIED',scope:'three live Auth browser cases only; no RLS or complete normative interactions',generated_at:new Date().toISOString()};
const json=JSON.stringify(receipt,null,2)+'\n';writeFileSync(output+'/receipt.json',json);writeFileSync(output+'/SHA256SUMS',createHash('sha256').update(json).digest('hex')+'  receipt.json\n');console.log('Sanitized HML receipt generated; status='+status);if(status!=='EXECUTED_TESTS_EXIT_ZERO')process.exitCode=1;

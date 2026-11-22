#!/usr/bin/env node
// Executable normative counterproof, canonical 07_ZERO_DRIFT_GOVERNANCA_4_1.md §11.
// Usage: node scripts/csdi-zero-drift-counterproof.mjs <reconciliation.json>
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=JSON.parse(readFileSync(process.argv[2]||'csdi_prompt_literal_reconciliation.json','utf8'));
const title='ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE';
const hash=s=>createHash('sha256').update(s).digest('hex');
const gate=s=>s.split(title).length===2&&['impacto_visual:','PLAN:','BUILD:','TESTE C:'].every(x=>s.includes(x));
const wrap=s=>s+'\n\n'+title+'\nimpacto_visual: N/A (justificado) no backend; validar quatro larguras/temas no frontend.\nPLAN: baseline e riscos.\nBUILD: menor delta autorizado.\nTESTE C: regressão, acessibilidade, isolamento e evidências.\n';
const rows=[];
for(const kind of ['regular','atomic'])for(const [id,v] of Object.entries(source[kind])){
 const original=v.text,operational=wrap(original);
 rows.push({kind,id,source_sha256:hash(original),original_gate:gate(original),negative_rejected:!gate(original),wrapped_gate:gate(operational),preserves_original:operational.startsWith(original),operational_sha256:hash(operational)});
}
if(rows.length!==197||rows.some(x=>!x.negative_rejected||!x.wrapped_gate||!x.preserves_original))throw Error('CSDI_ZERO_DRIFT_COUNTERPROOF_FAILED');
const report={schema:'csdi.executed-normative-counterproof.v1',canonical:'07_ZERO_DRIFT_GOVERNANCA_4_1.md §11',canonical_commit:'ffb9fa0558f87925ed5b9bf945a96741c1fa5ae6',clause:title,original_compliant:rows.filter(x=>x.original_gate).length,negative_rejections:rows.filter(x=>x.negative_rejected).length,positive_acceptances:rows.filter(x=>x.wrapped_gate).length,rows,semantic_completeness:'INCONCLUSIVE',limitations:['One normative clause only','Operational envelope not integrated into actual prompt executor','Other clause interactions and seven axes remain unadjudicated']};
writeFileSync('csdi-zero-drift-counterproof-result.json',JSON.stringify(report,null,2)+'\n');
console.log('COUNTERPROOF_PASS negative='+report.negative_rejections+' positive='+report.positive_acceptances+' SEMANTIC_COMPLETENESS=INCONCLUSIVE');

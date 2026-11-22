#!/usr/bin/env node
// Canonical CSDI inventory producer: extraction is NOT semantic certification.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const snap=JSON.parse(readFileSync('docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json','utf8'));
const repo=snap.source_repo,commit=snap.source_commit;
if(!/^[a-f0-9]{40}$/.test(commit)||snap.context_documents.length!==25||snap.prompt_catalog.regular_ids.length!==100||snap.prompt_catalog.atomic_ids.length!==97)throw Error('INVALID_CANONICAL_SNAPSHOT');
const token=process.env.CONTAOS_CANONICAL_READ_TOKEN||process.env.GITHUB_TOKEN;
if(!token)throw Error('CANONICAL_READ_TOKEN_REQUIRED');
async function fetchBlob(path,expected){
 const u='https://api.github.com/repos/'+repo+'/contents/'+path+'?ref='+commit;
 const r=await fetch(u,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'},redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('CANONICAL_FETCH_FAILED '+path+' '+r.status);
 const j=await r.json();
 if(j.type!=='file'||j.path!==path||j.sha!==expected||j.encoding!=='base64')throw Error('CANONICAL_BLOB_MISMATCH '+path);
 const bytes=Buffer.from(j.content.replace(/\\s/g,''),'base64');
 // Git blob OID independently verifies GitHub metadata and content bytes.
 const blob=createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\\0'),bytes])).digest('hex');
 if(blob!==expected)throw Error('CANONICAL_BLOB_BYTES_MISMATCH '+path);
 return bytes;
}
function extract(path,body){
 const rows=body.split(/\\r?\\n/),items=[],ambiguities=[],links=[];
 const heading=/^\\s{0,3}(#{1,6})\\s+(.+)$/;
 const norm=/\\b(deve|deverá|obrigatóri[oa]|proibid[oa]|vedad[oa]|somente|exceto|salvo|não pode|não deve|necessári[oa]|exige|requer|sempre|nunca|critério|condição|autorização|aprovação|bloquead[oa]|pendente|gate|lock|rls|segurança)\\b/i;
 const ref=/\\b(?:PRD|RNF|RLS|N17|P0|V1|LOCK|ZERO.DRIFT|GATE|PROMPT)[- _#:]?[A-Z0-9.-]*\\b/gi;
 let section='ROOT';
 for(let i=0;i<rows.length;i++){
  const line=rows[i].trim();if(!line)continue;
  const h=line.match(heading);if(h){section=h[2];items.push({id:hash(path+':heading:'+(i+1)+':'+line).slice(0,24),kind:'heading',path,line:i+1,section,text:line});continue;}
  const isList=/^(?:[-*+] |\\d+[.)] |[a-z][.)] )/i.test(line);
  if(norm.test(line)||isList){
   const id=hash(path+':norm:'+(i+1)+':'+line).slice(0,24);
   items.push({id,kind:'candidate_rule',path,line:i+1,section,text:line,sha256:hash(line)});
   if(/\\b(exceto|salvo|a menos que|desde que|somente se)\\b/i.test(line))items.push({id:id+':exception',kind:'candidate_exception',path,line:i+1,section,text:line,sha256:hash(line)});
   const mentions=[...new Set(line.match(ref)||[])];if(mentions.length>1)links.push({id,mentions,source_ref:path+':'+(i+1)});
   if(/\\b(pendente|a definir|em revisão|ambígu|conflit|não vigente)\\b/i.test(line))ambiguities.push({id,source_ref:path+':'+(i+1),text:line,disposition:'REQUIRES_ADJUDICATION'});
  }
 }
 return {items,ambiguities,links};
}
const sources=[],inventory=[],ambiguities=[],interaction_candidates=[];
for(const d of [...snap.context_documents,{path:snap.prompt_catalog.source_path,blob_sha:snap.prompt_catalog.source_blob_sha}]){
 const bytes=await fetchBlob(d.path,d.blob_sha);
 const raw=bytes.toString('utf8');
 const result=extract(d.path,raw);
 sources.push({path:d.path,git_blob_sha:d.blob_sha,sha256:hash(bytes),bytes:bytes.length,extracted_items:result.items.length});
 inventory.push(...result.items);ambiguities.push(...result.ambiguities);interaction_candidates.push(...result.links);
}
const report={schema:'contaos.csdi.normative-extraction.v1',repository:repo,commit,source_count:sources.length,sources,inventory,ambiguities,interaction_candidates,limitations:['Lexical extraction only; not adjudicated semantic completeness','References and implied cross-document pairs require independent exhaustive review','Seven-axis LIVE assertions are not produced by this extractor'],semantic_completeness:'INCONCLUSIVE',activation:'NO_GO'};
if(sources.length!==26||sources.some(x=>x.extracted_items===0)||new Set(inventory.map(x=>x.id)).size!==inventory.length)throw Error('INVENTORY_INTEGRITY_FAILURE');
const out=process.argv[2]||'csdi-normative-extraction.json';writeFileSync(out,JSON.stringify(report,null,2)+'\\n');
console.log(JSON.stringify({output:out,commit,source_count:sources.length,items:inventory.length,ambiguities:ambiguities.length,interaction_candidates:interaction_candidates.length,semantic_completeness:'INCONCLUSIVE'}));

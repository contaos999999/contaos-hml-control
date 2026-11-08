/**
 * RECONSTRUCTED tests, not the lost original file and not yet executed in Node.
 * Historical 26/26 does not attest this reconstruction; run fresh CI before use.
 * Fixtures are in-memory HTTP metadata only; no Auth, credentials, HML or writes.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import {readFile} from "node:fs/promises";
import {Buffer} from "node:buffer";
import {createOfficialObserver,FIXTURE} from "./observer-recovery.mjs";
const api=FIXTURE.api,org=FIXTURE.organization,contract=FIXTURE.contract,source=FIXTURE.source;
const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",version="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
async function constant(file,name){
 const s=await readFile(new URL("../../"+file,import.meta.url),"utf8");
 const m=s.match(new RegExp("(?:export )?const "+name+'\\s*=\\s*"([^"]+)"'));
 assert.ok(m,"SDK source constant missing: "+name);return m[1];
}
const compSelect=await constant("src/lib/contratos/competenciasDados.ts","COLUNAS_COMPETENCIA");
const versionSelect=await constant("src/lib/contratos/baseNormativaDados.ts","COLUNAS_VERSAO");
const opinionSelect=await constant("src/lib/competencias/parecerInternoDados.ts","COLUNAS_PARECERES");
const reviewSource=await readFile(new URL("../../src/lib/competencias/revisaoRequisitoDados.ts",import.meta.url),"utf8");
const joinSelect=reviewSource.match(/\.select\(\s*"(id,numero_versao,[^"]+)"/)[1];
const compQ=()=>({select:compSelect,id_contrato:"eq."+contract,competencia_referencia:"eq.2026-10-01",order:"competencia_referencia.desc,id.desc",offset:"0",limit:"25"});
const versionQ=()=>({select:versionSelect,id_fonte:"eq."+source,order:"versao.desc,id.asc",offset:"0",limit:"25"});
const textQ=()=>({select:"conteudo_texto,metadados",id:"eq."+version});
const joinQ=()=>({select:joinSelect,id_organizacao:"eq."+org,id_contrato:"eq."+contract,"documentos_competencia.id_competencia":"eq."+id,"documentos_competencia.situacao":"eq.ativo","arquivos.status_seguranca":"eq.aprovado",order:"criado_em.desc,id.desc",offset:"0",limit:"25"});
const compRow=()=>({id,competencia_referencia:"2026-10-01",periodo_inicio:"2026-10-01",periodo_fim:"2026-10-31",data_limite:null,situacao:"rascunho",percentual_conformidade:0,versao_pacote_atual:0,atualizado_em:"2026-11-08T00:00:00Z"});
const versionRow=()=>({id:version,id_fonte:source,versao:1,inicio_vigencia:"2026-01-01",fim_vigencia:null,id_arquivo:null,hash:"a".repeat(64),aprovado_por:null,aprovado_em:"2026-11-08T00:00:00Z",criado_em:"2026-11-08T00:00:00Z"});
const joinRow=()=>({id:version,numero_versao:1,id_organizacao:org,id_contrato:contract,documentos_competencia:{id_competencia:id,titulo:"Documento TXT sintético Trilha A.",situacao:"ativo"},arquivos:{nome_original:"FONTE_SINTETICA_AUDITORIA_HML.txt",status_seguranca:"aprovado"}});
function fixture(){
 const page=new EventEmitter(),o=createOfficialObserver(page);
 return{page,o,emit(table,query,value,options={}){
  const method=options.method||"GET",request={method:()=>method,postData:()=>method==="POST"?JSON.stringify(options.args||{}):null,url:()=>options.rawUrl||api+"/rest/v1/"+table+"?"+new URLSearchParams(query)};
  page.emit("request",request);
  page.emit("response",{request:()=>request,url:request.url,status:()=>options.status||200,body:options.body||async function(){return Buffer.from(JSON.stringify(value));}});
 },close(){o.close();}};
}
async function noAdmission(mutator){
 const f=fixture();try{const q=compQ(),raw=mutator(q);f.emit("competencias",{},[compRow()],{rawUrl:api+"/rest/v1/competencias?"+raw});await f.o.flush();assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract},0),false);await assert.rejects(()=>f.o.read("competencias",{}),/OBSERVATION/);}finally{f.close();}
}
test("FK omitted is proved by real query without inventing row fields",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("competencias",compQ(),[compRow()]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"},before),true);const[r]=await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"});assert.equal(r.id,id);assert.equal(Object.hasOwn(r,"id_contrato"),false);assert.equal(Object.hasOwn(r,"id_organizacao"),false);}finally{f.close();}
});
test("closed bare and prefixed RPC aliases share evidence",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("rpc/obter_visao_geral_competencia",{}, {competencia:{id}}, {method:"POST",args:{p_id_competencia:id},rawUrl:api+"/rest/v1/rpc/obter_visao_geral_competencia"});assert.equal(await f.o.observedAfter("obter_visao_geral_competencia",{p_id_competencia:id},before),true);assert.equal(await f.o.observedAfter("rpc:obter_visao_geral_competencia",{p_id_competencia:id},before),true);assert.equal(await f.o.observedAfter("obter_unknown",{},before),false);}finally{f.close();}
});
test("empty initial October GET proves absence through its query",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("competencias",compQ(),[]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"},before),true);assert.deepEqual(await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"}),[]);}finally{f.close();}
});
test("current empty GET removes old presence from the same query",async()=>{
 const f=fixture();try{f.emit("competencias",compQ(),[compRow()]);assert.equal((await f.o.read("competencias",{id_contrato:contract})).length,1);const before=f.o.generation();f.emit("competencias",compQ(),[]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"},before),true);assert.deepEqual(await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"}),[]);}finally{f.close();}
});
test("real review join retains approved nested fields and dotted identity",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("versoes_documento",joinQ(),[joinRow()]);const where={"documentos_competencia.id_competencia":id,id:version};assert.equal(await f.o.observedAfter("versoes_documento",where,before),true);const[r]=await f.o.read("versoes_documento",where);assert.equal(r.arquivos.status_seguranca,"aprovado");assert.equal(r.documentos_competencia.id_competencia,id);}finally{f.close();}
});
test("partial text projection inherits neither approval nor invented id",async()=>{
 const f=fixture();try{f.emit("versoes_fontes_normativas",versionQ(),[versionRow()]);assert.ok((await f.o.read("versoes_fontes_normativas",{id:version}))[0].aprovado_em);const before=f.o.generation();f.emit("versoes_fontes_normativas",textQ(),{conteudo_texto:"synthetic",metadados:{}});const[r]=await f.o.read("versoes_fontes_normativas",{id:version});assert.equal(r.aprovado_em,undefined);assert.equal(Object.hasOwn(r,"id"),false);assert.equal(await f.o.observedAfter("versoes_fontes_normativas",{id:version,aprovado_em:versionRow().aprovado_em},before),false);}finally{f.close();}
});
test("duplicate query key is not admitted",()=>noAdmission(q=>new URLSearchParams([...Object.entries(q),["id_contrato","eq."+contract]]).toString()));
test("extra query key is not admitted",()=>noAdmission(q=>new URLSearchParams({...q,unknown:"eq.extra"}).toString()));
test("foreign contract query is not admitted",()=>noAdmission(q=>new URLSearchParams({...q,id_contrato:"eq."+version}).toString()));
test("projection drift is not admitted",()=>noAdmission(q=>new URLSearchParams({...q,select:q.select+",unknown_note"}).toString()));
test("admitted join with contradictory response closes",async()=>{
 const f=fixture();try{const r=joinRow();r.documentos_competencia.id_competencia=version;f.emit("versoes_documento",joinQ(),[r]);await assert.rejects(()=>f.o.flush(),/OBSERVATION/);}finally{f.close();}
});
test("denied response to admitted contract does not reuse old success",async()=>{
 const f=fixture();try{f.emit("competencias",compQ(),[compRow()]);await f.o.flush();f.emit("competencias",compQ(),null,{status:403});await assert.rejects(()=>f.o.flush(),/OBSERVATION/);}finally{f.close();}
});
test("empty broader query cannot prove unrequested month filter",async()=>{
 const f=fixture();try{const q=compQ();delete q.competencia_referencia;const before=f.o.generation();f.emit("competencias",q,[]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"},before),false);}finally{f.close();}
});
test("empty first opinion response proves scoped initial absence",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("pareceres_internos",{select:opinionSelect,id_competencia:"eq."+id,id_organizacao:"eq."+org,id_contrato:"eq."+contract,order:"versao.desc,id.desc",offset:"0",limit:"25"},[]);assert.equal(await f.o.observedAfter("pareceres_internos",{id_competencia:id},before),true);assert.deepEqual(await f.o.read("pareceres_internos",{id_competencia:id}),[]);}finally{f.close();}
});
test("duplicate response IDs cannot become one trusted row",async()=>{
 const f=fixture();try{f.emit("competencias",compQ(),[compRow(),compRow()]);await assert.rejects(()=>f.o.flush(),/OBSERVATION/);}finally{f.close();}
});
test("late older response cannot overwrite newer request evidence",async()=>{
 const f=fixture();let release;try{const old=new Promise(r=>release=r);f.emit("competencias",compQ(),[],{body:async()=>{await old;return Buffer.from(JSON.stringify([compRow()]));}});f.emit("competencias",compQ(),[]);release();await f.o.flush();assert.deepEqual(await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"}),[]);}finally{f.close();}
});
test("close clears pending response and listeners",async()=>{
 const f=fixture();let release;const gate=new Promise(r=>release=r);f.emit("competencias",compQ(),[],{body:async()=>{await gate;return Buffer.from(JSON.stringify([compRow()]));}});f.close();release();await assert.rejects(()=>f.o.flush(),/OBSERVATION/);await assert.rejects(()=>f.o.read("competencias",{}),/OBSERVATION/);assert.equal(f.page.listenerCount("request"),0);assert.equal(f.page.listenerCount("response"),0);
});
test("retained technical ledger is bounded in bytes",async()=>{
 const f=fixture();try{for(let i=1;i<=129;i++){const key="dddddddd-dddd-4ddd-8ddd-"+String(i).padStart(12,"0");f.emit("versoes_fontes_normativas",{select:"conteudo_texto,metadados",id:"eq."+key},{conteudo_texto:"A".repeat(65536),metadados:{}});}await assert.rejects(()=>f.o.flush(),/OBSERVATION/);}finally{f.close();}
});
test("explicit metadata projection does not inherit text freshness",async()=>{
 const f=fixture();try{f.emit("versoes_fontes_normativas",versionQ(),[versionRow()]);await f.o.flush();const after=f.o.generation();f.emit("versoes_fontes_normativas",textQ(),{conteudo_texto:"synthetic",metadados:{}});assert.deepEqual(await f.o.read("versoes_fontes_normativas",{id:version,aprovado_em:versionRow().aprovado_em}),[]);const[r]=await f.o.read("versoes_fontes_normativas",{id:version},{select:versionSelect});assert.equal(r.id,version);assert.equal(r.aprovado_em,versionRow().aprovado_em);assert.equal(await f.o.observedAfter("versoes_fontes_normativas",{id:version},after,{select:versionSelect}),false);}finally{f.close();}
});
test("observedAfter deduplicates identity before filtering state",async()=>{
 const f=fixture();try{const after=f.o.generation();f.emit("competencias",compQ(),[compRow()]);await f.o.flush();const q=compQ();delete q.competencia_referencia;f.emit("competencias",q,[{...compRow(),situacao:"cancelada"}]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,situacao:"rascunho"},after),false);}finally{f.close();}
});
test("newer row prevents resurrection by old state filter",async()=>{
 const f=fixture();try{f.emit("competencias",compQ(),[compRow()]);await f.o.flush();const q=compQ();delete q.competencia_referencia;f.emit("competencias",q,[{...compRow(),situacao:"cancelada"}]);await f.o.flush();assert.deepEqual(await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01",situacao:"rascunho"}),[]);}finally{f.close();}
});
test("omitted old approval cannot bypass newer partial projection",async()=>{
 const f=fixture();try{f.emit("versoes_fontes_normativas",versionQ(),[versionRow()]);await f.o.flush();f.emit("versoes_fontes_normativas",textQ(),{conteudo_texto:"synthetic",metadados:{}});await f.o.flush();assert.deepEqual(await f.o.read("versoes_fontes_normativas",{id:version,aprovado_em:versionRow().aprovado_em}),[]);}finally{f.close();}
});
test("order belonging to another SDK endpoint proves nothing",async()=>{
 const f=fixture();try{const select=await constant("src/lib/contratos/baseNormativaDados.ts","COLUNAS_FONTE");f.emit("fontes_normativas",{select,id_organizacao:"eq."+org,id_contrato:"eq."+contract,order:"criado_em.desc,id.desc",offset:"0",limit:"25"},[]);await f.o.flush();assert.equal(await f.o.observedAfter("fontes_normativas",{id_contrato:contract},0),false);await assert.rejects(()=>f.o.read("fontes_normativas",{}),/OBSERVATION/);}finally{f.close();}
});
test("actual RBAC context lookup retains only projected contract",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("competencias",{select:"id_contrato",id:"eq."+id,id_organizacao:"eq."+org},{id_contrato:contract});assert.equal(await f.o.observedAfter("competencias",{id},before),true);const[r]=await f.o.read("competencias",{id});assert.equal(r.id_contrato,contract);assert.equal(Object.hasOwn(r,"id"),false);assert.equal(Object.hasOwn(r,"id_organizacao"),false);}finally{f.close();}
});
test("actual NovaCompetencia ID-only reconciliation uses exact query",async()=>{
 const f=fixture();try{const before=f.o.generation();f.emit("competencias",{select:"id",id_contrato:"eq."+contract,competencia_referencia:"eq.2026-10-01"},[{id}]);assert.equal(await f.o.observedAfter("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"},before),true);const[r]=await f.o.read("competencias",{id_contrato:contract,competencia_referencia:"2026-10-01"});assert.deepEqual(r,{id});}finally{f.close();}
});
test("global null-contract AppShell permissions are ignored without poisoning",async()=>{
 const f=fixture();try{const args={p_id_organizacao:org,p_id_contrato:null};const before=f.o.generation();f.emit("rpc/consultar_permissoes_efetivas",{}, {schema_versao:"rbac-v1",versao:1,master:true,permissoes:[]},{method:"POST",args,rawUrl:api+"/rest/v1/rpc/consultar_permissoes_efetivas"});await f.o.flush();assert.equal(await f.o.rpcRead("consultar_permissoes_efetivas",args),null);assert.equal(await f.o.rpcRead("consultar_permissoes_efetivas",{...args,p_id_contrato:contract}),null);assert.equal(await f.o.observedAfter("consultar_permissoes_efetivas",args,before),false);}finally{f.close();}
});

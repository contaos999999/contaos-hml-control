/**
 * F4.1 material consumer refresh in distinct synthetic scopes.
 * Real frontend queries; only the persistence/transport boundary is local.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({from:vi.fn(),rpc:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{from:m.from,rpc:m.rpc}}));
import { definirPreferenciaOrganizacao, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { listarFontes } from "@/lib/contratos/baseNormativaDados";
import { listarPropostas } from "@/lib/contratos/orcamentoDados";
import { listarListas } from "@/lib/contratos/regrasDados";
import { listarDocumentos, obterResumos, FILTROS_VAZIOS } from "@/lib/contratos/documentosDados";
import { listarCompetencias, FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";

const uuid=(scope:string,slot:number)=>scope+"0000000-0000-4000-8000-"+String(slot).padStart(12,"0");
const make=(scope:string,versao:number)=>({org:uuid(scope,1),contract:uuid(scope,2),comp:uuid(scope,3),row:uuid(scope,4),doc:uuid(scope,5),version:uuid(scope,6),file:uuid(scope,7),pkg:uuid(scope,8),versao,tag:scope.toUpperCase()});
const A=make("a",1),B=make("b",2);
type Scope=typeof A;
let authorized=A;
const user="f4-reader";
const signal=()=>new AbortController().signal;
const observations:Record<string,unknown>[]=[];
type Call={table:string,filters:Array<[string,unknown]>,ors:string[],ins:Array<[string,unknown]>,single:boolean};
const calls:Call[]=[];
const ok=(data:unknown,count=1)=>({data:structuredClone(data),error:null,status:200,count});
const deny=()=>({data:null,error:{code:"42501"},status:403,count:0});
function response(q:Call){
  const s=authorized;
  const eq=(k:string,v:string)=>q.filters.some(([key,value])=>key===k&&value===v);
  const hasIn=(k:string,v:string)=>q.ins.some(([key,values])=>key===k&&Array.isArray(values)&&values.length===1&&values[0]===v);
  const common={id_organizacao:s.org,id_contrato:s.contract};
  const contract={id:s.contract,id_organizacao:s.org,numero:s.tag+"-CONTRATO",objeto:s.tag+"-OBJETO",situacao:"ativo"};
  switch(q.table){
    case "contratos":
      if(q.single)return eq("id",s.contract)?ok(contract):deny();
      return eq("id_organizacao",s.org)?ok([contract]):deny();
    case "fontes_normativas":
      return eq("id_organizacao",s.org)&&eq("id_contrato",s.contract)?ok([{...common,id:s.row,titulo:s.tag+"-FONTE",situacao:"ativa"}]):deny();
    case "propostas_orcamentarias":
      return eq("id_contrato",s.contract)?ok([{...common,id:s.row,titulo:s.tag+"-PROPOSTA",situacao:"rascunho"}]):deny();
    case "listas_verificacao":
      return eq("id_contrato",s.contract)?ok([{...common,id:s.row,nome:s.tag+"-LISTA",situacao:"ativa",versao_atual:s.versao}]):deny();
    case "documentos_contrato":
      return eq("id_contrato",s.contract)?ok([{...common,id:s.doc,titulo:s.tag+"-DOCUMENTO",tipo:"contrato",versao_atual:s.versao}]):deny();
    case "versoes_documento":
      return q.ors.includes("and(id_documento_contrato.eq."+s.doc+",numero_versao.eq."+s.versao+")")?ok([{id:s.version,id_documento_contrato:s.doc,numero_versao:s.versao,id_arquivo:s.file}]):deny();
    case "arquivos":
      return hasIn("id",s.file)?ok([{id:s.file,status_seguranca:"aprovado"}]):deny();
    case "processamentos_documento":case "sugestoes_extracao_documento":
      return hasIn("id_versao_documento",s.version)?ok([],0):deny();
    case "competencias":
      return eq("id_contrato",s.contract)?ok([{...common,id:s.comp,competencia_referencia:s.versao===1?"2026-01-01":"2026-02-01",situacao:"rascunho"}]):deny();
    case "pareceres_internos":
      return eq("id_competencia",s.comp)&&eq("id_organizacao",s.org)&&eq("id_contrato",s.contract)?ok([{...common,id:s.row,id_competencia:s.comp,autor:null,texto:s.tag+"-PARECER",status:"aprovado",versao:s.versao,hash:s.tag.toLowerCase().repeat(64),criado_em:"2026-01-01T12:00:00Z",aprovado_por:null,aprovado_em:"2026-01-01T12:00:00Z"}]):deny();
    case "apresentacoes_contratante":
      return eq("id_competencia",s.comp)&&eq("id_organizacao",s.org)&&eq("id_contrato",s.contract)?ok([{...common,id:s.row,id_competencia:s.comp,id_pacote:s.pkg,protocolo:s.tag+"-PROTOCOLO",forma_apresentacao:"eletronica",apresentado_em:"2026-01-01T12:00:00Z",tipo:"original",numero_rodada:s.versao}]):deny();
    case "relatorios_historicos_contratante":
      return eq("id_contrato",s.contract)&&eq("id_organizacao",s.org)?ok([{...common,id:s.row,id_arquivo:s.file,numero_documento:s.tag+"-REL",tipo:"relatorio",competencia_referencia:"2026-01-01",data_documento:null,status_processamento:"concluido",resultado_geral:null,origem_temporal:"historico",criado_em:"2026-01-01T12:00:00Z"}]):deny();
    default:throw Error("unexpected table "+q.table);
  }
}
beforeEach(()=>{
  authorized=A;sessionStorage.clear();calls.length=0;m.from.mockReset();m.rpc.mockReset();
  m.rpc.mockImplementation(()=>{throw Error("unexpected rpc");});
  m.from.mockImplementation((table:string)=>{
    const call:Call={table,filters:[],ors:[],ins:[],single:false};calls.push(call);
    const q:Record<string,unknown>={};
    for(const method of ["select","order","range","abortSignal"])q[method]=()=>q;
    q["eq"]=(k:string,v:unknown)=>{call.filters.push([k,v]);return q;};
    q["or"]=(v:string)=>{call.ors.push(v);return q;};
    q["in"]=(k:string,v:unknown)=>{call.ins.push([k,v]);return q;};
    q["maybeSingle"]=q["single"]=()=>{call.single=true;return Promise.resolve().then(()=>response(call));};
    q["then"]=(resolve:(v:unknown)=>unknown,reject:(e:unknown)=>unknown)=>Promise.resolve().then(()=>response(call)).then(resolve,reject);
    return q;
  });
});
async function selectScope(s:Scope){
  definirPreferenciaOrganizacao(user,s.org);
  const org=obterPreferenciaOrganizacao(user);expect(org).toBe(s.org);
  if(!org)throw Error("missing preference");
  const contracts=await listarContratos({idOrganizacao:org,pagina:1});
  expect(contracts.total).toBe(1);
  expect(contracts.itens[0]).toMatchObject({id:s.contract,id_organizacao:s.org,numero:s.tag+"-CONTRATO"});
  expect(calls.at(-1)?.filters).toEqual([["id_organizacao",s.org]]);
  const comps=await listarCompetencias(contracts.itens[0]!.id,FILTROS_COMPETENCIA_VAZIOS,0);
  expect(comps.itens[0]).toMatchObject({id:s.comp,id_contrato:s.contract});
  expect(calls.at(-1)?.filters).toEqual([["id_contrato",s.contract]]);
  return {org,id:contracts.itens[0]!.id,comp:comps.itens[0]!.id};
}
type Context=Awaited<ReturnType<typeof selectScope>>;
const cases=[
  {id:"0050",table:"contratos"},
  {id:"0051",table:"fontes_normativas"},
  {id:"0052",table:"propostas_orcamentarias"},
  {id:"0053",table:"listas_verificacao"},
  {id:"0054",table:"documentos_contrato"},
  {id:"0055",table:"documentos_contrato"},
  {id:"0056",table:"competencias"},
  {id:"0062",table:"pareceres_internos"},
  {id:"0064",table:"apresentacoes_contratante"},
  {id:"0065",table:"relatorios_historicos_contratante"},
] as const;
type Case=(typeof cases)[number];
async function consume(c:Case,x:Context,s:Scope){
  const row=(r:{itens:Array<{id:string}>,total:number},id:string)=>{expect(r.total).toBe(1);expect(r.itens).toHaveLength(1);expect(r.itens[0]?.id).toBe(id);return r.itens[0]!;};
  switch(c.id){
    case "0050":{const r=await obterContrato(x.id,signal());expect(r).toMatchObject({id:s.contract,id_organizacao:s.org,numero:s.tag+"-CONTRATO"});return r;}
    case "0051":return row(await listarFontes({org:x.org,contrato:x.id,escopo:"contrato",situacao:"",pagina:0}),s.row);
    case "0052":return row(await listarPropostas(x.id,0),s.row);
    case "0053":{const r=row(await listarListas(x.id,0),s.row);expect(r).toMatchObject({versao_atual:s.versao});return r;}
    case "0054":case "0055":{
      const r=await listarDocumentos(x.id,FILTROS_VAZIOS,0);
      const doc=row(r,s.doc);expect(doc).toMatchObject({id_contrato:s.contract,versao_atual:s.versao});
      if(c.id==="0054")return doc;
      const res=await obterResumos(r.itens);
      expect(Object.keys(res)).toEqual([s.doc]);
      expect(res[s.doc]?.versao).toMatchObject({id:s.version,numero_versao:s.versao,id_arquivo:s.file});
      expect(res[s.doc]?.arquivo).toMatchObject({id:s.file,status_seguranca:"aprovado"});
      return {doc,summary:res[s.doc]};
    }
    case "0056":return row(await listarCompetencias(x.id,FILTROS_COMPETENCIA_VAZIOS,0),s.comp);
    case "0062":{const r=row(await listarPareceres(x.comp,x.org,x.id,0,signal()),s.row);expect(r).toMatchObject({id_organizacao:s.org,id_contrato:s.contract,id_competencia:s.comp,versao:s.versao});return r;}
    case "0064":{const r=row(await listarApresentacoes(x.comp,x.org,x.id,0,signal()),s.row);expect(r).toMatchObject({id_organizacao:s.org,id_contrato:s.contract,id_competencia:s.comp,protocolo:s.tag+"-PROTOCOLO"});return r;}
    case "0065":return row(await listarRelatoriosHistoricos(x.id,x.org,0,signal()),s.row);
  }
}
describe("F4.1 real consumer reload after change of organization",()=>{
  for(const c of cases){
    const id="IFV1-F4-C"+c.id;
    it(id+" positive: distinct identities and material fields after real preference change",async()=>{
      authorized=A;const before=await selectScope(A);const old=await consume(c,before,A);
      authorized=B;const after=await selectScope(B);const current=await consume(c,after,B);
      expect(after.org).not.toBe(before.org);expect(after.id).not.toBe(before.id);expect(after.comp).not.toBe(before.comp);
      expect(current).not.toEqual(old);expect(JSON.stringify(current)).not.toContain(A.contract);
      expect(obterPreferenciaOrganizacao(user)).toBe(B.org);
      observations.push({caseId:id,kind:"positive",mode:"CODE_FIXTURE",readback:{before,after,old,current}});
    });
    it(id+" negative: old consumer access denied and current readback preserved",async()=>{
      authorized=A;const before=await selectScope(A);const old=await consume(c,before,A);
      authorized=B;const after=await selectScope(B);const current=await consume(c,after,B);
      const first=calls.length;
      await expect(consume(c,before,A)).rejects.toBeTruthy();
      expect(calls.length).toBeGreaterThan(first);
      expect(calls.slice(first).some(q=>q.table===c.table)).toBe(true);
      expect(await consume(c,after,B)).toEqual(current);
      expect(current).not.toEqual(old);expect(obterPreferenciaOrganizacao(user)).toBe(B.org);
      observations.push({caseId:id,kind:"negative",mode:"CODE_FIXTURE",readback:{before,after,staleDenied:true,current}});
    });
  }
});
afterAll(()=>{const p=process.env["F4_CODE_SYS04_DATA_OBSERVATIONS"];if(p){expect(observations).toHaveLength(20);writeFileSync(p,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}});

/** V102/V103 mutations and real consumers, with stateful local boundary. */
import { beforeEach,afterAll,describe,expect,it,vi } from "vitest";
import { writeFileSync } from "node:fs";
const m=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:m.rpc,from:m.from}}));
import { inserirContratante,montarPayload,validarFormulario } from "@/lib/contratantes/novoContratanteDados";
import { atualizarContratante,buscarContratante,consultarCapacidadeEdicaoContratante,formularioDe,montarArgsAtualizacao } from "@/lib/contratantes/editarContratanteDados";
import { listarContratantes,verificarAcessoOrganizacao } from "@/lib/contratantes/contratantesDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { buscarOpcoesContratantes } from "@/lib/contratos/novoContratoDados";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { consultarPermissoesEfetivas,temPermissao } from "@/lib/administracao/rbacRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";

const ORG="c0500000-0000-4000-8000-000000000001";
const ID="c0500000-0000-4000-8000-000000000002";
const CONTRACT="c0500000-0000-4000-8000-000000000003";
const EVENT="c0500000-0000-4000-8000-000000000004";
const CORR="c0500000-0000-4000-8000-000000000005";
const FOREIGN="c0500000-0000-4000-8000-000000000006";
const DATE="2026-11-01T12:00:00Z";
const NAME="Contratante F3";
const EDITED="Contratante F3 revisado";
const SOURCE="src/test/f3-code-v102-v103-contracting-party.test.ts";
const cases=[
  {
    "caseId": "IFV1-F3-C0093",
    "order": 5,
    "destination": "V101",
    "consumer": "contratantes",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0096",
    "order": 5,
    "destination": "V103",
    "consumer": "contratantes",
    "reader": false
  },
  {
    "caseId": "IFV1-F3-C0098",
    "order": 5,
    "destination": "V105",
    "consumer": "contratantes",
    "reader": false
  },
  {
    "caseId": "IFV1-F3-C0100",
    "order": 5,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "reader": false
  },
  {
    "caseId": "IFV1-F3-C0107",
    "order": 6,
    "destination": "V101",
    "consumer": "contratantes",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0111",
    "order": 6,
    "destination": "V104",
    "consumer": "contratos",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0113",
    "order": 6,
    "destination": "V105",
    "consumer": "contratantes",
    "reader": false
  },
  {
    "caseId": "IFV1-F3-C0115",
    "order": 6,
    "destination": "V106",
    "consumer": "contratantes",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0116",
    "order": 6,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "reader": false
  }
];
type Case=typeof cases[number];
type Party={id:string;id_organizacao:string;razao_social:string;tipo_pessoa:string;documento:string|null;nome_fantasia:string|null;contato:Record<string,unknown>;situacao:string;versao_registro:number;atualizado_em:string};
let actor="master",party:Party|null=null,writes=0,event:Record<string,unknown>|null=null;
const observations:Record<string,unknown>[]=[];
const calls:Array<{table:string;filters:unknown[][];insert?:unknown}>=[];
const form={razaoSocial:NAME,tipoPessoa:"juridica",documento:"12345678000199",nomeFantasia:"F3",email:"",telefone:"",situacao:"ativo"};
const ok=(data:unknown,count=0)=>({data,error:null,status:200,count});
const deny=()=>({data:null,error:{code:"42501"},status:403,count:null});
function record(order:number){
  writes++;event={id:EVENT,criado_em:DATE,evento:order===5?"contratantes.insert":"atualizar_contratante",entidade:"contratantes",origem:order===5?"data_api":"rpc",id_usuario:null,id_entidade:ID,correlation_id:CORR};
}
function rpc(name:string,args:Record<string,unknown>={}){
  if(name==="listar_organizacoes_disponiveis")return ok(actor==="outsider"?[]:[{id:ORG,razao_social:"Organização F3",nome_fantasia:null,cnpj:null,situacao:"ativa",perfil:actor==="master"?"administrador_master":"leitor"}]);
  if(name==="consultar_permissoes_efetivas"){
    if(actor==="outsider"||args.p_id_organizacao!==ORG)return deny();
    return ok({schema_versao:"rbac-v1",versao:6,master:actor==="master",permissoes:[{recurso:"contratantes",acao:"consultar"},{recurso:"contratos",acao:"consultar"},...(actor==="master"?[{recurso:"contratantes",acao:"editar"},{recurso:"contratos",acao:"criar"}]:[])]});
  }
  if(name==="pode_consultar_auditoria_organizacao")return ok(actor==="master"&&args.p_id_organizacao===ORG);
  if(name==="atualizar_contratante"){
    if(actor!=="master"||args.p_id_organizacao!==ORG||args.p_id_contratante!==ID||!party)return deny();
    if(args.p_versao_esperada!==party.versao_registro)return {data:null,error:{code:"PT409"},status:409};
    party={...party,razao_social:String(args.p_razao_social),versao_registro:party.versao_registro+1};
    record(6);return ok({schema_versao:"v103-v1",contratante:party});
  }
  throw new Error("unexpected RPC "+name);
}
function read(call:typeof calls[number],single:boolean){
  const has=(k:string,v:string)=>call.filters.some(([key,value])=>key===k&&value===v);
  if(actor==="outsider")return deny();
  if(call.insert){
    const payload=call.insert as Party;
    if(actor!=="master"||payload.id_organizacao!==ORG)return deny();
    if(party)throw new Error("duplicate write");
    party={...payload,id:ID,versao_registro:1,atualizado_em:DATE};record(5);
    return ok({id:party.id,razao_social:party.razao_social,situacao:party.situacao});
  }
  if(call.table==="organizacoes")return has("id",ORG)?ok({id:ORG}):deny();
  if(call.table==="contratantes"){
    if(!has("id_organizacao",ORG))return deny();
    if(single)return ok(has("id",ID)?party:null);
    return ok(party?[party]:[],party?1:0);
  }
  if(call.table==="contratos"){
    if(!party)return ok(single?null:[],0);
    const contract={id:CONTRACT,id_organizacao:ORG,numero:"F3-001",objeto:"Contrato F3",situacao:"ativo",criticidade:"baixa",id_contratante:party.id,contratante:{razao_social:party.razao_social,nome_fantasia:party.nome_fantasia,documento:party.documento}};
    if(single){if(!has("id",CONTRACT))return deny();return ok(contract);}
    if(!has("id_organizacao",ORG))return deny();
    return ok([contract],1);
  }
  if(call.table==="eventos_auditoria"){
    if(actor!=="master"||!has("id_organizacao",ORG))return deny();
    const found=event&&has("correlation_id",CORR)?[event]:[];
    return ok(found,found.length);
  }
  throw new Error("unexpected table "+call.table);
}
async function create(){
  expect(validarFormulario(form)).toEqual([]);
  const payload=montarPayload(ORG,form);
  const result=await inserirContratante(payload);
  expect(result).toMatchObject({id:ID,razao_social:NAME});
  expect(calls.at(-1)?.insert).toEqual(payload);
  return result.id;
}
async function edit(){
  const before=await buscarContratante(ORG,ID);
  const args=montarArgsAtualizacao(ORG,before.id,before.versao_registro,{...formularioDe(before),razaoSocial:EDITED});
  const updated=await atualizarContratante(args);
  expect(updated).toMatchObject({id:ID,id_organizacao:ORG,razao_social:EDITED,versao_registro:2});
  expect(m.rpc).toHaveBeenLastCalledWith("atualizar_contratante",args);
  expect(await buscarContratante(ORG,ID)).toEqual(updated);
  await expect(atualizarContratante(args)).rejects.toMatchObject({tipo:"conflito"});
  expect(writes).toBe(1);
  return updated.id;
}
async function produce(c:Case){
  actor="master";
  if(c.order===5){expect((await listarContratantes({idOrganizacao:ORG,pagina:1,busca:"",situacao:"todos"})).total).toBe(0);return create();}
  party={...montarPayload(ORG,form),id:ID,versao_registro:1,atualizado_em:DATE};
  return edit();
}
const expectedName=(c:Case)=>c.order===5?NAME:EDITED;
async function gateCreate(){
  const orgs=await listarOrganizacoesDisponiveis();
  const perms=await consultarPermissoesEfetivas(ORG,null);
  return orgs.some(o=>o.id===ORG&&o.situacao==="ativa")&&temPermissao(perms.permissoes,"contratos","criar");
}
async function consume(c:Case,negative:boolean){
  const name=expectedName(c);
  if(c.destination==="V123"){
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const p=obterEventosAuditoria({idOrganizacao:ORG,pagina:0,correlationId:CORR});
    if(negative){await expect(p).rejects.toThrow("Acesso não autorizado");return null;}
    const a=await p;expect(a.total).toBe(1);expect(a.eventos[0]).toMatchObject({id:EVENT,id_entidade:ID,correlation_id:CORR,evento:c.order===5?"contratantes.insert":"atualizar_contratante"});
    return {entity:a.eventos[0].id_entidade,eventId:a.eventos[0].id,correlation:a.eventos[0].correlation_id};
  }
  if(c.destination==="V103"){
    const allowed=await consultarCapacidadeEdicaoContratante(ORG);
    expect(allowed).toBe(!negative);
    if(negative){await expect(buscarContratante(FOREIGN,ID)).rejects.toMatchObject({tipo:"negado"});return null;}
    const value=await buscarContratante(ORG,ID);
    expect(value).toMatchObject({id:ID,id_organizacao:ORG,razao_social:name,versao_registro:1});
    return {id:value.id,name:value.razao_social,version:value.versao_registro};
  }
  if(c.destination==="V105"){
    expect(await gateCreate()).toBe(!negative);
    if(negative){await expect(buscarOpcoesContratantes({idOrganizacao:FOREIGN,busca:"",pagina:1})).rejects.toMatchObject({tipo:"negado"});return null;}
    const options=await buscarOpcoesContratantes({idOrganizacao:ORG,busca:"",pagina:1});
    expect(options.itens).toHaveLength(1);expect(options.itens[0]).toMatchObject({id:ID,razao_social:name});
    expect(calls.at(-1)?.filters).toEqual([["id_organizacao",ORG]]);
    return {id:options.itens[0].id,name:options.itens[0].razao_social,options:options.total};
  }
  if(c.destination==="V101"){
    if(negative){await expect(verificarAcessoOrganizacao(ORG)).rejects.toMatchObject({tipo:"negado"});await expect(listarContratantes({idOrganizacao:ORG,pagina:1,busca:"",situacao:"todos"})).rejects.toMatchObject({tipo:"negado"});return null;}
    expect(await verificarAcessoOrganizacao(ORG)).toBe(true);
    const list=await listarContratantes({idOrganizacao:ORG,pagina:1,busca:"",situacao:"todos"});
    expect(list.itens).toHaveLength(1);expect(list.itens[0]).toMatchObject({id:ID,razao_social:name});
    expect(calls.at(-1)?.filters).toEqual([["id_organizacao",ORG]]);
    return {id:list.itens[0].id,name:list.itens[0].razao_social};
  }
  if(c.destination==="V104"){
    const list= listarContratos({idOrganizacao:ORG,pagina:1});
    if(negative){await expect(list).rejects.toMatchObject({tipo:"negado"});return null;}
    const page=await list;expect(page.itens).toHaveLength(1);expect(page.itens[0]).toMatchObject({id:CONTRACT,id_organizacao:ORG});
    expect(calls.at(-1)?.filters).toEqual([["id_organizacao",ORG]]);
  }
  if(negative){await expect(obterContrato(CONTRACT)).rejects.toMatchObject({tipo:"negado"});return null;}
  const contract=await obterContrato(CONTRACT);
  expect(calls.at(-1)?.filters).toEqual([["id",CONTRACT]]);
  expect(contract).toMatchObject({id:CONTRACT,id_organizacao:ORG,id_contratante:ID,contratante:{razao_social:name}});
  return {id:contract.id_contratante,name:contract.contratante?.razao_social,contractId:contract.id};
}
describe("V102/V103 create/edit -> real linked consumers",()=>{
  beforeEach(()=>{
    actor="master";party=null;writes=0;event=null;calls.length=0;m.rpc.mockReset();m.from.mockReset();
    m.rpc.mockImplementation((n:string,a:Record<string,unknown>)=>Promise.resolve().then(()=>rpc(n,a)));
    m.from.mockImplementation((table:string)=>{
      const call:{table:string;filters:unknown[][];insert?:unknown}={table,filters:[]};calls.push(call);
      const b:Record<string,unknown>={};
      for(const n of ["select","order","range","abortSignal"])b[n]=()=>b;
      b.eq=(...args:unknown[])=>{call.filters.push(args);return b;};
      b.insert=(payload:unknown)=>{call.insert=payload;return b;};
      b.single=b.maybeSingle=()=>Promise.resolve().then(()=>read(call,true));
      b.then=(res:(v:unknown)=>unknown,rej:(e:unknown)=>unknown)=>Promise.resolve().then(()=>read(call,false)).then(res,rej);
      return b;
    });
  });
  for(const c of cases){
    it(c.caseId+" positive: mutation and linked consumer",async()=>{
      const id=await produce(c);let witness:unknown=null;
      for(const role of c.reader?["master","leitor"]:["master"]){actor=role;witness=await consume(c,false);expect(witness).not.toBeNull();}
      expect(writes).toBe(1);
      observations.push({caseId:c.caseId,consumer:c.consumer,producerOrder:c.order,kind:"positive",testId:SOURCE+":"+c.caseId+":positive",state:"EXECUTED",assertion:"PASS",organizationId:ORG,producerEntityId:id,network:{method:"GET",status:200,table:c.destination==="V106"?"contratos":c.consumer,fixture:true},readback:{matched:true,destination:c.destination,partyId:id,version:c.order===5?1:2,roles:c.reader?2:1,writes,witness}});
    });
    it(c.caseId+" negative: denied mutation and protected consumer",async()=>{
      const id=await produce(c);actor="leitor";
      if(c.order===5)await expect(inserirContratante(montarPayload(ORG,form))).rejects.toMatchObject({tipo:"negado"});
      else await expect(atualizarContratante(montarArgsAtualizacao(ORG,ID,2,{...form,razaoSocial:"Não permitido"}))).rejects.toMatchObject({tipo:"negado"});
      actor=c.reader?"outsider":"leitor";expect(await consume(c,true)).toBeNull();actor="master";
      expect(await buscarContratante(ORG,ID)).toMatchObject({id,razao_social:expectedName(c),versao_registro:c.order===5?1:2});
      await expect(buscarContratante(FOREIGN,ID)).rejects.toMatchObject({tipo:"negado"});
      expect(writes).toBe(1);
      observations.push({caseId:c.caseId,consumer:c.consumer,producerOrder:c.order,kind:"negative",testId:SOURCE+":"+c.caseId+":negative",state:"EXECUTED",assertion:"PASS",organizationId:ORG,producerEntityId:id,network:{method:"GET",status:403,table:c.destination==="V106"?"contratos":c.consumer,fixture:true},readback:{outcome:"DENY",destination:c.destination,partyId:id,version:c.order===5?1:2,writes,mutationDenied:true,entityPreserved:true}});
    });
  }
  afterAll(()=>{const path=process.env.F3_CODE_PARTY_OBSERVATIONS;if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations)+"\n",{flag:"wx"});}});
});

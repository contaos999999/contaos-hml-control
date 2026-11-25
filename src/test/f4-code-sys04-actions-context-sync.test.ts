/**
 * Remaining F4.1 SYS04 cases. Real frontend actions/readers with isolated
 * stateful transport. Changing preference does not grant authority: fixture
 * explicitly changes authorized scope/role, and wrong-scope operations deny.
 */
import { beforeEach, afterAll, describe, it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:m.rpc,from:m.from}}));
import { definirPreferenciaOrganizacao, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { consultarCapacidadeCadastro, inserirContratante, montarPayload } from "@/lib/contratantes/novoContratanteDados";
import { consultarCapacidadeEdicaoContratante, buscarContratante, atualizarContratante, montarArgsAtualizacao, formularioDe } from "@/lib/contratantes/editarContratanteDados";
import { listarContratantes, verificarAcessoOrganizacao } from "@/lib/contratantes/contratantesDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { buscarOpcoesContratantes, organizacaoPermiteCadastro, inserirContrato } from "@/lib/contratos/novoContratoDados";
import { criarCompetencia, consultarCapacidadeCriarCompetencia, verificarCompetenciaExistente } from "@/lib/contratos/novaCompetenciaDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import { criarOrganizacao } from "@/lib/organizacao/criarOrganizacaoDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";

const uid=(prefix:string,slot:number)=>prefix+"1000000-0000-4000-8000-"+String(slot).padStart(12,"0");
const context=(prefix:string)=>({org:uid(prefix,1),party:uid(prefix,2),newParty:uid(prefix,3),contract:uid(prefix,4),newContract:uid(prefix,5),comp:uid(prefix,6),report:uid(prefix,7),file:uid(prefix,8),event:uid(prefix,9),correlation:uid(prefix,10),label:prefix.toUpperCase()});
const A=context("a"),B=context("b"),C=context("c");
type Scope=typeof A;
type Party={id:string,id_organizacao:string,razao_social:string,tipo_pessoa:string,documento:string|null,nome_fantasia:string|null,contato:Record<string,unknown>|null,situacao:string,versao_registro:number,atualizado_em:string};
type Store={scope:Scope,parties:Party[],contracts:Record<string,unknown>[],comp:string|null,events:Record<string,unknown>[]};
const date="2026-01-01T12:00:00Z";
function audit(s:Scope,evento:string,entidade:string,id:string){return {id:s.event,criado_em:date,evento,entidade,origem:"rpc",id_usuario:null,id_entidade:id,correlation_id:s.correlation};}
function store(s:Scope):Store{return {scope:s,parties:[{id:s.party,id_organizacao:s.org,razao_social:s.label+" Original",tipo_pessoa:"juridica",documento:null,nome_fantasia:null,contato:null,situacao:"ativo",versao_registro:1,atualizado_em:date}],contracts:[{id:s.contract,id_organizacao:s.org,id_contratante:s.party,numero:s.label+"-001",objeto:s.label+" Contrato",situacao:"ativo",criticidade:"baixa"}],comp:null,events:[audit(s,"atualizar_contratante","contratantes",s.party)]};}
let stores:Map<string,Store>,current:Scope,role:"admin"|"leitor"|"master";
const U="f4-context-user",obs:Record<string,unknown>[]=[];
const form=(name:string)=>({razaoSocial:name,tipoPessoa:"juridica",documento:"",nomeFantasia:"",email:"",telefone:"",situacao:"ativo"});
const ok=(data:unknown,count?:number)=>({data:structuredClone(data),error:null,status:200,count:count??(Array.isArray(data)?data.length:1)});
const fail=(code:string,status:number)=>({data:null,error:{code},status,count:0});
const deny=()=>fail("42501",403);
const canWrite=()=>role!=="leitor";
function get(){const x=stores.get(current.org);if(!x)throw Error("no authorized store");return x;}
function orgRow(s:Scope){return {id:s.org,razao_social:s.label+" Organização",nome_fantasia:null,cnpj:null,situacao:"ativa",perfil:role==="master"?"administrador_master":role==="admin"?"administrador":"leitor"};}
const readPermissions=[{recurso:"contratantes",acao:"consultar"},{recurso:"contratos",acao:"consultar"},{recurso:"historico",acao:"consultar"}];
const writePermissions=[{recurso:"usuarios",acao:"administrar"},{recurso:"contratantes",acao:"criar"},{recurso:"contratantes",acao:"editar"},{recurso:"contratos",acao:"criar"},{recurso:"competencias",acao:"criar"},{recurso:"historico",acao:"criar"},{recurso:"auditoria",acao:"consultar"}];
function rpc(n:string,a:Record<string,unknown>={}){
  if(n==="listar_organizacoes_disponiveis")return ok(role==="master"?[...stores.values()].map(x=>orgRow(x.scope)):[orgRow(current)]);
  if(n==="consultar_permissoes_efetivas"){
    if(a.p_id_organizacao!==current.org||(a.p_id_contrato!==null&&a.p_id_contrato!==current.contract))return deny();
    return ok({schema_versao:"rbac-v1",versao:1,master:role==="master",permissoes:[...readPermissions,...(canWrite()?writePermissions:[])]});
  }
  if(n==="pode_consultar_auditoria_organizacao")return ok(canWrite()&&a.p_id_organizacao===current.org);
  if(n==="criar_organizacao"){
    if(role!=="master")return deny();
    if(stores.has(C.org))return fail("23505",409);
    expect(a).toMatchObject({p_razao_social:"Nova organização",p_timezone:"America/Sao_Paulo"});
    const created=store(C);created.events=[audit(C,n,"organizacoes",C.org)];stores.set(C.org,created);return ok(C.org);
  }
  if(n==="atualizar_contratante"){
    if(!canWrite()||a.p_id_organizacao!==current.org)return deny();
    const p=get().parties.find(x=>x.id===a.p_id_contratante);if(!p)return deny();
    if(a.p_versao_esperada!==p.versao_registro)return fail("PT409",409);
    p.razao_social=String(a.p_razao_social);p.versao_registro++;
    return ok({schema_versao:"v103-v1",contratante:p});
  }
  if(n==="criar_competencia"){
    if(!canWrite()||a.p_id_contrato!==current.contract)return deny();
    if(a.p_competencia_referencia!=="2026-11-01")return fail("PT400",400);
    if(get().comp)return fail("23505",409);
    get().comp=current.comp;return ok(current.comp);
  }
  throw Error("unexpected rpc "+n);
}
type Call={table:string,filters:Array<[string,unknown]>,payload?:Record<string,unknown>,single:boolean};
const calls:Call[]=[];
function response(q:Call){
  const s=current;const x=get();const has=(k:string,v:unknown)=>q.filters.some(([key,value])=>key===k&&value===v);
  if(q.payload){
    if(!canWrite()||q.payload.id_organizacao!==s.org)return deny();
    if(q.table==="contratantes"){
      if(x.parties.some(p=>p.id===s.newParty))return fail("23505",409);
      const p={...q.payload,id:s.newParty,versao_registro:1,atualizado_em:date} as Party;
      x.parties.push(p);return ok({id:p.id,razao_social:p.razao_social,situacao:p.situacao});
    }
    if(q.table==="contratos"){
      if(!x.parties.some(p=>p.id===q.payload!.id_contratante))return fail("23503",422);
      if(x.contracts.some(c=>c.id===s.newContract))return fail("23505",409);
      x.contracts.push({...q.payload,id:s.newContract,situacao:"ativo",criticidade:"baixa"});return ok(null);
    }
    throw Error("unexpected insert "+q.table);
  }
  switch(q.table){
    case "organizacoes":return has("id",s.org)?ok({id:s.org}):deny();
    case "contratantes":{
      if(!has("id_organizacao",s.org))return deny();
      return q.single?ok(x.parties.find(p=>has("id",p.id))??null):ok(x.parties);
    }
    case "contratos":return has("id_organizacao",s.org)?ok(x.contracts):deny();
    case "competencias":return has("id_contrato",s.contract)&&has("competencia_referencia","2026-11-01")?ok(x.comp?{id:x.comp}:null):deny();
    case "relatorios_historicos_contratante":return has("id_organizacao",s.org)&&has("id_contrato",s.contract)?ok([{id:s.report,id_contrato:s.contract,id_organizacao:s.org,id_arquivo:s.file,numero_documento:s.label+"-REL",tipo:"relatorio",competencia_referencia:"2026-10-01",data_documento:null,status_processamento:"concluido",resultado_geral:null,origem_temporal:"historico",criado_em:date}]):deny();
    case "eventos_auditoria":return canWrite()&&has("id_organizacao",s.org)?ok(x.events.filter(e=>!q.filters.some(([k])=>k==="correlation_id")||has("correlation_id",e.correlation_id))):deny();
    default:throw Error("unexpected table "+q.table);
  }
}
beforeEach(()=>{
  stores=new Map([[A.org,store(A)],[B.org,store(B)]]);current=A;role="admin";sessionStorage.clear();calls.length=0;
  m.rpc.mockReset();m.from.mockReset();
  m.rpc.mockImplementation((n:string,a:Record<string,unknown>)=>Promise.resolve().then(()=>rpc(n,a)));
  m.from.mockImplementation((table:string)=>{
    const call:Call={table,filters:[],single:false};calls.push(call);const q:Record<string,unknown>={};
    for(const op of ["select","order","range","abortSignal","or"])q[op]=()=>q;
    q.eq=(k:string,v:unknown)=>{call.filters.push([k,v]);return q;};
    q.insert=(payload:Record<string,unknown>)=>{call.payload=payload;return q;};
    q.single=q.maybeSingle=()=>{call.single=true;return Promise.resolve().then(()=>response(call));};
    q.then=(resolve:(v:unknown)=>unknown,reject:(e:unknown)=>unknown)=>Promise.resolve().then(()=>response(call)).then(resolve,reject);
    return q;
  });
});
function select(s:Scope){current=s;definirPreferenciaOrganizacao(U,s.org);expect(obterPreferenciaOrganizacao(U)).toBe(s.org);return s.org;}
const listParties=(s:Scope)=>listarContratantes({idOrganizacao:s.org,pagina:1,busca:"",situacao:"todos"});
const listContracts=(s:Scope)=>listarContratos({idOrganizacao:s.org,pagina:1});
const listAudit=(s:Scope)=>obterEventosAuditoria({idOrganizacao:s.org,pagina:0,correlationId:s.correlation});
const history=(s:Scope)=>listarRelatoriosHistoricos(s.contract,s.org,0,new AbortController().signal);
function record(id:string,kind:string,readback:unknown){obs.push({caseId:"IFV1-F4-C"+id,kind,mode:"CODE_FIXTURE",readback});}
const kinds=["positive","negative"] as const;
describe("F4.1 remaining material scopes and writes",()=>{
  for(const kind of kinds)it("IFV1-F4-C0041 "+kind+": refresh administrative permissions",async()=>{
    select(A);role="leitor";const before=await consultarPermissoesEfetivas(A.org,null);expect(temPermissao(before.permissoes,"usuarios","administrar")).toBe(false);
    select(B);role="admin";const after=await consultarPermissoesEfetivas(B.org,null);expect(temPermissao(after.permissoes,"usuarios","administrar")).toBe(true);
    if(kind==="negative"){await expect(consultarPermissoesEfetivas(A.org,null)).rejects.toMatchObject({tipo:"negado"});expect(await consultarPermissoesEfetivas(B.org,null)).toEqual(after);}
    record("0041",kind,{before,after,scope:B.org,oldDenied:kind==="negative"});
  });
  for(const kind of kinds)it("IFV1-F4-C0045 "+kind+": reload list of contracting parties",async()=>{
    select(A);expect(await verificarAcessoOrganizacao(A.org)).toBe(true);const before=await listParties(A);expect(before.itens[0]?.id).toBe(A.party);
    select(B);expect(await verificarAcessoOrganizacao(B.org)).toBe(true);const after=await listParties(B);expect(after.itens[0]?.id).toBe(B.party);
    if(kind==="negative"){await expect(verificarAcessoOrganizacao(A.org)).rejects.toMatchObject({tipo:"negado"});await expect(listParties(A)).rejects.toMatchObject({tipo:"negado"});expect(await listParties(B)).toEqual(after);}
    record("0045",kind,{before,after});
  });
  for(const kind of kinds)it("IFV1-F4-C0046 "+kind+": create in new scope and read back",async()=>{
    select(A);const before=await listParties(A);select(B);expect(await consultarCapacidadeCadastro(B.org,U)).not.toBeNull();
    const result=await inserirContratante(montarPayload(B.org,form("B Novo")));
    expect(result.id).toBe(B.newParty);const after=await listParties(B);expect(after.itens.map(x=>x.id)).toEqual([B.party,B.newParty]);
    if(kind==="negative"){await expect(inserirContratante(montarPayload(A.org,form("A indevido")))).rejects.toMatchObject({tipo:"negado"});expect(await listParties(B)).toEqual(after);select(A);expect(await listParties(A)).toEqual(before);}
    record("0046",kind,{before,after,result});
  });
  for(const kind of kinds)it("IFV1-F4-C0047 "+kind+": edit current scope using separately read version",async()=>{
    select(A);const old=await buscarContratante(A.org,A.party);select(B);expect(await consultarCapacidadeEdicaoContratante(B.org)).toBe(true);
    const before=await buscarContratante(B.org,B.party);const cmd=montarArgsAtualizacao(B.org,before.id,before.versao_registro,{...formularioDe(before),razaoSocial:"B Revisado"});
    const updated=await atualizarContratante(cmd);const after=await buscarContratante(B.org,B.party);expect(after).toEqual(updated);expect(after).toMatchObject({id:B.party,versao_registro:2,razao_social:"B Revisado"});
    if(kind==="negative"){await expect(atualizarContratante(cmd)).rejects.toMatchObject({tipo:"conflito"});await expect(atualizarContratante(montarArgsAtualizacao(A.org,A.party,old.versao_registro,form("A indevido")))).rejects.toMatchObject({tipo:"negado"});expect(await buscarContratante(B.org,B.party)).toEqual(after);select(A);expect(await buscarContratante(A.org,A.party)).toEqual(old);}
    record("0047",kind,{before,after,old});
  });
  for(const kind of kinds)it("IFV1-F4-C0048 "+kind+": reload contract listing after change",async()=>{
    select(A);const before=await listContracts(A);expect(before.itens[0]?.id).toBe(A.contract);select(B);const after=await listContracts(B);expect(after.itens[0]?.id).toBe(B.contract);
    if(kind==="negative"){await expect(listContracts(A)).rejects.toMatchObject({tipo:"negado"});expect(await listContracts(B)).toEqual(after);}
    record("0048",kind,{before,after});
  });
  for(const kind of kinds)it("IFV1-F4-C0049 "+kind+": current contractor options and contract creation",async()=>{
    select(A);const old=await buscarOpcoesContratantes({idOrganizacao:A.org,busca:"",pagina:1});expect(old.itens[0]?.id).toBe(A.party);
    select(B);expect(organizacaoPermiteCadastro(await listarOrganizacoesDisponiveis(),B.org)).toBe(true);
    const options=await buscarOpcoesContratantes({idOrganizacao:B.org,busca:"",pagina:1});expect(options.itens[0]?.id).toBe(B.party);
    await inserirContrato({id_organizacao:B.org,id_contratante:B.party,numero:"B-NEW",objeto:"B Novo",inicio:"2026-11-01"});
    const after=await listContracts(B);expect(after.itens.map(x=>x.id)).toEqual([B.contract,B.newContract]);
    if(kind==="negative"){await expect(inserirContrato({id_organizacao:B.org,id_contratante:A.party,numero:"BAD",objeto:"Inválido",inicio:"2026-11-01"})).rejects.toMatchObject({tipo:"invalido"});expect(await listContracts(B)).toEqual(after);}
    record("0049",kind,{old,options,after});
  });
  for(const kind of kinds)it("IFV1-F4-C0057 "+kind+": current competence create and exact reconciliation",async()=>{
    select(A);expect(await verificarCompetenciaExistente(A.contract,"2026-11")).toBeNull();select(B);
    expect(await consultarCapacidadeCriarCompetencia(B.org,B.contract)).toBe(true);expect(await verificarCompetenciaExistente(B.contract,"2026-11")).toBeNull();
    const id=await criarCompetencia(B.contract,"2026-11");expect(id).toBe(B.comp);expect(await verificarCompetenciaExistente(B.contract,"2026-11")).toBe(id);
    if(kind==="negative"){await expect(criarCompetencia(B.contract,"2026-11")).rejects.toMatchObject({tipo:"duplicada"});await expect(criarCompetencia(A.contract,"2026-11")).rejects.toMatchObject({tipo:"sem_permissao"});expect(await verificarCompetenciaExistente(B.contract,"2026-11")).toBe(id);select(A);expect(await verificarCompetenciaExistente(A.contract,"2026-11")).toBeNull();}
    record("0057",kind,{scope:B.org,contract:B.contract,id,reconciled:true});
  });
  for(const kind of kinds)it("IFV1-F4-C0066 "+kind+": refresh history ingestion context and capacity",async()=>{
    select(A);const before=await history(A);expect(before.itens[0]?.id).toBe(A.report);
    select(B);const permission=await consultarPermissoesEfetivas(B.org,B.contract);expect(temPermissao(permission.permissoes,"historico","criar")).toBe(true);
    const after=await history(B);expect(after.itens[0]?.id).toBe(B.report);
    if(kind==="negative"){await expect(history(A)).rejects.toMatchObject({tipo:"negado"});role="leitor";expect(temPermissao((await consultarPermissoesEfetivas(B.org,B.contract)).permissoes,"historico","criar")).toBe(false);expect(await history(B)).toEqual(after);}
    record("0066",kind,{before,after,permission});
  });
  for(const kind of kinds)it("IFV1-F4-C0067 "+kind+": organization creation and separate audit readback",async()=>{
    select(A);role="master";const before=await listarOrganizacoesDisponiveis();expect(before.some(x=>x.id===C.org)).toBe(false);
    const id=await criarOrganizacao({razaoSocial:" Nova organização ",nomeFantasia:"",cnpj:""});expect(id).toBe(C.org);
    const after=await listarOrganizacoesDisponiveis();expect(after.some(x=>x.id===id)).toBe(true);select(C);
    expect(await podeConsultarAuditoria(C.org)).toBe(true);const audit=await listAudit(C);expect(audit.total).toBe(1);expect(audit.eventos[0]).toMatchObject({evento:"criar_organizacao",id_entidade:id,correlation_id:C.correlation});
    if(kind==="negative"){role="leitor";await expect(criarOrganizacao({razaoSocial:"Nova organização",nomeFantasia:"",cnpj:""})).rejects.toMatchObject({tipo:"negado"});await expect(listAudit(C)).rejects.toThrow("Acesso não autorizado");role="master";expect(await listarOrganizacoesDisponiveis()).toEqual(after);expect(await listAudit(C)).toEqual(audit);}
    record("0067",kind,{before,after,id,audit});
  });
  for(const kind of kinds)it("IFV1-F4-C0068 "+kind+": refresh actual audit query in new scope",async()=>{
    select(A);const before=await listAudit(A);expect(before.eventos[0]?.id_entidade).toBe(A.party);
    select(B);const after=await listAudit(B);expect(after.eventos[0]?.id_entidade).toBe(B.party);expect(after.eventos[0]?.correlation_id).toBe(B.correlation);
    if(kind==="negative"){expect(await podeConsultarAuditoria(A.org)).toBe(false);await expect(listAudit(A)).rejects.toThrow("Acesso não autorizado");expect(await listAudit(B)).toEqual(after);}
    record("0068",kind,{before,after});
  });
});
afterAll(()=>{const path=process.env.F4_CODE_SYS04_ACTION_OBSERVATIONS;if(path){expect(obs).toHaveLength(20);writeFileSync(path,JSON.stringify(obs,null,2)+"\n",{flag:"wx"});}});

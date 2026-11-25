/** V113 creation -> nine real product consumers, stateful local fixture only. */
import { beforeEach,afterAll,afterEach,describe,expect,it,vi } from "vitest";
import { render,screen,cleanup,within } from "@testing-library/react";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { writeFileSync } from "node:fs";
const m=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn(),getUser:vi.fn(),nav:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:m.rpc,from:m.from,auth:{getUser:m.getUser}}}));
vi.mock("@tanstack/react-router",()=>({useNavigate:()=>m.nav,Link:({children,to,...props}:{children:ReactNode;to:string})=><a href={to} {...props}>{children}</a>}));
import { criarCompetencia,verificarCompetenciaExistente } from "@/lib/contratos/novaCompetenciaDados";
import { listarCompetencias,FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";
import { obterVisaoGeral,parseVisaoGeral,classificarErroVisaoGeral,derivarEstadoVisual } from "@/lib/competencias/competenciaVisaoGeralDados";
import { obterDocumentosCompetencia,parseLeituraV115,classificarErroV115 } from "@/lib/competencias/competenciaDocumentosDados";
import { obterAnaliseCompetencia,parseAnaliseV116,classificarErroV116,FILTROS_VAZIOS,OFFSETS_ZERO } from "@/lib/competencias/competenciaAnaliseDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Dashboard,MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";

const ORG="c1400000-0000-4000-8000-000000000001";
const CONTRACT="c1400000-0000-4000-8000-000000000002";
const COMP="c1400000-0000-4000-8000-000000000003";
const EVENT="c1400000-0000-4000-8000-000000000004";
const CORR="c1400000-0000-4000-8000-000000000005";
const FOREIGN="c1400000-0000-4000-8000-000000000006";
const MONTH="2026-11";
const REF=MONTH+"-01";
const DATE="2026-12-15";
const SOURCE="src/test/f3-code-v113-created-competence.test.tsx";
const cases=[
  {
    "caseId": "IFV1-F3-C0352",
    "destination": "SYS05",
    "consumer": "obter_resumo_dashboard",
    "method": "POST",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0365",
    "destination": "V112",
    "consumer": "competencias",
    "method": "GET",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0368",
    "destination": "V114",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0369",
    "destination": "V115",
    "consumer": "obter_documentos_competencia_v115",
    "method": "POST",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0370",
    "destination": "V116",
    "consumer": "obter_analise_competencia_v116",
    "method": "POST",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0371",
    "destination": "V118",
    "consumer": "pareceres_internos",
    "method": "GET",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0372",
    "destination": "V119",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0373",
    "destination": "V120",
    "consumer": "apresentacoes_contratante",
    "method": "GET",
    "reader": true
  },
  {
    "caseId": "IFV1-F3-C0376",
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "reader": false
  }
];
type Case=typeof cases[number];
type Competence={id:string;id_contrato:string;id_organizacao:string;competencia_referencia:string;situacao:string;data_limite:string};
let stored:Competence|null=null;
let actor="master";
let event:Record<string,unknown>|null=null;
const calls:Array<{table:string;filters:unknown[][]}>=[];
const observations:Record<string,unknown>[]=[];
const ok=(data:unknown,count=0)=>({data,error:null,status:200,count});
const deny=()=>({data:null,error:{code:"42501"},status:403,count:null});
const pag=(limite:number,total=0)=>({offset:0,limite,total});
function rpc(name:string,args:Record<string,unknown>){
  if(name==="criar_competencia"){
    if(actor!=="master"||args.p_id_contrato!==CONTRACT)return deny();
    if(args.p_competencia_referencia!==REF)throw new Error("wrong month");
    if(stored)throw new Error("duplicate fixture mutation");
    stored={id:COMP,id_contrato:String(args.p_id_contrato),id_organizacao:ORG,competencia_referencia:String(args.p_competencia_referencia),situacao:"rascunho",data_limite:DATE};
    event={id:EVENT,criado_em:"2026-11-01T12:00:00Z",evento:"criar_competencia",entidade:"competencias",origem:"rpc",id_usuario:null,id_entidade:stored.id,correlation_id:CORR};
    return ok(stored.id);
  }
  if(name==="pode_consultar_auditoria_organizacao")return ok(actor==="master"&&args.p_id_organizacao===ORG);
  if(name==="obter_resumo_dashboard"){
    if(actor==="outsider"||args.p_id_organizacao!==ORG)return deny();
    return ok({schema_versao:"sys05-v1",gerado_em:"01/11/2026 12:00",organizacao:{id:ORG,razao_social:"Organização F3",nome_fantasia:null,situacao:"ativa"},
      resumo:{contratos_visiveis:1,contratos_ativos:1,competencias_em_fluxo:stored?1:0,competencias_exigem_atencao:0,itens_com_prazo_vencido:0,atencoes_abertas:0},
      contratos_por_situacao:[],competencias_por_situacao:stored?[{situacao:stored.situacao,quantidade:1}]:[],
      proximos_prazos:stored?[{tipo:"competencia",id:stored.id,contrato_numero:"F3-113",titulo:"Competência criada F3",prazo:stored.data_limite,status:stored.situacao,criticidade:null}]:[],atencoes_prioritarias:[]});
  }
  if(actor==="outsider"||!stored||args.p_id_competencia!==stored.id)return deny();
  const c=stored;
  const counts={pendentes:1,nao_conformes:0,inconclusivos:0,em_analise:0,nao_conformidades_bloqueantes:0};
  if(name==="obter_visao_geral_competencia")return ok({competencia:{...c,periodo_inicio:REF,periodo_fim:"2026-11-30",atualizado_em:null,percentual_conformidade:0,versao_pacote_atual:null,versao_registro:1},
    portao:{...counts,liberado:false,total:1,conformes_ou_na_validos:0,percentual:0},blocking_summary:{...counts,parecer_aprovado:false,analise_concluida_atual:false,aprovacao_apresentacao_atual:false},allowed_actions:{abrir_documentos:true,analisar:actor==="master",abrir_parecer:true,apresentar:false}});
  if(name==="obter_documentos_competencia_v115")return ok({schema_versao:"v115-v1",competencia:c,estado_documental:"missing_docs",resumo:{documentos_total:0,requisitos_documentais_total:1,requisitos_documentais_aplicaveis:1,requisitos_documentais_pendentes:1},documentos:[],requisitos_documentais:[{id:EVENT,codigo:"F3-REQ",obrigatorio:true,aplicavel:true,impeditivo:true,tipos_esperados:["contrato"],atendido:false}],documentos_paginacao:pag(25),requisitos_paginacao:pag(25,1),capacidades:{pode_enviar:actor==="master",pode_nova_versao:actor==="master",motivo_nova_versao_obrigatorio:true}});
  if(name==="obter_analise_competencia_v116")return ok({schema_versao:"v116-v1",competencia:c,estado_analise:"not_analyzed",stale:false,percentual:0,blocking_summary:counts,allowed_actions:{executar_analise:actor==="master",reanalisar:false,abrir_requisito:false},execucao_atual:null,mecanismos:{},resultados:[],resultados_paginacao:pag(25),execucoes:[],execucoes_paginacao:pag(10),apontamentos:[],apontamentos_paginacao:pag(25)});
  throw new Error("unexpected RPC "+name);
}
function tableResponse(call:{table:string;filters:unknown[][]},single:boolean){
  const has=(k:string,v:string)=>call.filters.some(([key,value])=>key===k&&value===v);
  if(actor==="outsider"||(call.table==="eventos_auditoria"&&actor!=="master"))return deny();
  if(call.table==="competencias"){
    if(has("id_contrato",FOREIGN))return deny();
    if(!has("id_contrato",CONTRACT))throw new Error("wrong contract");
    if(single&&!has("competencia_referencia",REF))throw new Error("wrong reference");
    return single?ok(stored):ok(stored?[stored]:[],stored?1:0);
  }
  if(call.table==="eventos_auditoria"){
    if(!has("id_organizacao",ORG)||!has("correlation_id",CORR))throw new Error("wrong audit scope");
    return ok(event?[event]:[],event?1:0);
  }
  if(["pareceres_internos","apresentacoes_contratante"].includes(call.table)){
    if(!stored||!has("id_competencia",stored.id)||!has("id_organizacao",ORG)||!has("id_contrato",CONTRACT))throw new Error("wrong child scope");
    // A newly created draft must not have an invented opinion or presentation.
    return ok([],0);
  }
  throw new Error("unexpected table "+call.table);
}
async function produce(){
  actor="master";
  expect(await verificarCompetenciaExistente(CONTRACT,MONTH)).toBeNull();
  const id=await criarCompetencia(CONTRACT,MONTH);
  expect(id).toBe(COMP);
  expect(m.rpc).toHaveBeenCalledWith("criar_competencia",{p_id_contrato:CONTRACT,p_competencia_referencia:REF});
  expect(await verificarCompetenciaExistente(CONTRACT,MONTH)).toBe(id);
  const page=await listarCompetencias(CONTRACT,{mes:MONTH,situacao:""},0);
  expect(page.itens).toHaveLength(1);
  expect(page.itens[0]).toMatchObject({id,id_contrato:CONTRACT,id_organizacao:ORG,competencia_referencia:REF});
  return id;
}
function mount(){
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
  definirPreferenciaOrganizacao(actor,ORG);
  return render(<QueryClientProvider client={client}><Dashboard/></QueryClientProvider>);
}
async function consume(c:Case,id:string,negative:boolean){
  const signal=new AbortController().signal;
  if(c.destination==="SYS05"){
    const view=mount();
    if(negative){expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();expect(screen.queryByRole("region",{name:"Indicadores de resumo"})).toBeNull();expect(screen.queryByText("Competência criada F3")).toBeNull();}
    else {
      const kpi=await screen.findByText("Competências em fluxo");
      expect(kpi.closest("dt")?.parentElement?.querySelector("dd")?.textContent).toBe("1");
      expect(within(screen.getByRole("region",{name:"Competências por situação"})).getByText("rascunho")).toBeTruthy();
      expect(screen.getByText("Competência criada F3")).toBeTruthy();
      expect(within(screen.getByTestId("prazo-item")).getByText("15/12/2026")).toBeTruthy();
    }
    expect(m.rpc).toHaveBeenLastCalledWith(c.consumer,{p_id_organizacao:ORG});
    view.unmount();
    return negative?null:{count:1,group:"rascunho",deadline:DATE};
  }
  if(c.destination==="V112"){
    const p=listarCompetencias(CONTRACT,FILTROS_COMPETENCIA_VAZIOS,0,signal);
    if(negative){await expect(p).rejects.toMatchObject({tipo:"negado"});return null;}
    const page=await p;expect(page.itens).toHaveLength(1);expect(page.itens[0].id).toBe(id);
    expect(page.itens[0].competencia_referencia).toBe(REF);
    expect(calls.at(-1)?.filters).toEqual([["id_contrato",CONTRACT]]);
    return {rowId:page.itens[0].id,reference:page.itens[0].competencia_referencia};
  }
  if(c.destination==="V114"||c.destination==="V119"){
    const res=await obterVisaoGeral(id,signal);
    expect(m.rpc).toHaveBeenLastCalledWith(c.consumer,{p_id_competencia:id});
    if(negative){expect(classificarErroVisaoGeral(res.error,res.status)).toBe("sem_permissao");expect(parseVisaoGeral(res.data)).toBeNull();return null;}
    const parsed=parseVisaoGeral(res.data);
    expect(parsed?.competencia).toMatchObject({id,id_organizacao:ORG,id_contrato:CONTRACT,competencia_referencia:REF});
    if(!parsed)throw new Error("invalid overview");
    expect(parsed.portao.liberado).toBe(false);expect(parsed.allowed_actions.apresentar).toBe(false);
    if(c.destination==="V119")expect(derivarEstadoVisual(parsed)).not.toBe("ready");
    return {scope:parsed.competencia.id,gate:parsed.portao.liberado,canPresent:parsed.allowed_actions.apresentar};
  }
  if(c.destination==="V115"){
    const res=await obterDocumentosCompetencia(id,0,0,signal);
    expect(m.rpc).toHaveBeenLastCalledWith(c.consumer,{p_id_competencia:id,p_documentos_offset:0,p_documentos_limite:25,p_requisitos_offset:0,p_requisitos_limite:25});
    if(negative){expect(classificarErroV115(res.error,res.status)).toBe("sem_permissao");expect(parseLeituraV115(res.data)).toBeNull();return null;}
    const parsed=parseLeituraV115(res.data);expect(parsed?.competencia).toMatchObject({id,id_organizacao:ORG,id_contrato:CONTRACT});
    expect(parsed?.estado_documental).toBe("missing_docs");expect(parsed?.documentos).toEqual([]);expect(parsed?.requisitos[0]).toMatchObject({id:EVENT,atendido:false,obrigatorio:true});
    expect(parsed?.capacidades.pode_enviar).toBe(actor==="master");
    return {scope:parsed?.competencia.id,state:parsed?.estado_documental,documentCount:parsed?.documentos_total};
  }
  if(c.destination==="V116"){
    const res=await obterAnaliseCompetencia(id,FILTROS_VAZIOS,OFFSETS_ZERO,signal);
    expect(m.rpc).toHaveBeenLastCalledWith(c.consumer,expect.objectContaining({p_id_competencia:id,p_resultados_offset:0,p_execucoes_offset:0,p_apontamentos_offset:0}));
    if(negative){expect(classificarErroV116(res.error,res.status)).toBe("sem_permissao");expect(parseAnaliseV116(res.data)).toBeNull();return null;}
    const parsed=parseAnaliseV116(res.data);expect(parsed?.competencia).toMatchObject({id,competencia_referencia:REF});
    expect(parsed?.estado_analise).toBe("not_analyzed");expect(parsed?.execucao_atual).toBeNull();
    return {scope:parsed?.competencia.id,state:parsed?.estado_analise,execution:parsed?.execucao_atual};
  }
  if(c.destination==="V123"){
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const read=obterEventosAuditoria({idOrganizacao:ORG,pagina:0,correlationId:CORR});
    if(negative){await expect(read).rejects.toThrow("Acesso não autorizado");return null;}
    const data=await read;expect(data.total).toBe(1);expect(data.eventos[0]).toMatchObject({id:EVENT,id_entidade:id,correlation_id:CORR,evento:"criar_competencia"});
    return {eventId:data.eventos[0].id,entity:data.eventos[0].id_entidade,correlation:data.eventos[0].correlation_id};
  }
  const read=c.destination==="V118"?listarPareceres(id,ORG,CONTRACT,0,signal):listarApresentacoes(id,ORG,CONTRACT,0,signal);
  if(negative){await expect(read).rejects.toMatchObject({tipo:"sem_permissao"});return null;}
  const page=await read;expect(page.itens).toEqual([]);expect(page.total).toBe(0);
  expect(calls.at(-1)?.filters).toEqual([["id_competencia",id],["id_organizacao",ORG],["id_contrato",CONTRACT]]);
  return {scope:id,empty:true,count:page.total};
}
describe("V113 -> consumers of newly created competence",()=>{
  beforeEach(()=>{
    stored=null;event=null;actor="master";calls.length=0;sessionStorage.clear();
    m.rpc.mockReset();m.from.mockReset();m.getUser.mockReset();
    m.getUser.mockImplementation(async()=>({data:{user:{id:actor}},error:null}));
    m.rpc.mockImplementation((name:string,args:Record<string,unknown>)=>{
      const promise=Promise.resolve().then(()=>rpc(name,args));
      return Object.assign(promise,{abortSignal:()=>promise});
    });
    m.from.mockImplementation((table:string)=>{
      const call={table,filters:[] as unknown[][]};calls.push(call);
      const b:Record<string,unknown>={};
      for(const method of ["select","order","range","abortSignal"])b[method]=()=>b;
      b.eq=(...args:unknown[])=>{call.filters.push(args);return b;};
      b.maybeSingle=()=>Promise.resolve().then(()=>tableResponse(call,true));
      b.then=(resolve:(v:unknown)=>unknown,reject:(e:unknown)=>unknown)=>Promise.resolve().then(()=>tableResponse(call,false)).then(resolve,reject);
      return b;
    });
  });
  afterEach(cleanup);
  for(const c of cases){
    it(c.caseId+" positive: mutation, scoped readback, and actual consumer",async()=>{
      const id=await produce();
      let witness:unknown=null;
      for(const role of c.reader?["master","leitor"]:["master"]){
        actor=role;witness=await consume(c,id,false);expect(witness).not.toBeNull();
      }
      expect(m.rpc.mock.calls.filter(([name])=>name==="criar_competencia")).toHaveLength(1);
      observations.push({caseId:c.caseId,consumer:c.consumer,producerOrder:14,kind:"positive",testId:SOURCE+":"+c.caseId+":positive",state:"EXECUTED",assertion:"PASS",organizationId:ORG,producerEntityId:id,
        network:{method:c.method,status:200,[c.method==="GET"?"table":"rpc"]:c.consumer,fixture:true},readback:{matched:true,destination:c.destination,contractId:CONTRACT,competenceId:id,reference:REF,roles:c.reader?2:1,witness}});
    });
    it(c.caseId+" negative: denied mutation and denied consumer preserve the created entity",async()=>{
      const id=await produce();
      actor="leitor";
      await expect(criarCompetencia(CONTRACT,MONTH)).rejects.toMatchObject({tipo:"sem_permissao"});
      actor=c.reader?"outsider":"leitor";
      expect(await consume(c,id,true)).toBeNull();
      actor="master";
      expect(await verificarCompetenciaExistente(CONTRACT,MONTH)).toBe(id);
      expect(await verificarCompetenciaExistente(FOREIGN,MONTH)).toBeNull();
      observations.push({caseId:c.caseId,consumer:c.consumer,producerOrder:14,kind:"negative",testId:SOURCE+":"+c.caseId+":negative",state:"EXECUTED",assertion:"PASS",organizationId:ORG,producerEntityId:id,
        network:{method:c.method,status:403,[c.method==="GET"?"table":"rpc"]:c.consumer,fixture:true},readback:{outcome:"DENY",destination:c.destination,contractId:CONTRACT,competenceId:id,reference:REF,mutationDenied:true,entityPreserved:true}});
    });
  }
  afterAll(()=>{const path=process.env.F3_CODE_V113_OBSERVATIONS;if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations)+"\n",{flag:"wx"});}});
});

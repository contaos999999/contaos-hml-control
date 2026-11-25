/**
 * F4 CODE: real SYS01 list, SYS04 selection and cache, SYS05 rendering,
 * ADM01 update and independent readback. Only transport and navigation host
 * are substituted; unrelated registration dialogs are outside these cases.
 */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { writeFileSync } from "node:fs";
import type { ReactNode } from "react";
const m = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn(), signOut: vi.fn(), nav: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: m.rpc, from: vi.fn(), auth: { getUser: m.getUser, signOut: m.signOut } },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => <a href={to} {...props}>{children}</a>,
}));
vi.mock("@/components/cadastros/GerenciarCadastro", () => ({ GerenciarCadastro: () => null }));
vi.mock("@/components/organizacao/CriarOrganizacaoForm", () => ({ CriarOrganizacaoForm: () => null }));
import { OrganizationSelector, MENSAGENS_SYS04 } from "@/components/organizacao/OrganizationSelector";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import { listarOrganizacoesDisponiveis, resolverDestinoPosLogin } from "@/lib/auth/resolverDestinoPosLogin";
import { definirPreferenciaOrganizacao, obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarUsuarios, salvarVinculo } from "@/lib/administracao/admUsuariosRpc";
import type { PayloadSalvar } from "@/lib/administracao/admUsuariosRpc";
const A = "a1111111-1111-4111-8111-111111111111";
const B = "a2222222-2222-4222-8222-222222222222";
const U = "a3333333-3333-4333-8333-333333333333";
const LINK = "a4444444-4444-4444-8444-444444444444";
const KEY = "a5555555-5555-4555-8555-555555555555";
const STALE = "b5555555-5555-4555-8555-555555555555";
const DASH = "obter_resumo_dashboard";
const LIST = "listar_organizacoes_disponiveis";
const key = (org: string) => ["sys05", "resumo", U, org];
const org = (id: string) => ({ id, razao_social: id===A?"Alfa":"Beta", nome_fantasia: null, cnpj: null, situacao: "ativa", perfil: "leitor" });
const ok = (data: unknown) => ({ data: structuredClone(data), error: null, status: 200 });
const fail = (code: string, status: number) => ({ data: null, error: { code }, status });
const dash = (id: string, count: number) => ({
  schema_versao: "sys05-v1", gerado_em: "25/11/2026 00:00",
  organizacao: { id, razao_social: id===A?"Alfa":"Beta", nome_fantasia: null, situacao: "ativa" },
  resumo: { contratos_visiveis: count, contratos_ativos: 2, competencias_em_fluxo: 1, competencias_exigem_atencao: 4, itens_com_prazo_vencido: 5, atencoes_abertas: 6 },
  contratos_por_situacao: [], competencias_por_situacao: [], proximos_prazos: [], atencoes_prioritarias: [],
});
const observations: Record<string, unknown>[] = [];
let orgs: string[], actor: string, linked: boolean, version: number, delayed: Promise<unknown> | null;
let qc: QueryClient;
const clients: QueryClient[] = [];
function client() { const c = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(c); return c; }
function mount(node: ReactNode, c = qc) { return render(<QueryClientProvider client={c}>{node}</QueryClientProvider>); }
function observe(caseId: string, kind: string, readback: unknown) { observations.push({ caseId, kind, mode: "CODE_FIXTURE", readback }); }
function payload(v: number, active: boolean): PayloadSalvar { return { p_id_organizacao: A, p_id_usuario: U, p_email: null, p_perfil: "leitor", p_escopo_todos_contratos: true, p_ativo: active, p_ids_contratos_ativar: [], p_ids_contratos_revogar: [], p_versao_esperada: v }; }
const binding = () => ({ id: LINK, perfil: "leitor", ativo: linked, escopo_todos_contratos: true, versao_registro: version });
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear();
  orgs = [A,B]; actor = U; linked = true; version = 1; delayed = null; qc = client();
  m.getUser.mockImplementation(async () => ({ data: { user: { id: actor } }, error: null }));
  m.signOut.mockResolvedValue({ error: null });
  m.rpc.mockImplementation(async (name: string, a: Record<string, unknown> = {}) => {
    if (name===LIST) return ok(linked?orgs.map(org):[]);
    if (name===DASH) {
      const id = String(a.p_id_organizacao);
      if (!linked || !orgs.includes(id)) return fail("42501",403);
      if (id===A && delayed) return delayed;
      return ok(dash(id,id===A?31:72));
    }
    if (name==="listar_usuarios_vinculos_adm") {
      if(actor!=="master"||a.p_id_organizacao!==A)return fail("42501",403);
      return ok({ schema_versao:"adm01-v2", pagina:1,tamanho_pagina:25,total:1,total_paginas:1,itens:[{id_usuario:U,vinculo:binding()}],perfis_disponiveis:[] });
    }
    if(name==="salvar_vinculo_usuario_adm"){
      if(actor!=="master"||a.p_id_organizacao!==A||a.p_id_usuario!==U)return fail("42501",403);
      if(a.p_versao_esperada!==version)return fail("PT409",409);
      linked=a.p_ativo===true;version++;
      return ok({schema_versao:"adm01-v2",correlation_id:a.p_chave_idempotencia,id_usuario:U,vinculo:binding()});
    }
    throw Error("unexpected "+name);
  });
});
afterEach(()=>{cleanup();for(const c of clients)c.clear();clients.length=0;});
async function choose(id: string) {
  const view = mount(<OrganizationSelector />);
  fireEvent.click(await screen.findByRole("radio", {name:id===A?/Alfa/:/Beta/}));
  fireEvent.click(screen.getByRole("button",{name:"Continuar"}));
  await waitFor(()=>expect(m.nav).toHaveBeenCalledWith({to:"/"}));
  expect(obterPreferenciaOrganizacao(U)).toBe(id);
  view.unmount();
}
async function show(id: string, count: number, c=qc) {
  const view=mount(<Dashboard />,c);
  expect(await screen.findByRole("region",{name:"Indicadores de resumo"})).toBeTruthy();
  expect(screen.getByText(String(count))).toBeTruthy();
  expect(m.rpc).toHaveBeenCalledWith(DASH,{p_id_organizacao:id});
  return view;
}
async function readBinding() {
  actor="master";
  const r=await listarUsuarios(A,{pagina:1,busca:null,ativo:null});
  expect(r.itens).toHaveLength(1);
  expect(r.itens[0]?.id_usuario).toBe(U);
  return r.itens[0]!.vinculo;
}
describe("F4 material context synchronization",()=>{
  it("IFV1-F4-C0036 positive: refresh list and actual selector after scope changes",async()=>{
    orgs=[A];expect(resolverDestinoPosLogin(await listarOrganizacoesDisponiveis())).toEqual({tipo:"rota",rota:"/"});
    definirPreferenciaOrganizacao(U,A);orgs=[B];
    const list=await listarOrganizacoesDisponiveis();expect(list.map(x=>x.id)).toEqual([B]);
    const v=mount(<OrganizationSelector/>);
    expect(await screen.findByRole("radio",{name:/Beta/})).toBeTruthy();
    expect(screen.queryByRole("radio",{name:/Alfa/})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Continuar"}));
    await waitFor(()=>expect(obterPreferenciaOrganizacao(U)).toBe(B));v.unmount();
    observe("IFV1-F4-C0036","positive",{before:[A],after:list.map(x=>x.id),selected:B});
  });
  it("IFV1-F4-C0036 negative: revoked list does not allow stale preference",async()=>{
    orgs=[A];expect((await listarOrganizacoesDisponiveis())[0]?.id).toBe(A);definirPreferenciaOrganizacao(U,A);
    orgs=[];expect(resolverDestinoPosLogin(await listarOrganizacoesDisponiveis())).toEqual({tipo:"sem-acesso"});
    mount(<OrganizationSelector/>);expect(await screen.findByText(MENSAGENS_SYS04.vazio)).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();expect(screen.queryByRole("button",{name:"Continuar"})).toBeNull();expect(m.nav).not.toHaveBeenCalled();
    observe("IFV1-F4-C0036","negative",{before:[A],after:[],navigation:false});
  });
  it("IFV1-F4-C0037 positive: fresh login list leads to fresh dashboard",async()=>{
    orgs=[A];expect((await listarOrganizacoesDisponiveis()).map(x=>x.id)).toEqual([A]);
    await choose(A);const old=await show(A,31);old.unmount();
    orgs=[B];expect((await listarOrganizacoesDisponiveis()).map(x=>x.id)).toEqual([B]);
    m.nav.mockClear();qc=client();await choose(B);
    await show(B,72,client());expect(screen.queryByText("31")).toBeNull();
    observe("IFV1-F4-C0037","positive",{before:A,after:B,oldKpi:31,newKpi:72});
  });
  it("IFV1-F4-C0037 negative: no available org and revoked stale dashboard",async()=>{
    orgs=[A];expect((await listarOrganizacoesDisponiveis())[0]?.id).toBe(A);definirPreferenciaOrganizacao(U,A);
    const old=await show(A,31);old.unmount();orgs=[];
    expect(resolverDestinoPosLogin(await listarOrganizacoesDisponiveis())).toEqual({tipo:"sem-acesso"});
    mount(<Dashboard/>,client());expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();
    expect(screen.queryByRole("region",{name:"Indicadores de resumo"})).toBeNull();expect(screen.queryByText("31")).toBeNull();
    observe("IFV1-F4-C0037","negative",{revoked:A,available:0,dashboard:"DENIED",oldKpiHidden:true});
  });
  it("IFV1-F4-C0043 positive: actual switch clears cache and reads B",async()=>{
    definirPreferenciaOrganizacao(U,A);const old=await show(A,31);old.unmount();
    expect(qc.getQueryData(key(A))).toMatchObject({resumo:{contratos_visiveis:31}});
    await choose(B);expect(qc.getQueryData(key(A))).toBeUndefined();
    await show(B,72);expect(screen.queryByText("31")).toBeNull();
    expect(qc.getQueryData(key(B))).toMatchObject({resumo:{contratos_visiveis:72}});
    observe("IFV1-F4-C0043","positive",{before:A,after:B,oldCacheRemoved:true,newKpi:72});
  });
  it("IFV1-F4-C0043 negative: late A response cannot replace B",async()=>{
    definirPreferenciaOrganizacao(U,A);
    let release!: (x:unknown)=>void;delayed=new Promise(r=>{release=r;});
    const old=mount(<Dashboard/>);await waitFor(()=>expect(m.rpc).toHaveBeenCalledWith(DASH,{p_id_organizacao:A}));old.unmount();
    await choose(B);await show(B,72);
    await act(async()=>{release(ok(dash(A,31)));await delayed;});
    expect(screen.getByText("72")).toBeTruthy();expect(screen.queryByText("31")).toBeNull();expect(qc.getQueryData(key(A))).toBeUndefined();
    observe("IFV1-F4-C0043","negative",{lateOrg:A,selected:B,newKpi:72,oldCacheAbsent:true});
  });
  it("IFV1-F4-C0005 positive: versioned activation refreshes real dashboard",async()=>{
    linked=false;definirPreferenciaOrganizacao(U,A);
    const old=mount(<Dashboard/>);expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();old.unmount();
    const before=await readBinding();expect(before).toMatchObject({ativo:false,versao_registro:1});
    await salvarVinculo(payload(before.versao_registro,true),KEY,"salvarEdicao");
    const after=await readBinding();expect(after).toMatchObject({id:LINK,ativo:true,versao_registro:2});
    actor=U;await show(A,31,client());
    observe("IFV1-F4-C0005","positive",{before,after,kpi:31});
  });
  it("IFV1-F4-C0005 negative: stale activation cannot restore dashboard after revoke",async()=>{
    definirPreferenciaOrganizacao(U,A);const old=await show(A,31);old.unmount();
    const before=await readBinding();await salvarVinculo(payload(before.versao_registro,false),KEY,"salvarEdicao");
    const after=await readBinding();expect(after).toMatchObject({ativo:false,versao_registro:2});
    await expect(salvarVinculo(payload(1,true),STALE,"salvarEdicao")).rejects.toMatchObject({tipo:"conflito"});
    expect(await readBinding()).toEqual(after);
    actor=U;mount(<Dashboard/>,client());expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();expect(screen.queryByText("31")).toBeNull();
    observe("IFV1-F4-C0005","negative",{before,after,conflict:"PT409",dashboard:"DENIED"});
  });
});
afterAll(()=>{const p=process.env.F4_CODE_CONTEXT_OBSERVATIONS;if(p){expect(observations).toHaveLength(8);writeFileSync(p,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}});

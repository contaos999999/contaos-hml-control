/** Contract create/update, product adapters and screen-specific permission/navigation contracts. */
import { beforeEach, afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), getUser: vi.fn(), nav: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: m.rpc, from: m.from, auth: { getUser: m.getUser } },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
import {
  inserirContrato,
  montarPayloadContrato,
  validarFormularioContrato,
  buscarOpcoesContratantes,
} from "@/lib/contratos/novoContratoDados";
import {
  obterCadastro,
  montarComando,
  executarComando,
  type ContextoCadastro,
  CAMPOS_CADASTRO,
} from "@/lib/cadastros/cadastroOperacionalDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import {
  consultarPermissoesEfetivas,
  temPermissao,
  resolverContextoRbac,
} from "@/lib/administracao/rbacRpc";
import { menuContextualV1 } from "@/lib/navegacao/menuV1";
import { consultarCapacidadeCriarCompetencia } from "@/lib/contratos/novaCompetenciaDados";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
const ORG = "c0700000-0000-4000-8000-000000000001";
const ID = "c0700000-0000-4000-8000-000000000002";
const PARTY = "c0700000-0000-4000-8000-000000000003";
const EVENT = "c0700000-0000-4000-8000-000000000004";
const REQ = "c0700000-0000-4000-8000-000000000005";
const STATUS_REQ = "c0700000-0000-4000-8000-000000000006";
const FOREIGN = "c0700000-0000-4000-8000-000000000007";
const DATE = "2026-11-01T12:00:00Z";
const cases = [
  {
    caseId: "IFV1-F4-C0132",
    order: 7,
    destination: "SYS05",
    consumer: "obter_resumo_dashboard",
    method: "POST",
    resource: null,
    action: null,
    route: null,
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0136",
    order: 7,
    destination: "V104",
    consumer: "contratos",
    method: "GET",
    resource: null,
    action: null,
    route: null,
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0139",
    order: 7,
    destination: "V106",
    consumer: "contratos",
    method: "GET",
    resource: null,
    action: null,
    route: null,
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0140",
    order: 7,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    resource: null,
    action: null,
    route: null,
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0146",
    order: 8,
    destination: "SYS05",
    consumer: "obter_resumo_dashboard",
    method: "POST",
    resource: null,
    action: null,
    route: null,
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0153",
    order: 8,
    destination: "V107",
    consumer: "contratos",
    method: "GET",
    resource: "normativos",
    action: "consultar",
    route: "base-normativa",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0156",
    order: 8,
    destination: "V108",
    consumer: "contratos",
    method: "GET",
    resource: "orcamentos",
    action: "consultar",
    route: "orcamento",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0159",
    order: 8,
    destination: "V109",
    consumer: "contratos",
    method: "GET",
    resource: "listas",
    action: "consultar",
    route: "regras",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0162",
    order: 8,
    destination: "V110",
    consumer: "contratos",
    method: "GET",
    resource: "documentos_contrato",
    action: "consultar",
    route: "documentos",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0165",
    order: 8,
    destination: "V111",
    consumer: "contratos",
    method: "GET",
    resource: "documentos_contrato",
    action: "consultar",
    route: "documentos",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0167",
    order: 8,
    destination: "V112",
    consumer: "contratos",
    method: "GET",
    resource: "competencias",
    action: "consultar",
    route: "competencias",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0170",
    order: 8,
    destination: "V113",
    consumer: "contratos",
    method: "GET",
    resource: "competencias",
    action: "criar",
    route: "competencias/nova",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0172",
    order: 8,
    destination: "V121",
    consumer: "contratos",
    method: "GET",
    resource: "historico",
    action: "consultar",
    route: "historico",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0174",
    order: 8,
    destination: "V122",
    consumer: "contratos",
    method: "GET",
    resource: "historico",
    action: "criar",
    route: "historico/importar",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0176",
    order: 8,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    resource: null,
    action: null,
    route: null,
    reader: false,
  },
];
type Case = (typeof cases)[number];
const form = {
  numero: "F4-105",
  objeto: "Objeto F4 original",
  idContratante: PARTY,
  inicio: "2026-01-01",
  fim: "2027-01-01",
  valorGlobal: "100,00",
  valorMensal: "",
  tipoContrato: "gestao",
  unidadeVinculada: "",
  fonteRecurso: "",
};
const EDIT = "Objeto F4 revisado";
const EDIT2 = "Objeto F4 revisão final";
const REQ2 = "c0700000-0000-4000-8000-000000000008";
const STALE = "c0700000-0000-4000-8000-000000000009";
const TRANSPORT = "c0700000-0000-4000-8000-000000000010";
const replay = new Map<string,{payload:string,response:unknown}>();
let transportFailure = false;
let actor = "master",
  contract: Record<string, unknown> | null = null,
  writes = 0,
  statusWrites = 0;
let events: Record<string, unknown>[] = [];
const observations: Record<string, unknown>[] = [];
const calls: Array<{ table: string; filters: unknown[][]; insert?: unknown }> = [];
const ctx: ContextoCadastro = {
  idUsuario: "master",
  idOrganizacao: ORG,
  entidade: "contratos",
  id: ID,
};
const ok = (data: unknown, count = 0) => ({ data: structuredClone(data), error: null, status: 200, count });
const deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
function record(name: string, request: string) {
  events.push({
    id: request === REQ ? EVENT : request,
    criado_em: DATE,
    evento: name==="contratos.insert"?name:"CadastroOperacionalAtualizado",
    entidade: "contratos",
    origem: "rpc",
    id_usuario: null,
    id_entidade: ID,
    correlation_id: request,
  });
}
function row(payload: Record<string, unknown>, status: string) {
  return {
    ...Object.fromEntries(CAMPOS_CADASTRO.contratos.map((f) => [f.nome, null])),
    ...payload,
    id: ID,
    id_organizacao: ORG,
    id_contratante: PARTY,
    situacao: status,
    versao_registro: 1,
    periodicidade: "mensal",
    criticidade: "baixa",
    contratante: { razao_social: "Contratante F4", nome_fantasia: null, documento: null },
  };
}
function cadastro(request?: unknown) {
  return {
    schema_versao: "crud-cadastro-v1",
    entidade: "contratos",
    registro: contract,
    pode_editar: actor === "master",
    transicoes: actor === "master" ? [{ situacao: "ativo", rotulo: "Ativar" }] : [],
    exclusao_permitida: false,
    motivo_retencao: "Histórico preservado",
    ...(request ? { request_id: request, evento_id: request === REQ ? EVENT : request } : {}),
  };
}
function rpc(name: string, args: Record<string, unknown> = {}) {
  if (name === "listar_organizacoes_disponiveis")
    return ok(
      actor === "outsider"
        ? []
        : [
            {
              id: ORG,
              razao_social: "Organização F4",
              nome_fantasia: null,
              cnpj: null,
              situacao: "ativa",
              perfil: actor === "master" ? "administrador_master" : "leitor",
            },
          ],
    );
  if (name === "consultar_permissoes_efetivas") {
    if (actor === "outsider" || args["p_id_organizacao"] !== ORG || args["p_id_contrato"] !== ID)
      return deny();
    const read = [
      "contratos",
      "normativos",
      "orcamentos",
      "listas",
      "documentos_contrato",
      "competencias",
      "historico",
    ].map((recurso) => ({ recurso, acao: "consultar" }));
    return ok({
      schema_versao: "rbac-v1",
      versao: 6,
      master: actor === "master",
      permissoes: [
        ...read,
        ...(actor === "master"
          ? [
              { recurso: "competencias", acao: "criar" },
              { recurso: "historico", acao: "criar" },
              { recurso: "historico", acao: "processar" },
            ]
          : []),
      ],
    });
  }
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args["p_id_organizacao"] === ORG);
  if (name === "obter_resumo_dashboard") {
    if (actor === "outsider" || args["p_id_organizacao"] !== ORG) return deny();
    return ok({
      schema_versao: "sys05-v1",
      gerado_em: "01/11/2026 12:00",
      organizacao: {
        id: ORG,
        razao_social: "Organização F4",
        nome_fantasia: null,
        situacao: "ativa",
      },
      resumo: {
        contratos_visiveis: contract ? 1 : 0,
        contratos_ativos: contract?.["situacao"] === "ativo" ? 1 : 0,
        competencias_em_fluxo: 0,
        competencias_exigem_atencao: 0,
        itens_com_prazo_vencido: 0,
        atencoes_abertas: 0,
      },
      contratos_por_situacao: contract ? [{ situacao: contract["situacao"], quantidade: 1 }] : [],
      competencias_por_situacao: [],
      proximos_prazos: [],
      atencoes_prioritarias: [],
    });
  }
  if (name === "obter_cadastro_operacional_v1") {
    if (
      actor === "outsider" ||
      args["p_id_organizacao"] !== ORG ||
      args["p_id"] !== ID ||
      !contract
    )
      return deny();
    return ok(cadastro());
  }
  if (["atualizar_contrato_v1", "alterar_situacao_contrato_v1"].includes(name)) {
    if (
      actor !== "master" ||
      args["p_id_organizacao"] !== ORG ||
      args["p_id_contrato"] !== ID ||
      !contract
    )
      return deny();
    if (transportFailure) throw Error("synthetic pre-write transport outage");
    const request = String(args["p_request_id"]);
    const payload = JSON.stringify({name,args});
    const prior = replay.get(request);
    if(prior) return prior.payload===payload ? ok(prior.response) : {data:null,error:{code:"PT409"},status:409};
    if (args["p_versao_esperada"] !== contract["versao_registro"])
      return { data: null, error: { code: "PT409" }, status: 409 };
    if (name === "atualizar_contrato_v1") {
      contract = {
        ...contract,
        ...(args["p_alteracoes"] as object),
        versao_registro: Number(contract["versao_registro"]) + 1,
      };
      writes++;
    } else {
      contract = {
        ...contract,
        situacao: args["p_situacao"],
        versao_registro: Number(contract["versao_registro"]) + 1,
      };
      statusWrites++;
    }
    record(name, request);
    const result = structuredClone(cadastro(request));
    replay.set(request,{payload,response:result});
    return ok(result);
  }
  throw new Error("unexpected RPC " + name);
}
function data(call: (typeof calls)[number], single: boolean) {
  const has = (k: string, v: string) =>
    call.filters.some(([key, value]) => key === k && value === v);
  if (actor === "outsider") return deny();
  if (call.table === "contratos" && call.insert) {
    if(transportFailure)throw Error("synthetic pre-insert transport outage");
    const payload = call.insert as Record<string, unknown>;
    if (
      actor !== "master" ||
      payload["id_organizacao"] !== ORG ||
      payload["id_contratante"] !== PARTY
    )
      return deny();
    if (contract) throw new Error("duplicate contract");
    contract = row(payload, "ativo");
    writes++;
    record("contratos.insert", REQ);
    return ok(null);
  }
  if (call.table === "contratos") {
    if (single) {
      if (!has("id", ID)) return deny();
      return ok(contract);
    }
    if (!has("id_organizacao", ORG)) return deny();
    return ok(contract ? [contract] : [], contract ? 1 : 0);
  }
  if (call.table === "contratantes") {
    if (!has("id_organizacao", ORG)) return deny();
    return ok(
      [
        {
          id: PARTY,
          razao_social: "Contratante F4",
          nome_fantasia: null,
          documento: null,
          situacao: "ativo",
        },
      ],
      1,
    );
  }
  if (call.table === "eventos_auditoria") {
    if (actor !== "master" || !has("id_organizacao", ORG)) return deny();
    const selected = events.filter((e) => !call.filters.some(([k])=>k==="correlation_id")||has("correlation_id",String(e["correlation_id"])));
    return ok(selected, selected.length);
  }
  throw new Error("unexpected table " + call.table);
}
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  definirPreferenciaOrganizacao(actor, ORG);
  return render(
    <QueryClientProvider client={client}>
      <Dashboard />
    </QueryClientProvider>,
  );
}
async function dashboard(visible: number, active: number, status: string | null) {
  const view = mount();
  for (const [label, value] of [
    ["Contratos visíveis", visible],
    ["Contratos ativos", active],
  ] as const) {
    const kpi = await screen.findByText(label);
    expect(kpi.closest("dt")?.parentElement?.querySelector("dd")?.textContent).toBe(String(value));
  }
  if (status)
    expect(
      within(screen.getByRole("region", { name: "Contratos por situação" })).getByText(status),
    ).toBeTruthy();
  view.unmount();
}
async function detail() {
  const v = await obterContrato(ID);
  expect(v).toMatchObject({ id: ID, id_organizacao: ORG, id_contratante: PARTY });
  expect(calls.at(-1)?.filters).toEqual([["id", ID]]);
  return v;
}
async function createContract(c: Case) {
  actor="master";
  expect((await listarContratos({idOrganizacao:ORG,pagina:1})).total).toBe(0);
  if(c.destination==="SYS05")await dashboard(0,0,null);
  const options=await buscarOpcoesContratantes({idOrganizacao:ORG,busca:"",pagina:1});
  expect(options.itens[0]?.id).toBe(PARTY);
  expect(validarFormularioContrato(form)).toEqual([]);
  const payload=montarPayloadContrato(ORG,form);
  await inserirContrato(payload);
  expect(calls.at(-1)?.insert).toEqual(payload);
  const saved=await obterCadastro(ctx);
  expect(saved.registro).toMatchObject({id:ID,id_organizacao:ORG,id_contratante:PARTY,versao_registro:1});
  expect((await detail()).objeto).toBe(form.objeto);
  return saved;
}
async function editVersion(value:string,request:string){
  const before=await obterCadastro(ctx);
  const cmd=montarComando(ctx,before.registro.versao_registro,"editar",{objeto:value},"Revisão material F4",request);
  const receipt=await executarComando(ctx,cmd);
  expect(m.rpc).toHaveBeenLastCalledWith(cmd.nome,cmd.args);
  const after=await obterCadastro(ctx);
  expect(after.registro).toEqual(receipt.registro);
  expect(after.registro).not.toBe(receipt.registro);
  expect(after.registro).toMatchObject({id:ID,id_organizacao:ORG,id_contratante:PARTY,objeto:value,versao_registro:before.registro.versao_registro+1});
  expect((await detail()).objeto).toBe(value);
  return {before,cmd,receipt,after};
}
async function material(c:Case){
  actor="master";
  if(c.order===7)return {initial:await createContract(c),steps:null};
  contract=row(montarPayloadContrato(ORG,form),"rascunho");
  if(c.destination==="SYS05")await dashboard(1,0,"rascunho");
  const first=await editVersion(EDIT,REQ);
  const second=await editVersion(EDIT2,REQ2);
  expect(second.before.registro).toEqual(first.after.registro);
  expect(second.after.registro.versao_registro).toBe(3);
  const expectedEvents=events.length;
  expect(await executarComando(ctx,first.cmd)).toEqual(first.receipt);
  expect(events).toHaveLength(expectedEvents);
  expect((await obterCadastro(ctx)).registro).toEqual(second.after.registro);
  if(c.destination==="SYS05"){
    const cmd=montarComando(ctx,3,"situacao",{situacao:"ativo"},"Ativação material F4",STATUS_REQ);
    const receipt=await executarComando(ctx,cmd);
    const latest=await obterCadastro(ctx);
    expect(latest.registro).toEqual(receipt.registro);
    expect(latest.registro).toMatchObject({situacao:"ativo",versao_registro:4});
    expect(statusWrites).toBe(1);
    await dashboard(1,1,"ativo");
  }
  return {initial:first.before,steps:{first,second}};
}
async function screenAccess(c: Case) {
  if (!c.route || !c.resource || !c.action) throw new Error("missing route contract");
  const route = "/contratos/" + ID + "/" + c.route;
  const context = await resolverContextoRbac(route, ORG);
  expect(context.contrato).toBe(ID);
  const perm = await consultarPermissoesEfetivas(ORG, context.contrato);
  const allowed = temPermissao(perm.permissoes, c.resource, c.action);
  if (c.destination === "V113")
    expect(await consultarCapacidadeCriarCompetencia(ORG, ID)).toBe(allowed);
  if (c.destination === "V122") {
    const orgs = await listarOrganizacoesDisponiveis();
    expect(orgs.some((o) => o.id === ORG && o.situacao === "ativa")).toBe(true);
    expect(menuContextualV1(context, perm.permissoes).some((i) => i.destino === route)).toBe(
      allowed,
    );
  } else
    expect(
      menuContextualV1(context, perm.permissoes).some(
        (i) => i.destino === route && i.recurso === c.resource && i.acao === c.action,
      ),
    ).toBe(allowed);
  return { allowed, route };
}
async function consume(c: Case, negative: boolean) {
  if (c.destination === "SYS05") {
    if (negative) {
      const view = mount();
      expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();
      expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
      view.unmount();
      return null;
    }
    await dashboard(1, 1, "ativo");
    return { visible: 1, active: 1, group: "ativo", statusWrites };
  }
  if (c.destination === "V123") {
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const p = obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0 });
    if (negative) {
      await expect(p).rejects.toThrow("Acesso não autorizado");
      return null;
    }
    const a = await p;
    expect(a.total).toBe(c.order===7?1:2);
    expect(a.eventos.map(e=>e.evento)).toEqual(c.order===7?["contratos.insert"]:["CadastroOperacionalAtualizado","CadastroOperacionalAtualizado"]);
    expect(new Set(a.eventos.map(e=>e.id)).size).toBe(a.total);
    expect(a.eventos.every(e=>e.id_entidade===ID)).toBe(true);
    return a;
  }
  let route: string | null = null;
  if (c.route) {
    if (!negative || !c.reader) {
      const gate = await screenAccess(c);
      expect(gate.allowed).toBe(!negative);
      route = gate.route;
    }
    if (negative && !c.reader) {
      actor = "outsider";
    }
  }
  if (c.destination === "V104") {
    const list = listarContratos({ idOrganizacao: ORG, pagina: 1 });
    if (negative) {
      await expect(list).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const page = await list;
    expect(page.total).toBe(1);
    expect(page.itens[0]!.id).toBe(ID);
  }
  if (negative) {
    await expect(obterContrato(ID)).rejects.toMatchObject({ tipo: "negado" });
    return null;
  }
  const v = await detail();
  expect(v.objeto).toBe(c.order === 7 ? form.objeto : EDIT2);
  return {
    id: v.id,
    party: v.id_contratante,
    organization: v.id_organizacao,
    object: v.objeto,
    route,
  };
}
describe("F4.2 contract persistence, version evolution, replay and consumer readback", () => {
  beforeEach(() => {
    actor = "master";
    contract = null;
    writes = 0;
    statusWrites = 0;
    events = [];
    replay.clear();
    transportFailure=false;
    calls.length = 0;
    sessionStorage.clear();
    m.rpc.mockReset();
    m.from.mockReset();
    m.getUser.mockReset();
    m.getUser.mockImplementation(async () => ({ data: { user: { id: actor } }, error: null }));
    m.rpc.mockImplementation((name: string, args: Record<string, unknown>) =>
      Promise.resolve().then(() => rpc(name, args)),
    );
    m.from.mockImplementation((table: string) => {
      const call: { table: string; filters: unknown[][]; insert?: unknown } = {
        table,
        filters: [],
      };
      calls.push(call);
      const b: Record<string, unknown> = {};
      for (const n of ["select", "order", "range", "abortSignal"]) b[n] = () => b;
      b["eq"] = (...args: unknown[]) => {
        call.filters.push(args);
        return b;
      };
      b["insert"] = (payload: unknown) => {
        call.insert = payload;
        return b;
      };
      b["maybeSingle"] = () => Promise.resolve().then(() => data(call, true));
      b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => data(call, false))
          .then(res, rej);
      return b;
    });
  });
  afterEach(cleanup);
  for(const c of cases){
    const snapshot=async()=>{
      const cadastro=await obterCadastro(ctx);
      const list=await listarContratos({idOrganizacao:ORG,pagina:1});
      expect(list.itens).toHaveLength(1);
      expect(list.itens[0]).toMatchObject({id:ID,id_organizacao:ORG,id_contratante:PARTY});
      const row=await detail();
      expect(row.objeto).toBe(cadastro.registro["objeto"]);
      const audit=await obterEventosAuditoria({idOrganizacao:ORG,pagina:0});
      expect(audit.total).toBe(events.length);
      expect(new Set(audit.eventos.map(e=>e.id)).size).toBe(events.length);
      return {cadastro:cadastro.registro,list,row,audit};
    };
    it(c.caseId+" positive: two versioned updates and fresh consumer persistence",async()=>{
      const progress=await material(c);
      const saved=await snapshot();
      const witnesses=[];
      for(const role of c.reader?["master","leitor"]:["master"]){
        actor=role;
        const witness=await consume(c,false);
        expect(witness).not.toBeNull();
        witnesses.push({role,witness});
      }
      expect(writes).toBe(c.order===7?1:2);
      observations.push({caseId:c.caseId,kind:"positive",mode:"CODE_FIXTURE",readback:{progress,saved,witnesses,writes,statusWrites}});
    });
    it(c.caseId+" negative: stale request, failed transport and cross-scope rejection preserve state",async()=>{
      actor="master";
      if(c.order===7){
        transportFailure=true;
        await expect(inserirContrato(montarPayloadContrato(ORG,form))).rejects.toMatchObject({tipo:"erro"});
        transportFailure=false;
        expect((await listarContratos({idOrganizacao:ORG,pagina:1})).total).toBe(0);
      }
      const progress=await material(c);
      const before=await snapshot();
      const eventCount=events.length;
      const writeCount=writes;
      if(progress.steps){
        const stale=montarComando(ctx,1,"editar",{objeto:"Stale"},"Revisão obsoleta",STALE);
        await expect(executarComando(ctx,stale)).rejects.toMatchObject({tipo:"conflito"});
        const mismatched=montarComando(ctx,1,"editar",{objeto:"Outro conteúdo"},"Chave reutilizada",REQ);
        await expect(executarComando(ctx,mismatched)).rejects.toMatchObject({tipo:"conflito"});
        transportFailure=true;
        const cmd=montarComando(ctx,before.cadastro.versao_registro,"editar",{objeto:"Não persistido"},"Falha de transporte",TRANSPORT);
        await expect(executarComando(ctx,cmd)).rejects.toBeTruthy();
        transportFailure=false;
        expect(await snapshot()).toEqual(before);
      }
      actor="leitor";
      if(c.order===7)await expect(inserirContrato(montarPayloadContrato(ORG,form))).rejects.toMatchObject({tipo:"negado"});
      else {
        const cmd=montarComando(ctx,before.cadastro.versao_registro,"editar",{objeto:"Negado"},"Ação negada",FOREIGN);
        await expect(executarComando(ctx,cmd)).rejects.toMatchObject({tipo:"negado"});
        if(progress.steps)await expect(executarComando(ctx,progress.steps.first.cmd)).rejects.toMatchObject({tipo:"negado"});
      }
      actor=c.reader?"outsider":"leitor";
      expect(await consume(c,true)).toBeNull();
      actor="master";
      const after=await snapshot();
      expect(after).toEqual(before);
      expect(writes).toBe(writeCount);expect(events).toHaveLength(eventCount);
      expect(await consume(c,false)).not.toBeNull();
      observations.push({caseId:c.caseId,kind:"negative",mode:"CODE_FIXTURE",readback:{before,after,transportRejected:true,denied:true,staleRejected:!!progress.steps,events:eventCount,writes,statusWrites}});
    });
  }
  afterAll(()=>{
    const path=process.env["F4_CODE_CONTRACT_OBSERVATIONS"];
    if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}
  });
});

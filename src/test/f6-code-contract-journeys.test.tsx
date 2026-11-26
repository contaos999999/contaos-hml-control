import {
  A as identityBase,
  evidenceStep as step,
  journeyRecorder,
} from "./f6-code-journey-fixture";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import {
  executarComando,
  montarComando,
  obterCadastro,
  type ContextoCadastro,
} from "@/lib/cadastros/cadastroOperacionalDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import { listarFontes } from "@/lib/contratos/baseNormativaDados";
import { FILTROS_COMPETENCIA_VAZIOS, listarCompetencias } from "@/lib/contratos/competenciasDados";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterDocumento, listarVersoes } from "@/lib/contratos/documentoDetalheDados";
import { FILTROS_VAZIOS, listarDocumentos } from "@/lib/contratos/documentosDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import { consultarCapacidadeCriarCompetencia } from "@/lib/contratos/novaCompetenciaDados";
import {
  buscarOpcoesContratantes,
  inserirContrato,
  montarPayloadContrato,
} from "@/lib/contratos/novoContratoDados";
import { listarPropostas } from "@/lib/contratos/orcamentoDados";
import { listarListas } from "@/lib/contratos/regrasDados";
import { verificarAcessoOrganizacao } from "@/lib/contratantes/contratantesDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const boundary = vi.hoisted(() => ({ fetch: vi.fn(), nav: vi.fn(), session: "", actor: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient("https://f6-fixture.invalid", "fixture-key", {
    accessToken: async () => boundary.session,
    global: { fetch: (input, init) => boundary.fetch(input, init) },
  });
  return {
    supabase: {
      from: client.from.bind(client),
      rpc: client.rpc.bind(client),
      auth: { getUser: async () => ({ data: { user: { id: boundary.actor } }, error: null }) },
    },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => boundary.nav,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

const key = (side: string, offset: number) =>
  side + "5210000-0000-4000-8000-" + String(offset).padStart(12, "0");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  session: "fixture-contract-" + side + "-" + role,
  contract: key(side, 1),
  party: key(side, 2),
  event: key(side, 3),
  correlation: key(side, 4),
  request: key(side, 5),
  linked: key(side, 6),
  version: key(side, 7),
  file: key(side, 8),
  competence: key(side, 9),
  label: "Contrato sintético " + side.toUpperCase(),
});
const aOrg = "a1111111-1111-4111-8111-111111111111";
const bOrg = "a2222222-2222-4222-8222-222222222222";
const aUser = "a3333333-3333-4333-8333-333333333333";
const bUser = "b3333333-3333-4333-8333-333333333333";
const A = scope("a", aOrg, aUser, "administrador");
const B = scope("b", bOrg, bUser, "leitor");
const writerB = scope("b", bOrg, bUser, "gestor_contrato");
type Scope = typeof A;
type Filters = Record<string, string>;
type Exchange = {
  method: "GET" | "POST";
  path: string;
  filters?: Filters;
  body?: Record<string, unknown>;
  status: number;
  data: unknown;
  commit?: () => void;
  readback?: () => unknown;
};
const queue: Exchange[] = [];
const observed: Exchange[] = [];
const date = "2026-10-20T12:00:00Z";
const deny = { code: "42501", message: "Escopo não autorizado" };
const foreignKey = { code: "23503", message: "contratos_contratante_org_fk" };
const get = (path: string, filters: Filters, data: unknown[]): Exchange => ({
  method: "GET",
  path,
  filters,
  status: 200,
  data,
});
const post = (
  path: string,
  body: Record<string, unknown>,
  data: unknown,
  status = 200,
): Exchange => ({
  method: "POST",
  path,
  body,
  status,
  data,
});
const rpc = (name: string, body: Record<string, unknown>, data: unknown, status = 200) =>
  post("rpc/" + name, body, data, status);
const org = (s: Scope) => ({ id_organizacao: "eq." + s.org });
const linkedContract = (s: Scope) => ({ id_contrato: "eq." + s.contract });
let query: QueryClient;

beforeEach(() => {
  queue.length = 0;
  observed.length = 0;
  sessionStorage.clear();
  query = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  boundary.fetch.mockReset().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const step = queue.shift();
    if (!step) throw new Error("Unexpected synthetic request");
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f6-fixture.invalid");
    expect(url.pathname).toBe("/rest/v1/" + step.path);
    expect(init?.method).toBe(step.method);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer " + boundary.session);
    const filters = Object.fromEntries(
      [...url.searchParams].filter(
        ([field]) => !["select", "order", "offset", "limit"].includes(field),
      ),
    );
    expect(filters).toEqual(step.filters ?? {});
    expect(init?.body ? JSON.parse(String(init.body)) : undefined).toEqual(step.body);
    step.commit?.();
    const currentData = step.readback ? step.readback() : step.data;
    observed.push(step);
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(currentData)) {
      headers.set("content-range", currentData.length ? "0-0/" + currentData.length : "*/0");
    }
    return new Response(step.data === null ? null : JSON.stringify(currentData), {
      status: step.status,
      headers,
    });
  });
});
afterEach(() => {
  cleanup();
  query.clear();
  expect(queue).toHaveLength(0);
  expect(boundary.fetch).toHaveBeenCalledTimes(observed.length);
});
function use(s: Scope, ...steps: Exchange[]) {
  expect(queue).toHaveLength(0);
  boundary.session = s.session;
  boundary.actor = s.actor;
  queue.push(...steps);
}

const cases = [
  ["0132", "V105", "SYS05", "obter_resumo_dashboard"],
  ["0136", "V105", "V104", "contratos"],
  ["0139", "V105", "V106", "contratos"],
  ["0140", "V105", "V123", "eventos_auditoria"],
  ["0146", "V106", "SYS05", "obter_resumo_dashboard"],
  ["0153", "V106", "V107", "contratos"],
  ["0156", "V106", "V108", "contratos"],
  ["0159", "V106", "V109", "contratos"],
  ["0162", "V106", "V110", "contratos"],
  ["0165", "V106", "V111", "contratos"],
  ["0167", "V106", "V112", "contratos"],
  ["0170", "V106", "V113", "contratos"],
  ["0172", "V106", "V121", "contratos"],
  ["0174", "V106", "V122", "contratos"],
  ["0176", "V106", "V123", "eventos_auditoria"],
] as const;
type ContractCase = (typeof cases)[number];
const contract = (s: Scope, version = 1, situation = "ativo", change = false) => ({
  id: s.contract,
  id_organizacao: s.org,
  versao_registro: version,
  numero: "F6.2-" + s.contract.slice(0, 1),
  objeto: s.label + (change ? " atualizado" : ""),
  situacao: situation,
  criticidade: "baixa",
  inicio: "2026-10-01",
  fim: null,
  tipo_contrato: null,
  unidade_vinculada: null,
  fonte_recurso: null,
  valor_global: null,
  valor_mensal_referencia: null,
  periodicidade: "mensal",
  prazo_prestacao_dias: null,
  dia_limite_apresentacao: null,
});
type Contract = ReturnType<typeof contract>;
const partyName = (s: Scope) => "Contratante " + s.party.slice(0, 1).toUpperCase();
const listRow = (r: Contract) => ({
  id: r.id,
  id_organizacao: r.id_organizacao,
  numero: r.numero,
  objeto: r.objeto,
  situacao: r.situacao,
  criticidade: r.criticidade,
  inicio: r.inicio,
  fim: r.fim,
  valor_global: r.valor_global,
});
const detail = (s: Scope, r: Contract) => ({
  ...listRow(r),
  id_contratante: s.party,
  tipo_contrato: r.tipo_contrato,
  unidade_vinculada: r.unidade_vinculada,
  fonte_recurso: r.fonte_recurso,
  valor_mensal_referencia: r.valor_mensal_referencia,
  periodicidade: r.periodicidade,
  prazo_prestacao_dias: r.prazo_prestacao_dias,
  dia_limite_apresentacao: r.dia_limite_apresentacao,
  contratante: { razao_social: partyName(s), nome_fantasia: null, documento: null },
});
const ctx = (s: Scope, user = s.actor): ContextoCadastro => ({
  idUsuario: user,
  idOrganizacao: s.org,
  entidade: "contratos",
  id: s.contract,
});
const list = (s: Scope, r?: Contract) => get("contratos", org(s), r ? [listRow(r)] : []);
const access = (s: Scope, r?: Contract) =>
  get("contratos", { id: "eq." + s.contract }, r ? [detail(s, r)] : []);
const classifier = (s: Scope) =>
  rpc("classificar_acesso_contrato_v106", { p_id_contrato: s.contract }, "negado");
const options = (s: Scope) =>
  get("contratantes", org(s), [
    {
      id: s.party,
      razao_social: partyName(s),
      nome_fantasia: null,
      documento: null,
      situacao: "ativo",
    },
  ]);
const capabilities = (s: Scope, recurso: string, acao: string, allow: boolean, byContract = true) =>
  rpc(
    "consultar_permissoes_efetivas",
    { p_id_organizacao: s.org, p_id_contrato: byContract ? s.contract : null },
    allow
      ? { schema_versao: "rbac-v1", versao: 1, master: false, permissoes: [{ recurso, acao }] }
      : deny,
    allow ? 200 : 403,
  );
const verifyList = async (s: Scope, r?: Contract) => {
  const result = await listarContratos({ idOrganizacao: s.org, pagina: 1 });
  expect(result.itens).toEqual(r ? [listRow(r)] : []);
  expect(result.total).toBe(r ? 1 : 0);
  return result.itens[0]?.id;
};
const verifyDetail = async (s: Scope, r: Contract) => {
  const value = await obterContrato(s.contract);
  expect(value).toEqual(detail(s, r));
  return value;
};
function cadastro(r: Contract, canEdit: boolean) {
  const next =
    r.situacao === "suspenso"
      ? ["ativo", "encerrado", "cancelado"]
      : ["suspenso", "encerrado", "cancelado"];
  return {
    schema_versao: "crud-cadastro-v1",
    entidade: "contratos",
    registro: r,
    pode_editar: canEdit,
    transicoes: canEdit ? next.map((situacao) => ({ situacao, rotulo: situacao })) : [],
    exclusao_permitida: false,
    motivo_retencao: "Cadastro retido para preservar vínculos, histórico e auditoria.",
  };
}
const cadastroRead = (s: Scope, r: Contract) =>
  rpc(
    "obter_cadastro_operacional_v1",
    { p_id_organizacao: s.org, p_entidade: "contratos", p_id: s.contract },
    cadastro(r, s.role !== "leitor"),
  );
const motivo = "Oráculo sintético F6.2";
const producer = (c: ContractCase) =>
  c[1] === "V105"
    ? "contratos"
    : c[0] === "0146"
      ? "rpc/alterar_situacao_contrato_v1"
      : "rpc/atualizar_contrato_v1";
const eventName = (c: ContractCase) =>
  c[1] === "V105" ? "ContratoCriado" : "CadastroOperacionalAtualizado";

function mutation(
  c: ContractCase,
  next: Contract,
  status = 200,
  requestOrg = A,
  relation = A.party,
) {
  if (c[1] === "V105") {
    return post(
      "contratos",
      {
        id_organizacao: requestOrg.org,
        id_contratante: relation,
        numero: next.numero,
        objeto: next.objeto,
        inicio: next.inicio,
      },
      status === 409 ? foreignKey : status === 403 ? deny : null,
      status === 200 ? 201 : status,
    );
  }
  return post(
    producer(c),
    {
      p_id_organizacao: A.org,
      p_id_contrato: A.contract,
      p_versao_esperada: 1,
      p_motivo: motivo,
      p_request_id: A.request,
      ...(c[0] === "0146"
        ? { p_situacao: next.situacao }
        : { p_alteracoes: { objeto: next.objeto } }),
    },
    status === 403 ? deny : { ...cadastro(next, true), request_id: A.request, evento_id: A.event },
    status,
  );
}
async function execute(
  c: ContractCase,
  next: Contract,
  actor: Scope,
  requestOrg = A,
  relation = A.party,
) {
  if (c[1] === "V105") {
    await inserirContrato(
      montarPayloadContrato(requestOrg.org, {
        numero: next.numero + " ",
        objeto: next.objeto + " ",
        idContratante: relation,
        inicio: next.inicio,
        fim: "",
        valorGlobal: "",
        valorMensal: "",
        tipoContrato: "",
        unidadeVinculada: "",
        fonteRecurso: "",
      }),
    );
    return;
  }
  const context = ctx(A, actor.actor);
  const command =
    c[0] === "0146"
      ? montarComando(context, 1, "situacao", { situacao: next.situacao }, motivo, A.request)
      : montarComando(context, 1, "editar", { objeto: next.objeto }, motivo, A.request);
  const response = await executarComando(context, command);
  return response;
}

const subresources = {
  V107: "fontes_normativas",
  V108: "propostas_orcamentarias",
  V109: "listas_verificacao",
  V110: "documentos_contrato",
  V111: "documentos_contrato",
  V112: "competencias",
  V113: "consultar_permissoes_efetivas",
  V121: "apresentacoes_contratante",
  V122: "relatorios_historicos_contratante",
} as const;
type Child = keyof typeof subresources;
function isChild(value: ContractCase[2]): value is Child {
  return Object.hasOwn(subresources, value);
}
const doc = (s: Scope) => ({
  id: s.linked,
  id_organizacao: s.org,
  id_contrato: s.contract,
  titulo: "Documento " + s.label,
  tipo: "contrato",
  versao_atual: 1,
});
function childCalls(child: Child, s: Scope, allowed: boolean): Exchange[] {
  const r = { id: s.linked, id_organizacao: s.org, id_contrato: s.contract };
  const feed = subresources[child];
  const page = (filters: Filters, value: object) =>
    get(feed, filters, allowed ? [{ ...r, ...value }] : []);
  switch (child) {
    case "V107":
      return [
        page(
          { ...org(s), ...linkedContract(s) },
          { titulo: "Norma " + s.label, situacao: "ativa" },
        ),
      ];
    case "V108":
      return [page(linkedContract(s), { titulo: "Orçamento " + s.label, situacao: "rascunho" })];
    case "V109":
      return [
        page(linkedContract(s), { nome: "Lista " + s.label, situacao: "ativa", versao_atual: 1 }),
      ];
    case "V110":
      return [page(linkedContract(s), doc(s))];
    case "V111": {
      const steps = [page({ id: "eq." + s.linked, ...linkedContract(s) }, doc(s))];
      if (allowed)
        steps.push(
          get("versoes_documento", { id_documento_contrato: "eq." + s.linked }, [
            {
              id: s.version,
              id_documento_contrato: s.linked,
              id_arquivo: s.file,
              numero_versao: 1,
            },
          ]),
          get("arquivos", { id: "in.(" + s.file + ")" }, [
            { id: s.file, status_seguranca: "aprovado" },
          ]),
        );
      return steps;
    }
    case "V112":
      return [
        page(linkedContract(s), { competencia_referencia: "2026-10-01", situacao: "rascunho" }),
      ];
    case "V113":
      return [capabilities(s, "competencias", "criar", allowed)];
    case "V121":
      return [
        page(
          { ...org(s), ...linkedContract(s), id_competencia: "eq." + s.competence },
          {
            id_competencia: s.competence,
            id_pacote: s.version,
            protocolo: "F6.2",
            forma_apresentacao: "eletronica",
            apresentado_em: date,
            tipo: "original",
            numero_rodada: 1,
          },
        ),
      ];
    case "V122":
      return [
        page(
          { ...org(s), ...linkedContract(s) },
          {
            id_arquivo: s.file,
            numero_documento: "F6.2",
            tipo: "relatorio",
            origem_temporal: "historico",
            status_processamento: "concluido",
            competencia_referencia: "2026-10-01",
            data_documento: null,
            resultado_geral: null,
            criado_em: date,
          },
        ),
      ];
  }
}
const signal = () => new AbortController().signal;
async function childRead(child: Child, s: Scope, allowed: boolean) {
  switch (child) {
    case "V107":
      return listarFontes({
        org: s.org,
        contrato: s.contract,
        escopo: "contrato",
        situacao: "",
        pagina: 0,
      });
    case "V108":
      return listarPropostas(s.contract, 0, signal());
    case "V109":
      return listarListas(s.contract, 0, signal());
    case "V110":
      return listarDocumentos(s.contract, FILTROS_VAZIOS, 0);
    case "V111": {
      const result = obterDocumento(s.contract, s.linked);
      if (!allowed) {
        await expect(result).rejects.toMatchObject({ tipo: "nao_encontrado" });
        return { total: 0, itens: [] };
      }
      const document = await result;
      expect(document).toMatchObject({ id: s.linked, id_contrato: s.contract });
      const versions = await listarVersoes(document.id, 0, signal());
      expect(versions.itens).toEqual([
        {
          id: s.version,
          id_documento_contrato: s.linked,
          id_arquivo: s.file,
          numero_versao: 1,
        },
      ]);
      expect(versions.arquivos[s.file]?.status_seguranca).toBe("aprovado");
      return { total: 1, itens: [document] };
    }
    case "V112":
      return listarCompetencias(s.contract, FILTROS_COMPETENCIA_VAZIOS, 0);
    case "V113": {
      const capability = await consultarCapacidadeCriarCompetencia(s.org, s.contract);
      expect(capability).toBe(allowed);
      return { total: Number(capability), itens: capability ? [{ id: s.contract }] : [] };
    }
    case "V121":
      return listarApresentacoes(s.competence, s.org, s.contract, 0, signal());
    case "V122":
      return listarRelatoriosHistoricos(s.contract, s.org, 0, signal());
  }
}

const audit = (s: Scope, c: ContractCase) => ({
  id: s.event,
  criado_em: date,
  evento: eventName(c),
  entidade: "contratos",
  origem: "usuario",
  id_usuario: s.actor,
  id_entidade: s.contract,
  correlation_id: s.correlation,
});
const auditCalls = (s: Scope, c: ContractCase, allowed: boolean) => [
  rpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, allowed),
  get(
    "eventos_auditoria",
    {
      ...org(s),
      evento: "eq." + eventName(c),
      entidade: "eq.contratos",
      correlation_id: "eq." + s.correlation,
    },
    allowed ? [audit(s, c)] : [],
  ),
];
async function readAudit(s: Scope, c: ContractCase, allowed: boolean) {
  expect(await podeConsultarAuditoria(s.org)).toBe(allowed);
  const result = await obterEventosAuditoria({
    idOrganizacao: s.org,
    pagina: 0,
    evento: eventName(c),
    entidade: "contratos",
    correlationId: s.correlation,
  });
  expect(result.total).toBe(Number(allowed));
  expect(result.eventos).toEqual(allowed ? [audit(s, c)] : []);
  return result.eventos[0];
}

const dashboardCall = (s: Scope, item?: Contract, denied = false) =>
  rpc(
    "obter_resumo_dashboard",
    { p_id_organizacao: s.org },
    denied
      ? deny
      : {
          schema_versao: "sys05-v1",
          gerado_em: date,
          organizacao: { id: s.org, razao_social: s.label, nome_fantasia: null, situacao: "ativa" },
          resumo: {
            contratos_visiveis: Number(!!item),
            contratos_ativos: Number(item?.situacao === "ativo"),
            competencias_em_fluxo: 0,
            competencias_exigem_atencao: 0,
            itens_com_prazo_vencido: 0,
            atencoes_abertas: 0,
          },
          contratos_por_situacao: item ? [{ situacao: item.situacao, quantidade: 1 }] : [],
          competencias_por_situacao: [],
          proximos_prazos: [],
          atencoes_prioritarias: [],
        },
    denied ? 403 : 200,
  );
const dashKey = (actor: Scope, target: Scope) => ["sys05", "resumo", actor.actor, target.org];
async function showDashboard(actor: Scope, target: Scope, item?: Contract, denied = false) {
  definirPreferenciaOrganizacao(actor.actor, target.org);
  const view = render(
    <QueryClientProvider client={query}>
      <Dashboard />
    </QueryClientProvider>,
  );
  try {
    if (denied) {
      expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_SYS05.negado);
      expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
      expect(query.getQueryData(dashKey(actor, target))).toBeUndefined();
      return undefined;
    }
    const visible = Number(!!item);
    const active = Number(item?.situacao === "ativo");
    await waitFor(() => {
      const kpis = within(screen.getByRole("region", { name: "Indicadores de resumo" }));
      expect(
        kpis.getByText("Contratos visíveis").closest("dt")?.nextElementSibling,
      ).toHaveTextContent(new RegExp("^" + visible + "$"));
      expect(
        kpis.getByText("Contratos ativos").closest("dt")?.nextElementSibling,
      ).toHaveTextContent(new RegExp("^" + active + "$"));
      const table = screen.queryByRole("table", { name: "Contratos por situação" });
      if (item)
        expect(within(table!).getByRole("row", { name: item.situacao + " 1" })).toBeVisible();
      else expect(table).toBeNull();
      expect(query.getQueryData(dashKey(actor, target))).toMatchObject({
        organizacao: { id: target.org },
        resumo: { contratos_visiveis: visible, contratos_ativos: active },
      });
    });
    return { visible, active, group: item?.situacao ?? null };
  } finally {
    view.unmount();
  }
}

function consumerCalls(c: ContractCase, s: Scope, r?: Contract): Exchange[] {
  if (isChild(c[2])) return childCalls(c[2], s, !!r);
  if (c[2] === "SYS05") return [dashboardCall(s, r, !r)];
  if (c[2] === "V104") {
    return [get("organizacoes", { id: "eq." + s.org }, r ? [{ id: s.org }] : []), list(s, r)];
  }
  if (c[2] === "V106") {
    return [
      rpc(
        "obter_cadastro_operacional_v1",
        { p_id_organizacao: s.org, p_entidade: "contratos", p_id: s.contract },
        r
          ? {
              ...cadastro(r, true),
              transicoes: ["ativo", "cancelado"].map((situacao) => ({
                situacao,
                rotulo: situacao,
              })),
            }
          : deny,
        r ? 200 : 403,
      ),
    ];
  }
  return auditCalls(s, c, !!r);
}
async function readConsumer(c: ContractCase, actor: Scope, target: Scope, value?: Contract) {
  if (isChild(c[2])) {
    const data = await childRead(c[2], target, !!value);
    expect(data.total).toBe(Number(!!value));
    const ref = c[2] === "V113" ? target.contract : target.linked;
    expect(data.itens.map((row) => row.id)).toEqual(value ? [ref] : []);
    return { resultId: data.itens[0]?.id, downstream: subresources[c[2]] };
  }
  if (c[2] === "SYS05") {
    const summary = await showDashboard(actor, target, value, !value);
    return { summary, denialRendered: !value };
  }
  if (c[2] === "V104") {
    const access = verificarAcessoOrganizacao(target.org);
    if (value) await expect(access).resolves.toBe(true);
    else await expect(access).rejects.toMatchObject({ tipo: "negado" });
    return { resultId: await verifyList(target, value) };
  }
  if (c[2] === "V106") {
    const result = obterCadastro(ctx(target, actor.actor));
    if (value) {
      const saved = await result;
      expect(saved.registro).toEqual(value);
      return { resultId: saved.registro.id };
    }
    await expect(result).rejects.toMatchObject({ tipo: "negado" });
    return { resultId: undefined };
  }
  const event = await readAudit(target, c, !!value);
  return {
    resultId: event?.id,
    correlationId: event?.correlation_id,
    event: event?.evento,
    eventEntityId: event?.id_entidade,
  };
}

const proofs = journeyRecorder("contracts");
const interruption = {
  code: "XX000",
  message: "Resposta sintética interrompida depois da gravação.",
};
const identity = (s: Scope) => ({ ...identityBase, actor: s.actor, org: s.org, role: s.role });
describe("F6 contract journeys", () => {
  for (const c of cases) {
    const creation = c[1] === "V105";
    const base = creation ? undefined : contract(A);
    const next = creation
      ? contract(A, 1, "rascunho")
      : contract(A, 2, c[0] === "0146" ? "suspenso" : "ativo", c[0] !== "0146");
    const title = "IFV1-F6-C" + c[0];
    it(
      title + " positive: reconciles interrupted write and reloads the scoped contract consumer",
      async () => {
        let persisted = base;
        let writes = 0;
        const child = isChild(c[2]) ? c[2] : undefined;
        const realBefore = {
          registered: !!base,
          version: base?.versao_registro ?? null,
          state: base?.situacao ?? null,
        };
        use(
          A,
          ...(base ? [cadastroRead(A, base)] : [list(A), options(A)]),
          ...(c[2] === "SYS05" ? [dashboardCall(A, base)] : []),
          ...(child ? childCalls(child, A, true) : []),
          {
            ...mutation(c, next, 502),
            data: interruption,
            commit: () => {
              persisted = next;
              writes++;
            },
          },
          { ...access(A, next), readback: () => (persisted ? [detail(A, persisted)] : []) },
        );
        if (base) expect((await obterCadastro(ctx(A))).registro).toEqual(base);
        else {
          await verifyList(A);
          const opts = await buscarOpcoesContratantes({
            idOrganizacao: A.org,
            pagina: 1,
            busca: "",
          });
          expect(opts.itens.map((x) => x.id)).toEqual([A.party]);
        }
        if (c[2] === "SYS05") await showDashboard(A, A, base);
        const linkedBefore = child ? await childRead(child, A, true) : undefined;
        await expect(execute(c, next, A)).rejects.toThrow();
        const failure = observed.at(-1)!;
        expect(failure).toMatchObject({
          method: "POST",
          path: producer(c),
          status: 502,
          data: interruption,
        });
        const restored = await verifyDetail(A, next);
        expect(restored.id).toBe(A.contract);
        use(A, ...(!creation ? [mutation(c, next)] : []), ...consumerCalls(c, A, next));
        if (!creation) {
          const sameCommand = await execute(c, next, A);
          expect(sameCommand).toMatchObject({
            registro: next,
            request_id: A.request,
            evento_id: A.event,
          });
        }
        const result = await readConsumer(c, A, A, next);
        if (linkedBefore) expect(linkedBefore.itens.map((p) => p.id)).toContain(result.resultId);
        if (c[0] === "0176") expect(result.resultId).toBe(A.event);
        query.clear();
        use(A, ...consumerCalls(c, A, next));
        const reload = await readConsumer(c, A, A, next);
        expect(reload).toEqual(result);
        expect(writes).toBe(1);
        const end = {
          ...reload,
          contract: restored.id,
          organization: restored.id_organizacao,
          version: next.versao_registro,
        };
        proofs.record("C" + c[0], "positive", identity(A), {
          preconditions: realBefore,
          steps: [
            step("precondition", realBefore),
            step("producer", {
              status: failure.status,
              contract: restored.id,
              request: creation ? null : A.request,
            }),
            step("consumer", { ...result, linkedParty: restored.id_contratante }),
            step("recovery", end),
          ],
          observed: end,
          postconditions: { writes, status: restored.situacao },
          recoveryProof: end,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(
      title + " negative: refuses crossed scope or link and reloads the unchanged contract",
      async () => {
        const association = c[0] === "0136";
        const actor = association ? writerB : B;
        const own = contract(actor);
        const crossed = { ...next, numero: "F6.2 associação alheia" };
        use(
          actor,
          access(actor, own),
          ...(association
            ? [options(actor), capabilities(actor, "contratos", "criar", true, false)]
            : []),
          association ? mutation(c, crossed, 409, actor) : mutation(c, next, 403),
          access(A),
          classifier(A),
          ...consumerCalls(c, A),
          access(actor, own),
          ...(association ? [list(actor, own)] : []),
          ...(c[2] === "SYS05" ? [dashboardCall(actor, own)] : []),
        );
        const before = await verifyDetail(actor, own);
        if (association) {
          const options = await buscarOpcoesContratantes({
            idOrganizacao: actor.org,
            pagina: 1,
            busca: "",
          });
          expect(options.itens.map((x) => x.id)).toEqual([actor.party]);
          const allowed = await consultarPermissoesEfetivas(actor.org, null);
          expect(temPermissao(allowed.permissoes, "contratos", "criar")).toBe(true);
          await expect(execute(c, crossed, actor, actor)).rejects.toMatchObject({
            tipo: "invalido",
          });
        } else await expect(execute(c, next, actor)).rejects.toMatchObject({ tipo: "negado" });
        await expect(obterContrato(A.contract)).rejects.toMatchObject({ tipo: "negado" });
        const hidden = await readConsumer(c, actor, A);
        expect(hidden.resultId).toBeUndefined();
        expect(hidden.summary).toBeUndefined();
        const preserved = await verifyDetail(actor, own);
        expect(preserved).toEqual(before);
        if (association) expect(await verifyList(actor, own)).toBe(own.id);
        if (c[2] === "SYS05") await showDashboard(actor, actor, own);
        const writes = observed.filter((x) => x.method === "POST" && x.path === producer(c));
        expect(writes).toHaveLength(1);
        const [refusal] = writes;
        const code = association ? "23503" : "42501";
        expect(refusal).toMatchObject({ status: association ? 409 : 403, data: { code } });
        use(A, ...(base ? [cadastroRead(A, base)] : [list(A)]));
        if (base) expect((await obterCadastro(ctx(A))).registro).toEqual(base);
        else expect(await verifyList(A)).toBeUndefined();
        const end = {
          id: preserved.id,
          organization: preserved.id_organizacao,
          party: preserved.id_contratante,
        };
        proofs.record("C" + c[0], "negative", identity(actor), {
          preconditions: { ...before },
          steps: [
            step("precondition", { ...before }),
            step("producer", { status: refusal!.status, code }),
            step("consumer", { hidden: true }),
            step("recovery", end),
          ],
          observed: { status: refusal!.status, code, isolation: association },
          postconditions: { unchanged: true, own: end },
          recoveryProof: end,
          cleanupStatus: "CLEAN",
          negativeProof: association
            ? { decision: "ISOLATED", effects: 0, disclosed: false }
            : { decision: "DENIED", status: 403, code: "42501", effects: 0, disclosed: false },
        });
      },
    );
  }
});
afterAll(proofs.write);

/** ADM01 membership, scoped permission consumers and audit readback in CODE_FIXTURE. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import {
  listarUsuarios,
  podeConsultarAuditoria,
  salvarVinculo,
  type PayloadSalvar,
} from "@/lib/administracao/admUsuariosRpc";
import {
  consultarPermissoesEfetivas,
  resolverContextoRbac,
  temPermissao,
} from "@/lib/administracao/rbacRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  listarOrganizacoesDisponiveis,
  resolverDestinoPosLogin,
} from "@/lib/auth/resolverDestinoPosLogin";

const boundary = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: boundary }));
const uid = (key: "a" | "b", slot: number) =>
  `${key}9000000-0000-4000-8000-${String(slot).padStart(12, "0")}`;
const scope = (key: "a" | "b", org: string, actor: string) => ({
  org,
  actor,
  contract: uid(key, 1),
  party: uid(key, 2),
  competence: uid(key, 3),
  document: uid(key, 4),
  presentation: uid(key, 5),
  link: uid(key, 6),
  event: uid(key, 7),
  correlation: uid(key, 8),
  label: key.toUpperCase() + "-F5",
});
const A = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
);
const B = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
);
type Scope = typeof A;
type Profile = "leitor" | "gestor_contrato" | "administrador";
type Route = (s: Scope) => string;
type AdmCase = {
  id: string;
  resource: string;
  action: string;
  role: Profile;
  route: Route;
};
const base =
  (p: string): Route =>
  () =>
    p;
const contract =
  (suffix = ""): Route =>
  (s) =>
    `/contratos/${s.contract}${suffix}`;
const comp =
  (suffix = ""): Route =>
  (s) =>
    `/competencias/${s.competence}${suffix}`;
const readRole = "leitor";
const changeRole = "gestor_contrato";
const cases: AdmCase[] = [
  { id: "0002", resource: "organizacoes", action: "consultar", role: readRole, route: base("/") },
  {
    id: "0007",
    resource: "contratantes",
    action: "consultar",
    role: readRole,
    route: base("/contratantes"),
  },
  {
    id: "0009",
    resource: "contratantes",
    action: "criar",
    role: changeRole,
    route: base("/contratantes/novo"),
  },
  {
    id: "0011",
    resource: "contratantes",
    action: "editar",
    role: changeRole,
    route: (s) => `/contratantes/${s.party}/editar`,
  },
  {
    id: "0012",
    resource: "contratos",
    action: "consultar",
    role: readRole,
    route: base("/contratos"),
  },
  {
    id: "0014",
    resource: "contratos",
    action: "criar",
    role: changeRole,
    route: base("/contratos/novo"),
  },
  { id: "0016", resource: "contratos", action: "consultar", role: readRole, route: contract() },
  {
    id: "0017",
    resource: "normativos",
    action: "consultar",
    role: readRole,
    route: contract("/base-normativa"),
  },
  {
    id: "0018",
    resource: "orcamentos",
    action: "consultar",
    role: readRole,
    route: contract("/orcamento"),
  },
  {
    id: "0019",
    resource: "listas",
    action: "consultar",
    role: readRole,
    route: contract("/regras"),
  },
  {
    id: "0020",
    resource: "documentos_contrato",
    action: "consultar",
    role: readRole,
    route: contract("/documentos"),
  },
  {
    id: "0021",
    resource: "documentos_contrato",
    action: "consultar",
    role: readRole,
    route: (s) => contract("/documentos/" + s.document)(s),
  },
  {
    id: "0022",
    resource: "competencias",
    action: "consultar",
    role: readRole,
    route: contract("/competencias"),
  },
  {
    id: "0023",
    resource: "competencias",
    action: "criar",
    role: changeRole,
    route: contract("/competencias/nova"),
  },
  { id: "0024", resource: "competencias", action: "consultar", role: readRole, route: comp() },
  {
    id: "0025",
    resource: "documentos_competencia",
    action: "consultar",
    role: readRole,
    route: comp("/documentos"),
  },
  {
    id: "0026",
    resource: "analises",
    action: "consultar",
    role: readRole,
    route: comp("/analise"),
  },
  {
    id: "0027",
    resource: "analises",
    action: "consultar",
    role: readRole,
    route: comp("/analise"),
  },
  {
    id: "0028",
    resource: "pareceres",
    action: "consultar",
    role: readRole,
    route: comp("/parecer"),
  },
  {
    id: "0029",
    resource: "apresentacoes",
    action: "consultar",
    role: readRole,
    route: comp("/apresentar"),
  },
  {
    id: "0030",
    resource: "apresentacoes",
    action: "consultar",
    role: readRole,
    route: (s) => comp("/apresentacoes/" + s.presentation)(s),
  },
  {
    id: "0031",
    resource: "historico",
    action: "consultar",
    role: readRole,
    route: contract("/historico"),
  },
  {
    id: "0032",
    resource: "historico",
    action: "processar",
    role: changeRole,
    route: contract("/historico"),
  },
  {
    id: "0033",
    resource: "auditoria",
    action: "consultar",
    role: "administrador",
    route: base("/administracao/auditoria"),
  },
  {
    id: "0034",
    resource: "auditoria",
    action: "consultar",
    role: "administrador",
    route: base("/administracao/auditoria"),
  },
];

const OK = (data: unknown, count = 1) => ({ data, error: null, status: 200, count });
const DENY = { data: null, error: { code: "42501" }, status: 403, count: 0 };
const DATE = "2026-08-01T12:00:00Z";
const rbac = "consultar_permissoes_efetivas";
const listOrgs = "listar_organizacoes_disponiveis";
const save = "salvar_vinculo_usuario_adm";
const list = "listar_usuarios_vinculos_adm";
const key = "f5-1-adm01-escopo";
const eventName = "VinculoUsuarioAdministrativoSalvo";
const rpcResults: Array<{ name: string; status: number; code: string | null }> = [];
const organization = (s: Scope, perfil: string) => ({
  id: s.org,
  razao_social: s.label,
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil,
});
const bound = (s: Scope, perfil: Profile, ativo: boolean, versao: number, all: boolean) => ({
  id: s.link,
  perfil,
  ativo,
  escopo_todos_contratos: all,
  versao_registro: versao,
  inicio_em: null,
  fim_em: null,
  atualizado_em: DATE,
});
const page = (s: Scope, p: ReturnType<typeof bound>) => ({
  schema_versao: "adm01-v2",
  pagina: 1,
  tamanho_pagina: 25,
  total: 1,
  total_paginas: 1,
  itens: [
    {
      id_usuario: s.actor,
      nome: null,
      email: null,
      telefone: null,
      situacao_usuario: "ativo",
      vinculo: p,
    },
  ],
  perfis_disponiveis: [],
});
const requestList = (s: Scope) => ({
  p_id_organizacao: s.org,
  p_pagina: 1,
  p_tamanho_pagina: 25,
  p_busca: null,
  p_ativo: null,
});
const requestRbac = (org: string, contractId: string | null) => ({
  p_id_organizacao: org,
  p_id_contrato: contractId,
});
const bindingPayload = (s: Scope, profile: Profile, contractId: string | null): PayloadSalvar => ({
  p_id_organizacao: s.org,
  p_id_usuario: s.actor,
  p_email: null,
  p_perfil: profile,
  p_escopo_todos_contratos: contractId === null,
  p_ativo: true,
  p_ids_contratos_ativar: contractId ? [contractId] : [],
  p_ids_contratos_revogar: [],
  p_versao_esperada: 1,
});

function nextRpc(
  name: string,
  args: Record<string, unknown>,
  response: ReturnType<typeof OK> | typeof DENY,
) {
  boundary.rpc.mockImplementationOnce(
    async (received: string, actual: Record<string, unknown> = {}) => {
      expect(received).toBe(name);
      expect(actual).toEqual(args);
      rpcResults.push({
        name: received,
        status: response.status,
        code: response.error?.code ?? null,
      });
      return structuredClone(response);
    },
  );
}
type Filters = Array<[string, unknown]>;
function nextTable(
  name: string,
  expected: Filters,
  response: ReturnType<typeof OK> | typeof DENY,
  single: boolean,
) {
  boundary.from.mockImplementationOnce((table: string) => {
    expect(table).toBe(name);
    const filters: Filters = [];
    const respond = (actual: boolean) => {
      expect(actual).toBe(single);
      expect(filters).toEqual(expected);
      return structuredClone(response);
    };
    const query = {
      select: () => query,
      order: () => query,
      range: () => query,
      eq: (...filter: Filters[number]) => {
        filters.push(filter);
        return query;
      },
      maybeSingle: async () => respond(true),
      then: (resolve: (r: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => respond(false))
          .then(resolve, reject),
    };
    return query;
  });
}

function contractOfRoute(c: AdmCase, s: Scope): string | null {
  const route = c.route(s);
  return route.startsWith("/competencias/") || route.startsWith("/contratos/" + s.contract)
    ? s.contract
    : null;
}
function expectScopeQuery(c: AdmCase, resource: Scope, tenant: Scope) {
  if (!c.route(resource).startsWith("/competencias/")) return;
  const data = resource.org === tenant.org ? { id_contrato: tenant.contract } : null;
  nextTable(
    "competencias",
    [
      ["id", resource.competence],
      ["id_organizacao", tenant.org],
    ],
    OK(data),
    true,
  );
}
function frontier(c: AdmCase) {
  if (c.id === "0002") return listOrgs;
  return c.id === "0033" ? "eventos_auditoria" : rbac;
}

async function grant(c: AdmCase) {
  const contractId = contractOfRoute(c, A);
  const input = bindingPayload(A, c.role, contractId);
  const before = bound(A, c.role, false, 1, contractId === null);
  const after = bound(A, c.role, true, 2, contractId === null);
  nextRpc(list, requestList(A), OK(page(A, before)));
  nextRpc(
    save,
    { ...input, p_chave_idempotencia: key },
    OK({
      schema_versao: "adm01-v2",
      correlation_id: A.correlation,
      id_usuario: A.actor,
      vinculo: after,
    }),
  );
  nextRpc(list, requestList(A), OK(page(A, after)));
  const getMembership = () => listarUsuarios(A.org, { pagina: 1, busca: null, ativo: null });
  const old = await getMembership();
  expect(old.itens[0]?.vinculo).toEqual(before);
  const result = await salvarVinculo(
    { ...input, p_versao_esperada: old.itens[0]!.vinculo.versao_registro },
    key,
    "salvarEdicao",
  );
  expect(result).toMatchObject({
    correlation_id: A.correlation,
    id_usuario: A.actor,
    vinculo: after,
  });
  const current = await getMembership();
  expect(current.itens.map(({ id_usuario, vinculo }) => ({ id_usuario, vinculo }))).toEqual([
    { id_usuario: A.actor, vinculo: after },
  ]);
  return result;
}

const observations: Record<string, unknown>[] = [];
function observe(c: AdmCase, kind: "positive" | "negative", readback: Record<string, unknown>) {
  const own = kind === "positive";
  observations.push({
    caseId: "IFV1-F5-C" + c.id,
    kind,
    mode: "CODE_FIXTURE",
    actor: own ? A.actor : B.actor,
    role: own ? c.role : "leitor",
    tenant: own ? A.org : B.org,
    target: A.org,
    frontier: frontier(c),
    operation: c.action,
    resource: c.resource,
    decision: own ? "ALLOW" : c.id === "0002" ? "ISOLATED" : "DENY",
    frontend: process.env["F5_FRONTEND_SHA"] ?? "",
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? "",
    job: process.env["JOB_ID"] ?? "",
    readback,
  });
}
const auditFilter: Filters = [
  ["id_organizacao", A.org],
  ["correlation_id", A.correlation],
];
beforeEach(() => {
  rpcResults.length = 0;
  boundary.rpc.mockReset().mockImplementation(() => {
    throw Error("Unexpected RPC");
  });
  boundary.from.mockReset().mockImplementation(() => {
    throw Error("Unexpected table");
  });
});

describe("F5 ADM01 authorization and isolation", () => {
  for (const c of cases) {
    it(`IFV1-F5-C${c.id} positive: persisted binding is reflected in its authorized consumer`, async () => {
      const saved = await grant(c);
      let materialId = A.link;
      if (c.id === "0002") {
        nextRpc(listOrgs, {}, OK([organization(A, c.role)]));
        const visible = await listarOrganizacoesDisponiveis();
        expect(visible.map(({ id, perfil }) => ({ id, perfil }))).toEqual([
          { id: A.org, perfil: c.role },
        ]);
        expect(resolverDestinoPosLogin(visible)).toEqual({ tipo: "rota", rota: "/" });
        const ownOrganization = visible[0]?.id;
        if (ownOrganization !== A.org) throw Error("Organization material was not returned");
        materialId = ownOrganization;
      } else if (c.id === "0033") {
        const event = {
          id: A.event,
          evento: eventName,
          entidade: "vinculos_usuarios",
          id_entidade: A.link,
          id_usuario: A.actor,
          origem: "usuario",
          criado_em: DATE,
          correlation_id: saved.correlation_id,
        };
        nextTable("eventos_auditoria", auditFilter, OK([event]), false);
        const log = await obterEventosAuditoria({
          idOrganizacao: A.org,
          pagina: 0,
          correlationId: saved.correlation_id,
        });
        expect(log).toEqual({ eventos: [event], total: 1 });
        materialId = log.eventos[0]!.id;
      } else {
        expectScopeQuery(c, A, A);
        const route = c.route(A);
        const context = await resolverContextoRbac(route, A.org);
        expect(context).toEqual({
          contrato: contractOfRoute(c, A),
          competencia: route.startsWith("/competencias/") ? A.competence : null,
          contratante: route.startsWith("/contratantes/" + A.party) ? A.party : null,
        });
        nextRpc(
          rbac,
          requestRbac(A.org, context.contrato),
          OK({
            schema_versao: "rbac-v1",
            versao: 2,
            master: false,
            permissoes: [{ recurso: c.resource, acao: c.action }],
          }),
        );
        const effective = await consultarPermissoesEfetivas(A.org, context.contrato);
        expect(effective).toMatchObject({ versao: 2, master: false });
        expect(temPermissao(effective.permissoes, c.resource, c.action)).toBe(true);
        if (c.id === "0034") {
          nextRpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: A.org }, OK(true));
          expect(await podeConsultarAuditoria(A.org)).toBe(true);
        }
      }
      const foreignVisible = Object.values(B).includes(materialId);
      expect(foreignVisible).toBe(false);
      observe(c, "positive", {
        materialId,
        correlationId: saved.correlation_id,
        bindingVersion: 2,
        foreignVisible,
      });
    });

    it(`IFV1-F5-C${c.id} negative: another tenant cannot grant access or consume the protected result`, async () => {
      const input = bindingPayload(A, c.role, contractOfRoute(c, A));
      nextRpc(
        rbac,
        requestRbac(B.org, null),
        OK({
          schema_versao: "rbac-v1",
          versao: 2,
          master: false,
          permissoes: [{ recurso: "organizacoes", acao: "consultar" }],
        }),
      );
      const own = await consultarPermissoesEfetivas(B.org, null);
      expect(temPermissao(own.permissoes, "organizacoes", "consultar")).toBe(true);
      expect(temPermissao(own.permissoes, "usuarios", "administrar")).toBe(false);
      nextRpc(save, { ...input, p_chave_idempotencia: key }, DENY);
      await expect(salvarVinculo(input, key, "salvarEdicao")).rejects.toMatchObject({
        tipo: "negado",
      });
      let foreignVisible = false;
      if (c.id === "0002") {
        nextRpc(listOrgs, {}, OK([organization(B, "leitor")]));
        const visible = await listarOrganizacoesDisponiveis();
        expect(visible.map(({ id }) => id)).toEqual([B.org]);
        expect(visible.some(({ perfil }) => perfil === "direcao_aprovador")).toBe(false);
        foreignVisible = visible.some(({ id }) => id === A.org);
      } else if (c.id === "0033") {
        nextTable("eventos_auditoria", auditFilter, DENY, false);
        await expect(
          obterEventosAuditoria({ idOrganizacao: A.org, pagina: 0, correlationId: A.correlation }),
        ).rejects.toThrow("Acesso não autorizado à trilha de auditoria.");
      } else {
        if (c.route(A).startsWith("/competencias/")) {
          expectScopeQuery(c, A, B);
          await expect(resolverContextoRbac(c.route(A), B.org)).rejects.toMatchObject({
            tipo: "negado",
          });
        }
        nextRpc(rbac, requestRbac(A.org, contractOfRoute(c, A)), DENY);
        await expect(
          consultarPermissoesEfetivas(A.org, contractOfRoute(c, A)),
        ).rejects.toMatchObject({ tipo: "negado" });
        if (c.id === "0034") {
          nextRpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: B.org }, OK(false));
          expect(await podeConsultarAuditoria(B.org)).toBe(false);
        }
      }
      const refusal = rpcResults.find(({ name }) => name === save);
      expect(refusal).toEqual({ name: save, status: 403, code: "42501" });
      const mutationCount = rpcResults.filter(
        ({ name, code }) => name === save && code === null,
      ).length;
      expect(mutationCount).toBe(0);
      expect(foreignVisible).toBe(false);
      observe(c, "negative", {
        status: refusal?.status,
        code: refusal?.code,
        mutationCount,
        foreignVisible,
      });
    });
  }
});

afterAll(() => {
  const p = process.env["F5_OBSERVATIONS"];
  if (p) {
    expect(observations).toHaveLength(cases.length * 2);
    writeFileSync(p, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

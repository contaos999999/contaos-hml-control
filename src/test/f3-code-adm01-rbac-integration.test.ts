/**
 * ADM01 producer -> shared RBAC consumer, 23 separately asserted CODE contracts.
 * Real product RPC wrappers, permission predicates and navigation functions;
 * only the Supabase boundary is a stateful local fixture, never LIVE evidence.
 */
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const fixture = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: fixture.rpc, from: fixture.from },
}));
import { salvarVinculo, listarUsuarios } from "@/lib/administracao/admUsuariosRpc";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { menuComumPermitido, menuContextualV1 } from "@/lib/navegacao/menuV1";
import {
  listarOrganizacoesDisponiveis,
  resolverDestinoPosLogin,
} from "@/lib/auth/resolverDestinoPosLogin";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";

const ORG = "a1111111-1111-4111-8111-111111111111";
const OTHER = "a2222222-2222-4222-8222-222222222222";
const USER = "a3333333-3333-4333-8333-333333333333";
const LINK = "a4444444-4444-4444-8444-444444444444";
const KEY = "a5555555-5555-4555-8555-555555555555";
const CONTRACT = "a6666666-6666-4666-8666-666666666666";
const COMPETENCE = "a7777777-7777-4777-8777-777777777777";
const CONTRACTOR = "a8888888-8888-4888-8888-888888888888";
const RPC = "consultar_permissoes_efetivas";
const CONSUMER = RPC + " (infraestrutura compartilhada)";
const SOURCE = "src/test/f3-code-adm01-rbac-integration.test.ts";
const matrix = [
  {
    caseId: "IFV1-F3-C0007",
    dest: "V101",
    recurso: "contratantes",
    acao: "consultar",
    route: "/contratantes",
    ctx: "common",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0009",
    dest: "V102",
    recurso: "contratantes",
    acao: "criar",
    route: "/contratantes/novo",
    ctx: "common",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0011",
    dest: "V103",
    recurso: "contratantes",
    acao: "editar",
    route: "/contratantes/{contratante}/editar",
    ctx: "contractor",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0012",
    dest: "V104",
    recurso: "contratos",
    acao: "consultar",
    route: "/contratos",
    ctx: "common",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0014",
    dest: "V105",
    recurso: "contratos",
    acao: "criar",
    route: "/contratos/novo",
    ctx: "common",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0016",
    dest: "V106",
    recurso: "contratos",
    acao: "consultar",
    route: "/contratos/{contrato}",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0017",
    dest: "V107",
    recurso: "normativos",
    acao: "consultar",
    route: "/contratos/{contrato}/base-normativa",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0018",
    dest: "V108",
    recurso: "orcamentos",
    acao: "consultar",
    route: "/contratos/{contrato}/orcamento",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0019",
    dest: "V109",
    recurso: "listas",
    acao: "consultar",
    route: "/contratos/{contrato}/regras",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0020",
    dest: "V110",
    recurso: "documentos_contrato",
    acao: "consultar",
    route: "/contratos/{contrato}/documentos",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0021",
    dest: "V111",
    recurso: "documentos_contrato",
    acao: "consultar",
    route: "/contratos/{contrato}/documentos",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0022",
    dest: "V112",
    recurso: "competencias",
    acao: "consultar",
    route: "/contratos/{contrato}/competencias",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0023",
    dest: "V113",
    recurso: "competencias",
    acao: "criar",
    route: "/contratos/{contrato}/competencias/nova",
    ctx: "contract",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0024",
    dest: "V114",
    recurso: "competencias",
    acao: "consultar",
    route: "/competencias/{competencia}",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0025",
    dest: "V115",
    recurso: "documentos_competencia",
    acao: "consultar",
    route: "/competencias/{competencia}/documentos",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0026",
    dest: "V116",
    recurso: "analises",
    acao: "consultar",
    route: "/competencias/{competencia}/analise",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0027",
    dest: "V117",
    recurso: "analises",
    acao: "consultar",
    route: "/competencias/{competencia}/analise",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0028",
    dest: "V118",
    recurso: "pareceres",
    acao: "consultar",
    route: "/competencias/{competencia}/parecer",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0029",
    dest: "V119",
    recurso: "apresentacoes",
    acao: "consultar",
    route: "/competencias/{competencia}/apresentar",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0030",
    dest: "V120",
    recurso: "apresentacoes",
    acao: "consultar",
    route: "/competencias/{competencia}/apresentar",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0031",
    dest: "V121",
    recurso: "historico",
    acao: "consultar",
    route: "/contratos/{contrato}/historico",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0032",
    dest: "V122",
    recurso: "historico",
    acao: "criar",
    route: "",
    ctx: "guard",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0034",
    dest: "V123",
    recurso: "auditoria",
    acao: "consultar",
    route: "",
    ctx: "guard",
    reader: false,
  },
];
const MASTER = [
  {
    recurso: "organizacoes",
    acao: "consultar",
  },
  {
    recurso: "organizacoes",
    acao: "administrar",
  },
  {
    recurso: "usuarios",
    acao: "consultar",
  },
  {
    recurso: "usuarios",
    acao: "administrar",
  },
  {
    recurso: "auditoria",
    acao: "consultar",
  },
  {
    recurso: "contratantes",
    acao: "consultar",
  },
  {
    recurso: "contratantes",
    acao: "criar",
  },
  {
    recurso: "contratantes",
    acao: "editar",
  },
  {
    recurso: "contratos",
    acao: "consultar",
  },
  {
    recurso: "contratos",
    acao: "criar",
  },
  {
    recurso: "contratos",
    acao: "editar",
  },
  {
    recurso: "orcamentos",
    acao: "consultar",
  },
  {
    recurso: "orcamentos",
    acao: "criar",
  },
  {
    recurso: "orcamentos",
    acao: "editar",
  },
  {
    recurso: "orcamentos",
    acao: "aprovar",
  },
  {
    recurso: "normativos",
    acao: "consultar",
  },
  {
    recurso: "normativos",
    acao: "criar",
  },
  {
    recurso: "normativos",
    acao: "editar",
  },
  {
    recurso: "normativos",
    acao: "aprovar",
  },
  {
    recurso: "listas",
    acao: "consultar",
  },
  {
    recurso: "listas",
    acao: "criar",
  },
  {
    recurso: "listas",
    acao: "editar",
  },
  {
    recurso: "documentos_contrato",
    acao: "consultar",
  },
  {
    recurso: "documentos_contrato",
    acao: "criar",
  },
  {
    recurso: "documentos_contrato",
    acao: "editar",
  },
  {
    recurso: "documentos_competencia",
    acao: "consultar",
  },
  {
    recurso: "documentos_competencia",
    acao: "criar",
  },
  {
    recurso: "documentos_competencia",
    acao: "editar",
  },
  {
    recurso: "competencias",
    acao: "consultar",
  },
  {
    recurso: "competencias",
    acao: "criar",
  },
  {
    recurso: "analises",
    acao: "consultar",
  },
  {
    recurso: "analises",
    acao: "criar",
  },
  {
    recurso: "analises",
    acao: "processar",
  },
  {
    recurso: "analises",
    acao: "editar",
  },
  {
    recurso: "pareceres",
    acao: "consultar",
  },
  {
    recurso: "pareceres",
    acao: "criar",
  },
  {
    recurso: "pareceres",
    acao: "aprovar",
  },
  {
    recurso: "apresentacoes",
    acao: "consultar",
  },
  {
    recurso: "apresentacoes",
    acao: "aprovar",
  },
  {
    recurso: "apresentacoes",
    acao: "apresentar",
  },
  {
    recurso: "historico",
    acao: "consultar",
  },
  {
    recurso: "historico",
    acao: "criar",
  },
  {
    recurso: "historico",
    acao: "editar",
  },
  {
    recurso: "historico",
    acao: "processar",
  },
  {
    recurso: "arquivos",
    acao: "consultar",
  },
  {
    recurso: "arquivos",
    acao: "criar",
  },
  {
    recurso: "arquivos",
    acao: "editar",
  },
  {
    recurso: "dashboard",
    acao: "consultar",
  },
];
const READER = [
  "analises",
  "apresentacoes",
  "arquivos",
  "competencias",
  "contratantes",
  "contratos",
  "dashboard",
  "documentos_competencia",
  "documentos_contrato",
  "historico",
  "listas",
  "normativos",
  "orcamentos",
  "organizacoes",
  "pareceres",
].map((recurso) => ({ recurso, acao: "consultar" }));
let actor: "master" | "leitor" | "outsider" = "master";
let binding:
  | {
      id: string;
      perfil: string;
      ativo: boolean;
      escopo_todos_contratos: boolean;
      versao_registro: number;
    }
  | undefined;
let producerEntityId = "";
let auditEvent: Record<string, unknown> | undefined;
const auditFilters: unknown[][] = [];
const observations: Record<string, unknown>[] = [];
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const deny = () => ({ data: null, error: { code: "42501" }, status: 403 });

function scope(c: (typeof matrix)[number]) {
  const context = {
    contrato: null as string | null,
    competencia: null as string | null,
    contratante: null as string | null,
  };
  if (c.ctx === "contract" || c.ctx === "competence") context.contrato = CONTRACT;
  if (c.ctx === "competence") context.competencia = COMPETENCE;
  if (c.ctx === "contractor") context.contratante = CONTRACTOR;
  return context;
}

function visible(
  c: (typeof matrix)[number],
  permissions: Awaited<ReturnType<typeof consultarPermissoesEfetivas>>,
) {
  const access = temPermissao(permissions.permissoes, c.recurso, c.acao);
  if (c.ctx !== "guard") {
    const ctx = scope(c);
    const menu =
      c.ctx === "common"
        ? menuComumPermitido(permissions.permissoes)
        : menuContextualV1(ctx, permissions.permissoes);
    const path = c.route
      .replace("{contrato}", CONTRACT)
      .replace("{competencia}", COMPETENCE)
      .replace("{contratante}", CONTRACTOR);
    expect(
      menu.some(
        (item) => item.destino === path && item.recurso === c.recurso && item.acao === c.acao,
      ),
    ).toBe(access);
  }
  return access;
}

describe("F3 ADM01 saved binding -> actual shared permission consumer", () => {
  beforeAll(async () => {
    fixture.rpc.mockImplementation(async (name: string, args: Record<string, unknown>) => {
      if (name === "salvar_vinculo_usuario_adm") {
        if (
          actor !== "master" ||
          args["p_id_organizacao"] !== ORG ||
          args["p_id_usuario"] !== USER ||
          args["p_perfil"] !== "leitor"
        )
          return deny();
        binding = {
          id: LINK,
          perfil: "leitor",
          ativo: args["p_ativo"] === true,
          escopo_todos_contratos: args["p_escopo_todos_contratos"] === true,
          versao_registro: 1,
        };
        auditEvent = {
          id: "a9999999-9999-4999-8999-999999999999",
          criado_em: "2026-01-01T12:00:00Z",
          evento: "salvar_vinculo_usuario_adm",
          entidade: "vinculos_usuarios",
          origem: "rpc",
          id_usuario: USER,
          id_entidade: LINK,
          correlation_id: KEY,
        };
        return ok({
          schema_versao: "adm01-v2",
          correlation_id: KEY,
          id_usuario: USER,
          vinculo: binding,
        });
      }
      if (name === "listar_usuarios_vinculos_adm") {
        if (actor !== "master" || args["p_id_organizacao"] !== ORG) return deny();
        return ok({
          schema_versao: "adm01-v2",
          pagina: 1,
          tamanho_pagina: 25,
          total: binding ? 1 : 0,
          total_paginas: 1,
          itens: binding ? [{ id_usuario: USER, vinculo: binding }] : [],
          perfis_disponiveis: [],
        });
      }
      if (name === "listar_organizacoes_disponiveis") {
        const visible = actor === "master" || (actor === "leitor" && binding?.ativo === true);
        return ok(
          visible
            ? [
                {
                  id: ORG,
                  razao_social: "Organização F3",
                  nome_fantasia: null,
                  cnpj: null,
                  situacao: "ativa",
                  perfil: actor === "master" ? "administrador_master" : "leitor",
                },
              ]
            : [],
        );
      }
      if (name === "pode_consultar_auditoria_organizacao")
        return ok(actor === "master" && args["p_id_organizacao"] === ORG);
      if (name === RPC) {
        if (
          args["p_id_organizacao"] !== ORG ||
          (args["p_id_contrato"] !== null && args["p_id_contrato"] !== CONTRACT)
        )
          return deny();
        if (actor === "leitor" && (!binding?.ativo || !binding.escopo_todos_contratos))
          return deny();
        return ok({
          schema_versao: "rbac-v1",
          versao: 6,
          master: actor === "master",
          permissoes: actor === "master" ? MASTER : READER,
        });
      }
      throw new Error("unexpected fixture operation: " + name);
    });
    fixture.from.mockImplementation((table: string) => {
      if (table !== "eventos_auditoria") throw new Error("unexpected table");
      auditFilters.length = 0;
      const q: Record<string, unknown> = {};
      for (const op of ["select", "order", "range"]) q[op] = () => q;
      q["eq"] = (...args: unknown[]) => {
        auditFilters.push(args);
        return q;
      };
      q["then"] = (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) =>
        Promise.resolve()
          .then(() => {
            if (actor !== "master") return deny();
            if (!auditEvent || !auditFilters.some(([k, v]) => k === "id_organizacao" && v === ORG))
              throw new Error("wrong audit scope");
            return { ...ok([auditEvent]), count: 1 };
          })
          .then(resolve, reject);
      return q;
    });
    const receipt = await salvarVinculo(
      {
        p_id_organizacao: ORG,
        p_id_usuario: USER,
        p_email: null,
        p_perfil: "leitor",
        p_escopo_todos_contratos: true,
        p_ativo: true,
        p_ids_contratos_ativar: [],
        p_ids_contratos_revogar: [],
        p_versao_esperada: null,
      },
      KEY,
      "salvarNovo",
    );
    expect(receipt.id_usuario).toBe(USER);
    expect(receipt.vinculo).toMatchObject({ id: LINK, perfil: "leitor", ativo: true });
    const saved = await listarUsuarios(ORG, { pagina: 1, busca: null, ativo: true });
    expect(saved.itens).toHaveLength(1);
    expect(saved.itens[0]).toMatchObject({
      id_usuario: USER,
      vinculo: { id: LINK, perfil: "leitor", ativo: true },
    });
    producerEntityId = saved.itens[0]!.vinculo.id;
    expect(
      fixture.rpc.mock.calls.filter(([name]) => name === "salvar_vinculo_usuario_adm"),
    ).toHaveLength(1);
  });

  for (const c of matrix) {
    it(c.caseId + " positive: master and bound reader consume " + c.dest, async () => {
      const ctx = scope(c);
      actor = "master";
      const master = await consultarPermissoesEfetivas(ORG, ctx.contrato);
      expect(master.master).toBe(true);
      expect(visible(c, master)).toBe(true);
      expect(fixture.rpc).toHaveBeenLastCalledWith(RPC, {
        p_id_organizacao: ORG,
        p_id_contrato: ctx.contrato,
      });
      actor = "leitor";
      const reader = await consultarPermissoesEfetivas(ORG, ctx.contrato);
      expect(reader.master).toBe(false);
      const readerAllowed = visible(c, reader);
      expect(readerAllowed).toBe(c.reader);
      expect(fixture.rpc).toHaveBeenLastCalledWith(RPC, {
        p_id_organizacao: ORG,
        p_id_contrato: ctx.contrato,
      });
      observations.push({
        caseId: c.caseId,
        consumer: CONSUMER,
        producerOrder: 4,
        kind: "positive",
        testId: SOURCE + ":" + c.caseId + ":positive",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
        producerEntityId,
        network: { method: "POST", status: 200, rpc: RPC, fixture: true },
        readback: {
          matched: true,
          screen: c.dest,
          permission: c.recurso + "/" + c.acao,
          masterAllowed: true,
          readerAllowed,
          bindingId: producerEntityId,
          version: reader.versao,
        },
      });
    });
    it(c.caseId + " negative: foreign organization rejects same permission lookup", async () => {
      actor = "leitor";
      const ctx = scope(c);
      await expect(consultarPermissoesEfetivas(OTHER, ctx.contrato)).rejects.toMatchObject({
        tipo: "negado",
      });
      expect(fixture.rpc).toHaveBeenLastCalledWith(RPC, {
        p_id_organizacao: OTHER,
        p_id_contrato: ctx.contrato,
      });
      observations.push({
        caseId: c.caseId,
        consumer: CONSUMER,
        producerOrder: 4,
        kind: "negative",
        testId: SOURCE + ":" + c.caseId + ":negative",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
        producerEntityId,
        network: { method: "POST", status: 403, rpc: RPC, fixture: true },
        readback: {
          outcome: "DENY",
          screen: c.dest,
          permission: c.recurso + "/" + c.acao,
          foreignOrganization: OTHER,
          bindingId: producerEntityId,
        },
      });
    });
  }
  it("IFV1-F3-C0002 positive: saved binding is returned by actual organization list", async () => {
    for (const role of ["master", "leitor"] as const) {
      actor = role;
      const orgs = await listarOrganizacoesDisponiveis();
      expect(orgs).toHaveLength(1);
      expect(orgs[0]).toMatchObject({
        id: ORG,
        perfil: role === "master" ? "administrador_master" : "leitor",
      });
      expect(resolverDestinoPosLogin(orgs)).toEqual({ tipo: "rota", rota: "/" });
      expect(fixture.rpc).toHaveBeenLastCalledWith("listar_organizacoes_disponiveis");
    }
    observations.push({
      caseId: "IFV1-F3-C0002",
      consumer: "listar_organizacoes_disponiveis",
      producerOrder: 4,
      kind: "positive",
      testId: SOURCE + ":IFV1-F3-C0002:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId,
      network: {
        method: "POST",
        status: 200,
        rpc: "listar_organizacoes_disponiveis",
        fixture: true,
      },
      readback: {
        matched: true,
        bindingId: producerEntityId,
        linkedOrgId: ORG,
        route: "/",
        roles: 2,
      },
    });
  });
  it("IFV1-F3-C0002 negative: unbound identity does not see the organization", async () => {
    actor = "outsider";
    const orgs = await listarOrganizacoesDisponiveis();
    expect(orgs).toEqual([]);
    expect(resolverDestinoPosLogin(orgs)).toEqual({ tipo: "sem-acesso" });
    observations.push({
      caseId: "IFV1-F3-C0002",
      consumer: "listar_organizacoes_disponiveis",
      producerOrder: 4,
      kind: "negative",
      testId: SOURCE + ":IFV1-F3-C0002:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId,
      network: {
        method: "POST",
        status: 200,
        rpc: "listar_organizacoes_disponiveis",
        fixture: true,
      },
      readback: {
        outcome: "NO_FOREIGN_DATA",
        bindingId: producerEntityId,
        route: "sem-acesso",
        count: orgs.length,
      },
    });
  });
  it("IFV1-F3-C0033 positive: actual audit reader correlates the saved binding", async () => {
    actor = "master";
    expect(await podeConsultarAuditoria(ORG)).toBe(true);
    const result = await obterEventosAuditoria({
      idOrganizacao: ORG,
      pagina: 0,
      correlationId: KEY,
    });
    expect(result.total).toBe(1);
    expect(result.eventos[0]).toMatchObject({
      id_entidade: producerEntityId,
      correlation_id: KEY,
      evento: "salvar_vinculo_usuario_adm",
    });
    expect(auditFilters).toEqual([
      ["id_organizacao", ORG],
      ["correlation_id", KEY],
    ]);
    observations.push({
      caseId: "IFV1-F3-C0033",
      consumer: "eventos_auditoria",
      producerOrder: 4,
      kind: "positive",
      testId: SOURCE + ":IFV1-F3-C0033:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId,
      network: { method: "GET", status: 200, table: "eventos_auditoria", fixture: true },
      readback: {
        matched: true,
        bindingId: producerEntityId,
        correlationId: KEY,
        eventId: result.eventos[0]!.id,
      },
    });
  });
  it("IFV1-F3-C0033 negative: reader cannot access the same audit event", async () => {
    actor = "leitor";
    expect(await podeConsultarAuditoria(ORG)).toBe(false);
    await expect(
      obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0, correlationId: KEY }),
    ).rejects.toThrow("Acesso não autorizado à trilha de auditoria.");
    expect(auditFilters).toEqual([
      ["id_organizacao", ORG],
      ["correlation_id", KEY],
    ]);
    observations.push({
      caseId: "IFV1-F3-C0033",
      consumer: "eventos_auditoria",
      producerOrder: 4,
      kind: "negative",
      testId: SOURCE + ":IFV1-F3-C0033:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId,
      network: { method: "GET", status: 403, table: "eventos_auditoria", fixture: true },
      readback: { outcome: "DENY", bindingId: producerEntityId, correlationId: KEY },
    });
  });
  afterAll(() => {
    expect(
      fixture.rpc.mock.calls.filter(([name]) => name === "salvar_vinculo_usuario_adm"),
    ).toHaveLength(1);
    const path = process.env["F3_CODE_ADM01_RBAC_OBSERVATIONS"];
    if (path) {
      expect(observations).toHaveLength(matrix.length * 2 + 4);
      writeFileSync(path, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

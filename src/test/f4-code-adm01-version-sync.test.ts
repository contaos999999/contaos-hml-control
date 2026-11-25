/**
 * F4.1 CODE: versioned binding update and readback, replay and rejected stale write.
 * Supabase transport/persistence only is a local fixture. No remote RLS claim.
 * Contract: docs/backend/ADM01_USUARIOS_VINCULOS_2026-11-02.md.
 */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { salvarVinculo, listarUsuarios } from "@/lib/administracao/admUsuariosRpc";
import type { PayloadSalvar } from "@/lib/administracao/admUsuariosRpc";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { menuComumPermitido, menuContextualV1 } from "@/lib/navegacao/menuV1";
import { listarOrganizacoesDisponiveis, resolverDestinoPosLogin } from "@/lib/auth/resolverDestinoPosLogin";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
const fixture = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: fixture.rpc, from: fixture.from },
}));
const ORG = "a1111111-1111-4111-8111-111111111111";
const OTHER = "a2222222-2222-4222-8222-222222222222";
const USER = "a3333333-3333-4333-8333-333333333333";
const LINK = "a4444444-4444-4444-8444-444444444444";
const KEY = "a5555555-5555-4555-8555-555555555555";
const KEY2 = "b5555555-5555-4555-8555-555555555555";
const CONTRACT = "a6666666-6666-4666-8666-666666666666";
const COMPETENCE = "a7777777-7777-4777-8777-777777777777";
const CONTRACTOR = "a8888888-8888-4888-8888-888888888888";
const RPC = "consultar_permissoes_efetivas";
const matrix = [
  {
    caseId: "IFV1-F4-C0007",
    dest: "V101",
    recurso: "contratantes",
    acao: "consultar",
    route: "/contratantes",
    ctx: "common",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0009",
    dest: "V102",
    recurso: "contratantes",
    acao: "criar",
    route: "/contratantes/novo",
    ctx: "common",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0011",
    dest: "V103",
    recurso: "contratantes",
    acao: "editar",
    route: "/contratantes/{contratante}/editar",
    ctx: "contractor",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0012",
    dest: "V104",
    recurso: "contratos",
    acao: "consultar",
    route: "/contratos",
    ctx: "common",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0014",
    dest: "V105",
    recurso: "contratos",
    acao: "criar",
    route: "/contratos/novo",
    ctx: "common",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0016",
    dest: "V106",
    recurso: "contratos",
    acao: "consultar",
    route: "/contratos/{contrato}",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0017",
    dest: "V107",
    recurso: "normativos",
    acao: "consultar",
    route: "/contratos/{contrato}/base-normativa",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0018",
    dest: "V108",
    recurso: "orcamentos",
    acao: "consultar",
    route: "/contratos/{contrato}/orcamento",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0019",
    dest: "V109",
    recurso: "listas",
    acao: "consultar",
    route: "/contratos/{contrato}/regras",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0020",
    dest: "V110",
    recurso: "documentos_contrato",
    acao: "consultar",
    route: "/contratos/{contrato}/documentos",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0021",
    dest: "V111",
    recurso: "documentos_contrato",
    acao: "consultar",
    route: "/contratos/{contrato}/documentos",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0022",
    dest: "V112",
    recurso: "competencias",
    acao: "consultar",
    route: "/contratos/{contrato}/competencias",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0023",
    dest: "V113",
    recurso: "competencias",
    acao: "criar",
    route: "/contratos/{contrato}/competencias/nova",
    ctx: "contract",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0024",
    dest: "V114",
    recurso: "competencias",
    acao: "consultar",
    route: "/competencias/{competencia}",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0025",
    dest: "V115",
    recurso: "documentos_competencia",
    acao: "consultar",
    route: "/competencias/{competencia}/documentos",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0026",
    dest: "V116",
    recurso: "analises",
    acao: "consultar",
    route: "/competencias/{competencia}/analise",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0027",
    dest: "V117",
    recurso: "analises",
    acao: "consultar",
    route: "/competencias/{competencia}/analise",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0028",
    dest: "V118",
    recurso: "pareceres",
    acao: "consultar",
    route: "/competencias/{competencia}/parecer",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0029",
    dest: "V119",
    recurso: "apresentacoes",
    acao: "consultar",
    route: "/competencias/{competencia}/apresentar",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0030",
    dest: "V120",
    recurso: "apresentacoes",
    acao: "consultar",
    route: "/competencias/{competencia}/apresentar",
    ctx: "competence",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0031",
    dest: "V121",
    recurso: "historico",
    acao: "consultar",
    route: "/contratos/{contrato}/historico",
    ctx: "contract",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0032",
    dest: "V122",
    recurso: "historico",
    acao: "criar",
    route: "",
    ctx: "guard",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0034",
    dest: "V123",
    recurso: "auditoria",
    acao: "consultar",
    route: "",
    ctx: "guard",
    reader: false,
  },
];

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


const READ = ["analises", "apresentacoes", "arquivos", "competencias", "contratantes", "contratos", "dashboard", "documentos_competencia", "documentos_contrato", "historico", "listas", "normativos", "orcamentos", "organizacoes", "pareceres"].map(recurso => ({ recurso, acao: "consultar" }));
const initial = () => ({ id: LINK, perfil: "leitor", ativo: false, escopo_todos_contratos: true, versao_registro: 1, inicio_em: null, fim_em: null, atualizado_em: null });
let binding = initial();
let actor: "master" | "leitor" = "master";
const replay = new Map<string, { payload: string; response: unknown }>();
const events: Record<string, unknown>[] = [];
const observations: Record<string, unknown>[] = [];
const ok = (data: unknown) => ({ data: structuredClone(data), error: null, status: 200 });
const fail = (code: string, status: number) => ({ data: null, error: { code }, status });
const payload = (version: number, ativo: boolean): PayloadSalvar => ({
  p_id_organizacao: ORG, p_id_usuario: USER, p_email: null, p_perfil: "leitor",
  p_escopo_todos_contratos: true, p_ativo: ativo, p_ids_contratos_ativar: [],
  p_ids_contratos_revogar: [], p_versao_esperada: version,
});
beforeEach(() => {
  binding = initial();
  actor = "master";
  replay.clear();
  events.length = 0;
  fixture.rpc.mockReset();
  fixture.from.mockReset();
  fixture.rpc.mockImplementation(async (name: string, args: Record<string, unknown> = {}) => {
    if (name === "salvar_vinculo_usuario_adm") {
      if (actor !== "master" || args["p_id_organizacao"] !== ORG || args["p_id_usuario"] !== USER) return fail("42501", 403);
      const key = String(args["p_chave_idempotencia"]);
      const request = JSON.stringify(args);
      const old = replay.get(key);
      if (old) return old.payload === request ? ok(old.response) : fail("PT409", 409);
      if (args["p_versao_esperada"] !== binding.versao_registro) return fail("PT409", 409);
      binding = { ...binding, ativo: args["p_ativo"] === true, versao_registro: binding.versao_registro + 1 };
      const response = { schema_versao: "adm01-v2", correlation_id: key, id_usuario: USER, vinculo: structuredClone(binding) };
      replay.set(key, { payload: request, response });
      events.push({ id: key, criado_em: "2026-01-01T00:00:00Z", evento: "salvar_vinculo_usuario_adm", entidade: "vinculos_usuarios", origem: "rpc", id_usuario: USER, id_entidade: LINK, correlation_id: key });
      return ok(response);
    }
    if (name === "listar_usuarios_vinculos_adm") {
      if (actor !== "master" || args["p_id_organizacao"] !== ORG) return fail("42501", 403);
      const items = args["p_ativo"] === null || args["p_ativo"] === binding.ativo ? [{ id_usuario: USER, vinculo: binding }] : [];
      return ok({ schema_versao: "adm01-v2", pagina: 1, tamanho_pagina: 25, total: items.length, total_paginas: 1, itens: items, perfis_disponiveis: [] });
    }
    if (name === "listar_organizacoes_disponiveis") {
      return ok(actor === "leitor" && !binding.ativo ? [] : [{ id: ORG, razao_social: "Organização sintética", nome_fantasia: null, cnpj: null, situacao: "ativa", perfil: actor === "master" ? "administrador_master" : "leitor" }]);
    }
    if (name === RPC) {
      if (args["p_id_organizacao"] !== ORG || (args["p_id_contrato"] !== null && args["p_id_contrato"] !== CONTRACT) || (actor === "leitor" && !binding.ativo)) return fail("42501", 403);
      return ok({ schema_versao: "rbac-v1", versao: 6, master: actor === "master", permissoes: READ });
    }
    throw new Error("unexpected RPC " + name);
  });
  fixture.from.mockImplementation((table: string) => {
    if (table !== "eventos_auditoria") throw new Error("unexpected table " + table);
    const filters = new Map<string, unknown>();
    const q: Record<string, unknown> = {};
    for (const op of ["select", "order", "range"]) q[op] = () => q;
    q["eq"] = (k: string, v: unknown) => { filters.set(k, v); return q; };
    q["then"] = (resolve: (v: unknown) => unknown, reject: (v: unknown) => unknown) =>
      Promise.resolve().then(() => {
        if (actor !== "master" || filters.get("id_organizacao") !== ORG) return fail("42501", 403);
        const rows = events.filter(e => !filters.has("correlation_id") || e["correlation_id"] === filters.get("correlation_id"));
        return { ...ok(rows), count: rows.length };
      }).then(resolve, reject);
    return q;
  });
});
async function readBinding() {
  actor = "master";
  const result = await listarUsuarios(ORG, { pagina: 1, busca: null, ativo: null });
  expect(result.itens).toHaveLength(1);
  expect(result.itens[0]?.id_usuario).toBe(USER);
  expect(fixture.rpc).toHaveBeenLastCalledWith("listar_usuarios_vinculos_adm", { p_id_organizacao: ORG, p_pagina: 1, p_tamanho_pagina: 25, p_busca: null, p_ativo: null });
  return result.itens[0]!.vinculo;
}
async function activate() {
  const before = await readBinding();
  expect(before).toMatchObject({ id: LINK, ativo: false, versao_registro: 1 });
  const cmd = payload(before.versao_registro, true);
  const receipt = await salvarVinculo(cmd, KEY, "salvarEdicao");
  expect(fixture.rpc).toHaveBeenLastCalledWith("salvar_vinculo_usuario_adm", { ...cmd, p_chave_idempotencia: KEY });
  const after = await readBinding();
  expect(after).toMatchObject({ id: LINK, ativo: true, versao_registro: 2 });
  expect(receipt.vinculo).toEqual(after);
  // The separately executed read must not alias the write response.
  expect(receipt.vinculo).not.toBe(after);
  return { before, after, cmd, receipt };
}
async function rejectStale() {
  const { cmd, receipt, after } = await activate();
  actor = "master";
  expect(await salvarVinculo(cmd, KEY, "salvarEdicao")).toEqual(receipt);
  await expect(salvarVinculo(payload(2, false), KEY, "salvarEdicao")).rejects.toMatchObject({ tipo: "conflito" });
  await expect(salvarVinculo(payload(1, false), KEY2, "salvarEdicao")).rejects.toMatchObject({ tipo: "conflito" });
  expect(await readBinding()).toEqual(after);
  return after;
}
function observe(caseId: string, kind: string, readback: unknown) {
  observations.push({ caseId, kind, mode: "CODE_FIXTURE", readback });
}
describe("F4.1 ADM01 — material synchronization", () => {
  for (const c of matrix) {
    it(c.caseId + " positive: update from version read and refresh " + c.dest, async () => {
      actor = "leitor";
      await expect(consultarPermissoesEfetivas(ORG, scope(c).contrato)).rejects.toMatchObject({ tipo: "negado" });
      const { before, after } = await activate();
      actor = "leitor";
      const current = await consultarPermissoesEfetivas(ORG, scope(c).contrato);
      expect(current.master).toBe(false);
      expect(visible(c, current)).toBe(c.reader);
      expect(fixture.rpc).toHaveBeenLastCalledWith(RPC, { p_id_organizacao: ORG, p_id_contrato: scope(c).contrato });
      observe(c.caseId, "positive", { before, after, permission: c.recurso + "/" + c.acao, allowed: c.reader });
    });
    it(c.caseId + " negative: stale and conflicting replay preserve " + c.dest, async () => {
      const after = await rejectStale();
      actor = "leitor";
      const current = await consultarPermissoesEfetivas(ORG, scope(c).contrato);
      expect(visible(c, current)).toBe(c.reader);
      await expect(consultarPermissoesEfetivas(OTHER, scope(c).contrato)).rejects.toMatchObject({ tipo: "negado" });
      actor = "master";
      expect(await readBinding()).toEqual(after);
      observe(c.caseId, "negative", { after, permission: c.recurso + "/" + c.acao, allowed: c.reader, conflict: "PT409", foreign: "DENIED" });
    });
  }
  it("IFV1-F4-C0002 positive: organization readback after versioned activation", async () => {
    actor = "leitor";
    expect(resolverDestinoPosLogin(await listarOrganizacoesDisponiveis())).toEqual({ tipo: "sem-acesso" });
    const { before, after } = await activate();
    actor = "leitor";
    const orgs = await listarOrganizacoesDisponiveis();
    expect(orgs).toMatchObject([{ id: ORG, perfil: "leitor" }]);
    expect(resolverDestinoPosLogin(orgs)).toEqual({ tipo: "rota", rota: "/" });
    observe("IFV1-F4-C0002", "positive", { before, after, orgs });
  });
  it("IFV1-F4-C0002 negative: rejected stale deactivation preserves organization", async () => {
    const after = await rejectStale();
    actor = "leitor";
    const orgs = await listarOrganizacoesDisponiveis();
    expect(orgs).toMatchObject([{ id: ORG, perfil: "leitor" }]);
    expect(resolverDestinoPosLogin(orgs)).toEqual({ tipo: "rota", rota: "/" });
    observe("IFV1-F4-C0002", "negative", { after, orgs, conflict: "PT409" });
  });
  it("IFV1-F4-C0033 positive: audit readback correlates material version update", async () => {
    const { before, after, receipt } = await activate();
    const audit = await obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0, correlationId: receipt.correlation_id });
    expect(audit.total).toBe(1);
    expect(audit.eventos[0]).toMatchObject({ id_entidade: LINK, correlation_id: KEY, evento: "salvar_vinculo_usuario_adm" });
    observe("IFV1-F4-C0033", "positive", { before, after, audit });
  });
  it("IFV1-F4-C0033 negative: replay and stale update do not duplicate success event", async () => {
    const after = await rejectStale();
    const audit = await obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0 });
    expect(audit.total).toBe(1);
    expect(audit.eventos[0]).toMatchObject({ id_entidade: LINK, correlation_id: KEY });
    actor = "leitor";
    await expect(obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0 })).rejects.toThrow("Acesso não autorizado");
    observe("IFV1-F4-C0033", "negative", { after, audit, conflict: "PT409", denied: true });
  });
});
afterAll(() => {
  const path = process.env["F4_CODE_ADM01_OBSERVATIONS"];
  if (path) {
    expect(observations).toHaveLength((matrix.length + 2) * 2);
    writeFileSync(path, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

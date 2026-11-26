import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import {
  listarUsuarios,
  podeConsultarAuditoria,
  salvarVinculo,
  type PayloadSalvar,
} from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  consultarPermissoesEfetivas,
  resolverContextoRbac,
  temPermissao,
} from "@/lib/administracao/rbacRpc";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  A,
  B,
  createTransport,
  eq,
  evidenceStep as step,
  forbidden,
  journeyRecorder,
  moment,
  response,
  type Scope,
} from "./f6-code-journey-fixture";
const wire = vi.hoisted(() => ({ fetch: vi.fn(), actor: "", navigate: vi.fn() }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient("https://f6-journeys.invalid", "fixture-key", {
    accessToken: async () => "fixture-" + wire.actor,
    global: { fetch: (r, i) => wire.fetch(r, i) },
  });
  return {
    supabase: {
      rpc: client.rpc.bind(client),
      from: client.from.bind(client),
      auth: { getUser: async () => ({ data: { user: { id: wire.actor } }, error: null }) },
    },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => wire.navigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

const proofs = journeyRecorder("adm01");
const owner = { ...A, actor: "a6100000-0000-4000-8000-000000000099" };
const contractRoute = (tail = "") => "/contratos/" + A.contract + tail;
const competenceRoute = (tail = "") => "/competencias/" + A.competence + tail;
const capability: Record<string, [string, string, string]> = {
  C0002: ["organizacoes", "consultar", "/"],
  C0005: ["dashboard", "consultar", "/"],
  C0007: ["contratantes", "consultar", "/contratantes"],
  C0009: ["contratantes", "criar", "/contratantes/novo"],
  C0011: ["contratantes", "editar", "/contratantes/" + A.party + "/editar"],
  C0012: ["contratos", "consultar", "/contratos"],
  C0014: ["contratos", "criar", "/contratos/novo"],
  C0016: ["contratos", "consultar", contractRoute()],
  C0017: ["normativos", "consultar", contractRoute("/base-normativa")],
  C0018: ["orcamentos", "consultar", contractRoute("/orcamento")],
  C0019: ["listas", "consultar", contractRoute("/regras")],
  C0020: ["documentos_contrato", "consultar", contractRoute("/documentos")],
  C0021: ["documentos_contrato", "consultar", contractRoute("/documentos/" + A.version)],
  C0022: ["competencias", "consultar", contractRoute("/competencias")],
  C0023: ["competencias", "criar", contractRoute("/competencias/nova")],
  C0024: ["competencias", "consultar", competenceRoute()],
  C0025: ["documentos_competencia", "consultar", competenceRoute("/documentos")],
  C0026: ["analises", "consultar", competenceRoute("/analise")],
  C0027: ["analises", "consultar", competenceRoute("/analise")],
  C0028: ["pareceres", "consultar", competenceRoute("/parecer")],
  C0029: ["apresentacoes", "consultar", competenceRoute("/apresentar")],
  C0030: ["apresentacoes", "consultar", competenceRoute("/apresentacoes/" + A.version)],
  C0031: ["historico", "consultar", contractRoute("/historico")],
  C0032: ["historico", "processar", contractRoute("/historico")],
  C0033: ["auditoria", "consultar", "/administracao/auditoria"],
  C0034: ["auditoria", "consultar", "/administracao/auditoria"],
};
type Profile = "leitor" | "administrador" | "gestor_contrato";
const rpcSave = "rpc/salvar_vinculo_usuario_adm";
const rbac = "rpc/consultar_permissoes_efetivas";
const organization = (s: Scope, perfil: Profile) => ({
  id: s.org,
  razao_social: "Organização da jornada " + s.role,
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil,
});
const dashboard = (s: Scope) => ({
  schema_versao: "sys05-v1",
  gerado_em: moment,
  organizacao: organization(s, "leitor"),
  resumo: {
    contratos_visiveis: 46,
    contratos_ativos: 2,
    competencias_em_fluxo: 1,
    competencias_exigem_atencao: 4,
    itens_com_prazo_vencido: 5,
    atencoes_abertas: 6,
  },
  contratos_por_situacao: [],
  competencias_por_situacao: [],
  proximos_prazos: [],
  atencoes_prioritarias: [],
});
let bound: { ativo: boolean; versao_registro: number };
let setupCase: ReturnType<typeof spec>;
let transport: ReturnType<typeof createTransport>;
let writes = 0;
const select = (s: Scope) => {
  wire.actor = s.actor;
};
function spec(id: string) {
  const [r, a, path] = capability[id]!;
  const profile: Profile =
    r === "auditoria" ? "administrador" : a === "consultar" ? "leitor" : "gestor_contrato";
  const contrato =
    path.startsWith(competenceRoute()) || path.startsWith(contractRoute()) ? A.contract : null;
  return { id, r, a, path, profile, contrato };
}
const payload = (c: ReturnType<typeof spec>, version = 1): PayloadSalvar => ({
  p_id_organizacao: A.org,
  p_id_usuario: A.actor,
  p_email: null,
  p_perfil: c.profile,
  p_escopo_todos_contratos: c.contrato === null,
  p_ativo: true,
  p_ids_contratos_ativar: c.contrato ? [c.contrato] : [],
  p_ids_contratos_revogar: [],
  p_versao_esperada: version,
});
const binding = () => ({
  ...bound,
  id: A.link,
  perfil: setupCase.profile,
  escopo_todos_contratos: setupCase.contrato === null,
  inicio_em: null,
  fim_em: null,
  atualizado_em: moment,
});
const changed = () => ({
  schema_versao: "adm01-v2",
  correlation_id: A.correlation,
  id_usuario: A.actor,
  vinculo: binding(),
});
const key = (id: string) => "fixture-f6-" + id;
const denied = () => response(forbidden, 403);
beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  bound = { ativo: false, versao_registro: 1 };
  writes = 0;
  transport = createTransport(
    (s, route, fields) => {
      const ownerSession = s.actor === owner.actor;
      const member = s.actor === A.actor;
      const target = fields["p_id_organizacao"];
      if (route === "rpc/listar_usuarios_vinculos_adm") {
        expect(fields).toEqual({
          p_id_organizacao: A.org,
          p_pagina: 1,
          p_tamanho_pagina: 25,
          p_busca: null,
          p_ativo: null,
        });
        if (!ownerSession) return denied();
        return response({
          schema_versao: "adm01-v2",
          pagina: 1,
          tamanho_pagina: 25,
          total: 1,
          total_paginas: 1,
          itens: [
            {
              id_usuario: A.actor,
              nome: null,
              email: null,
              telefone: null,
              situacao_usuario: "ativo",
              vinculo: binding(),
            },
          ],
          perfis_disponiveis: [],
        });
      }
      if (route === rpcSave) {
        const request = fields["p_chave_idempotencia"];
        expect([key(setupCase.id), key(setupCase.id) + "-stale"]).toContain(request);
        expect(fields).toEqual({ ...payload(setupCase), p_chave_idempotencia: request });
        if (!ownerSession) return denied();
        if (bound.ativo && request === key(setupCase.id)) return response(changed());
        if (fields["p_versao_esperada"] !== bound.versao_registro)
          return response({ code: "PT409" }, 409);
        bound = { ativo: true, versao_registro: bound.versao_registro + 1 };
        writes++;
        return response(changed());
      }
      if (route === "rpc/listar_organizacoes_disponiveis") {
        expect(fields).toEqual({});
        return response(
          member
            ? bound.ativo
              ? [organization(A, setupCase.profile)]
              : []
            : [organization(B, "leitor")],
        );
      }
      if (route === "rpc/obter_resumo_dashboard") {
        expect(fields).toEqual({ p_id_organizacao: target });
        return (member && bound.ativo && target === A.org) || (!member && target === B.org)
          ? response(dashboard(member ? A : B))
          : denied();
      }
      if (route === "competencias") {
        expect(fields).toEqual({ id: eq(A.competence), id_organizacao: eq(A.org) });
        return member && bound.ativo ? response([{ id_contrato: A.contract }]) : denied();
      }
      if (route === rbac) {
        const own = target === s.org;
        expect(fields).toEqual({
          p_id_organizacao: target,
          p_id_contrato: target === A.org ? setupCase.contrato : null,
        });
        if (!own) return denied();
        const grants =
          member && bound.ativo
            ? [{ recurso: setupCase.r, acao: setupCase.a }]
            : member
              ? []
              : [{ recurso: "organizacoes", acao: "consultar" }];
        return response({
          schema_versao: "rbac-v1",
          versao: member ? bound.versao_registro : 1,
          master: false,
          permissoes: grants,
        });
      }
      if (route === "rpc/pode_consultar_auditoria_organizacao") {
        expect(fields).toEqual({ p_id_organizacao: A.org });
        return response(member && bound.ativo && setupCase.profile === "administrador");
      }
      if (route === "eventos_auditoria") {
        expect(fields).toEqual({ id_organizacao: eq(A.org), correlation_id: eq(A.correlation) });
        if (!member || !bound.ativo) return denied();
        return response([
          {
            id: A.version,
            id_entidade: A.link,
            id_usuario: owner.actor,
            entidade: "vinculos_usuarios",
            evento: "VinculoUsuarioAdministrativoSalvo",
            origem: "usuario",
            criado_em: moment,
            correlation_id: A.correlation,
          },
        ]);
      }
      throw Error("Unexpected ADM01 route " + route);
    },
    [A, B, owner],
  );
  wire.fetch.mockImplementation(transport.fetch);
});
afterEach(() => {
  sessionStorage.clear();
  wire.actor = "";
  bound = { ativo: false, versao_registro: 1 };
});
afterAll(proofs.write);
async function membership() {
  select(owner);
  const page = await listarUsuarios(A.org, { pagina: 1, busca: null, ativo: null });
  expect(page.itens).toHaveLength(1);
  const row = page.itens[0]!;
  expect(row.id_usuario).toBe(A.actor);
  return row.vinculo;
}
async function grant(version: number) {
  select(owner);
  const written = await salvarVinculo(
    payload(setupCase, version),
    key(setupCase.id),
    "salvarEdicao",
  );
  expect(written).toEqual(changed());
  const read = await membership();
  expect(read).toEqual(written.vinculo);
  return read;
}
async function showDashboard(actor: Scope, allowed: boolean) {
  definirPreferenciaOrganizacao(actor.actor, A.org);
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={cache}>
      <Dashboard />
    </QueryClientProvider>,
  );
  try {
    if (!allowed) {
      expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_SYS05.negado);
      expect(screen.queryByRole("region", { name: "Indicadores de resumo" })).toBeNull();
      return { visible: false };
    }
    const region = await screen.findByRole("region", { name: "Indicadores de resumo" });
    expect(within(region).getByText("46")).toBeVisible();
    const record = cache.getQueryData<ReturnType<typeof dashboard>>([
      "sys05",
      "resumo",
      actor.actor,
      A.org,
    ]);
    expect(record?.organizacao.id).toBe(A.org);
    return {
      visible: true,
      organization: record!.organizacao.id,
      count: record!.resumo.contratos_visiveis,
    };
  } finally {
    view.unmount();
    cache.clear();
  }
}
async function consume(actor: Scope) {
  const c = setupCase;
  select(actor);
  if (c.id === "C0002") {
    const rows = await listarOrganizacoesDisponiveis();
    return { organizations: rows.map((r) => r.id), roles: rows.map((r) => r.perfil) };
  }
  if (c.id === "C0005") return showDashboard(actor, actor.actor === A.actor && bound.ativo);
  if (c.id === "C0033") {
    expect(await podeConsultarAuditoria(A.org)).toBe(true);
    const x = await obterEventosAuditoria({
      idOrganizacao: A.org,
      pagina: 0,
      correlationId: A.correlation,
    });
    expect(x.eventos[0]).toMatchObject({
      id_entidade: A.link,
      id_usuario: owner.actor,
      correlation_id: A.correlation,
    });
    return {
      event: x.eventos[0]!.id,
      vinculo: x.eventos[0]!.id_entidade,
      correlation: x.eventos[0]!.correlation_id,
    };
  }
  const context = await resolverContextoRbac(c.path, A.org);
  expect(context.contrato).toBe(c.contrato);
  const effective = await consultarPermissoesEfetivas(A.org, context.contrato);
  expect(effective.master).toBe(false);
  if (c.id === "C0034") expect(await podeConsultarAuditoria(A.org)).toBe(true);
  return {
    version: effective.versao,
    authorized: temPermissao(effective.permissoes, c.r, c.a),
    context,
  };
}
async function attemptForeign() {
  const c = setupCase;
  select(B);
  if (c.id === "C0002") {
    expect(await consume(B)).toEqual({ organizations: [B.org], roles: ["leitor"] });
  } else if (c.id === "C0005") {
    expect(await consume(B)).toEqual({ visible: false });
  } else if (c.id === "C0033") {
    await expect(
      obterEventosAuditoria({ idOrganizacao: A.org, pagina: 0, correlationId: A.correlation }),
    ).rejects.toThrow("Acesso não autorizado");
  } else {
    await expect(consultarPermissoesEfetivas(A.org, c.contrato)).rejects.toMatchObject({
      tipo: "negado",
    });
  }
}

describe("F6 ADM01 journeys", () => {
  for (const row of proofs.cases) {
    it(
      row.caseId + " positive: grants access, reaches the consumer and validates persisted state",
      async () => {
        setupCase = spec(row.sourceConnectionId);
        const before = await membership();
        expect(before).toMatchObject({ ativo: false, versao_registro: 1 });
        const current = await grant(before.versao_registro);
        expect(current).toMatchObject({
          ativo: true,
          versao_registro: 2,
          perfil: setupCase.profile,
        });
        const visible = await consume(A);
        if (setupCase.id === "C0002")
          expect(visible).toEqual({ organizations: [A.org], roles: [setupCase.profile] });
        else if ("authorized" in visible) expect(visible.authorized).toBe(true);
        select(owner);
        expect(
          await salvarVinculo(payload(setupCase, 1), key(setupCase.id), "salvarEdicao"),
        ).toEqual(changed());
        await expect(
          salvarVinculo(payload(setupCase, 1), key(setupCase.id) + "-stale", "salvarEdicao"),
        ).rejects.toMatchObject({ tipo: "conflito" });
        expect(transport.trace.at(-1)).toMatchObject({
          route: rpcSave,
          status: 409,
          code: "PT409",
        });
        const repeated = await membership();
        expect(repeated).toEqual(current);
        expect(await consume(A)).toEqual(visible);
        expect(writes).toBe(1);
        proofs.record(
          row.sourceConnectionId,
          "positive",
          { ...A, role: setupCase.profile },
          {
            preconditions: before,
            steps: [
              step("precondition", before),
              step("producer", current),
              step("consumer", visible),
              step("recovery", { version: repeated.versao_registro }),
            ],
            observed: visible,
            postconditions: { writes, granted: repeated.ativo },
            recoveryProof: repeated,
            cleanupStatus: "CLEAN",
          },
        );
      },
    );
    it(
      row.caseId + " negative: rejects a foreign grant and recovers through an authorized session",
      async () => {
        setupCase = spec(row.sourceConnectionId);
        const before = await membership();
        select(B);
        const own = await consultarPermissoesEfetivas(B.org, null);
        expect(temPermissao(own.permissoes, "organizacoes", "consultar")).toBe(true);
        await expect(
          salvarVinculo(payload(setupCase), key(setupCase.id), "salvarEdicao"),
        ).rejects.toMatchObject({ tipo: "negado" });
        const refusal = transport.trace.at(-1)!;
        expect(refusal).toMatchObject({ route: rpcSave, status: 403, code: "42501" });
        await attemptForeign();
        const persisted = await membership();
        expect(persisted).toEqual(before);
        const deniedWrites = writes;
        expect(deniedWrites).toBe(0);
        const current = await grant(before.versao_registro);
        const recovered = await consume(A);
        expect(current.versao_registro).toBe(2);
        expect(writes).toBe(1);
        proofs.record(row.sourceConnectionId, "negative", B, {
          preconditions: before,
          steps: [
            step("precondition", before),
            step("producer", refusal),
            step("consumer", { bindingBeforeRecovery: persisted.versao_registro }),
            step("recovery", recovered),
          ],
          observed: {
            status: refusal.status,
            code: refusal.code,
            preservedVersion: persisted.versao_registro,
          },
          postconditions: { deniedWrites, authorizedWrites: writes },
          recoveryProof: recovered,
          negativeProof: {
            decision: "DENIED",
            status: refusal.status,
            code: refusal.code!,
            effects: 0,
            disclosed: false,
          },
          cleanupStatus: "CLEAN",
        });
      },
    );
  }
});

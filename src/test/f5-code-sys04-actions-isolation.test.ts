/** SYS04 reads and mutations under the real frontend adapters. CODE_FIXTURE only. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { listarContratantes } from "@/lib/contratantes/contratantesDados";
import {
  consultarCapacidadeCadastro,
  inserirContratante,
  montarPayload,
} from "@/lib/contratantes/novoContratanteDados";
import {
  atualizarContratante,
  buscarContratante,
  consultarCapacidadeEdicaoContratante,
  formularioDe,
  montarArgsAtualizacao,
} from "@/lib/contratantes/editarContratanteDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { buscarOpcoesContratantes, inserirContrato } from "@/lib/contratos/novoContratoDados";
import {
  consultarCapacidadeCriarCompetencia,
  criarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import { criarOrganizacao } from "@/lib/organizacao/criarOrganizacaoDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const transport = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: transport }));

const fixtureId = (tenant: "a" | "b", slot: number) =>
  `${tenant}8000000-0000-4000-8000-${String(slot).padStart(12, "0")}`;
const makeScope = (tenant: "a" | "b", org: string, actor: string) => ({
  org,
  actor,
  party: fixtureId(tenant, 1),
  contract: fixtureId(tenant, 2),
  competence: fixtureId(tenant, 3),
  event: fixtureId(tenant, 4),
  correlation: fixtureId(tenant, 5),
  report: fixtureId(tenant, 6),
  file: fixtureId(tenant, 7),
  label: tenant.toUpperCase() + "-F5",
});
const A = makeScope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
);
const B = makeScope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
);
type Scope = typeof A;
type Filters = Array<[string, unknown]>;
type Reply = { data: unknown; error: { code: string } | null; status: number; count: number };
type TransportStep = {
  name: string;
  reply: Reply;
} & (
  | { kind: "rpc"; args: Record<string, unknown> }
  | { kind: "table"; filters: Filters; insert: unknown; single: boolean }
);
const ok = (data: unknown, count = 1): Reply => ({ data, error: null, status: 200, count });
const error = (code: string, status: number): Reply => ({
  data: null,
  error: { code },
  status,
  count: 0,
});
const deny = error("42501", 403);
const invalidAssociation = error("23503", 409);
const date = "2026-08-01T12:00:00Z";
const month = "2026-08";
const orgFilter = (s: Scope): Filters => [["id_organizacao", s.org]];
const contractFilter = (s: Scope): Filters => [["id_contrato", s.contract]];
const contractScope = (s: Scope): Filters => [...contractFilter(s), ...orgFilter(s)];
const auditFilter = (s: Scope): Filters => [...orgFilter(s), ["correlation_id", s.correlation]];
const rbacArgs = (s: Scope, contract: string | null = null) => ({
  p_id_organizacao: s.org,
  p_id_contrato: contract,
});
const rpc = (name: string, args: Record<string, unknown>, reply: Reply): TransportStep => ({
  kind: "rpc",
  name,
  args,
  reply,
});
const table = (
  name: string,
  filters: Filters,
  reply: Reply,
  single = false,
  insert: unknown = null,
): TransportStep => ({ kind: "table", name, filters, reply, single, insert });
const permission = (resource: string, action: string) =>
  ok({
    schema_versao: "rbac-v1",
    versao: 1,
    master: false,
    permissoes: [{ recurso: resource, acao: action }],
  });
const readSignal = () => new AbortController().signal;
const requests: Array<{ name: string; status: number; code: string | null; write: boolean }> = [];
const writeRpcs = new Set(["atualizar_contratante", "criar_competencia", "criar_organizacao"]);

/** A transcript fixes the boundary response and checks the actual outgoing operation. */
async function execute<T>(steps: TransportStep[], operation: () => Promise<T>) {
  requests.length = 0;
  const remaining = [...steps];
  function take(name: string, kind: TransportStep["kind"]) {
    const step = remaining.shift();
    if (!step || step.name !== name || step.kind !== kind)
      throw Error(`Unexpected ${kind} ${name}`);
    return step;
  }
  function returnReply(step: TransportStep) {
    const write = step.kind === "rpc" ? writeRpcs.has(step.name) : step.insert !== null;
    requests.push({
      name: step.name,
      status: step.reply.status,
      code: step.reply.error?.code ?? null,
      write,
    });
    return structuredClone(step.reply);
  }
  transport.rpc.mockImplementation(async (name: string, args?: Record<string, unknown>) => {
    const step = take(name, "rpc");
    if (step.kind !== "rpc") throw Error("Expected RPC");
    expect(args ?? {}).toEqual(step.args);
    return returnReply(step);
  });
  transport.from.mockImplementation((name: string) => {
    const step = take(name, "table");
    if (step.kind !== "table") throw Error("Expected table");
    const filters: Filters = [];
    let insert: unknown = null;
    const finish = (single: boolean) => {
      expect(filters).toEqual(step.filters);
      expect(insert).toEqual(step.insert);
      expect(single).toBe(step.single);
      return returnReply(step);
    };
    const q = {
      select: () => q,
      order: () => q,
      range: () => q,
      abortSignal: () => q,
      eq: (...filter: Filters[number]) => {
        filters.push(filter);
        return q;
      },
      insert: (payload: unknown) => {
        insert = payload;
        return q;
      },
      single: async () => finish(true),
      maybeSingle: async () => finish(true),
      then: (resolve: (reply: Reply) => unknown, reject: (cause: unknown) => unknown) =>
        Promise.resolve()
          .then(() => finish(false))
          .then(resolve, reject),
    };
    return q;
  });
  const result = await operation();
  expect(remaining).toEqual([]);
  expect(requests).toHaveLength(steps.length);
  return result;
}

const organization = (s: Scope, perfil: string) => ({
  id: s.org,
  razao_social: s.label,
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil,
});
const party = (s: Scope, name = s.label, version = 1) => ({
  id: s.party,
  id_organizacao: s.org,
  razao_social: name,
  tipo_pessoa: "juridica",
  documento: null,
  nome_fantasia: null,
  contato: {},
  situacao: "ativo",
  versao_registro: version,
  atualizado_em: date,
});
const contract = (s: Scope) => ({
  id: s.contract,
  id_organizacao: s.org,
  id_contratante: s.party,
  numero: s.label,
  objeto: s.label,
  situacao: "ativo",
});
const report = (s: Scope) => ({
  id: s.report,
  id_organizacao: s.org,
  id_contrato: s.contract,
  id_arquivo: s.file,
  numero_documento: s.label,
  tipo: "relatorio",
  competencia_referencia: "2026-08-01",
  data_documento: null,
  status_processamento: "concluido",
  resultado_geral: null,
  origem_temporal: "historico",
  criado_em: date,
});
const audit = (
  s: Scope,
  name = "ContratanteCriado",
  entity = "contratantes",
  target = s.party,
) => ({
  id: s.event,
  evento: name,
  entidade: entity,
  id_entidade: target,
  correlation_id: s.correlation,
  criado_em: date,
  id_usuario: s.actor,
  origem: "usuario",
});
const form = (name: string) => ({
  razaoSocial: name,
  tipoPessoa: "juridica",
  documento: "",
  nomeFantasia: "",
  email: "",
  telefone: "",
  situacao: "ativo",
});
const parties = (s: Scope) =>
  listarContratantes({ idOrganizacao: s.org, pagina: 1, busca: "", situacao: "todos" });
const contracts = (s: Scope) => listarContratos({ idOrganizacao: s.org, pagina: 1 });
const history = (s: Scope) => listarRelatoriosHistoricos(s.contract, s.org, 0, readSignal());
const events = (s: Scope) =>
  obterEventosAuditoria({ idOrganizacao: s.org, pagina: 0, correlationId: s.correlation });
const rb = "consultar_permissoes_efetivas";
const read = (
  name: string,
  filters: (s: Scope) => Filters,
  row: (s: Scope) => { id: string },
  load: (s: Scope) => Promise<{ itens: Array<{ id: string }>; total: number }>,
) => ({
  positive: (s: Scope) =>
    execute([table(name, filters(s), ok([row(s)]))], async () => {
      const result = await load(s);
      expect(result.total).toBe(1);
      expect(result.itens).toEqual([row(s)]);
      return result.itens[0]!.id;
    }),
  negative: (s: Scope) =>
    execute(
      [
        table(name, filters(B), ok([row(B)])),
        table(name, filters(s), deny),
        table(name, filters(B), ok([row(B)])),
      ],
      async () => {
        const own = await load(B);
        expect(own.itens).toEqual([row(B)]);
        await expect(load(s)).rejects.toMatchObject({ tipo: "negado" });
        expect(await load(B)).toEqual(own);
        return own.itens[0]!.id;
      },
    ),
});
type Action = {
  id: string;
  frontier: string;
  operation: "read" | "create" | "update";
  role: "leitor" | "gestor_contrato" | "administrador";
  positive: (s: Scope) => Promise<string>;
  negative: (s: Scope) => Promise<string>;
};
const actions: Action[] = [
  {
    id: "0041",
    frontier: rb,
    operation: "read",
    role: "administrador",
    positive: (s) =>
      execute([rpc(rb, rbacArgs(s), permission("usuarios", "administrar"))], async () => {
        const material = await consultarPermissoesEfetivas(s.org, null);
        expect(material.master).toBe(false);
        expect(temPermissao(material.permissoes, "usuarios", "administrar")).toBe(true);
        return s.org;
      }),
    negative: (s) =>
      execute(
        [rpc(rb, rbacArgs(B), permission("organizacoes", "consultar")), rpc(rb, rbacArgs(s), deny)],
        async () => {
          const own = await consultarPermissoesEfetivas(B.org, null);
          expect(temPermissao(own.permissoes, "usuarios", "administrar")).toBe(false);
          await expect(consultarPermissoesEfetivas(s.org, null)).rejects.toMatchObject({
            tipo: "negado",
          });
          return B.org;
        },
      ),
  },
  {
    id: "0045",
    frontier: "contratantes",
    operation: "read",
    role: "leitor",
    ...read("contratantes", orgFilter, party, parties),
  },
  {
    id: "0046",
    frontier: "contratantes",
    operation: "create",
    role: "gestor_contrato",
    positive: (s) => {
      const row = party(s, "Cadastro F5");
      const payload = {
        id_organizacao: s.org,
        tipo_pessoa: "juridica",
        documento: null,
        razao_social: row.razao_social,
        nome_fantasia: null,
        contato: {},
        situacao: "ativo",
      };
      return execute(
        [
          rpc("listar_organizacoes_disponiveis", {}, ok([organization(s, "gestor_contrato")])),
          rpc(rb, rbacArgs(s), permission("contratantes", "criar")),
          table(
            "contratantes",
            [],
            ok({ id: row.id, razao_social: row.razao_social, situacao: row.situacao }),
            true,
            payload,
          ),
          table("contratantes", orgFilter(s), ok([row])),
        ],
        async () => {
          expect(await consultarCapacidadeCadastro(s.org, s.actor)).toMatchObject({ id: s.org });
          const receipt = await inserirContratante(montarPayload(s.org, form(" Cadastro F5 ")));
          expect((await parties(s)).itens).toEqual([row]);
          expect(receipt.id).toBe(row.id);
          return receipt.id;
        },
      );
    },
    negative: (s) => {
      const payload = montarPayload(s.org, form("Cadastro F5"));
      const own = table("contratantes", orgFilter(B), ok([party(B)]));
      return execute([own, table("contratantes", [], deny, true, payload), own], async () => {
        const before = await parties(B);
        await expect(inserirContratante(payload)).rejects.toMatchObject({ tipo: "negado" });
        expect(await parties(B)).toEqual(before);
        return before.itens[0]!.id;
      });
    },
  },
  {
    id: "0047",
    frontier: "atualizar_contratante",
    operation: "update",
    role: "gestor_contrato",
    positive: (s) => {
      const old = party(s);
      const changed = party(s, "Atualizado F5", 2);
      const filters: Filters = [...orgFilter(s), ["id", s.party]];
      const args = {
        p_id_organizacao: s.org,
        p_id_contratante: s.party,
        p_versao_esperada: 1,
        p_tipo_pessoa: "juridica",
        p_documento: "",
        p_razao_social: changed.razao_social,
        p_nome_fantasia: "",
        p_contato: {},
        p_situacao: "ativo",
      };
      return execute(
        [
          rpc(rb, rbacArgs(s), permission("contratantes", "editar")),
          table("contratantes", filters, ok(old), true),
          rpc(
            "atualizar_contratante",
            args,
            ok({ schema_versao: "v103-v1", contratante: changed }),
          ),
          table("contratantes", filters, ok(changed), true),
        ],
        async () => {
          expect(await consultarCapacidadeEdicaoContratante(s.org)).toBe(true);
          const read = await buscarContratante(s.org, s.party);
          const cmd = montarArgsAtualizacao(s.org, read.id, read.versao_registro, {
            ...formularioDe(read),
            razaoSocial: changed.razao_social,
          });
          const updated = await atualizarContratante(cmd);
          expect(updated).toEqual(changed);
          expect(await buscarContratante(s.org, s.party)).toEqual(updated);
          return updated.id;
        },
      );
    },
    negative: (s) => {
      const args = montarArgsAtualizacao(s.org, s.party, 1, form("Atualizado F5"));
      const own = table("contratantes", [...orgFilter(B), ["id", B.party]], ok(party(B)), true);
      return execute([own, rpc("atualizar_contratante", args, deny), own], async () => {
        const before = await buscarContratante(B.org, B.party);
        await expect(atualizarContratante(args)).rejects.toMatchObject({ tipo: "negado" });
        expect(await buscarContratante(B.org, B.party)).toEqual(before);
        return before.id;
      });
    },
  },
  {
    id: "0048",
    frontier: "contratos",
    operation: "read",
    role: "leitor",
    ...read("contratos", orgFilter, contract, contracts),
  },
  {
    id: "0049",
    frontier: "contratos",
    operation: "create",
    role: "gestor_contrato",
    positive: (s) => {
      const payload = {
        id_organizacao: s.org,
        id_contratante: s.party,
        numero: s.label,
        objeto: s.label,
        inicio: "2026-08-01",
      };
      return execute(
        [
          table("contratantes", orgFilter(s), ok([party(s)])),
          table("contratos", [], ok(null, 0), false, payload),
          table("contratos", orgFilter(s), ok([contract(s)])),
        ],
        async () => {
          const options = await buscarOpcoesContratantes({
            idOrganizacao: s.org,
            pagina: 1,
            busca: "",
          });
          expect(options.itens.map(({ id }) => id)).toEqual([s.party]);
          await inserirContrato({ ...payload, id_contratante: options.itens[0]!.id });
          const inserted = await contracts(s);
          expect(inserted.itens).toEqual([contract(s)]);
          return inserted.itens[0]!.id;
        },
      );
    },
    negative: (s) => {
      const payload = {
        id_organizacao: B.org,
        id_contratante: s.party,
        numero: B.label,
        objeto: B.label,
        inicio: "2026-08-01",
      };
      const own = table("contratos", orgFilter(B), ok([contract(B)]));
      return execute(
        [own, table("contratos", [], invalidAssociation, false, payload), own],
        async () => {
          const before = await contracts(B);
          await expect(inserirContrato(payload)).rejects.toMatchObject({ tipo: "invalido" });
          expect(await contracts(B)).toEqual(before);
          return before.itens[0]!.id;
        },
      );
    },
  },
  {
    id: "0057",
    frontier: "criar_competencia",
    operation: "create",
    role: "gestor_contrato",
    positive: (s) => {
      const filters: Filters = [...contractFilter(s), ["competencia_referencia", "2026-08-01"]];
      return execute(
        [
          rpc(rb, rbacArgs(s, s.contract), permission("competencias", "criar")),
          table("competencias", filters, ok(null, 0), true),
          rpc(
            "criar_competencia",
            { p_id_contrato: s.contract, p_competencia_referencia: "2026-08-01" },
            ok(s.competence),
          ),
          table("competencias", filters, ok({ id: s.competence }), true),
        ],
        async () => {
          expect(await consultarCapacidadeCriarCompetencia(s.org, s.contract)).toBe(true);
          expect(await verificarCompetenciaExistente(s.contract, month)).toBeNull();
          const id = await criarCompetencia(s.contract, month);
          expect(id).toBe(s.competence);
          expect(await verificarCompetenciaExistente(s.contract, month)).toBe(id);
          return id;
        },
      );
    },
    negative: (s) => {
      const own = table(
        "competencias",
        [...contractFilter(B), ["competencia_referencia", "2026-08-01"]],
        ok({ id: B.competence }),
        true,
      );
      return execute(
        [
          own,
          rpc(
            "criar_competencia",
            { p_id_contrato: s.contract, p_competencia_referencia: "2026-08-01" },
            deny,
          ),
          own,
        ],
        async () => {
          const before = await verificarCompetenciaExistente(B.contract, month);
          expect(before).toBe(B.competence);
          await expect(criarCompetencia(s.contract, month)).rejects.toMatchObject({
            tipo: "sem_permissao",
          });
          expect(await verificarCompetenciaExistente(B.contract, month)).toBe(before);
          return B.competence;
        },
      );
    },
  },
  {
    id: "0066",
    frontier: "relatorios_historicos_contratante",
    operation: "read",
    role: "leitor",
    ...read("relatorios_historicos_contratante", contractScope, report, history),
  },
  {
    id: "0067",
    frontier: "criar_organizacao",
    operation: "create",
    role: "leitor",
    positive: (s) => {
      const entry = audit(s, "OrganizacaoCriada", "organizacoes", s.org);
      return execute(
        [
          rpc(
            "criar_organizacao",
            { p_razao_social: s.label, p_timezone: "America/Sao_Paulo" },
            ok(s.org),
          ),
          rpc("listar_organizacoes_disponiveis", {}, ok([organization(s, "administrador")])),
          table("eventos_auditoria", auditFilter(s), ok([entry])),
        ],
        async () => {
          const newId = await criarOrganizacao({
            razaoSocial: s.label,
            nomeFantasia: "",
            cnpj: "",
          });
          expect(newId).toBe(s.org);
          expect(await listarOrganizacoesDisponiveis()).toEqual([organization(s, "administrador")]);
          definirPreferenciaOrganizacao(s.actor, newId);
          const auditTrail = await events(s);
          expect(auditTrail).toEqual({ total: 1, eventos: [entry] });
          return auditTrail.eventos[0]!.id;
        },
      );
    },
    negative: (s) =>
      execute(
        [
          rpc(
            "criar_organizacao",
            { p_razao_social: s.label, p_timezone: "America/Sao_Paulo" },
            deny,
          ),
        ],
        async () => {
          await expect(
            criarOrganizacao({ razaoSocial: s.label, nomeFantasia: "", cnpj: "" }),
          ).rejects.toMatchObject({ tipo: "negado" });
          expect(transport.from).not.toHaveBeenCalled();
          return B.org;
        },
      ),
  },
  {
    id: "0068",
    frontier: "eventos_auditoria",
    operation: "read",
    role: "administrador",
    positive: (s) =>
      execute(
        [
          rpc("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, ok(true)),
          table("eventos_auditoria", auditFilter(s), ok([audit(s)])),
        ],
        async () => {
          expect(await podeConsultarAuditoria(s.org)).toBe(true);
          const data = await events(s);
          expect(data).toEqual({ total: 1, eventos: [audit(s)] });
          return data.eventos[0]!.id;
        },
      ),
    negative: (s) =>
      execute([table("eventos_auditoria", auditFilter(s), deny)], async () => {
        await expect(events(s)).rejects.toThrow("Acesso não autorizado à trilha de auditoria.");
        return B.org;
      }),
  },
];

const observations: Record<string, unknown>[] = [];
function observe(
  action: Action,
  kind: "positive" | "negative",
  s: Scope,
  role: string,
  readback: Record<string, unknown>,
) {
  observations.push({
    caseId: "IFV1-F5-C" + action.id,
    kind,
    mode: "CODE_FIXTURE",
    actor: action.id === "0067" && kind === "negative" ? null : s.actor,
    role,
    tenant: action.id === "0067" && kind === "negative" ? null : s.org,
    target: A.org,
    frontier: action.frontier,
    operation: action.operation,
    decision: kind === "positive" ? "ALLOW" : "DENY",
    frontend: process.env["F5_FRONTEND_SHA"] ?? "",
    backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
    harness: process.env["F5_HARNESS_SHA"] ?? "",
    run: process.env["GITHUB_RUN_ID"] ?? "",
    attempt: process.env["GITHUB_RUN_ATTEMPT"] ?? "",
    job: process.env["JOB_ID"] ?? "",
    readback,
  });
}

beforeEach(() => {
  sessionStorage.clear();
  transport.rpc.mockReset();
  transport.from.mockReset();
});
describe("F5 SYS04 action isolation", () => {
  for (const action of actions) {
    it(`IFV1-F5-C${action.id} positive: authorized operation and scoped readback`, async () => {
      definirPreferenciaOrganizacao(A.actor, B.org);
      if (action.id !== "0067") definirPreferenciaOrganizacao(A.actor, A.org);
      const materialId = await action.positive(A);
      const foreignVisible = Object.values(B).includes(materialId);
      expect(foreignVisible).toBe(false);
      expect(obterPreferenciaOrganizacao(A.actor)).toBe(A.org);
      observe(action, "positive", A, action.role, {
        materialId,
        selected: obterPreferenciaOrganizacao(A.actor),
        foreignVisible,
        operations: requests.map(({ name }) => name),
      });
    });
    it(`IFV1-F5-C${action.id} negative: unauthorized operation has no material effect`, async () => {
      definirPreferenciaOrganizacao(A.actor, A.org);
      expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
      if (action.id !== "0067") definirPreferenciaOrganizacao(B.actor, B.org);
      const materialId = await action.negative(A);
      const refusal = requests.find(({ name, code }) => name === action.frontier && code !== null);
      const expected = action.id === "0049" ? invalidAssociation : deny;
      expect(refusal).toMatchObject({
        name: action.frontier,
        status: expected.status,
        code: expected.error?.code,
      });
      expect(obterPreferenciaOrganizacao(B.actor)).toBe(action.id === "0067" ? null : B.org);
      const mutationCount = requests.filter(
        ({ write, status, code }) => write && status < 400 && code === null,
      ).length;
      expect(mutationCount).toBe(0);
      const foreignVisible = Object.values(A).includes(materialId);
      expect(foreignVisible).toBe(false);
      observe(
        action,
        "negative",
        B,
        action.id === "0067" ? "anon" : action.id === "0049" ? "gestor_contrato" : "leitor",
        {
          ownMaterialId: materialId,
          selected: obterPreferenciaOrganizacao(B.actor),
          foreignVisible,
          mutationCount,
          status: refusal?.status,
          code: refusal?.code,
          operations: requests.map(({ name }) => name),
        },
      );
    });
  }
});
afterAll(() => {
  const path = process.env["F5_OBSERVATIONS"];
  if (path) {
    expect(observations).toHaveLength(actions.length * 2);
    writeFileSync(path, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
  }
});

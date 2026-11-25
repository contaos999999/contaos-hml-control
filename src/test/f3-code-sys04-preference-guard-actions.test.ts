import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import { criarOrganizacao } from "@/lib/organizacao/criarOrganizacaoDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  consultarCapacidadeCadastro,
  inserirContratante,
  montarPayload,
} from "@/lib/contratantes/novoContratanteDados";
import {
  consultarCapacidadeEdicaoContratante,
  buscarContratante,
  atualizarContratante,
  montarArgsAtualizacao,
} from "@/lib/contratantes/editarContratanteDados";
import {
  buscarOpcoesContratantes,
  organizacaoPermiteCadastro,
  inserirContrato,
} from "@/lib/contratos/novoContratoDados";
import {
  consultarCapacidadeCriarCompetencia,
  criarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  NEW = "c0200000-0000-4000-8000-000000000001",
  CONTRACT = "c0300000-0000-4000-8000-000000000002",
  PARTY = "c0300000-0000-4000-8000-000000000003",
  COMP = "c0300000-0000-4000-8000-000000000004",
  REPORT = "c0300000-0000-4000-8000-000000000005",
  FILE = "c0300000-0000-4000-8000-000000000006",
  EVENT = "c0300000-0000-4000-8000-000000000007",
  CORR = "c0300000-0000-4000-8000-000000000008";
const SOURCE = "src/test/f3-code-sys04-preference-guard-actions.test.ts",
  cases = [
    {
      caseId: "IFV1-F3-C0067",
      order: 2,
      destination: "V123",
      consumer: "eventos_auditoria",
      method: "GET",
    },
    {
      caseId: "IFV1-F3-C0046",
      order: 3,
      destination: "V102",
      consumer: "contratantes",
      method: "GET",
    },
    {
      caseId: "IFV1-F3-C0047",
      order: 3,
      destination: "V103",
      consumer: "contratantes",
      method: "GET",
    },
    {
      caseId: "IFV1-F3-C0049",
      order: 3,
      destination: "V105",
      consumer: "contratantes",
      method: "GET",
    },
    {
      caseId: "IFV1-F3-C0057",
      order: 3,
      destination: "V113",
      consumer: "criar_competencia",
      method: "POST",
    },
    {
      caseId: "IFV1-F3-C0066",
      order: 3,
      destination: "V122",
      consumer: "relatorios_historicos_contratante",
      method: "GET",
    },
    {
      caseId: "IFV1-F3-C0068",
      order: 3,
      destination: "V123",
      consumer: "eventos_auditoria",
      method: "GET",
    },
  ];
type Case = (typeof cases)[number];
let actor = "master",
  org = ORG,
  created = false,
  compCreated = false,
  writes = 0;
const events: Record<string, unknown>[] = [];
const observations: Record<string, unknown>[] = [];
const calls: Array<{ table: string; ops: Array<[string, unknown[]]> }> = [];
const ok = (data: unknown, count = 0) => ({ data, error: null, status: 200, count }),
  deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
const party = {
  id: PARTY,
  id_organizacao: ORG,
  razao_social: "Contratante F3",
  tipo_pessoa: "juridica",
  documento: null,
  nome_fantasia: null,
  contato: null,
  situacao: "ativo",
  versao_registro: 1,
  atualizado_em: "2026-11-01",
};
const form = {
  razaoSocial: "Contratante F3",
  tipoPessoa: "juridica",
  documento: "",
  nomeFantasia: "",
  email: "",
  telefone: "",
  situacao: "ativo",
};
function rpc(name: string, args: Record<string, unknown> = {}) {
  if (name === "criar_organizacao") {
    if (actor !== "master") return deny();
    expect(args).toMatchObject({
      p_razao_social: "Organização F3",
      p_timezone: "America/Sao_Paulo",
    });
    created = true;
    writes++;
    events.push({
      id: EVENT,
      evento: name,
      entidade: "organizacoes",
      id_entidade: NEW,
      correlation_id: CORR,
      criado_em: "2026-11-01",
      origem: "rpc",
      id_usuario: null,
    });
    return ok(NEW);
  }
  if (name === "listar_organizacoes_disponiveis")
    return ok(
      actor === "outsider"
        ? []
        : [
            {
              id: org,
              razao_social: "Organização F3",
              nome_fantasia: null,
              situacao: "ativa",
              perfil: actor === "master" ? "administrador_master" : "leitor",
            },
          ],
    );
  if (name === "consultar_permissoes_efetivas") {
    if (actor === "outsider" || args.p_id_organizacao !== org) return deny();
    return ok({
      schema_versao: "rbac-v1",
      versao: 1,
      master: actor === "master",
      permissoes:
        actor === "master"
          ? [
              { recurso: "contratantes", acao: "criar" },
              { recurso: "contratantes", acao: "editar" },
              { recurso: "contratos", acao: "criar" },
              { recurso: "competencias", acao: "criar" },
              { recurso: "historico", acao: "criar" },
            ]
          : [],
    });
  }
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args.p_id_organizacao === org);
  if (name === "atualizar_contratante") {
    if (actor !== "master") return deny();
    throw new Error("unexpected edit");
  }
  if (name === "criar_competencia") {
    if (actor !== "master") return deny();
    expect(args).toEqual({ p_id_contrato: CONTRACT, p_competencia_referencia: "2026-11-01" });
    compCreated = true;
    writes++;
    return ok(COMP);
  }
  throw new Error(name);
}
function response(c: (typeof calls)[number], single: boolean) {
  const has = (k: string, v: unknown) =>
    c.ops.some(([op, a]) => op === "eq" && a[0] === k && a[1] === v);
  if (actor === "outsider") return deny();
  if (c.ops.some(([op]) => op === "insert")) {
    if (actor !== "master") return deny();
    throw new Error("unexpected write");
  }
  if (c.table === "contratantes") {
    if (!has("id_organizacao", org)) return deny();
    return single ? ok(party) : ok([party], 1);
  }
  if (c.table === "competencias") {
    if (!has("id_contrato", CONTRACT)) return deny();
    return ok(compCreated ? { id: COMP } : null);
  }
  if (c.table === "relatorios_historicos_contratante") {
    if (!has("id_contrato", CONTRACT) || !has("id_organizacao", org)) return deny();
    return ok(
      [
        {
          id: REPORT,
          id_contrato: CONTRACT,
          id_organizacao: org,
          id_arquivo: FILE,
          numero_documento: null,
          tipo: "relatorio",
          competencia_referencia: "2026-10-01",
          data_documento: null,
          status_processamento: "concluido",
          resultado_geral: null,
          origem_temporal: "historico",
          criado_em: "2026-11-01",
        },
      ],
      1,
    );
  }
  if (c.table === "eventos_auditoria") {
    if (actor !== "master" || !has("id_organizacao", org)) return deny();
    return ok(events, events.length);
  }
  throw new Error(c.table);
}
function preference(user: string, id: string) {
  definirPreferenciaOrganizacao(user, id);
  expect(obterPreferenciaOrganizacao(user)).toBe(id);
  return obterPreferenciaOrganizacao(user)!;
}
async function produce(c: Case) {
  actor = "master";
  if (c.order === 2) {
    org = await criarOrganizacao({ razaoSocial: " Organização F3 ", nomeFantasia: "", cnpj: "" });
    expect(org).toBe(NEW);
    expect(created).toBe(true);
  } else
    events.push({
      id: EVENT,
      evento: "preferencia_fixture",
      entidade: "organizacoes",
      id_entidade: ORG,
      correlation_id: CORR,
      criado_em: "2026-11-01",
      origem: "rpc",
      id_usuario: null,
    });
  return preference("master", org);
}
async function consume(c: Case, negative: boolean) {
  const selected = preference(actor, org),
    signal = new AbortController().signal;
  if (c.destination === "V102") {
    const cap = await consultarCapacidadeCadastro(selected, actor);
    expect(!!cap).toBe(!negative);
    if (negative) {
      await expect(inserirContratante(montarPayload(selected, form))).rejects.toMatchObject({
        tipo: "negado",
      });
      return null;
    }
    const v = await buscarOpcoesContratantes({ idOrganizacao: selected, busca: "", pagina: 1 });
    expect(v.itens[0].id).toBe(PARTY);
    return { id: v.itens[0].id, allowed: true };
  }
  if (c.destination === "V103") {
    expect(await consultarCapacidadeEdicaoContratante(selected)).toBe(!negative);
    if (negative) {
      await expect(
        atualizarContratante(montarArgsAtualizacao(selected, PARTY, 1, form)),
      ).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const v = await buscarContratante(selected, PARTY);
    expect(v).toMatchObject({ id: PARTY, id_organizacao: org });
    return { id: v.id, allowed: true };
  }
  if (c.destination === "V105") {
    const available = await listarOrganizacoesDisponiveis();
    expect(organizacaoPermiteCadastro(available, selected)).toBe(!negative);
    if (negative) {
      await expect(
        inserirContrato({
          id_organizacao: selected,
          id_contratante: PARTY,
          numero: "F3",
          objeto: "F3",
          inicio: "2026-11-01",
        }),
      ).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const v = await buscarOpcoesContratantes({ idOrganizacao: selected, busca: "", pagina: 1 });
    expect(v.itens[0].id).toBe(PARTY);
    return { id: PARTY, allowed: true };
  }
  if (c.destination === "V113") {
    expect(await consultarCapacidadeCriarCompetencia(selected, CONTRACT)).toBe(!negative);
    if (negative) {
      await expect(criarCompetencia(CONTRACT, "2026-11")).rejects.toMatchObject({
        tipo: "sem_permissao",
      });
      return null;
    }
    const id = await criarCompetencia(CONTRACT, "2026-11");
    expect(await verificarCompetenciaExistente(CONTRACT, "2026-11")).toBe(id);
    return { id, allowed: true };
  }
  if (c.destination === "V122") {
    const p = await consultarPermissoesEfetivas(selected, CONTRACT);
    expect(temPermissao(p.permissoes, "historico", "criar")).toBe(!negative);
    if (negative) {
      actor = "outsider";
      await expect(listarRelatoriosHistoricos(CONTRACT, selected, 0, signal)).rejects.toMatchObject(
        { tipo: "negado" },
      );
      return null;
    }
    const v = await listarRelatoriosHistoricos(CONTRACT, selected, 0, signal);
    expect(v.itens[0]).toMatchObject({ id: REPORT, id_organizacao: org, id_contrato: CONTRACT });
    return { id: REPORT, allowed: true };
  }
  expect(await podeConsultarAuditoria(selected)).toBe(!negative);
  const query = obterEventosAuditoria({ idOrganizacao: selected, pagina: 0, correlationId: CORR });
  if (negative) {
    await expect(query).rejects.toThrow("Acesso não autorizado");
    return null;
  }
  const v = await query;
  expect(v.eventos[0]).toMatchObject({ id: EVENT, id_entidade: org, correlation_id: CORR });
  return { id: EVENT, allowed: true, entity: org };
}
describe("SYS04 selected context and denied consumer actions", () => {
  beforeEach(() => {
    actor = "master";
    org = ORG;
    created = false;
    compCreated = false;
    writes = 0;
    events.length = 0;
    calls.length = 0;
    sessionStorage.clear();
    m.rpc.mockReset();
    m.from.mockReset();
    m.rpc.mockImplementation((n: string, a: Record<string, unknown>) =>
      Promise.resolve().then(() => rpc(n, a)),
    );
    m.from.mockImplementation((table: string) => {
      const call = { table, ops: [] as Array<[string, unknown[]]> };
      calls.push(call);
      const b: Record<string, unknown> = {};
      for (const n of ["select", "eq", "order", "range", "abortSignal", "insert", "or"])
        b[n] = (...args: unknown[]) => {
          call.ops.push([n, args]);
          return b;
        };
      b.single = b.maybeSingle = () => Promise.resolve().then(() => response(call, true));
      b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => response(call, false))
          .then(res, rej);
      return b;
    });
  });
  for (const c of cases) {
    it(c.caseId + " positive", async () => {
      const id = await produce(c);
      const witness = await consume(c, false);
      expect(witness?.allowed).toBe(true);
      observations.push({
        caseId: c.caseId,
        consumer: c.consumer,
        producerOrder: c.order,
        kind: "positive",
        testId: SOURCE + ":" + c.caseId + ":positive",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: id,
        producerEntityId: id,
        network: {
          method: c.method,
          status: 200,
          [c.method === "GET" ? "table" : "rpc"]: c.consumer,
          fixture: true,
        },
        readback: { matched: true, destination: c.destination, selected: id, witness },
      });
    });
    it(c.caseId + " negative", async () => {
      const id = await produce(c);
      const before = writes;
      actor = "leitor";
      if (c.order === 2)
        await expect(
          criarOrganizacao({ razaoSocial: "Outra", nomeFantasia: "", cnpj: "" }),
        ).rejects.toMatchObject({ tipo: "negado" });
      expect(await consume(c, true)).toBeNull();
      expect(writes).toBe(before);
      expect(obterPreferenciaOrganizacao("leitor")).toBe(id);
      observations.push({
        caseId: c.caseId,
        consumer: c.consumer,
        producerOrder: c.order,
        kind: "negative",
        testId: SOURCE + ":" + c.caseId + ":negative",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: id,
        producerEntityId: id,
        network: {
          method: c.method,
          status: 403,
          [c.method === "GET" ? "table" : "rpc"]: c.consumer,
          fixture: true,
        },
        readback: {
          outcome: "DENY",
          destination: c.destination,
          selected: id,
          preferenceNotAuthorization: true,
          writesPreserved: true,
        },
      });
    });
  }
  afterAll(() => {
    const p = process.env.F3_CODE_PREF_GUARD_OBSERVATIONS;
    if (p) {
      expect(observations).toHaveLength(cases.length * 2);
      writeFileSync(p, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

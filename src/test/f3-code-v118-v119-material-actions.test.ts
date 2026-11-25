/** Actual V118/V119 command wrappers and read adapters; stateful local boundary fixture. */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import { decidirParecer, listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { aprovarApresentacao, registrarApresentacao } from "@/lib/competencias/apresentacaoDados";
import {
  obterVisaoGeral,
  parseVisaoGeral,
  classificarErroVisaoGeral,
  derivarEstadoVisual,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarApresentacoes, consultarProtocolo } from "@/lib/competencias/protocoloDados";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";

const ORG = "c1800000-0000-4000-8000-000000000001";
const CONTRACT = "c1800000-0000-4000-8000-000000000002";
const COMP = "c1800000-0000-4000-8000-000000000003";
const OPINION = "c1800000-0000-4000-8000-000000000004";
const PRESENTATION = "c1800000-0000-4000-8000-000000000005";
const PACKAGE = "c1800000-0000-4000-8000-000000000006";
const KEY = "c1800000-0000-4000-8000-000000000007";
const APPROVAL = "c1800000-0000-4000-8000-000000000008";
const EVENT = "c1800000-0000-4000-8000-000000000009";
const CORR = "c1800000-0000-4000-8000-000000000010";
const ITEM = "c1800000-0000-4000-8000-000000000011";
const VERSION = "c1800000-0000-4000-8000-000000000012";
const FOREIGN = "c1800000-0000-4000-8000-000000000013";
const DATE = "2026-11-01T12:00:00Z";
const HASH = "a".repeat(64);
const SOURCE = "src/test/f3-code-v118-v119-material-actions.test.ts";
const cases = [
  {
    caseId: "IFV1-F3-C0477",
    order: 18,
    destination: "V114",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0482",
    order: 18,
    destination: "V119",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0484",
    order: 18,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
  {
    caseId: "IFV1-F3-C0496",
    order: 19,
    destination: "V114",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0502",
    order: 19,
    destination: "V120",
    consumer: "apresentacoes_contratante",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F3-C0504",
    order: 19,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
];
type Case = (typeof cases)[number];
let actor = "master",
  approved = false,
  gateClear = false,
  approval = false,
  presented = false,
  registrationWrites = 0,
  opinionWrites = 0;
let currentVersion = VERSION;
let snapshot: Record<string, unknown> | null = null;
let presentation: Record<string, unknown> | null = null;
let events: Record<string, unknown>[] = [];
const scope = { id_competencia: COMP, id_contrato: CONTRACT, id_organizacao: ORG };
const observations: Record<string, unknown>[] = [];
const ok = (data: unknown, count = 0) => ({ data, error: null, status: 200, count });
const deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
const command = (order: number) =>
  order === 18 ? "aprovar_parecer_interno" : "registrar_apresentacao";
const entity = (order: number) => (order === 18 ? OPINION : PRESENTATION);
function audit(order: number) {
  events.push({
    id: EVENT,
    criado_em: DATE,
    evento: command(order),
    entidade: order === 18 ? "pareceres_internos" : "apresentacoes_contratante",
    origem: "rpc",
    id_usuario: null,
    id_entidade: entity(order),
    correlation_id: order === 18 ? CORR : KEY,
  });
}
function rpc(name: string, args: Record<string, unknown>) {
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args.p_id_organizacao === ORG);
  if (name === "aprovar_parecer_interno") {
    if (actor !== "master" || args.p_id_parecer !== OPINION) return deny();
    if (args.p_aprovar !== true) throw new Error("unexpected approval command");
    approved = true;
    opinionWrites++;
    audit(18);
    return ok(null);
  }
  if (name === "aprovar_apresentacao") {
    if (actor !== "master" || args.p_id_competencia !== COMP || !gateClear || !approved)
      return deny();
    approval = true;
    return ok({
      id_aprovacao: APPROVAL,
      situacao: "pode_apresentar_contratante",
      percentual_conformidade: 100,
    });
  }
  if (name === "registrar_apresentacao") {
    if (actor !== "master" || args.p_id_competencia !== COMP || !approval || !gateClear)
      return deny();
    if (
      args.p_idempotency_key !== KEY ||
      args.p_protocolo !== "F3-119" ||
      args.p_forma_apresentacao !== "eletronica"
    )
      throw new Error("wrong intent");
    if (!presented) {
      registrationWrites++;
      presented = true;
      presentation = {
        id: PRESENTATION,
        ...scope,
        id_pacote: PACKAGE,
        protocolo: String(args.p_protocolo),
        forma_apresentacao: String(args.p_forma_apresentacao),
        apresentado_em: DATE,
        tipo: "original",
        numero_rodada: 1,
      };
      snapshot = {
        id: ITEM,
        id_pacote: PACKAGE,
        ...scope,
        entidade_tipo: "documento",
        entidade_id: OPINION,
        versao_id: currentVersion,
        hash: HASH,
        ordem: 1,
      };
      audit(19);
    }
    return ok(PRESENTATION);
  }
  if (name === "obter_visao_geral_competencia") {
    if (actor === "outsider" || args.p_id_competencia !== COMP) return deny();
    const pending = gateClear ? 0 : 1,
      counts = {
        pendentes: pending,
        nao_conformes: pending,
        inconclusivos: 0,
        em_analise: 0,
        nao_conformidades_bloqueantes: pending,
      };
    return ok({
      competencia: {
        id: COMP,
        id_contrato: CONTRACT,
        id_organizacao: ORG,
        competencia_referencia: "2026-11-01",
        periodo_inicio: null,
        periodo_fim: null,
        data_limite: null,
        atualizado_em: DATE,
        situacao: presented
          ? "apresentado"
          : approval
            ? "pode_apresentar_contratante"
            : "pendente_correcao",
        percentual_conformidade: gateClear ? 100 : 50,
        versao_pacote_atual: presented ? 1 : null,
        versao_registro: 2,
      },
      portao: {
        ...counts,
        liberado: gateClear,
        total: 2,
        conformes_ou_na_validos: gateClear ? 2 : 1,
        percentual: gateClear ? 100 : 50,
      },
      blocking_summary: {
        ...counts,
        parecer_aprovado: approved,
        analise_concluida_atual: true,
        aprovacao_apresentacao_atual: approval,
      },
      allowed_actions: {
        abrir_documentos: true,
        analisar: actor === "master",
        abrir_parecer: true,
        apresentar: actor === "master" && approval && gateClear && !presented,
      },
    });
  }
  throw new Error("unexpected RPC " + name);
}
function data(table: string, filters: unknown[][], single: boolean) {
  const has = (k: string, v: string) => filters.some(([key, value]) => key === k && value === v);
  if (actor === "outsider" || !has("id_organizacao", ORG)) return deny();
  if (table === "eventos_auditoria") {
    if (actor !== "master") return deny();
    const selected = events.filter((e) => has("correlation_id", String(e.correlation_id)));
    return ok(selected, selected.length);
  }
  if (!has("id_competencia", COMP) || !has("id_contrato", CONTRACT)) return deny();
  if (table === "pareceres_internos")
    return ok(
      [
        {
          id: OPINION,
          ...scope,
          autor: null,
          texto: "Parecer F3",
          status: approved ? "aprovado" : "pendente",
          versao: 1,
          hash: HASH,
          criado_em: DATE,
          aprovado_por: approved ? APPROVAL : null,
          aprovado_em: approved ? DATE : null,
        },
      ],
      1,
    );
  if (table === "apresentacoes_contratante")
    return single
      ? ok(has("id", PRESENTATION) ? presentation : null)
      : ok(presentation ? [presentation] : [], presentation ? 1 : 0);
  if (table === "pacotes_competencia") {
    if (!single || !has("id", PACKAGE) || !presented) throw new Error("wrong package");
    return ok({
      id: PACKAGE,
      ...scope,
      hash_pacote: HASH,
      numero: 1,
      tipo: "original",
      status: "congelado",
      congelado_em: DATE,
    });
  }
  if (table === "itens_pacote_competencia") {
    if (!has("id_pacote", PACKAGE) || !snapshot) throw new Error("wrong snapshot");
    return ok([snapshot], 1);
  }
  throw new Error("unexpected table " + table);
}
async function overview() {
  const r = await obterVisaoGeral(COMP, new AbortController().signal);
  expect(m.rpc).toHaveBeenLastCalledWith("obter_visao_geral_competencia", {
    p_id_competencia: COMP,
  });
  const parsed = parseVisaoGeral(r.data);
  expect(parsed?.competencia).toMatchObject({
    id: COMP,
    id_organizacao: ORG,
    id_contrato: CONTRACT,
  });
  if (!parsed) throw new Error("invalid overview");
  return parsed;
}
async function readOpinion() {
  const p = await listarPareceres(COMP, ORG, CONTRACT, 0, new AbortController().signal);
  expect(p.itens).toHaveLength(1);
  expect(p.itens[0]).toMatchObject({ id: OPINION, ...scope, hash: HASH });
  return p.itens[0];
}
async function readProtocol() {
  const signal = new AbortController().signal;
  const list = await listarApresentacoes(COMP, ORG, CONTRACT, 0, signal);
  expect(list.itens).toHaveLength(1);
  expect(list.itens[0]).toMatchObject({
    id: PRESENTATION,
    ...scope,
    id_pacote: PACKAGE,
    protocolo: "F3-119",
  });
  const p = await consultarProtocolo(COMP, PRESENTATION, ORG, CONTRACT, 0, signal);
  expect(p?.pacote).toMatchObject({
    id: PACKAGE,
    ...scope,
    hash_pacote: HASH,
    status: "congelado",
  });
  expect(p?.itens).toHaveLength(1);
  expect(p?.itens[0]).toMatchObject({
    id: ITEM,
    id_pacote: PACKAGE,
    versao_id: VERSION,
    hash: HASH,
    ...scope,
  });
  if (!p) throw new Error("missing protocol");
  return {
    packageId: p.pacote.id,
    hash: p.pacote.hash_pacote,
    protocol: p.apresentacao.protocolo,
    versionId: p.itens[0].versao_id,
  };
}
async function produce(c: Case) {
  actor = "master";
  if (c.order === 18) {
    expect((await readOpinion()).status).toBe("pendente");
    expect((await overview()).blocking_summary.parecer_aprovado).toBe(false);
    await decidirParecer(OPINION, true, "Fundamento F3");
    expect(m.rpc).toHaveBeenLastCalledWith(command(18), {
      p_id_parecer: OPINION,
      p_aprovar: true,
      p_fundamento: "Fundamento F3",
    });
    expect((await readOpinion()).status).toBe("aprovado");
    expect(opinionWrites).toBe(1);
    return OPINION;
  }
  approved = true;
  gateClear = true;
  expect((await aprovarApresentacao(COMP, "Fundamento F3")).id_aprovacao).toBe(APPROVAL);
  const id = await registrarApresentacao(COMP, KEY, " F3-119 ", " eletronica ");
  expect(m.rpc).toHaveBeenLastCalledWith(command(19), {
    p_id_competencia: COMP,
    p_idempotency_key: KEY,
    p_protocolo: "F3-119",
    p_forma_apresentacao: "eletronica",
  });
  expect(id).toBe(PRESENTATION);
  expect(await registrarApresentacao(COMP, KEY, "F3-119", "eletronica")).toBe(id);
  expect(registrationWrites).toBe(1);
  expect(events).toHaveLength(1);
  const before = await readProtocol();
  currentVersion = FOREIGN;
  expect(await readProtocol()).toEqual(before);
  return id;
}
async function consume(c: Case, negative: boolean) {
  const signal = new AbortController().signal;
  if (c.destination === "V123") {
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const id = c.order === 18 ? CORR : KEY;
    const p = obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0, correlationId: id });
    if (negative) {
      await expect(p).rejects.toThrow("Acesso não autorizado");
      return null;
    }
    const v = await p;
    expect(v.total).toBe(1);
    expect(v.eventos[0]).toMatchObject({
      id: EVENT,
      id_entidade: entity(c.order),
      evento: command(c.order),
      correlation_id: id,
    });
    return {
      eventId: v.eventos[0].id,
      entity: v.eventos[0].id_entidade,
      correlation: v.eventos[0].correlation_id,
    };
  }
  if (c.destination === "V120") {
    if (negative) {
      await expect(listarApresentacoes(COMP, ORG, CONTRACT, 0, signal)).rejects.toMatchObject({
        tipo: "sem_permissao",
      });
      await expect(
        consultarProtocolo(COMP, PRESENTATION, ORG, CONTRACT, 0, signal),
      ).rejects.toMatchObject({ tipo: "sem_permissao" });
      return null;
    }
    return readProtocol();
  }
  if (negative) {
    const r = await obterVisaoGeral(COMP, signal);
    expect(classificarErroVisaoGeral(r.error, r.status)).toBe("sem_permissao");
    expect(parseVisaoGeral(r.data)).toBeNull();
    return null;
  }
  const v = await overview();
  if (c.order === 18) {
    expect(v.blocking_summary.parecer_aprovado).toBe(true);
    expect(v.portao.liberado).toBe(false);
    expect(v.portao.percentual).toBe(50);
    expect(v.allowed_actions.apresentar).toBe(false);
    if (c.destination === "V119") expect(derivarEstadoVisual(v)).toBe("blocked");
    return {
      scope: v.competencia.id,
      approved: v.blocking_summary.parecer_aprovado,
      gate: v.portao.liberado,
      percent: v.portao.percentual,
      canPresent: v.allowed_actions.apresentar,
    };
  }
  expect(v.competencia.situacao).toBe("apresentado");
  expect(v.competencia.versao_pacote_atual).toBe(1);
  expect(derivarEstadoVisual(v)).toBe("presented");
  return {
    scope: v.competencia.id,
    state: v.competencia.situacao,
    packageVersion: v.competencia.versao_pacote_atual,
    canPresent: v.allowed_actions.apresentar,
  };
}
describe("V118/V119 material commands and consumers", () => {
  beforeEach(() => {
    actor = "master";
    approved = false;
    gateClear = false;
    approval = false;
    presented = false;
    registrationWrites = 0;
    opinionWrites = 0;
    events = [];
    snapshot = null;
    presentation = null;
    currentVersion = VERSION;
    m.rpc.mockReset();
    m.from.mockReset();
    m.rpc.mockImplementation((name: string, args: Record<string, unknown>) => {
      const p = Promise.resolve().then(() => rpc(name, args));
      return Object.assign(p, { abortSignal: () => p });
    });
    m.from.mockImplementation((table: string) => {
      const filters: unknown[][] = [],
        b: Record<string, unknown> = {};
      for (const n of ["select", "order", "range", "abortSignal"]) b[n] = () => b;
      b.eq = (...args: unknown[]) => {
        filters.push(args);
        return b;
      };
      b.maybeSingle = () => Promise.resolve().then(() => data(table, filters, true));
      b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => data(table, filters, false))
          .then(res, rej);
      return b;
    });
  });
  for (const c of cases) {
    it(c.caseId + " positive: real command, readback and consumer", async () => {
      const id = await produce(c);
      let witness: unknown = null;
      for (const role of c.reader ? ["master", "leitor"] : ["master"]) {
        actor = role;
        witness = await consume(c, false);
        expect(witness).not.toBeNull();
      }
      observations.push({
        caseId: c.caseId,
        consumer: c.consumer,
        producerOrder: c.order,
        kind: "positive",
        testId: SOURCE + ":" + c.caseId + ":positive",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
        producerEntityId: id,
        network: {
          method: c.method,
          status: 200,
          [c.method === "GET" ? "table" : "rpc"]: c.consumer,
          fixture: true,
        },
        readback: {
          matched: true,
          destination: c.destination,
          competenceId: COMP,
          contractId: CONTRACT,
          roles: c.reader ? 2 : 1,
          writes: c.order === 18 ? opinionWrites : registrationWrites,
          witness,
        },
      });
    });
    it(c.caseId + " negative: denied command and consumer preserve material state", async () => {
      const id = await produce(c);
      actor = "leitor";
      if (c.order === 18)
        await expect(decidirParecer(OPINION, true, "Leitor")).rejects.toMatchObject({
          tipo: "sem_permissao",
        });
      else
        await expect(
          registrarApresentacao(COMP, KEY, "F3-119", "eletronica"),
        ).rejects.toMatchObject({ tipo: "sem_permissao" });
      actor = c.reader ? "outsider" : "leitor";
      expect(await consume(c, true)).toBeNull();
      actor = "master";
      if (c.order === 18) {
        expect((await readOpinion()).status).toBe("aprovado");
        expect(opinionWrites).toBe(1);
      } else {
        await readProtocol();
        expect(registrationWrites).toBe(1);
      }
      expect(events).toHaveLength(1);
      observations.push({
        caseId: c.caseId,
        consumer: c.consumer,
        producerOrder: c.order,
        kind: "negative",
        testId: SOURCE + ":" + c.caseId + ":negative",
        state: "EXECUTED",
        assertion: "PASS",
        organizationId: ORG,
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
          competenceId: COMP,
          contractId: CONTRACT,
          mutationDenied: true,
          entityPreserved: true,
          writes: c.order === 18 ? opinionWrites : registrationWrites,
        },
      });
    });
  }
  afterAll(() => {
    const path = process.env.F3_CODE_MATERIAL_OBSERVATIONS;
    if (path) {
      expect(observations).toHaveLength(cases.length * 2);
      writeFileSync(path, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

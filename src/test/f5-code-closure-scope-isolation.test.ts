import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { registrarApresentacao } from "@/lib/competencias/apresentacaoDados";
import {
  classificarErroV116,
  FILTROS_VAZIOS,
  obterAnaliseCompetencia,
  OFFSETS_ZERO,
  parseAnaliseV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  classificarErroVisaoGeral,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { decidirParecer, listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { consultarProtocolo, listarApresentacoes } from "@/lib/competencias/protocoloDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  listarRelatoriosHistoricos,
  listarRegrasHistoricas,
} from "@/lib/contratos/historicoContratoDados";
import {
  consultarEstadoDocumentoHistorico,
  podeFinalizarIngestao,
  registrarRelatorioHistorico,
} from "@/lib/contratos/ingestaoHistoricoDados";
import {
  createObservationWriter,
  denied,
  digest,
  eq,
  fixtureDate,
  fixtureTransport,
  pagination,
  reply,
  signal,
  tenantA as A,
  tenantB as B,
  type Scope,
} from "./f5-code-competence-fixture";

const wire = vi.hoisted(() => ({ fetch: vi.fn(), session: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f5-competence.invalid", "fixture-key", {
      accessToken: async () => wire.session,
      global: { fetch: (input, init) => wire.fetch(input, init) },
    }),
  };
});

const actions = {
  V118: {
    producer: "aprovar_parecer_interno",
    operation: "approve",
    event: "ParecerInternoRevisado",
    entity: "pareceres_internos",
    subject: 23,
  },
  V119: {
    producer: "registrar_apresentacao",
    operation: "register",
    event: "ApresentacaoRegistrada",
    entity: "apresentacoes_contratante",
    subject: 25,
  },
  V122: {
    producer: "registrar_relatorio_historico_hml",
    operation: "import",
    event: "HistoricoImportacaoRegistrada",
    entity: "relatorios_historicos_contratante",
    subject: 30,
  },
} as const;
const entries = [
  ["0477", "V118", "V114", "obter_visao_geral_competencia"],
  ["0482", "V118", "V119", "obter_visao_geral_competencia"],
  ["0484", "V118", "V123", "eventos_auditoria"],
  ["0496", "V119", "V114", "obter_visao_geral_competencia"],
  ["0502", "V119", "V120", "apresentacoes_contratante"],
  ["0504", "V119", "V123", "eventos_auditoria"],
  ["0562", "V122", "V116", "obter_analise_competencia_v116"],
  ["0563", "V122", "V117", "obter_detalhe_requisito_v117"],
  ["0564", "V122", "V121", "relatorios_historicos_contratante"],
  ["0567", "V122", "V123", "eventos_auditoria"],
] as const;
const cases = entries.map(([id, origin, destination, consumer]) => ({
  id,
  origin,
  destination,
  consumer,
  ...actions[origin],
}));
type Case = (typeof cases)[number];
type State = {
  mutations: number;
  currentVersion: string;
  frozenVersion: string | null;
  author: string;
  presented: boolean;
  approved: boolean;
  imported: boolean;
};
const ledger = new Map<string, State>();
let currentCase: Case;
let transport: ReturnType<typeof fixtureTransport>;
const observations = createObservationWriter();
const scopeRecord = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.id(21) });
const scopeFilters = (s: Scope) => ({ id_organizacao: eq(s.org), id_contrato: eq(s.id(21)) });
const child = (s: Scope) => ({ ...scopeRecord(s), id_competencia: s.id(22) });
const childFilters = (s: Scope) => ({ ...scopeFilters(s), id_competencia: eq(s.id(22)) });
const state = (s: Scope) => ledger.get(s.org)!;
const deniedResponse = () => reply(denied, 403);
const month = "2026-10";
const protocolNumber = "PROTOCOLO-F56";
const contextHash = (s: Scope) => digest("contexto F5.6 " + s.org);
const documentHash = (s: Scope) => digest("versão documental F5.6 " + s.org);
const opinionHash = (s: Scope) => digest("parecer F5.6 " + s.org);
const packageHash = (s: Scope) => digest(opinionHash(s) + "|" + documentHash(s));
const blocked = () => currentCase.origin === "V118";
const competence = (s: Scope) => ({
  id: s.id(22),
  ...scopeRecord(s),
  competencia_referencia: "2026-11-01",
  periodo_inicio: "2026-11-01",
  periodo_fim: "2026-11-30",
  data_limite: null,
  atualizado_em: fixtureDate,
  versao_registro: 1,
  situacao: state(s).presented
    ? "aguardando_contratante"
    : currentCase.origin === "V119"
      ? "pode_apresentar_contratante"
      : "pendente_correcao",
  percentual_conformidade: blocked() ? 50 : 100,
  versao_pacote_atual: state(s).presented ? 1 : null,
});
const blocker = () => ({
  pendentes: 0,
  nao_conformes: Number(blocked()),
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: Number(blocked()),
});
const view = (s: Scope) => ({
  competencia: competence(s),
  portao: {
    ...blocker(),
    liberado: !blocked(),
    total: 2,
    conformes_ou_na_validos: blocked() ? 1 : 2,
    percentual: blocked() ? 50 : 100,
  },
  blocking_summary: {
    ...blocker(),
    parecer_aprovado: state(s).approved,
    analise_concluida_atual: true,
    aprovacao_apresentacao_atual: currentCase.origin === "V119",
  },
  allowed_actions: {
    abrir_documentos: true,
    analisar: s.role === "administrador",
    abrir_parecer: true,
    apresentar: s.role === "administrador" && currentCase.origin === "V119" && !state(s).presented,
  },
});
const opinion = (s: Scope) => ({
  ...child(s),
  id: s.id(23),
  autor: state(s).author,
  texto: "Parecer da competência atual",
  versao: 1,
  hash: opinionHash(s),
  status: state(s).approved ? "aprovado" : "rascunho",
  criado_em: fixtureDate,
  aprovado_por: state(s).approved ? s.actor : null,
  aprovado_em: state(s).approved ? fixtureDate : null,
});
const presentation = (s: Scope) => ({
  ...child(s),
  id: s.id(25),
  id_pacote: s.id(26),
  protocolo: protocolNumber,
  forma_apresentacao: "eletronica",
  apresentado_em: fixtureDate,
  tipo: "apresentacao",
  numero_rodada: 1,
});
const packet = (s: Scope) => ({
  ...child(s),
  id: s.id(26),
  hash_pacote: packageHash(s),
  numero: 1,
  tipo: "apresentacao",
  status: "apresentado",
  congelado_em: fixtureDate,
});
const packageItem = (s: Scope) => ({
  ...child(s),
  id: s.id(27),
  id_pacote: s.id(26),
  entidade_tipo: "documento_competencia",
  entidade_id: s.id(38),
  versao_id: state(s).frozenVersion,
  hash: documentHash(s),
  ordem: 1,
});
const report = (s: Scope) => ({
  ...scopeRecord(s),
  id: s.id(30),
  id_arquivo: s.id(31),
  numero_documento: null,
  tipo: "relatorio_contratante",
  competencia_referencia: month + "-01",
  data_documento: null,
  status_processamento: "pendente",
  resultado_geral: null,
  origem_temporal: "pre_implantacao",
  criado_em: fixtureDate,
});
const auditEvent = (c: Case, s: Scope) => ({
  id: s.id(32),
  id_entidade: s.id(c.subject),
  id_usuario: s.actor,
  origem: "usuario",
  correlation_id: s.id(33),
  evento: c.event,
  entidade: c.entity,
  criado_em: fixtureDate,
});
const exec = (s: Scope) => ({
  id: s.id(34),
  status: "concluida",
  tipo: "completa",
  hash_entrada: contextHash(s),
});
const result = (s: Scope) => ({
  id: s.id(35),
  id_execucao: s.id(34),
  resultado: "conforme",
  mecanismo: "deterministico",
});
const requirement = (s: Scope) => ({
  id: s.id(36),
  codigo: "F56",
  aplicavel: true,
  impeditivo: true,
});
const actionsForRead = (s: Scope) => ({
  executar_analise: false,
  reanalisar: s.role === "administrador",
  abrir_requisito: true,
});
const evidence = (s: Scope) => ({
  id: s.id(37),
  tipo_evidencia: "documento",
  pagina: 1,
  trecho: "Fonte atual da competência",
  hash: documentHash(s),
  documento: {
    id_versao_documento: s.id(28),
    hash_versao: documentHash(s),
    status_seguranca: "aprovado",
  },
});
const analysisPayload = (s: Scope) => ({
  schema_versao: "v116-v1",
  competencia: competence(s),
  estado_analise: "complete",
  stale: false,
  percentual: 100,
  blocking_summary: blocker(),
  allowed_actions: actionsForRead(s),
  execucao_atual: exec(s),
  mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
  resultados: [
    {
      ...result(s),
      id_resultado: s.id(35),
      id_requisito: s.id(36),
      requisito: requirement(s),
      evidencias: [evidence(s)],
    },
  ],
  resultados_paginacao: pagination(25, 1),
  execucoes: [exec(s)],
  execucoes_paginacao: pagination(10, 1),
  apontamentos: [],
  apontamentos_paginacao: pagination(25),
});
const detailPayload = (s: Scope) => ({
  schema_versao: "v117-v1",
  competencia: competence(s),
  requisito: requirement(s),
  execucao_atual: exec(s),
  resultado_atual: result(s),
  resultado_referencia: result(s),
  na_validade: null,
  allowed_actions: actionsForRead(s),
  evidencias: [evidence(s)],
  evidencias_paginacao: pagination(25, 1),
  historico: [],
  historico_paginacao: pagination(25),
  apontamentos: [],
  apontamentos_paginacao: pagination(25),
});

function serve(actor: Scope, path: string, args: Record<string, unknown>, method: string) {
  const route = path.replace(/^rpc\//, "");
  expect(method).toBe(path.startsWith("rpc/") ? "POST" : "GET");
  const target = [A, B].find((s) =>
    Object.values(args).some((v) =>
      [s.org, eq(s.org), s.id(22), s.id(23), s.id(31)].includes(String(v)),
    ),
  );
  if (!target) throw Error("Missing synthetic context for " + path);
  const own = actor.org === target.org;
  const st = state(target);
  if (route === currentCase.producer) {
    if (currentCase.origin === "V118") {
      expect(args).toEqual({
        p_id_parecer: target.id(23),
        p_aprovar: true,
        p_fundamento: "Fundamento F56",
      });
      if (!own || actor.role !== "administrador") return deniedResponse();
      if (actor.actor === opinion(target).autor) return reply({ code: "P0001" }, 400);
      st.approved = true;
      st.mutations++;
      return reply(null);
    }
    if (currentCase.origin === "V119") {
      expect(args).toEqual({
        p_id_competencia: target.id(22),
        p_idempotency_key: target.id(29),
        p_protocolo: protocolNumber,
        p_forma_apresentacao: "eletronica",
      });
      if (!own || actor.role !== "administrador") return deniedResponse();
      if (!st.presented) {
        expect(view(target).allowed_actions.apresentar).toBe(true);
        st.frozenVersion = st.currentVersion;
        st.presented = true;
        st.mutations++;
      }
      return reply(target.id(25));
    }
    expect(args).toEqual({
      p_id_arquivo: target.id(31),
      p_competencia: month + "-01",
      p_tipo: "relatorio_contratante",
    });
    if (!own || actor.role !== "administrador") return deniedResponse();
    if (!st.imported) {
      st.imported = true;
      st.mutations++;
    }
    return reply(target.id(30));
  }
  if (route === "obter_visao_geral_competencia") {
    expect(args).toEqual({ p_id_competencia: target.id(22) });
    return own ? reply(view(target)) : deniedResponse();
  }
  if (route === "pareceres_internos") {
    expect(args).toEqual(childFilters(target));
    return reply(own ? [opinion(target)] : []);
  }
  if (route === "apresentacoes_contratante") {
    const exactId = Object.hasOwn(args, "id") ? { id: eq(target.id(25)) } : {};
    expect(args).toEqual({ ...exactId, ...childFilters(target) });
    return reply(own && st.presented ? [presentation(target)] : []);
  }
  if (route === "pacotes_competencia") {
    expect(args).toEqual({ id: eq(target.id(26)), ...childFilters(target) });
    return reply(own && st.presented ? [packet(target)] : []);
  }
  if (route === "itens_pacote_competencia") {
    expect(args).toEqual({ id_pacote: eq(target.id(26)), ...childFilters(target) });
    return reply(own && st.presented ? [packageItem(target)] : []);
  }
  if (route === "pode_consultar_auditoria_organizacao") {
    expect(args).toEqual({ p_id_organizacao: target.org });
    return reply(own && actor.role === "administrador");
  }
  if (route === "eventos_auditoria") {
    expect(args).toEqual({
      id_organizacao: eq(target.org),
      evento: eq(currentCase.event),
      entidade: eq(currentCase.entity),
      id_usuario: eq(target.actor),
      correlation_id: eq(target.id(33)),
    });
    return reply(
      own && actor.role === "administrador" && st.mutations > 0
        ? [auditEvent(currentCase, target)]
        : [],
    );
  }
  if (route === "relatorios_historicos_contratante" || route === "regras_preventivas") {
    expect(args).toEqual(scopeFilters(target));
    return reply(
      own && st.imported && route === "relatorios_historicos_contratante" ? [report(target)] : [],
    );
  }
  if (
    route === "arquivos" ||
    route === "versoes_documento" ||
    route === "processamentos_documento"
  ) {
    const scope = scopeRecord(target);
    if (route === "arquivos") {
      expect(args).toEqual({ ...scopeFilters(target), id: eq(target.id(31)) });
      return reply(own ? [{ ...scope, id: target.id(31), status_seguranca: "aprovado" }] : []);
    }
    if (route === "versoes_documento") {
      expect(args).toEqual({ ...scopeFilters(target), id: eq(target.id(39)) });
      return reply(own ? [{ ...scope, id: target.id(39), id_arquivo: target.id(31) }] : []);
    }
    expect(args).toEqual({ ...scopeFilters(target), id_versao_documento: eq(target.id(39)) });
    return reply(
      own
        ? [
            {
              ...scope,
              id: target.id(40),
              id_versao_documento: target.id(39),
              status: "concluido",
              criado_em: fixtureDate,
            },
          ]
        : [],
    );
  }
  if (route === "obter_analise_competencia_v116") {
    expect(args).toEqual({
      p_id_competencia: target.id(22),
      p_resultados_offset: 0,
      p_resultados_limite: 25,
      p_execucoes_offset: 0,
      p_execucoes_limite: 10,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
      p_filtro_resultado: null,
      p_filtro_criticidade: null,
      p_filtro_mecanismo: null,
      p_filtro_apontamento_status: null,
      p_busca: null,
    });
    return own ? reply(analysisPayload(target)) : deniedResponse();
  }
  if (route === "obter_detalhe_requisito_v117") {
    expect(args).toEqual({
      p_id_competencia: target.id(22),
      p_id_requisito: target.id(36),
      p_evidencias_offset: 0,
      p_evidencias_limite: 25,
      p_historico_offset: 0,
      p_historico_limite: 25,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
    });
    return own ? reply(detailPayload(target)) : deniedResponse();
  }
  throw Error("Unexpected request " + path);
}

beforeEach(() => {
  transport = fixtureTransport(serve);
  wire.fetch.mockReset().mockImplementation(transport.fetch);
});
afterAll(observations.write);

async function overview(s: Scope, own: boolean) {
  const r = await obterVisaoGeral(s.id(22), signal());
  const data = parseVisaoGeral(r.data);
  if (!own) {
    expect(classificarErroVisaoGeral(r.error, r.status)).toBe("sem_permissao");
    expect(data).toBeNull();
    return null;
  }
  expect(data?.competencia).toMatchObject({ id: s.id(22), ...scopeRecord(s) });
  return data!;
}
const opinions = (s: Scope) => listarPareceres(s.id(22), s.org, s.id(21), 0, signal());
const presentations = (s: Scope) => listarApresentacoes(s.id(22), s.org, s.id(21), 0, signal());
const receipt = (s: Scope) => consultarProtocolo(s.id(22), s.id(25), s.org, s.id(21), 0, signal());
const history = (s: Scope) => listarRelatoriosHistoricos(s.id(21), s.org, 0, signal());
async function auditor(c: Case, s: Scope, expected: boolean) {
  const allowed = wire.session === s.session && s.role === "administrador";
  expect(await podeConsultarAuditoria(s.org)).toBe(allowed);
  const found = await obterEventosAuditoria({
    idOrganizacao: s.org,
    pagina: 0,
    evento: c.event,
    entidade: c.entity,
    idUsuario: s.actor,
    correlationId: s.id(33),
  });
  expect(found.eventos).toEqual(expected ? [auditEvent(c, s)] : []);
  return found.eventos[0] ?? null;
}
async function analysis(s: Scope, own: boolean) {
  const r = await obterAnaliseCompetencia(s.id(22), FILTROS_VAZIOS, OFFSETS_ZERO, signal());
  const data = parseAnaliseV116(r.data);
  if (!own) {
    expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
    expect(data).toBeNull();
    return null;
  }
  expect(r.data).toMatchObject({ competencia: { id: s.id(22), ...scopeRecord(s) } });
  expect(data).toMatchObject({
    stale: false,
    execucao_atual: exec(s),
    resultados: [{ id_resultado: s.id(35) }],
  });
  return data!;
}
async function detail(s: Scope, own: boolean) {
  const r = await obterDetalheRequisito(s.id(22), s.id(36), OFFSETS_DETALHE_ZERO, signal());
  const data = parseDetalheV117(r.data, s.id(22), s.id(36), OFFSETS_DETALHE_ZERO);
  if (!own) {
    expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
    expect(data).toBeNull();
    return null;
  }
  expect(data).toMatchObject({
    requisito: { id: s.id(36) },
    resultado_atual: { id: s.id(35) },
    evidencias: [{ documento: { id_versao_documento: s.id(28) } }],
  });
  return data!;
}
async function consume(c: Case, s: Scope, own: boolean) {
  if (c.destination === "V123") return auditor(c, s, own);
  if (c.destination === "V116") {
    const data = await analysis(s, own);
    return data
      ? {
          resultId: data.resultados[0]!.id_resultado,
          execution: data.execucao_atual!.id,
          hash: data.execucao_atual!.hash_entrada,
        }
      : null;
  }
  if (c.destination === "V117") {
    const data = await detail(s, own);
    return data
      ? {
          resultId: data.resultado_atual!.id,
          requirementId: data.requisito.id,
          versionId: data.evidencias[0]!.documento!.id_versao_documento,
        }
      : null;
  }
  if (c.destination === "V121") {
    const p = await history(s);
    expect(p.total).toBe(Number(own));
    return p.itens[0] ?? null;
  }
  if (c.destination === "V120") {
    const p = await presentations(s);
    expect(p.total).toBe(Number(own));
    const snapshot = await receipt(s);
    if (own) expect(snapshot?.apresentacao).toEqual(p.itens[0]);
    else expect(snapshot).toBeNull();
    return snapshot;
  }
  const v = await overview(s, own);
  if (!v) return null;
  return {
    id: v.competencia.id,
    status: v.competencia.situacao,
    packageVersion: v.competencia.versao_pacote_atual,
    approvedOpinion: v.blocking_summary.parecer_aprovado,
    canPresent: v.allowed_actions.apresentar,
    blocked: v.blocking_summary.nao_conformidades_bloqueantes,
  };
}

function init(c: Case, negative = false) {
  currentCase = c;
  ledger.clear();
  for (const s of [A, B])
    ledger.set(s.org, {
      mutations: 0,
      currentVersion: s.id(28),
      frozenVersion: negative && s === A && c.origin === "V119" ? s.id(28) : null,
      author: s.id(24),
      approved: c.origin !== "V118",
      presented: negative && s === A && c.origin === "V119",
      imported: negative && s === A && c.origin === "V122",
    });
}
function command(c: Case) {
  if (c.origin === "V118") return decidirParecer(A.id(23), true, " Fundamento F56 ");
  if (c.origin === "V119")
    return registrarApresentacao(A.id(22), A.id(29), " " + protocolNumber + " ", " eletronica ");
  return registrarRelatorioHistorico(A.id(31), month, "relatorio_contratante");
}
async function positive(c: Case) {
  const before = await overview(A, true);
  if (c.origin === "V118") {
    const old = (await opinions(A)).itens[0]!;
    expect(old).toMatchObject({
      status: "rascunho",
      id: A.id(23),
      autor: A.id(24),
      aprovado_por: null,
    });
    state(A).author = A.actor;
    await expect(command(c)).rejects.toMatchObject({ tipo: "nao_encontrado" });
    expect((await opinions(A)).itens[0]!.status).toBe("rascunho");
    expect(state(A).mutations).toBe(0);
    state(A).author = old.autor!;
    await command(c);
    const approved = (await opinions(A)).itens[0]!;
    expect(approved).toMatchObject({
      ...child(A),
      id: old.id,
      status: "aprovado",
      hash: old.hash,
      aprovado_por: A.actor,
    });
    const gate = (await overview(A, true))!;
    expect(gate).toMatchObject({
      portao: { percentual: 50, liberado: false },
      allowed_actions: { apresentar: false },
    });
    return {
      opinion: approved,
      canPresent: gate.allowed_actions.apresentar,
      compliant: gate.portao.percentual,
    };
  }
  if (c.origin === "V119") {
    expect(before?.allowed_actions.apresentar).toBe(true);
    expect((await presentations(A)).itens).toEqual([]);
    const id = await command(c);
    expect(id).toBe(A.id(25));
    const first = await receipt(A);
    expect(first).toMatchObject({
      apresentacao: { ...child(A), id, id_pacote: A.id(26), protocolo: protocolNumber },
      pacote: {
        id: A.id(26),
        hash_pacote: packageHash(A),
        status: "apresentado",
        congelado_em: fixtureDate,
      },
      itens: [{ ...child(A), id_pacote: A.id(26), versao_id: A.id(28), hash: documentHash(A) }],
    });
    state(A).currentVersion = A.id(41);
    expect(await command(c)).toBe(id);
    const same = await receipt(A);
    expect(same).toEqual(first);
    expect(same!.itens[0]!.versao_id).not.toBe(state(A).currentVersion);
    return { snapshot: same, requestId: A.id(29), currentVersion: state(A).currentVersion };
  }
  const file = await consultarEstadoDocumentoHistorico(
    A.org,
    A.id(21),
    A.id(31),
    A.id(39),
    signal(),
  );
  expect(podeFinalizarIngestao(file.seguranca, file.processamento)).toBe(true);
  const oldAnalysis = await analysis(A, true);
  const oldDetail = await detail(A, true);
  expect((await history(A)).total).toBe(0);
  expect(await command(c)).toBe(A.id(30));
  const stored = await history(A);
  expect(stored.itens).toEqual([report(A)]);
  expect(await command(c)).toBe(stored.itens[0]!.id);
  expect(await history(A)).toEqual(stored);
  expect(await analysis(A, true)).toEqual(oldAnalysis);
  expect(await detail(A, true)).toEqual(oldDetail);
  const rules = await listarRegrasHistoricas(A.id(21), A.org, 0, signal());
  expect(rules.itens).toEqual([]);
  return {
    report: stored.itens[0],
    generatedRules: rules.total,
    beforeResult: oldDetail!.resultado_atual!.id,
    afterResult: (await detail(A, true))!.resultado_atual!.id,
    beforeHash: oldAnalysis!.execucao_atual!.hash_entrada,
    afterHash: (await analysis(A, true))!.execucao_atual!.hash_entrada,
  };
}

describe("F5 closure scope isolation", () => {
  for (const c of cases) {
    const id = "IFV1-F5-C" + c.id;
    it(id + " positive: scoped material reaches the authorized consumer", async () => {
      init(c);
      wire.session = A.session;
      const producer = await positive(c);
      expect(state(A).mutations).toBe(1);
      const observed = await consume(c, A, true);
      expect(observed).not.toBeNull();
      wire.session = B.session;
      expect(await consume(c, A, false)).toBeNull();
      wire.session = A.session;
      const a = (await overview(A, true))!.competencia;
      observations.record(c, A, "positive", {
        producer: c.producer,
        organizationId: a.id_organizacao,
        contractId: a.id_contrato,
        competenceId: a.id,
        mutationCount: state(A).mutations,
        foreignVisible: false,
        material: producer,
        observed,
      });
    });
    it(id + " negative: foreign material remains hidden and unchanged", async () => {
      init(c, true);
      wire.session = A.session;
      const a = await overview(A, true);
      const proofBefore =
        c.origin === "V118"
          ? await opinions(A)
          : c.origin === "V119"
            ? await receipt(A)
            : await history(A);
      wire.session = B.session;
      const own = await overview(B, true);
      await expect(command(c)).rejects.toMatchObject({
        tipo: c.origin === "V122" ? "negado" : "sem_permissao",
      });
      const result = transport.calls.at(-1)!;
      expect(result).toMatchObject({
        path: "rpc/" + c.producer,
        method: "POST",
        status: 403,
        data: { code: "42501" },
      });
      expect(await consume(c, A, false)).toBeNull();
      expect(await overview(B, true)).toEqual(own);
      wire.session = A.session;
      expect(await overview(A, true)).toEqual(a);
      expect(
        c.origin === "V118"
          ? await opinions(A)
          : c.origin === "V119"
            ? await receipt(A)
            : await history(A),
      ).toEqual(proofBefore);
      expect(await auditor(c, A, false)).toBeNull();
      const mutationCount = state(A).mutations + state(B).mutations;
      expect(mutationCount).toBe(0);
      observations.record(c, B, "negative", {
        producer: c.producer,
        ownOrganizationId: own!.competencia.id_organizacao,
        ownCompetenceId: own!.competencia.id,
        preservedCompetenceId: a!.competencia.id,
        status: result.status,
        code: (result.data as typeof denied).code,
        foreignVisible: false,
        mutationCount,
      });
    });
  }
});

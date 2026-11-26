import {
  A as identityBase,
  evidenceStep as step,
  journeyRecorder,
} from "./f6-code-journey-fixture";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  classificarErroV116,
  ErroSolicitacao,
  FILTROS_VAZIOS,
  obterAnaliseCompetencia,
  OFFSETS_ZERO,
  parseAnaliseV116,
  solicitarAnaliseCompetencia,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  classificarErroV115,
  obterDocumentosCompetencia,
  parseLeituraV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  classificarErroVisaoGeral,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  listarEvidencias,
  montarRevisao,
  obterContextoRevisao,
  registrarRevisao,
} from "@/lib/competencias/revisaoRequisitoDados";
import { listarCompetencias } from "@/lib/contratos/competenciasDados";
import { criarCompetencia } from "@/lib/contratos/novaCompetenciaDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
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

const wire = vi.hoisted(() => ({ fetch: vi.fn(), navigate: vi.fn(), session: "", actor: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient("https://f5-competence.invalid", "fixture-key", {
    accessToken: async () => wire.session,
    global: { fetch: (input, init) => wire.fetch(input, init) },
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

const producers = {
  V113: {
    producer: "criar_competencia",
    operation: "create",
    event: "CompetenciaCriada",
    entity: "competencias",
  },
  V116: {
    producer: "solicitar_analise_competencia",
    operation: "request",
    event: "AnaliseSolicitada",
    entity: "execucoes_analise",
  },
  V117: {
    producer: "registrar_revisao_requisito_v117",
    operation: "review",
    event: "RevisaoRequisitoRegistrada",
    entity: "resultados_requisitos",
  },
} as const;
const rows = [
  ["0352", "V113", "SYS05", "obter_resumo_dashboard"],
  ["0365", "V113", "V112", "competencias"],
  ["0368", "V113", "V114", "obter_visao_geral_competencia"],
  ["0369", "V113", "V115", "obter_documentos_competencia_v115"],
  ["0370", "V113", "V116", "obter_analise_competencia_v116"],
  ["0371", "V113", "V118", "pareceres_internos"],
  ["0372", "V113", "V119", "obter_visao_geral_competencia"],
  ["0373", "V113", "V120", "apresentacoes_contratante"],
  ["0376", "V113", "V123", "eventos_auditoria"],
  ["0433", "V116", "V114", "obter_visao_geral_competencia"],
  ["0437", "V116", "V117", "obter_detalhe_requisito_v117"],
  ["0439", "V116", "V118", "pareceres_internos"],
  ["0441", "V116", "V119", "obter_visao_geral_competencia"],
  ["0443", "V116", "V123", "eventos_auditoria"],
  ["0455", "V117", "V114", "obter_visao_geral_competencia"],
  ["0458", "V117", "V116", "obter_analise_competencia_v116"],
  ["0461", "V117", "V118", "pareceres_internos"],
  ["0463", "V117", "V119", "obter_visao_geral_competencia"],
  ["0465", "V117", "V123", "eventos_auditoria"],
] as const;
const cases = rows.map(([id, origin, destination, consumer]) => ({
  id,
  origin,
  destination,
  consumer,
  ...producers[origin],
}));
type Case = (typeof cases)[number];
type Stage = "missing" | "created" | "completed" | "queued" | "reviewed";
type State = { stage: Stage; mutations: number; audit: boolean };
const state = (stage: Stage): State => ({ stage, mutations: 0, audit: false });
const month = "2026-11";
const reference = month + "-01";
const rationale = "Revisão de requisito com evidência documental.";
const source = "Trecho da evidência sintética.";
const initialHash = (s: Scope) => digest("snapshot original " + s.org);
const nextHash = (s: Scope) => digest("snapshot atualizado " + s.org);
const fileHash = (s: Scope) => digest("documento da competência " + s.org);
const isSame = (x: Scope, y: Scope) => x.org === y.org;
const selectScope = (s: Scope) => ({
  id_organizacao: eq(s.org),
  id_contrato: eq(s.id(1)),
  id_competencia: eq(s.id(2)),
});
const scopeRecord = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.id(1) });
const block = (complete: boolean) => ({
  pendentes: Number(!complete),
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
});
function competence(s: Scope, stage: Stage) {
  return {
    id: s.id(2),
    ...scopeRecord(s),
    competencia_referencia: reference,
    periodo_inicio: reference,
    periodo_fim: month + "-30",
    data_limite: null,
    situacao:
      stage === "created" ? "rascunho" : stage === "queued" ? "em_analise" : "pendente_correcao",
    atualizado_em: fixtureDate,
    versao_registro: 1,
    versao_pacote_atual: null,
    percentual_conformidade: stage === "reviewed" ? 100 : 0,
  };
}
function requirement(s: Scope) {
  return { id: s.id(3), codigo: "F55", aplicavel: true, obrigatorio: true, impeditivo: true };
}
const hasExecution = (stage: Stage) => stage !== "missing" && stage !== "created";
function execution(s: Scope, stage: Stage) {
  if (!hasExecution(stage)) return null;
  return {
    id: stage === "completed" ? s.id(4) : s.id(5),
    tipo: stage === "reviewed" ? "reanálise" : "completa",
    status: stage === "queued" ? "pendente" : "concluida",
    hash_entrada: stage === "queued" ? nextHash(s) : initialHash(s),
  };
}
function result(s: Scope, reviewed: boolean) {
  return {
    id: s.id(reviewed ? 7 : 6),
    id_execucao: s.id(reviewed ? 5 : 4),
    resultado: reviewed ? "conforme" : "inconclusivo",
    mecanismo: reviewed ? "humano" : "deterministico",
    justificativa: reviewed ? rationale : "Evidência anterior",
    hash_evidencias: fileHash(s),
  };
}
function evidence(s: Scope) {
  return {
    id: s.id(8),
    tipo_evidencia: "documento",
    pagina: 2,
    trecho: source,
    hash: fileHash(s),
    documento: {
      id_versao_documento: s.id(9),
      id_arquivo: s.id(10),
      numero_versao: 2,
      hash_versao: fileHash(s),
      status_seguranca: "aprovado",
    },
  };
}
function auditEvent(c: Case, s: Scope) {
  return {
    id: s.id(11),
    criado_em: fixtureDate,
    origem: "usuario",
    id_usuario: s.actor,
    evento: c.event,
    entidade: c.entity,
    correlation_id: s.id(12),
    id_entidade: s.id(c.origin === "V113" ? 2 : c.origin === "V116" ? 5 : 7),
  };
}
function revisionContext(s: Scope) {
  return {
    schema_versao: "revisao-v117" as const,
    ...scopeRecord(s),
    id_competencia: s.id(2),
    id_requisito: s.id(3),
    id_execucao_esperada: s.id(4),
    id_resultado_esperado: s.id(6),
    hash_esperado: initialHash(s),
    pode_revisar: true,
  };
}
function revisionInput(s: Scope) {
  return {
    resultado: "conforme",
    justificativa: rationale,
    fundamento: "Contrato sintético",
    evidencias: [{ id_versao_documento: s.id(9), pagina: 2, trecho: source }],
  };
}
const revisionReceipt = (s: Scope) => ({
  schema_versao: "revisao-v117",
  request_id: s.id(13),
  id_competencia: s.id(2),
  id_requisito: s.id(3),
  id_execucao: s.id(5),
  id_resultado: s.id(7),
});
const dashboardDeadline = (s: Scope) => ({
  tipo: "competencia",
  id: s.id(14),
  contrato_numero: "F55",
  titulo: "Competência 10/2026",
  prazo: "2026-12-20",
  status: "em_analise",
  criticidade: null,
});

function dashboardFixture(s: Scope, stage: Stage) {
  const situacao = competence(s, stage).situacao;
  const exists = stage !== "missing";
  return {
    schema_versao: "sys05-v1",
    gerado_em: fixtureDate,
    organizacao: {
      id: s.org,
      razao_social: "Organização sintética",
      nome_fantasia: null,
      situacao: "ativa",
    },
    resumo: {
      contratos_visiveis: 1,
      contratos_ativos: 1,
      competencias_em_fluxo: 1 + Number(exists),
      competencias_exigem_atencao: 0,
      itens_com_prazo_vencido: 0,
      atencoes_abertas: 0,
    },
    contratos_por_situacao: [{ situacao: "ativo", quantidade: 1 }],
    competencias_por_situacao: [
      { situacao: "em_analise", quantidade: 1 },
      ...(exists ? [{ situacao, quantidade: 1 }] : []),
    ],
    proximos_prazos: [dashboardDeadline(s)],
    atencoes_prioritarias: [],
  };
}

const analysisArgs = (s: Scope) => ({
  p_id_competencia: s.id(2),
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
  p_busca: "F55",
});
function analysisFixture(s: Scope, stage: Stage) {
  const reviewed = stage === "reviewed";
  const complete = reviewed || stage === "completed";
  const current = execution(s, stage);
  return {
    schema_versao: "v116-v1",
    competencia: competence(s, stage),
    estado_analise: stage === "queued" ? "queued" : complete ? "complete" : "not_analyzed",
    stale: false,
    percentual: reviewed ? 100 : 0,
    blocking_summary: block(complete),
    allowed_actions: {
      executar_analise: s.role === "administrador" && !current,
      reanalisar: s.role === "administrador" && complete,
      abrir_requisito: !!current,
    },
    execucao_atual: current,
    mecanismos: {
      deterministico: Number(stage === "completed"),
      semantico: 0,
      humano: Number(reviewed),
      nao_identificado: 0,
    },
    resultados: complete
      ? [
          {
            ...result(s, reviewed),
            id_resultado: s.id(reviewed ? 7 : 6),
            id_requisito: s.id(3),
            requisito: { codigo: "F55", criticidade: "alta" },
            evidencias: [{ ...evidence(s), id_versao_documento: s.id(9) }],
          },
        ]
      : [],
    resultados_paginacao: pagination(25, Number(complete)),
    execucoes: current ? [current] : [],
    execucoes_paginacao: pagination(10, Number(!!current)),
    apontamentos: [],
    apontamentos_paginacao: pagination(25),
  };
}
function overviewFixture(s: Scope, stage: Stage) {
  const complete = stage === "completed" || stage === "reviewed";
  return {
    competencia: competence(s, stage),
    portao: {
      ...block(complete),
      liberado: false,
      total: 1,
      conformes_ou_na_validos: Number(stage === "reviewed"),
      percentual: Number(stage === "reviewed") * 100,
    },
    blocking_summary: {
      ...block(complete),
      parecer_aprovado: stage === "completed",
      analise_concluida_atual: complete,
      aprovacao_apresentacao_atual: false,
    },
    allowed_actions: {
      abrir_documentos: true,
      analisar: s.role === "administrador" && stage !== "queued",
      abrir_parecer: true,
      apresentar: false,
    },
  };
}
function detailFixture(s: Scope, stage: Stage) {
  const wasQueued = stage === "queued";
  const previous = result(s, false);
  const current = result(s, stage === "reviewed");
  return {
    schema_versao: "v117-v1",
    competencia: competence(s, stage),
    requisito: requirement(s),
    execucao_atual: execution(s, stage),
    resultado_atual: wasQueued ? null : current,
    resultado_referencia: previous,
    na_validade: null,
    allowed_actions: { executar_analise: false, reanalisar: !wasQueued, abrir_requisito: true },
    evidencias: [evidence(s)],
    evidencias_paginacao: pagination(25, 1),
    historico: [
      {
        id_resultado: s.id(6),
        id_execucao: s.id(4),
        resultado: previous.resultado,
        hash_entrada: initialHash(s),
      },
    ],
    historico_paginacao: pagination(25, 1),
    apontamentos: [],
    apontamentos_paginacao: pagination(25),
  };
}
function documentFixture(s: Scope, stage: Stage) {
  return {
    schema_versao: "v115-v1",
    competencia: competence(s, stage),
    estado_documental: "missing_docs",
    resumo: {
      documentos_total: 0,
      requisitos_documentais_total: 1,
      requisitos_documentais_aplicaveis: 1,
      requisitos_documentais_pendentes: 1,
    },
    documentos: [],
    requisitos_documentais: [{ ...requirement(s), tipos_esperados: ["contrato"], atendido: false }],
    documentos_paginacao: pagination(25),
    requisitos_paginacao: pagination(25, 1),
    capacidades: {
      pode_enviar: s.role === "administrador",
      pode_nova_versao: s.role === "administrador",
      motivo_nova_versao_obrigatorio: true,
    },
  };
}
function opinion(s: Scope, stage: Stage) {
  return {
    id: s.id(15),
    ...scopeRecord(s),
    id_competencia: s.id(2),
    versao: 1,
    status: stage === "reviewed" ? "substituido" : "aprovado",
    texto: "Parecer anterior",
    hash: initialHash(s),
    autor: null,
    criado_em: fixtureDate,
    aprovado_por: null,
    aprovado_em: fixtureDate,
  };
}

let live: Map<string, State>;
let benchmark: Case;
let loseResponse = false;
let transport: ReturnType<typeof fixtureTransport>;
const selectActor = (s: Scope) => {
  wire.session = s.session;
  wire.actor = s.actor;
};

function serve(actor: Scope, path: string, args: Record<string, unknown>, method: string) {
  const post = method === "POST";
  const route = path.replace(/^rpc\//, "");
  expect(post).toBe(path.startsWith("rpc/"));
  const target = [A, B].find((s) =>
    Object.values(args).some((v) =>
      [s.org, s.id(1), s.id(2), eq(s.org), eq(s.id(1)), eq(s.id(2))].includes(String(v)),
    ),
  );
  if (!target) throw Error("Missing synthetic context for " + path);
  const entry = live.get(target.org)!;
  const own = isSame(actor, target);
  if (route === benchmark.producer) {
    if (benchmark.origin === "V113") {
      expect(args).toEqual({ p_id_contrato: target.id(1), p_competencia_referencia: reference });
    } else if (benchmark.origin === "V116") {
      expect(args).toEqual({ p_id_competencia: target.id(2), p_tipo: "completa" });
    } else {
      const expected = montarRevisao(revisionContext(target), revisionInput(target), target.id(13));
      expect({ ...args, p_request_id: target.id(13) }).toEqual(expected);
    }
    if (!own || actor.role !== "administrador") return reply(denied, 403);
    if (loseResponse) return reply({ code: "XX000" }, 502);
    if (benchmark.origin === "V113" && entry.stage !== "missing")
      return reply({ code: "23505" }, 409);
    if (benchmark.origin === "V116" && entry.stage === "queued") return reply(target.id(5));
    if (benchmark.origin === "V117" && entry.stage === "reviewed") {
      return args["p_request_id"] === target.id(13)
        ? reply(revisionReceipt(target))
        : reply({ code: "PT409" }, 409);
    }
    entry.mutations++;
    entry.audit = true;
    if (benchmark.origin === "V113") {
      entry.stage = "created";
      return reply(target.id(2));
    }
    if (benchmark.origin === "V116") {
      entry.stage = "queued";
      return reply(target.id(5));
    }
    entry.stage = "reviewed";
    return reply(revisionReceipt(target));
  }
  if (route === "competencias") {
    expect(args).toEqual({
      id_contrato: eq(target.id(1)),
      competencia_referencia: eq(reference),
      situacao: "eq.rascunho",
    });
    return reply(own && entry.stage === "created" ? [competence(target, entry.stage)] : []);
  }
  if (route === "pareceres_internos" || route === "apresentacoes_contratante") {
    expect(args).toEqual(selectScope(target));
    const exists = hasExecution(entry.stage);
    return reply(
      own && exists && route === "pareceres_internos" ? [opinion(target, entry.stage)] : [],
    );
  }
  if (route === "pode_consultar_auditoria_organizacao") {
    expect(args).toEqual({ p_id_organizacao: target.org });
    return reply(own && actor.role === "administrador");
  }
  if (route === "eventos_auditoria") {
    expect(args).toEqual({
      id_organizacao: eq(target.org),
      evento: eq(benchmark.event),
      entidade: eq(benchmark.entity),
      id_usuario: eq(target.actor),
      correlation_id: eq(target.id(12)),
    });
    return reply(
      own && actor.role === "administrador" && entry.audit ? [auditEvent(benchmark, target)] : [],
    );
  }
  if (route === "obter_resumo_dashboard") {
    expect(args).toEqual({ p_id_organizacao: target.org });
    return own ? reply(dashboardFixture(target, entry.stage)) : reply(denied, 403);
  }
  if (route === "versoes_documento") {
    expect(args).toEqual({
      id_organizacao: eq(target.org),
      id_contrato: eq(target.id(1)),
      "documentos_competencia.id_competencia": eq(target.id(2)),
      "documentos_competencia.situacao": "eq.ativo",
      "arquivos.status_seguranca": "eq.aprovado",
    });
    return reply(
      own
        ? [
            {
              id: target.id(9),
              numero_versao: 2,
              ...scopeRecord(target),
              documentos_competencia: {
                id_competencia: target.id(2),
                situacao: "ativo",
                titulo: "Documento F55",
              },
              arquivos: { nome_original: "evidencia-f55.pdf", status_seguranca: "aprovado" },
            },
          ]
        : [],
    );
  }
  if (route === "obter_contexto_revisao_v117") {
    expect(args).toEqual({ p_id_competencia: target.id(2), p_id_requisito: target.id(3) });
    return own && actor.role === "administrador"
      ? reply(revisionContext(target))
      : reply(denied, 403);
  }
  if (route === "obter_visao_geral_competencia") {
    expect(args).toEqual({ p_id_competencia: target.id(2) });
    return own ? reply(overviewFixture(target, entry.stage)) : reply(denied, 403);
  }
  if (route === "obter_analise_competencia_v116") {
    expect(args).toEqual(analysisArgs(target));
    return own ? reply(analysisFixture(target, entry.stage)) : reply(denied, 403);
  }
  if (route === "obter_documentos_competencia_v115") {
    expect(args).toEqual({
      p_id_competencia: target.id(2),
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    });
    return own ? reply(documentFixture(target, entry.stage)) : reply(denied, 403);
  }
  if (route === "obter_detalhe_requisito_v117") {
    expect(args).toEqual({
      p_id_competencia: target.id(2),
      p_id_requisito: target.id(3),
      p_evidencias_offset: 0,
      p_evidencias_limite: 25,
      p_historico_offset: 0,
      p_historico_limite: 25,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
    });
    return own ? reply(detailFixture(target, entry.stage)) : reply(denied, 403);
  }
  throw Error("Unexpected request " + path);
}

beforeEach(() => {
  localStorage.clear();
  loseResponse = false;
  transport = fixtureTransport(serve);
  wire.fetch.mockReset().mockImplementation(transport.fetch);
});

async function dashboard(actor: Scope, target: Scope, stage: Stage) {
  definirPreferenciaOrganizacao(actor.actor, target.org);
  const query = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={query}>
      <Dashboard />
    </QueryClientProvider>,
  );
  const key = ["sys05", "resumo", actor.actor, target.org];
  try {
    if (!isSame(actor, target)) {
      expect(await screen.findByRole("alert")).toHaveTextContent(MENSAGENS_SYS05.negado);
      expect(query.getQueryData(key)).toBeUndefined();
      expect(screen.queryByTestId("prazo-item")).toBeNull();
      return null;
    }
    await waitFor(() => {
      const kpis = within(screen.getByRole("region", { name: "Indicadores de resumo" }));
      expect(
        kpis.getByText("Competências em fluxo").closest("dt")?.nextElementSibling,
      ).toHaveTextContent(stage === "missing" ? /^1$/ : /^2$/);
      if (stage === "created") {
        const table = screen.getByRole("table", { name: "Competências por situação" });
        expect(within(table).getByRole("row", { name: "rascunho 1" })).toBeVisible();
      }
      expect(screen.getAllByTestId("prazo-item")).toHaveLength(1);
      expect(screen.getByText("Competência 10/2026")).toBeVisible();
    });
    const found = query.getQueryData<ReturnType<typeof dashboardFixture>>(key)!;
    expect(found.organizacao.id).toBe(target.org);
    expect(found.proximos_prazos.map((p) => p.id)).toEqual([target.id(14)]);
    return {
      count: found.resumo.competencias_em_fluxo,
      deadlineId: found.proximos_prazos[0]!.id,
      groups: found.competencias_por_situacao,
    };
  } finally {
    view.unmount();
    query.clear();
  }
}
async function overview(s: Scope, allowed: boolean) {
  const r = await obterVisaoGeral(s.id(2), signal());
  const data = parseVisaoGeral(r.data);
  if (!allowed) {
    expect(classificarErroVisaoGeral(r.error, r.status)).toBe("sem_permissao");
    expect(data).toBeNull();
    return null;
  }
  expect(data).toMatchObject({ competencia: { id: s.id(2), ...scopeRecord(s) } });
  return data!;
}
async function analysis(s: Scope, allowed: boolean) {
  const r = await obterAnaliseCompetencia(
    s.id(2),
    { ...FILTROS_VAZIOS, busca: " F55 " },
    OFFSETS_ZERO,
    signal(),
  );
  const parsed = parseAnaliseV116(r.data);
  if (!allowed) {
    expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
    expect(parsed).toBeNull();
    return null;
  }
  expect(r.data).toMatchObject({ competencia: { id: s.id(2), ...scopeRecord(s) } });
  expect(parsed).not.toBeNull();
  if (parsed?.resultados[0]?.mecanismo === "humano") {
    expect(r.data).toMatchObject({
      resultados: [
        {
          evidencias: [
            { id_versao_documento: s.id(9), hash: fileHash(s), pagina: 2, trecho: source },
          ],
        },
      ],
    });
  }
  return parsed!;
}
async function audit(c: Case, actor: Scope, target: Scope, emitted: boolean) {
  const allowed = isSame(actor, target) && actor.role === "administrador";
  expect(await podeConsultarAuditoria(target.org)).toBe(allowed);
  const page = await obterEventosAuditoria({
    idOrganizacao: target.org,
    pagina: 0,
    evento: c.event,
    entidade: c.entity,
    idUsuario: target.actor,
    correlationId: target.id(12),
  });
  expect(page.eventos).toEqual(allowed && emitted ? [auditEvent(c, target)] : []);
  return page.eventos[0] ?? null;
}

async function consume(c: Case, actor: Scope, target: Scope, stage: Stage) {
  const allowed = isSame(actor, target);
  if (c.destination === "SYS05") return dashboard(actor, target, stage);
  if (c.destination === "V112") {
    const page = await listarCompetencias(
      target.id(1),
      { mes: month, situacao: "rascunho" },
      0,
      signal(),
    );
    expect(page.total).toBe(allowed ? 1 : 0);
    const item = page.itens[0];
    if (allowed)
      expect(item).toMatchObject({
        id: target.id(2),
        competencia_referencia: reference,
        situacao: "rascunho",
      });
    return item ? { id: item.id, reference: item.competencia_referencia } : null;
  }
  if (c.destination === "V115") {
    const r = await obterDocumentosCompetencia(target.id(2), 0, 0, signal());
    const parsed = parseLeituraV115(r.data);
    if (!allowed) {
      expect(classificarErroV115(r.error, r.status)).toBe("sem_permissao");
      expect(parsed).toBeNull();
      return null;
    }
    expect(parsed).toMatchObject({
      competencia: { id: target.id(2), ...scopeRecord(target) },
      documentos: [],
      requisitos: [{ id: target.id(3), atendido: false }],
    });
    return { requirementId: parsed!.requisitos[0]!.id, documents: parsed!.documentos.length };
  }
  if (c.destination === "V116") {
    const value = await analysis(target, allowed);
    if (!value) return null;
    if (stage === "reviewed") {
      expect(value.resultados[0]).toMatchObject({
        id_resultado: target.id(7),
        id_requisito: target.id(3),
        mecanismo: "humano",
        justificativa: rationale,
        evidencias: [{ id: target.id(8), pagina: 2, trecho: source }],
      });
    } else {
      expect(value).toMatchObject({
        estado_analise: "not_analyzed",
        execucao_atual: null,
        resultados: [],
      });
    }
    return { status: value.estado_analise, resultId: value.resultados[0]?.id_resultado ?? null };
  }
  if (c.destination === "V117") {
    const r = await obterDetalheRequisito(
      target.id(2),
      target.id(3),
      OFFSETS_DETALHE_ZERO,
      signal(),
    );
    const data = parseDetalheV117(r.data, target.id(2), target.id(3), OFFSETS_DETALHE_ZERO);
    if (!allowed) {
      expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
      expect(data).toBeNull();
      return null;
    }
    expect(data).toMatchObject({
      requisito: { id: target.id(3) },
      execucao_atual: { id: target.id(5), hash_entrada: nextHash(target) },
      resultado_atual: null,
      resultado_referencia: { id: target.id(6) },
      evidencias: [
        { documento: { id_versao_documento: target.id(9), hash_versao: fileHash(target) } },
      ],
    });
    return {
      previousResult: data!.resultado_referencia!.id,
      currentResult: null,
      version: data!.evidencias[0]!.documento!.id_versao_documento,
    };
  }
  if (c.destination === "V118") {
    const items = await listarPareceres(target.id(2), target.org, target.id(1), 0, signal());
    const view = await overview(target, allowed);
    if (allowed && hasExecution(stage)) {
      expect(items.itens[0]).toMatchObject({
        id: target.id(15),
        status: stage === "reviewed" ? "substituido" : "aprovado",
      });
      expect(view!.blocking_summary.parecer_aprovado).toBe(false);
    } else expect(items.itens).toEqual([]);
    return allowed
      ? {
          count: items.total,
          status: items.itens[0]?.status ?? null,
          currentApproval: view!.blocking_summary.parecer_aprovado,
        }
      : null;
  }
  if (c.destination === "V120") {
    const page = await listarApresentacoes(target.id(2), target.org, target.id(1), 0, signal());
    expect(page).toEqual({ itens: [], total: 0 });
    const view = await overview(target, allowed);
    return view ? { count: page.total, canPresent: view.allowed_actions.apresentar } : null;
  }
  if (c.destination === "V123") return audit(c, actor, target, true);
  const view = await overview(target, allowed);
  if (!view) return null;
  expect(view.allowed_actions.apresentar).toBe(false);
  return {
    id: view.competencia.id,
    situation: view.competencia.situacao,
    analysisCurrent: view.blocking_summary.analise_concluida_atual,
    currentApproval: view.blocking_summary.parecer_aprovado,
    canPresent: view.allowed_actions.apresentar,
  };
}

function setup(c: Case, negative = false) {
  benchmark = c;
  live = new Map([
    [A.org, state(c.origin === "V113" ? (negative ? "created" : "missing") : "completed")],
    [B.org, state("created")],
  ]);
}
async function command(c: Case) {
  if (c.origin === "V113") return criarCompetencia(A.id(1), month);
  if (c.origin === "V116") return solicitarAnaliseCompetencia(A.id(2), "completa");
  return registrarRevisao(montarRevisao(revisionContext(A), revisionInput(A), A.id(13)));
}

const proofs = journeyRecorder("competenceoperations");

const identity = (s: Scope) => ({ ...identityBase, actor: s.actor, org: s.org, role: s.role });
describe("F6 competence operation journeys", () => {
  for (const c of cases) {
    const id = "IFV1-F6-C" + c.id;
    it(
      id + " positive: resumes the competence operation and reconciles the current evidence",
      async () => {
        setup(c);
        selectActor(A);
        const panel = c.destination === "SYS05" ? await dashboard(A, A, "missing") : null;
        const prior = c.origin === "V113" ? null : await analysis(A, true);
        loseResponse = true;
        await expect(command(c)).rejects.toThrow();
        const failure = transport.calls.at(-1)!;
        expect(failure).toMatchObject({
          path: "rpc/" + c.producer,
          status: 502,
          data: { code: "XX000" },
        });
        expect(live.get(A.org)!.mutations).toBe(0);
        if (prior) expect(await analysis(A, true)).toEqual(prior);
        loseResponse = false;
        let request: string | undefined;
        if (c.origin === "V117") {
          const context = await obterContextoRevisao(A.id(2), A.id(3), A.org);
          expect(context).toEqual(revisionContext(A));
          const eligible = await listarEvidencias(context, 0);
          expect(eligible.itens).toEqual([{ id: A.id(9), nome: "evidencia-f55.pdf", versao: 2 }]);
          const input = montarRevisao(
            context,
            {
              ...revisionInput(A),
              evidencias: [
                {
                  id_versao_documento: eligible.itens[0]!.id,
                  pagina: 2,
                  trecho: source,
                },
              ],
            },
            A.id(13),
          );
          await registrarRevisao(input);
          await registrarRevisao(input);
          await expect(
            registrarRevisao({ ...input, p_request_id: A.id(16) }),
          ).rejects.toMatchObject({ tipo: "conflito" });
          request = input.p_request_id;
        } else {
          expect(await command(c)).toBe(A.id(c.origin === "V113" ? 2 : 5));
          if (c.origin === "V116") expect(await command(c)).toBe(A.id(5));
        }
        const effect = live.get(A.org)!;
        expect(effect.mutations).toBe(1);
        const persisted = await overview(A, true);
        const next = prior ? await analysis(A, true) : null;
        if (prior && next) {
          expect(prior.execucao_atual).toMatchObject({ id: A.id(4), hash_entrada: initialHash(A) });
          expect(next.execucao_atual).toMatchObject({
            id: A.id(5),
            hash_entrada: c.origin === "V116" ? nextHash(A) : initialHash(A),
          });
          if (c.origin === "V116")
            expect(next).toMatchObject({ estado_analise: "queued", resultados: [] });
          else
            expect(next.resultados[0]).toMatchObject({
              id_resultado: A.id(7),
              id_requisito: A.id(3),
              mecanismo: "humano",
            });
        }
        const result = await consume(c, A, A, effect.stage);
        expect(result).not.toBeNull();
        selectActor(B);
        expect(await consume(c, B, A, effect.stage)).toBeNull();
        selectActor(A);
        const reload = await overview(A, true);
        expect(reload).toEqual(persisted);
        if (next) expect(await analysis(A, true)).toEqual(next);
        const pre = {
          organization: A.org,
          panel,
          previousExecution: prior?.execucao_atual?.id ?? null,
        };
        const after = {
          id: reload!.competencia.id,
          organization: reload!.competencia.id_organizacao,
          contract: reload!.competencia.id_contrato,
          currentExecution: next?.execucao_atual?.id ?? null,
          currentHash: next?.execucao_atual?.hash_entrada ?? null,
          request: request ?? null,
        };
        proofs.record("C" + c.id, "positive", identity(A), {
          preconditions: pre,
          steps: [
            step("precondition", pre),
            step("producer", { ...after, resumedAfter: failure.status }),
            step("consumer", { ...result, competence: after.id }),
            step("recovery", after),
          ],
          observed: { ...result, ...after },
          postconditions: { ...after, mutations: effect.mutations },
          recoveryProof: after,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(
      id + " negative: denies the foreign competence action and recovers the authorized view",
      async () => {
        setup(c, true);
        selectActor(A);
        const before = await overview(A, true);
        const old = c.origin === "V113" ? null : await analysis(A, true);
        selectActor(B);
        const ownBefore = await overview(B, true);
        if (c.origin === "V116") await expect(command(c)).rejects.toBeInstanceOf(ErroSolicitacao);
        else
          await expect(command(c)).rejects.toMatchObject({
            tipo: c.origin === "V113" ? "sem_permissao" : "negado",
          });
        const refusal = transport.calls.at(-1)!;
        expect(refusal).toMatchObject({
          method: "POST",
          path: "rpc/" + c.producer,
          status: 403,
          data: { code: "42501" },
        });
        expect(await consume(c, B, A, live.get(A.org)!.stage)).toBeNull();
        const ownAfter = await overview(B, true);
        expect(ownAfter).toEqual(ownBefore);
        selectActor(A);
        const recovered = await overview(A, true);
        expect(recovered).toEqual(before);
        if (old) expect(await analysis(A, true)).toEqual(old);
        expect(await audit(c, A, A, false)).toBeNull();
        expect(live.get(A.org)!.mutations + live.get(B.org)!.mutations).toBe(0);
        const start = {
          competence: before!.competencia.id,
          organization: before!.competencia.id_organizacao,
        };
        const end = {
          own: ownAfter!.competencia.id,
          restored: recovered!.competencia.id,
          oldExecution: old?.execucao_atual?.id ?? null,
        };
        proofs.record("C" + c.id, "negative", identity(B), {
          preconditions: start,
          steps: [
            step("precondition", start),
            step("producer", { status: 403, code: "42501" }),
            step("consumer", { visible: false }),
            step("recovery", end),
          ],
          observed: { status: 403, code: "42501" },
          postconditions: { mutations: 0, ...end },
          recoveryProof: end,
          cleanupStatus: "CLEAN",
          negativeProof: {
            decision: "DENIED",
            status: 403,
            code: "42501",
            effects: 0,
            disclosed: false,
          },
        });
      },
    );
  }
});
afterAll(proofs.write);

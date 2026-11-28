import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import {
  obterAnaliseCompetencia,
  FILTROS_VAZIOS as ANALISE,
  OFFSETS_ZERO,
  parseAnaliseV116,
  classificarErroV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  obterDocumentosCompetencia,
  parseLeituraV115,
  classificarErroV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  obterVisaoGeral,
  parseVisaoGeral,
  classificarErroVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  obterDetalheRequisito,
  parseDetalheV117,
  OFFSETS_DETALHE_ZERO,
  classificarErroV117,
} from "@/lib/competencias/requisitoDetalheDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { listarApresentacoes } from "@/lib/competencias/protocoloDados";
import { listarFontes } from "@/lib/contratos/baseNormativaDados";
import { listarCompetencias, FILTROS_COMPETENCIA_VAZIOS } from "@/lib/contratos/competenciasDados";
import { obterContrato } from "@/lib/contratos/contratoDetalheDados";
import { listarContratos } from "@/lib/contratos/contratosDados";
import { obterDocumento, listarVersoes } from "@/lib/contratos/documentoDetalheDados";
import { FILTROS_VAZIOS as DOCUMENTOS, listarDocumentos } from "@/lib/contratos/documentosDados";
import { listarRelatoriosHistoricos } from "@/lib/contratos/historicoContratoDados";
import {
  criarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";
import { buscarOpcoesContratantes, inserirContrato } from "@/lib/contratos/novoContratoDados";
import { listarPropostas } from "@/lib/contratos/orcamentoDados";
import { listarListas } from "@/lib/contratos/regrasDados";
import { listarContratantes } from "@/lib/contratantes/contratantesDados";
import {
  atualizarContratante,
  buscarContratante,
  formularioDe,
  montarArgsAtualizacao,
} from "@/lib/contratantes/editarContratanteDados";
import { inserirContratante, montarPayload } from "@/lib/contratantes/novoContratanteDados";
import { criarOrganizacao } from "@/lib/organizacao/criarOrganizacaoDados";
import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  A,
  B,
  createTransport,
  eq,
  evidenceStep as step,
  forbidden,
  journeyRecorder,
  moment,
  pagination as pag,
  response,
  signal,
  type Fields,
  type Scope,
} from "./f6-code-journey-fixture";

const wire = vi.hoisted(() => ({ actor: "", fetch: vi.fn() }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f6-journeys.invalid", "fixture-key", {
      accessToken: async () => "fixture-" + wire.actor,
      global: { fetch: (r, i) => wire.fetch(r, i) },
    }),
  };
});
const proofs = journeyRecorder("sys04");
const month = "2026-11";
const ref = month + "-01";
const tag = (s: Scope) =>
  s.org === A.org ? "Material da organização Alfa" : "Material da organização Beta";
const contract = (s: Scope) => ({
  id: s.contract,
  id_organizacao: s.org,
  id_contratante: s.party,
  numero: tag(s),
  objeto: tag(s),
  situacao: "ativo",
});
const party = (s: Scope, version = 1) => ({
  id: s.party,
  id_organizacao: s.org,
  razao_social: version === 2 ? "Contratante atualizado" : tag(s),
  tipo_pessoa: "juridica" as const,
  documento: null,
  nome_fantasia: null,
  contato: {},
  situacao: "ativo",
  versao_registro: version,
  atualizado_em: moment,
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
const org = (s: Scope) => ({
  id: s.org,
  razao_social: tag(s),
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil: s.role,
});
const orgFilter = (s: Scope) => ({ id_organizacao: eq(s.org) });
const contractFilter = (s: Scope) => ({ id_contrato: eq(s.contract) });
const both = (s: Scope) => ({ ...contractFilter(s), ...orgFilter(s) });
const child = (s: Scope) => ({ ...both(s), id_competencia: eq(s.competence) });
const context = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.contract });
const unit = (s: Scope) => ({
  id: s.competence,
  ...context(s),
  competencia_referencia: ref,
  situacao: "pendente_correcao",
  periodo_inicio: null,
  periodo_fim: null,
  data_limite: null,
  atualizado_em: moment,
  percentual_conformidade: 100,
  versao_pacote_atual: null,
  versao_registro: 2,
});
const report = (s: Scope) => ({
  ...context(s),
  id: s.link,
  id_arquivo: s.version,
  numero_documento: null,
  tipo: "relatorio",
  competencia_referencia: ref,
  data_documento: null,
  status_processamento: "concluido",
  resultado_geral: null,
  origem_temporal: "pre_implantacao",
  criado_em: moment,
});
const blockers = {
  pendentes: 0,
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
};
const readonlyActions = { executar_analise: false, reanalisar: false, abrir_requisito: true };
const partyRows = (s: Scope) =>
  listarContratantes({ idOrganizacao: s.org, pagina: 1, busca: "", situacao: "todos" });
const contractRows = (s: Scope) => listarContratos({ idOrganizacao: s.org, pagina: 1 });
const auditRows = (s: Scope) =>
  obterEventosAuditoria({ idOrganizacao: s.org, pagina: 0, correlationId: s.correlation });
const event = (s: Scope, created: boolean) => ({
  id: s.link,
  id_usuario: s.actor,
  origem: "usuario",
  criado_em: moment,
  correlation_id: s.correlation,
  id_entidade: created ? s.org : s.party,
  entidade: created ? "organizacoes" : "contratantes",
  evento: created ? "OrganizacaoCriada" : "ContratanteCriado",
});
const memberAction = {
  consulta: { recurso: "organizacoes", acao: "consultar" },
  admin: { recurso: "usuarios", acao: "administrar" },
};
const denial = () => response(forbidden, 403);
function only<T>(items: T[]) {
  expect(items).toHaveLength(1);
  return items[0]!;
}
type DecodedResponse = { data: unknown; error: unknown; status?: number };

function assertResponse(r: DecodedResponse, classify: (e: unknown, status?: number) => string) {
  if (r.error) throw Error(classify(r.error, r.status));
}
const overviewArgs = (s: Scope) => ({ p_id_competencia: s.competence });

const stored = new Map<
  string,
  { party: boolean; version: number; contract: boolean; competence: boolean; org: boolean }
>();
const state = (s: Scope) => stored.get(s.org)!;
let caseId: string;
let changes = 0;
let expired = false;
let transport: ReturnType<typeof createTransport>;
const setActor = (s: Scope) => {
  wire.actor = s.actor;
};
function select(s: Scope) {
  definirPreferenciaOrganizacao(s.actor, s.org);
  setActor(s);
}
function selected(s: Scope) {
  const org = obterPreferenciaOrganizacao(s.actor);
  const target = [A, B].find((x) => x.org === org);
  expect(target?.org).toBe(s.org);
  return target!;
}

function serve(actor: Scope, route: string, args: Fields, method: string) {
  const scope = [A, B].find((s) =>
    Object.values(args).some((v) =>
      [s.org, s.party, s.contract, s.competence, s.version, s.link].some(
        (n) => v === n || v === eq(n) || v === "in.(" + n + ")",
      ),
    ),
  );
  const target = scope ?? actor;
  const own = actor.org === target.org;
  const st = state(target);
  if (route === "rpc/listar_organizacoes_disponiveis") {
    expect(args).toEqual({});
    return response(state(actor).org ? [org(actor)] : []);
  }
  if (route === "rpc/criar_organizacao") {
    expect(args).toEqual({ p_razao_social: tag(A), p_timezone: "America/Sao_Paulo" });
    if (expired) return response(forbidden, 401);
    expect(st.org).toBe(false);
    st.org = true;
    changes++;
    return response(target.org);
  }
  if (route === "rpc/consultar_permissoes_efetivas") {
    expect(args).toEqual({ p_id_organizacao: target.org, p_id_contrato: null });
    return own
      ? response({
          schema_versao: "rbac-v1",
          master: false,
          versao: 2,
          permissoes: [actor.actor === A.actor ? memberAction.admin : memberAction.consulta],
        })
      : denial();
  }
  if (!own) return denial();
  if (route === "contratantes" && method === "POST") {
    expect(args).toEqual(montarPayload(target.org, form(tag(target))));
    expect(st.party).toBe(false);
    st.party = true;
    changes++;
    return response({ id: target.party, razao_social: tag(target), situacao: "ativo" }, 201);
  }
  if (route === "rpc/atualizar_contratante") {
    expect(args).toEqual(
      montarArgsAtualizacao(target.org, target.party, st.version, form("Contratante atualizado")),
    );
    st.version++;
    changes++;
    return response({ schema_versao: "v103-v1", contratante: party(target, st.version) });
  }
  if (route === "contratos" && method === "POST") {
    expect(args).toEqual({
      id_organizacao: target.org,
      id_contratante: target.party,
      numero: tag(target),
      objeto: tag(target),
      inicio: ref,
    });
    expect(st.contract).toBe(false);
    st.contract = true;
    changes++;
    return response(null, 201);
  }
  if (route === "rpc/criar_competencia") {
    expect(args).toEqual({ p_id_contrato: target.contract, p_competencia_referencia: ref });
    expect(st.competence).toBe(false);
    st.competence = true;
    changes++;
    return response(target.competence);
  }
  if (route === "rpc/pode_consultar_auditoria_organizacao") {
    expect(args).toEqual({ p_id_organizacao: target.org });
    return response(actor.role === "administrador");
  }
  if (route === "eventos_auditoria") {
    expect(args).toEqual({ ...orgFilter(target), correlation_id: eq(target.correlation) });
    if (actor.role !== "administrador") return denial();
    return response([event(target, caseId === "C0067")]);
  }
  if (route === "contratantes") {
    const expected =
      caseId === "C0047" ? { ...orgFilter(target), id: eq(target.party) } : orgFilter(target);
    expect(args).toEqual(expected);
    return response(st.party ? [party(target, st.version)] : []);
  }
  if (route === "contratos") {
    expect(args).toEqual(caseId === "C0050" ? { id: eq(target.contract) } : orgFilter(target));
    return response(st.contract ? [contract(target)] : []);
  }
  if (route === "competencias") {
    expect(args).toEqual(
      caseId === "C0057"
        ? { ...contractFilter(target), competencia_referencia: eq(ref) }
        : contractFilter(target),
    );
    return response(st.competence ? [unit(target)] : []);
  }
  if (route === "fontes_normativas") {
    expect(args).toEqual(both(target));
    return response([
      { ...context(target), id: target.link, titulo: tag(target), situacao: "ativa" },
    ]);
  }
  if (route === "propostas_orcamentarias" || route === "listas_verificacao") {
    expect(args).toEqual(contractFilter(target));
    return response([
      {
        ...context(target),
        id: target.link,
        titulo: tag(target),
        nome: tag(target),
        situacao: "ativa",
        versao_atual: 2,
      },
    ]);
  }
  if (route === "documentos_contrato") {
    expect(args).toEqual(
      caseId === "C0055"
        ? { id: eq(target.link), ...contractFilter(target) }
        : contractFilter(target),
    );
    return response([
      {
        ...context(target),
        id: target.link,
        titulo: tag(target),
        tipo: "contrato",
        versao_atual: 1,
        situacao: "ativo",
      },
    ]);
  }
  if (route === "versoes_documento") {
    expect(args).toEqual({ id_documento_contrato: eq(target.link) });
    return response([
      {
        id: target.version,
        id_arquivo: target.requirement,
        numero_versao: 1,
        id_documento_contrato: target.link,
      },
    ]);
  }
  if (route === "arquivos") {
    expect(args).toEqual({ id: "in.(" + target.requirement + ")" });
    return response([{ id: target.requirement, status_seguranca: "aprovado" }]);
  }
  if (route === "pareceres_internos") {
    expect(args).toEqual(child(target));
    return response([
      {
        ...context(target),
        id: target.link,
        id_competencia: target.competence,
        versao: 1,
        texto: tag(target),
        status: "aprovado",
        hash: "a".repeat(64),
        autor: null,
        criado_em: moment,
        aprovado_por: null,
        aprovado_em: moment,
      },
    ]);
  }
  if (route === "apresentacoes_contratante") {
    expect(args).toEqual(child(target));
    return response([
      {
        ...context(target),
        id: target.link,
        id_competencia: target.competence,
        id_pacote: target.version,
        protocolo: tag(target),
        forma_apresentacao: "eletronica",
        apresentado_em: moment,
        tipo: "apresentacao",
        numero_rodada: 1,
      },
    ]);
  }
  if (route === "relatorios_historicos_contratante") {
    expect(args).toEqual(both(target));
    return response([report(target)]);
  }
  if (route === "rpc/obter_visao_geral_competencia") {
    expect(args).toEqual(overviewArgs(target));
    return response({
      competencia: unit(target),
      portao: {
        ...blockers,
        total: 1,
        liberado: true,
        conformes_ou_na_validos: 1,
        percentual: 100,
      },
      blocking_summary: {
        ...blockers,
        parecer_aprovado: true,
        analise_concluida_atual: true,
        aprovacao_apresentacao_atual: true,
      },
      allowed_actions: {
        abrir_documentos: true,
        analisar: false,
        abrir_parecer: true,
        apresentar: false,
      },
    });
  }
  if (route === "rpc/obter_documentos_competencia_v115") {
    expect(args).toEqual({
      ...overviewArgs(target),
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    });
    return response({
      schema_versao: "v115-v1",
      competencia: unit(target),
      estado_documental: "complete",
      resumo: {
        documentos_total: 1,
        requisitos_documentais_total: 0,
        requisitos_documentais_aplicaveis: 0,
        requisitos_documentais_pendentes: 0,
      },
      documentos: [{ id: target.link, tipo: "contrato", titulo: tag(target), situacao: "ativo" }],
      requisitos_documentais: [],
      documentos_paginacao: pag(25, 1),
      requisitos_paginacao: pag(25),
      capacidades: {
        pode_enviar: false,
        pode_nova_versao: false,
        motivo_nova_versao_obrigatorio: true,
      },
    });
  }
  if (route === "rpc/obter_analise_competencia_v116") {
    expect(args).toEqual({
      ...overviewArgs(target),
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
    return response({
      schema_versao: "v116-v1",
      competencia: unit(target),
      estado_analise: "complete",
      stale: false,
      percentual: 100,
      blocking_summary: blockers,
      allowed_actions: readonlyActions,
      execucao_atual: { id: target.version, status: "concluida" },
      mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
      resultados: [
        {
          id_resultado: target.link,
          id_requisito: target.requirement,
          mecanismo: "deterministico",
          resultado: "conforme",
          requisito: { codigo: "F6", criticidade: "alta" },
          evidencias: [],
        },
      ],
      resultados_paginacao: pag(25, 1),
      execucoes: [],
      execucoes_paginacao: pag(10),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  }
  if (route === "rpc/obter_detalhe_requisito_v117") {
    expect(args).toEqual({
      ...overviewArgs(target),
      p_id_requisito: target.requirement,
      p_evidencias_offset: 0,
      p_evidencias_limite: 25,
      p_historico_offset: 0,
      p_historico_limite: 25,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
    });
    return response({
      schema_versao: "v117-v1",
      competencia: unit(target),
      requisito: { id: target.requirement, codigo: "F6", aplicavel: true },
      execucao_atual: null,
      resultado_atual: null,
      resultado_referencia: null,
      na_validade: null,
      allowed_actions: readonlyActions,
      evidencias: [],
      evidencias_paginacao: pag(25),
      historico: [],
      historico_paginacao: pag(25),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  }
  throw Error("Unexpected SYS04 endpoint " + route);
}

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  changes = 0;
  expired = false;
  transport = createTransport(serve);
  wire.fetch.mockImplementation(transport.fetch);
});
afterEach(() => {
  sessionStorage.clear();
  wire.actor = "";
  stored.clear();
});
afterAll(proofs.write);

function reset(id: string) {
  caseId = id;
  stored.clear();
  for (const s of [A, B])
    stored.set(s.org, {
      party: s === B || id !== "C0046",
      version: 1,
      contract: s === B || id !== "C0049",
      competence: s === B || id !== "C0057",
      org: s === B || id !== "C0067",
    });
}
const mutations = new Set(["C0046", "C0047", "C0049", "C0057", "C0067"]);
const permission = async (s: Scope) => {
  const cap = await consultarPermissoesEfetivas(s.org, null);
  return {
    org: s.org,
    version: cap.versao,
    canAdmin: temPermissao(cap.permissoes, "usuarios", "administrar"),
  };
};
async function read(s: Scope): Promise<Fields> {
  switch (caseId) {
    case "C0041":
      return permission(s);
    case "C0045":
    case "C0046": {
      const rows = await partyRows(s);
      return {
        items: rows.itens.map((p) => ({ id: p.id, name: p.razao_social })),
        total: rows.total,
      };
    }
    case "C0047": {
      const current = await buscarContratante(s.org, s.party);
      return { id: current.id, name: current.razao_social, version: current.versao_registro };
    }
    case "C0048":
    case "C0049": {
      const rows = await contractRows(s);
      return { items: rows.itens.map((c) => ({ id: c.id, number: c.numero })), total: rows.total };
    }
    case "C0050": {
      const c = await obterContrato(s.contract, signal());
      return { id: c.id, number: c.numero };
    }
    case "C0051": {
      const page = await listarFontes(
        { org: s.org, contrato: s.contract, escopo: "contrato", situacao: "", pagina: 0 },
        signal(),
      );
      return { id: only(page.itens).id, total: page.total };
    }
    case "C0052":
      return { id: only((await listarPropostas(s.contract, 0, signal())).itens).id };
    case "C0053":
      return { id: only((await listarListas(s.contract, 0, signal())).itens).id };
    case "C0054":
      return { id: only((await listarDocumentos(s.contract, DOCUMENTOS, 0, signal())).itens).id };
    case "C0055": {
      const doc = await obterDocumento(s.contract, s.link, signal());
      const versions = await listarVersoes(doc.id, 0, signal());
      const version = only(versions.itens);
      expect(version.id_arquivo).toBe(s.requirement);
      expect(versions.arquivos[s.requirement]?.status_seguranca).toBe("aprovado");
      return { id: doc.id, version: version.id, file: version.id_arquivo };
    }
    case "C0056":
      return {
        id: only(
          (await listarCompetencias(s.contract, FILTROS_COMPETENCIA_VAZIOS, 0, signal())).itens,
        ).id,
      };
    case "C0057":
      return { id: await verificarCompetenciaExistente(s.contract, month), reference: ref };
    case "C0058":
    case "C0063": {
      const r = await obterVisaoGeral(s.competence, signal());
      assertResponse(r, classificarErroVisaoGeral);
      const value = parseVisaoGeral(r.data);
      expect(value?.competencia.id).toBe(s.competence);
      expect(value?.portao).toMatchObject({ liberado: true, percentual: 100 });
      return { id: value!.competencia.id, canPresent: value!.allowed_actions.apresentar };
    }
    case "C0059": {
      const r = await obterDocumentosCompetencia(s.competence, 0, 0, signal());
      assertResponse(r, classificarErroV115);
      const value = parseLeituraV115(r.data);
      expect(value?.competencia.id).toBe(s.competence);
      return { id: only(value!.documentos).id, competence: value!.competencia.id };
    }
    case "C0060": {
      const r = await obterAnaliseCompetencia(s.competence, ANALISE, OFFSETS_ZERO, signal());
      assertResponse(r, classificarErroV116);
      const value = parseAnaliseV116(r.data);
      expect(value?.competencia.id).toBe(s.competence);
      const result = only(value!.resultados);
      expect(result.id_requisito).toBe(s.requirement);
      return { id: result.id_resultado, requirement: result.id_requisito, stale: value!.stale };
    }
    case "C0061": {
      const r = await obterDetalheRequisito(
        s.competence,
        s.requirement,
        OFFSETS_DETALHE_ZERO,
        signal(),
      );
      assertResponse(r, classificarErroV117);
      const value = parseDetalheV117(r.data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO);
      expect(value?.requisito.id).toBe(s.requirement);
      return { id: value!.requisito.id, competence: value!.competencia.id };
    }
    case "C0062":
      return {
        id: only((await listarPareceres(s.competence, s.org, s.contract, 0, signal())).itens).id,
      };
    case "C0064":
      return {
        id: only((await listarApresentacoes(s.competence, s.org, s.contract, 0, signal())).itens)
          .id,
      };
    case "C0065":
    case "C0066":
      return {
        id: only((await listarRelatoriosHistoricos(s.contract, s.org, 0, signal())).itens).id,
      };
    case "C0067":
    case "C0068": {
      expect(await podeConsultarAuditoria(s.org)).toBe(true);
      const row = only((await auditRows(s)).eventos);
      expect(row).toEqual(event(s, caseId === "C0067"));
      return { id: row.id, correlation: row.correlation_id, entity: row.id_entidade };
    }
    default:
      throw Error("Unmapped consumer " + caseId);
  }
}
async function command(s: Scope) {
  switch (caseId) {
    case "C0046": {
      const result = await inserirContratante(montarPayload(s.org, form(tag(s))));
      return { id: result.id };
    }
    case "C0047": {
      const current = state(s).version;
      const result = await atualizarContratante(
        montarArgsAtualizacao(s.org, s.party, current, {
          ...formularioDe(party(s, current)),
          razaoSocial: "Contratante atualizado",
        }),
      );
      return { id: result.id, version: result.versao_registro };
    }
    case "C0049":
      await inserirContrato({
        id_organizacao: s.org,
        id_contratante: s.party,
        numero: tag(s),
        objeto: tag(s),
        inicio: ref,
      });
      return { id: s.contract };
    case "C0057":
      return { id: await criarCompetencia(s.contract, month) };
    case "C0067":
      return { id: await criarOrganizacao({ razaoSocial: tag(s), nomeFantasia: "", cnpj: "" }) };
    default:
      return read(s);
  }
}
function assertScoped(s: Scope, found: Fields) {
  if (caseId === "C0041") expect(found["org"]).toBe(s.org);
  else if (["C0045", "C0046", "C0048", "C0049"].includes(caseId)) {
    expect(only(found["items"] as Fields[])["id"]).toBe(
      caseId === "C0045" || caseId === "C0046" ? s.party : s.contract,
    );
  } else {
    expect(Object.values(s)).toContain(found["id"]);
  }
}
async function foreign() {
  if (caseId === "C0067") expired = true;
  if (caseId === "C0068") {
    await expect(auditRows(A)).rejects.toThrow("Acesso não autorizado");
  } else {
    await expect(command(A)).rejects.toThrow();
  }
  const denied = transport.trace.at(-1)!;
  expect(denied).toMatchObject({ actor: B.actor, status: expired ? 401 : 403, code: "42501" });
  expired = false;
  return denied;
}
const snapshot = (s: Scope) => structuredClone(state(s));
describe("F6 SYS04 journeys", () => {
  for (const row of proofs.cases) {
    it(
      row.caseId + " positive: carries the chosen organization through action, readback and reload",
      async () => {
        reset(row.sourceConnectionId);
        wire.actor = A.actor;
        definirPreferenciaOrganizacao(A.actor, B.org);
        const previous = obterPreferenciaOrganizacao(A.actor);
        const before = snapshot(A);
        if (caseId === "C0057")
          expect(await verificarCompetenciaExistente(A.contract, month)).toBeNull();
        if (caseId === "C0067") expect(await listarOrganizacoesDisponiveis()).toEqual([]);
        if (caseId === "C0049")
          expect(
            only(
              (await buscarOpcoesContratantes({ idOrganizacao: A.org, busca: "", pagina: 1 }))
                .itens,
            ).id,
          ).toBe(A.party);
        if (caseId !== "C0067") select(A);
        const applied = await command(caseId === "C0067" ? A : selected(A));
        if (caseId === "C0067") {
          expect(applied["id"]).toBe(A.org);
          expect(only(await listarOrganizacoesDisponiveis()).id).toBe(A.org);
          select(A);
        }
        const visible = await read(selected(A));
        assertScoped(A, visible);
        const readback = await read(selected(A));
        expect(readback).toEqual(visible);
        expect(changes).toBe(Number(mutations.has(caseId)));
        if (mutations.has(caseId)) expect(snapshot(A)).not.toEqual(before);
        const initial = { previous, state: before };
        proofs.record(row.sourceConnectionId, "positive", A, {
          preconditions: initial,
          steps: [
            step("precondition", initial),
            step("producer", { selected: selected(A).org, ...applied }),
            step("consumer", visible),
            step("recovery", readback),
          ],
          observed: visible,
          postconditions: { selected: selected(A).org, changes, otherScope: snapshot(B) },
          recoveryProof: readback,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(
      row.caseId +
        " negative: rejects the stale scope, preserves state and reloads the valid context",
      async () => {
        reset(row.sourceConnectionId);
        definirPreferenciaOrganizacao(A.actor, A.org);
        expect(obterPreferenciaOrganizacao(B.actor)).toBeNull();
        select(B);
        const before = { authorized: selected(B).org, foreign: snapshot(A), own: snapshot(B) };
        const refusal = await foreign();
        expect(changes).toBe(0);
        expect(snapshot(A)).toEqual(before.foreign);
        expect(snapshot(B)).toEqual(before.own);
        const recovered =
          caseId === "C0067" || caseId === "C0068"
            ? await permission(selected(B))
            : await read(selected(B));
        if (caseId === "C0067" || caseId === "C0068") expect(recovered["canAdmin"]).toBe(false);
        else assertScoped(B, recovered);
        proofs.record(
          row.sourceConnectionId,
          "negative",
          caseId === "C0067" ? { ...B, role: "anon" } : B,
          {
            preconditions: before,
            steps: [
              step("precondition", before),
              step("producer", { selected: selected(B).org }),
              step("consumer", refusal),
              step("recovery", recovered),
            ],
            observed: {
              status: refusal.status,
              code: refusal.code,
              activeOrganization: selected(B).org,
            },
            postconditions: { changes, preserved: before.foreign },
            recoveryProof: recovered,
            negativeProof: {
              decision: "DENIED",
              status: refusal.status,
              code: refusal.code!,
              effects: 0,
              disclosed: false,
            },
            cleanupStatus: "CLEAN",
          },
        );
      },
    );
  }
});

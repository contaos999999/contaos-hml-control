import {
  A as identityBase,
  evidenceStep as step,
  journeyRecorder,
} from "./f6-code-journey-fixture";
import { createHash } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  classificarErroV116,
  FILTROS_VAZIOS,
  obterAnaliseCompetencia,
  OFFSETS_ZERO,
  parseAnaliseV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  classificarErroV115,
  criarDocumentoCompetencia,
  obterDocumentosCompetencia,
  parseLeituraV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import {
  classificarErroVisaoGeral,
  derivarEstadoVisual,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import {
  classificarErroV117,
  obterDetalheRequisito,
  OFFSETS_DETALHE_ZERO,
  parseDetalheV117,
} from "@/lib/competencias/requisitoDetalheDados";

const wire = vi.hoisted(() => ({ fetch: vi.fn(), session: "" }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://f54.invalid", "fixture-key", {
      accessToken: async () => wire.session,
      global: { fetch: (input, init) => wire.fetch(input, init) },
    }),
  };
});
const uid = (side: string, n: number) =>
  side + "5420000-0000-4000-8000-" + String(n).padStart(12, "0");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  session: "fixture-competence-" + side,
  contract: uid(side, 1),
  document: uid(side, 2),
  version: uid(side, 3),
  file: uid(side, 4),
  oldVersion: uid(side, 5),
  oldFile: uid(side, 6),
  competence: uid(side, 7),
  requirement: uid(side, 8),
  evidence: uid(side, 9),
  event: uid(side, 10),
  correlation: uid(side, 11),
  request: uid(side, 12),
  execution: uid(side, 13),
  result: uid(side, 14),
  opinion: uid(side, 15),
  hash: hash("Documento V115 " + side),
  oldHash: hash("Evidência anterior V115 " + side),
});
const A = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
  "administrador",
);
const B = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
  "leitor",
);
type Scope = typeof A;
type Step = {
  name: string;
  args: Record<string, unknown>;
  data: unknown;
  status: number;
  method: "GET" | "POST";
};
const steps: Step[] = [];
const calls: Step[] = [];
const ok = (name: string, args: Record<string, unknown>, data: unknown, status = 200): Step => ({
  name: "rpc/" + name,
  args,
  data,
  status,
  method: "POST",
});
const pageOf = (name: string, args: Record<string, unknown>, data: object[]): Step => ({
  name,
  args,
  data,
  status: 200,
  method: "GET",
});
const err = (code: string) => ({ code, message: "Resposta sintética " + code });
const deny = err("42501");
const signal = () => new AbortController().signal;
const date = "2026-11-01T12:00:00Z";
const pair = (s: Scope) => ({ id_organizacao: s.org, id_contrato: s.contract });
const count = (limite: number, total = 0) => ({ offset: 0, limite, total });

beforeEach(() => {
  steps.length = 0;
  calls.length = 0;
  wire.fetch.mockReset().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const step = steps.shift();
    if (!step) throw new Error("Unexpected synthetic request");
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f54.invalid");
    expect(url.pathname).toBe("/rest/v1/" + step.name);
    expect(init?.method).toBe(step.method);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer " + wire.session);
    if (step.method === "POST") expect(JSON.parse(String(init?.body))).toEqual(step.args);
    else
      expect(
        Object.fromEntries(
          [...url.searchParams].filter(
            ([k]) => !["select", "order", "offset", "limit"].includes(k),
          ),
        ),
      ).toEqual(step.args);
    calls.push(step);
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(step.data))
      headers.set("content-range", step.data.length ? "0-0/" + step.data.length : "*/0");
    return new Response(JSON.stringify(step.data), { status: step.status, headers });
  });
});
afterEach(() => {
  expect(steps).toEqual([]);
  expect(wire.fetch).toHaveBeenCalledTimes(calls.length);
});
function use(s: Scope, ...queries: Step[]) {
  expect(steps).toEqual([]);
  wire.session = s.session;
  steps.push(...queries);
}

const cases = [
  ["0410", "V114", "obter_visao_geral_competencia"],
  ["0413", "V116", "obter_analise_competencia_v116"],
  ["0415", "V117", "obter_detalhe_requisito_v117"],
  ["0416", "V118", "pareceres_internos"],
  ["0418", "V119", "obter_visao_geral_competencia"],
  ["0420", "V123", "eventos_auditoria"],
] as const;
type Case = (typeof cases)[number];
const producer = "criar_documento_competencia_v115";
const event = "DocumentoCompetenciaCriado";
const entity = "documentos_competencia";
const status = (changed: boolean) =>
  changed ? "pendente_correcao" : "pode_apresentar_contratante";
const competence = (s: Scope, changed: boolean) => ({
  id: s.competence,
  ...pair(s),
  competencia_referencia: "2026-11-01",
  situacao: status(changed),
  periodo_inicio: "2026-11-01",
  periodo_fim: "2026-11-30",
  data_limite: null,
  atualizado_em: date,
  versao_registro: changed ? 2 : 1,
  percentual_conformidade: changed ? 0 : 100,
  versao_pacote_atual: null,
});
const requirement = (s: Scope) => ({
  id: s.requirement,
  codigo: "F54",
  aplicavel: true,
  obrigatorio: true,
  impeditivo: true,
  tipos_esperados: ["contrato"],
});
const document = (s: Scope) => ({
  id: s.document,
  tipo: "contrato",
  titulo: "Documento de competência",
  situacao: "ativo",
  versao_atual: 1,
  requisito: { id: s.requirement, codigo: "F54" },
  versao: { id: s.version, numero_versao: 1, hash: s.hash, id_arquivo: s.file },
  arquivo: {
    id: s.file,
    nome_original: "competencia.pdf",
    mime: "application/pdf",
    sha256: s.hash,
    status_seguranca: "aprovado",
  },
});
const loadDocs = (s: Scope, present: boolean, allowed = true) =>
  ok(
    "obter_documentos_competencia_v115",
    {
      p_id_competencia: s.competence,
      p_documentos_offset: 0,
      p_documentos_limite: 25,
      p_requisitos_offset: 0,
      p_requisitos_limite: 25,
    },
    allowed
      ? {
          schema_versao: "v115-v1",
          competencia: competence(s, present),
          estado_documental: present ? "processing" : "missing_docs",
          resumo: {
            documentos_total: Number(present),
            requisitos_documentais_total: 1,
            requisitos_documentais_aplicaveis: 1,
            requisitos_documentais_pendentes: 1,
          },
          documentos: present ? [document(s)] : [],
          requisitos_documentais: [{ ...requirement(s), atendido: false }],
          documentos_paginacao: count(25, Number(present)),
          requisitos_paginacao: count(25, 1),
          capacidades: {
            pode_enviar: s.role === "administrador",
            pode_nova_versao: s.role === "administrador",
            motivo_nova_versao_obrigatorio: true,
          },
        }
      : deny,
    allowed ? 200 : 403,
  );
async function readDocs(s: Scope, present: boolean, allowed = true) {
  const response = await obterDocumentosCompetencia(s.competence, 0, 0, signal());
  const value = parseLeituraV115(response.data);
  if (!allowed) {
    expect(classificarErroV115(response.error, response.status)).toBe("sem_permissao");
    expect(value).toBeNull();
    return undefined;
  }
  expect(value).toMatchObject({
    competencia: { id: s.competence, ...pair(s) },
    requisitos: [{ id: s.requirement }],
  });
  if (present)
    expect(value?.documentos).toMatchObject([
      {
        id: s.document,
        versao_atual: 1,
        requisito: { id: s.requirement },
        versao: { numero_versao: 1, hash: s.hash, id_arquivo: s.file },
        arquivo: { id: s.file, sha256: s.hash },
      },
    ]);
  else expect(value?.documentos).toEqual([]);
  return value;
}
const writeArgs = (s: Scope, req: string) => ({
  p_id_competencia: s.competence,
  p_tipo: "contrato",
  p_titulo: "Documento de competência",
  p_categoria: null,
  p_id_requisito: req,
  p_id_arquivo: s.file,
  p_chave_idempotencia: s.request,
});
function writeRequest(s: Scope, code = 200, req = s.requirement) {
  return ok(
    producer,
    writeArgs(s, req),
    code === 200
      ? {
          id_documento: s.document,
          id_versao: s.version,
          numero_versao: 1,
          id_arquivo: s.file,
          correlation_id: s.correlation,
        }
      : code === 400
        ? err("PT400")
        : code === 502
          ? err("XX000")
          : deny,
    code,
  );
}
const write = (s: Scope, idRequisito = s.requirement) =>
  criarDocumentoCompetencia({
    idCompetencia: s.competence,
    tipo: "contrato",
    titulo: " Documento de competência ",
    categoria: " ",
    idRequisito,
    idArquivo: s.file,
    chave: s.request,
  });
const blocking = (changed: boolean) => ({
  pendentes: Number(changed),
  nao_conformes: 0,
  inconclusivos: 0,
  em_analise: 0,
  nao_conformidades_bloqueantes: 0,
});
const actions = (changed: boolean) => ({
  executar_analise: true,
  reanalisar: changed,
  abrir_requisito: true,
});
const execution = (s: Scope) => ({ id: s.execution, status: "concluido", hash_entrada: s.oldHash });
const result = (s: Scope) => ({
  id: s.result,
  id_execucao: s.execution,
  resultado: "conforme",
  mecanismo: "deterministico",
  hash_evidencias: s.oldHash,
});
const evidence = (s: Scope) => ({
  id: s.evidence,
  tipo_evidencia: "documento",
  pagina: 1,
  trecho: "Evidência anterior",
  hash: s.oldHash,
  documento: {
    id_versao_documento: s.oldVersion,
    id_arquivo: s.oldFile,
    hash_versao: s.oldHash,
    status_seguranca: "aprovado",
  },
});
function overview(s: Scope, allowed: boolean, changed: boolean) {
  return ok(
    "obter_visao_geral_competencia",
    { p_id_competencia: s.competence },
    allowed
      ? {
          competencia: competence(s, changed),
          portao: {
            ...blocking(changed),
            liberado: !changed,
            total: 1,
            conformes_ou_na_validos: Number(!changed),
            percentual: changed ? 0 : 100,
          },
          blocking_summary: {
            ...blocking(changed),
            parecer_aprovado: !changed,
            analise_concluida_atual: !changed,
            aprovacao_apresentacao_atual: !changed,
          },
          allowed_actions: {
            abrir_documentos: true,
            analisar: true,
            abrir_parecer: true,
            apresentar: !changed,
          },
        }
      : deny,
    allowed ? 200 : 403,
  );
}
const opinion = (s: Scope) => ({
  id: s.opinion,
  ...pair(s),
  id_competencia: s.competence,
  versao: 1,
  status: "aprovado",
  texto: "Parecer histórico",
  hash: s.oldHash,
  autor: null,
  criado_em: date,
  aprovado_por: null,
  aprovado_em: date,
});
const audit = (s: Scope) => ({
  id: s.event,
  criado_em: date,
  evento: event,
  entidade: entity,
  origem: "usuario",
  id_usuario: s.actor,
  id_entidade: s.document,
  correlation_id: s.correlation,
});
const eq = (field: string, value: string) => ({ [field]: "eq." + value });
function consumer(c: Case, s: Scope, allowed: boolean, changed = true): Step[] {
  const scoped = {
    ...eq("id_competencia", s.competence),
    ...eq("id_organizacao", s.org),
    ...eq("id_contrato", s.contract),
  };
  if (c[1] === "V118")
    return [pageOf(c[2], scoped, allowed ? [opinion(s)] : []), overview(s, allowed, changed)];
  if (c[1] === "V123")
    return [
      ok("pode_consultar_auditoria_organizacao", { p_id_organizacao: s.org }, allowed),
      pageOf(
        c[2],
        {
          ...eq("id_organizacao", s.org),
          ...eq("evento", event),
          ...eq("entidade", entity),
          ...eq("correlation_id", s.correlation),
        },
        allowed ? [audit(s)] : [],
      ),
    ];
  if (c[1] === "V116")
    return [
      ok(
        c[2],
        {
          p_id_competencia: s.competence,
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
        },
        allowed
          ? {
              schema_versao: "v116-v1",
              competencia: competence(s, changed),
              estado_analise: changed ? "stale" : "complete",
              stale: changed,
              percentual: changed ? 0 : 100,
              blocking_summary: blocking(changed),
              allowed_actions: actions(changed),
              execucao_atual: execution(s),
              mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
              resultados: [
                {
                  ...result(s),
                  id_resultado: s.result,
                  id_requisito: s.requirement,
                  requisito: requirement(s),
                  evidencias: [evidence(s)],
                },
              ],
              resultados_paginacao: count(25, 1),
              execucoes: [execution(s)],
              execucoes_paginacao: count(10, 1),
              apontamentos: [],
              apontamentos_paginacao: count(25),
            }
          : deny,
        allowed ? 200 : 403,
      ),
    ];
  if (c[1] === "V117")
    return [
      ok(
        c[2],
        {
          p_id_competencia: s.competence,
          p_id_requisito: s.requirement,
          p_evidencias_offset: 0,
          p_evidencias_limite: 25,
          p_historico_offset: 0,
          p_historico_limite: 25,
          p_apontamentos_offset: 0,
          p_apontamentos_limite: 25,
        },
        allowed
          ? {
              schema_versao: "v117-v1",
              competencia: competence(s, changed),
              requisito: requirement(s),
              execucao_atual: execution(s),
              resultado_atual: changed ? null : result(s),
              resultado_referencia: result(s),
              na_validade: null,
              allowed_actions: actions(changed),
              evidencias: [evidence(s)],
              evidencias_paginacao: count(25, 1),
              historico: [
                {
                  id_resultado: s.result,
                  id_execucao: s.execution,
                  resultado: "conforme",
                  hash_entrada: s.oldHash,
                },
              ],
              historico_paginacao: count(25, 1),
              apontamentos: [],
              apontamentos_paginacao: count(25),
            }
          : deny,
        allowed ? 200 : 403,
      ),
    ];
  return [overview(s, allowed, changed)];
}
async function readOverview(s: Scope, allowed: boolean, changed: boolean) {
  const reply = await obterVisaoGeral(s.competence, signal());
  const parsed = parseVisaoGeral(reply.data);
  if (!allowed) {
    expect(classificarErroVisaoGeral(reply.error, reply.status)).toBe("sem_permissao");
    expect(parsed).toBeNull();
    return null;
  }
  expect(parsed).toMatchObject({
    competencia: { id: s.competence, ...pair(s) },
    portao: { liberado: !changed },
    blocking_summary: { analise_concluida_atual: !changed },
    allowed_actions: { apresentar: !changed },
  });
  return parsed!;
}
type Readback = {
  resultId?: string;
  event?: string;
  entityId?: string | null;
  correlation?: string;
  previousHash?: string | null;
  retainedVersion?: string | null;
  stale?: boolean;
  canPresent?: boolean;
};
async function readConsumer(
  c: Case,
  s: Scope,
  allowed: boolean,
  changed = true,
): Promise<Readback> {
  if (c[1] === "V123") {
    expect(await podeConsultarAuditoria(s.org)).toBe(allowed);
    const p = await obterEventosAuditoria({
      idOrganizacao: s.org,
      pagina: 0,
      evento: event,
      entidade: entity,
      correlationId: s.correlation,
    });
    expect(p.eventos).toEqual(allowed ? [audit(s)] : []);
    const a = p.eventos[0];
    return a
      ? { resultId: a.id, event: a.evento, entityId: a.id_entidade, correlation: a.correlation_id }
      : {};
  }
  if (c[1] === "V116") {
    const r = await obterAnaliseCompetencia(s.competence, FILTROS_VAZIOS, OFFSETS_ZERO, signal());
    const parsed = parseAnaliseV116(r.data);
    if (!allowed) {
      expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
      expect(parsed).toBeNull();
      return {};
    }
    expect(r.data).toMatchObject({ competencia: { id: s.competence, ...pair(s) } });
    expect(parsed).toMatchObject({
      competencia: { id: s.competence },
      stale: changed,
      allowed_actions: { reanalisar: changed },
      execucao_atual: { id: s.execution, hash_entrada: s.oldHash },
      resultados: [{ id_requisito: s.requirement }],
    });
    return {
      resultId: parsed!.competencia.id,
      stale: parsed!.stale,
      previousHash: parsed!.execucao_atual!.hash_entrada,
    };
  }
  if (c[1] === "V117") {
    const r = await obterDetalheRequisito(
      s.competence,
      s.requirement,
      OFFSETS_DETALHE_ZERO,
      signal(),
    );
    const parsed = parseDetalheV117(r.data, s.competence, s.requirement, OFFSETS_DETALHE_ZERO);
    if (!allowed) {
      expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
      expect(parsed).toBeNull();
      return {};
    }
    expect(r.data).toMatchObject({ competencia: { id: s.competence, ...pair(s) } });
    expect(parsed).toMatchObject({
      requisito: { id: s.requirement },
      resultado_referencia: result(s),
      resultado_atual: changed ? null : result(s),
      evidencias: [evidence(s)],
    });
    return {
      resultId: parsed!.requisito.id,
      previousHash: parsed!.evidencias[0]!.documento!.hash_versao,
      retainedVersion: parsed!.evidencias[0]!.documento!.id_versao_documento,
    };
  }
  if (c[1] === "V118") {
    const rows = await listarPareceres(s.competence, s.org, s.contract, 0, signal());
    expect(rows.itens).toEqual(allowed ? [opinion(s)] : []);
    const view = await readOverview(s, allowed, changed);
    return view
      ? {
          resultId: rows.itens[0]!.id,
          previousHash: rows.itens[0]!.hash,
          canPresent: view.allowed_actions.apresentar,
        }
      : {};
  }
  const parsed = await readOverview(s, allowed, changed);
  if (c[1] === "V119" && changed && parsed) expect(derivarEstadoVisual(parsed)).not.toBe("ready");
  return parsed
    ? { resultId: parsed.competencia.id, canPresent: parsed.allowed_actions.apresentar }
    : {};
}
const proofs = journeyRecorder("competencedocs");

const identity = (s: Scope) => ({ ...identityBase, actor: s.actor, org: s.org, role: s.role });
describe("F6 competence document journeys", () => {
  for (const c of cases) {
    const id = "IFV1-F6-C" + c[0];
    const supportsRefresh = c[1] !== "V123";
    it(
      id +
        " positive: resumes a scoped document command after a failed response and verifies its evidence",
      async () => {
        use(
          A,
          loadDocs(A, false),
          ...(supportsRefresh ? consumer(c, A, true, false) : []),
          writeRequest(A, 502),
          loadDocs(A, false),
        );
        const initial = await readDocs(A, false);
        const prior = supportsRefresh ? await readConsumer(c, A, true, false) : undefined;
        await expect(write(A)).rejects.toMatchObject({ tipo: "erro" });
        const failed = calls.at(-1)!;
        expect(failed).toMatchObject({ status: 502, data: { code: "XX000" } });
        expect(await readDocs(A, false)).toEqual(initial);
        use(A, writeRequest(A), loadDocs(A, true), ...consumer(c, A, true), loadDocs(A, true));
        const written = await write(A);
        const saved = (await readDocs(A, true))!.documentos[0]!;
        expect(written).toEqual({
          id_documento: saved.id,
          id_versao: A.version,
          id_arquivo: saved.arquivo!.id,
          numero_versao: 1,
        });
        const reached = await readConsumer(c, A, true);
        if (prior) expect(reached.resultId).toBe(prior.resultId);
        if (c[1] === "V123") {
          const accepted = calls.find((x) => x.name === "rpc/" + producer && x.status === 200)!;
          expect(reached.correlation).toBe(
            (accepted.data as { correlation_id: string }).correlation_id,
          );
        }
        const reload = (await readDocs(A, true))!.documentos[0]!;
        expect(reload).toEqual(saved);
        expect(reload.versao).toEqual({
          numero_versao: written.numero_versao,
          hash: reload.arquivo!.sha256,
          id_arquivo: written.id_arquivo,
        });
        const proof = {
          id: reload.id,
          requirement: reload.requisito!.id,
          version: reload.versao!.numero_versao,
          commandVersion: written.id_versao,
          hash: reload.arquivo!.sha256,
          file: reload.arquivo!.id,
        };
        const original = { comp: A.competence, documents: initial!.documentos.length };
        proofs.record("C" + c[0], "positive", identity(A), {
          preconditions: original,
          steps: [
            step("precondition", original),
            step("producer", { ...written, resumedAfter: failed.status }),
            step("consumer", { ...reached, binding: proof.requirement }),
            step("recovery", proof),
          ],
          observed: { ...reached, ...proof },
          postconditions: { organization: A.org, contract: A.contract, ...proof },
          recoveryProof: proof,
          cleanupStatus: "CLEAN",
        });
      },
    );
    it(
      id + " negative: refuses the foreign document and rereads the original scoped evidence",
      async () => {
        use(
          B,
          loadDocs(B, true),
          writeRequest(A, 403),
          loadDocs(A, false, false),
          ...consumer(c, A, false),
          loadDocs(B, true),
        );
        const before = await readDocs(B, true);
        await expect(write(A)).rejects.toMatchObject({ tipo: "sem_permissao" });
        const blocked = calls.at(-1)!;
        expect(blocked).toMatchObject({
          name: "rpc/" + producer,
          status: 403,
          data: { code: "42501" },
        });
        expect(await readDocs(A, false, false)).toBeUndefined();
        expect(await readConsumer(c, A, false)).toEqual({});
        const after = await readDocs(B, true);
        expect(after).toEqual(before);
        const crossed = c[0] === "0415";
        use(A, ...(crossed ? [writeRequest(A, 400, B.requirement)] : []), loadDocs(A, false));
        if (crossed) {
          await expect(write(A, B.requirement)).rejects.toMatchObject({ tipo: "erro" });
          expect(calls.at(-1)).toMatchObject({
            status: 400,
            data: { code: "PT400" },
            args: { p_id_requisito: B.requirement },
          });
        }
        const unchanged = await readDocs(A, false);
        expect(unchanged!.documentos).toEqual([]);
        const initial = { id: before!.competencia.id, document: before!.documentos[0]!.id };
        const own = {
          id: after!.competencia.id,
          document: after!.documentos[0]!.id,
          hash: after!.documentos[0]!.arquivo!.sha256,
        };
        proofs.record("C" + c[0], "negative", identity(B), {
          preconditions: initial,
          steps: [
            step("precondition", initial),
            step("producer", { status: blocked.status, code: "42501" }),
            step("consumer", { foreignVisible: false }),
            step("recovery", own),
          ],
          observed: { status: 403, code: "42501" },
          postconditions: { foreignDocuments: unchanged!.documentos.length, crossed },
          recoveryProof: own,
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

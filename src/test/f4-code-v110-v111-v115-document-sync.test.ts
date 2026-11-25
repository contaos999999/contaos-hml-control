/** Actual document commands/read adapters. Files are preconfirmed local fixtures, not a LIVE upload claim. */
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const m = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc, from: m.from } }));
import {
  criarDocumentoCompleto,
  adicionarVersao,
  listarDocumentos,
  obterResumos,
  FILTROS_VAZIOS as DOC_FILTERS,
} from "@/lib/contratos/documentosDados";
import {
  criarDocumentoCompetencia,
  obterDocumentosCompetencia,
  parseLeituraV115,
} from "@/lib/competencias/competenciaDocumentosDados";
import { listarFontes, listarVersoes, obterTextoVersao } from "@/lib/contratos/baseNormativaDados";
import {
  obterAnaliseCompetencia,
  parseAnaliseV116,
  FILTROS_VAZIOS,
  OFFSETS_ZERO,
  classificarErroV116,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  obterDetalheRequisito,
  parseDetalheV117,
  OFFSETS_DETALHE_ZERO,
  classificarErroV117,
} from "@/lib/competencias/requisitoDetalheDados";
import {
  obterVisaoGeral,
  parseVisaoGeral,
  classificarErroVisaoGeral,
  derivarEstadoVisual,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { listarPareceres } from "@/lib/competencias/parecerInternoDados";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import { podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
const ORG = "c1200000-0000-4000-8000-000000000001",
  CONTRACT = "c1200000-0000-4000-8000-000000000002",
  COMP = "c1200000-0000-4000-8000-000000000003",
  DOC = "c1200000-0000-4000-8000-000000000004",
  OLD = "c1200000-0000-4000-8000-000000000005",
  VERSION = "c1200000-0000-4000-8000-000000000006",
  OLD_FILE = "c1200000-0000-4000-8000-000000000007",
  FILE = "c1200000-0000-4000-8000-000000000008",
  REQ = "c1200000-0000-4000-8000-000000000009",
  EXEC = "c1200000-0000-4000-8000-000000000010",
  RESULT = "c1200000-0000-4000-8000-000000000011",
  EVIDENCE = "c1200000-0000-4000-8000-000000000012",
  SOURCE_ID = "c1200000-0000-4000-8000-000000000013",
  EVENT = "c1200000-0000-4000-8000-000000000014",
  KEY = "c1200000-0000-4000-8000-000000000015";
const OLD_HASH = createHash("sha256").update("F4 previous file").digest("hex"),
  HASH = createHash("sha256").update("F4 new file").digest("hex");
const DATE = "2026-11-01T12:00:00Z",
  TITLE = "Documento F4",
  TEXT = "Trecho documental F4";
const cases = [
  {
    caseId: "IFV1-F4-C0288",
    order: 12,
    destination: "V111",
    consumer: "documentos_contrato",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0294",
    order: 12,
    destination: "V116",
    consumer: "obter_analise_competencia_v116",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0297",
    order: 12,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0311",
    order: 13,
    destination: "V107",
    consumer: "fontes_normativas",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0315",
    order: 13,
    destination: "V110",
    consumer: "documentos_contrato",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0320",
    order: 13,
    destination: "V116",
    consumer: "obter_analise_competencia_v116",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0321",
    order: 13,
    destination: "V117",
    consumer: "obter_detalhe_requisito_v117",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0324",
    order: 13,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
  {
    caseId: "IFV1-F4-C0410",
    order: 15,
    destination: "V114",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0413",
    order: 15,
    destination: "V116",
    consumer: "obter_analise_competencia_v116",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0415",
    order: 15,
    destination: "V117",
    consumer: "obter_detalhe_requisito_v117",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0416",
    order: 15,
    destination: "V118",
    consumer: "pareceres_internos",
    method: "GET",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0418",
    order: 15,
    destination: "V119",
    consumer: "obter_visao_geral_competencia",
    method: "POST",
    reader: true,
  },
  {
    caseId: "IFV1-F4-C0420",
    order: 15,
    destination: "V123",
    consumer: "eventos_auditoria",
    method: "GET",
    reader: false,
  },
];
type Case = (typeof cases)[number];
const observations: Record<string, unknown>[] = [];
let actor = "master",
  order = 12,
  writes = 0,
  versions: Record<string, unknown>[] = [],
  event: Record<string, unknown> | null = null;
const calls: Array<{ table: string; ops: Array<[string, unknown[]]> }> = [];
const ok = (data: unknown, count = 0) => ({ data: structuredClone(data), error: null, status: 200, count });
let replay:{payload:string,response:unknown}|null=null;
let transportFailure=false;
const BLOCKED="c1200000-0000-4000-8000-000000000016";
const OTHER_KEY="c1200000-0000-4000-8000-000000000017";
const deny = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
const pag = (limite: number, total = 0) => ({ offset: 0, limite, total });
const command = () =>
  order === 12
    ? "criar_documento_contrato_completo"
    : order === 13
      ? "adicionar_versao_documento_contrato"
      : "criar_documento_competencia_v115";
const number = () => (order === 13 ? 2 : 1);
const oldVersion = {
  id: OLD,
  id_documento_contrato: DOC,
  numero_versao: 1,
  id_arquivo: OLD_FILE,
  hash: OLD_HASH,
  metadados_extraidos: { pagina: 1, trecho: "Trecho anterior" },
  criado_em: DATE,
};
const newVersion = () => ({
  id: VERSION,
  id_documento_contrato: DOC,
  numero_versao: number(),
  id_arquivo: FILE,
  hash: HASH,
  metadados_extraidos: { pagina: 2, trecho: TEXT },
  criado_em: DATE,
});
const fileRow = (id: string) => ({
  id,
  nome_original: id === FILE ? "f4-new.pdf" : "f4-old.pdf",
  mime: "application/pdf",
  tamanho: 11,
  sha256: id === FILE ? HASH : OLD_HASH,
  status_seguranca: "aprovado",
  origem: "upload_usuario",
  criado_em: DATE,
});
function rpc(name: string, args: Record<string, unknown>) {
  if (name === "pode_consultar_auditoria_organizacao")
    return ok(actor === "master" && args["p_id_organizacao"] === ORG);
  if (name === command()) {
    if (actor !== "master") return deny();
    if(transportFailure)throw Error("synthetic transport interrupted before write");
    const payload=JSON.stringify(args);
    if(replay && args["p_chave_idempotencia"]===KEY)return replay.payload===payload?ok(replay.response):{data:null,error:{code:"PT409"},status:409};
    if(args["p_id_arquivo"]===BLOCKED)return {data:null,error:{code:"PT409"},status:409};
    if (args["p_id_arquivo"] !== FILE || args["p_chave_idempotencia"] !== KEY || writes !== 0)
      throw new Error("wrong document command");
    if (order === 12 && (args["p_id_contrato"] !== CONTRACT || args["p_titulo"] !== TITLE))
      throw new Error("wrong contract");
    if (
      order === 13 &&
      (args["p_id_documento"] !== DOC ||
        args["p_motivo"] !== "Atualização F4" ||
        versions.length !== 1)
    )
      throw new Error("wrong version");
    if (
      order === 15 &&
      (args["p_id_competencia"] !== COMP ||
        args["p_id_requisito"] !== REQ ||
        args["p_titulo"] !== TITLE)
    )
      throw new Error("wrong competence");
    versions.push(newVersion());
    writes++;
    event = {
      id: EVENT,
      criado_em: DATE,
      evento: name,
      entidade: order === 15 ? "documentos_competencia" : "documentos_contrato",
      origem: "rpc",
      id_usuario: null,
      id_entidade: DOC,
      correlation_id: KEY,
    };
    const receipt={id_documento:DOC,id_versao:VERSION,numero_versao:number(),id_arquivo:FILE};
    replay={payload,response:structuredClone(receipt)};
    return ok(receipt);
  }
  if (actor === "outsider" || args["p_id_competencia"] !== COMP) return deny();
  const latest = versions.at(-1),
    changed = writes > 0;
  const competence = {
    id: COMP,
    id_contrato: CONTRACT,
    id_organizacao: ORG,
    competencia_referencia: "2026-11-01",
    situacao: changed ? "pendente_correcao" : "pode_apresentar_contratante",
  };
  const counts = {
    pendentes: changed ? 1 : 0,
    nao_conformes: 0,
    inconclusivos: 0,
    em_analise: 0,
    nao_conformidades_bloqueantes: 0,
  };
  const execution = { id: EXEC, status: "concluido", hash_entrada: OLD_HASH };
  // Stale results retain historical evidence. A new eligible file must not silently replace the old result.
  const result = {
    id: RESULT,
    id_execucao: EXEC,
    resultado: "conforme",
    mecanismo: "deterministico",
    justificativa: "Resultado anterior",
    hash_evidencias: OLD_HASH,
  };
  const ev = {
    id: EVIDENCE,
    pagina: 1,
    trecho: "Trecho anterior",
    tipo_evidencia: "documento",
    hash: OLD_HASH,
    documento: {
      id_versao_documento: OLD,
      numero_versao: 1,
      hash_versao: OLD_HASH,
      id_arquivo: OLD_FILE,
      status_seguranca: "aprovado",
    },
  };
  const actions = {
    executar_analise: actor === "master",
    reanalisar: actor === "master" && changed,
    abrir_requisito: true,
  };
  if (name === "obter_visao_geral_competencia")
    return ok({
      competencia: {
        ...competence,
        periodo_inicio: null,
        periodo_fim: null,
        data_limite: null,
        atualizado_em: DATE,
        percentual_conformidade: changed ? 0 : 100,
        versao_pacote_atual: null,
        versao_registro: 2,
      },
      portao: {
        ...counts,
        liberado: !changed,
        total: 1,
        conformes_ou_na_validos: changed ? 0 : 1,
        percentual: changed ? 0 : 100,
      },
      blocking_summary: {
        ...counts,
        parecer_aprovado: !changed,
        analise_concluida_atual: !changed,
        aprovacao_apresentacao_atual: !changed,
      },
      allowed_actions: {
        abrir_documentos: true,
        analisar: actor === "master",
        abrir_parecer: true,
        apresentar: !changed && actor === "master",
      },
    });
  if (name === "obter_documentos_competencia_v115")
    return ok({
      schema_versao: "v115-v1",
      competencia: competence,
      estado_documental: latest ? "complete" : "missing_docs",
      resumo: {
        documentos_total: latest ? 1 : 0,
        requisitos_documentais_total: 1,
        requisitos_documentais_aplicaveis: 1,
        requisitos_documentais_pendentes: latest ? 0 : 1,
      },
      documentos: latest
        ? [
            {
              id: DOC,
              tipo: "contrato",
              titulo: TITLE,
              situacao: "ativo",
              versao_atual: number(),
              requisito: { id: REQ, codigo: "F4" },
              versao: {
                numero_versao: number(),
                hash: latest["hash"],
                id_arquivo: latest["id_arquivo"],
              },
              arquivo: fileRow(String(latest["id_arquivo"])),
            },
          ]
        : [],
      requisitos_documentais: [
        {
          id: REQ,
          codigo: "F4",
          obrigatorio: true,
          aplicavel: true,
          impeditivo: true,
          tipos_esperados: ["contrato"],
          atendido: !!latest,
        },
      ],
      documentos_paginacao: pag(25, latest ? 1 : 0),
      requisitos_paginacao: pag(25, 1),
      capacidades: {
        pode_enviar: actor === "master",
        pode_nova_versao: actor === "master",
        motivo_nova_versao_obrigatorio: true,
      },
    });
  if (name === "obter_analise_competencia_v116")
    return ok({
      schema_versao: "v116-v1",
      competencia: competence,
      estado_analise: changed ? "stale" : "complete",
      stale: changed,
      percentual: changed ? 0 : 100,
      blocking_summary: counts,
      allowed_actions: actions,
      execucao_atual: execution,
      mecanismos: { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 },
      resultados: [
        {
          ...result,
          id_resultado: RESULT,
          id_requisito: REQ,
          requisito: { codigo: "F4", criticidade: "alta" },
          evidencias: [ev],
        },
      ],
      resultados_paginacao: pag(25, 1),
      execucoes: [execution],
      execucoes_paginacao: pag(10, 1),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  if (name === "obter_detalhe_requisito_v117") {
    if (args["p_id_requisito"] !== REQ) return deny();
    return ok({
      schema_versao: "v117-v1",
      competencia: competence,
      requisito: { id: REQ, codigo: "F4", aplicavel: true },
      execucao_atual: execution,
      resultado_atual: changed ? null : result,
      resultado_referencia: result,
      na_validade: null,
      allowed_actions: actions,
      evidencias: [ev],
      evidencias_paginacao: pag(25, 1),
      historico: [
        { id_resultado: RESULT, id_execucao: EXEC, resultado: "conforme", hash_entrada: OLD_HASH },
      ],
      historico_paginacao: pag(25, 1),
      apontamentos: [],
      apontamentos_paginacao: pag(25),
    });
  }
  throw new Error("unexpected RPC " + name);
}
function response(call: (typeof calls)[number], single: boolean) {
  const has = (k: string, v: unknown) =>
    call.ops.some(([op, a]) => op === "eq" && a[0] === k && a[1] === v);
  if (actor === "outsider") return deny();
  const latest = versions.at(-1);
  if (call.table === "documentos_contrato") {
    if (!has("id_contrato", CONTRACT)) return deny();
    return ok(
      latest
        ? [
            {
              id: DOC,
              id_contrato: CONTRACT,
              tipo: "contrato",
              titulo: TITLE,
              versao_atual: latest["numero_versao"],
            },
          ]
        : [],
      latest ? 1 : 0,
    );
  }
  if (call.table === "versoes_documento") {
    const or = call.ops.find(([op]) => op === "or")?.[1][0];
    const rows = versions.filter(
      (v) =>
        typeof or === "string" &&
        or.includes("numero_versao.eq." + v["numero_versao"]) &&
        or.includes(DOC),
    );
    return ok(rows, rows.length);
  }
  if (call.table === "arquivos") {
    const ids = call.ops.find(([op]) => op === "in")?.[1][1] as string[] | undefined;
    if (!ids) throw new Error("missing file filter");
    return ok(ids.map(fileRow), ids.length);
  }
  if (["processamentos_documento", "sugestoes_extracao_documento"].includes(call.table))
    return ok([], 0);
  if (call.table === "fontes_normativas") {
    if (!has("id_organizacao", ORG) || !has("id_contrato", CONTRACT)) return deny();
    return ok(
      [
        {
          id: SOURCE_ID,
          id_organizacao: ORG,
          id_contrato: CONTRACT,
          tipo: "contrato",
          titulo: TITLE,
          situacao: "ativa",
        },
      ],
      1,
    );
  }
  if (call.table === "versoes_fontes_normativas") {
    const rows = versions.map((v) => ({
      id: v["id"],
      id_fonte: SOURCE_ID,
      versao: v["numero_versao"],
      id_arquivo: v["id_arquivo"],
      hash: v["hash"],
    }));
    if (single) {
      const id = call.ops.find(([op, a]) => op === "eq" && a[0] === "id")?.[1][1];
      const found = versions.find((v) => v["id"] === id);
      return ok(
        found
          ? {
              conteudo_texto: found["id"] === OLD ? "Trecho anterior" : TEXT,
              metadados: found["metadados_extraidos"],
            }
          : null,
      );
    }
    if (!has("id_fonte", SOURCE_ID)) return deny();
    return ok(rows.reverse(), rows.length);
  }
  if (call.table === "pareceres_internos") {
    if (
      !has("id_competencia", COMP) ||
      !has("id_organizacao", ORG) ||
      !has("id_contrato", CONTRACT)
    )
      return deny();
    return ok([], 0);
  }
  if (call.table === "eventos_auditoria") {
    if (actor !== "master" || !has("id_organizacao", ORG)) return deny();
    const rows = event && has("correlation_id", KEY) ? [event] : [];
    return ok(rows, rows.length);
  }
  throw new Error("unexpected table " + call.table);
}
async function readDocs() {
  const docs = await listarDocumentos(CONTRACT, DOC_FILTERS, 0);
  expect(docs.itens).toHaveLength(1);
  expect(docs.itens[0]).toMatchObject({ id: DOC, id_contrato: CONTRACT });
  const summary = await obterResumos(docs.itens);
  const actual = summary[DOC];
  expect(actual!.versao?.id).toBe(versions.at(-1)?.["id"]);
  expect(actual!.versao?.hash).toBe(versions.at(-1)?.["hash"]);
  expect(actual!.arquivo?.sha256).toBe(versions.at(-1)?.["hash"]);
  expect(actual!.arquivo?.status_seguranca).toBe("aprovado");
  return actual;
}
async function readCompetence() {
  const r = await obterDocumentosCompetencia(COMP, 0, 0, new AbortController().signal);
  const v = parseLeituraV115(r.data);
  expect(v?.competencia).toMatchObject({ id: COMP, id_contrato: CONTRACT, id_organizacao: ORG });
  expect(v?.documentos[0]).toMatchObject({
    id: DOC,
    requisito: { id: REQ },
    versao: { hash: HASH, id_arquivo: FILE },
    arquivo: { id: FILE, sha256: HASH, status_seguranca: "aprovado" },
  });
  return v;
}
async function mutate(variation:"normal"|"mismatch"|"blocked"="normal") {
  const file=variation==="blocked"?BLOCKED:FILE;
  const key=variation==="blocked"?OTHER_KEY:KEY;
  const title=variation==="mismatch"?TITLE+" alterado":TITLE;
  if (order === 12)
    return criarDocumentoCompleto(
      CONTRACT,
      {
        tipo: "contrato",
        titulo: title,
        categoria: "",
        vigenciaInicio: "",
        vigenciaFim: "",
        observacoes: "",
      },
      file,
      key,
    );
  if (order === 13) return adicionarVersao(DOC, file, variation==="mismatch"?"Motivo divergente":"Atualização F4", key);
  return criarDocumentoCompetencia({
    idCompetencia: COMP,
    tipo: "contrato",
    titulo: TITLE,
    categoria: "",
    idRequisito: REQ,
    idArquivo: file,
    chave: key,
  });
}
async function snapshot(){
  const sig=new AbortController().signal;
  const analysis=parseAnaliseV116((await obterAnaliseCompetencia(COMP,FILTROS_VAZIOS,OFFSETS_ZERO,sig)).data);
  const overview=parseVisaoGeral((await obterVisaoGeral(COMP,sig)).data);
  if(!analysis||!overview)throw Error("missing material state");
  expect(analysis.execucao_atual).toMatchObject({id:EXEC,hash_entrada:OLD_HASH});
  const docs=order===15?parseLeituraV115((await obterDocumentosCompetencia(COMP,0,0,sig)).data):await listarDocumentos(CONTRACT,DOC_FILTERS,0);
  if(!docs)throw Error("missing documents");
  const summary=order===15?null:await obterResumos((docs as Awaited<ReturnType<typeof listarDocumentos>>).itens);
  return {docs,summary,stale:analysis.stale,oldHash:analysis.execucao_atual?.hash_entrada,gate:overview.portao.liberado};
}
function prepare(c:Case){actor="master";order=c.order;versions=order===13?[structuredClone(oldVersion)]:[];}
async function produce(c:Case){
  prepare(c);
  const before=await snapshot();
  expect(before.stale).toBe(false);expect(before.gate).toBe(true);
  if(order===13)expect((await readDocs())!.versao?.id).toBe(OLD);
  const r=await mutate();
  expect(r).toEqual({id_documento:DOC,id_versao:VERSION,numero_versao:number(),id_arquivo:FILE});
  expect(m.rpc).toHaveBeenLastCalledWith(command(),expect.objectContaining({p_id_arquivo:FILE,p_chave_idempotencia:KEY}));
  const after=await snapshot();
  expect(after.stale).toBe(true);expect(after.gate).toBe(false);expect(after.oldHash).toBe(before.oldHash);expect(after).not.toEqual(before);
  if(order===15)await readCompetence();else await readDocs();
  expect(await mutate()).toEqual(r);expect(await snapshot()).toEqual(after);
  expect(writes).toBe(1);
  if(order===13){expect(versions).toHaveLength(2);expect(versions[0]).toEqual(oldVersion);}
  return {before,after,r};
}
async function consume(c: Case, negative: boolean) {
  const signal = new AbortController().signal;
  if (c.destination === "V123") {
    expect(await podeConsultarAuditoria(ORG)).toBe(!negative);
    const p = obterEventosAuditoria({ idOrganizacao: ORG, pagina: 0, correlationId: KEY });
    if (negative) {
      await expect(p).rejects.toThrow("Acesso não autorizado");
      return null;
    }
    const v = await p;
    expect(v.total).toBe(1);
    expect(v.eventos[0]).toMatchObject({
      id: EVENT,
      id_entidade: DOC,
      correlation_id: KEY,
      evento: command(),
    });
    return {
      eventId: v.eventos[0]!.id,
      entity: v.eventos[0]!.id_entidade,
      correlation: v.eventos[0]!.correlation_id,
    };
  }
  if (["V110", "V111"].includes(c.destination)) {
    if (negative) {
      await expect(listarDocumentos(CONTRACT, DOC_FILTERS, 0)).rejects.toMatchObject({
        tipo: "negado",
      });
      return null;
    }
    const v = await readDocs();
    expect(v!.versao).toMatchObject({
      id: VERSION,
      numero_versao: number(),
      hash: HASH,
      id_arquivo: FILE,
    });
    return {
      version: v!.versao?.id,
      file: v!.arquivo?.id,
      hash: v!.arquivo?.sha256,
      number: v!.versao?.numero_versao,
    };
  }
  if (c.destination === "V107") {
    const p = listarFontes(
      { org: ORG, contrato: CONTRACT, escopo: "contrato", situacao: "", pagina: 0 },
      signal,
    );
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "negado" });
      return null;
    }
    const sources = await p;
    expect(sources.itens[0]).toMatchObject({
      id: SOURCE_ID,
      id_contrato: CONTRACT,
      id_organizacao: ORG,
    });
    const v = await listarVersoes(sources.itens[0]!.id, 0, signal);
    expect(v.itens).toMatchObject([
      { id: VERSION, hash: HASH, id_arquivo: FILE },
      { id: OLD, hash: OLD_HASH, id_arquivo: OLD_FILE },
    ]);
    const text = await obterTextoVersao(v.itens[0]!.id, signal);
    expect(text.texto).toBe(TEXT);
    expect(JSON.parse(text.metadados!)).toEqual({ pagina: 2, trecho: TEXT });
    const previous = await obterTextoVersao(v.itens[1]!.id, signal);
    expect(previous.texto).toBe("Trecho anterior");
    return {
      version: v.itens[0]!.id,
      old: v.itens[1]!.id,
      hash: v.itens[0]!.hash,
      text: text.texto,
      page: 2,
    };
  }
  if (c.destination === "V116") {
    const r = await obterAnaliseCompetencia(COMP, FILTROS_VAZIOS, OFFSETS_ZERO, signal);
    if (negative) {
      expect(classificarErroV116(r.error, r.status)).toBe("sem_permissao");
      expect(parseAnaliseV116(r.data)).toBeNull();
      return null;
    }
    const v = parseAnaliseV116(r.data);
    expect(v?.competencia.id).toBe(COMP);
    expect(v?.stale).toBe(true);
    expect(v?.estado_analise).toBe("stale");
    expect(v?.execucao_atual).toMatchObject({ id: EXEC, hash_entrada: OLD_HASH });
    expect(v?.allowed_actions.reanalisar).toBe(actor === "master");
    return { scope: v?.competencia.id, stale: v?.stale, oldHash: v?.execucao_atual?.hash_entrada };
  }
  if (c.destination === "V117") {
    const r = await obterDetalheRequisito(COMP, REQ, OFFSETS_DETALHE_ZERO, signal);
    if (negative) {
      expect(classificarErroV117(r.error, r.status)).toBe("sem_permissao");
      expect(parseDetalheV117(r.data, COMP, REQ, OFFSETS_DETALHE_ZERO)).toBeNull();
      return null;
    }
    const v = parseDetalheV117(r.data, COMP, REQ, OFFSETS_DETALHE_ZERO);
    expect(v?.requisito.id).toBe(REQ);
    expect(v?.resultado_atual).toBeNull();
    expect(v?.evidencias[0]).toMatchObject({
      pagina: 1,
      trecho: "Trecho anterior",
      documento: { id_versao_documento: OLD, hash_versao: OLD_HASH },
    });
    return {
      scope: v?.competencia.id,
      oldVersion: v?.evidencias[0]!.documento?.id_versao_documento,
      oldHash: v?.evidencias[0]!.documento?.hash_versao,
      current: v?.resultado_atual,
    };
  }
  if (c.destination === "V118") {
    const p = listarPareceres(COMP, ORG, CONTRACT, 0, signal);
    if (negative) {
      await expect(p).rejects.toMatchObject({ tipo: "sem_permissao" });
      return null;
    }
    const v = await p;
    expect(v.itens).toEqual([]);
    return { scope: COMP, opinions: v.total };
  }
  const r = await obterVisaoGeral(COMP, signal);
  if (negative) {
    expect(classificarErroVisaoGeral(r.error, r.status)).toBe("sem_permissao");
    expect(parseVisaoGeral(r.data)).toBeNull();
    return null;
  }
  const v = parseVisaoGeral(r.data);
  expect(v?.competencia).toMatchObject({ id: COMP, id_contrato: CONTRACT, id_organizacao: ORG });
  expect(v?.portao.liberado).toBe(false);
  expect(v?.blocking_summary.analise_concluida_atual).toBe(false);
  expect(v?.allowed_actions.apresentar).toBe(false);
  if (!v) throw new Error("invalid overview");
  if (c.destination === "V119") expect(derivarEstadoVisual(v)).not.toBe("ready");
  return {
    scope: v.competencia.id,
    gate: v.portao.liberado,
    current: v.blocking_summary.analise_concluida_atual,
    canPresent: v.allowed_actions.apresentar,
  };
}
describe("V110/V111/V115 document writes and consumers", () => {
  beforeEach(() => {
    actor = "master";
    order = 12;
    writes = 0;
    versions = [];
    event = null;
    replay=null;
    transportFailure=false;
    calls.length = 0;
    m.rpc.mockReset();
    m.from.mockReset();
    m.rpc.mockImplementation((n: string, a: Record<string, unknown>) => {
      const p = Promise.resolve().then(() => rpc(n, a));
      return Object.assign(p, { abortSignal: () => p });
    });
    m.from.mockImplementation((table: string) => {
      const call = { table, ops: [] as Array<[string, unknown[]]> };
      calls.push(call);
      const b: Record<string, unknown> = {};
      for (const n of ["select", "eq", "order", "range", "abortSignal", "in", "or"])
        b[n] = (...args: unknown[]) => {
          call.ops.push([n, args]);
          return b;
        };
      b["maybeSingle"] = () => Promise.resolve().then(() => response(call, true));
      b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
        Promise.resolve()
          .then(() => response(call, false))
          .then(res, rej);
      return b;
    });
  });
  for(const c of cases){
    it(c.caseId+" positive: material version, independent readback, exact replay and historical evidence",async()=>{
      const progress=await produce(c);const witnesses=[];
      for(const role of c.reader?["master","leitor"]:["master"]){
        actor=role;const witness=await consume(c,false);expect(witness).not.toBeNull();witnesses.push({role,witness});
      }
      actor="master";expect(await snapshot()).toEqual(progress.after);expect(writes).toBe(1);
      observations.push({caseId:c.caseId,kind:"positive",mode:"CODE_FIXTURE",readback:{progress,witnesses,writes}});
    });
    it(c.caseId+" negative: blocked file, transport and changed replay do not change published material",async()=>{
      prepare(c);const initial=await snapshot();
      transportFailure=true;await expect(mutate()).rejects.toMatchObject({tipo:"erro"});transportFailure=false;
      await expect(mutate("blocked")).rejects.toMatchObject({tipo:"conflito"});
      expect(await snapshot()).toEqual(initial);expect(writes).toBe(0);
      const progress=await produce(c);
      await expect(mutate("mismatch")).rejects.toMatchObject({tipo:"conflito"});
      actor="leitor";await expect(mutate()).rejects.toMatchObject({tipo:order===15?"sem_permissao":"negado"});
      actor=c.reader?"outsider":"leitor";expect(await consume(c,true)).toBeNull();
      actor="master";const after=await snapshot();expect(after).toEqual(progress.after);
      expect(await consume(c,false)).not.toBeNull();expect(writes).toBe(1);
      if(order===13)expect(versions[0]).toEqual(oldVersion);
      observations.push({caseId:c.caseId,kind:"negative",mode:"CODE_FIXTURE",readback:{initial,after,progress,writes,blockedRejected:true,transportRejected:true,replayMismatchRejected:true}});
    });
  }
  afterAll(()=>{const path=process.env["F4_CODE_DOCUMENT_OBSERVATIONS"];if(path){expect(observations).toHaveLength(cases.length*2);writeFileSync(path,JSON.stringify(observations,null,2)+"\n",{flag:"wx"});}});
});

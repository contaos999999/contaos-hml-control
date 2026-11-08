/** Dedicated fixture preparer. Never imported by the read-only audit CLI. */
import { createHash, randomUUID } from "node:crypto";
import { writeFileSync, renameSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { readFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import {
  requestAllowed,
  singleRequestEventAllowed,
  verifySingleRequest,
  HML_ORIGIN,
  API_ORIGIN,
  nativeProofValid,
  harnessIdentity,
  checkFreshDeployment,
  startDestinationProxy,
  browserEnvironment,
  installNativeFence,
  verifyPublishedResponse,
  settleVerifiedPage,
  navigateVerifiedPage,
  waitOrganization,
  openVerifiedOrganizationSelector,
} from "./authenticated-visual-audit.mjs";

export const FIXTURE = Object.freeze({
  origin: HML_ORIGIN,
  api: API_ORIGIN,
  organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
  contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
  contractor: "041ebf9f-5e32-4744-80d6-d745fa5fc483",
  historical: "59072760-4420-4598-82dd-367f41a79e89",
  source: "8b942e46-a29b-40d9-8ad4-04aaf9124a34",
  file: "8cc6ac08-7f5b-469c-ab50-7b33d5a12379",
  contractualDocument: "525e54fc-feec-4dc0-b540-1510a3c52485",
  fileHash: "773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103",
  listName: "Lista sintética Trilha A 24 fixtures 20261108",
  listDescription: "Ensaio visual HML. Sem efeito jurídico ou financeiro.",
  reason: "Preparação sintética da auditoria Trilha A.",
  foundation: "Ensaio sintético HML da Trilha A. Sem efeito jurídico ou financeiro.",
  reviewJustification:
    "O requisito sintético exige a presença do TXT aprovado, vinculado a esta competência. Arquivo e versão conferidos pelo SHA256 previsto.",
  reviewFoundation:
    "Ensaio sintético HML da Trilha A. A conferência limita-se à presença documental; sem efeito jurídico ou financeiro.",
  excerpt: "CONTAOS HML - FONTE SINTETICA DE AUDITORIA",
});
export const SOURCE_FIELDS = Object.freeze({
  tipo: "lista_verificacao",
  titulo: "FONTE SINTETICA TRILHA A 20261108",
  referencia:
    "Documento HML 525e54fc-feec-4dc0-b540-1510a3c52485; SHA256 773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103",
  descricao:
    "Fonte exclusivamente sintética para auditoria em homologação. Sem efeito jurídico ou financeiro. Vinculação descritiva ao TXT de teste já persistido; não representa análise ou validação de segurança do arquivo.",
});
const sourceFieldsExact = (value) =>
  obj(value) && Object.entries(SOURCE_FIELDS).every(([key, expected]) => value[key] === expected);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HASH = /^[0-9a-f]{64}$/;
const months = ["2026-10-01", "2026-09-01"];
const err = (code) => {
  throw new Error(code);
};
const uuid = (v) => typeof v === "string" && UUID.test(v);
const obj = (v) =>
  v !== null &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.getPrototypeOf(v) === Object.prototype;
const keys = (v, k) => obj(v) && Object.keys(v).sort().join("|") === k.slice().sort().join("|");
const same = (a, b) => canonical(a) === canonical(b);
function canonical(v) {
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  if (obj(v))
    return (
      "{" +
      Object.keys(v)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + canonical(v[k]))
        .join(",") +
      "}"
    );
  return JSON.stringify(v);
}
const hash = (v) =>
  createHash("sha256")
    .update(typeof v === "string" ? v : canonical(v))
    .digest("hex");
function freeze(v) {
  if (v && typeof v === "object") {
    Object.values(v).forEach(freeze);
    Object.freeze(v);
  }
  return v;
}
function official(v) {
  return (
    obj(v) &&
    v.official === true &&
    v.current === true &&
    v.organization === FIXTURE.organization &&
    v.contract === FIXTURE.contract
  );
}
function competent(id, e) {
  return (
    uuid(id) &&
    id !== FIXTURE.historical &&
    (e.competencies || []).some((v) => official(v) && v.id === id && months.includes(v.month))
  );
}
function entity(id, kind, e) {
  return uuid(id) && (e[kind] || []).some((v) => official(v) && v.id === id);
}
function keyed(p, k) {
  return uuid(p[k]);
}
const listKeys = [
  "p_id_organizacao",
  "p_id_contrato",
  "p_id_lista",
  "p_versao_esperada",
  "p_acao",
  "p_payload",
  "p_motivo",
  "p_request_id",
];
export const BUSINESS_RPCS = Object.freeze([
  "registrar_versao_fonte_v107",
  "aprovar_versao_fonte_v107",
  "salvar_fonte_normativa_v107",
  "executar_comando_lista_v1",
  "criar_competencia",
  "criar_documento_competencia_v115",
  "solicitar_analise_competencia",
  "registrar_revisao_requisito_v117",
  "solicitar_parecer_interno",
  "aprovar_parecer_interno",
  "aprovar_apresentacao",
  "registrar_apresentacao",
]);
/** Evidence is reconciled by official reads under the verified session immediately before arming. */
export function validateBusinessPayload(rpc, p, e = {}) {
  try {
    if (!obj(p) || !BUSINESS_RPCS.includes(rpc)) return false;
    if (rpc === "criar_competencia")
      return (
        keys(p, ["p_id_contrato", "p_competencia_referencia"]) &&
        p.p_id_contrato === FIXTURE.contract &&
        months.includes(p.p_competencia_referencia)
      );
    if (rpc === "registrar_versao_fonte_v107")
      return (
        keys(p, [
          "p_id_organizacao",
          "p_id_fonte",
          "p_inicio_vigencia",
          "p_fim_vigencia",
          "p_id_arquivo",
          "p_conteudo_texto",
          "p_metadados",
          "p_chave_idempotencia",
        ]) &&
        p.p_id_organizacao === FIXTURE.organization &&
        p.p_id_fonte === FIXTURE.source &&
        p.p_inicio_vigencia === "2026-01-01" &&
        p.p_fim_vigencia === null &&
        p.p_id_arquivo === null &&
        typeof p.p_conteudo_texto === "string" &&
        hash(p.p_conteudo_texto) === FIXTURE.fileHash &&
        keys(p.p_metadados, []) &&
        keyed(p, "p_chave_idempotencia")
      );
    if (rpc === "aprovar_versao_fonte_v107")
      return (
        keys(p, [
          "p_id_organizacao",
          "p_id_versao",
          "p_hash_esperado",
          "p_fundamento",
          "p_chave_idempotencia",
        ]) &&
        p.p_id_organizacao === FIXTURE.organization &&
        entity(p.p_id_versao, "sourceVersions", e) &&
        e.sourceVersions.some(
          (v) =>
            v.id === p.p_id_versao &&
            v.source === FIXTURE.source &&
            v.hash === p.p_hash_esperado &&
            HASH.test(v.hash) &&
            v.canApprove === true &&
            v.state !== "aprovada",
        ) &&
        p.p_fundamento === FIXTURE.foundation &&
        keyed(p, "p_chave_idempotencia")
      );
    if (rpc === "salvar_fonte_normativa_v107") {
      const s = e.source;
      return (
        keys(p, [
          "p_id_organizacao",
          "p_id_contrato",
          "p_id_fonte",
          "p_tipo",
          "p_titulo",
          "p_referencia",
          "p_descricao",
          "p_situacao",
          "p_versao_esperada",
          "p_chave_idempotencia",
        ]) &&
        official(s) &&
        sourceFieldsExact(s) &&
        s.id === FIXTURE.source &&
        p.p_id_organizacao === FIXTURE.organization &&
        p.p_id_contrato === FIXTURE.contract &&
        p.p_id_fonte === FIXTURE.source &&
        ["tipo", "titulo", "referencia", "descricao"].every((k) => p["p_" + k] === s[k]) &&
        p.p_situacao === "ativa" &&
        Number.isInteger(s.version) &&
        s.version > 0 &&
        p.p_versao_esperada === s.version &&
        keyed(p, "p_chave_idempotencia")
      );
    }
    if (rpc === "executar_comando_lista_v1") {
      if (
        !keys(p, listKeys) ||
        p.p_id_organizacao !== FIXTURE.organization ||
        p.p_id_contrato !== FIXTURE.contract ||
        p.p_motivo !== FIXTURE.reason ||
        !keyed(p, "p_request_id")
      )
        return false;
      const q = p.p_payload;
      if (p.p_acao === "criar_lista")
        return (
          p.p_id_lista === null &&
          p.p_versao_esperada === null &&
          same(q, {
            nome: FIXTURE.listName,
            descricao: FIXTURE.listDescription,
            vigencia_inicio: "2026-01-01",
            vigencia_fim: null,
          })
        );
      const l = e.list;
      if (
        !official(l) ||
        l.id !== p.p_id_lista ||
        l.name !== FIXTURE.listName ||
        !Number.isInteger(l.version) ||
        l.version < 1 ||
        p.p_versao_esperada !== l.version
      )
        return false;
      if (p.p_acao === "alterar_situacao")
        return l.published === true && same(q, { situacao: "ativa" });
      if (p.p_acao === "publicar_versao")
        return (
          keys(q, ["id_versao"]) &&
          q.id_versao === l.versionId &&
          uuid(q.id_versao) &&
          l.sourceReady === true &&
          l.ruleVerified === true
        );
      if (p.p_acao === "salvar_item")
        return (
          same(q, {
            id_versao: l.versionId,
            id_item: null,
            codigo: "AUD-A-TXT-001",
            descricao: "Presença do documento TXT sintético de auditoria.",
            categoria: "documental",
            obrigatorio: true,
            aplicavel: true,
            impeditivo: true,
            criticidade: "alta",
            ordem: 1,
            id_fonte_versao: l.sourceVersion,
            regra_validacao: {
              documento: { obrigatorio: true, tipos: ["outro"] },
              condicao: { tipo: "sempre" },
            },
          }) &&
          uuid(l.versionId) &&
          entity(l.sourceVersion, "sourceVersions", e) &&
          e.sourceVersions.some(
            (v) =>
              v.id === l.sourceVersion &&
              v.source === FIXTURE.source &&
              v.state === "aprovada" &&
              v.active === true &&
              v.effective === true,
          )
        );
      return false;
    }
    if (rpc === "criar_documento_competencia_v115")
      return (
        keys(p, [
          "p_id_competencia",
          "p_tipo",
          "p_titulo",
          "p_categoria",
          "p_id_requisito",
          "p_id_arquivo",
          "p_chave_idempotencia",
        ]) &&
        competent(p.p_id_competencia, e) &&
        p.p_tipo === "outro" &&
        p.p_titulo === "Documento TXT sintético Trilha A." &&
        p.p_categoria === "documental" &&
        p.p_id_arquivo === FIXTURE.file &&
        keyed(p, "p_chave_idempotencia") &&
        (e.requirements || []).some(
          (v) =>
            official(v) &&
            v.id === p.p_id_requisito &&
            uuid(v.id) &&
            v.competency === p.p_id_competencia &&
            v.code === "AUD-A-TXT-001",
        ) &&
        approvedFile(e.file)
      );
    if (rpc === "solicitar_analise_competencia")
      return (
        keys(p, ["p_id_competencia", "p_tipo"]) &&
        competent(p.p_id_competencia, e) &&
        p.p_tipo === "completa"
      );
    if (rpc === "solicitar_parecer_interno")
      return (
        keys(p, ["p_id_competencia"]) &&
        competent(p.p_id_competencia, e) &&
        e.analysisCurrent === true &&
        e.analysisComplete === true &&
        e.opinionGate === true
      );
    if (rpc === "aprovar_parecer_interno")
      return (
        keys(p, ["p_id_parecer", "p_aprovar", "p_fundamento"]) &&
        entity(p.p_id_parecer, "opinions", e) &&
        e.opinions.some((v) => v.id === p.p_id_parecer && competent(v.competency, e)) &&
        p.p_aprovar === true &&
        p.p_fundamento === FIXTURE.foundation
      );
    if (rpc === "aprovar_apresentacao")
      return (
        keys(p, ["p_id_competencia", "p_fundamento"]) &&
        competent(p.p_id_competencia, e) &&
        p.p_fundamento === FIXTURE.foundation &&
        e.analysisCurrent === true &&
        e.analysisComplete === true &&
        e.opinionApproved === true &&
        e.compliance === 100
      );
    if (rpc === "registrar_apresentacao")
      return (
        keys(p, ["p_id_competencia", "p_idempotency_key", "p_protocolo", "p_forma_apresentacao"]) &&
        competent(p.p_id_competencia, e) &&
        e.competencies.some((v) => v.id === p.p_id_competencia && v.month === "2026-09-01") &&
        e.presentationApproved === true &&
        e.allowedRegister === true &&
        p.p_protocolo === "HML-TRILHA-A-20261108" &&
        p.p_forma_apresentacao === "Ensaio sintético em homologação." &&
        keyed(p, "p_idempotency_key")
      );
    if (rpc === "registrar_revisao_requisito_v117") {
      const c = e.review;
      return (
        keys(p, [
          "p_id_competencia",
          "p_id_requisito",
          "p_id_execucao_esperada",
          "p_id_resultado_esperado",
          "p_hash_esperado",
          "p_resultado",
          "p_justificativa",
          "p_fundamento",
          "p_evidencias",
          "p_request_id",
        ]) &&
        official(c) &&
        c.canReview === true &&
        c.materialPresenceVerified === true &&
        c.extractedExcerpt === FIXTURE.excerpt &&
        c.fileHash === FIXTURE.fileHash &&
        competent(p.p_id_competencia, e) &&
        p.p_id_competencia === c.competency &&
        p.p_id_requisito === c.requirement &&
        c.code === "AUD-A-TXT-001" &&
        uuid(c.requirement) &&
        uuid(c.execution) &&
        uuid(c.result) &&
        uuid(c.documentVersion) &&
        p.p_id_execucao_esperada === c.execution &&
        p.p_id_resultado_esperado === c.result &&
        p.p_hash_esperado === c.hash &&
        HASH.test(c.hash) &&
        p.p_resultado === "conforme" &&
        p.p_justificativa === FIXTURE.reviewJustification &&
        p.p_fundamento === FIXTURE.reviewFoundation &&
        same(p.p_evidencias, [
          { id_versao_documento: c.documentVersion, pagina: 1, trecho: FIXTURE.excerpt },
        ]) &&
        keyed(p, "p_request_id")
      );
    }
    return false;
  } catch {
    return false;
  }
}
export function approvedFile(f) {
  return (
    official(f) &&
    f.id === FIXTURE.file &&
    f.document === FIXTURE.contractualDocument &&
    f.status === "aprovado" &&
    f.mime === "text/plain" &&
    f.bytes === 285 &&
    f.sha256 === FIXTURE.fileHash
  );
}
const uiKeyByRpc = {
  registrar_versao_fonte_v107: "p_chave_idempotencia",
  aprovar_versao_fonte_v107: "p_chave_idempotencia",
  salvar_fonte_normativa_v107: "p_chave_idempotencia",
  executar_comando_lista_v1: "p_request_id",
  registrar_revisao_requisito_v117: "p_request_id",
  registrar_apresentacao: "p_idempotency_key",
};
/** Strict parser rejects duplicate JSON keys, including escaped duplicates, at any depth. */
export function parseBusinessJson(text) {
  if (typeof text !== "string" || Buffer.byteLength(text) > 65536) err("BODY_LIMIT");
  let i = 0;
  const ws = () => {
    while (/\s/.test(text[i] || "") && i < text.length) i++;
  };
  function str() {
    const start = i++;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i++] === '"') return JSON.parse(text.slice(start, i));
    }
    err("BODY_JSON");
  }
  function value(depth = 0) {
    if (depth > 30) err("BODY_JSON");
    ws();
    if (text[i] === '"') return str();
    if (text[i] === "{") {
      i++;
      const out = {},
        seen = new Set();
      ws();
      if (text[i] === "}") {
        i++;
        return out;
      }
      for (;;) {
        ws();
        if (text[i] !== '"') err("BODY_JSON");
        const k = str();
        if (seen.has(k) || ["__proto__", "constructor", "prototype"].includes(k)) err("BODY_JSON");
        seen.add(k);
        ws();
        if (text[i++] !== ":") err("BODY_JSON");
        out[k] = value(depth + 1);
        ws();
        const c = text[i++];
        if (c === "}") return out;
        if (c !== ",") err("BODY_JSON");
      }
    }
    if (text[i] === "[") {
      i++;
      const out = [];
      ws();
      if (text[i] === "]") {
        i++;
        return out;
      }
      for (;;) {
        out.push(value(depth + 1));
        ws();
        const c = text[i++];
        if (c === "]") return out;
        if (c !== ",") err("BODY_JSON");
      }
    }
    const m = /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
      text.slice(i),
    );
    if (!m) err("BODY_JSON");
    i += m[0].length;
    const v = JSON.parse(m[0]);
    if (typeof v === "number" && !Number.isFinite(v)) err("BODY_JSON");
    return v;
  }
  const out = value();
  ws();
  if (i !== text.length || !obj(out)) err("BODY_JSON");
  return out;
}
export function safeReceipt(input) {
  const allowed = [
    "schema",
    "requestId",
    "rpc",
    "state",
    "organization",
    "contract",
    "payloadSha256",
    "ids",
    "frontendSha",
    "harnessSha",
    "deploymentId",
    "workflowRun",
  ];
  if (!obj(input) || Object.keys(input).some((k) => !allowed.includes(k))) err("RECEIPT_SCHEMA");
  const v = structuredClone(input);
  if ("schema" in v && v.schema !== "contaos.fixture.intent.v1") err("RECEIPT_SCHEMA");
  if ("requestId" in v && !uuid(v.requestId)) err("RECEIPT_UUID");
  if ("rpc" in v && !BUSINESS_RPCS.includes(v.rpc)) err("RECEIPT_RPC");
  if (
    "state" in v &&
    !["armed", "sealed", "confirmed", "uncertain", "denied", "stale", "partial"].includes(v.state)
  )
    err("RECEIPT_STATE");
  if (
    ("organization" in v && v.organization !== FIXTURE.organization) ||
    ("contract" in v && v.contract !== FIXTURE.contract)
  )
    err("RECEIPT_CONTEXT");
  for (const k of ["payloadSha256"]) if (k in v && !HASH.test(v[k])) err("RECEIPT_HASH");
  for (const k of ["frontendSha", "harnessSha"])
    if (k in v && !/^[0-9a-f]{40}$/.test(v[k])) err("RECEIPT_IDENTITY");
  if ("deploymentId" in v && !/^dpl_[A-Za-z0-9]+$/.test(v.deploymentId)) err("RECEIPT_IDENTITY");
  if ("workflowRun" in v && !/^\d+$/.test(v.workflowRun)) err("RECEIPT_IDENTITY");
  if ("ids" in v && (!Array.isArray(v.ids) || v.ids.length > 32 || !v.ids.every(uuid)))
    err("RECEIPT_UUID");
  return freeze(v);
}
export function createReceiptWriter(path, identity) {
  const receipts = [];
  safeReceipt(identity);
  if (!keys(identity, ["frontendSha", "harnessSha", "deploymentId", "workflowRun"]))
    err("RECEIPT_IDENTITY");
  return (receipt) => {
    const clean = safeReceipt({ ...identity, ...receipt });
    const next = [...receipts, clean];
    const bytes =
      JSON.stringify({ schema: "contaos.fixture.receipts.v1", receipts: next }, null, 2) + "\n";
    writeFileSync(path + ".pending", bytes, { mode: 0o600 });
    renameSync(path + ".pending", path);
    writeFileSync(join(dirname(path), "SHA256SUMS"), hash(bytes) + "  " + basename(path) + "\n", {
      mode: 0o600,
    });
    receipts.push(clean);
    return true;
  };
}
export function createIntentBroker({
  readPolicy = requestAllowed,
  persist,
  now = () => performance.now(),
  competenceGateAmended = false,
} = {}) {
  let active = null,
    count = 0,
    frozen = false;
  const accepted = new Map(),
    usedIds = new Set();
  function persistSafe(receipt) {
    try {
      const result = persist(receipt);
      if (result && typeof result.catch === "function") void result.catch(() => {});
      return result === true;
    } catch {
      return false;
    }
  }
  function policy(request = {}) {
    try {
      const ticket =
        typeof request.sessionId === "string" && typeof request.interceptionId === "string"
          ? JSON.stringify([request.sessionId, request.interceptionId])
          : null;
      const exact = active && request.url === FIXTURE.api + "/rest/v1/rpc/" + active.rpc;
      const business =
        typeof request.url === "string" &&
        BUSINESS_RPCS.some((r) => request.url.includes("/rpc/" + r));
      if (request.stage === "RESPONSE") {
        if (!business) return readPolicy(request) === true;
        const admitted = ticket && accepted.get(ticket);
        if (!admitted || request.method !== admitted.method || request.url !== admitted.url)
          return false;
        if (
          admitted.method === "POST" &&
          hash(parseBusinessJson(request.postData)) !== admitted.hash
        )
          return false;
        accepted.delete(ticket);
        return true;
      }
      if (request.stage !== "REQUEST") return false;
      if (!business) return readPolicy(request) === true;
      if (!ticket || !exact || frozen || !active || now() - active.time >= 15000 || active.sent)
        return false;
      if (request.method === "OPTIONS") {
        if (accepted.has(ticket)) return false;
        accepted.set(ticket, { url: request.url, method: "OPTIONS" });
        return true;
      }
      if (request.method !== "POST") return false;
      const body = parseBusinessJson(request.postData);
      let expected = active.payload;
      if (active.uiGeneratedKey) {
        if (!uuid(body[active.uiGeneratedKey])) return false;
        expected = { ...expected, [active.uiGeneratedKey]: body[active.uiGeneratedKey] };
      }
      if (!same(body, expected) || !validateBusinessPayload(active.rpc, body, active.evidence))
        return false;
      const requestId = active.uiGeneratedKey ? body[active.uiGeneratedKey] : active.requestId;
      if (usedIds.has(requestId)) return false;
      const receipt = safeReceipt({
        schema: "contaos.fixture.intent.v1",
        rpc: active.rpc,
        requestId,
        state: "sealed",
        organization: FIXTURE.organization,
        contract: FIXTURE.contract,
        payloadSha256: hash(body),
      });
      if (persistSafe(receipt) !== true) {
        frozen = true;
        return false;
      }
      if (now() - active.time >= 15000) {
        frozen = true;
        return false;
      }
      usedIds.add(requestId);
      active.sent = true;
      active.sealed = freeze(structuredClone(body));
      active.requestId = requestId;
      accepted.set(ticket, { url: request.url, method: "POST", hash: hash(body) });
      return true;
    } catch {
      frozen = true;
      return false;
    }
  }
  return Object.freeze({
    policy,
    arm({ rpc, payload, requestId, uiGeneratedKey, verified, evidence = {} } = {}) {
      if (frozen) err("INTENT_FROZEN");
      if (active) err("INTENT_PENDING");
      if (count >= 24) err("INTENT_BUDGET");
      if (typeof persist !== "function") err("INTENT_PERSIST_REQUIRED");
      if (
        !verified ||
        verified.context !== true ||
        verified.capability !== true ||
        verified.reconciled !== true
      )
        err("PRECONDITION");
      if (rpc === "criar_competencia" && !competenceGateAmended) err("GATE_AMENDMENT");
      if (uiGeneratedKey && (uiKeyByRpc[rpc] !== uiGeneratedKey || uiGeneratedKey in payload))
        err("INTENT_KEY");
      const candidate = uiGeneratedKey
        ? { ...payload, [uiGeneratedKey]: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }
        : payload;
      if (
        !validateBusinessPayload(rpc, candidate, evidence) ||
        (!uiGeneratedKey && (!uuid(requestId) || usedIds.has(requestId)))
      )
        err("INTENT_PAYLOAD");
      const bodyKey =
        uiKeyByRpc[rpc] ||
        (rpc === "criar_documento_competencia_v115" ? "p_chave_idempotencia" : null);
      if (!uiGeneratedKey && bodyKey && payload[bodyKey] !== requestId) err("INTENT_KEY");
      active = {
        rpc,
        payload: freeze(structuredClone(payload)),
        requestId,
        uiGeneratedKey,
        evidence: freeze(structuredClone(evidence)),
        time: now(),
        sent: false,
      };
      count++;
      return Object.freeze({ rpc, ordinal: count });
    },
    resolve(state) {
      if (!active?.sent) err("INTENT_NOT_SENT");
      if (!["confirmed", "uncertain", "denied", "stale"].includes(state)) err("INTENT_RESULT");
      if (
        persistSafe(
          safeReceipt({
            schema: "contaos.fixture.intent.v1",
            rpc: active.rpc,
            requestId: active.requestId,
            state,
            organization: FIXTURE.organization,
            contract: FIXTURE.contract,
            payloadSha256: hash(active.sealed),
          }),
        ) !== true
      ) {
        frozen = true;
        err("INTENT_PERSIST");
      }
      if (state === "confirmed") active = null;
      else frozen = true;
    },
    snapshot() {
      return Object.freeze({
        count,
        frozen,
        pending: !!active,
        sent: !!active?.sent,
        requestId: active?.requestId || null,
      });
    },
  });
}
export async function waitOfficialPhase({
  read,
  ready,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  now = () => performance.now(),
  timeout = 300000,
} = {}) {
  if (
    typeof read !== "function" ||
    typeof ready !== "function" ||
    !Number.isFinite(timeout) ||
    timeout <= 0 ||
    timeout > 300000
  )
    err("PHASE_CONFIGURATION");
  const start = now();
  let attempts = 0;
  for (;;) {
    const remaining = timeout - (now() - start);
    if (remaining <= 0) err("PHASE_TIMEOUT");
    let timer;
    const value = await Promise.race([
      Promise.resolve().then(read),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("PHASE_TIMEOUT")), remaining);
      }),
    ]).finally(() => clearTimeout(timer));
    if (now() - start >= timeout) err("PHASE_TIMEOUT");
    if (
      [
        "denied",
        "negado",
        "failed",
        "falhou",
        "cancelado",
        "cancelled",
        "stale",
        "incerto",
      ].includes(value?.state)
    )
      err("PHASE_DENIED");
    if (ready(value) === true) {
      if (now() - start >= timeout) err("PHASE_TIMEOUT");
      return value;
    }
    if (now() - start >= timeout || ++attempts >= 151) err("PHASE_TIMEOUT");
    await wait(2000);
  }
}

export function publicClientKey(value) {
  if (typeof value !== "string" || value.length > 4096) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(value)) return true;
  try {
    const parts = value.split(".");
    if (parts.length !== 3) return false;
    const body = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return body.role === "anon" && body.ref === "gklhhhyosgasnyoxlrui";
  } catch {
    return false;
  }
}
function accessTokenValid(token) {
  try {
    if (typeof token !== "string" || token.length > 16384 || token.split(".").length !== 3)
      return false;
    const body = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return (
      body.role === "authenticated" &&
      body.iss === FIXTURE.api + "/auth/v1" &&
      Number.isFinite(body.exp) &&
      body.exp * 1000 > Date.now() + 30000
    );
  } catch {
    return false;
  }
}
/** The closure never returns JWT, public key, user, response, headers, or credentials. */
export function createRuntimeLogin({
  page,
  fence,
  waitOrganization,
  openOrganizationSelector,
  verifyContext,
} = {}) {
  if (
    !page ||
    !fence ||
    typeof waitOrganization !== "function" ||
    typeof openOrganizationSelector !== "function" ||
    typeof verifyContext !== "function"
  )
    err("LOGIN_CONFIGURATION");
  let token = null,
    apikey = null,
    closed = false,
    loginStarted = false,
    authSeen = false,
    authFailed = false;
  const pending = new Set();
  const onRequest = (request) => {
    if (closed) return;
    const task = (async () => {
      try {
        const u = new URL(request.url());
        if (u.origin === FIXTURE.api) {
          const key = await request.headerValue("apikey");
          if (!closed && publicClientKey(key)) apikey = key;
        }
      } catch {
        authFailed = true;
      }
    })();
    pending.add(task);
    void task.finally(() => pending.delete(task));
  };
  const onResponse = (response) => {
    if (closed || !loginStarted) return;
    let request;
    try {
      request = response.request();
    } catch {
      return;
    }
    if (
      response.url() !== FIXTURE.api + "/auth/v1/token?grant_type=password" ||
      request.method() !== "POST"
    )
      return;
    if (authSeen) {
      authFailed = true;
      return;
    }
    authSeen = true;
    const task = (async () => {
      try {
        if (response.status() !== 200) err("LOGIN_AUTH");
        const length = await response.headerValue("content-length");
        if (length && Number(length) > 65536) err("LOGIN_AUTH");
        let body = await response.body();
        if (body.length > 65536) err("LOGIN_AUTH");
        let parsed = JSON.parse(body.toString("utf8"));
        const candidate = parsed.access_token;
        parsed = null;
        body.fill(0);
        body = null;
        if (!accessTokenValid(candidate)) err("LOGIN_AUTH");
        if (!closed) token = candidate;
      } catch {
        authFailed = true;
        token = null;
      }
    })();
    pending.add(task);
    void task.finally(() => pending.delete(task));
  };
  page.on("request", onRequest);
  page.on("response", onResponse);
  async function context() {
    await fence.drain();
    fence.assertSafe();
    await waitOrganization(page);
    if ((await verifyContext()) !== true) err("SESSION_CONTEXT");
  }
  async function logout() {
    token = null;
    apikey = null;
    closed = true;
    page.off("request", onRequest);
    page.off("response", onResponse);
    await Promise.allSettled([...pending]);
    try {
      await page.getByRole("button", { name: "Sair", exact: true }).click();
      await page.waitForURL((url) => url.origin === FIXTURE.origin && url.pathname === "/login");
      await fence.drain();
      fence.assertSafe();
      return true;
    } catch {
      err("LOGOUT_FAILED");
    }
  }
  return Object.freeze({
    async login({ email, password } = {}) {
      if (
        loginStarted ||
        closed ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email ||
        !password
      )
        err("LOGIN_CONFIGURATION");
      try {
        await page.goto(FIXTURE.origin + "/login", { waitUntil: "networkidle" });
        await fence.drain();
        fence.assertSafe();
        await page.locator("#login-email").fill(email);
        await page.locator("#login-senha").fill(password);
        email = null;
        password = null;
        loginStarted = true;
        await page.getByRole("button", { name: "Entrar", exact: true }).click();
        await page.waitForURL((url) => url.origin === FIXTURE.origin && url.pathname !== "/login");
        await Promise.all([...pending]);
        if (authFailed || !token || !apikey) err("LOGIN_AUTH");
        await openOrganizationSelector(page, fence);
        const card = page
          .getByRole("radio")
          .filter({ hasText: "ContaOS HML Teste" })
          .filter({ hasText: "Administrador Master" });
        if ((await card.count()) !== 1 || !/Situação:\s*ativa/i.test(await card.innerText()))
          err("LOGIN_MASTER");
        await card.click();
        await page.getByRole("button", { name: "Continuar", exact: true }).click();
        await page.waitForURL(FIXTURE.origin + "/");
        await context();
        return true;
      } catch {
        token = null;
        apikey = null;
        err("LOGIN_FAILED");
      } finally {
        email = null;
        password = null;
      }
    },
    context,
    async reuseDocument({ broker, payload, evidence, reconcile, settleVerifiedPage } = {}) {
      if (closed || authFailed || !accessTokenValid(token) || !publicClientKey(apikey))
        err("DOCUMENT_SESSION");
      await context();
      if (typeof reconcile !== "function" || typeof settleVerifiedPage !== "function")
        err("DOCUMENT_CONFIGURATION");
      const current = await reconcile();
      if (
        !current ||
        current.verified?.context !== true ||
        current.verified?.capability !== true ||
        current.verified?.reconciled !== true
      )
        err("DOCUMENT_RECONCILIATION");
      // Payload and evidence must match a fresh official reconciliation, never an old receipt alone.
      if (
        !same(current.payload, payload) ||
        !same(current.evidence, evidence) ||
        !validateBusinessPayload("criar_documento_competencia_v115", payload, current.evidence)
      )
        err("DOCUMENT_RECONCILIATION");
      broker.arm({
        rpc: "criar_documento_competencia_v115",
        payload,
        requestId: payload.p_chave_idempotencia,
        verified: current.verified,
        evidence: current.evidence,
      });
      let status;
      try {
        status = await page.evaluate(
          async ({ url, token, key, payload }) => {
            const response = await fetch(url, {
              method: "POST",
              redirect: "error",
              credentials: "omit",
              headers: {
                apikey: key,
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            // Do not transfer arbitrary backend bodies to Node, artifacts, or the model.
            return response.status;
          },
          {
            url: FIXTURE.api + "/rest/v1/rpc/criar_documento_competencia_v115",
            token,
            key: apikey,
            payload,
          },
        );
        await settleVerifiedPage(page, fence);
      } catch {
        broker.resolve("uncertain");
        err("DOCUMENT_UNCERTAIN");
      }
      if (status < 200 || status >= 300) {
        broker.resolve(status === 401 || status === 403 ? "denied" : "uncertain");
        err("DOCUMENT_REJECTED");
      }
      const after = await reconcile();
      if (after?.confirmed !== true) {
        broker.resolve("uncertain");
        err("DOCUMENT_UNCERTAIN");
      }
      broker.resolve("confirmed");
      return true;
    },
    logout,
    clear() {
      token = null;
      apikey = null;
      closed = true;
      page.off("request", onRequest);
      page.off("response", onResponse);
    },
  });
}
export async function reuseApprovedDocument(runtime, input) {
  if (!runtime || typeof runtime.reuseDocument !== "function") err("DOCUMENT_RUNTIME");
  return runtime.reuseDocument(input);
}
/** UI confirmation only: caller prepares existing forms and reconciles official state. */
export async function confirmUiIntent({
  page,
  fence,
  broker,
  rpc,
  payload,
  evidence,
  verified,
  button,
  scope = page,
  settleVerifiedPage,
  reconcile,
} = {}) {
  if (
    !BUSINESS_RPCS.includes(rpc) ||
    rpc === "criar_documento_competencia_v115" ||
    typeof button !== "string" ||
    typeof reconcile !== "function" ||
    typeof settleVerifiedPage !== "function"
  )
    err("UI_CONFIGURATION");
  await fence.drain();
  fence.assertSafe();
  const control = scope.getByRole("button", { name: button, exact: true });
  if ((await control.count()) !== 1 || !(await control.isEnabled())) err("UI_CAPABILITY");
  const fresh = await reconcile("before");
  if (
    fresh?.verified?.context !== true ||
    fresh?.verified?.capability !== true ||
    fresh?.verified?.reconciled !== true ||
    !same(fresh.payload, payload) ||
    !same(fresh.evidence, evidence) ||
    !same(fresh.verified, verified)
  )
    err("UI_RECONCILIATION");
  const key = uiKeyByRpc[rpc];
  broker.arm({
    rpc,
    payload,
    evidence,
    verified,
    ...(key ? { uiGeneratedKey: key } : { requestId: randomUUID() }),
  });
  try {
    await control.click();
    await settleVerifiedPage(page, fence);
    const after = await reconcile("after");
    if (after?.confirmed !== true) {
      broker.resolve("uncertain");
      err("UI_UNCERTAIN");
    }
    broker.resolve("confirmed");
    return true;
  } catch {
    if (broker.snapshot().sent && !broker.snapshot().frozen) broker.resolve("uncertain");
    err("UI_UNCERTAIN");
  }
}
/** Caller supplies only execution code; cleanup runs after login and every failure. */
export async function withRuntimeLogin(runtime, credentials, execute) {
  if (!runtime || typeof execute !== "function") err("LOGIN_CONFIGURATION");
  try {
    await runtime.login(credentials);
    credentials = null;
    return await execute(runtime);
  } finally {
    credentials = null;
    try {
      await runtime.logout();
    } finally {
      runtime.clear();
    }
  }
}

// This block is incorporated into the dedicated preparer, never a product module.
const OBSERVED_TABLES = new Set([
  "contratos",
  "fontes_normativas",
  "versoes_fontes_normativas",
  "listas_verificacao",
  "versoes_lista",
  "itens_lista",
  "competencias",
  "requisitos_competencia",
  "arquivos",
  "documentos_contrato",
  "documentos_competencia",
  "versoes_documento",
  "processamentos_documento",
  "pareceres_internos",
  "apresentacoes_contratante",
  "pacotes_competencia",
  "itens_pacote_competencia",
  "aprovacoes_apresentacao",
]);
const OBSERVED_RPCS = new Set([
  ...BUSINESS_RPCS,
  "consultar_permissoes_efetivas",
  "obter_matriz_rbac_master",
  "obter_lista_operacional_v1",
  "obter_visao_geral_competencia",
  "obter_documentos_competencia_v115",
  "obter_analise_competencia_v116",
  "obter_detalhe_requisito_v117",
  "obter_contexto_revisao_v117",
]);
const PRIVATE_RESPONSE_KEYS = new Set([
  "autor",
  "aprovado_por",
  "criado_por",
  "atualizado_por",
  "enviado_por",
  "id_usuario",
  "correlation_id",
  "user",
  "users",
  "email",
  "access_token",
  "refresh_token",
  "token",
  "senha",
  "password",
  "headers",
  "cookies",
  "storage_path",
  "path",
  "texto",
]);
const OBSERVED_KEYS = new Set(
  `id id_organizacao id_contrato id_contratante id_fonte id_arquivo id_versao id_lista id_versao_lista id_fonte_versao id_competencia id_requisito id_execucao id_resultado id_resultado_esperado id_execucao_esperada id_versao_documento id_documento id_documento_competencia id_parecer id_apresentacao id_pacote id_aprovacao entidade_id versao_id origem_id origem_tipo fonte versao lista competencia requisito documento documentos requisitos capacidades execucao_atual execucoes resultados resultado portao blocking_summary allowed_actions apontamentos evidencias parecer itens versoes permissoes perfil recurso acao permitido master schema_versao request_id evento_id tipo titulo nome nome_original numero descricao referencia situacao status etapa versao_registro versao_atual numero_versao inicio_vigencia fim_vigencia vigencia_inicio vigencia_fim competencia_referencia periodo_inicio periodo_fim data_limite criado_em atualizado_em aprovado_em apresentado_em congelado_em iniciado_em concluido_em tamanho mime sha256 hash hash_entrada hash_esperado hash_pacote conteudo_texto metadados codigo categoria obrigatorio aplicavel impeditivo criticidade ordem regra_validacao condicao sempre tipos documento obrigatorio acoes criar_lista editar_lista criar_versao editar_vigencia_rascunho criar_item editar_item remover_item publicar_versao encerrar_vigencia alterar_situacao descartar_rascunho pode_remover total_versoes total_itens pagina_versoes pagina_itens exclusao_lista_permitida motivo_retencao vigencia_fim_minima p_id_organizacao p_id_contrato p_id_lista p_id_versao p_id_competencia p_id_requisito p_pagina_versoes p_pagina_itens p_pagina_resultados p_pagina_execucoes p_pagina_apontamentos p_request_id percentual percentual_conformidade conformes_ou_na_validos total_obrigatorios_aplicaveis conformes nao_conformes nao_avaliados impeditivos bloqueantes pode_enviar pode_nova_versao executar_analise reanalisar abrir_requisito apresentar stale estado_analise mecanismo fonte_referencia pagina trecho paginas numero_rodada protocolo forma_apresentacao pode_revisar ultima_analise parecer_aprovado analise_atual atual total pagina_atual total_paginas content is_current erro_codigo tentativas estado acao id_versao_origem status_seguranca id_documento_contrato id_documento_competencia abrir_documentos abrir_parecer analisar analise_concluida_atual apontamentos_paginacao apresentacao aprovacao_apresentacao_atual arquivo arquivos atendido avaliados busca confianca contrato documentos_competencia documentos_paginacao documentos_total efeito_portao em_analise entidade_tipo evidencias_paginacao execucoes_paginacao fonte_detalhe fonte_tipo fundamento hash_evidencias hash_snapshot hash_versao historico historico_paginacao inconclusivos iniciada_em concluida_em justificativa liberado limite mecanismos modelo motivo motivo_nova_versao_obrigatorio motor na_validade nao_conformidades_bloqueantes offset organizacao origem origem_versao pendentes possui_evidencia possui_fundamento processamento prompt_versao provedor referencia_externa regra_violada requisitos_documentais requisitos_documentais_aplicaveis requisitos_documentais_pendentes requisitos_documentais_total requisitos_paginacao requisitos_total resultado_atual resultado_referencia resultados_paginacao resumo severidade status_execucao tipo_evidencia tipo_execucao tipos_esperados valido versao_motor versao_pacote_atual p_apontamentos_limite p_apontamentos_offset p_busca p_categoria p_documentos_limite p_documentos_offset p_evidencias_limite p_evidencias_offset p_execucoes_limite p_execucoes_offset p_filtro_apontamento_status p_filtro_criticidade p_filtro_mecanismo p_filtro_resultado p_historico_limite p_historico_offset p_id_documento p_requisitos p_requisitos_limite p_requisitos_offset p_resultados_limite p_resultados_offset`.split(
    /\s+/,
  ),
);
const TABLE_RESPONSE_FIELDS = Object.freeze({
  contratos: "id id_organizacao id_contratante numero situacao inicio_vigencia fim_vigencia",
  fontes_normativas:
    "id id_organizacao id_contrato tipo titulo referencia descricao situacao versao_registro criado_em atualizado_em",
  versoes_fontes_normativas:
    "id id_organizacao id_contrato id_fonte versao inicio_vigencia fim_vigencia id_arquivo hash aprovado_em criado_em conteudo_texto metadados",
  listas_verificacao:
    "id id_organizacao id_contrato nome descricao situacao versao_registro versao_atual",
  versoes_lista:
    "id id_organizacao id_contrato id_lista numero_versao situacao vigencia_inicio vigencia_fim",
  itens_lista:
    "id id_organizacao id_contrato id_versao_lista codigo descricao categoria obrigatorio aplicavel impeditivo criticidade id_fonte_versao regra_validacao ordem",
  competencias:
    "id id_contrato id_organizacao competencia_referencia periodo_inicio periodo_fim data_limite situacao percentual_conformidade versao_pacote_atual versao_registro atualizado_em",
  requisitos_competencia:
    "id id_organizacao id_contrato id_competencia codigo descricao obrigatorio aplicavel impeditivo criticidade origem_tipo origem_id id_fonte_versao regra_validacao ordem",
  arquivos: "id nome_original mime tamanho sha256 status_seguranca origem criado_em",
  documentos_contrato:
    "id id_contrato tipo titulo categoria situacao versao_atual versao_registro vigencia_inicio vigencia_fim criado_em atualizado_em",
  documentos_competencia:
    "id id_organizacao id_contrato id_competencia id_requisito tipo titulo categoria situacao versao_atual versao_registro",
  versoes_documento:
    "id id_organizacao id_contrato id_documento_contrato id_documento_competencia numero_versao id_arquivo hash criado_em documentos_competencia arquivos",
  processamentos_documento:
    "id id_versao_documento etapa status tentativas erro_codigo iniciado_em concluido_em criado_em atualizado_em",
  pareceres_internos:
    "id id_competencia id_contrato id_organizacao status versao hash criado_em aprovado_em",
  apresentacoes_contratante:
    "id id_competencia id_contrato id_organizacao id_pacote protocolo forma_apresentacao apresentado_em tipo numero_rodada",
  pacotes_competencia:
    "id id_competencia id_contrato id_organizacao hash_pacote numero tipo status congelado_em",
  itens_pacote_competencia:
    "id id_pacote id_competencia id_contrato id_organizacao entidade_tipo entidade_id versao_id hash ordem",
  aprovacoes_apresentacao: "id id_competencia id_contrato id_organizacao criado_em",
});
const RPC_RESPONSE_FIELDS = Object.freeze({
  consultar_permissoes_efetivas: "schema_versao versao master permissoes",
  obter_matriz_rbac_master: "schema_versao versao permissoes",
  obter_lista_operacional_v1:
    "schema_versao id_organizacao id_contrato lista versao versoes itens total_versoes total_itens pagina_versoes pagina_itens acoes exclusao_lista_permitida motivo_retencao vigencia_fim_minima",
  obter_visao_geral_competencia: "competencia portao blocking_summary allowed_actions",
  obter_documentos_competencia_v115:
    "schema_versao competencia resumo capacidades documentos documentos_paginacao requisitos_documentais requisitos_paginacao estado_documental",
  obter_analise_competencia_v116:
    "schema_versao competencia estado_analise stale execucao_atual percentual blocking_summary allowed_actions resultados resultados_paginacao execucoes execucoes_paginacao apontamentos apontamentos_paginacao",
  obter_detalhe_requisito_v117:
    "schema_versao competencia requisito execucao_atual resultado_atual resultado_referencia na_validade allowed_actions evidencias evidencias_paginacao historico historico_paginacao apontamentos apontamentos_paginacao",
  obter_contexto_revisao_v117:
    "schema_versao id_competencia id_requisito id_organizacao id_contrato id_execucao_esperada id_resultado_esperado hash_esperado pode_revisar",
});
const BUSINESS_RESPONSE_FIELDS =
  "schema_versao fonte versao lista id_organizacao id_contrato id_versao acao request_id evento_id id_competencia id_requisito id_execucao id_resultado id_aprovacao situacao percentual_conformidade";
export function projectOfficialResponse(value, depth = 0, strict = false, rootFields = null) {
  if (depth > 24) err("OBSERVATION_LIMIT");
  if (Array.isArray(value)) {
    if (value.length > 1000) err("OBSERVATION_LIMIT");
    return value.map((v) => projectOfficialResponse(v, depth + 1, strict, rootFields));
  }
  if (obj(value)) {
    const result = {};
    for (const [key, v] of Object.entries(value)) {
      if (
        PRIVATE_RESPONSE_KEYS.has(key) ||
        /(?:email|password|secret|token|cookie|authorization)/i.test(key)
      )
        continue;
      if (["__proto__", "prototype", "constructor"].includes(key)) err("OBSERVATION_SCHEMA");
      if (!(rootFields || OBSERVED_KEYS).has(key)) {
        if (strict) result.__unapproved_fields = true;
        continue;
      }
      if (key === "metadados" && (!obj(v) || Object.keys(v).length)) err("OBSERVATION_METADATA");
      result[key] = projectOfficialResponse(v, depth + 1, strict || key === "regra_validacao");
    }
    return result;
  }
  if (typeof value === "string" && value.length > 65536) err("OBSERVATION_LIMIT");
  if (value === null || ["string", "boolean", "number"].includes(typeof value)) return value;
  err("OBSERVATION_SCHEMA");
}

const EXACT_SELECTS = Object.freeze({
  contratos: [
    "id,id_organizacao,id_contratante,numero,objeto,situacao,criticidade,inicio,fim,tipo_contrato,unidade_vinculada,fonte_recurso,valor_global,valor_mensal_referencia,periodicidade,prazo_prestacao_dias,dia_limite_apresentacao,contratante:contratantes!contratos_contratante_org_fk(razao_social,nome_fantasia,documento)",
  ],
  fontes_normativas: [
    "id,id_organizacao,id_contrato,tipo,titulo,referencia,descricao,situacao,versao_registro,criado_em,atualizado_em",
  ],
  versoes_fontes_normativas: [
    "id,id_fonte,versao,inicio_vigencia,fim_vigencia,id_arquivo,hash,aprovado_por,aprovado_em,criado_em",
    "conteudo_texto,metadados",
  ],
  listas_verificacao: ["id,nome,descricao,situacao,versao_atual,versao_registro,atualizado_em"],
  versoes_lista: ["id,id_lista,numero_versao,vigencia_inicio,vigencia_fim,situacao,aprovado_em"],
  itens_lista: [
    "id,codigo,descricao,categoria,obrigatorio,aplicavel,impeditivo,criticidade,id_fonte_versao,regra_validacao,ordem",
  ],
  competencias: [
    "id_contrato",
    "id",
    "id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em",
  ],
  arquivos: [
    "id,nome_original,mime,tamanho,status_seguranca,criado_em",
    "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_em",
    "id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_por,criado_em",
    "id,id_organizacao,id_contrato,status_seguranca",
  ],
  documentos_contrato: [
    "id,id_contrato,tipo,titulo,categoria,situacao,versao_atual,versao_registro,vigencia_inicio,vigencia_fim,observacoes,criado_em,atualizado_em",
  ],
  versoes_documento: [
    "id,id_documento_contrato,numero_versao,id_arquivo,hash,metadados_extraidos,enviado_por,criado_em",
    "id,id_documento_contrato,numero_versao,id_arquivo,hash,motivo_substituicao,metadados_extraidos,enviado_por,criado_em",
    "id,numero_versao,id_organizacao,id_contrato,documentos_competencia!inner(id_competencia,titulo,situacao),arquivos!versoes_documento_arquivo_org_contrato_fk!inner(nome_original,status_seguranca)",
    "id,id_organizacao,id_contrato,id_arquivo",
  ],
  processamentos_documento: [
    "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em",
    "id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em,atualizado_em",
  ],
  pareceres_internos: [
    "id,id_competencia,id_contrato,id_organizacao,autor,texto,status,versao,hash,criado_em,aprovado_por,aprovado_em",
  ],
  apresentacoes_contratante: [
    "id,id_competencia,id_contrato,id_organizacao,id_pacote,protocolo,forma_apresentacao,apresentado_em,tipo,numero_rodada",
  ],
  pacotes_competencia: [
    "id,id_competencia,id_contrato,id_organizacao,hash_pacote,numero,tipo,status,congelado_em",
  ],
  itens_pacote_competencia: [
    "id,id_pacote,id_competencia,id_contrato,id_organizacao,entidade_tipo,entidade_id,versao_id,hash,ordem",
  ],
});
const REVIEW_SELECT =
  "id,numero_versao,id_organizacao,id_contrato,documentos_competencia!inner(id_competencia,titulo,situacao),arquivos!versoes_documento_arquivo_org_contrato_fk!inner(nome_original,status_seguranca)";

const QUERY_KEYS = Object.freeze({
  contratos: "select id",
  fontes_normativas: "select id_organizacao id_contrato or situacao order offset limit",
  versoes_fontes_normativas: "select id id_fonte order offset limit",
  listas_verificacao: "select id_contrato order offset limit",
  versoes_lista: "select id_lista order offset limit",
  itens_lista: "select id_versao_lista order offset limit",
  competencias:
    "select id id_organizacao id_contrato competencia_referencia situacao order offset limit",
  arquivos: "select id id_organizacao id_contrato order offset limit",
  documentos_contrato: "select id id_contrato tipo categoria situacao titulo order offset limit",
  versoes_documento:
    "select id id_documento_contrato id_organizacao id_contrato documentos_competencia.id_competencia documentos_competencia.situacao arquivos.status_seguranca or order offset limit",
  processamentos_documento: "select id_versao_documento order offset limit",
  pareceres_internos: "select id_competencia id_organizacao id_contrato order offset limit",
  apresentacoes_contratante: "select id id_competencia id_organizacao id_contrato",
  pacotes_competencia: "select id id_competencia id_organizacao id_contrato",
  itens_pacote_competencia:
    "select id_pacote id_competencia id_organizacao id_contrato order offset limit",
});
const SDK_ORDERS = Object.freeze({
  fontes_normativas: ["titulo.asc,id.asc"],
  versoes_fontes_normativas: ["versao.desc,id.asc"],
  listas_verificacao: ["atualizado_em.desc,id.desc"],
  versoes_lista: ["numero_versao.desc,id.desc"],
  itens_lista: ["ordem.asc,id.asc"],
  competencias: ["competencia_referencia.desc,id.desc"],
  arquivos: ["criado_em.desc,id.asc"],
  documentos_contrato: ["atualizado_em.desc,id.desc"],
  versoes_documento: ["numero_versao.desc,id.desc", "criado_em.desc,id.desc"],
  processamentos_documento: ["criado_em.desc,id.desc"],
  pareceres_internos: ["versao.desc,id.desc"],
  itens_pacote_competencia: ["ordem.asc,id.asc"],
});
function sdkShape(table, q) {
  const exact = (required, optional = []) =>
    required.every((k) => Object.hasOwn(q, k)) &&
    Object.keys(q).every((k) => required.includes(k) || optional.includes(k));
  const page = (size) =>
    q.limit === String(size) &&
    /^(0|[1-9]\d*)$/.test(q.offset || "") &&
    Number(q.offset) % size === 0;
  let ok = false;
  switch (table) {
    case "contratos":
      ok = exact(["select", "id"]);
      break;
    case "fontes_normativas":
      ok =
        exact(
          ["select", "id_organizacao", "order", "offset", "limit"],
          ["id_contrato", "or", "situacao"],
        ) &&
        page(25) &&
        (Object.hasOwn(q, "id_contrato") ? 1 : 0) + (Object.hasOwn(q, "or") ? 1 : 0) === 1 &&
        (!q.situacao ||
          ["eq.rascunho", "eq.ativa", "eq.inativa", "eq.revogada"].includes(q.situacao));
      break;
    case "versoes_fontes_normativas":
      ok =
        q.select === "conteudo_texto,metadados"
          ? exact(["select", "id"])
          : exact(["select", "id_fonte", "order", "offset", "limit"]) && page(25);
      break;
    case "listas_verificacao":
      ok = exact(["select", "id_contrato", "order", "offset", "limit"]) && page(25);
      break;
    case "versoes_lista":
      ok = exact(["select", "id_lista", "order", "offset", "limit"]) && page(25);
      break;
    case "itens_lista":
      ok = exact(["select", "id_versao_lista", "order", "offset", "limit"]) && page(25);
      break;
    case "competencias":
      ok =
        q.select === "id_contrato"
          ? exact(["select", "id", "id_organizacao"])
          : q.select === "id"
            ? exact(["select", "id_contrato", "competencia_referencia"])
            : exact(
                ["select", "id_contrato", "order", "offset", "limit"],
                ["competencia_referencia", "situacao"],
              ) && page(25);
      break;
    case "arquivos":
      ok =
        exact(["select", "id"]) ||
        exact(["select", "id", "id_organizacao", "id_contrato"]) ||
        (exact(["select", "id_organizacao", "id_contrato", "order", "offset", "limit"]) &&
          page(25));
      break;
    case "documentos_contrato":
      ok =
        exact(["select", "id", "id_contrato"]) ||
        (exact(
          ["select", "id_contrato", "order", "offset", "limit"],
          ["tipo", "categoria", "situacao", "titulo"],
        ) &&
          page(25));
      break;
    case "versoes_documento":
      if (q.select === REVIEW_SELECT)
        ok =
          exact([
            "select",
            "id_organizacao",
            "id_contrato",
            "documentos_competencia.id_competencia",
            "documentos_competencia.situacao",
            "arquivos.status_seguranca",
            "order",
            "offset",
            "limit",
          ]) &&
          page(25) &&
          q.order === "criado_em.desc,id.desc";
      else if (q.or) ok = exact(["select", "or"]);
      else if (q.id) ok = exact(["select", "id", "id_organizacao", "id_contrato"]);
      else
        ok =
          exact(["select", "id_documento_contrato", "order", "offset", "limit"]) &&
          page(20) &&
          q.order === "numero_versao.desc,id.desc";
      break;
    case "processamentos_documento":
      ok =
        exact(["select", "id_versao_documento", "order", "offset", "limit"]) &&
        (q.id_versao_documento?.startsWith("in.(") ? page(1000) : page(10));
      break;
    case "pareceres_internos":
      ok =
        exact([
          "select",
          "id_competencia",
          "id_organizacao",
          "id_contrato",
          "order",
          "offset",
          "limit",
        ]) && page(25);
      break;
    case "apresentacoes_contratante":
    case "pacotes_competencia":
      ok = exact(["select", "id", "id_competencia", "id_organizacao", "id_contrato"]);
      break;
    case "itens_pacote_competencia":
      ok =
        exact([
          "select",
          "id_pacote",
          "id_competencia",
          "id_organizacao",
          "id_contrato",
          "order",
          "offset",
          "limit",
        ]) && page(25);
      break;
  }
  if (!ok) err("OBSERVATION_QUERY");
}
const pathValue = (row, key) =>
  key.split(".").reduce((v, k) => (obj(v) && Object.hasOwn(v, k) ? v[k] : undefined), row);
function parseObservedQuery(table, url) {
  if (url.pathname !== "/rest/v1/" + table || url.pathname.includes("%")) err("OBSERVATION_QUERY");
  const q = Object.fromEntries(url.searchParams),
    pairs = [...url.searchParams];
  if (
    pairs.length !== Object.keys(q).length ||
    !QUERY_KEYS[table] ||
    pairs.some(([k]) => !QUERY_KEYS[table].split(" ").includes(k))
  )
    err("OBSERVATION_QUERY");
  if (!EXACT_SELECTS[table]?.includes(q.select)) err("OBSERVATION_PROJECTION");
  const predicates = new Map();
  for (const [k, v] of pairs) {
    if (k === "select") continue;
    if (k === "order") {
      if (!SDK_ORDERS[table]?.includes(v)) err("OBSERVATION_QUERY");
      continue;
    }
    if (k === "offset") {
      if (!/^(0|[1-9]\d{0,5})$/.test(v)) err("OBSERVATION_QUERY");
      continue;
    }
    if (k === "limit") {
      if (!["10", "20", "25", "1000"].includes(v)) err("OBSERVATION_QUERY");
      continue;
    }
    if (k === "or") {
      const sourceOr = "(id_contrato.eq." + FIXTURE.contract + ",id_contrato.is.null)";
      const docOr = new RegExp(
        "^\\(and\\(id_documento_contrato\\.eq\\." +
          FIXTURE.contractualDocument +
          ",numero_versao\\.eq\\.[1-9][0-9]*\\)\\)$",
      );
      if (
        (table !== "fontes_normativas" || v !== sourceOr) &&
        (table !== "versoes_documento" || !docOr.test(v))
      )
        err("OBSERVATION_QUERY");
      continue;
    }
    if (v.startsWith("eq.")) {
      const value = v.slice(3);
      if (k === "id_organizacao" && value !== FIXTURE.organization) err("OBSERVATION_CONTEXT");
      if (k === "id_contrato" && value !== FIXTURE.contract) err("OBSERVATION_CONTEXT");
      if (k === "id_fonte" && value !== FIXTURE.source) err("OBSERVATION_CONTEXT");
      if (k === "id_documento_contrato" && value !== FIXTURE.contractualDocument)
        err("OBSERVATION_CONTEXT");
      if ((k === "id" || k.startsWith("id_") || k.endsWith(".id_competencia")) && !uuid(value))
        err("OBSERVATION_QUERY");
      if (
        k === "competencia_referencia" &&
        !["2026-09-01", "2026-10-01", "2026-11-01"].includes(value)
      )
        err("OBSERVATION_CONTEXT");
      if (k === "documentos_competencia.situacao" && value !== "ativo") err("OBSERVATION_QUERY");
      if (k === "arquivos.status_seguranca" && value !== "aprovado") err("OBSERVATION_QUERY");
      predicates.set(k, { kind: "eq", value });
    } else if (
      v.startsWith("in.(") &&
      v.endsWith(")") &&
      ["id", "id_versao_documento"].includes(k)
    ) {
      const values = v.slice(4, -1).split(",");
      if (
        !values.length ||
        values.length > 1000 ||
        values.some((x) => !uuid(x)) ||
        new Set(values).size !== values.length
      )
        err("OBSERVATION_QUERY");
      predicates.set(k, { kind: "in", values });
    } else if (
      v === "is.null" &&
      k === "id_contrato" &&
      ["fontes_normativas", "arquivos"].includes(table)
    )
      predicates.set(k, { kind: "eq", value: null });
    else err("OBSERVATION_QUERY");
  }
  sdkShape(table, q);
  return {
    q,
    predicates,
    key: JSON.stringify(Object.entries(q).sort(([a], [b]) => a.localeCompare(b))),
  };
}
function matchesObservation(entry, row, where) {
  return Object.entries(where).every(([key, value]) => {
    const actual = pathValue(row, key);
    if (actual !== undefined) return actual === value;
    const bound = entry.predicates.get(key);
    return bound?.kind === "eq" && bound.value === value;
  });
}
function coversAbsence(entry, where) {
  const pairs = Object.entries(where);
  if (!pairs.length || Number(entry.q.offset || 0) !== 0) return false;
  if (
    !pairs.every(
      ([k, v]) => entry.predicates.get(k)?.kind === "eq" && entry.predicates.get(k).value === v,
    )
  )
    return false;
  return [...entry.predicates].every(
    ([k, p]) =>
      p.kind === "eq" &&
      (Object.hasOwn(where, k) ||
        (["id_organizacao", "id_contrato"].includes(k) &&
          p.value === FIXTURE[k === "id_contrato" ? "contract" : "organization"])),
  );
}
export function createOfficialObserver(page) {
  const pending = new Set(),
    tables = new Map(),
    rpcs = new Map(),
    sequences = new WeakMap();
  let sequence = 0,
    failed = false,
    closed = false;
  const checkBudget = () => {
    let bytes = 0,
      count = 0;
    for (const ledger of tables.values())
      for (const entry of ledger.values()) {
        bytes += Buffer.byteLength(JSON.stringify(entry.rows));
        count++;
      }
    for (const ledger of rpcs.values())
      for (const entry of ledger) {
        bytes += Buffer.byteLength(JSON.stringify([entry.args, entry.value]));
        count++;
      }
    if (bytes > 8 * 1024 * 1024 || count > 1024) err("OBSERVATION_LIMIT");
  };
  const onRequest = (request) => {
    if (!closed) sequences.set(request, ++sequence);
  };
  const onResponse = (response) => {
    if (closed) return;
    let request, url, table, rpc;
    try {
      request = response.request();
      url = new URL(response.url());
      if (url.origin !== FIXTURE.api || url.username || url.password || url.hash) return;
      const tm = /^\/rest\/v1\/([a-z_0-9]+)$/.exec(url.pathname),
        rm = /^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname);
      if (tm && request.method() === "GET" && OBSERVED_TABLES.has(tm[1])) table = tm[1];
      else if (rm && request.method() === "POST" && !url.search && OBSERVED_RPCS.has(rm[1]))
        rpc = rm[1];
      else return;
    } catch {
      failed = true;
      return;
    }
    const ordinal = sequences.get(request);
    const task = (async () => {
      if (!ordinal) return;
      let query = null;
      if (table) {
        try {
          query = parseObservedQuery(table, url);
        } catch {
          return;
        }
      }
      let args = {};
      if (rpc && request.postData()) {
        args = projectOfficialResponse(parseBusinessJson(request.postData()));
        if (
          (Object.hasOwn(args, "p_id_organizacao") &&
            args.p_id_organizacao !== FIXTURE.organization) ||
          (Object.hasOwn(args, "p_id_contrato") && args.p_id_contrato !== FIXTURE.contract)
        )
          return;
      }
      if (response.status() < 200 || response.status() >= 300) err("OBSERVATION_RESPONSE");
      const bytes = await response.body();
      let value;
      try {
        if (bytes.length > 1048576) err("OBSERVATION_LIMIT");
        const fields = table
          ? TABLE_RESPONSE_FIELDS[table]
          : RPC_RESPONSE_FIELDS[rpc] ||
            (BUSINESS_RPCS.includes(rpc) ? BUSINESS_RESPONSE_FIELDS : null);
        if (!fields) err("OBSERVATION_ENDPOINT");
        value = projectOfficialResponse(
          JSON.parse(bytes.toString("utf8")),
          0,
          false,
          new Set(fields.split(" ")),
        );
      } finally {
        bytes.fill(0);
      }
      if (closed) return;
      if (table) {
        const rows = value === null ? [] : Array.isArray(value) ? value : [value];
        if (rows.length > 1000) err("OBSERVATION_LIMIT");
        const ids = new Set();
        for (const row of rows) {
          if (!obj(row)) err("OBSERVATION_SCHEMA");
          for (const [k, p] of query.predicates) {
            const v = pathValue(row, k);
            if (v !== undefined && (p.kind === "eq" ? v !== p.value : !p.values.includes(v)))
              err("OBSERVATION_CONTEXT");
          }
          const id =
            row.id ??
            (query.predicates.get("id")?.kind === "eq"
              ? query.predicates.get("id").value
              : undefined);
          if (!uuid(id) || ids.has(id)) err("OBSERVATION_SCHEMA");
          ids.add(id);
        }
        const ledger = tables.get(table) || new Map(),
          prior = ledger.get(query.key);
        if (!prior || prior.ordinal < ordinal) ledger.set(query.key, { ...query, ordinal, rows });
        if (ledger.size > 1024) err("OBSERVATION_LIMIT");
        tables.set(table, ledger);
      } else {
        const cache = rpcs.get(rpc) || [];
        cache.push({ ordinal, args, value });
        cache.sort((a, b) => b.ordinal - a.ordinal);
        rpcs.set(rpc, cache.slice(0, 64));
      }
      checkBudget();
    })();
    pending.add(task);
    task
      .catch(() => {
        failed = true;
      })
      .finally(() => pending.delete(task));
  };
  page.on("request", onRequest);
  page.on("response", onResponse);
  const flush = async () => {
    await Promise.allSettled([...pending]);
    if (failed || closed) err("OBSERVATION_FAILED");
  };
  function rpcName(name) {
    const bare = name.startsWith("rpc:") ? name.slice(4) : name;
    return OBSERVED_RPCS.has(bare) ? bare : null;
  }
  function entries(table) {
    return [...(tables.get(table)?.values() || [])].sort((a, b) => b.ordinal - a.ordinal);
  }
  function selectLatest(table, options) {
    if (
      !obj(options) ||
      Object.keys(options).some((k) => k !== "select") ||
      (options.select !== undefined && !EXACT_SELECTS[table]?.includes(options.select))
    )
      err("OBSERVATION_PROJECTION");
    const ledger = entries(table).filter(
        (e) => options.select === undefined || e.q.select === options.select,
      ),
      latest = new Map();
    // Deduplicate identity BEFORE filtering state or omitted values.
    for (const e of ledger)
      for (const row of e.rows) {
        const id = row.id ?? e.predicates.get("id")?.value;
        if (!latest.has(id)) latest.set(id, { e, row });
      }
    return { ledger, latest };
  }
  return Object.freeze({
    flush,
    generation: () => sequence,
    async observedAfter(name, where = {}, after, options = {}) {
      await flush();
      const rpc = rpcName(name);
      if (rpc)
        return (rpcs.get(rpc) || []).some(
          (e) =>
            e.ordinal > after &&
            Object.entries(where).every(([k, v]) => pathValue(e.args, k) === v),
        );
      if (!OBSERVED_TABLES.has(name)) return false;
      const { latest, ledger } = selectLatest(name, options);
      for (const e of ledger)
        if (e.ordinal > after && e.rows.length === 0 && coversAbsence(e, where)) return true;
      const empty = ledger.find((e) => e.rows.length === 0 && coversAbsence(e, where));
      return [...latest.values()].some(
        ({ e, row }) =>
          e.ordinal > after &&
          (!empty || e.ordinal >= empty.ordinal) &&
          matchesObservation(e, row, where),
      );
    },
    async read(table, where = {}, options = {}) {
      await flush();
      if (!OBSERVED_TABLES.has(table) || !tables.has(table)) err("OBSERVATION_TABLE");
      const { latest, ledger } = selectLatest(table, options),
        empty = ledger.find((e) => e.rows.length === 0 && coversAbsence(e, where));
      return [...latest.values()]
        .filter(
          ({ e, row }) =>
            (!empty || e.ordinal >= empty.ordinal) && matchesObservation(e, row, where),
        )
        .map(({ row }) => structuredClone(row));
    },
    async rpcRead(name, where = {}) {
      await flush();
      const rpc = rpcName(name);
      if (!rpc) err("OBSERVATION_RPC");
      const item = (rpcs.get(rpc) || []).find((e) =>
        Object.entries(where).every(([k, v]) => pathValue(e.args, k) === v),
      );
      return item ? structuredClone(item.value) : null;
    },
    close() {
      closed = true;
      tables.clear();
      rpcs.clear();
      page.off("request", onRequest);
      page.off("response", onResponse);
    },
  });
}

/* Integration snippet only. FIXTURE, hash, uuid, same are existing same-module helpers.
 * No imports of product/adapters. No HML execution by this file.
 * io.read reads ONLY observed current-generation UI GETs; io.rpcRead ONLY observed
 * UI read-RPC responses. They must reject stale/partial/unobserved data.
 * command receives payload WITHOUT UI key; existing confirmUiIntent binds the
 * single UI-generated UUID before continuing POST. Never add wildcard keys.
 * Additional required interface: io.sourceCapabilities() -> current official
 * {canRegister,canApprove,canActivate} from already-observed effective RBAC.
 * Do not implement these flags as role-name/button-presence guesses.
 */
export async function prepareSourceAndList(io) {
  const { page } = io;
  const fail = (code) => {
    throw new Error(code);
  };
  const assert = (ok, code) => {
    if (!ok) fail(code);
  };
  assert(typeof io.text === "string" && hash(io.text) === FIXTURE.fileHash, "FLOW_TXT_HASH");
  assert(FIXTURE.source === "8b942e46-a29b-40d9-8ad4-04aaf9124a34", "FLOW_SOURCE_GATE368");
  assert(typeof io.sourceCapabilities === "function", "FLOW_CAPABILITY_OBSERVER_REQUIRED");
  const checkedOfficial = (r) => {
    const e = io.official(r);
    return (
      e &&
      typeof e === "object" &&
      e.official === true &&
      e.current === true &&
      e.organization === FIXTURE.organization &&
      e.contract === FIXTURE.contract
    );
  };
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  let source, version, model;
  const verifiedTextVersions = new Set();
  const hash64 = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
  const evidence = { sourceVersions: [], list: null };
  const btn = (s, name) => s.getByRole("button", { name, exact: true });
  const enabled = async (locator, code) => {
    assert(
      (await locator.count()) === 1 && (await locator.isVisible()) && (await locator.isEnabled()),
      code,
    );
  };
  const click = async (s, name) => {
    const b = btn(s, name);
    await enabled(b, "FLOW_BUTTON_UNAVAILABLE");
    await b.click();
    await io.fresh();
  };
  const field = (s, name) => s.getByLabel(name, { exact: true });
  const dialog = (name) => page.getByRole("dialog", { name, exact: true });
  const one = (rows, code) => {
    assert(Array.isArray(rows) && rows.length === 1, code);
    return rows[0];
  };
  const sourceRow = async () => {
    const s = one(
      await io.read("fontes_normativas", { id: FIXTURE.source }),
      "FLOW_SOURCE_NONUNIQUE",
    );
    assert(
      checkedOfficial(s) &&
        s.id_organizacao === FIXTURE.organization &&
        s.id_contrato === FIXTURE.contract &&
        Number.isInteger(s.versao_registro) &&
        s.versao_registro > 0 &&
        sourceFieldsExact(s),
      "FLOW_SOURCE_CONTEXT",
    );
    source = s;
    evidence.source = {
      ...context,
      id: s.id,
      tipo: s.tipo,
      titulo: s.titulo,
      referencia: s.referencia,
      descricao: s.descricao,
      version: s.versao_registro,
    };
    return s;
  };
  const sourceProof = async () => {
    await sourceRow();
    assert(
      uuid(version.id) &&
        version.id_fonte === source.id &&
        hash64(version.hash) &&
        verifiedTextVersions.has(version.id) &&
        version.inicio_vigencia === "2026-01-01" &&
        version.fim_vigencia === null &&
        version.id_arquivo === null,
      "FLOW_SOURCE_VERSION_MISMATCH",
    );
    const caps = await io.sourceCapabilities();
    assert(checkedOfficial(caps), "FLOW_SOURCE_CAPABILITY_CONTEXT");
    evidence.sourceVersions = [
      {
        ...context,
        id: version.id,
        source: source.id,
        hash: version.hash,
        state: version.aprovado_em ? "aprovada" : "rascunho",
        active: source.situacao === "ativa",
        effective: version.inicio_vigencia === "2026-01-01" && version.fim_vigencia === null,
        canApprove: caps.canApprove === true,
      },
    ];
    return caps;
  };
  const versionRead = async (after) => {
    if (
      after !== undefined &&
      !(await io.observedAfter("versoes_fontes_normativas", { id_fonte: FIXTURE.source }, after, {
        select: EXACT_SELECTS.versoes_fontes_normativas[0],
      }))
    )
      fail("FLOW_VERSION_READBACK_UNOBSERVED");
    version = one(
      (
        await io.read(
          "versoes_fontes_normativas",
          { id_fonte: FIXTURE.source },
          { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
        )
      ).filter(
        (v) =>
          hash64(v.hash) &&
          verifiedTextVersions.has(v.id) &&
          v.inicio_vigencia === "2026-01-01" &&
          v.fim_vigencia === null &&
          v.id_arquivo === null,
      ),
      "FLOW_EQUIVALENT_VERSION_NONUNIQUE",
    );
    await sourceProof();
    return version;
  };
  // GET cache must distinguish observed absence from not yet observed. Walk every UI page.
  const allPages = async (scope, nextName, readRows) => {
    const seen = new Map();
    let turns = 0;
    while (true) {
      assert(++turns <= 100, "FLOW_PAGE_LIMIT");
      for (const r of await readRows()) {
        assert(uuid(r.id), "FLOW_ROW_ID");
        seen.set(r.id, r);
      }
      const next = btn(scope, nextName);
      if ((await next.count()) === 0 || !(await next.isEnabled())) break;
      await click(scope, nextName);
    }
    return [...seen.values()];
  };
  await io.goKnown(`/contratos/${FIXTURE.contract}/base-normativa`);
  // Locate exact official source through existing source-list pagination, never create source.
  const sources = await allPages(page, "Próxima página", () => io.read("fontes_normativas", {}));
  assert(
    sources.some((s) => s.id === FIXTURE.source),
    "FLOW_SOURCE_NOT_IN_UI_GET",
  );
  await sourceRow();
  // Return through a KNOWN SSR path so its list starts at page zero, then find source button.
  await io.goKnown(`/contratos/${FIXTURE.contract}/base-normativa`);
  for (let n = 0; (await btn(page, `Detalhes de ${source.titulo}`).count()) === 0; n++) {
    assert(n < 100, "FLOW_SOURCE_UI_MISSING");
    await click(page, "Próxima página");
  }
  await click(page, `Detalhes de ${source.titulo}`);
  let sheet = dialog(source.titulo);
  const versions = await allPages(sheet, "Próximas versões", () =>
    io.read(
      "versoes_fontes_normativas",
      { id_fonte: source.id },
      { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
    ),
  );
  // A source-version hash is a server digest of structured version fields,
  // NOT SHA256(TXT). Prove the TXT separately using the real expanded GET.
  const proveText = async (v) => {
    assert(uuid(v.id) && hash64(v.hash) && v.id_fonte === source.id, "FLOW_VERSION_ID_HASH");
    for (
      let n = 0;
      (await btn(sheet, `Ver texto registrado (versão ${v.versao})`).count()) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_VERSION_TEXT_UI_MISSING");
      await click(sheet, "Versões anteriores");
    }
    const textOrdinal = io.generation();
    await click(sheet, `Ver texto registrado (versão ${v.versao})`);
    assert(
      await io.observedAfter("versoes_fontes_normativas", { id: v.id }, textOrdinal, {
        select: "conteudo_texto,metadados",
      }),
      "FLOW_VERSION_TEXT_UNOBSERVED",
    );
    // IO joins only the just-observed select=conteudo_texto,metadados&id=eq.ID
    // to the independently observed version identity. It must not invent row ID
    // from response content (this projection omits id), or use a stale text GET.
    const textRow = one(
      await io.read(
        "versoes_fontes_normativas",
        { id: v.id },
        { select: "conteudo_texto,metadados" },
      ),
      "FLOW_VERSION_TEXT_UNOBSERVED",
    );
    const exact =
      textRow.conteudo_texto === io.text &&
      hash(textRow.conteudo_texto) === FIXTURE.fileHash &&
      same(textRow.metadados, {});
    if (exact) verifiedTextVersions.add(v.id);
    await click(sheet, "Ocultar texto");
    return exact;
  };
  const equivalents = [];
  for (const v of versions.filter(
    (v) => v.inicio_vigencia === "2026-01-01" && v.fim_vigencia === null && v.id_arquivo === null,
  )) {
    // Move back to first page to locate each candidate deterministically.
    while (
      (await btn(sheet, "Versões anteriores").count()) === 1 &&
      (await btn(sheet, "Versões anteriores").isEnabled())
    )
      await click(sheet, "Versões anteriores");
    for (
      let n = 0;
      (await btn(sheet, `Ver texto registrado (versão ${v.versao})`).count()) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_VERSION_CANDIDATE_UI_MISSING");
      await click(sheet, "Próximas versões");
    }
    if (await proveText(v)) equivalents.push(v);
  }
  assert(equivalents.length <= 1, "FLOW_DUPLICATE_EQUIVALENT_VERSION");
  if (equivalents.length === 0) {
    while (
      (await btn(sheet, "Versões anteriores").count()) === 1 &&
      (await btn(sheet, "Versões anteriores").isEnabled())
    )
      await click(sheet, "Versões anteriores");
    const caps = await io.sourceCapabilities();
    assert(checkedOfficial(caps) && caps.canRegister === true, "FLOW_REGISTER_DENIED");
    await click(sheet, "Nova versão");
    const d = dialog("Nova versão");
    await field(d, "Início da vigência").fill("2026-01-01");
    await field(d, "Fim da vigência (opcional)").fill("");
    await field(d, "Texto").check();
    await field(d, "Texto da versão").fill(io.text);
    const registerOrdinal = io.generation();
    await io.command({
      rpc: "registrar_versao_fonte_v107",
      payload: {
        p_id_organizacao: FIXTURE.organization,
        p_id_fonte: FIXTURE.source,
        p_inicio_vigencia: "2026-01-01",
        p_fim_vigencia: null,
        p_id_arquivo: null,
        p_conteudo_texto: io.text,
        p_metadados: {},
      },
      evidence,
      scope: d,
      button: "Registrar versão",
      confirmAfter: (r) =>
        r?.schema_versao === "v107-v1" &&
        uuid(r?.versao?.id) &&
        r.versao.id_fonte === FIXTURE.source &&
        hash64(r.versao.hash) &&
        r.versao.conteudo_texto === io.text &&
        same(r.versao.metadados, {}),
    });
    await io.fresh();
    const newlyObserved = (
      await io.read(
        "versoes_fontes_normativas",
        { id_fonte: source.id },
        { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
      )
    ).filter(
      (v) =>
        !versions.some((old) => old.id === v.id) &&
        v.inicio_vigencia === "2026-01-01" &&
        v.fim_vigencia === null &&
        v.id_arquivo === null,
    );
    const created = one(newlyObserved, "FLOW_CREATED_VERSION_NONUNIQUE");
    assert(await proveText(created), "FLOW_CREATED_VERSION_TEXT_MISMATCH");
    await versionRead(registerOrdinal);
  } else {
    version = equivalents[0];
    await sourceProof();
  }
  // Locate matching version's button even when pagination starts on last page.
  let caps = await sourceProof();
  if (!version.aprovado_em) {
    for (let n = 0; (await btn(sheet, `Aprovar versão ${version.versao}`).count()) === 0; n++) {
      assert(n < 100, "FLOW_VERSION_UI_MISSING");
      await click(sheet, "Versões anteriores");
    }
    assert(caps.canApprove === true, "FLOW_APPROVE_DENIED");
    await click(sheet, `Aprovar versão ${version.versao}`);
    const d = dialog(`Aprovar versão ${version.versao}`);
    await field(d, "Fundamento").fill(FIXTURE.foundation);
    await field(d, "Confirmo que revisei hash, origem e vigência desta versão.").check();
    const id = version.id;
    const approvalOrdinal = io.generation();
    await io.command({
      rpc: "aprovar_versao_fonte_v107",
      payload: {
        p_id_organizacao: FIXTURE.organization,
        p_id_versao: id,
        p_hash_esperado: version.hash,
        p_fundamento: FIXTURE.foundation,
      },
      evidence,
      scope: d,
      button: "Aprovar",
      confirmAfter: (r) =>
        r?.schema_versao === "v107-v1" &&
        r?.versao?.id === id &&
        r.versao.hash === version.hash &&
        !!r.versao.aprovado_em,
    });
    await io.fresh();
    await versionRead(approvalOrdinal);
    assert(!!version.aprovado_em, "FLOW_APPROVAL_NOT_READBACK");
  }
  await click(sheet, "Close");
  if (source.situacao !== "ativa") {
    caps = await sourceProof();
    assert(caps.canActivate === true, "FLOW_ACTIVATE_DENIED");
    await click(page, `Editar ${source.titulo}`);
    const d = dialog("Editar fonte");
    await field(d, "Situação").selectOption("ativa");
    const before = source.versao_registro;
    await io.command({
      rpc: "salvar_fonte_normativa_v107",
      payload: {
        p_id_organizacao: FIXTURE.organization,
        p_id_contrato: FIXTURE.contract,
        p_id_fonte: source.id,
        p_tipo: source.tipo,
        p_titulo: source.titulo,
        p_referencia: source.referencia,
        p_descricao: source.descricao,
        p_situacao: "ativa",
        p_versao_esperada: before,
      },
      evidence,
      scope: d,
      button: "Salvar",
      confirmAfter: (r) =>
        r?.schema_versao === "v107-v1" &&
        r?.fonte?.id === FIXTURE.source &&
        r.fonte.situacao === "ativa" &&
        r.fonte.versao_registro === before + 1,
    });
    await io.fresh();
    await sourceRow();
    assert(source.situacao === "ativa", "FLOW_ACTIVE_NOT_READBACK");
  }
  await sourceProof();
  await io.link(`/contratos/${FIXTURE.contract}/regras`);
  await click(page, "Gerenciar listas");
  const panel = page.getByRole("region", { name: "Gestão de listas", exact: true });
  const headers = await allPages(panel, "Próxima página de listas", () =>
    io.read("listas_verificacao", {}),
  );
  const matches = headers.filter((l) => l.nome === FIXTURE.listName);
  assert(matches.length <= 1, "FLOW_LIST_DUPLICATE");
  const readModel = async () => {
    const d = await io.rpcRead("obter_lista_operacional_v1");
    assert(
      d?.schema_versao === "crud-lista-v1" &&
        d.id_organizacao === FIXTURE.organization &&
        d.id_contrato === FIXTURE.contract &&
        checkedOfficial(d),
      "FLOW_MODEL_CONTEXT",
    );
    model = d;
    return d;
  };
  const itemExpected = () => ({
    codigo: "AUD-A-TXT-001",
    descricao: "Presença do documento TXT sintético de auditoria.",
    categoria: "documental",
    obrigatorio: true,
    aplicavel: true,
    impeditivo: true,
    criticidade: "alta",
    ordem: 1,
    id_fonte_versao: version.id,
    regra_validacao: {
      documento: { obrigatorio: true, tipos: ["outro"] },
      condicao: { tipo: "sempre" },
    },
  });
  const ruleOK = (i) => Object.entries(itemExpected()).every(([k, v]) => same(i[k], v));
  const listProof = async () => {
    const d = await readModel();
    assert(
      d.lista &&
        d.versao &&
        d.lista.nome === FIXTURE.listName &&
        d.lista.descricao === FIXTURE.listDescription &&
        checkedOfficial(d.lista) &&
        checkedOfficial(d.versao) &&
        d.versao.id_lista === d.lista.id &&
        d.versao.vigencia_inicio === "2026-01-01" &&
        d.versao.vigencia_fim === null &&
        d.total_itens === d.itens.length &&
        d.total_itens <= 1 &&
        d.itens.every(
          (i) => uuid(i.id) && checkedOfficial(i) && i.id_versao_lista === d.versao.id && ruleOK(i),
        ),
      "FLOW_LIST_STATE_MISMATCH",
    );
    evidence.list = {
      ...context,
      id: d.lista.id,
      name: d.lista.nome,
      version: d.lista.versao_registro,
      versionId: d.versao.id,
      itemId: d.itens.length === 1 ? d.itens[0].id : null,
      active: d.lista.situacao === "ativa",
      published: d.versao.situacao === "publicada",
      sourceVersion: version.id,
      sourceReady: !!version.aprovado_em && source.situacao === "ativa",
      ruleVerified: d.itens.length === 1 && ruleOK(d.itens[0]),
    };
    return d;
  };
  const listCommand = async (action, payload, label, setup = async () => {}) => {
    const d = await readModel();
    assert(
      d.acoes?.[action === "salvar_item" ? "criar_item" : action] === true,
      "FLOW_LIST_CAPABILITY_DENIED",
    );
    if (action !== "criar_lista") await listProof();
    await click(panel, label);
    const form = panel.locator("form").filter({
      has: page.getByRole("heading", {
        name: action === "salvar_item" ? "Salvar item" : label,
        exact: true,
      }),
    });
    assert((await form.count()) === 1, "FLOW_LIST_FORM_NONUNIQUE");
    await setup(form);
    await field(form, "Motivo").fill(FIXTURE.reason);
    await click(form, "Revisar operação");
    const prev = action === "criar_lista" ? null : d.lista.versao_registro;
    await io.command({
      rpc: "executar_comando_lista_v1",
      payload: {
        p_id_organizacao: FIXTURE.organization,
        p_id_contrato: FIXTURE.contract,
        p_id_lista: action === "criar_lista" ? null : d.lista.id,
        p_versao_esperada: prev,
        p_acao: action,
        p_payload: payload,
        p_motivo: FIXTURE.reason,
      },
      evidence,
      scope: form,
      button: "Confirmar operação",
      confirmAfter: (r) =>
        r?.schema_versao === "crud-lista-v1" &&
        r.acao === action &&
        r.id_organizacao === FIXTURE.organization &&
        r.id_contrato === FIXTURE.contract &&
        uuid(r.lista?.id) &&
        r.lista.nome === FIXTURE.listName &&
        r.lista.versao_registro === (prev === null ? 1 : prev + 1) &&
        (action === "criar_lista" || r.lista.id === d.lista.id) &&
        uuid(r.evento_id),
    });
    await io.fresh();
    await listProof();
  };
  if (matches.length === 0) {
    await listCommand(
      "criar_lista",
      {
        nome: FIXTURE.listName,
        descricao: FIXTURE.listDescription,
        vigencia_inicio: "2026-01-01",
        vigencia_fim: null,
      },
      "Criar lista",
      async (f) => {
        await field(f, "Nome").fill(FIXTURE.listName);
        await field(f, "Descrição").fill(FIXTURE.listDescription);
        await field(f, "Início da vigência").fill("2026-01-01");
        await field(f, "Fim da vigência").fill("");
      },
    );
  } else {
    // Find the already-observed target's page; no synthetic option or direct navigation.
    for (
      let n = 0;
      (await field(panel, "Lista selecionada")
        .locator(`option[value="${matches[0].id}"]`)
        .count()) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_LIST_UI_MISSING");
      await click(panel, "Página anterior de listas");
    }
    await field(panel, "Lista selecionada").selectOption(matches[0].id);
    await io.fresh();
    await listProof();
  }
  await listProof();
  if (model.itens.length === 0) {
    assert(model.versao.situacao === "rascunho", "FLOW_PUBLISHED_EMPTY_LIST");
    await listCommand(
      "salvar_item",
      { id_versao: model.versao.id, id_item: null, ...itemExpected() },
      "Adicionar item",
      async (f) => {
        for (const [label, value] of [
          ["Código", "AUD-A-TXT-001"],
          ["Descrição do item", "Presença do documento TXT sintético de auditoria."],
          ["Categoria", "documental"],
          ["Identificador da versão da fonte formal", version.id],
          ["Ordem", "1"],
        ])
          await field(f, label).fill(value);
        for (const label of ["Obrigatório", "Aplicável", "Impeditivo"])
          await field(f, label).check();
        await field(f, "Criticidade").selectOption("alta");
        await field(f, "Regra de validação e condição (JSON)").fill(
          JSON.stringify(itemExpected().regra_validacao),
        );
      },
    );
  }
  if (model.versao.situacao !== "publicada") {
    assert(model.versao.situacao === "rascunho", "FLOW_VERSION_STATE");
    await listCommand("publicar_versao", { id_versao: model.versao.id }, "Publicar versão");
    assert(model.versao.situacao === "publicada", "FLOW_PUBLICATION_NOT_READBACK");
  }
  if (model.lista.situacao !== "ativa") {
    await listCommand("alterar_situacao", { situacao: "ativa" }, "Alterar situação", async (f) => {
      await field(f, "Situação").selectOption("ativa");
    });
  }
  await listProof();
  assert(
    model.lista.situacao === "ativa" &&
      model.versao.situacao === "publicada" &&
      evidence.list.ruleVerified &&
      uuid(evidence.list.itemId) &&
      evidence.list.active &&
      evidence.list.sourceReady &&
      model.lista.versao_atual === model.versao.numero_versao,
    "FLOW_FINAL_NOT_READY",
  );
  return {
    sourceVersionId: version.id,
    listId: model.lista.id,
    listVersionId: model.versao.id,
    itemId: model.itens[0].id,
    evidence,
  };
}

/** Integration snippet only. Uses FIXTURE/randomUUID, approvedFile and waitOfficialPhase from the preparer.
 * All reads below consume the UI observer cache. There is no direct read request,
 * route injection, worker call, state editing, arbitrary RPC or mutation retry.
 * io.observedAfter(name, where, ordinal) MUST prove a new successful UI request.
 * io.command MUST arm immediately before clicking, seal UI UUID at native Request,
 * persist synchronously, await matching Response, then run confirmAfter once.
 */
export async function prepareCompetencies(io, sourceList) {
  const stop = (code) => {
    throw new Error(code);
  };
  const uuid = (value) =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
  const hash = (value) => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
  const code = "AUD-A-TXT-001";
  const contractBase = `/contratos/${FIXTURE.contract}`;
  const listPath = contractBase + "/competencias";
  const wait = io.wait || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const output = { state: "partial", competencies: [] };
  let temporalAborted = false;
  const phaseActive = () => {
    if (temporalAborted) stop("COMPETENCE_PHASE_ABORTED");
  };
  const verified = { context: true, capability: true, reconciled: true };
  for (const fn of [
    "read",
    "rpcRead",
    "fresh",
    "link",
    "command",
    "official",
    "verifyContext",
    "generation",
    "observedAfter",
  ]) {
    if (typeof io[fn] !== "function") stop("COMPETENCE_IO_CONFIGURATION");
  }
  if (
    !io.page ||
    !io.runtime ||
    !io.broker ||
    !sourceList ||
    ![sourceList.sourceVersionId, sourceList.listId, sourceList.listVersionId].every(uuid)
  )
    stop("COMPETENCE_SOURCE_LIST");
  await io.fresh();
  if ((await io.verifyContext()) !== true) stop("COMPETENCE_CONTEXT");
  // Read the actual official UI RPC DTO, not assumed convenience flags such as list.active.
  const sourceModel = await io.rpcRead("obter_lista_operacional_v1");
  if (
    sourceModel?.schema_versao !== "crud-lista-v1" ||
    sourceModel.id_organizacao !== FIXTURE.organization ||
    sourceModel.id_contrato !== FIXTURE.contract ||
    sourceModel.lista?.id !== sourceList.listId ||
    sourceModel.lista.situacao !== "ativa" ||
    sourceModel.lista.id_organizacao !== FIXTURE.organization ||
    sourceModel.lista.id_contrato !== FIXTURE.contract ||
    sourceModel.versao?.id !== sourceList.listVersionId ||
    sourceModel.versao.id_lista !== sourceList.listId ||
    sourceModel.versao.situacao !== "publicada" ||
    sourceModel.versao.id_organizacao !== FIXTURE.organization ||
    sourceModel.versao.id_contrato !== FIXTURE.contract ||
    sourceModel.lista.versao_atual !== sourceModel.versao.numero_versao ||
    sourceModel.versao.vigencia_inicio !== "2026-01-01" ||
    sourceModel.versao.vigencia_fim !== null ||
    !Array.isArray(sourceModel.itens) ||
    sourceModel.itens.length !== 1 ||
    sourceModel.total_itens !== 1
  )
    stop("COMPETENCE_LIST_NOT_ACTIVE");
  const sourceItem = sourceModel.itens[0];
  if (
    !uuid(sourceItem.id) ||
    sourceItem.id_versao_lista !== sourceList.listVersionId ||
    sourceItem.id_fonte_versao !== sourceList.sourceVersionId ||
    sourceItem.codigo !== code ||
    sourceItem.id_organizacao !== FIXTURE.organization ||
    sourceItem.id_contrato !== FIXTURE.contract ||
    (sourceList.itemId && sourceList.itemId !== sourceItem.id)
  )
    stop("COMPETENCE_SOURCE_ITEM");
  const verifiedItemId = sourceItem.id;
  const context = async () => {
    phaseActive();
    await io.fresh();
    phaseActive();
    if ((await io.verifyContext()) !== true) stop("COMPETENCE_CONTEXT");
  };
  const rows = async (table, where, options = {}) => {
    phaseActive();
    const result = await io.read(table, where, options);
    phaseActive();
    if (!Array.isArray(result)) stop("COMPETENCE_READ_SHAPE");
    return result;
  };
  const observed = async (name, where, ordinal, options = {}) => {
    phaseActive();
    await io.fresh();
    phaseActive();
    if ((await io.observedAfter(name, where, ordinal, options)) !== true)
      stop("COMPETENCE_STALE_OBSERVATION");
  };
  const link = async (path) => {
    phaseActive();
    await io.link(path);
    phaseActive();
    await io.fresh();
    phaseActive();
  };
  const click = async (name, scope = io.page) => {
    phaseActive();
    const button = scope.getByRole("button", { name, exact: true });
    if ((await button.count()) !== 1 || !(await button.isEnabled()))
      stop("COMPETENCE_CONTROL_UNAVAILABLE");
    phaseActive();
    await button.click();
    phaseActive();
    await io.fresh();
    phaseActive();
  };
  async function poll(read, ready, refresh) {
    let initial = true;
    try {
      return await waitOfficialPhase({
        timeout: 300000,
        wait,
        read: async () => {
          phaseActive();
          // UI refresh belongs to the bounded read, under the SAME phase deadline.
          if (!initial) {
            await refresh();
            phaseActive();
          }
          initial = false;
          const value = await read();
          phaseActive();
          return value;
        },
        ready: (value) => {
          phaseActive();
          return ready(value) === true;
        },
      });
    } catch (error) {
      if (error?.message === "PHASE_TIMEOUT") {
        temporalAborted = true;
        // The pending read/navigation may still be resolving. Close its context,
        // then stop the entire executor; never start another month's mutation.
        if (typeof io.abortPhase === "function") {
          try {
            await io.abortPhase("COMPETENCE_PHASE_TIMEOUT");
          } catch {
            /* main finally also closes context */
          }
        }
        stop("COMPETENCE_PHASE_TIMEOUT");
      }
      throw error;
    }
  }
  function inContext(row, id) {
    if (
      !row ||
      row.id !== id ||
      row.id_organizacao !== FIXTURE.organization ||
      row.id_contrato !== FIXTURE.contract
    )
      stop("COMPETENCE_RELATION");
    return row;
  }
  async function overview(id, month) {
    const ordinal = io.generation();
    await link(`/competencias/${id}`);
    await observed("obter_visao_geral_competencia", { p_id_competencia: id }, ordinal);
    const value = await io.rpcRead("obter_visao_geral_competencia", {
      p_id_competencia: id,
    });
    inContext(value?.competencia, id);
    if (value.competencia.competencia_referencia !== month || id === FIXTURE.historical)
      stop("COMPETENCE_MONTH");
    return value;
  }
  function competencyEvidence(view, month) {
    const c = inContext(view.competencia, view.competencia.id);
    const official = io.official(c);
    if (!official || official.official !== true || official.current !== true)
      stop("COMPETENCE_OFFICIAL");
    return {
      ...official,
      id: c.id,
      month,
      organization: FIXTURE.organization,
      contract: FIXTURE.contract,
    };
  }
  async function refreshArea(id, month, area, rpc) {
    await overview(id, month);
    const ordinal = io.generation();
    await link(`/competencias/${id}/${area}`);
    await observed(rpc, { p_id_competencia: id }, ordinal);
  }
  async function listMonth(month) {
    // A real navigation remounts the list, so unchanged filters never fake freshness.
    const ordinal = io.generation();
    await link(listPath);
    await io.page.getByLabel("Competência", { exact: true }).fill(month.slice(0, 7));
    await observed(
      "competencias",
      { id_contrato: FIXTURE.contract, competencia_referencia: month },
      ordinal,
      {
        select: EXACT_SELECTS.competencias.find((value) =>
          value.includes("competencia_referencia,"),
        ),
      },
    );
    const found = (
      await rows(
        "competencias",
        {
          id_contrato: FIXTURE.contract,
          competencia_referencia: month,
        },
        {
          select: EXACT_SELECTS.competencias.find((value) =>
            value.includes("competencia_referencia,"),
          ),
        },
      )
    ).filter((r) => r.competencia_referencia === month);
    if (found.length > 1 || found.some((r) => !uuid(r.id) || r.id === FIXTURE.historical))
      stop("COMPETENCE_AMBIGUOUS");
    return found;
  }
  async function createOrReuse(month) {
    await context();
    let existing = await listMonth(month);
    if (!existing.length) {
      await link(listPath + "/nova");
      await io.page.getByLabel("Competência (mês/ano)", { exact: true }).fill(month.slice(0, 7));
      await context();
      await io.command({
        rpc: "criar_competencia",
        payload: {
          p_id_contrato: FIXTURE.contract,
          p_competencia_referencia: month,
        },
        evidence: {},
        button: "Criar competência",
        confirmAfter: async () => {
          await link(listPath);
          existing = await listMonth(month);
          return existing.length === 1;
        },
      });
      if (existing.length !== 1) stop("COMPETENCE_CREATE_UNCERTAIN");
    }
    const id = existing[0].id;
    // Anchor must be real and match the reconciled ID, never goto a fabricated path.
    const view = await overview(id, month);
    if (view.competencia.situacao === "cancelada" || view.competencia.situacao === "encerrada")
      stop("COMPETENCE_TERMINAL");
    return {
      id,
      view,
      evidence: { competencies: [competencyEvidence(view, month)] },
    };
  }
  async function approvedContractFile() {
    const ordinal = io.generation();
    await link(contractBase + "/documentos");
    await observed("documentos_contrato", { id_contrato: FIXTURE.contract }, ordinal);
    const docs = await rows("documentos_contrato", {
      id_contrato: FIXTURE.contract,
      id: FIXTURE.contractualDocument,
    });
    if (
      docs.length !== 1 ||
      docs[0].id_contrato !== FIXTURE.contract ||
      docs[0].situacao !== "ativo"
    )
      stop("COMPETENCE_APPROVED_FILE_RELATION");
    await observed(
      "versoes_documento",
      { id_documento_contrato: FIXTURE.contractualDocument },
      ordinal,
    );
    const versions = (
      await rows("versoes_documento", {
        id_documento_contrato: FIXTURE.contractualDocument,
      })
    ).filter((v) => v.id_arquivo === FIXTURE.file && v.numero_versao === docs[0].versao_atual);
    if (versions.length !== 1 || !uuid(versions[0].id)) stop("COMPETENCE_APPROVED_FILE_VERSION");
    await observed("arquivos", { id: FIXTURE.file }, ordinal);
    const files = await rows("arquivos", { id: FIXTURE.file });
    if (files.length !== 1) stop("COMPETENCE_APPROVED_FILE");
    const f = files[0];
    // Official projection validates the joined contract/document/version/file chain.
    const parent = io.official(docs[0]);
    if (
      parent?.official !== true ||
      parent?.organization !== FIXTURE.organization ||
      parent?.contract !== FIXTURE.contract
    )
      stop("COMPETENCE_APPROVED_FILE_CONTEXT");
    const checked = {
      ...parent,
      id: f.id,
      document: docs[0].id,
      status: f.status_seguranca,
      mime: f.mime,
      bytes: f.tamanho,
      sha256: f.sha256,
    };
    if (!approvedFile(checked)) stop("COMPETENCE_APPROVED_FILE");
    return checked;
  }
  async function readDocuments(c) {
    const value = await io.rpcRead("obter_documentos_competencia_v115", {
      p_id_competencia: c.id,
    });
    inContext(value?.competencia, c.id);
    if (
      value.competencia.competencia_referencia !== c.month ||
      value.schema_versao !== "v115-v1" ||
      !Array.isArray(value.requisitos_documentais) ||
      !Array.isArray(value.documentos)
    )
      stop("COMPETENCE_DOCUMENT_SHAPE");
    if (value.estado_documental === "error") stop("COMPETENCE_DOCUMENT_FAILED");
    const requirements = value.requisitos_documentais.filter((r) => r.codigo === code);
    if (requirements.length > 1) stop("COMPETENCE_REQUIREMENT_AMBIGUOUS");
    return { value, requirement: requirements[0] || null };
  }
  async function ensureDocument(c) {
    // Reconsult persisted approved asset immediately before linking, through contract UI.
    const file = await approvedContractFile();
    await link(listPath);
    await listMonth(c.month);
    await refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115");
    const loaded = await poll(
      () => readDocuments(c),
      (x) => !!x.requirement,
      () => refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
    );
    const q = loaded.requirement;
    if (
      !uuid(q.id) ||
      q.obrigatorio !== true ||
      q.aplicavel !== true ||
      q.impeditivo !== true ||
      q.categoria !== "documental" ||
      !q.tipos_esperados?.includes("outro")
    )
      stop("COMPETENCE_REQUIREMENT_RULE");
    c.requirementId = q.id;
    const matching = loaded.value.documentos.filter((d) => d.requisito?.id === q.id);
    if (matching.length > 1) stop("COMPETENCE_DOCUMENT_AMBIGUOUS");
    function matchingDocument(value) {
      const found = value.documentos.filter((d) => d.requisito?.id === q.id);
      if (found.length !== 1) return null;
      const d = found[0];
      if (
        !uuid(d.id) ||
        d.tipo !== "outro" ||
        d.categoria !== "documental" ||
        d.titulo !== "Documento TXT sintético Trilha A." ||
        d.situacao !== "ativo" ||
        d.arquivo?.id !== FIXTURE.file ||
        d.versao?.id_arquivo !== FIXTURE.file ||
        d.arquivo?.sha256 !== FIXTURE.fileHash ||
        d.arquivo?.status_seguranca !== "aprovado"
      )
        stop("COMPETENCE_DOCUMENT_RELATION");
      if (["failed", "error", "cancelled", "cancelado"].includes(d.processamento?.status))
        stop("COMPETENCE_DOCUMENT_FAILED");
      return d;
    }
    const requirement = io.official({
      id: q.id,
      id_organizacao: loaded.value.competencia.id_organizacao,
      id_contrato: loaded.value.competencia.id_contrato,
      competency: c.id,
      code,
    });
    const evidence = { ...c.evidence, file, requirements: [requirement] };
    if (matching.length) {
      matchingDocument(loaded.value);
    } else {
      const payload = {
        p_id_competencia: c.id,
        p_tipo: "outro",
        p_titulo: "Documento TXT sintético Trilha A.",
        p_categoria: "documental",
        p_id_requisito: q.id,
        p_id_arquivo: FIXTURE.file,
        p_chave_idempotencia: randomUUID(),
      };
      await io.runtime.reuseDocument({
        broker: io.broker,
        payload,
        evidence,
        settleVerifiedPage: async () => io.fresh(),
        reconcile: async () => {
          await refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115");
          const d = await readDocuments(c);
          return {
            payload,
            evidence,
            verified: {
              ...verified,
              capability: d.value.capacidades?.pode_enviar === true,
            },
            confirmed: !!matchingDocument(d.value),
          };
        },
      });
    }
    const ready = await poll(
      () => readDocuments(c),
      (x) => !!matchingDocument(x.value) && x.value.estado_documental === "complete",
      () => refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
    );
    const d = matchingDocument(ready.value);
    c.documentId = d.id;
    c.evidence = evidence;
  }
  async function analysis(c) {
    const a = await io.rpcRead("obter_analise_competencia_v116", {
      p_id_competencia: c.id,
    });
    if (
      a?.schema_versao !== "v116-v1" ||
      a?.competencia?.id !== c.id ||
      a.competencia.competencia_referencia !== c.month ||
      !Array.isArray(a.resultados)
    )
      stop("COMPETENCE_ANALYSIS_RELATION");
    if (
      a.stale === true ||
      ["failed", "stale"].includes(a.estado_analise) ||
      ["failed", "cancelled", "cancelado"].includes(a.execucao_atual?.status)
    )
      stop("COMPETENCE_ANALYSIS_FAILED");
    return a;
  }
  async function ensureAnalysis(c) {
    await refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116");
    let a = await analysis(c);
    if (a.estado_analise === "not_analyzed") {
      if (a.allowed_actions?.executar_analise !== true) stop("COMPETENCE_ANALYSIS_DENIED");
      await io.command({
        rpc: "solicitar_analise_competencia",
        payload: { p_id_competencia: c.id, p_tipo: "completa" },
        evidence: c.evidence,
        button: "Executar análise",
        confirmAfter: async () => {
          await io.fresh();
          a = await analysis(c);
          return (
            uuid(a.execucao_atual?.id) &&
            ["queued", "processing", "complete"].includes(a.estado_analise)
          );
        },
      });
    }
    a = await poll(
      () => analysis(c),
      (v) => v.estado_analise === "complete" && uuid(v.execucao_atual?.id),
      () => refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116"),
    );
    c.executionId = a.execucao_atual.id;
    return a;
  }
  async function inspectRequirement(c) {
    const ordinal = io.generation();
    await click("Abrir requisito " + code);
    await observed(
      "obter_detalhe_requisito_v117",
      { p_id_competencia: c.id, p_id_requisito: c.requirementId },
      ordinal,
    );
    const detail = await io.rpcRead("obter_detalhe_requisito_v117", {
      p_id_competencia: c.id,
      p_id_requisito: c.requirementId,
    });
    if (
      detail?.schema_versao !== "v117-v1" ||
      detail?.competencia?.id !== c.id ||
      detail?.requisito?.id !== c.requirementId ||
      detail.requisito.codigo !== code
    )
      stop("COMPETENCE_DETAIL_RELATION");
    const itemId = verifiedItemId;
    if (
      !uuid(itemId) ||
      detail.requisito.origem_tipo !== "item_lista" ||
      detail.requisito.origem_id !== itemId
    )
      stop("COMPETENCE_SNAPSHOT_SOURCE_RELATION");
    const rule = detail.requisito.regra_validacao;
    let parsed;
    try {
      parsed = typeof rule === "string" ? JSON.parse(rule) : rule;
    } catch {
      stop("COMPETENCE_RULE_UNPROVEN");
    }
    if (
      !same(parsed, {
        documento: { obrigatorio: true, tipos: ["outro"] },
        condicao: { tipo: "sempre" },
      })
    )
      stop("COMPETENCE_RULE_UNPROVEN");
    return detail;
  }
  async function reviewIfNeeded(c, a) {
    const targets = a.resultados.filter(
      (r) => r.id_requisito === c.requirementId && r.requisito?.codigo === code,
    );
    if (targets.length !== 1 || !uuid(targets[0].id_resultado)) stop("COMPETENCE_RESULT_UNPROVEN");
    const detail = await inspectRequirement(c);
    // Do not review unrelated requirements or override an already conforming result.
    if (targets[0].resultado === "conforme") {
      await io.page.keyboard.press("Escape");
      await io.fresh();
      return a;
    }
    if (detail.execucao_atual?.id !== a.execucao_atual.id) stop("COMPETENCE_REVIEW_STALE");
    const candidates = (detail.evidencias || []).filter(
      (v) =>
        v.pagina === 1 &&
        typeof v.trecho === "string" &&
        v.trecho.split(/\r?\n/).some((line) => line.trim() === FIXTURE.excerpt) &&
        v.documento?.id_arquivo === FIXTURE.file &&
        v.documento?.status_seguranca === "aprovado" &&
        uuid(v.documento?.id_versao_documento),
    );
    if (candidates.length !== 1) stop("COMPETENCE_REVIEW_MATERIAL_UNPROVEN");
    const material = candidates[0],
      documentVersion = material.documento.id_versao_documento;
    c.documentVersionId = documentVersion;
    const region = io.page.getByRole("region", {
      name: "Revisão humana do requisito",
      exact: true,
    });
    const before = io.generation();
    await click("Revisar resultado", region);
    await observed(
      "obter_contexto_revisao_v117",
      { p_id_competencia: c.id, p_id_requisito: c.requirementId },
      before,
    );
    const ctx = await io.rpcRead("obter_contexto_revisao_v117", {
      p_id_competencia: c.id,
      p_id_requisito: c.requirementId,
    });
    if (
      ctx?.schema_versao !== "revisao-v117" ||
      ctx.id_competencia !== c.id ||
      ctx.id_requisito !== c.requirementId ||
      ctx.id_organizacao !== FIXTURE.organization ||
      ctx.id_contrato !== FIXTURE.contract ||
      ctx.pode_revisar !== true ||
      ctx.id_execucao_esperada !== a.execucao_atual.id ||
      ctx.id_resultado_esperado !== targets[0].id_resultado ||
      !hash(ctx.hash_esperado)
    )
      stop("COMPETENCE_REVIEW_CONTEXT");
    await observed("versoes_documento", { "documentos_competencia.id_competencia": c.id }, before, {
      select: REVIEW_SELECT,
    });
    const versions = await rows(
      "versoes_documento",
      {
        "documentos_competencia.id_competencia": c.id,
        id: documentVersion,
      },
      { select: REVIEW_SELECT },
    );
    if (
      versions.length !== 1 ||
      versions[0].documentos_competencia?.id_competencia !== c.id ||
      versions[0].documentos_competencia?.situacao !== "ativo" ||
      versions[0].arquivos?.status_seguranca !== "aprovado" ||
      !Number.isInteger(versions[0].numero_versao) ||
      typeof versions[0].arquivos?.nome_original !== "string"
    )
      stop("COMPETENCE_REVIEW_DOCUMENT_VERSION");
    const v = versions[0];
    await region.getByLabel("Resultado da revisão", { exact: true }).selectOption("conforme");
    await region
      .getByLabel("Justificativa da revisão", { exact: true })
      .fill(FIXTURE.reviewJustification);
    await region
      .getByLabel("Fundamento da revisão", { exact: true })
      .fill(FIXTURE.reviewFoundation);
    const checkbox = region.getByRole("checkbox", {
      name: `Selecionar ${v.arquivos.nome_original} versão ${v.numero_versao}`,
      exact: true,
    });
    if ((await checkbox.count()) !== 1) stop("COMPETENCE_REVIEW_EVIDENCE_AMBIGUOUS");
    await checkbox.check();
    await region.getByLabel("Página da evidência 1", { exact: true }).fill("1");
    await region.getByLabel("Trecho da evidência 1", { exact: true }).fill(FIXTURE.excerpt);
    await click("Revisar e confirmar", region);
    const evidence = {
      ...c.evidence,
      review: io.official({
        id_organizacao: FIXTURE.organization,
        id_contrato: FIXTURE.contract,
        competency: c.id,
        requirement: c.requirementId,
        code,
        canReview: true,
        materialPresenceVerified: true,
        extractedExcerpt: FIXTURE.excerpt,
        fileHash: FIXTURE.fileHash,
        execution: ctx.id_execucao_esperada,
        result: ctx.id_resultado_esperado,
        hash: ctx.hash_esperado,
        documentVersion,
      }),
    };
    await io.command({
      rpc: "registrar_revisao_requisito_v117",
      payload: {
        p_id_competencia: c.id,
        p_id_requisito: c.requirementId,
        p_id_execucao_esperada: ctx.id_execucao_esperada,
        p_id_resultado_esperado: ctx.id_resultado_esperado,
        p_hash_esperado: ctx.hash_esperado,
        p_resultado: "conforme",
        p_justificativa: FIXTURE.reviewJustification,
        p_fundamento: FIXTURE.reviewFoundation,
        p_evidencias: [
          {
            id_versao_documento: documentVersion,
            pagina: 1,
            trecho: FIXTURE.excerpt,
          },
        ],
      },
      evidence,
      button: "Confirmar revisão",
      scope: region,
      confirmAfter: async () => {
        await io.page.keyboard.press("Escape");
        await refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116");
        a = await analysis(c);
        const result = a.resultados.find((r) => r.id_requisito === c.requirementId);
        return (
          a.estado_analise === "complete" &&
          uuid(a.execucao_atual?.id) &&
          a.execucao_atual.id !== ctx.id_execucao_esperada &&
          result?.resultado === "conforme" &&
          uuid(result.id_resultado) &&
          result.id_resultado !== ctx.id_resultado_esperado
        );
      },
    });
    c.executionId = a.execucao_atual.id;
    return a;
  }
  async function opinion(c) {
    let view = await overview(c.id, c.month);
    if (
      view.blocking_summary?.analise_concluida_atual !== true ||
      view.allowed_actions?.abrir_parecer !== true
    )
      stop("COMPETENCE_OPINION_GATE");
    let ordinal = io.generation();
    await link(`/competencias/${c.id}/parecer`);
    await observed("pareceres_internos", { id_competencia: c.id }, ordinal);
    const readOpinion = async () => {
      const list = await rows("pareceres_internos", {
        id_competencia: c.id,
        id_contrato: FIXTURE.contract,
        id_organizacao: FIXTURE.organization,
      });
      for (const row of list) {
        inContext(row, row.id);
        if (
          row.id_competencia !== c.id ||
          !uuid(row.id) ||
          !Number.isInteger(row.versao) ||
          row.versao < 1
        )
          stop("COMPETENCE_OPINION_RELATION");
      }
      list.sort((x, y) => y.versao - x.versao);
      if (list.length > 1 && list[0].versao === list[1].versao)
        stop("COMPETENCE_OPINION_AMBIGUOUS");
      return list[0] || null;
    };
    const refresh = async () => {
      const n = io.generation();
      await click("Atualizar");
      await observed("pareceres_internos", { id_competencia: c.id }, n);
    };
    let p = await readOpinion();
    if (!p) {
      const evidence = {
        ...c.evidence,
        analysisCurrent: true,
        analysisComplete: true,
        opinionGate: true,
      };
      await io.command({
        rpc: "solicitar_parecer_interno",
        payload: { p_id_competencia: c.id },
        evidence,
        button: "Solicitar parecer",
        confirmAfter: async () => {
          await io.fresh();
          p = await readOpinion();
          return !!p && uuid(p.id);
        },
      });
    }
    p = await poll(
      readOpinion,
      (x) =>
        !!x &&
        uuid(x.id) &&
        hash(x.hash) &&
        !["queued", "processing", "pendente", "processando"].includes(x.status),
      refresh,
    );
    if (
      ["failed", "error", "cancelado", "reprovado"].includes(p.status) ||
      p.id_competencia !== c.id
    )
      stop("COMPETENCE_OPINION_FAILED");
    if (p.status !== "aprovado" || !p.aprovado_em) {
      await click("Aprovar parecer");
      const dialog = io.page.getByRole("dialog", {
        name: "Confirmar aprovação",
        exact: true,
      });
      await dialog.getByLabel("Fundamento (opcional)", { exact: true }).fill(FIXTURE.foundation);
      const evidence = {
        ...c.evidence,
        opinions: [{ ...io.official(p), competency: c.id }],
      };
      const id = p.id;
      await io.command({
        rpc: "aprovar_parecer_interno",
        payload: {
          p_id_parecer: id,
          p_aprovar: true,
          p_fundamento: FIXTURE.foundation,
        },
        evidence,
        button: "Confirmar decisão",
        scope: dialog,
        confirmAfter: async () => {
          await io.fresh();
          p = await readOpinion();
          return p?.id === id && p.status === "aprovado" && !!p.aprovado_em;
        },
      });
    }
    c.opinionId = p.id;
    return p;
  }
  async function present(c, register) {
    let view = await overview(c.id, c.month);
    if (
      ["apresentado", "aguardando_contratante", "validada", "reapresentado"].includes(
        view.competencia.situacao,
      )
    )
      stop("COMPETENCE_EXISTING_REGISTRATION_LINK_UNAVAILABLE");
    const ready = (v) =>
      v.blocking_summary?.analise_concluida_atual === true &&
      v.blocking_summary?.parecer_aprovado === true &&
      v.portao?.liberado === true &&
      v.portao?.percentual === 100 &&
      v.competencia.percentual_conformidade === 100;
    if (!ready(view) || view.allowed_actions?.apresentar !== true)
      stop("COMPETENCE_PRESENTATION_GATE");
    await link(`/competencias/${c.id}/apresentar`);
    await io.fresh();
    const evidence = {
      ...c.evidence,
      analysisCurrent: true,
      analysisComplete: true,
      opinionApproved: true,
      compliance: 100,
    };
    if (view.competencia.situacao !== "pode_apresentar_contratante") {
      if (view.blocking_summary.aprovacao_apresentacao_atual === true)
        stop("COMPETENCE_PRESENTATION_STATE");
      await io.page
        .getByLabel("Fundamento da aprovação (opcional)", { exact: true })
        .fill(FIXTURE.foundation);
      await click("Aprovar apresentação");
      const dialog = io.page.getByRole("dialog", {
        name: "Confirmar aprovação institucional",
        exact: true,
      });
      const approvalOrdinal = io.generation();
      await io.command({
        rpc: "aprovar_apresentacao",
        payload: { p_id_competencia: c.id, p_fundamento: FIXTURE.foundation },
        evidence,
        button: "Confirmar aprovação",
        scope: dialog,
        confirmAfter: async () => {
          await observed(
            "obter_visao_geral_competencia",
            { p_id_competencia: c.id },
            approvalOrdinal,
          );
          view = await io.rpcRead("obter_visao_geral_competencia", {
            p_id_competencia: c.id,
          });
          return (
            view?.competencia?.id === c.id &&
            view.competencia.situacao === "pode_apresentar_contratante" &&
            view.blocking_summary?.aprovacao_apresentacao_atual === true &&
            ready(view)
          );
        },
      });
    }
    c.state = view.competencia.situacao;
    if (!register) return;
    if (
      c.month !== "2026-09-01" ||
      view.competencia.situacao !== "pode_apresentar_contratante" ||
      view.blocking_summary?.aprovacao_apresentacao_atual !== true
    )
      stop("COMPETENCE_REGISTER_GATE");
    await io.page
      .getByLabel("Protocolo (se disponível)", { exact: true })
      .fill("HML-TRILHA-A-20261108");
    await io.page
      .getByLabel("Forma da apresentação (se disponível)", { exact: true })
      .fill("Ensaio sintético em homologação.");
    await click("Registrar apresentação");
    const dialog = io.page.getByRole("dialog", {
      name: "Confirmar envio ao contratante",
      exact: true,
    });
    let presentationId = null;
    await io.command({
      rpc: "registrar_apresentacao",
      payload: {
        p_id_competencia: c.id,
        p_protocolo: "HML-TRILHA-A-20261108",
        p_forma_apresentacao: "Ensaio sintético em homologação.",
      },
      evidence: {
        ...evidence,
        presentationApproved: true,
        allowedRegister: true,
      },
      button: "Confirmar registro",
      scope: dialog,
      confirmAfter: async () => {
        const result = io.page.getByRole("link", {
          name: "Abrir registro da apresentação",
          exact: true,
        });
        if ((await result.count()) !== 1) return false;
        const href = await result.getAttribute("href");
        const match = new RegExp("^/competencias/" + c.id + "/apresentacoes/([0-9a-f-]{36})$").exec(
          href || "",
        );
        if (!match || !uuid(match[1])) return false;
        presentationId = match[1];
        const n = io.generation();
        await link(href);
        await observed(
          "apresentacoes_contratante",
          { id: presentationId, id_competencia: c.id },
          n,
        );
        await observed("pacotes_competencia", { id_competencia: c.id }, n);
        await observed("itens_pacote_competencia", { id_competencia: c.id }, n);
        return await readPackage(c, presentationId);
      },
    });
    if (!presentationId) stop("COMPETENCE_REGISTER_UNCERTAIN");
    c.presentationId = presentationId;
    view = await overview(c.id, c.month);
    if (view.competencia.situacao !== "aguardando_contratante")
      stop("COMPETENCE_REGISTER_STATE_UNPROVEN");
    c.state = view.competencia.situacao;
  }
  async function readPackage(c, id) {
    const list = await rows("apresentacoes_contratante", {
      id,
      id_competencia: c.id,
      id_contrato: FIXTURE.contract,
      id_organizacao: FIXTURE.organization,
    });
    if (list.length !== 1) return false;
    const a = list[0];
    inContext(a, id);
    if (
      a.id_competencia !== c.id ||
      !uuid(a.id_pacote) ||
      a.protocolo !== "HML-TRILHA-A-20261108" ||
      a.forma_apresentacao !== "Ensaio sintético em homologação." ||
      !a.apresentado_em
    )
      stop("COMPETENCE_PACKAGE_RELATION");
    const listPk = await rows("pacotes_competencia", {
      id: a.id_pacote,
      id_competencia: c.id,
      id_contrato: FIXTURE.contract,
      id_organizacao: FIXTURE.organization,
    });
    if (listPk.length !== 1) return false;
    const p = listPk[0];
    inContext(p, a.id_pacote);
    if (p.id_competencia !== c.id || !hash(p.hash_pacote) || !p.congelado_em)
      stop("COMPETENCE_PACKAGE_UNPROVEN");
    const items = await rows("itens_pacote_competencia", {
      id_pacote: p.id,
      id_competencia: c.id,
      id_contrato: FIXTURE.contract,
      id_organizacao: FIXTURE.organization,
    });
    if (!items.length) stop("COMPETENCE_PACKAGE_EMPTY");
    for (const item of items) {
      if (
        item.id_pacote !== p.id ||
        item.id_competencia !== c.id ||
        item.id_organizacao !== FIXTURE.organization ||
        item.id_contrato !== FIXTURE.contract ||
        !uuid(item.id) ||
        !hash(item.hash)
      )
        stop("COMPETENCE_PACKAGE_ITEM_RELATION");
    }
    c.packageId = p.id;
    c.packageHash = p.hash_pacote;
    c.packageState = p.status;
    return true;
  }
  for (const month of ["2026-10-01", "2026-09-01"]) {
    const receipt = { month, state: "partial" };
    output.competencies.push(receipt);
    try {
      const initial = await createOrReuse(month);
      const c = { ...initial, month };
      receipt.id = c.id;
      if (
        ["apresentado", "aguardando_contratante", "validada", "reapresentado"].includes(
          c.view.competencia.situacao,
        )
      ) {
        receipt.state = c.view.competencia.situacao;
        stop("COMPETENCE_EXISTING_REGISTRATION_LINK_UNAVAILABLE");
      }
      await ensureDocument(c);
      receipt.requirementId = c.requirementId;
      receipt.documentId = c.documentId;
      let a = await ensureAnalysis(c);
      a = await reviewIfNeeded(c, a);
      receipt.executionId = c.executionId;
      receipt.documentVersionId = c.documentVersionId || null;
      await opinion(c);
      receipt.opinionId = c.opinionId;
      await present(c, month === "2026-09-01");
      receipt.state = c.state;
      if (c.presentationId) {
        receipt.presentationId = c.presentationId;
        receipt.packageId = c.packageId;
        receipt.packageHash = c.packageHash;
        receipt.packageState = c.packageState;
      }
      receipt.capabilities = {
        analysisCurrent: true,
        opinionApproved: true,
        presentationApproved: true,
      };
    } catch (error) {
      receipt.code = /^COMPETENCE_[A-Z_]+$/.test(error?.message || "")
        ? error.message
        : "COMPETENCE_DEPENDENCY_BLOCKED";
      if (temporalAborted) break;
      try {
        await io.page.keyboard.press("Escape");
        await io.fresh();
      } catch {
        /* Remain partial; never issue a compensating mutation. */
      }
    }
  }
  output.state = output.competencies.every((c) =>
    c.month === "2026-10-01"
      ? c.state === "pode_apresentar_contratante"
      : c.state === "aguardando_contratante" &&
        uuid(c.presentationId) &&
        uuid(c.packageId) &&
        hash(c.packageHash),
  )
    ? "confirmed"
    : "partial";
  return output;
}

export function preparerEventAllowed(env) {
  return singleRequestEventAllowed(env, "fixtures");
}
export function validatePreparerIdentity(env, proof, native, identity, head) {
  return (
    preparerEventAllowed(env) &&
    env.GITHUB_SHA === env.CONTAOS_HARNESS_SHA &&
    head === env.CONTAOS_HARNESS_SHA &&
    /^[a-f0-9]{40}$/.test(head || "") &&
    /^\d+$/.test(env.GITHUB_RUN_ID || "") &&
    proof?.schema === "contaos.private.provenance.v1" &&
    proof.harnessSha === head &&
    proof.frontendSha === env.CONTAOS_FRONTEND_SHA &&
    proof.deploymentId === env.CONTAOS_DEPLOYMENT_ID &&
    nativeProofValid(native, identity)
  );
}
const PREPARER_FAILURE_CODES = new Set([
  "BINDING_CODE",
  "BINDING_HASH",
  "BINDING_ID",
  "BINDING_PACKAGE",
  "BINDING_SCHEMA",
  "BODY_JSON",
  "BODY_LIMIT",
  "COMPETENCE_AMBIGUOUS",
  "COMPETENCE_ANALYSIS_DENIED",
  "COMPETENCE_ANALYSIS_FAILED",
  "COMPETENCE_ANALYSIS_RELATION",
  "COMPETENCE_APPROVED_FILE",
  "COMPETENCE_APPROVED_FILE_CONTEXT",
  "COMPETENCE_APPROVED_FILE_RELATION",
  "COMPETENCE_APPROVED_FILE_VERSION",
  "COMPETENCE_CONTEXT",
  "COMPETENCE_CONTROL_UNAVAILABLE",
  "COMPETENCE_CREATE_UNCERTAIN",
  "COMPETENCE_DEPENDENCY_BLOCKED",
  "COMPETENCE_DETAIL_RELATION",
  "COMPETENCE_DOCUMENT_AMBIGUOUS",
  "COMPETENCE_DOCUMENT_FAILED",
  "COMPETENCE_DOCUMENT_RELATION",
  "COMPETENCE_DOCUMENT_SHAPE",
  "COMPETENCE_EXISTING_REGISTRATION_LINK_UNAVAILABLE",
  "COMPETENCE_IO_CONFIGURATION",
  "COMPETENCE_LIST_NOT_ACTIVE",
  "COMPETENCE_MONTH",
  "COMPETENCE_OFFICIAL",
  "COMPETENCE_OPINION_AMBIGUOUS",
  "COMPETENCE_OPINION_FAILED",
  "COMPETENCE_OPINION_GATE",
  "COMPETENCE_OPINION_RELATION",
  "COMPETENCE_PACKAGE_EMPTY",
  "COMPETENCE_PACKAGE_ITEM_RELATION",
  "COMPETENCE_PACKAGE_RELATION",
  "COMPETENCE_PACKAGE_UNPROVEN",
  "COMPETENCE_PHASE_ABORTED",
  "COMPETENCE_PHASE_TIMEOUT",
  "COMPETENCE_PRESENTATION_GATE",
  "COMPETENCE_PRESENTATION_STATE",
  "COMPETENCE_READ_SHAPE",
  "COMPETENCE_REGISTER_GATE",
  "COMPETENCE_REGISTER_STATE_UNPROVEN",
  "COMPETENCE_REGISTER_UNCERTAIN",
  "COMPETENCE_RELATION",
  "COMPETENCE_REQUIREMENT_AMBIGUOUS",
  "COMPETENCE_REQUIREMENT_RULE",
  "COMPETENCE_RESULT_UNPROVEN",
  "COMPETENCE_REVIEW_CONTEXT",
  "COMPETENCE_REVIEW_DOCUMENT_VERSION",
  "COMPETENCE_REVIEW_EVIDENCE_AMBIGUOUS",
  "COMPETENCE_REVIEW_MATERIAL_UNPROVEN",
  "COMPETENCE_REVIEW_STALE",
  "COMPETENCE_RULE_UNPROVEN",
  "COMPETENCE_SNAPSHOT_SOURCE_RELATION",
  "COMPETENCE_SOURCE_ITEM",
  "COMPETENCE_SOURCE_LIST",
  "COMPETENCE_STALE_OBSERVATION",
  "COMPETENCE_TERMINAL",
  "DOCUMENT_CONFIGURATION",
  "DOCUMENT_RECONCILIATION",
  "DOCUMENT_REJECTED",
  "DOCUMENT_RUNTIME",
  "DOCUMENT_SESSION",
  "DOCUMENT_UNCERTAIN",
  "FLOW_ACTIVATE_DENIED",
  "FLOW_ACTIVE_NOT_READBACK",
  "FLOW_APPROVAL_NOT_READBACK",
  "FLOW_APPROVE_DENIED",
  "FLOW_BUTTON_UNAVAILABLE",
  "FLOW_CAPABILITY_OBSERVER_REQUIRED",
  "FLOW_CREATED_VERSION_NONUNIQUE",
  "FLOW_CREATED_VERSION_TEXT_MISMATCH",
  "FLOW_DUPLICATE_EQUIVALENT_VERSION",
  "FLOW_EQUIVALENT_VERSION_NONUNIQUE",
  "FLOW_FINAL_NOT_READY",
  "FLOW_LIST_CAPABILITY_DENIED",
  "FLOW_LIST_DUPLICATE",
  "FLOW_LIST_FORM_NONUNIQUE",
  "FLOW_LIST_STATE_MISMATCH",
  "FLOW_LIST_UI_MISSING",
  "FLOW_MODEL_CONTEXT",
  "FLOW_PAGE_LIMIT",
  "FLOW_PUBLICATION_NOT_READBACK",
  "FLOW_PUBLISHED_EMPTY_LIST",
  "FLOW_REGISTER_DENIED",
  "FLOW_ROW_ID",
  "FLOW_SOURCE_CAPABILITY_CONTEXT",
  "FLOW_SOURCE_CONTEXT",
  "FLOW_SOURCE_NONUNIQUE",
  "FLOW_SOURCE_NOT_IN_UI_GET",
  "FLOW_SOURCE_UI_MISSING",
  "FLOW_SOURCE_VERSION_MISMATCH",
  "FLOW_TXT_HASH",
  "FLOW_VERSION_CANDIDATE_UI_MISSING",
  "FLOW_VERSION_ID_HASH",
  "FLOW_VERSION_STATE",
  "FLOW_VERSION_TEXT_UI_MISSING",
  "FLOW_VERSION_TEXT_UNOBSERVED",
  "FLOW_VERSION_UI_MISSING",
  "FLOW_VERSION_READBACK_UNOBSERVED",
  "GATE_AMENDMENT",
  "INTENT_BUDGET",
  "INTENT_FROZEN",
  "INTENT_KEY",
  "INTENT_NOT_SENT",
  "INTENT_PAYLOAD",
  "INTENT_PENDING",
  "INTENT_PERSIST",
  "INTENT_PERSIST_REQUIRED",
  "INTENT_RESULT",
  "LOGIN_AUTH",
  "LOGIN_CONFIGURATION",
  "LOGIN_FAILED",
  "LOGIN_MASTER",
  "LOGOUT_FAILED",
  "OBSERVATION_ENDPOINT",
  "OBSERVATION_FAILED",
  "OBSERVATION_LIMIT",
  "OBSERVATION_METADATA",
  "OBSERVATION_RPC",
  "OBSERVATION_SCHEMA",
  "OBSERVATION_TABLE",
  "PHASE_CONFIGURATION",
  "PHASE_DENIED",
  "PHASE_TIMEOUT",
  "PREPARER_CAPABILITY",
  "PREPARER_CLI_USAGE",
  "PREPARER_CONTEXT",
  "PREPARER_IDENTITY",
  "PREPARER_INCOMPLETE",
  "PREPARER_MAIN_ONLY",
  "PREPARER_RECONCILIATION",
  "PREPARER_RESPONSE_UNCONFIRMED",
  "PREPARER_SCRIPT",
  "PREPARER_SPA_LINK",
  "PREPARER_SPA_PATH",
  "PREPARER_SSR_PATH",
  "RECEIPT_CONTEXT",
  "RECEIPT_HASH",
  "RECEIPT_IDENTITY",
  "RECEIPT_RPC",
  "RECEIPT_SCHEMA",
  "RECEIPT_STATE",
  "RECEIPT_UUID",
  "SESSION_CONTEXT",
  "UI_CAPABILITY",
  "UI_CONFIGURATION",
  "UI_RECONCILIATION",
  "UI_UNCERTAIN",
]);
async function runFixturePreparation() {
  let browser,
    proxy,
    fence,
    observer,
    runtime,
    page,
    logoutVerified = false,
    completed = false;
  let phase = "PREFLIGHT",
    result = null,
    sourceList = null,
    blockedCode = null;
  const output = resolve("artifacts/trilha-a-fixtures");
  await mkdir(output, { recursive: true });
  const receiptPath = join(output, "receipts.json");
  writeFileSync(
    receiptPath,
    JSON.stringify({ schema: "contaos.fixture.receipts.v1", receipts: [] }) + "\n",
    { mode: 0o600 },
  );
  const identity = {
    frontendSha: process.env.CONTAOS_FRONTEND_SHA,
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    deploymentId: process.env.CONTAOS_DEPLOYMENT_ID,
    workflowRun: process.env.GITHUB_RUN_ID,
  };
  try {
    const native = JSON.parse(await readFile(".audit-work/native-proof.json", "utf8"));
    const proof = JSON.parse(await readFile(".audit-work/provenance.json", "utf8"));
    const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    execFileSync("git", ["diff", "--quiet", "HEAD"], { stdio: "ignore" });
    if (!validatePreparerIdentity(process.env, proof, native, await harnessIdentity(), head))
      err("PREPARER_IDENTITY");
    for (const file of [
      "scripts/hml/prepare-visual-fixtures.mjs",
      "scripts/hml/prepare-visual-fixtures.test.mjs",
      ".github/workflows/contaos-trilha-a-fixtures.yml",
    ]) {
      const actual = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
      const expected = execFileSync("git", ["rev-parse", head + ":" + file], {
        encoding: "utf8",
      }).trim();
      if (actual !== expected) err("PREPARER_IDENTITY");
    }
    await checkFreshDeployment(proof, true);
    const persist = createReceiptWriter(receiptPath, identity);
    const broker = createIntentBroker({ persist, competenceGateAmended: true });
    const debug = createServer();
    await new Promise((resolve) => debug.listen(0, "127.0.0.1", resolve));
    const debugPort = debug.address().port;
    await new Promise((resolve) => debug.close(resolve));
    const { chromium } = await import("playwright");
    proxy = await startDestinationProxy();
    browser = await chromium.launch({
      chromiumSandbox: true,
      env: browserEnvironment(process.env),
      proxy: { server: proxy.url },
      args: [`--remote-debugging-port=${debugPort}`, "--proxy-bypass-list=<-loopback>"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    });
    page = await context.newPage();
    page.setDefaultTimeout(15000);
    let scriptError = false;
    page.on("pageerror", () => {
      scriptError = true;
    });
    const session = await context.newCDPSession(page),
      { targetInfo } = await session.send("Target.getTargetInfo");
    await session.detach();
    fence = await installNativeFence({
      debugPort,
      identity: targetInfo,
      policy: broker.policy,
      verifyResponse: (r) => verifyPublishedResponse(proof, r),
      closeContext: () => context.close(),
    });
    observer = createOfficialObserver(page);
    const fresh = async () => {
      await settleVerifiedPage(page, fence);
      await observer.flush();
      if (scriptError) err("PREPARER_SCRIPT");
    };
    const goKnown = async (path) => {
      if (!Object.hasOwn(proof.documents, path)) err("PREPARER_SSR_PATH");
      await checkFreshDeployment(proof, false);
      await navigateVerifiedPage(page, fence, FIXTURE.origin + path);
      await fresh();
    };
    const link = async (path) => {
      if (!/^\/(?:contratos|competencias)\/[a-f0-9-]{36}(?:\/[a-z0-9-]+)*$/.test(path))
        err("PREPARER_SPA_PATH");
      await fresh();
      if (page.url() === FIXTURE.origin + path) {
        if (Object.hasOwn(proof.documents, path)) {
          await goKnown(path);
          return;
        }
        await goKnown(`/contratos/${FIXTURE.contract}/competencias`);
      }
      const candidates = page.locator(`a[href="${path}"]:visible`);
      let selected = null;
      for (let n = 0; n < (await candidates.count()); n++) {
        const item = candidates.nth(n);
        if ((await item.isEnabled()) && (await item.getAttribute("aria-disabled")) !== "true") {
          selected = item;
          break;
        }
      }
      if (!selected) err("PREPARER_SPA_LINK");
      await selected.click();
      await page.waitForURL(FIXTURE.origin + path);
      await fresh();
    };
    let contextVerified = false;
    const verifyContext = async () => {
      await waitOrganization(page);
      let contracts;
      try {
        contracts = await observer.read("contratos", { id: FIXTURE.contract });
      } catch {
        contracts = [];
      }
      if (!contracts.length && !contextVerified) {
        await goKnown(`/contratos/${FIXTURE.contract}`);
        contracts = await observer.read("contratos", { id: FIXTURE.contract });
      }
      if (
        contracts.length !== 1 ||
        contracts[0].id_organizacao !== FIXTURE.organization ||
        contracts[0].id_contratante !== FIXTURE.contractor
      )
        return false;
      contextVerified = true;
      return true;
    };
    runtime = createRuntimeLogin({
      page,
      fence,
      waitOrganization,
      openOrganizationSelector: openVerifiedOrganizationSelector,
      verifyContext,
    });
    phase = "LOGIN";
    await runtime.login({
      email: process.env.CONTAOS_HML_SYNTHETIC_EMAIL,
      password: process.env.CONTAOS_HML_SYNTHETIC_PASSWORD,
    });
    const official = (row) => {
      if (
        obj(row) &&
        row.id === FIXTURE.contractualDocument &&
        row.id_contrato === FIXTURE.contract &&
        row.id_organizacao === undefined &&
        contextVerified
      )
        row = { ...row, id_organizacao: FIXTURE.organization };
      if (
        !obj(row) ||
        row.id_organizacao !== FIXTURE.organization ||
        row.id_contrato !== FIXTURE.contract
      )
        err("PREPARER_CONTEXT");
      return {
        ...row,
        official: true,
        current: true,
        organization: FIXTURE.organization,
        contract: FIXTURE.contract,
      };
    };
    const sourceCapabilities = async () => {
      await runtime.context();
      await fresh();
      const caps = await observer.rpcRead("consultar_permissoes_efetivas", {
        p_id_organizacao: FIXTURE.organization,
        p_id_contrato: FIXTURE.contract,
      });
      if (
        caps?.schema_versao !== "rbac-v1" ||
        caps.master !== true ||
        !Array.isArray(caps.permissoes)
      )
        err("PREPARER_CAPABILITY");
      const has = (acao) =>
        caps.permissoes.some((v) => v.recurso === "normativos" && v.acao === acao);
      return {
        id_organizacao: FIXTURE.organization,
        id_contrato: FIXTURE.contract,
        official: true,
        current: true,
        organization: FIXTURE.organization,
        contract: FIXTURE.contract,
        canRegister: has("editar"),
        canApprove: has("aprovar"),
        canActivate: has("editar") && has("aprovar"),
      };
    };
    const command = async ({ rpc, payload, evidence = {}, button, scope, confirmAfter }) => {
      await runtime.context();
      await fresh();
      if (typeof confirmAfter !== "function") err("PREPARER_RECONCILIATION");
      const verified = { context: true, capability: true, reconciled: true };
      let value;
      const operationGeneration = observer.generation();
      await confirmUiIntent({
        page,
        fence,
        broker,
        rpc,
        payload,
        evidence,
        button,
        scope,
        verified,
        settleVerifiedPage: async () => fresh(),
        reconcile: async (stage) => {
          if (stage === "before") {
            await runtime.context();
            return { payload, evidence, verified };
          }
          await fresh();
          if (!(await observer.observedAfter("rpc:" + rpc, {}, operationGeneration)))
            err("PREPARER_RESPONSE_UNCONFIRMED");
          value = await observer.rpcRead(rpc);
          return { confirmed: (await confirmAfter(value)) === true };
        },
      });
      return value;
    };
    const io = {
      page,
      fence,
      runtime,
      broker,
      fresh,
      goKnown,
      link,
      official,
      verifyContext,
      sourceCapabilities,
      command,
      read: observer.read,
      rpcRead: observer.rpcRead,
      generation: observer.generation,
      observedAfter: observer.observedAfter,
      wait: (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(2000, ms))),
      abortPhase: async () => {
        fence.close();
        await context.close();
      },
      text: await readFile(
        "docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
        "utf8",
      ),
    };
    phase = "SOURCE_AND_LIST";
    sourceList = await prepareSourceAndList(io);
    phase = "COMPETENCIES";
    result = await prepareCompetencies(io, sourceList);
    phase = "FINAL_READBACK";
    await runtime.context();
    await fresh();
    await checkFreshDeployment(proof, true);
    if (result?.state !== "confirmed") err("PREPARER_INCOMPLETE");
    completed = true;
  } catch (error) {
    blockedCode = PREPARER_FAILURE_CODES.has(error?.message)
      ? error.message
      : "PREPARER_UNCLASSIFIED";
    throw error;
  } finally {
    if (runtime) {
      try {
        logoutVerified = (await runtime.logout()) === true;
      } catch {
        logoutVerified = false;
      } finally {
        runtime.clear();
      }
    }
    observer?.close();
    fence?.close();
    await browser?.close().catch(() => {});
    await proxy?.close().catch(() => {});
    const safeIds = [];
    const collect = (value) => {
      if (uuid(value)) safeIds.push(value);
      else if (Array.isArray(value)) value.forEach(collect);
      else if (obj(value)) Object.values(value).forEach(collect);
    };
    let bindings = null;
    try {
      bindings = fixtureBindingReceipt(sourceList, result);
    } catch (error) {
      completed = false;
      blockedCode = PREPARER_FAILURE_CODES.has(error?.message) ? error.message : "BINDING_SCHEMA";
    }
    collect(bindings);
    const report = {
      schema: "contaos.fixture.preparation.v1",
      failure: blockedCode,
      bindings,
      ...identity,
      phase,
      completed: completed && logoutVerified,
      logoutVerified,
      ids: [...new Set(safeIds)].slice(0, 32),
      v1Certified: false,
    };
    writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n", {
      mode: 0o600,
    });
    let sums = "";
    for (const name of ["receipts.json", "report.json"])
      sums +=
        createHash("sha256")
          .update(await readFile(join(output, name)))
          .digest("hex") +
        "  " +
        name +
        "\n";
    writeFileSync(join(output, "SHA256SUMS"), sums, { mode: 0o600 });
  }
  if (!completed || !logoutVerified) err("PREPARER_INCOMPLETE");
}

export function fixtureBindingReceipt(sourceList, result) {
  if (sourceList === null && result === null) return null;
  const binding = {};
  for (const key of ["sourceVersionId", "listId", "listVersionId", "itemId"]) {
    if (!uuid(sourceList?.[key])) err("BINDING_ID");
    binding[key] = sourceList[key];
  }
  binding.organization = FIXTURE.organization;
  binding.contract = FIXTURE.contract;
  binding.source = FIXTURE.source;
  if (result === null) return binding;
  if (
    !["partial", "confirmed"].includes(result.state) ||
    !Array.isArray(result.competencies) ||
    result.competencies.length !== 2
  )
    err("BINDING_SCHEMA");
  const seen = new Set();
  binding.competencies = result.competencies.map((c) => {
    if (
      !months.includes(c.month) ||
      seen.has(c.month) ||
      !["partial", "pode_apresentar_contratante", "aguardando_contratante"].includes(c.state)
    )
      err("BINDING_SCHEMA");
    seen.add(c.month);
    const row = { month: c.month, state: c.state };
    for (const key of [
      "id",
      "requirementId",
      "documentId",
      "documentVersionId",
      "executionId",
      "opinionId",
      "presentationId",
      "packageId",
    ]) {
      if (c[key] !== undefined && c[key] !== null) {
        if (!uuid(c[key])) err("BINDING_ID");
        row[key] = c[key];
      }
    }
    if (c.packageHash !== undefined) {
      if (!HASH.test(c.packageHash)) err("BINDING_HASH");
      row.packageHash = c.packageHash;
    }
    if (c.code !== undefined) {
      if (!/^COMPETENCE_[A-Z_]{1,64}$/.test(c.code)) err("BINDING_CODE");
      row.code = c.code;
    }
    if (c.state !== "partial" && !uuid(c.id)) err("BINDING_ID");
    if (
      c.month === "2026-09-01" &&
      c.state === "aguardando_contratante" &&
      (!uuid(c.presentationId) || !uuid(c.packageId) || !HASH.test(c.packageHash))
    )
      err("BINDING_PACKAGE");
    return row;
  });
  return binding;
}

export async function runCli(args = process.argv.slice(2)) {
  if (!Array.isArray(args) || args.length !== 1 || args[0] !== "--prepare-fixtures")
    err("PREPARER_CLI_USAGE");
  if (process.env.GITHUB_EVENT_NAME === "workflow_run")
    await verifySingleRequest({ operation: "fixtures", publicOnly: true });
  if (!preparerEventAllowed(process.env)) err("PREPARER_MAIN_ONLY");
  return runFixturePreparation();
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch(() => {
    process.stderr.write("FIXTURE_PREPARATION_INCOMPLETE\n");
    process.exitCode = 1;
  });
}

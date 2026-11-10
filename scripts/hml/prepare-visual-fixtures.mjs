/** Dedicated fixture preparer. Never imported by the read-only audit CLI. */
import { createHash, randomUUID } from "node:crypto";
import { isProxy } from "node:util/types";
import { writeFileSync, renameSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { readFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import {
  requestAllowed,
  singleRequestEventAllowed,
  loadSingleRequestProof,
  R15_RECOVERY_DOCUMENT,
  validateR15RecoveryDocument,
  R16_RECOVERY_DOCUMENT,
  validateR16RecoveryDocument,
  R17_RECOVERY_DOCUMENT,
  validateR17RecoveryDocument,
  R13_RECOVERY_DOCUMENT,
  validateR13RecoveryDocument,
  R4_ZERO_AUTH_PROOF,
  validateR4ZeroAuthProof,
  getValidatedR4ZeroAuth,
  R7_ZERO_AUTH_PROOF,
  getValidatedR7ZeroAuth,
  assertPrivateRequestEnvironment,
  HML_ORIGIN,
  API_ORIGIN,
  nativeProofValid,
  harnessIdentity,
  checkFreshDeployment,
  startDestinationProxy,
  launchNativeBrowser,
  installNativeFence,
  verifyPublishedResponse,
  settleVerifiedPage,
  navigateVerifiedPage,
  waitOrganization,
  openVerifiedOrganizationSelector,
} from "./authenticated-visual-audit.mjs";

export {
  R13_RECOVERY_DOCUMENT,
  validateR13RecoveryDocument,
  R15_RECOVERY_DOCUMENT,
  validateR15RecoveryDocument,
  R16_RECOVERY_DOCUMENT,
  validateR16RecoveryDocument,
  R17_RECOVERY_DOCUMENT,
  validateR17RecoveryDocument,
};

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

export const R1_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.receipts.v1",
  receipts: [
    {
      frontendSha: "866608620909bf313a6c2192736330222f9219ad",
      harnessSha: "fca0798d3eba81e8daa3a876a255f34b66ff39f9",
      deploymentId: "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",
      workflowRun: "42540864527",
      schema: "contaos.fixture.intent.v1",
      rpc: "registrar_versao_fonte_v107",
      requestId: "08141ffd-56c1-4c50-b58f-32912d1006b2",
      state: "sealed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "b27048ba9358c4dea53acf3dc7bc8ee855cc75d6795f7ea7fa2b67681c7c7467",
    },
    {
      frontendSha: "866608620909bf313a6c2192736330222f9219ad",
      harnessSha: "fca0798d3eba81e8daa3a876a255f34b66ff39f9",
      deploymentId: "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",
      workflowRun: "42540864527",
      schema: "contaos.fixture.intent.v1",
      rpc: "registrar_versao_fonte_v107",
      requestId: "08141ffd-56c1-4c50-b58f-32912d1006b2",
      state: "confirmed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "b27048ba9358c4dea53acf3dc7bc8ee855cc75d6795f7ea7fa2b67681c7c7467",
    },
    {
      frontendSha: "866608620909bf313a6c2192736330222f9219ad",
      harnessSha: "fca0798d3eba81e8daa3a876a255f34b66ff39f9",
      deploymentId: "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",
      workflowRun: "42540864527",
      schema: "contaos.fixture.intent.v1",
      rpc: "aprovar_versao_fonte_v107",
      requestId: "437a3c66-4bed-45e3-b73e-8696bdf4a791",
      state: "sealed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "e02b9e79eac299f949cfd95f2da29b415efad1249c8c5447b49f59110a197769",
    },
    {
      frontendSha: "866608620909bf313a6c2192736330222f9219ad",
      harnessSha: "fca0798d3eba81e8daa3a876a255f34b66ff39f9",
      deploymentId: "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",
      workflowRun: "42540864527",
      schema: "contaos.fixture.intent.v1",
      rpc: "aprovar_versao_fonte_v107",
      requestId: "437a3c66-4bed-45e3-b73e-8696bdf4a791",
      state: "confirmed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "e02b9e79eac299f949cfd95f2da29b415efad1249c8c5447b49f59110a197769",
    },
  ],
});
const R1_RECEIPTS_SHA256 = "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9";
const recoveryProofs = new WeakSet();
const recoveryBrokerOwners = new WeakMap(),
  recoveryOpinionProofs = new WeakMap();
function claimRecoveryOpinion(owner, token) {
  const broker = recoveryBrokerOwners.get(owner),
    record = recoveryOpinionProofs.get(token);
  if (
    !broker ||
    !record ||
    record.owner !== owner ||
    record.consumed ||
    !broker.identity ||
    !same(record.identity, broker.identity) ||
    record.documentHash !== "f3cf2c1eae15d5e7185ff665a8899f14898ed4b8b7188b5446646e7f2f0f1c95"
  )
    err("RECOVERY_R11_OPINION");
  record.check();
  record.consumed = true;
  broker.opinion = token;
}
function assertRecoveryOpinion(owner) {
  const broker = recoveryBrokerOwners.get(owner),
    record = recoveryOpinionProofs.get(broker?.opinion);
  if (!broker || !record || record.owner !== owner || !record.consumed) err("RECOVERY_R11_OPINION");
  record.check();
  return true;
}
export function validateR1RecoveryDocument(input) {
  const bytes = JSON.stringify(input, null, 2) + "\n";
  if (hash(bytes) !== R1_RECEIPTS_SHA256) err("RECOVERY_LEDGER");
  if (
    !keys(input, ["schema", "receipts"]) ||
    input.schema !== "contaos.fixture.receipts.v1" ||
    !Array.isArray(input.receipts) ||
    input.receipts.length !== 4
  )
    err("RECOVERY_LEDGER");
  for (const receipt of input.receipts) safeReceipt(receipt);
  return freeze(structuredClone(input));
}

export async function readCompetenceMonth(io, month, navigate) {
  if (
    !months.includes(month) ||
    typeof navigate !== "function" ||
    typeof io.readBarrier !== "function" ||
    typeof io.assertReadBarrier !== "function" ||
    typeof io.readBarrierRemaining !== "function" ||
    typeof io.drainReads !== "function"
  )
    err("OBSERVATION_ORDINAL");
  const select = EXACT_SELECTS.competencias.find((v) => v.includes("competencia_referencia,"));
  return io.readBarrier(async (budget) => {
    const guard = () => io.assertReadBarrier(budget);
    guard();
    const initial = io.generation();
    await navigate(budget);
    guard();
    await io.observedAfter("competencias", { id_contrato: FIXTURE.contract }, initial, {
      select,
      readBudget: budget,
    });
    guard();
    await io.fresh();
    guard();
    await io.drainReads(budget);
    guard();
    const after = io.generation();
    guard();
    await io.page
      .getByLabel("Competência", { exact: true })
      .fill(month.slice(0, 7), { timeout: io.readBarrierRemaining(budget) });
    guard();
    const rows = await io.read(
      "competencias",
      { id_contrato: FIXTURE.contract, competencia_referencia: month },
      { select, after, queryScope: "RECOVERY_COMPETENCE_MONTH", readBudget: budget },
    );
    guard();
    return rows;
  });
}

export async function reconcileRecoveryCompetencies(io, captureOpinion) {
  validateR5RecoveryDocument(io.recoveryLedgerR5);
  validateR6RecoveryDocument(io.recoveryLedgerR6);
  validateR7RecoveryDocument(io.recoveryLedgerR7);
  validateR8RecoveryDocument(io.recoveryLedgerR8);
  validateR9RecoveryDocument(io.recoveryLedgerR9);
  validateR10RecoveryDocument(io.recoveryLedgerR10);
  validateR13RecoveryDocument(io.recoveryLedgerR13);
  validateR15RecoveryDocument(io.recoveryLedgerR15);
  validateR16RecoveryDocument(io.recoveryLedgerR16);
  validateR17RecoveryDocument(io.recoveryLedgerR17);
  validateR11RecoveryDocument(io.recoveryLedgerR11);
  if (
    captureOpinion !== undefined &&
    (typeof captureOpinion !== "function" || isProxy(captureOpinion))
  )
    err("RECOVERY_R11_OPINION");
  const result = [];
  for (const month of months) {
    const rows = await readCompetenceMonth(io, month, (budget) =>
      io.goKnown("/contratos/" + FIXTURE.contract + "/competencias", budget),
    );
    if (!(
      Array.isArray(rows) &&
      rows.length === 1 &&
      rows[0].id === R5_BINDINGS.competencies.find((c) => c.month === month)?.id &&
      rows.every(
        (row) =>
          uuid(row.id) && row.id !== FIXTURE.historical && row.competencia_referencia === month,
      )
    ))
      err("RECOVERY_STATE");
    if (rows.length) {
      const detailAfter = io.generation();
      await io.link("/competencias/" + rows[0].id);
      await io.observedAfter(
        "obter_visao_geral_competencia",
        { p_id_competencia: rows[0].id },
        detailAfter,
      );
      const value = await io.rpcRead(
        "obter_visao_geral_competencia",
        { p_id_competencia: rows[0].id },
        { after: detailAfter },
      );
      const c = value?.competencia;
      if (!(
        c?.id === rows[0].id &&
        c.id_organizacao === FIXTURE.organization &&
        c.id_contrato === FIXTURE.contract &&
        c.competencia_referencia === month &&
        !["cancelada", "encerrada"].includes(c.situacao)
      ))
        err("RECOVERY_STATE");
    }
    if (month === R5_BINDINGS.competencies[0].month && captureOpinion) {
      const opinionProof = await tracedPreparation("RECOVERY_READ", () =>
        reconcileRecoveryOpinion(io),
      );
      captureOpinion(opinionProof);
    }
    result.push({ month, id: rows[0].id, observed: true, count: rows.length });
  }
  return result;
}

export async function reconcileRecoveryOpinion(io) {
  validateR13RecoveryDocument(io.recoveryLedgerR13);
  validateR15RecoveryDocument(io.recoveryLedgerR15);
  validateR16RecoveryDocument(io.recoveryLedgerR16);
  validateR17RecoveryDocument(io.recoveryLedgerR17);
  validateR11RecoveryDocument(io.recoveryLedgerR11);
  if (
    ["generation", "link", "fresh", "observedAfter", "sealRecoveryOpinion", "rpcRead"].some(
      (name) => typeof io[name] !== "function",
    )
  )
    err("RECOVERY_R16_OPINION");
  const after = io.generation();
  for (const c of JSON.parse(R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies) {
    const found = await readCompetenceMonth(io, c.month, (budget) =>
      io.goKnown("/contratos/" + FIXTURE.contract + "/competencias", budget),
    );
    if (!Array.isArray(found) || found.length !== 1 || found[0].id !== c.id)
      err("RECOVERY_R16_OPINION");
    const overviewOrdinal = io.generation();
    await tracedPreparation("RECOVERY_READ", () => io.link("/competencias/" + c.id));
    await tracedPreparation("RECOVERY_READ", () => io.fresh());
    if (c.month === "2026-10-01") {
      await tracedPreparation("RECOVERY_READ", () =>
        io.observedAfter(
          "obter_visao_geral_competencia",
          { p_id_competencia: c.id },
          overviewOrdinal,
        ),
      );
      await tracedPreparation("RECOVERY_READ", () =>
        io.rpcRead(
          "obter_visao_geral_competencia",
          { p_id_competencia: c.id },
          { after: overviewOrdinal },
        ),
      );
    }
    for (const [area, rpc] of [
      ["documentos", "obter_documentos_competencia_v115"],
      ["analise", "obter_analise_competencia_v116"],
    ]) {
      const ordinal = io.generation();
      await tracedPreparation("RECOVERY_READ", () => io.link("/competencias/" + c.id + "/" + area));
      await tracedPreparation("RECOVERY_READ", () => io.fresh());
      await tracedPreparation("RECOVERY_READ", () =>
        io.observedAfter(rpc, { p_id_competencia: c.id }, ordinal),
      );
      await tracedPreparation("RECOVERY_READ", () =>
        io.rpcRead(rpc, { p_id_competencia: c.id }, { after: ordinal }),
      );
    }
    const ordinal = io.generation();
    await tracedPreparation("RECOVERY_READ", () => io.link("/competencias/" + c.id + "/parecer"));
    await tracedPreparation("RECOVERY_READ", () => io.fresh());
    await tracedPreparation("RECOVERY_READ", () =>
      io.observedAfter(
        "pareceres_internos",
        {
          id_competencia: c.id,
          id_organizacao: FIXTURE.organization,
          id_contrato: FIXTURE.contract,
        },
        ordinal,
        { select: EXACT_SELECTS.pareceres_internos[0] },
      ),
    );
  }
  return io.sealRecoveryOpinion(after);
}

export function reconcileR1Recovery(input) {
  validateR1RecoveryDocument(input?.ledger);
  validateR3RecoveryDocument(input?.ledgerR3);
  validateR4RecoveryDocument(input?.ledgerR4);
  validateR5RecoveryDocument(input?.ledgerR5);
  validateR6RecoveryDocument(input?.ledgerR6);
  validateR7RecoveryDocument(input?.ledgerR7);
  validateR8RecoveryDocument(input?.ledgerR8);
  validateR9RecoveryDocument(input?.ledgerR9);
  validateR10RecoveryDocument(input?.ledgerR10);
  validateR13RecoveryDocument(input?.ledgerR13);
  validateR15RecoveryDocument(input?.ledgerR15);
  validateR16RecoveryDocument(input?.ledgerR16);
  validateR17RecoveryDocument(input?.ledgerR17);
  validateR11RecoveryDocument(input?.ledgerR11);
  const expected = R5_BINDINGS;
  if (
    input.listCount !== 1 ||
    input.listState?.id !== expected.listId ||
    input.listState?.versionId !== expected.listVersionId ||
    input.listState?.itemId !== expected.itemId ||
    input.version?.id !== expected.sourceVersionId ||
    input.version?.hash !== JSON.parse(R5_RECOVERY_DOCUMENT.reportRaw).recovery.sourceHash ||
    !Array.isArray(input.competencies) ||
    !expected.competencies.every((c) =>
      input.competencies.some(
        (r) => r.month === c.month && r.id === c.id && r.count === 1 && r.observed === true,
      ),
    )
  )
    err("RECOVERY_STATE");
  if (
    !Array.isArray(input.competencies) ||
    input.competencies.length !== months.length ||
    !months.every(
      (month, i) =>
        input.competencies[i]?.month === month &&
        input.competencies[i].observed === true &&
        [0, 1].includes(input.competencies[i].count),
    )
  )
    err("RECOVERY_STATE");
  const s = input.source,
    v = input.version;
  if (
    input.sourceCount !== 1 ||
    !official(s) ||
    s.id !== FIXTURE.source ||
    s.situacao !== "ativa" ||
    !sourceFieldsExact(s) ||
    !Number.isInteger(s.version) ||
    s.version < 1 ||
    !official(v) ||
    !uuid(v.id) ||
    v.source !== FIXTURE.source ||
    !HASH.test(v.hash || "") ||
    v.approved !== true ||
    v.textVerified !== true ||
    v.effective !== true ||
    v.file !== null ||
    input.listObserved !== true ||
    ![0, 1].includes(input.listCount)
  )
    err("RECOVERY_STATE");
  if (
    input.listCount === 0
      ? input.canCreateList !== true
      : !(
          input.listState?.verified === true &&
          input.listState.active === true &&
          input.listState.published === true &&
          input.listState.ruleVerified === true &&
          input.listState.sourceVersion === v.id
        )
  )
    err("RECOVERY_LIST");
  const proof = freeze({
    schema: "contaos.fixture.recovery.v1",
    sourceVersion: v.id,
    sourceHash: v.hash,
    ledgerSha256: R1_RECEIPTS_SHA256,
  });
  recoveryProofs.add(proof);
  return proof;
}
export const R2_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r2.v1",
  workflowRun: "42553093050",
  artifactId: "13645999071",
  requestId: "trilha-a-fixtures-20261109-r2",
  frontendSha: "437c788e32f0325dd15c9d2e7277c10129bcb462",
  harnessSha: "bc14a9e232bf5abab07f71635866ea586e4ade37",
  zipSha256: "c6b33596bd1454388d0989506c74ccbaece749d0c4bcf0b45fbdb0f692927475",
  reportSha256: "d986f375e1cba68be5f78b61544d241ef5f4c71f126611112c960226a939e805",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  derivedIntentCount: 0,
  proof: "receipts+brokerInvariant+sourcePath",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "PREPARER_TIMEOUT",\n  "diagnostics": {\n    "primaryFailure": "PREPARER_TIMEOUT",\n    "failureClass": "TIMEOUT",\n    "errorName": "TimeoutError",\n    "subphase": "SOURCE_FORM_FIELD",\n    "subphasePath": [\n      "SOURCE_AND_LIST",\n      "SOURCE_FORM_FIELD"\n    ],\n    "lastCompletedSubphase": "SOURCE_UI_CONTROL",\n    "logoutAttempted": true,\n    "logoutVerified": false,\n    "cleanupFailure": "LOGOUT_FAILED"\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 2,\n    "maxNewIntentions": 22,\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": null,\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "bc14a9e232bf5abab07f71635866ea586e4ade37",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42553093050",\n  "phase": "SOURCE_AND_LIST",\n  "completed": false,\n  "logoutVerified": false,\n  "ids": [],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
});
export function validateR2RecoveryDocument(input) {
  if (
    !same(input, R2_RECOVERY_DOCUMENT) ||
    hash(input?.reportRaw) !== R2_RECOVERY_DOCUMENT.reportSha256 ||
    hash(input?.receiptsRaw) !== R2_RECOVERY_DOCUMENT.receiptsSha256
  )
    err("RECOVERY_R2_LEDGER");
  const report = JSON.parse(input.reportRaw),
    receipts = JSON.parse(input.receiptsRaw);
  if (
    !keys(receipts, ["schema", "receipts"]) ||
    receipts.schema !== "contaos.fixture.receipts.v1" ||
    !Array.isArray(receipts.receipts) ||
    receipts.receipts.length !== 0 ||
    report.completed !== false ||
    report.recovery?.reconciled !== true ||
    report.diagnostics?.subphase !== "SOURCE_FORM_FIELD" ||
    report.diagnostics?.lastCompletedSubphase !== "SOURCE_UI_CONTROL" ||
    Object.hasOwn(report, "intentCount")
  )
    err("RECOVERY_R2_LEDGER");
  return freeze(structuredClone(input));
}
export const R3_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r3.v1",
  workflowRun: "42559214436",
  artifactId: "13648722477",
  requestId: "trilha-a-fixtures-20261109-r3",
  frontendSha: "437c788e32f0325dd15c9d2e7277c10129bcb462",
  harnessSha: "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",
  zipSha256: "44cd6eec0dcec9cf5ceaa2283d8a07b04cf64e8c1391ad2c6a5aaed32104c560",
  reportSha256: "e1d0cabcd5aeec18a695627c5b06ef49e36dba262117390e1fddb8ec04555931",
  receiptsSha256: "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "FLOW_ACTIVE_NOT_READBACK",\n  "diagnostics": {\n    "primaryFailure": "FLOW_ACTIVE_NOT_READBACK",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "SOURCE_AND_LIST",\n    "subphasePath": [\n      "SOURCE_AND_LIST"\n    ],\n    "lastCompletedSubphase": "SOURCE_RECONCILE",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 2,\n    "maxNewIntentions": 22,\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": null,\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42559214436",\n  "phase": "SOURCE_AND_LIST",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    }\n  ]\n}\n',
  receipts: [
    {
      frontendSha: "437c788e32f0325dd15c9d2e7277c10129bcb462",
      harnessSha: "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",
      deploymentId: "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",
      workflowRun: "42559214436",
      schema: "contaos.fixture.intent.v1",
      rpc: "salvar_fonte_normativa_v107",
      requestId: "309caf6c-5551-4e2b-ae33-4607a95ea025",
      state: "sealed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34",
    },
    {
      frontendSha: "437c788e32f0325dd15c9d2e7277c10129bcb462",
      harnessSha: "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",
      deploymentId: "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",
      workflowRun: "42559214436",
      schema: "contaos.fixture.intent.v1",
      rpc: "salvar_fonte_normativa_v107",
      requestId: "309caf6c-5551-4e2b-ae33-4607a95ea025",
      state: "confirmed",
      organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
      contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
      payloadSha256: "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34",
    },
  ],
});

export function validateR3RecoveryDocument(input) {
  if (
    !same(input, R3_RECOVERY_DOCUMENT) ||
    hash(input?.reportRaw) !== R3_RECOVERY_DOCUMENT.reportSha256 ||
    hash(input?.receiptsRaw) !== R3_RECOVERY_DOCUMENT.receiptsSha256
  )
    err("RECOVERY_R3_LEDGER");
  const report = JSON.parse(input.reportRaw),
    original = JSON.parse(input.receiptsRaw);
  if (
    !keys(original, ["schema", "receipts"]) ||
    original.schema !== "contaos.fixture.receipts.v1" ||
    !same(original.receipts, input.receipts) ||
    input.receipts.length !== 2 ||
    report.workflowRun !== input.workflowRun ||
    report.harnessSha !== input.harnessSha ||
    report.frontendSha !== input.frontendSha ||
    report.failure !== "FLOW_ACTIVE_NOT_READBACK" ||
    report.logoutVerified !== true ||
    report.completed !== false
  )
    err("RECOVERY_R3_LEDGER");
  for (const [i, receipt] of input.receipts.entries()) {
    safeReceipt(receipt);
    if (
      receipt.rpc !== "salvar_fonte_normativa_v107" ||
      receipt.requestId !== "309caf6c-5551-4e2b-ae33-4607a95ea025" ||
      receipt.state !== ["sealed", "confirmed"][i] ||
      receipt.payloadSha256 !== "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"
    )
      err("RECOVERY_R3_LEDGER");
  }
  return freeze(structuredClone(input));
}
export const R4_RECOVERY_DOCUMENT = freeze({ ...R4_ZERO_AUTH_PROOF });
export function validateR4RecoveryDocument(input) {
  validateR4ZeroAuthProof(input);
  if (!same(input, R4_RECOVERY_DOCUMENT)) err("RECOVERY_R4_PROOF");
  return freeze(structuredClone(input));
}

export const R5_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r5.v1",
  workflowRun: "42578223154",
  artifactId: "13656530451",
  requestId: "trilha-a-fixtures-20261109-r5",
  harnessSha: "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",
  zipSha256: "5380c9c1a5b18e75e7a0e09e41902c826eae0a9cb1f9589f7f34a819f463985b",
  reportSha256: "c631d266351fa609600dbcdbe60f1d1a54d8fac76e740c10d80017277a6f55ba",
  receiptsSha256: "fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "PREPARER_INCOMPLETE",\n  "diagnostics": {\n    "primaryFailure": "PREPARER_INCOMPLETE",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "PREFLIGHT",\n    "subphasePath": [],\n    "lastCompletedSubphase": "PREFLIGHT",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 8,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 3,\n    "newArmedCount": 5,\n    "maxIntentions": 24,\n    "maxNewIntentions": 21\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 3,\n    "maxNewIntentions": 21,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "id": "79bdc139-ed10-4c91-905e-b32b9a824d27",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42578223154",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "79bdc139-ed10-4c91-905e-b32b9a824d27"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "da4e924e-2ed1-4ccd-b847-fc95a44cc383",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "da4e924e-2ed1-4ccd-b847-fc95a44cc383",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "31ddaf25-fb66-4cdc-be84-8612e77b17dc",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "31ddaf25-fb66-4cdc-be84-8612e77b17dc",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "cf429997-d0b6-45bd-880a-be4b103f79bb",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "cf429997-d0b6-45bd-880a-be4b103f79bb",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "499dc2a2-c0a2-4a19-9ccb-11c534096f7e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "499dc2a2-c0a2-4a19-9ccb-11c534096f7e",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "655ae00f-ed36-4a13-a637-bc8b77375783",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "655ae00f-ed36-4a13-a637-bc8b77375783",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415"\n    }\n  ]\n}\n',
});
export function validateR5RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R5_LEDGER");
  let descriptors;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input);
  } catch {
    err("RECOVERY_R5_LEDGER");
  }
  const names = Object.keys(R5_RECOVERY_DOCUMENT);
  if (Reflect.ownKeys(descriptors).length !== names.length) err("RECOVERY_R5_LEDGER");
  const clean = {};
  for (const key of names) {
    const d = descriptors[key];
    if (!d || !Object.hasOwn(d, "value") || typeof d.value !== "string") err("RECOVERY_R5_LEDGER");
    clean[key] = d.value;
  }
  if (
    !same(clean, R5_RECOVERY_DOCUMENT) ||
    hash(clean.reportRaw) !== R5_RECOVERY_DOCUMENT.reportSha256 ||
    hash(clean.receiptsRaw) !== R5_RECOVERY_DOCUMENT.receiptsSha256
  )
    err("RECOVERY_R5_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts, null, 2) + "\n" !== clean.receiptsRaw ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    !same(report.intentLedger, {
      count: 8,
      frozen: false,
      pending: false,
      sent: false,
      priorConfirmed: 3,
      newArmedCount: 5,
      maxIntentions: 24,
      maxNewIntentions: 21,
    }) ||
    !keys(receipts, ["schema", "receipts"]) ||
    receipts.schema !== "contaos.fixture.receipts.v1" ||
    receipts.receipts.length !== 10
  )
    err("RECOVERY_R5_LEDGER");
  const historical = new Set(
    [...R1_RECOVERY_DOCUMENT.receipts, ...R3_RECOVERY_DOCUMENT.receipts].map((r) => r.requestId),
  );
  const ids = new Set();
  for (let i = 0; i < 10; i += 2) {
    const sealed = receipts.receipts[i],
      confirmed = receipts.receipts[i + 1];
    safeReceipt(sealed);
    safeReceipt(confirmed);
    if (
      !keys(sealed, [
        "frontendSha",
        "harnessSha",
        "deploymentId",
        "workflowRun",
        "schema",
        "rpc",
        "requestId",
        "state",
        "organization",
        "contract",
        "payloadSha256",
      ]) ||
      !same({ ...sealed, state: "confirmed" }, confirmed) ||
      sealed.state !== "sealed" ||
      confirmed.state !== "confirmed" ||
      historical.has(sealed.requestId) ||
      ids.has(sealed.requestId) ||
      sealed.workflowRun !== clean.workflowRun ||
      sealed.harnessSha !== report.harnessSha ||
      sealed.frontendSha !== report.frontendSha ||
      sealed.deploymentId !== report.deploymentId ||
      sealed.organization !== FIXTURE.organization ||
      sealed.contract !== FIXTURE.contract ||
      sealed.rpc !== (i < 6 ? "executar_comando_lista_v1" : "criar_competencia")
    )
      err("RECOVERY_R5_LEDGER");
    ids.add(sealed.requestId);
  }
  return freeze(clean);
}
const R5_BINDINGS = freeze(JSON.parse(R5_RECOVERY_DOCUMENT.reportRaw).bindings);
export const R6_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r6.v1",
  workflowRun: "42585173702",
  artifactId: "13658434738",
  requestId: "trilha-a-fixtures-20261109-r6",
  harnessSha: "9cd01a472146c67c4a3cae5f3d9a6b5d7448716a",
  zipSha256: "10e55ed5856aac2879188ab5f2df3b1f4a98b180de21dd7abcb470c162f9d68c",
  reportSha256: "8fd354bf2177f47a7b124a9d53e606de91880a45b2d94daebe46185403ebbeff",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "FLOW_BUTTON_UNAVAILABLE",\n  "diagnostics": {\n    "primaryFailure": "FLOW_BUTTON_UNAVAILABLE",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "SOURCE_UI_CONTROL",\n    "subphasePath": [\n      "SOURCE_AND_LIST",\n      "RECOVERY_READ",\n      "SOURCE_UI_CONTROL",\n      "SOURCE_UI_CONTROL"\n    ],\n    "lastCompletedSubphase": "SOURCE_UI_CONTROL",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 8,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 8,\n    "newArmedCount": 0,\n    "maxIntentions": 24,\n    "maxNewIntentions": 16\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 8,\n    "maxNewIntentions": 16,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": false,\n    "sourceVersion": null,\n    "sourceHash": null\n  },\n  "bindings": null,\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "9cd01a472146c67c4a3cae5f3d9a6b5d7448716a",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42585173702",\n  "phase": "SOURCE_AND_LIST",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
});
export function validateR6RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R6_LEDGER");
  let descriptors;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input);
  } catch {
    err("RECOVERY_R6_LEDGER");
  }
  const names = Object.keys(R6_RECOVERY_DOCUMENT),
    clean = {};
  if (Reflect.ownKeys(descriptors).length !== names.length) err("RECOVERY_R6_LEDGER");
  for (const key of names) {
    const descriptor = descriptors[key];
    if (!descriptor || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "string")
      err("RECOVERY_R6_LEDGER");
    clean[key] = descriptor.value;
  }
  if (
    !same(clean, R6_RECOVERY_DOCUMENT) ||
    hash(JSON.stringify(clean, null, 2) + "\n") !==
      "98136adfe0c84c274ca31534b847b640a35f2577d2ad6197e451324a51ac7e03" ||
    hash(clean.reportRaw) !== R6_RECOVERY_DOCUMENT.reportSha256 ||
    hash(clean.receiptsRaw) !== R6_RECOVERY_DOCUMENT.receiptsSha256
  )
    err("RECOVERY_R6_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts) + "\n" !== clean.receiptsRaw ||
    !same(receipts, { schema: "contaos.fixture.receipts.v1", receipts: [] }) ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.failure !== "FLOW_BUTTON_UNAVAILABLE" ||
    report.phase !== "SOURCE_AND_LIST" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.logoutAttempted !== true ||
    report.diagnostics.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    report.bindings !== null ||
    !same(report.ids, []) ||
    !same(report.intentLedger, {
      count: 8,
      frozen: false,
      pending: false,
      sent: false,
      priorConfirmed: 8,
      newArmedCount: 0,
      maxIntentions: 24,
      maxNewIntentions: 16,
    }) ||
    report.recovery.reconciled !== false ||
    report.recovery.sourceVersion !== null ||
    report.recovery.sourceHash !== null ||
    report.recovery.confirmedBefore !== 8 ||
    report.recovery.maxNewIntentions !== 16
  )
    err("RECOVERY_R6_LEDGER");
  validateR4RecoveryDocument(report.recovery.r4ZeroAuth);
  return freeze(clean);
}

export const R8_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r8.v1",
  workflowRun: "42611391440",
  artifactId: "13670961904",
  requestId: "trilha-a-fixtures-20261109-r8",
  harnessSha: "dea3ab73c9b47de1126054380b002c37b060ff84",
  zipSha256: "698e58fe9184b194cc1866b4c119d4df45ba23ccc5704665469a99793cce2fa9",
  reportSha256: "e913478993f895726f9e207c975533ee4a6fd3d9dac8dd0a319919fcf06c67cb",
  receiptsSha256: "20af329dd9c441e4ede575fa6cb94a65c3d136ad777613170045c696328fad25",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "OBSERVATION_FAILED",\n  "diagnostics": {\n    "primaryFailure": "OBSERVATION_FAILED",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "RUNTIME_FRESH",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_RECONCILE",\n      "COMPETENCY_RECONCILE",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "RUNTIME_FRESH",\n      "RUNTIME_FRESH"\n    ],\n    "lastCompletedSubphase": "RUNTIME_FRESH",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 10,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 8,\n    "newArmedCount": 2,\n    "maxIntentions": 24,\n    "maxNewIntentions": 16\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 8,\n    "maxNewIntentions": 16,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42611391440",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "6d730eb7-8c38-4474-813d-d39672454444",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "6d730eb7-8c38-4474-813d-d39672454444",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1"\n    }\n  ]\n}\n',
});
export function validateR8RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R8_LEDGER");
  const descriptors = Object.getOwnPropertyDescriptors(input),
    names = Object.keys(R8_RECOVERY_DOCUMENT),
    clean = {};
  if (Reflect.ownKeys(descriptors).length !== names.length) err("RECOVERY_R8_LEDGER");
  for (const key of names) {
    const d = descriptors[key];
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true || typeof d.value !== "string")
      err("RECOVERY_R8_LEDGER");
    clean[key] = d.value;
  }
  if (
    !same(clean, R8_RECOVERY_DOCUMENT) ||
    hash(JSON.stringify(clean, null, 2) + "\n") !==
      "b22c0e464915cd58f8d9918a2c4751078dbf73578528e833afd92fa646502884" ||
    hash(clean.reportRaw) !== clean.reportSha256 ||
    hash(clean.receiptsRaw) !== clean.receiptsSha256
  )
    err("RECOVERY_R8_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts, null, 2) + "\n" !== clean.receiptsRaw ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    !same(report.intentLedger, {
      count: 10,
      frozen: false,
      pending: false,
      sent: false,
      priorConfirmed: 8,
      newArmedCount: 2,
      maxIntentions: 24,
      maxNewIntentions: 16,
    }) ||
    !keys(receipts, ["schema", "receipts"]) ||
    receipts.schema !== "contaos.fixture.receipts.v1" ||
    receipts.receipts.length !== 4
  )
    err("RECOVERY_R8_LEDGER");
  const historical = new Set(
      [
        ...R1_RECOVERY_DOCUMENT.receipts,
        ...R3_RECOVERY_DOCUMENT.receipts,
        ...JSON.parse(R5_RECOVERY_DOCUMENT.receiptsRaw).receipts,
      ].map((r) => r.requestId),
    ),
    ids = new Set();
  for (let i = 0; i < 4; i += 2) {
    const sealed = receipts.receipts[i],
      confirmed = receipts.receipts[i + 1];
    safeReceipt(sealed);
    safeReceipt(confirmed);
    if (
      !same({ ...sealed, state: "confirmed" }, confirmed) ||
      sealed.state !== "sealed" ||
      confirmed.state !== "confirmed" ||
      historical.has(sealed.requestId) ||
      ids.has(sealed.requestId) ||
      sealed.workflowRun !== clean.workflowRun ||
      sealed.harnessSha !== report.harnessSha ||
      sealed.frontendSha !== report.frontendSha ||
      sealed.deploymentId !== report.deploymentId ||
      sealed.organization !== FIXTURE.organization ||
      sealed.contract !== FIXTURE.contract ||
      sealed.rpc !==
        (i === 0 ? "criar_documento_competencia_v115" : "solicitar_analise_competencia")
    )
      err("RECOVERY_R8_LEDGER");
    ids.add(sealed.requestId);
  }
  if (
    report.recovery.confirmedBefore !== 8 ||
    report.recovery.maxNewIntentions !== 16 ||
    report.recovery.reconciled !== true ||
    report.recovery.sourceVersion !== R5_BINDINGS.sourceVersionId ||
    report.recovery.sourceHash !== JSON.parse(R5_RECOVERY_DOCUMENT.reportRaw).recovery.sourceHash
  )
    err("RECOVERY_R8_LEDGER");
  for (const key of ["sourceVersionId", "listId", "listVersionId", "itemId"])
    if (report.bindings[key] !== R5_BINDINGS[key]) err("RECOVERY_R8_LEDGER");
  return freeze(clean);
}
const R8_BINDINGS = freeze(JSON.parse(R8_RECOVERY_DOCUMENT.reportRaw).bindings);

export const R9_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r9.v1",
  workflowRun: "42621964900",
  artifactId: "13676832673",
  requestId: "trilha-a-fixtures-20261109-r9",
  harnessSha: "2ed3097691f39025b49a015d86223da61a2b45e5",
  zipSha256: "89a35fb6de1e437a93c8074cb563745108d5e968878d929c8663dcaff700f500",
  reportSha256: "4163c5266ed9715ceafa3650af55a42348636cfbccceb9c8f124b55ab1eac31e",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  observationSha256: "6beb2ab824c183a65b1bd7334a4a6ab7ca878a0c6cab999a32dfd39a4ec5cad6",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "OBSERVATION_FAILED",\n  "diagnostics": {\n    "primaryFailure": "OBSERVATION_FAILED",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "RUNTIME_FRESH",\n    "subphasePath": [\n      "SOURCE_AND_LIST",\n      "RECOVERY_READ",\n      "RECOVERY_READ",\n      "RUNTIME_FRESH",\n      "RUNTIME_FRESH"\n    ],\n    "lastCompletedSubphase": "RUNTIME_FRESH",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 10,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 10,\n    "newArmedCount": 0,\n    "maxIntentions": 24,\n    "maxNewIntentions": 14\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 14,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": false,\n    "sourceVersion": null,\n    "sourceHash": null\n  },\n  "bindings": null,\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "2ed3097691f39025b49a015d86223da61a2b45e5",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42621964900",\n  "phase": "SOURCE_AND_LIST",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "2ed3097691f39025b49a015d86223da61a2b45e5",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42621964900",\n  "firstFailure": {\n    "contractKind": "TABLE:competencias",\n    "stage": "BODY_READ",\n    "statusHTTP": 200,\n    "requestFailure": "ABORTED"\n  }\n}\n',
});
export function validateR9RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R9_LEDGER");
  const names = Object.keys(R9_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    clean = {};
  if (Reflect.ownKeys(ds).length !== names.length) err("RECOVERY_R9_LEDGER");
  for (const key of names) {
    const d = ds[key];
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true || typeof d.value !== "string")
      err("RECOVERY_R9_LEDGER");
    clean[key] = d.value;
  }
  if (
    !same(clean, R9_RECOVERY_DOCUMENT) ||
    hash(JSON.stringify(clean, null, 2) + "\n") !==
      "71e20cc2dfd5888ab22228efe2b253eea316194ce0503e262ad58aef516078b8" ||
    hash(clean.reportRaw) !== clean.reportSha256 ||
    hash(clean.receiptsRaw) !== clean.receiptsSha256 ||
    hash(clean.observationRaw) !== clean.observationSha256
  )
    err("RECOVERY_R9_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw),
    observation = JSON.parse(clean.observationRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts) + "\n" !== clean.receiptsRaw ||
    JSON.stringify(observation, null, 2) + "\n" !== clean.observationRaw ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.failure !== "OBSERVATION_FAILED" ||
    report.phase !== "SOURCE_AND_LIST" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.logoutAttempted !== true ||
    report.diagnostics.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    report.bindings !== null ||
    !same(report.ids, []) ||
    !same(report.intentLedger, {
      count: 10,
      frozen: false,
      pending: false,
      sent: false,
      priorConfirmed: 10,
      newArmedCount: 0,
      maxIntentions: 24,
      maxNewIntentions: 14,
    }) ||
    !same(receipts, { schema: "contaos.fixture.receipts.v1", receipts: [] }) ||
    report.recovery.confirmedBefore !== 10 ||
    report.recovery.maxNewIntentions !== 14 ||
    report.recovery.reconciled !== false ||
    report.recovery.sourceVersion !== null ||
    report.recovery.sourceHash !== null
  )
    err("RECOVERY_R9_LEDGER");
  validateR4RecoveryDocument(report.recovery.r4ZeroAuth);
  validateObservationDiagnostic(observation, {
    frontendSha: report.frontendSha,
    harnessSha: report.harnessSha,
    deploymentId: report.deploymentId,
    workflowRun: report.workflowRun,
  });
  if (
    !same(observation.firstFailure, {
      contractKind: "TABLE:competencias",
      stage: "BODY_READ",
      statusHTTP: 200,
      requestFailure: "ABORTED",
    })
  )
    err("RECOVERY_R9_LEDGER");
  return freeze(clean);
}

export const R10_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r10.v1",
  workflowRun: "42638883189",
  artifactId: "13683268867",
  requestId: "trilha-a-fixtures-20261109-r10",
  harnessSha: "a3a5df2b4e99705d214a509ba035f155c7ae8de9",
  zipSha256: "b306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43",
  reportSha256: "858c21b7eb05e379f6c92dd84cc5f7afe0d75406ab105d3b279b2f0d53703ef2",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  observationSha256: "0b11018aae5529f19ccb6476bf8b1202f3a7e9ba8fab8811252a48b2904ddecf",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "OBSERVATION_FAILED",\n  "diagnostics": {\n    "primaryFailure": "OBSERVATION_FAILED",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "RUNTIME_FRESH",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "RUNTIME_FRESH",\n      "RUNTIME_FRESH"\n    ],\n    "lastCompletedSubphase": "RUNTIME_FRESH",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 10,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 10,\n    "newArmedCount": 0,\n    "maxIntentions": 24,\n    "maxNewIntentions": 14\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 14,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "a3a5df2b4e99705d214a509ba035f155c7ae8de9",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42638883189",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "a3a5df2b4e99705d214a509ba035f155c7ae8de9",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42638883189",\n  "firstFailure": {\n    "contractKind": "RPC:obter_analise_competencia_v116",\n    "stage": "RESPONSE_PROJECTION",\n    "statusHTTP": "NONE",\n    "requestFailure": "NONE"\n  }\n}\n',
});
export function validateR10RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R10_LEDGER");
  const names = Object.keys(R10_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    clean = {};
  if (!same(Reflect.ownKeys(ds), names)) err("RECOVERY_R10_LEDGER");
  for (const key of names) {
    const d = ds[key];
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true || typeof d.value !== "string")
      err("RECOVERY_R10_LEDGER");
    clean[key] = d.value;
  }
  if (
    !same(clean, R10_RECOVERY_DOCUMENT) ||
    hash(JSON.stringify(clean, null, 2) + "\n") !==
      "5c1490e7d2e810bc4711ad2f8f6a7b11dd36e313b96940c196ecda6b0dd17ece" ||
    hash(clean.reportRaw) !== clean.reportSha256 ||
    hash(clean.receiptsRaw) !== clean.receiptsSha256 ||
    hash(clean.observationRaw) !== clean.observationSha256
  )
    err("RECOVERY_R10_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw),
    observation = JSON.parse(clean.observationRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts) + "\n" !== clean.receiptsRaw ||
    JSON.stringify(observation, null, 2) + "\n" !== clean.observationRaw ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.failure !== "OBSERVATION_FAILED" ||
    report.phase !== "FINAL_READBACK" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.logoutAttempted !== true ||
    report.diagnostics.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    !same(report.bindings, JSON.parse(R10_RECOVERY_DOCUMENT.reportRaw).bindings) ||
    !same(report.ids, JSON.parse(R10_RECOVERY_DOCUMENT.reportRaw).ids) ||
    !same(report.intentLedger, {
      count: 10,
      frozen: false,
      pending: false,
      sent: false,
      priorConfirmed: 10,
      newArmedCount: 0,
      maxIntentions: 24,
      maxNewIntentions: 14,
    }) ||
    !same(receipts, { schema: "contaos.fixture.receipts.v1", receipts: [] }) ||
    report.recovery.confirmedBefore !== 10 ||
    report.recovery.maxNewIntentions !== 14 ||
    report.recovery.reconciled !== true ||
    report.recovery.sourceVersion !== "1ebbfd0b-c50c-405d-8806-321f18e179e0" ||
    report.recovery.sourceHash !==
      "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"
  )
    err("RECOVERY_R10_LEDGER");
  validateR4RecoveryDocument(report.recovery.r4ZeroAuth);
  validateObservationDiagnostic(observation, {
    frontendSha: report.frontendSha,
    harnessSha: report.harnessSha,
    deploymentId: report.deploymentId,
    workflowRun: report.workflowRun,
  });
  if (
    !same(observation.firstFailure, {
      contractKind: "RPC:obter_analise_competencia_v116",
      stage: "RESPONSE_PROJECTION",
      statusHTTP: "NONE",
      requestFailure: "NONE",
    })
  )
    err("RECOVERY_R10_LEDGER");
  return freeze(clean);
}

export const R11_RECOVERY_DOCUMENT = freeze({
  schema: "contaos.fixture.recovery-r11.v1",
  workflowRun: "42650825191",
  artifactId: "13690462160",
  requestId: "trilha-a-fixtures-20261109-r11",
  harnessSha: "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",
  zipSha256: "eb445aadc6876e116040946157c2c4a1bd6bfd79f494945649dbd63e6d74eb50",
  reportSha256: "fcee36850806601be988dedf4afe49fe10e6fccc6640f2b7e0a63a870541dc1a",
  receiptsSha256: "603a302a92902da2978ddabb20d7972dd9713d39d8838024bfaa89cfb1af33e8",
  observationSha256: "59eb0943c77cbcc75e0e022d3ebb75cc74384faf73c5f64e6b5dc2cb29059a47",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "PHASE_TIMEOUT",\n  "diagnostics": {\n    "primaryFailure": "PHASE_TIMEOUT",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "COMPETENCY_GET",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_COMMAND",\n      "RUNTIME_FRESH",\n      "UI_CONFIRM_AFTER",\n      "PREFLIGHT",\n      "COMPETENCY_RECONCILE",\n      "COMPETENCY_UI",\n      "COMPETENCY_GET"\n    ],\n    "lastCompletedSubphase": "COMPETENCY_UI",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 11,\n    "frozen": true,\n    "pending": true,\n    "sent": true,\n    "priorConfirmed": 10,\n    "newArmedCount": 1,\n    "maxIntentions": 24,\n    "maxNewIntentions": 14\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 14,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42650825191",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42650825191",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "af968191-7d60-4adb-9c60-ebd5f0741e8e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42650825191",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "af968191-7d60-4adb-9c60-ebd5f0741e8e",\n      "state": "uncertain",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d"\n    }\n  ]\n}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n  "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n  "workflowRun": "42650825191",\n  "firstFailure": null\n}\n',
});
export function validateR11RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R11_LEDGER");
  const names = Object.keys(R11_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    clean = {};
  if (!same(Reflect.ownKeys(ds), names)) err("RECOVERY_R11_LEDGER");
  for (const key of names) {
    const d = ds[key];
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true || typeof d.value !== "string")
      err("RECOVERY_R11_LEDGER");
    clean[key] = d.value;
  }
  if (
    !same(clean, R11_RECOVERY_DOCUMENT) ||
    hash(JSON.stringify(clean, null, 2) + "\n") !==
      "29f674764a2c8f953f764fcb6a40d8c330e441b488dfcab56a6ee4f9f389c423" ||
    hash(clean.reportRaw) !== clean.reportSha256 ||
    hash(clean.receiptsRaw) !== clean.receiptsSha256 ||
    hash(clean.observationRaw) !== clean.observationSha256
  )
    err("RECOVERY_R11_LEDGER");
  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw),
    observation = JSON.parse(clean.observationRaw);
  if (
    JSON.stringify(report, null, 2) + "\n" !== clean.reportRaw ||
    JSON.stringify(receipts, null, 2) + "\n" !== clean.receiptsRaw ||
    JSON.stringify(observation, null, 2) + "\n" !== clean.observationRaw ||
    report.schema !== "contaos.fixture.preparation.v1" ||
    report.workflowRun !== clean.workflowRun ||
    report.harnessSha !== clean.harnessSha ||
    report.frontendSha !== "437c788e32f0325dd15c9d2e7277c10129bcb462" ||
    report.deploymentId !== "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp" ||
    report.failure !== "PHASE_TIMEOUT" ||
    report.phase !== "FINAL_READBACK" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.logoutAttempted !== true ||
    report.diagnostics.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    !same(report.bindings, JSON.parse(R11_RECOVERY_DOCUMENT.reportRaw).bindings) ||
    !same(report.ids, JSON.parse(R11_RECOVERY_DOCUMENT.reportRaw).ids) ||
    !same(report.intentLedger, {
      count: 11,
      frozen: true,
      pending: true,
      sent: true,
      priorConfirmed: 10,
      newArmedCount: 1,
      maxIntentions: 24,
      maxNewIntentions: 14,
    }) ||
    !same(receipts, JSON.parse(R11_RECOVERY_DOCUMENT.receiptsRaw)) ||
    report.recovery.confirmedBefore !== 10 ||
    report.recovery.maxNewIntentions !== 14 ||
    report.recovery.reconciled !== true ||
    report.recovery.sourceVersion !== "1ebbfd0b-c50c-405d-8806-321f18e179e0" ||
    report.recovery.sourceHash !==
      "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"
  )
    err("RECOVERY_R11_LEDGER");
  validateR4RecoveryDocument(report.recovery.r4ZeroAuth);
  validateObservationDiagnostic(observation, {
    frontendSha: report.frontendSha,
    harnessSha: report.harnessSha,
    deploymentId: report.deploymentId,
    workflowRun: report.workflowRun,
  });
  if (observation.firstFailure !== null || receipts.receipts.length !== 2)
    err("RECOVERY_R11_LEDGER");
  for (const [index, row] of receipts.receipts.entries()) {
    safeReceipt(row);
    if (
      row.state !== (index === 0 ? "sealed" : "uncertain") ||
      row.rpc !== "solicitar_parecer_interno" ||
      row.requestId !== "af968191-7d60-4adb-9c60-ebd5f0741e8e" ||
      row.payloadSha256 !== "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d" ||
      row.workflowRun !== clean.workflowRun ||
      row.harnessSha !== clean.harnessSha ||
      row.frontendSha !== report.frontendSha ||
      row.deploymentId !== report.deploymentId ||
      row.organization !== FIXTURE.organization ||
      row.contract !== FIXTURE.contract
    )
      err("RECOVERY_R11_LEDGER");
  }
  return freeze(clean);
}

function reservedR11Replay(rpc, payload) {
  if (rpc !== "solicitar_parecer_interno") return false;
  if (isProxy(payload) || !obj(payload)) err("INTENT_PAYLOAD");
  const ds = Object.getOwnPropertyDescriptors(payload);
  if (Reflect.ownKeys(ds).some((k) => typeof k !== "string" || !Object.hasOwn(ds[k], "value")))
    err("INTENT_PAYLOAD");
  return ds.p_id_competencia?.value === R5_BINDINGS.competencies[0].id;
}
function confirmedR16Replay(rpc, payload) {
  if (
    ![
      "criar_documento_competencia_v115",
      "solicitar_analise_competencia",
      "solicitar_parecer_interno",
      "aprovar_parecer_interno",
    ].includes(rpc)
  )
    return false;
  if (isProxy(payload) || !obj(payload)) err("INTENT_PAYLOAD");
  const ds = Object.getOwnPropertyDescriptors(payload);
  if (Reflect.ownKeys(ds).some((k) => !Object.hasOwn(ds[k], "value"))) err("INTENT_PAYLOAD");
  const p = Object.fromEntries(Object.entries(ds).map(([k, d]) => [k, d.value]));
  const c = JSON.parse(R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies.find(
    (c) => c.month === "2026-09-01",
  );
  if (rpc === "aprovar_parecer_interno") return p.p_id_parecer === c.opinionId;
  if (p.p_id_competencia !== c.id) return false;
  return rpc !== "criar_documento_competencia_v115" || p.p_id_requisito === c.requirementId;
}

function confirmedR8Replay(rpc, payload) {
  if (!["criar_documento_competencia_v115", "solicitar_analise_competencia"].includes(rpc))
    return false;
  if (isProxy(payload) || !obj(payload)) err("INTENT_PAYLOAD");
  const ds = Object.getOwnPropertyDescriptors(payload);
  if (Reflect.ownKeys(ds).some((k) => !Object.hasOwn(ds[k], "value"))) err("INTENT_PAYLOAD");
  const p = Object.fromEntries(Object.entries(ds).map(([k, d]) => [k, d.value])),
    c = R8_BINDINGS.competencies[0];
  if (p.p_id_competencia !== c.id) return false;
  if (rpc === "solicitar_analise_competencia") return true;
  return p.p_id_requisito === c.requirementId;
}

function confirmedR5Replay(rpc, payload) {
  const ownData = (value) => {
    if (isProxy(value) || !obj(value)) err("INTENT_PAYLOAD");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(descriptors).some((key) => !Object.hasOwn(descriptors[key], "value")))
      err("INTENT_PAYLOAD");
    return Object.fromEntries(Object.entries(descriptors).map(([key, d]) => [key, d.value]));
  };
  const p = ownData(payload);
  if (rpc === "criar_competencia")
    return (
      p.p_id_contrato === FIXTURE.contract &&
      R5_BINDINGS.competencies.some((c) => c.month === p.p_competencia_referencia)
    );
  if (rpc !== "executar_comando_lista_v1") return false;
  const q = ownData(p.p_payload);
  if (p.p_acao === "criar_lista")
    return (
      p.p_id_organizacao === FIXTURE.organization &&
      p.p_id_contrato === FIXTURE.contract &&
      q.nome === FIXTURE.listName
    );
  if (p.p_id_lista !== R5_BINDINGS.listId) return false;
  return (
    (p.p_acao === "salvar_item" &&
      q.id_versao === R5_BINDINGS.listVersionId &&
      q.codigo === "AUD-A-TXT-001" &&
      q.id_fonte_versao === R5_BINDINGS.sourceVersionId) ||
    (p.p_acao === "publicar_versao" && q.id_versao === R5_BINDINGS.listVersionId)
  );
}

export const R7_RECOVERY_DOCUMENT = freeze({ ...R7_ZERO_AUTH_PROOF });
export function validateR7RecoveryDocument(input) {
  if (isProxy(input) || !obj(input)) err("RECOVERY_R7_LEDGER");
  let descriptors;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input);
  } catch {
    err("RECOVERY_R7_LEDGER");
  }
  const keys = Object.keys(R7_ZERO_AUTH_PROOF),
    clean = {};
  if (Reflect.ownKeys(descriptors).length !== keys.length) err("RECOVERY_R7_LEDGER");
  for (const key of keys) {
    const descriptor = descriptors[key];
    if (
      !descriptor ||
      !Object.hasOwn(descriptor, "value") ||
      descriptor.enumerable !== true ||
      descriptor.value !== R7_ZERO_AUTH_PROOF[key]
    )
      err("RECOVERY_R7_LEDGER");
    clean[key] = descriptor.value;
  }
  if (
    hash(JSON.stringify(clean, null, 2) + "\n") !==
    "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e"
  )
    err("RECOVERY_R7_LEDGER");
  return freeze(clean);
}

function recoveryBudget(
  ledger,
  ledgerR3,
  ledgerR4,
  ledgerR5,
  ledgerR6,
  ledgerR7,
  ledgerR8,
  ledgerR9,
  ledgerR10,
  ledgerR11,
  ledgerR13,
  ledgerR15,
  ledgerR16,
  ledgerR17,
) {
  const prior = validateR1RecoveryDocument(ledger),
    r3 = validateR3RecoveryDocument(ledgerR3);
  validateR4RecoveryDocument(ledgerR4);
  const r5 = JSON.parse(validateR5RecoveryDocument(ledgerR5).receiptsRaw);
  validateR6RecoveryDocument(ledgerR6);
  validateR7RecoveryDocument(ledgerR7);
  const confirmedBefore = [...prior.receipts, ...r3.receipts, ...r5.receipts].filter(
    (row) => row.state === "confirmed",
  ).length;
  if (confirmedBefore !== 8) err("RECOVERY_R5_LEDGER");
  const r8 = JSON.parse(validateR8RecoveryDocument(ledgerR8).receiptsRaw);
  validateR9RecoveryDocument(ledgerR9);
  validateR10RecoveryDocument(ledgerR10);
  validateR13RecoveryDocument(ledgerR13);
  validateR15RecoveryDocument(ledgerR15);
  validateR16RecoveryDocument(ledgerR16);
  validateR17RecoveryDocument(ledgerR17);
  validateR11RecoveryDocument(ledgerR11);
  const total = confirmedBefore + r8.receipts.filter((row) => row.state === "confirmed").length;
  if (total !== 10) err("RECOVERY_R8_LEDGER");
  return Object.freeze({
    confirmedBefore: total + 5,
    priorReserved: 2,
    maxNewIntentions: 24 - total - 5 - 2,
  });
}

export async function dismissPreparationOverlays(page) {
  // Visible dialogs are the active Radix modal stack. Hidden underlying dialogs
  // are considered only after the upper layer has closed through ordinary UI.
  const known = new Set([
    "Editar fonte",
    "Nova versão",
    "FONTE SINTETICA TRILHA A 20261108",
    "Confirmar aprovação",
    "Confirmar aprovação institucional",
    "Confirmar envio ao contratante",
    "Detalhe do requisito",
  ]);
  for (let depth = 0; depth < 8; depth++) {
    const dialogs = page.getByRole("dialog");
    const count = await dialogs.count();
    if (count === 0) return true;
    if (count !== 1) err("LOGOUT_OVERLAY");
    const overlay = dialogs;
    const element = await overlay.elementHandle();
    if (!element) err("LOGOUT_OVERLAY");
    const title = await overlay.evaluate((el) => {
      const ids = (el.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean);
      return (
        ids
          .map((id) => document.getElementById(id)?.textContent || "")
          .join(" ")
          .trim() ||
        el.getAttribute("aria-label") ||
        ""
      );
    });
    if (!known.has(title) && !/^Aprovar versão [1-9][0-9]*$/.test(title)) err("LOGOUT_OVERLAY");
    const close = overlay.getByRole("button", { name: "Close", exact: true });
    const cancel = overlay.getByRole("button", {
      name: title === "Detalhe do requisito" ? "Fechar" : "Cancelar",
      exact: true,
    });
    if ((await cancel.count()) === 1) {
      if (!(await cancel.isEnabled())) err("LOGOUT_OVERLAY");
      await cancel.click();
    } else if (title !== "Detalhe do requisito" && (await close.count()) === 1) {
      if (!(await close.isEnabled())) err("LOGOUT_OVERLAY");
      await close.click();
    } else err("LOGOUT_OVERLAY");
    await element.waitForElementState("hidden", { timeout: 3000 });
    await element.dispose();
  }
  err("LOGOUT_OVERLAY");
}

export const SOURCE_STATUS_NAME =
  "Situação Mudança de situação exige administrador; ativação exige versão aprovada.";
export async function sourceStatusControl(dialog) {
  const control = dialog.getByRole("combobox", { name: SOURCE_STATUS_NAME, exact: true });
  if ((await control.count()) > 1) err("FLOW_SOURCE_CONTROL");
  try {
    await control.waitFor({ state: "visible" });
  } catch (error) {
    if (preparationErrorData(error, "name") === "TimeoutError") throw error;
    err("FLOW_SOURCE_CONTROL");
  }
  if (
    (await control.count()) !== 1 ||
    !(await control.isVisible()) ||
    !(await control.isEnabled()) ||
    (await control.evaluate((el) => el.tagName)) !== "SELECT"
  )
    err("FLOW_SOURCE_CONTROL");
  return control;
}

export async function listSelectionControl(scope, expectedId) {
  if (
    (await scope.count()) !== 1 ||
    (await scope.getAttribute("aria-label")) !== "Gestão de listas"
  )
    err("FLOW_LIST_UI_MISSING");
  const title = scope.getByText("Lista selecionada", { exact: true });
  if ((await title.count()) > 1) err("FLOW_LIST_UI_MISSING");
  try {
    await title.waitFor({ state: "visible", timeout: 3000 });
  } catch {
    err("FLOW_LIST_UI_MISSING");
  }
  if ((await title.count()) !== 1 || !(await title.isVisible())) err("FLOW_LIST_UI_MISSING");
  const label = title.locator("xpath=parent::label");
  if ((await label.count()) !== 1) err("FLOW_LIST_UI_MISSING");
  const control = label.locator(":scope > select");
  if ((await control.count()) > 1) err("FLOW_LIST_UI_MISSING");
  try {
    await control.waitFor({ state: "visible", timeout: 3000 });
    await label.locator(":scope > select:enabled").waitFor({ state: "visible", timeout: 3000 });
  } catch {
    err("FLOW_LIST_UI_MISSING");
  }
  // Readiness can change the surrounding DOM. Revalidate the complete source
  // anchor after the last wait, before accepting its unique control or option.
  if (
    (await scope.count()) !== 1 ||
    (await scope.getAttribute("aria-label")) !== "Gestão de listas" ||
    (await title.count()) !== 1 ||
    !(await title.isVisible()) ||
    (await label.count()) !== 1
  )
    err("FLOW_LIST_UI_MISSING");
  if ((await control.count()) !== 1 || !(await control.isVisible()) || !(await control.isEnabled()))
    err("FLOW_LIST_UI_MISSING");
  if (expectedId !== undefined) {
    if (!uuid(expectedId) || expectedId !== R5_BINDINGS.listId) err("FLOW_LIST_UI_MISSING");
    if ((await control.locator(`option[value="${expectedId}"]`).count()) !== 1)
      err("FLOW_LIST_UI_MISSING");
  }
  return control;
}

export const DIAGNOSTIC_SUBPHASES = Object.freeze([
  "PREFLIGHT",
  "LOGIN",
  "SOURCE_AND_LIST",
  "COMPETENCIES",
  "FINAL_READBACK",
  "SOURCE_NAVIGATE",
  "SOURCE_GET",
  "SOURCE_VERSION_GET",
  "SOURCE_TEXT_PROOF",
  "SOURCE_RECONCILE",
  "SOURCE_VERSION_READ",
  "SOURCE_UI_CONTROL",
  "SOURCE_FORM_FIELD",
  "SOURCE_REGISTER_COMMAND",
  "SOURCE_APPROVE_COMMAND",
  "SOURCE_ACTIVATE_COMMAND",
  "SOURCE_SHEET_CLOSE",
  "SOURCE_REFRESH",
  "RECOVERY_READ",
  "RECOVERY_RETURN",
  "V109_NAVIGATE",
  "LIST_PANEL_OPEN",
  "LIST_GET",
  "LIST_MODEL_READ",
  "LIST_UI_CONTROL",
  "LIST_FORM_FIELD",
  "LIST_COMMAND",
  "LIST_REFRESH",
  "COMPETENCY_UI",
  "COMPETENCY_GET",
  "COMPETENCY_COMMAND",
  "COMPETENCY_RECONCILE",
  "UI_CONFIRM_FENCE",
  "UI_CONFIRM_CONTROL",
  "UI_CONFIRM_CLICK",
  "UI_CONFIRM_BEFORE",
  "UI_CONFIRM_AFTER",
  "RUNTIME_FRESH",
  "RUNTIME_NAVIGATE",
  "RUNTIME_CONTEXT",
  "RUNTIME_COMMAND",
  "LOGOUT",
  "CLEANUP",
  "SOURCE_NAVIGATION",
  "SOURCE_RECONCILIATION",
  "SOURCE_REGISTER",
  "SOURCE_REGISTER_READBACK",
  "SOURCE_APPROVAL",
  "SOURCE_APPROVAL_READBACK",
  "SOURCE_CLOSE",
  "SOURCE_VERIFICATION",
  "SOURCE_ACTIVATION",
  "SOURCE_ACTIVATION_READBACK",
  "LIST_NAVIGATION",
  "LIST_RECONCILIATION",
]);

const PREPARER_DIAGNOSTIC_STEPS = new Set(DIAGNOSTIC_SUBPHASES);
export function preparerFailureDiagnostic(input) {
  return {
    step: PREPARER_DIAGNOSTIC_STEPS.has(input?.step) ? input.step : "UNCLASSIFIED",
    errorKind:
      input?.errorName === "TimeoutError"
        ? "TIMEOUT"
        : input?.errorName === "Error"
          ? "ERROR"
          : "OTHER",
  };
}

const PREPARER_NATIVE_CODES = new Set([
  "FENCE_ASYNC",
  "FENCE_BODY_LIMIT",
  "FENCE_CDP_CLOSED",
  "FENCE_CONFIGURATION",
  "FENCE_CONTEXT_FOREIGN",
  "FENCE_CONTEXT_UNKNOWN",
  "FENCE_DOCUMENT_BODY",
  "FENCE_DRAIN_TIMEOUT",
  "FENCE_HEADERS",
  "FENCE_INITIALIZATION",
  "FENCE_LIFECYCLE_FRAME",
  "FENCE_LIFECYCLE_NO_NETWORK",
  "FENCE_LIFECYCLE_TERMINAL",
  "FENCE_LIFECYCLE_TYPE",
  "FENCE_NOT_PROVEN",
  "FENCE_POPUP",
  "FENCE_READY",
  "FENCE_REDIRECT",
  "FENCE_REQUEST",
  "FENCE_REQUEST_LIFECYCLE",
  "FENCE_SOURCE",
  "FENCE_TARGET_DETACHED",
  "FENCE_TARGET_FAILED",
  "FENCE_TARGET_TIMEOUT",
  "FENCE_TRANSPORT",
  "FENCE_WORKER_PAUSED",
  "FENCE_WORKER_RUNNING",
]);
function preparationErrorData(error, key) {
  try {
    if (!error || !["object", "function"].includes(typeof error) || isProxy(error))
      return undefined;
    let descriptor = Object.getOwnPropertyDescriptor(error, key);
    if (!descriptor && key === "name") {
      const prototype = Object.getPrototypeOf(error);
      if (isProxy(prototype)) return undefined;
      descriptor = Object.getOwnPropertyDescriptor(prototype || {}, key);
    }
    return descriptor && "value" in descriptor && typeof descriptor.value === "string"
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
}
function classifyPreparationFailure(error) {
  const suppliedName = preparationErrorData(error, "name");
  const name = ["Error", "TypeError", "ReferenceError", "SyntaxError", "TimeoutError"].includes(
    suppliedName,
  )
    ? suppliedName
    : "UNKNOWN";
  const suppliedCode = preparationErrorData(error, "code"),
    message = preparationErrorData(error, "message");
  const code = PREPARER_NATIVE_CODES.has(suppliedCode)
    ? suppliedCode
    : PREPARER_FAILURE_CODES.has(suppliedCode)
      ? suppliedCode
      : PREPARER_FAILURE_CODES.has(message)
        ? message
        : name === "TimeoutError"
          ? "PREPARER_TIMEOUT"
          : "PREPARER_UNCLASSIFIED";
  const compatible = preparerFailureDiagnostic({ errorName: name });
  return {
    code,
    errorName: name,
    failureClass: PREPARER_NATIVE_CODES.has(code)
      ? "NATIVE_FENCE"
      : compatible.errorKind === "TIMEOUT"
        ? "TIMEOUT"
        : code === "PREPARER_UNCLASSIFIED"
          ? "UNKNOWN"
          : "PROTOCOL",
  };
}
export function createPreparationDiagnostics() {
  const stack = [];
  const observed = new WeakMap();
  let generation = 0;
  let primary = null,
    lastCompleted = null,
    cleaning = false;
  let logoutAttempted = false,
    logoutVerified = false,
    cleanupFailure = null;
  const object = (value) => value !== null && ["object", "function"].includes(typeof value);
  const candidate = (error) => {
    const seen = new WeakSet();
    let value = error,
      found = null;
    for (let depth = 0; depth < 8 && object(value) && !seen.has(value); depth++) {
      seen.add(value);
      if (isProxy(value)) break;
      const entry = observed.get(value);
      if (entry?.generation === generation) found = entry;
      try {
        const descriptor = Object.getOwnPropertyDescriptor(value, "cause");
        value = descriptor && "value" in descriptor ? descriptor.value : null;
      } catch {
        break;
      }
    }
    return found;
  };
  const observe = (error) => {
    const entry = candidate(error) || {
      ...classifyPreparationFailure(error),
      generation,
      subphase: stack.at(-1) || "PREFLIGHT",
      subphasePath: stack.slice(-12),
    };
    if (object(error)) observed.set(error, entry);
    return entry;
  };
  const capture = (error) => {
    primary ||= observe(error);
    return primary.code;
  };
  return Object.freeze({
    capture,
    async step(subphase, execute) {
      if (!DIAGNOSTIC_SUBPHASES.includes(subphase) || typeof execute !== "function")
        err("DIAGNOSTIC_SUBPHASE");
      if (stack.length === 0) generation++;
      stack.push(subphase);
      try {
        const value = await execute();
        if (!cleaning && !primary) lastCompleted = subphase;
        return value;
      } catch (error) {
        if (!cleaning) {
          observe(error);
          // A nested failure may be deliberately recovered by the consumer.
          // Seal only the rejection that escapes the outer await boundary.
          if (stack.length === 1) capture(error);
        }
        throw error;
      } finally {
        stack.pop();
      }
    },
    async cleanup(execute) {
      logoutAttempted = true;
      const previous = cleaning;
      cleaning = true;
      try {
        logoutVerified = (await execute()) === true;
        if (!logoutVerified) cleanupFailure ||= "LOGOUT_NOT_VERIFIED";
      } catch {
        logoutVerified = false;
        cleanupFailure ||= "LOGOUT_FAILED";
      } finally {
        cleaning = previous;
      }
      return logoutVerified;
    },
    async finishCleanup(code, execute) {
      if (
        ![
          "RUNTIME_CLEAR_FAILED",
          "OBSERVER_CLOSE_FAILED",
          "FENCE_CLOSE_FAILED",
          "BROWSER_CLOSE_FAILED",
          "PROXY_CLOSE_FAILED",
        ].includes(code) ||
        typeof execute !== "function"
      )
        err("DIAGNOSTIC_SUBPHASE");
      const previous = cleaning;
      cleaning = true;
      try {
        await execute();
      } catch {
        cleanupFailure ||= code;
      } finally {
        cleaning = previous;
      }
    },
    snapshot() {
      return freeze({
        primaryFailure: primary?.code || null,
        failureClass: primary?.failureClass || null,
        errorName: primary?.errorName || null,
        subphase: primary?.subphase || stack.at(-1) || lastCompleted || "PREFLIGHT",
        subphasePath: primary?.subphasePath || stack.slice(-12),
        lastCompletedSubphase: lastCompleted,
        logoutAttempted,
        logoutVerified,
        cleanupFailure,
      });
    },
  });
}
let activePreparationDiagnostics = null;
async function tracedPreparation(subphase, execute) {
  return activePreparationDiagnostics
    ? activePreparationDiagnostics.step(subphase, execute)
    : execute();
}
export async function withPreparationDiagnostics(diagnostics, execute) {
  if (activePreparationDiagnostics) err("DIAGNOSTIC_REENTRANT");
  activePreparationDiagnostics = diagnostics;
  try {
    return await execute();
  } finally {
    activePreparationDiagnostics = null;
  }
}

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
  recoveryLedger,
  recoveryLedgerR3,
  recoveryLedgerR4,
  recoveryLedgerR5,
  recoveryLedgerR6,
  recoveryLedgerR7,
  recoveryLedgerR8,
  recoveryLedgerR9,
  recoveryLedgerR10,
  recoveryLedgerR11,
  recoveryLedgerR13,
  recoveryLedgerR15,
  recoveryLedgerR16,
  recoveryLedgerR17,
  identity,
  beforeArm,
  readOnlyRecovery = false,
} = {}) {
  if (typeof readOnlyRecovery !== "boolean") err("RECOVERY_READ_ONLY");
  validateR13RecoveryDocument(recoveryLedgerR13);
  validateR15RecoveryDocument(recoveryLedgerR15);
  validateR16RecoveryDocument(recoveryLedgerR16);
  validateR17RecoveryDocument(recoveryLedgerR17);
  const recoveryIdentity = identity === undefined ? null : observationIdentity(identity);
  const recovery = recoveryLedger === undefined ? null : validateR1RecoveryDocument(recoveryLedger);
  if (
    !recovery &&
    (recoveryLedgerR3 !== undefined ||
      recoveryLedgerR4 !== undefined ||
      recoveryLedgerR5 !== undefined ||
      recoveryLedgerR6 !== undefined ||
      recoveryLedgerR7 !== undefined ||
      recoveryLedgerR8 !== undefined ||
      recoveryLedgerR9 !== undefined ||
      recoveryLedgerR10 !== undefined ||
      recoveryLedgerR11 !== undefined)
  )
    err("RECOVERY_R3_LEDGER");
  const budget = recovery
    ? recoveryBudget(
        recoveryLedger,
        recoveryLedgerR3,
        recoveryLedgerR4,
        recoveryLedgerR5,
        recoveryLedgerR6,
        recoveryLedgerR7,
        recoveryLedgerR8,
        recoveryLedgerR9,
        recoveryLedgerR10,
        recoveryLedgerR11,
        recoveryLedgerR13,
        recoveryLedgerR15,
        recoveryLedgerR16,
        recoveryLedgerR17,
      )
    : null;
  let recoveryAuthorized = !recovery;
  let active = null,
    count = budget ? budget.confirmedBefore + budget.priorReserved : 0,
    frozen = false;
  const accepted = new Map(),
    usedIds = new Set(
      recovery
        ? [
            ...R1_RECOVERY_DOCUMENT.receipts,
            ...R3_RECOVERY_DOCUMENT.receipts,
            ...JSON.parse(R5_RECOVERY_DOCUMENT.receiptsRaw).receipts,
            ...JSON.parse(validateR8RecoveryDocument(recoveryLedgerR8).receiptsRaw).receipts,
            ...JSON.parse(validateR11RecoveryDocument(recoveryLedgerR11).receiptsRaw).receipts,
            ...JSON.parse(validateR15RecoveryDocument(recoveryLedgerR15).receiptsRaw).receipts,
            ...JSON.parse(validateR16RecoveryDocument(recoveryLedgerR16).receiptsRaw).receipts,
            ...JSON.parse(validateR17RecoveryDocument(recoveryLedgerR17).receiptsRaw).receipts,
          ].map((r) => r.requestId)
        : [],
    );
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
      if (readOnlyRecovery && business) return false;
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
  const api = Object.freeze({
    policy,
    authorizeRecovery(proof, opinionProof) {
      if (!recovery || !recoveryProofs.has(proof)) err("RECOVERY_PROOF");
      if (recoveryAuthorized) err("RECOVERY_R11_OPINION");
      claimRecoveryOpinion(api, opinionProof);
      recoveryAuthorized = true;
      return true;
    },
    arm(input = {}) {
      if (readOnlyRecovery) err("RECOVERY_READ_ONLY");
      const { rpc, payload, requestId, uiGeneratedKey, verified, evidence = {} } = input;
      if (
        recovery &&
        [
          "registrar_versao_fonte_v107",
          "aprovar_versao_fonte_v107",
          "salvar_fonte_normativa_v107",
        ].includes(rpc)
      )
        err("RECOVERY_CONFIRMED_OPERATION");
      if (!recoveryAuthorized) err("RECOVERY_READ_ONLY");
      if (recovery && confirmedR5Replay(rpc, payload)) err("RECOVERY_CONFIRMED_OPERATION");
      if (recovery && confirmedR16Replay(rpc, payload)) err("RECOVERY_CONFIRMED_OPERATION");
      if (recovery && rpc === "aprovar_apresentacao") {
        if (isProxy(payload) || !obj(payload)) err("INTENT_PAYLOAD");
        const descriptor = Object.getOwnPropertyDescriptor(payload, "p_id_competencia");
        if (!descriptor || !Object.hasOwn(descriptor, "value")) err("INTENT_PAYLOAD");
        if (descriptor.value === R5_BINDINGS.competencies[0].id)
          err("RECOVERY_CONFIRMED_OPERATION");
      }
      if (recovery && confirmedR8Replay(rpc, payload)) err("RECOVERY_CONFIRMED_OPERATION");
      if (recovery && reservedR11Replay(rpc, payload)) err("RECOVERY_CONFIRMED_OPERATION");
      if (recovery) {
        assertRecoveryOpinion(api);
        if (rpc === "aprovar_parecer_interno") {
          const record = recoveryOpinionProofs.get(recoveryBrokerOwners.get(api)?.opinion);
          if (!record?.permitsApproval(payload)) err("RECOVERY_CONFIRMED_OPERATION");
        }
      }
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
      if (
        beforeArm !== undefined &&
        (typeof beforeArm !== "function" ||
          beforeArm(rpc, payload, evidence, { requestId, uiGeneratedKey, bodyKey }) !== true)
      )
        err("OBSERVATION_MUTATION");
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
        ...(budget || {}),
      });
    },
  });
  recoveryBrokerOwners.set(api, {
    identity: recoveryIdentity,
    recovery: !!recovery,
    opinion: null,
  });
  return api;
}

export function preparationIntentSummary(broker) {
  if (!broker) return null;
  const state = broker.snapshot();
  if (
    state.confirmedBefore !== 15 ||
    state.maxNewIntentions !== 7 ||
    state.priorReserved !== 2 ||
    !Number.isInteger(state.count) ||
    state.count < state.confirmedBefore + state.priorReserved ||
    state.count > 24
  )
    err("RECOVERY_R3_LEDGER");
  return Object.freeze({
    count: state.count,
    frozen: state.frozen,
    pending: state.pending,
    sent: state.sent,
    priorConfirmed: state.confirmedBefore,
    priorReserved: state.priorReserved,
    newArmedCount: state.count - state.confirmedBefore - state.priorReserved,
    maxIntentions: 24,
    maxNewIntentions: state.maxNewIntentions,
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
  recoveryLedgerR13,
  recoveryLedgerR15,
  recoveryLedgerR16,
  recoveryLedgerR17,
} = {}) {
  validateR13RecoveryDocument(recoveryLedgerR13);
  validateR15RecoveryDocument(recoveryLedgerR15);
  validateR16RecoveryDocument(recoveryLedgerR16);
  validateR17RecoveryDocument(recoveryLedgerR17);
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
      await dismissPreparationOverlays(page);
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
  await tracedPreparation("UI_CONFIRM_FENCE", async () => fence.drain());
  fence.assertSafe();
  const control = scope.getByRole("button", { name: button, exact: true });
  if (
    (await tracedPreparation("UI_CONFIRM_CONTROL", async () => control.count())) !== 1 ||
    !(await tracedPreparation("UI_CONFIRM_CONTROL", async () => control.isEnabled()))
  )
    err("UI_CAPABILITY");
  const fresh = await tracedPreparation("UI_CONFIRM_BEFORE", async () => reconcile("before"));
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
    await tracedPreparation("UI_CONFIRM_CLICK", async () => control.click());
    await tracedPreparation("UI_CONFIRM_FENCE", async () => settleVerifiedPage(page, fence));
    const after = await tracedPreparation("UI_CONFIRM_AFTER", async () => reconcile("after"));
    if (after?.confirmed !== true) {
      broker.resolve("uncertain");
      err("UI_UNCERTAIN");
    }
    broker.resolve("confirmed");
    return true;
  } catch (error) {
    if (broker.snapshot().sent && !broker.snapshot().frozen) broker.resolve("uncertain");
    throw new Error("UI_UNCERTAIN", { cause: error });
  }
}
/** Caller supplies only execution code; cleanup runs after login and every failure. */
export async function withRuntimeLogin(
  runtime,
  credentials,
  execute,
  recoveryLedgerR13,
  recoveryLedgerR15,
  recoveryLedgerR16,
  recoveryLedgerR17,
) {
  validateR13RecoveryDocument(recoveryLedgerR13);
  validateR15RecoveryDocument(recoveryLedgerR15);
  validateR16RecoveryDocument(recoveryLedgerR16);
  validateR17RecoveryDocument(recoveryLedgerR17);
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

const OBSERVATION_CONTRACTS = new Set(
  [...OBSERVED_TABLES]
    .map((name) => "TABLE:" + name)
    .concat([...OBSERVED_RPCS].map((name) => "RPC:" + name)),
);
function observationOwnData(value, names) {
  if (isProxy(value) || !obj(value)) err("OBSERVATION_DIAGNOSTIC");
  const ds = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(ds).length !== names.length) err("OBSERVATION_DIAGNOSTIC");
  const clean = {};
  for (const key of names) {
    const d = ds[key];
    if (!d || !Object.hasOwn(d, "value") || d.enumerable !== true) err("OBSERVATION_DIAGNOSTIC");
    clean[key] = d.value;
  }
  return clean;
}
function observationIdentity(value) {
  const clean = observationOwnData(value, [
    "frontendSha",
    "harnessSha",
    "deploymentId",
    "workflowRun",
  ]);
  if (
    typeof clean.frontendSha !== "string" ||
    !/^[a-f0-9]{40}$/.test(clean.frontendSha) ||
    typeof clean.harnessSha !== "string" ||
    !/^[a-f0-9]{40}$/.test(clean.harnessSha) ||
    typeof clean.deploymentId !== "string" ||
    !/^dpl_[A-Za-z0-9]{8,80}$/.test(clean.deploymentId) ||
    typeof clean.workflowRun !== "string" ||
    !/^[1-9][0-9]{0,19}$/.test(clean.workflowRun)
  )
    err("OBSERVATION_DIAGNOSTIC");
  return clean;
}
function observationFirstFailure(value) {
  if (value === null) return null;
  const clean = observationOwnData(value, [
    "contractKind",
    "stage",
    "statusHTTP",
    "requestFailure",
  ]);
  const { contractKind: kind, stage, statusHTTP: status, requestFailure: failure } = clean;
  if (stage === "UNAVAILABLE") {
    if (kind !== "UNKNOWN" || status !== "NONE" || failure !== "UNAVAILABLE")
      err("OBSERVATION_DIAGNOSTIC");
    return freeze(clean);
  }
  if (
    !OBSERVATION_CONTRACTS.has(kind) ||
    !["NONE", "ABORTED", "OTHER", "UNAVAILABLE"].includes(failure)
  )
    err("OBSERVATION_DIAGNOSTIC");
  if (stage === "HTTP_STATUS") {
    if (
      !Number.isInteger(status) ||
      status < 100 ||
      status > 599 ||
      (status >= 200 && status <= 299) ||
      failure !== "NONE"
    )
      err("OBSERVATION_DIAGNOSTIC");
  } else if (stage === "BODY_READ") {
    if (!Number.isInteger(status) || status < 200 || status > 299) err("OBSERVATION_DIAGNOSTIC");
  } else {
    if (
      ![
        "REQUEST_BINDING",
        "REQUEST_ARGS",
        "RESPONSE_PROJECTION",
        "RESPONSE_CONTEXT",
        "OBSERVATION_LIMIT",
      ].includes(stage) ||
      status !== "NONE" ||
      failure !== "NONE" ||
      (["REQUEST_BINDING", "REQUEST_ARGS"].includes(stage) && !kind.startsWith("RPC:"))
    )
      err("OBSERVATION_DIAGNOSTIC");
  }
  return freeze(clean);
}
export function createObservationDiagnostic(identity, firstFailure = null) {
  const cleanIdentity = observationIdentity(identity);
  return freeze({
    schema: "contaos.fixture.observation.v1",
    ...cleanIdentity,
    firstFailure: observationFirstFailure(firstFailure),
  });
}
export function validateObservationDiagnostic(value, identity) {
  const clean = observationOwnData(value, [
      "schema",
      "frontendSha",
      "harnessSha",
      "deploymentId",
      "workflowRun",
      "firstFailure",
    ]),
    expected = observationIdentity(identity);
  if (clean.schema !== "contaos.fixture.observation.v1") err("OBSERVATION_DIAGNOSTIC");
  const ownIdentity = observationIdentity({
    frontendSha: clean.frontendSha,
    harnessSha: clean.harnessSha,
    deploymentId: clean.deploymentId,
    workflowRun: clean.workflowRun,
  });
  if (!same(ownIdentity, expected)) err("OBSERVATION_DIAGNOSTIC");
  return createObservationDiagnostic(ownIdentity, clean.firstFailure);
}
function observedRequestFailure(request) {
  try {
    const value = request.failure();
    if (value === null) return "NONE";
    if (isProxy(value) || !obj(value)) return "UNAVAILABLE";
    const d = Object.getOwnPropertyDescriptor(value, "errorText");
    if (!d || !Object.hasOwn(d, "value") || typeof d.value !== "string") return "UNAVAILABLE";
    return d.value === "net::ERR_ABORTED" ? "ABORTED" : "OTHER";
  } catch {
    return "UNAVAILABLE";
  }
}

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

const SCOPED_RPC_FIELDS = Object.freeze({
  obter_analise_competencia_v116: {
    "": "schema_versao competencia estado_analise stale execucao_atual percentual blocking_summary allowed_actions mecanismos resultados resultados_paginacao execucoes execucoes_paginacao apontamentos apontamentos_paginacao hash_contexto_atual",
    competencia:
      "id id_organizacao id_contrato competencia_referencia periodo_inicio periodo_fim situacao",
    execucao_atual:
      "id tipo status hash_entrada motor versao_motor provedor modelo prompt_versao iniciada_por iniciada_em concluida_em erro_codigo requisitos_afetados metadados criado_em",
    "execucoes.*":
      "id tipo status hash_entrada contexto_atual motor versao_motor provedor modelo prompt_versao iniciada_por iniciada_em concluida_em erro_codigo requisitos_afetados metadados criado_em",
    "resultados.*":
      "id_resultado id_requisito requisito resultado mecanismo confianca justificativa fundamento hash_evidencias metadados evidencias criado_em",
    "resultados.*.requisito":
      "codigo descricao categoria criticidade obrigatorio aplicavel impeditivo efeito_portao fonte_tipo fonte_referencia fonte_detalhe",
    "resultados.*.evidencias.*":
      "id id_versao_documento pagina trecho tipo_evidencia referencia_externa hash criado_em",
    "apontamentos.*":
      "id id_requisito requisito descricao severidade status origem regra_violada acao_sugerida fonte criado_em atualizado_em",
    "apontamentos.*.requisito": "codigo descricao categoria criticidade",
  },
  obter_detalhe_requisito_v117: {
    "": "schema_versao competencia requisito execucao_atual resultado_atual resultado_referencia na_validade allowed_actions evidencias evidencias_paginacao historico historico_paginacao apontamentos apontamentos_paginacao",
    competencia: "id id_organizacao id_contrato competencia_referencia situacao",
    requisito:
      "id codigo descricao categoria origem_tipo origem_id origem_versao obrigatorio aplicavel impeditivo criticidade fonte_tipo fonte_referencia fonte_detalhe efeito_portao hash_snapshot regra_validacao condicao_aplicabilidade",
    execucao_atual:
      "id tipo status hash_entrada motor versao_motor provedor modelo prompt_versao iniciada_em concluida_em criado_em",
    resultado_atual:
      "id id_execucao resultado confianca justificativa fundamento hash_evidencias criado_em",
    resultado_referencia:
      "id id_execucao resultado mecanismo confianca justificativa fundamento hash_evidencias criado_em",
    na_validade: "valido id_resultado_referencia possui_fundamento possui_evidencia",
    "evidencias.*": "id pagina trecho tipo_evidencia referencia_externa hash criado_em documento",
    "evidencias.*.documento":
      "id_versao_documento numero_versao hash_versao id_arquivo nome_original mime status_seguranca",
    "historico.*":
      "id_resultado id_execucao resultado confianca fundamento justificativa hash_evidencias criado_em tipo_execucao status_execucao motor versao_motor provedor modelo prompt_versao hash_entrada iniciada_em concluida_em mecanismo",
    "apontamentos.*":
      "id descricao severidade status origem regra_violada acao_sugerida fonte criado_em atualizado_em",
  },
});
export function projectScopedRpcResponse(rpc, value) {
  const contract = SCOPED_RPC_FIELDS[rpc];
  if (!contract) err("OBSERVATION_ENDPOINT");
  const common = {
    allowed_actions: "executar_analise reanalisar abrir_requisito",
    resultados_paginacao: "offset limite total",
    execucoes_paginacao: "offset limite total",
    apontamentos_paginacao: "offset limite total",
    evidencias_paginacao: "offset limite total",
    historico_paginacao: "offset limite total",
    ...(rpc === "obter_analise_competencia_v116"
      ? {
          blocking_summary:
            "total conformes_ou_na_validos pendentes nao_conformes inconclusivos em_analise nao_conformidades_bloqueantes percentual liberado",
        }
      : {}),
  };
  const nullableObjects = new Set([
    "execucao_atual",
    "resultado_atual",
    "resultado_referencia",
    "na_validade",
    "apontamentos.*.requisito",
    "evidencias.*.documento",
  ]);
  const omit = new Set(
    rpc === "obter_analise_competencia_v116"
      ? [
          "hash_contexto_atual",
          "execucao_atual.iniciada_por",
          "execucao_atual.requisitos_afetados",
          "execucao_atual.metadados",
          "execucoes.*.contexto_atual",
          "execucoes.*.iniciada_por",
          "execucoes.*.requisitos_afetados",
          "execucoes.*.metadados",
          "resultados.*.metadados",
        ]
      : ["requisito.condicao_aplicabilidade", "na_validade.id_resultado_referencia"],
  );
  const arrays = new Set(
    rpc === "obter_analise_competencia_v116"
      ? ["resultados", "execucoes", "apontamentos", "resultados.*.evidencias"]
      : ["evidencias", "historico", "apontamentos"],
  );
  function descriptors(input) {
    if (isProxy(input) || !obj(input)) err("OBSERVATION_SCHEMA");
    return Object.getOwnPropertyDescriptors(input);
  }
  const root = descriptors(value);
  let executionPresent = false;
  if (root.execucao_atual) {
    if (!Object.hasOwn(root.execucao_atual, "value")) err("OBSERVATION_SCHEMA");
    executionPresent = root.execucao_atual.value !== null;
  }
  function walk(input, path = "", depth = 0, strict = false) {
    if (depth > 24) err("OBSERVATION_LIMIT");
    if (isProxy(input)) err("OBSERVATION_SCHEMA");
    const fieldList = contract[path] || common[path];
    if (fieldList && (Array.isArray(input) || (input === null && !nullableObjects.has(path))))
      err("OBSERVATION_SCHEMA");
    if (
      path === "mecanismos" &&
      (input === null || typeof input !== "object" || Array.isArray(input))
    )
      err("OBSERVATION_SCHEMA");
    if (arrays.has(path) && !Array.isArray(input)) err("OBSERVATION_SCHEMA");
    if (Array.isArray(input)) {
      if (Object.getPrototypeOf(input) !== Array.prototype || input.length > 1000)
        err("OBSERVATION_LIMIT");
      const ds = Object.getOwnPropertyDescriptors(input);
      if (Reflect.ownKeys(ds).length !== input.length + 1) err("OBSERVATION_SCHEMA");
      return Array.from({ length: input.length }, (_, i) => {
        const d = ds[i];
        if (!d || !Object.hasOwn(d, "value")) err("OBSERVATION_SCHEMA");
        return walk(d.value, path + ".*", depth + 1, strict);
      });
    }
    if (input !== null && typeof input === "object") {
      const ds = descriptors(input),
        result = {};
      const keys = Reflect.ownKeys(ds);
      if (path === "mecanismos" && rpc === "obter_analise_competencia_v116") {
        const names = ["deterministico", "semantico", "humano", "nao_identificado"];
        if (!executionPresent && keys.length === 0) return {};
        if (keys.length !== 4 || keys.some((k) => typeof k !== "string" || !names.includes(k)))
          err("OBSERVATION_SCHEMA");
        for (const key of names) {
          const d = ds[key];
          if (!d || !Object.hasOwn(d, "value") || !Number.isInteger(d.value) || d.value < 0)
            err("OBSERVATION_SCHEMA");
          result[key] = d.value;
        }
        return result;
      }
      const fields = fieldList ? new Set(fieldList.split(" ")) : null;
      if (
        path === "allowed_actions" &&
        (keys.length !== 3 ||
          ["executar_analise", "reanalisar", "abrir_requisito"].some((k) => !ds[k]))
      )
        err("OBSERVATION_SCHEMA");
      if (
        path.endsWith("_paginacao") &&
        (keys.length !== 3 || ["offset", "limite", "total"].some((k) => !ds[k]))
      )
        err("OBSERVATION_SCHEMA");
      for (const key of keys) {
        if (typeof key !== "string" || ["__proto__", "prototype", "constructor"].includes(key))
          err("OBSERVATION_SCHEMA");
        const child = path ? path + "." + key : key;
        if (fields && !fields.has(key)) err("OBSERVATION_SCHEMA");
        if (omit.has(child)) continue;
        if (key === "metadados") err("OBSERVATION_METADATA");
        if (
          PRIVATE_RESPONSE_KEYS.has(key) ||
          /(?:email|password|secret|token|cookie|authorization)/i.test(key)
        ) {
          if (fields) err("OBSERVATION_SCHEMA");
          continue;
        }
        if (!fields && !OBSERVED_KEYS.has(key)) {
          if (strict) result.__unapproved_fields = true;
          continue;
        }
        const d = ds[key];
        if (!Object.hasOwn(d, "value") || !d.enumerable) err("OBSERVATION_SCHEMA");
        if (path === "allowed_actions" && typeof d.value !== "boolean") err("OBSERVATION_SCHEMA");
        if (
          path.endsWith("_paginacao") &&
          (!Number.isSafeInteger(d.value) ||
            d.value < 0 ||
            (key === "limite" &&
              d.value !==
                (rpc === "obter_analise_competencia_v116" && path === "execucoes_paginacao"
                  ? 10
                  : 25)))
        )
          err("OBSERVATION_SCHEMA");
        if (
          path === "blocking_summary" &&
          (key === "liberado"
            ? typeof d.value !== "boolean"
            : key === "percentual"
              ? typeof d.value !== "number" ||
                !Number.isFinite(d.value) ||
                d.value < 0 ||
                d.value > 100
              : !Number.isSafeInteger(d.value) || d.value < 0)
        )
          err("OBSERVATION_SCHEMA");
        if (
          child === "schema_versao" &&
          d.value !== (rpc === "obter_analise_competencia_v116" ? "v116-v1" : "v117-v1")
        )
          err("OBSERVATION_SCHEMA");
        if (
          child === "apontamentos.*.acao_sugerida" &&
          d.value !== null &&
          (typeof d.value !== "string" || d.value.length > 65536)
        )
          err("OBSERVATION_SCHEMA");
        result[key] = walk(d.value, child, depth + 1, strict || key === "regra_validacao");
      }
      return result;
    }
    if (fieldList && input !== null) err("OBSERVATION_SCHEMA");
    if (path === "mecanismos") err("OBSERVATION_SCHEMA");
    if (typeof input === "string" && input.length > 65536) err("OBSERVATION_LIMIT");
    if (
      input === null ||
      ["string", "boolean"].includes(typeof input) ||
      (typeof input === "number" && Number.isFinite(input))
    )
      return input;
    err("OBSERVATION_SCHEMA");
  }
  if (!root.mecanismos && rpc === "obter_analise_competencia_v116") err("OBSERVATION_SCHEMA");
  return walk(value);
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

export function readbackTargets(rpc, payload = {}, evidence = {}) {
  const comp =
    payload.p_id_competencia ||
    (rpc === "aprovar_parecer_interno"
      ? evidence.opinions?.find((row) => row.id === payload.p_id_parecer)?.competency
      : undefined);
  const context = { id_organizacao: FIXTURE.organization, id_contrato: FIXTURE.contract };
  const c = { p_id_competencia: comp };
  const mapping = {
    registrar_versao_fonte_v107: [["versoes_fontes_normativas", { id_fonte: FIXTURE.source }]],
    aprovar_versao_fonte_v107: [["versoes_fontes_normativas", { id: payload.p_id_versao }]],
    salvar_fonte_normativa_v107: [["fontes_normativas", { id: FIXTURE.source }]],
    executar_comando_lista_v1: [
      [
        "obter_lista_operacional_v1",
        {
          p_id_organizacao: FIXTURE.organization,
          p_id_contrato: FIXTURE.contract,
          ...(payload.p_id_lista ? { p_id_lista: payload.p_id_lista } : {}),
        },
      ],
    ],
    criar_competencia: [
      [
        "competencias",
        { id_contrato: FIXTURE.contract, competencia_referencia: payload.p_competencia_referencia },
      ],
    ],
    criar_documento_competencia_v115: [["obter_documentos_competencia_v115", c]],
    solicitar_analise_competencia: [["obter_analise_competencia_v116", c]],
    registrar_revisao_requisito_v117: [["obter_analise_competencia_v116", c]],
    solicitar_parecer_interno: [["pareceres_internos", { ...context, id_competencia: comp }]],
    aprovar_parecer_interno: [
      ["pareceres_internos", { ...context, id_competencia: comp, id: payload.p_id_parecer }],
    ],
    aprovar_apresentacao: [["obter_visao_geral_competencia", c]],
    registrar_apresentacao: [
      ["apresentacoes_contratante", { id_competencia: comp }],
      ["pacotes_competencia", { id_competencia: comp }],
      ["itens_pacote_competencia", { id_competencia: comp }],
      ["obter_visao_geral_competencia", c],
    ],
  };
  const targets = mapping[rpc];
  if (
    !targets ||
    targets.some(
      ([name, where]) =>
        Object.values(where).some((v) => v === undefined) ||
        (!OBSERVED_TABLES.has(name) && !OBSERVED_RPCS.has(name)),
    )
  )
    err("OBSERVATION_MUTATION");
  return targets.map(([name, where]) => ({
    name,
    where,
    ...(rpc === "executar_comando_lista_v1" && evidence.list?.versionId
      ? { versionId: evidence.list.versionId }
      : {}),
  }));
}

export function createOfficialObserver(page, { wait, now, identity } = {}) {
  const observerIdentity = identity === undefined ? null : observationIdentity(identity);
  const floors = [];
  const mutations = [],
    mutationRequests = new WeakMap();
  const pending = new Set(),
    tables = new Map(),
    rpcs = new Map(),
    sequences = new WeakMap();
  let sequence = 0,
    failed = false,
    closed = false,
    sealing = false;
  const rejectedOpinionOrdinals = new Map();
  let firstFailure = null;
  const recordFailure = (contractKind, stage, statusHTTP = "NONE", requestFailure = "NONE") => {
    failed = true;
    if (firstFailure !== null) return;
    try {
      firstFailure = observationFirstFailure({ contractKind, stage, statusHTTP, requestFailure });
    } catch {
      firstFailure = Object.freeze({
        contractKind: "UNKNOWN",
        stage: "UNAVAILABLE",
        statusHTTP: "NONE",
        requestFailure: "UNAVAILABLE",
      });
    }
  };

  const readBudgets = new WeakMap(),
    pendingReads = new Set(),
    latestReads = new Map(),
    readAssociations = new WeakMap();
  const readClock = typeof now === "function" ? now : () => performance.now();
  function unavailableRead() {
    recordFailure("UNKNOWN", "UNAVAILABLE", "NONE", "UNAVAILABLE");
    err("OBSERVATION_FAILED");
  }
  function budgetState(token) {
    const state = readBudgets.get(token);
    if (!state || state.released) err("OBSERVATION_ORDINAL");
    const current = readClock();
    if (
      state.expired ||
      !Number.isFinite(current) ||
      current < state.last ||
      current >= state.deadline
    ) {
      state.expired = true;
      unavailableRead();
    }
    state.last = current;
    if (failed || closed) err("OBSERVATION_FAILED");
    return state;
  }
  function budgetRemaining(token) {
    const state = budgetState(token),
      remaining = state.deadline - state.last;
    if (!Number.isFinite(remaining) || remaining <= 0) {
      state.expired = true;
      unavailableRead();
    }
    return Math.ceil(remaining);
  }
  async function withReadBudget(execute, token) {
    if (typeof execute !== "function" || isProxy(execute)) err("OBSERVATION_ORDINAL");
    const owns = token === undefined;
    if (owns) {
      const current = readClock();
      if (!Number.isFinite(current)) unavailableRead();
      token = Object.freeze({});
      readBudgets.set(token, {
        deadline: current + 15000,
        last: current,
        expired: false,
        released: false,
      });
    }
    budgetState(token);
    let timer;
    try {
      const value = await Promise.race([
        Promise.resolve().then(() => {
          budgetState(token);
          return execute(token);
        }),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            const state = readBudgets.get(token);
            if (state) state.expired = true;
            recordFailure("UNKNOWN", "UNAVAILABLE", "NONE", "UNAVAILABLE");
            reject(new Error("OBSERVATION_FAILED"));
          }, budgetRemaining(token));
        }),
      ]);
      budgetState(token);
      return value;
    } catch (error) {
      budgetState(token);
      throw error;
    } finally {
      clearTimeout(timer);
      if (owns) {
        const state = readBudgets.get(token);
        if (state) state.released = true;
      }
    }
  }
  function dataOptions(value) {
    if (isProxy(value) || !obj(value)) err("OBSERVATION_PROJECTION");
    const ds = Object.getOwnPropertyDescriptors(value),
      clean = {};
    for (const key of Reflect.ownKeys(ds)) {
      if (
        typeof key !== "string" ||
        !["select", "after", "queryScope", "readBudget"].includes(key) ||
        !Object.hasOwn(ds[key], "value")
      )
        err("OBSERVATION_PROJECTION");
      clean[key] = ds[key].value;
    }
    if (Object.hasOwn(clean, "readBudget")) budgetState(clean.readBudget);
    return clean;
  }
  function monthOptions(table, where, after, value) {
    const options = dataOptions(value);
    if (!Object.hasOwn(options, "queryScope")) return { options, scoped: false };
    if (
      options.queryScope !== "RECOVERY_COMPETENCE_MONTH" ||
      table !== "competencias" ||
      isProxy(where) ||
      !obj(where)
    )
      err("OBSERVATION_PROJECTION");
    const ds = Object.getOwnPropertyDescriptors(where);
    if (
      Reflect.ownKeys(ds).length !== 2 ||
      ["id_contrato", "competencia_referencia"].some(
        (k) => !ds[k] || !Object.hasOwn(ds[k], "value"),
      )
    )
      err("OBSERVATION_PROJECTION");
    if (
      ds.id_contrato.value !== FIXTURE.contract ||
      !months.includes(ds.competencia_referencia.value) ||
      options.select !==
        EXACT_SELECTS.competencias.find((v) => v.includes("competencia_referencia,"))
    )
      err("OBSERVATION_PROJECTION");
    const ordinal = after === undefined ? options.after : after;
    if (
      !Number.isSafeInteger(ordinal) ||
      ordinal < 0 ||
      (options.after !== undefined && options.after !== ordinal)
    )
      err("OBSERVATION_ORDINAL");
    if (causalFloor(table, where)) err("OBSERVATION_MUTATION");
    return {
      options: { ...options, after: ordinal },
      scoped: true,
      where: Object.freeze({
        id_contrato: ds.id_contrato.value,
        competencia_referencia: ds.competencia_referencia.value,
      }),
    };
  }
  function legacyReadOptions(options) {
    const { readBudget, queryScope, ...legacy } = options;
    return legacy;
  }
  function latestMonth(where, after, select) {
    const relevant = [...latestReads.values()]
      .filter(
        (e) =>
          e.table === "competencias" &&
          (e.query.predicates.get("id_contrato")?.value === where.id_contrato ||
            e.contractFromResponse === where.id_contrato) &&
          (!e.query.predicates.has("competencia_referencia") ||
            e.query.predicates.get("competencia_referencia").value ===
              where.competencia_referencia),
      )
      .sort((a, b) => b.ordinal - a.ordinal);
    const latest = relevant[0];
    if (!latest || latest.ordinal <= after || !latest.done) return null;
    const { q, predicates, key } = latest.query;
    if (
      q.select !== select ||
      predicates.size !== 2 ||
      predicates.get("id_contrato")?.kind !== "eq" ||
      predicates.get("id_contrato")?.value !== where.id_contrato ||
      predicates.get("competencia_referencia")?.kind !== "eq" ||
      predicates.get("competencia_referencia").value !== where.competencia_referencia ||
      q.offset !== "0" ||
      q.limit !== "25" ||
      q.order !== "competencia_referencia.desc,id.desc" ||
      Object.hasOwn(q, "situacao")
    )
      return null;
    const entry = tables.get("competencias")?.get(key);
    if (!entry || entry.ordinal !== latest.ordinal) return null;
    return entry.rows.filter((row) => matchesObservation(entry, row, where));
  }
  function observeReadRequest(request, url, ordinal) {
    const method = request.method(),
      table = /^\/rest\/v1\/([a-z_0-9]+)$/.exec(url.pathname)?.[1],
      rpc = /^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname)?.[1];
    if (url.origin !== FIXTURE.api || url.username || url.password || url.hash) return;
    let record, key;
    if (method === "GET" && OBSERVED_TABLES.has(table)) {
      let query;
      try {
        query = parseObservedQuery(table, url);
      } catch {
        // Rejected queries remain unadmitted. Only a single exact competence
        // filter proves an unrelated scope; missing or compound filters cannot
        // preserve an earlier October seal or September post-ACK observation.
        if (table === "pareceres_internos") {
          const values = url.searchParams.getAll("id_competencia");
          const exact =
            values.length === 1
              ? /^eq\.([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(
                  values[0],
                )
              : null;
          for (const competency of R5_BINDINGS.competencies)
            if (!exact || exact[1] === competency.id)
              rejectedOpinionOrdinals.set(competency.id, ordinal);
        }
        return;
      }
      record = { table, query, ordinal, done: false };
      key = "TABLE:" + table + ":" + query.key;
    } else if (
      method === "POST" &&
      !url.search &&
      OBSERVED_RPCS.has(rpc) &&
      !BUSINESS_RPCS.includes(rpc)
    ) {
      let args;
      try {
        args = request.postData()
          ? projectOfficialResponse(parseBusinessJson(request.postData()))
          : {};
      } catch {
        return;
      }
      if (
        (Object.hasOwn(args, "p_id_organizacao") &&
          args.p_id_organizacao !== FIXTURE.organization) ||
        (Object.hasOwn(args, "p_id_contrato") && args.p_id_contrato !== FIXTURE.contract)
      )
        return;
      record = { rpc, ordinal, done: false };
      key = "RPC:" + rpc + ":" + canonical(args);
    } else return;
    readAssociations.set(request, record);
    pendingReads.add(record);
    latestReads.set(key, record);
    if (pendingReads.size > 1024 || latestReads.size > 1024) {
      recordFailure(table ? "TABLE:" + table : "RPC:" + rpc, "OBSERVATION_LIMIT");
      err("OBSERVATION_LIMIT");
    }
  }

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
    if (!closed && !sealing) {
      sequences.set(request, ++sequence);
      let requestContract = "UNKNOWN";
      try {
        const url = new URL(request.url());
        observeReadRequest(request, url, sequence);
        const rpc =
          url.origin === FIXTURE.api &&
          request.method() === "POST" &&
          /^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname)?.[1];
        if (rpc && OBSERVED_RPCS.has(rpc)) requestContract = "RPC:" + rpc;
        const candidates = mutations.filter((m) => m.rpc === rpc && !m.request);
        if (candidates.length > 1) {
          recordFailure(requestContract, "REQUEST_BINDING");
          return;
        }
        const mutation = candidates[0];
        if (mutation) {
          if (url.search || url.username || url.password || url.hash) {
            recordFailure(requestContract, "REQUEST_BINDING");
            return;
          }
          const body = JSON.parse(request.postData());
          if (!body || typeof body !== "object" || Array.isArray(body)) {
            recordFailure(requestContract, "REQUEST_BINDING");
            return;
          }
          const expected = structuredClone(mutation.payload),
            binding = mutation.binding;
          if (binding?.uiGeneratedKey) {
            const key = binding.uiGeneratedKey;
            if (!uuid(body[key])) {
              recordFailure(requestContract, "REQUEST_BINDING");
              return;
            }
            expected[key] = body[key];
          } else if (
            binding?.bodyKey &&
            (!uuid(binding.requestId) || body[binding.bodyKey] !== binding.requestId)
          ) {
            recordFailure(requestContract, "REQUEST_BINDING");
            return;
          }
          if (!same(body, expected)) {
            recordFailure(requestContract, "REQUEST_BINDING");
            return;
          }
          mutation.request = request;
          mutation.requestOrdinal = sequence;
          mutationRequests.set(request, mutation);
        }
      } catch {
        recordFailure(requestContract, "REQUEST_BINDING");
      }
    }
  };
  const onResponse = (response) => {
    if (closed) return;
    let request, url, table, rpc;
    try {
      request = response.request();
      if (sealing && !sequences.has(request)) return;
      url = new URL(response.url());
      if (url.origin !== FIXTURE.api || url.username || url.password || url.hash) return;
      const tm = /^\/rest\/v1\/([a-z_0-9]+)$/.exec(url.pathname),
        rm = /^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname);
      if (tm && request.method() === "GET" && OBSERVED_TABLES.has(tm[1])) table = tm[1];
      else if (rm && request.method() === "POST" && !url.search && OBSERVED_RPCS.has(rm[1]))
        rpc = rm[1];
      else return;
    } catch {
      recordFailure("UNKNOWN", "UNAVAILABLE", "NONE", "UNAVAILABLE");
      return;
    }
    const ordinal = sequences.get(request);
    const readRecord = readAssociations.get(request);
    const mutation = mutationRequests.get(request),
      responseOrdinal = sequence;
    const contractKind = table ? "TABLE:" + table : "RPC:" + rpc;
    let stage = "REQUEST_ARGS",
      statusHTTP = "NONE",
      requestFailure = "NONE";
    const task = (async () => {
      try {
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
        stage = "UNAVAILABLE";
        const status = response.status();
        if (!Number.isInteger(status) || status < 100 || status > 599) err("OBSERVATION_RESPONSE");
        if (status < 200 || status > 299) {
          stage = "HTTP_STATUS";
          statusHTTP = status;
          err("OBSERVATION_RESPONSE");
        }
        stage = "BODY_READ";
        statusHTTP = status;
        let bytes;
        try {
          bytes = await response.body();
        } catch (error) {
          requestFailure = observedRequestFailure(request);
          throw error;
        }
        stage = "RESPONSE_PROJECTION";
        statusHTTP = "NONE";
        let value;
        try {
          if (bytes.length > 1048576) {
            stage = "OBSERVATION_LIMIT";
            err("OBSERVATION_LIMIT");
          }
          const fields = table
            ? TABLE_RESPONSE_FIELDS[table]
            : RPC_RESPONSE_FIELDS[rpc] ||
              (BUSINESS_RPCS.includes(rpc) ? BUSINESS_RESPONSE_FIELDS : null);
          if (!fields) err("OBSERVATION_ENDPOINT");
          let decoded;
          if (status === 204) {
            if (
              rpc !== "aprovar_parecer_interno" ||
              request.method() !== "POST" ||
              !mutation ||
              mutation.request !== request ||
              mutation.rpc !== rpc ||
              bytes.length !== 0
            )
              err("OBSERVATION_RESPONSE");
            decoded = null;
          } else decoded = JSON.parse(bytes.toString("utf8"));
          value = Object.hasOwn(SCOPED_RPC_FIELDS, rpc)
            ? projectScopedRpcResponse(rpc, decoded)
            : projectOfficialResponse(decoded, 0, false, new Set(fields.split(" ")));
        } finally {
          bytes.fill(0);
        }
        if (closed) return;
        if (mutation) {
          mutation.responseOrdinal = responseOrdinal;
          mutation.ack = value;
          mutation.admitted = true;
        }
        if (table) {
          stage = "RESPONSE_CONTEXT";
          const rows = value === null ? [] : Array.isArray(value) ? value : [value];
          if (rows.length > 1000) {
            stage = "OBSERVATION_LIMIT";
            err("OBSERVATION_LIMIT");
          }
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
          if (
            readRecord &&
            table === "competencias" &&
            rows.some((row) => row.id_contrato === FIXTURE.contract)
          )
            readRecord.contractFromResponse = FIXTURE.contract;
          const ledger = tables.get(table) || new Map(),
            prior = ledger.get(query.key);
          if (!prior || prior.ordinal < ordinal)
            ledger.set(query.key, {
              ...query,
              ordinal,
              rows,
              validatedOrdinal: [
                "apresentacoes_contratante",
                "pacotes_competencia",
                "itens_pacote_competencia",
              ].includes(table)
                ? ++sequence
                : responseOrdinal,
            });
          if (ledger.size > 1024) {
            stage = "OBSERVATION_LIMIT";
            err("OBSERVATION_LIMIT");
          }
          tables.set(table, ledger);
        } else {
          const cache = rpcs.get(rpc) || [];
          cache.push({ ordinal, args, value });
          cache.sort((a, b) => b.ordinal - a.ordinal);
          rpcs.set(rpc, cache.slice(0, 64));
        }
        stage = "OBSERVATION_LIMIT";
        checkBudget();
        if (readRecord) {
          readRecord.responseOrdinal = responseOrdinal;
          readRecord.done = true;
          pendingReads.delete(readRecord);
        }
      } catch (error) {
        if (readRecord) {
          readRecord.responseOrdinal = responseOrdinal;
          readRecord.done = true;
          pendingReads.delete(readRecord);
        }
        if (stage === "UNAVAILABLE") recordFailure("UNKNOWN", "UNAVAILABLE", "NONE", "UNAVAILABLE");
        else recordFailure(contractKind, stage, statusHTTP, requestFailure);
        throw error;
      }
    })();
    pending.add(task);
    task.catch(() => {}).finally(() => pending.delete(task));
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
      Object.keys(options).some((k) => !["select", "after"].includes(k)) ||
      (options.after !== undefined &&
        (!Number.isSafeInteger(options.after) || options.after < 0)) ||
      (options.select !== undefined && !EXACT_SELECTS[table]?.includes(options.select))
    )
      err("OBSERVATION_PROJECTION");
    const ledger = entries(table).filter(
        (e) =>
          (options.select === undefined || e.q.select === options.select) &&
          (options.after === undefined || e.ordinal > options.after),
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
  function causalFloor(name, where) {
    const bare = rpcName(name) || name;
    return (
      floors
        .filter(
          (f) =>
            f.name === bare &&
            !Object.entries(where).some(([k, v]) => Object.hasOwn(f.where, k) && f.where[k] !== v),
        )
        .sort((a, b) => b.ordinal - a.ordinal)[0] || null
    );
  }

  function tableRows(table, where, options) {
    if (!OBSERVED_TABLES.has(table) || !tables.has(table)) err("OBSERVATION_TABLE");
    const { latest, ledger } = selectLatest(table, options),
      empty = ledger.find((e) => e.rows.length === 0 && coversAbsence(e, where));
    return [...latest.values()]
      .filter(
        ({ e, row }) => (!empty || e.ordinal >= empty.ordinal) && matchesObservation(e, row, where),
      )
      .map(({ row }) => row);
  }
  function rpcItem(rpc, where, options) {
    return (rpcs.get(rpc) || []).find(
      (e) =>
        (options.after === undefined || e.ordinal > options.after) &&
        Object.entries(where).every(([k, v]) => pathValue(e.args, k) === v),
    );
  }

  function expectedReadback(target, data) {
    const { rpc, payload: p, ack } = target.mutation;
    if (rpc === "salvar_fonte_normativa_v107")
      return (
        data.length === 1 &&
        data[0].situacao === "ativa" &&
        (!Number.isInteger(p.p_versao_esperada) ||
          data[0].versao_registro === p.p_versao_esperada + 1)
      );
    if (rpc === "registrar_versao_fonte_v107") return data.length === 1 && uuid(data[0].id);
    if (rpc === "aprovar_versao_fonte_v107") return data.length === 1 && !!data[0].aprovado_em;
    if (rpc === "executar_comando_lista_v1")
      return (
        data?.lista?.versao_registro ===
          (p.p_versao_esperada === null ? 1 : p.p_versao_esperada + 1) &&
        data.lista.id === (p.p_id_lista || ack?.lista?.id) &&
        (!target.versionId || data.versao?.id === target.versionId)
      );
    if (rpc === "criar_competencia")
      return (
        data.length === 1 &&
        uuid(ack) &&
        data[0].id === ack &&
        data[0].competencia_referencia === p.p_competencia_referencia
      );
    if (rpc === "criar_documento_competencia_v115")
      return (
        data?.documentos?.some(
          (d) =>
            d.situacao === "ativo" &&
            d.arquivo?.id === p.p_id_arquivo &&
            d.requisito?.id === p.p_id_requisito,
        ) === true
      );
    if (rpc === "solicitar_analise_competencia")
      return (
        uuid(ack) &&
        data?.execucao_atual?.id === ack &&
        ["queued", "processing", "complete"].includes(data.estado_analise)
      );
    if (rpc === "registrar_revisao_requisito_v117")
      return uuid(data?.execucao_atual?.id) && data.execucao_atual.id !== p.p_id_execucao_esperada;
    if (rpc === "solicitar_parecer_interno")
      return (
        p.p_id_competencia === R5_BINDINGS.competencies[1].id && uuid(ack) && Array.isArray(data)
      );
    if (rpc === "aprovar_parecer_interno")
      return (
        data.length === 1 &&
        data[0].id === p.p_id_parecer &&
        data[0].status === "aprovado" &&
        !!data[0].aprovado_em
      );
    if (rpc === "aprovar_apresentacao")
      return (
        uuid(ack?.id_aprovacao) &&
        ack.situacao === "pode_apresentar_contratante" &&
        ack.percentual_conformidade === 100 &&
        data?.competencia?.id === p.p_id_competencia &&
        data.competencia.id_organizacao === FIXTURE.organization &&
        data.competencia.id_contrato === FIXTURE.contract &&
        data.competencia.situacao === "pode_apresentar_contratante" &&
        data.competencia.percentual_conformidade === 100 &&
        data?.blocking_summary?.aprovacao_apresentacao_atual === true &&
        data.blocking_summary.analise_concluida_atual === true &&
        data.blocking_summary.parecer_aprovado === true &&
        data.portao?.liberado === true &&
        data.portao.percentual === 100
      );
    if (rpc === "registrar_apresentacao" && target.name === "obter_visao_geral_competencia") {
      const mutation = target.mutation;
      const overview = (rpcs.get(target.name) || []).find((entry) => entry.value === data);
      const competency = data?.competencia;
      if (
        !mutation.admitted ||
        !uuid(ack) ||
        mutation.responseOrdinal === null ||
        !overview ||
        competency?.id !== p.p_id_competencia ||
        competency.id_organizacao !== FIXTURE.organization ||
        competency.id_contrato !== FIXTURE.contract ||
        competency.situacao !== "aguardando_contratante" ||
        competency.percentual_conformidade !== 100
      )
        return false;
      const context = {
        id_competencia: p.p_id_competencia,
        id_organizacao: FIXTURE.organization,
        id_contrato: FIXTURE.contract,
      };
      const proofRows = (table, where) => {
        if (!tables.has(table)) return null;
        const relevant = (record) =>
          record.table === table &&
          Object.entries(where).every(([key, value]) => {
            const predicate = record.query.predicates.get(key);
            return !predicate || (predicate.kind === "eq" && predicate.value === value);
          });
        if ([...pendingReads].some(relevant)) return null;
        const latestRead = [...latestReads.values()]
          .filter(relevant)
          .sort((a, b) => b.ordinal - a.ordinal)[0];
        if (!latestRead?.done || latestRead.ordinal <= mutation.responseOrdinal) return null;
        const options = { after: mutation.responseOrdinal };
        const rows = tableRows(table, where, options);
        const { latest } = selectLatest(table, options);
        if (
          !rows.length ||
          rows.some((row) => {
            const entry = latest.get(row.id)?.e;
            return (
              !entry ||
              entry.ordinal >= overview.ordinal ||
              !Number.isSafeInteger(entry.validatedOrdinal) ||
              entry.validatedOrdinal >= overview.ordinal ||
              latestRead.ordinal !== entry.ordinal ||
              Object.entries(context).some(([key, value]) => row[key] !== value)
            );
          })
        )
          return null;
        return rows;
      };
      const presentations = proofRows("apresentacoes_contratante", { ...context, id: ack });
      if (
        presentations?.length !== 1 ||
        !presentations[0].apresentado_em ||
        presentations[0].protocolo !== p.p_protocolo ||
        presentations[0].forma_apresentacao !== p.p_forma_apresentacao ||
        !uuid(presentations[0].id_pacote)
      )
        return false;
      const packages = proofRows("pacotes_competencia", {
        ...context,
        id: presentations[0].id_pacote,
      });
      if (
        packages?.length !== 1 ||
        packages[0].status !== "apresentado" ||
        !packages[0].congelado_em ||
        !/^[a-f0-9]{64}$/.test(packages[0].hash_pacote)
      )
        return false;
      const items = proofRows("itens_pacote_competencia", {
        ...context,
        id_pacote: packages[0].id,
      });
      return (
        items !== null &&
        items.every(
          (row) =>
            uuid(row.id) &&
            row.id_pacote === packages[0].id &&
            typeof row.hash === "string" &&
            /^[0-9a-f]{64}$/.test(row.hash),
        )
      );
    }
    if (rpc === "registrar_apresentacao")
      return target.name === "apresentacoes_contratante"
        ? uuid(ack) && data.length === 1 && data[0].id === ack
        : data.length >= 1 && data.every((row) => uuid(row.id));
    return false;
  }

  async function waitTarget(target, where, options) {
    return waitOfficialPhase({
      read: async () => {
        await flush();
        const m = target.mutation;
        if (!m.admitted || m.responseOrdinal === null) return false;
        const after = Math.max(options.after || 0, m.responseOrdinal),
          filtered = { ...options, after };
        if (!(await api.observedAfter(target.name, where, after, filtered))) return false;
        const opinion =
          target.mutation.rpc === "solicitar_parecer_interno"
            ? opinionObservation(R5_BINDINGS.competencies[1].id, after)
            : null;
        if (target.mutation.rpc === "solicitar_parecer_interno" && !opinion) return false;
        const rpc = rpcName(target.name),
          item = rpc ? rpcItem(rpc, where, filtered) : null,
          data = opinion
            ? opinion.rows
            : rpc
              ? item?.value
              : tableRows(target.name, where, filtered);
        if (
          target.versionId &&
          (!item ||
            item.value?.versao?.id !== target.versionId ||
            (item.args.p_id_versao !== null && item.args.p_id_versao !== target.versionId))
        )
          return false;
        return expectedReadback(target, data)
          ? freeze({ value: structuredClone(data), minimumOrdinal: after })
          : false;
      },
      ready: (value) => value !== false,
      ...(wait ? { wait } : {}),
      ...(now ? { now } : {}),
    });
  }

  function exactOpinionQuery(query, competency) {
    const { q, predicates } = query;
    return (
      Object.keys(q).length === 7 &&
      q.select === EXACT_SELECTS.pareceres_internos[0] &&
      q.order === "versao.desc,id.desc" &&
      q.offset === "0" &&
      q.limit === "25" &&
      predicates.size === 3 &&
      [
        ["id_competencia", competency],
        ["id_organizacao", FIXTURE.organization],
        ["id_contrato", FIXTURE.contract],
      ].every(
        ([key, value]) => predicates.get(key)?.kind === "eq" && predicates.get(key).value === value,
      )
    );
  }
  function opinionIso(value) {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      Number.isFinite(Date.parse(value))
    );
  }
  function opinionObservation(competency, after) {
    if (closed || sealing || failed || (rejectedOpinionOrdinals.get(competency) || 0) > after)
      err("RECOVERY_R11_OPINION");
    const relevant = (record) =>
      record.table === "pareceres_internos" &&
      record.query.predicates.get("id_competencia")?.value === competency;
    if ([...pendingReads].some(relevant)) return null;
    const latest = [...latestReads.values()]
      .filter(relevant)
      .sort((a, b) => b.ordinal - a.ordinal)[0];
    if (!latest || latest.ordinal <= after || !latest.done) return null;
    if (!exactOpinionQuery(latest.query, competency)) err("RECOVERY_R11_OPINION");
    const entry = tables.get("pareceres_internos")?.get(latest.query.key);
    if (!entry || entry.ordinal !== latest.ordinal || entry.rows.length > 25) return null;
    const ids = new Set();
    for (const row of entry.rows) {
      if (
        !obj(row) ||
        !uuid(row.id) ||
        ids.has(row.id) ||
        row.id_competencia !== competency ||
        row.id_organizacao !== FIXTURE.organization ||
        row.id_contrato !== FIXTURE.contract ||
        !Number.isSafeInteger(row.versao) ||
        row.versao < 1 ||
        typeof row.hash !== "string" ||
        !/^[a-f0-9]{64}$/.test(row.hash) ||
        !["rascunho", "aprovado", "rejeitado", "substituido"].includes(row.status) ||
        !opinionIso(row.criado_em) ||
        (row.aprovado_em !== null && !opinionIso(row.aprovado_em))
      )
        err("RECOVERY_R11_OPINION");
      ids.add(row.id);
    }
    const rows = [...entry.rows].sort((a, b) => b.versao - a.versao);
    if (rows.length > 1 && rows[0].versao === rows[1].versao) err("RECOVERY_R11_OPINION");
    const row = rows[0] || null;
    if (
      row &&
      !(
        (row.status === "rascunho" && row.aprovado_em === null) ||
        (row.status === "aprovado" && opinionIso(row.aprovado_em))
      )
    )
      err("RECOVERY_R11_OPINION");
    return { rows, row, ordinal: latest.ordinal, responseOrdinal: latest.responseOrdinal };
  }
  function sealRecoveryOpinion(owner, after) {
    validateR13RecoveryDocument(R13_RECOVERY_DOCUMENT);
    validateR15RecoveryDocument(R15_RECOVERY_DOCUMENT);
    validateR16RecoveryDocument(R16_RECOVERY_DOCUMENT);
    validateR17RecoveryDocument(R17_RECOVERY_DOCUMENT);
    validateR11RecoveryDocument(R11_RECOVERY_DOCUMENT);
    const broker = recoveryBrokerOwners.get(owner);
    if (
      !Number.isSafeInteger(after) ||
      after < 0 ||
      !observerIdentity ||
      !broker?.recovery ||
      !broker.identity ||
      !same(observerIdentity, broker.identity)
    )
      err("RECOVERY_R11_OPINION");
    const bindings = JSON.parse(R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies;
    const read = (c) => {
      if (closed || sealing || failed || pending.size || pendingReads.size)
        err("RECOVERY_R11_OPINION");
      const opinion = opinionObservation(c.id, after);
      if (!opinion?.row || !Number.isSafeInteger(opinion.responseOrdinal))
        err("RECOVERY_R11_OPINION");
      const row = opinion.row;
      if (row.id !== c.opinionId || row.status !== "aprovado" || !opinionIso(row.aprovado_em))
        err("RECOVERY_R16_OPINION");
      const document = rpcItem(
        "obter_documentos_competencia_v115",
        { p_id_competencia: c.id },
        { after },
      )?.value;
      const analysis = rpcItem(
        "obter_analise_competencia_v116",
        { p_id_competencia: c.id },
        { after },
      )?.value;
      for (const dto of [document, analysis]) {
        const ctx = dto?.competencia;
        if (
          ctx?.id !== c.id ||
          ctx.id_organizacao !== FIXTURE.organization ||
          ctx.id_contrato !== FIXTURE.contract ||
          ctx.competencia_referencia !== c.month
        )
          err("RECOVERY_R16_OPINION");
      }
      const docs = document.documentos?.filter((d) => d.requisito?.id === c.requirementId);
      const d = docs?.[0];
      if (
        document.schema_versao !== "v115-v1" ||
        document.estado_documental !== "complete" ||
        document.requisitos_documentais?.filter((r) => r.id === c.requirementId).length !== 1 ||
        docs?.length !== 1 ||
        d?.id !== c.documentId ||
        d.situacao !== "ativo" ||
        d.arquivo?.id !== FIXTURE.file ||
        d.arquivo.sha256 !== FIXTURE.fileHash ||
        d.arquivo.status_seguranca !== "aprovado" ||
        !uuid(d.versao?.id) ||
        d.versao.id_arquivo !== FIXTURE.file
      )
        err("RECOVERY_R16_OPINION");
      if (
        analysis.schema_versao !== "v116-v1" ||
        analysis.estado_analise !== "complete" ||
        analysis.stale !== false ||
        analysis.execucao_atual?.id !== c.executionId ||
        analysis.execucao_atual.status !== "concluida"
      )
        err("RECOVERY_R16_OPINION");
      let presentation = null;
      if (c.month === "2026-10-01") {
        const view = rpcItem(
          "obter_visao_geral_competencia",
          { p_id_competencia: c.id },
          { after },
        )?.value;
        const context = view?.competencia;
        if (
          context?.id !== c.id ||
          context.id_organizacao !== FIXTURE.organization ||
          context.id_contrato !== FIXTURE.contract ||
          context.competencia_referencia !== c.month ||
          context.situacao !== "pode_apresentar_contratante" ||
          context.percentual_conformidade !== 100 ||
          view.portao?.percentual !== 100 ||
          view.portao.liberado !== true ||
          view.blocking_summary?.analise_concluida_atual !== true ||
          view.blocking_summary.parecer_aprovado !== true ||
          view.blocking_summary.aprovacao_apresentacao_atual !== true ||
          view.allowed_actions?.apresentar !== true
        )
          err("RECOVERY_R17_PRESENTATION");
        presentation = {
          id: context.id,
          state: context.situacao,
          stored: context.percentual_conformidade,
          canonical: view.portao.percentual,
          approved: view.blocking_summary.aprovacao_apresentacao_atual,
          allowed: view.allowed_actions.apresentar,
          version: context.versao_registro,
          updated: context.atualizado_em,
        };
      }
      return hash(
        JSON.stringify({
          presentation,
          opinion: {
            id: row.id,
            competency: row.id_competencia,
            organization: row.id_organizacao,
            contract: row.id_contrato,
            version: row.versao,
            hash: row.hash,
            status: row.status,
            created: row.criado_em,
            approved: row.aprovado_em,
          },
          document: {
            id: d.id,
            requirement: d.requisito.id,
            version: d.versao.id,
            file: d.arquivo.id,
            sha256: d.arquivo.sha256,
          },
          analysis: { id: analysis.execucao_atual.id, status: analysis.execucao_atual.status },
        }),
      );
    };
    const snapshots = bindings.map(read),
      token = Object.freeze({});
    let invalid = false;
    const record = {
      owner,
      identity: observerIdentity,
      documentHash: "f3cf2c1eae15d5e7185ff665a8899f14898ed4b8b7188b5446646e7f2f0f1c95",
      consumed: false,
      permitsApproval() {
        return false;
      },
      check() {
        if (invalid) err("RECOVERY_R11_OPINION");
        try {
          if (bindings.some((c, i) => read(c) !== snapshots[i])) err("RECOVERY_R11_OPINION");
        } catch (error) {
          invalid = true;
          throw error;
        }
        return true;
      },
    };
    recoveryOpinionProofs.set(token, record);
    return token;
  }

  const api = {
    sealRecoveryOpinion,
    markMutation(rpc, payload, evidence, binding = null) {
      if (closed || failed) err("OBSERVATION_FAILED");
      const ordinal = sequence;
      const mutation = {
        rpc,
        payload: freeze(structuredClone(payload)),
        binding: binding === null ? null : freeze(structuredClone(binding)),
        ordinal,
        request: null,
        requestOrdinal: null,
        responseOrdinal: null,
        admitted: false,
        ack: null,
      };
      mutations.push(mutation);
      for (const target of readbackTargets(rpc, payload, evidence))
        floors.push({ ...target, ordinal, mutation });
      if (floors.length > 1024) err("OBSERVATION_LIMIT");
      return true;
    },
    async waitObservedAfter(name, where, after, options = {}) {
      if (!Number.isSafeInteger(after) || after < 0) err("OBSERVATION_ORDINAL");
      const state = monthOptions(name, where, after, options);
      if (!state.scoped && state.options.readBudget === undefined)
        return waitOfficialPhase({
          read: () => api.observedAfter(name, where, after, state.options),
          ready: (value) => value === true,
          ...(wait ? { wait } : {}),
          ...(now ? { now } : {}),
        });
      const execute = (budget) =>
        waitOfficialPhase({
          read: () =>
            api.observedAfter(name, where, after, { ...state.options, readBudget: budget }),
          ready: (value) => value === true,
          timeout: budgetRemaining(budget),
          ...(wait ? { wait } : {}),
          now: readClock,
        });
      return withReadBudget(execute, state.options.readBudget);
    },
    flush,
    readBarrier: withReadBudget,
    assertReadBarrier: (token) => {
      budgetState(token);
      return true;
    },
    readBarrierRemaining: budgetRemaining,
    async drainReads(token) {
      return withReadBudget(async (budget) => {
        for (;;) {
          budgetState(budget);
          await withReadBudget(() => flush(), budget);
          budgetState(budget);
          if (pendingReads.size === 0 && pending.size === 0) return true;
          await (wait ? wait(10) : new Promise((resolve) => setTimeout(resolve, 10)));
          budgetState(budget);
        }
      }, token);
    },
    observationFailure: () => firstFailure,
    async seal() {
      sealing = true;
      page.off("request", onRequest);
      let timer;
      try {
        await Promise.race([
          (async () => {
            await Promise.allSettled([...pending]);
            while (!closed && (pendingReads.size || pending.size))
              await new Promise((resolve) => setTimeout(resolve, 10));
          })(),
          new Promise((resolve) => {
            timer = setTimeout(() => {
              recordFailure("UNKNOWN", "UNAVAILABLE", "NONE", "UNAVAILABLE");
              resolve();
            }, 3000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
        closed = true;
        page.off("response", onResponse);
      }
      return firstFailure;
    },
    generation: () => sequence,
    async observedAfter(name, where = {}, after, options = {}) {
      const state = monthOptions(name, where, after, options);
      const perform = async (budget) => {
        await flush();
        if (budget) budgetState(budget);
        if (state.scoped)
          return (
            pendingReads.size === 0 &&
            latestMonth(state.where, state.options.after, state.options.select) !== null
          );
        const rpc = rpcName(name);
        if (rpc)
          return (rpcs.get(rpc) || []).some(
            (e) =>
              e.ordinal > after &&
              (state.options.after === undefined || e.ordinal > state.options.after) &&
              Object.entries(where).every(([k, v]) => pathValue(e.args, k) === v),
          );
        if (!OBSERVED_TABLES.has(name)) return false;
        const { latest, ledger } = selectLatest(name, legacyReadOptions(state.options));
        for (const e of ledger)
          if (e.ordinal > after && e.rows.length === 0 && coversAbsence(e, where)) return true;
        const empty = ledger.find((e) => e.rows.length === 0 && coversAbsence(e, where));
        return [...latest.values()].some(
          ({ e, row }) =>
            e.ordinal > after &&
            (!empty || e.ordinal >= empty.ordinal) &&
            matchesObservation(e, row, where),
        );
      };
      return state.scoped || state.options.readBudget !== undefined
        ? withReadBudget(perform, state.options.readBudget)
        : perform();
    },
    async read(table, where = {}, options = {}) {
      const state = monthOptions(table, where, undefined, options);
      if (state.scoped)
        return withReadBudget(async (budget) => {
          const value = await waitOfficialPhase({
            read: async () => {
              await flush();
              budgetState(budget);
              if (pendingReads.size) return null;
              return latestMonth(state.where, state.options.after, state.options.select);
            },
            ready: (rows) => rows !== null,
            timeout: budgetRemaining(budget),
            ...(wait ? { wait } : {}),
            now: readClock,
          });
          budgetState(budget);
          return structuredClone(value);
        }, state.options.readBudget);
      const barrier = causalFloor(table, where);
      const perform = async (budget) => {
        if (barrier) {
          const bound = { ...barrier.where, ...where };
          const validated = await waitTarget(barrier, bound, legacyReadOptions(state.options));
          if (budget) budgetState(budget);
          return structuredClone(validated.value);
        }
        await flush();
        if (budget) budgetState(budget);
        return tableRows(table, where, legacyReadOptions(state.options)).map((row) =>
          structuredClone(row),
        );
      };
      return state.options.readBudget !== undefined
        ? withReadBudget(perform, state.options.readBudget)
        : perform();
    },
    async rpcRead(name, where = {}, options = {}) {
      const rpc = rpcName(name);
      if (!rpc) err("OBSERVATION_RPC");
      if (
        !obj(options) ||
        Object.keys(options).some((k) => k !== "after") ||
        (options.after !== undefined && (!Number.isSafeInteger(options.after) || options.after < 0))
      )
        err("OBSERVATION_ORDINAL");
      const barrier = causalFloor(name, where);
      if (barrier) {
        where = { ...barrier.where, ...where };
        const validated = await waitTarget(barrier, where, options);
        return structuredClone(validated.value);
      }
      await flush();
      const item = rpcItem(rpc, where, options);
      if (
        barrier?.versionId &&
        (!item ||
          item.value?.versao?.id !== barrier.versionId ||
          (item.args.p_id_versao !== null && item.args.p_id_versao !== barrier.versionId))
      )
        err("OBSERVATION_CONTEXT");
      return item ? structuredClone(item.value) : null;
    },
    close() {
      closed = true;
      tables.clear();
      rpcs.clear();
      floors.length = 0;
      mutations.length = 0;
      pendingReads.clear();
      latestReads.clear();
      page.off("request", onRequest);
      page.off("response", onResponse);
    },
  };
  return Object.freeze(api);
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
  validateR13RecoveryDocument(io?.recoveryLedgerR13);
  validateR15RecoveryDocument(io?.recoveryLedgerR15);
  validateR16RecoveryDocument(io?.recoveryLedgerR16);
  validateR17RecoveryDocument(io?.recoveryLedgerR17);
  const { page } = io;
  const recovery =
    io.recoveryLedger === undefined ? null : validateR1RecoveryDocument(io.recoveryLedger);
  if (recovery) {
    validateR3RecoveryDocument(io.recoveryLedgerR3);
    validateR4RecoveryDocument(io.recoveryLedgerR4);
    validateR5RecoveryDocument(io.recoveryLedgerR5);
    validateR6RecoveryDocument(io.recoveryLedgerR6);
    validateR7RecoveryDocument(io.recoveryLedgerR7);
    validateR8RecoveryDocument(io.recoveryLedgerR8);
    validateR9RecoveryDocument(io.recoveryLedgerR9);
    validateR10RecoveryDocument(io.recoveryLedgerR10);
    validateR13RecoveryDocument(io.recoveryLedgerR13);
    validateR15RecoveryDocument(io.recoveryLedgerR15);
    validateR16RecoveryDocument(io.recoveryLedgerR16);
    validateR17RecoveryDocument(io.recoveryLedgerR17);
    validateR11RecoveryDocument(io.recoveryLedgerR11);
  }
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
      (await tracedPreparation("SOURCE_UI_CONTROL", async () => locator.count())) === 1 &&
        (await tracedPreparation("SOURCE_UI_CONTROL", async () => locator.isVisible())) &&
        (await tracedPreparation("SOURCE_UI_CONTROL", async () => locator.isEnabled())),
      code,
    );
  };
  const click = async (s, name) => {
    const b = btn(s, name);
    await tracedPreparation("SOURCE_UI_CONTROL", async () => enabled(b, "FLOW_BUTTON_UNAVAILABLE"));
    await tracedPreparation("SOURCE_UI_CONTROL", async () => b.click());
    await tracedPreparation("SOURCE_REFRESH", async () => io.fresh());
  };
  const field = (s, name) => s.getByLabel(name, { exact: true });
  const dialog = (name) => page.getByRole("dialog", { name, exact: true });
  const one = (rows, code) => {
    assert(Array.isArray(rows) && rows.length === 1, code);
    return rows[0];
  };
  const sourceRow = async () => {
    const s = one(
      await tracedPreparation("SOURCE_GET", async () =>
        io.read("fontes_normativas", { id: FIXTURE.source }),
      ),
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
    await tracedPreparation("SOURCE_RECONCILE", async () => sourceRow());
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
    const caps = await tracedPreparation("SOURCE_RECONCILE", async () => io.sourceCapabilities());
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
      !(await tracedPreparation("SOURCE_VERSION_GET", async () =>
        io.observedAfter("versoes_fontes_normativas", { id_fonte: FIXTURE.source }, after, {
          select: EXACT_SELECTS.versoes_fontes_normativas[0],
        }),
      ))
    )
      fail("FLOW_VERSION_READBACK_UNOBSERVED");
    version = one(
      (
        await tracedPreparation("SOURCE_VERSION_GET", async () =>
          io.read(
            "versoes_fontes_normativas",
            { id_fonte: FIXTURE.source },
            { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
          ),
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
    await tracedPreparation("SOURCE_RECONCILE", async () => sourceProof());
    return version;
  };
  // GET cache must distinguish observed absence from not yet observed. Walk every UI page.
  const allPages = async (scope, nextName, readRows) => {
    const seen = new Map();
    let turns = 0;
    while (true) {
      assert(++turns <= 100, "FLOW_PAGE_LIMIT");
      for (const r of await tracedPreparation("SOURCE_UI_CONTROL", async () => readRows())) {
        assert(uuid(r.id), "FLOW_ROW_ID");
        seen.set(r.id, r);
      }
      const next = btn(scope, nextName);
      if (
        (await tracedPreparation("SOURCE_UI_CONTROL", async () => next.count())) === 0 ||
        !(await tracedPreparation("SOURCE_UI_CONTROL", async () => next.isEnabled()))
      )
        break;
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(scope, nextName));
    }
    return [...seen.values()];
  };
  await tracedPreparation("SOURCE_NAVIGATE", async () =>
    io.goKnown(`/contratos/${FIXTURE.contract}/base-normativa`),
  );
  // Locate exact official source through existing source-list pagination, never create source.
  const sources = await tracedPreparation("SOURCE_GET", async () =>
    allPages(page, "Próxima página", () => io.read("fontes_normativas", {})),
  );
  assert(
    sources.some((s) => s.id === FIXTURE.source),
    "FLOW_SOURCE_NOT_IN_UI_GET",
  );
  await tracedPreparation("SOURCE_RECONCILE", async () => sourceRow());
  if (recovery) assert(source.situacao === "ativa", "RECOVERY_SOURCE_INACTIVE");
  // Return through a KNOWN SSR path so its list starts at page zero, then find source button.
  await tracedPreparation("SOURCE_NAVIGATE", async () =>
    io.goKnown(`/contratos/${FIXTURE.contract}/base-normativa`),
  );
  for (
    let n = 0;
    (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
      btn(page, `Detalhes de ${source.titulo}`).count(),
    )) === 0;
    n++
  ) {
    assert(n < 100, "FLOW_SOURCE_UI_MISSING");
    await tracedPreparation("SOURCE_UI_CONTROL", async () => click(page, "Próxima página"));
  }
  await tracedPreparation("SOURCE_UI_CONTROL", async () =>
    click(page, `Detalhes de ${source.titulo}`),
  );
  let sheet = dialog(source.titulo);
  const versions = await tracedPreparation("SOURCE_VERSION_GET", async () =>
    allPages(sheet, "Próximas versões", () =>
      io.read(
        "versoes_fontes_normativas",
        { id_fonte: source.id },
        { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
      ),
    ),
  );
  // A source-version hash is a server digest of structured version fields,
  // NOT SHA256(TXT). Prove the TXT separately using the real expanded GET.
  const proveText = async (v) => {
    assert(uuid(v.id) && hash64(v.hash) && v.id_fonte === source.id, "FLOW_VERSION_ID_HASH");
    for (
      let n = 0;
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, `Ver texto registrado (versão ${v.versao})`).count(),
      )) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_VERSION_TEXT_UI_MISSING");
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Versões anteriores"));
    }
    const textOrdinal = io.generation();
    await tracedPreparation("SOURCE_UI_CONTROL", async () =>
      click(sheet, `Ver texto registrado (versão ${v.versao})`),
    );
    assert(
      await tracedPreparation("SOURCE_VERSION_GET", async () =>
        io.observedAfter("versoes_fontes_normativas", { id: v.id }, textOrdinal, {
          select: "conteudo_texto,metadados",
        }),
      ),
      "FLOW_VERSION_TEXT_UNOBSERVED",
    );
    // IO joins only the just-observed select=conteudo_texto,metadados&id=eq.ID
    // to the independently observed version identity. It must not invent row ID
    // from response content (this projection omits id), or use a stale text GET.
    const textRow = one(
      await tracedPreparation("SOURCE_VERSION_GET", async () =>
        io.read("versoes_fontes_normativas", { id: v.id }, { select: "conteudo_texto,metadados" }),
      ),
      "FLOW_VERSION_TEXT_UNOBSERVED",
    );
    const exact =
      textRow.conteudo_texto === io.text &&
      hash(textRow.conteudo_texto) === FIXTURE.fileHash &&
      same(textRow.metadados, {});
    if (exact) verifiedTextVersions.add(v.id);
    await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Ocultar texto"));
    return exact;
  };
  const equivalents = [];
  for (const v of versions.filter(
    (v) => v.inicio_vigencia === "2026-01-01" && v.fim_vigencia === null && v.id_arquivo === null,
  )) {
    // Move back to first page to locate each candidate deterministically.
    while (
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, "Versões anteriores").count(),
      )) === 1 &&
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, "Versões anteriores").isEnabled(),
      ))
    )
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Versões anteriores"));
    for (
      let n = 0;
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, `Ver texto registrado (versão ${v.versao})`).count(),
      )) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_VERSION_CANDIDATE_UI_MISSING");
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Próximas versões"));
    }
    if (await tracedPreparation("SOURCE_TEXT_PROOF", async () => proveText(v))) equivalents.push(v);
  }
  assert(equivalents.length <= 1, "FLOW_DUPLICATE_EQUIVALENT_VERSION");
  if (recovery && equivalents.length !== 1) fail("RECOVERY_STATE");
  if (equivalents.length === 0) {
    while (
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, "Versões anteriores").count(),
      )) === 1 &&
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, "Versões anteriores").isEnabled(),
      ))
    )
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Versões anteriores"));
    const caps = await tracedPreparation("SOURCE_RECONCILE", async () => io.sourceCapabilities());
    assert(checkedOfficial(caps) && caps.canRegister === true, "FLOW_REGISTER_DENIED");
    await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Nova versão"));
    const d = dialog("Nova versão");
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      field(d, "Início da vigência").fill("2026-01-01"),
    );
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      field(d, "Fim da vigência (opcional)").fill(""),
    );
    await tracedPreparation("SOURCE_FORM_FIELD", async () => field(d, "Texto").check());
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      field(d, "Texto da versão").fill(io.text),
    );
    const registerOrdinal = io.generation();
    await tracedPreparation("SOURCE_REGISTER_COMMAND", async () =>
      io.command({
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
      }),
    );
    await tracedPreparation("SOURCE_REFRESH", async () => io.fresh());
    const newlyObserved = (
      await tracedPreparation("SOURCE_VERSION_GET", async () =>
        io.read(
          "versoes_fontes_normativas",
          { id_fonte: source.id },
          { select: EXACT_SELECTS.versoes_fontes_normativas[0] },
        ),
      )
    ).filter(
      (v) =>
        !versions.some((old) => old.id === v.id) &&
        v.inicio_vigencia === "2026-01-01" &&
        v.fim_vigencia === null &&
        v.id_arquivo === null,
    );
    const created = one(newlyObserved, "FLOW_CREATED_VERSION_NONUNIQUE");
    assert(
      await tracedPreparation("SOURCE_TEXT_PROOF", async () => proveText(created)),
      "FLOW_CREATED_VERSION_TEXT_MISMATCH",
    );
    await tracedPreparation("SOURCE_VERSION_READ", async () => versionRead(registerOrdinal));
  } else {
    version = equivalents[0];
    await tracedPreparation("SOURCE_RECONCILE", async () => sourceProof());
  }
  // Locate matching version's button even when pagination starts on last page.
  let caps = await tracedPreparation("SOURCE_RECONCILE", async () => sourceProof());
  if (recovery && !version.aprovado_em) fail("RECOVERY_STATE");
  if (!version.aprovado_em) {
    for (
      let n = 0;
      (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
        btn(sheet, `Aprovar versão ${version.versao}`).count(),
      )) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_VERSION_UI_MISSING");
      await tracedPreparation("SOURCE_UI_CONTROL", async () => click(sheet, "Versões anteriores"));
    }
    assert(caps.canApprove === true, "FLOW_APPROVE_DENIED");
    await tracedPreparation("SOURCE_UI_CONTROL", async () =>
      click(sheet, `Aprovar versão ${version.versao}`),
    );
    const d = dialog(`Aprovar versão ${version.versao}`);
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      field(d, "Fundamento").fill(FIXTURE.foundation),
    );
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      field(d, "Confirmo que revisei hash, origem e vigência desta versão.").check(),
    );
    const id = version.id;
    const approvalOrdinal = io.generation();
    await tracedPreparation("SOURCE_APPROVE_COMMAND", async () =>
      io.command({
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
      }),
    );
    await tracedPreparation("SOURCE_REFRESH", async () => io.fresh());
    await tracedPreparation("SOURCE_VERSION_READ", async () => versionRead(approvalOrdinal));
    assert(!!version.aprovado_em, "FLOW_APPROVAL_NOT_READBACK");
  }
  await tracedPreparation("SOURCE_SHEET_CLOSE", async () => click(sheet, "Close"));
  if (recovery) {
    await tracedPreparation("RECOVERY_READ", async () => {
      await tracedPreparation("V109_NAVIGATE", async () =>
        io.link(`/contratos/${FIXTURE.contract}/regras`),
      );
      await tracedPreparation("LIST_PANEL_OPEN", async () => click(page, "Gerenciar listas"));
      const region = page.getByRole("region", { name: "Gestão de listas", exact: true });
      const rows = await tracedPreparation("LIST_GET", async () =>
        allPages(region, "Próxima página de listas", () => io.read("listas_verificacao", {})),
      );
      const matching = rows.filter((r) => r.nome === FIXTURE.listName);
      assert(matching.length <= 1, "RECOVERY_LIST");
      let state = null;
      if (matching.length === 1) {
        for (
          let n = 0;
          (await tracedPreparation("SOURCE_UI_CONTROL", async () =>
            (await tracedPreparation("SOURCE_UI_CONTROL", async () => listSelectionControl(region)))
              .locator(`option[value="${matching[0].id}"]`)
              .count(),
          )) === 0;
          n++
        ) {
          assert(n < 100, "FLOW_LIST_UI_MISSING");
          await tracedPreparation("SOURCE_UI_CONTROL", async () =>
            click(region, "Página anterior de listas"),
          );
        }
        await tracedPreparation("SOURCE_FORM_FIELD", async () =>
          (
            await tracedPreparation("SOURCE_UI_CONTROL", async () =>
              listSelectionControl(region, matching[0].id),
            )
          ).selectOption(matching[0].id),
        );
        await tracedPreparation("SOURCE_REFRESH", async () => io.fresh());
      }
      const model = await tracedPreparation("LIST_MODEL_READ", async () =>
        io.rpcRead("obter_lista_operacional_v1", {
          p_id_organizacao: FIXTURE.organization,
          p_id_contrato: FIXTURE.contract,
          ...(matching[0]?.id ? { p_id_lista: matching[0].id } : {}),
        }),
      );
      assert(
        model?.schema_versao === "crud-lista-v1" &&
          model.id_organizacao === FIXTURE.organization &&
          model.id_contrato === FIXTURE.contract &&
          checkedOfficial(model),
        "FLOW_MODEL_CONTEXT",
      );
      if (matching.length === 1) {
        const l = model.lista,
          v = model.versao,
          items = model.itens;
        assert(
          l &&
            v &&
            l.id === matching[0].id &&
            uuid(l.id) &&
            uuid(v.id) &&
            Number.isInteger(l.versao_registro) &&
            l.versao_registro > 0 &&
            Number.isInteger(v.numero_versao) &&
            v.numero_versao > 0 &&
            l.versao_atual === v.numero_versao &&
            l.nome === FIXTURE.listName &&
            l.descricao === FIXTURE.listDescription &&
            checkedOfficial(l) &&
            checkedOfficial(v) &&
            v.id_lista === l.id &&
            v.vigencia_inicio === "2026-01-01" &&
            v.vigencia_fim === null &&
            model.total_itens === 1 &&
            Array.isArray(items) &&
            items.length === 1,
          "RECOVERY_LIST",
        );
        const item = items[0],
          expected = {
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
          };
        assert(
          uuid(item.id) &&
            checkedOfficial(item) &&
            item.id_versao_lista === v.id &&
            Object.entries(expected).every(([k, x]) => same(item[k], x)),
          "RECOVERY_LIST",
        );
        state = {
          id: l.id,
          versionId: v.id,
          itemId: model.itens[0].id,
          verified: true,
          active: l.situacao === "ativa",
          published: v.situacao === "publicada",
          ruleVerified: true,
          sourceVersion: version.id,
        };
      }
      let opinionProof;
      const competencies = await tracedPreparation("RECOVERY_READ", () =>
        reconcileRecoveryCompetencies(io, (captured) => {
          opinionProof = captured;
        }),
      );
      if (!opinionProof) throw new Error("RECOVERY_R11_OPINION");
      const proof = reconcileR1Recovery({
        competencies,
        ledger: recovery,
        ledgerR3: io.recoveryLedgerR3,
        ledgerR4: io.recoveryLedgerR4,
        ledgerR5: io.recoveryLedgerR5,
        ledgerR6: io.recoveryLedgerR6,
        ledgerR7: io.recoveryLedgerR7,
        ledgerR8: io.recoveryLedgerR8,
        ledgerR9: io.recoveryLedgerR9,
        ledgerR10: io.recoveryLedgerR10,
        ledgerR11: io.recoveryLedgerR11,
        ledgerR13: io.recoveryLedgerR13,
        ledgerR15: io.recoveryLedgerR15,
        ledgerR16: io.recoveryLedgerR16,
        ledgerR17: io.recoveryLedgerR17,
        source: { ...source, ...context, version: source.versao_registro },
        version: {
          ...context,
          id: version.id,
          source: source.id,
          hash: version.hash,
          approved: !!version.aprovado_em,
          textVerified: verifiedTextVersions.has(version.id),
          effective: version.inicio_vigencia === "2026-01-01" && version.fim_vigencia === null,
          file: version.id_arquivo,
        },
        sourceCount: 1,
        listCount: matching.length,
        listObserved: true,
        listState: state,
        canCreateList: model.acoes?.criar_lista === true,
      });
      assert(typeof io.recoveryReady === "function", "RECOVERY_PROOF");
      io.recoveryReady(proof, opinionProof);
    });
    await tracedPreparation("RECOVERY_RETURN", () =>
      io.goKnown(`/contratos/${FIXTURE.contract}/base-normativa`),
    );
  }
  if (source.situacao !== "ativa") {
    caps = await tracedPreparation("SOURCE_RECONCILE", async () => sourceProof());
    assert(caps.canActivate === true, "FLOW_ACTIVATE_DENIED");
    await tracedPreparation("SOURCE_UI_CONTROL", async () =>
      click(page, `Editar ${source.titulo}`),
    );
    const d = dialog("Editar fonte");
    await tracedPreparation("SOURCE_FORM_FIELD", async () =>
      (
        await tracedPreparation("SOURCE_FORM_FIELD", async () => sourceStatusControl(d))
      ).selectOption("ativa"),
    );
    const before = source.versao_registro;
    await tracedPreparation("SOURCE_ACTIVATE_COMMAND", async () =>
      io.command({
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
      }),
    );
    await tracedPreparation("SOURCE_REFRESH", async () => io.fresh());
    await tracedPreparation("SOURCE_RECONCILE", async () => sourceRow());
    assert(source.situacao === "ativa", "FLOW_ACTIVE_NOT_READBACK");
  }
  await tracedPreparation("SOURCE_RECONCILE", async () => sourceProof());
  await tracedPreparation("V109_NAVIGATE", async () =>
    io.link(`/contratos/${FIXTURE.contract}/regras`),
  );
  await tracedPreparation("LIST_PANEL_OPEN", async () => click(page, "Gerenciar listas"));
  const panel = page.getByRole("region", { name: "Gestão de listas", exact: true });
  const headers = await tracedPreparation("LIST_GET", async () =>
    allPages(panel, "Próxima página de listas", () => io.read("listas_verificacao", {})),
  );
  const matches = headers.filter((l) => l.nome === FIXTURE.listName);
  assert(matches.length <= 1, "FLOW_LIST_DUPLICATE");
  const readModel = async () => {
    const d = await tracedPreparation("LIST_MODEL_READ", async () =>
      io.rpcRead("obter_lista_operacional_v1"),
    );
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
    const d = await tracedPreparation("LIST_MODEL_READ", async () => readModel());
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
    const d = await tracedPreparation("LIST_MODEL_READ", async () => readModel());
    assert(
      d.acoes?.[action === "salvar_item" ? "criar_item" : action] === true,
      "FLOW_LIST_CAPABILITY_DENIED",
    );
    if (action !== "criar_lista")
      await tracedPreparation("LIST_MODEL_READ", async () => listProof());
    await tracedPreparation("LIST_UI_CONTROL", async () => click(panel, label));
    const form = panel.locator("form").filter({
      has: page.getByRole("heading", {
        name: action === "salvar_item" ? "Salvar item" : label,
        exact: true,
      }),
    });
    assert(
      (await tracedPreparation("LIST_UI_CONTROL", async () => form.count())) === 1,
      "FLOW_LIST_FORM_NONUNIQUE",
    );
    await tracedPreparation("LIST_UI_CONTROL", async () => setup(form));
    await tracedPreparation("LIST_FORM_FIELD", async () =>
      field(form, "Motivo").fill(FIXTURE.reason),
    );
    await tracedPreparation("LIST_UI_CONTROL", async () => click(form, "Revisar operação"));
    const prev = action === "criar_lista" ? null : d.lista.versao_registro;
    await tracedPreparation("LIST_COMMAND", async () =>
      io.command({
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
      }),
    );
    await tracedPreparation("LIST_REFRESH", async () => io.fresh());
    await tracedPreparation("LIST_MODEL_READ", async () => listProof());
    assert(
      model.lista.versao_registro === (prev === null ? 1 : prev + 1),
      "FLOW_LIST_READBACK_VERSION",
    );
  };
  if (matches.length === 0) {
    await tracedPreparation("LIST_FORM_FIELD", async () =>
      listCommand(
        "criar_lista",
        {
          nome: FIXTURE.listName,
          descricao: FIXTURE.listDescription,
          vigencia_inicio: "2026-01-01",
          vigencia_fim: null,
        },
        "Criar lista",
        async (f) => {
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            field(f, "Nome").fill(FIXTURE.listName),
          );
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            field(f, "Descrição").fill(FIXTURE.listDescription),
          );
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            field(f, "Início da vigência").fill("2026-01-01"),
          );
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            field(f, "Fim da vigência").fill(""),
          );
        },
      ),
    );
  } else {
    // Find the already-observed target's page; no synthetic option or direct navigation.
    for (
      let n = 0;
      (await tracedPreparation("LIST_UI_CONTROL", async () =>
        (await tracedPreparation("LIST_UI_CONTROL", async () => listSelectionControl(panel)))
          .locator(`option[value="${matches[0].id}"]`)
          .count(),
      )) === 0;
      n++
    ) {
      assert(n < 100, "FLOW_LIST_UI_MISSING");
      await tracedPreparation("LIST_UI_CONTROL", async () =>
        click(panel, "Página anterior de listas"),
      );
    }
    await tracedPreparation("LIST_FORM_FIELD", async () =>
      (
        await tracedPreparation("LIST_UI_CONTROL", async () =>
          listSelectionControl(panel, matches[0].id),
        )
      ).selectOption(matches[0].id),
    );
    await tracedPreparation("LIST_REFRESH", async () => io.fresh());
    await tracedPreparation("LIST_MODEL_READ", async () => listProof());
  }
  await tracedPreparation("LIST_MODEL_READ", async () => listProof());
  if (model.itens.length === 0) {
    assert(model.versao.situacao === "rascunho", "FLOW_PUBLISHED_EMPTY_LIST");
    await tracedPreparation("LIST_FORM_FIELD", async () =>
      listCommand(
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
            await tracedPreparation("LIST_FORM_FIELD", async () => field(f, label).fill(value));
          for (const label of ["Obrigatório", "Aplicável", "Impeditivo"])
            await tracedPreparation("LIST_FORM_FIELD", async () => field(f, label).check());
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            f.getByRole("combobox", { name: "Criticidade", exact: true }).selectOption("alta"),
          );
          await tracedPreparation("LIST_FORM_FIELD", async () =>
            f
              .getByRole("textbox", { name: "Regra de validação e condição (JSON)", exact: true })
              .fill(JSON.stringify(itemExpected().regra_validacao)),
          );
        },
      ),
    );
  }
  if (model.versao.situacao !== "publicada") {
    assert(model.versao.situacao === "rascunho", "FLOW_VERSION_STATE");
    await tracedPreparation("LIST_UI_CONTROL", async () =>
      listCommand("publicar_versao", { id_versao: model.versao.id }, "Publicar versão"),
    );
    assert(model.versao.situacao === "publicada", "FLOW_PUBLICATION_NOT_READBACK");
  }
  if (model.lista.situacao !== "ativa") {
    await tracedPreparation("LIST_FORM_FIELD", async () =>
      listCommand("alterar_situacao", { situacao: "ativa" }, "Alterar situação", async (f) => {
        await tracedPreparation("LIST_FORM_FIELD", async () =>
          f.getByRole("combobox", { name: "Situação", exact: true }).selectOption("ativa"),
        );
      }),
    );
  }
  await tracedPreparation("LIST_MODEL_READ", async () => listProof());
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
  validateR13RecoveryDocument(io?.recoveryLedgerR13);
  validateR15RecoveryDocument(io?.recoveryLedgerR15);
  validateR16RecoveryDocument(io?.recoveryLedgerR16);
  validateR17RecoveryDocument(io?.recoveryLedgerR17);
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
    "goKnown",
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
  if (io.recoveryLedgerR5) {
    validateR5RecoveryDocument(io.recoveryLedgerR5);
    validateR6RecoveryDocument(io.recoveryLedgerR6);
    validateR7RecoveryDocument(io.recoveryLedgerR7);
    validateR8RecoveryDocument(io.recoveryLedgerR8);
    validateR9RecoveryDocument(io.recoveryLedgerR9);
    validateR10RecoveryDocument(io.recoveryLedgerR10);
    validateR13RecoveryDocument(io.recoveryLedgerR13);
    validateR15RecoveryDocument(io.recoveryLedgerR15);
    validateR16RecoveryDocument(io.recoveryLedgerR16);
    validateR17RecoveryDocument(io.recoveryLedgerR17);
    validateR11RecoveryDocument(io.recoveryLedgerR11);
    for (const key of ["sourceVersionId", "listId", "listVersionId", "itemId"])
      if (sourceList[key] !== R5_BINDINGS[key]) stop("RECOVERY_LIST");
  }
  await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
  if ((await tracedPreparation("COMPETENCY_UI", async () => io.verifyContext())) !== true)
    stop("COMPETENCE_CONTEXT");
  // Read the actual official UI RPC DTO, not assumed convenience flags such as list.active.
  const sourceModel = await tracedPreparation("COMPETENCY_GET", async () =>
    io.rpcRead("obter_lista_operacional_v1"),
  );
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
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    phaseActive();
    if ((await tracedPreparation("COMPETENCY_UI", async () => io.verifyContext())) !== true)
      stop("COMPETENCE_CONTEXT");
  };
  const rows = async (table, where, options = {}) => {
    phaseActive();
    const result = await tracedPreparation("COMPETENCY_GET", async () =>
      io.read(table, where, options),
    );
    phaseActive();
    if (!Array.isArray(result)) stop("COMPETENCE_READ_SHAPE");
    return result;
  };
  const observed = async (name, where, ordinal, options = {}) => {
    phaseActive();
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    phaseActive();
    if (
      (await tracedPreparation("COMPETENCY_UI", async () =>
        io.observedAfter(name, where, ordinal, options),
      )) !== true
    )
      stop("COMPETENCE_STALE_OBSERVATION");
  };
  const link = async (path, options) => {
    phaseActive();
    await tracedPreparation("COMPETENCY_UI", async () => io.link(path, options));
    phaseActive();
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    phaseActive();
  };
  const click = async (name, scope = io.page) => {
    phaseActive();
    const button = scope.getByRole("button", { name, exact: true });
    if (
      (await tracedPreparation("COMPETENCY_UI", async () => button.count())) !== 1 ||
      !(await tracedPreparation("COMPETENCY_UI", async () => button.isEnabled()))
    )
      stop("COMPETENCE_CONTROL_UNAVAILABLE");
    phaseActive();
    await tracedPreparation("COMPETENCY_UI", async () => button.click());
    phaseActive();
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    phaseActive();
  };
  async function poll(read, ready, refresh) {
    let initial = true;
    try {
      return await tracedPreparation("COMPETENCY_RECONCILE", async () =>
        waitOfficialPhase({
          timeout: 300000,
          wait,
          read: async () => {
            phaseActive();
            // UI refresh belongs to the bounded read, under the SAME phase deadline.
            if (!initial) {
              await tracedPreparation("COMPETENCY_UI", async () => refresh());
              phaseActive();
            }
            initial = false;
            const value = await tracedPreparation("COMPETENCY_RECONCILE", async () => read());
            phaseActive();
            return value;
          },
          ready: (value) => {
            phaseActive();
            return ready(value) === true;
          },
        }),
      );
    } catch (error) {
      if (error?.message === "PHASE_TIMEOUT") {
        temporalAborted = true;
        // The pending read/navigation may still be resolving. Close its context,
        // then stop the entire executor; never start another month's mutation.
        if (typeof io.abortPhase === "function") {
          try {
            await tracedPreparation("COMPETENCY_UI", async () =>
              io.abortPhase("COMPETENCE_PHASE_TIMEOUT"),
            );
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
    await tracedPreparation("COMPETENCY_UI", async () => link(`/competencias/${id}`));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed("obter_visao_geral_competencia", { p_id_competencia: id }, ordinal),
    );
    const value = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead("obter_visao_geral_competencia", {
        p_id_competencia: id,
      }),
    );
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
    await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(id, month));
    const ordinal = io.generation();
    await tracedPreparation("COMPETENCY_UI", async () => link(`/competencias/${id}/${area}`));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed(rpc, { p_id_competencia: id }, ordinal),
    );
  }
  async function listMonth(month) {
    const found = (
      await tracedPreparation("COMPETENCY_UI", () =>
        readCompetenceMonth(io, month, (budget) => io.goKnown(listPath, budget)),
      )
    ).filter((r) => r.competencia_referencia === month);
    if (found.length > 1 || found.some((r) => !uuid(r.id) || r.id === FIXTURE.historical))
      stop("COMPETENCE_AMBIGUOUS");
    return found;
  }

  async function createOrReuse(month) {
    await tracedPreparation("COMPETENCY_UI", async () => context());
    let existing = await tracedPreparation("COMPETENCY_UI", async () => listMonth(month));
    if (io.recoveryLedgerR5) {
      validateR5RecoveryDocument(io.recoveryLedgerR5);
      validateR6RecoveryDocument(io.recoveryLedgerR6);
      validateR7RecoveryDocument(io.recoveryLedgerR7);
      validateR8RecoveryDocument(io.recoveryLedgerR8);
      validateR9RecoveryDocument(io.recoveryLedgerR9);
      validateR10RecoveryDocument(io.recoveryLedgerR10);
      validateR13RecoveryDocument(io.recoveryLedgerR13);
      validateR15RecoveryDocument(io.recoveryLedgerR15);
      validateR16RecoveryDocument(io.recoveryLedgerR16);
      validateR17RecoveryDocument(io.recoveryLedgerR17);
      validateR11RecoveryDocument(io.recoveryLedgerR11);
      const expected = R5_BINDINGS.competencies.find((c) => c.month === month);
      if (!expected || existing.length !== 1 || existing[0].id !== expected.id)
        stop("RECOVERY_STATE");
    }
    if (!existing.length) {
      await tracedPreparation("COMPETENCY_UI", async () => link(listPath + "/nova"));
      await tracedPreparation("COMPETENCY_UI", async () =>
        io.page.getByLabel("Competência (mês/ano)", { exact: true }).fill(month.slice(0, 7)),
      );
      await tracedPreparation("COMPETENCY_UI", async () => context());
      await tracedPreparation("COMPETENCY_COMMAND", async () =>
        io.command({
          rpc: "criar_competencia",
          payload: {
            p_id_contrato: FIXTURE.contract,
            p_competencia_referencia: month,
          },
          evidence: {},
          button: "Criar competência",
          confirmAfter: async () => {
            await tracedPreparation("COMPETENCY_UI", async () => link(listPath));
            existing = await tracedPreparation("COMPETENCY_UI", async () => listMonth(month));
            return existing.length === 1;
          },
        }),
      );
      if (existing.length !== 1) stop("COMPETENCE_CREATE_UNCERTAIN");
    }
    const id = existing[0].id;
    // Anchor must be real and match the reconciled ID, never goto a fabricated path.
    const view = await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(id, month));
    if (view.competencia.situacao === "cancelada" || view.competencia.situacao === "encerrada")
      stop("COMPETENCE_TERMINAL");
    return {
      id,
      view,
      evidence: { competencies: [competencyEvidence(view, month)] },
    };
  }
  async function approvedContractFile() {
    await tracedPreparation("COMPETENCY_UI", async () =>
      link(contractBase, { contextual: "contract_summary" }),
    );
    await tracedPreparation("COMPETENCY_UI", async () => context());
    const ordinal = io.generation();
    await tracedPreparation("COMPETENCY_UI", async () =>
      link(contractBase + "/documentos", { contextual: "contract_documents" }),
    );
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed("documentos_contrato", { id_contrato: FIXTURE.contract }, ordinal),
    );
    const docs = await tracedPreparation("COMPETENCY_UI", async () =>
      rows("documentos_contrato", {
        id_contrato: FIXTURE.contract,
        id: FIXTURE.contractualDocument,
      }),
    );
    if (
      docs.length !== 1 ||
      docs[0].id_contrato !== FIXTURE.contract ||
      docs[0].situacao !== "ativo"
    )
      stop("COMPETENCE_APPROVED_FILE_RELATION");
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed(
        "versoes_documento",
        { id_documento_contrato: FIXTURE.contractualDocument },
        ordinal,
      ),
    );
    const versions = (
      await tracedPreparation("COMPETENCY_UI", async () =>
        rows("versoes_documento", {
          id_documento_contrato: FIXTURE.contractualDocument,
        }),
      )
    ).filter((v) => v.id_arquivo === FIXTURE.file && v.numero_versao === docs[0].versao_atual);
    if (versions.length !== 1 || !uuid(versions[0].id)) stop("COMPETENCE_APPROVED_FILE_VERSION");
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed("arquivos", { id: FIXTURE.file }, ordinal),
    );
    const files = await tracedPreparation("COMPETENCY_UI", async () =>
      rows("arquivos", { id: FIXTURE.file }),
    );
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
    const value = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead("obter_documentos_competencia_v115", {
        p_id_competencia: c.id,
      }),
    );
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
    const file = await tracedPreparation("COMPETENCY_UI", async () => approvedContractFile());
    await tracedPreparation("COMPETENCY_UI", async () => link(listPath));
    await tracedPreparation("COMPETENCY_UI", async () => listMonth(c.month));
    await tracedPreparation("COMPETENCY_UI", async () =>
      refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
    );
    const loaded = await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      poll(
        () => readDocuments(c),
        (x) => !!x.requirement,
        () => refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
      ),
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
    const recovered = io.recoveryLedgerR16
      ? JSON.parse(R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies.find((v) => v.id === c.id)
      : null;
    if (recovered && q.id !== recovered.requirementId) stop("RECOVERY_R8_DOCUMENT");
    const matching = loaded.value.documentos.filter((d) => d.requisito?.id === q.id);
    if (recovered && (matching.length !== 1 || matching[0].id !== recovered.documentId))
      stop("RECOVERY_R8_DOCUMENT");
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
      await tracedPreparation("COMPETENCY_RECONCILE", async () =>
        io.runtime.reuseDocument({
          broker: io.broker,
          payload,
          evidence,
          settleVerifiedPage: async () => io.fresh(),
          reconcile: async () => {
            await tracedPreparation("COMPETENCY_UI", async () =>
              refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
            );
            const d = await tracedPreparation("COMPETENCY_RECONCILE", async () => readDocuments(c));
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
        }),
      );
    }
    const ready = await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      poll(
        () => readDocuments(c),
        (x) => !!matchingDocument(x.value) && x.value.estado_documental === "complete",
        () => refreshArea(c.id, c.month, "documentos", "obter_documentos_competencia_v115"),
      ),
    );
    const d = matchingDocument(ready.value);
    c.documentId = d.id;
    c.evidence = evidence;
  }
  async function analysis(c) {
    const a = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead("obter_analise_competencia_v116", {
        p_id_competencia: c.id,
      }),
    );
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
    await tracedPreparation("COMPETENCY_UI", async () =>
      refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116"),
    );
    let a = await tracedPreparation("COMPETENCY_RECONCILE", async () => analysis(c));
    if (
      io.recoveryLedgerR8 &&
      c.id === R8_BINDINGS.competencies[0].id &&
      (!uuid(a.execucao_atual?.id) ||
        !["queued", "processing", "complete"].includes(a.estado_analise))
    )
      stop("RECOVERY_R8_ANALYSIS");
    if (io.recoveryLedgerR16) {
      const recovered = JSON.parse(R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies.find(
        (v) => v.id === c.id,
      );
      if (
        !recovered ||
        a.estado_analise !== "complete" ||
        a.execucao_atual?.id !== recovered.executionId
      )
        stop("RECOVERY_R16_OPINION");
    }
    if (a.estado_analise === "not_analyzed") {
      if (a.allowed_actions?.executar_analise !== true) stop("COMPETENCE_ANALYSIS_DENIED");
      await tracedPreparation("COMPETENCY_COMMAND", async () =>
        io.command({
          rpc: "solicitar_analise_competencia",
          payload: { p_id_competencia: c.id, p_tipo: "completa" },
          evidence: c.evidence,
          button: "Executar análise",
          confirmAfter: async () => {
            await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
            a = await tracedPreparation("COMPETENCY_RECONCILE", async () => analysis(c));
            return (
              uuid(a.execucao_atual?.id) &&
              ["queued", "processing", "complete"].includes(a.estado_analise)
            );
          },
        }),
      );
    }
    a = await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      poll(
        () => analysis(c),
        (v) => v.estado_analise === "complete" && uuid(v.execucao_atual?.id),
        () => refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116"),
      ),
    );
    c.executionId = a.execucao_atual.id;
    return a;
  }
  async function inspectRequirement(c) {
    const ordinal = io.generation();
    await tracedPreparation("COMPETENCY_UI", async () => click("Abrir requisito " + code));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed(
        "obter_detalhe_requisito_v117",
        { p_id_competencia: c.id, p_id_requisito: c.requirementId },
        ordinal,
      ),
    );
    const detail = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead("obter_detalhe_requisito_v117", {
        p_id_competencia: c.id,
        p_id_requisito: c.requirementId,
      }),
    );
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
    const detail = await tracedPreparation("COMPETENCY_UI", async () => inspectRequirement(c));
    // Do not review unrelated requirements or override an already conforming result.
    if (targets[0].resultado === "conforme") {
      await tracedPreparation("COMPETENCY_UI", async () => io.page.keyboard.press("Escape"));
      await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
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
    await tracedPreparation("COMPETENCY_UI", async () => click("Revisar resultado", region));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed(
        "obter_contexto_revisao_v117",
        { p_id_competencia: c.id, p_id_requisito: c.requirementId },
        before,
      ),
    );
    const ctx = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead("obter_contexto_revisao_v117", {
        p_id_competencia: c.id,
        p_id_requisito: c.requirementId,
      }),
    );
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
    await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      observed("versoes_documento", { "documentos_competencia.id_competencia": c.id }, before, {
        select: REVIEW_SELECT,
      }),
    );
    const versions = await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      rows(
        "versoes_documento",
        {
          "documentos_competencia.id_competencia": c.id,
          id: documentVersion,
        },
        { select: REVIEW_SELECT },
      ),
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
    await tracedPreparation("COMPETENCY_UI", async () =>
      region.getByLabel("Resultado da revisão", { exact: true }).selectOption("conforme"),
    );
    await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      region
        .getByLabel("Justificativa da revisão", { exact: true })
        .fill(FIXTURE.reviewJustification),
    );
    await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      region.getByLabel("Fundamento da revisão", { exact: true }).fill(FIXTURE.reviewFoundation),
    );
    const checkbox = region.getByRole("checkbox", {
      name: `Selecionar ${v.arquivos.nome_original} versão ${v.numero_versao}`,
      exact: true,
    });
    if ((await tracedPreparation("COMPETENCY_UI", async () => checkbox.count())) !== 1)
      stop("COMPETENCE_REVIEW_EVIDENCE_AMBIGUOUS");
    await tracedPreparation("COMPETENCY_UI", async () => checkbox.check());
    await tracedPreparation("COMPETENCY_UI", async () =>
      region.getByLabel("Página da evidência 1", { exact: true }).fill("1"),
    );
    await tracedPreparation("COMPETENCY_UI", async () =>
      region.getByLabel("Trecho da evidência 1", { exact: true }).fill(FIXTURE.excerpt),
    );
    await tracedPreparation("COMPETENCY_UI", async () => click("Revisar e confirmar", region));
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
    await tracedPreparation("COMPETENCY_COMMAND", async () =>
      io.command({
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
          await tracedPreparation("COMPETENCY_UI", async () => io.page.keyboard.press("Escape"));
          await tracedPreparation("COMPETENCY_UI", async () =>
            refreshArea(c.id, c.month, "analise", "obter_analise_competencia_v116"),
          );
          a = await tracedPreparation("COMPETENCY_RECONCILE", async () => analysis(c));
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
      }),
    );
    c.executionId = a.execucao_atual.id;
    return a;
  }
  async function opinion(c) {
    let view = await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(c.id, c.month));
    if (
      view.blocking_summary?.analise_concluida_atual !== true ||
      view.allowed_actions?.abrir_parecer !== true
    )
      stop("COMPETENCE_OPINION_GATE");
    let ordinal = io.generation();
    await tracedPreparation("COMPETENCY_UI", async () => link(`/competencias/${c.id}/parecer`));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed("pareceres_internos", { id_competencia: c.id }, ordinal),
    );
    const readOpinion = async () => {
      const list = await tracedPreparation("COMPETENCY_UI", async () =>
        rows("pareceres_internos", {
          id_competencia: c.id,
          id_contrato: FIXTURE.contract,
          id_organizacao: FIXTURE.organization,
        }),
      );
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
      await tracedPreparation("COMPETENCY_UI", async () => click("Atualizar"));
      await tracedPreparation("COMPETENCY_UI", async () =>
        observed("pareceres_internos", { id_competencia: c.id }, n),
      );
    };
    let p = await tracedPreparation("COMPETENCY_RECONCILE", async () => readOpinion());
    if (!p) {
      if (io.recoveryLedgerR11 && c.id === R5_BINDINGS.competencies[0].id)
        stop("RECOVERY_R11_OPINION");
      const evidence = {
        ...c.evidence,
        analysisCurrent: true,
        analysisComplete: true,
        opinionGate: true,
      };
      await tracedPreparation("COMPETENCY_COMMAND", async () =>
        io.command({
          rpc: "solicitar_parecer_interno",
          payload: { p_id_competencia: c.id },
          evidence,
          button: "Solicitar parecer",
          confirmAfter: async (jobUUID) => uuid(jobUUID),
        }),
      );
    }
    p = await tracedPreparation("COMPETENCY_RECONCILE", async () =>
      poll(
        readOpinion,
        (x) =>
          !!x &&
          uuid(x.id) &&
          hash(x.hash) &&
          !["queued", "processing", "pendente", "processando"].includes(x.status),
        refresh,
      ),
    );
    if (
      ["failed", "error", "cancelado", "reprovado"].includes(p.status) ||
      p.id_competencia !== c.id
    )
      stop("COMPETENCE_OPINION_FAILED");
    if (p.status !== "aprovado" || !p.aprovado_em) {
      await tracedPreparation("COMPETENCY_UI", async () => click("Aprovar parecer"));
      const dialog = io.page.getByRole("dialog", {
        name: "Confirmar aprovação",
        exact: true,
      });
      await tracedPreparation("COMPETENCY_UI", async () =>
        dialog.getByLabel("Fundamento (opcional)", { exact: true }).fill(FIXTURE.foundation),
      );
      const evidence = {
        ...c.evidence,
        opinions: [{ ...io.official(p), competency: c.id }],
      };
      const id = p.id;
      await tracedPreparation("COMPETENCY_COMMAND", async () =>
        io.command({
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
            await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
            p = await tracedPreparation("COMPETENCY_RECONCILE", async () => readOpinion());
            return p?.id === id && p.status === "aprovado" && !!p.aprovado_em;
          },
        }),
      );
    }
    c.opinionId = p.id;
    return p;
  }
  async function present(c, register) {
    let view = await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(c.id, c.month));
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
      v.portao?.percentual === 100;
    if (view.blocking_summary?.analise_concluida_atual !== true)
      stop("COMPETENCE_PRESENTATION_GATE_ANALYSIS");
    if (view.blocking_summary?.parecer_aprovado !== true)
      stop("COMPETENCE_PRESENTATION_GATE_OPINION");
    if (view.portao?.liberado !== true) stop("COMPETENCE_PRESENTATION_GATE_PORTAO");
    const snapshot = view.competencia.percentual_conformidade;
    if (
      view.portao?.percentual !== 100 ||
      !(
        snapshot === null ||
        (typeof snapshot === "number" &&
          Number.isFinite(snapshot) &&
          snapshot >= 0 &&
          snapshot <= 100)
      )
    )
      stop("COMPETENCE_PRESENTATION_GATE_PERCENT");
    if (view.allowed_actions?.apresentar !== true) stop("COMPETENCE_PRESENTATION_GATE_ACTION");
    const approved = (v) =>
      v?.competencia?.id === c.id &&
      v.competencia.id_organizacao === FIXTURE.organization &&
      v.competencia.id_contrato === FIXTURE.contract &&
      v.competencia.competencia_referencia === c.month &&
      v.competencia.situacao === "pode_apresentar_contratante" &&
      v.competencia.percentual_conformidade === 100 &&
      v.blocking_summary?.aprovacao_apresentacao_atual === true &&
      ready(v);
    if (view.competencia.situacao === "pode_apresentar_contratante" && !approved(view))
      stop("COMPETENCE_PRESENTATION_STATE");
    await tracedPreparation("COMPETENCY_UI", async () => link(`/competencias/${c.id}/apresentar`));
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    const evidence = {
      ...c.evidence,
      analysisCurrent: true,
      analysisComplete: true,
      opinionApproved: true,
      compliance: 100,
    };
    if (view.competencia.situacao !== "pode_apresentar_contratante") {
      if (
        !["em_analise", "em_reanalise", "pendente_correcao", "rascunho"].includes(
          view.competencia.situacao,
        ) ||
        view.blocking_summary.aprovacao_apresentacao_atual === true
      )
        stop("COMPETENCE_PRESENTATION_STATE");
      await tracedPreparation("COMPETENCY_UI", async () =>
        io.page
          .getByLabel("Fundamento da aprovação (opcional)", { exact: true })
          .fill(FIXTURE.foundation),
      );
      await tracedPreparation("COMPETENCY_UI", async () => click("Aprovar apresentação"));
      const dialog = io.page.getByRole("dialog", {
        name: "Confirmar aprovação institucional",
        exact: true,
      });
      const approvalOrdinal = io.generation();
      await tracedPreparation("COMPETENCY_COMMAND", async () =>
        io.command({
          rpc: "aprovar_apresentacao",
          payload: { p_id_competencia: c.id, p_fundamento: FIXTURE.foundation },
          evidence,
          button: "Confirmar aprovação",
          scope: dialog,
          confirmAfter: async () => {
            await tracedPreparation("COMPETENCY_UI", async () =>
              observed(
                "obter_visao_geral_competencia",
                { p_id_competencia: c.id },
                approvalOrdinal,
              ),
            );
            view = await tracedPreparation("COMPETENCY_GET", async () =>
              io.rpcRead("obter_visao_geral_competencia", {
                p_id_competencia: c.id,
              }),
            );
            return approved(view);
          },
        }),
      );
    }
    // A confirmed receipt remains confirmed even if authorization changes afterwards.
    // Re-read before admitting a binding or opening the independent register command.
    view = await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(c.id, c.month));
    if (!approved(view) || view.allowed_actions?.apresentar !== true)
      stop("COMPETENCE_PRESENTATION_STATE");
    const bindingOrdinal = io.generation();
    await tracedPreparation("COMPETENCY_UI", async () => link(`/competencias/${c.id}/apresentar`));
    await tracedPreparation("COMPETENCY_UI", async () =>
      observed("obter_visao_geral_competencia", { p_id_competencia: c.id }, bindingOrdinal),
    );
    view = await tracedPreparation("COMPETENCY_GET", async () =>
      io.rpcRead(
        "obter_visao_geral_competencia",
        { p_id_competencia: c.id },
        { after: bindingOrdinal },
      ),
    );
    await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
    if (!approved(view) || view.allowed_actions?.apresentar !== true)
      stop("COMPETENCE_PRESENTATION_STATE");
    c.state = view.competencia.situacao;
    if (!register) return;
    if (
      c.month !== "2026-09-01" ||
      view.competencia.situacao !== "pode_apresentar_contratante" ||
      view.blocking_summary?.aprovacao_apresentacao_atual !== true
    )
      stop("COMPETENCE_REGISTER_GATE");
    await tracedPreparation("COMPETENCY_UI", async () =>
      io.page
        .getByLabel("Protocolo (se disponível)", { exact: true })
        .fill("HML-TRILHA-A-20261108"),
    );
    await tracedPreparation("COMPETENCY_UI", async () =>
      io.page
        .getByLabel("Forma da apresentação (se disponível)", { exact: true })
        .fill("Ensaio sintético em homologação."),
    );
    await tracedPreparation("COMPETENCY_UI", async () => click("Registrar apresentação"));
    const dialog = io.page.getByRole("dialog", {
      name: "Confirmar envio ao contratante",
      exact: true,
    });
    let presentationId = null;
    await tracedPreparation("COMPETENCY_COMMAND", async () =>
      io.command({
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
          if ((await tracedPreparation("COMPETENCY_UI", async () => result.count())) !== 1)
            return false;
          const href = await tracedPreparation("COMPETENCY_UI", async () =>
            result.getAttribute("href"),
          );
          const match = new RegExp(
            "^/competencias/" + c.id + "/apresentacoes/([0-9a-f-]{36})$",
          ).exec(href || "");
          if (!match || !uuid(match[1])) return false;
          presentationId = match[1];
          const n = io.generation();
          await tracedPreparation("COMPETENCY_UI", async () => link(href));
          await tracedPreparation("COMPETENCY_UI", async () =>
            observed("apresentacoes_contratante", { id: presentationId, id_competencia: c.id }, n),
          );
          await tracedPreparation("COMPETENCY_UI", async () =>
            observed("pacotes_competencia", { id_competencia: c.id }, n),
          );
          await tracedPreparation("COMPETENCY_UI", async () =>
            observed("itens_pacote_competencia", { id_competencia: c.id }, n),
          );
          return await tracedPreparation("COMPETENCY_RECONCILE", async () =>
            readPackage(c, presentationId),
          );
        },
      }),
    );
    if (!presentationId) stop("COMPETENCE_REGISTER_UNCERTAIN");
    c.presentationId = presentationId;
    view = await tracedPreparation("COMPETENCY_RECONCILE", async () => overview(c.id, c.month));
    if (view.competencia.situacao !== "aguardando_contratante")
      stop("COMPETENCE_REGISTER_STATE_UNPROVEN");
    c.state = view.competencia.situacao;
  }
  async function readPackage(c, id) {
    const list = await tracedPreparation("COMPETENCY_UI", async () =>
      rows("apresentacoes_contratante", {
        id,
        id_competencia: c.id,
        id_contrato: FIXTURE.contract,
        id_organizacao: FIXTURE.organization,
      }),
    );
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
    const listPk = await tracedPreparation("COMPETENCY_UI", async () =>
      rows("pacotes_competencia", {
        id: a.id_pacote,
        id_competencia: c.id,
        id_contrato: FIXTURE.contract,
        id_organizacao: FIXTURE.organization,
      }),
    );
    if (listPk.length !== 1) return false;
    const p = listPk[0];
    inContext(p, a.id_pacote);
    if (p.id_competencia !== c.id || !hash(p.hash_pacote) || !p.congelado_em)
      stop("COMPETENCE_PACKAGE_UNPROVEN");
    const items = await tracedPreparation("COMPETENCY_UI", async () =>
      rows("itens_pacote_competencia", {
        id_pacote: p.id,
        id_competencia: c.id,
        id_contrato: FIXTURE.contract,
        id_organizacao: FIXTURE.organization,
      }),
    );
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
      const initial = await tracedPreparation("COMPETENCY_UI", async () => createOrReuse(month));
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
      await tracedPreparation("COMPETENCY_UI", async () => ensureDocument(c));
      receipt.requirementId = c.requirementId;
      receipt.documentId = c.documentId;
      let a = await tracedPreparation("COMPETENCY_UI", async () => ensureAnalysis(c));
      a = await tracedPreparation("COMPETENCY_UI", async () => reviewIfNeeded(c, a));
      receipt.executionId = c.executionId;
      receipt.documentVersionId = c.documentVersionId || null;
      await tracedPreparation("COMPETENCY_UI", async () => opinion(c));
      receipt.opinionId = c.opinionId;
      await tracedPreparation("COMPETENCY_UI", async () => present(c, month === "2026-09-01"));
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
      activePreparationDiagnostics?.capture(error);
      const safeCode = classifyPreparationFailure(error).code;
      receipt.code = safeCode.startsWith("COMPETENCE_")
        ? safeCode
        : "COMPETENCE_DEPENDENCY_BLOCKED";
      if (temporalAborted) break;
      try {
        await tracedPreparation("COMPETENCY_UI", async () => io.page.keyboard.press("Escape"));
        await tracedPreparation("COMPETENCY_UI", async () => io.fresh());
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
  "RECOVERY_R5_LEDGER",
  "RECOVERY_R6_LEDGER",
  "RECOVERY_R7_LEDGER",
  "RECOVERY_R7_PROOF",
  "PREPARE_SECRET_ENV",
  "RECOVERY_R4_PROOF",
  "RECOVERY_R3_LEDGER",
  "RECOVERY_SOURCE_INACTIVE",
  "FLOW_LIST_READBACK_VERSION",
  "OBSERVATION_MUTATION",
  "OBSERVATION_ORDINAL",
  "RECOVERY_LEDGER",
  "RECOVERY_STATE",
  "RECOVERY_LIST",
  "RECOVERY_READ_ONLY",
  "RECOVERY_R8_LEDGER",
  "RECOVERY_R9_LEDGER",
  "RECOVERY_R10_LEDGER",
  "RECOVERY_R11_LEDGER",
  "RECOVERY_R13_LEDGER",
  "RECOVERY_R17_LEDGER",
  "RECOVERY_R17_PRESENTATION",
  "RECOVERY_R16_LEDGER",
  "RECOVERY_R16_OPINION",
  "RECOVERY_R15_LEDGER",
  "RECOVERY_R15_OPINION",
  "RECOVERY_R11_OPINION",
  "RECOVERY_R8_DOCUMENT",
  "RECOVERY_R8_ANALYSIS",
  "RECOVERY_PROOF",
  "RECOVERY_CONFIRMED_OPERATION",
  "DIAGNOSTIC_SUBPHASE",
  "DIAGNOSTIC_REENTRANT",
  "PREPARER_TIMEOUT",
  "PREPARER_CLEANUP",
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
  "COMPETENCE_PRESENTATION_GATE_ANALYSIS",
  "COMPETENCE_PRESENTATION_GATE_OPINION",
  "COMPETENCE_PRESENTATION_GATE_PORTAO",
  "COMPETENCE_PRESENTATION_GATE_PERCENT",
  "COMPETENCE_PRESENTATION_GATE_ACTION",
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
  "OBSERVATION_DIAGNOSTIC",
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
  validateR1RecoveryDocument(R1_RECOVERY_DOCUMENT);
  validateR2RecoveryDocument(R2_RECOVERY_DOCUMENT);
  const r4Recovery = validateR4RecoveryDocument(getValidatedR4ZeroAuth());
  const r5Recovery = validateR5RecoveryDocument(R5_RECOVERY_DOCUMENT);
  const r6Recovery = validateR6RecoveryDocument(R6_RECOVERY_DOCUMENT);
  const r7Recovery = validateR7RecoveryDocument(getValidatedR7ZeroAuth());
  const r8Recovery = validateR8RecoveryDocument(R8_RECOVERY_DOCUMENT);
  const r9Recovery = validateR9RecoveryDocument(R9_RECOVERY_DOCUMENT);
  const r10Recovery = validateR10RecoveryDocument(R10_RECOVERY_DOCUMENT);
  const r13Recovery = validateR13RecoveryDocument(R13_RECOVERY_DOCUMENT);
  const r15Recovery = validateR15RecoveryDocument(R15_RECOVERY_DOCUMENT);
  const r16Recovery = validateR16RecoveryDocument(R16_RECOVERY_DOCUMENT);
  const r17Recovery = validateR17RecoveryDocument(R17_RECOVERY_DOCUMENT);
  const r11Recovery = validateR11RecoveryDocument(R11_RECOVERY_DOCUMENT);
  const validatedBudget = recoveryBudget(
    R1_RECOVERY_DOCUMENT,
    R3_RECOVERY_DOCUMENT,
    r4Recovery,
    r5Recovery,
    r6Recovery,
    r7Recovery,
    r8Recovery,
    r9Recovery,
    r10Recovery,
    r11Recovery,
    r13Recovery,
    r15Recovery,
    r16Recovery,
    r17Recovery,
  );
  const diagnostics = createPreparationDiagnostics();
  if (activePreparationDiagnostics) err("DIAGNOSTIC_REENTRANT");
  activePreparationDiagnostics = diagnostics;
  let browser,
    proxy,
    fence,
    observer,
    runtime,
    broker,
    page,
    logoutVerified = false,
    completed = false;
  let phase = "PREFLIGHT",
    result = null,
    sourceList = null,
    blockedCode = null,
    recoveryState = null;
  const output = resolve("artifacts/trilha-a-fixtures");
  await tracedPreparation("PREFLIGHT", async () => mkdir(output, { recursive: true }));
  writeFileSync(
    join(output, "receipts-r1.json"),
    JSON.stringify(R1_RECOVERY_DOCUMENT, null, 2) + "\n",
    { mode: 0o600 },
  );
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
    const native = JSON.parse(
      await tracedPreparation("PREFLIGHT", async () =>
        readFile(".audit-work/native-proof.json", "utf8"),
      ),
    );
    const proof = JSON.parse(
      await tracedPreparation("PREFLIGHT", async () =>
        readFile(".audit-work/provenance.json", "utf8"),
      ),
    );
    const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    execFileSync("git", ["diff", "--quiet", "HEAD"], { stdio: "ignore" });
    if (
      !validatePreparerIdentity(
        process.env,
        proof,
        native,
        await tracedPreparation("PREFLIGHT", async () => harnessIdentity()),
        head,
      )
    )
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
    await tracedPreparation("PREFLIGHT", async () => checkFreshDeployment(proof, true));
    const persist = createReceiptWriter(receiptPath, identity);
    broker = createIntentBroker({
      identity,
      persist,
      competenceGateAmended: true,
      recoveryLedger: R1_RECOVERY_DOCUMENT,
      recoveryLedgerR3: R3_RECOVERY_DOCUMENT,
      recoveryLedgerR4: r4Recovery,
      recoveryLedgerR5: r5Recovery,
      recoveryLedgerR6: r6Recovery,
      recoveryLedgerR7: r7Recovery,
      recoveryLedgerR8: r8Recovery,
      recoveryLedgerR9: r9Recovery,
      recoveryLedgerR10: r10Recovery,
      recoveryLedgerR11: r11Recovery,
      recoveryLedgerR13: r13Recovery,
      recoveryLedgerR15: r15Recovery,
      recoveryLedgerR16: r16Recovery,
      recoveryLedgerR17: r17Recovery,
      beforeArm: (rpc, payload, evidence, binding) =>
        observer?.markMutation(rpc, payload, evidence, binding) === true,
    });
    const debug = createServer();
    await tracedPreparation(
      "PREFLIGHT",
      async () => new Promise((resolve) => debug.listen(0, "127.0.0.1", resolve)),
    );
    const debugPort = debug.address().port;
    await tracedPreparation(
      "PREFLIGHT",
      async () => new Promise((resolve) => debug.close(resolve)),
    );
    proxy = await tracedPreparation("PREFLIGHT", async () => startDestinationProxy());
    browser = await tracedPreparation("PREFLIGHT", async () =>
      launchNativeBrowser({ debugPort, proxy: proxy.url }),
    );
    const context = await tracedPreparation("PREFLIGHT", async () =>
      browser.newContext({
        viewport: { width: 1440, height: 1000 },
        serviceWorkers: "block",
      }),
    );
    page = await tracedPreparation("PREFLIGHT", async () => context.newPage());
    page.setDefaultTimeout(15000);
    let scriptError = false;
    page.on("pageerror", () => {
      scriptError = true;
    });
    const session = await tracedPreparation("PREFLIGHT", async () => context.newCDPSession(page)),
      { targetInfo } = await tracedPreparation("PREFLIGHT", async () =>
        session.send("Target.getTargetInfo"),
      );
    await tracedPreparation("PREFLIGHT", async () => session.detach());
    fence = await tracedPreparation("PREFLIGHT", async () =>
      installNativeFence({
        debugPort,
        identity: targetInfo,
        policy: broker.policy,
        verifyResponse: (r) => verifyPublishedResponse(proof, r),
        closeContext: () => context.close(),
      }),
    );
    observer = createOfficialObserver(page, { identity });
    const fresh = async () => {
      await tracedPreparation("RUNTIME_FRESH", async () => settleVerifiedPage(page, fence));
      await tracedPreparation("RUNTIME_FRESH", async () => observer.flush());
      if (scriptError) err("PREPARER_SCRIPT");
    };
    const goKnown = async (path, readBudget) =>
      observer.readBarrier(async (budget) => {
        const guard = () => observer.assertReadBarrier(budget);
        guard();
        if (!Object.hasOwn(proof.documents, path)) err("PREPARER_SSR_PATH");
        await tracedPreparation("PREFLIGHT", () => checkFreshDeployment(proof, false));
        guard();
        await tracedPreparation("RUNTIME_FRESH", () => observer.drainReads(budget));
        guard();
        await tracedPreparation("RUNTIME_NAVIGATE", () =>
          navigateVerifiedPage(page, fence, FIXTURE.origin + path, () =>
            observer.readBarrierRemaining(budget),
          ),
        );
        guard();
        await tracedPreparation("RUNTIME_FRESH", () => fresh());
        guard();
      }, readBudget);
    const link = async (path, options, readBudget) => {
      const guard = () =>
        readBudget === undefined ? true : observer.assertReadBarrier(readBudget);
      guard();
      if (!/^\/(?:contratos|competencias)\/[a-f0-9-]{36}(?:\/[a-z0-9-]+)*$/.test(path))
        err("PREPARER_SPA_PATH");
      await tracedPreparation("RUNTIME_FRESH", async () =>
        readBudget === undefined ? fresh() : observer.readBarrier(() => fresh(), readBudget),
      );
      guard();
      if (page.url() === FIXTURE.origin + path) {
        if (Object.hasOwn(proof.documents, path)) {
          await tracedPreparation("PREFLIGHT", async () => goKnown(path, readBudget));
          return;
        }
        await tracedPreparation("PREFLIGHT", async () =>
          goKnown(`/contratos/${FIXTURE.contract}/competencias`, readBudget),
        );
      }
      let selected = null;
      if (options !== undefined) {
        const spec = {
          contract_summary: ["/contratos/" + FIXTURE.contract, "Contrato da competência"],
          contract_documents: [
            "/contratos/" + FIXTURE.contract + "/documentos",
            "Documentos do contrato",
          ],
        }[options?.contextual];
        if (!keys(options, ["contextual"]) || !spec || path !== spec[0]) err("PREPARER_SPA_PATH");
        const nav = page.getByRole("navigation", { name: "Navegação principal", exact: true });
        if ((await tracedPreparation("PREFLIGHT", async () => nav.count())) !== 1)
          err("PREPARER_SPA_LINK");
        const group = nav.getByRole("group", { name: "Contexto atual", exact: true });
        if ((await tracedPreparation("PREFLIGHT", async () => group.count())) !== 1)
          err("PREPARER_SPA_LINK");
        const target = group.getByRole("link", { name: spec[1], exact: true });
        if (
          (await tracedPreparation("PREFLIGHT", async () => target.count())) !== 1 ||
          !(await tracedPreparation("PREFLIGHT", async () => target.isVisible())) ||
          !(await tracedPreparation("PREFLIGHT", async () => target.isEnabled())) ||
          (await tracedPreparation("PREFLIGHT", async () => target.getAttribute("href"))) !==
            path ||
          (await tracedPreparation("PREFLIGHT", async () =>
            target.getAttribute("aria-disabled"),
          )) === "true"
        )
          err("PREPARER_SPA_LINK");
        selected = target;
      }
      const candidates = page.locator(`a[href="${path}"]:visible`);
      for (
        let n = 0;
        !selected && n < (await tracedPreparation("PREFLIGHT", async () => candidates.count()));
        n++
      ) {
        const item = candidates.nth(n);
        if (
          (await tracedPreparation("PREFLIGHT", async () => item.isEnabled())) &&
          (await tracedPreparation("PREFLIGHT", async () => item.getAttribute("aria-disabled"))) !==
            "true"
        ) {
          selected = item;
          break;
        }
      }
      if (!selected) err("PREPARER_SPA_LINK");
      guard();
      if (readBudget !== undefined) {
        await tracedPreparation("RUNTIME_FRESH", () => observer.drainReads(readBudget));
        guard();
      }
      await tracedPreparation("RUNTIME_NAVIGATE", async () =>
        selected.click(
          readBudget === undefined ? {} : { timeout: observer.readBarrierRemaining(readBudget) },
        ),
      );
      guard();
      await tracedPreparation("RUNTIME_NAVIGATE", async () =>
        page.waitForURL(FIXTURE.origin + path),
      );
      await tracedPreparation("RUNTIME_FRESH", async () => fresh());
    };
    let contextVerified = false;
    const verifyContext = async () => {
      await tracedPreparation("PREFLIGHT", async () => waitOrganization(page));
      let contracts;
      try {
        contracts = await tracedPreparation("RUNTIME_CONTEXT", async () =>
          observer.read("contratos", { id: FIXTURE.contract }),
        );
      } catch {
        contracts = [];
      }
      if (!contracts.length && !contextVerified) {
        await tracedPreparation("PREFLIGHT", async () => goKnown(`/contratos/${FIXTURE.contract}`));
        contracts = await tracedPreparation("RUNTIME_CONTEXT", async () =>
          observer.read("contratos", { id: FIXTURE.contract }),
        );
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
      recoveryLedgerR13: r13Recovery,
      recoveryLedgerR15: r15Recovery,
      recoveryLedgerR16: r16Recovery,
      recoveryLedgerR17: r17Recovery,
      page,
      fence,
      waitOrganization,
      openOrganizationSelector: openVerifiedOrganizationSelector,
      verifyContext,
    });
    assertPrivateRequestEnvironment(process.env);
    phase = "LOGIN";
    await tracedPreparation("LOGIN", async () =>
      runtime.login({
        email: process.env.CONTAOS_HML_SYNTHETIC_EMAIL,
        password: process.env.CONTAOS_HML_SYNTHETIC_PASSWORD,
      }),
    );
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
      await tracedPreparation("PREFLIGHT", async () => runtime.context());
      await tracedPreparation("RUNTIME_FRESH", async () => fresh());
      const caps = await tracedPreparation("PREFLIGHT", async () =>
        observer.rpcRead("consultar_permissoes_efetivas", {
          p_id_organizacao: FIXTURE.organization,
          p_id_contrato: FIXTURE.contract,
        }),
      );
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
      await tracedPreparation("PREFLIGHT", async () => runtime.context());
      await tracedPreparation("RUNTIME_FRESH", async () => fresh());
      if (typeof confirmAfter !== "function") err("PREPARER_RECONCILIATION");
      const verified = { context: true, capability: true, reconciled: true };
      let value;
      const operationGeneration = observer.generation();
      await tracedPreparation("RUNTIME_FRESH", async () =>
        confirmUiIntent({
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
              await tracedPreparation("PREFLIGHT", async () => runtime.context());
              return { payload, evidence, verified };
            }
            await tracedPreparation("RUNTIME_FRESH", async () => fresh());
            if (
              !(await tracedPreparation("PREFLIGHT", async () =>
                observer.observedAfter("rpc:" + rpc, {}, operationGeneration),
              ))
            )
              err("PREPARER_RESPONSE_UNCONFIRMED");
            value = await tracedPreparation("PREFLIGHT", async () => observer.rpcRead(rpc));
            return {
              confirmed:
                (await tracedPreparation("PREFLIGHT", async () => confirmAfter(value))) === true,
            };
          },
        }),
      );
      return value;
    };
    const io = {
      recoveryLedger: R1_RECOVERY_DOCUMENT,
      recoveryLedgerR3: R3_RECOVERY_DOCUMENT,
      recoveryLedgerR4: r4Recovery,
      recoveryLedgerR5: r5Recovery,
      recoveryLedgerR6: r6Recovery,
      recoveryLedgerR7: r7Recovery,
      recoveryLedgerR8: r8Recovery,
      recoveryLedgerR9: r9Recovery,
      recoveryLedgerR10: r10Recovery,
      recoveryLedgerR11: r11Recovery,
      recoveryLedgerR13: r13Recovery,
      recoveryLedgerR15: r15Recovery,
      recoveryLedgerR16: r16Recovery,
      recoveryLedgerR17: r17Recovery,
      sealRecoveryOpinion: (after) => observer.sealRecoveryOpinion(broker, after),
      recoveryReady: (proof, opinionProof) => {
        broker.authorizeRecovery(proof, opinionProof);
        recoveryState = proof;
        return true;
      },
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
      readBarrier: observer.readBarrier,
      assertReadBarrier: observer.assertReadBarrier,
      readBarrierRemaining: observer.readBarrierRemaining,
      drainReads: observer.drainReads,
      rpcRead: observer.rpcRead,
      generation: observer.generation,
      observedAfter: observer.waitObservedAfter,
      wait: (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(2000, ms))),
      abortPhase: async () => {
        fence.close();
        await tracedPreparation("PREFLIGHT", async () => context.close());
      },
      text: await tracedPreparation("PREFLIGHT", async () =>
        readFile(
          "docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
          "utf8",
        ),
      ),
    };
    phase = "SOURCE_AND_LIST";
    sourceList = await tracedPreparation("SOURCE_AND_LIST", async () => prepareSourceAndList(io));
    phase = "COMPETENCIES";
    result = await tracedPreparation("COMPETENCIES", async () =>
      prepareCompetencies(io, sourceList),
    );
    phase = "FINAL_READBACK";
    await tracedPreparation("PREFLIGHT", async () => runtime.context());
    await tracedPreparation("RUNTIME_FRESH", async () => fresh());
    await tracedPreparation("PREFLIGHT", async () => checkFreshDeployment(proof, true));
    if (result?.state !== "confirmed") err("PREPARER_INCOMPLETE");
    completed = true;
  } catch (error) {
    blockedCode = diagnostics.capture(error);
    throw error;
  } finally {
    if (runtime) {
      try {
        logoutVerified = await tracedPreparation("LOGOUT", async () =>
          diagnostics.cleanup(() => runtime.logout()),
        );
      } catch {
        logoutVerified = false;
      } finally {
        await tracedPreparation("CLEANUP", async () =>
          diagnostics.finishCleanup("RUNTIME_CLEAR_FAILED", () => runtime.clear()),
        );
      }
    }
    await tracedPreparation("CLEANUP", async () =>
      diagnostics.finishCleanup("OBSERVER_CLOSE_FAILED", async () => {
        await tracedPreparation("CLEANUP", async () => observer?.seal());
        observer?.close();
      }),
    );
    await tracedPreparation("CLEANUP", async () =>
      diagnostics.finishCleanup("FENCE_CLOSE_FAILED", () => fence?.close()),
    );
    await tracedPreparation("CLEANUP", async () =>
      diagnostics.finishCleanup("BROWSER_CLOSE_FAILED", () => browser?.close()),
    );
    await tracedPreparation("CLEANUP", async () =>
      diagnostics.finishCleanup("PROXY_CLOSE_FAILED", () => proxy?.close()),
    );
    const cleanupOk = diagnostics.snapshot().cleanupFailure === null;
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
      blockedCode ||= diagnostics.capture(error);
    }
    collect(bindings);
    const observationDiagnostic = createObservationDiagnostic(
      identity,
      observer?.observationFailure() ?? null,
    );
    if (observationDiagnostic.firstFailure !== null) {
      completed = false;
      blockedCode ||= diagnostics.capture(new Error("OBSERVATION_FAILED"));
    }
    const report = {
      schema: "contaos.fixture.preparation.v1",
      failure: blockedCode || (cleanupOk ? null : "PREPARER_CLEANUP"),
      diagnostics: diagnostics.snapshot(),
      intentLedger: preparationIntentSummary(broker),
      recovery: {
        ledgerSha256: R1_RECEIPTS_SHA256,
        priorWorkflowRun: "42540864527",
        confirmedBefore: validatedBudget.confirmedBefore,
        maxNewIntentions: validatedBudget.maxNewIntentions,
        r3ReceiptsSha256: R3_RECOVERY_DOCUMENT.receiptsSha256,
        r3WorkflowRun: R3_RECOVERY_DOCUMENT.workflowRun,
        r4ZeroAuth: r4Recovery,
        reconciled: !!recoveryState,
        sourceVersion: recoveryState?.sourceVersion || null,
        sourceHash: recoveryState?.sourceHash || null,
      },
      bindings,
      ...identity,
      phase,
      completed: completed && logoutVerified && cleanupOk,
      logoutVerified,
      ids: [...new Set(safeIds)].slice(0, 32),
      v1Certified: false,
    };
    writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r3.json"), R3_RECOVERY_DOCUMENT.receiptsRaw, {
      mode: 0o600,
    });
    writeFileSync(
      join(output, "recovery-r3.json"),
      JSON.stringify(R3_RECOVERY_DOCUMENT, null, 2) + "\n",
      { mode: 0o600 },
    );
    writeFileSync(join(output, "receipts-r5.json"), R5_RECOVERY_DOCUMENT.receiptsRaw, {
      mode: 0o600,
    });
    writeFileSync(
      join(output, "recovery-r5.json"),
      JSON.stringify(R5_RECOVERY_DOCUMENT, null, 2) + "\n",
      { mode: 0o600 },
    );
    writeFileSync(join(output, "receipts-r6.json"), R6_RECOVERY_DOCUMENT.receiptsRaw, {
      mode: 0o600,
    });
    writeFileSync(
      join(output, "recovery-r6.json"),
      JSON.stringify(R6_RECOVERY_DOCUMENT, null, 2) + "\n",
      { mode: 0o600 },
    );
    writeFileSync(join(output, "recovery-r7.json"), JSON.stringify(r7Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r8.json"), r8Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r8.json"), JSON.stringify(r8Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(
      join(output, "observation-diagnostic.json"),
      JSON.stringify(observationDiagnostic, null, 2) + "\n",
      { mode: 0o600 },
    );
    writeFileSync(join(output, "receipts-r9.json"), r9Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r9.json"), JSON.stringify(r9Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r10.json"), r10Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r10.json"), JSON.stringify(r10Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r11.json"), r11Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r11.json"), JSON.stringify(r11Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r13.json"), r13Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r13.json"), JSON.stringify(r13Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r15.json"), r15Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r15.json"), JSON.stringify(r15Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r16.json"), r16Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r16.json"), JSON.stringify(r16Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    writeFileSync(join(output, "receipts-r17.json"), r17Recovery.receiptsRaw, { mode: 0o600 });
    writeFileSync(join(output, "recovery-r17.json"), JSON.stringify(r17Recovery, null, 2) + "\n", {
      mode: 0o600,
    });
    let sums = "";
    writeFileSync(
      join(output, "recovery-r2.json"),
      JSON.stringify(R2_RECOVERY_DOCUMENT, null, 2) + "\n",
      { mode: 0o600 },
    );
    for (const name of [
      "receipts.json",
      "report.json",
      "receipts-r1.json",
      "recovery-r2.json",
      "receipts-r3.json",
      "recovery-r3.json",
      "receipts-r5.json",
      "recovery-r5.json",
      "receipts-r6.json",
      "recovery-r6.json",
      "recovery-r7.json",
      "receipts-r8.json",
      "recovery-r8.json",
      "observation-diagnostic.json",
      "receipts-r9.json",
      "recovery-r9.json",
      "receipts-r10.json",
      "recovery-r10.json",
      "receipts-r11.json",
      "recovery-r11.json",
      "receipts-r13.json",
      "recovery-r13.json",
      "receipts-r15.json",
      "recovery-r15.json",
      "receipts-r16.json",
      "recovery-r16.json",
      "receipts-r17.json",
      "recovery-r17.json",
    ])
      sums +=
        createHash("sha256")
          .update(await tracedPreparation("PREFLIGHT", async () => readFile(join(output, name))))
          .digest("hex") +
        "  " +
        name +
        "\n";
    writeFileSync(join(output, "SHA256SUMS"), sums, { mode: 0o600 });
    activePreparationDiagnostics = null;
  }
  if (!completed || !logoutVerified || diagnostics.snapshot().cleanupFailure)
    err("PREPARER_INCOMPLETE");
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
  if (process.env.GITHUB_EVENT_NAME !== "workflow_run") err("PREPARER_MAIN_ONLY");
  await loadSingleRequestProof({ operation: "fixtures", fresh: true });
  if (!preparerEventAllowed(process.env)) err("PREPARER_MAIN_ONLY");
  return runFixturePreparation();
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch(() => {
    process.stderr.write("FIXTURE_PREPARATION_INCOMPLETE\n");
    process.exitCode = 1;
  });
}

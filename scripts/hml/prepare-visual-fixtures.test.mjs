import * as sut from "./prepare-visual-fixtures.mjs";
import test from "node:test";
import { createHash, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import {
  createIntentBroker,
  FIXTURE,
  validateBusinessPayload,
  safeReceipt,
  waitOfficialPhase,
} from "./prepare-visual-fixtures.mjs";
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const payload = { p_id_contrato: FIXTURE.contract, p_competencia_referencia: "2026-10-01" };
const request = (body = payload, extra = {}) => ({
  url: FIXTURE.api + "/rest/v1/rpc/criar_competencia",
  method: "POST",
  postData: JSON.stringify(body),
  stage: "REQUEST",
  sessionId: "s",
  interceptionId: "i",
  ...extra,
});
function broker(options = {}) {
  return createIntentBroker({
    readPolicy: () => false,
    persist: () => true,
    competenceGateAmended: true,
    ...(options.recoveryLedger
      ? { recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT, recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT }
      : {}),
    ...options,
  });
}
function arm(b, requestId = randomUUID()) {
  return b.arm({
    rpc: "criar_competencia",
    payload,
    requestId,
    verified: { context: true, capability: true, reconciled: true },
  });
}
const R6_R5_DOCUMENT = {
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
};

test("default remains closed, only explicitly injected read policy survives", () => {
  const b = broker();
  assert.equal(b.policy(request()), false);
  const c = broker({ readPolicy: (r) => r.method === "GET" });
  assert.equal(c.policy({ method: "GET", stage: "REQUEST" }), true);
  assert.equal(c.policy(request()), false);
});
test("one immutable intention permits matching POST once; response stage is nonconsuming", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { method: "OPTIONS" })), true);
  assert.equal(b.policy(request()), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
  assert.equal(b.policy(request()), false);
});
test("extra keys and wrong values denied; malformed JSON freezes", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request({ ...payload, evil: true })), false);
  assert.equal(b.policy(request({ ...payload, p_id_contrato: id })), false);
  assert.equal(
    b.policy(request(payload, { postData: '{"p_id_contrato":"x","p_id_contrato":"y"}' })),
    false,
  );
  assert.equal(b.policy(request()), false);
  assert.equal(b.snapshot().frozen, true);
});
test("literal destination only; no query redirect, encoding, other RPC or preflight", () => {
  const b = broker();
  arm(b);
  for (const url of [
    FIXTURE.api + "/rest/v1/rpc/criar_competencia?x=1",
    FIXTURE.api + "/rest/v1/rpc/%63riar_competencia",
    "https://evil.test/rest/v1/rpc/criar_competencia",
    FIXTURE.api + "/rest/v1/rpc/aprovar_apresentacao",
  ])
    assert.equal(b.policy(request(payload, { url })), false);
  assert.equal(
    b.policy(
      request(payload, {
        method: "OPTIONS",
        url: FIXTURE.api + "/rest/v1/rpc/aprovar_apresentacao",
      }),
    ),
    false,
  );
});
test("expiry is15 seconds and cannot be renewed; body at most64KiB", () => {
  let now = 0;
  const b = broker({ now: () => now });
  arm(b);
  now = 15000;
  assert.equal(b.policy(request()), false);
  assert.throws(() => arm(b), /INTENT_PENDING/);
  assert.equal(b.policy(request(payload, { postData: " ".repeat(65537) })), false);
});
test("business budget24 and no replacement or blind retry", () => {
  const b = broker();
  for (let i = 0; i < 24; i++) {
    arm(b);
    assert.equal(b.policy(request()), true);
    b.resolve("confirmed");
  }
  assert.throws(() => arm(b), /INTENT_BUDGET/);
  const c = broker();
  arm(c);
  assert.throws(() => arm(c), /INTENT_PENDING/);
  assert.throws(() => c.resolve("confirmed"), /INTENT_NOT_SENT/);
});
test("uncertain, denied or stale state freezes broker", () => {
  for (const result of ["uncertain", "denied", "stale"]) {
    const b = broker();
    arm(b);
    b.policy(request());
    b.resolve(result);
    assert.throws(() => arm(b), /INTENT_FROZEN/);
  }
});
test("gate context, capabilities, reconciliation and documented operations required", () => {
  const b = broker();
  assert.throws(
    () =>
      b.arm({
        rpc: "criar_competencia",
        payload,
        requestId: id,
        verified: { context: true, capability: false, reconciled: true },
      }),
    /PRECONDITION/,
  );
  assert.equal(validateBusinessPayload("delete_competencia", {}), false);
  assert.equal(
    validateBusinessPayload("criar_competencia", {
      ...payload,
      p_competencia_referencia: "2026-11-01",
    }),
    false,
  );
});
test("source correction and closed list payload, including nested keys", () => {
  assert.equal(FIXTURE.source, "8b942e46-a29b-40d9-8ad4-04aaf9124a34");
  const b = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_lista: null,
    p_versao_esperada: null,
    p_acao: "criar_lista",
    p_payload: {
      nome: FIXTURE.listName,
      descricao: FIXTURE.listDescription,
      vigencia_inicio: "2026-01-01",
      vigencia_fim: null,
    },
    p_motivo: FIXTURE.reason,
    p_request_id: id,
  };
  assert.equal(validateBusinessPayload("executar_comando_lista_v1", b), true);
  assert.equal(
    validateBusinessPayload("executar_comando_lista_v1", { ...b, p_acao: "descartar_rascunho" }),
    false,
  );
  assert.equal(
    validateBusinessPayload("executar_comando_lista_v1", {
      ...b,
      p_payload: { ...b.p_payload, user: id },
    }),
    false,
  );
});
test("dynamic IDs require current official origin and relationship", () => {
  const p = { p_id_competencia: id, p_tipo: "completa" };
  assert.equal(validateBusinessPayload("solicitar_analise_competencia", p), false);
  assert.equal(
    validateBusinessPayload("solicitar_analise_competencia", p, {
      competencies: [
        {
          id,
          month: "2026-10-01",
          organization: FIXTURE.organization,
          contract: FIXTURE.contract,
          official: true,
          current: true,
        },
      ],
    }),
    true,
  );
});
test("receipt rejects Auth/JWT/PII, extra keys, noncanonical UUID, unknown states", () => {
  for (const dirty of [
    { token: "x" },
    { user: { id } },
    { email: "x@y.test" },
    { access_token: "eyJ.abc.def" },
    { state: "anything" },
    { requestId: id.toUpperCase() },
  ])
    assert.throws(() => safeReceipt(dirty), /RECEIPT/);
  const r = safeReceipt({ requestId: id, state: "confirmed", rpc: "criar_competencia" });
  assert.equal(r.requestId, id);
});
test("no generic direct mutation: only approved document reuse RPC", async () => {
  const m = await import("./prepare-visual-fixtures.mjs");
  assert.equal(typeof m.reuseApprovedDocument, "function");
  assert.equal(m.directRpc, undefined);
});
test("polling is bounded300s,min2s and never sends mutations", async () => {
  let calls = 0,
    now = 0;
  const value = await waitOfficialPhase({
    read: async () => ({ state: ++calls === 2 ? "ready" : "pending" }),
    ready: (r) => r.state === "ready",
    now: () => now,
    wait: async (ms) => {
      assert.ok(ms >= 2000);
      now += ms;
    },
  });
  assert.equal(value.state, "ready");
  assert.equal(calls, 2);
  await assert.rejects(
    () =>
      waitOfficialPhase({
        read: async () => ({ state: "denied" }),
        ready: () => false,
        wait: async () => {},
      }),
    /PHASE_DENIED/,
  );
});

test("UI UUID seals at Request stage and synchronous persistence precedes permission", () => {
  const events = [];
  const b = broker({
    persist: (r) => {
      events.push(r.requestId);
      return true;
    },
  });
  const p = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_lista: null,
    p_versao_esperada: null,
    p_acao: "criar_lista",
    p_payload: {
      nome: FIXTURE.listName,
      descricao: FIXTURE.listDescription,
      vigencia_inicio: "2026-01-01",
      vigencia_fim: null,
    },
    p_motivo: FIXTURE.reason,
  };
  b.arm({
    rpc: "executar_comando_lista_v1",
    payload: p,
    uiGeneratedKey: "p_request_id",
    verified: { context: true, capability: true, reconciled: true },
  });
  assert.equal(
    b.policy({
      url: FIXTURE.api + "/rest/v1/rpc/executar_comando_lista_v1",
      method: "POST",
      postData: JSON.stringify({ ...p, p_request_id: id }),
      stage: "REQUEST",
      sessionId: "s",
      interceptionId: "i",
    }),
    true,
  );
  assert.deepEqual(events, [id]);
});
test("async, throwing, false or absent persistence fails closed", () => {
  for (const persist of [
    undefined,
    () => false,
    () => Promise.resolve(true),
    () => {
      throw Error("secret");
    },
  ]) {
    const b = broker({ persist });
    if (!persist) {
      assert.throws(() => arm(b), /PERSIST/);
      continue;
    }
    arm(b);
    assert.equal(b.policy(request()), false);
  }
});
test("competence payload2keys is blocked until amended gate integrated", () => {
  const b = broker({ competenceGateAmended: false });
  assert.throws(() => arm(b), /GATE_AMENDMENT/);
});

test("response requires matching native session and interception, matching payload, only once", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
  assert.equal(b.policy(request()), true);
  for (const extra of [
    { sessionId: "other" },
    { interceptionId: "other" },
    { postData: JSON.stringify({ ...payload, p_competencia_referencia: "2026-09-01" }) },
  ])
    assert.equal(b.policy(request(payload, { stage: "RESPONSE", ...extra })), false);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
});
test("preflight has own native ticket and does not authorize extra POST", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { method: "OPTIONS", interceptionId: "o" })), true);
  assert.equal(
    b.policy(request(payload, { method: "OPTIONS", interceptionId: "o", stage: "RESPONSE" })),
    true,
  );
  assert.equal(b.policy(request()), true);
  assert.equal(b.policy(request()), false);
  assert.equal(b.policy(request(payload, { interceptionId: "o" })), false);
});
test("public key permits public client role only; JWT is never returned", async () => {
  const { publicClientKey } = await import("./prepare-visual-fixtures.mjs");
  const jwt = (b) => "e30." + Buffer.from(JSON.stringify(b)).toString("base64url") + ".sig";
  assert.equal(publicClientKey(jwt({ role: "service_role", ref: "gklhhhyosgasnyoxlrui" })), false);
  assert.equal(publicClientKey(jwt({ role: "authenticated", ref: "gklhhhyosgasnyoxlrui" })), false);
  assert.equal(publicClientKey(jwt({ role: "anon", ref: "other" })), false);
  assert.equal(publicClientKey(jwt({ role: "anon", ref: "gklhhhyosgasnyoxlrui" })), true);
});
test("cleanup runs even if login or execution fails; failed logout prevents success", async () => {
  const { withRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  for (const phase of ["login", "execute", "logout"]) {
    const calls = [];
    const runtime = {
      login: async () => {
        calls.push("login");
        if (phase === "login") throw Error("LOGIN_FAILED");
      },
      logout: async () => {
        calls.push("logout");
        if (phase === "logout") throw Error("LOGOUT_FAILED");
      },
      clear: () => calls.push("clear"),
    };
    await assert.rejects(
      () =>
        withRuntimeLogin(runtime, { email: "synthetic", password: "redacted" }, async () => {
          calls.push("execute");
          if (phase === "execute") throw Error("EXECUTE_FAILED");
        }),
      /FAILED/,
    );
    assert.deepEqual(calls.slice(-2), ["logout", "clear"]);
  }
});
test("runtime is closed without normal auth and reconciled context", async () => {
  const { createRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const listeners = new Map();
  const page = { on: (k, v) => listeners.set(k, v), off: (k) => listeners.delete(k) };
  const runtime = createRuntimeLogin({
    page,
    fence: {},
    waitOrganization: async () => {},
    openOrganizationSelector: async () => {},
    verifyContext: async () => true,
  });
  assert.equal(runtime.token, undefined);
  assert.equal(runtime.apikey, undefined);
  await assert.rejects(() => runtime.reuseDocument({}), /DOCUMENT_SESSION/);
  runtime.clear();
  assert.equal(listeners.size, 0);
});
test("payload parser rejects escaped duplicate keys, deep JSON, nonJSON and64KiB+", async () => {
  const { parseBusinessJson } = await import("./prepare-visual-fixtures.mjs");
  for (const text of [
    '{"x":1,"\\u0078":2}',
    '{"__proto__":{}}',
    '{"x":NaN}',
    "{}x",
    "[".repeat(40) + "0" + "]".repeat(40),
    " ".repeat(65537),
  ])
    assert.throws(() => parseBusinessJson(text), /BODY/);
  assert.deepEqual(parseBusinessJson('{"a":[true,null,2],"b":"x"}'), {
    a: [true, null, 2],
    b: "x",
  });
});
test("guard rejects unknown native stage and missing correlation identifiers", () => {
  const b = broker();
  arm(b);
  for (const change of [
    { stage: undefined },
    { stage: "request" },
    { sessionId: undefined },
    { interceptionId: undefined },
  ])
    assert.equal(b.policy(request(payload, change)), false);
  assert.equal(b.policy(request()), true);
});
test("CLI permanece fechado sem comando de preparação explícito", async () => {
  const { runCli } = await import("./prepare-visual-fixtures.mjs");
  await assert.rejects(() => runCli([]), /PREPARER_CLI_USAGE/);
});

test("confirmed intention keys cannot be reused for a later mutation", () => {
  const b = broker();
  arm(b, id);
  assert.equal(b.policy(request()), true);
  b.resolve("confirmed");
  assert.throws(() => arm(b, id), /INTENT_PAYLOAD/);
});
function fakeRuntimePage({ logoutFails = false, wrongContext = false } = {}) {
  const listeners = new Map(),
    events = [];
  const jwt = (b) => "e30." + Buffer.from(JSON.stringify(b)).toString("base64url") + ".sig";
  const key = jwt({ role: "anon", ref: "gklhhhyosgasnyoxlrui" }),
    token = jwt({
      role: "authenticated",
      iss: FIXTURE.api + "/auth/v1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  const control = (name) => ({
    fill: async () => {},
    count: async () => 1,
    innerText: async () => "Situação: ativa",
    filter() {
      return this;
    },
    click: async () => {
      events.push(name);
      if (name === "Entrar") {
        listeners.get("request")?.({
          url: () => FIXTURE.api + "/auth/v1/token?grant_type=password",
          headerValue: async () => key,
        });
        listeners.get("response")?.({
          url: () => FIXTURE.api + "/auth/v1/token?grant_type=password",
          request: () => ({ method: () => "POST" }),
          status: () => 200,
          headerValue: async () => null,
          body: async () =>
            Buffer.from(
              JSON.stringify({
                access_token: token,
                refresh_token: "not retained",
                user: { email: "never exported" },
              }),
            ),
        });
      }
      if (name === "Sair" && logoutFails) throw Error("PRIVATE");
    },
  });
  const page = {
    on: (k, v) => listeners.set(k, v),
    off: (k) => listeners.delete(k),
    goto: async () => {},
    locator: () => control("field"),
    getByRole: (r, o) => (r === "dialog" ? { count: async () => 0 } : control(o?.name || r)),
    waitForURL: async () => {},
    evaluate: async () => 204,
  };
  return {
    page,
    events,
    listeners,
    options: {
      page,
      fence: { drain: async () => {}, assertSafe() {} },
      waitOrganization: async () => {},
      openOrganizationSelector: async () => {},
      verifyContext: async () => !wrongContext,
    },
  };
}
test("normal login collects only own access token in closure, confirms MASTER/context, clears/logout", async () => {
  const { createRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const f = fakeRuntimePage(),
    runtime = createRuntimeLogin(f.options);
  assert.equal(await runtime.login({ email: "synthetic", password: "test-only" }), true);
  assert.equal(runtime.access_token, undefined);
  assert.equal(runtime.user, undefined);
  assert.equal(await runtime.context(), undefined);
  assert.equal(await runtime.logout(), true);
  assert.equal(f.listeners.size, 0);
  await assert.rejects(() => runtime.reuseDocument({}), /DOCUMENT_SESSION/);
  assert.deepEqual(f.events, ["Entrar", "radio", "Continuar", "Sair"]);
});
test("context mismatch yields closed code and cleanup still logs out", async () => {
  const { createRuntimeLogin, withRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const f = fakeRuntimePage({ wrongContext: true });
  const runtime = createRuntimeLogin(f.options);
  await assert.rejects(
    () =>
      withRuntimeLogin(runtime, { email: "synthetic", password: "test-only" }, async () =>
        assert.fail(),
      ),
    /^Error: LOGIN_FAILED$/,
  );
  assert.equal(f.listeners.size, 0);
  assert.equal(f.events.at(-1), "Sair");
});
test("approved file evidence is exact and request ID must equal document key", async () => {
  const { approvedFile } = await import("./prepare-visual-fixtures.mjs");
  const file = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
    id: FIXTURE.file,
    document: FIXTURE.contractualDocument,
    status: "aprovado",
    mime: "text/plain",
    bytes: 285,
    sha256: FIXTURE.fileHash,
  };
  assert.equal(approvedFile(file), true);
  for (const change of [
    { status: "pendente" },
    { bytes: 286 },
    { sha256: "0".repeat(64) },
    { organization: id },
  ])
    assert.equal(approvedFile({ ...file, ...change }), false);
});
test("all twelve commands use exact nested schemas and closed constant values", async () => {
  const { readFileSync } = await import("node:fs");
  const text = readFileSync(
    new URL(
      "../../docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
      import.meta.url,
    ),
    "utf8",
  );
  const official = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const evidence = {
    competencies: [{ ...official, id, month: "2026-09-01" }],
    source: {
      ...official,
      id: FIXTURE.source,
      ...sut.SOURCE_FIELDS,
      version: 1,
    },
    sourceVersions: [
      {
        ...official,
        id,
        source: FIXTURE.source,
        hash: FIXTURE.fileHash,
        canApprove: true,
        state: "rascunho",
      },
    ],
    requirements: [{ ...official, id, competency: id, code: "AUD-A-TXT-001" }],
    file: {
      ...official,
      id: FIXTURE.file,
      document: FIXTURE.contractualDocument,
      status: "aprovado",
      mime: "text/plain",
      bytes: 285,
      sha256: FIXTURE.fileHash,
    },
    analysisCurrent: true,
    analysisComplete: true,
    opinionGate: true,
    opinions: [{ ...official, id, competency: id }],
    opinionApproved: true,
    compliance: 100,
    presentationApproved: true,
    allowedRegister: true,
    review: {
      ...official,
      canReview: true,
      materialPresenceVerified: true,
      extractedExcerpt: FIXTURE.excerpt,
      fileHash: FIXTURE.fileHash,
      competency: id,
      requirement: id,
      code: "AUD-A-TXT-001",
      execution: id,
      result: id,
      documentVersion: id,
      hash: FIXTURE.fileHash,
    },
  };
  const vectors = {
    registrar_versao_fonte_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_fonte: FIXTURE.source,
      p_inicio_vigencia: "2026-01-01",
      p_fim_vigencia: null,
      p_id_arquivo: null,
      p_conteudo_texto: text,
      p_metadados: {},
      p_chave_idempotencia: id,
    },
    aprovar_versao_fonte_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_versao: id,
      p_hash_esperado: FIXTURE.fileHash,
      p_fundamento: FIXTURE.foundation,
      p_chave_idempotencia: id,
    },
    salvar_fonte_normativa_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_contrato: FIXTURE.contract,
      p_id_fonte: FIXTURE.source,
      p_tipo: sut.SOURCE_FIELDS.tipo,
      p_titulo: sut.SOURCE_FIELDS.titulo,
      p_referencia: sut.SOURCE_FIELDS.referencia,
      p_descricao: sut.SOURCE_FIELDS.descricao,
      p_situacao: "ativa",
      p_versao_esperada: 1,
      p_chave_idempotencia: id,
    },
    executar_comando_lista_v1: {
      p_id_organizacao: FIXTURE.organization,
      p_id_contrato: FIXTURE.contract,
      p_id_lista: null,
      p_versao_esperada: null,
      p_acao: "criar_lista",
      p_payload: {
        nome: FIXTURE.listName,
        descricao: FIXTURE.listDescription,
        vigencia_inicio: "2026-01-01",
        vigencia_fim: null,
      },
      p_motivo: FIXTURE.reason,
      p_request_id: id,
    },
    criar_competencia: payload,
    criar_documento_competencia_v115: {
      p_id_competencia: id,
      p_tipo: "outro",
      p_titulo: "Documento TXT sintético Trilha A.",
      p_categoria: "documental",
      p_id_requisito: id,
      p_id_arquivo: FIXTURE.file,
      p_chave_idempotencia: id,
    },
    solicitar_analise_competencia: { p_id_competencia: id, p_tipo: "completa" },
    registrar_revisao_requisito_v117: {
      p_id_competencia: id,
      p_id_requisito: id,
      p_id_execucao_esperada: id,
      p_id_resultado_esperado: id,
      p_hash_esperado: FIXTURE.fileHash,
      p_resultado: "conforme",
      p_justificativa: FIXTURE.reviewJustification,
      p_fundamento: FIXTURE.reviewFoundation,
      p_evidencias: [{ id_versao_documento: id, pagina: 1, trecho: FIXTURE.excerpt }],
      p_request_id: id,
    },
    solicitar_parecer_interno: { p_id_competencia: id },
    aprovar_parecer_interno: {
      p_id_parecer: id,
      p_aprovar: true,
      p_fundamento: FIXTURE.foundation,
    },
    aprovar_apresentacao: { p_id_competencia: id, p_fundamento: FIXTURE.foundation },
    registrar_apresentacao: {
      p_id_competencia: id,
      p_idempotency_key: id,
      p_protocolo: "HML-TRILHA-A-20261108",
      p_forma_apresentacao: "Ensaio sintético em homologação.",
    },
  };
  assert.equal(Object.keys(vectors).length, 12);
  for (const [rpc, p] of Object.entries(vectors)) {
    assert.equal(validateBusinessPayload(rpc, p, evidence), true, rpc);
    assert.equal(validateBusinessPayload(rpc, { ...p, extra: true }, evidence), false, rpc);
  }
  assert.equal(
    validateBusinessPayload(
      "registrar_revisao_requisito_v117",
      { ...vectors.registrar_revisao_requisito_v117, p_resultado: "nao_aplicavel" },
      evidence,
    ),
    false,
  );
  assert.equal(
    validateBusinessPayload("aprovar_apresentacao", vectors.aprovar_apresentacao, {
      ...evidence,
      compliance: 99,
    }),
    false,
  );
  assert.equal(
    validateBusinessPayload("registrar_apresentacao", vectors.registrar_apresentacao, {
      ...evidence,
      competencies: [{ ...official, id, month: "2026-10-01" }],
    }),
    false,
  );
});

test("observador técnico nunca projeta objetos Auth ou identificadores de usuário", () => {
  assert.equal(typeof sut.projectOfficialResponse, "function");
  const value = sut.projectOfficialResponse({
    id: "synthetic-id",
    id_usuario: "private-user",
    autor: "private-name",
    lista: {
      email: "private@example.invalid",
      access_token: "private-token",
      id_contrato: "contract",
    },
  });
  assert.deepEqual(value, { id: "synthetic-id", lista: { id_contrato: "contract" } });
});

test("projeção positiva descarta campos desconhecidos e preserva regras inválidas como inválidas", () => {
  assert.deepEqual(
    sut.projectOfficialResponse({ id: "synthetic", unknown_note: "private words" }),
    { id: "synthetic" },
  );
  assert.notDeepEqual(
    sut.projectOfficialResponse({
      regra_validacao: { documento: { obrigatorio: true, unknown: true } },
    }),
    { regra_validacao: { documento: { obrigatorio: true } } },
  );
});

test("fase oficial rejeita read que conclui depois do prazo", async () => {
  let tick = 0;
  await assert.rejects(
    waitOfficialPhase({
      now: () => tick,
      timeout: 1,
      read: async () => {
        tick = 100;
        return { state: "ready" };
      },
      ready: () => true,
    }),
    /PHASE_TIMEOUT/,
  );
});

test("observador não promove campo antigo em duas projeções SDK reais", async () => {
  const { EventEmitter } = await import("node:events");
  const { readFile } = await import("node:fs/promises");
  const sdk = await readFile(
    new URL("../../src/lib/contratos/baseNormativaDados.ts", import.meta.url),
    "utf8",
  );
  const select = sdk.match(/export const COLUNAS_VERSAO\s*=\s*"([^"]+)"/)[1];
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const emit = async (query, row) => {
    const request = {
      method: () => "GET",
      postData: () => null,
      url: () => FIXTURE.api + "/rest/v1/versoes_fontes_normativas?" + new URLSearchParams(query),
    };
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(row)),
    });
    await observer.flush();
  };
  try {
    await emit(
      {
        select,
        id_fonte: "eq." + FIXTURE.source,
        order: "versao.desc,id.asc",
        offset: "0",
        limit: "25",
      },
      [{ id, id_fonte: FIXTURE.source, aprovado_em: "2026-11-08T00:00:00Z" }],
    );
    assert.ok((await observer.read("versoes_fontes_normativas", { id }))[0].aprovado_em);
    const after = observer.generation();
    await emit(
      { select: "conteudo_texto,metadados", id: "eq." + id },
      { conteudo_texto: "synthetic", metadados: {} },
    );
    assert.equal(
      (await observer.read("versoes_fontes_normativas", { id }))[0].aprovado_em,
      undefined,
    );
    assert.equal(
      await observer.observedAfter(
        "versoes_fontes_normativas",
        { id, aprovado_em: "2026-11-08T00:00:00Z" },
        after,
      ),
      false,
    );
  } finally {
    observer.close();
  }
});

test("observador não lê Auth nem corpo de endpoint não autorizado", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter();
  const observer = sut.createOfficialObserver(page);
  let bodies = 0;
  for (const path of [
    "/auth/v1/token?grant_type=password",
    "/rest/v1/users",
    "/rest/v1/rpc/admin_operation",
  ]) {
    const request = { url: () => FIXTURE.api + path, method: () => "POST", postData: () => null };
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => {
        bodies++;
        throw Error("NEVER_READ");
      },
    });
  }
  await observer.flush();
  assert.equal(bodies, 0);
  observer.close();
});

test("fase oficial limita também um read que nunca resolve", async () => {
  await assert.rejects(
    waitOfficialPhase({ read: () => new Promise(() => {}), ready: () => true, timeout: 10 }),
    /PHASE_TIMEOUT/,
  );
});

test("preparação exige main imutável e provas do mesmo executor", () => {
  assert.equal(typeof sut.validatePreparerIdentity, "function");
  assert.equal(sut.validatePreparerIdentity({}, {}, {}, {}, "a".repeat(40)), false);
});

test("identidade positiva e negativos isolados mantêm vínculo main/source/deploy/nativos", () => {
  const head = "a".repeat(40),
    source = "b".repeat(40),
    deployment = "dpl_synthetic123";
  const identity = { harnessSha: head, moduleHash: "c".repeat(64), testHash: "d".repeat(64) };
  const native = {
    schema: "contaos.native.proof.v1",
    ...identity,
    passed: 8,
    failed: 0,
    skipped: 0,
  };
  const proof = {
    schema: "contaos.private.provenance.v1",
    harnessSha: head,
    frontendSha: source,
    deploymentId: deployment,
  };
  const env = {
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_REF: "refs/heads/main",
    GITHUB_SHA: head,
    CONTAOS_HARNESS_SHA: head,
    CONTAOS_FRONTEND_SHA: source,
    CONTAOS_DEPLOYMENT_ID: deployment,
    GITHUB_RUN_ID: "123",
  };
  assert.equal(sut.validatePreparerIdentity(env, proof, native, identity, head), true);
  for (const delta of [
    { GITHUB_REF: "refs/heads/other" },
    { GITHUB_EVENT_NAME: "pull_request" },
    { GITHUB_SHA: source },
    { CONTAOS_FRONTEND_SHA: head },
    { CONTAOS_DEPLOYMENT_ID: "dpl_changed123" },
    { GITHUB_RUN_ID: "invalid" },
  ])
    assert.equal(
      sut.validatePreparerIdentity({ ...env, ...delta }, proof, native, identity, head),
      false,
    );
  assert.equal(
    sut.validatePreparerIdentity(env, proof, { ...native, passed: 7 }, identity, head),
    false,
  );
  assert.equal(
    sut.validatePreparerIdentity(env, { ...proof, harnessSha: source }, native, identity, head),
    false,
  );
});

test("recibo final projeta só vínculos de negócio e nunca ator ou conteúdo arbitrário", () => {
  const source = { sourceVersionId: id, listId: id, listVersionId: id, itemId: id };
  const actor = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const result = {
    state: "partial",
    actor,
    raw: "NEVER_EXPORT",
    competencies: [
      { month: "2026-10-01", state: "partial", id, actor },
      { month: "2026-09-01", state: "partial", id, actor },
    ],
  };
  const receipt = sut.fixtureBindingReceipt(source, result);
  assert.equal(JSON.stringify(receipt).includes(actor), false);
  assert.equal(JSON.stringify(receipt).includes("NEVER_EXPORT"), false);
  assert.equal(receipt.competencies.length, 2);
  assert.throws(
    () => sut.fixtureBindingReceipt({ ...source, itemId: "unknown" }, result),
    /BINDING_ID/,
  );
  assert.throws(
    () =>
      sut.fixtureBindingReceipt(source, {
        ...result,
        competencies: [result.competencies[0], result.competencies[0]],
      }),
    /BINDING_SCHEMA/,
  );
});

test("campos positivos pertencem ao endpoint observado, não ao catálogo global de chaves", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter();
  const observer = sut.createOfficialObserver(page);
  const { readFile } = await import("node:fs/promises");
  const sdk = await readFile(
    new URL("../../src/lib/contratos/contratoDetalheDados.ts", import.meta.url),
    "utf8",
  );
  const select = sdk.match(/export const COLUNAS_DETALHE\s*=\s*"([^"]+)"/)[1];
  const request = {
    url: () =>
      FIXTURE.api + "/rest/v1/contratos?" + new URLSearchParams({ id: "eq." + id, select }),
    method: () => "GET",
    postData: () => null,
  };
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 200,
    body: async () =>
      Buffer.from(
        JSON.stringify([
          {
            id,
            id_organizacao: FIXTURE.organization,
            id_contratante: FIXTURE.contractor,
            conteudo_texto: "NEVER_EXPORT",
          },
        ]),
      ),
  });
  await observer.flush();
  const rows = await observer.read("contratos", { id });
  assert.equal(rows[0].conteudo_texto, undefined);
  observer.close();
});

// Recovered observer cases, integrated into the actual preparer module.
{
  const { EventEmitter } = await import("node:events");
  const { readFile } = await import("node:fs/promises");
  const api = FIXTURE.api,
    org = FIXTURE.organization,
    contract = FIXTURE.contract,
    source = FIXTURE.source;
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    version = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  async function constant(file, name) {
    const s = await readFile(new URL("../../" + file, import.meta.url), "utf8");
    const m = s.match(new RegExp("(?:export )?const " + name + '\\s*=\\s*"([^"]+)"'));
    assert.ok(m, "SDK source constant missing: " + name);
    return m[1];
  }
  const compSelect = await constant(
    "src/lib/contratos/competenciasDados.ts",
    "COLUNAS_COMPETENCIA",
  );
  const versionSelect = await constant("src/lib/contratos/baseNormativaDados.ts", "COLUNAS_VERSAO");
  const opinionSelect = await constant(
    "src/lib/competencias/parecerInternoDados.ts",
    "COLUNAS_PARECERES",
  );
  const reviewSource = await readFile(
    new URL("../../src/lib/competencias/revisaoRequisitoDados.ts", import.meta.url),
    "utf8",
  );
  const joinSelect = reviewSource.match(/\.select\(\s*"(id,numero_versao,[^"]+)"/)[1];
  const compQ = () => ({
    select: compSelect,
    id_contrato: "eq." + contract,
    competencia_referencia: "eq.2026-10-01",
    order: "competencia_referencia.desc,id.desc",
    offset: "0",
    limit: "25",
  });
  const versionQ = () => ({
    select: versionSelect,
    id_fonte: "eq." + source,
    order: "versao.desc,id.asc",
    offset: "0",
    limit: "25",
  });
  const textQ = () => ({ select: "conteudo_texto,metadados", id: "eq." + version });
  const joinQ = () => ({
    select: joinSelect,
    id_organizacao: "eq." + org,
    id_contrato: "eq." + contract,
    "documentos_competencia.id_competencia": "eq." + id,
    "documentos_competencia.situacao": "eq.ativo",
    "arquivos.status_seguranca": "eq.aprovado",
    order: "criado_em.desc,id.desc",
    offset: "0",
    limit: "25",
  });
  const compRow = () => ({
    id,
    competencia_referencia: "2026-10-01",
    periodo_inicio: "2026-10-01",
    periodo_fim: "2026-10-31",
    data_limite: null,
    situacao: "rascunho",
    percentual_conformidade: 0,
    versao_pacote_atual: 0,
    atualizado_em: "2026-11-08T00:00:00Z",
  });
  const versionRow = () => ({
    id: version,
    id_fonte: source,
    versao: 1,
    inicio_vigencia: "2026-01-01",
    fim_vigencia: null,
    id_arquivo: null,
    hash: "a".repeat(64),
    aprovado_por: null,
    aprovado_em: "2026-11-08T00:00:00Z",
    criado_em: "2026-11-08T00:00:00Z",
  });
  const joinRow = () => ({
    id: version,
    numero_versao: 1,
    id_organizacao: org,
    id_contrato: contract,
    documentos_competencia: {
      id_competencia: id,
      titulo: "Documento TXT sintético Trilha A.",
      situacao: "ativo",
    },
    arquivos: { nome_original: "FONTE_SINTETICA_AUDITORIA_HML.txt", status_seguranca: "aprovado" },
  });
  function fixture() {
    const page = new EventEmitter(),
      o = sut.createOfficialObserver(page);
    return {
      page,
      o,
      emit(table, query, value, options = {}) {
        const method = options.method || "GET",
          request = {
            method: () => method,
            postData: () => (method === "POST" ? JSON.stringify(options.args || {}) : null),
            url: () =>
              options.rawUrl || api + "/rest/v1/" + table + "?" + new URLSearchParams(query),
          };
        page.emit("request", request);
        page.emit("response", {
          request: () => request,
          url: request.url,
          status: () => options.status || 200,
          body:
            options.body ||
            async function () {
              return Buffer.from(JSON.stringify(value));
            },
        });
      },
      close() {
        o.close();
      },
    };
  }
  async function noAdmission(mutator) {
    const f = fixture();
    try {
      const q = compQ(),
        raw = mutator(q);
      f.emit("competencias", {}, [compRow()], { rawUrl: api + "/rest/v1/competencias?" + raw });
      await f.o.flush();
      assert.equal(await f.o.observedAfter("competencias", { id_contrato: contract }, 0), false);
      await assert.rejects(() => f.o.read("competencias", {}), /OBSERVATION/);
    } finally {
      f.close();
    }
  }
  test("FK omitted is proved by real query without inventing row fields", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("competencias", compQ(), [compRow()]);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      const [r] = await f.o.read("competencias", {
        id_contrato: contract,
        competencia_referencia: "2026-10-01",
      });
      assert.equal(r.id, id);
      assert.equal(Object.hasOwn(r, "id_contrato"), false);
      assert.equal(Object.hasOwn(r, "id_organizacao"), false);
    } finally {
      f.close();
    }
  });
  test("closed bare and prefixed RPC aliases share evidence", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "rpc/obter_visao_geral_competencia",
        {},
        { competencia: { id } },
        {
          method: "POST",
          args: { p_id_competencia: id },
          rawUrl: api + "/rest/v1/rpc/obter_visao_geral_competencia",
        },
      );
      assert.equal(
        await f.o.observedAfter("obter_visao_geral_competencia", { p_id_competencia: id }, before),
        true,
      );
      assert.equal(
        await f.o.observedAfter(
          "rpc:obter_visao_geral_competencia",
          { p_id_competencia: id },
          before,
        ),
        true,
      );
      assert.equal(await f.o.observedAfter("obter_unknown", {}, before), false);
    } finally {
      f.close();
    }
  });
  test("empty initial October GET proves absence through its query", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("competencias", compQ(), []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("current empty GET removes old presence from the same query", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      assert.equal((await f.o.read("competencias", { id_contrato: contract })).length, 1);
      const before = f.o.generation();
      f.emit("competencias", compQ(), []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("real review join retains approved nested fields and dotted identity", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("versoes_documento", joinQ(), [joinRow()]);
      const where = { "documentos_competencia.id_competencia": id, id: version };
      assert.equal(await f.o.observedAfter("versoes_documento", where, before), true);
      const [r] = await f.o.read("versoes_documento", where);
      assert.equal(r.arquivos.status_seguranca, "aprovado");
      assert.equal(r.documentos_competencia.id_competencia, id);
    } finally {
      f.close();
    }
  });
  test("partial text projection inherits neither approval nor invented id", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      assert.ok((await f.o.read("versoes_fontes_normativas", { id: version }))[0].aprovado_em);
      const before = f.o.generation();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      const [r] = await f.o.read("versoes_fontes_normativas", { id: version });
      assert.equal(r.aprovado_em, undefined);
      assert.equal(Object.hasOwn(r, "id"), false);
      assert.equal(
        await f.o.observedAfter(
          "versoes_fontes_normativas",
          { id: version, aprovado_em: versionRow().aprovado_em },
          before,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("duplicate query key is not admitted", () =>
    noAdmission((q) =>
      new URLSearchParams([...Object.entries(q), ["id_contrato", "eq." + contract]]).toString(),
    ));
  test("extra query key is not admitted", () =>
    noAdmission((q) => new URLSearchParams({ ...q, unknown: "eq.extra" }).toString()));
  test("foreign contract query is not admitted", () =>
    noAdmission((q) => new URLSearchParams({ ...q, id_contrato: "eq." + version }).toString()));
  test("projection drift is not admitted", () =>
    noAdmission((q) =>
      new URLSearchParams({ ...q, select: q.select + ",unknown_note" }).toString(),
    ));
  test("admitted join with contradictory response closes", async () => {
    const f = fixture();
    try {
      const r = joinRow();
      r.documentos_competencia.id_competencia = version;
      f.emit("versoes_documento", joinQ(), [r]);
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("denied response to admitted contract does not reuse old success", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      f.emit("competencias", compQ(), null, { status: 403 });
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("empty broader query cannot prove unrequested month filter", async () => {
    const f = fixture();
    try {
      const q = compQ();
      delete q.competencia_referencia;
      const before = f.o.generation();
      f.emit("competencias", q, []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("empty first opinion response proves scoped initial absence", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "pareceres_internos",
        {
          select: opinionSelect,
          id_competencia: "eq." + id,
          id_organizacao: "eq." + org,
          id_contrato: "eq." + contract,
          order: "versao.desc,id.desc",
          offset: "0",
          limit: "25",
        },
        [],
      );
      assert.equal(
        await f.o.observedAfter("pareceres_internos", { id_competencia: id }, before),
        true,
      );
      assert.deepEqual(await f.o.read("pareceres_internos", { id_competencia: id }), []);
    } finally {
      f.close();
    }
  });
  test("duplicate response IDs cannot become one trusted row", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow(), compRow()]);
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("late older response cannot overwrite newer request evidence", async () => {
    const f = fixture();
    let release;
    try {
      const old = new Promise((r) => (release = r));
      f.emit("competencias", compQ(), [], {
        body: async () => {
          await old;
          return Buffer.from(JSON.stringify([compRow()]));
        },
      });
      f.emit("competencias", compQ(), []);
      release();
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("close clears pending response and listeners", async () => {
    const f = fixture();
    let release;
    const gate = new Promise((r) => (release = r));
    f.emit("competencias", compQ(), [], {
      body: async () => {
        await gate;
        return Buffer.from(JSON.stringify([compRow()]));
      },
    });
    f.close();
    release();
    await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    await assert.rejects(() => f.o.read("competencias", {}), /OBSERVATION/);
    assert.equal(f.page.listenerCount("request"), 0);
    assert.equal(f.page.listenerCount("response"), 0);
  });
  test("retained technical ledger is bounded in bytes", async () => {
    const f = fixture();
    try {
      for (let i = 1; i <= 129; i++) {
        const key = "dddddddd-dddd-4ddd-8ddd-" + String(i).padStart(12, "0");
        f.emit(
          "versoes_fontes_normativas",
          { select: "conteudo_texto,metadados", id: "eq." + key },
          { conteudo_texto: "A".repeat(65536), metadados: {} },
        );
      }
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("explicit metadata projection does not inherit text freshness", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      await f.o.flush();
      const after = f.o.generation();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      assert.deepEqual(
        await f.o.read("versoes_fontes_normativas", {
          id: version,
          aprovado_em: versionRow().aprovado_em,
        }),
        [],
      );
      const [r] = await f.o.read(
        "versoes_fontes_normativas",
        { id: version },
        { select: versionSelect },
      );
      assert.equal(r.id, version);
      assert.equal(r.aprovado_em, versionRow().aprovado_em);
      assert.equal(
        await f.o.observedAfter("versoes_fontes_normativas", { id: version }, after, {
          select: versionSelect,
        }),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("observedAfter deduplicates identity before filtering state", async () => {
    const f = fixture();
    try {
      const after = f.o.generation();
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      const q = compQ();
      delete q.competencia_referencia;
      f.emit("competencias", q, [{ ...compRow(), situacao: "cancelada" }]);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, situacao: "rascunho" },
          after,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("newer row prevents resurrection by old state filter", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      const q = compQ();
      delete q.competencia_referencia;
      f.emit("competencias", q, [{ ...compRow(), situacao: "cancelada" }]);
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
          situacao: "rascunho",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("omitted old approval cannot bypass newer partial projection", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      await f.o.flush();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("versoes_fontes_normativas", {
          id: version,
          aprovado_em: versionRow().aprovado_em,
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("order belonging to another SDK endpoint proves nothing", async () => {
    const f = fixture();
    try {
      const select = await constant("src/lib/contratos/baseNormativaDados.ts", "COLUNAS_FONTE");
      f.emit(
        "fontes_normativas",
        {
          select,
          id_organizacao: "eq." + org,
          id_contrato: "eq." + contract,
          order: "criado_em.desc,id.desc",
          offset: "0",
          limit: "25",
        },
        [],
      );
      await f.o.flush();
      assert.equal(
        await f.o.observedAfter("fontes_normativas", { id_contrato: contract }, 0),
        false,
      );
      await assert.rejects(() => f.o.read("fontes_normativas", {}), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("actual RBAC context lookup retains only projected contract", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "competencias",
        { select: "id_contrato", id: "eq." + id, id_organizacao: "eq." + org },
        { id_contrato: contract },
      );
      assert.equal(await f.o.observedAfter("competencias", { id }, before), true);
      const [r] = await f.o.read("competencias", { id });
      assert.equal(r.id_contrato, contract);
      assert.equal(Object.hasOwn(r, "id"), false);
      assert.equal(Object.hasOwn(r, "id_organizacao"), false);
    } finally {
      f.close();
    }
  });
  test("actual NovaCompetencia ID-only reconciliation uses exact query", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "competencias",
        { select: "id", id_contrato: "eq." + contract, competencia_referencia: "eq.2026-10-01" },
        [{ id }],
      );
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      const [r] = await f.o.read("competencias", {
        id_contrato: contract,
        competencia_referencia: "2026-10-01",
      });
      assert.deepEqual(r, { id });
    } finally {
      f.close();
    }
  });
  test("global null-contract AppShell permissions are ignored without poisoning", async () => {
    const f = fixture();
    try {
      const args = { p_id_organizacao: org, p_id_contrato: null };
      const before = f.o.generation();
      f.emit(
        "rpc/consultar_permissoes_efetivas",
        {},
        { schema_versao: "rbac-v1", versao: 1, master: true, permissoes: [] },
        { method: "POST", args, rawUrl: api + "/rest/v1/rpc/consultar_permissoes_efetivas" },
      );
      await f.o.flush();
      assert.equal(await f.o.rpcRead("consultar_permissoes_efetivas", args), null);
      assert.equal(
        await f.o.rpcRead("consultar_permissoes_efetivas", { ...args, p_id_contrato: contract }),
        null,
      );
      assert.equal(await f.o.observedAfter("consultar_permissoes_efetivas", args, before), false);
    } finally {
      f.close();
    }
  });
}

test("fonte fixa rejeita drift sensível antes de intenção ou recibo", () => {
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const source = { ...context, ...sut.SOURCE_FIELDS, id: FIXTURE.source, version: 1 };
  const payload = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_fonte: FIXTURE.source,
    p_tipo: source.tipo,
    p_titulo: source.titulo,
    p_referencia: source.referencia,
    p_descricao: source.descricao,
    p_situacao: "ativa",
    p_versao_esperada: 1,
    p_chave_idempotencia: id,
  };
  assert.equal(validateBusinessPayload("salvar_fonte_normativa_v107", payload, { source }), true);
  const evil = { ...source, descricao: "canary@example.invalid" };
  assert.equal(
    validateBusinessPayload(
      "salvar_fonte_normativa_v107",
      { ...payload, p_descricao: evil.descricao },
      { source: evil },
    ),
    false,
  );
});

test("solicitacao unica: preparador nao aceita marcador workflow_run sem prova", () => {
  assert.equal(typeof sut.preparerEventAllowed, "function");
  assert.equal(
    sut.preparerEventAllowed({
      GITHUB_EVENT_NAME: "workflow_run",
      GITHUB_REF: "refs/heads/main",
      CONTAOS_SINGLE_REQUEST_VERIFIED: "true",
    }),
    false,
  );
});

test("R2 ledger recupera exatamente quatro recibos R1 e rejeita adulteracao", () => {
  assert.equal(typeof sut.validateR1RecoveryDocument, "function");
  const doc = sut.R1_RECOVERY_DOCUMENT;
  assert.equal(sut.validateR1RecoveryDocument(doc).receipts.length, 4);
  assert.ok(
    Object.isFrozen(doc) && Object.isFrozen(doc.receipts) && doc.receipts.every(Object.isFrozen),
  );
  for (const mutate of [
    (d) => d.receipts.pop(),
    (d) => d.receipts.reverse(),
    (d) => (d.receipts[0].state = "uncertain"),
    (d) => (d.receipts[0].payloadSha256 = "0".repeat(64)),
    (d) => (d.receipts[0].contract = id),
    (d) => (d.receipts[0].requestId = id),
    (d) => (d.receipts[0].extra = "CANARIO"),
    (d) => (d.receipts[0].workflowRun = "1"),
    (d) => (d.receipts[0].harnessSha = "0".repeat(40)),
  ]) {
    const bad = structuredClone(doc);
    mutate(bad);
    assert.throws(() => sut.validateR1RecoveryDocument(bad));
  }
});
const r6AnalysisPayload = {
  p_id_competencia: "79bdc139-ed10-4c91-905e-b32b9a824d27",
  p_tipo: "completa",
};
function r6AnalysisArm(b) {
  return b.arm({
    rpc: "solicitar_analise_competencia",
    payload: r6AnalysisPayload,
    requestId: randomUUID(),
    verified: { context: true, capability: true, reconciled: true },
    evidence: {
      competencies: [
        {
          official: true,
          current: true,
          organization: FIXTURE.organization,
          contract: FIXTURE.contract,
          id: r6AnalysisPayload.p_id_competencia,
          month: "2026-09-01",
        },
      ],
    },
  });
}
function r6AnalysisRequest(extra = {}) {
  return {
    ...request(r6AnalysisPayload, extra),
    url: FIXTURE.api + "/rest/v1/rpc/solicitar_analise_competencia",
  };
}

function r2Reconciliation(delta = {}) {
  const b = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings;
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  return {
    competencies: b.competencies.map((c) => ({
      month: c.month,
      id: c.id,
      observed: true,
      count: 1,
    })),
    ledger: sut.R1_RECOVERY_DOCUMENT,
    ledgerR3: sut.R3_RECOVERY_DOCUMENT,
    ledgerR4: sut.R4_RECOVERY_DOCUMENT,
    ledgerR5: R6_R5_DOCUMENT,
    ledgerR6: sut.R6_RECOVERY_DOCUMENT,
    ledgerR7: sut.R7_RECOVERY_DOCUMENT,
    ledgerR8: sut.R8_RECOVERY_DOCUMENT,
    ledgerR9: sut.R9_RECOVERY_DOCUMENT,
    source: { ...context, id: FIXTURE.source, ...sut.SOURCE_FIELDS, version: 1, situacao: "ativa" },
    version: {
      ...context,
      id: b.sourceVersionId,
      source: FIXTURE.source,
      hash: JSON.parse(R6_R5_DOCUMENT.reportRaw).recovery.sourceHash,
      approved: true,
      textVerified: true,
      effective: true,
      file: null,
    },
    sourceCount: 1,
    listCount: 1,
    listObserved: true,
    listState: {
      verified: true,
      active: true,
      published: true,
      ruleVerified: true,
      sourceVersion: b.sourceVersionId,
      id: b.listId,
      versionId: b.listVersionId,
      itemId: b.itemId,
    },
    canCreateList: true,
    ...delta,
  };
}
test("R2 ledger omitido undefined ou null não emite prova de reconciliação", () => {
  const omitted = r2Reconciliation();
  delete omitted.ledger;
  const broker = sut.createIntentBroker({
    persist: () => true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  for (const input of [
    omitted,
    r2Reconciliation({ ledger: undefined }),
    r2Reconciliation({ ledger: null }),
  ]) {
    assert.throws(() => broker.authorizeRecovery(sut.reconcileR1Recovery(input)), {
      message: "RECOVERY_LEDGER",
    });
    assert.equal(broker.snapshot().count, 10);
    assert.throws(() => r6AnalysisArm(broker), { message: "RECOVERY_READ_ONLY" });
  }
  assert.throws(() => sut.validateR1RecoveryDocument(), { message: "RECOVERY_LEDGER" });
  assert.throws(() => sut.validateR1RecoveryDocument(undefined), { message: "RECOVERY_LEDGER" });
  assert.throws(() => sut.validateR1RecoveryDocument(null), { message: "RECOVERY_LEDGER" });
});

test("R2 reconcilia somente estado oficial unico aprovado antes de armar", () => {
  assert.equal(typeof sut.reconcileR1Recovery, "function");
  const proof = sut.reconcileR1Recovery(r2Reconciliation());
  assert.ok(Object.isFrozen(proof));
  const b = sut.createIntentBroker({
    persist: () => true,
    competenceGateAmended: true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.throws(() => r6AnalysisArm(b), { message: "RECOVERY_READ_ONLY" });
  assert.throws(() => b.authorizeRecovery({ ...proof }), { message: "RECOVERY_PROOF" });
  assert.equal(b.authorizeRecovery(proof), true);
  assert.equal(b.snapshot().count, 10);
  for (const rpc of ["registrar_versao_fonte_v107", "aprovar_versao_fonte_v107"])
    assert.throws(
      () =>
        b.arm({
          rpc,
          payload: {},
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
        }),
      { message: "RECOVERY_CONFIRMED_OPERATION" },
    );
  for (const delta of [
    { sourceCount: 0 },
    { sourceCount: 2 },
    { listObserved: false },
    { listCount: 2 },
    { listCount: 0, listState: null },
    { version: { ...r2Reconciliation().version, approved: false } },
    { version: { ...r2Reconciliation().version, textVerified: false } },
    { version: { ...r2Reconciliation().version, source: id } },
    { source: { ...r2Reconciliation().source, current: false } },
    { listCount: 1, listState: { active: false } },
  ])
    assert.throws(() => sut.reconcileR1Recovery(r2Reconciliation(delta)));
});
test("R9 contabiliza dez anteriores e limita novas intencoes a14", () => {
  const b = sut.createIntentBroker({
    persist: () => true,
    competenceGateAmended: true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  b.authorizeRecovery(sut.reconcileR1Recovery(r2Reconciliation()));
  for (let n = 0; n < 14; n++) {
    r6AnalysisArm(b);
    assert.equal(b.policy(r6AnalysisRequest()), true);
    assert.equal(b.policy(r6AnalysisRequest({ stage: "RESPONSE" })), true);
    b.resolve("confirmed");
  }
  assert.equal(b.snapshot().count, 24);
  assert.throws(() => r6AnalysisArm(b), { message: "INTENT_BUDGET" });
});
test("R2 diagnostico conserva subfase primaria e cleanup separado sem canarios", async () => {
  assert.equal(typeof sut.createPreparationDiagnostics, "function");
  const d = sut.createPreparationDiagnostics();
  const error = Object.assign(
    new Error("CANARIO https://secret.invalid Bearer SECRET pessoa@example.com"),
    { name: "TimeoutError" },
  );
  await assert.rejects(
    () =>
      d.step("SOURCE_VERSION_READ", async () => {
        await d.step("RUNTIME_FRESH", async () => {
          throw error;
        });
      }),
    (e) => e === error,
  );
  await d.cleanup(async () => {
    throw new Error("SECOND_CANARIO");
  });
  const r = d.snapshot();
  assert.equal(r.primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(r.subphase, "RUNTIME_FRESH");
  assert.deepEqual(r.subphasePath, ["SOURCE_VERSION_READ", "RUNTIME_FRESH"]);
  assert.equal(r.logoutVerified, false);
  assert.ok(r.cleanupFailure);
  assert.equal(/CANARIO|secret|Bearer|@|stack|https/.test(JSON.stringify(r)), false);
  await assert.rejects(() => d.step("UNKNOWN_CANARIO", async () => {}), {
    message: "DIAGNOSTIC_SUBPHASE",
  });
});

test("Run27 diagnóstico identifica timeout sem exportar mensagem ou objeto privado", () => {
  assert.equal(typeof sut.preparerFailureDiagnostic, "function");
  const input = {
    step: "SOURCE_APPROVAL_READBACK",
    errorName: "TimeoutError",
    get message() {
      assert.fail("mensagem privada não pode ser lida");
    },
    get payload() {
      assert.fail("payload privado não pode ser lido");
    },
  };
  assert.deepEqual(sut.preparerFailureDiagnostic(input), {
    step: "SOURCE_APPROVAL_READBACK",
    errorKind: "TIMEOUT",
  });
});
test("Run27 diagnóstico desconhecido permanece fechado e não serializa canário", () => {
  assert.equal(typeof sut.preparerFailureDiagnostic, "function");
  const result = sut.preparerFailureDiagnostic({
    step: "CANARY_PRIVATE_ROUTE",
    errorName: "CANARY_PRIVATE_EXCEPTION",
  });
  assert.deepEqual(result, { step: "UNCLASSIFIED", errorKind: "OTHER" });
  assert.equal(JSON.stringify(result).includes("CANARY"), false);
  assert.deepEqual(sut.preparerFailureDiagnostic(null), {
    step: "UNCLASSIFIED",
    errorKind: "OTHER",
  });
});

test("R2 duas confirmacoes reais de protocolo e proximo await conserva causa tecnica", async () => {
  const { readFileSync } = await import("node:fs");
  const { createIntentBroker, confirmUiIntent, FIXTURE, SOURCE_FIELDS } = sut;
  const diagnostics = sut.createPreparationDiagnostics();
  await assert.rejects(() =>
    sut.withPreparationDiagnostics(diagnostics, async () => {
      const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      const official = {
        official: true,
        current: true,
        organization: FIXTURE.organization,
        contract: FIXTURE.contract,
      };
      const evidence = {
        source: { ...official, id: FIXTURE.source, ...SOURCE_FIELDS, version: 1 },
        sourceVersions: [
          {
            ...official,
            id,
            source: FIXTURE.source,
            hash: FIXTURE.fileHash,
            canApprove: true,
            state: "rascunho",
          },
        ],
      };
      const text = readFileSync(
        new URL(
          "../../docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
          import.meta.url,
        ),
        "utf8",
      );
      const commands = [
        [
          "registrar_versao_fonte_v107",
          {
            p_id_organizacao: FIXTURE.organization,
            p_id_fonte: FIXTURE.source,
            p_inicio_vigencia: "2026-01-01",
            p_fim_vigencia: null,
            p_id_arquivo: null,
            p_conteudo_texto: text,
            p_metadados: {},
          },
        ],
        [
          "aprovar_versao_fonte_v107",
          {
            p_id_organizacao: FIXTURE.organization,
            p_id_versao: id,
            p_hash_esperado: FIXTURE.fileHash,
            p_fundamento: FIXTURE.foundation,
          },
        ],
      ];
      const receipts = [];
      const broker = createIntentBroker({
        persist: (r) => {
          receipts.push(r);
          return true;
        },
        competenceGateAmended: true,
      });
      const verified = { context: true, capability: true, reconciled: true };
      for (let index = 0; index < commands.length; index++) {
        const [rpc, payload] = commands[index];
        const control = {
          count: async () => 1,
          isEnabled: async () => true,
          click: async () => {
            const body = {
              ...payload,
              p_chave_idempotencia:
                index === 0
                  ? "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
                  : "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            };
            const request = {
              url: FIXTURE.api + "/rest/v1/rpc/" + rpc,
              method: "POST",
              postData: JSON.stringify(body),
              stage: "REQUEST",
              sessionId: "offline",
              interceptionId: "offline-" + index,
            };
            assert.equal(broker.policy(request), true);
            assert.equal(broker.policy({ ...request, stage: "RESPONSE" }), true);
          },
        };
        assert.equal(
          await confirmUiIntent({
            page: {},
            scope: { getByRole: () => control },
            fence: { drain: async () => {}, assertSafe: () => {} },
            broker,
            rpc,
            payload,
            evidence,
            verified,
            button: "offline",
            settleVerifiedPage: async () => {},
            reconcile: async (phase) =>
              phase === "before" ? { payload, evidence, verified } : { confirmed: true },
          }),
          true,
        );
      }
      assert.equal(receipts.filter((r) => r.state === "confirmed").length, 2);

      await diagnostics.step("SOURCE_VERSION_READ", async () => {
        throw Object.assign(new Error("CANARY_SECRET https://private.invalid"), {
          name: "TimeoutError",
        });
      });
    }),
  );
  const report = diagnostics.snapshot();
  assert.equal(report.primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(report.subphase, "SOURCE_VERSION_READ");
  assert.equal(JSON.stringify(report).includes("CANARY"), false);
});
test("R2 cada subfase fechada preserva falha primaria quando logout falha", async () => {
  for (const subphase of sut.DIAGNOSTIC_SUBPHASES) {
    const d = sut.createPreparationDiagnostics();
    await assert.rejects(() =>
      d.step(subphase, async () => {
        throw new TypeError("PRIVATE_URL token");
      }),
    );
    const before = d.snapshot();
    await d.cleanup(async () => false);
    const after = d.snapshot();
    assert.equal(after.subphase, subphase);
    assert.equal(after.primaryFailure, before.primaryFailure);
    assert.equal(after.cleanupFailure, "LOGOUT_NOT_VERIFIED");
    assert.equal(/PRIVATE_URL|token/.test(JSON.stringify(after)), false);
  }
});

test("R2 erro privado com getters nao e acessado e fence usa enum comprovado", async () => {
  const d = sut.createPreparationDiagnostics();
  const error = {
    name: "TimeoutError",
    get message() {
      assert.fail("message getter");
    },
    get stack() {
      assert.fail("stack getter");
    },
    get payload() {
      assert.fail("payload getter");
    },
  };
  await assert.rejects(
    () =>
      d.step("SOURCE_VERSION_READ", async () => {
        throw error;
      }),
    (e) => e === error,
  );
  assert.equal(d.snapshot().primaryFailure, "PREPARER_TIMEOUT");
  const fence = sut.createPreparationDiagnostics();
  await assert.rejects(() =>
    fence.step("RUNTIME_FRESH", async () => {
      throw Object.assign(new Error("PRIVATE"), { code: "FENCE_REQUEST" });
    }),
  );
  assert.equal(fence.snapshot().failureClass, "NATIVE_FENCE");
  assert.equal(fence.snapshot().primaryFailure, "FENCE_REQUEST");
});
test("R2 cada await relevante do codigo real passa pela barreira diagnostica", async () => {
  const ts = await import("typescript"),
    { readFile } = await import("node:fs/promises");
  const code = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const sf = ts.createSourceFile(
    "preparer.mjs",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const targets = new Set([
    "confirmUiIntent",
    "prepareSourceAndList",
    "prepareCompetencies",
    "runFixturePreparation",
  ]);
  let owner = null,
    count = 0;
  function visit(node) {
    const previous = owner;
    if (ts.isFunctionDeclaration(node) && node.name && targets.has(node.name.text))
      owner = node.name.text;
    if (owner && ts.isAwaitExpression(node)) {
      count++;
      assert.ok(
        node.expression.getText(sf).startsWith("tracedPreparation("),
        owner + " await sem enum",
      );
    }
    ts.forEachChild(node, visit);
    owner = previous;
  }
  visit(sf);
  assert.ok(count >= 197);
  const entry = code.indexOf("async function runFixturePreparation");
  const ledger = code.indexOf("validateR1RecoveryDocument(R1_RECOVERY_DOCUMENT);", entry);
  const login = code.indexOf('phase = "LOGIN"', entry);
  assert.ok(entry >= 0 && ledger > entry && login > ledger);
  assert.match(code, /recoveryLedger:R1_RECOVERY_DOCUMENT|recoveryLedger: R1_RECOVERY_DOCUMENT/);
});

test("R2 cleanup sincrono preserva primaria e report mesmo com logout verificado", async () => {
  const d = sut.createPreparationDiagnostics();
  await assert.rejects(() =>
    d.step("SOURCE_VERSION_READ", async () => {
      throw new TypeError("PRIMARY_CANARY");
    }),
  );
  await d.cleanup(async () => true);
  assert.equal(d.snapshot().logoutVerified, true);
  assert.equal(typeof d.finishCleanup, "function");
  await d.finishCleanup("RUNTIME_CLEAR_FAILED", () => {
    throw new Error("CLEANUP_CANARY");
  });
  assert.equal(d.snapshot().primaryFailure, "PREPARER_UNCLASSIFIED");
  assert.equal(d.snapshot().cleanupFailure, "RUNTIME_CLEAR_FAILED");
  assert.equal(d.snapshot().logoutVerified, true);
  assert.equal(/CANARY|stack|https/.test(JSON.stringify(d.snapshot())), false);
  await assert.rejects(() => d.finishCleanup("UNKNOWN_CANARY", () => {}), {
    message: "DIAGNOSTIC_SUBPHASE",
  });
});

test("R2 consumidor real verifyContext recupera GET ausente sem envenenar primaria", async () => {
  const ts = (await import("typescript")).default;
  const { readFile } = await import("node:fs/promises");
  const vm = await import("node:vm");
  const code = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const sf = ts.createSourceFile(
    "preparer.mjs",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  let initializer;
  function find(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === "verifyContext")
      initializer = node.initializer.getText(sf);
    ts.forEachChild(node, find);
  }
  find(sf);
  assert.equal(typeof initializer, "string");
  const d = sut.createPreparationDiagnostics();
  let reads = 0,
    visits = 0;
  const context = {
    page: {},
    FIXTURE,
    contextVerified: false,
    waitOrganization: async () => {},
    observer: {
      read: async () => {
        reads++;
        if (reads === 1) throw new Error("OBSERVATION_TABLE");
        return [
          {
            id: FIXTURE.contract,
            id_organizacao: FIXTURE.organization,
            id_contratante: FIXTURE.contractor,
          },
        ];
      },
    },
    goKnown: async () => {
      visits++;
    },
    tracedPreparation: (subphase, execute) => d.step(subphase, execute),
  };
  const verify = vm.runInNewContext("(" + initializer + ")", context);
  assert.equal(await d.step("LOGIN", verify), true);
  assert.equal(reads, 2);
  assert.equal(visits, 1);
  assert.equal(context.contextVerified, true);
  assert.equal(d.snapshot().primaryFailure, null);
  await assert.rejects(() =>
    d.step("SOURCE_VERSION_READ", async () => {
      throw Object.assign(new Error("LATER_CANARY"), { name: "TimeoutError" });
    }),
  );
  assert.equal(d.snapshot().primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(d.snapshot().subphase, "SOURCE_VERSION_READ");
});

test("R2 causa tecnica sobrevive ao wrapper real UI_UNCERTAIN sem alterar broker", async () => {
  const d = sut.createPreparationDiagnostics();
  const b = sut.createIntentBroker({ persist: () => true, competenceGateAmended: true });
  const verified = { context: true, capability: true, reconciled: true };
  const scope = {
    getByRole: () => ({
      count: async () => 1,
      isEnabled: async () => true,
      click: async () => {
        throw Object.assign(new Error("PRIVATE_CANARY"), { name: "TimeoutError" });
      },
    }),
  };
  await assert.rejects(
    () =>
      sut.withPreparationDiagnostics(d, () =>
        d.step("SOURCE_AND_LIST", () =>
          sut.confirmUiIntent({
            page: {},
            scope,
            fence: { drain: async () => {}, assertSafe: () => {} },
            broker: b,
            rpc: "criar_competencia",
            payload,
            evidence: {},
            verified,
            button: "offline",
            settleVerifiedPage: async () => {},
            reconcile: async () => ({ payload, evidence: {}, verified }),
          }),
        ),
      ),
    { message: "UI_UNCERTAIN" },
  );
  assert.equal(d.snapshot().primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(d.snapshot().subphase, "UI_CONFIRM_CLICK");
  assert.equal(JSON.stringify(d.snapshot()).includes("PRIVATE_CANARY"), false);
  assert.equal(b.snapshot().sent, false);
});
test("R2 candidato recuperado nao reaparece quando o mesmo erro e reutilizado", async () => {
  const d = sut.createPreparationDiagnostics(),
    error = new Error("OBSERVATION_TABLE");
  await d.step("LOGIN", async () => {
    try {
      await d.step("RUNTIME_CONTEXT", async () => {
        throw error;
      });
    } catch {}
  });
  assert.equal(d.snapshot().primaryFailure, null);
  await assert.rejects(() =>
    d.step("SOURCE_VERSION_READ", async () => {
      throw error;
    }),
  );
  assert.equal(d.snapshot().primaryFailure, "OBSERVATION_TABLE");
  assert.equal(d.snapshot().subphase, "SOURCE_VERSION_READ");
});

test("R2 ledger explicitamente ausente nunca vira documento aprovado por default", () => {
  for (const absent of [undefined, null, {}, { schema: "contaos.fixture.receipts.v1" }])
    assert.throws(() => sut.validateR1RecoveryDocument(absent), { message: "RECOVERY_LEDGER" });
  assert.throws(() => sut.reconcileR1Recovery(r2Reconciliation({ ledger: undefined })), {
    message: "RECOVERY_LEDGER",
  });
  assert.throws(() => sut.reconcileR1Recovery(r2Reconciliation({ ledger: null })), {
    message: "RECOVERY_LEDGER",
  });
});

test("popup policy: preparer awaits the shared proved launcher before context and login", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const launch = source.indexOf("launchNativeBrowser({ debugPort, proxy: proxy.url })");
  const context = source.indexOf("browser.newContext(", launch);
  assert.ok(launch > 0 && context > launch);
  assert.equal(source.includes("chromium.launch("), false);
  assert.equal(source.includes('await import("playwright")'), false);
});

test("R3 explicit empty-operation ledger rejects missing or modified proofs", () => {
  assert.equal(sut.validateR2RecoveryDocument(sut.R2_RECOVERY_DOCUMENT).derivedIntentCount, 0);
  for (const input of [undefined, null, {}, { ...sut.R2_RECOVERY_DOCUMENT, derivedIntentCount: 1 }])
    assert.throws(() => sut.validateR2RecoveryDocument(input), /RECOVERY_R2_LEDGER/);
});
test("R3 bounded logout refuses unknown or duplicated overlay before Sair", async () => {
  let clicked = 0;
  const unknown = {
    count: async () => 1,
    elementHandle: async () => ({}),
    evaluate: async () => "unknown",
    getByRole: () => ({ count: async () => 0 }),
  };
  const page = {
    getByRole: (role) => (role === "dialog" ? unknown : { click: async () => clicked++ }),
  };
  await assert.rejects(sut.dismissPreparationOverlays(page), /LOGOUT_OVERLAY/);
  assert.equal(await page.getByRole("dialog", { name: "Unknown", exact: true }).count(), 1);
  assert.equal(clicked, 0);
});

import { createRequire } from "node:module";
function r3SourceFonteMarkup() {
  const require = createRequire(import.meta.url);
  const fs = require("fs"),
    ts = require("typescript"),
    React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const p = "src/components/contratos/BaseNormativaContrato.tsx",
    src = fs.readFileSync(p, "utf8"),
    ast = ts.createSourceFile(p, src, 99, true, 4);
  const f = ast.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "DialogoFonte",
  );
  const js = ts.transpileModule(f.getText(ast), {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const wrap =
    (tag) =>
    ({ children }) =>
      React.createElement(tag, null, children);
  const names = [
    "React",
    "useState",
    "useAcao",
    "Dialog",
    "DialogContent",
    "DialogHeader",
    "DialogTitle",
    "DialogDescription",
    "DialogFooter",
    "Button",
    "RodapeErro",
    "devolverFoco",
    "campo",
    "SITUACOES_FONTE",
  ];
  const values = [
    React,
    React.useState,
    () => ({ mut: { isPending: false, error: null }, renovar: () => true }),
    ...["div", "div", "div", "h2", "p", "div", "button"].map(wrap),
    () => null,
    () => () => {},
    "",
    ["rascunho", "ativa", "inativa"],
  ];
  const C = new Function(...names, js + ";return DialogoFonte")(...values);
  const html = renderToStaticMarkup(
    React.createElement(C, {
      fonte: {
        id: "synthetic",
        id_contrato: "synthetic",
        situacao: "rascunho",
        tipo: "lista_verificacao",
        titulo: "fixture",
      },
      org: "synthetic",
      contrato: "synthetic",
      onFechar() {},
      onConcluir() {},
      onRecarregar() {},
    }),
  );
  return html;
}

function r3SourceListMarkup() {
  const require = createRequire(import.meta.url);
  const fs = require("fs"),
    ts = require("typescript"),
    React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server"),
    { JSDOM } = require("jsdom"),
    { queryAllByLabelText, queryAllByRole } = require("@testing-library/dom");
  const p = "src/components/contratos/GerenciarListas.tsx",
    src = fs.readFileSync(p, "utf8"),
    ast = ts.createSourceFile(p, src, 99, true, 4),
    f = ast.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "Formulario");
  const js = ts.transpileModule(f.getText(ast), {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const C = new Function(
    "React",
    "useState",
    "Button",
    "CAMPO",
    "ROTULOS_LISTA",
    js + ";return Formulario",
  )(
    React,
    React.useState,
    ({ children, ...props }) => React.createElement("button", props, children),
    "",
    {
      criar_lista: "Nova lista",
      salvar_item: "Adicionar item",
      publicar_versao: "Publicar versão",
      alterar_situacao: "Alterar situação",
    },
  );
  const want = {
    criar_lista: ["Nome", "Descrição", "Início da vigência", "Fim da vigência", "Motivo"],
    salvar_item: [
      "Código",
      "Descrição do item",
      "Categoria",
      "Obrigatório",
      "Aplicável",
      "Impeditivo",
      "Criticidade",
      "Identificador da versão da fonte formal",
      "Ordem",
      "Regra de validação e condição (JSON)",
      "Motivo",
    ],
    publicar_versao: ["Motivo"],
    alterar_situacao: ["Situação", "Motivo"],
  };
  return Object.entries(want).map(([acao, labels]) => ({
    labels,
    html: renderToStaticMarkup(
      React.createElement(C, {
        modelo: {
          lista: { situacao: "rascunho", versao_registro: 1 },
          versao: { id: "synthetic" },
          versoes: [],
        },
        contexto: {},
        acao,
        disabled: false,
        onEnviar() {},
        onCancelar() {},
      }),
    ),
  }));
}

function r7PanelMarkup({ total = 1, pagina = 0, disabled = false, mode = "normal" } = {}) {
  const require = createRequire(import.meta.url);
  const fs = require("fs"),
    ts = require("typescript"),
    React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const path = "src/components/contratos/GerenciarListas.tsx";
  const source = fs.readFileSync(path, "utf8");
  const ast = ts.createSourceFile(path, source, 99, true, ts.ScriptKind.TSX);
  const nodes = [];
  const visit = (node) => {
    nodes.push(node);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const label = nodes.find(
    (node) =>
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(ast) === "label" &&
      node.getText(ast).includes("<span>Lista selecionada</span>"),
  );
  const pagination = ast.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "Paginacao",
  );
  assert.ok(label);
  assert.ok(pagination);
  const section = nodes.find(
    (node) =>
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(ast) === "section" &&
      node.openingElement.attributes.properties.some(
        (a) =>
          ts.isJsxAttribute(a) &&
          a.name.getText(ast) === "aria-label" &&
          a.initializer?.getText(ast) === '"Gestão de listas"',
      ),
  );
  assert.ok(section);
  const code =
    pagination.getText(ast) +
    "\nfunction Probe({listas,id,bloquearEdicao,pagina,total,mode}) {" +
    "const setSelecionada=()=>{},setVersao=()=>{},setPv=()=>{},setPi=()=>{},setForm=()=>{};" +
    "return (" +
    section.openingElement.getText(ast) +
    label.getText(ast) +
    '{mode==="duplicateLabel" && (' +
    label.getText(ast) +
    ")}" +
    '<Paginacao nome="listas" pagina={pagina} total={total} disabled={bloquearEdicao} onMudar={()=>{}} />' +
    section.closingElement.getText(ast) +
    ");}";
  const js = ts.transpileModule(code, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const Probe = new Function("React", "Button", "CAMPO", js + ";return Probe;")(
    React,
    ({ children, ...props }) => React.createElement("button", props, children),
    "",
  );
  const target = JSON.parse(sut.R5_RECOVERY_DOCUMENT.reportRaw).bindings.listId;
  const other = "11111111-1111-4111-8111-111111111111";
  const rows = Array.from({ length: Math.min(total, 25) }, (_, i) => ({
    id: i === 0 ? target : other.slice(0, -2) + String(i).padStart(2, "0"),
    nome: i === 0 ? FIXTURE.listName : "Lista controle " + i,
  }));
  if (mode === "duplicateOption") rows.push({ ...rows[0] });
  if (mode === "missingOption") rows.splice(0, 1);
  let html = renderToStaticMarkup(
    React.createElement(Probe, {
      listas: { data: { itens: rows, total } },
      id: rows.at(-1)?.id ?? "",
      bloquearEdicao: disabled,
      pagina,
      total,
      mode,
    }),
  );
  if (mode === "foreign")
    html = html.replace('aria-label="Gestão de listas"', 'aria-label="Outro contexto"');
  if (mode === "wrongTag") html = html.replace(/<label/g, "<div").replace(/<\/label>/g, "</div>");
  if (mode === "missingTitle")
    html = html.replace("<span>Lista selecionada</span>", "<span>Outro campo</span>");
  if (mode === "duplicateSelect") html = html.replace(/(<select[\s\S]*?<\/select>)/, "$1$1");
  return { html, target, rows };
}
async function r7ProbeListConsumers(page, ast) {
  const require = createRequire(import.meta.url),
    ts = require("typescript");
  const calls = [],
    selections = [];
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText(ast);
      if (
        (text === "field" && node.arguments[1]?.getText(ast) === '"Lista selecionada"') ||
        text === "listSelectionControl"
      )
        calls.push(node);
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "selectOption" &&
      [
        'field(region, "Lista selecionada")',
        'field(panel, "Lista selecionada")',
        "listSelectionControl(region",
        "listSelectionControl(panel",
      ].some((target) => node.expression.expression.getText(ast).includes(target))
    ) {
      let statement = node.parent;
      while (statement && !ts.isExpressionStatement(statement)) statement = statement.parent;
      assert.ok(statement);
      if (!selections.includes(statement)) selections.push(statement);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.equal(calls.length, 4, "all four production list control uses are exercised");
  assert.equal(selections.length, 2, "both production selection consumers are exercised");
  let fieldInitializer;
  const findField = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === "field")
      fieldInitializer ??= node.initializer.getText(ast);
    ts.forEachChild(node, findField);
  };
  findField(ast);
  assert.ok(fieldInitializer);
  const field = new Function("return (" + fieldInitializer + ");")();
  const trace = async (_, run) => run();
  const fixture = r7PanelMarkup({ total: 2 });
  for (const call of calls) {
    await page.setContent(fixture.html);
    const scope = page.getByRole("region", { name: "Gestão de listas", exact: true });
    const control = await new (Object.getPrototypeOf(async () => {}).constructor)(
      "field",
      "listSelectionControl",
      "region",
      "panel",
      "matching",
      "matches",
      "return await (" + call.getText(ast) + ");",
    )(
      field,
      sut.listSelectionControl,
      scope,
      scope,
      [{ id: fixture.target }],
      [{ id: fixture.target }],
    );
    assert.equal(await scope.locator("option[value='" + fixture.target + "']").count(), 1);
    assert.equal(
      await scope.getByLabel("Lista selecionada", { exact: true }).count(),
      0,
      "real Playwright label text includes options",
    );
    assert.equal(
      await control.count(),
      1,
      "production lookup must find the real select even when its wrapped exact label does not",
    );
  }
  for (const statement of selections) {
    await page.setContent(fixture.html);
    const scope = page.getByRole("region", { name: "Gestão de listas", exact: true });
    assert.notEqual(await scope.locator("select").inputValue(), fixture.target);
    await new (Object.getPrototypeOf(async () => {}).constructor)(
      "field",
      "listSelectionControl",
      "region",
      "panel",
      "matching",
      "matches",
      "tracedPreparation",
      statement.getText(ast),
    )(
      field,
      sut.listSelectionControl,
      scope,
      scope,
      [{ id: fixture.target }],
      [{ id: fixture.target }],
      trace,
    );
    assert.equal(await scope.locator("select").inputValue(), fixture.target);
  }
  for (const total of [1, 25, 26, 51]) {
    for (const pagina of new Set([0, Math.ceil(total / 25) - 1])) {
      const f = r7PanelMarkup({ total, pagina });
      await page.setContent(f.html);
      const scope = page.getByRole("region", { name: "Gestão de listas", exact: true });
      assert.equal(await (await sut.listSelectionControl(scope, f.target)).count(), 1);
      const prev = scope.getByRole("button", { name: "Página anterior de listas", exact: true });
      assert.equal(await prev.count(), total > 25 ? 1 : 0);
      if (total > 25) assert.equal(await prev.isEnabled(), pagina > 0);
    }
  }
  for (const mode of [
    "duplicateLabel",
    "duplicateOption",
    "missingOption",
    "foreign",
    "wrongTag",
    "missingTitle",
    "duplicateSelect",
    "disabled",
  ]) {
    const f = r7PanelMarkup({ mode, disabled: mode === "disabled" });
    await page.setContent(f.html);
    const scope = page.locator("section");
    await assert.rejects(sut.listSelectionControl(scope, f.target), /FLOW_LIST_UI_MISSING/);
  }
}

test(
  "R3 Chromium sourceforms exact controls and actual source consumer",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1" },
  async () => {
    const require = createRequire(import.meta.url),
      fs = require("fs"),
      ts = require("typescript");
    const browser = await r3AttestedBrowser();
    try {
      const page = await browser.newPage();
      await page.route("**/*", (r) => r.abort());
      await page.setContent(
        '<div role="dialog" aria-label="Editar fonte">' + r3SourceFonteMarkup() + "</div>",
      );

      await page.setContent('<div role="dialog" aria-label="Editar fonte"></div>');
      const delayedMarkup = r3SourceFonteMarkup();
      await page.evaluate(
        (html) =>
          setTimeout(() => (document.querySelector('[role="dialog"]').innerHTML = html), 100),
        delayedMarkup,
      );
      const delayedControl = await sut.sourceStatusControl(
        page.getByRole("dialog", { name: "Editar fonte", exact: true }),
      );
      assert.equal(await delayedControl.count(), 1);
      await page.setContent(
        '<div role="dialog" aria-label="Editar fonte">' + r3SourceFonteMarkup() + "</div>",
      );
      const dialog = page.getByRole("dialog", { name: "Editar fonte", exact: true });
      assert.equal(await dialog.getByLabel("Situação", { exact: true }).count(), 0);
      assert.equal(
        await dialog.getByRole("combobox", { name: sut.SOURCE_STATUS_NAME, exact: true }).count(),
        1,
      );
      const source = fs.readFileSync(
          new URL("./prepare-visual-fixtures.mjs", import.meta.url),
          "utf8",
        ),
        ast = ts.createSourceFile("preparer.mjs", source, 99, true, 1);
      let consumer = null;
      function visit(n) {
        if (
          ts.isExpressionStatement(n) &&
          n.getText(ast).includes("sourceStatusControl(d)") &&
          n.getText(ast).includes("selectOption")
        )
          consumer = n.getText(ast);
        ts.forEachChild(n, visit);
      }
      visit(ast);
      assert.ok(consumer);
      await new (Object.getPrototypeOf(async () => {}).constructor)(
        "d",
        "sourceStatusControl",
        "tracedPreparation",
        consumer,
      )(dialog, sut.sourceStatusControl, async (_, fn) => fn());
      assert.equal(
        await dialog
          .getByRole("combobox", { name: sut.SOURCE_STATUS_NAME, exact: true })
          .inputValue(),
        "ativa",
      );
      await page.setContent(
        '<div role="dialog" aria-label="Editar fonte">' +
          r3SourceFonteMarkup() +
          r3SourceFonteMarkup() +
          "</div>",
      );
      await assert.rejects(
        sut.sourceStatusControl(page.getByRole("dialog")),
        /FLOW_SOURCE_CONTROL/,
      );
      let controls = 0;
      for (const entry of r3SourceListMarkup()) {
        await page.setContent(entry.html);

        // The corresponding statements are extracted from the production driver,
        // so reverting a selector in its actual consumer makes this proof fail.
        for (const label of entry.labels.filter((x) =>
          ["Criticidade", "Situação", "Regra de validação e condição (JSON)"].includes(x),
        )) {
          assert.equal(await page.getByLabel(label, { exact: true }).count(), 0);
          let expression = null;
          function visitControl(n) {
            if (
              ts.isExpressionStatement(n) &&
              /f\s*\.\s*getByRole/.test(n.getText(ast)) &&
              n.getText(ast).includes(JSON.stringify(label))
            )
              expression = n.getText(ast);
            ts.forEachChild(n, visitControl);
          }
          visitControl(ast);
          assert.ok(expression, label);
          await new (Object.getPrototypeOf(async () => {}).constructor)(
            "f",
            "tracedPreparation",
            "itemExpected",
            expression,
          )(
            page,
            async (_, fn) => fn(),
            () => ({ regra_validacao: {} }),
          );
        }

        for (const label of entry.labels) {
          assert.equal(
            await (
              ["Criticidade", "Situação"].includes(label)
                ? page.getByRole("combobox", { name: label, exact: true })
                : label === "Regra de validação e condição (JSON)"
                  ? page.getByRole("textbox", { name: label, exact: true })
                  : page.getByLabel(label, { exact: true })
            ).count(),
            1,
            label,
          );
          controls++;
        }
        assert.equal(
          await page.getByRole("button", { name: "Revisar operação", exact: true }).count(),
          1,
        );
      }
      assert.equal(controls, 19);
      const remaining = r3RemainingSourceMarkup();
      let additional = 0;
      for (const group of remaining.reports.flat()) {
        const fields = group.fields || group.labels;
        const file = group.path
          ? "/vercel/r3-fragments-" + group.path.split("/").pop() + ".html"
          : "/vercel/r3-" + group.name + ".html";
        const html = remaining.outputs[file];
        assert.ok(html, file);
        await page.setContent(html);
        for (const field of fields) {
          const label = field.label;
          assert.equal(await page.getByLabel(label, { exact: true }).count(), 1, label);
          additional++;
        }
      }
      assert.equal(additional, 17);
      await r7ProbeListConsumers(page, ast);
    } finally {
      await browser.close();
    }
  },
);
test(
  "R3 Chromium sourceforms nested Radix logout actual runtime and unknown overlay",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1" },
  async () => {
    const sourceBundle =
      'import React from "react";import{createRoot}from"react-dom/client";import * as D from "@radix-ui/react-dialog";\nfunction App(){const[a,A]=React.useState(true),[b,B]=React.useState(true);const e=React.createElement;return e(React.Fragment,null,e("button",{onClick:()=>location.href="/login"},"Sair"),e(D.Root,{open:a,onOpenChange:A},e(D.Portal,null,e(D.Overlay),e(D.Content,null,e(D.Title,null,"FONTE SINTETICA TRILHA A 20261108"),e(D.Description,null,"Offline"),e(D.Close,null,"Close"),e(D.Root,{open:b,onOpenChange:B},e(D.Portal,null,e(D.Overlay),e(D.Content,null,e(D.Title,null,"Editar fonte"),e(D.Description,null,"Offline"),e(D.Close,null,"Cancelar"))))))));}createRoot(document.getElementById("root")).render(React.createElement(App));';
    const browser = await r3AttestedBrowser();
    try {
      for (const title of [
        "Editar fonte",
        "Confirmar aprovação",
        "Confirmar aprovação institucional",
        "Confirmar envio ao contratante",
        "Detalhe do requisito",
      ]) {
        const browserCode = r3BrowserBundle(
          sourceBundle
            .replaceAll('"Editar fonte"', JSON.stringify(title))
            .replaceAll(
              '"Cancelar"',
              JSON.stringify(title === "Detalhe do requisito" ? "Fechar" : "Cancelar"),
            ),
        );
        const page = await browser.newPage();
        let auth = 0;
        await page.route("**/*", (route) => {
          if (route.request().url().includes("/auth/")) auth++;
          return route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' });
        });
        await page.goto(FIXTURE.origin + "/");
        await page.addScriptTag({ content: browserCode });
        await page.getByRole("dialog", { name: title, exact: true }).waitFor();
        assert.equal(await page.getByRole("button", { name: "Sair", exact: true }).count(), 0);
        const runtime = sut.createRuntimeLogin({
          page,
          fence: { drain: async () => {}, assertSafe() {} },
          waitOrganization: async () => {},
          openOrganizationSelector: async () => {},
          verifyContext: async () => true,
        });
        assert.equal(await runtime.logout(), true);
        assert.equal(new URL(page.url()).pathname, "/login");
        assert.equal(auth, 0);
        runtime.clear();
        const busySource = sourceBundle
          .replace('e(D.Close,null,"Cancelar")', 'e(D.Close,{disabled:true},"Cancelar")')
          .replaceAll('"Editar fonte"', JSON.stringify(title))
          .replaceAll(
            '"Cancelar"',
            JSON.stringify(title === "Detalhe do requisito" ? "Fechar" : "Cancelar"),
          );
        assert.ok(busySource.includes("disabled:true"));
        await page.goto(FIXTURE.origin + "/");
        await page.addScriptTag({ content: r3BrowserBundle(busySource) });
        await page.getByRole("dialog", { name: title, exact: true }).waitFor();
        const busyRuntime = sut.createRuntimeLogin({
          page,
          fence: { drain: async () => {}, assertSafe() {} },
          waitOrganization: async () => {},
          openOrganizationSelector: async () => {},
          verifyContext: async () => true,
        });
        await assert.rejects(busyRuntime.logout(), /LOGOUT_FAILED/);
        assert.equal(new URL(page.url()).pathname, "/");
        assert.equal(auth, 0);
        busyRuntime.clear();
        await page.setContent(
          '<div role="dialog" aria-label="Unknown"><button>Cancelar</button><button>Close</button></div><button>Sair</button>',
        );
        await page.evaluate(() => {
          window.cleanupClicks = 0;
          document
            .querySelectorAll("button")
            .forEach((button) => button.addEventListener("click", () => window.cleanupClicks++));
        });
        await assert.rejects(sut.dismissPreparationOverlays(page), /LOGOUT_OVERLAY/);
        assert.equal(await page.getByRole("dialog", { name: "Unknown", exact: true }).count(), 1);
        assert.equal(await page.evaluate(() => window.cleanupClicks), 0);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  },
);

function r3BrowserBundle(entry) {
  const require = createRequire(import.meta.url),
    fs = require("fs"),
    ts = require("typescript"),
    modules = [],
    ids = new Map();
  function add(file) {
    if (ids.has(file)) return ids.get(file);
    const id = modules.length;
    ids.set(file, id);
    modules.push(null);
    const source = fs.readFileSync(file, "utf8"),
      deps = {};
    for (const match of source.matchAll(/require\(["']([^"']+)["']\)/g)) {
      const resolver = createRequire(file);
      deps[match[1]] = add(resolver.resolve(match[1]));
    }
    modules[id] = { source: file.endsWith(".json") ? "module.exports=" + source : source, deps };
    return id;
  }
  const source = ts.transpileModule(entry, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    deps = {};
  for (const match of source.matchAll(/require\(["']([^"']+)["']\)/g))
    deps[match[1]] = add(require.resolve(match[1]));
  const root = modules.length;
  modules.push({ source, deps });
  return (
    '(function(){const process={env:{NODE_ENV:"production"}}, modules=' +
    JSON.stringify(modules) +
    ',cache={};function load(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};const row=modules[id];new Function("require","module","exports","process",row.source)(name=>load(row.deps[name]),m,m.exports,process);return m.exports;}load(' +
    root +
    ");})();"
  );
}

function r3RemainingSourceMarkup() {
  const requireReal = createRequire(import.meta.url),
    fs = requireReal("fs"),
    outputs = {},
    reports = [];
  const require = (name) =>
    name === "fs"
      ? { ...fs, writeFileSync: (path, html) => (outputs[path] = html) }
      : requireReal(name);
  const console = { log: (text) => reports.push(JSON.parse(text)) };
  for (const script of [
    "require=require('module').createRequire(process.cwd()+'/package.json');const fs=require('fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{JSDOM}=require('jsdom'),{queryAllByLabelText,queryAllByRole}=require('@testing-library/dom');const src=fs.readFileSync('src/components/contratos/BaseNormativaContrato.tsx','utf8'),ast=ts.createSourceFile('source.tsx',src,99,true,4);const wrap=t=>({children,...p})=>React.createElement(t,{type:p.type,disabled:p.disabled},children);const env={React,useState:React.useState,useAcao:()=>({mut:{isPending:false,error:null},renovar:()=>true}),useQueryClient:()=>({}),useQuery:()=>({data:{itens:[],total:0},isError:false,isFetching:false}),Dialog:wrap('div'),DialogContent:wrap('div'),DialogHeader:wrap('div'),DialogTitle:wrap('h2'),DialogDescription:wrap('p'),DialogFooter:wrap('div'),Button:wrap('button'),RodapeErro:()=>null,devolverFoco:()=>()=>{},campo:'',formatarDataBr:v=>v||'—'};for(const[name,labels,button,props]of [['DialogoVersao',['Início da vigência','Fim da vigência (opcional)','Texto','Texto da versão'],'Registrar versão',{fonte:{id:'synthetic',id_contrato:'synthetic'},ctx:{idUsuario:'synthetic'}}],['DialogoAprovar',['Fundamento','Confirmo que revisei hash, origem e vigência desta versão.'],'Aprovar',{v:{id:'synthetic',versao:1,hash:'a'.repeat(64),inicio_vigencia:'2026-01-01',fim_vigencia:null}}]]){const f=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);const js=ts.transpileModule(f.getText(ast),{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;const C=new Function(...Object.keys(env),js+';return '+name)(...Object.values(env));const html=renderToStaticMarkup(React.createElement(C,{...props,org:'synthetic',onFechar(){},onConcluir(){},onRecarregar(){}}));fs.writeFileSync('/vercel/r3-'+name+'.html',html);const d=new JSDOM(html).window.document;console.log(JSON.stringify({name,labels:labels.map(label=>({label,count:queryAllByLabelText(d.body,label,{exact:true}).length})),button:{name:button,count:queryAllByRole(d.body,'button',{name:button,exact:true}).length}}));}",
    "require=require('module').createRequire(process.cwd()+'/package.json');const fs=require('fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{JSDOM}=require('jsdom'),{queryAllByLabelText}=require('@testing-library/dom');const files=[['src/components/contratos/CompetenciasContrato.tsx',['Competência']],['src/components/contratos/NovaCompetencia.tsx',['Competência (mês/ano)']],['src/components/competencias/RevisaoRequisito.tsx',['Resultado da revisão','Justificativa da revisão','Fundamento da revisão','Página da evidência 1','Trecho da evidência 1']],['src/components/competencias/CompetenciaParecer.tsx',['Fundamento (opcional)']],['src/components/competencias/CompetenciaApresentar.tsx',['Fundamento da aprovação (opcional)','Protocolo (se disponível)','Forma da apresentação (se disponível)']]];const env={React,Input:p=>React.createElement('input',p),Textarea:p=>React.createElement('textarea',p),prefix:'offline',i:0,ev:{pagina:1,trecho:''},filtros:{mes:'',situacao:''},valor:'2026-10',desabilitado:false,invalido:false,CAMPO:'',resultado:'conforme',RESULTADOS_REVISAO:['conforme'],rotuloResultado:x=>x,justificativa:'',fundamento:'',decisao:{aprovar:true},protocolo:'',forma:'',formaApresentacao:'',ocupado:false,pendente:false,enviando:false,mutacaoPendente:false,confirmacao:null,intencao:{current:null}};let reports=[];for(const[p,wanted]of files){const src=fs.readFileSync(p,'utf8'),a=ts.createSourceFile(p,src,99,true,4),labels=[];function walk(n){if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(a)==='label'&&n.parent.children){const ix=n.parent.children.indexOf(n),control=n.parent.children.slice(ix+1).find(x=>ts.isJsxElement(x)||ts.isJsxSelfClosingElement(x));if(control){const text=n.children.filter(ts.isJsxText).map(x=>x.getText(a)).join(' ').replace(/\\s+/g,' ').trim();if(wanted.some(w=>w.startsWith(text)))labels.push([n,control]);}}ts.forEachChild(n,walk)}walk(a);const fragments=[];for(const[label,control]of labels){const js=ts.transpileModule('function Fixture(){return <>'+label.getText(a)+control.getText(a)+'</>}',{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;const C=new Function(...Object.keys(env),js+';return Fixture')(...Object.values(env));fragments.push(renderToStaticMarkup(React.createElement(C)));}const html=fragments.join('');const d=new JSDOM(html).window.document;fs.writeFileSync('/vercel/r3-fragments-'+p.split('/').pop()+'.html',html);reports.push({path:p,method:'SOURCE_AST_LABEL_AND_ADJACENT_CONTROL_NOT_FULL_COMPONENT',fields:wanted.map(label=>({label,count:queryAllByLabelText(d.body,label,{exact:true}).length}))});}console.log(JSON.stringify(reports));",
  ])
    new Function("require", "console", script.replace(/^require=[^;]+;/, ""))(require, console);
  return { outputs, reports };
}

test("R3 sourceforms cannot bypass the attested native factory", async () => {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await fs.readFile(
    new URL("./prepare-visual-fixtures.test.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("tests.mjs", source, 99, true, 1);
  let checked = 0;
  for (const statement of ast.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression))
      continue;
    const call = statement.expression;
    if (
      !ts.isStringLiteral(call.arguments[0]) ||
      !call.arguments[0].text.startsWith("R3 Chromium sourceforms")
    )
      continue;
    const body = call.arguments.at(-1).getText(ast);
    assert.ok(body.includes("r3AttestedBrowser()"));
    assert.equal(/chromium\.launch|import\("playwright"\)/.test(body), false);
    checked++;
  }
  assert.equal(checked, 2);
});

async function r3AttestedBrowser() {
  const { createServer } = await import("node:net");
  const debug = createServer();
  await new Promise((resolve, reject) => {
    debug.once("error", reject);
    debug.listen(0, "127.0.0.1", resolve);
  });
  const debugPort = debug.address().port;
  await new Promise((resolve, reject) =>
    debug.close((error) => (error ? reject(error) : resolve())),
  );
  const { launchNativeBrowser } = await import("./authenticated-visual-audit.mjs");
  return launchNativeBrowser({ debugPort });
}

test("R3 source control preserves native timeout identity and diagnostic subphase", async () => {
  const timeout = Object.assign(new Error("PRIVATE_CANARY_TOKEN_URL_STACK"), {
    name: "TimeoutError",
  });
  let options;
  const control = {
    count: async () => 0,
    waitFor: async (value) => {
      options = value;
      throw timeout;
    },
  };
  const diagnostics = sut.createPreparationDiagnostics();
  let observed;
  try {
    await diagnostics.step("SOURCE_FORM_FIELD", () =>
      sut.sourceStatusControl({ getByRole: () => control }),
    );
  } catch (error) {
    observed = error;
  }
  assert.equal(observed, timeout);
  assert.deepEqual(options, { state: "visible" });
  diagnostics.capture(observed);
  assert.equal(diagnostics.snapshot().primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(diagnostics.snapshot().subphase, "SOURCE_FORM_FIELD");
  assert.equal(JSON.stringify(diagnostics.snapshot()).includes("PRIVATE_CANARY"), false);
  let waitCalls = 0;
  await assert.rejects(
    sut.sourceStatusControl({
      getByRole: () => ({ count: async () => 2, waitFor: async () => waitCalls++ }),
    }),
    /FLOW_SOURCE_CONTROL/,
  );
  assert.equal(waitCalls, 0);
  let getterReads = 0;
  const hostile = {
    get name() {
      getterReads++;
      throw Error("PRIVATE_CANARY");
    },
  };
  await assert.rejects(
    sut.sourceStatusControl({
      getByRole: () => ({
        count: async () => 0,
        waitFor: async () => {
          throw hostile;
        },
      }),
    }),
    /FLOW_SOURCE_CONTROL/,
  );
  assert.equal(getterReads, 0);
});

test("R4 validates explicit original R3 ledger and debits exactly one prior activation", () => {
  assert.equal(typeof sut.validateR3RecoveryDocument, "function");
  const ledger = sut.validateR3RecoveryDocument(sut.R3_RECOVERY_DOCUMENT);
  assert.equal(ledger.receipts.length, 2);
  assert.equal(ledger.receipts[0].state, "sealed");
  assert.equal(ledger.receipts[1].state, "confirmed");
  for (const input of [undefined, null, {}, { ...sut.R3_RECOVERY_DOCUMENT, receipts: [] }])
    assert.throws(() => sut.validateR3RecoveryDocument(input), /RECOVERY_R3_LEDGER/);
  const b = broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.equal(b.snapshot().count, 10);
  for (const rpc of [
    "registrar_versao_fonte_v107",
    "aprovar_versao_fonte_v107",
    "salvar_fonte_normativa_v107",
  ])
    assert.throws(
      () => b.arm({ rpc, requestId: randomUUID(), payload: {} }),
      /RECOVERY_CONFIRMED_OPERATION/,
    );
  assert.throws(() => broker({ recoveryLedger: sut.R1_RECOVERY_DOCUMENT }), /RECOVERY_R3_LEDGER/);
});

async function r4ObserverFixture(options = {}) {
  const { EventEmitter } = await import("node:events"),
    fs = await import("node:fs/promises");
  const src = await fs.readFile(
    new URL("../../src/lib/contratos/baseNormativaDados.ts", import.meta.url),
    "utf8",
  );
  const select = src.match(/export const COLUNAS_FONTE\s*=\s*"([^"]+)"/)[1];
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page, options);
  const query = {
    select,
    id_organizacao: "eq." + FIXTURE.organization,
    id_contrato: "eq." + FIXTURE.contract,
    order: "titulo.asc,id.asc",
    offset: "0",
    limit: "25",
  };
  const row = (situacao) => ({
    id: FIXTURE.source,
    id_organizacao: FIXTURE.organization,
    id_contrato: FIXTURE.contract,
    ...sut.SOURCE_FIELDS,
    situacao,
    versao_registro: situacao === "ativa" ? 2 : 1,
  });
  const request = (q = query) => {
    const url = FIXTURE.api + "/rest/v1/fontes_normativas?" + new URLSearchParams(q),
      r = { method: () => "GET", postData: () => null, url: () => url };
    page.emit("request", r);
    return r;
  };
  const response = (r, rows, bodyWait) =>
    page.emit("response", {
      request: () => r,
      url: r.url,
      status: () => 200,
      body: async () => {
        if (bodyWait) await bodyWait;
        return Buffer.from(JSON.stringify(rows));
      },
    });
  return { page, observer, query, row, request, response };
}
test("R4 causal source read waits for admitted UI GET and completed response after capture", async () => {
  const f = await r4ObserverFixture({ wait: () => new Promise((r) => setTimeout(r, 10)) });
  f.response(f.request(), [f.row("rascunho")]);
  await f.observer.flush();
  const oldInFlight = f.request();
  // Historical reproduction only: R4 broker separately forbids saving this source again.
  f.observer.markMutation?.("salvar_fonte_normativa_v107", {
    p_id_fonte: FIXTURE.source,
    p_versao_esperada: 1,
  });
  r4EmitMutation(f.page, "salvar_fonte_normativa_v107", {
    p_id_fonte: FIXTURE.source,
    p_versao_esperada: 1,
  });
  let complete;
  const completion = new Promise((r) => (complete = r));
  let settled = false;
  const read = f.observer.read("fontes_normativas", { id: FIXTURE.source }).then((rows) => {
    settled = true;
    return rows;
  });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(settled, false);
  const q = { ...f.query };
  delete q.id_contrato;
  q.or = "(id_contrato.eq." + FIXTURE.contract + ",id_contrato.is.null)";
  f.response(f.request(q), [f.row("ativa")], completion);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(settled, false);
  complete();
  assert.equal((await read)[0].situacao, "ativa");
  f.response(oldInFlight, [f.row("rascunho")]);
  await f.observer.flush();
  assert.equal(
    (await f.observer.read("fontes_normativas", { id: FIXTURE.source }))[0].situacao,
    "ativa",
  );
  f.observer.close();
});
test("R4 causal source rejects stale prebarrier request drift and wrong identity without new network", async () => {
  for (const mode of ["cache", "inflight", "drift", "foreign"]) {
    let clock = 0;
    const f = await r4ObserverFixture({
      now: () => clock,
      wait: async () => {
        clock += 300001;
      },
    });
    f.response(f.request(), [f.row("rascunho")]);
    await f.observer.flush();
    const prior = f.request();
    f.observer.markMutation("salvar_fonte_normativa_v107", {
      p_id_fonte: FIXTURE.source,
      p_versao_esperada: 1,
    });
    r4EmitMutation(f.page, "salvar_fonte_normativa_v107", {
      p_id_fonte: FIXTURE.source,
      p_versao_esperada: 1,
    });
    if (mode === "inflight") f.response(prior, [f.row("ativa")]);
    if (mode === "drift") f.response(f.request({ ...f.query, evil: "true" }), [f.row("ativa")]);
    if (mode === "foreign")
      f.response(f.request(), [{ ...f.row("ativa"), id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }]);
    const requests = f.observer.generation();
    await assert.rejects(
      f.observer.read("fontes_normativas", { id: FIXTURE.source }),
      /PHASE_TIMEOUT/,
    );
    assert.equal(f.observer.generation(), requests);
    f.observer.close();
  }
});
test("R4 captures the request floor before validated arm and exposes every mutation target", () => {
  const events = [];
  const b = broker({
    beforeArm: (rpc, p) => {
      events.push([rpc, p]);
      return true;
    },
  });
  arm(b);
  assert.equal(events.length, 1);
  assert.equal(events[0][0], "criar_competencia");
  for (const rpc of sut.BUSINESS_RPCS) {
    const targets = sut.readbackTargets(
      rpc,
      {
        p_id_competencia: id,
        p_id_requisito: id,
        p_id_versao: id,
        p_id_lista: id,
        p_id_parecer: id,
        p_competencia_referencia: "2026-10-01",
      },
      { opinions: [{ id, competency: id }] },
    );
    assert.ok(targets.length > 0);
    assert.ok(targets.every((x) => typeof x.name === "string" && x.where));
  }
  assert.throws(() => sut.readbackTargets("unknown", {}), /OBSERVATION_MUTATION/);
});

test("R4 report derives real arm sent and terminal scalars without request identifiers", () => {
  const b = broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  b.authorizeRecovery(sut.reconcileR1Recovery(r2Reconciliation()));
  assert.deepEqual(sut.preparationIntentSummary(b), {
    count: 10,
    frozen: false,
    pending: false,
    sent: false,
    priorConfirmed: 10,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 14,
  });
  r6AnalysisArm(b);
  let state = sut.preparationIntentSummary(b);
  assert.equal(state.count, 11);
  assert.equal(state.newArmedCount, 1);
  assert.equal(state.pending, true);
  assert.equal(state.sent, false);
  assert.equal(b.policy(r6AnalysisRequest()), true);
  assert.equal(sut.preparationIntentSummary(b).sent, true);
  b.resolve("confirmed");
  assert.equal(sut.preparationIntentSummary(b).pending, false);
  assert.equal(Object.hasOwn(sut.preparationIntentSummary(b), "requestId"), false);
  assert.equal(sut.preparationIntentSummary(null), null);
});

test("R4 actual recovery model initializer uses the already observed matching list", async () => {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await fs.readFile(
      new URL("./prepare-visual-fixtures.mjs", import.meta.url),
      "utf8",
    ),
    ast = ts.createSourceFile("preparer.mjs", source, 99, true, 1);
  let statement;
  function visit(n) {
    if (
      ts.isVariableStatement(n) &&
      n.getText(ast).startsWith("const model =") &&
      n.getText(ast).includes('io.rpcRead("obter_lista_operacional_v1"')
    )
      statement = n.getText(ast);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  assert.ok(statement);
  const result = await new (Object.getPrototypeOf(async () => {}).constructor)(
    "io",
    "matching",
    "FIXTURE",
    "tracedPreparation",
    statement + ";return model;",
  )(
    {
      rpcRead: async (name, args) => {
        assert.equal(name, "obter_lista_operacional_v1");
        assert.equal(args.p_id_lista, id);
        return { verified: true };
      },
    },
    [{ id }],
    FIXTURE,
    async (_, fn) => fn(),
  );
  assert.equal(result.verified, true);
});

test("R4 closed recovery and observation codes survive cleanup without private diagnostics", async () => {
  for (const code of [
    "RECOVERY_R3_LEDGER",
    "RECOVERY_SOURCE_INACTIVE",
    "FLOW_LIST_READBACK_VERSION",
    "OBSERVATION_MUTATION",
    "OBSERVATION_ORDINAL",
  ]) {
    const d = sut.createPreparationDiagnostics();
    try {
      await d.step("RECOVERY_READ", () => {
        throw Error(code);
      });
    } catch (error) {
      d.capture(error);
    }
    await d.cleanup(() => {
      throw Error("PRIVATE_TOKEN_URL");
    });
    assert.equal(d.snapshot().primaryFailure, code);
    assert.equal(d.snapshot().cleanupFailure, "LOGOUT_FAILED");
    assert.equal(JSON.stringify(d.snapshot()).includes("PRIVATE_TOKEN"), false);
  }
});

test("R4 approved minimal projections RPC5 causal observer cases", async () => {
  const { EventEmitter } = await import("node:events");
  const createOfficialObserver = sut.createOfficialObserver;
  const F = FIXTURE,
    C = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    L = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    V = "cccccccc-3333-4333-8333-cccccccccccc";
  const cases = [
    {
      name: "LIST_READ_RPC",
      mutation: "executar_comando_lista_v1",
      payload: { p_id_lista: L },
      rpc: "obter_lista_operacional_v1",
      args: {
        p_id_organizacao: F.organization,
        p_id_contrato: F.contract,
        p_id_lista: L,
        p_id_versao: null,
        p_pagina_itens: 0,
        p_pagina_versoes: 0,
      },
      old: {
        schema_versao: "crud-lista-v1",
        id_organizacao: F.organization,
        id_contrato: F.contract,
        lista: { id: L, nome: "synthetic", versao_registro: 1 },
        versao: { id: V },
        itens: [],
      },
      fresh: {
        schema_versao: "crud-lista-v1",
        id_organizacao: F.organization,
        id_contrato: F.contract,
        lista: { id: L, nome: "synthetic", versao_registro: 2 },
        versao: { id: V },
        itens: [],
      },
      check: (v) => v.lista.versao_registro === 2,
    },
    {
      name: "OVERVIEW_AFTER_APPROVAL",
      mutation: "aprovar_apresentacao",
      payload: { p_id_competencia: C },
      rpc: "obter_visao_geral_competencia",
      args: { p_id_competencia: C },
      old: {
        competencia: {
          id: C,
          id_contrato: F.contract,
          id_organizacao: F.organization,
          situacao: "preparando",
        },
      },
      fresh: {
        competencia: {
          id: C,
          id_contrato: F.contract,
          id_organizacao: F.organization,
          situacao: "pode_apresentar_contratante",
        },
      },
      check: (v) => v.competencia.situacao === "pode_apresentar_contratante",
    },
    {
      name: "DOCUMENTS_AFTER_REUSE",
      mutation: "criar_documento_competencia_v115",
      payload: { p_id_competencia: C },
      rpc: "obter_documentos_competencia_v115",
      args: { p_id_competencia: C },
      old: {
        schema_versao: "v115-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        documentos: [],
      },
      fresh: {
        schema_versao: "v115-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        documentos: [{ id: V, tipo: "outro", situacao: "ativo" }],
      },
      check: (v) => v.documentos.length === 1,
    },
    {
      name: "ANALYSIS_AFTER_START",
      mutation: "solicitar_analise_competencia",
      payload: { p_id_competencia: C },
      rpc: "obter_analise_competencia_v116",
      args: { p_id_competencia: C },
      old: {
        schema_versao: "v116-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        estado_analise: "not_analyzed",
        execucao_atual: null,
        resultados: [],
      },
      fresh: {
        schema_versao: "v116-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        estado_analise: "queued",
        execucao_atual: { id: V, status: "pendente" },
        resultados: [],
      },
      check: (v) => v.execucao_atual?.id === V,
    },
    {
      name: "ANALYSIS_AFTER_REVIEW",
      mutation: "registrar_revisao_requisito_v117",
      payload: { p_id_competencia: C, p_id_requisito: L },
      rpc: "obter_analise_competencia_v116",
      args: { p_id_competencia: C },
      old: {
        schema_versao: "v116-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        estado_analise: "complete",
        execucao_atual: { id: L },
        resultados: [],
      },
      fresh: {
        schema_versao: "v116-v1",
        competencia: { id: C, id_contrato: F.contract, id_organizacao: F.organization },
        estado_analise: "complete",
        execucao_atual: { id: V },
        resultados: [{ id_requisito: L, id_resultado: V, resultado: "conforme" }],
      },
      check: (v) => v.execucao_atual.id === V,
    },
  ];
  function rpcEmitter(page) {
    return (rpc, args, value) => {
      const request = {
        method: () => "POST",
        postData: () => JSON.stringify(args),
        url: () => F.api + "/rest/v1/rpc/" + rpc,
      };
      page.emit("request", request);
      page.emit("response", {
        request: () => request,
        url: request.url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(value)),
      });
    };
  }
  const results = [];
  for (const c of cases) {
    if (c.mutation === "executar_comando_lista_v1") {
      c.payload.p_versao_esperada = 1;
    }
    if (c.mutation === "criar_documento_competencia_v115") {
      c.payload.p_id_arquivo = F.file;
      c.payload.p_id_requisito = L;
      c.fresh.documentos = c.fresh.documentos.map((d) => ({
        ...d,
        situacao: "ativo",
        arquivo: { id: F.file },
        requisito: { id: L },
      }));
    }
    if (c.mutation === "registrar_revisao_requisito_v117")
      c.payload.p_id_execucao_esperada = c.old.execucao_atual.id;
    if (c.mutation === "aprovar_apresentacao") {
      c.fresh.competencia.situacao = "pode_apresentar_contratante";
      c.fresh.blocking_summary = {
        ...c.fresh.blocking_summary,
        aprovacao_apresentacao_atual: true,
      };
    }
    let tick = 0,
      waits = 0;
    const page = new EventEmitter(),
      emit = rpcEmitter(page);
    let observer;
    observer = createOfficialObserver(page, {
      now: () => tick,
      wait: async () => {
        tick += 2000;
        waits++;
        emit(c.rpc, c.args, c.fresh);
        await observer.flush();
      },
    });
    emit(c.rpc, c.args, c.old);
    await observer.flush();
    observer.markMutation(c.mutation, c.payload, {});
    r4EmitMutation(
      page,
      c.mutation,
      c.payload,
      c.mutation === "solicitar_analise_competencia"
        ? c.fresh.execucao_atual.id
        : { lista: { id: c.fresh.lista?.id } },
    );
    const read = await observer.rpcRead(c.rpc, c.args);
    assert.equal(c.check(read), true, c.name);
    assert.equal(waits, 1);
    results.push({ name: c.name, delayedFreshAccepted: true, oldIgnored: true });
    observer.close();
  }
});

test("R4 approved minimal projections TABLE5 causal observer cases", async () => {
  const { readFileSync } = await import("node:fs");
  const { EventEmitter } = await import("node:events");
  const createOfficialObserver = sut.createOfficialObserver;
  const F = FIXTURE,
    C = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    P = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    K = "cccccccc-3333-4333-8333-cccccccccccc",
    I = "dddddddd-4444-4444-8444-dddddddddddd";
  const root = new URL("../../src/lib/competencias/", import.meta.url).pathname,
    s1 = readFileSync(root + "parecerInternoDados.ts", "utf8"),
    s2 = readFileSync(root + "protocoloDados.ts", "utf8");
  const col = (s, n) => s.match(new RegExp("(?:)?const " + n + '\\s*=\\s*"([^"]+)"'))[1];
  const context = { id_competencia: C, id_organizacao: F.organization, id_contrato: F.contract },
    queryContext = {
      id_competencia: "eq." + C,
      id_organizacao: "eq." + F.organization,
      id_contrato: "eq." + F.contract,
    };
  const opinionQ = {
    select: col(s1, "COLUNAS_PARECERES"),
    ...queryContext,
    order: "versao.desc,id.desc",
    offset: "0",
    limit: "25",
  };
  const cases = [
    {
      name: "OPINION_REQUEST",
      mutation: "solicitar_parecer_interno",
      payload: { p_id_competencia: C },
      table: "pareceres_internos",
      q: opinionQ,
      where: context,
      row: { id: P, ...context, versao: 1, status: "pronto", hash: "a".repeat(64) },
    },
    {
      name: "OPINION_APPROVAL",
      mutation: "aprovar_parecer_interno",
      payload: { p_id_parecer: P },
      evidence: { opinions: [{ id: P, competency: C }] },
      table: "pareceres_internos",
      q: opinionQ,
      where: { ...context, id: P },
      row: {
        id: P,
        ...context,
        versao: 1,
        status: "aprovado",
        hash: "a".repeat(64),
        aprovado_em: "2026-11-09T00:00:00Z",
      },
    },
    {
      name: "PRESENTATION_RECORD",
      mutation: "registrar_apresentacao",
      payload: { p_id_competencia: C },
      table: "apresentacoes_contratante",
      q: { select: col(s2, "COL_AP"), ...queryContext, id: "eq." + P },
      where: { ...context, id: P },
      row: {
        id: P,
        ...context,
        id_pacote: K,
        protocolo: "synthetic",
        forma_apresentacao: "synthetic",
        apresentado_em: "2026-11-09T00:00:00Z",
        tipo: "inicial",
        numero_rodada: 1,
      },
    },
    {
      name: "PACKAGE_RECORD",
      mutation: "registrar_apresentacao",
      payload: { p_id_competencia: C },
      table: "pacotes_competencia",
      q: { select: col(s2, "COL_PK"), ...queryContext, id: "eq." + K },
      where: { ...context, id: K },
      row: {
        id: K,
        ...context,
        hash_pacote: "a".repeat(64),
        numero: 1,
        tipo: "inicial",
        status: "congelado",
        congelado_em: "2026-11-09T00:00:00Z",
      },
    },
    {
      name: "PACKAGE_ITEMS",
      mutation: "registrar_apresentacao",
      payload: { p_id_competencia: C },
      table: "itens_pacote_competencia",
      q: {
        select: col(s2, "COL_ITENS"),
        ...queryContext,
        id_pacote: "eq." + K,
        order: "ordem.asc,id.asc",
        offset: "0",
        limit: "25",
      },
      where: { ...context, id_pacote: K },
      row: {
        id: I,
        ...context,
        id_pacote: K,
        entidade_tipo: "documento",
        entidade_id: P,
        versao_id: K,
        hash: "a".repeat(64),
        ordem: 1,
      },
    },
  ];
  const results = [];
  for (const c of cases) {
    const page = new EventEmitter();
    let n = 0;
    let o;
    function emit(rows) {
      const r = {
        method: () => "GET",
        postData: () => null,
        url: () => F.api + "/rest/v1/" + c.table + "?" + new URLSearchParams(c.q),
      };
      page.emit("request", r);
      page.emit("response", {
        request: () => r,
        url: r.url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(rows)),
      });
    }
    o = createOfficialObserver(page, {
      now: () => n * 2000,
      wait: async () => {
        n++;
        emit([c.row]);
        await o.flush();
      },
    });
    emit([]);
    await o.flush();
    o.markMutation(c.mutation, c.payload, c.evidence || {});
    r4EmitMutation(
      page,
      c.mutation,
      c.payload,
      ["solicitar_parecer_interno", "registrar_apresentacao"].includes(c.mutation) ? c.row.id : {},
    );
    const v = await o.read(c.table, c.where);
    assert.equal(v.length, 1, c.name);
    assert.equal(v[0].id, c.row.id, c.name);
    assert.equal(n, 1);
    results.push({ name: c.name, freshContextRead: true });
    o.close();
    if (c.mutation === "solicitar_parecer_interno" || c.table === "apresentacoes_contratante") {
      const mismatchPage = new EventEmitter();
      let clock = 0;
      const mismatch = createOfficialObserver(mismatchPage, {
        now: () => clock,
        wait: async () => {
          clock += 100001;
        },
      });
      mismatch.markMutation(c.mutation, c.payload, c.evidence || {});
      r4EmitMutation(mismatchPage, c.mutation, c.payload, "ffffffff-ffff-4fff-8fff-ffffffffffff");
      const url = FIXTURE.api + "/rest/v1/" + c.table + "?" + new URLSearchParams(c.q);
      const req = { url: () => url, method: () => "GET", postData: () => null };
      mismatchPage.emit("request", req);
      mismatchPage.emit("response", {
        request: () => req,
        url: () => url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify([c.row])),
      });
      await assert.rejects(
        mismatch.read(c.table, c.where),
        c.name + " rejects old identity despite a new completed GET",
      );
      mismatch.close();
    }
  }
});

function r4EmitMutation(page, rpc, payload, ack = {}, bodyWait) {
  const request = {
    method: () => "POST",
    postData: () => JSON.stringify(payload),
    url: () => FIXTURE.api + "/rest/v1/rpc/" + rpc,
  };
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 200,
    body: async () => {
      if (bodyWait) await bodyWait;
      return Buffer.from(JSON.stringify(ack));
    },
  });
  return request;
}

test("R4 mutation response boundary excludes arm and precommit windows but accepts fast postACK refetch", async () => {
  const f = await r4ObserverFixture({ wait: () => new Promise((r) => setTimeout(r, 5)) });
  f.response(f.request(), [f.row("rascunho")]);
  await f.observer.flush();
  const payload = { p_id_fonte: FIXTURE.source, p_versao_esperada: 1 };
  f.observer.markMutation("salvar_fonte_normativa_v107", payload);
  let settled = false;
  const read = f.observer.read("fontes_normativas", { id: FIXTURE.source }).then((rows) => {
    settled = true;
    return rows;
  });
  f.response(f.request(), [f.row("ativa")]);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(settled, false, "GET after arm before POST is not proof");
  const request = {
    method: () => "POST",
    postData: () => JSON.stringify(payload),
    url: () => FIXTURE.api + "/rest/v1/rpc/salvar_fonte_normativa_v107",
  };
  f.page.emit("request", request);
  f.response(f.request(), [f.row("ativa")]);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(settled, false, "GET while mutation is uncommitted is not proof");
  let release;
  const body = new Promise((r) => (release = r));
  f.page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 200,
    body: async () => {
      await body;
      return Buffer.from("{}");
    },
  });
  f.response(f.request(), [f.row("ativa")]);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(settled, false, "ACK body must be admitted before readback");
  release();
  assert.equal((await read)[0].versao_registro, 2);
  f.observer.close();
});
test("R4 postACK stale DTO waits for expected state and version without another mutation", async () => {
  const f = await r4ObserverFixture({ wait: () => new Promise((r) => setTimeout(r, 5)) });
  f.response(f.request(), [f.row("rascunho")]);
  await f.observer.flush();
  const payload = { p_id_fonte: FIXTURE.source, p_versao_esperada: 1 };
  f.observer.markMutation("salvar_fonte_normativa_v107", payload);
  r4EmitMutation(f.page, "salvar_fonte_normativa_v107", payload);
  f.response(f.request(), [f.row("rascunho")]);
  await f.observer.flush();
  let settled = false;
  const read = f.observer.read("fontes_normativas", { id: FIXTURE.source }).then((rows) => {
    settled = true;
    return rows;
  });
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(settled, false);
  f.response(f.request(), [{ ...f.row("ativa"), versao_registro: 1 }]);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(settled, false, "state alone does not prove version+1");
  f.response(f.request(), [f.row("ativa")]);
  assert.equal((await read)[0].situacao, "ativa");
  f.observer.close();
});

test("R6 recovery requires fresh ordinary reads and exact original month identities", async () => {
  const expected = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings.competencies;
  const run = async (mode) => {
    let current,
      generation = 0;
    const events = [];
    const io = {
      recoveryLedgerR5: R6_R5_DOCUMENT,
      recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
      recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
      recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
      recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
      ...r10BudgetApi(),
      fresh: async () => {},
      generation: () => generation,
      goKnown: async () => {
        generation++;
      },
      page: {
        getByLabel: (name, opts) => {
          assert.equal(name, "Competência");
          assert.equal(opts.exact, true);
          return {
            fill: async (value) => {
              current = value + "-01";
            },
          };
        },
      },
      observedAfter: async (name, where, floor) => {
        assert.ok(generation > floor);
        if (mode === "stale") throw Error("OBSERVATION_ORDINAL");
        events.push(name);
      },
      read: async () => {
        const c = expected.find((c) => c.month === current);
        return mode === "missing"
          ? []
          : [{ id: mode === "wrongId" ? id : c.id, competencia_referencia: current }];
      },
      link: async (path) => {
        assert.equal(path, "/competencias/" + expected.find((c) => c.month === current).id);
        generation++;
      },
      rpcRead: async () => ({
        competencia: {
          id: expected.find((c) => c.month === current).id,
          id_organizacao: mode === "foreign" ? id : FIXTURE.organization,
          id_contrato: FIXTURE.contract,
          competencia_referencia: current,
          situacao: mode === "terminal" ? "encerrada" : "em_preparacao",
        },
      }),
    };
    return sut.reconcileRecoveryCompetencies(io);
  };
  const result = await run("valid");
  assert.deepEqual(
    result,
    expected.map((c) => ({ month: c.month, id: c.id, observed: true, count: 1 })),
  );
  for (const mode of ["missing", "wrongId", "foreign", "terminal"])
    await assert.rejects(run(mode), { message: "RECOVERY_STATE" });
  await assert.rejects(run("stale"), { message: "OBSERVATION_ORDINAL" });
  const proof = r2Reconciliation();
  for (const competencies of [
    undefined,
    [],
    [...proof.competencies].reverse(),
    proof.competencies.map((c) => ({ ...c, observed: false })),
  ])
    assert.throws(() => sut.reconcileR1Recovery({ ...proof, competencies }), {
      message: "RECOVERY_STATE",
    });
});

test("R4 real mutation association rejects foreign sameRPC payload and wrong UUID before ACK", async () => {
  const requestId = "11111111-1111-4111-8111-111111111111";
  const payload = { p_id_fonte: FIXTURE.source, p_versao_esperada: 1, p_request_id: requestId };
  for (const body of [
    { ...payload, p_id_fonte: FIXTURE.historical },
    { ...payload, p_request_id: "22222222-2222-4222-8222-222222222222" },
    { ...payload, unexpected: true },
  ]) {
    const f = await r4ObserverFixture();
    f.observer.markMutation(
      "salvar_fonte_normativa_v107",
      payload,
      {},
      { requestId, bodyKey: "p_request_id", uiGeneratedKey: null },
    );
    r4EmitMutation(f.page, "salvar_fonte_normativa_v107", body);
    await assert.rejects(f.observer.flush(), { message: "OBSERVATION_FAILED" });
    f.observer.close();
  }
});

test("R4 mutation binding immutable snapshot query and ambiguity fail closed at real request event", async () => {
  const payload = { p_id_fonte: FIXTURE.source, p_versao_esperada: 1 };
  const f = await r4ObserverFixture();
  const copy = { ...payload };
  f.observer.markMutation("salvar_fonte_normativa_v107", copy);
  copy.p_id_fonte = FIXTURE.historical;
  r4EmitMutation(f.page, "salvar_fonte_normativa_v107", payload);
  f.response(f.request(), [f.row("ativa")]);
  await f.observer.flush();
  assert.equal(
    (await f.observer.read("fontes_normativas", { id: FIXTURE.source }))[0].situacao,
    "ativa",
  );
  f.observer.close();
  for (const kind of ["query", "ambiguous", "invalidJSON"]) {
    const x = await r4ObserverFixture();
    x.observer.markMutation("salvar_fonte_normativa_v107", payload);
    if (kind === "ambiguous") x.observer.markMutation("salvar_fonte_normativa_v107", payload);
    x.page.emit("request", {
      method: () => "POST",
      url: () =>
        FIXTURE.api +
        "/rest/v1/rpc/salvar_fonte_normativa_v107" +
        (kind === "query" ? "?foreign=1" : ""),
      postData: () => (kind === "invalidJSON" ? "{" : JSON.stringify(payload)),
    });
    await assert.rejects(x.observer.flush(), { message: "OBSERVATION_FAILED" });
    x.observer.close();
  }
  const src = await (
    await import("node:fs/promises")
  ).readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  assert.ok(
    src.includes("beforeArm: (rpc, payload, evidence, binding) =>") &&
      src.includes("observer?.markMutation(rpc, payload, evidence, binding)"),
  );
});

test("R4 readback returns the validated ACK identity without a later reselect", async () => {
  const { EventEmitter } = await import("node:events");
  const createOfficialObserver = sut.createOfficialObserver,
    F = FIXTURE;
  const C = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    ID = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    OTHER = "cccccccc-3333-4333-8333-cccccccccccc",
    p = new EventEmitter();
  let clock = 0;
  const o = createOfficialObserver(p, {
    now: () => clock,
    wait: async () => {
      clock += 10001;
    },
  });
  function q(rpc, b) {
    const r = {
      url: () => F.api + "/rest/v1/rpc/" + rpc,
      method: () => "POST",
      postData: () => JSON.stringify(b),
    };
    p.emit("request", r);
    return r;
  }
  function a(r, v) {
    p.emit("response", {
      request: () => r,
      url: r.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(v)),
    });
  }
  const dto = (id) => ({
    schema_versao: "v116-v1",
    competencia: { id: C, id_organizacao: F.organization, id_contrato: F.contract },
    execucao_atual: { id },
    estado_analise: "complete",
  });
  try {
    o.markMutation("solicitar_analise_competencia", { p_id_competencia: C }, {});
    a(q("solicitar_analise_competencia", { p_id_competencia: C }), ID);
    await o.flush();
    a(q("obter_analise_competencia_v116", { p_id_competencia: C }), dto(ID));
    await o.flush();
    function later(i) {
      if (i) queueMicrotask(() => later(i - 1));
      else a(q("obter_analise_competencia_v116", { p_id_competencia: C }), dto(OTHER));
    }
    const pending = o.rpcRead("obter_analise_competencia_v116", { p_id_competencia: C });
    later(7);
    const got = await pending;
    assert.equal(got.execucao_atual.id, ID);
  } finally {
    o.close();
  }
});

test("R4 postACK analysis refuses old execution identity in otherwise valid complete DTO", async () => {
  const { EventEmitter } = await import("node:events");
  const createOfficialObserver = sut.createOfficialObserver,
    F = FIXTURE;
  const C = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    OLD = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    NEW = "cccccccc-3333-4333-8333-cccccccccccc",
    p = new EventEmitter();
  let clock = 0;
  const o = createOfficialObserver(p, {
    now: () => clock,
    wait: async () => {
      clock += 5000;
    },
  });
  function q(rpc, b) {
    const r = {
      url: () => F.api + "/rest/v1/rpc/" + rpc,
      method: () => "POST",
      postData: () => JSON.stringify(b),
    };
    p.emit("request", r);
    return r;
  }
  function a(r, v) {
    p.emit("response", {
      request: () => r,
      url: r.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(v)),
    });
  }
  o.markMutation("solicitar_analise_competencia", { p_id_competencia: C }, {});
  a(q("solicitar_analise_competencia", { p_id_competencia: C }), NEW);
  await o.flush();
  a(q("obter_analise_competencia_v116", { p_id_competencia: C }), {
    schema_versao: "v116-v1",
    competencia: { id: C, id_organizacao: F.organization, id_contrato: F.contract },
    execucao_atual: { id: OLD },
    estado_analise: "complete",
  });
  await o.flush();
  await assert.rejects(o.rpcRead("obter_analise_competencia_v116", { p_id_competencia: C }));
  assert.ok(clock > 0);
  o.close();
});

test("R4 competence creation waits for ACK identity in completed ordinary month GET", async () => {
  const { EventEmitter } = await import("node:events"),
    fs = await import("node:fs/promises");
  const source = await fs.readFile(
    new URL("../../src/lib/contratos/competenciasDados.ts", import.meta.url),
    "utf8",
  );
  const select = source.split("export const COLUNAS_COMPETENCIA =")[1].split('"')[1];
  const NEW = "11111111-1111-4111-8111-111111111111",
    OLD = "22222222-2222-4222-8222-222222222222",
    month = "2026-10-01";
  for (const eventuallyFresh of [false, true]) {
    const page = new EventEmitter();
    let clock = 0,
      n = 0;
    const where = { id_contrato: FIXTURE.contract, competencia_referencia: month };
    const query = {
      select,
      id_contrato: "eq." + FIXTURE.contract,
      competencia_referencia: "eq." + month,
      order: "competencia_referencia.desc,id.desc",
      offset: "0",
      limit: "25",
    };
    const emit = (id) => {
      const url = FIXTURE.api + "/rest/v1/competencias?" + new URLSearchParams(query),
        r = { url: () => url, method: () => "GET", postData: () => null };
      page.emit("request", r);
      page.emit("response", {
        request: () => r,
        url: () => url,
        status: () => 200,
        body: async () =>
          Buffer.from(
            JSON.stringify([{ id, competencia_referencia: month, situacao: "rascunho" }]),
          ),
      });
    };
    const observer = sut.createOfficialObserver(page, {
      now: () => clock,
      wait: async () => {
        clock += 100001;
        n++;
        if (eventuallyFresh) emit(NEW);
      },
    });
    const payload = { p_id_contrato: FIXTURE.contract, p_competencia_referencia: month };
    observer.markMutation("criar_competencia", payload, {});
    r4EmitMutation(page, "criar_competencia", payload, NEW);
    emit(OLD);
    if (eventuallyFresh) assert.equal((await observer.read("competencias", where))[0].id, NEW);
    else await assert.rejects(observer.read("competencias", where));
    assert.ok(n > 0);
    observer.close();
  }
});

test("R4 causal RPC read validates options before returning an admitted snapshot", async () => {
  const { EventEmitter } = await import("node:events");
  const createOfficialObserver = sut.createOfficialObserver,
    F = FIXTURE;
  const C = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    NEW = "cccccccc-3333-4333-8333-cccccccccccc",
    p = new EventEmitter();
  let clock = 0;
  const o = createOfficialObserver(p, {
    now: () => clock,
    wait: async () => {
      clock += 5000;
    },
  });
  function q(rpc, b) {
    const r = {
      url: () => F.api + "/rest/v1/rpc/" + rpc,
      method: () => "POST",
      postData: () => JSON.stringify(b),
    };
    p.emit("request", r);
    return r;
  }
  function a(r, v) {
    p.emit("response", {
      request: () => r,
      url: r.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(v)),
    });
  }
  o.markMutation("solicitar_analise_competencia", { p_id_competencia: C }, {});
  a(q("solicitar_analise_competencia", { p_id_competencia: C }), NEW);
  await o.flush();
  a(q("obter_analise_competencia_v116", { p_id_competencia: C }), {
    schema_versao: "v116-v1",
    competencia: { id: C, id_organizacao: F.organization, id_contrato: F.contract },
    execucao_atual: { id: NEW },
    estado_analise: "complete",
  });
  await o.flush();
  for (const options of [{ unexpected: true }, { after: "1" }, { after: -1 }, null])
    await assert.rejects(
      o.rpcRead("obter_analise_competencia_v116", { p_id_competencia: C }, options),
      { message: "OBSERVATION_ORDINAL" },
    );
  o.close();
});

test("R5 explicit R4 proof is required before recovery broker and preserves three plus twenty one", () => {
  assert.equal(typeof sut.validateR4RecoveryDocument, "function");
  const clean = sut.validateR4RecoveryDocument(sut.R4_RECOVERY_DOCUMENT);
  assert.equal(clean.derivedNewBusinessIntents, 0);
  for (const value of [
    undefined,
    null,
    {},
    { ...clean, derivedNewBusinessIntents: 1 },
    { ...clean, attempt: 2 },
  ])
    assert.throws(() => sut.validateR4RecoveryDocument(value), /RECOVERY_R4_PROOF/);
  assert.throws(
    () =>
      sut.createIntentBroker({
        recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
        recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
      }),
    /RECOVERY_R4_PROOF/,
  );
  const b = sut.createIntentBroker({
    persist: () => true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: clean,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.equal(b.snapshot().confirmedBefore, 10);
  assert.equal(b.snapshot().maxNewIntentions, 14);
  for (const rpc of [
    "registrar_versao_fonte_v107",
    "aprovar_versao_fonte_v107",
    "salvar_fonte_normativa_v107",
  ])
    assert.throws(
      () => b.arm({ rpc, payload: {}, requestId: randomUUID() }),
      /RECOVERY_CONFIRMED_OPERATION/,
    );
});

test("R8 actual CLI loads recovery before runtime for workflow_run and denies another branch", async () => {
  const fs = await import("node:fs/promises");
  const source = await fs.readFile(
    new URL("./prepare-visual-fixtures.mjs", import.meta.url),
    "utf8",
  );
  const body = source
    .slice(source.indexOf("export async function runCli("), source.indexOf("\nif (process.argv[1]"))
    .replace("export async function", "async function");
  for (const event of ["workflow_run"]) {
    const events = [];
    let ready = false;
    const env = {
      GITHUB_EVENT_NAME: event,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ATTEMPT: "1",
    };
    const run = new Function(
      "process",
      "loadSingleRequestProof",
      "preparerEventAllowed",
      "runFixturePreparation",
      "err",
      body + "\nreturn runCli;",
    )(
      { env, argv: [] },
      async (options) => {
        assert.deepEqual(options, { operation: "fixtures", fresh: true });
        events.push("LOAD_PUBLIC_PROOF");
        ready = true;
      },
      () => true,
      async () => {
        assert.equal(ready, true, "runtime getter cannot precede recovery loader");
        events.push("RUNTIME_GETTER");
        return true;
      },
      (code) => {
        throw Error(code);
      },
    );
    assert.equal(await run(["--prepare-fixtures"]), true);
    assert.deepEqual(events, ["LOAD_PUBLIC_PROOF", "RUNTIME_GETTER"]);
  }
  let runtime = 0;
  const env = { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF: "refs/heads/foreign" };
  const run = new Function(
    "process",
    "loadSingleRequestProof",
    "preparerEventAllowed",
    "runFixturePreparation",
    "err",
    body + "\nreturn runCli;",
  )(
    { env, argv: [] },
    async () => {
      if (env.GITHUB_REF !== "refs/heads/main") throw Error("REQUEST_EVENT");
    },
    sut.preparerEventAllowed,
    async () => {
      runtime++;
    },
    (code) => {
      throw Error(code);
    },
  );
  await assert.rejects(() => run(["--prepare-fixtures"]));
  assert.equal(runtime, 0);
});

async function r6SourceNodes() {
  const { readFile } = await import("node:fs/promises");
  const ts = (await import("typescript")).default;
  const code = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const ast = ts.createSourceFile(
    "preparer.mjs",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const nodes = [];
  function visit(node) {
    nodes.push(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const named = (name) => nodes.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name);
  const link = nodes.find(
    (n) =>
      ts.isVariableDeclaration(n) &&
      n.name.getText(ast) === "link" &&
      n.initializer?.getText(ast).includes("PREPARER_SPA_PATH"),
  );
  return { ts, code, ast, nodes, named, link: link.initializer.getText(ast) };
}

async function r6ApprovedFileHarness(mode = "ok") {
  const { readFile } = await import("node:fs/promises");
  const source = await r6SourceNodes(),
    ts = source.ts;
  const React = await import("react"),
    { renderToStaticMarkup } = await import("react-dom/server");
  const { JSDOM } = await import("jsdom"),
    { queryAllByRole } = await import("@testing-library/dom");
  const compile = (text, env, name) => {
    const js = ts.transpileModule(text.replace(/^export\s+/, ""), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
    }).outputText;
    return new Function(...Object.keys(env), js + ";return " + name + ";")(...Object.values(env));
  };
  const menuText = await readFile(
    new URL("../../src/lib/navegacao/menuV1.ts", import.meta.url),
    "utf8",
  );
  const menuAst = ts.createSourceFile("menu.ts", menuText, 99, true, ts.ScriptKind.TS);
  const menuNode = menuAst.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "menuContextualV1",
  );
  const menu = compile(menuNode.getText(menuAst), { permitido: () => true }, "menuContextualV1");
  const sidebarText = await readFile(
    new URL("../../src/components/layout/ContaOSSidebar.tsx", import.meta.url),
    "utf8",
  );
  const sidebarAst = ts.createSourceFile("sidebar.tsx", sidebarText, 99, true, ts.ScriptKind.TSX);
  const sidebarNode = sidebarAst.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "ContaOSSidebar",
  );
  const summaryText = await readFile(
    new URL("../../src/components/contratos/VisaoGeralContrato.tsx", import.meta.url),
    "utf8",
  );
  const summaryAst = ts.createSourceFile("summary.tsx", summaryText, 99, true, ts.ScriptKind.TSX);
  let navNode;
  function visit(n) {
    if (
      ts.isJsxElement(n) &&
      n.openingElement.tagName.getText(summaryAst) === "nav" &&
      n.openingElement.attributes.getText(summaryAst).includes('aria-label="Seções do contrato"')
    )
      navNode = n;
    ts.forEachChild(n, visit);
  }
  visit(summaryAst);
  assert.ok(navNode);
  const C = "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
    V = "2ea42a44-db27-4c4e-801f-9fc5227c2458";
  let current = "/competencias/" + C,
    sequence = 10,
    documentOrdinal = null,
    dom = null;
  const clicks = [];
  const Link = ({ to, params, children, ...attrs }) =>
    React.createElement(
      "a",
      { ...attrs, href: params ? to.replace("$id", params.id) : to },
      children,
    );
  const Sidebar = compile(
    sidebarNode.getText(sidebarAst),
    {
      React,
      Link,
      useRouterState: () => current,
      menuComumPermitido: () => [],
      menuContextualV1: menu,
      LayoutDashboard: () => null,
      Building2: () => null,
      FileText: () => null,
    },
    "ContaOSSidebar",
  );
  const Nav = compile(
    "function ContractNav({c}){return (" + navNode.getText(summaryAst) + ");}",
    { React, Link },
    "ContractNav",
  );
  function render() {
    dom?.window.close();
    const context = {
      competencia: current.startsWith("/competencias/") ? C : null,
      contrato: mode === "foreign" ? C : FIXTURE.contract,
    };
    const html = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Sidebar, { contexto: context }),
        !context.competencia && React.createElement(Nav, { c: { id: FIXTURE.contract } }),
      ),
    );
    dom = new JSDOM(html);
    const group = dom.window.document.querySelector('[role="group"][aria-label="Contexto atual"]');
    const parent = group?.querySelector('a[href="/contratos/' + FIXTURE.contract + '"]');
    if (mode === "missing") parent?.remove();
    if (mode === "duplicate" && parent) group.append(parent.cloneNode(true));
    if (!context.competencia)
      assert.equal(
        dom.window.document.querySelectorAll(
          'a[href="/contratos/' + FIXTURE.contract + '/documentos"]',
        ).length,
        2,
        "real sidebar and summary both expose documents",
      );
  }
  render();
  const locator = (getNodes) => ({
    count: async () => getNodes().length,
    nth: (i) => locator(() => [getNodes()[i]].filter(Boolean)),
    getByRole: (role, options) =>
      locator(() =>
        getNodes().flatMap((root) =>
          queryAllByRole(root, role, { name: options.name, exact: options.exact }),
        ),
      ),
    locator: (selector) =>
      locator(() =>
        getNodes().flatMap((root) => [
          ...root.querySelectorAll(selector.replaceAll(":visible", "")),
        ]),
      ),
    isVisible: async () => getNodes().length === 1,
    isEnabled: async () => getNodes().length === 1 && !getNodes()[0].disabled,
    getAttribute: async (name) => getNodes()[0]?.getAttribute(name),
    click: async () => {
      const nodes = getNodes();
      assert.equal(nodes.length, 1);
      const path = nodes[0].getAttribute("href");
      assert.ok(path);
      if (path.endsWith("/documentos")) documentOrdinal = sequence;
      current = path;
      clicks.push(path);
      sequence++;
      render();
    },
  });
  const page = {
    url: () => FIXTURE.origin + current,
    locator: (selector) =>
      locator(() => [...dom.window.document.querySelectorAll(selector.replaceAll(":visible", ""))]),
    getByRole: (role, options) =>
      locator(() =>
        queryAllByRole(dom.window.document.body, role, {
          name: options.name,
          exact: options.exact,
        }),
      ),
    waitForURL: async (url) => assert.equal(FIXTURE.origin + current, url),
  };
  const trace = async (_phase, execute) => execute(),
    error = (code) => {
      throw new Error(code);
    };
  const link = new Function(
    "page",
    "FIXTURE",
    "proof",
    "fresh",
    "goKnown",
    "err",
    "tracedPreparation",
    "keys",
    "return (" + source.link + ");",
  )(
    page,
    FIXTURE,
    { documents: {} },
    async () => {},
    async () => assert.fail("SSR bypass"),
    error,
    trace,
    (v, names) =>
      v !== null &&
      typeof v === "object" &&
      Object.keys(v).length === names.length &&
      names.every((k) => Object.hasOwn(v, k)),
  );
  const parent = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const io = {
    generation: () => sequence,
    official: () => (mode === "foreign" ? { ...parent, contract: C } : parent),
  };
  const observed = async (_name, _where, ordinal) =>
    assert.equal(
      ordinal,
      documentOrdinal,
      "capture after contract hop and before document request",
    );
  const rows = async (table) =>
    table === "documentos_contrato"
      ? [
          {
            id: FIXTURE.contractualDocument,
            id_contrato: FIXTURE.contract,
            situacao: "ativo",
            versao_atual: 1,
          },
        ]
      : table === "versoes_documento"
        ? [
            {
              id: V,
              id_documento_contrato: FIXTURE.contractualDocument,
              id_arquivo: FIXTURE.file,
              numero_versao: 1,
            },
          ]
        : [
            {
              id: FIXTURE.file,
              status_seguranca: "aprovado",
              mime: "text/plain",
              tamanho: 285,
              sha256: mode === "sha" ? "b".repeat(64) : FIXTURE.fileHash,
            },
          ];
  const helpers = [
    source.named("official"),
    source.named("approvedFile"),
    source.named("approvedContractFile"),
  ]
    .map((n) => n.getText(source.ast).replace(/^export\s+/, ""))
    .join("\n");
  const inner = new Function(
    "io",
    "FIXTURE",
    "link",
    "tracedPreparation",
    "observed",
    "rows",
    "uuid",
    "stop",
    "obj",
    "contractBase",
    "context",
    helpers + ";return approvedContractFile;",
  )(
    io,
    FIXTURE,
    link,
    trace,
    observed,
    rows,
    (v) => /^[0-9a-f-]{36}$/.test(v),
    error,
    (v) => v !== null && typeof v === "object",
    "/contratos/" + FIXTURE.contract,
    async () => {
      if (mode === "foreign") error("COMPETENCE_CONTEXT");
    },
  );
  return {
    run: async () => {
      try {
        return await inner();
      } finally {
        dom?.window.close();
      }
    },
    clicks,
    current: () => current,
  };
}
test("R6 source-real approved file follows contract then documents through unique contextual anchors", async () => {
  const f = await r6ApprovedFileHarness();
  await f.run();
  assert.deepEqual(f.clicks, [
    "/contratos/" + FIXTURE.contract,
    "/contratos/" + FIXTURE.contract + "/documentos",
  ]);
  for (const mode of ["missing", "duplicate", "foreign", "sha"]) {
    const bad = await r6ApprovedFileHarness(mode);
    await assert.rejects(
      () => bad.run(),
      /PREPARER_SPA_LINK|COMPETENCE_CONTEXT|COMPETENCE_APPROVED_FILE/,
    );
  }
});
async function r6RunMonthCatch(failure, diagnostics) {
  const s = await r6SourceNodes();
  const clause = s.nodes.find(
    (n) => s.ts.isCatchClause(n) && n.getText(s.ast).includes("receipt.code ="),
  );
  assert.ok(clause);
  const body =
    "return (async()=>{const output=[];let temporalAborted=false;for(const month of ['2026-10-01','2026-09-01']){const receipt={month,state:'partial'};output.push(receipt);try{await tracedPreparation('COMPETENCY_UI',async()=>{throw failure;});}" +
    clause.getText(s.ast) +
    "}return output;})();";
  const env = {
    failure,
    activePreparationDiagnostics: diagnostics,
    tracedPreparation: (p, f) => diagnostics.step(p, f),
    io: { page: { keyboard: { press: async () => {} } }, fresh: async () => {} },
  };
  const constants = [
    "DIAGNOSTIC_SUBPHASES",
    "PREPARER_NATIVE_CODES",
    "PREPARER_FAILURE_CODES",
    "PREPARER_DIAGNOSTIC_STEPS",
  ]
    .map((name) => {
      const node = s.nodes.find(
        (n) => s.ts.isVariableDeclaration(n) && n.name.getText(s.ast) === name,
      );
      assert.ok(node);
      return "const " + name + "=" + node.initializer.getText(s.ast) + ";";
    })
    .join("\n");
  const helper =
    constants +
    ["preparationErrorData", "classifyPreparationFailure", "preparerFailureDiagnostic"]
      .map((name) =>
        s
          .named(name)
          .getText(s.ast)
          .replace(/^export\s+/, ""),
      )
      .join("\n");
  const nativeTypes = await import("node:util/types");
  return new Function(...Object.keys(env), "isProxy", helper + ";" + body)(
    ...Object.values(env),
    nativeTypes.isProxy,
  );
}
test("R6 actual month catch preserves first nested failure through partial and cleanup", async () => {
  const d = sut.createPreparationDiagnostics();
  const result = await d.step("COMPETENCIES", () =>
    r6RunMonthCatch(new Error("PREPARER_SPA_LINK"), d),
  );
  assert.equal(result.length, 2);
  assert.ok(result.every((x) => x.code === "COMPETENCE_DEPENDENCY_BLOCKED"));
  d.capture(new Error("PREPARER_INCOMPLETE"));
  await d.cleanup(async () => true);
  const state = d.snapshot();
  assert.equal(state.primaryFailure, "PREPARER_SPA_LINK");
  assert.ok(state.subphasePath.includes("COMPETENCY_UI"));
  assert.equal(state.logoutVerified, true);
  assert.equal(state.cleanupFailure, null);
});
test("R6 diagnostics and partial summary do not invoke getters or proxy traps", async () => {
  let reads = 0;
  const getter = {
    name: "Error",
    get message() {
      reads++;
      throw Error("CANARY_TOKEN_URL");
    },
    get cause() {
      reads++;
      throw Error("CANARY");
    },
    get stack() {
      reads++;
      throw Error("CANARY");
    },
  };
  const proxy = new Proxy(
    {},
    {
      get() {
        reads++;
        throw Error("CANARY");
      },
      getOwnPropertyDescriptor() {
        reads++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        reads++;
        throw Error("CANARY");
      },
    },
  );
  for (const failure of [getter, proxy]) {
    const d = sut.createPreparationDiagnostics();
    await d.step("COMPETENCIES", () => r6RunMonthCatch(failure, d));
    d.capture(new Error("PREPARER_INCOMPLETE"));
    await d.cleanup(async () => true);
    assert.equal(d.snapshot().primaryFailure, "PREPARER_UNCLASSIFIED");
    assert.equal(/CANARY|TOKEN|https|stack|payload/.test(JSON.stringify(d.snapshot())), false);
  }
  assert.equal(reads, 0);
});

function r6RecoveryState() {
  const d = JSON.parse(R6_R5_DOCUMENT.reportRaw),
    b = d.bindings;
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  return r2Reconciliation({
    ledgerR5: R6_R5_DOCUMENT,
    source: { ...context, id: FIXTURE.source, ...sut.SOURCE_FIELDS, version: 1, situacao: "ativa" },
    version: {
      ...context,
      id: b.sourceVersionId,
      source: FIXTURE.source,
      hash: d.recovery.sourceHash,
      approved: true,
      textVerified: true,
      effective: true,
      file: null,
    },
    competencies: b.competencies.map((c) => ({
      month: c.month,
      id: c.id,
      observed: true,
      count: 1,
    })),
    listCount: 1,
    listState: {
      verified: true,
      active: true,
      published: true,
      ruleVerified: true,
      sourceVersion: b.sourceVersionId,
      id: b.listId,
      versionId: b.listVersionId,
      itemId: b.itemId,
    },
  });
}
test("R9 recovery broker preserves R5 originals and debits two R8 confirmations before new arm", () => {
  const b = broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.equal(b.snapshot().count, 10);
  assert.equal(b.snapshot().confirmedBefore, 10);
  assert.equal(b.snapshot().maxNewIntentions, 14);
  assert.equal(
    JSON.parse(R6_R5_DOCUMENT.reportRaw).intentLedger.maxNewIntentions,
    21,
    "historical R5 is never rewritten",
  );
});
test("R6 original R5 hashes identity exact pairs and bindings reject mutation without invoking getters", () => {
  assert.equal(typeof sut.validateR5RecoveryDocument, "function");
  assert.equal(sut.validateR5RecoveryDocument(R6_R5_DOCUMENT).workflowRun, "42578223154");
  const clone = () => JSON.parse(JSON.stringify(R6_R5_DOCUMENT));
  for (const mutate of [
    (d) => {
      d.workflowRun = "42578223155";
    },
    (d) => {
      d.extra = true;
    },
    (d) => {
      d.reportRaw = d.reportRaw.replace('"completed": false', '"completed": true');
    },
    (d) => {
      d.receiptsRaw = d.receiptsRaw.replace('"state": "confirmed"', '"state": "uncertain"');
    },
    (d) => {
      const v = JSON.parse(d.receiptsRaw);
      v.receipts.push(v.receipts[0]);
      d.receiptsRaw = JSON.stringify(v, null, 2) + "\n";
    },
    (d) => {
      d.reportRaw = d.reportRaw.replace(
        "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
        "79bdc139-ed10-4c91-905e-b32b9a824d27",
      );
    },
  ]) {
    const d = clone();
    mutate(d);
    assert.throws(() => sut.validateR5RecoveryDocument(d), /RECOVERY_R5_LEDGER/);
  }
  let reads = 0;
  const getter = clone();
  Object.defineProperty(getter, "reportRaw", {
    enumerable: true,
    get() {
      reads++;
      throw Error("CANARY");
    },
  });
  const proxy = new Proxy(clone(), {
    ownKeys() {
      reads++;
      throw Error("CANARY");
    },
    get() {
      reads++;
      throw Error("CANARY");
    },
  });
  assert.throws(() => sut.validateR5RecoveryDocument(getter), /RECOVERY_R5_LEDGER/);
  assert.throws(() => sut.validateR5RecoveryDocument(proxy), /RECOVERY_R5_LEDGER/);
  const prototypeProxy = new Proxy(clone(), {
    getPrototypeOf() {
      reads++;
      throw Error("CANARY");
    },
  });
  const revoked = Proxy.revocable(clone(), {});
  revoked.revoke();
  assert.throws(() => sut.validateR5RecoveryDocument(prototypeProxy), /RECOVERY_R5_LEDGER/);
  assert.throws(() => sut.validateR5RecoveryDocument(revoked.proxy), /RECOVERY_R5_LEDGER/);
  assert.equal(reads, 0);
});
test("R6 semantic replay rejects complete new UUID intents but permits another valid action of the same RPC", () => {
  const bindings = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings;
  const official = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const list = {
    ...official,
    id: bindings.listId,
    name: FIXTURE.listName,
    version: 1,
    versionId: bindings.listVersionId,
    sourceVersion: bindings.sourceVersionId,
    published: true,
    sourceReady: true,
    ruleVerified: true,
  };
  const evidence = {
    list,
    sourceVersions: [
      {
        ...official,
        id: bindings.sourceVersionId,
        source: FIXTURE.source,
        state: "aprovada",
        active: true,
        effective: true,
      },
    ],
  };
  const base = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_lista: bindings.listId,
    p_versao_esperada: 1,
    p_motivo: FIXTURE.reason,
  };
  const item = {
    id_versao: bindings.listVersionId,
    id_item: null,
    codigo: "AUD-A-TXT-001",
    descricao: "Presença do documento TXT sintético de auditoria.",
    categoria: "documental",
    obrigatorio: true,
    aplicavel: true,
    impeditivo: true,
    criticidade: "alta",
    ordem: 1,
    id_fonte_versao: bindings.sourceVersionId,
    regra_validacao: {
      documento: { obrigatorio: true, tipos: ["outro"] },
      condicao: { tipo: "sempre" },
    },
  };
  const attempts = [
    [
      "executar_comando_lista_v1",
      {
        ...base,
        p_acao: "criar_lista",
        p_id_lista: null,
        p_versao_esperada: null,
        p_payload: {
          nome: FIXTURE.listName,
          descricao: FIXTURE.listDescription,
          vigencia_inicio: "2026-01-01",
          vigencia_fim: null,
        },
      },
    ],
    ["executar_comando_lista_v1", { ...base, p_acao: "salvar_item", p_payload: item }],
    [
      "executar_comando_lista_v1",
      { ...base, p_acao: "publicar_versao", p_payload: { id_versao: bindings.listVersionId } },
    ],
    ...bindings.competencies.map((c) => [
      "criar_competencia",
      { p_id_contrato: FIXTURE.contract, p_competencia_referencia: c.month },
    ]),
  ];
  const make = () =>
    broker({
      recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
      recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
      recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
      recoveryLedgerR5: R6_R5_DOCUMENT,
      recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
      recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
      recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
      recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
    });
  for (const [rpc, p] of attempts) {
    const requestId = randomUUID(),
      payload = rpc === "executar_comando_lista_v1" ? { ...p, p_request_id: requestId } : p;
    assert.equal(
      sut.validateBusinessPayload(rpc, payload, evidence),
      true,
      "replay input is independently valid",
    );
    const b = make();
    b.authorizeRecovery(sut.reconcileR1Recovery(r6RecoveryState()));
    assert.throws(
      () =>
        b.arm({
          rpc,
          payload,
          requestId,
          verified: { context: true, capability: true, reconciled: true },
          evidence,
        }),
      /RECOVERY_CONFIRMED_OPERATION/,
    );
  }
  const b = make();
  b.authorizeRecovery(sut.reconcileR1Recovery(r6RecoveryState()));
  const requestId = randomUUID(),
    payload = {
      ...base,
      p_request_id: requestId,
      p_acao: "alterar_situacao",
      p_payload: { situacao: "ativa" },
    };
  assert.equal(sut.validateBusinessPayload("executar_comando_lista_v1", payload, evidence), true);
  b.arm({
    rpc: "executar_comando_lista_v1",
    payload,
    requestId,
    verified: { context: true, capability: true, reconciled: true },
    evidence,
  });
  assert.equal(b.snapshot().count, 11);
});

test("R6 unknown COMPETENCE prefix remains generic rather than becoming a receipt code", async () => {
  const d = sut.createPreparationDiagnostics();
  const result = await d.step("COMPETENCIES", () =>
    r6RunMonthCatch(new Error("COMPETENCE_PII_SEMANTICAMENTE_DESCONHECIDO"), d),
  );
  assert.ok(result.every((x) => x.code === "COMPETENCE_DEPENDENCY_BLOCKED"));
  assert.equal(d.snapshot().primaryFailure, "PREPARER_UNCLASSIFIED");
  assert.equal(
    JSON.stringify({ result, diagnostics: d.snapshot() }).includes("SEMANTICAMENTE"),
    false,
  );
});

test("R6 real QueryClient and SDK remount emit ordinary immutable-chain reads without forced refetch", async () => {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const { createRequire } = await import("node:module"),
    require = createRequire(import.meta.url);
  const { QueryClient, QueryObserver } = await import("@tanstack/react-query");
  const pgRequire = createRequire(require.resolve("@supabase/supabase-js"));
  const { PostgrestClient } = pgRequire("@supabase/postgrest-js");
  const { EventEmitter } = await import("node:events"),
    page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const version = "2ea42a44-db27-4c4e-801f-9fc5227c2458";
  const docs = [
    {
      id: FIXTURE.contractualDocument,
      id_contrato: FIXTURE.contract,
      tipo: "outro",
      titulo: "Fonte sintética",
      categoria: "documental",
      situacao: "ativo",
      versao_atual: 1,
      versao_registro: 1,
    },
  ];
  const versions = [
    {
      id: version,
      id_documento_contrato: FIXTURE.contractualDocument,
      numero_versao: 1,
      id_arquivo: FIXTURE.file,
      hash: FIXTURE.fileHash,
      criado_em: "2026-01-01T00:00:00Z",
    },
  ];
  const files = [
    {
      id: FIXTURE.file,
      nome_original: "FONTE_SINTETICA_AUDITORIA_HML.txt",
      mime: "text/plain",
      tamanho: 285,
      sha256: FIXTURE.fileHash,
      status_seguranca: "aprovado",
      origem: "sintetica",
      criado_em: "2026-01-01T00:00:00Z",
    },
  ];
  const requests = [];
  const transport = async (raw, init = {}) => {
    const url = new URL(String(raw));
    assert.equal(url.origin, FIXTURE.api);
    assert.equal(init.method || "GET", "GET");
    assert.ok(!url.pathname.includes("/auth/"));
    const table = url.pathname.split("/").at(-1);
    const data = {
      documentos_contrato: docs,
      versoes_documento: versions,
      arquivos: files,
      processamentos_documento: [],
      sugestoes_extracao_documento: [],
    }[table];
    assert.ok(data, "only ordinary SDK tables");
    const request = { url: () => url.href, method: () => "GET", postData: () => null };
    requests.push({ table, url: url.href });
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: () => url.href,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(data)),
    });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "content-range": "0-" + Math.max(0, data.length - 1) + "/" + data.length,
      },
    });
  };
  const supabase = new PostgrestClient(FIXTURE.api + "/rest/v1", { fetch: transport });
  const sdkText = await fs.readFile(
    new URL("../../src/lib/contratos/documentosDados.ts", import.meta.url),
    "utf8",
  );
  const sdkAst = ts.createSourceFile("documentosDados.ts", sdkText, 99, true, ts.ScriptKind.TS);
  const readonlyNames = new Set([
    "executar",
    "listarDocumentos",
    "obterResumos",
    "emAndamento",
    "classificarErroDoc",
  ]);
  const readonlySource = sdkAst.statements
    .filter(
      (n) =>
        ts.isVariableStatement(n) ||
        (ts.isClassDeclaration(n) && n.name?.text === "ErroDoc") ||
        (ts.isFunctionDeclaration(n) && readonlyNames.has(n.name?.text)),
    )
    .map((n) => n.getText(sdkAst))
    .join("\n");
  assert.equal(readonlySource.includes("import.meta"), false);
  const sdkJs = ts.transpileModule(readonlySource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "supabase", sdkJs)(module, module.exports, supabase);
  const sdk = module.exports;
  const comp = await fs.readFile(
    new URL("../../src/components/contratos/DocumentosContrato.tsx", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("DocumentosContrato.tsx", comp, 99, true, ts.ScriptKind.TSX),
    queryOptions = {};
  const visit = (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      ["lista", "resumos"].includes(n.name.getText(ast)) &&
      ts.isCallExpression(n.initializer) &&
      n.initializer.expression.getText(ast) === "useQuery"
    )
      queryOptions[n.name.getText(ast)] = n.initializer.arguments[0].getText(ast);
    ts.forEachChild(n, visit);
  };
  visit(ast);
  assert.deepEqual(Object.keys(queryOptions).sort(), ["lista", "resumos"]);
  const router = await fs.readFile(new URL("../../src/router.tsx", import.meta.url), "utf8");
  const routerAst = ts.createSourceFile("router.tsx", router, 99, true, ts.ScriptKind.TSX);
  let clientInitializer;
  function findClient(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText(routerAst) === "queryClient")
      clientInitializer = n.initializer.getText(routerAst);
    ts.forEachChild(n, findClient);
  }
  findClient(routerAst);
  assert.equal(clientInitializer, "new QueryClient()");
  const client = new Function("QueryClient", "return " + clientInitializer)(QueryClient);
  const env = {
    chave: ["synthetic-user", FIXTURE.organization, FIXTURE.contract],
    contrato: FIXTURE.contract,
    filtros: { busca: "", tipo: "", categoria: "", situacao: "" },
    pagina: 0,
    listarDocumentos: sdk.listarDocumentos,
    obterResumos: sdk.obterResumos,
    emAndamento: sdk.emAndamento,
    atrasoPolling: sdk.atrasoPolling,
    ciclos: { current: 0 },
    docs: [],
    ids: [],
  };
  const options = (name) =>
    new Function(...Object.keys(env), "return (" + queryOptions[name] + ");")(
      ...Object.values(env),
    );
  const active = [];
  async function mount(name) {
    const q = new QueryObserver(client, options(name));
    active.push(q);
    return new Promise((resolve, reject) => {
      q.subscribe((value) => {
        if (value.isError) reject(value.error);
        else if (value.isSuccess && !value.isFetching) resolve(value.data);
      });
      const value = q.getCurrentResult();
      if (value.isError) reject(value.error);
      else if (value.isSuccess && !value.isFetching) resolve(value.data);
    });
  }
  async function visitDocuments() {
    const list = await mount("lista");
    env.docs = list.itens;
    env.ids = list.itens.map((d) => d.id + ":" + d.versao_atual);
    const summaries = await mount("resumos");
    assert.equal(summaries[FIXTURE.contractualDocument].arquivo.sha256, FIXTURE.fileHash);
    while (active.length) active.pop().destroy();
    await observer.flush();
  }
  try {
    await visitDocuments();
    const after = observer.generation(),
      before = requests.length;
    await visitDocuments();
    assert.ok(
      requests.length > before,
      "current source options remount produce new ordinary requests",
    );
    for (const [table, where] of [
      ["documentos_contrato", { id: FIXTURE.contractualDocument, id_contrato: FIXTURE.contract }],
      ["versoes_documento", { id_documento_contrato: FIXTURE.contractualDocument }],
      ["arquivos", { id: FIXTURE.file }],
    ])
      assert.equal(await observer.observedAfter(table, where, after), true, table);
  } finally {
    while (active.length) active.pop().destroy();
    client.clear();
    observer.close();
  }
});

test("R6 current readback identities must match intact R5 bindings before recovery authorization", () => {
  for (const mutate of [
    (x) => (x.competencies[0].id = id),
    (x) => (x.competencies[1].id = id),
    (x) => (x.competencies[0].month = "2026-11-01"),
    ...["id", "versionId", "itemId", "sourceVersion"].map((k) => (x) => (x.listState[k] = id)),
  ]) {
    const x = r6RecoveryState();
    mutate(x);
    assert.throws(() => sut.reconcileR1Recovery(x));
  }
});

test("R6 locked and authorized replay boundaries reject nested accessors and proxies without reads", () => {
  let reads = 0;
  const fail = () => {
    reads++;
    throw Error("CANARY");
  };
  const nested = {};
  Object.defineProperty(nested, "id_versao", { get: fail, enumerable: true });
  const rootGetter = {};
  Object.defineProperty(rootGetter, "p_acao", { get: fail, enumerable: true });
  const proxy = new Proxy({}, { get: fail, getPrototypeOf: fail, ownKeys: fail });
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  const b = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings;
  const payloads = [
    rootGetter,
    proxy,
    revoked.proxy,
    { p_acao: "salvar_item", p_id_lista: b.listId, p_payload: nested },
    { p_acao: "salvar_item", p_id_lista: b.listId, p_payload: proxy },
    { p_acao: "salvar_item", p_id_lista: b.listId, p_payload: revoked.proxy },
  ];
  for (const authorized of [false, true]) {
    for (const payload of payloads) {
      let beforeArm = 0;
      const instance = broker({
        recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
        recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
        recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
        recoveryLedgerR5: R6_R5_DOCUMENT,
        recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
        recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
        recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
        recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
        beforeArm: () => {
          beforeArm++;
          return true;
        },
      });
      if (authorized) instance.authorizeRecovery(sut.reconcileR1Recovery(r6RecoveryState()));
      assert.throws(
        () =>
          instance.arm({
            rpc: "executar_comando_lista_v1",
            payload,
            requestId: randomUUID(),
            verified: { context: true, capability: true, reconciled: true },
          }),
        { message: authorized ? "INTENT_PAYLOAD" : "RECOVERY_READ_ONLY" },
      );
      assert.equal(instance.snapshot().count, 10);
      assert.equal(beforeArm, 0);
    }
  }
  assert.equal(reads, 0);
});
test("R6 diagnostics reject a proxy prototype without invoking descriptor traps", async () => {
  let traps = 0;
  const prototype = new Proxy(
    {},
    {
      getOwnPropertyDescriptor() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  const failure = Object.create(prototype);
  const d = sut.createPreparationDiagnostics();
  await d.step("COMPETENCIES", () => r6RunMonthCatch(failure, d));
  assert.equal(d.snapshot().primaryFailure, "PREPARER_UNCLASSIFIED");
  assert.equal(traps, 0);
});

test("R7 original R6 zero-intent document is exact and rejects getters proxies and mutations", () => {
  const original = {
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
  };
  assert.equal(typeof sut.validateR6RecoveryDocument, "function");
  assert.deepEqual(sut.validateR6RecoveryDocument(original), original);
  const canonical = JSON.stringify(original, null, 2) + "\n";
  assert.equal(Buffer.byteLength(canonical), 2599);
  assert.equal(
    createHash("sha256").update(canonical).digest("hex"),
    "98136adfe0c84c274ca31534b847b640a35f2577d2ad6197e451324a51ac7e03",
  );
  for (const delta of [
    { workflowRun: "42585173703" },
    { requestId: "trilha-a-fixtures-20261109-r7" },
    { extra: true },
    { reportRaw: original.reportRaw.replace('"newArmedCount": 0', '"newArmedCount": 1') },
    { receiptsRaw: original.receiptsRaw.replace("[]", "[{}]") },
    { reportRaw: original.reportRaw.replace('"logoutVerified": true', '"logoutVerified": false') },
  ])
    assert.throws(
      () => sut.validateR6RecoveryDocument({ ...original, ...delta }),
      /RECOVERY_R6_LEDGER/,
    );
  let traps = 0;
  const fail = () => {
    traps++;
    throw Error("CANARY");
  };
  const accessor = { ...original };
  Object.defineProperty(accessor, "reportRaw", { enumerable: true, get: fail });
  const proxy = new Proxy(original, {
    get: fail,
    getPrototypeOf: fail,
    ownKeys: fail,
    getOwnPropertyDescriptor: fail,
  });
  const revoked = Proxy.revocable(original, {});
  revoked.revoke();
  for (const input of [undefined, null, {}, accessor, proxy, revoked.proxy])
    assert.throws(() => sut.validateR6RecoveryDocument(input), /RECOVERY_R6_LEDGER/);
  assert.equal(traps, 0);
  const instance = broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: original,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.equal(instance.snapshot().count, 10);
  assert.equal(instance.snapshot().maxNewIntentions, 14);
  assert.throws(
    () =>
      broker({
        recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
        recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
        recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
        recoveryLedgerR5: R6_R5_DOCUMENT,
      }),
    /RECOVERY_R6_LEDGER/,
  );
});

test("R8 actual artifact writer appends R7 and R8 proofs and preserves sixteen hashed data members", async () => {
  const fs = await import("node:fs/promises");
  const sync = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const source = await fs.readFile(
    new URL("./prepare-visual-fixtures.mjs", import.meta.url),
    "utf8",
  );
  const start = source.indexOf('    writeFileSync(join(output, "receipts-r3.json")');
  const marker = '    writeFileSync(join(output, "SHA256SUMS"), sums, { mode: 0o600 });';
  const end = source.indexOf(marker, start) + marker.length;
  assert.ok(start > 0 && end > start);
  const output = await fs.mkdtemp(join(tmpdir(), "contaos-r7-writer-"));
  try {
    for (const name of ["receipts.json", "report.json", "receipts-r1.json"])
      await fs.writeFile(
        join(output, name),
        name === "report.json"
          ? sut.R6_RECOVERY_DOCUMENT.reportRaw
          : name === "receipts-r1.json"
            ? JSON.stringify(sut.R1_RECOVERY_DOCUMENT, null, 2) + "\n"
            : sut.R6_RECOVERY_DOCUMENT.receiptsRaw,
      );
    await new (Object.getPrototypeOf(async () => {}).constructor)(
      "output",
      "writeFileSync",
      "join",
      "R2_RECOVERY_DOCUMENT",
      "R3_RECOVERY_DOCUMENT",
      "R5_RECOVERY_DOCUMENT",
      "R6_RECOVERY_DOCUMENT",
      "r7Recovery",
      "r8Recovery",
      "r9Recovery",
      "observationDiagnostic",
      "createHash",
      "readFile",
      "tracedPreparation",
      source.slice(start, end),
    )(
      output,
      sync.writeFileSync,
      join,
      sut.R2_RECOVERY_DOCUMENT,
      sut.R3_RECOVERY_DOCUMENT,
      sut.R5_RECOVERY_DOCUMENT,
      sut.R6_RECOVERY_DOCUMENT,
      sut.R7_RECOVERY_DOCUMENT,
      sut.R8_RECOVERY_DOCUMENT,
      sut.R9_RECOVERY_DOCUMENT,
      sut.createObservationDiagnostic(
        (({ frontendSha, harnessSha, deploymentId, workflowRun }) => ({
          frontendSha,
          harnessSha,
          deploymentId,
          workflowRun,
        }))(JSON.parse(sut.R8_RECOVERY_DOCUMENT.reportRaw)),
      ),
      createHash,
      fs.readFile,
      async (_, run) => run(),
    );
    const names = (await fs.readdir(output)).sort();
    assert.equal(names.length, 17);
    const manifest = (await fs.readFile(join(output, "SHA256SUMS"), "utf8")).trimEnd().split("\n");
    assert.equal(manifest.length, 16);
    assert.equal(new Set(manifest.map((line) => line.slice(66))).size, 16);
    for (const line of manifest) {
      assert.match(line, /^[0-9a-f]{64}  [a-z0-9.-]+$/);
      const bytes = await fs.readFile(join(output, line.slice(66)));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), line.slice(0, 64));
    }
    assert.equal(
      createHash("sha256")
        .update(await fs.readFile(join(output, "receipts-r1.json")))
        .digest("hex"),
      "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",
    );
    assert.equal(
      await fs.readFile(join(output, "receipts-r6.json"), "utf8"),
      sut.R6_RECOVERY_DOCUMENT.receiptsRaw,
    );
    assert.equal(
      await fs.readFile(join(output, "recovery-r6.json"), "utf8"),
      JSON.stringify(sut.R6_RECOVERY_DOCUMENT, null, 2) + "\n",
    );
    assert.equal(
      await fs.readFile(join(output, "recovery-r7.json"), "utf8"),
      JSON.stringify(sut.R7_RECOVERY_DOCUMENT, null, 2) + "\n",
    );
    assert.equal(
      createHash("sha256")
        .update(await fs.readFile(join(output, "recovery-r7.json")))
        .digest("hex"),
      "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e",
    );
    assert.equal(
      names.some((name) => ["report-r7.json", "receipts-r7.json"].includes(name)),
      false,
    );
    assert.equal(
      await fs.readFile(join(output, "receipts-r5.json"), "utf8"),
      sut.R5_RECOVERY_DOCUMENT.receiptsRaw,
    );
  } finally {
    await fs.rm(output, { recursive: true, force: true });
  }
});

test("R8 reconciliation requires live R7 zero-auth proof instead of assuming the unchanged budget", () => {
  const valid = r2Reconciliation();
  for (const ledgerR7 of [
    undefined,
    null,
    {},
    { schema: "contaos.fixture.recovery-r7.v1", derivedNewBusinessIntents: 1 },
  ]) {
    assert.throws(() => sut.reconcileR1Recovery({ ...valid, ledgerR7 }), /RECOVERY_R7_LEDGER/);
  }
});

test("R9 R7 ledger validation blocks forged proof alongside ten historical confirmations", () => {
  const proof = sut.R7_RECOVERY_DOCUMENT;
  assert.equal(Buffer.byteLength(JSON.stringify(proof, null, 2) + "\n"), 316);
  assert.deepEqual(sut.validateR7RecoveryDocument(proof), proof);
  let reads = 0;
  const getter = { ...proof };
  Object.defineProperty(getter, "headSha", {
    enumerable: true,
    get() {
      reads++;
      throw Error("CANARY");
    },
  });
  const proxy = new Proxy(proof, {
    get() {
      reads++;
      throw Error("CANARY");
    },
    ownKeys() {
      reads++;
      throw Error("CANARY");
    },
    getPrototypeOf() {
      reads++;
      throw Error("CANARY");
    },
  });
  const revoked = Proxy.revocable(proof, {});
  revoked.revoke();
  const prototype = new Proxy(
    {},
    {
      getOwnPropertyDescriptor() {
        reads++;
        throw Error("CANARY");
      },
    },
  );
  const wrapped = Object.assign(Object.create(prototype), proof);
  const extra = { ...proof };
  extra[Symbol("extra")] = true;
  for (const value of [
    null,
    {},
    getter,
    proxy,
    revoked.proxy,
    wrapped,
    extra,
    { ...proof, derivedNewBusinessIntents: 1 },
  ])
    assert.throws(() => sut.validateR7RecoveryDocument(value), /RECOVERY_R7_LEDGER/);
  assert.equal(reads, 0);
  const input = r2Reconciliation();
  assert.doesNotThrow(() => sut.reconcileR1Recovery(input));
  const b = broker({
    recoveryLedger: input.ledger,
    recoveryLedgerR3: input.ledgerR3,
    recoveryLedgerR4: input.ledgerR4,
    recoveryLedgerR5: input.ledgerR5,
    recoveryLedgerR6: input.ledgerR6,
    recoveryLedgerR7: input.ledgerR7,
    recoveryLedgerR8: input.ledgerR8,
    recoveryLedgerR9: input.ledgerR9,
  });
  assert.equal(b.snapshot().count, 10);
  assert.equal(b.snapshot().maxNewIntentions, 14);
  assert.throws(() => b.arm(), /RECOVERY_READ_ONLY/);
});

test("R8 actual fixture CLI rejects manual main before proof GET or login", async () => {
  const { readFile } = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const ast = ts.createSourceFile("preparer.mjs", source, 99, true, ts.ScriptKind.JS);
  const fn = ast.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "runCli");
  assert.ok(fn);
  let loads = 0,
    runtime = 0;
  const env = { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF: "refs/heads/main" };
  const run = new Function(
    "process",
    "loadSingleRequestProof",
    "preparerEventAllowed",
    "runFixturePreparation",
    "err",
    fn.getText(ast).replace(/^export\s+/, "") + ";return runCli;",
  )(
    { env, argv: [] },
    async () => {
      loads++;
    },
    () => true,
    async () => {
      runtime++;
    },
    (code) => {
      throw Error(code);
    },
  );
  await assert.rejects(run(["--prepare-fixtures"]), /PREPARER_MAIN_ONLY/);
  assert.equal(loads, 0);
  assert.equal(runtime, 0);
});

const R9_R8_DOCUMENT = {
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
};
test("R9 real broker charges the two original R8 confirmations and leaves fourteen", () => {
  const b = broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: R9_R8_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  });
  assert.equal(b.snapshot().confirmedBefore, 10);
  assert.equal(b.snapshot().count, 10);
  assert.equal(b.snapshot().maxNewIntentions, 14);
  assert.equal(JSON.parse(R9_R8_DOCUMENT.reportRaw).intentLedger.priorConfirmed, 8);
  assert.equal(JSON.parse(R9_R8_DOCUMENT.reportRaw).intentLedger.maxNewIntentions, 16);
});
test("R9 real October consumers refuse missing confirmed document or a new analysis request", async () => {
  const source = await r6SourceNodes();
  const report = JSON.parse(R9_R8_DOCUMENT.reportRaw),
    c0 = report.bindings.competencies[0];
  const c = { ...c0, month: "2026-10-01", evidence: { competencies: [] } };
  const r8Bindings = { ...report.bindings };
  const trace = async (_stage, run) => run();
  const stop = (code) => {
    throw Error(code);
  };
  const uuid = (value) => typeof value === "string" && /^[a-f0-9-]{36}$/.test(value);
  const compile = (name, env) =>
    new Function(...Object.keys(env), source.named(name).getText(source.ast) + ";return " + name)(
      ...Object.values(env),
    );
  for (const name of ["ensureDocument", "ensureAnalysis"]) {
    let commands = 0,
      observedError = null;
    const requirement = {
      id: c.requirementId,
      obrigatorio: true,
      aplicavel: true,
      impeditivo: true,
      categoria: "documental",
      tipos_esperados: ["outro"],
    };
    const loaded = {
      requirement,
      value: {
        competencia: {
          id: c.id,
          id_organizacao: FIXTURE.organization,
          id_contrato: FIXTURE.contract,
        },
        documentos: [],
      },
    };
    const io = {
      recoveryLedgerR8: R9_R8_DOCUMENT,
      recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
      official: (v) => v,
      fresh: async () => {},
      command: async () => {
        commands++;
        throw Error("TEST_COMMAND_REACHED");
      },
      runtime: {
        reuseDocument: async () => {
          commands++;
          throw Error("TEST_COMMAND_REACHED");
        },
      },
    };
    const env = {
      io,
      R8_BINDINGS: r8Bindings,
      R8_RECOVERY_DOCUMENT: R9_R8_DOCUMENT,
      tracedPreparation: trace,
      approvedContractFile: async () => ({}),
      link: async () => {},
      listPath: "/known",
      listMonth: async () => {},
      refreshArea: async () => {},
      poll: async (read) => read(),
      readDocuments: async () => loaded,
      analysis: async () => ({
        estado_analise: "not_analyzed",
        allowed_actions: { executar_analise: true },
        resultados: [],
        execucao_atual: null,
      }),
      stop,
      uuid,
      code: "AUD-A-TXT-001",
      FIXTURE,
      randomUUID,
      matchingDocument: () => null,
    };
    try {
      await compile(name, env)({ ...c });
    } catch (error) {
      observedError = error;
    }
    assert.ok(observedError instanceof Error);
    assert.notEqual(
      observedError.name,
      "ReferenceError",
      "test binds every real source dependency",
    );
    assert.equal(
      observedError.message,
      name === "ensureDocument" ? "RECOVERY_R8_DOCUMENT" : "RECOVERY_R8_ANALYSIS",
    );
    assert.equal(commands, 0, name + " must fail before any replay");
  }
});
test("R9 real observer preserves first closed failure through close and a later error", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const emit = (status, body) => {
    const request = {
      url: () => FIXTURE.api + "/rest/v1/rpc/obter_analise_competencia_v116",
      method: () => "POST",
      postData: () => null,
      failure: () => null,
    };
    page.emit("request", request);
    page.emit("response", { request: () => request, url: request.url, status: () => status, body });
  };
  emit(503, async () => {
    assert.fail("HTTP failure must not read response body");
  });
  await assert.rejects(() => observer.flush(), /OBSERVATION_FAILED/);
  const first = observer.observationFailure?.() ?? null;
  assert.deepEqual(first, {
    contractKind: "RPC:obter_analise_competencia_v116",
    stage: "HTTP_STATUS",
    statusHTTP: 503,
    requestFailure: "NONE",
  });
  emit(200, async () => {
    throw Object.create(null);
  });
  await assert.rejects(() => observer.flush(), /OBSERVATION_FAILED/);
  observer.close();
  assert.deepEqual(observer.observationFailure(), first);
  assert.equal(Object.isFrozen(first), true);
});

test("R9 actual artifact writer appends R8 originals and the separate observation record", async () => {
  const fs = await import("node:fs/promises"),
    sync = await import("node:fs"),
    { join } = await import("node:path"),
    { tmpdir } = await import("node:os");
  const source = await fs.readFile(
    new URL("./prepare-visual-fixtures.mjs", import.meta.url),
    "utf8",
  );
  const start = source.indexOf('    writeFileSync(join(output, "receipts-r3.json")'),
    marker = '    writeFileSync(join(output, "SHA256SUMS"), sums, { mode: 0o600 });',
    end = source.indexOf(marker, start) + marker.length;
  assert.ok(start > 0 && end > start);
  const output = await fs.mkdtemp(join(tmpdir(), "contaos-r9-writer-"));
  const actual = JSON.parse(R9_R8_DOCUMENT.reportRaw),
    identity = {
      frontendSha: actual.frontendSha,
      harnessSha: actual.harnessSha,
      deploymentId: actual.deploymentId,
      workflowRun: actual.workflowRun,
    };
  const observationDiagnostic = {
    schema: "contaos.fixture.observation.v1",
    ...identity,
    firstFailure: null,
  };
  try {
    for (const [name, raw] of [
      ["receipts.json", R9_R8_DOCUMENT.receiptsRaw],
      ["report.json", R9_R8_DOCUMENT.reportRaw],
      ["receipts-r1.json", JSON.stringify(sut.R1_RECOVERY_DOCUMENT, null, 2) + "\n"],
    ])
      await fs.writeFile(join(output, name), raw);
    const env = {
      output,
      writeFileSync: sync.writeFileSync,
      join,
      R2_RECOVERY_DOCUMENT: sut.R2_RECOVERY_DOCUMENT,
      R3_RECOVERY_DOCUMENT: sut.R3_RECOVERY_DOCUMENT,
      R5_RECOVERY_DOCUMENT: sut.R5_RECOVERY_DOCUMENT,
      R6_RECOVERY_DOCUMENT: sut.R6_RECOVERY_DOCUMENT,
      r7Recovery: sut.R7_RECOVERY_DOCUMENT,
      r8Recovery: R9_R8_DOCUMENT,
      r9Recovery: sut.R9_RECOVERY_DOCUMENT,
      observationDiagnostic,
      createHash,
      readFile: fs.readFile,
      tracedPreparation: async (_, run) => run(),
    };
    await new (Object.getPrototypeOf(async () => {}).constructor)(
      ...Object.keys(env),
      source.slice(start, end),
    )(...Object.values(env));
    const names = (await fs.readdir(output)).sort(),
      lines = (await fs.readFile(join(output, "SHA256SUMS"), "utf8")).trimEnd().split("\n");
    assert.equal(names.length, 17);
    assert.equal(lines.length, 16);
    assert.equal(new Set(lines.map((line) => line.slice(66))).size, 16);
    for (const line of lines)
      assert.equal(
        createHash("sha256")
          .update(await fs.readFile(join(output, line.slice(66))))
          .digest("hex"),
        line.slice(0, 64),
      );
    assert.equal(
      await fs.readFile(join(output, "receipts-r8.json"), "utf8"),
      R9_R8_DOCUMENT.receiptsRaw,
    );
    assert.equal(
      await fs.readFile(join(output, "recovery-r8.json"), "utf8"),
      JSON.stringify(R9_R8_DOCUMENT, null, 2) + "\n",
    );
    const emitted = JSON.parse(
      await fs.readFile(join(output, "observation-diagnostic.json"), "utf8"),
    );
    assert.deepEqual(emitted, observationDiagnostic);
    assert.deepEqual(Object.keys(emitted), [
      "schema",
      "frontendSha",
      "harnessSha",
      "deploymentId",
      "workflowRun",
      "firstFailure",
    ]);
    assert.equal(
      Object.keys(JSON.parse(await fs.readFile(join(output, "report.json"), "utf8"))).length,
      15,
    );
  } finally {
    await fs.rm(output, { recursive: true, force: true });
  }
});

function r9Broker(options = {}) {
  return broker({
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: R9_R8_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
    ...options,
  });
}
test("R9 exact R8 ledger rejects mutations and hostile objects without reading them", () => {
  assert.deepEqual(sut.validateR8RecoveryDocument(R9_R8_DOCUMENT), R9_R8_DOCUMENT);
  const clone = () => structuredClone(R9_R8_DOCUMENT);
  for (const value of [
    undefined,
    null,
    {},
    { ...clone(), extra: "CANARY" },
    { ...clone(), reportRaw: clone().reportRaw + " " },
    { ...clone(), receiptsRaw: clone().receiptsRaw.replace("confirmed", "sealed") },
    { ...clone(), workflowRun: "1" },
  ])
    assert.throws(() => sut.validateR8RecoveryDocument(value), /RECOVERY_R8_LEDGER/);
  let reads = 0;
  const getter = clone();
  Object.defineProperty(getter, "reportRaw", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const handler = {
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    ownKeys() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    getPrototypeOf() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  };
  const revoked = Proxy.revocable(clone(), handler);
  revoked.revoke();
  for (const value of [
    getter,
    new Proxy(clone(), handler),
    revoked.proxy,
    Object.create(new Proxy({}, handler)),
  ])
    assert.throws(() => sut.validateR8RecoveryDocument(value), /RECOVERY_R8_LEDGER/);
  assert.equal(reads, 0);
  assert.throws(
    () => sut.reconcileR1Recovery({ ...r6RecoveryState(), ledgerR8: undefined }),
    /RECOVERY_R8_LEDGER/,
  );
});
test("R9 semantic replay denies complete October intents with fresh UUIDs but permits September", () => {
  const bindings = JSON.parse(R9_R8_DOCUMENT.reportRaw).bindings,
    c = bindings.competencies[0],
    context = {
      official: true,
      current: true,
      organization: FIXTURE.organization,
      contract: FIXTURE.contract,
    };
  const evidence = {
    competencies: [{ ...context, id: c.id, month: c.month }],
    requirements: [{ ...context, id: c.requirementId, competency: c.id, code: "AUD-A-TXT-001" }],
    file: {
      ...context,
      id: FIXTURE.file,
      document: FIXTURE.contractualDocument,
      status: "aprovado",
      mime: "text/plain",
      bytes: 285,
      sha256: FIXTURE.fileHash,
    },
  };
  const attempts = [
    [
      "criar_documento_competencia_v115",
      {
        p_id_competencia: c.id,
        p_tipo: "outro",
        p_titulo: "Documento TXT sintético Trilha A.",
        p_categoria: "documental",
        p_id_requisito: c.requirementId,
        p_id_arquivo: FIXTURE.file,
        p_chave_idempotencia: randomUUID(),
      },
    ],
    ["solicitar_analise_competencia", { p_id_competencia: c.id, p_tipo: "completa" }],
  ];
  let arms = 0;
  const b = r9Broker({
    beforeArm: () => {
      arms++;
      return true;
    },
  });
  b.authorizeRecovery(sut.reconcileR1Recovery(r6RecoveryState()));
  for (const [rpc, payload] of attempts) {
    assert.equal(sut.validateBusinessPayload(rpc, payload, evidence), true);
    assert.throws(
      () =>
        b.arm({
          rpc,
          payload,
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
          evidence,
        }),
      /RECOVERY_CONFIRMED_OPERATION/,
    );
  }
  assert.equal(b.snapshot().count, 10);
  assert.equal(arms, 0);
  const sep = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings.competencies[1];
  const payload = { p_id_competencia: sep.id, p_tipo: "completa" },
    sepEvidence = { competencies: [{ ...context, id: sep.id, month: sep.month }] };
  assert.equal(
    sut.validateBusinessPayload("solicitar_analise_competencia", payload, sepEvidence),
    true,
  );
  b.arm({
    rpc: "solicitar_analise_competencia",
    payload,
    requestId: randomUUID(),
    verified: { context: true, capability: true, reconciled: true },
    evidence: sepEvidence,
  });
  assert.equal(arms, 1);
  assert.equal(b.snapshot().count, 11);
  assert.deepEqual(sut.preparationIntentSummary(b), {
    count: 11,
    frozen: false,
    pending: true,
    sent: false,
    priorConfirmed: 10,
    newArmedCount: 1,
    maxIntentions: 24,
    maxNewIntentions: 14,
  });
});
test("R9 replay guard rejects proxies and accessors before callbacks without reading them", () => {
  const c = JSON.parse(R9_R8_DOCUMENT.reportRaw).bindings.competencies[0];
  let reads = 0,
    arms = 0;
  const base = { p_id_competencia: c.id, p_tipo: "completa" },
    accessor = { ...base };
  Object.defineProperty(accessor, "p_id_competencia", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const handler = {
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    getPrototypeOf() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    ownKeys() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  };
  const revoked = Proxy.revocable({ ...base }, handler);
  revoked.revoke();
  for (const authorized of [false, true])
    for (const payload of [accessor, new Proxy({ ...base }, handler), revoked.proxy]) {
      const b = r9Broker({
        beforeArm: () => {
          arms++;
          return true;
        },
      });
      if (authorized) b.authorizeRecovery(sut.reconcileR1Recovery(r6RecoveryState()));
      assert.throws(
        () =>
          b.arm({
            rpc: "solicitar_analise_competencia",
            payload,
            requestId: randomUUID(),
            verified: { context: true, capability: true, reconciled: true },
          }),
        authorized ? /INTENT_PAYLOAD/ : /RECOVERY_READ_ONLY/,
      );
      assert.equal(b.snapshot().count, 10);
    }
  assert.equal(reads, 0);
  assert.equal(arms, 0);
});

function r9Identity() {
  const { frontendSha, harnessSha, deploymentId, workflowRun } = JSON.parse(
    R9_R8_DOCUMENT.reportRaw,
  );
  return { frontendSha, harnessSha, deploymentId, workflowRun };
}
test("R9 observation schema accepts only the literal stage matrix and current provenance", () => {
  const identity = r9Identity(),
    make = sut.createObservationDiagnostic,
    validate = sut.validateObservationDiagnostic;
  const empty = make(identity);
  assert.equal(empty.firstFailure, null);
  assert.equal(empty.schema, "contaos.fixture.observation.v1");
  assert.equal(Object.isFrozen(empty), true);
  assert.deepEqual(Object.keys(empty), [
    "schema",
    "frontendSha",
    "harnessSha",
    "deploymentId",
    "workflowRun",
    "firstFailure",
  ]);
  for (const contractKind of [
    "TABLE:contratos",
    "RPC:obter_analise_competencia_v116",
    "UNKNOWN",
    "RPC:private_canary",
  ])
    for (const stage of [
      "REQUEST_BINDING",
      "REQUEST_ARGS",
      "HTTP_STATUS",
      "BODY_READ",
      "RESPONSE_PROJECTION",
      "RESPONSE_CONTEXT",
      "OBSERVATION_LIMIT",
      "UNAVAILABLE",
      "CANARY",
    ])
      for (const statusHTTP of ["NONE", 99, 200, 299, 300, 503, 600])
        for (const requestFailure of ["NONE", "ABORTED", "OTHER", "UNAVAILABLE", "CANARY"]) {
          const known = ["TABLE:contratos", "RPC:obter_analise_competencia_v116"].includes(
            contractKind,
          );
          let ok =
            stage === "UNAVAILABLE"
              ? contractKind === "UNKNOWN" &&
                statusHTTP === "NONE" &&
                requestFailure === "UNAVAILABLE"
              : known &&
                (stage === "HTTP_STATUS"
                  ? Number.isInteger(statusHTTP) &&
                    statusHTTP >= 100 &&
                    statusHTTP <= 599 &&
                    !(statusHTTP >= 200 && statusHTTP <= 299) &&
                    requestFailure === "NONE"
                  : stage === "BODY_READ"
                    ? Number.isInteger(statusHTTP) &&
                      statusHTTP >= 200 &&
                      statusHTTP <= 299 &&
                      ["NONE", "ABORTED", "OTHER", "UNAVAILABLE"].includes(requestFailure)
                    : [
                        "REQUEST_BINDING",
                        "REQUEST_ARGS",
                        "RESPONSE_PROJECTION",
                        "RESPONSE_CONTEXT",
                        "OBSERVATION_LIMIT",
                      ].includes(stage) &&
                      statusHTTP === "NONE" &&
                      requestFailure === "NONE" &&
                      (!["REQUEST_BINDING", "REQUEST_ARGS"].includes(stage) ||
                        contractKind.startsWith("RPC:")));
          const value = { contractKind, stage, statusHTTP, requestFailure };
          if (ok) {
            const result = make(identity, value);
            assert.deepEqual(validate(result, identity), result);
            assert.equal(Object.isFrozen(result.firstFailure), true);
          } else assert.throws(() => make(identity, value), /OBSERVATION_DIAGNOSTIC/);
        }
  for (const key of Object.keys(identity))
    assert.throws(
      () =>
        validate(empty, {
          ...identity,
          [key]:
            key === "workflowRun"
              ? "1"
              : key === "deploymentId"
                ? "dpl_other12345"
                : "f".repeat(40),
        }),
      /OBSERVATION_DIAGNOSTIC/,
    );
  for (const value of [
    { ...empty, extra: "CANARY" },
    { ...empty, schema: "CANARY" },
    {
      ...empty,
      firstFailure: {
        contractKind: "RPC:private_canary",
        stage: "HTTP_STATUS",
        statusHTTP: 503,
        requestFailure: "NONE",
      },
    },
  ])
    assert.throws(() => validate(value, identity), /OBSERVATION_DIAGNOSTIC/);
});
test("R9 observation identity and nested records reject accessors proxies and canaries without reads", () => {
  const identity = r9Identity(),
    valid = sut.createObservationDiagnostic(identity, {
      contractKind: "RPC:obter_analise_competencia_v116",
      stage: "BODY_READ",
      statusHTTP: 200,
      requestFailure: "UNAVAILABLE",
    });
  let reads = 0;
  const handler = {
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    ownKeys() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
    getPrototypeOf() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  };
  const top = structuredClone(valid);
  Object.defineProperty(top, "firstFailure", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const nested = structuredClone(valid);
  Object.defineProperty(nested.firstFailure, "stage", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const revoked = Proxy.revocable(structuredClone(valid), handler);
  revoked.revoke();
  const symbol = structuredClone(valid);
  symbol[Symbol("CANARY")] = 1;
  for (const value of [
    top,
    nested,
    new Proxy(structuredClone(valid), handler),
    revoked.proxy,
    Object.create(new Proxy({}, handler)),
    symbol,
    { ...structuredClone(valid), firstFailure: new Proxy({}, handler) },
  ])
    assert.throws(
      () => sut.validateObservationDiagnostic(value, identity),
      /OBSERVATION_DIAGNOSTIC/,
    );
  const badIdentity = { ...identity };
  Object.defineProperty(badIdentity, "frontendSha", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  assert.throws(() => sut.createObservationDiagnostic(badIdentity), /OBSERVATION_DIAGNOSTIC/);
  assert.throws(
    () =>
      sut.createObservationDiagnostic({
        ...identity,
        frontendSha: {
          toString() {
            reads++;
            throw Error("PRIVATE_CANARY");
          },
        },
      }),
    /OBSERVATION_DIAGNOSTIC/,
  );
  assert.equal(reads, 0);
  assert.equal(JSON.stringify(valid).includes("PRIVATE_CANARY"), false);
});
async function r9ResponseFailure({ status = 200, failure = () => null, body } = {}) {
  const { EventEmitter } = await import("node:events"),
    page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const request = {
    url: () => FIXTURE.api + "/rest/v1/rpc/obter_analise_competencia_v116",
    method: () => "POST",
    postData: () => null,
    failure,
  };
  const rejected = new Proxy(
    {},
    {
      get() {
        throw Error("PRIVATE_CANARY");
      },
      getPrototypeOf() {
        throw Error("PRIVATE_CANARY");
      },
    },
  );
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: typeof status === "function" ? status : () => status,
    body:
      body ??
      (async () => {
        throw rejected;
      }),
  });
  await assert.rejects(() => observer.flush(), /OBSERVATION_FAILED/);
  const record = observer.observationFailure();
  observer.close();
  assert.deepEqual(observer.observationFailure(), record);
  return record;
}
test("R9 body read classifies only trusted request failure literals and never passes aborts", async () => {
  const base = {
    contractKind: "RPC:obter_analise_competencia_v116",
    stage: "BODY_READ",
    statusHTTP: 200,
  };
  let reads = 0;
  const accessor = {};
  Object.defineProperty(accessor, "errorText", {
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const proxy = new Proxy(
    {},
    {
      get() {
        reads++;
        throw Error("PRIVATE_CANARY");
      },
      ownKeys() {
        reads++;
        throw Error("PRIVATE_CANARY");
      },
      getPrototypeOf() {
        reads++;
        throw Error("PRIVATE_CANARY");
      },
    },
  );
  for (const [failure, expected] of [
    [() => null, "NONE"],
    [() => ({ errorText: "net::ERR_ABORTED" }), "ABORTED"],
    [() => ({ errorText: "net::ERR_ABORTED extra PRIVATE_CANARY" }), "OTHER"],
    [() => ({ errorText: "net::ERR_CONNECTION_RESET" }), "OTHER"],
    [() => accessor, "UNAVAILABLE"],
    [() => proxy, "UNAVAILABLE"],
    [
      () => {
        throw proxy;
      },
      "UNAVAILABLE",
    ],
    [() => ({}), "UNAVAILABLE"],
  ])
    assert.deepEqual(await r9ResponseFailure({ failure }), { ...base, requestFailure: expected });
  assert.equal(reads, 0);
  for (const status of [
    () => {
      throw proxy;
    },
    () => 0,
    () => NaN,
    () => "200",
  ])
    assert.deepEqual(await r9ResponseFailure({ status }), {
      contractKind: "UNKNOWN",
      stage: "UNAVAILABLE",
      statusHTTP: "NONE",
      requestFailure: "UNAVAILABLE",
    });
  const { EventEmitter } = await import("node:events"),
    page = new EventEmitter(),
    fresh = sut.createOfficialObserver(page);
  assert.equal(fresh.observationFailure(), null);
  fresh.close();
  assert.equal(fresh.observationFailure(), null);
});

test("R9 missing R8 ledger cannot construct a recovery broker even with a valid R8 proof", () => {
  const proof = sut.reconcileR1Recovery(r6RecoveryState());
  assert.ok(Object.isFrozen(proof));
  const options = {
    persist: () => true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: sut.R8_RECOVERY_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  };
  for (const value of [undefined, null])
    assert.throws(() => {
      const b = sut.createIntentBroker({ ...options, recoveryLedgerR8: value });
      b.authorizeRecovery(proof);
    }, /RECOVERY_R8_LEDGER/);
});

test("R9 synchronous observed HTTP failure wins before later request binding and microtasks", async () => {
  const { EventEmitter } = await import("node:events"),
    page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const request = {
    url: () => FIXTURE.api + "/rest/v1/rpc/obter_analise_competencia_v116",
    method: () => "POST",
    postData: () => null,
  };
  observer.markMutation(
    "solicitar_analise_competencia",
    { p_id_competencia: id, p_tipo: "completa" },
    {},
  );
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 503,
    body: async () => {
      assert.fail("HTTP must not read body");
    },
  });
  const immediate = observer.observationFailure();
  page.emit("request", {
    url: () => FIXTURE.api + "/rest/v1/rpc/solicitar_analise_competencia",
    method: () => "POST",
    postData: () =>
      JSON.stringify({
        p_id_competencia: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        p_tipo: "completa",
      }),
  });
  await assert.rejects(() => observer.flush(), /OBSERVATION_FAILED/);
  const after = observer.observationFailure();
  observer.close();
  const expected = {
    contractKind: "RPC:obter_analise_competencia_v116",
    stage: "HTTP_STATUS",
    statusHTTP: 503,
    requestFailure: "NONE",
  };
  assert.deepEqual(immediate, expected);
  assert.deepEqual(after, expected);
});

test("R9 actual final report refuses success when the observer failed after final freshness", async () => {
  const { readFile } = await import("node:fs/promises"),
    { join } = await import("node:path");
  const source = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8"),
    ast = await r6SourceNodes();
  const run = ast.named("runFixturePreparation"),
    start = source.indexOf("    const cleanupOk =", run.pos);
  const marker = '    writeFileSync(join(output, "receipts-r3.json")',
    end = source.indexOf(marker, start);
  assert.ok(
    start > run.pos &&
      end > start &&
      source.slice(start, end).includes("const observationDiagnostic"),
  );
  const failure = {
    contractKind: "RPC:obter_analise_competencia_v116",
    stage: "HTTP_STATUS",
    statusHTTP: 503,
    requestFailure: "NONE",
  };
  for (const earlier of [null, "PREPARER_CONTEXT"]) {
    const emitted = new Map(),
      diagnostics = sut.createPreparationDiagnostics();
    if (earlier) diagnostics.capture(Error(earlier));
    const env = {
      output: "/test-only",
      identity: r9Identity(),
      observer: { observationFailure: () => failure },
      broker: r9Broker(),
      preparationIntentSummary: sut.preparationIntentSummary,
      completed: true,
      logoutVerified: true,
      blockedCode: earlier,
      diagnostics,
      sourceList: null,
      result: null,
      recoveryState: null,
      validatedBudget: { confirmedBefore: 10, maxNewIntentions: 14 },
      r4Recovery: sut.R4_RECOVERY_DOCUMENT,
      R1_RECEIPTS_SHA256: JSON.parse(R9_R8_DOCUMENT.reportRaw).recovery.ledgerSha256,
      R3_RECOVERY_DOCUMENT: sut.R3_RECOVERY_DOCUMENT,
      fixtureBindingReceipt: sut.fixtureBindingReceipt,
      createObservationDiagnostic: sut.createObservationDiagnostic,
      uuid: () => false,
      obj: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
      phase: "FINAL_READBACK",
      join,
      writeFileSync: (path, bytes) => emitted.set(path, bytes),
    };
    await new (Object.getPrototypeOf(async () => {}).constructor)(
      ...Object.keys(env),
      source.slice(start, end),
    )(...Object.values(env));
    const report = JSON.parse(emitted.get(join(env.output, "report.json")));
    assert.equal(report.completed, false);
    assert.equal(report.failure, earlier ?? "OBSERVATION_FAILED");
    assert.equal(report.diagnostics.primaryFailure, earlier ?? "OBSERVATION_FAILED");
    assert.equal(report.logoutVerified, true);
  }
});

async function r9ExistingConsumer(
  name,
  {
    documentMode = "valid",
    analysisStates = ["queued", "processing", "complete"],
    analysisDelta = {},
  } = {},
) {
  const source = await r6SourceNodes(),
    r8 = JSON.parse(R9_R8_DOCUMENT.reportRaw),
    record = r8.bindings.competencies[0],
    c = { ...record, month: "2026-10-01", evidence: { competencies: [] } },
    events = [];
  const q = {
    id: c.requirementId,
    codigo: "AUD-A-TXT-001",
    obrigatorio: true,
    aplicavel: true,
    impeditivo: true,
    categoria: "documental",
    tipos_esperados: ["outro"],
  };
  const competencia = {
    id: c.id,
    id_organizacao: FIXTURE.organization,
    id_contrato: FIXTURE.contract,
    competencia_referencia: c.month,
  };
  const document = {
    id: c.documentId,
    tipo: "outro",
    categoria: "documental",
    titulo: "Documento TXT sintético Trilha A.",
    situacao: "ativo",
    requisito: { id: c.requirementId },
    arquivo: { id: FIXTURE.file, sha256: FIXTURE.fileHash, status_seguranca: "aprovado" },
    versao: { id_arquivo: FIXTURE.file },
    processamento: { status: "completed" },
  };
  if (documentMode === "foreignHash") document.arquivo.sha256 = "f".repeat(64);
  let reads = 0,
    commands = 0;
  const io = {
    recoveryLedgerR8: R9_R8_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
    official: (v) => v,
    fresh: async () => {
      events.push("fresh");
    },
    rpcRead: async (rpc, args) => {
      events.push(rpc);
      assert.deepEqual(args, { p_id_competencia: c.id });
      reads++;
      if (rpc === "obter_documentos_competencia_v115")
        return {
          schema_versao: "v115-v1",
          competencia,
          estado_documental: "complete",
          requisitos_documentais: [q],
          documentos:
            documentMode === "missing"
              ? []
              : documentMode === "duplicate"
                ? [document, structuredClone(document)]
                : [document],
        };
      assert.equal(rpc, "obter_analise_competencia_v116");
      const estado_analise = analysisStates[Math.min(reads - 1, analysisStates.length - 1)];
      return {
        schema_versao: "v116-v1",
        competencia,
        estado_analise,
        stale: false,
        execucao_atual: estado_analise === "not_analyzed" ? null : { id, status: estado_analise },
        resultados: [],
        allowed_actions: { executar_analise: true },
        ...analysisDelta,
      };
    },
    command: async () => {
      commands++;
      throw Error("TEST_COMMAND_REACHED");
    },
    runtime: {
      reuseDocument: async () => {
        commands++;
        throw Error("TEST_COMMAND_REACHED");
      },
    },
  };
  const env = {
    io,
    R8_BINDINGS: r8.bindings,
    FIXTURE,
    code: "AUD-A-TXT-001",
    listPath: "/known",
    tracedPreparation: async (_, run) => run(),
    stop: (code) => {
      throw Error(code);
    },
    uuid: (v) => typeof v === "string" && /^[a-f0-9-]{36}$/.test(v),
    approvedContractFile: async () => ({}),
    link: async () => {
      events.push("link");
    },
    listMonth: async () => {
      events.push("listMonth");
    },
    refreshArea: async () => {
      events.push("refreshArea");
    },
    randomUUID,
    poll: async (read, ready, refresh) => {
      for (let n = 0; n < 5; n++) {
        const value = await read();
        if (ready(value)) return value;
        await refresh();
      }
      throw Error("TEST_POLL_EXHAUSTED");
    },
  };
  const compile = (functionName) =>
    new Function(
      ...Object.keys(env),
      source.named(functionName).getText(source.ast) + ";return " + functionName,
    )(...Object.values(env));
  env.inContext = compile("inContext");
  env.readDocuments = compile("readDocuments");
  env.analysis = compile("analysis");
  let error = null;
  try {
    await compile(name)(c);
  } catch (value) {
    error = value;
  }
  return { c, error, events, reads, commands };
}
test("R9 real October document and analysis consumers reuse existing DTO identities with GET only", async () => {
  const doc = await r9ExistingConsumer("ensureDocument");
  assert.equal(doc.error, null);
  assert.equal(doc.commands, 0);
  assert.equal(doc.c.documentId, "c7f56ac9-81d6-45a4-81f8-db1383006c41");
  assert.equal(doc.reads, 2);
  const analysis = await r9ExistingConsumer("ensureAnalysis");
  assert.equal(analysis.error, null);
  assert.equal(analysis.commands, 0);
  assert.equal(analysis.c.executionId, id);
  assert.equal(analysis.reads, 3);
  assert.equal(analysis.events.filter((v) => v === "refreshArea").length, 2);
  for (const [options, expected] of [
    [{ documentMode: "missing" }, "RECOVERY_R8_DOCUMENT"],
    [{ documentMode: "duplicate" }, "RECOVERY_R8_DOCUMENT"],
    [{ documentMode: "foreignHash" }, "COMPETENCE_DOCUMENT_RELATION"],
  ]) {
    const result = await r9ExistingConsumer("ensureDocument", options);
    assert.equal(result.error?.message, expected);
    assert.equal(result.commands, 0);
  }
  for (const [options, expected] of [
    [{ analysisStates: ["not_analyzed"] }, "RECOVERY_R8_ANALYSIS"],
    [{ analysisStates: ["failed"] }, "COMPETENCE_ANALYSIS_FAILED"],
    [{ analysisDelta: { stale: true } }, "COMPETENCE_ANALYSIS_FAILED"],
    [
      {
        analysisDelta: {
          competencia: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            competencia_referencia: "2026-10-01",
          },
        },
      },
      "COMPETENCE_ANALYSIS_RELATION",
    ],
  ]) {
    const result = await r9ExistingConsumer("ensureAnalysis", options);
    assert.equal(result.error?.message, expected);
    assert.equal(result.commands, 0);
  }
});

test("R9 bounded observer seal drains an admitted body failure and preserves it after close", async () => {
  const { EventEmitter } = await import("node:events"),
    page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  let rejectBody;
  const body = new Promise((_, reject) => {
    rejectBody = reject;
  });
  const request = {
    url: () => FIXTURE.api + "/rest/v1/rpc/obter_analise_competencia_v116",
    method: () => "POST",
    postData: () => null,
    failure: () => null,
  };
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 200,
    body: () => body,
  });
  assert.equal(observer.observationFailure(), null);
  const draining = observer.seal();
  assert.equal(page.listenerCount("request"), 0);
  assert.equal(page.listenerCount("response"), 0);
  rejectBody(Object.create(null));
  await draining;
  assert.deepEqual(observer.observationFailure(), {
    contractKind: "RPC:obter_analise_competencia_v116",
    stage: "BODY_READ",
    statusHTTP: 200,
    requestFailure: "NONE",
  });
  observer.close();
  assert.equal(observer.observationFailure().stage, "BODY_READ");
  await assert.rejects(() => observer.flush(), /OBSERVATION_FAILED/);
});

test("R9 sealing an admitted delayed table still validates context before closing", async () => {
  const f = await r4ObserverFixture();
  let release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const foreign = { ...f.row("ativa"), id_organizacao: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
  f.response(f.request(), [foreign], wait);
  const draining = f.observer.seal();
  release();
  await draining;
  const first = f.observer.observationFailure();
  f.observer.close();
  assert.deepEqual(first, {
    contractKind: "TABLE:fontes_normativas",
    stage: "RESPONSE_CONTEXT",
    statusHTTP: "NONE",
    requestFailure: "NONE",
  });
  assert.deepEqual(f.observer.observationFailure(), first);
  await assert.rejects(() => f.observer.flush(), /OBSERVATION_FAILED/);
});

const R10_R9_DOCUMENT = {
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
};
test("R10 recovery requires the exact zero-intent R9 document before constructing a broker", () => {
  const options = {
    persist: () => true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
    recoveryLedgerR3: sut.R3_RECOVERY_DOCUMENT,
    recoveryLedgerR4: sut.R4_RECOVERY_DOCUMENT,
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: R9_R8_DOCUMENT,
    recoveryLedgerR9: sut.R9_RECOVERY_DOCUMENT,
  };
  for (const recoveryLedgerR9 of [undefined, null])
    assert.throws(
      () => sut.createIntentBroker({ ...options, recoveryLedgerR9 }),
      /RECOVERY_R9_LEDGER/,
    );
  const b = sut.createIntentBroker({ ...options, recoveryLedgerR9: R10_R9_DOCUMENT });
  assert.equal(b.snapshot().count, 10);
  assert.equal(b.snapshot().maxNewIntentions, 14);
});
test("R10 actual recovery consumer waits for the new monthly request instead of the initial unfiltered row", async () => {
  const { EventEmitter } = await import("node:events"),
    { readFile } = await import("node:fs/promises");
  const sdk = await readFile(
      new URL("../../src/lib/contratos/competenciasDados.ts", import.meta.url),
      "utf8",
    ),
    select = sdk.match(/export const COLUNAS_COMPETENCIA\s*=\s*"([^"]+)"/)[1];
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page, { wait: () => new Promise(setImmediate) });
  const rows = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings.competencies.map((c) => ({
    id: c.id,
    competencia_referencia: c.month,
    periodo_inicio: c.month,
    periodo_fim: c.month,
    data_limite: null,
    situacao: "preparando",
    percentual_conformidade: 0,
    versao_pacote_atual: null,
    atualizado_em: null,
  }));
  const q = {
    select,
    id_contrato: "eq." + FIXTURE.contract,
    order: "competencia_referencia.desc,id.desc",
    offset: "0",
    limit: "25",
  };
  const request = (query) => {
    const url = FIXTURE.api + "/rest/v1/competencias?" + new URLSearchParams(query),
      r = { method: () => "GET", url: () => url, postData: () => null, failure: () => null };
    page.emit("request", r);
    return r;
  };
  const response = (request, value) =>
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(value)),
    });
  let monthlyRequest,
    startedResolve,
    links = 0;
  const started = new Promise((resolve) => {
    startedResolve = resolve;
  });
  const io = {
    recoveryLedgerR5: R6_R5_DOCUMENT,
    recoveryLedgerR6: sut.R6_RECOVERY_DOCUMENT,
    recoveryLedgerR7: sut.R7_RECOVERY_DOCUMENT,
    recoveryLedgerR8: R9_R8_DOCUMENT,
    recoveryLedgerR9: R10_R9_DOCUMENT,
    readBarrier: observer.readBarrier,
    assertReadBarrier: observer.assertReadBarrier,
    readBarrierRemaining: observer.readBarrierRemaining,
    generation: observer.generation,
    observedAfter: observer.waitObservedAfter,
    read: observer.read,
    rpcRead: observer.rpcRead,
    fresh: () => observer.flush(),
    goKnown: async () => {
      response(request(q), rows);
      await observer.flush();
    },
    page: {
      getByLabel: (name, options) => {
        assert.equal(name, "Competência");
        assert.deepEqual(options, { exact: true });
        return {
          fill: async (month) => {
            assert.equal(month, "2026-10");
            monthlyRequest = request({ ...q, competencia_referencia: "eq." + month + "-01" });
            startedResolve();
          },
        };
      },
    },
    link: async () => {
      links++;
      throw Error("TEST_STOP_AT_LINK");
    },
  };
  const task = sut.reconcileRecoveryCompetencies(io).catch((error) => error);
  await started;
  await new Promise(setImmediate);
  try {
    assert.equal(
      links,
      0,
      "initial unfiltered row must not authorize navigation while monthly request has no response",
    );
  } finally {
    if (monthlyRequest) response(monthlyRequest, [rows[0]]);
    await task;
    await observer.flush();
    observer.close();
  }
});

function r10BudgetApi() {
  const { EventEmitter } = createRequire(import.meta.url)("node:events");
  const observer = sut.createOfficialObserver(new EventEmitter());
  return {
    readBarrier: observer.readBarrier,
    assertReadBarrier: observer.assertReadBarrier,
    readBarrierRemaining: observer.readBarrierRemaining,
  };
}

async function r10QueryFixture(options = {}) {
  const { EventEmitter } = await import("node:events"),
    { readFile } = await import("node:fs/promises");
  const source = await readFile(
      new URL("../../src/lib/contratos/competenciasDados.ts", import.meta.url),
      "utf8",
    ),
    select = source.match(/export const COLUNAS_COMPETENCIA\s*=\s*"([^"]+)"/)[1];
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page, {
      wait: () => new Promise(setImmediate),
      ...options,
    });
  const c = JSON.parse(R6_R5_DOCUMENT.reportRaw).bindings.competencies[0],
    row = {
      id: c.id,
      competencia_referencia: c.month,
      periodo_inicio: c.month,
      periodo_fim: null,
      data_limite: null,
      situacao: "preparando",
      percentual_conformidade: 0,
      versao_pacote_atual: null,
      atualizado_em: null,
    };
  const where = { id_contrato: FIXTURE.contract, competencia_referencia: c.month };
  const full = {
    select,
    id_contrato: "eq." + FIXTURE.contract,
    competencia_referencia: "eq." + c.month,
    order: "competencia_referencia.desc,id.desc",
    offset: "0",
    limit: "25",
  };
  const request = (q = full, endpoint = "competencias", args) => {
    const url =
        FIXTURE.api +
        "/rest/v1/" +
        endpoint +
        (args === undefined ? "?" + new URLSearchParams(q) : ""),
      r = {
        url: () => url,
        method: () => (args === undefined ? "GET" : "POST"),
        postData: () => (args === undefined ? null : JSON.stringify(args)),
        failure: () => null,
      };
    page.emit("request", r);
    return r;
  };
  const response = (r, value, status = 200) =>
    page.emit("response", {
      request: () => r,
      url: r.url,
      status: () => status,
      body: async () => Buffer.from(JSON.stringify(value)),
    });
  const mode = { select, after: 0, queryScope: "RECOVERY_COMPETENCE_MONTH" };
  return { page, observer, select, row, where, full, request, response, mode };
}
test("R10 scoped rows wait for newer admitted reads even before their headers", async () => {
  for (const kind of ["idLookup", "readRpc"]) {
    const f = await r10QueryFixture();
    f.response(f.request(), [f.row]);
    await f.observer.flush();
    await new Promise(setImmediate);
    const newer =
      kind === "idLookup"
        ? f.request({
            select: "id_contrato",
            id: "eq." + f.row.id,
            id_organizacao: "eq." + FIXTURE.organization,
          })
        : f.request(null, "rpc/consultar_permissoes_efetivas", {
            p_id_organizacao: FIXTURE.organization,
            p_id_contrato: FIXTURE.contract,
          });
    let settled = false;
    const reading = f.observer.read("competencias", f.where, f.mode).then((value) => {
      settled = true;
      return value;
    });
    await new Promise(setImmediate);
    try {
      assert.equal(settled, false, kind + " pending headers must block a scoped row result");
    } finally {
      f.response(
        newer,
        kind === "idLookup"
          ? { id_contrato: FIXTURE.contract }
          : { schema_versao: "rbac-v1", master: true, permissoes: [] },
      );
      f.response(f.request(), [f.row]);
      await reading;
      f.observer.close();
    }
  }
});

test("R10 initial body cannot authorize fill while another admitted request has no headers", async () => {
  const f = await r10QueryFixture();
  let pending,
    fill = 0,
    initialResolve;
  const initial = new Promise((resolve) => {
    initialResolve = resolve;
  });
  const io = {
    page: {
      getByLabel: () => ({
        fill: async () => {
          fill++;
          throw Error("TEST_STOP_AT_FILL");
        },
      }),
    },
    readBarrier: f.observer.readBarrier,
    assertReadBarrier: f.observer.assertReadBarrier,
    readBarrierRemaining: f.observer.readBarrierRemaining,
    drainReads: f.observer.drainReads,
    generation: f.observer.generation,
    observedAfter: f.observer.waitObservedAfter,
    read: f.observer.read,
    fresh: () => f.observer.flush(),
  };
  const task = sut
    .readCompetenceMonth(io, "2026-10-01", async () => {
      const q = { ...f.full };
      delete q.competencia_referencia;
      f.response(f.request(q), [f.row]);
      await f.observer.flush();
      pending = f.request(q);
      initialResolve();
    })
    .catch((error) => error);
  await initial;
  await new Promise(setImmediate);
  try {
    assert.equal(fill, 0, "pre-fill must drain every admitted request under the shared budget");
  } finally {
    f.response(pending, [f.row]);
    await task;
    f.observer.close();
  }
});
test("R10 seal records fatal unavailable for an admitted read that never reached headers", async () => {
  const f = await r10QueryFixture();
  f.request();
  await f.observer.seal();
  assert.deepEqual(f.observer.observationFailure(), {
    contractKind: "UNKNOWN",
    stage: "UNAVAILABLE",
    statusHTTP: "NONE",
    requestFailure: "UNAVAILABLE",
  });
  f.observer.close();
  await assert.rejects(() => f.observer.flush(), /OBSERVATION_FAILED/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
  symlinkSync,
  linkSync,
  mkdirSync,
  readFileSync,
  renameSync,
  lstatSync,
  utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  PIN,
  FILES,
  HISTORY,
  canonicalJson,
  validateRecords,
  validateObservationDiagnostic,
  validateDownloadOutput,
  validateMetadata,
  executeOfficialTool,
  buildProof,
  sha256,
} from "./inspect-fixture-artifact.mjs";

test("R20 original artifact pin is closed to the single terminal attempt", () => {
  assert.deepEqual(
    [PIN.run, PIN.head, PIN.upstream, PIN.artifact, PIN.size, PIN.name, PIN.digest],
    [
      42788354465,
      "79b728cb12e7b1df037c5816c27842c0ef042d2b",
      42788083679,
      13751191411,
      33862,
      "trilha-a-fixtures-42788354465-1",
      "142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536",
    ],
  );
});
test("R20 manifest appends exact R18 bytes while preserving all prior history", () => {
  assert.equal(FILES.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(-2), ["receipts-r18.json", "recovery-r18.json"]);
  assert.equal(
    HISTORY["receipts-r17.json"],
    "bed517a5a27f72f23dc07f869a1d4de21f1f24582fc4c725e9f747d8e603d82a",
  );
  assert.equal(
    HISTORY["recovery-r17.json"],
    "f3cf2c1eae15d5e7185ff665a8899f14898ed4b8b7188b5446646e7f2f0f1c95",
  );
});
function r18TechnicalReport() {
  const value = report();
  Object.assign(value.intentLedger, {
    count: 19,
    priorConfirmed: 17,
    priorReserved: 2,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 5,
  });
  Object.assign(value.recovery, { confirmedBefore: 17, maxNewIntentions: 5 });
  return value;
}
test("R20 budget preserves seventeen confirmations and two reservations with zero new arms", () => {
  const proof = validateRecords(r18TechnicalReport(), empty());
  assert.equal(proof.observations.priorConfirmed, 17);
  assert.equal(proof.observations.priorReserved, 2);
  assert.equal(proof.observations.newArmedCount, 0);
});
test("R18 immutable R17 history retains original budget and confirmed October receipt", (t) => {
  const original = canonicalJson(Buffer.from(HISTORICAL["recovery-r17.json"])).value;
  assert.equal(Object.keys(original).length, 12);
  assert.equal(Buffer.byteLength(HISTORICAL["recovery-r17.json"]), 6088);
  assert.equal(Buffer.byteLength(HISTORICAL["receipts-r17.json"]), 1293);
  assert.equal(original.receiptsRaw, HISTORICAL["receipts-r17.json"]);
  const ledger = JSON.parse(original.reportRaw).intentLedger;
  assert.deepEqual(
    [ledger.priorConfirmed, ledger.priorReserved, ledger.newArmedCount, ledger.maxNewIntentions],
    [14, 2, 1, 8],
  );
  const confirmed = JSON.parse(original.receiptsRaw).receipts.filter(
    (x) => x.state === "confirmed",
  );
  assert.deepEqual(
    confirmed.map((x) => [x.rpc, x.requestId, x.payloadSha256]),
    [
      [
        "aprovar_apresentacao",
        "5d657667-4c3b-4b4f-a953-d7e778bfb2c1",
        "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2",
      ],
    ],
  );
  assert.equal(JSON.parse(buildProof(fixture(t), inspection)).manifest.length, 30);
});
test("R20 rejects the former twenty-eight data layout before publishing any proof", (t) => {
  const root = fixture(t);
  for (const name of ["receipts-r18.json", "recovery-r18.json"]) rmSync(join(root, name));
  writeFileSync(
    join(root, "SHA256SUMS"),
    FILES.slice(0, -2)
      .map((name) => sha256(readFileSync(join(root, name))) + "  " + name + "\n")
      .join(""),
  );
  assert.throws(() => buildProof(root, inspection), /INSPECTION_FILES/);
});
for (const code of ["RECOVERY_R17_LEDGER", "RECOVERY_R17_PRESENTATION"]) {
  test("R18 admits only the exact producer diagnostic " + code, () => {
    const value = report();
    value.failure = code;
    value.diagnostics.primaryFailure = code;
    assert.doesNotThrow(() => validateRecords(value, empty()));
    value.failure = code + "_PRIVATE_CANARY";
    value.diagnostics.primaryFailure = value.failure;
    assert.throws(() => validateRecords(value, empty()));
  });
}
for (const mode of ["original UUID", "same payload under new UUID"]) {
  test("R18 permanently denies confirmed October approval: " + mode, () => {
    const value = report();
    value.intentLedger.count++;
    value.intentLedger.newArmedCount = 1;
    const receipt = {
      ...row(),
      rpc: "aprovar_apresentacao",
      ...(mode === "original UUID"
        ? { requestId: "5d657667-4c3b-4b4f-a953-d7e778bfb2c1" }
        : { payloadSha256: "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2" }),
    };
    assert.throws(() => validateRecords(value, { ...empty(), receipts: [receipt] }));
  });
}

// Technical projections only. These are not the unread R18 report or a business replay.
const BASE = {
  schema: "contaos.fixture.preparation.v1",
  failure: "OBSERVATION_FAILED",
  diagnostics: {
    primaryFailure: "OBSERVATION_FAILED",
    failureClass: "PROTOCOL",
    errorName: "Error",
    subphase: "RUNTIME_FRESH",
    subphasePath: [
      "COMPETENCIES",
      "COMPETENCY_UI",
      "COMPETENCY_RECONCILE",
      "COMPETENCY_RECONCILE",
      "COMPETENCY_UI",
      "COMPETENCY_UI",
      "COMPETENCY_UI",
      "RUNTIME_FRESH",
      "RUNTIME_FRESH",
    ],
    lastCompletedSubphase: "RUNTIME_FRESH",
    logoutAttempted: true,
    logoutVerified: true,
    cleanupFailure: null,
  },
  intentLedger: {
    count: 19,
    frozen: false,
    pending: false,
    sent: false,
    priorConfirmed: 17,
    priorReserved: 2,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 5,
  },
  recovery: {
    ledgerSha256: "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",
    priorWorkflowRun: "42540864527",
    confirmedBefore: 17,
    maxNewIntentions: 5,
    r3ReceiptsSha256: "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",
    r3WorkflowRun: "42559214436",
    r4ZeroAuth: {
      schema: "contaos.fixture.recovery-r4.v1",
      headSha: "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",
      upstreamRun: 42568309807,
      fixturesRun: 42568382053,
      auditRun: 42568382029,
      attempt: 1,
      derivedNewBusinessIntents: 0,
      proof: "GITHUB_ACTIONS_LIVE_METADATA",
    },
    reconciled: true,
    sourceVersion: "1ebbfd0b-c50c-405d-8806-321f18e179e0",
    sourceHash: "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1",
  },
  bindings: {
    sourceVersionId: "1ebbfd0b-c50c-405d-8806-321f18e179e0",
    listId: "bf71906b-87a4-42f5-8371-5f597ef2ad9b",
    listVersionId: "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",
    itemId: "e7065876-a620-4dbb-9b4e-992fa4fead83",
    organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
    contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
    source: "8b942e46-a29b-40d9-8ad4-04aaf9124a34",
    competencies: [
      {
        month: "2026-10-01",
        state: "partial",
        id: "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
        requirementId: "75938450-a972-410c-8612-da3ef7dc0e00",
        documentId: "c7f56ac9-81d6-45a4-81f8-db1383006c41",
        code: "COMPETENCE_DEPENDENCY_BLOCKED",
      },
      { month: "2026-09-01", state: "partial", code: "COMPETENCE_DEPENDENCY_BLOCKED" },
    ],
  },
  frontendSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
  harnessSha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
  deploymentId: "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
  workflowRun: "42788354465",
  phase: "FINAL_READBACK",
  completed: false,
  logoutVerified: true,
  ids: [
    "1ebbfd0b-c50c-405d-8806-321f18e179e0",
    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",
    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",
    "e7065876-a620-4dbb-9b4e-992fa4fead83",
    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",
    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
    "75938450-a972-410c-8612-da3ef7dc0e00",
    "c7f56ac9-81d6-45a4-81f8-db1383006c41",
  ],
  v1Certified: false,
};

const HISTORICAL = {
  "receipts-r1.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "866608620909bf313a6c2192736330222f9219ad",\n      "harnessSha": "fca0798d3eba81e8daa3a876a255f34b66ff39f9",\n      "deploymentId": "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",\n      "workflowRun": "42540864527",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_versao_fonte_v107",\n      "requestId": "08141ffd-56c1-4c50-b58f-32912d1006b2",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b27048ba9358c4dea53acf3dc7bc8ee855cc75d6795f7ea7fa2b67681c7c7467"\n    },\n    {\n      "frontendSha": "866608620909bf313a6c2192736330222f9219ad",\n      "harnessSha": "fca0798d3eba81e8daa3a876a255f34b66ff39f9",\n      "deploymentId": "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",\n      "workflowRun": "42540864527",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_versao_fonte_v107",\n      "requestId": "08141ffd-56c1-4c50-b58f-32912d1006b2",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b27048ba9358c4dea53acf3dc7bc8ee855cc75d6795f7ea7fa2b67681c7c7467"\n    },\n    {\n      "frontendSha": "866608620909bf313a6c2192736330222f9219ad",\n      "harnessSha": "fca0798d3eba81e8daa3a876a255f34b66ff39f9",\n      "deploymentId": "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",\n      "workflowRun": "42540864527",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_versao_fonte_v107",\n      "requestId": "437a3c66-4bed-45e3-b73e-8696bdf4a791",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "e02b9e79eac299f949cfd95f2da29b415efad1249c8c5447b49f59110a197769"\n    },\n    {\n      "frontendSha": "866608620909bf313a6c2192736330222f9219ad",\n      "harnessSha": "fca0798d3eba81e8daa3a876a255f34b66ff39f9",\n      "deploymentId": "dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY",\n      "workflowRun": "42540864527",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_versao_fonte_v107",\n      "requestId": "437a3c66-4bed-45e3-b73e-8696bdf4a791",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "e02b9e79eac299f949cfd95f2da29b415efad1249c8c5447b49f59110a197769"\n    }\n  ]\n}\n',
  "recovery-r2.json":
    '{\n  "schema": "contaos.fixture.recovery-r2.v1",\n  "workflowRun": "42553093050",\n  "artifactId": "13645999071",\n  "requestId": "trilha-a-fixtures-20261109-r2",\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "bc14a9e232bf5abab07f71635866ea586e4ade37",\n  "zipSha256": "c6b33596bd1454388d0989506c74ccbaece749d0c4bcf0b45fbdb0f692927475",\n  "reportSha256": "d986f375e1cba68be5f78b61544d241ef5f4c71f126611112c960226a939e805",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "derivedIntentCount": 0,\n  "proof": "receipts+brokerInvariant+sourcePath",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"PREPARER_TIMEOUT\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"PREPARER_TIMEOUT\\",\\n    \\"failureClass\\": \\"TIMEOUT\\",\\n    \\"errorName\\": \\"TimeoutError\\",\\n    \\"subphase\\": \\"SOURCE_FORM_FIELD\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\",\\n      \\"SOURCE_FORM_FIELD\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"SOURCE_UI_CONTROL\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": false,\\n    \\"cleanupFailure\\": \\"LOGOUT_FAILED\\"\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 2,\\n    \\"maxNewIntentions\\": 22,\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"bc14a9e232bf5abab07f71635866ea586e4ade37\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42553093050\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": false,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n"\n}\n',
  "receipts-r3.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    }\n  ]\n}\n',
  "recovery-r3.json":
    '{\n  "schema": "contaos.fixture.recovery-r3.v1",\n  "workflowRun": "42559214436",\n  "artifactId": "13648722477",\n  "requestId": "trilha-a-fixtures-20261109-r3",\n  "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n  "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n  "zipSha256": "44cd6eec0dcec9cf5ceaa2283d8a07b04cf64e8c1391ad2c6a5aaed32104c560",\n  "reportSha256": "e1d0cabcd5aeec18a695627c5b06ef49e36dba262117390e1fddb8ec04555931",\n  "receiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"FLOW_ACTIVE_NOT_READBACK\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"FLOW_ACTIVE_NOT_READBACK\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"SOURCE_AND_LIST\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"SOURCE_RECONCILE\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 2,\\n    \\"maxNewIntentions\\": 22,\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"104f8e96e79c5c7b1b2307a57a5ec726fb3cc595\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42559214436\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"104f8e96e79c5c7b1b2307a57a5ec726fb3cc595\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42559214436\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"salvar_fonte_normativa_v107\\",\\n      \\"requestId\\": \\"309caf6c-5551-4e2b-ae33-4607a95ea025\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"104f8e96e79c5c7b1b2307a57a5ec726fb3cc595\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42559214436\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"salvar_fonte_normativa_v107\\",\\n      \\"requestId\\": \\"309caf6c-5551-4e2b-ae33-4607a95ea025\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34\\"\\n    }\\n  ]\\n}\\n",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "104f8e96e79c5c7b1b2307a57a5ec726fb3cc595",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42559214436",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "salvar_fonte_normativa_v107",\n      "requestId": "309caf6c-5551-4e2b-ae33-4607a95ea025",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c477003da4693011c3822985da92a78bb495f31236f3d99e22593c81d5297d34"\n    }\n  ]\n}\n',
  "receipts-r5.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "da4e924e-2ed1-4ccd-b847-fc95a44cc383",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "da4e924e-2ed1-4ccd-b847-fc95a44cc383",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "31ddaf25-fb66-4cdc-be84-8612e77b17dc",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "31ddaf25-fb66-4cdc-be84-8612e77b17dc",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "cf429997-d0b6-45bd-880a-be4b103f79bb",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "executar_comando_lista_v1",\n      "requestId": "cf429997-d0b6-45bd-880a-be4b103f79bb",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "499dc2a2-c0a2-4a19-9ccb-11c534096f7e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "499dc2a2-c0a2-4a19-9ccb-11c534096f7e",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "655ae00f-ed36-4a13-a637-bc8b77375783",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42578223154",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_competencia",\n      "requestId": "655ae00f-ed36-4a13-a637-bc8b77375783",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415"\n    }\n  ]\n}\n',
  "recovery-r5.json":
    '{\n  "schema": "contaos.fixture.recovery-r5.v1",\n  "workflowRun": "42578223154",\n  "artifactId": "13656530451",\n  "requestId": "trilha-a-fixtures-20261109-r5",\n  "harnessSha": "3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d",\n  "zipSha256": "5380c9c1a5b18e75e7a0e09e41902c826eae0a9cb1f9589f7f34a819f463985b",\n  "reportSha256": "c631d266351fa609600dbcdbe60f1d1a54d8fac76e740c10d80017277a6f55ba",\n  "receiptsSha256": "fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"PREPARER_INCOMPLETE\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"PREPARER_INCOMPLETE\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"PREFLIGHT\\",\\n    \\"subphasePath\\": [],\\n    \\"lastCompletedSubphase\\": \\"PREFLIGHT\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 8,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 3,\\n    \\"newArmedCount\\": 5,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 21\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 3,\\n    \\"maxNewIntentions\\": 21,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42578223154\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"da4e924e-2ed1-4ccd-b847-fc95a44cc383\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"da4e924e-2ed1-4ccd-b847-fc95a44cc383\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"31ddaf25-fb66-4cdc-be84-8612e77b17dc\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"31ddaf25-fb66-4cdc-be84-8612e77b17dc\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"cf429997-d0b6-45bd-880a-be4b103f79bb\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"executar_comando_lista_v1\\",\\n      \\"requestId\\": \\"cf429997-d0b6-45bd-880a-be4b103f79bb\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_competencia\\",\\n      \\"requestId\\": \\"499dc2a2-c0a2-4a19-9ccb-11c534096f7e\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_competencia\\",\\n      \\"requestId\\": \\"499dc2a2-c0a2-4a19-9ccb-11c534096f7e\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_competencia\\",\\n      \\"requestId\\": \\"655ae00f-ed36-4a13-a637-bc8b77375783\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42578223154\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_competencia\\",\\n      \\"requestId\\": \\"655ae00f-ed36-4a13-a637-bc8b77375783\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415\\"\\n    }\\n  ]\\n}\\n"\n}\n',
  "receipts-r6.json": '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  "recovery-r6.json":
    '{\n  "schema": "contaos.fixture.recovery-r6.v1",\n  "workflowRun": "42585173702",\n  "artifactId": "13658434738",\n  "requestId": "trilha-a-fixtures-20261109-r6",\n  "harnessSha": "9cd01a472146c67c4a3cae5f3d9a6b5d7448716a",\n  "zipSha256": "10e55ed5856aac2879188ab5f2df3b1f4a98b180de21dd7abcb470c162f9d68c",\n  "reportSha256": "8fd354bf2177f47a7b124a9d53e606de91880a45b2d94daebe46185403ebbeff",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"FLOW_BUTTON_UNAVAILABLE\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"FLOW_BUTTON_UNAVAILABLE\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"SOURCE_UI_CONTROL\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\",\\n      \\"RECOVERY_READ\\",\\n      \\"SOURCE_UI_CONTROL\\",\\n      \\"SOURCE_UI_CONTROL\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"SOURCE_UI_CONTROL\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 8,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 8,\\n    \\"newArmedCount\\": 0,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 16\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 8,\\n    \\"maxNewIntentions\\": 16,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": false,\\n    \\"sourceVersion\\": null,\\n    \\"sourceHash\\": null\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"9cd01a472146c67c4a3cae5f3d9a6b5d7448716a\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42585173702\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n"\n}\n',
  "recovery-r7.json":
    '{\n  "schema": "contaos.fixture.recovery-r7.v1",\n  "headSha": "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",\n  "upstreamRun": 42601246471,\n  "fixturesRun": 42601383933,\n  "auditRun": 42601384052,\n  "privateJob": 129106715983,\n  "attempt": 1,\n  "derivedNewBusinessIntents": 0,\n  "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n}\n',
  "receipts-r8.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "6d730eb7-8c38-4474-813d-d39672454444",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "6d730eb7-8c38-4474-813d-d39672454444",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42611391440",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1"\n    }\n  ]\n}\n',
  "recovery-r8.json":
    '{\n  "schema": "contaos.fixture.recovery-r8.v1",\n  "workflowRun": "42611391440",\n  "artifactId": "13670961904",\n  "requestId": "trilha-a-fixtures-20261109-r8",\n  "harnessSha": "dea3ab73c9b47de1126054380b002c37b060ff84",\n  "zipSha256": "698e58fe9184b194cc1866b4c119d4df45ba23ccc5704665469a99793cce2fa9",\n  "reportSha256": "e913478993f895726f9e207c975533ee4a6fd3d9dac8dd0a319919fcf06c67cb",\n  "receiptsSha256": "20af329dd9c441e4ede575fa6cb94a65c3d136ad777613170045c696328fad25",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"OBSERVATION_FAILED\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"OBSERVATION_FAILED\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"RUNTIME_FRESH\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_RECONCILE\\",\\n      \\"COMPETENCY_RECONCILE\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"RUNTIME_FRESH\\",\\n      \\"RUNTIME_FRESH\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"RUNTIME_FRESH\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 10,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 8,\\n    \\"newArmedCount\\": 2,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 16\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 8,\\n    \\"maxNewIntentions\\": 16,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"dea3ab73c9b47de1126054380b002c37b060ff84\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42611391440\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"dea3ab73c9b47de1126054380b002c37b060ff84\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42611391440\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_documento_competencia_v115\\",\\n      \\"requestId\\": \\"6d730eb7-8c38-4474-813d-d39672454444\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"dea3ab73c9b47de1126054380b002c37b060ff84\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42611391440\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_documento_competencia_v115\\",\\n      \\"requestId\\": \\"6d730eb7-8c38-4474-813d-d39672454444\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"c9418ddaaa3e21de73da0a62acc2a945b3c9bf8c12107cadf4f4bfc518cf4154\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"dea3ab73c9b47de1126054380b002c37b060ff84\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42611391440\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_analise_competencia\\",\\n      \\"requestId\\": \\"a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"dea3ab73c9b47de1126054380b002c37b060ff84\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42611391440\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_analise_competencia\\",\\n      \\"requestId\\": \\"a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"f26357fe955a3312c19cf8a1a678c545da95c8f330a272bc08f8aec964c7ffb1\\"\\n    }\\n  ]\\n}\\n"\n}\n',
  "receipts-r9.json": '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  "recovery-r9.json":
    '{\n  "schema": "contaos.fixture.recovery-r9.v1",\n  "workflowRun": "42621964900",\n  "artifactId": "13676832673",\n  "requestId": "trilha-a-fixtures-20261109-r9",\n  "harnessSha": "2ed3097691f39025b49a015d86223da61a2b45e5",\n  "zipSha256": "89a35fb6de1e437a93c8074cb563745108d5e968878d929c8663dcaff700f500",\n  "reportSha256": "4163c5266ed9715ceafa3650af55a42348636cfbccceb9c8f124b55ab1eac31e",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "observationSha256": "6beb2ab824c183a65b1bd7334a4a6ab7ca878a0c6cab999a32dfd39a4ec5cad6",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"OBSERVATION_FAILED\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"OBSERVATION_FAILED\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"RUNTIME_FRESH\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\",\\n      \\"RECOVERY_READ\\",\\n      \\"RECOVERY_READ\\",\\n      \\"RUNTIME_FRESH\\",\\n      \\"RUNTIME_FRESH\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"RUNTIME_FRESH\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 10,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 10,\\n    \\"newArmedCount\\": 0,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 14\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 14,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": false,\\n    \\"sourceVersion\\": null,\\n    \\"sourceHash\\": null\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"2ed3097691f39025b49a015d86223da61a2b45e5\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42621964900\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"2ed3097691f39025b49a015d86223da61a2b45e5\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42621964900\\",\\n  \\"firstFailure\\": {\\n    \\"contractKind\\": \\"TABLE:competencias\\",\\n    \\"stage\\": \\"BODY_READ\\",\\n    \\"statusHTTP\\": 200,\\n    \\"requestFailure\\": \\"ABORTED\\"\\n  }\\n}\\n"\n}\n',
  "receipts-r10.json": '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  "recovery-r10.json":
    '{\n  "schema": "contaos.fixture.recovery-r10.v1",\n  "workflowRun": "42638883189",\n  "artifactId": "13683268867",\n  "requestId": "trilha-a-fixtures-20261109-r10",\n  "harnessSha": "a3a5df2b4e99705d214a509ba035f155c7ae8de9",\n  "zipSha256": "b306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43",\n  "reportSha256": "858c21b7eb05e379f6c92dd84cc5f7afe0d75406ab105d3b279b2f0d53703ef2",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "observationSha256": "0b11018aae5529f19ccb6476bf8b1202f3a7e9ba8fab8811252a48b2904ddecf",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"OBSERVATION_FAILED\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"OBSERVATION_FAILED\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"RUNTIME_FRESH\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"RUNTIME_FRESH\\",\\n      \\"RUNTIME_FRESH\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"RUNTIME_FRESH\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 10,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 10,\\n    \\"newArmedCount\\": 0,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 14\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 14,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"a3a5df2b4e99705d214a509ba035f155c7ae8de9\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42638883189\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"a3a5df2b4e99705d214a509ba035f155c7ae8de9\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42638883189\\",\\n  \\"firstFailure\\": {\\n    \\"contractKind\\": \\"RPC:obter_analise_competencia_v116\\",\\n    \\"stage\\": \\"RESPONSE_PROJECTION\\",\\n    \\"statusHTTP\\": \\"NONE\\",\\n    \\"requestFailure\\": \\"NONE\\"\\n  }\\n}\\n"\n}\n',
  "receipts-r11.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42650825191",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "af968191-7d60-4adb-9c60-ebd5f0741e8e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d"\n    },\n    {\n      "frontendSha": "437c788e32f0325dd15c9d2e7277c10129bcb462",\n      "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n      "deploymentId": "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",\n      "workflowRun": "42650825191",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "af968191-7d60-4adb-9c60-ebd5f0741e8e",\n      "state": "uncertain",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d"\n    }\n  ]\n}\n',
  "recovery-r11.json":
    '{\n  "schema": "contaos.fixture.recovery-r11.v1",\n  "workflowRun": "42650825191",\n  "artifactId": "13690462160",\n  "requestId": "trilha-a-fixtures-20261109-r11",\n  "harnessSha": "7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e",\n  "zipSha256": "eb445aadc6876e116040946157c2c4a1bd6bfd79f494945649dbd63e6d74eb50",\n  "reportSha256": "fcee36850806601be988dedf4afe49fe10e6fccc6640f2b7e0a63a870541dc1a",\n  "receiptsSha256": "603a302a92902da2978ddabb20d7972dd9713d39d8838024bfaa89cfb1af33e8",\n  "observationSha256": "59eb0943c77cbcc75e0e022d3ebb75cc74384faf73c5f64e6b5dc2cb29059a47",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"PHASE_TIMEOUT\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"PHASE_TIMEOUT\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"COMPETENCY_GET\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_COMMAND\\",\\n      \\"RUNTIME_FRESH\\",\\n      \\"UI_CONFIRM_AFTER\\",\\n      \\"PREFLIGHT\\",\\n      \\"COMPETENCY_RECONCILE\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_GET\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"COMPETENCY_UI\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 11,\\n    \\"frozen\\": true,\\n    \\"pending\\": true,\\n    \\"sent\\": true,\\n    \\"priorConfirmed\\": 10,\\n    \\"newArmedCount\\": 1,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 14\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 14,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"executionId\\": \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42650825191\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n    \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42650825191\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_parecer_interno\\",\\n      \\"requestId\\": \\"af968191-7d60-4adb-9c60-ebd5f0741e8e\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n      \\"harnessSha\\": \\"7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e\\",\\n      \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n      \\"workflowRun\\": \\"42650825191\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_parecer_interno\\",\\n      \\"requestId\\": \\"af968191-7d60-4adb-9c60-ebd5f0741e8e\\",\\n      \\"state\\": \\"uncertain\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d\\"\\n    }\\n  ]\\n}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"437c788e32f0325dd15c9d2e7277c10129bcb462\\",\\n  \\"harnessSha\\": \\"7c6fd9fbbe488fd24f37681e8a8aaa8b3c20d53e\\",\\n  \\"deploymentId\\": \\"dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp\\",\\n  \\"workflowRun\\": \\"42650825191\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n',
  "receipts-r13.json": '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  "recovery-r13.json":
    '{\n  "schema": "contaos.fixture.recovery-r13.v1",\n  "workflowRun": "42685547737",\n  "artifactId": "13704636643",\n  "requestId": "trilha-a-fixtures-20261109-r13",\n  "harnessSha": "f39e32ca1009b23aaae19dcbd01e282df2bf0847",\n  "zipSha256": "7d097d83d5b622d4277be39d2155800223e18fccfe9258ba1adabf337c1e5307",\n  "reportSha256": "877dca165c4d46a61b8f5ea1946a6a223ceb17e9b64b9ef4067d8e24d5b7aa81",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "observationSha256": "f6f4ea8b51e4ec9ab3e8aca8e4fb6c3367d808174e884ca4c6119d6a06c33aeb",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"FLOW_LIST_UI_MISSING\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"FLOW_LIST_UI_MISSING\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"LIST_UI_CONTROL\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\",\\n      \\"LIST_UI_CONTROL\\",\\n      \\"LIST_UI_CONTROL\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"LIST_GET\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 11,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 10,\\n    \\"priorReserved\\": 1,\\n    \\"newArmedCount\\": 0,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 13\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 13,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"f39e32ca1009b23aaae19dcbd01e282df2bf0847\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42685547737\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"f39e32ca1009b23aaae19dcbd01e282df2bf0847\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42685547737\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n',
  "receipts-r15.json":
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42703523206",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "6e6b6afb-2216-42ef-bd89-571301e97e1f",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42703523206",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "6e6b6afb-2216-42ef-bd89-571301e97e1f",\n      "state": "uncertain",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3"\n    }\n  ]\n}\n',
  "recovery-r15.json":
    '{\n  "schema": "contaos.fixture.recovery-r15.v1",\n  "workflowRun": "42703523206",\n  "artifactId": "13713326447",\n  "requestId": "trilha-a-fixtures-20261109-r15",\n  "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n  "zipSha256": "49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262",\n  "reportSha256": "038d291631f6d0badc89c014cbfbb137557a780039fb16b8d5c1fc9e53dee3c6",\n  "receiptsSha256": "3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007",\n  "observationSha256": "fc97c8e25c55840331737b307680f9846b11f0b2e455a04154230a99b455a614",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"OBSERVATION_FAILED\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"OBSERVATION_FAILED\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"RUNTIME_FRESH\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_COMMAND\\",\\n      \\"RUNTIME_FRESH\\",\\n      \\"UI_CONFIRM_FENCE\\",\\n      \\"RUNTIME_FRESH\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"RUNTIME_FRESH\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 12,\\n    \\"frozen\\": true,\\n    \\"pending\\": true,\\n    \\"sent\\": true,\\n    \\"priorConfirmed\\": 10,\\n    \\"priorReserved\\": 1,\\n    \\"newArmedCount\\": 1,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 13\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 13,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"executionId\\": \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"dd895a5c30acbb39c821153d86477985ae94b939\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42703523206\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n    \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"dd895a5c30acbb39c821153d86477985ae94b939\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42703523206\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_parecer_interno\\",\\n      \\"requestId\\": \\"6e6b6afb-2216-42ef-bd89-571301e97e1f\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"dd895a5c30acbb39c821153d86477985ae94b939\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42703523206\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_parecer_interno\\",\\n      \\"requestId\\": \\"6e6b6afb-2216-42ef-bd89-571301e97e1f\\",\\n      \\"state\\": \\"uncertain\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3\\"\\n    }\\n  ]\\n}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"dd895a5c30acbb39c821153d86477985ae94b939\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42703523206\\",\\n  \\"firstFailure\\": {\\n    \\"contractKind\\": \\"RPC:aprovar_parecer_interno\\",\\n    \\"stage\\": \\"RESPONSE_PROJECTION\\",\\n    \\"statusHTTP\\": \\"NONE\\",\\n    \\"requestFailure\\": \\"NONE\\"\\n  }\\n}\\n"\n}\n',
};

HISTORICAL["receipts-r16.json"] =
  '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "d69325a4-78c8-4bf3-8831-cbef2fb38d95",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "d69325a4-78c8-4bf3-8831-cbef2fb38d95",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "368de7ea-0056-451a-b0da-30ee0e10ee62",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "368de7ea-0056-451a-b0da-30ee0e10ee62",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "57cde7b2-3ae8-4642-81fe-d45f4971a524",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "57cde7b2-3ae8-4642-81fe-d45f4971a524",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "fb2af693-ede5-4d1a-99d3-408a2f7cb79e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "fb2af693-ede5-4d1a-99d3-408a2f7cb79e",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395"\n    }\n  ]\n}\n';
HISTORICAL["recovery-r16.json"] =
  '{\n  "schema": "contaos.fixture.recovery-r16.v1",\n  "workflowRun": "42713640896",\n  "artifactId": "13717457216",\n  "requestId": "trilha-a-fixtures-20261109-r16",\n  "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n  "zipSha256": "39eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305",\n  "reportSha256": "f93d7b7a5dd9ffc7a65a13a52b399be61830113528af1bc081ed5a83f37938b2",\n  "receiptsSha256": "3700fce7ae66a58fa7f3c9d1a30d11f10eda794d41c0a1ff2e4302ca9645e4b6",\n  "observationSha256": "3a270be6970c5e46168c33d53b2ea245ab722cd954713e1f9dd9d312c796fcb8",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"COMPETENCE_PRESENTATION_GATE\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"COMPETENCE_PRESENTATION_GATE\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"COMPETENCY_UI\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"COMPETENCY_RECONCILE\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 16,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 10,\\n    \\"priorReserved\\": 2,\\n    \\"newArmedCount\\": 4,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 12\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 12,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"executionId\\": \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n        \\"opinionId\\": \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\",\\n        \\"code\\": \\"COMPETENCE_PRESENTATION_GATE\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\",\\n        \\"requirementId\\": \\"c824a6f9-e519-44cc-8911-87d1009e2eaf\\",\\n        \\"documentId\\": \\"cd1624d3-73f7-4ea1-b317-c52627df6824\\",\\n        \\"executionId\\": \\"00da4236-810f-4a89-8be5-b2ffcd50a480\\",\\n        \\"opinionId\\": \\"7bbbe81e-e34c-44dc-a76f-ed85fd56d87f\\",\\n        \\"code\\": \\"COMPETENCE_PRESENTATION_GATE\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42713640896\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n    \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n    \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\",\\n    \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\",\\n    \\"c824a6f9-e519-44cc-8911-87d1009e2eaf\\",\\n    \\"cd1624d3-73f7-4ea1-b317-c52627df6824\\",\\n    \\"00da4236-810f-4a89-8be5-b2ffcd50a480\\",\\n    \\"7bbbe81e-e34c-44dc-a76f-ed85fd56d87f\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_documento_competencia_v115\\",\\n      \\"requestId\\": \\"d69325a4-78c8-4bf3-8831-cbef2fb38d95\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"criar_documento_competencia_v115\\",\\n      \\"requestId\\": \\"d69325a4-78c8-4bf3-8831-cbef2fb38d95\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_analise_competencia\\",\\n      \\"requestId\\": \\"368de7ea-0056-451a-b0da-30ee0e10ee62\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_analise_competencia\\",\\n      \\"requestId\\": \\"368de7ea-0056-451a-b0da-30ee0e10ee62\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_parecer_interno\\",\\n      \\"requestId\\": \\"57cde7b2-3ae8-4642-81fe-d45f4971a524\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"solicitar_parecer_interno\\",\\n      \\"requestId\\": \\"57cde7b2-3ae8-4642-81fe-d45f4971a524\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_parecer_interno\\",\\n      \\"requestId\\": \\"fb2af693-ede5-4d1a-99d3-408a2f7cb79e\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42713640896\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_parecer_interno\\",\\n      \\"requestId\\": \\"fb2af693-ede5-4d1a-99d3-408a2f7cb79e\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395\\"\\n    }\\n  ]\\n}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"10cac45b655d5eece9881fdf83545887c371d548\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42713640896\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n';

HISTORICAL["receipts-r17.json"] =
  '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42724239916",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "5d657667-4c3b-4b4f-a953-d7e778bfb2c1",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42724239916",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "5d657667-4c3b-4b4f-a953-d7e778bfb2c1",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2"\n    }\n  ]\n}\n';
HISTORICAL["recovery-r17.json"] =
  '{\n  "schema": "contaos.fixture.recovery-r17.v1",\n  "workflowRun": "42724239916",\n  "artifactId": "13722355410",\n  "requestId": "trilha-a-fixtures-20261109-r17",\n  "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n  "zipSha256": "438158228c2c8f3ad4893574cda06d62f9c47393202e200274a693ad420cc6ff",\n  "reportSha256": "8565ec68be1b94344ecaaa3ac2688076587ba446d4c0f3acbdf5cf34aa73c594",\n  "receiptsSha256": "bed517a5a27f72f23dc07f869a1d4de21f1f24582fc4c725e9f747d8e603d82a",\n  "observationSha256": "9d6bb4c7de28c4f2dd8563d775d7618deb52e1b96b6fdbfea2b9f0f7defa5f6a",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"PREPARER_SPA_LINK\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"PREPARER_SPA_LINK\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"COMPETENCY_UI\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_UI\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"PREFLIGHT\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 17,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 14,\\n    \\"priorReserved\\": 2,\\n    \\"newArmedCount\\": 1,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 8\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 14,\\n    \\"maxNewIntentions\\": 8,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"pode_apresentar_contratante\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"executionId\\": \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n        \\"opinionId\\": \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"adaeb72504cadf6dd83b8938abba9c067acba525\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42724239916\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n    \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n    \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"adaeb72504cadf6dd83b8938abba9c067acba525\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42724239916\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_apresentacao\\",\\n      \\"requestId\\": \\"5d657667-4c3b-4b4f-a953-d7e778bfb2c1\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"adaeb72504cadf6dd83b8938abba9c067acba525\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42724239916\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_apresentacao\\",\\n      \\"requestId\\": \\"5d657667-4c3b-4b4f-a953-d7e778bfb2c1\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2\\"\\n    }\\n  ]\\n}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"adaeb72504cadf6dd83b8938abba9c067acba525\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42724239916\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n';

HISTORICAL["receipts-r18.json"] =
  '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "dd8e544b-af5b-4e23-bef2-b7c9ae2d0096",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "dd8e544b-af5b-4e23-bef2-b7c9ae2d0096",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_apresentacao",\n      "requestId": "40546f93-f8f4-4686-a78a-11aa3069eda7",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_apresentacao",\n      "requestId": "40546f93-f8f4-4686-a78a-11aa3069eda7",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a"\n    }\n  ]\n}\n';
HISTORICAL["recovery-r18.json"] =
  '{\n  "schema": "contaos.fixture.recovery-r18.v1",\n  "workflowRun": "42731273678",\n  "artifactId": "13725830880",\n  "requestId": "trilha-a-fixtures-20261110-r18",\n  "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n  "zipSha256": "b68f2edd99a4ce6e4728b74a899cd39bb1ec96f0ecd42048cbbdbbc6d47fb7eb",\n  "reportSha256": "c3ef3286f2e49d17226f4b747188a6959b9dcc11997a3cae251cbd0d7dac4590",\n  "receiptsSha256": "1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77",\n  "observationSha256": "f03ea467e40803a792ac4606e35e8f15de5d2fd5746d72428eb732509c57662f",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"PHASE_TIMEOUT\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"PHASE_TIMEOUT\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"COMPETENCY_GET\\",\\n    \\"subphasePath\\": [\\n      \\"COMPETENCIES\\",\\n      \\"COMPETENCY_UI\\",\\n      \\"COMPETENCY_RECONCILE\\",\\n      \\"COMPETENCY_GET\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"COMPETENCY_UI\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 19,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 15,\\n    \\"priorReserved\\": 2,\\n    \\"newArmedCount\\": 2,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 7\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 15,\\n    \\"maxNewIntentions\\": 7,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": {\\n    \\"sourceVersionId\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"listId\\": \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"listVersionId\\": \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"itemId\\": \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"source\\": \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"competencies\\": [\\n      {\\n        \\"month\\": \\"2026-10-01\\",\\n        \\"state\\": \\"pode_apresentar_contratante\\",\\n        \\"id\\": \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n        \\"requirementId\\": \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n        \\"documentId\\": \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n        \\"executionId\\": \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n        \\"opinionId\\": \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\"\\n      },\\n      {\\n        \\"month\\": \\"2026-09-01\\",\\n        \\"state\\": \\"partial\\",\\n        \\"id\\": \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\",\\n        \\"requirementId\\": \\"c824a6f9-e519-44cc-8911-87d1009e2eaf\\",\\n        \\"documentId\\": \\"cd1624d3-73f7-4ea1-b317-c52627df6824\\",\\n        \\"executionId\\": \\"00da4236-810f-4a89-8be5-b2ffcd50a480\\",\\n        \\"opinionId\\": \\"7bbbe81e-e34c-44dc-a76f-ed85fd56d87f\\",\\n        \\"code\\": \\"COMPETENCE_DEPENDENCY_BLOCKED\\"\\n      }\\n    ]\\n  },\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42731273678\\",\\n  \\"phase\\": \\"FINAL_READBACK\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [\\n    \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"bf71906b-87a4-42f5-8371-5f597ef2ad9b\\",\\n    \\"e49ef6dd-13b0-491d-8646-5a7bcd5298cf\\",\\n    \\"e7065876-a620-4dbb-9b4e-992fa4fead83\\",\\n    \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n    \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n    \\"8b942e46-a29b-40d9-8ad4-04aaf9124a34\\",\\n    \\"50c26274-a36f-48e0-b2fe-5a1caf5d6a49\\",\\n    \\"75938450-a972-410c-8612-da3ef7dc0e00\\",\\n    \\"c7f56ac9-81d6-45a4-81f8-db1383006c41\\",\\n    \\"3c174678-a6ec-4415-9d25-6e8a859de2cb\\",\\n    \\"9ec80151-bbf6-4469-9cd8-7d96d1bb02cd\\",\\n    \\"79bdc139-ed10-4c91-905e-b32b9a824d27\\",\\n    \\"c824a6f9-e519-44cc-8911-87d1009e2eaf\\",\\n    \\"cd1624d3-73f7-4ea1-b317-c52627df6824\\",\\n    \\"00da4236-810f-4a89-8be5-b2ffcd50a480\\",\\n    \\"7bbbe81e-e34c-44dc-a76f-ed85fd56d87f\\"\\n  ],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\n  \\"schema\\": \\"contaos.fixture.receipts.v1\\",\\n  \\"receipts\\": [\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42731273678\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_apresentacao\\",\\n      \\"requestId\\": \\"dd8e544b-af5b-4e23-bef2-b7c9ae2d0096\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42731273678\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"aprovar_apresentacao\\",\\n      \\"requestId\\": \\"dd8e544b-af5b-4e23-bef2-b7c9ae2d0096\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42731273678\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"registrar_apresentacao\\",\\n      \\"requestId\\": \\"40546f93-f8f4-4686-a78a-11aa3069eda7\\",\\n      \\"state\\": \\"sealed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a\\"\\n    },\\n    {\\n      \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n      \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n      \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n      \\"workflowRun\\": \\"42731273678\\",\\n      \\"schema\\": \\"contaos.fixture.intent.v1\\",\\n      \\"rpc\\": \\"registrar_apresentacao\\",\\n      \\"requestId\\": \\"40546f93-f8f4-4686-a78a-11aa3069eda7\\",\\n      \\"state\\": \\"confirmed\\",\\n      \\"organization\\": \\"e87f7e68-c5ae-4077-943b-02a4afd8b6ee\\",\\n      \\"contract\\": \\"be89ef7e-d839-46c0-9cfb-4da81edf8b74\\",\\n      \\"payloadSha256\\": \\"1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a\\"\\n    }\\n  ]\\n}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"8d055951838fee29664563bed5ee26bac4f55bd8\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42731273678\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n';
const empty = () => ({ schema: "contaos.fixture.receipts.v1", receipts: [] });
const clone = (v) => structuredClone(v);
const report = () => clone(BASE);
const text = (v) => JSON.stringify(v, null, 2) + "\n";
const receiptText = (v) =>
  JSON.stringify(v.receipts.length ? v : v, null, v.receipts.length ? 2 : undefined) + "\n";
const downloaded = () => ({
  status: 0,
  stdout: "SHA256 digest of downloaded artifact is " + PIN.digest + "\n",
  stderr: "",
});
const inspection = { run: "123456", head: "a".repeat(40) };
function fixture(t, mutate = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "r6-inspection-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const content = {
    ...HISTORICAL,
    "report.json": text(report()),
    "receipts.json": receiptText(empty()),
    "observation-diagnostic.json": text(observation()),
  };
  mutate(content);
  for (const [name, raw] of Object.entries(content)) writeFileSync(join(root, name), raw);
  writeFileSync(
    join(root, "SHA256SUMS"),
    FILES.map((n) => sha256(Buffer.from(content[n])) + "  " + n + "\n").join(""),
  );
  return root;
}
function observation(firstFailure = null) {
  return {
    schema: "contaos.fixture.observation.v1",
    frontendSha: PIN.frontend,
    harnessSha: PIN.head,
    deploymentId: PIN.deployment,
    workflowRun: String(PIN.run),
    firstFailure,
  };
}

function row(state = "sealed") {
  return {
    frontendSha: PIN.frontend,
    harnessSha: PIN.head,
    deploymentId: PIN.deployment,
    workflowRun: String(PIN.run),
    schema: "contaos.fixture.intent.v1",
    rpc: "solicitar_analise_competencia",
    requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    state,
    organization: PIN.organization,
    contract: PIN.contract,
    payloadSha256: "b".repeat(64),
  };
}
function metadataFixture() {
  const repo = {
    id: PIN.repositoryId,
    full_name: PIN.repository,
    owner: { login: "contaos999999", id: 352205055 },
  };
  const common = {
    head_branch: "main",
    head_sha: PIN.head,
    run_attempt: 1,
    status: "completed",
    repository: repo,
    head_repository: repo,
  };
  const run = {
    ...common,
    id: PIN.run,
    workflow_id: PIN.workflow,
    event: "workflow_run",
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    conclusion: "success",
  };
  const upstream = {
    ...common,
    id: PIN.upstream,
    workflow_id: 406076025,
    event: "push",
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    conclusion: "success",
  };
  const artifact = {
    id: PIN.artifact,
    name: PIN.name,
    size_in_bytes: PIN.size,
    expired: false,
    digest: "sha256:" + PIN.digest,
    workflow_run: {
      id: PIN.run,
      repository_id: PIN.repositoryId,
      head_repository_id: PIN.repositoryId,
      head_sha: PIN.head,
      head_branch: "main",
    },
  };
  const jobs = {
    total_count: 3,
    jobs: [
      [129735171394, "Trilha A solicitacao unica sem credenciais", "success"],
      [129735173939, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
      [129735702128, "Trilha A preparacao sintetica HML", "success"],
    ].map(([id, name, conclusion]) => ({
      id,
      name,
      conclusion,
      status: "completed",
      run_id: PIN.run,
      run_attempt: 1,
      head_sha: PIN.head,
    })),
  };
  return { run, upstream, artifact, artifacts: { total_count: 1, artifacts: [artifact] }, jobs };
}
test("R10 official digest is mandatory independently of successful child exit", () => {
  assert.equal(validateDownloadOutput(downloaded()), true);
  for (const change of [
    { stdout: "" },
    { status: 1 },
    { stdout: downloaded().stdout + downloaded().stdout },
    { stdout: downloaded().stdout.replace(PIN.digest, "0".repeat(64)) },
    { stderr: "::warning::Artifact digest validation failed" },
    { stderr: "::error::PRIVATE_TOKEN_CANARY" },
    { stdout: "x".repeat(1048577) },
  ])
    assert.throws(() => validateDownloadOutput({ ...downloaded(), ...change }));
});
test("R10 never reemits private child output and rejects getter/Proxy inputs", () => {
  let calls = 0;
  const getter = {
    status: 0,
    stdout: "",
    get stderr() {
      calls++;
      return "SECRET_CANARY";
    },
  };
  assert.throws(() => validateDownloadOutput(getter));
  assert.equal(calls, 0);
  const proxy = new Proxy(
    {},
    {
      ownKeys() {
        calls++;
        throw Error("SECRET_CANARY");
      },
    },
  );
  assert.throws(() => validateDownloadOutput(proxy));
  assert.equal(calls, 0);
  assert.equal(
    validateDownloadOutput({
      ...downloaded(),
      stderr: "(node:1) DeprecationWarning: private canary",
    }),
    true,
  );
});
test("R10 metadata target, owner, uniqueness and attempt are fixed", () => {
  assert.equal(validateMetadata(metadataFixture()), true);
  for (const mutate of [
    (v) => (v.run.run_attempt = 2),
    (v) => (v.run.head_sha = "a".repeat(40)),
    (v) => (v.run.repository.owner.id = 1),
    (v) => (v.upstream.conclusion = "failure"),
    (v) => (v.artifact.expired = true),
    (v) => (v.artifact.digest = "sha256:" + "0".repeat(64)),
    (v) => (v.artifacts.total_count = 2),
    (v) => v.jobs.jobs.pop(),
    (v) => (v.jobs.jobs[0].run_attempt = 2),
    (v) => (v.run.path = "unknown"),
  ]) {
    const v = metadataFixture();
    mutate(v);
    assert.throws(() => validateMetadata(v));
  }
});
test("R10 canonical UTF8 original has no hidden duplicate fields or trailer", () => {
  const r = report(),
    raw = text(r);
  assert.equal(canonicalJson(Buffer.from(raw)).raw, raw);
  assert.throws(() => canonicalJson(Buffer.from("\uFEFF" + raw)));
  assert.throws(() => canonicalJson(Buffer.from(raw + " ")));
  assert.throws(() =>
    canonicalJson(Buffer.from(raw.replace("{", '{"secret":"TOKEN_CANARY","secret":null,'))),
  );
  assert.throws(() => canonicalJson(Buffer.from([0xff])));
  assert.equal(
    canonicalJson(Buffer.from(receiptText(empty())), "receipts").value.receipts.length,
    0,
  );
  assert.throws(() => canonicalJson(Buffer.from(text(empty())), "receipts"));
});
test("R10 synthetic report projection validates closed fifteen-key schema", () => {
  assert.equal(validateRecords(report(), empty()).observations.newArmedCount, 0);
  for (const mutate of [
    (r) => (r.secret = "TOKEN_CANARY"),
    (r) => (r.failure = "PRIVATE_TEXT_CANARY"),
    (r) => r.ids.push("private@example.com"),
    (r) => (r.diagnostics.secret = "CANARY"),
    (r) => (r.diagnostics.subphase = "UNKNOWN_SUBPHASE"),
    (r) => (r.recovery.extra = "CANARY"),
    (r) => (r.intentLedger.maxNewIntentions = 24),
    (r) => (r.bindings.competencies[0].code = "COMPETENCE_UNKNOWN_CANARY"),
    (r) => (r.bindings.organization = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
  ]) {
    const r = report();
    mutate(r);
    assert.throws(() => validateRecords(r, empty()));
  }
});
test("R10 missing ledger/bindings retains UNKNOWN without inventing zero operations", () => {
  const r = report();
  r.intentLedger = null;
  r.bindings = null;
  r.ids = [];
  const v = validateRecords(r, empty()).observations;
  assert.equal(v.newArmedCount, "UNKNOWN");
  assert.equal(v.newConfirmed, "UNKNOWN");
  assert.equal(v.bindings, "UNKNOWN");
});
test("R20 retains eleven-key historical receipts but rejects new sealed or confirmed rows", () => {
  const r = report();
  r.intentLedger.count = 18;
  r.intentLedger.newArmedCount = 1;
  const sealed = row(),
    confirmed = row("confirmed");
  assert.equal(Object.keys(sealed).length, 11);
  // Current R20 is readonly: neither an unconfirmed nor confirmed new receipt is admissible.
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [sealed] }));
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [sealed, confirmed] }));
  for (const rows of [
    [confirmed],
    [{ ...sealed, ids: [] }],
    [{ ...sealed, rpc: "salvar_fonte_normativa_v107" }],
    [sealed, { ...confirmed, payloadSha256: "c".repeat(64) }],
    [sealed, confirmed, confirmed],
  ])
    assert.throws(() => validateRecords(r, { ...empty(), receipts: rows }));
  for (const key of Object.keys(sealed)) {
    const v = { ...sealed };
    delete v[key];
    assert.throws(() => validateRecords(r, { ...empty(), receipts: [v] }));
  }
});
test("R10 original thirteen historical byte hashes match protected PLAN", () => {
  for (const [name, raw] of Object.entries(HISTORICAL))
    assert.equal(sha256(Buffer.from(raw)), HISTORY[name]);
});
test("R10 entire directory validates before one bounded proof is produced", (t) => {
  const root = fixture(t),
    proof = JSON.parse(buildProof(root, inspection));
  assert.equal(proof.type, "FIXTURE_INSPECTION_PROOF");
  assert.equal(proof.manifest.length, 30);
  assert.equal(proof.reportRaw, readFileSync(join(root, "report.json"), "utf8"));
  assert.equal(proof.receiptsRaw, readFileSync(join(root, "receipts.json"), "utf8"));
  assert.ok(Buffer.byteLength(JSON.stringify(proof)) <= 65536);
});
test("R10 unknown member/nested directory and symlinks/hardlinks fail closed", (t) => {
  for (const kind of ["extra", "directory", "symlink", "hardlink"]) {
    const root = fixture(t);
    if (kind === "extra") writeFileSync(join(root, "unknown.png"), "TOKEN_CANARY");
    if (kind === "directory") mkdirSync(join(root, "unknown"));
    if (kind === "symlink") {
      rmSync(join(root, "report.json"));
      symlinkSync(join(root, "receipts.json"), join(root, "report.json"));
    }
    if (kind === "hardlink") {
      rmSync(join(root, "report.json"));
      linkSync(join(root, "receipts.json"), join(root, "report.json"));
    }
    assert.throws(() => buildProof(root, inspection));
  }
});
test("R10 manifest order/hash/history and late schema errors never produce partial proof", (t) => {
  for (const kind of ["order", "hash", "historical", "schema", "oversize"]) {
    const root = fixture(t, (content) => {
      if (kind === "historical") content["recovery-r5.json"] += " ";
      if (kind === "schema") {
        const r = report();
        r.bindings.secret = "TOKEN_CANARY";
        content["report.json"] = text(r);
      }
      if (kind === "oversize") content["report.json"] = "x".repeat(65537);
    });
    if (kind === "order") {
      const p = join(root, "SHA256SUMS");
      writeFileSync(p, readFileSync(p, "utf8").trimEnd().split("\n").reverse().join("\n") + "\n");
    }
    if (kind === "hash") writeFileSync(join(root, "report.json"), "x");
    let output = "";
    assert.throws(() => {
      output = buildProof(root, inspection);
    });
    assert.equal(output, "");
  }
});
test("R10 shared deadline remains enforced before final proof publication", (t) => {
  const root = fixture(t);
  let calls = 0,
    output = "";
  assert.throws(() => {
    output = buildProof(root, inspection, () => {
      if (++calls === 19) throw Error("INSPECTION_DEADLINE");
    });
  });
  assert.equal(output, "");
});
test("R10 CLI rejects arbitrary arguments before metadata or downloader and emits only generic enum", () => {
  const child = spawnSync(
    process.execPath,
    ["scripts/hml/inspect-fixture-artifact.mjs", "--url=TOKEN_CANARY"],
    { env: {}, encoding: "utf8" },
  );
  assert.equal(child.status, 1);
  assert.equal(child.stdout, "");
  assert.equal(child.stderr, "FIXTURE_INSPECTION_FAILED\n");
});
test("R10 workflow grants actions read only to protected main inspector and has no authorization runtime", () => {
  const yaml = readFileSync(".github/workflows/contaos-trilha-a-fixture-inspection.yml", "utf8");
  assert.ok(yaml.includes("github.event_name == 'push' && github.ref == 'refs/heads/main'"));
  assert.equal((yaml.match(/actions: read/g) || []).length, 1);
  assert.ok(
    !/workflow_dispatch|workflow_run:|pull_request_target|environment:|id-token:|secrets\./.test(
      yaml,
    ),
  );
  assert.ok(yaml.includes(PIN.tool));
});

test("R10 official pinned bundle parses and fails closed without token or environment", () => {
  const path = ".fixture-inspection-tool/dist/index.js";
  const bytes = readFileSync(path);
  assert.ok(bytes.length > 0);
  const git = spawnSync("git", ["-C", ".fixture-inspection-tool", "hash-object", "dist/index.js"], {
    encoding: "utf8",
    env: { PATH: "/usr/bin:/bin" },
  });
  assert.equal(git.status, 0);
  assert.equal(git.stdout.trim(), PIN.bundle);
  const parsed = spawnSync(process.execPath, ["--check", path], {
    env: {},
    encoding: "utf8",
    timeout: 10000,
    maxBuffer: 65536,
  });
  assert.equal(parsed.status, 0);
  const smoke = spawnSync(process.execPath, [path], {
    env: {},
    encoding: "utf8",
    timeout: 10000,
    maxBuffer: 65536,
  });
  assert.equal(smoke.status, 1);
  assert.equal(smoke.signal, null);
  assert.ok(!smoke.error);
});
test("R10 known binding roles and collected ids cannot smuggle unrelated UUIDs", () => {
  for (const change of [
    (r) => (r.bindings.listId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
    (r) => (r.bindings.competencies[0].id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
    (r) => (r.recovery.sourceHash = "a".repeat(64)),
    (r) => r.ids.push("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
  ]) {
    const r = report();
    change(r);
    assert.throws(() => validateRecords(r, empty()));
  }
});

test("R10 proof inspection origin is closed before serializing any caller object", (t) => {
  const root = fixture(t);
  let calls = 0,
    output = "";
  for (const v of [
    { ...inspection, token: "TOKEN_CANARY" },
    {
      run: "123",
      get head() {
        calls++;
        return "TOKEN_CANARY";
      },
    },
    new Proxy(
      {},
      {
        ownKeys() {
          calls++;
          throw Error("TOKEN_CANARY");
        },
      },
    ),
  ]) {
    assert.throws(() => {
      output = buildProof(root, v);
    });
    assert.equal(output, "");
  }
  assert.equal(calls, 0);
});

test("R10 real downloader consumer fixes child inputs and keeps errors and private logs captured", () => {
  let observed;
  const run = (result) =>
    executeOfficialTool(
      "/fixed/tool",
      "/fixed/output",
      "TEST_TOKEN",
      () => 30000,
      (bin, args, options) => {
        observed = { bin, args, options };
        return result;
      },
    );
  assert.equal(run({ ...downloaded(), signal: null, error: undefined }), true);
  assert.equal(observed.bin, process.execPath);
  assert.deepEqual(observed.args, ["/fixed/tool/dist/index.js"]);
  assert.deepEqual(
    Object.keys(observed.options.env).sort(),
    [
      "INPUT_ARTIFACT-IDS",
      "INPUT_RUN-ID",
      "INPUT_REPOSITORY",
      "INPUT_GITHUB-TOKEN",
      "INPUT_MERGE-MULTIPLE",
      "INPUT_PATH",
      "INPUT_NAME",
      "INPUT_PATTERN",
      "GITHUB_API_URL",
      "GITHUB_SERVER_URL",
    ].sort(),
  );
  assert.equal(observed.options.env["INPUT_ARTIFACT-IDS"], String(PIN.artifact));
  assert.equal(observed.options.env["INPUT_RUN-ID"], String(PIN.run));
  assert.equal(observed.options.killSignal, "SIGKILL");
  assert.equal(observed.options.stdio, "pipe");
  assert.ok(observed.options.maxBuffer * 2 <= 1048576);
  for (const result of [
    { ...downloaded(), error: new Error("SECRET_CANARY") },
    { ...downloaded(), signal: "SIGKILL" },
    { ...downloaded(), status: null },
    { ...downloaded(), stdout: downloaded().stdout + "::warning::TOKEN_CANARY" },
    { ...downloaded(), stderr: "::error::TOKEN_CANARY" },
  ])
    assert.throws(
      () => run(result),
      (error) => error.message === "INSPECTION_DOWNLOAD",
    );
  assert.throws(
    () =>
      executeOfficialTool(
        "/fixed/tool",
        "/fixed/output",
        "TEST_TOKEN",
        () => {
          throw Error("INSPECTION_DEADLINE");
        },
        () => {
          throw Error("must not spawn");
        },
      ),
    /INSPECTION_DEADLINE/,
  );
});

test("R10 downstream role UUID syntax matches producer versions one through eight", () => {
  const r = report();
  r.bindings.competencies[0].executionId = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa";
  r.ids.push(r.bindings.competencies[0].executionId);
  // Producer collects in object traversal order, not insertion into the report ids array.
  const ids = [];
  const collect = (v) => {
    if (
      typeof v === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v)
    )
      ids.push(v);
    else if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === "object") Object.values(v).forEach(collect);
  };
  collect(r.bindings);
  r.ids = [...new Set(ids)];
  assert.equal(
    validateRecords(r, empty()).report.bindings.competencies[0].executionId,
    r.bindings.competencies[0].executionId,
  );
});

test("R20 rejects armed intentions and frozen ledgers instead of inferring confirmation", () => {
  const r = report();
  r.intentLedger.count = 18;
  r.intentLedger.newArmedCount = 1;
  assert.throws(() => validateRecords(r, empty()));
  r.intentLedger.count = 19;
  r.intentLedger.newArmedCount = 2;
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [row(), row("confirmed")] }));
  r.intentLedger.count = 18;
  r.intentLedger.newArmedCount = 1;
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [row(), row("uncertain")] }));
  const frozen = report();
  frozen.intentLedger.frozen = true;
  assert.throws(() => validateRecords(frozen, empty()));
});

test("R10 directory FD prevents parent replacement from redirecting any artifact read", (t) => {
  const root = fixture(t),
    victim = fixture(t),
    original = root + "-original";
  t.after(() => rmSync(original, { recursive: true, force: true }));
  const watched = join(victim, "receipts.json");
  utimesSync(watched, new Date(1000), new Date(1000));
  const before = lstatSync(watched).atimeMs;
  let changed = false,
    output = "";
  assert.throws(() => {
    output = buildProof(root, inspection, () => {
      if (!changed) {
        changed = true;
        renameSync(root, original);
        symlinkSync(victim, root);
      }
    });
  });
  assert.equal(output, "");
  assert.equal(lstatSync(watched).atimeMs, before);
});

test("appended R6 history is immutable, ordered, and canonically empty where produced", () => {
  assert.deepEqual(FILES.slice(8, 11), [
    "receipts-r6.json",
    "recovery-r6.json",
    "recovery-r7.json",
  ]);
  assert.equal(FILES.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.equal(
    HISTORY["receipts-r6.json"],
    "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  );
  assert.equal(
    HISTORY["recovery-r6.json"],
    "98136adfe0c84c274ca31534b847b640a35f2577d2ad6197e451324a51ac7e03",
  );
  const receipts = canonicalJson(Buffer.from(HISTORICAL["receipts-r6.json"]), "receipts");
  assert.equal(receipts.value.receipts.length, 0);
  const document = canonicalJson(Buffer.from(HISTORICAL["recovery-r6.json"])).value;
  assert.equal(Object.keys(document).length, 10);
  assert.equal(document.receiptsRaw, receipts.raw);
  const r = report();
  r.failure = "RECOVERY_R6_LEDGER";
  r.diagnostics.primaryFailure = "RECOVERY_R6_LEDGER";
  assert.equal(validateRecords(r, empty()).report.failure, "RECOVERY_R6_LEDGER");
});

test("R7 zero-auth history contains only its nine-field metadata proof", () => {
  assert.equal(FILES[10], "recovery-r7.json");
  assert.ok(!FILES.includes("receipts-r7.json") && !FILES.includes("report-r7.json"));
  const raw = HISTORICAL["recovery-r7.json"];
  assert.equal(Buffer.byteLength(raw), 316);
  assert.equal(
    sha256(Buffer.from(raw)),
    "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e",
  );
  const document = canonicalJson(Buffer.from(raw)).value;
  assert.equal(Object.keys(document).length, 9);
  assert.equal(document.derivedNewBusinessIntents, 0);
  const r = report();
  r.failure = "RECOVERY_R7_LEDGER";
  r.diagnostics.primaryFailure = "RECOVERY_R7_LEDGER";
  assert.equal(validateRecords(r, empty()).report.failure, "RECOVERY_R7_LEDGER");
});

test("R10 literal target is terminal attempt one and cannot be selected through caller inputs", () => {
  assert.equal(PIN.run, 42788354465);
  assert.equal(PIN.head, "79b728cb12e7b1df037c5816c27842c0ef042d2b");
  assert.equal(PIN.upstream, 42788083679);
  assert.equal(PIN.artifact, 13751191411);
  assert.equal(PIN.size, 33862);
  assert.equal(PIN.name, "trilha-a-fixtures-42788354465-1");
  assert.equal(PIN.digest, "142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536");
});

test("R10 observation diagnostic validator is required before any technical proof", async () => {
  const reader = await import("./inspect-fixture-artifact.mjs");
  assert.equal(
    typeof reader.validateObservationDiagnostic,
    "function",
    "R9_OBSERVATION_VALIDATOR_ABSENT",
  );
  const observation = {
    schema: "contaos.fixture.observation.v1",
    frontendSha: PIN.frontend,
    harnessSha: PIN.head,
    deploymentId: PIN.deployment,
    workflowRun: String(PIN.run),
    firstFailure: null,
  };
  assert.equal(reader.validateObservationDiagnostic(observation, report()).firstFailure, null);
});

const OBSERVATION_KINDS = [
  "TABLE:contratos",
  "TABLE:fontes_normativas",
  "TABLE:versoes_fontes_normativas",
  "TABLE:listas_verificacao",
  "TABLE:versoes_lista",
  "TABLE:itens_lista",
  "TABLE:competencias",
  "TABLE:requisitos_competencia",
  "TABLE:arquivos",
  "TABLE:documentos_contrato",
  "TABLE:documentos_competencia",
  "TABLE:versoes_documento",
  "TABLE:processamentos_documento",
  "TABLE:pareceres_internos",
  "TABLE:apresentacoes_contratante",
  "TABLE:pacotes_competencia",
  "TABLE:itens_pacote_competencia",
  "TABLE:aprovacoes_apresentacao",
  "RPC:registrar_versao_fonte_v107",
  "RPC:aprovar_versao_fonte_v107",
  "RPC:salvar_fonte_normativa_v107",
  "RPC:executar_comando_lista_v1",
  "RPC:criar_competencia",
  "RPC:criar_documento_competencia_v115",
  "RPC:solicitar_analise_competencia",
  "RPC:registrar_revisao_requisito_v117",
  "RPC:solicitar_parecer_interno",
  "RPC:aprovar_parecer_interno",
  "RPC:aprovar_apresentacao",
  "RPC:registrar_apresentacao",
  "RPC:consultar_permissoes_efetivas",
  "RPC:obter_matriz_rbac_master",
  "RPC:obter_lista_operacional_v1",
  "RPC:obter_visao_geral_competencia",
  "RPC:obter_documentos_competencia_v115",
  "RPC:obter_analise_competencia_v116",
  "RPC:obter_detalhe_requisito_v117",
  "RPC:obter_contexto_revisao_v117",
];
test("R10 observation matrix accepts only the exact producer table/RPC contracts", () => {
  assert.equal(OBSERVATION_KINDS.length, 38);
  assert.equal(validateObservationDiagnostic(observation(), report()).firstFailure, null);
  for (const kind of OBSERVATION_KINDS) {
    for (const stage of ["RESPONSE_PROJECTION", "RESPONSE_CONTEXT", "OBSERVATION_LIMIT"]) {
      const first = { contractKind: kind, stage, statusHTTP: "NONE", requestFailure: "NONE" };
      assert.equal(
        JSON.stringify(validateObservationDiagnostic(observation(first), report()).firstFailure),
        JSON.stringify(first),
      );
    }
    for (const status of [100, 199, 300, 403, 429, 503, 599]) {
      assert.equal(
        validateObservationDiagnostic(
          observation({
            contractKind: kind,
            stage: "HTTP_STATUS",
            statusHTTP: status,
            requestFailure: "NONE",
          }),
          report(),
        ).firstFailure.statusHTTP,
        status,
      );
    }
    for (const status of [200, 204, 299])
      for (const failure of ["NONE", "ABORTED", "OTHER", "UNAVAILABLE"]) {
        const first = {
          contractKind: kind,
          stage: "BODY_READ",
          statusHTTP: status,
          requestFailure: failure,
        };
        assert.equal(
          validateObservationDiagnostic(observation(first), report()).firstFailure.requestFailure,
          failure,
        );
      }
    for (const stage of ["REQUEST_BINDING", "REQUEST_ARGS"]) {
      const value = observation({
        contractKind: kind,
        stage,
        statusHTTP: "NONE",
        requestFailure: "NONE",
      });
      if (kind.startsWith("RPC:"))
        assert.equal(validateObservationDiagnostic(value, report()).firstFailure.stage, stage);
      else assert.throws(() => validateObservationDiagnostic(value, report()));
    }
  }
  const unavailable = {
    contractKind: "UNKNOWN",
    stage: "UNAVAILABLE",
    statusHTTP: "NONE",
    requestFailure: "UNAVAILABLE",
  };
  assert.equal(
    validateObservationDiagnostic(observation(unavailable), report()).firstFailure.contractKind,
    "UNKNOWN",
  );
});
test("R10 observation CAU2 unavailable row and every stage/status/failure mismatch fail closed", () => {
  const table = "TABLE:contratos",
    rpc = "RPC:obter_analise_competencia_v116";
  const invalid = [
    {
      contractKind: "RPC:PRIVATE_TOKEN_CANARY",
      stage: "BODY_READ",
      statusHTTP: 200,
      requestFailure: "NONE",
    },
    {
      contractKind: "TABLE:contratos ",
      stage: "HTTP_STATUS",
      statusHTTP: 503,
      requestFailure: "NONE",
    },
    { contractKind: "UNKNOWN", stage: "HTTP_STATUS", statusHTTP: 503, requestFailure: "NONE" },
    {
      contractKind: table,
      stage: "UNAVAILABLE",
      statusHTTP: "NONE",
      requestFailure: "UNAVAILABLE",
    },
    {
      contractKind: "UNKNOWN",
      stage: "UNAVAILABLE",
      statusHTTP: 503,
      requestFailure: "UNAVAILABLE",
    },
    { contractKind: "UNKNOWN", stage: "UNAVAILABLE", statusHTTP: "NONE", requestFailure: "NONE" },
    { contractKind: table, stage: "REQUEST_BINDING", statusHTTP: "NONE", requestFailure: "NONE" },
    { contractKind: rpc, stage: "REQUEST_ARGS", statusHTTP: 200, requestFailure: "NONE" },
    ...[0, 99, 200, 204, 299, 600, 200.5, "503", "NONE"].map((statusHTTP) => ({
      contractKind: rpc,
      stage: "HTTP_STATUS",
      statusHTTP,
      requestFailure: "NONE",
    })),
    ...[199, 300, "200", "NONE"].map((statusHTTP) => ({
      contractKind: table,
      stage: "BODY_READ",
      statusHTTP,
      requestFailure: "ABORTED",
    })),
    { contractKind: rpc, stage: "HTTP_STATUS", statusHTTP: 503, requestFailure: "ABORTED" },
    { contractKind: rpc, stage: "BODY_READ", statusHTTP: 200, requestFailure: "net::ERR_ABORTED" },
    { contractKind: table, stage: "RESPONSE_CONTEXT", statusHTTP: "NONE", requestFailure: "OTHER" },
    { contractKind: table, stage: "OBSERVATION_LIMIT", statusHTTP: 429, requestFailure: "NONE" },
    {
      contractKind: table,
      stage: "PRIVATE_STAGE_CANARY",
      statusHTTP: "NONE",
      requestFailure: "NONE",
    },
  ];
  for (const first of invalid)
    assert.throws(() => validateObservationDiagnostic(observation(first), report()));
});
test("R10 observation has six ordered own fields and four ordered failure primitives with zero getter/Proxy execution", () => {
  let calls = 0;
  const valid = observation({
    contractKind: "TABLE:contratos",
    stage: "BODY_READ",
    statusHTTP: 200,
    requestFailure: "NONE",
  });
  const rootGetter = {
    ...observation(),
    get token() {
      calls++;
      return "SECRET_CANARY";
    },
  };
  const nestedGetter = observation({
    contractKind: "TABLE:contratos",
    stage: "BODY_READ",
    statusHTTP: 200,
    get requestFailure() {
      calls++;
      return "SECRET_CANARY";
    },
  });
  const proxy = new Proxy(
    {},
    {
      ownKeys() {
        calls++;
        throw Error("SECRET_CANARY");
      },
      get() {
        calls++;
        throw Error("SECRET_CANARY");
      },
    },
  );
  const proto = Object.create(proxy);
  Object.assign(proto, observation());
  const symbol = observation();
  symbol[Symbol("SECRET_CANARY")] = true;
  const reordered = {
    firstFailure: null,
    schema: valid.schema,
    frontendSha: valid.frontendSha,
    harnessSha: valid.harnessSha,
    deploymentId: valid.deploymentId,
    workflowRun: valid.workflowRun,
  };
  const reorderedFailure = observation({
    stage: "BODY_READ",
    contractKind: "TABLE:contratos",
    statusHTTP: 200,
    requestFailure: "NONE",
  });
  for (const value of [
    rootGetter,
    nestedGetter,
    proxy,
    proto,
    symbol,
    reordered,
    reorderedFailure,
    observation([]),
    { ...valid, rawError: "SECRET_CANARY" },
    { ...valid, harnessSha: "a".repeat(40) },
  ]) {
    assert.throws(() => validateObservationDiagnostic(value, report()));
  }
  assert.equal(calls, 0);
});
test("R10 one proof publishes exact observationRaw only after the complete fourteen-file validation", (t) => {
  const root = fixture(t),
    output = JSON.parse(buildProof(root, inspection));
  assert.equal(output.manifest.length, 30);
  assert.equal(
    output.observationRaw,
    readFileSync(join(root, "observation-diagnostic.json"), "utf8"),
  );
  assert.equal(JSON.parse(output.observationRaw).firstFailure, null);
  assert.equal(JSON.parse(output.reportRaw).completed, false);
  assert.equal(output.observations.priorConfirmed, 17);
  assert.equal(FILES.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(11, 14), [
    "receipts-r8.json",
    "recovery-r8.json",
    "observation-diagnostic.json",
  ]);
});
test("R10 invalid or duplicate hidden observation fields block all proof output even with a correct manifest", (t) => {
  for (const kind of ["identity", "unknown", "matrix", "canonical", "duplicate", "missing"]) {
    const root = fixture(t, (content) => {
      const value = observation();
      if (kind === "identity") value.workflowRun = "123";
      if (kind === "unknown") value.token = "SECRET_CANARY";
      if (kind === "matrix")
        value.firstFailure = {
          contractKind: "UNKNOWN",
          stage: "HTTP_STATUS",
          statusHTTP: 503,
          requestFailure: "NONE",
        };
      content["observation-diagnostic.json"] = text(value);
      if (kind === "canonical") content["observation-diagnostic.json"] += " ";
      if (kind === "duplicate")
        content["observation-diagnostic.json"] = content["observation-diagnostic.json"].replace(
          "{",
          '{"token":"SECRET_CANARY","token":null,',
        );
    });
    if (kind === "missing") rmSync(join(root, "observation-diagnostic.json"));
    let output = "";
    assert.throws(() => {
      output = buildProof(root, inspection);
    });
    assert.equal(output, "");
  }
});
test("R10 historical R8 evidence remains byte-exact while current budget is ten plus fourteen", () => {
  assert.equal(
    HISTORY["receipts-r8.json"],
    "20af329dd9c441e4ede575fa6cb94a65c3d136ad777613170045c696328fad25",
  );
  assert.equal(
    HISTORY["recovery-r8.json"],
    "b22c0e464915cd58f8d9918a2c4751078dbf73578528e833afd92fa646502884",
  );
  const historical = canonicalJson(Buffer.from(HISTORICAL["recovery-r8.json"])).value;
  assert.equal(Object.keys(historical).length, 10);
  const previous = JSON.parse(historical.reportRaw);
  assert.equal(previous.intentLedger.priorConfirmed, 8);
  assert.equal(previous.intentLedger.maxNewIntentions, 16);
  assert.equal(previous.intentLedger.count, 10);
  const current = report();
  assert.equal(current.intentLedger.priorConfirmed, 17);
  assert.equal(current.intentLedger.maxNewIntentions, 5);
  current.intentLedger.count = 16;
  current.intentLedger.newArmedCount = 1;
  for (const requestId of [
    "6d730eb7-8c38-4474-813d-d39672454444",
    "a2791c81-99be-4bbb-9ad4-5ef3dbd2eff4",
  ]) {
    assert.throws(() =>
      validateRecords(current, { ...empty(), receipts: [{ ...row(), requestId }] }),
    );
  }
  for (const key of ["requirementId", "documentId"]) {
    const changed = report();
    changed.bindings.competencies[0][key] = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    assert.throws(() => validateRecords(changed, empty()));
  }
  for (const code of [
    "RECOVERY_R8_LEDGER",
    "RECOVERY_R8_DOCUMENT",
    "RECOVERY_R8_ANALYSIS",
    "OBSERVATION_DIAGNOSTIC",
  ]) {
    const r = report();
    r.failure = code;
    r.diagnostics.primaryFailure = code;
    assert.equal(validateRecords(r, empty()).report.failure, code);
  }
});

test("R10 observation failure cannot accompany a successful report or erase an earlier primary", () => {
  const first = {
    contractKind: "TABLE:contratos",
    stage: "HTTP_STATUS",
    statusHTTP: 503,
    requestFailure: "NONE",
  };
  const successful = report();
  successful.completed = true;
  successful.failure = null;
  successful.diagnostics.primaryFailure = null;
  successful.diagnostics.failureClass = null;
  successful.diagnostics.errorName = null;
  assert.throws(() => validateObservationDiagnostic(observation(first), successful));
  assert.equal(validateObservationDiagnostic(observation(), successful).firstFailure, null);
  const earlier = report();
  earlier.failure = "FLOW_BUTTON_UNAVAILABLE";
  earlier.diagnostics.primaryFailure = "FLOW_BUTTON_UNAVAILABLE";
  assert.equal(
    validateObservationDiagnostic(observation(first), earlier).firstFailure.stage,
    "HTTP_STATUS",
  );
  const mismatch = report();
  mismatch.failure = "FLOW_BUTTON_UNAVAILABLE";
  assert.throws(() => validateObservationDiagnostic(observation(first), mismatch));
});
test("R10 complete manifest still produces zero proof for observation failure with successful report", (t) => {
  const root = fixture(t, (content) => {
    const r = report();
    r.completed = true;
    r.failure = null;
    r.diagnostics.primaryFailure = null;
    r.diagnostics.failureClass = null;
    r.diagnostics.errorName = null;
    content["report.json"] = text(r);
    content["observation-diagnostic.json"] = text(
      observation({
        contractKind: "TABLE:contratos",
        stage: "HTTP_STATUS",
        statusHTTP: 503,
        requestFailure: "NONE",
      }),
    );
  });
  let output = "";
  assert.throws(() => {
    output = buildProof(root, inspection);
  });
  assert.equal(output, "");
});

test("R10 immutable artifact layout appends R9 originals after the existing observation diagnostic", () => {
  assert.equal(FILES.length, 30, "R10_MANIFEST_APPEND_ABSENT");
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(13, 16), [
    "observation-diagnostic.json",
    "receipts-r9.json",
    "recovery-r9.json",
  ]);
  assert.equal(PIN.run, 42788354465);
  assert.equal(PIN.artifact, 13751191411);
});

test("R10 preserves original R9 report receipts and observation inside the pinned twelve-field recovery document", () => {
  const raw = HISTORICAL["recovery-r9.json"];
  assert.equal(Buffer.byteLength(raw), 3170);
  assert.equal(
    sha256(Buffer.from(raw)),
    "71e20cc2dfd5888ab22228efe2b253eea316194ce0503e262ad58aef516078b8",
  );
  const document = canonicalJson(Buffer.from(raw)).value;
  assert.equal(Object.keys(document).length, 12);
  assert.equal(document.schema, "contaos.fixture.recovery-r9.v1");
  assert.equal(document.receiptsRaw, HISTORICAL["receipts-r9.json"]);
  assert.equal(
    sha256(Buffer.from(document.reportRaw)),
    "4163c5266ed9715ceafa3650af55a42348636cfbccceb9c8f124b55ab1eac31e",
  );
  assert.equal(
    sha256(Buffer.from(document.observationRaw)),
    "6beb2ab824c183a65b1bd7334a4a6ab7ca878a0c6cab999a32dfd39a4ec5cad6",
  );
  assert.equal(JSON.parse(document.reportRaw).intentLedger.newArmedCount, 0);
  const current = report();
  current.failure = "RECOVERY_R9_LEDGER";
  current.diagnostics.primaryFailure = "RECOVERY_R9_LEDGER";
  assert.equal(validateRecords(current, empty()).report.failure, "RECOVERY_R9_LEDGER");
});

test("R11 terminal target requires the two R10 originals appended after all sixteen existing data files", () => {
  assert.equal(FILES.length, 30, "R11_MANIFEST_APPEND_ABSENT");
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(14, 18), [
    "receipts-r9.json",
    "recovery-r9.json",
    "receipts-r10.json",
    "recovery-r10.json",
  ]);
  assert.equal(PIN.run, 42788354465);
  assert.equal(PIN.artifact, 13751191411);
});

test("R11 preserves the twelve-field R10 document and all three original raw hashes", () => {
  const raw = HISTORICAL["recovery-r10.json"];
  assert.equal(Buffer.byteLength(raw), 4768);
  assert.equal(sha256(Buffer.from(raw)), HISTORY["recovery-r10.json"]);
  const document = canonicalJson(Buffer.from(raw)).value;
  assert.equal(Object.keys(document).length, 12);
  assert.equal(document.schema, "contaos.fixture.recovery-r10.v1");
  assert.equal(document.receiptsRaw, HISTORICAL["receipts-r10.json"]);
  for (const [field, expected] of [
    ["reportRaw", "858c21b7eb05e379f6c92dd84cc5f7afe0d75406ab105d3b279b2f0d53703ef2"],
    ["receiptsRaw", "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf"],
    ["observationRaw", "0b11018aae5529f19ccb6476bf8b1202f3a7e9ba8fab8811252a48b2904ddecf"],
  ])
    assert.equal(sha256(Buffer.from(document[field])), expected);
  const current = report();
  current.failure = "RECOVERY_R10_LEDGER";
  current.diagnostics.primaryFailure = "RECOVERY_R10_LEDGER";
  assert.equal(validateRecords(current, empty()).report.failure, "RECOVERY_R10_LEDGER");
});

test("R13 pins the actual original artifact and preserves the reserved R11 intent", () => {
  assert.equal(PIN.run, 42788354465);
  assert.equal(PIN.head, "79b728cb12e7b1df037c5816c27842c0ef042d2b");
  assert.equal(PIN.artifact, 13751191411);
  assert.equal(PIN.digest, "142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536");
  assert.equal(FILES.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  const r = report();
  r.intentLedger = {
    count: 19,
    frozen: false,
    pending: false,
    sent: false,
    priorConfirmed: 17,
    priorReserved: 2,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 5,
  };
  r.recovery.maxNewIntentions = 5;
  const result = validateRecords(r, empty());
  assert.equal(result.observations.priorReserved, 2);
  assert.equal(result.observations.newConfirmed, 0);
  for (const mutate of [
    (r) => (r.intentLedger.priorReserved = 0),
    (r) => (r.intentLedger.count = 10),
    (r) => (r.intentLedger.priorConfirmed = 11),
    (r) => (r.intentLedger.maxNewIntentions = 14),
    (r) => (r.recovery.priorReserved = 1),
  ]) {
    const bad = clone(r);
    mutate(bad);
    assert.throws(() => validateRecords(bad, empty()));
  }
  const receipt = row();
  receipt.requestId = "af968191-7d60-4adb-9c60-ebd5f0741e8e";
  assert.throws(() =>
    validateRecords(r, { schema: "contaos.fixture.receipts.v1", receipts: [receipt] }),
  );
});

test("R13 refuses the spent October opinion even under a new request UUID", () => {
  const r = report();
  r.intentLedger.count = 18;
  r.intentLedger.newArmedCount = 1;
  const receipt = {
    ...row(),
    rpc: "solicitar_parecer_interno",
    payloadSha256: "b8e2197107c85e4d8b9b962e15ffe4f369669312513f1b26f1db2bbfb560579d",
  };
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [receipt] }));
});
test("R13 appends the exact R11 uncertain originals without promoting or refunding them", (t) => {
  assert.deepEqual(FILES.slice(18, 20), ["receipts-r11.json", "recovery-r11.json"]);
  const original = canonicalJson(Buffer.from(HISTORICAL["recovery-r11.json"])).value;
  assert.equal(Object.keys(original).length, 12);
  assert.equal(original.receiptsRaw, HISTORICAL["receipts-r11.json"]);
  const rows = JSON.parse(original.receiptsRaw).receipts;
  assert.deepEqual(
    rows.map((r) => r.state),
    ["sealed", "uncertain"],
  );
  assert.equal(rows[1].requestId, "af968191-7d60-4adb-9c60-ebd5f0741e8e");
  for (const name of FILES.slice(18, 20)) {
    const root = fixture(t);
    rmSync(join(root, name));
    assert.throws(() => buildProof(root, inspection));
  }
  const root = fixture(t, (files) => {
    files["receipts-r11.json"] = receiptText(empty());
  });
  assert.throws(() => buildProof(root, inspection));
});

const R15_FILES = [
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
  "receipts-r18.json",
  "recovery-r18.json",
];
const R15_HISTORY = {
  "receipts-r13.json": '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  "recovery-r13.json":
    '{\n  "schema": "contaos.fixture.recovery-r13.v1",\n  "workflowRun": "42685547737",\n  "artifactId": "13704636643",\n  "requestId": "trilha-a-fixtures-20261109-r13",\n  "harnessSha": "f39e32ca1009b23aaae19dcbd01e282df2bf0847",\n  "zipSha256": "7d097d83d5b622d4277be39d2155800223e18fccfe9258ba1adabf337c1e5307",\n  "reportSha256": "877dca165c4d46a61b8f5ea1946a6a223ceb17e9b64b9ef4067d8e24d5b7aa81",\n  "receiptsSha256": "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",\n  "observationSha256": "f6f4ea8b51e4ec9ab3e8aca8e4fb6c3367d808174e884ca4c6119d6a06c33aeb",\n  "reportRaw": "{\\n  \\"schema\\": \\"contaos.fixture.preparation.v1\\",\\n  \\"failure\\": \\"FLOW_LIST_UI_MISSING\\",\\n  \\"diagnostics\\": {\\n    \\"primaryFailure\\": \\"FLOW_LIST_UI_MISSING\\",\\n    \\"failureClass\\": \\"PROTOCOL\\",\\n    \\"errorName\\": \\"Error\\",\\n    \\"subphase\\": \\"LIST_UI_CONTROL\\",\\n    \\"subphasePath\\": [\\n      \\"SOURCE_AND_LIST\\",\\n      \\"LIST_UI_CONTROL\\",\\n      \\"LIST_UI_CONTROL\\"\\n    ],\\n    \\"lastCompletedSubphase\\": \\"LIST_GET\\",\\n    \\"logoutAttempted\\": true,\\n    \\"logoutVerified\\": true,\\n    \\"cleanupFailure\\": null\\n  },\\n  \\"intentLedger\\": {\\n    \\"count\\": 11,\\n    \\"frozen\\": false,\\n    \\"pending\\": false,\\n    \\"sent\\": false,\\n    \\"priorConfirmed\\": 10,\\n    \\"priorReserved\\": 1,\\n    \\"newArmedCount\\": 0,\\n    \\"maxIntentions\\": 24,\\n    \\"maxNewIntentions\\": 13\\n  },\\n  \\"recovery\\": {\\n    \\"ledgerSha256\\": \\"381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9\\",\\n    \\"priorWorkflowRun\\": \\"42540864527\\",\\n    \\"confirmedBefore\\": 10,\\n    \\"maxNewIntentions\\": 13,\\n    \\"r3ReceiptsSha256\\": \\"28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364\\",\\n    \\"r3WorkflowRun\\": \\"42559214436\\",\\n    \\"r4ZeroAuth\\": {\\n      \\"schema\\": \\"contaos.fixture.recovery-r4.v1\\",\\n      \\"headSha\\": \\"4c3a92b3fbf3160b3c67751355a4ef8f91c70d72\\",\\n      \\"upstreamRun\\": 42568309807,\\n      \\"fixturesRun\\": 42568382053,\\n      \\"auditRun\\": 42568382029,\\n      \\"attempt\\": 1,\\n      \\"derivedNewBusinessIntents\\": 0,\\n      \\"proof\\": \\"GITHUB_ACTIONS_LIVE_METADATA\\"\\n    },\\n    \\"reconciled\\": true,\\n    \\"sourceVersion\\": \\"1ebbfd0b-c50c-405d-8806-321f18e179e0\\",\\n    \\"sourceHash\\": \\"d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1\\"\\n  },\\n  \\"bindings\\": null,\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"f39e32ca1009b23aaae19dcbd01e282df2bf0847\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42685547737\\",\\n  \\"phase\\": \\"SOURCE_AND_LIST\\",\\n  \\"completed\\": false,\\n  \\"logoutVerified\\": true,\\n  \\"ids\\": [],\\n  \\"v1Certified\\": false\\n}\\n",\n  "receiptsRaw": "{\\"schema\\":\\"contaos.fixture.receipts.v1\\",\\"receipts\\":[]}\\n",\n  "observationRaw": "{\\n  \\"schema\\": \\"contaos.fixture.observation.v1\\",\\n  \\"frontendSha\\": \\"0024b3c6739ab6296ec12338f11cf792d3a5f84b\\",\\n  \\"harnessSha\\": \\"f39e32ca1009b23aaae19dcbd01e282df2bf0847\\",\\n  \\"deploymentId\\": \\"dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh\\",\\n  \\"workflowRun\\": \\"42685547737\\",\\n  \\"firstFailure\\": null\\n}\\n"\n}\n',
};
function r15Metadata() {
  const m = metadataFixture();
  for (const run of [m.run, m.upstream]) {
    run.head_sha = "79b728cb12e7b1df037c5816c27842c0ef042d2b";
  }
  m.run.id = 42788354465;
  m.upstream.id = 42788083679;
  Object.assign(m.artifact, {
    id: 13751191411,
    name: "trilha-a-fixtures-42788354465-1",
    size_in_bytes: 33862,
    digest: "sha256:142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536",
    workflow_run: {
      id: 42788354465,
      repository_id: 1442722734,
      head_repository_id: 1442722734,
      head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
      head_branch: "main",
    },
  });
  m.jobs.jobs = [
    [129735171394, "Trilha A solicitacao unica sem credenciais", "success"],
    [129735173939, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
    [129735702128, "Trilha A preparacao sintetica HML", "success"],
  ].map(([id, name, conclusion]) => ({
    id,
    name,
    conclusion,
    status: "completed",
    run_id: 42788354465,
    run_attempt: 1,
    head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
  }));
  return m;
}
function r15Directory(t) {
  const root = fixture(t);
  for (const [name, raw] of Object.entries(R15_HISTORY)) writeFileSync(join(root, name), raw);
  writeFileSync(
    join(root, "SHA256SUMS"),
    R15_FILES.map((name) => sha256(readFileSync(join(root, name))) + "  " + name + "\n").join(""),
  );
  return root;
}
test("R15 live original metadata admits only the terminal artifact and three exact jobs", () => {
  assert.equal(validateMetadata(r15Metadata()), true);
  for (const mutate of [
    (m) => (m.jobs.jobs[2].id = 129391860451),
    (m) => (m.run.id = 42685547737),
    (m) => (m.artifact.id = 13704636643),
    (m) => (m.artifact.size_in_bytes = 19861),
    (m) => (m.jobs.jobs[2].run_attempt = 2),
  ]) {
    const bad = r15Metadata();
    mutate(bad);
    assert.throws(() => validateMetadata(bad), /INSPECTION_METADATA/);
  }
});
test("R15 complete directory proves all twenty-two files before releasing original bytes", (t) => {
  const proof = JSON.parse(buildProof(r15Directory(t), inspection));
  assert.deepEqual(
    proof.manifest.map((entry) => entry.name),
    R15_FILES,
  );
  assert.equal(proof.source.run, 42788354465);
  assert.equal(proof.source.artifact, 13751191411);
  assert.equal(
    proof.manifest[20].sha256,
    "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  );
  assert.equal(
    proof.manifest[21].sha256,
    "92bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9",
  );
});
test("R15 rejects the old twenty-file layout instead of publishing a partial proof", (t) => {
  const root = fixture(t);
  for (const name of ["receipts-r13.json", "recovery-r13.json"])
    rmSync(join(root, name), { force: true });
  writeFileSync(
    join(root, "SHA256SUMS"),
    R15_FILES.slice(0, 20)
      .map((name) => sha256(readFileSync(join(root, name))) + "  " + name + "\n")
      .join(""),
  );
  assert.throws(() => buildProof(root, inspection), /INSPECTION_FILES/);
});
test("R15 refuses rewritten R13 history even with a recomputed manifest", (t) => {
  for (const name of ["receipts-r13.json", "recovery-r13.json"]) {
    const root = r15Directory(t);
    writeFileSync(join(root, name), "{}\n");
    writeFileSync(
      join(root, "SHA256SUMS"),
      R15_FILES.map((entry) => sha256(readFileSync(join(root, entry))) + "  " + entry + "\n").join(
        "",
      ),
    );
    assert.throws(() => buildProof(root, inspection));
  }
});

for (const code of ["RECOVERY_R13_LEDGER", "RECOVERY_R11_OPINION"]) {
  test("R15 retains the producer's closed failure " + code, () => {
    const value = report();
    value.failure = code;
    value.diagnostics.primaryFailure = code;
    const verified = validateRecords(value, empty());
    assert.equal(verified.report.failure, code);
    assert.equal(verified.report.completed, false);
  });
}
test("R15 rejects an unknown recovery enum without accepting its shared prefix", () => {
  const value = report();
  value.failure = "RECOVERY_R13_PRIVATE_CANARY";
  value.diagnostics.primaryFailure = "RECOVERY_R13_PRIVATE_CANARY";
  assert.throws(() => validateRecords(value, empty()));
});

function r16TechnicalReport() {
  const r = report();
  Object.assign(r.intentLedger, {
    count: 19,
    priorConfirmed: 17,
    priorReserved: 2,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 5,
  });
  r.recovery.maxNewIntentions = 5;
  return r;
}
test("R16 producer budget admits two reserved intentions without refund or promotion", () => {
  const result = validateRecords(r16TechnicalReport(), empty());
  assert.equal(result.observations.priorReserved, 2);
  assert.equal(result.observations.newArmedCount, 0);
  assert.equal(result.observations.newConfirmed, 0);
});
test("R16 producer recovery diagnostics admit only the two exact new enums", () => {
  for (const code of ["RECOVERY_R15_LEDGER", "RECOVERY_R15_OPINION"]) {
    const r = r16TechnicalReport();
    r.failure = code;
    r.diagnostics.primaryFailure = code;
    assert.doesNotThrow(() => validateRecords(r, empty()));
  }
});
test("R16 original run metadata is accepted only at the new immutable artifact pin", () => {
  const m = metadataFixture();
  Object.assign(m.run, {
    id: 42788354465,
    head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
  });
  Object.assign(m.upstream, {
    id: 42788083679,
    head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
  });
  Object.assign(m.artifact, {
    id: 13751191411,
    name: "trilha-a-fixtures-42788354465-1",
    size_in_bytes: 33862,
    digest: "sha256:142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536",
    workflow_run: {
      id: 42788354465,
      repository_id: 1442722734,
      head_repository_id: 1442722734,
      head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
      head_branch: "main",
    },
  });
  for (const [index, id] of [129735171394, 129735173939, 129735702128].entries())
    Object.assign(m.jobs.jobs[index], {
      id,
      run_id: 42788354465,
      head_sha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
    });
  assert.equal(validateMetadata(m), true);
});
test("R16 refuses the former twenty-two member data layout before publishing any proof", (t) => {
  const root = fixture(t);
  for (const name of ["receipts-r15.json", "recovery-r15.json"])
    rmSync(join(root, name), { force: true });
  writeFileSync(
    join(root, "SHA256SUMS"),
    FILES.slice(0, 22)
      .map((name) => sha256(readFileSync(join(root, name))) + "  " + name + "\n")
      .join(""),
  );
  assert.throws(() => buildProof(root, inspection));
});

test("R16 historical approval UUID and payload remain permanently separate from new receipts", () => {
  for (const receipt of [
    { ...row(), requestId: "6e6b6afb-2216-42ef-bd89-571301e97e1f" },
    {
      ...row(),
      rpc: "aprovar_parecer_interno",
      payloadSha256: "bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3",
    },
  ]) {
    const r = r16TechnicalReport();
    r.intentLedger.count = 18;
    r.intentLedger.newArmedCount = 1;
    assert.throws(() => validateRecords(r, { ...empty(), receipts: [receipt] }));
  }
});
test("R16 directory preserves the original uncertain R15 bytes and all twenty-one histories", (t) => {
  const root = fixture(t);
  const proof = JSON.parse(buildProof(root, inspection));
  assert.equal(proof.manifest.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(-8, -6), ["receipts-r15.json", "recovery-r15.json"]);
  const original = canonicalJson(Buffer.from(HISTORICAL["recovery-r15.json"])).value;
  assert.equal(Buffer.byteLength(HISTORICAL["recovery-r15.json"]), 6244);
  assert.equal(original.receiptsRaw, HISTORICAL["receipts-r15.json"]);
  assert.deepEqual(
    JSON.parse(original.receiptsRaw).receipts.map((receipt) => receipt.state),
    ["sealed", "uncertain"],
  );
  const previous = JSON.parse(original.reportRaw).intentLedger;
  assert.equal(previous.priorReserved, 1);
  assert.equal(previous.newArmedCount, 1);
  assert.equal(previous.maxNewIntentions, 13);
  for (const name of FILES.slice(-6, -4)) {
    const bad = fixture(t, (files) => {
      files[name] += " ";
    });
    assert.throws(() => buildProof(bad, inspection));
  }
});
test("R16 former one-reserve budget and unknown recovery enums fail closed", () => {
  const old = r16TechnicalReport();
  Object.assign(old.intentLedger, {
    count: 11,
    priorReserved: 1,
    newArmedCount: 0,
    maxNewIntentions: 13,
  });
  old.recovery.maxNewIntentions = 13;
  assert.throws(() => validateRecords(old, empty()));
  for (const code of ["RECOVERY_R15_PRIVATE_CANARY", "RECOVERY_R17_LEDGER_PRIVATE_CANARY"]) {
    const bad = r16TechnicalReport();
    bad.failure = code;
    bad.diagnostics.primaryFailure = code;
    assert.throws(() => validateRecords(bad, empty()));
  }
});

function r17TechnicalReport() {
  const value = report();
  Object.assign(value.intentLedger, {
    count: 19,
    priorConfirmed: 17,
    priorReserved: 2,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 5,
  });
  Object.assign(value.recovery, { confirmedBefore: 17, maxNewIntentions: 5 });
  return value;
}
test("R17 pins only the original terminal request artifact", () => {
  assert.deepEqual(
    [PIN.run, PIN.head, PIN.upstream, PIN.artifact, PIN.size, PIN.name, PIN.digest],
    [
      42788354465,
      "79b728cb12e7b1df037c5816c27842c0ef042d2b",
      42788083679,
      13751191411,
      33862,
      "trilha-a-fixtures-42788354465-1",
      "142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536",
    ],
  );
});
test("R20 complete manifest verifies thirty data files and twenty-seven immutable histories", (t) => {
  assert.equal(FILES.length, 30);
  assert.equal(Object.keys(HISTORY).length, 27);
  assert.deepEqual(FILES.slice(-2), ["receipts-r18.json", "recovery-r18.json"]);
  const proof = JSON.parse(buildProof(fixture(t), inspection));
  assert.equal(proof.manifest.length, 30);
});
test("R20 ledger exposes seventeen confirmations and both reservations without new business", () => {
  const value = validateRecords(r17TechnicalReport(), empty());
  assert.equal(value.observations.priorConfirmed, 17);
  assert.equal(value.observations.priorReserved, 2);
  assert.equal(value.observations.newArmedCount, 0);
  assert.equal(value.observations.newConfirmed, 0);
});
for (const code of [
  "RECOVERY_R16_LEDGER",
  "RECOVERY_R16_OPINION",
  "COMPETENCE_PRESENTATION_GATE_ANALYSIS",
  "COMPETENCE_PRESENTATION_GATE_OPINION",
  "COMPETENCE_PRESENTATION_GATE_PORTAO",
  "COMPETENCE_PRESENTATION_GATE_PERCENT",
  "COMPETENCE_PRESENTATION_GATE_ACTION",
]) {
  test("R17 exact producer diagnostic " + code + " is accepted without widening its prefix", () => {
    const value = r17TechnicalReport();
    value.failure = code;
    value.diagnostics.primaryFailure = code;
    assert.doesNotThrow(() => validateRecords(value, empty()));
    value.failure = code + "_PRIVATE_CANARY";
    value.diagnostics.primaryFailure = value.failure;
    assert.throws(() => validateRecords(value, empty()));
  });
}
const R17_PREVIOUS_EFFECTS = [
  [
    "criar_documento_competencia_v115",
    "d69325a4-78c8-4bf3-8831-cbef2fb38d95",
    "bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d",
  ],
  [
    "solicitar_analise_competencia",
    "368de7ea-0056-451a-b0da-30ee0e10ee62",
    "0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765",
  ],
  [
    "solicitar_parecer_interno",
    "57cde7b2-3ae8-4642-81fe-d45f4971a524",
    "4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f",
  ],
  [
    "aprovar_parecer_interno",
    "fb2af693-ede5-4d1a-99d3-408a2f7cb79e",
    "0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395",
  ],
];
for (const [rpc, requestId, payloadSha256] of R17_PREVIOUS_EFFECTS) {
  for (const mode of ["original UUID", "same payload under new UUID"]) {
    test("R17 denies prior confirmed " + rpc + " receipt: " + mode, () => {
      const value = report();
      value.intentLedger.count++;
      value.intentLedger.newArmedCount = 1;
      const receipt = {
        ...row(),
        rpc,
        ...(mode === "original UUID" ? { requestId } : { payloadSha256 }),
      };
      assert.throws(() => validateRecords(value, { ...empty(), receipts: [receipt] }));
    });
  }
}

test("R20 readonly budget rejects seven historical-style pairs, extras and refunded reservations", () => {
  const value = r17TechnicalReport();
  value.intentLedger.count = 24;
  value.intentLedger.newArmedCount = 7;
  const receipts = Array.from({ length: 7 }, (_, index) => {
    const requestId = "0000000" + (index + 1) + "-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    return [row(), row("confirmed")].map((item) => ({
      ...item,
      requestId,
      rpc: "aprovar_apresentacao",
    }));
  }).flat();
  assert.throws(() => validateRecords(value, { ...empty(), receipts }));
  assert.throws(() =>
    validateRecords(value, {
      ...empty(),
      receipts: [...receipts, { ...row(), requestId: "00000009-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }],
    }),
  );
  for (const mutate of [
    (r) => {
      r.intentLedger.count = 25;
      r.intentLedger.newArmedCount = 9;
    },
    (r) => {
      r.intentLedger.priorReserved = 1;
    },
    (r) => {
      r.intentLedger.priorConfirmed = 10;
      r.recovery.confirmedBefore = 10;
    },
    (r) => {
      r.intentLedger.maxNewIntentions = 12;
      r.recovery.maxNewIntentions = 12;
    },
  ]) {
    const bad = clone(value);
    mutate(bad);
    assert.throws(() => validateRecords(bad, { ...empty(), receipts }));
  }
});
test("R20 readonly rejects new receipts even with a different RPC and historical payload", () => {
  const value = r17TechnicalReport();
  value.intentLedger.count = 18;
  value.intentLedger.newArmedCount = 1;
  for (const [, , payloadSha256] of R17_PREVIOUS_EFFECTS) {
    const receipts = [row(), row("confirmed")].map((item) => ({
      ...item,
      rpc: "aprovar_apresentacao",
      payloadSha256,
    }));
    assert.throws(() => validateRecords(value, { ...empty(), receipts }));
  }
});
test("R17 preserves all four R16 confirmations and both historical uncertain reservations byte-exact", (t) => {
  const original = canonicalJson(Buffer.from(HISTORICAL["recovery-r16.json"])).value;
  assert.equal(Object.keys(original).length, 12);
  assert.equal(Buffer.byteLength(HISTORICAL["recovery-r16.json"]), 10749);
  assert.equal(Buffer.byteLength(HISTORICAL["receipts-r16.json"]), 5032);
  assert.equal(original.receiptsRaw, HISTORICAL["receipts-r16.json"]);
  const previous = JSON.parse(original.reportRaw).intentLedger;
  assert.equal(previous.priorConfirmed, 10);
  assert.equal(previous.priorReserved, 2);
  assert.equal(previous.newArmedCount, 4);
  assert.equal(previous.maxNewIntentions, 12);
  const confirmed = JSON.parse(original.receiptsRaw).receipts.filter(
    (item) => item.state === "confirmed",
  );
  assert.deepEqual(
    confirmed.map((item) => item.requestId),
    R17_PREVIOUS_EFFECTS.map(([, id]) => id),
  );
  for (const name of FILES.slice(-2)) {
    assert.throws(() =>
      buildProof(
        fixture(t, (files) => {
          files[name] += " ";
        }),
        inspection,
      ),
    );
  }
  const old = fixture(t);
  for (const name of FILES.slice(-2)) rmSync(join(old, name));
  writeFileSync(
    join(old, "SHA256SUMS"),
    FILES.slice(0, 24)
      .map((name) => sha256(readFileSync(join(old, name))) + "  " + name + "\n")
      .join(""),
  );
  assert.throws(() => buildProof(old, inspection));
});

test("R20 readonly inspector accepts only zero new business arms and empty receipts", () => {
  const r = report();
  assert.equal(validateRecords(r, empty()).observations.priorConfirmed, 17);
  for (const delta of [
    { count: 20, newArmedCount: 1 },
    { priorConfirmed: 15 },
    { priorReserved: 1 },
    { maxNewIntentions: 7 },
    { frozen: true },
    { pending: true },
    { sent: true },
  ]) {
    const bad = report();
    Object.assign(bad.intentLedger, delta);
    assert.throws(() => validateRecords(bad, empty()));
  }
  assert.throws(() => validateRecords(r, { ...empty(), receipts: [row()] }));
  assert.equal(
    HISTORY["receipts-r18.json"],
    "1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77",
  );
  assert.equal(
    HISTORY["recovery-r18.json"],
    "de5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac",
  );
});

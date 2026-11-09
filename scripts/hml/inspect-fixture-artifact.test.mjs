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
  validateDownloadOutput,
  validateMetadata,
  executeOfficialTool,
  buildProof,
  sha256,
} from "./inspect-fixture-artifact.mjs";

// Technical projections only. These are not the unread R6 report or a business replay.
const BASE = {
  schema: "contaos.fixture.preparation.v1",
  failure: "PREPARER_INCOMPLETE",
  diagnostics: {
    primaryFailure: "PREPARER_INCOMPLETE",
    failureClass: "PROTOCOL",
    errorName: "Error",
    subphase: "PREFLIGHT",
    subphasePath: [],
    lastCompletedSubphase: "PREFLIGHT",
    logoutAttempted: true,
    logoutVerified: true,
    cleanupFailure: null,
  },
  intentLedger: {
    count: 8,
    frozen: false,
    pending: false,
    sent: false,
    priorConfirmed: 8,
    newArmedCount: 0,
    maxIntentions: 24,
    maxNewIntentions: 16,
  },
  recovery: {
    ledgerSha256: "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",
    priorWorkflowRun: "42540864527",
    confirmedBefore: 8,
    maxNewIntentions: 16,
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
        code: "COMPETENCE_DEPENDENCY_BLOCKED",
      },
      {
        month: "2026-09-01",
        state: "partial",
        id: "79bdc139-ed10-4c91-905e-b32b9a824d27",
        code: "COMPETENCE_DEPENDENCY_BLOCKED",
      },
    ],
  },
  frontendSha: "437c788e32f0325dd15c9d2e7277c10129bcb462",
  harnessSha: "9cd01a472146c67c4a3cae5f3d9a6b5d7448716a",
  deploymentId: "dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp",
  workflowRun: "42585173702",
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
    "79bdc139-ed10-4c91-905e-b32b9a824d27",
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
};
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
  };
  mutate(content);
  for (const [name, raw] of Object.entries(content)) writeFileSync(join(root, name), raw);
  writeFileSync(
    join(root, "SHA256SUMS"),
    FILES.map((n) => sha256(Buffer.from(content[n])) + "  " + n + "\n").join(""),
  );
  return root;
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
    conclusion: "failure",
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
      [129053161135, "Trilha A solicitacao unica sem credenciais", "success"],
      [129053162669, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
      [129053499534, "Trilha A preparacao sintetica HML", "failure"],
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
test("R6 official digest is mandatory independently of successful child exit", () => {
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
test("R6 never reemits private child output and rejects getter/Proxy inputs", () => {
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
test("R6 metadata target, owner, uniqueness and attempt are fixed", () => {
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
test("R6 canonical UTF8 original has no hidden duplicate fields or trailer", () => {
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
test("R6 synthetic report projection validates closed fifteen-key schema", () => {
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
test("R6 missing ledger/bindings retains UNKNOWN without inventing zero operations", () => {
  const r = report();
  r.intentLedger = null;
  r.bindings = null;
  r.ids = [];
  const v = validateRecords(r, empty()).observations;
  assert.equal(v.newArmedCount, "UNKNOWN");
  assert.equal(v.newConfirmed, "UNKNOWN");
  assert.equal(v.bindings, "UNKNOWN");
});
test("R6 rows have eleven required keys and receipt state is not confirmed by inference", () => {
  const r = report();
  r.intentLedger.count = 9;
  r.intentLedger.newArmedCount = 1;
  const sealed = row(),
    confirmed = row("confirmed");
  assert.equal(Object.keys(sealed).length, 11);
  assert.equal(
    validateRecords(r, { ...empty(), receipts: [sealed] }).observations.newConfirmed,
    "UNKNOWN",
  );
  assert.equal(
    validateRecords(r, { ...empty(), receipts: [sealed, confirmed] }).observations.newConfirmed,
    1,
  );
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
test("R6 original six historical byte hashes match protected PLAN", () => {
  for (const [name, raw] of Object.entries(HISTORICAL))
    assert.equal(sha256(Buffer.from(raw)), HISTORY[name]);
});
test("R6 entire directory validates before one bounded proof is produced", (t) => {
  const root = fixture(t),
    proof = JSON.parse(buildProof(root, inspection));
  assert.equal(proof.type, "FIXTURE_INSPECTION_PROOF");
  assert.equal(proof.manifest.length, 8);
  assert.equal(proof.reportRaw, readFileSync(join(root, "report.json"), "utf8"));
  assert.equal(proof.receiptsRaw, readFileSync(join(root, "receipts.json"), "utf8"));
  assert.ok(Buffer.byteLength(JSON.stringify(proof)) <= 65536);
});
test("R6 unknown member/nested directory and symlinks/hardlinks fail closed", (t) => {
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
test("R6 manifest order/hash/history and late schema errors never produce partial proof", (t) => {
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
test("R6 shared deadline remains enforced before final proof publication", (t) => {
  const root = fixture(t);
  let calls = 0,
    output = "";
  assert.throws(() => {
    output = buildProof(root, inspection, () => {
      if (++calls === 11) throw Error("INSPECTION_DEADLINE");
    });
  });
  assert.equal(output, "");
});
test("R6 CLI rejects arbitrary arguments before metadata or downloader and emits only generic enum", () => {
  const child = spawnSync(
    process.execPath,
    ["scripts/hml/inspect-fixture-artifact.mjs", "--url=TOKEN_CANARY"],
    { env: {}, encoding: "utf8" },
  );
  assert.equal(child.status, 1);
  assert.equal(child.stdout, "");
  assert.equal(child.stderr, "FIXTURE_INSPECTION_FAILED\n");
});
test("R6 workflow grants actions read only to protected main inspector and has no authorization runtime", () => {
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

test("R6 official pinned bundle parses and fails closed without token or environment", () => {
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
test("R6 known binding roles and collected ids cannot smuggle unrelated UUIDs", () => {
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

test("R6 proof inspection origin is closed before serializing any caller object", (t) => {
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

test("R6 real downloader consumer fixes child inputs and keeps errors and private logs captured", () => {
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

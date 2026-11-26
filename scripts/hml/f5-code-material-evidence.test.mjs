import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { validateMaterial, BATCHES, BACKEND, A, B } from "./f5-code-material-evidence.mjs";
const U = "a3333333-3333-4333-8333-333333333333",
  V = "b3333333-3333-4333-8333-333333333333";
const identity = {
  frontend: "a".repeat(40),
  backend: BACKEND,
  harness: "b".repeat(40),
  run: "1",
  attempt: "1",
  job: "2",
};
const rows = [
  ["0005", "positive", U, A, A, "dashboard", "read", "ALLOW"],
  ["0005", "negative", V, B, A, "dashboard", "read", "DENY"],
  ["0036", "positive", V, B, B, "selector", "list", "ALLOW"],
  ["0036", "negative", V, B, A, "selector", "list", "ISOLATED"],
  ["0037", "positive", U, A, A, "dashboard", "read", "ALLOW"],
  ["0037", "negative", V, B, A, "dashboard", "read", "ISOLATED"],
  ["0043", "positive", U, B, B, "dashboard", "switch", "ALLOW"],
  ["0043", "negative", U, B, A, "dashboard", "switch", "ISOLATED"],
];
const titles = [
  "authorized reader sees own dashboard",
  "forged organization receives denial without dashboard",
  "B identity sees and selects B only",
  "old identity preference cannot select A",
  "login list and dashboard use authenticated A",
  "second identity does not inherit first cache",
  "real selector switch invalidates A cache",
  "delayed A data cannot render after B switch",
];
function fixture() {
  const obs = rows.map(([id, kind, actor, tenant, target, frontier, operation, decision]) => ({
    caseId: "IFV1-F5-C" + id,
    kind,
    actor,
    tenant,
    target,
    frontier,
    operation,
    decision,
    mode: "CODE_FIXTURE",
    role: "leitor",
    frontend: identity.frontend,
    backend: BACKEND,
    harness: identity.harness,
    run: identity.run,
    attempt: identity.attempt,
    job: identity.job,
    readback:
      kind === "positive"
        ? {
            visible: true,
            selected: target,
            foreignVisible: false,
            bindingVersion: 2,
            bindingCorrelationId: "a5000000-0000-4000-8000-000000000002",
          }
        : {
            foreignVisible: false,
            mutationCount: 0,
            status: 403,
            code: "42501",
            denialRendered: true,
            bindingStatus: 403,
            bindingCode: "42501",
            isolationObserved: true,
            oldCacheRendered: false,
          },
  }));
  return {
    obs,
    report: {
      success: true,
      numTotalTests: 8,
      numPassedTests: 8,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      testResults: [
        {
          name: "/workspace/src/test/f5-code-context-session-isolation.test.tsx",
          status: "passed",
          assertionResults: obs.map((o, i) => ({
            title: o.caseId + " " + o.kind + ": " + titles[i],
            status: "passed",
            ancestorTitles: ["F5 context material isolation"],
          })),
        },
      ],
    },
  };
}
test("F5 exact 54 canonical ids", () => {
  const firstSlice = ["adm01", "context", "competence", "data", "actions"];
  const ids = firstSlice.flatMap((batch) => BATCHES[batch]);
  const { cases } = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_1_CASE_CONTRACTS_PROPOSAL.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const batch of firstSlice) {
    const actual = BATCHES[batch];
    const canonical = cases.filter((x) => x.batch === batch).map((x) => x.caseId.slice(-4));
    assert.deepEqual([...actual].sort(), canonical.sort());
  }
  assert.equal(ids.length, 54);
  assert.equal(new Set(ids).size, 54);
});
test("F5 context receipt remains partial", () => {
  const { obs, report } = fixture();
  const r = validateMaterial("context", obs, report, identity);
  assert.equal(r.proofs, 8);
  assert.equal(r.certification, "NOT_CERTIFIED");
  assert.equal(r.live, "NOT_RUN");
});
for (const [name, mutate] of [
  ["missing", (o) => o.pop()],
  ["extra", (o) => o.push({ ...o[0], caseId: "IFV1-F5-C9999" })],
  ["same-size foreign case", (o) => (o[1].caseId = "IFV1-F5-C9999")],
  ["duplicate", (o) => (o[1] = o[0])],
  ["wrong tenant", (o) => (o[1].tenant = A)],
  ["wrong actor", (o) => (o[1].actor = U)],
  ["wrong role", (o) => (o[1].role = "administrador_master")],
  ["wrong SHA", (o) => (o[1].frontend = "c".repeat(40))],
  ["other phase", (o) => (o[1].caseId = "IFV1-F4-C0005")],
  ["wrong execution job", (o) => (o[1].job = "91")],
  ["forged LIVE", (o) => (o[1].mode = "LIVE")],
  ["empty observation", (o) => (o[1].readback = {})],
  [
    "transport failure",
    (o) => {
      o[1].readback.status = 500;
      o[1].readback.code = "XX000";
    },
  ],
  ["leak", (o) => (o[1].readback.foreignVisible = true)],
  ["mutation", (o) => (o[1].readback.mutationCount = 1)],
  ["unobserved isolation", (o) => (o[3].readback.isolationObserved = false)],
  ["missing positive", (o) => (o[0].readback.visible = false)],
])
  test("F5 reject " + name, () => {
    const { obs, report } = fixture();
    mutate(obs);
    assert.throws(() => validateMaterial("context", obs, report, identity));
  });
test("F5 reject skipped report", () => {
  const { obs, report } = fixture();
  report.testResults[0].assertionResults[0].status = "skipped";
  assert.throws(() => validateMaterial("context", obs, report, identity));
});
test("F5 rejects the right ID attached to an unrelated test", () => {
  const { obs, report } = fixture();
  report.testResults[0].assertionResults[0].title = "IFV1-F5-C0005 positive: count only";
  assert.throws(
    () => validateMaterial("context", obs, report, identity),
    /invalid\/duplicate test/,
  );
});
test("F5 rejects an alternate source file with valid assertion names", () => {
  const { obs, report } = fixture();
  report.testResults[0].name = "/workspace/src/test/f4-code-context-session-isolation.test.tsx";
  assert.throws(() => validateMaterial("context", obs, report, identity), /file identity/);
});
test("F5 rejects an observation set from another batch", () => {
  const { obs, report } = fixture();
  assert.throws(() => validateMaterial("adm01", obs, report, identity));
  assert.throws(() => validateMaterial("bad", obs, report, identity));
});
test("F5 reject wrong backend and missing job", () => {
  const { obs, report } = fixture();
  assert.throws(() =>
    validateMaterial("context", obs, report, { ...identity, backend: "c".repeat(40) }),
  );
  assert.throws(() => validateMaterial("context", obs, report, { ...identity, job: "" }));
});

const { cases: contractCases } = JSON.parse(
  readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_2_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
test("F5 exact 78 cumulative canonical ids", () => {
  const slices = ["adm01", "context", "competence", "data", "actions", "parties", "contracts"];
  const all = slices.flatMap((batch) => BATCHES[batch]);
  assert.equal(all.length, 78);
  assert.equal(new Set(all).size, 78);
  for (const [batch, origins] of [
    ["parties", ["V102", "V103"]],
    ["contracts", ["V105", "V106"]],
  ]) {
    assert.deepEqual(
      BATCHES[batch],
      contractCases.filter((c) => origins.includes(c.origin)).map((c) => c.caseId.slice(-4)),
    );
  }
});

const normativeCases = JSON.parse(
  readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_3_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
).cases;
const batchesF53 = [
  "adm01",
  "context",
  "competence",
  "data",
  "actions",
  "parties",
  "contracts",
  "normatives",
];
const batchesF54 = [...batchesF53, "contractdocuments", "competencedocuments"];
const batchesF55 = [...batchesF54, "competenceactions"];

test("F5 exact 95 cumulative canonical ids", () => {
  const ids = batchesF53.flatMap((batch) => BATCHES[batch]);
  assert.equal(ids.length, 95);
  assert.equal(new Set(ids).size, 95);
  assert.deepEqual(
    BATCHES.normatives,
    normativeCases.map((row) => row.caseId.slice(-4)),
  );
  assert.equal(normativeCases.filter((row) => row.classification === "CONDICIONAL").length, 3);
});

test("F5 exact 109 cumulative canonical ids", () => {
  const inventory = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_4_CASE_CONTRACTS_PROPOSAL.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ).cases;
  const all = batchesF54.flatMap((batch) => BATCHES[batch]);
  assert.equal(all.length, 109);
  assert.equal(new Set(all).size, 109);
  for (const [batch, origins] of [
    ["contractdocuments", ["V110", "V111"]],
    ["competencedocuments", ["V115"]],
  ]) {
    assert.deepEqual(
      BATCHES[batch],
      inventory.filter((row) => origins.includes(row.origin)).map((row) => row.caseId.slice(-4)),
    );
  }
  assert.equal(inventory.filter((row) => row.classification === "CONDICIONAL").length, 3);
});
test("F5 exact 128 cumulative canonical ids", () => {
  const inventory = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_5_CASE_CONTRACTS_PROPOSAL.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ).cases;
  const all = batchesF55.flatMap((batch) => BATCHES[batch]);
  assert.equal(all.length, 128);
  assert.equal(new Set(all).size, 128);
  assert.deepEqual(
    BATCHES.competenceactions,
    inventory.map((row) => row.caseId.slice(-4)),
  );
  assert.equal(inventory.filter((row) => row.classification === "CONDICIONAL").length, 3);
});

function normativeFixture() {
  const a = (n) => proofId("a", "530", n);
  const b = (n) => proofId("b", "530", n);
  const digest = (text) => createHash("sha256").update(text).digest("hex");
  const specs = {
    V107: [13, 12, "nao_aplicavel", "aplicavel", "Fonte F5.3 a"],
    V108: [22, 22, "rascunho", "publicada", "Orçamento F5.3 a"],
    V109: [31, 32, "rascunho", "publicada", "Fonte F5.3 a"],
  };
  const consumer = {
    V109: 33,
    V113: 42,
    V114: 41,
    V115: 42,
    V116: 42,
    V117: 42,
    V118: 45,
    V119: 41,
    V123: 50,
  };
  const observations = normativeCases.flatMap((row) => {
    const { caseId, origin, destination } = row;
    const [ref, version, before, after, hashSeed] = specs[origin];
    const producer = "rpc/" + row.producer;
    const common = {
      ...identity,
      caseId,
      origin,
      destination,
      mode: "CODE_FIXTURE",
      target: A,
      frontier: row.consumer,
      operation: origin === "V107" ? "apply" : "publish",
    };
    const positive = {
      producer,
      organizationId: A,
      contractId: a(1),
      ref: a(ref),
      version: a(version),
      previousState: before,
      state: after,
      validFrom: "2026-11-01",
      checksum: digest(hashSeed),
      downstreamId: a(consumer[destination]),
      foreignVisible: false,
      ...(origin !== "V109" || destination === "V123" ? { correlation: a(51) } : {}),
      ...(origin === "V108" ? { linkedItem: a(23), sourceDocId: a(24) } : {}),
      ...(origin === "V109" ? { linkedItem: a(33), sourceRef: a(12), requestId: a(52) } : {}),
      ...(["V109", "V113", "V116", "V117"].includes(destination)
        ? { downstreamSource: a(12) }
        : {}),
      ...(["V113", "V116", "V117", "V118"].includes(destination)
        ? { snapshot: digest("Histórico F5.3 a") }
        : {}),
      ...(["V114", "V118", "V119"].includes(destination)
        ? { canPresent: false, previousCanPresent: true }
        : {}),
      ...(destination === "V115" ? { missing: true } : {}),
      ...(destination === "V116" ? { stale: true, previousStale: false } : {}),
      ...(destination === "V123" ? { eventName: row.conditionalEvent, eventEntity: a(ref) } : {}),
    };
    const negative = {
      producer,
      ownOrganizationId: B,
      ownContractId: b(1),
      ownMaterialId: b(ref),
      ownVersionId: b(version),
      targetMaterialId: a(ref),
      targetState: before,
      foreignVisible: false,
      mutationCount: 0,
      status: 403,
      code: "42501",
      ...(caseId.endsWith("0232") ? { rejectedHashAsConflict: true } : {}),
      ...(caseId.endsWith("0264") ? { transportSeparated: true } : {}),
    };
    return [
      {
        ...common,
        kind: "positive",
        role: "administrador",
        actor: U,
        tenant: A,
        decision: "ALLOW",
        readback: positive,
      },
      {
        ...common,
        kind: "negative",
        role: "leitor",
        actor: V,
        tenant: B,
        decision: "DENY",
        readback: negative,
      },
    ];
  });
  const report = {
    success: true,
    numTotalTests: 34,
    numPassedTests: 34,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    testResults: [
      {
        name: "/workspace/src/test/f5-code-v107-v108-v109-scope-isolation.test.ts",
        status: "passed",
        assertionResults: observations.map((o) => ({
          status: "passed",
          ancestorTitles: ["F5 V107/V108/V109 normative scope isolation"],
          title:
            o.caseId +
            " " +
            o.kind +
            ": " +
            (o.kind === "positive"
              ? "authorized material change reaches the scoped consumer"
              : "foreign material change is denied and remains hidden"),
        })),
      },
    ],
  };
  return { observations, report };
}
test("F5.3 verifier accepts the exact normative pairs as a partial receipt", () => {
  const { observations, report } = normativeFixture();
  const receipt = validateMaterial("normatives", observations, report, identity);
  assert.deepEqual(
    [receipt.covered, receipt.proofs, receipt.certification],
    [17, 34, "NOT_CERTIFIED"],
  );
});
for (const [label, id, kind, field, value, error] of [
  [
    "a source from another tenant",
    "0200",
    "positive",
    "downstreamSource",
    proofId("b", "530", 12),
    /consumer history/,
  ],
  [
    "an altered budget checksum",
    "0237",
    "positive",
    "checksum",
    "0".repeat(64),
    /checksum or consumer/,
  ],
  [
    "a different audit entity",
    "0268",
    "positive",
    "eventEntity",
    proofId("b", "530", 31),
    /audit lineage/,
  ],
  [
    "a version conflict presented as authorization denial",
    "0232",
    "negative",
    "code",
    "PT409",
    /authorization denial/,
  ],
  ["a foreign state change", "0264", "negative", "targetState", "publicada", /changed target/],
  [
    "an unclassified transport failure",
    "0264",
    "negative",
    "transportSeparated",
    false,
    /missing denial controls/,
  ],
]) {
  test("F5.3 rejects " + label, () => {
    const { observations, report } = normativeFixture();
    const proof = observations.find((o) => o.caseId.endsWith(id) && o.kind === kind);
    proof.readback[field] = value;
    assert.throws(() => validateMaterial("normatives", observations, report, identity), error);
  });
}
function proofId(side, series, index) {
  return side + series + "0000-0000-4000-8000-" + String(index).padStart(12, "0");
}
function partyFixture() {
  const ids = BATCHES.parties;
  const suite = "F5 V102/V103 party scope isolation";
  const obs = ids.flatMap((id) => {
    const c = contractCases.find((row) => row.caseId.endsWith(id));
    const create = c.origin === "V102";
    const producer = create ? "contratantes" : "rpc/atualizar_contratante";
    const partyId = proofId("a", "520", 1);
    const linksContract = ["V104", "V106"].includes(c.destination);
    const audit = c.destination === "V123";
    const common = {
      ...identity,
      caseId: c.caseId,
      mode: "CODE_FIXTURE",
      target: A,
      frontier: c.consumer,
      origin: c.origin,
      destination: c.destination,
      operation: create ? "create" : "update",
    };
    return [
      {
        ...common,
        kind: "positive",
        role: "administrador",
        actor: U,
        tenant: A,
        decision: "ALLOW",
        readback: {
          producer,
          foreignVisible: false,
          partyId,
          organizationId: A,
          version: create ? 1 : 2,
          visible: 1,
          resultId: audit
            ? proofId("a", "520", 3)
            : linksContract
              ? proofId("a", "520", 2)
              : partyId,
          ...(linksContract ? { relatedPartyId: partyId } : {}),
          ...(audit
            ? {
                event: create ? "ContratanteCriado" : "ContratanteAtualizado",
                eventEntityId: partyId,
                correlationId: proofId("a", "520", 4),
              }
            : {}),
        },
      },
      {
        ...common,
        kind: "negative",
        role: "leitor",
        actor: V,
        tenant: B,
        decision: "DENY",
        readback: {
          producer,
          foreignVisible: false,
          visible: 0,
          ownOrganizationId: B,
          ownVersion: 1,
          ownMaterialId: proofId("b", "520", 1),
          mutationCount: 0,
          code: "42501",
          status: 403,
          ...(id === "0107" ? { classifiedConflict: "conflito", classifiedTransport: "erro" } : {}),
        },
      },
    ];
  });
  const report = {
    success: true,
    numTotalTests: obs.length,
    numPassedTests: obs.length,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    testResults: [
      {
        name: "/workspace/src/test/f5-code-v102-v103-scope-isolation.test.ts",
        status: "passed",
        assertionResults: obs.map((o) => ({
          status: "passed",
          ancestorTitles: [suite],
          title:
            o.caseId +
            " " +
            o.kind +
            ": " +
            (o.kind === "positive"
              ? "authorized party mutation reaches the scoped consumer"
              : "foreign party mutation is denied and remains hidden"),
        })),
      },
    ],
  };
  return { obs, report };
}
test("F5.2 accepts scoped party pairs as a partial receipt", () => {
  const { obs, report } = partyFixture();
  const receipt = validateMaterial("parties", obs, report, identity);
  assert.equal(receipt.covered, 9);
  assert.equal(receipt.proofs, 18);
  assert.equal(receipt.certification, "NOT_CERTIFIED");
});
for (const [label, id, kind, key, value, failure] of [
  ["consumer", "0093", "positive", "destination", "V103", /producer\/consumer mismatch/],
  [
    "association",
    "0111",
    "positive",
    "relatedPartyId",
    proofId("b", "520", 1),
    /contract reference changed/,
  ],
  [
    "audit corruption",
    "0100",
    "positive",
    "correlationId",
    proofId("b", "520", 4),
    /audit event or correlation mismatch/,
  ],
  [
    "conflict as authorization",
    "0107",
    "negative",
    "code",
    "PT409",
    /authorization denial missing/,
  ],
  [
    "transport classification",
    "0107",
    "negative",
    "classifiedTransport",
    "negado",
    /were not distinguished/,
  ],
]) {
  test("F5.2 rejects " + label, () => {
    const { obs, report } = partyFixture();
    const entry = obs.find((o) => o.caseId.endsWith(id) && o.kind === kind);
    if (key === "destination") entry[key] = value;
    else entry.readback[key] = value;
    assert.throws(() => validateMaterial("parties", obs, report, identity), failure);
  });
}

import test from "node:test";
import assert from "node:assert/strict";
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
        ? { visible: true, selected: target, foreignVisible: false }
        : {
            foreignVisible: false,
            mutationCount: 0,
            status: 403,
            code: "42501",
            denialRendered: true,
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
  const ids = Object.values(BATCHES).flat();
  const { cases } = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_1_CASE_CONTRACTS_PROPOSAL.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const [batch, actual] of Object.entries(BATCHES)) {
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
test("F5 reject unknown or unimplemented batch", () => {
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

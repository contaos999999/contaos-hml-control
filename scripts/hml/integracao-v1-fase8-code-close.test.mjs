import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { checkF7, checkReview, reconcileCriteria } from "./integracao-v1-fase8-code-close.mjs";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const pin = json("docs/frontend/auditorias/integracao-funcional-v1/fase8/F8_CODE_SOURCES.json");
const historic = json(pin.historical.files[1].path);
const inventory = json(pin.governance.inventory.path);
const checkpoints = Object.fromEntries(pin.historical.checkpoints.map((x) => [x.phase, x.id]));

test("all 488 current criterion keys and texts match the original decisions", () => {
  const report = reconcileCriteria(historic, inventory, checkpoints);
  assert.deepEqual(
    [
      report.criteria,
      report.legacyCriteria,
      report.normalizedCriteria,
      report.regulares,
      report.atomicV1Brand,
      report.nfr,
      report.unresolved,
    ],
    [488, 416, 72, 45, 25, 12, 0],
  );
  assert.deepEqual(report.historicalDecisions, { PASS_REAL: 473, ACEITE_RESSALVA_R03: 15 });
});

test("omitted and duplicate criteria cannot satisfy the decision counts", () => {
  const omitted = structuredClone(historic);
  omitted.criteria.pop();
  assert.throws(
    () => reconcileCriteria(omitted, inventory, checkpoints),
    /Missing historical criterion/,
  );
  omitted.criteria.push(omitted.criteria[0]);
  assert.throws(() => reconcileCriteria(omitted, inventory, checkpoints), /Duplicate criterion/);
});

test("criterion substitution and an unbound original checkpoint are rejected", () => {
  const revised = structuredClone(historic);
  revised.criteria[0].criterion_text = "another requirement";
  assert.throws(
    () => reconcileCriteria(revised, inventory, checkpoints),
    /Criterion text\/source mismatch/,
  );
  revised.criteria[0].criterion_text = historic.criteria[0].criterion_text;
  revised.criteria[0].proof = ["phase1:1000"];
  assert.throws(
    () => reconcileCriteria(revised, inventory, checkpoints),
    /Unbound historical checkpoint/,
  );
});

test("the new disposition cannot upgrade or broaden R-03", () => {
  const revised = structuredClone(historic);
  const row = revised.criteria.find((c) => c.decision === "ACEITE_RESSALVA_R03");
  row.decision = "PASS_REAL";
  assert.throws(() => reconcileCriteria(revised, inventory, checkpoints), /Decision or R-03 scope/);
  row.decision = "ACEITE_RESSALVA_R03";
  revised.accepted_exceptions.push("EXTRA");
  assert.throws(
    () => reconcileCriteria(revised, inventory, checkpoints),
    /Historical exceptions changed/,
  );
});

test("NFRs appearing in both original tables retain the narrower assessment", () => {
  const revised = structuredClone(historic);
  revised.nfr_assessment[0].decision = "PASS_REAL";
  assert.throws(
    () => reconcileCriteria(revised, inventory, checkpoints),
    /Historical NFR scope changed/,
  );
  revised.nfr_assessment.shift();
  assert.throws(
    () => reconcileCriteria(revised, inventory, checkpoints),
    /Missing historical NFR assessment/,
  );
});

test("F7 requires the promoted receipt and the exact assisted review", () => {
  const manifest = json(
    pin.f7.files.find((file) => file.path.endsWith("/F7_CODE_CERTIFICATION.json")).path,
  );
  const receipt = json(manifest.receipt.path);
  checkF7(manifest, receipt, pin.f7);
  assert.throws(() => checkF7(manifest, { ...receipt, attempt: 0 }, pin.f7));
  const p = pin.f7;
  const pr = {
    number: p.pr,
    merged: true,
    head: { sha: p.head },
    base: { ref: "main" },
    merge_commit_sha: p.merge,
    user: { id: 1 },
  };
  const review = {
    id: p.review,
    user: { login: "Edivan5002", id: 2 },
    commit_id: p.head,
    state: "APPROVED",
  };
  checkReview(pr, p, review);
  assert.throws(
    () => checkReview(pr, p, { ...review, commit_id: "0".repeat(40) }),
    /Assisted review mismatch/,
  );
});

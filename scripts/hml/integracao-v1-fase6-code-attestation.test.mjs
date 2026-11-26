import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { backendSha, loadMatrix } from "./f6-code-material-evidence.mjs";
import {
  buildCandidate,
  checkInventory,
  phaseDirectory,
  sha256,
  verifySource,
} from "./integracao-v1-fase6-code-attestation.mjs";

const inventory = JSON.parse(readFileSync(phaseDirectory + "F6_CANONICAL_CASES.json", "utf8"));
const matrix = checkInventory(loadMatrix(), inventory);

function proofs() {
  return [...matrix.cases, ...matrix.transversal].flatMap((row) =>
    ["positive", "negative"].map((polarity) => ({
      caseId: row.caseId,
      batch: row.batch,
      polarity,
      scope: "CODE_FIXTURE",
      outcome: "PASS",
      cleanup: "CLEAN",
      observationDigest: sha256(row.caseId + ":" + polarity),
    })),
  );
}

test("F6 candidate preserves the canonical 138 pairs and four supplementary pairs", () => {
  const candidate = buildCandidate({}, matrix, proofs());
  assert.equal(candidate.entries.length, 138);
  assert.equal(candidate.supplementary.length, 4);
  assert.equal(candidate.counts.proofs, 276);
  assert.equal(candidate.counts.supplementaryProofs, 8);
  assert.equal(candidate.entries.filter((row) => row.classification === "OBRIGATORIA").length, 120);
  assert.equal(candidate.entries.filter((row) => row.classification === "CONDICIONAL").length, 18);
  assert.equal(candidate.certification, "NOT_CERTIFIED");
});

test("F6 candidate rejects an omitted case, a reused proof, or an unobserved cleanup", () => {
  const p = proofs();
  assert.throws(() => buildCandidate({}, matrix, p.slice(1)), /Positive and negative coverage/);
  const duplicate = p.with(0, p[1]);
  assert.throws(() => buildCandidate({}, matrix, duplicate), /Positive and negative coverage/);
  const uncleared = p.with(0, { ...p[0], cleanup: "PENDING" });
  assert.throws(() => buildCandidate({}, matrix, uncleared), /Invalid proof scope/);
  const altered = structuredClone(inventory);
  altered.cases[0].producer = "another_source";
  assert.throws(() => checkInventory(matrix, altered), /Canonical inventory changed/);
});

test("F6 source rejects an unbound backend before reaching GitHub", () => {
  const source = {
    pr: 1,
    repository: "contaos999999/contaos-hml-control",
    backend: backendSha.replace(/^./, "0"),
  };
  const unexpected = () => {
    throw Error("Should reject before API calls");
  };
  assert.throws(
    () => verifySource(source, matrix, unexpected, unexpected),
    /Invalid pinned material source/,
  );
});

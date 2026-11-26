import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildCandidate,
  catalogue,
  matrixPath,
  phaseDirectory,
  replayBatch,
  sha256,
  verifySource,
} from "./integracao-v1-fase5-code-attestation.mjs";

const input = readFileSync(matrixPath, "utf8");
const inventory = Array.from({ length: 6 }, (_, i) =>
  JSON.parse(
    readFileSync(
      phaseDirectory + "F5_" + (i + 1) + "_CASE_CONTRACTS_PROPOSAL.json",
      "utf8",
    ),
  ),
).flatMap((x) => x.cases);
const proofs = inventory.flatMap((c) =>
  ["positive", "negative"].map((polarity) => ({
    caseId: c.caseId,
    polarity,
    outcome: "PASS",
    mode: "CODE_FIXTURE",
    observationDigest: "a".repeat(64),
  })),
);

test("F5 catalogue binds every source connection and all classifications", () => {
  const exact = catalogue(input, inventory);
  const pending = buildCandidate({}, exact, proofs);
  assert.equal(pending.state, "CANDIDATE_NOT_CERTIFIED");
  assert.equal(pending.counts.cases, 138);
  assert.equal(pending.entries.flatMap((c) => c.tests).length, 276);
  assert.equal(pending.live, "NOT_RUN");
  assert.equal(pending.production, "NO-GO");
});

test("F5 catalogue rejects a same-cardinality foreign connection and source substitution", () => {
  const tampered = structuredClone(inventory);
  tampered[0].connection = tampered[1].connection;
  assert.throws(() => catalogue(input, tampered), /Matrix binding/);
  tampered[0] = { ...inventory[0], sourceReferences: "incorrect reference" };
  assert.throws(() => catalogue(input, tampered), /Matrix binding/);
});

test("F5 candidate rejects a duplicate polarity and failed evidence", () => {
  const exact = catalogue(input, inventory);
  const duplicate = structuredClone(proofs);
  duplicate[1] = duplicate[0];
  assert.throws(() => buildCandidate({}, exact, duplicate), /coverage/);
  const failed = structuredClone(proofs);
  failed[1].outcome = "FAIL";
  assert.throws(() => buildCandidate({}, exact, failed), /proof scope/);
});

test("F5 attestation rejects the wrong repository and bytes outside the pinned ZIP", () => {
  assert.throws(
    () => verifySource({ pr: 790, repository: "different" }),
    /pinned material source/,
  );
  const original = Buffer.from("original record");
  assert.throws(
    () =>
      replayBatch(
        {},
        { name: "closure", digest: sha256(original) },
        Buffer.from("altered"),
        {},
      ),
    /ZIP digest mismatch/,
  );
});

test("F5 attestation rejects a duplicate or misbound manifest inside a matching archive", () => {
  const archive = Buffer.from("fixture");
  const report = Buffer.from('{"success":true}');
  const contents = {
    "observations.json": Buffer.from("[]"),
    "receipt.json": Buffer.from("{}"),
    "vitest.json": report,
    SHA256SUMS: Buffer.from(
      "b".repeat(64) +
        "  observations.json\n" +
        "b".repeat(64) +
        "  observations.json\n" +
        sha256(report) +
        "  vitest.json",
    ),
  };
  assert.throws(
    () =>
      replayBatch(
        {},
        { name: "closure", digest: sha256(archive) },
        archive,
        contents,
      ),
    /SHA256SUMS inventory/,
  );
});

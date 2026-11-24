import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  assessF3CodeInventory,
  assessF3CodeInventoryFromRepo,
  F3_CODE_CASES_PATH,
  F3_CODE_MATRIX_PATH,
  F3_CODE_LEDGER_PATH,
  F3_CODE_CSV_PATH,
} from "./integracao-v1-fase3-code-gate.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const originals = await Promise.all(
  [F3_CODE_CASES_PATH, F3_CODE_MATRIX_PATH, F3_CODE_LEDGER_PATH, F3_CODE_CSV_PATH].map((path) =>
    readFile(join(root, path), "utf8"),
  ),
);
const matrix = JSON.parse(originals[1]);

test("F3 CODE: inventory has 138 NOT_RUN cases, 276 source hints and no false PASS", async () => {
  const report = await assessF3CodeInventoryFromRepo(root);
  assert.deepEqual(report, {
    state: "NOT_CERTIFIED",
    total: 138,
    mandatory: 120,
    conditional: 18,
    sourceHints: 276,
    verifiedSourcePaths: false,
    executedCases: 0,
    verifiedCases: 0,
    remainingCases: 138,
    nextGate: "F3_CODE_EXECUTION_EVIDENCE",
  });
});

test("F3 CODE: stale or altered canonical case source fails closed", () => {
  const altered = originals[0].replace('"count": 138', '"count": 137');
  assert.throws(
    () => assessF3CodeInventory(altered, originals[1], originals[2], originals[3]),
    { code: "F3_CODE_CASES_DRIFT" },
  );
});

test("F3 CODE: a forged executed receipt or completeness flag never becomes PASS", () => {
  const forged = JSON.parse(originals[1]);
  forged.cases[0].proofState = "PASS";
  forged.cases[0].testIds = ["fabricated-test"];
  assert.throws(
    () => assessF3CodeInventory(originals[0], JSON.stringify(forged), originals[2], originals[3]),
    { code: "F3_CODE_UNVERIFIED_RECEIPT" },
  );
  const ledger = JSON.parse(originals[2]);
  ledger.state = "CERTIFIED";
  assert.throws(
    () => assessF3CodeInventory(originals[0], originals[1], JSON.stringify(ledger), originals[3]),
    { code: "F3_CODE_UNVERIFIED_RECEIPT" },
  );
});

test("F3 CODE: stale CSV or redirected source hint never passes as canonical", () => {
  assert.throws(
    () => assessF3CodeInventory(originals[0], originals[1], originals[2], originals[3] + " "),
    { code: "F3_CODE_MATRIX_SOURCE_DRIFT" },
  );
  const forged = JSON.parse(originals[1]);
  forged.cases[0].sourceHints = [...forged.cases[1].sourceHints];
  assert.throws(
    () => assessF3CodeInventory(originals[0], JSON.stringify(forged), originals[2], originals[3]),
    { code: "F3_CODE_SOURCE_MAP" },
  );
});

test("F3 CODE: missing or duplicate case fails closed even with identical case count", () => {
  const forged = JSON.parse(originals[1]);
  forged.cases[1] = structuredClone(forged.cases[0]);
  assert.throws(
    () => assessF3CodeInventory(originals[0], JSON.stringify(forged), originals[2], originals[3]),
    { code: "F3_CODE_MATRIX_MISMATCH" },
  );
});

for (const item of matrix.cases) {
  test("F3 SOURCE LINK " + item.caseId + " verifies referenced product files exist (not functional proof)", async () => {
    for (const hint of item.sourceHints) {
      const [path, anchor] = hint.split(":");
      assert.match(path, /^src\/[a-zA-Z0-9_./-]+\.(ts|tsx)$/);
      assert.equal((await stat(join(root, path))).isFile(), true, hint);
      const source = await readFile(join(root, path), "utf8");
      assert.ok(source.split("\n").length >= Number(anchor), hint);
    }
    assert.equal(item.proofState, "NOT_RUN");
  });
}

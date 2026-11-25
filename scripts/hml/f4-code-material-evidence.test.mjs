/**
 * Negative probe of the actual CI evidence validator, not product or LIVE proof.
 * Synthetic observations/reporter output are isolated in a temporary directory.
 * The RED is a real acceptance bug in the original inline collector.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const workflowPath = fileURLToPath(new URL("../../.github/workflows/contaos-f4-code-material.yml", import.meta.url));
const validatorPath = fileURLToPath(new URL("./f4-code-material-evidence.mjs", import.meta.url));
const expected = [
  "0002", "0007", "0009", "0011", "0012", "0014", "0016", "0017", "0018", "0019",
  "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "0029",
  "0030", "0031", "0032", "0033", "0034",
].map(id => "IFV1-F4-C" + id);

function probe(ids = expected) {
  const observations = ids.flatMap(caseId => ["positive", "negative"].map(kind => ({
    caseId, kind, mode: "CODE_FIXTURE", readback: { syntheticAdversarialProbe: true },
  })));
  return {
    observations,
    vitest: {
      numPassedTests: observations.length,
      numFailedTests: 0,
      numPendingTests: 0,
      numTotalTests: observations.length,
      success: true,
      testResults: [{ assertionResults: observations.map(x => ({
        status: "passed", title: x.caseId + " " + x.kind + ": synthetic negative probe",
      })) }],
    },
  };
}

function runActualVerifier(input) {
  const dir = mkdtempSync(join(tmpdir(), "f4-collector-probe-"));
  try {
    const output = join(dir, "artifacts", "f4-code");
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, "observations.json"), JSON.stringify(input.observations));
    writeFileSync(join(output, "vitest.json"), JSON.stringify(input.vitest));
    const workflow = readFileSync(workflowPath, "utf8");
    // The same test runs on the original inline implementation and on the
    // extracted validator when CI itself is switched to that implementation.
    const inline = /node --input-type=module <<'JS'\r?\n([\s\S]*?)\r?\n\s*JS(?:\r?\n|$)/.exec(workflow);
    let args;
    if (inline) args = ["--input-type=module", "--eval", inline[1]];
    else {
      assert.match(workflow, /node scripts\/hml\/f4-code-material-evidence\.mjs/);
      args = [validatorPath, "--batch", "adm01"];
    }
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/(TOKEN|SECRET|PASSWORD|API_KEY|AUTH_KEY|PRIVATE_KEY)/i.test(k)));
    Object.assign(env, {
      JOB_ID: "1", GITHUB_SHA: "a".repeat(40), GITHUB_RUN_ID: "1",
      GITHUB_RUN_ATTEMPT: "1", F4_CODE_OUTPUT_DIR: output,
    });
    const proc = spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env });
    assert.equal(proc.error, undefined, proc.error?.message);
    const receiptPath = join(output, "receipt.json");
    return { status: proc.status, stderr: proc.stderr, receipt: existsSync(receiptPath) ? JSON.parse(readFileSync(receiptPath, "utf8")) : null };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("F4 CODE material verifier rejects noncanonical case IDs", () => {
  const foreign = Array.from({ length: 25 }, (_, i) => "FOREIGN-" + (i + 1));
  const result = runActualVerifier(probe(foreign));
  assert.notEqual(result.status, 0, "original collector accepted all 25 foreign IDs");
  assert.equal(result.receipt, null, "rejected evidence must not generate a receipt");
});

test("F4 CODE material verifier accepts exact canonical ID pairs", () => {
  const result = runActualVerifier(probe());
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.receipt?.covered, 25);
  assert.equal(result.receipt?.proofs, 50);
  assert.equal(result.receipt?.certification, "NOT_CERTIFIED");
});

test("F4 CODE material verifier rejects incomplete or duplicate proofs", () => {
  const input = probe();
  input.observations[0] = structuredClone(input.observations[1]);
  const result = runActualVerifier(input);
  assert.notEqual(result.status, 0);
  assert.equal(result.receipt, null);
});

test("F4 CODE material verifier rejects a nonexecuted proof", () => {
  const input = probe();
  input.vitest.testResults[0].assertionResults[0].status = "pending";
  const result = runActualVerifier(input);
  assert.notEqual(result.status, 0);
  assert.equal(result.receipt, null);
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  checkArtifact,
  checkPair,
  checkRun,
  readInputs,
  reconcile,
  verifyMember,
} from "./integracao-v1-fase7-code-reconcile.mjs";

const source = JSON.parse(
  readFileSync(
    "docs/frontend/auditorias/integracao-funcional-v1/fase7/F7_CODE_SOURCES.json",
    "utf8",
  ),
);
const inputs = readInputs(source);

test("the 138 canonical connections retain all four material pairs", () => {
  const trace = reconcile(source, inputs);
  assert.equal(trace.rows.length, 138);
  assert.equal(trace.rows.flatMap((r) => r.proofs.flatMap((p) => p.pair)).length, 1104);
  assert.equal(trace.supplementary.flatMap((r) => r.pair).length, 8);
  assert.equal(trace.counts.navigation, 52);
  assert.equal(trace.counts.certificates, 6);
});

test("substituting a canonical ID or changing a connection fails reconciliation", () => {
  const changed = structuredClone(inputs);
  changed.ledgers[0].entries[0].caseId = "IFV1-F3-C9999";
  assert.throws(() => reconcile(source, changed), /Missing or changed case/);
  const other = structuredClone(inputs);
  other.canonicalRows[0].tela_destino = "SYS02";
  assert.throws(() => reconcile(source, other), /Canonical connection changed/);
});

test("a missing, duplicate, or skipped proof is rejected", () => {
  const { caseId, tests } = inputs.ledgers[0].entries[0];
  assert.throws(() => checkPair(caseId, tests.slice(0, 1)), /Missing or extra proof/);
  assert.throws(() => checkPair(caseId, [tests[0], tests[0]]), /Duplicate evidence identity/);
  assert.throws(
    () => checkPair(caseId, [{ ...tests[0], outcome: "SKIPPED" }, tests[1]]),
    /Invalid/,
  );
});

test("scope drift and historical navigation rows from another deployment fail", () => {
  const changed = structuredClone(inputs);
  changed.ledgers[3].entries[0].origin = "SYS02";
  assert.throws(() => reconcile(source, changed), /Unbound case/);
  const row = changed.navigation.find(
    (n) =>
      n.status === "PASS" &&
      n.frontendSha === source.navigation.frontend &&
      n.deploymentId === source.navigation.deployment,
  );
  row.deploymentId = "different";
  assert.throws(() => reconcile(source, changed), /51 !== 52/);
});

test("run attempt and artifact hash must match GitHub metadata", () => {
  const {
    run,
    archives: [a],
  } = source.materialGroups.find((g) => g.phase === 6 && g.role === "material");
  const observed = {
    id: run.id,
    name: run.name,
    path: run.path,
    head_sha: run.head,
    event: run.event,
    run_attempt: run.attempt,
    status: "completed",
    conclusion: run.conclusion,
  };
  checkRun(run, observed);
  assert.throws(
    () => checkRun(run, { ...observed, run_attempt: run.attempt + 1 }),
    /Native run mismatch/,
  );
  const art = {
    id: a.id,
    name: a.name,
    expired: false,
    digest: "sha256:" + a.zipSha256,
    workflow_run: { id: run.id, head_sha: run.head },
  };
  checkArtifact(a, run, art);
  assert.throws(
    () => checkArtifact(a, run, { ...art, digest: "sha256:" + "0".repeat(64) }),
    /Artifact origin mismatch/,
  );
  assert.throws(
    () => checkArtifact(a, run, { ...art, workflow_run: { id: run.id, head_sha: "0".repeat(40) } }),
    /Artifact origin mismatch/,
  );
});

test("the F3 report retains its stored bytes and its own canonical hash", () => {
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  const body = { schema: "report-fixture", passed: 2 };
  const reportSha256 = digest(JSON.stringify(body));
  const member = Buffer.from(JSON.stringify({ ...body, reportSha256 }, null, 2) + "\n");
  const archive = execFileSync(
    "python3",
    [
      "-c",
      "import io,sys,zipfile; out=io.BytesIO(); z=zipfile.ZipFile(out,'w'); z.writestr('report.json',sys.stdin.buffer.read()); z.close(); sys.stdout.buffer.write(out.getvalue())",
    ],
    { input: member },
  );
  const pin = { id: 1, memberSha256: digest(member), zipSha256: digest(archive), reportSha256 };
  verifyMember(pin, archive);
  assert.throws(
    () => verifyMember({ ...pin, reportSha256: "0".repeat(64) }, archive),
    /Original report identity/,
  );
});

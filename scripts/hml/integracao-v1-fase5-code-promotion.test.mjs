import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import {
  candidateFile,
  sha256,
} from "./integracao-v1-fase5-code-attestation.mjs";
import {
  verifyBytes,
  verifyCandidateSource,
} from "./integracao-v1-fase5-code-promotion.mjs";

const candidate = Buffer.from(
  JSON.stringify({
    schema: "contaos.ifv1.f5.code-attestation-candidate.v1",
    state: "CANDIDATE_NOT_CERTIFIED",
    scope: "CODE_FIXTURE",
    certification: "NOT_CERTIFIED",
    live: "NOT_RUN",
    production: "NO-GO",
    source: { pr: 790, head: "b".repeat(40) },
    counts: { proofs: 276 },
    entries: Array.from({ length: 138 }, (_, i) => ({ caseId: i })),
  }),
);
const fixtureZip = (file, bytes, duplicate = false) =>
  execFileSync(
    "python3",
    [
      "-c",
      String.raw`import hashlib, io, sys, zipfile
archive = io.BytesIO()
body = sys.stdin.buffer.read()
with zipfile.ZipFile(archive, 'w') as z:
    z.writestr(sys.argv[1], body)
    z.writestr('SHA256SUMS', hashlib.sha256(body).hexdigest() + '  ' + sys.argv[1] + '\n')
    if sys.argv[2] == 'yes':
        z.writestr('unexpected.json', 'duplicate')
sys.stdout.buffer.write(archive.getvalue())
`,
      file,
      duplicate ? "yes" : "no",
    ],
    { input: bytes },
  );
const archive = fixtureZip(candidateFile, candidate);
const pin = {
  zipDigest: sha256(archive),
  candidateDigest: sha256(candidate),
  materialPr: 790,
  materialHead: "b".repeat(40),
};

test("F5 promotion verifies all three sources and leaves certification pending", () => {
  const receipt = verifyBytes(pin, archive, candidate, candidate);
  assert.equal(receipt.state, "LEDGER_VERIFIED_CERTIFICATE_PENDING");
  assert.equal(receipt.ledgerSha256, pin.candidateDigest);
  assert.equal(receipt.certification, "NOT_CERTIFIED");
});
test("F5 promotion rejects changes to the source archive or ledger", () => {
  const other = Buffer.from("different");
  assert.throws(
    () => verifyBytes(pin, other, candidate, candidate),
    /archive digest mismatch/,
  );
  assert.throws(
    () => verifyBytes(pin, archive, other, candidate),
    /reproduction differs/,
  );
  assert.throws(
    () => verifyBytes(pin, archive, candidate, other),
    /Versioned ledger differs/,
  );
});
test("F5 promotion rejects a mismatched manifest and extra archive entries", () => {
  assert.throws(
    () =>
      verifyBytes(
        { ...pin, candidateDigest: "f".repeat(64) },
        archive,
        candidate,
        candidate,
      ),
    /SHA256SUMS mismatch/,
  );
  const unexpected = fixtureZip(candidateFile, candidate, true);
  assert.throws(() =>
    verifyBytes(
      { ...pin, zipDigest: sha256(unexpected) },
      unexpected,
      candidate,
      candidate,
    ),
  );
});
test("F5 promotion requires pinned GitHub run and review identities", () => {
  assert.throws(
    () => verifyCandidateSource(pin, {}),
    /Missing candidate identities/,
  );
});

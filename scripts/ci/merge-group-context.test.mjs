import test from "node:test";
import assert from "node:assert/strict";
import { extractHint, verifyMergeGroup } from "./merge-group-context.mjs";

const A = "a".repeat(40), B = "b".repeat(40), C = "c".repeat(40), D = "d".repeat(40);
const ref = "refs/heads/gh-readonly-queue/main/pr-690-aaaaaaa";
const build = () => ({
  event: {
    action: "checks_requested",
    repository: { full_name: "contaos999999/contaos-hml-control" },
    merge_group: { head_ref: ref, head_sha: A, base_ref: "refs/heads/main", base_sha: B },
  },
  entry: {
    id: "MGE_123", state: "AWAITING_CHECKS",
    headCommit: { oid: A }, baseCommit: { oid: B },
    pullRequest: { number: 690 },
  },
  pull: { number: 690, headRefOid: C, baseRefName: "main" },
  liveBase: B,
  repo: "contaos999999/contaos-hml-control",
  checkoutSha: A, checkoutRef: ref, gitParents: [B, C],
  observedTree: D, expectedTree: D,
});
const check = (change, expected) => {
  const f = build();
  change(f);
  const result = verifyMergeGroup(f);
  assert.equal(result.valid, false);
  assert.match(result.issues.join("; "), expected);
};

test("N13 positive: PR única autenticada e HEAD/base vivos", () => {
  const r = verifyMergeGroup(build());
  assert.equal(r.valid, true);
  assert.equal(r.pr, 690);
  assert.equal(r.head_sha, A);
  assert.equal(r.base_sha, B);
});
test("N13 hint nunca substitui autenticação", () => {
  assert.equal(extractHint(ref), 690);
  assert.equal(extractHint("pr-690-aaaaaaa"), null);
  assert.equal(extractHint("refs/heads/gh-readonly-queue/main/pr-0-aaaaaaa"), null);
  assert.equal(extractHint("refs/heads/gh-readonly-queue/main/pr-690-any"), null);
});
test("N13 PR divergente do hint é FAIL", () =>
  check((f) => { f.pull.number = 691; }, /PR identity/));
test("N13 entrada aponta para outra PR é FAIL", () =>
  check((f) => { f.entry.pullRequest.number = 679; }, /entry does not belong/));
test("N13 referência do checkout divergente é FAIL", () =>
  check((f) => { f.checkoutRef = "refs/heads/main"; }, /head_ref/));
test("N13 SHA checkout antigo é FAIL", () =>
  check((f) => { f.checkoutSha = C; }, /checkout/));
test("N05 base avançada bloqueia mesmo se ancestral", () =>
  check((f) => { f.liveBase = C; }, /group base/));
test("N13 grupo removido é FAIL", () =>
  check((f) => { f.entry.state = "REMOVED"; }, /inactive/));
test("N13 entry sem baseCommit impede associação", () =>
  check((f) => { f.entry.baseCommit = null; }, /entry\/base\/head/));
test("N13 entry headCommit stale impede associação", () =>
  check((f) => { f.entry.headCommit.oid = C; }, /entry\/base\/head/));
test("N13 PR sem HEAD válido é FAIL", () =>
  check((f) => { f.pull.headRefOid = "abc"; }, /PR identity/));
test("N13 event action ausente é FAIL", () =>
  check((f) => { f.event.action = null; }, /event\/action/));
test("N13 PR com vários commits mantém uma única PR elegível", () => {
  const f = build();
  f.pull.commitCount = 57;
  assert.equal(verifyMergeGroup(f).valid, true);
});
test("N13 árvore de grupo com alterações de outra PR não passa", () =>
  check((f) => { f.observedTree = C; }, /group tree differs/));
test("N13 sem reprodução exata da árvore não passa", () =>
  check((f) => { f.expectedTree = null; }, /group tree differs/));
test("N13 commit extra com terceiro pai é FAIL", () =>
  check((f) => { f.gitParents.push("d".repeat(40)); }, /group parentage/));
test("N13 ancestry invertida é FAIL", () =>
  check((f) => { f.gitParents = [C, B]; }, /group parentage/));
test("N13 grupo de outra base/ref é FAIL", () =>
  check((f) => { f.event.merge_group.base_ref = "refs/heads/develop"; }, /group base/));
test("N13 troca de repositório é FAIL", () =>
  check((f) => { f.event.repository.full_name = "contaos999999/develop"; }, /repository/));
test("N13 entrada omitida não gera aprovação implícita", () =>
  check((f) => { f.entry = null; }, /entry missing/));
test("N13 evento sem merge_group bloqueado", () =>
  check((f) => { f.event.merge_group = null; }, /event\/action/));
test("N13 checkout com SHA de outra branch é FAIL", () =>
  check((f) => { f.event.merge_group.head_sha = C; }, /checkout/));

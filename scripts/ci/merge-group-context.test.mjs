import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
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

test("N13 prova git real: PR multi-commit e grupo isolado, mutante extra rejeitado", () => {
  const workdir = mkdtempSync(join(tmpdir(), "contaos-merge-group-"));
  const git = (...args) => execFileSync("git", args, {
    cwd: workdir, encoding: "utf8", timeout: 20000,
  }).trim();
  const write = (name, body) => writeFileSync(join(workdir, name), body);
  try {
    git("init", "-q", "-b", "main");
    git("config", "user.email", "test@invalid.local");
    git("config", "user.name", "ContaOS Git Test");
    write("base.txt", "base\n");
    git("add", ".");
    git("commit", "-qm", "base");
    const base = git("rev-parse", "HEAD");
    git("checkout", "-qb", "feature");
    for (let i = 1; i <= 3; i++) {
      write("feature-" + i + ".txt", "feature " + i + "\n");
      git("add", ".");
      git("commit", "-qm", "feature " + i);
    }
    const prHead = git("rev-parse", "HEAD");
    git("checkout", "-q", "main");
    git("merge", "--no-ff", "-m", "synthetic queue group", "feature");
    const group = git("rev-parse", "HEAD");
    const parents = git("show", "-s", "--format=%P", group).split(/\s+/);
    const count = Number(git("rev-list", "--count", base + ".." + group));
    assert.ok(count > 1, "root cause: commits are not PRs");
    const observed = git("rev-parse", group + "^{tree}");
    const expected = git("merge-tree", "--write-tree", base, prHead);
    assert.equal(observed, expected);
    const input = build();
    const groupRef = "refs/heads/gh-readonly-queue/main/pr-690-" + prHead.slice(0, 7);
    input.event.merge_group.head_ref = groupRef;
    input.event.merge_group.head_sha = group;
    input.event.merge_group.base_sha = base;
    input.entry.baseCommit.oid = base;
    input.entry.headCommit.oid = group;
    input.pull.headRefOid = prHead;
    input.liveBase = base;
    input.checkoutSha = group;
    input.checkoutRef = groupRef;
    input.gitParents = parents;
    input.observedTree = observed;
    input.expectedTree = expected;
    assert.equal(verifyMergeGroup(input).valid, true);
    write("unauthorized-extra.txt", "other PR should not enter this merge group\n");
    git("add", ".");
    git("commit", "-qm", "unauthorized extra PR content");
    input.observedTree = git("rev-parse", "HEAD^{tree}");
    const denied = verifyMergeGroup(input);
    assert.equal(denied.valid, false);
    assert.match(denied.issues.join("; "), /group tree differs/);
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
});

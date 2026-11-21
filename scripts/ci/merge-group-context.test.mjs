import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { extractHint, verifyMergeGroup, resolveEventContext } from "./merge-group-context.mjs";

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
  checkoutTree: D, liveHeadRefSha: A, eventSha: A,
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
test("N13 UNMERGEABLE nunca autoriza checks_requested", () =>
  check((f) => { f.entry.state = "UNMERGEABLE"; }, /inactive/));
test("N13 entrada QUEUED nao prova grupo ativo", () =>
  check((f) => { f.entry.state = "QUEUED"; }, /inactive/));
test("N13 entrada LOCKED nao prova grupo ativo", () =>
  check((f) => { f.entry.state = "LOCKED"; }, /inactive/));
test("N13 MERGEABLE ainda exige SHA e arvore exatos", () => {
  const f = build();
  f.entry.state = "MERGEABLE";
  assert.equal(verifyMergeGroup(f).valid, true);
  f.observedTree = C;
  assert.equal(verifyMergeGroup(f).valid, false);
});
test("N13 estado inesperado falha fechado", () =>
  check((f) => { f.entry.state = "UNKNOWN_FUTURE"; }, /inactive/));

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


test("N13 GITHUB_SHA alone cannot replace real local Git checkout", () =>
  check(f => { f.checkoutSha = C; f.eventSha = A; }, /checkout not group/));
test("N13 queue ref removed or moved blocks even when commit object exists", () =>
  check(f => { f.liveHeadRefSha = C; }, /live queue ref removed/));
test("N13 local checkout tree must equal authenticated group tree", () =>
  check(f => { f.checkoutTree = C; }, /actual checkout tree/));
test("N13 forged event SHA cannot replace verified checkout SHA", () =>
  check(f => { f.eventSha = C; }, /GITHUB_SHA event/));

function fakeResolver(extras={}) {
  const f=build();
  const env={
    GITHUB_EVENT_NAME:"merge_group",
    GITHUB_EVENT_PATH:"/fixture/git-event.json",
    GITHUB_TOKEN:"readonly-test-token",
    GITHUB_REPOSITORY:f.repo,
    GITHUB_SHA:f.event.merge_group.head_sha,
    GITHUB_REF:f.event.merge_group.head_ref,
    ...extras.env,
  };
  const observed={refs:0,base:0,gql:0};
  const http=async (path, _token, post) => {
    if(path==="/graphql") {
      observed.gql++;
      assert.ok(post?.query.includes("mergeQueueEntry"));
      const entry=JSON.parse(JSON.stringify(f.entry));
      const pull={...f.pull};
      if(observed.gql>1) {
        if(extras.removedEntryAtReadback) return {data:{repository:{pullRequest:{...pull,mergeQueueEntry:null}}}};
        if(extras.movedEntryAtReadback) entry.headCommit.oid=C;
        if(extras.inactiveEntryAtReadback) entry.state="QUEUED";
        if(extras.movedPrAtReadback) pull.headRefOid=A;
      }
      return {data:{repository:{pullRequest:{
        ...pull, mergeQueueEntry:entry,
      }}}};
    }
    if(path==="/repos/"+f.repo+"/git/ref/heads/main") {
      observed.base++;
      return {object:{type:"commit",sha:extras.mainMovedAtReadback && observed.base>1 ? C : f.liveBase}};
    }
    if(path==="/repos/"+f.repo+"/git/ref/"+f.event.merge_group.head_ref.slice(5)) {
      observed.refs++;
      if(extras.removedQueue) throw Error("GitHub API 404 queue removed");
      return {ref:f.event.merge_group.head_ref,
        object:{type:"commit",sha:extras.movedAtReadback && observed.refs>1 ? C : f.event.merge_group.head_sha}};
    }
    throw Error("unexpected API "+path);
  };
  const gitFn=(...args) => {
    const key=args.join(" ");
    if(key==="rev-parse HEAD") return extras.localHead || A;
    if(key==="rev-parse HEAD^{tree}") return extras.localTree || D;
    if(key==="rev-parse "+A+"^{tree}") return D;
    if(key==="show -s --format=%P HEAD") return B+" "+C;
    if(key==="merge-tree --write-tree "+B+" "+C) return D;
    throw Error("unexpected git "+key);
  };
  return {env,http,gitFn,readEvent:()=>f.event, observed};
}
test("N13 resolver binds local checkout, live queue ref and independent Git tree", async () => {
  const f=fakeResolver();
  const result=await resolveEventContext(f);
  assert.equal(result.valid,true);
  assert.equal(result.pr,690);
  assert.equal(f.observed.refs,2);
  assert.equal(f.observed.base,2);
  assert.equal(f.observed.gql,2);
});
test("N13 real resolver rejects checkout unrelated to event even if env SHA matches", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({localHead:C})),/checkout not group/);
});
test("N13 real resolver rejects local checkout tree from another commit", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({localTree:C})),/actual checkout tree/);
});
test("N13 real resolver rejects removed queue ref with cached event commit", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({removedQueue:true})),/404 queue removed/);
});
test("N13 real resolver rejects a queue ref removed/moved during readback", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({movedAtReadback:true})),/changed during authenticated readback/);
});
test("N13 real resolver rejects main moving during group verification", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({mainMovedAtReadback:true})),/changed during authenticated readback/);
});

test("N13 removed merge queue entry during readback is FAIL", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({
    removedEntryAtReadback:true,
  })),/entry removed, changed/);
});
test("N13 queued/locked entry at final readback is FAIL", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({
    inactiveEntryAtReadback:true,
  })),/entry removed, changed/);
});
test("N13 changed queue entry commit after first readback is FAIL", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({
    movedEntryAtReadback:true,
  })),/entry removed, changed/);
});
test("N13 PR HEAD moving during queue verification is FAIL", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({
    movedPrAtReadback:true,
  })),/entry removed, changed/);
});

test("N13 real resolver refuses stale GITHUB_SHA even with valid local HEAD", async () => {
  await assert.rejects(()=>resolveEventContext(fakeResolver({env:{GITHUB_SHA:C}})),/GITHUB_SHA event/);
});

test("N13 protected workflows recheck group after substantive work and before success", () => {
  const suites = [
    [".github/workflows/contaos-frontend-zero-drift.yml",
      "Brand-01, PT-BR, secrets and types integrity"],
    [".github/workflows/contaos-teste-c-independente.yml",
      "Confirmar que nenhuma fonte versionada foi editada"],
    [".github/workflows/p0-nr001-anti-recurrence.yml",
      "P0-NR-001 ledger com comprovantes reais"],
  ];
  for (const [path, lastTask] of suites) {
    const source = readFileSync(new URL("../../" + path, import.meta.url), "utf8");
    const finalGuard = "P0-ABS — revalidar grupo vivo imediatamente antes do sucesso do job";
    assert.equal(source.split(finalGuard).length - 1, 1, path + " must contain one terminal queue guard");
    assert.ok(source.lastIndexOf(finalGuard) > source.lastIndexOf(lastTask), path + " must end with fresh group verification");
    const end = source.slice(source.lastIndexOf(finalGuard));
    assert.match(end, /if: github\.event_name == 'merge_group'/);
    assert.match(end, /node scripts\/ci\/merge-group-context\.mjs/);
    assert.match(source, /contents: read/);
    assert.doesNotMatch(source, /contents: write/);
  }
});

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
    input.checkoutTree = observed;
    input.liveHeadRefSha = group;
    input.eventSha = group;
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

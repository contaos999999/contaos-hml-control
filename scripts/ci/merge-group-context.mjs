// P0-ABS: proveniência do merge_group. Diagnóstico/CI read-only, não publicador.
import { readFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const REPO = "contaos999999/contaos-hml-control";
const isSha = (s) => typeof s === "string" && /^[a-f0-9]{40}$/.test(s);
const nonempty = (s) => typeof s === "string" && s.trim().length > 0;
const fail = (reason) => { throw new Error("P0 MERGE GROUP FAIL: " + reason); };

// The number in head_ref is ONLY a hint. Never treat it as authenticated proof.
export function extractHint(ref) {
  const m = /^refs\/heads\/gh-readonly-queue\/main\/pr-([1-9]\d*)-[0-9a-f]{7,40}$/.exec(String(ref || ""));
  return m ? Number(m[1]) : null;
}

export function verifyMergeGroup({ event, entry, pull, liveBase, repo = REPO,
  checkoutSha, gitParents = [], observedTree = null, expectedTree = null,
  checkoutTree = null, liveHeadRefSha = null, eventSha = null,
  checkoutRef } = {}) {
  const issues = [];
  const reject = (x) => issues.push(x);
  const group = event?.merge_group;
  if (repo !== REPO || event?.repository?.full_name !== repo)
    reject("repository not authenticated");
  if (event?.action !== "checks_requested" || !group)
    reject("event/action not merge_group checks_requested");
  const head = group?.head_sha, base = group?.base_sha;
  if (!isSha(head) || !isSha(base) || !isSha(liveBase))
    reject("invalid group SHA/base");
  if (group?.base_ref !== "refs/heads/main" || base !== liveBase)
    reject("group base differs from live protected main");
  const hint = extractHint(group?.head_ref);
  if (!hint || checkoutRef !== group?.head_ref)
    reject("head_ref invalid/not current checkout");
  if (checkoutSha !== head || !isSha(checkoutSha))
    reject("checkout not group head SHA");
  if (eventSha !== head || !isSha(eventSha))
    reject("GITHUB_SHA event identity differs from the group");
  if (liveHeadRefSha !== head || !isSha(liveHeadRefSha))
    reject("live queue ref removed, stale or not authenticated");
  if (!isSha(checkoutTree) || checkoutTree !== observedTree)
    reject("actual checkout tree does not match the authenticated group tree");
  // Only valid Github GraphQL queue states which can be actively checked.
  // QUEUED/LOCKED and especially UNMERGEABLE are not evidence of an
  // active checks_requested group; unknown future values fail closed.
  if (!entry || typeof entry !== "object" || !nonempty(entry.id) ||
      !["AWAITING_CHECKS", "MERGEABLE"].includes(entry.state))
    reject("merge queue entry missing/inactive");
  if (!pull || pull.number !== hint || pull.baseRefName !== "main" ||
      !isSha(pull.headRefOid))
    reject("PR identity/HEAD/base not confirmed");
  if (entry?.pullRequest?.number !== pull?.number)
    reject("entry does not belong to target PR");
  if (entry?.baseCommit?.oid !== base || entry?.headCommit?.oid !== head)
    reject("entry/base/head mismatch");
  // N13: commit count is NOT PR count. One PR can contain many commits.
  // For MERGE groups, require the exact resulting tree of merging the
  // authenticated PR HEAD into the live protected base. Extra PR content
  // changes the tree; missing objects, conflicts or non-MERGE layouts fail.
  // Group-size configuration alone is not evidence of group composition.
  if (gitParents.length !== 2 || gitParents[0] !== base ||
      gitParents[1] !== pull?.headRefOid)
    reject("group parentage cannot prove isolated PR merge");
  if (!isSha(observedTree) || !isSha(expectedTree) ||
      observedTree !== expectedTree)
    reject("group tree differs from independently reproduced single-PR merge");
  if (issues.length) return { valid: false, issues };
  return {
    valid: true, issues: [],
    pr: pull.number,
    base_sha: base,
    head_sha: head,
    pr_head_sha: pull.headRefOid,
    entry_id: entry.id,
  };
}

async function github(path, token, post = null) {
  if (!token) fail("read-only GitHub token absent");
  const res = await fetch("https://api.github.com" + path, {
    method: post ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ContaOS-MergeGroup-ReadOnly",
    },
    body: post ? JSON.stringify(post) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) fail("authenticated GitHub API HTTP " + res.status);
  return res.json();
}
const git = (...a) => execFileSync("git", a, { encoding: "utf8", timeout: 15000 }).trim();

export async function resolveEventContext({
  env = process.env, http = github, gitFn = git,
  readEvent = () => JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8")),
} = {}) {
  if (env.GITHUB_EVENT_NAME !== "merge_group")
    fail("not a merge_group event");
  if (!env.GITHUB_EVENT_PATH || !env.GITHUB_TOKEN)
    fail("event payload or read-only token absent");
  const event = readEvent();
  const hint = extractHint(event?.merge_group?.head_ref);
  if (!hint) fail("PR hint absent: cannot resolve authenticated PR");
  const query = [
    "query($owner:String!,$name:String!,$number:Int!){",
    "repository(owner:$owner,name:$name){",
    "pullRequest(number:$number){",
    "number headRefOid baseRefName",
    "mergeQueueEntry{",
    "id state baseCommit{oid} headCommit{oid} pullRequest{number}",
    "}}}}",
  ].join(" ");
  const queueRefPath = "/repos/" + REPO + "/git/ref/" +
    event.merge_group.head_ref.slice("refs/".length);
  const [gql, live, liveGroupRef] = await Promise.all([
    http("/graphql", env.GITHUB_TOKEN, {
      query, variables: { owner: "contaos999999", name: "contaos-hml-control", number: hint },
    }),
    http("/repos/" + REPO + "/git/ref/heads/main", env.GITHUB_TOKEN),
    http(queueRefPath, env.GITHUB_TOKEN),
  ]);
  // A removed queue branch must return a failing API call. A cached event
  // ref or an existing commit object never proves a group remains active.
  if (liveGroupRef?.ref !== event.merge_group.head_ref ||
      liveGroupRef?.object?.type !== "commit" ||
      liveGroupRef?.object?.sha !== event.merge_group.head_sha)
    fail("live merge group ref absent, removed or moved");
  if (gql?.errors?.length || !gql?.data?.repository?.pullRequest)
    fail("GraphQL PR/entry unavailable or ambiguous");
  const pull = gql.data.repository.pullRequest;
  const entry = pull.mergeQueueEntry;
  const h = event.merge_group.head_sha, b = event.merge_group.base_sha;
  const checkoutSha = gitFn("rev-parse", "HEAD");
  const checkoutTree = gitFn("rev-parse", "HEAD^{tree}");
  const parents = gitFn("show", "-s", "--format=%P", "HEAD").split(/\s+/).filter(Boolean);
  // git merge-tree recomputes the actual merge tree for the *one* PR.
  // Unlike rev-list, this does not confuse commits with PRs.
  // If merge-tree conflicts or repo objects are absent, fail closed.
  let expectedTree;
  try {
    expectedTree = gitFn("merge-tree", "--write-tree", b, pull.headRefOid);
  } catch {
    fail("cannot reproduce single-PR merge tree from authenticated base/HEAD");
  }
  const observedTree = gitFn("rev-parse", h + "^{tree}");
  const result = verifyMergeGroup({
    event, entry, pull, liveBase: live?.object?.sha, repo: env.GITHUB_REPOSITORY,
    checkoutSha, checkoutTree, checkoutRef: env.GITHUB_REF,
    liveHeadRefSha: liveGroupRef.object.sha, eventSha: env.GITHUB_SHA,
    gitParents: parents, observedTree, expectedTree,
  });
  if (!result.valid) fail(result.issues.join("; "));
  // Catch queue removal or base movement during the local Git verification.
  const [endGroupRef, endBaseRef, endGql] = await Promise.all([
    http(queueRefPath, env.GITHUB_TOKEN),
    http("/repos/" + REPO + "/git/ref/heads/main", env.GITHUB_TOKEN),
    http("/graphql", env.GITHUB_TOKEN, {
      query, variables: { owner: "contaos999999", name: "contaos-hml-control", number: hint },
    }),
  ]);
  const endPull = endGql?.data?.repository?.pullRequest;
  const endEntry = endPull?.mergeQueueEntry;
  if (endGql?.errors?.length || !endEntry ||
      endEntry.id !== entry.id ||
      !["AWAITING_CHECKS", "MERGEABLE"].includes(endEntry.state) ||
      endPull?.number !== pull.number ||
      endPull?.headRefOid !== pull.headRefOid ||
      endPull?.baseRefName !== pull.baseRefName ||
      endEntry?.baseCommit?.oid !== b ||
      endEntry?.headCommit?.oid !== h ||
      endEntry?.pullRequest?.number !== pull.number)
    fail("merge queue entry removed, changed or PR moved during readback");
  if (endGroupRef?.ref !== event.merge_group.head_ref ||
      endGroupRef?.object?.type !== "commit" ||
      endGroupRef?.object?.sha !== h ||
      endBaseRef?.object?.sha !== b)
    fail("merge group ref/base changed during authenticated readback");
  if (gitFn("rev-parse", "HEAD") !== h ||
      gitFn("rev-parse", "HEAD^{tree}") !== observedTree)
    fail("checked-out HEAD/tree drifted during validation");
  return result;
}
export async function main({ env = process.env, http = github, gitFn = git } = {}) {
  const result = await resolveEventContext({ env, http, gitFn });
  if (env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries(result)) {
      if (["pr", "base_sha", "head_sha", "pr_head_sha", "entry_id"].includes(key))
        appendFileSync(env.GITHUB_OUTPUT, key + "=" + value + "\n");
    }
  }
  process.stdout.write(JSON.stringify(result) + "\n");
  return result;
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
    fileURLToPath(new URL("file://" + process.argv[1])))
  main().catch((e) => { console.error(e.message); process.exitCode = 1; });

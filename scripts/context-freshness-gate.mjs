import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE = "contaos999999/develop";
const SNAPSHOT = "docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const sha40 = (v) => /^[a-f0-9]{40}$/.test(v || "");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

export function mustCheck(paths, plan) {
  return (
    plan.status === "VALIDADO" ||
    paths.some(
      (p) =>
        (/^(src|public)\//.test(p) && p !== "src/integrations/supabase/types.ts") ||
        ["package.json", "bun.lock", "index.html", "vite.config.ts", "tailwind.config.ts"].includes(
          p,
        ),
    )
  );
}

export function checkSnapshot(snapshot, remoteSha, entries) {
  const errors = [];
  const docs = snapshot.context_documents || [];
  const catalog = snapshot.prompt_catalog || {};
  const remote = new Map(entries.filter((e) => e.type === "blob").map((e) => [e.path, e.sha]));
  if (
    snapshot.schema !== "contaos.frontend.canonical-source-snapshot.v1" ||
    snapshot.source_repo !== SOURCE ||
    snapshot.source_branch !== "main"
  ) {
    errors.push("origem da fonte inconsistente");
  }
  if (!sha40(snapshot.source_commit) || remoteSha !== snapshot.source_commit) {
    errors.push("HEAD canônico desatualizado");
  }
  if (docs.length !== 25 || new Set(docs.map((d) => d.path)).size !== 25) {
    errors.push("esperados 25 documentos canônicos únicos");
  }
  for (const d of docs) {
    if (!sha40(d.blob_sha) || remote.get(d.path) !== d.blob_sha) {
      errors.push("blob divergente: " + d.path);
    }
  }
  if (
    !sha40(catalog.source_blob_sha) ||
    remote.get(catalog.source_path) !== catalog.source_blob_sha ||
    catalog.regular_ids?.length !== 100 ||
    catalog.atomic_ids?.length !== 97 ||
    catalog.crosswalk?.length !== 100
  ) {
    errors.push("catálogo original dos 100/97 prompts divergente");
  }
  return errors;
}

function changedPaths() {
  const event = process.env.GITHUB_EVENT_NAME || "";
  let base = process.env.FRONTEND_DIFF_BASE || "";
  if (!base || /^0+$/.test(base)) base = git("rev-parse", "HEAD^");
  let head = "HEAD";
  if (event === "pull_request") {
    try {
      head = git("rev-parse", "HEAD^2");
    } catch {
      head = "HEAD";
    }
    base = git("merge-base", base, head);
  }
  return git("diff", "--name-only", base, head).split("\n").filter(Boolean);
}

async function github(path, token) {
  const response = await fetch("https://api.github.com/repos/" + SOURCE + path, {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "contaos-source-freshness",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("GitHub canônico inacessível (HTTP " + response.status + ")");
  return await response.json();
}

export async function main() {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  const plan = JSON.parse(readFileSync(PLAN, "utf8"));
  if (!mustCheck(changedPaths(), plan)) {
    console.log("FONTE CANÔNICA: N/A (governança documental sem PLAN validado nem BUILD).");
    return;
  }
  const token = process.env.CONTAOS_CANONICAL_READ_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "FONTE CANÔNICA BLOQUEADA: configure Secret CONTAOS_CANONICAL_READ_TOKEN, Contents:read somente contaos999999/develop. Não envie o token ao chat.",
    );
  }
  const branch = await github("/branches/main", token);
  const currentSha = branch.commit?.sha;
  if (!sha40(currentSha)) throw new Error("HEAD da fonte indisponível");
  if (currentSha !== snapshot.source_commit) {
    throw new Error("FONTE CANÔNICA DESATUALIZADA: atualizar snapshot e validar novo PLAN.");
  }
  const commit = await github("/git/commits/" + currentSha, token);
  const treeSha = commit.tree?.sha;
  if (!sha40(treeSha)) throw new Error("Árvore da fonte indisponível");
  const tree = await github("/git/trees/" + treeSha + "?recursive=1", token);
  if (tree.truncated || !Array.isArray(tree.tree)) {
    throw new Error("Árvore canônica truncada: não é possível validar a fonte.");
  }
  const errors = checkSnapshot(snapshot, currentSha, tree.tree);
  if (errors.length) throw new Error("FONTE CANÔNICA FAIL: " + errors.join("; "));
  console.log("FONTE CANÔNICA PASS: HEAD, 25 documentos e catálogo 100/97 confirmados na origem.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

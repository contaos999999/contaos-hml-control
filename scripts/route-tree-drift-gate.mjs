/**
 * GOV-020 — contrato determinístico do TanStack Router.
 * SOMENTE LEITURA: nunca executa git add/commit/checkout/reset ou reescreve arquivos.
 * Invocar APÓS a geração real (vite build ou vite dev), jamais antes.
 */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROUTE_TREE = "src/routeTree.gen.ts";

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function verificarArvore() {
  try {
    git(["ls-files", "--error-unmatch", "--", ROUTE_TREE]);
  } catch {
    return {
      ok: false,
      motivo: "O arquivo routeTree.gen.ts não está versionado no Git. Não é permitido ignorá-lo.",
      diff: "",
    };
  }

  let alteracoes;
  try {
    alteracoes = git(["status", "--porcelain", "--untracked-files=all", "--", ROUTE_TREE]);
  } catch {
    return { ok: false, motivo: "Não foi possível obter o estado Git do routeTree.", diff: "" };
  }
  if (!alteracoes) return { ok: true, motivo: "Árvore TanStack reproduzível e limpa.", diff: "" };

  let diff = "";
  try {
    diff = git(["diff", "--no-ext-diff", "--", ROUTE_TREE]);
  } catch {
    diff = "Diff indisponível. Consulte git status e a geração TanStack.";
  }
  return {
    ok: false,
    motivo: "O TanStack gerou routeTree.gen.ts diferente da versão do commit.",
    diff,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = verificarArvore();
  if (result.ok) {
    console.log("GOV-020 PASS: routeTree.gen.ts coincide com a geração oficial.");
  } else {
    console.error("GOV-020 FAIL: " + result.motivo);
    if (result.diff) console.error(result.diff);
    console.error("CORREÇÃO: execute 'bun run build' na sua branch de BUILD.");
    console.error("Versione o routeTree.gen.ts oficial antes do PR.");
    console.error("O CI é somente leitura: não corrige nem cria commits.");
    process.exitCode = 1;
  }
}

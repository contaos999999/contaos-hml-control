/**
 * GOV-020 — contrato determinístico do TanStack Router.
 * SOMENTE LEITURA: nunca executa git add/commit/checkout/reset ou reescreve arquivos.
 * Invocar APÓS a geração real (vite build ou vite dev), jamais antes.
 */
import { execFileSync } from "node:child_process";

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

if (process.argv[1] && import.meta.url === new URL("file://" + process.argv[1]).href) {
  const result = verificarArvore();
  if (result.ok) {
    console.log("GOV-020 PASS: routeTree.gen.ts coincide com a geração oficial.");
  } else {
    console.error("GOV-020 FAIL: " + result.motivo);
    if (result.diff) console.error(result.diff);
    console.error(
      "CORREÇÃO: em sua branch de BUILD, execute 'bun run build', confira o diff " +
      "e versione a saída determinística de src/routeTree.gen.ts ANTES do PR. " +
      "O CI é somente leitura: não corrige nem cria commits.",
    );
    process.exitCode = 1;
  }
}

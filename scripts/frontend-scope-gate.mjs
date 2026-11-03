import { execFileSync } from "node:child_process";

/**
 * ADR-DEV-002. CI posterior ao push; não substitui branch protection.
 * Proíbe mudanças de backend e exige PLAN validado em commit anterior ao BUILD.
 */
const TYPES = "src/integrations/supabase/types.ts";
const CERTIFIED_TYPES = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const BASE = (process.env.FRONTEND_DIFF_BASE || "").trim();
const EVENT = (process.env.GITHUB_EVENT_NAME || "").trim();
const errors = [];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function availableCommit(sha) {
  try {
    git("cat-file", "-e", sha + "^{commit}");
    return true;
  } catch {
    return false;
  }
}

let base = BASE;
if (EVENT === "workflow_dispatch" && !base) {
  console.log("SCOPE GATE: execução manual sem diff; checagem de escopo por commit não se aplica.");
  process.exit(0);
}
if (!base || /^0+$/.test(base)) {
  try {
    base = git("rev-parse", "HEAD^");
  } catch {
    console.error("SCOPE GATE FAIL: sem commit base comparável.");
    process.exit(1);
  }
}
if (!availableCommit(base)) {
  console.error("SCOPE GATE FAIL: commit base não foi obtido: " + base);
  process.exit(1);
}
if (EVENT === "pull_request") {
  base = git("merge-base", base, "HEAD");
}
const changed = git("diff", "--name-only", "--diff-filter=ACMRD", base, "HEAD")
  .split("\n")
  .filter(Boolean);

const forbidden = [
  /^supabase\//i,
  /^backend\//i,
  /^database\//i,
  /^migrations\//i,
  /^edge-functions\//i,
  /^functions\//i,
  /^src\/integrations\/supabase\//i,
  /^(?:\.env(?:\.|$)|\.secrets(?:\.|$))/i,
];

let restoredTypes = false;
for (const path of changed) {
  if (!forbidden.some((rule) => rule.test(path))) continue;
  if (path === TYPES) {
    const actual = git("hash-object", TYPES);
    if (actual === CERTIFIED_TYPES) {
      restoredTypes = true; // recuperação permitida SOMENTE para o blob certificado
      continue;
    }
  }
  errors.push("ALTERAÇÃO DE BACKEND OU INTEGRAÇÃO PROIBIDA: " + path);
}

const sourcePaths = changed.filter(
  (path) =>
    (path.startsWith("src/") && path !== TYPES) ||
    path.startsWith("public/") ||
    [
      "package.json",
      "bun.lock",
      "index.html",
      "vite.config.ts",
      "tsconfig.json",
      "tsconfig.app.json",
      "tailwind.config.ts",
    ].includes(path),
);
if (sourcePaths.length) {
  let plan;
  try {
    plan = JSON.parse(git("show", base + ":" + PLAN));
  } catch {
    errors.push("BUILD SEM PLAN ANTERIOR: falta " + PLAN + " no commit de base.");
  }
  if (plan) {
    if (plan.schema !== "contaos.frontend.plan.v1" || plan.status !== "VALIDADO" || plan.validacao?.resultado !== "PASS") {
      errors.push("BUILD BLOQUEADO: PLAN anterior não foi VALIDADO com todos os gates PASS.");
    }
    if (!plan.prompt_id || !plan.plano_documento || !Array.isArray(plan.arquivos_permitidos) || !plan.arquivos_permitidos.length) {
      errors.push("PLAN anterior sem prompt, documento de evidência ou allowlist fechada.");
    }
    if (plan.validacao?.aprovacao_humana_exigida === true && plan.validacao?.aprovacao_humana !== "CONCEDIDA") {
      errors.push("PLAN depende de aprovação humana explícita, ainda não concedida.");
    }
    for (const path of sourcePaths) {
      if (!plan.arquivos_permitidos?.includes(path))
        errors.push("ARQUIVO FORA DO PLAN VALIDADO: " + path);
    }
    for (const path of plan.arquivos_permitidos || []) {
      if (forbidden.some((rule) => rule.test(path)))
        errors.push("PLAN contém caminho proibido de backend: " + path);
    }
  }
}
if (errors.length) {
  errors.forEach((item) => console.error("FRONTEND SCOPE FAIL: " + item));
  process.exit(1);
}
console.log(
  "FRONTEND SCOPE PASS: " +
    changed.length +
    " arquivos modificados; " +
    sourcePaths.length +
    " do aplicativo sob PLAN prevalidado; " +
    (restoredTypes ? "recuperação do blob types.ts certificado" : "nenhuma mudança backend"),
);
console.log("LIMITAÇÃO: escopo é verificado no CI pós-push; gates semânticos exigem evidência e Teste C.");

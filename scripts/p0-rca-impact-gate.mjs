import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const VERSION_REGULAR = {
  V2: ["44", "45", "46", "47", "48", "49", "76", "77"],
  V3: ["50", "51", "52", "53", "54", "55", "78", "79"],
  V4: ["56", "57", "58", "59", "80", "81", "82", "83"],
  V5: ["60", "61", "62", "63", "64", "65", "66", "84", "85", "86", "87", "88", "89"],
};
const sha40 = (s) => typeof s === "string" && /^[a-f0-9]{40}$/.test(s);
const nonblank = (s) => typeof s === "string" && s.trim().length > 0;
const nonemptyStrings = (xs) => Array.isArray(xs) && xs.length > 0 &&
  xs.every(nonblank);
const implementation = (path) =>
  /^(src\/|scripts\/|public\/|\.github\/workflows\/)/.test(path) ||
  ["package.json", "bun.lock", "vite.config.ts", "tsconfig.json", "index.html"].includes(path);
const allowed = (p) => typeof p === "string" &&
  implementation(p) && !p.includes("..") && !p.startsWith("src/integrations/supabase/");

/** Análise estrutural de RCA por PR; não confunde documento com prova operacional. */
export function validateRcaImpact({ planId, changed = [], report = null, reportExists = false }) {
  const errors = [];
  const err = (s) => errors.push(s);
  const id = String(planId || "").padStart(2, "0");
  const version = Object.keys(VERSION_REGULAR).find((v) => VERSION_REGULAR[v].includes(id));
  const paths = changed.filter(implementation);
  // V1 não recebe retroativamente regras V2; alterações apenas documentais
  // não exigem ficha, mas continuam sujeitas aos demais controles de escopo.
  if (!version || paths.length === 0) return { errors, applicable: false, version };
  if (!reportExists || !changed.includes(REPORT) || !report) {
    err("P0 RCA BLOQUEIA: BUILD " + version + " sem ficha RCA atualizada no mesmo diff.");
    return { errors, applicable: true, version };
  }
  if (report.schema !== "contaos.p0.rca-report.v1" ||
      report.versao !== version || report.prompt_id !== id ||
      !sha40(report.baseline?.frontend_sha) ||
      !sha40(report.baseline?.backend_sha))
    err("P0 RCA: schema, versão, regular ou baseline inválidos.");
  if (!Array.isArray(report.itens) || report.itens.length === 0) {
    err("P0 RCA: nenhum item causal ou preflight de funcionalidade.");
    return { errors, applicable: true, version };
  }
  const covered = new Set();
  const ids = new Set();
  for (const [ix, item] of report.itens.entries()) {
    const label = "item " + (ix + 1);
    if (!nonblank(item?.id) || ids.has(item.id)) err("P0 RCA: " + label + " sem ID exclusivo.");
    ids.add(item?.id);
    if (!["CORRECAO", "NOVA_FUNCIONALIDADE"].includes(item?.tipo))
      err("P0 RCA: " + label + " tipo de atividade inválido.");
    if (!nonblank(item?.solucao?.descricao) ||
        !nonblank(item?.solucao?.rollback) ||
        !nonemptyStrings(item?.solucao?.arquivos) ||
        item.solucao.arquivos.some((x) => !allowed(x)))
      err("P0 RCA: " + label + " sem solução, allowlist segura ou rollback.");
    for (const p of item?.solucao?.arquivos || []) covered.add(p);
    if (!nonemptyStrings(item?.impacto?.dependencias) ||
        !nonemptyStrings(item?.impacto?.versoes_afetadas) ||
        !Array.isArray(item?.impacto?.riscos) || !item.impacto.riscos.length ||
        item.impacto.riscos.some((r) =>
          !nonblank(r?.risco) || !nonblank(r?.teste_preventivo)))
      err("P0 RCA: " + label + " sem mapa de impacto, versões, riscos ou testes preventivos.");
    if (!nonemptyStrings(item?.testes?.negativos) ||
        !nonemptyStrings(item?.testes?.regressao) ||
        !nonemptyStrings(item?.testes?.green))
      err("P0 RCA: " + label + " sem testes negativos, GREEN ou regressão.");
    if (item?.tipo === "CORRECAO") {
      if (item?.reproducao?.confirmada !== true ||
          !nonblank(item?.reproducao?.sintoma) ||
          !nonblank(item?.reproducao?.esperado) ||
          !nonblank(item?.reproducao?.observado) ||
          !nonblank(item?.reproducao?.evidencia) ||
          item?.causa?.status !== "CONFIRMADA" ||
          !nonblank(item?.causa?.descricao) ||
          !nonemptyStrings(item?.causa?.evidencias) ||
          !nonemptyStrings(item?.causa?.hipoteses_descartadas) ||
          !nonemptyStrings(item?.testes?.red))
        err("P0 RCA: " + label + " correção sem causa raiz confirmada, RED ou hipóteses descartadas.");
    } else if (item?.tipo === "NOVA_FUNCIONALIDADE") {
      if (item?.preflight?.status !== "PASS" ||
          !nonblank(item?.preflight?.evidencia) ||
          !nonemptyStrings(item?.testes?.red))
        err("P0 RCA: " + label + " funcionalidade sem preflight e TDD RED.");
    }
  }
  for (const path of paths) {
    if (!covered.has(path))
      err("P0 RCA: arquivo alterado fora do mapa causal/impacto: " + path);
  }
  return { errors, applicable: true, version };
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function changedFiles() {
  const envBase = String(process.env.FRONTEND_DIFF_BASE || "").trim();
  const event = String(process.env.GITHUB_EVENT_NAME || "");
  if (event === "workflow_dispatch" && !envBase) return [];
  let base = envBase && !/^0+$/.test(envBase) ? envBase : git("rev-parse", "HEAD^");
  let head = "HEAD";
  if (event === "pull_request") {
    try { head = git("rev-parse", "HEAD^2"); } catch { head = "HEAD"; }
    base = git("merge-base", base, head);
  }
  return git("diff", "--name-only", "--diff-filter=ACMRD", base, head)
    .split("\n").filter(Boolean);
}
function main() {
  let changed;
  try { changed = changedFiles(); } catch (e) {
    console.error("P0 RCA FAIL: não foi possível determinar diff real: " + e.message);
    process.exitCode = 1;
    return;
  }
  let plan;
  try { plan = JSON.parse(readFileSync(PLAN, "utf8")); } catch (e) {
    console.error("P0 RCA FAIL: plano ativo inválido: " + e.message);
    process.exitCode = 1;
    return;
  }
  const exists = existsSync(REPORT);
  let report = null;
  if (exists) {
    try { report = JSON.parse(readFileSync(REPORT, "utf8")); } catch (e) {
      console.error("P0 RCA FAIL: relatório não parseável: " + e.message);
      process.exitCode = 1;
      return;
    }
  }
  const result = validateRcaImpact({
    planId: plan.prompt_id, changed, report, reportExists: exists,
  });
  if (result.errors.length) {
    result.errors.forEach((e) => console.error(e));
    process.exitCode = 1;
    return;
  }
  console.log(result.applicable ?
    "P0 RCA PASS: ficha causal e mapa de impacto estruturalmente consistentes (" + result.version + ")." :
    "P0 RCA N/A: V1 ou diff documental, controles preexistentes mantidos.");
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
    fileURLToPath(new URL("file://" + process.argv[1]))) main();

import { existsSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const OWNER = "contaos999999";
const REPO = OWNER + "/contaos-hml-control";
const RANGES = {
  V2: ["44", "45", "46", "47", "48", "49", "76", "77"],
  V3: ["50", "51", "52", "53", "54", "55", "78", "79"],
  V4: ["56", "57", "58", "59", "80", "81", "82", "83"],
  V5: ["60", "61", "62", "63", "64", "65", "66", "84", "85", "86", "87", "88", "89"],
};
const validSha = (x) => typeof x === "string" && /^[a-f0-9]{40}$/.test(x);
const hasText = (x) => typeof x === "string" && x.trim().length > 0;
const texts = (x) => Array.isArray(x) && x.length > 0 && x.every(hasText);
const appFile = (p) => /^(src\/|public\/)/.test(p) ||
  ["package.json", "bun.lock", "vite.config.ts", "tsconfig.json", "index.html"].includes(p);
const codeFile = (p) => appFile(p) || /^(scripts\/|\.github\/workflows\/)/.test(p);
const safeCode = (p) => typeof p === "string" && codeFile(p) &&
  !p.includes("..") && !p.startsWith("src/integrations/supabase/");
const pathVersion = (p) => {
  const m = /(?:^|[/_.-])v([1-5])(?=$|[/_.-]|\d{2,3})/i.exec(p);
  return m ? "V" + m[1] : null;
};
const caseValid = (t, exists) => t && hasText(t.id) && hasText(t.caso) &&
  ((t.runner === "node" && /^scripts\/[\w/-]+\.test\.mjs$/.test(t.arquivo)) ||
    (t.runner === "vitest" && /^src\/[\w/-]+\.test\.[jt]sx?$/.test(t.arquivo))) &&
  !t.arquivo.includes("..") && exists(t.arquivo);

export function validateRcaImpact({
  planId, changed = [], report = null, reportExists = false,
  legacyAllowlist = [], expectedFrontendSha = null, expectedBackendSha = null,
  fileExists = existsSync,
}) {
  const errors = [];
  const err = (msg) => errors.push("P0 RCA: " + msg);
  const id = String(planId || "").padStart(2, "0");
  const version = Object.keys(RANGES).find((v) => RANGES[v].includes(id));
  const paths = changed.filter(codeFile);
  if (!paths.length) return { errors, applicable: false, version };
  if (!version) {
    if (!(Number(id) <= 42 || id === "43" || id === "75"))
      err("PLAN sem versão válida para código alterado.");
    const future = paths.filter((p) => {
      const v = pathVersion(p);
      return v && v !== "V1";
    });
    if (future.length) err("código de V2–V5 sob PLAN V1: " + future.join(", "));
    const unknown = paths.filter((p) => appFile(p) && !legacyAllowlist.includes(p));
    if (unknown.length)
      err("código novo/sem classificação na allowlist V1 pré-BUILD: " + unknown.join(", "));
    return { errors, applicable: false, version: "V1" };
  }
  if (!reportExists || !changed.includes(REPORT) || !report) {
    err("BUILD " + version + " sem ficha RCA alterada no mesmo diff.");
    return { errors, applicable: true, version };
  }
  if (report.schema !== "contaos.p0.rca-report.v2" ||
      report.versao !== version || report.prompt_id !== id ||
      !validSha(report.baseline?.frontend_sha) ||
      !validSha(report.baseline?.backend_sha) ||
      (expectedFrontendSha && report.baseline.frontend_sha !== expectedFrontendSha) ||
      (expectedBackendSha && report.baseline.backend_sha !== expectedBackendSha))
    err("schema, versão, prompt ou HEADs reais incompatíveis.");
  if (!Array.isArray(report.escopo) || report.escopo.length !== paths.length ||
      new Set((report.escopo || []).map((x) => x?.arquivo)).size !== paths.length)
    err("mapa de escopo não corresponde ao diff exato.");
  const mapped = new Map();
  for (const x of report.escopo || []) {
    if (!safeCode(x?.arquivo) || !paths.includes(x.arquivo) ||
        !/^V[1-5]$/.test(x?.versao || "") ||
        Number(x.versao.slice(1)) > Number(version.slice(1)) ||
        (pathVersion(x.arquivo) && pathVersion(x.arquivo) !== x.versao) ||
        !hasText(x.justificativa)) {
      err("arquivo sem classificação de versão e justificativa verificáveis.");
      continue;
    }
    mapped.set(x.arquivo, x.versao);
  }
  for (const p of paths)
    if (!mapped.has(p)) err("arquivo fora do mapa de versão: " + p);
  if (!Array.isArray(report.itens) || !report.itens.length) {
    err("ficha sem itens RCA/preflight.");
    return { errors, applicable: true, version };
  }
  const ids = new Set();
  const covered = new Set();
  for (const [index, item] of report.itens.entries()) {
    const label = "item " + (index + 1);
    if (!hasText(item?.id) || ids.has(item.id)) err(label + " sem ID exclusivo.");
    ids.add(item?.id);
    if (!["CORRECAO", "NOVA_FUNCIONALIDADE"].includes(item?.tipo))
      err(label + " tipo inválido.");
    if (!hasText(item?.solucao?.descricao) || !hasText(item?.solucao?.rollback) ||
        !texts(item?.solucao?.arquivos) ||
        item.solucao.arquivos.some((p) => !safeCode(p)))
      err(label + " sem solução, allowlist segura ou rollback.");
    for (const p of item?.solucao?.arquivos || []) covered.add(p);
    if (!texts(item?.impacto?.dependencias) ||
        !texts(item?.impacto?.versoes_afetadas) ||
        item.impacto.versoes_afetadas.some((v) => !/^V[1-5]$/.test(v)) ||
        !Array.isArray(item?.impacto?.riscos) || !item.impacto.riscos.length ||
        item.impacto.riscos.some((r) => !hasText(r?.risco) ||
          !caseValid(r?.teste_preventivo, fileExists)))
      err(label + " sem mapa, versões, riscos ou testes preventivos executáveis.");
    for (const key of ["red", "green", "negativos", "regressao"]) {
      const entries = item?.testes?.[key];
      if (!Array.isArray(entries) || !entries.length ||
          entries.some((t) => !caseValid(t, fileExists)))
        err(label + " testes " + key + " não são casos executáveis.");
    }
    if (item?.tipo === "CORRECAO") {
      if (item?.reproducao?.confirmada !== true ||
          !texts([item?.reproducao?.sintoma, item?.reproducao?.esperado,
            item?.reproducao?.observado, item?.reproducao?.evidencia]) ||
          item?.causa?.status !== "CONFIRMADA" ||
          !hasText(item?.causa?.descricao) ||
          !texts(item?.causa?.evidencias) ||
          !texts(item?.causa?.hipoteses_descartadas))
        err(label + " causa raiz/RED não confirmados.");
    } else if (item?.tipo === "NOVA_FUNCIONALIDADE" &&
        (item?.preflight?.status !== "PASS" || !hasText(item?.preflight?.evidencia)))
      err(label + " sem preflight real.");
    for (const red of item?.testes?.red || []) {
      if (!/^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/actions\/runs\/[1-9]\d*$/.test(red.run_url || "") ||
          !validSha(red.run_sha))
        err(label + " RED sem execução histórica verificável e SHA.");
    }
    const affected = new Set(item?.impacto?.versoes_afetadas || []);
    for (const p of item?.solucao?.arquivos || [])
      if (!affected.has(mapped.get(p))) err(label + " não cobre versão afetada de " + p);
  }
  for (const p of paths)
    if (!covered.has(p)) err("arquivo alterado fora de RCA: " + p);
  return { errors, applicable: true, version };
}

export async function verifyRcaOperational(report, {
  apiGet, apiText, execute, isAncestor,
} = {}) {
  const errors = [];
  if (!report || !apiGet || !apiText || !execute || !isAncestor)
    return { errors: ["RCA LIVE: dependência de prova ausente."], executed: 0 };
  const redCache = new Map();
  const greenCache = new Map();
  for (const item of report.itens || []) {
    for (const entry of item?.testes?.red || []) {
      const m = /\/actions\/runs\/(\d+)$/.exec(entry.run_url || "");
      const key = entry.run_url + ":" + entry.caso;
      if (!m) { errors.push("RCA LIVE: RED sem run válido."); continue; }
      if (!redCache.has(key)) redCache.set(key, (async () => {
        const run = await apiGet("/repos/" + REPO + "/actions/runs/" + m[1]);
        if (run?.name !== "ContaOS Frontend Zero-Drift" ||
            run?.head_sha !== entry.run_sha || run?.conclusion !== "failure" ||
            !isAncestor(entry.run_sha)) return false;
        const jobs = await apiGet("/repos/" + REPO + "/actions/runs/" + m[1] + "/jobs?per_page=100");
        if (!jobs || jobs.total_count > 100) return false;
        for (const j of (jobs.jobs || []).filter((x) => x.conclusion === "failure")) {
          const logs = await apiText("/repos/" + REPO + "/actions/jobs/" + j.id + "/logs");
          if (String(logs).split("\n").some((line) =>
            line.includes(entry.caso) && /\bnot ok\b|\bFAIL\b/i.test(line))) return true;
        }
        return false;
      })().catch(() => false));
      if (!await redCache.get(key))
        errors.push("RCA LIVE: RED sem erro observado no teste " + entry.caso + ".");
    }
    const required = [...(item?.testes?.green || []),
      ...(item?.testes?.negativos || []),
      ...(item?.testes?.regressao || []),
      ...(item?.impacto?.riscos || []).map((r) => r.teste_preventivo)];
    for (const entry of required) {
      const key = entry?.runner + ":" + entry?.arquivo + ":" + entry?.caso;
      if (!greenCache.has(key)) {
        let pass = false;
        try { pass = Boolean(await execute(entry)); } catch { pass = false; }
        greenCache.set(key, pass);
      }
      if (!greenCache.get(key))
        errors.push("RCA LIVE: teste não executado com PASS: " + entry?.caso);
    }
  }
  return { errors, executed: greenCache.size };
}

export function runCase(entry) {
  const escaped = entry.caso.replace(/[^\w -]/g, (x) => "\\" + x);
  const pat = "^" + escaped + "$";
  const node = entry.runner === "node";
  const args = node
    ? ["--test", "--test-name-pattern=" + pat, entry.arquivo]
    : ["vitest", "run", entry.arquivo, "-t", pat, "--reporter=json", "--maxWorkers=2"];
  // Casos de teste não recebem credenciais usadas pelo gate de autenticidade.
  // O runner principal é a única autoridade autorizada a consultar o GitHub.
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/(?:TOKEN|SECRET|PASSWORD|API_KEY|AUTH_KEY|PRIVATE_KEY)/i.test(key))
      delete env[key];
  }
  const p = spawnSync(node ? process.execPath : "bunx", args,
    { encoding: "utf8", timeout: 120000, maxBuffer: 5 * 1024 * 1024, env });
  if (p.error || p.status !== 0) return false;
  const out = String(p.stdout || "");
  if (node) {
    const pass = /(?:^|\n)# pass (\d+)\r?(?:\n|$)/.exec(out);
    const fail = /(?:^|\n)# fail (\d+)\r?(?:\n|$)/.exec(out);
    return Boolean(pass && Number(pass[1]) > 0 && fail && Number(fail[1]) === 0);
  }
  try {
    const j = JSON.parse(out.slice(out.indexOf("{")));
    // -t exclui os demais casos por design; somente o caso exato deve ter PASS.
    return j.numPassedTests > 0 && j.numFailedTests === 0;
  } catch { return false; }
}
function git(...args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }
function changes() {
  const prior = String(process.env.FRONTEND_DIFF_BASE || "").trim();
  const event = String(process.env.GITHUB_EVENT_NAME || "");
  if (event === "workflow_dispatch" && !prior)
    throw new Error("workflow manual sem base de diff verificável.");
  let base = prior && !/^0+$/.test(prior) ? prior : git("rev-parse", "HEAD^");
  let head = "HEAD";
  if (event === "pull_request") {
    try { head = git("rev-parse", "HEAD^2"); } catch { head = "HEAD"; }
    base = git("merge-base", base, head);
  }
  return { base, changed: git("diff", "--name-only", "--diff-filter=ACMRD", base, head).split("\n").filter(Boolean) };
}
async function http(path, token, raw = false) {
  if (!token) throw new Error("token de leitura indisponível.");
  const res = await fetch("https://api.github.com" + path, {
    headers: { Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json", "User-Agent": "ContaOS-P0-RCA" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("GitHub HTTP " + res.status);
  return raw ? res.text() : res.json();
}
async function main() {
  let base, changed, plan, previous, report = null;
  try {
    ({ base, changed } = changes());
    plan = JSON.parse(readFileSync(PLAN, "utf8"));
    previous = JSON.parse(git("show", base + ":" + PLAN));
    if (existsSync(REPORT)) report = JSON.parse(readFileSync(REPORT, "utf8"));
  } catch (e) {
    console.error("P0 RCA FAIL: baseline/diff/PLAN: " + e.message);
    process.exitCode = 1; return;
  }
  const active = Object.keys(RANGES).some((v) => RANGES[v].includes(plan.prompt_id));
  const appChanged = changed.some(codeFile);
  const canonicalToken = String(process.env.CONTAOS_CANONICAL_READ_TOKEN || "");
  const githubToken = String(process.env.GITHUB_TOKEN || "");
  let backendSha = null;
  if (active && appChanged) {
    try {
      const head = await http("/repos/" + OWNER + "/develop/commits/main", canonicalToken);
      backendSha = head.sha;
    } catch (e) {
      console.error("P0 RCA FAIL: HEAD normativo não verificado: " + e.message);
      process.exitCode = 1; return;
    }
  }
  const result = validateRcaImpact({
    planId: plan.prompt_id, changed, report, reportExists: existsSync(REPORT),
    legacyAllowlist: previous.arquivos_permitidos,
    expectedFrontendSha: base, expectedBackendSha: backendSha,
  });
  if (result.errors.length) {
    result.errors.forEach((msg) => console.error(msg));
    process.exitCode = 1; return;
  }
  if (!result.applicable) {
    console.log("P0 RCA N/A: escopo V1 pré-validado ou diff documental, sem código futuro.");
    return;
  }
  const evidence = await verifyRcaOperational(report, {
    apiGet: (path) => http(path, githubToken),
    apiText: (path) => http(path, githubToken, true),
    execute: runCase,
    isAncestor: (sha) => {
      try { execFileSync("git", ["merge-base", "--is-ancestor", sha, "HEAD"]); return true; }
      catch { return false; }
    },
  });
  if (evidence.errors.length) {
    evidence.errors.forEach((msg) => console.error(msg));
    process.exitCode = 1; return;
  }
  console.log("P0 RCA PASS: baseline real, RED comprovado e " +
    evidence.executed + " casos GREEN/NEG/REG executados no HEAD.");
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
  fileURLToPath(new URL("file://" + process.argv[1]))) main();

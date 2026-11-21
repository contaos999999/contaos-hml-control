import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolveEventContext } from "./ci/merge-group-context.mjs";

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const V1_SCOPE = "docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json";
const BOOTSTRAP_PLAN = "docs/frontend/planos/P0_V2_RCA_661_REVIEW_CAUSA_RAIZ_EMENDA_PLAN_2026-11-14.md";
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
  fileExists = existsSync, prNumber = null, governancePlan = null,
  v1Scope = null, v1ScopeChanged = false, addedLines = {},
  fullDiffPaths = null,
  readBytes = (path) => readFileSync(path),
}) {
  const errors = [];
  const err = (msg) => errors.push("P0 RCA: " + msg);
  const id = String(planId || "").padStart(2, "0");
  let version = Object.keys(RANGES).find((v) => RANGES[v].includes(id));
  // NR-005: valida o diff INTEIRO antes de filtrar codigo ou documentos.
  if (prNumber === 690 || governancePlan?.full_diff === true) {
    const approved = governancePlan?.approved === true &&
      governancePlan.pr_number === prNumber &&
      governancePlan.full_diff === true &&
      Array.isArray(governancePlan.files) &&
      governancePlan.files.length === new Set(governancePlan.files).size &&
      governancePlan.files.every((p) => hasText(p) && !p.includes(".."));
    if (!approved) err("manifesto full_diff protegido ausente/divergente para PR " + prNumber);
    if (prNumber === 690 && governancePlan?.files?.length !== 14)
      err("manifesto #690 deve conter os 14 caminhos exatos.");
    if (!Array.isArray(fullDiffPaths) || !fullDiffPaths.length ||
        fullDiffPaths.some((p) => !hasText(p)))
      err("full_diff de arquivos e renomeações não comprovado.");
    else if (approved) {
      const allow = new Set(governancePlan.files);
      const denied = fullDiffPaths.filter((p) => !allow.has(p));
      if (denied.length) err("caminho fora da allowlist full_diff: " + denied.join(", "));
      const incomplete = changed.filter((p) => !fullDiffPaths.includes(p));
      if (incomplete.length) err("full_diff incompleto: " + incomplete.join(", "));
    }
    return { errors, applicable: false, version: "P0_GOV_FULL_DIFF" };
  }
  let paths = changed.filter(codeFile);
  if (!paths.length) return { errors, applicable: false, version };
  if (!version) {
    if (!(Number(id) <= 42 || id === "43" || id === "75"))
      err("PLAN sem versão válida para código alterado.");
    const future = paths.filter((p) => {
      const v = pathVersion(p);
      return v && v !== "V1";
    });
    if (future.length)
      err("código de V2–V5 sob PLAN V1: " + future.join(", "));
    const governancePaths = paths.filter((p) => !appFile(p));
    if (governancePaths.length &&
        (!governancePlan?.approved ||
         governancePlan.pr_number !== prNumber ||
         !Array.isArray(governancePlan.files) ||
         governancePaths.some((p) => !governancePlan.files.includes(p)))) {
      err("código de governança sem PLAN protegido e escopo fechado desta PR: " +
        governancePaths.join(", "));
    }
    const appPaths = paths.filter(appFile);
    if (!appPaths.length)
      return { errors, applicable: false, version: "P0_GOV" };
    const unknown = appPaths.filter((p) => !legacyAllowlist.includes(p));
    if (unknown.length)
      err("código V1 novo/sem classificação na allowlist pré-BUILD: " + unknown.join(", "));
    const introduced = appPaths.filter((p) =>
      /(?:^|[^a-z0-9])V[2-5](?:[-_/ ]|$)|V[2-5]-(?:DIL|PRO|ACT|KB|CONTEST)/i
        .test(String(addedLines[p] || "")));
    if (introduced.length)
      err("diff de V1 introduz referências V2–V5: " + introduced.join(", "));
    // Emenda X P0-RCA: V1 fases 3–7 exigem causa, RED GitHub, impactos,
    // negativos e regressões, não somente allowlist e teste genérico.
    report = v1Scope;
    reportExists = v1ScopeChanged;
    version = "V1";
    paths = appPaths;
  }
  const evidenceFile = version === "V1" ? V1_SCOPE : REPORT;
  if (!reportExists || !changed.includes(evidenceFile) || !report) {
    err("BUILD " + version + " sem ficha RCA causal alterada no mesmo diff.");
    return { errors, applicable: true, version };
  }
  if (report.schema !== (version === "V1" ? "contaos.p0.v1-scope-proof.v2" : "contaos.p0.rca-report.v2") ||
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
    } else if (item?.tipo === "NOVA_FUNCIONALIDADE") {
      const pre = item?.preflight;
      const required = ["CONTRATO", "RBAC_RLS", "DADOS_INTEGRIDADE", "DEPENDENCIAS"];
      const tests = pre?.checks || [];
      const hasAll = Array.isArray(tests) && tests.length === required.length &&
        required.every((kind) => tests.filter((x) => x?.tipo === kind).length === 1) &&
        tests.every((x) => caseValid(x?.teste, fileExists));
      const evidencePath = pre?.arquivo_evidencia;
      const pathOk = typeof evidencePath === "string" &&
        /^docs\/frontend\/auditorias\/preflight\/[\w/-]+\.(?:json|md)$/.test(evidencePath) &&
        !evidencePath.includes("..");
      let hashOk = false;
      if (pathOk && fileExists(evidencePath) &&
          typeof pre.arquivo_sha256 === "string" &&
          /^[a-f0-9]{64}$/.test(pre.arquivo_sha256)) {
        try {
          hashOk = createHash("sha256").update(readBytes(evidencePath))
            .digest("hex") === pre.arquivo_sha256;
        } catch { hashOk = false; }
      }
      if (pre?.status !== "VERIFICADO" ||
          pre?.baseline_sha !== report.baseline?.frontend_sha ||
          !hasAll || !hashOk) {
        err(label + " preflight sem contrato/RBAC/RLS/dados/dependências testados, SHA e evidência real.");
      }
    }
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
      ...(item?.impacto?.riscos || []).map((r) => r.teste_preventivo),
      ...(item?.tipo === "NOVA_FUNCIONALIDADE"
        ? (item?.preflight?.checks || []).map((c) => c.teste) : [])];
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
  // Evitar aviso node:test "run() is being called recursively" em casos
  // selecionados por um teste do próprio guard; caso contrário retorna 0,
  // mas nenhum teste é executado, e o guard deve recusar falso GREEN.
  delete env.NODE_TEST_CONTEXT;
  const p = spawnSync(node ? process.execPath : "bunx", args,
    { encoding: "utf8", timeout: 120000, maxBuffer: 5 * 1024 * 1024, env });
  if (p.error || p.status !== 0) return false;
  const out = String(p.stdout || "");
  if (node) {
    const pass = /(?:^|\n)# pass (\d+)\r?(?:\n|$)/.exec(out);
    const fail = /(?:^|\n)# fail (\d+)\r?(?:\n|$)/.exec(out);
    // Node pode retornar exit 0, "# pass 1" para o ARQUIVO inteiro mesmo
    // quando o --test-name-pattern selecionou ZERO casos. Exigir a linha do
    // subteste exato e seu resultado ok, nunca só o resumo numérico.
    const lines = out.split("\n").map((line) => line.trimEnd());
    const selected = lines.some((line) => line === "# Subtest: " + entry.caso);
    const green = lines.some((line) => /^ok [1-9]\d* - /.test(line) &&
      line.endsWith(" - " + entry.caso));
    return Boolean(selected && green && pass && Number(pass[1]) > 0 &&
      fail && Number(fail[1]) === 0);
  }
  try {
    const j = JSON.parse(out.slice(out.indexOf("{")));
    // -t exclui os demais casos por design; somente o caso exato deve ter PASS.
    return j.numPassedTests > 0 && j.numFailedTests === 0;
  } catch { return false; }
}
function git(...args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }

// Retorna os DOIS lados de renomeações por tokens NUL: não perder caminho
// anterior nem aceitar tabs/newlines como delimitadores ambíguos.
export function parseFullDiffNameStatus(raw) {
  if (typeof raw !== "string" || (!raw.endsWith("\0") && raw !== ""))
    throw new Error("diff --name-status -z malformado");
  const fields = raw === "" ? [] : raw.slice(0, -1).split("\0");
  const paths = [];
  for (let i = 0; i < fields.length;) {
    const status = fields[i++];
    const renamed = /^[RC]\d{1,3}$/.test(status);
    if (!renamed && !/^[ACMDT]$/.test(status))
      throw new Error("tipo de diff não reconhecido: " + status);
    const size = renamed ? 2 : 1;
    if (i + size > fields.length)
      throw new Error("diff truncado");
    for (let j = 0; j < size; j++) {
      const path = fields[i++];
      if (!path || path.startsWith("/") || path.split("/").includes("..") ||
          path.includes("\n") || path.includes("\r"))
        throw new Error("caminho suspeito no diff");
      paths.push(path);
    }
  }
  return [...new Set(paths)];
}
export function uniquePrAssociation(list) {
  if (!Array.isArray(list) || list.length !== 1 ||
      !Number.isSafeInteger(list[0]?.number) || list[0].number < 1)
    throw new Error("push sem PR autenticada unica, inclusive diff documental");
  return list[0].number;
}
export function safeTreeEntry(raw, path) {
  if (raw === "") return true; // Deleted path still checked against allowlist.
  if (typeof raw !== "string") return false;
  const m = /^(100644|100755) blob [0-9a-f]{40}\t([^\0]+)\0$/.exec(raw);
  return Boolean(m && m[2] === path);
}
function fullDiffPaths(base, head) {
  const raw = execFileSync("git",
    ["diff", "--name-status", "-z", "--find-renames", "--diff-filter=ACMRTD", base, head],
    { encoding: "utf8", timeout: 20000 });
  return parseFullDiffNameStatus(raw);
}
async function githubPrFiles(number, token) {
  const paths = new Set();
  for (let page = 1; page <= 10; page++) {
    const chunk = await http("/repos/" + REPO + "/pulls/" + number +
      "/files?per_page=100&page=" + page, token);
    if (!Array.isArray(chunk)) throw new Error("lista de arquivos PR inválida");
    for (const item of chunk) {
      if (!hasText(item.filename)) throw new Error("nome de arquivo PR ausente");
      paths.add(item.filename);
      if (item.status === "renamed") {
        if (!hasText(item.previous_filename)) throw new Error("origem da renomeação ausente");
        paths.add(item.previous_filename);
      }
    }
    if (chunk.length < 100) return [...paths];
  }
  throw new Error("PR com lista de arquivos não exaustiva (>1000)");
}
const setEqual = (a, b) =>
  a.length === b.length && a.every((p) => b.includes(p));
async function resolvePrContext(event, base, head, changed, token) {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) throw new Error("payload GitHub ausente");
  const payload = JSON.parse(readFileSync(path, "utf8"));
  if (payload?.repository?.full_name !== REPO)
    throw new Error("repo GitHub do evento não corresponde");
  if (event === "pull_request") {
    const pr = payload.pull_request;
    const number = pr?.number ?? payload.number;
    const currentHead = git("rev-parse", head);
    if (!Number.isInteger(number) || number < 1 ||
        pr?.base?.ref !== "main" || pr?.head?.sha !== currentHead ||
        !pr?.base?.sha || git("rev-parse", base) !== pr.base.sha)
      throw new Error("PR/base/head do evento não comprovados");
    return { number, manifestBase: base };
  }
  if (event === "merge_group") {
    const group = await resolveEventContext();
    if (group.base_sha !== git("rev-parse", base) ||
        group.head_sha !== git("rev-parse", "HEAD"))
      throw new Error("grupo autenticado não corresponde ao diff");
    return { number: group.pr, manifestBase: group.base_sha };
  }
  if (event === "push") {
    if (payload.ref !== "refs/heads/main" ||
        payload.before !== git("rev-parse", base) ||
        payload.after !== git("rev-parse", "HEAD"))
      throw new Error("push/HEAD/base não comprovados");
    const list = await http("/repos/" + REPO + "/commits/" + payload.after + "/pulls", token);
    if (!Array.isArray(list)) throw new Error("associação autenticada de PR indisponível");
    // Branch protection requires a PR even for a docs-only push. Never N/A.
    const associated = uniquePrAssociation(list);
    const pr = await http("/repos/" + REPO + "/pulls/" + associated, token);
    const parents = git("rev-list", "--parents", "-n", "1", "HEAD").split(/\s+/);
    if (pr.merged_at == null || pr.base?.ref !== "main" ||
        pr.merge_commit_sha !== payload.after ||
        parents.length !== 3 || parents[0] !== payload.after ||
        parents[1] !== payload.before || parents[2] !== pr.head?.sha)
      throw new Error("push não comprovado por merge de dois pais/PR");
    return { number: pr.number, manifestBase: payload.before };
  }
  throw new Error("evento GitHub sem proveniência validada");
}

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
  return { base, head, changed: git("diff", "--name-only", "--diff-filter=ACMRTD", base, head).split("\n").filter(Boolean) };
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
  let base, head, changed, plan, previous, report = null;
  try {
    ({ base, head, changed } = changes());
    plan = JSON.parse(readFileSync(PLAN, "utf8"));
    previous = JSON.parse(git("show", base + ":" + PLAN));
    if (existsSync(REPORT)) report = JSON.parse(readFileSync(REPORT, "utf8"));
  } catch (e) {
    console.error("P0 RCA FAIL: baseline/diff/PLAN: " + e.message);
    process.exitCode = 1; return;
  }
  const active = Object.keys(RANGES).some((v) => RANGES[v].includes(plan.prompt_id)) ||
    Number(plan.prompt_id) <= 42 || ["43", "75"].includes(String(plan.prompt_id));
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
  // NR-005: resolver PR autenticada, manifesto na base pré-diff e diff completo.
  // Nunca usar texto do commit ou origin/main já avançada como autoridade.
  let prNumber = null;
  let governancePlan = null;
  let fullPaths = null;
  const event = String(process.env.GITHUB_EVENT_NAME || "");
  try {
    const resolved = await resolvePrContext(event, base, head, changed, githubToken);
    prNumber = resolved.number;
    fullPaths = fullDiffPaths(base, head);
    if (prNumber) {
      const planPath = "docs/frontend/planos/P0_GOV_PLAN_" + prNumber + ".json";
      let approved = null;
      try {
        approved = JSON.parse(git("show", resolved.manifestBase + ":" + planPath));
      } catch {
        if (prNumber === 661) {
          // Fallback legado explicitamente limitado à PR 661 previamente autorizada.
          const original = git("show", resolved.manifestBase + ":" + BOOTSTRAP_PLAN);
          const mark = String.fromCharCode(96);
          const pattern = new RegExp(mark +
            "((?:scripts/|\\.github/workflows/)[^" + mark + "]+)" + mark, "g");
          const files = [...original.matchAll(pattern)].map((m) => m[1])
            .filter(codeFile);
          if (original.includes("PR de BUILD:** #661") && files.length)
            approved = { pr_number: 661, files, approved: true };
        }
      }
      if (approved?.pr_number === prNumber &&
          approved.approved === true && Array.isArray(approved.files))
        governancePlan = approved;
      if (prNumber === 690) {
        if (!governancePlan || governancePlan.full_diff !== true ||
            governancePlan.ativacao_autorizada !== false ||
            governancePlan.plan_blob !==
              git("rev-parse", resolved.manifestBase + ":" +
                "docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md"))
          throw new Error("manifesto #690 não é íntegro na base protegida anterior");
        if (!/^[a-f0-9]{40}$/.test(governancePlan.plan_base_sha || ""))
          throw new Error("PLAN base SHA ausente");
        try {
          execFileSync("git", ["merge-base", "--is-ancestor",
            governancePlan.plan_base_sha, resolved.manifestBase]);
        } catch { throw new Error("PLAN #690 não antecede base protegida"); }
      }
      if (governancePlan?.full_diff === true) {
        for (const path of fullPaths) {
          const mode = execFileSync("git", ["ls-tree", "-z", head, "--", path],
            {encoding:"utf8", timeout:20000});
          if (!safeTreeEntry(mode, path))
            throw new Error("full_diff inclui symlink/gitlink ou modo inseguro: "+path);
        }
        const remotePaths = await githubPrFiles(prNumber, githubToken);
        if (!setEqual(fullPaths, remotePaths))
          throw new Error("full_diff local difere da lista paginada GitHub PR " + prNumber);
      }
    } else if (changed.some((p) => /mission-supervisor|merge-group-context|MISSAO_ATIVA_4_1/.test(p))) {
      throw new Error("BUILD sem PR autenticada, N/A documental proibido");
    }
  } catch (e) {
    console.error("P0 RCA FAIL: identidade de PR/manifesto/full_diff: " + e.message);
    process.exitCode = 1; return;
  }
  let v1Scope = null;
  if (existsSync(V1_SCOPE)) {
    try { v1Scope = JSON.parse(readFileSync(V1_SCOPE, "utf8")); }
    catch { v1Scope = null; }
  }
  const addedLines = {};
  for (const path of changed.filter(appFile)) {
    try {
      addedLines[path] = git("diff", "--unified=0", base, head, "--", path)
        .split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"))
        .map((line) => line.slice(1)).join("\n");
    } catch { addedLines[path] = ""; }
  }
  const result = validateRcaImpact({
    planId: plan.prompt_id, changed, report, reportExists: existsSync(REPORT),
    legacyAllowlist: previous.arquivos_permitidos,
    expectedFrontendSha: base, expectedBackendSha: backendSha,
    prNumber, governancePlan, v1Scope, fullDiffPaths: fullPaths,
    v1ScopeChanged: changed.includes(V1_SCOPE), addedLines,
  });
  if (result.errors.length) {
    result.errors.forEach((msg) => console.error(msg));
    process.exitCode = 1; return;
  }
  if (!result.applicable) {
    console.log(result.version === "P0_GOV_FULL_DIFF" ? "P0 RCA FULL_DIFF PASS: manifesto protegido, 14 caminhos, PR GitHub e renomeações verificados." : "P0 RCA N/A: governança com PLAN protegido ou diff documental comum.");
    return;
  }
  const activeReport = result.version === "V1" ? v1Scope : report;
  const evidence = await verifyRcaOperational(activeReport, {
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
  console.log("P0 RCA PASS " + result.version + ": baseline real, RED comprovado e " +
    evidence.executed + " casos GREEN/NEG/REG executados no HEAD.");
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
  fileURLToPath(new URL("file://" + process.argv[1]))) main();

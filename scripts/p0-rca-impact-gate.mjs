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
  // Fail before any documentary N/A, even without a PLAN for this PR.
  try {
    assertImmutableP0Governance(
      [...changed, ...(Array.isArray(fullDiffPaths) ? fullDiffPaths : [])],
      "validation");
  } catch (error) { err(error.message); }
  const id = String(planId || "").padStart(2, "0");
  let version = Object.keys(RANGES).find((v) => RANGES[v].includes(id));
  // NR-005: valida o diff INTEIRO antes de filtrar codigo ou documentos.
  if (prNumber === 690 || governancePlan?.full_diff === true) {
    const approved = governancePlan?.schema === "contaos.p0.gov-plan.v1" &&
      governancePlan?.approved === true &&
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
    ? ["--test", "--test-reporter=tap", "--test-name-pattern=" + pat, entry.arquivo]
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
export function verifyRawFullDiffModes(raw, expectedPaths) {
  if (typeof raw !== "string" || (!raw.endsWith("\0") && raw !== "") ||
      !Array.isArray(expectedPaths))
    throw new Error("NR-005 diff --raw -z malformado");
  const fields = raw ? raw.slice(0, -1).split("\0") : [];
  const found = [];
  for (let i = 0; i < fields.length;) {
    const meta = /^:(\d{6}) (\d{6}) ([0-9a-f]{7,64}) ([0-9a-f]{7,64}) ([ACDMRT]|[RC]\d{1,3})$/.exec(fields[i++]);
    if (!meta) throw new Error("NR-005 header do modo nao comprovado");
    const [, oldMode, newMode, , , state] = meta;
    const safe = new Set(["000000", "100644", "100755"]);
    if (!safe.has(oldMode) || !safe.has(newMode) ||
        (oldMode !== "000000" && newMode !== "000000" && oldMode !== newMode))
      throw new Error("NR-005 modo Git alterado/inseguro " + oldMode + " -> " + newMode);
    const count = /^[RC]\d{1,3}$/.test(state) ? 2 : 1;
    if (i + count > fields.length) throw new Error("NR-005 raw truncado");
    for (let j = 0; j < count; j++) {
      const path = fields[i++];
      if (!path || path.startsWith("/") || path.includes("\n") ||
          path.includes("\r") || path.split("/").includes(".."))
        throw new Error("NR-005 caminho raw suspeito");
      found.push(path);
    }
  }
  const actual = [...new Set(found)];
  if (actual.length !== expectedPaths.length || actual.some(p => !expectedPaths.includes(p)))
    throw new Error("NR-005 modo raw difere de full_diff");
  return true;
}
export const IMMUTABLE_P0_690_MANIFEST =
  "docs/frontend/planos/P0_GOV_PLAN_690.json";
export function assertImmutableP0Governance(paths, event) {
  if (!Array.isArray(paths) || paths.some(p => typeof p !== "string"))
    throw new Error("NR-005 full diff de manifesto protegido ausente");
  if (paths.includes(IMMUTABLE_P0_690_MANIFEST))
    throw new Error("NR-005 manifesto protegido #690 imutável em " +
      String(event || "evento não informado") + " antes de integrar");
  return true; // Does not alter documentary N/A for unrelated documents.
}
export function classifyProtectedPush(number, changed, manifestPresent) {
  if (!Array.isArray(changed)) throw new Error("NR-005 diff invalido");
  if (number === 690) return "BUILD_690";
  if (changed.includes("docs/frontend/planos/P0_GOV_PLAN_690.json"))
    throw new Error("NR-005 manifesto #690 imutavel em PR posterior");
  const cores = [
    "docs/frontend/governanca/MISSAO_ATIVA_4_1.json",
    "docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md",
  ];
  if (!manifestPresent && changed.some(p => cores.includes(p)))
    throw new Error("NR-005 documento central sem manifesto protegido na base");
  return "REGULAR_PR";
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
export async function resolvePrContext(event, base, head, changed, token, eventBase = base, options = {}) {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!options.payload && !path) throw new Error("payload GitHub ausente");
  const payload = options.payload ?? JSON.parse(readFileSync(path, "utf8"));
  const gitFn = options.gitFn ?? git;
  const apiGet = options.apiGet ?? http;
  if (payload?.repository?.full_name !== REPO)
    throw new Error("repo GitHub do evento não corresponde");
  if (event === "pull_request") {
    const pr = payload.pull_request;
    const number = pr?.number ?? payload.number;
    const currentHead = gitFn("rev-parse", head);
    // The event base can legitimately be newer than the merge-base of
    // the feature branch. Bind the live event base, not an ancestor.
    if (!Number.isInteger(number) || number < 1 ||
        pr?.base?.ref !== "main" || pr?.head?.sha !== currentHead ||
        !validSha(pr?.base?.sha) ||
        gitFn("rev-parse", eventBase) !== pr.base.sha ||
        gitFn("merge-base", eventBase, head) !== gitFn("rev-parse", base))
      throw new Error("PR/base/head do evento não comprovados");
    return { number, manifestBase: eventBase };
  }
  if (event === "merge_group") {
    const group = await resolveEventContext();
    if (group.base_sha !== gitFn("rev-parse", base) ||
        group.head_sha !== gitFn("rev-parse", "HEAD"))
      throw new Error("grupo autenticado não corresponde ao diff");
    return { number: group.pr, manifestBase: group.base_sha };
  }
  if (event === "push") {
    if (payload.ref !== "refs/heads/main" ||
        payload.before !== gitFn("rev-parse", base) ||
        payload.after !== gitFn("rev-parse", "HEAD"))
      throw new Error("push/HEAD/base não comprovados");
    const list = await apiGet("/repos/" + REPO + "/commits/" + payload.after + "/pulls", token);
    if (!Array.isArray(list)) throw new Error("associação autenticada de PR indisponível");
    // Classify *before* applying the #690 MERGE-only contract. In particular,
    // ordinary docs with no protected BUILD overlap may be integrated via
    // squash (one parent) or by a regular merge. No implicit BUILD exemption.
    let manifest690 = null;
    try {
      manifest690 = JSON.parse(gitFn("show", payload.before +
        ":docs/frontend/planos/P0_GOV_PLAN_690.json"));
    } catch { /* A missing protected manifest cannot authorize a BUILD. */ }
    // A historical allowlist is not the identity of a future integration.
    // Only the authenticated merged PR number triggers BUILD #690 rules.
    const sensitive = changed.some(codeFile) ||
      changed.some(p => [
        "docs/frontend/planos/P0_GOV_PLAN_690.json",
        "docs/frontend/governanca/MISSAO_ATIVA_4_1.json",
        "docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md",
      ].includes(p));
    if (!list.length) {
      if (sensitive)
        throw new Error("push de BUILD/código sem PR autenticada");
      return { number: null, manifestBase: payload.before, ordinaryDocument: true };
    }
    if (list.length !== 1) {
      if (sensitive)
        throw new Error("push de BUILD/código com PR ambígua");
      return { number: null, manifestBase: payload.before, ordinaryDocument: true };
    }
    const associated = uniquePrAssociation(list);
    const pr = await apiGet("/repos/" + REPO + "/pulls/" + associated, token);
    if (pr?.merged_at == null || pr.base?.ref !== "main" ||
        pr.merge_commit_sha !== payload.after || pr.number !== associated)
      throw new Error("associação PR/commit de integração não comprovada");
    const classified = classifyProtectedPush(associated, changed,
      manifest690?.schema === "contaos.p0.gov-plan.v1");
    if (classified === "BUILD_690") {
      // Only authenticated integration #690 requires two-parent MERGE.
      // Later authorized PRs retain their own governance and merge rite.
      const parents = gitFn("rev-list", "--parents", "-n", "1", "HEAD").split(/\s+/);
      if (parents.length !== 3 || parents[0] !== payload.after ||
          parents[1] !== payload.before || parents[2] !== pr.head?.sha)
        throw new Error("merge da #690 não comprovado por pais/HEAD protegidos");
      // Same names/modes are not sufficient: each merged blob must equal
      // the exact audited PR HEAD blob, including renames and deletions.
      for (const path of changed) {
        const gitBlob = (rev) => {
          try { return gitFn("rev-parse", rev + ":" + path); }
          catch { return null; }
        };
        if (gitBlob(payload.after) !== gitBlob(pr.head.sha))
          throw new Error("NR-005 conteúdo da árvore integrada difere do HEAD da PR: " + path);
      }
    }
    return { number: pr.number, manifestBase: payload.before, ordinaryDocument: classified === "REGULAR_PR" && !changed.some(codeFile) };
  }
  throw new Error("evento GitHub sem proveniência validada");
}

// A manual assistant pre-audit is a prerequisite for PRE-CERTIFICATION only.
// It is NOT an independent Codex PASS, a Github review, a mission certificate,
// or authorization to merge. Its evidence is a Github-authenticated PR comment
// tied to one exact HEAD and base and separately cross-checked against CI.
export const ASSISTANT_PREAUDIT_MARKER = "CONTAOS_ASSISTANT_PREAUDIT_V2";
export const ASSISTANT_PREAUDIT_CRITERIA = Object.freeze([
  "scope_and_manifest", "root_causes", "event_provenance",
  "negative_tests", "regression_integration", "security_boundaries",
  "check_and_artifact_provenance", "limitations_and_next_gates",
  "legitimate_state_transitions", "relational_provenance",
  "post_decision_revocation", "blind_diff_and_meta_audit",
]);
export const ADVERSARIAL_V2_LENSES = Object.freeze([
  "security", "provenance", "concurrency", "lifecycle", "state_machine",
  "integration", "resilience", "governance", "supply_chain",
  "legitimate_regression", "observability", "operational_environment",
]);
export const ADVERSARIAL_V2_STEP_NAMES = Object.freeze([
  ...Array.from({length:10},(_,i)=>"P0 V2 LAYER "+String(i+1).padStart(2,"0")),
  ...ADVERSARIAL_V2_LENSES.map(x=>"P0 V2 LENS "+x),
]);
export const ADVERSARIAL_V2_CHECK_NAME = "P0-ABS Adversarial V2 executavel";
export const ADVERSARIAL_V2_CAUSAL_CASES = Object.freeze([
  Object.freeze({case_id:"watchdog_postmerge",
    vulnerable_sha:"54b596f4ae3cce085e79967c4ea8cc4446685d5d",
    vulnerable_blob:"7f80dd25661a4cd5aebaa9aab40cf47a001623cc",
    observed:"N05_EXCEPTION_BEFORE_DIAGNOSIS",
    green:"BLOCKED_EXTERNAL_VERIFY_POST_MERGE_READBACK"}),
  Object.freeze({case_id:"artifact_attempt",
    vulnerable_sha:"7e34fe416c30ae38d384aef3084165b2f2e1ffee",
    vulnerable_blob:"38072d1d3a940d2f722f3e42d1475ab9cb5a04c5",
    observed:"STALE_ATTEMPT_FALSE_PASS",
    green:"NO_GO_STALE_ATTEMPT"}),
  Object.freeze({case_id:"review_comment",
    vulnerable_sha:"caa351c68a197fec3c7e6a95b8a7de4cfcc9845e",
    vulnerable_blob:"a85931fbe7215712b2df6d95366f41cc63b7cd29",
    observed:"COMMENTED_ERASED_CHANGES_REQUESTED",
    green:"NO_GO_NATIVE_VETO"}),
]);
export const PRECERT_REQUIRED_CHECKS = Object.freeze([
  "ContaOS Frontend Zero-Drift",
  "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
  "ContaOS P0-NR-001 Integridade e Provas",
  "protect-types", "Controlador offline Windows",
]);
export const PRECERT_ISSUER = 15368; // Github Actions, active ruleset #26495643.
const preauditHash = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const exactSet = (a, b) => Array.isArray(a) && Array.isArray(b) &&
  a.length === b.length && new Set(a).size === a.length &&
  new Set(b).size === b.length && a.every(x => b.includes(x));
// GitHub returns ALL checks on a commit, not just the newest workflow run.
// A native pull_request_review legitimately creates another run on the SAME
// commit. Select its newest authenticated job by monotonic GitHub Actions job
// ID, not API ordering, and reject foreign/ambiguous evidence; never reuse an
// older PASS while a newer run is pending or failed.
export function latestPrecertCheck(checkRuns, name, expectedHead) {
  if (!Array.isArray(checkRuns) || !validSha(expectedHead)) return null;
  const found=checkRuns.filter(x=>x?.name===name);
  if (!found.length || new Set(found.map(x=>x?.id)).size!==found.length) return null;
  if (!found.every(x=>Number.isSafeInteger(x?.id) && x.id>0 &&
      x.head_sha===expectedHead && x?.app?.id===PRECERT_ISSUER &&
      typeof x.details_url==="string" &&
      new RegExp("^https://github[.]com/"+REPO.replaceAll("/","\\/")+
        "/actions/runs/[1-9][0-9]*/job/"+x.id+"$").test(x.details_url) &&
      ["queued","in_progress","completed","waiting","pending","requested"].includes(x.status)))
    return null;
  return found.reduce((latest,x)=>!latest || x.id>latest.id?x:latest,null);
}
const v2AttestedJob=(check, job, head)=>
  !!check && !!job && job.id===check.id &&
  check.head_sha===head && check.app?.id===PRECERT_ISSUER &&
  check.status==="completed" && check.conclusion==="success" &&
  job.head_sha===head && job.status==="completed" && job.conclusion==="success" &&
  Number.isSafeInteger(job.run_id) && job.run_id>0 &&
  check.details_url==="https://github.com/"+REPO+"/actions/runs/"+
    job.run_id+"/job/"+job.id &&
  Array.isArray(job.steps) &&
  ["P0 FULL_PROTOCOL matriz integral e testemunhas executaveis",
    ...ADVERSARIAL_V2_STEP_NAMES,
    ...ADVERSARIAL_V2_CAUSAL_CASES.map(x=>"P0 V2 CAUSAL_RED "+x.case_id)]
    .every(name=>job.steps.filter(step=>step?.name===name &&
      step.status==="completed" && step.conclusion==="success").length===1);



// A prior Actions attempt can disappear from the CURRENT commit check-run
// enumeration after a rerun. Authenticate its actual job/run/attempt through
// the GitHub Actions API, rather than accepting an arbitrary job id or
// downgrading the requirement that the LATEST V2 check is GREEN.
export function verifyHistoricalV2JobProvenance({
  job,run,attemptJobs,attempt,head,base,
}={}) {
  const stepNames=["P0 FULL_PROTOCOL matriz integral e testemunhas executaveis",
    ...ADVERSARIAL_V2_STEP_NAMES,
    ...ADVERSARIAL_V2_CAUSAL_CASES.map(x=>"P0 V2 CAUSAL_RED "+x.case_id)];
  return !!job && Number.isSafeInteger(job.id) && job.id>0 &&
    job.head_sha===head && job.name===ADVERSARIAL_V2_CHECK_NAME &&
    job.status==="completed" && job.conclusion==="success" &&
    Number.isSafeInteger(job.run_id) && job.run_id>0 &&
    Array.isArray(job.steps) && stepNames.every(name=>
      job.steps.filter(x=>x?.name===name &&
        x.status==="completed" && x.conclusion==="success").length===1) &&
    !!run && run.id===job.run_id && run.head_sha===head &&
    run.head_branch==="build/p0-abs-fiscal-universal" &&
    run.path===".github/workflows/contaos-auditoria-controller.yml" &&
    run.repository?.full_name===REPO &&
    ["pull_request","pull_request_review","workflow_dispatch"].includes(run.event) &&
    ["completed","in_progress"].includes(run.status) &&
    Number.isSafeInteger(run.run_attempt) &&
    Number.isSafeInteger(attempt) && attempt>0 &&
    attempt<=run.run_attempt &&
    (run.event==="workflow_dispatch" ||
      run.pull_requests?.some(x=>x.number===690 &&
        x.head?.sha===head && x.base?.sha===base)) &&
    Array.isArray(attemptJobs?.jobs) &&
    attemptJobs.total_count===attemptJobs.jobs.length &&
    attemptJobs.jobs.filter(x=>x?.id===job.id &&
      x.run_id===run.id && x.name===ADVERSARIAL_V2_CHECK_NAME &&
      x.head_sha===head && x.status==="completed" &&
      x.conclusion==="success").length===1;
}

const PRECERT_WORKFLOW_ORIGINS=Object.freeze({
  "Controlador offline Windows": ".github/workflows/contaos-auditoria-controller.yml",
  "P0-ABS Adversarial V2 executavel": ".github/workflows/contaos-auditoria-controller.yml",
  "ContaOS Frontend Zero-Drift": ".github/workflows/contaos-frontend-zero-drift.yml",
  "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente": ".github/workflows/contaos-frontend-zero-drift.yml",
  "ContaOS P0-NR-001 Integridade e Provas": ".github/workflows/p0-nr001-anti-recurrence.yml",
  "protect-types": ".github/workflows/lock-types-double-barrier.yml",
});
// Real GitHub Actions job->run->attempt chain. No arbitrary workflow may
// impersonate a required check simply by selecting the same job NAME.
export function verifyPrecertRunOrigin({check,job,run,attemptJobs,head,base,workflow}={}) {
  const m=typeof check?.details_url==="string"?
    /^https:\/\/github[.]com\/contaos999999\/contaos-hml-control\/actions\/runs\/([1-9][0-9]*)\/job\/([1-9][0-9]*)$/.exec(check.details_url):null;
  return !!m && check.name && PRECERT_WORKFLOW_ORIGINS[check.name]===workflow &&
    check.head_sha===head && check.app?.id===PRECERT_ISSUER &&
    Number(m[1])===run?.id && Number(m[2])===check.id &&
    job?.id===check.id && job?.run_id===run.id && job?.head_sha===head &&
    job?.name===check.name && job?.status==="completed" && job?.conclusion==="success" &&
    run.head_sha===head && run.head_branch==="build/p0-abs-fiscal-universal" &&
    run.path===workflow && ["pull_request","pull_request_review","workflow_dispatch"].includes(run.event) &&
    (run.status==="completed" && run.conclusion==="success" ||
      run.status==="in_progress" && run.conclusion===null) &&
    Number.isSafeInteger(run.run_attempt) && run.run_attempt>0 &&
    (run.event==="workflow_dispatch" ||
      run.pull_requests?.some(x=>x.number===690 && x.head?.sha===head &&
        x.base?.sha===base)) &&
    Array.isArray(attemptJobs?.jobs) &&
    attemptJobs.total_count===attemptJobs.jobs.length &&
    attemptJobs.jobs.some(x=>x.id===job.id && x.run_id===run.id &&
      x.name===check.name && x.head_sha===head &&
      x.status==="completed" && x.conclusion==="success");
}
export function classifyPrecertReadiness(checkRuns,name,head){
  // GitHub may queue a workflow without creating its check_run yet.
  // Absent is pending, but an ambiguous/forged published check is terminal.
  if(!Array.isArray(checkRuns))
    return {state:"TERMINAL",name,reason:"API checks indisponivel"};
  const matching=checkRuns.filter(x=>x?.name===name);
  if(matching.length===0)
    return {state:"PENDING",name,reason:"workflow enfileirado, check ainda nao publicado"};
  const selected=latestPrecertCheck(checkRuns,name,head);
  if(!selected)return {state:"TERMINAL",name,reason:"origem/check publicado ambiguo"};
  if(["queued","waiting","pending","requested","in_progress"].includes(selected.status))
    return {state:"PENDING",name,reason:"check ainda em execucao"};
  if(selected.status==="completed" && selected.conclusion==="success")
    return {state:"READY",name,check:selected};
  return {state:"TERMINAL",name,reason:"check terminal "+selected.status+"/"+selected.conclusion};
}
export async function downloadPrecertArtifactDigest(id,token){
  if(!Number.isSafeInteger(id)||id<=0||!token)
    throw Error("ZIP: artifact ID/token invalidos");
  // GitHub REST redirects to signed storage. Never log signed URL or token.
  const url="https://api.github.com/repos/"+REPO+"/actions/artifacts/"+id+"/zip";
  const res=await fetch(url,{headers:{
    Authorization:"Bearer "+token,Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2022-11-28","User-Agent":"ContaOS-P0-FullAudit",
  },signal:AbortSignal.timeout(90000)});
  if(!res.ok||!res.body)throw Error("ZIP: download indisponivel HTTP "+res.status);
  const hasher=createHash("sha256");let total=0;
  for await(const chunk of res.body){
    total+=chunk.length;
    if(total>100*1024*1024)throw Error("ZIP: limite seguro de bytes excedido");
    hasher.update(chunk);
  }
  if(total<100)throw Error("ZIP: bytes insuficientes");
  return {digest:"sha256:"+hasher.digest("hex"),bytes:total};
}


const PROTOCOL_FULL_AUDIT_FILES=Object.freeze({
  python:"scripts/auditoria/test_mission_supervisor.py",
  rca:"scripts/p0-rca-impact-gate.test.mjs",
  queue:"scripts/ci/merge-group-context.test.mjs",
});
const FULL_PROTOCOL_CASES=[
  ...Array.from({length:17},(_,i)=>({id:"N"+String(i+1).padStart(2,"0"),
    file:"python",pattern:"test_N"+String(i+1).padStart(2,"0")+"_"})),
  {id:"NR-005-IDENTITY",file:"rca",pattern:"NR-005 manifesto"},
  {id:"NR-005-RENAME",file:"rca",pattern:"NR-005 renomeação"},
  {id:"NR-005-MODE",file:"rca",pattern:"NR-005 chmod"},
  {id:"NR-005-SCHEMA",file:"rca",pattern:"NR-005 schema"},
  {id:"NR-006-VETO",file:"rca",pattern:"P0 V2 RED NR-006: COMMENTED"},
  {id:"NR-006-RETRY",file:"rca",pattern:"P0 NR-006 RED: most recent failed"},
  {id:"NR-006-ARTIFACT",file:"rca",pattern:"P0 NR-006: visual ZIP"},
  {id:"NR-009-BASE",file:"python",pattern:"test_NR009_live_older_target_base"},
  {id:"WDG-01-ORIGIN",file:"python",pattern:"test_N03_changed_contract_source"},
  {id:"WDG-02-PROGRESS",file:"python",pattern:"test_watchdog_stalled_ci_blocks"},
  {id:"WDG-03-TERMINAL",file:"python",pattern:"test_N10_unverified_json_receipt"},
  {id:"WDG-04-CHECKS",file:"python",pattern:"test_N04_duplicate_name"},
  {id:"WDG-05-PROVENANCE",file:"python",pattern:"test_N13_wrong_check_integration"},
  {id:"WDG-06-READBACK",file:"python",pattern:"test_watchdog_rejects_merge_state_changed"},
  {id:"WDG-07-REST",file:"rca",pattern:"P0 V2 API rate 403"},
  {id:"QUEUE-N13-REAL-GIT",file:"queue",pattern:"N13 prova git real"},
  {id:"QUEUE-N13-LIVE",file:"queue",pattern:"N13 real resolver rejects removed queue ref"},
  {id:"QUEUE-N05-BASE",file:"queue",pattern:"N05 base avançada"},
  {id:"QUEUE-N17-REVOCATION",file:"python",pattern:"test_N17_revoked_specific_authorization"},
  {id:"PR-CHECK-VETO",file:"rca",pattern:"P0 V2 formal independent review veto"},
  {id:"PR-CHECK-READBACK",file:"rca",pattern:"P0 V2 RED NR-006: draft flipping"},
  {id:"PR-CHECK-ARTIFACT",file:"rca",pattern:"P0 V2 RED: stale ZIP"},
  {id:"PR-CHECK-RED-CAUSAL",file:"rca",pattern:"P0 V2 CAUSAL_RED artifact_attempt"},
  ...Array.from({length:10},(_,i)=>({id:"V2-LAYER-"+String(i+1).padStart(2,"0"),
    file:"rca",pattern:"P0 V2 LAYER "+String(i+1).padStart(2,"0")+":"})),
  ...["security","provenance","concurrency","lifecycle","state_machine",
    "integration","resilience","governance","supply_chain",
    "legitimate_regression","observability","operational_environment"]
    .map(n=>({id:"V2-LENS-"+n,file:"rca",pattern:"P0 V2 LENS "+n+":"})),
];
// Every authorization invariant must have an EXECUTED test witness, not
// a source-code string or merely a test declaration.
const FULL_PROTOCOL_CRITICAL_TESTS=[
  {id:"AUTH-CHECK-WORKFLOW-RUN-ATTEMPT",file:"rca",pattern:"P0 FULL_PROTOCOL origin:"},
  {id:"AUTH-ZIP-BYTES",file:"rca",pattern:"P0 FULL_PROTOCOL ZIP mismatch"},
  {id:"AUTH-FAILURE-TERMINAL",file:"rca",pattern:"P0 FULL_PROTOCOL terminal checks"},
  {id:"AUTH-FINAL-POST-ZIP-READBACK",file:"rca",pattern:"P0 FULL_PROTOCOL late veto after ZIP"},
  {id:"AUTH-MANIFEST-IMMUTABLE",file:"rca",pattern:"NR-005 manifesto imutável"},
  {id:"AUTH-NATIVE-VETO",file:"rca",pattern:"P0 V2 formal independent review veto"},
  {id:"AUTH-PR-IDENTITY",file:"rca",pattern:"P0 PRE-AUDIT #690 sem associação autenticada"},
  {id:"AUTH-NO-ACTIVATION",file:"rca",pattern:"P0 FULL_PROTOCOL matrix is fail-closed"},
  {id:"AUTH-FULL-DIFF-MODE",file:"rca",pattern:"NR-005 chmod"},
  {id:"AUTH-READONLY-PERMISSIONS",file:"rca",pattern:"P0 FULL_PROTOCOL controller read-only permissions"},
  {id:"AUTH-NO-SELF-CERTIFY",file:"python",pattern:"test_N06_code_without_independent_audit"},
  {id:"AUTH-ZIP-TOCTOU",file:"rca",pattern:"P0 FULL_PROTOCOL late veto after ZIP"},
  {id:"AUTH-ORIGIN-FOREIGN-WORKFLOW",file:"rca",pattern:"P0 FULL_PROTOCOL origin:"},
  {id:"AUTH-CI-PENDING-TERMINAL",file:"rca",pattern:"P0 FULL_PROTOCOL terminal checks"},
];
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_CRITICAL_TESTS);

// The protected PLAN #689 is normative, not merely a hash of arbitrary bytes.
// Its ten numbered mission rules each require their own executed BUILD witness.
// Rules concerning actual privileged enforcement remain future external NO-GO.
const FULL_PROTOCOL_PLAN_CORE_RULES=Object.freeze([
  ["01","python","test_N03_changed_contract_source_rejected"],
  ["02","rca","P0 FULL_PROTOCOL matrix is fail-closed for absent N17"],
  ["03","python","test_N01_active_cannot_certify_from_reports"],
  ["04","python","test_N09_simultaneous_lease_conflict_rejected"],
  ["05","rca","P0 META_PROTOCOL auditor-only hosted runner and no visual source drift"],
  ["06","python","test_N01_certified_without_real_receipts_is_rejected"],
  ["07","python","test_watchdog_stalled_ci_blocks"],
  ["08","python","test_N08_retry_without_delta_rejected"],
  ["09","python","test_N06_author_cannot_review_own_work"],
  ["10","python","test_N11_missing_tool_blocked"],
]);
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_PLAN_CORE_RULES.map(([number,file,pattern])=>({
  id:"PLAN-S3-RULE-"+number,file,pattern
})));
// Section 3.1 of the protected PLAN is about future privileged activation.
// These tests show rejection in the unprivileged BUILD. They MUST NOT be
// reported as evidence that any GitHub App, queue or owner authorization ran.
const FULL_PROTOCOL_PLAN_ACTIVATION_NEGATIVES=Object.freeze([
  ["PLAN-S3.1-APP-IDENTITY","python","test_N13_wrong_check_integration_rejected"],
  ["PLAN-S3.1-QUEUE","queue","N13 entrada QUEUED nao prova grupo ativo"],
  ["PLAN-S3.1-STATUS-API","python","test_N13_foreign_status_publisher_rejected"],
  ["PLAN-S3.1-GROUP-AUTH","queue","N13 real resolver rejects removed queue ref"],
  ["PLAN-S3.1-OWNER-REVIEW","python","test_N17_approved_review_does_not_replace_authorization"],
  ["PLAN-S3.1-LIVE-TRIAL","python","test_N16_no_real_group_status_rejected"],
  ["PLAN-S3.1-ADMIN-AUTH","python","test_activation_cannot_be_enabled_by_candidate"],
]);
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_PLAN_ACTIVATION_NEGATIVES.map(([id,file,pattern])=>({
  id,file,pattern
})));
const FULL_PROTOCOL_51_GATES=[
  ["NR-005 / documentos comuns","rca","NR-005 checkpoint documental em PR posterior"],
  ["NR-005 / BUILD válido","rca","P0 PRE-AUDIT PR head/base avançada"],
  ["NR-005 / falsificações","rca","NR-005 manifesto de outra PR"],
  ["NR-009 / base avançada","python","test_NR009_live_older_target_base"],
  ["Node 24 / testes","rca","P0 RCA runner executa caso exato"],
  ["Segurança runner / N06","rca","P0 META_PROTOCOL every active workflow excludes self-hosted auditor execution"],
  ["Segurança Actions","rca","P0 FULL_PROTOCOL watchdog read-only permissions"],
  ["WDG-01 / origem","python","test_watchdog_readonly_collects_target_and_dependency"],
  ["WDG-02 / progresso","python","test_watchdog_stalled_ci_blocks"],
  ["WDG-03 / fail-closed","python","test_cli_blocked_diagnostic_never_signals_ci_pass"],
  ["N01-N17","python","test_N01_to_N17_all_negative_states_keep_mission_uncertified"],
  ["N13 / fila","queue","N13 prova git real"],
  ["Regressão global","rca","P0 FULL_PROTOCOL global checks bound to exact HEAD"],
  ["Evidências","rca","P0 FULL_PROTOCOL ZIP mismatch and missing ZIP cannot certify"],
  ["Revisão independente","python","test_N06_author_cannot_review_own_work"],
  ["NR-005 / manutenção posterior","rca","NR-005 manutenção autorizada de workflow"],
  ["NR-005 / modos Git","rca","NR-005 chmod"],
  ["NR-005 / schema","rca","NR-005 schema"],
  ["WDG-04 / checks obrigatórios","python","test_watchdog_only_protect_types_cannot_claim_ready"],
  ["WDG-05 / proveniência","python","test_watchdog_partial_pagination_even_below_100"],
  ["WDG-06 / estados terminais","python","test_watchdog_forged_certified_contract"],
  ["WDG-07 / permissão REST","rca","P0 FULL_PROTOCOL watchdog read-only permissions"],
];
// A composite normative row does not imply seven negatives merely because
// one test is green. Map each anti-bypass scenario to a distinct executed case.
const FULL_PROTOCOL_51_FALSIFICATION_SUBCASES=[
  ["PR_ERRADA","NR-005 manifesto de outra PR nao pode autorizar #690"],
  ["ASSOCIACAO_AUSENTE","P0 PRE-AUDIT #690 sem associação autenticada: FAIL"],
  ["SQUASH","P0 PRE-AUDIT #690 via squash de um pai: FAIL"],
  ["DOCUMENTO_EXTRA","NR-005 documento extra com codigo permitido nao pode passar"],
  ["SCRIPT_EXTRA","NR-005 script adicional fora dos 14 caminhos sempre falha"],
  ["RENOMEACAO","NR-005 caminho de origem de renomeacao tambem exige allowlist"],
  ["MODO_GIT","NR-005 chmod 100644 para 100755 é FAIL"],
];
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_51_FALSIFICATION_SUBCASES.map(([id,pattern])=>({
  id:"S5.1:NR-005-FALSIFICACAO:"+id,file:"rca",pattern
})));
// Explicit constituent proofs for WDG-02. The stall and inactivity
// thresholds are evaluated on both sides of 7200 s / 86400 s, not by title.
const FULL_PROTOCOL_WDG02_SUBCASES=[
  ["FALHA_CI","test_watchdog_failure_ci_blocks"],
  ["CHECKS_AUSENTES","test_watchdog_missing_checks_not_pass"],
  ["STALL_EXATO_2H","test_watchdog_stall_exact_two_hour_boundary"],
  ["INATIVIDADE_EXATA_24H","test_watchdog_inactivity_exact_24_hour_boundary"],
  ["DIAGNOSTICO_SEM_AUTORIDADE","test_watchdog_valid_diagnosis_never_certifies"],
];
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_WDG02_SUBCASES.map(([id,pattern])=>({
  id:"S5.1:WDG02-PROGRESSO:"+id,file:"python",pattern
})));
const FULL_PROTOCOL_52_RULES=[
  ["Pré-integração NR-005","rca","NR-005 pull_request bloqueia manifesto"],
  ["Fila NR-009/N13","queue","N13 removed merge queue entry during readback"],
  ["Origem N04/N13","python","test_watchdog_all_three_same_name_wrong_app"],
  ["Ciclo de vida","python","test_watchdog_closed_without_merge_never_prompts_review"],
  ["Revalidação no encerramento do job","queue","N13 protected workflows recheck group"],
  ["Regressão obrigatória","rca","P0 FULL_PROTOCOL suite output cannot be accepted"],
];
FULL_PROTOCOL_CASES.push(
  ...FULL_PROTOCOL_51_GATES.map(([name,file,pattern])=>({
    id:"S5.1:"+name,file,pattern})),
  ...FULL_PROTOCOL_52_RULES.map(([name,file,pattern])=>({
    id:"S5.2:"+name,file,pattern})),
);


const FULL_PROTOCOL_53_RULES=[
  ["Ordem obrigatória","rca","P0 adversarial GitHub live verified snapshot"],
  ["Matriz do parecer","rca","P0 PA incomplete criteria"],
  ["Parecer formal e vínculo","rca","P0 PA altered report cannot pass SHA256"],
  ["Gate executável de liberação","rca","P0 adversarial new CHANGES_REQUESTED"],
  ["Ciclo de correção","rca","P0 V2 NR-006: case-specific RED"],
  ["Critério de congelamento","rca","P0 V2 probe evidence is authenticated"],
  ["Fronteira administrativa","python","test_N17_revoked_specific_authorization"],
];
const FULL_PROTOCOL_54_STEPS=[
  ["Inventário inicial","rca","P0 V2 LAYER 01:"],
  ["RED reproduzível","rca","P0 V2 LAYER 05:"],
  ["Correção causal","rca","P0 V2 LAYER 06:"],
  ["GREEN e negativos adversariais","rca","P0 V2 LAYER 06:"],
  ["Segunda leitura do diff 14/14","rca","P0 V2 LAYER 08:"],
  ["Repetição","rca","P0 V2 probe evidence is authenticated"],
  ["Liberação","rca","P0 adversarial GitHub live verified snapshot"],
];
const FULL_PROTOCOL_54_RULES=[
  ["Prova RED adicional após o parecer externo de 21/11","python","test_v2_causal_watchdog_historical_red_then_green"],
  ["Limitações não dispensáveis","rca","P0 V2 LENS operational_environment:"],
];
const FULL_PROTOCOL_56_RULES=[
  ["Regra de interpretação","rca","P0 META_PROTOCOL exhaustive cross-clause seven-dimensional authorization model"],
  ["V1 versus V2 do recibo","rca","P0 PA positive: recorded assistant PASS"],
  ["Cinco checks versus sete contextos de CI","rca","P0 META_PROTOCOL six predecessor checks plus own gate no cycle"],
  ["Checks duplicados e reexecuções legítimas","rca","P0 NR-006 RED: COMMENTED starts second"],
  ["Estado operacional, certificação e ativação","python","test_activation_cannot_be_enabled_by_candidate"],
  ["Prova semântica por cláusula","rca","P0 META_PROTOCOL root obligations must reject"],
  ["Estados de transporte versus veredito normativo","rca","P0 META_PROTOCOL audit verdict transport separation"],
  ["Precedência","rca","P0 META_PROTOCOL exhaustive cross-clause seven-dimensional authorization model"],
];
const FULL_PROTOCOL_55_RULES=[
  ["Autoridade e limites","python","test_N06_code_without_independent_audit"],
  ["Dez camadas, sempre na ordem","rca","P0 V2 LAYER 10:"],
  ["Doze perspectivas obrigatórias","rca","P0 V2 LENS operational_environment:"],
  ["Casos RED obrigatórios do parecer de 21/11","rca","P0 V2 CAUSAL_RED artifact_attempt"],
  ["NR-006, repetição legítima dos checks no mesmo HEAD","rca","P0 NR-006 RED: COMMENTED starts second"],
  ["NR-006, RED causal por cenário (obrigatório)","rca","P0 V2 NR-006: case-specific RED"],
  ["NR-006/NR-009, decisões e revalidação","rca","P0 V2 RED NR-006: COMMENTED"],
  ["Vigência e consumo","rca","P0 V2 live consumer dispatch"],
  ["Classes de ataques não cobertas apenas por testes existentes","rca","P0 NR-006 fail-closed: duplicate"],
  ["Quatro resultados somente","rca","P0 V2 negative: no auto PASS"],
  ["Não habilitar","python","test_activation_cannot_be_enabled_by_candidate"],
];
FULL_PROTOCOL_CASES.push(...[
  ["S5.3:",FULL_PROTOCOL_53_RULES],
  ["S5.4-STEP:",FULL_PROTOCOL_54_STEPS],
  ["S5.4-RULE:",FULL_PROTOCOL_54_RULES],
  ["S5.5:",FULL_PROTOCOL_55_RULES],
  ["S5.6:",FULL_PROTOCOL_56_RULES],
].flatMap(([prefix,list])=>list.map(([name,file,pattern])=>({
  id:prefix+name,file,pattern}))));


// Blind protocol paragraph audit, complementary to §5.1–§5.5 heading/row
// inventory. A new or changed rule invalidates the frozen Git blob below,
// even when all existing names and tests remain green.
const FULL_PROTOCOL_GIT_BLOB="25801fdbeb0efef78600961fb394b33c8747f01a";
const FULL_PROTOCOL_REVIEWED_SUITE_BLOBS=Object.freeze({
  python:"27235effb053fc01fbf30472dbe2075a6abfe1e8",
  rca:"ca3d0f2b532c490d6beb36a4cc0e8e84e182ef7a",
  queue:"534cb078de0abf63b8c5235724332333bbda56bd",
});
// A passing name without its reviewed test body does not establish semantic
// equivalence. Updates to any source must be reviewed and deliberately
// rebound in the same candidate PR before the build gate can certify it.

const FULL_PROTOCOL_ROOT_INVARIANTS=[["S1-AUDITOR-ONLY","## 1.","o único perfil de auditoria","rca","P0 META_PROTOCOL auditor-only hosted runner and no visual source drift"],["S1-SUPERVISOR-READONLY","## 1.","não aprova PR, não publica status e não executa merge","rca","P0 META_PROTOCOL auditor-only hosted runner and no visual source drift"],["S1-OWNER-AUTH","## 1.","O titular concede decisões específicas","python","test_N17_revoked_specific_authorization"],["S1-AUTHORIZED-BRANCH","## 1.","O implementador altera apenas a branch autorizada","rca","P0 PRE-AUDIT #690 sem associação autenticada"],["S1-REVIEW-SEGREGATION","## 1.","conta revisora elegível, diferente da autora","python","test_N06_author_cannot_review_own_work"],["S1-NO-APP-SETUP","## 1.","Nenhum componente deste BUILD habilita","python","test_activation_cannot_be_enabled_by_candidate"],["S2-CONTRACT-SOURCE","## 2.","A versão integrada na `main` protegida é a autoridade","python","test_N03_changed_contract_source_rejected"],["S2-NO-CANDIDATE","## 2.","É proibido aceitar versão modificada no candidato","python","test_N03_different_contract_blob_rejected"],["S2-ACTIVE","## 2.","`ACTIVE`: missão não certificada","python","test_N01_active_cannot_certify_from_reports"],["S2-BLOCKED-EXTERNAL","## 2.","`BLOCKED_EXTERNAL`: dependência verificável","python","test_N11_missing_tool_blocked"],["S2-CANCEL-OWNER","## 2.","`CANCELLED_BY_OWNER`: somente decisão identificável do titular","python","test_N10_cancel_without_owner_not_success"],["S2-CERTIFIED-TWO-STAGE","## 2.","`CERTIFIED`: exige provas técnicas e administrativas","python","test_N01_certified_without_real_receipts_is_rejected"],["S2-ACTIVATION-NOGO","## 2.","`NO-GO` de ativação: independente do estado operacional","python","test_activation_cannot_be_enabled_by_candidate"],["S2-PROTECTED-BLOB","## 2.","vincula o blob protegido do PLAN #689","python","test_watchdog_source_is_not_trusted_when_only_offline_json_was_used"],["S2-OFFLINE-EXIT-2","## 2.","sempre retorna exit code `2`","python","test_cli_blocked_diagnostic_never_signals_ci_pass"],["S2-WATCHDOG-READONLY","## 2.","sem publicar status de autorização","python","test_watchdog_valid_diagnosis_never_certifies"],["S3-N17C-THIRD-AUTHOR","## 3.","autoria terceira autorizada","python","test_N17_second_approval_not_proxy_for_revoked_auth"],["S3-N17C-TWO-APPROVALS","## 3.","as duas contas `contaos9999` e `Edivan5002`","python","test_N17_approved_review_does_not_replace_authorization"],["S3-N17C-EXTERNAL","## 3.","`N17(c)=BLOCKED_EXTERNAL`","python","test_N17_revoked_specific_authorization_cannot_pass"],["S4-APP-ONLY","## 4.","somente** por App dedicado","python","test_N13_wrong_check_integration_rejected"],["S4-ENTRY-SHA-BASE","## 4.","A avaliação de entrada da PR requer SHA efetivo","queue","N13 positive: PR única autenticada"],["S4-GROUP-REVALIDATE","## 4.","Um novo sucesso separado no SHA do `merge_group`","queue","N13 real resolver rejects removed queue ref"],["S4-NO-APP-ACTIVATION","## 4.","não cria nem ativa** esse App","python","test_activation_cannot_be_enabled_by_candidate"],["S4-NO-FAKE-STATUS","## 4.","jamais checks válidos para alterar proteção","python","test_N16_no_real_group_status_rejected"],["S5-EVENT-MATRIX","## 5.","`pull_request`, `push` e `merge_group`","rca","NR-005 pull_request bloqueia manifesto"],["S5-FULL-DIFF","## 5.","regra `full_diff`","rca","NR-005 full_diff do BUILD"],["S5-PUSH-IDENTITY","## 5.","verificação de auth da PR no push","rca","P0 PRE-AUDIT push da #690"],["S5-PREVIOUS-BASE","## 5.","base anterior ao diff","rca","P0 PRE-AUDIT manifesto ausente no base"],["S5-QUEUE-SINGLE-PR","## 5.","entrada única da fila","queue","N13 positive: PR única autenticada"],["S5-REVOCATION","## 5.","revogação de autorização mesmo após `success`","python","test_N17_revoked_specific_authorization_cannot_pass"],["S5-NO-WEAK-PROVIDER","## 5.","não suportar prova atômica suficientemente segura","python","test_N17_approved_review_does_not_replace_authorization"],["S5-ADMIN-AUTH","## 5.","autorização separada do titular","python","test_activation_cannot_be_enabled_by_candidate"],["S5-RULESET-READBACK","## 5.","readback de enforcement em main","python","test_watchdog_main_authenticated_get_readback_never_certifies"],["S6-IMPLEMENTATION-DIAG-ONLY","## 6.","código de diagnóstico, testes offline","python","test_watchdog_valid_diagnosis_never_certifies"],["S6-NO-APP-SOURCE","## 6.","não editar `src/`, `public/`, backend","rca","NR-005 full_diff do BUILD"],["S6-ALLOWLIST-EMEND","## 6.","solicitar emenda de allowlist","rca","NR-005 documento extra"],["S6-QUEUE-FAIL-NOGO","## 6.","check privilegiado desabilitado","python","test_N16_no_real_group_status_rejected"],["S6-CHECKPOINT-POST-MERGE","## 6.","Após merge protegido e readback","python","test_watchdog_merged_pr_requires_readback_not_new_review"],["S6-ZERODRIFT-NO-VISUAL","## 6.","identidade visual N/A","rca","P0 META_PROTOCOL auditor-only hosted runner and no visual source drift"]];
FULL_PROTOCOL_CASES.push(...FULL_PROTOCOL_ROOT_INVARIANTS.map(([id,, ,file,pattern])=>({id,file,pattern})));
function gitBlobId(content){
  const bytes=Buffer.from(content,"utf8");
  const header=Buffer.from("blob "+bytes.length+"\0","utf8");
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

// Normative BUILD tests prove NO-GO behavior for future activation, not
// that a dedicated App, live merge queue or third-party N17(c) ran.
const INDEPENDENT_AUDIT_ONLY_IDS=new Set(["S5.1:Revisão independente",
  "PLAN-S3-RULE-05","PLAN-S3-RULE-06"]);
const ACTIVATION_ONLY_PROTOCOL_IDS=new Set([
  "S3-N17C-THIRD-AUTHOR","S3-N17C-TWO-APPROVALS","S3-N17C-EXTERNAL",
  "S4-APP-ONLY","S4-ENTRY-SHA-BASE","S4-GROUP-REVALIDATE",
  "S5-QUEUE-SINGLE-PR","S5-REVOCATION","S5-NO-WEAK-PROVIDER",
  "S5-ADMIN-AUTH","S5-RULESET-READBACK",
  "PLAN-S3-RULE-02","PLAN-S3-RULE-04","PLAN-S3-RULE-09",
  ...FULL_PROTOCOL_PLAN_ACTIVATION_NEGATIVES.map(([id])=>id),
]);

const FULL_PROTOCOL_EXTERNAL=[
  "N17(c): autoria terceira e duas aprovacoes elegiveis em fila real",
  "HML: sessao autenticada e isolamento RLS/tenant",
  "App dedicado: identidade privilegiada, autorizacao e revogacao",
  "PROD: autorizacao titular, ruleset e readback integrado",
];
export function auditFullProtocolCoverage({protocol,tests,mission,workflow,
    source,manifest,paths}={}){
  const issues=[];
  const rows=[];
  for(const [suite,expectedBlob] of Object.entries(FULL_PROTOCOL_REVIEWED_SUITE_BLOBS)){
    if(typeof tests?.[suite]!=="string" || gitBlobId(tests[suite])!==expectedBlob)
      issues.push("SEMANTIC_SOURCE_BLOB: reviewed assertions changed or missing: "+suite);
  }
  if(typeof protocol!=="string" || gitBlobId(protocol)!==FULL_PROTOCOL_GIT_BLOB)
    issues.push("META_PROTOCOL: hash do protocolo integral divergente; nova obrigacao exige remapeamento cego");
  for(const [id,from,clause] of FULL_PROTOCOL_ROOT_INVARIANTS){
    const tail=protocol?.split(from)[1]||"";
    const body=tail.split(/\n## [0-9]/)[0];
    if(!body.includes(clause))
      issues.push("META_PROTOCOL: obrigacao raiz ausente/divergente "+id);
  }
  const expectedSections=["## 1.","## 2.","## 3.","## 4.","## 5.",
    "## 5.1.","## 5.2.","## 5.3.","## 5.4.","## 5.5.","## 5.6.","## 5.7.","## 5.8.","## 6."];
  // Fail closed when the protected protocol grows without a corresponding
  // executable authorization requirement. A summary checkbox is insufficient.
  const section51=typeof protocol==="string"?
    protocol.split("## 5.1.")[1]?.split("## 5.2.")[0]:"";
  const gates=[...section51.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)]
    .map(m=>m[1].trim()).filter(x=>x!=="Gate" && x!=="---");
  const declaredGates=FULL_PROTOCOL_51_GATES.map(x=>x[0]);
  if(gates.length!==declaredGates.length ||
      new Set(gates).size!==gates.length ||
      gates.some(x=>!declaredGates.includes(x)) ||
      declaredGates.some(x=>!gates.includes(x)))
    issues.push("Secao 5.1 tem requisito sem testemunha executavel ou gate retirado");
  const section52=typeof protocol==="string"?
    protocol.split("## 5.2.")[1]?.split("## 5.3.")[0]:"";
  const rules=[...section52.matchAll(/^\*\*([^*]+?):\*\*/gm)]
    .map(m=>m[1].trim());
  const declaredRules=FULL_PROTOCOL_52_RULES.map(x=>x[0]);
  if(rules.length!==declaredRules.length ||
      rules.some(x=>!declaredRules.includes(x)) ||
      declaredRules.some(x=>!rules.includes(x)))
    issues.push("Secao 5.2 tem regra sem testemunha executavel ou regra retirada");

  const sectionRules=[
    ["## 5.3.","## 5.4.",FULL_PROTOCOL_53_RULES,/^\*\*([^*]+?):\*\*/gm],
    ["## 5.4.","## 5.5.",FULL_PROTOCOL_54_STEPS,/^\d+\. \*\*([^*]+?):\*\*/gm],
    ["## 5.4.","## 5.5.",FULL_PROTOCOL_54_RULES,/^\*\*([^*]+?):\*\*/gm],
    ["## 5.5.","## 5.6.",FULL_PROTOCOL_55_RULES,/^\*\*([^*]+?):\*\*/gm],
    ["## 5.6.","## 5.7.",FULL_PROTOCOL_56_RULES,/^\*\*([^*]+?):\*\*/gm],
  ];
  for(const [from,to,inventory,re] of sectionRules){
    const part=typeof protocol==="string"?protocol.split(from)[1]?.split(to)[0]:"";
    const observed=[...part.matchAll(re)].map(m=>m[1].trim());
    const declared=inventory.map(x=>x[0]);
    if(observed.length!==declared.length ||
        new Set(observed).size!==observed.length ||
        observed.some(x=>!declared.includes(x)) ||
        declared.some(x=>!observed.includes(x)))
      issues.push("Requisito sem testemunha em "+from+" / "+inventory.length+" declarados");
  }
  for(const section of expectedSections)
    if(!protocol?.includes(section))issues.push("Secao do protocolo ausente: "+section);
  for(const item of FULL_PROTOCOL_CASES){
    const code=tests?.[item.file];
    // Search only declared test names, never arbitrary mentions in comments.
    const names=typeof code==="string"?
      [...code.matchAll(/(?:test\(["']([^"'\n]+)|def (test_[A-Za-z0-9_]+)\()/g)]
        .map(m=>m[1]||m[2]):[];
    const ok=names.some(name=>name.includes(item.pattern));
    rows.push({id:item.id,status:ok?"TEST_DECLARED_NOT_EXECUTED":"MISSING_TEST",
      scope:ACTIVATION_ONLY_PROTOCOL_IDS.has(item.id)?
        "BUILD_NEGATIVE_PROOF_ACTIVATION_EXTERNAL":
        INDEPENDENT_AUDIT_ONLY_IDS.has(item.id)?
          "BUILD_NEGATIVE_PROOF_INDEPENDENT_AUDIT_EXTERNAL":"BUILD",
      source:PROTOCOL_FULL_AUDIT_FILES[item.file],witness:item.pattern});
    if(!ok)issues.push("Protocolo sem caso executavel: "+item.id+" / "+item.pattern);
  }
  if(new Set(FULL_PROTOCOL_CASES.map(x=>x.id)).size!==FULL_PROTOCOL_CASES.length)
    issues.push("IDs de matriz repetidos");
  const critical=[
    ["CHECK_WORKFLOW_RUN_ATTEMPT",source?.includes("verifyPrecertRunOrigin")],
    ["ZIP_REAL_BYTES",source?.includes("downloadPrecertArtifactDigest")],
    ["FAILURE_TERMINAL",source?.includes("classifyPrecertReadiness")],
    ["FINAL_LIVE_READBACK",source?.includes("latestChecks")&&
      source?.includes("latestReviews")&&source?.includes("latestArtifact")],
    ["IMMUTABLE_MANIFEST",source?.includes("assertImmutableP0Governance")],
    ["REVIEW_VETO",source?.includes("CHANGES_REQUESTED")],
    ["PR_ORIGIN_AUTH",source?.includes("resolvePrContext")],
    ["ACTIVATION_DISABLED",mission?.activation_authorized===false &&
      manifest?.ativacao_autorizada===false],
    ["MANDATED_FULL_DIFF",manifest?.full_diff===true &&
      Array.isArray(paths)&&paths.length===14 &&
      new Set(paths).size===14 &&
      manifest.files?.length===14&&
      paths.every(x=>manifest.files.includes(x))],
    ["CONTROLLER_READ_ONLY",workflow?.includes("pull-requests: read") &&
      workflow?.includes("actions: read") && !/pull-requests:\s*write/.test(workflow)],
    ["NO_SELF_CERTIFICATION",protocol?.includes("não substitui") &&
      protocol?.includes("pré-certificação interna")],
  ];
  for(const [id,ok] of critical){
    rows.push({id,status:ok?"STRUCTURAL_WITNESS":"MISSING_WITNESS"});
    if(!ok)issues.push("Controle critico sem testemunha: "+id);
  }
  if(!protocol?.includes("BLOCKED_EXTERNAL")||
      !protocol.includes("N17(c)"))
    issues.push("Fronteiras externas e N17(c) ausentes do protocolo");
  return {schema:"contaos.full-protocol-preaudit.v1",
    verdict:issues.length?"CHANGES_REQUESTED":"COVERAGE_MAPPED_NOT_EXECUTED",
    requirements:rows.length,covered:rows.filter(x=>!x.status.startsWith("MISSING")).length,
    rows,external:FULL_PROTOCOL_EXTERNAL.map(x=>({requirement:x,status:"BLOCKED_EXTERNAL_FOR_ACTIVATION"})),
    issues};
}
// Full execution happens in an isolated subprocess with credentials removed.
// A matching title in source is NEVER an authorization proof.

const FULL_PROTOCOL_STRUCTURAL_TO_EXECUTED=Object.freeze({
  CHECK_WORKFLOW_RUN_ATTEMPT:"AUTH-CHECK-WORKFLOW-RUN-ATTEMPT",
  ZIP_REAL_BYTES:"AUTH-ZIP-BYTES",
  FAILURE_TERMINAL:"AUTH-FAILURE-TERMINAL",
  FINAL_LIVE_READBACK:"AUTH-FINAL-POST-ZIP-READBACK",
  IMMUTABLE_MANIFEST:"AUTH-MANIFEST-IMMUTABLE",
  REVIEW_VETO:"AUTH-NATIVE-VETO",
  PR_ORIGIN_AUTH:"AUTH-PR-IDENTITY",
  ACTIVATION_DISABLED:"AUTH-NO-ACTIVATION",
  MANDATED_FULL_DIFF:"AUTH-FULL-DIFF-MODE",
  CONTROLLER_READ_ONLY:"AUTH-READONLY-PERMISSIONS",
  NO_SELF_CERTIFICATION:"AUTH-NO-SELF-CERTIFY",
});

// Compound clauses must be proven by EVERY constituent, not by one
// executable witness whose title happens to match the final element.
const FULL_PROTOCOL_COMPOUND_WITNESSES=Object.freeze({
  "S5.5:Dez camadas, sempre na ordem":
    Array.from({length:10},(_,i)=>["rca","P0 V2 LAYER "+String(i+1).padStart(2,"0")+":"]),
  "S5.5:Doze perspectivas obrigatórias":
    ADVERSARIAL_V2_LENSES.map(name=>["rca","P0 V2 LENS "+name+":"]),
  "S5-EVENT-MATRIX":[
    ["rca","NR-005 pull_request bloqueia manifesto"],
    ["rca","P0 PRE-AUDIT push da #690"],
    ["queue","N13 protected workflows recheck group"],
  ],
  "S5.1:NR-005 / falsificações":
    FULL_PROTOCOL_51_FALSIFICATION_SUBCASES.map(([,pattern])=>["rca",pattern]),
  "S5.1:WDG-02 / progresso":
    FULL_PROTOCOL_WDG02_SUBCASES.map(([,pattern])=>["python",pattern]),
});
function executedConstituents(suites,requirements){
  if(!requirements) return {complete:true,names:[]};
  const names=[];
  for(const [key,prefix] of requirements){
    const suite=suites?.[key];
    if(suite?.passed!==true || suite?.exitCode!==0 ||
       !Array.isArray(suite.successfulNames))return {complete:false,names};
    const matched=suite.successfulNames.filter(name=>name.startsWith(prefix));
    if(matched.length!==1)return {complete:false,names};
    names.push(key+":"+matched[0]);
  }
  return {complete:true,names};
}
// Separate normative semantic assurance from executable BUILD coverage.
// A seven-field narrative does not establish that any asserted relationship
// is true: independent contradictory review and authenticated provenance are
// separate decisions. Fail closed even when all seven fields are populated.
const SEMANTIC_AXES=Object.freeze([
  "authority","antecedent","outcomes","interactions","live","revocation","boundary"
]);
function nonEmptySemanticValue(value){
  if(typeof value==="string")return value.trim().length>0;
  if(Array.isArray(value))return value.length>0&&value.every(nonEmptySemanticValue);
  if(value&&typeof value==="object"){
    const values=Object.values(value);
    return values.length>0&&values.every(nonEmptySemanticValue);
  }
  return false;
}
// §5.6 positive and negative consequences, source, revocation and
// counterexamples are mandatory subpredicates of their respective axes.
function semanticAxisStructurallyComplete(evidence,axis){
  const value=evidence?.[axis];
  if(!nonEmptySemanticValue(value)||!value||typeof value!=="object"||
      Array.isArray(value))return false;
  const string=x=>typeof x==="string"&&x.trim().length>0;
  switch(axis){
    case "authority":return string(value.actor)&&string(value.source);
    case "antecedent":return string(value.event)&&string(value.source);
    case "outcomes":return ["positive","negative"].every(key=>
      value[key]&&typeof value[key]==="object"&&
      string(value[key].decision)&&string(value[key].source));
    case "interactions":return Array.isArray(value.clauses)&&
      value.clauses.length>0&&value.clauses.every(string)&&
      string(value.counterexample);
    case "live":return string(value.source)&&string(value.url)&&
      /^https:\/\/github[.]com\/contaos999999\/contaos-hml-control\//.test(value.url)&&
      validSha(value.head);
    case "revocation":return string(value.trigger)&&string(value.source);
    case "boundary":return string(value.phase)&&string(value.external);
    default:return false;
  }
}
const CLOSED_PLAN_SEMANTIC_UNITS=Object.freeze([
  ...[
    ["S3",10],["S31",9],["S4",14],["S5",18],["S6",6],
    ["S7",3],["S8",7],["S9",2],["S10",2],
  ].flatMap(([section,count])=>Array.from({length:count},(_,i)=>
    "PLAN-"+section+"-"+String(i+1).padStart(2,"0"))),
  ...Array.from({length:29},(_,i)=>"EMENDA-"+String(i+1).padStart(2,"0")),
  ...Array.from({length:24},(_,i)=>"PLAN-S31-ATOM-A"+String(i+1).padStart(2,"0")),
  ...Array.from({length:7},(_,i)=>"PLAN-S6-RECOVERY-R"+String(i+1).padStart(2,"0")),
  ...["A","B","C","D","E","F"].map(letter=>"EMENDA-N17-"+letter),
]);
if(CLOSED_PLAN_SEMANTIC_UNITS.length!==137 ||
   new Set(CLOSED_PLAN_SEMANTIC_UNITS).size!==137)
  throw Error("SEMANTIC: protected source inventory not unique/complete");

/**
 * Semantic source inventory is a provenance check, NOT an interpretation or PASS.
 * Every meaningful source line is kept, rather than assuming that the 137
 * previously enumerated identifiers exhaust the protected normative texts.
 */
export const PROTECTED_SEMANTIC_SOURCES=Object.freeze({
  "docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md":
    "9d037a37df8ae177f7f02123932e0ca60e7e3f81",
  "docs/frontend/planos/EMENDA_P0_ABS_FILA_REVISAO_690_2026-11-20.md":
    "cba58ceb1f88fa6774ccf1ce1661ac9f5a942c1b",
});
export function inventoryProtectedSemanticLines(sources){
  const issues=[];const rows=[];
  const paths=Object.keys(PROTECTED_SEMANTIC_SOURCES);
  for(const path of paths){
    const data=sources?.[path];
    if(!data||typeof data.content!=="string"){
      issues.push("SEMANTIC_SOURCE_MISSING: "+path);continue;
    }
    const bytes=Buffer.from(data.content,"utf8");
    const actualBlob=createHash("sha1").update(
      Buffer.concat([Buffer.from("blob "+bytes.length+"\0"),bytes])).digest("hex");
    if(actualBlob!==PROTECTED_SEMANTIC_SOURCES[path]||
       (data.blob&&data.blob!==actualBlob)){
      issues.push("SEMANTIC_SOURCE_TAMPERED: "+path);continue;
    }
    const lines=data.content.split(/\r?\n/);
    for(let n=0;n<lines.length;n++){
      const value=lines[n].trim();
      if(!value||/^#{1,6}\s/.test(value)||/^[-|: ]+$/.test(value)||
          /^\`{3}/.test(value))continue;
      // Keep descriptive and table rows too: never silently discard a rule
      // merely because it was expressed in prose rather than 'deve'.
      rows.push({id:"SRC-"+createHash("sha256").update(path+"\0"+(n+1)+
          "\0"+lines[n]).digest("hex").slice(0,20),
        path,blob:actualBlob,line:n+1,
        text_sha256:createHash("sha256").update(lines[n]).digest("hex"),
        text:lines[n]});
    }
  }
  if(Object.keys(sources||{}).some(path=>!paths.includes(path)))
    issues.push("SEMANTIC_SOURCE_UNKNOWN");
  return {schema:"contaos.semantic-source-inventory.v1",
    source_blobs:PROTECTED_SEMANTIC_SOURCES,
    lines:rows,source_count:paths.length,issues,
    inventory_verified:issues.length===0,
    semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
}
/** Rejects fabricated, reused, outdated and non-source-bound interpretations. */
export function verifySemanticSourceClaims(inventory,claims){
  const issues=[...(inventory?.issues||[])];
  const rows=inventory?.lines||[];
  const byId=new Map(rows.map(row=>[row.id,row]));
  const seen=new Set();
  if(!inventory?.inventory_verified)issues.push("SEMANTIC_INVENTORY_NOT_VERIFIED");
  for(const claim of claims||[]){
    const row=byId.get(claim?.source_id);
    if(!row){issues.push("SEMANTIC_CLAIM_UNKNOWN_SOURCE");continue;}
    if(seen.has(row.id)){issues.push("SEMANTIC_CLAIM_DUPLICATE: "+row.id);continue;}
    seen.add(row.id);
    if(claim.path!==row.path||claim.blob!==row.blob||
       claim.line!==row.line||claim.text_sha256!==row.text_sha256)
      issues.push("SEMANTIC_CLAIM_WRONG_ANCHOR: "+row.id);
    // This checks explicit source binding, not the truth of seven axes.
    if(!claim.axes||SEMANTIC_AXES.some(axis=>!semanticAxisStructurallyComplete(
        {[axis]:claim.axes[axis]},axis)))
      issues.push("SEMANTIC_CLAIM_UNPROVEN_AXES: "+row.id);
    if(!Array.isArray(claim.negative_witnesses)||
       !claim.negative_witnesses.length||
       claim.negative_witnesses.some(w=>typeof w!=="object"||
         !w.case_id||!w.run_url||!w.head||!validSha(w.head)))
      issues.push("SEMANTIC_CLAIM_NO_EXECUTED_COUNTERPROOF: "+row.id);
    if(claim.independent_review?.verdict!=="APPROVED"||
       !claim.independent_review?.review_id)
      issues.push("SEMANTIC_CLAIM_NO_INDEPENDENT_REVIEW: "+row.id);
  }
  return {schema:"contaos.semantic-source-claims.v1",
    anchored_count:seen.size,source_lines:rows.length,
    unmapped:rows.filter(row=>!seen.has(row.id)).map(row=>row.id),
    issues,verdict:"INCONCLUSIVE",release:"NO_GO",
    note:"Even a structurally complete self-report needs authenticated LIVE counterproof and independent contradiction."};
}


/** Exhaustive seven-axis REVIEW WORKLIST over authenticated source spans.
 * A populated placeholder is never construed as an interpreted rule or proof.
 */

/**
 * Lossless candidate sentence partition: every byte of every protected
 * source span appears exactly once. This is NOT normative atomization:
 * sentences can still contain multiple duties/conditions and require review.
 */
export function inventorySemanticSentenceCandidates(inventory){
  const candidates=[];const issues=[...(inventory?.issues||[])];
  if(!inventory?.inventory_verified)issues.push("SEMANTIC_ATOMS_SOURCE_NOT_VERIFIED");
  for(const row of inventory?.lines||[]){
    const text=row.text;
    if(typeof text!=="string"||!text.length){issues.push("SEMANTIC_ATOM_EMPTY_SOURCE");continue;}
    const boundaries=[];const re=/[.!?]\s+(?=[A-ZÀ-Ú0-9])/g;
    for(const match of text.matchAll(re)){
      if(match.index<4&&/^\s*\d+[.]\s/.test(text))continue;
      boundaries.push(match.index+match[0].length);
    }
    const ends=[...boundaries,text.length];let start=0;const pieces=[];
    for(const end of ends){
      const segment=text.slice(start,end);
      if(!segment){issues.push("SEMANTIC_ATOM_EMPTY_SEGMENT");continue;}
      const id="ATOM-"+createHash("sha256")
        .update(row.id+"\0"+start+"\0"+segment).digest("hex").slice(0,24);
      pieces.push(segment);
      candidates.push({id,source_id:row.id,path:row.path,line:row.line,
        blob:row.blob,start,end,
        text_sha256:createHash("sha256").update(segment).digest("hex"),
        status:"UNREVIEWED",axes_unproven:SEMANTIC_AXES.length});
      start=end;
    }
    if(pieces.join("")!==text||start!==text.length)
      issues.push("SEMANTIC_ATOM_LOSSY_SPLIT: "+row.id);
  }
  const summaryDigest=createHash("sha256")
    .update(candidates.map(x=>x.id+"|"+x.text_sha256).join("\n"))
    .digest("hex");
  if(new Set(candidates.map(x=>x.id)).size!==candidates.length)
    issues.push("SEMANTIC_ATOM_DUPLICATE_ID");
  return {schema:"contaos.semantic-sentence-candidates.v1",
    candidate_count:candidates.length,unreviewed:candidates.length,
    source_span_count:inventory?.lines?.length||0,
    candidates,inventory_sha256:summaryDigest,issues,
    partition_verified:issues.length===0,
    semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
}

export function buildSevenAxisSemanticBacklog(inventory){
  const slots=(inventory?.lines||[]).map(row=>({
    source_id:row.id,path:row.path,blob:row.blob,line:row.line,
    text_sha256:row.text_sha256,
    axes:Object.fromEntries(SEMANTIC_AXES.map(axis=>[axis,{
      status:"UNPROVEN",proof:null,negative_witness:null,
      independent_contradiction:null}])),
    mentioned_rules:[...new Set((row.text.match(/\b(?:N(?:0[1-9]|1[0-7])(?:\([a-f]\))?|NR-00[569]|P0-ABS-00[12])\b/gi)||[]))],
    semantic_status:"INCONCLUSIVE"
  }));
  const pairs=[];
  for(const row of slots){
    for(let i=0;i<row.mentioned_rules.length;i++)
      for(let j=i+1;j<row.mentioned_rules.length;j++)
        pairs.push({source_id:row.source_id,a:row.mentioned_rules[i],
          b:row.mentioned_rules[j],status:"INTERACTION_UNPROVEN"});
  }
  const firstTen=CLOSED_PLAN_SEMANTIC_UNITS.filter(id=>/^PLAN-S3-\d{2}$/.test(id));
  const planPath="docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md";
  const normative_rules=CLOSED_PLAN_SEMANTIC_UNITS.map(id=>{
    const n=firstTen.indexOf(id);
    const anchor=n<0?null:(inventory?.lines||[]).find(row=>
      row.path===planPath&&row.line===23+n&&
      row.text.trim().startsWith((n+1)+". **"));
    return {rule_id:id,source_links:anchor?[anchor.id]:[],
      axes:Object.fromEntries(SEMANTIC_AXES.map(axis=>[axis,"UNPROVEN"])),
      rule_verdict:"INCONCLUSIVE"};
  });

  // These are provisional review locations, not assertions that a numbered
  // paragraph covers all atomic consequences. A candidate link cannot count
  // as source-verified or as evidence of any semantic axis.
  const planSectionLines=Object.freeze({
    S31:[36,37,38,40,41,42,44,45,46],
    S4:[50,52,53,54,55,56,57,58,59,60,61,62,64,66],
    S5:[70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87],
    S6:[93,97,99,100,101,102],
    S7:[106,108,110],
    S8:[115,119,120,121,124,125,126],
    S9:[135,136],S10:[143,144],
  });
  const amendmentPath="docs/frontend/planos/EMENDA_P0_ABS_FILA_REVISAO_690_2026-11-20.md";
  const amendmentLines=[3,9,10,12,16,17,18,22,23,24,25,29,31,33,35,
    37,41,45,47,49,51,53,55,57,61,64,65,66,68];
  const atomLines=[36,37,38,40,41,42,44,45,46];
  const recoveryLines=[97,99,100,101,102];
  for(const record of normative_rules){
    if(record.source_links.length){record.source_link_level="DIRECT_NUMBERED";continue;}
    const id=record.rule_id;
    let path=planPath,lines=null;
    const section=/^PLAN-(S31|S4|S5|S6|S7|S8|S9|S10)-(\d{2})$/.exec(id);
    const amend=/^EMENDA-(\d{2})$/.exec(id);
    const atom=/^PLAN-S31-ATOM-A(\d{2})$/.exec(id);
    const recover=/^PLAN-S6-RECOVERY-R(\d{2})$/.exec(id);
    const n17=/^EMENDA-N17-([A-F])$/.exec(id);
    if(section)lines=[planSectionLines[section[1]]?.[Number(section[2])-1]];
    else if(amend){path=amendmentPath;lines=[amendmentLines[Number(amend[1])-1]];}
    else if(atom)lines=[atomLines[(Number(atom[1])-1)%atomLines.length]];
    else if(recover)lines=[recoveryLines[(Number(recover[1])-1)%recoveryLines.length]];
    else if(n17){path=amendmentPath;lines=[51];}
    const matches=(inventory?.lines||[]).filter(row=>
      row.path===path&&lines?.includes(row.line));
    const positional=!!section||!!amend;
    record.candidate_source_links=matches.map(row=>row.id);
    if(positional&&matches.length===1){
      record.source_links=[matches[0].id];
      record.source_link_level="POSITIONAL_SOURCE_VERIFIED";
      record.source_location={path:matches[0].path,line:matches[0].line,
        blob:matches[0].blob,text_sha256:matches[0].text_sha256};
    } else {
      record.source_link_level=matches.length===1?"PROVISIONAL_ONLY":"UNMAPPED";
    }
    if(n17)record.source_clause_marker="("+n17[1].toLowerCase()+")";
    // Verification is ONLY of physical position against the protected blob.
    // It cannot establish atomic meaning, entailment, or semantic PASS.
  }

  const semanticSentences=inventorySemanticSentenceCandidates(inventory);
  const atomOrdinalTargets=[
    [36,1],[36,3],[36,4],[36,5],[36,6],[37,2],[37,4],[37,6],
    [38,1],[38,3],[38,4],[40,2],[40,3],[40,5],[40,6],
    [41,1],[41,2],[42,2],[42,5],[42,6],[44,2],[44,6],[45,2],[46,4]
  ];
  const recoveryOrdinalTargets=[
    [97,1],[97,2],[99,1],[99,2],[100,1],[101,2],[102,1]
  ];
  const atomize=(row,source,selection)=>{
    if(!source||!selection)return false;
    const [line,ordinal]=selection;
    const segments=(semanticSentences.candidates||[])
      .filter(x=>x.path===source.path&&x.line===line);
    const item=segments[ordinal-1];
    if(!item||item.source_id!==source.id)return false;
    row.source_links=[source.id];
    row.source_link_level="TEXT_SEGMENT_VERIFIED";
    row.source_atom={id:item.id,start:item.start,end:item.end,
      text_sha256:item.text_sha256,line,blob:source.blob,path:source.path};
    return true;
  };
  for(const row of normative_rules.filter(x=>x.source_link_level==="PROVISIONAL_ONLY")){
    const atom=/^PLAN-S31-ATOM-A(\d{2})$/.exec(row.rule_id);
    const recovery=/^PLAN-S6-RECOVERY-R(\d{2})$/.exec(row.rule_id);
    const n17=/^EMENDA-N17-([A-F])$/.exec(row.rule_id);
    if(atom||recovery){
      const target=atom?atomOrdinalTargets[Number(atom[1])-1]:
        recoveryOrdinalTargets[Number(recovery[1])-1];
      const source=(inventory?.lines||[]).find(x=>x.path===planPath&&x.line===target?.[0]);
      atomize(row,source,target);
    }else if(n17){
      const source=(inventory?.lines||[]).find(x=>x.path===amendmentPath&&x.line===51);
      const found=source?[...source.text.matchAll(/\(([a-f])\)/g)]:[];
      const idx="ABCDEF".indexOf(n17[1]);
      const mark=found[idx];
      if(mark&&mark[1]===n17[1].toLowerCase()){
        const end=found[idx+1]?.index??source.text.length;
        const phrase=source.text.slice(mark.index,end);
        row.source_links=[source.id];
        row.source_link_level="TEXT_SEGMENT_VERIFIED";
        row.source_atom={id:"N17-"+n17[1],start:mark.index,end,
          text_sha256:createHash("sha256").update(phrase).digest("hex"),
          line:51,blob:source.blob,path:source.path};
      }
    }
  }
  const atomicVerified=normative_rules.filter(row=>
    row.source_link_level==="TEXT_SEGMENT_VERIFIED").length;

  const provisional_count=normative_rules.filter(row=>
    row.source_link_level==="PROVISIONAL_ONLY").length;
  const positional_count=normative_rules.filter(row=>
    row.source_link_level==="POSITIONAL_SOURCE_VERIFIED").length;

  const normativeIds=normative_rules.map(row=>row.rule_id);
  const pairCount=normativeIds.length*(normativeIds.length-1)/2;
  const pairHash=createHash("sha256");
  for(let i=0;i<normativeIds.length;i++)
    for(let j=i+1;j<normativeIds.length;j++)
      pairHash.update(normativeIds[i]+"|"+normativeIds[j]+"\\n");
  const pairDigest=pairHash.digest("hex");
  const linked_count=normative_rules.filter(row=>row.source_links.length).length;
  const issues=[...(inventory?.issues||[])];
  if(!inventory?.inventory_verified)issues.push("SEMANTIC_SOURCE_NOT_VERIFIED");
  if(normative_rules.length!==137||linked_count!==137||provisional_count!==0||positional_count!==90||atomicVerified!==37)issues.push("SEMANTIC_NORMATIVE_RULE_LINKAGE_INCOMPLETE");
  if(slots.length!==inventory?.lines?.length||
     slots.some(row=>SEMANTIC_AXES.some(a=>row.axes[a]?.status!=="UNPROVEN")))
    issues.push("SEMANTIC_SEVEN_AXIS_WORKLIST_INCOMPLETE");
  return {schema:"contaos.semantic-seven-axis-backlog.v1",
    normative_rules,normative_rule_count:normative_rules.length,
    normative_axis_slots:normative_rules.length*SEMANTIC_AXES.length,
    anchored_normative_rules:linked_count,unlinked_normative_rules:normative_rules.length-linked_count,
    provisionally_located_rules:provisional_count,
    positionally_verified_rules:positional_count,segment_located_rules:atomicVerified,
    all_possible_rule_pairs:pairCount,untriaged_rule_pairs:pairCount,
    pair_inventory_sha256:pairDigest,
    source_lines:slots.length,axes_per_source:SEMANTIC_AXES.length,
    axis_slots:slots.length*SEMANTIC_AXES.length,rows:slots,
    co_mentioned_interactions:pairs,issues,
    worklist_verified:issues.length===0,
    semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
}
export function validateSevenAxisSemanticBacklog(inventory,backlog){
  const issues=[...(backlog?.issues||[])];
  const expected=new Map((inventory?.lines||[]).map(row=>[row.id,row]));
  const observed=new Set();
  if(!inventory?.inventory_verified||!backlog?.worklist_verified)
    issues.push("SEMANTIC_WORKLIST_SOURCE_UNVERIFIED");
  for(const row of backlog?.rows||[]){
    const src=expected.get(row.source_id);
    if(!src||observed.has(row.source_id)||
       row.path!==src.path||row.blob!==src.blob||
       row.line!==src.line||row.text_sha256!==src.text_sha256)
      issues.push("SEMANTIC_WORKLIST_INVALID_SOURCE: "+row.source_id);
    observed.add(row.source_id);
    if(SEMANTIC_AXES.some(axis=>!Object.prototype.hasOwnProperty.call(
        row.axes||{},axis)))
      issues.push("SEMANTIC_WORKLIST_MISSING_AXIS: "+row.source_id);
  }
  if(observed.size!==expected.size||backlog?.axis_slots!==expected.size*7)
    issues.push("SEMANTIC_WORKLIST_MISSING_SOURCE_OR_SLOT");
  const actualRules=backlog?.normative_rules||[];
  if(actualRules.length!==137||backlog?.normative_axis_slots!==959||
     new Set(actualRules.map(x=>x.rule_id)).size!==137||
     CLOSED_PLAN_SEMANTIC_UNITS.some(id=>!actualRules.some(x=>x.rule_id===id))||
     actualRules.some(x=>SEMANTIC_AXES.some(axis=>!Object.prototype.hasOwnProperty.call(
       x.axes||{},axis))))
    issues.push("SEMANTIC_NORMATIVE_RULE_MATRIX_INCOMPLETE");
  const positionalRows=actualRules.filter(row=>row.source_link_level==="POSITIONAL_SOURCE_VERIFIED");
  if(positionalRows.length!==90||backlog?.positionally_verified_rules!==90||
     backlog?.anchored_normative_rules!==137||
     backlog?.provisionally_located_rules!==0||
     backlog?.unlinked_normative_rules!==0||
     backlog?.segment_located_rules!==37)
    issues.push("SEMANTIC_POSITIONAL_SOURCE_TOTAL_INVALID");
  for(const row of positionalRows){
    const src=(inventory?.lines||[]).find(x=>x.id===row.source_links?.[0]);
    if(row.source_links?.length!==1||!src||
       src.path!==row.source_location?.path||
       src.line!==row.source_location?.line||
       src.blob!==row.source_location?.blob||
       src.text_sha256!==row.source_location?.text_sha256)
      issues.push("SEMANTIC_POSITIONAL_SOURCE_INVALID: "+row.rule_id);
  }
  const segmentRows=actualRules.filter(row=>row.source_link_level==="TEXT_SEGMENT_VERIFIED");
  if(segmentRows.length!==37)issues.push("SEMANTIC_SEGMENT_TOTAL_INVALID");
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  for(const row of segmentRows){
    const src=(inventory?.lines||[]).find(x=>x.id===row.source_links?.[0]);
    const atom=row.source_atom;
    const phrase=src?.text?.slice(atom?.start,atom?.end);
    const valid=src&&row.source_links.length===1&&atom&&
      atom.path===src.path&&atom.blob===src.blob&&atom.line===src.line&&
      Number.isSafeInteger(atom.start)&&Number.isSafeInteger(atom.end)&&
      atom.start>=0&&atom.end>atom.start&&atom.end<=src.text.length&&
      createHash("sha256").update(phrase).digest("hex")===atom.text_sha256;
    if(!valid){issues.push("SEMANTIC_SEGMENT_SOURCE_INVALID: "+row.rule_id);continue;}
    const n17=/^EMENDA-N17-([A-F])$/.exec(row.rule_id);
    if(n17){
      if(atom.id!=="N17-"+n17[1]||
         !phrase.startsWith("("+n17[1].toLowerCase()+")"))
        issues.push("SEMANTIC_N17_CASE_SOURCE_INVALID: "+row.rule_id);
    }else if(!sentenceInventory.candidates.some(x=>
      x.id===atom.id&&x.source_id===src.id&&
      x.start===atom.start&&x.end===atom.end))
      issues.push("SEMANTIC_SENTENCE_SOURCE_INVALID: "+row.rule_id);
  }
  for(let i=0;i<10;i++){
    const id="PLAN-S3-"+String(i+1).padStart(2,"0");
    const expectedAnchor=(inventory?.lines||[]).find(x=>
      x.path==="docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md"&&x.line===23+i);
    if(!expectedAnchor||!actualRules.some(x=>x.rule_id===id&&
        x.source_links?.length===1&&x.source_links[0]===expectedAnchor.id))
      issues.push("SEMANTIC_NORMATIVE_S3_SOURCE_MISMATCH: "+id);
  }
  return {worklist_complete:issues.length===0,
    missing_sources:[...expected.keys()].filter(id=>!observed.has(id)),
    issues,semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
}


/**
 * Reverse source-to-rule audit. A mapping from a numbered rule to one text
 * location cannot prove that every source span was interpreted.
 * Deliberately reports a non-releasable gap, including gaps not recognized
 * by the 137-item forward inventory.
 */

const SEMANTIC_GAP_REVIEW_CATEGORIES=Object.freeze({
  PLAN:Object.freeze({
    3:"SCOPE_AND_STAGE",7:"LIVE_BASE_FRESHNESS",8:"INITIAL_MISSION_CONTEXT",
    9:"AUDITOR_PROFILE_AND_METHOD",10:"WORKFLOW_BASELINE",
    11:"PROTECTION_AND_REVIEW_AUTHORITY",12:"NORMATIVE_REFERENCE_DEPENDENCIES",
    13:"FORBIDDEN_SCOPE",17:"UNCERTIFIED_BASELINE_GAP",
    19:"AUDITOR_ROLE_AND_INDEPENDENCE",89:"RED_GREEN_SECURITY_GATES",
    117:"AUDIT_TABLE_HEADER",123:"ZERO_DRIFT_HEADER",
    128:"VISUAL_SCOPE_AND_TEST_C",133:"HISTORICAL_AUDIT_RECORD",
    141:"HISTORICAL_AUDIT_RECORD"
  }),
  EMENDA:Object.freeze({7:"AMENDMENT_TABLE_HEADER",63:"ZERO_DRIFT_HEADER"})
});
export function auditSemanticReverseCoverage(inventory,worklist){
  const issues=[...(inventory?.issues||[]),...(worklist?.issues||[])];
  const byId=new Map((inventory?.lines||[]).map(row=>[row.id,row]));
  const references=new Map([...byId.keys()].map(id=>[id,[]]));
  const invalid=[];
  for(const rule of worklist?.normative_rules||[]){
    for(const sourceId of rule.source_links||[]){
      if(!byId.has(sourceId)){
        invalid.push({rule_id:rule.rule_id,source_id:sourceId});
        issues.push("SEMANTIC_REVERSE_INVALID_SOURCE_LINK: "+rule.rule_id);
      } else references.get(sourceId).push({
        rule_id:rule.rule_id,kind:rule.source_link_level||"UNKNOWN"
      });
    }
  }
  const uncovered=(inventory?.lines||[]).filter(row=>
    !references.get(row.id)?.length).map(row=>({
      source_id:row.id,path:row.path,blob:row.blob,
      line:row.line,text_sha256:row.text_sha256
    }));
  const triaged=uncovered.map(row=>{
    const collection=row.path.includes("/EMENDA_")?"EMENDA":"PLAN";
    const category=SEMANTIC_GAP_REVIEW_CATEGORIES[collection][row.line]||null;
    return {...row,category,
      assessment:"REQUIRES_INDEPENDENT_SEMANTIC_REVIEW",
      semantic_evidence:null,negative_witness:null};
  });
  if(triaged.some(row=>!row.category))
    issues.push("SEMANTIC_REVERSE_UNCLASSIFIED_SOURCE_GAP");
  // Classification is triage only. Never convert a content obligation into
  // N/A or reduce the uncovered count without a source-bound review.
  const covered=[...references.entries()].filter(([,links])=>links.length).length;
  const extraUnproved=(worklist?.normative_rules||[]).filter(rule=>
    rule.rule_verdict!=="PASS"||Object.values(rule.axes||{})
      .some(value=>value==="UNPROVEN")).length;
  if(uncovered.length)issues.push(
    "SEMANTIC_REVERSE_UNCOVERED_SOURCE_SPANS: "+uncovered.length);
  if(extraUnproved)issues.push(
    "SEMANTIC_REVERSE_UNPROVEN_NORMATIVE_RULES: "+extraUnproved);
  if(!inventory?.inventory_verified||!worklist?.worklist_verified)
    issues.push("SEMANTIC_REVERSE_SOURCE_OR_WORKLIST_UNVERIFIED");
  // A reverse mapping is evidence of traceability, not interpretation.
  // Never infer semantic PASS from a lack of uncovered lines.
  return {schema:"contaos.semantic-reverse-coverage.v1",
    source_count:byId.size,covered_source_count:covered,
    uncovered_source_count:uncovered.length,uncovered:triaged,
    rule_count:worklist?.normative_rules?.length||0,
    unproven_rule_count:extraUnproved,invalid,issues,
    traceability_complete:uncovered.length===0&&invalid.length===0,
    semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
}


/**
 * Exhaustive evidence gate, not an evidence generator. All rules,
 * sentence candidates, source lines and unordered interactions must be
 * adjudicated. Trusted read-only evidence providers are required.
 */
export async function assessSemanticCompletenessGate({
  inventory,worklist,sentenceInventory,reverseCoverage,
  rules=[],sentences=[],sources=[],interactions=[],
  independent=null,head=null,
  authenticateWitness=null,authenticateIndependent=null,
}={}){
  const issues=[];
  const fail=x=>issues.push(x);
  const expectedRules=worklist?.normative_rules||[];
  const expectedSentences=sentenceInventory?.candidates||[];
  const expectedSources=inventory?.lines||[];
  const goodSha=typeof head==="string"&&/^[0-9a-f]{40}$/.test(head);
  if(!inventory?.inventory_verified||!worklist?.worklist_verified||
     !sentenceInventory?.partition_verified||!goodSha)
    fail("SEMANTIC_UNVERIFIED_SOURCE_OR_HEAD");
  if(!reverseCoverage||reverseCoverage.source_count!==expectedSources.length||
     reverseCoverage.unproven_rule_count!==expectedRules.length)
    fail("SEMANTIC_REVERSE_BASELINE_MISMATCH");
  const validateSet=(label,expected,actual,key)=>{
    const ids=new Set(expected.map(key));
    const got=new Set(actual.map(key));
    if(got.size!==actual.length||got.size!==ids.size||
       [...ids].some(id=>!got.has(id)))fail("SEMANTIC_"+label+"_COVERAGE_INCOMPLETE");
  };
  validateSet("RULES",expectedRules,rules,x=>x?.rule_id);
  validateSet("SENTENCES",expectedSentences,sentences,x=>x?.id);
  validateSet("SOURCES",expectedSources,sources,x=>x?.source_id??x?.id);
  const pairs=[];
  for(let i=0;i<expectedRules.length;i++)
    for(let j=i+1;j<expectedRules.length;j++)
      pairs.push(expectedRules[i].rule_id+"|"+expectedRules[j].rule_id);
  const pairSet=new Set(pairs),normalized=new Set();
  for(const p of interactions){
    if(!p||!pairSet.has(p.pair_id)||normalized.has(p.pair_id)){
      fail("SEMANTIC_PAIR_UNKNOWN_OR_DUPLICATE");break;
    }
    normalized.add(p.pair_id);
  }
  if(interactions.length!==pairs.length||normalized.size!==pairs.length)
    fail("SEMANTIC_9316_PAIRS_UNADJUDICATED");
  const proofOk=(p,id)=>!!p&&p.head===head&&
    typeof p.interpretation==="string"&&p.interpretation.trim().length>=35&&
    typeof p.counterexample==="string"&&p.counterexample.trim().length>=25&&
    typeof p.witness==="object"&&p.witness!==null&&
    !!p.witness.run_url&&p.witness.head===head&&
    p.independent_review_id===independent?.review_id &&
    p.id===id;
  for(const record of rules){
    const origin=expectedRules.find(x=>x.rule_id===record?.rule_id);
    if(!origin||!origin.source_links?.length||
       !proofOk(record,record.rule_id)||
       SEMANTIC_AXES.some(axis=>!semanticAxisStructurallyComplete(record.axes,axis))){
      fail("SEMANTIC_RULE_UNPROVEN: "+record?.rule_id);break;
    }
  }
  for(const record of sentences){
    const origin=expectedSentences.find(x=>x.id===record?.id);
    if(!origin||record.source_id!==origin.source_id||
       record.text_sha256!==origin.text_sha256||
       !["NORMATIVE","CONTEXTUAL"].includes(record.classification)||
       !proofOk(record,record.id)||
       (record.classification==="NORMATIVE"&&
          SEMANTIC_AXES.some(axis=>!semanticAxisStructurallyComplete(record.axes,axis)))){
      fail("SEMANTIC_SENTENCE_UNPROVEN: "+record?.id);break;
    }
  }
  for(const record of sources){
    const origin=expectedSources.find(x=>x.id===record?.source_id);
    if(!origin||record.text_sha256!==origin.text_sha256||
       record.blob!==origin.blob||!proofOk(record,record.source_id)){
      fail("SEMANTIC_SOURCE_UNPROVEN: "+record?.source_id);break;
    }
  }
  for(const pair of interactions){
    if(!["INTERACTS","NONINTERACTING","CONFLICT"].includes(pair.decision)||
       !proofOk(pair,pair.pair_id)){
      fail("SEMANTIC_PAIR_UNPROVEN: "+pair?.pair_id);break;
    }
  }
  if(independent?.head!==head||!Number.isSafeInteger(independent?.review_id)||
     independent.review_id<=0||independent.author===independent.reviewer||
     independent.state!=="APPROVED"||independent.scope!=="FULL_SEMANTIC_CORPUS")
    fail("SEMANTIC_INDEPENDENCE_UNPROVEN");
  if(typeof authenticateWitness!=="function"||
     typeof authenticateIndependent!=="function")
    fail("SEMANTIC_AUTHENTICATED_CONTRADICTION_MISSING");
  // Authenticate only once all the local evidence is complete. Do not
  // perform thousands of calls for an incomplete or fabricated ledger.
  if(issues.length===0){
    try {
      if(await authenticateIndependent(independent,head)!==true)
        fail("SEMANTIC_INDEPENDENT_REVIEW_NOT_AUTHENTICATED");
      const all=[...rules,...sentences,...sources,...interactions];
      if(issues.length===0)
        for(const row of all){
          if(await authenticateWitness(row.witness,head,row.id)!==true){
            fail("SEMANTIC_WITNESS_NOT_AUTHENTICATED: "+row.id);break;
          }
        }
    } catch(e){fail("SEMANTIC_EXTERNAL_AUTHENTICATION_UNAVAILABLE");}
  }
  return {schema:"contaos.semantic-completeness-gate.v1",
    head,rule_count:expectedRules.length,sentence_count:expectedSentences.length,
    source_count:expectedSources.length,pair_count:pairs.length,
    supplied:{rules:rules.length,sentences:sentences.length,
      sources:sources.length,pairs:interactions.length},
    semantic_completeness:issues.length?"INCONCLUSIVE":"PASS",
    release:issues.length?"NO_GO":"SEMANTIC_REVIEW_CERTIFIED_ONLY",
    independent_review_id:issues.length?null:independent.review_id,issues};
}

export function auditNormativeSemanticCompleteness(matrix,claims={}){
  const rows=Array.isArray(matrix?.rows)?matrix.rows:[];
  const issues=[];
  if(matrix?.verdict!=="EXECUTED_PASS_FOR_BUILD_ONLY"||!rows.length)
    issues.push("SEMANTIC: executable BUILD evidence not complete");
  if(!claims||typeof claims!=="object"||Array.isArray(claims))
    claims={};
  if(new Set(rows.map(row=>row.id)).size!==rows.length)
    issues.push("SEMANTIC: duplicated obligation ID");
  // This set is separate from the 218 executable BUILD matrix.
  // A self-selected subset cannot create a zero-unproven semantic certificate.
  const presentIds=new Set(rows.map(row=>row.id));
  const sourceUnmapped=CLOSED_PLAN_SEMANTIC_UNITS.filter(id=>!presentIds.has(id));
  if(sourceUnmapped.length)
    issues.push("SEMANTIC: protected PLAN/emend source not wholly mapped: "+
      sourceUnmapped.length+" obligations missing");

  const findings=rows.map(row=>{
    const evidence=Object.prototype.hasOwnProperty.call(claims,row.id)?claims[row.id]:null;
    const missing=SEMANTIC_AXES.filter(axis=>!semanticAxisStructurallyComplete(evidence,axis));
    if(missing.length)issues.push("SEMANTIC: "+row.id+" missing "+missing.join(","));
    return {id:row.id,execution:row.execution,axes:SEMANTIC_AXES.length-missing.length,
      missing,semanticVerdict:missing.length?"INCONCLUSIVE":"REVIEW_REQUIRED"};
  });
  const unknown=Object.keys(claims).filter(id=>!rows.some(row=>row.id===id));
  if(unknown.length)issues.push("SEMANTIC: unrecognized claims "+unknown.join(","));
  return {schema:"contaos.protocol-semantic-audit.v1",
    verdict:"INCONCLUSIVE",release:"NO_GO",reviewRequired:true,
    total:rows.length,unproven:findings.filter(x=>x.missing.length).length,
    sourceExpected:CLOSED_PLAN_SEMANTIC_UNITS.length,
    sourceUnmapped,sourceComplete:sourceUnmapped.length===0,
    findings,issues,
    reason:"Seven narrative axes need source-backed verification and independent adversarial contradiction; neither self-assertion nor BUILD PASS is a semantic certificate"};
}
export function attestFullProtocolExecutions(coverage,suites,{head,base,checkoutSha}={}){
  const issues=[...(coverage?.issues||[])];
  const rows=[];
  if(!validSha(head)||!validSha(base)||!validSha(checkoutSha))
    issues.push("EXECUTION: SHA/base/checkout invalidos");
  if(coverage?.verdict!=="COVERAGE_MAPPED_NOT_EXECUTED")
    issues.push("EXECUTION: contrato incompleto ou nao mapeado");
  const suiteKeys=["python","rca","queue"];
  for(const key of suiteKeys){
    const suite=suites?.[key];
    if(!suite || suite.exitCode!==0 || !suite.passed ||
        !Number.isSafeInteger(suite.executed)||suite.executed<1 ||
        !(suite.outputSha256||"").match(/^[a-f0-9]{64}$/) ||
        !Array.isArray(suite.successfulNames) ||
        suite.successfulNames.length!==suite.executed ||
        new Set(suite.successfulNames).size!==suite.successfulNames.length)
      issues.push("EXECUTION: suite nao comprovada integralmente: "+key);
  }
  for(const row of coverage?.rows||[]){
    if(!row.source){
      const witnessId=FULL_PROTOCOL_STRUCTURAL_TO_EXECUTED[row.id];
      const witness=FULL_PROTOCOL_CASES.find(x=>x.id===witnessId);
      const suite=witness&&suites?.[witness.file];
      const matches=witness&&Array.isArray(suite?.successfulNames)?
        suite.successfulNames.filter(x=>x.startsWith(witness.pattern)):[];
      const valid=row.status==="STRUCTURAL_WITNESS" && !!witnessId &&
        suite?.passed===true && suite.exitCode===0 && matches.length>0;
      rows.push({...row,execution:valid?"EXECUTED_PASS":"UNPROVEN",
        executableWitness:witnessId||null,matchedTests:matches,
        outputSha256:suite?.outputSha256||null});
      if(!valid)issues.push("EXECUTION: controle estrutural sem teste real PASS: "+row.id);
      continue;
    }
    const item=FULL_PROTOCOL_CASES.find(x=>x.id===row.id);
    const suite=item&&suites?.[item.file];
    const matches=Array.isArray(suite?.successfulNames)?
      suite.successfulNames.filter(x=>x.startsWith(item.pattern)):[];
    const compound=executedConstituents(suites,FULL_PROTOCOL_COMPOUND_WITNESSES[row.id]);
    const good=suite?.passed===true && suite?.exitCode===0 &&
      row.status==="TEST_DECLARED_NOT_EXECUTED" && matches.length>=1 &&
      compound.complete;
    rows.push({...row,compoundTests:compound.names,execution:good?
      (row.scope==="BUILD_NEGATIVE_PROOF_ACTIVATION_EXTERNAL"?
        "BUILD_NEGATIVE_PASS_ACTIVATION_BLOCKED":
       row.scope==="BUILD_NEGATIVE_PROOF_INDEPENDENT_AUDIT_EXTERNAL"?
        "BUILD_NEGATIVE_PASS_INDEPENDENT_AUDIT_PENDING":"EXECUTED_PASS"):"UNPROVEN",
      suite:item?.file||null,matchedTests:matches,
      outputSha256:suite?.outputSha256||null});
    if(!good)issues.push("EXECUTION: requisito sem teste executado PASS: "+row.id);
  }
  return {schema:"contaos.full-protocol-executed.v2",
    verdict:issues.length?"CHANGES_REQUESTED":"EXECUTED_PASS_FOR_BUILD_ONLY",
    head,base,checkoutSha,requirements:rows.length,
    executed:rows.filter(x=>x.execution==="EXECUTED_PASS").length,
    activationBlocked:rows.filter(x=>x.execution==="BUILD_NEGATIVE_PASS_ACTIVATION_BLOCKED").length,
    independentAuditPending:rows.filter(x=>x.execution==="BUILD_NEGATIVE_PASS_INDEPENDENT_AUDIT_PENDING").length,
    structural:rows.filter(x=>x.execution==="STRUCTURAL_CHECK_ONLY").length,
    rows,external:[...(coverage?.external||[]),
      ...rows.filter(x=>x.execution==="BUILD_NEGATIVE_PASS_ACTIVATION_BLOCKED")
        .map(x=>({requirement:x.id,status:"BLOCKED_EXTERNAL_FOR_ACTIVATION",
          negativeBuildTest:x.matchedTests?.[0]||null})),
      ...rows.filter(x=>x.execution==="BUILD_NEGATIVE_PASS_INDEPENDENT_AUDIT_PENDING")
        .map(x=>({requirement:x.id,status:"BLOCKED_EXTERNAL_FOR_INDEPENDENT_AUDIT",
          negativeBuildTest:x.matchedTests?.[0]||null}))],issues,
    suites:Object.fromEntries(suiteKeys.map(k=>[k,suites?.[k]?{
      exitCode:suites[k].exitCode,executed:suites[k].executed,
      outputSha256:suites[k].outputSha256,passed:suites[k].passed,diagnostic:suites[k].passed?null:suites[k].diagnostic
    }:null]))};
}
export function parseFullProtocolSuiteResult(key,result){
  const output=(result?.stdout||"")+"\n"+(result?.stderr||"");
  const outputSha256=createHash("sha256").update(output).digest("hex");
  let successfulNames=[],executed=0,passed=false;
  if(key==="python"){
    successfulNames=[...output.matchAll(/^\s*(test_[A-Za-z0-9_]+) \(/gm)].map(x=>x[1]);
    const n=/Ran (\d+) tests? in /m.exec(output);
    executed=n?Number(n[1]):0;
    passed=result?.status===0 && executed>0 &&
      successfulNames.length===executed && /(?:^|\n)OK\s*(?:\n|$)/.test(output) &&
      !/\b(?:FAILED|ERROR|FAIL) \(/.test(output);
  }else{
    successfulNames=[...output.matchAll(/^ok \d+ - (.+)$/gm)].map(x=>x[1].trim().replaceAll("\\#","#"));
    const n=/# tests (\d+)/.exec(output);
    const passCount=/# pass (\d+)/.exec(output);
    executed=n?Number(n[1]):0;
    passed=result?.status===0 && executed>0 &&
      successfulNames.length===executed &&
      Number(passCount?.[1])===executed &&
      /^# fail 0$/m.test(output) && /^# skipped 0$/m.test(output) &&
      /^# cancelled 0$/m.test(output) && !/^not ok /m.test(output);
  }
  return {exitCode:result?.status??null,passed,executed,
    successfulNames,outputSha256,
    diagnostic:passed?null:(output.includes("\nnot ok ")?output.slice(output.indexOf("\nnot ok ")+1,output.indexOf("\nnot ok ")+2600):output.slice(-1800))};
}
function runFullProtocolSuites(){
  const definitions=[
    ["python","python",["-B","scripts/auditoria/test_mission_supervisor.py"]],
    ["rca",process.execPath,["--test","--test-reporter=tap",
      "scripts/p0-rca-impact-gate.test.mjs"]],
    ["queue",process.execPath,["--test","--test-reporter=tap",
      "scripts/ci/merge-group-context.test.mjs"]],
  ];
  const safeEnv={...process.env};
  for(const key of ["GITHUB_TOKEN","CONTAOS_CANONICAL_READ_TOKEN","GH_TOKEN","GITHUB_PAT"])
    delete safeEnv[key];
  return Object.fromEntries(definitions.map(([key,bin,args])=>{
    const result=spawnSync(bin,args,{encoding:"utf8",env:safeEnv,
      timeout:180000,maxBuffer:12*1024*1024});
    const parsed=parseFullProtocolSuiteResult(key,result);
    if(result.error)parsed.diagnostic=String(result.error.message).slice(0,180);
    return [key,parsed];
  }));
}
// The PLAN #689 and queue amendment #691 are protected normative inputs.
// A green test matrix cannot replace or invent their source or soften their
// BUILD-vs-activation boundary.
export function attestProtectedNormativeSources({manifest,plan,amendment,canonical}={}){
  const issues=[];
  if(manifest?.schema!=="contaos.p0.gov-plan.v1" ||
    manifest?.approved!==true || manifest?.pr_number!==690 ||
    manifest?.ativacao_autorizada!==false ||
    manifest?.plan_documento!=="docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md" ||
    manifest?.emenda_fila!=="docs/frontend/planos/EMENDA_P0_ABS_FILA_REVISAO_690_2026-11-20.md")
    issues.push("NORMATIVE: manifesto protegido nao autentica PLAN/emenda/ativacao");
  if(typeof plan!=="string" || gitBlobId(plan)!=="9d037a37df8ae177f7f02123932e0ca60e7e3f81" ||
    manifest?.plan_blob!=="9d037a37df8ae177f7f02123932e0ca60e7e3f81")
    issues.push("NORMATIVE: PLAN #689 sem blob imutavel de origem");
  if(typeof amendment!=="string" || gitBlobId(amendment)!=="cba58ceb1f88fa6774ccf1ce1661ac9f5a942c1b")
    issues.push("NORMATIVE: emenda #691 sem blob imutavel de origem");
  const CANONICAL_ORCHESTRATION_BLOB="8a9d5824a83d43150589b97ad8cbd95d6b49cfdd";
  if(typeof canonical!=="string" || gitBlobId(canonical)!==CANONICAL_ORCHESTRATION_BLOB)
    issues.push("NORMATIVE: protocolo persistente de orquestracao sem blob protegido");
  for(const phrase of [
    "Antes de enviar `APPROVE`",
    "exceção documental",
    "Para BUILD/código",
    "Não leia tokens",
  ])if(typeof canonical!=="string" || !canonical.includes(phrase))
    issues.push("NORMATIVE: regra de revisão ou exceção documental ausente: "+phrase);
  for(const [id,source,words] of [
    ["BUILD-SEPARATE-ACTIVATION",amendment,"ativacao_autorizada: false"],
    ["BUILD-MANIFEST-ALLOWLIST",amendment,"manifesto"],
    ["N17C-THIRD-PARTY",amendment,"autoria terceira"],
    ["N17C-REVIEWERS",amendment,"contaos9999"],
    ["MISSION-LOCK-DEDICATED-APP",plan,"GitHub App"],
    ["TWO-STAGE-REVIEW",plan,"Certificação em duas provas"],
    ["NO-UNTRUSTED-PUBLISHING",plan,"sem checkout ou execução de código não confiável"],
  ])if(typeof source!=="string" || !source.includes(words))
    issues.push("NORMATIVE: regra incorporada ausente "+id);
  return {schema:"contaos.protected-normative-sources.v1",
    verdict:issues.length?"CHANGES_REQUESTED":"PASS",
    planBlob:typeof plan==="string"?gitBlobId(plan):null,
    amendmentBlob:typeof amendment==="string"?gitBlobId(amendment):null,
    canonicalBlob:typeof canonical==="string"?gitBlobId(canonical):null,
    activationAuthorized:false,issues};
}

function fullProtocolAuditFromCheckout(){
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const mission=JSON.parse(readFileSync("docs/frontend/governanca/MISSAO_ATIVA_4_1.json","utf8"));
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const tests=Object.fromEntries(Object.entries(PROTOCOL_FULL_AUDIT_FILES)
    .map(([key,path])=>[key,readFileSync(path,"utf8")]));
  // Read the signed-off manifesto from protected base, never from PR worktree.
  const base=String(process.env.INPUT_PREAUDIT_BASE||"e007c4bad8f2c66c489c55e4752b71bb19c5ced0");
  if(!validSha(base))throw Error("full protocol: invalid protected base");
  const manifest=JSON.parse(execFileSync("git",["show",base+
    ":docs/frontend/planos/P0_GOV_PLAN_690.json"],{encoding:"utf8",timeout:15000}));
  const plan=execFileSync("git",["show",base+":"+
    manifest.plan_documento],{encoding:"utf8",timeout:15000});
  const amendment=execFileSync("git",["show",base+":"+
    manifest.emenda_fila],{encoding:"utf8",timeout:15000});
  const canonical=execFileSync("git",["show",base+
    ":docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md"],
    {encoding:"utf8",timeout:15000});
  const normative=attestProtectedNormativeSources({manifest,plan,amendment,canonical});
  if(normative.verdict!=="PASS")throw Error(normative.issues.join("; "));
  const paths=execFileSync("git",["diff","--name-only",base,"HEAD"],
    {encoding:"utf8",timeout:15000}).trim().split("\n").filter(Boolean);
  const coverage=auditFullProtocolCoverage({protocol,tests,mission,workflow,source,manifest,paths});
  const checkoutSha=execFileSync("git",["rev-parse","HEAD"],
    {encoding:"utf8",timeout:15000}).trim();
  const head=process.env.INPUT_PREAUDIT_HEAD ||
    execFileSync("git",["rev-parse","HEAD^2"],
      {encoding:"utf8",timeout:15000}).trim();
  if(!validSha(head)||!validSha(checkoutSha)||
      (checkoutSha!==head &&
        execFileSync("git",["rev-parse","HEAD^2"],
          {encoding:"utf8",timeout:15000}).trim()!==head))
    throw Error("full protocol: checkout/head mismatch");
  const suites=runFullProtocolSuites();
  return {...attestFullProtocolExecutions(coverage,suites,{head,base,checkoutSha}),
    normative_sources:normative};
}

export function parseAssistantPreaudit(body) {
  if (typeof body !== "string") return null;
  const re = new RegExp("<!-- " + ASSISTANT_PREAUDIT_MARKER + "\\s*\\n([\\s\\S]*?)\\n-->", "g");
  const items = [...body.matchAll(re)];
  if (items.length !== 1) return null;
  try { return JSON.parse(items[0][1]); }
  catch { return null; }
}
export function validateAssistantPrecertRelease({
  pr, currentMain, manifest, paths, comments, reviews = [], checkRuns, artifact,
  testCJob, testCRun, testCAttemptJobs, v2Job, receiptV2Job=v2Job,
  redProvenance=[], historicalV2Run=null,
  historicalV2AttemptJobs=null,historicalV2Attempt=null,
  expectedHead, expectedBase,
} = {}) {
  const issues = [];
  const add = (reason) => issues.push(reason);
  if (!validSha(expectedHead) || !validSha(expectedBase) ||
      !pr || pr.number !== 690 || pr.state !== "open" ||
      pr.merged !== false || pr.draft !== false ||
      pr.head?.sha !== expectedHead ||
      pr.base?.sha !== expectedBase || pr.base?.ref !== "main" ||
      pr.base?.repo?.full_name !== REPO || currentMain !== expectedBase)
    add("PR/HEAD/base/main não vinculados ao mesmo snapshot vivo");
  if (!manifest || manifest.schema !== "contaos.p0.gov-plan.v1" ||
      manifest.approved !== true || manifest.pr_number !== 690 ||
      manifest.full_diff !== true || manifest.ativacao_autorizada !== false ||
      !Array.isArray(manifest.files) || manifest.files.length !== 14 ||
      !exactSet(paths, manifest.files) ||
      paths?.includes("docs/frontend/planos/P0_GOV_PLAN_690.json"))
    add("manifesto protegido e full_diff 14/14 não comprovados");
  if (!Array.isArray(checkRuns)) add("check runs ausentes");
  // The latest *native* review per reviewer on this exact HEAD is authoritative.
  // An independent CHANGES_REQUESTED is never overridden by our own PASS.
  if (!Array.isArray(reviews)) add("revisoes nativas do GitHub incompletas");
  else {
    const lastByReviewer = new Map();
    for (const review of [...reviews].sort((a,b) =>
      (a.submitted_at || "").localeCompare(b.submitted_at || "") ||
      (a.id || 0) - (b.id || 0))) {
      if (review?.commit_id === expectedHead && review?.user?.login &&
          ["CHANGES_REQUESTED", "APPROVED", "DISMISSED"].includes(review.state))
        lastByReviewer.set(review.user.login, review);
    }
    for (const review of lastByReviewer.values()) {
      if (review.state === "CHANGES_REQUESTED")
        add("revisao formal CHANGES_REQUESTED ainda vigente no HEAD");
    }
  }
  for (const name of PRECERT_REQUIRED_CHECKS) {
    const latest=latestPrecertCheck(checkRuns,name,expectedHead);
    if (!latest || latest.status!=="completed" || latest.conclusion!=="success")
      add("check exigido sem latest SUCCESS autenticado, pending/failure ou origem: "+name);
  }
  // The current LIVE V2 job must be green; the earlier receipt still proves
  // the original historical RED on this exact commit, independently verified
  // through its own authenticated Actions job. No check is trusted by name
  // alone; duplicate names with a foreign issuer or ID remain NO-GO.
  const v2Checks=Array.isArray(checkRuns)?
    checkRuns.filter(x=>x?.name===ADVERSARIAL_V2_CHECK_NAME):[];
  const latestV2=latestPrecertCheck(checkRuns,ADVERSARIAL_V2_CHECK_NAME,expectedHead);
  const receiptCheck=v2Checks.find(x=>x?.id===receiptV2Job?.id);
  const historicalReceipt= !receiptCheck &&
    verifyHistoricalV2JobProvenance({
      job:receiptV2Job,run:historicalV2Run,
      attemptJobs:historicalV2AttemptJobs,
      attempt:historicalV2Attempt,head:expectedHead,base:expectedBase,
    });
  if (!latestV2 || !v2AttestedJob(latestV2,v2Job,expectedHead) ||
      !(receiptCheck ?
        v2AttestedJob(receiptCheck,receiptV2Job,expectedHead) :
        historicalReceipt))
    add("25 provas executaveis P0-ABS V2 sem autenticacao de latest/receipt JOB/HEAD 10+12+3 causal");
  const history = Array.isArray(comments) ? comments
    .filter(x => x?.user?.login === "contaos9999" &&
      typeof x.body === "string" && x.body.includes(ASSISTANT_PREAUDIT_MARKER))
    .sort((a,b) => a.id - b.id) : [];
  const last = history.at(-1);
  const record = parseAssistantPreaudit(last?.body);
  if (!last || !record) add("parecer do assistente ausente/inválido na PR");
  else {
    if (record.schema !== "contaos.assistant-preaudit.v2" ||
        record.kind !== "ASSISTANT_PREAUDIT_NOT_INDEPENDENT" ||
        record.verdict !== "PASS" || record.pr !== 690 ||
        record.head !== expectedHead || record.base !== expectedBase ||
        !/^PA-690-[A-Za-z0-9.-]+$/.test(record.run_id || "") ||
        typeof record.report !== "string" || record.report.length < 400 ||
        !/^[0-9a-f]{64}$/.test(record.report_sha256 || "") ||
        record.report_sha256 !== preauditHash(record.report) ||
        !ASSISTANT_PREAUDIT_CRITERIA.every(x => record.criteria?.[x] === "PASS") ||
        record.adversarial_v2?.head !== expectedHead ||
        record.adversarial_v2?.base !== expectedBase ||
        record.adversarial_v2?.second_pass !== "PASS" ||
        record.adversarial_v2?.meta_audit !== "PASS" ||
        record.adversarial_v2?.red_green !== "PASS" ||
        !ADVERSARIAL_V2_LENSES.every(x => record.adversarial_v2?.lenses?.[x] === "PASS") ||
        !Array.isArray(record.adversarial_v2?.red_runs) ||
        record.adversarial_v2.red_runs.length < 1 ||
        !record.adversarial_v2.red_runs.every(x => Number.isSafeInteger(x) && x > 0))
      add("último parecer V2 não comprova matriz adversarial, RED/GREEN e segunda leitura no HEAD/base");
    // NR-006: Every separate causal RED must be independently replayed from a
    // pinned vulnerable commit/blob and contrasted against current GREEN.
    // A generic failed job or two runs of one case cannot count three times.
    const causal=record.adversarial_v2?.red_cases;
    if (!Array.isArray(causal) ||
        causal.length !== ADVERSARIAL_V2_CAUSAL_CASES.length ||
        new Set(causal.map(x=>x?.case_id)).size !== causal.length ||
        !ADVERSARIAL_V2_CAUSAL_CASES.every(expected=>{
          const observed=causal.find(x=>x?.case_id===expected.case_id);
          const stepName="P0 V2 CAUSAL_RED "+expected.case_id;
          return observed && observed.vulnerable_sha===expected.vulnerable_sha &&
            observed.vulnerable_blob===expected.vulnerable_blob &&
            observed.observed===expected.observed &&
            observed.green===expected.green &&
            observed.green_head===expectedHead &&
            observed.run_id===receiptV2Job?.run_id &&
            observed.job_id===receiptV2Job?.id &&
            receiptV2Job?.steps?.filter(x=>x?.name===stepName &&
              x.status==="completed" && x.conclusion==="success").length===1;
        }))
      add("NR-006: RED causal nao demonstrado por caso/SHA/blob/resultado e GREEN no mesmo job");
    // RED receipts are checked against real failed executions of the
    // supervisor test step, not merely numeric workflow IDs in a comment.
    if (!Array.isArray(record.adversarial_v2?.red_runs) ||
        record.adversarial_v2.red_runs.length < 1 ||
        !Array.isArray(redProvenance) ||
        redProvenance.length !== record.adversarial_v2.red_runs.length ||
        redProvenance.some(({run,jobs},i)=>
          run?.id !== record.adversarial_v2.red_runs[i] ||
          run?.head_sha === expectedHead ||
          !validSha(run?.head_sha) ||
          run?.event !== "pull_request" ||
          run?.head_branch !== "build/p0-abs-fiscal-universal" ||
          !Array.isArray(run?.pull_requests) ||
          !run.pull_requests.some(pr=>pr?.number===690) ||
          run?.path !== ".github/workflows/contaos-auditoria-controller.yml" ||
          run?.status !== "completed" || run?.conclusion !== "failure" ||
          !Array.isArray(jobs?.jobs) ||
          jobs.total_count !== jobs.jobs.length ||
          !jobs.jobs.some(job=>
            job?.name === "Controlador offline Windows" &&
            job?.conclusion === "failure" &&
            job?.steps?.some(step =>
              step.name === "P0-ABS supervisor universal N01-N17 (RED/GREEN)" &&
              step.conclusion === "failure"))))
      add("RED nao vinculado a workflow anterior autenticado e falha real do supervisor");
    if (!record.artifact || !Number.isSafeInteger(record.artifact.id) ||
        record.artifact.id <= 0 || !/^sha256:[0-9a-f]{64}$/.test(record.artifact.digest || ""))
      add("parecer sem recibo de artefato visual");
    else {
      const testC=latestPrecertCheck(checkRuns,
        "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
        expectedHead);
      const runId = record.artifact.run_id;
      const attempt = record.artifact.run_attempt;
      const jobId = record.artifact.job_id;
      if (record.artifact.id !== artifact?.id ||
          record.artifact.digest !== artifact?.digest ||
          artifact?.expired !== false ||
          artifact?.workflow_run?.head_sha !== expectedHead ||
          !Number.isSafeInteger(runId) || runId <= 0 ||
          !Number.isSafeInteger(attempt) || attempt <= 0 ||
          !Number.isSafeInteger(jobId) || jobId <= 0 ||
          artifact?.workflow_run?.id !== runId ||
          // GitHub artifacts expose the *run*, but not the attempt.
          // The upload action binds both IDs to its canonical artifact name.
          artifact?.name !== "contaos-teste-c-" + runId + "-" + attempt ||
          artifact?.name !== "contaos-teste-c-" + testCRun?.id + "-" + testCRun?.run_attempt ||
          testCJob?.id !== jobId ||
          testCJob?.run_id !== runId ||
          testCRun?.id !== runId ||
          testCRun?.run_attempt !== attempt ||
          testCRun?.head_sha !== expectedHead ||
          testCRun?.event !== "pull_request" ||
          testCRun?.status !== "completed" ||
          testCRun?.conclusion !== "success" ||
          testCRun?.path !== ".github/workflows/contaos-frontend-zero-drift.yml" ||
          !testCRun?.pull_requests?.some(x => x?.number === 690 &&
            x?.head?.sha === expectedHead && x?.base?.sha === expectedBase) ||
          !Array.isArray(testCAttemptJobs?.jobs) ||
          testCAttemptJobs?.total_count !== testCAttemptJobs.jobs.length ||
          !testCAttemptJobs.jobs.some(x => x?.id === jobId &&
            x?.run_id === runId && x?.conclusion === "success") ||
          testCJob?.head_sha !== expectedHead ||
          testCJob?.status !== "completed" ||
          testCJob?.conclusion !== "success" ||
          !Array.isArray(testCJob?.steps) ||
          !testCJob.steps.some(x => x?.conclusion === "success" &&
            x?.name === "Teste C Playwright — 24 telas, 4 larguras, 2 temas") ||
          testC?.id !== jobId ||
          testC?.details_url !==
            "https://github.com/" + REPO + "/actions/runs/" + runId + "/job/" + jobId)
        add("artefato sem vínculo autenticado ao run/attempt/job Playwright do check Teste C");
    }
  }
  return {pass: issues.length === 0, verdict: issues.length ? "BLOCKED" : "PASS",
    release: issues.length === 0 ? "PRE_CERTIFICATION_ONLY" : "NO_GO",
    issues, comment_id: last?.id ?? null, head: expectedHead, base: expectedBase};
}
async function fetchAllPrecert(path, token) {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const part = await http(path + (path.includes("?") ? "&" : "?") +
      "per_page=100&page=" + page, token);
    if (!Array.isArray(part)) throw Error("API paginada retornou tipo inválido");
    all.push(...part);
    if (part.length < 100) return all;
  }
  throw Error("paginação excedeu limite auditável");
}
export async function verifyAssistantPrecertInGithub({
  token = process.env.GITHUB_TOKEN,
  env = process.env,
  api = (p) => http(p, token),
  list = (p) => fetchAllPrecert(p, token),
  zipDigest = (id) => downloadPrecertArtifactDigest(id,token),
  originVerify = null,
  baseManifest = (base) => JSON.parse(execFileSync("git", [
    "show", base + ":docs/frontend/planos/P0_GOV_PLAN_690.json",
  ], {encoding: "utf8", timeout: 15000})),
} = {}) {
  const manual = env.GITHUB_EVENT_NAME === "workflow_dispatch";
  if (!["pull_request", "pull_request_review", "workflow_dispatch"].includes(env.GITHUB_EVENT_NAME) ||
      (manual && (env.GITHUB_REF !== "refs/heads/build/p0-abs-fiscal-universal" ||
        !validSha(env.GITHUB_SHA))) ||
      env.GITHUB_REPOSITORY !== REPO ||
      env.INPUT_PREAUDIT_PR !== "690" ||
      !validSha(env.INPUT_PREAUDIT_HEAD) ||
      (!manual && !validSha(env.INPUT_PREAUDIT_BASE)) || !token)
    throw Error("precert exige PR #690 ou despacho autenticado no HEAD da branch, token read-only");
  const number = 690, head = env.INPUT_PREAUDIT_HEAD;
  if (manual && head !== env.GITHUB_SHA)
    throw Error("despacho nao coincide com checkout HEAD da branch");
  const [pr, main, files, comments, reviews, checks] = await Promise.all([
    api("/repos/" + REPO + "/pulls/" + number),
    api("/repos/" + REPO + "/git/ref/heads/main"),
    list("/repos/" + REPO + "/pulls/" + number + "/files"),
    list("/repos/" + REPO + "/issues/" + number + "/comments"),
    list("/repos/" + REPO + "/pulls/" + number + "/reviews"),
    api("/repos/" + REPO + "/commits/" + head + "/check-runs?per_page=100"),
  ]);
  const base = manual ? pr?.base?.sha : env.INPUT_PREAUDIT_BASE;
  if (!validSha(base)) throw Error("base PR nao autenticada no despacho");
  if (!Array.isArray(files) || !Array.isArray(comments) || !Array.isArray(reviews) ||
      !Array.isArray(checks?.check_runs) || checks.total_count !== checks.check_runs.length)
    throw Error("API de diff/parecer/checks incompleta");
  const latest = comments.filter(x => x?.user?.login === "contaos9999" &&
    typeof x.body === "string" && x.body.includes(ASSISTANT_PREAUDIT_MARKER))
    .sort((a,b) => a.id - b.id).at(-1);
  const record = parseAssistantPreaudit(latest?.body);
  // Do not hammer Actions/Jobs/Artifacts while Teste C or the current
  // structured receipt is not ready. This early result NEVER releases.
  const requiredNow=[...PRECERT_REQUIRED_CHECKS,ADVERSARIAL_V2_CHECK_NAME];
  const readiness=requiredNow.map(name=>classifyPrecertReadiness(checks.check_runs,name,head));
  const terminal=readiness.filter(x=>x.state==="TERMINAL");
  const pending=readiness.filter(x=>x.state==="PENDING");
  if(terminal.length||pending.length||record?.head!==head||record?.base!==base||
      record?.verdict!=="PASS"){
    const missingRecord=!record||record.head!==head||record.base!==base;
    const rejectedRecord=!missingRecord&&record.verdict!=="PASS";
    return {pass:false,verdict:"BLOCKED",release:"NO_GO",head,base,
      waitable:terminal.length===0&&!rejectedRecord&&(pending.length>0||missingRecord),
      issues:[
        ...terminal.map(x=>"FALHA_TERMINAL: "+x.name+": "+x.reason),
        ...pending.map(x=>"PENDENTE: "+x.name+": "+x.reason),
        ...(record?.head!==head||record?.base!==base||record?.verdict!=="PASS"?
          ["parecer estruturado V2 no HEAD/base atual ainda nao disponivel"]:[]),
      ]};
  }
  const redIds = Array.isArray(record?.adversarial_v2?.red_runs) &&
    record.adversarial_v2.red_runs.length <= 10 &&
    record.adversarial_v2.red_runs.every(x=>Number.isSafeInteger(x)&&x>0)
    ? record.adversarial_v2.red_runs : [];
  const redProvenance = await Promise.all(redIds.map(async id=>{
    const [run,jobs] = await Promise.all([
      api("/repos/" + REPO + "/actions/runs/" + id),
      api("/repos/" + REPO + "/actions/runs/" + id + "/jobs?per_page=100"),
    ]);
    return {run,jobs};
  }));
  const v2Check=latestPrecertCheck(checks.check_runs,ADVERSARIAL_V2_CHECK_NAME,head);
  const v2Job=v2Check?
    await api("/repos/" + REPO + "/actions/jobs/" + v2Check.id):null;
  const receiptJobId=record?.adversarial_v2?.red_cases?.[0]?.job_id;
  const receiptV2Job=Number.isSafeInteger(receiptJobId) && receiptJobId>0 ?
    (receiptJobId===v2Check?.id?v2Job:
      await api("/repos/" + REPO + "/actions/jobs/" + receiptJobId)):null;
  // Rerun replaces a historic check-run in the commit listing. Locate the
  // old authenticated job in its real Actions attempt, never by its title.
  let historicalV2Run=null,historicalV2AttemptJobs=null,historicalV2Attempt=null;
  if(receiptV2Job && !checks.check_runs.some(x=>x.id===receiptV2Job.id)){
    historicalV2Run=await api("/repos/"+REPO+"/actions/runs/"+receiptV2Job.run_id);
    const count=historicalV2Run?.run_attempt;
    if(!Number.isSafeInteger(count)||count<1||count>20)
      throw Error("historical V2 run attempts outside auditable limit");
    for(let i=1;i<=count;i++){
      const candidate=await api("/repos/"+REPO+"/actions/runs/"+
        receiptV2Job.run_id+"/attempts/"+i+"/jobs?per_page=100");
      if(!Array.isArray(candidate?.jobs) ||
          candidate.total_count!==candidate.jobs.length)
        throw Error("historical V2 attempts incomplete");
      if(candidate.jobs.some(x=>x.id===receiptV2Job.id)){
        if(historicalV2Attempt!==null)
          throw Error("historical V2 job exists in multiple attempts");
        historicalV2Attempt=i;
        historicalV2AttemptJobs=candidate;
      }
    }
  }
  const artifact = Number.isSafeInteger(record?.artifact?.id) &&
    record.artifact.id > 0 ?
    await api("/repos/" + REPO + "/actions/artifacts/" + record.artifact.id) : null;
  const runId = record?.artifact?.run_id;
  const jobId = record?.artifact?.job_id;
  const testCJob = Number.isSafeInteger(runId) && runId > 0 &&
    Number.isSafeInteger(jobId) && jobId > 0 ?
    await api("/repos/" + REPO + "/actions/jobs/" + jobId) : null;
  const attempt = record?.artifact?.run_attempt;
  const [testCRun, testCAttemptJobs] = Number.isSafeInteger(runId) && runId > 0 &&
    Number.isSafeInteger(attempt) && attempt > 0 ?
    await Promise.all([
      api("/repos/" + REPO + "/actions/runs/" + runId),
      api("/repos/" + REPO + "/actions/runs/" + runId + "/attempts/" + attempt + "/jobs?per_page=100"),
    ]) : [null, null];
  const manifest = baseManifest(base);
  // Original and destination paths of renamed files must both be authorized.
  const paths = files.flatMap(x => x?.status === "renamed" ?
    [x.previous_filename, x.filename] : [x?.filename]);
  const result = validateAssistantPrecertRelease({
    pr, currentMain: main?.object?.sha, manifest, paths,
    comments, reviews, checkRuns: checks.check_runs, artifact, testCJob, testCRun,
    testCAttemptJobs, v2Job, receiptV2Job, redProvenance,
    historicalV2Run,historicalV2AttemptJobs,historicalV2Attempt,
    expectedHead: head, expectedBase: base,
  });
  // Fail closed if the PR advances between check collection and decision.
  const [latestPr, latestMain, latestComments, latestReviews, latestChecks,
    latestArtifact] = await Promise.all([
    api("/repos/" + REPO + "/pulls/" + number),
    api("/repos/" + REPO + "/git/ref/heads/main"),
    list("/repos/" + REPO + "/issues/" + number + "/comments"),
    list("/repos/" + REPO + "/pulls/" + number + "/reviews"),
    api("/repos/" + REPO + "/commits/" + head + "/check-runs?per_page=100"),
    Number.isSafeInteger(artifact?.id) && artifact.id > 0
      ? api("/repos/" + REPO + "/actions/artifacts/" + artifact.id) : Promise.resolve(null),
  ]);
  if (latestPr?.head?.sha !== head || latestPr?.base?.sha !== base ||
      latestPr?.state !== pr?.state ||
      latestPr?.draft !== pr?.draft || latestPr?.draft !== false ||
      latestPr?.merged !== pr?.merged ||
      latestMain?.object?.sha !== base ||
      !latestArtifact || latestArtifact.id !== artifact?.id ||
      latestArtifact.expired !== false ||
      latestArtifact.digest !== artifact?.digest ||
      latestArtifact.name !== artifact?.name ||
      latestArtifact.workflow_run?.id !== artifact?.workflow_run?.id ||
      latestArtifact.workflow_run?.head_sha !== head ||
      JSON.stringify(latestComments) !== JSON.stringify(comments) ||
      JSON.stringify(latestReviews) !== JSON.stringify(reviews) ||
      latestChecks?.total_count !== latestChecks?.check_runs?.length ||
      JSON.stringify(latestChecks?.check_runs) !== JSON.stringify(checks.check_runs))
    result.issues.push("HEAD/base/parecer/checks changed during pre-cert readback");

  // Authenticate producer workflow, event and exact attempt for EVERY required
  // check, including Windows (previously authenticated only by its name).
  if(result.issues.length===0){
    const selectedChecks=[...new Set([...PRECERT_REQUIRED_CHECKS,
      ADVERSARIAL_V2_CHECK_NAME,"Controlador offline Windows"])]
      .map(name=>latestPrecertCheck(checks.check_runs,name,head));
    const oldV2Check=checks.check_runs.find(x=>x.id===receiptV2Job?.id &&
      x.name===ADVERSARIAL_V2_CHECK_NAME);
    if(!oldV2Check && !verifyHistoricalV2JobProvenance({
      job:receiptV2Job,run:historicalV2Run,
      attemptJobs:historicalV2AttemptJobs,
      attempt:historicalV2Attempt,head,base,
    }))result.issues.push("ORIGIN: recibo V2 historico sem run/attempt autenticado");
    const originPairs=[
      ...selectedChecks.map(check=>({check,job:
        check?.id===v2Job?.id?v2Job:
        check?.id===testCJob?.id?testCJob:null})),
      ...(oldV2Check?[{check:oldV2Check,job:receiptV2Job}]:[]),
    ];
    for(const entry of originPairs){
      if(!entry.check){result.issues.push("ORIGIN: check selecionado ausente");continue;}
      try{
        const match=/\/actions\/runs\/([1-9][0-9]*)\/job\//.exec(entry.check.details_url||"");
        if(!match)throw Error("URL nao vinculada ao GitHub Actions");
        const runId=Number(match[1]);
        let valid=false;
        if(originVerify){
          // Fixture-only dependency injection. Production never supplies this.
          valid=await originVerify({check:entry.check,head,base,
            workflow:PRECERT_WORKFLOW_ORIGINS[entry.check.name]});
        }else{
          const job=entry.job??await api("/repos/"+REPO+"/actions/jobs/"+entry.check.id);
          const run=await api("/repos/"+REPO+"/actions/runs/"+runId);
          const aj=await api("/repos/"+REPO+"/actions/runs/"+runId+
            "/attempts/"+run?.run_attempt+"/jobs?per_page=100");
          valid=verifyPrecertRunOrigin({check:entry.check,job,run,
            attemptJobs:aj,head,base,workflow:PRECERT_WORKFLOW_ORIGINS[entry.check.name]});
        }
        if(!valid)
          result.issues.push("ORIGIN: job/run/attempt/workflow/event/HEAD invalido: "+entry.check.name);
      }catch(e){result.issues.push("ORIGIN: prova indisponivel para "+
        entry.check.name+": "+e.message);}
    }
  }
  // The final check is about the actual BYTES, not GitHub artifact metadata.
  // Execute only after all other conditions and final readback are satisfied.
  if(result.issues.length===0){
    try{
      const zip=await zipDigest(artifact.id);
      if(zip?.digest!==artifact.digest || !Number.isSafeInteger(zip.bytes) || zip.bytes<100)
        result.issues.push("ZIP: bytes/digest nao coincidem com artefato do GitHub");
    }catch(e){result.issues.push("ZIP: download/readback falhou: "+e.message);}
  }

  // ZIP download can outlast the preceding readback. Revoke on any change
  // occurring WHILE bytes are read or producer-run provenance is collected.
  // This is the actual last read of the authorization surface.
  if(result.issues.length===0){
    try{
      const [endPr,endMain,endComments,endReviews,endChecks,endArtifact]=await Promise.all([
        api("/repos/"+REPO+"/pulls/"+number),
        api("/repos/"+REPO+"/git/ref/heads/main"),
        list("/repos/"+REPO+"/issues/"+number+"/comments"),
        list("/repos/"+REPO+"/pulls/"+number+"/reviews"),
        api("/repos/"+REPO+"/commits/"+head+"/check-runs?per_page=100"),
        api("/repos/"+REPO+"/actions/artifacts/"+artifact.id),
      ]);
      if(endPr?.head?.sha!==head || endPr?.base?.sha!==base ||
          endPr.state!==pr.state || endPr.draft!==false ||
          endPr.merged!==false || endMain?.object?.sha!==base ||
          JSON.stringify(endComments)!==JSON.stringify(comments) ||
          JSON.stringify(endReviews)!==JSON.stringify(reviews) ||
          endChecks?.total_count!==endChecks?.check_runs?.length ||
          JSON.stringify(endChecks?.check_runs)!==JSON.stringify(checks.check_runs) ||
          endArtifact?.id!==artifact.id || endArtifact?.expired!==false ||
          endArtifact?.digest!==artifact.digest ||
          endArtifact?.name!==artifact.name ||
          endArtifact?.workflow_run?.id!==artifact.workflow_run?.id ||
          endArtifact?.workflow_run?.head_sha!==head)
        result.issues.push("POST_ZIP_READBACK: autorizacao/revisoes/checks/artefato mudaram durante prova");
    }catch(e){
      result.issues.push("POST_ZIP_READBACK: prova GitHub indisponivel: "+e.message);
    }
  }

  result.pass = result.issues.length === 0;
  result.waitable = false; // all post-preflight failures are terminal
  result.verdict = result.pass ? "PASS" : "BLOCKED";
  result.release = result.pass ? "PRE_CERTIFICATION_ONLY" : "NO_GO";
  return result;
}

function changes() {
  const prior = String(process.env.FRONTEND_DIFF_BASE || "").trim();
  const event = String(process.env.GITHUB_EVENT_NAME || "");
  if (event === "workflow_dispatch" && !prior)
    throw new Error("workflow manual sem base de diff verificável.");
  let base = prior && !/^0+$/.test(prior) ? prior : git("rev-parse", "HEAD^");
  const eventBase = base;
  let head = "HEAD";
  if (event === "pull_request") {
    try { head = git("rev-parse", "HEAD^2"); } catch { head = "HEAD"; }
    base = git("merge-base", base, head);
  }
  return { base, eventBase, head, changed: git("diff", "--name-only", "--diff-filter=ACMRTD", base, head).split("\n").filter(Boolean) };
}
export function classifyGithubReadError(status, headers, path) {
  const get=(name)=>headers?.get?.(name) ?? null;
  const remaining=get("x-ratelimit-remaining") ?? "unknown";
  const reset=get("x-ratelimit-reset") ?? "none";
  const retry=get("retry-after") ?? "none";
  const requestId=get("x-github-request-id") ?? "unknown";
  const rateLimited=(status===403 || status===429) && remaining==="0" &&
    /^\d{10}$/.test(String(reset));
  return {
    rateLimited, status, remaining, reset_at:reset,
    message:"GitHub HTTP "+status+" on "+path+" remaining="+remaining+
      " reset-at="+reset+" retry-after="+retry+" request-id="+requestId,
  };
}
async function http(path, token, raw = false) {
  if (!token) throw new Error("token de leitura indisponível.");
  const res = await fetch("https://api.github.com" + path, {
    headers: { Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json", "User-Agent": "ContaOS-P0-RCA" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    // Authenticated API denial is never a PASS. Report only fixed endpoint
    // and standard rate-limit headers; never expose bearer token or body.
    const diagnosis=classifyGithubReadError(res.status,res.headers,path);
    throw new Error(diagnosis.message);
  }
  return raw ? res.text() : res.json();
}
async function main() {
  let base, eventBase, head, changed, plan, previous, report = null;
  try {
    ({ base, eventBase, head, changed } = changes());
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
    // The immutable protected PLAN manifest must be guarded at the earliest
    // pre-merge event, before PR resolution or a potential documentary N/A.
    fullPaths = fullDiffPaths(base, head);
    assertImmutableP0Governance(fullPaths, event);
    const resolved = await resolvePrContext(event, base, head, changed, githubToken, eventBase);
    prNumber = resolved.number;
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
        if (!governancePlan ||
            governancePlan.schema !== "contaos.p0.gov-plan.v1" ||
            governancePlan.full_diff !== true ||
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
        const raw = execFileSync("git",
          ["diff", "--raw", "-z", "--find-renames", "--diff-filter=ACMRTD", base, head],
          {encoding: "utf8", timeout: 20000});
        verifyRawFullDiffModes(raw, fullPaths);
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
  fileURLToPath(new URL("file://" + process.argv[1]))) {
  if (process.argv.includes("--audit-semantic-inventory")) {
    try{
      const base=process.env.INPUT_PREAUDIT_BASE||git("rev-parse","origin/main");
      if(!validSha(base))throw Error("invalid protected base SHA");
      const sources=Object.fromEntries(Object.keys(PROTECTED_SEMANTIC_SOURCES)
        .map(path=>[path,{content:execFileSync("git",["show",base+":"+path],{encoding:"utf8"}),
          blob:git("rev-parse",base+":"+path)}]));
      const inventory=inventoryProtectedSemanticLines(sources);
      const result={schema:inventory.schema,head:git("rev-parse","HEAD"),
        protected_base:base,source_count:inventory.source_count,
        anchored_lines:inventory.lines.length,
        anchors:inventory.lines.map(({id,path,blob,line,text_sha256})=>
          ({id,path,blob,line,text_sha256})),
        issues:inventory.issues,source_verified:inventory.inventory_verified,
        axis_backlog:buildSevenAxisSemanticBacklog(inventory),
        sentence_candidates:inventorySemanticSentenceCandidates(inventory),
        reverse_coverage:auditSemanticReverseCoverage(inventory,buildSevenAxisSemanticBacklog(inventory)),
        semantic_release_gate:await assessSemanticCompletenessGate({inventory,
          worklist:buildSevenAxisSemanticBacklog(inventory),
          sentenceInventory:inventorySemanticSentenceCandidates(inventory),
          reverseCoverage:auditSemanticReverseCoverage(inventory,buildSevenAxisSemanticBacklog(inventory)),
          head:git("rev-parse","HEAD")}),
        semantic_completeness:"INCONCLUSIVE",release:"NO_GO"};
      console.log(JSON.stringify(result));
      if(!result.source_verified)process.exitCode=1;
    }catch(e){console.error("SEMANTIC_SOURCE_INVENTORY FAIL: "+e.message);
      process.exitCode=1;}
  } else if (process.argv.includes("--audit-full-protocol")) {
    try{
      const audit=fullProtocolAuditFromCheckout();
      console.log(JSON.stringify(audit));
      if(audit.verdict!=="EXECUTED_PASS_FOR_BUILD_ONLY")process.exitCode=1;
    }catch(e){console.error("P0 FULL_PROTOCOL BLOCKED: "+e.message);process.exitCode=1;}
  } else if (process.argv.includes("--verify-assistant-preaudit")) {
    verifyAssistantPrecertInGithub().then(result => {
      console.log(JSON.stringify(result));
      if (!result.pass) process.exitCode = 1;
    }).catch(error => {
      console.error("P0 ASSISTANT PREAUDIT BLOCKED: " + error.message);
      process.exitCode = 1;
    });
  } else main();
}

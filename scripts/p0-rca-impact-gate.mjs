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
export const ASSISTANT_PREAUDIT_MARKER = "CONTAOS_ASSISTANT_PREAUDIT_V1";
export const ASSISTANT_PREAUDIT_CRITERIA = Object.freeze([
  "scope_and_manifest", "root_causes", "event_provenance",
  "negative_tests", "regression_integration", "security_boundaries",
  "check_and_artifact_provenance", "limitations_and_next_gates",
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
export function parseAssistantPreaudit(body) {
  if (typeof body !== "string") return null;
  const re = new RegExp("<!-- " + ASSISTANT_PREAUDIT_MARKER + "\\s*\\n([\\s\\S]*?)\\n-->", "g");
  const items = [...body.matchAll(re)];
  if (items.length !== 1) return null;
  try { return JSON.parse(items[0][1]); }
  catch { return null; }
}
export function validateAssistantPrecertRelease({
  pr, currentMain, manifest, paths, comments, checkRuns, artifact,
  testCJob, expectedHead, expectedBase,
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
  for (const name of PRECERT_REQUIRED_CHECKS) {
    const list = Array.isArray(checkRuns) ? checkRuns.filter(x => x?.name === name) : [];
    if (list.length !== 1 || list[0]?.head_sha !== expectedHead ||
        list[0]?.app?.id !== PRECERT_ISSUER ||
        list[0]?.status !== "completed" || list[0]?.conclusion !== "success" ||
        !Number.isSafeInteger(list[0]?.id) || list[0].id <= 0)
      add("check exigido ausente, repetido, sem sucesso ou origem: " + name);
  }
  const history = Array.isArray(comments) ? comments
    .filter(x => x?.user?.login === "contaos9999" &&
      typeof x.body === "string" && x.body.includes(ASSISTANT_PREAUDIT_MARKER))
    .sort((a,b) => a.id - b.id) : [];
  const last = history.at(-1);
  const record = parseAssistantPreaudit(last?.body);
  if (!last || !record) add("parecer do assistente ausente/inválido na PR");
  else {
    if (record.schema !== "contaos.assistant-preaudit.v1" ||
        record.kind !== "ASSISTANT_PREAUDIT_NOT_INDEPENDENT" ||
        record.verdict !== "PASS" || record.pr !== 690 ||
        record.head !== expectedHead || record.base !== expectedBase ||
        !/^PA-690-[A-Za-z0-9.-]+$/.test(record.run_id || "") ||
        typeof record.report !== "string" || record.report.length < 400 ||
        !/^[0-9a-f]{64}$/.test(record.report_sha256 || "") ||
        record.report_sha256 !== preauditHash(record.report) ||
        !ASSISTANT_PREAUDIT_CRITERIA.every(x => record.criteria?.[x] === "PASS"))
      add("último parecer não é PASS íntegro no HEAD/base e matriz completos");
    if (!record.artifact || !Number.isSafeInteger(record.artifact.id) ||
        record.artifact.id <= 0 || !/^sha256:[0-9a-f]{64}$/.test(record.artifact.digest || ""))
      add("parecer sem recibo de artefato visual");
    else {
      const testC = checkRuns?.find(x =>
        x?.name === "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente");
      const runId = record.artifact.run_id;
      const attempt = record.artifact.run_attempt;
      const jobId = record.artifact.job_id;
      if (record.artifact.id !== artifact?.id ||
          record.artifact.digest !== artifact?.digest ||
          artifact?.expired === true ||
          artifact?.workflow_run?.head_sha !== expectedHead ||
          !Number.isSafeInteger(runId) || runId <= 0 ||
          !Number.isSafeInteger(attempt) || attempt <= 0 ||
          !Number.isSafeInteger(jobId) || jobId <= 0 ||
          artifact?.workflow_run?.id !== runId ||
          testCJob?.id !== jobId ||
          testCJob?.run_id !== runId ||
          testCJob?.run_attempt !== attempt ||
          testCJob?.head_sha !== expectedHead ||
          testCJob?.status !== "completed" ||
          testCJob?.conclusion !== "success" ||
          !Array.isArray(testCJob?.steps) ||
          !testCJob.steps.some(x => x?.conclusion === "success" &&
            /playwright|teste c/i.test(x?.name || "")) ||
          !testC?.details_url?.includes("/actions/runs/" + runId + "/") ||
          !testC?.details_url?.endsWith("/job/" + jobId))
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
  baseManifest = (base) => JSON.parse(execFileSync("git", [
    "show", base + ":docs/frontend/planos/P0_GOV_PLAN_690.json",
  ], {encoding: "utf8", timeout: 15000})),
} = {}) {
  if (env.GITHUB_EVENT_NAME !== "pull_request" ||
      env.GITHUB_REPOSITORY !== REPO ||
      env.INPUT_PREAUDIT_PR !== "690" ||
      !validSha(env.INPUT_PREAUDIT_HEAD) ||
      !validSha(env.INPUT_PREAUDIT_BASE) || !token)
    throw Error("precert exige evento PR #690, HEAD/base e token de leitura");
  const number = 690, head = env.INPUT_PREAUDIT_HEAD, base = env.INPUT_PREAUDIT_BASE;
  const [pr, main, files, comments, checks] = await Promise.all([
    api("/repos/" + REPO + "/pulls/" + number),
    api("/repos/" + REPO + "/git/ref/heads/main"),
    list("/repos/" + REPO + "/pulls/" + number + "/files"),
    list("/repos/" + REPO + "/issues/" + number + "/comments"),
    api("/repos/" + REPO + "/commits/" + head + "/check-runs?per_page=100"),
  ]);
  if (!Array.isArray(files) || !Array.isArray(comments) ||
      !Array.isArray(checks?.check_runs) || checks.total_count !== checks.check_runs.length)
    throw Error("API de diff/parecer/checks incompleta");
  const latest = comments.filter(x => x?.user?.login === "contaos9999" &&
    typeof x.body === "string" && x.body.includes(ASSISTANT_PREAUDIT_MARKER))
    .sort((a,b) => a.id - b.id).at(-1);
  const record = parseAssistantPreaudit(latest?.body);
  const artifact = Number.isSafeInteger(record?.artifact?.id) &&
    record.artifact.id > 0 ?
    await api("/repos/" + REPO + "/actions/artifacts/" + record.artifact.id) : null;
  const runId = record?.artifact?.run_id;
  const jobId = record?.artifact?.job_id;
  const testCJob = Number.isSafeInteger(runId) && runId > 0 &&
    Number.isSafeInteger(jobId) && jobId > 0 ?
    await api("/repos/" + REPO + "/actions/jobs/" + jobId) : null;
  const manifest = baseManifest(base);
  // Original and destination paths of renamed files must both be authorized.
  const paths = files.flatMap(x => x?.status === "renamed" ?
    [x.previous_filename, x.filename] : [x?.filename]);
  const result = validateAssistantPrecertRelease({
    pr, currentMain: main?.object?.sha, manifest, paths,
    comments, checkRuns: checks.check_runs, artifact, testCJob,
    expectedHead: head, expectedBase: base,
  });
  // Fail closed if the PR advances between check collection and decision.
  const [latestPr, latestMain, latestComments, latestChecks] = await Promise.all([
    api("/repos/" + REPO + "/pulls/" + number),
    api("/repos/" + REPO + "/git/ref/heads/main"),
    list("/repos/" + REPO + "/issues/" + number + "/comments"),
    api("/repos/" + REPO + "/commits/" + head + "/check-runs?per_page=100"),
  ]);
  if (latestPr?.head?.sha !== head || latestPr?.base?.sha !== base ||
      latestPr?.state !== pr?.state ||
      latestMain?.object?.sha !== base ||
      JSON.stringify(latestComments) !== JSON.stringify(comments) ||
      latestChecks?.total_count !== latestChecks?.check_runs?.length ||
      JSON.stringify(latestChecks?.check_runs) !== JSON.stringify(checks.check_runs))
    result.issues.push("HEAD/base/parecer/checks changed during pre-cert readback");
  result.pass = result.issues.length === 0;
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
  if (process.argv.includes("--verify-assistant-preaudit")) {
    verifyAssistantPrecertInGithub().then(result => {
      console.log(JSON.stringify(result));
      if (!result.pass) process.exitCode = 1;
    }).catch(error => {
      console.error("P0 ASSISTANT PREAUDIT BLOCKED: " + error.message);
      process.exitCode = 1;
    });
  } else main();
}

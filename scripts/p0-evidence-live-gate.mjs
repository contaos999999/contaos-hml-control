import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export const P0_MANIFEST = "docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json";
const REPO = "contaos999999/contaos-hml-control";
const sha40 = (x) => typeof x === "string" && /^[0-9a-f]{40}$/.test(x);
const sha256 = (x) => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
const reviewRef = (x) => {
  const m = /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/pull\/([1-9]\d*)#pullrequestreview-([1-9]\d*)$/.exec(x || "");
  return m ? { pr: Number(m[1]), id: Number(m[2]) } : null;
};
const ciRef = (x) => {
  const m = /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/actions\/runs\/([1-9]\d*)$/.exec(x || "");
  return m ? Number(m[1]) : null;
};
const securePath = (path, prefix) =>
  typeof path === "string" &&
  path.startsWith(prefix) &&
  /^docs\/frontend\/auditorias\/[a-zA-Z0-9_./-]+$/.test(path) &&
  !path.split("/").includes("..");

function itemsFor(m) {
  const items = [];
  const links = m?.controle?.integracao_por_versao || {};
  for (let n = 1; n <= 5; n++) {
    const version = "V" + n;
    for (const kind of n === 1 ? ["interna"] : ["interna", "cumulativa"]) {
      const receipt = links[version]?.[kind];
      if (receipt?.status === "PASS") items.push({ version, kind, receipt });
    }
    // V1 funcional é legado certificado em protocolo anterior. Para V2+,
    // exigir proveniência REST de cada certificado funcional novo.
    if (n > 1 && m?.controle?.certificados_por_versao?.[version]?.status === "PASS")
      items.push({ version, kind: "funcional", receipt: m.controle.certificados_por_versao[version] });
  }
  return items;
}

export async function verifyEvidenceLive(m, { apiGet, readBytes, fileExists } = {}) {
  const errors = [];
  const checks = [];
  const fail = (msg) => errors.push("P0 LIVE: " + msg);
  const items = itemsFor(m);
  if (!items.length) return { errors, checks, checked: 0 };
  if (typeof apiGet !== "function") return { errors: ["P0 LIVE: serviço GitHub autenticado indisponível."], checks, checked: 0 };
  const read = readBytes || ((path) => readFileSync(path));
  const exists = fileExists || existsSync;
  const apiCache = new Map();
  const get = async (path) => {
    if (!apiCache.has(path))
      apiCache.set(path, Promise.resolve().then(() => apiGet(path)));
    return apiCache.get(path);
  };

  async function shaPath(path, expected, prefix, label) {
    if (!securePath(path, prefix) || !sha256(expected) || !exists(path)) {
      fail(label + ": arquivo/hash/escopo inexistente ou inválido.");
      return;
    }
    try {
      const actual = createHash("sha256").update(read(path)).digest("hex");
      if (actual !== expected) fail(label + ": SHA256 diferente do conteúdo versionado.");
    } catch {
      fail(label + ": não foi possível inspecionar arquivo.");
    }
  }

  async function getReviews(prNum) {
    const reviews = [];
    for (let page = 1; page <= 5; page++) {
      const chunk = await get("/pulls/" + prNum + "/reviews?per_page=100&page=" + page);
      if (!Array.isArray(chunk)) throw new Error("Reviews inválidas.");
      reviews.push(...chunk);
      if (chunk.length < 100) return reviews;
    }
    throw new Error("Reviews incompletas por paginação.");
  }

  async function authenticate(rec, label, sourceFiles, finalCertificate = false, scope = null) {
    const rr = reviewRef(rec?.revisao_independente_url);
    const runId = ciRef(rec?.ci_url);
    if (!rr || !runId || !sha40(rec?.pr_merge_sha)) {
      fail(label + ": revisão, CI ou SHA de merge sem identificadores válidos.");
      return;
    }
    try {
      const [pr, run, reviews] = await Promise.all([
        get("/pulls/" + rr.pr), get("/actions/runs/" + runId), getReviews(rr.pr),
      ]);
      if (!pr || pr.merged_at == null || pr.base?.ref !== "main" ||
          pr.merge_commit_sha !== rec.pr_merge_sha || !sha40(pr.head?.sha)) {
        fail(label + ": PR não integrada à main ou SHA de merge não corresponde.");
        return;
      }
      const review = reviews.find((r) => r.id === rr.id);
      if (!review || review.state !== "APPROVED" ||
          !review.user?.login || review.user.login === pr.user?.login ||
          review.commit_id !== pr.head.sha ||
          (review.submitted_at && pr.merged_at && review.submitted_at > pr.merged_at)) {
        fail(label + ": review não é APPROVED independente no HEAD integrado.");
        return;
      }
      const latest = reviews.filter((r) => r.user?.login === review.user.login &&
        r.submitted_at && review.submitted_at && r.submitted_at > review.submitted_at);
      if (latest.some((r) => r.state === "CHANGES_REQUESTED" || r.state === "DISMISSED")) {
        fail(label + ": revisão foi substituída/rejeitada posteriormente.");
        return;
      }
      if (run?.name !== "ContaOS Frontend Zero-Drift" ||
          run?.conclusion !== "success" ||
          ![pr.head.sha, pr.merge_commit_sha].includes(run.head_sha)) {
        fail(label + ": execução Zero-Drift não está SUCCESS no SHA do PR.");
        return;
      }
      // Vincular a prova ao conteúdo realmente existente no SHA aprovado.
      // Arquivo criado somente depois do PR autenticado não constitui prova.
      for (const source of sourceFiles) {
        try {
          const remote = await get("/contents/" + source.path +
            "?ref=" + pr.head.sha);
          if (remote?.encoding !== "base64" || !remote.content ||
              !sha256(source.hash) ||
              createHash("sha256").update(Buffer.from(remote.content, "base64"))
                .digest("hex") !== source.hash) {
            fail(label + ": fonte não coincide com o SHA do PR revisado: " + source.path);
            return;
          }
        } catch {
          fail(label + ": fonte inexistente no HEAD aprovado: " + source.path);
          return;
        }
      }
      const [jobs, ancestry] = await Promise.all([
        get("/actions/runs/" + runId + "/jobs?per_page=100"),
        get("/compare/" + rec.pr_merge_sha + "...main"),
      ]);
      if (!["ahead", "identical"].includes(ancestry?.status)) {
        fail(label + ": commit de merge não é ancestral da main.");
        return;
      }
      const list = jobs?.jobs || [];
      if (jobs?.total_count > 100 ||
          !list.some((j) => j.name === "ContaOS Frontend Zero-Drift" && j.conclusion === "success") ||
          !list.some((j) => j.name.includes("Auditoria de navegador independente") && j.conclusion === "success")) {
        fail(label + ": jobs Zero-Drift e Teste C não comprovados como SUCCESS.");
        return;
      }
      if (finalCertificate) {
        // Teste C de mera documentação é N/A e NÃO comprova integração.
        // Usar a própria execução do PR quando ela realmente executou
        // Playwright, ou uma workflow_dispatch independente no mesmo SHA.
        const visualId = ciRef(rec.teste_c_run_url || rec.ci_url);
        if (!visualId) {
          fail(label + ": certificado final sem execução visual Teste C identificada.");
          return;
        }
        const visualRun = await get("/actions/runs/" + visualId);
        const visualJobs = await get("/actions/runs/" + visualId + "/jobs?per_page=100");
        const artifacts = await get("/actions/runs/" + visualId + "/artifacts?per_page=100");
        const sameSha = visualRun?.head_sha === pr.head.sha ||
          visualRun?.head_sha === pr.merge_commit_sha;
        const visualJob = (visualJobs?.jobs || []).find((j) =>
          j.name.includes("Teste C Independente") && j.conclusion === "success");
        const step = (needle) => (visualJob?.steps || []).some((s) =>
          s.name.startsWith(needle) && s.conclusion === "success");
        const actual = (artifacts?.artifacts || []).some((a) =>
          /^contaos-teste-c-\d+-\d+$/.test(a.name || "") &&
          a.expired === false && a.size_in_bytes > 0);
        if (!sameSha || visualRun.conclusion !== "success" ||
            !["ContaOS Frontend Zero-Drift", "ContaOS Teste C Independente"].includes(visualRun.name) ||
            visualJobs?.total_count > 100 || artifacts?.total_count > 100 ||
            !visualJob || !step("Teste C Playwright") ||
            !step("Evidencia permanente de screenshots") ||
            !step("Confirmar que nenhuma fonte versionada foi editada") ||
            !actual) {
          fail(label + ": Teste C visual/E2E SKIPPED, SHA divergente ou artefatos não comprovados.");
          return;
        }
        const e2e = rec.hml_e2e;
        const hmlId = ciRef(e2e?.run_url);
        // Uma auditoria visual Trilha A, mesmo SUCCESS, nao autentica
        // as jornadas funcionais internas/cumulativas de outras versoes.
        // Exigir jobs de caso e artefatos de um workflow especifico P0.
        const cases = e2e?.casos;
        const validCases = Array.isArray(cases) && cases.length > 0 &&
          cases.length <= 90 &&
          new Set(cases).size === cases.length &&
          cases.every((id) => typeof id === "string" &&
            /^[A-Z][A-Z0-9_-]{4,80}$/.test(id));
        if (e2e?.ambiente !== "HML_AUTENTICADO" ||
            e2e?.escopo !== scope ||
            !validCases || !hmlId || !sha40(e2e?.tested_sha)) {
          fail(label + ": certificado final sem casos e escopo HML autenticado específico da versão.");
          return;
        }
        const [hmlRun, hmlJobs, hmlArtifacts, hmlAncestry] = await Promise.all([
          get("/actions/runs/" + hmlId),
          get("/actions/runs/" + hmlId + "/jobs?per_page=100"),
          get("/actions/runs/" + hmlId + "/artifacts?per_page=100"),
          get("/compare/" + e2e.tested_sha + "..." + pr.head.sha),
        ]);
        // Nenhuma modificação funcional ou do executor após o run HML,
        // inclusive scripts não-HML que podem influenciar casos.
        const noCodeDrift = Array.isArray(hmlAncestry?.files) &&
          hmlAncestry.files.length < 300 &&
          hmlAncestry.files.every((f) =>
            !/^(src\/|public\/|scripts\/|\.github\/workflows\/|package\.json$|bun\.lock$|vite\.config\.ts$|tsconfig(?:\.[\w-]+)?\.json$)/.test(f.filename || ""));
        if (hmlRun?.name !== "ContaOS P0 Integracao Autenticada" ||
            hmlRun?.conclusion !== "success" ||
            hmlRun?.head_sha !== e2e.tested_sha ||
            hmlRun?.head_branch !== "main" ||
            !["ahead", "identical"].includes(hmlAncestry?.status) ||
            !noCodeDrift || hmlJobs?.total_count > 100 ||
            hmlArtifacts?.total_count > 100) {
          fail(label + ": HML integração não comprovada por workflow dedicado, SHA/contrato estáveis.");
          return;
        }
        const caseArtifacts = [];
        for (const caseId of cases) {
          const jobName = "P0 Integracao " + scope + " " + caseId;
          const job = (hmlJobs?.jobs || []).find((j) => j.name === jobName &&
            j.conclusion === "success");
          const caseStep = (job?.steps || []).some((step) =>
            step.name === "E2E autenticado: " + caseId && step.conclusion === "success");
          const artifactName = "p0-hml-" + scope.replace("/", "-") +
            "-" + caseId + "-" + hmlId;
          const artifact = (hmlArtifacts?.artifacts || []).find((a) =>
            a.name === artifactName && a.expired === false &&
            a.size_in_bytes > 0 && /^sha256:[a-f0-9]{64}$/.test(a.digest || ""));
          if (!caseStep || !artifact) {
            fail(label + ": caso HML " + caseId +
              " sem job/step E2E autenticado SUCCESS e artefato SHA256 do próprio escopo.");
            return;
          }
          caseArtifacts.push({
            id: caseId, job_name: jobName, artifact_name: artifactName,
            artifact_digest: artifact.digest,
          });
        }
        const root = rec.arquivo_evidencia.split("/fase")[0] + "/";
        const prefix = root + "fase" +
          (rec.arquivo_evidencia.includes("/fase8/") ? "8/" : "7/");
        await shaPath(e2e.arquivo_evidencia, e2e.arquivo_sha256,
          prefix, label + " HML E2E");
        let remoteHml;
        try {
          remoteHml = await get("/contents/" + e2e.arquivo_evidencia +
            "?ref=" + pr.head.sha);
        } catch {
          fail(label + ": HML E2E não existe no SHA aprovado.");
          return;
        }
        if (remoteHml?.encoding !== "base64" || !remoteHml.content ||
            createHash("sha256").update(Buffer.from(remoteHml.content, "base64"))
              .digest("hex") !== e2e.arquivo_sha256) {
          fail(label + ": HML E2E não existe no SHA aprovado ou hash diverge.");
          return;
        }
        // Prova por caso obrigatoriamente publicada e revisada na PR A.
        // Não aceitar IDs textuais sem vínculo com jobs e artefatos reais.
        let caseReport;
        try { caseReport = JSON.parse(read(e2e.arquivo_evidencia).toString("utf8")); }
        catch { fail(label + ": relatório HML por caso JSON inválido."); return; }
        if (caseReport?.schema !== "contaos.p0.hml-integration-e2e.v1" ||
            caseReport.escopo !== scope || caseReport.run_url !== e2e.run_url ||
            caseReport.tested_sha !== e2e.tested_sha ||
            JSON.stringify(caseReport.casos) !== JSON.stringify(cases) ||
            JSON.stringify(caseReport.artefatos) !== JSON.stringify(caseArtifacts)) {
          fail(label + ": relatório HML não está vinculado aos casos/jobs/artefatos GitHub reais.");
          return;
        }
      }
      checks.push({ label, pr: rr.pr, run: runId, sha: rec.pr_merge_sha, reviewer: review.user.login });
    } catch (e) {
      fail(label + ": falha de API GitHub, recibo não autenticado (" + String(e?.message || e).slice(0,120) + ").");
    }
  }

  for (const { version, kind, receipt } of items) {
    const label = version + "/" + kind;
    const root = "docs/frontend/auditorias/" + (kind === "interna"
      ? "integracao-funcional-" + version.toLowerCase()
      : kind === "cumulativa"
        ? "integracao-cumulativa-v1-" + version.toLowerCase()
        : "certificacao-funcional-" + version.toLowerCase()) + "/";
    const terminal = kind === "funcional" ? 8 : 7;
    const previous = terminal - 1;
    await shaPath(receipt.arquivo_evidencia, receipt.arquivo_sha256,
      root + "fase" + terminal + "/", label + " certificado final");
    await shaPath(receipt.matriz_arquivo, receipt.matriz_sha256, root, label + " matriz");
    await shaPath(receipt.grafo_arquivo, receipt.grafo_sha256, root, label + " grafo");
    const stages = receipt.fases_anteriores;
    if (!Array.isArray(stages) || stages.length !== previous) {
      fail(label + ": faltam " + previous + " recibos anteriores para o certificado final.");
      continue;
    }
    for (let phase = 1; phase <= previous; phase++) {
      const stage = stages.find((x) => x?.fase === phase);
      if (!stage || stages.filter((x) => x?.fase === phase).length !== 1) {
        fail(label + ": recibo único ausente da Fase " + phase + ".");
        continue;
      }
      await shaPath(stage.arquivo_evidencia, stage.arquivo_sha256,
        root + "fase" + phase + "/", label + " Fase " + phase);
      await authenticate(stage, label + " Fase " + phase, [{
        path: stage.arquivo_evidencia, hash: stage.arquivo_sha256,
      }]);
    }
    await authenticate(receipt, label + " Fase " + terminal, [
      { path: receipt.arquivo_evidencia, hash: receipt.arquivo_sha256 },
      { path: receipt.matriz_arquivo, hash: receipt.matriz_sha256 },
      { path: receipt.grafo_arquivo, hash: receipt.grafo_sha256 },
    ], true, version + "/" + kind);
  }
  return { errors, checks, checked: items.length };
}

async function githubGet(path, token) {
  if (!token) throw new Error("GITHUB_TOKEN sem permissão de leitura.");
  const url = "https://api.github.com/repos/" + REPO + path;
  const res = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ContaOS-P0-Live-Gate",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("GitHub REST HTTP " + res.status);
  return res.json();
}
async function main() {
  let m;
  try { m = JSON.parse(readFileSync(P0_MANIFEST, "utf8")); }
  catch (e) { console.error("P0 LIVE FAIL: manifesto inválido " + e.message); process.exitCode = 1; return; }
  const token = String(process.env.GITHUB_TOKEN || "");
  const result = await verifyEvidenceLive(m, { apiGet: (path) => githubGet(path, token) });
  if (result.errors.length) {
    result.errors.forEach((msg) => console.error(msg));
    process.exitCode = 1;
    return;
  }
  console.log("P0 LIVE PASS: " + result.checked +
    " certificados não legados validados em GitHub REST; casos PENDENTE não foram presumidos certificados.");
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
  fileURLToPath(new URL("file://" + process.argv[1]))) main();

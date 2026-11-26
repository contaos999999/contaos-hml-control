import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { verifyEvidenceLive, validateProdReadiness } from "./p0-evidence-live-gate.mjs";

const M = "a".repeat(40);
const H = "b".repeat(40);
const data = Buffer.from("evidência canônica de teste");
const digest = createHash("sha256").update(data).digest("hex");
const prefix = "docs/frontend/auditorias/integracao-funcional-v1/";
const review = "https://github.com/contaos999999/contaos-hml-control/pull/123#pullrequestreview-456";
const ci = "https://github.com/contaos999999/contaos-hml-control/actions/runs/789";
const receipt = (path) => ({
  arquivo_evidencia: path,
  arquivo_sha256: digest,
  pr_merge_sha: M,
  revisao_independente_url: review,
  ci_url: ci,
});
const fixture = () => {
  const files = new Map();
  const stages = [];
  for (let i = 1; i <= 6; i++) {
    const path = prefix + "fase" + i + "/CERTIFICADO.md";
    files.set(path, data);
    stages.push({ fase: i, ...receipt(path) });
  }
  const finalPath = prefix + "fase7/CERTIFICADO.md";
  const matrixPath = prefix + "fase1/MATRIZ.csv";
  const graphPath = prefix + "fase1/GRAFO.mmd";
  const hmlPath = prefix + "fase7/HML_E2E.md";
  for (const p of [finalPath, matrixPath, graphPath]) files.set(p, data);
  const finalReceipt = {
    status: "PASS", ...receipt(finalPath),
    matriz_arquivo: matrixPath,
    matriz_sha256: digest,
    grafo_arquivo: graphPath,
    grafo_sha256: digest,
    teste_c_run_url: ci,
    hml_e2e: {
      ambiente: "HML_AUTENTICADO",
      escopo: "V1/interna",
      arquivo_evidencia: hmlPath,
      arquivo_sha256: null,
      casos: ["HML-REAL-001"],
      run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/555",
      tested_sha:H,
    },
    fases_anteriores: stages,
  };
  const caseArtifact = {
    id:"HML-REAL-001",job_name:"P0 Integracao V1/interna HML-REAL-001",
    artifact_name:"p0-hml-V1-interna-HML-REAL-001-555",
    artifact_digest:"sha256:"+digest,
  };
  const caseReport = {
    schema:"contaos.p0.hml-integration-e2e.v1",
    escopo:"V1/interna",run_url:finalReceipt.hml_e2e.run_url,
    tested_sha:H,casos:["HML-REAL-001"],artefatos:[caseArtifact],
  };
  const hmlBytes=Buffer.from(JSON.stringify(caseReport));
  files.set(hmlPath,hmlBytes);
  finalReceipt.hml_e2e.arquivo_sha256=
    createHash("sha256").update(hmlBytes).digest("hex");
  const manifest = {
    controle: {
      certificados_por_versao: {},
      integracao_por_versao: { V1: { interna: finalReceipt } },
    },
  };
  const responses = {
    "/pulls/123": {
      number: 123, merged_at: "2026-11-14T12:00:00Z",
      base: { ref: "main" }, head: { sha: H },
      user: { login: "implementador" }, merge_commit_sha: M,
    },
    "/pulls/123/reviews?per_page=100&page=1": [{
      id: 456, state: "APPROVED", commit_id: H,
      user: { login: "auditor" }, submitted_at: "2026-11-14T11:00:00Z",
    }],
    "/actions/runs/789": {
      name: "ContaOS Frontend Zero-Drift", conclusion: "success",
      head_sha: H,
    },
    "/actions/runs/789/jobs?per_page=100": {
      total_count: 2,
      jobs: [
        { name: "ContaOS Frontend Zero-Drift", conclusion: "success" },
        { name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente", conclusion: "success",
          steps: [
            {name:"Detectar escopo de auditoria visual",conclusion:"success"},
            {name:"Teste C Playwright — 24 telas, 4 larguras, 2 temas",conclusion:"success"},
            {name:"Evidencia permanente de screenshots e SHA256SUMS",conclusion:"success"},
            {name:"Confirmar que nenhuma fonte versionada foi editada",conclusion:"success"},
          ] },
      ],
    },
    ["/compare/" + M + "...main"]: { status: "ahead" },
    ["/compare/" + H + "..." + H]: { status: "identical", files:[] },
    "/actions/runs/555": {
      name:"ContaOS P0 Integracao Autenticada",conclusion:"success",
      head_sha:H,head_branch:"main",
    },
    "/actions/runs/555/jobs?per_page=100": {
      total_count:1,jobs:[{
        name:"P0 Integracao V1/interna HML-REAL-001",conclusion:"success",
        steps:[
          {name:"E2E autenticado: HML-REAL-001",conclusion:"success"},
        ],
      }],
    },
    "/actions/runs/555/artifacts?per_page=100": {
      total_count:1,
      artifacts:[{name:"p0-hml-V1-interna-HML-REAL-001-555",expired:false,size_in_bytes:8100,digest:"sha256:"+digest}],
    },
    "/actions/runs/789/artifacts?per_page=100": {
      total_count: 1,
      artifacts: [{name:"contaos-teste-c-789-1",expired:false,size_in_bytes:4096}],
    },
  };
  const remoteFiles = new Map(files);
  const run = (gate = "GATE_PROD") => verifyEvidenceLive(manifest, {
    gate,
    apiGet: async (p) => {
      if (p.startsWith("/contents/")) {
        const match = /^\/contents\/(.+)\?ref=[a-f0-9]{40}$/.exec(p);
        if (!match || !remoteFiles.has(match[1])) throw new Error("GitHub REST HTTP 404");
        return { encoding: "base64", content: remoteFiles.get(match[1]).toString("base64") };
      }
      if (!(p in responses)) throw new Error("GitHub REST HTTP 404");
      return responses[p];
    },
    fileExists: (path) => files.has(path),
    readBytes: (path) => files.get(path),
  });
  return { files, remoteFiles, manifest, responses, run, finalReceipt };
};
const assertFail = async (t, pattern) => {
  const r = await t.run();
  assert.match(r.errors.join(" "), pattern);
};

test("P0 LIVE — nenhuma integração PASS não inventa certificados nem exige token", async () => {
  const x = fixture();
  x.finalReceipt.status = "PENDENTE";
  const r = await verifyEvidenceLive(x.manifest);
  assert.deepEqual(r.errors, []);
  assert.equal(r.checked, 0);
});
test("P0 LIVE — 6 fases, fase7, SHA256 e GitHub real coerentes: PASS", async () => {
  const r = await fixture().run();
  assert.deepEqual(r.errors, []);
  assert.equal(r.checked, 1);
  assert.equal(r.checks.length, 7);
});
test("P0 LIVE — sem recibos das seis fases: FAIL", async () => {
  const x = fixture(); x.finalReceipt.fases_anteriores.pop();
  await assertFail(x, /faltam 6 recibos/);
});
test("P0 LIVE — certificado etapa 1 apresentado como fase7: FAIL", async () => {
  const x = fixture();
  x.finalReceipt.arquivo_evidencia = prefix + "fase1/CERTIFICADO.md";
  await assertFail(x, /certificado final: arquivo/);
});
test("P0 LIVE — hash documental fraudado: FAIL", async () => {
  const x = fixture(); x.finalReceipt.arquivo_sha256 = "f".repeat(64);
  await assertFail(x, /SHA256 diferente/);
});
test("P0 LIVE — PR aberta não comprova merge: FAIL", async () => {
  const x = fixture(); x.responses["/pulls/123"].merged_at = null;
  await assertFail(x, /não integrada à main/);
});
test("P0 LIVE — revisão de próprio autor: FAIL", async () => {
  const x = fixture(); x.responses["/pulls/123/reviews?per_page=100&page=1"][0].user.login = "implementador";
  await assertFail(x, /não é APPROVED independente/);
});
test("P0 LIVE — review com SHA antigo: FAIL", async () => {
  const x = fixture(); x.responses["/pulls/123/reviews?per_page=100&page=1"][0].commit_id = "c".repeat(40);
  await assertFail(x, /HEAD integrado/);
});
test("P0 LIVE — review CHANGES_REQUESTED: FAIL", async () => {
  const x = fixture(); x.responses["/pulls/123/reviews?per_page=100&page=1"][0].state = "CHANGES_REQUESTED";
  await assertFail(x, /não é APPROVED/);
});
test("P0 LIVE — review válida no padrão mas inexistente: FAIL", async () => {
  const x = fixture(); x.responses["/pulls/123/reviews?per_page=100&page=1"] = [];
  await assertFail(x, /não é APPROVED/);
});
test("P0 LIVE — CI falhou apesar de URL válida: FAIL", async () => {
  const x = fixture(); x.responses["/actions/runs/789"].conclusion = "failure";
  await assertFail(x, /não está SUCCESS/);
});
test("P0 LIVE — CI de outro SHA: FAIL", async () => {
  const x = fixture(); x.responses["/actions/runs/789"].head_sha = "d".repeat(40);
  await assertFail(x, /não está SUCCESS no SHA/);
});
test("P0 LIVE — Teste C não executado com sucesso: FAIL", async () => {
  const x = fixture(); x.responses["/actions/runs/789/jobs?per_page=100"].jobs.pop();
  await assertFail(x, /Teste C não comprovados/);
});
test("P0 LIVE — commit fora da main: FAIL", async () => {
  const x = fixture(); x.responses["/compare/" + M + "...main"].status = "diverged";
  await assertFail(x, /ancestral da main/);
});
test("P0 LIVE — REST indisponível com PASS: FAIL fechado", async () => {
  const x = fixture(); delete x.responses["/actions/runs/789"];
  await assertFail(x, /falha de API GitHub/);
});

test("P0 LIVE — certificado criado após o PR revisado não serve como evidência", async () => {
  const x = fixture();
  x.remoteFiles.delete(prefix + "fase7/CERTIFICADO.md");
  await assertFail(x, /fonte inexistente no HEAD aprovado/);
});
test("P0 LIVE — conteúdo alterado após review é rejeitado", async () => {
  const x = fixture();
  x.remoteFiles.set(prefix + "fase6/CERTIFICADO.md", Buffer.from("arquivo posterior"));
  await assertFail(x, /fonte não coincide com o SHA do PR revisado/);
});

test("P0 LIVE — job Teste C SUCCESS com Playwright SKIPPED não certifica", async () => {
  const x = fixture();
  const j = x.responses["/actions/runs/789/jobs?per_page=100"].jobs[1];
  j.steps[1].conclusion = "skipped";
  await assertFail(x,/Teste C visual\/E2E SKIPPED/);
});
test("P0 LIVE — sem artefato visual não existe prova E2E", async () => {
  const x = fixture();
  x.responses["/actions/runs/789/artifacts?per_page=100"].artifacts=[];
  await assertFail(x,/Teste C visual\/E2E SKIPPED/);
});
test("P0 LIVE — mesmo CI com Teste C sem evidência HML autenticada é FAIL", async () => {
  const x=fixture();delete x.finalReceipt.hml_e2e;
  await assertFail(x,/sem casos e escopo HML autenticado/);
});
test("P0 LIVE — relatório HML criado depois da revisão é FAIL", async () => {
  const x=fixture();
  x.remoteFiles.delete(prefix+"fase7/HML_E2E.md");
  await assertFail(x,/HML E2E não existe no SHA aprovado/);
});
test("P0 LIVE — relatório HML com hash divergente é FAIL", async () => {
  const x=fixture();
  x.finalReceipt.hml_e2e.arquivo_sha256="f".repeat(64);
  await assertFail(x,/HML E2E|SHA256 diferente/);
});

test("P0 LIVE — Teste C workflow_dispatch separado no HEAD revisado: PASS", async () => {
  const x = fixture();
  x.finalReceipt.teste_c_run_url =
    "https://github.com/contaos999999/contaos-hml-control/actions/runs/987";
  x.responses["/actions/runs/987"] = {
    name: "ContaOS Teste C Independente", conclusion: "success", head_sha: H,
  };
  x.responses["/actions/runs/987/jobs?per_page=100"] = {
    total_count: 1,
    jobs: [structuredClone(x.responses["/actions/runs/789/jobs?per_page=100"].jobs[1])],
  };
  x.responses["/actions/runs/987/artifacts?per_page=100"] = {
    total_count: 1,
    artifacts: [{name:"contaos-teste-c-987-1",expired:false,size_in_bytes:4096}],
  };
  const r = await x.run();
  assert.deepEqual(r.errors, []);
  assert.equal(r.checked, 1);
});
test("P0 LIVE — Teste C separado de outro SHA é FAIL", async () => {
  const x = fixture();
  x.finalReceipt.teste_c_run_url =
    "https://github.com/contaos999999/contaos-hml-control/actions/runs/987";
  x.responses["/actions/runs/987"] = {
    name:"ContaOS Teste C Independente",conclusion:"success",
    head_sha:"c".repeat(40),
  };
  x.responses["/actions/runs/987/jobs?per_page=100"] = {
    total_count:1,
    jobs:[structuredClone(x.responses["/actions/runs/789/jobs?per_page=100"].jobs[1])],
  };
  x.responses["/actions/runs/987/artifacts?per_page=100"] = {
    total_count:1,
    artifacts:[{name:"contaos-teste-c-987-1",expired:false,size_in_bytes:4096}],
  };
  await assertFail(x,/SHA divergente/);
});

test("P0 LIVE — HML privado com job SUCCESS e evidência SKIPPED: FAIL", async () => {
  const x=fixture();
  x.responses["/actions/runs/555/jobs?per_page=100"].jobs[0].steps[0].conclusion="skipped";
  await assertFail(x,/caso HML/);
});
test("P0 LIVE — HML sem artifact privado: FAIL", async () => {
  const x=fixture();
  x.responses["/actions/runs/555/artifacts?per_page=100"].artifacts=[];
  await assertFail(x,/caso HML/);
});
test("P0 LIVE — HML SHA antigo com mudança funcional posterior: FAIL", async () => {
  const x=fixture();
  x.responses["/compare/"+H+"..."+H].files=[
    {filename:"src/components/competencias/CompetenciaVisaoGeral.tsx"}];
  await assertFail(x,/SHA\/contrato estáveis/);
});
test("P0 LIVE — HML run sem execução privada real: FAIL", async () => {
  const x=fixture();
  x.responses["/actions/runs/555"].conclusion="skipped";
  await assertFail(x,/HML integração não comprovada/);
});

test("P0 LIVE — Trilha A visual genérica não prova integração interna V1", async () => {
  const x=fixture();
  x.responses["/actions/runs/555"].name="ContaOS Trilha A Autenticada";
  await assertFail(x,/workflow dedicado/);
});
test("P0 LIVE — caso inventado sem job/artefato correspondente bloqueia", async () => {
  const x=fixture();x.finalReceipt.hml_e2e.casos=["INVENTADO"];
  await assertFail(x,/caso HML INVENTADO/);
});
test("P0 LIVE — certificado V1 não aceita caso declarado em escopo V2 cumulativa", async () => {
  const x=fixture();x.finalReceipt.hml_e2e.escopo="V2/cumulativa";
  await assertFail(x,/escopo HML autenticado específico/);
});
test("P0 LIVE — artefato do escopo incorreto não comprova o caso", async () => {
  const x=fixture();
  x.responses["/actions/runs/555/artifacts?per_page=100"].artifacts[0].name=
    "p0-hml-V2-cumulativa-HML-REAL-001-555";
  await assertFail(x,/caso HML/);
});
test("P0 LIVE — digest REST inválido ou não vinculado não autentica artefato", async () => {
  const x=fixture();
  x.responses["/actions/runs/555/artifacts?per_page=100"].artifacts[0].digest=null;
  await assertFail(x,/caso HML/);
});
test("P0 LIVE — relatório local não pode trocar os IDs realmente executados", async () => {
  const x=fixture();
  const path=prefix+"fase7/HML_E2E.md";
  const forged=Buffer.from(JSON.stringify({schema:"contaos.p0.hml-integration-e2e.v1",
    escopo:"V1/interna",run_url:x.finalReceipt.hml_e2e.run_url,
    tested_sha:H,casos:["INVENTADO"],artefatos:[]}));
  x.files.set(path,forged);x.remoteFiles.set(path,forged);
  x.finalReceipt.hml_e2e.arquivo_sha256=createHash("sha256").update(forged).digest("hex");
  await assertFail(x,/relatório HML não está vinculado/);
});
test("P0 LIVE — alteração em script após teste HML impede reutilizar prova", async () => {
  const x=fixture();x.responses["/compare/"+H+"..."+H].files=
    [{filename:"scripts/frontend-zero-drift.mjs"}];
  await assertFail(x,/SHA\/contrato estáveis/);
});


test("P0 separation — CODE_CERTIFICATION accepts verified CI without authenticated HML LIVE", async () => {
  const x = fixture();
  delete x.finalReceipt.hml_e2e;
  const result = await x.run("CODE_CERTIFICATION");
  assert.deepEqual(result.errors, []);
  assert.equal(result.checked, 1);
});
test("P0 separation — GATE_PROD fails closed until all five versions and integrations PASS", async () => {
  const x = fixture();
  const errors = validateProdReadiness(x.manifest);
  assert.match(errors.join(" "), /GATE PROD bloqueado: certificado de código V2/);
});
test("P0 separation — unknown gate fails closed", async () => {
  const result = await fixture().run("UNAUTHORIZED");
  assert.match(result.errors.join(" "), /gate desconhecido/);
});
test("P0 separation — CODE_CERTIFICATION still rejects failing CI", async () => {
  const x = fixture();
  x.responses["/actions/runs/789"].conclusion = "failure";
  await assertFail({run:()=>x.run("CODE_CERTIFICATION")}, /não está SUCCESS/);
});

test("P0 separation — GATE_PROD refuses zero certified items", async () => {
  const x = fixture();
  x.manifest.controle.integracao_por_versao = {};
  const errors = validateProdReadiness(x.manifest);
  assert.notEqual(errors.length, 0);
});

test("P0 separation — complete five-version readiness alone is not LIVE PASS", async () => {
  const x = fixture();
  for (let i = 1; i <= 5; i++) {
    const v = "V" + i;
    x.manifest.controle.certificados_por_versao[v] = {status:"PASS"};
    x.manifest.controle.integracao_por_versao[v] = {interna:{status:"PASS"},...(i > 1 ? {cumulativa:{status:"PASS"}} : {})};
  }
  assert.deepEqual(validateProdReadiness(x.manifest), []);
  const result = await x.run("GATE_PROD");
  assert.notEqual(result.errors.length, 0);
});

function regularProof() {
  const x = fixture();
  const base = "c".repeat(40);
  const tree = "d".repeat(40);
  const checkout = "e".repeat(40);
  const rcaPath = "docs/frontend/rca/P0_RCA_ATIVO.json";
  const rca = Buffer.from(JSON.stringify({
    schema: "contaos.p0.rca-report.v2", versao: "V2", prompt_id: "44",
    baseline: { frontend_sha: base },
  }));
  const rec = {
    regular_id: "44",
    pr_merge_sha: M, pr_head_sha: H, base_sha: base, tree_sha: tree,
    ci_url: ci, revisao_independente_url: review,
    rca_sha256: createHash("sha256").update(rca).digest("hex"),
    teste_c: {
      run_url: ci, tentativa: 1, job_id: 652, artefato_id: 987,
      artefato_sha256: digest, checkout_sha: checkout,
    },
  };
  x.manifest.controle = { progresso_v2_code: [rec] };
  x.remoteFiles.set(rcaPath, rca);
  x.responses["/pulls/123"].head.ref = "build/regular-44";
  x.responses["/pulls/123/reviews?per_page=100&page=1"][0].user.login = "Edivan5002";
  const ciRun = x.responses["/actions/runs/789"];
  Object.assign(ciRun, { status: "completed", event: "pull_request", head_branch: "build/regular-44", run_attempt: 1 });
  const [quality, visualJob] = x.responses["/actions/runs/789/jobs?per_page=100"].jobs;
  Object.assign(quality, {
    head_sha: H, run_attempt: 1,
    steps: [{ name: "P0 RCA V1-V5 — verificar escopo, RED GitHub e executar GREEN/REG reais", conclusion: "success" }],
  });
  Object.assign(visualJob, { id: 652, run_attempt: 1, head_sha: H });
  const artifact = x.responses["/actions/runs/789/artifacts?per_page=100"].artifacts[0];
  Object.assign(artifact, { id: 987, digest: "sha256:" + digest, workflow_run: { id: 789, head_sha: H } });
  const parents = [{ sha: base }, { sha: H }];
  const mergeCommit = { sha: M, tree: { sha: tree }, parents };
  const checkoutCommit = { sha: checkout, tree: { sha: tree }, parents };
  x.responses["/git/commits/" + M] = mergeCommit;
  x.responses["/git/commits/" + checkout] = checkoutCommit;
  return { ...x, rec, ciRun, artifact, quality, visualJob, mergeCommit, checkoutCommit, rcaPath };
}

test("P0 LIVE autentica regular V2 no HEAD revisado com Teste C material", async () => {
  const x = regularProof();
  const r = await x.run("CODE_CERTIFICATION");
  assert.deepEqual(r.errors, []);
  assert.equal(r.checked, 1);
  assert.equal(r.checks[0].label, "V2 regular 44");
  assert.equal(r.checks[0].reviewer, "Edivan5002");
});

test("P0 LIVE rejeita proveniencia divergente do regular V2", async () => {
  for (const [change, expected] of [
    [(x) => { x.ciRun.conclusion = "failure"; }, /Zero-Drift/],
    [(x) => { x.ciRun.head_sha = M; }, /SHA do PR/],
    [(x) => { x.rec.pr_head_sha = M; }, /HEAD, árvore/],
    [(x) => { x.rec.pr_merge_sha = H; }, /SHA de merge/],
    [(x) => { x.mergeCommit.tree.sha = H; }, /árvore, pais/],
    [(x) => { x.mergeCommit.parents = []; }, /árvore, pais/],
    [(x) => { x.responses["/pulls/123/reviews?per_page=100&page=1"][0].commit_id = M; }, /review não é APPROVED/],
    [(x) => { x.responses["/pulls/123/reviews?per_page=100&page=1"][0].user.login = "outro"; }, /identidade revisora/],
    [(x) => { x.remoteFiles.set(x.rcaPath, Buffer.from("{}")); }, /fonte não coincide/],
    [(x) => { x.artifact.digest = "sha256:" + "a".repeat(64); }, /artefatos não comprovados/],
    [(x) => { x.artifact.id = 988; }, /artefatos não comprovados/],
    [(x) => { x.artifact.workflow_run.head_sha = M; }, /artefatos não comprovados/],
    [(x) => { x.quality.steps[0].conclusion = "skipped"; }, /RCA operacional/],
    [(x) => { x.visualJob.steps[1].conclusion = "skipped"; }, /Teste C visual/],
    [(x) => { x.ciRun.run_attempt = 2; x.quality.run_attempt = 2; }, /job ou tentativa/],
    [(x) => { x.visualJob.id = 653; }, /job ou tentativa/],
    [(x) => { x.checkoutCommit.tree.sha = H; }, /checkout, job/],
    [(x) => { x.responses["/compare/" + M + "...main"].status = "diverged"; }, /ancestral da main/],
  ]) {
    const x = regularProof();
    change(x);
    const result = await x.run("CODE_CERTIFICATION");
    assert.match(result.errors.join(" "), expected);
    assert.deepEqual(result.checks, []);
  }
});

test("P0 V2 executa as provas nomeadas no modo isolado do RCA", () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const proofs = [
    ["scripts/p0-version-order-gate.test.mjs", "P0 V2 incorpora prova sequencial do regular 44 e libera 45"],
    ["scripts/p0-evidence-live-gate.test.mjs", "P0 LIVE autentica regular V2 no HEAD revisado com Teste C material"],
  ];
  for (const [file, title] of proofs) {
    const actual = spawnSync(process.execPath, [
      "--test", "--experimental-test-isolation=none", "--test-reporter=tap",
      "--test-name-pattern=^" + title + "$", file,
    ], { env, encoding: "utf8" });
    assert.equal(actual.status, 0, actual.stdout + actual.stderr);
    assert.ok(actual.stdout.includes("# Subtest: " + title));
    assert.match(actual.stdout, /# pass 1/);
  }
});

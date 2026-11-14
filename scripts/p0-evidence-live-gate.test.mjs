import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { verifyEvidenceLive } from "./p0-evidence-live-gate.mjs";

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
  for (const p of [finalPath, matrixPath, graphPath, hmlPath]) files.set(p, data);
  const finalReceipt = {
    status: "PASS", ...receipt(finalPath),
    matriz_arquivo: matrixPath,
    matriz_sha256: digest,
    grafo_arquivo: graphPath,
    grafo_sha256: digest,
    teste_c_run_url: ci,
    hml_e2e: {
      ambiente: "HML_AUTENTICADO",
      arquivo_evidencia: hmlPath,
      arquivo_sha256: digest,
      casos: ["HML-REAL-001"],
    },
    fases_anteriores: stages,
  };
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
    "/actions/runs/789/artifacts?per_page=100": {
      total_count: 1,
      artifacts: [{name:"contaos-teste-c-789-1",expired:false,size_in_bytes:4096}],
    },
  };
  const remoteFiles = new Map(files);
  const run = () => verifyEvidenceLive(manifest, {
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
  await assertFail(x,/sem casos autenticados em HML/);
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

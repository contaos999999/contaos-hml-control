import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRcaImpact, verifyRcaOperational, runCase } from "./p0-rca-impact-gate.mjs";

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const V2 = "src/components/v2/Apontamentos.tsx";
const V1 = "src/components/v1/Competencias.tsx";
const SHA = "a".repeat(40);
const BACKEND = "b".repeat(40);
const ci = "https://github.com/contaos999999/contaos-hml-control/actions/runs/123";
const ref = (id) => ({
  id, runner: "node", arquivo: "scripts/p0-rca-impact-gate.test.mjs",
  caso: "caso real " + id,
});
const red = () => ({ ...ref("RED-V2"), run_url: ci, run_sha: SHA });
const fixture = () => ({
  schema: "contaos.p0.rca-report.v2", versao: "V2", prompt_id: "44",
  baseline: { frontend_sha: SHA, backend_sha: BACKEND },
  escopo: [{ arquivo: V2, versao: "V2", justificativa: "apontamentos da V2" }],
  itens: [{
    id: "RCA-V2-001", tipo: "CORRECAO",
    reproducao: {
      confirmada: true, sintoma: "perda de relação com competência",
      esperado: "referência íntegra", observado: "referência inválida", evidencia: "RED-V2",
    },
    causa: {
      status: "CONFIRMADA", descricao: "consumer descarta contexto de competência",
      evidencias: ["trace comprovado"], hipoteses_descartadas: ["RPC testada e válida"],
    },
    impacto: {
      dependencias: ["V1 competência", "V2 diligência"],
      versoes_afetadas: ["V2", "V1"],
      riscos: [{ risco: "regressão V1", teste_preventivo: ref("P-1") }],
    },
    testes: {
      red: [red()], green: [ref("GREEN-V2")],
      negativos: [ref("NEG-V2")], regressao: [ref("REG-V1")],
    },
    solucao: {
      descricao: "ajustar origem no componente",
      rollback: "reverter alteração sem mutação de dados",
      arquivos: [V2],
    },
  }],
});
const check = (report = fixture(), changed = [V2, REPORT], id = "44",
  allow = []) => validateRcaImpact({
  planId: id, changed, report, reportExists: Boolean(report),
  legacyAllowlist: allow, expectedFrontendSha: SHA, expectedBackendSha: BACKEND,
  fileExists: () => true,
});
const mustFail = (report, pattern, files = [V2, REPORT], id = "44", allow = []) =>
  assert.match(check(report, files, id, allow).errors.join(" "), pattern);

test("P0 RCA — código V2 sob PLAN 75 continua bloqueado mesmo em allowlist", () => {
  mustFail(null, /código de V2–V5 sob PLAN V1/, [V2], "75", [V2]);
});
test("P0 RCA — código genérico novo sob PLAN 75 não é presumido V1", () => {
  mustFail(null, /sem classificação/, ["src/components/Generic.tsx"], "75");
});
test("P0 RCA — arquivo V1 aprovado em PLAN prévio continua permitido", () => {
  assert.deepEqual(check(null, [V1], "75", [V1]).errors, []);
});
test("P0 RCA — docs-only não invoca RCA nem bloqueia V1", () => {
  assert.deepEqual(check(null, ["docs/frontend/planos/PLAN.md"], "44").errors, []);
});
test("P0 RCA — falta relatório no diff BUILD V2 falha", () => {
  mustFail(null, /sem ficha RCA/);
});
test("P0 RCA — relatório prévio sem atualização no mesmo diff falha", () => {
  mustFail(fixture(), /sem ficha RCA/, [V2]);
});
test("P0 RCA — contrato completo com provas executáveis é estruturalmente PASS", () => {
  assert.deepEqual(check().errors, []);
});
test("P0 RCA — PLAN/escopo divergente bloqueado", () => {
  const f = fixture(); f.escopo[0].versao = "V3";
  mustFail(f, /sem classificação/);
});
test("P0 RCA — mais de um arquivo exige mapa de cada um", () => {
  mustFail(fixture(), /mapa de escopo|fora do mapa/,
    [V2, V1, REPORT]);
});
test("P0 RCA — V2 pode afetar V1 quando mapa, risco e RCA explicam", () => {
  const f = fixture();
  f.escopo.push({ arquivo: V1, versao: "V1", justificativa: "consumidor legítimo V1" });
  f.itens[0].solucao.arquivos.push(V1);
  assert.deepEqual(check(f, [V2, V1, REPORT]).errors, []);
});
test("P0 RCA — causa plausível não é confirmação", () => {
  const f = fixture(); f.itens[0].causa.status = "PLAUSIVEL";
  mustFail(f, /causa raiz/);
});
test("P0 RCA — sem hipóteses descartadas não passa", () => {
  const f = fixture(); f.itens[0].causa.hipoteses_descartadas = [];
  mustFail(f, /causa raiz/);
});
test("P0 RCA — RED apenas texto, sem runner/teste e run real bloqueado", () => {
  const f = fixture(); f.itens[0].testes.red = ["RED-V2"];
  mustFail(f, /testes red|execução histórica/);
});
test("P0 RCA — GREEN por texto não é execução", () => {
  const f = fixture(); f.itens[0].testes.green = ["GREEN-V2"];
  mustFail(f, /testes green/);
});
test("P0 RCA — risco não tem teste executável", () => {
  const f = fixture(); f.itens[0].impacto.riscos[0].teste_preventivo = "REG-V1";
  mustFail(f, /testes preventivos/);
});
test("P0 RCA — teste cujo arquivo não existe não é evidência", () => {
  const f = fixture();
  const result = validateRcaImpact({
    planId: "44", changed: [V2, REPORT], report: f, reportExists: true,
    fileExists: () => false,
  });
  assert.match(result.errors.join(" "), /casos executáveis|testes preventivos/);
});
test("P0 RCA — baseline frontend fictício não é aceito", () => {
  const f = fixture(); f.baseline.frontend_sha = "c".repeat(40);
  mustFail(f, /HEADs reais/);
});
test("P0 RCA — backend HEAD divergente não é aceito", () => {
  const f = fixture(); f.baseline.backend_sha = "c".repeat(40);
  mustFail(f, /HEADs reais/);
});
test("P0 RCA — teste preventivo de arquivo adicional não omitido", () => {
  const f = fixture(); f.itens[0].solucao.arquivos = [];
  mustFail(f, /allowlist segura|fora de RCA/);
});
test("P0 RCA — nova funcionalidade exige preflight", () => {
  const f = fixture(); f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  mustFail(f, /preflight/);
});
test("P0 RCA — nova funcionalidade com preflight e TDD passa estruturalmente", () => {
  const f = fixture(); f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  f.itens[0].preflight = { status: "PASS", evidencia: "preflight e contrato conferidos" };
  assert.deepEqual(check(f).errors, []);
});
test("P0 RCA — item RCA duplicado bloqueado", () => {
  const f = fixture(); f.itens.push(structuredClone(f.itens[0]));
  mustFail(f, /ID exclusivo/);
});

const live = (f, overrides = {}) => {
  const proof = f || fixture();
  return verifyRcaOperational(proof, {
    apiGet: async (p) => {
      if (overrides.apiGet) return overrides.apiGet(p);
      if (p.endsWith("/jobs?per_page=100"))
        return { total_count: 1, jobs: [{ id: 12, conclusion: "failure" }] };
      return { name: "ContaOS Frontend Zero-Drift", conclusion: "failure", head_sha: SHA };
    },
    apiText: async () => "2026-11-14 not ok 1 - caso real RED-V2\n",
    execute: async () => overrides.execute === undefined ? true : overrides.execute,
    isAncestor: () => overrides.isAncestor === undefined ? true : overrides.isAncestor,
  });
};
test("P0 RCA LIVE — RED real + testes GREEN/NEG/REG executados: PASS", async () => {
  const r = await live();
  assert.deepEqual(r.errors, []);
  assert.equal(r.executed, 4);
});
test("P0 RCA LIVE — RED com run SUCCESS não prova falha original", async () => {
  const r = await live(null, { apiGet: async () => ({
    name: "ContaOS Frontend Zero-Drift", conclusion: "success", head_sha: SHA,
  }) });
  assert.match(r.errors.join(" "), /RED sem erro observado/);
});
test("P0 RCA LIVE — log falhou por outra causa não comprova RED", async () => {
  const f = fixture();
  const r = await verifyRcaOperational(f, {
    apiGet: async (p) => p.endsWith("jobs?per_page=100") ?
      { total_count: 1, jobs: [{ id: 12, conclusion: "failure" }] } :
      { name: "ContaOS Frontend Zero-Drift", conclusion: "failure", head_sha: SHA },
    apiText: async () => "not ok 1 - caso diferente",
    execute: () => true, isAncestor: () => true,
  });
  assert.match(r.errors.join(" "), /RED sem erro observado/);
});
test("P0 RCA LIVE — caso verde inexistente/skipped é FAIL", async () => {
  const r = await live(null, { execute: false });
  assert.match(r.errors.join(" "), /não executado com PASS/);
});
test("P0 RCA LIVE — RED commit sem ancestralidade real é FAIL", async () => {
  const r = await live(null, { isAncestor: false });
  assert.match(r.errors.join(" "), /RED sem erro observado/);
});

test("P0 RCA fixture teste real e isolado de token", () => {
  assert.equal(process.env.GITHUB_TOKEN, undefined);
  assert.equal(process.env.CONTAOS_CANONICAL_READ_TOKEN, undefined);
});
test("P0 RCA runner executa caso exato no Node sem vazar tokens", () => {
  const before = process.env.GITHUB_TOKEN;
  const beforeNorm = process.env.CONTAOS_CANONICAL_READ_TOKEN;
  process.env.GITHUB_TOKEN = "fake-token-test-only";
  process.env.CONTAOS_CANONICAL_READ_TOKEN = "fake-norm-test-only";
  try {
    assert.equal(runCase({
      id: "EXEC-01", runner: "node",
      arquivo: "scripts/p0-rca-impact-gate.test.mjs",
      caso: "P0 RCA fixture teste real e isolado de token",
    }), true);
    assert.equal(runCase({
      id: "EXEC-02", runner: "node",
      arquivo: "scripts/p0-rca-impact-gate.test.mjs",
      caso: "CASO RCA INEXISTENTE",
    }), false);
  } finally {
    if (before === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = before;
    if (beforeNorm === undefined) delete process.env.CONTAOS_CANONICAL_READ_TOKEN;
    else process.env.CONTAOS_CANONICAL_READ_TOKEN = beforeNorm;
  }
});

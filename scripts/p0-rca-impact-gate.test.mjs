import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRcaImpact, verifyRcaOperational, runCase } from "./p0-rca-impact-gate.mjs";

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const V2 = "src/components/v2/Apontamentos.tsx";
const V1 = "src/components/v1/Competencias.tsx";
const V1_SCOPE = "docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json";
const proofBytes = Buffer.from("preflight verificavel");
const proofHash = createHash("sha256").update(proofBytes).digest("hex");
const SHA = "a".repeat(40);
const BACKEND = "b".repeat(40);
const ci = "https://github.com/contaos999999/contaos-hml-control/actions/runs/123";
const ref = (id) => ({
  id,
  runner: "node",
  arquivo: "scripts/p0-rca-impact-gate.test.mjs",
  caso: "caso real " + id,
});
const red = () => ({ ...ref("RED-V2"), run_url: ci, run_sha: SHA });
const fixture = () => ({
  schema: "contaos.p0.rca-report.v2",
  versao: "V2",
  prompt_id: "44",
  baseline: { frontend_sha: SHA, backend_sha: BACKEND },
  escopo: [{ arquivo: V2, versao: "V2", justificativa: "apontamentos da V2" }],
  itens: [
    {
      id: "RCA-V2-001",
      tipo: "CORRECAO",
      reproducao: {
        confirmada: true,
        sintoma: "perda de relação com competência",
        esperado: "referência íntegra",
        observado: "referência inválida",
        evidencia: "RED-V2",
      },
      causa: {
        status: "CONFIRMADA",
        descricao: "consumer descarta contexto de competência",
        evidencias: ["trace comprovado"],
        hipoteses_descartadas: ["RPC testada e válida"],
      },
      impacto: {
        dependencias: ["V1 competência", "V2 diligência"],
        versoes_afetadas: ["V2", "V1"],
        riscos: [{ risco: "regressão V1", teste_preventivo: ref("P-1") }],
      },
      testes: {
        red: [red()],
        green: [ref("GREEN-V2")],
        negativos: [ref("NEG-V2")],
        regressao: [ref("REG-V1")],
      },
      solucao: {
        descricao: "ajustar origem no componente",
        rollback: "reverter alteração sem mutação de dados",
        arquivos: [V2],
      },
    },
  ],
});
const check = (report = fixture(), changed = [V2, REPORT], id = "44", allow = [], extras = {}) =>
  validateRcaImpact({
    planId: id,
    changed,
    report,
    reportExists: Boolean(report),
    legacyAllowlist: allow,
    expectedFrontendSha: SHA,
    expectedBackendSha: BACKEND,
    fileExists: () => true,
    readBytes: () => proofBytes,
    ...extras,
  });
const mustFail = (report, pattern, files = [V2, REPORT], id = "44", allow = []) =>
  assert.match(check(report, files, id, allow).errors.join(" "), pattern);

test("P0 RCA — código V2 sob PLAN 75 continua bloqueado mesmo em allowlist", () => {
  mustFail(null, /código de V2–V5 sob PLAN V1/, [V2], "75", [V2]);
});
test("P0 RCA — código genérico novo sob PLAN 75 não é presumido V1", () => {
  mustFail(null, /sem classificação/, ["src/components/Generic.tsx"], "75");
});
const v1Fixture = () => {
  const f = fixture();
  f.schema = "contaos.p0.v1-scope-proof.v2";
  f.versao = "V1";
  f.prompt_id = "75";
  f.escopo = [{ arquivo: V1, versao: "V1", justificativa: "cadastro V1 sob revisao RCA" }];
  f.itens[0].id = "RCA-V1-001";
  f.itens[0].solucao.arquivos = [V1];
  f.itens[0].impacto.versoes_afetadas = ["V1"];
  return f;
};
const v1Check = (doc = v1Fixture(), extra = {}) =>
  check(null, [V1, V1_SCOPE], "75", [V1], { v1Scope: doc, v1ScopeChanged: true, ...extra });

test("P0 RCA — arquivo V1 na allowlist sem RCA causal NÃO é liberado", () => {
  assert.match(check(null, [V1], "75", [V1]).errors.join(" "), /sem ficha RCA causal/);
});
test("P0 RCA — V1 com atestado legado de escopo/teste mas sem causa RED é FAIL", () => {
  const stale = {
    schema: "contaos.p0.v1-scope-proof.v1",
    prompt_id: "75",
    baseline_sha: SHA,
    arquivos: [{ arquivo: V1, versao: "V1", justificativa: "escopo V1" }],
    testes: [ref("V1-REG")],
  };
  assert.match(v1Check(stale).errors.join(" "), /schema, versão|ficha sem itens/);
});
test("P0 RCA — V1 com RCA v2, impacto, RED e casos executáveis passa estruturalmente", () => {
  assert.deepEqual(v1Check().errors, []);
});

const restrictedOptions = () => ({
  protectedAppRestrictions: { [V1]: 679 },
  prNumber: 679,
  governancePlan: { approved: true, pr_number: 679, files: [V1] },
});
test("P0 RCA R5: CLI usa mapa anterior apesar de removido no HEAD; PR e push identificados", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "rca-restricao-cli-"));
  t.after(() => {
    const rel = relative(resolve(tmpdir()), resolve(dir));
    assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel));
    rmSync(dir, { recursive: true, force: true });
  });
  const headPlan = { prompt_id: "75", arquivos_permitidos: [V1], arquivos_restritos_por_pr: {} };
  const previousPlan = { ...headPlan, arquivos_restritos_por_pr: { [V1]: 679 } };
  const doc = v1Fixture();
  // Somente fontes externas são simuladas; entrypoint, identificação da PR,
  // leitura HEAD/base e validação da autorização são os do guard real.
  const fixture = { headPlan, previousPlan, doc, V1, V1_SCOPE, SHA, BACKEND };
  const preload = join(dir, "offline.cjs");
  writeFileSync(
    preload,
    `
const f=${JSON.stringify(fixture)};
const fs=require('node:fs'),cp=require('node:child_process');
const read=fs.readFileSync,exists=fs.existsSync;
fs.readFileSync=function(p,...a){
 if(String(p)==='docs/frontend/planos/PLANO_ATIVO.json')return JSON.stringify(f.headPlan);
 if(String(p)===f.V1_SCOPE)return JSON.stringify(f.doc);
 return read.call(this,p,...a);
};
fs.existsSync=function(p){if(String(p)===f.V1_SCOPE)return true;return exists.call(this,p);};
cp.execFileSync=function(cmd,a){
 if(cmd!=='git')throw Error('Comando externo proibido no fixture');
 if(a[0]==='show')return JSON.stringify(a[1].endsWith(':docs/frontend/planos/PLANO_ATIVO.json')?
   f.previousPlan:{approved:true,pr_number:Number(process.env.FIXTURE_PR),files:[f.V1]});
 if(a[0]==='rev-parse')return a[1]===f.SHA?f.SHA:'c'.repeat(40);
 if(a[0]==='rev-list')return 'c'.repeat(40)+' '+f.SHA+' '+'d'.repeat(40);
 if(a[0]==='merge-base')return a[1]==='--is-ancestor'?'':f.SHA;
 if(a[0]==='log')return 'Merge pull request #'+process.env.FIXTURE_PR+' from feature';
 if(a[0]==='diff')return a.includes('--name-only')?f.V1+'\\n'+f.V1_SCOPE:'';
 throw Error('Git inesperado: '+a.join(' '));
};
cp.spawnSync=function(){return {status:0,stdout:[...Object.values(f.doc.itens[0].testes).flat(),
 ...f.doc.itens[0].impacto.riscos.map(x=>x.teste_preventivo)]
 .map(x=>'# Subtest: '+x.caso+'\\nok 1 - '+x.caso).join('\\n')+'\\n# pass 1\\n# fail 0\\n'};};
global.fetch=async function(url){return {ok:true,
 json:async()=>url.endsWith('/develop/commits/main')?{sha:f.BACKEND}:
  url.includes('/jobs?')?{total_count:1,jobs:[{id:12,conclusion:'failure'}]}:
  {name:'ContaOS Frontend Zero-Drift',head_sha:f.SHA,conclusion:'failure'},
 text:async()=>'FAIL '+f.doc.itens[0].testes.red[0].caso};};
require('node:module').syncBuiltinESMExports();
`,
  );
  const eventPath = join(dir, "event.json");
  for (const [event, pr, expected] of [
    ["pull_request", 680, 1],
    ["pull_request", 679, 0],
    ["push", 679, 0],
  ]) {
    writeFileSync(eventPath, JSON.stringify({ pull_request: { number: pr } }));
    const env = {
      ...process.env,
      FRONTEND_DIFF_BASE: SHA,
      GITHUB_EVENT_NAME: event,
      GITHUB_EVENT_PATH: eventPath,
      FIXTURE_PR: String(pr),
      GITHUB_TOKEN: "fake-test-only",
      CONTAOS_CANONICAL_READ_TOKEN: "fake-test-only",
    };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(
      process.execPath,
      ["--require", preload, fileURLToPath(new URL("./p0-rca-impact-gate.mjs", import.meta.url))],
      { encoding: "utf8", env },
    );
    assert.equal(result.status, expected, result.stdout + result.stderr);
    if (expected) assert.match(result.stderr, /arquivo restrito por PR/);
    else assert.match(result.stdout, /P0 RCA PASS V1/);
  }
});
test("P0 RCA R5: caminho restrito exige PR exata mesmo na allowlist geral", () => {
  for (const prNumber of [678, 680, null, undefined, "679", 0, -1, 679.5]) {
    const r = v1Check(v1Fixture(), { ...restrictedOptions(), prNumber });
    assert.match(r.errors.join(" "), /arquivo restrito por PR/, String(prNumber));
  }
});
test("P0 RCA R5: caminho restrito exige GOV protegido aprovado com caminho exato", () => {
  for (const governancePlan of [
    null,
    {},
    { approved: false, pr_number: 679, files: [V1] },
    { approved: true, pr_number: 680, files: [V1] },
    { approved: true, pr_number: 679, files: [] },
  ]) {
    assert.match(
      v1Check(v1Fixture(), { ...restrictedOptions(), governancePlan }).errors.join(" "),
      /arquivo restrito por PR/,
    );
  }
});
test("P0 RCA R5: mapa protegido malformado falha fechado", () => {
  for (const protectedAppRestrictions of [
    null,
    [],
    679,
    { [V1]: "679" },
    { [V1]: 0 },
    { [V1]: 679.5 },
    { "../src/x.tsx": 679 },
  ]) {
    assert.match(
      v1Check(v1Fixture(), { ...restrictedOptions(), protectedAppRestrictions }).errors.join(" "),
      /mapa restritivo/,
    );
  }
});
test("P0 RCA R5: permissão restrita não dispensa RCA e não libera caminho alheio", () => {
  const opts = restrictedOptions();
  assert.deepEqual(v1Check(v1Fixture(), opts).errors, []);
  assert.deepEqual(
    check(null, [V1, V1_SCOPE], "75", [], { ...opts, v1Scope: v1Fixture(), v1ScopeChanged: true })
      .errors,
    [],
  );
  assert.match(v1Check(null, opts).errors.join(" "), /ficha RCA/);
  assert.match(
    check(null, ["src/test/Outro.test.tsx"], "75", [], opts).errors.join(" "),
    /sem classificação/,
  );
  assert.deepEqual(v1Check().errors, []); // legado não restrito preservado
});
test("P0 RCA — V1 com causa apenas plausível falha", () => {
  const r = v1Fixture();
  r.itens[0].causa.status = "PLAUSIVEL";
  assert.match(v1Check(r).errors.join(" "), /causa raiz/);
});
test("P0 RCA — V1 sem RED ancestral ou execução real não certifica", async () => {
  const r = await live(v1Fixture(), { isAncestor: false });
  assert.match(r.errors.join(" "), /RED sem erro observado/);
});
test("P0 RCA — V1 com GREEN/NEG/REG sem execução real falha", async () => {
  const r = await live(v1Fixture(), { execute: false });
  assert.match(r.errors.join(" "), /não executado com PASS/);
});
test("P0 RCA — novo script sob PLAN 75 sem plano protegido deve falhar", () => {
  assert.match(
    check(null, ["scripts/guard-rules.mjs"], "75", []).errors.join(" "),
    /governança sem PLAN protegido/,
  );
});
test("P0 RCA — plano GOV aprovado pertence somente à PR e arquivos exatos", () => {
  const opts = {
    prNumber: 661,
    governancePlan: {
      approved: true,
      pr_number: 661,
      files: ["scripts/p0-evidence-live-gate.mjs"],
    },
  };
  assert.deepEqual(check(null, ["scripts/p0-evidence-live-gate.mjs"], "75", [], opts).errors, []);
  assert.match(
    check(null, ["scripts/guard-extra.mjs"], "75", [], opts).errors.join(" "),
    /governança sem PLAN protegido/,
  );
  assert.match(
    check(null, ["scripts/p0-evidence-live-gate.mjs"], "75", [], {
      ...opts,
      prNumber: 663,
    }).errors.join(" "),
    /governança sem PLAN protegido/,
  );
});
test("P0 RCA — V2 explícita dentro de arquivo V1 permitido não é isenta", () => {
  const attest = {
    ...v1Fixture(),
  };
  const x = check(null, [V1, V1_SCOPE], "75", [V1], {
    v1Scope: attest,
    v1ScopeChanged: true,
    addedLines: { [V1]: "// V2-DIL-001" },
  });
  assert.match(x.errors.join(" "), /introduz referências V2/);
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
  const f = fixture();
  f.escopo[0].versao = "V3";
  mustFail(f, /sem classificação/);
});
test("P0 RCA — mais de um arquivo exige mapa de cada um", () => {
  mustFail(fixture(), /mapa de escopo|fora do mapa/, [V2, V1, REPORT]);
});
test("P0 RCA — V2 pode afetar V1 quando mapa, risco e RCA explicam", () => {
  const f = fixture();
  f.escopo.push({ arquivo: V1, versao: "V1", justificativa: "consumidor legítimo V1" });
  f.itens[0].solucao.arquivos.push(V1);
  assert.deepEqual(check(f, [V2, V1, REPORT]).errors, []);
});
test("P0 RCA — causa plausível não é confirmação", () => {
  const f = fixture();
  f.itens[0].causa.status = "PLAUSIVEL";
  mustFail(f, /causa raiz/);
});
test("P0 RCA — sem hipóteses descartadas não passa", () => {
  const f = fixture();
  f.itens[0].causa.hipoteses_descartadas = [];
  mustFail(f, /causa raiz/);
});
test("P0 RCA — RED apenas texto, sem runner/teste e run real bloqueado", () => {
  const f = fixture();
  f.itens[0].testes.red = ["RED-V2"];
  mustFail(f, /testes red|execução histórica/);
});
test("P0 RCA — GREEN por texto não é execução", () => {
  const f = fixture();
  f.itens[0].testes.green = ["GREEN-V2"];
  mustFail(f, /testes green/);
});
test("P0 RCA — risco não tem teste executável", () => {
  const f = fixture();
  f.itens[0].impacto.riscos[0].teste_preventivo = "REG-V1";
  mustFail(f, /testes preventivos/);
});
test("P0 RCA — teste cujo arquivo não existe não é evidência", () => {
  const f = fixture();
  const result = validateRcaImpact({
    planId: "44",
    changed: [V2, REPORT],
    report: f,
    reportExists: true,
    fileExists: () => false,
  });
  assert.match(result.errors.join(" "), /casos executáveis|testes preventivos/);
});
test("P0 RCA — baseline frontend fictício não é aceito", () => {
  const f = fixture();
  f.baseline.frontend_sha = "c".repeat(40);
  mustFail(f, /HEADs reais/);
});
test("P0 RCA — backend HEAD divergente não é aceito", () => {
  const f = fixture();
  f.baseline.backend_sha = "c".repeat(40);
  mustFail(f, /HEADs reais/);
});
test("P0 RCA — teste preventivo de arquivo adicional não omitido", () => {
  const f = fixture();
  f.itens[0].solucao.arquivos = [];
  mustFail(f, /allowlist segura|fora de RCA/);
});
test("P0 RCA — nova funcionalidade exige preflight", () => {
  const f = fixture();
  f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  mustFail(f, /preflight/);
});
const preflight = () => ({
  status: "VERIFICADO",
  baseline_sha: SHA,
  arquivo_evidencia: "docs/frontend/auditorias/preflight/v2-44.json",
  arquivo_sha256: proofHash,
  checks: ["CONTRATO", "RBAC_RLS", "DADOS_INTEGRIDADE", "DEPENDENCIAS"].map((tipo) => ({
    tipo,
    teste: ref("PRE-" + tipo),
  })),
});
test("P0 RCA — frase genérica de preflight não comprova funcionalidade", () => {
  const f = fixture();
  f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  f.itens[0].preflight = { status: "PASS", evidencia: "preflight e contrato conferidos" };
  assert.match(check(f).errors.join(" "), /preflight sem contrato/);
});
test("P0 RCA — nova funcionalidade precisa quatro casos preflight e SHA256", () => {
  const f = fixture();
  f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  f.itens[0].preflight = preflight();
  assert.deepEqual(check(f).errors, []);
  f.itens[0].preflight.arquivo_sha256 = "c".repeat(64);
  assert.match(check(f).errors.join(" "), /preflight sem contrato/);
  f.itens[0].preflight = preflight();
  f.itens[0].preflight.checks.pop();
  assert.match(check(f).errors.join(" "), /preflight sem contrato/);
});
test("P0 RCA LIVE — preflight exige execução dos quatro testes", async () => {
  const f = fixture();
  f.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  f.itens[0].preflight = preflight();
  const r = await live(f, { execute: false });
  assert.match(r.errors.join(" "), /PRE-CONTRATO|PRE-RBAC_RLS/);
});
test("P0 RCA — item RCA duplicado bloqueado", () => {
  const f = fixture();
  f.itens.push(structuredClone(f.itens[0]));
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
    execute: async () => (overrides.execute === undefined ? true : overrides.execute),
    isAncestor: () => (overrides.isAncestor === undefined ? true : overrides.isAncestor),
  });
};
test("P0 RCA LIVE — RED real + testes GREEN/NEG/REG executados: PASS", async () => {
  const r = await live();
  assert.deepEqual(r.errors, []);
  assert.equal(r.executed, 4);
});
test("P0 RCA LIVE — RED com run SUCCESS não prova falha original", async () => {
  const r = await live(null, {
    apiGet: async () => ({
      name: "ContaOS Frontend Zero-Drift",
      conclusion: "success",
      head_sha: SHA,
    }),
  });
  assert.match(r.errors.join(" "), /RED sem erro observado/);
});
test("P0 RCA LIVE — log falhou por outra causa não comprova RED", async () => {
  const f = fixture();
  const r = await verifyRcaOperational(f, {
    apiGet: async (p) =>
      p.endsWith("jobs?per_page=100")
        ? { total_count: 1, jobs: [{ id: 12, conclusion: "failure" }] }
        : { name: "ContaOS Frontend Zero-Drift", conclusion: "failure", head_sha: SHA },
    apiText: async () => "not ok 1 - caso diferente",
    execute: () => true,
    isAncestor: () => true,
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
  const dir = mkdtempSync(join(tmpdir(), "rca-runner-isolado-"));
  const path = join(dir, "fixture.test.mjs");
  const before = process.env.GITHUB_TOKEN;
  const beforeNorm = process.env.CONTAOS_CANONICAL_READ_TOKEN;
  try {
    // Prova em arquivo temporário independente: não chamar novamente esta suíte
    // de testes, pois o runner recursivo pode falhar antes de registrar o TAP.
    writeFileSync(
      path,
      [
        'import { test } from "node:test";',
        'import assert from "node:assert/strict";',
        'test("P0 RCA fixture teste real e isolado de token", () => {',
        '  assert.equal(process.env.GITHUB_TOKEN, undefined);',
        '  assert.equal(process.env.CONTAOS_CANONICAL_READ_TOKEN, undefined);',
        "});",
      ].join("\n"),
    );
    process.env.GITHUB_TOKEN = "fake-token-test-only";
    process.env.CONTAOS_CANONICAL_READ_TOKEN = "fake-norm-test-only";
    assert.equal(
      runCase({
        id: "EXEC-01",
        runner: "node",
        arquivo: path,
        caso: "P0 RCA fixture teste real e isolado de token",
      }),
      true,
    );
    assert.equal(
      runCase({ id: "EXEC-02", runner: "node", arquivo: path, caso: "CASO RCA INEXISTENTE" }),
      false,
    );
  } finally {
    if (before === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = before;
    if (beforeNorm === undefined) delete process.env.CONTAOS_CANONICAL_READ_TOKEN;
    else process.env.CONTAOS_CANONICAL_READ_TOKEN = beforeNorm;
    rmSync(dir, { recursive: true, force: true });
  }
});

// Git r?el: seules les r?ponses GitHub et les runners de preuve sont isol?s.
// Le diff, les parents, le PLAN prot?g? et le GOV sont lus dans le d?p?t temporaire.
for (const [label, event, number, variant, expected] of [
  ["PR679 base seule", "pull_request", 679, "removed", 0],
  ["PR680 ne supprime pas base", "pull_request", 680, "removed", 1],
  ["PR680 ne remplace pas base", "pull_request", 680, "swapped", 1],
  ["PR680 ne vide pas base", "pull_request", 680, "empty", 1],
  ["push merge679 vrai", "push", 679, "merge", 0],
  ["push imitation un parent", "push", 679, "fake", 1],
  ["push premier parent different", "push", 679, "wrong-base", 1],
  ["push merge680 cite679", "push", 680, "merge", 1],
  ["PR string refusee", "pull_request", "679", "removed", 1],
  ["PR numero racine refuse", "pull_request", null, "removed", 1],
  ["evenement inconnu refuse", "unknown", 679, "removed", 1],
])
  test("P0 RCA Git R5.1: " + label, (t) => {
    const dir = mkdtempSync(join(tmpdir(), "rca-r51-git-"));
    t.after(() => {
      const rel = relative(resolve(tmpdir()), resolve(dir));
      assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel));
      rmSync(dir, { recursive: true, force: true });
    });
    const git = (...args) => {
      const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
      assert.equal(r.status, 0, r.stdout + r.stderr);
      return r.stdout.trim();
    };
    const put = (path, text) => {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    };
    const commit = (message) => {
      git("add", "-A");
      git("commit", "-qm", message);
      return git("rev-parse", "HEAD");
    };
    git("init", "-q");
    git("config", "user.name", "ContaOS CI");
    git("config", "user.email", "ci@example.invalid");
    git("branch", "-m", "main");
    const planPath = "docs/frontend/planos/PLANO_ATIVO.json";
    const plan = {
      prompt_id: "75",
      arquivos_permitidos: [],
      arquivos_restritos_por_pr: { [V1]: 679 },
    };
    put(planPath, JSON.stringify(plan));
    put(
      "docs/frontend/planos/P0_GOV_PLAN_679.json",
      JSON.stringify({ approved: true, pr_number: 679, files: [V1] }),
    );
    put("scripts/p0-rca-impact-gate.test.mjs", "// arquivo da prova existe");
    put(V1, "export const value = 1;");
    const base = commit("PLAN protegido");
    git("update-ref", "refs/remotes/origin/main", base);
    git("checkout", "-qb", "feature");
    // O pai do primeiro src concede allowlist e remove/troca o mapa: jamais autoridade.
    plan.arquivos_permitidos.push(V1);
    if (variant === "swapped") plan.arquivos_restritos_por_pr = { [V1]: 680 };
    else if (variant === "empty") plan.arquivos_restritos_por_pr = {};
    else delete plan.arquivos_restritos_por_pr;
    put(planPath, JSON.stringify(plan));
    commit("PLAN pai sem restricao confiavel");
    const doc = v1Fixture();
    doc.baseline.frontend_sha = base;
    doc.itens[0].testes.red[0].run_sha = base;
    put(V1, "export const value = 2;");
    put(V1_SCOPE, JSON.stringify(doc));
    commit(variant === "fake" ? "Merge pull request #679 from imitation" : "BUILD");
    if (variant !== "fake") {
      git("checkout", "-q", "main");
      if (variant === "wrong-base") {
        put("docs/base.txt", "avanca");
        commit("base avanca");
      }
      git(
        "merge",
        "--no-ff",
        "-m",
        "Merge pull request #" + number + " from feature\n\nReferences #679",
        "feature",
      );
    }
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify({ number: 679, pull_request: { number } }));
    const preload = join(dir, "offline.cjs");
    writeFileSync(
      preload,
      `
const doc=${JSON.stringify(doc)}, cp=require('node:child_process');
cp.spawnSync=function(){return {status:0,stdout:[...Object.values(doc.itens[0].testes).flat(),
 ...doc.itens[0].impacto.riscos.map(x=>x.teste_preventivo)]
 .map(x=>'# Subtest: '+x.caso+'\\nok 1 - '+x.caso).join('\\n')+'\\n# pass 1\\n# fail 0\\n'};};
global.fetch=async function(url){return {ok:true,
 json:async()=>url.endsWith('/develop/commits/main')?{sha:'${BACKEND}'}:
 url.includes('/jobs?')?{total_count:1,jobs:[{id:12,conclusion:'failure'}]}:
 {name:'ContaOS Frontend Zero-Drift',head_sha:'${base}',conclusion:'failure'},
 text:async()=>'FAIL '+doc.itens[0].testes.red[0].caso};};
require('node:module').syncBuiltinESMExports();
`,
    );
    const env = {
      ...process.env,
      FRONTEND_DIFF_BASE: base,
      GITHUB_EVENT_NAME: event,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_TOKEN: "fake-test-only",
      CONTAOS_CANONICAL_READ_TOKEN: "fake-test-only",
    };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(
      process.execPath,
      ["--require", preload, fileURLToPath(new URL("./p0-rca-impact-gate.mjs", import.meta.url))],
      { cwd: dir, env, encoding: "utf8" },
    );
    assert.equal(result.status, expected, result.stdout + result.stderr);
    if (expected) assert.match(result.stderr, /arquivo restrito por PR/);
    else assert.match(result.stdout, /P0 RCA PASS V1/);
  });

test("P0 RCA runner: caso skip e arquivo inteiro nao comprovam GREEN", () => {
  const dir = mkdtempSync(join(tmpdir(), "rca-runner-skip-"));
  const path = join(dir, "skip.test.mjs");
  try {
    writeFileSync(
      path,
      'import {test} from "node:test";test("fixture skipped", {skip:true}, () => {});',
    );
    assert.equal(runCase({ runner: "node", arquivo: path, caso: "fixture skipped" }), false);
    assert.equal(runCase({ runner: "node", arquivo: path, caso: path }), false);
    // Usar o rótulo emitido pelo próprio TAP: em Windows ele escapa barras,
    // enquanto no Linux coincide com o path. Comparar só caso=path dava um
    // falso negativo acidental no Windows e deixava o wrapper passar no Linux.
    for (const arquivo of [path, relative(process.cwd(), path), dir + "/./skip.test.mjs"]) {
      const env = { ...process.env };
      delete env.NODE_TEST_CONTEXT;
      const raw = spawnSync(
        process.execPath,
        ["--test", "--test-reporter=tap", "--test-name-pattern=^caso inexistente$", arquivo],
        { env, encoding: "utf8" },
      );
      assert.equal(raw.status, 0, raw.stderr);
      assert.match(raw.stdout, /^1\.\.0\r?$/m);
      const wrapper = /^# Subtest: (.+)\r?$/m.exec(raw.stdout)?.[1].trimEnd();
      assert.ok(wrapper, raw.stdout);
      assert.equal(runCase({ runner: "node", arquivo, caso: wrapper }), false, raw.stdout);
    }
  } finally {
    const rel = relative(resolve(tmpdir()), resolve(dir));
    assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("P0 RCA NR003: nome legitimo parecido com arquivo exige teste real sem zero selecao", () => {
  const dir = mkdtempSync(join(tmpdir(), "rca-runner-real-"));
  const path = join(dir, "real.test.mjs");
  try {
    writeFileSync(path, 'import {test} from "node:test";test("real.test.mjs", () => {});');
    assert.equal(runCase({ runner: "node", arquivo: path, caso: "real.test.mjs" }), true);
    assert.equal(runCase({ runner: "node", arquivo: path, caso: "inexistente" }), false);
    writeFileSync(path, "// nenhum teste declarado\n");
    assert.equal(runCase({ runner: "node", arquivo: path, caso: path }), false);
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const raw = spawnSync(process.execPath, ["--test", "--test-reporter=tap", path], {
      env,
      encoding: "utf8",
    });
    assert.equal(raw.status, 0, raw.stderr);
    const wrapper = /^# Subtest: (.+)\r?$/m.exec(raw.stdout)?.[1].trimEnd();
    assert.ok(wrapper, raw.stdout);
    assert.equal(runCase({ runner: "node", arquivo: path, caso: wrapper }), false, raw.stdout);
  } finally {
    const rel = relative(resolve(tmpdir()), resolve(dir));
    assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel));
    rmSync(dir, { recursive: true, force: true });
  }
});


test("F3 CODE RED-GREEN — registry covers the canonical 138 cases and 20 producers", async () => {
  const { readFile } = await import("node:fs/promises");
  const catalogue = JSON.parse(await readFile(new URL("../docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json", import.meta.url), "utf8"));
  assert.equal(catalogue.cases.length, 138);
  assert.equal(new Set(catalogue.cases.map(c => c.caseId)).size, 138);
  const executorPath = fileURLToPath(new URL("./hml/integracao-v1-fase3-functional-138.mjs", import.meta.url));
  // This pre-install step must not import TypeScript-dependent product code.
  // Existence, syntax and actual exports are verified here; the functional CI
  // and RCA operational tests execute the module after frozen dependencies.
  const executor = await readFile(executorPath, "utf8");
  assert.equal(spawnSync(process.execPath, ["--check", executorPath]).status, 0);
  const drivers = await import("./hml/f3-code-functional-drivers.mjs");
  assert.match(executor, /export async function executeF3Functional138\(/);
  assert.match(executor, /export function validateF3AutomaticGate\(/);
  assert.equal(Object.keys(drivers.producerDrivers).length, 20);
  for (const c of catalogue.cases) {
    assert.equal(typeof drivers.producerDrivers[c.producerOrder], "function", c.caseId);
    assert.equal(typeof drivers.consumerDrivers[c.consumer], "function", c.caseId);
    assert.equal(typeof drivers.negativeDrivers[c.consumer], "function", c.caseId);
  }
});

// RED/GREEN F4: exercita o verificador de identidade realmente usado no CI.
import "./hml/f4-code-material-evidence.test.mjs";

// F5 CODE partial verifier: reject corrupted observations, not a phase certificate.
import "./hml/f5-code-material-evidence.test.mjs";

test("P0-ORQ F1 valida contrato CODE sem autoridade de execução", async () => {
  const { existsSync } = await import("node:fs");
  assert.ok(existsSync(new URL("./p0-actions-request.mjs", import.meta.url)), "RED_CAUSAL_TRANSPORT_VALIDATOR_ABSENT");
  const m = await import("./p0-actions-request.mjs");
  const q = {
    schema:"contaos.p0.actions-request.v1", request_id:"11111111-1111-4111-8111-111111111111",
    repository:"contaos999999/contaos-hml-control", mission_id:"P0-ORQ-ACTIONS-001",
    operation:"CANARY_CODE", environment:"CODE", source_sha:"a".repeat(40),
    source_pr:1, request_pr:2, plan_ref:"c".repeat(40), plan_blob:"e".repeat(40),
    authorization_ref:"d".repeat(40), predecessor_checkpoint_ref:123
  };
  const c = {schema:"contaos.p0.actions-catalog.v1", repository:q.repository, operations:[
    {operation:"CANARY_CODE",environment:"CODE",mode:"CODE_FIXTURE_ONLY",enabled:true},
    {operation:"TESTE_C_FULL_CODE",environment:"CODE",mode:"DISABLED",enabled:false}
  ]};
  assert.deepEqual(m.parseRequest(JSON.stringify(q)+"\n",q.repository),q);
  assert.deepEqual(m.validateCatalog(JSON.stringify(c)+"\n",q.repository),c);
  const verdict = m.authorizeRequest(q,c,{});
  assert.equal(verdict.status,"BLOCKED");
  assert.equal(verdict.executionAllowed,false);
  assert.throws(()=>m.parseRequest(JSON.stringify({...q,environment:"PROD"})+"\n",q.repository));
});

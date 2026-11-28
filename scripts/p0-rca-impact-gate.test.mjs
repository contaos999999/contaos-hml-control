import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateRcaImpact, verifyRcaOperational, runCase, parseFullDiffNameStatus, uniquePrAssociation, safeTreeEntry, resolvePrContext, verifyRawFullDiffModes, classifyProtectedPush,
  assertImmutableP0Governance, IMMUTABLE_P0_690_MANIFEST, readP0690ProtectedSources,
  ASSISTANT_PREAUDIT_MARKER, ASSISTANT_PREAUDIT_CRITERIA,
  PRECERT_REQUIRED_CHECKS, ADVERSARIAL_V2_LENSES, ADVERSARIAL_V2_STEP_NAMES,
  ADVERSARIAL_V2_CHECK_NAME, ADVERSARIAL_V2_CAUSAL_CASES, classifyGithubReadError, validateAssistantPrecertRelease,
  parseAssistantPreaudit, verifyAssistantPrecertInGithub,
  auditFullProtocolCoverage, auditNormativeSemanticCompleteness, PROTECTED_SEMANTIC_SOURCES, inventoryProtectedSemanticLines, analyzeSemanticCorpusForReview, assembleSemanticContradictionDossier, writeSemanticDossierJsonl, validatePrioritySemanticDisputes, executePriorityCausalCounterproofs, materialReviewOfReverseGaps, executeSemanticCorpusIntegrityMutants, P0_REVERSE_GAP_REVIEWS, P0_PRIORITY_CAUSAL_MODELS, P0_PRIORITY_CAUSAL_PROBES, analyzePrioritySemanticProposals, P0_PRIORITY_SEMANTIC_PROPOSALS, P0_SEMANTIC_PRIORITY_DISPUTES, verifySemanticSourceClaims, inventorySemanticSentenceCandidates, buildSevenAxisSemanticBacklog, auditSemanticReverseCoverage, assessSemanticPreauditGate, assessSemanticCompletenessGate, validateSevenAxisSemanticBacklog, attestFullProtocolExecutions, parseFullProtocolSuiteResult, attestProtectedNormativeSources, verifyPrecertRunOrigin, classifyPrecertReadiness } from "./p0-rca-impact-gate.mjs";


test("P0 FULL_PROTOCOL PIN PREFLIGHT must detect actual source drift without disabling freeze",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const suites={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const ok=verifyFullProtocolSourcePins({protocol,tests:suites});
  assert.equal(ok.verdict,"PIN_MATCH",JSON.stringify(ok.issues));
  assert.equal(ok.release,"NO_GO","pin match never certifies semantics or activation");
  assert.equal(Object.keys(ok.pins).length,4);
  assert.ok(Object.values(ok.pins).every(row=>row.matches));
  for(const mutant of [
    {protocol:protocol+"\\nSynthetic unreviewed new clause"},
    {tests:{...suites,rca:suites.rca.replace("P0 CRYPTO SNAPSHOT","P0 FAKE SNAPSHOT")}},
    {tests:{...suites,python:suites.python+"\\n# injected"}},
    {tests:{...suites,queue:suites.queue+"\\n# injected"}},
  ]){
    const negative=verifyFullProtocolSourcePins({
      protocol:mutant.protocol??protocol,tests:mutant.tests??suites});
    assert.equal(negative.verdict,"PIN_DRIFT");
    assert.equal(negative.release,"NO_GO");
    assert.ok(negative.issues.length>=1);
  }
});

const REPORT = "docs/frontend/rca/P0_RCA_ATIVO.json";
const V2 = "src/components/v2/Apontamentos.tsx";
const V1 = "src/components/v1/Competencias.tsx";
const V1_SCOPE = "docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json";
const proofBytes = Buffer.from("preflight verificavel");
const proofHash = createHash("sha256").update(proofBytes).digest("hex");
const SHA = "a".repeat(40);
const BACKEND = "b".repeat(40);

import { resolveFullProtocolAuditHead, verifyFullProtocolSourcePins } from "./p0-rca-impact-gate.mjs";

test("P0 FULL_PROTOCOL manual workflow_dispatch verifies branch SHA without HEAD^2",()=>{
  const good={event:"workflow_dispatch",
    ref:"refs/heads/build/p0-abs-fiscal-universal",
    githubSha:SHA,checkoutSha:SHA,declaredHead:SHA};
  assert.equal(resolveFullProtocolAuditHead(good),SHA);
  for(const broken of [
    {ref:"refs/heads/main"},{githubSha:BACKEND},
    {checkoutSha:BACKEND},{declaredHead:BACKEND},
    {githubSha:""},{declaredHead:"invalid"},
  ]) assert.throws(()=>resolveFullProtocolAuditHead({...good,...broken}),
    /full protocol:/);
});

test("P0 FULL_PROTOCOL PR merge checkout keeps authenticated second-parent check",()=>{
  const merge={event:"pull_request",checkoutSha:SHA,
    declaredHead:BACKEND,mergeSecondParent:BACKEND};
  assert.equal(resolveFullProtocolAuditHead(merge),BACKEND);
  assert.equal(resolveFullProtocolAuditHead({
    event:"pull_request_review",checkoutSha:SHA,mergeSecondParent:BACKEND}),BACKEND);
  assert.throws(()=>resolveFullProtocolAuditHead({...merge,
    declaredHead:"c".repeat(40)}),/checkout\/PR head mismatch/);
  assert.throws(()=>resolveFullProtocolAuditHead({...merge,
    mergeSecondParent:null}),/checkout\/PR head mismatch/);
  assert.throws(()=>resolveFullProtocolAuditHead({...merge,
    event:"push"}),/unsupported GitHub event/);
  // A directly checked-out PR head remains legitimate only if explicitly bound.
  assert.equal(resolveFullProtocolAuditHead({
    event:"pull_request_review",checkoutSha:SHA,declaredHead:SHA}),SHA);
});

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
 if(a[0]==='rev-parse')return [f.SHA,'HEAD^2','HEAD^'].includes(a[1])?f.SHA:'c'.repeat(40);
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
  url.endsWith('/pulls')?[{number:Number(process.env.FIXTURE_PR)}]:
  url.includes('/pulls/')?{number:Number(process.env.FIXTURE_PR),base:{ref:'main'},merged_at:'fixture',merge_commit_sha:'c'.repeat(40)}:
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
    writeFileSync(eventPath, JSON.stringify({
      repository: { full_name: "contaos999999/contaos-hml-control" },
      ref: "refs/heads/main", before: SHA, after: "c".repeat(40),
      pull_request: { number: pr, base: {ref: "main", sha: SHA}, head: {sha: SHA} },
    }));
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
test("NR-005 parser NUL cobre lado anterior e novo da renomeação", () => {
  assert.deepEqual(parseFullDiffNameStatus("R100\0docs/a.md\0docs/b.md\0M\0scripts/x.mjs\0"),
    ["docs/a.md", "docs/b.md", "scripts/x.mjs"]);
});
test("NR-005 parser rejeita diff truncado antes de N/A", () => {
  assert.throws(() => parseFullDiffNameStatus("R100\0docs/a.md\0"), /diff truncado/);
});
test("NR-005 parser rejeita nome com quebra de linha", () => {
  assert.throws(() => parseFullDiffNameStatus("A\0docs/extra\nbad.md\0"), /caminho suspeito/);
});
test("NR-005 parser rejeita status não previsto", () => {
  assert.throws(() => parseFullDiffNameStatus("Z\0docs/a.md\0"), /tipo de diff/);
});
test("NR-005 push documental sem associacao de PR e FAIL", () => {
  assert.throws(() => uniquePrAssociation([]), /PR autenticada unica/);
});
test("NR-005 PR ambigua ou numero falsificado e FAIL", () => {
  assert.throws(() => uniquePrAssociation([{number:690},{number:691}]), /PR autenticada unica/);
  assert.throws(() => uniquePrAssociation([{number:"690"}]), /PR autenticada unica/);
  assert.equal(uniquePrAssociation([{number:690}]), 690);
});
test("NR-005 mudanca de modo T nao e omitida do diff", () => {
  assert.deepEqual(parseFullDiffNameStatus("T\0scripts/ci/m.js\0"), ["scripts/ci/m.js"]);
});
test("NR-005 symlink e gitlink proibidos no BUILD autorizado", () => {
  const p="scripts/ci/m.js",hash="a".repeat(40);
  assert.equal(safeTreeEntry("100644 blob "+hash+"\t"+p+"\0",p), true);
  assert.equal(safeTreeEntry("100755 blob "+hash+"\t"+p+"\0",p), true);
  assert.equal(safeTreeEntry("120000 blob "+hash+"\t"+p+"\0",p), false);
  assert.equal(safeTreeEntry("160000 commit "+hash+"\t"+p+"\0",p), false);
  assert.equal(safeTreeEntry("",p), true);
});
const files690 = [
  "docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md",
  "docs/frontend/governanca/MISSAO_ATIVA_4_1.json",
  "scripts/auditoria/mission-supervisor.py",
  "scripts/auditoria/test_mission_supervisor.py",
  ".github/workflows/contaos-auditoria-controller.yml",
  ".github/workflows/contaos-missao-auditoria.yml",
  "docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md",
  ".github/workflows/contaos-frontend-zero-drift.yml",
  ".github/workflows/contaos-teste-c-independente.yml",
  ".github/workflows/p0-nr001-anti-recurrence.yml",
  "scripts/ci/merge-group-context.mjs",
  "scripts/ci/merge-group-context.test.mjs",
  "scripts/p0-rca-impact-gate.mjs",
  "scripts/p0-rca-impact-gate.test.mjs",
];
const manifest690 = () => ({
  schema: "contaos.p0.gov-plan.v1", approved: true, pr_number: 690, full_diff: true, files: [...files690],
});
const gov690 = (changed, extra = {}) => check(null, changed, "75", [], {
  prNumber: 690, governancePlan: manifest690(), fullDiffPaths: [...changed],
  ...extra,
});
test("NR-005 full_diff do BUILD #690 aceita somente os caminhos autorizados", () => {
  const r = gov690([files690[0], files690[2], files690[13]]);
  assert.deepEqual(r.errors, []);
  assert.equal(r.version, "P0_GOV_FULL_DIFF");
});
test("NR-005 documento extra com codigo permitido nao pode passar", () => {
  const r = gov690([files690[2], "docs/frontend/governanca/DOCUMENTO_EXTRA.md"]);
  assert.match(r.errors.join(" "), /fora da allowlist full_diff/);
});
test("NR-005 script adicional fora dos 14 caminhos sempre falha", () => {
  const r=gov690([files690[2], "scripts/auditoria/UNAPPROVED_NEW.py"]);
  assert.match(r.errors.join(" "), /fora da allowlist full_diff/);
});
test("NR-005 diff exclusivamente documental fora da allowlist nao recebe N/A", () => {
  const r = gov690([files690[0], "docs/frontend/planos/PLANO_EXTRA.md"]);
  assert.match(r.errors.join(" "), /fora da allowlist full_diff/);
});
test("NR-005 a PR #690 documental sem manifesto protegido falha", () => {
  const r = gov690([files690[0]], { governancePlan: null });
  assert.match(r.errors.join(" "), /manifesto full_diff protegido ausente/);
});
test("NR-005 manifesto de outra PR nao pode autorizar #690", () => {
  const bad = manifest690(); bad.pr_number = 691;
  assert.match(gov690([files690[0]], { governancePlan: bad }).errors.join(" "), /manifesto full_diff protegido/);
});
test("NR-005 manifesto sem 14 caminhos falha", () => {
  const bad = manifest690(); bad.files.pop();
  assert.match(gov690([files690[0]], { governancePlan: bad }).errors.join(" "), /14 caminhos/);
});
test("NR-005 caminho de origem de renomeacao tambem exige allowlist", () => {
  const r = gov690([files690[2]], {fullDiffPaths: ["scripts/auditoria/OLD.py", files690[2]]});
  assert.match(r.errors.join(" "), /fora da allowlist full_diff/);
});
test("NR-005 full_diff omitido e FAIL, nao N/A", () => {
  const r = gov690([files690[2]], { fullDiffPaths: null });
  assert.match(r.errors.join(" "), /full_diff de arquivos/);
});
test("NR-005 diff declarado incompleto nao pode passar", () => {
  const r = gov690([files690[0], files690[2]], {fullDiffPaths:[files690[0]]});
  assert.match(r.errors.join(" "), /full_diff incompleto/);
});
test("NR-005 manifestos duplicados nos caminhos nao passam", () => {
  const bad = manifest690(); bad.files[1] = bad.files[0];
  assert.match(gov690([files690[0]], { governancePlan: bad }).errors.join(" "), /manifesto full_diff protegido/);
});
test("NR-005 dispensa documental legitima fora do BUILD preservada", () => {
  const r = check(null, ["docs/frontend/planos/PLANO_COMUM.md"], "75", [], {
    prNumber: 692, governancePlan: null,
  });
  assert.deepEqual(r.errors, []);
  assert.equal(r.applicable, false);
});


/* P0-PRE-AUDIT: event-to-guard matrix, not merely validateRcaImpact mocks.
 * The webhook/API data are synthetic; this proves routing and fail-closed
 * logic, NOT that an external GitHub event/runner has been authenticated. */
const EVT_BASE = "c".repeat(40), EVT_HEAD = "d".repeat(40);
const PR_HEAD = "e".repeat(40), COMMON = "f".repeat(40);
const makeEvent = (kind, n = 701) => kind === "pull_request" ?
  { repository:{full_name:"contaos999999/contaos-hml-control"}, number:n,
    pull_request:{number:n, base:{ref:"main",sha:EVT_BASE}, head:{sha:PR_HEAD}} } :
  { repository:{full_name:"contaos999999/contaos-hml-control"},
    ref:"refs/heads/main", before:EVT_BASE, after:EVT_HEAD };
const fakeGit = (...args) => {
  if (args[0] === "rev-parse" && typeof args[1] === "string" &&
      (args[1].startsWith(EVT_HEAD + ":") || args[1].startsWith(PR_HEAD + ":")))
    return "4".repeat(40); // identical blob at the same audited path
  if (args[0] === "rev-parse") return ({
    HEAD:EVT_HEAD, [EVT_HEAD]:EVT_HEAD, [EVT_BASE]:EVT_BASE,
    [PR_HEAD]:PR_HEAD, [COMMON]:COMMON,
  })[args[1]] || args[1];
  if (args[0] === "merge-base") return COMMON;
  if (args[0] === "rev-list") return [EVT_HEAD,EVT_BASE,PR_HEAD].join(" ");
  if (args[0] === "show") return JSON.stringify(manifest690());
  throw new Error("unexpected git request " + args.join(" "));
};
const fakeEvent = async (kind, paths, number, extras={}) => {
  const payload = makeEvent(kind,number);
  const call = extras.apiGet || (async (path) => {
    if (path.endsWith("/pulls")) return [{number}];
    if (path.endsWith("/pulls/" + number))
      return {number, merged_at:"2026-11-21T00:00:00Z",
        base:{ref:"main"},merge_commit_sha:EVT_HEAD,head:{sha:PR_HEAD}};
    throw Error("unmocked API path " + path);
  });
  return resolvePrContext(kind, kind === "pull_request" ? COMMON : EVT_BASE,
    kind === "pull_request" ? PR_HEAD : "HEAD", paths, "fixture-only",
    EVT_BASE, {payload,gitFn:extras.gitFn || fakeGit,apiGet:call});
};
test("P0 PRE-AUDIT push squash documental comum preserva N/A", async () => {
  const paths=["docs/frontend/planos/PLANO_COMUM.md"];
  const result=await fakeEvent("push",paths,701,{
    gitFn:(...a)=>a[0] === "rev-list" ? EVT_HEAD+" "+EVT_BASE : fakeGit(...a),
  });
  assert.equal(result.number,701);
  assert.equal(result.ordinaryDocument,true);
  assert.deepEqual(check(null,paths,"75",[],{prNumber:701}).errors,[]);
});
test("P0 PRE-AUDIT push documental sem associação permanece N/A somente fora BUILD", async () => {
  const paths=["docs/frontend/planos/DOC_COMUM.md"];
  const result=await fakeEvent("push",paths,701,{
    apiGet:async(p)=>p.endsWith("/pulls")?[]:null,
  });
  assert.equal(result.number,null);
  assert.deepEqual(check(null,paths,"75",[],{prNumber:null}).errors,[]);
});
test("P0 PRE-AUDIT push da #690 com merge MERGE e manifesto protegido: PASS", async () => {
  const paths=[files690[0],files690[2]];
  const result=await fakeEvent("push",paths,690);
  assert.equal(result.number,690);
  assert.equal(result.manifestBase,EVT_BASE);
  assert.deepEqual(check(null,paths,"75",[],{
    prNumber:result.number,governancePlan:manifest690(),fullDiffPaths:paths,
  }).errors,[]);
});
test("NR-005 #690 same paths but different integrated blob must FAIL", async () => {
  await assert.rejects(()=>fakeEvent("push",[files690[0]],690,{
    gitFn:(...args) => args[0] === "rev-parse" && args[1] === EVT_HEAD + ":" + files690[0]
      ? "9".repeat(40) : fakeGit(...args),
  }),/conteúdo da árvore integrada difere do HEAD da PR/);
});
test("P0 PRE-AUDIT #690 via squash de um pai: FAIL", async () => {
  await assert.rejects(()=>fakeEvent("push",[files690[2]],690,{
    gitFn:(...a)=>a[0]==="rev-list"?EVT_HEAD+" "+EVT_BASE:fakeGit(...a),
  }),/merge da #690 não comprovado/);
});
test("NR-005 manutenção autorizada de script compartilhado usa a própria PR", async () => {
  const path=files690[2];
  const result=await fakeEvent("push",[path],701);
  assert.equal(result.number,701);
  assert.equal(result.ordinaryDocument,false);
  assert.deepEqual(check(null,[path],"75",[],{
    prNumber:701, governancePlan:{approved:true,pr_number:701,files:[path]},
  }).errors,[]);
});
test("P0 PRE-AUDIT #690 sem associação autenticada: FAIL", async () => {
  await assert.rejects(()=>fakeEvent("push",[files690[2]],690,{
    apiGet:async(p)=>p.endsWith("/pulls")?[]:null,
  }),/sem PR autenticada/);
});
test("P0 PRE-AUDIT manifesto ausente no base e presente no diff nao vira N/A", async () => {
  await assert.rejects(() => fakeEvent("push",
    ["docs/frontend/planos/P0_GOV_PLAN_690.json"],701,{
      apiGet: async (p) => p.endsWith("/pulls")?[]:null,
      gitFn: (...a) => {
        if (a[0] === "show") throw new Error("manifest missing in base");
        return fakeGit(...a);
      },
    }), /push de BUILD\/código sem PR autenticada/);
});
test("NR-005 documento central sem manifesto da base não tem N/A", async () => {
  await assert.rejects(() => fakeEvent("push",
    ["docs/frontend/governanca/MISSAO_ATIVA_4_1.json"],701,{
      gitFn: (...a) => {
        if (a[0] === "show") throw new Error("manifest missing in base");
        return fakeGit(...a);
      },
    }), /documento central sem manifesto protegido/);
});
test("P0 PRE-AUDIT push de código sem PR autenticada nunca N/A", async () => {
  await assert.rejects(()=>fakeEvent("push",["scripts/ci/other.mjs"],701,{
    apiGet:async(p)=>p.endsWith("/pulls")?[]:null,
  }),/sem PR autenticada/);
});
test("P0 PRE-AUDIT PR head/base avançada distingue evento e merge-base", async () => {
  const res=await fakeEvent("pull_request",[files690[0]],690);
  assert.equal(res.number,690);
  assert.equal(res.manifestBase,EVT_BASE);
});
test("P0 PRE-AUDIT PR com base do evento forjada: FAIL", async () => {
  const payload=makeEvent("pull_request",690);
  payload.pull_request.base.sha=COMMON;
  await assert.rejects(()=>resolvePrContext("pull_request",COMMON,PR_HEAD,
    [files690[0]],"fixture-only",EVT_BASE,
    {payload,gitFn:fakeGit,apiGet:async()=>null}),/evento não comprovados/);
});
test("P0 PRE-AUDIT PR com HEAD obsoleto: FAIL", async () => {
  const payload=makeEvent("pull_request",690);
  payload.pull_request.head.sha=EVT_HEAD;
  await assert.rejects(()=>resolvePrContext("pull_request",COMMON,PR_HEAD,
    [files690[0]],"fixture-only",EVT_BASE,
    {payload,gitFn:fakeGit,apiGet:async()=>null}),/evento não comprovados/);
});


test("NR-005 checkpoint documental em PR posterior com squash mantém N/A", async () => {
  const path="docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md";
  const result=await fakeEvent("push",[path],701,{
    gitFn:(...a)=>a[0]==="rev-list"?EVT_HEAD+" "+EVT_BASE:fakeGit(...a),
  });
  assert.equal(result.number,701);
  assert.equal(result.ordinaryDocument,true);
  assert.deepEqual(check(null,[path],"75",[],{prNumber:701}).errors,[]);
});
test("NR-005 manutenção autorizada de workflow histórico não é tratada como BUILD #690", async () => {
  const path=".github/workflows/contaos-frontend-zero-drift.yml";
  const result=await fakeEvent("push",[path],703);
  assert.equal(result.number,703);
  assert.deepEqual(check(null,[path],"75",[],{
    prNumber:703,governancePlan:{approved:true,pr_number:703,files:[path]},
  }).errors,[]);
});
test("NR-005 manutenção autorizada do contrato central preserva rito posterior", async () => {
  const result=await fakeEvent("push",
    ["docs/frontend/governanca/MISSAO_ATIVA_4_1.json"],704);
  assert.equal(result.number,704);
  assert.equal(result.ordinaryDocument,true);
});
test("NR-005 manifesto imutável da #690 não pode ser trocado por PR posterior", async () => {
  await assert.rejects(()=>fakeEvent("push",
    ["docs/frontend/planos/P0_GOV_PLAN_690.json"],705),
    /manifesto #690 imutavel/);
});
test("NR-005 lista histórica não reatribui PR posterior à #690", () => {
  assert.equal(classifyProtectedPush(705,[files690[6]],true),"REGULAR_PR");
  assert.equal(classifyProtectedPush(705,[files690[7]],true),"REGULAR_PR");
  assert.equal(classifyProtectedPush(690,[files690[6]],true),"BUILD_690");
});
test("NR-005 schema do manifesto inválido nunca autoriza full_diff", () => {
  const wrong=manifest690();wrong.schema="contaos.invalid";
  assert.match(gov690([files690[0]],{governancePlan:wrong}).errors.join(" "),
    /manifesto full_diff protegido/);
});
test("NR-005 Git raw preserva modo existente", () => {
  const a="a".repeat(40),b="b".repeat(40),p=files690[2];
  assert.equal(verifyRawFullDiffModes(":100644 100644 "+a+" "+b+" M\0"+p+"\0",[p]),true);
});
test("NR-005 chmod 100644 para 100755 é FAIL", () => {
  const a="a".repeat(40),p=files690[2];
  assert.throws(()=>verifyRawFullDiffModes(":100644 100755 "+a+" "+a+" M\0"+p+"\0",[p]),
    /modo Git alterado/);
});
test("NR-005 renomeação com bit executável alterado é FAIL", () => {
  const a="a".repeat(40),p=files690[2],q=files690[3];
  assert.throws(()=>verifyRawFullDiffModes(":100644 100755 "+a+" "+a+" R100\0"+p+"\0"+q+"\0",[p,q]),
    /modo Git alterado/);
});
test("NR-005 symlink, gitlink e modo histórico inseguro são FAIL", () => {
  const a="a".repeat(40),p=files690[2];
  for (const mode of ["120000","160000"]) {
    assert.throws(()=>verifyRawFullDiffModes(":"+mode+" 100644 "+a+" "+a+" T\0"+p+"\0",[p]),
      /modo Git alterado/);
  }
});
test("NR-005 divergência no raw e no full_diff é FAIL", () => {
  assert.throws(()=>verifyRawFullDiffModes("",[files690[2]]),/modo raw difere/);
});
test("NR-005 adição/exclusão mantêm modos regulares", () => {
  const a="a".repeat(40),zeros="0".repeat(40),p=files690[2],q=files690[3];
  const raw=":000000 100644 "+zeros+" "+a+" A\0"+p+"\0"+
    ":100644 000000 "+a+" "+zeros+" D\0"+q+"\0";
  assert.equal(verifyRawFullDiffModes(raw,[p,q]),true);
});

test("NR-005 pull_request bloqueia manifesto #690 ANTES de N/A documental", () => {
  assert.throws(() => assertImmutableP0Governance([IMMUTABLE_P0_690_MANIFEST],
    "pull_request"), /imutável em pull_request antes de integrar/);
  const report = check(null, [IMMUTABLE_P0_690_MANIFEST], "75", [],
    {prNumber:701,governancePlan:null});
  assert.match(report.errors.join(" "), /manifesto protegido #690 imutável/);
});
test("NR-005 merge_group bloqueia manifesto protegido ANTES de admissão na fila", () => {
  assert.throws(() => assertImmutableP0Governance([IMMUTABLE_P0_690_MANIFEST],
    "merge_group"), /imutável em merge_group antes de integrar/);
  const report=check(null,[IMMUTABLE_P0_690_MANIFEST],"75",[],
    {prNumber:701,governancePlan:null});
  assert.ok(report.errors.length>0);
});
test("NR-005 push também bloqueia manifesto para não depender do último gate", () => {
  assert.throws(() => assertImmutableP0Governance([IMMUTABLE_P0_690_MANIFEST],
    "push"), /imutável em push antes de integrar/);
});
test("NR-005 renomeação do manifesto para outro nome é interceptada no full_diff", () => {
  const report=check(null,["docs/frontend/planos/PLANO_COMUM.md"],"75",[],{
    prNumber:701,
    fullDiffPaths:[IMMUTABLE_P0_690_MANIFEST,"docs/frontend/planos/PLANO_COMUM.md"],
  });
  assert.match(report.errors.join(" "), /manifesto protegido #690 imutável/);
});
test("NR-005 documentação comum não herda bloqueio do manifesto protegido", () => {
  const doc="docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md";
  for(const event of ["pull_request","push","merge_group"])
    assert.equal(assertImmutableP0Governance([doc],event),true);
  assert.deepEqual(check(null,[doc],"75",[],{prNumber:701}).errors,[]);
});
test("NR-005 manifesto é bloqueado mesmo quando número da PR é #690", () => {
  const report=check(null,[IMMUTABLE_P0_690_MANIFEST],"75",[],{
    prNumber:690,governancePlan:manifest690(),fullDiffPaths:[IMMUTABLE_P0_690_MANIFEST],
  });
  assert.match(report.errors.join(" "), /manifesto protegido #690 imutável/);
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
    const head = git("rev-parse", "feature");
    const checkout = git("rev-parse", "HEAD");
    writeFileSync(eventPath, JSON.stringify({
      repository: { full_name: "contaos999999/contaos-hml-control" },
      ref: "refs/heads/main", before: base, after: checkout,
      number: 679, pull_request: { number, base: {ref: "main", sha: base}, head: {sha: head} },
    }));
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
 url.endsWith('/pulls')?${JSON.stringify(variant === "fake"?[]:[{number}])}:
 url.includes('/pulls/')?{number:${JSON.stringify(number)},base:{ref:'main'},merged_at:'fixture',merge_commit_sha:'${checkout}',head:{sha:'${head}'}}:
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
    if (expected) {
      const error = event === "unknown" ? /evento GitHub sem proveniência/ :
        variant === "fake" ? /sem PR autenticada/ :
        variant === "wrong-base" ? /primeiro pai/ :
        !Number.isInteger(number) ? /PR\/base\/head do evento/ :
        /arquivo restrito por PR/;
      assert.match(result.stderr, error);
    } else assert.match(result.stdout, /P0 RCA PASS V1/);
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


const PA_HEAD = "1".repeat(40), PA_BASE = "2".repeat(40);
const PA_FILES = Array.from({length:14},(_,i) => "docs/frontend/approved-"+i+".md");
const PA_REPORT = "Escopo fechado nos 14 arquivos, base viva e checks autenticados; ".repeat(10) +
  "Inspeção de causa raiz, eventos PR/push/fila, testes negativos, regressão, " +
  "proveniência de artifacts, controles de segurança e NO-GO de ativação.";
const PA_DIGEST = "sha256:"+"3".repeat(64);
function paFixture() {
  const record={
    schema:"contaos.assistant-preaudit.v2",
    kind:"ASSISTANT_PREAUDIT_NOT_INDEPENDENT",
    verdict:"PASS",pr:690,head:PA_HEAD,base:PA_BASE,
    run_id:"PA-690-AUD-001", report:PA_REPORT,
    report_sha256:createHash("sha256").update(PA_REPORT).digest("hex"),
    criteria:Object.fromEntries(ASSISTANT_PREAUDIT_CRITERIA.map(x=>[x,"PASS"])),
    adversarial_v2:{
      head:PA_HEAD,base:PA_BASE,second_pass:"PASS",meta_audit:"PASS",red_green:"PASS",
      red_runs:[44880700882,44880711676],
      red_cases:ADVERSARIAL_V2_CAUSAL_CASES.map(x=>({...x,green_head:PA_HEAD,
        run_id:777,job_id:889})),
      lenses:Object.fromEntries(ADVERSARIAL_V2_LENSES.map(x=>[x,"PASS"])),
    },
    artifact:{id:9001,digest:PA_DIGEST,run_id:777,run_attempt:1,job_id:888},
  };
  const comment={id:17,user:{login:"contaos9999"},
    body:"PRÉ-AUDITORIA DO ASSISTENTE\n\n<!-- "+
      ASSISTANT_PREAUDIT_MARKER+"\n"+JSON.stringify(record)+"\n-->"};
  return {record, pr:{
    number:690,state:"open",merged:false,draft:false,
    head:{sha:PA_HEAD},base:{sha:PA_BASE,ref:"main",
      repo:{full_name:"contaos999999/contaos-hml-control"}},
  },currentMain:PA_BASE,
  manifest:{schema:"contaos.p0.gov-plan.v1",approved:true,pr_number:690,
    full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]},
  paths:[...PA_FILES],comments:[comment],reviews:[],
  checkRuns:[...PRECERT_REQUIRED_CHECKS,ADVERSARIAL_V2_CHECK_NAME].map((name,i)=>({
    id:name.includes("Teste C")?888:(name===ADVERSARIAL_V2_CHECK_NAME?889:100+i), name, head_sha:PA_HEAD, app:{id:15368},
    details_url:name.includes("Teste C") ? "https://github.com/contaos999999/contaos-hml-control/actions/runs/777/job/888" :
      name===ADVERSARIAL_V2_CHECK_NAME ? "https://github.com/contaos999999/contaos-hml-control/actions/runs/777/job/889" :
      "https://github.com/contaos999999/contaos-hml-control/actions/runs/777/job/"+(100+i),
    status:"completed",conclusion:"success",
  })),
  artifact:{id:9001,name:"contaos-teste-c-777-1",digest:PA_DIGEST,expired:false,
    workflow_run:{head_sha:PA_HEAD,id:777}},
  redProvenance:[44880700882,44880711676].map((id,i)=>({
    run:{id,head_sha:i===0?"a".repeat(40):"b".repeat(40),
      event:"pull_request",head_branch:"build/p0-abs-fiscal-universal",
      pull_requests:[{number:690}],
      path:".github/workflows/contaos-auditoria-controller.yml",
      status:"completed",conclusion:"failure"},
    jobs:{total_count:1,jobs:[{name:"Controlador offline Windows",
      conclusion:"failure",steps:[{name:"P0-ABS supervisor universal N01-N17 (RED/GREEN)",
      conclusion:"failure"}]}]},
  })),
  v2Job:{id:889,run_id:777,head_sha:PA_HEAD,status:"completed",conclusion:"success",
    steps:["P0 FULL_PROTOCOL matriz integral e testemunhas executaveis",
      ...ADVERSARIAL_V2_STEP_NAMES,...ADVERSARIAL_V2_CAUSAL_CASES.map(x=>
      "P0 V2 CAUSAL_RED "+x.case_id)].map(name=>({name,status:"completed",conclusion:"success"}))},
  testCJob:{id:888,run_id:777,head_sha:PA_HEAD,
    status:"completed",conclusion:"success",
    steps:[{name:"Teste C Playwright — 24 telas, 4 larguras, 2 temas",conclusion:"success"}]},
  testCRun:{id:777,run_attempt:1,head_sha:PA_HEAD,event:"pull_request",
    status:"completed",conclusion:"success",
    path:".github/workflows/contaos-frontend-zero-drift.yml",
    pull_requests:[{number:690,head:{sha:PA_HEAD},base:{sha:PA_BASE}}]},
  testCAttemptJobs:{total_count:1,jobs:[{id:888,run_id:777,conclusion:"success"}]},
  expectedHead:PA_HEAD,expectedBase:PA_BASE};
}
const paCheck = (fixture) => validateAssistantPrecertRelease(fixture);
const setPaRecord = (f) => {
  f.comments[0].body="<!-- "+ASSISTANT_PREAUDIT_MARKER+"\n"+
    JSON.stringify(f.record)+"\n-->";
};

// P0-ABS NR-006 RED for the actual PR #690 review-triggered workflow
// duplicate: historical validations reject a perfectly valid second run.
function paReviewRerunFixture({state="success", prior="success"}={}){
  const f=paFixture();
  const priorCheck=f.checkRuns.find(x=>x.name===ADVERSARIAL_V2_CHECK_NAME);
  priorCheck.started_at="2026-11-21T12:20:00Z";
  priorCheck.conclusion=prior;
  f.v2Job.conclusion=prior;
  f.reviews=[{id:80,commit_id:PA_HEAD,user:{login:"Edivan5002"},
    state:"COMMENTED",submitted_at:"2026-11-21T12:30:00Z"}];
  const next={...structuredClone(priorCheck),
    id:990,started_at:"2026-11-21T12:35:00Z",
    status:state==="queued"?"queued":"completed",
    conclusion:state==="queued"?null:state,
    details_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/778/job/990"};
  f.checkRuns.push(next);
  const windows=f.checkRuns.find(x=>x.name==="Controlador offline Windows");
  f.checkRuns.push({...structuredClone(windows),id:991,
    status:"completed",conclusion:"success",
    details_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/778/job/991"});
  f.receiptV2Job=structuredClone(f.v2Job);
  f.v2Job={...structuredClone(f.v2Job),id:990,run_id:778,
    status:state==="queued"?"queued":"completed",
    conclusion:state==="queued"?null:state};
  return f;
}
test("P0 NR-006 RED: historical V2 job absent from current check list must use authenticated run attempt",()=>{
  const f=paFixture();
  const oldJob=structuredClone(f.v2Job);
  oldJob.name=ADVERSARIAL_V2_CHECK_NAME;
  f.receiptV2Job=oldJob;
  f.v2Job={...structuredClone(oldJob),id:990,run_id:778};
  const check=f.checkRuns.find(x=>x.name===ADVERSARIAL_V2_CHECK_NAME);
  check.id=990;
  check.details_url="https://github.com/contaos999999/contaos-hml-control/actions/runs/778/job/990";
  f.historicalV2Run={
    id:777,head_sha:PA_HEAD,head_branch:"build/p0-abs-fiscal-universal",
    path:".github/workflows/contaos-auditoria-controller.yml",
    event:"pull_request",run_attempt:3,status:"completed",conclusion:"failure",
    repository:{full_name:"contaos999999/contaos-hml-control"},
    pull_requests:[{number:690,head:{sha:PA_HEAD},base:{sha:PA_BASE}}],
  };
  f.historicalV2Attempt=1;
  f.historicalV2AttemptJobs={total_count:1,jobs:[{
    id:889,run_id:777,name:ADVERSARIAL_V2_CHECK_NAME,
    head_sha:PA_HEAD,status:"completed",conclusion:"success",
  }]};
  const historic=paCheck(f);
  assert.equal(historic.pass,true,
    "historical GitHub Actions V2 job in authenticated earlier attempt must remain usable: "+
      JSON.stringify(historic.issues));
  const forged=structuredClone(f);
  forged.historicalV2AttemptJobs.jobs[0].id=1234;
  assert.equal(paCheck(forged).pass,false,"foreign historical job must not release");
  const stale=structuredClone(f);
  stale.v2Job.conclusion="failure";
  assert.equal(paCheck(stale).pass,false,"latest failed V2 must veto historical green");
  const missing=structuredClone(f);
  delete missing.historicalV2AttemptJobs;
  assert.equal(paCheck(missing).pass,false,"missing attempt provenance must fail closed");
});

test("P0 NR-006 RED: COMMENTED starts second successful V2 run on unchanged HEAD",()=>{
  const f=paReviewRerunFixture();
  assert.equal(paCheck(f).pass,true,
    "new successful review-triggered run must not poison legitimate same-HEAD precert");
});
test("P0 NR-006 RED: most recent failed or queued V2 check defeats older PASS",()=>{
  for(const state of ["queued","failure"]){
    const f=paReviewRerunFixture({state});
    const z=paCheck(f);
    assert.equal(z.pass,false,state);
    assert.equal(z.release,"NO_GO");
  }
});

test("P0 NR-006 review rerun: newer Windows job failed or pending blocks previous green",()=>{
  for(const status of ["in_progress","completed"]){
    const f=paReviewRerunFixture();
    const win=f.checkRuns.find(x=>x.id===991);
    win.status=status;win.conclusion=status==="completed"?"failure":null;
    const out=paCheck(f);
    assert.equal(out.pass,false,JSON.stringify(out));
    assert.match(out.issues.join(" "),/check exigido/);
  }
});


test("P0 NR-006: visual ZIP from old Teste C job cannot survive newer attempt",()=>{
  const f=paReviewRerunFixture();
  f.checkRuns.push({id:992,
    name:"Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
    head_sha:PA_HEAD,app:{id:15368},status:"completed",conclusion:"success",
    details_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/779/job/992"});
  const stale=paCheck(f);
  assert.equal(stale.pass,false,JSON.stringify(stale));
  assert.match(stale.issues.join(" "),/artefato/);
  f.record.artifact={...f.record.artifact,id:9002,job_id:992,run_id:779,run_attempt:2};
  f.artifact={...f.artifact,id:9002,workflow_run:{head_sha:PA_HEAD,id:779},
    name:"contaos-teste-c-779-2"};
  f.testCJob={...f.testCJob,id:992,run_id:779};
  f.testCRun={...f.testCRun,id:779,run_attempt:2};
  f.testCAttemptJobs={total_count:1,jobs:[{id:992,run_id:779,conclusion:"success"}]};
  setPaRecord(f);
  assert.equal(paCheck(f).pass,true,JSON.stringify(paCheck(f)));
});
test("P0 NR-006: newer Teste C pending or failed must block prior visual receipt",()=>{
  for(const status of ["queued","completed"]){
    const f=paReviewRerunFixture();
    f.checkRuns.push({id:992,
      name:"Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
      head_sha:PA_HEAD,app:{id:15368},status,
      conclusion:status==="queued"?null:"failure",
      details_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/779/job/992"});
    const out=paCheck(f);
    assert.equal(out.pass,false,JSON.stringify(out));
    assert.equal(out.release,"NO_GO");
  }
});

test("P0 NR-006 RED: newer green cannot launder failed recorded historical causal job",()=>{
  const f=paReviewRerunFixture({prior:"failure"});
  assert.equal(paCheck(f).pass,false);
});

test("P0 NR-006 fail-closed: duplicate V2 check forged App/ID/URL cannot release",()=>{
  for(const mutate of [
    f=>f.checkRuns.find(x=>x.id===990).app.id=999,
    f=>f.checkRuns.find(x=>x.id===990).details_url="https://example.test/evil",
    f=>f.checkRuns.find(x=>x.id===990).id=889,
    f=>f.checkRuns.find(x=>x.id===990).head_sha="f".repeat(40),
    f=>f.v2Job.steps.find(x=>x.name==="P0 V2 LAYER 01").conclusion="failure",
    f=>f.receiptV2Job.steps.find(x=>x.name==="P0 V2 CAUSAL_RED artifact_attempt").conclusion="failure",
  ]){const f=paReviewRerunFixture();mutate(f);
    const verdict=paCheck(f);assert.equal(verdict.pass,false,JSON.stringify(verdict));
    assert.equal(verdict.release,"NO_GO");
  }
});

test("P0 NR-006 RED: review veto overrides both successful runs on same HEAD",()=>{
  const f=paReviewRerunFixture();
  f.reviews.push({id:81,commit_id:PA_HEAD,user:{login:"Edivan5002"},
    state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T12:40:00Z"});
  assert.equal(paCheck(f).pass,false);
});


test("P0 FULL_PROTOCOL origin: exact workflow/run/attempt cannot be replaced by names",()=>{
  const check={id:991,name:"Controlador offline Windows",head_sha:PA_HEAD,
    app:{id:15368},details_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/778/job/991"};
  const job={id:991,run_id:778,head_sha:PA_HEAD,name:check.name,
    status:"completed",conclusion:"success"};
  const run={id:778,head_sha:PA_HEAD,head_branch:"build/p0-abs-fiscal-universal",
    path:".github/workflows/contaos-auditoria-controller.yml",
    event:"pull_request_review",run_attempt:2,status:"completed",conclusion:"success",
    pull_requests:[{number:690,head:{sha:PA_HEAD},base:{sha:PA_BASE}}]};
  const attemptJobs={total_count:1,jobs:[structuredClone(job)]};
  const args={check,job,run,attemptJobs,head:PA_HEAD,base:PA_BASE,workflow:run.path};
  assert.equal(verifyPrecertRunOrigin(args),true);
  const mutators=[
    x=>x.run.path=".github/workflows/other.yml",
    x=>x.run.event="push",
    x=>x.run.head_branch="other",
    x=>x.run.pull_requests[0].number=679,
    x=>x.run.pull_requests[0].base.sha="f".repeat(40),
    x=>x.run.run_attempt=0,
    x=>x.run.conclusion="failure",
    x=>x.job.run_id=777,
    x=>x.attemptJobs.jobs[0].id=900,
    x=>x.attemptJobs.total_count=2,
    x=>x.check.app.id=9999,
  ];
  for(const mutate of mutators){
    const f=structuredClone(args);mutate(f);
    assert.equal(verifyPrecertRunOrigin(f),false,JSON.stringify(f));
  }
  const inProgress=structuredClone(args);inProgress.run.status="in_progress";
  inProgress.run.conclusion=null;
  assert.equal(verifyPrecertRunOrigin(inProgress),true,
    "parent run may still run preaudit after current job succeeded");
});
test("P0 FULL_PROTOCOL workflow queued before check exists must wait, not terminal false negative",()=>{
  const f=paFixture();
  const missing=f.checkRuns.filter(x=>x.name!=="ContaOS Frontend Zero-Drift");
  assert.equal(classifyPrecertReadiness(missing,"ContaOS Frontend Zero-Drift",PA_HEAD).state,"PENDING");
  const malformed=structuredClone(f.checkRuns);
  malformed.find(x=>x.name==="ContaOS Frontend Zero-Drift").app.id=1;
  assert.equal(classifyPrecertReadiness(malformed,"ContaOS Frontend Zero-Drift",PA_HEAD).state,"TERMINAL");
});

test("P0 FULL_PROTOCOL terminal checks never wait; pending checks never PASS",()=>{
  const f=paFixture(), name=ADVERSARIAL_V2_CHECK_NAME;
  assert.equal(classifyPrecertReadiness(f.checkRuns,name,PA_HEAD).state,"READY");
  for(const conclusion of ["failure","cancelled","skipped","neutral","timed_out"]){
    const bad=structuredClone(f.checkRuns);
    const target=bad.find(x=>x.name===name);
    target.status="completed";target.conclusion=conclusion;
    assert.equal(classifyPrecertReadiness(bad,name,PA_HEAD).state,"TERMINAL");
  }
  const queued=structuredClone(f.checkRuns);
  const latest=queued.find(x=>x.name===name);
  latest.status="queued";latest.conclusion=null;
  assert.equal(classifyPrecertReadiness(queued,name,PA_HEAD).state,"PENDING");
});


test("P0 FULL_PROTOCOL watchdog read-only permissions and hosted runner",()=>{
  const doc=readFileSync(".github/workflows/contaos-missao-auditoria.yml","utf8");
  const m=/\npermissions:\n((?:  [a-z-]+: [a-z]+\n)+)/.exec(doc);
  assert.ok(m,"explicit watchdog permissions missing");
  const p=m[1].trim().split("\n").map(x=>x.trim()).sort();
  assert.deepEqual(p,["contents: read","actions: read","checks: read",
    "pull-requests: read"].sort());
  assert.match(doc,/runs-on: ubuntu-22\.04/);
  assert.match(doc,/persist-credentials: false/);
  assert.match(doc,/if: github\.ref == 'refs\/heads\/main'/);
  assert.doesNotMatch(doc,/runs-on: self-hosted/);
  assert.doesNotMatch(doc,/permissions: write-all/);
  const mutations=[
    doc.replace("actions: read","actions: write"),
    doc.replace("runs-on: ubuntu-22.04","runs-on: self-hosted"),
    doc.replace("persist-credentials: false","persist-credentials: true"),
  ];
  assert.ok(mutations.every(x=>x!==doc));
  for(const bad of mutations)
    assert.ok(!(
      /\nactions: read\n/.test(bad) &&
      /runs-on: ubuntu-22\.04/.test(bad) &&
      /persist-credentials: false/.test(bad)),"mutant must violate a security invariant");
});
test("P0 META_PROTOCOL auditor-only hosted runner and no visual source drift",()=>{
  const controller=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const watchdog=readFileSync(".github/workflows/contaos-missao-auditoria.yml","utf8");
  const supervisor=readFileSync("scripts/auditoria/mission-supervisor.py","utf8");
  for(const workflow of [controller,watchdog]){
    assert.doesNotMatch(workflow,/runs-on:\s*self-hosted/i);
    assert.doesNotMatch(workflow,/\bpermissions:\s*write-all\b/i);
    assert.match(workflow,/pull-requests: read/);
    assert.match(workflow,/actions: read/);
    assert.match(workflow,/checks: read/);
  }
  assert.match(controller,/runs-on: windows-latest/);
  assert.match(watchdog,/runs-on: ubuntu-22\.04/);
  assert.match(supervisor,/Pure read-only evaluation/);
  assert.match(supervisor,/BUILD is deliberately diagnostic only/);
  assert.match(supervisor,/activation_authorized=false: diagnostic only/);
  assert.equal(PA_FILES.length,14);
  for(const name of PA_FILES)
    assert.doesNotMatch(name,/^(?:src|public)\/|(?:package|bun|pnpm|yarn)-?lock/);
  assert.equal(PA_FILES.includes("src/integrations/supabase/types.ts"),false);
});

test("P0 META_PROTOCOL every active workflow excludes self-hosted auditor execution",()=>{
  const directory=".github/workflows";
  const names=readdirSync(directory).filter(x=>/\.ya?ml$/.test(x)).sort();
  assert.ok(names.includes("contaos-auditoria-controller.yml"));
  assert.ok(names.includes("contaos-missao-auditoria.yml"));
  assert.ok(names.length>=2);
  for(const name of names){
    const source=readFileSync(join(directory,name),"utf8");
    assert.doesNotMatch(source,/\bself-hosted\b/i,
      "self-hosted runner requires separate authenticated isolation: "+name);
  }
  // An intentionally poisoned workflow must be rejected even when not one
  // of the two auditor workflow filenames used by the earlier fixture.
  const adversarial="name: unrelated\njobs:\n  audit:\n    runs-on: [self-hosted, Linux]\n";
  assert.match(adversarial,/\bself-hosted\b/i);
});

test("P0 META_PROTOCOL six predecessor checks plus own gate no cycle",()=>{
  const gate="P0-ABS Preauditoria Assistente (precert apenas)";
  const expected=[
    "ContaOS Frontend Zero-Drift",
    "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
    "ContaOS P0-NR-001 Integridade e Provas",
    "protect-types",
    "Controlador offline Windows",
  ];
  assert.deepEqual([...PRECERT_REQUIRED_CHECKS],expected);
  assert.equal(PRECERT_REQUIRED_CHECKS.length,5);
  assert.equal(PRECERT_REQUIRED_CHECKS.includes("Controlador offline Windows"),true);
  const prerequisites=[...PRECERT_REQUIRED_CHECKS,ADVERSARIAL_V2_CHECK_NAME];
  assert.equal(prerequisites.length,6);
  assert.equal(new Set(prerequisites).size,6);
  assert.equal(prerequisites.includes(gate),false,
    "a gate may not require its own output to be green before running");
  const f=paFixture();
  assert.ok(prerequisites.every(name=>f.checkRuns.some(x=>x.name===name)));
  assert.equal(f.checkRuns.some(x=>x.name===gate),false);
  const result=paCheck(f);
  assert.equal(result.pass,true,"valid predecessor proof permits the gate to reach PASS");
  assert.equal(result.release,"PRE_CERTIFICATION_ONLY");
  // Seven contexts are observed AFTER the gate itself returns success.
  assert.equal(prerequisites.length+1,7);
});

test("P0 FULL_PROTOCOL global checks bound to exact HEAD and issuer",()=>{
  const f=paFixture();
  const req=[...PRECERT_REQUIRED_CHECKS,ADVERSARIAL_V2_CHECK_NAME];
  assert.equal(req.length,6);
  for(const name of req)
    assert.equal(classifyPrecertReadiness(f.checkRuns,name,PA_HEAD).state,"READY",name);
  for(const mutation of [
    x=>x.find(c=>c.name===PRECERT_REQUIRED_CHECKS[0]).head_sha="a".repeat(40),
    x=>x.find(c=>c.name===PRECERT_REQUIRED_CHECKS[0]).app.id=0,
    x=>x.find(c=>c.name===PRECERT_REQUIRED_CHECKS[0]).conclusion="skipped",
    x=>x.find(c=>c.name===PRECERT_REQUIRED_CHECKS[0]).status="queued",
  ]){
    const altered=structuredClone(f.checkRuns);mutation(altered);
    assert.notEqual(classifyPrecertReadiness(altered,PRECERT_REQUIRED_CHECKS[0],PA_HEAD).state,
      "READY");
  }
});

test("P0 FULL_PROTOCOL controller read-only permissions cannot grant write",()=>{
  const source=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const m=/\npermissions:\n((?:  [a-z-]+: [a-z]+\n)+)/.exec(source);
  assert.ok(m,"explicit permission allowlist missing");
  const items=m[1].trim().split("\n").map(x=>x.trim()).sort();
  const expected=["contents: read","checks: read","actions: read","pull-requests: read","issues: read"].sort();
  assert.deepEqual(items,expected);
  for(const change of ["pull-requests: write","actions: write"]){
    const tampered=source.replace(change.replace("write","read"),change);
    const k=/\npermissions:\n((?:  [a-z-]+: [a-z]+\n)+)/.exec(tampered);
    assert.notDeepEqual(k[1].trim().split("\n").map(x=>x.trim()).sort(),expected);
  }
});
test("P0 FULL_PROTOCOL suite output cannot be accepted from names alone",()=>{
  const variants=[
    "# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n",
    "ok 1 - first\n# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n",
    "ok 1 - first\nnot ok 2 - failed\n# tests 2\n# pass 1\n# fail 1\n# skipped 0\n# cancelled 0\n",
  ];
  for(const t of variants)
    assert.equal(parseFullProtocolSuiteResult("rca",{status:0,stdout:t}).passed,false);
  const good="ok 1 - first\nok 2 - second\n# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n";
  const result=parseFullProtocolSuiteResult("rca",{status:0,stdout:good});
  assert.equal(result.passed,true);
  assert.deepEqual(result.successfulNames,["first","second"]);
  assert.equal(parseFullProtocolSuiteResult("rca",{status:1,stdout:good}).passed,false);
});


test("P0 FULL_PROTOCOL 100% of mapped authorization conditions require executed PASS",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const tests={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const manifest={full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]};
  const coverage=auditFullProtocolCoverage({protocol,tests,source,workflow,manifest,
    mission:{activation_authorized:false},paths:[...PA_FILES]});
  assert.equal(coverage.verdict,"COVERAGE_MAPPED_NOT_EXECUTED",JSON.stringify(coverage.issues));
  const suiteKey=x=>x.source.includes("mission_supervisor")?"python":
    x.source.includes("merge-group-context")?"queue":"rca";
  const suites=Object.fromEntries(["python","rca","queue"].map(k=>{
    const names=[...new Set(coverage.rows.filter(x=>x.source&&suiteKey(x)===k)
      .map(x=>x.witness))];
    return [k,{exitCode:0,passed:true,successfulNames:names,executed:names.length,
      outputSha256:"a".repeat(64)}];
  }));
  const target={head:PA_HEAD,base:PA_BASE,checkoutSha:PA_HEAD};
  const valid=attestFullProtocolExecutions(coverage,suites,target);
  assert.equal(valid.verdict,"EXECUTED_PASS_FOR_BUILD_ONLY",JSON.stringify(valid.issues));
  assert.equal(valid.rows.filter(x=>x.source&&x.scope==="BUILD"&&
    x.execution!=="EXECUTED_PASS").length,0);
  const activation=valid.rows.filter(x=>x.scope==="BUILD_NEGATIVE_PROOF_ACTIVATION_EXTERNAL");
  assert.ok(activation.length>=11,"privileged activation is never certified by synthetic tests");
  assert.ok(activation.every(x=>x.execution==="BUILD_NEGATIVE_PASS_ACTIVATION_BLOCKED"));
  assert.equal(valid.activationBlocked,activation.length);
  const independent=valid.rows.filter(x=>x.scope==="BUILD_NEGATIVE_PROOF_STAGE_REVIEW_PENDING");
  assert.deepEqual(independent.map(x=>x.id).sort(),[
    "PLAN-S3-RULE-05","PLAN-S3-RULE-06","S5.1:Revisão independente"].sort(),
    "PLAN §3 technical review and post-merge CERTIFIED require stage-specific material proof");
  assert.equal(valid.independentAuditPending,3);
  assert.equal(valid.independentAuditPendingStage,"PROD");
  assert.equal(valid.stageReviewPending,3);
  assert.ok(independent.every(x=>x.required_review_by_stage.PRE_PROD==="ASSISTED_PRE_PROD"&&x.required_review_by_stage.PROD==="INDEPENDENT"));
  assert.ok(independent.every(x=>
    x.execution==="BUILD_NEGATIVE_PASS_STAGE_REVIEW_PENDING" &&
    valid.external.some(e=>e.requirement===x.id &&
      e.status==="BLOCKED_EXTERNAL_FOR_STAGE_REVIEW")),
    "none of three historical review obligations may be self-certified");
  assert.equal(valid.executed+valid.activationBlocked+valid.stageReviewPending,
    valid.requirements);
  assert.ok(activation.every(x=>valid.external.some(e=>e.requirement===x.id &&
    e.status==="BLOCKED_EXTERNAL_FOR_ACTIVATION")));
  assert.ok(valid.external.length>=4);
  assert.ok(valid.external.every(x=>[
    "BLOCKED_EXTERNAL_FOR_ACTIVATION","BLOCKED_EXTERNAL_FOR_STAGE_REVIEW"
  ].includes(x.status)));
  // A successful test with the expected words embedded later in its title
  // is NOT the canonical executable witness for that requirement.
  // Prevent a generic or unrelated test name from laundering multiple gates.
  const forgedNames=structuredClone(suites);
  for(const suite of Object.values(forgedNames)){
    suite.successfulNames=suite.successfulNames.map(name=>"UNRELATED TEST: "+name);
  }
  assert.equal(attestFullProtocolExecutions(coverage,forgedNames,target).verdict,
    "CHANGES_REQUESTED","substring-only witness must not certify BUILD");
  // A composite section MUST have its complete constituent evidence.
  // A green last layer or last lens cannot stand in for the whole obligation.
  const cases=[
    ["S5.5:Dez camadas, sempre na ordem","rca","P0 V2 LAYER 01:"],
    ["S5.5:Doze perspectivas obrigatórias","rca","P0 V2 LENS security:"],
    ["S5-EVENT-MATRIX","rca","P0 PRE-AUDIT push da #690"],
    ["S5.1:NR-005 / falsificações","rca","NR-005 script adicional fora dos 14 caminhos sempre falha"],
    ["S5.1:WDG-02 / progresso","python","test_watchdog_inactivity_exact_24_hour_boundary"],
  ];
  for(const [id,key,prefix] of cases){
    const missing=structuredClone(suites);
    const orig=missing[key].successfulNames.length;
    missing[key].successfulNames=missing[key].successfulNames.filter(x=>!x.startsWith(prefix));
    assert.ok(missing[key].successfulNames.length<orig,"fixture must remove an executed test");
    missing[key].executed=missing[key].successfulNames.length;
    const decision=attestFullProtocolExecutions(coverage,missing,target);
    assert.equal(decision.rows.find(x=>x.id===id)?.execution,"UNPROVEN",
      "compound obligation "+id+" cannot inherit PASS from a partial set");
    assert.equal(decision.verdict,"CHANGES_REQUESTED");
  }
  const noTest=structuredClone(suites);
  noTest.queue.successfulNames=noTest.queue.successfulNames.filter(x=>!x.includes("N13 prova git real"));
  noTest.queue.executed=noTest.queue.successfulNames.length;
  assert.equal(attestFullProtocolExecutions(coverage,noTest,target).verdict,"CHANGES_REQUESTED");
  const failed=structuredClone(suites);failed.python.exitCode=1;
  assert.equal(attestFullProtocolExecutions(coverage,failed,target).verdict,"CHANGES_REQUESTED");
  const mismatched={...target,head:"invalid"};
  assert.equal(attestFullProtocolExecutions(coverage,suites,mismatched).verdict,"CHANGES_REQUESTED");
});


test("P0 §5.6 semantic completeness never inherits PASS from executable matrix",()=>{
  const matrix={verdict:"EXECUTED_PASS_FOR_BUILD_ONLY",rows:[
    {id:"PLAN-S3-RULE-01",execution:"EXECUTED_PASS"},
    {id:"S5.6:Prova semântica por cláusula",execution:"EXECUTED_PASS"},
  ]};
  const empty=auditNormativeSemanticCompleteness(matrix,{});
  assert.equal(empty.verdict,"INCONCLUSIVE");
  assert.equal(empty.unproven,2);
  assert.equal(empty.sourceExpected,137,
    "all 71 PLAN + 29 amendment + 31 critical atomic + 6 N17 cases are mandatory");
  assert.equal(empty.sourceUnmapped.length,137,
    "an executable matrix alone cannot claim full source coverage");
  assert.equal(empty.sourceComplete,false);
  assert.equal(empty.release,"NO_GO");
  const fields={
    authority:{actor:"implementer",source:"PLAN §3"},
    antecedent:{event:"candidate branch",source:"PLAN §3"},
    outcomes:{positive:{decision:"eligible BUILD",source:"PLAN §3"},
      negative:{decision:"NO_GO",source:"PLAN §3"}},
    interactions:{clauses:["N01","N03"],counterexample:"wrong contract cannot pass"},
    live:{source:"GitHub Actions",url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/123",head:"a".repeat(40)},
    revocation:{trigger:"head change",source:"PLAN §3"},
    boundary:{phase:"BUILD",external:"activation NO_GO"},
  };
  const candidate=auditNormativeSemanticCompleteness(matrix,{
    "PLAN-S3-RULE-01":fields,
    "S5.6:Prova semântica por cláusula":fields,
  });
  assert.equal(candidate.unproven,0);
  assert.equal(candidate.sourceComplete,false,
    "seven axis fields on a partial set may never indicate closed normative scope");
  assert.equal(candidate.sourceUnmapped.length,137);
  assert.equal(candidate.verdict,"INCONCLUSIVE");
  assert.equal(candidate.release,"NO_GO");
  assert.equal(candidate.reviewRequired,true,
    "self-authored seven-field attestations cannot replace independent review");
  for(const [label,change] of [
    ["missing negative effect",x=>delete x.outcomes.negative],
    ["missing positive effect",x=>delete x.outcomes.positive],
    ["missing counterexample",x=>delete x.interactions.counterexample],
    ["missing source LIVE head",x=>delete x.live.head],
    ["invalid source LIVE head",x=>x.live.head="not-a-sha"],
    ["missing revocation source",x=>delete x.revocation.source],
    ["missing external boundary",x=>delete x.boundary.external],
    ["missing authority provenance",x=>delete x.authority.source],
  ]){
    const incomplete=structuredClone(fields);change(incomplete);
    const tested=auditNormativeSemanticCompleteness(matrix,{
      "PLAN-S3-RULE-01":incomplete,
      "S5.6:Prova semântica por cláusula":fields,
    });
    assert.equal(tested.unproven,1,label+" must be structurally UNPROVEN");
    assert.equal(tested.verdict,"INCONCLUSIVE");
  }
  const closedIds=[
    ...[["S3",10],["S31",9],["S4",14],["S5",18],["S6",6],
      ["S7",3],["S8",7],["S9",2],["S10",2]].flatMap(([section,count])=>
      Array.from({length:count},(_,i)=>"PLAN-"+section+"-"+
        String(i+1).padStart(2,"0"))),
    ...Array.from({length:29},(_,i)=>"EMENDA-"+String(i+1).padStart(2,"0")),
    ...Array.from({length:24},(_,i)=>"PLAN-S31-ATOM-A"+String(i+1).padStart(2,"0")),
    ...Array.from({length:7},(_,i)=>"PLAN-S6-RECOVERY-R"+String(i+1).padStart(2,"0")),
    ...["A","B","C","D","E","F"].map(x=>"EMENDA-N17-"+x),
  ];
  assert.equal(closedIds.length,137);
  const closedMatrix={verdict:"EXECUTED_PASS_FOR_BUILD_ONLY",
    rows:closedIds.map(id=>({id,execution:"EXECUTED_PASS"}))};
  const selfClaims=Object.fromEntries(closedIds.map(id=>[id,fields]));
  const selfAttested=auditNormativeSemanticCompleteness(closedMatrix,selfClaims);
  assert.equal(selfAttested.sourceComplete,true);
  assert.equal(selfAttested.sourceUnmapped.length,0);
  assert.equal(selfAttested.unproven,0);
  assert.equal(selfAttested.verdict,"INCONCLUSIVE",
    "137 perfect self-reports still cannot impersonate an independent auditor");
  assert.equal(selfAttested.reviewRequired,true);
  assert.equal(selfAttested.release,"NO_GO");
  const lost=auditNormativeSemanticCompleteness({
    ...closedMatrix,rows:closedMatrix.rows.slice(1)},selfClaims);
  assert.equal(lost.sourceComplete,false,"dropping one protected source must fail closed");
  assert.equal(lost.sourceUnmapped.length,1);
  assert.equal(lost.verdict,"INCONCLUSIVE");
  for(const missing of Object.keys(fields)){
    const mutant={...fields};delete mutant[missing];
    const result=auditNormativeSemanticCompleteness(matrix,{
      "PLAN-S3-RULE-01":mutant,
      "S5.6:Prova semântica por cláusula":fields,
    });
    assert.equal(result.unproven,1,"missing axis "+missing+" must fail closed");
    assert.equal(result.verdict,"INCONCLUSIVE");
  }
});

test("P0 PLAN protected ten mission rules require ten distinct BUILD witnesses",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const tests={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const manifest={full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]};
  const coverage=auditFullProtocolCoverage({protocol,tests,source,workflow,manifest,
    mission:{activation_authorized:false},paths:[...PA_FILES]});
  const required=Array.from({length:10},(_,i)=>"PLAN-S3-RULE-"+String(i+1).padStart(2,"0"));
  for(const id of required){
    const row=coverage.rows.find(x=>x.id===id);
    assert.ok(row,"protected PLAN rule missing from normative evidence: "+id);
    const activation=new Set(["02","04","09"]);
    const independent=new Set(["05","06"]);
    const n=id.slice(-2);
    const expected=activation.has(n)?"BUILD_NEGATIVE_PROOF_ACTIVATION_EXTERNAL":
      independent.has(n)?"BUILD_NEGATIVE_PROOF_STAGE_REVIEW_PENDING":"BUILD";
    assert.equal(row.scope,expected,
      "PLAN §3 rule "+n+" must not be counted as operational certification");
    assert.equal(row.status,"TEST_DECLARED_NOT_EXECUTED");
  }
  assert.equal(new Set(required).size,10);
  const activationIds=[
    "PLAN-S3.1-APP-IDENTITY","PLAN-S3.1-QUEUE",
    "PLAN-S3.1-STATUS-API","PLAN-S3.1-GROUP-AUTH",
    "PLAN-S3.1-OWNER-REVIEW","PLAN-S3.1-LIVE-TRIAL",
    "PLAN-S3.1-ADMIN-AUTH",
  ];
  for(const id of activationIds){
    const row=coverage.rows.find(x=>x.id===id);
    assert.ok(row,"protected PLAN 3.1 activation obligation omitted: "+id);
    assert.equal(row.scope,"BUILD_NEGATIVE_PROOF_ACTIVATION_EXTERNAL",
      "a synthetic negative cannot be represented as real activation");
    assert.equal(row.status,"TEST_DECLARED_NOT_EXECUTED");
  }
});

test("P0 META_PROTOCOL vacuous passed witness with unchanged name never proves semantics",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const tests={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const manifest={full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]};
  const args={protocol,tests,source,workflow,manifest,
    mission:{activation_authorized:false},paths:[...PA_FILES]};
  const baseline=auditFullProtocolCoverage(args);
  assert.equal(baseline.verdict,"COVERAGE_MAPPED_NOT_EXECUTED",JSON.stringify(baseline.issues));
  const exact=[
    "    def test_N17_revoked_specific_authorization_cannot_pass(self):",
    "        e = evidence(); e[\"owner_authorization\"][\"revoked\"] = True",
    "        self.assertIn(\"N17\", codes(mod.evaluate(contract(), e)))",
  ].join("\n");
  assert.ok(tests.python.includes(exact),"expected reviewed source of witness");
  const substituted=tests.python.replace(exact,[
    "    def test_N17_revoked_specific_authorization_cannot_pass(self):",
    "        pass  # Name kept, assertion removed: vacuous successful test",
  ].join("\n"));
  assert.notEqual(substituted,tests.python);
  const result=auditFullProtocolCoverage({...args,tests:{...tests,python:substituted}});
  assert.equal(result.verdict,"CHANGES_REQUESTED",
    "a renamed or assertion-free witness must invalidate the reviewed proof");
  assert.ok(result.issues.some(x=>x.includes("SEMANTIC_SOURCE_BLOB")),
    JSON.stringify(result.issues));
});

test("P0 META_PROTOCOL root obligations must reject omitted or added clauses",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const tests={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const manifest={full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]};
  const args={protocol,tests,source,workflow,manifest,
    mission:{activation_authorized:false},paths:[...PA_FILES]};
  const valid=auditFullProtocolCoverage(args);
  assert.equal(valid.verdict,"COVERAGE_MAPPED_NOT_EXECUTED",JSON.stringify(valid.issues));
  assert.ok(valid.requirements>=180);
  const fragments=[
    ["não aprova PR, não publica status e não executa merge","pode aprovar PR"],
    ["NO-GO"+String.fromCharCode(96)+" de ativação: independente","PASS de ativação: independente"],
    ["N17(c)=BLOCKED_EXTERNAL","N17(c)=PASS"],
    ["revogação de autorização mesmo após","revogação dispensada mesmo após"],
    ["não editar "+String.fromCharCode(96)+"src/","pode editar src/"],
  ];
  const mutants=fragments.map(([a,b])=>protocol.replace(a,b));
  mutants.push(protocol+"\nNova obrigação administrativa ainda não cadastrada.");
  for(const candidate of mutants){
    assert.notEqual(candidate,protocol);
    const result=auditFullProtocolCoverage({...args,protocol:candidate});
    assert.equal(result.verdict,"CHANGES_REQUESTED");
    assert.ok(result.issues.some(x=>x.startsWith("META_PROTOCOL:")),
      JSON.stringify(result.issues));
  }
});

test("P0 FULL_PROTOCOL matrix is fail-closed for absent N17 and missing critical control",()=>{
  const protocol=readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8");
  const tests={python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),
    rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),
    queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")};
  const source=readFileSync("scripts/p0-rca-impact-gate.mjs","utf8");
  const workflow=readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8");
  const manifest={full_diff:true,ativacao_autorizada:false,files:[...PA_FILES]};
  const fixture={protocol,tests,source,workflow,manifest,
    mission:{activation_authorized:false},paths:[...PA_FILES]};
  const ok=auditFullProtocolCoverage(fixture);
  assert.equal(ok.verdict,"COVERAGE_MAPPED_NOT_EXECUTED",JSON.stringify(ok.issues));
  assert.ok(ok.requirements>=55,"integral protocol matrix not just old findings");
  const missing=auditFullProtocolCoverage({...fixture,tests:{...tests,
    python:tests.python.replaceAll("test_N17_","test_NEUTRALIZED_")}});
  assert.equal(missing.verdict,"CHANGES_REQUESTED");
  assert.ok(missing.issues.some(x=>x.includes("N17")));
  const omitted=auditFullProtocolCoverage({...fixture,
    source:source.replaceAll("downloadPrecertArtifactDigest","OMITTED_ZIP")});
  assert.equal(omitted.verdict,"CHANGES_REQUESTED");
  assert.ok(omitted.issues.some(x=>x.includes("ZIP_REAL_BYTES")));
  const unauthorized=auditFullProtocolCoverage({...fixture,
    mission:{activation_authorized:true}});
  assert.equal(unauthorized.verdict,"CHANGES_REQUESTED");
  const falsifications=[
    "PR_ERRADA","ASSOCIACAO_AUSENTE","SQUASH","DOCUMENTO_EXTRA",
    "SCRIPT_EXTRA","RENOMEACAO","MODO_GIT",
  ];
  const provedIds=ok.rows.map(x=>x.id);
  for(const name of falsifications)
    assert.ok(provedIds.includes("S5.1:NR-005-FALSIFICACAO:"+name),
      "each distinct falsification needs its own executed witness: "+name);
  for(const name of [
    "FALHA_CI","CHECKS_AUSENTES","STALL_EXATO_2H",
    "INATIVIDADE_EXATA_24H","DIAGNOSTICO_SEM_AUTORIDADE",
  ]){
    assert.ok(provedIds.includes("S5.1:WDG02-PROGRESSO:"+name),
      "all independent watchdog progress conditions require named evidence: "+name);
  }


});

test("P0 META_PROTOCOL authoritative PLAN and amendment must match protected Git blobs",()=>{
  const base="e007c4bad8f2c66c489c55e4752b71bb19c5ced0";
  const manifest=JSON.parse(execFileSync("git",["show",base+
    ":docs/frontend/planos/P0_GOV_PLAN_690.json"],{encoding:"utf8"}));
  const plan=execFileSync("git",["show",base+":"+manifest.plan_documento],
    {encoding:"utf8"});
  const amendment=execFileSync("git",["show",base+":"+manifest.emenda_fila],
    {encoding:"utf8"});
  const canonical=execFileSync("git",["show",base+
    ":docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md"],
    {encoding:"utf8"});
  const proof=attestProtectedNormativeSources({manifest,plan,amendment,canonical});
  assert.equal(proof.verdict,"PASS",JSON.stringify(proof.issues));
  assert.equal(proof.activationAuthorized,false);
  for(const mutation of [
    x=>x.manifest={...x.manifest,ativacao_autorizada:true},
    x=>x.manifest={...x.manifest,plan_blob:"a".repeat(40)},
    x=>x.plan=x.plan+"silently added exception",
    x=>x.amendment=x.amendment.replace("autoria terceira","autoria da PR"),
    x=>x.manifest={...x.manifest,emenda_fila:"docs/foreign.md"},
    x=>x.canonical=null,
    x=>x.canonical=x.canonical.replace("Antes de enviar `APPROVE`","Envie `APPROVE`"),
  ]){
    const f={manifest:structuredClone(manifest),plan,amendment,canonical};
    mutation(f);
    const result=attestProtectedNormativeSources(f);
    assert.equal(result.verdict,"CHANGES_REQUESTED",JSON.stringify(result));
    assert.ok(result.issues.length>0);
  }
});

test("P0 META_PROTOCOL exhaustive cross-clause seven-dimensional authorization model",()=>{
  const versions=["v2","v1"];
  const reviews=["none","commented","changes_requested"];
  const statuses=["success","queued","failure"];
  const activation=[false,true];
  const artifacts=["valid","expired"];
  const freshness=["current","stale"];
  const issuers=["trusted","foreign"];
  let total=0,positive=0,negative=0;
  for(const version of versions)
  for(const review of reviews)
  for(const status of statuses)
  for(const activationAuthorized of activation)
  for(const art of artifacts)
  for(const head of freshness)
  for(const issuer of issuers){
    const f=paFixture();
    if(version==="v1"){f.record.schema="contaos.assistant-preaudit.v1";setPaRecord(f);}
    if(review!=="none")f.reviews=[{id:500,commit_id:PA_HEAD,
      user:{login:"Edivan5002"},
      state:review==="commented"?"COMMENTED":"CHANGES_REQUESTED",
      submitted_at:"2026-11-21T20:00:00Z"}];
    if(status!=="success"){
      const current=f.checkRuns.find(x=>x.name===ADVERSARIAL_V2_CHECK_NAME);
      current.status=status==="queued"?"queued":"completed";
      current.conclusion=status==="queued"?null:"failure";
    }
    f.manifest.ativacao_autorizada=activationAuthorized;
    if(art==="expired")f.artifact.expired=true;
    if(head==="stale")f.currentMain="f".repeat(40);
    if(issuer==="foreign")f.checkRuns[0].app.id=999;
    const z=paCheck(f);
    const allowed=version==="v2" && review!=="changes_requested" &&
      status==="success" && activationAuthorized===false && art==="valid" &&
      head==="current" && issuer==="trusted";
    assert.equal(z.pass,allowed,
      JSON.stringify({version,review,status,activationAuthorized,art,issues:z.issues}));
    assert.equal(z.release,allowed?"PRE_CERTIFICATION_ONLY":"NO_GO");
    if(allowed)positive++;else negative++;
    total++;
  }
  assert.equal(total,288);
  assert.equal(positive,2);
  assert.equal(negative,286);
});

test("P0 META_PROTOCOL audit verdict transport separation and V1/V2 precedence",()=>{
  const accepted=paFixture();
  const permitted=paCheck(accepted);
  assert.equal(permitted.verdict,"PASS");
  assert.equal(permitted.release,"PRE_CERTIFICATION_ONLY");
  assert.equal(accepted.manifest.ativacao_autorizada,false);
  const legacy=paFixture();
  legacy.record.schema="contaos.assistant-preaudit.v1";
  setPaRecord(legacy);
  const legacyResult=paCheck(legacy);
  assert.equal(legacyResult.pass,false);
  assert.equal(legacyResult.release,"NO_GO");
  assert.equal(legacyResult.verdict,"BLOCKED");
  const revoked=paFixture();
  revoked.reviews=[{id:300,commit_id:PA_HEAD,user:{login:"Edivan5002"},
    state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T19:00:00Z"}];
  const vetoed=paCheck(revoked);
  assert.equal(vetoed.verdict,"BLOCKED");
  assert.equal(vetoed.release,"NO_GO");
  assert.ok(vetoed.issues.some(x=>/CHANGES_REQUESTED/.test(x)));
  const tampered=paFixture();tampered.manifest.ativacao_autorizada=true;
  assert.equal(paCheck(tampered).release,"NO_GO");
  // A transport result is not an independent auditor's fourth/fifth decision.
  assert.notEqual(legacyResult.release,"PRE_CERTIFICATION_ONLY");
});

test("P0 PA positive: recorded assistant PASS exact HEAD/base with 5 CI and visual artifact permits precert only",()=>{
  const f=paFixture(),result=paCheck(f);
  assert.equal(result.pass,true);
  assert.equal(result.verdict,"PASS");
  assert.equal(result.release,"PRE_CERTIFICATION_ONLY");
});
test("P0 PA no assistant verdict means BLOCKED despite 5/5 CI",()=>{
  const f=paFixture(); f.comments=[];
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA CHANGES_REQUESTED after PASS supersedes old record",()=>{
  const f=paFixture();const second=structuredClone(f.comments[0]);
  second.id=18;const payload={...f.record,verdict:"CHANGES_REQUESTED"};
  second.body="<!-- "+ASSISTANT_PREAUDIT_MARKER+"\n"+JSON.stringify(payload)+"\n-->";
  f.comments.push(second);assert.equal(paCheck(f).pass,false);
});
test("P0 PA author is validated by GitHub, not by the body",()=>{
  const f=paFixture();f.comments[0].user.login="unexpected-author";
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA stale HEAD or stale base invalidates PASS immediately",()=>{
  for(const key of ["expectedHead","expectedBase"]){
    const f=paFixture();f[key]="f".repeat(40);
    assert.equal(paCheck(f).pass,false,key);
  }
});
test("P0 PA manifesto full diff must match exactly all 14 paths",()=>{
  const f=paFixture();f.paths.push("scripts/unauthorized.mjs");
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA protected manifest mutated by PR cannot be accepted",()=>{
  const f=paFixture();f.paths[0]="docs/frontend/planos/P0_GOV_PLAN_690.json";
  f.manifest.files[0]=f.paths[0];
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA missing/duplicate required CI never releases precert",()=>{
  for(const mutator of [
    f=>f.checkRuns.pop(),
    f=>f.checkRuns.push({...f.checkRuns[0],id:999}),
  ]){
    const f=paFixture();mutator(f);assert.equal(paCheck(f).pass,false);
  }
});
test("P0 PA check with foreign App is not GitHub Actions check",()=>{
  const f=paFixture();f.checkRuns[0].app.id=987;
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA neutral/skipped check is not success",()=>{
  for(const conclusion of ["neutral","skipped","failure"]){
    const f=paFixture();f.checkRuns[0].conclusion=conclusion;
    assert.equal(paCheck(f).pass,false);
  }
});
test("P0 PA check with old SHA or missing id cannot certify same HEAD",()=>{
  const f=paFixture();f.checkRuns[0].head_sha="f".repeat(40);
  assert.equal(paCheck(f).pass,false);
  f.checkRuns[0].head_sha=PA_HEAD;f.checkRuns[0].id=null;
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA altered report cannot pass SHA256 evidence",()=>{
  const f=paFixture();f.record.report+="altered after report hash";
  setPaRecord(f);assert.equal(paCheck(f).pass,false);
});
test("P0 PA incomplete criteria do not pass even with correct hash",()=>{
  const f=paFixture();f.record.criteria.negative_tests="NOT_EXECUTED";
  setPaRecord(f);assert.equal(paCheck(f).pass,false);
});
test("P0 PA artifact digest and HEAD must match GitHub API",()=>{
  const f=paFixture();f.artifact.digest="sha256:"+"e".repeat(64);
  assert.equal(paCheck(f).pass,false);
  f.artifact.digest=PA_DIGEST;f.artifact.workflow_run.head_sha="c".repeat(40);
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA PR merged/draft or main moved is not open pre-cert snapshot",()=>{
  for(const property of ["merged","draft"]){
    const f=paFixture();f.pr[property]=true;
    assert.equal(paCheck(f).pass,false);
  }
  const f=paFixture();f.currentMain="f".repeat(40);
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA last structured verdict is authoritative, never PASS substring",()=>{
  const f=paFixture();f.comments[0].body="PASS, check verde, liberado manualmente";
  assert.equal(parseAssistantPreaudit(f.comments[0].body),null);
  assert.equal(paCheck(f).pass,false);
});

test("P0 PA foreign run artifact on same SHA must block",()=>{
  const f=paFixture();f.artifact.workflow_run.id=12345;
  assert.equal(paCheck(f).pass,false);
});
test("P0 PA foreign run attempt or job must block",()=>{
  for (const key of ["run_attempt","job_id"]) {
    const f=paFixture();f.record.artifact[key]=99;
    setPaRecord(f);assert.equal(paCheck(f).pass,false,key);
  }
});
test("P0 PA missing Playwright execution step must block",()=>{
  const f=paFixture();f.testCJob.steps=[{name:"upload",conclusion:"success"}];
  assert.equal(paCheck(f).pass,false);
});

test("P0 adversarial incomplete attempt pagination and failed workflow block",()=>{
  for(const mutate of [
    f=>f.testCAttemptJobs.total_count=2,
    f=>f.testCRun.conclusion="failure",
    f=>f.testCRun.status="in_progress",
  ]){const f=paFixture();mutate(f);assert.equal(paCheck(f).pass,false)}
});
test("P0 adversarial wrong workflow and unrelated PR cannot release",()=>{
  for(const mutate of [
    f=>f.testCRun.path=".github/workflows/unrelated.yml",
    f=>f.testCRun.pull_requests[0].number=691,
    f=>f.testCRun.pull_requests[0].base.sha="f".repeat(40),
    f=>f.testCAttemptJobs.jobs[0].id=999,
    f=>f.testCRun.run_attempt=2,
    f=>f.checkRuns.find(x=>x.name.includes("Teste C")).details_url="https://evil.example/actions/runs/777/job/888",
  ]){const f=paFixture();mutate(f);assert.equal(paCheck(f).pass,false)}
});
test("P0 adversarial upload labeled Teste C is not Playwright proof",()=>{
  const f=paFixture();f.testCJob.steps=[{name:"Upload Teste C evidence",conclusion:"success"}];
  assert.equal(paCheck(f).pass,false);
});

async function paLiveVerification({mutateReadback,manual=false,pending=false,extraV2=null}={}) {
  const f=extraV2?paReviewRerunFixture({state:extraV2}):paFixture();
  if(pending){f.checkRuns[0].status="in_progress";f.checkRuns[0].conclusion=null;f.comments=[];}
  let commentsRead=0, checksRead=0, reviewsRead=0, prReads=0, artifactReads=0;
  const observedPaths=[];
  const fakeApi=async path=>{
    observedPaths.push(path);
    if(path.endsWith("/pulls/690")) {prReads++;const pr=structuredClone(f.pr);if(prReads===2 && mutateReadback==="draft") pr.draft=true;return pr;}
    if(path.endsWith("/git/ref/heads/main")) return {object:{sha:PA_BASE}};
    if(path.endsWith("/commits/"+PA_HEAD+"/check-runs?per_page=100")){
      checksRead++;
      const runs=structuredClone(f.checkRuns);
      if(checksRead===2 && mutateReadback==="checks") runs[0].conclusion="failure";
      if(checksRead===2 && mutateReadback==="newV2fail") runs.find(x=>x.id===990).conclusion="failure";
      return {total_count:runs.length,check_runs:runs};
    }
    if(path.endsWith("/actions/artifacts/9001")) {artifactReads++;const art=structuredClone(f.artifact);if(artifactReads===2 && mutateReadback==="artifact") art.expired=true;return art;}
    if(path.endsWith("/actions/jobs/888")) return f.testCJob;
    if(path.endsWith("/actions/jobs/889")) return f.receiptV2Job??f.v2Job;
    if(path.endsWith("/actions/jobs/990")) return f.v2Job;
    for(const [i,id] of [44880700882,44880711676].entries()){
      if(path.endsWith("/actions/runs/"+id)) return f.redProvenance[i].run;
      if(path.endsWith("/actions/runs/"+id+"/jobs?per_page=100")) return f.redProvenance[i].jobs;
    }
    if(path.endsWith("/actions/runs/777")) return f.testCRun;
    if(path.endsWith("/actions/runs/777/attempts/1/jobs?per_page=100"))
      return f.testCAttemptJobs;
    throw Error("unmocked GitHub GET "+path);
  };
  const fakeList=async path=>{
    if(path.endsWith("/pulls/690/reviews")){
      reviewsRead++;
      const reviews=structuredClone(f.reviews);
      if((reviewsRead===2 && mutateReadback==="reviews") ||
         (reviewsRead===3 && mutateReadback==="postZipReview"))
        reviews.push({id:81,commit_id:PA_HEAD,user:{login:"Edivan5002"},
          state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T21:00:00Z"});
      return reviews;
    }
    if(path.endsWith("/pulls/690/files"))
      return f.paths.map(filename=>({filename,status:"modified"}));
    if(path.endsWith("/issues/690/comments")){
      commentsRead++;
      const comments=structuredClone(f.comments);
      if(commentsRead===2 && mutateReadback==="comments") {
        const next=structuredClone(comments[0]);next.id=19;
        next.body=next.body.replace('"verdict":"PASS"','"verdict":"CHANGES_REQUESTED"');
        comments.push(next);
      }
      return comments;
    }
    throw Error("unmocked GitHub list "+path);
  };
  const outcome=await verifyAssistantPrecertInGithub({
    token:"fixture-only",api:fakeApi,list:fakeList,
    originVerify:async()=>true,
    zipDigest:async()=>{
      if(mutateReadback==="zipMissing")throw Error("404 missing ZIP");
      if(mutateReadback==="zipMismatch")return {digest:"sha256:"+"f".repeat(64),bytes:1024};
      return {digest:f.artifact.digest,bytes:1024};
    },
    baseManifest:()=>f.manifest,
    env:{GITHUB_EVENT_NAME:manual?"workflow_dispatch":"pull_request",
      GITHUB_REF:manual?"refs/heads/build/p0-abs-fiscal-universal":"refs/pull/690/merge",
      GITHUB_SHA:PA_HEAD,
      GITHUB_REPOSITORY:"contaos999999/contaos-hml-control",
      INPUT_PREAUDIT_PR:"690",INPUT_PREAUDIT_HEAD:PA_HEAD,INPUT_PREAUDIT_BASE:manual?"":PA_BASE},
  });
  if(pending) outcome.provenanceCalls=observedPaths.filter(p=>
    /\/actions\/(artifacts|jobs|runs)\//.test(p)).length;
  return outcome;
}
test("P0 adversarial GitHub live verified snapshot can release precert only",async()=>{
  const o=await paLiveVerification();
  assert.equal(o.pass,true,JSON.stringify(o));
  assert.equal(o.release,"PRE_CERTIFICATION_ONLY");
});
test("P0 FULL_PROTOCOL ZIP mismatch and missing ZIP cannot certify",async()=>{
  for(const scenario of ["zipMismatch","zipMissing"]){
    const o=await paLiveVerification({mutateReadback:scenario});
    assert.equal(o.pass,false,scenario);
    assert.equal(o.release,"NO_GO",scenario);
    assert.match(o.issues.join(" "),/ZIP:/,scenario);
  }
});
test("P0 FULL_PROTOCOL late veto after ZIP bytes must fail final authorization readback",async()=>{
  const o=await paLiveVerification({mutateReadback:"postZipReview"});
  assert.equal(o.pass,false,JSON.stringify(o));
  assert.equal(o.release,"NO_GO");
  assert.match(o.issues.join(" "),/POST_ZIP_READBACK/);
});
test("P0 adversarial new CHANGES_REQUESTED during async API collection blocks",async()=>{
  const o=await paLiveVerification({mutateReadback:"comments"});
  assert.equal(o.pass,false);
  assert.match(o.issues.join(" "),/parecer\/checks changed/);
  assert.equal(o.release,"NO_GO");
});
test("P0 adversarial required CI changes during async API collection blocks",async()=>{
  const o=await paLiveVerification({mutateReadback:"checks"});
  assert.equal(o.pass,false);
  assert.match(o.issues.join(" "),/parecer\/checks changed/);
  assert.equal(o.release,"NO_GO");
});

test("P0 fixture isolation: prior hostile mutation cannot poison later positive",()=>{
  const hostile=paFixture();
  hostile.manifest.files[0]="docs/frontend/planos/P0_GOV_PLAN_690.json";
  const independent=paFixture();
  assert.equal(independent.manifest.files[0],PA_FILES[0]);
  assert.equal(paCheck(independent).pass,true);
});

test("P0 V2 RED: stale ZIP from previous attempt in same run must never release",()=>{
  const f=paFixture();
  f.artifact.name="contaos-teste-c-777-0";
  assert.equal(paCheck(f).pass,false);
});
test("P0 V2 RED: present attempt without producer artifact name must block",()=>{
  const f=paFixture();
  f.artifact.name="contaos-teste-c-777-2";
  assert.equal(paCheck(f).pass,false);
});
test("P0 V2 RED: parent check PASS is not durable authorization after later veto",()=>{
  const f=paFixture();
  const later=structuredClone(f.comments[0]);
  later.id=999;
  later.body=later.body.replace('"verdict":"PASS"','"verdict":"CHANGES_REQUESTED"');
  f.comments.push(later);
  assert.equal(paCheck(f).pass,false);
});

test("P0 V2 negative: no auto PASS from legacy 8 dimensions",()=>{
  for(const mutate of [
    f=>delete f.record.adversarial_v2,
    f=>f.record.adversarial_v2.lenses.lifecycle="NOT_TESTED",
    f=>f.record.adversarial_v2.second_pass="CHANGES_REQUESTED",
    f=>f.record.adversarial_v2.meta_audit="BLOCKED",
    f=>f.record.adversarial_v2.red_runs=[],
    f=>f.record.adversarial_v2.head="f".repeat(40),
  ]){const f=paFixture();mutate(f);setPaRecord(f);
    assert.equal(paCheck(f).pass,false);
    assert.match(paCheck(f).issues.join(" "),/parecer V2/);
  }
});

test("P0 NR-006 RED live: native COMMENTED rerun with 2 green jobs can release",async()=>{
  const out=await paLiveVerification({extraV2:"success"});
  assert.equal(out.pass,true,JSON.stringify(out));
  assert.equal(out.release,"PRE_CERTIFICATION_ONLY");
});
test("P0 NR-006 RED live: pending latest rerun must not reuse old passing job",async()=>{
  const out=await paLiveVerification({extraV2:"queued"});
  assert.equal(out.pass,false);
  assert.equal(out.release,"NO_GO");
});
test("P0 NR-006 RED live: changed newer check at readback revokes green",async()=>{
  const out=await paLiveVerification({extraV2:"success",mutateReadback:"newV2fail"});
  assert.equal(out.pass,false);
  assert.equal(out.release,"NO_GO");
});

test("P0 V2 API rate 403 is transient only with authenticated reset and remaining zero",()=>{
  const headers=map=>({get:name=>map[name] ?? null});
  const path="/repos/contaos999999/contaos-hml-control/git/ref/heads/main";
  const primary=classifyGithubReadError(403,headers({
    "x-ratelimit-remaining":"0","x-ratelimit-reset":"1795255200",
    "x-github-request-id":"rate-001",
  }),path);
  assert.equal(primary.rateLimited,true);
  assert.equal(primary.reset_at,"1795255200");
  assert.match(primary.message,/remaining=0 reset-at=1795255200/);
  assert.ok(!primary.message.includes("Bearer"));
  for(const item of [
    [403,{"x-ratelimit-remaining":"100","x-ratelimit-reset":"1795255200"}],
    [403,{"x-ratelimit-remaining":"0","x-ratelimit-reset":"not-epoch"}],
    [401,{"x-ratelimit-remaining":"0","x-ratelimit-reset":"1795255200"}],
  ]) assert.equal(classifyGithubReadError(item[0],headers(item[1]),path).rateLimited,false);
});

test("P0 V2 NR-006 avoid API storm while current CI or comment is incomplete",async()=>{
  const result=await paLiveVerification({pending:true});
  assert.equal(result.pass,false);
  assert.equal(result.release,"NO_GO");
  assert.equal(result.provenanceCalls,0,"no Actions GET before required CI and receipt");
  assert.match(result.issues.join(" "),/PENDENTE:.*check ainda em execucao/);
  assert.match(result.issues.join(" "),/parecer estruturado V2/);
});

test("P0 V2 live consumer dispatch verifies current PR rather than stale CI verdict",async()=>{
  const valid=await paLiveVerification({manual:true});
  assert.equal(valid.pass,true,JSON.stringify(valid));
  const revoked=await paLiveVerification({manual:true,mutateReadback:"comments"});
  assert.equal(revoked.pass,false);
  assert.equal(revoked.release,"NO_GO");
});

test("P0 V2 formal independent review veto invalidates internal PASS on same HEAD",()=>{
  const f=paFixture();f.reviews=[{id:100,commit_id:PA_HEAD,
    user:{login:"Edivan5002"},state:"CHANGES_REQUESTED",
    submitted_at:"2026-11-21T20:00:00Z"}];
  assert.equal(paCheck(f).pass,false);
  assert.match(paCheck(f).issues.join(" "),/CHANGES_REQUESTED/);
});
test("P0 V2 formal veto submitted while API reads must invalidate",async()=>{
  const f=await paLiveVerification({mutateReadback:"reviews"});
  assert.equal(f.pass,false);
  assert.match(f.issues.join(" "),/changed during pre-cert/);
});


test("P0 V2 RED NR-006: COMMENTED must not supersede CHANGES_REQUESTED",()=>{
  const f=paFixture();
  f.reviews=[
    {id:50,commit_id:PA_HEAD,user:{login:"independent"},state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T12:00:00Z"},
    {id:51,commit_id:PA_HEAD,user:{login:"independent"},state:"COMMENTED",submitted_at:"2026-11-21T13:00:00Z"},
  ];
  assert.equal(paCheck(f).pass,false,"COMMENTED must not clear formal veto");
});
test("P0 V2 RED NR-006: APPROVED or DISMISSED are explicit decision transitions",()=>{
  for(const resolution of ["APPROVED","DISMISSED"]){
    const f=paFixture();f.reviews=[
      {id:50,commit_id:PA_HEAD,user:{login:"independent"},state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T12:00:00Z"},
      {id:51,commit_id:PA_HEAD,user:{login:"independent"},state:"COMMENTED",submitted_at:"2026-11-21T12:30:00Z"},
      {id:52,commit_id:PA_HEAD,user:{login:"independent"},state:resolution,submitted_at:"2026-11-21T13:00:00Z"},
    ];
    assert.equal(paCheck(f).pass,true,resolution);
  }
});
test("P0 V2 RED NR-006: draft flipping during readback must revoke",async()=>{
  const result=await paLiveVerification({mutateReadback:"draft"});
  assert.equal(result.pass,false);
  assert.equal(result.release,"NO_GO");
});
test("P0 V2 RED NR-006: artifact expires between reads must revoke",async()=>{
  const result=await paLiveVerification({mutateReadback:"artifact"});
  assert.equal(result.pass,false);
  assert.equal(result.release,"NO_GO");
});


const CAUSAL_ARTIFACT_VULNERABLE_SHA="7e34fe416c30ae38d384aef3084165b2f2e1ffee";
const CAUSAL_REVIEW_VULNERABLE_SHA="caa351c68a197fec3c7e6a95b8a7de4cfcc9845e";
async function historicalGate(sha){
  assert.match(sha,/^[a-f0-9]{40}$/);
  execFileSync("git",["merge-base","--is-ancestor",sha,"HEAD"],{timeout:15000});
  const pinnedBlob=sha===CAUSAL_ARTIFACT_VULNERABLE_SHA
    ? "38072d1d3a940d2f722f3e42d1475ab9cb5a04c5"
    : sha===CAUSAL_REVIEW_VULNERABLE_SHA
      ? "a85931fbe7215712b2df6d95366f41cc63b7cd29" : null;
  assert.ok(pinnedBlob,"unrecognized vulnerable SHA");
  assert.equal(execFileSync("git",["rev-parse",
    sha+":scripts/p0-rca-impact-gate.mjs"],{encoding:"utf8",timeout:15000}).trim(),
    pinnedBlob,"historical code blob differs from authenticated immutable source");
  const source=execFileSync("git",["show",sha+":scripts/p0-rca-impact-gate.mjs"],{
    encoding:"utf8",timeout:15000,maxBuffer:5*1024*1024,
  });
  const dependency=pathToFileURL(resolve("scripts/ci/merge-group-context.mjs")).href;
  const rewritten=source.replaceAll('"./ci/merge-group-context.mjs"',JSON.stringify(dependency));
  const dir=mkdtempSync(join(tmpdir(),"contaos-vulnerable-"));
  try {
    const filename=join(dir,"historical.mjs");
    writeFileSync(filename,rewritten);
    return await import(pathToFileURL(filename).href);
  } finally {rmSync(dir,{recursive:true,force:true});}
}
test("P0 V2 CAUSAL_RED artifact_attempt: historical false PASS then GREEN rejects old ZIP",async()=>{
  const vulnerable=await historicalGate(CAUSAL_ARTIFACT_VULNERABLE_SHA);
  const f=paFixture();
  f.record.schema="contaos.assistant-preaudit.v1";
  f.record.criteria=Object.fromEntries(vulnerable.ASSISTANT_PREAUDIT_CRITERIA.map(x=>[x,"PASS"]));
  f.artifact.name="contaos-teste-c-777-0";
  f.comments[0].body="<!-- "+vulnerable.ASSISTANT_PREAUDIT_MARKER+"\n"+
    JSON.stringify(f.record)+"\n-->";
  const before=vulnerable.validateAssistantPrecertRelease(f);
  assert.equal(before.pass,true,"RED: vulnerable commit must incorrectly authorize old attempt artifact: "+JSON.stringify(before));
  const green=paFixture();green.artifact.name=f.artifact.name;
  const after=paCheck(green);
  assert.equal(after.pass,false,"GREEN: present gate must reject old attempt ZIP");
  assert.match(after.issues.join(" "),/artefato/);
});
test("P0 V2 CAUSAL_RED review_comment: historical false PASS then GREEN preserves veto",async()=>{
  const vulnerable=await historicalGate(CAUSAL_REVIEW_VULNERABLE_SHA);
  const f=paFixture();
  f.reviews=[
    {id:40,commit_id:PA_HEAD,user:{login:"auditor"},state:"CHANGES_REQUESTED",
      submitted_at:"2026-11-21T12:00:00Z"},
    {id:41,commit_id:PA_HEAD,user:{login:"auditor"},state:"COMMENTED",
      submitted_at:"2026-11-21T12:30:00Z"},
  ];
  assert.equal(vulnerable.validateAssistantPrecertRelease(f).pass,true,
    "RED: COMMENTED must have erased CHANGES_REQUESTED in historical code");
  const green=paCheck(f);
  assert.equal(green.pass,false,"GREEN: comments must not clear the veto");
  assert.match(green.issues.join(" "),/CHANGES_REQUESTED/);
});

// Executable adversarial V2: one independently reported CI step per layer/lens.
test("P0 V2 LAYER 01: Frozen HEAD and base",async()=>{const f=paFixture(); assert.equal(paCheck(f).pass,true); f.currentMain="f".repeat(40); assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 02: Blind contract reconstruction",async()=>{const f=paFixture(); f.manifest.files[1]="src/rogue.ts"; assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 03: Threat and state mapping",async()=>{const f=paFixture(); f.pr.merged=true; assert.equal(paCheck(f).pass,false); f.pr.merged=false; f.pr.state="closed"; assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 04: Novel adversarial attacks",async()=>{const f=paFixture(); f.artifact.name="contaos-teste-c-777-2"; assert.equal(paCheck(f).pass,false); f.artifact.name="contaos-teste-c-777-1"; f.artifact.workflow_run.id=776; assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 05: RED origin evidence",async()=>{const f=paFixture(); f.record.adversarial_v2.red_runs=[]; setPaRecord(f); assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 06: GREEN negative regression",async()=>{const f=paFixture(); f.checkRuns[0].conclusion="failure"; assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 07: Lifecycle and postdecision revocation",async()=>{const f=paFixture(); f.reviews=[{id:900,commit_id:PA_HEAD,user:{login:"independent"},state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T15:00:00Z"}]; assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 08: Full diff and integrations",async()=>{const f=paFixture(); f.paths.push("scripts/hidden.mjs"); assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 09: Meta-audit detects fabricated coverage",async()=>{const f=paFixture(); f.record.adversarial_v2.meta_audit="NOT_PROVEN"; setPaRecord(f); assert.equal(paCheck(f).pass,false);});
test("P0 V2 LAYER 10: Live gate on exact decision",async()=>{const v=await paLiveVerification({manual:true,mutateReadback:"reviews"}); assert.equal(v.pass,false); assert.equal(v.release,"NO_GO");});
test("P0 V2 LENS security: Privilege boundary",async()=>{const f=paFixture();f.manifest.ativacao_autorizada=true;assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS provenance: Run attempt provenance",async()=>{const f=paFixture();f.artifact.name="contaos-teste-c-777-0";assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS concurrency: Readback race",async()=>{const v=await paLiveVerification({mutateReadback:"checks"});assert.equal(v.pass,false);});
test("P0 V2 LENS lifecycle: Late review veto",async()=>{const v=await paLiveVerification({manual:true,mutateReadback:"reviews"});assert.equal(v.pass,false);});
test("P0 V2 LENS state_machine: Inconsistent state",async()=>{const f=paFixture();f.pr.merged=true;f.pr.state="open";assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS integration: Artifact and job binding",async()=>{const f=paFixture();f.testCAttemptJobs.jobs[0].id=999;assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS resilience: Partial paginated API",async()=>{const f=paFixture();f.testCAttemptJobs.total_count=3;assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS governance: Independent veto",async()=>{const f=paFixture();f.reviews=[{id:9,commit_id:PA_HEAD,user:{login:"independent"},state:"CHANGES_REQUESTED",submitted_at:"2026-11-21T15:00:00Z"}];assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS supply_chain: Foreign check issuer",async()=>{const f=paFixture();f.checkRuns[0].app.id=999;assert.equal(paCheck(f).pass,false);});
test("P0 V2 LENS legitimate_regression: Preserve success path",async()=>{const f=paFixture();assert.equal(paCheck(f).pass,true);const v=await paLiveVerification();assert.equal(v.pass,true);});
test("P0 V2 LENS observability: Do not conceal failure",async()=>{const f=paFixture();f.testCRun.conclusion="failure";const out=paCheck(f);assert.equal(out.pass,false);assert.ok(out.issues.length>0);});
test("P0 V2 LENS operational_environment: Different workflow context",async()=>{const f=paFixture();f.testCRun.path=".github/workflows/unrelated.yml";assert.equal(paCheck(f).pass,false);});

test("P0 V2 probe evidence is authenticated, never self-declared 10+12",()=>{
  for (const change of [
    f=>f.v2Job.steps.splice(3,1),
    f=>f.v2Job.steps[0].conclusion="skipped",
    f=>f.v2Job.steps.push({...f.v2Job.steps[0]}),
    f=>f.v2Job.head_sha="f".repeat(40),
    f=>f.v2Job.id=900,
    f=>f.checkRuns.find(x=>x.name===ADVERSARIAL_V2_CHECK_NAME).conclusion="failure",
    f=>f.checkRuns.find(x=>x.name===ADVERSARIAL_V2_CHECK_NAME).app.id=99,
  ]){const f=paFixture();change(f);const o=paCheck(f);
    assert.equal(o.pass,false);
    assert.match(o.issues.join(" "),/25 provas executaveis/);
  }
});


test("P0 V2 NR-006: case-specific RED proof cannot be relabeled, omitted or reused",()=>{
  for(const mutate of [
    f=>f.record.adversarial_v2.red_cases.pop(),
    f=>f.record.adversarial_v2.red_cases[0].case_id="artifact_attempt",
    f=>f.record.adversarial_v2.red_cases[1].vulnerable_sha=f.record.adversarial_v2.red_cases[0].vulnerable_sha,
    f=>f.record.adversarial_v2.red_cases[2].vulnerable_blob="f".repeat(40),
    f=>f.record.adversarial_v2.red_cases[1].green_head="f".repeat(40),
    f=>f.record.adversarial_v2.red_cases[0].observed="UNRELATED_FAILURE",
    f=>f.record.adversarial_v2.red_cases[1].run_id=999,
    f=>f.v2Job.steps.find(x=>x.name==="P0 V2 CAUSAL_RED review_comment").conclusion="skipped",
  ]){const f=paFixture();mutate(f);setPaRecord(f);
    const o=paCheck(f);assert.equal(o.pass,false);
    assert.match(o.issues.join(" "),/NR-006|25 provas executaveis/);
  }
});

test("P0 V2 RED source cannot be arbitrary failed workflow",()=>{
  for(const mutate of [
    f=>f.redProvenance[0].run.conclusion="success",
    f=>f.redProvenance[0].run.head_sha=PA_HEAD,
    f=>f.redProvenance[0].jobs.jobs[0].steps[0].name="Unrelated build",
    f=>f.redProvenance[0].jobs.total_count=4,
    f=>f.redProvenance[0].run.path=".github/workflows/unrelated.yml",
    f=>f.redProvenance[0].run.pull_requests[0].number=692,
    f=>f.redProvenance[0].run.head_branch="other-branch",
  ]){const f=paFixture();mutate(f);
    const o=paCheck(f);assert.equal(o.pass,false);
    assert.match(o.issues.join(" "),/RED nao vinculado/);
  }
});


function protectedSourceBase() {
  return process.env.INPUT_PREAUDIT_BASE ||
    execFileSync("git", ["rev-parse", "origin/main"], {encoding: "utf8"}).trim();
}

test("P0 SEMANTIC SOURCE: CSDI proposal preserves the approved source bytes", () => {
  const approved = readP0690ProtectedSources("e007c4bad8f2c66c489c55e4752b71bb19c5ced0");
  const proposed = readP0690ProtectedSources("ee88b81a18882d4810702a1fab0f06f132b5e7c3");
  assert.deepEqual(proposed, approved);
  assert.equal(proposed.normative.activationAuthorized, false);
  assert.throws(() => readP0690ProtectedSources("3ee94171f2fc4cbec2e2d2b6f9efad88fc8ec9ff"));
});

test("P0 SEMANTIC SOURCE: protected PLAN and amendment are byte-bound, comprehensive line inventory remains NO_GO",()=>{
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const out=inventoryProtectedSemanticLines(snapshots);
  assert.deepEqual(out.issues,[]);
  assert.equal(out.inventory_verified,true);
  assert.equal(out.lines.length,118,"protected textual inventory count must not silently drift");
  assert.equal(new Set(out.lines.map(x=>x.id)).size,out.lines.length);
  assert.ok(out.lines.every(x=>x.line>0 && x.text_sha256.length===64));
  assert.equal(out.semantic_completeness,"INCONCLUSIVE");
  assert.equal(out.release,"NO_GO");
  const sentenceInventory=inventorySemanticSentenceCandidates(out);
  assert.equal(sentenceInventory.partition_verified,true);
  assert.ok(sentenceInventory.candidate_count>out.lines.length);
  assert.equal(sentenceInventory.candidate_count,sentenceInventory.unreviewed);
  assert.equal(sentenceInventory.semantic_completeness,"INCONCLUSIVE");
  assert.match(sentenceInventory.inventory_sha256,/^[a-f0-9]{64}$/);
  const bySource=new Map(out.lines.map(x=>[x.id,x]));
  for(const source of out.lines){
    const chunks=sentenceInventory.candidates.filter(x=>x.source_id===source.id);
    assert.ok(chunks.length>=1);
    let cursor=0;
    for(const chunk of chunks){
      assert.equal(chunk.start,cursor);
      assert.equal(chunk.blob,source.blob);
      assert.equal(chunk.line,source.line);
      assert.equal(chunk.status,"UNREVIEWED");
      cursor=chunk.end;
    }
    assert.equal(cursor,source.text.length);
  }
  const forged=inventorySemanticSentenceCandidates({...out,inventory_verified:false});
  assert.equal(forged.partition_verified,false);
  assert.equal(forged.release,"NO_GO");
  const backlog=buildSevenAxisSemanticBacklog(out);
  const reverse=auditSemanticReverseCoverage(out,backlog);
  assert.equal(reverse.source_count,118);
  assert.equal(reverse.rule_count,137);
  assert.equal(reverse.unproven_rule_count,137);
  assert.equal(reverse.covered_source_count+reverse.uncovered_source_count,118);
  assert.equal(reverse.semantic_completeness,"INCONCLUSIVE");
  assert.equal(reverse.release,"NO_GO");
  assert.equal(reverse.invalid.length,0);
  assert.equal(reverse.uncovered_source_count,18);
  assert.ok(reverse.uncovered.every(x=>
    !!x.category&&x.assessment==="REQUIRES_STAGE_SEMANTIC_REVIEW"&&
    x.semantic_evidence===null&&x.negative_witness===null));
  assert.ok(reverse.uncovered.some(x=>x.category==="FORBIDDEN_SCOPE"));
  assert.ok(reverse.uncovered.some(x=>x.category==="RED_GREEN_SECURITY_GATES"));
  assert.ok(reverse.uncovered.some(x=>x.category==="PROTECTION_AND_REVIEW_AUTHORITY"));
  assert.equal(reverse.semantic_completeness,"INCONCLUSIVE");

  const forgedReverse=structuredClone(backlog);
  forgedReverse.normative_rules[0].source_links=["SRC-FAKE"];
  const rejectedReverse=auditSemanticReverseCoverage(out,forgedReverse);
  assert.equal(rejectedReverse.invalid.length,1);
  assert.ok(rejectedReverse.issues.some(x=>x.includes("INVALID_SOURCE_LINK")));
  assert.equal(rejectedReverse.release,"NO_GO");
  const allMapped=structuredClone(backlog);
  for(const [i,row] of out.lines.entries())
    allMapped.normative_rules[i%allMapped.normative_rules.length].source_links.push(row.id);
  const mapped=auditSemanticReverseCoverage(out,allMapped);
  assert.equal(mapped.uncovered_source_count,0);
  assert.equal(mapped.semantic_completeness,"INCONCLUSIVE",
    "complete traceability cannot certify interpretation or independent review");
  assert.equal(mapped.release,"NO_GO");

  assert.equal(backlog.axis_slots,826,"every one of the 118 spans needs seven individual axes");
  assert.equal(backlog.rows.length,118);
  assert.equal(backlog.normative_rule_count,137);
  assert.equal(backlog.normative_axis_slots,959);
  assert.equal(backlog.anchored_normative_rules,137);
  assert.equal(backlog.unlinked_normative_rules,0);
  assert.equal(backlog.provisionally_located_rules,0);
  assert.equal(backlog.all_possible_rule_pairs,9316);
  assert.equal(backlog.untriaged_rule_pairs,9316);
  assert.match(backlog.pair_inventory_sha256,/^[a-f0-9]{64}$/);
  assert.equal(backlog.semantic_completeness,"INCONCLUSIVE");

  assert.equal(backlog.normative_rules.filter(x=>x.source_link_level==="DIRECT_NUMBERED").length,10);
  assert.equal(backlog.positionally_verified_rules,90);
  assert.equal(backlog.segment_located_rules,37);
  const segments=backlog.normative_rules.filter(x=>
    x.source_link_level==="TEXT_SEGMENT_VERIFIED");
  assert.equal(segments.length,37);
  assert.ok(segments.every(x=>x.source_links.length===1&&
    x.source_atom?.text_sha256?.length===64));
  assert.ok(segments.every(x=>out.lines.some(y=>y.id===x.source_links[0]&&
    y.blob===x.source_atom.blob&&y.line===x.source_atom.line)));

  const positional=backlog.normative_rules.filter(x=>
    x.source_link_level==="POSITIONAL_SOURCE_VERIFIED");
  assert.equal(positional.length,90);
  assert.ok(positional.every(x=>x.source_links.length===1&&
    x.source_location?.blob&&x.source_location?.line>0&&
    x.source_location?.text_sha256?.length===64));
  assert.ok(positional.every(x=>out.lines.some(line=>
    line.id===x.source_links[0]&&line.path===x.source_location.path&&
    line.blob===x.source_location.blob&&line.line===x.source_location.line&&
    line.text_sha256===x.source_location.text_sha256)));

  assert.equal(backlog.normative_rules.filter(x=>x.source_link_level==="PROVISIONAL_ONLY").length,0);
  assert.ok(backlog.normative_rules.every(x=>x.source_links.length===1));
  for(const suffix of ["A","B","C","D","E","F"]){
    const rule=backlog.normative_rules.find(x=>x.rule_id==="EMENDA-N17-"+suffix);
    assert.equal(rule.source_clause_marker,"("+suffix.toLowerCase()+")");
  }

  for(let n=1;n<=10;n++){
    const rule=backlog.normative_rules.find(x=>x.rule_id==="PLAN-S3-"+String(n).padStart(2,"0"));
    assert.ok(rule);
    assert.equal(rule.source_links.length,1);
  }
  assert.equal(backlog.semantic_completeness,"INCONCLUSIVE");
  assert.deepEqual(validateSevenAxisSemanticBacklog(out,backlog).issues,[]);
  for(const mutant of [
    x=>x.rows.pop(),
    x=>delete x.rows[0].axes.authority,
    x=>x.rows[0].line++,
    x=>x.rows.push(structuredClone(x.rows[0])),
    x=>x.axis_slots=825,
    x=>x.normative_rules.pop(),
    x=>x.normative_rules[0].source_links=[],
    x=>delete x.normative_rules[0].axes.authority,
    x=>x.normative_axis_slots=958,
    x=>x.normative_rules.find(r=>r.source_link_level==="POSITIONAL_SOURCE_VERIFIED").source_location.line++,
    x=>x.normative_rules.find(r=>r.source_link_level==="TEXT_SEGMENT_VERIFIED").source_atom.text_sha256="f".repeat(64),
    x=>x.normative_rules.find(r=>r.rule_id==="EMENDA-N17-C").source_atom.start++,
    x=>x.normative_rules.find(r=>r.source_link_level==="TEXT_SEGMENT_VERIFIED").source_links=["fake"],
  ]){
    const changed=structuredClone(backlog);mutant(changed);
    const checked=validateSevenAxisSemanticBacklog(out,changed);
    assert.ok(checked.issues.length>0,"incomplete or false seven-axis worklist rejected");
    assert.equal(checked.semantic_completeness,"INCONCLUSIVE");
  }
  for(const [label,change] of [
    ["missing source",s=>delete s[Object.keys(s)[0]]],
    ["changed word",s=>{const p=Object.keys(s)[0];s[p].content+="\\nINJECTED RULE";}],
    ["falsified blob",s=>{const p=Object.keys(s)[1];s[p].blob="a".repeat(40);}],
    ["unknown source",s=>{s["injected.md"]={content:"test",blob:"x"};}],
  ]){
    const mutation=structuredClone(snapshots);change(mutation);
    const rejected=inventoryProtectedSemanticLines(mutation);
    assert.ok(rejected.issues.length>0,label);
    assert.equal(rejected.inventory_verified,false,label);
    assert.equal(rejected.release,"NO_GO",label);
  }
  const one=out.lines[0];
  const base={source_id:one.id,path:one.path,blob:one.blob,line:one.line,
    text_sha256:one.text_sha256,axes:{},negative_witnesses:[],
    independent_review:null};
  const incomplete=verifySemanticSourceClaims(out,[base],{release_stage:"PROD"});
  assert.equal(incomplete.verdict,"INCONCLUSIVE");
  assert.ok(incomplete.issues.some(x=>x.includes("UNPROVEN_AXES")));
  assert.ok(incomplete.issues.some(x=>x.includes("NO_EXECUTED_COUNTERPROOF")));
  assert.ok(incomplete.issues.some(x=>x.includes("NO_INDEPENDENT_REVIEW")));
  assert.equal(incomplete.unmapped.length,out.lines.length-1);
  for(const mutation of [
    [{...base,line:one.line+1}],
    [{...base,text_sha256:"a".repeat(64)}],
    [base,base],
    [{...base,source_id:"SRC-UNRECOGNIZED"}],
  ]){
    const check=verifySemanticSourceClaims(out,mutation,{release_stage:"PROD"});
    assert.ok(check.issues.length>0);
    assert.equal(check.verdict,"INCONCLUSIVE");
    assert.equal(check.release,"NO_GO");
  }
});


test("P0 SEMANTIC COMPLETENESS requires authenticated 137/381/118/9316 evidence; BUILD PASS not authority",async()=>{
  const sourceFiles=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(sourceFiles);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const head="f5de50d3a5106caea62a5fbcf423299436bfdcc9";
  const input={inventory,worklist,sentenceInventory,reverseCoverage,head,base:protectedSourceBase(),release_stage:"PROD"};
  const empty=await assessSemanticCompletenessGate(input);
  assert.equal(empty.semantic_completeness,"INCONCLUSIVE");
  assert.equal(empty.release,"NO_GO");
  assert.equal(empty.rule_count,137);
  assert.equal(empty.sentence_count,381);
  assert.equal(empty.source_count,118);
  assert.equal(empty.pair_count,9316);
  assert.ok(empty.issues.some(x=>x.includes("RULES_COVERAGE")));
  assert.ok(empty.issues.some(x=>x.includes("SENTENCES_COVERAGE")));
  assert.ok(empty.issues.some(x=>x.includes("SOURCES_COVERAGE")));
  assert.ok(empty.issues.some(x=>x.includes("PAIRS_UNADJUDICATED")));
  assert.ok(empty.issues.some(x=>x.includes("INDEPENDENCE_UNPROVEN")));
  let authentications=0;
  const forged=await assessSemanticCompletenessGate({...input,
    independent:{head,review_id:123,author:"implementer",
      reviewer:"implementer",state:"APPROVED",scope:"FULL_SEMANTIC_CORPUS"},
    authenticateIndependent:async()=>{authentications++;return true;},
    authenticateWitness:async()=>{authentications++;return true;}});
  assert.equal(forged.semantic_completeness,"INCONCLUSIVE");
  assert.equal(authentications,0,
    "incomplete evidence must not trigger fake external attestations");
  const wrongBase=await assessSemanticCompletenessGate({...input,
    inventory:{...inventory,inventory_verified:false}});
  assert.ok(wrongBase.issues.includes("SEMANTIC_UNVERIFIED_SOURCE_OR_HEAD"));
  assert.equal(wrongBase.semantic_completeness,"INCONCLUSIVE");
  const badPairs=await assessSemanticCompletenessGate({...input,
    interactions:[{pair_id:"INVENTED|RULE",decision:"NONINTERACTING"}]});
  assert.ok(badPairs.issues.includes("SEMANTIC_PAIR_UNKNOWN_OR_DUPLICATE"));
  assert.equal(badPairs.release,"NO_GO");
});


test("P0 SEMANTIC GATE fixture only: all 9316 pairs do not bypass authentication or independence",async()=>{
  // Entirely SYNTHETIC contract fixture, NEVER an actual semantic audit.
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(snapshots);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const head="f5de50d3a5106caea62a5fbcf423299436bfdcc9";
  const base=protectedSourceBase();
  const report="Synthetic contract only, not independent audit evidence. ".repeat(9);
  const independent={head,base,review_id:72652,author:"implementer",
    reviewer:"independent-auditor",state:"APPROVED",
    scope:"FULL_SEMANTIC_CORPUS",modality:"INDEPENDENT",
    authorship_independent:true,contradiction_completed:true,report,
    report_sha256:createHash("sha256").update(report).digest("hex")};
  const axes={authority:{actor:"authorized reviewer",source:"protected PLAN"},
    antecedent:{event:"head transition",source:"protected PLAN"},
    outcomes:{positive:{decision:"allow qualified review",source:"PLAN"},
      negative:{decision:"fail closed",source:"PLAN"}},
    interactions:{clauses:["PLAN","EMENDA"],counterexample:"revoked review still green"},
    live:{source:"authenticated job",url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head,base},
    revocation:{trigger:"new head",source:"PLAN"},
    boundary:{phase:"BUILD",external:"activation separate"}};
  const proof=id=>({id,head,base,
    interpretation:`Synthetic fixture statement for ${id}, not a substantive legal interpretation.`,
    counterexample:`Synthetic contradictory case for ${id}, not executed evidence.`,
    witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head,base},
    negative_witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/2",head,base},
    independent_review_id:independent.review_id});
  const rules=worklist.normative_rules.map(x=>({
    ...proof(x.rule_id),rule_id:x.rule_id,axes}));
  const sentences=sentenceInventory.candidates.map(x=>({
    ...proof(x.id),classification:"NORMATIVE",source_id:x.source_id,
    text_sha256:x.text_sha256,axes}));
  const sources=inventory.lines.map(x=>({
    ...proof(x.id),source_id:x.id,text_sha256:x.text_sha256,blob:x.blob}));
  const interactions=[];
  for(let i=0;i<worklist.normative_rules.length;i++)
    for(let j=i+1;j<worklist.normative_rules.length;j++){
      const pair_id=worklist.normative_rules[i].rule_id+"|"+
        worklist.normative_rules[j].rule_id;
      interactions.push({...proof(pair_id),pair_id,decision:"NONINTERACTING",
        left_rule_id:worklist.normative_rules[i].rule_id,
        right_rule_id:worklist.normative_rules[j].rule_id,
        pair_rationale:"Synthetic fixture only: "+pair_id+" not a real adjudication of two protected rules.",
        separation_basis:"Synthetic non-interaction assumption unverified by independent reviewer."});
    }
  const input={inventory,worklist,sentenceInventory,reverseCoverage,
    head,base,release_stage:"PROD",independent,rules,sentences,sources,interactions};
  const recycledNegative=await assessSemanticCompletenessGate({...input,
    rules:rules.map((x,i)=>i===0?{...x,negative_witness:x.witness}:x),
    authenticateIndependent:async()=>true,
    authenticateWitness:async()=>true});
  assert.equal(recycledNegative.semantic_completeness,"INCONCLUSIVE");
  assert.match(recycledNegative.issues.join(" "),/SEMANTIC_RULE_UNPROVEN/);
  const missingPairRationale=await assessSemanticPreauditGate({...input,
    independent:null,
    rules:rules.map(({independent_review_id,...rest})=>rest),
    sentences:sentences.map(({independent_review_id,...rest})=>rest),
    sources:sources.map(({independent_review_id,...rest})=>rest),
    interactions:interactions.map((x,i)=>i===0?{...x,pair_rationale:"boilerplate"}:
      (({independent_review_id,...rest})=>rest)(x)),
    authenticateWitness:async()=>true});
  assert.equal(missingPairRationale.semantic_preaudit,"INCONCLUSIVE");
  assert.match(missingPairRationale.issues.join(" "),/SEMANTIC_PAIR_UNPROVEN/);
  const missingNegative=await assessSemanticCompletenessGate({...input,
    interactions:interactions.map((x,i)=>i===0?{...x,negative_witness:null}:x),
    authenticateIndependent:async()=>true,
    authenticateWitness:async()=>true});
  assert.equal(missingNegative.semantic_completeness,"INCONCLUSIVE");
  assert.match(missingNegative.issues.join(" "),/SEMANTIC_PAIR_UNPROVEN/);
  const duplicatedNarrative=await assessSemanticCompletenessGate({...input,
    rules:rules.map((x,i)=>i===1?{...x,
      interpretation:rules[0].interpretation,
      counterexample:rules[0].counterexample}:x),
    authenticateIndependent:async()=>true,
    authenticateWitness:async()=>true});
  assert.equal(duplicatedNarrative.semantic_completeness,"INCONCLUSIVE");
  assert.match(duplicatedNarrative.issues.join(" "),/SEMANTIC_REUSED_INTERPRETATION/);
  assert.match(duplicatedNarrative.issues.join(" "),/SEMANTIC_REUSED_COUNTEREXAMPLE/);
  const withoutExternal=await assessSemanticCompletenessGate(input);
  assert.equal(withoutExternal.semantic_completeness,"INCONCLUSIVE");
  assert.equal(withoutExternal.release,"NO_GO");
  assert.ok(withoutExternal.issues.includes("SEMANTIC_AUTHENTICATED_CONTRADICTION_MISSING"));
  let witnessCalls=0;
  const fakeReview=await assessSemanticCompletenessGate({...input,
    authenticateIndependent:async()=>false,
    authenticateWitness:async()=>{witnessCalls++;return true;}});
  assert.equal(fakeReview.semantic_completeness,"INCONCLUSIVE");
  assert.equal(witnessCalls,0,"failed independent audit cannot consume witnesses");
  const fakeWitness=await assessSemanticCompletenessGate({...input,
    authenticateIndependent:async()=>true,
    authenticateWitness:async()=>{witnessCalls++;return false;}});
  assert.equal(fakeWitness.semantic_completeness,"INCONCLUSIVE");
  assert.equal(witnessCalls,1,"gate issues: "+JSON.stringify(fakeWitness.issues));
  // Unit contract only. Callback mock intentionally cannot be installed
  // by production. This asserts the engine is not a permanently hardcoded
  // INCONCLUSIVE predicate, NOT that the supplied synthetic facts are true.
  const fixturePass=await assessSemanticCompletenessGate({...input,
    authenticateIndependent:async()=>true,
    authenticateWitness:async()=>true});
  assert.equal(fixturePass.semantic_completeness,"PASS");
  assert.equal(fixturePass.release,"SEMANTIC_REVIEW_CERTIFIED_ONLY");
  assert.deepEqual(fixturePass.issues,[]);
  assert.equal(fixturePass.review_modality,"INDEPENDENT");
  assert.equal(fixturePass.assisted_review_id,null);
  for(const mutation of [{...independent,authorship_independent:false},{...independent,base:"f".repeat(40)},{...independent,reviewer:independent.author.toUpperCase()},{...independent,report_sha256:"f".repeat(64)}]){
    const rejected=await assessSemanticCompletenessGate({...input,independent:mutation,authenticateIndependent:async()=>true,authenticateWitness:async()=>true});
    assert.equal(rejected.release,"NO_GO");
  }
  // PREAUDIT is necessarily prior to independent review; a stage-specific
  // PASS never writes or implies SEMANTIC_COMPLETENESS=PASS.
  const preauditInput={...input,independent:null,
    rules:rules.map(({independent_review_id,...rest})=>rest),
    sentences:sentences.map(({independent_review_id,...rest})=>rest),
    sources:sources.map(({independent_review_id,...rest})=>rest),
    interactions:interactions.map(({independent_review_id,...rest})=>rest),
    authenticateWitness:async()=>true};
  const preauditFixture=await assessSemanticPreauditGate(preauditInput);
  assert.equal(preauditFixture.semantic_preaudit,"PASS");
  assert.equal(preauditFixture.semantic_completeness,"INCONCLUSIVE");
  assert.equal(preauditFixture.release,"INDEPENDENT_REVIEW_ELIGIBLE_ONLY");
  assert.equal(preauditFixture.independent_review_id,null);
  const withoutWitness=await assessSemanticPreauditGate({...preauditInput,
    authenticateWitness:null});
  assert.equal(withoutWitness.semantic_preaudit,"INCONCLUSIVE");
  assert.equal(withoutWitness.release,"NO_GO");
  const withPrematureReview=await assessSemanticPreauditGate({...preauditInput,
    independent});
  assert.equal(withPrematureReview.semantic_preaudit,"INCONCLUSIVE");
  assert.ok(withPrematureReview.issues.includes("SEMANTIC_PREAUDIT_INDEPENDENT_STAGE_CONFUSION"));
  const cannotCertifyFinal=await assessSemanticCompletenessGate(preauditInput);
  assert.equal(cannotCertifyFinal.semantic_completeness,"INCONCLUSIVE");
  assert.ok(cannotCertifyFinal.issues.includes("SEMANTIC_INDEPENDENCE_UNPROVEN"));
});


test("P0 MATERIAL TRIAGE: 137 rule texts, seven E axes, 381 sentence contents and all 9316 pairs reviewed for candidates, with no fake PASS",()=>{
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(snapshots);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentences=inventorySemanticSentenceCandidates(inventory);
  const reverse=auditSemanticReverseCoverage(inventory,worklist);
  const result=analyzeSemanticCorpusForReview({
    inventory,worklist,sentenceInventory:sentences,reverseCoverage:reverse});
  assert.deepEqual(result.issues,[]);
  assert.deepEqual(
    [result.counts.rules,result.counts.axes,result.counts.sentences,result.counts.interactions],
    [137,959,381,9316]);
  assert.equal(new Set(result.interactions.map(x=>x.pair_id)).size,9316);
  assert.equal(Object.values(result.breakdown).reduce((a,b)=>a+b,0),9316);
  assert.ok(result.rules.every(x=>x.anchor&&x.exact_text&&
    x.axis_count===7&&Object.keys(x.axes).length===7&&
    x.axes.E5_live.positive_witness===null&&x.verdict==="INCONCLUSIVE"));
  assert.ok(result.sentences.every(x=>x.fragment.length>0&&x.source_anchored&&
    x.adjudication==="PENDING_HUMAN_INTERPRETATION"));
  assert.ok(result.interactions.every(x=>x.left_rule_id&&x.right_rule_id&&
    x.provisional_relationship&&x.adjudication==="PENDING_SUBSTANTIVE_REVIEW"&&
    x.decision===null));
  assert.equal(result.semantic_preaudit,"INCONCLUSIVE");
  assert.equal(result.semantic_completeness,"INCONCLUSIVE");
  assert.equal(result.merge,"NO_GO");
  assert.equal(result.activation,"NO_GO");
  // Matriz grande efetivamente gerada e consumida, com quantitativo por classe
  // na saída auditável do job. Nunca imprime dados pessoais, tokens ou URLs privados.
  process.stdout.write("P0-MATERIAL-TRIAGE "+JSON.stringify({
    counts:result.counts,breakdown:result.breakdown,
    heads_are_evidence:false,semantic_completeness:result.semantic_completeness})+"\n");
});


test("P0 TEN MATERIAL DISPUTES: ten source-bound E1–E7 hypotheses, no external certification",()=>{
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inv=inventoryProtectedSemanticLines(snapshots);
  const worklist=buildSevenAxisSemanticBacklog(inv);
  const atom=inventorySemanticSentenceCandidates(inv);
  const reverse=auditSemanticReverseCoverage(inv,worklist);
  const triage=analyzeSemanticCorpusForReview({
    inventory:inv,worklist,sentenceInventory:atom,reverseCoverage:reverse});
  const verified=validatePrioritySemanticDisputes(triage);
  assert.deepEqual(verified.issues,[]);
  assert.equal(verified.cases,10);
  assert.equal(verified.source_bound_hypotheses,10);
  assert.equal(P0_SEMANTIC_PRIORITY_DISPUTES.length,10);
  assert.equal(verified.live_verified,0);
  assert.equal(verified.independent_contradictions,0);
  assert.equal(verified.verdict,"INCONCLUSIVE");
  assert.equal(verified.release,"NO_GO");
  const falsifiedText=structuredClone(triage);
  const wrong=falsifiedText.rules.find(x=>x.rule_id==="EMENDA-04");
  wrong.exact_text=wrong.exact_text.replaceAll("full_diff","TERM_REMOVED");
  assert.ok(validatePrioritySemanticDisputes(falsifiedText).issues.some(x=>
    x==="SEMANTIC_PRIORITY_TEXT_MISMATCH: FULL_DIFF_NO_DOCUMENTAL_ESCAPE"),
    "ID válido com fonte textual alterada não valida uma relação normativa");
  const mutant=structuredClone(triage);
  mutant.interactions=mutant.interactions.filter(x=>
    !x.pair_id.includes("PLAN-S31-05|PLAN-S31-07"));
  assert.ok(validatePrioritySemanticDisputes(mutant).issues.some(x=>
    x.includes("ANCHOR_INVALID")));
});


test("P0 SEMANTIC DOSSIER: all 137 E1–E7, 381 clauses, 9316 pairs are source read, without fictional live witnesses",()=>{
  const files=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(files);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const triage=analyzeSemanticCorpusForReview({
    inventory,worklist,sentenceInventory,reverseCoverage});
  const result=assembleSemanticContradictionDossier(triage);
  assert.deepEqual(result.issues,[]);
  assert.deepEqual(
    [result.counts.rules,result.counts.axes,result.counts.sentences,
      result.counts.pairs,result.counts.unique_pairs],[137,959,381,9316,9316]);
  assert.equal(
    Object.values(result.counts.relationship_counts).reduce((a,b)=>a+b,0),9316);
  assert.equal(result.rules[0].source_anchor.blob,
    PROTECTED_SEMANTIC_SOURCES[
      "docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md"]);
  assert.ok(result.rules.every(r=>
    r.exact_text&&r.source_anchor&&Object.keys(r.axes).length===7&&
    r.axes.E5.head===null&&r.axes.E5.positive_witness===null&&
    r.axes.E5.negative_witness===null&&r.decision==="INCONCLUSIVE"));
  const allSubclauses=result.sentences.flatMap(x=>x.subordinate_clauses);
  assert.equal(allSubclauses.length,457,
    "381 unidades de frase geram 76 subcláusulas adicionais, não 76 regras certificadas");
  assert.equal(result.sentences.filter(x=>x.subordinate_clauses.length>1).length,46);
  for(const row of result.sentences){
    assert.equal(row.subordinate_clauses.map(x=>x.text).join(""),row.exact_text);
    for(const part of row.subordinate_clauses){
      assert.equal(
        createHash("sha256").update(part.text).digest("hex"),
        part.text_sha256);
      assert.equal(part.reviewed,false);
      assert.equal(part.negative_witness,null);
    }
  }
  assert.ok(result.sentences.every(x=>x.exact_text&&x.source_id&&
    x.text_sha256&&x.positive_witness===null&&x.human_classification===null));
  assert.ok(result.interactions.every(x=>x.source_a&&x.source_b&&
    x.rule_a_text&&x.rule_b_text&&x.relationship&&
    x.judgement==="UNADJUDICATED"&&x.positive_witness===null));
  assert.equal(new Set(result.interactions.map(x=>x.applicability_hypothesis)).size,9316,
    "each source pair requires a discriminating applicability comparison");
  assert.ok(result.interactions.every(x=>
    x.applicability_hypothesis.includes(x.rule_a)&&
    x.applicability_hypothesis.includes(x.rule_b)&&
    x.discriminating_probes.positive.includes(x.rule_a)&&
    x.discriminating_probes.positive.includes(x.rule_b)&&
    x.discriminating_probes.negative.includes(x.rule_a)&&
    x.discriminating_probes.missing.length===3&&
    x.discriminating_probes.positive!==x.discriminating_probes.negative&&
    x.judgement==="UNADJUDICATED"));
  assert.equal(result.rules_certified,0);
  assert.equal(result.sentences_certified,0);
  assert.equal(result.interactions_certified,0);
  assert.equal(result.semantic_preaudit,"INCONCLUSIVE");
  assert.equal(result.semantic_completeness,"INCONCLUSIVE");
  assert.equal(result.release,"NO_GO");
  const directory=mkdtempSync(join(tmpdir(),"contaos-semantic-corpus-"));
  try{
    const manifest=writeSemanticDossierJsonl(result,directory,{
      head:"a".repeat(40),base:"b".repeat(40)});
    assert.equal(manifest.semantic_completeness,"INCONCLUSIVE");
    assert.equal(manifest.release,"NO_GO");
    assert.deepEqual(Object.values(manifest.files).map(x=>x.rows),[137,381,9316]);
    for(const [file,metadata] of Object.entries(manifest.files)){
      const contents=readFileSync(join(directory,file),"utf8");
      assert.equal(metadata.sha256,
        createHash("sha256").update(contents).digest("hex"));
      assert.equal(contents.trimEnd().split("\n").length,metadata.rows);
      assert.equal(metadata.bytes,Buffer.byteLength(contents,"utf8"));
    }
    const diskManifest=JSON.parse(readFileSync(join(directory,"manifest.json"),"utf8"));
    assert.deepEqual(diskManifest,manifest);
    assert.throws(
      ()=>writeSemanticDossierJsonl({...result,counts:{...result.counts,pairs:9315}},directory),
      /SEMANTIC_DOSSIER_UNVERIFIED/);
    assert.throws(
      ()=>writeSemanticDossierJsonl(result,process.cwd()),
      /SEMANTIC_DOSSIER_OUT_OF_TREE_REQUIRED/);
    const wrongBlob=structuredClone(result);
    wrongBlob.rules[0].source_anchor.blob="0".repeat(40);
    assert.throws(()=>writeSemanticDossierJsonl(wrongBlob,directory),
      /SEMANTIC_DOSSIER_CONTENT_INVALID/);
    const wrongPair=structuredClone(result);
    wrongPair.interactions[0].rule_a_text="texto adulterado";
    assert.throws(()=>writeSemanticDossierJsonl(wrongPair,directory),
      /SEMANTIC_DOSSIER_CONTENT_INVALID/);
    const claimWithoutCausality=structuredClone(result);
    claimWithoutCausality.interactions[7].discriminating_probes.positive="FAKE";
    assert.throws(
      ()=>writeSemanticDossierJsonl(claimWithoutCausality,directory),
      /SEMANTIC_DOSSIER_CONTENT_INVALID/);
    const reusedPair=structuredClone(result);
    reusedPair.interactions[9315].pair_id=reusedPair.interactions[0].pair_id;
    assert.throws(()=>writeSemanticDossierJsonl(reusedPair,directory),
      /SEMANTIC_DOSSIER_CONTENT_INVALID/);
  }finally{rmSync(directory,{recursive:true,force:true});}
  for(const [type,mutation] of [
    ["rule",x=>x.rules.pop()],
    ["sentence",x=>x.sentences.splice(75,1)],
    ["pair",x=>x.interactions.splice(9315,1)],
    ["source",x=>{x.interactions[0].left_source_id=null;}],
  ]){
    const tampered=structuredClone(triage);
    mutation(tampered);
    const rejected=assembleSemanticContradictionDossier(tampered);
    assert.ok(rejected.issues.length>0,type+" missing must fail closed");
    assert.equal(rejected.semantic_completeness,"INCONCLUSIVE");
    assert.equal(rejected.release,"NO_GO");
  }
  process.stdout.write("P0-SEVEN-AXES-MATERIAL "+JSON.stringify({
    counts:result.counts,source_read_verified:result.source_read_verified,
    external_proofs:0,semantic_completeness:result.semantic_completeness})+"\n");
});


test("P0 TEN CAUSAL MODELS: each source-grounded pair has a positive and discriminating negative counterproof",()=>{
  const sources=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(sources);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentences=inventorySemanticSentenceCandidates(inventory);
  const reverse=auditSemanticReverseCoverage(inventory,worklist);
  const triage=analyzeSemanticCorpusForReview({
    inventory,worklist,sentenceInventory:sentences,reverseCoverage:reverse});
  const output=executePriorityCausalCounterproofs(triage);
  assert.deepEqual(output.issues,[]);
  assert.equal(output.cases,10);
  assert.equal(output.offlined_models_tested,20);
  assert.equal(output.positive_models,10);
  assert.equal(output.negative_models,10);
  assert.equal(output.github_authenticated_live_proofs,0);
  assert.equal(output.semantic_completeness,"INCONCLUSIVE");
  assert.equal(output.activation,"NO_GO");
  assert.ok(output.probes.every(x=>
    x.source_bound&&x.positive.model_allows===true&&
    x.negative.model_allows===false&&x.real_positive_witness===null&&
    x.real_negative_witness===null&&
    x.proof_scope==="OFFLINE_LOGICAL_MODEL_ONLY"));
  const probes=P0_PRIORITY_CAUSAL_PROBES;
  assert.equal(new Set(probes.map(x=>x.caseId)).size,10);
  for(const p of probes){
    assert.equal(typeof P0_PRIORITY_CAUSAL_MODELS[p.caseId],"function");
    assert.equal(P0_PRIORITY_CAUSAL_MODELS[p.caseId](p.positive),true);
    assert.equal(P0_PRIORITY_CAUSAL_MODELS[p.caseId]({
      ...p.positive,[p.discriminator]:false}),false);
  }
  const absent=structuredClone(triage);
  absent.rules=absent.rules.filter(x=>x.rule_id!=="EMENDA-04");
  const blocked=executePriorityCausalCounterproofs(absent);
  assert.ok(blocked.issues.some(x=>x.includes("SEMANTIC_PRIORITY_ANCHOR_INVALID")));
  assert.equal(blocked.semantic_completeness,"INCONCLUSIVE");
  process.stdout.write("P0-CAUSAL-MODELS "+JSON.stringify({
    cases:output.cases,positive:output.positive_models,
    negative:output.negative_models,live:0,
    semantic_completeness:output.semantic_completeness})+"\n");
});

test("P0 REVERSE 18 MATERIAL: provenance and distinct interpretations for all reverse source gaps",()=>{
  const blobs=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inv=inventoryProtectedSemanticLines(blobs);
  const work=buildSevenAxisSemanticBacklog(inv);
  const reverse=auditSemanticReverseCoverage(inv,work);
  const result=materialReviewOfReverseGaps(inv,work,reverse);
  assert.deepEqual(result.issues,[]);
  assert.deepEqual([result.total,result.unique,result.uncovered_spans_remaining],[18,18,18]);
  assert.equal(P0_REVERSE_GAP_REVIEWS.length,18);
  assert.ok(result.records.every(r=>r.text&&r.reason.length>=55&&
    r.independent_review===null&&r.positive_witness===null&&
    r.verdict==="REQUIRES_STAGE_SEMANTIC_REVIEW"));
  const missing=structuredClone(reverse);
  missing.uncovered.splice(2,1);
  assert.ok(materialReviewOfReverseGaps(inv,work,missing).issues.some(x=>
    x.startsWith("SEMANTIC_REVERSE_MATERIAL_OMITTED")));
  const forged=structuredClone(reverse);
  forged.uncovered[0].text_sha256="0".repeat(64);
  assert.ok(materialReviewOfReverseGaps(inv,work,forged).issues.some(x=>
    x.startsWith("SEMANTIC_REVERSE_MATERIAL_INVALID")));
  const wrongRule=structuredClone(work);
  wrongRule.normative_rules=wrongRule.normative_rules.filter(x=>
    x.rule_id!=="PLAN-S4-14");
  assert.ok(materialReviewOfReverseGaps(inv,wrongRule,reverse).issues.some(x=>
    x.startsWith("SEMANTIC_REVERSE_MATERIAL_INVALID")));
  assert.equal(result.semantic_completeness,"INCONCLUSIVE");
  assert.equal(result.release,"NO_GO");
  process.stdout.write("P0-REVERSE-MATERIAL "+JSON.stringify({
    reviewed:result.total,independent:0,remaining:18,release:"NO_GO"})+"\\n");
});


test("P0 MUTATION FULL CORPUS: 959 axes, 381 clauses and 9316 pairs, each with a negative mutation",()=>{
  const sources=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inv=inventoryProtectedSemanticLines(sources);
  const work=buildSevenAxisSemanticBacklog(inv);
  const sentences=inventorySemanticSentenceCandidates(inv);
  const reverse=auditSemanticReverseCoverage(inv,work);
  const triage=analyzeSemanticCorpusForReview({
    inventory:inv,worklist:work,sentenceInventory:sentences,reverseCoverage:reverse});
  const dossier=assembleSemanticContradictionDossier(triage);
  const run=executeSemanticCorpusIntegrityMutants(dossier);
  assert.deepEqual(run.issues,[]);
  assert.deepEqual([run.axis_slots,run.sentence_slots,run.pair_slots],[959,381,9316]);
  assert.deepEqual(
    [run.positive_model_integrity_probes,run.negative_model_integrity_probes,
      run.total_executed_model_probes],[10656,10656,21312]);
  assert.equal(run.live_github_witnesses,0);
  assert.equal(run.real_semantic_adjudications,0);
  assert.equal(run.semantic_completeness,"INCONCLUSIVE");
  const falsified=structuredClone(dossier);
  falsified.interactions[27].rule_b_text="NOT_IN_PROTECTED_SOURCE";
  const failed=executeSemanticCorpusIntegrityMutants(falsified);
  assert.ok(failed.issues.includes("PAIR_BASELINE_FAIL:"+falsified.interactions[27].pair_id));
  assert.equal(failed.release,"NO_GO");
  process.stdout.write("P0-CORPUS-STRUCTURAL-MUTANTS "+JSON.stringify({
    axes:run.axis_slots,sentences:run.sentence_slots,pairs:run.pair_slots,
    tests:run.total_executed_model_probes,live:0})+"\n");
});


test("P0 TEN REASONED INTERPRETATIONS: ten priority conflicts have source-bound explanations and negative causal model",()=>{
  const sources=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inv=inventoryProtectedSemanticLines(sources);
  const work=buildSevenAxisSemanticBacklog(inv);
  const sentences=inventorySemanticSentenceCandidates(inv);
  const reverse=auditSemanticReverseCoverage(inv,work);
  const triage=analyzeSemanticCorpusForReview({
    inventory:inv,worklist:work,sentenceInventory:sentences,reverseCoverage:reverse});
  const analysis=analyzePrioritySemanticProposals(triage);
  assert.deepEqual(analysis.issues,[]);
  assert.equal(analysis.proposals.length,10);
  assert.equal(P0_PRIORITY_SEMANTIC_PROPOSALS.length,10);
  assert.ok(analysis.proposals.every(x=>x.pair_id&&x.source_anchors.length===2&&
    x.reasoned_interpretation.length>=75&&
    x.critical_failure_mode.length>=75&&
    x.discriminating_proof_required.length>=75&&
    x.offline_model_positive.model_allows===true&&
    x.offline_model_negative.model_allows===false&&
    x.authenticated_live_positive===null&&
    x.independent_contradictory_review===null));
  assert.equal(analysis.materially_interpreted_by_author,10);
  assert.equal(analysis.adjudicated_independently,0);
  assert.equal(analysis.authenticated_live_pairs,0);
  assert.equal(analysis.semantic_completeness,"INCONCLUSIVE");
  const bad=structuredClone(triage);
  bad.interactions=bad.interactions.filter(x=>
    x.pair_id!=="PLAN-S31-05|PLAN-S31-07");
  assert.ok(analyzePrioritySemanticProposals(bad).issues.length>0);
  assert.equal(analysis.release,"NO_GO");
});


test("P0 CRYPTO SNAPSHOT: independent SHA256 pins all 118 sources, 381 sentences, 137 rules and 9316 pair identities",()=>{
  const sources=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inv=inventoryProtectedSemanticLines(sources);
  const work=buildSevenAxisSemanticBacklog(inv);
  const sentences=inventorySemanticSentenceCandidates(inv);
  assert.deepEqual(inv.issues,[]);
  assert.deepEqual(sentences.issues,[]);
  assert.equal(inv.lines.length,118);
  assert.equal(sentences.candidates.length,381);
  assert.equal(work.normative_rules.length,137);
  const digest=content=>createHash("sha256").update(content).digest("hex");
  const sourceDigest=digest(inv.lines.map(x=>x.id+"|"+x.text_sha256).join("\n"));
  const sentenceDigest=sentences.inventory_sha256;
  const idArray=work.normative_rules.map(x=>x.rule_id);
  const rulesDigest=digest(idArray.join("\n"));
  const pairIds=[];
  for(let i=0;i<idArray.length;i++)
    for(let j=i+1;j<idArray.length;j++)
      pairIds.push(idArray[i]+"|"+idArray[j]);
  assert.equal(pairIds.length,9316);
  const pairDigest=digest(pairIds.join("\n"));
  // Independently computed using a pure-JS SHA-256 implementation on the
  // protected Git blobs, verified against standard vectors before pinning.
  assert.equal(sourceDigest,
    "42f1deaae7f093ef6683b5745346913e322056bbb0445c205033d1fcc6910b5a");
  assert.equal(sentenceDigest,
    "3ad36fe3d672818259189a2644d131408e0e0965a1da8b06f5775246911def56");
  assert.equal(rulesDigest,
    "63716e4eaff2af0c93261c3b5a6bb7c09641381db6a97d419cd2e0b073ccd6b2");
  assert.equal(pairDigest,
    "10ee2cf80cf03a1cc401359708ef32f30b27e5e1eb288e0a3060a08828099c25");
  assert.notEqual(digest(pairIds.slice(1).join("\n")),pairDigest);
  assert.notEqual(digest(idArray.slice(1).join("\n")),rulesDigest);
  process.stdout.write("P0-CRYPTO-SNAPSHOT "+JSON.stringify({
    sourceDigest,sentenceDigest,rulesDigest,pairDigest})+"\n");
});

// Cumulative protected-main tests preserved during reconciliation of #690.

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

// ASCII selectors for the existing RCA runner; original tests remain intact.
test("P0 ORQ F1 CODE contract without execution authority", async () => {
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

test("P0 RCA missing report blocks V2 build", () => {
  mustFail(null, /sem ficha RCA/);
});
test("P0 RCA divergent plan scope blocks build", () => {
  const f = fixture();
  f.escopo[0].versao = "V3";
  mustFail(f, /sem classificação/);
});

test("V2-04 aguarda o efeito antes de contar exatamente duas consultas", () => {
  const source = readFileSync(new URL("../src/test/v2-47-tela.test.tsx", import.meta.url), "utf8");
  const inicio = source.indexOf('it("abre o painel, registra a tarefa e rele o detalhe e o portao"');
  assert.notEqual(inicio, -1, "Caso original V2-04 ausente");
  const fim = source.indexOf("\n  it(", inicio + 1);
  assert.notEqual(fim, -1, "Limite do caso original V2-04 ausente");
  const caso = source.slice(inicio, fim);
  assert.match(
    caso,
    /await waitFor\(\(\) => \{\s*expect\(dados\.consultarPlanoAcao\)\.toHaveBeenCalledTimes\(2\)/,
    "RED_V2_04_CONTAGEM_PREMATURA: o caso conta as consultas sem aguardar o efeito",
  );
});

test("P0 ORQ F2 native transport rejects non-main event", async () => {
  const { existsSync } = await import("node:fs");
  assert.ok(existsSync(new URL("./p0-actions-transport.mjs", import.meta.url)), "RED_CAUSAL_NATIVE_TRANSPORT_ABSENT");
  const { validatePush } = await import("./p0-actions-transport.mjs");
  const result = await validatePush({ context: { eventName: "pull_request", ref: "refs/heads/other" } });
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.executionAllowed, false);
});


test("P0 FISCAL RCA MANDATED_FULL_DIFF rejects the eight foreign paths without weakening scope",()=>{
  const manifest=JSON.parse(readFileSync("docs/frontend/planos/P0_GOV_PLAN_690.json","utf8"));
  assert.equal(manifest.files.length,14);
  assert.equal(manifest.full_diff,true);
  const foreign=[
    "scripts/hml/integracao-v1-fase3-backend-138.mjs",
    "scripts/hml/integracao-v1-fase3-backend-138.test.mjs",
    "scripts/hml/integracao-v1-fase3-backend.mjs",
    "scripts/hml/integracao-v1-fase3-backend.test.mjs",
    "scripts/hml/integracao-v1-fase3-code-138-runner.mjs",
    "scripts/hml/integracao-v1-fase3-code-138-runner.test.mjs",
    "scripts/hml/integracao-v1-fase3-code-drivers.mjs",
    "scripts/hml/integracao-v1-fase3-code-drivers.test.mjs"
  ];
  const args={protocol:readFileSync("docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md","utf8"),
    tests:{python:readFileSync("scripts/auditoria/test_mission_supervisor.py","utf8"),rca:readFileSync("scripts/p0-rca-impact-gate.test.mjs","utf8"),queue:readFileSync("scripts/ci/merge-group-context.test.mjs","utf8")},
    source:readFileSync("scripts/p0-rca-impact-gate.mjs","utf8"),
    workflow:readFileSync(".github/workflows/contaos-auditoria-controller.yml","utf8"),
    manifest,mission:{activation_authorized:false}};
  const structural=auditFullProtocolCoverage({...args,paths:[...manifest.files]});
  assert.equal(structural.rows.find(x=>x.id==="MANDATED_FULL_DIFF").status,"STRUCTURAL_WITNESS");
  const bad=auditFullProtocolCoverage({...args,paths:[...manifest.files,...foreign]});
  assert.equal(bad.verdict,"CHANGES_REQUESTED");
  assert.equal(bad.rows.find(x=>x.id==="MANDATED_FULL_DIFF").status,"MISSING_WITNESS");
  assert.ok(bad.issues.includes("Controle critico sem testemunha: MANDATED_FULL_DIFF"));
  const r=validateRcaImpact({planId:"76",changed:manifest.files,prNumber:690,governancePlan:manifest,fullDiffPaths:[...manifest.files,...foreign]});
  for(const file of foreign)assert.ok(r.errors.some(x=>x.includes(file)),file);
});


test("P0 FISCAL #781 protected amendment revalidated without semantic certification",()=>{
  const original=readP0690ProtectedSources("e007c4bad8f2c66c489c55e4752b71bb19c5ced0");
  const current=readP0690ProtectedSources(protectedSourceBase());
  assert.deepEqual(current.semanticSources,original.semanticSources);
  assert.deepEqual(current.manifest,original.manifest);
  assert.equal(current.normative.canonicalBlob,original.normative.canonicalBlob);
  assert.equal(current.normative.activationAuthorized,false);
  assert.deepEqual(current.normative.review_amendment,{
    pr:781,merge:"cb39a0b59addadceaacf75ed5bc4dc04534dcb57",
    blob:"eee5aac26c7be294f2237b32999481dc30d569a2",
    revalidation_plan:"d9cfb6b03be8011b5ee1472c16cbe2ba350fca7b",
    modality:"ASSISTED_PRE_PROD",semantic_certification:"NOT_CERTIFIED",
    activation_authorized:false
  });
  // Identical source bytes without the protected merge or revalidation PLAN
  // ancestry cannot grant the newly revalidated authority.
  for(const unapproved of ["cd731d27b7024c9f47bf2dce0ae01e6cac932a12",
    "cb39a0b59addadceaacf75ed5bc4dc04534dcb57"]){
    assert.throws(()=>readP0690ProtectedSources(unapproved));
  }
});
test("P0 FISCAL #781 later normative drift and rollback rejected in real isolated Git",t=>{
  const dir=mkdtempSync(join(tmpdir(),"p0-fiscal-781-"));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const root=execFileSync("git",["rev-parse","--show-toplevel"],{encoding:"utf8"}).trim();
  const env={PATH:process.env.PATH,HOME:process.env.HOME,LANG:"C",
    GIT_CONFIG_NOSYSTEM:"1",GIT_CONFIG_GLOBAL:"/dev/null",
    GIT_AUTHOR_NAME:"Fixture",GIT_AUTHOR_EMAIL:"fixture@example.invalid",
    GIT_COMMITTER_NAME:"Fixture",GIT_COMMITTER_EMAIL:"fixture@example.invalid"};
  execFileSync("git",["clone","--shared","--no-checkout",root,dir],{env,stdio:"pipe",timeout:60000});
  const g=(args,input)=>execFileSync("git",["-C",dir,...args],{encoding:"utf8",env,input,timeout:20000}).trim();
  const base=protectedSourceBase();
  const path="docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md";
  const before=execFileSync("git",["show",base+":"+path],{encoding:"utf8"});
  const proposal=execFileSync("git",["show","ee88b81a18882d4810702a1fab0f06f132b5e7c3:"+path],{encoding:"utf8"});
  for(const content of [before+"\nMudança normativa sem autorização.\n",proposal]){
    g(["read-tree",base]);
    const blob=g(["hash-object","-w","--stdin"],content);
    g(["update-index","--cacheinfo","100644,"+blob+","+path]);
    const tree=g(["write-tree"]);
    const commit=g(["commit-tree",tree,"-p",base,"-m","synthetic unapproved normative change"]);
    const script="import {readP0690ProtectedSources} from "+JSON.stringify(new URL("./p0-rca-impact-gate.mjs",import.meta.url).href)+"; readP0690ProtectedSources("+JSON.stringify(commit)+");";
    const result=spawnSync(process.execPath,["--input-type=module","-e",script],{cwd:dir,env,encoding:"utf8",timeout:30000});
    assert.equal(result.status,1,result.stdout+result.stderr);
    assert.match(result.stderr,/alteração normativa posterior exige revalidação/);
  }
});


// PLAN #863: RED causal, synthetic contract only; never a semantic receipt.
test("P0 #863 RED: full assisted semantic fixture must be admissible PRE_PROD, not PROD",async()=>{
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(snapshots);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const head="f5de50d3a5106caea62a5fbcf423299436bfdcc9";
  const independent={head,review_id:72652,author:"implementer",
    reviewer:"independent-auditor",state:"APPROVED",
    scope:"FULL_SEMANTIC_CORPUS"};
  const axes={authority:{actor:"authorized reviewer",source:"protected PLAN"},
    antecedent:{event:"head transition",source:"protected PLAN"},
    outcomes:{positive:{decision:"allow qualified review",source:"PLAN"},
      negative:{decision:"fail closed",source:"PLAN"}},
    interactions:{clauses:["PLAN","EMENDA"],counterexample:"revoked review still green"},
    live:{source:"authenticated job",url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head},
    revocation:{trigger:"new head",source:"PLAN"},
    boundary:{phase:"BUILD",external:"activation separate"}};
  const proof=id=>({id,head,
    interpretation:`Synthetic fixture statement for ${id}, not a substantive legal interpretation.`,
    counterexample:`Synthetic contradictory case for ${id}, not executed evidence.`,
    witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head},
    negative_witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/2",head},
    independent_review_id:independent.review_id});
  const rules=worklist.normative_rules.map(x=>({
    ...proof(x.rule_id),rule_id:x.rule_id,axes}));
  const sentences=sentenceInventory.candidates.map(x=>({
    ...proof(x.id),classification:"NORMATIVE",source_id:x.source_id,
    text_sha256:x.text_sha256,axes}));
  const sources=inventory.lines.map(x=>({
    ...proof(x.id),source_id:x.id,text_sha256:x.text_sha256,blob:x.blob}));
  const interactions=[];
  for(let i=0;i<worklist.normative_rules.length;i++)
    for(let j=i+1;j<worklist.normative_rules.length;j++){
      const pair_id=worklist.normative_rules[i].rule_id+"|"+
        worklist.normative_rules[j].rule_id;
      interactions.push({...proof(pair_id),pair_id,decision:"NONINTERACTING",
        left_rule_id:worklist.normative_rules[i].rule_id,
        right_rule_id:worklist.normative_rules[j].rule_id,
        pair_rationale:"Synthetic fixture only: "+pair_id+" not a real adjudication of two protected rules.",
        separation_basis:"Synthetic non-interaction assumption unverified by independent reviewer."});
    }
  const input={inventory,worklist,sentenceInventory,reverseCoverage,
    head,independent,rules,sentences,sources,interactions};

  const base="18b53fe3c7c80cba0c68cd4b203e5a0e84a4915e";
  const report="Synthetic assisted contract only, never a real review or certificate. ".repeat(8);
  const assisted={head,base,review_id:72653,author:"contaos9999",
    reviewer:"Edivan5002",state:"APPROVED",scope:"FULL_SEMANTIC_CORPUS",
    modality:"ASSISTED_PRE_PROD",report,report_sha256:createHash("sha256").update(report).digest("hex"),contradiction_completed:true};
  const assistedRow=({independent_review_id,...row})=>({...row,base,
    witness:{...row.witness,base},negative_witness:{...row.negative_witness,base},assisted_review_id:assisted.review_id});
  const candidate={...input,base,release_stage:"PRE_PROD",independent:null,assisted,
    rules:rules.map(assistedRow),sentences:sentences.map(assistedRow),
    sources:sources.map(assistedRow),interactions:interactions.map(assistedRow),
    authenticateAssisted:async()=>true,authenticateWitness:async()=>true};
  const result=await assessSemanticCompletenessGate(candidate);
  assert.equal(result.semantic_completeness,"PASS","P0 #863 assisted PRE_PROD false block: "+JSON.stringify(result.issues));
  assert.equal(result.release,"SEMANTIC_REVIEW_CERTIFIED_ONLY");
  assert.equal(result.review_modality,"ASSISTED_PRE_PROD");
  assert.equal(result.independent_review_id,null);
  assert.equal(result.assisted_review_id,assisted.review_id);
  const strip=({assisted_review_id,...row})=>row;
  const preaudit=await assessSemanticPreauditGate({...candidate,assisted:null,
    rules:candidate.rules.map(strip),sentences:candidate.sentences.map(strip),
    sources:candidate.sources.map(strip),interactions:candidate.interactions.map(strip)});
  assert.equal(preaudit.semantic_preaudit,"PASS");
  assert.equal(preaudit.release,"ASSISTED_REVIEW_ELIGIBLE_ONLY");
  assert.equal(preaudit.semantic_completeness,"INCONCLUSIVE");
  for(const bad of [
    {...candidate,release_stage:"PROD"},
    {...candidate,release_stage:"UNKNOWN"},
    {...candidate,release_stage:undefined},
    {...candidate,assisted:null},
    {...candidate,assisted:{...assisted,head:"c".repeat(40)}},
    {...candidate,assisted:{...assisted,base:"c".repeat(40)}},
    {...candidate,assisted:{...assisted,reviewer:assisted.author}},
    {...candidate,assisted:{...assisted,state:"CHANGES_REQUESTED"}},
    {...candidate,assisted:{...assisted,contradiction_completed:false}},
    {...candidate,assisted:{...assisted,report_sha256:"f".repeat(64)}},
    {...candidate,assisted:{...assisted,authorship_independent:true}},
    {...candidate,independent:{...independent,head}},
    {...candidate,rules:rules.map(assistedRow).map((x,i)=>i===0?{...x,independent_review_id:72652}:x)},
    {...candidate,authenticateAssisted:async()=>false},
    {...candidate,rules:rules.map(assistedRow).slice(1)},
    {...candidate,authenticateWitness:async()=>false},
    {...candidate,rules:candidate.rules.map((x,i)=>i===0?{...x,witness:{...x.witness,base:"f".repeat(40)}}:x)},
    {...candidate,base:"d9cfb6b03be8011b5ee1472c16cbe2ba350fca7b",assisted:{...assisted,base:"d9cfb6b03be8011b5ee1472c16cbe2ba350fca7b"}},
  ]){
    const denied=await assessSemanticCompletenessGate(bad);
    assert.equal(denied.release,"NO_GO",JSON.stringify(denied.issues));
  }
});
test("P0 #863 RED: missing or unknown release stage cannot inherit independent certification",async()=>{
  const snapshots=readP0690ProtectedSources(protectedSourceBase()).semanticSources;
  const inventory=inventoryProtectedSemanticLines(snapshots);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const head="f5de50d3a5106caea62a5fbcf423299436bfdcc9";
  const independent={head,review_id:72652,author:"implementer",
    reviewer:"independent-auditor",state:"APPROVED",
    scope:"FULL_SEMANTIC_CORPUS"};
  const axes={authority:{actor:"authorized reviewer",source:"protected PLAN"},
    antecedent:{event:"head transition",source:"protected PLAN"},
    outcomes:{positive:{decision:"allow qualified review",source:"PLAN"},
      negative:{decision:"fail closed",source:"PLAN"}},
    interactions:{clauses:["PLAN","EMENDA"],counterexample:"revoked review still green"},
    live:{source:"authenticated job",url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head},
    revocation:{trigger:"new head",source:"PLAN"},
    boundary:{phase:"BUILD",external:"activation separate"}};
  const proof=id=>({id,head,
    interpretation:`Synthetic fixture statement for ${id}, not a substantive legal interpretation.`,
    counterexample:`Synthetic contradictory case for ${id}, not executed evidence.`,
    witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head},
    negative_witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/2",head},
    independent_review_id:independent.review_id});
  const rules=worklist.normative_rules.map(x=>({
    ...proof(x.rule_id),rule_id:x.rule_id,axes}));
  const sentences=sentenceInventory.candidates.map(x=>({
    ...proof(x.id),classification:"NORMATIVE",source_id:x.source_id,
    text_sha256:x.text_sha256,axes}));
  const sources=inventory.lines.map(x=>({
    ...proof(x.id),source_id:x.id,text_sha256:x.text_sha256,blob:x.blob}));
  const interactions=[];
  for(let i=0;i<worklist.normative_rules.length;i++)
    for(let j=i+1;j<worklist.normative_rules.length;j++){
      const pair_id=worklist.normative_rules[i].rule_id+"|"+
        worklist.normative_rules[j].rule_id;
      interactions.push({...proof(pair_id),pair_id,decision:"NONINTERACTING",
        left_rule_id:worklist.normative_rules[i].rule_id,
        right_rule_id:worklist.normative_rules[j].rule_id,
        pair_rationale:"Synthetic fixture only: "+pair_id+" not a real adjudication of two protected rules.",
        separation_basis:"Synthetic non-interaction assumption unverified by independent reviewer."});
    }
  const input={inventory,worklist,sentenceInventory,reverseCoverage,
    head,independent,rules,sentences,sources,interactions};

  for(const release_stage of [undefined,"UNKNOWN"]){
    const result=await assessSemanticCompletenessGate({...input,release_stage,
      authenticateIndependent:async()=>true,authenticateWitness:async()=>true});
    assert.equal(result.release,"NO_GO","P0 #863 missing/unknown stage improperly accepted: "+JSON.stringify(result.issues));
    assert.ok(result.issues.includes("SEMANTIC_RELEASE_STAGE_UNKNOWN"));
  }
});


test("P0 #863 protected modality authority exact merge, blob and ancestry, no certification",t=>{
  const base="18b53fe3c7c80cba0c68cd4b203e5a0e84a4915e";
  const prior="d9cfb6b03be8011b5ee1472c16cbe2ba350fca7b";
  const path="docs/frontend/planos/EMENDA_P0_690_MODALIDADE_AUDITORIA_PRE_PROD_2026-11-28.md";
  const current=readP0690ProtectedSources(base);
  const historical=readP0690ProtectedSources(prior);
  assert.deepEqual(current.semanticSources,historical.semanticSources);
  assert.deepEqual(current.manifest,historical.manifest);
  assert.equal(historical.normative.modality_amendment,undefined);
  assert.deepEqual(current.normative.modality_amendment,{
    pr:863,merge:base,blob:"4e4473aef5335a6891e78e2d248be50718ea591e",decision_id:7237068104,
    required_review_by_stage:{PRE_PROD:"ASSISTED_PRE_PROD",PROD:"INDEPENDENT"},
    activation_authorized:false,semantic_certification:"NOT_CERTIFIED"
  });
  assert.throws(()=>readP0690ProtectedSources("ec96b4708db8ea8075ef9c7b49b20ba09ef9e7e1"),/modalidade #863/);
  const dir=mkdtempSync(join(tmpdir(),"p0-fiscal-863-"));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const root=execFileSync("git",["rev-parse","--show-toplevel"],{encoding:"utf8"}).trim();
  const env={PATH:process.env.PATH,HOME:process.env.HOME,LANG:"C",
    GIT_CONFIG_NOSYSTEM:"1",GIT_CONFIG_GLOBAL:"/dev/null",
    GIT_AUTHOR_NAME:"Fixture",GIT_AUTHOR_EMAIL:"fixture@example.invalid",
    GIT_COMMITTER_NAME:"Fixture",GIT_COMMITTER_EMAIL:"fixture@example.invalid"};
  execFileSync("git",["clone","--shared","--no-checkout",root,dir],{env,stdio:"pipe",timeout:60000});
  const g=(args,input)=>execFileSync("git",["-C",dir,...args],{encoding:"utf8",env,input,timeout:20000}).trim();
  for(const action of ["alter","remove"]){
    g(["read-tree",base]);
    if(action==="alter"){
      const blob=g(["hash-object","-w","--stdin"],"unapproved change");
      g(["update-index","--cacheinfo","100644,"+blob+","+path]);
    }else g(["update-index","--force-remove",path]);
    const tree=g(["write-tree"]);
    const commit=g(["commit-tree",tree,"-p",base,"-m","synthetic #863 authority mutation"]);
    const script="import {readP0690ProtectedSources} from "+JSON.stringify(new URL("./p0-rca-impact-gate.mjs",import.meta.url).href)+"; readP0690ProtectedSources("+JSON.stringify(commit)+");";
    const result=spawnSync(process.execPath,["--input-type=module","-e",script],{cwd:dir,env,encoding:"utf8",timeout:30000});
    assert.equal(result.status,1,result.stdout+result.stderr);
    assert.match(result.stderr,/modalidade #863/);
  }
});
test("P0 #863 review stage priority models preserve independent PROD and no missing stage",()=>{
  for(const id of ["ACTIVE_VERSUS_CERTIFIED","CERTIFICATION_VERSUS_RECOVERY"]){
    const probe=P0_PRIORITY_CAUSAL_PROBES.find(x=>x.caseId===id);
    const check=P0_PRIORITY_CAUSAL_MODELS[id];
    assert.equal(check(probe.positive),true);
    assert.equal(check({...probe.positive,release_stage:"PROD"}),false);
    assert.equal(check({...probe.positive,release_stage:undefined}),false);
    assert.equal(check({...probe.positive,release_stage:"UNKNOWN"}),false);
    assert.equal(check({...probe.positive,assistedReview:false}),false);
    assert.equal(check({...probe.positive,independentReview:true}),false);
    assert.equal(check({...probe.positive,release_stage:"PROD",assistedReview:false,independentReview:true}),true);
  }
});


test("P0 #863 RED: verified flags cannot replace protected corpus or permit zero witnesses",async()=>{
  // Real protected source reconstruction; witnesses are deliberately absent.
  const base=protectedSourceBase();
  const head="a".repeat(40);
  let calls=0;
  const empty={inventory:{inventory_verified:true,lines:[]},
    worklist:{worklist_verified:true,normative_rules:[]},
    sentenceInventory:{partition_verified:true,candidates:[]},
    reverseCoverage:{source_count:0,unproven_rule_count:0},
    head,base,release_stage:"PRE_PROD",
    authenticateWitness:async()=>{calls++;return false;}};
  const actual=await assessSemanticPreauditGate(empty);
  assert.equal(actual.release,"NO_GO",
    "P0 CORPUS_EMPTY_FALSE_PASS: "+JSON.stringify({actual,calls}));
  assert.equal(actual.semantic_preaudit,"INCONCLUSIVE");
  assert.ok(actual.issues.includes("SEMANTIC_PROTECTED_CORPUS_MISMATCH"));
  assert.equal(calls,0,"incomplete corpus must fail before evidence requests");
});

test("P0 #863 RED: source-bound subset cannot masquerade as full corpus",async()=>{
  // Synthetic evidence is intentionally structurally valid for one row per
  // collection, never proof of actual semantic review.
  const base=protectedSourceBase(),head="a".repeat(40);
  const inventory=inventoryProtectedSemanticLines(readP0690ProtectedSources(base).semanticSources);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const rule=worklist.normative_rules[0],sentence=sentenceInventory.candidates[0],source=inventory.lines[0];
  const axes={authority:{actor:"authorized reviewer",source:"PLAN"},
    antecedent:{event:"head transition",source:"PLAN"},
    outcomes:{positive:{decision:"allow qualified review",source:"PLAN"},negative:{decision:"fail closed",source:"PLAN"}},
    interactions:{clauses:["PLAN","EMENDA"],counterexample:"revoked review still green"},
    live:{source:"synthetic fixture only",url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head,base},
    revocation:{trigger:"new head",source:"PLAN"},boundary:{phase:"BUILD",external:"activation separate"}};
  const proof=id=>({id,head,base,interpretation:"Synthetic interpretation for "+id+"; not a real audit.",
    counterexample:"Synthetic counterexample for "+id+"; not a real witness.",
    witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/1",head,base},
    negative_witness:{run_url:"https://github.com/contaos999999/contaos-hml-control/actions/runs/2",head,base}});
  let calls=0;
  const actual=await assessSemanticPreauditGate({
    inventory:{...inventory,lines:[source]},
    worklist:{...worklist,normative_rules:[rule]},
    sentenceInventory:{...sentenceInventory,candidates:[sentence]},
    reverseCoverage:{source_count:1,unproven_rule_count:1},
    rules:[{...proof(rule.rule_id),rule_id:rule.rule_id,axes}],
    sentences:[{...proof(sentence.id),classification:"NORMATIVE",source_id:sentence.source_id,text_sha256:sentence.text_sha256,axes}],
    sources:[{...proof(source.id),source_id:source.id,blob:source.blob,text_sha256:source.text_sha256}],
    interactions:[],head,base,release_stage:"PRE_PROD",
    authenticateWitness:async()=>{calls++;return true;}});
  assert.equal(actual.release,"NO_GO",
    "P0 CORPUS_SUBSET_FALSE_PASS: "+JSON.stringify({actual,calls}));
  assert.ok(actual.issues.includes("SEMANTIC_PROTECTED_CORPUS_MISMATCH"));
  assert.equal(calls,0,"truncated source set cannot reach external witness validation");
});


test("P0 #863 corpus integrity: same cardinality cannot hide replaced source or clause",async()=>{
  const base=protectedSourceBase(),head="a".repeat(40);
  const inventory=inventoryProtectedSemanticLines(readP0690ProtectedSources(base).semanticSources);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const input={inventory,worklist,sentenceInventory,reverseCoverage,head,base,release_stage:"PRE_PROD"};
  let calls=0;
  const clean=await assessSemanticPreauditGate({...input,authenticateWitness:async()=>{calls++;return true;}});
  assert.equal(clean.semantic_preaudit,"INCONCLUSIVE");
  assert.ok(!clean.issues.includes("SEMANTIC_PROTECTED_CORPUS_MISMATCH"),JSON.stringify(clean.issues));
  assert.deepEqual([clean.rule_count,clean.source_count,clean.sentence_count,clean.pair_count],[137,118,381,9316]);
  for(const mutant of [
    {...input,inventory:{...inventory,lines:inventory.lines.map((x,i)=>i===0?{...x,text_sha256:"f".repeat(64)}:x)}},
    {...input,inventory:{...inventory,lines:inventory.lines.map((x,i)=>i===0?{...x,text:x.text+" adulterated"}:x)}},
    {...input,worklist:{...worklist,normative_rules:worklist.normative_rules.map((x,i)=>i===0?{...x,source_links:["SRC-FORGED"]}:x)}},
    {...input,sentenceInventory:{...sentenceInventory,candidates:sentenceInventory.candidates.map((x,i)=>i===0?{...x,text_sha256:"f".repeat(64)}:x)}},
    {...input,reverseCoverage:{...reverseCoverage,uncovered_source_count:0}},
  ]){
    const out=await assessSemanticPreauditGate({...mutant,authenticateWitness:async()=>{calls++;return true;}});
    assert.equal(out.release,"NO_GO");
    assert.ok(out.issues.includes("SEMANTIC_PROTECTED_CORPUS_MISMATCH"),JSON.stringify(out.issues));
    assert.deepEqual([out.rule_count,out.source_count,out.sentence_count,out.pair_count],[137,118,381,9316]);
  }
  assert.equal(calls,0);
});

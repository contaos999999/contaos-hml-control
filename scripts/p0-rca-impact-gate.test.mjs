import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateRcaImpact, verifyRcaOperational, runCase, parseFullDiffNameStatus, uniquePrAssociation, safeTreeEntry, resolvePrContext, verifyRawFullDiffModes, classifyProtectedPush,
  assertImmutableP0Governance, IMMUTABLE_P0_690_MANIFEST,
  ASSISTANT_PREAUDIT_MARKER, ASSISTANT_PREAUDIT_CRITERIA,
  PRECERT_REQUIRED_CHECKS, ADVERSARIAL_V2_LENSES, ADVERSARIAL_V2_STEP_NAMES,
  ADVERSARIAL_V2_CHECK_NAME, ADVERSARIAL_V2_CAUSAL_CASES, classifyGithubReadError, validateAssistantPrecertRelease,
  parseAssistantPreaudit, verifyAssistantPrecertInGithub,
  auditFullProtocolCoverage, auditNormativeSemanticCompleteness, PROTECTED_SEMANTIC_SOURCES, inventoryProtectedSemanticLines, analyzeSemanticCorpusForReview, assembleSemanticContradictionDossier, writeSemanticDossierJsonl, validatePrioritySemanticDisputes, P0_SEMANTIC_PRIORITY_DISPUTES, verifySemanticSourceClaims, inventorySemanticSentenceCandidates, buildSevenAxisSemanticBacklog, auditSemanticReverseCoverage, assessSemanticPreauditGate, assessSemanticCompletenessGate, validateSevenAxisSemanticBacklog, attestFullProtocolExecutions, parseFullProtocolSuiteResult, attestProtectedNormativeSources, verifyPrecertRunOrigin, classifyPrecertReadiness } from "./p0-rca-impact-gate.mjs";

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
  allow = [], extras = {}) => validateRcaImpact({
  planId: id, changed, report, reportExists: Boolean(report),
  legacyAllowlist: allow, expectedFrontendSha: SHA, expectedBackendSha: BACKEND,
  fileExists: () => true, readBytes: () => proofBytes,
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
  f.versao = "V1"; f.prompt_id = "75";
  f.escopo = [{ arquivo: V1, versao: "V1", justificativa: "cadastro V1 sob revisao RCA" }];
  f.itens[0].id = "RCA-V1-001";
  f.itens[0].solucao.arquivos = [V1];
  f.itens[0].impacto.versoes_afetadas = ["V1"];
  return f;
};
const v1Check = (doc=v1Fixture(), extra={}) =>
  check(null,[V1,V1_SCOPE],"75",[V1],{v1Scope:doc,v1ScopeChanged:true,...extra});

test("P0 RCA — arquivo V1 na allowlist sem RCA causal NÃO é liberado", () => {
  assert.match(check(null,[V1],"75",[V1]).errors.join(" "), /sem ficha RCA causal/);
});
test("P0 RCA — V1 com atestado legado de escopo/teste mas sem causa RED é FAIL", () => {
  const stale={schema:"contaos.p0.v1-scope-proof.v1",prompt_id:"75",baseline_sha:SHA,
    arquivos:[{arquivo:V1,versao:"V1",justificativa:"escopo V1"}],testes:[ref("V1-REG")]};
  assert.match(v1Check(stale).errors.join(" "), /schema, versão|ficha sem itens/);
});
test("P0 RCA — V1 com RCA v2, impacto, RED e casos executáveis passa estruturalmente", () => {
  assert.deepEqual(v1Check().errors,[]);
});
test("P0 RCA — V1 com causa apenas plausível falha", () => {
  const r=v1Fixture();r.itens[0].causa.status="PLAUSIVEL";
  assert.match(v1Check(r).errors.join(" "),/causa raiz/);
});
test("P0 RCA — V1 sem RED ancestral ou execução real não certifica", async () => {
  const r=await live(v1Fixture(),{isAncestor:false});
  assert.match(r.errors.join(" "),/RED sem erro observado/);
});
test("P0 RCA — V1 com GREEN/NEG/REG sem execução real falha", async () => {
  const r=await live(v1Fixture(),{execute:false});
  assert.match(r.errors.join(" "),/não executado com PASS/);
});
test("P0 RCA — novo script sob PLAN 75 sem plano protegido deve falhar", () => {
  assert.match(check(null,["scripts/guard-rules.mjs"],"75",[]).errors.join(" "),
    /governança sem PLAN protegido/);
});
test("P0 RCA — plano GOV aprovado pertence somente à PR e arquivos exatos", () => {
  const opts={prNumber:661,governancePlan:{
    approved:true,pr_number:661,files:["scripts/p0-evidence-live-gate.mjs"]}};
  assert.deepEqual(check(null,["scripts/p0-evidence-live-gate.mjs"],"75",[],opts).errors,[]);
  assert.match(check(null,["scripts/guard-extra.mjs"],"75",[],opts).errors.join(" "),
    /governança sem PLAN protegido/);
  assert.match(check(null,["scripts/p0-evidence-live-gate.mjs"],"75",[],{
    ...opts,prNumber:663,
  }).errors.join(" "),/governança sem PLAN protegido/);
});
test("P0 RCA — V2 explícita dentro de arquivo V1 permitido não é isenta", () => {
  const attest={
    ...v1Fixture(),
  };
  const x=check(null,[V1,V1_SCOPE],"75",[V1],{
    v1Scope:attest,v1ScopeChanged:true,addedLines:{[V1]:"// V2-DIL-001"},
  });
  assert.match(x.errors.join(" "),/introduz referências V2/);
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
const preflight = () => ({
  status:"VERIFICADO", baseline_sha:SHA,
  arquivo_evidencia:"docs/frontend/auditorias/preflight/v2-44.json",
  arquivo_sha256:proofHash,
  checks:["CONTRATO","RBAC_RLS","DADOS_INTEGRIDADE","DEPENDENCIAS"]
    .map((tipo)=>({tipo,teste:ref("PRE-"+tipo)})),
});
test("P0 RCA — frase genérica de preflight não comprova funcionalidade", () => {
  const f=fixture();f.itens[0].tipo="NOVA_FUNCIONALIDADE";
  f.itens[0].preflight={status:"PASS",evidencia:"preflight e contrato conferidos"};
  assert.match(check(f).errors.join(" "),/preflight sem contrato/);
});
test("P0 RCA — nova funcionalidade precisa quatro casos preflight e SHA256", () => {
  const f=fixture();f.itens[0].tipo="NOVA_FUNCIONALIDADE";
  f.itens[0].preflight=preflight();
  assert.deepEqual(check(f).errors, []);
  f.itens[0].preflight.arquivo_sha256="c".repeat(64);
  assert.match(check(f).errors.join(" "), /preflight sem contrato/);
  f.itens[0].preflight=preflight();
  f.itens[0].preflight.checks.pop();
  assert.match(check(f).errors.join(" "), /preflight sem contrato/);
});
test("P0 RCA LIVE — preflight exige execução dos quatro testes", async () => {
  const f=fixture();f.itens[0].tipo="NOVA_FUNCIONALIDADE";
  f.itens[0].preflight=preflight();
  const r=await live(f,{execute:false});
  assert.match(r.errors.join(" "),/PRE-CONTRATO|PRE-RBAC_RLS/);
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
  const independent=valid.rows.filter(x=>x.scope==="BUILD_NEGATIVE_PROOF_INDEPENDENT_AUDIT_EXTERNAL");
  assert.deepEqual(independent.map(x=>x.id).sort(),[
    "PLAN-S3-RULE-05","PLAN-S3-RULE-06","S5.1:Revisão independente"].sort(),
    "PLAN §3 technical auditor and post-merge CERTIFIED require independent proof");
  assert.equal(valid.independentAuditPending,3);
  assert.ok(independent.every(x=>
    x.execution==="BUILD_NEGATIVE_PASS_INDEPENDENT_AUDIT_PENDING" &&
    valid.external.some(e=>e.requirement===x.id &&
      e.status==="BLOCKED_EXTERNAL_FOR_INDEPENDENT_AUDIT")),
    "none of three independent obligations may be self-certified");
  assert.equal(valid.executed+valid.activationBlocked+valid.independentAuditPending,
    valid.requirements);
  assert.ok(activation.every(x=>valid.external.some(e=>e.requirement===x.id &&
    e.status==="BLOCKED_EXTERNAL_FOR_ACTIVATION")));
  assert.ok(valid.external.length>=4);
  assert.ok(valid.external.every(x=>[
    "BLOCKED_EXTERNAL_FOR_ACTIVATION","BLOCKED_EXTERNAL_FOR_INDEPENDENT_AUDIT"
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
      independent.has(n)?"BUILD_NEGATIVE_PROOF_INDEPENDENT_AUDIT_EXTERNAL":"BUILD";
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


test("P0 SEMANTIC SOURCE: protected PLAN and amendment are byte-bound, comprehensive line inventory remains NO_GO",()=>{
  const snapshots=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES).map(
    ([path,blob])=>[path,{content:readFileSync(path,"utf8"),blob}]));
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
    !!x.category&&x.assessment==="REQUIRES_INDEPENDENT_SEMANTIC_REVIEW"&&
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
  const incomplete=verifySemanticSourceClaims(out,[base]);
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
    const check=verifySemanticSourceClaims(out,mutation);
    assert.ok(check.issues.length>0);
    assert.equal(check.verdict,"INCONCLUSIVE");
    assert.equal(check.release,"NO_GO");
  }
});


test("P0 SEMANTIC COMPLETENESS requires authenticated 137/381/118/9316 evidence; BUILD PASS not authority",async()=>{
  const sourceFiles=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES)
    .map(([path,blob])=>[path,{content:readFileSync(path,"utf8"),blob}]));
  const inventory=inventoryProtectedSemanticLines(sourceFiles);
  const worklist=buildSevenAxisSemanticBacklog(inventory);
  const sentenceInventory=inventorySemanticSentenceCandidates(inventory);
  const reverseCoverage=auditSemanticReverseCoverage(inventory,worklist);
  const head="f5de50d3a5106caea62a5fbcf423299436bfdcc9";
  const input={inventory,worklist,sentenceInventory,reverseCoverage,head};
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
  const snapshots=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES)
    .map(([path,blob])=>[path,{content:readFileSync(path,"utf8"),blob}]));
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
  const snapshots=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES).map(
    ([path,blob])=>[path,{content:readFileSync(resolve(process.cwd(),path),"utf8"),blob}]));
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
  const snapshots=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES).map(
    ([path,blob])=>[path,{content:readFileSync(path,"utf8"),blob}]));
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
  const files=Object.fromEntries(Object.entries(PROTECTED_SEMANTIC_SOURCES).map(
    ([path,blob])=>[path,{content:readFileSync(path,"utf8"),blob}]));
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

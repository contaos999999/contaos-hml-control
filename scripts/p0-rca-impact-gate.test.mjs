import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateRcaImpact, verifyRcaOperational, runCase, parseFullDiffNameStatus, uniquePrAssociation, safeTreeEntry, resolvePrContext, verifyRawFullDiffModes, classifyProtectedPush,
  assertImmutableP0Governance, IMMUTABLE_P0_690_MANIFEST,
  ASSISTANT_PREAUDIT_MARKER, ASSISTANT_PREAUDIT_CRITERIA,
  PRECERT_REQUIRED_CHECKS, ADVERSARIAL_V2_LENSES, ADVERSARIAL_V2_STEP_NAMES,
  ADVERSARIAL_V2_CHECK_NAME, ADVERSARIAL_V2_CAUSAL_CASES, validateAssistantPrecertRelease,
  parseAssistantPreaudit, verifyAssistantPrecertInGithub } from "./p0-rca-impact-gate.mjs";

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
      "https://github.com/contaos999999/contaos-hml-control/actions/runs/777/job/100",
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
    steps:[...ADVERSARIAL_V2_STEP_NAMES,...ADVERSARIAL_V2_CAUSAL_CASES.map(x=>
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

async function paLiveVerification({mutateReadback,manual=false}={}) {
  const f=paFixture();
  let commentsRead=0, checksRead=0, reviewsRead=0, prReads=0, artifactReads=0;
  const fakeApi=async path=>{
    if(path.endsWith("/pulls/690")) {prReads++;const pr=structuredClone(f.pr);if(prReads===2 && mutateReadback==="draft") pr.draft=true;return pr;}
    if(path.endsWith("/git/ref/heads/main")) return {object:{sha:PA_BASE}};
    if(path.endsWith("/commits/"+PA_HEAD+"/check-runs?per_page=100")){
      checksRead++;
      const runs=structuredClone(f.checkRuns);
      if(checksRead===2 && mutateReadback==="checks") runs[0].conclusion="failure";
      return {total_count:runs.length,check_runs:runs};
    }
    if(path.endsWith("/actions/artifacts/9001")) {artifactReads++;const art=structuredClone(f.artifact);if(artifactReads===2 && mutateReadback==="artifact") art.expired=true;return art;}
    if(path.endsWith("/actions/jobs/888")) return f.testCJob;
    if(path.endsWith("/actions/jobs/889")) return f.v2Job;
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
      if(reviewsRead===2 && mutateReadback==="reviews")
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
  return verifyAssistantPrecertInGithub({
    token:"fixture-only",api:fakeApi,list:fakeList,
    baseManifest:()=>f.manifest,
    env:{GITHUB_EVENT_NAME:manual?"workflow_dispatch":"pull_request",
      GITHUB_REF:manual?"refs/heads/build/p0-abs-fiscal-universal":"refs/pull/690/merge",
      GITHUB_SHA:PA_HEAD,
      GITHUB_REPOSITORY:"contaos999999/contaos-hml-control",
      INPUT_PREAUDIT_PR:"690",INPUT_PREAUDIT_HEAD:PA_HEAD,INPUT_PREAUDIT_BASE:manual?"":PA_BASE},
  });
}
test("P0 adversarial GitHub live verified snapshot can release precert only",async()=>{
  const o=await paLiveVerification();
  assert.equal(o.pass,true,JSON.stringify(o));
  assert.equal(o.release,"PRE_CERTIFICATION_ONLY");
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

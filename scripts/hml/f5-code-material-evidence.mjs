/** F5 CODE material validator; partial receipts are never certificates. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export const BACKEND = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
export const BATCHES = Object.freeze({
  adm01: [
    "0002",
    "0007",
    "0009",
    "0011",
    "0012",
    "0014",
    ...Array.from({ length: 19 }, (_, i) => String(i + 16).padStart(4, "0")),
  ],
  context: ["0005", "0036", "0037", "0043"],
  competence: ["0058", "0059", "0060", "0061", "0063"],
  data: ["0050", "0051", "0052", "0053", "0054", "0055", "0056", "0062", "0064", "0065"],
  actions: ["0041", "0045", "0046", "0047", "0048", "0049", "0057", "0066", "0067", "0068"],
});
export const A = "a1111111-1111-4111-8111-111111111111",
  B = "a2222222-2222-4222-8222-222222222222";
const U = "a3333333-3333-4333-8333-333333333333",
  V = "b3333333-3333-4333-8333-333333333333";
const sha = (v) => typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
const num = (v) => typeof v === "string" && /^[1-9][0-9]*$/.test(v);
const uuid = (v) =>
  typeof v === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v);
const record = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const fail = (reason) => {
  throw Error(reason);
};
const rules = {
  "0005": {
    positive: {
      actor: U,
      tenant: A,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "DENY",
    },
  },
  "0036": {
    positive: {
      actor: V,
      tenant: B,
      target: B,
      frontier: "selector",
      operation: "list",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "selector",
      operation: "list",
      decision: "ISOLATED",
    },
  },
  "0037": {
    positive: {
      actor: U,
      tenant: A,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ISOLATED",
    },
  },
  "0043": {
    positive: {
      actor: U,
      tenant: B,
      target: B,
      frontier: "dashboard",
      operation: "switch",
      decision: "ALLOW",
    },
    negative: {
      actor: U,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "switch",
      decision: "ISOLATED",
    },
  },
};
const readFrontiers = {
  competence: {
    "0058": "obter_visao_geral_competencia",
    "0059": "obter_documentos_competencia_v115",
    "0060": "obter_analise_competencia_v116",
    "0061": "obter_detalhe_requisito_v117",
    "0063": "obter_visao_geral_competencia",
  },
  data: {
    "0050": "contratos",
    "0051": "fontes_normativas",
    "0052": "propostas_orcamentarias",
    "0053": "listas_verificacao",
    "0054": "documentos_contrato",
    "0055": "documentos_contrato",
    "0056": "competencias",
    "0062": "pareceres_internos",
    "0064": "apresentacoes_contratante",
    "0065": "relatorios_historicos_contratante",
  },
};
const contextTitles = {
  "0005": [
    "authorized reader sees own dashboard",
    "forged organization receives denial without dashboard",
  ],
  "0036": ["B identity sees and selects B only", "old identity preference cannot select A"],
  "0037": [
    "login list and dashboard use authenticated A",
    "second identity does not inherit first cache",
  ],
  "0043": [
    "real selector switch invalidates A cache",
    "delayed A data cannot render after B switch",
  ],
};
const batchesWithEvidence = {
  context: {
    file: "f5-code-context-session-isolation.test.tsx",
    suite: "F5 context material isolation",
    title: (id, index) => contextTitles[id][index],
    check: checkContext,
  },
  competence: {
    file: "f5-code-sys04-competence-isolation.test.ts",
    suite: "F5 SYS04 competence isolation",
    title: (_id, index) =>
      ["material read in the selected tenant", "stale case is denied after switching identity"][
        index
      ],
    check: (o, id) => checkRead("competence", o, id),
  },
  data: {
    file: "f5-code-sys04-data-isolation.test.ts",
    suite: "F5 SYS04 data isolation",
    title: (_id, index) =>
      [
        "scoped query returns only the selected tenant material",
        "previous tenant data is denied without follow-on reads",
      ][index],
    check: (o, id) => checkRead("data", o, id),
  },
};
function checkRead(batch, o, id) {
  const positive = o.kind === "positive";
  const frontier = readFrontiers[batch][id];
  if (
    o.frontier !== frontier ||
    o.operation !== "read" ||
    o.role !== "leitor" ||
    o.target !== A ||
    o.actor !== (positive ? U : V) ||
    o.tenant !== (positive ? A : B) ||
    o.decision !== (positive ? "ALLOW" : "DENY")
  )
    fail("read actor/tenant/frontier mismatch");
  const b = o.readback;
  if (b.selected !== o.tenant || b.foreignVisible !== false)
    fail("read context or exposure mismatch");
  if (positive) {
    if (!uuid(b.materialId)) fail("read material identity missing");
    if (batch === "competence") {
      if (b.organizationId !== A || b.competenceId !== "a6000000-0000-4000-8000-000000000002")
        fail("read competence identity mismatch");
    } else {
      const queries = id === "0055" ? [frontier, "versoes_documento", "arquivos"] : [frontier];
      if (
        b.contractId !== "a7000000-0000-4000-8000-000000000001" ||
        JSON.stringify(b.queries) !== JSON.stringify(queries)
      )
        fail("data read boundary mismatch");
    }
    return;
  }
  if (b.status !== 403 || b.code !== "42501" || b.mutationCount !== 0)
    fail("read was not denied at the authorized boundary");
  if (batch === "competence") {
    if (
      b.classified !== "sem_permissao" ||
      b.ownCompetenceId !== "b6000000-0000-4000-8000-000000000002" ||
      b.targetCompetenceId !== "a6000000-0000-4000-8000-000000000002"
    )
      fail("invalid competence denial");
  } else {
    const classified = ["0062", "0064"].includes(id) ? "sem_permissao" : "negado";
    if (
      b.classified !== classified ||
      !uuid(b.ownMaterialId) ||
      JSON.stringify(b.queries) !== JSON.stringify([frontier])
    )
      fail("invalid data denial");
  }
}
function checkContext(o, id) {
  const r = rules[id]?.[o.kind];
  if (!r || Object.entries(r).some(([k, v]) => o[k] !== v) || o.role !== "leitor")
    fail("context actor/tenant/operation mismatch");
  const b = o.readback;
  if (o.kind === "positive") {
    if (b.visible !== true || b.selected !== o.target || b.foreignVisible !== false)
      fail("positive readback mismatch");
  } else {
    if (b.foreignVisible !== false || b.mutationCount !== 0) fail("negative leak/effect");
    if (
      o.decision === "DENY" &&
      (b.status !== 403 || b.code !== "42501" || b.denialRendered !== true)
    )
      fail("not an authorization denial");
    if (o.decision === "ISOLATED" && (b.isolationObserved !== true || b.oldCacheRendered !== false))
      fail("isolation not observed");
  }
}
export function validateMaterial(batch, observations, report, identity) {
  if (!Object.hasOwn(BATCHES, batch)) fail("unknown batch");
  const contract = batchesWithEvidence[batch];
  if (!contract) fail("batch oracle not implemented; no receipt");
  if (
    !sha(identity?.frontend) ||
    identity.backend !== BACKEND ||
    !sha(identity.harness) ||
    ![identity.run, identity.attempt, identity.job].every(num)
  )
    fail("invalid execution identity");
  const expected = BATCHES[batch].flatMap((id) =>
    ["positive", "negative"].map((kind) => "IFV1-F5-C" + id + ":" + kind),
  );
  const keys = new Set(expected);
  if (!Array.isArray(observations) || observations.length !== keys.size)
    fail("incomplete observations");
  const seen = new Set();
  for (const o of observations) {
    const key = o?.caseId + ":" + o?.kind;
    if (
      !keys.has(key) ||
      seen.has(key) ||
      o.mode !== "CODE_FIXTURE" ||
      !record(o.readback) ||
      Object.keys(o.readback).length === 0
    )
      fail("invalid/duplicate observation");
    if (
      o.frontend !== identity.frontend ||
      o.backend !== identity.backend ||
      o.harness !== identity.harness ||
      o.run !== identity.run ||
      o.attempt !== identity.attempt ||
      o.job !== identity.job
    )
      fail("observation execution identity mismatch");
    contract.check(o, o.caseId.slice(-4));
    seen.add(key);
  }
  if (
    report?.success !== true ||
    report.numTotalTests !== keys.size ||
    report.numPassedTests !== keys.size ||
    report.numFailedTests !== 0 ||
    report.numPendingTests !== 0 ||
    report.numTodoTests !== 0 ||
    !Array.isArray(report.testResults) ||
    report.testResults.length !== 1
  )
    fail("incomplete test report");
  const result = report.testResults[0];
  if (result.status !== "passed" || !result.name?.endsWith("/src/test/" + contract.file))
    fail("test file identity mismatch");
  const assertions = result.assertionResults ?? [];
  if (assertions.length !== keys.size) fail("assertion cardinality");
  const tested = new Set();
  for (const t of assertions) {
    const m = /^(IFV1-F5-C\d{4}) (positive|negative): .+$/.exec(t.title ?? "");
    const k = m ? m[1] + ":" + m[2] : "";
    if (
      t.status !== "passed" ||
      !keys.has(k) ||
      tested.has(k) ||
      t.ancestorTitles?.length !== 1 ||
      t.ancestorTitles[0] !== contract.suite ||
      t.title !==
        m[1] + " " + m[2] + ": " + contract.title(m[1].slice(-4), m[2] === "positive" ? 0 : 1)
    )
      fail("invalid/duplicate test");
    tested.add(k);
  }
  return {
    schema: "contaos.ifv1.f5.material-partial.v1",
    batch,
    covered: keys.size / 2,
    proofs: keys.size,
    phaseTotal: 138,
    scope: "CODE_FIXTURE",
    live: "NOT_RUN",
    certification: "NOT_CERTIFIED",
    ...identity,
  };
}
function main() {
  const [flag, batch] = process.argv.slice(2);
  if (flag !== "--batch") fail("usage: --batch <batch>");
  const dir = process.env.F5_OUTPUT_DIR || "artifacts/f5-code";
  const identity = {
    frontend: process.env.F5_FRONTEND_SHA,
    backend: BACKEND,
    harness: process.env.F5_HARNESS_SHA,
    run: process.env.GITHUB_RUN_ID,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
    job: process.env.JOB_ID,
  };
  const ob = fs.readFileSync(path.join(dir, "observations.json")),
    rep = fs.readFileSync(path.join(dir, "vitest.json"));
  const receipt = validateMaterial(batch, JSON.parse(ob), JSON.parse(rep), identity);
  receipt.observationsSha256 = createHash("sha256").update(ob).digest("hex");
  receipt.reportSha256 = createHash("sha256").update(rep).digest("hex");
  fs.writeFileSync(path.join(dir, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(JSON.stringify(receipt));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

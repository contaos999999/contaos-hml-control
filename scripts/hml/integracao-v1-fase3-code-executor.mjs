/**
 * F3 CODE: executor de coleta por caseId, sem poder de certificar.
 * Só aceita o catálogo canônico e exige dois recibos por caso aplicável.
 * Recibos apresentados pelo chamador não são provas autenticadas: permanecem
 * SUBMITTED_UNVERIFIED mesmo que um callback confirme sua coerência estrutural.
 * Não usa nem altera o ledger LIVE. Uma revisão independente deve validar as provas
 * antes de qualquer certificado. Ausência de runner => BLOCKED, jamais PASS.
 */
import { createHash } from "node:crypto";

export const F3_CODE_EXECUTION_SCHEMA = "contaos.ifv1.f3.code-execution.v1";
export const F3_CODE_CATALOGUE_SHA256 = "bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb";
const SHA40 = /^[a-f0-9]{40}$/;
const SHA64 = /^[a-f0-9]{64}$/;
const ID = /^IFV1-F3-C[0-9]{4}$/;
const hash = (value) => createHash("sha256").update(value).digest("hex");

function assert(condition, code) {
  if (!condition) throw Object.assign(new Error(code), { code });
}
function plain(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}
function exactKeys(value, keys, code) {
  assert(plain(value), code);
  assert(JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort()), code);
}
function assertCatalogue(catalogue, catalogueRaw) {
  assert(typeof catalogueRaw === "string" &&
    hash(catalogueRaw) === F3_CODE_CATALOGUE_SHA256, "F3_CODE_CATALOGUE_DRIFT");
  let parsed;
  try {
    parsed = JSON.parse(catalogueRaw);
  } catch {
    assert(false, "F3_CODE_CATALOGUE_DRIFT");
  }
  assert(JSON.stringify(parsed) === JSON.stringify(catalogue), "F3_CODE_CATALOGUE_DRIFT");
  assert(plain(catalogue) && catalogue.count === 138 &&
    Array.isArray(catalogue.cases) && catalogue.cases.length === 138, "F3_CODE_CATALOGUE");
  const unique = new Set();
  let mandatory = 0;
  for (const c of catalogue.cases) {
    assert(plain(c) && ID.test(c.caseId) && !unique.has(c.caseId), "F3_CODE_CASE_ID");
    unique.add(c.caseId);
    assert(typeof c.producer === "string" && typeof c.consumer === "string" &&
      c.producer.length > 0 && c.consumer.length > 0, "F3_CODE_CONTRACT");
    assert(["OBRIGATORIA", "CONDICIONAL"].includes(c.classification), "F3_CODE_CLASS");
    if (c.classification === "OBRIGATORIA") mandatory++;
  }
  assert(mandatory === 120 && catalogue.cases.length - mandatory === 18, "F3_CODE_COUNTS");
}
function assertProvenance(provenance) {
  exactKeys(provenance, ["frontendSha", "backendSha", "workflowRunId", "jobId"], "F3_CODE_PROVENANCE");
  assert(SHA40.test(provenance.frontendSha) && SHA40.test(provenance.backendSha) &&
    /^[1-9][0-9]*$/.test(String(provenance.workflowRunId)) &&
    /^[1-9][0-9]*$/.test(String(provenance.jobId)), "F3_CODE_PROVENANCE");
}
function validEvidence(test, kind, caseId) {
  if (!plain(test)) return false;
  const keys = ["caseId", "kind", "testId", "outcome", "sourcePath", "outputSha256"];
  if (JSON.stringify(Object.keys(test).sort()) !== JSON.stringify(keys.sort())) return false;
  return test.caseId === caseId && test.kind === kind && test.outcome === "PASS" &&
    typeof test.testId === "string" && /^[A-Za-z0-9_.:/#-]{3,240}$/.test(test.testId) &&
    typeof test.sourcePath === "string" &&
    /^src\/[A-Za-z0-9_./-]+\.(ts|tsx)$/.test(test.sourcePath) &&
    !test.sourcePath.split("/").includes("..") &&
    !test.sourcePath.split("/").includes(".") &&
    SHA64.test(test.outputSha256);
}
/**
 * O runner de produção deverá executar testes de contrato REAIS (produtor + consumidor),
 * nunca criar recibos a partir do inventário. A coleta não é certificação. O executor não confia no status
 * fornecido pelo runner: exige as provas individuais e classifica a ausência.
 *
 * @param {object} params
 * @param {object} params.catalogue Catálogo F3_CASES.json previamente validado contra o CSV.
 * @param {string} params.catalogueRaw Bytes UTF-8 canônicos, SHA-256 fixo e conferido.
 * @param {object} params.provenance HEAD real e IDs do workflow/job.
 * @param {function} params.executeCase Executa os testes e retorna provas observadas.
 * @param {function} params.verifyCase Verificador independente do contrato do caso.
 */
export async function collectF3CodeEvidence({ catalogue, catalogueRaw, provenance, executeCase, verifyCase }) {
  assertCatalogue(catalogue, catalogueRaw);
  assertProvenance(provenance);
  assert(typeof executeCase === "function" && typeof verifyCase === "function", "F3_CODE_RUNNERS");
  const entries = [];
  for (const c of catalogue.cases) {
    let status = "BLOCKED";
    let reason = "F3_CODE_NOT_EXECUTED";
    let tests = [];
    try {
      const result = await executeCase(Object.freeze(structuredClone(c)));
      if (result?.applicability === "NOT_APPLICABLE") {
        // N/A requer emenda aprovada separadamente; não é deferido por este executor.
        reason = "F3_CODE_NA_REQUIRES_APPROVED_AMENDMENT";
      } else if (result?.applicability !== "APPLICABLE") {
        reason = "F3_CODE_APPLICABILITY";
      } else if (!Array.isArray(result.tests) || result.tests.length !== 2 ||
        !validEvidence(result.tests[0], "positive", c.caseId) ||
        !validEvidence(result.tests[1], "negative", c.caseId) ||
        result.tests[0].testId === result.tests[1].testId) {
        reason = "F3_CODE_TEST_EVIDENCE";
      } else {
        const independent = await verifyCase(Object.freeze(structuredClone(c)),
          Object.freeze(structuredClone(result.tests)));
        if (independent !== true) {
          status = "FAIL";
          reason = "F3_CODE_CONTRACT_VERIFICATION";
        } else {
          tests = result.tests.map((t) => structuredClone(t));
          status = "SUBMITTED_UNVERIFIED";
          reason = null;
        }
      }
    } catch (error) {
      status = "FAIL";
      reason = typeof error?.code === "string" ? error.code : "F3_CODE_EXECUTION_ERROR";
    }
    entries.push({ caseId: c.caseId, classification: c.classification, status, reason, tests });
  }
  const counts = {
    submittedUnverified: entries.filter((e) => e.status === "SUBMITTED_UNVERIFIED").length,
    blocked: entries.filter((e) => e.status === "BLOCKED").length,
    failed: entries.filter((e) => e.status === "FAIL").length,
  };
  const report = {
    schema: F3_CODE_EXECUTION_SCHEMA,
    state: "UNREVIEWED_NOT_CERTIFIED",
    provenance: structuredClone(provenance),
    counts,
    entries,
  };
  return Object.freeze({ ...report, reportSha256: hash(JSON.stringify(report)) });
}

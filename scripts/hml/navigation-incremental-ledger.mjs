// Incremental NAV ledger primitives. This module does NOT authorize skipping cases
// until an authenticated runner verifies artifact bytes, ancestry and change impact.
import { createHash } from "node:crypto";
import { navigationCases } from "./authenticated-visual-audit.mjs";

export const NAV_LEDGER_SCHEMA = "contaos.navigation.incremental.v1";
const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const DEPLOY = /^dpl_[A-Za-z0-9]+$/;
const KEYS = ["index", "surface", "width", "theme", "status", "stage", "operation", "runId", "attempt", "frontendSha", "harnessSha", "deploymentId", "artifactSha256", "reportSha256", "timestamp", "compatibility"];
const LEDGER_KEYS = ["schema", "catalogueSha256", "entries"];
const isObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const exact = (x, keys) => isObject(x) && Object.keys(x).sort().join("|") === [...keys].sort().join("|");
const validSha = (s) => typeof s === "string" && SHA.test(s);
const validDigest = (s) => typeof s === "string" && DIGEST.test(s);
const canonical = (value) => JSON.stringify(value);
export const navigationCatalogueDigest = (cases) => {
  if (!Array.isArray(cases) || cases.length !== 52 || cases.some((c) => !isObject(c) || typeof c.surface !== "string" || ![390, 1440].includes(c.width) || !["light", "dark"].includes(c.theme))) throw Error("LEDGER_CATALOGUE");
  const keys = cases.map((c) => canonical([c.surface, c.width, c.theme]));
  if (new Set(keys).size !== 52) throw Error("LEDGER_CATALOGUE");
  return createHash("sha256").update(canonical(keys)).digest("hex");
};
export function validateNavigationLedger(ledger, cases, verifyEvidence) {
  if (!exact(ledger, LEDGER_KEYS) || ledger.schema !== NAV_LEDGER_SCHEMA || ledger.catalogueSha256 !== navigationCatalogueDigest(cases) || !Array.isArray(ledger.entries) || ledger.entries.length > 65536 || typeof verifyEvidence !== "function") throw Error("LEDGER_INVALID");
  const valid = new Map();
  const history = new Map();
  for (const entry of ledger.entries) {
    if (!exact(entry, KEYS) || !Number.isInteger(entry.index) || entry.index < 1 || entry.index > 52 || !Number.isSafeInteger(entry.runId) || entry.runId <= 0 || !Number.isSafeInteger(entry.attempt) || entry.attempt <= 0 || !validSha(entry.frontendSha) || !validSha(entry.harnessSha) || !DEPLOY.test(entry.deploymentId) || !validDigest(entry.artifactSha256) || !validDigest(entry.reportSha256) || !Number.isSafeInteger(entry.timestamp) || entry.timestamp <= 0 || !["valid", "superseded"].includes(entry.compatibility) || entry.status !== "PASS" || entry.stage !== "FINISH" || entry.operation !== "FINISH") throw Error("LEDGER_ENTRY");
    const item = cases[entry.index - 1];
    if (entry.surface !== item.surface || entry.width !== item.width || entry.theme !== item.theme) throw Error("LEDGER_CASE_MISMATCH");
    const previous = history.get(entry.index);
    if (previous && (entry.timestamp <= previous.timestamp || (previous.compatibility === "valid" && entry.compatibility === "valid"))) throw Error("LEDGER_DUPLICATE_OR_ORDER");
    history.set(entry.index, entry);
    if (entry.compatibility === "valid") {
      // Caller must check raw ZIP, report, session controls, ancestry and impact.
      if (verifyEvidence(entry) !== true) throw Error("LEDGER_EVIDENCE");
      valid.set(entry.index, entry);
    } else valid.delete(entry.index);
  }
  const resumeFrom = cases.findIndex((_, i) => !valid.has(i + 1)) + 1;
  return Object.freeze({ resumeFrom: resumeFrom || 53, cumulativeMatrixComplete: valid.size === 52, validCases: valid.size });
}
export function assertNavigationResumeAuthorized(state, expectedStart) {
  if (!isObject(state) || !Number.isInteger(expectedStart) || expectedStart < 1 || expectedStart > 53 || state.resumeFrom !== expectedStart || (expectedStart === 53 && !state.cumulativeMatrixComplete)) throw Error("LEDGER_RESUME_UNAUTHORIZED");
  return true;
}

// Inspect a retained R7 report WITHOUT promoting any historical PASS to a certificate.
// Artifact ZIP integrity and GitHub origin must be established independently.
export function inspectNavigationPartialReport(raw, identity) {
  if (!Buffer.isBuffer(raw) || raw.length < 100 || raw.length > 262144 || !exact(identity, ["frontendSha","harnessSha","deploymentId","reportSha256"]) || !validSha(identity.frontendSha) || !validSha(identity.harnessSha) || !DEPLOY.test(identity.deploymentId) || !validDigest(identity.reportSha256)) throw Error("REPORT_INPUT");
  const reportSha256 = createHash("sha256").update(raw).digest("hex");
  if (reportSha256 !== identity.reportSha256) throw Error("REPORT_HASH");
  const report = JSON.parse(raw.toString("utf8"));
  const expected = navigationCases();
  if (!isObject(report) || report.schema !== "contaos.navigation.audit.v3" || report.auditScope !== "INTEGRACAO_V1_FASE2_NAV" || report.frontendSha !== identity.frontendSha || report.harnessSha !== identity.harnessSha || report.deploymentId !== identity.deploymentId || !Array.isArray(report.records) || report.records.length > expected.length || !isObject(report.summary) || report.summary.expected !== 52 || report.summary.observed !== report.records.length || report.summary.matrixComplete !== false || report.summary.passed !== report.records.filter(x=>x?.status==="PASS").length || report.summary.failed !== report.records.filter(x=>x?.status!=="PASS").length) throw Error("REPORT_SCHEMA");
  const pass = [];
  let failedAt = null;
  for (let i=0; i<report.records.length; i++) {
    const row=report.records[i], expectedRow=expected[i];
    if (!isObject(row) || row.surface !== expectedRow.surface || row.width !== expectedRow.width || row.theme !== expectedRow.theme) throw Error("REPORT_CASE_ORDER");
    if (row.status==="PASS") {
      if (failedAt!==null || row.stage!=="FINISH" || row.operation!=="FINISH" || row.target!==row.surface || row.failureCode!==null || row.httpErrors!==0 || row.transportErrors!==0 || row.pageErrors!==0 || row.blockedRequests!==0 || row.routeExact!==true || row.stateVerified!==true || row.organizationVerified!==true || row.enteredFromMenu!==true || row.reloadVerified!==true || row.backVerified!==true || row.shellVerified!==true || row.menuVerified!==true || row.controlsVerified!==true) throw Error("REPORT_PASS_INVALID");
      pass.push(i+1);
    } else {
      if (failedAt!==null || row.status!=="FAIL") throw Error("REPORT_FAIL_INVALID");
      failedAt=i+1;
    }
  }
  if (failedAt!==null && failedAt!==report.records.length) throw Error("REPORT_FAIL_ORDER");
  return Object.freeze({reportSha256, candidateIndices:Object.freeze(pass), failedAt, globalControlsPassed:report.sessionVerified===true && report.masterVerified===true && report.organizationVerified===true && report.logoutVerified===true && report.networkFailure===null && report.httpErrors===0 && report.transportErrors===0 && report.pageErrors===0 && report.blockedMutations===0});
}

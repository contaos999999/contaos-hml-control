// Incremental NAV ledger primitives. This module does NOT authorize skipping cases
// until an authenticated runner verifies artifact bytes, ancestry and change impact.
import { createHash } from "node:crypto";

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

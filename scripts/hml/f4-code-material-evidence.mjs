/**
 * Partial F4 CODE receipt. Verifies exact canonical batch identity, never
 * promotes a phase certificate or attests HML/PROD.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ADM01 = [
  "0002", "0007", "0009", "0011", "0012", "0014", "0016", "0017", "0018", "0019",
  "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "0029",
  "0030", "0031", "0032", "0033", "0034",
].map((id) => "IFV1-F4-C" + id);
const CONTEXT = ["0005", "0036", "0037", "0043"].map((id) => "IFV1-F4-C" + id);
const BATCHES = Object.freeze({ adm01: Object.freeze(ADM01), context: Object.freeze(CONTEXT),
  "sys04-competence": Object.freeze(["0058","0059","0060","0061","0063"].map(id=>"IFV1-F4-C"+id)),
  "sys04-data": Object.freeze(["0050","0051","0052","0053","0054","0055","0056","0062","0064","0065"].map(id=>"IFV1-F4-C"+id)),
  "sys04-actions": Object.freeze(["0041","0045","0046","0047","0048","0049","0057","0066","0067","0068"].map(id=>"IFV1-F4-C"+id)),
  "contracting-party": Object.freeze(["0093","0096","0098","0100","0107","0111","0113","0115","0116"].map(id=>"IFV1-F4-C"+id)),
  "contracts": Object.freeze(["0132","0136","0139","0140","0146","0153","0156","0159","0162","0165","0167","0170","0172","0174","0176"].map(id=>"IFV1-F4-C"+id)),
  "material-source": Object.freeze(["0232","0233","0234","0237","0192","0200","0202","0203","0204","0205","0208","0260","0262","0263","0264","0265","0268"].map(id=>"IFV1-F4-C"+id)), 
  "competence": Object.freeze(["0352","0365","0368","0369","0370","0371","0372","0373","0376"].map(id=>"IFV1-F4-C"+id)),
  "analysis": Object.freeze(["0433","0437","0439","0441","0443","0455","0458","0461","0463","0465"].map(id=>"IFV1-F4-C"+id)),
});

export function validateMaterial(batch, observations, report) {
  const expected = BATCHES[batch];
  if (!expected) throw Error("unknown batch");
  const count = expected.length * 2;
  const keys = new Set(expected.flatMap((id) => ["positive", "negative"].map((kind) => id + ":" + kind)));
  if (!Array.isArray(observations) || observations.length !== count) throw Error("incomplete observations");
  const observed = new Set();
  for (const o of observations) {
    const k = o?.caseId + ":" + o?.kind;
    if (!keys.has(k) || observed.has(k) || o?.mode !== "CODE_FIXTURE" ||
        !o.readback || typeof o.readback !== "object" || Array.isArray(o.readback) ||
        Object.keys(o.readback).length === 0) throw Error("noncanonical, duplicate or invalid observation: " + k);
    observed.add(k);
  }
  if (observed.size !== keys.size) throw Error("missing canonical observation");
  if (report?.numPassedTests !== count || report.numTotalTests !== count ||
      report.numFailedTests !== 0 || report.numPendingTests !== 0 || report.success !== true ||
      !Array.isArray(report.testResults)) throw Error("test execution incomplete");
  const assertions = report.testResults.flatMap((r) => Array.isArray(r?.assertionResults) ? r.assertionResults : []);
  if (assertions.length !== count) throw Error("assertion count mismatch");
  const tested = new Set();
  for (const t of assertions) {
    const match = /^(IFV1-F4-C\d{4}) (positive|negative): .+/.exec(t?.title ?? "");
    const k = match ? match[1] + ":" + match[2] : "";
    if (t?.status !== "passed" || !keys.has(k) || tested.has(k)) throw Error("noncanonical, duplicate or nonexecuted test: " + k);
    tested.add(k);
  }
  if (tested.size !== keys.size) throw Error("missing named test");
  return { covered: expected.length, proofs: count, caseIds: [...expected] };
}

function main() {
  const [flag, batch] = process.argv.slice(2);
  if (flag !== "--batch" || !BATCHES[batch]) throw Error("usage: --batch <canonical-batch>");
  const d = process.env.F4_CODE_OUTPUT_DIR || "artifacts/f4-code";
  const sha = process.env.GITHUB_SHA ?? "";
  const run = process.env.GITHUB_RUN_ID ?? "";
  const attempt = process.env.GITHUB_RUN_ATTEMPT ?? "";
  const job = process.env.JOB_ID ?? "";
  if (!/^[a-f0-9]{40}$/.test(sha) || [run, attempt, job].some((x) => !/^[1-9]\d*$/.test(x))) throw Error("missing execution identity");
  const result = validateMaterial(batch, JSON.parse(fs.readFileSync(path.join(d, "observations.json"), "utf8")), JSON.parse(fs.readFileSync(path.join(d, "vitest.json"), "utf8")));
  const receipt = { schema: "contaos.ifv1.f4.material-partial.v1", scope: batch.toUpperCase() + "_CODE_FIXTURE", sha, run, attempt, job, ...result, phaseTotal: 138, certification: "NOT_CERTIFIED" };
  fs.writeFileSync(path.join(d, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify(receipt));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

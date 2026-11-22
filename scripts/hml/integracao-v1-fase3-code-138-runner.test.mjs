import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { buildF3Code138Preflight, SCHEMA } from "./integracao-v1-fase3-code-138-runner.mjs";

const fake = {count:138,cases:Array.from({length:138},(_,i)=>({
  caseId:"IFV1-F3-C"+String(i+1).padStart(4,"0"),producerOrder:i%20+1,
  producer:"producer"+(i%20+1),consumer:"consumer"+i,
  classification:i<120?"OBRIGATORIA":"CONDICIONAL",
}))};
const fakeMap={cases:fake.cases.map(x=>({...x,sourceHints:["src/canonical.ts:1","src/canonical.ts:2"]}))};
const provenance={frontendSha:"a".repeat(40),workflowRunId:"123",jobName:"f3-preflight"};
const sources={"src/canonical.ts":"const x=1;\nconst y=2;"};

test("F3 138: source-only preflight must never certify functional execution",()=>{
  const a=buildF3Code138Preflight(fake,fakeMap,sources,provenance);
  assert.equal(a.schema,SCHEMA);
  assert.equal(a.state,"NOT_CERTIFIED");
  assert.deepEqual([a.summary.total,a.summary.required,a.summary.conditional],[138,120,18]);
  assert.equal(a.summary.blocked,138);
  assert.equal(a.summary.executedFunctional,0);
  assert.equal(a.summary.certified,0);
  assert.ok(a.entries.every(x=>x.state==="BLOCKED"&&x.positiveTest==="NOT_RUN"&&x.negativeTest==="NOT_RUN"));
  assert.match(a.reportSha256,/^[a-f0-9]{64}$/);
});
test("F3 138: absent source must not become execution proof",()=>{
  const a=buildF3Code138Preflight(fake,fakeMap,{},provenance);
  assert.equal(a.summary.brokenSourceHints,138);
  assert.ok(a.entries.every(x=>x.reason==="F3_SOURCE_HINT_MISSING"));
});
test("F3 138: mismatched caseId is a hard failure",()=>{
  const bad=structuredClone(fakeMap);
  bad.cases[0].caseId=bad.cases[1].caseId;
  assert.throws(()=>buildF3Code138Preflight(fake,bad,sources,provenance),{code:"F3_138_MATRIX_MISMATCH"});
});
test("F3 138: no fabricated provenance",()=>{
  assert.throws(()=>buildF3Code138Preflight(fake,fakeMap,sources,{...provenance,frontendSha:"fake"}),{code:"F3_138_SHA"});
  assert.throws(()=>buildF3Code138Preflight(fake,fakeMap,sources,{...provenance,workflowRunId:"0"}),{code:"F3_138_CI_PROVENANCE"});
  assert.equal(buildF3Code138Preflight(fake,fakeMap,sources,provenance).provenance.jobId,null);
});
test("F3 138: changed classification cannot pass",()=>{
  const c=structuredClone(fake),m=structuredClone(fakeMap);
  c.cases[0].classification="CONDICIONAL";
  m.cases[0].classification="CONDICIONAL";
  assert.throws(()=>buildF3Code138Preflight(c,m,sources,provenance),{code:"F3_138_CLASSIFICATION"});
});

// 138 independent static mapping tests on the *real* catalogue. These are NOT
// functional producer/consumer tests; they only prove exact source locations exist.
const root=fileURLToPath(new URL("../../",import.meta.url));
const [raw,coverageRaw]=await Promise.all([
  readFile(join(root,"docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CASES.json"),"utf8"),
  readFile(join(root,"docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_COVERAGE_MATRIX.json"),"utf8"),
]);
const cat=JSON.parse(raw),coverage=JSON.parse(coverageRaw);
assert.equal(cat.cases.length,138);
for (const [i,c] of cat.cases.entries()) {
  test("F3 STATIC source-map only (NOT functional): "+c.caseId,async()=>{
    const m=coverage.cases[i];
    assert.equal(m.caseId,c.caseId);
    assert.equal(m.producer,c.producer);
    assert.equal(m.consumer,c.consumer);
    assert.equal(m.classification,c.classification);
    assert.equal(m.sourceHints.length,2);
    for (const hint of m.sourceHints) {
      const match=/^(src\/[A-Za-z0-9_./-]+\.(?:ts|tsx)):(\d+)$/.exec(hint);
      assert.ok(match,"invalid hint "+hint);
      assert.ok(!match[1].split("/").includes(".."));
      const code=await readFile(join(root,match[1]),"utf8");
      assert.ok(Number(match[2])>0&&Number(match[2])<=code.split("\n").length,
        "source line absent "+hint);
    }
  });
}

import test from "node:test";
import assert from "node:assert/strict";
import { navigationCases, PRIVATE_SURFACES } from "./authenticated-visual-audit.mjs";
import { navigationCatalogueDigest, validateNavigationLedger, NAV_LEDGER_SCHEMA } from "./navigation-incremental-ledger.mjs";
const sha="a".repeat(40), digest="b".repeat(64);
const cases=navigationCases();
function entry(index){const {surface,width,theme}=cases[index-1];return {index,surface,width,theme,status:"PASS",stage:"FINISH",operation:"FINISH",runId:43358055422,attempt:1,frontendSha:sha,harnessSha:sha,deploymentId:"dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh",artifactSha256:digest,reportSha256:digest,timestamp:index,compatibility:"valid"};}
const ledger=(entries)=>({schema:NAV_LEDGER_SCHEMA,catalogueSha256:navigationCatalogueDigest(cases),entries});
test("real canonical catalogue includes system cases before V101",()=>{assert.equal(cases.length,52);assert.deepEqual(cases.slice(0,6).map(x=>x.surface),["SYS04","SYS04","SYS05","SYS05","ADM01","ADM01"]);assert.equal(cases[24].surface,"V110");assert.equal(cases[24].width,1440);assert.equal(cases[25].surface,"V110");assert.equal(cases[25].width,390);assert.equal(PRIVATE_SURFACES.length,26)});
test("R7 25 PASS candidate rows resume at actual V110/390 index 26, never 22",()=>{const s=validateNavigationLedger(ledger(Array.from({length:25},(_,i)=>entry(i+1))),cases,()=>true);assert.equal(s.resumeFrom,26);assert.equal(s.validCases,25);assert.equal(s.cumulativeMatrixComplete,false)});
test("actual catalogue digest detects reordering and a changed width",()=>{const manifest=ledger([]);assert.throws(()=>validateNavigationLedger(manifest,[...cases].reverse(),()=>true),/LEDGER_INVALID/);assert.throws(()=>validateNavigationLedger(manifest,cases.map((c,i)=>i===25?{...c,width:1440}:c),()=>true),/LEDGER_CATALOGUE/)});

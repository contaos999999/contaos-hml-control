import test from "node:test";
import assert from "node:assert/strict";
import { navigationCatalogueDigest, validateNavigationLedger, assertNavigationResumeAuthorized, NAV_LEDGER_SCHEMA } from "./navigation-incremental-ledger.mjs";
const sha = "a".repeat(40), digest = "b".repeat(64);
const cases = Array.from({length: 26}, (_,i) => [
  {surface: "V"+String(i+101), width:1440,theme:"light"},
  {surface: "V"+String(i+101), width:390,theme:"dark"},
]).flat();
const entry = (i, compatibility="valid", timestamp=i) => ({index:i,...cases[i-1],status:"PASS",stage:"FINISH",operation:"FINISH",runId:43358055422,attempt:1,frontendSha:sha,harnessSha:sha,deploymentId:"dpl_ABC123",artifactSha256:digest,reportSha256:digest,timestamp,compatibility});
const ledger = (entries) => ({schema:NAV_LEDGER_SCHEMA,catalogueSha256:navigationCatalogueDigest(cases),entries});
const check = (entries, evidence=()=>true) => validateNavigationLedger(ledger(entries),cases,evidence);
test("empty ledger starts at case 1, never claims cumulative completion",()=>{const s=check([]);assert.equal(s.resumeFrom,1);assert.equal(s.cumulativeMatrixComplete,false)});
test("25 valid historical PASS resume at 26",()=>{const s=check(Array.from({length:25},(_,i)=>entry(i+1)));assert.equal(s.resumeFrom,26);assert.equal(s.validCases,25);assertNavigationResumeAuthorized(s,26);assert.throws(()=>assertNavigationResumeAuthorized(s,22))});
test("29 PASS resume at failed case 30, without fabricating a PASS for 30",()=>{const s=check(Array.from({length:29},(_,i)=>entry(i+1)));assert.equal(s.resumeFrom,30);assert.equal(s.cumulativeMatrixComplete,false)});
test("52 verifiable PASS can consolidate",()=>{const s=check(Array.from({length:52},(_,i)=>entry(i+1)));assert.equal(s.resumeFrom,53);assert.equal(s.cumulativeMatrixComplete,true)});
test("holes, duplicate active entries and mismatched case identity are fail-closed",()=>{assert.equal(check([entry(1),entry(3)]).resumeFrom,2);assert.throws(()=>check([entry(1),entry(1,"valid",100)]),/LEDGER_DUPLICATE/);assert.throws(()=>check([{...entry(1),width:390}]),/LEDGER_CASE_MISMATCH/)});
test("artifact evidence and SHA must be checked, not inferred from a log",()=>{assert.throws(()=>check([entry(1)],()=>false),/LEDGER_EVIDENCE/);assert.throws(()=>check([{...entry(1),artifactSha256:"bad"}]),/LEDGER_ENTRY/)});
test("superseded PASS must be rerun from smallest invalidated index",()=>{const entries=Array.from({length:29},(_,i)=>entry(i+1));entries.push(entry(7,"superseded",100));assert.equal(check(entries).resumeFrom,7)});
test("schema and catalogue tampering fail closed",()=>{assert.throws(()=>validateNavigationLedger({...ledger([]),extra:1},cases,()=>true),/LEDGER_INVALID/);assert.throws(()=>validateNavigationLedger({...ledger([]),catalogueSha256:digest},cases,()=>true),/LEDGER_INVALID/)});
test("a partial run cannot be treated as a 52/52 certificate",()=>{const s=check(Array.from({length:25},(_,i)=>entry(i+1)));assert.throws(()=>assertNavigationResumeAuthorized(s,53),/LEDGER_RESUME_UNAUTHORIZED/)});

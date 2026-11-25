/**
 * Reserved F4 CODE attestation core. No GitHub mutation, no certificate.
 * The final source metadata must be pinned and verified against the live API
 * only after all protected material BUILDs have merged.
 */
import {createHash} from "node:crypto";
import {validateMaterial} from "./f4-code-material-evidence.mjs";
const requireProof=(v,reason)=>{if(!v)throw Error("F4_ATTEST_"+reason);};
export const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
const sha40=v=>typeof v==="string"&&/^[0-9a-f]{40}$/.test(v);
const sha64=v=>typeof v==="string"&&/^[0-9a-f]{64}$/.test(v);
const numeric=v=>typeof v==="string"&&/^[1-9][0-9]*$/.test(v);
const files=["observations.json","receipt.json","vitest.json","SHA256SUMS"];
function sameSet(a,b){return a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));}
export function canonicalCatalogue(csv,proposals){
  const lines=csv.trim().split(/\r?\n/),header=lines.shift().split(",");
  const needed=["caso_fase4","id_conexao","tela_origem","tela_destino","classe_original","produtor_original","consumidor_original","evidencia_codigo_original"];
  requireProof(needed.every(x=>header.includes(x)),"MATRIX_HEADER");
  const rows=lines.map(line=>{
    const matches=[...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)];
    requireProof(matches.length===header.length&&matches.map(x=>x[0]).join("")===line,"MATRIX_ROW");
    return Object.fromEntries(matches.map((x,i)=>[header[i],x[1].replace(/""/g,'"')]));
  });
  requireProof(rows.length===138&&sameSet(rows.map(x=>x.caso_fase4),proposals.map(x=>x.caseId)),"MATRIX_IDS");
  requireProof(rows.filter(x=>x.classe_original==="OBRIGATORIA").length===120&&rows.filter(x=>x.classe_original==="CONDICIONAL").length===18,"MATRIX_CLASS");
  const lookup=new Map(proposals.map(x=>[x.caseId,x]));
  return rows.map(r=>{
    const c=lookup.get(r.caso_fase4);
    requireProof(/^IFV1-F4-C\d{4}$/.test(r.caso_fase4)&&c.sourceConnectionId===r.id_conexao&&c.origin===r.tela_origem&&c.destination===r.tela_destino&&c.classification===r.classe_original&&c.producer===r.produtor_original&&c.consumer===r.consumidor_original&&c.sourceReferences===r.evidencia_codigo_original,"MATRIX_BINDING");
    requireProof(typeof c.operationProposal==="string"&&c.operationProposal.length>0&&typeof c.positiveOracleProposal==="string"&&c.positiveOracleProposal.length>0&&typeof c.negativeOracleProposal==="string"&&c.negativeOracleProposal.length>0,"ORACLE");
    return c;
  });
}
export function verifyArchiveContents(source,batch,zip,contents){
  requireProof(sha64(batch.digest)&&sha(zip)===batch.digest,"ARCHIVE_DIGEST");
  requireProof(sameSet(Object.keys(contents),files),"ARCHIVE_FILES");
  const sums=contents.SHA256SUMS.toString("utf8").trim().split(/\r?\n/);
  const expected=files.filter(x=>x!=="SHA256SUMS");
  requireProof(sums.length===expected.length,"SUMS_COUNT");
  const matches=sums.map(line=>/^([0-9a-f]{64})  (observations\.json|receipt\.json|vitest\.json)$/.exec(line));
  requireProof(matches.every(Boolean)&&sameSet(matches.map(m=>m[2]),expected)&&matches.every(m=>sha(contents[m[2]])===m[1]),"SUMS_BYTES");
  const observations=JSON.parse(contents["observations.json"]),report=JSON.parse(contents["vitest.json"]),receipt=JSON.parse(contents["receipt.json"]);
  requireProof(sha40(source.testedSha)&&numeric(String(source.run))&&numeric(String(source.attempt))&&numeric(String(batch.job)),"EXECUTION_ID");
  const result=validateMaterial(batch.name,observations,report);
  requireProof(receipt.schema==="contaos.ifv1.f4.material-partial.v1"&&receipt.scope===batch.name.toUpperCase()+"_CODE_FIXTURE"&&receipt.sha===source.testedSha&&receipt.run===String(source.run)&&receipt.attempt===String(source.attempt)&&receipt.job===String(batch.job)&&receipt.phaseTotal===138&&receipt.certification==="NOT_CERTIFIED"&&receipt.covered===result.covered&&receipt.proofs===result.proofs&&JSON.stringify(receipt.caseIds)===JSON.stringify(result.caseIds),"RECEIPT_BINDING");
  requireProof(report.testResults.length===1&&typeof batch.path==="string"&&/^src\/test\/f4-code-[a-z0-9-]+\.test\.tsx?$/.test(batch.path),"SOURCE_FILE_COUNT");
  const suite=report.testResults[0];
  requireProof(typeof suite.name==="string"&&(suite.name===batch.path||suite.name.endsWith("/"+batch.path)),"SOURCE_FILE");
  const tests=new Map(suite.assertionResults.map(t=>{const m=/^(IFV1-F4-C\d{4}) (positive|negative): .+/.exec(t.title);return [m[1]+":"+m[2],t];}));
  return observations.map(o=>{
    const t=tests.get(o.caseId+":"+o.kind);
    requireProof(t&&t.status==="passed","PROOF_BINDING");
    return {caseId:o.caseId,kind:o.kind,mode:o.mode,outcome:"PASS",testPath:batch.path,testTitle:t.title,observation:o.readback,observationSha256:sha(Buffer.from(JSON.stringify(o))),reportSha256:sha(contents["vitest.json"]),receiptSha256:sha(contents["receipt.json"]),run:String(source.run),attempt:String(source.attempt),job:String(batch.job),artifact:String(batch.artifact),artifactDigest:batch.digest,testedSha:source.testedSha};
  });
}
export function buildCandidate(catalogue,source,proofs){
  requireProof(catalogue.length===138&&proofs.length===276&&sha40(source.head)&&sha40(source.merge)&&sha40(source.testedSha)&&sha40(source.backendSha)&&sha40(source.testedTree)&&source.testedTree===source.mergedTree,"SOURCE_TREE");
  const keys=proofs.map(p=>p.caseId+":"+p.kind);
  requireProof(sameSet(keys,catalogue.flatMap(c=>["positive","negative"].map(k=>c.caseId+":"+k))),"COVERAGE");
  const lookup=new Map(proofs.map(p=>[p.caseId+":"+p.kind,p]));
  const entries=catalogue.map(c=>({caseId:c.caseId,sourceConnectionId:c.sourceConnectionId,origin:c.origin,destination:c.destination,classification:c.classification,producer:c.producer,consumer:c.consumer,sourceReferences:c.sourceReferences,operationProposal:c.operationProposal,oraclesProposed:{positive:c.positiveOracleProposal,negative:c.negativeOracleProposal},status:"SUBMITTED_UNVERIFIED",tests:["positive","negative"].map(k=>{
    const p=lookup.get(c.caseId+":"+k);
    requireProof(p.outcome==="PASS"&&p.mode==="CODE_FIXTURE"&&p.testedSha===source.testedSha&&sha64(p.observationSha256),"PROOF_SCOPE");
    return p;
  })}));
  return {schema:"contaos.ifv1.f4.code-attestation-candidate.v1",state:"CANDIDATE_NOT_CERTIFIED",scope:"CODE_FIXTURE",source,counts:{cases:138,mandatory:120,conditional:18,tests:276,failed:0,blocked:0},entries,live:"NOT_RUN",production:"NO-GO",certification:"NOT_CERTIFIED",limitations:["Synthetic transport/persistence only; no live RLS, transaction, queue, authentication or Storage proof.","Catalogue operation and oracles are proposals. Executed test titles and observations are evidence, not a substitute for semantic review."]};
}

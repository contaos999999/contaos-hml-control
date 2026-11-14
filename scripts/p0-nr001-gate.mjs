import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const LEDGER = "docs/frontend/governanca/P0_NR_001_LEDGER.json";
const REPO = "contaos999999/contaos-hml-control";
const ORIGIN = "https://github.com/" + REPO;
const REQUIRED = Array.from({length:8},(_,i)=>"NR-"+String(i+1).padStart(3,"0"));
const STATES = new Set(["DIAGNOSTICO","PENDENTE_PR","MITIGADO_EM_BRANCH",
  "EM_MONITORAMENTO","REINCIDENCIA","RESOLVIDO_COM_PROVA"]);
const nonblank = (v) => typeof v === "string" && v.trim().length > 0;
const sha40 = (v) => typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
const safePath = (v) => typeof v === "string" &&
  /^(?:docs\/frontend\/governanca\/|scripts\/)[A-Za-z0-9/_.-]+\.(?:md|mjs|json)$/.test(v) &&
  !v.split("/").includes("..");
const pullUrl = (v) => nonblank(v) &&
  /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/pull\/[1-9]\d+$/.test(v);
const runUrl = (v) => nonblank(v) &&
  /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/actions\/runs\/[1-9]\d+$/.test(v);
const reviewUrl = (v) => nonblank(v) &&
  /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/pull\/[1-9]\d+#pullrequestreview-[1-9]\d+$/.test(v);

/**
 * O LEDGER PASS significa integridade das anotações; NAO significa que todos
 * os incidentes foram resolvidos nem que o ambiente HML foi certificado.
 */
export function validateLedger(doc, {
  exists = existsSync,
  read = (path) => readFileSync(path,"utf8"),
  baselineCases = null,
} = {}) {
  const errors = [];
  const fail = (s) => errors.push("P0-NR-001: "+s);
  if (doc?.schema !== "contaos.p0.nr001.ledger.v1" ||
      doc?.policy !== "P0-NR-001" || doc?.version !== 1 ||
      !Array.isArray(doc?.cases)) {
    fail("schema/politica/versao/cases ausentes ou alterados.");
    return {errors,pendentes:0,resolvidos:0};
  }
  const cases=doc.cases;
  if (Array.isArray(baselineCases)) {
    for(const old of baselineCases) {
      const current=cases.find(x=>x?.id===old?.id);
      if(!current || current.fingerprint!==old.fingerprint)
        fail("incidente historico nao pode ser removido/renomeado: "+old?.id);
    }
  }
  const ids=new Set(),fps=new Set();
  for (const key of REQUIRED) {
    if (cases.filter(x=>x?.id===key).length!==1)
      fail("classe historica removida/duplicada: "+key);
  }
  for (const entry of cases) {
    const id=entry?.id;
    if (!/^NR-[0-9]{3}$/.test(id||"") || ids.has(id))
      fail("ID de incidente invalido ou duplicado: "+String(id));
    ids.add(id);
    if (!/^[A-Z][A-Z0-9_]{5,}$/.test(entry?.fingerprint||"") ||
        fps.has(entry.fingerprint))
      fail(id+" fingerprint causal ausente/duplicado; recorrencia nao recebe novo ID.");
    fps.add(entry?.fingerprint);
    if (!nonblank(entry?.classe) || !nonblank(entry?.sintoma) ||
        !nonblank(entry?.causa) || !nonblank(entry?.barreira) ||
        !nonblank(entry?.risco_residual))
      fail(id+" sem causa, sintoma, risco residual ou barreira preventiva.");
    if (!["CONFIRMADA","EM_INVESTIGACAO"].includes(entry?.causa_status) ||
        !STATES.has(entry?.estado))
      fail(id+" estado de causa/incidente invalido.");
    if (entry?.causa_status==="EM_INVESTIGACAO" &&
        entry?.estado!=="DIAGNOSTICO")
      fail(id+" causa apenas hipotetica nao pode ser aprovada.");
    if (!Array.isArray(entry?.origem) || !entry.origem.length ||
        entry.origem.some(x=>!nonblank(x) || !x.startsWith(ORIGIN+"/")))
      fail(id+" sem origem real rastreavel neste repositorio.");
    const p=entry?.prevencao||{};
    if (!["TESTE","PROCEDIMENTO"].includes(p.tipo) || !safePath(p.arquivo))
      fail(id+" mecanismo de prevencao inexistente/invalido.");
    if (p.tipo==="TESTE" && !nonblank(p.teste))
      fail(id+" sem nome de teste de prevencao.");
    if (p.tipo==="PROCEDIMENTO" && !nonblank(p.procedimento))
      fail(id+" sem procedimento verificavel.");
    // Referencias ainda sob PR nao sao provas integradas.
    const pending=entry?.estado==="PENDENTE_PR";
    if (pending) {
      if (!entry.origem.some(x=>/^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/pull\/\d+(?:#.*)?$/.test(x)))
        fail(id+" pendente sem PR vinculada.");
    } else if (safePath(p.arquivo) && !exists(p.arquivo)) {
      fail(id+" arquivo da prevencao inexistente no checkout atual: "+p.arquivo);
    } else if (p.tipo==="TESTE" && nonblank(p.teste) && !pending) {
      let source="";
      try {source=read(p.arquivo)} catch {fail(id+" teste preventivo nao legivel.");}
      if (!source.includes(p.teste))
        fail(id+" caso de teste preventivo nao encontrado no arquivo.");
    }
    if (!Number.isInteger(entry?.tentativas_ciclo) ||
        entry.tentativas_ciclo<0)
      fail(id+" numero de tentativas nao verificavel.");
    if (entry?.tentativas_ciclo>=2 &&
        (entry.revisao_causal_ampliada!==true ||
         !nonblank(entry.diagnostico_ampliado)))
      fail(id+" duas tentativas sem revisao causal ampliada; anti-loop NO-GO.");
    if (entry?.estado==="REINCIDENCIA" &&
        (entry.revisao_causal_ampliada!==true ||
         !nonblank(entry.diagnostico_ampliado) ||
         !Array.isArray(entry.novos_testes) || !entry.novos_testes.length))
      fail(id+" reincidencia deve revisar prevencao e adicionar negativos.");
    if(entry?.estado==="REINCIDENCIA" && Array.isArray(entry.novos_testes)) {
      for(const proof of entry.novos_testes) {
        if(!safePath(proof?.arquivo)||!nonblank(proof?.caso)||
           !exists(proof.arquivo)) {fail(id+" novo teste de reincidencia nao verificavel.");continue;}
        try {if(!read(proof.arquivo).includes(proof.caso))
          fail(id+" novo caso negativo nao existe no arquivo de teste.");}
        catch {fail(id+" arquivo de novo teste inacessivel.");}
      }
    }
    if (entry?.estado==="RESOLVIDO_COM_PROVA") {
      const r=entry.recibo||{};
      if (!pullUrl(r.pr_url)||!sha40(r.head_sha)||!sha40(r.merge_sha)||
          !runUrl(r.ci_run_url)||!runUrl(r.nr_run_url)||
          !reviewUrl(r.review_url)||
          !nonblank(r.readback_url)||
          r.readback_url!==ORIGIN+"/blob/main/"+entry.prevencao.arquivo||
          !r.review_url.startsWith(r.pr_url+"#pullrequestreview-"))
        fail(id+" RESOLVIDO sem PR, HEAD, merge, CI, review independente e readback.");
    } else if (entry?.recibo!==null) {
      fail(id+" recibo de resolvido apresentado sem status RESOLVIDO_COM_PROVA.");
    }
  }
  return {
    errors, pendentes:cases.filter(x=>x.estado!=="RESOLVIDO_COM_PROVA").length,
    resolvidos:cases.filter(x=>x.estado==="RESOLVIDO_COM_PROVA").length,
  };
}

const parseUrl=(u,pattern)=>Number((pattern.exec(u||"")||[])[1]||0);

/** Confirma pela API que qualquer alegacao RESOLVIDO_COM_PROVA é real. */
export async function verifyResolvedLive(doc,apiGet) {
  const errs=[];
  const resolved=(doc?.cases||[]).filter(x=>x.estado==="RESOLVIDO_COM_PROVA");
  if(!resolved.length)return errs;
  if(typeof apiGet!=="function")return ["P0-NR-001 LIVE: sem acesso GitHub, FAIL fechado."];
  const get=(path)=>apiGet("/repos/"+REPO+path);
  for (const entry of resolved) {
    const r=entry.recibo;
    try {
      const prNo=parseUrl(r.pr_url,/\/pull\/(\d+)$/);
      const runNo=parseUrl(r.ci_run_url,/\/runs\/(\d+)$/);
      const reviewNo=parseUrl(r.review_url,/#pullrequestreview-(\d+)$/);
      const nrRunNo=parseUrl(r.nr_run_url,/\/runs\/(\d+)$/);
      const [pr,run,nrRun,nrJobs,reviews,ancestry,file]=await Promise.all([
        get("/pulls/"+prNo),
        get("/actions/runs/"+runNo),
        get("/actions/runs/"+nrRunNo),
        get("/actions/runs/"+nrRunNo+"/jobs?per_page=100"),
        get("/pulls/"+prNo+"/reviews?per_page=100"),
        get("/compare/"+r.merge_sha+"...main"),
        get("/contents/"+entry.prevencao.arquivo+"?ref="+r.head_sha),
      ]);
      const rev=Array.isArray(reviews)?reviews.find(x=>x.id===reviewNo):null;
      const later=Array.isArray(reviews) ? reviews.filter(x=>
        x.user?.login===rev?.user?.login && x.submitted_at && rev?.submitted_at &&
        x.submitted_at>rev.submitted_at) : [];
      const independent=Array.isArray(reviews) && reviews.length<100 &&
        rev?.state==="APPROVED" && rev.user?.login && rev.submitted_at &&
        rev.user.login!==pr?.user?.login && rev.commit_id===pr?.head?.sha &&
        !later.some(x=>["CHANGES_REQUESTED","DISMISSED"].includes(x.state));
      const authenticatedFile=file?.encoding==="base64" && file.content &&
        Buffer.from(file.content,"base64").toString("utf8").includes(
          entry.prevencao.tipo==="TESTE" ? entry.prevencao.teste : "P0-NR-001");
      const nrJob=Array.isArray(nrJobs?.jobs) && nrJobs.total_count<=100
        ? nrJobs.jobs.find(j=>j.name==="ContaOS P0-NR-001 Integridade e Provas" &&
            j.conclusion==="success") : null;
      const step=(name)=>Array.isArray(nrJob?.steps) &&
        nrJob.steps.some(s=>s.name===name && s.conclusion==="success");
      const nrExecuted=nrJob &&
        step("Testes negativos de classes conhecidas e falso resolvido") &&
        step("P0-NR-001 ledger com comprovantes reais");
      if (pr?.merged_at==null || pr?.base?.ref!=="main" ||
          pr?.head?.sha!==r.head_sha || pr?.merge_commit_sha!==r.merge_sha ||
          !independent || run?.conclusion!=="success" ||
          run?.name!=="ContaOS Frontend Zero-Drift" ||
          nrRun?.conclusion!=="success" ||
          nrRun?.name!=="ContaOS P0-NR-001 Anti-Reincidencia" ||
          ![r.head_sha,r.merge_sha].includes(run.head_sha) ||
          ![r.head_sha,r.merge_sha].includes(nrRun.head_sha) ||
          !["ahead","identical"].includes(ancestry?.status) ||
          !authenticatedFile || !nrExecuted)
        errs.push("P0-NR-001 LIVE "+entry.id+": PR/review/CI/merge/readback nao comprovados.");
    } catch(e) {
      errs.push("P0-NR-001 LIVE "+entry.id+": API indisponivel ou recibo nao autentico.");
    }
  }
  return errs;
}
async function githubGet(path){
  const token=String(process.env.GITHUB_TOKEN||"");
  if(!token)throw new Error("GITHUB_TOKEN indisponivel.");
  const r=await fetch("https://api.github.com"+path,{
    headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28","User-Agent":"ContaOS-P0-NR-001"},
    signal:AbortSignal.timeout(15000),
  });
  if(!r.ok)throw new Error("HTTP "+r.status);
  return r.json();
}
async function main(){
  let doc;
  try{doc=JSON.parse(readFileSync(LEDGER,"utf8"))}
  catch(e){console.error("P0-NR-001 FAIL: ledger nao lido/JSON invalido.",e.message);
    process.exitCode=1;return;}
  let baselineCases=null;
  try {
    const raw=execFileSync("git",["show","origin/main:"+LEDGER],
      {encoding:"utf8",stdio:["ignore","pipe","ignore"]});
    baselineCases=JSON.parse(raw).cases;
  } catch {
    // Bootstrap: ledger ainda não existe na main. Em PRs futuras o
    // próprio checksum do GitHub/runner garantirá histórico preservado.
    if(process.env.GITHUB_EVENT_NAME==="pull_request") {
      const old=execFileSync("git",["ls-tree","--name-only","origin/main",LEDGER],
        {encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim();
      if(old) {console.error("P0-NR-001 FAIL: ledger historico inacessivel.");
        process.exitCode=1;return;}
    }
  }
  const result=validateLedger(doc,{baselineCases});
  const live=result.errors.length?[]:await verifyResolvedLive(doc,githubGet);
  for(const e of [...result.errors,...live])console.error(e);
  if(result.errors.length||live.length){process.exitCode=1;return;}
  console.log("P0-NR-001 LEDGER PASS — "+result.pendentes+
    " classes ainda nao resolvidas com prova; "+result.resolvidos+
    " classes com recibo validado. PASS documental NAO certifica erro corrigido.");
}
if(process.argv[1] && fileURLToPath(import.meta.url)===
  fileURLToPath(new URL("file://"+process.argv[1])))main();

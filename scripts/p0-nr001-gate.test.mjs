import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateLedger,verifyResolvedLive,LEDGER} from "./p0-nr001-gate.mjs";
const actual=JSON.parse(readFileSync(LEDGER,"utf8"));
const clone=()=>structuredClone(actual);
const check=(x,override={})=>validateLedger(x,override).errors.join("\n");
const fail=(x,rx,opts)=>assert.match(check(x,opts),rx);
const url="https://github.com/contaos999999/contaos-hml-control";
const sha="a".repeat(40), merge="b".repeat(40), runNo=12345, prNo=987;
const receipt=()=>({
  pr_url:url+"/pull/"+prNo,head_sha:sha,merge_sha:merge,
  ci_run_url:url+"/actions/runs/"+runNo,
  nr_run_url:url+"/actions/runs/45678",
  review_url:url+"/pull/"+prNo+"#pullrequestreview-888",
  readback_url:url+"/blob/main/scripts/p0-nr001-gate.test.mjs",
});
const resolved=()=>{const d=clone();const item=d.cases.find(x=>x.id==="NR-008");
  item.estado="RESOLVIDO_COM_PROVA";item.recibo=receipt();return d;};
test("P0 NR — ledger existente integra todas as 8 classes sem declarar falsas resolucoes",()=>{
  assert.equal(check(clone()),"");
  assert.equal(actual.cases.filter(x=>x.estado==="RESOLVIDO_COM_PROVA").length,0);
});
test("P0 NR — nao permite remover erro historico conhecido",()=>{
  const x=clone();x.cases=x.cases.filter(x=>x.id!=="NR-001");
  fail(x,/classe historica removida/);
});
test("P0 NR — reincidencia nao pode ser registrada sob fingerprint duplicado",()=>{
  const x=clone();x.cases[1].fingerprint=x.cases[0].fingerprint;
  fail(x,/fingerprint causal ausente\/duplicado/);
});
test("P0 NR — causa nao confirmada permanece em diagnostico",()=>{
  const x=clone();x.cases[0].causa_status="EM_INVESTIGACAO";
  fail(x,/causa apenas hipotetica/);
});
test("P0 NR — sem barreira de prevencao falha fechado",()=>{
  const x=clone();x.cases[0].barreira=" ";
  fail(x,/sem causa, sintoma, risco residual ou barreira preventiva/);
});
test("P0 NR — estado de resolvido sem comprovantes PR CI review e readback bloqueia",()=>{
  const x=clone();x.cases[0].estado="RESOLVIDO_COM_PROVA";
  fail(x,/RESOLVIDO sem PR/);
});
test("P0 NR — recibo antecipado sem estado resolvido e proibido",()=>{
  const x=clone();x.cases[1].recibo=receipt();
  fail(x,/recibo de resolvido apresentado sem status/);
});
test("P0 NR — segundo retry da mesma causa exige diagnostico ampliado",()=>{
  const x=clone();x.cases[0].tentativas_ciclo=2;
  fail(x,/duas tentativas sem revisao causal ampliada/);
});
test("P0 NR — analise causal ampliada documentada permite manter historico",()=>{
  const x=clone();x.cases[0].tentativas_ciclo=2;
  x.cases[0].revisao_causal_ampliada=true;
  x.cases[0].diagnostico_ampliado="hipotese nova testada com negativo causal";
  assert.equal(check(x),"");
});
test("P0 NR — reincidencia exige novo teste e revisao da prevencao",()=>{
  const x=clone();x.cases[0].estado="REINCIDENCIA";
  fail(x,/reincidencia deve revisar prevencao/);
});
test("P0 NR — TESTE alegado mas arquivo desaparecido e NO-GO",()=>{
  const x=clone();
  fail(x,/arquivo da prevencao inexistente/,{exists:()=>false,read:()=>""});
});
test("P0 NR — titulo de caso nao consta do teste versionado e NO-GO",()=>{
  const x=clone();
  fail(x,/caso de teste preventivo nao encontrado/,{exists:()=>true,read:()=>""});
});
test("P0 NR — PR pendente pode propor teste, sem implicar certificado",()=>{
  const x=clone();const i=x.cases.find(x=>x.id==="NR-003");
  // Fixture do estado, nunca assertion sobre estado mutável da main.
  i.estado="PENDENTE_PR";i.recibo=null;
  assert.equal(check(x),"");
});
test("P0 NR — PENDENTE_PR com recibo prematuro e NO-GO",()=>{
  const x=clone();const i=x.cases.find(x=>x.id==="NR-003");
  i.estado="PENDENTE_PR";i.recibo=receipt();
  fail(x,/recibo de resolvido apresentado sem status/);
});
test("P0 NR — EM_MONITORAMENTO e estado válido, não certificado",()=>{
  const x=clone();const i=x.cases.find(x=>x.id==="NR-003");
  i.estado="EM_MONITORAMENTO";i.recibo=null;
  assert.equal(check(x),"");
  assert.equal(i.recibo,null);
});
const mockGet=(bad={})=>async(path)=>{
  if(path.endsWith("/pulls/"+prNo))return {
    user:{login:"implementador"},merged_at:"2026-11-14T10:00:00Z",
    base:{ref:"main"},head:{sha},merge_commit_sha:merge,
  };
  if(path.endsWith("/actions/runs/"+runNo))
    return {name:"ContaOS Frontend Zero-Drift",conclusion:bad.ci||"success",head_sha:sha};
  if(path.endsWith("/actions/runs/45678"))
    return {name:"ContaOS P0-NR-001 Anti-Reincidencia",
      conclusion:bad.nrCi||"success",head_sha:sha};
  if(path.endsWith("/actions/runs/45678/jobs?per_page=100"))
    return {total_count:1,jobs:[{
      name:"ContaOS P0-NR-001 Integridade e Provas",
      conclusion:bad.nrJob||"success",
      steps:[
        {name:"Testes negativos de classes conhecidas e falso resolvido",
          conclusion:bad.nrStep||"success"},
        {name:"P0-NR-001 ledger com comprovantes reais",conclusion:"success"},
      ],
    }]};
  if(path.endsWith("/pulls/"+prNo+"/reviews?per_page=100"))
    return [{id:888,state:bad.review||"APPROVED",
      user:{login:bad.reviewer||"Edivan5002"},commit_id:sha,
      submitted_at:"2026-11-14T09:00:00Z"}];
  if(path.endsWith("/compare/"+merge+"...main"))return {status:bad.ancestry||"ahead"};
  if(path.includes("/contents/"))return {sha:"abc",encoding:"base64",
    content:Buffer.from("F3 B2b1 RED: intenções e inventário declarados precisam ser o replay dos eventos").toString("base64")};
  throw Error("404");
};
test("P0 NR LIVE — resolucao com PR, CI, review externo e readback autenticos",async()=>{
  assert.deepEqual(await verifyResolvedLive(resolved(),mockGet()),[]);
});
test("P0 NR LIVE — review self-approve nao e evidencia de prevencao",async()=>{
  assert.match((await verifyResolvedLive(resolved(),mockGet({reviewer:"implementador"}))).join(" "),/nao comprovados/);
});
test("P0 NR LIVE — CHANGES_REQUESTED nao autoriza resolucao",async()=>{
  assert.match((await verifyResolvedLive(resolved(),mockGet({review:"CHANGES_REQUESTED"}))).join(" "),/nao comprovados/);
});
test("P0 NR LIVE — CI com FAILURE nao autentica recibo",async()=>{
  assert.match((await verifyResolvedLive(resolved(),mockGet({ci:"failure"}))).join(" "),/nao comprovados/);
});
test("P0 NR LIVE — token/REST indisponivel com status RESOLVIDO falha fechado",async()=>{
  assert.match((await verifyResolvedLive(resolved(),null)).join(" "),/sem acesso GitHub/);
});
test("P0 NR LIVE — ausencia de recibos RESOLVIDO nao inventa status",async()=>{
  assert.deepEqual(await verifyResolvedLive(clone(),null),[]);
});

test("P0 NR — recibo com review de outra PR nao autentica resolucao",()=>{
  const x=resolved();x.cases.find(e=>e.id==="NR-008").recibo.review_url=
    url+"/pull/999#pullrequestreview-888";
  fail(x,/RESOLVIDO sem PR/);
});
test("P0 NR — readback de outro arquivo nao comprova prevencao",()=>{
  const x=resolved();x.cases.find(e=>e.id==="NR-008").recibo.readback_url=
    url+"/blob/main/docs/frontend/governanca/OUTRA.md";
  fail(x,/RESOLVIDO sem PR/);
});
test("P0 NR LIVE — review aprovado depois invalidado nao e certificado",async()=>{
  const api=async(path)=>{
    if(path.endsWith("/pulls/"+prNo+"/reviews?per_page=100"))
      return [
        {id:888,state:"APPROVED",user:{login:"Edivan5002"},
          commit_id:sha,submitted_at:"2026-11-14T10:00:00Z"},
        {id:889,state:"CHANGES_REQUESTED",user:{login:"Edivan5002"},
          commit_id:sha,submitted_at:"2026-11-14T10:10:00Z"},
      ];
    return mockGet()(path);
  };
  assert.match((await verifyResolvedLive(resolved(),api)).join(" "),/nao comprovados/);
});

test("P0 NR LIVE — ledger resolvido exige workflow anti-reincidencia em sucesso",async()=>{
  const errs=await verifyResolvedLive(resolved(),mockGet({nrCi:"failure"}));
  assert.match(errs.join(" "),/nao comprovados/);
});
test("P0 NR LIVE — origem de teste sem caso real no SHA nao serve",async()=>{
  const api=async(path)=>{
    if(path.includes("/contents/"))return {sha:"abc",encoding:"base64",
      content:Buffer.from("nenhum teste de prevencao aqui").toString("base64")};
    return mockGet()(path);
  };
  assert.match((await verifyResolvedLive(resolved(),api)).join(" "),/nao comprovados/);
});
test("P0 NR LIVE — revisoes incompletas por 100 respostas nao provam aprovacao",async()=>{
  const api=async(path)=>{
    if(path.endsWith("/pulls/"+prNo+"/reviews?per_page=100")) {
      const first=(await mockGet()(path))[0];
      return [first,...Array.from({length:99},(_,i)=>({
        id:i+1,state:"COMMENTED",user:{login:"auditor"+i},submitted_at:"2026-11-14T09:00:00Z"
      }))];
    }
    return mockGet()(path);
  };
  assert.match((await verifyResolvedLive(resolved(),api)).join(" "),/nao comprovados/);
});

test("P0 NR — historico NR-009 registrado na main jamais pode ser apagado",()=>{
  const baseline=clone().cases;
  baseline.push({...structuredClone(baseline[0]),id:"NR-009",fingerprint:"NOVA_CLASSE_HISTORICA"});
  const err=validateLedger(clone(),{baselineCases:baseline}).errors.join(" ");
  assert.match(err,/incidente historico nao pode ser removido/);
});
test("P0 NR — reincidencia nao admite teste negativo ficticio",()=>{
  const x=clone();const item=x.cases[0];item.estado="REINCIDENCIA";
  item.revisao_causal_ampliada=true;
  item.diagnostico_ampliado="nova hipótese comprovada";
  item.novos_testes=[{arquivo:"scripts/nao-existe.test.mjs",caso:"Causa reproduzida"}];
  fail(x,/novo teste de reincidencia nao verificavel/);
});
test("P0 NR LIVE — job NR SUCCESS mas teste de prevencao SKIPPED e NO-GO",async()=>{
  assert.match((await verifyResolvedLive(resolved(),mockGet({nrStep:"skipped"})))
    .join(" "),/nao comprovados/);
});
test("P0 NR LIVE — workflow SUCCESS com job preventivo SKIPPED e NO-GO",async()=>{
  assert.match((await verifyResolvedLive(resolved(),mockGet({nrJob:"skipped"})))
    .join(" "),/nao comprovados/);
});

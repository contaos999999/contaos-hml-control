import { test } from "node:test";
import assert from "node:assert/strict";
import { avaliarGateP0, CERTIFICACAO_CODIGO, GATE_PROD_LIVE } from "./p0-cert-live-policy.mjs";
const codigo = { ci:true, seguranca:true, regressao:true, revisao_independente:true, sha_integrado:true };
const versoes = Object.fromEntries(["V1","V2","V3","V4","V5"].map(v=>[v,{status:"PASS",sha_integrado:true}]));
const live = { autenticado:true, hml:true, isolamento_rls:true, artefatos_verificados:true, revisao_independente:true };
test("CERTIFICACAO_CODIGO não exige credenciais ou LIVE",()=>{
  assert.deepEqual(avaliarGateP0({etapa:CERTIFICACAO_CODIGO,codigo}),{status:"ELEGIVEL_A_CERTIFICACAO",live:"DIFERIDO_PARA_GATE_PROD"});
});
test("CERTIFICACAO_CODIGO não aprova CI ausente",()=>{
  assert.equal(avaliarGateP0({etapa:CERTIFICACAO_CODIGO,codigo:{...codigo,ci:false}}).status,"NO_GO");
});
test("CERTIFICACAO_CODIGO não aprova revisão ausente",()=>{
  assert.equal(avaliarGateP0({etapa:CERTIFICACAO_CODIGO,codigo:{...codigo,revisao_independente:false}}).status,"NO_GO");
});
test("GATE_PROD_LIVE não aceita versões incompletas",()=>{
  assert.equal(avaliarGateP0({etapa:GATE_PROD_LIVE,codigo,versoes:{...versoes,V5:{status:"PENDENTE"}} ,live}).status,"NO_GO");
});
test("GATE_PROD_LIVE não aceita ausência de LIVE",()=>{
  assert.equal(avaliarGateP0({etapa:GATE_PROD_LIVE,codigo,versoes}).status,"NO_GO");
});
test("GATE_PROD_LIVE não aceita isolamento RLS ausente",()=>{
  assert.equal(avaliarGateP0({etapa:GATE_PROD_LIVE,codigo,versoes,live:{...live,isolamento_rls:false}}).status,"NO_GO");
});
test("GATE_PROD_LIVE nunca autoriza PROD automaticamente",()=>{
  assert.deepEqual(avaliarGateP0({etapa:GATE_PROD_LIVE,codigo,versoes,live}),{status:"ELEGIVEL_A_REVISAO_GATE_PROD",autorizacao_prod:false});
});

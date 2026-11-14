import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRcaImpact } from "./p0-rca-impact-gate.mjs";

const RCA = "docs/frontend/rca/P0_RCA_ATIVO.json";
const file = "src/components/v2/Apontamentos.tsx";
const base = () => ({
  schema: "contaos.p0.rca-report.v1",
  versao: "V2",
  prompt_id: "44",
  baseline: { frontend_sha: "a".repeat(40), backend_sha: "b".repeat(40) },
  itens: [{
    id: "RCA-V2-001",
    tipo: "CORRECAO",
    reproducao: {
      confirmada: true,
      sintoma: "Apontamento desconectado da competência",
      esperado: "Apontamento vinculado à competência",
      observado: "Vínculo inválido",
      evidencia: "teste reproduzível RED do caso",
    },
    causa: {
      status: "CONFIRMADA",
      descricao: "Consumidor referencia campo incorreto de competência",
      evidencias: ["trace do contrato", "caso RED"],
      hipoteses_descartadas: ["backend indisponível descartado por RPC"],
    },
    impacto: {
      dependencias: ["V1/competência", "V2/apontamento"],
      versoes_afetadas: ["V1", "V2"],
      riscos: [{ risco: "regressão na listagem V1", teste_preventivo: "REG-V1-COMP-01" }],
    },
    testes: {
      red: ["RED-V2-001"],
      negativos: ["NEG-V2-001"],
      green: ["GREEN-V2-001"],
      regressao: ["REG-V1-COMP-01"],
    },
    solucao: {
      descricao: "Corrigir a origem do contrato consumido e manter API",
      arquivos: [file],
      rollback: "reverter PR autorizado sem alterar backend",
    },
  }],
});
const check = (report = base(), changed = [file, RCA], planId = "44") =>
  validateRcaImpact({ planId, changed, report, reportExists: Boolean(report) });
const fails = (report, regex, changed = [file, RCA], id = "44") =>
  assert.match(check(report, changed, id).errors.join(" "), regex);

test("P0 RCA — V1 legado N/A sem bloqueio retroativo", () => {
  assert.deepEqual(check(null, [file], "75").errors, []);
});
test("P0 RCA — alteração documental V2 N/A", () => {
  assert.deepEqual(check(null, ["docs/frontend/planos/P0_PLANO.md"], "44").errors, []);
});
test("P0 RCA — falta relatório no diff de BUILD V2: FAIL", () => {
  fails(null, /sem ficha RCA/);
});
test("P0 RCA — relatório antigo sem modificação no diff: FAIL", () => {
  fails(base(), /sem ficha RCA/, [file]);
});
test("P0 RCA — RCA causal completo e testes preventivos: PASS", () => {
  assert.deepEqual(check().errors, []);
});
test("P0 RCA — sem causa raiz comprovada: FAIL", () => {
  const r = base(); r.itens[0].causa.status = "PLAUSIVEL";
  fails(r, /causa raiz confirmada/);
});
test("P0 RCA — sem hipóteses descartadas: FAIL", () => {
  const r = base(); r.itens[0].causa.hipoteses_descartadas = [];
  fails(r, /hipóteses descartadas/);
});
test("P0 RCA — sem RED causal: FAIL", () => {
  const r = base(); r.itens[0].testes.red = [];
  fails(r, /RED/);
});
test("P0 RCA — risco sem teste preventivo: FAIL", () => {
  const r = base(); r.itens[0].impacto.riscos[0].teste_preventivo = "";
  fails(r, /riscos ou testes preventivos/);
});
test("P0 RCA — alteração fora do mapa: FAIL", () => {
  fails(base(), /fora do mapa causal/, [file, "src/components/v2/Outro.tsx", RCA]);
});
test("P0 RCA — versão ou baseline incorreto: FAIL", () => {
  const r = base(); r.baseline.backend_sha = "fake";
  fails(r, /baseline inválidos/);
});
test("P0 RCA — nova funcionalidade exige preflight e TDD: FAIL", () => {
  const r = base();
  r.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  delete r.itens[0].preflight;
  fails(r, /sem preflight/);
});
test("P0 RCA — nova funcionalidade com preflight e TDD: PASS", () => {
  const r = base();
  r.itens[0].tipo = "NOVA_FUNCIONALIDADE";
  r.itens[0].preflight = { status: "PASS", evidencia: "inventário de dependências validado" };
  assert.deepEqual(check(r).errors, []);
});
test("P0 RCA — duas falhas exigem IDs distintos", () => {
  const r = base();
  r.itens.push(structuredClone(r.itens[0]));
  fails(r, /ID exclusivo/);
});

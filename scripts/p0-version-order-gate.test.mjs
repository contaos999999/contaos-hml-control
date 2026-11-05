import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateP0, P0 } from "./p0-version-order-gate.mjs";

const original = JSON.parse(readFileSync(P0, "utf8"));
const clone = () => JSON.parse(JSON.stringify(original));
const plan = (id) => ({ prompt_id: id, status: "VALIDADO" });
const check = (m = clone(), p = plan("42"), paths = []) =>
  validateP0(m, p, paths);

test("P0 — catálogo 100/97, recibo integrado 43 e próximo 75/V1", () => {
  const result = check();
  assert.deepEqual(result.errors, []);
  assert.equal(result.next, "75");
  assert.deepEqual(original.controle.regulares_pendentes_concluidos_com_evidencia, ["43"]);
  assert.equal(result.pendingVersion, "V1");
});

test("P0 — permite PLAN 43/V1-22 antes da certificação V1 e antes do próprio recibo", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = [];
  assert.deepEqual(check(m, plan("43")).errors, []);
});

test("P0 — bloqueia PLAN 75/V1-23 sem recibo do 43", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = [];
  assert.match(check(m, plan("75")).errors.join(" "), /SALTO/);
});

test("P0 — permite PLAN 75 depois de recibo do regular 43", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43"];
  const r = check(m, plan("75"));
  assert.deepEqual(r.errors, []);
  assert.equal(r.next, "75");
});

test("P0 — bloqueia PLAN 44/V2 quando falta certificar a V1", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "75"];
  assert.match(check(m, plan("44")).errors.join(" "), /certificado da V1/);
});

test("P0 — também bloqueia documento PLAN V2 sem mudar o PLANO_ATIVO", () => {
  const r = check(clone(), plan("42"), [
    "docs/frontend/planos/PROMPT_44_V2_01_DILIGENCIAS.md",
  ]);
  assert.match(r.errors.join(" "), /BLOQUEIA PLAN\/BUILD 44/);
});

test("P0 — arquivo de PLANO da própria V1 não é bloqueado", () => {
  assert.deepEqual(
    check(clone(), plan("42"), ["docs/frontend/planos/PROMPT_43_V1_22.md"]).errors,
    [],
  );
});

test("P0 — faltar prompt 75 na sequência é NO-GO", () => {
  const m = clone();
  m.blocos[0].regular_ids = ["43"];
  assert.match(check(m).errors.join(" "), /Sequência/);
});

test("P0 — inventário alterado ou atômico 096 ausente é NO-GO", () => {
  const m = clone();
  m.inventario.atomic_000_096.pop();
  m.blocos[5].atomic_ids.pop();
  const errors = check(m).errors.join(" ");
  assert.match(errors, /97 atômicos/);
  assert.match(errors, /GLOBAL/);
});

test("P0 — não aceita recibo antecipado fora da ordem das versões", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "44"];
  assert.match(check(m).errors.join(" "), /fora da ordem/);
});

test("P0 — um certificado de V1 declarado PASS sem prova NÃO abre V2", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "75"];
  m.controle.certificados_por_versao.V1.status = "PASS";
  const errors = check(m, plan("44")).errors.join(" ");
  assert.match(errors, /Certificado V1 não comprova/);
  assert.match(errors, /não tem documento/);
});

test("P0 — V1 com recibos, 00–42 auditados e certificado rastreável permite V2", () => {
  const m = clone();
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "75"];
  const c = m.controle.certificados_por_versao.V1;
  c.status = "PASS";
  c.regulares_comprovados = [
    ...m.baseline.regular_ids_historicos_00_42, "43", "75",
  ];
  c.atomic_ids_comprovados = ["000", ...m.blocos[0].atomic_ids];
  c.pr_merge_sha = "a".repeat(40);
  c.arquivo_evidencia = "docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md";
  c.ci_url = "https://github.com/contaos999999/contaos-hml-control/actions/runs/999";
  assert.deepEqual(check(m, plan("44")).errors, []);
});

test("P0 — GLOBAL não pode ser certificado antes dos 57 regulares", () => {
  const m = clone();
  m.controle.certificados_por_versao.GLOBAL.status = "PASS";
  assert.match(check(m).errors.join(" "), /Certificado GLOBAL/);
});

test("P0 — proíbe aprovação automática de produção", () => {
  const m = clone();
  m.restricoes["produçao_somente_com_aprovacao_expressa"] = false;
  assert.match(check(m).errors.join(" "), /Restrições constitucionais/);
});

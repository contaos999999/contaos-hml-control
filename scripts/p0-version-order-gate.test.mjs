import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateP0, P0 } from "./p0-version-order-gate.mjs";

const original = JSON.parse(readFileSync(P0, "utf8"));
const clone = () => JSON.parse(JSON.stringify(original));
const plan = (id) => ({ prompt_id: id, status: "VALIDADO" });
const check = (m = clone(), p = plan("42"), paths = []) =>
  validateP0(m, p, paths);

function preV1({ seen = ["43"] } = {}) {
  const m = clone();
  m.blocos[0].certificado = "PENDENTE";
  m.baseline.certificacao_retroativa_00_42 = "PENDENTE_DE_EVIDENCIA_INDIVIDUAL";
  m.controle.proxima_versao_permitida = "V1";
  m.controle.proximo_regular_a_planejar = seen.length === 0 ? "43" : "75";
  m.controle.regulares_restantes_total = 57 - seen.length;
  m.controle.regulares_pendentes_concluidos_com_evidencia = [...seen];
  m.controle.certificados_por_versao.V1 = {
    status: "PENDENTE",
    pr_merge_sha: null,
    arquivo_evidencia: null,
    ci_url: null,
    atomic_ids_comprovados: [],
    regulares_comprovados: [],
  };
  delete m.controle.fase8;
  return m;
}

const fakeReceipt = () => ({
  status: "PASS",
  pr_merge_sha: "a".repeat(40),
  arquivo_evidencia: "docs/frontend/auditorias/integracao-funcional-v1/fase1/CERTIFICADO.md",
  matriz_arquivo: "docs/frontend/auditorias/integracao-funcional-v1/fase1/TELAS.csv",
  grafo_arquivo: "docs/frontend/auditorias/integracao-funcional-v1/fase1/GRAFO.mmd",
  ci_url: "https://github.com/contaos999999/contaos-hml-control/actions/runs/12345",
  revisao_independente_url: "https://github.com/contaos999999/contaos-hml-control/pull/123#pullrequestreview-12345",
});
const v1Integrated = (m) => {
  m.controle.integracao_por_versao.V1.interna = fakeReceipt();
  return m;
};

test("P0 — V1 funcional certificada não libera V2 sem integracao interna", () => {
  const result = check(clone(), plan("44"));
  assert.match(result.errors.join(" "), /integracao interna da V1/);
  assert.equal(result.next, "44");
  assert.deepEqual(original.controle.regulares_pendentes_concluidos_com_evidencia, ["43", "75"]);
  assert.equal(original.controle.certificados_por_versao.V1.status, "PASS");
  assert.equal(result.pendingVersion, "V2");
});

test("P0 — V1 interna comprovada permite PLAN V2/44", () => {
  assert.deepEqual(check(v1Integrated(clone()), plan("44")).errors, []);
});

test("P0 — permite PLAN 43/V1-22 antes da certificação V1 e antes do próprio recibo", () => {
  assert.deepEqual(check(preV1({ seen: [] }), plan("43")).errors, []);
});

test("P0 — bloqueia PLAN 75/V1-23 sem recibo do 43", () => {
  assert.match(check(preV1({ seen: [] }), plan("75")).errors.join(" "), /SALTO/);
});

test("P0 — permite PLAN 75 depois de recibo do regular 43", () => {
  const r = check(preV1({ seen: ["43"] }), plan("75"));
  assert.deepEqual(r.errors, []);
  assert.equal(r.next, "75");
});

test("P0 — bloqueia PLAN 44/V2 quando falta certificar a V1", () => {
  const m = preV1({ seen: ["43", "75"] });
  assert.match(check(m, plan("44")).errors.join(" "), /certificado da V1/);
});

test("P0 — também bloqueia documento PLAN V2 sem mudar o PLANO_ATIVO", () => {
  const r = check(preV1({ seen: ["43"] }), plan("42"), [
    "docs/frontend/planos/PROMPT_44_V2_01_DILIGENCIAS.md",
  ]);
  assert.match(r.errors.join(" "), /BLOQUEIA PLAN\/BUILD 44/);
});

test("P0 — arquivo de PLANO da própria V1 não é bloqueado no estado pré-certificação", () => {
  assert.deepEqual(
    check(preV1({ seen: ["43"] }), plan("42"), ["docs/frontend/planos/PROMPT_43_V1_22.md"]).errors,
    [],
  );
});

test("P0 — faltar prompt 75 na sequência é NO-GO", () => {
  const m = preV1({ seen: ["43"] });
  m.blocos[0].regular_ids = ["43"];
  assert.match(check(m).errors.join(" "), /Sequência/);
});

test("P0 — inventário alterado ou atômico 096 ausente é NO-GO", () => {
  const m = clone();
  m.inventario.atomic_000_096.pop();
  m.blocos[5].atomic_ids.pop();
  const errors = check(m, plan("44")).errors.join(" ");
  assert.match(errors, /97 atômicos/);
  assert.match(errors, /GLOBAL/);
});

test("P0 — não aceita recibo antecipado fora da ordem das versões", () => {
  const m = preV1({ seen: ["43"] });
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "44"];
  assert.match(check(m).errors.join(" "), /fora da ordem/);
});

test("P0 — um certificado de V1 declarado PASS sem prova NÃO abre V2", () => {
  const m = preV1({ seen: ["43", "75"] });
  m.controle.certificados_por_versao.V1.status = "PASS";
  const errors = check(m, plan("44")).errors.join(" ");
  assert.match(errors, /Certificado V1 não comprova/);
  assert.match(errors, /não tem documento/);
});

test("P0 — V1 com recibos, 00–42 auditados e certificado rastreável permite V2", () => {
  const m = preV1({ seen: ["43", "75"] });
  const c = m.controle.certificados_por_versao.V1;
  c.status = "PASS";
  c.regulares_comprovados = [
    ...m.baseline.regular_ids_historicos_00_42, "43", "75",
  ];
  c.atomic_ids_comprovados = ["000", ...m.blocos[0].atomic_ids];
  c.pr_merge_sha = "a".repeat(40);
  c.arquivo_evidencia = "docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md";
  c.ci_url = "https://github.com/contaos999999/contaos-hml-control/actions/runs/999";
  m.blocos[0].certificado = "PASS";
  v1Integrated(m);
  assert.deepEqual(check(m, plan("44")).errors, []);
});

test("P0 — GLOBAL não pode ser certificado antes dos 57 regulares", () => {
  const m = clone();
  m.controle.certificados_por_versao.GLOBAL.status = "PASS";
  assert.match(check(m, plan("44")).errors.join(" "), /Certificado GLOBAL/);
});

test("P0 — proíbe aprovação automática de produção", () => {
  const m = clone();
  m.restricoes["produçao_somente_com_aprovacao_expressa"] = false;
  assert.match(check(m, plan("44")).errors.join(" "), /Restrições constitucionais/);
});


test("P0 — certificado interno V1 sem revisão independente é FAIL", () => {
  const m = v1Integrated(clone());
  m.controle.integracao_por_versao.V1.interna.revisao_independente_url = null;
  assert.match(check(m, plan("44")).errors.join(" "), /revisao independente/);
});

test("P0 — certificado interno V1 sem grafo é FAIL", () => {
  const m = v1Integrated(clone());
  m.controle.integracao_por_versao.V1.interna.grafo_arquivo = null;
  assert.match(check(m, plan("44")).errors.join(" "), /grafo/);
});

test("P0 — V3 depende de recibos internos e cumulativos V2", () => {
  const m = v1Integrated(clone());
  m.controle.regulares_pendentes_concluidos_com_evidencia = ["43", "75", ...m.blocos[1].regular_ids];
  m.blocos[1].certificado = "PASS";
  const v2 = m.controle.certificados_por_versao.V2;
  Object.assign(v2, {
    status: "PASS",
    regulares_comprovados: [...m.blocos[1].regular_ids],
    atomic_ids_comprovados: ["000", ...m.blocos[1].atomic_ids],
    pr_merge_sha: "b".repeat(40),
    arquivo_evidencia: "docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md",
    ci_url: "https://github.com/contaos999999/contaos-hml-control/actions/runs/12345",
  });
  const blocked = check(m, plan("50")).errors.join(" ");
  assert.match(blocked, /integracao interna da V2/);
  assert.match(blocked, /integracao cumulativa da V2/);
  m.controle.integracao_por_versao.V2.interna = fakeReceipt();
  assert.match(check(m, plan("50")).errors.join(" "), /integracao cumulativa da V2/);
  m.controle.integracao_por_versao.V2.cumulativa = fakeReceipt();
  assert.deepEqual(check(m, plan("50")).errors, []);
});

test("P0 — não valida PASS de integração antes do certificado funcional da versão", () => {
  const m = v1Integrated(clone());
  m.controle.integracao_por_versao.V2.interna = fakeReceipt();
  assert.match(check(m, plan("44")).errors.join(" "), /antecipado ao certificado funcional/);
});

test("P0 — não permite enfraquecer o protocolo RCA", () => {
  const m = clone();
  m.restricoes.rca_impacto_obrigatorio = false;
  assert.match(check(m, plan("75")).errors.join(" "), /P0 RCA/);
});

test("P0 — PR de PLAN V2/44 também fica bloqueada sem interna V1", () => {
  const m = clone();
  const changed = ["docs/frontend/planos/PROMPT_44_V2_01.md"];
  assert.match(check(m, plan("75"), changed).errors.join(" "), /integracao interna da V1/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUTES, WIDTHS, THEMES, cases, publicGate, classifyProtected, publicA11yGate, contrastAssessment } from "./visual-audit.mjs";

test("matriz oficial: 23 telas × 4 larguras × 2 temas", () => {
  assert.equal(ROUTES.length, 23);
  assert.deepEqual(WIDTHS, [1440, 1280, 768, 390]);
  assert.deepEqual(THEMES, ["light", "dark"]);
  assert.equal(cases().length, 184);
  assert.equal(new Set(cases().map((x) => x.id + x.width + x.theme)).size, 184);
});
test("public gate PASS somente para métricas comprovadas", () => {
  assert.deepEqual(publicGate({ http: 200, lang: "pt-BR", h1: 1, overflow: 0, pageErrors: 0 }), []);
});
test("public gate FAIL em idioma, H1, overflow, JS ou HTTP", () => {
  assert.equal(publicGate({ http: 503, lang: "en", h1: 0, overflow: 16, pageErrors: 1 }).length, 5);
});
test("rotas privadas não recebem PASS sem sessão autenticada real", () => {
  assert.equal(
    classifyProtected({ pathname: "/contratos", text: "Contratos" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
  assert.equal(
    classifyProtected({ pathname: "/login", text: "Entrar" }),
    "ACESSO_NEGADO_REDIRECIONADO",
  );
});
test("drawer V1-17 permanece inacessível sem sessão/competência real", () => {
  assert.equal(ROUTES.find((r) => r.id === "V117").requiresDrawer, true);
});

test("GOV-007: axe ausente deve falhar fechado", () => {
  assert.deepEqual(publicA11yGate(null), ["auditoria axe-core pública não executada"]);
  assert.equal(contrastAssessment(null), "NAO_VERIFICADO");
});
test("GOV-007: violações reais são FAIL, sem supressão", () => {
  const s = { axeVersion: "4.14.0", violations: [{ id: "color-contrast", nodes: 2 }], incomplete: [], passes: [] };
  assert.equal(publicA11yGate(s).length, 1);
  assert.equal(contrastAssessment(s), "FAIL_AUTOMATIZADO");
});
test("GOV-007: evidência parcial não vira certificado WCAG integral", () => {
  const s = { axeVersion: "4.14.0", violations: [], incomplete: [{ id: "color-contrast", nodes: 1 }], passes: [] };
  assert.deepEqual(publicA11yGate(s), []);
  assert.equal(contrastAssessment(s), "NAO_VERIFICADO_REVISAO_MANUAL");
  assert.equal(contrastAssessment({ ...s, incomplete: [], passes: [{ id: "color-contrast", nodes: 4 }] }), "PASS_AUTOMATIZADO");
});

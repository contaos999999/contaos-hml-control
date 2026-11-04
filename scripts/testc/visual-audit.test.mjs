import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ROUTES,
  WIDTHS,
  THEMES,
  cases,
  publicGate,
  classifyProtected,
  publicA11yGate,
  contrastAssessment,
  sanitizeContrastDiagnostics,
  wcagContrastRatio,
  measureRenderedTextContrast,
  pixelContrastDecision,
} from "./visual-audit.mjs";

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
  const s = {
    axeVersion: "4.14.0",
    violations: [{ id: "color-contrast", nodes: 2 }],
    incomplete: [],
    passes: [],
  };
  assert.equal(publicA11yGate(s).length, 1);
  assert.equal(contrastAssessment(s), "FAIL_AUTOMATIZADO");
});
test("GOV-007: evidência parcial não vira certificado WCAG integral", () => {
  const s = {
    axeVersion: "4.14.0",
    violations: [],
    incomplete: [{ id: "color-contrast", nodes: 1 }],
    passes: [],
  };
  assert.deepEqual(publicA11yGate(s), []);
  assert.equal(contrastAssessment(s), "NAO_VERIFICADO_REVISAO_MANUAL");
  assert.equal(
    contrastAssessment({ ...s, incomplete: [], passes: [{ id: "color-contrast", nodes: 4 }] }),
    "PASS_AUTOMATIZADO",
  );
});

test("GOV-012: diagnostico de contraste preserva causa sem expor dados privados", () => {
  const input = [
    {
      tag: "P",
      color: "oklch(0.984 0.003 247.858)",
      fontSize: "16px",
      fontWeight: "400",
      opacity: "0.8",
      reasonCodes: ["bgOverlap"],
      layers: [
        {
          tag: "ASIDE",
          backgroundColor: "oklch(0.208 0.042 265.755)",
          hasBackgroundImage: true,
          opacity: "1",
          userToken: "SEGREDO",
        },
      ],
      outerHTML: "<p>SEGREDO</p>",
      textContent: "SEGREDO",
      value: "SEGREDO",
    },
  ];
  const data = sanitizeContrastDiagnostics(input);
  assert.equal(data.length, 1);
  assert.equal(data[0].tag, "p");
  assert.deepEqual(data[0].reasonCodes, ["bgOverlap"]);
  assert.equal(data[0].layers[0].hasBackgroundImage, true);
  assert.doesNotMatch(JSON.stringify(data), /SEGREDO|outerHTML|textContent|userToken|value/);
});
test("GOV-012: limites de diagnosticos e regras desconhecidas", () => {
  const input = Array.from({ length: 500 }, () => ({
    tag: "SPAN",
    reasonCodes: ["bgGradient", "BAD_CODE_9999", "fgAlpha"],
    color: "red; https://malicioso.exemplo/segredo",
    layers: [],
  }));
  const data = sanitizeContrastDiagnostics(input);
  assert.ok(data.length <= 24);
  assert.equal(data[0].color, "NAO_INFORMADO");
  assert.deepEqual(data[0].reasonCodes, ["bgGradient", "fgAlpha"]);
});

test("GOV-014: contraste WCAG sRGB de cores conhecidas", () => {
  assert.equal(wcagContrastRatio([255, 255, 255], [0, 0, 0]), 21);
  assert.ok(wcagContrastRatio([119, 119, 119], [255, 255, 255]) < 4.5);
});
test("GOV-014: glifo branco sobre preto mede 21:1 e aprova AA", () => {
  const before = { width: 1, height: 1, data: Uint8Array.from([255, 255, 255, 255]) };
  const after = { width: 1, height: 1, data: Uint8Array.from([0, 0, 0, 255]) };
  const nodes = [
    {
      tag: "p",
      rect: { x: 0, y: 0, width: 1, height: 1 },
      foregroundRgb: [255, 255, 255],
      effectiveOpacity: 1,
      fontSizePx: 16,
      fontWeight: 400,
    },
  ];
  const measured = measureRenderedTextContrast(before, after, nodes, { minPixels: 1 });
  assert.equal(measured[0].status, "PASS_AA_PIXEL");
  assert.equal(measured[0].minimumRatio, 21);
  assert.equal(pixelContrastDecision(measured, 1), "PASS_AA_PIXEL_PUBLICO");
});
test("GOV-014: AA falha em texto #777 sobre branco", () => {
  const before = { width: 1, height: 1, data: Uint8Array.from([119, 119, 119, 255]) };
  const after = { width: 1, height: 1, data: Uint8Array.from([255, 255, 255, 255]) };
  const measured = measureRenderedTextContrast(
    before,
    after,
    [
      {
        rect: { x: 0, y: 0, width: 1, height: 1 },
        foregroundRgb: [119, 119, 119],
        effectiveOpacity: 1,
        fontSizePx: 16,
        fontWeight: 400,
      },
    ],
    { minPixels: 1 },
  );
  assert.equal(measured[0].status, "FAIL_AA_PIXEL");
  assert.equal(pixelContrastDecision(measured, 1), "FAIL_AA_PIXEL_PUBLICO");
});
test("GOV-014: nenhuma diferenca ou PNG incompatível nunca gera PASS", () => {
  const p = { width: 1, height: 1, data: Uint8Array.from([0, 0, 0, 255]) };
  const node = {
    rect: { x: 0, y: 0, width: 1, height: 1 },
    foregroundRgb: [255, 255, 255],
    effectiveOpacity: 1,
    fontSizePx: 16,
    fontWeight: 400,
  };
  assert.equal(
    measureRenderedTextContrast(p, p, [node], { minPixels: 1 })[0].status,
    "NAO_VERIFICADO",
  );
  assert.equal(
    measureRenderedTextContrast(p, { ...p, width: 2 }, [node], { minPixels: 1 })[0].status,
    "NAO_VERIFICADO",
  );
  assert.equal(pixelContrastDecision([], 1), "NAO_VERIFICADO");
});

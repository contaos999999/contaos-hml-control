import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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

test("P0: todas as rotas reais integram o executor, incluindo Auditoria e preservando o drawer", () => {
  const routeDirectory = new URL("../../src/routes/", import.meta.url);
  const normalize = (path) =>
    path
      .split("/")
      .map((part) => {
        if (part.startsWith("$") || /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(part))
          return ":id";
        return part.replace(/_$/, "");
      })
      .join("/");
  const pages = readdirSync(routeDirectory)
    .filter((name) => name.endsWith(".tsx") && name !== "__root.tsx")
    .map((name) => {
      const source = readFileSync(new URL(name, routeDirectory), "utf8");
      const match = source.match(/createFileRoute\(["']([^"']+)["']\)/);
      assert.ok(match, `Rota não reconhecida: ${name}`);
      return normalize(match[1]);
    });
  assert.equal(pages.length, 28);
  assert.equal(new Set(pages).size, pages.length);
  assert.deepEqual([...new Set(ROUTES.map((route) => normalize(route.path)))].sort(), pages.sort());
  assert.equal(ROUTES.filter((route) => route.requiresDrawer).length, 1);
  assert.equal(ROUTES.find((route) => route.id === "V117")?.requiresDrawer, true);
});

test("P0 V123: Auditoria possui oito casos privados sem PASS autenticado presumido", () => {
  const route = ROUTES.find((item) => item.id === "V123");
  assert.ok(route, "A rota da Auditoria deve existir no executor independente");
  assert.equal(route.path, "/administracao/auditoria");
  assert.notEqual(route.public, true);
  assert.equal(cases().filter((item) => item.id === "V123").length, 8);
  assert.equal(
    classifyProtected({ pathname: route.path, text: "Trilha de auditoria" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
});

test("matriz oficial: 29 superfícies (28 rotas e drawer) × 4 larguras × 2 temas", () => {
  assert.equal(ROUTES.length, 29);
  assert.deepEqual(WIDTHS, [1440, 1280, 768, 390]);
  assert.deepEqual(THEMES, ["light", "dark"]);
  assert.equal(cases().length, 232);
  assert.equal(new Set(cases().map((x) => x.id + x.width + x.theme)).size, 232);
});
test("GOV-016: V118 /competencias/:id/parecer é superfície privada, sem PASS autenticado presumido", () => {
  const rota = ROUTES.find((r) => r.id === "V118");
  assert.ok(rota, "A superfície V118 deve existir no Teste C");
  assert.equal(rota.path, "/competencias/00000000-0000-4000-8000-000000000001/parecer");
  assert.notEqual(rota.public, true);
  assert.equal(
    classifyProtected({ pathname: rota.path, text: "Parecer interno" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
});
test("PROMPT 40: V119 privada integra 200 casos sem certificar sessão real", () => {
  const rota = ROUTES.find((r) => r.id === "V119");
  assert.ok(rota);
  assert.equal(rota.path, "/competencias/00000000-0000-4000-8000-000000000001/apresentar");
  assert.notEqual(rota.public, true);
  assert.equal(
    classifyProtected({ pathname: rota.path, text: "Wizard de apresentação" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
  assert.equal(cases().filter((c) => c.id === "V119").length, 8);
});

test("PROMPT 41: V120 privada possui 8 combinações sem alegar sessão real", () => {
  const rota = ROUTES.find((r) => r.id === "V120");
  assert.ok(rota);
  assert.equal(
    rota.path,
    "/competencias/00000000-0000-4000-8000-000000000001/apresentacoes/00000000-0000-4000-8000-000000000001",
  );
  assert.notEqual(rota.public, true);
  assert.equal(cases().filter((c) => c.id === "V120").length, 8);
  assert.equal(
    classifyProtected({ pathname: rota.path, text: "Apresentação e protocolo" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
});

test("PROMPT 42: V121 privada integra matriz 216 sem inventar sessão HML", () => {
  const rota = ROUTES.find((r) => r.id === "V121");
  assert.ok(rota);
  assert.equal(rota.path, "/contratos/00000000-0000-4000-8000-000000000001/historico");
  assert.notEqual(rota.public, true);
  assert.equal(cases().filter((c) => c.id === "V121").length, 8);
  assert.equal(
    classifyProtected({ pathname: rota.path, text: "Histórico do contrato" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
});

test("PROMPT 43: V122 integra Teste C privado 224 casos (sem upload/worker/isolamento real)", () => {
  const rota = ROUTES.find((r) => r.id === "V122");
  assert.ok(rota);
  assert.equal(rota.path, "/contratos/00000000-0000-4000-8000-000000000001/historico/importar");
  assert.notEqual(rota.public, true);
  assert.equal(cases().filter((c) => c.id === "V122").length, 8);
  assert.equal(
    classifyProtected({ pathname: rota.path, text: "Importação de histórico" }),
    "NAO_VERIFICADO_SESSAO_REAL",
  );
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

test("GOV-014: minúscula coincidência de cores em área ampla não recebe PASS", () => {
  const a = new Uint8Array(100 * 4);
  const b = new Uint8Array(100 * 4);
  for (let i = 0; i < 100; i++) {
    a.set(i === 0 ? [255, 255, 255, 255] : [255, 0, 0, 255], i * 4);
    b.set([0, 0, 0, 255], i * 4);
  }
  const result = measureRenderedTextContrast(
    { width: 10, height: 10, data: a },
    { width: 10, height: 10, data: b },
    [
      {
        rect: { x: 0, y: 0, width: 10, height: 10 },
        foregroundRgb: [255, 255, 255],
        effectiveOpacity: 1,
        fontSizePx: 16,
        fontWeight: 400,
      },
    ],
    { minPixels: 1 },
  );
  assert.equal(result[0].status, "NAO_VERIFICADO");
  assert.equal(result[0].sampleCount, 1);
  assert.equal(pixelContrastDecision(result, 1), "NAO_VERIFICADO");
});

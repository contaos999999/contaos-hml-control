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

test("BRAND-01: aceita Inter com alternativa Arial e genérica sans-serif", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.brandTypographyGate, "function");
  for (const stack of [
    "Inter, Arial, sans-serif",
    '"Inter", "Arial", sans-serif',
    "inter,arial,sans-serif",
  ])
    assert.deepEqual(m.brandTypographyGate(stack), []);
});
test("BRAND-01: rejeita pilha vazia, genérica ou alternativa fora da ordem institucional", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.brandTypographyGate, "function");
  for (const stack of [
    undefined,
    null,
    123,
    "",
    "system-ui, sans-serif",
    "Arial, Inter, sans-serif",
    "Inter, system-ui, Arial, sans-serif",
    "Inter, Arial, serif",
  ])
    assert.equal(m.brandTypographyGate(stack).length, 1);
});

function keyboardFixture(route = "/login") {
  const ids =
    route === "/login"
      ? ["email", "forgot", "password", "visibility", "submit"]
      : ["email", "submit", "back"];
  return [
    ...ids.map((control) => ({ control, direction: "forward" })),
    ...ids
      .slice(0, -1)
      .reverse()
      .map((control) => ({ control, direction: "reverse" })),
  ].map((step) => ({
    ...step,
    target: true,
    named: true,
    visible: true,
    focusVisible: true,
    indicator: true,
    screenshot: `screenshots/${route === "/login" ? "SYS01" : "SYS02"}_1440_dark_keyboard_${step.direction}_${step.control}.png`,
    sha256: "a".repeat(64),
  }));
}

test("teclado público: controles reais e prova completa de avanço/retorno", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicKeyboardTargets, "function");
  assert.deepEqual(
    m.publicKeyboardTargets("/login").map((x) => x.control),
    ["email", "forgot", "password", "visibility", "submit"],
  );
  assert.deepEqual(
    m.publicKeyboardTargets("/esqueci-senha").map((x) => x.control),
    ["email", "submit", "back"],
  );
  assert.deepEqual(m.publicKeyboardTargets("/administracao/auditoria"), []);
  for (const route of ["/login", "/esqueci-senha"])
    assert.deepEqual(m.publicKeyboardGate(route, keyboardFixture(route), 0), []);
});

test("teclado público: coleta, ordem e tentativa de mutação falham fechadas", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicKeyboardGate, "function");
  const valid = keyboardFixture();
  const swapped = structuredClone(valid);
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const wrongReturn = structuredClone(valid);
  wrongReturn[5].control = "email";
  for (const steps of [
    undefined,
    null,
    {},
    [],
    valid.slice(1),
    [...valid, valid[0]],
    swapped,
    wrongReturn,
  ])
    assert.ok(m.publicKeyboardGate("/login", steps, 0).length);
  for (const count of [1, -1, undefined, "0", NaN])
    assert.ok(m.publicKeyboardGate("/login", valid, count).length);
  assert.ok(m.publicKeyboardGate("/redefinir-senha", valid, 0).length);
});

test("teclado público: nome, alvo, viewport, foco, indicador e captura são obrigatórios", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicKeyboardGate, "function");
  for (const field of ["target", "named", "visible", "focusVisible", "indicator"])
    for (const value of [false, undefined, 1, "true"]) {
      const steps = keyboardFixture();
      steps[2][field] = value;
      assert.ok(m.publicKeyboardGate("/login", steps, 0).length, field);
    }
  for (const [field, value] of [
    ["screenshot", null],
    ["screenshot", "screenshots/private.png"],
    ["sha256", "not-a-hash"],
  ]) {
    const steps = keyboardFixture();
    steps[0][field] = value;
    assert.ok(m.publicKeyboardGate("/login", steps, 0).length);
  }
});

test("teclado público: saneamento não publica DOM, valores ou canário", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.sanitizeKeyboardSteps, "function");
  const canary = "PRIVATE_CANARY_NEVER_EXPORT";
  const valid = keyboardFixture();
  valid[0].html = canary;
  valid[0].value = canary;
  valid[0].name = canary;
  const safe = m.sanitizeKeyboardSteps(valid);
  assert.equal(JSON.stringify(safe).includes(canary), false);
  assert.deepEqual(m.publicKeyboardGate("/login", safe, 0), []);
  const unknown = m.sanitizeKeyboardSteps([
    { control: canary, direction: canary, screenshot: canary, sha256: canary },
  ]);
  assert.equal(JSON.stringify(unknown).includes(canary), false);
  assert.ok(m.publicKeyboardGate("/login", unknown, 0).length);
});

test("teclado público: recarga deve restaurar HTTP, URL, formulário vazio e rolagem", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicKeyboardResetGate, "function");
  const valid = {
    http: 200,
    sameUrl: true,
    empty: true,
    controlsReady: true,
    publicStateValid: true,
    scrollX: 0,
    scrollY: 0,
    pageErrors: 0,
  };
  assert.deepEqual(m.publicKeyboardResetGate(valid), []);
  for (const value of [
    null,
    undefined,
    {},
    { ...valid, http: 500 },
    { ...valid, http: 302 },
    { ...valid, http: 0 },
    { ...valid, http: "200" },
    ...["sameUrl", "empty", "controlsReady", "publicStateValid"].map((field) => ({
      ...valid,
      [field]: false,
    })),
    { ...valid, scrollX: 2 },
    { ...valid, scrollY: 2 },
    { ...valid, scrollY: NaN },
    { ...valid, pageErrors: 1 },
  ])
    assert.ok(m.publicKeyboardResetGate(value).length);
});

const escalaValida = () => ({
  id: "SYS01",
  route: "/login",
  width: 390,
  theme: "light",
  mode: "TEXT_200",
  http: 200,
  pathExact: true,
  langPtBr: true,
  h1: 1,
  targetsComplete: true,
  formsEmpty: true,
  overflowX: 0,
  clipped: 0,
  blockedMutations: 0,
  pageErrors: 0,
  rootBefore: 16,
  rootAfter: 32,
  sampleBefore: 2,
  sampleAfter: 2,
  measurements: [
    { index: 0, before: 14, after: 28, matched: true },
    { index: 1, before: 16, after: 32, matched: true },
  ],
  screenshot: "screenshots/SYS01_390_light_TEXT_200.png",
  sha256: "a".repeat(64),
});

test("refluxo/texto: 18 casos públicos separados preservam os 232 casos base", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicScaleCases, "function");
  const extra = m.publicScaleCases();
  assert.equal(extra.length, 18);
  assert.equal(new Set(extra.map((x) => `${x.id}:${x.theme}:${x.mode}:${x.width}`)).size, 18);
  assert.deepEqual([...new Set(extra.map((x) => x.id))], ["SYS01", "SYS02", "SYS03"]);
  assert.equal(extra.filter((x) => x.mode === "REFLOW_320" && x.width === 320).length, 6);
  assert.equal(
    extra.filter((x) => x.mode === "TEXT_200" && [390, 1440].includes(x.width)).length,
    12,
  );
  assert.equal(m.cases().length, 232);
});

test("refluxo/texto: escala real e amostra estável são obrigatórias", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicScaleGate, "function");
  assert.deepEqual(m.publicScaleGate(escalaValida()), []);
  for (const patch of [
    { rootAfter: 16 },
    { measurements: [{ index: 0, before: 14, after: 14, matched: true }] },
    { sampleBefore: 0, sampleAfter: 0, measurements: [] },
    { sampleAfter: 1 },
    { measurements: [{ index: 0, before: 14, after: 28, matched: false }] },
    { measurements: [{ index: 0, before: 14, after: Infinity, matched: true }] },
    { measurements: [{ index: 0, before: NaN, after: 28, matched: true }] },
    {
      measurements: [
        { index: 0, before: 14, after: 28, matched: true },
        { index: 0, before: 16, after: 32, matched: true },
      ],
    },
  ])
    assert.notDeepEqual(m.publicScaleGate({ ...escalaValida(), ...patch }), []);
});

test("refluxo/texto: overflow, clipping, mutação e estado público incompleto falham", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicScaleGate, "function");
  for (const patch of [
    { overflowX: 2 },
    { clipped: 1 },
    { blockedMutations: 1 },
    { pageErrors: 1 },
    { targetsComplete: false },
    { formsEmpty: false },
    { http: 500 },
    { pathExact: false },
    { langPtBr: false },
    { h1: 0 },
    { id: "V123" },
    { width: 768 },
    { theme: "private" },
    { rootAfter: Infinity },
    { overflowX: NaN },
    { screenshot: "../PRIVATE_CANARY" },
    { sha256: "bad" },
  ])
    assert.notDeepEqual(m.publicScaleGate({ ...escalaValida(), ...patch }), []);
  const reflow = {
    ...escalaValida(),
    width: 320,
    mode: "REFLOW_320",
    rootAfter: 16,
    measurements: [
      { index: 0, before: 14, after: 14, matched: true },
      { index: 1, before: 16, after: 16, matched: true },
    ],
    screenshot: "screenshots/SYS01_320_light_REFLOW_320.png",
  };
  assert.deepEqual(m.publicScaleGate(reflow), []);
});

test("refluxo/texto: relatório rejeita canários, números não finitos e paths arbitrários", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.sanitizePublicScaleRecord, "function");
  const row = m.sanitizePublicScaleRecord({
    ...escalaValida(),
    html: "PRIVATE_CANARY",
    password: "PRIVATE_CANARY",
    url: "PRIVATE_CANARY",
    measurements: [{ index: 0, before: 14, after: 28, matched: true, value: "PRIVATE_CANARY" }],
  });
  assert(!JSON.stringify(row).includes("PRIVATE_CANARY"));
  assert.equal(
    m.sanitizePublicScaleRecord({ ...escalaValida(), overflowX: Infinity }).overflowX,
    null,
  );
  assert.equal(
    m.sanitizePublicScaleRecord({ ...escalaValida(), screenshot: "../private.png" }).screenshot,
    null,
  );
  assert.equal(
    m.sanitizePublicScaleRecord({
      ...escalaValida(),
      measurements: Array.from({ length: 513 }, (_, index) => ({
        index,
        before: 14,
        after: 28,
        matched: true,
      })),
    }).measurements.length,
    0,
  );
});

test("refluxo/texto: falha de contexto mantém 18 FAIL e nunca publica erro bruto", async () => {
  const m = await import("./visual-audit.mjs");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  assert.equal(typeof m.collectPublicScale, "function");
  const output = mkdtempSync(join(tmpdir(), "contaos-scale-")),
    images = [];
  try {
    const rows = await m.collectPublicScale(
      {
        newContext: async () => {
          throw Error("PRIVATE_CANARY");
        },
      },
      { output, base: "http://127.0.0.1:4173", images },
    );
    assert.equal(rows.length, 18);
    assert(rows.every((x) => x.outcome === "FAIL_PUBLIC_SCALE"));
    assert(!JSON.stringify(rows).includes("PRIVATE_CANARY"));
    assert(!readFileSync(join(output, "public-scale.json"), "utf8").includes("PRIVATE_CANARY"));
    assert(
      images.some((x) => x.filename === "public-scale.json" && /^[a-f0-9]{64}$/.test(x.sha256)),
    );
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});

test("refluxo/texto: registro ausente ou desconhecido falha sem lançar dado bruto", async () => {
  const m = await import("./visual-audit.mjs");
  for (const row of [undefined, null, {}, { id: "PRIVATE_CANARY" }]) {
    assert.doesNotThrow(() => m.sanitizePublicScaleRecord(row));
    assert.notDeepEqual(m.publicScaleGate(row), []);
    assert(!JSON.stringify(m.sanitizePublicScaleRecord(row)).includes("PRIVATE_CANARY"));
  }
});

test("refluxo/texto: coleção incompleta, duplicada ou com FAIL não recebe PASS global", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.publicScaleCollectionPass, "function");
  const rows = m.publicScaleCases().map((item) => ({
    ...escalaValida(),
    ...item,
    rootAfter: item.mode === "TEXT_200" ? 32 : 16,
    measurements: [14, 16].map((before, index) => ({
      index,
      before,
      after: before * (item.mode === "TEXT_200" ? 2 : 1),
      matched: true,
    })),
    screenshot: `screenshots/${item.id}_${item.width}_${item.theme}_${item.mode}.png`,
    outcome: "PASS_PUBLIC_SCALE",
    errors: [],
  }));
  assert.equal(m.publicScaleCollectionPass(rows), true);
  assert.equal(m.publicScaleCollectionPass([]), false);
  assert.equal(m.publicScaleCollectionPass(rows.slice(1)), false);
  assert.equal(m.publicScaleCollectionPass([...rows.slice(1), rows[1]]), false);
  assert.equal(
    m.publicScaleCollectionPass([{ ...rows[0], outcome: "FAIL_PUBLIC_SCALE" }, ...rows.slice(1)]),
    false,
  );
  assert.equal(m.publicScaleCollectionPass([{ ...rows[0], clipped: 1 }, ...rows.slice(1)]), false);
});

async function publicScaleDOMFixture(snapshot, html) {
  const { JSDOM } = await import("jsdom");
  const { runInNewContext } = await import("node:vm");
  const dom = new JSDOM(`<html style="font-size:16px"><body>${html}</body></html>`, {
    url: "http://127.0.0.1:4173/login",
  });
  const win = dom.window;
  const rect = (left = 0, width = 200) => ({
    left,
    top: 0,
    width,
    height: 20,
    right: left + width,
    bottom: 20,
  });
  function geometry(el, left = 0, width = 200) {
    el.getClientRects = () => [rect(left, width)];
    el.getBoundingClientRect = () => rect(left, width);
    el.checkVisibility = () => true;
    for (const [key, value] of Object.entries({
      clientWidth: width,
      clientHeight: 20,
      clientLeft: 0,
      clientTop: 0,
      scrollHeight: 20,
    }))
      Object.defineProperty(el, key, { configurable: true, value });
    el.style.fontSize = "14px";
  }
  for (const el of win.document.querySelectorAll("body *")) geometry(el);
  win.Range.prototype.getClientRects = () => [];
  const globals = {
    window: win,
    document: win.document,
    HTMLElement: win.HTMLElement,
    HTMLInputElement: win.HTMLInputElement,
    NodeFilter: win.NodeFilter,
    getComputedStyle: win.getComputedStyle.bind(win),
    location: win.location,
    innerWidth: 320,
  };
  return {
    win,
    geometry,
    capture: (phase) =>
      runInNewContext(`(${snapshot.toString()})(${JSON.stringify(phase)})`, globals),
    close: () => win.close(),
  };
}

test("refluxo/texto: input vazio cortado por ancestral restritivo é detectado", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.capturePublicScaleDOM, "function");
  const f = await publicScaleDOMFixture(
    m.capturePublicScaleDOM,
    '<div id="box" style="overflow-x:hidden"><input id="field"></div>',
  );
  try {
    f.geometry(f.win.document.querySelector("#box"), 0, 100);
    f.geometry(f.win.document.querySelector("#field"), 50, 100);
    f.capture("before");
    assert.equal(f.win.document.querySelector("input").value, "");
    assert(f.capture("after").clipped > 0);
  } finally {
    f.close();
  }
});

test("refluxo/texto: novo texto posterior invalida a identidade da amostra", async () => {
  const m = await import("./visual-audit.mjs");
  assert.equal(typeof m.capturePublicScaleDOM, "function");
  const f = await publicScaleDOMFixture(m.capturePublicScaleDOM, "<p>Texto sintético</p>");
  try {
    const before = f.capture("before");
    const added = f.win.document.createElement("p");
    added.textContent = "Outro texto sintético";
    f.win.document.body.append(added);
    f.geometry(added);
    const after = f.capture("after");
    assert.equal(after.sampleAfter, before.fonts.length + 1);
    assert(after.fonts.every((x) => !x.matched));
  } finally {
    f.close();
  }
});

test("refluxo/texto: caixa do botão não esconde clipping do texto interno", async () => {
  const m = await import("./visual-audit.mjs");
  const f = await publicScaleDOMFixture(
    m.capturePublicScaleDOM,
    '<button style="overflow-x:hidden">Texto sintético longo</button>',
  );
  try {
    f.geometry(f.win.document.querySelector("button"), 0, 100);
    f.win.Range.prototype.getClientRects = () => [
      { left: 0, right: 300, top: 0, bottom: 20, width: 300, height: 20 },
    ];
    f.capture("before");
    assert(f.capture("after").clipped > 0);
  } finally {
    f.close();
  }
});

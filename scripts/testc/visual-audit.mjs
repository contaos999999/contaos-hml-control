import { isProxy } from "node:util/types";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { mkdtempSync, symlinkSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

export const WIDTHS = [1440, 1280, 768, 390];
export const THEMES = ["light", "dark"];
const UUID = "00000000-0000-4000-8000-000000000001";
export const ROUTES = [
  { id: "SYS01", path: "/login", public: true },
  { id: "SYS02", path: "/esqueci-senha", public: true },
  { id: "SYS03", path: "/redefinir-senha", public: true },
  { id: "SYS04", path: "/selecionar-organizacao" },
  { id: "SYS05", path: "/" },
  { id: "ADM01", path: "/administracao/usuarios" },
  { id: "V101", path: "/contratantes" },
  { id: "V102", path: "/contratantes/novo" },
  { id: "V103", path: "/contratantes/" + UUID + "/editar" },
  { id: "V104", path: "/contratos" },
  { id: "V105", path: "/contratos/novo" },
  { id: "V106", path: "/contratos/" + UUID },
  { id: "V107", path: "/contratos/" + UUID + "/base-normativa" },
  { id: "V108", path: "/contratos/" + UUID + "/orcamento" },
  { id: "V109", path: "/contratos/" + UUID + "/regras" },
  { id: "V110", path: "/contratos/" + UUID + "/documentos" },
  { id: "V111", path: "/contratos/" + UUID + "/documentos/" + UUID },
  { id: "V112", path: "/contratos/" + UUID + "/competencias" },
  { id: "V113", path: "/contratos/" + UUID + "/competencias/nova" },
  { id: "V114", path: "/competencias/" + UUID },
  { id: "V115", path: "/competencias/" + UUID + "/documentos" },
  { id: "V116", path: "/competencias/" + UUID + "/analise" },
  { id: "V117", path: "/competencias/" + UUID + "/analise", requiresDrawer: true },
  { id: "V118", path: "/competencias/" + UUID + "/parecer" },
  { id: "V119", path: "/competencias/" + UUID + "/apresentar" },
  { id: "V120", path: "/competencias/" + UUID + "/apresentacoes/" + UUID },
  { id: "V121", path: "/contratos/" + UUID + "/historico" },
  { id: "V122", path: "/contratos/" + UUID + "/historico/importar" },
  { id: "V123", path: "/administracao/auditoria" },
];
export function cases() {
  return ROUTES.flatMap((route) =>
    WIDTHS.flatMap((width) => THEMES.map((theme) => ({ ...route, width, theme }))),
  );
}
export function publicScaleCases() {
  return ROUTES.filter((route) => route.public).flatMap((route) =>
    THEMES.flatMap((theme) => [
      { id: route.id, route: route.path, width: 320, theme, mode: "REFLOW_320" },
      { id: route.id, route: route.path, width: 390, theme, mode: "TEXT_200" },
      { id: route.id, route: route.path, width: 1440, theme, mode: "TEXT_200" },
    ]),
  );
}
export function sanitizePublicScaleRecord(row) {
  const item = publicScaleCases().find((x) =>
    ["id", "width", "theme", "mode"].every((key) => x[key] === row?.[key]),
  );
  const numeric = (n, max = 100000) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  const integer = (n, max = 100000) => (Number.isInteger(n) ? numeric(n, max) : null);
  const filename = item
    ? `screenshots/${item.id}_${item.width}_${item.theme}_${item.mode}.png`
    : null;
  return {
    id: item?.id ?? "UNKNOWN",
    route: item && row?.route === item.route ? item.route : null,
    width: item?.width ?? null,
    theme: item?.theme ?? "UNKNOWN",
    mode: item?.mode ?? "UNKNOWN",
    http: integer(row?.http, 599),
    pathExact: row?.pathExact === true,
    langPtBr: row?.langPtBr === true,
    h1: integer(row?.h1, 100),
    targetsComplete: row?.targetsComplete === true,
    formsEmpty: row?.formsEmpty === true,
    overflowX: numeric(row?.overflowX),
    clipped: integer(row?.clipped),
    blockedMutations: integer(row?.blockedMutations),
    pageErrors: integer(row?.pageErrors),
    rootBefore: numeric(row?.rootBefore, 2048),
    rootAfter: numeric(row?.rootAfter, 2048),
    sampleBefore: integer(row?.sampleBefore, 512),
    sampleAfter: integer(row?.sampleAfter, 512),
    measurements:
      Array.isArray(row?.measurements) && row.measurements.length <= 512
        ? row.measurements.map((x) => ({
            index: integer(x?.index, 511),
            before: numeric(x?.before, 2048),
            after: numeric(x?.after, 2048),
            matched: x?.matched === true,
          }))
        : [],
    screenshot: filename && row?.screenshot === filename ? filename : null,
    sha256:
      typeof row?.sha256 === "string" && /^[a-f0-9]{64}$/.test(row.sha256) ? row.sha256 : null,
  };
}
export function publicScaleGate(record) {
  const r = sanitizePublicScaleRecord(record),
    errors = [];
  if (r.id === "UNKNOWN" || !r.route || !r.screenshot || !r.sha256)
    errors.push("PUBLIC_SCALE_CASE_INVALID");
  if (
    !(r.http >= 200 && r.http < 300) ||
    !r.pathExact ||
    !r.langPtBr ||
    r.h1 !== 1 ||
    !r.targetsComplete ||
    !r.formsEmpty ||
    r.pageErrors !== 0 ||
    r.blockedMutations !== 0
  )
    errors.push("PUBLIC_SCALE_STATE_INCOMPLETE");
  if (r.overflowX === null || r.overflowX > 1 || r.clipped !== 0)
    errors.push("PUBLIC_SCALE_LAYOUT");
  const factor = r.mode === "TEXT_200" ? 2 : 1;
  const ratio = (before, after) =>
    before > 0 && after > 0 && Math.abs(after / before - factor) <= 0.02;
  if (
    !ratio(r.rootBefore, r.rootAfter) ||
    !r.sampleBefore ||
    r.sampleBefore !== r.sampleAfter ||
    r.measurements.length !== r.sampleBefore ||
    !r.measurements.every((x, index) => x.index === index && x.matched && ratio(x.before, x.after))
  )
    errors.push("PUBLIC_SCALE_SAMPLE");
  return errors;
}
export function brandTypographyGate(fontFamily) {
  const stack =
    typeof fontFamily === "string"
      ? fontFamily.split(",").map((font) =>
          font
            .trim()
            .replace(/^["']|["']$/g, "")
            .toLowerCase(),
        )
      : [];
  return stack.length === 3 &&
    stack[0] === "inter" &&
    stack[1] === "arial" &&
    stack[2] === "sans-serif"
    ? []
    : ["Pilha tipográfica institucional requer Inter, Arial, sans-serif nessa ordem"];
}
const KEYBOARD_TARGETS = {
  "/login": [
    { control: "email", selector: "#login-email", name: "E-mail" },
    { control: "forgot", selector: 'a[href="/esqueci-senha"]', name: "Esqueci minha senha" },
    { control: "password", selector: "#login-senha", name: "Senha" },
    {
      control: "visibility",
      selector: 'button[aria-controls="login-senha"]',
      name: "Mostrar senha",
    },
    { control: "submit", selector: 'form button[type="submit"]', name: "Entrar" },
  ],
  "/esqueci-senha": [
    { control: "email", selector: "#esqueci-email", name: "E-mail" },
    { control: "submit", selector: 'form button[type="submit"]', name: "Enviar link" },
    { control: "back", selector: 'a[href="/login"]', name: "Voltar ao login" },
  ],
};
export function publicKeyboardTargets(route) {
  return Object.hasOwn(KEYBOARD_TARGETS, route)
    ? KEYBOARD_TARGETS[route].map((x) => ({ ...x }))
    : [];
}
export function sanitizeKeyboardSteps(steps) {
  const controls = new Set(["email", "forgot", "password", "visibility", "submit", "back"]);
  const image =
    /^screenshots\/(SYS01|SYS02)_(1440|1280|768|390)_(light|dark)_keyboard_(forward|reverse)_(email|forgot|password|visibility|submit|back)\.png$/;
  return (Array.isArray(steps) ? steps : []).slice(0, 20).map((step) => ({
    control: controls.has(step?.control) ? step.control : "UNKNOWN",
    direction: ["forward", "reverse"].includes(step?.direction) ? step.direction : "UNKNOWN",
    target: step?.target === true,
    named: step?.named === true,
    visible: step?.visible === true,
    focusVisible: step?.focusVisible === true,
    indicator: step?.indicator === true,
    screenshot:
      typeof step?.screenshot === "string" && image.test(step.screenshot) ? step.screenshot : null,
    sha256:
      typeof step?.sha256 === "string" && /^[a-f0-9]{64}$/.test(step.sha256) ? step.sha256 : null,
  }));
}
export function publicKeyboardGate(route, steps, blockedMutations) {
  const targets = publicKeyboardTargets(route);
  const expected = [
    ...targets.map((x) => ({ control: x.control, direction: "forward" })),
    ...targets
      .slice(0, -1)
      .reverse()
      .map((x) => ({ control: x.control, direction: "reverse" })),
  ];
  const safe = sanitizeKeyboardSteps(steps);
  const prefix = route === "/login" ? "screenshots/SYS01_" : "screenshots/SYS02_";
  const valid =
    targets.length > 0 &&
    blockedMutations === 0 &&
    Array.isArray(steps) &&
    steps.length === expected.length &&
    safe.length === expected.length &&
    safe.every(
      (step, i) =>
        step.control === expected[i].control &&
        step.direction === expected[i].direction &&
        step.target &&
        step.named &&
        step.visible &&
        step.focusVisible &&
        step.indicator &&
        step.sha256 &&
        step.screenshot?.startsWith(prefix) &&
        step.screenshot.endsWith(`_${step.direction}_${step.control}.png`),
    );
  return valid ? [] : ["Percurso público de teclado incompleto ou inválido"];
}

export function publicKeyboardResetGate(state) {
  const valid =
    state &&
    Number.isInteger(state.http) &&
    state.http >= 200 &&
    state.http < 300 &&
    state.sameUrl === true &&
    state.empty === true &&
    state.controlsReady === true &&
    state.publicStateValid === true &&
    state.pageErrors === 0 &&
    Number.isFinite(state.scrollX) &&
    Math.abs(state.scrollX) <= 1 &&
    Number.isFinite(state.scrollY) &&
    Math.abs(state.scrollY) <= 1;
  return valid ? [] : ["Estado inicial público não restaurado após teclado"];
}

async function collectPublicKeyboard(page, item, output, images, mutationCount, runtimeErrors) {
  const targets = publicKeyboardTargets(item.path);
  const expectedUrl = page.url();
  const empty = await page.evaluate(() =>
    [...document.querySelectorAll("input")].every((e) => e.value === ""),
  );
  if (!empty) throw new Error("KEYBOARD_INITIAL_STATE_NOT_EMPTY");
  let reset;
  const observe = async (target) =>
    page.evaluate(({ selector, name }) => {
      const e = document.querySelector(selector);
      if (!e)
        return { target: false, named: false, visible: false, focusVisible: false, style: null };
      const s = getComputedStyle(e),
        r = e.getBoundingClientRect();
      const label =
        e.getAttribute("aria-label") ||
        [...(e.labels || [])].map((x) => x.textContent).join(" ") ||
        e.textContent ||
        "";
      let visible =
        r.width > 0 &&
        r.height > 0 &&
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= innerHeight &&
        r.right <= innerWidth;
      for (let n = e; n; n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.display === "none" || c.visibility !== "visible" || Number(c.opacity) <= 0)
          visible = false;
      }
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      visible = visible && (top === e || e.contains(top));
      return {
        target: document.activeElement === e,
        named: label.trim().replace(/\s+/g, " ") === name,
        visible,
        focusVisible: e.matches(":focus-visible"),
        style: [
          s.outlineStyle,
          s.outlineWidth,
          s.outlineColor,
          s.boxShadow,
          s.borderTopColor,
          s.borderRightColor,
          s.borderBottomColor,
          s.borderLeftColor,
          s.borderTopWidth,
          s.borderRightWidth,
          s.borderBottomWidth,
          s.borderLeftWidth,
          s.textDecorationLine,
          s.textDecorationStyle,
          s.textDecorationColor,
        ].join("|"),
      };
    }, target);
  const baseline = new Map();
  for (const target of targets) baseline.set(target.control, (await observe(target)).style);
  const steps = [];
  const sequence = [
    ...targets.map((x) => ({ ...x, direction: "forward" })),
    ...targets
      .slice(0, -1)
      .reverse()
      .map((x) => ({ ...x, direction: "reverse" })),
  ];
  try {
    for (const target of sequence) {
      await page.keyboard.press(target.direction === "forward" ? "Tab" : "Shift+Tab");
      await page.waitForTimeout(180);
      if (new URL(page.url()).pathname !== item.path) throw new Error("KEYBOARD_ROUTE_CHANGED");
      const state = await observe(target);
      const bytes = await page.screenshot({ fullPage: false, animations: "disabled" });
      const filename = `screenshots/${safeName(item)}_keyboard_${target.direction}_${target.control}.png`;
      const sha256 = hash(bytes);
      writeFileSync(join(output, filename), bytes);
      images.push({ filename, sha256 });
      steps.push({
        control: target.control,
        direction: target.direction,
        target: state.target,
        named: state.named,
        visible: state.visible,
        focusVisible: state.focusVisible,
        indicator:
          state.style !== null &&
          baseline.get(target.control) !== null &&
          state.style !== baseline.get(target.control),
        screenshot: filename,
        sha256,
      });
    }
  } finally {
    const response = await page.reload({ waitUntil: "domcontentloaded", timeout: 12000 });
    await page.waitForTimeout(550);
    await page.evaluate(() => window.scrollTo(0, 0));
    const state = await page.evaluate(
      ({ expectedUrl, targets }) => ({
        sameUrl: window.location.href === expectedUrl,
        empty: [...document.querySelectorAll("input")].every((e) => e.value === ""),
        controlsReady: targets.every(({ selector, name }) => {
          const nodes = document.querySelectorAll(selector),
            e = nodes[0];
          if (nodes.length !== 1 || !e || e.disabled) return false;
          const label =
            e.getAttribute("aria-label") ||
            [...(e.labels || [])].map((x) => x.textContent).join(" ") ||
            e.textContent ||
            "";
          return label.trim().replace(/\s+/g, " ") === name;
        }),
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        lang: document.documentElement.lang,
        h1: document.querySelectorAll("h1").length,
        overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        fontFamily: getComputedStyle(document.body).fontFamily,
      }),
      { expectedUrl, targets },
    );
    const http = response?.status() || 0,
      pageErrors = runtimeErrors();
    reset = {
      http,
      sameUrl: state.sameUrl,
      empty: state.empty,
      controlsReady: state.controlsReady,
      scrollX: state.scrollX,
      scrollY: state.scrollY,
      pageErrors,
      publicStateValid:
        publicGate({ http, lang: state.lang, h1: state.h1, overflow: state.overflow, pageErrors })
          .length === 0 && brandTypographyGate(state.fontFamily).length === 0,
    };
  }
  const safe = sanitizeKeyboardSteps(steps);
  const blockedMutations = mutationCount();
  return {
    scope: "PUBLIC_EMPTY_FORMS_ONLY",
    steps: safe,
    blockedMutations,
    reset,
    errors: [
      ...publicKeyboardGate(item.path, safe, blockedMutations),
      ...publicKeyboardResetGate(reset),
    ],
  };
}

export function publicGate({ http, lang, h1, overflow, pageErrors }) {
  const errors = [];
  if (http >= 400) errors.push("rota pública HTTP " + http);
  if (lang !== "pt-BR") errors.push("html lang diferente de pt-BR");
  if (h1 !== 1) errors.push("página pública requer exatamente um H1");
  if (overflow > 2) errors.push("rolagem horizontal em página pública");
  if (pageErrors > 0) errors.push("erro JavaScript não tratado");
  return errors;
}
export function publicA11yGate(scan) {
  if (
    !scan?.axeVersion ||
    !Array.isArray(scan.violations) ||
    !Array.isArray(scan.incomplete) ||
    !Array.isArray(scan.passes)
  ) {
    return ["auditoria axe-core pública não executada"];
  }
  return scan.violations.map((v) => `WCAG ${v.id}: ${v.nodes} ocorrências automáticas`);
}
export function contrastAssessment(scan) {
  if (!scan?.axeVersion) return "NAO_VERIFICADO";
  if ((scan.violations || []).some((v) => v.id === "color-contrast")) return "FAIL_AUTOMATIZADO";
  if ((scan.incomplete || []).some((v) => v.id === "color-contrast"))
    return "NAO_VERIFICADO_REVISAO_MANUAL";
  if ((scan.passes || []).some((v) => v.id === "color-contrast")) return "PASS_AUTOMATIZADO";
  return "NAO_APLICAVEL_SEM_TEXTO";
}

export function sanitizeContrastDiagnostics(items) {
  if (!Array.isArray(items)) return [];
  const allowedReasons = new Set([
    "bgGradient",
    "bgImage",
    "bgOverlap",
    "fgAlpha",
    "elmPartiallyObscured",
    "elmPartiallyObscuring",
    "outsideViewport",
    "pseudoContent",
    "colorParse",
    "shortTextContent",
    "equalRatio",
    "undetermined",
  ]);
  const safeTag = (x) =>
    /^[a-z][a-z0-9-]{0,22}$/i.test(String(x || "")) ? String(x).toLowerCase() : "desconhecido";
  const safeColor = (x) => {
    const value = String(x || "").trim();
    if (/^(transparent|#[a-f0-9]{3,8})$/i.test(value)) return value;
    if (/^(rgb|rgba|oklch|oklab|color)\([0-9.a-z\s,%+\x2f-]{1,90}\)$/i.test(value)) return value;
    return "NAO_INFORMADO";
  };
  const safeNumber = (x) => {
    const v = Number.parseFloat(String(x));
    return Number.isFinite(v) && v >= 0 && v <= 1000 ? v : null;
  };
  return items.slice(0, 24).map((item) => ({
    tag: safeTag(item?.tag),
    color: safeColor(item?.color),
    fontSizePx: safeNumber(item?.fontSize),
    fontWeight: safeNumber(item?.fontWeight),
    opacity: safeNumber(item?.opacity),
    reasonCodes: (Array.isArray(item?.reasonCodes) ? item.reasonCodes : [])
      .filter((x) => allowedReasons.has(x))
      .slice(0, 8),
    layers: (Array.isArray(item?.layers) ? item.layers : []).slice(0, 7).map((layer) => ({
      tag: safeTag(layer?.tag),
      backgroundColor: safeColor(layer?.backgroundColor),
      hasBackgroundImage: layer?.hasBackgroundImage === true,
      hasBackdropFilter: layer?.hasBackdropFilter === true,
      opacity: safeNumber(layer?.opacity),
    })),
  }));
}

const toLinear = (channel) => {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const luminance = (rgb) =>
  0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);

export function wcagContrastRatio(foregroundRgb, backgroundRgb) {
  const validColor = (rgb) =>
    Array.isArray(rgb) &&
    rgb.length === 3 &&
    rgb.every((v) => Number.isFinite(v) && v >= 0 && v <= 255);
  if (!validColor(foregroundRgb) || !validColor(backgroundRgb)) return null;
  const a = luminance(foregroundRgb);
  const b = luminance(backgroundRgb);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function measureRenderedTextContrast(before, after, nodes, { minPixels = 5 } = {}) {
  const validImage = (img) =>
    Number.isInteger(img?.width) &&
    Number.isInteger(img?.height) &&
    img.width > 0 &&
    img.height > 0 &&
    img.data?.length === img.width * img.height * 4;
  const pairValid = [
    validImage(before),
    validImage(after),
    before?.width === after?.width,
    before?.height === after?.height,
  ].every(Boolean);
  return (Array.isArray(nodes) ? nodes : []).map((node) => {
    const unresolved = (reason) => ({
      status: "NAO_VERIFICADO",
      reason,
      minimumRatio: null,
      sampleCount: 0,
    });
    const rect = node?.rect;
    const opacity = Number(node?.effectiveOpacity);
    const fg = node?.foregroundRgb;
    if (!pairValid) return unresolved("DIFERENCA_DE_DIMENSOES_PNG");
    if (!rect) return unresolved("RETANGULO_INVALIDO");
    const coords = [rect.x, rect.y, rect.width, rect.height];
    if (!coords.every(Number.isFinite)) return unresolved("RETANGULO_INVALIDO");
    if (rect.width <= 0 || rect.height <= 0) return unresolved("RETANGULO_INVALIDO");
    if (!Array.isArray(fg) || fg.length !== 3) return unresolved("COR_OU_OPACIDADE_INVALIDA");
    if (fg.some((v) => !Number.isFinite(v) || v < 0 || v > 255))
      return unresolved("COR_OU_OPACIDADE_INVALIDA");
    if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1)
      return unresolved("COR_OU_OPACIDADE_INVALIDA");
    const x0 = Math.max(0, Math.floor(rect.x));
    const x1 = Math.min(before.width, Math.ceil(rect.x + rect.width));
    const y0 = Math.max(0, Math.floor(rect.y));
    const y1 = Math.min(before.height, Math.ceil(rect.y + rect.height));
    if (x0 >= x1 || y0 >= y1 || rect.x < 0 || rect.y < 0) return unresolved("FORA_DO_VIEWPORT");
    if (rect.x + rect.width > before.width || rect.y + rect.height > before.height)
      return unresolved("FORA_DO_VIEWPORT");
    let sampleCount = 0;
    let changedPixels = 0;
    let minimumRatio = Infinity;
    // Somente pixels centrais de glifo condizentes com cor+opacidade declarada.
    // Bordas antialiasadas e sobreposições não são aprovadas por aproximação.
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * before.width + x) * 4;
        if (before.data[i + 3] !== 255 || after.data[i + 3] !== 255) continue;
        const background = [after.data[i], after.data[i + 1], after.data[i + 2]];
        const actual = [before.data[i], before.data[i + 1], before.data[i + 2]];
        const predicted = fg.map((v, c) => Math.round(v * opacity + background[c] * (1 - opacity)));
        const delta = Math.max(...actual.map((v, c) => Math.abs(v - background[c])));
        if (delta < 12) continue;
        changedPixels++;
        if (Math.max(...actual.map((v, c) => Math.abs(v - predicted[c]))) > 12) continue;
        const ratio = wcagContrastRatio(predicted, background);
        if (ratio === null) return unresolved("COR_INVALIDA");
        sampleCount++;
        minimumRatio = Math.min(minimumRatio, ratio);
      }
    }
    // Fonte pequena antialiasada pode ter poucos núcleos opacos (<8%).
    // Exigir quantidade absoluta e até 2% de correspondência, limitado a 30 pixels.
    // Assim 1-2 pixels isolados em área grande não fabricam aprovação.
    const minimumCorePixels = Math.max(minPixels, Math.min(30, Math.ceil(changedPixels * 0.02)));
    if (sampleCount < minimumCorePixels)
      return {
        ...unresolved("GLIFOS_SEM_AMOSTRAGEM_CONFIAVEL"),
        changedPixels,
        sampleCount,
        minimumCorePixels,
      };
    const largeBySize = Number(node.fontSizePx) >= 24;
    const largeBold = Number(node.fontSizePx) >= 18.66 && Number(node.fontWeight) >= 700;
    const requiredRatio = largeBySize || largeBold ? 3 : 4.5;
    return {
      status: minimumRatio >= requiredRatio ? "PASS_AA_PIXEL" : "FAIL_AA_PIXEL",
      minimumRatio: Math.round(minimumRatio * 10000) / 10000,
      requiredRatio,
      sampleCount,
      changedPixels,
      minimumCorePixels,
    };
  });
}

export function pixelContrastDecision(measured, expectedCount) {
  if (!Array.isArray(measured) || measured.length !== expectedCount) return "NAO_VERIFICADO";
  if (!Number.isInteger(expectedCount) || expectedCount < 1) return "NAO_VERIFICADO";
  if (measured.some((x) => x.status === "FAIL_AA_PIXEL")) return "FAIL_AA_PIXEL_PUBLICO";
  if (measured.some((x) => x.status !== "PASS_AA_PIXEL")) return "NAO_VERIFICADO";
  return "PASS_AA_PIXEL_PUBLICO";
}

export function classifyProtected({ pathname, text }) {
  if (pathname === "/login") return "ACESSO_NEGADO_REDIRECIONADO";
  if (/acesso negado|sem permissão|não tem acesso|faça login|sessão expirada/i.test(text)) {
    return "ACESSO_NEGADO_EXPLICITO";
  }
  return "NAO_VERIFICADO_SESSAO_REAL";
}
function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}
function safeName(item) {
  return item.id + "_" + item.width + "_" + item.theme;
}
export function publicScaleCollectionPass(rows) {
  const expected = publicScaleCases(),
    key = (row) => `${row.id}:${row.width}:${row.theme}:${row.mode}`;
  return (
    Array.isArray(rows) &&
    rows.length === expected.length &&
    new Set(rows.map(key)).size === expected.length &&
    rows.every(
      (row) =>
        expected.some((item) => key(item) === key(row)) &&
        row.outcome === "PASS_PUBLIC_SCALE" &&
        publicScaleGate(row).length === 0,
    )
  );
}
async function requiredPublicScaleTargets(page, item) {
  const visible = async (locator) => (await locator.count()) === 1 && (await locator.isVisible());
  const titles = {
    SYS01: "Bem-vindo de volta",
    SYS02: "Recuperar acesso",
    SYS03: "Definir nova senha",
  };
  if (!(await visible(page.getByRole("heading", { level: 1, name: titles[item.id], exact: true }))))
    return false;
  if (item.id === "SYS01")
    return (
      (await visible(page.getByLabel("E-mail", { exact: true }))) &&
      (await visible(page.getByLabel("Senha", { exact: true }))) &&
      (await visible(page.locator('label[for="login-email"]'))) &&
      (await visible(page.locator('label[for="login-senha"]'))) &&
      (await visible(page.getByRole("link", { name: "Esqueci minha senha", exact: true }))) &&
      (await visible(page.getByRole("button", { name: "Mostrar senha", exact: true }))) &&
      (await visible(page.getByRole("button", { name: "Entrar", exact: true })))
    );
  if (!(await visible(page.getByRole("link", { name: "Voltar ao login", exact: true }))))
    return false;
  if (item.id === "SYS02")
    return (
      (await visible(page.getByLabel("E-mail", { exact: true }))) &&
      (await visible(page.locator('label[for="esqueci-email"]'))) &&
      (await visible(page.getByRole("button", { name: "Enviar link", exact: true })))
    );
  return (
    (await visible(
      page.locator("p").filter({ hasText: /^\s*Validando link de redefinição(?:…|\.\.\.)\s*$/ }),
    )) ||
    ((await visible(page.getByRole("alert"))) &&
      (await visible(page.getByRole("link", { name: "Solicitar novo link", exact: true }))))
  );
}
export function capturePublicScaleDOM(phase) {
  if (!["before", "after"].includes(phase)) throw Error("PUBLIC_SCALE_PHASE");
  const visible = (el) =>
    el instanceof HTMLElement &&
    el.namespaceURI === "http://www.w3.org/1999/xhtml" &&
    !el.closest(".sr-only") &&
    el.isConnected &&
    el.getClientRects().length > 0 &&
    el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const candidates = () => {
    const nodes = new Set(),
      walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode,
        el = node.parentElement;
      if (
        node.textContent.trim() &&
        visible(el) &&
        el.closest("h1,h2,p,label,a,button,span,li") &&
        !el.closest("script,style,svg")
      )
        nodes.add(el);
    }
    for (const control of document.querySelectorAll("input,button,a,select,textarea"))
      if (visible(control)) nodes.add(control);
    return [...nodes];
  };
  if (phase === "before") {
    const nodes = candidates();
    window.__contaosScaleProbe = nodes;
    return {
      root: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      fonts: nodes.map((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
    };
  }
  const nodes = window.__contaosScaleProbe || [];
  const current = candidates();
  const sameSample = current.length === nodes.length && nodes.every((el) => current.includes(el));
  let clipped = 0;
  for (const el of nodes) {
    if (!visible(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(el);
    const textRects = [
      ...range.getClientRects(),
      ...(el.matches("input,button,a,select,textarea") ? [el.getBoundingClientRect()] : []),
    ].filter((r) => r.width > 0 && r.height > 0);
    if (el instanceof HTMLInputElement && el.scrollHeight > el.clientHeight + 1) clipped += 1;
    let ancestor = el;
    while (ancestor) {
      const style = getComputedStyle(ancestor),
        rect = ancestor.getBoundingClientRect();
      const x = /^(hidden|clip)$/.test(style.overflowX),
        y = /^(hidden|clip)$/.test(style.overflowY);
      const left = rect.left + ancestor.clientLeft,
        top = rect.top + ancestor.clientTop;
      if (
        textRects.some(
          (r) =>
            (x && (r.left < left - 1 || r.right > left + ancestor.clientWidth + 1)) ||
            (y && (r.top < top - 1 || r.bottom > top + ancestor.clientHeight + 1)),
        )
      ) {
        clipped += 1;
        break;
      }
      ancestor = ancestor.parentElement;
    }
  }
  return {
    pathname: location.pathname,
    origin: location.origin,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll("h1").length,
    root: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
    overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    clipped,
    formsEmpty: [...document.querySelectorAll("input")].every((el) => el.value === ""),
    fonts: nodes.map((el, index) => ({
      index,
      after: Number.parseFloat(getComputedStyle(el).fontSize),
      matched: sameSample && visible(el),
    })),
    sampleAfter: current.length,
  };
}
export async function collectPublicScale(browser, { output, base, images }) {
  const rows = [];
  mkdirSync(join(output, "screenshots"), { recursive: true });
  for (const item of publicScaleCases()) {
    let context,
      blockedMutations = 0,
      pageErrors = 0;
    const record = { ...item };
    try {
      context = await browser.newContext({
        viewport: { width: item.width, height: 900 },
        locale: "pt-BR",
        timezoneId: "America/Sao_Paulo",
        colorScheme: item.theme,
        reducedMotion: "reduce",
        permissions: [],
      });
      await context.addInitScript(
        ({ theme }) => {
          try {
            localStorage.setItem("theme", theme);
          } catch {
            /* Sem sessão. */
          }
          const apply = () => document.documentElement.classList.toggle("dark", theme === "dark");
          if (document.documentElement) apply();
          else document.addEventListener("DOMContentLoaded", apply, { once: true });
        },
        { theme: item.theme },
      );
      await context.route("https://gklhhhyosgasnyoxlrui.supabase.co/**", (route) => {
        if (!["GET", "HEAD", "OPTIONS"].includes(route.request().method())) {
          blockedMutations += 1;
          return route.abort("blockedbyclient");
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", () => {
        pageErrors += 1;
      });
      const response = await page.goto(base + item.route, {
        waitUntil: "domcontentloaded",
        timeout: 12000,
      });
      await page.waitForTimeout(550);
      record.http = response?.status() || 0;
      const requiredBefore = await requiredPublicScaleTargets(page, item);
      const before = await page.evaluate(capturePublicScaleDOM, "before");
      record.rootBefore = before.root;
      record.sampleBefore = before.fonts.length;
      if (item.mode === "TEXT_200") {
        await page.evaluate((font) => {
          if (!Number.isFinite(font) || font <= 0) throw Error("PUBLIC_SCALE_ROOT");
          document.documentElement.style.setProperty("font-size", `${font * 2}px`, "important");
        }, before.root);
      }
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const after = await page.evaluate(capturePublicScaleDOM, "after");
      record.pathExact = after.pathname === item.route && after.origin === new URL(base).origin;
      record.langPtBr = after.lang === "pt-BR";
      record.h1 = after.h1;
      record.rootAfter = after.root;
      record.overflowX = after.overflowX;
      record.clipped = after.clipped;
      record.formsEmpty = after.formsEmpty;
      record.sampleAfter = after.sampleAfter;
      record.measurements = after.fonts.map((x) => ({ ...x, before: before.fonts[x.index] }));
      record.targetsComplete = requiredBefore && (await requiredPublicScaleTargets(page, item));
      if (record.pathExact) {
        const bytes = await page.screenshot({ fullPage: true, animations: "disabled" });
        record.screenshot = `screenshots/${item.id}_${item.width}_${item.theme}_${item.mode}.png`;
        record.sha256 = hash(bytes);
        writeFileSync(join(output, record.screenshot), bytes);
        images.push({ filename: record.screenshot, sha256: record.sha256 });
      }
    } catch {
      pageErrors += 1;
    } finally {
      if (context) {
        try {
          await context.close();
        } catch {
          pageErrors += 1;
        }
      }
      record.blockedMutations = blockedMutations;
      record.pageErrors = pageErrors;
      const safe = sanitizePublicScaleRecord(record),
        errors = publicScaleGate(safe);
      rows.push({
        ...safe,
        errors,
        outcome: errors.length ? "FAIL_PUBLIC_SCALE" : "PASS_PUBLIC_SCALE",
      });
    }
  }
  const report = {
    schema: "contaos.public-scale.v1",
    scope: "PUBLIC_NO_CREDENTIALS_ONLY",
    native_browser_zoom: "NAO_VERIFICADO",
    wcag_full_certification: "NAO_VERIFICADO",
    cases: rows.length,
    rows,
  };
  const file = join(output, "public-scale.json");
  writeFileSync(file, JSON.stringify(report, null, 2) + "\n");
  images.push({ filename: "public-scale.json", sha256: hash(readFileSync(file)) });
  return rows;
}
export function phase2DeltaCases() {
  return ["V114", "V120"].flatMap((surface) =>
    WIDTHS.flatMap((width) => THEMES.map((theme) => ({ surface, width, theme }))),
  );
}
function deltaObject(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    isProxy(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    return false;
  const own = Reflect.ownKeys(value),
    ds = Object.getOwnPropertyDescriptors(value);
  return (
    own.length === keys.length &&
    own.every(
      (k) =>
        typeof k === "string" &&
        keys.includes(k) &&
        Object.hasOwn(ds[k], "value") &&
        ds[k].enumerable,
    )
  );
}
export function phase2DeltaReportValid(value) {
  if (
    !deltaObject(value, [
      "schema",
      "mode",
      "headSha",
      "sourceTree",
      "styleSha256",
      "sourceHashes",
      "records",
      "complete",
    ])
  )
    return false;
  if (
    value.schema !== "contaos.phase2.offline-visual-delta.v1" ||
    value.mode !== "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS" ||
    value.complete !== true ||
    typeof value.headSha !== "string" ||
    typeof value.sourceTree !== "string" ||
    typeof value.styleSha256 !== "string" ||
    !/^([a-f0-9]{40})$/.test(value.headSha) ||
    !/^([a-f0-9]{40})$/.test(value.sourceTree) ||
    !/^([a-f0-9]{64})$/.test(value.styleSha256) ||
    !deltaObject(value.sourceHashes, ["V114", "V120", "LIST", "ADAPTER"]) ||
    !Object.values(value.sourceHashes).every(
      (h) => typeof h === "string" && /^[a-f0-9]{64}$/.test(h),
    )
  )
    return false;
  const records = value.records;
  if (
    isProxy(records) ||
    !Array.isArray(records) ||
    Object.getPrototypeOf(records) !== Array.prototype ||
    records.length !== 16 ||
    Reflect.ownKeys(records).length !== 17
  )
    return false;
  const expected = new Set(phase2DeltaCases().map((r) => `${r.surface}/${r.width}/${r.theme}`)),
    seen = new Set(),
    ds = Object.getOwnPropertyDescriptors(records);
  for (let i = 0; i < 16; i++) {
    if (!Object.hasOwn(ds[i] || {}, "value")) return false;
    const r = ds[i].value;
    if (
      !deltaObject(r, [
        "surface",
        "width",
        "theme",
        "headingCount",
        "themeVerified",
        "overflow",
        "controls44",
        "keyboardVerified",
        "reloadVerified",
        "backVerified",
        "alerts",
        "pageErrors",
        "externalRequests",
        "screenshot",
        "sha256",
        "status",
      ])
    )
      return false;
    if (typeof r.surface !== "string" || typeof r.width !== "number" || typeof r.theme !== "string")
      return false;
    const key = `${r.surface}/${r.width}/${r.theme}`;
    if (
      !expected.has(key) ||
      seen.has(key) ||
      r.headingCount !== 1 ||
      r.themeVerified !== true ||
      !Number.isFinite(r.overflow) ||
      r.overflow < 0 ||
      r.overflow > 1 ||
      ["controls44", "keyboardVerified", "reloadVerified", "backVerified"].some(
        (k) => r[k] !== true,
      ) ||
      ["alerts", "pageErrors", "externalRequests"].some((k) => r[k] !== 0) ||
      r.status !== "PASS" ||
      r.screenshot !== `screenshots/${r.surface}_${r.width}_${r.theme}.png` ||
      typeof r.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(r.sha256)
    )
      return false;
    seen.add(key);
  }
  return seen.size === 16;
}

export function phase2DeltaFixtureFiles(root) {
  return {
    "client.ts":
      "export const C='44444444-4444-4444-8444-444444444444',O='11111111-1111-4111-8111-111111111111',K='22222222-2222-4222-8222-222222222222',A='33333333-3333-4333-8333-333333333333',P='55555555-5555-4555-8555-555555555555';\nconst vg={competencia:{id:C,id_contrato:K,id_organizacao:O,competencia_referencia:'2026-09-01',situacao:'aguardando_contratante',periodo_inicio:'2026-09-01',periodo_fim:'2026-09-30',data_limite:null,atualizado_em:'2026-11-11T12:00:00Z',percentual_conformidade:100,versao_pacote_atual:1,versao_registro:1},portao:{liberado:true,total:1,conformes_ou_na_validos:1,pendentes:0,nao_conformes:0,inconclusivos:0,em_analise:0,nao_conformidades_bloqueantes:0,percentual:100},blocking_summary:{pendentes:0,nao_conformes:0,inconclusivos:0,em_analise:0,nao_conformidades_bloqueantes:0,parecer_aprovado:true,analise_concluida_atual:true,aprovacao_apresentacao_atual:true},allowed_actions:{abrir_documentos:true,analisar:true,abrir_parecer:true,apresentar:false}};\nconst ap={id:A,id_competencia:C,id_contrato:K,id_organizacao:O,id_pacote:P,protocolo:'PROTOCOLO-SINTETICO-2026-09',forma_apresentacao:'Portal',apresentado_em:'2026-11-11T12:00:00Z',tipo:'apresentacao',numero_rodada:1};\nconst pk={id:P,id_competencia:C,id_contrato:K,id_organizacao:O,hash_pacote:'a'.repeat(64),numero:1,tipo:'apresentacao',status:'congelado',congelado_em:'2026-11-11T12:00:00Z'};\nconst item={id:'66666666-6666-4666-8666-666666666666',id_pacote:P,id_competencia:C,id_contrato:K,id_organizacao:O,entidade_tipo:'documento',entidade_id:A,versao_id:null,hash:'b'.repeat(64),ordem:1};\nexport const supabase={auth:{getUser:async()=>({data:{user:{id:'fixture-user'}},error:null})},rpc:(name:string)=>{if(name!=='obter_visao_geral_competencia')throw Error('UNEXPECTED_RPC');return{abortSignal:async()=>({data:vg,error:null,status:200})};},from:(table:string)=>{const values=table==='apresentacoes_contratante'?[ap]:table==='pacotes_competencia'?[pk]:table==='itens_pacote_competencia'?[item]:null;if(!values)throw Error('UNEXPECTED_TABLE');const result={data:values,count:values.length,error:null,status:200};const q:any={},filters:Record<string,unknown>={};for(const n of ['select','order','range','abortSignal'])q[n]=()=>q;q.eq=(key:string,value:unknown)=>{filters[key]=value;return q;};const check=()=>{if(filters.id_competencia!==C||filters.id_contrato!==K||filters.id_organizacao!==O)throw Error('FIXTURE_OWNERSHIP');return result;};q.maybeSingle=async()=>({...check(),data:values[0]});q.then=(resolve:any,reject:any)=>Promise.resolve().then(check).then(resolve,reject);return q;}};\n",
    "router.tsx":
      "import React from 'react';const navigate=({to}:any)=>{history.pushState({},'',to);dispatchEvent(new PopStateEvent('popstate'));};export const useNavigate=()=>navigate;export function Link({to,params,children,activeOptions,...props}:any){const href=Object.entries(params||{}).reduce((s,[k,v])=>s.replace('$'+k,String(v)),to);return <a href={href} {...props} onClick={e=>{e.preventDefault();navigate({to:href});}}>{children}</a>;}",
    "entry.tsx":
      "import React,{useState,useEffect}from'react';import{createRoot}from'react-dom/client';import{CompetenciaVisaoGeral}from'ROOT/src/components/competencias/CompetenciaVisaoGeral.tsx';import{CompetenciaProtocolo}from'ROOT/src/components/competencias/CompetenciaProtocolo.tsx';import{definirPreferenciaOrganizacao}from'ROOT/src/lib/organizacao/preferenciaOrganizacao.ts';import{C,O,A}from'./client';definirPreferenciaOrganizacao('fixture-user',O);function App(){const[path,setPath]=useState(location.pathname);useEffect(()=>{const cb=()=>setPath(location.pathname);addEventListener('popstate',cb);return()=>removeEventListener('popstate',cb);},[]);return path.includes('/apresentacoes/')?<CompetenciaProtocolo id={C} apresentacaoId={A}/>:<CompetenciaVisaoGeral id={C}/>;}createRoot(document.getElementById('root')!).render(<App/>);".replaceAll(
        "ROOT",
        root,
      ),
    "build.mjs":
      "import{existsSync}from'node:fs';import{resolve}from'node:path';const root=ROOT,dir=import.meta.dir;const r=await Bun.build({entrypoints:[dir+'/entry.tsx'],target:'browser',format:'esm',outdir:dir,plugins:[{name:'phase2-offline-transport',setup(b){b.onResolve({filter:/^@\\/integrations\\/supabase\\/client$/},()=>({path:dir+'/client.ts'}));b.onResolve({filter:/^@tanstack\\/react-router$/},()=>({path:dir+'/router.tsx'}));b.onResolve({filter:/^@\\//},args=>{const p=resolve(root,'src',args.path.slice(2));const found=[p+'.ts',p+'.tsx',p+'/index.ts',p+'/index.tsx'].find(existsSync);if(!found)throw Error('ALIAS_MISSING');return{path:found};});}}]});if(!r.success)throw Error('PHASE2_BUILD');".replace(
        "ROOT",
        JSON.stringify(root),
      ),
  };
}

export async function collectPhase2VisualDelta(browser, { base, output, headSha }) {
  let source;
  try {
    source = new URL(base);
  } catch {
    throw Error("PHASE2_INPUT");
  }
  if (
    source.protocol !== "http:" ||
    source.hostname !== "127.0.0.1" ||
    source.username ||
    source.password ||
    source.pathname !== "/" ||
    source.search ||
    source.hash ||
    typeof headSha !== "string" ||
    !/^[a-f0-9]{40}$/.test(headSha) ||
    typeof output !== "string"
  )
    throw Error("PHASE2_INPUT");
  const root = process.cwd();
  if (
    execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim() !== headSha
  )
    throw Error("PHASE2_SOURCE");
  const dir = mkdtempSync(join(tmpdir(), "contaos-phase2-delta-")),
    target = join(output, "phase2-delta");
  mkdirSync(join(target, "screenshots"), { recursive: true });
  const record = {
    schema: "contaos.phase2.offline-visual-delta.v1",
    mode: "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS",
    headSha,
    sourceTree: execFileSync("git", ["rev-parse", "HEAD^{tree}"], {
      cwd: root,
      encoding: "utf8",
    }).trim(),
    styleSha256: "",
    sourceHashes: {
      V114: hash(readFileSync(join(root, "src/components/competencias/CompetenciaVisaoGeral.tsx"))),
      V120: hash(readFileSync(join(root, "src/components/competencias/CompetenciaProtocolo.tsx"))),
      LIST: hash(
        readFileSync(join(root, "src/components/competencias/CompetenciaApresentacoesLista.tsx")),
      ),
      ADAPTER: hash(readFileSync(join(root, "src/lib/competencias/protocoloDados.ts"))),
    },
    records: [],
    complete: false,
  };
  let server;
  try {
    symlinkSync(join(root, "node_modules"), join(dir, "node_modules"), "dir");
    for (const [name, content] of Object.entries(phase2DeltaFixtureFiles(root)))
      writeFileSync(join(dir, name), content);
    execFileSync("bun", [join(dir, "build.mjs")], {
      cwd: root,
      timeout: 30000,
      maxBuffer: 262144,
      env: { PATH: process.env.PATH },
    });
    const js = readFileSync(join(dir, "entry.js"));
    const cssResponse = await fetch(base + "/src/styles.css?direct");
    if (!cssResponse.ok) throw Error("PHASE2_CSS");
    const css = Buffer.from(await cssResponse.arrayBuffer());
    if (css.length === 0 || css.length > 4194304) throw Error("PHASE2_CSS");
    record.styleSha256 = hash(css);
    const C = "44444444-4444-4444-8444-444444444444",
      A = "33333333-3333-4333-8333-333333333333",
      overview = "/competencias/" + C,
      detail = overview + "/apresentacoes/" + A;
    const html =
      '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script type="module" src="/entry.js"></script></body></html>';
    server = createServer((req, res) => {
      if (req.url === "/entry.js") {
        res.setHeader("content-type", "text/javascript");
        res.end(js);
      } else if (req.url === "/style.css") {
        res.setHeader("content-type", "text/css");
        res.end(css);
      } else if ([overview, detail].includes(req.url)) {
        res.setHeader("content-type", "text/html");
        res.end(html);
      } else if (req.url === "/favicon.ico") {
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = "http://127.0.0.1:" + server.address().port;
    for (const width of WIDTHS)
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          locale: "pt-BR",
          reducedMotion: "reduce",
          permissions: [],
        });
        let errors = 0,
          external = 0;
        try {
          await context.route("**/*", (route) => {
            if (new URL(route.request().url()).origin !== origin) {
              external++;
              return route.abort();
            }
            return route.continue();
          });
          await context.addInitScript((theme) => {
            const apply = () => document.documentElement.classList.toggle("dark", theme === "dark");
            if (document.documentElement) apply();
            else addEventListener("DOMContentLoaded", apply, { once: true });
          }, theme);
          const page = await context.newPage();
          page.on("pageerror", () => errors++);
          page.on("console", (m) => {
            if (m.type() === "error") errors++;
          });
          page.on("requestfailed", () => errors++);
          await page.goto(origin + overview, { waitUntil: "networkidle" });
          const link = page.getByRole("link", { name: "Abrir apresentação 1", exact: true });
          await link.waitFor();
          await link.focus();
          if (!(await link.evaluate((node) => document.activeElement === node)))
            throw Error("PHASE2_KEYBOARD");
          await link.press("Enter");
          await page.waitForURL(origin + detail);
          await page.reload({ waitUntil: "networkidle" });
          await page
            .getByRole("heading", { name: "Apresentação e protocolo", exact: true })
            .waitFor();
          await page
            .getByRole("heading", { name: "Itens preservados no pacote", exact: true })
            .waitFor();
          const back = page.getByRole("link", { name: "Voltar à competência", exact: true });
          await back.focus();
          if (!(await back.evaluate((node) => document.activeElement === node)))
            throw Error("PHASE2_KEYBOARD");
          const capture = async (surface) => {
            const metrics = await page.evaluate(
              ({ surface, theme }) => {
                const scope =
                  surface === "V114"
                    ? document.querySelector('section:has(a[href*="/apresentacoes/"])')
                    : document.querySelector("main");
                if (!scope) return null;
                const controls = [...scope.querySelectorAll("button,a")].filter(
                  (node) => node.getClientRects().length,
                );
                return {
                  headingCount: document.querySelectorAll("h1").length,
                  themeVerified:
                    document.documentElement.classList.contains("dark") === (theme === "dark"),
                  overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
                  controls44:
                    controls.length > 0 &&
                    controls.every((node) => node.getBoundingClientRect().height >= 43.9),
                  alerts: document.querySelectorAll('[role="alert"]').length,
                };
              },
              { surface, theme },
            );
            if (
              !metrics ||
              metrics.headingCount !== 1 ||
              !metrics.themeVerified ||
              metrics.overflow > 1 ||
              !metrics.controls44 ||
              metrics.alerts !== 0 ||
              errors !== 0 ||
              external !== 0
            )
              throw Error("PHASE2_RENDER");
            const screenshot = `screenshots/${surface}_${width}_${theme}.png`,
              bytes = await page.screenshot({ fullPage: true, animations: "disabled" });
            writeFileSync(join(target, screenshot), bytes);
            return {
              surface,
              width,
              theme,
              ...metrics,
              keyboardVerified: true,
              reloadVerified: true,
              backVerified: true,
              pageErrors: errors,
              externalRequests: external,
              screenshot,
              sha256: hash(bytes),
              status: "PASS",
            };
          };
          const protocol = await capture("V120");
          await page.goBack({ waitUntil: "networkidle" });
          await page.waitForURL(origin + overview);
          await page.reload({ waitUntil: "networkidle" });
          await page.getByRole("link", { name: "Abrir apresentação 1", exact: true }).waitFor();
          record.records.push(protocol, await capture("V114"));
        } finally {
          await context.close();
        }
      }
    record.complete = true;
    if (!phase2DeltaReportValid(record)) throw Error("PHASE2_MATRIX");
    console.log("PHASE2_DELTA_OFFLINE_PASS_16");
    return record;
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    const reportFile = join(target, "report.json");
    writeFileSync(reportFile, JSON.stringify(record, null, 2) + "\n");
    const sums = record.records.map((r) => r.sha256 + "  " + r.screenshot);
    sums.push(hash(readFileSync(reportFile)) + "  report.json");
    writeFileSync(join(target, "SHA256SUMS"), sums.join("\n") + "\n");
    rmSync(dir, { recursive: true, force: true });
  }
}

async function run() {
  const modulePath = process.env.CONTAOS_PLAYWRIGHT_MODULE;
  if (!modulePath) throw new Error("Playwright não instalado no executor independente.");
  const axeSource = process.env.CONTAOS_AXE_SOURCE_PATH;
  if (!axeSource || !existsSync(axeSource)) {
    throw new Error("axe-core pinado não encontrado no executor independente.");
  }
  const { chromium } = await import(pathToFileURL(resolve(modulePath)).href);
  const pngModule = process.env.CONTAOS_PNG_MODULE;
  if (!pngModule || !existsSync(pngModule)) {
    throw new Error("pngjs pinado não encontrado para medição conservadora de pixels.");
  }
  const { PNG } = createRequire(import.meta.url)(resolve(pngModule));
  const output = resolve(process.env.CONTAOS_TESTC_OUTPUT || "artifacts/testc-visual");
  const base = process.env.CONTAOS_TESTC_BASE_URL || "http://127.0.0.1:4173";
  const sha = process.env.CONTAOS_TESTC_HEAD_SHA || "NAO_INFORMADO";
  const screenshotDir = join(output, "screenshots");
  mkdirSync(screenshotDir, { recursive: true });
  const logs = [];
  const images = [];
  let scaleRows = [];
  const browser = await chromium.launch({ headless: true });
  const started = new Date().toISOString();
  try {
    for (const item of cases()) {
      const context = await browser.newContext({
        viewport: { width: item.width, height: 900 },
        locale: "pt-BR",
        timezoneId: "America/Sao_Paulo",
        colorScheme: item.theme,
        reducedMotion: "reduce",
        permissions: [],
      });
      await context.addInitScript(
        ({ theme }) => {
          try {
            localStorage.setItem("theme", theme);
          } catch {
            // Navegador isolado; não injeta autenticação.
          }
          const apply = () => {
            document.documentElement.classList.toggle("dark", theme === "dark");
          };
          if (document.documentElement) apply();
          else document.addEventListener("DOMContentLoaded", apply, { once: true });
        },
        { theme: item.theme },
      );
      let blockedMutations = 0;
      // O Teste C nunca deve enviar mutações ao Supabase.
      await context.route("https://gklhhhyosgasnyoxlrui.supabase.co/**", (route) => {
        if (!["GET", "HEAD", "OPTIONS"].includes(route.request().method())) {
          blockedMutations += 1;
          return route.abort("blockedbyclient");
        }
        return route.continue();
      });
      const page = await context.newPage();
      let errors = 0;
      page.on("pageerror", () => {
        errors += 1;
      });
      const record = {
        id: item.id,
        route: item.path,
        width: item.width,
        theme: item.theme,
        profile: "NAVEGADOR_SEM_SESSAO_HML",
        outcome: "NAO_VERIFICADO_SESSAO_REAL",
        publicAssertions: [],
        a11y: null,
        screenshot: null,
        screenshotSha256: null,
      };
      try {
        const response = await page.goto(base + item.path, {
          waitUntil: "domcontentloaded",
          timeout: 12000,
        });
        await page.waitForTimeout(550);
        const state = await page.evaluate(() => ({
          pathname: window.location.pathname,
          fontFamily: getComputedStyle(document.body).fontFamily,
          lang: document.documentElement.lang,
          h1: document.querySelectorAll("h1").length,
          overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
          text: (document.body?.innerText || "").slice(0, 1800),
          brand: [...document.querySelectorAll("img")].some((img) =>
            img.getAttribute("src")?.startsWith("/brand/"),
          ),
        }));
        const code = response?.status() || 0;
        if (item.public) {
          record.publicAssertions = publicGate({
            http: code,
            lang: state.lang,
            h1: state.h1,
            overflow: state.overflow,
            pageErrors: errors,
          });
          record.typography = { fontFamily: state.fontFamily };
          record.publicAssertions.push(...brandTypographyGate(state.fontFamily));
          let axeScan = null;
          try {
            await page.addScriptTag({ path: axeSource });
            axeScan = await page.evaluate(async () => {
              if (!window.axe) throw new Error("axe-core não injetado");
              const result = await window.axe.run(document, {
                runOnly: {
                  type: "tag",
                  values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
                },
              });
              // Relatar apenas IDs, impactos e contagens, nunca HTML, texto de campos ou tokens.
              const summary = (v) => ({
                id: v.id,
                impact: v.impact || "unknown",
                nodes: v.nodes.length,
              });
              const contrastNodes = result.incomplete
                .filter((rule) => rule.id === "color-contrast")
                .flatMap((rule) => rule.nodes)
                .map((node, index) => {
                  const checks = [...(node.any || []), ...(node.all || []), ...(node.none || [])];
                  const reasons = checks.map((check) => {
                    const message = String(check.message || "");
                    if (/gradient/i.test(message)) return "bgGradient";
                    if (/background image|image node/i.test(message)) return "bgImage";
                    if (/overlap/i.test(message)) return "bgOverlap";
                    if (/partially obscured/i.test(message)) return "elmPartiallyObscured";
                    if (/partially obscuring/i.test(message)) return "elmPartiallyObscuring";
                    if (/alpha|transparen/i.test(message)) return "fgAlpha";
                    if (/viewport/i.test(message)) return "outsideViewport";
                    if (/pseudo/i.test(message)) return "pseudoContent";
                    if (/short text/i.test(message)) return "shortTextContent";
                    if (/1:1 contrast/i.test(message)) return "equalRatio";
                    return "undetermined";
                  });
                  let el = null;
                  try {
                    const target = node.target?.[0];
                    if (typeof target === "string") el = document.querySelector(target);
                  } catch {
                    // Selectors de shadow root não são gravados nem expostos.
                  }
                  const style = el ? getComputedStyle(el) : null;
                  if (el) el.setAttribute("data-contaos-pixel-probe", String(index));
                  const rect = el?.getBoundingClientRect();
                  let effectiveOpacity = 1;
                  let opacityEl = el;
                  while (opacityEl) {
                    const value = Number.parseFloat(getComputedStyle(opacityEl).opacity);
                    if (!Number.isFinite(value)) {
                      effectiveOpacity = 0;
                      break;
                    }
                    effectiveOpacity *= value;
                    opacityEl = opacityEl.parentElement;
                  }
                  const foregroundColor = (() => {
                    if (!style?.color || !CSS.supports("color", style.color)) return null;
                    const canvas = document.createElement("canvas");
                    canvas.width = 1;
                    canvas.height = 1;
                    const ctx = canvas.getContext("2d", { willReadFrequently: true });
                    if (!ctx) return null;
                    ctx.clearRect(0, 0, 1, 1);
                    ctx.fillStyle = style.color;
                    ctx.fillRect(0, 0, 1, 1);
                    const px = [...ctx.getImageData(0, 0, 1, 1).data];
                    effectiveOpacity *= px[3] / 255;
                    return px.slice(0, 3);
                  })();
                  const layers = [];
                  let ancestor = el;
                  while (ancestor && layers.length < 7) {
                    const computed = getComputedStyle(ancestor);
                    layers.push({
                      tag: ancestor.tagName.toLowerCase(),
                      backgroundColor: computed.backgroundColor,
                      hasBackgroundImage: computed.backgroundImage !== "none",
                      hasBackdropFilter: computed.backdropFilter !== "none",
                      opacity: computed.opacity,
                    });
                    ancestor = ancestor.parentElement;
                  }
                  return {
                    tag: el?.tagName.toLowerCase() || "desconhecido",
                    color: style?.color,
                    fontSize: style?.fontSize,
                    fontWeight: style?.fontWeight,
                    opacity: style?.opacity,
                    reasonCodes: reasons,
                    probeId: el ? String(index) : null,
                    rect: rect
                      ? {
                          x: rect.left,
                          y: rect.top,
                          width: rect.width,
                          height: rect.height,
                        }
                      : null,
                    foregroundRgb: foregroundColor,
                    effectiveOpacity,
                    fontSizePx: Number.parseFloat(style?.fontSize || ""),
                    fontWeight: Number.parseFloat(style?.fontWeight || ""),
                    layers,
                  };
                });
              return {
                axeVersion: result.testEngine.version,
                violations: result.violations.map(summary),
                incomplete: result.incomplete.map(summary),
                passes: result.passes.map(summary),
                contrastNodes,
              };
            });
          } catch {
            // FAIL fechado; não esconder indisponibilidade da auditoria.
            axeScan = null;
          }
          record.publicAssertions.push(...publicA11yGate(axeScan));
          let pixelContrast = {
            status: "NAO_VERIFICADO",
            nodes: 0,
            pass: 0,
            fail: 0,
            inconclusive: 0,
            measurements: [],
          };
          if (axeScan?.contrastNodes?.length) {
            try {
              const originalPng = PNG.sync.read(
                await page.screenshot({ fullPage: false, animations: "disabled" }),
              );
              const overlay = await page.addStyleTag({
                content:
                  "[data-contaos-pixel-probe], [data-contaos-pixel-probe] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }",
              });
              let backgroundPng;
              try {
                backgroundPng = PNG.sync.read(
                  await page.screenshot({ fullPage: false, animations: "disabled" }),
                );
              } finally {
                await overlay.evaluate((node) => node.remove());
              }
              const measured = measureRenderedTextContrast(
                originalPng,
                backgroundPng,
                axeScan.contrastNodes,
              );
              const status = pixelContrastDecision(measured, axeScan.contrastNodes.length);
              pixelContrast = {
                status,
                nodes: measured.length,
                pass: measured.filter((x) => x.status === "PASS_AA_PIXEL").length,
                fail: measured.filter((x) => x.status === "FAIL_AA_PIXEL").length,
                inconclusive: measured.filter((x) => x.status === "NAO_VERIFICADO").length,
                measurements: measured,
              };
              if (status === "FAIL_AA_PIXEL_PUBLICO") {
                record.publicAssertions.push("WCAG 1.4.3: contraste por pixel abaixo do mínimo AA");
              }
            } catch {
              // Sem par de PNGs válido, não fabricar aprovação por amostragem.
              pixelContrast.status = "NAO_VERIFICADO";
            }
          }
          record.a11y = {
            engine: axeScan?.axeVersion || "NAO_EXECUTADO",
            contrast: contrastAssessment(axeScan),
            violations: axeScan?.violations || [],
            incomplete: axeScan?.incomplete || [],
            contrastDiagnostics: sanitizeContrastDiagnostics(axeScan?.contrastNodes),
            pixelContrast,
            scanCompleted: Boolean(axeScan),
          };
          if (publicKeyboardTargets(item.path).length) {
            try {
              record.keyboard = await collectPublicKeyboard(
                page,
                item,
                output,
                images,
                () => blockedMutations,
                () => errors,
              );
              record.publicAssertions.push(...record.keyboard.errors);
            } catch {
              record.keyboard = {
                scope: "PUBLIC_EMPTY_FORMS_ONLY",
                steps: [],
                blockedMutations,
                errors: ["Prova pública de teclado não concluída"],
              };
              record.publicAssertions.push(...record.keyboard.errors);
            }
          }
          record.outcome = record.publicAssertions.length ? "FAIL_PUBLICO" : "PASS_PUBLICO";
          record.brandAssetPresent = state.brand;
        } else {
          record.outcome = classifyProtected(state);
          if (item.requiresDrawer) {
            record.outcome = "NAO_VERIFICADO_DRAWER_SEM_SESSAO";
          }
        }
        // Somente capturas públicas ou de negação explícita; nunca de dados internos.
        const publicOrDenied = item.public || record.outcome.startsWith("ACESSO_NEGADO");
        if (publicOrDenied) {
          const bytes = await page.screenshot({ fullPage: true, animations: "disabled" });
          const relative = "screenshots/" + safeName(item) + ".png";
          writeFileSync(join(output, relative), bytes);
          record.screenshot = relative;
          record.screenshotSha256 = hash(bytes);
          images.push({ filename: relative, sha256: record.screenshotSha256 });
        }
      } catch {
        record.outcome = item.public ? "FAIL_PUBLICO" : "NAO_VERIFICADO_ERRO_NAVEGACAO";
        record.publicAssertions.push("navegação ou captura não concluída");
      } finally {
        logs.push(record);
        await context.close();
      }
    }
    scaleRows = await collectPublicScale(browser, { output, base, images });
    await collectPhase2VisualDelta(browser, { base, output, headSha: sha });
    images.push({
      filename: "phase2-delta/SHA256SUMS",
      sha256: hash(readFileSync(join(output, "phase2-delta/SHA256SUMS"))),
    });
  } finally {
    await browser.close();
  }
  const result = {
    schema: "contaos.teste-c.independente.v1",
    tested_sha: sha,
    offline_delta: {
      mode: "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS",
      cases: 16,
      report: "phase2-delta/report.json",
    },
    started_utc: started,
    finished_utc: new Date().toISOString(),
    browser_profile: "SEM CREDENCIAIS E SEM MOCK DE TENANT",
    no_backend_mutations: true,
    source: "GitHub Actions, checkout do SHA, ambiente local isolado",
    widths: WIDTHS,
    themes: THEMES,
    scenarios: ROUTES.length,
    combinations: cases().length,
    screenshots: images.filter((x) => x.filename.endsWith(".png")).length,
    public_pass: logs.filter((x) => x.outcome === "PASS_PUBLICO").length,
    public_fail: logs.filter((x) => x.outcome === "FAIL_PUBLICO").length,
    protected_no_session: logs.filter(
      (x) => !x.publicAssertions.length && !ROUTES.find((r) => r.id === x.id)?.public,
    ).length,
    public_keyboard_cases: logs.filter((x) => x.keyboard).length,
    public_keyboard_fail: logs.filter((x) => x.keyboard?.errors?.length).length,
    public_scale_cases: scaleRows.length,
    public_scale_expected_cases: publicScaleCases().length,
    public_scale_complete: publicScaleCollectionPass(scaleRows),
    public_scale_fail: scaleRows.filter((x) => x.outcome === "FAIL_PUBLIC_SCALE").length,
    public_scale_report: "public-scale.json",
    native_browser_zoom: "NAO_VERIFICADO",
    authenticated_e2e: "NAO_VERIFICADO",
    rls_ab_real: "NAO_VERIFICADO",
    upload_real: "NAO_VERIFICADO",
    reset_email_real: "NAO_VERIFICADO",
    contrast_measured: logs.some((x) => x.a11y?.scanCompleted)
      ? "AXE_AUTOMATIZADO_SOMENTE_PAGINAS_PUBLICAS"
      : "NAO_VERIFICADO",
    accessibility_engine: "axe-core@4.14.0",
    public_a11y_scanned: logs.filter((x) => x.a11y?.scanCompleted).length,
    public_wcag_violation_rules: logs.reduce((n, x) => n + (x.a11y?.violations?.length || 0), 0),
    public_wcag_incomplete_rules: logs.reduce((n, x) => n + (x.a11y?.incomplete?.length || 0), 0),
    public_contrast_unresolved_nodes: logs.reduce(
      (n, x) => n + (x.a11y?.contrastDiagnostics?.length || 0),
      0,
    ),
    public_pixel_contrast_pass: logs.reduce((n, x) => n + (x.a11y?.pixelContrast?.pass || 0), 0),
    public_pixel_contrast_fail: logs.reduce((n, x) => n + (x.a11y?.pixelContrast?.fail || 0), 0),
    public_pixel_contrast_inconclusive: logs.reduce(
      (n, x) => n + (x.a11y?.pixelContrast?.inconclusive || 0),
      0,
    ),
    wcag_full_certification: "NAO_VERIFICADO_EXIGE_SESSAO_REAL_E_REVISAO_MANUAL",
    verdict:
      logs.some((x) => x.outcome === "FAIL_PUBLICO") || !publicScaleCollectionPass(scaleRows)
        ? "FAIL"
        : "PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA",
    rows: logs,
  };
  const file = join(output, "relatorio.json");
  writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
  images.push({ filename: "relatorio.json", sha256: hash(readFileSync(file)) });
  writeFileSync(
    join(output, "SHA256SUMS"),
    images.map((x) => x.sha256 + "  " + x.filename).join("\n") + "\n",
  );
  console.log(
    "Teste C: " +
      result.verdict +
      ", " +
      result.combinations +
      " combinações, " +
      result.screenshots +
      " capturas; HML real NÃO VERIFICADO.",
  );
  if (result.verdict === "FAIL") process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch(() => {
    console.error("TESTE C FAIL: executor do navegador não concluiu; sem aprovação presumida.");
    process.exitCode = 1;
  });
}

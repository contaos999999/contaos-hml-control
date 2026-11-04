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
];
export function cases() {
  return ROUTES.flatMap((route) =>
    WIDTHS.flatMap((width) => THEMES.map((theme) => ({ ...route, width, theme }))),
  );
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
      // O Teste C nunca deve enviar mutações ao Supabase.
      await context.route("https://gklhhhyosgasnyoxlrui.supabase.co/**", (route) => {
        if (!["GET", "HEAD", "OPTIONS"].includes(route.request().method())) {
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
  } finally {
    await browser.close();
  }
  const result = {
    schema: "contaos.teste-c.independente.v1",
    tested_sha: sha,
    started_utc: started,
    finished_utc: new Date().toISOString(),
    browser_profile: "SEM CREDENCIAIS E SEM MOCK DE TENANT",
    no_backend_mutations: true,
    source: "GitHub Actions, checkout do SHA, ambiente local isolado",
    widths: WIDTHS,
    themes: THEMES,
    scenarios: ROUTES.length,
    combinations: cases().length,
    screenshots: images.length,
    public_pass: logs.filter((x) => x.outcome === "PASS_PUBLICO").length,
    public_fail: logs.filter((x) => x.outcome === "FAIL_PUBLICO").length,
    protected_no_session: logs.filter(
      (x) => !x.publicAssertions.length && !ROUTES.find((r) => r.id === x.id)?.public,
    ).length,
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
    verdict: logs.some((x) => x.outcome === "FAIL_PUBLICO")
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

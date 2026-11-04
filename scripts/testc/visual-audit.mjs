import { createHash } from "node:crypto";
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
  if ((scan.incomplete || []).some((v) => v.id === "color-contrast")) return "NAO_VERIFICADO_REVISAO_MANUAL";
  if ((scan.passes || []).some((v) => v.id === "color-contrast")) return "PASS_AUTOMATIZADO";
  return "NAO_APLICAVEL_SEM_TEXTO";
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
                runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
              });
              // Relatar apenas IDs, impactos e contagens, nunca HTML, texto de campos ou tokens.
              const summary = (v) => ({
                id: v.id,
                impact: v.impact || "unknown",
                nodes: v.nodes.length,
              });
              return {
                axeVersion: result.testEngine.version,
                violations: result.violations.map(summary),
                incomplete: result.incomplete.map(summary),
                passes: result.passes.map(summary),
              };
            });
          } catch {
            // FAIL fechado; não esconder indisponibilidade da auditoria.
            axeScan = null;
          }
          record.publicAssertions.push(...publicA11yGate(axeScan));
          record.a11y = {
            engine: axeScan?.axeVersion || "NAO_EXECUTADO",
            contrast: contrastAssessment(axeScan),
            violations: axeScan?.violations || [],
            incomplete: axeScan?.incomplete || [],
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

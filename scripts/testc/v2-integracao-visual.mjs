import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const competencia = "44444444-4444-4444-8444-444444444444";
const overview = "/competencias/" + competencia;
const diligencias = overview + "/diligencias";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function diligenciasVisualCases(widths, themes) {
  return widths.flatMap((width) => themes.map((theme) => ({ width, theme })));
}

export function diligenciasFixtureFiles(root, baseFixtures) {
  return {
    "base-client.ts": baseFixtures["client.ts"],
    "router.tsx": baseFixtures["router.tsx"],
    "build.mjs": baseFixtures["build.mjs"],
    "client.ts": `
import { C, O, K, supabase as baseline } from "./base-client";
export { C, O, K };

const comum = {
  id_competencia: C, id_organizacao: O, id_contrato: K,
  recebido_em: "2026-11-08T15:00:00Z", prazo_resposta: "2026-11-21",
  encerrado_em: null, versao_registro: 1,
};
const rodadas = [
  { ...comum, id: "77777777-7777-4777-8777-777777777777", numero_rodada: 2, status: "em_tratamento" },
  { ...comum, id: "88888888-8888-4888-8888-888888888888", numero_rodada: 1, status: "reapresentado" },
];

export const supabase = {
  ...baseline,
  auth: {
    ...baseline.auth,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  from(table: string) {
    if (table !== "ciclos_diligencia") return baseline.from(table);
    const scope = new Map<string, string>();
    const ordem: string[] = [];
    const query = {
      select() { return query; },
      eq(key: string, value: string) { scope.set(key, value); return query; },
      order(key: string, options: { ascending: boolean }) {
        if (options.ascending !== false) throw Error("ORDEM_V2");
        ordem.push(key);
        return query;
      },
      range(from: number, to: number) {
        if (from !== 0 || to !== 24) throw Error("PAGINACAO_V2");
        return query;
      },
      async abortSignal(signal: AbortSignal) {
        signal.throwIfAborted();
        if (scope.get("id_competencia") !== C || scope.get("id_contrato") !== K ||
            scope.get("id_organizacao") !== O || ordem.join(",") !== "numero_rodada,id") {
          throw Error("ESCOPO_V2");
        }
        if (new URLSearchParams(location.search).get("fixture") === "denied") {
          return { data: null, error: { code: "42501" }, status: 403, count: null };
        }
        return { data: rodadas, error: null, status: 200, count: rodadas.length };
      },
    };
    return query;
  },
};
`,
    "entry.tsx": `
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CompetenciaVisaoGeral } from ${JSON.stringify(root + "/src/components/competencias/CompetenciaVisaoGeral.tsx")};
import { DiligenciasCompetencia } from ${JSON.stringify(root + "/src/components/diligencias/DiligenciasCompetencia.tsx")};
import { definirPreferenciaOrganizacao } from ${JSON.stringify(root + "/src/lib/organizacao/preferenciaOrganizacao.ts")};
import { C, O } from "./client";

definirPreferenciaOrganizacao("fixture-user", O);
function ApresentacaoFixture() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const atualizar = () => setPath(location.pathname);
    window.addEventListener("popstate", atualizar);
    return () => window.removeEventListener("popstate", atualizar);
  }, []);
  return path.endsWith("/diligencias")
    ? <DiligenciasCompetencia id={C} />
    : <CompetenciaVisaoGeral id={C} />;
}
createRoot(document.getElementById("root")!).render(<ApresentacaoFixture />);
`,
  };
}

export async function collectDiligenciasVisual(
  browser,
  { base, output, headSha, widths, themes, baseFixtures },
) {
  const root = process.cwd();
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const source = new URL(base);
  if (
    source.protocol !== "http:" ||
    source.hostname !== "127.0.0.1" ||
    git("rev-parse", "HEAD") !== headSha
  ) {
    throw Error("TESTE_C_V2_SOURCE");
  }
  const dir = mkdtempSync(join(tmpdir(), "contaos-v2-testec-"));
  const target = join(output, "v2-diligencias");
  const cases = diligenciasVisualCases(widths, themes);
  const records = [];
  let server;

  try {
    mkdirSync(join(target, "screenshots"), { recursive: true });
    symlinkSync(join(root, "node_modules"), join(dir, "node_modules"), "dir");
    for (const [name, content] of Object.entries(diligenciasFixtureFiles(root, baseFixtures))) {
      writeFileSync(join(dir, name), content);
    }
    execFileSync("bun", [join(dir, "build.mjs")], {
      cwd: root,
      timeout: 30000,
      maxBuffer: 262144,
      env: { PATH: process.env.PATH },
    });
    const js = readFileSync(join(dir, "entry.js"));
    const response = await fetch(new URL("/src/styles.css?direct", source), {
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw Error("TESTE_C_V2_CSS");
    const css = Buffer.from(await response.arrayBuffer());
    if (css.length === 0 || css.length > 4194304) throw Error("TESTE_C_V2_CSS");
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/style.css"></head>
<body><div id="root"></div><script type="module" src="/entry.js"></script></body></html>`;
    server = createServer((request, reply) => {
      const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (path === "/entry.js") {
        reply.setHeader("content-type", "text/javascript");
        reply.end(js);
      } else if (path === "/style.css") {
        reply.setHeader("content-type", "text/css");
        reply.end(css);
      } else if (path === overview || path === diligencias) {
        reply.setHeader("content-type", "text/html");
        reply.end(html);
      } else {
        reply.statusCode = path === "/favicon.ico" ? 204 : 404;
        reply.end();
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = "http://127.0.0.1:" + server.address().port;

    for (const { width, theme } of cases) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: "pt-BR",
        reducedMotion: "reduce",
        permissions: [],
      });
      let externa = 0;
      let erros = 0;
      try {
        await context.route("**/*", (route) => {
          if (new URL(route.request().url()).origin === origin) return route.continue();
          externa++;
          return route.abort();
        });
        await context.addInitScript((value) => {
          const apply = () => document.documentElement.classList.toggle("dark", value === "dark");
          if (document.documentElement) apply();
          else document.addEventListener("DOMContentLoaded", apply, { once: true });
        }, theme);
        const page = await context.newPage();
        page.on("pageerror", () => erros++);
        await page.goto(origin + overview);
        const atalho = page.getByRole("link", { name: "Diligências", exact: true });
        await atalho.focus();
        if (!(await atalho.evaluate((element) => document.activeElement === element))) {
          throw Error("TESTE_C_V2_FOCO");
        }
        await atalho.press("Enter");
        await page.waitForURL(origin + diligencias);
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        await page.getByRole("heading", { name: "Rodada 1", exact: true }).waitFor();
        await page.reload();
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        const metrics = await page.evaluate(() => ({
          overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          dark: document.documentElement.classList.contains("dark"),
          titles: [...document.querySelectorAll("main li h2")].map(
            (element) => element.textContent,
          ),
        }));
        if (
          metrics.overflow > 1 ||
          metrics.dark !== (theme === "dark") ||
          metrics.titles.join(",") !== "Rodada 2,Rodada 1"
        ) {
          throw Error("TESTE_C_V2_LISTA");
        }
        const screenshot = "screenshots/V2-01_" + width + "_" + theme + ".png";
        const bytes = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, screenshot), bytes);
        await page.getByRole("link", { name: "Voltar à competência" }).click();
        await page.waitForURL(origin + overview);
        await page.goto(origin + diligencias + "?fixture=denied");
        await page.getByText(/não possui permissão para consultar as diligências/i).waitFor();
        if ((await page.getByRole("heading", { name: /Rodada \d/ }).count()) || erros || externa) {
          throw Error("TESTE_C_V2_ISOLAMENTO_FIXTURE");
        }
        records.push({
          width,
          theme,
          screenshot,
          sha256: digest(bytes),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          negacaoSemDados: true,
          overflow: metrics.overflow,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
      } finally {
        await context.close();
      }
    }
    if (cases.length !== 8 || records.length !== cases.length) throw Error("TESTE_C_V2_COBERTURA");
    const record = {
      schema: "contaos.v2-01.offline-visual.v1",
      mode: "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS",
      headSha,
      sourceTree: git("rev-parse", "HEAD^{tree}"),
      styleSha256: digest(css),
      sourceHashes: Object.fromEntries(
        [
          "src/routeTree.gen.ts",
          "src/components/competencias/CompetenciaVisaoGeral.tsx",
          "src/components/diligencias/DiligenciasCompetencia.tsx",
          "src/lib/diligencias/diligenciasDados.ts",
        ].map((file) => [file, digest(readFileSync(join(root, file)))]),
      ),
      complete: true,
      records,
    };
    const report = JSON.stringify(record, null, 2) + "\n";
    writeFileSync(join(target, "report.json"), report);
    writeFileSync(
      join(target, "SHA256SUMS"),
      [
        ...records.map((r) => r.sha256 + "  " + r.screenshot),
        digest(report) + "  report.json",
      ].join("\n") + "\n",
    );
    console.log("V2_01_OFFLINE_VISUAL_PASS_8");
    return record;
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
}

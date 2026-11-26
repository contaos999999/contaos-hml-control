import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const competencia = "44444444-4444-4444-8444-444444444444";
export const CICLO_V2_FIXTURE = "77777777-7777-4777-8777-777777777777";
export const APONTAMENTO_V2_FIXTURE = "abababab-abab-4bab-8bab-abababababab";
const cicloAnterior = "88888888-8888-4888-8888-888888888888";
const protocoloId = "33333333-3333-4333-8333-333333333333";
const cicloPath = "/diligencias/" + CICLO_V2_FIXTURE;
const itemPath = cicloPath + "/apontamentos/" + APONTAMENTO_V2_FIXTURE;
const protocoloPath = "/competencias/" + competencia + "/apresentacoes/" + protocoloId;
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
import { C, O, K, A, P, supabase as baseline } from "./base-client";
export { C, O, K, A };

const comum = {
  id_competencia: C, id_organizacao: O, id_contrato: K,
  recebido_em: "2026-11-08T15:00:00Z", prazo_resposta: "2026-11-21",
  encerrado_em: null, versao_registro: 1,
};
const rodadas = [
  { ...comum, id: "${CICLO_V2_FIXTURE}", numero_rodada: 2, status: "em_tratamento" },
  { ...comum, id: "${cicloAnterior}", numero_rodada: 1, status: "reapresentado" },
];
const chaves = { id_ciclo: rodadas[0].id, id_competencia: C, id_contrato: K, id_organizacao: O };
const pareceres = [{
  ...chaves, id: "99999999-9999-4999-8999-999999999999",
  recebido_em: comum.recebido_em, numero_documento: "PARECER-SINTETICO-02", data_emissao: "2026-11-07",
  resultado_geral: "Diligência", id_apresentacao: A,
  apresentacao: { id: A, id_competencia: C, id_contrato: K, id_organizacao: O },
}];
const apontamentos = [{
  ...chaves, id: "${APONTAMENTO_V2_FIXTURE}", fundamento: "Fundamento registrado no parecer",
  criado_em: comum.recebido_em, codigo: "AP-02",
  descricao: "Valor de serviço apontado nesta rodada", classificacao_sugerida: "Financeiro",
  status: "em_analise", severidade: "alta",
  valor_questionado: "9999999999999999.99", glosa_potencial: "0.00",
  valor_aceito: null, impacto_financeiro_estimado: "-0.01",
}];

const identificador = (n: number) => "46000000-0000-4000-8000-" + String(n).padStart(12, "0");
const arquivo = identificador(1);
const analise = identificador(2);
const tarefa = identificador(3);
const revisor = identificador(4);
const evento = identificador(5);
const documento = identificador(6);
const versao1 = identificador(7);
const versao2 = identificador(8);
const ref = { ...chaves, id_apontamento: apontamentos[0].id };
const hashVersao = "c".repeat(64);
const versao = (id: string, numero: number, criado: string) => ({
  id, id_organizacao: O, id_contrato: K, id_documento_contrato: null, id_documento_competencia: documento,
  numero_versao: numero, hash: hashVersao, criado_em: criado, documentoContrato: null,
  documentoCompetencia: { ...chaves, id: documento, titulo: "Comprovante da competência" },
});
const tabelas: Record<string, unknown[]> = {
  analises_apontamentos: [{ ...ref, id: analise, classificacao: "inconclusivo",
    fundamento: "Análise documentada para revisão", evidencias: [{ id_versao_documento: versao1 }],
    criado_em: comum.recebido_em }],
  tarefas_diligencia: [{ ...ref, id: tarefa, descricao: "Conferir a versão juntada", id_evidencia_versao_documento: versao2 }],
  eventos_auditoria: [{ id: evento, id_organizacao: O, id_usuario: revisor, id_entidade: tarefa,
    entidade: "tarefas_diligencia", evento: "SolucaoTarefaDiligenciaRevisada",
    criado_em: "2026-11-12T14:00:00Z", depois: { aprovada: true, fundamento: "Conferência humana registrada", revisor } }],
  desfechos_apontamentos: [],
  versoes_documento: [versao(versao1, 1, "2026-11-09T12:00:00Z"), versao(versao2, 2, "2026-11-12T12:00:00Z")],
  itens_pacote_competencia: [{ ...chaves, id: identificador(9), id_pacote: P,
    entidade_tipo: "documento_competencia", entidade_id: documento, versao_id: versao1, hash: hashVersao }],
};

export const supabase = {
  ...baseline,
  auth: {
    ...baseline.auth,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  rpc(name: string, args: Record<string, string>) {
    if (name !== "obter_fonte_apontamento_contratante") return baseline.rpc(name);
    if (args.p_id_ciclo !== rodadas[0].id || args.p_id_apontamento !== apontamentos[0].id)
      throw Error("ESCOPO_ORIGEM_APONTAMENTO");
    return { async abortSignal(signal: AbortSignal) {
      signal.throwIfAborted();
      return { data: { ...ref, estado: "REGISTRADA", fonte: { id_parecer: pareceres[0].id,
        id_arquivo: arquivo, id_apresentacao: A, nome_original: "parecer-de-origem-02.pdf",
        numero_documento: pareceres[0].numero_documento, arquivo_sha256: "a".repeat(64),
        pagina: 3, trecho: "Trecho do parecer de origem" } }, error: null, status: 200 };
    } };
  },
  from(table: string) {
    if (Object.hasOwn(tabelas, table) && (table !== "itens_pacote_competencia" || location.pathname === "${itemPath}")) {
      const filtros = new Map<string, string>();
      const listas = new Map<string, string[]>();
      let signal: AbortSignal | undefined;
      const consulta = {
        select() { return consulta; },
        eq(chave: string, valor: string) { filtros.set(chave, valor); return consulta; },
        in(chave: string, valores: string[]) { listas.set(chave, valores); return consulta; },
        order() { return consulta; },
        limit() { return consulta; },
        abortSignal(valor: AbortSignal) { signal = valor; return consulta; },
        then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
          return Promise.resolve().then(() => {
            signal?.throwIfAborted();
            if (filtros.get("id_organizacao") !== O) throw Error("ESCOPO_EVIDENCIAS_ORG");
            if (table === "eventos_auditoria") {
              if (!listas.get("id_entidade")?.includes(tarefa) || filtros.get("evento") !== "SolucaoTarefaDiligenciaRevisada")
                throw Error("ESCOPO_REVISAO_AUDITORIA");
            } else {
              if (filtros.get("id_contrato") !== K) throw Error("ESCOPO_EVIDENCIAS_CONTRATO");
              if (table !== "versoes_documento" && filtros.get("id_competencia") !== C)
                throw Error("ESCOPO_EVIDENCIAS_COMPETENCIA");
              if (table === "itens_pacote_competencia" && filtros.get("id_pacote") !== P)
                throw Error("ESCOPO_PACOTE_APONTAMENTO");
              if (["analises_apontamentos", "tarefas_diligencia", "desfechos_apontamentos"].includes(table) &&
                  filtros.get("id_apontamento") !== apontamentos[0].id)
                throw Error("ESCOPO_ITEM_APONTAMENTO");
            }
            return { data: tabelas[table], error: null, status: 200 };
          }).then(resolve, reject);
        },
      };
      return consulta;
    }
    if (table !== "ciclos_diligencia" && table !== "pareceres_contratante" &&
        table !== "apontamentos_contratante") return baseline.from(table);
    const scope = new Map<string, string>();
    const ordem: string[] = [];
    let select = "";
    let signal: AbortSignal | undefined;
    const fixture = () => new URLSearchParams(location.search).get("fixture");
    const ok = (data: unknown[], status = 200) => ({ data, error: null, status, count: data.length });
    const query = {
      select(campos: string) { select = campos; return query; },
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
      abortSignal(value: AbortSignal) { signal = value; return query; },
      async maybeSingle() {
        signal?.throwIfAborted();
        if (table === "apontamentos_contratante") {
          if (scope.size !== 5 || scope.get("id_ciclo") !== chaves.id_ciclo || scope.get("id_competencia") !== C ||
              scope.get("id_contrato") !== K || scope.get("id_organizacao") !== O || scope.get("id") !== apontamentos[0].id)
            throw Error("ESCOPO_DETALHE_APONTAMENTO");
          if (fixture() === "item-denied") return { data: null, error: { code: "42501" }, status: 403 };
          return { data: apontamentos[0], error: null, status: 200 };
        }
        if (table !== "ciclos_diligencia" || scope.size !== 2 || scope.get("id_organizacao") !== O) {
          throw Error("ESCOPO_CICLO_V2");
        }
        const data = fixture() === "cycle-denied" ? null :
          (rodadas.find((rodada) => rodada.id === scope.get("id")) ?? null);
        return { data, error: null, status: 200 };
      },
      then(resolve: (x: unknown) => unknown, reject: (x: unknown) => unknown) {
        const consultar = () => {
          signal?.throwIfAborted();
          if (scope.get("id_competencia") !== C || scope.get("id_contrato") !== K ||
              scope.get("id_organizacao") !== O) throw Error("ESCOPO_V2");
          if (table === "ciclos_diligencia") {
            if (scope.size !== 3 || ordem.join(",") !== "numero_rodada,id") throw Error("ESCOPO_V2_LISTA");
            if (fixture() === "denied") return { data: null, error: { code: "42501" }, status: 403, count: null };
            return ok(rodadas);
          }
          if (scope.size !== 4 || scope.get("id_ciclo") !== chaves.id_ciclo) throw Error("ESCOPO_DOS_FILHOS_V2");
          if (table === "pareceres_contratante") {
            if (!select.includes("pareceres_contratante_id_apresentacao_fkey") ||
                ordem.join(",") !== "recebido_em,id") throw Error("CONTRATO_PARECER_V2");
            return ok(pareceres);
          }
          if (!select.includes("valor_questionado::text") ||
              ordem.join(",") !== "criado_em,id") throw Error("CONTRATO_APONTAMENTO_V2");
          return ok(apontamentos);
        };
        return Promise.resolve().then(consultar).then(resolve, reject);
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
import { ApontamentoDiligencia } from ${JSON.stringify(root + "/src/components/diligencias/ApontamentoDiligencia.tsx")};
import { CicloDiligencia } from ${JSON.stringify(root + "/src/components/diligencias/CicloDiligencia.tsx")};
import { CompetenciaProtocolo } from ${JSON.stringify(root + "/src/components/competencias/CompetenciaProtocolo.tsx")};
import { definirPreferenciaOrganizacao } from ${JSON.stringify(root + "/src/lib/organizacao/preferenciaOrganizacao.ts")};
import { C, O } from "./client";

definirPreferenciaOrganizacao("fixture-user", O);
function ApresentacaoFixture() {
  const [path, setPath] = useState(location.pathname + location.search);
  useEffect(() => {
    const atualizar = () => setPath(location.pathname + location.search);
    window.addEventListener("popstate", atualizar);
    return () => window.removeEventListener("popstate", atualizar);
  }, []);
  const endereco = new URL(path, location.origin);
  const [, modulo, id, subrota, origem] = endereco.pathname.split("/");
  const foco = endereco.searchParams.get("foco") ?? undefined;
  const offset = Number(endereco.searchParams.get("offset")) || undefined;
  if (modulo === "diligencias" && subrota === "apontamentos")
    return <ApontamentoDiligencia cicloId={id} id={origem} offset={offset} />;
  if (modulo === "diligencias") return <CicloDiligencia id={id} foco={foco} offset={offset} />;
  if (subrota === "diligencias") return <DiligenciasCompetencia id={id} />;
  if (subrota === "apresentacoes") return <CompetenciaProtocolo id={id} apresentacaoId={origem} />;
  return <CompetenciaVisaoGeral id={C} />;
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
  const cycleRecords = [];
  const itemRecords = [];
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
      } else if ([overview, diligencias, cicloPath, protocoloPath, itemPath].includes(path)) {
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
        page.on("console", (message) => {
          if (message.type() === "error") erros++;
        });
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
        const abrirCiclo = page.getByRole("link", { name: "Abrir rodada 2" });
        await abrirCiclo.focus();
        if (!(await abrirCiclo.evaluate((link) => document.activeElement === link)))
          throw Error("TESTE_C_CICLO_FOCO");
        await abrirCiclo.press("Enter");
        await page.waitForURL(origin + cicloPath);
        const verificarCiclo = async () => {
          await page.getByRole("heading", { name: "Ciclo de diligência", exact: true }).waitFor();
          await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
          await page.getByText("PARECER-SINTETICO-02", { exact: true }).waitFor();
          await page.getByText("Valor de serviço apontado nesta rodada", { exact: true }).waitFor();
          await page.getByText(/R\$\s*9\.999\.999\.999\.999\.999,99/).waitFor();
          const overflow = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth),
          );
          if (overflow > 1) throw Error("TESTE_C_V2_CICLO_OVERFLOW");
          return overflow;
        };
        await verificarCiclo();
        await page.reload();
        const overflowCiclo = await verificarCiclo();
        const imagemCiclo = "screenshots/V2-02_" + width + "_" + theme + ".png";
        const bytesCiclo = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemCiclo), bytesCiclo);
        const protocolo = page.getByRole("link", { name: "Ver protocolo de origem" });
        await protocolo.press("Enter");
        await page.waitForURL(origin + protocoloPath);
        await page.getByText("PROTOCOLO-SINTETICO-2026-09", { exact: true }).waitFor();
        await page.goBack();
        await page.waitForURL(origin + cicloPath);
        await verificarCiclo();
        const abrirItem = page.getByRole("link", { name: "Abrir apontamento AP-02" });
        await abrirItem.focus();
        if (!(await abrirItem.evaluate((element) => document.activeElement === element)))
          throw Error("TESTE_C_V2_APONTAMENTO_FOCO");
        await abrirItem.press("Enter");
        await page.waitForURL(origin + itemPath);
        const verificarItem = async () => {
          await page.getByRole("heading", { name: "Detalhe do apontamento" }).waitFor();
          await page.getByText("parecer-de-origem-02.pdf", { exact: true }).waitFor();
          await page.getByText("Versão presente no pacote de origem", { exact: true }).waitFor();
          await page.getByText("Versão criada após o congelamento", { exact: true }).waitFor();
          await page
            .getByRole("region", { name: "Revisões humanas das tarefas" })
            .getByText("Solução validada", { exact: true })
            .waitFor();
          const largura = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth),
          );
          if (largura > 1) throw Error("TESTE_C_V2_APONTAMENTO_OVERFLOW");
          return largura;
        };
        await verificarItem();
        await page.reload();
        const overflowItem = await verificarItem();
        const imagemItem = "screenshots/V2-03_" + width + "_" + theme + ".png";
        const bytesItem = await page.screenshot({ fullPage: true, animations: "disabled" });
        writeFileSync(join(target, imagemItem), bytesItem);
        await page.getByRole("link", { name: "Voltar ao ciclo" }).press("Enter");
        await page.waitForURL(
          (url) =>
            url.pathname === cicloPath && url.searchParams.get("foco") === APONTAMENTO_V2_FIXTURE,
        );
        await page.waitForFunction(
          (id) => document.activeElement?.id === "abrir-apontamento-" + id,
          APONTAMENTO_V2_FIXTURE,
        );
        await page.goto(origin + itemPath + "?fixture=item-denied");
        await page.getByRole("alert").filter({ hasText: "não possui permissão" }).waitFor();
        if (
          (await page.getByText("parecer-de-origem-02.pdf", { exact: true }).count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_APONTAMENTO_ISOLAMENTO");
        itemRecords.push({
          width,
          theme,
          screenshot: imagemItem,
          sha256: digest(bytesItem),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          origemVerificada: true,
          pacoteVerificado: true,
          revisaoVerificada: true,
          negacaoSemDados: true,
          overflow: overflowItem,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        await page.goto(origin + cicloPath);
        await verificarCiclo();
        await page.getByRole("link", { name: "Voltar às diligências" }).press("Enter");
        await page.waitForURL(origin + diligencias);
        await page.getByRole("heading", { name: "Rodada 2", exact: true }).waitFor();
        await page.goto(origin + cicloPath + "?fixture=cycle-denied");
        await page
          .getByRole("alert")
          .filter({ hasText: "Ciclo indisponível para consulta." })
          .waitFor();
        if (
          (await page.getByText("PARECER-SINTETICO-02", { exact: true }).count()) ||
          (await page
            .getByText("Valor de serviço apontado nesta rodada", { exact: true })
            .count()) ||
          erros ||
          externa
        )
          throw Error("TESTE_C_V2_CICLO_ISOLAMENTO");
        cycleRecords.push({
          width,
          theme,
          screenshot: imagemCiclo,
          sha256: digest(bytesCiclo),
          status: "PASS",
          foco: true,
          retorno: true,
          recarga: true,
          protocoloV120: true,
          negacaoSemDados: true,
          overflow: overflowCiclo,
          chamadasExternas: externa,
          errosDePagina: erros,
        });
        await page.goto(origin + diligencias);
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
    if (
      cases.length !== 8 ||
      records.length !== cases.length ||
      cycleRecords.length !== cases.length ||
      itemRecords.length !== cases.length
    ) {
      throw Error("TESTE_C_V2_COBERTURA");
    }
    const record = {
      schema: "contaos.v2-diligencias.offline-visual.v3",
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
          "src/components/diligencias/CicloDiligencia.tsx",
          "src/components/competencias/CompetenciaProtocolo.tsx",
          "src/lib/diligencias/cicloDiligenciaDados.ts",
          "src/components/diligencias/ApontamentoDiligencia.tsx",
          "src/lib/diligencias/apontamentoDiligenciaDados.ts",
          "src/lib/diligencias/apontamentoEvidenciasDados.ts",
          "src/routes/diligencias_.$cicloId_.apontamentos_.$id.tsx",
        ].map((file) => [file, digest(readFileSync(join(root, file)))]),
      ),
      complete: true,
      records,
      cycleRecords,
      itemRecords,
    };
    const report = JSON.stringify(record, null, 2) + "\n";
    writeFileSync(join(target, "report.json"), report);
    writeFileSync(
      join(target, "SHA256SUMS"),
      [
        ...[...records, ...cycleRecords, ...itemRecords].map((r) => r.sha256 + "  " + r.screenshot),
        digest(report) + "  report.json",
      ].join("\n") + "\n",
    );
    console.log("V2_01_OFFLINE_VISUAL_PASS_8");
    console.log("V2_02_OFFLINE_VISUAL_PASS_8");
    console.log("V2_03_OFFLINE_VISUAL_PASS_8");
    return record;
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
}

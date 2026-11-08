import assert from "node:assert/strict";
import test from "node:test";

const sut = await import("./authenticated-visual-audit.mjs").catch((error) => {
  if (error.code !== "ERR_MODULE_NOT_FOUND" || !error.message.includes("authenticated-visual-audit.mjs")) throw error;
  return {};
});
function fn(name) {
  assert.equal(typeof sut[name], "function", `${name}: comportamento ainda não implementado`);
  return sut[name];
}
const HML = "https://contaos-41-hml.vercel.app";
const API = "https://gklhhhyosgasnyoxlrui.supabase.co";
const config = {
  origin: HML, frontendSha: "1".repeat(40), harnessSha: "2".repeat(40),
  deploymentId: "dpl_fixture123", emailPresent: true, passwordPresent: true,
};
test("configuração impede login sem segredo ou com destino diferente", () => {
  const validate = fn("validateConfiguration");
  assert.equal(validate(config).ready, true);
  for (const delta of [{ emailPresent: false }, { passwordPresent: false }, { origin: "https://foreign.invalid" }, { frontendSha: "main" }, { harnessSha: "" }, { deploymentId: "../" }]) {
    assert.equal(validate({ ...config, ...delta }).ready, false);
  }
});
test("parser real ignora script inerte sem omitir executáveis", () => {
  const parse = fn("extractScriptEntries");
  const html = '<!doctype html><!-- <script src="/decoy.js"></script> --><template><script>decoy()</script></template><textarea><script>decoy()</script></textarea><script>bootstrap()</script><script type="module" src="/assets/a.js"></script>';
  const scripts = parse(html);
  assert.equal(scripts.length, 2);
  assert.equal(scripts[0].body, "bootstrap()");
  assert.equal(scripts[1].src, "/assets/a.js");
});
for (const html of ['<script src="/assets/a.js" SRC="https://foreign.invalid/a.js"></script>', '<base href="https://foreign.invalid"><script>ok()</script>', '<script nomodule src="/assets/a.js"></script>', '<script type="unexpected">a()</script>']) {
  test("HTML ambíguo ou execução não suportada falha fechada: " + html.slice(0, 28), () => {
    const parse = fn("extractScriptEntries");
    assert.throws(() => parse(html), (e) => e.code === "HTML_POLICY");
  });
}
test("grafo inclui imports clássicos e templates constantes", () => {
  const imports = fn("scriptImports");
  assert.deepEqual(imports('import {a} from "./a.js"; export {b} from "./b.js"; const c=()=>import(`./c.js`);'), ["./a.js", "./b.js", "./c.js"]);
});
for (const code of ['import("./"+name)', 'import(`./${name}.js`)', 'import("https://foreign.invalid/a.js")', 'import("../escape.js")']) {
  test("import não constante ou fora do grafo é negado: " + code, () => {
    const imports = fn("scriptImports");
    assert.throws(() => imports(code), (e) => e.code === "SCRIPT_POLICY");
  });
}
const hydration = 'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:1794136000000,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:1794136000000,s:"success",ssr:!0}]});';
test("hidratação admite só os dois timestamps dos matches confiáveis", () => {
  const normalize = fn("normalizeHydration");
  const later = hydration.replaceAll("1794136000000", "1794136000123");
  assert.equal(normalize(later, hydration), 'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:0,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:0,s:"success",ssr:!0}]});');
});
for (const code of [hydration + ";exfiltrate()", hydration.replace('s:"success"', 's:"foreign"'), hydration.replace("u:1794136000000", "u:Date.now()"), hydration.replace("ssr:!0", "ssr:!0,u:1794136000001"), hydration.replace("hydrate", "executeForeign")]) {
  test("normalização não esconde mudança de código ou campo", () => {
    const normalize = fn("normalizeHydration");
    assert.throws(() => normalize(code, hydration), (e) => e.code === "HTML_DRIFT");
  });
}
const html = '<!doctype html><html lang="pt-BR"><body><main>Entrar</main><script>' + hydration + '</script><script type="module" src="/assets/a.js"></script></body></html>';
test("paridade cobre o documento inteiro e não apenas scripts", () => {
  const compare = fn("compareHtml");
  assert.equal(compare(html.replaceAll("1794136000000", "1794136000123"), html), true);
  for (const changed of [html.replace("<main>", '<main onload="exfiltrate()">'), html.replace("<main>", '<iframe srcdoc="bad"></iframe><main>'), html.replace("Entrar", "Tela falsa"), html.replace("/assets/a.js", "javascript:exfiltrate()"), html.replace("<main>", '<object data="https://foreign.invalid"></object><main>')]) {
    assert.throws(() => compare(changed, html), (e) => ["HTML_DRIFT", "HTML_POLICY"].includes(e.code));
  }
});
const requests = [
  [HML + "/contratos", "GET", true],
  [HML + "/assets/a.js", "GET", true],
  [HML + "/_server/functions", "POST", false],
  [API + "/auth/v1/token?grant_type=password", "POST", true],
  [API + "/auth/v1/token?grant_type=unexpected", "POST", false],
  [API + "/auth/v1/user", "GET", true],
  [API + "/rest/v1/contratos?select=id", "GET", true],
  [API + "/rest/v1/contratos", "POST", false],
  [API + "/rest/v1/rpc/obter_visao_geral_competencia", "POST", true],
  [API + "/rest/v1/rpc/obter_visao_geral_competencia", "GET", false],
  [API + "/rest/v1/rpc/executar_comando_lista_v1", "POST", false],
  [API + "/rest/v1/rpc/executar_comando_lista_v1", "GET", false],
  [API + "/rest/v1/%72pc/executar_comando_lista_v1", "GET", false],
  [API + "/rest/v1/segredos", "GET", false],
  [API + "/functions/v1/storage-sign-upload", "POST", false],
  ["https://foreign.invalid/collect", "POST", false],
  ["https://gklhhhyosgasnyoxlrui.supabase.co.foreign.invalid/auth/v1/token", "POST", false],
  ["https://user:password@contaos-41-hml.vercel.app/", "GET", false],
];
for (const [url, method, expected] of requests) {
  test(`transporte ${method} ${new URL(url).pathname}: ${expected}`, () => {
    assert.equal(fn("requestAllowed")({ url, method }), expected);
  });
}
test("worker e websocket são negados mesmo em destino conhecido", () => {
  const allowed = fn("requestAllowed");
  assert.equal(allowed({ url: HML + "/assets/a.js", method: "GET", resourceType: "worker" }), false);
  assert.equal(allowed({ url: "wss://gklhhhyosgasnyoxlrui.supabase.co/realtime/v1", method: "GET" }), false);
});
const good = {
  surface: "V110", width: 1440, theme: "light", observedWidth: 1440, observedTheme: "light",
  routeExact: true, http: 200, sessionVerified: true, organizationVerified: true,
  shellVerified: true, h1: 1, overflowX: 0, brandCount: 1, privacySafe: true,
  errors: 0, blockedMutations: 0, screenshot: "screenshots/V110_1440_light.png",
  sha256: "a".repeat(64), dom: "dom/V110_1440_light.json", domSha256: "b".repeat(64),
};
test("prova automatizada não certifica visual sem evidência e medidas exatas", () => {
  const validate = fn("validateCase");
  assert.equal(validate(good), true);
  for (const delta of [{ observedWidth: 1363 }, { observedTheme: "dark" }, { privacySafe: false }, { http: 403 }, { h1: 0 }, { overflowX: 3 }, { brandCount: 2 }, { sha256: "" }, { domSha256: "" }, { screenshot: "../../secret.png" }, { errors: 1 }, { blockedMutations: 1 }, { sessionVerified: false }]) assert.equal(validate({ ...good, ...delta }), false);
});
test("caso público não entra como nova prova privada", () => {
  assert.equal(fn("validateCase")({ ...good, surface: "SYS01" }), false);
});
test("coleção privada incompleta ou duplicada não vira PASS global", () => {
  const summarize = fn("summarizeCases");
  const surfaces = ["SYS04", "SYS05", "ADM01", "V101", "V102", "V103", "V104", "V105", "V106", "V107", "V108", "V109", "V110", "V111", "V112", "V113", "V114", "V115", "V116", "V117", "V118", "V119", "V120", "V121", "V122", "V123"];
  const rows = surfaces.flatMap((surface) => [1440, 1280, 768, 390].flatMap((width) => ["light", "dark"].map((theme) => ({ surface, width, theme, status: "BLOQUEADO_FIXTURE" }))));
  assert.equal(summarize(rows).recorded, 208);
  assert.equal(summarize(rows).globalComplete, false);
  assert.equal(summarize(rows.slice(1)).matrixComplete, false);
  assert.equal(summarize([...rows.slice(1), rows[1]]).matrixComplete, false);
});
test("sanitização não publica e-mail, documento ou nome fora da fixture", () => {
  const safe = fn("safeArtifactText");
  assert.equal(safe("Organização ContaOS HML Teste Situação ativa", new Set(["organização", "contaos", "hml", "teste", "situação", "ativa"])), true);
  for (const value of ["pessoa.real@example.com", "123.456.789-01", "NomeRealNaoAutorizado", "Bearer eyJhbGciOiJIUzI1NiJ9.abc.def"]) assert.equal(safe(value, new Set(["organização", "contaos"])), false);
});

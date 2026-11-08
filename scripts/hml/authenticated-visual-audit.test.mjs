import assert from "node:assert/strict";
import test from "node:test";
import { createServer, connect } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { WebSocketServer } = createRequire(require.resolve("jsdom"))("ws");

const sut = await import("./authenticated-visual-audit.mjs").catch((error) => {
  if (
    error.code !== "ERR_MODULE_NOT_FOUND" ||
    !error.message.includes("authenticated-visual-audit.mjs")
  )
    throw error;
  return {};
});
function fn(name) {
  assert.equal(typeof sut[name], "function", `${name}: comportamento ainda não implementado`);
  return sut[name];
}
const HML = "https://contaos-41-hml.vercel.app";
const API = "https://gklhhhyosgasnyoxlrui.supabase.co";
const config = {
  origin: HML,
  frontendSha: "1".repeat(40),
  harnessSha: "2".repeat(40),
  deploymentId: "dpl_fixture123",
  emailPresent: true,
  passwordPresent: true,
};
test("configuração impede login sem segredo ou com destino diferente", () => {
  const validate = fn("validateConfiguration");
  assert.equal(validate(config).ready, true);
  for (const delta of [
    { emailPresent: false },
    { passwordPresent: false },
    { origin: "https://foreign.invalid" },
    { frontendSha: "main" },
    { harnessSha: "" },
    { deploymentId: "../" },
  ]) {
    assert.equal(validate({ ...config, ...delta }).ready, false);
  }
});
test("parser real ignora script inerte sem omitir executáveis", () => {
  const parse = fn("extractScriptEntries");
  const html =
    '<!doctype html><!-- <script src="/decoy.js"></script> --><template><script>decoy()</script></template><textarea><script>decoy()</script></textarea><script>bootstrap()</script><script type="module" src="/assets/a.js"></script>';
  const scripts = parse(html);
  assert.equal(scripts.length, 2);
  assert.equal(scripts[0].body, "bootstrap()");
  assert.equal(scripts[1].src, "/assets/a.js");
});
for (const html of [
  '<script src="/assets/a.js" SRC="https://foreign.invalid/a.js"></script>',
  '<base href="https://foreign.invalid"><script>ok()</script>',
  '<script nomodule src="/assets/a.js"></script>',
  '<script type="unexpected">a()</script>',
]) {
  test("HTML ambíguo ou execução não suportada falha fechada: " + html.slice(0, 28), () => {
    const parse = fn("extractScriptEntries");
    assert.throws(
      () => parse(html),
      (e) => e.code === "HTML_POLICY",
    );
  });
}
test("grafo inclui imports clássicos e templates constantes", () => {
  const imports = fn("scriptImports");
  assert.deepEqual(
    imports('import {a} from "./a.js"; export {b} from "./b.js"; const c=()=>import(`./c.js`);'),
    ["./a.js", "./b.js", "./c.js"],
  );
});
for (const code of [
  'import("./"+name)',
  "import(`./${name}.js`)",
  'import("https://foreign.invalid/a.js")',
  'import("../escape.js")',
]) {
  test("import não constante ou fora do grafo é negado: " + code, () => {
    const imports = fn("scriptImports");
    assert.throws(
      () => imports(code),
      (e) => e.code === "SCRIPT_POLICY",
    );
  });
}
const hydration =
  'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:1794136000000,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:1794136000000,s:"success",ssr:!0}]});';
test("hidratação admite só os dois timestamps dos matches confiáveis", () => {
  const normalize = fn("normalizeHydration");
  const later = hydration.replaceAll("1794136000000", "1794136000123");
  assert.equal(
    normalize(later, hydration),
    'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:0,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:0,s:"success",ssr:!0}]});',
  );
});
for (const code of [
  hydration + ";exfiltrate()",
  hydration.replace('s:"success"', 's:"foreign"'),
  hydration.replace("u:1794136000000", "u:Date.now()"),
  hydration.replace("ssr:!0", "ssr:!0,u:1794136000001"),
  hydration.replace("hydrate", "executeForeign"),
]) {
  test("normalização não esconde mudança de código ou campo", () => {
    const normalize = fn("normalizeHydration");
    assert.throws(
      () => normalize(code, hydration),
      (e) => e.code === "HTML_DRIFT",
    );
  });
}
const html =
  '<!doctype html><html lang="pt-BR"><body><main>Entrar</main><script>' +
  hydration +
  '</script><script type="module" src="/assets/a.js"></script></body></html>';
test("paridade cobre o documento inteiro e não apenas scripts", () => {
  const compare = fn("compareHtml");
  assert.equal(compare(html.replaceAll("1794136000000", "1794136000123"), html), true);
  for (const changed of [
    html.replace("<main>", '<main onload="exfiltrate()">'),
    html.replace("<main>", '<iframe srcdoc="bad"></iframe><main>'),
    html.replace("Entrar", "Tela falsa"),
    html.replace("/assets/a.js", "javascript:exfiltrate()"),
    html.replace("<main>", '<object data="https://foreign.invalid"></object><main>'),
  ]) {
    assert.throws(
      () => compare(changed, html),
      (e) => ["HTML_DRIFT", "HTML_POLICY"].includes(e.code),
    );
  }
});
test("SSR com NUL conserva bytes originais e normaliza apenas timestamps", () => {
  const compare = fn("compareHtml"),
    parse = fn("extractScriptEntries");
  const trusted = html.replaceAll("\\0", "\0");
  const actual = trusted.replaceAll("1794136000000", "1794136000123");
  assert.equal(parse(trusted)[0].body.includes("\0"), true);
  assert.equal(compare(actual, trusted), true);
  assert.throws(
    () => compare(actual.replace("__root__\0", "__root__X"), trusted),
    (e) => e.code === "HTML_DRIFT",
  );
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
  assert.equal(
    allowed({ url: HML + "/assets/a.js", method: "GET", resourceType: "worker" }),
    false,
  );
  assert.equal(
    allowed({ url: "wss://gklhhhyosgasnyoxlrui.supabase.co/realtime/v1", method: "GET" }),
    false,
  );
});
const good = {
  surface: "V110",
  width: 1440,
  theme: "light",
  observedWidth: 1440,
  observedTheme: "light",
  routeExact: true,
  http: 200,
  sessionVerified: true,
  organizationVerified: true,
  shellVerified: true,
  h1: 1,
  overflowX: 0,
  brandCount: 1,
  privacySafe: true,
  errors: 0,
  blockedMutations: 0,
  screenshot: "screenshots/V110_1440_light.png",
  sha256: "a".repeat(64),
  dom: "dom/V110_1440_light.json",
  domSha256: "b".repeat(64),
};
test("prova automatizada não certifica visual sem evidência e medidas exatas", () => {
  const validate = fn("validateCase");
  assert.equal(validate(good), true);
  for (const delta of [
    { observedWidth: 1363 },
    { observedTheme: "dark" },
    { privacySafe: false },
    { http: 403 },
    { h1: 0 },
    { overflowX: 3 },
    { brandCount: 2 },
    { sha256: "" },
    { domSha256: "" },
    { screenshot: "../../secret.png" },
    { errors: 1 },
    { blockedMutations: 1 },
    { sessionVerified: false },
  ])
    assert.equal(validate({ ...good, ...delta }), false);
});
test("caso público não entra como nova prova privada", () => {
  assert.equal(fn("validateCase")({ ...good, surface: "SYS01" }), false);
});
test("coleção privada incompleta ou duplicada não vira PASS global", () => {
  const summarize = fn("summarizeCases");
  const surfaces = [
    "SYS04",
    "SYS05",
    "ADM01",
    "V101",
    "V102",
    "V103",
    "V104",
    "V105",
    "V106",
    "V107",
    "V108",
    "V109",
    "V110",
    "V111",
    "V112",
    "V113",
    "V114",
    "V115",
    "V116",
    "V117",
    "V118",
    "V119",
    "V120",
    "V121",
    "V122",
    "V123",
  ];
  const rows = surfaces.flatMap((surface) =>
    [1440, 1280, 768, 390].flatMap((width) =>
      ["light", "dark"].map((theme) => ({ surface, width, theme, status: "BLOQUEADO_FIXTURE" })),
    ),
  );
  assert.equal(summarize(rows).recorded, 208);
  assert.equal(summarize(rows).globalComplete, false);
  assert.equal(summarize(rows.slice(1)).matrixComplete, false);
  assert.equal(summarize([...rows.slice(1), rows[1]]).matrixComplete, false);
});
test("sanitização não publica e-mail, documento ou nome fora da fixture", () => {
  const safe = fn("safeArtifactText");
  assert.equal(
    safe(
      "Organização ContaOS HML Teste Situação ativa",
      new Set(["organização", "contaos", "hml", "teste", "situação", "ativa"]),
    ),
    true,
  );
  for (const value of [
    "pessoa.real@example.com",
    "123.456.789-01",
    "NomeRealNaoAutorizado",
    "Bearer eyJhbGciOiJIUzI1NiJ9.abc.def",
  ])
    assert.equal(safe(value, new Set(["organização", "contaos"])), false);
});

const publicEnv = {
  VITE_VERCEL_BRANCH_URL: "contaos-41-hml-git-main-contaos9999.vercel.app",
  VITE_VERCEL_DEPLOYMENT_ID: "dpl_fixture123",
  VITE_VERCEL_ENV: "production",
  VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN: "contaos9999",
  VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME: "ContaOS",
  VITE_VERCEL_GIT_COMMIT_MESSAGE: "Synthetic fixture build",
  VITE_VERCEL_GIT_COMMIT_REF: "main",
  VITE_VERCEL_GIT_COMMIT_SHA: "1".repeat(40),
  VITE_VERCEL_GIT_PREVIOUS_SHA: "",
  VITE_VERCEL_GIT_PROVIDER: "github",
  VITE_VERCEL_GIT_PULL_REQUEST_ID: "",
  VITE_VERCEL_GIT_REPO_ID: "1442722734",
  VITE_VERCEL_GIT_REPO_OWNER: "contaos999999",
  VITE_VERCEL_GIT_REPO_SLUG: "contaos-hml-control",
  VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG: JSON.stringify({
    analytics: {
      scriptSrc: "d5945c2254afc21e/script.js",
      viewEndpoint: "d5945c2254afc21e/view",
      eventEndpoint: "d5945c2254afc21e/event",
      sessionEndpoint: "d5945c2254afc21e/session",
    },
    speedInsights: { scriptSrc: "ba48403b98e1edac/script.js", endpoint: "ba48403b98e1edac/vitals" },
  }),
  VITE_VERCEL_PROJECT_ID: "prj_JtEWXg54EIYcQPwVzFiQyJcVIlFo",
  VITE_VERCEL_PROJECT_PRODUCTION_URL: "contaos-41-hml.vercel.app",
  VITE_VERCEL_TARGET_ENV: "production",
  VITE_VERCEL_URL: "contaos-41-fixture123-contaos9999.vercel.app",
};
const clientConfig = {
  BASE_URL: "/",
  DEV: false,
  MODE: "production",
  PROD: true,
  SSR: false,
  TSS_DEV_SERVER: "false",
  TSS_DEV_SSR_STYLES_BASEPATH: "/",
  TSS_DEV_SSR_STYLES_ENABLED: "true",
  TSS_DISABLE_CSRF_MIDDLEWARE_WARNING: "false",
  TSS_INLINE_CSS_ENABLED: "false",
  TSS_ROUTER_BASEPATH: "",
  TSS_SERVER_FN_BASE: "/_serverFn/",
  VITE_SUPABASE_PROJECT_ID: "gklhhhyosgasnyoxlrui",
  VITE_SUPABASE_URL: API,
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sHKZ-UiYCbkEFMqR1QbHMA_iCSLL8Am",
};
test("metadados públicos extraídos por AST devem corresponder ao deployment aprovado", () => {
  const extract = fn("extractPublicBuildEnvironment");
  const source = "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv }) + ";";
  const result = extract(new Map([["module.js", source]]), config);
  assert.equal(Object.keys(result).length, 19);
  assert.equal(result.VITE_VERCEL_GIT_COMMIT_SHA, "1".repeat(40));
});
const deploymentModules = (delta = {}) =>
  new Map([
    ["module.js", "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv, ...delta }) + ";"],
  ]);
test("reancoragem descobre identidade validada sem pins e preserva pins explícitos", () => {
  const resolve = fn("resolveDeploymentIdentity");
  const expected = { frontendSha: config.frontendSha, deploymentId: config.deploymentId };
  assert.deepEqual(resolve(deploymentModules()), expected);
  assert.deepEqual(resolve(deploymentModules(), { frontendSha: "", deploymentId: "" }), expected);
  assert.deepEqual(resolve(deploymentModules(), expected), expected);
});
for (const pins of [
  { frontendSha: config.frontendSha },
  { deploymentId: config.deploymentId },
  { frontendSha: "3".repeat(40), deploymentId: config.deploymentId },
  { frontendSha: config.frontendSha, deploymentId: "dpl_oldfixture123" },
  { frontendSha: "main", deploymentId: config.deploymentId },
  { frontendSha: config.frontendSha, deploymentId: "dpl_inject123\nEVIL=1" },
])
  test("reancoragem nunca substitui pin incompleto, inválido ou obsoleto", () => {
    assert.throws(
      () => fn("resolveDeploymentIdentity")(deploymentModules(), pins),
      (e) => ["DEPLOYMENT_INPUT", "DEPLOYMENT_PIN_STALE"].includes(e.code),
    );
  });
for (const delta of [
  { VITE_VERCEL_GIT_COMMIT_SHA: "main" },
  { VITE_VERCEL_DEPLOYMENT_ID: "dpl_inject123\nEVIL=1" },
  { VITE_VERCEL_PROJECT_ID: "foreign" },
  { VITE_VERCEL_GIT_REPO_OWNER: "foreign" },
  { VITE_VERCEL_SECRET: "SYNTHETIC_PRIVATE_CANARY" },
])
  test("descoberta automática rejeita identidade inválida e configuração estrangeira", () => {
    assert.throws(
      () => fn("resolveDeploymentIdentity")(deploymentModules(delta)),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
  });
test("descoberta automática rejeita ausência, conflito e expressão executável", () => {
  const resolve = fn("resolveDeploymentIdentity");
  const conflict = deploymentModules();
  conflict.set(
    "other.js",
    deploymentModules({ VITE_VERCEL_GIT_COMMIT_SHA: "3".repeat(40) }).get("module.js"),
  );
  for (const modules of [
    new Map(),
    new Map([["module.js", "const empty={};"]]),
    conflict,
    new Map([
      [
        "module.js",
        deploymentModules()
          .get("module.js")
          .replace('"Synthetic fixture build"', "`${exfiltrate()}`"),
      ],
    ]),
  ])
    assert.throws(
      () => resolve(modules),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
});
test("outputs de workflow contêm apenas os dois identificadores validados", () => {
  const format = fn("deploymentWorkflowOutputs");
  const identity = { frontendSha: config.frontendSha, deploymentId: config.deploymentId };
  assert.deepEqual(format({ ...identity, secret: "SYNTHETIC_PRIVATE_CANARY" }), {
    environment: `CONTAOS_FRONTEND_SHA=${identity.frontendSha}\nCONTAOS_DEPLOYMENT_ID=${identity.deploymentId}\n`,
    outputs: `frontend_sha=${identity.frontendSha}\ndeployment_id=${identity.deploymentId}\n`,
  });
  for (const delta of [{ frontendSha: "main" }, { deploymentId: "dpl_inject123\nEVIL=1" }])
    assert.throws(
      () => format({ ...identity, ...delta }),
      (e) => e.code === "DEPLOYMENT_INPUT",
    );
});
test("classificador local distingue erro de navegação sem persistir mensagem privada", () => {
  const classify = fn("classifyRuntimeError");
  for (const [message, reason] of [
    [
      "page.waitForURL: net::ERR_ABORTED at https://private.invalid/SYNTHETIC_PRIVATE_CANARY",
      "NAVIGATION_ABORTED",
    ],
    [
      "page.evaluate: Execution context was destroyed, most likely because of a navigation.",
      "CONTEXT_DESTROYED",
    ],
    ["page.waitForURL: Target page, context or browser has been closed", "TARGET_CLOSED"],
    ["page.evaluate: Refused to evaluate a string as JavaScript because unsafe-eval", "CSP_EVAL"],
    ["SYNTHETIC_PRIVATE_CANARY", "UNKNOWN"],
  ]) {
    const value = classify({ name: "Error", message, stack: "SYNTHETIC_PRIVATE_CANARY" });
    assert.equal(value.reason, reason);
    assert.equal(JSON.stringify(value).includes("SYNTHETIC_PRIVATE_CANARY"), false);
  }
  assert.deepEqual(
    classify({ name: "SYNTHETIC_PRIVATE_CANARY", message: "SYNTHETIC_PRIVATE_CANARY" }),
    { name: "UNKNOWN", operation: "UNKNOWN", reason: "UNKNOWN" },
  );
  assert.equal(classify({ name: "TimeoutError" }).reason, "TIMEOUT");
});
for (const delta of [
  { VITE_VERCEL_SECRET: "unexpected" },
  { VITE_VERCEL_GIT_COMMIT_SHA: "3".repeat(40) },
  { VITE_VERCEL_GIT_REPO_OWNER: "foreign" },
  { VITE_SUPABASE_URL: "https://foreign.invalid" },
  { VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_not_permitted" },
  { VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG: "https://foreign.invalid" },
]) {
  test("metadado ambíguo, secreto ou de outro projeto é negado", () => {
    const extract = fn("extractPublicBuildEnvironment");
    assert.throws(
      () =>
        extract(
          new Map([
            [
              "module.js",
              "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv, ...delta }) + ";",
            ],
          ]),
          config,
        ),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
  });
}
test("extração não executa propriedades calculadas ou interpoladas", () => {
  const extract = fn("extractPublicBuildEnvironment");
  const source =
    "const env=" +
    JSON.stringify({ ...clientConfig, ...publicEnv }).replace(
      '"Synthetic fixture build"',
      "`${exfiltrate()}`",
    ) +
    ";";
  assert.throws(
    () => extract(new Map([["module.js", source]]), config),
    (e) => e.code === "BUILD_ENV_POLICY",
  );
});
test("CSS, fontes e marca devem ter os mesmos bytes antes de entrega ao browser", () => {
  const compare = fn("assetBytesMatch");
  for (const bytes of [
    Buffer.from("body{color:#000}"),
    Buffer.from([1, 2, 3, 4]),
    Buffer.from('<svg viewBox="0 0 16 16"></svg>'),
  ]) {
    assert.equal(compare(bytes, Buffer.from(bytes)), true);
    const changed = Buffer.from(bytes);
    changed[0] ^= 1;
    assert.equal(compare(bytes, changed), false);
    assert.equal(compare(bytes, bytes.subarray(1)), false);
  }
});
test("proxy nativo não encaminha CONNECT, HTTP ou bytes para destino não aprovado", async () => {
  const start = fn("startDestinationProxy");
  let downstreamConnections = 0,
    downstreamBytes = 0;
  const downstream = createServer((socket) => {
    downstreamConnections++;
    socket.on("data", (data) => {
      downstreamBytes += data.length;
    });
    socket.end();
  });
  await new Promise((resolve, reject) => {
    downstream.once("error", reject);
    downstream.listen(0, "127.0.0.1", resolve);
  });
  const proxy = await start();
  try {
    const port = new URL(proxy.url).port;
    for (const target of [
      `127.0.0.1:${downstream.address().port}`,
      "foreign.invalid:443",
      "contaos-41-hml.vercel.app.foreign.invalid:443",
      "user:password@contaos-41-hml.vercel.app:443",
      "contaos-41-hml.vercel.app:80",
    ]) {
      const response = await new Promise((resolve, reject) => {
        const socket = connect(Number(port), "127.0.0.1");
        let body = "";
        socket.setTimeout(3000, () => {
          socket.destroy();
          reject(Error("PROXY_TIMEOUT"));
        });
        socket.once("error", reject);
        socket.on("data", (data) => {
          body += data.toString();
        });
        socket.once("end", () => resolve(body));
        socket.once("connect", () =>
          socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\nSYNTHETIC_CANARY`),
        );
      });
      assert.match(response, /^HTTP\/1\.1 403/);
    }
    assert.equal(downstreamConnections, 0);
    assert.equal(downstreamBytes, 0);
    assert.equal(proxy.snapshot().blocked, 5);
  } finally {
    await proxy.close();
    await new Promise((resolve) => downstream.close(resolve));
  }
});
test("CDP aceita somente debugger local do processo esperado", () => {
  const validate = fn("nativeDebuggerEndpoint");
  const value = "ws://127.0.0.1:41357/devtools/browser/12345678-abcd-4000-9000-123456789abc";
  assert.equal(validate(value, 41357), value);
  for (const url of [
    value.replace("127.0.0.1", "foreign.invalid"),
    value.replace(":41357", ":41358"),
    value + "?token=canary",
    value.replace("/browser/", "/page/"),
    value.replace("ws:", "wss:"),
  ]) {
    assert.throws(
      () => validate(url, 41357),
      (e) => e.code === "CDP_ENDPOINT",
    );
  }
});
test("ambiente do navegador não herda credenciais nem opções de execução", () => {
  const clean = fn("browserEnvironment")({
    PATH: "/bin",
    HOME: "/tmp/fixture",
    LANG: "pt_BR.UTF-8",
    CONTAOS_HML_SYNTHETIC_PASSWORD: "SYNTHETIC_CANARY",
    NODE_OPTIONS: "--require=foreign",
    HTTP_PROXY: "http://foreign.invalid",
  });
  assert.deepEqual(clean, { PATH: "/bin", HOME: "/tmp/fixture", LANG: "pt_BR.UTF-8" });
  assert.equal(JSON.stringify(clean).includes("SYNTHETIC_CANARY"), false);
});
async function cdpFixture() {
  const received = [],
    peers = new Set();
  const identity = { targetId: "own-target", browserContextId: "own-context" };
  let port;
  const server = createHttpServer((_req, res) =>
    res.end(
      JSON.stringify({
        webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/browser/12345678-abcd-4000-9000-123456789abc`,
      }),
    ),
  );
  const ws = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) =>
    ws.handleUpgrade(req, socket, head, (peer) => ws.emit("connection", peer)),
  );
  ws.on("connection", (peer) => {
    peers.add(peer);
    peer.once("close", () => peers.delete(peer));
    peer.on("message", (raw) => {
      const command = JSON.parse(raw.toString());
      received.push(command);
      if (command.method === "Fixture.reject")
        return peer.send(
          JSON.stringify({
            id: command.id,
            error: { code: -32601, message: "SYNTHETIC_CANARY_NOT_FOR_LOGS" },
          }),
        );
      const result =
        command.method === "Target.getTargetInfo"
          ? { targetInfo: identity }
          : command.method === "Fixture.echo"
            ? { envelopeSession: command.sessionId ?? null }
            : command.method === "Network.emulateNetworkConditionsByRule"
              ? { ruleIds: ["deny-ws", "deny-wss"] }
              : command.method === "Fetch.getResponseBody"
                ? {
                    body: Buffer.from("synthetic adulterated script").toString("base64"),
                    base64Encoded: true,
                  }
                : {};
      peer.send(JSON.stringify({ id: command.id, result }));
      if (command.method === "Target.autoAttachRelated" && !command.sessionId)
        peer.send(
          JSON.stringify({
            method: "Target.attachedToTarget",
            params: {
              sessionId: "initial-session",
              targetInfo: { ...identity, type: "page" },
              waitingForDebugger: false,
            },
          }),
        );
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  port = server.address().port;
  return {
    port,
    identity,
    received,
    emit(value) {
      for (const peer of peers) peer.send(JSON.stringify(value));
    },
    async close() {
      for (const peer of peers) peer.terminate();
      await new Promise((resolve) => ws.close(resolve));
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
test("transporte CDP conserva sessionId e não propaga erro remoto bruto", async () => {
  const connectCDP = fn("connectNativeCDP"),
    fixture = await cdpFixture();
  let client;
  try {
    client = await connectCDP(fixture.port, fixture.identity);
    assert.deepEqual(await client.send("Fixture.echo", {}, "own-session"), {
      envelopeSession: "own-session",
    });
    await assert.rejects(
      client.send("Fixture.reject"),
      (error) =>
        error.code === "CDP_COMMAND" && !JSON.stringify(error).includes("SYNTHETIC_CANARY"),
    );
  } finally {
    client?.close();
    await fixture.close();
  }
});
test("resposta adulterada é negada no CDP antes de continuar execução", async () => {
  const install = fn("installNativeFence"),
    fixture = await cdpFixture();
  let fence,
    closed = 0;
  const finished = Promise.withResolvers();
  try {
    fence = await install({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {
        closed++;
        finished.resolve();
      },
      verifyResponse: async () => false,
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "changed-script",
        request: { url: HML + "/assets/a.js", method: "GET" },
        resourceType: "Script",
        responseStatusCode: 200,
      },
    });
    await Promise.race([
      finished.promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("fixture event not processed")), 2000);
        timer.unref();
      }),
    ]);
    await fence.drain();
    assert.equal(fence.snapshot().failed, true);
    assert.equal(closed, 1);
    assert.equal(
      fixture.received.some(
        (x) => x.method === "Fetch.continueResponse" && x.params.requestId === "changed-script",
      ),
      false,
    );
    assert.equal(
      fixture.received.some(
        (x) => x.method === "Fetch.failRequest" && x.params.requestId === "changed-script",
      ),
      true,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("worker novo permanece pausado e invalida o contexto", async () => {
  const install = fn("installNativeFence"),
    fixture = await cdpFixture();
  let fence,
    closed = 0;
  const finished = Promise.withResolvers();
  try {
    fence = await install({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {
        closed++;
        finished.resolve();
      },
      verifyResponse: async () => true,
    });
    fixture.emit({
      method: "Target.attachedToTarget",
      params: {
        sessionId: "worker-session",
        targetInfo: { targetId: "own-worker", browserContextId: "own-context", type: "worker" },
        waitingForDebugger: true,
      },
    });
    await Promise.race([
      finished.promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("fixture event not processed")), 2000);
        timer.unref();
      }),
    ]);
    await fence.drain();
    assert.equal(fence.snapshot().failed, true);
    assert.equal(fence.snapshot().workersPaused, 1);
    assert.equal(closed, 1);
    assert.equal(
      fixture.received.some(
        (x) => x.sessionId === "worker-session" && x.method === "Runtime.runIfWaitingForDebugger",
      ),
      false,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});

// Native tests are an additional boundary, never a substitute for policy tests.
// They require the pinned Playwright Chromium and do not receive HML credentials.
test(
  "Chromium nativo: resposta alterada não executa antes do fechamento",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
  async () => {
    const { chromium } = await import("playwright");
    let browser, fence, context;
    let executions = 0;
    const canary = createHttpServer((_req, res) => {
      executions++;
      res.end("canary");
    });
    const source = createHttpServer((req, res) => {
      res.setHeader(
        "content-type",
        req.url === "/altered.js" ? "application/javascript" : "text/html",
      );
      res.end(
        req.url === "/altered.js"
          ? `fetch('http://127.0.0.1:${canary.address().port}/executed')`
          : '<!doctype html><script src="/altered.js"></script>',
      );
    });
    const debug = createHttpServer();
    await Promise.all(
      [canary, source, debug].map(
        (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
      ),
    );
    const port = debug.address().port;
    await new Promise((resolve) => debug.close(resolve));
    const finished = Promise.withResolvers();
    try {
      browser = await chromium.launch({
        chromiumSandbox: true,
        env: fn("browserEnvironment")(process.env),
        args: [`--remote-debugging-port=${port}`],
      });
      context = await browser.newContext();
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      const { targetInfo } = await session.send("Target.getTargetInfo");
      await session.detach();
      fence = await fn("installNativeFence")({
        debugPort: port,
        identity: targetInfo,
        policy: () => true,
        verifyResponse: async ({ resourceType }) => resourceType !== "Script",
        closeContext: async () => {
          await context.close();
          finished.resolve();
        },
      });
      await page.goto(`http://127.0.0.1:${source.address().port}/`).catch(() => {});
      await Promise.race([
        finished.promise,
        new Promise((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error("native guard did not close context")),
            10000,
          );
          timer.unref();
        }),
      ]);
      await fence.drain();
      assert.equal(fence.snapshot().failed, true);
      assert.equal(executions, 0);
    } finally {
      fence?.close();
      await browser?.close();
      await Promise.all(
        [canary, source].map((server) => new Promise((resolve) => server.close(resolve))),
      );
    }
  },
);

test("artefato recusa telefone e identificadores desconhecidos mesmo com formato válido", () => {
  const safe = fn("safeArtifactText");
  for (const value of ["1133334444", "f".repeat(32), "87ebff63-e844-4264-8c05-a92b6aabbcc1"])
    assert.equal(safe(value, new Set()), false);
  assert.equal(
    safe(
      "42 87ebff63-e844-4264-8c05-a92b6aabbcc1",
      new Set(["42", "87ebff63-e844-4264-8c05-a92b6aabbcc1"]),
    ),
    true,
  );
});
test("fence anexa todos os tipos de target, sem permitir execução de worklet desconhecido", async () => {
  const fixture = await cdpFixture(),
    done = Promise.withResolvers();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => done.resolve(),
      verifyResponse: async () => true,
    });
    const auto = fixture.received.filter((x) => x.method === "Target.setAutoAttach");
    assert.equal(
      auto.every(
        (x) =>
          !x.params.filter || x.params.filter.some((item) => !item.type && item.exclude !== true),
      ),
      true,
    );
    fixture.emit({
      method: "Target.attachedToTarget",
      params: {
        sessionId: "worklet-session",
        targetInfo: {
          targetId: "unknown-worklet",
          browserContextId: "own-context",
          type: "worklet",
        },
        waitingForDebugger: true,
      },
    });
    await Promise.race([
      done.promise,
      new Promise((_, reject) => {
        const t = setTimeout(() => reject(new Error("worklet was not blocked")), 2000);
        t.unref();
      }),
    ]);
    assert.equal(fence.snapshot().failed, true);
    assert.equal(
      fixture.received.some(
        (x) => x.sessionId === "worklet-session" && x.method === "Runtime.runIfWaitingForDebugger",
      ),
      false,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});

for (const mode of ["worker", "popup", "websocket", "proxy"])
  test(
    `Chromium nativo: ${mode} não transmite ao canário`,
    { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
    async () => {
      const { chromium } = await import("playwright");
      let browser, context, fence, proxy;
      let connections = 0;
      const canary = createHttpServer((_req, res) => {
        res.setHeader("content-type", "text/html");
        res.end('<!doctype html><title>canary</title><link rel="icon" href="data:,">');
      });
      canary.on("connection", () => connections++);
      const debug = createHttpServer();
      await Promise.all(
        [canary, debug].map(
          (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
        ),
      );
      const port = debug.address().port;
      await new Promise((resolve) => debug.close(resolve));
      const finished = Promise.withResolvers();
      try {
        if (mode === "proxy") proxy = await fn("startDestinationProxy")();
        browser = await chromium.launch({
          chromiumSandbox: true,
          env: fn("browserEnvironment")(process.env),
          args: [
            `--remote-debugging-port=${port}`,
            ...(proxy ? ["--proxy-bypass-list=<-loopback>"] : []),
          ],
          ...(proxy ? { proxy: { server: proxy.url } } : {}),
        });
        context = await browser.newContext();
        const page = await context.newPage();
        if (mode !== "proxy") {
          const session = await context.newCDPSession(page);
          const { targetInfo } = await session.send("Target.getTargetInfo");
          await session.detach();
          fence = await fn("installNativeFence")({
            debugPort: port,
            identity: targetInfo,
            verifyResponse: async () => true,
            policy: (request) =>
              mode === "websocket" && request.url === `http://127.0.0.1:${canary.address().port}/`
                ? true
                : sut.requestAllowed(request),
            closeContext: async () => {
              await context.close();
              finished.resolve();
            },
          });
        }
        if (mode === "worker") {
          await page
            .evaluate((url) => {
              new Worker(
                URL.createObjectURL(new Blob([`fetch('${url}')`], { type: "text/javascript" })),
              );
            }, `http://127.0.0.1:${canary.address().port}/canary`)
            .catch(() => {});
        } else if (mode === "popup") {
          await page
            .evaluate((url) => window.open(url), `http://127.0.0.1:${canary.address().port}/canary`)
            .catch(() => {});
        } else if (mode === "websocket") {
          await page.goto(`http://127.0.0.1:${canary.address().port}/`, {
            waitUntil: "networkidle",
          });
          canary.closeAllConnections();
          connections = 0;
          assert.equal(
            await page.evaluate(
              (url) =>
                new Promise((resolve) => {
                  const ws = new WebSocket(url);
                  ws.onerror = () => resolve("denied");
                  ws.onopen = () => resolve("opened");
                }),
              `ws://127.0.0.1:${canary.address().port}/canary`,
            ),
            "denied",
          );
        } else {
          assert.equal(
            await page.evaluate(
              (url) =>
                fetch(url).then(
                  () => false,
                  () => true,
                ),
              `http://127.0.0.1:${canary.address().port}/canary`,
            ),
            true,
          );
          assert.ok(proxy.snapshot().blocked > 0);
        }
        if (mode === "worker" || mode === "popup")
          await Promise.race([
            finished.promise,
            new Promise((_, reject) => {
              const timer = setTimeout(() => reject(new Error("target was not stopped")), 10000);
              timer.unref();
            }),
          ]);
        await fence?.drain();
        if (mode === "worker") assert.ok(fence.snapshot().workersPaused > 0);
        if (mode === "popup") assert.ok(fence.snapshot().popups > 0);
        assert.equal(connections, 0);
      } finally {
        fence?.close();
        await browser?.close();
        await proxy?.close();
        await new Promise((resolve) => canary.close(resolve));
      }
    },
  );

test("grafo público usa parser, limites e somente módulos do HML", async () => {
  const discover = fn("discoverPublicGraph"),
    origin = HML;
  const fixture = new Map([
    ["/login", '<!doctype html><script type="module" src="/assets/main.js"></script>'],
    ["/assets/main.js", 'import "./child.js";'],
    ["/assets/child.js", "export const synthetic=1;"],
  ]);
  const fetcher = async (url) => {
    const response = new Response(fixture.get(new URL(url).pathname), { status: 200 });
    Object.defineProperty(response, "url", { value: url });
    return response;
  };
  const graph = await discover({ fetcher });
  assert.equal(graph.modules.size, 2);
  assert.equal(graph.modules.get(origin + "/assets/child.js"), "export const synthetic=1;");
  fixture.set("/assets/child.js", 'import("https://foreign.invalid/payload.js")');
  await assert.rejects(discover({ fetcher }), (error) => error.code === "SCRIPT_POLICY");
  fixture.set(
    "/login",
    '<!doctype html><script src="https://foreign.invalid/payload.js"></script>',
  );
  await assert.rejects(discover({ fetcher }), (error) => error.code === "GRAPH_DESTINATION");
});
test("download público interrompe redirect, resposta parcial e excesso de bytes", async () => {
  const bounded = fn("boundedPublicFetch");
  for (const variant of ["redirect", "status", "size"]) {
    const fetcher = async (url) => {
      const response = new Response(variant === "size" ? "x".repeat(21) : "ok", {
        status: variant === "status" ? 206 : 200,
      });
      Object.defineProperty(response, "url", { value: url });
      if (variant === "redirect") Object.defineProperty(response, "redirected", { value: true });
      return response;
    };
    await assert.rejects(
      bounded(HML + "/login", 20, fetcher),
      (error) => error.code === "PUBLIC_FETCH",
    );
  }
});

for (const scheme of ["ws", "wss"])
  test(
    `Chromium nativo: controle positivo e bloqueio ${scheme}`,
    { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
    async () => {
      const { chromium } = await import("playwright");
      let browser, context, fence;
      let connections = 0;
      const canary = createHttpServer();
      canary.on("connection", (socket) => {
        connections++;
        socket.destroy();
      });
      const source = createHttpServer((_req, res) => {
        res.setHeader("content-type", "text/html");
        res.end('<!doctype html><title>synthetic guard</title><link rel="icon" href="data:,">');
      });
      const debug = createHttpServer();
      await Promise.all(
        [canary, source, debug].map(
          (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
        ),
      );
      const port = debug.address().port;
      await new Promise((resolve) => debug.close(resolve));
      try {
        browser = await chromium.launch({
          chromiumSandbox: true,
          env: fn("browserEnvironment")(process.env),
          args: [`--remote-debugging-port=${port}`],
        });
        const attempt = async (page) =>
          page.evaluate(
            (url) =>
              new Promise((resolve) => {
                const ws = new WebSocket(url);
                ws.onerror = () => resolve("denied");
                ws.onopen = () => resolve("opened");
              }),
            `${scheme}://127.0.0.1:${canary.address().port}/canary`,
          );
        context = await browser.newContext();
        let page = await context.newPage();
        await page.goto(`http://127.0.0.1:${source.address().port}/`, { waitUntil: "networkidle" });
        await attempt(page);
        assert.ok(connections > 0, "controle positivo deve comprovar transporte ao mesmo canário");
        await context.close();
        connections = 0;
        context = await browser.newContext();
        page = await context.newPage();

        const session = await context.newCDPSession(page);
        const { targetInfo } = await session.send("Target.getTargetInfo");
        await session.detach();
        fence = await fn("installNativeFence")({
          debugPort: port,
          identity: targetInfo,
          verifyResponse: async () => true,
          policy: (request) =>
            request.url === `http://127.0.0.1:${source.address().port}/` ||
            sut.requestAllowed(request),
          closeContext: async () => context.close(),
        });
        const delivered = await page.goto(`http://127.0.0.1:${source.address().port}/`, {
          waitUntil: "networkidle",
        });
        assert.ok(
          fence.snapshot().verifiedDocuments > 0,
          "verified response count: " + JSON.stringify(fence.snapshot()),
        );
        assert.ok(
          (await delivered.headerValue("content-security-policy"))?.includes("connect-src"),
          "CSP must reach the protected document",
        );
        assert.equal(connections, 0, "no late positive-control connection before attempt");
        assert.ok(
          fence.snapshot().verifiedDocuments > 0,
          "document must be verified before attempt",
        );
        await page.evaluate(() => {
          window.syntheticCspViolations = [];
          document.addEventListener("securitypolicyviolation", (event) => {
            window.syntheticCspViolations.push({
              directive: event.effectiveDirective,
              policy: event.originalPolicy,
            });
          });
        });
        assert.equal(await attempt(page), "denied");
        assert.equal(
          await page.evaluate(() =>
            window.syntheticCspViolations.some(
              (event) =>
                event.directive === "connect-src" &&
                event.policy.includes("connect-src https://contaos-41-hml.vercel.app"),
            ),
          ),
          true,
          "native CSP must report blocked connect-src",
        );
        await fence.drain();
        assert.equal(connections, 0, "fence deve bloquear antes do primeiro byte");
      } finally {
        fence?.close();
        await browser?.close();
        for (const server of [canary, source]) {
          server.closeAllConnections();
          await new Promise((resolve) => server.close(resolve));
        }
      }
    },
  );

test("CSP adicional preserva headers e restringe conexões HTTPS sem liberar ws ou wss", () => {
  const headers = [
    { name: "Content-Type", value: "text/html" },
    { name: "Content-Security-Policy", value: "default-src 'self'" },
  ];
  const result = fn("guardedResponseHeaders")(headers);
  assert.deepEqual(result.slice(0, 2), headers);
  assert.equal(result.length, 3);
  assert.equal(result[2].name, "Content-Security-Policy");
  assert.equal(
    result[2].value,
    `connect-src ${HML} ${API}; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'`,
  );
  assert.throws(() => fn("guardedResponseHeaders")([{ name: "X", value: "bad\r\nheader" }]));
});

test("matriz privada tem 208 chaves únicas, IDs reais e 24 bloqueios explícitos", () => {
  const rows = fn("privateCases")();
  assert.equal(rows.length, 208);
  assert.equal(new Set(rows.map(sut.caseKey)).size, 208);
  assert.equal(rows.filter((r) => r.fixtureBlocked).length, 24);
  assert.equal(
    rows
      .filter((r) => r.surface === "V103")
      .every((r) => r.path.includes("041ebf9f-5e32-4744-80d6-d745fa5fc483")),
    true,
  );
  assert.equal(
    rows.some((r) => r.path?.includes("00000000-0000-4000")),
    false,
  );
});

test("CLI sem modo explícito não pode encerrar com sucesso silencioso", async () => {
  const { execFile } = await import("node:child_process");
  const code = await new Promise((resolve) =>
    execFile(
      process.execPath,
      ["scripts/hml/authenticated-visual-audit.mjs"],
      { env: sut.browserEnvironment(process.env) },
      (error) => resolve(error?.code ?? 0),
    ),
  );
  assert.equal(code, 1);
});

test("prova nativa exige sete casos reais no mesmo SHA e mesmos arquivos", () => {
  const make = fn("nativeProofFromTap"),
    valid = fn("nativeProofValid"),
    identity = { harnessSha: "a".repeat(40), moduleHash: "b".repeat(64), testHash: "c".repeat(64) };
  const proof = make("# tests 7\n# pass 7\n# fail 0\n# skipped 0\n", identity);
  assert.equal(valid(proof, identity), true);
  for (const tap of [
    "# tests 7\n# pass 6\n# fail 1\n# skipped 0\n",
    "# tests 7\n# pass 6\n# fail 0\n# skipped 1\n",
    "",
  ])
    assert.throws(() => make(tap, identity));
  assert.equal(valid(proof, { ...identity, harnessSha: "d".repeat(40) }), false);
  assert.equal(valid({ ...proof, moduleHash: "e".repeat(64) }, identity), false);
});

test("proveniência recusa árvore suja e env ignorado fora do SHA", async () => {
  const clean = fn("sourceTreeClean");
  const fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path");
  const { promisify } = await import("node:util");
  const run = promisify((await import("node:child_process")).execFile);
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-provenance-test-"));
  const env = {
    ...sut.browserEnvironment(process.env),
    GIT_AUTHOR_NAME: "Synthetic",
    GIT_AUTHOR_EMAIL: "synthetic@example.invalid",
    GIT_COMMITTER_NAME: "Synthetic",
    GIT_COMMITTER_EMAIL: "synthetic@example.invalid",
  };
  try {
    await run("git", ["init"], { cwd: root, env });
    await fs.writeFile(path.join(root, ".gitignore"), ".env.local\nnode_modules/\n.output/\n");
    await fs.writeFile(path.join(root, "source.ts"), "export const synthetic=1;");
    await run("git", ["add", "."], { cwd: root, env });
    await run("git", ["commit", "-m", "synthetic"], { cwd: root, env });
    assert.equal(await clean(root), true);
    await fs.writeFile(path.join(root, ".env.local"), "VITE_FAKE=1");
    assert.equal(await clean(root), false);
    await fs.rm(path.join(root, ".env.local"));
    await fs.writeFile(path.join(root, "source.ts"), "export const synthetic=2;");
    assert.equal(await clean(root), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("resposta publicada exige documento conhecido e bytes aprovados antes de execução", async () => {
  const verify = fn("verifyPublishedResponse");
  const proof = {
    documents: { "/login": "<!doctype html><p>synthetic</p>" },
    publicRoot: "/nonexistent",
  };
  assert.equal(
    await verify(proof, {
      url: HML + "/login",
      resourceType: "Document",
      status: 200,
      body: Buffer.from(proof.documents["/login"]),
    }),
    true,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/login",
      resourceType: "Document",
      status: 200,
      body: Buffer.from("<!doctype html><p>changed</p>"),
    }),
    false,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/unknown",
      resourceType: "Document",
      status: 200,
      body: Buffer.from("unknown"),
    }),
    false,
  );
  assert.equal(
    await verify(proof, {
      url: API + "/auth/v1/token?grant_type=password",
      resourceType: "Fetch",
      status: 200,
    }),
    true,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/assets/missing.js",
      resourceType: "Script",
      status: 200,
      body: Buffer.from("payload"),
    }),
    false,
  );
});

test("frontend não transmite query de fallback de formulário sem hidratação", () => {
  assert.equal(
    fn("requestAllowed")({
      url: HML + "/login?email=synthetic&senha=synthetic",
      method: "GET",
      resourceType: "Document",
    }),
    false,
  );
});

test("estado esperado V114 rejeita indisponibilidade ou negativa em role=status", () => {
  const valid = fn("surfaceStateValid");
  assert.equal(
    valid("V114", {
      headingText: "Competência",
      statusTexts: ["Competência não encontrada ou indisponível."],
      mainText: "Competência não encontrada ou indisponível.",
    }),
    false,
  );
  assert.equal(
    valid("V114", {
      headingText: "Competência",
      statusTexts: ["Você não tem acesso a esta competência."],
      mainText: "Você não tem acesso a esta competência.",
    }),
    false,
  );
  assert.equal(
    valid("V114", {
      headingText: "Competência novembro/2026",
      statusTexts: [],
      mainText: "Competência novembro/2026 Rascunho",
    }),
    true,
  );
  assert.equal(
    valid("V111", {
      headingText: "FONTE_SINTETICA_AUDITORIA_HML",
      statusTexts: [],
      mainText: "",
      regionNames: ["Resumo do documento", "Processamento"],
    }),
    true,
  );
  assert.equal(
    valid("V111", {
      headingText: "FONTE_SINTETICA_AUDITORIA_HML",
      statusTexts: ["Documento não encontrado ou indisponível."],
      mainText: "",
      regionNames: [],
    }),
    false,
  );
});
test("marca mobile exige prova do menu aberto, sem fabricar marca no estado fechado", () => {
  const valid = fn("brandStateValid"),
    base = { surface: "V114", width: 390, theme: "dark", brandCount: 0 };
  const supplement = {
    mode: "MOBILE",
    brandCount: 1,
    screenshot: "screenshots/V114_390_dark_menu.png",
    sha256: "a".repeat(64),
  };
  assert.equal(valid(base), false);
  assert.equal(valid({ ...base, sidebarSupplement: supplement }), true);
  for (const brandCount of [0, 2])
    assert.equal(valid({ ...base, sidebarSupplement: { ...supplement, brandCount } }), false);
  assert.equal(valid({ ...base, width: 1440, brandCount: 1 }), true);
  assert.equal(valid({ ...base, width: 1440, brandCount: 0 }), false);
  assert.equal(valid({ ...base, surface: "SYS04", brandCount: 1 }), true);
});

test("saída Wrangler admite somente o JSON gerado, sem arquivo extra ou symlink", async () => {
  const valid = fn("generatedWranglerOutputValid"),
    fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-wrangler-test-")),
    outside = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-wrangler-outside-"));
  const dir = path.join(root, ".wrangler", "deploy"),
    file = path.join(dir, "config.json"),
    expected = '{"configPath":"../../.output/server/wrangler.json"}';
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, expected);
    assert.equal(await valid(root), true);
    await fs.writeFile(path.join(dir, "extra.json"), "{}");
    assert.equal(await valid(root), false);
    await fs.rm(path.join(dir, "extra.json"));
    for (const value of [
      '{"configPath":"../../outside.json"}',
      '{"configPath":"../../.output/server/wrangler.json","extra":true}',
      '{"configPath":"bad","configPath":"../../.output/server/wrangler.json"}',
    ]) {
      await fs.writeFile(file, value);
      assert.equal(await valid(root), false);
    }
    await fs.writeFile(file, expected);
    await fs.writeFile(path.join(outside, "config.json"), expected);
    await fs.rm(file);
    await fs.symlink(path.join(outside, "config.json"), file);
    assert.equal(await valid(root), false);
    await fs.rm(file);
    await fs.rm(dir, { recursive: true });
    await fs.symlink(outside, dir);
    assert.equal(await valid(root), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});
test("bloqueio pré-login preserva atestado válido e hashes sem gravar campo estranho", async () => {
  const write = fn("writeBlockedPreflight"),
    fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path"),
    crypto = await import("node:crypto");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-blocked-proof-")),
    identity = { harnessSha: "a".repeat(40), moduleHash: "b".repeat(64), testHash: "c".repeat(64) },
    native = sut.nativeProofFromTap("# tests 7\n# pass 7\n# fail 0\n# skipped 0\n", identity);
  try {
    await write(
      {
        code: "PREPARE_DIRTY",
        identity,
        frontendSha: "d".repeat(40),
        deploymentId: "dpl_synthetic123",
        native: { ...native, extra: "SYNTHETIC_SECRET_CANARY" },
        extra: "SYNTHETIC_SECRET_CANARY",
      },
      root,
    );
    const receipt = JSON.parse(
      await fs.readFile(path.join(root, "preflight-blocked.json"), "utf8"),
    );
    assert.equal(receipt.v1Certified, false);
    assert.equal(receipt.privateCasesProven, 0);
    assert.equal(receipt.nativeProofIncluded, true);
    const sums = await fs.readFile(path.join(root, "SHA256SUMS"), "utf8");
    for (const line of sums.trim().split("\n")) {
      const [sha, file] = line.split("  ");
      const body = await fs.readFile(path.join(root, file));
      assert.equal(crypto.createHash("sha256").update(body).digest("hex"), sha);
      assert.equal(body.includes("SYNTHETIC_SECRET_CANARY"), false);
    }
    await assert.rejects(
      write({ code: "PREPARE_DIRTY", identity }, root),
      (error) => error.code === "BLOCKED_ARTIFACT_EXISTS",
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("diagnóstico distingue timeout e recusa da fence sem mensagem ou dados privados", () => {
  const diag = fn("runtimeDiagnostics")({
    phase: "WAIT_AUTH_DESTINATION",
    errorName: "TimeoutError",
    contextClosed: false,
    routeClass: "LOGIN",
    fence: {
      failed: true,
      failureCode: "FENCE_SOURCE",
      verifiedDocuments: 1,
      verifiedScripts: 12,
      blockedRequests: 0,
    },
    proxy: { forwarded: 2, blocked: 0, connectionFailures: 0 },
    flags: { formLocated: true, submitActivated: true },
    loginUi: { observed: true, credentialRejected: true },
    message: "SYNTHETIC_PRIVATE_CANARY",
    stack: "SYNTHETIC_PRIVATE_CANARY",
    url: "https://foreign.invalid/SYNTHETIC_PRIVATE_CANARY",
    headers: { authorization: "SYNTHETIC_PRIVATE_CANARY" },
  });
  assert.equal(diag.phase, "WAIT_AUTH_DESTINATION");
  assert.equal(diag.errorKind, "TIMEOUT");
  assert.equal(diag.fence.failureCode, "FENCE_SOURCE");
  assert.equal(diag.flags.formLocated, true);
  assert.equal(diag.loginUi.credentialRejected, true);
  assert.equal(JSON.stringify(diag).includes("SYNTHETIC_PRIVATE_CANARY"), false);
});
test("diagnóstico recusa enums e contadores inesperados", () => {
  const diag = fn("runtimeDiagnostics")({
    phase: "SYNTHETIC_PRIVATE_CANARY",
    routeClass: "SYNTHETIC_PRIVATE_CANARY",
    fence: { failureCode: "SYNTHETIC_PRIVATE_CANARY", verifiedScripts: -1 },
    proxy: { blocked: Infinity },
    loginUi: { extra: "SYNTHETIC_PRIVATE_CANARY" },
  });
  assert.equal(diag.phase, "UNKNOWN");
  assert.equal(diag.routeClass, "UNAVAILABLE");
  assert.equal(diag.fence.failureCode, null);
  assert.equal(diag.fence.verifiedScripts, null);
  assert.equal(diag.proxy.blocked, null);
  assert.equal(JSON.stringify(diag).includes("SYNTHETIC_PRIVATE_CANARY"), false);
});

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { connect } from "node:net";
import ts from "typescript";

const require = createRequire(import.meta.url);
const parse5 = createRequire(require.resolve("jsdom"))("parse5");
export const HML_ORIGIN = "https://contaos-41-hml.vercel.app";
export const API_ORIGIN = "https://gklhhhyosgasnyoxlrui.supabase.co";
const WIDTHS = [1440, 1280, 768, 390];
const THEMES = ["light", "dark"];
export const PRIVATE_SURFACES = [
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
const TABLES = new Set([
  "aplicabilidades_fonte",
  "apontamentos_historicos",
  "apresentacoes_contratante",
  "arquivos",
  "competencias",
  "configuracao_upload",
  "contratantes",
  "contratos",
  "desfechos_historicos",
  "documentos_contrato",
  "eventos_auditoria",
  "fontes_formais_regras_preventivas",
  "fontes_normativas",
  "fragmentos_documento",
  "itens_lista",
  "itens_pacote_competencia",
  "linhas_orcamentarias",
  "listas_verificacao",
  "organizacoes",
  "pacotes_competencia",
  "paginas_documento",
  "pareceres_internos",
  "precedentes",
  "processamentos_documento",
  "propostas_orcamentarias",
  "regras_conformidade",
  "regras_preventivas",
  "relatorios_historicos_contratante",
  "requisitos_competencia",
  "respostas_historicas",
  "sugestoes_extracao_documento",
  "versoes_documento",
  "versoes_fontes_normativas",
  "versoes_lista",
  "versoes_proposta",
  "vinculos_usuarios",
]);
const RPCS = new Set([
  "listar_organizacoes_disponiveis",
  "obter_resumo_dashboard",
  "validar_administrador_organizacao",
  "pode_consultar_auditoria_organizacao",
  "listar_usuarios_vinculos_adm",
  "listar_escopo_contratos_usuario_adm",
  "listar_auditoria_vinculo_usuario_adm",
  "obter_matriz_rbac_master",
  "consultar_permissoes_efetivas",
  "obter_cadastro_operacional_v1",
  "classificar_acesso_contrato_v106",
  "obter_lista_operacional_v1",
  "obter_visao_geral_competencia",
  "obter_documentos_competencia_v115",
  "obter_analise_competencia_v116",
  "obter_detalhe_requisito_v117",
  "obter_contexto_revisao_v117",
]);
function fail(code) {
  throw Object.assign(new Error(code), { code });
}
const hash40 = (value) => typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
const hash64 = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

export function validateConfiguration(input = {}) {
  if (
    input.origin !== HML_ORIGIN ||
    !hash40(input.frontendSha) ||
    !hash40(input.harnessSha) ||
    !/^dpl_[A-Za-z0-9]{8,80}$/.test(input.deploymentId || "")
  ) {
    return { ready: false, code: "CONFIG_BLOCKED" };
  }
  if (input.emailPresent !== true || input.passwordPresent !== true)
    return { ready: false, code: "AUTH_FIXTURE_MISSING" };
  return { ready: true, code: "READY_FOR_PROVENANCE" };
}

export function extractScriptEntries(html) {
  if (typeof html !== "string" || Buffer.byteLength(html) > 262144) fail("HTML_POLICY");
  const scripts = [];
  const document = parse5.parse(html, {
    scriptingEnabled: true,
    sourceCodeLocationInfo: true,
    onParseError(error) {
      if (!["missing-doctype", "unexpected-null-character"].includes(error.code))
        fail("HTML_POLICY");
    },
  });
  function visit(node) {
    if (node.tagName === "template") return;
    if (["base", "iframe", "object", "embed"].includes(node.tagName)) fail("HTML_POLICY");
    const attrs = new Map((node.attrs || []).map((a) => [a.name, a.value]));
    if (attrs.size !== (node.attrs || []).length) fail("HTML_POLICY");
    for (const [key, value] of attrs) {
      if (/^on/i.test(key) || key === "srcdoc") fail("HTML_POLICY");
      if (
        ["href", "src", "xlink:href", "action", "formaction"].includes(key) &&
        /^\s*(?:javascript|vbscript):/i.test(value)
      )
        fail("HTML_POLICY");
    }
    if (node.tagName === "meta" && attrs.get("http-equiv")?.toLowerCase() === "refresh")
      fail("HTML_POLICY");
    if (node.tagName === "script") {
      if (node.namespaceURI !== "http://www.w3.org/1999/xhtml" || attrs.has("nomodule"))
        fail("HTML_POLICY");
      const type = attrs.get("type") || "classic";
      if (
        ![
          "classic",
          "module",
          "text/javascript",
          "application/javascript",
          "application/json",
          "application/ld+json",
        ].includes(type)
      )
        fail("HTML_POLICY");
      const location = node.sourceCodeLocation;
      if (!location?.endTag || (node.childNodes || []).some((child) => child.nodeName !== "#text"))
        fail("HTML_POLICY");
      // Preserve transport bytes, including SSR's NUL route separators. The HTML
      // parser still determines executable structure; it must not rewrite the
      // body used by the trusted byte comparison.
      const body = html.slice(location.startTag.endOffset, location.endTag.startOffset);
      if (attrs.has("src") && body.trim()) fail("HTML_POLICY");
      scripts.push({
        src: attrs.get("src") ?? null,
        type,
        body,
        start: location.startTag.endOffset,
        end: location.endTag.startOffset,
      });
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(document);
  if (scripts.length > 16) fail("HTML_POLICY");
  return scripts;
}

function parseScript(source, code) {
  if (typeof source !== "string" || Buffer.byteLength(source) > 4194304) fail(code);
  const file = ts.createSourceFile(
    "inspected.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  if (file.parseDiagnostics.length) fail(code);
  return file;
}

export function scriptImports(source) {
  const found = [];
  const file = parseScript(source, "SCRIPT_POLICY");
  function add(node) {
    if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node))
      fail("SCRIPT_POLICY");
    const value = node.text;
    if (
      !/^(?:\.\/|\/assets\/)[A-Za-z0-9_./-]+\.js$/.test(value) ||
      value.split("/").some((p) => p === ".." || (p === "" && !value.startsWith("/assets/")))
    )
      fail("SCRIPT_POLICY");
    if (!found.includes(value)) found.push(value);
  }
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      add(node.moduleSpecifier);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments.length !== 1) fail("SCRIPT_POLICY");
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return found;
}

function unwrapAssignment(node) {
  while (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken)
    node = node.right;
  return node;
}
function trustedTimestampRanges(source) {
  const file = parseScript(source, "HTML_DRIFT");
  const arrays = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && node.name.text === "matches") {
      const array = unwrapAssignment(node.initializer);
      if (!ts.isArrayLiteralExpression(array)) fail("HTML_DRIFT");
      arrays.push(array);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (arrays.length !== 1 || arrays[0].elements.length !== 2) fail("HTML_DRIFT");
  return arrays[0].elements.map((element, index) => {
    const object = unwrapAssignment(element);
    if (!ts.isObjectLiteralExpression(object) || object.properties.length !== 4) fail("HTML_DRIFT");
    const props = new Map();
    for (const property of object.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        !["i", "u", "s", "ssr"].includes(property.name.text) ||
        props.has(property.name.text)
      )
        fail("HTML_DRIFT");
      props.set(property.name.text, property.initializer);
    }
    const id = props.get("i"),
      time = props.get("u"),
      status = props.get("s"),
      ssr = props.get("ssr");
    if (
      !id ||
      !ts.isStringLiteral(id) ||
      (index === 0 ? id.text !== "__root__\0" : !id.text.includes("\0"))
    )
      fail("HTML_DRIFT");
    if (
      !status ||
      !ts.isStringLiteral(status) ||
      status.text !== "success" ||
      !time ||
      !ts.isNumericLiteral(time) ||
      !/^\d{13}$/.test(time.text)
    )
      fail("HTML_DRIFT");
    if (
      !ssr ||
      !ts.isPrefixUnaryExpression(ssr) ||
      ssr.operator !== ts.SyntaxKind.ExclamationToken ||
      !ts.isNumericLiteral(ssr.operand) ||
      ssr.operand.text !== "0"
    )
      fail("HTML_DRIFT");
    return [time.getStart(file), time.end];
  });
}
export function normalizeHydration(source, trustedSource) {
  if (typeof source !== "string" || source.length !== trustedSource?.length) fail("HTML_DRIFT");
  const ranges = trustedTimestampRanges(trustedSource).sort((a, b) => b[0] - a[0]);
  let actual = source,
    expected = trustedSource;
  for (const [start, end] of ranges) {
    if (!/^\d{13}$/.test(actual.slice(start, end))) fail("HTML_DRIFT");
    actual = actual.slice(0, start) + "0" + actual.slice(end);
    expected = expected.slice(0, start) + "0" + expected.slice(end);
  }
  if (actual !== expected) fail("HTML_DRIFT");
  return actual;
}
export function compareHtml(actual, expected) {
  const left = extractScriptEntries(actual),
    right = extractScriptEntries(expected);
  if (left.length !== right.length) fail("HTML_DRIFT");
  for (let i = right.length - 1; i >= 0; i--) {
    const a = left[i],
      b = right[i];
    if (a.src !== b.src || a.type !== b.type) fail("HTML_DRIFT");
    if (a.body !== b.body) {
      const normalized = normalizeHydration(a.body, b.body);
      actual = actual.slice(0, a.start) + normalized + actual.slice(a.end);
      expected = expected.slice(0, b.start) + normalized + expected.slice(b.end);
    }
  }
  if (actual !== expected) fail("HTML_DRIFT");
  return true;
}

export function requestAllowed(request = {}) {
  try {
    if (typeof request.url !== "string" || /worker|websocket/i.test(request.resourceType || ""))
      return false;
    const url = new URL(request.url),
      method = request.method;
    const rawPath = /^https:\/\/[^/]+([^?#]*)/.exec(request.url)?.[1] || "/";
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hash ||
      url.pathname.includes("%") ||
      rawPath !== url.pathname
    )
      return false;
    if (url.origin === HML_ORIGIN)
      return ["GET", "HEAD"].includes(method) && !url.pathname.startsWith("/_server");
    if (url.origin !== API_ORIGIN) return false;
    if (method === "OPTIONS")
      return (
        requestAllowed({ ...request, method: "GET" }) ||
        requestAllowed({ ...request, method: "POST" })
      );
    if (url.pathname === "/auth/v1/user") return method === "GET" && !url.search;
    if (url.pathname === "/auth/v1/token")
      return (
        method === "POST" &&
        url.searchParams.size === 1 &&
        ["password", "refresh_token"].includes(url.searchParams.get("grant_type"))
      );
    if (url.pathname === "/auth/v1/logout")
      return (
        method === "POST" &&
        (!url.search ||
          (url.searchParams.size === 1 &&
            ["local", "global"].includes(url.searchParams.get("scope"))))
      );
    const rpc = /^\/rest\/v1\/rpc\/([a-z_0-9]+)$/.exec(url.pathname);
    if (rpc) return method === "POST" && RPCS.has(rpc[1]) && !url.search;
    const table = /^\/rest\/v1\/([a-z_0-9]+)$/.exec(url.pathname);
    return !!table && TABLES.has(table[1]) && ["GET", "HEAD"].includes(method);
  } catch {
    return false;
  }
}

export function caseKey(row = {}) {
  if (
    !PRIVATE_SURFACES.includes(row.surface) ||
    !WIDTHS.includes(row.width) ||
    !THEMES.includes(row.theme)
  )
    fail("CASE_POLICY");
  return `${row.surface}_${row.width}_${row.theme}`;
}
export function validateCase(row = {}) {
  try {
    const key = caseKey(row);
    return (
      row.observedWidth === row.width &&
      row.observedTheme === row.theme &&
      row.routeExact === true &&
      row.http === 200 &&
      row.sessionVerified === true &&
      row.organizationVerified === true &&
      row.shellVerified === true &&
      row.h1 === 1 &&
      row.overflowX === 0 &&
      row.brandCount === 1 &&
      row.privacySafe === true &&
      row.errors === 0 &&
      row.blockedMutations === 0 &&
      row.screenshot === `screenshots/${key}.png` &&
      hash64(row.sha256) &&
      row.dom === `dom/${key}.json` &&
      hash64(row.domSha256)
    );
  } catch {
    return false;
  }
}
export function summarizeCases(rows) {
  const keys = new Set();
  let duplicate = false,
    invalid = false,
    passed = 0;
  if (!Array.isArray(rows) || rows.length > 208)
    return { recorded: 0, matrixComplete: false, globalComplete: false, passed: 0 };
  for (const row of rows) {
    try {
      const key = caseKey(row);
      if (keys.has(key)) duplicate = true;
      keys.add(key);
      if (row.status === "PASS_AUTOMATIZADO" && validateCase(row)) passed++;
    } catch {
      invalid = true;
    }
  }
  return {
    recorded: keys.size,
    matrixComplete: !invalid && !duplicate && keys.size === 208 && rows.length === 208,
    globalComplete: false,
    passed,
  };
}
export function safeArtifactText(text, allowedWords) {
  if (typeof text !== "string" || text.length > 1000000 || !(allowedWords instanceof Set))
    return false;
  if (
    /\S+@\S+|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b|\bBearer\b|\beyJ[A-Za-z0-9_-]+\.|sb_secret_/i.test(
      text,
    )
  )
    return false;
  const words =
    text
      .normalize("NFC")
      .toLocaleLowerCase("pt-BR")
      .match(/[\p{L}\p{N}_-]+/gu) || [];
  return words.every((word) => allowedWords.has(word));
}

export const PUBLIC_BUILD_KEYS = [
  "VITE_VERCEL_BRANCH_URL",
  "VITE_VERCEL_DEPLOYMENT_ID",
  "VITE_VERCEL_ENV",
  "VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN",
  "VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME",
  "VITE_VERCEL_GIT_COMMIT_MESSAGE",
  "VITE_VERCEL_GIT_COMMIT_REF",
  "VITE_VERCEL_GIT_COMMIT_SHA",
  "VITE_VERCEL_GIT_PREVIOUS_SHA",
  "VITE_VERCEL_GIT_PROVIDER",
  "VITE_VERCEL_GIT_PULL_REQUEST_ID",
  "VITE_VERCEL_GIT_REPO_ID",
  "VITE_VERCEL_GIT_REPO_OWNER",
  "VITE_VERCEL_GIT_REPO_SLUG",
  "VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG",
  "VITE_VERCEL_PROJECT_ID",
  "VITE_VERCEL_PROJECT_PRODUCTION_URL",
  "VITE_VERCEL_TARGET_ENV",
  "VITE_VERCEL_URL",
];
const CLIENT_PUBLIC_CONFIG = {
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
  VITE_SUPABASE_URL: API_ORIGIN,
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sHKZ-UiYCbkEFMqR1QbHMA_iCSLL8Am",
};
function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (node.text.length > 8192 || node.text.includes("\0")) fail("BUILD_ENV_POLICY");
    return node.text;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.ExclamationToken &&
    ts.isNumericLiteral(node.operand) &&
    ["0", "1"].includes(node.operand.text)
  )
    return node.operand.text === "0";
  fail("BUILD_ENV_POLICY");
}
function validateObservability(raw) {
  try {
    const value = JSON.parse(raw);
    if (Object.keys(value).sort().join() !== "analytics,speedInsights") fail("BUILD_ENV_POLICY");
    for (const [key, fields] of [
      [
        "analytics",
        {
          scriptSrc: "script.js",
          viewEndpoint: "view",
          eventEndpoint: "event",
          sessionEndpoint: "session",
        },
      ],
      ["speedInsights", { scriptSrc: "script.js", endpoint: "vitals" }],
    ]) {
      if (
        !value[key] ||
        Object.keys(value[key]).sort().join() !== Object.keys(fields).sort().join()
      )
        fail("BUILD_ENV_POLICY");
      for (const [field, suffix] of Object.entries(fields)) {
        const path = value[key][field];
        if (typeof path !== "string" || !/^[a-f0-9]{16}\//.test(path) || path.slice(17) !== suffix)
          fail("BUILD_ENV_POLICY");
      }
    }
  } catch {
    fail("BUILD_ENV_POLICY");
  }
}
export function extractPublicBuildEnvironment(modules, expected) {
  if (
    !(modules instanceof Map) ||
    modules.size > 128 ||
    !hash40(expected?.frontendSha) ||
    !/^dpl_[A-Za-z0-9]{8,80}$/.test(expected?.deploymentId || "")
  )
    fail("BUILD_ENV_POLICY");
  const allowedKeys = new Set([...PUBLIC_BUILD_KEYS, ...Object.keys(CLIENT_PUBLIC_CONFIG)]);
  let environment = null,
    total = 0;
  for (const source of modules.values()) {
    total += Buffer.byteLength(source);
    if (total > 8388608) fail("BUILD_ENV_POLICY");
    const file = parseScript(source, "BUILD_ENV_POLICY");
    function visit(node) {
      if (
        ts.isObjectLiteralExpression(node) &&
        node.properties.some((p) => ts.isPropertyAssignment(p) && /^VITE_/.test(p.name.text || ""))
      ) {
        const values = {};
        for (const property of node.properties) {
          if (
            !ts.isPropertyAssignment(property) ||
            ts.isComputedPropertyName(property.name) ||
            !allowedKeys.has(property.name.text) ||
            Object.hasOwn(values, property.name.text)
          )
            fail("BUILD_ENV_POLICY");
          values[property.name.text] = literalValue(property.initializer);
        }
        if (Object.keys(values).length !== allowedKeys.size) fail("BUILD_ENV_POLICY");
        for (const [key, value] of Object.entries(CLIENT_PUBLIC_CONFIG))
          if (values[key] !== value) fail("BUILD_ENV_POLICY");
        const next = {};
        for (const key of PUBLIC_BUILD_KEYS) {
          if (typeof values[key] !== "string") fail("BUILD_ENV_POLICY");
          next[key] = values[key];
        }
        if (environment && PUBLIC_BUILD_KEYS.some((key) => next[key] !== environment[key]))
          fail("BUILD_ENV_POLICY");
        environment = next;
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
  if (
    !environment ||
    environment.VITE_VERCEL_GIT_COMMIT_SHA !== expected.frontendSha ||
    environment.VITE_VERCEL_DEPLOYMENT_ID !== expected.deploymentId
  )
    fail("BUILD_ENV_POLICY");
  const fixed = {
    VITE_VERCEL_BRANCH_URL: "contaos-41-hml-git-main-contaos9999.vercel.app",
    VITE_VERCEL_ENV: "production",
    VITE_VERCEL_TARGET_ENV: "production",
    VITE_VERCEL_GIT_COMMIT_REF: "main",
    VITE_VERCEL_GIT_PROVIDER: "github",
    VITE_VERCEL_GIT_PULL_REQUEST_ID: "",
    VITE_VERCEL_GIT_REPO_ID: "1442722734",
    VITE_VERCEL_GIT_REPO_OWNER: "contaos999999",
    VITE_VERCEL_GIT_REPO_SLUG: "contaos-hml-control",
    VITE_VERCEL_PROJECT_ID: "prj_JtEWXg54EIYcQPwVzFiQyJcVIlFo",
    VITE_VERCEL_PROJECT_PRODUCTION_URL: "contaos-41-hml.vercel.app",
  };
  for (const [key, value] of Object.entries(fixed))
    if (environment[key] !== value) fail("BUILD_ENV_POLICY");
  if (!/^contaos-41-[a-z0-9]+-contaos9999\.vercel\.app$/.test(environment.VITE_VERCEL_URL))
    fail("BUILD_ENV_POLICY");
  if (environment.VITE_VERCEL_GIT_PREVIOUS_SHA && !hash40(environment.VITE_VERCEL_GIT_PREVIOUS_SHA))
    fail("BUILD_ENV_POLICY");
  validateObservability(environment.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG);
  return environment;
}
export function assetBytesMatch(expected, actual) {
  return (
    Buffer.isBuffer(expected) &&
    Buffer.isBuffer(actual) &&
    expected.length === actual.length &&
    actual.length <= 4194304 &&
    createHash("sha256").update(expected).digest("hex") ===
      createHash("sha256").update(actual).digest("hex")
  );
}

export async function startDestinationProxy() {
  const hosts = new Set([new URL(HML_ORIGIN).hostname, new URL(API_ORIGIN).hostname]);
  const sockets = new Set();
  const counts = { blocked: 0, forwarded: 0, connectionFailures: 0 };
  const deny = (socket) => {
    counts.blocked++;
    socket.end("HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
  };
  const server = createServer((_request, response) => {
    counts.blocked++;
    response.writeHead(403, { "Content-Length": "0", Connection: "close" });
    response.end();
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    socket.setTimeout(120000, () => socket.destroy());
  });
  server.on("clientError", (_error, socket) => deny(socket));
  server.on("connect", (request, client, head) => {
    const target = /^([a-z0-9.-]+):443$/.exec(request.url || "");
    if (!target || !hosts.has(target[1]) || request.headers.host !== request.url)
      return deny(client);
    const upstream = connect({ host: target[1], port: 443 });
    sockets.add(upstream);
    upstream.once("close", () => sockets.delete(upstream));
    upstream.setTimeout(15000, () => upstream.destroy());
    upstream.once("connect", () => {
      counts.forwarded++;
      upstream.setTimeout(120000, () => upstream.destroy());
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length) upstream.write(head);
      client.pipe(upstream);
      upstream.pipe(client);
    });
    upstream.on("error", () => {
      counts.connectionFailures++;
      client.destroy();
    });
    client.on("error", () => upstream.destroy());
    client.once("close", () => upstream.destroy());
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    snapshot: () => ({ ...counts }),
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

export function browserEnvironment(source = {}) {
  const result = {};
  for (const key of ["PATH", "HOME", "TMPDIR", "RUNNER_TEMP", "XDG_CACHE_HOME", "LANG", "TZ", "CI"])
    if (typeof source[key] === "string" && !source[key].includes("\0")) result[key] = source[key];
  return result;
}
export function nativeDebuggerEndpoint(value, port) {
  try {
    const url = new URL(value);
    if (
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      url.protocol !== "ws:" ||
      url.hostname !== "127.0.0.1" ||
      Number(url.port) !== port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/^\/devtools\/browser\/[a-f0-9-]{36}$/i.test(url.pathname)
    )
      fail("CDP_ENDPOINT");
    return url.href;
  } catch {
    fail("CDP_ENDPOINT");
  }
}
export async function connectNativeCDP(port, identity) {
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !identity?.targetId ||
    !identity?.browserContextId
  )
    fail("CDP_ENDPOINT");
  let endpoint;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
      redirect: "error",
      credentials: "omit",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) fail("CDP_METADATA");
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 16384) fail("CDP_METADATA");
      chunks.push(Buffer.from(chunk));
    }
    endpoint = nativeDebuggerEndpoint(
      JSON.parse(Buffer.concat(chunks).toString("utf8")).webSocketDebuggerUrl,
      port,
    );
  } catch {
    fail("CDP_METADATA");
  }
  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.close();
      reject(Object.assign(new Error("CDP_CONNECT"), { code: "CDP_CONNECT" }));
    }, 10000);
    socket.addEventListener(
      "open",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
    socket.addEventListener(
      "error",
      () => {
        clearTimeout(timer);
        reject(Object.assign(new Error("CDP_CONNECT"), { code: "CDP_CONNECT" }));
      },
      { once: true },
    );
  });
  let serial = 0,
    listener = () => {},
    closedListener = () => {},
    closed = false;
  const commands = new Map();
  function rejectPending(code) {
    for (const pending of commands.values()) {
      clearTimeout(pending.timer);
      pending.reject(Object.assign(new Error(code), { code }));
    }
    commands.clear();
  }
  socket.addEventListener("message", (event) => {
    let data;
    try {
      if (typeof event.data !== "string" || event.data.length > 8388608) fail("CDP_FRAME");
      data = JSON.parse(event.data);
    } catch {
      rejectPending("CDP_FRAME");
      socket.close();
      return;
    }
    if (data.id) {
      const pending = commands.get(data.id);
      if (!pending) return;
      commands.delete(data.id);
      clearTimeout(pending.timer);
      if (data.error)
        pending.reject(
          Object.assign(new Error("CDP_COMMAND"), { code: "CDP_COMMAND", command: pending.method }),
        );
      else pending.resolve(data.result ?? {});
    } else {
      try {
        listener(data);
      } catch {
        rejectPending("CDP_EVENT");
        socket.close();
      }
    }
  });
  socket.addEventListener("close", () => {
    closed = true;
    rejectPending("CDP_CLOSED");
    closedListener();
  });
  const transport = {
    send(method, params = {}, sessionId) {
      if (
        closed ||
        socket.readyState !== WebSocket.OPEN ||
        commands.size >= 2048 ||
        !/^[A-Za-z]+\.[A-Za-z]+$/.test(method)
      )
        return Promise.reject(Object.assign(new Error("CDP_CLOSED"), { code: "CDP_CLOSED" }));
      const id = ++serial;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          commands.delete(id);
          reject(Object.assign(new Error("CDP_TIMEOUT"), { code: "CDP_TIMEOUT" }));
        }, 10000);
        commands.set(id, { resolve, reject, timer, method });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    },
    onEvent(callback) {
      listener = callback;
    },
    onClose(callback) {
      closedListener = callback;
    },
    close() {
      closed = true;
      rejectPending("CDP_CLOSED");
      socket.close();
    },
  };
  try {
    const result = await transport.send("Target.getTargetInfo", { targetId: identity.targetId });
    if (
      result.targetInfo?.targetId !== identity.targetId ||
      result.targetInfo?.browserContextId !== identity.browserContextId
    )
      fail("CDP_IDENTITY");
  } catch {
    transport.close();
    fail("CDP_IDENTITY");
  }
  return transport;
}

export async function installNativeFence({
  debugPort,
  identity,
  closeContext,
  verifyResponse,
  policy = requestAllowed,
}) {
  if (
    typeof closeContext !== "function" ||
    typeof verifyResponse !== "function" ||
    typeof policy !== "function"
  )
    fail("FENCE_CONFIGURATION");
  const root = await connectNativeCDP(debugPort, identity);
  const sessions = new Map(),
    active = new Set();
  const state = {
    failed: false,
    failureCode: null,
    verifiedDocuments: 0,
    verifiedScripts: 0,
    verifiedAssets: 0,
    blockedRequests: 0,
    redirectBlocks: 0,
    workersPaused: 0,
    workersResumed: 0,
    popups: 0,
  };
  let closed = false,
    resolveInitial,
    rejectInitial;
  const initial = new Promise((resolve, reject) => {
    resolveInitial = resolve;
    rejectInitial = reject;
  });
  initial.catch(() => {});
  function invalidate(error) {
    if (state.failed || closed) return;
    state.failed = true;
    state.failureCode = /^(?:CDP|FENCE)_[A-Z_]{1,80}$/.test(error?.code || "")
      ? error.code
      : "FENCE_ASYNC";
    rejectInitial(
      Object.assign(new Error(state.failureCode), {
        code: state.failureCode,
        ...(typeof error?.command === "string" ? { command: error.command } : {}),
      }),
    );
    void Promise.resolve(closeContext()).catch(() => {});
  }
  function track(promise) {
    active.add(promise);
    promise.catch(invalidate).finally(() => active.delete(promise));
  }
  const send = (session, method, params = {}) => root.send(method, params, session.id);
  async function paused(session, event) {
    const requestId = event.requestId;
    try {
      if (
        state.failed ||
        closed ||
        session.contextId !== identity.browserContextId ||
        session.targetId !== identity.targetId ||
        !policy({
          url: event.request.url,
          method: event.request.method,
          resourceType: event.resourceType,
        })
      ) {
        state.blockedRequests++;
        fail("FENCE_REQUEST");
      }
      const response =
        event.responseStatusCode !== undefined || event.responseErrorReason !== undefined;
      if (!response) {
        await send(session, "Fetch.continueRequest", { requestId });
        return;
      }
      if (event.responseErrorReason) fail("FENCE_TRANSPORT");
      if (event.responseStatusCode >= 300 && event.responseStatusCode < 400) {
        state.redirectBlocks++;
        fail("FENCE_REDIRECT");
      }
      let body;
      if (new URL(event.request.url).origin === HML_ORIGIN) {
        const result = await send(session, "Fetch.getResponseBody", { requestId });
        if (typeof result.body !== "string" || result.body.length > 5592408)
          fail("FENCE_BODY_LIMIT");
        body = Buffer.from(result.body, result.base64Encoded ? "base64" : "utf8");
        if (body.length > (event.resourceType === "Document" ? 262144 : 4194304))
          fail("FENCE_BODY_LIMIT");
      }
      const verified = await verifyResponse({
        url: event.request.url,
        resourceType: event.resourceType,
        status: event.responseStatusCode,
        body,
      });
      if (verified !== true || state.failed || closed) fail("FENCE_SOURCE");
      if (event.resourceType === "Document") state.verifiedDocuments++;
      else if (event.resourceType === "Script") state.verifiedScripts++;
      else if (body) state.verifiedAssets++;
      await send(session, "Fetch.continueResponse", { requestId });
    } catch (error) {
      await send(session, "Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(
        () => {},
      );
      invalidate(error);
    }
  }
  // Browser and tab are protocol containers, not executable renderer targets.
  // Every renderer type, including future worklets, is paused and inspected.
  const filter = [{ type: "browser", exclude: true }, { type: "tab", exclude: true }, {}];
  function attach(event, parent) {
    const session = {
      id: event.sessionId,
      targetId: event.targetInfo.targetId,
      contextId: event.targetInfo.browserContextId ?? parent?.contextId,
      type: event.targetInfo.type,
    };
    sessions.set(session.id, session);
    if (!session.contextId) {
      invalidate({ code: "FENCE_CONTEXT_UNKNOWN" });
      return;
    }
    if (session.contextId !== identity.browserContextId) {
      invalidate({ code: "FENCE_CONTEXT_FOREIGN" });
      return;
    }
    if (["worker", "shared_worker", "service_worker"].includes(session.type)) {
      if (event.waitingForDebugger) state.workersPaused++;
      invalidate({
        code: event.waitingForDebugger ? "FENCE_WORKER_PAUSED" : "FENCE_WORKER_RUNNING",
      });
      return;
    }
    if (session.type !== "page" || session.targetId !== identity.targetId) {
      state.popups++;
      invalidate({ code: "FENCE_POPUP" });
      return;
    }
    track(
      (async () => {
        await send(session, "Page.enable");
        await send(session, "Network.enable");
        await send(session, "Network.setBlockedURLs", { urls: ["ws://*", "wss://*"] });
        const denied = await send(session, "Network.emulateNetworkConditionsByRule", {
          matchedNetworkConditions: ["ws://*:*/*", "wss://*:*/*"].map((urlPattern) => ({
            urlPattern,
            offline: true,
            latency: 0,
            downloadThroughput: -1,
            uploadThroughput: -1,
          })),
        });
        if (denied.ruleIds?.length !== 2) fail("FENCE_WEBSOCKET_RULES");
        await send(session, "Fetch.enable", {
          patterns: [
            { urlPattern: "*", requestStage: "Request" },
            { urlPattern: "*", requestStage: "Response" },
          ],
        });
        await send(session, "Target.setAutoAttach", {
          autoAttach: true,
          waitForDebuggerOnStart: true,
          flatten: true,
          filter,
        });
        if (state.failed || closed) fail("FENCE_TARGET_FAILED");
        await send(session, "Runtime.runIfWaitingForDebugger");
        resolveInitial();
      })(),
    );
  }
  root.onClose(() => {
    if (!closed) invalidate({ code: "FENCE_CDP_CLOSED" });
  });
  root.onEvent((event) => {
    const session = sessions.get(event.sessionId);
    if (event.method === "Target.attachedToTarget") attach(event.params, session);
    else if (event.method === "Target.detachedFromTarget") {
      const removed = sessions.get(event.params.sessionId);
      sessions.delete(event.params.sessionId);
      if (!closed && removed?.targetId === identity.targetId)
        invalidate({ code: "FENCE_TARGET_DETACHED" });
    } else if (session?.contextId === identity.browserContextId) {
      if (event.method === "Fetch.requestPaused") track(paused(session, event.params));
      else if (event.method === "Page.windowOpen") {
        state.popups++;
        invalidate({ code: "FENCE_POPUP" });
      }
    }
  });
  let timer;
  try {
    await root.send("Target.autoAttachRelated", {
      targetId: identity.targetId,
      waitForDebuggerOnStart: true,
      filter,
    });
    await Promise.race([
      initial,
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              Object.assign(new Error("FENCE_TARGET_TIMEOUT"), { code: "FENCE_TARGET_TIMEOUT" }),
            ),
          10000,
        );
      }),
    ]);
    if (state.failed || closed) fail("FENCE_INITIALIZATION");
  } catch (error) {
    invalidate(error);
    root.close();
    throw error;
  } finally {
    clearTimeout(timer);
  }
  return {
    snapshot: () => ({ ...state }),
    assertSafe() {
      if (state.failed || closed || state.verifiedDocuments === 0 || state.verifiedScripts === 0)
        fail("FENCE_NOT_PROVEN");
    },
    async drain() {
      for (let i = 0; active.size && i < 100; i++) await Promise.allSettled([...active]);
    },
    close() {
      closed = true;
      root.close();
    },
  };
}

function publicUrl(value, base = HML_ORIGIN) {
  let url;
  try {
    url = new URL(value, base);
  } catch {
    fail("GRAPH_DESTINATION");
  }
  if (
    url.origin !== HML_ORIGIN ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname.includes("%") ||
    url.pathname.startsWith("/_server")
  )
    fail("GRAPH_DESTINATION");
  return url.href;
}
export async function boundedPublicFetch(value, limit, fetcher = fetch) {
  const url = publicUrl(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 4194304 || typeof fetcher !== "function")
    fail("PUBLIC_FETCH");
  try {
    const response = await fetcher(url, {
      redirect: "error",
      credentials: "omit",
      signal: AbortSignal.timeout(15000),
      headers: { "cache-control": "no-cache" },
    });
    if (response.status !== 200 || response.redirected || response.url !== url || !response.body)
      fail("PUBLIC_FETCH");
    const declared = response.headers.get("content-length");
    if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > limit))
      fail("PUBLIC_FETCH");
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > limit) fail("PUBLIC_FETCH");
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    fail("PUBLIC_FETCH");
  }
}
export async function discoverPublicGraph({ fetcher = fetch } = {}) {
  const deadline = Date.now() + 180000;
  const html = new TextDecoder("utf-8", { fatal: true }).decode(
    await boundedPublicFetch(HML_ORIGIN + "/login", 262144, fetcher),
  );
  const pending = [];
  function add(value, base) {
    const url = publicUrl(value, base);
    if (!/^\/assets\/[A-Za-z0-9_.-]+\.js$/.test(new URL(url).pathname)) fail("GRAPH_DESTINATION");
    if (!pending.includes(url)) pending.push(url);
  }
  for (const script of extractScriptEntries(html)) {
    if (script.src) add(script.src, HML_ORIGIN);
    else if (
      ["classic", "module", "text/javascript", "application/javascript"].includes(script.type)
    )
      for (const child of scriptImports(script.body)) add(child, HML_ORIGIN + "/assets/inline.js");
  }
  const modules = new Map();
  let bytes = 0;
  for (let index = 0; index < pending.length;) {
    if (pending.length > 128) fail("GRAPH_MODULE_LIMIT");
    if (Date.now() > deadline) fail("GRAPH_DEADLINE");
    const batch = pending.slice(index, index + 4);
    index += batch.length;
    const results = await Promise.all(
      batch.map(async (url) => {
        const body = await boundedPublicFetch(url, 4194304, fetcher);
        bytes += body.length;
        if (bytes > 8388608) fail("GRAPH_BYTE_LIMIT");
        let source;
        try {
          source = new TextDecoder("utf-8", { fatal: true }).decode(body);
        } catch {
          fail("SCRIPT_POLICY");
        }
        return { url, source };
      }),
    );
    for (const { url, source } of results) {
      modules.set(url, source);
      for (const child of scriptImports(source)) add(child, url);
    }
  }
  if (!modules.size) fail("GRAPH_EMPTY");
  return { html, modules, bytes };
}

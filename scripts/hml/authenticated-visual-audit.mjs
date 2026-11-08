import { readFile, mkdir, writeFile, appendFile, lstat, rm, readdir } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { connect } from "node:net";
import ts from "typescript";

const require = createRequire(import.meta.url);
const parse5 = createRequire(require.resolve("jsdom"))("parse5");
export const HML_ORIGIN = "https://contaos-41-hml.vercel.app";
export const API_ORIGIN = "https://gklhhhyosgasnyoxlrui.supabase.co";
const FENCE_COMMANDS = new Set([
  "Target.getTargetInfo",
  "Target.autoAttachRelated",
  "Target.setAutoAttach",
  "Runtime.runIfWaitingForDebugger",
  "Page.enable",
  "Network.enable",
  "Network.setCacheDisabled",
  "Network.setBlockedURLs",
  "Fetch.enable",
  "Fetch.continueRequest",
  "Fetch.getResponseBody",
  "Fetch.fulfillRequest",
  "Fetch.continueResponse",
  "Fetch.failRequest",
]);
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
      !["0", "1"].includes(ssr.operand.text)
    )
      fail("HTML_DRIFT");
    // These states come exclusively from the trusted local SSR document. A
    // private ssr:false route is pending on the server, unlike the login route.
    // No state/flag/identity bytes in the remote payload are normalized.
    const serverRendered = status.text === "success" && ssr.operand.text === "0";
    const clientPending = index === 1 && status.text === "pending" && ssr.operand.text === "1";
    if (!serverRendered && !clientPending) fail("HTML_DRIFT");
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
      return (
        ["GET", "HEAD"].includes(method) && !url.search && !url.pathname.startsWith("/_server")
      );
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
      brandStateValid(row) &&
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
// Closed synthetic excerpts, proved by the versioned V107/V111 DOM manifests.
// Match whole excerpts; do not add their individual words to the global dictionary.
const SYNTHETIC_EXCERPTS = Object.freeze([
  "AUD-A-VERCEL-20261108",
  "AUDITORIA TRILHA A VERCEL 20261108",
  "Registro sintético para testes autenticados HML",
  "Contrato sintético de homologação para auditoria autenticada da Trilha A, sem efeitos financeiros reais.",
  "direcao aprovador",
  "juridico conformidade",
  "prestacao contas",
  "rh dp",
  "08/11/2026 00:58",
  "01/01/2026",
  "2026-01-01",
  "2de433a7-a84c-4575-aa2a-7699d2871b55",
  "773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103",
  "08/11/2026 08:01",
  "Fonte exclusivamente sintética para auditoria em homologação. Sem efeito jurídico ou financeiro. Vinculação descritiva ao TXT de teste já persistido; não representa análise ou validação de segurança do arquivo.",
  "Fonte sintética para auditoria autenticada da Trilha A, sem dados pessoais ou efeito real.",
  "285 bytes",
  "Etapa: documents",
  "text/plain",
  "CONTAOS HML - FONTE SINTETICA DE AUDITORIA",
  "Documento exclusivamente de teste, sem efeitos juridicos ou financeiros.",
  "Criterio sintetico: anexar um documento de teste identificado como evidencia da auditoria da Trilha A.",
  "A avaliacao e as permissoes permanecem sob autoridade do backend.",
]);
const SYNTHETIC_EXCERPT_PATTERN = new RegExp(
  String.raw`(?<![\p{L}\p{N}_-])(?:` +
    [...SYNTHETIC_EXCERPTS]
      .sort((a, b) => b.length - a.length)
      .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|") +
    String.raw`)(?![\p{L}\p{N}_-])`,
  "gu",
);
export function classifyArtifactText(text, allowedWords, { snapshot = false } = {}) {
  if (typeof text !== "string" || text.length > 1000000 || !(allowedWords instanceof Set))
    return { reason: "INVALID_CONTENT", unknownCount: 0 };
  if (
    /\S+@\S+|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b|\bBearer\b|\beyJ[A-Za-z0-9_-]+\.|sb_secret_/i.test(
      text,
    )
  )
    return { reason: "SENSITIVE_PATTERN", unknownCount: 0 };
  let invalidDate = false;
  let remainder = text
    .normalize("NFC")
    .replace(/Atualizado em(?=[ \t]+\d)[^\r\n]*/gu, (candidate, offset, full) => {
      // Validate the entire labelled field, including malformed suffixes.
      const quoted = full[offset - 1] === '"';
      const value = quoted && candidate.endsWith('"') ? candidate.slice(0, -1) : candidate;
      if (!/^Atualizado em 08\/11\/2026 (?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) {
        invalidDate = true;
        return value;
      }
      return " ";
    });
  if (invalidDate) return { reason: "INVALID_CONTENT", unknownCount: 0 };
  remainder = remainder.replace(SYNTHETIC_EXCERPT_PATTERN, " ");
  if (snapshot)
    remainder = remainder.replace(/^[\t ]*-\s+(?:application|caption|searchbox)(?=[:\s])/gmu, "");
  const words = remainder.toLocaleLowerCase("pt-BR").match(/[\p{L}\p{N}_-]+/gu) || [];
  const unknownCount = Math.min(233, words.filter((word) => !allowedWords.has(word)).length);
  return { reason: unknownCount ? "UNKNOWN_WORDS" : "ALLOWED", unknownCount };
}
export function safeArtifactText(text, allowedWords, options) {
  return classifyArtifactText(text, allowedWords, options).reason === "ALLOWED";
}
export function preservedPrivateCase(item) {
  if (
    !item ||
    !["V114", "V116", "V118"].includes(item.surface) ||
    !WIDTHS.includes(item.width) ||
    !THEMES.includes(item.theme)
  )
    return null;
  return {
    ...item,
    status: "PRESERVADO_BASELINE",
    baselineRun: 42496235106,
    baselineArtifact: 13623288351,
    baselineFrontendSha: "9b18e4857b03daa6ee09ad3382184480e2014728",
    baselineZipSha256: "bc2a8b74e1ba9ff008ed67ce0f398c47ce120924cf69b5210d62f8165291d2c6",
  };
}

export function completePrivateRecords(records) {
  const keys = new Set(records.map(caseKey));
  for (const item of privateCases())
    if (!keys.has(caseKey(item)))
      records.push(
        preservedPrivateCase(item) || {
          ...item,
          status: item.fixtureBlocked ? "BLOQUEADO_FIXTURE" : "BLOQUEADO_EXECUCAO_INTERROMPIDA",
        },
      );
  return records;
}
export function classifyCdpError(error) {
  const codes = new Set([-32000, -32600, -32601, -32602, -32700]);
  const reasons = new Map([
    ["No resource with given identifier found", "NO_RESOURCE"],
    ["Invalid InterceptionId.", "INVALID_INTERCEPTION"],
    ["Can only get response body on requests captured after headers received.", "BODY_STAGE"],
  ]);
  return {
    protocolCode: codes.has(error?.code) ? error.code : null,
    reason: reasons.get(error?.message) || "OTHER",
  };
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
function inspectPublicBuildEnvironment(modules) {
  if (!(modules instanceof Map) || modules.size > 128) fail("BUILD_ENV_POLICY");
  // Diagnostic codes contain no values, URLs, tokens, or module contents.
  const deny = (reason) => {
    const error = new Error("BUILD_ENV_POLICY");
    error.code = "BUILD_ENV_POLICY";
    error.reason = reason;
    throw error;
  };
  const allowedKeys = new Set([...PUBLIC_BUILD_KEYS, ...Object.keys(CLIENT_PUBLIC_CONFIG)]);
  let environment = null,
    total = 0;
  for (const source of modules.values()) {
    total += Buffer.byteLength(source);
    if (total > 8388608) deny("MODULE_BYTES_LIMIT");
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
            deny("ENV_OBJECT_PROPERTY");
          values[property.name.text] = literalValue(property.initializer);
        }
        if (Object.keys(values).length !== allowedKeys.size) deny("ENV_OBJECT_KEY_COUNT");
        for (const [key, value] of Object.entries(CLIENT_PUBLIC_CONFIG))
          if (values[key] !== value) deny("CLIENT_CONFIG_MISMATCH");
        const next = {};
        for (const key of PUBLIC_BUILD_KEYS) {
          if (typeof values[key] !== "string") deny("PUBLIC_CONFIG_TYPE");
          next[key] = values[key];
        }
        if (environment && PUBLIC_BUILD_KEYS.some((key) => next[key] !== environment[key]))
          deny("ENV_OBJECT_CONFLICT");
        environment = next;
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
  if (
    !environment ||
    !hash40(environment.VITE_VERCEL_GIT_COMMIT_SHA) ||
    !/^dpl_[A-Za-z0-9]{8,80}$/.test(environment.VITE_VERCEL_DEPLOYMENT_ID)
  )
    deny("DEPLOYMENT_IDENTITY_MISMATCH");
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
    if (environment[key] !== value) deny("VERCEL_FIXED_METADATA_MISMATCH");
  if (!/^contaos-41-[a-z0-9]+-contaos9999\.vercel\.app$/.test(environment.VITE_VERCEL_URL))
    deny("VERCEL_URL_POLICY");
  if (environment.VITE_VERCEL_GIT_PREVIOUS_SHA && !hash40(environment.VITE_VERCEL_GIT_PREVIOUS_SHA))
    deny("PREVIOUS_SHA_POLICY");
  validateObservability(environment.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG);
  return environment;
}
function deploymentIdentityValid(identity) {
  return (
    hash40(identity?.frontendSha) && /^dpl_[A-Za-z0-9]{8,80}$/.test(identity?.deploymentId || "")
  );
}
export function extractPublicBuildEnvironment(modules, expected) {
  if (!deploymentIdentityValid(expected)) fail("BUILD_ENV_POLICY");
  const environment = inspectPublicBuildEnvironment(modules);
  if (
    environment.VITE_VERCEL_GIT_COMMIT_SHA !== expected.frontendSha ||
    environment.VITE_VERCEL_DEPLOYMENT_ID !== expected.deploymentId
  )
    throw Object.assign(new Error("BUILD_ENV_POLICY"), {
      code: "BUILD_ENV_POLICY",
      reason: "DEPLOYMENT_IDENTITY_MISMATCH",
    });
  return environment;
}
export function resolveDeploymentIdentity(modules, requested = {}) {
  const empty = (value) => value === undefined || value === "";
  const automatic = empty(requested.frontendSha) && empty(requested.deploymentId);
  if (!automatic && !deploymentIdentityValid(requested)) fail("DEPLOYMENT_INPUT");
  // Discovery returns a candidate, never a proof: ancestry and byte/SSR parity
  // remain mandatory before this source may receive credentials.
  const environment = inspectPublicBuildEnvironment(modules);
  const identity = {
    frontendSha: environment.VITE_VERCEL_GIT_COMMIT_SHA,
    deploymentId: environment.VITE_VERCEL_DEPLOYMENT_ID,
  };
  if (
    !automatic &&
    (requested.frontendSha !== identity.frontendSha ||
      requested.deploymentId !== identity.deploymentId)
  )
    fail("DEPLOYMENT_PIN_STALE");
  return identity;
}
export function deploymentWorkflowOutputs(identity) {
  if (!deploymentIdentityValid(identity)) fail("DEPLOYMENT_INPUT");
  return {
    environment: `CONTAOS_FRONTEND_SHA=${identity.frontendSha}\nCONTAOS_DEPLOYMENT_ID=${identity.deploymentId}\n`,
    outputs: `frontend_sha=${identity.frontendSha}\ndeployment_id=${identity.deploymentId}\n`,
  };
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
          Object.assign(new Error("CDP_COMMAND"), {
            code: "CDP_COMMAND",
            command: pending.method,
            ...classifyCdpError(data.error),
          }),
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
    failureCommand: null,
    failureProtocolCode: null,
    failureReason: null,
    verifiedDocuments: 0,
    verifiedScripts: 0,
    verifiedAssets: 0,
    blockedRequests: 0,
    redirectBlocks: 0,
    redirectStatus: null,
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
    state.failureCommand = FENCE_COMMANDS.has(error?.command) ? error.command : null;
    state.failureProtocolCode = [-32000, -32600, -32601, -32602, -32700].includes(
      error?.protocolCode,
    )
      ? error.protocolCode
      : null;
    state.failureReason = ["NO_RESOURCE", "INVALID_INTERCEPTION", "BODY_STAGE", "OTHER"].includes(
      error?.reason,
    )
      ? error.reason
      : null;
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
        await send(session, "Fetch.continueRequest", { requestId, interceptResponse: true });
        return;
      }
      if (event.responseErrorReason) fail("FENCE_TRANSPORT");
      if (event.responseStatusCode >= 300 && event.responseStatusCode < 400) {
        state.redirectBlocks++;
        state.redirectStatus = event.responseStatusCode;
        fail("FENCE_REDIRECT");
      }
      let body;
      if (new URL(event.request.url).origin === HML_ORIGIN || event.resourceType === "Document") {
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
      if (event.resourceType === "Document") {
        if (!Buffer.isBuffer(body)) fail("FENCE_DOCUMENT_BODY");
        const responseHeaders = guardedResponseHeaders(event.responseHeaders).filter(
          (header) =>
            !["content-length", "content-encoding", "transfer-encoding"].includes(
              header.name.toLowerCase(),
            ),
        );
        responseHeaders.push({ name: "Content-Length", value: String(body.length) });
        await send(session, "Fetch.fulfillRequest", {
          requestId,
          responseCode: event.responseStatusCode,
          responseHeaders,
          body: body.toString("base64"),
        });
      } else await send(session, "Fetch.continueResponse", { requestId });
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
        // Every intercepted response needs a complete body for byte comparison.
        // Revalidations (304) remain forbidden; request full responses instead.
        await send(session, "Network.setCacheDisabled", { cacheDisabled: true });
        await send(session, "Network.setBlockedURLs", { urls: ["ws://*", "wss://*"] });
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

export function guardedResponseHeaders(headers) {
  if (
    !Array.isArray(headers) ||
    headers.length > 256 ||
    headers.some(
      (h) =>
        typeof h?.name !== "string" ||
        typeof h?.value !== "string" ||
        !/^[A-Za-z0-9-]+$/.test(h.name) ||
        /[\r\n\0]/.test(h.value),
    )
  )
    fail("FENCE_HEADERS");
  return [
    ...headers.map((h) => ({ name: h.name, value: h.value })),
    {
      name: "Content-Security-Policy",
      value: `connect-src ${HML_ORIGIN} ${API_ORIGIN}; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'`,
    },
  ];
}

export const SYNTHETIC_FIXTURE = Object.freeze({
  organizationName: "ContaOS HML Teste",
  contractor: "041ebf9f-5e32-4744-80d6-d745fa5fc483",
  contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
  competence: "59072760-4420-4598-82dd-367f41a79e89",
  document: "525e54fc-feec-4dc0-b540-1510a3c52485",
});
export function privateCases() {
  const f = SYNTHETIC_FIXTURE,
    c = "/contratos/" + f.contract,
    m = "/competencias/" + f.competence;
  const routes = {
    SYS04: "/selecionar-organizacao",
    SYS05: "/",
    ADM01: "/administracao/usuarios",
    V101: "/contratantes",
    V102: "/contratantes/novo",
    V103: "/contratantes/" + f.contractor + "/editar",
    V104: "/contratos",
    V105: "/contratos/novo",
    V106: c,
    V107: c + "/base-normativa",
    V108: c + "/orcamento",
    V109: c + "/regras",
    V110: c + "/documentos",
    V111: c + "/documentos/" + f.document,
    V112: c + "/competencias",
    V113: c + "/competencias/nova",
    V114: m,
    V115: m + "/documentos",
    V116: m + "/analise",
    V117: null,
    V118: m + "/parecer",
    V119: null,
    V120: null,
    V121: c + "/historico",
    V122: c + "/historico/importar",
    V123: "/administracao/auditoria",
  };
  return PRIVATE_SURFACES.flatMap((surface) =>
    WIDTHS.flatMap((width) =>
      THEMES.map((theme) => ({
        surface,
        width,
        theme,
        path: routes[surface],
        fixtureBlocked: routes[surface] === null,
      })),
    ),
  );
}

const execFile = promisify(execFileCallback);
const digest = (value) => createHash("sha256").update(value).digest("hex");
export async function trustedAsset(root, url) {
  const target = new URL(publicUrl(url));
  if (
    !/^\/(?:assets|brand)\/[A-Za-z0-9_./-]+$/.test(target.pathname) &&
    !/^\/(?:favicon[^/]*|manifest\.webmanifest)$/.test(target.pathname)
  )
    fail("ASSET_PATH");
  const file = resolve(root, "." + target.pathname);
  if (!file.startsWith(resolve(root) + "/")) fail("ASSET_PATH");
  const stat = await lstat(file).catch(() => null);
  if (!stat?.isFile() || stat.isSymbolicLink() || stat.size > 4194304) fail("ASSET_PATH");
  return readFile(file);
}
export async function preparePublicProvenance({
  sourceRoot,
  frontendSha,
  harnessSha,
  deploymentId,
  bun = "bun",
}) {
  if (
    !hash40(frontendSha) ||
    !hash40(harnessSha) ||
    !/^dpl_[A-Za-z0-9]{8,80}$/.test(deploymentId ?? "") ||
    typeof sourceRoot !== "string" ||
    basename(bun) !== "bun"
  )
    fail("PREPARE_CONFIGURATION");
  const root = resolve(sourceRoot),
    env = browserEnvironment(process.env);
  if (
    [
      "CONTAOS_HML_SYNTHETIC_EMAIL",
      "CONTAOS_HML_SYNTHETIC_PASSWORD",
      "DATABASE_URL",
      "AUTH_ADMIN_KEY",
      "CONTAOS_HML_AUTH_ADMIN_KEY",
      "GH_TOKEN",
    ].some((key) => !!process.env[key])
  )
    fail("PREPARE_SECRET_ENV");
  if (!(await sourceTreeClean(root))) fail("PREPARE_DIRTY");
  for (const cache of [".output", ".tanstack", ".nitro", "dist", ".wrangler"])
    await rm(join(root, cache), { recursive: true, force: true });

  try {
    const actual = await execFile("git", ["rev-parse", "HEAD"], { cwd: root, env });
    if (actual.stdout.trim() !== frontendSha) fail("PREPARE_SHA");
    await execFile("git", ["merge-base", "--is-ancestor", frontendSha, "origin/main"], {
      cwd: root,
      env,
    });
    const version = await execFile(bun, ["--version"], { cwd: root, env });
    if (version.stdout.trim() !== "1.4.4") fail("PREPARE_BUN");
  } catch (error) {
    if (error.code === "PREPARE_SHA" || error.code === "PREPARE_BUN") throw error;
    fail("PREPARE_SOURCE");
  }
  const graph = await discoverPublicGraph(),
    publicEnv = extractPublicBuildEnvironment(graph.modules, { frontendSha, deploymentId });
  try {
    await execFile(bun, ["run", "build"], {
      cwd: root,
      env: { ...env, ...publicEnv },
      timeout: 180000,
      maxBuffer: 2097152,
    });
  } catch {
    fail("PREPARE_BUILD");
  }
  if (!(await sourceTreeClean(root))) fail("PREPARE_DIRTY");
  const publicRoot = join(root, ".output/public"),
    moduleHashes = {};
  for (const [url, source] of graph.modules) {
    const local = await trustedAsset(publicRoot, url),
      actual = Buffer.from(source);
    if (!assetBytesMatch(local, actual)) fail("PREPARE_MODULE_DRIFT");
    moduleHashes[new URL(url).pathname] = digest(local);
  }
  let server;
  try {
    server = (await import(pathToFileURL(join(root, ".output/server/index.mjs")).href)).default;
  } catch {
    fail("PREPARE_SSR");
  }
  if (typeof server?.fetch !== "function") fail("PREPARE_SSR");
  const documents = {};
  for (const path of new Set([
    "/login",
    ...privateCases()
      .filter((r) => r.path)
      .map((r) => r.path),
  ])) {
    let response;
    try {
      response = await server.fetch(new Request(HML_ORIGIN + path), {}, { waitUntil() {} });
    } catch {
      fail("PREPARE_SSR");
    }
    if (response.status !== 200) fail("PREPARE_SSR");
    const html = await response.text();
    extractScriptEntries(html);
    documents[path] = html;
  }
  if (!compareHtml(graph.html, documents["/login"])) fail("PREPARE_HTML_DRIFT");
  // Re-fetch all modules once after the trusted build. Deployments changing in
  // this interval invalidate preparation, never an authenticated case.
  const check = await discoverPublicGraph();
  extractPublicBuildEnvironment(check.modules, { frontendSha, deploymentId });
  if (check.modules.size !== graph.modules.size) fail("PREPARE_GRAPH_DRIFT");
  for (const [url, source] of check.modules)
    if (digest(source) !== moduleHashes[new URL(url).pathname]) fail("PREPARE_GRAPH_DRIFT");
  if (!compareHtml(check.html, documents["/login"])) fail("PREPARE_HTML_DRIFT");
  return {
    schema: "contaos.private.provenance.v1",
    frontendSha,
    harnessSha,
    deploymentId,
    moduleCount: graph.modules.size,
    moduleBytes: graph.bytes,
    moduleHashes,
    documents,
    publicRoot,
  };
}
export async function runCli(args = process.argv.slice(2)) {
  if (
    args.length !== 1 ||
    !["--resolve-deployment", "--prepare", "--native-guard", "--audit"].includes(args[0])
  )
    fail("CLI_MODE");
  const harnessRoot = fileURLToPath(new URL("../../", import.meta.url));
  try {
    const options = { cwd: harnessRoot, env: browserEnvironment(process.env), maxBuffer: 4194304 };
    const head = await execFile("git", ["rev-parse", "HEAD"], options);
    if (head.stdout.trim() !== process.env.CONTAOS_HARNESS_SHA) fail("HARNESS_SHA");
    for (const path of [
      "scripts/hml/authenticated-visual-audit.mjs",
      "scripts/hml/authenticated-visual-audit.test.mjs",
      ".github/workflows/contaos-trilha-a-authenticated.yml",
    ]) {
      const committed = await execFile("git", ["show", "HEAD:" + path], options);
      if (committed.stdout !== (await readFile(join(harnessRoot, path), "utf8")))
        fail("HARNESS_DIRTY");
    }
  } catch (error) {
    if (["HARNESS_SHA", "HARNESS_DIRTY"].includes(error.code)) throw error;
    fail("HARNESS_SOURCE");
  }

  if (args[0] === "--native-guard") return nativeGuard();
  if (args[0] === "--audit") return runAuthenticatedAudit();
  if (args[0] === "--resolve-deployment") {
    if (
      process.env.GITHUB_EVENT_NAME !== "workflow_dispatch" ||
      process.env.GITHUB_REF !== "refs/heads/main" ||
      !process.env.GITHUB_ENV ||
      !process.env.GITHUB_OUTPUT
    )
      fail("RESOLVE_MAIN_ONLY");
    if (
      [
        "CONTAOS_HML_SYNTHETIC_EMAIL",
        "CONTAOS_HML_SYNTHETIC_PASSWORD",
        "DATABASE_URL",
        "AUTH_ADMIN_KEY",
        "CONTAOS_HML_AUTH_ADMIN_KEY",
        "GH_TOKEN",
      ].some((key) => !!process.env[key])
    )
      fail("PREPARE_SECRET_ENV");
    const graph = await discoverPublicGraph();
    const identity = resolveDeploymentIdentity(graph.modules, {
      frontendSha: process.env.CONTAOS_REQUESTED_FRONTEND_SHA,
      deploymentId: process.env.CONTAOS_REQUESTED_DEPLOYMENT_ID,
    });
    const output = deploymentWorkflowOutputs(identity);
    await appendFile(process.env.GITHUB_ENV, output.environment);
    await appendFile(process.env.GITHUB_OUTPUT, output.outputs);
    console.log(JSON.stringify({ phase: "DEPLOYMENT_CANDIDATE", ...identity }));
    return;
  }
  const proof = await preparePublicProvenance({
    sourceRoot: process.env.CONTAOS_FRONTEND_SOURCE,
    frontendSha: process.env.CONTAOS_FRONTEND_SHA,
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    deploymentId: process.env.CONTAOS_DEPLOYMENT_ID,
    bun: process.env.CONTAOS_BUN_BINARY || "bun",
  });
  await mkdir(".audit-work", { recursive: true, mode: 0o700 });
  await writeFile(".audit-work/provenance.json", JSON.stringify(proof), { mode: 0o600 });
  console.log(
    JSON.stringify({
      phase: "PUBLIC_PROVENANCE",
      state: "PASS",
      frontendSha: proof.frontendSha,
      harnessSha: proof.harnessSha,
      deploymentId: proof.deploymentId,
      modules: proof.moduleCount,
    }),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch(async (error) => {
    console.error(
      JSON.stringify({
        state: "BLOCKED",
        code: /^[A-Z_]{1,80}$/.test(error?.code || "") ? error.code : "HARNESS_FAILURE",
        ...(error?.code === "BUILD_ENV_POLICY" && /^[A-Z_]{1,80}$/.test(error?.reason || "")
          ? { reason: error.reason }
          : {}),
      }),
    );
    process.exitCode = 1;
    if (
      process.env.GITHUB_EVENT_NAME === "workflow_dispatch" &&
      process.env.GITHUB_REF === "refs/heads/main" &&
      ["--resolve-deployment", "--prepare", "--native-guard"].includes(process.argv[2])
    ) {
      try {
        const identity = await harnessIdentity();
        let native = null;
        try {
          const raw = await readFile(".audit-work/native-proof.json", "utf8");
          if (raw.length <= 16384) native = JSON.parse(raw);
        } catch {}
        await writeBlockedPreflight({
          code: error.code,
          identity,
          frontendSha: process.env.CONTAOS_FRONTEND_SHA,
          deploymentId: process.env.CONTAOS_DEPLOYMENT_ID,
          native,
        });
      } catch {
        console.error(JSON.stringify({ state: "BLOCKED", code: "PREFLIGHT_ARTIFACT_BLOCKED" }));
      }
    }
  });
}

export function nativeProofFromTap(tap, identity) {
  if (
    typeof tap !== "string" ||
    !hash40(identity?.harnessSha) ||
    !hash64(identity?.moduleHash) ||
    !hash64(identity?.testHash)
  )
    fail("NATIVE_PROOF");
  for (const [key, value] of Object.entries({ tests: 7, pass: 7, fail: 0, skipped: 0 })) {
    const matches = [...tap.matchAll(new RegExp("^# " + key + " (\\d+)\\s*$", "gm"))];
    if (matches.length !== 1 || Number(matches[0][1]) !== value) fail("NATIVE_PROOF");
  }
  return { schema: "contaos.native.proof.v1", ...identity, passed: 7, failed: 0, skipped: 0 };
}
export function nativeProofValid(proof, identity) {
  return (
    proof?.schema === "contaos.native.proof.v1" &&
    hash40(identity?.harnessSha) &&
    hash64(identity?.moduleHash) &&
    hash64(identity?.testHash) &&
    ["harnessSha", "moduleHash", "testHash"].every((k) => proof[k] === identity[k]) &&
    proof.passed === 7 &&
    proof.failed === 0 &&
    proof.skipped === 0
  );
}
async function harnessIdentity() {
  return {
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    moduleHash: digest(await readFile(fileURLToPath(import.meta.url))),
    testHash: digest(
      await readFile(new URL("./authenticated-visual-audit.test.mjs", import.meta.url)),
    ),
  };
}
export function nativeCancellationDiagnostics(tap) {
  const allowed = new Set([
    "SENSOR_PROVED",
    "REQUEST_HELD",
    "TERMINAL_PROVED",
    "IDENTITY_PROVED",
    "ERROR_PROVED",
    "TRANSPORT_ZERO",
  ]);
  if (typeof tap !== "string" || tap.length > 1048576) return [];
  return [
    ...new Set(
      tap
        .split("\n")
        .map((line) => /^# NATIVE_CANCEL_STAGE ([A-Z_]+)$/.exec(line.trim())?.[1])
        .filter((stage) => allowed.has(stage)),
    ),
  ].slice(0, 6);
}
async function nativeGuard() {
  let output;
  try {
    const result = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=Chromium nativo",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 180000,
        maxBuffer: 1048576,
      },
    );
    output = result.stdout;
  } catch (error) {
    // Never print the raw subprocess output: it can contain browser URLs or
    // authentication material. Emit only a bounded, allowlisted TAP summary.
    const stdout = typeof error?.stdout === "string" ? error.stdout : "";
    const tap = stdout
      .split("\n")
      .filter((line) =>
        /^(?:not ok \d+ - Chromium nativo:|# (?:tests|pass|fail|skipped|cancelled|duration_ms) [0-9.]+\s*)$/.test(
          line.trim(),
        ),
      )
      .slice(0, 16);
    console.error(
      JSON.stringify({
        phase: "NATIVE_GUARD",
        exitCode: Number.isInteger(error?.code) ? error.code : null,
        signal: ["SIGTERM", "SIGKILL"].includes(error?.signal) ? error.signal : null,
        timedOut: error?.killed === true,
        cancellationStages: nativeCancellationDiagnostics(stdout),
        tap,
      }),
    );
    fail("NATIVE_GUARD");
  }
  const proof = nativeProofFromTap(output, await harnessIdentity());
  await mkdir(".audit-work", { recursive: true, mode: 0o700 });
  await writeFile(".audit-work/native-proof.json", JSON.stringify(proof), { mode: 0o600 });
  console.log(
    JSON.stringify({
      phase: "NATIVE_GUARD",
      state: "PASS",
      cases: 7,
      harnessSha: proof.harnessSha,
    }),
  );
}

export async function sourceTreeClean(root) {
  try {
    const options = { cwd: root, env: browserEnvironment(process.env), maxBuffer: 16777216 };
    await execFile("git", ["diff", "--quiet", "HEAD"], options);
    const ordinary = await execFile(
      "git",
      ["ls-files", "--others", "--exclude-standard", "-z"],
      options,
    );
    if (ordinary.stdout) return false;
    const ignored = await execFile(
      "git",
      ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"],
      options,
    );
    for (const path of ignored.stdout.split("\0").filter(Boolean)) {
      if (/^(?:node_modules|\.output|\.tanstack|\.nitro|dist)(?:\/|$)/.test(path)) continue;
      if (path !== ".wrangler/deploy/config.json" || !(await generatedWranglerOutputValid(root)))
        return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function verifyPublishedResponse(proof, { url, resourceType, status, body }) {
  try {
    const parsed = new URL(url);
    if (parsed.origin === API_ORIGIN) return status >= 200 && status < 500;
    if (parsed.origin !== HML_ORIGIN || status !== 200 || !Buffer.isBuffer(body)) return false;
    if (resourceType === "Document")
      return (
        typeof proof.documents?.[parsed.pathname] === "string" &&
        compareHtml(
          new TextDecoder("utf-8", { fatal: true }).decode(body),
          proof.documents[parsed.pathname],
        )
      );
    return assetBytesMatch(await trustedAsset(proof.publicRoot, url), body);
  } catch {
    return false;
  }
}
export async function literalWords(root) {
  const words = new Set([
    "button",
    "heading",
    "level",
    "generic",
    "paragraph",
    "navigation",
    "link",
    "url",
    "complementary",
    "banner",
    "main",
    "region",
    "strong",
    "emphasis",
    "list",
    "listitem",
    "textbox",
    "combobox",
    "option",
    "selected",
    "disabled",
    "checked",
    "expanded",
    "pressed",
    "radio",
    "radiogroup",
    "group",
    "term",
    "definition",
    "img",
    "alert",
    "status",
    "dialog",
    "separator",
    "checkbox",
    "spinbutton",
    "slider",
    "progressbar",
    "tab",
    "tablist",
    "tabpanel",
    "row",
    "cell",
    "table",
    "columnheader",
    "gridcell",
    "rowgroup",
    "text",
    "active",
    "form",
  ]);
  function add(text) {
    for (const word of text
      .normalize("NFC")
      .toLocaleLowerCase("pt-BR")
      .match(/[\p{L}\p{N}_-]+/gu) || [])
      words.add(word);
  }
  const files = await readdir(join(root, "src"), { recursive: true });
  for (const file of files) {
    if (!/\.tsx?$/.test(file) || /(?:^|\/)(?:test|__tests__)(?:\/|$)|\.test\./.test(file)) continue;
    const source = await readFile(join(root, "src", file), "utf8");
    const parsed = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (ts.isStringLiteralLike(node) || node.kind === ts.SyntaxKind.JsxText) add(node.text);
      ts.forEachChild(node, visit);
    }
    visit(parsed);
  }
  for (const value of Object.values(SYNTHETIC_FIXTURE)) add(value);
  add(
    "FONTE_SINTETICA_AUDITORIA_HML.txt FONTE SINTETICA TRILHA A 20261108 285 2026 08 11 02 41 773eb577 f4681103",
  );
  // Only bounded counters and already declared fixture dates/sizes are allowed.
  for (let n = 0; n <= 232; n++) words.add(String(n));
  return words;
}
async function inspectPrivacy(page, words, diagnostics) {
  const snapshot = await page.locator("body").ariaSnapshot();
  const rendered = await page.evaluate(() => {
    const visible = (e) =>
      e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
    const values = [document.body.innerText];
    for (const element of document.querySelectorAll(
      "input,textarea,select,[aria-label],[title],[placeholder]",
    ))
      if (visible(element)) {
        for (const key of ["aria-label", "title", "placeholder"])
          if (element.getAttribute(key)) values.push(element.getAttribute(key));
        if ("value" in element && element.value) values.push(element.value);
      }
    for (const element of document.querySelectorAll("canvas,iframe,object,embed"))
      if (visible(element)) return null;
    for (const element of document.querySelectorAll("*"))
      if (visible(element))
        for (const pseudo of ["::before", "::after"]) {
          const content = getComputedStyle(element, pseudo).content;
          if (content && content !== "none" && content !== "normal") values.push(content);
        }
    return values.join("\n");
  });
  const privacy =
    rendered === null
      ? { rendered: { reason: "OPAQUE_MEDIA", unknownCount: 0 } }
      : {
          rendered: classifyArtifactText(rendered, words),
          snapshot: classifyArtifactText(snapshot, words, { snapshot: true }),
        };
  if (diagnostics) Object.assign(diagnostics, privacy);
  if (Object.values(privacy).some((result) => result.reason !== "ALLOWED")) return null;
  return snapshot;
}
async function checkFreshDeployment(proof, full) {
  const html = new TextDecoder("utf-8", { fatal: true }).decode(
    await boundedPublicFetch(HML_ORIGIN + "/login", 262144),
  );
  if (!compareHtml(html, proof.documents["/login"])) fail("DEPLOYMENT_CHANGED");
  if (full) {
    const graph = await discoverPublicGraph();
    extractPublicBuildEnvironment(graph.modules, proof);
    if (graph.modules.size !== proof.moduleCount) fail("DEPLOYMENT_CHANGED");
    for (const [url, source] of graph.modules)
      if (digest(source) !== proof.moduleHashes[new URL(url).pathname]) fail("DEPLOYMENT_CHANGED");
  }
}
async function waitOrganization(page) {
  await page.waitForFunction(
    (name) => {
      const header = document.querySelector('header[aria-label="Organização atual"]');
      return header?.textContent.includes(name) && /Situação:\s*ativa/i.test(header.textContent);
    },
    SYNTHETIC_FIXTURE.organizationName,
    { timeout: 15000 },
  );
}
async function settleVerifiedPage(page, fence) {
  await page.waitForLoadState("networkidle");
  await fence.drain();
  fence.assertSafe();
}
export async function resizeVerifiedPage(page, fence, width) {
  await settleVerifiedPage(page, fence);
  await page.setViewportSize({ width, height: 1000 });
  await settleVerifiedPage(page, fence);
}
export async function navigateVerifiedPage(page, fence, target) {
  if (
    !requestAllowed({ url: target, method: "GET", resourceType: "Document" }) ||
    new URL(target).origin !== HML_ORIGIN
  )
    fail("AUTH_DESTINATION");
  await settleVerifiedPage(page, fence);
  const response = await page.goto(target, { waitUntil: "networkidle" });
  await settleVerifiedPage(page, fence);
  return response;
}
export async function openVerifiedOrganizationSelector(page, fence) {
  await settleVerifiedPage(page, fence);
  const current = page.url();
  if (current === HML_ORIGIN + "/selecionar-organizacao") return;
  if (current !== HML_ORIGIN + "/") fail("AUTH_DESTINATION");
  await navigateVerifiedPage(page, fence, HML_ORIGIN + "/selecionar-organizacao");
}
async function runAuthenticatedAudit() {
  const ready = validateConfiguration({
    origin: HML_ORIGIN,
    frontendSha: process.env.CONTAOS_FRONTEND_SHA,
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    deploymentId: process.env.CONTAOS_DEPLOYMENT_ID,
    emailPresent: !!process.env.CONTAOS_HML_SYNTHETIC_EMAIL,
    passwordPresent: !!process.env.CONTAOS_HML_SYNTHETIC_PASSWORD,
  });
  if (!ready.ready) fail(ready.code);
  if (
    process.env.GITHUB_EVENT_NAME !== "workflow_dispatch" ||
    process.env.GITHUB_REF !== "refs/heads/main"
  )
    fail("AUDIT_MAIN_ONLY");
  const native = JSON.parse(await readFile(".audit-work/native-proof.json", "utf8"));
  if (!nativeProofValid(native, await harnessIdentity())) fail("NATIVE_PROOF");
  const proof = JSON.parse(await readFile(".audit-work/provenance.json", "utf8"));
  if (
    proof.schema !== "contaos.private.provenance.v1" ||
    proof.harnessSha !== process.env.CONTAOS_HARNESS_SHA ||
    proof.frontendSha !== process.env.CONTAOS_FRONTEND_SHA ||
    proof.deploymentId !== process.env.CONTAOS_DEPLOYMENT_ID
  )
    fail("PROVENANCE_IDENTITY");
  const axePath = process.env.CONTAOS_AXE_SOURCE_PATH;
  if (!axePath) fail("AXE_MISSING");
  const axe = await readFile(axePath, "utf8");
  if (axe.length > 2097152 || !axe.includes("4.14.0")) fail("AXE_VERSION");
  await checkFreshDeployment(proof, true);
  const words = await literalWords(process.env.CONTAOS_FRONTEND_SOURCE),
    output = resolve("artifacts/trilha-a-private");
  await mkdir(join(output, "screenshots"), { recursive: true });
  await mkdir(join(output, "dom"), { recursive: true });
  const records = [],
    hashes = [];
  let browser,
    context,
    fence,
    proxy,
    page,
    loggedIn = false,
    logoutVerified = false,
    aborted = null,
    errors = 0;
  let phase = "AUDIT_PREFLIGHT",
    diagnostic = null;
  const flags = {
    formLocated: false,
    submitActivated: false,
    postLoginNavigation: false,
    masterLocated: false,
    organizationConfirmed: false,
  };
  const { chromium } = await import("playwright");
  const debug = createServer();
  await new Promise((resolve) => debug.listen(0, "127.0.0.1", resolve));
  const debugPort = debug.address().port;
  await new Promise((resolve) => debug.close(resolve));
  async function saveScreenshot(key, suffix = "") {
    const file = `screenshots/${key}${suffix}.png`;
    const data = await page.screenshot({ fullPage: true, animations: "disabled" });
    if (data.length > 20971520) fail("SCREENSHOT_LIMIT");
    await writeFile(join(output, file), data, { mode: 0o600 });
    const sha = digest(data);
    hashes.push({ file, sha });
    return { file, sha };
  }
  try {
    phase = "BROWSER_START";
    proxy = await startDestinationProxy();
    browser = await chromium.launch({
      chromiumSandbox: true,
      env: browserEnvironment(process.env),
      proxy: { server: proxy.url },
      args: [`--remote-debugging-port=${debugPort}`, "--proxy-bypass-list=<-loopback>"],
    });
    context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    });
    page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", () => errors++);
    const session = await context.newCDPSession(page),
      { targetInfo } = await session.send("Target.getTargetInfo");
    await session.detach();
    fence = await installNativeFence({
      debugPort,
      identity: targetInfo,
      verifyResponse: (response) => verifyPublishedResponse(proof, response),
      closeContext: async () => context.close(),
    });
    phase = "OPEN_LOGIN";
    await page.goto(HML_ORIGIN + "/login", { waitUntil: "networkidle" });
    phase = "PROVE_LOGIN";
    await fence.drain();
    fence.assertSafe();
    if (errors !== 0) fail("LOGIN_SCRIPT_ERROR");
    phase = "LOGIN_FORM";
    await page.locator("#login-email").waitFor({ state: "visible" });
    await page.locator("#login-senha").waitFor({ state: "visible" });
    flags.formLocated = true;
    phase = "FILL_LOGIN";
    await page.locator("#login-email").fill(process.env.CONTAOS_HML_SYNTHETIC_EMAIL);
    await page.locator("#login-senha").fill(process.env.CONTAOS_HML_SYNTHETIC_PASSWORD);
    phase = "SUBMIT_LOGIN";
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    flags.submitActivated = true;
    phase = "WAIT_AUTH_DESTINATION";
    await page.waitForURL((url) => url.pathname !== "/login");
    flags.postLoginNavigation = true;
    loggedIn = true;
    phase = "OPEN_ORG_SELECTOR";
    await openVerifiedOrganizationSelector(page, fence);
    const card = page
      .getByRole("radio")
      .filter({ hasText: SYNTHETIC_FIXTURE.organizationName })
      .filter({ hasText: "Administrador Master" });
    phase = "CHECK_MASTER";
    await card.waitFor();
    if ((await card.count()) !== 1 || !/Situação:\s*ativa/i.test(await card.innerText()))
      fail("AUTH_MASTER_FIXTURE");
    flags.masterLocated = true;
    phase = "SELECT_ORG";
    await card.click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    phase = "ENTER_ORG";
    await page.waitForURL(HML_ORIGIN + "/");
    await waitOrganization(page);
    flags.organizationConfirmed = true;
    phase = "CAPTURE_PRIVATE";
    let surface = null;
    for (const item of privateCases()) {
      const key = caseKey(item),
        record = { ...item, status: "PENDENTE" };
      const preserved = preservedPrivateCase(item);
      if (preserved) {
        records.push(preserved);
        continue;
      }
      records.push(record);
      if (item.fixtureBlocked) {
        record.status = "BLOQUEADO_FIXTURE";
        continue;
      }
      await checkFreshDeployment(proof, item.surface !== surface);
      surface = item.surface;
      try {
        const beforeErrors = errors;
        await resizeVerifiedPage(page, fence, item.width);
        const response = await navigateVerifiedPage(page, fence, HML_ORIGIN + item.path);
        await page.evaluate(
          (theme) => document.documentElement.classList.toggle("dark", theme === "dark"),
          item.theme,
        );
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        if (item.surface !== "SYS04") await waitOrganization(page);
        await page.waitForFunction(
          () =>
            document.querySelectorAll("h1").length === 1 &&
            !/Carregando|Confirmando organização/.test(document.body.innerText),
          null,
          { timeout: 15000 },
        );
        await fence.drain();
        fence.assertSafe();
        const privacy = {};
        const snapshot = await inspectPrivacy(page, words, privacy);
        record.privacy = privacy;
        if (snapshot === null) {
          record.status = "BLOQUEADO_PII";
          continue;
        }
        const metrics = await page.evaluate(() => {
          const visible = (e) =>
            e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
          const headings = [...document.querySelectorAll("h1")].filter(visible),
            brands = [...document.querySelectorAll('img[src^="/brand/"]')].filter(visible);
          return {
            headingText: headings.map((e) => e.textContent).join(" "),
            statusTexts: [...document.querySelectorAll('[role="status"],[role="alert"]')]
              .filter(visible)
              .map((e) => e.textContent),
            mainText: document.querySelector("main")?.innerText || document.body.innerText,
            regionNames: [
              ...document.querySelectorAll(
                '[role="region"],section[aria-label],section[aria-labelledby]',
              ),
            ]
              .filter(visible)
              .map(
                (e) =>
                  e.getAttribute("aria-label") ||
                  (e.getAttribute("aria-labelledby") || "")
                    .split(/\s+/)
                    .map((id) => document.getElementById(id)?.textContent || "")
                    .join(" ")
                    .trim(),
              ),
            observedWidth: innerWidth,
            observedTheme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            h1: headings.length,
            badState:
              headings.some((e) =>
                /404|acesso negado|não foi possível|não encontrad/i.test(e.textContent),
              ) ||
              [...document.querySelectorAll('[role="alert"]')].some(
                (e) => visible(e) && /negado|falha|não foi possível/i.test(e.textContent),
              ),
            overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
            brandCount: brands.length,
            fontFamily: getComputedStyle(document.body).fontFamily,
            langPtBr: document.documentElement.lang === "pt-BR",
            height: document.documentElement.scrollHeight,
            organizationHeader: !!document.querySelector('header[aria-label="Organização atual"]'),
            sidebar: !!document.querySelector("aside"),
            forms: document.querySelectorAll("form").length,
          };
        });
        metrics.badState ||= !surfaceStateValid(item.surface, metrics);
        for (const field of ["headingText", "statusTexts", "mainText", "regionNames"])
          delete metrics[field];
        if (metrics.height > 30000) {
          record.status = "BLOQUEADO_PAGE_LIMIT";
          continue;
        }
        await page.addScriptTag({ content: axe });
        const accessibility = await page.evaluate(async () => {
          const result = await window.axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
            },
          });
          return {
            violations: result.violations.map((v) => ({ id: v.id, count: v.nodes.length })),
            incomplete: result.incomplete.length,
          };
        });
        const shot = await saveScreenshot(key);
        const domFile = `dom/${key}.json`,
          dom = JSON.stringify({
            surface: item.surface,
            width: item.width,
            theme: item.theme,
            snapshot,
          });
        await writeFile(join(output, domFile), dom, { mode: 0o600 });
        hashes.push({ file: domFile, sha: digest(dom) });
        Object.assign(record, metrics, {
          http: response?.status() ?? 0,
          routeExact: new URL(page.url()).pathname === item.path,
          sessionVerified: true,
          organizationVerified: true,
          shellVerified:
            item.surface === "SYS04" || (metrics.organizationHeader && metrics.sidebar),
          privacySafe: true,
          errors: errors - beforeErrors,
          blockedMutations: fence.snapshot().blockedRequests,
          screenshot: shot.file,
          sha256: shot.sha,
          dom: domFile,
          domSha256: digest(dom),
          accessibility,
        });
        record.keyboard = await keyboardProbe(page);
        record.sidebarSupplement = await sidebarProbe(page, item, key, words, saveScreenshot);
        record.navigationVerified = await navigationProbe(page, item, fence);
        record.status =
          validateCase(record) &&
          metrics.langPtBr &&
          !metrics.badState &&
          accessibility.violations.length === 0 &&
          record.keyboard.passed &&
          record.sidebarSupplement.passed &&
          record.navigationVerified &&
          /^['"]?Inter['"]?,\s*Arial,\s*sans-serif$/i.test(metrics.fontFamily)
            ? "PASS_AUTOMATIZADO"
            : "FAIL";
        console.log(JSON.stringify({ case: key, status: record.status }));
      } catch (error) {
        if (fence.snapshot().failed || error.code === "DEPLOYMENT_CHANGED") throw error;
        record.status = error.code === "PII_SUPPLEMENT" ? "BLOQUEADO_PII" : "FAIL_UI";
        if (record.status === "BLOQUEADO_PII") {
          for (let i = hashes.length - 1; i >= 0; i--)
            if (
              hashes[i].file.startsWith("screenshots/" + key) ||
              hashes[i].file.startsWith("dom/" + key)
            ) {
              await rm(join(output, hashes[i].file), { force: true });
              hashes.splice(i, 1);
            }
          for (const field of ["screenshot", "sha256", "dom", "domSha256", "sidebarSupplement"])
            delete record[field];
        }
        console.log(JSON.stringify({ case: key, status: record.status }));
      }
    }
  } catch (error) {
    const fenceState = await settledFenceSnapshot(fence);
    diagnostic = runtimeDiagnostics({
      phase,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      contextClosed: page?.isClosed(),
      routeClass: runtimeRouteClass(page),
      fence: fenceState,
      proxy: proxy?.snapshot(),
      flags,
      loginUi: await loginUiFlags(page),
    });
    aborted =
      fenceState?.failed && diagnostic.fence.failureCode
        ? diagnostic.fence.failureCode
        : /^[A-Z_]{1,80}$/.test(error?.code ?? "")
          ? error.code
          : "RUNTIME_ABORT";
    if (records.at(-1)?.status === "PENDENTE") records.at(-1).status = "BLOQUEADO_" + aborted;
  } finally {
    if (loggedIn && page && !page.isClosed())
      try {
        await settleVerifiedPage(page, fence);
        const exit = page.getByRole("button", { name: "Sair", exact: true });
        if ((await exit.count()) === 1) {
          await exit.click();
          await page.waitForURL(HML_ORIGIN + "/login");
          await settleVerifiedPage(page, fence);
          logoutVerified = true;
        }
      } catch {}
    fence?.close();
    await browser?.close().catch(() => {});
    await proxy?.close().catch(() => {});
    completePrivateRecords(records);
    const report = {
      schema: "contaos.private.audit.v1",
      frontendSha: proof.frontendSha,
      harnessSha: proof.harnessSha,
      deploymentId: proof.deploymentId,
      nativeProof: native,
      csp: "ADICIONAL_LOCAL_DO_AUDITOR",
      publicProofsRepeated: false,
      records,
      summary: summarizeCases(records),
      logoutVerified,
      aborted,
      diagnostic,
      criteria72: "PENDENTE_REVISAO_INDEPENDENTE",
      v1Certified: false,
    };
    const reportText = JSON.stringify(report, null, 2) + "\n";
    await writeFile(join(output, "report.json"), reportText, { mode: 0o600 });
    hashes.push({ file: "report.json", sha: digest(reportText) });
    await writeFile(
      join(output, "SHA256SUMS"),
      hashes.map((h) => `${h.sha}  ${h.file}`).join("\n") + "\n",
      { mode: 0o600 },
    );
  }
  if (aborted || !logoutVerified || records.some((r) => r.status !== "PASS_AUTOMATIZADO"))
    fail("AUDIT_INCOMPLETE");
}
async function keyboardProbe(page) {
  let forward = true,
    backward = true;
  for (const key of ["Tab", "Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    const valid = await page.evaluate(() => {
      const e = document.activeElement;
      if (!(e instanceof HTMLElement) || e === document.body) return false;
      const b = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      return (
        b.width > 0 &&
        b.height > 0 &&
        b.left >= 0 &&
        b.right <= innerWidth &&
        b.top >= 0 &&
        b.bottom <= innerHeight &&
        (s.outlineStyle !== "none" || s.boxShadow !== "none")
      );
    });
    if (key === "Shift+Tab") backward &&= valid;
    else forward &&= valid;
  }
  return { passed: forward && backward, forward, backward, coverage: "AMOSTRA_NAO_WCAG_INTEGRAL" };
}
async function sidebarProbe(page, item, key, words, save) {
  if (item.surface === "SYS04") return { passed: true, mode: "ESTRUTURA_SYS04" };
  if (item.width >= 768) {
    const collapse = page.getByRole("button", { name: "Recolher menu", exact: true });
    if ((await collapse.count()) !== 1) return { passed: false, mode: "DESKTOP" };
    await collapse.click();
    const expand = page.getByRole("button", { name: "Expandir menu", exact: true });
    const safe = await inspectPrivacy(page, words);
    if (safe === null) fail("PII_SUPPLEMENT");
    const image = await save(key, "_sidebar-recolhida");
    const collapsed = (await expand.getAttribute("aria-expanded")) === "false";
    await expand.click();
    const aside = page.locator("aside");
    const passed =
      collapsed &&
      (await aside.getByRole("link", { name: "Usuários", exact: true }).count()) === 1 &&
      (await aside.getByRole("link", { name: "Auditoria", exact: true }).count()) === 1;
    return { passed, mode: "DESKTOP", screenshot: image.file, sha256: image.sha };
  }
  const open = page.getByRole("button", { name: "Abrir menu", exact: true });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Menu de navegação" });
  await dialog.waitFor();
  if ((await inspectPrivacy(page, words)) === null) fail("PII_SUPPLEMENT");
  const image = await save(key, "_menu");
  const brandCount = await page.locator('img[src^="/brand/"]:visible').count();
  const admin = await dialog.getByRole("link", { name: "Usuários", exact: true }).count(),
    audit = await dialog.getByRole("link", { name: "Auditoria", exact: true }).count();
  await page.keyboard.press("Escape");
  const focused = await open.evaluate((e) => e === document.activeElement);
  return {
    passed: admin === 1 && audit === 1 && focused && brandCount === 1,
    mode: "MOBILE",
    brandCount,
    screenshot: image.file,
    sha256: image.sha,
  };
}
export async function navigationProbe(page, item, fence) {
  if (item.surface === "SYS04") return true;
  await settleVerifiedPage(page, fence);
  if (item.width < 768) await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  const name = item.surface === "SYS05" ? "Contratantes" : "Painel",
    path = item.surface === "SYS05" ? "/contratantes" : "/";
  await page.getByRole("link", { name, exact: true }).first().click();
  await page.waitForURL(HML_ORIGIN + path);
  await page
    .getByRole("heading", {
      level: 1,
      name: item.surface === "SYS05" ? "Contratantes" : "Painel da organização",
      exact: true,
    })
    .waitFor({ state: "visible" });
  await waitOrganization(page);
  await settleVerifiedPage(page, fence);
  return true;
}

export function surfaceStateValid(surface, observation) {
  const titles = {
    SYS04: /^Selecionar organização$/,
    SYS05: /^Painel da organização$/,
    ADM01: /^Usuários e vínculos$/,
    V101: /^Contratantes$/,
    V102: /^Novo contratante$/,
    V103: /^Editar contratante$/,
    V104: /^Contratos$/,
    V105: /^Novo contrato$/,
    V106: /^Contrato\s+\S/,
    V107: /^Base normativa$/,
    V108: /^Orçamento$/,
    V109: /^Listas e regras$/,
    V110: /^Central de documentos$/,
    V111: /^FONTE_SINTETICA_AUDITORIA_HML$/,
    V112: /^Competências$/,
    V113: /^Nova competência$/,
    V114: /^Competência\s+\S/,
    V115: /^Documentos da competência$/,
    V116: /^Análise da competência$/,
    V118: /^Parecer interno$/,
    V121: /^Histórico do contrato$/,
    V122: /^Importação de histórico$/,
    V123: /^Trilha de auditoria$/,
  };
  if (
    !titles[surface]?.test(
      String(observation?.headingText ?? "")
        .trim()
        .replace(/\s+/g, " "),
    )
  )
    return false;
  const denied =
    /não encontrad[oa] ou indisponível|você não tem (?:acesso|permissão|autorização)|acesso negado|não foi possível|sessão expirada/i;
  if (
    denied.test(observation.mainText ?? "") ||
    (observation.statusTexts ?? []).some((text) => denied.test(text))
  )
    return false;
  if (
    surface === "V111" &&
    !["Resumo do documento", "Processamento"].every((name) =>
      observation.regionNames?.includes(name),
    )
  )
    return false;
  return true;
}
export function brandStateValid(row) {
  if (row.surface === "SYS04" || row.width >= 768) return row.brandCount === 1;
  const supplement = row.sidebarSupplement;
  return (
    row.width === 390 &&
    [0, 1].includes(row.brandCount) &&
    supplement?.mode === "MOBILE" &&
    supplement.brandCount === 1 &&
    supplement.screenshot === `screenshots/${caseKey(row)}_menu.png` &&
    hash64(supplement.sha256)
  );
}

export async function generatedWranglerOutputValid(root) {
  try {
    for (const path of [root, join(root, ".wrangler"), join(root, ".wrangler/deploy")]) {
      const stat = await lstat(path);
      if (stat.isSymbolicLink() || !stat.isDirectory()) return false;
    }
    if (
      (await readdir(join(root, ".wrangler"))).join() !== "deploy" ||
      (await readdir(join(root, ".wrangler/deploy"))).join() !== "config.json"
    )
      return false;
    const path = join(root, ".wrangler/deploy/config.json"),
      stat = await lstat(path);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 256) return false;
    return (
      (await readFile(path, "utf8")).trim() ===
      '{"configPath":"../../.output/server/wrangler.json"}'
    );
  } catch {
    return false;
  }
}
export async function writeBlockedPreflight(input, output = resolve("artifacts/trilha-a-private")) {
  await mkdir(output, { recursive: true, mode: 0o700 });
  if ((await readdir(output)).length) fail("BLOCKED_ARTIFACT_EXISTS");
  const identity = input.identity || {},
    nativeValid = nativeProofValid(input.native, identity);
  const receipt = {
    schema: "contaos.preflight.blocked.v1",
    state: "NO_GO",
    stage: "PRELOGIN",
    code: /^[A-Z_]{1,80}$/.test(input.code || "") ? input.code : "HARNESS_FAILURE",
    harnessSha: hash40(identity.harnessSha) ? identity.harnessSha : "UNVERIFIED",
    frontendSha: hash40(input.frontendSha) ? input.frontendSha : "UNVERIFIED",
    deploymentId: /^dpl_[A-Za-z0-9]{8,80}$/.test(input.deploymentId || "")
      ? input.deploymentId
      : "UNVERIFIED",
    privateCasesProven: 0,
    nativeProofIncluded: nativeValid,
    v1Certified: false,
  };
  const files = new Map([["preflight-blocked.json", JSON.stringify(receipt, null, 2) + "\n"]]);
  if (nativeValid)
    files.set(
      "native-proof.json",
      JSON.stringify(
        {
          schema: "contaos.native.proof.v1",
          harnessSha: identity.harnessSha,
          moduleHash: identity.moduleHash,
          testHash: identity.testHash,
          passed: 7,
          failed: 0,
          skipped: 0,
        },
        null,
        2,
      ) + "\n",
    );
  for (const [name, body] of files) await writeFile(join(output, name), body, { mode: 0o600 });
  await writeFile(
    join(output, "SHA256SUMS"),
    [...files].map(([name, body]) => digest(body) + "  " + name).join("\n") + "\n",
    { mode: 0o600 },
  );
}

export async function settledFenceSnapshot(fence) {
  // The browser can report navigation failure before Fetch.failRequest is
  // acknowledged. Wait for our pending checks before describing fence state.
  await fence?.drain();
  return fence?.snapshot();
}
export function classifyRuntimeError(error = {}) {
  const name = [
    "Error",
    "TypeError",
    "ReferenceError",
    "SyntaxError",
    "EvalError",
    "TimeoutError",
  ].includes(error.name)
    ? error.name
    : "UNKNOWN";
  const message = typeof error.message === "string" ? error.message.slice(0, 16384) : "";
  const operations = [
    ["page.waitForURL:", "WAIT_FOR_URL"],
    ["page.evaluate:", "EVALUATE"],
    ["page.goto:", "GOTO"],
    ["locator.click:", "CLICK"],
    ["locator.waitFor:", "WAIT_FOR_ELEMENT"],
  ];
  const operation = operations.find(([prefix]) => message.startsWith(prefix))?.[1] || "UNKNOWN";
  let reason = "UNKNOWN";
  if (name === "TimeoutError") reason = "TIMEOUT";
  else if (message.includes("Navigation failed because page crashed!")) reason = "PAGE_CRASHED";
  else if (message.includes("Navigating frame was detached!")) reason = "FRAME_DETACHED";
  else if (message.includes("is interrupted by another navigation"))
    reason = "NAVIGATION_INTERRUPTED";
  else if (message.includes("net::ERR_ABORTED")) reason = "NAVIGATION_ABORTED";
  else if (message.includes("net::ERR_FAILED")) reason = "NETWORK_FAILED";
  else if (message.includes("net::ERR_BLOCKED_BY_CLIENT")) reason = "NETWORK_BLOCKED_CLIENT";
  else if (message.includes("net::ERR_EMPTY_RESPONSE")) reason = "NETWORK_EMPTY_RESPONSE";
  else if (message.includes("net::ERR_HTTP_RESPONSE_CODE_FAILURE"))
    reason = "NETWORK_HTTP_RESPONSE";
  else if (message.includes("Execution context was destroyed")) reason = "CONTEXT_DESTROYED";
  else if (message.includes("Target page, context or browser has been closed"))
    reason = "TARGET_CLOSED";
  else if (message.includes("unsafe-eval")) reason = "CSP_EVAL";
  // Never return any substring of the supplied error, including unknown names.
  return { name, operation, reason };
}
export function runtimeDiagnostics(input = {}) {
  const phases = [
    "AUDIT_PREFLIGHT",
    "BROWSER_START",
    "OPEN_LOGIN",
    "PROVE_LOGIN",
    "LOGIN_FORM",
    "FILL_LOGIN",
    "SUBMIT_LOGIN",
    "WAIT_AUTH_DESTINATION",
    "OPEN_ORG_SELECTOR",
    "CHECK_MASTER",
    "SELECT_ORG",
    "ENTER_ORG",
    "CAPTURE_PRIVATE",
    "FINISHED",
  ];
  const failures = new Set([
    "FENCE_REQUEST",
    "FENCE_TRANSPORT",
    "FENCE_REDIRECT",
    "FENCE_BODY_LIMIT",
    "FENCE_SOURCE",
    "FENCE_HEADERS",
    "FENCE_DOCUMENT_BODY",
    "FENCE_CONTEXT_UNKNOWN",
    "FENCE_CONTEXT_FOREIGN",
    "FENCE_WORKER_PAUSED",
    "FENCE_WORKER_RUNNING",
    "FENCE_POPUP",
    "FENCE_TARGET_FAILED",
    "FENCE_TARGET_DETACHED",
    "FENCE_CDP_CLOSED",
    "FENCE_TARGET_TIMEOUT",
    "FENCE_INITIALIZATION",
    "FENCE_NOT_PROVEN",
    "FENCE_ASYNC",
    "FENCE_CONFIGURATION",
    "CDP_COMMAND",
    "CDP_FRAME",
    "CDP_CLOSED",
    "CDP_CONNECT",
    "CDP_ENDPOINT",
    "CDP_METADATA",
    "CDP_IDENTITY",
    "CDP_EVENT",
    "CDP_TIMEOUT",
    "LOGIN_SCRIPT_ERROR",
    "AUTH_MASTER_FIXTURE",
    "AUTH_DESTINATION",
    "DEPLOYMENT_CHANGED",
  ]);
  const count = (value) =>
    Number.isInteger(value) && value >= 0 && value <= 1000000 ? value : null;
  const fence = {
    failureProtocolCode: [-32000, -32600, -32601, -32602, -32700].includes(
      input.fence?.failureProtocolCode,
    )
      ? input.fence.failureProtocolCode
      : null,
    failureReason: ["NO_RESOURCE", "INVALID_INTERCEPTION", "BODY_STAGE", "OTHER"].includes(
      input.fence?.failureReason,
    )
      ? input.fence.failureReason
      : null,
    failed: input.fence?.failed === true,
    failureCode: failures.has(input.fence?.failureCode) ? input.fence.failureCode : null,
    failureCommand: FENCE_COMMANDS.has(input.fence?.failureCommand)
      ? input.fence.failureCommand
      : null,
    redirectStatus:
      Number.isInteger(input.fence?.redirectStatus) &&
      input.fence.redirectStatus >= 300 &&
      input.fence.redirectStatus < 400
        ? input.fence.redirectStatus
        : null,
  };
  for (const key of [
    "verifiedDocuments",
    "verifiedScripts",
    "verifiedAssets",
    "blockedRequests",
    "redirectBlocks",
    "workersPaused",
    "workersResumed",
    "popups",
  ])
    fence[key] = count(input.fence?.[key]);
  const proxy = {};
  for (const key of ["forwarded", "blocked", "connectionFailures"])
    proxy[key] = count(input.proxy?.[key]);
  const flags = {};
  for (const key of [
    "formLocated",
    "submitActivated",
    "postLoginNavigation",
    "masterLocated",
    "organizationConfirmed",
  ])
    flags[key] = input.flags?.[key] === true;
  const loginUi = { observed: input.loginUi?.observed === true };
  for (const key of [
    "credentialRejected",
    "networkError",
    "noOrganization",
    "accessLookupError",
    "accessDenied",
    "emailInvalid",
    "passwordInvalid",
  ])
    loginUi[key] = loginUi.observed && input.loginUi?.[key] === true;
  return {
    phase: phases.includes(input.phase) ? input.phase : "UNKNOWN",
    localError: classifyRuntimeError({ name: input.errorName, message: input.errorMessage }),
    errorKind:
      input.errorName === "TimeoutError"
        ? "TIMEOUT"
        : input.contextClosed === true
          ? "CONTEXT_CLOSED"
          : failures.has(input.errorCode)
            ? "HARNESS_ERROR"
            : "OTHER",
    routeClass: ["LOGIN", "ORGANIZATION_SELECTOR", "DASHBOARD", "OTHER"].includes(input.routeClass)
      ? input.routeClass
      : "UNAVAILABLE",
    fence,
    proxy,
    flags,
    loginUi,
  };
}
async function loginUiFlags(page) {
  if (!page || page.isClosed()) return {};
  try {
    return await page.evaluate(() => {
      const visible = (e) =>
        e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
      const text = [...document.querySelectorAll('[role="alert"],[role="status"]')]
        .filter(visible)
        .map((e) => e.textContent)
        .join("\n");
      return {
        observed: true,
        credentialRejected: text.includes("E-mail ou senha inválidos."),
        networkError: text.includes("Não foi possível conectar. Tente novamente."),
        noOrganization: text.includes("Seu usuário não possui acesso ativo a nenhuma organização."),
        accessLookupError: text.includes("Não foi possível carregar seus acessos."),
        accessDenied: text.includes("Você não tem permissão para acessar as organizações."),
        emailInvalid:
          document.querySelector("#login-email")?.getAttribute("aria-invalid") === "true",
        passwordInvalid:
          document.querySelector("#login-senha")?.getAttribute("aria-invalid") === "true",
      };
    });
  } catch {
    return {};
  }
}
function runtimeRouteClass(page) {
  try {
    if (!page || page.isClosed()) return "UNAVAILABLE";
    const path = new URL(page.url()).pathname;
    return path === "/login"
      ? "LOGIN"
      : path === "/selecionar-organizacao"
        ? "ORGANIZATION_SELECTOR"
        : path === "/"
          ? "DASHBOARD"
          : "OTHER";
  } catch {
    return "UNAVAILABLE";
  }
}

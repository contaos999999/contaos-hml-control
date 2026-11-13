import { createReadStream } from "node:fs";
import {
  readFile,
  mkdir,
  writeFile,
  appendFile,
  lstat,
  rm,
  readdir,
  realpath,
} from "node:fs/promises";
import { resolve, join, basename, dirname, isAbsolute } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { isProxy } from "node:util/types";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
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
  "Page.getFrameTree",
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
export function summarizeCases(rows, scope = null) {
  scope = auditScope(scope);
  const expected = scope
    ? new Map(privateCases(scope).map((item) => [caseKey(item), item.path]))
    : null;
  const keys = new Set();
  let duplicate = false,
    invalid = false,
    passed = 0;
  if (!Array.isArray(rows) || rows.length > (scope ? privateCases(scope).length : 208))
    return { recorded: 0, matrixComplete: false, globalComplete: false, passed: 0 };
  for (const row of rows) {
    try {
      const key = caseKey(row);
      if (keys.has(key)) duplicate = true;
      keys.add(key);
      const routeValid = !expected || (expected.has(key) && expected.get(key) === row.path);
      if (!routeValid) invalid = true;
      const completeEvidence =
        !scope ||
        (run78VisualEvidenceValid(row, scope) &&
          row.keyboard?.passed === true &&
          row.sidebarSupplement?.passed === true &&
          (row.surface !== "V117" || row.drawerCloseVerified === true) &&
          row.navigationVerified === true &&
          row.langPtBr === true &&
          row.badState === false &&
          Array.isArray(row.accessibility?.violations) &&
          row.accessibility.violations.length === 0 &&
          /^['"]?Inter['"]?,\s*Arial,\s*sans-serif$/i.test(row.fontFamily));
      if (row.status === "PASS_AUTOMATIZADO" && validateCase(row) && routeValid && completeEvidence)
        passed++;
    } catch {
      invalid = true;
    }
  }
  return {
    recorded: keys.size,
    matrixComplete:
      !invalid &&
      !duplicate &&
      keys.size === (scope ? privateCases(scope).length : 208) &&
      rows.length === (scope ? privateCases(scope).length : 208) &&
      (!scope || passed === privateCases(scope).length),
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

export function privacySys04Literal(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function privacySys04Supplement(tap) {
  if (typeof tap !== "string") return null;
  const expected = { tests: 2, pass: 2, fail: 0, skipped: 0, cancelled: 0 };
  return Object.entries(expected).every(([k, v]) => {
    const matches = [...tap.matchAll(new RegExp("^# " + k + " ([0-9]+)$", "gm"))];
    return matches.length === 1 && Number(matches[0][1]) === v;
  })
    ? 2
    : null;
}

const privacySys04Proofs = new WeakSet();
export async function loadPrivacySys04Proof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-remaining-sys04-20261108.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "a4a6f3f9f3c23a248effcf7471cad6e7a89b58b89c0345315b750c74a3e105df")
    fail("PRIVACY_PROOF");
  const freeze = (v) => {
    if (v && typeof v === "object") {
      Object.values(v).forEach(freeze);
      Object.freeze(v);
    }
    return v;
  };
  const proof = freeze(JSON.parse(bytes));
  privacySys04Proofs.add(proof);
  return proof;
}
export function privacySys04Runtime({ proof, install = false }) {
  const target =
    "https://gklhhhyosgasnyoxlrui.supabase.co/rest/v1/rpc/listar_organizacoes_disponiveis";
  const catalog = [
    ...(proof?.legacy ?? []),
    ...(proof?.constructor_closed ?? []),
    ...(proof?.discovered_closed ?? []),
  ];
  const valid =
    proof?.schema === "contaos.hml.privacy-remaining-sys04.v1" &&
    catalog.length === 109 &&
    new Set(catalog.map((r) => r.id)).size === 109;
  const match = (raw, method, body) =>
    valid &&
    raw === target &&
    method === "POST" &&
    typeof body === "string" &&
    body.trim() === "{}";
  const project = (body) => {
    if (!valid || !Array.isArray(body) || body.length < 1 || body.length > 109) return null;
    const ids = [];
    for (const r of body) {
      if (
        !r ||
        typeof r !== "object" ||
        Array.isArray(r) ||
        Object.keys(r).sort().join() !== "cnpj,id,nome_fantasia,perfil,razao_social,situacao" ||
        ids.includes(r.id)
      )
        return null;
      const expected = catalog.find((v) => v.id === r.id);
      if (
        !expected ||
        r.perfil !== "administrador_master" ||
        r.cnpj !== null ||
        !["razao_social", "nome_fantasia", "situacao"].every((k) => r[k] === expected[k])
      )
        return null;
      ids.push(r.id);
    }
    return { ids };
  };
  if (!install) return { match, project };
  if (
    location.origin !== "https://contaos-41-hml.vercel.app" ||
    location.pathname !== "/selecionar-organizacao" ||
    location.search ||
    location.hash
  )
    return;
  const route = location.href,
    started = performance.now();
  let invalid = false,
    pending = 0,
    revision = 0,
    ids = null,
    seenGroup = false;
  const invalidate = () => {
    invalid = true;
    ids = null;
  };
  const current = () => !invalid && location.href === route && performance.now() - started < 120000;
  for (const event of [
    "pagehide",
    "beforeunload",
    "popstate",
    "hashchange",
    "contaos:organizacao-alterada",
  ])
    window.addEventListener(event, invalidate, { once: true });
  document.addEventListener("visibilitychange", invalidate, { once: true });
  if (!window.navigation?.addEventListener) invalidate();
  else window.navigation.addEventListener("navigate", invalidate, { once: true });
  new MutationObserver(() => {
    revision++;
    const group = document.querySelectorAll(
      '[role="radiogroup"][aria-labelledby="sys04-titulo-lista"]',
    );
    if (seenGroup && group.length !== 1) invalidate();
    seenGroup ||= group.length === 1;
  }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
  const original = window.fetch;
  window.fetch = function (...args) {
    const result = Reflect.apply(original, this, args);
    let raw,
      method = "GET",
      body;
    try {
      const [input, init] = args;
      if (typeof input === "string") raw = input;
      else if (input instanceof URL) raw = input.href;
      else if (input instanceof Request) {
        raw = input.url;
        method = input.method;
      }
      for (const k of ["method", "body"]) {
        const d = init == null ? null : Object.getOwnPropertyDescriptor(init, k);
        if (d && !("value" in d)) {
          if (raw === target) invalidate();
          return result;
        }
        if (k === "method" && d?.value !== undefined) method = d.value;
        if (k === "body") body = d?.value;
      }
    } catch {
      return result;
    }
    if (raw !== target) {
      try {
        const u = new URL(raw);
        if (u.origin + u.pathname === target) invalidate();
      } catch {}
      return result;
    }
    if (!match(raw, method, body) || !current()) {
      invalidate();
      return result;
    }
    pending++;
    const timer = setTimeout(invalidate, 10000);
    void result
      .then(async (response) => {
        if (
          !current() ||
          response.status !== 200 ||
          response.redirected ||
          response.url !== target
        ) {
          invalidate();
          return;
        }
        const reader = response.clone().body?.getReader();
        if (!reader) {
          invalidate();
          return;
        }
        const chunks = [];
        let size = 0;
        try {
          for (;;) {
            const item = await reader.read();
            if (item.done) break;
            size += item.value.byteLength;
            if (size > 262144 || !current()) {
              invalidate();
              await reader.cancel();
              return;
            }
            chunks.push(item.value);
          }
          const bytes = new Uint8Array(size);
          let offset = 0;
          for (const c of chunks) {
            bytes.set(c, offset);
            offset += c.byteLength;
          }
          const receipt = project(
            JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
          );
          if (!receipt || !current()) invalidate();
          else ids = receipt.ids;
        } finally {
          reader.releaseLock();
        }
      }, invalidate)
      .catch(invalidate)
      .finally(() => {
        clearTimeout(timer);
        pending--;
      });
    return result;
  };
  Object.defineProperty(window, "__contaosPrivacySys04", {
    configurable: false,
    writable: false,
    value: Object.freeze({
      invalidate,
      read: () =>
        current() && pending === 0 && ids
          ? {
              route: "/selecionar-organizacao",
              ids: [...ids],
              revision,
              age: Math.floor(performance.now() - started),
            }
          : null,
    }),
  });
}
export function privacySys04Anchor({ proof, receipt }) {
  if (
    !receipt ||
    receipt.route !== "/selecionar-organizacao" ||
    !Array.isArray(receipt.ids) ||
    new Set(receipt.ids).size !== receipt.ids.length
  )
    return null;
  const catalog = [...proof.legacy, ...proof.constructor_closed, ...proof.discovered_closed];
  const groups = document.querySelectorAll(
    '[role="radiogroup"][aria-labelledby="sys04-titulo-lista"]',
  );
  if (
    groups.length !== 1 ||
    document.querySelectorAll("#sys04-titulo-lista").length !== 1 ||
    document.querySelector("#sys04-titulo-lista").textContent !== "Organizações disponíveis"
  )
    return null;
  const group = groups[0],
    cards = [...group.children];
  const checked = cards.filter((c) => c.getAttribute("aria-checked") === "true");
  if (
    checked.length > 1 ||
    cards.some(
      (c) =>
        !["true", "false"].includes(c.getAttribute("aria-checked")) ||
        !["0", "-1"].includes(c.getAttribute("tabindex")),
    )
  )
    return null;
  const focused = checked[0] ?? cards[0];
  if (cards.some((c) => c.getAttribute("tabindex") !== (c === focused ? "0" : "-1"))) return null;
  if (
    cards.length !== receipt.ids.length ||
    group.querySelectorAll('[role="radio"]').length !== cards.length
  )
    return null;
  const result = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i],
      row = catalog.find((r) => r.id === receipt.ids[i]);
    if (
      !row ||
      card.getAttribute("role") !== "radio" ||
      card.querySelectorAll('[role="radio"]').length ||
      !card.getClientRects().length
    )
      return null;
    const children = [...card.children];
    const selected = card.getAttribute("aria-checked") === "true";
    if ((children.length === 3) !== selected || children[0]?.children.length !== (selected ? 1 : 0))
      return null;
    if (
      children.length < 2 ||
      children.length > 3 ||
      children[0].tagName !== "SPAN" ||
      children[0].getAttribute("aria-hidden") !== "true" ||
      children[0].textContent !== "" ||
      children[1].tagName !== "DIV" ||
      !children[1].classList.contains("min-w-0")
    )
      return null;
    if (
      children[2] &&
      (children[2].tagName !== "SPAN" ||
        !children[2].classList.contains("sr-only") ||
        children[2].textContent !== "Selecionada")
    )
      return null;
    const content = [...children[1].children],
      second = !!row.nome_fantasia && row.nome_fantasia !== row.razao_social;
    const labels = [row.nome_fantasia || row.razao_social, ...(second ? [row.razao_social] : [])];
    if (content.length !== labels.length + 1) return null;
    for (let j = 0; j < labels.length; j++)
      if (
        content[j].tagName !== "P" ||
        content[j].childNodes.length !== 1 ||
        content[j].firstChild.nodeType !== Node.TEXT_NODE ||
        content[j].textContent !== labels[j]
      )
        return null;
    const dl = content.at(-1);
    if (dl.tagName !== "DL" || dl.children.length !== 3) return null;
    const terms = ["CNPJ:", "Perfil:", "Situação:"],
      values = ["—", "Administrador Master", row.situacao];
    for (let j = 0; j < 3; j++) {
      const pair = dl.children[j],
        nodes = [...pair.children];
      if (
        pair.tagName !== "DIV" ||
        nodes.length !== 2 ||
        nodes[0].tagName !== "DT" ||
        nodes[1].tagName !== "DD" ||
        nodes[0].textContent !== terms[j] ||
        nodes[1].textContent !== values[j] ||
        nodes.some((n) => n.childNodes.length !== 1 || n.firstChild.nodeType !== Node.TEXT_NODE)
      )
        return null;
    }
    // No unknown descendant text or attributes can be consumed as approved fields.
    const allowedAttrs = new Set([
      "class",
      "role",
      "aria-checked",
      "tabindex",
      "aria-hidden",
      "viewBox",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "d",
      "width",
      "height",
      "xmlns",
    ]);
    if (
      [card, ...card.querySelectorAll("*")].some((n) =>
        [...n.attributes].some((a) => !allowedAttrs.has(a.name)),
      )
    )
      return null;
    const expectedText =
      labels.join("") +
      terms.map((t, j) => t + values[j]).join("") +
      (children[2] ? "Selecionada" : "");
    if (card.textContent !== expectedText) return null;
    result.push({ id: row.id, text: card.innerText, values: labels });
  }
  return { ids: [...receipt.ids], cards: result };
}
export function privacySys04FieldContext({
  proof,
  receipt,
  anchor,
  rendered,
  snapshot,
  cardSnapshots,
  anchored,
}) {
  if (
    !privacySys04Proofs.has(proof) ||
    anchored !== true ||
    receipt?.route !== "/selecionar-organizacao" ||
    !Number.isInteger(receipt.revision) ||
    !Number.isInteger(receipt.age) ||
    receipt.age < 0 ||
    receipt.age >= 120000 ||
    !anchor ||
    JSON.stringify(anchor.ids) !== JSON.stringify(receipt.ids) ||
    anchor.cards.length !== receipt.ids.length ||
    !Array.isArray(cardSnapshots) ||
    cardSnapshots.length !== receipt.ids.length ||
    typeof rendered !== "string" ||
    typeof snapshot !== "string"
  )
    return null;
  const strip = (text, values) => {
    let out = text;
    for (const value of [...new Set(values)].sort((a, b) => b.length - a.length)) {
      const escaped = privacySys04Literal(value);
      out = out.replace(
        new RegExp("(?<![\\p{L}\\p{N}_-])" + escaped + "(?![\\p{L}\\p{N}_-])", "gu"),
        " ",
      );
    }
    return out;
  };
  const replaceBlocks = (full, blocks, snap) => {
    let result = full;
    const expected = new Map();
    for (const block of blocks) {
      const key = block.text;
      const entry = expected.get(key) || { count: 0, values: block.values };
      if (JSON.stringify(entry.values) !== JSON.stringify(block.values)) return null;
      entry.count++;
      expected.set(key, entry);
    }
    for (const [key, { count, values }] of expected) {
      if (!key) return null;
      if (!snap) {
        const parts = result.split(key);
        if (parts.length - 1 !== count) return null;
        result = parts.join(strip(key, values));
      } else {
        const lines = result.split("\n"),
          wanted = key.trim().split("\n"),
          matches = [];
        for (let i = 0; i < lines.length; i++) {
          const indent = lines[i].match(/^ */)[0];
          if (wanted.every((l, j) => lines[i + j] === indent + l)) matches.push({ i, indent });
        }
        if (matches.length !== count) return null;
        for (const { i, indent } of matches.reverse())
          lines.splice(
            i,
            wanted.length,
            ...strip(wanted.join("\n"), values)
              .split("\n")
              .map((l) => indent + l),
          );
        result = lines.join("\n");
      }
    }
    return result;
  };
  const cards = anchor.cards;
  if (
    cards.some(
      (c, i) => c.id !== receipt.ids[i] || typeof c.text !== "string" || !Array.isArray(c.values),
    )
  )
    return null;
  const rr = replaceBlocks(rendered, cards, false);
  const ss = replaceBlocks(
    snapshot,
    cards.map((c, i) => ({ text: cardSnapshots[i], values: c.values })),
    true,
  );
  if (rr === null || ss === null) return null;
  const context = Object.freeze({});
  privacy78Contexts.set(context, {
    rendered: { original: rendered, remainder: rr },
    snapshot: { original: snapshot, remainder: ss },
  });
  return context;
}

// GATE372: closed technical catalog; never a global word allowlist.
const privacy78Contexts = new WeakMap();
const privacy78Pages = new WeakMap();
const privacy78Proofs = new WeakSet();
const privacy78RbacProofs = new WeakSet();
export async function loadPrivacy78Proof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_TECNICA_READONLY.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "5aa39ef35e4a432f4f4f5f29d72ee5773a56e62102948f0e3a31a0529c2d8f18")
    fail("PRIVACY_PROOF");
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const proof = freeze(JSON.parse(bytes));
  privacy78Proofs.add(proof);
  return proof;
}

export async function loadPrivacy78RbacProof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_RBAC_V115_READONLY.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "d70d36f3977f7649dffb2ca0271bb43e181a0244c8e0089e471a86299bcaa897")
    fail("PRIVACY_PROOF");
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const proof = freeze(JSON.parse(bytes));
  privacy78RbacProofs.add(proof);
  return proof;
}

export async function loadPrivacyWireProof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-wire-cardinality-20261109.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "60e0ac641d0ddfa273b3dde46d1aad14c53ed5742932f84dcc207f14d68c42e7")
    fail("PRIVACY_PROOF");
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  return freeze(JSON.parse(bytes));
}

const privacy123Proofs = new WeakSet();
export async function loadPrivacy123Proof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-v123-20261109/PROVENIENCIA_V123_READONLY.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "c9eec464456e21dd598e6094d271be64e10c477583b174e122fb3317e493df80")
    fail("PRIVACY_PROOF");
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const proof = freeze(JSON.parse(bytes));
  privacy123Proofs.add(proof);
  return proof;
}
export function privacy123FieldContext({
  proof,
  v123Proof,
  rendered,
  snapshot,
  fieldSnapshots,
  anchored,
  receipt,
}) {
  if (
    !privacy78Proofs.has(proof) ||
    !privacy123Proofs.has(v123Proof) ||
    proof.context.organization !== v123Proof.context.organization ||
    anchored !== true ||
    !receipt ||
    !Object.isFrozen(receipt) ||
    !Array.isArray(receipt.observed) ||
    !Object.isFrozen(receipt.observed) ||
    receipt.observed.length !== 1 ||
    receipt.observed[0] !== "v123_events_page0" ||
    receipt.route !== v123Proof.context.route ||
    !Number.isFinite(receipt.age) ||
    receipt.age < 0 ||
    receipt.age >= 120000 ||
    !Array.isArray(fieldSnapshots) ||
    fieldSnapshots.length !== 10 ||
    ![rendered, snapshot].every((s) => typeof s === "string" && s.length <= 1000000)
  )
    return null;
  const ranges = { rendered: [], snapshot: [] },
    values = new Set();
  const locateText = (whole, value) => {
    const at = whole.indexOf(value);
    return at >= 0 && whole.indexOf(value, at + 1) < 0 ? at : null;
  };
  const locateRow = (whole, row) => {
    const lines = whole.split("\n"),
      wanted = row.split("\n"),
      found = [];
    let offset = 0;
    for (let i = 0; i < lines.length; i++) {
      const indent = lines[i].match(/^ */)[0];
      if (wanted.every((line, j) => lines[i + j] === indent + line))
        found.push({ offset, indent: indent.length });
      offset += lines[i].length + 1;
    }
    return found.length === 1 ? found[0] : null;
  };
  for (let i = 0; i < 10; i++) {
    const fields = fieldSnapshots[i],
      event = v123Proof.events[i];
    const rowValues = v123Proof.visible_columns.map(({ catalog_field }) => event[catalog_field]);
    if (
      !fields ||
      fields.catalogIndex !== i ||
      !Array.isArray(fields.cells) ||
      fields.cells.length !== 5 ||
      ![fields.rendered, fields.row, ...fields.cells].every(
        (s) => typeof s === "string" && s.length <= 1000000,
      ) ||
      rowValues.some((v) => typeof v !== "string" || !v.length)
    )
      return null;
    rowValues.forEach((v) => values.add(v));
    const cells = rowValues.map((v) => "- cell " + JSON.stringify(v));
    const lines = [
      "- row " + JSON.stringify(rowValues.join(" ")) + ":",
      ...cells.map((s) => "  " + s),
    ];
    if (
      fields.rendered !== rowValues.join("\t") ||
      fields.row !== lines.join("\n") ||
      fields.cells.some((s, j) => s !== cells[j])
    )
      return null;
    const at = locateText(rendered, fields.rendered),
      row = locateRow(snapshot, fields.row);
    if (at === null || row === null) return null;
    let cursor = at;
    for (const v of rowValues) {
      ranges.rendered.push({ start: cursor, end: cursor + v.length });
      cursor += v.length + 1;
    }
    cursor = row.offset + row.indent + '- row "'.length;
    for (const v of rowValues) {
      ranges.snapshot.push({ start: cursor, end: cursor + v.length });
      cursor += v.length + 1;
    }
    cursor = row.offset + row.indent + lines[0].length + 1 + row.indent;
    for (let j = 0; j < 5; j++) {
      const start = cursor + '  - cell "'.length;
      ranges.snapshot.push({ start, end: start + rowValues[j].length });
      cursor += lines[j + 1].length + 1 + row.indent;
    }
  }
  // Non-visible API fields receive no intervals; copies outside owned cells reject.
  for (const event of v123Proof.events)
    for (const field of ["id", "criado_em", "origem", "id_entidade"])
      if (typeof event[field] === "string" && event[field].length) values.add(event[field]);
  const erase = (text, owned) => {
    const ordered = [...owned].sort((a, b) => a.start - b.start);
    if (
      ordered.some(
        (r, i) =>
          r.start < 0 ||
          r.end <= r.start ||
          r.end > text.length ||
          (i && r.start < ordered[i - 1].end),
      )
    )
      return null;
    for (const value of values) {
      let offset = 0;
      for (;;) {
        const at = text.indexOf(value, offset);
        if (at < 0) break;
        if (!ordered.some((r) => at >= r.start && at + value.length <= r.end)) return null;
        offset = at + 1;
      }
    }
    return ordered.reverse().reduce((s, r) => s.slice(0, r.start) + " " + s.slice(r.end), text);
  };
  if (ranges.rendered.length !== 50 || ranges.snapshot.length !== 100) return null;
  const r = erase(rendered, ranges.rendered),
    s = erase(snapshot, ranges.snapshot);
  if (r === null || s === null) return null;
  const context = Object.freeze({});
  privacy78Contexts.set(context, {
    rendered: { original: rendered, remainder: r },
    snapshot: { original: snapshot, remainder: s },
  });
  return context;
}
export function privacy123FieldAnchor({ proof }) {
  if (
    proof?.schema !== "contaos.hml.privacy-v123-exact-catalog.v1" ||
    proof.context?.surface !== "V123" ||
    !Array.isArray(proof.events) ||
    proof.events.length !== 10
  )
    return null;
  const visible = (e) =>
    e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  const attrs = (e, allowed) => e && [...e.attributes].every((a) => allowed.includes(a.name));
  const plain = (e, allowed = ["class"]) =>
    attrs(e, allowed) && [...e.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);
  const selector = 'div[role="region"][aria-label="Eventos de auditoria"]';
  const regions = document.querySelectorAll(selector);
  if (
    regions.length !== 1 ||
    !visible(regions[0]) ||
    !attrs(regions[0], ["role", "aria-label", "tabindex", "class"]) ||
    regions[0].getAttribute("tabindex") !== "0"
  )
    return null;
  const main = regions[0].closest("main"),
    headings = main?.querySelectorAll("h1");
  if (
    !main ||
    headings.length !== 1 ||
    headings[0].textContent !== "Trilha de auditoria" ||
    !plain(headings[0])
  )
    return null;
  const tables = regions[0].querySelectorAll("table");
  if (tables.length !== 1 || !visible(tables[0]) || !attrs(tables[0], ["class"])) return null;
  const table = tables[0],
    captions = table.querySelectorAll(":scope > caption");
  if (
    captions.length !== 1 ||
    captions[0].textContent !== "Eventos de auditoria da organização" ||
    !plain(captions[0])
  )
    return null;
  const heads = table.querySelectorAll(":scope > thead");
  if (
    heads.length !== 1 ||
    !attrs(heads[0], ["class"]) ||
    heads[0].children.length !== 1 ||
    heads[0].firstElementChild.tagName !== "TR" ||
    !attrs(heads[0].firstElementChild, ["class"])
  )
    return null;
  const headers = heads[0].firstElementChild.children;
  const labels = ["Data e hora", "Evento", "Entidade", "Usuário", "Correlação"];
  if (
    headers.length !== 5 ||
    [...headers].some(
      (e, i) =>
        e.tagName !== "TH" ||
        e.textContent !== labels[i] ||
        e.getAttribute("scope") !== "col" ||
        !plain(e, ["class", "scope"]),
    )
  )
    return null;
  const bodies = table.querySelectorAll(":scope > tbody");
  if (bodies.length !== 1 || bodies[0].children.length !== 10 || !attrs(bodies[0], ["class"]))
    return null;
  const rows = [...bodies[0].children],
    order = [],
    seen = new Set();
  const columns = ["formatted_created", "evento", "entidade", "id_usuario", "correlation_id"];
  for (const row of rows) {
    const cells = [...row.children];
    if (
      row.tagName !== "TR" ||
      !attrs(row, ["class"]) ||
      cells.length !== 5 ||
      cells.some((e) => e.tagName !== "TD" || !plain(e) || !visible(e))
    )
      return null;
    const matches = [];
    for (let i = 0; i < proof.events.length; i++)
      if (columns.every((field, j) => cells[j].textContent === proof.events[i][field]))
        matches.push(i);
    if (matches.length !== 1 || seen.has(matches[0]) || matches[0] !== order.length) return null;
    order.push(matches[0]);
    seen.add(matches[0]);
  }
  const filters = main.querySelectorAll('section[aria-label="Filtros de auditoria"]');
  if (filters.length !== 1 || !attrs(filters[0], ["aria-label", "class"])) return null;
  const filterLabels = filters[0].querySelectorAll(":scope > label");
  const filterNames = [
    "Evento",
    "Entidade",
    "ID do usuário",
    "Correlation ID",
    "Data inicial",
    "Data final",
  ];
  if (
    filters[0].children.length !== 6 ||
    filterLabels.length !== 6 ||
    filters[0].querySelectorAll("input").length !== 6
  )
    return null;
  for (let i = 0; i < 6; i++) {
    const label = filterLabels[i],
      inputs = label.querySelectorAll(":scope > input"),
      input = inputs[0];
    if (
      !attrs(label, ["class"]) ||
      label.textContent.trim() !== filterNames[i] ||
      inputs.length !== 1 ||
      !attrs(input, ["class", "type", "value"]) ||
      input.value !== "" ||
      input.disabled ||
      input.type !== (i < 4 ? "text" : "date") ||
      [...label.childNodes].some((n) => n.nodeType !== Node.TEXT_NODE && n !== input)
    )
      return null;
  }
  const navs = main.querySelectorAll('nav[aria-label="Paginação da auditoria"]');
  if (
    navs.length !== 1 ||
    !attrs(navs[0], ["aria-label", "class"]) ||
    navs[0].children.length !== 3
  )
    return null;
  const [previous, page, next] = navs[0].children;
  if (
    previous.tagName !== "BUTTON" ||
    next.tagName !== "BUTTON" ||
    !previous.disabled ||
    !next.disabled ||
    previous.textContent.trim() !== "Anterior" ||
    next.textContent.trim() !== "Próxima" ||
    !plain(previous, ["class", "disabled"]) ||
    !plain(next, ["class", "disabled"]) ||
    page.tagName !== "SPAN" ||
    page.textContent !== "Página 1" ||
    page.getAttribute("aria-live") !== "polite" ||
    !plain(page, ["aria-live"])
  )
    return null;
  return { selector: selector + " > table > tbody > tr", count: 10, order };
}
export async function privacy123FieldSnapshots(page, anchor) {
  if (!anchor || anchor.count !== 10 || !Array.isArray(anchor.order) || anchor.order.length !== 10)
    return null;
  const rows = page.locator(anchor.selector);
  if ((await rows.count()) !== 10) return null;
  const result = [];
  for (let i = 0; i < 10; i++) {
    const row = rows.nth(i),
      cells = row.locator(":scope > td");
    if ((await cells.count()) !== 5) return null;
    result.push({
      catalogIndex: anchor.order[i],
      rendered: await row.innerText(),
      row: (await row.ariaSnapshot()).trim(),
      cells: await Promise.all(
        Array.from({ length: 5 }, async (_, j) => (await cells.nth(j).ariaSnapshot()).trim()),
      ),
    });
  }
  return result;
}
export function privacy123Supplement(tap) {
  if (
    typeof tap !== "string" ||
    !/^ok 1 - privacy123 Chromium full DOM ARIA matrix binds approved ordered page$/m.test(tap)
  )
    return null;
  const expected = { tests: 1, pass: 1, fail: 0, skipped: 0, cancelled: 0 };
  return Object.entries(expected).every(([key, value]) => {
    const matches = [...tap.matchAll(new RegExp("^# " + key + " ([0-9]+)$", "gm"))];
    return matches.length === 1 && Number(matches[0][1]) === value;
  })
    ? 1
    : null;
}

const privacy109Proofs = new WeakSet();
export async function loadPrivacy109Proof() {
  const bytes = await readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-remaining-v109-20261108.json",
      import.meta.url,
    ),
  );
  if (digest(bytes) !== "506b940f76402f89f173c63553084452ea4ebc25da3bcf4ef29d3dd9dbb0f577")
    fail("PRIVACY_PROOF");
  const freeze = (v) => {
    if (v && typeof v === "object") {
      Object.values(v).forEach(freeze);
      Object.freeze(v);
    }
    return v;
  };
  const proof = freeze(JSON.parse(bytes));
  privacy109Proofs.add(proof);
  return proof;
}

export function privacy109FieldContext({
  proof,
  v109Proof,
  rendered,
  snapshot,
  fieldSnapshots,
  anchored,
  receipt,
}) {
  if (
    !privacy78Proofs.has(proof) ||
    !privacy109Proofs.has(v109Proof) ||
    anchored !== true ||
    !receipt ||
    !Object.isFrozen(receipt) ||
    !Array.isArray(receipt.observed) ||
    !Object.isFrozen(receipt.observed) ||
    receipt.route !== v109Proof.context.route ||
    receipt.route !== privateCases().find((i) => i.surface === "V109").path ||
    !Number.isFinite(receipt.age) ||
    receipt.age < 0 ||
    receipt.age >= 120000 ||
    !["contract_gate", "v109_lists_page0"].every((n) => receipt.observed.includes(n)) ||
    new Set(receipt.observed).size !== receipt.observed.length ||
    receipt.observed.some(
      (n) => n !== "v109_lists_page0" && !proof.get_contracts.some((c) => c.name === n),
    ) ||
    !Array.isArray(fieldSnapshots) ||
    fieldSnapshots.length !== 2 ||
    ![rendered, snapshot, ...fieldSnapshots].every(
      (t) => typeof t === "string" && t.length <= 1000000,
    )
  )
    return null;
  const values = [
    v109Proof.approved_values.description,
    v109Proof.approved_values.formatted_updated,
  ];
  if (
    !values.every(
      (v, i) =>
        rendered.split(v).length === 2 &&
        snapshot.split(v).length === 2 &&
        fieldSnapshots[i].split(v).length === 2 &&
        !fieldSnapshots[1 - i].includes(v),
    )
  )
    return null;
  // Only indentation of the exact same ARIA subtree may differ. No token,
  // role, name or unknown neighbour is normalized or removed.
  const locate = (whole, fragment) => {
    const lines = whole.split("\n"),
      wanted = fragment.trim().split("\n"),
      matches = [];
    let offset = 0;
    for (let i = 0; i < lines.length; i++) {
      const indent = lines[i].match(/^ */)[0];
      if (wanted.every((line, j) => lines[i + j] === indent + line)) {
        const end = offset + lines.slice(i, i + wanted.length).join("\n").length;
        matches.push({ start: offset, end });
      }
      offset += lines[i].length + 1;
    }
    return matches.length === 1 ? matches[0] : null;
  };
  const snapshotRanges = fieldSnapshots.map((f) => locate(snapshot, f));
  if (snapshotRanges.some((x) => !x) || snapshotRanges[0].end > snapshotRanges[1].start)
    return null;
  const intervals = (text) =>
    values.map((v) => ({ start: text.indexOf(v), end: text.indexOf(v) + v.length }));
  const sr = intervals(snapshot);
  if (sr.some((x, i) => x.start < snapshotRanges[i].start || x.end > snapshotRanges[i].end))
    return null;
  const erase = (text, ranges) =>
    [...ranges]
      .sort((a, b) => b.start - a.start)
      .reduce((s, r) => s.slice(0, r.start) + " " + s.slice(r.end), text);
  const context = Object.freeze({});
  privacy78Contexts.set(context, {
    rendered: { original: rendered, remainder: erase(rendered, intervals(rendered)) },
    snapshot: { original: snapshot, remainder: erase(snapshot, sr) },
  });
  return context;
}

export function privacy109FieldAnchor({ proof }) {
  if (proof?.context?.surface !== "V109" || !/^[0-9a-f-]{36}$/.test(proof.context.list))
    return null;
  const visible = (e) =>
    e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  const plain = (e) =>
    e &&
    [...e.attributes].every((a) => a.name === "class") &&
    [...e.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);
  const sections = document.querySelectorAll('section[aria-labelledby="v109-listas"]');
  if (
    sections.length !== 1 ||
    !visible(sections[0]) ||
    document.querySelectorAll("#v109-listas").length !== 1
  )
    return null;
  const section = sections[0],
    heading = section.querySelectorAll(":scope > h2#v109-listas"),
    uls = section.querySelectorAll(":scope > ul");
  if (
    heading.length !== 1 ||
    heading[0].textContent !== "Listas de verificação" ||
    uls.length !== 1
  )
    return null;
  const v = proof.approved_values,
    controls = "v109-lista-" + proof.context.list;
  const buttons = [...document.querySelectorAll("button")].filter(
    (b) => b.getAttribute("aria-controls") === controls,
  );
  if (buttons.length !== 1) return null;
  const button = buttons[0],
    leading = button.parentElement,
    li = leading?.parentElement;
  if (
    !visible(button) ||
    button.getAttribute("aria-expanded") !== "false" ||
    button.getAttribute("aria-label") !== "Ver versões e itens de " + v.name ||
    button.textContent !== "Ver versões e itens" ||
    li?.tagName !== "LI" ||
    li.parentElement !== uls[0] ||
    leading.tagName !== "DIV" ||
    li.children.length !== 1 ||
    document.getElementById(controls)
  )
    return null;
  const containers = leading.querySelectorAll(":scope > div.min-w-0");
  if (containers.length !== 1) return null;
  const ps = containers[0].querySelectorAll(":scope > p");
  if (
    ps.length !== 3 ||
    containers[0].children.length !== 3 ||
    !plain(ps[0]) ||
    ps[0].textContent !== v.name ||
    !plain(ps[1]) ||
    ps[1].textContent !== v.description ||
    !visible(ps[1]) ||
    [...ps[2].attributes].some((a) => a.name !== "class")
  )
    return null;
  const spans = ps[2].querySelectorAll(":scope > span");
  if (
    spans.length !== 3 ||
    ps[2].children.length !== 3 ||
    !plain(spans[2]) ||
    !spans[2].classList.contains("text-muted-foreground") ||
    !visible(spans[2]) ||
    spans[2].textContent !== v.formatted_updated ||
    [...ps[2].childNodes].some(
      (n) =>
        n.nodeType !== Node.ELEMENT_NODE && (n.nodeType !== Node.TEXT_NODE || n.textContent.trim()),
    )
  )
    return null;
  return {
    row: 'section[aria-labelledby="v109-listas"] > ul > li',
    control: 'button[aria-controls="' + controls + '"]',
    paragraphs: ":scope > div > div.min-w-0 > p",
    descriptionIndex: 1,
    metadataIndex: 2,
    paragraphCount: 3,
  };
}

export async function privacy109FieldSnapshots(page, anchor) {
  if (!anchor) return null;
  const row = page.locator(anchor.row).filter({ has: page.locator(anchor.control) });
  if ((await row.count()) !== 1) return null;
  const paragraphs = row.locator(anchor.paragraphs);
  if ((await paragraphs.count()) !== anchor.paragraphCount) return null;
  return [
    (await paragraphs.nth(anchor.descriptionIndex).ariaSnapshot()).trim(),
    (await paragraphs.nth(anchor.metadataIndex).ariaSnapshot()).trim(),
  ];
}

export function privacy78Runtime({
  proof,
  rbacProof = null,
  v109Proof = null,
  v123Proof = null,
  wireProof = null,
  install = false,
}) {
  const origin = "https://gklhhhyosgasnyoxlrui.supabase.co";
  // Only the four approved maybeSingle transports use singleton HTTP arrays.
  // Their DTO normalization occurs later inside postgrest-js, after this observer.
  const wireNames = ["contract_gate", "document_gate", "upload", "competence_rbac_gate"];
  const wireValid =
    wireProof?.schema === "contaos.hml.privacy-wire-cardinality.v1" &&
    wireProof.dependency?.package === "@supabase/postgrest-js" &&
    wireProof.dependency.version === "2.118.0" &&
    wireProof.approved_wire?.wire_shape === "array" &&
    wireProof.approved_wire.exact_length === 1 &&
    JSON.stringify(wireProof.approved_wire.contract_names) === JSON.stringify(wireNames);
  const rq = rbacProof?.get_contract;
  const rbacValid =
    rbacProof?.schema === "contaos.hml.privacy78-rbac-context.v1" &&
    ["organization", "contract", "competence"].every(
      (k) => rbacProof.context?.[k] === proof.context[k],
    ) &&
    rq?.name === "competence_rbac_gate" &&
    rq.method === "GET" &&
    rq.origin === origin &&
    rq.path === "/rest/v1/competencias" &&
    rq.shape === "object; maybeSingle" &&
    JSON.stringify(rq.extract_only) === JSON.stringify(["id_contrato"]) &&
    Object.keys(rq.query ?? {}).length === 3 &&
    rq.query.select === "id_contrato" &&
    rq.query.id === "eq." + proof.context.competence &&
    rq.query.id_organizacao === "eq." + proof.context.organization &&
    rq.expected?.id_contrato === proof.context.contract;
  const rbacEnabled =
    rbacValid &&
    (!install ||
      (location.origin === "https://contaos-41-hml.vercel.app" &&
        location.pathname === "/competencias/" + proof.context.competence + "/documentos" &&
        !location.search &&
        !location.hash));

  const vq = v109Proof?.get_contract;
  const v109Valid =
    v109Proof?.schema === "contaos.hml.privacy-remaining-v109.v1" &&
    v109Proof.classification === "CAMPO_TECNICO_SEM_PII" &&
    v109Proof.context?.organization === proof.context.organization &&
    v109Proof.context.contract === proof.context.contract &&
    v109Proof.context.surface === "V109" &&
    v109Proof.context.route === "/contratos/" + proof.context.contract + "/regras" &&
    vq?.method === "GET" &&
    vq.origin === origin &&
    vq.path === "/rest/v1/listas_verificacao" &&
    vq.shape === "array" &&
    Object.keys(vq.query ?? {}).length === 5 &&
    vq.query.select === "id,nome,descricao,situacao,versao_atual,versao_registro,atualizado_em" &&
    vq.query.id_contrato === "eq." + proof.context.contract &&
    vq.query.order === "atualizado_em.desc,id.desc" &&
    vq.query.offset === "0" &&
    vq.query.limit === "25";
  const v109Enabled =
    v109Valid &&
    (!install ||
      (location.origin === "https://contaos-41-hml.vercel.app" &&
        location.pathname === v109Proof.context.route &&
        !location.search &&
        !location.hash));
  const v123Keys = [
    "id",
    "criado_em",
    "evento",
    "entidade",
    "origem",
    "id_usuario",
    "id_entidade",
    "correlation_id",
  ];
  const v123Contract = v123Proof?.get_contract;
  const v123Valid =
    v123Proof?.schema === "contaos.hml.privacy-v123-exact-catalog.v1" &&
    v123Proof.context?.surface === "V123" &&
    v123Proof.context.organization === proof.context.organization &&
    v123Proof.context.route === "/administracao/auditoria" &&
    v123Proof.context.origin === "https://contaos-41-hml.vercel.app" &&
    v123Contract?.name === "v123_events_page0" &&
    v123Contract.method === "GET" &&
    v123Contract.origin === origin &&
    v123Contract.path === "/rest/v1/eventos_auditoria" &&
    v123Contract.shape === "array" &&
    v123Contract.exact_rows === 10 &&
    v123Contract.sql_catalog_total === 10 &&
    JSON.stringify(v123Contract.row_keys) === JSON.stringify(v123Keys) &&
    Object.keys(v123Contract.query ?? {}).length === 5 &&
    v123Contract.query.select === v123Keys.join(",") &&
    v123Contract.query.id_organizacao === "eq." + proof.context.organization &&
    v123Contract.query.order === "criado_em.desc,id.desc" &&
    v123Contract.query.offset === "0" &&
    v123Contract.query.limit === "25" &&
    Array.isArray(v123Proof.events) &&
    v123Proof.events.length === 10 &&
    new Set(v123Proof.events.map((e) => e?.id)).size === 10;
  const v123Enabled =
    v123Valid &&
    (!install ||
      (location.origin === "https://contaos-41-hml.vercel.app" &&
        location.pathname === "/administracao/auditoria" &&
        !location.search &&
        !location.hash));
  const contracts = [
    ...proof.get_contracts,
    ...(rbacEnabled ? [rq] : []),
    ...(v109Enabled ? [{ ...vq, name: "v109_lists_page0" }] : []),
    ...(v123Enabled ? [v123Contract] : []),
  ];

  const match = (raw, method) => {
    if (method !== "GET" || typeof raw !== "string") return null;
    let url;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }
    if (url.origin !== origin || url.username || url.password || url.hash) return null;
    return (
      contracts.find((c) => {
        const keys = Object.keys(c.query);
        return (
          url.pathname === c.path &&
          [...url.searchParams].length === keys.length &&
          keys.every(
            (k) =>
              url.searchParams.getAll(k).length === 1 && url.searchParams.get(k) === c.query[k],
          )
        );
      }) ?? null
    );
  };
  const c = proof.context,
    p = proof.observed.pipeline[0],
    dates = proof.observed.competencias[0];
  const expected = {
    contract_gate: { id: c.contract, id_organizacao: c.organization },
    upload: {
      extensoes_permitidas: proof.observed.upload.extensions,
      tamanho_maximo_bytes: proof.observed.upload.max_bytes,
    },
    competencias_page0_no_filters: {
      id: c.competence,
      competencia_referencia: dates.reference,
      periodo_inicio: dates.start,
      periodo_fim: dates.end,
    },
    document_gate: { id: c.document, id_contrato: c.contract },
    document_versions_page0: {
      id: c.document_version,
      id_documento_contrato: c.document,
      id_arquivo: c.file,
    },
    processing_page0: {
      id: c.processing,
      id_versao_documento: c.document_version,
      etapa: p.stage,
      iniciado_em: p.started,
      concluido_em: p.completed,
      criado_em: p.created,
    },
  };
  if (rbacEnabled) expected.competence_rbac_gate = { id_contrato: proof.context.contract };

  const micros = (value) => {
    if (typeof value !== "string") return null;
    const m =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
        value,
      );
    if (!m) return null;
    const y = +m[1],
      mo = +m[2],
      d = +m[3],
      h = +m[4],
      mi = +m[5],
      se = +m[6],
      oh = +(m[10] ?? 0),
      om = +(m[11] ?? 0);
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0),
      days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (
      y < 1 ||
      mo < 1 ||
      mo > 12 ||
      d < 1 ||
      d > days[mo - 1] ||
      h > 23 ||
      mi > 59 ||
      se > 59 ||
      oh > 14 ||
      om > 59 ||
      (oh === 14 && om !== 0)
    )
      return null;
    const yy = y - (mo <= 2 ? 1 : 0),
      era = Math.floor(yy / 400),
      yoe = yy - era * 400;
    const doy = Math.floor((153 * (mo + (mo > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    const date =
      era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
    const offset = (m[9] === "-" ? -1 : 1) * (oh * 3600 + om * 60);
    return (
      BigInt(date * 86400 + h * 3600 + mi * 60 + se - offset) * 1000000n +
      BigInt((m[7] ?? "").padEnd(6, "0"))
    );
  };
  if (v109Enabled)
    expected.v109_lists_page0 = {
      id: v109Proof.context.list,
      nome: v109Proof.approved_values.name,
      descricao: v109Proof.approved_values.description,
    };

  const project = (contract, body) => {
    if (contract?.name === "v123_events_page0") {
      if (!v123Enabled || !Array.isArray(body) || body.length !== 10) return null;
      const keys = [...v123Keys].sort().join(",");
      for (let i = 0; i < 10; i++) {
        const row = body[i],
          want = v123Proof.events[i];
        if (
          !row ||
          typeof row !== "object" ||
          Array.isArray(row) ||
          Object.keys(row).sort().join(",") !== keys ||
          micros(row.criado_em) === null ||
          micros(row.criado_em) !== micros(want.criado_em) ||
          v123Keys.some(
            (key) =>
              key !== "criado_em" && (typeof row[key] !== "string" || row[key] !== want[key]),
          )
        )
          return null;
      }
      return { name: contract.name, exact: true };
    }
    const want = expected[contract?.name];
    if (!want || !body || typeof body !== "object") return null;
    if (wireNames.includes(contract.name)) {
      if (
        !wireValid ||
        !Array.isArray(body) ||
        body.length !== 1 ||
        !body[0] ||
        typeof body[0] !== "object" ||
        Array.isArray(body[0])
      )
        return null;
      body = body[0];
    }
    const array = !contract.shape || contract.shape === "array";
    if (Array.isArray(body) !== array || (array && body.length > 25)) return null;
    const rows = array
      ? body.filter((r) => r && typeof r === "object" && r.id === want.id)
      : [body];
    if (rows.length !== 1) return null;
    if (
      ["document_versions_page0", "processing_page0"].includes(contract.name) &&
      body.length !== 1
    )
      return null;
    const row = rows[0];
    if (
      contract.name === "v109_lists_page0" &&
      (micros(row.atualizado_em) === null ||
        micros(row.atualizado_em) !== micros(v109Proof.approved_values.updated))
    )
      return null;
    if (
      !Object.entries(want).every(([k, value]) => JSON.stringify(row[k]) === JSON.stringify(value))
    )
      return null;
    if (contract.name === "document_versions_page0" && typeof row.criado_em !== "string")
      return null;
    // No raw row, unselected field or unexpected value crosses the browser boundary.
    return { name: contract.name, exact: true };
  };
  if (!install) return { match, project };
  const route = location.href,
    started = performance.now(),
    seen = new Set();
  // createBrowserHistory initializes a fresh entry with replaceState before
  // mounting the source consumers. Chrome emits navigate for that bookkeeping
  // replacement too. It carries no earlier receipt and does not change the URL.
  let bootstrapEntry =
    location.origin === "https://contaos-41-hml.vercel.app" &&
    !location.search &&
    !location.hash &&
    [
      "/contratos/" + proof.context.contract + "/documentos/" + proof.context.document,
      "/competencias/" + proof.context.competence + "/documentos",
    ].includes(location.pathname) &&
    !window.history.state?.key &&
    !window.history.state?.__TSR_key;
  let invalid = false,
    cause = 0,
    pending = 0,
    revision = 0,
    mutations = null;
  const invalidate = (code = 1) => {
    if (!invalid) cause = Number.isInteger(code) && code >= 1 && code <= 8 ? code : 1;
    invalid = true;
    seen.clear();
    mutations?.disconnect();
  };
  const current = () =>
    !invalid &&
    typeof document !== "undefined" &&
    !!document &&
    typeof location !== "undefined" &&
    location?.href === route &&
    performance.now() - started < 120000;
  for (const event of ["pagehide", "beforeunload", "popstate", "hashchange"])
    window.addEventListener(event, invalidate, { once: true });
  window.addEventListener("contaos:organizacao-alterada", invalidate, { once: true });
  document.addEventListener("visibilitychange", () => invalidate(7), { once: true });
  if (!window.navigation?.addEventListener) invalidate();
  else
    window.navigation.addEventListener("navigate", (event) => {
      if (
        bootstrapEntry &&
        !invalid &&
        !headerSeen &&
        pending === 0 &&
        seen.size === 0 &&
        event.navigationType === "replace" &&
        event.destination?.sameDocument === true &&
        event.destination.url === route &&
        location.href === route
      ) {
        bootstrapEntry = false;
        // The History API commits after navigate is dispatched. Admit only the
        // exact three-key state written by the installed TanStack dependency.
        queueMicrotask(() => {
          const state = window.history.state;
          if (
            location.href !== route ||
            !state ||
            Object.keys(state).length !== 3 ||
            state.__TSR_index !== 0 ||
            typeof state.key !== "string" ||
            !state.key ||
            state.__TSR_key !== state.key
          )
            invalidate(2);
        });
        return;
      }
      invalidate(2);
    });
  const headerCurrent = () => {
    if (typeof document === "undefined" || !document) return false;
    const header = document.querySelector('header[aria-label="Organização atual"]');
    return (
      !!header?.textContent.includes("ContaOS HML Teste") &&
      /Situação:\s*ativa/i.test(header.textContent)
    );
  };
  let headerSeen = headerCurrent();
  // Existing source resets this header on session/auth-generation changes.
  // No Auth objects, responses, events or headers are intercepted.
  mutations = new MutationObserver(() => {
    if (invalid) return;
    if (typeof document === "undefined" || !document) {
      invalidate();
      return;
    }
    revision++;
    const ready = headerCurrent();
    if (headerSeen && !ready) invalidate(3);
    headerSeen ||= ready;
  });
  mutations.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
  const original = window.fetch;
  window.fetch = function (...args) {
    // Preserve exact native receiver, arguments, promise, response and rejection.
    const result = Reflect.apply(original, this, args);
    let raw,
      method = "GET";
    try {
      const input = args[0],
        init = args[1];
      if (typeof input === "string") raw = input;
      else if (input instanceof URL) raw = input.href;
      else if (input instanceof Request) {
        raw = input.url;
        method = input.method;
      }
      if (init != null) {
        const descriptor = Object.getOwnPropertyDescriptor(init, "method");
        if (descriptor && !("value" in descriptor)) return result;
        if (descriptor?.value !== undefined) method = descriptor.value;
      }
    } catch {
      return result;
    }
    const contract = match(raw, method);
    if (!contract) {
      // Different filtering/pagination/projection cannot inherit a page-zero receipt.
      // Ignore Auth and all unrelated request/response content completely.
      try {
        const url = new URL(raw);
        if (
          method === "GET" &&
          url.origin === origin &&
          contracts.some((c) => c.path === url.pathname)
        )
          invalidate(4);
      } catch {}
      return result;
    }
    if (!current()) return result;
    pending++;
    const deadline = setTimeout(() => invalidate(8), 10000);
    void result
      .then(
        async (response) => {
          if (
            !current() ||
            response.status !== 200 ||
            response.redirected ||
            match(response.url, "GET")?.name !== contract.name
          ) {
            invalidate();
            return;
          }
          const reader = response.clone().body?.getReader();
          if (!reader) {
            invalidate();
            return;
          }
          const chunks = [];
          let bytes = 0;
          try {
            for (;;) {
              const next = await reader.read();
              if (next.done) break;
              bytes += next.value.byteLength;
              if (bytes > 262144 || !current()) {
                invalidate();
                await reader.cancel();
                return;
              }
              chunks.push(next.value);
            }
            const buffer = new Uint8Array(bytes);
            let offset = 0;
            for (const chunk of chunks) {
              buffer.set(chunk, offset);
              offset += chunk.byteLength;
            }
            const body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer));
            const receipt = project(contract, body);
            if (!receipt || !current()) invalidate(5);
            else seen.add(receipt.name);
          } finally {
            reader.releaseLock();
          }
        },
        () => invalidate(),
      )
      .catch(() => invalidate())
      .finally(() => {
        clearTimeout(deadline);
        pending--;
      });
    return result;
  };
  Object.defineProperty(window, "__contaosPrivacy78", {
    configurable: false,
    writable: false,
    value: Object.freeze({
      invalidate,
      diagnostics: () =>
        Object.freeze({
          invalid,
          cause,
          current: !!current(),
          route: location.href === route,
          header: headerCurrent(),
          pending: Math.min(512, pending),
          seen: Math.min(512, seen.size),
          age: Math.min(120000, Math.max(0, Math.floor(performance.now() - started))),
        }),
      read: () => {
        if (headerSeen && !headerCurrent()) invalidate(3);
        return current() && pending === 0
          ? {
              route,
              observed: [...seen].sort(),
              age: Math.floor(performance.now() - started),
              revision,
            }
          : null;
      },
    }),
  });
}

export function privacy112Supplement(tap) {
  if (typeof tap !== "string") return null;
  if (
    !/^ok 1 - privacy112 Chromium full DOM ARIA matrix preserves scoped intervals and unknown neighbours$/m.test(
      tap,
    )
  )
    return null;
  const expected = { tests: 1, pass: 1, fail: 0, skipped: 0, cancelled: 0 };
  return Object.entries(expected).every(([key, value]) => {
    const matches = [...tap.matchAll(new RegExp("^# " + key + " ([0-9]+)$", "gm"))];
    return matches.length === 1 && Number(matches[0][1]) === value;
  })
    ? 1
    : null;
}

export function privacy112FieldContext({
  proof,
  rendered,
  snapshot,
  fieldSnapshots,
  anchored,
  receipt,
}) {
  if (
    !privacy78Proofs.has(proof) ||
    anchored !== true ||
    !receipt ||
    !Object.isFrozen(receipt) ||
    !Array.isArray(receipt.observed) ||
    !Object.isFrozen(receipt.observed) ||
    receipt.route !== privateCases().find((i) => i.surface === "V112").path ||
    !Number.isFinite(receipt.age) ||
    receipt.age < 0 ||
    receipt.age >= 120000 ||
    new Set(receipt.observed).size !== receipt.observed.length ||
    receipt.observed.some((n) => !proof.get_contracts.some((c) => c.name === n)) ||
    !["contract_gate", "competencias_page0_no_filters"].every((n) =>
      receipt.observed.includes(n),
    ) ||
    !Array.isArray(fieldSnapshots) ||
    fieldSnapshots.length !== 3 ||
    ![rendered, snapshot, ...fieldSnapshots].every(
      (t) => typeof t === "string" && t.length <= 1000000,
    )
  )
    return null;
  const value = proof.generated_exact_values.V112[0],
    [row, header, cell] = fieldSnapshots;
  if (
    value !== "01/11/2026 a 30/11/2026" ||
    rendered.split(value).length !== 2 ||
    snapshot.split(value).length !== 3 ||
    row.split(value).length !== 3 ||
    header !== '- rowheader "11/2026"' ||
    cell !== '- cell "' + value + '"'
  )
    return null;
  const lines = row.split("\n");
  if (
    !lines[0].startsWith('- row "11/2026 ' + value + " ") ||
    !lines[0].endsWith('":') ||
    lines[0].split(value).length !== 2 ||
    lines[1] !== "  " + header ||
    lines[2] !== "  " + cell ||
    lines.filter((l) => /^  - (?:rowheader|cell)(?: |:)/.test(l)).length !== 7
  )
    return null;
  const matches = [];
  let offset = 0;
  const whole = snapshot.split("\n");
  for (let i = 0; i < whole.length; i++) {
    const indent = whole[i].match(/^ */)[0];
    if (lines.every((l, j) => whole[i + j] === indent + l)) matches.push({ offset, indent });
    offset += whole[i].length + 1;
  }
  if (matches.length !== 1) return null;
  const { offset: start, indent } = matches[0];
  const first = start + indent.length + lines[0].indexOf(value);
  // Offsets are derived only from the exact same unique row subtree.
  const headerStart = start + indent.length + lines[0].length + 1 + indent.length;
  const cellStart = headerStart + lines[1].length + 1 + indent.length;
  const ranges = [
    { start: first, end: first + value.length },
    {
      start: cellStart + lines[2].indexOf(value),
      end: cellStart + lines[2].indexOf(value) + value.length,
    },
    { start: headerStart + 4, end: headerStart + 13 },
  ];
  if (
    snapshot.slice(ranges[2].start, ranges[2].end) !== "rowheader" ||
    snapshot.slice(ranges[1].start, ranges[1].end) !== value
  )
    return null;
  const erase = (text, rs) =>
    [...rs]
      .sort((a, b) => b.start - a.start)
      .reduce((s, r) => s.slice(0, r.start) + " " + s.slice(r.end), text);
  const context = Object.freeze({});
  privacy78Contexts.set(context, {
    rendered: { original: rendered, remainder: rendered.replace(value, " ") },
    snapshot: { original: snapshot, remainder: erase(snapshot, ranges) },
  });
  return context;
}
export function privacy112FieldAnchor({ proof }) {
  const value = proof?.generated_exact_values?.V112?.[0];
  if (value !== "01/11/2026 a 30/11/2026") return null;
  const visible = (e) =>
    e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  const plain = (e) =>
    e &&
    [...e.attributes].every(
      (a) => a.name === "class" || (e.tagName === "TH" && a.name === "scope"),
    ) &&
    [...e.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);
  const selector = 'section[aria-labelledby="v112-lista"]';
  const sections = document.querySelectorAll(selector);
  if (
    sections.length !== 1 ||
    !visible(sections[0]) ||
    document.querySelectorAll("#v112-lista").length !== 1
  )
    return null;
  const section = sections[0],
    headings = section.querySelectorAll(":scope > div:first-child > h2#v112-lista"),
    tables = section.querySelectorAll("table");
  if (
    headings.length !== 1 ||
    headings[0].textContent !== "Lista de competências" ||
    tables.length !== 1
  )
    return null;
  const table = tables[0],
    columns = [...table.querySelectorAll('thead th[scope="col"]')],
    expected = [
      "Competência",
      "Período",
      "Data limite",
      "Situação",
      "Conformidade",
      "Versão do pacote",
      "Ações",
    ];
  if (
    !visible(table) ||
    table.querySelectorAll("caption").length !== 1 ||
    table.querySelector("caption").textContent !== "Competências do contrato" ||
    columns.length !== 7 ||
    columns.some((c, i) => c.textContent !== expected[i])
  )
    return null;
  const rows = [...table.querySelectorAll("tbody tr")],
    found = [];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index],
      cells = [...row.children],
      header = cells[0],
      target = cells[1],
      links = [...row.querySelectorAll("a")];
    if (
      [...row.attributes].every((a) => a.name === "class") &&
      cells.length === 7 &&
      cells.slice(1).every((c) => c.tagName === "TD") &&
      header.tagName === "TH" &&
      header.getAttribute("scope") === "row" &&
      header.textContent === "11/2026" &&
      plain(header) &&
      target.tagName === "TD" &&
      target.textContent === value &&
      plain(target) &&
      visible(target) &&
      links.length === 1 &&
      [...links[0].attributes].every((a) => ["href", "aria-label", "class"].includes(a.name)) &&
      links[0].childNodes.length === 1 &&
      links[0].firstChild.nodeType === Node.ELEMENT_NODE &&
      links[0].firstChild.tagName === "SPAN" &&
      links[0].firstChild.attributes.length === 0 &&
      links[0].firstChild.childNodes.length === 1 &&
      links[0].firstChild.firstChild.nodeType === Node.TEXT_NODE &&
      links[0].firstChild.textContent === "Abrir competência" &&
      cells[6].contains(links[0]) &&
      links[0].getAttribute("href") === "/competencias/" + proof.context.competence &&
      links[0].getAttribute("aria-label") === "Abrir competência 11/2026"
    )
      found.push(index);
  }
  if (found.length !== 1) return null;
  return { selector: selector + " table tbody tr", index: found[0], count: rows.length };
}
export async function privacy112FieldSnapshots(page, anchor) {
  if (!anchor) return null;
  const rows = page.locator(anchor.selector);
  if ((await rows.count()) !== anchor.count) return null;
  const row = rows.nth(anchor.index),
    cells = row.locator(":scope > th, :scope > td");
  if ((await cells.count()) !== 7) return null;
  return [
    (await row.ariaSnapshot()).trim(),
    (await cells.nth(0).ariaSnapshot()).trim(),
    (await cells.nth(1).ariaSnapshot()).trim(),
  ];
}

export function privacy78FieldContext({
  surface,
  proof,
  rbacProof = null,
  rendered,
  snapshot,
  fieldSnapshot,
  anchored,
  receipt,
}) {
  if (surface === "V112") return null;
  if (
    !privacy78Proofs.has(proof) ||
    !receipt ||
    typeof receipt !== "object" ||
    !Array.isArray(receipt.observed)
  )
    return null;
  const rbacTrusted = privacy78RbacProofs.has(rbacProof);
  if (surface === "V115" && !rbacTrusted) return null;
  const contracts = rbacTrusted
    ? [...proof.get_contracts, rbacProof.get_contract]
    : proof.get_contracts;
  const path = privateCases().find((i) => i.surface === surface)?.path;
  const required = {
    V111: ["contract_gate", "document_gate", "document_versions_page0", "processing_page0"],
    V112: ["contract_gate", "competencias_page0_no_filters"],
    V115: ["competence_rbac_gate", "upload"],
    V122: ["contract_gate", "upload"],
  }[surface];
  if (
    !required ||
    anchored !== true ||
    !Object.isFrozen(receipt) ||
    !Object.isFrozen(receipt.observed) ||
    receipt.route !== path ||
    !Number.isFinite(receipt.age) ||
    receipt.age < 0 ||
    receipt.age >= 120000 ||
    new Set(receipt.observed).size !== receipt.observed.length ||
    receipt.observed.some((name) => !contracts.some((c) => c.name === name)) ||
    !required.every((name) => receipt.observed.includes(name))
  )
    return null;
  const value = proof.generated_exact_values[surface]?.[0];
  if (
    typeof value !== "string" ||
    ![rendered, snapshot, fieldSnapshot].every(
      (text) => typeof text === "string" && text.split(value).length === 2,
    )
  )
    return null;
  if (snapshot.split(fieldSnapshot).length !== 2) return null;
  const context = Object.freeze({});
  privacy78Contexts.set(context, {
    rendered: { original: rendered, remainder: rendered.replace(value, " ") },
    snapshot: { original: snapshot, remainder: snapshot.replace(value, " ") },
  });
  return context;
}

export function privacy78FieldAnchor({ surface, proof }) {
  const value = proof.generated_exact_values[surface]?.[0];
  if (!value) return null;
  const visible = (e) =>
    e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  let nodes = [],
    selector;
  if (surface === "V111") {
    selector = 'section[aria-label="Processamento"] li p';
    const regions = document.querySelectorAll('section[aria-label="Processamento"]');
    if (
      regions.length !== 1 ||
      regions[0].querySelectorAll("h2").length !== 1 ||
      regions[0].querySelector("h2").textContent !== "Processamento"
    )
      return null;
    const date = (v) =>
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short",
      })
        .format(new Date(v))
        .replace(",", "");
    const p = proof.observed.pipeline[0],
      expected =
        "Registrado em " + date(p.created) + " · " + value + " · Concluído em " + date(p.completed);
    nodes = [...document.querySelectorAll(selector)].filter(
      (n) =>
        visible(n) &&
        n.textContent === expected &&
        [...(n.closest("li")?.querySelectorAll("span") ?? [])].filter(
          (s) => s.textContent === "Etapa: documents",
        ).length === 1,
    );
  } else if (surface === "V112") {
    return null;
  } else if (surface === "V115") {
    selector = 'section[aria-labelledby="v115-envio"] #v115-arquivo';
    const inputs = document.querySelectorAll(selector);
    if (inputs.length !== 1 || !visible(inputs[0]) || inputs[0].type !== "file") return null;
    const heading = inputs[0].closest("section").querySelectorAll("#v115-envio");
    if (
      heading.length !== 1 ||
      heading[0].tagName !== "H2" ||
      heading[0].textContent !== "Enviar documento"
    )
      return null;
    const parent = inputs[0].parentElement,
      labels = parent.querySelectorAll('label[for="v115-arquivo"]');
    if (labels.length !== 1 || labels[0].textContent.trim() !== "Arquivo") return null;
    nodes = [...parent.querySelectorAll(":scope > p")].filter(
      (n) => visible(n) && n.textContent === "Limite: " + value,
    );
    selector = 'section[aria-labelledby="v115-envio"] #v115-arquivo ~ p';
  } else if (surface === "V122") {
    const inputs = document.querySelectorAll("#historico-arquivos");
    if (inputs.length !== 1 || !visible(inputs[0]) || inputs[0].type !== "file") return null;
    const section = inputs[0].closest("section");
    if (
      section?.querySelectorAll("h2").length !== 1 ||
      section.querySelector("h2").textContent !== "1. Selecionar relatórios anteriores"
    )
      return null;
    const labels = section.querySelectorAll('label[for="historico-arquivos"]');
    if (labels.length !== 1 || labels[0].textContent !== "Arquivos históricos (seleção múltipla)")
      return null;
    const expected =
      "Formatos aceitos: " +
      value +
      ". O limite de tamanho e o tipo real são conferidos pelo backend.";
    nodes = [...section.querySelectorAll(":scope > p")].filter(
      (n) =>
        visible(n) &&
        n.textContent === expected &&
        !!(n.compareDocumentPosition(inputs[0]) & Node.DOCUMENT_POSITION_FOLLOWING),
    );
    selector = "section:has(#historico-arquivos) > p";
  }
  if (
    nodes.length !== 1 ||
    !selector ||
    [...nodes[0].attributes].some((a) => a.name !== "class") ||
    [...nodes[0].childNodes].some((n) => n.nodeType !== Node.TEXT_NODE)
  )
    return null;
  const all = [...document.querySelectorAll(selector)];
  return { selector, index: all.indexOf(nodes[0]), count: all.length };
}

export function classifyArtifactText(text, allowedWords, { snapshot = false, fieldContext } = {}) {
  if (typeof text !== "string" || text.length > 1000000 || !(allowedWords instanceof Set))
    return { reason: "INVALID_CONTENT", unknownCount: 0 };
  if (
    /\S+@\S+|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b|\bBearer\b|\beyJ[A-Za-z0-9_-]+\.|sb_secret_/i.test(
      text,
    )
  )
    return { reason: "SENSITIVE_PATTERN", unknownCount: 0 };
  const scoped = privacy78Contexts.get(fieldContext);
  if (scoped) {
    const channel = snapshot ? "snapshot" : "rendered";
    if (text !== scoped[channel].original) return { reason: "INVALID_CONTENT", unknownCount: 0 };
    text = scoped[channel].remainder;
  }
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
export function run78VisualSelection(item, scope = null) {
  scope = auditScope(scope);
  if (scope) {
    if (
      !item ||
      !scope.surfaces.includes(item.surface) ||
      !WIDTHS.includes(item.width) ||
      !THEMES.includes(item.theme)
    )
      return null;
    return { required: true };
  }
  if (
    !item ||
    !PRIVATE_SURFACES.includes(item.surface) ||
    !WIDTHS.includes(item.width) ||
    !THEMES.includes(item.theme)
  )
    return null;
  const baseline = ["V114", "V116", "V118"].includes(item.surface);
  const focal = ["V101", "V105", "V106", "V107", "V110", "V113", "V121"].includes(item.surface);
  const mobile = [
    "SYS05",
    "ADM01",
    "V102",
    "V103",
    "V104",
    "V108",
    "V114",
    "V116",
    "V118",
  ].includes(item.surface);
  return {
    required: focal || (item.width === 390 && mobile),
    ...(baseline
      ? {
          baselineRun: 42496235106,
          baselineFrontendSha: "9b18e4857b03daa6ee09ad3382184480e2014728",
          baselineZipSha256: "bc2a8b74e1ba9ff008ed67ce0f398c47ce120924cf69b5210d62f8165291d2c6",
        }
      : {}),
  };
}

export function run78VisualEvidenceValid(row, scope = null) {
  scope = auditScope(scope);
  const selection = run78VisualSelection(row, scope);
  if (!selection) return false;
  if (!selection.required) return true;
  if (
    !privateCases(scope).some(
      (c) =>
        c.surface === row.surface &&
        c.width === row.width &&
        c.theme === row.theme &&
        c.path === row.path,
    )
  )
    return false;
  const key = caseKey(row),
    hash = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
  if (
    row.screenshot !== `screenshots/${key}.png` ||
    row.dom !== `dom/${key}.json` ||
    !hash(row.sha256) ||
    !hash(row.domSha256)
  )
    return false;
  const ready = (proof, count, mode) => {
    const context = proof?.image?.context;
    if (
      !context ||
      context.surface !== row.surface ||
      context.width !== row.width ||
      context.theme !== row.theme ||
      context.mode !== mode
    )
      return false;
    if (
      isC8Scope(scope) &&
      row.surface === "V117" &&
      mode === "PRIMARY" &&
      (proof?.metrics?.modalPassed !== true || !proof.metrics.targets?.length)
    )
      return false;
    const expectedSrc =
      mode === "SIDEBAR_COLLAPSED"
        ? "/brand/ContaOS_Simbolo_Branco.svg"
        : "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg";
    if (
      !proof ||
      proof.phase !== "BEFORE_PNG" ||
      !Number.isFinite(proof.measuredAt) ||
      !Number.isFinite(proof.capturedAt) ||
      proof.measuredAt > proof.capturedAt ||
      !proof.metrics?.passed ||
      proof.metrics.viewport?.width !== row.width ||
      proof.metrics.theme !== row.theme ||
      !visualGeometryValid(proof.metrics) ||
      proof.image?.count !== count ||
      proof.image.images?.length !== count
    )
      return false;
    if (
      !["geometryPassed", "tablePassed", "datesPassed", "contrastPassed"].every(
        (k) => proof.metrics[k] === true,
      )
    )
      return false;
    return proof.image.images.every(
      (i) =>
        i.decoded === true &&
        i.complete === true &&
        [i.width, i.height, i.naturalWidth, i.naturalHeight].every(
          (n) => Number.isFinite(n) && n > 0,
        ) &&
        i.src === expectedSrc,
    );
  };
  const supplement = row.sidebarSupplement;
  return (
    ready(row.visualCapture, row.width < 768 ? 0 : 1, "PRIMARY") &&
    supplement?.passed === true &&
    supplement.screenshot ===
      `screenshots/${key}${row.width < 768 ? "_menu" : "_sidebar-recolhida"}.png` &&
    hash(supplement.sha256) &&
    ready(supplement.visualCapture, 1, row.width < 768 ? "MOBILE_MENU" : "SIDEBAR_COLLAPSED")
  );
}

export function preservedPrivateCase(item, scope = null) {
  if (auditScope(scope)) return null;
  if (
    !item ||
    !["V114", "V116", "V118"].includes(item.surface) ||
    item.width === 390 ||
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

export function completePrivateRecords(records, scope = null) {
  scope = auditScope(scope);
  if (scope) {
    if (!Array.isArray(records) || records.length > privateCases(scope).length) fail("AUDIT_CASES");
    const expected = new Map(privateCases(scope).map((item) => [caseKey(item), item.path]));
    const seen = new Set();
    for (const row of records) {
      const key = caseKey(row);
      if (!expected.has(key) || expected.get(key) !== row.path || seen.has(key))
        fail("AUDIT_CASES");
      seen.add(key);
    }
  }
  const keys = new Set(records.map(caseKey));
  for (const item of privateCases(scope))
    if (!keys.has(caseKey(item)))
      records.push(
        preservedPrivateCase(item, scope) || {
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

// Request identity is kept only in memory. Cancellation never authorizes a
// response: it can only retire one initial continuation that Chromium rejected.
const CDP_RESOURCE_TYPES = new Set([
  "Document",
  "Stylesheet",
  "Image",
  "Media",
  "Font",
  "Script",
  "TextTrack",
  "XHR",
  "Fetch",
  "Prefetch",
  "EventSource",
  "WebSocket",
  "Manifest",
  "SignedExchange",
  "Ping",
  "CSPViolationReport",
  "Preflight",
  "Other",
]);

function safeLifecycleMetadata(input) {
  if (
    !input ||
    !CDP_RESOURCE_TYPES.has(input.network) ||
    !CDP_RESOURCE_TYPES.has(input.fetch) ||
    !["GET", "HEAD", "POST", "OPTIONS"].includes(input.method) ||
    !["REQUEST", "RESPONSE"].includes(input.stage)
  )
    return null;
  const result = {
    network: input.network,
    fetch: input.fetch,
    method: input.method,
    stage: input.stage,
  };
  for (const key of [
    "networkFramePresent",
    "sameFrame",
    "loaderPresent",
    "ownFetchFrame",
    "generationSame",
    "terminal",
  ]) {
    if (typeof input[key] !== "boolean") return null;
    result[key] = input[key];
  }
  return result;
}
export function createRequestLifecycle(identity) {
  const frames = new Map(),
    requests = new Map(),
    fetches = new Map(),
    pendingNetwork = new Map();
  const pendingFetch = new Set();
  const seenNetwork = new Set(),
    seenFetch = new Set();
  // GET principais encerrados por cancelamento comprovado (ERR_ABORTED, sem bloqueio).
  // O Chromium conclui o preflight CORS desses pedidos na rede, mas não emite
  // Network.loadingFinished/Failed para o OPTIONS. Somente com essa prova, e depois
  // de a resposta do próprio preflight ter sido pausada e liberada pelo fence, o
  // registro do preflight é aposentado; caso contrário permanece pendente.
  const canceledMains = new Set();
  let closed = false,
    canceled = 0,
    retiredPreflights = 0;
  const id = (value) => typeof value === "string" && value.length > 0 && value.length <= 512;
  const key = (session, value) => session.id + "|" + value;
  function own(session, requireFrame = true) {
    if (
      closed ||
      !id(session?.id) ||
      session.targetId !== identity.targetId ||
      session.contextId !== identity.browserContextId ||
      (requireFrame && !frames.has(session.id))
    )
      fail("FENCE_REQUEST_LIFECYCLE");
  }
  function terminal(record, value) {
    if (record.terminal) fail("FENCE_REQUEST_LIFECYCLE");
    record.terminal = value;
    for (const resolve of record.waiters) resolve();
    record.waiters.clear();
    cleanup(record);
  }
  function cleanup(record) {
    if (
      !record.terminal &&
      record.preflightOf !== null &&
      record.preflightOrphaned === true &&
      record.preflightResponded === true &&
      record.active === 0
    ) {
      retiredPreflights++;
      terminal(record, { kind: "PREFLIGHT_RETIRED" });
      return;
    }
    if (!record.terminal || record.active > 0) return;
    requests.delete(record.key);
    for (const fetchKey of record.fetchKeys) fetches.delete(fetchKey);
  }
  function foundation(ticket, error) {
    const record = ticket?.record,
      frame = frames.get(ticket?.sessionId);
    return (
      !closed &&
      ticket?.stage === "REQUEST" &&
      ticket.sent &&
      !ticket.acked &&
      !ticket.consumed &&
      !ticket.finished &&
      record?.eligible === true &&
      !record.cancellationConsumed &&
      (ticket.equalTypes || record.method === "GET") &&
      !record.responseSeen &&
      frame?.id === record.frameId &&
      frame?.loaderId === record.loaderId &&
      frame?.generation === record.generation &&
      error?.code === "CDP_COMMAND" &&
      error.command === "Fetch.continueRequest" &&
      error.protocolCode === -32602 &&
      error.reason === "INVALID_INTERCEPTION"
    );
  }
  const tracker = {
    frame(session, frame) {
      own(session, false);
      if (!id(frame?.id) || (frames.has(session.id) && frames.get(session.id).id !== frame.id))
        fail("FENCE_REQUEST_LIFECYCLE");
      frames.set(session.id, { id: frame.id, loaderId: frame.loaderId || "", generation: 1 });
    },
    observe(session, method, event) {
      own(session);
      const frame = frames.get(session.id);
      if (method === "Page.frameNavigated") {
        if (
          event.frame?.id === frame.id &&
          id(event.frame.loaderId) &&
          event.frame.loaderId !== frame.loaderId
        ) {
          frame.loaderId = event.frame.loaderId;
          frame.generation++;
        }
        return;
      }
      if (!id(event?.requestId)) fail("FENCE_REQUEST_LIFECYCLE");
      const requestKey = key(session, event.requestId);
      if (method === "Network.requestWillBeSent") {
        const reserved = pendingNetwork.has(requestKey) ? 1 : 0;
        if (
          event.redirectResponse ||
          seenNetwork.has(requestKey) ||
          requests.size + pendingNetwork.size - reserved >= 1024 ||
          seenNetwork.size + pendingNetwork.size - reserved >= 65536
        ) {
          tracker.close();
          fail("FENCE_REQUEST_LIFECYCLE");
        }
        seenNetwork.add(requestKey);
        if (
          event.type === "Document" &&
          event.frameId === frame.id &&
          id(event.loaderId) &&
          event.loaderId !== frame.loaderId
        ) {
          frame.loaderId = event.loaderId;
          frame.generation++;
        }
        const record = {
          key: requestKey,
          sessionId: session.id,
          networkId: event.requestId,
          frameId: event.frameId,
          loaderId: event.loaderId,
          generation: frame.generation,
          type: event.type,
          url: event.request?.url,
          method: event.request?.method,
          startedAt: event.timestamp,
          eligible:
            event.frameId === frame.id &&
            id(event.loaderId) &&
            event.loaderId === frame.loaderId &&
            Number.isFinite(event.timestamp) &&
            event.timestamp >= 0,
          responseSeen: false,
          terminal: null,
          active: 0,
          fetchKeys: new Set(),
          waiters: new Set(),
          preflightOf:
            event.type === "Other" &&
            event.request?.method === "OPTIONS" &&
            event.initiator?.type === "preflight" &&
            id(event.initiator.requestId) &&
            event.initiator.requestId !== event.requestId
              ? key(session, event.initiator.requestId)
              : null,
          preflightOrphaned: false,
          preflightResponded: false,
        };
        if (record.preflightOf !== null && canceledMains.has(record.preflightOf))
          record.preflightOrphaned = true;
        requests.set(requestKey, record);
        pendingNetwork.get(requestKey)?.done(true);
        return;
      }
      const record = requests.get(requestKey);
      if (!record) return; // An unrelated terminal cannot authorize any pause.
      if (method === "Network.responseReceived") {
        if (record.terminal) fail("FENCE_REQUEST_LIFECYCLE");
        record.responseSeen = true;
      } else if (method === "Network.loadingFailed") {
        terminal(record, {
          kind: "FAILED",
          canceled: event.canceled === true,
          aborted: event.errorText === "net::ERR_ABORTED",
          type: event.type,
          timestamp: event.timestamp,
          blocked: event.blockedReason !== undefined || event.corsErrorStatus !== undefined,
        });
        const proof = record.terminal;
        if (
          record.preflightOf === null &&
          record.method === "GET" &&
          proof.canceled &&
          proof.aborted &&
          !proof.blocked &&
          proof.type === record.type
        ) {
          if (canceledMains.size >= 65536) {
            tracker.close();
            fail("FENCE_REQUEST_LIFECYCLE");
          }
          canceledMains.add(requestKey);
          for (const other of [...requests.values()])
            if (other.preflightOf === requestKey && !other.terminal) {
              other.preflightOrphaned = true;
              cleanup(other);
            }
        }
      } else if (method === "Network.loadingFinished") terminal(record, { kind: "FINISHED" });
    },
    async pauseWhenObserved(session, event, receivedAt = performance.now()) {
      own(session);
      if (
        !id(event.networkId) ||
        requests.has(key(session, event.networkId)) ||
        seenNetwork.has(key(session, event.networkId))
      )
        return tracker.pause(session, event);
      const requestKey = key(session, event.networkId),
        fetchKey = key(session, event.requestId),
        frame = frames.get(session.id);
      const reject = (code) => {
        tracker.close();
        fail(code);
      };
      if (
        !id(event.requestId) ||
        event.frameId !== frame.id ||
        !id(frame.loaderId) ||
        event.responseStatusCode !== undefined ||
        event.responseErrorReason !== undefined ||
        !Number.isFinite(receivedAt) ||
        receivedAt > performance.now() ||
        performance.now() - receivedAt >= 250 ||
        pendingNetwork.has(requestKey) ||
        pendingFetch.has(fetchKey) ||
        seenFetch.has(fetchKey) ||
        pendingNetwork.size >= 1024 ||
        requests.size + pendingNetwork.size >= 1024 ||
        seenNetwork.size + pendingNetwork.size >= 65536 ||
        seenFetch.size + pendingFetch.size >= 65536
      )
        reject("FENCE_REQUEST_LIFECYCLE");
      const initial = { id: frame.id, loaderId: frame.loaderId, generation: frame.generation };
      const arrived = await new Promise((resolve) => {
        let timer,
          settled = false;
        const done = (value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          pendingNetwork.delete(requestKey);
          pendingFetch.delete(fetchKey);
          resolve(value);
        };
        pendingFetch.add(fetchKey);
        pendingNetwork.set(requestKey, { done });
        timer = setTimeout(() => done(false), Math.max(0, 250 - (performance.now() - receivedAt)));
      });
      if (!arrived || closed || performance.now() - receivedAt >= 250)
        reject("FENCE_LIFECYCLE_NO_NETWORK");
      const current = frames.get(session.id);
      if (
        current?.id !== initial.id ||
        current?.loaderId !== initial.loaderId ||
        current?.generation !== initial.generation
      )
        reject("FENCE_LIFECYCLE_FRAME");
      try {
        return tracker.pause(session, event);
      } catch (error) {
        tracker.close();
        throw error;
      }
    },
    pause(session, event) {
      own(session);
      if (
        !id(event.requestId) ||
        pendingFetch.has(key(session, event.requestId)) ||
        (id(event.networkId) && pendingNetwork.has(key(session, event.networkId)))
      ) {
        tracker.close();
        fail("FENCE_REQUEST_LIFECYCLE");
      }
      // networkId is optional in CDP. Such a pause still uses the ordinary
      // policy/body guard, but is never eligible for cancellation retirement.
      if (!id(event.networkId)) return null;
      const record = requests.get(key(session, event.networkId));
      const frame = frames.get(session.id);
      const reject = (code) => {
        const error = Object.assign(new Error(code), {
          code,
          lifecycleMetadata: safeLifecycleMetadata({
            network: record?.type,
            fetch: event.resourceType,
            method: event.request?.method,
            stage:
              event.responseStatusCode !== undefined || event.responseErrorReason !== undefined
                ? "RESPONSE"
                : "REQUEST",
            networkFramePresent: !!record?.frameId,
            sameFrame: !!record?.frameId && record.frameId === event.frameId,
            loaderPresent: !!record?.loaderId,
            ownFetchFrame: event.frameId === frame.id,
            generationSame: record?.generation === frame.generation,
            terminal: !!record?.terminal,
          }),
        });
        tracker.close();
        throw error;
      };
      if (!record) reject("FENCE_LIFECYCLE_NO_NETWORK");
      if (record.terminal) reject("FENCE_LIFECYCLE_TERMINAL");
      const absent = (value) => value === undefined || value === "";
      const ordinaryPreflight =
        record.type === "Other" &&
        event.resourceType === "XHR" &&
        record.method === "OPTIONS" &&
        event.request?.method === "OPTIONS" &&
        absent(record.frameId) &&
        absent(record.loaderId) &&
        event.frameId === frame.id &&
        id(frame.loaderId) &&
        record.generation === frame.generation &&
        Number.isFinite(record.startedAt) &&
        record.startedAt >= 0;
      if (
        event.frameId !== frame.id ||
        (!ordinaryPreflight && record.frameId !== event.frameId) ||
        (record.fetchFrameId !== undefined && record.fetchFrameId !== event.frameId)
      )
        reject("FENCE_LIFECYCLE_FRAME");
      const equalTypes = record.type === event.resourceType;
      if (
        !CDP_RESOURCE_TYPES.has(record.type) ||
        !CDP_RESOURCE_TYPES.has(event.resourceType) ||
        (!equalTypes &&
          !ordinaryPreflight &&
          !(record.type === "Fetch" && event.resourceType === "XHR")) ||
        (record.fetchResourceType !== undefined && record.fetchResourceType !== event.resourceType)
      )
        reject("FENCE_LIFECYCLE_TYPE");
      record.fetchResourceType = event.resourceType;
      record.fetchFrameId = event.frameId;
      if (ordinaryPreflight) record.eligible = false;
      if (
        !id(event.requestId) ||
        record.url !== event.request?.url ||
        record.method !== event.request?.method
      )
        reject("FENCE_REQUEST_LIFECYCLE");
      const fetchKey = key(session, event.requestId),
        previous = fetches.get(fetchKey);
      const response =
        event.responseStatusCode !== undefined || event.responseErrorReason !== undefined;
      if (!response) {
        if (record.initialFetchId !== undefined) reject("FENCE_REQUEST_LIFECYCLE");
        record.initialFetchId = event.requestId;
      }
      if (
        previous
          ? !response ||
            previous.record !== record ||
            previous.stage !== "REQUEST" ||
            previous.responsePauseSeen
          : seenFetch.has(fetchKey) || seenFetch.size + pendingFetch.size >= 65536
      )
        reject("FENCE_REQUEST_LIFECYCLE");
      if (previous) previous.responsePauseSeen = true;
      else seenFetch.add(fetchKey);
      if (response) record.responseSeen = true;
      const ticket = {
        record,
        equalTypes,
        sessionId: session.id,
        stage: response ? "RESPONSE" : "REQUEST",
        sent: false,
        acked: false,
        consumed: false,
        finished: false,
        attempted: false,
        responsePauseSeen: false,
      };
      fetches.set(fetchKey, ticket);
      record.fetchKeys.add(fetchKey);
      record.active++;
      return ticket;
    },
    sent(ticket) {
      if (!ticket) return;
      if (closed || ticket.sent || ticket.consumed || ticket.finished || ticket.stage !== "REQUEST")
        fail("FENCE_REQUEST_LIFECYCLE");
      ticket.sent = true;
    },
    acknowledge(ticket) {
      if (!ticket) return;
      if (closed || ticket.consumed || ticket.finished || !ticket.sent)
        fail("FENCE_REQUEST_LIFECYCLE");
      ticket.acked = true;
    },
    async handleCanceled(ticket, error) {
      if (!foundation(ticket, error) || ticket.attempted) return false;
      ticket.attempted = true;
      const record = ticket.record;
      if (!record.terminal)
        await new Promise((resolve) => {
          let timer;
          const done = () => {
            clearTimeout(timer);
            record.waiters.delete(done);
            resolve();
          };
          record.waiters.add(done);
          timer = setTimeout(done, 250);
        });
      const proof = record.terminal;
      if (
        !foundation(ticket, error) ||
        proof?.kind !== "FAILED" ||
        !proof.canceled ||
        !proof.aborted ||
        proof.blocked ||
        proof.type !== record.type ||
        !Number.isFinite(proof.timestamp) ||
        proof.timestamp < record.startedAt
      )
        return false;
      ticket.consumed = true;
      record.cancellationConsumed = true;
      canceled++;
      return true;
    },
    responded(ticket) {
      if (!ticket) return;
      if (closed || ticket.finished || ticket.stage !== "RESPONSE" || ticket.responded)
        fail("FENCE_REQUEST_LIFECYCLE");
      ticket.responded = true;
      if (ticket.record.preflightOf !== null) ticket.record.preflightResponded = true;
    },
    finish(ticket) {
      if (!ticket || ticket.finished) return;
      ticket.finished = true;
      ticket.record.active--;
      cleanup(ticket.record);
    },
    snapshot() {
      return {
        active: requests.size,
        pendingNetwork: pendingNetwork.size,
        networkTombstones: seenNetwork.size,
        fetchTombstones: seenFetch.size,
        canceled,
        retiredPreflights,
      };
    },
    close() {
      closed = true;
      for (const pending of [...pendingNetwork.values()]) pending.done(false);
      pendingNetwork.clear();
      pendingFetch.clear();
      for (const record of requests.values()) for (const resolve of record.waiters) resolve();
      frames.clear();
      requests.clear();
      fetches.clear();
      seenNetwork.clear();
      seenFetch.clear();
      canceledMains.clear();
    },
  };
  return tracker;
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

const NATIVE_BINARY_SHA256 = "27e55cc30e487493b89b663085d6deeb0707be201a568657c922fac9076c317c";
const NATIVE_BINARY_SIZE = 183557344;
const POPUP_SWITCH = "--block-new-web-contents";

export function nativeBrowserArgs(debugPort, useProxy = false) {
  if (
    !Number.isInteger(debugPort) ||
    debugPort < 1 ||
    debugPort > 65535 ||
    typeof useProxy !== "boolean"
  )
    fail("BROWSER_POLICY");
  return [
    `--remote-debugging-port=${debugPort}`,
    POPUP_SWITCH,
    ...(useProxy ? ["--proxy-bypass-list=<-loopback>"] : []),
  ];
}

// Exact Linux x64 switches from Playwright 1.58.2 and the pinned Shell startup.
// Preserve SDK duplicates and reject every unrecognized switch or positional argument.
const NATIVE_SDK_ARGUMENTS = Object.freeze([
  "--disable-field-trial-config",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-back-forward-cache",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-extensions-with-background-pages",
  "--disable-component-update",
  "--no-default-browser-check",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints",
  "--enable-features=CDPScreenshotNewSurface",
  "--allow-pre-commit-input",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-popup-blocking",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--force-color-profile=srgb",
  "--metrics-recording-only",
  "--no-first-run",
  "--password-store=basic",
  "--use-mock-keychain",
  "--no-service-autorun",
  "--export-tagged-pdf",
  "--disable-search-engine-choice-screen",
  "--unsafely-disable-devtools-self-xss-warnings",
  "--edge-skip-compat-layer-relaunch",
  "--enable-automation",
  "--disable-infobars",
  "--disable-search-engine-choice-screen",
  "--disable-sync",
  "--enable-unsafe-swiftshader",
  "--headless",
  "--hide-scrollbars",
  "--mute-audio",
  "--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
  "--remote-debugging-pipe",
  "--no-startup-window",
  "--use-gl=angle",
  "--use-angle=swiftshader-webgl",
  "--ozone-platform=headless",
  "--allow-pre-commit-input",
]);

export function verifyNativeBrowserPolicy(args, version, expected) {
  if (
    !Array.isArray(args) ||
    args.length < 3 ||
    args.length > 256 ||
    args.some(
      (a) =>
        typeof a !== "string" || a.length === 0 || a.length > 8192 || /[\x00-\x1f\x7f]/.test(a),
    ) ||
    args.reduce((n, a) => n + a.length, 0) > 65536 ||
    version?.product !== "HeadlessChrome/145.0.7632.6" ||
    !expected ||
    typeof expected.executablePath !== "string" ||
    !isAbsolute(expected.executablePath) ||
    args[0] !== expected.executablePath ||
    !Number.isInteger(expected.debugPort) ||
    expected.debugPort < 1 ||
    expected.debugPort > 65535
  )
    fail("BROWSER_POLICY");
  const proxy = expected.proxy;
  if (
    proxy !== undefined &&
    (typeof proxy !== "string" ||
      !/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(proxy) ||
      Number(new URL(proxy).port) > 65535)
  )
    fail("BROWSER_POLICY");
  const profiles = args.filter((a) => a.split("=")[0] === "--user-data-dir");
  if (profiles.length !== 1 || !profiles[0].startsWith("--user-data-dir=")) fail("BROWSER_POLICY");
  const profile = profiles[0].slice("--user-data-dir=".length);
  if (
    !isAbsolute(profile) ||
    dirname(profile) !== tmpdir() ||
    !/^playwright_chromiumdev_profile-[a-zA-Z0-9]+$/.test(basename(profile))
  )
    fail("BROWSER_POLICY");
  const exact = [
    expected.executablePath,
    ...NATIVE_SDK_ARGUMENTS,
    ...nativeBrowserArgs(expected.debugPort, proxy !== undefined),
    profiles[0],
    ...(proxy === undefined ? [] : ["--proxy-server=" + proxy, "--proxy-bypass-list=<-loopback>"]),
  ];
  const actual = [...args].sort();
  exact.sort();
  if (actual.length !== exact.length || actual.some((value, i) => value !== exact[i]))
    fail("BROWSER_POLICY");
  return true;
}

async function nativeBinaryIdentity(path) {
  if (
    !isAbsolute(path) ||
    !/\/chromium_headless_shell-1208\/chrome-headless-shell-linux64\/chrome-headless-shell$/.test(
      path,
    )
  )
    fail("BROWSER_BINARY");
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== NATIVE_BINARY_SIZE)
    fail("BROWSER_BINARY");
  const resolved = await realpath(path);
  if (resolved !== path) fail("BROWSER_BINARY");
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  if (hash.digest("hex") !== NATIVE_BINARY_SHA256) fail("BROWSER_BINARY");
  return resolved;
}

// Return no browser until the exact pinned binary and its actual launch policy agree.
// No custom executable, caller-supplied args or policy bypass is accepted.
export async function launchNativeBrowser({ debugPort, proxy } = {}) {
  let browser;
  try {
    const { chromium } = await import("playwright");
    const sdkVersion = require("playwright/package.json").version;
    const coreRoot = dirname(require.resolve("playwright-core/package.json"));
    const registry = JSON.parse(await readFile(join(coreRoot, "browsers.json"), "utf8"));
    const shells = registry.browsers.filter((entry) => entry.name === "chromium-headless-shell");
    if (
      sdkVersion !== "1.58.2" ||
      shells.length !== 1 ||
      shells[0].revision !== "1208" ||
      shells[0].browserVersion !== "145.0.7632.6" ||
      process.platform !== "linux" ||
      process.arch !== "x64" ||
      require("playwright-core/package.json").version !== "1.58.2" ||
      typeof chromium?.executablePath !== "function"
    )
      fail("BROWSER_BINARY");
    const regular = chromium.executablePath();
    if (!isAbsolute(regular) || !/\/chromium-1208\/chrome-linux64\/chrome$/.test(regular))
      fail("BROWSER_BINARY");
    const executablePath = await nativeBinaryIdentity(
      join(
        dirname(dirname(dirname(regular))),
        "chromium_headless_shell-1208",
        "chrome-headless-shell-linux64",
        "chrome-headless-shell",
      ),
    );
    if (
      proxy !== undefined &&
      (typeof proxy !== "string" ||
        !/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(proxy) ||
        Number(new URL(proxy).port) > 65535)
    )
      fail("BROWSER_POLICY");
    const args = nativeBrowserArgs(debugPort, proxy !== undefined);
    browser = await chromium.launch({
      executablePath,
      chromiumSandbox: true,
      env: browserEnvironment(process.env),
      args,
      ...(proxy ? { proxy: { server: proxy } } : {}),
    });
    const session = await browser.newBrowserCDPSession();
    try {
      const command = await session.send("Browser.getBrowserCommandLine");
      const version = await session.send("Browser.getVersion");
      verifyNativeBrowserPolicy(command.arguments, version, { executablePath, debugPort, proxy });
      if (
        (await nativeBinaryIdentity(command.arguments[0])) !== executablePath ||
        command.arguments.filter((a) => a.startsWith("--remote-debugging-port=")).length !== 1 ||
        !command.arguments.includes(`--remote-debugging-port=${debugPort}`)
      )
        fail("BROWSER_POLICY");
    } finally {
      await session.detach();
    }
    return browser;
  } catch {
    await browser?.close().catch(() => {});
    fail("BROWSER_POLICY");
  }
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
  const lifecycle = createRequestLifecycle(identity);
  const sessions = new Map(),
    active = new Set();
  const state = {
    failed: false,
    failureCode: null,
    lifecycleMetadata: null,
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
    state.lifecycleMetadata = safeLifecycleMetadata(error?.lifecycleMetadata);
    lifecycle.close();
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
    const receivedAt = performance.now();
    const requestId = event.requestId;
    let ticket;
    try {
      if (
        state.failed ||
        closed ||
        session.contextId !== identity.browserContextId ||
        session.targetId !== identity.targetId ||
        policy({
          url: event.request.url,
          method: event.request.method,
          resourceType: event.resourceType,
          postData: event.request.postData,
          stage:
            event.responseStatusCode !== undefined || event.responseErrorReason !== undefined
              ? "RESPONSE"
              : "REQUEST",
          interceptionId: event.requestId,
          sessionId: session.id,
        }) !== true
      ) {
        state.blockedRequests++;
        fail("FENCE_REQUEST");
      }
      ticket = await lifecycle.pauseWhenObserved(session, event, receivedAt);
      const response =
        event.responseStatusCode !== undefined || event.responseErrorReason !== undefined;
      if (!response) {
        lifecycle.sent(ticket);
        await send(session, "Fetch.continueRequest", { requestId, interceptResponse: true });
        lifecycle.acknowledge(ticket);
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
      lifecycle.responded(ticket);
    } catch (error) {
      if (!state.failed && !closed && (await lifecycle.handleCanceled(ticket, error))) return;
      await send(session, "Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(
        () => {},
      );
      invalidate(error);
    } finally {
      lifecycle.finish(ticket);
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
        const frameTree = await send(session, "Page.getFrameTree");
        lifecycle.frame(session, frameTree.frameTree?.frame);
        session.lifecycleReady = true;
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
      if (closed || state.failed) return;
      if (
        session.lifecycleReady &&
        [
          "Network.requestWillBeSent",
          "Network.responseReceived",
          "Network.loadingFailed",
          "Network.loadingFinished",
          "Page.frameNavigated",
        ].includes(event.method)
      ) {
        try {
          lifecycle.observe(session, event.method, event.params);
        } catch (error) {
          invalidate(error);
        }
      } else if (event.method === "Fetch.requestPaused") track(paused(session, event.params));
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
    snapshot: () => ({
      ...state,
      canceledInitialRequests: lifecycle.snapshot().canceled,
      activeNetworkRequests: lifecycle.snapshot().active,
      pendingNetworkAssociations: lifecycle.snapshot().pendingNetwork,
    }),
    assertSafe() {
      if (state.failed || closed || state.verifiedDocuments === 0 || state.verifiedScripts === 0)
        fail("FENCE_NOT_PROVEN");
    },
    async drain() {
      const deadline = performance.now() + 10000;
      for (;;) {
        if (state.failed || closed) fail(state.failureCode || "FENCE_CDP_CLOSED");
        const remaining = deadline - performance.now();
        if (remaining <= 0) {
          invalidate({ code: "FENCE_DRAIN_TIMEOUT" });
          fail("FENCE_DRAIN_TIMEOUT");
        }
        const activity = lifecycle.snapshot();
        if (active.size === 0 && activity.active === 0 && activity.pendingNetwork === 0) {
          if (state.failed || closed) fail(state.failureCode || "FENCE_CDP_CLOSED");
          if (performance.now() >= deadline) {
            invalidate({ code: "FENCE_DRAIN_TIMEOUT" });
            fail("FENCE_DRAIN_TIMEOUT");
          }
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, Math.min(10, remaining)));
      }
    },
    close() {
      closed = true;
      lifecycle.close();
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
export const C8_AUDIT_SCOPE = Object.freeze({
  id: "C8",
  nonce: "trilha-c-audit-20261111-c8-r5",
  surfaces: Object.freeze(["V111", "V114", "V115", "V116", "V117", "V118", "V119", "V120"]),
});
// The user preserved the R5 build, menu, logout, CI and integration, and
// authorized execution of only the sixteen failed cases. This is an additive
// scope; the historical C8/64 matrix and its existing evidence remain intact.
export const C8_R5_PRESERVED = Object.freeze({
  workflowRun: "42986341145",
  artifactId: "13839474771",
  harnessSha: "d4695699422e74e0f25cd990358225caed6c4819",
  frontendSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
  deploymentId: "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
  zipSha256: "65b050fd49a840cd202ba06167e19080235d90b0b17e3a7ea286735ce6e778b8",
  passedRecordsSha256: "dd5e2eedde3a6888e3e677b28ca5d6644e4b4a83b780dc001ca3fb6c0000af95",
  preservedCases: 48,
  logoutVerified: true,
});
export const C8_REMAINING_SCOPE = Object.freeze({
  id: "C8_REMAINING_16",
  nonce: "trilha-c-audit-20261111-c8-r6",
  surfaces: Object.freeze(["V111", "V115", "V117"]),
});
export const C8_R6_PRESERVED = Object.freeze({
  workflowRun: "43000318054",
  artifactId: "13846890283",
  harnessSha: "9807fe82aafb28951687ae41649ab34a6530e969",
  frontendSha: C8_R5_PRESERVED.frontendSha,
  deploymentId: C8_R5_PRESERVED.deploymentId,
  zipSha256: "4ae91e19f11a813d22c0022e50a35148271d536fd83f68627147abce3da19304",
  passedRecordsSha256: "cfc22412fb4e92bd6306038f59231cefc5f40c18aa9f99f34e7982065ec48713",
  preservedCases: 8,
  logoutVerified: true,
});
export const C8_V117_SCOPE = Object.freeze({
  id: "C8_V117_8",
  nonce: "trilha-c-audit-20261111-c8-r8",
  surfaces: Object.freeze(["V117"]),
});
export function isC8Scope(scope) {
  return scope === C8_AUDIT_SCOPE || scope === C8_REMAINING_SCOPE || scope === C8_V117_SCOPE;
}
export const NAVIGATION_DEPLOYMENT = Object.freeze({
  frontendSha: "3638cdd381cb911f6bdc115169891a25479b7a25",
  deploymentId: "dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh",
});
export const NAVIGATION_SCOPE = Object.freeze({
  id: "INTEGRACAO_V1_FASE2_NAV",
  nonce: "integracao-v1-fase2-nav-20261113-r8",
  surfaces: Object.freeze([...PRIVATE_SURFACES]),
});
export function navigationCases() {
  const current = new Map(privateCases().map((r) => [r.surface, r.path]));
  for (const r of privateCases(C8_AUDIT_SCOPE)) current.set(r.surface, r.path);
  return PRIVATE_SURFACES.flatMap((surface) =>
    [
      { width: 1440, theme: "light" },
      { width: 390, theme: "dark" },
    ].map((view) => ({
      surface,
      ...view,
      path: current.get(surface),
    })),
  );
}
export function navigationDestination(value) {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const url = new URL(value, HML_ORIGIN);
    if (url.origin !== HML_ORIGIN || url.username || url.password || url.search || url.hash)
      return null;
    return navigationKnownRoutes().get(url.pathname) ?? null;
  } catch {
    return null;
  }
}
function navigationKnownRoutes() {
  const routes = new Map(
    navigationCases().map((r) => [r.path, r.surface === "V117" ? "V116" : r.surface]),
  );
  for (const id of [
    SYNTHETIC_FIXTURE.competence,
    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
    "79bdc139-ed10-4c91-905e-b32b9a824d27",
  ])
    for (const [suffix, surface] of [
      ["", "V114"],
      ["/documentos", "V115"],
      ["/analise", "V116"],
      ["/parecer", "V118"],
      ["/apresentar", "V119"],
    ])
      routes.set("/competencias/" + id + suffix, surface);
  return routes;
}
const NAVIGATION_EXCLUSIONS = Object.freeze({
  V101: "OTHER_CONTRACTOR_ROW",
  V104: "OTHER_CONTRACT_ROW",
  V110: "OTHER_DOCUMENT_ROW",
  V112: "OTHER_COMPETENCE_ROW",
});
export function navigationControlOperation(surface) {
  if (!PRIVATE_SURFACES.includes(surface)) fail("NAVIGATION_CASE");
  return (
    {
      SYS04: "ORGANIZATION_SELECT",
      ADM01: "READ_SEARCH",
      V101: "READ_SEARCH",
      V102: "EMPTY_FORM",
      V103: "INVALID_EDIT_FORM",
      V105: "EMPTY_FORM",
      V113: "EMPTY_FORM",
      V117: "REQUIREMENT_DRAWER",
      V119: "PRESENTATION_CONFIRM_CANCEL",
      V120: "PROTOCOL_REFRESH",
      V121: "HISTORY_TABS",
      V122: "HISTORY_REFRESH",
    }[surface] || "ROUTE_MENU_LINKS"
  );
}
export function navigationLinkDecision(href, source) {
  const destination = navigationDestination(href);
  if (destination) return { kind: "TARGET", destination };
  if (typeof href !== "string" || href.length > 512) return { kind: "BROKEN" };
  let url;
  try {
    url = new URL(href, HML_ORIGIN);
  } catch {
    return { kind: "BROKEN" };
  }
  if (url.origin !== HML_ORIGIN || url.username || url.password || url.search || url.hash)
    return { kind: "BROKEN" };
  const uuid = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
  const patterns = {
    V101: new RegExp("^/contratantes/" + uuid + "/editar$"),
    V104: new RegExp("^/contratos/" + uuid + "$"),
    V110: new RegExp("^/contratos/" + SYNTHETIC_FIXTURE.contract + "/documentos/" + uuid + "$"),
    V112: new RegExp("^/competencias/" + uuid + "$"),
  };
  return { kind: patterns[source]?.test(url.pathname) ? NAVIGATION_EXCLUSIONS[source] : "BROKEN" };
}
export function navigationUnavailableEvidence(path, value) {
  const contexts = [
    { id: SYNTHETIC_FIXTURE.competence, month: "2026-11-01", state: "rascunho" },
    {
      id: "79bdc139-ed10-4c91-905e-b32b9a824d27",
      month: "2026-09-01",
      state: "aguardando_contratante",
    },
  ];
  const expected = contexts.find((c) => path === "/competencias/" + c.id + "/apresentar");
  if (!expected || !value || typeof value !== "object" || isProxy(value)) return false;
  const b = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings;
  return (
    value.competencia?.id === expected.id &&
    value.competencia?.id_organizacao === b.organization &&
    value.competencia?.id_contrato === b.contract &&
    value.competencia?.competencia_referencia === expected.month &&
    value.competencia?.situacao === expected.state &&
    value.allowed_actions?.apresentar === false
  );
}
function navigationPlain(value, keys) {
  if (!value || typeof value !== "object" || isProxy(value) || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  const actual = Reflect.ownKeys(value);
  if (actual.length !== keys.length || actual.some((k) => !keys.includes(k))) return false;
  const ds = Object.getOwnPropertyDescriptors(value);
  return keys.every((key) => ds[key]?.enumerable === true && Object.hasOwn(ds[key], "value"));
}
const NAVIGATION_ROW_KEYS = Object.freeze([
  "surface",
  "width",
  "theme",
  "routeExact",
  "stateVerified",
  "organizationVerified",
  "enteredFromMenu",
  "reloadVerified",
  "backVerified",
  "shellVerified",
  "menuVerified",
  "drawerVerified",
  "linksFound",
  "linksTested",
  "linksOutOfFixture",
  "excludedLinkKinds",
  "conditionalLinksTested",
  "controlsVerified",
  "controlOperation",
  "destinations",
  "pageErrors",
  "httpErrors",
  "blockedRequests",
  "status",
  "stage",
  "failureCode",
  "operation",
  "target",
  "httpStatusErrors",
  "transportErrors",
]);
function navigationArray(value, max, predicate) {
  if (
    !Array.isArray(value) ||
    isProxy(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length > max
  )
    return false;
  const ds = Object.getOwnPropertyDescriptors(value),
    keys = Reflect.ownKeys(value);
  if (
    keys.length !== value.length + 1 ||
    keys.some((k) => k !== "length" && !/^(?:0|[1-9][0-9]*)$/.test(String(k)))
  )
    return false;
  for (let i = 0; i < value.length; i++)
    if (
      !Object.hasOwn(ds[i] || {}, "value") ||
      ds[i].enumerable !== true ||
      !predicate(ds[i].value)
    )
      return false;
  return true;
}
function navigationRowValid(row) {
  if (!navigationPlain(row, NAVIGATION_ROW_KEYS)) return false;
  const item = navigationCases().find(
    (r) => r.surface === row.surface && r.width === row.width && r.theme === row.theme,
  );
  const truth = [
    "routeExact",
    "stateVerified",
    "organizationVerified",
    "enteredFromMenu",
    "reloadVerified",
    "backVerified",
    "shellVerified",
    "menuVerified",
    "controlsVerified",
  ];
  return (
    !!item &&
    truth.every((k) => row[k] === true) &&
    row.status === "PASS" &&
    row.stage === "FINISH" &&
    row.failureCode === null &&
    row.operation === "FINISH" &&
    row.target === row.surface &&
    row.httpStatusErrors === 0 &&
    row.transportErrors === 0 &&
    row.controlOperation === navigationControlOperation(row.surface) &&
    row.drawerVerified === (row.surface === "V117" ? true : null) &&
    navigationArray(
      row.destinations,
      26,
      (d) => PRIVATE_SURFACES.includes(d) && d !== row.surface,
    ) &&
    new Set(row.destinations).size === row.destinations.length &&
    row.destinations.length === row.linksTested &&
    ["linksFound", "linksTested", "linksOutOfFixture"].every(
      (k) => Number.isInteger(row[k]) && row[k] >= 0 && row[k] <= 500,
    ) &&
    row.linksFound === row.linksTested &&
    navigationArray(
      row.excludedLinkKinds,
      500,
      (kind) => typeof kind === "string" && kind === NAVIGATION_EXCLUSIONS[row.surface],
    ) &&
    row.linksOutOfFixture === row.excludedLinkKinds.length &&
    Number.isInteger(row.conditionalLinksTested) &&
    row.conditionalLinksTested >= 0 &&
    row.conditionalLinksTested <= 1 &&
    (row.conditionalLinksTested === 0 || row.destinations.includes("V119")) &&
    (row.surface === "SYS04" || row.linksFound >= 4) &&
    row.pageErrors === 0 &&
    row.httpErrors === 0 &&
    row.blockedRequests === 0
  );
}
export function summarizeNavigation(records) {
  const expected = navigationCases();
  const safe = navigationArray(records, expected.length, () => true);
  if (!safe)
    return { expected: expected.length, observed: 0, passed: 0, failed: 1, matrixComplete: false };
  const ds = Object.getOwnPropertyDescriptors(records);
  for (let i = 0; i < records.length; i++)
    if (!Object.hasOwn(ds[i] || {}, "value"))
      return {
        expected: expected.length,
        observed: 0,
        passed: 0,
        failed: 1,
        matrixComplete: false,
      };
  const keys = new Set();
  let passed = 0;
  for (const row of records) {
    if (!navigationRowValid(row)) continue;
    const key = `${row.surface}/${row.width}/${row.theme}`;
    if (!keys.has(key)) {
      passed++;
      keys.add(key);
    }
  }
  return {
    expected: expected.length,
    observed: records.length,
    passed,
    failed: records.length - passed,
    matrixComplete: records.length === expected.length && passed === expected.length,
  };
}

const NAVIGATION_NATIVE_CODES = new Set([
  "CDP_CLOSED",
  "CDP_COMMAND",
  "CDP_CONNECT",
  "CDP_ENDPOINT",
  "CDP_EVENT",
  "CDP_FRAME",
  "CDP_IDENTITY",
  "CDP_METADATA",
  "CDP_TIMEOUT",
  "FENCE_ASYNC",
  "FENCE_BODY_LIMIT",
  "FENCE_CDP_CLOSED",
  "FENCE_CONFIGURATION",
  "FENCE_CONTEXT_FOREIGN",
  "FENCE_CONTEXT_UNKNOWN",
  "FENCE_DOCUMENT_BODY",
  "FENCE_DRAIN_TIMEOUT",
  "FENCE_HEADERS",
  "FENCE_INITIALIZATION",
  "FENCE_LIFECYCLE_FRAME",
  "FENCE_LIFECYCLE_NO_NETWORK",
  "FENCE_LIFECYCLE_TERMINAL",
  "FENCE_LIFECYCLE_TYPE",
  "FENCE_NOT_PROVEN",
  "FENCE_POPUP",
  "FENCE_READY",
  "FENCE_REDIRECT",
  "FENCE_REQUEST",
  "FENCE_REQUEST_LIFECYCLE",
  "FENCE_SOURCE",
  "FENCE_TARGET_DETACHED",
  "FENCE_TARGET_FAILED",
  "FENCE_TARGET_TIMEOUT",
  "FENCE_TRANSPORT",
  "FENCE_WORKER_PAUSED",
  "FENCE_WORKER_RUNNING",
]);
function navigationOwnValue(value, key) {
  if (!value || typeof value !== "object" || isProxy(value)) return undefined;
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}
export function navigationFenceDiagnostic(snapshot) {
  if (navigationOwnValue(snapshot, "failed") === false) return null;
  const code = navigationOwnValue(snapshot, "failureCode"),
    command = navigationOwnValue(snapshot, "failureCommand"),
    protocolCode = navigationOwnValue(snapshot, "failureProtocolCode"),
    reason = navigationOwnValue(snapshot, "failureReason"),
    metadata = navigationOwnValue(snapshot, "lifecycleMetadata");
  const lifecycleKeys = [
    "network",
    "fetch",
    "method",
    "stage",
    "networkFramePresent",
    "sameFrame",
    "loaderPresent",
    "ownFetchFrame",
    "generationSame",
    "terminal",
  ];
  return {
    failed: true,
    code: NAVIGATION_NATIVE_CODES.has(code)
      ? code
      : snapshot
        ? "FENCE_UNKNOWN"
        : "FENCE_NOT_PROVEN",
    command: FENCE_COMMANDS.has(command) ? command : null,
    protocolCode: [-32000, -32600, -32601, -32602, -32700].includes(protocolCode)
      ? protocolCode
      : null,
    reason: ["NO_RESOURCE", "INVALID_INTERCEPTION", "BODY_STAGE", "OTHER"].includes(reason)
      ? reason
      : null,
    lifecycle: navigationPlain(metadata, lifecycleKeys) ? safeLifecycleMetadata(metadata) : null,
  };
}
export function navigationLogoutFailure(error, stage) {
  const code = navigationOwnValue(error, "code"),
    name = navigationOwnValue(error, "name");
  return {
    stage: [
      "DRAIN",
      "MENU_CLOSE",
      "CONTROL",
      "CLICK",
      "REDIRECT",
      "POST_DRAIN",
      "NOT_LOGGED_IN",
    ].includes(stage)
      ? stage
      : "UNKNOWN",
    code: NAVIGATION_NATIVE_CODES.has(code)
      ? code
      : code === "NAVIGATION_LOGOUT_CONTROL"
        ? code
        : name === "TimeoutError"
          ? "NAVIGATION_TIMEOUT"
          : "UNCLASSIFIED",
  };
}

const NAVIGATION_NATIVE_CASES = Object.freeze(
  ["PERMISSIONS", "ADMINISTRATION", "SESSION", "TRANSPORT"].flatMap((kind) =>
    ["1440_LIGHT", "390_DARK"].map((view) => kind + "_" + view),
  ),
);
export function navigationNativeProofValid(value, identity) {
  if (
    !navigationPlain(value, [
      "schema",
      "harnessSha",
      "moduleHash",
      "testHash",
      "mode",
      "cases",
      "views",
      "passed",
    ])
  )
    return false;
  return (
    value.schema === "contaos.navigation.native.v1" &&
    value.harnessSha === identity?.harnessSha &&
    hash40(value.harnessSha) &&
    value.moduleHash === identity?.moduleHash &&
    hash64(value.moduleHash) &&
    value.testHash === identity?.testHash &&
    hash64(value.testHash) &&
    value.mode === "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS" &&
    value.cases === 8 &&
    value.passed === true &&
    navigationArray(value.views, 2, (v) => navigationPlain(v, ["width", "theme"])) &&
    value.views.length === 2 &&
    value.views[0].width === 1440 &&
    value.views[0].theme === "light" &&
    value.views[1].width === 390 &&
    value.views[1].theme === "dark"
  );
}
export function navigationNativeSupplement(output, identity) {
  if (typeof output !== "string" || Buffer.byteLength(output) > 1048576)
    fail("NAVIGATION_NATIVE_PROOF");
  const lines = output.split("\n").map((line) => line.trim()),
    cases = [];
  if (
    lines.some((line) => /^not ok\b/.test(line)) ||
    ![
      "# tests 1",
      "# pass 1",
      "# fail 0",
      "# cancelled 0",
      "# skipped 0",
      "ok 1 - NAV R2 native readiness and transport",
    ].every((line) => lines.includes(line))
  )
    fail("NAVIGATION_NATIVE_PROOF");
  for (const line of lines.filter((line) => line.startsWith("# NAV_R2_NATIVE_CASE"))) {
    const match = /^# NAV_R2_NATIVE_CASE ([A-Z0-9_]+) PASS$/.exec(line);
    if (!match || !NAVIGATION_NATIVE_CASES.includes(match[1]) || cases.includes(match[1]))
      fail("NAVIGATION_NATIVE_PROOF");
    cases.push(match[1]);
  }
  if (cases.length !== 8) fail("NAVIGATION_NATIVE_PROOF");
  const proof = {
    schema: "contaos.navigation.native.v1",
    harnessSha: identity?.harnessSha,
    moduleHash: identity?.moduleHash,
    testHash: identity?.testHash,
    mode: "OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS",
    cases: 8,
    views: [
      { width: 1440, theme: "light" },
      { width: 390, theme: "dark" },
    ],
    passed: true,
  };
  if (!navigationNativeProofValid(proof, identity)) fail("NAVIGATION_NATIVE_PROOF");
  return proof;
}

export function validateNavigationReport(value) {
  const keys = [
    "schema",
    "frontendSha",
    "harnessSha",
    "deploymentId",
    "auditScope",
    "records",
    "summary",
    "nativeProofSha256",
    "navigationNativeProofSha256",
    "networkFailure",
    "fenceDiagnostic",
    "logoutFailure",
    "httpStatusErrors",
    "transportErrors",
    "sessionVerified",
    "masterVerified",
    "organizationVerified",
    "logoutVerified",
    "blockedMutations",
    "pageErrors",
    "httpErrors",
    "aborted",
  ];
  if (!navigationPlain(value, keys)) return false;
  const summary = summarizeNavigation(value.records);
  return (
    value.schema === "contaos.navigation.audit.v3" &&
    value.networkFailure === null &&
    value.auditScope === NAVIGATION_SCOPE.id &&
    value.frontendSha === NAVIGATION_DEPLOYMENT.frontendSha &&
    value.deploymentId === NAVIGATION_DEPLOYMENT.deploymentId &&
    hash40(value.harnessSha) &&
    /^dpl_[A-Za-z0-9]{8,80}$/.test(value.deploymentId || "") &&
    hash64(value.nativeProofSha256) &&
    hash64(value.navigationNativeProofSha256) &&
    value.fenceDiagnostic === null &&
    value.logoutFailure === null &&
    value.httpStatusErrors === 0 &&
    value.transportErrors === 0 &&
    value.httpErrors === value.httpStatusErrors + value.transportErrors &&
    ["sessionVerified", "masterVerified", "organizationVerified", "logoutVerified"].every(
      (k) => value[k] === true,
    ) &&
    value.blockedMutations === 0 &&
    value.pageErrors === 0 &&
    value.httpErrors === 0 &&
    value.aborted === null &&
    navigationPlain(value.summary, [
      "expected",
      "observed",
      "passed",
      "failed",
      "matrixComplete",
    ]) &&
    Object.keys(summary).every((k) => value.summary[k] === summary[k]) &&
    summary.matrixComplete
  );
}
export function navigationParent(item) {
  const c = "/contratos/" + SYNTHETIC_FIXTURE.contract;
  const m = "/competencias/" + SYNTHETIC_FIXTURE.competence;
  if (
    !item ||
    !navigationCases().some(
      (r) =>
        r.surface === item.surface &&
        r.path === item.path &&
        r.width === item.width &&
        r.theme === item.theme,
    )
  )
    fail("NAVIGATION_CASE");
  const parents = {
    SYS04: "/",
    SYS05: "/contratos",
    ADM01: "/",
    V101: "/",
    V102: "/contratantes",
    V103: "/contratantes",
    V104: "/",
    V105: "/contratos",
    V106: "/contratos",
    V107: c,
    V108: c,
    V109: c,
    V110: c,
    V111: c + "/documentos",
    V112: c,
    V113: c,
    V114: c + "/competencias",
    V115: m,
    V116: m,
    V117: "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/analise",
    V118: m,
    V119: "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49",
    V120: "/competencias/79bdc139-ed10-4c91-905e-b32b9a824d27",
    V121: c,
    V122: c,
    V123: "/",
  };
  return parents[item.surface];
}

const NAVIGATION_MENU_PATHS = Object.freeze([
  "/",
  "/contratantes",
  "/contratantes/novo",
  "/contratos",
  "/contratos/novo",
  "/selecionar-organizacao",
  "/administracao/usuarios",
  "/administracao/auditoria",
]);
export function navigationObservationReady(surface, observation) {
  if (!surfaceStateValid(surface === "V117" ? "V116" : surface, observation)) return false;
  const pending =
    /Carregando|Confirmando organização|Verificando sessão|Consultando apresentações/i;
  return (
    !pending.test(observation.mainText ?? "") &&
    !(observation.statusTexts ?? []).some((x) => pending.test(x)) &&
    NAVIGATION_MENU_PATHS.every((path) => observation.menuHrefs?.includes(path))
  );
}
export function navigationDomObservation() {
  return {
    headingText: document.querySelector("h1")?.textContent || "",
    mainText: document.querySelector("main")?.innerText || document.body.innerText,
    statusTexts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(
      (e) => e.textContent,
    ),
    regionNames: [
      ...document.querySelectorAll('[role="region"],section[aria-label],section[aria-labelledby]'),
    ].map(
      (e) =>
        e.getAttribute("aria-label") ||
        document.getElementById(e.getAttribute("aria-labelledby"))?.textContent ||
        "",
    ),
    menuHrefs: [
      ...document.querySelectorAll(
        'aside a[href],[role="dialog"][aria-label="Menu de navegação"] a[href]',
      ),
    ].map((e) => e.getAttribute("href")),
  };
}
function navigationDomReady(spec) {
  if (
    location.pathname !== spec.path ||
    document.documentElement.classList.contains("dark") !== (spec.theme === "dark")
  )
    return false;
  const header = document.querySelector('header[aria-label="Organização atual"]');
  if (
    !header?.textContent.includes(spec.organization) ||
    !/Situação:\s*ativa/i.test(header.textContent)
  )
    return false;
  const headings = document.querySelectorAll("h1"),
    main = document.querySelector("main")?.innerText || document.body.innerText;
  if (
    headings.length !== 1 ||
    !new RegExp(spec.title).test(headings[0].textContent.trim().replace(/\s+/g, " "))
  )
    return false;
  if (/Carregando|Confirmando organização|Verificando sessão|Consultando apresentações/i.test(main))
    return false;
  const statuses = [...document.querySelectorAll('[role="status"],[role="alert"]')].map(
    (e) => e.textContent,
  );
  if (
    statuses.some((x) =>
      /Carregando|Confirmando organização|Verificando sessão|Consultando apresentações/i.test(x),
    )
  )
    return false;
  if (
    /não encontrad[oa] ou indisponível|você não tem (?:acesso|permissão|autorização)|acesso negado|não foi possível|sessão expirada/i.test(
      main,
    )
  )
    return false;
  if (
    !spec.conditional &&
    /Ação não autorizada pelo backend ou competência indisponível/.test(main)
  )
    return false;
  const regions = [
    ...document.querySelectorAll('[role="region"],section[aria-label],section[aria-labelledby]'),
  ].map(
    (e) =>
      e.getAttribute("aria-label") ||
      document.getElementById(e.getAttribute("aria-labelledby"))?.textContent ||
      "",
  );
  if (!spec.conditional && spec.regions.some((x) => !regions.includes(x))) return false;
  const hrefs = [
    ...document.querySelectorAll(
      'aside a[href],[role="dialog"][aria-label="Menu de navegação"] a[href]',
    ),
  ].map((e) => e.getAttribute("href"));
  if (!spec.menu.every((x) => hrefs.includes(x))) return false;
  if (spec.control) {
    const root = spec.control.menuOpened
      ? document.querySelector('[role="dialog"][aria-label="Menu de navegação"]')
      : document;
    const enabled = [...(root?.querySelectorAll("a[href]") ?? [])].some(
      (node) =>
        node.getAttribute("href") === spec.control.path &&
        node.getClientRects().length > 0 &&
        !node.closest('[inert],[aria-hidden="true"],[aria-disabled="true"],[disabled]') &&
        getComputedStyle(node).visibility !== "hidden",
    );
    if (!enabled) return false;
  }
  return {
    headingText: headings[0].textContent,
    mainText: main,
    statusTexts: statuses,
    regionNames: regions,
    menuHrefs: hrefs,
  };
}
function navigationReadinessSpec(surface, path, theme) {
  const titles = {
    SYS05: "^Painel da organização$",
    ADM01: "^Usuários e vínculos$",
    V101: "^Contratantes$",
    V102: "^Novo contratante$",
    V103: "^Editar contratante$",
    V104: "^Contratos$",
    V105: "^Novo contrato$",
    V106: "^Contrato\\s+\\S",
    V107: "^Base normativa$",
    V108: "^Orçamento$",
    V109: "^Listas e regras$",
    V110: "^Central de documentos$",
    V111: "^FONTE_SINTETICA_AUDITORIA_HML$",
    V112: "^Competências$",
    V113: "^Nova competência$",
    V114: "^Competência\\s+\\S",
    V115: "^Documentos da competência$",
    V116: "^Análise da competência$",
    V117: "^Análise da competência$",
    V118: "^Parecer interno$",
    V119: "^Wizard de apresentação$",
    V120: "^Apresentação e protocolo$",
    V121: "^Histórico do contrato$",
    V122: "^Importação de histórico$",
    V123: "^Trilha de auditoria$",
  };
  const regions = {
    V111: ["Resumo do documento", "Processamento"],
    V119: ["Revisão de prontidão", "Etapa 2 de 2 — Registrar apresentação"],
    V120: ["Dados da apresentação", "Pacote imutável", "Itens preservados no pacote"],
  };
  if (!titles[surface]) fail("NAVIGATION_STATE");
  const conditional =
    surface === "V119" && path !== "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/apresentar";
  return {
    surface,
    path,
    theme,
    title: titles[surface],
    regions: regions[surface] ?? [],
    menu: NAVIGATION_MENU_PATHS,
    organization: SYNTHETIC_FIXTURE.organizationName,
    conditional,
  };
}
function navigationRemaining(deadline) {
  const remaining = Math.floor(deadline - performance.now());
  if (remaining <= 0)
    throw Object.assign(Error("NAVIGATION_TIMEOUT"), {
      name: "TimeoutError",
      code: "NAVIGATION_TIMEOUT",
    });
  return remaining;
}
async function waitNavigationStable(page, fence, spec, deadline, quietMs = 500) {
  for (;;) {
    if (page.url() !== HML_ORIGIN + spec.path) fail("NAVIGATION_ROUTE");
    await page.waitForFunction(navigationDomReady, spec, {
      timeout: navigationRemaining(deadline),
    });
    const network = navigationSessions.get(page);
    const revision = network ? await waitNavigationNetwork(page, fence, deadline, quietMs) : null;
    if (!network) {
      await fence.drain();
      fence.assertSafe();
    }
    if (page.url() !== HML_ORIGIN + spec.path) fail("NAVIGATION_ROUTE");
    navigationRemaining(deadline);
    const observation = await page.evaluate(navigationDomReady, spec);
    if (
      observation &&
      (spec.conditional || navigationObservationReady(spec.surface, observation)) &&
      (!network || network.isQuiet(revision, quietMs))
    )
      return observation;
  }
}
export async function waitNavigationReady(
  page,
  fence,
  surface,
  path,
  theme,
  deadline = performance.now() + 15000,
) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    !["light", "dark"].includes(theme) ||
    navigationDestination(HML_ORIGIN + path) !== (surface === "V117" ? "V116" : surface)
  )
    fail("NAVIGATION_ROUTE");
  if (page.url() !== HML_ORIGIN + path) fail("NAVIGATION_ROUTE");
  const spec = navigationReadinessSpec(surface, path, theme);
  await page.evaluate(
    (t) => document.documentElement.classList.toggle("dark", t === "dark"),
    theme,
  );
  return waitNavigationStable(page, fence, spec, deadline);
}
export async function waitNavigationControl(page, fence, path, width, menu) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    !navigationDestination(HML_ORIGIN + path) ||
    ![1440, 390].includes(width) ||
    typeof menu !== "boolean"
  )
    fail("NAVIGATION_ROUTE");
  const source = page.url(),
    surface = navigationDestination(source);
  if (!surface) fail("NAVIGATION_ROUTE");
  const dialog = page.getByRole("dialog", { name: "Menu de navegação", exact: true });
  let menuOpened = width === 390 && (await dialog.isVisible());
  const select = () =>
    menuOpened
      ? dialog.locator('a[href="' + path + '"]:visible').first()
      : page.locator('a[href="' + path + '"]:visible').first();
  let link = select();
  if (menu && width === 390 && (await link.count()) === 0 && !menuOpened) {
    const opener = page.getByRole("button", { name: "Abrir menu", exact: true });
    await opener.waitFor({ state: "visible", timeout: 15000 });
    await opener.click();
    await dialog.waitFor({ state: "visible", timeout: 15000 });
    menuOpened = true;
    link = select();
  }
  if (!menu)
    for (let n = 0; n < 25 && (await link.count()) === 0; n++) {
      const next = page.getByRole("button", { name: /Próxima página/ }).first();
      if ((await next.count()) !== 1 || !(await next.isEnabled())) break;
      await next.click();
      await settleVerifiedPage(page, fence);
      await waitNavigationReady(
        page,
        fence,
        surface,
        new URL(source).pathname,
        width === 390 ? "dark" : "light",
      );
      link = select();
    }
  const deadline = performance.now() + 15000;
  await link.waitFor({ state: "visible", timeout: navigationRemaining(deadline) });
  const spec = navigationReadinessSpec(
    surface,
    new URL(source).pathname,
    width === 390 ? "dark" : "light",
  );
  spec.control = { path, menuOpened };
  await waitNavigationStable(page, fence, spec, deadline);
  if (
    page.url() !== source ||
    (await link.count()) !== 1 ||
    !(await link.isEnabled()) ||
    !(await link.isVisible())
  )
    fail("NAVIGATION_LINK_MISSING");
  // These locator checks cross browser tasks. Revalidate the entire DOM/control
  // and the network revision after them, with the original shared deadline.
  if (navigationSessions.has(page))
    await waitNavigationStable(page, fence, spec, deadline, menuOpened ? 1500 : 500);
  return { link, menuOpened };
}

const navigationSessions = new WeakMap();
export async function toggleNavigationSidebar(page, fence, deadline = performance.now() + 15000) {
  await waitNavigationNetwork(page, fence, deadline);
  const collapse = page.getByRole("button", { name: "Recolher menu", exact: true });
  const expand = page.getByRole("button", { name: "Expandir menu", exact: true });
  if ((await collapse.count()) !== 1) fail("NAVIGATION_MENU");
  await collapse.click({ timeout: navigationRemaining(deadline) });
  await expand.waitFor({ state: "visible", timeout: navigationRemaining(deadline) });
  // Changing the original AppShell image src before its GET finishes aborts it.
  await waitNavigationNetwork(page, fence, deadline);
  await expand.click({ timeout: navigationRemaining(deadline) });
  await waitNavigationNetwork(page, fence, deadline);
}
export async function returnNavigationSource(page, fence, surface, path, theme) {
  if (navigationDestination(HML_ORIGIN + path) !== (surface === "V117" ? "V116" : surface))
    fail("NAVIGATION_ROUTE");
  const deadline = performance.now() + 15000;
  await waitNavigationNetwork(page, fence, deadline);
  await page.goBack({ waitUntil: "networkidle", timeout: navigationRemaining(deadline) });
  if (page.url() !== HML_ORIGIN + path) fail("NAVIGATION_ROUTE");
  return waitNavigationReady(page, fence, surface, path, theme, deadline);
}
export function navigationTransportMarker(request, context) {
  if (
    !navigationPlain(context, ["surface", "width", "stage", "operation", "target"]) ||
    !PRIVATE_SURFACES.includes(context.surface) ||
    !PRIVATE_SURFACES.includes(context.target) ||
    ![1440, 390].includes(context.width) ||
    !["DIRECT", "RELOAD", "ENTER_MENU", "MENU", "LINKS", "CONTROLS", "FINISH"].includes(
      context.stage,
    ) ||
    ![
      "DIRECT",
      "ENTER_PARENT",
      "ENTER_FIRST",
      "RETURN_PARENT",
      "ENTER_SECOND",
      "MENU_OPEN",
      "MENU_REQUIRED",
      "LINK_RETURN_SOURCE",
      "LINK_CLICK",
      "LINK_READY",
      "LOCAL_CONTROL",
      "FINISH",
    ].includes(context.operation) ||
    !request ||
    isProxy(request)
  )
    return null;
  const values = {};
  try {
    for (const name of ["failure", "url", "method", "resourceType"]) {
      let object = request,
        descriptor;
      for (let depth = 0; object && depth < 10; depth++) {
        if (isProxy(object)) return null;
        descriptor = Object.getOwnPropertyDescriptor(object, name);
        if (descriptor) break;
        object = Object.getPrototypeOf(object);
      }
      if (
        !descriptor ||
        !Object.hasOwn(descriptor, "value") ||
        typeof descriptor.value !== "function" ||
        isProxy(descriptor.value)
      )
        return null;
      values[name] = descriptor.value.call(request);
    }
    const error = values.failure;
    if (error && (typeof error !== "object" || isProxy(error))) return null;
    const descriptor = error ? Object.getOwnPropertyDescriptor(error, "errorText") : null;
    if (descriptor && !Object.hasOwn(descriptor, "value")) return null;
    const safe = {
      failure: () => ({ errorText: descriptor?.value }),
      url: () => values.url,
      method: () => values.method,
      resourceType: () => values.resourceType,
    };
    let category = "OTHER";
    if (typeof values.url === "string") {
      const url = new URL(values.url);
      if (url.origin === HML_ORIGIN) {
        if (url.pathname.startsWith("/brand/")) category = "BRAND";
        else if (url.pathname.startsWith("/assets/") && url.pathname.endsWith(".js"))
          category = "SCRIPT";
        else if (values.resourceType === "document") category = "DOCUMENT";
      } else if (url.origin === API_ORIGIN) {
        if (url.pathname.startsWith("/rest/v1/rpc/")) category = "API_RPC";
        else if (url.pathname.startsWith("/rest/v1/")) category = "API_REST";
        else if (url.pathname.startsWith("/auth/v1/")) category = "AUTH";
      }
    }
    return {
      phase: "NAVIGATION_TRANSPORT",
      ...context,
      ...navigationTransportDiagnostic(safe),
      category,
    };
  } catch {
    return null;
  }
}
export function navigationTransportDiagnostic(request) {
  const diagnostic = {
    reason: "OTHER",
    destination: "OTHER",
    method: "OTHER",
    resourceType: "other",
  };
  if (!request || isProxy(request)) return diagnostic;
  try {
    const text = request.failure()?.errorText;
    diagnostic.reason =
      text === "net::ERR_ABORTED"
        ? "ABORTED"
        : text === "net::ERR_TIMED_OUT"
          ? "TIMED_OUT"
          : [
                "net::ERR_CONNECTION_CLOSED",
                "net::ERR_CONNECTION_RESET",
                "net::ERR_CONNECTION_REFUSED",
                "net::ERR_NAME_NOT_RESOLVED",
              ].includes(text)
            ? "CONNECTION"
            : "OTHER";
    const origin = new URL(request.url()).origin;
    diagnostic.destination = origin === API_ORIGIN ? "API" : origin === HML_ORIGIN ? "UI" : "OTHER";
    const method = request.method();
    diagnostic.method = ["GET", "POST", "OPTIONS"].includes(method) ? method : "OTHER";
    const type = request.resourceType();
    diagnostic.resourceType = [
      "document",
      "fetch",
      "xhr",
      "script",
      "stylesheet",
      "image",
      "font",
      "manifest",
      "other",
    ].includes(type)
      ? type
      : "other";
  } catch {
    /* Only closed enums leave this observer. */
  }
  return diagnostic;
}
export async function waitNavigationNetwork(
  page,
  fence,
  deadline = performance.now() + 15000,
  quietMs = 500,
) {
  const observer = navigationSessions.get(page);
  if (!observer || !Number.isInteger(quietMs) || quietMs < 500 || quietMs > 1500)
    fail("NAVIGATION_STATE");
  for (;;) {
    const revision = await observer.waitQuiet(deadline, quietMs);
    let timer;
    try {
      await Promise.race([
        fence.drain(),
        new Promise((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                Object.assign(Error("NAVIGATION_TIMEOUT"), {
                  name: "TimeoutError",
                  code: "NAVIGATION_TIMEOUT",
                }),
              ),
            navigationRemaining(deadline),
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
    fence.assertSafe();
    navigationRemaining(deadline);
    if (observer.isQuiet(revision, quietMs)) return revision;
  }
}
export async function clickNavigationLogout(page, fence, deadline = performance.now() + 15000) {
  const observer = navigationSessions.get(page);
  if (!observer) fail("NAVIGATION_LOGOUT_CONTROL");
  const exit = page.getByRole("button", { name: "Sair", exact: true });
  for (;;) {
    navigationRemaining(deadline);
    if ((await exit.count()) !== 1 || !(await exit.isVisible()) || !(await exit.isEnabled()))
      fail("NAVIGATION_LOGOUT_CONTROL");
    const revision = await waitNavigationNetwork(page, fence, deadline);
    const ready = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button,[role="button"]')].filter(
        (node) =>
          (node.getAttribute("aria-label") || node.textContent.trim()) === "Sair" &&
          node.getClientRects().length > 0 &&
          !node.closest('[inert],[aria-hidden="true"]'),
      );
      return (
        buttons.length === 1 &&
        !buttons[0].disabled &&
        buttons[0].getAttribute("aria-disabled") !== "true"
      );
    });
    navigationRemaining(deadline);
    if (!ready) fail("NAVIGATION_LOGOUT_CONTROL");
    if (!observer.isQuiet(revision)) continue;
    await exit.click({ timeout: navigationRemaining(deadline) });
    return;
  }
}
export function observeNavigationSession(page) {
  if (navigationSessions.has(page)) fail("NAVIGATION_STATE");
  let httpStatusErrors = 0,
    transportErrors = 0,
    consoleErrors = 0,
    revision = 0,
    changedAt = performance.now(),
    closed = false,
    firstFailure = null;
  const active = new Set(),
    waiters = new Set();
  const changed = () => {
    revision++;
    changedAt = performance.now();
    for (const done of [...waiters]) done();
  };
  const request = (value) => {
    active.add(value);
    changed();
  };
  const finished = (value) => {
    active.delete(value);
    changed();
  };
  const response = (value) => {
    if (value.status() >= 400) httpStatusErrors++;
  };
  const failed = (value) => {
    transportErrors++;
    firstFailure ??= navigationTransportDiagnostic(value);
    finished(value);
  };
  const consoleMessage = (value) => {
    if (value.type() === "error") consoleErrors++;
  };
  const observer = {
    snapshot: () => ({
      httpErrors: httpStatusErrors + transportErrors,
      httpStatusErrors,
      transportErrors,
      consoleErrors,
    }),
    networkFailure: () => (firstFailure ? { ...firstFailure } : null),
    isQuiet: (expected, quietMs = 500) =>
      !closed &&
      revision === expected &&
      active.size === 0 &&
      performance.now() - changedAt >= quietMs,
    async waitQuiet(deadline, quietMs = 500) {
      for (;;) {
        if (closed) fail("NAVIGATION_STATE");
        const remaining = navigationRemaining(deadline);
        const quietRemaining = quietMs - (performance.now() - changedAt);
        if (active.size === 0 && quietRemaining <= 0) return revision;
        await new Promise((resolve) => {
          let timer;
          const done = () => {
            clearTimeout(timer);
            waiters.delete(done);
            resolve();
          };
          waiters.add(done);
          timer = setTimeout(
            done,
            Math.min(remaining, active.size ? remaining : Math.max(1, quietRemaining)),
          );
        });
      }
    },
    close() {
      closed = true;
      for (const done of [...waiters]) done();
      page.off("request", request);
      page.off("requestfinished", finished);
      page.off("response", response);
      page.off("requestfailed", failed);
      page.off("console", consoleMessage);
      active.clear();
      navigationSessions.delete(page);
    },
  };
  page.on("request", request);
  page.on("requestfinished", finished);
  page.on("response", response);
  page.on("requestfailed", failed);
  page.on("console", consoleMessage);
  navigationSessions.set(page, observer);
  return observer;
}

export async function runNavigationAudit(page, fence, proof) {
  if (
    singleRequestContext?.scope !== NAVIGATION_SCOPE ||
    singleRequestContext.sha !== process.env.CONTAOS_HARNESS_SHA
  )
    fail("NAVIGATION_CONTEXT");
  if (
    proof.frontendSha !== NAVIGATION_DEPLOYMENT.frontendSha ||
    proof.deploymentId !== NAVIGATION_DEPLOYMENT.deploymentId ||
    proof.harnessSha !== singleRequestContext.sha
  )
    fail("NAVIGATION_IDENTITY");
  if (!navigationSessions.has(page)) fail("NAVIGATION_STATE");
  const records = [];
  let errors = 0,
    httpErrors = 0,
    httpStatusErrors = 0,
    transportErrors = 0,
    activeTheme = "light",
    generation = 0;
  const requestOwners = new WeakMap(),
    unavailable = new Map(),
    pendingResponses = new Set();
  const onRequest = (request) => {
    if (request.url() !== API_ORIGIN + "/rest/v1/rpc/obter_visao_geral_competencia") return;
    try {
      const body = request.postDataJSON();
      if (navigationPlain(body, ["p_id_competencia"]) && typeof body.p_id_competencia === "string")
        requestOwners.set(request, { generation, id: body.p_id_competencia });
    } catch {
      errors++;
    }
  };
  const onError = () => errors++;
  const onConsole = (message) => {
    if (message.type() === "error") errors++;
  };
  const onRequestFailed = () => {
    httpErrors++;
    transportErrors++;
  };
  const onResponse = (response) => {
    if (response.status() >= 400) {
      httpErrors++;
      httpStatusErrors++;
    }
    const owner = requestOwners.get(response.request());
    if (!owner || response.status() !== 200) return;
    const reading = (async () => {
      const bytes = await response.body();
      if (bytes.length > 262144) throw Error("NAVIGATION_STATE");
      const value = JSON.parse(bytes.toString("utf8"));
      if (navigationUnavailableEvidence("/competencias/" + owner.id + "/apresentar", value))
        unavailable.set(owner.generation + ":" + owner.id, true);
    })()
      .catch(() => {
        errors++;
      })
      .finally(() => pendingResponses.delete(reading));
    pendingResponses.add(reading);
  };
  page.on("request", onRequest);
  let diagnosticRow = null,
    diagnosticCount = 0;
  const onTransportDiagnostic = (request) => {
    if (!diagnosticRow || diagnosticCount >= 64) return;
    const { surface, width, stage, operation, target } = diagnosticRow;
    const marker = navigationTransportMarker(request, { surface, width, stage, operation, target });
    if (marker) {
      diagnosticCount++;
      console.log(JSON.stringify(marker));
    }
  };
  page.on("requestfailed", onTransportDiagnostic);
  page.on("pageerror", onError);
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);
  const need = (condition, code) => {
    if (!condition) fail(code);
  };
  async function ready(surface, path) {
    await settleVerifiedPage(page, fence);
    need(new URL(page.url()).pathname === path, "NAVIGATION_ROUTE");
    const themeVerified = await page.evaluate((theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      return document.documentElement.classList.contains("dark") === (theme === "dark");
    }, activeTheme);
    need(themeVerified, "NAVIGATION_STATE");
    if (surface === "SYS04") {
      const card = page
        .getByRole("radio")
        .filter({ hasText: SYNTHETIC_FIXTURE.organizationName })
        .filter({ hasText: "Administrador Master" });
      await card.waitFor({ state: "visible" });
      need((await card.count()) === 1, "NAVIGATION_STATE");
      await waitNavigationNetwork(page, fence);
      return;
    }
    const observation = await waitNavigationReady(page, fence, surface, path, activeTheme);
    if (
      surface === "V119" &&
      path !== "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/apresentar"
    ) {
      await Promise.all([...pendingResponses]);
      const id = path.split("/")[2];
      need(
        unavailable.get(generation + ":" + id) === true &&
          observation.headingText.trim() === "Wizard de apresentação" &&
          observation.mainText.includes(
            "Ação não autorizada pelo backend ou competência indisponível para apresentação.",
          ) &&
          (await page
            .getByRole("button", { name: /^(?:Aprovar|Registrar) apresentação$/ })
            .count()) === 0,
        "NAVIGATION_STATE",
      );
      return "CONDITIONAL_UNAVAILABLE";
    }
    need(surfaceStateValid(surface === "V117" ? "V116" : surface, observation), "NAVIGATION_STATE");
    need(
      !/Acesso negado|Não encontrado|Não foi possível carregar|Sessão expirada/.test(
        observation.mainText,
      ),
      "NAVIGATION_STATE",
    );
  }
  async function go(path) {
    const surface = navigationDestination(HML_ORIGIN + path);
    // Two parent contexts are required by the existing R20 presentation chain.
    const parentSurface =
      surface ||
      (path === "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49"
        ? "V114"
        : path === "/competencias/79bdc139-ed10-4c91-905e-b32b9a824d27/apresentar"
          ? "V119"
          : null);
    need(!!parentSurface, "NAVIGATION_ROUTE");
    await waitNavigationNetwork(page, fence);
    generation++;
    await navigateVerifiedPage(page, fence, HML_ORIGIN + path);
    await ready(parentSurface, path);
  }
  async function openMenu(width) {
    if (width < 768) {
      const open = page.getByRole("button", { name: "Abrir menu", exact: true });
      const dialog = page.getByRole("dialog", { name: "Menu de navegação", exact: true });
      if (await dialog.isVisible()) return;
      await open.waitFor({ state: "visible", timeout: 15000 });
      need((await open.count()) === 1, "NAVIGATION_MENU");
      await open.click();
      await page
        .getByRole("dialog", { name: "Menu de navegação", exact: true })
        .waitFor({ state: "visible" });
      await waitNavigationNetwork(page, fence);
    }
  }
  async function clickPath(path, width, menu) {
    if (!menu) await closeMenu();
    const { link: selected, menuOpened: opened } = await waitNavigationControl(
      page,
      fence,
      path,
      width,
      menu,
    );
    generation++;
    await selected.click();
    await page.waitForURL(HML_ORIGIN + path);
    await settleVerifiedPage(page, fence);
    if (opened)
      await page
        .getByRole("dialog", { name: "Menu de navegação", exact: true })
        .waitFor({ state: "hidden" });
  }
  async function closeMenu() {
    const dialog = page.getByRole("dialog", { name: "Menu de navegação", exact: true });
    if ((await dialog.count()) !== 1) return;
    await waitNavigationNetwork(page, fence);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    const opener = page.getByRole("button", { name: "Abrir menu", exact: true });
    need(await opener.evaluate((node) => document.activeElement === node), "NAVIGATION_MENU");
    await waitNavigationNetwork(page, fence);
  }
  async function visibleHrefs() {
    return page
      .locator("a[href]:visible")
      .evaluateAll((nodes) =>
        nodes
          .filter((e) => !e.closest('[inert],[aria-hidden="true"]'))
          .map((e) => e.getAttribute("href")),
      );
  }
  try {
    for (const item of navigationCases()) {
      const row = {
        surface: item.surface,
        width: item.width,
        theme: item.theme,
        routeExact: false,
        stateVerified: false,
        organizationVerified: false,
        enteredFromMenu: false,
        reloadVerified: false,
        backVerified: false,
        shellVerified: false,
        menuVerified: false,
        drawerVerified: item.surface === "V117" ? false : null,
        linksFound: 0,
        linksTested: 0,
        linksOutOfFixture: 0,
        excludedLinkKinds: [],
        conditionalLinksTested: 0,
        destinations: [],
        controlsVerified: false,
        controlOperation: navigationControlOperation(item.surface),
        operation: "DIRECT",
        target: item.surface,
        httpStatusErrors: 0,
        transportErrors: 0,
        pageErrors: 0,
        httpErrors: 0,
        blockedRequests: 0,
        status: "BLOCKED",
        stage: "DIRECT",
        failureCode: null,
      };
      records.push(row);
      diagnosticRow = row;
      const beforeErrors = errors,
        beforeHttp = httpErrors,
        beforeStatus = httpStatusErrors,
        beforeTransport = transportErrors;
      let stopAfterRecord = false;
      try {
        activeTheme = item.theme;
        await checkFreshDeployment(proof, false);
        await waitNavigationNetwork(page, fence);
        await resizeVerifiedPage(page, fence, item.width);
        await go(item.path);
        row.routeExact = true;
        row.stateVerified = true;
        row.organizationVerified = true;
        row.stage = "RELOAD";
        await waitNavigationNetwork(page, fence);
        generation++;
        await page.reload({ waitUntil: "networkidle" });
        await ready(item.surface, item.path);
        row.reloadVerified = true;
        row.stage = "ENTER_MENU";
        const parent = navigationParent(item);
        row.operation = "ENTER_PARENT";
        row.target = navigationDestination(HML_ORIGIN + parent);
        await go(parent);
        if (item.surface === "V117") {
          const opener = page.getByRole("button", {
            name: "Abrir requisito AUD-A-TXT-001",
            exact: true,
          });
          await opener.waitFor({ state: "visible" });
          await opener.click();
          const drawer = page.getByRole("dialog", { name: "Detalhe do requisito", exact: true });
          await drawer.waitFor({ state: "visible" });
          await drawer
            .getByRole("heading", { name: "Requisito", exact: true })
            .waitFor({ state: "visible" });
          for (const name of ["Fonte e versionamento", "Resultado de referência", "Evidências"])
            need(
              (await drawer.getByRole("region", { name, exact: true }).count()) === 1,
              "NAVIGATION_STATE",
            );
          if ((await drawer.getByRole("alert").count()) !== 0) fail("NAV_STATE");
          await drawer.getByRole("button", { name: "Fechar", exact: true }).click();
          await drawer.waitFor({ state: "hidden" });
          if (!(await opener.evaluate((node) => document.activeElement === node)))
            fail("NAV_STATE");
          row.drawerVerified = true;
          row.enteredFromMenu = true;
        } else {
          const mainLink = ["V103", "V106", "V111", "V114", "V120"].includes(item.surface);
          row.operation = "ENTER_FIRST";
          row.target = item.surface;
          await clickPath(item.path, item.width, !mainLink);
          await ready(item.surface, item.path);
          row.enteredFromMenu = true;
          row.operation = "RETURN_PARENT";
          row.target = navigationDestination(HML_ORIGIN + parent);
          await waitNavigationNetwork(page, fence);
          generation++;
          await page.goBack({ waitUntil: "networkidle" });
          await ready(
            navigationDestination(HML_ORIGIN + parent) ||
              (item.surface === "V119" ? "V114" : "V119"),
            parent,
          );
          row.backVerified = true;
          row.operation = "ENTER_SECOND";
          row.target = item.surface;
          await clickPath(item.path, item.width, !mainLink);
          await ready(item.surface, item.path);
        }
        if (item.surface === "V117") {
          await clickPath("/", item.width, true);
          await ready("SYS05", "/");
          await waitNavigationNetwork(page, fence);
          generation++;
          await page.goBack({ waitUntil: "networkidle" });
          await ready("V117", item.path);
          row.backVerified = true;
        }
        row.stage = "MENU";
        row.operation = "MENU_OPEN";
        row.target = item.surface;
        if (item.surface === "SYS04") {
          const card = page
            .getByRole("radio")
            .filter({ hasText: SYNTHETIC_FIXTURE.organizationName })
            .filter({ hasText: "Administrador Master" });
          await card.click();
          await page.getByRole("button", { name: "Continuar", exact: true }).click();
          await page.waitForURL(HML_ORIGIN + "/");
          await ready("SYS05", "/");
          row.menuVerified = true;
          row.shellVerified = true;
          row.controlsVerified = true;
        } else {
          if (item.width >= 768) {
            await toggleNavigationSidebar(page, fence);
          }
          const contentHrefs = await visibleHrefs();
          await openMenu(item.width);
          const required = [
            "/",
            "/contratantes",
            "/contratantes/novo",
            "/contratos",
            "/contratos/novo",
            "/selecionar-organizacao",
            "/administracao/usuarios",
            "/administracao/auditoria",
          ];
          row.operation = "MENU_REQUIRED";
          for (const path of required)
            need((await page.locator(`a[href="${path}"]:visible`).count()) > 0, "NAVIGATION_MENU");
          row.menuVerified = true;
          row.shellVerified = true;
          row.stage = "LINKS";
          const hrefs = [...contentHrefs, ...(await visibleHrefs())];
          const seen = new Set(),
            targets = [];
          for (const href of hrefs) {
            const decision = navigationLinkDecision(href, item.surface);
            need(decision.kind !== "BROKEN", "NAVIGATION_LINK_MISSING");
            if (decision.kind !== "TARGET") {
              row.linksOutOfFixture++;
              row.excludedLinkKinds.push(decision.kind);
              continue;
            }
            const dest = decision.destination;
            if (dest === item.surface || seen.has(dest)) continue;
            seen.add(dest);
            targets.push({ dest, path: new URL(href, HML_ORIGIN).pathname });
          }
          await closeMenu();
          row.linksFound = targets.length;
          for (const target of targets) {
            row.operation = "LINK_RETURN_SOURCE";
            row.target = item.surface;
            await ready(item.surface, item.path);
            let menu = false;
            if (item.width < 768) {
              menu = (await page.locator(`a[href="${target.path}"]:visible`).count()) === 0;
            }
            row.operation = "LINK_CLICK";
            row.target = target.dest;
            await clickPath(target.path, item.width, menu);
            row.operation = "LINK_READY";
            const state = await ready(target.dest, target.path);
            if (state === "CONDITIONAL_UNAVAILABLE") row.conditionalLinksTested++;
            row.destinations.push(target.dest);
            row.linksTested++;
            row.operation = "LINK_RETURN_SOURCE";
            row.target = item.surface;
            generation++;
            await returnNavigationSource(page, fence, item.surface, item.path, item.theme);
            await ready(item.surface, item.path);
          }
          row.stage = "CONTROLS";
          row.operation = "LOCAL_CONTROL";
          row.target = item.surface;
          if (["V102", "V103", "V105", "V113"].includes(item.surface)) {
            const form = page.locator("form");
            need((await form.count()) === 1, "NAVIGATION_FORM");
            let restore = null,
              original = null;
            if (item.surface === "V103") {
              restore = form.locator("input[required]").first();
              need((await restore.count()) === 1, "NAVIGATION_FORM");
              original = await restore.inputValue();
              need(original.length > 0, "NAVIGATION_FORM");
              await restore.fill("");
            }
            const empty = await form.evaluate((f) =>
              [...f.querySelectorAll('input:not([type="hidden"]),textarea')].some((e) => !e.value),
            );
            need(empty, "NAVIGATION_FORM");
            await form.locator('[type="submit"]').click();
            await settleVerifiedPage(page, fence);
            need(new URL(page.url()).pathname === item.path, "NAVIGATION_FORM");
            const invalid = await form.evaluate(
              (f) =>
                !f.checkValidity() ||
                !!f.querySelector('[aria-invalid="true"]') ||
                !!f.querySelector('[role="alert"]'),
            );
            need(invalid, "NAVIGATION_FORM");
            if (restore) await restore.fill(original);
          } else if (["V101", "ADM01"].includes(item.surface)) {
            const search = page.locator('main input[type="search"]');
            need((await search.count()) === 1, "NAVIGATION_FORM");
            await search.fill("AUD");
            await settleVerifiedPage(page, fence);
            need((await search.inputValue()) === "AUD", "NAVIGATION_FORM");
            await search.fill("");
            await ready(item.surface, item.path);
          } else if (item.surface === "V119") {
            const opener = page.getByRole("button", {
              name: "Registrar apresentação",
              exact: true,
            });
            await opener.click();
            const dialog = page.getByRole("dialog", {
              name: "Confirmar envio ao contratante",
              exact: true,
            });
            await dialog.waitFor({ state: "visible" });
            await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
            await dialog.waitFor({ state: "hidden" });
            need(
              await opener.evaluate((node) => document.activeElement === node),
              "NAVIGATION_STATE",
            );
          } else if (item.surface === "V120" || item.surface === "V122") {
            await page
              .getByRole("button", {
                name: item.surface === "V120" ? "Atualizar consulta" : "Atualizar histórico",
                exact: true,
              })
              .click();
            await ready(item.surface, item.path);
          } else if (item.surface === "V121") {
            for (const name of ["Precedentes", "Regras preventivas", "Relatórios e apontamentos"]) {
              await page.getByRole("button", { name, exact: true }).click();
              await ready(item.surface, item.path);
            }
          } else if (item.surface === "V117") {
            need(row.drawerVerified === true, "NAVIGATION_STATE");
          } else {
            need(row.linksTested > 0 && row.menuVerified && row.shellVerified, "NAVIGATION_CASE");
          }
          row.controlsVerified = true;
        }
        await waitNavigationNetwork(page, fence);
        row.pageErrors = errors - beforeErrors;
        row.httpErrors = httpErrors - beforeHttp;
        row.httpStatusErrors = httpStatusErrors - beforeStatus;
        row.transportErrors = transportErrors - beforeTransport;
        row.blockedRequests = fence.snapshot().blockedRequests;
        row.stage = "FINISH";
        row.operation = "FINISH";
        row.target = item.surface;
        row.status = "PASS";
        need(navigationRowValid(row), "NAVIGATION_CASE");
      } catch (error) {
        row.status = "FAIL";
        const allowed = [
          "NAVIGATION_ROUTE",
          "NAVIGATION_STATE",
          "NAVIGATION_MENU",
          "NAVIGATION_LINK_MISSING",
          "NAVIGATION_FORM",
          "NAVIGATION_CASE",
        ];
        row.failureCode =
          allowed.includes(error?.code) || NAVIGATION_NATIVE_CODES.has(error?.code)
            ? error.code
            : error?.name === "TimeoutError"
              ? "NAVIGATION_TIMEOUT"
              : "NAVIGATION_RUNTIME";
        row.pageErrors = errors - beforeErrors;
        row.httpErrors = httpErrors - beforeHttp;
        row.httpStatusErrors = httpStatusErrors - beforeStatus;
        row.transportErrors = transportErrors - beforeTransport;
        row.blockedRequests = fence.snapshot().blockedRequests;
        if (fence.snapshot().failed) stopAfterRecord = true;
      }
      console.log(
        JSON.stringify({
          phase: "NAVIGATION",
          surface: row.surface,
          width: row.width,
          status: row.status,
          stage: row.stage,
          code: row.failureCode,
          operation: row.operation,
          target: row.target,
        }),
      );
      if (stopAfterRecord) break;
    }
  } finally {
    page.off("requestfailed", onTransportDiagnostic);
    page.off("pageerror", onError);
    page.off("request", onRequest);
    page.off("console", onConsole);
    page.off("requestfailed", onRequestFailed);
    page.off("response", onResponse);
  }
  return { records, pageErrors: errors, httpErrors, httpStatusErrors, transportErrors };
}
export const C8_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.readonly-recovery-r20.v1",
  workflowRun: "42788354465",
  artifactId: "13751191411",
  requestId: "trilha-a-fixtures-20261110-r20",
  harnessSha: "79b728cb12e7b1df037c5816c27842c0ef042d2b",
  zipSha256: "142d095971e8b206030451d2de6236351a9db59b21e45a10b1c32b06cda73536",
  reportSha256: "daab1954472928a254fbb725476f6688415d2c7752c195b711a511be31a2b9fe",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  observationSha256: "9d4b0e45715e2589c0857f6e6357fb3b72035c30cb9e2c6d2d7be116a6325bc3",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": null,\n  "diagnostics": {\n    "primaryFailure": null,\n    "failureClass": null,\n    "errorName": null,\n    "subphase": "CLEANUP",\n    "subphasePath": [],\n    "lastCompletedSubphase": "CLEANUP",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 19,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 17,\n    "priorReserved": 2,\n    "newArmedCount": 0,\n    "maxIntentions": 24,\n    "maxNewIntentions": 5\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 17,\n    "maxNewIntentions": 5,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "pode_apresentar_contratante",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "opinionId": "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "aguardando_contratante",\n        "id": "79bdc139-ed10-4c91-905e-b32b9a824d27",\n        "requirementId": "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n        "documentId": "cd1624d3-73f7-4ea1-b317-c52627df6824",\n        "executionId": "00da4236-810f-4a89-8be5-b2ffcd50a480",\n        "opinionId": "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f",\n        "presentationId": "eb6d5b1c-8b64-418b-aa82-bf1f29d41768",\n        "packageId": "f29715a6-0664-415a-8903-68be9d7c5d66",\n        "packageHash": "82e0dc9adfbbce6956f87dfe8b78230f71eb9d7e4399571f86210c0f1c6e5c81"\n      }\n    ]\n  },\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "79b728cb12e7b1df037c5816c27842c0ef042d2b",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42788354465",\n  "phase": "FINAL_READBACK",\n  "completed": true,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n    "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd",\n    "79bdc139-ed10-4c91-905e-b32b9a824d27",\n    "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n    "cd1624d3-73f7-4ea1-b317-c52627df6824",\n    "00da4236-810f-4a89-8be5-b2ffcd50a480",\n    "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f",\n    "eb6d5b1c-8b64-418b-aa82-bf1f29d41768",\n    "f29715a6-0664-415a-8903-68be9d7c5d66"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "79b728cb12e7b1df037c5816c27842c0ef042d2b",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42788354465",\n  "firstFailure": null\n}\n',
});
function auditScope(scope = null) {
  if (scope === null || scope === undefined) return null;
  if (!isC8Scope(scope) && scope !== NAVIGATION_SCOPE) fail("AUDIT_SCOPE");
  return scope;
}
export function validateC8RecoveryDocument(input) {
  const code = "C8_RECOVERY";
  if (!input || typeof input !== "object" || isProxy(input)) fail(code);
  const proto = Object.getPrototypeOf(input);
  if (proto !== Object.prototype && proto !== null) fail(code);
  const names = Object.keys(C8_RECOVERY_DOCUMENT);
  const keys = Reflect.ownKeys(input);
  if (keys.length !== 12 || keys.some((key, index) => key !== names[index])) fail(code);
  const descriptors = Object.getOwnPropertyDescriptors(input),
    out = {};
  for (const key of names) {
    const d = descriptors[key];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      d.enumerable !== true ||
      typeof d.value !== "string" ||
      d.value !== C8_RECOVERY_DOCUMENT[key]
    )
      fail(code);
    out[key] = d.value;
  }
  const raw = JSON.stringify(out, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 5430 ||
    digest(raw) !== "3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee"
  )
    fail(code);
  return Object.freeze(out);
}

export function privateCases(scope = null) {
  scope = auditScope(scope);
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
  if (scope) {
    routes.V117 = "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/analise";
    routes.V119 = "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/apresentar";
    routes.V120 =
      "/competencias/79bdc139-ed10-4c91-905e-b32b9a824d27/apresentacoes/eb6d5b1c-8b64-418b-aa82-bf1f29d41768";
  }
  const cases = (scope ? scope.surfaces : PRIVATE_SURFACES).flatMap((surface) =>
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
  return scope === C8_REMAINING_SCOPE
    ? cases.filter((item) => item.surface === "V117" || item.theme === "light")
    : cases;
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
  scope = null,
}) {
  scope = auditScope(scope);
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
      "GITHUB_TOKEN",
      "CONTAOS_ACTIONS_READ_TOKEN",
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
    ...(scope
      ? ["/", "/selecionar-organizacao"]
      : [
          "/competencias/" +
            R18_REGISTRATION_CANDIDATE.competencyId +
            "/apresentacoes/" +
            R18_REGISTRATION_CANDIDATE.presentationId,
        ]),
    ...privateCases(scope)
      .filter((r) => r.path)
      .map((r) => r.path),
    ...(scope === NAVIGATION_SCOPE ? [...navigationKnownRoutes().keys()] : []),
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
  validateC8RecoveryDocument(C8_RECOVERY_DOCUMENT);
  if (
    args.length !== 1 ||
    ![
      "--resolve-deployment",
      "--prepare",
      "--native-guard",
      "--audit",
      "--request-preflight",
      "--request-revalidate",
    ].includes(args[0])
  )
    fail("CLI_MODE");
  if (args[0] === "--audit") {
    if (process.env.GITHUB_EVENT_NAME !== "workflow_run") fail("REQUEST_EVENT");
    assertPrivateRequestEnvironment(process.env);
  }
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

  if (["--request-preflight", "--request-revalidate"].includes(args[0]))
    return singleRequestCli(args[0]);
  if (process.env.GITHUB_EVENT_NAME === "workflow_run" && args[0] !== "--native-guard") {
    await loadSingleRequestProof({
      operation: process.env.CONTAOS_REQUEST_OPERATION,
      fresh: args[0] === "--audit",
    });
  }
  if (args[0] === "--native-guard") return nativeGuard();
  if (args[0] === "--audit") return runAuthenticatedAudit();
  if (args[0] === "--resolve-deployment") {
    if (
      !singleRequestEventAllowed(process.env, process.env.CONTAOS_REQUEST_OPERATION || "audit") ||
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
        "GITHUB_TOKEN",
        "CONTAOS_ACTIONS_READ_TOKEN",
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
    scope: singleRequestContext?.scope ?? null,
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
export function nativeProofFromTap(tap, identity) {
  if (
    typeof tap !== "string" ||
    !hash40(identity?.harnessSha) ||
    !hash64(identity?.moduleHash) ||
    !hash64(identity?.testHash)
  )
    fail("NATIVE_PROOF");
  for (const [key, value] of Object.entries({ tests: 8, pass: 8, fail: 0, skipped: 0 })) {
    const matches = [...tap.matchAll(new RegExp("^# " + key + " (\\d+)\\s*$", "gm"))];
    if (matches.length !== 1 || Number(matches[0][1]) !== value) fail("NATIVE_PROOF");
  }
  return { schema: "contaos.native.proof.v1", ...identity, passed: 8, failed: 0, skipped: 0 };
}
export function nativeProofValid(proof, identity) {
  return (
    proof?.schema === "contaos.native.proof.v1" &&
    hash40(identity?.harnessSha) &&
    hash64(identity?.moduleHash) &&
    hash64(identity?.testHash) &&
    ["harnessSha", "moduleHash", "testHash"].every((k) => proof[k] === identity[k]) &&
    proof.passed === 8 &&
    proof.failed === 0 &&
    proof.skipped === 0
  );
}
export async function harnessIdentity() {
  return {
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    moduleHash: digest(await readFile(fileURLToPath(import.meta.url))),
    testHash: digest(
      await readFile(new URL("./authenticated-visual-audit.test.mjs", import.meta.url)),
    ),
  };
}
export function nativeFailedCases(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return [];
  const names = new Map([
      ["Chromium nativo: resposta alterada não executa antes do fechamento", "SOURCE_RESPONSE"],
      ["Chromium nativo: worker não transmite ao canário", "WORKER"],
      ["Chromium nativo: popup não transmite ao canário", "POPUP"],
      ["Chromium nativo: websocket não transmite ao canário", "WEBSOCKET"],
      ["Chromium nativo: proxy não transmite ao canário", "PROXY"],
      ["Chromium nativo: controle positivo e bloqueio ws", "WS"],
      ["Chromium nativo: controle positivo e bloqueio wss", "WSS"],
      [
        "Chromium nativo: cancelamento inicial real não libera corpo nem transmite ao canário",
        "CANCELLATION",
      ],
    ]),
    found = [];
  for (const line of tap.split("\n")) {
    const title = /^not ok [0-9]+ - (.+)$/.exec(line.trim())?.[1],
      code = names.get(title);
    if (code && !found.includes(code)) found.push(code);
  }
  return found.slice(0, 8);
}

export function nativeCancellationDiagnostics(tap) {
  const allowed = new Set([
    "SENSOR_PROVED",
    "FENCE_READY",
    "FETCH_STARTED",
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
  ].slice(0, 8);
}
export function nativeCancellationFailure(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return null;
  const allowed = new Set([
    "FENCE_REQUEST_LIFECYCLE",
    "FENCE_DRAIN_TIMEOUT",
    "FENCE_LIFECYCLE_NO_NETWORK",
    "FENCE_LIFECYCLE_TERMINAL",
    "FENCE_LIFECYCLE_FRAME",
    "FENCE_LIFECYCLE_TYPE",
    "FENCE_REQUEST",
    "FENCE_SOURCE",
    "FENCE_TRANSPORT",
    "CDP_COMMAND",
    "FENCE_CDP_CLOSED",
    "OTHER",
  ]);
  const values = tap
    .split("\n")
    .map((line) => /^# NATIVE_CANCEL_FAILURE ([A-Z_]+)$/.exec(line.trim())?.[1])
    .filter((value) => allowed.has(value));
  return values.length === 1 ? values[0] : null;
}
export function nativePreflightDrain(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return null;
  const lines = tap
    .split("\n")
    .map((line) => /^# NATIVE_PREFLIGHT_DRAIN ([01]) ([01]) ([01])$/.exec(line.trim()))
    .filter(Boolean);
  if (lines.length !== 1) return null;
  return {
    originalOptionsObserved: lines[0][1] === "1",
    returnedBeforeRelease: lines[0][2] === "1",
    activeNetworkBeforeRelease: lines[0][3] === "1",
  };
}
export function nativeSourceOrdering(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return null;
  const lines = tap
    .split("\n")
    .map((line) => /^# NATIVE_SOURCE_ORDER ([01]) ([01]) ([01]) ([012]) ([01])$/.exec(line.trim()))
    .filter(Boolean);
  if (lines.length !== 1) return null;
  const m = lines[0];
  return {
    originalNetworkObserved: m[1] === "1",
    initialPauseObserved: m[2] === "1",
    networkDelivered: Number(m[3]),
    initialContinuations: Number(m[4]),
    continuationBeforeNetwork: m[5] === "1",
  };
}
export function nativeSourceFailure(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return null;
  return nativeCancellationFailure(
    tap
      .split("\n")
      .filter((line) => line.trim().startsWith("# NATIVE_SOURCE_FAILURE "))
      .map((line) => line.trim().replace("# NATIVE_SOURCE_FAILURE ", "# NATIVE_CANCEL_FAILURE "))
      .join("\n"),
  );
}
export function nativeCancellationTypes(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return null;
  const pairs = tap
    .split("\n")
    .map((line) => /^# NATIVE_CANCEL_TYPES ([A-Za-z]+) ([A-Za-z]+)$/.exec(line.trim()))
    .filter(Boolean);
  if (
    pairs.length !== 1 ||
    !CDP_RESOURCE_TYPES.has(pairs[0][1]) ||
    !CDP_RESOURCE_TYPES.has(pairs[0][2])
  )
    return null;
  return { network: pairs[0][1], fetch: pairs[0][2] };
}
export function nativeLifecycleMetadata(tap) {
  if (typeof tap !== "string" || tap.length > 1048576) return [];
  const result = [];
  for (const line of tap.split("\n")) {
    const m =
      /^# NATIVE_LIFECYCLE_META ([A-Za-z]+) ([A-Za-z]+) (GET|POST|OPTIONS) (REQUEST|RESPONSE) ([01]) ([01]) ([01])$/.exec(
        line.trim(),
      );
    if (!m || !CDP_RESOURCE_TYPES.has(m[1]) || !CDP_RESOURCE_TYPES.has(m[2])) continue;
    result.push({
      network: m[1],
      fetch: m[2],
      method: m[3],
      stage: m[4],
      networkFramePresent: m[5] === "1",
      sameFrame: m[6] === "1",
      loaderPresent: m[7] === "1",
    });
    if (result.length === 8) break;
  }
  return result;
}
export function nativeVisualDiagnostic(stdout) {
  const invalid = () => ({ state: "INVALID" });
  if (typeof stdout !== "string" || Buffer.byteLength(stdout) > 1048576) return invalid();
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith("# V102_NATIVE_DIAGNOSTIC") || line.startsWith("V102_NATIVE_DIAGNOSTIC"),
    );
  if (lines.length === 0) return { state: "MISSING" };
  if (lines.length > 16) return invalid();
  const stages = ["SOURCE_EXTRACT", "CSS_COMPILE", "MEASURE"],
    seen = new Set();
  const fields = ["lastStage", "width", "theme", "targetCount", "notHit", "geometry"];
  let last = null,
    previous = -1;
  for (const line of lines) {
    const match = /^(?:# )?V102_NATIVE_DIAGNOSTIC (.{1,512})$/.exec(line);
    if (!match) return invalid();
    let row;
    try {
      row = JSON.parse(match[1]);
    } catch {
      return invalid();
    }
    if (
      !row ||
      Array.isArray(row) ||
      typeof row !== "object" ||
      Object.keys(row).length !== fields.length ||
      fields.some((key) => !Object.hasOwn(row, key)) ||
      JSON.stringify(row) !== match[1]
    )
      return invalid();
    const ordinal = stages.indexOf(row.lastStage);
    if (ordinal < previous || ordinal < 0) return invalid();
    previous = ordinal;
    if (row.lastStage !== "MEASURE") {
      if (fields.slice(1).some((key) => row[key] !== null)) return invalid();
    } else {
      if (![1440, 1280, 768, 390].includes(row.width) || !["LIGHT", "DARK"].includes(row.theme))
        return invalid();
      const unobserved = row.targetCount === null && row.notHit === null && row.geometry === null;
      if (
        !unobserved &&
        (!Number.isInteger(row.targetCount) ||
          row.targetCount < 0 ||
          row.targetCount > 64 ||
          !Number.isInteger(row.notHit) ||
          row.notHit < 0 ||
          row.notHit > row.targetCount ||
          typeof row.geometry !== "boolean")
      )
        return invalid();
    }
    const identity =
      row.lastStage === "MEASURE"
        ? row.lastStage + ":" + row.width + ":" + row.theme
        : row.lastStage;
    if (seen.has(identity)) return invalid();
    seen.add(identity);
    last = {
      state: "OBSERVED",
      lastStage: row.lastStage,
      width: row.width,
      theme: row.theme,
      targetCount: row.targetCount,
      notHit: row.notHit,
      geometry: row.geometry,
    };
  }
  return last;
}

export function preparerSourceFormsSupplement(tap) {
  if (
    typeof tap !== "string" ||
    !/^TAP version 13$/m.test(tap) ||
    !/^1\.\.5$/m.test(tap) ||
    /^not ok|# SKIP|# TODO/m.test(tap)
  )
    return null;
  const names = [
    "R3 Chromium sourceforms exact controls and actual source consumer",
    "R3 Chromium sourceforms nested Radix logout actual runtime and unknown overlay",
    "R3 Chromium sourceforms competence read barriers and actual recovery consumer",
    "R3 Chromium sourceforms scoped V116 V117 projection and actual SDK parsers",
    "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer",
  ];
  const oks = [...tap.matchAll(/^ok [0-9]+ - (.+)$/gm)].map((x) => x[1]);
  if (oks.length !== 5 || names.some((name, i) => oks[i] !== name)) return null;
  return Object.entries({ tests: 5, pass: 5, fail: 0, skipped: 0, cancelled: 0 }).every(
    ([k, v]) => {
      const m = [...tap.matchAll(new RegExp("^# " + k + " ([0-9]+)$", "gm"))];
      return m.length === 1 && Number(m[0][1]) === v;
    },
  )
    ? 5
    : null;
}

// Console-only diagnosis from the no-credentials synthetic child. Never return raw TAP.
export function preparerSourceFormsFailure(input) {
  const empty = () => ({ failedCases: [], lastPhase: "UNKNOWN" });
  let tap = input;
  if (typeof tap !== "string") {
    if (!tap || typeof tap !== "object" || isProxy(tap)) return empty();
    const descriptor = Object.getOwnPropertyDescriptor(tap, "stdout");
    if (!descriptor || !("value" in descriptor)) return empty();
    tap = descriptor.value;
  }
  if (typeof tap !== "string" || tap.length > 1048576) return empty();
  const titles = new Map([
    ["R3 Chromium sourceforms exact controls and actual source consumer", "SOURCE"],
    ["R3 Chromium sourceforms nested Radix logout actual runtime and unknown overlay", "LOGOUT"],
    ["R3 Chromium sourceforms competence read barriers and actual recovery consumer", "COMPETENCE"],
    ["R3 Chromium sourceforms scoped V116 V117 projection and actual SDK parsers", "PROJECTION"],
    [
      "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer",
      "OPINION",
    ],
  ]);
  const phases = [
    "START",
    "BUNDLES",
    "PAGE_READY",
    "CURRENT_READS",
    "OPINION_SEALED",
    "RESUME",
    "OCT_SEPT_BOUND",
    "HASH_NEGATIVE",
    "TOTAL_NEGATIVE",
    "MISSING_NEGATIVE",
    "PENDING_NEGATIVE",
    "MULTIPLE_NEGATIVE",
    "FOREIGN_NEGATIVE",
    "FENCE",
    "ZERO_BUSINESS",
  ];
  const failedCases = [];
  let previous = -1,
    invalidPhase = false;
  for (const line of tap.split("\n")) {
    const title = /^not ok [0-9]+ - (.+)$/.exec(line)?.[1];
    const code = titles.get(title);
    if (code && !failedCases.includes(code)) failedCases.push(code);
    if (!line.startsWith("# R19_READONLY_PHASE ")) continue;
    const phase = /^# R19_READONLY_PHASE ([A-Z_]+)$/.exec(line)?.[1];
    const index = phases.indexOf(phase);
    if (index <= previous || index < 0) invalidPhase = true;
    previous = index;
  }
  return { failedCases, lastPhase: !invalidPhase && previous >= 0 ? phases[previous] : "UNKNOWN" };
}

export function nativeC8VisualDiagnostic(tap) {
  const unknown = () => ({ stage: "UNKNOWN" });
  if (typeof tap !== "string" || tap.length > 1048576) return unknown();
  let last = unknown(),
    count = 0;
  for (const line of tap.split("\n")) {
    if (!line.startsWith("# C8_NATIVE_PHASE ")) continue;
    if (++count > 300) return unknown();
    const plain = /^# C8_NATIVE_PHASE (START|BUNDLE|DONE)$/.exec(line);
    if (plain) {
      last = { stage: plain[1] };
      continue;
    }
    const match =
      /^# C8_NATIVE_PHASE (READY|MOUNT|DRAWER|STATE|COLLECT|PRIVACY|PRIVACY_BASELINE|PRIVACY_KIND|PRIVACY_RULE|PRIVACY_CONDITION|PRIVACY_SOURCE|PRIVACY_REFERENCE|PRIVACY_RETURN|PRIVACY_SIDEBAR|CLOSE|NEGATIVE) (V117|V119|V120) (1440|1280|768|390) (light|dark)$/.exec(
        line,
      );
    if (!match) return unknown();
    last = { stage: match[1], surface: match[2], width: Number(match[3]), theme: match[4] };
  }
  const outcome = {};
  for (const name of ["tests", "pass", "fail", "skipped", "cancelled"]) {
    const values = [...tap.matchAll(new RegExp("^# " + name + " ([0-9]{1,3})$", "gm"))];
    if (values.length > 1) return unknown();
    if (values.length) outcome[name] = Number(values[0][1]);
  }
  if (Object.keys(outcome).length === 5) {
    outcome.kinds = [
      ...new Set(
        [
          ...tap.matchAll(
            /^\s+failureType: '(testTimeoutFailure|testCodeFailure|uncaughtException|unhandledRejection|cancelledByParent|hookFailed|subtestsFailed)'$/gm,
          ),
        ].map((m) => m[1]),
      ),
    ];
    outcome.lifecycleAfterEnd = tap.includes(
      "generated asynchronous activity after the test ended",
    );
    outcome.abortedRequest = tap.includes("net::ERR_ABORTED");
    outcome.targetClosed = /TargetClosedError|Target page, context or browser has been closed/.test(
      tap,
    );
    last = { ...last, outcome };
  }
  const closedFailure = [
    ...tap.matchAll(
      /^\s+error: '(C8_CURRENT_OWNER|C8_CURRENT_WIRE|OBSERVATION_SCHEMA|OBSERVATION_FAILED|PII_SUPPLEMENT)'$/gm,
    ),
  ];
  if (closedFailure.length === 1) last = { ...last, failureCode: closedFailure[0][1] };
  for (const [message, assertion] of [
    ["R3 original sidebar prefix RED", "HISTORICAL_R3_PREFIX"],
    ["original sidebar GREEN", "CURRENT_SIDEBAR"],
    ["full original UI render classifier", "CURRENT_RENDER_CLASSIFIER"],
    ["full original UI ARIA classifier", "CURRENT_ARIA_CLASSIFIER"],
    ["R3 serializer causal RED", "HISTORICAL_R3_SERIALIZER"],
    ["original field serializer GREEN", "CURRENT_SERIALIZER"],
  ])
    if (tap.includes(message)) last = { ...last, assertion };

  const classifications = [];
  for (const line of tap.split("\n")) {
    const m =
      /^# C8_NATIVE_CLASSIFY (RENDER|ARIA) (ALLOWED|UNKNOWN_WORDS|INVALID_CONTENT|SENSITIVE_PATTERN) ([0-9]{1,3})$/.exec(
        line,
      );
    if (m && Number(m[3]) <= 233)
      classifications.push({ channel: m[1], reason: m[2], unknownCount: Number(m[3]) });
  }
  if (classifications.length) last = { ...last, classifications: classifications.slice(-2) };
  return last;
}

export async function navigationNativeGuard({
  execute = execFile,
  identity = harnessIdentity,
  makeDirectory = mkdir,
  write = writeFile,
} = {}) {
  try {
    const result = await execute(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=^NAV R2 native readiness and transport$",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 120000,
        maxBuffer: 1048576,
      },
    );
    const proof = navigationNativeSupplement(result.stdout, await identity());
    await makeDirectory(".audit-work", { recursive: true, mode: 0o700 });
    await write(".audit-work/navigation-native-proof.json", JSON.stringify(proof), { mode: 0o600 });
    return proof;
  } catch {
    fail("NAVIGATION_NATIVE_PROOF");
  }
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
        failedCases: nativeFailedCases(stdout),
        cancellationStages: nativeCancellationDiagnostics(stdout),
        cancellationFailure: nativeCancellationFailure(stdout),
        sourceFailure: nativeSourceFailure(stdout),
        sourceOrdering: nativeSourceOrdering(stdout),
        preflightDrain: nativePreflightDrain(stdout),
        cancellationTypes: nativeCancellationTypes(stdout),
        lifecycleMetadata: nativeLifecycleMetadata(stdout),
        tap,
      }),
    );
    fail("NATIVE_GUARD");
  }
  const proof = nativeProofFromTap(output, await harnessIdentity());
  // Extra image/geometry proof does not count as one of the eight causal fence proofs.
  try {
    const visual = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=Run78 Chromium isolado",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 75000,
        maxBuffer: 1048576,
      },
    );
    if (
      !/^# pass 1$/m.test(visual.stdout) ||
      !/^# fail 0$/m.test(visual.stdout) ||
      !/^# skipped 0$/m.test(visual.stdout)
    )
      fail("VISUAL_NATIVE");
  } catch (error) {
    console.error(
      JSON.stringify({
        phase: "VISUAL_NATIVE",
        exitCode: Number.isInteger(error?.code) ? error.code : null,
        signal: ["SIGTERM", "SIGKILL"].includes(error?.signal) ? error.signal : null,
        timedOut: error?.killed === true,
        c8: nativeC8VisualDiagnostic(typeof error?.stdout === "string" ? error.stdout : ""),
        v102: nativeVisualDiagnostic(typeof error?.stdout === "string" ? error.stdout : ""),
      }),
    );
    fail("VISUAL_NATIVE");
  }

  // SYS04 DOM/ARIA proof is a separate supplement; native causal8 and Run78 visual1 retain identity.
  let sys04BrowserCases = null;
  try {
    const sys04 = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=^SYS04 (source component|browser observer)",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 120000,
        maxBuffer: 1048576,
      },
    );
    sys04BrowserCases = privacySys04Supplement(sys04.stdout);
    if (sys04BrowserCases !== 2) fail("SYS04_NATIVE");
  } catch {
    fail("SYS04_NATIVE");
  }

  let v112BrowserCases;
  try {
    const supplement = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=^privacy112 Chromium full DOM ARIA matrix",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 45000,
        maxBuffer: 1048576,
      },
    );
    v112BrowserCases = privacy112Supplement(supplement.stdout);
    if (v112BrowserCases !== 1) fail("V112_NATIVE");
  } catch {
    fail("V112_NATIVE");
  }

  let v123BrowserCases;
  try {
    const supplement = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=^privacy123 Chromium full DOM ARIA matrix",
        "scripts/hml/authenticated-visual-audit.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 60000,
        maxBuffer: 1048576,
      },
    );
    v123BrowserCases = privacy123Supplement(supplement.stdout);
    if (v123BrowserCases !== 1) fail("V123_NATIVE");
  } catch {
    fail("V123_NATIVE");
  }

  let preparerSourceFormsCases;
  let sourceFormsOutput;
  try {
    const result = await execFile(
      process.execPath,
      [
        "--test",
        "--test-reporter=tap",
        "--test-name-pattern=^R3 Chromium sourceforms",
        "scripts/hml/prepare-visual-fixtures.test.mjs",
      ],
      {
        env: { ...browserEnvironment(process.env), CONTAOS_NATIVE_GUARD: "1" },
        timeout: 60000,
        maxBuffer: 1048576,
      },
    );
    sourceFormsOutput = result.stdout;
    preparerSourceFormsCases = preparerSourceFormsSupplement(sourceFormsOutput);
    if (preparerSourceFormsCases !== 5) fail("PREPARER_SOURCEFORMS_NATIVE");
  } catch (error) {
    const summary = preparerSourceFormsFailure(sourceFormsOutput ?? error);
    for (const code of summary.failedCases)
      console.error("PREPARER_SOURCEFORMS_NATIVE_CASE " + code);
    console.error("PREPARER_SOURCEFORMS_NATIVE_PHASE " + summary.lastPhase);
    fail("PREPARER_SOURCEFORMS_NATIVE");
  }

  const navigationProof = await navigationNativeGuard();
  console.log(
    JSON.stringify({
      phase: "NAVIGATION_NATIVE",
      state: "PASS",
      cases: navigationProof.cases,
      harnessSha: navigationProof.harnessSha,
      sha256: digest(JSON.stringify(navigationProof)),
    }),
  );
  await mkdir(".audit-work", { recursive: true, mode: 0o700 });
  await writeFile(".audit-work/native-proof.json", JSON.stringify(proof), { mode: 0o600 });
  console.log(
    JSON.stringify({
      phase: "NATIVE_GUARD",
      state: "PASS",
      sourceOrdering: nativeSourceOrdering(output),
      preflightDrain: nativePreflightDrain(output),
      cases: 8,
      visualCases: 1,
      preparerSourceFormsCases,
      sys04BrowserCases,
      v112BrowserCases,
      v123BrowserCases,
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
    "caption",
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
async function inspectPrivacy(page, words, diagnostics, readAttempt = 0) {
  const state = privacy78Pages.get(page),
    generation = state?.generation;
  const sys04Initial =
    state?.verified && (await page.evaluate(() => window.__contaosPrivacySys04?.read() ?? null));
  const initialReceipt =
    state?.verified && (await page.evaluate(() => window.__contaosPrivacy78?.read() ?? null));
  const receiptState =
    !initialReceipt && isC8Scope(state?.scope) && state?.verified
      ? await page.evaluate(() => {
          const d = window.__contaosPrivacy78?.diagnostics?.();
          if (!d) return null;
          const result = {};
          for (const k of ["invalid", "current", "route", "header"])
            if (typeof d[k] === "boolean") result[k] = d[k];
          for (const k of ["pending", "seen", "age", "cause"])
            if (
              Number.isInteger(d[k]) &&
              d[k] >= 0 &&
              d[k] <= (k === "age" ? 120000 : k === "cause" ? 8 : 512)
            )
              result[k] = d[k];
          return result;
        })
      : null;
  const waitingForReceipt =
    !initialReceipt &&
    receiptState?.invalid === false &&
    receiptState.current === true &&
    receiptState.route === true &&
    receiptState.header === true &&
    receiptState.pending > 0;
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

  const acquisition = {
    initialReceipt: !!initialReceipt,
    observer: receiptState || null,
    currentReceipt: false,
    sameRevision: false,
    anchor: false,
    fieldSnapshot: false,
    afterReceipt: false,
    sameAfterRevision: false,
    context: false,
    knownRendered: 0,
    knownSnapshot: 0,
  };
  let fieldContext,
    interruptedContext = false;
  if (rendered !== null && state?.verified && !state.closed) {
    const item = privateCases(state?.scope).find((i) => HML_ORIGIN + i.path === page.url());
    if (item && ["V109", "V111", "V112", "V115", "V122", "V123"].includes(item.surface)) {
      const receipt = await page.evaluate(() => {
        const header = document.querySelector('header[aria-label="Organização atual"]');
        if (
          !header?.textContent.includes("ContaOS HML Teste") ||
          !/Situação:\s*ativa/i.test(header.textContent)
        )
          return null;
        return window.__contaosPrivacy78?.read() ?? null;
      });
      interruptedContext =
        !!initialReceipt && !!receipt && initialReceipt.revision !== receipt.revision;
      acquisition.currentReceipt = !!receipt;
      acquisition.sameRevision =
        !!receipt && !!initialReceipt && initialReceipt.revision === receipt.revision;
      const is109 = item.surface === "V109";
      const is112 = item.surface === "V112";
      const is123 = item.surface === "V123";
      const anchor =
        receipt &&
        initialReceipt &&
        initialReceipt.revision === receipt.revision &&
        (await page.evaluate(
          is109
            ? privacy109FieldAnchor
            : is112
              ? privacy112FieldAnchor
              : is123
                ? privacy123FieldAnchor
                : privacy78FieldAnchor,
          is109
            ? { proof: state.v109Proof }
            : is123
              ? { proof: state.v123Proof }
              : { surface: item.surface, proof: state.proof },
        ));
      acquisition.anchor = !!anchor;
      if (
        anchor &&
        receipt.route === page.url() &&
        generation === state.generation &&
        !state.closed
      ) {
        let fieldSnapshot = null,
          fieldSnapshots = null;
        if (is109) fieldSnapshots = await privacy109FieldSnapshots(page, anchor);
        else if (is112) fieldSnapshots = await privacy112FieldSnapshots(page, anchor);
        else if (is123) fieldSnapshots = await privacy123FieldSnapshots(page, anchor);
        else {
          const locator = page.locator(anchor.selector);
          if ((await locator.count()) === anchor.count)
            fieldSnapshot = (await locator.nth(anchor.index).ariaSnapshot()).trim();
        }
        acquisition.fieldSnapshot = fieldSnapshot !== null || fieldSnapshots !== null;
        if (fieldSnapshot !== null || fieldSnapshots !== null) {
          const after = await page.evaluate(() => window.__contaosPrivacy78?.read() ?? null);
          interruptedContext ||= !!after && after.revision !== receipt.revision;
          acquisition.afterReceipt = !!after;
          acquisition.sameAfterRevision = !!after && after.revision === receipt.revision;
          if (
            after &&
            after.route === receipt.route &&
            after.revision === receipt.revision &&
            JSON.stringify(after.observed) === JSON.stringify(receipt.observed) &&
            generation === state.generation &&
            !state.closed
          ) {
            const currentReceipt = Object.freeze({
              ...after,
              route: item.path,
              observed: Object.freeze(after.observed),
            });
            fieldContext = is109
              ? privacy109FieldContext({
                  proof: state.proof,
                  v109Proof: state.v109Proof,
                  rendered,
                  snapshot,
                  fieldSnapshots,
                  anchored: true,
                  receipt: currentReceipt,
                })
              : is112
                ? privacy112FieldContext({
                    proof: state.proof,
                    rendered,
                    snapshot,
                    fieldSnapshots,
                    anchored: true,
                    receipt: currentReceipt,
                  })
                : is123
                  ? privacy123FieldContext({
                      proof: state.proof,
                      v123Proof: state.v123Proof,
                      rendered,
                      snapshot,
                      fieldSnapshots,
                      anchored: true,
                      receipt: currentReceipt,
                    })
                  : privacy78FieldContext({
                      surface: item.surface,
                      proof: state.proof,
                      rbacProof: state.rbacProof,
                      rendered,
                      snapshot,
                      fieldSnapshot,
                      anchored: true,
                      receipt: currentReceipt,
                    });
          }
        }
      }
    }
  }
  if (
    rendered !== null &&
    state?.verified &&
    !state.closed &&
    sys04Initial &&
    page.url() === HML_ORIGIN + "/selecionar-organizacao"
  ) {
    const anchor = await page.evaluate(privacySys04Anchor, {
      proof: state.sys04Proof,
      receipt: sys04Initial,
    });
    if (anchor) {
      const radios = page.locator(
        '[role="radiogroup"][aria-labelledby="sys04-titulo-lista"] > [role="radio"]',
      );
      const cardSnapshots = await Promise.all((await radios.all()).map((n) => n.ariaSnapshot()));
      const after = await page.evaluate(() => window.__contaosPrivacySys04?.read() ?? null);
      if (
        after &&
        JSON.stringify(after.ids) === JSON.stringify(sys04Initial.ids) &&
        after.revision === sys04Initial.revision &&
        state.generation === generation &&
        !state.closed
      )
        fieldContext = privacySys04FieldContext({
          proof: state.sys04Proof,
          receipt: after,
          anchor,
          rendered,
          snapshot,
          cardSnapshots,
          anchored: true,
        });
    }
  }
  acquisition.context = !!fieldContext;
  const acquisitionItem = isC8Scope(state?.scope)
    ? privateCases(state.scope).find((i) => HML_ORIGIN + i.path === page.url())
    : null;
  if (acquisitionItem && ["V111", "V115"].includes(acquisitionItem.surface)) {
    const value = state.proof?.generated_exact_values?.[acquisitionItem.surface]?.[0];
    if (typeof value === "string" && value) {
      acquisition.knownRendered =
        rendered === null ? 0 : Math.min(233, rendered.split(value).length - 1);
      acquisition.knownSnapshot = Math.min(233, snapshot.split(value).length - 1);
    }
    if (diagnostics) diagnostics.acquisition = acquisition;
  }
  if (rendered !== null && isC8Scope(state?.scope)) {
    const technical = {};
    fieldContext = await c8PrivacyContext(page, state, rendered, snapshot, fieldContext, technical);
    if (diagnostics) diagnostics.technical = technical;
  }
  const privacy =
    rendered === null
      ? { rendered: { reason: "OPAQUE_MEDIA", unknownCount: 0 } }
      : {
          rendered: classifyArtifactText(rendered, words, { fieldContext }),
          snapshot: classifyArtifactText(snapshot, words, { snapshot: true, fieldContext }),
        };
  if (diagnostics) Object.assign(diagnostics, privacy);
  if (interruptedContext || Object.values(privacy).some((result) => result.reason !== "ALLOWED")) {
    // A revision change invalidates the entire first window. Reacquire at most
    // once; no text, receipt or context survives into the new collection.
    if (
      readAttempt === 0 &&
      (interruptedContext || waitingForReceipt) &&
      isC8Scope(state?.scope) &&
      state.verified &&
      !state.closed &&
      state.generation === generation &&
      privacy78Pages.get(page) === state
    ) {
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      if (
        state.verified &&
        !state.closed &&
        state.generation === generation &&
        privacy78Pages.get(page) === state
      )
        return inspectPrivacy(page, words, diagnostics, 1);
    }
    return null;
  }
  return snapshot;
}
export async function checkFreshDeployment(proof, full) {
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
export async function waitOrganization(page) {
  await page.waitForFunction(
    (name) => {
      const header = document.querySelector('header[aria-label="Organização atual"]');
      return header?.textContent.includes(name) && /Situação:\s*ativa/i.test(header.textContent);
    },
    SYNTHETIC_FIXTURE.organizationName,
    { timeout: 15000 },
  );
}
export async function settleVerifiedPage(page, fence) {
  await page.waitForLoadState("networkidle");
  await fence.drain();
  fence.assertSafe();
}
export async function resizeVerifiedPage(page, fence, width) {
  await settleVerifiedPage(page, fence);
  await page.setViewportSize({ width, height: 1000 });
  await settleVerifiedPage(page, fence);
}
export async function navigateVerifiedPage(page, fence, target, beforeNavigate) {
  if (
    !requestAllowed({ url: target, method: "GET", resourceType: "Document" }) ||
    new URL(target).origin !== HML_ORIGIN
  )
    fail("AUTH_DESTINATION");
  await settleVerifiedPage(page, fence);
  if (
    beforeNavigate !== undefined &&
    (typeof beforeNavigate !== "function" || isProxy(beforeNavigate))
  )
    fail("AUTH_DESTINATION");
  const timeout = beforeNavigate === undefined ? undefined : beforeNavigate();
  if (timeout !== undefined && (!Number.isInteger(timeout) || timeout < 1 || timeout > 15000))
    fail("AUTH_DESTINATION");
  const response = await page.goto(target, {
    waitUntil: "networkidle",
    ...(timeout === undefined ? {} : { timeout }),
  });
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
  validateC8RecoveryDocument(C8_RECOVERY_DOCUMENT);
  const scope = auditScope(singleRequestContext?.scope);
  if (scope !== C8_V117_SCOPE && scope !== NAVIGATION_SCOPE) fail("AUDIT_BINDING_PENDING");
  if (process.env.GITHUB_EVENT_NAME !== "workflow_run") fail("REQUEST_EVENT");
  assertPrivateRequestEnvironment(process.env);
  getValidatedR7ZeroAuth();
  const ready = validateConfiguration({
    origin: HML_ORIGIN,
    frontendSha: process.env.CONTAOS_FRONTEND_SHA,
    harnessSha: process.env.CONTAOS_HARNESS_SHA,
    deploymentId: process.env.CONTAOS_DEPLOYMENT_ID,
    emailPresent: !!process.env.CONTAOS_HML_SYNTHETIC_EMAIL,
    passwordPresent: !!process.env.CONTAOS_HML_SYNTHETIC_PASSWORD,
  });
  if (!ready.ready) fail(ready.code);
  if (!singleRequestEventAllowed(process.env, "audit")) fail("AUDIT_MAIN_ONLY");
  const native = JSON.parse(await readFile(".audit-work/native-proof.json", "utf8"));
  if (!nativeProofValid(native, await harnessIdentity())) fail("NATIVE_PROOF");
  const navigationNativeProof =
    scope === NAVIGATION_SCOPE
      ? JSON.parse(await readFile(".audit-work/navigation-native-proof.json", "utf8"))
      : null;
  if (
    scope === NAVIGATION_SCOPE &&
    !navigationNativeProofValid(navigationNativeProof, await harnessIdentity())
  )
    fail("NAVIGATION_NATIVE_PROOF");
  const proof = JSON.parse(await readFile(".audit-work/provenance.json", "utf8"));
  if (
    proof.schema !== "contaos.private.provenance.v1" ||
    proof.harnessSha !== process.env.CONTAOS_HARNESS_SHA ||
    proof.frontendSha !== process.env.CONTAOS_FRONTEND_SHA ||
    proof.deploymentId !== process.env.CONTAOS_DEPLOYMENT_ID ||
    proof.frontendSha !==
      (scope === NAVIGATION_SCOPE ? NAVIGATION_DEPLOYMENT : C8_R5_PRESERVED).frontendSha ||
    proof.deploymentId !==
      (scope === NAVIGATION_SCOPE ? NAVIGATION_DEPLOYMENT : C8_R5_PRESERVED).deploymentId
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
  let navigationHttpErrors = 0,
    navigationHttpStatusErrors = 0,
    navigationTransportErrors = 0,
    navigationSession = null,
    logoutFailure = null,
    navigationComplete = false;
  let phase = "AUDIT_PREFLIGHT",
    diagnostic = null;
  const flags = {
    formLocated: false,
    submitActivated: false,
    postLoginNavigation: false,
    masterLocated: false,
    organizationConfirmed: false,
  };
  const debug = createServer();
  await new Promise((resolve) => debug.listen(0, "127.0.0.1", resolve));
  const debugPort = debug.address().port;
  await new Promise((resolve) => debug.close(resolve));
  let captureItem = null,
    captureMode = null;
  async function saveRawScreenshot(key, suffix = "") {
    const file = `screenshots/${key}${suffix}.png`;
    const data = await page.screenshot({ fullPage: true, animations: "disabled" });
    if (data.length > 20971520) fail("SCREENSHOT_LIMIT");
    await writeFile(join(output, file), data, { mode: 0o600 });
    const sha = digest(data);
    hashes.push({ file, sha });
    return { file, sha };
  }
  async function saveScreenshot(key, suffix = "") {
    captureMode =
      suffix === "_menu"
        ? "MOBILE_MENU"
        : suffix === "_sidebar-recolhida"
          ? "SIDEBAR_COLLAPSED"
          : "PRIMARY";
    if (!captureItem) fail("VISUAL_CASE_IDENTITY");
    const result = await captureVisualEvidence({
      brand: () =>
        readyVisualBrand(
          page,
          captureItem,
          suffix === "_menu"
            ? "MOBILE_MENU"
            : suffix === "_sidebar-recolhida"
              ? "SIDEBAR_COLLAPSED"
              : "PRIMARY",
        ),
      drain: async () => {
        await fence.drain();
        fence.assertSafe();
      },
      stabilize: () =>
        page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        ),
      measure: () => {
        if (page.url() !== HML_ORIGIN + captureItem.path) fail("VISUAL_CASE_IDENTITY");
        return collectVisualMetrics(page, captureItem, scope, captureMode);
      },
      privacy: async () => (await inspectPrivacy(page, words)) !== null,
      save: () => {
        if (page.url() !== HML_ORIGIN + captureItem.path) fail("VISUAL_CASE_IDENTITY");
        fence.assertSafe();
        return saveRawScreenshot(key, suffix);
      },
    });
    const { shot, ...visualCapture } = result;
    return { ...shot, visualCapture };
  }

  try {
    phase = "BROWSER_START";
    proxy = await startDestinationProxy();
    browser = await launchNativeBrowser({ debugPort, proxy: proxy.url });
    context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    });
    const privacyProof = await loadPrivacy78Proof();
    const rbacProof = await loadPrivacy78RbacProof();
    const v109Proof = await loadPrivacy109Proof();
    const sys04Proof = await loadPrivacySys04Proof();
    await context.addInitScript(privacySys04Runtime, { proof: sys04Proof, install: true });
    const wireProof = await loadPrivacyWireProof();
    const v123Proof = await loadPrivacy123Proof();
    await context.addInitScript(privacy78Runtime, {
      proof: privacyProof,
      rbacProof,
      v109Proof,
      v123Proof,
      wireProof,
      install: true,
    });
    page = await context.newPage();
    if (scope === NAVIGATION_SCOPE) navigationSession = observeNavigationSession(page);
    const privacyState = {
      proof: privacyProof,
      rbacProof,
      v109Proof,
      v123Proof,
      sys04Proof,
      scope,
      generation: 0,
      verified: false,
      closed: false,
    };
    privacy78Pages.set(page, privacyState);
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) privacyState.generation++;
    });
    page.on("close", () => {
      privacyState.closed = true;
      privacyState.verified = false;
    });
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
    assertPrivateRequestEnvironment(process.env);
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
    privacyState.verified = true;
    phase = "CAPTURE_PRIVATE";
    if (scope === NAVIGATION_SCOPE) {
      phase = "NAVIGATION";
      const result = await runNavigationAudit(page, fence, proof);
      records.push(...result.records);
    }
    let surface = null;
    for (const item of scope === NAVIGATION_SCOPE ? [] : privateCases(scope)) {
      captureItem = item;
      const key = caseKey(item),
        record = {
          ...item,
          visualSelection: run78VisualSelection(item, scope),
          status: "PENDENTE",
        };
      const preserved = preservedPrivateCase(item, scope);
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
      let diagnosticStage = "CASE_NAVIGATION";
      captureMode = null;
      try {
        const beforeErrors = errors;
        if (scope) {
          privacyState.c8Observer?.close();
          privacyState.c8Current = null;
          const { createOfficialObserver } = await import("./prepare-visual-fixtures.mjs");
          privacyState.c8Observer = createOfficialObserver(page, {
            identity: {
              frontendSha: proof.frontendSha,
              harnessSha: proof.harnessSha,
              deploymentId: proof.deploymentId,
              workflowRun: process.env.GITHUB_RUN_ID,
            },
          });
        }
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
        diagnosticStage = "WAIT_SURFACE";
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
        const closeDrawer =
          scope && item.surface === "V117"
            ? await openC8RequirementDrawer(page, item, scope)
            : null;
        await settleVerifiedPage(page, fence);
        if (scope) await collectC8CurrentWire(page, item, privacyState);
        diagnosticStage = "PRIVACY_PRIMARY";
        const privacy = {};
        const snapshot = await inspectPrivacy(page, words, privacy);
        record.privacy = privacy;
        if (snapshot === null) {
          record.status = "BLOQUEADO_PII";
          continue;
        }
        diagnosticStage = "READ_UI_METRICS";
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
            dialogVisible: [...document.querySelectorAll('[role="dialog"]')].some(visible),
            dialogNames: [...document.querySelectorAll('[role="dialog"]')].filter(visible).map(
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
        diagnosticStage = "AXE";
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
        diagnosticStage = "CAPTURE_PRIMARY";
        const shot = await saveScreenshot(key);
        diagnosticStage = "SAVE_DOM";
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
          visualCapture: shot.visualCapture,
          screenshot: shot.file,
          sha256: shot.sha,
          dom: domFile,
          domSha256: digest(dom),
          accessibility,
        });
        diagnosticStage = "KEYBOARD";
        record.keyboard = await keyboardProbe(page);
        if (closeDrawer) record.drawerCloseVerified = await closeDrawer();
        diagnosticStage = "CAPTURE_SUPPLEMENT";
        captureMode = item.width >= 768 ? "SIDEBAR_COLLAPSED" : "MOBILE_MENU";
        record.sidebarSupplement = await sidebarProbe(page, item, key, words, saveScreenshot);
        diagnosticStage = "NAVIGATION_PROBE";
        record.navigationVerified = await navigationProbe(page, item, fence);
        diagnosticStage = "FINAL_CASE_CHECK";
        record.status =
          validateCase(record) &&
          run78VisualEvidenceValid(record, scope) &&
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
        recordCaseFailure(record, error, diagnosticStage, captureMode, fence.snapshot().failed);
        if (record.status === "BLOQUEADO_PII") {
          for (let i = hashes.length - 1; i >= 0; i--)
            if (
              hashes[i].file.startsWith("screenshots/" + key) ||
              hashes[i].file.startsWith("dom/" + key)
            ) {
              await rm(join(output, hashes[i].file), { force: true });
              hashes.splice(i, 1);
            }
          for (const field of [
            "screenshot",
            "sha256",
            "dom",
            "domSha256",
            "sidebarSupplement",
            "visualCapture",
          ])
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
    const privacyState = page && privacy78Pages.get(page);
    privacyState?.c8Observer?.close();
    if (privacyState) privacyState.verified = false;
    let logoutStage = "DRAIN";
    if (loggedIn && page && !page.isClosed())
      try {
        if (scope === NAVIGATION_SCOPE) await waitNavigationNetwork(page, fence);
        await settleVerifiedPage(page, fence);
        logoutStage = "MENU_CLOSE";
        await closeAuditMobileMenu(page);
        logoutStage = "CONTROL";
        const exit = page.getByRole("button", { name: "Sair", exact: true });
        if ((await exit.count()) === 1) {
          logoutStage = "CLICK";
          if (scope === NAVIGATION_SCOPE) await clickNavigationLogout(page, fence);
          else await exit.click();
          logoutStage = "REDIRECT";
          await page.waitForURL(HML_ORIGIN + "/login");
          logoutStage = "POST_DRAIN";
          await settleVerifiedPage(page, fence);
          if (scope === NAVIGATION_SCOPE) await waitNavigationNetwork(page, fence);
          logoutVerified = true;
          logoutFailure = null;
        } else if (scope === NAVIGATION_SCOPE)
          logoutFailure = { stage: "CONTROL", code: "NAVIGATION_LOGOUT_CONTROL" };
      } catch (error) {
        if (scope === NAVIGATION_SCOPE) logoutFailure = navigationLogoutFailure(error, logoutStage);
      }
    if (scope === NAVIGATION_SCOPE && !logoutVerified && !logoutFailure)
      logoutFailure = {
        stage: loggedIn ? "CONTROL" : "NOT_LOGGED_IN",
        code: loggedIn ? "PAGE_CLOSED" : "NO_SESSION",
      };
    fence?.close();
    await browser?.close().catch(() => {});
    await proxy?.close().catch(() => {});
    if (navigationSession) {
      const sessionErrors = navigationSession.snapshot();
      navigationHttpErrors = sessionErrors.httpErrors;
      navigationHttpStatusErrors = sessionErrors.httpStatusErrors;
      navigationTransportErrors = sessionErrors.transportErrors;
      errors += sessionErrors.consoleErrors;
      navigationSession.close();
    }
    if (scope !== NAVIGATION_SCOPE) completePrivateRecords(records, scope);
    const summary =
      scope === NAVIGATION_SCOPE ? summarizeNavigation(records) : summarizeCases(records, scope);
    if (scope && (aborted || !logoutVerified)) summary.matrixComplete = false;
    const report =
      scope === NAVIGATION_SCOPE
        ? {
            schema: "contaos.navigation.audit.v3",
            networkFailure: navigationSession?.networkFailure() ?? null,
            frontendSha: proof.frontendSha,
            harnessSha: proof.harnessSha,
            deploymentId: proof.deploymentId,
            auditScope: NAVIGATION_SCOPE.id,
            records,
            summary,
            nativeProofSha256: digest(JSON.stringify(native)),
            navigationNativeProofSha256: digest(JSON.stringify(navigationNativeProof)),
            fenceDiagnostic: navigationFenceDiagnostic(fence?.snapshot()),
            logoutFailure,
            httpStatusErrors: navigationHttpStatusErrors,
            transportErrors: navigationTransportErrors,
            sessionVerified: flags.postLoginNavigation === true,
            masterVerified: flags.masterLocated === true,
            organizationVerified: flags.organizationConfirmed === true,
            logoutVerified,
            blockedMutations: fence?.snapshot().blockedRequests ?? -1,
            pageErrors: errors,
            httpErrors: navigationHttpErrors,
            aborted,
          }
        : {
            schema: "contaos.private.audit.v1",
            frontendSha: proof.frontendSha,
            harnessSha: proof.harnessSha,
            deploymentId: proof.deploymentId,
            nativeProof: native,
            csp: "ADICIONAL_LOCAL_DO_AUDITOR",
            publicProofsRepeated: false,
            records,
            summary,
            auditScope: scope.id,
            ...(scope === C8_REMAINING_SCOPE ? { preservedEvidence: C8_R5_PRESERVED } : {}),
            ...(scope === C8_V117_SCOPE
              ? { preservedEvidence: [C8_R5_PRESERVED, C8_R6_PRESERVED] }
              : {}),
            recoveryDocumentSha256: digest(JSON.stringify(C8_RECOVERY_DOCUMENT, null, 2) + "\n"),
            logoutVerified,
            aborted,
            diagnostic,
            criteria72: "PENDENTE_REVISAO_INDEPENDENTE",
            v1Certified: false,
          };
    if (scope === NAVIGATION_SCOPE) navigationComplete = validateNavigationReport(report);
    const reportText = JSON.stringify(report, null, 2) + "\n";
    await writeFile(join(output, "report.json"), reportText, { mode: 0o600 });
    hashes.push({ file: "report.json", sha: digest(reportText) });
    await writeFile(
      join(output, "SHA256SUMS"),
      hashes.map((h) => `${h.sha}  ${h.file}`).join("\n") + "\n",
      { mode: 0o600 },
    );
  }
  if (scope === NAVIGATION_SCOPE) {
    if (!navigationComplete) fail("NAVIGATION_INCOMPLETE");
  } else if (aborted || !logoutVerified || records.some((r) => r.status !== "PASS_AUTOMATIZADO"))
    fail("AUDIT_INCOMPLETE");
}
/** Serialized into the browser: never return a browser error or arbitrary image URL. */
export async function decodeBrandImage(image, options) {
  const context = options?.context,
    timeoutMs = options?.timeoutMs ?? 5000;
  const error = (code) => Object.assign(new Error(code), { code });
  const validContext =
    context &&
    [1440, 1280, 768, 390].includes(context.width) &&
    ["light", "dark"].includes(context.theme) &&
    (["SYS04", "SYS05", "ADM01"].includes(context.surface) ||
      /^V(?:10[1-9]|11[0-9]|12[0-3])$/.test(context.surface)) &&
    ["PRIMARY", "SIDEBAR_COLLAPSED", "MOBILE_MENU"].includes(context.mode);
  if (
    !validContext ||
    (context.surface === "SYS04" && context.mode !== "PRIMARY") ||
    (context.mode === "MOBILE_MENU" && context.width >= 768) ||
    (context.mode === "SIDEBAR_COLLAPSED" && context.width < 768)
  )
    throw error("VISUAL_BRAND_INVALID");
  let expectedSrc;
  if (context.surface === "SYS04")
    expectedSrc =
      context.width < 640
        ? context.theme === "dark"
          ? "/brand/ContaOS_Simbolo_Navy.svg"
          : "/brand/ContaOS_Simbolo_Branco.svg"
        : context.theme === "dark"
          ? "/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg"
          : "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg";
  else if (context.mode === "PRIMARY" && context.width < 768) throw error("VISUAL_BRAND_INVALID");
  else
    expectedSrc =
      context.mode === "SIDEBAR_COLLAPSED"
        ? "/brand/ContaOS_Simbolo_Branco.svg"
        : "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg";
  const src = image.getAttribute("src");
  if (!image.isConnected || src !== expectedSrc || !Number.isFinite(timeoutMs) || timeoutMs <= 0)
    throw error("VISUAL_BRAND_INVALID");
  let timer, loaded, failed;
  try {
    await Promise.race([
      (async () => {
        if (!image.complete)
          await new Promise((resolve, reject) => {
            loaded = resolve;
            failed = () => reject(error("VISUAL_BRAND_INVALID"));
            image.addEventListener("load", loaded, { once: true });
            image.addEventListener("error", failed, { once: true });
          });
        if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)
          throw error("VISUAL_BRAND_INVALID");
        try {
          await image.decode();
        } catch {
          throw error("VISUAL_BRAND_DECODE");
        }
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(error("VISUAL_BRAND_TIMEOUT")), timeoutMs);
      }),
    ]);
    const rect = image.getBoundingClientRect();
    if (
      !image.isConnected ||
      image.getAttribute("src") !== src ||
      !image.complete ||
      ![rect.width, rect.height, image.naturalWidth, image.naturalHeight].every(
        (n) => Number.isFinite(n) && n > 0,
      )
    )
      throw error("VISUAL_BRAND_INVALID");
    return {
      src,
      complete: true,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: rect.width,
      height: rect.height,
      decoded: true,
    };
  } finally {
    clearTimeout(timer);
    if (loaded) image.removeEventListener("load", loaded);
    if (failed) image.removeEventListener("error", failed);
  }
}

export function visualMeasurementDiagnostic(metrics) {
  const targets = Array.isArray(metrics?.targets) ? metrics.targets.slice(0, 500) : [];
  return {
    identity: metrics?.identityPassed === true,
    geometry: metrics?.geometryPassed === true,
    table: metrics?.tablePassed === true,
    dates: metrics?.datesPassed === true,
    contrast: metrics?.contrastPassed === true,
    targetCount: targets.length,
    failedHitCount: targets.filter((target) => target?.hit === false && target.disabled !== true)
      .length,
    overflowX: Number.isFinite(metrics?.overflowX)
      ? Math.max(-30000, Math.min(30000, metrics.overflowX))
      : null,
  };
}

const visualFailureSummaries = new WeakMap();
const visualLegacyFailureSummaries = new WeakMap();
const CASE_DIAGNOSTIC_STAGES = new Set([
  "CASE_NAVIGATION",
  "WAIT_SURFACE",
  "PRIVACY_PRIMARY",
  "READ_UI_METRICS",
  "AXE",
  "CAPTURE_PRIMARY",
  "CAPTURE_SUPPLEMENT",
  "KEYBOARD",
  "NAVIGATION_PROBE",
  "SAVE_DOM",
  "FINAL_CASE_CHECK",
]);
const VISUAL_FAILURE_CODES = new Set([
  "VISUAL_BRAND_INVALID",
  "VISUAL_BRAND_DECODE",
  "VISUAL_BRAND_TIMEOUT",
  "VISUAL_BRAND_COUNT",
  "VISUAL_MEASUREMENT",
  "VISUAL_CASE_IDENTITY",
]);
/** No text/selector/exception object is a diagnostic field. */
export function summarizeVisualFailure(metrics) {
  const invalid = () => ({ observed: false, state: "INVALID" });
  const finite = (n, low = -100000, high = 100000) =>
    typeof n === "number" && Number.isFinite(n) && n >= low && n <= high;
  const count = (n) => Number.isInteger(n) && n >= 0 && n <= 100000;
  const rectValid = (r) =>
    r &&
    finite(r.x) &&
    finite(r.y) &&
    finite(r.width, Number.MIN_VALUE) &&
    finite(r.height, Number.MIN_VALUE);
  try {
    const flags = {};
    for (const k of [
      "identityPassed",
      "geometryPassed",
      "tablePassed",
      "datesPassed",
      "contrastPassed",
    ]) {
      if (typeof metrics?.[k] !== "boolean") return invalid();
      flags[k] = metrics[k];
    }
    const v = metrics.viewport;
    if (
      !WIDTHS.includes(v?.width) ||
      !Number.isInteger(v.height) ||
      !finite(v.height, 1, 30000) ||
      !finite(metrics.overflowX) ||
      !["light", "dark"].includes(metrics.theme) ||
      !Array.isArray(metrics.targets) ||
      metrics.targets.length > 256 ||
      !Array.isArray(metrics.dates) ||
      metrics.dates.length > 3 ||
      !Array.isArray(metrics.contrast) ||
      metrics.contrast.length > 100
    )
      return invalid();
    const counts = {
      targetsExamined: metrics.targets.length,
      invalidRect: 0,
      disconnected: 0,
      invisible: 0,
      notHit: 0,
      boundsX: 0,
      boundsY: 0,
    };
    const failedTargets = [];
    for (const t of metrics.targets) {
      if (
        !t ||
        !Number.isInteger(t.ordinal) ||
        t.ordinal < 0 ||
        t.ordinal > 255 ||
        !["INPUT", "SELECT", "TEXTAREA", "BUTTON", "LINK"].includes(t.kind) ||
        !rectValid(t.rect) ||
        ["connected", "visible", "disabled", "hit"].some((k) => typeof t[k] !== "boolean")
      )
        return invalid();
      const r = t.rect,
        disconnected = !t.connected,
        invisible = !t.visible;
      const notHit = !t.hit && !t.disabled,
        boundsX = r.x < 0 || r.x + r.width > v.width + 0.5;
      const boundsY = r.y < 0 || r.y + r.height > v.height + 0.5;
      counts.disconnected += +disconnected;
      counts.invisible += +invisible;
      counts.notHit += +notHit;
      counts.boundsX += +boundsX;
      counts.boundsY += +boundsY;
      if ((disconnected || invisible || notHit || boundsX || boundsY) && failedTargets.length < 8)
        failedTargets.push({
          ordinal: t.ordinal,
          kind: t.kind,
          rect: {
            x: Math.round(r.x * 100) / 100,
            y: Math.round(r.y * 100) / 100,
            width: Math.round(r.width * 100) / 100,
            height: Math.round(r.height * 100) / 100,
          },
          connected: t.connected,
          visible: t.visible,
          disabled: t.disabled,
          hit: t.hit,
        });
    }
    let table = null;
    if (metrics.table !== null) {
      if (
        !metrics.table ||
        !count(metrics.table.clipping) ||
        !Array.isArray(metrics.table.helpTargets) ||
        metrics.table.helpTargets.length > 256 ||
        !metrics.table.helpTargets.every(rectValid)
      )
        return invalid();
      table = {
        clipping: metrics.table.clipping,
        helpBelow44: metrics.table.helpTargets.filter((r) => r.width < 44 || r.height < 44).length,
      };
    }
    let absent = 0,
      schemeMismatch = 0;
    for (const d of metrics.dates) {
      if (
        !d ||
        typeof d.present !== "boolean" ||
        !["", "normal", "light", "dark", "light dark", "dark light"].includes(d.scheme)
      )
        return invalid();
      absent += +!d.present;
      schemeMismatch += +(d.present && d.scheme !== metrics.theme);
    }
    for (const c of metrics.contrast)
      if (!c || !finite(c.ratio, 0, 100) || c.threshold !== 4.5) return invalid();
    return {
      observed: true,
      state: "VALID",
      viewport: { width: v.width, height: v.height },
      flags,
      overflowX: Math.round(metrics.overflowX * 100) / 100,
      counts,
      failedTargets,
      table,
      dates: { absent, schemeMismatch },
      contrast: {
        count: metrics.contrast.length,
        minimum: metrics.contrast.length
          ? Math.round(Math.min(...metrics.contrast.map((c) => c.ratio)) * 10000) / 10000
          : null,
        threshold: 4.5,
      },
    };
  } catch {
    return invalid();
  }
}
/** The actual per-case report consumer; never spread/read an arbitrary exception. */
export function recordCaseFailure(record, error, stage, mode = null, fenceFailed = false) {
  const field = (key) => {
    try {
      const d = error && Object.getOwnPropertyDescriptor(error, key);
      return d && "value" in d ? d.value : undefined;
    } catch {
      return undefined;
    }
  };
  const code = field("code"),
    name = field("name");
  if (fenceFailed || code === "DEPLOYMENT_CHANGED") throw error;
  record.status = ["PII_SUPPLEMENT", "PII_VISUAL_CAPTURE"].includes(code)
    ? "BLOQUEADO_PII"
    : "FAIL_UI";
  if (VISUAL_FAILURE_CODES.has(code)) record.visualFailure = code;
  if (error && typeof error === "object" && visualLegacyFailureSummaries.has(error))
    record.visualDiagnostic = visualLegacyFailureSummaries.get(error);
  const capture = stage === "CAPTURE_PRIMARY" || stage === "CAPTURE_SUPPLEMENT";
  record.diagnostic = {
    schema: "contaos.case.failure.v1",
    stage: CASE_DIAGNOSTIC_STAGES.has(stage) ? stage : null,
    errorKind: VISUAL_FAILURE_CODES.has(code)
      ? "KNOWN_VISUAL"
      : name === "TimeoutError"
        ? "TIMEOUT"
        : name === "TargetClosedError"
          ? "TARGET_CLOSED"
          : name === "EvaluationError"
            ? "EVALUATION"
            : "OTHER",
    mode: capture && ["PRIMARY", "SIDEBAR_COLLAPSED", "MOBILE_MENU"].includes(mode) ? mode : null,
    visual:
      error && typeof error === "object" && visualFailureSummaries.has(error)
        ? visualFailureSummaries.get(error)
        : { observed: false, state: "UNOBSERVED" },
  };
  return record;
}

/** Shared causal boundary: no screenshot is emitted after a failed/incomplete step. */
export async function captureVisualEvidence({ brand, drain, stabilize, measure, privacy, save }) {
  const image = await brand();
  await drain();
  await stabilize();
  const metrics = await measure();
  if (metrics?.passed !== true) {
    const error = Object.assign(new Error("VISUAL_MEASUREMENT"), {
      code: "VISUAL_MEASUREMENT",
      visualDiagnostic: visualMeasurementDiagnostic(metrics),
    });
    visualFailureSummaries.set(error, summarizeVisualFailure(metrics));
    visualLegacyFailureSummaries.set(error, Object.freeze({ ...error.visualDiagnostic }));
    throw error;
  }
  if ((await privacy()) !== true) fail("PII_VISUAL_CAPTURE");
  const measuredAt = Date.now();
  const shot = await save();
  return { image, metrics, phase: "BEFORE_PNG", measuredAt, capturedAt: Date.now(), shot };
}

export function visualGeometryValid(value) {
  const validRect = (r) =>
    r && [r.x, r.y, r.width, r.height].every(Number.isFinite) && r.width > 0 && r.height > 0;
  if (
    !value ||
    !Number.isFinite(value.viewport?.width) ||
    !Number.isFinite(value.viewport?.height) ||
    value.viewport.width <= 0 ||
    value.viewport.height <= 0 ||
    !Array.isArray(value.targets) ||
    !Array.isArray(value.pairs)
  )
    return false;
  for (const t of value.targets) {
    const r = t.rect;
    if (
      !validRect(r) ||
      !t.connected ||
      !t.visible ||
      (!t.hit && t.disabled !== true) ||
      r.x < 0 ||
      r.y < 0 ||
      r.x + r.width > value.viewport.width + 0.5 ||
      r.y + r.height > value.viewport.height + 0.5
    )
      return false;
  }
  return value.pairs.every((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2) return false;
    const [a, b] = pair;
    return (
      validRect(a) &&
      validRect(b) &&
      !(a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y)
    );
  });
}

/** Real geometry only; labels, values, arbitrary selectors and user text never leave the page. */
export async function collectVisualMetrics(page, item, scope = null, mode = "PRIMARY") {
  scope = auditScope(scope);
  if (
    scope &&
    (!privateCases(scope).some((c) => caseKey(c) === caseKey(item) && c.path === item.path) ||
      !["PRIMARY", "SIDEBAR_COLLAPSED", "MOBILE_MENU"].includes(mode))
  )
    fail("VISUAL_CASE_IDENTITY");
  const modalRequired = isC8Scope(scope) && item.surface === "V117" && mode === "PRIMARY";
  const measured = await page.evaluate(
    ({ surface, theme, modalRequired }) => {
      const visible = (e) =>
        e.isConnected &&
        e.getClientRects().length > 0 &&
        getComputedStyle(e).visibility !== "hidden" &&
        getComputedStyle(e).display !== "none";
      const rect = (e) => {
        const b = e.getBoundingClientRect();
        return { x: b.x, y: b.y, width: b.width, height: b.height };
      };
      const viewport = { width: innerWidth, height: innerHeight };
      const dialogs = modalRequired
        ? [...document.querySelectorAll('[role="dialog"]')].filter(visible)
        : [];
      const modal =
        dialogs.length === 1 &&
        (dialogs[0].getAttribute("aria-labelledby") || "")
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent || "")
          .join(" ")
          .trim() === "Detalhe do requisito"
          ? dialogs[0]
          : null;
      const controls = [
        ...document.querySelectorAll('input:not([type="hidden"]),select,textarea,button,a[href]'),
      ].filter((e) => {
        if (!visible(e) || e.closest("[inert]") || (modalRequired && !modal?.contains(e)))
          return false;
        const r = rect(e);
        return r.width > 0 && r.height > 0 && r.y >= 0 && r.y + r.height <= innerHeight;
      });
      const targets = controls.map((e, ordinal) => {
        const r = rect(e),
          inset = Math.min(3, r.width / 4, r.height / 4);
        const points = [
          [r.x + r.width / 2, r.y + r.height / 2],
          [r.x + inset, r.y + r.height / 2],
          [r.x + r.width - inset, r.y + r.height / 2],
          [r.x + r.width / 2, r.y + inset],
          [r.x + r.width / 2, r.y + r.height - inset],
        ];
        return {
          ordinal,
          kind: e.matches("input")
            ? "INPUT"
            : e.matches("select")
              ? "SELECT"
              : e.matches("textarea")
                ? "TEXTAREA"
                : e.matches("button")
                  ? "BUTTON"
                  : "LINK",
          rect: r,
          connected: e.isConnected,
          visible: visible(e),
          disabled:
            e.matches(":disabled") ||
            (e.getAttribute("aria-disabled") === "true" &&
              e.matches('button,input,select,textarea,a[href],[role="button"]')),
          hit: points.every(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return hit === e || e.contains(hit);
          }),
        };
      });
      let table = null;
      if (surface === "V101") {
        const section = document.querySelector('section[aria-labelledby="v101-lista"]');
        const t = section?.querySelector("table"),
          cards = section?.querySelector('ul[aria-label="Contratantes (lista compacta)"]');
        let clipping = 0;
        if (t && visible(t))
          for (const cell of t.querySelectorAll("th,td")) {
            const c = cell.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(cell);
            for (const r of range.getClientRects())
              if (r.width > 0 && (r.left < c.left - 0.5 || r.right > c.right + 0.5)) clipping++;
          }
        table = {
          containerWidth: section
            ? section.clientWidth -
              parseFloat(getComputedStyle(section).paddingLeft) -
              parseFloat(getComputedStyle(section).paddingRight)
            : 0,
          tableVisible: !!t && visible(t),
          cardsVisible: !!cards && visible(cards),
          clipping,
          helpTargets: t && visible(t) ? [...t.querySelectorAll("button")].map((e) => rect(e)) : [],
        };
      }
      const dates = (
        surface === "V105" ? ["v105-inicio", "v105-fim"] : surface === "V113" ? ["v113-mes"] : []
      ).map((id) => {
        const e = document.getElementById(id);
        return {
          id,
          present: !!e && visible(e),
          scheme: e ? getComputedStyle(e).colorScheme : "",
          type: e?.getAttribute("type") ?? "",
        };
      });
      const contrast = [];
      if (["V106", "V107"].includes(surface)) {
        const pixel = (color) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data];
        };
        const lum = (rgb) =>
          rgb
            .slice(0, 3)
            .map((v) => {
              const s = v / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        for (const e of document.querySelectorAll("main span")) {
          const name = e.textContent?.trim();
          if (!["Situação:", "Criticidade:"].includes(name) || !visible(e)) continue;
          let ancestor = e,
            bg = null;
          while (ancestor) {
            const c = pixel(getComputedStyle(ancestor).backgroundColor);
            if (c[3] === 255) {
              bg = c;
              break;
            }
            ancestor = ancestor.parentElement;
          }
          const fg = pixel(getComputedStyle(e).color);
          const ratio =
            bg && fg[3] === 255
              ? (Math.max(lum(bg), lum(fg)) + 0.05) / (Math.min(lum(bg), lum(fg)) + 0.05)
              : 0;
          contrast.push({
            node: name === "Situação:" ? "STATUS_LABEL" : "CRITICALITY_LABEL",
            ratio,
            threshold: 4.5,
          });
        }
      }
      return {
        ...(modalRequired ? { modalPassed: !!modal && targets.length > 0 } : {}),
        viewport,
        targets,
        pairs: [],
        table,
        dates,
        contrast,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        overflowX: document.documentElement.scrollWidth - innerWidth,
      };
    },
    { ...item, modalRequired },
  );
  const identityPassed =
    measured.viewport.width === item.width &&
    measured.theme === item.theme &&
    (!modalRequired || measured.modalPassed === true);
  const geometryPassed = visualGeometryValid(measured);
  const tablePassed =
    !measured.table ||
    (measured.table.containerWidth > 0 &&
      measured.table.tableVisible !== measured.table.cardsVisible &&
      measured.table.clipping === 0 &&
      measured.table.helpTargets.every((r) => r.width >= 44 && r.height >= 44));
  const datesPassed = measured.dates.every((d) => d.present && d.scheme === item.theme);
  const contrastPassed =
    !["V106", "V107"].includes(item.surface) ||
    (measured.contrast.length >= (item.surface === "V106" ? 2 : 1) &&
      measured.contrast.every((c) => Number.isFinite(c.ratio) && c.ratio >= c.threshold));
  return {
    ...measured,
    passed:
      identityPassed &&
      geometryPassed &&
      tablePassed &&
      datesPassed &&
      contrastPassed &&
      measured.overflowX <= 0,
    identityPassed,
    geometryPassed,
    tablePassed,
    datesPassed,
    contrastPassed,
  };
}

export async function readyVisualBrand(page, item, mode) {
  if (
    !run78VisualSelection(item, privacy78Pages.get(page)?.scope) ||
    !["PRIMARY", "SIDEBAR_COLLAPSED", "MOBILE_MENU"].includes(mode) ||
    (item.surface === "SYS04" && mode !== "PRIMARY") ||
    (mode === "MOBILE_MENU" && item.width >= 768) ||
    (mode === "SIDEBAR_COLLAPSED" && item.width < 768)
  )
    fail("VISUAL_CASE_IDENTITY");
  const context = { surface: item.surface, width: item.width, theme: item.theme, mode };
  const required = item.surface === "SYS04" || item.width >= 768 || mode === "MOBILE_MENU";
  const images = page.locator('img[src^="/brand/"]:visible');
  const count = await images.count();
  if (count !== (required ? 1 : 0)) fail("VISUAL_BRAND_COUNT");
  if (!count) return { count: 0, images: [], context };
  const receipts = [];
  for (const image of await images.all()) {
    try {
      receipts.push(await image.evaluate(decodeBrandImage, { context, timeoutMs: 5000 }));
    } catch (error) {
      fail(
        ["VISUAL_BRAND_INVALID", "VISUAL_BRAND_DECODE", "VISUAL_BRAND_TIMEOUT"].includes(error.code)
          ? error.code
          : (["VISUAL_BRAND_INVALID", "VISUAL_BRAND_DECODE", "VISUAL_BRAND_TIMEOUT"].find((code) =>
              error.message?.includes(code),
            ) ?? "VISUAL_BRAND_DECODE"),
      );
    }
  }
  return { count, images: receipts, context };
}

const C8_SYNTHETIC_FIELDS = Object.freeze([
  "Documento TXT sintético Trilha A.",
  "Presença do documento TXT sintético de auditoria.",
  "Ensaio sintético HML da Trilha A. Sem efeito jurídico ou financeiro.",
  "O requisito sintético exige a presença do TXT aprovado, vinculado a esta competência. Arquivo e versão conferidos pelo SHA256 previsto.",
  "Ensaio sintético HML da Trilha A. A conferência limita-se à presença documental; sem efeito jurídico ou financeiro.",
  "HML-TRILHA-A-20261108",
  "Ensaio sintético em homologação.",
]);

// Exact non-personal output of the existing R20 synthetic execution. These
// scalars never enter literalWords or the seven reusable synthetic fragments.
// Admission below requires the original result identity and its original field.
const C8_R20_AUTOMATIC_RESULT = Object.freeze({
  justificativa:
    "O documento fornecido identifica-se como fonte sintética de auditoria e informa que é um documento de teste relacionado à auditoria da Trilha A.",
  fundamento:
    "A evidência atende à exigência de presença de documento TXT sintético de auditoria; a avaliação automática não substitui aprovação humana.",
});
const C8_R20_EXECUTION_FIELDS = Object.freeze({
  motor: "contaos",
  versao_motor: "4.1",
  provedor: "openai",
  modelo: "gpt-6-luna",
  prompt_versao: "analise-pt-BR-v4.1",
});

export function c8TechnicalFieldContracts(item, wire) {
  const out = [];
  const r20 = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[0];
  const automaticContext =
    item.surface === "V117" &&
    validateC8CurrentWire(item, wire) &&
    wire.analysis.execucao_atual.id === r20.executionId &&
    wire.detail.execucao_atual.id === r20.executionId;
  const resultIds = new Set(
    automaticContext
      ? [wire.detail.resultado_referencia, wire.detail.resultado_atual]
          .filter((r) => r?.id_execucao === r20.executionId && typeof r.id === "string")
          .map((r) => r.id)
      : [],
  );
  const automaticField = (field, raw) => {
    if (!automaticContext) return false;
    const match =
      /^(detail\.resultado_(?:referencia|atual)|detail\.historico\.(\d+)|analysis\.resultados\.(\d+))\.(justificativa|fundamento)$/.exec(
        field,
      );
    if (!match || raw !== C8_R20_AUTOMATIC_RESULT[match[4]]) return false;
    if (match[3] !== undefined) {
      const row = wire.analysis.resultados[Number(match[3])];
      return row?.id_requisito === r20.requirementId && resultIds.has(row.id_resultado);
    }
    const row =
      match[2] !== undefined
        ? wire.detail.historico[Number(match[2])]
        : wire.detail[match[1].slice("detail.".length)];
    return row?.id_execucao === r20.executionId && resultIds.has(row.id ?? row.id_resultado);
  };
  const date = (value) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(new Date(value))
      .replace(",", "");
  const add = (field, raw, selector, label, kind = "text", prefix = "", attribute = null) => {
    if (typeof raw !== "string" || !raw) return;
    let value = raw;
    if (kind === "date") {
      if (!/^\d{4}-\d{2}-\d{2}T/.test(raw) || !Number.isFinite(Date.parse(raw))) return;
      value = date(raw);
    } else if (kind === "hash" && !/^[a-f0-9]{64}$/.test(raw)) return;
    else if (kind === "uuid" && !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(raw)) return;
    else if (
      kind === "synthetic" &&
      !C8_SYNTHETIC_FIELDS.includes(raw) &&
      !automaticField(field, raw)
    )
      return;
    else if (kind === "code" && raw !== "AUD-A-TXT-001") return;
    out.push({ field, value, selector, label, attribute, expected: prefix + value });
  };
  const closedShape = (raw, expected) => {
    if (!expected || typeof expected !== "object") return raw === expected;
    if (
      !raw ||
      typeof raw !== "object" ||
      isProxy(raw) ||
      Object.getPrototypeOf(raw) !== Object.getPrototypeOf(expected)
    )
      return false;
    const wanted = Object.keys(expected),
      descriptors = Object.getOwnPropertyDescriptors(raw);
    const ownKeys = Reflect.ownKeys(raw).filter((key) => !(Array.isArray(raw) && key === "length"));
    return (
      ownKeys.length === wanted.length &&
      wanted.every(
        (key) =>
          Object.hasOwn(descriptors, key) &&
          Object.hasOwn(descriptors[key], "value") &&
          closedShape(descriptors[key].value, expected[key]),
      )
    );
  };
  const closed = (field, raw, selector, label, expected, prefix = "") => {
    if (raw === expected) add(field, raw, selector, label, "text", prefix);
  };
  if (["V117", "V119", "V120"].includes(item.surface)) {
    const recovered = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings.competencies.find((c) =>
      item.path.includes(c.id),
    );
    if (recovered) {
      const href = "/competencias/" + recovered.id;
      out.push({
        field: "route.return",
        value: href,
        expected: href,
        selector:
          'nav[aria-label="Navegação da página"] nav[aria-label="Navegação"] a[href="' +
          href +
          '"]',
        label: null,
        attribute: "href",
        linkText: item.surface === "V117" ? "Voltar para a competência" : "Voltar à competência",
      });
    }
  }
  if (item.path.startsWith("/competencias/")) {
    const b = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings;
    const id =
      b.competencies.find((c) => item.path.includes(c.id))?.id ?? SYNTHETIC_FIXTURE.competence;
    const base = "/competencias/" + id;
    const contractHref = "/contratos/" + b.contract;
    out.push({
      field: "route.sidebar.contract",
      value: contractHref,
      expected: contractHref,
      selector:
        'nav[aria-label="Navegação principal"] [role="group"][aria-label="Contexto atual"] a[aria-label="Contrato da competência"][href="' +
        contractHref +
        '"]',
      label: null,
      attribute: "href",
      linkAriaLabel: "Contrato da competência",
    });
    for (const [name, label, suffix] of [
      ["summary", "Resumo da competência", ""],
      ["documents", "Documentos da competência", "/documentos"],
      ["analysis", "Análise da competência", "/analise"],
      ["opinion", "Parecer da competência", "/parecer"],
      ["presentation", "Apresentações", "/apresentar"],
    ]) {
      const href = base + suffix;
      out.push({
        field: "route.sidebar." + name,
        value: href,
        expected: href,
        selector:
          'nav[aria-label="Navegação principal"] [role="group"][aria-label="Contexto atual"] a[aria-label="' +
          label +
          '"][href="' +
          href +
          '"]',
        label: null,
        attribute: "href",
        linkAriaLabel: label,
      });
    }
  }
  const dd = (root) => root + " > dl > div > dd";
  const result = (path, r, root) => {
    if (!r) return;
    add(path + ".criado_em", r.criado_em, dd(root), "Registrado em", "date");
    add(path + ".hash_evidencias", r.hash_evidencias, dd(root), "Hash das evidências", "hash");
    add(
      path + ".justificativa",
      r.justificativa,
      root + " > p:nth-of-type(1)",
      null,
      "synthetic",
      "Justificativa: ",
    );
    add(
      path + ".fundamento",
      r.fundamento,
      root + ` > p:nth-of-type(${r.justificativa ? 2 : 1})`,
      null,
      "synthetic",
      "Fundamento: ",
    );
  };
  if (item.surface === "V117") {
    const d = wire.detail,
      source = 'section[aria-labelledby="v117-fonte"]';
    add(
      "detail.requisito.origem_id",
      d.requisito.origem_id,
      dd(source),
      "Identificador da origem",
      "uuid",
    );
    add(
      "detail.requisito.hash_snapshot",
      d.requisito.hash_snapshot,
      dd(source),
      "Hash do snapshot",
      "hash",
    );
    add(
      "detail.requisito.descricao",
      d.requisito.descricao,
      'section[aria-labelledby="v117-req"] > p:nth-of-type(2)',
      null,
      "synthetic",
    );
    add(
      "detail.requisito.fonte_detalhe",
      d.requisito.fonte_detalhe,
      dd(source),
      "Detalhe",
      "synthetic",
    );
    add(
      "detail.requisito.codigo",
      d.requisito.codigo,
      'section[aria-labelledby="v117-req"] > p:nth-of-type(1)',
      null,
      "code",
    );
    closed(
      "detail.requisito.origem_tipo",
      d.requisito.origem_tipo,
      dd(source),
      "Origem",
      "item_lista",
    );
    const bindings = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings;
    closed(
      "detail.requisito.fonte_tipo",
      d.requisito.fonte_tipo,
      dd(source),
      "Tipo de fonte",
      "lista_verificacao",
    );
    closed(
      "detail.requisito.fonte_referencia",
      d.requisito.fonte_referencia,
      dd(source),
      "Referência",
      "Lista sintética Trilha A 24 fixtures 20261108",
    );
    const sourceDetails = { id_lista: bindings.listId, id_versao_lista: bindings.listVersionId };
    if (closedShape(d.requisito.fonte_detalhe, sourceDetails))
      add(
        "detail.requisito.fonte_detalhe",
        JSON.stringify(d.requisito.fonte_detalhe),
        dd(source),
        "Detalhe",
      );
    const rules = {
      regra_validacao: {
        documento: { obrigatorio: true, tipos: ["outro"] },
        condicao: { tipo: "sempre" },
      },
    };
    for (const [field, expected] of Object.entries(rules)) {
      const raw = d.requisito[field];
      if (closedShape(raw, expected))
        add(
          "detail.requisito." + field,
          JSON.stringify(raw),
          'section[aria-labelledby="v117-req"] > dl > div > dd',
          field === "regra_validacao" ? "Regra de validação" : "Condição de aplicabilidade",
        );
    }
    const executionFields = (path, e, root, combined) => {
      if (!automaticContext || (e?.id ?? e?.id_execucao) !== r20.executionId) return;
      if (path.startsWith("detail.historico.")) {
        if (e.tipo_execucao === "completa" && e.status_execucao === "concluida")
          closed(
            path + ".tipo_status",
            "completa · concluida",
            dd(root),
            "Execução",
            "completa · concluida",
          );
      } else {
        closed(path + ".status", e.status, dd(root), "Status", "concluida");
      }
      if (combined) {
        if (
          e.motor === C8_R20_EXECUTION_FIELDS.motor &&
          e.versao_motor === C8_R20_EXECUTION_FIELDS.versao_motor
        )
          closed(path + ".motor", e.motor + " " + e.versao_motor, dd(root), "Motor", "contaos 4.1");
        if (
          e.provedor === C8_R20_EXECUTION_FIELDS.provedor &&
          e.modelo === C8_R20_EXECUTION_FIELDS.modelo
        )
          closed(
            path + ".provedor_modelo",
            e.provedor + " / " + e.modelo,
            dd(root),
            "Provedor/modelo",
            "openai / gpt-6-luna",
          );
      } else {
        for (const [field, label] of [
          ["motor", "Motor"],
          ["versao_motor", "Versão do motor"],
          ["provedor", "Provedor"],
          ["modelo", "Modelo"],
        ])
          closed(path + "." + field, e[field], dd(root), label, C8_R20_EXECUTION_FIELDS[field]);
      }
      closed(
        path + ".prompt_versao",
        e.prompt_versao,
        dd(root),
        "Versão do prompt",
        C8_R20_EXECUTION_FIELDS.prompt_versao,
      );
    };
    const exec = 'section[aria-labelledby="v117-exec"]';
    executionFields("detail.execucao_atual", d.execucao_atual, exec, true);
    for (const [i, h] of (d.historico ?? []).entries())
      executionFields(
        `detail.historico.${i}`,
        h,
        `section[aria-labelledby="v117-hist"] ol > li:nth-child(${i + 1})`,
        true,
      );
    for (const [i, e] of (wire.analysis.execucoes ?? []).entries())
      executionFields(
        `analysis.execucoes.${i}`,
        e,
        `section[aria-labelledby="v116-hist"] ul > li:nth-child(${i + 1})`,
        false,
      );
    for (const [field, label, kind] of [
      ["hash_entrada", "Hash de entrada", "hash"],
      ["iniciada_em", "Iniciada em", "date"],
      ["concluida_em", "Concluída em", "date"],
    ])
      add("detail.execucao_atual." + field, d.execucao_atual?.[field], dd(exec), label, kind);
    result(
      "detail.resultado_referencia",
      d.resultado_referencia,
      'section[aria-labelledby="v117-ref"] > div',
    );
    result("detail.resultado_atual", d.resultado_atual, exec + " > div");
    for (const [i, e] of (d.evidencias ?? []).entries()) {
      const root = `section[aria-labelledby="v117-ev"] ul > li:nth-child(${i + 1})`;
      add(`detail.evidencias.${i}.hash`, e.hash, dd(root), "Hash", "hash");
      add(`detail.evidencias.${i}.criado_em`, e.criado_em, dd(root), "Registrada em", "date");
    }
    for (const [i, h] of (d.historico ?? []).entries()) {
      const root = `section[aria-labelledby="v117-hist"] ol > li:nth-child(${i + 1})`;
      add(
        `detail.historico.${i}.hash_entrada`,
        h.hash_entrada,
        dd(root),
        "Hash de entrada",
        "hash",
      );
      add(`detail.historico.${i}.criado_em`, h.criado_em, dd(root), "Registrado em", "date");
      add(
        `detail.historico.${i}.justificativa`,
        h.justificativa,
        root + " > p",
        null,
        "synthetic",
        "Justificativa: ",
      );
    }
  }
  if (["V116", "V117"].includes(item.surface)) {
    // V117 leaves the original V116 page rendered behind its modal. These
    // occurrences must participate in the same exact-value cardinality seal.
    const execution = wire.analysis.execucao_atual;
    if (item.surface === "V117" && execution?.tipo === "completa")
      add(
        "analysis.execucao_atual.criado_em",
        execution.criado_em,
        'section[aria-labelledby="v116-cab"] > p',
        null,
        "date",
        "Execução atual: completa · criada em ",
      );
    for (const [i, r] of (wire.analysis.resultados ?? []).entries()) {
      const root = `section[aria-labelledby="v116-req"] tbody > tr:nth-child(${i + 1})`;
      const criticalities = {
        critica: "Crítica",
        alta: "Alta",
        media: "Média",
        baixa: "Baixa",
        informativo: "Informativo",
      };
      const mechanisms = {
        deterministico: "Determinístico",
        semantico: "Semântico",
        humano: "Humano",
        nao_identificado: "Não identificado",
      };
      const criticality =
        r.requisito?.criticidade == null ? "—" : criticalities[r.requisito.criticidade];
      const mechanism = mechanisms[r.mecanismo];
      const confidence =
        r.confianca === null
          ? "—"
          : typeof r.confianca === "number" &&
              Number.isFinite(r.confianca) &&
              r.confianca >= 0 &&
              r.confianca <= 1
            ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(r.confianca)
            : null;
      if (
        automaticContext &&
        r.id_requisito === r20.requirementId &&
        resultIds.has(r.id_resultado) &&
        r.requisito?.codigo === "AUD-A-TXT-001" &&
        r.requisito.descricao === "Presença do documento TXT sintético de auditoria." &&
        r.requisito.fonte_referencia === "Lista sintética Trilha A 24 fixtures 20261108" &&
        r.resultado === "conforme" &&
        typeof criticality === "string" &&
        typeof mechanism === "string" &&
        confidence !== null &&
        r.justificativa === C8_R20_AUTOMATIC_RESULT.justificativa &&
        r.fundamento === C8_R20_AUTOMATIC_RESULT.fundamento &&
        Array.isArray(r.evidencias) &&
        r.evidencias.length === 0 &&
        wire.analysis.allowed_actions?.abrir_requisito === true
      ) {
        const cells = [
          {
            paragraphs: [
              r.requisito.codigo,
              r.requisito.descricao,
              "Fonte: " + r.requisito.fonte_referencia,
            ],
          },
          { text: "Conforme" },
          { text: criticality },
          { text: mechanism },
          { text: confidence },
          { paragraphs: [r.justificativa, "Fundamento: " + r.fundamento] },
          { button: "Abrir requisito", name: "Abrir requisito AUD-A-TXT-001" },
        ];
        const names = cells.map((cell) => cell.paragraphs?.join(" ") ?? cell.name ?? cell.text);
        out.push({
          field: `analysis.resultados.${i}.aria_aggregates`,
          selector: root,
          aggregate: { cells, names, rowName: names.join(" ") },
        });
      }
      if (item.surface === "V117")
        closed(
          `analysis.resultados.${i}.requisito.fonte_referencia`,
          r.requisito?.fonte_referencia,
          root + " > td:nth-child(1) > p:nth-of-type(3)",
          null,
          "Lista sintética Trilha A 24 fixtures 20261108",
          "Fonte: ",
        );
      add(
        `analysis.resultados.${i}.requisito.codigo`,
        r.requisito?.codigo,
        root + " > td:nth-child(1) > p:nth-of-type(1)",
        null,
        "code",
      );
      add(
        `analysis.resultados.${i}.requisito.codigo`,
        r.requisito?.codigo,
        root + " > td:nth-child(7) button",
        null,
        "code",
        "Abrir requisito ",
        "aria-label",
      );
      add(
        `analysis.resultados.${i}.requisito.descricao`,
        r.requisito?.descricao,
        root + " > td:nth-child(1) > p:nth-of-type(2)",
        null,
        "synthetic",
      );
      add(
        `analysis.resultados.${i}.justificativa`,
        r.justificativa,
        root + " > td:nth-child(6) > p:nth-of-type(1)",
        null,
        "synthetic",
      );
      add(
        `analysis.resultados.${i}.fundamento`,
        r.fundamento,
        root + ` > td:nth-child(6) > p:nth-of-type(${r.justificativa ? 2 : 1})`,
        null,
        "synthetic",
        "Fundamento: ",
      );
    }
    for (const [i, e] of (wire.analysis.execucoes ?? []).entries()) {
      const root = `section[aria-labelledby="v116-hist"] ul > li:nth-child(${i + 1})`;
      for (const [field, label, kind] of [
        ["hash_entrada", "Hash de entrada", "hash"],
        ["iniciada_em", "Iniciada em", "date"],
        ["concluida_em", "Concluída em", "date"],
      ])
        add(`analysis.execucoes.${i}.` + field, e[field], dd(root), label, kind);
    }
  }
  if (item.surface === "V118")
    for (const [i, p] of (wire.opinions ?? []).entries()) {
      const root = `section[aria-labelledby="v118-historico"] ol > li:nth-child(${i + 1})`;
      for (const [field, label, kind] of [
        ["hash", "Integridade (SHA-256)", "hash"],
        ["criado_em", "Criado em", "date"],
        ["aprovado_em", "Aprovado em", "date"],
      ])
        add(`opinions.${i}.` + field, p[field], dd(root), label, kind);
    }
  if (item.surface === "V120") {
    const ap = wire.presentations[0],
      pkg = wire.packages[0],
      a = 'section[aria-labelledby="v120-apresentacao"]',
      p = 'section[aria-labelledby="v120-pacote"]';
    add("presentations.0.id", ap.id, dd(a), "Identificador oficial", "uuid");
    add("presentations.0.apresentado_em", ap.apresentado_em, dd(a), "Apresentado em", "date");
    add("presentations.0.protocolo", ap.protocolo, dd(a), "Protocolo externo", "synthetic");
    add(
      "presentations.0.forma_apresentacao",
      ap.forma_apresentacao,
      dd(a),
      "Forma de apresentação",
      "synthetic",
    );
    add("packages.0.hash_pacote", pkg.hash_pacote, dd(p), "Hash criptográfico do pacote", "hash");
    closed(
      "packages.0.status",
      pkg.status,
      dd(p),
      "Situação oficial",
      R18_REGISTRATION_CANDIDATE.packageStatus,
    );
    closed("packages.0.tipo", pkg.tipo, dd(p), "Tipo", "apresentacao");
    add("packages.0.congelado_em", pkg.congelado_em, dd(p), "Congelado em", "date");
    for (const [i, e] of wire.items.entries()) {
      const root = `section[aria-labelledby="v120-itens"] ul > li:nth-child(${i + 1})`;
      closed(
        `items.${i}.entidade_tipo`,
        e.entidade_tipo,
        root + " > p:nth-of-type(1)",
        null,
        "documento_competencia",
        `Item ${e.ordem}: `,
      );
      add(`items.${i}.hash`, e.hash, root + " > p:nth-of-type(2)", null, "hash", "Hash: ");
      add(
        `items.${i}.versao_id`,
        e.versao_id,
        root + " > p:nth-of-type(3)",
        null,
        "uuid",
        "Versão: ",
      );
    }
  }
  return out;
}

// Values never join the global dictionary. The live owner and each original UI field
// must still agree immediately before each PNG, including its complement.
async function c8PrivacyContext(page, state, rendered, snapshot, previous, diagnostics = null) {
  const current = state?.c8Current;
  const ownerCurrent = () =>
    isC8Scope(state?.scope) &&
    privacy78Pages.get(page) === state &&
    current &&
    state.c8Current === current &&
    current.owner === state &&
    current.observer === state.c8Observer &&
    current.generation === state.generation &&
    !state.closed &&
    state.verified &&
    page.url() === HML_ORIGIN + current.item.path;
  if (!ownerCurrent() || !validateC8CurrentWire(current.item, current.wire))
    fail("C8_CURRENT_OWNER");
  const descriptors = c8TechnicalFieldContracts(current.item, current.wire);
  const collect = (descriptors) => {
    const visible = (node) =>
      node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden";
    const groups = new Map(),
      fields = new Set(),
      aggregates = [];
    for (const d of descriptors) {
      if (d.aggregate) {
        const rows = [...document.querySelectorAll(d.selector)];
        if (rows.length !== 1) continue;
        const row = rows[0],
          cells = [...row.children];
        const plain = (node, allowed = ["class"]) =>
          [...node.attributes].every((a) => allowed.includes(a.name));
        const text = (node, value) =>
          node.textContent.trim() === value &&
          [...node.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);
        if (
          row.tagName !== "TR" ||
          !visible(row) ||
          !plain(row) ||
          row.childNodes.length !== 7 ||
          cells.length !== 7 ||
          cells.some((cell, index) => {
            const spec = d.aggregate.cells[index];
            if (cell.tagName !== "TD" || !plain(cell)) return true;
            if (spec.paragraphs) {
              const ps = [...cell.children];
              return (
                cell.childNodes.length !== spec.paragraphs.length ||
                ps.length !== spec.paragraphs.length ||
                ps.some((p, i) => p.tagName !== "P" || !plain(p) || !text(p, spec.paragraphs[i]))
              );
            }
            if (spec.button) {
              const button = cell.firstElementChild;
              return (
                cell.childNodes.length !== 1 ||
                button?.tagName !== "BUTTON" ||
                !plain(button, ["class", "aria-label"]) ||
                button.getAttribute("aria-label") !== spec.name ||
                !text(button, spec.button)
              );
            }
            return !text(cell, spec.text);
          })
        )
          continue;
        for (const index of [-1, 0, 5, 6]) {
          const node = index === -1 ? row : cells[index];
          if (!visible(node) || node.closest('[aria-hidden="true"],[hidden]')) continue;
          aggregates.push({
            node,
            field: d.field,
            selector: d.selector + (index === -1 ? "" : ` > td:nth-child(${index + 1})`),
            index: 0,
            nodeCount: 1,
            role: index === -1 ? "row" : "cell",
            expectedName: index === -1 ? d.aggregate.rowName : d.aggregate.names[index],
          });
        }
        continue;
      }
      const slot = d.field + "|" + d.selector + "|" + (d.attribute ?? "text");
      if (fields.has(slot)) return [];
      fields.add(slot);
      const all = [...document.querySelectorAll(d.selector)];
      const nodes = all.filter((node) => {
        if (
          !visible(node) ||
          (d.attribute ? node.getAttribute(d.attribute) : node.textContent.trim()) !== d.expected
        )
          return false;
        if (d.attribute === "href") {
          if (d.linkAriaLabel) {
            if (
              node.getAttribute("aria-label") !== d.linkAriaLabel ||
              !["", d.linkAriaLabel].includes(node.textContent.trim()) ||
              ![null, d.linkAriaLabel].includes(node.getAttribute("title"))
            )
              return false;
          } else if (node.textContent.trim() !== d.linkText) return false;
        }
        if (d.label === null) return true;
        const label = node.parentElement.querySelector(":scope > dt")?.textContent;
        return label === d.label || label?.startsWith(d.label + ": ");
      });
      if (nodes.length !== 1) continue;
      const node = nodes[0],
        group = groups.get(d.value) ?? [];
      if (!group.some((s) => s.node === node && s.attribute === d.attribute)) {
        group.push({
          node,
          selector: d.selector,
          index: all.indexOf(node),
          nodeCount: all.length,
          attribute: d.attribute,
          expected: d.expected,
          // Pinned Playwright ariaSnapshot includes inert subtrees. This flag
          // follows its serializer, not keyboard/AX interaction eligibility.
          // Exact node identity, full scalar and snapshot cardinality still govern admission.
          accessible: !node.closest('[aria-hidden="true"],[hidden]'),
          role: node.tagName === "DD" ? "definition" : node.tagName === "P" ? "paragraph" : null,
          snapshotSafe:
            !d.attribute &&
            ["DD", "P"].includes(node.tagName) &&
            [...node.attributes].every((a) => a.name === "class") &&
            [...node.childNodes].every((n) => n.nodeType === Node.TEXT_NODE),
          text: d.attribute ? node.getAttribute(d.attribute) : node.textContent,
        });
      }
      groups.set(d.value, group);
    }
    const sealedSlots = [];
    for (const slots of groups.values())
      for (const slot of slots)
        if (!sealedSlots.some((s) => s.node === slot.node && s.attribute === slot.attribute))
          sealedSlots.push(slot);
    return {
      nodes: [...groups.values()]
        .flat()
        .map(({ node, selector, index }) => ({ node, selector, index }))
        .concat(aggregates.map(({ node, selector, index }) => ({ node, selector, index }))),
      aggregates: aggregates.map(({ node, ...metadata }) => metadata),
      groups: [...groups].map(([value, slots]) => ({
        value,
        attribute: slots[0]?.attribute ?? null,
        // The original UI shows provider/model both as a complete composite
        // and as separate history fields. Count only complete, independently
        // sealed scalars; an unanchored copy still exceeds this exact count.
        count: (slots[0]?.attribute === "href"
          ? slots
          : sealedSlots.filter((s) => s.attribute !== "href")
        ).reduce((n, s) => n + s.text.split(value).length - 1, 0),
        slots: slots.map(({ node, ...metadata }) => metadata),
      })),
    };
  };
  if (typeof page.evaluateHandle !== "function") fail("C8_CURRENT_OWNER");
  const seal = await page.evaluateHandle(collect, descriptors);
  let finalSeal;
  try {
    const anchored = await seal.evaluate((seal) => seal.groups);
    const aggregateSlots = await seal.evaluate((seal) => seal.aggregates);
    if (!Array.isArray(aggregateSlots) || aggregateSlots.length > 512) fail("C8_CURRENT_OWNER");
    if (!Array.isArray(anchored) || anchored.length > 512 || !ownerCurrent())
      fail("C8_CURRENT_OWNER");
    const serialized = new Map();
    let safeSlots = 0;
    for (const group of anchored)
      for (const slot of group.slots ?? []) {
        if (slot.attribute || !slot.accessible || !slot.snapshotSafe) continue;
        const locator = page.locator(slot.selector);
        if ((await locator.count()) !== slot.nodeCount) fail("C8_CURRENT_OWNER");
        const fieldSnapshot = (await locator.nth(slot.index).ariaSnapshot()).trim();
        if (!fieldSnapshot || fieldSnapshot.length > 1048576 || fieldSnapshot.includes("\n"))
          continue;
        const prefix = "- " + slot.role + ": ";
        if (!slot.role || !fieldSnapshot.startsWith(prefix)) continue;
        const scalar = fieldSnapshot.slice(prefix.length);
        let decoded = scalar;
        if (scalar.startsWith('"')) {
          try {
            decoded = JSON.parse(scalar);
          } catch {
            continue;
          }
        }
        if (decoded !== slot.expected) continue;
        serialized.set(fieldSnapshot, (serialized.get(fieldSnapshot) ?? 0) + 1);
        safeSlots++;
      }
    const aggregateHeaders = new Map();
    for (const slot of aggregateSlots) {
      const locator = page.locator(slot.selector);
      if ((await locator.count()) !== slot.nodeCount) fail("C8_CURRENT_OWNER");
      const original = await locator.nth(slot.index).ariaSnapshot();
      if (!original || original.length > 1048576 || slot.expectedName.length > 900) continue;
      const header = original.split("\n")[0].trim();
      if (!header.startsWith("- ") || !header.endsWith(":")) continue;
      // The DOM node has already been sealed against the exact typed row/cell
      // contract above. Decode only Playwright's YAML key quoting and bind the
      // serialized header to the expected role. The accessible-name content is
      // already proven by the exact DOM contract and node identity checks.
      let key = header.slice(2, -1);
      if (key.startsWith("'") && key.endsWith("'") && /^(?:[^']|'')*$/.test(key.slice(1, -1)))
        key = key.slice(1, -1).replace(/''/g, "'");
      if (!key.startsWith(slot.role + " ")) continue;
      aggregateHeaders.set(header, (aggregateHeaders.get(header) ?? 0) + 1);
    }
    finalSeal = await page.evaluateHandle(collect, descriptors);
    const final = await finalSeal.evaluate((seal) => seal.groups);
    const sameNodes = await seal.evaluate(
      (original, final) =>
        original.nodes.length === final.nodes.length &&
        original.nodes.every(
          (ref, index) =>
            ref.node === final.nodes[index].node &&
            ref.node.isConnected &&
            document.querySelectorAll(ref.selector)[ref.index] === ref.node,
        ),
      finalSeal,
    );
    if (
      !sameNodes ||
      !ownerCurrent() ||
      JSON.stringify(final) !== JSON.stringify(anchored) ||
      JSON.stringify(await finalSeal.evaluate((seal) => seal.aggregates)) !==
        JSON.stringify(aggregateSlots) ||
      !validateC8CurrentWire(current.item, current.wire) ||
      JSON.stringify(c8TechnicalFieldContracts(current.item, current.wire)) !==
        JSON.stringify(descriptors)
    )
      fail("C8_CURRENT_OWNER");
    const old = privacy78Contexts.get(previous);
    const channels = {
      rendered: { original: rendered, remainder: old?.rendered.remainder ?? rendered },
      snapshot: { original: snapshot, remainder: old?.snapshot.remainder ?? snapshot },
    };
    let renderedBindings = 0,
      ariaBindings = 0,
      urlBindings = 0;
    // Consume complete scalars before their substrings. Cardinality still uses
    // the original rendering and the same independently sealed nodes.
    const longestFirst = [...anchored].sort((a, b) => b.value.length - a.value.length);
    for (const { value, count, attribute } of longestFirst) {
      if (attribute !== "href" && count && rendered.split(value).length - 1 === count) {
        channels.rendered.remainder = channels.rendered.remainder.split(value).join(" ");
        renderedBindings++;
      }
    }
    for (const { value, count, attribute, slots = [] } of anchored) {
      const occurrences = (text) => text.split(value).length - 1;
      if (attribute === "href") {
        const expectedCount = slots.length ? slots.filter((s) => s.accessible).length : count;
        const line = "- /url: " + value;
        if (
          expectedCount &&
          occurrences(rendered) === 0 &&
          snapshot.split("\n").filter((s) => s.trim() === line).length === expectedCount
        ) {
          channels.snapshot.remainder = channels.snapshot.remainder
            .split("\n")
            .map((s) => (s.trim() === line ? "" : s))
            .join("\n");
          urlBindings += expectedCount;
        }
        continue;
      }
      const labels = new Map();
      for (const slot of slots)
        if (slot.attribute === "aria-label" && slot.accessible)
          labels.set(slot.expected, (labels.get(slot.expected) ?? 0) + 1);
      for (const [name, expectedCount] of labels) {
        const prefix = "- button " + JSON.stringify(name);
        const matches = (line) => {
          const suffix = line.trim().slice(prefix.length);
          return (
            line.trim().startsWith(prefix) &&
            (/^(?: \[(?:disabled|expanded|pressed|selected|checked)(?:=(?:true|false|mixed))?\])*:?$/.test(
              suffix,
            ) ||
              (name === "Abrir requisito AUD-A-TXT-001" && suffix === ": Abrir requisito"))
          );
        };
        if (snapshot.split("\n").filter(matches).length === expectedCount) {
          channels.snapshot.remainder = channels.snapshot.remainder
            .split("\n")
            .map((line) => (matches(line) ? line.replace(prefix, "- button") : line))
            .join("\n");
          ariaBindings += expectedCount;
        }
      }
    }
    for (const [fieldSnapshot, count] of serialized) {
      if (snapshot.split("\n").filter((line) => line.trim() === fieldSnapshot).length !== count)
        continue;
      channels.snapshot.remainder = channels.snapshot.remainder
        .split("\n")
        .map((line) => (line.trim() === fieldSnapshot ? "" : line))
        .join("\n");
      ariaBindings += count;
    }
    let aggregateBindings = 0;
    for (const [header, count] of aggregateHeaders) {
      if (snapshot.split("\n").filter((line) => line.trim() === header).length !== count) continue;
      channels.snapshot.remainder = channels.snapshot.remainder
        .split("\n")
        .map((line) => (line.trim() === header ? "" : line))
        .join("\n");
      aggregateBindings += count;
    }
    if (diagnostics)
      Object.assign(diagnostics, {
        aggregateBindings: Math.min(512, aggregateBindings),
        descriptors: Math.min(descriptors.length, 512),
        anchors: anchored.length,
        safeSlots: Math.min(safeSlots, 512),
        renderedBindings: Math.min(renderedBindings, 512),
        ariaBindings: Math.min(ariaBindings, 512),
        urlBindings: Math.min(urlBindings, 512),
        fields: descriptors.slice(0, 512).map((d, index) => {
          const group = anchored.find((g) => g.value === d.value);
          const slot = group?.slots.find(
            (s) => s.selector === d.selector && s.attribute === d.attribute,
          );
          const aggregate = aggregateSlots.some((s) => s.field === d.field);
          return {
            index,
            anchored: !!slot || aggregate,
            accessible: slot?.accessible === true || aggregate,
            snapshotSafe: slot?.snapshotSafe === true,
            rendered:
              typeof d.value === "string" ? Math.min(512, rendered.split(d.value).length - 1) : 0,
            snapshot:
              typeof d.value === "string" ? Math.min(512, snapshot.split(d.value).length - 1) : 0,
          };
        }),
      });
    const token = Object.freeze({});
    privacy78Contexts.set(token, channels);
    return token;
  } finally {
    await finalSeal?.dispose().catch(() => {});
    await seal.dispose().catch(() => {});
  }
}

// Pure relation check. Only the private observer/page owner below can seal live evidence.
export function validateC8CurrentWire(item, wire) {
  try {
    if (
      !privateCases(C8_AUDIT_SCOPE).some(
        (c) => caseKey(c) === caseKey(item) && c.path === item.path,
      )
    )
      return false;
    const b = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings;
    const recovered = b.competencies.find((c) => item.path.includes(c.id));
    const id = recovered?.id ?? SYNTHETIC_FIXTURE.competence;
    const month = recovered?.month ?? "2026-11-01";
    const owned = (c) =>
      c?.id === id &&
      c.id_organizacao === b.organization &&
      c.id_contrato === b.contract &&
      c.competencia_referencia === month;
    if (item.surface === "V111")
      return (
        Array.isArray(wire.documents) &&
        wire.documents.length === 1 &&
        wire.documents[0].id === SYNTHETIC_FIXTURE.document &&
        wire.documents[0].id_contrato === b.contract
      );
    if (["V116", "V117"].includes(item.surface)) {
      const a = wire.analysis;
      // V116 keeps the original November draft, proved empty in the preserved
      // authenticated baseline. Only the October V117 requires completed execution.
      if (item.surface === "V116" && !recovered)
        return (
          a?.schema_versao === "v116-v1" &&
          owned(a.competencia) &&
          a.competencia.situacao === "rascunho" &&
          a.stale === false &&
          a.estado_analise === "not_analyzed" &&
          a.execucao_atual === null &&
          a.percentual === 0 &&
          a.blocking_summary?.total === 0 &&
          a.blocking_summary.liberado === false &&
          ["resultados", "execucoes", "apontamentos"].every(
            (k) => Array.isArray(a[k]) && a[k].length === 0,
          )
        );
      if (
        a?.schema_versao !== "v116-v1" ||
        !owned(a.competencia) ||
        a.stale !== false ||
        a.estado_analise !== "complete" ||
        a.execucao_atual?.status !== "concluida" ||
        (recovered && a.execucao_atual.id !== recovered.executionId)
      )
        return false;
      if (item.surface === "V117") {
        const d = wire.detail;
        if (
          d?.schema_versao !== "v117-v1" ||
          !owned(d.competencia) ||
          d.requisito?.id !== recovered.requirementId ||
          d.requisito.codigo !== "AUD-A-TXT-001" ||
          d.requisito.origem_tipo !== "item_lista" ||
          d.requisito.origem_id !== b.itemId ||
          d.execucao_atual?.id !== recovered.executionId
        )
          return false;
      }
      return true;
    }
    const view = item.surface === "V115" ? wire.documents : wire.overview;
    if (!owned(view?.competencia)) return false;
    if (item.surface === "V119")
      return (
        view.competencia.situacao === recovered.state &&
        view.allowed_actions?.apresentar === true &&
        view.blocking_summary?.aprovacao_apresentacao_atual === true
      );
    if (item.surface === "V120") {
      const [ap] = wire.presentations ?? [],
        [pkg] = wire.packages ?? [],
        [entry] = wire.items ?? [];
      const sameOwner = (row) =>
        row?.id_organizacao === b.organization &&
        row.id_contrato === b.contract &&
        row.id_competencia === id;
      return (
        view.competencia.situacao === recovered.state &&
        wire.presentations.length === 1 &&
        wire.packages.length === 1 &&
        wire.items.length === 1 &&
        [ap, pkg, entry].every(sameOwner) &&
        ap.id === recovered.presentationId &&
        ap.id_pacote === recovered.packageId &&
        pkg.id === recovered.packageId &&
        pkg.hash_pacote === recovered.packageHash &&
        pkg.status === R18_REGISTRATION_CANDIDATE.packageStatus &&
        pkg.numero === R18_REGISTRATION_CANDIDATE.packageNumber &&
        Number.isFinite(Date.parse(pkg.congelado_em)) &&
        ap.protocolo === R18_REGISTRATION_CANDIDATE.protocol &&
        ap.forma_apresentacao === R18_REGISTRATION_CANDIDATE.presentationMethod &&
        entry.ordem === 1 &&
        typeof entry.entidade_tipo === "string" &&
        entry.entidade_tipo.length > 0 &&
        /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(entry.entidade_id) &&
        (entry.versao_id === null ||
          /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(entry.versao_id)) &&
        entry.id_pacote === pkg.id &&
        /^[a-f0-9]{64}$/.test(entry.hash)
      );
    }
    if (item.surface === "V118")
      return (
        Array.isArray(wire.opinions) &&
        wire.opinions.length <= 25 &&
        wire.opinions.every(
          (p) =>
            p.id_competencia === id &&
            p.id_organizacao === b.organization &&
            p.id_contrato === b.contract,
        )
      );
    return ["V114", "V115"].includes(item.surface);
  } catch {
    return false;
  }
}

async function collectC8CurrentWire(page, item, state) {
  if (
    !isC8Scope(state?.scope) ||
    !state.verified ||
    state.closed ||
    page.url() !== HML_ORIGIN + item.path ||
    !state.c8Observer
  )
    fail("C8_CURRENT_OWNER");
  const owner = state,
    generation = state.generation,
    observer = state.c8Observer;
  const b = JSON.parse(C8_RECOVERY_DOCUMENT.reportRaw).bindings;
  const c = b.competencies.find((c) => item.path.includes(c.id));
  const id = c?.id ?? SYNTHETIC_FIXTURE.competence;
  const wire = {};
  if (item.surface === "V111")
    wire.documents = await observer.read("documentos_contrato", { id: SYNTHETIC_FIXTURE.document });
  else if (["V116", "V117"].includes(item.surface)) {
    wire.analysis = await observer.rpcRead("obter_analise_competencia_v116", {
      p_id_competencia: id,
    });
    if (item.surface === "V117") {
      wire.detail = await observer.rpcRead("obter_detalhe_requisito_v117", {
        p_id_competencia: id,
        p_id_requisito: c.requirementId,
      });
    }
  } else if (item.surface === "V115")
    wire.documents = await observer.rpcRead("obter_documentos_competencia_v115", {
      p_id_competencia: id,
    });
  else {
    wire.overview = await observer.rpcRead("obter_visao_geral_competencia", {
      p_id_competencia: id,
    });
    if (item.surface === "V118")
      wire.opinions = await observer.read("pareceres_internos", { id_competencia: id });
    if (item.surface === "V120") {
      wire.presentations = await observer.read("apresentacoes_contratante", {
        id: c.presentationId,
      });
      wire.packages = await observer.read("pacotes_competencia", { id: c.packageId });
      wire.items = await observer.read("itens_pacote_competencia", { id_pacote: c.packageId });
    }
  }
  await observer.flush();
  if (
    privacy78Pages.get(page) !== owner ||
    state.generation !== generation ||
    state.closed ||
    page.url() !== HML_ORIGIN + item.path ||
    observer.observationFailure() ||
    !validateC8CurrentWire(item, wire)
  )
    fail("C8_CURRENT_BINDING");
  state.c8Current = { owner, generation, observer, item, wire };
  return wire;
}

export function c8DrawerFocusValid() {
  const openers = document.querySelectorAll('button[aria-label="Abrir requisito AUD-A-TXT-001"]');
  return openers.length === 1 && document.activeElement === openers[0];
}

export async function openC8RequirementDrawer(page, item, scope) {
  if (
    !isC8Scope(auditScope(scope)) ||
    item?.surface !== "V117" ||
    !privateCases(scope).some((c) => caseKey(c) === caseKey(item) && c.path === item.path) ||
    page.url() !== HML_ORIGIN + item.path
  )
    fail("C8_DRAWER_BINDING");
  const opener = page.getByRole("button", { name: "Abrir requisito AUD-A-TXT-001", exact: true });
  if ((await opener.count()) !== 1) fail("C8_DRAWER_BINDING");
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Detalhe do requisito", exact: true });
  await dialog.waitFor({ state: "visible" });
  await dialog.evaluate(async (node) =>
    Promise.all(
      node
        .getAnimations()
        .filter((a) => Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => a.finished.catch(() => {})),
    ),
  );
  return async () => {
    if (page.url() !== HML_ORIGIN + item.path) fail("C8_DRAWER_BINDING");
    await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.waitForFunction(c8DrawerFocusValid, null, { timeout: 15000 });
    if (!(await opener.evaluate((node) => document.activeElement === node)))
      fail("C8_DRAWER_FOCUS");
    return true;
  };
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
export async function closeAuditMobileMenu(page) {
  const dialog = page.getByRole("dialog", { name: "Menu de navegação", exact: true });
  if ((await dialog.count()) === 1) {
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
  }
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
    return {
      passed,
      mode: "DESKTOP",
      screenshot: image.file,
      sha256: image.sha,
      visualCapture: image.visualCapture,
    };
  }
  const open = page.getByRole("button", { name: "Abrir menu", exact: true });
  await open.click();
  let primaryError;
  try {
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
      visualCapture: image.visualCapture,
    };
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await closeAuditMobileMenu(page);
    } catch (error) {
      if (!primaryError) throw error;
    }
  }
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
    V117: /^Análise da competência$/,
    V118: /^Parecer interno$/,
    V119: /^Wizard de apresentação$/,
    V120: /^Apresentação e protocolo$/,
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
  const regions = {
    V117: ["Requisito", "Fonte e versionamento", "Resultado de referência", "Evidências"],
    V119: ["Revisão de prontidão", "Etapa 2 de 2 — Registrar apresentação"],
    V120: ["Dados da apresentação", "Pacote imutável", "Itens preservados no pacote"],
  };
  if (regions[surface]?.some((name) => !observation.regionNames?.includes(name))) return false;
  if (
    surface === "V117" &&
    (observation.dialogVisible !== true ||
      observation.dialogNames?.length !== 1 ||
      observation.dialogNames[0] !== "Detalhe do requisito")
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
          passed: 8,
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
  // Diagnostic inspection cannot authorize navigation. The ordinary drain stays strict.
  try {
    await fence?.drain();
  } catch {}
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
    "FENCE_REQUEST_LIFECYCLE",
    "FENCE_DRAIN_TIMEOUT",
    "FENCE_LIFECYCLE_NO_NETWORK",
    "FENCE_LIFECYCLE_TERMINAL",
    "FENCE_LIFECYCLE_FRAME",
    "FENCE_LIFECYCLE_TYPE",
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
    lifecycleMetadata: safeLifecycleMetadata(input.fence?.lifecycleMetadata),
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
    "canceledInitialRequests",
    "activeNetworkRequests",
    "pendingNetworkAssociations",
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

export const R15_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.recovery-r15.v1",
  workflowRun: "42703523206",
  artifactId: "13713326447",
  requestId: "trilha-a-fixtures-20261109-r15",
  harnessSha: "dd895a5c30acbb39c821153d86477985ae94b939",
  zipSha256: "49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262",
  reportSha256: "038d291631f6d0badc89c014cbfbb137557a780039fb16b8d5c1fc9e53dee3c6",
  receiptsSha256: "3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007",
  observationSha256: "fc97c8e25c55840331737b307680f9846b11f0b2e455a04154230a99b455a614",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "OBSERVATION_FAILED",\n  "diagnostics": {\n    "primaryFailure": "OBSERVATION_FAILED",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "RUNTIME_FRESH",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_COMMAND",\n      "RUNTIME_FRESH",\n      "UI_CONFIRM_FENCE",\n      "RUNTIME_FRESH"\n    ],\n    "lastCompletedSubphase": "RUNTIME_FRESH",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 12,\n    "frozen": true,\n    "pending": true,\n    "sent": true,\n    "priorConfirmed": 10,\n    "priorReserved": 1,\n    "newArmedCount": 1,\n    "maxIntentions": 24,\n    "maxNewIntentions": 13\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 13,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42703523206",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42703523206",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "6e6b6afb-2216-42ef-bd89-571301e97e1f",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42703523206",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "6e6b6afb-2216-42ef-bd89-571301e97e1f",\n      "state": "uncertain",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3"\n    }\n  ]\n}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "dd895a5c30acbb39c821153d86477985ae94b939",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42703523206",\n  "firstFailure": {\n    "contractKind": "RPC:aprovar_parecer_interno",\n    "stage": "RESPONSE_PROJECTION",\n    "statusHTTP": "NONE",\n    "requestFailure": "NONE"\n  }\n}\n',
});

export function validateR15RecoveryDocument(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R15_LEDGER");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null)) fail("RECOVERY_R15_LEDGER");
  const names = Object.keys(R15_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((k, i) => k !== names[i]))
    fail("RECOVERY_R15_LEDGER");
  for (const k of names) {
    const d = ds[k];
    if (!d || !Object.hasOwn(d, "value") || !d.enumerable || d.value !== R15_RECOVERY_DOCUMENT[k])
      fail("RECOVERY_R15_LEDGER");
    clean[k] = d.value;
  }
  const raw = JSON.stringify(clean, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 6244 ||
    digest(raw) !== "de792c8803bbe232871c9eac468ad8baede31a88b1ec5aa238647a15267b645a"
  )
    fail("RECOVERY_R15_LEDGER");
  for (const [r, h, n] of [
    ["reportRaw", "reportSha256", 3364],
    ["receiptsRaw", "receiptsSha256", 1299],
    ["observationRaw", "observationSha256", 423],
  ])
    if (Buffer.byteLength(clean[r]) !== n || digest(clean[r]) !== clean[h])
      fail("RECOVERY_R15_LEDGER");
  return Object.freeze(clean);
}

export const R16_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.recovery-r16.v1",
  workflowRun: "42713640896",
  artifactId: "13717457216",
  requestId: "trilha-a-fixtures-20261109-r16",
  harnessSha: "10cac45b655d5eece9881fdf83545887c371d548",
  zipSha256: "39eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305",
  reportSha256: "f93d7b7a5dd9ffc7a65a13a52b399be61830113528af1bc081ed5a83f37938b2",
  receiptsSha256: "3700fce7ae66a58fa7f3c9d1a30d11f10eda794d41c0a1ff2e4302ca9645e4b6",
  observationSha256: "3a270be6970c5e46168c33d53b2ea245ab722cd954713e1f9dd9d312c796fcb8",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "COMPETENCE_PRESENTATION_GATE",\n  "diagnostics": {\n    "primaryFailure": "COMPETENCE_PRESENTATION_GATE",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "COMPETENCY_UI",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI"\n    ],\n    "lastCompletedSubphase": "COMPETENCY_RECONCILE",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 16,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 10,\n    "priorReserved": 2,\n    "newArmedCount": 4,\n    "maxIntentions": 24,\n    "maxNewIntentions": 12\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 12,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "partial",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "opinionId": "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd",\n        "code": "COMPETENCE_PRESENTATION_GATE"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "id": "79bdc139-ed10-4c91-905e-b32b9a824d27",\n        "requirementId": "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n        "documentId": "cd1624d3-73f7-4ea1-b317-c52627df6824",\n        "executionId": "00da4236-810f-4a89-8be5-b2ffcd50a480",\n        "opinionId": "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f",\n        "code": "COMPETENCE_PRESENTATION_GATE"\n      }\n    ]\n  },\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42713640896",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n    "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd",\n    "79bdc139-ed10-4c91-905e-b32b9a824d27",\n    "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n    "cd1624d3-73f7-4ea1-b317-c52627df6824",\n    "00da4236-810f-4a89-8be5-b2ffcd50a480",\n    "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "d69325a4-78c8-4bf3-8831-cbef2fb38d95",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "criar_documento_competencia_v115",\n      "requestId": "d69325a4-78c8-4bf3-8831-cbef2fb38d95",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "bc014b4bd5693718652f9bbf7a6fadb520b290bfcf1ebd74de89e34f4b2d6f7d"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "368de7ea-0056-451a-b0da-30ee0e10ee62",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_analise_competencia",\n      "requestId": "368de7ea-0056-451a-b0da-30ee0e10ee62",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0b6cb627d1480ae9c05ecc5cc0012b2ee3f9acd69ff35ae6b6f0650aa31a0765"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "57cde7b2-3ae8-4642-81fe-d45f4971a524",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "solicitar_parecer_interno",\n      "requestId": "57cde7b2-3ae8-4642-81fe-d45f4971a524",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "4dd745f43f7171efcea9b9ca3b4d291c3a6a43d6ce8946f37e4de8d03ba9df0f"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "fb2af693-ede5-4d1a-99d3-408a2f7cb79e",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42713640896",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_parecer_interno",\n      "requestId": "fb2af693-ede5-4d1a-99d3-408a2f7cb79e",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "0d4db222d459ac1a6956c650b19179dab57fcbd0dca043f42aee646077cfe395"\n    }\n  ]\n}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "10cac45b655d5eece9881fdf83545887c371d548",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42713640896",\n  "firstFailure": null\n}\n',
});
export function validateR16RecoveryDocument(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R16_LEDGER");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null)) fail("RECOVERY_R16_LEDGER");
  const names = Object.keys(R16_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((k, i) => k !== names[i]))
    fail("RECOVERY_R16_LEDGER");
  for (const k of names) {
    const d = ds[k];
    if (!d || !Object.hasOwn(d, "value") || !d.enumerable || d.value !== R16_RECOVERY_DOCUMENT[k])
      fail("RECOVERY_R16_LEDGER");
    clean[k] = d.value;
  }
  const raw = JSON.stringify(clean, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 10749 ||
    digest(raw) !== "f5427aa65d4ab75637df290b72b6a8c07a5a7ce30f1b2dc5a4328720133bdd86"
  )
    fail("RECOVERY_R16_LEDGER");
  for (const [r, h, n] of [
    ["reportRaw", "reportSha256", 3922],
    ["receiptsRaw", "receiptsSha256", 5032],
    ["observationRaw", "observationSha256", 280],
  ])
    if (Buffer.byteLength(clean[r]) !== n || digest(clean[r]) !== clean[h])
      fail("RECOVERY_R16_LEDGER");
  return Object.freeze(clean);
}

export const R17_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.recovery-r17.v1",
  workflowRun: "42724239916",
  artifactId: "13722355410",
  requestId: "trilha-a-fixtures-20261109-r17",
  harnessSha: "adaeb72504cadf6dd83b8938abba9c067acba525",
  zipSha256: "438158228c2c8f3ad4893574cda06d62f9c47393202e200274a693ad420cc6ff",
  reportSha256: "8565ec68be1b94344ecaaa3ac2688076587ba446d4c0f3acbdf5cf34aa73c594",
  receiptsSha256: "bed517a5a27f72f23dc07f869a1d4de21f1f24582fc4c725e9f747d8e603d82a",
  observationSha256: "9d6bb4c7de28c4f2dd8563d775d7618deb52e1b96b6fdbfea2b9f0f7defa5f6a",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "PREPARER_SPA_LINK",\n  "diagnostics": {\n    "primaryFailure": "PREPARER_SPA_LINK",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "COMPETENCY_UI",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI",\n      "COMPETENCY_UI"\n    ],\n    "lastCompletedSubphase": "PREFLIGHT",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 17,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 14,\n    "priorReserved": 2,\n    "newArmedCount": 1,\n    "maxIntentions": 24,\n    "maxNewIntentions": 8\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 14,\n    "maxNewIntentions": 8,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "pode_apresentar_contratante",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "opinionId": "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42724239916",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n    "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42724239916",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "5d657667-4c3b-4b4f-a953-d7e778bfb2c1",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42724239916",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "5d657667-4c3b-4b4f-a953-d7e778bfb2c1",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2"\n    }\n  ]\n}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "adaeb72504cadf6dd83b8938abba9c067acba525",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42724239916",\n  "firstFailure": null\n}\n',
});

export function validateR17RecoveryDocument(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R17_LEDGER");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null)) fail("RECOVERY_R17_LEDGER");
  const names = Object.keys(R17_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((k, i) => k !== names[i]))
    fail("RECOVERY_R17_LEDGER");
  for (const k of names) {
    const d = ds[k];
    if (!d || !Object.hasOwn(d, "value") || !d.enumerable || d.value !== R17_RECOVERY_DOCUMENT[k])
      fail("RECOVERY_R17_LEDGER");
    clean[k] = d.value;
  }
  const raw = JSON.stringify(clean, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 6088 ||
    digest(raw) !== "f3cf2c1eae15d5e7185ff665a8899f14898ed4b8b7188b5446646e7f2f0f1c95"
  )
    fail("RECOVERY_R17_LEDGER");
  for (const [r, h, n] of [
    ["reportRaw", "reportSha256", 3381],
    ["receiptsRaw", "receiptsSha256", 1293],
    ["observationRaw", "observationSha256", 280],
  ])
    if (Buffer.byteLength(clean[r]) !== n || digest(clean[r]) !== clean[h])
      fail("RECOVERY_R17_LEDGER");

  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw),
    observation = JSON.parse(clean.observationRaw),
    ledger = report.intentLedger,
    rows = receipts.receipts;
  if (
    Object.keys(report).length !== 15 ||
    Object.keys(report.diagnostics).length !== 9 ||
    Object.keys(ledger).length !== 9 ||
    Object.keys(report.recovery).length !== 10 ||
    Object.keys(observation).length !== 6 ||
    report.failure !== "PREPARER_SPA_LINK" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    ledger.count !== 17 ||
    ledger.priorConfirmed !== 14 ||
    ledger.priorReserved !== 2 ||
    ledger.newArmedCount !== 1 ||
    ledger.maxIntentions !== 24 ||
    ledger.maxNewIntentions !== 8 ||
    ledger.frozen !== false ||
    ledger.pending !== false ||
    ledger.sent !== false ||
    report.recovery.confirmedBefore !== 14 ||
    report.recovery.maxNewIntentions !== 8 ||
    report.harnessSha !== clean.harnessSha ||
    report.workflowRun !== clean.workflowRun ||
    observation.firstFailure !== null ||
    !Array.isArray(rows) ||
    rows.length !== 2 ||
    rows[0].state !== "sealed" ||
    rows[1].state !== "confirmed" ||
    rows.some(
      (row) =>
        row.rpc !== "aprovar_apresentacao" ||
        row.requestId !== "5d657667-4c3b-4b4f-a953-d7e778bfb2c1" ||
        row.payloadSha256 !== "1e2bc45826f48745d7800fa108c8be6331d33737e2317c710638e1c568b99cc2",
    ) ||
    report.bindings.competencies[0].id !== "50c26274-a36f-48e0-b2fe-5a1caf5d6a49" ||
    report.bindings.competencies[0].state !== "pode_apresentar_contratante"
  )
    fail("RECOVERY_R17_LEDGER");
  return Object.freeze(clean);
}

export const R18_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.recovery-r18.v1",
  workflowRun: "42731273678",
  artifactId: "13725830880",
  requestId: "trilha-a-fixtures-20261110-r18",
  harnessSha: "8d055951838fee29664563bed5ee26bac4f55bd8",
  zipSha256: "b68f2edd99a4ce6e4728b74a899cd39bb1ec96f0ecd42048cbbdbbc6d47fb7eb",
  reportSha256: "c3ef3286f2e49d17226f4b747188a6959b9dcc11997a3cae251cbd0d7dac4590",
  receiptsSha256: "1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77",
  observationSha256: "f03ea467e40803a792ac4606e35e8f15de5d2fd5746d72428eb732509c57662f",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "PHASE_TIMEOUT",\n  "diagnostics": {\n    "primaryFailure": "PHASE_TIMEOUT",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "COMPETENCY_GET",\n    "subphasePath": [\n      "COMPETENCIES",\n      "COMPETENCY_UI",\n      "COMPETENCY_RECONCILE",\n      "COMPETENCY_GET"\n    ],\n    "lastCompletedSubphase": "COMPETENCY_UI",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 19,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 15,\n    "priorReserved": 2,\n    "newArmedCount": 2,\n    "maxIntentions": 24,\n    "maxNewIntentions": 7\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 15,\n    "maxNewIntentions": 7,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": {\n    "sourceVersionId": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "listId": "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "listVersionId": "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "itemId": "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "source": "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "competencies": [\n      {\n        "month": "2026-10-01",\n        "state": "pode_apresentar_contratante",\n        "id": "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n        "requirementId": "75938450-a972-410c-8612-da3ef7dc0e00",\n        "documentId": "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n        "executionId": "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n        "opinionId": "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd"\n      },\n      {\n        "month": "2026-09-01",\n        "state": "partial",\n        "id": "79bdc139-ed10-4c91-905e-b32b9a824d27",\n        "requirementId": "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n        "documentId": "cd1624d3-73f7-4ea1-b317-c52627df6824",\n        "executionId": "00da4236-810f-4a89-8be5-b2ffcd50a480",\n        "opinionId": "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f",\n        "code": "COMPETENCE_DEPENDENCY_BLOCKED"\n      }\n    ]\n  },\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42731273678",\n  "phase": "FINAL_READBACK",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [\n    "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "bf71906b-87a4-42f5-8371-5f597ef2ad9b",\n    "e49ef6dd-13b0-491d-8646-5a7bcd5298cf",\n    "e7065876-a620-4dbb-9b4e-992fa4fead83",\n    "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n    "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n    "8b942e46-a29b-40d9-8ad4-04aaf9124a34",\n    "50c26274-a36f-48e0-b2fe-5a1caf5d6a49",\n    "75938450-a972-410c-8612-da3ef7dc0e00",\n    "c7f56ac9-81d6-45a4-81f8-db1383006c41",\n    "3c174678-a6ec-4415-9d25-6e8a859de2cb",\n    "9ec80151-bbf6-4469-9cd8-7d96d1bb02cd",\n    "79bdc139-ed10-4c91-905e-b32b9a824d27",\n    "c824a6f9-e519-44cc-8911-87d1009e2eaf",\n    "cd1624d3-73f7-4ea1-b317-c52627df6824",\n    "00da4236-810f-4a89-8be5-b2ffcd50a480",\n    "7bbbe81e-e34c-44dc-a76f-ed85fd56d87f"\n  ],\n  "v1Certified": false\n}\n',
  receiptsRaw:
    '{\n  "schema": "contaos.fixture.receipts.v1",\n  "receipts": [\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "dd8e544b-af5b-4e23-bef2-b7c9ae2d0096",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "aprovar_apresentacao",\n      "requestId": "dd8e544b-af5b-4e23-bef2-b7c9ae2d0096",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_apresentacao",\n      "requestId": "40546f93-f8f4-4686-a78a-11aa3069eda7",\n      "state": "sealed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a"\n    },\n    {\n      "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n      "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n      "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n      "workflowRun": "42731273678",\n      "schema": "contaos.fixture.intent.v1",\n      "rpc": "registrar_apresentacao",\n      "requestId": "40546f93-f8f4-4686-a78a-11aa3069eda7",\n      "state": "confirmed",\n      "organization": "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",\n      "contract": "be89ef7e-d839-46c0-9cfb-4da81edf8b74",\n      "payloadSha256": "1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a"\n    }\n  ]\n}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "8d055951838fee29664563bed5ee26bac4f55bd8",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42731273678",\n  "firstFailure": null\n}\n',
});

export function validateR18RecoveryDocument(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R18_LEDGER");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null)) fail("RECOVERY_R18_LEDGER");
  const names = Object.keys(R18_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((k, i) => k !== names[i]))
    fail("RECOVERY_R18_LEDGER");
  for (const k of names) {
    const d = ds[k];
    if (!d || !Object.hasOwn(d, "value") || !d.enumerable || d.value !== R18_RECOVERY_DOCUMENT[k])
      fail("RECOVERY_R18_LEDGER");
    clean[k] = d.value;
  }
  const raw = JSON.stringify(clean, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 8003 ||
    digest(raw) !== "de5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac"
  )
    fail("RECOVERY_R18_LEDGER");
  for (const [r, h, n] of [
    ["reportRaw", "reportSha256", 3911],
    ["receiptsRaw", "receiptsSha256", 2524],
    ["observationRaw", "observationSha256", 280],
  ])
    if (Buffer.byteLength(clean[r]) !== n || digest(clean[r]) !== clean[h])
      fail("RECOVERY_R18_LEDGER");

  const report = JSON.parse(clean.reportRaw),
    receipts = JSON.parse(clean.receiptsRaw),
    observation = JSON.parse(clean.observationRaw),
    ledger = report.intentLedger,
    rows = receipts.receipts;
  if (
    Object.keys(report).length !== 15 ||
    Object.keys(report.diagnostics).length !== 9 ||
    Object.keys(ledger).length !== 9 ||
    Object.keys(report.recovery).length !== 10 ||
    Object.keys(observation).length !== 6 ||
    report.failure !== "PHASE_TIMEOUT" ||
    report.completed !== false ||
    report.logoutVerified !== true ||
    report.diagnostics.cleanupFailure !== null ||
    ledger.count !== 19 ||
    ledger.priorConfirmed !== 15 ||
    ledger.priorReserved !== 2 ||
    ledger.newArmedCount !== 2 ||
    ledger.maxIntentions !== 24 ||
    ledger.maxNewIntentions !== 7 ||
    ledger.frozen !== false ||
    ledger.pending !== false ||
    ledger.sent !== false ||
    report.recovery.confirmedBefore !== 15 ||
    report.recovery.maxNewIntentions !== 7 ||
    report.harnessSha !== clean.harnessSha ||
    report.workflowRun !== clean.workflowRun ||
    observation.firstFailure !== null ||
    !Array.isArray(rows) ||
    rows.length !== 4 ||
    rows.some((row, i) => {
      const expected = [
        [
          "aprovar_apresentacao",
          "dd8e544b-af5b-4e23-bef2-b7c9ae2d0096",
          "1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976",
        ],
        [
          "registrar_apresentacao",
          "40546f93-f8f4-4686-a78a-11aa3069eda7",
          "1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a",
        ],
      ][Math.floor(i / 2)];
      return (
        row.rpc !== expected[0] ||
        row.requestId !== expected[1] ||
        row.payloadSha256 !== expected[2] ||
        row.state !== ["sealed", "confirmed"][i % 2]
      );
    }) ||
    report.bindings.competencies[0].id !== "50c26274-a36f-48e0-b2fe-5a1caf5d6a49" ||
    report.bindings.competencies[0].state !== "pode_apresentar_contratante"
  )
    fail("RECOVERY_R18_LEDGER");
  return Object.freeze(clean);
}

export const R18_REGISTRATION_CANDIDATE = Object.freeze({
  schema: "contaos.fixture.registration-candidate-r18.v1",
  provenance: "ADMIN_LOOKUP_NOT_JWT_UI_PROOF",
  projectId: "gklhhhyosgasnyoxlrui",
  frontendSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
  deploymentId: "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
  organization: "e87f7e68-c5ae-4077-943b-02a4afd8b6ee",
  contract: "be89ef7e-d839-46c0-9cfb-4da81edf8b74",
  month: "2026-09-01",
  competencyId: "79bdc139-ed10-4c91-905e-b32b9a824d27",
  presentationId: "eb6d5b1c-8b64-418b-aa82-bf1f29d41768",
  packageId: "f29715a6-0664-415a-8903-68be9d7c5d66",
  packageHash: "82e0dc9adfbbce6956f87dfe8b78230f71eb9d7e4399571f86210c0f1c6e5c81",
  packageNumber: 1,
  packageStatus: "apresentado",
  packageFrozen: true,
  packageItems: 1,
  protocol: "HML-TRILHA-A-20261108",
  presentationMethod: "Ensaio sintético em homologação.",
  sourceCheckpoint: "contaos999999/develop#138:6756125670",
});
export function validateR18RegistrationCandidate(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R18_BINDING");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null))
    fail("RECOVERY_R18_BINDING");
  const names = Object.keys(R18_REGISTRATION_CANDIDATE),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((key, i) => key !== names[i]))
    fail("RECOVERY_R18_BINDING");
  for (const key of names) {
    const d = ds[key];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      !d.enumerable ||
      d.value !== R18_REGISTRATION_CANDIDATE[key]
    )
      fail("RECOVERY_R18_BINDING");
    clean[key] = d.value;
  }
  return Object.freeze(clean);
}

export const R13_RECOVERY_DOCUMENT = Object.freeze({
  schema: "contaos.fixture.recovery-r13.v1",
  workflowRun: "42685547737",
  artifactId: "13704636643",
  requestId: "trilha-a-fixtures-20261109-r13",
  harnessSha: "f39e32ca1009b23aaae19dcbd01e282df2bf0847",
  zipSha256: "7d097d83d5b622d4277be39d2155800223e18fccfe9258ba1adabf337c1e5307",
  reportSha256: "877dca165c4d46a61b8f5ea1946a6a223ceb17e9b64b9ef4067d8e24d5b7aa81",
  receiptsSha256: "fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf",
  observationSha256: "f6f4ea8b51e4ec9ab3e8aca8e4fb6c3367d808174e884ca4c6119d6a06c33aeb",
  reportRaw:
    '{\n  "schema": "contaos.fixture.preparation.v1",\n  "failure": "FLOW_LIST_UI_MISSING",\n  "diagnostics": {\n    "primaryFailure": "FLOW_LIST_UI_MISSING",\n    "failureClass": "PROTOCOL",\n    "errorName": "Error",\n    "subphase": "LIST_UI_CONTROL",\n    "subphasePath": [\n      "SOURCE_AND_LIST",\n      "LIST_UI_CONTROL",\n      "LIST_UI_CONTROL"\n    ],\n    "lastCompletedSubphase": "LIST_GET",\n    "logoutAttempted": true,\n    "logoutVerified": true,\n    "cleanupFailure": null\n  },\n  "intentLedger": {\n    "count": 11,\n    "frozen": false,\n    "pending": false,\n    "sent": false,\n    "priorConfirmed": 10,\n    "priorReserved": 1,\n    "newArmedCount": 0,\n    "maxIntentions": 24,\n    "maxNewIntentions": 13\n  },\n  "recovery": {\n    "ledgerSha256": "381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9",\n    "priorWorkflowRun": "42540864527",\n    "confirmedBefore": 10,\n    "maxNewIntentions": 13,\n    "r3ReceiptsSha256": "28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364",\n    "r3WorkflowRun": "42559214436",\n    "r4ZeroAuth": {\n      "schema": "contaos.fixture.recovery-r4.v1",\n      "headSha": "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",\n      "upstreamRun": 42568309807,\n      "fixturesRun": 42568382053,\n      "auditRun": 42568382029,\n      "attempt": 1,\n      "derivedNewBusinessIntents": 0,\n      "proof": "GITHUB_ACTIONS_LIVE_METADATA"\n    },\n    "reconciled": true,\n    "sourceVersion": "1ebbfd0b-c50c-405d-8806-321f18e179e0",\n    "sourceHash": "d8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1"\n  },\n  "bindings": null,\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "f39e32ca1009b23aaae19dcbd01e282df2bf0847",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42685547737",\n  "phase": "SOURCE_AND_LIST",\n  "completed": false,\n  "logoutVerified": true,\n  "ids": [],\n  "v1Certified": false\n}\n',
  receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}\n',
  observationRaw:
    '{\n  "schema": "contaos.fixture.observation.v1",\n  "frontendSha": "0024b3c6739ab6296ec12338f11cf792d3a5f84b",\n  "harnessSha": "f39e32ca1009b23aaae19dcbd01e282df2bf0847",\n  "deploymentId": "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",\n  "workflowRun": "42685547737",\n  "firstFailure": null\n}\n',
});
export function validateR13RecoveryDocument(input) {
  if (isProxy(input) || !input || typeof input !== "object" || Array.isArray(input))
    fail("RECOVERY_R13_LEDGER");
  const proto = Object.getPrototypeOf(input);
  if (isProxy(proto) || (proto !== Object.prototype && proto !== null)) fail("RECOVERY_R13_LEDGER");
  const names = Object.keys(R13_RECOVERY_DOCUMENT),
    ds = Object.getOwnPropertyDescriptors(input),
    own = Reflect.ownKeys(ds),
    clean = {};
  if (own.length !== names.length || own.some((k, i) => k !== names[i]))
    fail("RECOVERY_R13_LEDGER");
  for (const k of names) {
    const d = ds[k];
    if (!d || !Object.hasOwn(d, "value") || !d.enumerable || d.value !== R13_RECOVERY_DOCUMENT[k])
      fail("RECOVERY_R13_LEDGER");
    clean[k] = d.value;
  }
  const raw = JSON.stringify(clean, null, 2) + "\n";
  if (
    Buffer.byteLength(raw) !== 3108 ||
    digest(raw) !== "92bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9"
  )
    fail("RECOVERY_R13_LEDGER");
  for (const [rawKey, hashKey, bytes] of [
    ["reportRaw", "reportSha256", 1891],
    ["receiptsRaw", "receiptsSha256", 55],
    ["observationRaw", "observationSha256", 280],
  ])
    if (Buffer.byteLength(clean[rawKey]) !== bytes || digest(clean[rawKey]) !== clean[hashKey])
      fail("RECOVERY_R13_LEDGER");
  const r = JSON.parse(clean.reportRaw),
    e = JSON.parse(clean.receiptsRaw),
    o = JSON.parse(clean.observationRaw);
  if (
    r.failure !== "FLOW_LIST_UI_MISSING" ||
    r.completed !== false ||
    r.bindings !== null ||
    r.ids.length !== 0 ||
    r.logoutVerified !== true ||
    r.diagnostics.cleanupFailure !== null ||
    r.intentLedger.count !== 11 ||
    r.intentLedger.priorConfirmed !== 10 ||
    r.intentLedger.priorReserved !== 1 ||
    r.intentLedger.newArmedCount !== 0 ||
    r.intentLedger.maxNewIntentions !== 13 ||
    r.intentLedger.frozen !== false ||
    r.intentLedger.pending !== false ||
    r.intentLedger.sent !== false ||
    e.receipts.length !== 0 ||
    o.firstFailure !== null
  )
    fail("RECOVERY_R13_LEDGER");
  return Object.freeze(clean);
}

// A request authorizes one selected operation, never a general workflow_run login.
export const SINGLE_REQUEST = Object.freeze({
  repository: "contaos999999/contaos-hml-control",
  path: "docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json",
  upstreamId: 406076025,
  upstreamPath: ".github/workflows/contaos-frontend-zero-drift.yml",
  upstreamName: "ContaOS Frontend Zero-Drift",
  gateSha: "31b68f3cadbdc13a82bae23a43c35616f873d70b",
  autoGateSha: "122242fd421b348aef229683c0d3969611bce1db",
  recoveryGateSha: "581e161718d7f784961e2fef6bd1a75ba9295637",
  metadataGateSha: "2704e63969880f81842102190ebc0337a3b9b551",
  observationGateSha: "01fc65e5ede32309fe544fce7852c24b6f2a1e72",
  competenceReadGateSha: "472eaa2221016375aee7c7698aa837358b6b6975",
  contextualProjectionGateSha: "0c82ccb9cb87c8226ad76af60d44a691eae24c8a",
  asynchronousOpinionGateSha: "c9dc5e062885793d3ad69430b822c14f3c6f2dc8",
  uiSecurityRecoveryGateSha: "83792d243982bda854d81d518dc41dbc5e54b90d",
  listReadinessSecuritySha: "8d43ae8f94b39d81b8125d087a1c9a968e2d8ad7",
  metadataTimeoutGateSha: "326a960cec756d08681b00da99a5332f0a3c6fac",
  metadataTimeoutPlanSha: "1282198bfc72ac4a119856139e6b95d9e14177dc",
  c8GateSha: "67ca0f0e441902e732b4bee8e4d50f6415d5f929",
  c8PlanSha: "afe42819e62bbe8e3c25b4a5869f8ba59db124f5",
  c8ReaderBuildSha: "501237dd48a7159ccd4a7d7407334cdc2245aa24",
  functionalNavigationGateSha: "c1b003bd9fd1e8909a2d1950e43984023206f1d3",
  functionalNavigationRepairGateSha: "079747a75e224996082e14c671864f68bb5e36ba",
  functionalNavigationVisualGateSha: "0f1b6bfe2757478b18855143f378bd364e80f136",
  functionalNavigationFocusGateSha: "3b33fd69dd005814a8c615a0af6bd0fea758ac6b",
  functionalNavigationR2PlanSha: "83279bf28172e974778c3e788b8bf5718e23d9c1",
  functionalNavigationR3PlanSha: "9030de4115041598bdc530e03c3c8a5c18d3a5ae",
  functionalNavigationR4PlanSha: "e01a208940d68a504d1c206e1b255eabe4938bb3",
  functionalNavigationR5PlanSha: "a377bb65db407252a32a0dad4f371e65a03b22c2",
  functionalNavigationR6PlanSha: "37369db9066e80f33280922c8c78b460208097ca",
  functionalNavigationR7PlanSha: "dbcec252851cd867655aaaabc8f2160993f8f46b",
  functionalNavigationR8PlanSha: "78a5f4b96fe756f96a43e53ab877d17145d986f2",
  spentAuditNonces: Object.freeze([
    "integracao-v1-fase2-nav-20261113-r7",
    "integracao-v1-fase2-nav-20261112-r6",
    "integracao-v1-fase2-nav-20261112-r5",
    "integracao-v1-fase2-nav-20261112-r4",
    "integracao-v1-fase2-nav-20261112-r3",
    "integracao-v1-fase2-nav-20261112-r2",
    "integracao-v1-fase2-nav-20261111-r1",
    "trilha-a-audit-20261108-r1",
    "trilha-c-audit-20261110-c8-r1",
    "trilha-c-audit-20261110-c8-r2",
    "trilha-c-audit-20261110-c8-r3",
    "trilha-c-audit-20261110-c8-r4",
    "trilha-c-audit-20261111-c8-r5",
    "trilha-c-audit-20261111-c8-r6",
    "trilha-c-audit-20261111-c8-r7",
    "trilha-c-audit-20261111-c8-r8",
  ]),
  r19RecoveryGateSha: "d51d3fcddf861fd127278ae5b20cd3e126d31f34",
  r19RecoveryPlanSha: "2b6ab4f542c66309fb16d12f9998136641591f25",
  r18ReaderBuildSha: "815dce2a4015e2bb1b5ec23e70633537ab008e62",
  r18RecoveryGateSha: "d27616f35bba7f6c2d56db8e010d5a9a41f17f3b",
  r18RecoveryPlanSha: "9f8b1bbe48fb10867294bee3b456d922065c7fa0",
  r17ReaderBuildSha: "e464837f11458766ec87770ec967e81b34222962",
  r17RecoveryGateSha: "5cc9b0af237131ed0191156c35aff458797006c8",
  r17RecoveryPlanSha: "fb634da1d9970dda1b8f9e7d3c9929092e6643e1",
  r16RecoveryBuildSha: "9084eaab56d7ffe74059eb19ab1f555ff58c4630",
  r15RecoveryGateSha: "f153c1a305d8a0e3a343397668e076929e25d5c4",
  void204BuildSha: "c3815b3eec1649ba13a7e633a261358e0c912e5b",
  void204GateSha: "8d5a40bf687bc7b5b0b6fe2404d5302f13ed8cfe",
  r13RecoveryGateSha: "d29b9dacc14da0921584e7fc9d47ad8e39e2f88e",
  listReadinessBuildSha: "c5a96ad40c7e4bec08738b5a7cfceaf3ddd0b399",
  r14PlanSha: "396857e5684e2dd00b697718d46b5710eefc72fc",
  canonicalProfileGateSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
  listSelectionGateSha: "18424c16bcdc6d035e91e2dc8b7257ea755097d0",
  navigationGateSha: "ffffc501e5b5665026ff847bca1d2bf6df17fa73",
  bootstrapGateSha: "a8f3da12dcfeca858904b60e1b32c50df73a7d4a",
  readbackGateSha: "cd79ed9012e644f2ef65636eb1c30049301b74a5",
  spentFixtureNonce: "trilha-a-fixtures-20261108-r1",
  spentFixtureNonces: Object.freeze([
    "trilha-a-fixtures-20261108-r1",
    "trilha-a-fixtures-20261109-r2",
    "trilha-a-fixtures-20261109-r3",
    "trilha-a-fixtures-20261109-r4",
    "trilha-a-fixtures-20261109-r5",
    "trilha-a-fixtures-20261109-r6",
    "trilha-a-fixtures-20261109-r7",
    "trilha-a-fixtures-20261109-r8",
    "trilha-a-fixtures-20261109-r9",
    "trilha-a-fixtures-20261109-r10",
    "trilha-a-fixtures-20261109-r11",
    "trilha-a-fixtures-20261109-r12",
    "trilha-a-fixtures-20261109-r13",
    "trilha-a-fixtures-20261109-r14",
    "trilha-a-fixtures-20261109-r15",
    "trilha-a-fixtures-20261109-r16",
    "trilha-a-fixtures-20261109-r17",
    "trilha-a-fixtures-20261110-r18",
    "trilha-a-fixtures-20261110-r19",
  ]),
  fixturesSha: "5dc57275d6e95f066ec751fad7a0af50005ab17f",
  fixtures: Object.freeze({
    id: 411426169,
    name: "ContaOS Trilha A Fixtures",
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    nonce: "trilha-a-fixtures-20261110-r20",
    privateName: "Trilha A preparacao sintetica HML",
  }),
  audit: Object.freeze({
    id: 411115674,
    name: "ContaOS Trilha A Autenticada",
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    nonce: "integracao-v1-fase2-nav-20261113-r8",
    privateName: "Trilha A auditoria privada HML",
  }),
});
let singleRequestContext = null;

function singleRequestIdentityMode(request) {
  if (request.frontend_sha === "" && request.deployment_id === "") return "AUTO_DISCOVER";
  if (
    hash40(request.frontend_sha) &&
    typeof request.deployment_id === "string" &&
    /^dpl_[A-Za-z0-9]{8,80}$/.test(request.deployment_id)
  )
    return "EXPLICIT";
  fail("REQUEST_SCHEMA");
}

export function parseSingleRequest(raw, operation, { historical = false } = {}) {
  if (typeof raw !== "string" || Buffer.byteLength(raw) > 4096) fail("REQUEST_JSON");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("REQUEST_JSON");
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") fail("REQUEST_SCHEMA");
  // This schema contains scalar values only. Scan its keys separately so JSON.parse
  // cannot silently replace a duplicate, including an escaped spelling of a key.
  const stringToken = /"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y;
  let pos = 0;
  const seen = new Set();
  const ws = () => {
    while (/\s/.test(raw[pos] || "") && pos < raw.length) pos++;
  };
  const str = () => {
    stringToken.lastIndex = pos;
    const m = stringToken.exec(raw);
    if (!m) fail("REQUEST_SCHEMA");
    pos = stringToken.lastIndex;
    return JSON.parse(m[0]);
  };
  ws();
  if (raw[pos++] !== "{") fail("REQUEST_SCHEMA");
  ws();
  while (raw[pos] !== "}") {
    const key = str();
    if (seen.has(key)) fail("REQUEST_DUPLICATE_KEY");
    seen.add(key);
    ws();
    if (raw[pos++] !== ":") fail("REQUEST_SCHEMA");
    ws();
    if (raw[pos] === '"') str();
    else {
      const m = /^(?:0|[1-9][0-9]*)/.exec(raw.slice(pos));
      if (!m) fail("REQUEST_SCHEMA");
      pos += m[0].length;
    }
    ws();
    if (raw[pos] === ",") {
      pos++;
      ws();
      if (raw[pos] === "}") fail("REQUEST_SCHEMA");
      continue;
    }
    if (raw[pos] !== "}") fail("REQUEST_SCHEMA");
  }
  pos++;
  ws();
  if (pos !== raw.length) fail("REQUEST_SCHEMA");
  const keys = [
    "schema_version",
    "issue",
    "operation",
    "request_id",
    "approved_parent_sha",
    "frontend_sha",
    "deployment_id",
  ];
  if (
    seen.size !== keys.length ||
    keys.some((k) => !seen.has(k)) ||
    parsed.schema_version !== 1 ||
    parsed.issue !== 317 ||
    !["fixtures", "audit"].includes(parsed.operation) ||
    (operation && parsed.operation !== operation) ||
    (parsed.request_id !== SINGLE_REQUEST[parsed.operation]?.nonce &&
      !(
        historical &&
        ((parsed.operation === "fixtures" &&
          SINGLE_REQUEST.spentFixtureNonces.includes(parsed.request_id)) ||
          (parsed.operation === "audit" &&
            SINGLE_REQUEST.spentAuditNonces.includes(parsed.request_id)))
      )) ||
    !hash40(parsed.approved_parent_sha)
  )
    fail("REQUEST_SCHEMA");
  singleRequestIdentityMode(parsed);
  return Object.freeze({ ...parsed });
}

export function validateSingleRequestEvent({ event, env, upstream, current, operation, mainSha }) {
  const expected = SINGLE_REQUEST[operation],
    repo = SINGLE_REQUEST.repository;
  if (
    !expected ||
    env.GITHUB_EVENT_NAME !== "workflow_run" ||
    env.GITHUB_REF !== "refs/heads/main" ||
    env.GITHUB_REPOSITORY !== repo ||
    env.GITHUB_RUN_ATTEMPT !== "1" ||
    event?.action !== "completed" ||
    event.repository?.full_name !== repo ||
    !hash40(mainSha) ||
    env.CONTAOS_HARNESS_SHA !== mainSha
  )
    fail("REQUEST_EVENT");
  const check = (r) =>
    r &&
    r.workflow_id === SINGLE_REQUEST.upstreamId &&
    r.path === SINGLE_REQUEST.upstreamPath &&
    r.name === SINGLE_REQUEST.upstreamName &&
    r.event === "push" &&
    r.head_branch === "main" &&
    r.head_sha === mainSha &&
    r.run_attempt === 1 &&
    r.status === "completed" &&
    r.conclusion === "success" &&
    r.repository?.full_name === repo &&
    r.head_repository?.full_name === repo &&
    Number.isSafeInteger(r.id) &&
    r.id > 0;
  if (!check(event.workflow_run) || !check(upstream) || upstream.id !== event.workflow_run.id)
    fail("REQUEST_UPSTREAM");
  if (
    !current ||
    current.id !== Number(env.GITHUB_RUN_ID) ||
    !/^\d+$/.test(env.GITHUB_RUN_ID || "") ||
    current.workflow_id !== expected.id ||
    current.path !== expected.path ||
    current.name !== expected.name ||
    current.event !== "workflow_run" ||
    current.head_branch !== "main" ||
    current.head_sha !== mainSha ||
    current.run_attempt !== 1 ||
    current.repository?.full_name !== repo ||
    current.head_repository?.full_name !== repo
  )
    fail("REQUEST_CURRENT");
  return mainSha;
}

export async function listSingleRequestRuns(getPage) {
  const result = [],
    ids = new Set();
  let total = null;
  for (let page = 1; page <= 10; page++) {
    const body = await getPage(page);
    if (
      !Number.isInteger(body?.total_count) ||
      body.total_count < 0 ||
      body.total_count > 1000 ||
      !Array.isArray(body.workflow_runs) ||
      body.workflow_runs.length > 100 ||
      (total !== null && total !== body.total_count)
    )
      fail("REQUEST_PAGINATION");
    total = body.total_count;
    const expected = Math.min(100, total - (page - 1) * 100);
    if (expected < 0 || body.workflow_runs.length !== expected) fail("REQUEST_PAGINATION");
    for (const run of body.workflow_runs) {
      if (!Number.isSafeInteger(run?.id) || run.id <= 0 || ids.has(run.id))
        fail("REQUEST_PAGINATION");
      ids.add(run.id);
      result.push(run);
    }
    if (result.length === total) return result;
  }
  fail("REQUEST_PAGINATION");
}
export function validateSingleRequestRuns({ current, runs, requestShas, workflowId }) {
  if (
    !current ||
    current.run_attempt !== 1 ||
    !Array.isArray(requestShas) ||
    !requestShas.includes(current.head_sha) ||
    !Array.isArray(runs)
  )
    fail("REQUEST_UNIQUENESS");
  const matches = runs.filter(
    (r) => requestShas.includes(r.head_sha) && r.event === "workflow_run",
  );
  if (
    matches.length !== 1 ||
    matches[0].id !== current.id ||
    matches[0].workflow_id !== workflowId ||
    matches[0].run_attempt !== 1 ||
    current.workflow_id !== workflowId
  )
    fail("REQUEST_UNIQUENESS");
  return true;
}
export function singleRequestEventAllowed(env, operation) {
  if (env.GITHUB_EVENT_NAME === "workflow_dispatch") return env.GITHUB_REF === "refs/heads/main";
  return (
    env.GITHUB_EVENT_NAME === "workflow_run" &&
    env.GITHUB_REF === "refs/heads/main" &&
    singleRequestContext?.operation === operation &&
    singleRequestContext.sha === env.CONTAOS_HARNESS_SHA &&
    singleRequestContext.runId === env.GITHUB_RUN_ID &&
    env.GITHUB_RUN_ATTEMPT === "1"
  );
}
export function resolveC8AuditScope(request) {
  validateC8RecoveryDocument(C8_RECOVERY_DOCUMENT);
  const code = "AUDIT_BINDING_PENDING";
  if (!request || typeof request !== "object" || isProxy(request)) fail(code);
  const proto = Object.getPrototypeOf(request);
  if (proto !== Object.prototype && proto !== null) fail(code);
  const names = [
    "schema_version",
    "issue",
    "operation",
    "request_id",
    "approved_parent_sha",
    "frontend_sha",
    "deployment_id",
  ];
  const keys = Reflect.ownKeys(request);
  if (keys.length !== 7 || keys.some((key) => typeof key !== "string" || !names.includes(key)))
    fail(code);
  const descriptors = Object.getOwnPropertyDescriptors(request),
    copy = {};
  for (const name of names) {
    const d = descriptors[name];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      d.enumerable !== true ||
      !["string", "number"].includes(typeof d.value)
    )
      fail(code);
    copy[name] = d.value;
  }
  if (copy.operation !== "audit" || copy.request_id !== NAVIGATION_SCOPE.nonce) fail(code);
  parseSingleRequest(JSON.stringify(copy), "audit");
  return NAVIGATION_SCOPE;
}
export function requireSingleRequestOperation(operation, request = null) {
  if (operation === "audit") {
    resolveC8AuditScope(request);
    return;
  }
  if (operation !== "fixtures") fail("REQUEST_OPERATION");
}

export async function verifySingleRequestGit(request, sha, git, raw) {
  const mode = singleRequestIdentityMode(request);
  if (typeof raw !== "string" || (await git(["show", sha + ":" + SINGLE_REQUEST.path])) !== raw)
    fail("REQUEST_DIRTY");
  if (!hash40(sha) || (await git(["rev-parse", "HEAD"])).trim() !== sha) fail("REQUEST_CHECKOUT");
  const parents = (await git(["rev-list", "--parents", "-n", "1", sha])).trim().split(" ");
  if (parents.length !== 3 || parents[0] !== sha || parents[1] !== request.approved_parent_sha)
    fail("REQUEST_PARENT");
  const ancestors = [SINGLE_REQUEST.gateSha, SINGLE_REQUEST.fixturesSha];
  if (request.operation === "fixtures")
    ancestors.push(
      SINGLE_REQUEST.recoveryGateSha,
      SINGLE_REQUEST.readbackGateSha,
      SINGLE_REQUEST.bootstrapGateSha,
      SINGLE_REQUEST.navigationGateSha,
      SINGLE_REQUEST.listSelectionGateSha,
      SINGLE_REQUEST.metadataGateSha,
      SINGLE_REQUEST.observationGateSha,
      SINGLE_REQUEST.competenceReadGateSha,
      SINGLE_REQUEST.contextualProjectionGateSha,
      SINGLE_REQUEST.asynchronousOpinionGateSha,
      SINGLE_REQUEST.canonicalProfileGateSha,
      SINGLE_REQUEST.r13RecoveryGateSha,
      SINGLE_REQUEST.r19RecoveryGateSha,
      SINGLE_REQUEST.r19RecoveryPlanSha,
      SINGLE_REQUEST.r18ReaderBuildSha,
      SINGLE_REQUEST.r18RecoveryGateSha,
      SINGLE_REQUEST.r18RecoveryPlanSha,
      SINGLE_REQUEST.r17ReaderBuildSha,
      SINGLE_REQUEST.r17RecoveryGateSha,
      SINGLE_REQUEST.r17RecoveryPlanSha,
      SINGLE_REQUEST.r16RecoveryBuildSha,
      SINGLE_REQUEST.r15RecoveryGateSha,
      SINGLE_REQUEST.void204GateSha,
      SINGLE_REQUEST.void204BuildSha,
      SINGLE_REQUEST.metadataTimeoutGateSha,
      SINGLE_REQUEST.metadataTimeoutPlanSha,
      SINGLE_REQUEST.uiSecurityRecoveryGateSha,
      SINGLE_REQUEST.listReadinessSecuritySha,
      SINGLE_REQUEST.listReadinessBuildSha,
      SINGLE_REQUEST.r14PlanSha,
    );
  if (request.operation === "audit") {
    resolveC8AuditScope(request);
    ancestors.push(
      SINGLE_REQUEST.c8GateSha,
      SINGLE_REQUEST.c8PlanSha,
      SINGLE_REQUEST.c8ReaderBuildSha,
      SINGLE_REQUEST.functionalNavigationGateSha,
      SINGLE_REQUEST.functionalNavigationRepairGateSha,
      SINGLE_REQUEST.functionalNavigationVisualGateSha,
      SINGLE_REQUEST.functionalNavigationFocusGateSha,
      SINGLE_REQUEST.functionalNavigationR2PlanSha,
      SINGLE_REQUEST.functionalNavigationR3PlanSha,
      SINGLE_REQUEST.functionalNavigationR4PlanSha,
      SINGLE_REQUEST.functionalNavigationR5PlanSha,
      SINGLE_REQUEST.functionalNavigationR6PlanSha,
      SINGLE_REQUEST.functionalNavigationR7PlanSha,
      SINGLE_REQUEST.functionalNavigationR8PlanSha,
    );
  }
  // Automatic discovery proves the real source later, before its separate checkout.
  // The request itself still needs the integrated amendment and all original gates.
  ancestors.push(mode === "AUTO_DISCOVER" ? SINGLE_REQUEST.autoGateSha : request.frontend_sha);
  for (const ancestor of ancestors)
    await git(["merge-base", "--is-ancestor", ancestor, parents[1]]);
  const diff = (
    await git([
      "diff-tree",
      "--no-commit-id",
      "--name-status",
      "-r",
      "--no-renames",
      parents[1],
      sha,
    ])
  ).trim();
  if (!["A\t", "M\t"].some((prefix) => diff === prefix + SINGLE_REQUEST.path)) fail("REQUEST_DIFF");
  const entry = (await git(["ls-tree", sha, "--", SINGLE_REQUEST.path])).trim();
  if (!entry.startsWith("100644 blob ") || !entry.endsWith("\t" + SINGLE_REQUEST.path))
    fail("REQUEST_FILE_MODE");
  const commits = (
    await git([
      "log",
      "--first-parent",
      "--format=%H",
      "--max-count=1001",
      sha,
      "--",
      SINGLE_REQUEST.path,
    ])
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  if (commits.length > 1000 || !commits.includes(sha)) fail("REQUEST_HISTORY");
  const requestShas = [];
  for (const commit of commits) {
    if (!hash40(commit)) fail("REQUEST_HISTORY");
    const raw = await git(["show", commit + ":" + SINGLE_REQUEST.path]);
    const historic = parseSingleRequest(raw, undefined, { historical: true });
    if (historic.request_id === request.request_id) requestShas.push(commit);
  }
  return requestShas;
}

export const R7_ZERO_AUTH_PROOF = Object.freeze({
  schema: "contaos.fixture.recovery-r7.v1",
  headSha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
  upstreamRun: 42601246471,
  fixturesRun: 42601383933,
  auditRun: 42601384052,
  privateJob: 129106715983,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
let validatedR7ZeroAuth = null;
export function validateR7ZeroAuthProof(value) {
  if (isProxy(value) || !value || typeof value !== "object" || Array.isArray(value))
    fail("RECOVERY_R7_PROOF");
  const prototype = Object.getPrototypeOf(value);
  if (isProxy(prototype) || (prototype !== Object.prototype && prototype !== null))
    fail("RECOVERY_R7_PROOF");
  const descriptors = Object.getOwnPropertyDescriptors(value),
    names = Object.keys(R7_ZERO_AUTH_PROOF);
  if (Reflect.ownKeys(descriptors).length !== names.length) fail("RECOVERY_R7_PROOF");
  const clean = {};
  for (const key of names) {
    const d = descriptors[key];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      d.enumerable !== true ||
      d.value !== R7_ZERO_AUTH_PROOF[key]
    )
      fail("RECOVERY_R7_PROOF");
    clean[key] = d.value;
  }
  if (
    digest(JSON.stringify(clean, null, 2) + "\n") !==
    "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e"
  )
    fail("RECOVERY_R7_PROOF");
  return Object.freeze(clean);
}
export function getValidatedR7ZeroAuth() {
  return validateR7ZeroAuthProof(validatedR7ZeroAuth);
}
export async function verifyR7ZeroAuth({ get, git } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function") fail("RECOVERY_R7_PROOF");
    const head = R7_ZERO_AUTH_PROOF.headSha,
      repo = SINGLE_REQUEST.repository;
    const specs = [
      {
        id: 42601246471,
        workflow: 406076025,
        path: ".github/workflows/contaos-frontend-zero-drift.yml",
        name: "ContaOS Frontend Zero-Drift",
        event: "push",
        conclusion: "success",
        jobs: [
          {
            id: 129105989688,
            name: "ContaOS Frontend Zero-Drift",
            conclusion: "success",
            steps: [
              {
                number: 1,
                name: "Set up job",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 2,
                name: "Checkout immutable commit",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 3,
                name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 4,
                name: "P0 V1 — autotestes do inventario e dispensas",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 5,
                name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 6,
                name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 7,
                name: "Autoteste do guard (casos permitidos e proibidos)",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 8,
                name: "Verificar contrato de seguranca do Auto-Lock por PR",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 9,
                name: "Verificar fronteira frontend/backend e PLAN validado prévio",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 10,
                name: "Autotestes do snapshot canônico e matriz de telas",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 11,
                name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 12,
                name: "GOV-003 — exigir token valido e fonte viva antes do merge",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 13,
                name: "Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 14,
                name: "Setup Bun",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 15,
                name: "Install frozen dependencies",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 16,
                name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 17,
                name: "Lint e formatacao do saneamento transversal",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 18,
                name: "Production build — geração canônica TanStack antes dos testes longos",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 19,
                name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 20,
                name: "Full regression — Vitest 2 workers",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 21,
                name: "TypeScript typecheck",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 22,
                name: "Brand-01, PT-BR, secrets and types integrity",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 43,
                name: "Post Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 44,
                name: "Post Checkout immutable commit",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 45,
                name: "Complete job",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
          {
            id: 129105990079,
            name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
            conclusion: "success",
            steps: [
              {
                number: 1,
                name: "Set up job",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 2,
                name: "Checkout SHA imutavel, apenas leitura",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 3,
                name: "Detectar escopo de auditoria visual",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 4,
                name: "Setup Bun",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 5,
                name: "Instalar dependencias congeladas",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 6,
                name: "Cache do Chromium Playwright 1.64.1",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 7,
                name: "Instalar Playwright isolado, sem atualizar package/lock",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 8,
                name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 9,
                name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 10,
                name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 11,
                name: "Evidencia permanente de screenshots e SHA256SUMS",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 12,
                name: "Confirmar que nenhuma fonte versionada foi editada",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 24,
                name: "Post Checkout SHA imutavel, apenas leitura",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 25,
                name: "Complete job",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
        ],
      },
      {
        id: 42601383933,
        workflow: 411426169,
        path: ".github/workflows/contaos-trilha-a-fixtures.yml",
        name: "ContaOS Trilha A Fixtures",
        event: "workflow_run",
        conclusion: "failure",
        jobs: [
          {
            id: 129106437562,
            name: "Trilha A solicitacao unica sem credenciais",
            conclusion: "success",
            steps: [
              {
                number: 1,
                name: "Set up job",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 2,
                name: "Bootstrap publico confiavel antes de checkout ou token",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 3,
                name: "Run actions/checkout@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 4,
                name: "Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 5,
                name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 6,
                name: "Run bun install --frozen-lockfile",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 7,
                name: "Provar evento e unicidade somente em metadados Actions",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 13,
                name: "Post Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 14,
                name: "Post Run actions/checkout@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 15,
                name: "Complete job",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
          {
            id: 129106439491,
            name: "Trilha A protocolo e Chromium sem credenciais",
            conclusion: "skipped",
            steps: [],
          },
          {
            id: 129106715983,
            name: "Trilha A preparacao sintetica HML",
            conclusion: "failure",
            steps: [
              {
                number: 1,
                name: "Set up job",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 2,
                name: "Checkout imutavel do executor main",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 3,
                name: "Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 4,
                name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 5,
                name: "Dependencias congeladas do executor",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 6,
                name: "Recibo inicial publico para as fases sem credenciais",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 7,
                name: "Reancorar deployment HML sem credenciais, antes do checkout da fonte",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 8,
                name: "Validar SHA ancestral antes de baixar ou executar a fonte",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 9,
                name: "Fonte aprovada em checkout separado, sem credenciais persistidas",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 10,
                name: "Dependencias congeladas da fonte aprovada",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 11,
                name: "Run actions/cache@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 12,
                name: "Run ./node_modules/.bin/playwright install --with-deps chromium",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 13,
                name: "Barreira nativa no mesmo HEAD antes de secrets",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 14,
                name: "Preparacao e SSR sem credenciais privadas",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 15,
                name: "Revalidar main e unicidade dentro da concorrencia antes de secrets",
                status: "completed",
                conclusion: "failure",
              },
              {
                number: 16,
                name: "Somente agora fornecer o par sintetico ao preparador separado",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 17,
                name: "Verificar hashes gerados, inclusive em resultado parcial",
                status: "completed",
                conclusion: "failure",
              },
              {
                number: 18,
                name: "Evidencia privada imutavel por 90 dias",
                status: "completed",
                conclusion: "failure",
              },
              {
                number: 33,
                name: "Post Run actions/cache@v4",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 34,
                name: "Post Fonte aprovada em checkout separado, sem credenciais persistidas",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 35,
                name: "Post Run actions/setup-node@v4",
                status: "completed",
                conclusion: "skipped",
              },
              {
                number: 36,
                name: "Post Checkout imutavel do executor main",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 37,
                name: "Complete job",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
        ],
      },
      {
        id: 42601384052,
        workflow: 411115674,
        path: ".github/workflows/contaos-trilha-a-authenticated.yml",
        name: "ContaOS Trilha A Autenticada",
        event: "workflow_run",
        conclusion: "success",
        jobs: [
          {
            id: 129106437990,
            name: "Trilha A solicitacao unica sem credenciais",
            conclusion: "success",
            steps: [
              {
                number: 1,
                name: "Set up job",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 2,
                name: "Bootstrap publico confiavel antes de checkout ou token",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 3,
                name: "Run actions/checkout@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 4,
                name: "Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 5,
                name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 6,
                name: "Run bun install --frozen-lockfile",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 7,
                name: "Provar evento e unicidade somente em metadados Actions",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 13,
                name: "Post Run actions/setup-node@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 14,
                name: "Post Run actions/checkout@v4",
                status: "completed",
                conclusion: "success",
              },
              {
                number: 15,
                name: "Complete job",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
          {
            id: 129106440087,
            name: "Trilha A protocolo e Chromium sem credenciais",
            conclusion: "skipped",
            steps: [],
          },
          {
            id: 129106589401,
            name: "Trilha A auditoria privada HML",
            conclusion: "skipped",
            steps: [],
          },
        ],
      },
    ];
    const validTime = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
    const checkRun = (row, spec) => {
      if (
        !row ||
        row.id !== spec.id ||
        row.workflow_id !== spec.workflow ||
        row.path !== spec.path ||
        row.name !== spec.name ||
        row.head_sha !== head ||
        row.head_branch !== "main" ||
        row.event !== spec.event ||
        row.run_attempt !== 1 ||
        row.status !== "completed" ||
        row.conclusion !== spec.conclusion ||
        row.repository?.full_name !== repo ||
        row.repository?.id !== 1442722734 ||
        row.head_repository?.full_name !== repo ||
        row.head_repository?.id !== 1442722734 ||
        !validTime(row.created_at) ||
        !validTime(row.updated_at) ||
        Date.parse(row.updated_at) < Date.parse(row.created_at)
      )
        fail("RECOVERY_R7_PROOF");
    };
    await git(["merge-base", "--is-ancestor", head, "HEAD"]);
    for (const spec of specs) {
      checkRun(await get("/actions/runs/" + spec.id), spec);
      checkRun(await get("/actions/runs/" + spec.id + "/attempts/1"), spec);
      const part = await get("/actions/runs/" + spec.id + "/attempts/1/jobs?per_page=100&page=1");
      if (
        part?.total_count !== spec.jobs.length ||
        !Array.isArray(part.jobs) ||
        part.jobs.length !== spec.jobs.length ||
        new Set(part.jobs.map((j) => j.id)).size !== spec.jobs.length
      )
        fail("RECOVERY_R7_PROOF");
      for (const expected of spec.jobs) {
        const rows = part.jobs.filter((j) => j.id === expected.id && j.name === expected.name);
        if (rows.length !== 1) fail("RECOVERY_R7_PROOF");
        const job = rows[0];
        if (
          job.run_id !== spec.id ||
          job.run_attempt !== 1 ||
          job.head_sha !== head ||
          job.head_branch !== "main" ||
          job.status !== "completed" ||
          job.conclusion !== expected.conclusion ||
          !Array.isArray(job.steps) ||
          job.steps.length !== expected.steps.length ||
          new Set(job.steps.map((s) => s.number)).size !== expected.steps.length
        )
          fail("RECOVERY_R7_PROOF");
        for (const step of expected.steps) {
          const actual = job.steps.filter((s) => s.number === step.number);
          if (
            actual.length !== 1 ||
            ["name", "status", "conclusion"].some((key) => actual[0][key] !== step[key]) ||
            !validTime(actual[0].started_at) ||
            !validTime(actual[0].completed_at) ||
            Date.parse(actual[0].completed_at) < Date.parse(actual[0].started_at)
          )
            fail("RECOVERY_R7_PROOF");
        }
      }
    }
    const artifacts = await get(
      "/actions/runs/" + R7_ZERO_AUTH_PROOF.fixturesRun + "/artifacts?per_page=100&page=1",
    );
    if (
      artifacts?.total_count !== 0 ||
      !Array.isArray(artifacts.artifacts) ||
      artifacts.artifacts.length !== 0
    )
      fail("RECOVERY_R7_PROOF");
    const sources = [
      [
        ".github/workflows/contaos-trilha-a-fixtures.yml",
        "818af06317c72038abe23cd85f4a95f4ea4d1d3c",
      ],
      ["scripts/hml/authenticated-visual-audit.mjs", "ed7324f59364a103d572b45e4956573ed14a894f"],
      ["scripts/hml/prepare-visual-fixtures.mjs", "03f4a3a8d52b7ddc78ec7a34d32b8de6d47c173e"],
    ];
    for (const [path, sha] of sources) {
      const raw = await git(["show", head + ":" + path]);
      if (
        typeof raw !== "string" ||
        Buffer.byteLength(raw) > 1048576 ||
        createHash("sha1")
          .update("blob " + Buffer.byteLength(raw) + "\0")
          .update(raw)
          .digest("hex") !== sha
      )
        fail("RECOVERY_R7_PROOF");
    }
    return validateR7ZeroAuthProof(R7_ZERO_AUTH_PROOF);
  } catch (error) {
    failRequestProof("RECOVERY_R7_PROOF", error);
  }
}

export const R12_ZERO_AUTH_PROOF = Object.freeze({
  schema: "contaos.single-request.r12-zero-auth.v1",
  headSha: "3d6bea3e938459f348130bf1d04431a072dba081",
  upstreamRun: 42666600147,
  fixturesRun: 42666864017,
  auditRun: 42666864220,
  privateJob: 129333370334,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
let validatedR12ZeroAuth = null;
export function validateR12ZeroAuthProof(value) {
  if (isProxy(value) || !value || typeof value !== "object" || Array.isArray(value))
    fail("RECOVERY_R12_PROOF");
  const prototype = Object.getPrototypeOf(value);
  if (isProxy(prototype) || (prototype !== Object.prototype && prototype !== null))
    fail("RECOVERY_R12_PROOF");
  const descriptors = Object.getOwnPropertyDescriptors(value),
    names = Object.keys(R12_ZERO_AUTH_PROOF),
    keys = Reflect.ownKeys(descriptors);
  if (keys.length !== names.length || keys.some((key, i) => key !== names[i]))
    fail("RECOVERY_R12_PROOF");
  const clean = {};
  for (const key of names) {
    const d = descriptors[key];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      d.enumerable !== true ||
      d.value !== R12_ZERO_AUTH_PROOF[key]
    )
      fail("RECOVERY_R12_PROOF");
    clean[key] = d.value;
  }
  return Object.freeze(clean);
}
export function getValidatedR12ZeroAuth() {
  return validateR12ZeroAuthProof(validatedR12ZeroAuth);
}
export async function verifyR12ZeroAuth({ get, git, parentSha } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function" || !hash40(parentSha))
      fail("RECOVERY_R12_PROOF");
    const head = R12_ZERO_AUTH_PROOF.headSha,
      repo = SINGLE_REQUEST.repository,
      specs = [
        {
          id: 42666600147,
          workflow: 406076025,
          path: ".github/workflows/contaos-frontend-zero-drift.yml",
          name: "ContaOS Frontend Zero-Drift",
          event: "push",
          conclusion: "success",
          jobs: [
            {
              id: 129331797954,
              name: "ContaOS Frontend Zero-Drift",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Checkout immutable commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "P0 V1 — autotestes do inventario e dispensas",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Autoteste do guard (casos permitidos e proibidos)",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 8,
                  name: "Verificar contrato de seguranca do Auto-Lock por PR",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 9,
                  name: "Verificar fronteira frontend/backend e PLAN validado prévio",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 10,
                  name: "Autotestes do snapshot canônico e matriz de telas",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 11,
                  name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 12,
                  name: "GOV-003 — exigir token valido e fonte viva antes do merge",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 13,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 14,
                  name: "Setup Bun",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Install frozen dependencies",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 16,
                  name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 17,
                  name: "Lint e formatacao do saneamento transversal",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 18,
                  name: "Production build — geração canônica TanStack antes dos testes longos",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 19,
                  name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 20,
                  name: "Full regression — Vitest 2 workers",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 21,
                  name: "TypeScript typecheck",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 22,
                  name: "Brand-01, PT-BR, secrets and types integrity",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 43,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 44,
                  name: "Post Checkout immutable commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 45,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129331798384,
              name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Checkout SHA imutavel, apenas leitura",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Detectar escopo de auditoria visual",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Setup Bun",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 5,
                  name: "Instalar dependencias congeladas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 6,
                  name: "Cache do Chromium Playwright 1.64.1",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 7,
                  name: "Instalar Playwright isolado, sem atualizar package/lock",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 8,
                  name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 9,
                  name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 10,
                  name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 11,
                  name: "Evidencia permanente de screenshots e SHA256SUMS",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 12,
                  name: "Confirmar que nenhuma fonte versionada foi editada",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 24,
                  name: "Post Checkout SHA imutavel, apenas leitura",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 25,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
          ],
        },
        {
          id: 42666864017,
          workflow: 411426169,
          path: ".github/workflows/contaos-trilha-a-fixtures.yml",
          name: "ContaOS Trilha A Fixtures",
          event: "workflow_run",
          conclusion: "failure",
          jobs: [
            {
              id: 129332744911,
              name: "Trilha A solicitacao unica sem credenciais",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Bootstrap publico confiavel antes de checkout ou token",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "Run bun install --frozen-lockfile",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Provar evento e unicidade somente em metadados Actions",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 13,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 14,
                  name: "Post Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129332747763,
              name: "Trilha A protocolo e Chromium sem credenciais",
              conclusion: "skipped",
              steps: [],
            },
            {
              id: 129333370334,
              name: "Trilha A preparacao sintetica HML",
              conclusion: "failure",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Checkout imutavel do executor main",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "Dependencias congeladas do executor",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "Recibo inicial publico para as fases sem credenciais",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Reancorar deployment HML sem credenciais, antes do checkout da fonte",
                  status: "completed",
                  conclusion: "failure",
                },
                {
                  number: 8,
                  name: "Validar SHA ancestral antes de baixar ou executar a fonte",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 9,
                  name: "Fonte aprovada em checkout separado, sem credenciais persistidas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 10,
                  name: "Dependencias congeladas da fonte aprovada",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 11,
                  name: "Run actions/cache@v4",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 12,
                  name: "Run ./node_modules/.bin/playwright install --with-deps chromium",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 13,
                  name: "Barreira nativa no mesmo HEAD antes de secrets",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 14,
                  name: "Preparacao e SSR sem credenciais privadas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 15,
                  name: "Revalidar main e unicidade dentro da concorrencia antes de secrets",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 16,
                  name: "Somente agora fornecer o par sintetico ao preparador separado",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 17,
                  name: "Verificar hashes gerados, inclusive em resultado parcial",
                  status: "completed",
                  conclusion: "failure",
                },
                {
                  number: 18,
                  name: "Evidencia privada imutavel por 90 dias",
                  status: "completed",
                  conclusion: "failure",
                },
                {
                  number: 35,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 36,
                  name: "Post Checkout imutavel do executor main",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 37,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
          ],
        },
        {
          id: 42666864220,
          workflow: 411115674,
          path: ".github/workflows/contaos-trilha-a-authenticated.yml",
          name: "ContaOS Trilha A Autenticada",
          event: "workflow_run",
          conclusion: "success",
          jobs: [
            {
              id: 129332746954,
              name: "Trilha A solicitacao unica sem credenciais",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Bootstrap publico confiavel antes de checkout ou token",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "Run bun install --frozen-lockfile",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Provar evento e unicidade somente em metadados Actions",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 13,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 14,
                  name: "Post Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129332749745,
              name: "Trilha A protocolo e Chromium sem credenciais",
              conclusion: "skipped",
              steps: [],
            },
            {
              id: 129332966127,
              name: "Trilha A auditoria privada HML",
              conclusion: "skipped",
              steps: [],
            },
          ],
        },
      ];
    await git(["merge-base", "--is-ancestor", head, parentSha]);
    const sources = [
      [
        ".github/workflows/contaos-trilha-a-fixtures.yml",
        "9af69f3ae0797cd4f0e9713950e473bc1b4a8f17",
      ],
      [
        ".github/workflows/contaos-trilha-a-authenticated.yml",
        "848acf35a51bb5b420d5cf9047972da4a75a98eb",
      ],
      ["scripts/hml/authenticated-visual-audit.mjs", "12549d9cf6058ebb098832d71ca5b9ad9a0c2e0d"],
      ["scripts/hml/prepare-visual-fixtures.mjs", "c4979dc74ecd033c2a38d479115e7d1302060d37"],
    ];
    for (const [path, sha] of sources) {
      const raw = await git(["show", head + ":" + path]);
      if (
        typeof raw !== "string" ||
        Buffer.byteLength(raw) > 1048576 ||
        createHash("sha1")
          .update("blob " + Buffer.byteLength(raw) + "\0")
          .update(raw)
          .digest("hex") !== sha
      )
        fail("RECOVERY_R12_PROOF");
    }
    const validTime = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
    const checkRun = (row, spec) => {
      if (
        !row ||
        row.id !== spec.id ||
        row.workflow_id !== spec.workflow ||
        row.path !== spec.path ||
        row.name !== spec.name ||
        row.head_sha !== head ||
        row.head_branch !== "main" ||
        row.event !== spec.event ||
        row.run_attempt !== 1 ||
        row.status !== "completed" ||
        row.conclusion !== spec.conclusion ||
        row.repository?.full_name !== repo ||
        row.repository?.id !== 1442722734 ||
        row.repository?.private !== false ||
        row.repository?.owner?.id !== 352205055 ||
        row.repository?.owner?.login !== "contaos999999" ||
        row.head_repository?.full_name !== repo ||
        row.head_repository?.id !== 1442722734 ||
        row.head_repository?.private !== false ||
        row.head_repository?.owner?.id !== 352205055 ||
        row.head_repository?.owner?.login !== "contaos999999" ||
        !validTime(row.created_at) ||
        !validTime(row.updated_at) ||
        Date.parse(row.updated_at) < Date.parse(row.created_at)
      )
        fail("RECOVERY_R12_PROOF");
    };
    await Promise.all(
      specs.map(async (spec) => {
        const [run, attempt, jobs] = await Promise.all([
          get("/actions/runs/" + spec.id),
          get("/actions/runs/" + spec.id + "/attempts/1"),
          get("/actions/runs/" + spec.id + "/attempts/1/jobs?per_page=100&page=1"),
        ]);
        checkRun(run, spec);
        checkRun(attempt, spec);
        if (
          jobs?.total_count !== spec.jobs.length ||
          !Array.isArray(jobs.jobs) ||
          jobs.jobs.length !== spec.jobs.length ||
          new Set(jobs.jobs.map((j) => j.id)).size !== spec.jobs.length
        )
          fail("RECOVERY_R12_PROOF");
        for (const expected of spec.jobs) {
          const rows = jobs.jobs.filter((j) => j.id === expected.id && j.name === expected.name);
          if (rows.length !== 1) fail("RECOVERY_R12_PROOF");
          const job = rows[0];
          if (
            job.run_id !== spec.id ||
            job.run_attempt !== 1 ||
            job.head_sha !== head ||
            job.head_branch !== "main" ||
            job.status !== "completed" ||
            job.conclusion !== expected.conclusion ||
            !Array.isArray(job.steps) ||
            job.steps.length !== expected.steps.length ||
            new Set(job.steps.map((s) => s.number)).size !== expected.steps.length
          )
            fail("RECOVERY_R12_PROOF");
          for (const step of expected.steps) {
            const matching = job.steps.filter((s) => s.number === step.number);
            if (
              matching.length !== 1 ||
              ["name", "status", "conclusion"].some((key) => matching[0][key] !== step[key]) ||
              !validTime(matching[0].started_at) ||
              !validTime(matching[0].completed_at) ||
              Date.parse(matching[0].completed_at) < Date.parse(matching[0].started_at)
            )
              fail("RECOVERY_R12_PROOF");
          }
        }
        return run;
      }),
    );
    const artifacts = await get(
      "/actions/runs/" + R12_ZERO_AUTH_PROOF.fixturesRun + "/artifacts?per_page=100&page=1",
    );
    if (
      artifacts?.total_count !== 0 ||
      !Array.isArray(artifacts.artifacts) ||
      artifacts.artifacts.length !== 0
    )
      fail("RECOVERY_R12_PROOF");
    return validateR12ZeroAuthProof(R12_ZERO_AUTH_PROOF);
  } catch (error) {
    failRequestProof("RECOVERY_R12_PROOF", error);
  }
}

export const R14_ZERO_AUTH_PROOF = Object.freeze({
  schema: "contaos.single-request.r14-zero-auth.v1",
  headSha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
  upstreamRun: 42694401246,
  fixturesRun: 42694609672,
  auditRun: 42694609740,
  privateJob: 129423314958,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
let validatedR14ZeroAuth = null;
export function validateR14ZeroAuthProof(value) {
  if (isProxy(value) || !value || typeof value !== "object" || Array.isArray(value))
    fail("RECOVERY_R14_PROOF");
  const prototype = Object.getPrototypeOf(value);
  if (isProxy(prototype) || (prototype !== Object.prototype && prototype !== null))
    fail("RECOVERY_R14_PROOF");
  const descriptors = Object.getOwnPropertyDescriptors(value),
    names = Object.keys(R14_ZERO_AUTH_PROOF),
    keys = Reflect.ownKeys(descriptors);
  if (keys.length !== names.length || keys.some((key, i) => key !== names[i]))
    fail("RECOVERY_R14_PROOF");
  const clean = {};
  for (const key of names) {
    const d = descriptors[key];
    if (
      !d ||
      !Object.hasOwn(d, "value") ||
      d.enumerable !== true ||
      d.value !== R14_ZERO_AUTH_PROOF[key]
    )
      fail("RECOVERY_R14_PROOF");
    clean[key] = d.value;
  }
  return Object.freeze(clean);
}
export function getValidatedR14ZeroAuth() {
  return validateR14ZeroAuthProof(validatedR14ZeroAuth);
}
export async function verifyR14ZeroAuth({ get, git, parentSha } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function" || !hash40(parentSha))
      fail("RECOVERY_R14_PROOF");
    const head = R14_ZERO_AUTH_PROOF.headSha,
      repo = SINGLE_REQUEST.repository,
      specs = [
        {
          id: 42694401246,
          workflow: 406076025,
          path: ".github/workflows/contaos-frontend-zero-drift.yml",
          name: "ContaOS Frontend Zero-Drift",
          event: "push",
          conclusion: "success",
          jobs: [
            {
              id: 129422257245,
              name: "ContaOS Frontend Zero-Drift",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Checkout immutable commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "P0 V1 — autotestes do inventario e dispensas",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Autoteste do guard (casos permitidos e proibidos)",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 8,
                  name: "Verificar contrato de seguranca do Auto-Lock por PR",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 9,
                  name: "Verificar fronteira frontend/backend e PLAN validado prévio",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 10,
                  name: "Autotestes do snapshot canônico e matriz de telas",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 11,
                  name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 12,
                  name: "GOV-003 — exigir token valido e fonte viva antes do merge",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 13,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 14,
                  name: "Setup Bun",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Install frozen dependencies",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 16,
                  name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 17,
                  name: "Lint e formatacao do saneamento transversal",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 18,
                  name: "Production build — geração canônica TanStack antes dos testes longos",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 19,
                  name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 20,
                  name: "Full regression — Vitest 2 workers",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 21,
                  name: "TypeScript typecheck",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 22,
                  name: "Brand-01, PT-BR, secrets and types integrity",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 43,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 44,
                  name: "Post Checkout immutable commit",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 45,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129422258076,
              name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Checkout SHA imutavel, apenas leitura",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Detectar escopo de auditoria visual",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Setup Bun",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 5,
                  name: "Instalar dependencias congeladas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 6,
                  name: "Cache do Chromium Playwright 1.64.1",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 7,
                  name: "Instalar Playwright isolado, sem atualizar package/lock",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 8,
                  name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 9,
                  name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 10,
                  name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 11,
                  name: "Evidencia permanente de screenshots e SHA256SUMS",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 12,
                  name: "Confirmar que nenhuma fonte versionada foi editada",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 24,
                  name: "Post Checkout SHA imutavel, apenas leitura",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 25,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
          ],
        },
        {
          id: 42694609672,
          workflow: 411426169,
          path: ".github/workflows/contaos-trilha-a-fixtures.yml",
          name: "ContaOS Trilha A Fixtures",
          event: "workflow_run",
          conclusion: "failure",
          jobs: [
            {
              id: 129422980268,
              name: "Trilha A solicitacao unica sem credenciais",
              conclusion: "failure",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Bootstrap publico confiavel antes de checkout ou token",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "Run bun install --frozen-lockfile",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Provar evento e unicidade somente em metadados Actions",
                  status: "completed",
                  conclusion: "failure",
                },
                {
                  number: 13,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "skipped",
                },
                {
                  number: 14,
                  name: "Post Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129422982805,
              name: "Trilha A protocolo e Chromium sem credenciais",
              conclusion: "skipped",
              steps: [],
            },
            {
              id: 129423314958,
              name: "Trilha A preparacao sintetica HML",
              conclusion: "skipped",
              steps: [],
            },
          ],
        },
        {
          id: 42694609740,
          workflow: 411115674,
          path: ".github/workflows/contaos-trilha-a-authenticated.yml",
          name: "ContaOS Trilha A Autenticada",
          event: "workflow_run",
          conclusion: "success",
          jobs: [
            {
              id: 129422980473,
              name: "Trilha A solicitacao unica sem credenciais",
              conclusion: "success",
              steps: [
                {
                  number: 1,
                  name: "Set up job",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 2,
                  name: "Bootstrap publico confiavel antes de checkout ou token",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 3,
                  name: "Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 4,
                  name: "Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 5,
                  name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 6,
                  name: "Run bun install --frozen-lockfile",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 7,
                  name: "Provar evento e unicidade somente em metadados Actions",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 13,
                  name: "Post Run actions/setup-node@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 14,
                  name: "Post Run actions/checkout@v4",
                  status: "completed",
                  conclusion: "success",
                },
                {
                  number: 15,
                  name: "Complete job",
                  status: "completed",
                  conclusion: "success",
                },
              ],
            },
            {
              id: 129422983606,
              name: "Trilha A protocolo e Chromium sem credenciais",
              conclusion: "skipped",
              steps: [],
            },
            {
              id: 129423257559,
              name: "Trilha A auditoria privada HML",
              conclusion: "skipped",
              steps: [],
            },
          ],
        },
      ];
    await git(["merge-base", "--is-ancestor", head, parentSha]);
    const sources = [
      [
        ".github/workflows/contaos-trilha-a-fixtures.yml",
        "9af69f3ae0797cd4f0e9713950e473bc1b4a8f17",
      ],
      [
        ".github/workflows/contaos-trilha-a-authenticated.yml",
        "848acf35a51bb5b420d5cf9047972da4a75a98eb",
      ],
      ["scripts/hml/authenticated-visual-audit.mjs", "cbfb86149e89fb48a39d6c6b769167720b4004d0"],
      ["scripts/hml/prepare-visual-fixtures.mjs", "79a7384eba8acd22a460c4bde11acb14100d2e07"],
    ];
    for (const [path, sha] of sources) {
      const raw = await git(["show", head + ":" + path]);
      if (
        typeof raw !== "string" ||
        Buffer.byteLength(raw) > 1048576 ||
        createHash("sha1")
          .update("blob " + Buffer.byteLength(raw) + "\0")
          .update(raw)
          .digest("hex") !== sha
      )
        fail("RECOVERY_R14_PROOF");
    }
    const validTime = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
    const checkRun = (row, spec) => {
      if (
        !row ||
        row.id !== spec.id ||
        row.workflow_id !== spec.workflow ||
        row.path !== spec.path ||
        row.name !== spec.name ||
        row.head_sha !== head ||
        row.head_branch !== "main" ||
        row.event !== spec.event ||
        row.run_attempt !== 1 ||
        row.status !== "completed" ||
        row.conclusion !== spec.conclusion ||
        row.repository?.full_name !== repo ||
        row.repository?.id !== 1442722734 ||
        row.repository?.private !== false ||
        row.repository?.owner?.id !== 352205055 ||
        row.repository?.owner?.login !== "contaos999999" ||
        row.head_repository?.full_name !== repo ||
        row.head_repository?.id !== 1442722734 ||
        row.head_repository?.private !== false ||
        row.head_repository?.owner?.id !== 352205055 ||
        row.head_repository?.owner?.login !== "contaos999999" ||
        !validTime(row.created_at) ||
        !validTime(row.updated_at) ||
        Date.parse(row.updated_at) < Date.parse(row.created_at)
      )
        fail("RECOVERY_R14_PROOF");
    };
    await Promise.all(
      specs.map(async (spec) => {
        const [run, attempt, jobs] = await Promise.all([
          get("/actions/runs/" + spec.id),
          get("/actions/runs/" + spec.id + "/attempts/1"),
          get("/actions/runs/" + spec.id + "/attempts/1/jobs?per_page=100&page=1"),
        ]);
        checkRun(run, spec);
        checkRun(attempt, spec);
        if (
          jobs?.total_count !== spec.jobs.length ||
          !Array.isArray(jobs.jobs) ||
          jobs.jobs.length !== spec.jobs.length ||
          new Set(jobs.jobs.map((j) => j.id)).size !== spec.jobs.length
        )
          fail("RECOVERY_R14_PROOF");
        for (const expected of spec.jobs) {
          const rows = jobs.jobs.filter((j) => j.id === expected.id && j.name === expected.name);
          if (rows.length !== 1) fail("RECOVERY_R14_PROOF");
          const job = rows[0];
          if (
            job.run_id !== spec.id ||
            job.run_attempt !== 1 ||
            job.head_sha !== head ||
            job.head_branch !== "main" ||
            job.status !== "completed" ||
            job.conclusion !== expected.conclusion ||
            !Array.isArray(job.steps) ||
            job.steps.length !== expected.steps.length ||
            new Set(job.steps.map((s) => s.number)).size !== expected.steps.length
          )
            fail("RECOVERY_R14_PROOF");
          for (const step of expected.steps) {
            const matching = job.steps.filter((s) => s.number === step.number);
            if (
              matching.length !== 1 ||
              ["name", "status", "conclusion"].some((key) => matching[0][key] !== step[key]) ||
              !validTime(matching[0].started_at) ||
              !validTime(matching[0].completed_at) ||
              Date.parse(matching[0].completed_at) < Date.parse(matching[0].started_at)
            )
              fail("RECOVERY_R14_PROOF");
          }
        }
        return run;
      }),
    );
    const artifacts = await get(
      "/actions/runs/" + R14_ZERO_AUTH_PROOF.fixturesRun + "/artifacts?per_page=100&page=1",
    );
    if (
      artifacts?.total_count !== 0 ||
      !Array.isArray(artifacts.artifacts) ||
      artifacts.artifacts.length !== 0
    )
      fail("RECOVERY_R14_PROOF");
    return validateR14ZeroAuthProof(R14_ZERO_AUTH_PROOF);
  } catch (error) {
    failRequestProof("RECOVERY_R14_PROOF", error);
  }
}

export const R4_ZERO_AUTH_PROOF = Object.freeze({
  schema: "contaos.fixture.recovery-r4.v1",
  headSha: "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72",
  upstreamRun: 42568309807,
  fixturesRun: 42568382053,
  auditRun: 42568382029,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
let validatedR4ZeroAuth = null;
export function validateR4ZeroAuthProof(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== Object.keys(R4_ZERO_AUTH_PROOF).length ||
    Object.entries(R4_ZERO_AUTH_PROOF).some(([key, expected]) => value[key] !== expected)
  )
    fail("RECOVERY_R4_PROOF");
  return true;
}
export function getValidatedR4ZeroAuth() {
  validateR4ZeroAuthProof(validatedR4ZeroAuth);
  return Object.freeze({ ...validatedR4ZeroAuth });
}
/** Actions metadata only. Never reads logs, artifacts, Auth, or HML endpoints. */
export async function verifyR4ZeroAuth({ get, git } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function") fail("RECOVERY_R4_PROOF");
    const head = R4_ZERO_AUTH_PROOF.headSha,
      repo = SINGLE_REQUEST.repository;
    const specs = [
      {
        id: 42568309807,
        workflow: 406076025,
        path: ".github/workflows/contaos-frontend-zero-drift.yml",
        event: "push",
        conclusion: "failure",
        created: "2026-11-09T05:36:46Z",
        updated: "2026-11-09T05:37:28Z",
        jobs: [
          [128999621110, "ContaOS Frontend Zero-Drift", "failure"],
          [
            128999621372,
            "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
            "success",
          ],
        ],
      },
      {
        id: 42568382053,
        workflow: 411426169,
        path: ".github/workflows/contaos-trilha-a-fixtures.yml",
        event: "workflow_run",
        conclusion: "skipped",
        created: "2026-11-09T05:37:31Z",
        updated: "2026-11-09T05:37:41Z",
        blob: "9fc9fc40d67394dd92cfaa63d7fe25ea6c2f4316",
        jobs: [
          [128999841934, "Trilha A solicitacao unica sem credenciais", "skipped"],
          [128999842395, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
          [128999842616, "Trilha A preparacao sintetica HML", "skipped"],
        ],
      },
      {
        id: 42568382029,
        workflow: 411115674,
        path: ".github/workflows/contaos-trilha-a-authenticated.yml",
        event: "workflow_run",
        conclusion: "skipped",
        created: "2026-11-09T05:37:31Z",
        updated: "2026-11-09T05:37:32Z",
        blob: "45f9d90094cc68aaeb22f5f170d20c2abcfa8159",
        jobs: [
          [128999842036, "Trilha A solicitacao unica sem credenciais", "skipped"],
          [128999885461, "Trilha A auditoria privada HML", "skipped"],
          [128999889276, "Trilha A protocolo e Chromium sem credenciais", "skipped"],
        ],
      },
    ];
    const checkRun = (r, s) => {
      if (
        !r ||
        r.id !== s.id ||
        r.workflow_id !== s.workflow ||
        r.head_sha !== head ||
        r.head_branch !== "main" ||
        r.event !== s.event ||
        r.path !== s.path ||
        r.run_attempt !== 1 ||
        r.status !== "completed" ||
        r.conclusion !== s.conclusion ||
        r.repository?.full_name !== repo ||
        r.head_repository?.full_name !== repo ||
        r.created_at !== s.created ||
        r.updated_at !== s.updated ||
        Date.parse(r.updated_at) < Date.parse(r.created_at) ||
        (s.event === "workflow_run" && Date.parse(r.created_at) < Date.parse(specs[0].updated))
      )
        fail("RECOVERY_R4_PROOF");
    };
    const pages = async (base, key) => {
      const rows = [],
        ids = new Set();
      let total;
      for (let page = 1; page <= 10; page++) {
        const part = await get(base + "&page=" + page);
        if (
          !part ||
          !Number.isSafeInteger(part.total_count) ||
          part.total_count < 0 ||
          part.total_count > 1000 ||
          (total !== undefined && part.total_count !== total) ||
          !Array.isArray(part[key])
        )
          fail("RECOVERY_R4_PROOF");
        total = part.total_count;
        if (part[key].length !== Math.min(100, total - rows.length)) fail("RECOVERY_R4_PROOF");
        for (const row of part[key]) {
          if (!Number.isSafeInteger(row?.id) || row.id <= 0 || ids.has(row.id))
            fail("RECOVERY_R4_PROOF");
          ids.add(row.id);
          rows.push(row);
        }
        if (rows.length === total) return rows;
      }
      fail("RECOVERY_R4_PROOF");
    };
    await git(["merge-base", "--is-ancestor", head, "HEAD"]);
    await git(["merge-base", "--is-ancestor", "a8f3da12dcfeca858904b60e1b32c50df73a7d4a", "HEAD"]);
    for (const s of specs) {
      checkRun(await get("/actions/runs/" + s.id), s);
      const runs = await pages(
        "/actions/workflows/" +
          s.workflow +
          "/runs?head_sha=" +
          head +
          "&event=" +
          s.event +
          "&per_page=100",
        "workflow_runs",
      );
      if (runs.length !== 1) fail("RECOVERY_R4_PROOF");
      checkRun(runs[0], s);
      const jobs = await pages("/actions/runs/" + s.id + "/attempts/1/jobs?per_page=100", "jobs");
      if (jobs.length !== s.jobs.length) fail("RECOVERY_R4_PROOF");
      for (const [id, name, conclusion] of s.jobs) {
        const matches = jobs.filter((j) => j.id === id && j.name === name);
        if (matches.length !== 1) fail("RECOVERY_R4_PROOF");
        const j = matches[0];
        if (
          j.status !== "completed" ||
          j.conclusion !== conclusion ||
          !Array.isArray(j.steps) ||
          (s.event === "workflow_run" && j.steps.length !== 0)
        )
          fail("RECOVERY_R4_PROOF");
        if (id === 128999621110) {
          const setup = j.steps.filter((step) => step.name === "Setup Bun");
          if (
            setup.length !== 1 ||
            setup[0].status !== "completed" ||
            setup[0].conclusion !== "failure"
          )
            fail("RECOVERY_R4_PROOF");
        }
      }
      if (s.blob) {
        const raw = await git(["show", head + ":" + s.path]);
        if (
          typeof raw !== "string" ||
          Buffer.byteLength(raw) > 65536 ||
          createHash("sha1")
            .update("blob " + Buffer.byteLength(raw) + "\0")
            .update(raw)
            .digest("hex") !== s.blob
        )
          fail("RECOVERY_R4_PROOF");
      }
    }
    return Object.freeze({ ...R4_ZERO_AUTH_PROOF });
  } catch (error) {
    failRequestProof("RECOVERY_R4_PROOF", error);
  }
}

const REQUEST_PRIVATE_ENV_KEYS = Object.freeze([
  "CONTAOS_HML_SYNTHETIC_EMAIL",
  "CONTAOS_HML_SYNTHETIC_PASSWORD",
  "CONTAOS_HML_MASTER_EMAIL",
  "CONTAOS_HML_MASTER_PASSWORD",
  "HML_MASTER_EMAIL",
  "HML_MASTER_PASSWORD",
  "MASTER_EMAIL",
  "MASTER_PASSWORD",
  "DATABASE_URL",
  "DIRECT_URL",
  "DB_URL",
  "DB_PASSWORD",
  "POSTGRES_URL",
  "POSTGRES_PASSWORD",
  "AUTH_ADMIN_KEY",
  "CONTAOS_HML_AUTH_ADMIN_KEY",
  "SUPABASE_AUTH_ADMIN_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SERVICE_ROLE_KEY",
  "PGPASSWORD",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_DB_URL",
  "SUPABASE_ADMIN_KEY",
]);
const REQUEST_GITHUB_ENV_KEYS = Object.freeze([
  "CONTAOS_ACTIONS_READ_TOKEN",
  "GITHUB_TOKEN",
  "GH_TOKEN",
]);
const REQUEST_NATIVE_ENV = process.env;
const REQUEST_NATIVE_PROTOTYPES = [];
{
  let current = Object.getPrototypeOf(REQUEST_NATIVE_ENV);
  while (current && !isProxy(current) && REQUEST_NATIVE_PROTOTYPES.length < 8) {
    REQUEST_NATIVE_PROTOTYPES.push(current);
    current = Object.getPrototypeOf(current);
  }
}
function requestEnvironmentChain(env) {
  if (isProxy(env) || !env || typeof env !== "object" || Array.isArray(env))
    fail("PREPARE_SECRET_ENV");
  for (const key of Reflect.ownKeys(env)) {
    const descriptor = Object.getOwnPropertyDescriptor(env, key);
    if (!descriptor || !Object.hasOwn(descriptor, "value")) fail("PREPARE_SECRET_ENV");
  }
  const rootPrototype = Object.getPrototypeOf(env);
  if (isProxy(rootPrototype)) fail("PREPARE_SECRET_ENV");
  if (env !== REQUEST_NATIVE_ENV && rootPrototype !== Object.prototype && rootPrototype !== null)
    fail("PREPARE_SECRET_ENV");
  const chain = [];
  let current = env;
  for (let depth = 0; current; depth++) {
    if (depth >= 8 || isProxy(current)) fail("PREPARE_SECRET_ENV");
    if (depth > 0 && env === REQUEST_NATIVE_ENV && current !== REQUEST_NATIVE_PROTOTYPES[depth - 1])
      fail("PREPARE_SECRET_ENV");
    chain.push(current);
    current = Object.getPrototypeOf(current);
  }
  return chain;
}
export function assertRequestMetadataEnvironment(env, { requireToken = true } = {}) {
  const chain = requestEnvironmentChain(env);
  for (const object of chain) {
    for (const key of [...REQUEST_PRIVATE_ENV_KEYS, "GITHUB_TOKEN", "GH_TOKEN"])
      if (Object.getOwnPropertyDescriptor(object, key)) fail("PREPARE_SECRET_ENV");
    if (object !== env && Object.getOwnPropertyDescriptor(object, "CONTAOS_ACTIONS_READ_TOKEN"))
      fail("PREPARE_SECRET_ENV");
  }
  const descriptor = Object.getOwnPropertyDescriptor(env, "CONTAOS_ACTIONS_READ_TOKEN");
  if (descriptor && !Object.hasOwn(descriptor, "value")) fail("REQUEST_API_TOKEN");
  const token = descriptor?.value;
  if (requireToken && (typeof token !== "string" || !token || /[\r\n\0]/.test(token)))
    fail("REQUEST_API_TOKEN");
  return typeof token === "string" ? token : undefined;
}
export function assertPrivateRequestEnvironment(env) {
  for (const object of requestEnvironmentChain(env))
    for (const key of REQUEST_GITHUB_ENV_KEYS)
      if (Object.getOwnPropertyDescriptor(object, key)) fail("PREPARE_SECRET_ENV");
}
const requestApiFailureRecords = new WeakMap();
const REQUEST_ENDPOINT_KINDS = Object.freeze([
  "REPOSITORY",
  "WORKFLOW",
  "WORKFLOW_RUNS",
  "ALL_RUNS",
  "RUN",
  "RUN_ATTEMPT",
  "RUN_JOBS",
  "RUN_ARTIFACTS",
  "MAIN_REF",
  "COMMIT_PULLS",
  "PULL",
  "PULL_REVIEWS",
]);
function requestEndpointKind(path) {
  if (path === "") return "REPOSITORY";
  if (path === "/git/ref/heads/main") return "MAIN_REF";
  if (/^\/actions\/workflows\/\d+$/.test(path)) return "WORKFLOW";
  if (/^\/actions\/workflows\/\d+\/runs\?/.test(path)) return "WORKFLOW_RUNS";
  if (/^\/actions\/runs\?/.test(path)) return "ALL_RUNS";
  if (/^\/actions\/runs\/\d+$/.test(path)) return "RUN";
  if (/^\/actions\/runs\/\d+\/attempts\/1$/.test(path)) return "RUN_ATTEMPT";
  if (/^\/actions\/runs\/\d+(?:\/attempts\/1)?\/jobs\?/.test(path)) return "RUN_JOBS";
  if (/^\/actions\/runs\/\d+\/artifacts\?/.test(path)) return "RUN_ARTIFACTS";
  if (/^\/commits\/[a-f0-9]{40}\/pulls\?/.test(path)) return "COMMIT_PULLS";
  if (/^\/pulls\/\d+$/.test(path)) return "PULL";
  if (/^\/pulls\/\d+\/reviews\?/.test(path)) return "PULL_REVIEWS";
  return null;
}
export function requestApiDiagnostic(error) {
  if (isProxy(error) || !error || !["object", "function"].includes(typeof error)) return null;
  const record = requestApiFailureRecords.get(error);
  if (
    !record ||
    !REQUEST_ENDPOINT_KINDS.includes(record.endpointKind) ||
    !["HTTP", "TIMEOUT", "TRANSPORT"].includes(record.category) ||
    !(
      record.statusHTTP === "NONE" ||
      (Number.isInteger(record.statusHTTP) && record.statusHTTP >= 100 && record.statusHTTP <= 599)
    )
  )
    return null;
  return Object.freeze({
    schema: "contaos.single-request.api-failure.v1",
    phase: "REQUEST_API",
    endpointKind: record.endpointKind,
    statusHTTP: record.statusHTTP,
    category: record.category,
  });
}
function failRequestApi(code, endpointKind, statusHTTP, category, diagnostic) {
  const error = Object.assign(new Error(code), { code });
  if (
    diagnostic === true &&
    REQUEST_ENDPOINT_KINDS.includes(endpointKind) &&
    ["HTTP", "TIMEOUT", "TRANSPORT"].includes(category) &&
    (statusHTTP === "NONE" ||
      (Number.isInteger(statusHTTP) && statusHTTP >= 100 && statusHTTP <= 599))
  )
    requestApiFailureRecords.set(error, Object.freeze({ endpointKind, statusHTTP, category }));
  throw error;
}
function failRequestProof(code, source) {
  const error = Object.assign(new Error(code), { code }),
    diagnostic = requestApiDiagnostic(source);
  if (diagnostic)
    requestApiFailureRecords.set(
      error,
      Object.freeze({
        endpointKind: diagnostic.endpointKind,
        statusHTTP: diagnostic.statusHTTP,
        category: diagnostic.category,
      }),
    );
  throw error;
}

export function singleRequestGet({
  token,
  publicOnly,
  env = process.env,
  diagnostic = false,
  fetchImpl = fetch,
  now = Date.now,
}) {
  const environmentToken = assertRequestMetadataEnvironment(env, { requireToken: !publicOnly });
  if (!publicOnly && token !== environmentToken) fail("REQUEST_API_TOKEN");
  const deadline = now() + 60000;
  return async (path) => {
    if (
      path !== "" &&
      !/^\/(?:actions\/|git\/ref\/heads\/main$|commits\/[a-f0-9]{40}\/pulls\?|pulls\/\d+(?:\/reviews\?|$))/.test(
        path,
      )
    )
      fail("REQUEST_API_PATH");
    const endpointKind = requestEndpointKind(path);
    const url = "https://api.github.com/repos/" + SINGLE_REQUEST.repository + path;
    for (let attempt = 0; attempt < 2; attempt++) {
      const currentToken = assertRequestMetadataEnvironment(env, { requireToken: !publicOnly });
      if (!publicOnly && token !== currentToken) fail("REQUEST_API_TOKEN");
      const remaining = deadline - now();
      if (remaining <= 0) fail("REQUEST_API_TIMEOUT");
      const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (!publicOnly) {
        if (typeof token !== "string" || !token) fail("REQUEST_API_TOKEN");
        headers.Authorization = "Bearer " + token;
      }
      const signal = AbortSignal.timeout(Math.min(5000, remaining));
      let response;
      try {
        response = await fetchImpl(url, { headers, redirect: "error", signal });
        if (signal.aborted) throw new Error("REQUEST_API_TIMEOUT");
      } catch {
        if (deadline - now() <= 0) fail("REQUEST_API_TIMEOUT");
        if (signal.aborted && attempt === 0) continue;
        failRequestApi(
          "REQUEST_API_UNAVAILABLE",
          endpointKind,
          "NONE",
          signal.aborted ? "TIMEOUT" : "TRANSPORT",
          diagnostic,
        );
      }
      if (deadline - now() <= 0) fail("REQUEST_API_TIMEOUT");
      if (response.status !== 200)
        failRequestApi(
          "REQUEST_API_UNAVAILABLE",
          endpointKind,
          response.status,
          "HTTP",
          diagnostic,
        );
      let body;
      try {
        body = await response.text();
        if (signal.aborted) throw new Error("REQUEST_API_TIMEOUT");
      } catch {
        if (deadline - now() <= 0) fail("REQUEST_API_TIMEOUT");
        if (signal.aborted && attempt === 0) continue;
        failRequestApi(
          "REQUEST_API_UNAVAILABLE",
          endpointKind,
          200,
          signal.aborted ? "TIMEOUT" : "TRANSPORT",
          diagnostic,
        );
      }
      if (deadline - now() <= 0) fail("REQUEST_API_TIMEOUT");
      if (typeof body !== "string") fail("REQUEST_API_SCHEMA");
      if (Buffer.byteLength(body) > 4194304) fail("REQUEST_API_LIMIT");
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        fail("REQUEST_API_SCHEMA");
      }
      if (deadline - now() <= 0) fail("REQUEST_API_TIMEOUT");
      return parsed;
    }
    fail("REQUEST_API_TIMEOUT");
  };
}

const NAVIGATION_R1_PROOF = Object.freeze({
  schema: "contaos.navigation.r1.proof.v1",
  planSha: "83279bf28172e974778c3e788b8bf5718e23d9c1",
  r1HarnessSha: "1a7b55cdad67fc2f639fa2abfb5faff04062d08a",
  authRun: 43157856422,
  fixturesRun: 43157856534,
  reportSha256: "3d994303537f7e06d3c57b1dc1f1f69c763739edc6194909f331a69ac6cb348c",
  ledgerSha256: "accb159f71e8b965bff64317535dc371946c38e53073048b3551cee3d332a0a0",
  artifactDigest: "sha256:f08392462141b97763d9c8c4cf6918dad91a4c7bbb617fe556c4397495ca79a0",
});
export function validateNavigationR1Evidence(value) {
  if (
    !navigationPlain(value, Object.keys(NAVIGATION_R1_PROOF)) ||
    Object.entries(NAVIGATION_R1_PROOF).some(([key, expected]) => value[key] !== expected)
  )
    fail("NAVIGATION_R1_PROOF");
  return value;
}
export async function verifyNavigationR1Evidence({ get, git } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function" || isProxy(get) || isProxy(git))
      fail("NAVIGATION_R1_PROOF");
    const directory = "docs/frontend/auditorias/integracao-funcional-v1/fase2/";
    for (const [file, hash] of [
      ["R1_REPORT_ORIGINAL_2026-11-12.json", NAVIGATION_R1_PROOF.reportSha256],
      ["R1_LEDGER_2026-11-12.json", NAVIGATION_R1_PROOF.ledgerSha256],
    ]) {
      const raw = await git(["show", NAVIGATION_R1_PROOF.planSha + ":" + directory + file]);
      if (typeof raw !== "string" || Buffer.byteLength(raw) > 65536 || digest(raw) !== hash)
        fail("NAVIGATION_R1_PROOF");
    }
    const repository = (value) =>
      value?.id === 1442722734 &&
      value.full_name === SINGLE_REQUEST.repository &&
      value.private === false &&
      value.owner?.id === 352205055 &&
      value.owner.login === "contaos999999";
    for (const [id, workflow, name, file, conclusion, jobId, jobName, jobConclusion] of [
      [
        43157856422,
        411115674,
        "ContaOS Trilha A Autenticada",
        "contaos-trilha-a-authenticated.yml",
        "failure",
        130982262200,
        "Trilha A auditoria privada HML",
        "failure",
      ],
      [
        43157856534,
        411426169,
        "ContaOS Trilha A Fixtures",
        "contaos-trilha-a-fixtures.yml",
        "success",
        130981976647,
        "Trilha A preparacao sintetica HML",
        "skipped",
      ],
    ]) {
      const run = await get("/actions/runs/" + id);
      if (
        run?.id !== id ||
        run.workflow_id !== workflow ||
        run.name !== name ||
        run.path !== ".github/workflows/" + file ||
        run.event !== "workflow_run" ||
        run.head_sha !== NAVIGATION_R1_PROOF.r1HarnessSha ||
        run.head_branch !== "main" ||
        run.run_attempt !== 1 ||
        run.status !== "completed" ||
        run.conclusion !== conclusion ||
        !repository(run.repository) ||
        !repository(run.head_repository)
      )
        fail("NAVIGATION_R1_PROOF");
      const page = await get("/actions/runs/" + id + "/jobs?filter=all&per_page=100");
      if (
        !Number.isSafeInteger(page?.total_count) ||
        page.total_count < 1 ||
        page.total_count > 100 ||
        !Array.isArray(page.jobs) ||
        page.jobs.length !== page.total_count
      )
        fail("NAVIGATION_R1_PROOF");
      if (
        page.jobs.some(
          (job) =>
            job?.run_id !== id ||
            job.run_attempt !== 1 ||
            job.head_sha !== NAVIGATION_R1_PROOF.r1HarnessSha ||
            job.status !== "completed",
        )
      )
        fail("NAVIGATION_R1_PROOF");
      const jobs = page.jobs.filter((job) => job.id === jobId);
      if (jobs.length !== 1 || jobs[0].name !== jobName || jobs[0].conclusion !== jobConclusion)
        fail("NAVIGATION_R1_PROOF");
    }
    const page = await get("/actions/runs/43157856422/artifacts?per_page=100");
    if (page?.total_count !== 1 || !Array.isArray(page.artifacts) || page.artifacts.length !== 1)
      fail("NAVIGATION_R1_PROOF");
    const artifact = page.artifacts[0],
      run = artifact?.workflow_run;
    if (
      artifact?.id !== 13917231956 ||
      artifact.name !== "trilha-a-private-43157856422-1" ||
      artifact.size_in_bytes !== 1496 ||
      artifact.digest !== NAVIGATION_R1_PROOF.artifactDigest ||
      artifact.expired !== false ||
      run?.id !== 43157856422 ||
      run.repository_id !== 1442722734 ||
      run.head_repository_id !== 1442722734 ||
      run.head_branch !== "main" ||
      run.head_sha !== NAVIGATION_R1_PROOF.r1HarnessSha
    )
      fail("NAVIGATION_R1_PROOF");
    return Object.freeze({ ...NAVIGATION_R1_PROOF });
  } catch {
    fail("NAVIGATION_R1_PROOF");
  }
}

const NAVIGATION_R2_PROOF = Object.freeze({
  schema: "contaos.navigation.r2.proof.v1",
  planSha: "9030de4115041598bdc530e03c3c8a5c18d3a5ae",
  r2HarnessSha: "22b1a0f7b432d72c1456d5061dd2cafb529f62f2",
  authRun: 43208835561,
  fixturesRun: 43208835680,
  reportSha256: "b039701278b0e2b187421586df2c0385d0f8c3345ba4515ac8ca49021f222a42",
  ledgerSha256: "cfe17bea2c46dbfeea9ab7b1f5dba896a870d8e5e706664753a85f97b37e40bc",
  artifactDigest: "sha256:497d6e63d41b82b8d3ca394c19f07ecd9efac73d583ef154c9b87de1c87463d7",
});
export function validateNavigationR2Evidence(value) {
  if (
    !navigationPlain(value, Object.keys(NAVIGATION_R2_PROOF)) ||
    Object.entries(NAVIGATION_R2_PROOF).some(([key, expected]) => value[key] !== expected)
  )
    fail("NAVIGATION_R2_PROOF");
  return value;
}
export async function verifyNavigationR2Evidence({ get, git } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function" || isProxy(get) || isProxy(git))
      fail("NAVIGATION_R2_PROOF");
    const directory = "docs/frontend/auditorias/integracao-funcional-v1/fase2/";
    for (const [file, hash] of [
      ["R2_REPORT_ORIGINAL_2026-11-12.json", NAVIGATION_R2_PROOF.reportSha256],
      ["R2_LEDGER_2026-11-12.json", NAVIGATION_R2_PROOF.ledgerSha256],
    ]) {
      const raw = await git(["show", NAVIGATION_R2_PROOF.planSha + ":" + directory + file]);
      if (typeof raw !== "string" || Buffer.byteLength(raw) > 65536 || digest(raw) !== hash)
        fail("NAVIGATION_R2_PROOF");
    }
    const repository = (value) =>
      value?.id === 1442722734 &&
      value.full_name === SINGLE_REQUEST.repository &&
      value.private === false &&
      value.owner?.id === 352205055 &&
      value.owner.login === "contaos999999";
    for (const [id, workflow, name, file, conclusion, jobId, jobName, jobConclusion] of [
      [
        43208835561,
        411115674,
        "ContaOS Trilha A Autenticada",
        "contaos-trilha-a-authenticated.yml",
        "failure",
        131151386992,
        "Trilha A auditoria privada HML",
        "failure",
      ],
      [
        43208835680,
        411426169,
        "ContaOS Trilha A Fixtures",
        "contaos-trilha-a-fixtures.yml",
        "success",
        131151044364,
        "Trilha A preparacao sintetica HML",
        "skipped",
      ],
    ]) {
      const run = await get("/actions/runs/" + id);
      if (
        run?.id !== id ||
        run.workflow_id !== workflow ||
        run.name !== name ||
        run.path !== ".github/workflows/" + file ||
        run.event !== "workflow_run" ||
        run.head_sha !== NAVIGATION_R2_PROOF.r2HarnessSha ||
        run.head_branch !== "main" ||
        run.run_attempt !== 1 ||
        run.status !== "completed" ||
        run.conclusion !== conclusion ||
        !repository(run.repository) ||
        !repository(run.head_repository)
      )
        fail("NAVIGATION_R2_PROOF");
      const page = await get("/actions/runs/" + id + "/jobs?filter=all&per_page=100");
      if (
        !Number.isSafeInteger(page?.total_count) ||
        page.total_count < 1 ||
        page.total_count > 100 ||
        !Array.isArray(page.jobs) ||
        page.jobs.length !== page.total_count
      )
        fail("NAVIGATION_R2_PROOF");
      if (
        page.jobs.some(
          (job) =>
            job?.run_id !== id ||
            job.run_attempt !== 1 ||
            job.head_sha !== NAVIGATION_R2_PROOF.r2HarnessSha ||
            job.status !== "completed",
        )
      )
        fail("NAVIGATION_R2_PROOF");
      const jobs = page.jobs.filter((job) => job.id === jobId);
      if (jobs.length !== 1 || jobs[0].name !== jobName || jobs[0].conclusion !== jobConclusion)
        fail("NAVIGATION_R2_PROOF");
    }
    const page = await get("/actions/runs/43208835561/artifacts?per_page=100");
    if (page?.total_count !== 1 || !Array.isArray(page.artifacts) || page.artifacts.length !== 1)
      fail("NAVIGATION_R2_PROOF");
    const artifact = page.artifacts[0],
      run = artifact?.workflow_run;
    if (
      artifact?.id !== 13940103116 ||
      artifact.name !== "trilha-a-private-43208835561-1" ||
      artifact.size_in_bytes !== 1572 ||
      artifact.digest !== NAVIGATION_R2_PROOF.artifactDigest ||
      artifact.expired !== false ||
      run?.id !== 43208835561 ||
      run.repository_id !== 1442722734 ||
      run.head_repository_id !== 1442722734 ||
      run.head_branch !== "main" ||
      run.head_sha !== NAVIGATION_R2_PROOF.r2HarnessSha
    )
      fail("NAVIGATION_R2_PROOF");
    return Object.freeze({ ...NAVIGATION_R2_PROOF });
  } catch {
    fail("NAVIGATION_R2_PROOF");
  }
}

const NAVIGATION_R3_PROOF = Object.freeze({
  schema: "contaos.navigation.r3.proof.v1",
  planSha: "e01a208940d68a504d1c206e1b255eabe4938bb3",
  r3HarnessSha: "bb245f124aad6eb33c133100bde5c742978ef01c",
  authRun: 43252858747,
  fixturesRun: 43252858795,
  reportSha256: "688a75cce68f3d76d4346e5b1affd4ff952817c5849fa03dc5818105d470e4d1",
  ledgerSha256: "eea2fc6eb38d7ec6e9bec9fc1e5e2c2b0cba294232d70c361e346e70999d007a",
  artifactDigest: "sha256:94d55175c6354b27858503eea25349a27b6f732089c9126945f14993f6271311",
});
export function validateNavigationR3Evidence(value) {
  if (
    !navigationPlain(value, Object.keys(NAVIGATION_R3_PROOF)) ||
    Object.entries(NAVIGATION_R3_PROOF).some(([key, expected]) => value[key] !== expected)
  )
    fail("NAVIGATION_R3_PROOF");
  return value;
}
export async function verifyNavigationR3Evidence({ get, git } = {}) {
  try {
    if (typeof get !== "function" || typeof git !== "function" || isProxy(get) || isProxy(git))
      fail("NAVIGATION_R3_PROOF");
    const directory = "docs/frontend/auditorias/integracao-funcional-v1/fase2/";
    for (const [file, hash] of [
      ["R3_REPORT_ORIGINAL_2026-11-12.json", NAVIGATION_R3_PROOF.reportSha256],
      ["R3_LEDGER_2026-11-12.json", NAVIGATION_R3_PROOF.ledgerSha256],
    ]) {
      const raw = await git(["show", NAVIGATION_R3_PROOF.planSha + ":" + directory + file]);
      if (typeof raw !== "string" || Buffer.byteLength(raw) > 65536 || digest(raw) !== hash)
        fail("NAVIGATION_R3_PROOF");
    }
    const repository = (value) =>
      value?.id === 1442722734 &&
      value.full_name === SINGLE_REQUEST.repository &&
      value.private === false &&
      value.owner?.id === 352205055 &&
      value.owner.login === "contaos999999";
    for (const [id, workflow, name, file, conclusion, jobId, jobName, jobConclusion] of [
      [
        43252858747,
        411115674,
        "ContaOS Trilha A Autenticada",
        "contaos-trilha-a-authenticated.yml",
        "failure",
        131303938869,
        "Trilha A auditoria privada HML",
        "failure",
      ],
      [
        43252858795,
        411426169,
        "ContaOS Trilha A Fixtures",
        "contaos-trilha-a-fixtures.yml",
        "success",
        131303374970,
        "Trilha A preparacao sintetica HML",
        "skipped",
      ],
    ]) {
      const run = await get("/actions/runs/" + id);
      if (
        run?.id !== id ||
        run.workflow_id !== workflow ||
        run.name !== name ||
        run.path !== ".github/workflows/" + file ||
        run.event !== "workflow_run" ||
        run.head_sha !== NAVIGATION_R3_PROOF.r3HarnessSha ||
        run.head_branch !== "main" ||
        run.run_attempt !== 1 ||
        run.status !== "completed" ||
        run.conclusion !== conclusion ||
        !repository(run.repository) ||
        !repository(run.head_repository)
      )
        fail("NAVIGATION_R3_PROOF");
      const page = await get("/actions/runs/" + id + "/jobs?filter=all&per_page=100");
      if (
        !Number.isSafeInteger(page?.total_count) ||
        page.total_count < 1 ||
        page.total_count > 100 ||
        !Array.isArray(page.jobs) ||
        page.jobs.length !== page.total_count
      )
        fail("NAVIGATION_R3_PROOF");
      if (
        page.jobs.some(
          (job) =>
            job?.run_id !== id ||
            job.run_attempt !== 1 ||
            job.head_sha !== NAVIGATION_R3_PROOF.r3HarnessSha ||
            job.status !== "completed",
        )
      )
        fail("NAVIGATION_R3_PROOF");
      const jobs = page.jobs.filter((job) => job.id === jobId);
      if (jobs.length !== 1 || jobs[0].name !== jobName || jobs[0].conclusion !== jobConclusion)
        fail("NAVIGATION_R3_PROOF");
    }
    const page = await get("/actions/runs/43252858747/artifacts?per_page=100");
    if (page?.total_count !== 1 || !Array.isArray(page.artifacts) || page.artifacts.length !== 1)
      fail("NAVIGATION_R3_PROOF");
    const artifact = page.artifacts[0],
      run = artifact?.workflow_run;
    if (
      artifact?.id !== 13963014490 ||
      artifact.name !== "trilha-a-private-43252858747-1" ||
      artifact.size_in_bytes !== 2568 ||
      artifact.digest !== NAVIGATION_R3_PROOF.artifactDigest ||
      artifact.expired !== false ||
      run?.id !== 43252858747 ||
      run.repository_id !== 1442722734 ||
      run.head_repository_id !== 1442722734 ||
      run.head_branch !== "main" ||
      run.head_sha !== NAVIGATION_R3_PROOF.r3HarnessSha
    )
      fail("NAVIGATION_R3_PROOF");
    return Object.freeze({ ...NAVIGATION_R3_PROOF });
  } catch {
    fail("NAVIGATION_R3_PROOF");
  }
}

export async function verifySingleRequest({
  operation,
  env = process.env,
  publicOnly = true,
  diagnostic = false,
  get,
  git,
  read = readFile,
  stat = lstat,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  recoveryDocumentC8 = C8_RECOVERY_DOCUMENT,
}) {
  validateC8RecoveryDocument(recoveryDocumentC8);
  validateR18RecoveryDocument(R18_RECOVERY_DOCUMENT);
  validateR18RegistrationCandidate(R18_REGISTRATION_CANDIDATE);
  singleRequestContext = null;
  validatedR4ZeroAuth = null;
  validatedR7ZeroAuth = null;
  validatedR12ZeroAuth = null;
  validatedR14ZeroAuth = null;
  const metadataToken = assertRequestMetadataEnvironment(env, { requireToken: !publicOnly });
  if (env.GITHUB_EVENT_NAME === "workflow_dispatch") {
    if (operation === "audit") fail("AUDIT_BINDING_PENDING");
    if (env.GITHUB_REF !== "refs/heads/main") fail("REQUEST_EVENT");
    return { selected: true, operation, sha: env.CONTAOS_HARNESS_SHA, manual: true };
  }
  if (
    env.GITHUB_EVENT_NAME !== "workflow_run" ||
    !hash40(env.CONTAOS_HARNESS_SHA) ||
    !env.GITHUB_EVENT_PATH
  )
    fail("REQUEST_EVENT");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  git ||= async (args) =>
    (
      await execFile("git", args, {
        cwd: root,
        env: browserEnvironment(env),
        maxBuffer: 4194304,
        timeout: 10000,
      })
    ).stdout;
  let raw, event;
  try {
    const path = join(root, SINGLE_REQUEST.path),
      info = await stat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 4096) fail("REQUEST_FILE_MODE");
    raw = await read(path, "utf8");
    const eventRaw = await read(env.GITHUB_EVENT_PATH, "utf8");
    if (Buffer.byteLength(eventRaw) > 1048576) fail("REQUEST_EVENT");
    event = JSON.parse(eventRaw);
  } catch {
    fail("REQUEST_EVENT_FILE");
  }
  const request = parseSingleRequest(raw);
  // Both workflow_run subscribers start. The other operation exits before API,
  // environment approval or private work, so the selected subscriber never waits on itself.
  if (request.operation !== operation)
    return { selected: false, operation, sha: env.CONTAOS_HARNESS_SHA };
  requireSingleRequestOperation(operation, request);
  validateR13RecoveryDocument(R13_RECOVERY_DOCUMENT);
  validateR15RecoveryDocument(R15_RECOVERY_DOCUMENT);
  validateR16RecoveryDocument(R16_RECOVERY_DOCUMENT);
  validateR17RecoveryDocument(R17_RECOVERY_DOCUMENT);
  validateR18RecoveryDocument(R18_RECOVERY_DOCUMENT);
  validateR18RegistrationCandidate(R18_REGISTRATION_CANDIDATE);
  const sha = env.CONTAOS_HARNESS_SHA;
  const requestShas = await verifySingleRequestGit(request, sha, git, raw);
  get ||= singleRequestGet({ token: metadataToken, publicOnly, env, diagnostic });
  const navigationR1 =
    operation === "audit" ? await verifyNavigationR1Evidence({ get, git }) : null;
  const navigationR2 =
    operation === "audit" ? await verifyNavigationR2Evidence({ get, git }) : null;
  const navigationR3 =
    operation === "audit" ? await verifyNavigationR3Evidence({ get, git }) : null;
  const r4ZeroAuth = operation === "fixtures" ? await verifyR4ZeroAuth({ get, git }) : null;
  const r7ZeroAuth = await verifyR7ZeroAuth({ get, git });
  const r12ZeroAuth =
    operation === "fixtures"
      ? await verifyR12ZeroAuth({ get, git, parentSha: request.approved_parent_sha })
      : null;
  const r14ZeroAuth =
    operation === "fixtures"
      ? await verifyR14ZeroAuth({ get, git, parentSha: request.approved_parent_sha })
      : null;
  const repo = await get("");
  if (repo.full_name !== SINGLE_REQUEST.repository || repo.private !== false)
    fail("REQUEST_REPOSITORY");
  const expected = SINGLE_REQUEST[operation],
    opposite = SINGLE_REQUEST[operation === "fixtures" ? "audit" : "fixtures"];
  for (const spec of [expected, opposite]) {
    const workflow = await get("/actions/workflows/" + spec.id);
    if (
      workflow.id !== spec.id ||
      workflow.path !== spec.path ||
      workflow.name !== spec.name ||
      workflow.state !== "active"
    )
      fail("REQUEST_WORKFLOW");
  }
  const upstreamId = event.workflow_run?.id;
  if (
    !Number.isSafeInteger(upstreamId) ||
    upstreamId <= 0 ||
    !/^\d+$/.test(env.GITHUB_RUN_ID || "")
  )
    fail("REQUEST_EVENT");
  const upstream = await get("/actions/runs/" + upstreamId),
    current = await get("/actions/runs/" + env.GITHUB_RUN_ID);
  const main = await get("/git/ref/heads/main");
  validateSingleRequestEvent({
    event,
    env,
    upstream,
    current,
    operation,
    mainSha: main.object?.sha,
  });
  const associated = await listSingleRequestRows((page) =>
    get("/commits/" + sha + "/pulls?per_page=100&page=" + page),
  );
  if (associated.length !== 1 || !Number.isSafeInteger(associated[0].number)) fail("REQUEST_PULL");
  const pull = await get("/pulls/" + associated[0].number);
  const reviews = await listSingleRequestRows((page) =>
    get("/pulls/" + pull.number + "/reviews?per_page=100&page=" + page),
  );
  const ci = await listSingleRequestRuns((page) =>
    get(
      "/actions/runs?head_sha=" + pull.head.sha + "&event=pull_request&per_page=100&page=" + page,
    ),
  );
  const secondParent = (await git(["rev-list", "--parents", "-n", "1", sha])).trim().split(" ")[2];
  const pullProof = validateSingleRequestPull({
    pull,
    associated,
    reviews,
    ci,
    request,
    sha,
    secondParent,
  });
  const runs = await listSingleRequestRuns((page) =>
    get("/actions/workflows/" + expected.id + "/runs?per_page=100&page=" + page),
  );
  validateSingleRequestRuns({ current, runs, requestShas, workflowId: expected.id });
  let oppositeProven = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const others = await listSingleRequestRuns((page) =>
      get("/actions/workflows/" + opposite.id + "/runs?per_page=100&page=" + page),
    );
    const matching = others.filter(
      (r) => requestShas.includes(r.head_sha) && r.event === "workflow_run",
    );
    if (
      matching.some(
        (r) => r.head_sha !== sha || r.workflow_id !== opposite.id || r.run_attempt !== 1,
      ) ||
      matching.length > 1
    )
      fail("REQUEST_OPPOSITE");
    if (matching.length === 1) {
      const jobs = await get("/actions/runs/" + matching[0].id + "/jobs?filter=all&per_page=100");
      if (
        !Number.isInteger(jobs.total_count) ||
        jobs.total_count > 100 ||
        !Array.isArray(jobs.jobs) ||
        jobs.jobs.length !== jobs.total_count
      )
        fail("REQUEST_OPPOSITE");
      const privateJobs = jobs.jobs.filter((j) => j.name === opposite.privateName);
      if (privateJobs.length === 1 && privateJobs[0].conclusion === "skipped") {
        oppositeProven = true;
        break;
      }
      if (privateJobs.some((j) => j.conclusion && j.conclusion !== "skipped"))
        fail("REQUEST_OPPOSITE");
    }
    if (attempt < 2) await wait(10000);
  }
  if (!oppositeProven) fail("REQUEST_OPPOSITE");
  // Close queue and metadata races immediately before returning authorization.
  const finalMain = await get("/git/ref/heads/main");
  if (finalMain.object?.sha !== sha) fail("REQUEST_STALE");
  const finalRuns = await listSingleRequestRuns((page) =>
    get("/actions/workflows/" + expected.id + "/runs?per_page=100&page=" + page),
  );
  validateSingleRequestRuns({ current, runs: finalRuns, requestShas, workflowId: expected.id });
  singleRequestContext = {
    operation,
    sha,
    runId: env.GITHUB_RUN_ID,
    scope: operation === "audit" ? resolveC8AuditScope(request) : null,
  };
  return {
    selected: true,
    operation,
    sha,
    requestId: request.request_id,
    frontendSha: request.frontend_sha,
    deploymentId: request.deployment_id,
    upstreamId,
    currentRunId: current.id,
    parentSha: request.approved_parent_sha,
    requestSha256: digest(raw),
    ...pullProof,
    ...(operation === "audit"
      ? {
          auditScope: "C8",
          c8RecoverySha256: "3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee",
        }
      : {}),
    ...(navigationR1 ? { navigationR1 } : {}),
    ...(navigationR2 ? { navigationR2 } : {}),
    ...(navigationR3 ? { navigationR3 } : {}),
    ...(r4ZeroAuth ? { r4ZeroAuth } : {}),
    ...(r7ZeroAuth ? { r7ZeroAuth } : {}),
    ...(r12ZeroAuth ? { r12ZeroAuth } : {}),
    ...(r14ZeroAuth ? { r14ZeroAuth } : {}),
  };
}
async function singleRequestCli(mode) {
  assertRequestMetadataEnvironment(process.env);
  const operation = process.env.CONTAOS_REQUEST_OPERATION;
  if (!["fixtures", "audit"].includes(operation)) fail("REQUEST_OPERATION");
  const result = await verifySingleRequest({
    operation,
    publicOnly: false,
    diagnostic: true,
  });
  if (mode === "--request-preflight") {
    if (!process.env.GITHUB_OUTPUT) fail("REQUEST_OUTPUT");
    const values = {
      selected: String(result.selected),
      sha: result.sha,
      frontend_sha: result.frontendSha || "",
      deployment_id: result.deploymentId || "",
    };
    await appendFile(
      process.env.GITHUB_OUTPUT,
      Object.entries(values)
        .map(([k, v]) => k + "=" + v + "\n")
        .join(""),
    );
  }
  if (mode === "--request-revalidate" && result.selected && !result.manual) {
    await mkdir(".audit-work", { recursive: true, mode: 0o700 });
    const proof = {
      schema: "contaos.single-request.runtime.v1",
      createdAt: Date.now(),
      ...result,
      identity: await harnessIdentity(),
    };
    await writeFile(".audit-work/single-request.json", JSON.stringify(proof), { mode: 0o600 });
  }
  console.log(JSON.stringify({ phase: "SINGLE_REQUEST", ...result }));
}

export async function listSingleRequestRows(getPage) {
  const rows = [],
    ids = new Set();
  for (let page = 1; page <= 10; page++) {
    const part = await getPage(page);
    if (!Array.isArray(part) || part.length > 100) fail("REQUEST_PAGINATION");
    for (const row of part) {
      if (!Number.isSafeInteger(row?.id) || ids.has(row.id)) fail("REQUEST_PAGINATION");
      ids.add(row.id);
      rows.push(row);
    }
    if (part.length < 100) return rows;
  }
  fail("REQUEST_PAGINATION");
}
export function validateSingleRequestPull({
  pull,
  associated,
  reviews,
  ci,
  request,
  sha,
  secondParent,
}) {
  const repo = SINGLE_REQUEST.repository;
  if (
    !Array.isArray(associated) ||
    associated.length !== 1 ||
    associated[0].number !== pull?.number ||
    !Number.isSafeInteger(pull.number) ||
    pull.number <= 0 ||
    pull.merged !== true ||
    pull.state !== "closed" ||
    !pull.merged_at ||
    pull.merge_commit_sha !== sha ||
    pull.base?.ref !== "main" ||
    pull.base.repo?.full_name !== repo ||
    pull.base.sha !== request.approved_parent_sha ||
    pull.head?.repo?.full_name !== repo ||
    pull.head.sha !== secondParent ||
    !hash40(pull.head.sha) ||
    pull.changed_files !== 1
  )
    fail("REQUEST_PULL");
  const expected = JSON.stringify({
    schema: "contaos.single-request.review.v1",
    request_id: request.request_id,
    head_sha: pull.head.sha,
    critical: 0,
    important: 0,
    decision: "APROVAVEL",
  });
  const latest = reviews
    .filter((r) => r.user?.login === "contaos9999" && r.commit_id === pull.head.sha)
    .sort((a, b) => b.id - a.id)[0];
  if (
    !latest ||
    latest.state !== "COMMENTED" ||
    latest.body?.trim() !== expected ||
    !latest.submitted_at
  )
    fail("REQUEST_REVIEW");
  for (const spec of [
    {
      id: SINGLE_REQUEST.upstreamId,
      name: SINGLE_REQUEST.upstreamName,
      path: SINGLE_REQUEST.upstreamPath,
    },
    {
      id: 410005553,
      name: "ContaOS LOCK-TYPES-01 Double Barrier",
      path: ".github/workflows/lock-types-double-barrier.yml",
    },
  ]) {
    const latestRun = ci.filter((r) => r.workflow_id === spec.id).sort((a, b) => b.id - a.id)[0];
    if (
      !latestRun ||
      latestRun.name !== spec.name ||
      latestRun.path !== spec.path ||
      latestRun.head_sha !== pull.head.sha ||
      latestRun.event !== "pull_request" ||
      latestRun.head_branch !== pull.head.ref ||
      latestRun.repository?.full_name !== repo ||
      latestRun.head_repository?.full_name !== repo ||
      latestRun.status !== "completed" ||
      latestRun.conclusion !== "success"
    )
      fail("REQUEST_REQUIRED_CI");
  }
  return { pullNumber: pull.number, headSha: pull.head.sha, reviewId: latest.id };
}

export async function loadSingleRequestProof({
  operation,
  env = process.env,
  read = readFile,
  stat = lstat,
  git,
  identity = harnessIdentity,
  now = Date.now,
  fresh = false,
  recoveryDocumentC8 = C8_RECOVERY_DOCUMENT,
}) {
  validateC8RecoveryDocument(recoveryDocumentC8);
  validateR18RecoveryDocument(R18_RECOVERY_DOCUMENT);
  validateR18RegistrationCandidate(R18_REGISTRATION_CANDIDATE);
  singleRequestContext = null;
  validatedR4ZeroAuth = null;
  validatedR7ZeroAuth = null;
  validatedR12ZeroAuth = null;
  validatedR14ZeroAuth = null;
  requestEnvironmentChain(env);
  if (operation === "fixtures") {
    validateR13RecoveryDocument(R13_RECOVERY_DOCUMENT);
    validateR15RecoveryDocument(R15_RECOVERY_DOCUMENT);
    validateR16RecoveryDocument(R16_RECOVERY_DOCUMENT);
    validateR17RecoveryDocument(R17_RECOVERY_DOCUMENT);
    validateR18RecoveryDocument(R18_RECOVERY_DOCUMENT);
    validateR18RegistrationCandidate(R18_REGISTRATION_CANDIDATE);
  }
  if (env.GITHUB_EVENT_NAME === "workflow_dispatch") {
    assertRequestMetadataEnvironment(env, { requireToken: false });
    if (env.GITHUB_REF !== "refs/heads/main") fail("REQUEST_EVENT");
    if (operation === "audit") fail("AUDIT_BINDING_PENDING");
    if (operation === "fixtures") {
      const root = fileURLToPath(new URL("../../", import.meta.url));
      git ||= async (args) =>
        (
          await execFile("git", args, {
            cwd: root,
            env: browserEnvironment(env),
            maxBuffer: 1048576,
            timeout: 10000,
          })
        ).stdout;
      validatedR4ZeroAuth = await verifyR4ZeroAuth({
        get: singleRequestGet({ publicOnly: true, env }),
        git,
      });
    }
    return true;
  }
  assertPrivateRequestEnvironment(env);
  if (operation === "audit") {
    const requestPath = join(
      fileURLToPath(new URL("../../", import.meta.url)),
      SINGLE_REQUEST.path,
    );
    const requestInfo = await stat(requestPath);
    if (!requestInfo.isFile() || requestInfo.isSymbolicLink() || requestInfo.size > 4096)
      fail("REQUEST_FILE_MODE");
    let candidate;
    try {
      candidate = parseSingleRequest(await read(requestPath, "utf8"));
    } catch {
      fail("AUDIT_BINDING_PENDING");
    }
    requireSingleRequestOperation(operation, candidate);
  } else requireSingleRequestOperation(operation);
  if (
    env.GITHUB_EVENT_NAME !== "workflow_run" ||
    env.GITHUB_REF !== "refs/heads/main" ||
    env.GITHUB_REPOSITORY !== SINGLE_REQUEST.repository ||
    env.GITHUB_RUN_ATTEMPT !== "1"
  )
    fail("REQUEST_EVENT");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const proofPath = join(root, ".audit-work/single-request.json"),
    info = await stat(proofPath);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 8192) fail("REQUEST_RUNTIME");
  let proof;
  try {
    proof = JSON.parse(await read(proofPath, "utf8"));
  } catch {
    fail("REQUEST_RUNTIME");
  }
  const actual = await identity();
  if (
    proof.schema !== "contaos.single-request.runtime.v1" ||
    proof.selected !== true ||
    proof.operation !== operation ||
    proof.sha !== env.CONTAOS_HARNESS_SHA ||
    proof.currentRunId !== Number(env.GITHUB_RUN_ID) ||
    !Number.isSafeInteger(proof.createdAt) ||
    proof.createdAt > now() ||
    now() - proof.createdAt > (fresh ? 30000 : 4800000) ||
    proof.identity?.harnessSha !== actual.harnessSha ||
    proof.identity?.moduleHash !== actual.moduleHash ||
    proof.identity?.testHash !== actual.testHash ||
    actual.harnessSha !== proof.sha
  )
    fail("REQUEST_RUNTIME");
  const raw = await read(join(root, SINGLE_REQUEST.path), "utf8"),
    request = parseSingleRequest(raw, operation);
  if (
    digest(raw) !== proof.requestSha256 ||
    request.request_id !== proof.requestId ||
    request.frontend_sha !== proof.frontendSha ||
    request.deployment_id !== proof.deploymentId ||
    request.approved_parent_sha !== proof.parentSha
  )
    fail("REQUEST_RUNTIME");
  git ||= async (args) =>
    (
      await execFile("git", args, {
        cwd: root,
        env: browserEnvironment(env),
        maxBuffer: 4194304,
        timeout: 10000,
      })
    ).stdout;
  if (
    operation === "audit" &&
    (proof.auditScope !== "C8" ||
      proof.c8RecoverySha256 !== "3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee")
  )
    fail("REQUEST_RUNTIME");
  await verifySingleRequestGit(request, proof.sha, git, raw);
  if (operation === "audit") {
    validateNavigationR1Evidence(proof.navigationR1);
    validateNavigationR2Evidence(proof.navigationR2);
    validateNavigationR3Evidence(proof.navigationR3);
  }
  const event = JSON.parse(await read(env.GITHUB_EVENT_PATH, "utf8")),
    spec = SINGLE_REQUEST[operation];
  const current = {
    id: proof.currentRunId,
    workflow_id: spec.id,
    path: spec.path,
    name: spec.name,
    event: "workflow_run",
    head_branch: "main",
    head_sha: proof.sha,
    run_attempt: 1,
    repository: { full_name: SINGLE_REQUEST.repository },
    head_repository: { full_name: SINGLE_REQUEST.repository },
  };
  if (event.workflow_run?.id !== proof.upstreamId) fail("REQUEST_RUNTIME");
  validateSingleRequestEvent({
    event,
    env,
    upstream: event.workflow_run,
    current,
    operation,
    mainSha: proof.sha,
  });
  let restoredR4 = null;
  if (operation === "fixtures") {
    validateR4ZeroAuthProof(proof.r4ZeroAuth);
    restoredR4 = Object.freeze({ ...proof.r4ZeroAuth });
  }
  const restoredR7 = validateR7ZeroAuthProof(proof.r7ZeroAuth);
  const restoredR12 = operation === "fixtures" ? validateR12ZeroAuthProof(proof.r12ZeroAuth) : null;
  const restoredR14 = operation === "fixtures" ? validateR14ZeroAuthProof(proof.r14ZeroAuth) : null;
  if (restoredR4) validatedR4ZeroAuth = restoredR4;
  validatedR7ZeroAuth = restoredR7;
  if (restoredR12) validatedR12ZeroAuth = restoredR12;
  if (restoredR14) validatedR14ZeroAuth = restoredR14;
  singleRequestContext = {
    operation,
    sha: proof.sha,
    runId: env.GITHUB_RUN_ID,
    scope: operation === "audit" ? resolveC8AuditScope(request) : null,
  };
  return true;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch(async (error) => {
    const apiDiagnostic = requestApiDiagnostic(error);
    console.error(
      JSON.stringify({
        state: "BLOCKED",
        ...(apiDiagnostic ? { api: apiDiagnostic } : {}),
        code: /^[A-Z_]{1,80}$/.test(error?.code || "") ? error.code : "HARNESS_FAILURE",
        ...(error?.code === "BUILD_ENV_POLICY" && /^[A-Z_]{1,80}$/.test(error?.reason || "")
          ? { reason: error.reason }
          : {}),
      }),
    );
    process.exitCode = 1;
    if (
      singleRequestEventAllowed(process.env, process.env.CONTAOS_REQUEST_OPERATION || "audit") &&
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

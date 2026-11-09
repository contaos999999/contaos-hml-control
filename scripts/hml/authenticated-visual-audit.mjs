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
  const contracts = [
    ...proof.get_contracts,
    ...(rbacEnabled ? [rq] : []),
    ...(v109Enabled ? [{ ...vq, name: "v109_lists_page0" }] : []),
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
  let invalid = false,
    pending = 0,
    revision = 0,
    mutations = null;
  const invalidate = () => {
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
  document.addEventListener("visibilitychange", invalidate, { once: true });
  if (!window.navigation?.addEventListener) invalidate();
  else window.navigation.addEventListener("navigate", invalidate, { once: true });
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
    if (headerSeen && !ready) invalidate();
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
          invalidate();
      } catch {}
      return result;
    }
    if (!current()) return result;
    pending++;
    const deadline = setTimeout(invalidate, 10000);
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
            if (!receipt || !current()) invalidate();
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
      read: () => {
        if (headerSeen && !headerCurrent()) invalidate();
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
export function run78VisualSelection(item) {
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

export function run78VisualEvidenceValid(row) {
  const selection = run78VisualSelection(row);
  if (!selection) return false;
  if (!selection.required) return true;
  if (
    !privateCases().some(
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

export function preservedPrivateCase(item) {
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
  let closed = false,
    canceled = 0;
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
        };
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
    await loadSingleRequestProof({ operation: process.env.CONTAOS_REQUEST_OPERATION });
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
        timeout: 45000,
        maxBuffer: 1048576,
      },
    );
    if (
      !/^# pass 1$/m.test(visual.stdout) ||
      !/^# fail 0$/m.test(visual.stdout) ||
      !/^# skipped 0$/m.test(visual.stdout)
    )
      fail("VISUAL_NATIVE");
  } catch {
    fail("VISUAL_NATIVE");
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
      v112BrowserCases,
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
  const state = privacy78Pages.get(page),
    generation = state?.generation;
  const initialReceipt =
    state?.verified && (await page.evaluate(() => window.__contaosPrivacy78?.read() ?? null));
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

  let fieldContext;
  if (rendered !== null && state?.verified && !state.closed) {
    const item = privateCases().find((i) => HML_ORIGIN + i.path === page.url());
    if (item && ["V109", "V111", "V112", "V115", "V122"].includes(item.surface)) {
      const receipt = await page.evaluate(() => {
        const header = document.querySelector('header[aria-label="Organização atual"]');
        if (
          !header?.textContent.includes("ContaOS HML Teste") ||
          !/Situação:\s*ativa/i.test(header.textContent)
        )
          return null;
        return window.__contaosPrivacy78?.read() ?? null;
      });
      const is109 = item.surface === "V109";
      const is112 = item.surface === "V112";
      const anchor =
        receipt &&
        initialReceipt &&
        initialReceipt.revision === receipt.revision &&
        (await page.evaluate(
          is109 ? privacy109FieldAnchor : is112 ? privacy112FieldAnchor : privacy78FieldAnchor,
          is109 ? { proof: state.v109Proof } : { surface: item.surface, proof: state.proof },
        ));
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
        else {
          const locator = page.locator(anchor.selector);
          if ((await locator.count()) === anchor.count)
            fieldSnapshot = (await locator.nth(anchor.index).ariaSnapshot()).trim();
        }
        if (fieldSnapshot !== null || fieldSnapshots !== null) {
          const after = await page.evaluate(() => window.__contaosPrivacy78?.read() ?? null);
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
  const privacy =
    rendered === null
      ? { rendered: { reason: "OPAQUE_MEDIA", unknownCount: 0 } }
      : {
          rendered: classifyArtifactText(rendered, words, { fieldContext }),
          snapshot: classifyArtifactText(snapshot, words, { snapshot: true, fieldContext }),
        };
  if (diagnostics) Object.assign(diagnostics, privacy);
  if (Object.values(privacy).some((result) => result.reason !== "ALLOWED")) return null;
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
  if (!singleRequestEventAllowed(process.env, "audit")) fail("AUDIT_MAIN_ONLY");
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
        return collectVisualMetrics(page, captureItem);
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
    const privacyProof = await loadPrivacy78Proof();
    const rbacProof = await loadPrivacy78RbacProof();
    const v109Proof = await loadPrivacy109Proof();
    const wireProof = await loadPrivacyWireProof();
    await context.addInitScript(privacy78Runtime, {
      proof: privacyProof,
      rbacProof,
      v109Proof,
      wireProof,
      install: true,
    });
    page = await context.newPage();
    const privacyState = {
      proof: privacyProof,
      rbacProof,
      v109Proof,
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
    let surface = null;
    for (const item of privateCases()) {
      captureItem = item;
      const key = caseKey(item),
        record = { ...item, visualSelection: run78VisualSelection(item), status: "PENDENTE" };
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
      let diagnosticStage = "CASE_NAVIGATION";
      captureMode = null;
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
        diagnosticStage = "CAPTURE_SUPPLEMENT";
        captureMode = item.width >= 768 ? "SIDEBAR_COLLAPSED" : "MOBILE_MENU";
        record.sidebarSupplement = await sidebarProbe(page, item, key, words, saveScreenshot);
        diagnosticStage = "NAVIGATION_PROBE";
        record.navigationVerified = await navigationProbe(page, item, fence);
        diagnosticStage = "FINAL_CASE_CHECK";
        record.status =
          validateCase(record) &&
          run78VisualEvidenceValid(record) &&
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
    if (privacyState) privacyState.verified = false;
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
export async function collectVisualMetrics(page, item) {
  const measured = await page.evaluate(({ surface, theme }) => {
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
    const controls = [
      ...document.querySelectorAll('input:not([type="hidden"]),select,textarea,button,a[href]'),
    ].filter((e) => {
      if (!visible(e) || e.closest("[inert]")) return false;
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
      viewport,
      targets,
      pairs: [],
      table,
      dates,
      contrast,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, item);
  const identityPassed = measured.viewport.width === item.width && measured.theme === item.theme;
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
    !run78VisualSelection(item) ||
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

// A request authorizes one selected operation, never a general workflow_run login.
export const SINGLE_REQUEST = Object.freeze({
  repository: "contaos999999/contaos-hml-control",
  path: "docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json",
  upstreamId: 406076025,
  upstreamPath: ".github/workflows/contaos-frontend-zero-drift.yml",
  upstreamName: "ContaOS Frontend Zero-Drift",
  gateSha: "31b68f3cadbdc13a82bae23a43c35616f873d70b",
  autoGateSha: "122242fd421b348aef229683c0d3969611bce1db",
  fixturesSha: "5dc57275d6e95f066ec751fad7a0af50005ab17f",
  fixtures: Object.freeze({
    id: 411426169,
    name: "ContaOS Trilha A Fixtures",
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    nonce: "trilha-a-fixtures-20261108-r1",
    privateName: "Trilha A preparacao sintetica HML",
  }),
  audit: Object.freeze({
    id: 411115674,
    name: "ContaOS Trilha A Autenticada",
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    nonce: "trilha-a-audit-20261108-r1",
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

export function parseSingleRequest(raw, operation) {
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
    parsed.request_id !== SINGLE_REQUEST[parsed.operation]?.nonce ||
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
export function requireSingleRequestOperation(operation) {
  if (operation === "audit") fail("AUDIT_BINDING_PENDING");
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
    const historic = parseSingleRequest(raw);
    if (historic.request_id === request.request_id) requestShas.push(commit);
  }
  return requestShas;
}

export function singleRequestGet({ token, publicOnly, fetchImpl = fetch, now = Date.now }) {
  const deadline = now() + 60000;
  return async (path) => {
    if (
      path !== "" &&
      !/^\/(?:actions\/|git\/ref\/heads\/main$|commits\/[a-f0-9]{40}\/pulls\?|pulls\/\d+(?:\/reviews\?|$))/.test(
        path,
      )
    )
      fail("REQUEST_API_PATH");
    const remaining = deadline - now();
    if (remaining <= 0) fail("REQUEST_API_TIMEOUT");
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (!publicOnly) {
      if (typeof token !== "string" || !token) fail("REQUEST_API_TOKEN");
      headers.Authorization = "Bearer " + token;
    }
    let response;
    try {
      response = await fetchImpl(
        "https://api.github.com/repos/" + SINGLE_REQUEST.repository + path,
        { headers, redirect: "error", signal: AbortSignal.timeout(Math.min(5000, remaining)) },
      );
    } catch {
      fail("REQUEST_API_UNAVAILABLE");
    }
    if (response.status !== 200) fail("REQUEST_API_UNAVAILABLE");
    const text = await response.text();
    if (Buffer.byteLength(text) > 4194304) fail("REQUEST_API_LIMIT");
    try {
      return JSON.parse(text);
    } catch {
      fail("REQUEST_API_SCHEMA");
    }
  };
}
export async function verifySingleRequest({
  operation,
  env = process.env,
  publicOnly = true,
  get,
  git,
  read = readFile,
  stat = lstat,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  singleRequestContext = null;
  if (env.GITHUB_EVENT_NAME === "workflow_dispatch") {
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
  requireSingleRequestOperation(operation);
  const sha = env.CONTAOS_HARNESS_SHA;
  const requestShas = await verifySingleRequestGit(request, sha, git, raw);
  get ||= singleRequestGet({ token: env.CONTAOS_ACTIONS_READ_TOKEN, publicOnly });
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
  singleRequestContext = { operation, sha, runId: env.GITHUB_RUN_ID };
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
  };
}
async function singleRequestCli(mode) {
  const operation = process.env.CONTAOS_REQUEST_OPERATION;
  if (!["fixtures", "audit"].includes(operation)) fail("REQUEST_OPERATION");
  const result = await verifySingleRequest({
    operation,
    publicOnly: mode === "--request-revalidate",
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
}) {
  singleRequestContext = null;
  if (env.GITHUB_EVENT_NAME === "workflow_dispatch") {
    if (env.GITHUB_REF !== "refs/heads/main") fail("REQUEST_EVENT");
    return true;
  }
  requireSingleRequestOperation(operation);
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
  await verifySingleRequestGit(request, proof.sha, git, raw);
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
  singleRequestContext = { operation, sha: proof.sha, runId: env.GITHUB_RUN_ID };
  return true;
}

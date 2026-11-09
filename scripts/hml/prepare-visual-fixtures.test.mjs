import * as sut from "./prepare-visual-fixtures.mjs";
import test from "node:test";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import {
  createIntentBroker,
  FIXTURE,
  validateBusinessPayload,
  safeReceipt,
  waitOfficialPhase,
} from "./prepare-visual-fixtures.mjs";
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const payload = { p_id_contrato: FIXTURE.contract, p_competencia_referencia: "2026-10-01" };
const request = (body = payload, extra = {}) => ({
  url: FIXTURE.api + "/rest/v1/rpc/criar_competencia",
  method: "POST",
  postData: JSON.stringify(body),
  stage: "REQUEST",
  sessionId: "s",
  interceptionId: "i",
  ...extra,
});
function broker(options = {}) {
  return createIntentBroker({
    readPolicy: () => false,
    persist: () => true,
    competenceGateAmended: true,
    ...options,
  });
}
function arm(b, requestId = randomUUID()) {
  return b.arm({
    rpc: "criar_competencia",
    payload,
    requestId,
    verified: { context: true, capability: true, reconciled: true },
  });
}
test("default remains closed, only explicitly injected read policy survives", () => {
  const b = broker();
  assert.equal(b.policy(request()), false);
  const c = broker({ readPolicy: (r) => r.method === "GET" });
  assert.equal(c.policy({ method: "GET", stage: "REQUEST" }), true);
  assert.equal(c.policy(request()), false);
});
test("one immutable intention permits matching POST once; response stage is nonconsuming", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { method: "OPTIONS" })), true);
  assert.equal(b.policy(request()), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
  assert.equal(b.policy(request()), false);
});
test("extra keys and wrong values denied; malformed JSON freezes", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request({ ...payload, evil: true })), false);
  assert.equal(b.policy(request({ ...payload, p_id_contrato: id })), false);
  assert.equal(
    b.policy(request(payload, { postData: '{"p_id_contrato":"x","p_id_contrato":"y"}' })),
    false,
  );
  assert.equal(b.policy(request()), false);
  assert.equal(b.snapshot().frozen, true);
});
test("literal destination only; no query redirect, encoding, other RPC or preflight", () => {
  const b = broker();
  arm(b);
  for (const url of [
    FIXTURE.api + "/rest/v1/rpc/criar_competencia?x=1",
    FIXTURE.api + "/rest/v1/rpc/%63riar_competencia",
    "https://evil.test/rest/v1/rpc/criar_competencia",
    FIXTURE.api + "/rest/v1/rpc/aprovar_apresentacao",
  ])
    assert.equal(b.policy(request(payload, { url })), false);
  assert.equal(
    b.policy(
      request(payload, {
        method: "OPTIONS",
        url: FIXTURE.api + "/rest/v1/rpc/aprovar_apresentacao",
      }),
    ),
    false,
  );
});
test("expiry is15 seconds and cannot be renewed; body at most64KiB", () => {
  let now = 0;
  const b = broker({ now: () => now });
  arm(b);
  now = 15000;
  assert.equal(b.policy(request()), false);
  assert.throws(() => arm(b), /INTENT_PENDING/);
  assert.equal(b.policy(request(payload, { postData: " ".repeat(65537) })), false);
});
test("business budget24 and no replacement or blind retry", () => {
  const b = broker();
  for (let i = 0; i < 24; i++) {
    arm(b);
    assert.equal(b.policy(request()), true);
    b.resolve("confirmed");
  }
  assert.throws(() => arm(b), /INTENT_BUDGET/);
  const c = broker();
  arm(c);
  assert.throws(() => arm(c), /INTENT_PENDING/);
  assert.throws(() => c.resolve("confirmed"), /INTENT_NOT_SENT/);
});
test("uncertain, denied or stale state freezes broker", () => {
  for (const result of ["uncertain", "denied", "stale"]) {
    const b = broker();
    arm(b);
    b.policy(request());
    b.resolve(result);
    assert.throws(() => arm(b), /INTENT_FROZEN/);
  }
});
test("gate context, capabilities, reconciliation and documented operations required", () => {
  const b = broker();
  assert.throws(
    () =>
      b.arm({
        rpc: "criar_competencia",
        payload,
        requestId: id,
        verified: { context: true, capability: false, reconciled: true },
      }),
    /PRECONDITION/,
  );
  assert.equal(validateBusinessPayload("delete_competencia", {}), false);
  assert.equal(
    validateBusinessPayload("criar_competencia", {
      ...payload,
      p_competencia_referencia: "2026-11-01",
    }),
    false,
  );
});
test("source correction and closed list payload, including nested keys", () => {
  assert.equal(FIXTURE.source, "8b942e46-a29b-40d9-8ad4-04aaf9124a34");
  const b = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_lista: null,
    p_versao_esperada: null,
    p_acao: "criar_lista",
    p_payload: {
      nome: FIXTURE.listName,
      descricao: FIXTURE.listDescription,
      vigencia_inicio: "2026-01-01",
      vigencia_fim: null,
    },
    p_motivo: FIXTURE.reason,
    p_request_id: id,
  };
  assert.equal(validateBusinessPayload("executar_comando_lista_v1", b), true);
  assert.equal(
    validateBusinessPayload("executar_comando_lista_v1", { ...b, p_acao: "descartar_rascunho" }),
    false,
  );
  assert.equal(
    validateBusinessPayload("executar_comando_lista_v1", {
      ...b,
      p_payload: { ...b.p_payload, user: id },
    }),
    false,
  );
});
test("dynamic IDs require current official origin and relationship", () => {
  const p = { p_id_competencia: id, p_tipo: "completa" };
  assert.equal(validateBusinessPayload("solicitar_analise_competencia", p), false);
  assert.equal(
    validateBusinessPayload("solicitar_analise_competencia", p, {
      competencies: [
        {
          id,
          month: "2026-10-01",
          organization: FIXTURE.organization,
          contract: FIXTURE.contract,
          official: true,
          current: true,
        },
      ],
    }),
    true,
  );
});
test("receipt rejects Auth/JWT/PII, extra keys, noncanonical UUID, unknown states", () => {
  for (const dirty of [
    { token: "x" },
    { user: { id } },
    { email: "x@y.test" },
    { access_token: "eyJ.abc.def" },
    { state: "anything" },
    { requestId: id.toUpperCase() },
  ])
    assert.throws(() => safeReceipt(dirty), /RECEIPT/);
  const r = safeReceipt({ requestId: id, state: "confirmed", rpc: "criar_competencia" });
  assert.equal(r.requestId, id);
});
test("no generic direct mutation: only approved document reuse RPC", async () => {
  const m = await import("./prepare-visual-fixtures.mjs");
  assert.equal(typeof m.reuseApprovedDocument, "function");
  assert.equal(m.directRpc, undefined);
});
test("polling is bounded300s,min2s and never sends mutations", async () => {
  let calls = 0,
    now = 0;
  const value = await waitOfficialPhase({
    read: async () => ({ state: ++calls === 2 ? "ready" : "pending" }),
    ready: (r) => r.state === "ready",
    now: () => now,
    wait: async (ms) => {
      assert.ok(ms >= 2000);
      now += ms;
    },
  });
  assert.equal(value.state, "ready");
  assert.equal(calls, 2);
  await assert.rejects(
    () =>
      waitOfficialPhase({
        read: async () => ({ state: "denied" }),
        ready: () => false,
        wait: async () => {},
      }),
    /PHASE_DENIED/,
  );
});

test("UI UUID seals at Request stage and synchronous persistence precedes permission", () => {
  const events = [];
  const b = broker({
    persist: (r) => {
      events.push(r.requestId);
      return true;
    },
  });
  const p = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_lista: null,
    p_versao_esperada: null,
    p_acao: "criar_lista",
    p_payload: {
      nome: FIXTURE.listName,
      descricao: FIXTURE.listDescription,
      vigencia_inicio: "2026-01-01",
      vigencia_fim: null,
    },
    p_motivo: FIXTURE.reason,
  };
  b.arm({
    rpc: "executar_comando_lista_v1",
    payload: p,
    uiGeneratedKey: "p_request_id",
    verified: { context: true, capability: true, reconciled: true },
  });
  assert.equal(
    b.policy({
      url: FIXTURE.api + "/rest/v1/rpc/executar_comando_lista_v1",
      method: "POST",
      postData: JSON.stringify({ ...p, p_request_id: id }),
      stage: "REQUEST",
      sessionId: "s",
      interceptionId: "i",
    }),
    true,
  );
  assert.deepEqual(events, [id]);
});
test("async, throwing, false or absent persistence fails closed", () => {
  for (const persist of [
    undefined,
    () => false,
    () => Promise.resolve(true),
    () => {
      throw Error("secret");
    },
  ]) {
    const b = broker({ persist });
    if (!persist) {
      assert.throws(() => arm(b), /PERSIST/);
      continue;
    }
    arm(b);
    assert.equal(b.policy(request()), false);
  }
});
test("competence payload2keys is blocked until amended gate integrated", () => {
  const b = broker({ competenceGateAmended: false });
  assert.throws(() => arm(b), /GATE_AMENDMENT/);
});

test("response requires matching native session and interception, matching payload, only once", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
  assert.equal(b.policy(request()), true);
  for (const extra of [
    { sessionId: "other" },
    { interceptionId: "other" },
    { postData: JSON.stringify({ ...payload, p_competencia_referencia: "2026-09-01" }) },
  ])
    assert.equal(b.policy(request(payload, { stage: "RESPONSE", ...extra })), false);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), true);
  assert.equal(b.policy(request(payload, { stage: "RESPONSE" })), false);
});
test("preflight has own native ticket and does not authorize extra POST", () => {
  const b = broker();
  arm(b);
  assert.equal(b.policy(request(payload, { method: "OPTIONS", interceptionId: "o" })), true);
  assert.equal(
    b.policy(request(payload, { method: "OPTIONS", interceptionId: "o", stage: "RESPONSE" })),
    true,
  );
  assert.equal(b.policy(request()), true);
  assert.equal(b.policy(request()), false);
  assert.equal(b.policy(request(payload, { interceptionId: "o" })), false);
});
test("public key permits public client role only; JWT is never returned", async () => {
  const { publicClientKey } = await import("./prepare-visual-fixtures.mjs");
  const jwt = (b) => "e30." + Buffer.from(JSON.stringify(b)).toString("base64url") + ".sig";
  assert.equal(publicClientKey(jwt({ role: "service_role", ref: "gklhhhyosgasnyoxlrui" })), false);
  assert.equal(publicClientKey(jwt({ role: "authenticated", ref: "gklhhhyosgasnyoxlrui" })), false);
  assert.equal(publicClientKey(jwt({ role: "anon", ref: "other" })), false);
  assert.equal(publicClientKey(jwt({ role: "anon", ref: "gklhhhyosgasnyoxlrui" })), true);
});
test("cleanup runs even if login or execution fails; failed logout prevents success", async () => {
  const { withRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  for (const phase of ["login", "execute", "logout"]) {
    const calls = [];
    const runtime = {
      login: async () => {
        calls.push("login");
        if (phase === "login") throw Error("LOGIN_FAILED");
      },
      logout: async () => {
        calls.push("logout");
        if (phase === "logout") throw Error("LOGOUT_FAILED");
      },
      clear: () => calls.push("clear"),
    };
    await assert.rejects(
      () =>
        withRuntimeLogin(runtime, { email: "synthetic", password: "redacted" }, async () => {
          calls.push("execute");
          if (phase === "execute") throw Error("EXECUTE_FAILED");
        }),
      /FAILED/,
    );
    assert.deepEqual(calls.slice(-2), ["logout", "clear"]);
  }
});
test("runtime is closed without normal auth and reconciled context", async () => {
  const { createRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const listeners = new Map();
  const page = { on: (k, v) => listeners.set(k, v), off: (k) => listeners.delete(k) };
  const runtime = createRuntimeLogin({
    page,
    fence: {},
    waitOrganization: async () => {},
    openOrganizationSelector: async () => {},
    verifyContext: async () => true,
  });
  assert.equal(runtime.token, undefined);
  assert.equal(runtime.apikey, undefined);
  await assert.rejects(() => runtime.reuseDocument({}), /DOCUMENT_SESSION/);
  runtime.clear();
  assert.equal(listeners.size, 0);
});
test("payload parser rejects escaped duplicate keys, deep JSON, nonJSON and64KiB+", async () => {
  const { parseBusinessJson } = await import("./prepare-visual-fixtures.mjs");
  for (const text of [
    '{"x":1,"\\u0078":2}',
    '{"__proto__":{}}',
    '{"x":NaN}',
    "{}x",
    "[".repeat(40) + "0" + "]".repeat(40),
    " ".repeat(65537),
  ])
    assert.throws(() => parseBusinessJson(text), /BODY/);
  assert.deepEqual(parseBusinessJson('{"a":[true,null,2],"b":"x"}'), {
    a: [true, null, 2],
    b: "x",
  });
});
test("guard rejects unknown native stage and missing correlation identifiers", () => {
  const b = broker();
  arm(b);
  for (const change of [
    { stage: undefined },
    { stage: "request" },
    { sessionId: undefined },
    { interceptionId: undefined },
  ])
    assert.equal(b.policy(request(payload, change)), false);
  assert.equal(b.policy(request()), true);
});
test("CLI permanece fechado sem comando de preparação explícito", async () => {
  const { runCli } = await import("./prepare-visual-fixtures.mjs");
  await assert.rejects(() => runCli([]), /PREPARER_CLI_USAGE/);
});

test("confirmed intention keys cannot be reused for a later mutation", () => {
  const b = broker();
  arm(b, id);
  assert.equal(b.policy(request()), true);
  b.resolve("confirmed");
  assert.throws(() => arm(b, id), /INTENT_PAYLOAD/);
});
function fakeRuntimePage({ logoutFails = false, wrongContext = false } = {}) {
  const listeners = new Map(),
    events = [];
  const jwt = (b) => "e30." + Buffer.from(JSON.stringify(b)).toString("base64url") + ".sig";
  const key = jwt({ role: "anon", ref: "gklhhhyosgasnyoxlrui" }),
    token = jwt({
      role: "authenticated",
      iss: FIXTURE.api + "/auth/v1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  const control = (name) => ({
    fill: async () => {},
    count: async () => 1,
    innerText: async () => "Situação: ativa",
    filter() {
      return this;
    },
    click: async () => {
      events.push(name);
      if (name === "Entrar") {
        listeners.get("request")?.({
          url: () => FIXTURE.api + "/auth/v1/token?grant_type=password",
          headerValue: async () => key,
        });
        listeners.get("response")?.({
          url: () => FIXTURE.api + "/auth/v1/token?grant_type=password",
          request: () => ({ method: () => "POST" }),
          status: () => 200,
          headerValue: async () => null,
          body: async () =>
            Buffer.from(
              JSON.stringify({
                access_token: token,
                refresh_token: "not retained",
                user: { email: "never exported" },
              }),
            ),
        });
      }
      if (name === "Sair" && logoutFails) throw Error("PRIVATE");
    },
  });
  const page = {
    on: (k, v) => listeners.set(k, v),
    off: (k) => listeners.delete(k),
    goto: async () => {},
    locator: () => control("field"),
    getByRole: (r, o) => control(o?.name || r),
    waitForURL: async () => {},
    evaluate: async () => 204,
  };
  return {
    page,
    events,
    listeners,
    options: {
      page,
      fence: { drain: async () => {}, assertSafe() {} },
      waitOrganization: async () => {},
      openOrganizationSelector: async () => {},
      verifyContext: async () => !wrongContext,
    },
  };
}
test("normal login collects only own access token in closure, confirms MASTER/context, clears/logout", async () => {
  const { createRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const f = fakeRuntimePage(),
    runtime = createRuntimeLogin(f.options);
  assert.equal(await runtime.login({ email: "synthetic", password: "test-only" }), true);
  assert.equal(runtime.access_token, undefined);
  assert.equal(runtime.user, undefined);
  assert.equal(await runtime.context(), undefined);
  assert.equal(await runtime.logout(), true);
  assert.equal(f.listeners.size, 0);
  await assert.rejects(() => runtime.reuseDocument({}), /DOCUMENT_SESSION/);
  assert.deepEqual(f.events, ["Entrar", "radio", "Continuar", "Sair"]);
});
test("context mismatch yields closed code and cleanup still logs out", async () => {
  const { createRuntimeLogin, withRuntimeLogin } = await import("./prepare-visual-fixtures.mjs");
  const f = fakeRuntimePage({ wrongContext: true });
  const runtime = createRuntimeLogin(f.options);
  await assert.rejects(
    () =>
      withRuntimeLogin(runtime, { email: "synthetic", password: "test-only" }, async () =>
        assert.fail(),
      ),
    /^Error: LOGIN_FAILED$/,
  );
  assert.equal(f.listeners.size, 0);
  assert.equal(f.events.at(-1), "Sair");
});
test("approved file evidence is exact and request ID must equal document key", async () => {
  const { approvedFile } = await import("./prepare-visual-fixtures.mjs");
  const file = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
    id: FIXTURE.file,
    document: FIXTURE.contractualDocument,
    status: "aprovado",
    mime: "text/plain",
    bytes: 285,
    sha256: FIXTURE.fileHash,
  };
  assert.equal(approvedFile(file), true);
  for (const change of [
    { status: "pendente" },
    { bytes: 286 },
    { sha256: "0".repeat(64) },
    { organization: id },
  ])
    assert.equal(approvedFile({ ...file, ...change }), false);
});
test("all twelve commands use exact nested schemas and closed constant values", async () => {
  const { readFileSync } = await import("node:fs");
  const text = readFileSync(
    new URL(
      "../../docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
      import.meta.url,
    ),
    "utf8",
  );
  const official = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const evidence = {
    competencies: [{ ...official, id, month: "2026-09-01" }],
    source: {
      ...official,
      id: FIXTURE.source,
      ...sut.SOURCE_FIELDS,
      version: 1,
    },
    sourceVersions: [
      {
        ...official,
        id,
        source: FIXTURE.source,
        hash: FIXTURE.fileHash,
        canApprove: true,
        state: "rascunho",
      },
    ],
    requirements: [{ ...official, id, competency: id, code: "AUD-A-TXT-001" }],
    file: {
      ...official,
      id: FIXTURE.file,
      document: FIXTURE.contractualDocument,
      status: "aprovado",
      mime: "text/plain",
      bytes: 285,
      sha256: FIXTURE.fileHash,
    },
    analysisCurrent: true,
    analysisComplete: true,
    opinionGate: true,
    opinions: [{ ...official, id, competency: id }],
    opinionApproved: true,
    compliance: 100,
    presentationApproved: true,
    allowedRegister: true,
    review: {
      ...official,
      canReview: true,
      materialPresenceVerified: true,
      extractedExcerpt: FIXTURE.excerpt,
      fileHash: FIXTURE.fileHash,
      competency: id,
      requirement: id,
      code: "AUD-A-TXT-001",
      execution: id,
      result: id,
      documentVersion: id,
      hash: FIXTURE.fileHash,
    },
  };
  const vectors = {
    registrar_versao_fonte_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_fonte: FIXTURE.source,
      p_inicio_vigencia: "2026-01-01",
      p_fim_vigencia: null,
      p_id_arquivo: null,
      p_conteudo_texto: text,
      p_metadados: {},
      p_chave_idempotencia: id,
    },
    aprovar_versao_fonte_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_versao: id,
      p_hash_esperado: FIXTURE.fileHash,
      p_fundamento: FIXTURE.foundation,
      p_chave_idempotencia: id,
    },
    salvar_fonte_normativa_v107: {
      p_id_organizacao: FIXTURE.organization,
      p_id_contrato: FIXTURE.contract,
      p_id_fonte: FIXTURE.source,
      p_tipo: sut.SOURCE_FIELDS.tipo,
      p_titulo: sut.SOURCE_FIELDS.titulo,
      p_referencia: sut.SOURCE_FIELDS.referencia,
      p_descricao: sut.SOURCE_FIELDS.descricao,
      p_situacao: "ativa",
      p_versao_esperada: 1,
      p_chave_idempotencia: id,
    },
    executar_comando_lista_v1: {
      p_id_organizacao: FIXTURE.organization,
      p_id_contrato: FIXTURE.contract,
      p_id_lista: null,
      p_versao_esperada: null,
      p_acao: "criar_lista",
      p_payload: {
        nome: FIXTURE.listName,
        descricao: FIXTURE.listDescription,
        vigencia_inicio: "2026-01-01",
        vigencia_fim: null,
      },
      p_motivo: FIXTURE.reason,
      p_request_id: id,
    },
    criar_competencia: payload,
    criar_documento_competencia_v115: {
      p_id_competencia: id,
      p_tipo: "outro",
      p_titulo: "Documento TXT sintético Trilha A.",
      p_categoria: "documental",
      p_id_requisito: id,
      p_id_arquivo: FIXTURE.file,
      p_chave_idempotencia: id,
    },
    solicitar_analise_competencia: { p_id_competencia: id, p_tipo: "completa" },
    registrar_revisao_requisito_v117: {
      p_id_competencia: id,
      p_id_requisito: id,
      p_id_execucao_esperada: id,
      p_id_resultado_esperado: id,
      p_hash_esperado: FIXTURE.fileHash,
      p_resultado: "conforme",
      p_justificativa: FIXTURE.reviewJustification,
      p_fundamento: FIXTURE.reviewFoundation,
      p_evidencias: [{ id_versao_documento: id, pagina: 1, trecho: FIXTURE.excerpt }],
      p_request_id: id,
    },
    solicitar_parecer_interno: { p_id_competencia: id },
    aprovar_parecer_interno: {
      p_id_parecer: id,
      p_aprovar: true,
      p_fundamento: FIXTURE.foundation,
    },
    aprovar_apresentacao: { p_id_competencia: id, p_fundamento: FIXTURE.foundation },
    registrar_apresentacao: {
      p_id_competencia: id,
      p_idempotency_key: id,
      p_protocolo: "HML-TRILHA-A-20261108",
      p_forma_apresentacao: "Ensaio sintético em homologação.",
    },
  };
  assert.equal(Object.keys(vectors).length, 12);
  for (const [rpc, p] of Object.entries(vectors)) {
    assert.equal(validateBusinessPayload(rpc, p, evidence), true, rpc);
    assert.equal(validateBusinessPayload(rpc, { ...p, extra: true }, evidence), false, rpc);
  }
  assert.equal(
    validateBusinessPayload(
      "registrar_revisao_requisito_v117",
      { ...vectors.registrar_revisao_requisito_v117, p_resultado: "nao_aplicavel" },
      evidence,
    ),
    false,
  );
  assert.equal(
    validateBusinessPayload("aprovar_apresentacao", vectors.aprovar_apresentacao, {
      ...evidence,
      compliance: 99,
    }),
    false,
  );
  assert.equal(
    validateBusinessPayload("registrar_apresentacao", vectors.registrar_apresentacao, {
      ...evidence,
      competencies: [{ ...official, id, month: "2026-10-01" }],
    }),
    false,
  );
});

test("observador técnico nunca projeta objetos Auth ou identificadores de usuário", () => {
  assert.equal(typeof sut.projectOfficialResponse, "function");
  const value = sut.projectOfficialResponse({
    id: "synthetic-id",
    id_usuario: "private-user",
    autor: "private-name",
    lista: {
      email: "private@example.invalid",
      access_token: "private-token",
      id_contrato: "contract",
    },
  });
  assert.deepEqual(value, { id: "synthetic-id", lista: { id_contrato: "contract" } });
});

test("projeção positiva descarta campos desconhecidos e preserva regras inválidas como inválidas", () => {
  assert.deepEqual(
    sut.projectOfficialResponse({ id: "synthetic", unknown_note: "private words" }),
    { id: "synthetic" },
  );
  assert.notDeepEqual(
    sut.projectOfficialResponse({
      regra_validacao: { documento: { obrigatorio: true, unknown: true } },
    }),
    { regra_validacao: { documento: { obrigatorio: true } } },
  );
});

test("fase oficial rejeita read que conclui depois do prazo", async () => {
  let tick = 0;
  await assert.rejects(
    waitOfficialPhase({
      now: () => tick,
      timeout: 1,
      read: async () => {
        tick = 100;
        return { state: "ready" };
      },
      ready: () => true,
    }),
    /PHASE_TIMEOUT/,
  );
});

test("observador não promove campo antigo em duas projeções SDK reais", async () => {
  const { EventEmitter } = await import("node:events");
  const { readFile } = await import("node:fs/promises");
  const sdk = await readFile(
    new URL("../../src/lib/contratos/baseNormativaDados.ts", import.meta.url),
    "utf8",
  );
  const select = sdk.match(/export const COLUNAS_VERSAO\s*=\s*"([^"]+)"/)[1];
  const page = new EventEmitter(),
    observer = sut.createOfficialObserver(page);
  const emit = async (query, row) => {
    const request = {
      method: () => "GET",
      postData: () => null,
      url: () => FIXTURE.api + "/rest/v1/versoes_fontes_normativas?" + new URLSearchParams(query),
    };
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify(row)),
    });
    await observer.flush();
  };
  try {
    await emit(
      {
        select,
        id_fonte: "eq." + FIXTURE.source,
        order: "versao.desc,id.asc",
        offset: "0",
        limit: "25",
      },
      [{ id, id_fonte: FIXTURE.source, aprovado_em: "2026-11-08T00:00:00Z" }],
    );
    assert.ok((await observer.read("versoes_fontes_normativas", { id }))[0].aprovado_em);
    const after = observer.generation();
    await emit(
      { select: "conteudo_texto,metadados", id: "eq." + id },
      { conteudo_texto: "synthetic", metadados: {} },
    );
    assert.equal(
      (await observer.read("versoes_fontes_normativas", { id }))[0].aprovado_em,
      undefined,
    );
    assert.equal(
      await observer.observedAfter(
        "versoes_fontes_normativas",
        { id, aprovado_em: "2026-11-08T00:00:00Z" },
        after,
      ),
      false,
    );
  } finally {
    observer.close();
  }
});

test("observador não lê Auth nem corpo de endpoint não autorizado", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter();
  const observer = sut.createOfficialObserver(page);
  let bodies = 0;
  for (const path of [
    "/auth/v1/token?grant_type=password",
    "/rest/v1/users",
    "/rest/v1/rpc/admin_operation",
  ]) {
    const request = { url: () => FIXTURE.api + path, method: () => "POST", postData: () => null };
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => {
        bodies++;
        throw Error("NEVER_READ");
      },
    });
  }
  await observer.flush();
  assert.equal(bodies, 0);
  observer.close();
});

test("fase oficial limita também um read que nunca resolve", async () => {
  await assert.rejects(
    waitOfficialPhase({ read: () => new Promise(() => {}), ready: () => true, timeout: 10 }),
    /PHASE_TIMEOUT/,
  );
});

test("preparação exige main imutável e provas do mesmo executor", () => {
  assert.equal(typeof sut.validatePreparerIdentity, "function");
  assert.equal(sut.validatePreparerIdentity({}, {}, {}, {}, "a".repeat(40)), false);
});

test("identidade positiva e negativos isolados mantêm vínculo main/source/deploy/nativos", () => {
  const head = "a".repeat(40),
    source = "b".repeat(40),
    deployment = "dpl_synthetic123";
  const identity = { harnessSha: head, moduleHash: "c".repeat(64), testHash: "d".repeat(64) };
  const native = {
    schema: "contaos.native.proof.v1",
    ...identity,
    passed: 8,
    failed: 0,
    skipped: 0,
  };
  const proof = {
    schema: "contaos.private.provenance.v1",
    harnessSha: head,
    frontendSha: source,
    deploymentId: deployment,
  };
  const env = {
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_REF: "refs/heads/main",
    GITHUB_SHA: head,
    CONTAOS_HARNESS_SHA: head,
    CONTAOS_FRONTEND_SHA: source,
    CONTAOS_DEPLOYMENT_ID: deployment,
    GITHUB_RUN_ID: "123",
  };
  assert.equal(sut.validatePreparerIdentity(env, proof, native, identity, head), true);
  for (const delta of [
    { GITHUB_REF: "refs/heads/other" },
    { GITHUB_EVENT_NAME: "pull_request" },
    { GITHUB_SHA: source },
    { CONTAOS_FRONTEND_SHA: head },
    { CONTAOS_DEPLOYMENT_ID: "dpl_changed123" },
    { GITHUB_RUN_ID: "invalid" },
  ])
    assert.equal(
      sut.validatePreparerIdentity({ ...env, ...delta }, proof, native, identity, head),
      false,
    );
  assert.equal(
    sut.validatePreparerIdentity(env, proof, { ...native, passed: 7 }, identity, head),
    false,
  );
  assert.equal(
    sut.validatePreparerIdentity(env, { ...proof, harnessSha: source }, native, identity, head),
    false,
  );
});

test("recibo final projeta só vínculos de negócio e nunca ator ou conteúdo arbitrário", () => {
  const source = { sourceVersionId: id, listId: id, listVersionId: id, itemId: id };
  const actor = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const result = {
    state: "partial",
    actor,
    raw: "NEVER_EXPORT",
    competencies: [
      { month: "2026-10-01", state: "partial", id, actor },
      { month: "2026-09-01", state: "partial", id, actor },
    ],
  };
  const receipt = sut.fixtureBindingReceipt(source, result);
  assert.equal(JSON.stringify(receipt).includes(actor), false);
  assert.equal(JSON.stringify(receipt).includes("NEVER_EXPORT"), false);
  assert.equal(receipt.competencies.length, 2);
  assert.throws(
    () => sut.fixtureBindingReceipt({ ...source, itemId: "unknown" }, result),
    /BINDING_ID/,
  );
  assert.throws(
    () =>
      sut.fixtureBindingReceipt(source, {
        ...result,
        competencies: [result.competencies[0], result.competencies[0]],
      }),
    /BINDING_SCHEMA/,
  );
});

test("campos positivos pertencem ao endpoint observado, não ao catálogo global de chaves", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter();
  const observer = sut.createOfficialObserver(page);
  const { readFile } = await import("node:fs/promises");
  const sdk = await readFile(
    new URL("../../src/lib/contratos/contratoDetalheDados.ts", import.meta.url),
    "utf8",
  );
  const select = sdk.match(/export const COLUNAS_DETALHE\s*=\s*"([^"]+)"/)[1];
  const request = {
    url: () =>
      FIXTURE.api + "/rest/v1/contratos?" + new URLSearchParams({ id: "eq." + id, select }),
    method: () => "GET",
    postData: () => null,
  };
  page.emit("request", request);
  page.emit("response", {
    request: () => request,
    url: request.url,
    status: () => 200,
    body: async () =>
      Buffer.from(
        JSON.stringify([
          {
            id,
            id_organizacao: FIXTURE.organization,
            id_contratante: FIXTURE.contractor,
            conteudo_texto: "NEVER_EXPORT",
          },
        ]),
      ),
  });
  await observer.flush();
  const rows = await observer.read("contratos", { id });
  assert.equal(rows[0].conteudo_texto, undefined);
  observer.close();
});

// Recovered observer cases, integrated into the actual preparer module.
{
  const { EventEmitter } = await import("node:events");
  const { readFile } = await import("node:fs/promises");
  const api = FIXTURE.api,
    org = FIXTURE.organization,
    contract = FIXTURE.contract,
    source = FIXTURE.source;
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    version = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  async function constant(file, name) {
    const s = await readFile(new URL("../../" + file, import.meta.url), "utf8");
    const m = s.match(new RegExp("(?:export )?const " + name + '\\s*=\\s*"([^"]+)"'));
    assert.ok(m, "SDK source constant missing: " + name);
    return m[1];
  }
  const compSelect = await constant(
    "src/lib/contratos/competenciasDados.ts",
    "COLUNAS_COMPETENCIA",
  );
  const versionSelect = await constant("src/lib/contratos/baseNormativaDados.ts", "COLUNAS_VERSAO");
  const opinionSelect = await constant(
    "src/lib/competencias/parecerInternoDados.ts",
    "COLUNAS_PARECERES",
  );
  const reviewSource = await readFile(
    new URL("../../src/lib/competencias/revisaoRequisitoDados.ts", import.meta.url),
    "utf8",
  );
  const joinSelect = reviewSource.match(/\.select\(\s*"(id,numero_versao,[^"]+)"/)[1];
  const compQ = () => ({
    select: compSelect,
    id_contrato: "eq." + contract,
    competencia_referencia: "eq.2026-10-01",
    order: "competencia_referencia.desc,id.desc",
    offset: "0",
    limit: "25",
  });
  const versionQ = () => ({
    select: versionSelect,
    id_fonte: "eq." + source,
    order: "versao.desc,id.asc",
    offset: "0",
    limit: "25",
  });
  const textQ = () => ({ select: "conteudo_texto,metadados", id: "eq." + version });
  const joinQ = () => ({
    select: joinSelect,
    id_organizacao: "eq." + org,
    id_contrato: "eq." + contract,
    "documentos_competencia.id_competencia": "eq." + id,
    "documentos_competencia.situacao": "eq.ativo",
    "arquivos.status_seguranca": "eq.aprovado",
    order: "criado_em.desc,id.desc",
    offset: "0",
    limit: "25",
  });
  const compRow = () => ({
    id,
    competencia_referencia: "2026-10-01",
    periodo_inicio: "2026-10-01",
    periodo_fim: "2026-10-31",
    data_limite: null,
    situacao: "rascunho",
    percentual_conformidade: 0,
    versao_pacote_atual: 0,
    atualizado_em: "2026-11-08T00:00:00Z",
  });
  const versionRow = () => ({
    id: version,
    id_fonte: source,
    versao: 1,
    inicio_vigencia: "2026-01-01",
    fim_vigencia: null,
    id_arquivo: null,
    hash: "a".repeat(64),
    aprovado_por: null,
    aprovado_em: "2026-11-08T00:00:00Z",
    criado_em: "2026-11-08T00:00:00Z",
  });
  const joinRow = () => ({
    id: version,
    numero_versao: 1,
    id_organizacao: org,
    id_contrato: contract,
    documentos_competencia: {
      id_competencia: id,
      titulo: "Documento TXT sintético Trilha A.",
      situacao: "ativo",
    },
    arquivos: { nome_original: "FONTE_SINTETICA_AUDITORIA_HML.txt", status_seguranca: "aprovado" },
  });
  function fixture() {
    const page = new EventEmitter(),
      o = sut.createOfficialObserver(page);
    return {
      page,
      o,
      emit(table, query, value, options = {}) {
        const method = options.method || "GET",
          request = {
            method: () => method,
            postData: () => (method === "POST" ? JSON.stringify(options.args || {}) : null),
            url: () =>
              options.rawUrl || api + "/rest/v1/" + table + "?" + new URLSearchParams(query),
          };
        page.emit("request", request);
        page.emit("response", {
          request: () => request,
          url: request.url,
          status: () => options.status || 200,
          body:
            options.body ||
            async function () {
              return Buffer.from(JSON.stringify(value));
            },
        });
      },
      close() {
        o.close();
      },
    };
  }
  async function noAdmission(mutator) {
    const f = fixture();
    try {
      const q = compQ(),
        raw = mutator(q);
      f.emit("competencias", {}, [compRow()], { rawUrl: api + "/rest/v1/competencias?" + raw });
      await f.o.flush();
      assert.equal(await f.o.observedAfter("competencias", { id_contrato: contract }, 0), false);
      await assert.rejects(() => f.o.read("competencias", {}), /OBSERVATION/);
    } finally {
      f.close();
    }
  }
  test("FK omitted is proved by real query without inventing row fields", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("competencias", compQ(), [compRow()]);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      const [r] = await f.o.read("competencias", {
        id_contrato: contract,
        competencia_referencia: "2026-10-01",
      });
      assert.equal(r.id, id);
      assert.equal(Object.hasOwn(r, "id_contrato"), false);
      assert.equal(Object.hasOwn(r, "id_organizacao"), false);
    } finally {
      f.close();
    }
  });
  test("closed bare and prefixed RPC aliases share evidence", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "rpc/obter_visao_geral_competencia",
        {},
        { competencia: { id } },
        {
          method: "POST",
          args: { p_id_competencia: id },
          rawUrl: api + "/rest/v1/rpc/obter_visao_geral_competencia",
        },
      );
      assert.equal(
        await f.o.observedAfter("obter_visao_geral_competencia", { p_id_competencia: id }, before),
        true,
      );
      assert.equal(
        await f.o.observedAfter(
          "rpc:obter_visao_geral_competencia",
          { p_id_competencia: id },
          before,
        ),
        true,
      );
      assert.equal(await f.o.observedAfter("obter_unknown", {}, before), false);
    } finally {
      f.close();
    }
  });
  test("empty initial October GET proves absence through its query", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("competencias", compQ(), []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("current empty GET removes old presence from the same query", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      assert.equal((await f.o.read("competencias", { id_contrato: contract })).length, 1);
      const before = f.o.generation();
      f.emit("competencias", compQ(), []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("real review join retains approved nested fields and dotted identity", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit("versoes_documento", joinQ(), [joinRow()]);
      const where = { "documentos_competencia.id_competencia": id, id: version };
      assert.equal(await f.o.observedAfter("versoes_documento", where, before), true);
      const [r] = await f.o.read("versoes_documento", where);
      assert.equal(r.arquivos.status_seguranca, "aprovado");
      assert.equal(r.documentos_competencia.id_competencia, id);
    } finally {
      f.close();
    }
  });
  test("partial text projection inherits neither approval nor invented id", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      assert.ok((await f.o.read("versoes_fontes_normativas", { id: version }))[0].aprovado_em);
      const before = f.o.generation();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      const [r] = await f.o.read("versoes_fontes_normativas", { id: version });
      assert.equal(r.aprovado_em, undefined);
      assert.equal(Object.hasOwn(r, "id"), false);
      assert.equal(
        await f.o.observedAfter(
          "versoes_fontes_normativas",
          { id: version, aprovado_em: versionRow().aprovado_em },
          before,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("duplicate query key is not admitted", () =>
    noAdmission((q) =>
      new URLSearchParams([...Object.entries(q), ["id_contrato", "eq." + contract]]).toString(),
    ));
  test("extra query key is not admitted", () =>
    noAdmission((q) => new URLSearchParams({ ...q, unknown: "eq.extra" }).toString()));
  test("foreign contract query is not admitted", () =>
    noAdmission((q) => new URLSearchParams({ ...q, id_contrato: "eq." + version }).toString()));
  test("projection drift is not admitted", () =>
    noAdmission((q) =>
      new URLSearchParams({ ...q, select: q.select + ",unknown_note" }).toString(),
    ));
  test("admitted join with contradictory response closes", async () => {
    const f = fixture();
    try {
      const r = joinRow();
      r.documentos_competencia.id_competencia = version;
      f.emit("versoes_documento", joinQ(), [r]);
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("denied response to admitted contract does not reuse old success", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      f.emit("competencias", compQ(), null, { status: 403 });
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("empty broader query cannot prove unrequested month filter", async () => {
    const f = fixture();
    try {
      const q = compQ();
      delete q.competencia_referencia;
      const before = f.o.generation();
      f.emit("competencias", q, []);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("empty first opinion response proves scoped initial absence", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "pareceres_internos",
        {
          select: opinionSelect,
          id_competencia: "eq." + id,
          id_organizacao: "eq." + org,
          id_contrato: "eq." + contract,
          order: "versao.desc,id.desc",
          offset: "0",
          limit: "25",
        },
        [],
      );
      assert.equal(
        await f.o.observedAfter("pareceres_internos", { id_competencia: id }, before),
        true,
      );
      assert.deepEqual(await f.o.read("pareceres_internos", { id_competencia: id }), []);
    } finally {
      f.close();
    }
  });
  test("duplicate response IDs cannot become one trusted row", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow(), compRow()]);
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("late older response cannot overwrite newer request evidence", async () => {
    const f = fixture();
    let release;
    try {
      const old = new Promise((r) => (release = r));
      f.emit("competencias", compQ(), [], {
        body: async () => {
          await old;
          return Buffer.from(JSON.stringify([compRow()]));
        },
      });
      f.emit("competencias", compQ(), []);
      release();
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("close clears pending response and listeners", async () => {
    const f = fixture();
    let release;
    const gate = new Promise((r) => (release = r));
    f.emit("competencias", compQ(), [], {
      body: async () => {
        await gate;
        return Buffer.from(JSON.stringify([compRow()]));
      },
    });
    f.close();
    release();
    await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    await assert.rejects(() => f.o.read("competencias", {}), /OBSERVATION/);
    assert.equal(f.page.listenerCount("request"), 0);
    assert.equal(f.page.listenerCount("response"), 0);
  });
  test("retained technical ledger is bounded in bytes", async () => {
    const f = fixture();
    try {
      for (let i = 1; i <= 129; i++) {
        const key = "dddddddd-dddd-4ddd-8ddd-" + String(i).padStart(12, "0");
        f.emit(
          "versoes_fontes_normativas",
          { select: "conteudo_texto,metadados", id: "eq." + key },
          { conteudo_texto: "A".repeat(65536), metadados: {} },
        );
      }
      await assert.rejects(() => f.o.flush(), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("explicit metadata projection does not inherit text freshness", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      await f.o.flush();
      const after = f.o.generation();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      assert.deepEqual(
        await f.o.read("versoes_fontes_normativas", {
          id: version,
          aprovado_em: versionRow().aprovado_em,
        }),
        [],
      );
      const [r] = await f.o.read(
        "versoes_fontes_normativas",
        { id: version },
        { select: versionSelect },
      );
      assert.equal(r.id, version);
      assert.equal(r.aprovado_em, versionRow().aprovado_em);
      assert.equal(
        await f.o.observedAfter("versoes_fontes_normativas", { id: version }, after, {
          select: versionSelect,
        }),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("observedAfter deduplicates identity before filtering state", async () => {
    const f = fixture();
    try {
      const after = f.o.generation();
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      const q = compQ();
      delete q.competencia_referencia;
      f.emit("competencias", q, [{ ...compRow(), situacao: "cancelada" }]);
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, situacao: "rascunho" },
          after,
        ),
        false,
      );
    } finally {
      f.close();
    }
  });
  test("newer row prevents resurrection by old state filter", async () => {
    const f = fixture();
    try {
      f.emit("competencias", compQ(), [compRow()]);
      await f.o.flush();
      const q = compQ();
      delete q.competencia_referencia;
      f.emit("competencias", q, [{ ...compRow(), situacao: "cancelada" }]);
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("competencias", {
          id_contrato: contract,
          competencia_referencia: "2026-10-01",
          situacao: "rascunho",
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("omitted old approval cannot bypass newer partial projection", async () => {
    const f = fixture();
    try {
      f.emit("versoes_fontes_normativas", versionQ(), [versionRow()]);
      await f.o.flush();
      f.emit("versoes_fontes_normativas", textQ(), { conteudo_texto: "synthetic", metadados: {} });
      await f.o.flush();
      assert.deepEqual(
        await f.o.read("versoes_fontes_normativas", {
          id: version,
          aprovado_em: versionRow().aprovado_em,
        }),
        [],
      );
    } finally {
      f.close();
    }
  });
  test("order belonging to another SDK endpoint proves nothing", async () => {
    const f = fixture();
    try {
      const select = await constant("src/lib/contratos/baseNormativaDados.ts", "COLUNAS_FONTE");
      f.emit(
        "fontes_normativas",
        {
          select,
          id_organizacao: "eq." + org,
          id_contrato: "eq." + contract,
          order: "criado_em.desc,id.desc",
          offset: "0",
          limit: "25",
        },
        [],
      );
      await f.o.flush();
      assert.equal(
        await f.o.observedAfter("fontes_normativas", { id_contrato: contract }, 0),
        false,
      );
      await assert.rejects(() => f.o.read("fontes_normativas", {}), /OBSERVATION/);
    } finally {
      f.close();
    }
  });
  test("actual RBAC context lookup retains only projected contract", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "competencias",
        { select: "id_contrato", id: "eq." + id, id_organizacao: "eq." + org },
        { id_contrato: contract },
      );
      assert.equal(await f.o.observedAfter("competencias", { id }, before), true);
      const [r] = await f.o.read("competencias", { id });
      assert.equal(r.id_contrato, contract);
      assert.equal(Object.hasOwn(r, "id"), false);
      assert.equal(Object.hasOwn(r, "id_organizacao"), false);
    } finally {
      f.close();
    }
  });
  test("actual NovaCompetencia ID-only reconciliation uses exact query", async () => {
    const f = fixture();
    try {
      const before = f.o.generation();
      f.emit(
        "competencias",
        { select: "id", id_contrato: "eq." + contract, competencia_referencia: "eq.2026-10-01" },
        [{ id }],
      );
      assert.equal(
        await f.o.observedAfter(
          "competencias",
          { id_contrato: contract, competencia_referencia: "2026-10-01" },
          before,
        ),
        true,
      );
      const [r] = await f.o.read("competencias", {
        id_contrato: contract,
        competencia_referencia: "2026-10-01",
      });
      assert.deepEqual(r, { id });
    } finally {
      f.close();
    }
  });
  test("global null-contract AppShell permissions are ignored without poisoning", async () => {
    const f = fixture();
    try {
      const args = { p_id_organizacao: org, p_id_contrato: null };
      const before = f.o.generation();
      f.emit(
        "rpc/consultar_permissoes_efetivas",
        {},
        { schema_versao: "rbac-v1", versao: 1, master: true, permissoes: [] },
        { method: "POST", args, rawUrl: api + "/rest/v1/rpc/consultar_permissoes_efetivas" },
      );
      await f.o.flush();
      assert.equal(await f.o.rpcRead("consultar_permissoes_efetivas", args), null);
      assert.equal(
        await f.o.rpcRead("consultar_permissoes_efetivas", { ...args, p_id_contrato: contract }),
        null,
      );
      assert.equal(await f.o.observedAfter("consultar_permissoes_efetivas", args, before), false);
    } finally {
      f.close();
    }
  });
}

test("fonte fixa rejeita drift sensível antes de intenção ou recibo", () => {
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  const source = { ...context, ...sut.SOURCE_FIELDS, id: FIXTURE.source, version: 1 };
  const payload = {
    p_id_organizacao: FIXTURE.organization,
    p_id_contrato: FIXTURE.contract,
    p_id_fonte: FIXTURE.source,
    p_tipo: source.tipo,
    p_titulo: source.titulo,
    p_referencia: source.referencia,
    p_descricao: source.descricao,
    p_situacao: "ativa",
    p_versao_esperada: 1,
    p_chave_idempotencia: id,
  };
  assert.equal(validateBusinessPayload("salvar_fonte_normativa_v107", payload, { source }), true);
  const evil = { ...source, descricao: "canary@example.invalid" };
  assert.equal(
    validateBusinessPayload(
      "salvar_fonte_normativa_v107",
      { ...payload, p_descricao: evil.descricao },
      { source: evil },
    ),
    false,
  );
});

test("solicitacao unica: preparador nao aceita marcador workflow_run sem prova", () => {
  assert.equal(typeof sut.preparerEventAllowed, "function");
  assert.equal(
    sut.preparerEventAllowed({
      GITHUB_EVENT_NAME: "workflow_run",
      GITHUB_REF: "refs/heads/main",
      CONTAOS_SINGLE_REQUEST_VERIFIED: "true",
    }),
    false,
  );
});

test("R2 ledger recupera exatamente quatro recibos R1 e rejeita adulteracao", () => {
  assert.equal(typeof sut.validateR1RecoveryDocument, "function");
  const doc = sut.R1_RECOVERY_DOCUMENT;
  assert.equal(sut.validateR1RecoveryDocument(doc).receipts.length, 4);
  assert.ok(
    Object.isFrozen(doc) && Object.isFrozen(doc.receipts) && doc.receipts.every(Object.isFrozen),
  );
  for (const mutate of [
    (d) => d.receipts.pop(),
    (d) => d.receipts.reverse(),
    (d) => (d.receipts[0].state = "uncertain"),
    (d) => (d.receipts[0].payloadSha256 = "0".repeat(64)),
    (d) => (d.receipts[0].contract = id),
    (d) => (d.receipts[0].requestId = id),
    (d) => (d.receipts[0].extra = "CANARIO"),
    (d) => (d.receipts[0].workflowRun = "1"),
    (d) => (d.receipts[0].harnessSha = "0".repeat(40)),
  ]) {
    const bad = structuredClone(doc);
    mutate(bad);
    assert.throws(() => sut.validateR1RecoveryDocument(bad));
  }
});
function r2Reconciliation(delta = {}) {
  const context = {
    official: true,
    current: true,
    organization: FIXTURE.organization,
    contract: FIXTURE.contract,
  };
  return {
    ledger: sut.R1_RECOVERY_DOCUMENT,
    source: { ...context, id: FIXTURE.source, ...sut.SOURCE_FIELDS, version: 1, situacao: "ativa" },
    version: {
      ...context,
      id,
      source: FIXTURE.source,
      hash: "a".repeat(64),
      approved: true,
      textVerified: true,
      effective: true,
      file: null,
    },
    sourceCount: 1,
    listCount: 0,
    listObserved: true,
    listState: null,
    canCreateList: true,
    ...delta,
  };
}
test("R2 reconcilia somente estado oficial unico aprovado antes de armar", () => {
  assert.equal(typeof sut.reconcileR1Recovery, "function");
  const proof = sut.reconcileR1Recovery(r2Reconciliation());
  assert.ok(Object.isFrozen(proof));
  const b = sut.createIntentBroker({
    persist: () => true,
    competenceGateAmended: true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
  });
  assert.throws(() => arm(b), { message: "RECOVERY_READ_ONLY" });
  assert.throws(() => b.authorizeRecovery({ ...proof }), { message: "RECOVERY_PROOF" });
  assert.equal(b.authorizeRecovery(proof), true);
  assert.equal(b.snapshot().count, 2);
  for (const rpc of ["registrar_versao_fonte_v107", "aprovar_versao_fonte_v107"])
    assert.throws(
      () =>
        b.arm({
          rpc,
          payload: {},
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
        }),
      { message: "RECOVERY_CONFIRMED_OPERATION" },
    );
  for (const delta of [
    { sourceCount: 0 },
    { sourceCount: 2 },
    { listObserved: false },
    { listCount: 2 },
    { canCreateList: false },
    { version: { ...r2Reconciliation().version, approved: false } },
    { version: { ...r2Reconciliation().version, textVerified: false } },
    { version: { ...r2Reconciliation().version, source: id } },
    { source: { ...r2Reconciliation().source, current: false } },
    { listCount: 1, listState: { active: false } },
  ])
    assert.throws(() => sut.reconcileR1Recovery(r2Reconciliation(delta)));
});
test("R2 contabiliza duas anteriores e limita novas intencoes a22", () => {
  const b = sut.createIntentBroker({
    persist: () => true,
    competenceGateAmended: true,
    recoveryLedger: sut.R1_RECOVERY_DOCUMENT,
  });
  b.authorizeRecovery(sut.reconcileR1Recovery(r2Reconciliation()));
  for (let n = 0; n < 22; n++) {
    arm(b);
    assert.equal(b.policy(request()), true);
    assert.equal(b.policy({ ...request(), stage: "RESPONSE" }), true);
    b.resolve("confirmed");
  }
  assert.equal(b.snapshot().count, 24);
  assert.throws(() => arm(b), { message: "INTENT_BUDGET" });
});
test("R2 diagnostico conserva subfase primaria e cleanup separado sem canarios", async () => {
  assert.equal(typeof sut.createPreparationDiagnostics, "function");
  const d = sut.createPreparationDiagnostics();
  const error = Object.assign(
    new Error("CANARIO https://secret.invalid Bearer SECRET pessoa@example.com"),
    { name: "TimeoutError" },
  );
  await assert.rejects(
    () =>
      d.step("SOURCE_VERSION_READ", async () => {
        await d.step("RUNTIME_FRESH", async () => {
          throw error;
        });
      }),
    (e) => e === error,
  );
  await d.cleanup(async () => {
    throw new Error("SECOND_CANARIO");
  });
  const r = d.snapshot();
  assert.equal(r.primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(r.subphase, "RUNTIME_FRESH");
  assert.deepEqual(r.subphasePath, ["SOURCE_VERSION_READ", "RUNTIME_FRESH"]);
  assert.equal(r.logoutVerified, false);
  assert.ok(r.cleanupFailure);
  assert.equal(/CANARIO|secret|Bearer|@|stack|https/.test(JSON.stringify(r)), false);
  await assert.rejects(() => d.step("UNKNOWN_CANARIO", async () => {}), {
    message: "DIAGNOSTIC_SUBPHASE",
  });
});

test("Run27 diagnóstico identifica timeout sem exportar mensagem ou objeto privado", () => {
  assert.equal(typeof sut.preparerFailureDiagnostic, "function");
  const input = {
    step: "SOURCE_APPROVAL_READBACK",
    errorName: "TimeoutError",
    get message() {
      assert.fail("mensagem privada não pode ser lida");
    },
    get payload() {
      assert.fail("payload privado não pode ser lido");
    },
  };
  assert.deepEqual(sut.preparerFailureDiagnostic(input), {
    step: "SOURCE_APPROVAL_READBACK",
    errorKind: "TIMEOUT",
  });
});
test("Run27 diagnóstico desconhecido permanece fechado e não serializa canário", () => {
  assert.equal(typeof sut.preparerFailureDiagnostic, "function");
  const result = sut.preparerFailureDiagnostic({
    step: "CANARY_PRIVATE_ROUTE",
    errorName: "CANARY_PRIVATE_EXCEPTION",
  });
  assert.deepEqual(result, { step: "UNCLASSIFIED", errorKind: "OTHER" });
  assert.equal(JSON.stringify(result).includes("CANARY"), false);
  assert.deepEqual(sut.preparerFailureDiagnostic(null), {
    step: "UNCLASSIFIED",
    errorKind: "OTHER",
  });
});

test("R2 duas confirmacoes reais de protocolo e proximo await conserva causa tecnica", async () => {
  const { readFileSync } = await import("node:fs");
  const { createIntentBroker, confirmUiIntent, FIXTURE, SOURCE_FIELDS } = sut;
  const diagnostics = sut.createPreparationDiagnostics();
  await assert.rejects(() =>
    sut.withPreparationDiagnostics(diagnostics, async () => {
      const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      const official = {
        official: true,
        current: true,
        organization: FIXTURE.organization,
        contract: FIXTURE.contract,
      };
      const evidence = {
        source: { ...official, id: FIXTURE.source, ...SOURCE_FIELDS, version: 1 },
        sourceVersions: [
          {
            ...official,
            id,
            source: FIXTURE.source,
            hash: FIXTURE.fileHash,
            canApprove: true,
            state: "rascunho",
          },
        ],
      };
      const text = readFileSync(
        new URL(
          "../../docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
          import.meta.url,
        ),
        "utf8",
      );
      const commands = [
        [
          "registrar_versao_fonte_v107",
          {
            p_id_organizacao: FIXTURE.organization,
            p_id_fonte: FIXTURE.source,
            p_inicio_vigencia: "2026-01-01",
            p_fim_vigencia: null,
            p_id_arquivo: null,
            p_conteudo_texto: text,
            p_metadados: {},
          },
        ],
        [
          "aprovar_versao_fonte_v107",
          {
            p_id_organizacao: FIXTURE.organization,
            p_id_versao: id,
            p_hash_esperado: FIXTURE.fileHash,
            p_fundamento: FIXTURE.foundation,
          },
        ],
      ];
      const receipts = [];
      const broker = createIntentBroker({
        persist: (r) => {
          receipts.push(r);
          return true;
        },
        competenceGateAmended: true,
      });
      const verified = { context: true, capability: true, reconciled: true };
      for (let index = 0; index < commands.length; index++) {
        const [rpc, payload] = commands[index];
        const control = {
          count: async () => 1,
          isEnabled: async () => true,
          click: async () => {
            const body = {
              ...payload,
              p_chave_idempotencia:
                index === 0
                  ? "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
                  : "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            };
            const request = {
              url: FIXTURE.api + "/rest/v1/rpc/" + rpc,
              method: "POST",
              postData: JSON.stringify(body),
              stage: "REQUEST",
              sessionId: "offline",
              interceptionId: "offline-" + index,
            };
            assert.equal(broker.policy(request), true);
            assert.equal(broker.policy({ ...request, stage: "RESPONSE" }), true);
          },
        };
        assert.equal(
          await confirmUiIntent({
            page: {},
            scope: { getByRole: () => control },
            fence: { drain: async () => {}, assertSafe: () => {} },
            broker,
            rpc,
            payload,
            evidence,
            verified,
            button: "offline",
            settleVerifiedPage: async () => {},
            reconcile: async (phase) =>
              phase === "before" ? { payload, evidence, verified } : { confirmed: true },
          }),
          true,
        );
      }
      assert.equal(receipts.filter((r) => r.state === "confirmed").length, 2);

      await diagnostics.step("SOURCE_VERSION_READ", async () => {
        throw Object.assign(new Error("CANARY_SECRET https://private.invalid"), {
          name: "TimeoutError",
        });
      });
    }),
  );
  const report = diagnostics.snapshot();
  assert.equal(report.primaryFailure, "PREPARER_TIMEOUT");
  assert.equal(report.subphase, "SOURCE_VERSION_READ");
  assert.equal(JSON.stringify(report).includes("CANARY"), false);
});
test("R2 cada subfase fechada preserva falha primaria quando logout falha", async () => {
  for (const subphase of sut.DIAGNOSTIC_SUBPHASES) {
    const d = sut.createPreparationDiagnostics();
    await assert.rejects(() =>
      d.step(subphase, async () => {
        throw new TypeError("PRIVATE_URL token");
      }),
    );
    const before = d.snapshot();
    await d.cleanup(async () => false);
    const after = d.snapshot();
    assert.equal(after.subphase, subphase);
    assert.equal(after.primaryFailure, before.primaryFailure);
    assert.equal(after.cleanupFailure, "LOGOUT_NOT_VERIFIED");
    assert.equal(/PRIVATE_URL|token/.test(JSON.stringify(after)), false);
  }
});

test("R2 erro privado com getters nao e acessado e fence usa enum comprovado", async () => {
  const d = sut.createPreparationDiagnostics();
  const error = {
    name: "TimeoutError",
    get message() {
      assert.fail("message getter");
    },
    get stack() {
      assert.fail("stack getter");
    },
    get payload() {
      assert.fail("payload getter");
    },
  };
  await assert.rejects(
    () =>
      d.step("SOURCE_VERSION_READ", async () => {
        throw error;
      }),
    (e) => e === error,
  );
  assert.equal(d.snapshot().primaryFailure, "PREPARER_TIMEOUT");
  const fence = sut.createPreparationDiagnostics();
  await assert.rejects(() =>
    fence.step("RUNTIME_FRESH", async () => {
      throw Object.assign(new Error("PRIVATE"), { code: "FENCE_REQUEST" });
    }),
  );
  assert.equal(fence.snapshot().failureClass, "NATIVE_FENCE");
  assert.equal(fence.snapshot().primaryFailure, "FENCE_REQUEST");
});
test("R2 cada await relevante do codigo real passa pela barreira diagnostica", async () => {
  const ts = await import("typescript"),
    { readFile } = await import("node:fs/promises");
  const code = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8");
  const sf = ts.createSourceFile(
    "preparer.mjs",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const targets = new Set([
    "confirmUiIntent",
    "prepareSourceAndList",
    "prepareCompetencies",
    "runFixturePreparation",
  ]);
  let owner = null,
    count = 0;
  function visit(node) {
    const previous = owner;
    if (ts.isFunctionDeclaration(node) && node.name)
      owner = targets.has(node.name.text) ? node.name.text : null;
    if (owner && ts.isAwaitExpression(node)) {
      count++;
      assert.ok(
        node.expression.getText(sf).startsWith("tracedPreparation("),
        owner + " await sem enum",
      );
    }
    ts.forEachChild(node, visit);
    owner = previous;
  }
  visit(sf);
  assert.ok(count >= 197);
  assert.ok(
    code.indexOf(
      "validateR1RecoveryDocument();",
      code.indexOf("async function runFixturePreparation"),
    ) < code.indexOf('phase = "LOGIN"', code.indexOf("async function runFixturePreparation")),
  );
  assert.match(code, /recoveryLedger:R1_RECOVERY_DOCUMENT|recoveryLedger: R1_RECOVERY_DOCUMENT/);
});

test("R2 cleanup sincrono preserva primaria e report mesmo com logout verificado", async () => {
  const d = sut.createPreparationDiagnostics();
  await assert.rejects(() => d.step("SOURCE_VERSION_READ", async () => { throw new TypeError("PRIMARY_CANARY"); }));
  await d.cleanup(async () => true);
  assert.equal(d.snapshot().logoutVerified, true);
  assert.equal(typeof d.finishCleanup, "function");
  await d.finishCleanup("RUNTIME_CLEAR_FAILED", () => { throw new Error("CLEANUP_CANARY"); });
  assert.equal(d.snapshot().primaryFailure, "PREPARER_UNCLASSIFIED");
  assert.equal(d.snapshot().cleanupFailure, "RUNTIME_CLEAR_FAILED");
  assert.equal(d.snapshot().logoutVerified, true);
  assert.equal(/CANARY|stack|https/.test(JSON.stringify(d.snapshot())), false);
  await assert.rejects(() => d.finishCleanup("UNKNOWN_CANARY", () => {}), { message: "DIAGNOSTIC_SUBPHASE" });
});

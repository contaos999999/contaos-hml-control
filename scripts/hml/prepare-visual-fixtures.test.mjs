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
      tipo: "outro",
      titulo: "synthetic",
      referencia: null,
      descricao: null,
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
      p_tipo: "outro",
      p_titulo: "synthetic",
      p_referencia: null,
      p_descricao: null,
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

test("observador não promove campo antigo a uma projeção recente", async () => {
  const { EventEmitter } = await import("node:events");
  const page = new EventEmitter();
  const observer = sut.createOfficialObserver(page);
  const emit = async (row, select) => {
    const request = {
      url: () => FIXTURE.api + "/rest/v1/arquivos?id=eq." + id + "&select=" + select,
      method: () => "GET",
      postData: () => null,
    };
    page.emit("request", request);
    page.emit("response", {
      request: () => request,
      url: request.url,
      status: () => 200,
      body: async () => Buffer.from(JSON.stringify([row])),
    });
    await observer.flush();
  };
  try {
    await emit({ id, status_seguranca: "aprovado" }, "id,status_seguranca");
    assert.equal((await observer.read("arquivos", { id }))[0].status_seguranca, "aprovado");
    const generation = observer.generation();
    await emit({ id, mime: "text/plain" }, "id,mime");
    const rows = await observer.read("arquivos", { id });
    assert.equal(rows[0].status_seguranca, undefined);
    assert.equal(
      await observer.observedAfter("arquivos", { id, status_seguranca: "aprovado" }, generation),
      false,
    );
    assert.equal(
      await observer.observedAfter("arquivos", { id, mime: "text/plain" }, generation),
      true,
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
  const request = {
    url: () =>
      FIXTURE.api + "/rest/v1/contratos?id=eq." + id + "&select=id,id_organizacao,id_contratante",
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

import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as sut from "./integracao-v1-fase3.mjs";

const root = new URL("../../", import.meta.url);
const csv = await readFile(new URL(sut.F3_MATRIX.path, root), "utf8");
const published = JSON.parse(await readFile(new URL(sut.F3_CASES_PATH, root), "utf8"));

test("F3 B1: catálogo publicado é exatamente a derivação da matriz aceita", () => {
  assert.equal(createHash("sha256").update(csv).digest("hex"), sut.F3_MATRIX.sha256);
  assert.equal(sut.validateF3Cases(published, csv), true);
  const derived = sut.buildF3Cases(csv);
  assert.equal(derived.count, 138);
  assert.equal(new Set(derived.cases.map((c) => c.caseId)).size, 138);
  assert.equal(derived.cases.filter((c) => c.classification === "OBRIGATORIA").length, 120);
  const conditional = derived.cases.filter((c) => c.classification === "CONDICIONAL");
  assert.equal(conditional.length, 18);
  assert.ok(conditional.every((c) => c.destination === "V123"));
  assert.equal(
    sut.F3_PRODUCERS.reduce((n, p) => n + p.connections, 0),
    138,
  );
  assert.ok(derived.cases.every((c) => c.expected.master === "ALLOW"));
  assert.ok(derived.cases.every((c) => ["ALLOW", "DENY"].includes(c.expected.leitor)));
});

test("F3 B1: matriz adulterada, catálogo incompleto, duplicado ou com campo extra falham", () => {
  assert.throws(() => sut.buildF3Cases(csv + "\n"), { code: "F3_MATRIX_HASH" });
  const tamper = (fn) => {
    const copy = JSON.parse(JSON.stringify(published));
    fn(copy);
    return copy;
  };
  for (const bad of [
    tamper((c) => c.cases.pop()),
    tamper((c) => c.cases.push(c.cases[0])),
    tamper((c) => (c.cases[0].status = "PASS")),
    tamper((c) => (c.cases[0].expected.master = "DENY")),
    tamper((c) => (c.cases[0].expected.leitor = null)),
    tamper((c) => (c.count = 137)),
    tamper((c) => (c.scope = "TRILHA_A")),
    tamper((c) => (c.extra = true)),
    tamper((c) => ([c.cases[0], c.cases[1]] = [c.cases[1], c.cases[0]])),
  ])
    assert.throws(() => sut.validateF3Cases(bad, csv), { code: "F3_CASES" });
  assert.throws(() => sut.validateF3Cases(new Proxy(published, {}), csv), { code: "F3_CASES" });
});

test("F3 B1: CSV estrito rejeita aspas soltas e aceita campos com vírgula entre aspas", () => {
  assert.deepEqual(sut.parseCsv('a,"b,c"\n'), [["a", "b,c"]]);
  assert.deepEqual(sut.parseCsv('"x""y"'), [['x"y']]);
  assert.throws(() => sut.parseCsv('a"b'), { code: "F3_MATRIX_CSV" });
  assert.throws(() => sut.parseCsv('"ab'), { code: "F3_MATRIX_CSV" });
  assert.throws(() => sut.parseCsv('"a"b'), { code: "F3_MATRIX_CSV" });
});

test("F3 B1: orçamento de intenções conta tentativas e recusa excesso", () => {
  assert.equal(sut.F3_BUDGET.total, 60);
  assert.equal(sut.F3_BUDGET.perRun, 30);
  assert.ok(sut.assertF3Budget({ priorConfirmed: 0, newIntents: 30 }));
  assert.ok(sut.assertF3Budget({ priorConfirmed: 30, newIntents: 30 }));
  for (const bad of [
    { priorConfirmed: 0, newIntents: 31 },
    { priorConfirmed: 31, newIntents: 30 },
    { priorConfirmed: -1, newIntents: 1 },
    { priorConfirmed: 0, newIntents: 1.5 },
  ])
    assert.throws(() => sut.assertF3Budget(bad), { code: "F3_BUDGET" });
});

test("F3 B1: executor F3 recusa escopo da Trilha A e qualquer valor desconhecido", () => {
  assert.ok(sut.assertF3Scope("INTEGRACAO_V1_FASE3_REL"));
  for (const scope of ["TRILHA_A", null, undefined, "", "integracao-v1-fase3-rel-20261113-r1"])
    assert.throws(() => sut.assertF3Scope(scope), { code: "FIXTURES_SCOPE_NOT_F3" });
});

test("F3 B1: executor F3 fora de workflow_run ou com CLI diferente falha antes da prova", async () => {
  await assert.rejects(sut.runCli(["--run-f3"], { GITHUB_EVENT_NAME: "workflow_dispatch" }), {
    code: "F3_MAIN_ONLY",
  });
  await assert.rejects(sut.runCli(["--run-f3"], {}), { code: "F3_MAIN_ONLY" });
  await assert.rejects(sut.runCli(["--prepare-fixtures"], {}), { code: "F3_CLI_USAGE" });
  await assert.rejects(sut.runCli([], {}), { code: "F3_CLI_USAGE" });
});

test("F3 B1: enums fechados de recibo, cleanup e perfil do 2º usuário", () => {
  assert.deepEqual([...sut.F3_CASE_STATUS], ["PASS", "FAIL", "BLOCKED", "N_A_JUSTIFICADO"]);
  assert.deepEqual(
    [...sut.F3_CLEANUP_STATUS],
    ["ISOLATED_NO_DELETE", "NO_MUTATION", "CLEANUP_FAILED"],
  );
  assert.equal(sut.F3_SECOND_USER_PROFILE, "leitor");
  assert.equal(sut.F3_BACKEND_SHA, "5eca44aebead3183e81b5c1af0d1dffa5fb8feb6");
  assert.ok(Object.isFrozen(sut.F3_PRODUCERS) && sut.F3_PRODUCERS.every(Object.isFrozen));
});

test("F3 B1: executor não importa preparador da Trilha A nem lê secrets fora do passo", async () => {
  const source = await readFile(new URL("./integracao-v1-fase3.mjs", import.meta.url), "utf8");
  // O contrato do YAML cita o passo do preparador; importar o preparador continua proibido.
  assert.equal(/(from|import\()\s*["'][^"']*prepare-visual-fixtures/.test(source), false);
  // B2b1: o contrato do YAML cita os nomes dos secrets; ler o valor no ambiente continua proibido
  // até o BUILD-2b-2, que entrega o login dentro do passo do executor.
  assert.equal(/env\s*(\.|\[\s*["'`])\s*CONTAOS_HML_SYNTHETIC/.test(source), false);
  // O único acesso ao ambiente é o parâmetro padrão de runCli.
  assert.equal(source.split("process.env").length - 1, 1);
});

test("F3 B1: catálogo publicado tem o SHA-256 fixado no executor", async () => {
  const raw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), sut.F3_CASES_SHA256);
});

test("F3 B2a: esperado do leitor segue a fotografia RBAC v6 tela a tela, sem presumir visível", () => {
  const adm = sut
    .buildF3Cases(csv)
    .cases.filter((c) => c.origin === "ADM01")
    .map((c) => [c.sourceConnectionId, c.destination, c.expected.leitor]);
  assert.equal(adm.length, 26);
  const denied = adm.filter(([, , e]) => e === "DENY").map(([, d]) => d);
  assert.deepEqual(denied.sort(), ["V102", "V103", "V105", "V113", "V122", "V123", "V123"]);
  // C0033 e C0034 (V123) seguem a matriz: auditoria/consultar negado ao leitor.
  for (const id of ["C0033", "C0034"]) assert.equal(adm.find(([c]) => c === id)[2], "DENY");
  assert.equal(sut.expectedAccess("SYS04", "leitor"), "ALLOW");
  assert.equal(sut.expectedAccess("ADM01", "leitor"), "DENY");
  assert.equal(sut.expectedAccess("V116", "leitor"), "ALLOW");
  assert.equal(sut.expectedAccess("V122", "master"), "ALLOW");
  assert.throws(() => sut.expectedAccess("V999", "leitor"), { code: "F3_SCREEN_ACCESS" });
  assert.throws(() => sut.expectedAccess("V101", "administrador"), { code: "F3_PROFILE" });
  assert.equal(sut.F3_RBAC_LEITOR.version, 6);
  assert.equal(sut.F3_RBAC_LEITOR.allowed.length + sut.F3_RBAC_LEITOR.denied, 48);
});

test("F3 B2a: toda tela de destino tem acesso com fonte real no código do produto", async () => {
  const destinations = new Set(sut.buildF3Cases(csv).cases.map((c) => c.destination));
  for (const d of destinations) assert.ok(sut.F3_SCREEN_ACCESS[d], d);
  const lines = async (file) => (await readFile(new URL(file, root), "utf8")).split("\n");
  for (const [screen, a] of Object.entries(sut.F3_SCREEN_ACCESS)) {
    assert.ok(["publica", "menu", "guarda", "rota-mae"].includes(a.kind), screen);
    const m = /^([^:]+):([0-9]+)-([0-9]+)$/.exec(a.source);
    assert.ok(m, screen + " formato da fonte");
    const text = (await lines(m[1]))
      .slice(Number(m[2]) - 1, Number(m[3]))
      .join("\n")
      .replace(/\s+/g, "");
    assert.ok(text, screen + " fonte");
    if (a.resource === null) {
      assert.ok(text.includes('"/selecionar-organizacao"'), screen);
      continue;
    }
    const resource = '"' + a.resource + '"';
    if (a.kind === "guarda")
      assert.ok(text.includes(resource + ',"' + a.action + '"'), screen + " guarda");
    else if (text.includes("recurso:"))
      assert.ok(
        text.includes("recurso:" + resource) && text.includes('acao:"' + a.action + '"'),
        screen + " menu comum",
      );
    else {
      assert.ok(text.includes("adicionar("), screen + " menu contextual");
      const args = text.slice(text.indexOf("adicionar("));
      if (a.action === "consultar")
        assert.ok(new RegExp(resource + "\\)").test(args), screen + " ação padrão consultar");
      else assert.ok(args.includes(resource + ',"' + a.action + '"'), screen + " ação explícita");
    }
    if (a.screenGuard) {
      const [file, line, fn] = a.screenGuard.split(":");
      assert.ok(
        (await lines(file))[Number(line) - 1].includes(fn + "("),
        screen + " guarda da tela",
      );
    } else assert.equal(a.screenGuard, null);
  }
  // Fonte imprecisa ou ação divergente falham.
  assert.notEqual(sut.F3_SCREEN_ACCESS.V122.action, "processar");
});

// ---------------------------------------------------------------------------------------------
// BUILD-2b-1: infraestrutura offline (relatório, SHA256SUMS, ledger, livro de intenções, RBAC,
// classificador de negação, isolamento e contrato do YAML). Os drivers de UI ficam no BUILD-2b-2.
// ---------------------------------------------------------------------------------------------
const F3 = "11111111-2222-4333-8444-555555555555";
const SHA = "a".repeat(40);
const PROV = Object.freeze({
  frontendSha: SHA,
  backendSha: sut.F3_BACKEND_SHA,
  harnessSha: "b".repeat(40),
  deploymentId: "dpl_ABCDEFGH1234",
  workflowRunId: "43509322900",
});
const uuid = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const catalogue = sut.buildF3Cases(csv);

/** Recibo PASS coerente para um caso do catálogo (fixture de teste, nunca do executor). */
function passReceipt(c) {
  const mutating = sut.F3_MUTATING_ORDERS.includes(c.producerOrder);
  return {
    ...sut.f3ReceiptBase(c, PROV),
    applicability: "APLICAVEL",
    observed: {
      master: c.expected.master,
      leitor: c.origin === "ADM01" ? c.expected.leitor : null,
    },
    positive: "PASS",
    negatives: { inexistente: "NEGADO", outraOrganizacao: "NEGADO" },
    duplicate: mutating ? "REJECTED" : "DUPLICATE_NOT_DEFINED",
    requestId: mutating ? uuid(c.producerOrder) : null,
    entityIds: mutating ? [uuid(100 + c.producerOrder)] : [],
    errorClass: null,
    cleanupStatus: mutating ? "ISOLATED_NO_DELETE" : "NO_MUTATION",
    status: "PASS",
  };
}
function completeReport(edit = () => {}) {
  const cases = catalogue.cases.map(passReceipt);
  const created = sut.F3_MUTATING_ORDERS.map((o) => ({
    id: uuid(100 + o),
    kind: o === 2 ? "organizacao" : "registro",
    organizationId: F3,
  }));
  created[0].id = F3;
  for (const r of cases) if (r.producerOrder === 2) r.entityIds = [F3];
  const report = {
    schema: sut.F3_REPORT_SCHEMA,
    scope: "INTEGRACAO_V1_FASE3_REL",
    nonce: "integracao-v1-fase3-rel-20261113-r1",
    casesSha256: sut.F3_CASES_SHA256,
    state: "COMPLETE",
    blockCode: null,
    provenance: { ...PROV },
    globals: {
      masterSession: true,
      masterLogout: true,
      secondSession: true,
      secondLogout: true,
      secondProfile: "leitor",
      rbacLeitorVersion: 6,
      masterPermissionsUnchanged: true,
      transportErrors: 0,
      httpErrors: 0,
      pageErrors: 0,
    },
    intents: { priorConfirmed: 0, sent: 28, confirmed: 18, uncertain: 0, rejected: 10 },
    isolation: {
      organizationF3: F3,
      created,
      e87Before: { V101: 3, V104: 2 },
      e87After: { V101: 3, V104: 2 },
    },
    summary: null,
    cases,
  };
  edit(report);
  report.summary = sut.f3Summary(report.cases);
  return report;
}

test("F3 B2b1: relatório completo e coerente valida e passa no gate", () => {
  const report = completeReport();
  assert.equal(sut.validateF3Report(report, catalogue), true);
  assert.equal(sut.f3Gate(report, catalogue), "PASS");
  assert.deepEqual(report.summary, { PASS: 138, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 });
});

test("F3 B2b1 RED: falso PASS é recusado, o status é derivado e não declarado", () => {
  const mutate = (fn) => {
    const r = completeReport((x) => fn(x.cases[0], x));
    return r;
  };
  for (const fn of [
    (c) => (c.positive = "NOT_RUN"),
    (c) => (c.negatives.inexistente = "NOT_RUN"),
    (c) => (c.negatives.outraOrganizacao = "SEM_ENTIDADE"),
    (c) => (c.negatives.outraOrganizacao = "VAZAMENTO"),
    (c) => (c.duplicate = "ACCEPTED"),
    (c) => (c.duplicate = "NOT_RUN"),
    (c) => (c.observed.master = "ERROR"),
    (c) => (c.observed.master = null),
    (c) => (c.cleanupStatus = "CLEANUP_FAILED"),
    (c) => (c.errorClass = "UI"),
  ]) {
    // Recibo com qualquer prova ausente ou falha nunca pode ser PASS.
    const r = mutate(fn);
    r.cases[0].status = "PASS";
    r.summary = { PASS: 138, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 };
    assert.throws(() => sut.validateF3Report(r, catalogue), { code: "F3_REPORT" });
    assert.notEqual(sut.deriveF3Status(r.cases[0]), "PASS");
  }
  // Esperado divergente do observado em caso ADM01: DENY esperado, ALLOW observado.
  const adm = completeReport();
  const i = adm.cases.findIndex((c) => c.origin === "ADM01" && c.expected.leitor === "DENY");
  adm.cases[i].observed.leitor = "ALLOW";
  assert.equal(sut.deriveF3Status(adm.cases[i]), "FAIL");
  // Resumo forjado falha mesmo com recibos corretos.
  const forged = completeReport();
  forged.summary.PASS = 137;
  forged.summary.BLOCKED = 1;
  assert.throws(() => sut.validateF3Report(forged, catalogue), { code: "F3_REPORT" });
  // N/A sem emenda aprovada pelo titular nunca vale.
  const na = completeReport((x) => {
    const c = x.cases.find((r) => r.classification === "CONDICIONAL");
    c.applicability = "N_A_JUSTIFICADO";
    c.status = "N_A_JUSTIFICADO";
  });
  assert.throws(() => sut.validateF3Report(na, catalogue), { code: "F3_NA_UNAPPROVED" });
  assert.deepEqual([...sut.F3_NA_AMENDMENTS], []);
});

test("F3 B2b1 RED: campo livre ou credencial no relatório é recusado", () => {
  const leaks = [
    (r) => (r.cases[0].requestId = "usuario@example.com"),
    (r) => (r.cases[0].entityIds = ["eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig"]),
    (r) => (r.provenance.deploymentId = "senha forte"),
    (r) => (r.cases[0].note = "texto livre"),
    (r) => (r.globals.secondEmail = "x@y.z"),
    (r) => (r.blockCode = "Falha ao entrar com usuario x"),
    (r) => (r.isolation.created[1].kind = "<div>dom</div>"),
    (r) => (r.cases[0].frontendSha = "c".repeat(40)),
    (r) => (r.cases[0].artifactId = 123),
    (r) => (r.isolation.e87Before.V999 = 1),
  ];
  for (const fn of leaks) {
    const r = completeReport(fn);
    assert.throws(
      () => sut.validateF3Report(r, catalogue),
      (e) => ["F3_REPORT", "F3_ISOLATION"].includes(e.code),
    );
  }
  const proxy = completeReport();
  assert.throws(() => sut.validateF3Report(new Proxy(proxy, {}), catalogue), {
    code: "F3_REPORT",
  });
});

test("F3 B2b1 RED: mutação fora da organização F3 e contadores da e87f7e68 alterados", () => {
  const outside = completeReport((r) => (r.isolation.created[3].organizationId = sut.F3_E87_ORG));
  assert.throws(() => sut.validateF3Report(outside, catalogue), { code: "F3_ISOLATION" });
  const counter = completeReport((r) => (r.isolation.e87After.V101 = 4));
  assert.equal(sut.validateF3Report(counter, catalogue), true);
  assert.equal(sut.f3Gate(counter, catalogue), "FAIL");
  const same = completeReport((r) => (r.isolation.organizationF3 = sut.F3_E87_ORG));
  assert.throws(() => sut.validateF3Report(same, catalogue), { code: "F3_ISOLATION" });
  const orphan = completeReport((r) => (r.cases[5].entityIds = [uuid(999)]));
  assert.throws(() => sut.validateF3Report(orphan, catalogue), { code: "F3_ISOLATION" });
  // Livro de intenções recusa organização diferente da F3 antes de enviar.
  const book = sut.createF3IntentBook({ organizationF3: F3, priorConfirmed: 0 });
  assert.throws(
    () =>
      book.seal({
        requestId: uuid(1),
        producerOrder: 5,
        actor: "master",
        organizationId: sut.F3_E87_ORG,
      }),
    { code: "F3_FOREIGN_ORG" },
  );
  assert.throws(() => sut.createF3IntentBook({ organizationF3: sut.F3_E87_ORG }), {
    code: "F3_FOREIGN_ORG",
  });
});

test("F3 B2b1 RED: livro de intenções idempotente, incerto não é reenviado sem readback", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3, priorConfirmed: 0 });
  const intent = { requestId: uuid(7), producerOrder: 7, actor: "master", organizationId: F3 };
  book.seal(intent);
  assert.throws(() => book.seal(intent), { code: "F3_INTENT_REPLAY" });
  book.uncertain(uuid(7));
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  // Readback que encontra a entidade confirma sem reenviar.
  book.reconcile(uuid(7), { found: true, entityId: uuid(70), organizationId: F3 });
  assert.equal(book.state(uuid(7)), "confirmed");
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  // Readback ausente libera um único reenvio, que conta no orçamento.
  book.seal({ ...intent, requestId: uuid(8) });
  book.uncertain(uuid(8));
  book.reconcile(uuid(8), { found: false, entityId: null, organizationId: null });
  book.resend(uuid(8));
  assert.throws(() => book.resend(uuid(8)), { code: "F3_UNCERTAIN_RESEND" });
  book.confirm(uuid(8), { entityId: uuid(80), organizationId: F3 });
  // Readback com entidade em outra organização é mutação fora da F3.
  book.seal({ ...intent, requestId: uuid(9) });
  book.uncertain(uuid(9));
  assert.throws(
    () =>
      book.reconcile(uuid(9), { found: true, entityId: uuid(90), organizationId: sut.F3_E87_ORG }),
    { code: "F3_FOREIGN_ORG" },
  );
  // Duplicidade rejeitada conta como enviada.
  book.seal({ ...intent, requestId: uuid(10), duplicateOf: uuid(7) });
  book.rejected(uuid(10));
  const s = book.summary();
  assert.deepEqual(s, { priorConfirmed: 0, sent: 5, confirmed: 2, uncertain: 1, rejected: 1 });
  assert.deepEqual(
    book.created().map((c) => c.id),
    [uuid(70), uuid(80)],
  );
  assert.throws(() => book.confirm(uuid(99), { entityId: uuid(1), organizationId: F3 }), {
    code: "F3_INTENT_UNKNOWN",
  });
});

test("F3 B2b1 RED: orçamento do livro recusa a 31ª intenção da execução e o teto de 60", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3, priorConfirmed: 0 });
  for (let i = 1; i <= 30; i++)
    book.seal({ requestId: uuid(i), producerOrder: 5, actor: "master", organizationId: F3 });
  assert.throws(
    () => book.seal({ requestId: uuid(31), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_BUDGET" },
  );
  const late = sut.createF3IntentBook({ organizationF3: F3, priorConfirmed: 60 });
  assert.throws(
    () => late.seal({ requestId: uuid(1), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_BUDGET" },
  );
});

test("F3 B2b1 RED: mutação pelo 2º usuário e produtor sem mutação são recusados", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3, priorConfirmed: 0 });
  for (const actor of ["leitor", "segundo", null, "MASTER"])
    assert.throws(
      () => book.seal({ requestId: uuid(1), producerOrder: 5, actor, organizationId: F3 }),
      { code: "F3_SECOND_USER_MUTATION" },
    );
  for (const producerOrder of [1, 3, 21, 0])
    assert.throws(
      () => book.seal({ requestId: uuid(1), producerOrder, actor: "master", organizationId: F3 }),
      { code: "F3_INTENT_PRODUCER" },
    );
  assert.throws(
    () => book.seal({ requestId: "IFV1-1", producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_INTENT_ID" },
  );
});

test("F3 B2b1 RED: perfil diferente de leitor e RBAC divergente da fotografia v6 falham", () => {
  assert.equal(sut.assertF3SecondUserProfile("leitor"), true);
  for (const p of ["administrador", "Leitor", "", null, "leitor "])
    assert.throws(() => sut.assertF3SecondUserProfile(p), { code: "F3_SECOND_USER_PROFILE" });
  const ok = { version: 6, allowed: [...sut.F3_RBAC_LEITOR.allowed].reverse() };
  assert.equal(sut.assertF3LeitorRbac(ok), true);
  for (const bad of [
    { ...ok, version: 7 },
    { ...ok, allowed: ok.allowed.slice(1) },
    { ...ok, allowed: [...ok.allowed, "auditoria/consultar"] },
    { ...ok, allowed: [...ok.allowed.slice(1), "contratantes/criar"] },
    { ...ok, allowed: [...ok.allowed, ok.allowed[0]] },
    { version: 6 },
    new Proxy(ok, {}),
  ])
    assert.throws(() => sut.assertF3LeitorRbac(bad), { code: "F3_RBAC_DRIFT" });
});

test("F3 B2b1: negação só vale como estado explícito; V123 distingue erro de DENY pela RPC", () => {
  const obs = (denialToken, content, rpc = null) => ({ denialToken, content, rpc });
  assert.equal(sut.classifyF3Access("V102", obs("aviso-negado", false)), "DENY");
  assert.equal(sut.classifyF3Access("V105", obs("negadoGate", false)), "DENY");
  assert.equal(sut.classifyF3Access("V113", obs("perfilNegado", false)), "DENY");
  assert.equal(sut.classifyF3Access("V122", obs("sem_permissao", false)), "DENY");
  assert.equal(sut.classifyF3Access("ADM01", obs("fase-negado", false)), "DENY");
  assert.equal(sut.classifyF3Access("V101", obs(null, true)), "ALLOW");
  // Tela vazia, genérica ou com estado de outra tela é erro, nunca DENY.
  assert.equal(sut.classifyF3Access("V102", obs(null, false)), "ERROR");
  assert.equal(sut.classifyF3Access("V102", obs("negadoGate", false)), "ERROR");
  assert.equal(sut.classifyF3Access("V102", obs("aviso-negado", true)), "ERROR");
  assert.equal(sut.classifyF3Access("V101", obs("aviso-negado", false)), "ERROR");
  // V117: negação parcial de revisão não conta como negação da tela.
  assert.equal(sut.classifyF3Access("V117", obs("revisao-negada", true)), "ALLOW");
  assert.equal(sut.classifyF3Access("V117", obs("revisao-negada", false)), "ERROR");
  // V123: só DENY com a RPC respondendo 200 e false; erro da RPC nunca vira DENY.
  const rpc = (status, body) => ({ name: "pode_consultar_auditoria_organizacao", status, body });
  assert.equal(sut.classifyF3Access("V123", obs("acessoNegado", false, rpc(200, false))), "DENY");
  assert.equal(sut.classifyF3Access("V123", obs(null, true, rpc(200, true))), "ALLOW");
  for (const r of [
    null,
    rpc(500, null),
    rpc(401, false),
    rpc(200, "false"),
    rpc(200, null),
    { name: "outra_rpc", status: 200, body: false },
  ])
    assert.equal(sut.classifyF3Access("V123", obs("acessoNegado", false, r)), "ERROR");
  assert.equal(sut.classifyF3Access("V123", obs("acessoNegado", false, rpc(200, true))), "ERROR");
  assert.throws(() => sut.classifyF3Access("V999", obs(null, true)), { code: "F3_SCREEN_ACCESS" });
  assert.throws(
    () => sut.classifyF3Access("V101", { denialToken: null, content: "sim", rpc: null }),
    {
      code: "F3_ACCESS_OBSERVATION",
    },
  );
  // Toda tela com DENY esperado para o leitor tem estado explícito registrado.
  for (const c of catalogue.cases)
    if (c.expected.leitor === "DENY") assert.ok(sut.F3_DENIAL_TOKENS[c.destination], c.destination);
});

test("F3 B2b1: relatório bloqueado também é válido e gravado com SHA256SUMS conferível", async () => {
  const { mkdtemp, readFile: rf, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const blocked = sut.blockedF3Report({ code: "F3_DRIVER_PENDING", catalogue, provenance: PROV });
  assert.equal(sut.validateF3Report(blocked, catalogue), true);
  assert.equal(blocked.state, "BLOCKED");
  assert.equal(blocked.summary.BLOCKED, 138);
  assert.equal(sut.f3Gate(blocked, catalogue), "FAIL");
  // Sem catálogo carregado (hash divergente), o relatório bloqueado vem sem casos.
  const early = sut.blockedF3Report({ code: "F3_CASES_HASH", catalogue: null, provenance: null });
  assert.equal(sut.validateF3Report(early, null), true);
  assert.equal(early.cases.length, 0);
  const dir = await mkdtemp(join(tmpdir(), "f3-"));
  const casesRaw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  await sut.writeF3Artifacts(dir, blocked, catalogue, casesRaw);
  assert.deepEqual((await readdir(dir)).sort(), ["F3_CASES.json", "F3_REPORT.json", "SHA256SUMS"]);
  const sums = (await rf(join(dir, "SHA256SUMS"), "utf8")).trim().split("\n");
  assert.equal(sums.length, 2);
  for (const line of sums) {
    const [hex, name] = line.split("  ");
    assert.equal(
      createHash("sha256")
        .update(await rf(join(dir, name)))
        .digest("hex"),
      hex,
    );
  }
  assert.equal(
    JSON.parse(await rf(join(dir, "F3_REPORT.json"), "utf8")).blockCode,
    "F3_DRIVER_PENDING",
  );
  // Relatório inválido nunca é gravado.
  const bad = { ...blocked, blockCode: "texto livre" };
  await assert.rejects(sut.writeF3Artifacts(dir, bad, catalogue, casesRaw), { code: "F3_REPORT" });
  for (const code of ["", "a b", null, "X".repeat(81)])
    assert.throws(() => sut.blockedF3Report({ code, catalogue, provenance: PROV }), {
      code: "F3_REPORT",
    });
  // Provenance de ambiente é saneada: só valores no formato exato chegam ao relatório.
  assert.deepEqual(
    sut.f3ProvenanceFromEnv({
      CONTAOS_FRONTEND_SHA: SHA,
      CONTAOS_DEPLOYMENT_ID: "dpl_ABCDEFGH1234",
      CONTAOS_HARNESS_SHA: "x",
      GITHUB_RUN_ID: "123",
    }),
    {
      frontendSha: SHA,
      backendSha: sut.F3_BACKEND_SHA,
      harnessSha: null,
      deploymentId: "dpl_ABCDEFGH1234",
      workflowRunId: "123",
    },
  );
});

test("F3 B2b1: ledger inicial vazio com SHA fixado, append-only e só PASS (regra C)", async () => {
  const raw = await readFile(new URL(sut.F3_LEDGER_PATH, root), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), sut.F3_LEDGER_SHA256);
  const ledger = sut.validateF3Ledger(raw, catalogue);
  assert.equal(ledger.entries.length, 0);
  const entry = (caseId, extra = {}) => ({
    caseId,
    status: "PASS",
    ...PROV,
    artifactId: "14076439209",
    sha256: "d".repeat(64),
    reviewId: "5900720754",
    ...extra,
  });
  const next = (entries) => JSON.stringify({ ...JSON.parse(raw), entries }, null, 2) + "\n";
  const one = next([entry(catalogue.cases[0].caseId)]);
  assert.equal(sut.validateF3LedgerExtension(raw, one, catalogue), true);
  const two = next([entry(catalogue.cases[0].caseId), entry(catalogue.cases[1].caseId)]);
  assert.equal(sut.validateF3LedgerExtension(one, two, catalogue), true);
  // Remoção, reescrita, caso FAIL, duplicado ou fora do catálogo falham.
  for (const bad of [
    [entry(catalogue.cases[1].caseId)],
    [entry(catalogue.cases[0].caseId, { status: "FAIL" })],
    [entry(catalogue.cases[0].caseId), entry(catalogue.cases[0].caseId)],
    [entry("IFV1-F3-C9999")],
    [entry(catalogue.cases[0].caseId, { artifactId: null })],
    [entry(catalogue.cases[0].caseId, { email: "x@y.z" })],
  ])
    assert.throws(() => sut.validateF3LedgerExtension(one, next(bad), catalogue), {
      code: "F3_LEDGER",
    });
  // Preservação: só PASS com mesma proveniência de produto, backend e deployment, e harness ancestral.
  const ledgerTwo = sut.validateF3Ledger(two, catalogue);
  const isAncestor = (sha) => sha === PROV.harnessSha;
  assert.deepEqual(
    sut.preservedF3Cases(ledgerTwo, { ...PROV, harnessSha: "e".repeat(40) }, isAncestor),
    [catalogue.cases[0].caseId, catalogue.cases[1].caseId],
  );
  assert.deepEqual(
    sut.preservedF3Cases(ledgerTwo, { ...PROV, frontendSha: "f".repeat(40) }, isAncestor),
    [],
  );
  assert.deepEqual(
    sut.preservedF3Cases(ledgerTwo, PROV, () => false),
    [],
  );
});

test("F3 B2b1: contrato do YAML aceita o real e recusa adulterações (controle negativo)", async () => {
  const yaml = await readFile(
    new URL("../../.github/workflows/contaos-trilha-a-fixtures.yml", import.meta.url),
    "utf8",
  );
  assert.equal(sut.assertF3WorkflowContract(yaml), true);
  const swap = (a, b) => {
    assert.ok(yaml.includes(a), a);
    return yaml.replace(a, b);
  };
  const f3Step = "      - name: Somente agora fornecer os pares sinteticos ao executor da Fase 3\n";
  const guardStep = "      - name: Barreira nativa no mesmo HEAD antes de secrets\n";
  const tampered = [
    // Gate de escopo trocado ou removido.
    swap(
      "        if: steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n        env:\n          CONTAOS_HML_SYNTHETIC_EMAIL",
      "        if: steps.revalidate.outputs.scope == 'TRILHA_A'\n        env:\n          CONTAOS_HML_SYNTHETIC_EMAIL",
    ),
    // Secret do 2º usuário no env do job.
    swap(
      "      CONTAOS_FRONTEND_SOURCE: ${{ github.workspace }}/frontend-source\n",
      "      CONTAOS_FRONTEND_SOURCE: ${{ github.workspace }}/frontend-source\n      CONTAOS_HML_SYNTHETIC_2_EMAIL: ${{ secrets.CONTAOS_HML_SYNTHETIC_2_EMAIL }}\n",
    ),
    // Secret do 2º usuário entregue ao preparador da Trilha A.
    swap(
      "        run: node scripts/hml/prepare-visual-fixtures.mjs --prepare-fixtures\n",
      "          CONTAOS_HML_SYNTHETIC_2_PASSWORD: ${{ secrets.CONTAOS_HML_SYNTHETIC_2_PASSWORD }}\n        run: node scripts/hml/prepare-visual-fixtures.mjs --prepare-fixtures\n",
    ),
    // Revalidação sem id ou sem restrição a workflow_run.
    swap(
      "        id: revalidate\n        if: github.event_name == 'workflow_run'\n",
      "        id: revalidate\n",
    ),
    swap("        id: revalidate\n", ""),
    // Barreira nativa movida para depois do executor F3.
    (() => {
      const start = yaml.indexOf(guardStep),
        end = yaml.indexOf("      - name: Preparacao e SSR", start);
      const block = yaml.slice(start, end),
        rest = yaml.slice(0, start) + yaml.slice(end);
      const at = rest.indexOf("      - name: Verificar hashes da Fase 3");
      return rest.slice(0, at) + block + rest.slice(at);
    })(),
    // Arquivo F3 fora do filtro de paths ou do node --test do protocolo.
    swap("      - scripts/hml/integracao-v1-fase3.test.mjs\n", ""),
    swap(" scripts/hml/integracao-v1-fase3.test.mjs\n      - name: Lint", "\n      - name: Lint"),
    // Hash da Fase 3 sem always() ou evidência sem o gate.
    swap(
      "        if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n        working-directory: artifacts/integracao-v1-fase3\n",
      "        working-directory: artifacts/integracao-v1-fase3\n",
    ),
    // Gatilho, permissão ou environment alterados.
    swap("permissions:\n  contents: read\njobs:", "permissions:\n  contents: write\njobs:"),
    swap("    environment: hml\n", "    environment: prod\n"),
    swap(
      "      - run: |\n          node --test scripts/ci/install-pinned-bun.test.mjs\n          node scripts/ci/install-pinned-bun.mjs\n      - name: Dependencias congeladas do executor",
      "      - name: Dependencias congeladas do executor",
    ),
    yaml + "\n# CONTAOS_HML_SYNTHETIC_2_EMAIL\n",
  ];
  for (const [i, bad] of tampered.entries()) {
    assert.notEqual(bad, yaml, "adulteração " + i);
    assert.throws(
      () => sut.assertF3WorkflowContract(bad),
      { code: "F3_WORKFLOW" },
      "adulteração " + i,
    );
    // A estrutura sozinha pega tudo, exceto a remoção do passo do bun, que só o SHA pega.
    if (i !== tampered.length - 2)
      assert.throws(
        () => sut.assertF3WorkflowStructure(bad),
        { code: "F3_WORKFLOW" },
        "estrutura " + i,
      );
  }
  assert.equal(sut.assertF3WorkflowStructure(yaml), true);
});

test("F3 B2b1: executor confere YAML e ledger por SHA antes do driver", async () => {
  const source = await readFile(new URL("./integracao-v1-fase3.mjs", import.meta.url), "utf8");
  const body = source.slice(source.indexOf("export async function runCli("));
  const order = [
    "loadSingleRequestProof(",
    "assertF3Scope(",
    "assertF3WorkflowContract(",
    "validateF3Cases(",
    "validateF3Ledger(",
    'fail("F3_DRIVER_PENDING")',
    "writeF3Artifacts(",
  ].map((needle) => body.indexOf(needle));
  assert.ok(
    order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1])),
    String(order),
  );
  const yaml = await readFile(new URL("../../" + sut.F3_WORKFLOW_PATH, import.meta.url));
  assert.equal(createHash("sha256").update(yaml).digest("hex"), sut.F3_WORKFLOW_SHA256);
});

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
  assert.ok(sut.assertF3Budget({ priorSent: 0, newIntents: 30 }));
  assert.ok(sut.assertF3Budget({ priorSent: 30, newIntents: 30 }));
  for (const bad of [
    { priorSent: 0, newIntents: 31 },
    { priorSent: 31, newIntents: 30 },
    { priorSent: -1, newIntents: 1 },
    { priorSent: 0, newIntents: 1.5 },
    { priorConfirmed: 0, newIntents: 1 },
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
// classificador de negação, isolamento e contrato do YAML). R2 cobre a revisão 5900926490.
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
const MUT = sut.F3_MUTATING_ORDERS;
// Política de teste: unicidade definida nas ordens 4 a 13, não definida em 2 e 14 a 20.
const REJ = (o) => o >= 4 && o <= 13;
const POLICY = Object.freeze({
  ...sut.F3_DUPLICATE_POLICY,
  ...Object.fromEntries(
    MUT.map((o) => [
      String(o),
      Object.freeze({
        result: REJ(o) ? "REJECTED" : "DUPLICATE_NOT_DEFINED",
        source: "src/x/Tela.tsx:1-2",
      }),
    ]),
  ),
});
const NP = Object.freeze({ prior: sut.F3_NO_PRIOR });
const OPT = Object.freeze({ policy: POLICY, prior: sut.F3_NO_PRIOR });
const entity = (o) => (o === 2 ? F3 : uuid(100 + o));

/** Relatório COMPLETE coerente (fixture de teste, nunca do executor). */
function completeReport(edit = () => {}) {
  const requests = [];
  for (const o of MUT) {
    requests.push({
      requestId: uuid(o),
      producerOrder: o,
      duplicateOf: null,
      outcome: "confirmed",
      prior: false,
      entityId: entity(o),
      sends: 1,
    });
    if (REJ(o))
      requests.push({
        requestId: uuid(200 + o),
        producerOrder: o,
        duplicateOf: uuid(o),
        outcome: "rejected",
        prior: false,
        entityId: null,
        sends: 1,
      });
  }
  const cases = catalogue.cases.map((c) => {
    const m = MUT.includes(c.producerOrder);
    return {
      ...sut.f3ReceiptBase(c, PROV),
      applicability: "APLICAVEL",
      observed: {
        master: c.expected.master,
        leitor: c.origin === "ADM01" ? c.expected.leitor : null,
      },
      positive: "PASS",
      negatives: { inexistente: "NEGADO", outraOrganizacao: "NEGADO" },
      duplicate: POLICY[String(c.producerOrder)].result,
      requestId: m ? uuid(c.producerOrder) : null,
      entityIds: m ? [entity(c.producerOrder)] : [],
      errorClass: null,
      cleanupStatus: m ? "ISOLATED_NO_DELETE" : "NO_MUTATION",
      status: "PASS",
    };
  });
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
    intents: { priorSent: 0, sent: 28, confirmed: 18, uncertain: 0, rejected: 10, requests },
    isolation: {
      organizationF3: F3,
      created: MUT.map((o) => ({
        id: entity(o),
        kind: o === 2 ? "organizacao" : "registro",
        organizationId: F3,
        requestId: uuid(o),
      })),
      e87Before: { V101: 3, V104: 2, V112: 4, V121: 1 },
      e87After: { V101: 3, V104: 2, V112: 4, V121: 1 },
    },
    summary: null,
    cases,
  };
  edit(report);
  report.summary = sut.f3Summary(report.cases);
  return report;
}
const valid = (r) => sut.validateF3Report(r, catalogue, OPT);
const gate = (r) => sut.f3Gate(r, catalogue, OPT);
const rejects = (r, codes = ["F3_REPORT"]) =>
  assert.throws(
    () => valid(r),
    (e) => codes.includes(e.code),
  );
const forProducer = (r, o, fn) => r.cases.filter((c) => c.producerOrder === o).forEach(fn);

test("F3 B2b1: relatório completo e coerente valida e passa no gate", () => {
  const report = completeReport();
  assert.equal(valid(report), true);
  assert.equal(gate(report), "PASS");
  assert.deepEqual(report.summary, { PASS: 138, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 });
  assert.deepEqual(MUT, [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
});

test("F3 B2b1 RED: falso PASS no recibo é recusado, o status é derivado", () => {
  for (const fn of [
    (c) => (c.positive = "NOT_RUN"),
    (c) => (c.negatives.inexistente = "NOT_RUN"),
    (c) => (c.negatives.outraOrganizacao = "SEM_ENTIDADE"),
    (c) => (c.negatives.outraOrganizacao = "VAZAMENTO"),
    (c) => (c.observed.master = "ERROR"),
    (c) => (c.observed.master = null),
    (c) => (c.cleanupStatus = "CLEANUP_FAILED"),
    (c) => (c.errorClass = "UI"),
  ]) {
    const r = completeReport((x) => fn(x.cases[40]));
    r.summary = { PASS: 138, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 };
    rejects(r);
    assert.notEqual(sut.deriveF3Status(r.cases[40], POLICY), "PASS");
  }
  const adm = completeReport();
  const i = adm.cases.findIndex((c) => c.origin === "ADM01" && c.expected.leitor === "DENY");
  adm.cases[i].observed.leitor = "ALLOW";
  assert.equal(sut.deriveF3Status(adm.cases[i], POLICY), "FAIL");
  const forged = completeReport();
  forged.summary.PASS = 137;
  forged.summary.BLOCKED = 1;
  rejects(forged);
  const na = completeReport((x) => {
    const c = x.cases.find((r) => r.classification === "CONDICIONAL");
    c.applicability = "N_A_JUSTIFICADO";
    c.status = "N_A_JUSTIFICADO";
  });
  rejects(na, ["F3_NA_UNAPPROVED"]);
  assert.deepEqual([...sut.F3_NA_AMENDMENTS], []);
});

test("F3 B2b1 RED (B1): intenções, recibos e inventário são cruzados", () => {
  // Nenhuma intenção enviada com 118 recibos mutantes PASS.
  rejects(completeReport((r) => (r.intents.sent = 0)));
  rejects(
    completeReport((r) => {
      r.intents = { priorSent: 0, sent: 0, confirmed: 0, uncertain: 0, rejected: 0, requests: [] };
    }),
    ["F3_REPORT", "F3_ISOLATION"],
  );
  // Contadores divergentes das intenções listadas.
  rejects(completeReport((r) => (r.intents.uncertain = 8)));
  rejects(completeReport((r) => (r.intents.confirmed = 17)));
  // Intenção do produtor pendente: os casos dele não podem ser PASS.
  rejects(
    completeReport((r) => {
      r.intents.requests[1].outcome = "pending";
      r.intents.requests[1].entityId = null;
      r.intents.rejected -= 1;
      r.intents.uncertain += 1;
    }),
  );
  // Pré-requisito pendente sem recibo próprio: relatório válido, gate FAIL.
  const pending = completeReport((r) => {
    r.intents.requests.push({
      requestId: uuid(500),
      producerOrder: 18,
      duplicateOf: null,
      outcome: "pending",
      prior: false,
      entityId: null,
      sends: 1,
    });
    r.intents.sent += 1;
    r.intents.uncertain += 1;
  });
  assert.equal(valid(pending), true);
  assert.equal(gate(pending), "FAIL");
  // Intenção confirmada sem entidade no inventário, e entidade sem intenção.
  rejects(
    completeReport((r) => {
      r.intents.requests.push({
        requestId: uuid(501),
        producerOrder: 18,
        duplicateOf: null,
        outcome: "confirmed",
        prior: false,
        entityId: uuid(501),
        sends: 1,
      });
      r.intents.sent += 1;
      r.intents.confirmed += 1;
    }),
    ["F3_ISOLATION"],
  );
  rejects(
    completeReport((r) =>
      r.isolation.created.push({
        id: uuid(777),
        kind: "registro",
        organizationId: F3,
        requestId: uuid(777),
      }),
    ),
    ["F3_ISOLATION"],
  );
  // Livro: intenção selada sem desfecho conta como pendente.
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  book.seal({ requestId: uuid(1), producerOrder: 5, actor: "master", organizationId: F3 });
  assert.equal(book.summary().uncertain, 1);
  assert.equal(book.summary().requests[0].outcome, "pending");
});

test("F3 B2b1 RED (I1): chaves herdadas e conjunto de contadores fora do fixado falham", () => {
  for (const counters of [
    { toString: 0 },
    { constructor: 1 },
    { SYS04: 0 },
    JSON.parse('{"__proto__":1}'),
  ])
    rejects(
      completeReport((r) => {
        r.isolation.e87Before = { ...counters };
        r.isolation.e87After = { ...counters };
      }),
      ["F3_ISOLATION"],
    );
  const partial = completeReport((r) => {
    r.isolation.e87Before = { V101: 3 };
    r.isolation.e87After = { V101: 3 };
  });
  assert.equal(valid(partial), true);
  assert.equal(gate(partial), "FAIL");
  const changed = completeReport((r) => (r.isolation.e87After.V101 = 4));
  assert.equal(gate(changed), "FAIL");
  for (const screen of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
    assert.throws(
      () => sut.classifyF3Access(screen, { denialToken: null, content: true, rpc: null }),
      {
        code: "F3_SCREEN_ACCESS",
      },
    );
    assert.throws(() => sut.expectedAccess(screen, "leitor"), { code: "F3_SCREEN_ACCESS" });
  }
  assert.deepEqual([...sut.F3_E87_COUNTER_SCREENS], ["V101", "V104", "V112", "V121"]);
});

test("F3 B2b1 RED (I2): duplicidade é por produtor, com política com fonte", () => {
  // Política de produção ainda sem fonte: nenhum caso mutante fecha PASS.
  assert.throws(() => sut.validateF3Report(completeReport(), catalogue, NP), { code: "F3_REPORT" });
  const pendingPolicy = completeReport((r) => {
    for (const c of r.cases) {
      if (!MUT.includes(c.producerOrder)) continue;
      c.duplicate = "NOT_RUN";
      c.status = "BLOCKED";
    }
    r.intents.requests = r.intents.requests.filter((q) => q.duplicateOf === null);
    r.intents.sent = 18;
    r.intents.rejected = 0;
  });
  assert.equal(sut.validateF3Report(pendingPolicy, catalogue, NP), true);
  assert.equal(sut.f3Gate(pendingPolicy, catalogue, NP), "FAIL");
  assert.ok(MUT.every((o) => sut.F3_DUPLICATE_POLICY[String(o)] === null));
  // Resultado diferente da política, ou divergente dentro do produtor.
  rejects(completeReport((r) => forProducer(r, 15, (c) => (c.duplicate = "REJECTED"))));
  rejects(
    completeReport((r) => (r.cases.find((c) => c.producerOrder === 5).duplicate = "NOT_RUN")),
  );
  // REJECTED sem tentativa registrada no livro.
  rejects(
    completeReport((r) => {
      r.intents.requests = r.intents.requests.filter((q) => q.duplicateOf !== uuid(5));
      r.intents.sent -= 1;
      r.intents.rejected -= 1;
    }),
  );
  // requestId diferente no mesmo produtor e o mesmo requestId em dois produtores.
  rejects(completeReport((r) => (r.cases.find((c) => c.producerOrder === 6).requestId = uuid(7))));
  rejects(
    completeReport((r) => {
      forProducer(r, 7, (c) => (c.requestId = uuid(6)));
      forProducer(r, 7, (c) => (c.entityIds = [entity(6)]));
    }),
    ["F3_REPORT", "F3_ISOLATION"],
  );
  // Produtor sem mutação com REJECTED.
  rejects(completeReport((r) => forProducer(r, 1, (c) => (c.duplicate = "REJECTED"))));
  // Duplicidade aceita pelo produto vira FAIL, com a tentativa confirmada no inventário.
  const accepted = completeReport((r) => {
    const q = r.intents.requests.find((x) => x.duplicateOf === uuid(8));
    q.outcome = "confirmed";
    q.entityId = uuid(808);
    r.intents.confirmed += 1;
    r.intents.rejected -= 1;
    r.isolation.created.push({
      id: uuid(808),
      kind: "registro",
      organizationId: F3,
      requestId: q.requestId,
    });
    forProducer(r, 8, (c) => {
      c.duplicate = "ACCEPTED";
      c.status = "FAIL";
    });
  });
  assert.equal(valid(accepted), true);
  assert.equal(accepted.summary.FAIL, sut.F3_PRODUCERS[7].connections);
  // Política malformada é recusada.
  for (const bad of [
    { ...POLICY, 5: { result: "REJECTED", source: "" } },
    { ...POLICY, 5: { result: "ACCEPTED", source: "src/a.ts:1-1" } },
    { ...POLICY, 1: { result: "REJECTED", source: "src/a.ts:1-1" } },
    { ...POLICY, 21: null },
  ])
    assert.throws(() => sut.validateF3DuplicatePolicy(bad), { code: "F3_DUPLICATE_POLICY" });
});

test("F3 B2b1 RED (M1): entidade de outro produtor e inventário sem a organização falham", () => {
  rejects(
    completeReport((r) => forProducer(r, 9, (c) => (c.entityIds = [entity(10)]))),
    ["F3_ISOLATION"],
  );
  rejects(
    completeReport((r) => (r.isolation.created[0].kind = "registro")),
    ["F3_ISOLATION"],
  );
  rejects(
    completeReport((r) => (r.isolation.created[1].kind = "organizacao")),
    ["F3_ISOLATION"],
  );
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
    (r) => (r.intents.requests[0].note = "x"),
  ];
  for (const fn of leaks) rejects(completeReport(fn), ["F3_REPORT", "F3_ISOLATION"]);
  rejects(new Proxy(completeReport(), {}));
});

test("F3 B2b1 RED: mutação fora da organização F3 é recusada no relatório e no livro", () => {
  rejects(
    completeReport((r) => (r.isolation.created[3].organizationId = sut.F3_E87_ORG)),
    ["F3_ISOLATION"],
  );
  rejects(
    completeReport((r) => (r.isolation.organizationF3 = sut.F3_E87_ORG)),
    ["F3_ISOLATION"],
  );
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  const base = { requestId: uuid(1), producerOrder: 5, actor: "master" };
  assert.throws(() => book.seal({ ...base, organizationId: sut.F3_E87_ORG }), {
    code: "F3_FOREIGN_ORG",
  });
  assert.throws(() => sut.createF3IntentBook({ organizationF3: sut.F3_E87_ORG }), {
    code: "F3_FOREIGN_ORG",
  });
  book.seal({ ...base, organizationId: F3 });
  assert.throws(
    () => book.confirm(uuid(1), { entityId: uuid(2), organizationId: sut.F3_E87_ORG }),
    {
      code: "F3_FOREIGN_ORG",
    },
  );
});

test("F3 B2b1 RED: livro idempotente, incerto não é reenviado sem readback", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  const intent = { requestId: uuid(7), producerOrder: 7, actor: "master", organizationId: F3 };
  book.seal(intent);
  assert.throws(() => book.seal(intent), { code: "F3_INTENT_REPLAY" });
  book.uncertain(uuid(7));
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  book.reconcile(uuid(7), { found: true, entityId: uuid(70), organizationId: F3 });
  assert.equal(book.state(uuid(7)), "confirmed");
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  book.seal({ ...intent, requestId: uuid(8) });
  book.uncertain(uuid(8));
  book.reconcile(uuid(8), { found: false, entityId: null, organizationId: null });
  book.resend(uuid(8));
  assert.throws(() => book.resend(uuid(8)), { code: "F3_UNCERTAIN_RESEND" });
  book.confirm(uuid(8), { entityId: uuid(80), organizationId: F3 });
  book.seal({ ...intent, requestId: uuid(9) });
  book.uncertain(uuid(9));
  assert.throws(
    () =>
      book.reconcile(uuid(9), { found: true, entityId: uuid(90), organizationId: sut.F3_E87_ORG }),
    { code: "F3_FOREIGN_ORG" },
  );
  book.seal({ ...intent, requestId: uuid(10), duplicateOf: uuid(7) });
  book.rejected(uuid(10));
  const s = book.summary();
  assert.equal(s.sent, 5);
  assert.deepEqual([s.confirmed, s.uncertain, s.rejected], [2, 1, 1]);
  assert.deepEqual(
    book.created().map((c) => [c.id, c.requestId, c.kind]),
    [
      [uuid(70), uuid(7), "registro"],
      [uuid(80), uuid(8), "registro"],
    ],
  );
  assert.throws(() => book.confirm(uuid(99), { entityId: uuid(1), organizationId: F3 }), {
    code: "F3_INTENT_UNKNOWN",
  });
});

test("F3 B2b1 RED (M2): duplicateOf inexistente, duplicidade aceita e entidade repetida", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  const base = { producerOrder: 5, actor: "master", organizationId: F3 };
  assert.throws(() => book.seal({ ...base, requestId: uuid(1), duplicateOf: uuid(2) }), {
    code: "F3_INTENT_DUPLICATE_OF",
  });
  book.seal({ ...base, requestId: uuid(2) });
  assert.throws(() => book.seal({ ...base, requestId: uuid(3), duplicateOf: uuid(2) }), {
    code: "F3_INTENT_DUPLICATE_OF",
  });
  assert.deepEqual(book.confirm(uuid(2), { entityId: uuid(20), organizationId: F3 }), {
    duplicateAccepted: false,
  });
  assert.throws(
    () => book.seal({ ...base, producerOrder: 6, requestId: uuid(4), duplicateOf: uuid(2) }),
    { code: "F3_INTENT_DUPLICATE_OF" },
  );
  book.seal({ ...base, requestId: uuid(5), duplicateOf: uuid(2) });
  assert.deepEqual(book.confirm(uuid(5), { entityId: uuid(50), organizationId: F3 }), {
    duplicateAccepted: true,
  });
  book.seal({ ...base, requestId: uuid(6) });
  assert.throws(() => book.confirm(uuid(6), { entityId: uuid(20), organizationId: F3 }), {
    code: "F3_INTENT_ENTITY",
  });
  // Criação da organização só confirma com o próprio ID da organização F3.
  book.seal({ ...base, producerOrder: 2, requestId: uuid(7) });
  assert.throws(() => book.confirm(uuid(7), { entityId: uuid(70), organizationId: F3 }), {
    code: "F3_INTENT_ENTITY",
  });
});

test("F3 B2b1 RED: orçamento recusa a 31ª intenção da execução e o teto de 60", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  for (let i = 1; i <= 30; i++)
    book.seal({ requestId: uuid(i), producerOrder: 5, actor: "master", organizationId: F3 });
  assert.throws(
    () => book.seal({ requestId: uuid(31), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_BUDGET" },
  );
  for (const extra of [{ priorConfirmed: 31 }, { priorSent: -1 }, { priorSent: "0" }])
    assert.throws(
      () => sut.createF3IntentBook({ organizationF3: F3, ...extra }),
      (e) => ["F3_INTENT_OPTIONS", "F3_BUDGET"].includes(e.code),
    );
  const late = sut.createF3IntentBook({ organizationF3: F3, priorSent: 60 });
  assert.throws(
    () => late.seal({ requestId: uuid(1), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_BUDGET" },
  );
});

test("F3 B2b1 RED: mutação pelo 2º usuário e produtor sem mutação são recusados", () => {
  const book = sut.createF3IntentBook({ organizationF3: F3 });
  const toStringActor = { toString: () => "master" };
  for (const actor of ["leitor", "segundo", null, "MASTER", toStringActor])
    assert.throws(
      () => book.seal({ requestId: uuid(1), producerOrder: 5, actor, organizationId: F3 }),
      { code: "F3_SECOND_USER_MUTATION" },
    );
  for (const producerOrder of [1, 3, 21, 0, "5"])
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
  assert.equal(sut.classifyF3Access("V102", obs(null, false)), "ERROR");
  assert.equal(sut.classifyF3Access("V102", obs("negadoGate", false)), "ERROR");
  assert.equal(sut.classifyF3Access("V102", obs("aviso-negado", true)), "ERROR");
  assert.equal(sut.classifyF3Access("V101", obs("aviso-negado", false)), "ERROR");
  assert.equal(sut.classifyF3Access("V111", obs("negado", false)), "ERROR");
  assert.equal(sut.classifyF3Access("V117", obs("revisao-negada", true)), "ALLOW");
  assert.equal(sut.classifyF3Access("V117", obs("revisao-negada", false)), "ERROR");
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
    { code: "F3_ACCESS_OBSERVATION" },
  );
  for (const c of catalogue.cases)
    if (c.expected.leitor === "DENY") assert.ok(sut.F3_DENIAL_TOKENS[c.destination], c.destination);
});

test("F3 B2b1: relatório bloqueado também é válido e gravado com SHA256SUMS conferível", async () => {
  const { mkdtemp, readFile: rf, readdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const blocked = sut.blockedF3Report({ code: "F3_DRIVER_PENDING", catalogue, provenance: PROV });
  assert.equal(sut.validateF3Report(blocked, catalogue, NP), true);
  assert.equal(blocked.state, "BLOCKED");
  assert.equal(blocked.summary.BLOCKED, 138);
  assert.equal(sut.f3Gate(blocked, catalogue, NP), "FAIL");
  const early = sut.blockedF3Report({ code: "F3_CASES_HASH", catalogue: null, provenance: null });
  assert.equal(sut.validateF3Report(early, null, NP), true);
  assert.equal(early.cases.length, 0);
  const dir = await mkdtemp(join(tmpdir(), "f3-"));
  const casesRaw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  await sut.writeF3Artifacts(dir, blocked, catalogue, casesRaw, NP);
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
  const bad = { ...blocked, blockCode: "texto livre" };
  await assert.rejects(sut.writeF3Artifacts(dir, bad, catalogue, casesRaw, NP), {
    code: "F3_REPORT",
  });
  for (const code of ["", "a b", null, "X".repeat(81)])
    assert.throws(() => sut.blockedF3Report({ code, catalogue, provenance: PROV }), {
      code: "F3_REPORT",
    });
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

const LEDGER_RAW = await readFile(new URL(sut.F3_LEDGER_PATH, root), "utf8");
const ledgerWith = ({ runs = [], entries = [] }) =>
  JSON.stringify({ ...JSON.parse(LEDGER_RAW), runs, entries }, null, 2) + "\n";
const RUN = Object.freeze({ workflowRunId: PROV.workflowRunId, harnessSha: PROV.harnessSha });
const req = (n, outcome = "confirmed", extra = {}) => ({
  requestId: uuid(n),
  producerOrder: 5,
  duplicateOf: null,
  outcome,
  prior: false,
  entityId: outcome === "confirmed" ? uuid(1000 + n) : null,
  sends: extra.prior ? 0 : 1,
  ...extra,
});
const entry = (caseId, extra = {}) => ({
  caseId,
  status: "PASS",
  ...PROV,
  artifactId: "14076439209",
  sha256: "d".repeat(64),
  reviewId: "5900720754",
  ...extra,
});

test("F3 B2b1: ledger inicial vazio com SHA fixado, append-only e só PASS (regra C)", () => {
  assert.equal(createHash("sha256").update(LEDGER_RAW).digest("hex"), sut.F3_LEDGER_SHA256);
  const ledger = sut.validateF3Ledger(LEDGER_RAW, catalogue);
  assert.deepEqual([ledger.runs.length, ledger.entries.length], [0, 0]);
  const run1 = { ...RUN, sent: 2, requests: [req(1), req(2, "pending")] };
  const c0 = catalogue.cases[0].caseId,
    c1 = catalogue.cases[1].caseId;
  const one = ledgerWith({ runs: [run1], entries: [entry(c0)] });
  assert.equal(sut.validateF3LedgerExtension(LEDGER_RAW, one, catalogue), true);
  const two = ledgerWith({ runs: [run1], entries: [entry(c0), entry(c1)] });
  const pin = (raw) => createHash("sha256").update(raw).digest("hex");
  assert.equal(sut.validateF3LedgerExtension(one, two, catalogue, pin(one)), true);
  // O anterior precisa ser o ledger fixado.
  assert.throws(() => sut.validateF3LedgerExtension(one, two, catalogue), { code: "F3_LEDGER" });
  for (const bad of [
    { runs: [run1], entries: [entry(c1)] },
    { runs: [run1], entries: [entry(c0, { status: "FAIL" })] },
    { runs: [run1], entries: [entry(c0), entry(c0)] },
    { runs: [run1], entries: [entry("IFV1-F3-C9999")] },
    { runs: [run1], entries: [entry(c0, { artifactId: null })] },
    { runs: [run1], entries: [entry(c0, { email: "x@y.z" })] },
    { runs: [run1], entries: [entry(c0, { workflowRunId: "999" })] },
    { runs: [], entries: [entry(c0)] },
  ])
    assert.throws(() => sut.validateF3LedgerExtension(one, ledgerWith(bad), catalogue, pin(one)), {
      code: "F3_LEDGER",
    });
});

test("F3 B2b1 RED (I4): orçamento e requestId acumulados entre execuções pelo ledger", () => {
  const run1 = { ...RUN, sent: 2, requests: [req(1), req(2, "pending")] };
  const ledger = sut.validateF3Ledger(ledgerWith({ runs: [run1] }), catalogue);
  const prior = sut.f3PriorFromLedger(ledger);
  assert.equal(prior.priorSent, 2);
  const book = sut.createF3IntentBook({ organizationF3: F3, ...prior });
  // requestId de execução anterior nunca é reutilizado.
  assert.throws(
    () => book.seal({ requestId: uuid(1), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_INTENT_REPLAY" },
  );
  // Entidade anterior entra no inventário desta execução.
  assert.deepEqual(book.created(), [
    { id: uuid(1001), kind: "registro", organizationId: F3, requestId: uuid(1) },
  ]);
  // O incerto da execução anterior é reconciliado na recuperação, sem reenvio cego.
  assert.equal(book.state(uuid(2)), "uncertain");
  assert.throws(() => book.resend(uuid(2)), { code: "F3_UNCERTAIN_RESEND" });
  book.reconcile(uuid(2), { found: true, entityId: uuid(20), organizationId: F3 });
  assert.deepEqual(book.summary().requests, [
    { ...req(1), prior: true, sends: 0 },
    { ...req(2), prior: true, entityId: uuid(20), sends: 0 },
  ]);
  // O teto de 60 considera o acumulado: 40 anteriores + 20 desta execução esgotam o total.
  const tail = sut.createF3IntentBook({ organizationF3: F3, priorSent: 40 });
  for (let i = 10; i < 30; i++)
    tail.seal({ requestId: uuid(i), producerOrder: 5, actor: "master", organizationId: F3 });
  assert.throws(
    () => tail.seal({ requestId: uuid(99), producerOrder: 5, actor: "master", organizationId: F3 }),
    { code: "F3_BUDGET" },
  );
  // Três execuções de 30 envios (15 intenções cada, uma reenviada) estouram o teto de 60.
  const heavy = (k) => ({
    workflowRunId: String(k),
    harnessSha: PROV.harnessSha,
    sent: 30,
    requests: Array.from({ length: 15 }, (_, i) => req(100 * k + i, "confirmed", { sends: 2 })),
  });
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [heavy(1), heavy(2)] }), catalogue));
  assert.throws(
    () => sut.validateF3Ledger(ledgerWith({ runs: [heavy(1), heavy(2), heavy(3)] }), catalogue),
    { code: "F3_LEDGER" },
  );
  // requestId repetido entre execuções só como anterior reconciliado de um pendente.
  for (const runs of [
    [run1, { ...RUN, workflowRunId: "2", sent: 1, requests: [req(1)] }],
    [
      run1,
      { ...RUN, workflowRunId: "2", sent: 0, requests: [req(1, "confirmed", { prior: true })] },
    ],
    [run1, { ...RUN, workflowRunId: "2", sent: 0, requests: [req(2, "confirmed")] }],
    [{ ...RUN, sent: 31, requests: [] }],
  ])
    assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs }), catalogue), {
      code: "F3_LEDGER",
    });
  const ok = [
    run1,
    { ...RUN, workflowRunId: "2", sent: 0, requests: [req(2, "confirmed", { prior: true })] },
  ];
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: ok }), catalogue));
});

test("F3 B2b1 RED (A): envios do ledger batem com as intenções e o harness da entrada", () => {
  // Execuções com sent 0 e 30 intenções confirmadas cada não subcontam o orçamento.
  const zero = (k) => ({
    workflowRunId: String(k),
    harnessSha: PROV.harnessSha,
    sent: 0,
    requests: Array.from({ length: 30 }, (_, i) => req(100 * k + i)),
  });
  assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: [zero(1)] }), catalogue), {
    code: "F3_LEDGER",
  });
  const run = { ...RUN, sent: 1, requests: [req(1)] };
  for (const sent of [0, 3])
    assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: [{ ...run, sent }] }), catalogue), {
      code: "F3_LEDGER",
    });
  const c0 = catalogue.cases[0].caseId;
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [run], entries: [entry(c0)] }), catalogue));
  assert.throws(
    () =>
      sut.validateF3Ledger(
        ledgerWith({ runs: [run], entries: [entry(c0, { harnessSha: "c".repeat(40) })] }),
        catalogue,
      ),
    { code: "F3_LEDGER" },
  );
  // Entidade repetida entre execuções.
  const dupEntity = [
    { ...run, requests: [req(1)] },
    {
      ...RUN,
      workflowRunId: "2",
      sent: 1,
      requests: [req(2, "confirmed", { entityId: uuid(1001) })],
    },
  ];
  assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: dupEntity }), catalogue), {
    code: "F3_LEDGER",
  });
});

test("F3 B2b1 RED (B, D): o relatório traz todas as intenções anteriores, conferidas com o ledger", () => {
  // Ledger anterior com a criação da organização confirmada e um pré-requisito pendente.
  const orgReq = { ...req(2), producerOrder: 2, entityId: F3 };
  const run1 = { ...RUN, sent: 2, requests: [orgReq, req(777, "pending", { producerOrder: 18 })] };
  const prior = sut.f3PriorFromLedger(
    sut.validateF3Ledger(ledgerWith({ runs: [run1] }), catalogue),
  );
  // O livro mantém o pendente anterior no resumo, como pendente.
  const book = sut.createF3IntentBook({ organizationF3: F3, ...prior });
  const pend = book.summary().requests.find((q) => q.requestId === uuid(777));
  assert.deepEqual(pend, { ...req(777, "pending", { producerOrder: 18 }), prior: true, sends: 0 });
  assert.equal(book.summary().uncertain, 1);
  // Relatório desta execução: a organização vem do ledger (prior), o resto é novo.
  const withPrior = (keepPending) =>
    completeReport((r) => {
      const org = r.intents.requests.find((q) => q.producerOrder === 2);
      org.requestId = uuid(2);
      org.prior = true;
      org.entityId = F3;
      org.sends = 0;
      r.isolation.created.find((e) => e.kind === "organizacao").requestId = uuid(2);
      forProducer(r, 2, (c) => (c.requestId = uuid(2)));
      r.intents.priorSent = 2;
      r.intents.sent = 27;
      if (keepPending) {
        r.intents.requests.push({
          ...req(777, "pending", { producerOrder: 18 }),
          prior: true,
          sends: 0,
        });
        r.intents.uncertain = 1;
      }
    });
  const options = { policy: POLICY, prior };
  // Omitir o pendente anterior falha; incluí-lo valida e faz o gate falhar.
  assert.throws(() => sut.validateF3Report(withPrior(false), catalogue, options), {
    code: "F3_REPORT",
  });
  const kept = withPrior(true);
  assert.equal(sut.validateF3Report(kept, catalogue, options), true);
  assert.equal(sut.f3Gate(kept, catalogue, options), "FAIL");
  // Sem o ledger anterior, nenhuma intenção pode ser marcada anterior (D).
  assert.throws(() => valid(kept), { code: "F3_REPORT" });
  rejects(completeReport((r) => r.intents.requests.forEach((q) => (q.prior = true))));
  // priorSent divergente e desfecho anterior fechado reescrito falham.
  const bad1 = withPrior(true);
  bad1.intents.priorSent = 0;
  assert.throws(() => sut.validateF3Report(bad1, catalogue, options), { code: "F3_REPORT" });
  const bad2 = withPrior(true);
  bad2.intents.requests.find((q) => q.requestId === uuid(2)).entityId = uuid(3);
  assert.throws(
    () => sut.validateF3Report(bad2, catalogue, options),
    (e) => ["F3_REPORT", "F3_ISOLATION"].includes(e.code),
  );
});

test("F3 B2b1 RED (C): duplicidade reconciliável contra base de execução anterior", () => {
  // C1: base confirmada e tentativa pendente na execução 1; na 2, readback prova ausência.
  const base = req(1);
  const dup = req(2, "pending", { duplicateOf: uuid(1) });
  const run1 = { ...RUN, sent: 2, requests: [base, dup] };
  const prior1 = sut.f3PriorFromLedger(
    sut.validateF3Ledger(ledgerWith({ runs: [run1] }), catalogue),
  );
  const b1 = sut.createF3IntentBook({ organizationF3: F3, ...prior1 });
  b1.reconcile(uuid(2), { found: false, entityId: null, organizationId: null });
  const run2 = {
    ...RUN,
    workflowRunId: "2",
    sent: 0,
    requests: b1.summary().requests.filter((q) => q.requestId === uuid(2)),
  };
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [run1, run2] }), catalogue));
  // C2: base pendente na execução 1, encontrada na 2, serve de base para a duplicidade.
  const run1b = { ...RUN, sent: 1, requests: [req(3, "pending")] };
  const prior2 = sut.f3PriorFromLedger(
    sut.validateF3Ledger(ledgerWith({ runs: [run1b] }), catalogue),
  );
  const b2 = sut.createF3IntentBook({ organizationF3: F3, ...prior2 });
  b2.reconcile(uuid(3), { found: true, entityId: uuid(30), organizationId: F3 });
  b2.seal({
    requestId: uuid(4),
    producerOrder: 5,
    actor: "master",
    organizationId: F3,
    duplicateOf: uuid(3),
  });
  b2.rejected(uuid(4));
  const s2 = b2.summary();
  assert.deepEqual(
    s2.requests.map((q) => [q.requestId, q.outcome, q.prior]),
    [
      [uuid(3), "confirmed", true],
      [uuid(4), "rejected", false],
    ],
  );
  const run2b = { ...RUN, workflowRunId: "2", sent: s2.sent, requests: s2.requests };
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [run1b, run2b] }), catalogue));
  // Base anterior rejeitada ou de outro produtor continua recusada.
  const run1c = {
    ...RUN,
    sent: 2,
    requests: [req(5, "rejected"), req(6, "confirmed", { producerOrder: 6 })],
  };
  const b3 = sut.createF3IntentBook({
    organizationF3: F3,
    ...sut.f3PriorFromLedger(sut.validateF3Ledger(ledgerWith({ runs: [run1c] }), catalogue)),
  });
  for (const duplicateOf of [uuid(5), uuid(6)])
    assert.throws(
      () =>
        b3.seal({
          requestId: uuid(7),
          producerOrder: 5,
          actor: "master",
          organizationId: F3,
          duplicateOf,
        }),
      { code: "F3_INTENT_DUPLICATE_OF" },
    );
});

test("F3 B2b1 RED (E): getter não grava no arquivo valor diferente do validado", async () => {
  const { mkdtemp, readFile: rf } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const casesRaw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  const leak = "fulano@exemplo.com.br";
  for (const firstLeaks of [true, false]) {
    const report = completeReport();
    const ids = report.cases[40].entityIds;
    const good = ids[0];
    let calls = 0;
    Object.defineProperty(ids, 0, {
      enumerable: true,
      get: () => ((calls++ === 0) === firstLeaks ? leak : good),
    });
    const dir = await mkdtemp(join(tmpdir(), "f3-e-"));
    const wrote = await sut
      .writeF3Artifacts(dir, report, catalogue, casesRaw, OPT)
      .catch(() => false);
    if (wrote) assert.equal((await rf(join(dir, "F3_REPORT.json"), "utf8")).includes(leak), false);
    else assert.equal(firstLeaks, true);
  }
});

test("F3 B2b1 RED (I3): preservação exige o mesmo harness ou equivalência revisada", () => {
  const c0 = catalogue.cases[0].caseId,
    c1 = catalogue.cases[1].caseId;
  const ledger = sut.validateF3Ledger(
    ledgerWith({ runs: [{ ...RUN, sent: 0, requests: [] }], entries: [entry(c0), entry(c1)] }),
    catalogue,
  );
  assert.deepEqual(sut.preservedF3Cases(ledger, PROV), [c0, c1]);
  const novo = { ...PROV, harnessSha: "e".repeat(40) };
  assert.deepEqual(sut.preservedF3Cases(ledger, novo), []);
  assert.deepEqual(
    sut.preservedF3Cases(ledger, novo, [
      { from: PROV.harnessSha, to: novo.harnessSha, reviewId: "1" },
    ]),
    [c0, c1],
  );
  assert.deepEqual(
    sut.preservedF3Cases(ledger, novo, [{ from: PROV.harnessSha, to: novo.harnessSha }]),
    [],
  );
  assert.deepEqual(sut.preservedF3Cases(ledger, { ...PROV, frontendSha: "f".repeat(40) }), []);
  assert.deepEqual([...sut.F3_HARNESS_EQUIVALENCES], []);
});

test("F3 B2b1: contrato do YAML aceita o real e recusa adulterações (controle negativo)", async () => {
  const yaml = await readFile(new URL("../../" + sut.F3_WORKFLOW_PATH, import.meta.url), "utf8");
  assert.equal(sut.assertF3WorkflowContract(yaml), true);
  assert.equal(sut.assertF3WorkflowStructure(yaml), true);
  const swap = (a, b) => {
    assert.ok(yaml.includes(a), a);
    return yaml.replace(a, b);
  };
  const guardStep = "      - name: Barreira nativa no mesmo HEAD antes de secrets\n";
  const privateHeader = "    environment: hml\n    timeout-minutes: 80\n";
  const tampered = [
    swap(
      "        if: steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n        env:\n          CONTAOS_HML_SYNTHETIC_EMAIL",
      "        if: steps.revalidate.outputs.scope == 'TRILHA_A'\n        env:\n          CONTAOS_HML_SYNTHETIC_EMAIL",
    ),
    swap(
      "      CONTAOS_FRONTEND_SOURCE: ${{ github.workspace }}/frontend-source\n",
      "      CONTAOS_FRONTEND_SOURCE: ${{ github.workspace }}/frontend-source\n      CONTAOS_HML_SYNTHETIC_2_EMAIL: ${{ secrets.CONTAOS_HML_SYNTHETIC_2_EMAIL }}\n",
    ),
    swap(
      "        run: node scripts/hml/prepare-visual-fixtures.mjs --prepare-fixtures\n",
      "          CONTAOS_HML_SYNTHETIC_2_PASSWORD: ${{ secrets.CONTAOS_HML_SYNTHETIC_2_PASSWORD }}\n        run: node scripts/hml/prepare-visual-fixtures.mjs --prepare-fixtures\n",
    ),
    swap(
      "        id: revalidate\n        if: github.event_name == 'workflow_run'\n",
      "        id: revalidate\n",
    ),
    swap("        id: revalidate\n", ""),
    (() => {
      const start = yaml.indexOf(guardStep),
        end = yaml.indexOf("      - name: Preparacao e SSR", start);
      const block = yaml.slice(start, end),
        rest = yaml.slice(0, start) + yaml.slice(end);
      const at = rest.indexOf("      - name: Verificar hashes da Fase 3");
      return rest.slice(0, at) + block + rest.slice(at);
    })(),
    swap("      - scripts/hml/integracao-v1-fase3.test.mjs\n", ""),
    swap(" scripts/hml/integracao-v1-fase3.test.mjs\n      - name: Lint", "\n      - name: Lint"),
    // Hash da Fase 3 sem always() e evidência sem o gate de escopo.
    swap(
      "        if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n        working-directory: artifacts/integracao-v1-fase3\n",
      "        working-directory: artifacts/integracao-v1-fase3\n",
    ),
    swap(
      "        if: always() && steps.revalidate.outputs.scope == 'INTEGRACAO_V1_FASE3_REL'\n        uses: actions/upload-artifact@v4\n",
      "        if: always()\n        uses: actions/upload-artifact@v4\n",
    ),
    // Permissão do topo, permissão do job private, environment e gatilho novo.
    swap("permissions:\n  contents: read\njobs:", "permissions:\n  contents: write\njobs:"),
    swap(
      "    needs: request\n    permissions:\n      contents: read\n",
      "    needs: request\n    permissions:\n      contents: write\n",
    ),
    swap("    environment: hml\n", "    environment: prod\n"),
    swap(
      "  workflow_dispatch:\n    inputs:",
      "  push:\n    branches: [main]\n  workflow_dispatch:\n    inputs:",
    ),
    // Expressões que vazam secrets ou forjam o escopo.
    swap(
      privateHeader,
      privateHeader.replace(
        "    timeout",
        "    env:\n      ALL: ${{ toJSON(secrets) }}\n    timeout",
      ),
    ),
    swap(
      "run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate\n      - name: Somente agora fornecer o par",
      "run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate || echo scope=INTEGRACAO_V1_FASE3_REL >> $GITHUB_OUTPUT\n      - name: Somente agora fornecer o par",
    ),
    swap(
      "        id: revalidate\n        if: github.event_name == 'workflow_run'\n",
      "        id: revalidate\n        if: github.event_name == 'workflow_run'\n        continue-on-error: true\n",
    ),
    swap(
      "          CONTAOS_HML_SYNTHETIC_2_EMAIL: ${{ secrets.CONTAOS_HML_SYNTHETIC_2_EMAIL }}\n",
      "          CONTAOS_HML_SYNTHETIC_2_EMAIL: ${{ secrets['CONTAOS_HML_SYNTHETIC_2_EMAIL'] }}\n",
    ),
    yaml + "\n# CONTAOS_HML_SYNTHETIC_2_EMAIL\n",
    swap("    timeout-minutes: 80\n", "    timeout-minutes: 600\n"),
    swap(
      "          CONTAOS_ACTIONS_READ_TOKEN: ${{ github.token }}\n        run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate\n      - name: Somente agora fornecer o par",
      "          CONTAOS_ACTIONS_READ_TOKEN: ${{ github.token }}\n          X: ${{ vars.CONTAOS_X }}\n        run: node scripts/hml/authenticated-visual-audit.mjs --request-revalidate\n      - name: Somente agora fornecer o par",
    ),
    // Só o SHA pega a remoção do passo do bun no job private.
    swap(
      "      - run: |\n          node --test scripts/ci/install-pinned-bun.test.mjs\n          node scripts/ci/install-pinned-bun.mjs\n      - name: Dependencias congeladas do executor",
      "      - name: Dependencias congeladas do executor",
    ),
  ];
  for (const [i, bad] of tampered.entries()) {
    assert.notEqual(bad, yaml, "adulteração " + i);
    assert.throws(
      () => sut.assertF3WorkflowContract(bad),
      { code: "F3_WORKFLOW" },
      "adulteração " + i,
    );
    if (i !== tampered.length - 1)
      assert.throws(
        () => sut.assertF3WorkflowStructure(bad),
        { code: "F3_WORKFLOW" },
        "estrutura " + i,
      );
  }
  assert.equal(tampered.length, 22);
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

test("F3 B2b1 RED (M4): executor só lê chaves de proveniência e não grava valor de secret", async () => {
  const { mkdtemp, readFile: rf, cp, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  // Cópia isolada do executor e do que ele lê, para o relatório bloqueado ir a um diretório temporário.
  const dir = await mkdtemp(join(tmpdir(), "f3-env-"));
  const repo = new URL("../../", import.meta.url);
  for (const rel of [
    "scripts/hml/integracao-v1-fase3.mjs",
    "scripts/hml/authenticated-visual-audit.mjs",
    sut.F3_MATRIX.path,
    sut.F3_CASES_PATH,
    sut.F3_LEDGER_PATH,
    sut.F3_WORKFLOW_PATH,
    "package.json",
  ]) {
    await mkdir(join(dir, rel, ".."), { recursive: true });
    await cp(new URL(rel, repo), join(dir, rel));
  }
  await cp(new URL("node_modules", repo), join(dir, "node_modules"), {
    recursive: true,
    dereference: false,
    verbatimSymlinks: true,
  }).catch(async () => {
    const { symlink } = await import("node:fs/promises");
    await symlink(new URL("node_modules", repo).pathname, join(dir, "node_modules"));
  });
  const copy = await import(join(dir, "scripts/hml/integracao-v1-fase3.mjs"));
  const secret = "valor-secreto-do-segundo-usuario-0001";
  const read = new Set();
  const base = {
    GITHUB_EVENT_NAME: "workflow_run",
    CONTAOS_FRONTEND_SHA: SHA,
    CONTAOS_HARNESS_SHA: SHA,
    CONTAOS_DEPLOYMENT_ID: "dpl_ABCDEFGH1234",
    GITHUB_RUN_ID: "1",
    CONTAOS_HML_SYNTHETIC_EMAIL: secret,
    CONTAOS_HML_SYNTHETIC_PASSWORD: secret,
    CONTAOS_HML_SYNTHETIC_2_EMAIL: secret,
    CONTAOS_HML_SYNTHETIC_2_PASSWORD: secret,
  };
  const env = new Proxy(base, {
    get(target, key) {
      read.add(String(key));
      return target[key];
    },
    ownKeys(target) {
      read.add("*ownKeys");
      return Reflect.ownKeys(target);
    },
  });
  await assert.rejects(copy.runCli(["--run-f3"], env));
  assert.deepEqual([...read].sort(), [
    "CONTAOS_DEPLOYMENT_ID",
    "CONTAOS_FRONTEND_SHA",
    "CONTAOS_HARNESS_SHA",
    "GITHUB_EVENT_NAME",
    "GITHUB_RUN_ID",
  ]);
  const report = await rf(join(dir, sut.F3_ARTIFACT_DIR, "F3_REPORT.json"), "utf8");
  assert.equal(report.includes(secret), false);
  assert.equal(JSON.parse(report).state, "BLOCKED");
});

test("F3 B2b1 RED (M4): imports só de node:* e do auditor, sem require nem import dinâmico", async () => {
  const source = await readFile(new URL("./integracao-v1-fase3.mjs", import.meta.url), "utf8");
  const specifiers = [
    ...source.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+["']([^"']+)["']/gms),
  ].map((m) => m[1]);
  assert.ok(specifiers.length >= 5);
  for (const s of specifiers)
    assert.ok(s.startsWith("node:") || s === "./authenticated-visual-audit.mjs", s);
  for (const forbidden of [
    /\brequire\s*\(/,
    /createRequire/,
    /\bimport\s*\(/,
    /\beval\s*\(/,
    /new Function/,
  ])
    assert.equal(forbidden.test(source), false, String(forbidden));
  // Nenhum acesso direto ao ambiente além do parâmetro padrão de runCli.
  assert.equal(source.split("process.env").length - 1, 1);
});

test("F3 B2b1 RED (I-A): pendente reaberto e rejeitado conta como envio no ledger e no relatório", () => {
  const run1 = { ...RUN, sent: 1, requests: [req(1, "pending")] };
  const reopen = (sends, sent) => ({
    ...RUN,
    workflowRunId: "2",
    sent,
    requests: [req(1, "rejected", { prior: true, sends })],
  });
  assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: [run1, reopen(0, 0)] }), catalogue), {
    code: "F3_LEDGER",
  });
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [run1, reopen(1, 1)] }), catalogue));
  // Em escala: 30 pendentes, 30 reabertos e rejeitados e mais 30 novos passam do teto de 60.
  const many = (k, outcome, extra) =>
    Array.from({ length: 30 }, (_, i) => req(1000 + i, outcome, extra)).map((q, i) =>
      k === 3 ? { ...q, requestId: uuid(5000 + i), entityId: uuid(6000 + i) } : q,
    );
  const r1 = { ...RUN, sent: 30, requests: many(1, "pending") };
  const r2 = {
    ...RUN,
    workflowRunId: "2",
    sent: 30,
    requests: many(2, "rejected", { prior: true, sends: 1 }),
  };
  const r3 = { ...RUN, workflowRunId: "3", sent: 30, requests: many(3, "confirmed") };
  assert.ok(sut.validateF3Ledger(ledgerWith({ runs: [r1, r2] }), catalogue));
  assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: [r1, r2, r3] }), catalogue), {
    code: "F3_LEDGER",
  });
  // O livro registra o reenvio do pendente anterior.
  const prior = sut.f3PriorFromLedger(
    sut.validateF3Ledger(ledgerWith({ runs: [run1] }), catalogue),
  );
  const book = sut.createF3IntentBook({ organizationF3: F3, ...prior });
  book.reconcile(uuid(1), { found: false, entityId: null, organizationId: null });
  book.resend(uuid(1));
  book.rejected(uuid(1));
  const s = book.summary();
  assert.equal(s.sent, 1);
  assert.deepEqual(s.requests, [req(1, "rejected", { prior: true, sends: 1 })]);
  // Relatório: envios declarados precisam ser a soma exata dos envios por intenção.
  rejects(completeReport((r) => (r.intents.sent = 27)));
  rejects(completeReport((r) => (r.intents.sent = 29)));
  rejects(completeReport((r) => (r.intents.requests[0].sends = 0)));
});

test("F3 B2b1 RED (M-1, M-2, M-3): prior obrigatório, getter em índice e organização anterior", () => {
  // M-1: sem prior explícito, o validador e o gate recusam.
  assert.throws(() => sut.validateF3Report(completeReport(), catalogue, { policy: POLICY }), {
    code: "F3_REPORT",
  });
  assert.throws(() => sut.f3Gate(completeReport(), catalogue, { policy: POLICY }), {
    code: "F3_REPORT",
  });
  assert.throws(
    () =>
      sut.validateF3Report(completeReport(), catalogue, {
        policy: POLICY,
        prior: { priorSent: 0 },
      }),
    { code: "F3_REPORT" },
  );
  // M-2: getter em índice de array do objeto vivo é recusado; o gate decide sobre uma cópia.
  const live = completeReport();
  const ids = live.cases[40].entityIds,
    good = ids[0];
  Object.defineProperty(ids, 0, { enumerable: true, get: () => good });
  rejects(live);
  const holes = completeReport();
  holes.cases[40].entityIds = new Array(1);
  rejects(holes);
  const extra = completeReport();
  extra.intents.requests.note = "x";
  rejects(extra);
  // M-3: organização anterior confirmada com ID diferente da organização F3.
  const orgReq = { ...req(2), producerOrder: 2, prior: true, sends: 0 };
  assert.throws(
    () => sut.createF3IntentBook({ organizationF3: F3, priorSent: 1, priorRequests: [orgReq] }),
    { code: "F3_INTENT_PRIOR" },
  );
  assert.ok(
    sut.createF3IntentBook({
      organizationF3: F3,
      priorSent: 1,
      priorRequests: [{ ...orgReq, entityId: F3 }],
    }),
  );
});

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
  // PLAN §12.2 (emenda 1): 40 por execução, 39 previstas, 60 na fase.
  assert.deepEqual({ ...sut.F3_BUDGET }, { total: 60, perRun: 40, planned: 39, minutes: 45 });
  assert.ok(sut.assertF3Budget({ priorSent: 0, newIntents: 40 }));
  assert.ok(sut.assertF3Budget({ priorSent: 20, newIntents: 40 }));
  for (const bad of [
    { priorSent: 0, newIntents: 41 },
    { priorSent: 21, newIntents: 40 },
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
// BUILD-2b-1: infraestrutura offline. Relatórios de teste montados pelo próprio livro; os
// validadores reexecutam os eventos na mesma máquina de estados, sobre âncoras emitidas pelo
// módulo (catálogo de buildF3Cases e ledger de validateF3Ledger).
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
// Entidade principal de cada produtor no livro de referência. Os de atualização (PLAN §12.5;
// levantamento, seção 3) confirmam a entidade do inventário que atualizam: V103 o contratante,
// V106 o contrato, V108 a versão da proposta e V107 a versão da fonte.
const PRE = Object.freeze({ proposta: uuid(3091), versaoProposta: uuid(3092), fonte: uuid(3101) });
const PRE_VERSAO_FONTE = uuid(3102);
const entity = (o) =>
  ({ 2: F3, 6: uuid(105), 8: uuid(107), 9: PRE.versaoProposta, 10: PRE_VERSAO_FONTE })[o] ??
  uuid(100 + o);
const LEDGER_RAW = await readFile(new URL(sut.F3_LEDGER_PATH, root), "utf8");
const EMPTY = sut.validateF3Ledger(LEDGER_RAW, catalogue);
const ledgerWith = ({ runs = [], entries = [] }) =>
  JSON.stringify({ ...JSON.parse(LEDGER_RAW), runs, entries }, null, 2) + "\n";
const ledgerOf = (runs, entries = []) =>
  sut.validateF3Ledger(ledgerWith({ runs, entries }), catalogue);
const run = (k, book, harnessSha = PROV.harnessSha) => ({
  workflowRunId: String(k),
  frontendSha: PROV.frontendSha,
  harnessSha,
  deploymentId: PROV.deploymentId,
  artifactId: "14076439209",
  sha256: "d".repeat(64),
  reviewId: "5900720754",
  events: book.summary().events,
});
// Envio como a cerca faz (PLAN §12.5): selo, vínculo (bind) de cada passo com valores de origem
// válida tirados do inventário do livro, e confirmação com os papéis declarados no fluxo.
const FLOWS = sut.F3_MUTATION_FLOWS;
let freshN = 500000;
const fresh = () => uuid(++freshN);
const BINDS = new Map();
const USER = new WeakMap();
const ISO = ["organizacao", "registro"];
const prereqAction = (o) => {
  const keys = Object.values(FLOWS).filter((f) => f.order === o && f.kind === "prerequisito");
  return keys.length === 1 ? keys[0].action : null;
};
function bindsFor(book, key, from = 0) {
  const f = FLOWS[key];
  if (!f) return [];
  const slots = {};
  const created = book.created();
  const pick = (spec) => {
    for (const s of spec.from) {
      const [k, role = "principal"] = s.split("/");
      const c = [...created]
        .reverse()
        .find((x) => x.flow === k && x.role === role && ISO.includes(x.kind));
      if (c) return c.id;
    }
    return null;
  };
  const out = [];
  for (const [j, s] of f.steps.slice(from).entries()) {
    const values = [];
    for (const [position, spec] of Object.entries(s.fields)) {
      if (position.endsWith("[]")) continue;
      let value;
      if (spec.origin === "gerado_ui") value = fresh();
      else if (spec.origin === "capturado") value = slots[spec.slot] ??= fresh();
      else if (spec.origin === "inventario") value = pick(spec);
      else if (spec.origin === "derivado") value = fresh();
      else value = USER.get(book) ?? null;
      // Inventário ausente: o vínculo não sai (o teste que o pede monta o inventário).
      if (value === null) return out;
      values.push({ position, value });
    }
    const step = from + j;
    out.push({
      step,
      bodySha256:
        s.target === "storage"
          ? null
          : createHash("sha256")
              .update(key + step + freshN)
              .digest("hex"),
      values,
    });
  }
  return out;
}
const bindAll = (book, requestId, key, resendFrom = null) => {
  const binds =
    resendFrom === null
      ? bindsFor(book, key)
      : BINDS.get(requestId).filter((b) => b.step >= resendFrom);
  if (resendFrom === null) BINDS.set(requestId, binds);
  for (const b of binds) book.bind(requestId, b);
  const u = binds.flatMap((b) => b.values).find((v) => v.position === "p_id_usuario");
  if (key === "4:principal" && u && !USER.has(book)) USER.set(book, u.value);
};
const seal = (book, n, producerOrder, extra = {}) => {
  const kind = extra.kind ?? "principal";
  const action =
    extra.action ?? (kind === "prerequisito" ? prereqAction(producerOrder) : "principal");
  const requestId = extra.requestId ?? uuid(n);
  book.seal({
    requestId,
    producerOrder,
    actor: "master",
    organizationId: book.organizationF3(),
    ...extra,
    ...(action === null ? {} : { action }),
  });
  bindAll(book, requestId, producerOrder + ":" + action);
};
/** Reenvio pelo 1º início declarado do fluxo, com os mesmos vínculos do envio original. */
const resendId = (book, requestId) => {
  const q = book.summary().requests.find((x) => x.requestId === requestId);
  const key = q.producerOrder + ":" + q.action;
  const from = FLOWS[key].resend?.[0] ?? 0;
  book.resend(requestId, { step: from });
  bindAll(book, requestId, key, from);
};
/** Reenvio pelo livro com os mesmos vínculos do envio original (origem vinculado). */
const resendSame = (book, n, from = 0) => {
  const q = book.summary().requests.find((x) => x.requestId === uuid(n));
  book.resend(uuid(n), { step: from });
  bindAll(book, uuid(n), q.producerOrder + ":" + q.action, from);
};
/** Confirmação com os papéis do fluxo; o arquivo é o capturado no envio. */
const related = (requestId, key) =>
  (FLOWS[key]?.creates ?? []).map((role) => {
    const v = (BINDS.get(requestId) ?? [])
      .flatMap((b) => b.values)
      .find((x) => role === "arquivo" && /arquivo/.test(x.position));
    return { role, entityId: v ? v.value : fresh() };
  });
const ok = (book, n, entityId, organizationId = F3) => {
  const q = book.summary().requests.find((x) => x.requestId === uuid(n));
  return book.confirm(uuid(n), {
    entityId,
    organizationId,
    related: related(uuid(n), q.producerOrder + ":" + q.action),
  });
};
const dup = (book, n, o, base) => seal(book, n, o, { kind: "duplicidade", duplicateOf: base });
const createOrg = (book) => {
  seal(book, 2, 2);
  book.confirm(uuid(2), { entityId: F3, organizationId: F3 });
};
/** Pré-requisitos de que o inventário dos produtores depende (levantamento, seção 3). */
const PREREQS = Object.freeze({
  9: [
    [3091, "proposta", PRE.proposta],
    [3092, "versao", PRE.versaoProposta],
  ],
  10: [
    [3101, "fonte", PRE.fonte],
    [3102, "versao", PRE_VERSAO_FONTE],
  ],
  20: [[3201, "relatorio", uuid(3201)]],
});
const prereqs = (book, o) => {
  for (const [n, action, id] of PREREQS[o] ?? []) {
    seal(book, n, o, { kind: "prerequisito", action });
    ok(book, n, id);
  }
};

/**
 * Execução de referência: organização F3, os pré-requisitos de que o inventário depende, uma
 * principal por produtor e duplicidade em 4–13.
 */
function referenceBook(ledger = EMPTY, extra = () => {}, skip = []) {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger });
  createOrg(book);
  for (const o of MUT.filter((x) => x !== 2)) {
    prereqs(book, o);
    seal(book, o, o);
    if (skip.includes(o)) continue;
    ok(book, o, entity(o));
    if (REJ(o)) {
      dup(book, 200 + o, o, uuid(o));
      book.rejected(uuid(200 + o));
    }
  }
  extra(book);
  return book;
}

/** Inventário mínimo: organização, contratante (V102), contrato (V105) e competência (V113). */
function chainBook(ledger = EMPTY) {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger });
  createOrg(book);
  for (const o of [5, 7, 14]) {
    seal(book, o, o);
    ok(book, o, entity(o));
  }
  return book;
}

function completeReport(edit = () => {}, { book = referenceBook(), ledger = EMPTY } = {}) {
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
    ledgerSha256: sut.f3LedgerState(ledger).sha256,
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
    intents: book.summary(),
    isolation: {
      organizationF3: book.organizationF3(),
      created: book.created(),
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
const OPT = Object.freeze({ policy: POLICY, ledger: EMPTY });
const NP = Object.freeze({ ledger: EMPTY });
const valid = (r, o = OPT) => sut.validateF3Report(r, catalogue, o);
const criteria = (r, o = OPT) => sut.f3GateCriteria(r, catalogue, o);
const rejects = (r, codes = ["F3_REPORT"], o = OPT) =>
  assert.throws(
    () => valid(r, o),
    (e) => codes.includes(e.code),
  );
const forProducer = (r, o, fn) => r.cases.filter((c) => c.producerOrder === o).forEach(fn);

test("F3 B2b1: relatório completo montado pelo livro valida e cumpre todos os critérios", () => {
  const report = completeReport();
  assert.equal(valid(report), true);
  assert.deepEqual(criteria(report), []);
  assert.deepEqual(report.summary, { PASS: 138, FAIL: 0, BLOCKED: 0, N_A_JUSTIFICADO: 0 });
  assert.deepEqual(
    [report.intents.sent, report.intents.confirmed, report.intents.rejected],
    // 1 organização, 16 produtores e ADM01, 5 pré-requisitos do inventário e 10 duplicidades.
    [33, 23, 10],
  );
  assert.equal(report.ledgerSha256, sut.F3_LEDGER_SHA256);
  // O gate de produção usa a política de produção (null nos mutantes): nunca PASS no 2b-1.
  assert.throws(() => sut.f3Gate(report, catalogue, NP), { code: "F3_REPORT" });
  assert.throws(() => sut.f3Gate(report, catalogue, OPT), { code: "F3_REPORT" });
});

test("F3 B2b1 RED: âncoras do módulo, catálogo e ledger escolhidos por quem chama falham", () => {
  // Catálogo que não veio de buildF3Cases, mesmo idêntico em JSON.
  const forged = JSON.parse(JSON.stringify(catalogue));
  assert.throws(() => sut.validateF3Report(completeReport(), forged, OPT), { code: "F3_REPORT" });
  assert.throws(() => sut.blockedF3Report({ code: "X", catalogue: forged, provenance: PROV }), {
    code: "F3_REPORT",
  });
  // Ledger diferente do declarado no relatório.
  const other = ledgerOf([run(1, referenceBook())]);
  assert.throws(
    () => sut.validateF3Report(completeReport(), catalogue, { ...OPT, ledger: other }),
    {
      code: "F3_REPORT",
    },
  );
  assert.throws(
    () =>
      sut.validateF3Report(
        completeReport((r) => (r.ledgerSha256 = "f".repeat(64))),
        catalogue,
        OPT,
      ),
    { code: "F3_REPORT" },
  );
  // emptyF3Ledger não é o ledger fixado: relatório sobre ele não passa no gate.
  const loose = sut.emptyF3Ledger();
  const onLoose = completeReport(() => {}, { ledger: loose });
  assert.equal(valid(onLoose, { policy: POLICY, ledger: loose }), true);
  assert.notEqual(onLoose.ledgerSha256, sut.F3_LEDGER_SHA256);
  // f3Gate não aceita política nem outra opção de quem chama.
  assert.throws(() => sut.f3Gate(completeReport(), catalogue, { ledger: EMPTY, policy: POLICY }), {
    code: "F3_REPORT",
  });
  // Livro e validador só aceitam ledger validado.
  for (const ledger of [undefined, null, {}, JSON.parse(LEDGER_RAW), { ...EMPTY }])
    assert.throws(() => sut.createF3IntentBook({ provenance: PROV, ledger }), {
      code: "F3_LEDGER_REQUIRED",
    });
  assert.throws(() => sut.validateF3Report(completeReport(), catalogue, { policy: POLICY }), {
    code: "F3_LEDGER_REQUIRED",
  });
  assert.ok(
    Object.isFrozen(EMPTY) && Object.isFrozen(catalogue) && Object.isFrozen(catalogue.cases[0]),
  );
});

test("F3 B2b1 RED: só árvore JSON pura, folhas com toJSON ou objeto no lugar de valor falham", () => {
  const tricks = [
    (r) =>
      r.cases
        .filter((c) => c.origin === "ADM01")
        .forEach((c) => (c.origin = { toJSON: () => "ADM01" })),
    (r) =>
      (r.cases[100].producerOrder = {
        toJSON: () => r.cases[100].producerOrder,
        toString: () => "1",
      }),
    (r) => (r.cases[0].caseId = new String(r.cases[0].caseId)),
    (r) => (r.globals.pageErrors = Number.NaN),
    (r) => (r.globals.secondProfile = Symbol("leitor")),
    (r) => (r.toJSON = () => completeReport()),
    (r) => (r.cases[40].entityIds = new Array(1)),
    (r) => {
      let calls = 0;
      Object.defineProperty(r.globals, "pageErrors", {
        enumerable: true,
        get: () => (calls++ ? 7 : 0),
      });
    },
    (r) => (r.cases[1].expected = Object.assign(Object.create({ x: 1 }), r.cases[1].expected)),
  ];
  for (const trick of tricks) {
    const report = completeReport(trick);
    assert.throws(() => valid(report), { code: "F3_REPORT" });
    assert.throws(() => criteria(report), { code: "F3_REPORT" });
  }
  assert.throws(() => sut.assertJsonTree(new Proxy({}, {}), "X"), { code: "X" });
  assert.equal(sut.assertJsonTree({ a: [1, "b", null, true, { c: 0 }] }, "X"), undefined);
});

test("F3 B2b1: a organização F3 nasce na execução; rejeitada ou abandonada libera nova tentativa", () => {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  assert.equal(book.organizationF3(), null);
  assert.throws(() => seal(book, 5, 5, { organizationId: F3 }), { code: "F3_FOREIGN_ORG" });
  assert.throws(() => seal(book, 5, 5), { code: "F3_FOREIGN_ORG" });
  assert.throws(() => seal(book, 5, 18, { kind: "prerequisito" }), { code: "F3_INTENT_PRODUCER" });
  // Produtor sem ação de pré-requisito declarada no levantamento não tem fluxo.
  assert.throws(() => seal(book, 5, 5, { kind: "prerequisito", action: "x" }), {
    code: "F3_FLOW_UNDEFINED",
  });
  seal(book, 2, 2);
  // Violação de protocolo do driver é recusada sem mudar o estado.
  assert.throws(() => book.confirm(uuid(2), { entityId: F3, organizationId: uuid(9) }), {
    code: "F3_INTENT_ENTITY",
  });
  assert.equal(book.state(uuid(2)), "sealed");
  // A e87f7e68 devolvida como organização criada é fato observado: inventariada fora da F3.
  const wrong = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  seal(wrong, 2, 2);
  wrong.confirm(uuid(2), { entityId: sut.F3_E87_ORG, organizationId: sut.F3_E87_ORG });
  assert.equal(wrong.organizationF3(), null);
  assert.equal(wrong.created()[0].kind, "fora_da_f3");
  book.confirm(uuid(2), { entityId: F3, organizationId: F3 });
  assert.equal(book.organizationF3(), F3);
  assert.throws(() => seal(book, 3, 2, { organizationId: F3 }), { code: "F3_INTENT_PRODUCER" });
  // Rejeitada libera; pendente bloqueia; abandonada depois de ausência comprovada libera.
  const retry = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  seal(retry, 40, 2);
  retry.rejected(uuid(40));
  seal(retry, 41, 2);
  retry.uncertain(uuid(41));
  assert.throws(() => seal(retry, 42, 2), { code: "F3_INTENT_PRODUCER" });
  assert.throws(() => retry.abandon(uuid(41)), { code: "F3_INTENT_STATE" });
  retry.reconcile(uuid(41), { found: false, entityId: null, organizationId: null });
  // SYS04 é sem chave (levantamento, seção 3): nunca reenviado, só relido e abandonado.
  assert.throws(() => retry.resend(uuid(41)), { code: "F3_UNCERTAIN_RESEND" });
  retry.abandon(uuid(41));
  seal(retry, 42, 2);
  retry.confirm(uuid(42), { entityId: F3, organizationId: F3 });
  // Materialização tardia da abandonada: outra organização, inventariada fora da F3.
  retry.reconcile(uuid(41), { found: true, entityId: uuid(410), organizationId: uuid(410) });
  assert.deepEqual(
    retry.created().map((c) => [c.kind, c.organizationId]),
    [
      ["organizacao", F3],
      ["organizacao_duplicada", uuid(410)],
    ],
  );
  // Duplicidade aceita da organização também é outra organização.
  const accepted = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(accepted);
  dup(accepted, 6, 2, uuid(2));
  assert.deepEqual(accepted.confirm(uuid(6), { entityId: uuid(60), organizationId: uuid(60) }), {
    duplicateAccepted: true,
  });
  assert.equal(accepted.created()[1].kind, "organizacao_duplicada");
});

test("F3 B2b1 RED: tipos de intenção, uma principal por produtor, 11 pré-requisitos e 1 duplicidade", () => {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(book);
  seal(book, 5, 5);
  assert.throws(() => seal(book, 6, 5), { code: "F3_INTENT_PRODUCER" });
  book.confirm(uuid(5), { entityId: entity(5), organizationId: F3 });
  assert.throws(() => seal(book, 6, 5), { code: "F3_INTENT_PRODUCER" });
  // PLAN §12.1: até 11 pré-requisitos na fase, contados pelo selo (rejeitado também conta), e
  // uma intenção aberta por ação.
  assert.equal(sut.F3_MAX_PREREQUISITES, 11);
  const cap = chainBook();
  const P = [
    [9, "proposta"],
    [10, "fonte"],
    [18, "solicitar"],
    [19, "aprovar"],
  ];
  for (let i = 0; i < sut.F3_MAX_PREREQUISITES; i++) {
    const [o, action] = P[i % P.length];
    seal(cap, 300 + i, o, { kind: "prerequisito", action });
    cap.rejected(uuid(300 + i));
  }
  assert.throws(() => seal(cap, 399, 9, { kind: "prerequisito", action: "proposta" }), {
    code: "F3_INTENT_PREREQUISITES",
  });
  const open = chainBook();
  seal(open, 300, 18, { kind: "prerequisito" });
  assert.throws(() => seal(open, 301, 18, { kind: "prerequisito" }), {
    code: "F3_INTENT_PRODUCER",
  });
  assert.throws(() => dup(open, 309, 18, uuid(300)), { code: "F3_INTENT_DUPLICATE_OF" });
  dup(book, 7, 5, uuid(5));
  book.rejected(uuid(7));
  assert.throws(() => dup(book, 8, 5, uuid(5)), { code: "F3_INTENT_DUPLICATE_OF" });
  assert.throws(() => dup(book, 9, 6, uuid(5)), { code: "F3_INTENT_DUPLICATE_OF" });
  assert.throws(() => seal(book, 9, 6, { kind: "duplicidade" }), { code: "F3_INTENT_KIND" });
  assert.throws(() => seal(book, 9, 6, { duplicateOf: uuid(5) }), { code: "F3_INTENT_KIND" });
  assert.throws(() => seal(book, 9, 6, { kind: "segunda" }), { code: "F3_INTENT_KIND" });
  // Recibo não pode apontar para pré-requisito nem para duplicidade.
  const prereq = referenceBook(EMPTY, (b) => seal(b, 500, 18, { kind: "prerequisito" }));
  rejects(
    completeReport((r) => forProducer(r, 18, (c) => (c.requestId = uuid(500))), { book: prereq }),
    ["F3_REPORT", "F3_ISOLATION"],
  );
  rejects(
    completeReport((r) => forProducer(r, 5, (c) => (c.requestId = uuid(205)))),
    ["F3_REPORT", "F3_ISOLATION"],
  );
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

test("F3 B2b1 RED: intenções e inventário declarados precisam ser o replay dos eventos", () => {
  for (const fn of [
    (r) => (r.intents.sent = 0),
    (r) => (r.intents.sent = 27),
    (r) => (r.intents.uncertain = 8),
    (r) => (r.intents.confirmed = 17),
    (r) => (r.intents.abandoned = 1),
    (r) => (r.intents.priorSent = 1),
    (r) => (r.intents.requests[0].sends = 0),
    (r) => (r.intents.requests[0].kind = "prerequisito"),
    (r) => (r.intents.requests[1].outcome = "uncertain"),
    (r) => (r.intents.requests[1].rechecked = true),
    (r) => r.intents.requests.pop(),
    (r) => r.intents.events.pop(),
    (r) => r.intents.events.splice(1, 1),
    (r) => (r.intents.events[1].organizationId = sut.F3_E87_ORG),
    (r) => (r.intents.requests = []),
  ])
    rejects(completeReport(fn));
  for (const fn of [
    (r) => r.isolation.created.pop(),
    (r) => (r.isolation.created[3].organizationId = sut.F3_E87_ORG),
    (r) => (r.isolation.organizationF3 = uuid(9)),
    (r) =>
      r.isolation.created.push({
        id: uuid(777),
        kind: "registro",
        organizationId: F3,
        requestId: uuid(777),
      }),
    (r) => (r.isolation.created[0].kind = "registro"),
  ])
    rejects(completeReport(fn), ["F3_ISOLATION"]);
  // Pré-requisito pendente: válido, mas o critério PENDING falha.
  const pending = completeReport(() => {}, {
    book: referenceBook(EMPTY, (b) => seal(b, 500, 18, { kind: "prerequisito" })),
  });
  assert.deepEqual(criteria(pending), ["PENDING"]);
  // Principal sem desfecho: os casos do produtor não podem ser PASS.
  rejects(
    completeReport(() => {}, { book: referenceBook(EMPTY, () => {}, [9]) }),
    ["F3_REPORT", "F3_ISOLATION"],
  );
});

test("F3 B2b1 RED: chaves herdadas e conjunto de contadores fora do fixado falham", () => {
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
      ["F3_ISOLATION", "F3_REPORT"],
    );
  const partial = completeReport((r) => {
    r.isolation.e87Before = { V101: 3 };
    r.isolation.e87After = { V101: 3 };
  });
  assert.deepEqual(criteria(partial), ["E87_COUNTERS"]);
  assert.deepEqual(criteria(completeReport((r) => (r.isolation.e87After.V101 = 4))), [
    "E87_COUNTERS",
  ]);
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

test("F3 B2b1 RED: duplicidade é por produtor, com política com fonte", () => {
  assert.throws(() => sut.validateF3Report(completeReport(), catalogue, NP), { code: "F3_REPORT" });
  const noDup = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(noDup);
  for (const o of MUT.filter((x) => x !== 2)) {
    prereqs(noDup, o);
    seal(noDup, o, o);
    ok(noDup, o, entity(o));
  }
  const pendingPolicy = completeReport(
    (r) => {
      for (const c of r.cases) {
        if (!MUT.includes(c.producerOrder)) continue;
        c.duplicate = "NOT_RUN";
        c.status = "BLOCKED";
      }
    },
    { book: noDup },
  );
  assert.equal(sut.validateF3Report(pendingPolicy, catalogue, NP), true);
  assert.equal(sut.f3Gate(pendingPolicy, catalogue, NP), "FAIL");
  assert.ok(MUT.every((o) => sut.F3_DUPLICATE_POLICY[String(o)] === null));
  rejects(completeReport((r) => forProducer(r, 15, (c) => (c.duplicate = "REJECTED"))));
  rejects(
    completeReport((r) => (r.cases.find((c) => c.producerOrder === 5).duplicate = "NOT_RUN")),
  );
  rejects(completeReport(() => {}, { book: noDup }));
  rejects(completeReport((r) => (r.cases.find((c) => c.producerOrder === 6).requestId = uuid(7))));
  rejects(
    completeReport((r) => {
      forProducer(r, 7, (c) => (c.requestId = uuid(6)));
      forProducer(r, 7, (c) => (c.entityIds = [entity(6)]));
    }),
    ["F3_REPORT", "F3_ISOLATION"],
  );
  rejects(completeReport((r) => forProducer(r, 1, (c) => (c.duplicate = "REJECTED"))));
  rejects(
    completeReport((r) => forProducer(r, 9, (c) => (c.entityIds = [entity(10)]))),
    ["F3_ISOLATION"],
  );
  // Duplicidade aceita pelo produto vira FAIL, com a segunda entidade no inventário.
  const acceptedBook = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(acceptedBook);
  for (const o of MUT.filter((x) => x !== 2)) {
    prereqs(acceptedBook, o);
    seal(acceptedBook, o, o);
    ok(acceptedBook, o, entity(o));
    if (REJ(o)) {
      dup(acceptedBook, 200 + o, o, uuid(o));
      // V105 cria (o V106 é atualização): a duplicidade aceita deixa um 2º contrato no inventário.
      if (o === 7) ok(acceptedBook, 207, uuid(807));
      else acceptedBook.rejected(uuid(200 + o));
    }
  }
  const accepted = completeReport(
    (r) =>
      forProducer(r, 7, (c) => {
        c.duplicate = "ACCEPTED";
        c.status = "FAIL";
      }),
    { book: acceptedBook },
  );
  assert.equal(valid(accepted), true);
  assert.equal(accepted.summary.FAIL, sut.F3_PRODUCERS.find((p) => p.order === 7).connections);
  assert.equal(acceptedBook.created().find((c) => c.id === uuid(807)).kind, "registro");
  for (const bad of [
    { ...POLICY, 5: { result: "REJECTED", source: "" } },
    { ...POLICY, 5: { result: "ACCEPTED", source: "src/a.ts:1-1" } },
    { ...POLICY, 1: { result: "REJECTED", source: "src/a.ts:1-1" } },
    { ...POLICY, 21: null },
  ])
    assert.throws(() => sut.validateF3DuplicatePolicy(bad), { code: "F3_DUPLICATE_POLICY" });
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
    (r) => (r.cases[0].preservedFrom = "x@y.z"),
    (r) => (r.isolation.e87Before.V999 = 1),
    (r) => (r.intents.requests[0].note = "x"),
    (r) => (r.intents.events[0].note = "x"),
  ];
  for (const fn of leaks) rejects(completeReport(fn), ["F3_REPORT", "F3_ISOLATION"]);
  rejects(new Proxy(completeReport(), {}));
});

test("F3 B2b1 RED: livro idempotente, incerto só com readback, mutação fora da F3 e 2º usuário", () => {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(book);
  seal(book, 5, 5);
  ok(book, 5, entity(5));
  // V105 é sem chave: incerto só sai do estado por releitura, nunca por reenvio.
  seal(book, 7, 7);
  assert.throws(() => seal(book, 7, 8), { code: "F3_INTENT_REPLAY" });
  book.uncertain(uuid(7));
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  book.reconcile(uuid(7), { found: true, entityId: uuid(70), organizationId: F3 });
  assert.equal(book.state(uuid(7)), "confirmed");
  assert.throws(() => book.resend(uuid(7)), { code: "F3_UNCERTAIN_RESEND" });
  // V106 tem chave: depois da ausência comprovada, um reenvio com os mesmos vínculos.
  seal(book, 8, 8);
  book.uncertain(uuid(8));
  book.reconcile(uuid(8), { found: false, entityId: null, organizationId: null });
  resendSame(book, 8);
  assert.throws(() => book.resend(uuid(8)), { code: "F3_UNCERTAIN_RESEND" });
  ok(book, 8, uuid(70));
  assert.equal(book.summary().requests.find((q) => q.requestId === uuid(8)).sends, 2);
  seal(book, 14, 14);
  ok(book, 14, entity(14));
  seal(book, 16, 16);
  book.uncertain(uuid(16));
  // Entidade achada na e87f7e68 é fato observado, registrado fora da F3.
  book.reconcile(uuid(16), { found: true, entityId: uuid(90), organizationId: sut.F3_E87_ORG });
  assert.equal(book.created().find((c) => c.id === uuid(90)).kind, "fora_da_f3");
  assert.throws(() => book.confirm(uuid(99999), { entityId: uuid(1), organizationId: F3 }), {
    code: "F3_INTENT_UNKNOWN",
  });
  seal(book, 18, 18);
  ok(book, 18, uuid(70));
  assert.equal(book.created().filter((c) => c.id === uuid(70))[1].kind, "entidade_repetida");
  const toStringActor = { toString: () => "master" };
  for (const actor of ["leitor", "segundo", null, "MASTER", toStringActor])
    assert.throws(() => seal(book, 11, 11, { actor }), { code: "F3_SECOND_USER_MUTATION" });
  for (const producerOrder of [1, 3, 21, 0, "5"])
    assert.throws(() => seal(book, 11, producerOrder), { code: "F3_INTENT_PRODUCER" });
  assert.throws(
    () =>
      book.seal({ requestId: "IFV1-1", producerOrder: 11, actor: "master", organizationId: F3 }),
    { code: "F3_INTENT_ID" },
  );
  assert.throws(() => seal(book, 11, 11, { organizationId: sut.F3_E87_ORG }), {
    code: "F3_FOREIGN_ORG",
  });
  assert.throws(() => sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY, priorSent: 0 }), {
    code: "F3_INTENT_OPTIONS",
  });
  assert.equal(sut.assertF3SecondUserProfile("leitor"), true);
});

test("F3 B2b1 RED: orçamento de 40 por execução e 60 no total, acumulado pelo ledger", () => {
  // 40 envios (PLAN §12.2): organização, 17 principais, 5 pré-requisitos do inventário e 17
  // duplicidades; o 41º é recusado.
  const first = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(first);
  for (const o of MUT.filter((x) => x !== 2)) {
    prereqs(first, o);
    seal(first, o, o);
    ok(first, o, entity(o));
  }
  for (const o of MUT.filter((x) => x !== 2)) {
    dup(first, 200 + o, o, uuid(o));
    first.rejected(uuid(200 + o));
  }
  assert.equal(first.summary().sent, 40);
  assert.throws(() => seal(first, 299, 18, { kind: "prerequisito" }), { code: "F3_BUDGET" });
  // Teto de 60: principais rejeitadas e refeitas contam como envio a cada tentativa.
  const rejectLoop = (book, start, count) => {
    for (let n = start; n < start + count; n++) {
      seal(book, n, 5);
      book.rejected(uuid(n));
    }
  };
  const a = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(a);
  rejectLoop(a, 1000, 29);
  const la = ledgerOf([run(1, a)]);
  const b = sut.createF3IntentBook({ provenance: PROV, ledger: la });
  rejectLoop(b, 2000, 30);
  const lb = ledgerOf([run(1, a), run(2, b)]);
  assert.equal(sut.f3LedgerState(lb).priorSent, 60);
  const c = sut.createF3IntentBook({ provenance: PROV, ledger: lb });
  assert.throws(() => seal(c, 3000, 5), { code: "F3_BUDGET" });
  // Ledger com mais de 40 envios numa execução é recusado no replay (evento bem formado: a
  // recusa é do orçamento, não da forma).
  const over = {
    ...run(1, first),
    events: [
      ...run(1, first).events,
      {
        op: "seal",
        requestId: uuid(3001),
        producerOrder: 18,
        kind: "prerequisito",
        action: "solicitar",
        duplicateOf: null,
        entityId: null,
        organizationId: null,
        related: null,
        step: null,
        bodySha256: null,
        values: null,
      },
    ],
  };
  // Controle positivo: o mesmo evento numa execução com folga é aceito.
  assert.ok(ledgerOf([{ ...run(1, a), events: [...run(1, a).events, over.events.at(-1)] }]));
  assert.throws(() => ledgerOf([over]), { code: "F3_LEDGER" });
});

test("F3 B2b1 RED: execuções anteriores, pendentes, abandono e duplicidade entre execuções", () => {
  const b1 = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(b1);
  seal(b1, 5, 5);
  ok(b1, 5, uuid(105));
  seal(b1, 7, 7);
  ok(b1, 7, uuid(107));
  seal(b1, 6, 6); // V103, atualização sem chave
  b1.uncertain(uuid(6));
  dup(b1, 205, 5, uuid(5)); // V102, sem chave
  seal(b1, 8, 8); // V106, com chave; sem desfecho: vira incerto na execução seguinte
  seal(b1, 14, 14); // V113, sem chave; sem desfecho
  const l1 = ledgerOf([run(1, b1)]);
  const st = sut.f3LedgerState(l1);
  assert.equal(st.organizationF3, F3);
  assert.equal(st.priorSent, 7);
  assert.deepEqual(
    st.requests.map((q) => [q.requestId, q.outcome, q.prior, q.sends, q.rechecked]),
    [
      [uuid(2), "confirmed", true, 0, false],
      [uuid(5), "confirmed", true, 0, false],
      [uuid(7), "confirmed", true, 0, false],
      [uuid(6), "uncertain", true, 0, false],
      [uuid(205), "uncertain", true, 0, false],
      [uuid(8), "uncertain", true, 0, false],
      [uuid(14), "uncertain", true, 0, false],
    ],
  );
  const b2 = sut.createF3IntentBook({ provenance: PROV, ledger: l1 });
  assert.equal(b2.organizationF3(), F3);
  assert.equal(b2.created().length, 3);
  assert.throws(() => seal(b2, 5, 8), { code: "F3_INTENT_REPLAY" });
  assert.throws(() => b2.resend(uuid(6)), { code: "F3_UNCERTAIN_RESEND" });
  assert.equal(b2.summary().uncertain, 4);
  // A atualização achada na releitura confirma a entidade do inventário que ela atualiza.
  b2.reconcile(uuid(6), { found: true, entityId: uuid(105), organizationId: F3 });
  // Sem chave: ausência comprovada nunca vira reenvio; a intenção é abandonada.
  b2.reconcile(uuid(205), { found: false, entityId: null, organizationId: null });
  assert.throws(() => b2.resend(uuid(205)), { code: "F3_UNCERTAIN_RESEND" });
  b2.abandon(uuid(205));
  // Com chave: reenvio entre execuções com os mesmos vínculos do envio original.
  b2.reconcile(uuid(8), { found: false, entityId: null, organizationId: null });
  resendSame(b2, 8);
  b2.rejected(uuid(8));
  // Ausência comprovada e abandono: não conta como pendente; libera nova principal.
  b2.reconcile(uuid(14), { found: false, entityId: null, organizationId: null });
  b2.abandon(uuid(14));
  seal(b2, 114, 14);
  ok(b2, 114, uuid(1114));
  dup(b2, 206, 6, uuid(6));
  b2.rejected(uuid(206));
  const s2 = b2.summary();
  assert.deepEqual([s2.priorSent, s2.sent, s2.uncertain, s2.abandoned], [7, 3, 0, 2]);
  const l2 = ledgerOf([run(1, b1), run(2, b2)]);
  // Na execução seguinte, a abandonada precisa ser relida para o critério fechar.
  const b3 = sut.createF3IntentBook({ provenance: PROV, ledger: l2 });
  const r3 = (book) =>
    completeReport(
      (r) => {
        for (const c of r.cases) {
          c.duplicate = "NOT_RUN";
          c.requestId = null;
          c.entityIds = [];
          c.cleanupStatus = "NO_MUTATION";
          c.positive = "NOT_RUN";
          c.status = "BLOCKED";
        }
        r.state = "PARTIAL";
      },
      { book, ledger: l2 },
    );
  assert.ok(criteria(r3(b3), { policy: POLICY, ledger: l2 }).includes("ABANDONED_RECHECKED"));
  b3.reconcile(uuid(14), { found: false, entityId: null, organizationId: null });
  b3.reconcile(uuid(205), { found: false, entityId: null, organizationId: null });
  assert.ok(!criteria(r3(b3), { policy: POLICY, ledger: l2 }).includes("ABANDONED_RECHECKED"));
  // Releitura repetida na mesma execução seria evento sem efeito: recusada.
  assert.throws(
    () => b3.reconcile(uuid(14), { found: false, entityId: null, organizationId: null }),
    {
      code: "F3_INTENT_STATE",
    },
  );
  // Materialização tardia de uma principal abandonada: duas principais confirmadas, critério falha.
  const b4 = sut.createF3IntentBook({ provenance: PROV, ledger: l2 });
  b4.reconcile(uuid(14), { found: true, entityId: uuid(777), organizationId: F3 });
  assert.ok(criteria(r3(b4), { policy: POLICY, ledger: l2 }).includes("PRINCIPALS"));
  // Relatório validado contra ledger diferente do seu falha.
  assert.throws(() => sut.validateF3Report(r3(b3), catalogue, { policy: POLICY, ledger: l1 }), {
    code: "F3_REPORT",
  });
  // Ledger com a mesma execução repetida é recusado.
  assert.throws(() => ledgerOf([run(1, b1), { ...run(1, b1), workflowRunId: "2" }]), {
    code: "F3_LEDGER",
  });
});

test("F3 B2b1: relatório bloqueado, com e sem ledger lido, gravado com SHA256SUMS", async (t) => {
  const { mkdtemp, readFile: rf, readdir, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const blocked = sut.blockedF3Report({
    code: "F3_DRIVER_PENDING",
    catalogue,
    provenance: PROV,
    ledger: EMPTY,
  });
  assert.equal(sut.validateF3Report(blocked, catalogue, NP), true);
  assert.equal(blocked.summary.BLOCKED, 138);
  assert.equal(blocked.ledgerSha256, sut.F3_LEDGER_SHA256);
  assert.equal(sut.f3Gate(blocked, catalogue, NP), "FAIL");
  // Com ledger anterior, o bloqueado carrega o estado dele.
  const l1 = ledgerOf([
    run(
      1,
      referenceBook(EMPTY, (b) => seal(b, 500, 18, { kind: "prerequisito" })),
    ),
  ]);
  const later = sut.blockedF3Report({
    code: "F3_DRIVER_PENDING",
    catalogue,
    provenance: PROV,
    ledger: l1,
  });
  // 33 da execução de referência (com os 5 pré-requisitos do inventário) mais o de V118.
  assert.deepEqual([later.intents.priorSent, later.intents.uncertain], [34, 1]);
  assert.equal(later.isolation.organizationF3, F3);
  assert.equal(sut.validateF3Report(later, catalogue, { ledger: l1 }), true);
  assert.throws(() => sut.validateF3Report(later, catalogue, NP), { code: "F3_REPORT" });
  // Antes de ler o ledger: ledgerSha256 null, sem estado, só como BLOCKED e sem ledger.
  const early = sut.blockedF3Report({ code: "F3_CASES_HASH", catalogue: null, provenance: null });
  assert.equal(early.ledgerSha256, null);
  assert.equal(sut.validateF3Report(early, null, {}), true);
  assert.throws(() => sut.validateF3Report(early, null, NP), { code: "F3_REPORT" });
  assert.throws(
    () => sut.validateF3Report({ ...early, state: "PARTIAL", blockCode: null }, null, {}),
    {
      code: "F3_REPORT",
    },
  );
  const dir = await mkdtemp(join(tmpdir(), "f3-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const casesRaw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  await sut.writeF3Artifacts(dir, blocked, catalogue, casesRaw, NP);
  assert.deepEqual((await readdir(dir)).sort(), ["F3_CASES.json", "F3_REPORT.json", "SHA256SUMS"]);
  for (const line of (await rf(join(dir, "SHA256SUMS"), "utf8")).trim().split("\n")) {
    const [hex, name] = line.split("  ");
    assert.equal(
      createHash("sha256")
        .update(await rf(join(dir, name)))
        .digest("hex"),
      hex,
    );
  }
  // casesRaw diferente do catálogo emitido, ou relatório inválido, nunca é gravado.
  const dir2 = await mkdtemp(join(tmpdir(), "f3-"));
  t.after(() => rm(dir2, { recursive: true, force: true }));
  await assert.rejects(sut.writeF3Artifacts(dir2, blocked, catalogue, casesRaw + " ", NP), {
    code: "F3_CASES_HASH",
  });
  await assert.rejects(
    sut.writeF3Artifacts(dir2, { ...blocked, blockCode: "texto livre" }, catalogue, casesRaw, NP),
    {
      code: "F3_REPORT",
    },
  );
  await assert.rejects(rf(join(dir2, "F3_REPORT.json")));
  for (const code of ["", "a b", null, "X".repeat(81)])
    assert.throws(() => sut.blockedF3Report({ code, catalogue, provenance: PROV, ledger: EMPTY }), {
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

test("F3 B2b1: ledger fixado vazio, append-only, só PASS ligado ao replay, e regra C", () => {
  assert.equal(createHash("sha256").update(LEDGER_RAW).digest("hex"), sut.F3_LEDGER_SHA256);
  assert.deepEqual([EMPTY.runs.length, EMPTY.entries.length], [0, 0]);
  const book = referenceBook();
  const r1 = { ...run(PROV.workflowRunId, book) };
  const c0 = catalogue.cases[0];
  const c5 = catalogue.cases.find((c) => c.producerOrder === 5);
  const p5 = catalogue.cases.filter((c) => c.producerOrder === 5);
  const entry = (c, extra = {}) => ({
    caseId: c.caseId,
    status: "PASS",
    ...PROV,
    requestId: MUT.includes(c.producerOrder) ? uuid(c.producerOrder) : null,
    entityIds: MUT.includes(c.producerOrder) ? [entity(c.producerOrder)] : [],
    artifactId: "14076439209",
    sha256: "d".repeat(64),
    reviewId: "5900720754",
    ...extra,
  });
  const one = ledgerWith({ runs: [r1], entries: [entry(c0), ...p5.map((c) => entry(c))] });
  assert.equal(sut.validateF3LedgerExtension(LEDGER_RAW, one, catalogue), true);
  assert.throws(() => sut.validateF3LedgerExtension(one, one, catalogue), { code: "F3_LEDGER" });
  for (const bad of [
    [entry(c0, { status: "FAIL" })],
    [entry(c0), entry(c0)],
    [entry({ ...c0, caseId: "IFV1-F3-C9999" })],
    [entry(c0, { artifactId: null })],
    [entry(c0, { email: "x@y.z" })],
    [entry(c0, { workflowRunId: "999" })],
    [entry(c0, { harnessSha: "c".repeat(40) })],
    [entry(c0, { requestId: uuid(5) })],
    [entry(c5, { requestId: uuid(205) })],
    [entry(c5, { requestId: uuid(6) })],
    // Entidade de outro produtor (V103 atualiza o próprio contratante de V102, então usa V105).
    [entry(c5, { entityIds: [entity(7)] })],
    [entry(c5, { requestId: null, entityIds: [] })],
  ])
    assert.throws(() => sut.validateF3Ledger(ledgerWith({ runs: [r1], entries: bad }), catalogue), {
      code: "F3_LEDGER",
    });
  assert.throws(
    () => sut.validateF3Ledger(ledgerWith({ runs: [], entries: [entry(c0)] }), catalogue),
    {
      code: "F3_LEDGER",
    },
  );
  // Preservação: só com o mesmo produto, backend, deployment e harness.
  const ledger = sut.validateF3Ledger(one, catalogue);
  assert.deepEqual(sut.preservedF3Cases(ledger, PROV), [c0.caseId, ...p5.map((c) => c.caseId)]);
  assert.deepEqual(sut.preservedF3Cases(ledger, { ...PROV, harnessSha: "e".repeat(40) }), []);
  assert.deepEqual(sut.preservedF3Cases(ledger, { ...PROV, frontendSha: "f".repeat(40) }), []);
  assert.throws(() => sut.preservedF3Cases(JSON.parse(one), PROV), { code: "F3_LEDGER_REQUIRED" });
  assert.deepEqual([...sut.F3_HARNESS_EQUIVALENCES], []);
  // Recibo preservado no relatório da execução seguinte: proveniência e intenção do ledger.
  const now = { ...PROV, workflowRunId: "99" };
  const next = sut.createF3IntentBook({ provenance: PROV, ledger });
  const blockedNow = sut.blockedF3Report({
    code: "F3_DRIVER_PENDING",
    catalogue,
    provenance: now,
    ledger,
  });
  const withPreserved = (fn = () => {}) => {
    const r = JSON.parse(JSON.stringify(blockedNow));
    r.intents = next.summary();
    const full = completeReport().cases;
    const idx = r.cases.map((c, k) => (c.producerOrder === 5 ? k : -1)).filter((k) => k >= 0);
    for (const k of idx) r.cases[k] = { ...full[k], preservedFrom: PROV.workflowRunId };
    fn(r, idx[0], idx);
    r.summary = sut.f3Summary(r.cases);
    return r;
  };
  assert.equal(sut.validateF3Report(withPreserved(), catalogue, { policy: POLICY, ledger }), true);
  for (const fn of [
    (r, i) => (r.cases[i].preservedFrom = "98"),
    (r, i) => (r.cases[i].workflowRunId = "99"),
    (r, i, idx) => idx.forEach((k) => (r.cases[k].requestId = uuid(6))),
    (r, i) => (r.cases[i].status = "FAIL"),
    (r) => (r.provenance.harnessSha = "e".repeat(40)),
  ])
    assert.throws(
      () => sut.validateF3Report(withPreserved(fn), catalogue, { policy: POLICY, ledger }),
      (e) => ["F3_REPORT", "F3_ISOLATION"].includes(e.code),
    );
});

/**
 * Propriedades com semente fixa: ações aleatórias no livro, em até três execuções, sempre geram
 * ledger e relatório válidos; uma ação recusada não altera o estado; e uma adulteração isolada
 * dos eventos, intenções, contadores ou inventário é sempre recusada.
 */
test("F3 B2b1: propriedade, replay do livro é a única fonte de verdade (semente fixa)", () => {
  let seed = 0x5eed1234;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    // Bits altos do gerador congruencial: os baixos têm ciclo curto e amarravam os sorteios.
    return (seed >>> 16) % n;
  };
  let next = 1;
  const id = () => uuid(900000 + next++);
  const ORDERS = MUT.filter((o) => o !== 2);
  const PRE_FLOWS = Object.values(FLOWS).filter((f) => f.kind === "prerequisito");
  let scenarios = 0,
    tampers = 0,
    refused = 0;
  const codes = new Set(),
    kinds = new Set();
  let e87 = 0;
  for (let k = 0; k < 500; k++) {
    let ledger = EMPTY;
    const runs = [];
    const nRuns = 1 + rnd(3);
    for (let r = 1; r <= nRuns; r++) {
      const book = sut.createF3IntentBook({ provenance: PROV, ledger });
      const steps = 5 + rnd(30);
      for (let s = 0; s < steps; s++) {
        const known = book.summary().requests;
        const pick = (pred) => {
          const xs = known.filter(pred);
          return xs.length ? xs[rnd(xs.length)] : null;
        };
        const before = JSON.stringify([book.summary(), book.created()]);
        const action = rnd(10);
        try {
          if (book.organizationF3() === null) {
            const org = pick(
              (q) =>
                q.producerOrder === 2 &&
                q.kind === "principal" &&
                book.state(q.requestId) !== "rejected",
            );
            const st = org && book.state(org.requestId);
            if (!org || st === "abandoned") seal(book, 0, 2, { requestId: id() });
            else if (st === "sealed")
              action < 7
                ? book.confirm(org.requestId, { entityId: F3, organizationId: F3 })
                : book.uncertain(org.requestId);
            else if (st === "uncertain")
              action < 5
                ? book.reconcile(org.requestId, { found: true, entityId: F3, organizationId: F3 })
                : book.reconcile(org.requestId, {
                    found: false,
                    entityId: null,
                    organizationId: null,
                  });
            else if (st === "absent")
              action < 5 ? resendId(book, org.requestId) : book.abandon(org.requestId);
            continue;
          }
          if (action === 0) seal(book, 0, ORDERS[rnd(ORDERS.length)], { requestId: id() });
          else if (action === 1) {
            const f = PRE_FLOWS[rnd(PRE_FLOWS.length)];
            seal(book, 0, f.order, { requestId: id(), kind: "prerequisito", action: f.action });
          } else if (action === 2) {
            const base = pick((q) => q.outcome === "confirmed" && q.kind === "principal");
            if (base)
              seal(book, 0, base.producerOrder, {
                requestId: id(),
                kind: "duplicidade",
                duplicateOf: base.requestId,
              });
          } else {
            const q = pick((x) =>
              ["sealed", "uncertain", "absent", "abandoned"].includes(book.state(x.requestId)),
            );
            if (!q) continue;
            const st = book.state(q.requestId);
            // Fatos observados sorteados: entidade nova na F3, fora da F3, na e87f7e68 ou
            // repetida; e, às vezes, violação de protocolo do driver na organização.
            const made = book.created();
            const fact = rnd(10);
            const key = q.producerOrder + ":" + q.action;
            const f = FLOWS[key];
            const ent = { entityId: id(), organizationId: F3, related: related(q.requestId, key) };
            if (fact === 0) ent.organizationId = id();
            else if (fact === 1) ent.organizationId = sut.F3_E87_ORG;
            else if (fact === 2 && made.length) ent.entityId = made[rnd(made.length)].id;
            // Atualização: às vezes a entidade certa do inventário, às vezes outra (recusada).
            if (f.updates && fact >= 5) {
              const [k, role = "principal"] = f.updates.split("/");
              const target = made.find((c) => c.flow === k && c.role === role);
              if (target) ent.entityId = target.id;
            }
            if (fact === 4) ent.related = [];
            if (q.producerOrder === 2) ent.organizationId = fact === 3 ? id() : ent.entityId;
            if (st === "sealed") {
              if (action <= 4) book.confirm(q.requestId, ent);
              else if (action <= 6) book.rejected(q.requestId);
              else book.uncertain(q.requestId);
            } else if (st === "uncertain" || st === "abandoned") {
              book.reconcile(
                q.requestId,
                action <= 5
                  ? { found: true, ...ent }
                  : { found: false, entityId: null, organizationId: null },
              );
            } else if (st === "absent")
              action <= 6 ? resendId(book, q.requestId) : book.abandon(q.requestId);
          }
        } catch (error) {
          // Qualquer recusa, de qualquer código, não altera nada (transação).
          assert.equal(typeof error.code, "string", String(error));
          assert.equal(JSON.stringify([book.summary(), book.created()]), before);
          refused += 1;
          codes.add(error.code);
        }
      }
      const summary = book.summary();
      assert.ok(summary.events.length <= sut.F3_MAX_EVENTS_PER_RUN);
      // O relatório parcial montado com o livro carrega exatamente a execução.
      const partial = sut.blockedF3Report({
        code: "F3_DRIVER_PENDING",
        catalogue,
        provenance: PROV,
        book,
      });
      assert.equal(JSON.stringify(partial.intents), JSON.stringify(summary));
      assert.equal(sut.validateF3Report(partial, catalogue, { ledger }), true);
      const report = sut.blockedF3Report({
        code: "F3_DRIVER_PENDING",
        catalogue,
        provenance: PROV,
        ledger,
      });
      report.state = "PARTIAL";
      report.blockCode = null;
      report.intents = summary;
      report.isolation.organizationF3 = book.organizationF3();
      report.isolation.created = book.created();
      assert.equal(sut.validateF3Report(report, catalogue, { ledger }), true);
      scenarios += 1;
      const tamper = JSON.parse(JSON.stringify(report));
      const t = rnd(10);
      if (t === 0) tamper.intents.sent += 1;
      else if (t === 1 && tamper.intents.events.length) tamper.intents.events.pop();
      else if (t === 2 && tamper.intents.requests.length) tamper.intents.requests[0].sends ^= 1;
      else if (t === 3) tamper.intents.priorSent += 1;
      else if (t === 4 && tamper.isolation.created.length) tamper.isolation.created.pop();
      else if (t === 5 && tamper.intents.requests.length)
        tamper.intents.requests[0].outcome =
          tamper.intents.requests[0].outcome === "uncertain" ? "rejected" : "uncertain";
      else if (t === 6 && tamper.intents.requests.length)
        tamper.intents.requests[0].rechecked = !tamper.intents.requests[0].rechecked;
      else if (t === 7 && tamper.intents.events.length)
        tamper.intents.events.splice(rnd(tamper.intents.events.length), 1);
      else if (t === 8) {
        const e = tamper.intents.events.find((x) => x.entityId !== null && x.entityId !== F3);
        if (e) e.entityId = e.organizationId === e.entityId ? (e.organizationId = id()) : id();
      } else if (t === 9) {
        // Vínculo adulterado no que a regra obriga a recusar (PLAN §12.5): a e87f7e68 em
        // qualquer posição, ou corpo de passo JSON no lugar do Storage e vice-versa. Trocar um
        // valor gerado ou derivado por outro novo é história consistente, que o replay não tem
        // como distinguir: a autenticidade do artefato vem do SHA-256 do ZIP no ledger (M3).
        const e = tamper.intents.events.find((x) => x.op === "bind" && x.values.length);
        if (e && rnd(2)) e.values[rnd(e.values.length)].value = sut.F3_E87_ORG;
        else if (e) e.bodySha256 = e.bodySha256 === null ? "f".repeat(64) : null;
      }
      if (JSON.stringify(tamper) !== JSON.stringify(report)) {
        assert.throws(
          () => sut.validateF3Report(tamper, catalogue, { ledger }),
          (e) => ["F3_REPORT", "F3_ISOLATION"].includes(e.code),
        );
        tampers += 1;
      }
      for (const c of book.created()) {
        kinds.add(c.kind);
        if (c.organizationId === sut.F3_E87_ORG || c.id === sut.F3_E87_ORG) e87 += 1;
      }
      runs.push({
        workflowRunId: String(r),
        frontendSha: PROV.frontendSha,
        harnessSha: PROV.harnessSha,
        deploymentId: PROV.deploymentId,
        artifactId: String(1000 + r),
        sha256: "e".repeat(64),
        reviewId: String(2000 + r),
        events: summary.events,
      });
      const priorBefore = sut.f3LedgerState(ledger).priorSent;
      ledger = ledgerOf(runs);
      assert.equal(sut.f3LedgerState(ledger).priorSent, priorBefore + summary.sent);
      assert.ok(sut.f3LedgerState(ledger).priorSent <= 60);
      assert.ok(
        sut
          .f3LedgerState(ledger)
          .created.every((c) => c.organizationId !== sut.F3_E87_ORG || c.kind === "fora_da_f3"),
      );
    }
  }
  console.log(
    "# propriedade: cenarios=" + scenarios + " adulteracoes=" + tampers + " recusadas=" + refused,
  );
  assert.ok(
    scenarios >= 800 && tampers >= 500 && refused >= 100,
    [scenarios, tampers, refused].join(),
  );
  // Cobertura exigida: todos os tipos de entidade e a recusa por violação de protocolo.
  console.log("# propriedade: tipos=" + [...kinds].sort() + " codigos=" + [...codes].sort());
  for (const kind of sut.F3_ENTITY_KINDS) assert.ok(kinds.has(kind), kind);
  assert.ok(codes.has("F3_INTENT_ENTITY"));
  // M-A: o ramo e87 tem de ser exercitado de fato, não só o tipo fora_da_f3 por outra via.
  console.log("# propriedade: entidades_e87=" + e87);
  assert.ok(e87 > 0, "nenhuma entidade da e87f7e68 gerada");
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
    "runF3Session({ catalogue, ledger, provenance, signal: abort.signal })",
    "writeF3Artifacts(",
  ].map((needle) => body.indexOf(needle));
  assert.ok(
    order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1])),
    String(order),
  );
  const yaml = await readFile(new URL("../../" + sut.F3_WORKFLOW_PATH, import.meta.url));
  assert.equal(createHash("sha256").update(yaml).digest("hex"), sut.F3_WORKFLOW_SHA256);
});

test("F3 B2b1 RED (M4): executor só lê chaves de proveniência e não grava valor de secret", async (t) => {
  const { mkdtemp, readFile: rf, cp, mkdir, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  // Cópia isolada do executor e do que ele lê, para o relatório bloqueado ir a um diretório temporário.
  const dir = await mkdtemp(join(tmpdir(), "f3-env-"));
  // A cópia inclui node_modules: sem remoção, cada execução deixava centenas de MB no disco.
  t.after(() => rm(dir, { recursive: true, force: true }));
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

test("F3 B2b1 RED: fato observado é registrado, transição é atômica e o isolamento reprova", () => {
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(book);
  seal(book, 5, 5);
  book.uncertain(uuid(5));
  // Violação de protocolo recusada sem efeito colateral (antes marcava rechecked).
  const before = JSON.stringify([book.summary(), book.created()]);
  seal(book, 4, 4); // ADM01: só depende da organização
  const afterSeal = JSON.stringify([book.summary(), book.created()]);
  assert.notEqual(before, afterSeal);
  assert.throws(() => book.reconcile(uuid(5), { found: true, entityId: "x", organizationId: F3 }), {
    code: "F3_INTENT_EVENT",
  });
  assert.equal(JSON.stringify([book.summary(), book.created()]), afterSeal);
  // Entidade achada fora da F3 entra no inventário; recibo PASS sobre ela é recusado.
  book.reconcile(uuid(5), { found: true, entityId: uuid(105), organizationId: uuid(999) });
  ok(book, 4, uuid(105));
  assert.deepEqual(
    book
      .created()
      .slice(1)
      .map((c) => c.kind),
    ["fora_da_f3", "entidade_repetida"],
  );
  // V116 não é dependência de inventário de nenhum outro produtor (levantamento, seção 3).
  const full = referenceBook(EMPTY, () => {}, [16]);
  full.uncertain(uuid(16));
  full.reconcile(uuid(16), { found: true, entityId: entity(16), organizationId: uuid(999) });
  const r = completeReport(() => {}, { book: full });
  assert.throws(() => valid(r), { code: "F3_ISOLATION" });
  const blocked5 = completeReport(
    (x) =>
      forProducer(x, 16, (c) => {
        c.positive = "FAIL";
        c.duplicate = "NOT_RUN";
        c.status = "FAIL";
      }),
    { book: full },
  );
  assert.equal(valid(blocked5), true);
  assert.ok(criteria(blocked5).includes("ISOLATION"));
});

test("F3 B2b1 RED: relatório parcial com o livro preserva envios, eventos e inventário", () => {
  const book = referenceBook(EMPTY, (b) => {
    seal(b, 500, 18, { kind: "prerequisito" });
    b.uncertain(uuid(500));
    b.reconcile(uuid(500), { found: true, entityId: uuid(5000), organizationId: uuid(999) });
  });
  const partial = sut.blockedF3Report({
    code: "F3_DRIVER_FAILED",
    catalogue,
    provenance: PROV,
    book,
  });
  assert.deepEqual([partial.intents.sent, partial.intents.events.length > 0], [34, true]);
  assert.equal(partial.isolation.created.at(-1).kind, "fora_da_f3");
  assert.equal(sut.validateF3Report(partial, catalogue, NP), true);
  // O ledger montado com os eventos desse artefato conta os 34 envios reais.
  const l1 = ledgerOf([{ ...run(PROV.workflowRunId, book) }]);
  assert.equal(sut.f3LedgerState(l1).priorSent, 34);
  // Livro estranho ou ledger diferente do livro são recusados.
  assert.throws(
    () =>
      sut.blockedF3Report({
        code: "X",
        catalogue,
        provenance: PROV,
        book: { summary: () => ({}) },
      }),
    { code: "F3_REPORT" },
  );
  assert.throws(
    () => sut.blockedF3Report({ code: "X", catalogue, provenance: PROV, book, ledger: l1 }),
    { code: "F3_REPORT" },
  );
  // Log acima do teto da máquina de estados é recusado no replay.
  const big = JSON.parse(JSON.stringify(partial));
  big.intents.events = Array.from(
    { length: sut.F3_MAX_EVENTS_PER_RUN + 1 },
    () => big.intents.events[0],
  );
  assert.throws(() => sut.validateF3Report(big, catalogue, NP), { code: "F3_REPORT" });
  // Teto provado (emenda 1): (8 + 2 × 4 passos) eventos por intenção × 60 intenções.
  assert.equal(sut.F3_MAX_STEPS, 4);
  assert.equal(sut.F3_MAX_EVENTS_PER_RUN, 960);
});

test("F3 B2b1 RED: gravador só com a política de produção; entrada do ledger pela execução citada", async (t) => {
  const { mkdtemp, readFile: rf, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const casesRaw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  const dir = await mkdtemp(join(tmpdir(), "f3-w-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  // 138 PASS sob política de teste: válido no diagnóstico, nunca gravado.
  const report = completeReport();
  assert.deepEqual(criteria(report), []);
  await assert.rejects(sut.writeF3Artifacts(dir, report, catalogue, casesRaw, OPT), {
    code: "F3_REPORT",
  });
  await assert.rejects(sut.writeF3Artifacts(dir, report, catalogue, casesRaw, NP), {
    code: "F3_REPORT",
  });
  await assert.rejects(rf(join(dir, "F3_REPORT.json")));
  // Entrada PASS citando a execução 1 para entidade confirmada só na execução 2.
  const b1 = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(b1);
  seal(b1, 5, 5);
  b1.uncertain(uuid(5));
  const r1 = run(1, b1);
  const b2 = sut.createF3IntentBook({ provenance: PROV, ledger: ledgerOf([r1]) });
  b2.reconcile(uuid(5), { found: true, entityId: entity(5), organizationId: F3 });
  const r2 = run(2, b2, "c".repeat(40));
  const c5 = catalogue.cases.find((c) => c.producerOrder === 5);
  const entry = (extra) => ({
    caseId: c5.caseId,
    status: "PASS",
    ...PROV,
    requestId: uuid(5),
    entityIds: [entity(5)],
    artifactId: "14076439209",
    sha256: "d".repeat(64),
    reviewId: "5900720754",
    ...extra,
  });
  assert.ok(ledgerOf([r1, r2], [entry({ workflowRunId: "2", harnessSha: "c".repeat(40) })]));
  for (const bad of [
    entry({ workflowRunId: "1" }),
    entry({ workflowRunId: "2", harnessSha: "c".repeat(40), frontendSha: "f".repeat(40) }),
    entry({ workflowRunId: "2", harnessSha: "c".repeat(40), deploymentId: "dpl_OUTRODEPLOY1" }),
  ])
    assert.throws(() => ledgerOf([r1, r2], [bad]), { code: "F3_LEDGER" });
  // Entrada sobre entidade fora da F3 é recusada.
  const b3 = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(b3);
  seal(b3, 5, 5);
  b3.confirm(uuid(5), { entityId: entity(5), organizationId: uuid(999) });
  assert.throws(() => ledgerOf([run(1, b3)], [entry({ workflowRunId: "1" })]), {
    code: "F3_LEDGER",
  });
  // Execução do ledger sem proveniência completa é recusada.
  const { frontendSha: _f, ...noFront } = r1;
  assert.throws(() => ledgerOf([noFront]), { code: "F3_LEDGER" });
});

// ---------------------------------------------------------------------------------------------
// BUILD-2b-2a: proveniência amarrada ao livro (M2), execução ligada ao artefato (M3), isolamento
// dos pré-requisitos e cerca de mutação ligada ao livro.

test("F3 B2b2a RED (M2): o livro exige proveniência completa e o relatório herda a do livro", () => {
  assert.throws(() => sut.createF3IntentBook({ ledger: EMPTY }), { code: "F3_PROVENANCE" });
  for (const k of ["frontendSha", "harnessSha", "deploymentId", "workflowRunId"])
    assert.throws(
      () => sut.createF3IntentBook({ ledger: EMPTY, provenance: { ...PROV, [k]: null } }),
      { code: "F3_PROVENANCE" },
    );
  assert.throws(
    () => sut.createF3IntentBook({ ledger: EMPTY, provenance: { ...PROV, extra: 1 } }),
    { code: "F3_PROVENANCE" },
  );
  assert.throws(() => sut.createF3IntentBook({ ledger: EMPTY, provenance: PROV, x: 1 }), {
    code: "F3_INTENT_OPTIONS",
  });
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(book);
  assert.deepEqual(book.provenance(), PROV);
  const fromBook = sut.blockedF3Report({ code: "F3_X", catalogue, book });
  assert.deepEqual(fromBook.provenance, PROV);
  assert.equal(sut.validateF3Report(fromBook, catalogue, { ledger: EMPTY }), true);
  assert.throws(
    () =>
      sut.blockedF3Report({
        code: "F3_X",
        catalogue,
        book,
        provenance: { ...PROV, harnessSha: "c".repeat(40) },
      }),
    { code: "F3_REPORT" },
  );
  // Relatório com eventos e proveniência nula não valida, nem BLOCKED.
  const tampered = structuredClone(fromBook);
  tampered.provenance.harnessSha = null;
  tampered.cases.forEach((r) => (r.harnessSha = null));
  assert.throws(() => sut.validateF3Report(tampered, catalogue, { ledger: EMPTY }), {
    code: "F3_REPORT",
  });
  // Sem eventos, o BLOCKED com proveniência nula continua válido (falha antes do livro).
  const early = sut.blockedF3Report({
    code: "F3_X",
    catalogue,
    ledger: EMPTY,
    provenance: { ...PROV, harnessSha: null },
  });
  assert.equal(sut.validateF3Report(early, catalogue, { ledger: EMPTY }), true);
});

test("F3 B2b2a RED (M3): execução do ledger aponta artefato e revisão, herdados pela entrada", () => {
  const b1 = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(b1);
  const r1 = run(1, b1);
  assert.ok(ledgerOf([r1]));
  for (const bad of [
    { artifactId: undefined },
    { artifactId: null },
    { artifactId: "0" },
    { sha256: "D".repeat(64) },
    { sha256: "d".repeat(63) },
    { reviewId: "" },
  ]) {
    const r = { ...r1, ...bad };
    for (const k of Object.keys(bad)) if (bad[k] === undefined) delete r[k];
    assert.throws(() => ledgerOf([r]), { code: "F3_LEDGER" }, JSON.stringify(bad));
  }
  const c0 = catalogue.cases[0];
  const entry = (extra = {}) => ({
    caseId: c0.caseId,
    status: "PASS",
    ...PROV,
    workflowRunId: "1",
    requestId: null,
    entityIds: [],
    artifactId: r1.artifactId,
    sha256: r1.sha256,
    reviewId: r1.reviewId,
    ...extra,
  });
  assert.ok(ledgerOf([r1], [entry()]));
  for (const bad of [{ artifactId: "77" }, { sha256: "f".repeat(64) }, { reviewId: "88" }])
    assert.throws(() => ledgerOf([r1], [entry(bad)]), { code: "F3_LEDGER" });
});

test("F3 B2b2a RED: entidade fora da F3, repetida ou de pré-requisito não isolada encerra", () => {
  // Pré-requisito real do levantamento (V108, proposta), sobre o contrato do inventário.
  const withContract = (b) => {
    seal(b, 5, 5);
    ok(b, 5, entity(5));
    seal(b, 7, 7);
    ok(b, 7, entity(7));
  };
  const proposta = (b) => seal(b, 6, 9, { kind: "prerequisito", action: "proposta" });
  const clean = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(clean);
  withContract(clean);
  proposta(clean);
  ok(clean, 6, uuid(606));
  assert.equal(clean.assertIsolation(), true);
  const cases = [
    (b) => {
      seal(b, 5, 5);
      b.confirm(uuid(5), { entityId: uuid(505), organizationId: sut.F3_E87_ORG });
    },
    (b) => {
      withContract(b);
      proposta(b);
      b.confirm(uuid(6), { entityId: uuid(505), organizationId: uuid(77) });
    },
    (b) => {
      withContract(b);
      proposta(b);
      b.confirm(uuid(6), { entityId: F3, organizationId: F3 });
    },
  ];
  // Repetida numa principal reprova o gate pelo recibo, mas não encerra a execução.
  const repeated = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  createOrg(repeated);
  seal(repeated, 5, 5);
  repeated.confirm(uuid(5), { entityId: F3, organizationId: F3 });
  assert.equal(repeated.created()[1].kind, "entidade_repetida");
  assert.equal(repeated.assertIsolation(), true);
  for (const breach of cases) {
    const b = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
    createOrg(b);
    breach(b);
    assert.throws(() => b.assertIsolation(), { code: "F3_ISOLATION_BREACH" });
    // O fato continua no inventário do relatório parcial.
    const report = sut.blockedF3Report({ code: "F3_ISOLATION_BREACH", catalogue, book: b });
    assert.equal(report.isolation.created.length, b.created().length);
    assert.ok(["fora_da_f3", "entidade_repetida"].includes(report.isolation.created.at(-1).kind));
    assert.equal(sut.validateF3Report(report, catalogue, { ledger: EMPTY }), true);
  }
});

test("F3 B2b2a RED: runF3Session leva o livro ao relatório parcial e confere o isolamento", async () => {
  // Driver que muta e falha: o relatório carrega envios, eventos e inventário.
  const failing = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    drive: async (book) => {
      createOrg(book);
      seal(book, 5, 5);
      throw Object.assign(new Error("x"), { code: "F3_DRIVER_X" });
    },
  });
  assert.equal(failing.code, "F3_DRIVER_X");
  assert.equal(failing.report.intents.sent, 2);
  // seal, bind e confirm da organização; seal e bind do V102.
  assert.equal(failing.report.intents.events.length, 5);
  assert.deepEqual(failing.report.provenance, PROV);
  assert.equal(sut.validateF3Report(failing.report, catalogue, { ledger: EMPTY }), true);
  // Conferência final de isolamento depois do driver.
  const breach = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    drive: async (book) => {
      createOrg(book);
      seal(book, 5, 5);
      book.confirm(uuid(5), { entityId: uuid(505), organizationId: sut.F3_E87_ORG });
    },
  });
  assert.equal(breach.code, "F3_ISOLATION_BREACH");
  // Proveniência incompleta: sem livro, nenhum evento, código próprio.
  const noProv = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: { ...PROV, deploymentId: null },
    drive: async () => assert.fail("driver não pode rodar sem livro"),
  });
  assert.equal(noProv.code, "F3_PROVENANCE");
  assert.equal(noProv.report.intents.events.length, 0);
  assert.equal(sut.validateF3Report(noProv.report, catalogue, { ledger: EMPTY }), true);
  // Driver de produção ainda pendente.
  const pending = await sut.runF3Session({ catalogue, ledger: EMPTY, provenance: PROV });
  assert.equal(pending.code, "F3_DRIVER_PENDING");
});

// Cerca: só URLs reais da API, contra o requestAllowed verdadeiro do auditor. Relógio e ID são
// os de produção, substituídos só por mock nos testes.
const API = "https://gklhhhyosgasnyoxlrui.supabase.co";
const RPC = (name) => API + "/rest/v1/rpc/" + name;
// Corpo do SYS04 na ordem do produto (criarOrganizacaoDados.ts:35-40).
const ORG_BODY = Object.freeze({
  p_razao_social: "ContaOS F3 Sintética",
  p_timezone: "America/Sao_Paulo",
  p_cnpj: "11222333000181",
});
let tick = 0;
const req = (extra = {}) => ({
  url: RPC("criar_organizacao"),
  method: "POST",
  resourceType: "Fetch",
  postData: JSON.stringify(ORG_BODY),
  stage: "REQUEST",
  interceptionId: "i" + ++tick,
  sessionId: "s1",
  ...extra,
});
const respond = (r) => ({ ...r, stage: "RESPONSE" });
function fenceWith(t, setup = () => {}) {
  const clock = { t: 0 };
  let n = 0;
  t.mock.method(performance, "now", () => clock.t);
  t.mock.method(globalThis.crypto, "randomUUID", () => uuid(7000 + ++n));
  const book = sut.createF3IntentBook({ provenance: PROV, ledger: EMPTY });
  setup(book);
  return { book, fence: sut.createF3MutationFence({ book }), clock };
}
const armOrg = (f, body = ORG_BODY) => f.fence.arm({ flow: "2:principal", bodies: [body] });
const orgOk = (b) => createOrg(b);
const shuffle = (o) =>
  Object.fromEntries(
    Object.entries(o)
      .reverse()
      .map(([k, v]) => [k, v && typeof v === "object" && !Array.isArray(v) ? shuffle(v) : v]),
  );

test("F3 B2b2a RED: cerca só aceita opções de produção e um livro do módulo", (t) => {
  const f = fenceWith(t);
  for (const extra of [{ readPolicy: () => true }, { now: () => 0 }, { newId: () => uuid(1) }])
    assert.throws(() => sut.createF3MutationFence({ book: f.book, ...extra }), {
      code: "F3_FENCE_OPTIONS",
    });
  assert.throws(() => sut.createF3MutationFence({ book: {} }), { code: "F3_FENCE_BOOK" });
});

test("F3 B2b2a RED: leitura vai à allowlist real; GET, HEAD e OPTIONS nunca são mutação", (t) => {
  const f = fenceWith(t, orgOk);
  // Leitura de tabela de fluxo (contratantes) passa e não congela, mesmo com a cerca ociosa.
  const list = req({
    url: API + "/rest/v1/contratantes?select=id%2Crazao_social",
    method: "GET",
    postData: undefined,
  });
  assert.equal(f.fence.policy(list), true);
  assert.equal(f.fence.policy(respond(list)), true);
  assert.equal(f.fence.policy({ ...list, method: "HEAD", interceptionId: "h" }), true);
  assert.equal(f.fence.policy({ ...list, method: "OPTIONS", interceptionId: "o" }), true);
  // RPC de leitura da allowlist passa; RPC desconhecida é recusada sem congelar.
  const read = req({ url: RPC("listar_organizacoes_disponiveis"), postData: "{}" });
  assert.equal(f.fence.policy(read), true);
  assert.equal(f.fence.policy(req({ url: RPC("rpc_inexistente"), postData: "{}" })), false);
  // Origem alheia é recusada pela allowlist sem congelar.
  assert.equal(f.fence.policy(req({ url: "https://x.test/a", method: "GET" })), false);
  assert.equal(f.fence.frozen(), false);
  // Mutação de produtor sem fluxo, em tabela, Storage ou URL malformada: mutação sem intenção.
  for (const m of [
    req({ url: API + "/rest/v1/contratos", postData: "{}" }),
    req({ url: API + "/rest/v1/contratantes?id=eq.1", method: "PATCH", postData: "{}" }),
    req({ url: API + "/rest/v1/contratantes?id=eq.1", method: "DELETE" }),
    req({ url: API + "/storage/v1/object/upload/sign/b/x?token=t", method: "PUT" }),
    req({ url: "https://gklhhhyosgasnyoxlrui.storage.supabase.co/storage/v1/upload/resumable" }),
    req({ url: API + "//rest/v1/rpc/criar_organizacao" }),
  ]) {
    assert.equal(sut.isF3Mutation(m), true, m.url + " " + m.method);
    const g = fenceWith(t, orgOk);
    assert.equal(g.fence.policy(m), false, m.url);
    assert.equal(g.fence.frozen(), true, m.url);
  }
  // RPC sem fluxo declarado ou com nome malformado não é de fluxo: a allowlist real a recusa, e
  // a cerca nativa encerra o contexto em qualquer recusa.
  for (const m of [
    req({ url: RPC("alterar_situacao_contrato_v1"), postData: "{}" }),
    req({ url: API + "/rest/v1/rpc/criar_organizacao/" }),
  ]) {
    assert.equal(sut.isF3Mutation(m), false, m.url);
    assert.equal(fenceWith(t, orgOk).fence.policy(m), false, m.url);
  }
});

test("F3 B2b2a RED: intenção armada sai uma vez, selada antes, com preflight sem selo", (t) => {
  const f = fenceWith(t);
  const id = armOrg(f);
  assert.equal(id, uuid(7001));
  assert.throws(() => f.book.state(id), { code: "F3_INTENT_UNKNOWN" });
  assert.throws(() => armOrg(f), { code: "F3_FENCE_PENDING" });
  // Preflight do passo armado passa sem selo; preflight de outro passo, não.
  const pre = req({ method: "OPTIONS", postData: undefined });
  assert.equal(f.fence.policy(pre), true);
  assert.equal(f.fence.policy(respond(pre)), true);
  assert.equal(
    f.fence.policy(req({ url: RPC("salvar_vinculo_usuario_adm"), method: "OPTIONS" })),
    false,
  );
  assert.equal(f.book.summary().sent, 0);
  // Corpo em outra ordem de chaves é o mesmo corpo.
  const send = req({ postData: JSON.stringify(shuffle(ORG_BODY)) });
  assert.equal(f.fence.policy(send), true);
  assert.equal(f.book.state(id), "sealed");
  assert.equal(f.book.summary().sent, 1);
  assert.equal(f.fence.policy(respond(send)), true);
  // Repetição depois do fim do fluxo: bloqueia e congela.
  assert.equal(f.fence.policy(req()), false);
  assert.deepEqual(f.fence.settle(), { requestId: id, sealed: true, complete: true, slots: {} });
  assert.equal(f.book.summary().sent, 1);
  // Requisição atrasada depois do settle, idêntica: nenhuma intenção a admite.
  const late = fenceWith(t);
  armOrg(late);
  assert.equal(late.fence.policy(req()), true);
  late.fence.settle();
  assert.equal(late.fence.policy(req()), false);
  assert.equal(late.book.summary().sent, 1);
});

test("F3 B2b2a RED: desvio de corpo, método, URL, ticket, prazo ou resposta bloqueia", (t) => {
  const variants = [
    req({ postData: JSON.stringify({ ...ORG_BODY, p_nome_fantasia: "x" }) }),
    req({ postData: JSON.stringify({ ...ORG_BODY, p_razao_social: "outra" }) }),
    req({ postData: JSON.stringify({ ...ORG_BODY, p_cnpj: 11222333000181 }) }),
    req({ postData: "{" }),
    req({ postData: undefined }),
    req({ method: "PATCH" }),
    req({ method: "PUT" }),
    req({ url: RPC("criar_organizacao") + "?x=1" }),
    req({ interceptionId: undefined }),
    req({ stage: "OTHER" }),
  ];
  for (const [i, v] of variants.entries()) {
    const f = fenceWith(t);
    armOrg(f);
    assert.equal(f.fence.policy(v), false, "variante " + i);
    assert.equal(f.book.summary().sent, 0, "variante " + i);
    assert.equal(f.fence.settle().sealed, false);
  }
  const late = fenceWith(t);
  armOrg(late);
  late.clock.t = sut.F3_FENCE_WINDOW_MS;
  assert.equal(late.fence.policy(req()), false);
  assert.equal(late.book.summary().sent, 0);
  // Resposta com ticket de outra URL ou corpo divergente congela.
  const resp = fenceWith(t);
  armOrg(resp);
  const sent = req();
  assert.equal(resp.fence.policy(sent), true);
  assert.equal(
    resp.fence.policy(respond({ ...sent, postData: JSON.stringify({ ...ORG_BODY, x: 1 }) })),
    false,
  );
  assert.equal(resp.fence.frozen(), true);
  // Ticket reaproveitado no estágio REQUEST congela.
  const dupTicket = fenceWith(t);
  armOrg(dupTicket);
  const first = req();
  assert.equal(dupTicket.fence.policy(first), true);
  assert.equal(dupTicket.fence.policy(first), false);
});

test("F3 B2b2a RED: arm valida pela regra do livro, por inteiro e por isolamento", (t) => {
  const f = fenceWith(t);
  // Antes da organização, só a principal do SYS04.
  for (const bad of [
    { flow: "2:principal", bodies: [ORG_BODY], kind: "prerequisito" },
    { flow: "2:principal", bodies: [ORG_BODY], kind: "duplicidade" },
    { flow: "2:principal", bodies: [ORG_BODY], kind: "x" },
    { flow: "5:principal", bodies: [{}] },
  ])
    assert.throws(
      () => f.fence.arm(bad),
      (e) => /^F3_/.test(e.code),
      JSON.stringify(bad),
    );
  for (const flow of ["2", "__proto__", "constructor", "99:principal", "5:x", 2, null])
    assert.throws(() => f.fence.arm({ flow, bodies: [ORG_BODY] }), {
      code: "F3_FLOW_UNDEFINED",
    });
  assert.throws(() => f.fence.arm({ flow: "2:principal", bodies: [] }), { code: "F3_FENCE_ARM" });
  assert.throws(() => f.fence.arm({ flow: "2:principal", bodies: [ORG_BODY], extra: 1 }), {
    code: "F3_FENCE_ARM",
  });
  assert.throws(
    () => f.fence.arm({ flow: "2:principal", bodies: [new Proxy({ ...ORG_BODY }, {})] }),
    { code: "F3_FENCE_ARM" },
  );
  assert.throws(() => f.fence.arm({ flow: "2:principal", bodies: [ORG_BODY], from: 0 }), {
    code: "F3_FENCE_ARM",
  });
  assert.throws(() => f.fence.settle(), { code: "F3_FENCE_IDLE" });
  assert.equal(f.book.summary().sent, 0);
  // Organização já existe: a segunda principal do SYS04 é recusada ao armar, não no clique.
  const twice = fenceWith(t, orgOk);
  assert.throws(() => armOrg(twice), { code: "F3_INTENT_PRODUCER" });
  assert.equal(twice.fence.frozen(), false);
  // Violação de isolamento anterior impede armar qualquer intenção nova.
  const breach = fenceWith(t, (b) => {
    createOrg(b);
    seal(b, 5, 5);
    b.confirm(uuid(5), { entityId: uuid(505), organizationId: sut.F3_E87_ORG });
  });
  assert.throws(() => breach.fence.arm({ flow: "5:principal", bodies: [{ id_organizacao: F3 }] }), {
    code: "F3_ISOLATION_BREACH",
  });
});

// V106 na ordem do produto (cadastroOperacionalDados.ts:210-215): p_request_id é a 4ª chave.
const v106 = (contrato, chave, motivo = "Ajuste sintético F3") => ({
  p_id_organizacao: F3,
  p_versao_esperada: 3,
  p_motivo: motivo,
  p_request_id: chave,
  p_id_contrato: contrato,
  p_alteracoes: { objeto: "Objeto F3", valor_total: 10 },
});
const withContract = (b) => {
  createOrg(b);
  seal(b, 5, 5);
  ok(b, 5, uuid(105));
  seal(b, 7, 7);
  ok(b, 7, uuid(107));
};
const K = sut.f3Slot("uuid", "chave");
const V106_URL = RPC("atualizar_contrato_v1");
const lastBind = (book) =>
  book
    .summary()
    .events.filter((e) => e.op === "bind")
    .at(-1);

test("F3 B2b2a R3 RED (A): origem tipada por posição; vaga só em gerado_ui ou capturado, UUID só do inventário da ação declarada", (t) => {
  const f = fenceWith(t, withContract);
  const id = f.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] });
  const body = shuffle(v106(uuid(107), uuid(4242)));
  assert.equal(f.fence.policy(req({ url: V106_URL, postData: JSON.stringify(body) })), true);
  assert.deepEqual(f.fence.settle(), {
    requestId: id,
    sealed: true,
    complete: true,
    slots: { chave: uuid(4242) },
  });
  // O vínculo registra só UUIDs das posições declaradas e o SHA-256 do corpo canônico.
  const b = lastBind(f.book);
  assert.deepEqual(b.values.map((v) => v.position).sort(), [
    "p_id_contrato",
    "p_id_organizacao",
    "p_request_id",
  ]);
  assert.match(b.bodySha256, /^[0-9a-f]{64}$/);
  // Vaga com valor que não é UUID bloqueia, sem selar.
  const bad = fenceWith(t, withContract);
  bad.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] });
  assert.equal(
    bad.fence.policy(req({ url: V106_URL, postData: JSON.stringify(v106(uuid(107), "x")) })),
    false,
  );
  assert.equal(bad.book.summary().sent, 3);
  // Recusas ao armar, cada uma isolada.
  const arm = (body) => () =>
    fenceWith(t, withContract).fence.arm({ flow: "8:principal", bodies: [body] });
  assert.ok(
    fenceWith(t, withContract).fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] }),
  );
  assert.throws(arm({ ...v106(uuid(107), K), p_motivo: sut.f3Slot("uuid", "m") }), {
    code: "F3_FENCE_ARM",
  });
  assert.throws(arm(v106(uuid(107), sut.f3Slot("path", "p"))), { code: "F3_FENCE_ARM" });
  // gerado_ui é sempre vaga: UUID literal na posição da chave é recusado.
  assert.throws(arm(v106(uuid(107), uuid(1))), { code: "F3_FENCE_ARM" });
  // UUID em posição não declarada, inteiro, embutido em texto ou em lista: recusado.
  for (const alt of [
    { ref: sut.F3_E87_ORG },
    { ref: "x-" + uuid(107) },
    { lista: [{ id: uuid(998) }] },
  ])
    assert.throws(arm({ ...v106(uuid(107), K), p_alteracoes: alt }), { code: "F3_VALUE_ORIGIN" });
  // Inventário: entidade desconhecida, a e87f7e68, ou entidade de outra ação (o contratante de
  // V102 no lugar do contrato de V105, o contrato no lugar da organização).
  for (const [k, v] of [
    ["p_id_contrato", uuid(999)],
    ["p_id_contrato", sut.F3_E87_ORG],
    ["p_id_contrato", uuid(105)],
    ["p_id_organizacao", uuid(107)],
    ["p_id_organizacao", sut.F3_E87_ORG],
  ])
    assert.throws(arm({ ...v106(uuid(107), K), [k]: v }), { code: "F3_VALUE_ORIGIN" }, k + v);
  // gerado_ui ao sair: valor novo. Entidade conhecida, a organização, a e87 ou chave já usada
  // por outra intenção bloqueiam sem selar.
  for (const v of [uuid(107), F3, sut.F3_E87_ORG, uuid(4242)]) {
    const g = fenceWith(t, (bk) => {
      withContract(bk);
      seal(bk, 8, 8);
      bk.rejected(uuid(8));
    });
    const used = BINDS.get(uuid(8))[0].values.find((x) => x.position === "p_request_id").value;
    const value = v === uuid(4242) ? used : v;
    g.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] });
    const before = g.book.summary().sent;
    assert.equal(
      g.fence.policy(req({ url: V106_URL, postData: JSON.stringify(v106(uuid(107), value)) })),
      false,
      v,
    );
    assert.equal(g.book.summary().sent, before);
    assert.equal(g.fence.frozen(), true);
  }
  assert.throws(() => sut.f3Slot("uuid", "Nome Invalido"), { code: "F3_FENCE_ARM" });
});

test("F3 B2b2a R3 RED (A): ADM01 em dois passos com o 2º usuário capturado; variante sem convite só com o mesmo usuário; V102 em tabela", (t) => {
  const edge = {
    id_organizacao: F3,
    email: "leitor@example.test",
    chave_idempotencia: sut.f3Slot("uuid", "convite"),
  };
  const save = (usuario = sut.f3Slot("uuid", "usuario")) => ({
    p_id_organizacao: F3,
    p_id_usuario: usuario,
    p_email: "leitor@example.test",
    p_perfil: "leitor",
    p_escopo_todos_contratos: true,
    p_ativo: true,
    p_ids_contratos_ativar: [],
    p_ids_contratos_revogar: [],
    p_versao_esperada: null,
    p_chave_idempotencia: sut.f3Slot("uuid", "vinculo"),
  });
  const saveReq = (usuario, chave = uuid(32)) =>
    req({
      url: RPC("salvar_vinculo_usuario_adm"),
      postData: JSON.stringify({ ...save(), p_id_usuario: usuario, p_chave_idempotencia: chave }),
    });
  const edgeReq = req({
    url: API + "/functions/v1/admin-invite-user",
    postData: JSON.stringify({ ...edge, chave_idempotencia: uuid(30) }),
  });
  // Fora de ordem: o segundo passo antes do primeiro bloqueia.
  const early = fenceWith(t, orgOk);
  early.fence.arm({ flow: "4:principal", bodies: [edge, save()] });
  assert.equal(early.fence.policy(saveReq(uuid(31))), false);
  assert.equal(early.book.summary().sent, 1);
  const f = fenceWith(t, orgOk);
  const id = f.fence.arm({ flow: "4:principal", bodies: [edge, save()] });
  assert.equal(f.fence.policy(edgeReq), true);
  assert.equal(f.book.state(id), "sealed");
  assert.equal(f.fence.policy(saveReq(uuid(31))), true);
  assert.equal(f.book.summary().sent, 2);
  assert.deepEqual(f.fence.settle(), {
    requestId: id,
    sealed: true,
    complete: true,
    slots: { convite: uuid(30), usuario: uuid(31), vinculo: uuid(32) },
  });
  // Variante sem convite (levantamento, seção 3): só com o 2º usuário capturado no ADM01.
  f.book.rejected(id);
  assert.throws(() => f.fence.arm({ flow: "4:sem_convite", bodies: [save(uuid(39))] }), {
    code: "F3_VALUE_ORIGIN",
  });
  f.fence.arm({ flow: "4:sem_convite", bodies: [save(uuid(31))] });
  assert.equal(f.fence.policy(saveReq(uuid(31), uuid(33))), true);
  f.fence.settle();
  // Sem ADM01 anterior, a variante não tem usuário sintético a aceitar.
  assert.throws(
    () => fenceWith(t, orgOk).fence.arm({ flow: "4:sem_convite", bodies: [save(uuid(31))] }),
    { code: "F3_VALUE_ORIGIN" },
  );
  // Capturado ao sair: a organização no lugar do usuário bloqueia.
  const org = fenceWith(t, orgOk);
  org.fence.arm({ flow: "4:principal", bodies: [edge, save()] });
  assert.equal(org.fence.policy(edgeReq), true);
  assert.equal(org.fence.policy(saveReq(F3)), false);
  // Interrompido depois do primeiro passo: selado, incompleto, e não confirma.
  const half = fenceWith(t, orgOk);
  const hid = half.fence.arm({ flow: "4:principal", bodies: [edge, save()] });
  assert.equal(half.fence.policy(edgeReq), true);
  assert.deepEqual(
    [half.fence.settle()].map((x) => [x.sealed, x.complete]),
    [[true, false]],
  );
  assert.throws(() => half.book.confirm(hid, { entityId: uuid(41), organizationId: F3 }), {
    code: "F3_INTENT_BIND",
  });
  // V102: POST na tabela com a query exata do cliente; outra query ou PATCH bloqueia.
  const v102 = { id_organizacao: F3, tipo_pessoa: "juridica", razao_social: "Contratante F3" };
  const url = API + "/rest/v1/contratantes?select=id%2Crazao_social%2Csituacao";
  const good = fenceWith(t, orgOk);
  good.fence.arm({ flow: "5:principal", bodies: [v102] });
  assert.equal(good.fence.policy(req({ url, postData: JSON.stringify(shuffle(v102)) })), true);
  for (const bad of [
    req({ url: API + "/rest/v1/contratantes", postData: JSON.stringify(v102) }),
    req({ url, method: "PATCH", postData: JSON.stringify(v102) }),
  ]) {
    const g = fenceWith(t, orgOk);
    g.fence.arm({ flow: "5:principal", bodies: [v102] });
    assert.equal(g.fence.policy(bad), false);
  }
});

test("F3 B2b2a R3 RED (B): reenvio só idêntico ao original (vinculado); chave nova, corpo novo ou produtor sem chave são recusados", (t) => {
  const sent = (f, chave, motivo) =>
    f.fence.policy(
      req({ url: V106_URL, postData: JSON.stringify(v106(uuid(107), chave, motivo)) }),
    );
  const setup = (t) => {
    const f = fenceWith(t, withContract);
    const id = f.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] });
    assert.equal(sent(f, uuid(4242)), true);
    f.fence.settle();
    f.book.uncertain(id);
    return { f, id };
  };
  const { f, id } = setup(t);
  // Sem readback, o reenvio é recusado ao armar.
  assert.throws(
    () => f.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)], resendOf: id }),
    { code: "F3_UNCERTAIN_RESEND" },
  );
  f.book.reconcile(id, { found: false });
  assert.throws(
    () =>
      f.fence.arm({
        flow: "8:principal",
        bodies: [v106(uuid(107), K)],
        resendOf: id,
        kind: "principal",
      }),
    { code: "F3_FENCE_ARM" },
  );
  assert.throws(
    () => f.fence.arm({ flow: "5:principal", bodies: [{ id_organizacao: F3 }], resendOf: id }),
    { code: "F3_INTENT_PRODUCER" },
  );
  assert.equal(
    f.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)], resendOf: id }),
    id,
  );
  assert.equal(sent(f, uuid(4242)), true);
  assert.equal(f.book.state(id), "sealed");
  assert.equal(f.book.summary().requests.find((q) => q.requestId === id).sends, 2);
  f.fence.settle();
  // Chave nova ou corpo diferente no reenvio: bloqueia sem contar envio.
  for (const [chave, motivo] of [
    [uuid(4243), undefined],
    [uuid(4242), "outro motivo"],
  ]) {
    const g = setup(t);
    g.f.book.reconcile(g.id, { found: false });
    g.f.fence.arm({
      flow: "8:principal",
      bodies: [v106(uuid(107), K, motivo)],
      resendOf: g.id,
    });
    const before = g.f.book.summary().sent;
    assert.equal(sent(g.f, chave, motivo), false);
    assert.equal(g.f.book.summary().sent, before);
    assert.equal(g.f.fence.frozen(), true);
  }
  // Sem chave (SYS04, V102, ...): reenvio proibido ao armar, só releitura.
  const org = fenceWith(t);
  const oid = armOrg(org);
  assert.equal(org.fence.policy(req()), true);
  org.fence.settle();
  org.book.uncertain(oid);
  org.book.reconcile(oid, { found: false });
  assert.throws(() => org.fence.arm({ flow: "2:principal", bodies: [ORG_BODY], resendOf: oid }), {
    code: "F3_UNCERTAIN_RESEND",
  });
});

// V110 (levantamento, seção 2): upload simples (Edge, Storage e confirmação) e o RPC consumidor.
const FILE = Object.freeze({ nome: "f3-sintetico.txt", tamanho: 12, sha: "a".repeat(64) });
const V110_BODIES = () => [
  {
    id_organizacao: F3,
    id_contrato: uuid(107),
    nome_arquivo: FILE.nome,
    mime: "text/plain",
    tamanho: FILE.tamanho,
  },
  { path: sut.f3Slot("path", "caminho") },
  {
    p_id_organizacao: F3,
    p_id_contrato: uuid(107),
    p_path: sut.f3Slot("path", "caminho"),
    p_nome_original: FILE.nome,
    p_mime: "text/plain",
    p_tamanho: FILE.tamanho,
    p_sha256: FILE.sha,
    p_origem: "upload_usuario",
  },
  {
    p_id_contrato: uuid(107),
    p_tipo: "outro",
    p_titulo: "Documento F3",
    p_categoria: null,
    p_vigencia_inicio: null,
    p_vigencia_fim: null,
    p_observacoes: null,
    p_id_arquivo: sut.f3Slot("uuid", "arquivo"),
    p_chave_idempotencia: sut.f3Slot("uuid", "k"),
  },
];
const V110_REQS = (org = F3, arquivo = uuid(55), chave = uuid(56)) => {
  const path = org + "/uploads/" + uuid(54) + "/" + FILE.nome;
  const [b1, , b3, b4] = V110_BODIES();
  return [
    req({ url: API + "/functions/v1/storage-sign-upload", postData: JSON.stringify(b1) }),
    req({
      url: API + "/storage/v1/object/upload/sign/contaos-documentos/" + path + "?token=tok",
      method: "PUT",
      postData: undefined,
    }),
    req({
      url: RPC("confirmar_upload_arquivo"),
      postData: JSON.stringify({ ...b3, p_path: path }),
    }),
    req({
      url: RPC("criar_documento_contrato_completo"),
      postData: JSON.stringify({ ...b4, p_id_arquivo: arquivo, p_chave_idempotencia: chave }),
    }),
  ];
};

test("F3 B2b2a R3 RED: upload dentro da ação, caminho só da organização F3, TUS bloqueado e reenvio só do RPC", async (t) => {
  const f = fenceWith(t, withContract);
  const id = f.fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
  const before = f.book.summary().sent;
  for (const r of V110_REQS()) assert.equal(f.fence.policy(r), true, r.url);
  // Três requisições de upload e o RPC consumidor: uma única intenção, quatro vínculos.
  assert.equal(f.book.summary().sent, before + 1);
  assert.equal(
    f.book.summary().events.filter((e) => e.op === "bind" && e.requestId === id).length,
    4,
  );
  assert.equal(f.fence.settle().complete, true);
  // Confirmação com os papéis declarados (versão e arquivo, nessa ordem).
  assert.throws(() => f.book.confirm(id, { entityId: uuid(61), organizationId: F3 }), {
    code: "F3_INTENT_ENTITY",
  });
  f.book.confirm(id, {
    entityId: uuid(61),
    organizationId: F3,
    related: [
      { role: "versao", entityId: uuid(62) },
      { role: "arquivo", entityId: uuid(55) },
    ],
  });
  assert.deepEqual(
    f.book
      .created()
      .filter((c) => c.requestId === id)
      .map((c) => [c.role, c.kind]),
    [
      ["principal", "registro"],
      ["versao", "registro"],
      ["arquivo", "registro"],
    ],
  );
  // Upload sem o RPC consumidor não fecha a intenção.
  const half = fenceWith(t, withContract);
  const hid = half.fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
  for (const r of V110_REQS().slice(0, 3)) assert.equal(half.fence.policy(r), true);
  assert.equal(half.fence.settle().complete, false);
  assert.throws(() => half.book.confirm(hid, { entityId: uuid(61), organizationId: F3 }), {
    code: "F3_INTENT_BIND",
  });
  // Caminho do Storage de outra organização bloqueia.
  const other = fenceWith(t, withContract);
  other.fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
  const reqs = V110_REQS(uuid(999));
  assert.equal(other.fence.policy(reqs[0]), true);
  assert.equal(other.fence.policy(reqs[1]), false);
  assert.equal(other.fence.frozen(), true);
  // Reenvio: só a partir do RPC (upload retomável), com o mesmo arquivo e a mesma chave.
  half.book.uncertain(hid);
  half.book.reconcile(hid, { found: false });
  assert.throws(
    () => half.fence.arm({ flow: "12:principal", bodies: V110_BODIES(), resendOf: hid }),
    { code: "F3_UNCERTAIN_RESEND" },
  );
  const ret = fenceWith(t, withContract);
  const rid = ret.fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
  for (const r of V110_REQS()) assert.equal(ret.fence.policy(r), true);
  ret.fence.settle();
  ret.book.uncertain(rid);
  ret.book.reconcile(rid, { found: false });
  ret.fence.arm({ flow: "12:principal", from: 3, bodies: [V110_BODIES()[3]], resendOf: rid });
  assert.equal(ret.fence.policy(V110_REQS()[3]), true);
  assert.equal(ret.fence.settle().complete, true);
  // Envio resumível (TUS): a cerca bloqueia e a sessão encerra com a causa própria.
  const session = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    drive: async (book) => {
      withContract(book);
      const fence = sut.createF3MutationFence({ book });
      fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
      const tus = req({
        url: "https://gklhhhyosgasnyoxlrui.storage.supabase.co/storage/v1/upload/resumable",
        postData: undefined,
      });
      assert.equal(fence.policy(tus), false);
      throw Object.assign(new Error("x"), { code: "F3_DRIVER_X" });
    },
  });
  assert.equal(session.code, "F3_UPLOAD_RESUMABLE");
});

test("F3 B2b2a: propriedade da cerca, semente fixa: ordem de chaves e leituras não mudam nada; origem errada nunca sai", (t) => {
  let seed = 0x2b2a5eed;
  const rnd = (n) => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return (seed >>> 16) % n;
  };
  const reads = [
    () => req({ url: API + "/rest/v1/contratos?select=id", method: "GET", postData: undefined }),
    () => req({ url: API + "/rest/v1/contratantes", method: "HEAD", postData: undefined }),
    () => req({ url: RPC("listar_organizacoes_disponiveis"), postData: "{}" }),
    () => req({ url: RPC("listar_organizacoes_disponiveis"), method: "OPTIONS" }),
  ];
  let accepted = 0,
    blocked = 0;
  for (let k = 0; k < 300; k++) {
    const f = fenceWith(t, withContract);
    f.fence.arm({ flow: "8:principal", bodies: [v106(uuid(107), K)] });
    const n = 1 + rnd(6);
    let sent = 0;
    for (let i = 0; i < n; i++) {
      const read = reads[rnd(reads.length)]();
      assert.equal(f.fence.policy(read), true);
      assert.equal(f.fence.policy(respond(read)), true);
    }
    // 0: literal diferente; 1: chave que é entidade conhecida; 2: e87 na chave; resto: válido.
    const mutate = rnd(6);
    const chave = mutate === 1 ? uuid(105) : mutate === 2 ? sut.F3_E87_ORG : uuid(5000 + k);
    let body = {
      ...v106(uuid(107), chave),
      p_motivo: mutate === 0 ? "outro" : "Ajuste sintético F3",
    };
    for (let s = rnd(4); s > 0; s--) body = shuffle(body);
    const out = f.fence.policy(req({ url: V106_URL, postData: JSON.stringify(body) }));
    // Invariantes: aceito ⇔ corpo igual ao armado e origem válida; aceito ⇒ selado e vinculado;
    // leitura nunca congela.
    assert.equal(out, mutate > 2);
    if (out) {
      accepted++;
      sent = 1;
      assert.equal(f.book.summary().requests.at(-1).outcome, "sealed");
      assert.equal(lastBind(f.book).values.find((v) => v.position === "p_request_id").value, chave);
    } else blocked++;
    assert.equal(f.book.summary().sent, 3 + sent);
    assert.equal(f.fence.frozen(), !out);
  }
  assert.ok(accepted > 100 && blocked > 80, [accepted, blocked].join());
});

test("F3 B2b2a R3 RED (NR-008): cada fluxo declarado tem uma linha do levantamento e cada linha tem fluxo, com fonte que existe no código", async () => {
  // Barreira do NR-008 (PLAN §12.6 e §12.7): a cerca nasce do levantamento campo a campo, nunca
  // antes dele. Um fluxo sem linha, ou uma linha sem fluxo, reprova.
  const md = await readFile(new URL(sut.F3_LEVANTAMENTO_PATH, root), "utf8");
  const sec = md.slice(md.indexOf("## 3."), md.indexOf("## 4."));
  const rows = [...sec.matchAll(/^\| (\d+ [A-Z0-9]+, [^|]+?) \|/gm)].map((m) => m[1]);
  assert.equal(new Set(rows).size, rows.length);
  const flows = Object.entries(sut.F3_MUTATION_FLOWS);
  assert.deepEqual(flows.map(([, f]) => f.levantamento).sort(), [...rows].sort());
  assert.equal(flows.filter(([, f]) => f.kind === "prerequisito").length, sut.F3_MAX_PREREQUISITES);
  const names = [];
  for (const [key, f] of flows) {
    assert.equal(key, f.order + ":" + f.action);
    assert.ok(sut.F3_MUTATING_ORDERS.includes(f.order), key);
    const p = sut.F3_PRODUCERS.find((x) => x.order === f.order);
    assert.ok(f.levantamento.startsWith(f.order + " " + p.origin + ", "), f.levantamento);
    assert.equal(/pré-requisito/.test(f.levantamento), f.kind === "prerequisito", key);
    assert.ok(Object.isFrozen(f) && Object.isFrozen(f.steps) && Object.isFrozen(f.creates));
    for (const r of [
      f.updates,
      ...f.steps.flatMap((s) => Object.values(s.fields).flatMap((x) => x.from ?? [])),
    ]) {
      if (r === null) continue;
      const [k, role = "principal"] = r.split("/");
      const target = sut.F3_MUTATION_FLOWS[k];
      assert.ok(target, key + " → " + r);
      assert.ok(role === "principal" || target.creates.includes(role), key + " → " + r);
    }
    for (const s of f.steps) {
      const m = /^(src\/[^:]+):(\d+)-(\d+)$/.exec(s.source);
      assert.ok(m, s.source);
      const file = await readFile(new URL("../../" + m[1], import.meta.url), "utf8");
      const excerpt = file
        .split("\n")
        .slice(Number(m[2]) - 1, Number(m[3]))
        .join("\n");
      const anchor =
        s.target === "storage"
          ? "uploadToSignedUrl"
          : s.target === "table"
            ? '"' + s.name + '"'
            : s.name;
      assert.ok(excerpt.includes(anchor), anchor + " em " + s.source);
      for (const [position, spec] of Object.entries(s.fields)) {
        assert.ok(sut.F3_VALUE_ORIGINS.includes(spec.origin), position);
        const top = position.split(/[.[]/)[0];
        // A chave gerada pela UI pode ser acrescentada por um envoltório do mesmo arquivo.
        const where = spec.origin === "gerado_ui" ? file : excerpt;
        assert.ok(
          new RegExp("\\b" + top + "\\b").test(where),
          key + " " + position + " em " + s.source,
        );
      }
      assert.ok(Object.isFrozen(s) && Object.isFrozen(s.fields));
      names.push(s.name);
    }
  }
  assert.ok(names.includes("criar_organizacao") && names.includes("admin-invite-user"));
  // Esperas da emenda (PLAN §12.4): prazos e códigos fixos no módulo.
  assert.deepEqual(
    Object.entries(sut.F3_WAITS).map(([w, x]) => [w, x.minutes, x.prazo, x.falha]),
    [
      ["W1", 8, "F3_WAIT_VERIFICADOR_PRAZO", "F3_WAIT_VERIFICADOR_RECUSA"],
      ["W2", 8, "F3_WAIT_VERIFICADOR_PRAZO", "F3_WAIT_VERIFICADOR_RECUSA"],
      ["W3", 6, "F3_WAIT_ANALISE_PRAZO", "F3_WAIT_ANALISE_FALHA"],
      ["W4", 6, "F3_WAIT_PARECER_PRAZO", "F3_WAIT_PARECER_FALHA"],
      ["W5", 8, "F3_WAIT_PROCESSAMENTO_PRAZO", "F3_WAIT_PROCESSAMENTO_FALHA"],
    ],
  );
});

// ---------------------------------------------------------------------------------------------
// Parecer R2 (HEAD af50cff): grupos C, D, E e G.

test("F3 B2b2a R2 RED (C): uma cerca por livro, congelamento no livro e leitor só leitura", (t) => {
  const f = fenceWith(t);
  assert.throws(() => sut.createF3MutationFence({ book: f.book }), { code: "F3_FENCE_DUPLICATE" });
  armOrg(f);
  assert.equal(f.fence.policy(req({ postData: "{" })), false);
  assert.equal(f.book.frozen(), true);
  // Congelado, o livro não sela nem reenvia por nenhum caminho; fatos ainda entram.
  assert.throws(() => seal(f.book, 2, 2), { code: "F3_FENCE_FROZEN" });
  assert.throws(
    () => f.book.check({ op: "seal", requestId: uuid(9), producerOrder: 2, kind: "principal" }),
    { code: "F3_FENCE_FROZEN" },
  );
  const g = fenceWith(t);
  armOrg(g);
  assert.equal(g.fence.policy(req()), true);
  g.fence.settle();
  g.fence.policy(req({ url: API + "/rest/v1/contratos", postData: "{}" }));
  g.book.confirm(uuid(7001), { entityId: F3, organizationId: F3 });
  assert.equal(g.book.state(uuid(7001)), "confirmed");
  // book.check com chave a mais diverge de seal: recusado.
  const h = fenceWith(t);
  assert.throws(
    () =>
      h.book.check({ op: "seal", requestId: uuid(9), producerOrder: 2, kind: "principal", x: 1 }),
    { code: "F3_INTENT_STATE" },
  );
  // Leitor: leitura passa; qualquer mutação, mesmo de fluxo e corpo exato, é recusada.
  const read = req({ url: API + "/rest/v1/contratos?select=id", method: "GET" });
  assert.equal(sut.f3ReadOnlyPolicy(read), true);
  assert.equal(sut.f3ReadOnlyPolicy({ ...read, stage: "RESPONSE" }), true);
  for (const m of [
    req(),
    req({ url: API + "/rest/v1/contratantes?select=id%2Crazao_social%2Csituacao" }),
    req({ url: API + "/functions/v1/admin-invite-user" }),
    { ...read, stage: "OTHER" },
    null,
  ])
    assert.equal(sut.f3ReadOnlyPolicy(m), false);
});

test("F3 B2b2a R2 RED (C): desvio da cerca encerra a sessão com F3_FENCE_FROZEN", async (t) => {
  t.mock.method(globalThis.crypto, "randomUUID", () => uuid(7001));
  const out = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    drive: async (book) => {
      const fence = sut.createF3MutationFence({ book });
      fence.arm({ flow: "2:principal", bodies: [ORG_BODY] });
      fence.policy(req({ postData: "{" }));
      // O que o driver vê depois é sintoma (a cerca nativa fecha o contexto).
      throw Object.assign(new Error("x"), { code: "FENCE_REQUEST" });
    },
  });
  assert.equal(out.code, "F3_FENCE_FROZEN");
  assert.equal(out.report.blockCode, "F3_FENCE_FROZEN");
  assert.equal(sut.validateF3Report(out.report, catalogue, { ledger: EMPTY }), true);
});

test("F3 B2b2a R2 RED (D): prazo e cancelamento congelam o livro e devolvem o parcial", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let held;
  const pending = sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    drive: (book) => {
      held = book;
      createOrg(book);
      return new Promise(() => {});
    },
  });
  await Promise.resolve();
  await Promise.resolve();
  t.mock.timers.tick(sut.F3_SESSION_DEADLINE_MS);
  const out = await pending;
  assert.equal(out.code, "F3_SESSION_DEADLINE");
  assert.equal(out.report.intents.sent, 1);
  // O driver pode continuar vivo, mas o livro congelado não sela mais.
  assert.throws(() => seal(held, 5, 5), { code: "F3_FENCE_FROZEN" });
  assert.ok(sut.F3_SESSION_DEADLINE_MS < 45 * 60 * 1000);
  t.mock.timers.reset();
  const abort = new AbortController();
  const aborted = sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    signal: abort.signal,
    drive: (book) => {
      createOrg(book);
      return new Promise(() => {});
    },
  });
  await Promise.resolve();
  abort.abort();
  const a = await aborted;
  assert.equal(a.code, "F3_SESSION_ABORTED");
  assert.equal(a.report.intents.sent, 1);
  assert.equal(sut.validateF3Report(a.report, catalogue, { ledger: EMPTY }), true);
  // Já cancelado antes de começar: o driver nem chega a mutar.
  const pre = new AbortController();
  pre.abort();
  let ran = false;
  const b = await sut.runF3Session({
    catalogue,
    ledger: EMPTY,
    provenance: PROV,
    signal: pre.signal,
    drive: async (book) => {
      ran = true;
      createOrg(book);
    },
  });
  assert.equal(b.code, "F3_SESSION_ABORTED");
  assert.equal(b.report.intents.sent, 0, String(ran));
});

test("F3 B2b2a R2 RED (G): catálogo do módulo antes do driver e allowlist sem RPC produtora", async () => {
  let ran = false;
  await assert.rejects(
    sut.runF3Session({
      catalogue: structuredClone(catalogue),
      ledger: EMPTY,
      provenance: PROV,
      drive: async () => (ran = true),
    }),
    { code: "F3_REPORT" },
  );
  assert.equal(ran, false);
  const { requestAllowed } = await import("./authenticated-visual-audit.mjs");
  const names = [
    ...sut.F3_PRODUCERS.filter((p) => sut.F3_MUTATING_ORDERS.includes(p.order)).map(
      (p) => p.producer,
    ),
    ...sut.F3_PRODUCER_RPC_VARIANTS,
  ];
  assert.ok(names.length >= 21);
  for (const n of names)
    assert.equal(requestAllowed({ url: RPC(n), method: "POST", postData: "{}" }), false, n);
});

test("F3 B2b2a R2 RED (E): ticket reusado no meio do fluxo; vaga gerada nunca repete valor e vaga capturada repetida tem o mesmo valor", (t) => {
  const edge = {
    id_organizacao: F3,
    email: "leitor@example.test",
    chave_idempotencia: sut.f3Slot("uuid", "k"),
  };
  const save = {
    p_id_organizacao: F3,
    p_id_usuario: sut.f3Slot("uuid", "usuario"),
    p_email: "leitor@example.test",
    p_perfil: "leitor",
    p_escopo_todos_contratos: true,
    p_ativo: true,
    p_ids_contratos_ativar: [],
    p_ids_contratos_revogar: [],
    p_versao_esperada: null,
    p_chave_idempotencia: sut.f3Slot("uuid", "k2"),
  };
  const edgeReq = (key) =>
    req({
      url: API + "/functions/v1/admin-invite-user",
      postData: JSON.stringify({ ...edge, chave_idempotencia: key }),
      interceptionId: "fixo",
    });
  const saveReq = (key, interceptionId = "outro") =>
    req({
      url: RPC("salvar_vinculo_usuario_adm"),
      postData: JSON.stringify({ ...save, p_id_usuario: uuid(31), p_chave_idempotencia: key }),
      interceptionId,
    });
  // Mesmo ticket no segundo passo: bloqueia e congela, sem segundo envio do passo.
  const reuse = fenceWith(t, orgOk);
  reuse.fence.arm({ flow: "4:principal", bodies: [edge, save] });
  assert.equal(reuse.fence.policy(edgeReq(uuid(30))), true);
  assert.equal(reuse.fence.policy(saveReq(uuid(39), "fixo")), false);
  assert.equal(reuse.book.frozen(), true);
  // Chaves do convite e do vínculo vêm de gerenciadores diferentes (levantamento, seção 3): a
  // mesma chave nos dois passos é recusada; chaves diferentes passam.
  const repeated = fenceWith(t, orgOk);
  repeated.fence.arm({ flow: "4:principal", bodies: [edge, save] });
  assert.equal(repeated.fence.policy(edgeReq(uuid(30))), true);
  assert.equal(repeated.fence.policy(saveReq(uuid(30))), false);
  const distinct = fenceWith(t, orgOk);
  distinct.fence.arm({ flow: "4:principal", bodies: [edge, save] });
  assert.equal(distinct.fence.policy(edgeReq(uuid(30))), true);
  assert.equal(distinct.fence.policy(saveReq(uuid(39))), true);
  // Vaga capturada repetida (caminho do Storage em UP2 e UP3): o segundo valor é o primeiro.
  const path = fenceWith(t, withContract);
  path.fence.arm({ flow: "12:principal", bodies: V110_BODIES() });
  const [r1, r2, r3] = V110_REQS();
  const body3 = JSON.parse(r3.postData);
  assert.equal(path.fence.policy(r1), true);
  assert.equal(path.fence.policy(r2), true);
  const other = body3.p_path.replace(uuid(54), uuid(53));
  assert.equal(
    path.fence.policy({
      ...r3,
      interceptionId: "p3",
      postData: JSON.stringify({ ...body3, p_path: other }),
    }),
    false,
  );
});

test("F3 B2b2a R3 RED: atualização confirma a entidade do inventário que atualiza; outra entidade ou papel é recusado", () => {
  // Defeito latente do 2b-1: V103, V106, V108 (publicar) e V107 (aprovar e aplicabilidade)
  // confirmavam um ID já inventariado como entidade nova, que virava entidade_repetida e
  // reprovava o isolamento. Agora a ação declara o que atualiza (levantamento, seção 3).
  const book = chainBook();
  seal(book, 6, 6);
  const before = book.created().length;
  for (const bad of [
    { entityId: uuid(107), organizationId: F3 },
    { entityId: uuid(606), organizationId: F3 },
    { entityId: uuid(105), organizationId: sut.F3_E87_ORG },
    { entityId: uuid(105), organizationId: F3, related: [{ role: "versao", entityId: uuid(1) }] },
  ])
    assert.throws(
      () => book.confirm(uuid(6), bad),
      { code: "F3_INTENT_ENTITY" },
      JSON.stringify(bad),
    );
  book.confirm(uuid(6), { entityId: uuid(105), organizationId: F3 });
  assert.equal(book.created().length, before);
  assert.equal(book.assertIsolation(), true);
  // Criação com papéis: exatamente os declarados, na ordem declarada.
  seal(book, 11, 11);
  for (const related of [[], [{ role: "item", entityId: uuid(1) }]])
    assert.throws(
      () => book.confirm(uuid(11), { entityId: uuid(111), organizationId: F3, related }),
      {
        code: "F3_INTENT_ENTITY",
      },
    );
  ok(book, 11, uuid(111));
  assert.deepEqual(
    book
      .created()
      .filter((c) => c.requestId === uuid(11))
      .map((c) => c.role),
    ["principal", "versao"],
  );
  // O relatório de referência fecha com os produtores de atualização em PASS.
  const report = completeReport();
  for (const o of [6, 8, 9, 10])
    assert.ok(report.cases.filter((c) => c.producerOrder === o).every((c) => c.status === "PASS"));
  assert.equal(valid(report), true);
});

test("F3 B2b2a R3 RED: espera só por leitura, com prazo do disparo, falha própria e sem reenvio", async (t) => {
  const clock = { t: 0 };
  t.mock.method(performance, "now", () => clock.t);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = async (wait, answers, step = sut.F3_WAIT_POLL_MS) => {
    let polls = 0;
    const p = sut.awaitF3Condition({
      wait,
      triggeredAt: 0,
      poll: async () => answers[Math.min(polls++, answers.length - 1)],
    });
    for (let i = 0; i < 400; i++) {
      await Promise.resolve();
      await Promise.resolve();
      clock.t += step;
      t.mock.timers.tick(step);
    }
    return [await p, polls];
  };
  clock.t = 0;
  assert.deepEqual((await run("W1", ["pending", "pending", "done"]))[0], { ok: true, code: null });
  clock.t = 0;
  // Prazo contado do disparo (8 minutos em W1): vence com o código de prazo, sem reenvio.
  const [late, polls] = await run("W1", ["pending"]);
  assert.deepEqual(late, { ok: false, code: "F3_WAIT_VERIFICADOR_PRAZO" });
  assert.ok(polls >= 2 && polls <= (8 * 60000) / sut.F3_WAIT_POLL_MS + 2, String(polls));
  clock.t = 0;
  // Recusa do verificador e, em W3, execução concluída com pode_revisar falso (M2): falha.
  assert.deepEqual((await run("W2", ["failed"]))[0], {
    ok: false,
    code: "F3_WAIT_VERIFICADOR_RECUSA",
  });
  clock.t = 0;
  assert.deepEqual((await run("W3", ["pending", "failed"]))[0], {
    ok: false,
    code: "F3_WAIT_ANALISE_FALHA",
  });
  clock.t = 0;
  assert.deepEqual((await run("W4", ["pending"]))[0], { ok: false, code: "F3_WAIT_PARECER_PRAZO" });
  for (const bad of [
    { wait: "W9", triggeredAt: 0, poll: async () => "done" },
    { wait: "W1", triggeredAt: NaN, poll: async () => "done" },
    { wait: "W1", triggeredAt: 0 },
    { wait: "W1", triggeredAt: 0, poll: async () => "talvez" },
  ])
    await assert.rejects(sut.awaitF3Condition(bad), { code: "F3_WAIT" });
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    sut.awaitF3Condition({
      wait: "W5",
      triggeredAt: 0,
      poll: async () => "done",
      signal: abort.signal,
    }),
    { code: "F3_SESSION_ABORTED" },
  );
});

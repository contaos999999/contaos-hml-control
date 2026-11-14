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
  assert.ok(derived.cases.every((c) => c.expected.master === null && c.expected.leitor === null));
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
    tamper((c) => (c.cases[0].expected.master = "ALLOW")),
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
  assert.equal(source.includes("prepare-visual-fixtures"), false);
  assert.equal(/CONTAOS_HML_SYNTHETIC/.test(source), false);
});

test("F3 B1: catálogo publicado tem o SHA-256 fixado no executor", async () => {
  const raw = await readFile(new URL(sut.F3_CASES_PATH, root), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), sut.F3_CASES_SHA256);
});

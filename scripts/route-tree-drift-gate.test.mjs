import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/route-tree-drift-gate.mjs");
function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}
function ambiente() {
  const cwd = mkdtempSync(join(tmpdir(), "contaos-route-gov020-"));
  const dir = join(cwd, "src");
  const arquivo = join(dir, "routeTree.gen.ts");
  mkdirSync(dir);
  git(cwd, "init", "--quiet");
  writeFileSync(arquivo, "// generated: canonical\n");
  git(cwd, "add", ".");
  git(
    cwd,
    "-c",
    "user.name=ContaOS Teste",
    "-c",
    "user.email=teste@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "fixture",
  );
  return { cwd, arquivo, close: () => rmSync(cwd, { recursive: true, force: true }) };
}
function executar(cwd) {
  return spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
}
test("GOV-020 PASS: árvore versionada e reproduzível sem alteração", () => {
  const env = ambiente();
  try {
    const r = executar(env.cwd);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /GOV-020 PASS/);
  } finally {
    env.close();
  }
});
test("GOV-020 FAIL: alteração do nome ou ordem da rota gerada", () => {
  const env = ambiente();
  try {
    writeFileSync(env.arquivo, "// generated: reordered\n");
    const r = executar(env.cwd);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /GOV-020 FAIL/);
    assert.match(r.stderr, /generated: reordered/);
    assert.match(r.stderr, /antes do PR/i);
  } finally {
    env.close();
  }
});
test("GOV-020 FAIL: arquivo gerado removido", () => {
  const env = ambiente();
  try {
    unlinkSync(env.arquivo);
    const r = executar(env.cwd);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /GOV-020 FAIL/);
  } finally {
    env.close();
  }
});
test("GOV-020 FAIL: arquivo gerado novo ainda não versionado", () => {
  const env = ambiente();
  try {
    git(env.cwd, "rm", "-q", "src/routeTree.gen.ts");
    git(
      env.cwd,
      "-c",
      "user.name=ContaOS Teste",
      "-c",
      "user.email=teste@example.invalid",
      "commit",
      "--quiet",
      "-m",
      "remove fixture",
    );
    mkdirSync(join(env.cwd, "src"), { recursive: true });
    writeFileSync(env.arquivo, "// generated: untracked\n");
    const r = executar(env.cwd);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /não está versionado/);
  } finally {
    env.close();
  }
});

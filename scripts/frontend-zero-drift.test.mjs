import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

// Executa o guard real sobre cópia isolada; não muda a árvore testada.
function executar(mutar = () => {}) {
  const temp = mkdtempSync(resolve(tmpdir(), "contaos-brand-guard-"));
  try {
    for (const path of ["src", "public", "scripts/frontend-zero-drift.mjs"]) {
      mkdirSync(dirname(resolve(temp, path)), { recursive: true });
      cpSync(resolve(path), resolve(temp, path), { recursive: true });
    }
    mutar(temp);
    return spawnSync(
      process.execPath,
      [resolve(temp, "scripts/frontend-zero-drift.mjs")],
      { cwd: temp, encoding: "utf8" },
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
function trocar(temp, path, anterior, proximo) {
  const file = resolve(temp, path);
  const content = readFileSync(file, "utf8");
  assert.ok(content.includes(anterior), "fixture não encontrou o alvo");
  writeFileSync(file, content.replaceAll(anterior, proximo));
}
test("aceita marca centralizada com header, sidebar, tipos e assets oficiais", () => {
  const result = executar();
  assert.equal(result.status, 0, result.stderr);
});
for (const [nome, path, anterior, proximo] of [
  [
    "ausência de AppShell no root",
    "src/routes/__root.tsx",
    "<ContaOSAppShell>",
    "<div>",
  ],
  [
    "marca duplicada na página organizacional",
    "src/components/contratos/NovoContrato.tsx",
    "<main ",
    "<ContaOSMarca /><main ",
  ],
  [
    "ausência de cabeçalho global",
    "src/components/layout/ContaOSAppShell.tsx",
    "<ContaOSOrganizationHeader",
    "<HeaderAusente",
  ],
  [
    "ausência do logo branco oficial",
    "src/components/layout/ContaOSAppShell.tsx",
    "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
    "/logo-nao-oficial.svg",
  ],
  [
    "ausência de marca na tela pública",
    "src/routes/login.tsx",
    "<ContaOSMarca",
    "<MarcaAusente",
  ],
])
  test(`rejeita ${nome}`, () => {
    const result = executar((temp) => trocar(temp, path, anterior, proximo));
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /ZERO-DRIFT FAIL/);
  });

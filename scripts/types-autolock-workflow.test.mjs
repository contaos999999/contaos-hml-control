import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/contaos-types-autolock.yml", "utf8");

test("Auto-Lock preserva blob certificado e nao altera backend", () => {
  assert.match(workflow, /CERTIFIED_TYPES_BLOB: 8ea7750b75fd9d76b29c36ce7613392e3ab65e19/);
  assert.match(workflow, /LOCKED_PATH: src\/integrations\/supabase\/types\.ts/);
  assert.match(workflow, /git hash-object/);
  assert.match(workflow, /git show/);
});

test("Auto-Lock nao faz push, merge ou force-push na main", () => {
  assert.doesNotMatch(workflow, /git push origin HEAD:main/);
  assert.doesNotMatch(workflow, /git push origin HEAD:refs\/heads\/main/);
  assert.doesNotMatch(workflow, /git push[^\n]*--force/);
  assert.doesNotMatch(workflow, /gh pr merge/);
  assert.match(workflow, /git push origin "HEAD:refs\/heads\/\$repair_branch"/);
});

test("Auto-Lock cria PR e pede CI no SHA da branch", () => {
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /actions: write/);
  assert.match(workflow, /gh pr create --base main --head/);
  assert.match(workflow, /gh workflow run contaos-frontend-zero-drift\.yml --ref/);
  assert.match(workflow, /gh pr list --state open/);
  assert.match(workflow, /git rev-parse origin\/main/);
});

test("Auto-Lock testa em fixture e falha fechado se a base mudar", () => {
  assert.match(workflow, /DRIFT_CONTROLADO_APENAS_EM_TMP/);
  assert.match(workflow, /MAIN ALTERADA durante a suite/);
  assert.match(workflow, /bunx vitest run --maxWorkers=1/);
  assert.match(workflow, /bunx tsc --noEmit -p \./);
  assert.match(workflow, /bunx vite build/);
});

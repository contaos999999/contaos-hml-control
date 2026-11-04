import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkSnapshot, mustCheck } from "./context-freshness-gate.mjs";

const source = JSON.parse(readFileSync("docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json", "utf8"));
const items = [
  ...source.context_documents.map((d) => ({ type: "blob", path: d.path, sha: d.blob_sha })),
  {
    type: "blob",
    path: source.prompt_catalog.source_path,
    sha: source.prompt_catalog.source_blob_sha,
  },
];
const clone = () => JSON.parse(JSON.stringify(source));

test("verde: SHA HEAD e todos os blobs estão iguais", () => {
  assert.deepEqual(checkSnapshot(clone(), source.source_commit, items), []);
});
test("vermelho: commit remoto atualizado", () => {
  assert.match(checkSnapshot(clone(), "f".repeat(40), items).join(" "), /HEAD/);
});
test("vermelho: documento divergente mesmo quando HEAD é igual", () => {
  const changed = items.map((d) =>
    d.path === source.context_documents[0].path ? { ...d, sha: "f".repeat(40) } : d,
  );
  assert.match(checkSnapshot(clone(), source.source_commit, changed).join(" "), /blob/);
});
test("vermelho: documento canônico ausente", () => {
  const s = clone();
  s.context_documents.pop();
  assert.match(checkSnapshot(s, source.source_commit, items).join(" "), /25/);
});
test("vermelho: catálogo 100/97 alterado", () => {
  const changed = items.map((d) =>
    d.path === source.prompt_catalog.source_path ? { ...d, sha: "f".repeat(40) } : d,
  );
  assert.match(checkSnapshot(clone(), source.source_commit, changed).join(" "), /catálogo/);
});
test("documentação sem BUILD não exige token", () => {
  assert.equal(mustCheck(["docs/frontend/nota.md"], { status: "SEM_PLANO_ATIVO" }), false);
});
test("BUILD de frontend exige token/fonte", () => {
  assert.equal(mustCheck(["src/test/f1.test.tsx"], { status: "SEM_PLANO_ATIVO" }), true);
});
test("PLAN validado exige confirmação mesmo sem alteração em src", () => {
  assert.equal(mustCheck(["docs/frontend/planos/PLANO_ATIVO.json"], { status: "VALIDADO" }), true);
});
test("autorrestauração types.ts não investiga backend", () => {
  assert.equal(
    mustCheck(["src/integrations/supabase/types.ts"], { status: "SEM_PLANO_ATIVO" }),
    false,
  );
});

test("vermelho: fonte antiga contaos9999/develop não é canônica", () => {
  const snapshot = clone();
  snapshot.source_repo = "contaos9999/develop";
  assert.match(checkSnapshot(snapshot, source.source_commit, items).join(" "), /origem/);
});
test("verde: repositório privado da organização é a fonte fixa", () => {
  assert.equal(source.source_repo, "contaos999999/develop");
  assert.equal(source.source_branch, "main");
  assert.deepEqual(checkSnapshot(clone(), source.source_commit, items), []);
});

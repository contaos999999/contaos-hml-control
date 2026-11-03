import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const gate = fileURLToPath(new URL("./frontend-scope-gate.mjs", import.meta.url));
function run(command, args, cwd, extra = {}) {
  const r = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...extra },
  });
  if (r.error) throw r.error;
  return r;
}
function put(dir, path, text) {
  const full = join(dir, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, "utf8");
}
for (const [status, path, code, description] of [
  ["SEM_PLANO_ATIVO", "src/app.tsx", 1, "bloquear BUILD sem PLAN validado"],
  ["VALIDADO", "src/app.tsx", 0, "permitir BUILD com PLAN e allowlist"],
  ["VALIDADO", "src/fora.tsx", 1, "bloquear arquivos fora do PLAN"],
  ["VALIDADO", "supabase/migrations/x.sql", 1, "bloquear backend mesmo com PLAN"],
  ["SEM_PLANO_ATIVO", "docs/frontend/nota.md", 0, "permitir documentação sem BUILD"],
]) {
  test(description, () => {
    const dir = mkdtempSync(join(tmpdir(), "contaos-gate-"));
    try {
      assert.equal(run("git", ["init", "-q"], dir).status, 0);
      assert.equal(run("git", ["config", "user.email", "ci@example.invalid"], dir).status, 0);
      assert.equal(run("git", ["config", "user.name", "CI"], dir).status, 0);
      put(dir, "src/app.tsx", "export const ok = 1;\n");
      put(dir, "docs/frontend/planos/PROMPT_22.md", "# PLAN validado\n");
      put(
        dir,
        "docs/frontend/planos/PLANO_ATIVO.json",
        JSON.stringify({
          schema: "contaos.frontend.plan.v1",
          prompt_id: "22",
          status,
          plano_documento: "docs/frontend/planos/PROMPT_22.md",
          arquivos_permitidos: ["src/app.tsx"],
          validacao: {
            resultado: status === "VALIDADO" ? "PASS" : "PENDENTE",
            ci_plano_url: "https://github.com/contaos9999/contaos-hml-control/actions/runs/1",
            aprovacao_humana_exigida: false,
          },
        }),
      );
      run("git", ["add", "-A"], dir);
      assert.equal(run("git", ["commit", "-qm", "PLAN"], dir).status, 0);
      const before = run("git", ["rev-parse", "HEAD"], dir).stdout.trim();
      put(dir, path, "novo texto\n");
      run("git", ["add", "-A"], dir);
      assert.equal(run("git", ["commit", "-qm", "BUILD"], dir).status, 0);
      const result = run(process.execPath, [gate], dir, {
        GITHUB_EVENT_NAME: "push",
        FRONTEND_DIFF_BASE: before,
      });
      assert.equal(
        result.status,
        code,
        "stdout=" + result.stdout + " stderr=" + result.stderr,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

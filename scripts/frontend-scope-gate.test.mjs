import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const gate = fileURLToPath(new URL("./frontend-scope-gate.mjs", import.meta.url));
const sourcePath = fileURLToPath(
  new URL("../docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json", import.meta.url),
);
const sourceText = readFileSync(sourcePath, "utf8");
const source = JSON.parse(sourceText);
const gates = Object.fromEntries(
  [
    "prd",
    "premissas",
    "arquitetura",
    "atomicos",
    "brand",
    "seguranca",
    "nfr",
    "zero_drift",
    "tdd",
    "ci",
    "teste_c_planejado",
    "rollback",
  ].map((key) => [key, "PASS"]),
);

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
function commit(dir, message) {
  assert.equal(run("git", ["add", "-A"], dir).status, 0);
  assert.equal(run("git", ["commit", "-qm", message], dir).status, 0);
  return run("git", ["rev-parse", "HEAD"], dir).stdout.trim();
}
function scenario({
  status = "VALIDADO",
  path = "src/app.tsx",
  expected = 0,
  description,
  mutation = () => {},
  pr = false,
  allowlist,
}) {
  test(description, () => {
    const dir = mkdtempSync(join(tmpdir(), "contaos-gov-gate-"));
    try {
      assert.equal(run("git", ["init", "-q"], dir).status, 0);
      assert.equal(run("git", ["config", "user.email", "ci@example.invalid"], dir).status, 0);
      assert.equal(run("git", ["config", "user.name", "ContaOS CI"], dir).status, 0);
      assert.equal(run("git", ["branch", "-m", "main"], dir).status, 0);
      put(dir, "src/app.tsx", "export const app = 1;\n");
      const main = commit(dir, "baseline");

      if (pr) assert.equal(run("git", ["checkout", "-qb", "feature"], dir).status, 0);
      put(dir, "docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json", sourceText);
      const plan = {
        schema: "contaos.frontend.plan.v1",
        prompt_id: "22",
        status,
        plano_documento: "docs/frontend/planos/PROMPT_22.md",
        arquivos_permitidos: allowlist || ["src/app.tsx"],
        context_pack_version: "4.1",
        context_read_acknowledged: true,
        context_read_by: "CI — caso sintético de validação",
        context_read_acknowledged_at: "2026-11-03",
        context_source_commit: source.source_commit,
        context_catalog_blob: source.prompt_catalog.source_blob_sha,
        context_documents_read: source.context_documents.map((item) => item.path),
        brand_context: "ContaOS Brand v1.0",
        prompt_000_brand_01_read: true,
        prompt_policy: {
          required_section: "ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE",
        },
        prompt_crosswalk: {
          regular_prompt_id: "22",
          direct_atomic_ids: ["000"],
          additional_transversal_atomic_ids: [],
          source_evidence_missing: false,
          regular_original_sha256: source.prompt_catalog.originals_regular_sha256,
          atomic_original_sha256: source.prompt_catalog.originals_atomic_sha256,
        },
        validacao: {
          resultado: status === "VALIDADO" ? "PASS" : "PENDENTE",
          ci_plano_url: "https://github.com/contaos999999/contaos-hml-control/actions/runs/41732038105",
          gates,
          aprovacao_humana_exigida: false,
        },
        impacto_visual: "SIM",
      };
      let prompt =
        "# PROMPT 22 — planejamento\n\nZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)\n";
      const receipt = JSON.parse(sourceText);
      mutation({ plan, receipt, setPrompt: (v) => (prompt = v) });
      put(dir, "docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json", JSON.stringify(receipt));
      put(dir, "docs/frontend/planos/PROMPT_22.md", prompt);
      put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
      const before = commit(dir, "PLAN validado");

      put(dir, path, "novo conteúdo\n");
      commit(dir, "BUILD frontend");
      let event = "push";
      let rangeBase = before;
      if (pr) {
        event = "pull_request";
        rangeBase = main;
        assert.equal(run("git", ["checkout", "-q", "main"], dir).status, 0);
        const m = run("git", ["merge", "--no-ff", "-m", "PR merge test", "feature"], dir);
        assert.equal(m.status, 0, m.stderr);
      }
      const result = run(process.execPath, [gate], dir, {
        GITHUB_EVENT_NAME: event,
        FRONTEND_DIFF_BASE: rangeBase,
      });
      assert.equal(
        result.status,
        expected,
        "stdout: " + result.stdout + "\nstderr: " + result.stderr,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

scenario({ description: "PASS para PLAN validado, fonte canônica e arquivo autorizado" });
scenario({
  status: "SEM_PLANO_ATIVO",
  expected: 1,
  description: "FAIL sem PLAN validado",
});
scenario({
  path: "src/fora-do-plano.tsx",
  expected: 1,
  description: "FAIL para arquivo de frontend fora do PLAN",
});
scenario({
  path: "supabase/migrations/001.sql",
  expected: 1,
  description: "FAIL incondicional para alteração de migrations Supabase",
});
scenario({
  path: "docs/frontend/checkpoint.md",
  expected: 0,
  status: "SEM_PLANO_ATIVO",
  description: "PASS para documentação sem BUILD",
});
scenario({
  expected: 1,
  description: "FAIL quando a leitura de um documento canônico não foi declarada",
  mutation: ({ plan }) => {
    plan.context_documents_read.pop();
  },
});
scenario({
  expected: 1,
  description: "FAIL quando o snapshot de fonte tem um blob alterado",
  mutation: ({ receipt }) => {
    receipt.context_documents[0].blob_sha = "invalid";
  },
});
scenario({
  expected: 1,
  description: "FAIL quando atômicos incluem código sem origem",
  mutation: ({ plan }) => {
    plan.prompt_crosswalk.additional_transversal_atomic_ids.push("999");
  },
});
scenario({
  expected: 1,
  description: "FAIL quando a cláusula literal Zero-Drift não consta no PLAN",
  mutation: ({ setPrompt }) => {
    setPrompt("# PROMPT 22 sem o bloco obrigatório\n");
  },
});
scenario({
  path: "public/brand/logo.svg",
  allowlist: ["public/brand/logo.svg"],
  expected: 1,
  description: "FAIL para BRAND-01 sem aprovação humana específica",
});
scenario({
  path: "public/brand/logo.svg",
  allowlist: ["public/brand/logo.svg"],
  expected: 0,
  description: "PASS com gate humano e evidência em mudança BRAND-01",
  mutation: ({ plan }) => {
    plan.validacao.aprovacao_humana_exigida = true;
    plan.validacao.aprovacao_humana = "CONCEDIDA";
    plan.validacao.aprovacao_humana_evidencia = "https://github.com/contaos999999/contaos-hml-control/issues/1";
  },
});
scenario({
  pr: true,
  expected: 0,
  description: "PASS PR quando PLAN foi validado na branch antes do BUILD",
});
scenario({
  pr: true,
  status: "SEM_PLANO_ATIVO",
  expected: 1,
  description: "FAIL PR com BUILD na branch sem PLAN validado",
});

scenario({
  expected: 1,
  description: "FAIL para snapshot com owner antigo apos migracao",
  mutation: ({ receipt }) => {
    receipt.source_repo = "contaos9999/develop";
  },
});
scenario({
  expected: 1,
  description: "FAIL para URL antiga de CI do PLAN",
  mutation: ({ plan }) => {
    plan.validacao.ci_plano_url = "https://github.com/contaos9999/contaos-hml-control/actions/runs/41732038105";
  },
});

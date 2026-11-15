import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative, resolve, isAbsolute } from "node:path";
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
  restricted,
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
          ci_plano_url:
            "https://github.com/contaos999999/contaos-hml-control/actions/runs/41732038105",
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
      let before = commit(dir, "PLAN validado");
      let protectedBase = before;
      if (restricted) {
        if (restricted.general) plan.arquivos_permitidos.push(path);
        if (restricted.route) plan.arquivos_permitidos.push("src/routes/restrita.tsx");
        plan.arquivos_restritos_por_pr = Object.hasOwn(restricted, "map")
          ? restricted.map
          : { [path]: 679 };
        put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
        if (restricted.gov !== null)
          put(
            dir,
            "docs/frontend/planos/P0_GOV_PLAN_679.json",
            JSON.stringify(restricted.gov || { approved: true, pr_number: 679, files: [path] }),
          );
        if (restricted.baseMalformedJSON)
          put(dir, "docs/frontend/planos/PLANO_ATIVO.json", "{ JSON malformado");
        protectedBase = commit(dir, "PLAN protegido com restricao");
        assert.equal(
          run("git", ["update-ref", "refs/remotes/origin/main", protectedBase], dir).status,
          0,
        );
        assert.equal(run("git", ["checkout", "-qb", "restricted-feature"], dir).status, 0);
        if (restricted.headGov)
          put(
            dir,
            "docs/frontend/planos/P0_GOV_PLAN_679.json",
            JSON.stringify({
              approved: true,
              pr_number: 679,
              files: [path],
            }),
          );
        if (restricted.removeMap) {
          if (restricted.swapMap) plan.arquivos_restritos_por_pr = { [path]: 680 };
          else if (restricted.emptyMap) plan.arquivos_restritos_por_pr = {};
          else delete plan.arquivos_restritos_por_pr;
          plan.arquivos_permitidos.push(path);
          put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
          commit(dir, "PLAN pai remove mapa e inclui na allowlist");
        }
        if (restricted.oldContext) {
          plan.context_source_commit = "a".repeat(40);
          put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
          commit(dir, "PLAN contexto antigo");
        }
        before = run("git", ["rev-parse", "HEAD"], dir).stdout.trim();
        if (restricted.sameCommit) {
          plan.status = "SEM_PLANO_ATIVO";
          put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
          commit(dir, "pai sem PLAN validado");
          plan.status = "VALIDADO";
          put(dir, "docs/frontend/planos/PLANO_ATIVO.json", JSON.stringify(plan));
        }
      }

      put(dir, path, "novo conteúdo\n");
      if (restricted?.route) put(dir, "src/routes/restrita.tsx", "nova rota\n");
      commit(dir, restricted?.fake ? "Merge pull request #679 from fake" : "BUILD frontend");
      let event = "push";
      let rangeBase = before;
      if (pr) {
        event = "pull_request";
        rangeBase = main;
        assert.equal(run("git", ["checkout", "-q", "main"], dir).status, 0);
        const m = run("git", ["merge", "--no-ff", "-m", "PR merge test", "feature"], dir);
        assert.equal(m.status, 0, m.stderr);
      }
      if (restricted) {
        event = restricted.event || "pull_request";
        rangeBase = protectedBase;
        put(
          dir,
          "event.json",
          JSON.stringify({
            number: 679,
            pull_request: { number: restricted.number === undefined ? 679 : restricted.number },
          }),
        );
        if (!restricted.fake) {
          assert.equal(run("git", ["checkout", "-q", "main"], dir).status, 0);
          if (restricted.wrongBase) {
            put(dir, "docs/other.md", "base avanca");
            commit(dir, "outro commit base");
          }
          assert.equal(
            run(
              "git",
              [
                "merge",
                "--no-ff",
                "-m",
                "Merge pull request #" + (restricted.mergeNumber || 679) + " from feature",
                "restricted-feature",
              ],
              dir,
            ).status,
            0,
          );
        }
      }
      const result = run(process.execPath, [gate], dir, {
        GITHUB_EVENT_NAME: event,
        FRONTEND_DIFF_BASE: rangeBase,
        GITHUB_EVENT_PATH: join(dir, "event.json"),
      });
      assert.equal(
        result.status,
        expected,
        "stdout: " + result.stdout + "\nstderr: " + result.stderr,
      );
      if (restricted && expected === 1) {
        const reason = restricted.oldContext
          ? /Context Gate/
          : restricted.sameCommit
            ? /PLAN anterior não foi VALIDADO/
            : Object.hasOwn(restricted, "map") || restricted.baseMalformedJSON
              ? /Mapa restritivo por PR inválido/
              : /ARQUIVO RESTRITO POR PR SEM AUTORIZAÇÃO PROTEGIDA/;
        assert.match(result.stderr, reason);
      }
    } finally {
      const rel = relative(resolve(tmpdir()), resolve(dir));
      assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel));
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
    plan.validacao.aprovacao_humana_evidencia =
      "https://github.com/contaos999999/contaos-hml-control/issues/1";
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
    plan.validacao.ci_plano_url =
      "https://github.com/contaos9999/contaos-hml-control/actions/runs/41732038105";
  },
});

const restrictedPath = "src/test/restrito.test.tsx";
for (const [label, restricted, expected] of [
  ["PR679 com teste fora da allowlist global", {}, 0],
  ["push merge679 real com teste fora da allowlist global", { event: "push" }, 0],
  ["PR679 preserva mapa da base quando pai e HEAD removem", { removeMap: true }, 0],
  ["PR680 nao apaga restricao na base", { number: 680, removeMap: true }, 1],
  ["PR680 nao recebe allowlist geral da base", { number: 680, general: true }, 1],
  ["JSON presente malformado nao vira legado", { baseMalformedJSON: true, removeMap: true }, 1],
  ["PR680 nao troca restricao da base", { number: 680, removeMap: true, swapMap: true }, 1],
  ["PR680 nao esvazia restricao da base", { number: 680, removeMap: true, emptyMap: true }, 1],
  ["PR680 citando679", { number: 680 }, 1],
  ["PR ausente", { number: null }, 1],
  ["PR string", { number: "679" }, 1],
  ["PR malformada", { number: {} }, 1],
  ["evento desconhecido", { event: "unknown" }, 1],
  ["GOV ausente", { gov: null }, 1],
  ["GOV somente no HEAD nao concede", { gov: null, headGov: true }, 1],
  ["GOV nao aprovado", { gov: { approved: false, pr_number: 679, files: [restrictedPath] } }, 1],
  ["GOV PR errada", { gov: { approved: true, pr_number: 680, files: [restrictedPath] } }, 1],
  ["GOV sem caminho", { gov: { approved: true, pr_number: 679, files: [] } }, 1],
  ["mapa malformado", { map: { [restrictedPath]: "679" } }, 1],
  ["mapa nulo", { map: null }, 1],
  ["push fake um pai", { event: "push", fake: true }, 1],
  ["push base errada", { event: "push", wrongBase: true }, 1],
  ["push merge680 cita679", { event: "push", mergeNumber: 680 }, 1],
  ["contexto antigo segue bloqueado", { oldContext: true }, 1],
  ["PLAN e src no mesmo commit seguem bloqueados", { sameCommit: true }, 1],
])
  scenario({ description: "restrito: " + label, path: restrictedPath, restricted, expected });

scenario({
  description: "restrito: GOV020 nao supera restricao da base",
  path: "src/routeTree.gen.ts",
  restricted: { number: 680, route: true },
  expected: 1,
});

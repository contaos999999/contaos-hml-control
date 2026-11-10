import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { createServer, connect } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { WebSocketServer } = createRequire(require.resolve("jsdom"))("ws");

const sut = await import("./authenticated-visual-audit.mjs").catch((error) => {
  if (
    error.code !== "ERR_MODULE_NOT_FOUND" ||
    !error.message.includes("authenticated-visual-audit.mjs")
  )
    throw error;
  return {};
});
function fn(name) {
  assert.equal(typeof sut[name], "function", `${name}: comportamento ainda não implementado`);
  return sut[name];
}
const R5_R4_HEAD = "4c3a92b3fbf3160b3c67751355a4ef8f91c70d72";
const HML = "https://contaos-41-hml.vercel.app";
const API = "https://gklhhhyosgasnyoxlrui.supabase.co";
// Historical metadata is initialized before tests can cross a top-level await.
const R13_R12_RESPONSES = {
  "/actions/runs/42666600147": {
    id: 42666600147,
    name: "ContaOS Frontend Zero-Drift",
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T17:38:29Z",
    updated_at: "2026-11-09T17:40:06Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666600147/attempts/1": {
    id: 42666600147,
    name: "ContaOS Frontend Zero-Drift",
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T17:38:29Z",
    updated_at: "2026-11-09T17:40:06Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666600147/attempts/1/jobs?per_page=100&page=1": {
    total_count: 2,
    jobs: [
      {
        id: 129331797954,
        run_id: 42666600147,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "ContaOS Frontend Zero-Drift",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:32Z",
            completed_at: "2026-11-09T17:38:33Z",
          },
          {
            number: 2,
            name: "Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:33Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 3,
            name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 4,
            name: "P0 V1 — autotestes do inventario e dispensas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 5,
            name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 6,
            name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 7,
            name: "Autoteste do guard (casos permitidos e proibidos)",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:37Z",
          },
          {
            number: 8,
            name: "Verificar contrato de seguranca do Auto-Lock por PR",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:37Z",
            completed_at: "2026-11-09T17:38:37Z",
          },
          {
            number: 9,
            name: "Verificar fronteira frontend/backend e PLAN validado prévio",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:37Z",
            completed_at: "2026-11-09T17:38:37Z",
          },
          {
            number: 10,
            name: "Autotestes do snapshot canônico e matriz de telas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:37Z",
            completed_at: "2026-11-09T17:38:37Z",
          },
          {
            number: 11,
            name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:37Z",
            completed_at: "2026-11-09T17:38:38Z",
          },
          {
            number: 12,
            name: "GOV-003 — exigir token valido e fonte viva antes do merge",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:38Z",
            completed_at: "2026-11-09T17:38:38Z",
          },
          {
            number: 13,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:38Z",
            completed_at: "2026-11-09T17:38:38Z",
          },
          {
            number: 14,
            name: "Setup Bun",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:38Z",
            completed_at: "2026-11-09T17:38:48Z",
          },
          {
            number: 15,
            name: "Install frozen dependencies",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:48Z",
            completed_at: "2026-11-09T17:38:50Z",
          },
          {
            number: 16,
            name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:50Z",
            completed_at: "2026-11-09T17:38:50Z",
          },
          {
            number: 17,
            name: "Lint e formatacao do saneamento transversal",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:50Z",
            completed_at: "2026-11-09T17:38:52Z",
          },
          {
            number: 18,
            name: "Production build — geração canônica TanStack antes dos testes longos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:52Z",
            completed_at: "2026-11-09T17:38:57Z",
          },
          {
            number: 19,
            name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:57Z",
            completed_at: "2026-11-09T17:38:57Z",
          },
          {
            number: 20,
            name: "Full regression — Vitest 2 workers",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:57Z",
            completed_at: "2026-11-09T17:39:48Z",
          },
          {
            number: 21,
            name: "TypeScript typecheck",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:39:48Z",
            completed_at: "2026-11-09T17:40:03Z",
          },
          {
            number: 22,
            name: "Brand-01, PT-BR, secrets and types integrity",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:03Z",
            completed_at: "2026-11-09T17:40:03Z",
          },
          {
            number: 43,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:03Z",
            completed_at: "2026-11-09T17:40:03Z",
          },
          {
            number: 44,
            name: "Post Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:03Z",
            completed_at: "2026-11-09T17:40:03Z",
          },
          {
            number: 45,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:03Z",
            completed_at: "2026-11-09T17:40:03Z",
          },
        ],
      },
      {
        id: 129331798384,
        run_id: 42666600147,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:32Z",
            completed_at: "2026-11-09T17:38:33Z",
          },
          {
            number: 2,
            name: "Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:33Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 3,
            name: "Detectar escopo de auditoria visual",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 4,
            name: "Setup Bun",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 5,
            name: "Instalar dependencias congeladas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 6,
            name: "Cache do Chromium Playwright 1.64.1",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 7,
            name: "Instalar Playwright isolado, sem atualizar package/lock",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 8,
            name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 9,
            name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 10,
            name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 11,
            name: "Evidencia permanente de screenshots e SHA256SUMS",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 12,
            name: "Confirmar que nenhuma fonte versionada foi editada",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 24,
            name: "Post Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:35Z",
          },
          {
            number: 25,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:38:35Z",
            completed_at: "2026-11-09T17:38:36Z",
          },
        ],
      },
    ],
  },
  "/actions/runs/42666864017": {
    id: 42666864017,
    name: "ContaOS Trilha A Fixtures",
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    created_at: "2026-11-09T17:40:10Z",
    updated_at: "2026-11-09T17:42:21Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666864017/attempts/1": {
    id: 42666864017,
    name: "ContaOS Trilha A Fixtures",
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    created_at: "2026-11-09T17:40:10Z",
    updated_at: "2026-11-09T17:42:22Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666864017/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129332744911,
        run_id: 42666864017,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:14Z",
            completed_at: "2026-11-09T17:40:15Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:15Z",
            completed_at: "2026-11-09T17:40:18Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:18Z",
            completed_at: "2026-11-09T17:40:21Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:21Z",
            completed_at: "2026-11-09T17:40:26Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:26Z",
            completed_at: "2026-11-09T17:40:37Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:37Z",
            completed_at: "2026-11-09T17:40:39Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:39Z",
            completed_at: "2026-11-09T17:41:12Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:12Z",
            completed_at: "2026-11-09T17:41:13Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:13Z",
            completed_at: "2026-11-09T17:41:13Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:13Z",
            completed_at: "2026-11-09T17:41:13Z",
          },
        ],
      },
      {
        id: 129332747763,
        run_id: 42666864017,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129333370334,
        run_id: 42666864017,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A preparacao sintetica HML",
        status: "completed",
        conclusion: "failure",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:20Z",
            completed_at: "2026-11-09T17:41:22Z",
          },
          {
            number: 2,
            name: "Checkout imutavel do executor main",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:22Z",
            completed_at: "2026-11-09T17:41:24Z",
          },
          {
            number: 3,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:24Z",
            completed_at: "2026-11-09T17:41:25Z",
          },
          {
            number: 4,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:25Z",
            completed_at: "2026-11-09T17:41:36Z",
          },
          {
            number: 5,
            name: "Dependencias congeladas do executor",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:36Z",
            completed_at: "2026-11-09T17:41:38Z",
          },
          {
            number: 6,
            name: "Recibo inicial publico para as fases sem credenciais",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:41:38Z",
            completed_at: "2026-11-09T17:42:11Z",
          },
          {
            number: 7,
            name: "Reancorar deployment HML sem credenciais, antes do checkout da fonte",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T17:42:11Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 8,
            name: "Validar SHA ancestral antes de baixar ou executar a fonte",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 9,
            name: "Fonte aprovada em checkout separado, sem credenciais persistidas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 10,
            name: "Dependencias congeladas da fonte aprovada",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 11,
            name: "Run actions/cache@v4",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 12,
            name: "Run ./node_modules/.bin/playwright install --with-deps chromium",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 13,
            name: "Barreira nativa no mesmo HEAD antes de secrets",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 14,
            name: "Preparacao e SSR sem credenciais privadas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 15,
            name: "Revalidar main e unicidade dentro da concorrencia antes de secrets",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 16,
            name: "Somente agora fornecer o par sintetico ao preparador separado",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 17,
            name: "Verificar hashes gerados, inclusive em resultado parcial",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 18,
            name: "Evidencia privada imutavel por 90 dias",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 35,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:17Z",
          },
          {
            number: 36,
            name: "Post Checkout imutavel do executor main",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:42:17Z",
            completed_at: "2026-11-09T17:42:18Z",
          },
          {
            number: 37,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:42:18Z",
            completed_at: "2026-11-09T17:42:18Z",
          },
        ],
      },
    ],
  },
  "/actions/runs/42666864220": {
    id: 42666864220,
    name: "ContaOS Trilha A Autenticada",
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T17:40:10Z",
    updated_at: "2026-11-09T17:40:35Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666864220/attempts/1": {
    id: 42666864220,
    name: "ContaOS Trilha A Autenticada",
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T17:40:10Z",
    updated_at: "2026-11-09T17:40:36Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
  },
  "/actions/runs/42666864220/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129332746954,
        run_id: 42666864220,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:13Z",
            completed_at: "2026-11-09T17:40:14Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:14Z",
            completed_at: "2026-11-09T17:40:15Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:15Z",
            completed_at: "2026-11-09T17:40:17Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:17Z",
            completed_at: "2026-11-09T17:40:17Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:17Z",
            completed_at: "2026-11-09T17:40:29Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:29Z",
            completed_at: "2026-11-09T17:40:31Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:31Z",
            completed_at: "2026-11-09T17:40:31Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:31Z",
            completed_at: "2026-11-09T17:40:31Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:31Z",
            completed_at: "2026-11-09T17:40:31Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T17:40:31Z",
            completed_at: "2026-11-09T17:40:31Z",
          },
        ],
      },
      {
        id: 129332749745,
        run_id: 42666864220,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129332966127,
        run_id: 42666864220,
        run_attempt: 1,
        head_sha: "3d6bea3e938459f348130bf1d04431a072dba081",
        head_branch: "main",
        name: "Trilha A auditoria privada HML",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
    ],
  },
  "/actions/runs/42666864017/artifacts?per_page=100&page=1": {
    total_count: 0,
    artifacts: [],
  },
};
const R15_R14_RESPONSES = {
  "/actions/runs/42694401246": {
    id: 42694401246,
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    name: "ContaOS Frontend Zero-Drift",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:35:22Z",
    updated_at: "2026-11-09T20:36:36Z",
  },
  "/actions/runs/42694401246/attempts/1": {
    id: 42694401246,
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    name: "ContaOS Frontend Zero-Drift",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:35:22Z",
    updated_at: "2026-11-09T20:36:36Z",
  },
  "/actions/runs/42694401246/attempts/1/jobs?per_page=100&page=1": {
    total_count: 2,
    jobs: [
      {
        id: 129422257245,
        run_id: 42694401246,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "ContaOS Frontend Zero-Drift",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:26Z",
            completed_at: "2026-11-09T20:35:26Z",
          },
          {
            number: 2,
            name: "Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:26Z",
            completed_at: "2026-11-09T20:35:28Z",
          },
          {
            number: 3,
            name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:28Z",
            completed_at: "2026-11-09T20:35:29Z",
          },
          {
            number: 4,
            name: "P0 V1 — autotestes do inventario e dispensas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:29Z",
            completed_at: "2026-11-09T20:35:29Z",
          },
          {
            number: 5,
            name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:29Z",
            completed_at: "2026-11-09T20:35:29Z",
          },
          {
            number: 6,
            name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:29Z",
            completed_at: "2026-11-09T20:35:29Z",
          },
          {
            number: 7,
            name: "Autoteste do guard (casos permitidos e proibidos)",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:29Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 8,
            name: "Verificar contrato de seguranca do Auto-Lock por PR",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 9,
            name: "Verificar fronteira frontend/backend e PLAN validado prévio",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 10,
            name: "Autotestes do snapshot canônico e matriz de telas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 11,
            name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:31Z",
          },
          {
            number: 12,
            name: "GOV-003 — exigir token valido e fonte viva antes do merge",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:31Z",
            completed_at: "2026-11-09T20:35:31Z",
          },
          {
            number: 13,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:31Z",
            completed_at: "2026-11-09T20:35:34Z",
          },
          {
            number: 14,
            name: "Setup Bun",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:34Z",
            completed_at: "2026-11-09T20:35:44Z",
          },
          {
            number: 15,
            name: "Install frozen dependencies",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:44Z",
            completed_at: "2026-11-09T20:35:45Z",
          },
          {
            number: 16,
            name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:45Z",
            completed_at: "2026-11-09T20:35:46Z",
          },
          {
            number: 17,
            name: "Lint e formatacao do saneamento transversal",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:46Z",
            completed_at: "2026-11-09T20:35:47Z",
          },
          {
            number: 18,
            name: "Production build — geração canônica TanStack antes dos testes longos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:47Z",
            completed_at: "2026-11-09T20:35:50Z",
          },
          {
            number: 19,
            name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:50Z",
            completed_at: "2026-11-09T20:35:50Z",
          },
          {
            number: 20,
            name: "Full regression — Vitest 2 workers",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:50Z",
            completed_at: "2026-11-09T20:36:24Z",
          },
          {
            number: 21,
            name: "TypeScript typecheck",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:24Z",
            completed_at: "2026-11-09T20:36:32Z",
          },
          {
            number: 22,
            name: "Brand-01, PT-BR, secrets and types integrity",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:32Z",
            completed_at: "2026-11-09T20:36:33Z",
          },
          {
            number: 43,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:33Z",
            completed_at: "2026-11-09T20:36:33Z",
          },
          {
            number: 44,
            name: "Post Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:33Z",
            completed_at: "2026-11-09T20:36:33Z",
          },
          {
            number: 45,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:33Z",
            completed_at: "2026-11-09T20:36:33Z",
          },
        ],
      },
      {
        id: 129422258076,
        run_id: 42694401246,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:27Z",
            completed_at: "2026-11-09T20:35:28Z",
          },
          {
            number: 2,
            name: "Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:28Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 3,
            name: "Detectar escopo de auditoria visual",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 4,
            name: "Setup Bun",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 5,
            name: "Instalar dependencias congeladas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 6,
            name: "Cache do Chromium Playwright 1.64.1",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 7,
            name: "Instalar Playwright isolado, sem atualizar package/lock",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 8,
            name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 9,
            name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 10,
            name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 11,
            name: "Evidencia permanente de screenshots e SHA256SUMS",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 12,
            name: "Confirmar que nenhuma fonte versionada foi editada",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 24,
            name: "Post Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
          {
            number: 25,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:35:30Z",
            completed_at: "2026-11-09T20:35:30Z",
          },
        ],
      },
    ],
  },
  "/actions/runs/42694609672": {
    id: 42694609672,
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    name: "ContaOS Trilha A Fixtures",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:36:39Z",
    updated_at: "2026-11-09T20:37:15Z",
  },
  "/actions/runs/42694609672/attempts/1": {
    id: 42694609672,
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    name: "ContaOS Trilha A Fixtures",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:36:39Z",
    updated_at: "2026-11-09T20:37:15Z",
  },
  "/actions/runs/42694609672/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129422980268,
        run_id: 42694609672,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "failure",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:42Z",
            completed_at: "2026-11-09T20:36:43Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:43Z",
            completed_at: "2026-11-09T20:36:45Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:45Z",
            completed_at: "2026-11-09T20:36:46Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:46Z",
            completed_at: "2026-11-09T20:36:49Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:49Z",
            completed_at: "2026-11-09T20:37:00Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:00Z",
            completed_at: "2026-11-09T20:37:01Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T20:37:01Z",
            completed_at: "2026-11-09T20:37:12Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T20:37:12Z",
            completed_at: "2026-11-09T20:37:12Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:12Z",
            completed_at: "2026-11-09T20:37:13Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:13Z",
            completed_at: "2026-11-09T20:37:13Z",
          },
        ],
      },
      {
        id: 129422982805,
        run_id: 42694609672,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129423314958,
        run_id: 42694609672,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A preparacao sintetica HML",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
    ],
  },
  "/actions/runs/42694609740": {
    id: 42694609740,
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    name: "ContaOS Trilha A Autenticada",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:36:39Z",
    updated_at: "2026-11-09T20:37:09Z",
  },
  "/actions/runs/42694609740/attempts/1": {
    id: 42694609740,
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    name: "ContaOS Trilha A Autenticada",
    head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
      private: false,
      owner: {
        id: 352205055,
        login: "contaos999999",
      },
    },
    created_at: "2026-11-09T20:36:39Z",
    updated_at: "2026-11-09T20:37:09Z",
  },
  "/actions/runs/42694609740/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129422980473,
        run_id: 42694609740,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:42Z",
            completed_at: "2026-11-09T20:36:44Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:44Z",
            completed_at: "2026-11-09T20:36:45Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:45Z",
            completed_at: "2026-11-09T20:36:48Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:48Z",
            completed_at: "2026-11-09T20:36:51Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:36:51Z",
            completed_at: "2026-11-09T20:37:03Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:03Z",
            completed_at: "2026-11-09T20:37:05Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:05Z",
            completed_at: "2026-11-09T20:37:05Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:05Z",
            completed_at: "2026-11-09T20:37:05Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:05Z",
            completed_at: "2026-11-09T20:37:06Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T20:37:06Z",
            completed_at: "2026-11-09T20:37:06Z",
          },
        ],
      },
      {
        id: 129422983606,
        run_id: 42694609740,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129423257559,
        run_id: 42694609740,
        run_attempt: 1,
        head_sha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
        head_branch: "main",
        name: "Trilha A auditoria privada HML",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
    ],
  },
  "/actions/runs/42694609672/artifacts?per_page=100&page=1": {
    total_count: 0,
    artifacts: [],
  },
};
const R8_R7_RESPONSES = {
  "/actions/runs/42601246471": {
    id: 42601246471,
    name: "ContaOS Frontend Zero-Drift",
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T10:29:34Z",
    updated_at: "2026-11-09T10:30:39Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601246471/attempts/1": {
    id: 42601246471,
    name: "ContaOS Frontend Zero-Drift",
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T10:29:34Z",
    updated_at: "2026-11-09T10:30:40Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601246471/attempts/1/jobs?per_page=100&page=1": {
    total_count: 2,
    jobs: [
      {
        id: 129105989688,
        run_id: 42601246471,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "ContaOS Frontend Zero-Drift",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:36Z",
            completed_at: "2026-11-09T10:29:37Z",
          },
          {
            number: 2,
            name: "Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:37Z",
            completed_at: "2026-11-09T10:29:38Z",
          },
          {
            number: 3,
            name: "P0 PRIORIDADE ZERO — 14 testes de sequência e certificação por versão",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:38Z",
            completed_at: "2026-11-09T10:29:39Z",
          },
          {
            number: 4,
            name: "P0 V1 — autotestes do inventario e dispensas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:39Z",
            completed_at: "2026-11-09T10:29:39Z",
          },
          {
            number: 5,
            name: "P0 V1 — integridade dos 416 critérios, 45 prompts e 37 atomicos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:39Z",
            completed_at: "2026-11-09T10:29:39Z",
          },
          {
            number: 6,
            name: "P0 PRIORIDADE ZERO — proibir avançar V2 antes de certificar V1",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:39Z",
            completed_at: "2026-11-09T10:29:39Z",
          },
          {
            number: 7,
            name: "Autoteste do guard (casos permitidos e proibidos)",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:39Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 8,
            name: "Verificar contrato de seguranca do Auto-Lock por PR",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 9,
            name: "Verificar fronteira frontend/backend e PLAN validado prévio",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 10,
            name: "Autotestes do snapshot canônico e matriz de telas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 11,
            name: "Verificar HEAD vivo do repositório normativo antes de BUILD",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:41Z",
          },
          {
            number: 12,
            name: "GOV-003 — exigir token valido e fonte viva antes do merge",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:41Z",
            completed_at: "2026-11-09T10:29:41Z",
          },
          {
            number: 13,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:41Z",
            completed_at: "2026-11-09T10:29:42Z",
          },
          {
            number: 14,
            name: "Setup Bun",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:42Z",
            completed_at: "2026-11-09T10:29:52Z",
          },
          {
            number: 15,
            name: "Install frozen dependencies",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:52Z",
            completed_at: "2026-11-09T10:29:54Z",
          },
          {
            number: 16,
            name: "GOV-020 — autotestes de rota limpa, alterada, excluída e não versionada",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:54Z",
            completed_at: "2026-11-09T10:29:54Z",
          },
          {
            number: 17,
            name: "Lint e formatacao do saneamento transversal",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:54Z",
            completed_at: "2026-11-09T10:29:55Z",
          },
          {
            number: 18,
            name: "Production build — geração canônica TanStack antes dos testes longos",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:55Z",
            completed_at: "2026-11-09T10:29:58Z",
          },
          {
            number: 19,
            name: "GOV-020 — bloquear divergência entre routeTree gerado e commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:58Z",
            completed_at: "2026-11-09T10:29:58Z",
          },
          {
            number: 20,
            name: "Full regression — Vitest 2 workers",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:58Z",
            completed_at: "2026-11-09T10:30:28Z",
          },
          {
            number: 21,
            name: "TypeScript typecheck",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:28Z",
            completed_at: "2026-11-09T10:30:36Z",
          },
          {
            number: 22,
            name: "Brand-01, PT-BR, secrets and types integrity",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:36Z",
            completed_at: "2026-11-09T10:30:36Z",
          },
          {
            number: 43,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:36Z",
            completed_at: "2026-11-09T10:30:36Z",
          },
          {
            number: 44,
            name: "Post Checkout immutable commit",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:36Z",
            completed_at: "2026-11-09T10:30:36Z",
          },
          {
            number: 45,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:36Z",
            completed_at: "2026-11-09T10:30:36Z",
          },
        ],
      },
      {
        id: 129105990079,
        run_id: 42601246471,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:37Z",
            completed_at: "2026-11-09T10:29:38Z",
          },
          {
            number: 2,
            name: "Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:38Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 3,
            name: "Detectar escopo de auditoria visual",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 4,
            name: "Setup Bun",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 5,
            name: "Instalar dependencias congeladas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 6,
            name: "Cache do Chromium Playwright 1.64.1",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 7,
            name: "Instalar Playwright isolado, sem atualizar package/lock",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 8,
            name: "Executar servidor de desenvolvimento isolado do mesmo SHA",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 9,
            name: "GOV-020 — verificar routeTree após Vite dev e antes do Playwright",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 10,
            name: "Teste C Playwright — 24 telas, 4 larguras, 2 temas",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 11,
            name: "Evidencia permanente de screenshots e SHA256SUMS",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 12,
            name: "Confirmar que nenhuma fonte versionada foi editada",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 24,
            name: "Post Checkout SHA imutavel, apenas leitura",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
          {
            number: 25,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:29:40Z",
            completed_at: "2026-11-09T10:29:40Z",
          },
        ],
      },
    ],
  },
  "/actions/runs/42601383933": {
    id: 42601383933,
    name: "ContaOS Trilha A Fixtures",
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    created_at: "2026-11-09T10:30:41Z",
    updated_at: "2026-11-09T10:33:58Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601383933/attempts/1": {
    id: 42601383933,
    name: "ContaOS Trilha A Fixtures",
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "failure",
    created_at: "2026-11-09T10:30:41Z",
    updated_at: "2026-11-09T10:33:58Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601383933/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129106437562,
        run_id: 42601383933,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:44Z",
            completed_at: "2026-11-09T10:30:45Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:45Z",
            completed_at: "2026-11-09T10:30:46Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:46Z",
            completed_at: "2026-11-09T10:30:48Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:48Z",
            completed_at: "2026-11-09T10:30:51Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:51Z",
            completed_at: "2026-11-09T10:31:01Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:01Z",
            completed_at: "2026-11-09T10:31:02Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:02Z",
            completed_at: "2026-11-09T10:31:22Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:22Z",
            completed_at: "2026-11-09T10:31:22Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:22Z",
            completed_at: "2026-11-09T10:31:22Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:22Z",
            completed_at: "2026-11-09T10:31:22Z",
          },
        ],
      },
      {
        id: 129106439491,
        run_id: 42601383933,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129106715983,
        run_id: 42601383933,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A preparacao sintetica HML",
        status: "completed",
        conclusion: "failure",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:28Z",
            completed_at: "2026-11-09T10:31:29Z",
          },
          {
            number: 2,
            name: "Checkout imutavel do executor main",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:29Z",
            completed_at: "2026-11-09T10:31:31Z",
          },
          {
            number: 3,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:31Z",
            completed_at: "2026-11-09T10:31:34Z",
          },
          {
            number: 4,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:34Z",
            completed_at: "2026-11-09T10:31:46Z",
          },
          {
            number: 5,
            name: "Dependencias congeladas do executor",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:46Z",
            completed_at: "2026-11-09T10:31:48Z",
          },
          {
            number: 6,
            name: "Recibo inicial publico para as fases sem credenciais",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:48Z",
            completed_at: "2026-11-09T10:32:05Z",
          },
          {
            number: 7,
            name: "Reancorar deployment HML sem credenciais, antes do checkout da fonte",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:05Z",
            completed_at: "2026-11-09T10:32:10Z",
          },
          {
            number: 8,
            name: "Validar SHA ancestral antes de baixar ou executar a fonte",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:10Z",
            completed_at: "2026-11-09T10:32:10Z",
          },
          {
            number: 9,
            name: "Fonte aprovada em checkout separado, sem credenciais persistidas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:10Z",
            completed_at: "2026-11-09T10:32:12Z",
          },
          {
            number: 10,
            name: "Dependencias congeladas da fonte aprovada",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:12Z",
            completed_at: "2026-11-09T10:32:12Z",
          },
          {
            number: 11,
            name: "Run actions/cache@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:12Z",
            completed_at: "2026-11-09T10:32:12Z",
          },
          {
            number: 12,
            name: "Run ./node_modules/.bin/playwright install --with-deps chromium",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:12Z",
            completed_at: "2026-11-09T10:32:43Z",
          },
          {
            number: 13,
            name: "Barreira nativa no mesmo HEAD antes de secrets",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:32:43Z",
            completed_at: "2026-11-09T10:33:27Z",
          },
          {
            number: 14,
            name: "Preparacao e SSR sem credenciais privadas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:33:27Z",
            completed_at: "2026-11-09T10:33:36Z",
          },
          {
            number: 15,
            name: "Revalidar main e unicidade dentro da concorrencia antes de secrets",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T10:33:36Z",
            completed_at: "2026-11-09T10:33:53Z",
          },
          {
            number: 16,
            name: "Somente agora fornecer o par sintetico ao preparador separado",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:33:53Z",
            completed_at: "2026-11-09T10:33:53Z",
          },
          {
            number: 17,
            name: "Verificar hashes gerados, inclusive em resultado parcial",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T10:33:53Z",
            completed_at: "2026-11-09T10:33:53Z",
          },
          {
            number: 18,
            name: "Evidencia privada imutavel por 90 dias",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-11-09T10:33:53Z",
            completed_at: "2026-11-09T10:33:53Z",
          },
          {
            number: 33,
            name: "Post Run actions/cache@v4",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:33:53Z",
            completed_at: "2026-11-09T10:33:53Z",
          },
          {
            number: 34,
            name: "Post Fonte aprovada em checkout separado, sem credenciais persistidas",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:33:53Z",
            completed_at: "2026-11-09T10:33:54Z",
          },
          {
            number: 35,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "skipped",
            started_at: "2026-11-09T10:33:54Z",
            completed_at: "2026-11-09T10:33:54Z",
          },
          {
            number: 36,
            name: "Post Checkout imutavel do executor main",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:33:54Z",
            completed_at: "2026-11-09T10:33:54Z",
          },
          {
            number: 37,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:33:54Z",
            completed_at: "2026-11-09T10:33:54Z",
          },
        ],
      },
    ],
  },
  "/actions/runs/42601384052": {
    id: 42601384052,
    name: "ContaOS Trilha A Autenticada",
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T10:30:41Z",
    updated_at: "2026-11-09T10:31:05Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601384052/attempts/1": {
    id: 42601384052,
    name: "ContaOS Trilha A Autenticada",
    workflow_id: 411115674,
    path: ".github/workflows/contaos-trilha-a-authenticated.yml",
    head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
    head_branch: "main",
    event: "workflow_run",
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-09T10:30:42Z",
    updated_at: "2026-11-09T10:31:05Z",
    repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
    head_repository: {
      id: 1442722734,
      full_name: "contaos999999/contaos-hml-control",
    },
  },
  "/actions/runs/42601384052/attempts/1/jobs?per_page=100&page=1": {
    total_count: 3,
    jobs: [
      {
        id: 129106437990,
        run_id: 42601384052,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A solicitacao unica sem credenciais",
        status: "completed",
        conclusion: "success",
        steps: [
          {
            number: 1,
            name: "Set up job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:44Z",
            completed_at: "2026-11-09T10:30:45Z",
          },
          {
            number: 2,
            name: "Bootstrap publico confiavel antes de checkout ou token",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:45Z",
            completed_at: "2026-11-09T10:30:47Z",
          },
          {
            number: 3,
            name: "Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:47Z",
            completed_at: "2026-11-09T10:30:49Z",
          },
          {
            number: 4,
            name: "Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:49Z",
            completed_at: "2026-11-09T10:30:50Z",
          },
          {
            number: 5,
            name: "Run node --test scripts/ci/install-pinned-bun.test.mjs",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:30:50Z",
            completed_at: "2026-11-09T10:31:01Z",
          },
          {
            number: 6,
            name: "Run bun install --frozen-lockfile",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:01Z",
            completed_at: "2026-11-09T10:31:02Z",
          },
          {
            number: 7,
            name: "Provar evento e unicidade somente em metadados Actions",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:02Z",
            completed_at: "2026-11-09T10:31:03Z",
          },
          {
            number: 13,
            name: "Post Run actions/setup-node@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:03Z",
            completed_at: "2026-11-09T10:31:03Z",
          },
          {
            number: 14,
            name: "Post Run actions/checkout@v4",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:03Z",
            completed_at: "2026-11-09T10:31:03Z",
          },
          {
            number: 15,
            name: "Complete job",
            status: "completed",
            conclusion: "success",
            started_at: "2026-11-09T10:31:03Z",
            completed_at: "2026-11-09T10:31:03Z",
          },
        ],
      },
      {
        id: 129106440087,
        run_id: 42601384052,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A protocolo e Chromium sem credenciais",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
      {
        id: 129106589401,
        run_id: 42601384052,
        run_attempt: 1,
        head_sha: "bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215",
        head_branch: "main",
        name: "Trilha A auditoria privada HML",
        status: "completed",
        conclusion: "skipped",
        steps: [],
      },
    ],
  },
  "/actions/runs/42601383933/artifacts?per_page=100&page=1": {
    total_count: 0,
    artifacts: [],
  },
};
test("R20 accepts only the new readonly recovery nonce", () => {
  const raw =
    JSON.stringify(
      {
        schema_version: 1,
        issue: 317,
        operation: "fixtures",
        request_id: "trilha-a-fixtures-20261110-r20",
        approved_parent_sha: "d51d3fcddf861fd127278ae5b20cd3e126d31f34",
        frontend_sha: "",
        deployment_id: "",
      },
      null,
      2,
    ) + "\n";
  assert.equal(
    sut.parseSingleRequest(raw, "fixtures").request_id,
    "trilha-a-fixtures-20261110-r20",
  );
});
const config = {
  origin: HML,
  frontendSha: "1".repeat(40),
  harnessSha: "2".repeat(40),
  deploymentId: "dpl_fixture123",
  emailPresent: true,
  passwordPresent: true,
};
test("configuração impede login sem segredo ou com destino diferente", () => {
  const validate = fn("validateConfiguration");
  assert.equal(validate(config).ready, true);
  for (const delta of [
    { emailPresent: false },
    { passwordPresent: false },
    { origin: "https://foreign.invalid" },
    { frontendSha: "main" },
    { harnessSha: "" },
    { deploymentId: "../" },
  ]) {
    assert.equal(validate({ ...config, ...delta }).ready, false);
  }
});
test("parser real ignora script inerte sem omitir executáveis", () => {
  const parse = fn("extractScriptEntries");
  const html =
    '<!doctype html><!-- <script src="/decoy.js"></script> --><template><script>decoy()</script></template><textarea><script>decoy()</script></textarea><script>bootstrap()</script><script type="module" src="/assets/a.js"></script>';
  const scripts = parse(html);
  assert.equal(scripts.length, 2);
  assert.equal(scripts[0].body, "bootstrap()");
  assert.equal(scripts[1].src, "/assets/a.js");
});
for (const html of [
  '<script src="/assets/a.js" SRC="https://foreign.invalid/a.js"></script>',
  '<base href="https://foreign.invalid"><script>ok()</script>',
  '<script nomodule src="/assets/a.js"></script>',
  '<script type="unexpected">a()</script>',
]) {
  test("HTML ambíguo ou execução não suportada falha fechada: " + html.slice(0, 28), () => {
    const parse = fn("extractScriptEntries");
    assert.throws(
      () => parse(html),
      (e) => e.code === "HTML_POLICY",
    );
  });
}
test("grafo inclui imports clássicos e templates constantes", () => {
  const imports = fn("scriptImports");
  assert.deepEqual(
    imports('import {a} from "./a.js"; export {b} from "./b.js"; const c=()=>import(`./c.js`);'),
    ["./a.js", "./b.js", "./c.js"],
  );
});
for (const code of [
  'import("./"+name)',
  "import(`./${name}.js`)",
  'import("https://foreign.invalid/a.js")',
  'import("../escape.js")',
]) {
  test("import não constante ou fora do grafo é negado: " + code, () => {
    const imports = fn("scriptImports");
    assert.throws(
      () => imports(code),
      (e) => e.code === "SCRIPT_POLICY",
    );
  });
}
const hydration =
  'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:1794136000000,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:1794136000000,s:"success",ssr:!0}]});';
test("hidratação admite só os dois timestamps dos matches confiáveis", () => {
  const normalize = fn("normalizeHydration");
  const later = hydration.replaceAll("1794136000000", "1794136000123");
  assert.equal(
    normalize(later, hydration),
    'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:0,s:"success",ssr:!0},R[2]={i:"\\0login\\0login",u:0,s:"success",ssr:!0}]});',
  );
});
for (const code of [
  hydration + ";exfiltrate()",
  hydration.replace('s:"success"', 's:"foreign"'),
  hydration.replace("u:1794136000000", "u:Date.now()"),
  hydration.replace("ssr:!0", "ssr:!0,u:1794136000001"),
  hydration.replace("hydrate", "executeForeign"),
]) {
  test("normalização não esconde mudança de código ou campo", () => {
    const normalize = fn("normalizeHydration");
    assert.throws(
      () => normalize(code, hydration),
      (e) => e.code === "HTML_DRIFT",
    );
  });
}
const html =
  '<!doctype html><html lang="pt-BR"><body><main>Entrar</main><script>' +
  hydration +
  '</script><script type="module" src="/assets/a.js"></script></body></html>';
const privateHydration =
  'hydrate({matches:R[0]=[R[1]={i:"__root__\\0",u:1794136000000,s:"success",ssr:!0},R[2]={i:"\\0selecionar-organizacao\\0selecionar-organizacao",u:1794136000000,s:"pending",ssr:!1}]});';
const privateHtml = html.replace(hydration, privateHydration);
test("hidratação privada CSR normaliza somente os dois timestamps do SSR local aprovado", async () => {
  const actual = privateHtml.replaceAll("1794136000000", "1794136000123");
  assert.equal(fn("compareHtml")(actual, privateHtml), true);
  assert.equal(
    await fn("verifyPublishedResponse")(
      {
        documents: { "/selecionar-organizacao": privateHtml },
      },
      {
        url: HML + "/selecionar-organizacao",
        resourceType: "Document",
        status: 200,
        body: Buffer.from(actual),
      },
    ),
    true,
  );
});
test("estado CSR não permite normalizar status, ssr, rota, código ou terceiro timestamp", () => {
  for (const delta of [
    privateHtml.replace('s:"pending"', 's:"success"'),
    privateHtml.replace("ssr:!1", "ssr:!0"),
    privateHtml.replace("selecionar-organizacao", "private-foreign-route"),
    privateHtml.replace("u:1794136000000", "u:Date.now()"),
    privateHtml.replace("ssr:!1", "ssr:!1,u:1794136000001"),
    privateHtml.replace("</script>", ";exfiltrate()</script>"),
    privateHtml.replace("<main>", '<main onload="exfiltrate()">'),
  ])
    assert.throws(
      () => fn("compareHtml")(delta, privateHtml),
      (e) => ["HTML_DRIFT", "HTML_POLICY"].includes(e.code),
    );
  for (const trusted of [
    privateHydration.replace('s:"pending"', 's:"foreign"'),
    privateHydration.replace("ssr:!1", "ssr:!0"),
    privateHydration.replace('s:"success"', 's:"pending"'),
    privateHydration.replace("ssr:!0", "ssr:!1"),
  ])
    assert.throws(
      () => fn("normalizeHydration")(trusted.replaceAll("1794136000000", "1794136000123"), trusted),
      (e) => e.code === "HTML_DRIFT",
    );
});
test("paridade cobre o documento inteiro e não apenas scripts", () => {
  const compare = fn("compareHtml");
  assert.equal(compare(html.replaceAll("1794136000000", "1794136000123"), html), true);
  for (const changed of [
    html.replace("<main>", '<main onload="exfiltrate()">'),
    html.replace("<main>", '<iframe srcdoc="bad"></iframe><main>'),
    html.replace("Entrar", "Tela falsa"),
    html.replace("/assets/a.js", "javascript:exfiltrate()"),
    html.replace("<main>", '<object data="https://foreign.invalid"></object><main>'),
  ]) {
    assert.throws(
      () => compare(changed, html),
      (e) => ["HTML_DRIFT", "HTML_POLICY"].includes(e.code),
    );
  }
});
test("SSR com NUL conserva bytes originais e normaliza apenas timestamps", () => {
  const compare = fn("compareHtml"),
    parse = fn("extractScriptEntries");
  const trusted = html.replaceAll("\\0", "\0");
  const actual = trusted.replaceAll("1794136000000", "1794136000123");
  assert.equal(parse(trusted)[0].body.includes("\0"), true);
  assert.equal(compare(actual, trusted), true);
  assert.throws(
    () => compare(actual.replace("__root__\0", "__root__X"), trusted),
    (e) => e.code === "HTML_DRIFT",
  );
});
const requests = [
  [HML + "/contratos", "GET", true],
  [HML + "/assets/a.js", "GET", true],
  [HML + "/_server/functions", "POST", false],
  [API + "/auth/v1/token?grant_type=password", "POST", true],
  [API + "/auth/v1/token?grant_type=unexpected", "POST", false],
  [API + "/auth/v1/user", "GET", true],
  [API + "/rest/v1/contratos?select=id", "GET", true],
  [API + "/rest/v1/contratos", "POST", false],
  [API + "/rest/v1/rpc/obter_visao_geral_competencia", "POST", true],
  [API + "/rest/v1/rpc/obter_visao_geral_competencia", "GET", false],
  [API + "/rest/v1/rpc/executar_comando_lista_v1", "POST", false],
  [API + "/rest/v1/rpc/executar_comando_lista_v1", "GET", false],
  [API + "/rest/v1/%72pc/executar_comando_lista_v1", "GET", false],
  [API + "/rest/v1/segredos", "GET", false],
  [API + "/functions/v1/storage-sign-upload", "POST", false],
  ["https://foreign.invalid/collect", "POST", false],
  ["https://gklhhhyosgasnyoxlrui.supabase.co.foreign.invalid/auth/v1/token", "POST", false],
  ["https://user:password@contaos-41-hml.vercel.app/", "GET", false],
];
for (const [url, method, expected] of requests) {
  test(`transporte ${method} ${new URL(url).pathname}: ${expected}`, () => {
    assert.equal(fn("requestAllowed")({ url, method }), expected);
  });
}
test("worker e websocket são negados mesmo em destino conhecido", () => {
  const allowed = fn("requestAllowed");
  assert.equal(
    allowed({ url: HML + "/assets/a.js", method: "GET", resourceType: "worker" }),
    false,
  );
  assert.equal(
    allowed({ url: "wss://gklhhhyosgasnyoxlrui.supabase.co/realtime/v1", method: "GET" }),
    false,
  );
});
const good = {
  surface: "V110",
  width: 1440,
  theme: "light",
  observedWidth: 1440,
  observedTheme: "light",
  routeExact: true,
  http: 200,
  sessionVerified: true,
  organizationVerified: true,
  shellVerified: true,
  h1: 1,
  overflowX: 0,
  brandCount: 1,
  privacySafe: true,
  errors: 0,
  blockedMutations: 0,
  screenshot: "screenshots/V110_1440_light.png",
  sha256: "a".repeat(64),
  dom: "dom/V110_1440_light.json",
  domSha256: "b".repeat(64),
};
test("prova automatizada não certifica visual sem evidência e medidas exatas", () => {
  const validate = fn("validateCase");
  assert.equal(validate(good), true);
  for (const delta of [
    { observedWidth: 1363 },
    { observedTheme: "dark" },
    { privacySafe: false },
    { http: 403 },
    { h1: 0 },
    { overflowX: 3 },
    { brandCount: 2 },
    { sha256: "" },
    { domSha256: "" },
    { screenshot: "../../secret.png" },
    { errors: 1 },
    { blockedMutations: 1 },
    { sessionVerified: false },
  ])
    assert.equal(validate({ ...good, ...delta }), false);
});
test("caso público não entra como nova prova privada", () => {
  assert.equal(fn("validateCase")({ ...good, surface: "SYS01" }), false);
});
test("coleção privada incompleta ou duplicada não vira PASS global", () => {
  const summarize = fn("summarizeCases");
  const surfaces = [
    "SYS04",
    "SYS05",
    "ADM01",
    "V101",
    "V102",
    "V103",
    "V104",
    "V105",
    "V106",
    "V107",
    "V108",
    "V109",
    "V110",
    "V111",
    "V112",
    "V113",
    "V114",
    "V115",
    "V116",
    "V117",
    "V118",
    "V119",
    "V120",
    "V121",
    "V122",
    "V123",
  ];
  const rows = surfaces.flatMap((surface) =>
    [1440, 1280, 768, 390].flatMap((width) =>
      ["light", "dark"].map((theme) => ({ surface, width, theme, status: "BLOQUEADO_FIXTURE" })),
    ),
  );
  assert.equal(summarize(rows).recorded, 208);
  assert.equal(summarize(rows).globalComplete, false);
  assert.equal(summarize(rows.slice(1)).matrixComplete, false);
  assert.equal(summarize([...rows.slice(1), rows[1]]).matrixComplete, false);
});
test("sanitização não publica e-mail, documento ou nome fora da fixture", () => {
  const safe = fn("safeArtifactText");
  assert.equal(
    safe(
      "Organização ContaOS HML Teste Situação ativa",
      new Set(["organização", "contaos", "hml", "teste", "situação", "ativa"]),
    ),
    true,
  );
  for (const value of [
    "pessoa.real@example.com",
    "123.456.789-01",
    "NomeRealNaoAutorizado",
    "Bearer eyJhbGciOiJIUzI1NiJ9.abc.def",
  ])
    assert.equal(safe(value, new Set(["organização", "contaos"])), false);
});

test("catálogo reconhece somente trechos sintéticos exatos já comprovados", () => {
  const safe = fn("safeArtifactText"),
    words = new Set();
  for (const value of [
    "AUD-A-VERCEL-20261108",
    "2de433a7-a84c-4575-aa2a-7699d2871b55",
    "773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103",
    "Fonte sintética para auditoria autenticada da Trilha A, sem dados pessoais ou efeito real.",
  ])
    assert.equal(safe(value, words), true, value);
  for (const value of [
    "AUD-A-VERCEL-20261109",
    "prefixAUD-A-VERCEL-20261108",
    "AUD-A-VERCEL-20261108suffix",
    "pessoais autenticada sintética",
    "2de433a7-a84c-4575-aa2a-7699d2871b56",
    "AUD-A-VERCEL-20261108 pessoa.real@example.com",
    "123.456.789-01",
    "Bearer eyJhbGc.abc.def",
  ])
    assert.equal(safe(value, words), false);
});

test("diagnóstico de privacidade contém apenas razões e contadores limitados", () => {
  const classify = fn("classifyArtifactText");
  assert.deepEqual(classify("texto permitido", new Set(["texto", "permitido"])), {
    reason: "ALLOWED",
    unknownCount: 0,
  });
  assert.deepEqual(classify("CANARIO_PRIVADO desconhecido", new Set()), {
    reason: "UNKNOWN_WORDS",
    unknownCount: 2,
  });
  for (const value of ["pessoa@example.com", "12345678901", "sb_secret_canario"]) {
    const result = classify(value, new Set([value]));
    assert.deepEqual(result, { reason: "SENSITIVE_PATTERN", unknownCount: 0 });
    assert.equal(JSON.stringify(result).includes(value), false);
  }
  assert.deepEqual(classify(null, new Set()), { reason: "INVALID_CONTENT", unknownCount: 0 });
  assert.equal(classify(Array(500).fill("desconhecido").join(" "), new Set()).unknownCount, 233);
});

test("retomada preserva18 casos desktop e exige recaptura dos6 móveis", () => {
  const preserved = fn("preservedPrivateCase");
  const rows = fn("privateCases")();
  assert.equal(rows.filter((item) => preserved(item)).length, 18);
  assert.equal(rows.filter((r) => !preserved(r)).length, 190);
  for (const row of rows.filter((item) => preserved(item))) {
    const result = preserved(row);
    assert.equal(result.status, "PRESERVADO_BASELINE");
    assert.equal(result.baselineRun, 42496235106);
    assert.equal(fn("validateCase")(result), false);
  }
  assert.equal(preserved({ surface: "V114", width: 999, theme: "light" }), null);
  assert.equal(preserved({ surface: "SYS04", width: 390, theme: "dark" }), null);
});

test("aborto preserva18 provas desktop e não inventa captura dos6 móveis", () => {
  const rows = fn("completePrivateRecords")([]);
  assert.equal(rows.length, 208);
  assert.equal(rows.filter((r) => r.status === "PRESERVADO_BASELINE").length, 18);
  assert.equal(rows.filter((r) => r.status === "BLOQUEADO_FIXTURE").length, 24);
  assert.equal(rows.filter((r) => r.status === "BLOQUEADO_EXECUCAO_INTERROMPIDA").length, 166);
  assert.equal(fn("summarizeCases")(rows).passed, 0);
  const visited = [{ ...fn("privateCases")()[0], status: "BLOQUEADO_PII" }];
  assert.equal(fn("completePrivateRecords")(visited)[0], visited[0]);
});

test("catálogo fechado de perfis e fixtures não libera recombinações", () => {
  const safe = fn("safeArtifactText");
  for (const text of [
    "direcao aprovador",
    "juridico conformidade",
    "prestacao contas",
    "rh dp",
    "Registro sintético para testes autenticados HML",
    "Contrato sintético de homologação para auditoria autenticada da Trilha A, sem efeitos financeiros reais.",
  ])
    assert.equal(safe(text, new Set()), true, text);
  for (const text of [
    "direcao contas",
    "rh aprovador",
    "Registro sintético desconhecido",
    "AUDITORIA TRILHA A VERCEL 20261109",
  ])
    assert.equal(safe(text, new Set()), false);
});

test("metadados ARIA são reconhecidos somente na posição estrutural do snapshot", () => {
  const classify = fn("classifyArtifactText");
  assert.equal(
    classify('- application:\n  - caption: teste\n  - searchbox "teste"', new Set(["teste"]), {
      snapshot: true,
    }).reason,
    "ALLOWED",
  );
  for (const text of ["application caption searchbox", "- application: pessoa_nao_autorizada"])
    assert.equal(classify(text, new Set(), { snapshot: true }).reason, "UNKNOWN_WORDS");
  assert.equal(classify('- searchbox "teste"', new Set(["teste"])).reason, "UNKNOWN_WORDS");
});

test("datas de atualização completas são limitadas ao dia e relógio aprovados", () => {
  const safe = fn("safeArtifactText");
  for (const text of [
    "Atualizado em 08/11/2026 13:09:07",
    "Atualizado em 08/11/2026 00:58",
    "01/01/2026",
    "2026-01-01",
  ])
    assert.equal(safe(text, new Set()), true, text);
  for (const text of [
    "Atualizado em 09/11/2026 13:09:07",
    "Atualizado em 08/11/2026 24:01:00",
    "Atualizado em 08/11/2026 13:60:00",
    "13:09:07",
    "Atualizado em 08/11/2026 13:09:07 pessoa@example.com",
  ])
    assert.equal(safe(text, new Set()), false, text);
});

test("candidato de data malformada não recai no dicionário real de contadores", async () => {
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  for (const value of [
    "Atualizado em 08/11/2026 12:34:56:78",
    "Atualizado em 08/11/2026 12:34:111",
    "Atualizado em 08/11/2026 25:34:11",
    "Atualizado em 08/11/2026",
    "Atualizado em 08/11/2026 12:34:56/78",
    "Atualizado em 08/11/2026 12:34:56 texto",
  ])
    assert.equal(fn("safeArtifactText")(value, words), false, value);
});

test("navegação não retorna com header antigo e verificação CDP pendente", async () => {
  const events = [];
  const heading = Promise.withResolvers(),
    drain = Promise.withResolvers();
  let drainCount = 0,
    completed = false;
  const page = {
      getByRole(role) {
        return role === "link"
          ? {
              first() {
                return {
                  async click() {
                    events.push("click");
                  },
                };
              },
            }
          : {
              async waitFor() {
                events.push("heading");
                await heading.promise;
              },
            };
      },
      async waitForURL() {
        events.push("url");
      },
      async waitForFunction() {
        events.push("org");
      },
      async waitForLoadState() {
        events.push("networkidle");
      },
    },
    fence = {
      async drain() {
        events.push("drain");
        if (++drainCount === 2) await drain.promise;
      },
      assertSafe() {
        events.push("safe");
      },
    };
  const running = fn("navigationProbe")(page, { surface: "V102", width: 1440 }, fence).then(() => {
    completed = true;
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(completed, false);
  assert.ok(events.includes("heading"));
  heading.resolve();
  await new Promise((r) => setImmediate(r));
  assert.equal(completed, false);
  drain.resolve();
  await running;
  assert.equal(completed, true);
  assert.ok(events.indexOf("safe") < events.indexOf("click"));
});

test("resize aguarda a cerca antes de alterar o viewport", async () => {
  const gate = Promise.withResolvers(),
    events = [];
  let count = 0;
  const page = {
    async waitForLoadState() {},
    async setViewportSize() {
      events.push("resize");
    },
  };
  const fence = {
    async drain() {
      if (++count === 1) await gate.promise;
    },
    assertSafe() {
      events.push("safe");
    },
  };
  const running = fn("resizeVerifiedPage")(page, fence, 390);
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(events, []);
  gate.resolve();
  await running;
  assert.equal(events[0], "safe");
  assert.equal(events[1], "resize");
});

test("erro CDP diagnóstico recusa texto e códigos inesperados", () => {
  const classify = fn("classifyCdpError");
  assert.deepEqual(classify({ code: -32000, message: "No resource with given identifier found" }), {
    protocolCode: -32000,
    reason: "NO_RESOURCE",
  });
  const out = classify({ code: 12345, message: "CANARIO_PRIVADO pessoa@example.com" });
  assert.deepEqual(out, { protocolCode: null, reason: "OTHER" });
  assert.equal(JSON.stringify(out).includes("CANARIO"), false);
});

test("complemento sintético confere hashes dos cinco DOMs de origem", async () => {
  const { readFile } = await import("node:fs/promises"),
    { createHash } = await import("node:crypto");
  const root = new URL("../../", import.meta.url),
    words = await fn("literalWords")(root.pathname);
  for (const [name, sha] of [
    ["ADM01-dom.txt", "20e4fd4325f28f6755fccef14654e87ca186e511cfdba3e321708d6bb2cb6f0f"],
    ["V101-persisted-dom.txt", "6d772f3c4bcd3bc0f19dc01099388c5c808e7c809b4d5ef1d91a3c07e2c9d8be"],
    ["V104-created-dom.txt", "089423efdce49811281483fb508ae904d86bff29b7404cd2385f9b882c5aafac"],
    ["DRAWER-dom.txt", "63ed654cd3a1906107e30a1e6ac89fbfc47a04d9c84cbbc17b3793aab015dd02"],
    ["SYS05-dom.txt", "610e7ad7e379f57344eb4508824c8de4aa7f7a55d886bdbaacd3aeecdf2aa93b"],
  ]) {
    const text = await readFile(
      new URL("docs/frontend/auditorias/evidencias/vercel-auth-20261108/" + name, root),
      "utf8",
    );
    assert.equal(createHash("sha256").update(text).digest("hex"), sha);
    assert.equal(fn("safeArtifactText")(text, words, { snapshot: true }), true, name);
  }
});

test("DOMs sintéticos versionados mantêm origem SHA256 e passam sem catálogo genérico", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const { resolve } = await import("node:path");
  const root = resolve(new URL("../../", import.meta.url).pathname);
  const words = await fn("literalWords")(root);
  for (const [file, hash] of [
    ["V107-fonte-dom.txt", "89fa16ff7c7e0a82e4ed79e9bd9612f606ba2c4bddb7adbed1371bddb2dc28d0"],
    [
      "V107-fonte-detalhe-dom.txt",
      "4b3fdb209b8f476d88aedb5e8d21271d6feec31d8aac01fe758be47f28c40a62",
    ],
    ["V111-dom.txt", "8e6ed25cabf1c4edbe82c5d95ff0be7f5fddc2a6f29855b32cc05524636ed596"],
  ]) {
    const text = await readFile(
      resolve(root, "docs/frontend/auditorias/evidencias/reancoragem-auth-20261108", file),
      "utf8",
    );
    assert.equal(createHash("sha256").update(text).digest("hex"), hash);
    assert.equal(fn("safeArtifactText")(text, words), true, file);
  }
  const original = await readFile(
    resolve(
      root,
      "docs/frontend/auditorias/evidencias/continuacao-auth-20261108/FONTE_SINTETICA_AUDITORIA_HML.txt",
    ),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(original).digest("hex"),
    "773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103",
  );
  assert.equal(fn("safeArtifactText")(original, new Set()), true);
  assert.equal(words.has("pessoais"), false);
  assert.equal(fn("safeArtifactText")("pessoais autenticada sintética", words), false);
});

const publicEnv = {
  VITE_VERCEL_BRANCH_URL: "contaos-41-hml-git-main-contaos9999.vercel.app",
  VITE_VERCEL_DEPLOYMENT_ID: "dpl_fixture123",
  VITE_VERCEL_ENV: "production",
  VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN: "contaos9999",
  VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME: "ContaOS",
  VITE_VERCEL_GIT_COMMIT_MESSAGE: "Synthetic fixture build",
  VITE_VERCEL_GIT_COMMIT_REF: "main",
  VITE_VERCEL_GIT_COMMIT_SHA: "1".repeat(40),
  VITE_VERCEL_GIT_PREVIOUS_SHA: "",
  VITE_VERCEL_GIT_PROVIDER: "github",
  VITE_VERCEL_GIT_PULL_REQUEST_ID: "",
  VITE_VERCEL_GIT_REPO_ID: "1442722734",
  VITE_VERCEL_GIT_REPO_OWNER: "contaos999999",
  VITE_VERCEL_GIT_REPO_SLUG: "contaos-hml-control",
  VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG: JSON.stringify({
    analytics: {
      scriptSrc: "d5945c2254afc21e/script.js",
      viewEndpoint: "d5945c2254afc21e/view",
      eventEndpoint: "d5945c2254afc21e/event",
      sessionEndpoint: "d5945c2254afc21e/session",
    },
    speedInsights: { scriptSrc: "ba48403b98e1edac/script.js", endpoint: "ba48403b98e1edac/vitals" },
  }),
  VITE_VERCEL_PROJECT_ID: "prj_JtEWXg54EIYcQPwVzFiQyJcVIlFo",
  VITE_VERCEL_PROJECT_PRODUCTION_URL: "contaos-41-hml.vercel.app",
  VITE_VERCEL_TARGET_ENV: "production",
  VITE_VERCEL_URL: "contaos-41-fixture123-contaos9999.vercel.app",
};
const clientConfig = {
  BASE_URL: "/",
  DEV: false,
  MODE: "production",
  PROD: true,
  SSR: false,
  TSS_DEV_SERVER: "false",
  TSS_DEV_SSR_STYLES_BASEPATH: "/",
  TSS_DEV_SSR_STYLES_ENABLED: "true",
  TSS_DISABLE_CSRF_MIDDLEWARE_WARNING: "false",
  TSS_INLINE_CSS_ENABLED: "false",
  TSS_ROUTER_BASEPATH: "",
  TSS_SERVER_FN_BASE: "/_serverFn/",
  VITE_SUPABASE_PROJECT_ID: "gklhhhyosgasnyoxlrui",
  VITE_SUPABASE_URL: API,
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sHKZ-UiYCbkEFMqR1QbHMA_iCSLL8Am",
};
test("metadados públicos extraídos por AST devem corresponder ao deployment aprovado", () => {
  const extract = fn("extractPublicBuildEnvironment");
  const source = "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv }) + ";";
  const result = extract(new Map([["module.js", source]]), config);
  assert.equal(Object.keys(result).length, 19);
  assert.equal(result.VITE_VERCEL_GIT_COMMIT_SHA, "1".repeat(40));
});
const deploymentModules = (delta = {}) =>
  new Map([
    ["module.js", "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv, ...delta }) + ";"],
  ]);
test("reancoragem descobre identidade validada sem pins e preserva pins explícitos", () => {
  const resolve = fn("resolveDeploymentIdentity");
  const expected = { frontendSha: config.frontendSha, deploymentId: config.deploymentId };
  assert.deepEqual(resolve(deploymentModules()), expected);
  assert.deepEqual(resolve(deploymentModules(), { frontendSha: "", deploymentId: "" }), expected);
  assert.deepEqual(resolve(deploymentModules(), expected), expected);
});
for (const pins of [
  { frontendSha: config.frontendSha },
  { deploymentId: config.deploymentId },
  { frontendSha: "3".repeat(40), deploymentId: config.deploymentId },
  { frontendSha: config.frontendSha, deploymentId: "dpl_oldfixture123" },
  { frontendSha: "main", deploymentId: config.deploymentId },
  { frontendSha: config.frontendSha, deploymentId: "dpl_inject123\nEVIL=1" },
])
  test("reancoragem nunca substitui pin incompleto, inválido ou obsoleto", () => {
    assert.throws(
      () => fn("resolveDeploymentIdentity")(deploymentModules(), pins),
      (e) => ["DEPLOYMENT_INPUT", "DEPLOYMENT_PIN_STALE"].includes(e.code),
    );
  });
for (const delta of [
  { VITE_VERCEL_GIT_COMMIT_SHA: "main" },
  { VITE_VERCEL_DEPLOYMENT_ID: "dpl_inject123\nEVIL=1" },
  { VITE_VERCEL_PROJECT_ID: "foreign" },
  { VITE_VERCEL_GIT_REPO_OWNER: "foreign" },
  { VITE_VERCEL_SECRET: "SYNTHETIC_PRIVATE_CANARY" },
])
  test("descoberta automática rejeita identidade inválida e configuração estrangeira", () => {
    assert.throws(
      () => fn("resolveDeploymentIdentity")(deploymentModules(delta)),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
  });
test("descoberta automática rejeita ausência, conflito e expressão executável", () => {
  const resolve = fn("resolveDeploymentIdentity");
  const conflict = deploymentModules();
  conflict.set(
    "other.js",
    deploymentModules({ VITE_VERCEL_GIT_COMMIT_SHA: "3".repeat(40) }).get("module.js"),
  );
  for (const modules of [
    new Map(),
    new Map([["module.js", "const empty={};"]]),
    conflict,
    new Map([
      [
        "module.js",
        deploymentModules()
          .get("module.js")
          .replace('"Synthetic fixture build"', "`${exfiltrate()}`"),
      ],
    ]),
  ])
    assert.throws(
      () => resolve(modules),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
});
test("outputs de workflow contêm apenas os dois identificadores validados", () => {
  const format = fn("deploymentWorkflowOutputs");
  const identity = { frontendSha: config.frontendSha, deploymentId: config.deploymentId };
  assert.deepEqual(format({ ...identity, secret: "SYNTHETIC_PRIVATE_CANARY" }), {
    environment: `CONTAOS_FRONTEND_SHA=${identity.frontendSha}\nCONTAOS_DEPLOYMENT_ID=${identity.deploymentId}\n`,
    outputs: `frontend_sha=${identity.frontendSha}\ndeployment_id=${identity.deploymentId}\n`,
  });
  for (const delta of [{ frontendSha: "main" }, { deploymentId: "dpl_inject123\nEVIL=1" }])
    assert.throws(
      () => format({ ...identity, ...delta }),
      (e) => e.code === "DEPLOYMENT_INPUT",
    );
});
test("classificador reconhece falhas de navegação definidas no Playwright congelado", () => {
  const classify = fn("classifyRuntimeError");
  for (const [message, reason] of [
    ["page.waitForURL: Navigation failed because page crashed!", "PAGE_CRASHED"],
    ["page.waitForURL: Navigating frame was detached!", "FRAME_DETACHED"],
    [
      'page.waitForURL: Navigation to "https://private.invalid/SYNTHETIC_PRIVATE_CANARY" is interrupted by another navigation to "https://private.invalid/"',
      "NAVIGATION_INTERRUPTED",
    ],
    [
      "page.waitForURL: net::ERR_FAILED at https://private.invalid/SYNTHETIC_PRIVATE_CANARY",
      "NETWORK_FAILED",
    ],
    ["page.waitForURL: net::ERR_EMPTY_RESPONSE", "NETWORK_EMPTY_RESPONSE"],
    ["page.waitForURL: net::ERR_BLOCKED_BY_CLIENT", "NETWORK_BLOCKED_CLIENT"],
    ["page.waitForURL: net::ERR_HTTP_RESPONSE_CODE_FAILURE", "NETWORK_HTTP_RESPONSE"],
  ]) {
    const value = classify({ name: "Error", message });
    assert.equal(value.reason, reason);
    assert.equal(JSON.stringify(value).includes("SYNTHETIC_PRIVATE_CANARY"), false);
  }
});
test("classificador local distingue erro de navegação sem persistir mensagem privada", () => {
  const classify = fn("classifyRuntimeError");
  for (const [message, reason] of [
    [
      "page.waitForURL: net::ERR_ABORTED at https://private.invalid/SYNTHETIC_PRIVATE_CANARY",
      "NAVIGATION_ABORTED",
    ],
    [
      "page.evaluate: Execution context was destroyed, most likely because of a navigation.",
      "CONTEXT_DESTROYED",
    ],
    ["page.waitForURL: Target page, context or browser has been closed", "TARGET_CLOSED"],
    ["page.evaluate: Refused to evaluate a string as JavaScript because unsafe-eval", "CSP_EVAL"],
    ["SYNTHETIC_PRIVATE_CANARY", "UNKNOWN"],
  ]) {
    const value = classify({ name: "Error", message, stack: "SYNTHETIC_PRIVATE_CANARY" });
    assert.equal(value.reason, reason);
    assert.equal(JSON.stringify(value).includes("SYNTHETIC_PRIVATE_CANARY"), false);
  }
  assert.deepEqual(
    classify({ name: "SYNTHETIC_PRIVATE_CANARY", message: "SYNTHETIC_PRIVATE_CANARY" }),
    { name: "UNKNOWN", operation: "UNKNOWN", reason: "UNKNOWN" },
  );
  assert.equal(classify({ name: "TimeoutError" }).reason, "TIMEOUT");
});
for (const delta of [
  { VITE_VERCEL_SECRET: "unexpected" },
  { VITE_VERCEL_GIT_COMMIT_SHA: "3".repeat(40) },
  { VITE_VERCEL_GIT_REPO_OWNER: "foreign" },
  { VITE_SUPABASE_URL: "https://foreign.invalid" },
  { VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_not_permitted" },
  { VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG: "https://foreign.invalid" },
]) {
  test("metadado ambíguo, secreto ou de outro projeto é negado", () => {
    const extract = fn("extractPublicBuildEnvironment");
    assert.throws(
      () =>
        extract(
          new Map([
            [
              "module.js",
              "const env=" + JSON.stringify({ ...clientConfig, ...publicEnv, ...delta }) + ";",
            ],
          ]),
          config,
        ),
      (e) => e.code === "BUILD_ENV_POLICY",
    );
  });
}
test("extração não executa propriedades calculadas ou interpoladas", () => {
  const extract = fn("extractPublicBuildEnvironment");
  const source =
    "const env=" +
    JSON.stringify({ ...clientConfig, ...publicEnv }).replace(
      '"Synthetic fixture build"',
      "`${exfiltrate()}`",
    ) +
    ";";
  assert.throws(
    () => extract(new Map([["module.js", source]]), config),
    (e) => e.code === "BUILD_ENV_POLICY",
  );
});
test("CSS, fontes e marca devem ter os mesmos bytes antes de entrega ao browser", () => {
  const compare = fn("assetBytesMatch");
  for (const bytes of [
    Buffer.from("body{color:#000}"),
    Buffer.from([1, 2, 3, 4]),
    Buffer.from('<svg viewBox="0 0 16 16"></svg>'),
  ]) {
    assert.equal(compare(bytes, Buffer.from(bytes)), true);
    const changed = Buffer.from(bytes);
    changed[0] ^= 1;
    assert.equal(compare(bytes, changed), false);
    assert.equal(compare(bytes, bytes.subarray(1)), false);
  }
});
test("proxy nativo não encaminha CONNECT, HTTP ou bytes para destino não aprovado", async () => {
  const start = fn("startDestinationProxy");
  let downstreamConnections = 0,
    downstreamBytes = 0;
  const downstream = createServer((socket) => {
    downstreamConnections++;
    socket.on("data", (data) => {
      downstreamBytes += data.length;
    });
    socket.end();
  });
  await new Promise((resolve, reject) => {
    downstream.once("error", reject);
    downstream.listen(0, "127.0.0.1", resolve);
  });
  const proxy = await start();
  try {
    const port = new URL(proxy.url).port;
    for (const target of [
      `127.0.0.1:${downstream.address().port}`,
      "foreign.invalid:443",
      "contaos-41-hml.vercel.app.foreign.invalid:443",
      "user:password@contaos-41-hml.vercel.app:443",
      "contaos-41-hml.vercel.app:80",
    ]) {
      const response = await new Promise((resolve, reject) => {
        const socket = connect(Number(port), "127.0.0.1");
        let body = "";
        socket.setTimeout(3000, () => {
          socket.destroy();
          reject(Error("PROXY_TIMEOUT"));
        });
        socket.once("error", reject);
        socket.on("data", (data) => {
          body += data.toString();
        });
        socket.once("end", () => resolve(body));
        socket.once("connect", () =>
          socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\nSYNTHETIC_CANARY`),
        );
      });
      assert.match(response, /^HTTP\/1\.1 403/);
    }
    assert.equal(downstreamConnections, 0);
    assert.equal(downstreamBytes, 0);
    assert.equal(proxy.snapshot().blocked, 5);
  } finally {
    await proxy.close();
    await new Promise((resolve) => downstream.close(resolve));
  }
});
test("CDP aceita somente debugger local do processo esperado", () => {
  const validate = fn("nativeDebuggerEndpoint");
  const value = "ws://127.0.0.1:41357/devtools/browser/12345678-abcd-4000-9000-123456789abc";
  assert.equal(validate(value, 41357), value);
  for (const url of [
    value.replace("127.0.0.1", "foreign.invalid"),
    value.replace(":41357", ":41358"),
    value + "?token=canary",
    value.replace("/browser/", "/page/"),
    value.replace("ws:", "wss:"),
  ]) {
    assert.throws(
      () => validate(url, 41357),
      (e) => e.code === "CDP_ENDPOINT",
    );
  }
});
test("ambiente do navegador não herda credenciais nem opções de execução", () => {
  const clean = fn("browserEnvironment")({
    PATH: "/bin",
    HOME: "/tmp/fixture",
    LANG: "pt_BR.UTF-8",
    CONTAOS_HML_SYNTHETIC_PASSWORD: "SYNTHETIC_CANARY",
    NODE_OPTIONS: "--require=foreign",
    HTTP_PROXY: "http://foreign.invalid",
  });
  assert.deepEqual(clean, { PATH: "/bin", HOME: "/tmp/fixture", LANG: "pt_BR.UTF-8" });
  assert.equal(JSON.stringify(clean).includes("SYNTHETIC_CANARY"), false);
});
async function cdpFixture({
  holdFailure = false,
  rejectCache = false,
  rejectContinue = false,
} = {}) {
  const failureSent = Promise.withResolvers();
  let acknowledgeFailure;
  const received = [],
    peers = new Set();
  const identity = { targetId: "own-target", browserContextId: "own-context" };
  let port;
  const server = createHttpServer((_req, res) =>
    res.end(
      JSON.stringify({
        webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/browser/12345678-abcd-4000-9000-123456789abc`,
      }),
    ),
  );
  const ws = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) =>
    ws.handleUpgrade(req, socket, head, (peer) => ws.emit("connection", peer)),
  );
  ws.on("connection", (peer) => {
    peers.add(peer);
    peer.once("close", () => peers.delete(peer));
    peer.on("message", (raw) => {
      const command = JSON.parse(raw.toString());
      received.push(command);
      if (
        command.method === "Fixture.reject" ||
        (rejectCache && command.method === "Network.setCacheDisabled") ||
        (rejectContinue && command.method === "Fetch.continueResponse")
      )
        return peer.send(
          JSON.stringify({
            id: command.id,
            error: { code: -32601, message: "SYNTHETIC_CANARY_NOT_FOR_LOGS" },
          }),
        );
      if (holdFailure && command.method === "Fetch.failRequest") {
        acknowledgeFailure = () => peer.send(JSON.stringify({ id: command.id, result: {} }));
        failureSent.resolve();
        return;
      }
      const result =
        command.method === "Target.getTargetInfo"
          ? { targetInfo: identity }
          : command.method === "Page.getFrameTree"
            ? { frameTree: { frame: { id: "main-frame", loaderId: "fixture-loader" } } }
            : command.method === "Fixture.echo"
              ? { envelopeSession: command.sessionId ?? null }
              : command.method === "Network.emulateNetworkConditionsByRule"
                ? { ruleIds: ["deny-ws", "deny-wss"] }
                : command.method === "Fetch.getResponseBody"
                  ? {
                      body: Buffer.from("synthetic adulterated script").toString("base64"),
                      base64Encoded: true,
                    }
                  : {};
      peer.send(JSON.stringify({ id: command.id, result }));
      if (command.method === "Target.autoAttachRelated" && !command.sessionId)
        peer.send(
          JSON.stringify({
            method: "Target.attachedToTarget",
            params: {
              sessionId: "initial-session",
              targetInfo: { ...identity, type: "page" },
              waitingForDebugger: false,
            },
          }),
        );
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  port = server.address().port;
  return {
    port,
    identity,
    received,
    failureSent: failureSent.promise,
    acknowledgeFailure: () => acknowledgeFailure(),
    emit(value) {
      for (const peer of peers) peer.send(JSON.stringify(value));
    },
    async close() {
      for (const peer of peers) peer.terminate();
      await new Promise((resolve) => ws.close(resolve));
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
test("nova navegação aguarda a verificação CDP em curso sem cancelar a resposta", async () => {
  const fixture = await cdpFixture(),
    started = Promise.withResolvers(),
    release = Promise.withResolvers();
  let fence,
    verified = false,
    navigations = 0;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async ({ url }) => {
        if (url.endsWith("/slow.js")) {
          started.resolve();
          await release.promise;
          verified = true;
        }
        return true;
      },
    });
    const response = (id, url, resourceType) =>
      fixture.emit({
        method: "Fetch.requestPaused",
        sessionId: "initial-session",
        params: {
          requestId: id,
          request: { url, method: "GET" },
          resourceType,
          responseStatusCode: 200,
          responseHeaders: [],
        },
      });
    response("first-document", HML + "/login", "Document");
    response("first-script", HML + "/assets/a.js", "Script");
    await new Promise((resolve) => setImmediate(resolve));
    await fence.drain();
    response("slow", HML + "/assets/slow.js", "Script");
    await started.promise;
    const page = {
      waitForLoadState: async () => {},
      goto: async () => {
        if (!verified)
          throw Object.assign(new Error("interrupted verification"), { code: "CDP_COMMAND" });
        navigations++;
        return { status: () => 200 };
      },
    };
    await assert.rejects(page.goto(), (e) => e.code === "CDP_COMMAND");
    const navigation = fn("navigateVerifiedPage")(page, fence, HML + "/selecionar-organizacao");
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(navigations, 0);
    release.resolve();
    await navigation;
    assert.equal(navigations, 1);
    assert.equal(fence.snapshot().failed, false);
  } finally {
    release.resolve();
    fence?.close();
    await fixture.close();
  }
});
function selectorFixture(path, unsafe = false) {
  let current = HML + path,
    idle = false,
    verified = false,
    navigations = 0;
  return {
    page: {
      url: () => current,
      waitForLoadState: async (state) => {
        assert.equal(state, "networkidle");
        idle = true;
      },
      goto: async (target, options) => {
        assert.equal(idle && verified, true);
        assert.equal(options.waitUntil, "networkidle");
        navigations++;
        current = target;
        return { status: () => 200 };
      },
    },
    fence: {
      drain: async () => {
        assert.equal(idle, true);
        verified = true;
      },
      assertSafe: () => {
        if (unsafe) throw Object.assign(new Error("blocked"), { code: "FENCE_NOT_PROVEN" });
        assert.equal(verified, true);
      },
    },
    navigations: () => navigations,
  };
}
test("seletor já verificado é reutilizado sem recarga redundante após login", async () => {
  const fixture = selectorFixture("/selecionar-organizacao");
  await fn("openVerifiedOrganizationSelector")(fixture.page, fixture.fence);
  assert.equal(fixture.navigations(), 0);
});
test("seletor é aberto a partir da raiz somente após rede e fonte estabilizadas", async () => {
  const fixture = selectorFixture("/");
  await fn("openVerifiedOrganizationSelector")(fixture.page, fixture.fence);
  assert.equal(fixture.navigations(), 1);
  assert.equal(fixture.page.url(), HML + "/selecionar-organizacao");
});
test("destino inesperado ou fence insegura não permite navegação adicional", async () => {
  for (const [path, unsafe, code] of [
    ["/login", false, "AUTH_DESTINATION"],
    ["/contratos", false, "AUTH_DESTINATION"],
    ["/", true, "FENCE_NOT_PROVEN"],
  ]) {
    const fixture = selectorFixture(path, unsafe);
    await assert.rejects(
      fn("openVerifiedOrganizationSelector")(fixture.page, fixture.fence),
      (e) => e.code === code,
    );
    assert.equal(fixture.navigations(), 0);
  }
});
test("erro CDP registra só nome de comando permitido, nunca mensagem ou parâmetros", async () => {
  const fixture = await cdpFixture({ rejectContinue: true }),
    closed = Promise.withResolvers();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => closed.resolve(),
      verifyResponse: async () => true,
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "api-response",
        request: { url: API + "/auth/v1/user", method: "GET" },
        resourceType: "Fetch",
        responseStatusCode: 200,
      },
    });
    await closed.promise;
    const state = await fn("settledFenceSnapshot")(fence);
    assert.equal(state.failureCode, "CDP_COMMAND");
    assert.equal(state.failureCommand, "Fetch.continueResponse");
    const diagnostic = fn("runtimeDiagnostics")({ fence: state });
    assert.equal(diagnostic.fence.failureCommand, "Fetch.continueResponse");
    assert.equal(JSON.stringify(diagnostic).includes("SYNTHETIC_CANARY"), false);
    assert.equal(
      fn("runtimeDiagnostics")({ fence: { failureCommand: "SYNTHETIC_PRIVATE_CANARY" } }).fence
        .failureCommand,
      null,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("fence exige resposta completa e confirma cache desabilitado antes do renderer", async () => {
  const fixture = await cdpFixture();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
    });
    const cache = fixture.received.findIndex((c) => c.method === "Network.setCacheDisabled");
    const resume = fixture.received.findIndex(
      (c) => c.method === "Runtime.runIfWaitingForDebugger",
    );
    assert.ok(cache >= 0 && cache < resume);
    assert.deepEqual(fixture.received[cache].params, { cacheDisabled: true });
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("falha ao garantir corpo completo impede inicialização da fence", async () => {
  const fixture = await cdpFixture({ rejectCache: true });
  let closed = false;
  try {
    await assert.rejects(
      fn("installNativeFence")({
        debugPort: fixture.port,
        identity: fixture.identity,
        closeContext: async () => {
          closed = true;
        },
        verifyResponse: async () => true,
      }),
    );
    assert.equal(closed, true);
    assert.equal(
      fixture.received.some((c) => c.method === "Runtime.runIfWaitingForDebugger"),
      false,
    );
  } finally {
    await fixture.close();
  }
});
test("304 continua recusado e diagnóstico preserva apenas status HTTP limitado", async () => {
  const fixture = await cdpFixture(),
    closed = Promise.withResolvers();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => closed.resolve(),
      verifyResponse: async () => true,
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "conditional",
        request: { url: HML + "/assets/a.js", method: "GET" },
        resourceType: "Script",
        responseStatusCode: 304,
      },
    });
    await closed.promise;
    const state = await fn("settledFenceSnapshot")(fence);
    assert.equal(state.failureCode, "FENCE_REDIRECT");
    assert.equal(state.redirectStatus, 304);
    assert.equal(fn("runtimeDiagnostics")({ fence: state }).fence.redirectStatus, 304);
    for (const redirectStatus of [-1, 200, 400, Infinity, "SYNTHETIC_PRIVATE_CANARY"])
      assert.equal(
        fn("runtimeDiagnostics")({ fence: { redirectStatus } }).fence.redirectStatus,
        null,
      );
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("diagnóstico espera recusa CDP pendente antes de afirmar que a fence não falhou", async () => {
  const fixture = await cdpFixture({ holdFailure: true });
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => false,
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "changed-script",
        request: { url: HML + "/assets/test.js", method: "GET" },
        resourceType: "Script",
        responseStatusCode: 200,
      },
    });
    await fixture.failureSent;
    assert.equal(fence.snapshot().failed, false); // Browser already received failRequest; CDP ack is pending.
    const pending = fn("settledFenceSnapshot")(fence);
    fixture.acknowledgeFailure();
    const snapshot = await pending;
    assert.equal(snapshot.failed, true);
    assert.equal(snapshot.failureCode, "FENCE_SOURCE");
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("transporte CDP conserva sessionId e não propaga erro remoto bruto", async () => {
  const connectCDP = fn("connectNativeCDP"),
    fixture = await cdpFixture();
  let client;
  try {
    client = await connectCDP(fixture.port, fixture.identity);
    assert.deepEqual(await client.send("Fixture.echo", {}, "own-session"), {
      envelopeSession: "own-session",
    });
    await assert.rejects(
      client.send("Fixture.reject"),
      (error) =>
        error.code === "CDP_COMMAND" && !JSON.stringify(error).includes("SYNTHETIC_CANARY"),
    );
  } finally {
    client?.close();
    await fixture.close();
  }
});
test("resposta adulterada é negada no CDP antes de continuar execução", async () => {
  const install = fn("installNativeFence"),
    fixture = await cdpFixture();
  let fence,
    closed = 0;
  const finished = Promise.withResolvers();
  try {
    fence = await install({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {
        closed++;
        finished.resolve();
      },
      verifyResponse: async () => false,
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "changed-script",
        request: { url: HML + "/assets/a.js", method: "GET" },
        resourceType: "Script",
        responseStatusCode: 200,
      },
    });
    await Promise.race([
      finished.promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("fixture event not processed")), 2000);
        timer.unref();
      }),
    ]);
    await fn("settledFenceSnapshot")(fence);
    assert.equal(fence.snapshot().failed, true);
    assert.equal(closed, 1);
    assert.equal(
      fixture.received.some(
        (x) => x.method === "Fetch.continueResponse" && x.params.requestId === "changed-script",
      ),
      false,
    );
    assert.equal(
      fixture.received.some(
        (x) => x.method === "Fetch.failRequest" && x.params.requestId === "changed-script",
      ),
      true,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("worker novo permanece pausado e invalida o contexto", async () => {
  const install = fn("installNativeFence"),
    fixture = await cdpFixture();
  let fence,
    closed = 0;
  const finished = Promise.withResolvers();
  try {
    fence = await install({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {
        closed++;
        finished.resolve();
      },
      verifyResponse: async () => true,
    });
    fixture.emit({
      method: "Target.attachedToTarget",
      params: {
        sessionId: "worker-session",
        targetInfo: { targetId: "own-worker", browserContextId: "own-context", type: "worker" },
        waitingForDebugger: true,
      },
    });
    await Promise.race([
      finished.promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("fixture event not processed")), 2000);
        timer.unref();
      }),
    ]);
    await fn("settledFenceSnapshot")(fence);
    assert.equal(fence.snapshot().failed, true);
    assert.equal(fence.snapshot().workersPaused, 1);
    assert.equal(closed, 1);
    assert.equal(
      fixture.received.some(
        (x) => x.sessionId === "worker-session" && x.method === "Runtime.runIfWaitingForDebugger",
      ),
      false,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});

// Native tests are an additional boundary, never a substitute for policy tests.
// They require the pinned Playwright Chromium and do not receive HML credentials.
test(
  "Chromium nativo: resposta alterada não executa antes do fechamento",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
  async (t) => {
    const { chromium } = await import("playwright");
    let browser, fence, context, proxy;
    let executions = 0;
    const canary = createHttpServer((_req, res) => {
      executions++;
      res.end("canary");
    });
    const source = createHttpServer((req, res) => {
      res.setHeader(
        "content-type",
        req.url === "/altered.js" ? "application/javascript" : "text/html",
      );
      res.end(
        req.url === "/altered.js"
          ? `fetch('http://127.0.0.1:${canary.address().port}/executed')`
          : '<!doctype html><script src="/altered.js"></script>',
      );
    });
    const debug = createHttpServer();
    await Promise.all(
      [canary, source, debug].map(
        (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
      ),
    );
    const port = debug.address().port;
    await new Promise((resolve) => debug.close(resolve));
    const finished = Promise.withResolvers();
    try {
      browser = await fn("launchNativeBrowser")({ debugPort: port });
      context = await browser.newContext();
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      const { targetInfo } = await session.send("Target.getTargetInfo");
      await session.detach();
      proxy = await nativeCancellationProxy(
        port,
        `http://127.0.0.1:${source.address().port}/altered.js`,
        { orderSource: true },
      );
      fence = await fn("installNativeFence")({
        debugPort: proxy.port,
        identity: targetInfo,
        policy: () => true,
        verifyResponse: async ({ resourceType }) => resourceType !== "Script",
        closeContext: async () => {
          await context.close();
          finished.resolve();
        },
      });
      await page.goto(`http://127.0.0.1:${source.address().port}/`).catch(() => {});
      await Promise.race([
        finished.promise,
        new Promise((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error("native guard did not close context")),
            10000,
          );
          timer.unref();
        }),
      ]);
      await fn("settledFenceSnapshot")(fence);
      assert.equal(fence.snapshot().failed, true);
      t.diagnostic("NATIVE_SOURCE_FAILURE " + fence.snapshot().failureCode);
      const ordering = proxy.sourceOrdering();
      t.diagnostic(
        "NATIVE_SOURCE_ORDER " +
          Number(ordering.originalNetworkObserved) +
          " " +
          Number(ordering.initialPauseObserved) +
          " " +
          ordering.networkDelivered +
          " " +
          ordering.initialContinuations +
          " " +
          Number(ordering.continuationBeforeNetwork),
      );
      assert.equal(
        fence.snapshot().failureCode,
        "FENCE_SOURCE",
        "must reach provenance rejection, not an earlier lifecycle failure",
      );
      assert.equal(fence.snapshot().verifiedDocuments, 1);
      assert.deepEqual(ordering, {
        originalNetworkObserved: true,
        initialPauseObserved: true,
        networkDelivered: 1,
        initialContinuations: 1,
        continuationBeforeNetwork: false,
      });
      assert.equal(executions, 0);
    } finally {
      fence?.close();
      await browser?.close();
      await proxy?.close();
      await Promise.all(
        [canary, source].map((server) => new Promise((resolve) => server.close(resolve))),
      );
    }
  },
);

test("artefato recusa telefone e identificadores desconhecidos mesmo com formato válido", () => {
  const safe = fn("safeArtifactText");
  for (const value of ["1133334444", "f".repeat(32), "87ebff63-e844-4264-8c05-a92b6aabbcc1"])
    assert.equal(safe(value, new Set()), false);
  assert.equal(
    safe(
      "42 87ebff63-e844-4264-8c05-a92b6aabbcc1",
      new Set(["42", "87ebff63-e844-4264-8c05-a92b6aabbcc1"]),
    ),
    true,
  );
});
test("fence anexa todos os tipos de target, sem permitir execução de worklet desconhecido", async () => {
  const fixture = await cdpFixture(),
    done = Promise.withResolvers();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => done.resolve(),
      verifyResponse: async () => true,
    });
    const auto = fixture.received.filter((x) => x.method === "Target.setAutoAttach");
    assert.equal(
      auto.every(
        (x) =>
          !x.params.filter || x.params.filter.some((item) => !item.type && item.exclude !== true),
      ),
      true,
    );
    fixture.emit({
      method: "Target.attachedToTarget",
      params: {
        sessionId: "worklet-session",
        targetInfo: {
          targetId: "unknown-worklet",
          browserContextId: "own-context",
          type: "worklet",
        },
        waitingForDebugger: true,
      },
    });
    await Promise.race([
      done.promise,
      new Promise((_, reject) => {
        const t = setTimeout(() => reject(new Error("worklet was not blocked")), 2000);
        t.unref();
      }),
    ]);
    assert.equal(fence.snapshot().failed, true);
    assert.equal(
      fixture.received.some(
        (x) => x.sessionId === "worklet-session" && x.method === "Runtime.runIfWaitingForDebugger",
      ),
      false,
    );
  } finally {
    fence?.close();
    await fixture.close();
  }
});

for (const mode of ["worker", "popup", "websocket", "proxy"])
  test(
    `Chromium nativo: ${mode} não transmite ao canário`,
    { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
    async () => {
      const { chromium } = await import("playwright");
      let browser, context, fence, proxy;
      let connections = 0;
      const canary = createHttpServer((_req, res) => {
        res.setHeader("content-type", "text/html");
        res.end('<!doctype html><title>canary</title><link rel="icon" href="data:,">');
      });
      canary.on("connection", () => connections++);
      const debug = createHttpServer();
      await Promise.all(
        [canary, debug].map(
          (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
        ),
      );
      const port = debug.address().port;
      await new Promise((resolve) => debug.close(resolve));
      const finished = Promise.withResolvers();
      try {
        if (mode === "proxy") proxy = await fn("startDestinationProxy")();
        browser = await fn("launchNativeBrowser")({
          debugPort: port,
          ...(proxy ? { proxy: proxy.url } : {}),
        });
        context = await browser.newContext();
        const page = await context.newPage();
        if (mode !== "proxy") {
          const session = await context.newCDPSession(page);
          const { targetInfo } = await session.send("Target.getTargetInfo");
          await session.detach();
          fence = await fn("installNativeFence")({
            debugPort: port,
            identity: targetInfo,
            verifyResponse: async () => true,
            policy: (request) =>
              mode === "websocket" && request.url === `http://127.0.0.1:${canary.address().port}/`
                ? true
                : sut.requestAllowed(request),
            closeContext: async () => {
              await context.close();
              finished.resolve();
            },
          });
        }
        if (mode === "worker") {
          await page
            .evaluate((url) => {
              new Worker(
                URL.createObjectURL(new Blob([`fetch('${url}')`], { type: "text/javascript" })),
              );
            }, `http://127.0.0.1:${canary.address().port}/canary`)
            .catch(() => {});
        } else if (mode === "popup") {
          await page
            .evaluate((url) => window.open(url), `http://127.0.0.1:${canary.address().port}/canary`)
            .catch(() => {});
        } else if (mode === "websocket") {
          await page.goto(`http://127.0.0.1:${canary.address().port}/`, {
            waitUntil: "networkidle",
          });
          canary.closeAllConnections();
          connections = 0;
          assert.equal(
            await page.evaluate(
              (url) =>
                new Promise((resolve) => {
                  const ws = new WebSocket(url);
                  ws.onerror = () => resolve("denied");
                  ws.onopen = () => resolve("opened");
                }),
              `ws://127.0.0.1:${canary.address().port}/canary`,
            ),
            "denied",
          );
        } else {
          assert.equal(
            await page.evaluate(
              (url) =>
                fetch(url).then(
                  () => false,
                  () => true,
                ),
              `http://127.0.0.1:${canary.address().port}/canary`,
            ),
            true,
          );
          assert.ok(proxy.snapshot().blocked > 0);
        }
        if (mode === "worker" || mode === "popup")
          await Promise.race([
            finished.promise,
            new Promise((_, reject) => {
              const timer = setTimeout(() => reject(new Error("target was not stopped")), 10000);
              timer.unref();
            }),
          ]);
        if (mode === "worker" || mode === "popup") await fn("settledFenceSnapshot")(fence);
        else await fence?.drain();
        if (mode === "worker") {
          assert.ok(fence.snapshot().workersPaused > 0);
          assert.equal(fence.snapshot().failureCode, "FENCE_WORKER_PAUSED");
        }
        if (mode === "popup") {
          assert.ok(fence.snapshot().popups > 0);
          assert.equal(fence.snapshot().failureCode, "FENCE_POPUP");
        }
        assert.equal(connections, 0);
        if (mode === "popup") await popupPolicyVariants();
      } finally {
        fence?.close();
        await browser?.close();
        await proxy?.close();
        await new Promise((resolve) => canary.close(resolve));
      }
    },
  );

test("grafo público usa parser, limites e somente módulos do HML", async () => {
  const discover = fn("discoverPublicGraph"),
    origin = HML;
  const fixture = new Map([
    ["/login", '<!doctype html><script type="module" src="/assets/main.js"></script>'],
    ["/assets/main.js", 'import "./child.js";'],
    ["/assets/child.js", "export const synthetic=1;"],
  ]);
  const fetcher = async (url) => {
    const response = new Response(fixture.get(new URL(url).pathname), { status: 200 });
    Object.defineProperty(response, "url", { value: url });
    return response;
  };
  const graph = await discover({ fetcher });
  assert.equal(graph.modules.size, 2);
  assert.equal(graph.modules.get(origin + "/assets/child.js"), "export const synthetic=1;");
  fixture.set("/assets/child.js", 'import("https://foreign.invalid/payload.js")');
  await assert.rejects(discover({ fetcher }), (error) => error.code === "SCRIPT_POLICY");
  fixture.set(
    "/login",
    '<!doctype html><script src="https://foreign.invalid/payload.js"></script>',
  );
  await assert.rejects(discover({ fetcher }), (error) => error.code === "GRAPH_DESTINATION");
});
test("download público interrompe redirect, resposta parcial e excesso de bytes", async () => {
  const bounded = fn("boundedPublicFetch");
  for (const variant of ["redirect", "status", "size"]) {
    const fetcher = async (url) => {
      const response = new Response(variant === "size" ? "x".repeat(21) : "ok", {
        status: variant === "status" ? 206 : 200,
      });
      Object.defineProperty(response, "url", { value: url });
      if (variant === "redirect") Object.defineProperty(response, "redirected", { value: true });
      return response;
    };
    await assert.rejects(
      bounded(HML + "/login", 20, fetcher),
      (error) => error.code === "PUBLIC_FETCH",
    );
  }
});

for (const scheme of ["ws", "wss"])
  test(
    `Chromium nativo: controle positivo e bloqueio ${scheme}`,
    { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
    async () => {
      const { chromium } = await import("playwright");
      let browser, context, fence;
      let connections = 0;
      const canary = createHttpServer();
      canary.on("connection", (socket) => {
        connections++;
        socket.destroy();
      });
      let revalidations = 0;
      const documentBody =
        '<!doctype html><title>synthetic guard</title><link rel="icon" href="data:,">';
      const source = createHttpServer((req, res) => {
        res.setHeader("etag", '"synthetic-guard-v1"');
        res.setHeader("cache-control", "no-cache");
        if (req.headers["if-none-match"] === '"synthetic-guard-v1"') {
          revalidations++;
          res.writeHead(304);
          res.end();
          return;
        }
        res.setHeader("content-type", "text/html");
        res.end(documentBody);
      });
      const debug = createHttpServer();
      await Promise.all(
        [canary, source, debug].map(
          (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
        ),
      );
      const port = debug.address().port;
      await new Promise((resolve) => debug.close(resolve));
      try {
        browser = await fn("launchNativeBrowser")({ debugPort: port });
        const attempt = async (page) =>
          page.evaluate(
            (url) =>
              new Promise((resolve) => {
                const ws = new WebSocket(url);
                ws.onerror = () => resolve("denied");
                ws.onopen = () => resolve("opened");
              }),
            `${scheme}://127.0.0.1:${canary.address().port}/canary`,
          );
        context = await browser.newContext();
        let page = await context.newPage();
        await page.goto(`http://127.0.0.1:${source.address().port}/`, { waitUntil: "networkidle" });
        await attempt(page);
        assert.ok(connections > 0, "controle positivo deve comprovar transporte ao mesmo canário");
        await context.close();
        connections = 0;
        context = await browser.newContext();
        page = await context.newPage();

        const session = await context.newCDPSession(page);
        const { targetInfo } = await session.send("Target.getTargetInfo");
        await session.detach();
        fence = await fn("installNativeFence")({
          debugPort: port,
          identity: targetInfo,
          verifyResponse: async ({ status, body }) =>
            status === 200 && Buffer.isBuffer(body) && body.equals(Buffer.from(documentBody)),
          policy: (request) =>
            request.url === `http://127.0.0.1:${source.address().port}/` ||
            sut.requestAllowed(request),
          closeContext: async () => context.close(),
        });
        const delivered = await page.goto(`http://127.0.0.1:${source.address().port}/`, {
          waitUntil: "networkidle",
        });
        assert.ok(
          fence.snapshot().verifiedDocuments > 0,
          "verified response count: " + JSON.stringify(fence.snapshot()),
        );
        assert.ok(
          (await delivered.headerValue("content-security-policy"))?.includes("connect-src"),
          "CSP must reach the protected document",
        );
        for (let reload = 0; reload < 2; reload++)
          await page.goto(`http://127.0.0.1:${source.address().port}/`, {
            waitUntil: "networkidle",
          });
        await fence.drain();
        assert.equal(
          revalidations,
          0,
          "auditor must request full bodies, never conditional 304 responses",
        );
        assert.equal(fence.snapshot().verifiedDocuments, 3);
        assert.equal(connections, 0, "no late positive-control connection before attempt");
        assert.ok(
          fence.snapshot().verifiedDocuments > 0,
          "document must be verified before attempt",
        );
        await page.evaluate(() => {
          window.syntheticCspViolations = [];
          document.addEventListener("securitypolicyviolation", (event) => {
            window.syntheticCspViolations.push({
              directive: event.effectiveDirective,
              policy: event.originalPolicy,
            });
          });
        });
        assert.equal(await attempt(page), "denied");
        assert.equal(
          await page.evaluate(() =>
            window.syntheticCspViolations.some(
              (event) =>
                event.directive === "connect-src" &&
                event.policy.includes("connect-src https://contaos-41-hml.vercel.app"),
            ),
          ),
          true,
          "native CSP must report blocked connect-src",
        );
        await fence.drain();
        assert.equal(connections, 0, "fence deve bloquear antes do primeiro byte");
      } finally {
        fence?.close();
        await browser?.close();
        for (const server of [canary, source]) {
          server.closeAllConnections();
          await new Promise((resolve) => server.close(resolve));
        }
      }
    },
  );

test("CSP adicional preserva headers e restringe conexões HTTPS sem liberar ws ou wss", () => {
  const headers = [
    { name: "Content-Type", value: "text/html" },
    { name: "Content-Security-Policy", value: "default-src 'self'" },
  ];
  const result = fn("guardedResponseHeaders")(headers);
  assert.deepEqual(result.slice(0, 2), headers);
  assert.equal(result.length, 3);
  assert.equal(result[2].name, "Content-Security-Policy");
  assert.equal(
    result[2].value,
    `connect-src ${HML} ${API}; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'`,
  );
  assert.throws(() => fn("guardedResponseHeaders")([{ name: "X", value: "bad\r\nheader" }]));
});

test("matriz privada tem 208 chaves únicas, IDs reais e 24 bloqueios explícitos", () => {
  const rows = fn("privateCases")();
  assert.equal(rows.length, 208);
  assert.equal(new Set(rows.map(sut.caseKey)).size, 208);
  assert.equal(rows.filter((r) => r.fixtureBlocked).length, 24);
  assert.equal(
    rows
      .filter((r) => r.surface === "V103")
      .every((r) => r.path.includes("041ebf9f-5e32-4744-80d6-d745fa5fc483")),
    true,
  );
  assert.equal(
    rows.some((r) => r.path?.includes("00000000-0000-4000")),
    false,
  );
});

test("CLI sem modo explícito não pode encerrar com sucesso silencioso", async () => {
  const { execFile } = await import("node:child_process");
  const code = await new Promise((resolve) =>
    execFile(
      process.execPath,
      ["scripts/hml/authenticated-visual-audit.mjs"],
      { env: sut.browserEnvironment(process.env) },
      (error) => resolve(error?.code ?? 0),
    ),
  );
  assert.equal(code, 1);
});

test("prova nativa exige oito casos reais no mesmo SHA e mesmos arquivos", () => {
  const make = fn("nativeProofFromTap"),
    valid = fn("nativeProofValid"),
    identity = { harnessSha: "a".repeat(40), moduleHash: "b".repeat(64), testHash: "c".repeat(64) };
  const proof = make("# tests 8\n# pass 8\n# fail 0\n# skipped 0\n", identity);
  assert.equal(valid(proof, identity), true);
  for (const tap of [
    "# tests 7\n# pass 7\n# fail 0\n# skipped 0\n",
    "# tests 9\n# pass 9\n# fail 0\n# skipped 0\n",
    "# tests 8\n# tests 8\n# pass 8\n# fail 0\n# skipped 0\n",
    "# tests 7\n# pass 6\n# fail 1\n# skipped 0\n",
    "# tests 7\n# pass 6\n# fail 0\n# skipped 1\n",
    "",
  ])
    assert.throws(() => make(tap, identity));
  assert.equal(valid(proof, { ...identity, harnessSha: "d".repeat(40) }), false);
  assert.equal(valid({ ...proof, moduleHash: "e".repeat(64) }, identity), false);
});

test("proveniência recusa árvore suja e env ignorado fora do SHA", async () => {
  const clean = fn("sourceTreeClean");
  const fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path");
  const { promisify } = await import("node:util");
  const run = promisify((await import("node:child_process")).execFile);
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-provenance-test-"));
  const env = {
    ...sut.browserEnvironment(process.env),
    GIT_AUTHOR_NAME: "Synthetic",
    GIT_AUTHOR_EMAIL: "synthetic@example.invalid",
    GIT_COMMITTER_NAME: "Synthetic",
    GIT_COMMITTER_EMAIL: "synthetic@example.invalid",
  };
  try {
    await run("git", ["init"], { cwd: root, env });
    await fs.writeFile(path.join(root, ".gitignore"), ".env.local\nnode_modules/\n.output/\n");
    await fs.writeFile(path.join(root, "source.ts"), "export const synthetic=1;");
    await run("git", ["add", "."], { cwd: root, env });
    await run("git", ["commit", "-m", "synthetic"], { cwd: root, env });
    assert.equal(await clean(root), true);
    await fs.writeFile(path.join(root, ".env.local"), "VITE_FAKE=1");
    assert.equal(await clean(root), false);
    await fs.rm(path.join(root, ".env.local"));
    await fs.writeFile(path.join(root, "source.ts"), "export const synthetic=2;");
    assert.equal(await clean(root), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("resposta publicada exige documento conhecido e bytes aprovados antes de execução", async () => {
  const verify = fn("verifyPublishedResponse");
  const proof = {
    documents: { "/login": "<!doctype html><p>synthetic</p>" },
    publicRoot: "/nonexistent",
  };
  assert.equal(
    await verify(proof, {
      url: HML + "/login",
      resourceType: "Document",
      status: 200,
      body: Buffer.from(proof.documents["/login"]),
    }),
    true,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/login",
      resourceType: "Document",
      status: 200,
      body: Buffer.from("<!doctype html><p>changed</p>"),
    }),
    false,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/unknown",
      resourceType: "Document",
      status: 200,
      body: Buffer.from("unknown"),
    }),
    false,
  );
  assert.equal(
    await verify(proof, {
      url: API + "/auth/v1/token?grant_type=password",
      resourceType: "Fetch",
      status: 200,
    }),
    true,
  );
  assert.equal(
    await verify(proof, {
      url: HML + "/assets/missing.js",
      resourceType: "Script",
      status: 200,
      body: Buffer.from("payload"),
    }),
    false,
  );
});

test("frontend não transmite query de fallback de formulário sem hidratação", () => {
  assert.equal(
    fn("requestAllowed")({
      url: HML + "/login?email=synthetic&senha=synthetic",
      method: "GET",
      resourceType: "Document",
    }),
    false,
  );
});

test("estado esperado V114 rejeita indisponibilidade ou negativa em role=status", () => {
  const valid = fn("surfaceStateValid");
  assert.equal(
    valid("V114", {
      headingText: "Competência",
      statusTexts: ["Competência não encontrada ou indisponível."],
      mainText: "Competência não encontrada ou indisponível.",
    }),
    false,
  );
  assert.equal(
    valid("V114", {
      headingText: "Competência",
      statusTexts: ["Você não tem acesso a esta competência."],
      mainText: "Você não tem acesso a esta competência.",
    }),
    false,
  );
  assert.equal(
    valid("V114", {
      headingText: "Competência novembro/2026",
      statusTexts: [],
      mainText: "Competência novembro/2026 Rascunho",
    }),
    true,
  );
  assert.equal(
    valid("V111", {
      headingText: "FONTE_SINTETICA_AUDITORIA_HML",
      statusTexts: [],
      mainText: "",
      regionNames: ["Resumo do documento", "Processamento"],
    }),
    true,
  );
  assert.equal(
    valid("V111", {
      headingText: "FONTE_SINTETICA_AUDITORIA_HML",
      statusTexts: ["Documento não encontrado ou indisponível."],
      mainText: "",
      regionNames: [],
    }),
    false,
  );
});
test("marca mobile exige prova do menu aberto, sem fabricar marca no estado fechado", () => {
  const valid = fn("brandStateValid"),
    base = { surface: "V114", width: 390, theme: "dark", brandCount: 0 };
  const supplement = {
    mode: "MOBILE",
    brandCount: 1,
    screenshot: "screenshots/V114_390_dark_menu.png",
    sha256: "a".repeat(64),
  };
  assert.equal(valid(base), false);
  assert.equal(valid({ ...base, sidebarSupplement: supplement }), true);
  for (const brandCount of [0, 2])
    assert.equal(valid({ ...base, sidebarSupplement: { ...supplement, brandCount } }), false);
  assert.equal(valid({ ...base, width: 1440, brandCount: 1 }), true);
  assert.equal(valid({ ...base, width: 1440, brandCount: 0 }), false);
  assert.equal(valid({ ...base, surface: "SYS04", brandCount: 1 }), true);
});

test("saída Wrangler admite somente o JSON gerado, sem arquivo extra ou symlink", async () => {
  const valid = fn("generatedWranglerOutputValid"),
    fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-wrangler-test-")),
    outside = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-wrangler-outside-"));
  const dir = path.join(root, ".wrangler", "deploy"),
    file = path.join(dir, "config.json"),
    expected = '{"configPath":"../../.output/server/wrangler.json"}';
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, expected);
    assert.equal(await valid(root), true);
    await fs.writeFile(path.join(dir, "extra.json"), "{}");
    assert.equal(await valid(root), false);
    await fs.rm(path.join(dir, "extra.json"));
    for (const value of [
      '{"configPath":"../../outside.json"}',
      '{"configPath":"../../.output/server/wrangler.json","extra":true}',
      '{"configPath":"bad","configPath":"../../.output/server/wrangler.json"}',
    ]) {
      await fs.writeFile(file, value);
      assert.equal(await valid(root), false);
    }
    await fs.writeFile(file, expected);
    await fs.writeFile(path.join(outside, "config.json"), expected);
    await fs.rm(file);
    await fs.symlink(path.join(outside, "config.json"), file);
    assert.equal(await valid(root), false);
    await fs.rm(file);
    await fs.rm(dir, { recursive: true });
    await fs.symlink(outside, dir);
    assert.equal(await valid(root), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});
test("bloqueio pré-login preserva atestado válido e hashes sem gravar campo estranho", async () => {
  const write = fn("writeBlockedPreflight"),
    fs = await import("node:fs/promises"),
    os = await import("node:os"),
    path = await import("node:path"),
    crypto = await import("node:crypto");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contaos-blocked-proof-")),
    identity = { harnessSha: "a".repeat(40), moduleHash: "b".repeat(64), testHash: "c".repeat(64) },
    native = sut.nativeProofFromTap("# tests 8\n# pass 8\n# fail 0\n# skipped 0\n", identity);
  try {
    await write(
      {
        code: "PREPARE_DIRTY",
        identity,
        frontendSha: "d".repeat(40),
        deploymentId: "dpl_synthetic123",
        native: { ...native, extra: "SYNTHETIC_SECRET_CANARY" },
        extra: "SYNTHETIC_SECRET_CANARY",
      },
      root,
    );
    const receipt = JSON.parse(
      await fs.readFile(path.join(root, "preflight-blocked.json"), "utf8"),
    );
    assert.equal(receipt.v1Certified, false);
    assert.equal(receipt.privateCasesProven, 0);
    assert.equal(receipt.nativeProofIncluded, true);
    const sums = await fs.readFile(path.join(root, "SHA256SUMS"), "utf8");
    for (const line of sums.trim().split("\n")) {
      const [sha, file] = line.split("  ");
      const body = await fs.readFile(path.join(root, file));
      assert.equal(crypto.createHash("sha256").update(body).digest("hex"), sha);
      assert.equal(body.includes("SYNTHETIC_SECRET_CANARY"), false);
    }
    await assert.rejects(
      write({ code: "PREPARE_DIRTY", identity }, root),
      (error) => error.code === "BLOCKED_ARTIFACT_EXISTS",
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("diagnóstico distingue timeout e recusa da fence sem mensagem ou dados privados", () => {
  const diag = fn("runtimeDiagnostics")({
    phase: "WAIT_AUTH_DESTINATION",
    errorName: "TimeoutError",
    contextClosed: false,
    routeClass: "LOGIN",
    fence: {
      failed: true,
      failureCode: "FENCE_SOURCE",
      verifiedDocuments: 1,
      verifiedScripts: 12,
      blockedRequests: 0,
    },
    proxy: { forwarded: 2, blocked: 0, connectionFailures: 0 },
    flags: { formLocated: true, submitActivated: true },
    loginUi: { observed: true, credentialRejected: true },
    message: "SYNTHETIC_PRIVATE_CANARY",
    stack: "SYNTHETIC_PRIVATE_CANARY",
    url: "https://foreign.invalid/SYNTHETIC_PRIVATE_CANARY",
    headers: { authorization: "SYNTHETIC_PRIVATE_CANARY" },
  });
  assert.equal(diag.phase, "WAIT_AUTH_DESTINATION");
  assert.equal(diag.errorKind, "TIMEOUT");
  assert.equal(diag.fence.failureCode, "FENCE_SOURCE");
  assert.equal(diag.flags.formLocated, true);
  assert.equal(diag.loginUi.credentialRejected, true);
  assert.equal(JSON.stringify(diag).includes("SYNTHETIC_PRIVATE_CANARY"), false);
});
test("diagnóstico recusa enums e contadores inesperados", () => {
  const diag = fn("runtimeDiagnostics")({
    phase: "SYNTHETIC_PRIVATE_CANARY",
    routeClass: "SYNTHETIC_PRIVATE_CANARY",
    fence: { failureCode: "SYNTHETIC_PRIVATE_CANARY", verifiedScripts: -1 },
    proxy: { blocked: Infinity },
    loginUi: { extra: "SYNTHETIC_PRIVATE_CANARY" },
  });
  assert.equal(diag.phase, "UNKNOWN");
  assert.equal(diag.routeClass, "UNAVAILABLE");
  assert.equal(diag.fence.failureCode, null);
  assert.equal(diag.fence.verifiedScripts, null);
  assert.equal(diag.proxy.blocked, null);
  assert.equal(JSON.stringify(diag).includes("SYNTHETIC_PRIVATE_CANARY"), false);
});

// Test-only transparent proxy: delay one original command, never fabricate a
// browser event or response. The production fence connects directly to Chromium.
async function nativeCancellationProxy(realPort, canceledUrl, { orderSource = false } = {}) {
  const metadata = await (await fetch(`http://127.0.0.1:${realPort}/json/version`)).json();
  const held = Promise.withResolvers(),
    terminal = Promise.withResolvers(),
    rejected = Promise.withResolvers();
  const peers = new Set(),
    upstreams = new Set(),
    network = new Map(),
    observations = [];
  let paused, command, upstreamForHeld, proxyPort;
  let originalNetwork,
    networkDownstream,
    sourcePaused = false,
    deliveryTimer;
  let deliveredNetwork = 0,
    sourceContinuations = 0,
    earlyContinuation = false;
  function deliverOriginalNetwork() {
    if (!orderSource || !originalNetwork || !sourcePaused || deliveryTimer || deliveredNetwork)
      return;
    deliveryTimer = setTimeout(() => {
      if (networkDownstream.readyState === 1) {
        deliveredNetwork++;
        networkDownstream.send(originalNetwork);
      }
    }, 15);
  }
  const server = createHttpServer((req, res) => {
    if (req.url !== "/json/version") return void res.writeHead(404).end();
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        ...metadata,
        webSocketDebuggerUrl: metadata.webSocketDebuggerUrl.replace(
          `:${realPort}/`,
          `:${proxyPort}/`,
        ),
      }),
    );
  });
  const sockets = new WebSocketServer({ server });
  sockets.on("connection", (downstream) => {
    peers.add(downstream);
    const upstream = new WebSocket(metadata.webSocketDebuggerUrl),
      queue = [];
    upstreams.add(upstream);
    const forward = (text) =>
      upstream.readyState === WebSocket.OPEN ? upstream.send(text) : queue.push(text);
    upstream.addEventListener("open", () => {
      for (const text of queue.splice(0)) upstream.send(text);
    });
    upstream.addEventListener("message", ({ data }) => {
      const text = String(data),
        event = JSON.parse(text);
      if (event.method === "Network.requestWillBeSent")
        network.set(event.sessionId + "|" + event.params.requestId, event.params);
      if (
        orderSource &&
        event.method === "Network.requestWillBeSent" &&
        event.params.request.url === canceledUrl
      ) {
        assert.equal(originalNetwork, undefined, "one original Network event");
        originalNetwork = text;
        networkDownstream = downstream;
        deliverOriginalNetwork();
        return;
      }
      if (event.method === "Fetch.requestPaused" && observations.length < 32)
        observations.push({ ...event.params, sessionId: event.sessionId });
      if (
        event.method === "Fetch.requestPaused" &&
        event.params.request.url === canceledUrl &&
        event.params.responseStatusCode === undefined
      ) {
        paused = { ...event.params, sessionId: event.sessionId };
        sourcePaused = true;
      }
      if (
        event.method === "Network.loadingFailed" &&
        paused?.networkId === event.params.requestId &&
        paused.sessionId === event.sessionId
      )
        terminal.resolve({ ...event.params, sessionId: event.sessionId });
      if (command && event.id === command.id && event.error) rejected.resolve(event.error);
      if (downstream.readyState === 1) downstream.send(text);
      deliverOriginalNetwork();
    });
    downstream.on("message", (data) => {
      const text = String(data),
        event = JSON.parse(text);
      if (
        paused &&
        event.method === "Fetch.continueRequest" &&
        event.params.requestId === paused.requestId &&
        event.sessionId === paused.sessionId
      ) {
        if (orderSource) {
          sourceContinuations++;
          earlyContinuation ||= deliveredNetwork !== 1;
          forward(text);
          return;
        }
        assert.equal(command, undefined, "one initial continuation only");
        command = event;
        upstreamForHeld = upstream;
        held.resolve();
      } else forward(text);
    });
    downstream.on("close", () => {
      peers.delete(downstream);
      upstream.close();
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  proxyPort = server.address().port;
  return {
    port: proxyPort,
    sourceOrdering() {
      return {
        originalNetworkObserved: !!originalNetwork,
        initialPauseObserved: sourcePaused,
        networkDelivered: deliveredNetwork,
        initialContinuations: sourceContinuations,
        continuationBeforeNetwork: earlyContinuation,
      };
    },
    held: held.promise,
    terminal: terminal.promise,
    rejected: rejected.promise,
    request() {
      return { paused, network: network.get(paused?.sessionId + "|" + paused?.networkId) };
    },
    metadata() {
      return observations.flatMap((p) => {
        const n = network.get(p.sessionId + "|" + p.networkId);
        if (!n) return [];
        return [
          "# NATIVE_LIFECYCLE_META " +
            n.type +
            " " +
            p.resourceType +
            " " +
            p.request.method +
            " " +
            (p.responseStatusCode !== undefined || p.responseErrorReason !== undefined
              ? "RESPONSE"
              : "REQUEST") +
            " " +
            Number(!!n.frameId) +
            " " +
            Number(!!n.frameId && n.frameId === p.frameId) +
            " " +
            Number(!!n.loaderId),
        ];
      });
    },
    release() {
      assert.ok(command);
      upstreamForHeld.send(JSON.stringify(command));
    },
    async close() {
      clearTimeout(deliveryTimer);
      for (const ws of peers) ws.terminate();
      for (const ws of upstreams) ws.close();
      await new Promise((resolve) => sockets.close(resolve));
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test("diagnóstico da reprodução nativa publica somente etapas fechadas", () => {
  const diagnose = fn("nativeCancellationDiagnostics");
  assert.deepEqual(
    diagnose("# NATIVE_CANCEL_STAGE REQUEST_HELD\n# NATIVE_CANCEL_STAGE ERROR_PROVED\n"),
    ["REQUEST_HELD", "ERROR_PROVED"],
  );
  assert.deepEqual(
    diagnose(
      "# NATIVE_CANCEL_STAGE CANARIO_PRIVADO\n# NATIVE_CANCEL_STAGE ERROR_PROVED pessoa@example.com",
    ),
    [],
  );
  assert.equal(
    fn("nativeCancellationFailure")("# NATIVE_CANCEL_FAILURE FENCE_REQUEST_LIFECYCLE"),
    "FENCE_REQUEST_LIFECYCLE",
  );
  assert.equal(
    fn("nativeCancellationFailure")("# NATIVE_CANCEL_FAILURE OTHER pessoa@example.com"),
    null,
  );
});

test("diagnóstico de tipos nativos aceita somente enums CDP sem conteúdo", () => {
  assert.deepEqual(fn("nativeCancellationTypes")("# NATIVE_CANCEL_TYPES Other Fetch"), {
    network: "Other",
    fetch: "Fetch",
  });
  assert.equal(
    fn("nativeCancellationTypes")("# NATIVE_CANCEL_TYPES pessoa@example.com Fetch"),
    null,
  );
  assert.equal(fn("nativeCancellationTypes")("# NATIVE_CANCEL_TYPES Other Fetch extra"), null);
});

test("diagnóstico de vínculo nativo não publica identificadores nem texto livre", () => {
  assert.deepEqual(
    fn("nativeLifecycleMetadata")("# NATIVE_LIFECYCLE_META Preflight Other OPTIONS REQUEST 0 0 0"),
    [
      {
        network: "Preflight",
        fetch: "Other",
        method: "OPTIONS",
        stage: "REQUEST",
        networkFramePresent: false,
        sameFrame: false,
        loaderPresent: false,
      },
    ],
  );
  assert.deepEqual(
    fn("nativeLifecycleMetadata")(
      "# NATIVE_LIFECYCLE_META Preflight Other pessoa@example.com REQUEST 0 0 0",
    ),
    [],
  );
});

test(
  "Chromium nativo: cancelamento inicial real não libera corpo nem transmite ao canário",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
  async (t) => {
    const { chromium } = await import("playwright");
    let browser, context, fence, proxy;
    const traffic = { connections: 0, bytes: 0, requests: 0 };
    const preflightRequested = Promise.withResolvers();
    let pendingPreflight;
    const canary = createHttpServer((req, res) => {
      traffic.requests++;
      if (req.url === "/cors-ok") {
        res.setHeader("access-control-allow-origin", `http://127.0.0.1:${source.address().port}`);
        res.setHeader("access-control-allow-methods", "POST");
        res.setHeader("access-control-allow-headers", "x-native-fixture");
        if (req.method === "OPTIONS") {
          pendingPreflight = res;
          preflightRequested.resolve();
          return;
        }
      }
      res.end("canary");
    });
    canary.on("connection", (socket) => {
      traffic.connections++;
      socket.on("data", (bytes) => {
        traffic.bytes += bytes.length;
      });
    });
    const html = '<!doctype html><title>native cancellation</title><link rel="icon" href="data:,">';
    const source = createHttpServer((req, res) => {
        if (req.url === "/altered.js") {
          res.setHeader("content-type", "application/javascript");
          res.end(`fetch('http://127.0.0.1:${canary.address().port}/leak')`);
          return;
        }
        res.setHeader("content-type", "text/html");
        res.end(html);
      }),
      debug = createHttpServer();
    await Promise.all(
      [source, canary, debug].map(
        (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
      ),
    );
    const realPort = debug.address().port;
    await new Promise((resolve) => debug.close(resolve));
    const within = (promise) =>
      Promise.race([
        promise,
        new Promise((_, reject) => {
          const t = setTimeout(() => reject(Error("native cancellation event missing")), 3000);
          t.unref();
        }),
      ]);
    try {
      browser = await fn("launchNativeBrowser")({ debugPort: realPort });
      const origin = `http://127.0.0.1:${source.address().port}`,
        canceledUrl = `http://127.0.0.1:${canary.address().port}/canceled`;
      const positive = await browser.newContext();
      const control = await positive.newPage();
      await control.goto(origin + "/");
      await control.evaluate(async (url) => {
        await fetch(url, { mode: "no-cors" });
      }, canceledUrl);
      assert.ok(
        traffic.connections > 0 && traffic.bytes > 0 && traffic.requests > 0,
        "positive control must demonstrate the independent socket sensor",
      );
      t.diagnostic("NATIVE_CANCEL_STAGE SENSOR_PROVED");
      await positive.close();
      canary.closeIdleConnections();
      Object.assign(traffic, { connections: 0, bytes: 0, requests: 0 });
      context = await browser.newContext();
      const page = await context.newPage();
      // Local inert fixture loaded before the fence: this test isolates request
      // cancellation; the seven original tests retain the production CSP proof.
      await page.goto(origin + "/", { waitUntil: "networkidle" });
      assert.equal(await page.title(), "native cancellation");
      const session = await context.newCDPSession(page),
        { targetInfo } = await session.send("Target.getTargetInfo");
      await session.detach();
      proxy = await nativeCancellationProxy(realPort, canceledUrl);
      fence = await fn("installNativeFence")({
        debugPort: proxy.port,
        identity: targetInfo,
        policy: (r) =>
          (r.method === "GET" && (r.url.startsWith(origin + "/") || r.url === canceledUrl)) ||
          (["OPTIONS", "POST"].includes(r.method) &&
            r.url === canceledUrl.replace("/canceled", "/cors-ok")),
        verifyResponse: async ({ resourceType, status, body }) =>
          resourceType !== "Script" &&
          status === 200 &&
          (resourceType !== "Document" || body.equals(Buffer.from(html))),
        closeContext: () => context.close(),
      });
      t.diagnostic("NATIVE_CANCEL_STAGE FENCE_READY");
      await page.evaluate((url) => {
        window.nativeCancelController = new AbortController();
        void fetch(url, { signal: window.nativeCancelController.signal }).catch(() => {});
      }, canceledUrl);
      t.diagnostic("NATIVE_CANCEL_STAGE FETCH_STARTED");
      await within(proxy.held);
      t.diagnostic("NATIVE_CANCEL_STAGE REQUEST_HELD");
      await page.evaluate(() => window.nativeCancelController.abort());
      const terminal = await within(proxy.terminal),
        record = proxy.request();
      assert.equal(terminal.canceled, true);
      assert.equal(terminal.errorText, "net::ERR_ABORTED");
      assert.equal(terminal.type, "Fetch");
      t.diagnostic("NATIVE_CANCEL_STAGE TERMINAL_PROVED");
      assert.equal(record.paused.networkId, terminal.requestId);
      assert.equal(record.paused.frameId, record.network.frameId);
      assert.ok(record.network.loaderId);
      assert.equal(record.network.request.method, "GET");
      assert.equal(record.network.type, "Fetch");
      assert.equal(record.paused.resourceType, "XHR");
      t.diagnostic("NATIVE_CANCEL_TYPES Fetch XHR");
      t.diagnostic("NATIVE_CANCEL_STAGE IDENTITY_PROVED");
      proxy.release();
      const error = await within(proxy.rejected);
      assert.equal(error.code, -32602);
      assert.equal(error.message, "Invalid InterceptionId.");
      t.diagnostic("NATIVE_CANCEL_STAGE ERROR_PROVED");
      await fence.drain();
      assert.deepEqual(
        traffic,
        { connections: 0, bytes: 0, requests: 0 },
        "request canceled while paused must never connect or transmit to independent canary",
      );
      t.diagnostic("NATIVE_CANCEL_STAGE TRANSPORT_ZERO");
      assert.equal(
        fence.snapshot().failed,
        false,
        "proven terminal initial cancellation must not close the context",
      );
      assert.equal(fence.snapshot().canceledInitialRequests, 1);
      assert.equal(await page.evaluate(() => document.title), "native cancellation");
      const ordinaryRequest = page
        .evaluate(
          async (url) => {
            const response = await fetch(url, {
              method: "POST",
              headers: { "x-native-fixture": "synthetic" },
              body: "synthetic",
            });
            if (!response.ok) throw Error("ordinary CORS request failed");
          },
          canceledUrl.replace("/canceled", "/cors-ok"),
        )
        .then(
          () => true,
          () => false,
        );
      await within(preflightRequested.promise);
      let drained = false;
      const draining = fence.drain().then(() => {
        drained = true;
      });
      await new Promise((resolve) => setTimeout(resolve, 25));
      t.diagnostic(
        "NATIVE_PREFLIGHT_DRAIN 1 " +
          Number(drained) +
          " " +
          Number(fence.snapshot().activeNetworkRequests > 0),
      );
      assert.equal(
        drained,
        false,
        "drain must retain the real outstanding OPTIONS and parent request",
      );
      pendingPreflight.end("canary");
      assert.equal(await ordinaryRequest, true);
      await draining;
      assert.equal(fence.snapshot().activeNetworkRequests, 0);
      assert.equal(fence.snapshot().failed, false, "ordinary preflight and response remain usable");
      assert.ok(
        traffic.requests >= 2 && traffic.bytes > 0,
        "ordinary allowed CORS traffic is measured",
      );
      canary.closeIdleConnections();
      Object.assign(traffic, { connections: 0, bytes: 0, requests: 0 });
      await page.addScriptTag({ url: origin + "/altered.js" }).catch(() => {});
      await fn("settledFenceSnapshot")(fence);
      assert.equal(fence.snapshot().failed, true);
      assert.equal(fence.snapshot().failureCode, "FENCE_SOURCE");
      assert.deepEqual(
        traffic,
        { connections: 0, bytes: 0, requests: 0 },
        "altered response stays blocked after benign cancellation",
      );
    } catch (error) {
      const candidate = fence?.snapshot().failureCode || error?.code;
      const allowed = new Set([
        "FENCE_REQUEST_LIFECYCLE",
        "FENCE_DRAIN_TIMEOUT",
        "FENCE_LIFECYCLE_NO_NETWORK",
        "FENCE_LIFECYCLE_TERMINAL",
        "FENCE_LIFECYCLE_FRAME",
        "FENCE_LIFECYCLE_TYPE",
        "FENCE_REQUEST",
        "FENCE_SOURCE",
        "FENCE_TRANSPORT",
        "CDP_COMMAND",
        "FENCE_CDP_CLOSED",
      ]);
      t.diagnostic("NATIVE_CANCEL_FAILURE " + (allowed.has(candidate) ? candidate : "OTHER"));
      for (const line of proxy?.metadata() || []) {
        if (fn("nativeLifecycleMetadata")(line).length) t.diagnostic(line.slice(2));
      }
      const observed = proxy?.request();
      const types = fn("nativeCancellationTypes")(
        "# NATIVE_CANCEL_TYPES " + observed?.network?.type + " " + observed?.paused?.resourceType,
      );
      if (types && candidate === "FENCE_LIFECYCLE_TYPE")
        t.diagnostic("NATIVE_CANCEL_TYPES " + types.network + " " + types.fetch);
      throw error;
    } finally {
      if (pendingPreflight && !pendingPreflight.writableEnded && !pendingPreflight.destroyed)
        pendingPreflight.end("canary");
      fence?.close();
      await browser?.close();
      await proxy?.close();
      await new Promise((resolve) => source.close(resolve));
      await new Promise((resolve) => canary.close(resolve));
    }
  },
);

function lifecycleInput(delta = {}) {
  const identity = { targetId: "own-target", browserContextId: "own-context" },
    session = { id: "own-session", targetId: "own-target", contextId: "own-context" },
    network = {
      requestId: "network-1",
      frameId: "main-frame",
      loaderId: "loader-1",
      type: "Fetch",
      timestamp: 1,
      request: { url: HML + "/", method: "GET" },
    },
    pause = {
      requestId: "fetch-1",
      networkId: "network-1",
      frameId: "main-frame",
      resourceType: "Fetch",
      request: { url: HML + "/", method: "GET" },
    },
    terminal = {
      requestId: "network-1",
      type: "Fetch",
      timestamp: 2,
      canceled: true,
      errorText: "net::ERR_ABORTED",
    },
    error = {
      code: "CDP_COMMAND",
      command: "Fetch.continueRequest",
      protocolCode: -32602,
      reason: "INVALID_INTERCEPTION",
    };
  const tracker = fn("createRequestLifecycle")(identity);
  tracker.frame(session, { id: "main-frame", loaderId: "loader-1" });
  tracker.observe(session, "Network.requestWillBeSent", { ...network, ...delta.network });
  const ticket = tracker.pause(session, { ...pause, ...delta.pause });
  tracker.sent(ticket);
  return { tracker, identity, session, network, pause, ticket, terminal, error };
}

test("ciclo consume somente uma continuação inicial comprovadamente cancelada", async () => {
  const f = lifecycleInput();
  f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
  assert.equal(await f.tracker.handleCanceled(f.ticket, f.error), true);
  assert.equal(await f.tracker.handleCanceled(f.ticket, f.error), false);
  assert.equal(f.tracker.snapshot().canceled, 1);
  assert.throws(
    () => f.tracker.acknowledge(f.ticket),
    (e) => e.code === "FENCE_REQUEST_LIFECYCLE",
  );
  f.tracker.finish(f.ticket);
  assert.equal(f.tracker.snapshot().active, 0);
  f.tracker.close();
});

test("um NetworkID não aceita dois FetchIDs iniciais distintos", () => {
  const f = lifecycleInput();
  assert.throws(
    () => f.tracker.pause(f.session, { ...f.pause, requestId: "distinct-initial-fetch" }),
    (e) => e.code === "FENCE_REQUEST_LIFECYCLE",
  );
  f.tracker.close();
});
test("consumo terminal é exclusivo no registro Network, além do ticket", async () => {
  const f = lifecycleInput();
  f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
  const duplicate = { ...f.ticket };
  assert.equal(await f.tracker.handleCanceled(f.ticket, f.error), true);
  assert.equal(await f.tracker.handleCanceled(duplicate, f.error), false);
  assert.equal(f.tracker.snapshot().canceled, 1);
  f.tracker.close();
});
for (const [name, change] of [
  ["canceledfalse", { canceled: false }],
  ["errodivergente", { errorText: "net::ERR_FAILED" }],
  ["tipo", { type: "Script" }],
  ["outrorequest", { requestId: "network-2" }],
  ["tempoanterior", { timestamp: 0 }],
  ["temponan", { timestamp: NaN }],
  ["bloqueio", { blockedReason: "csp" }],
  ["cors", { corsErrorStatus: { corsError: "InvalidResponse" } }],
])
  test("cancelamento recusa terminal " + name, async () => {
    const f = lifecycleInput();
    f.tracker.observe(f.session, "Network.loadingFailed", { ...f.terminal, ...change });
    const running = f.tracker.handleCanceled(f.ticket, f.error);
    f.tracker.close();
    assert.equal(await running, false);
    assert.equal(f.tracker.snapshot().canceled, 0);
  });
for (const command of [
  "Fetch.getResponseBody",
  "Fetch.continueResponse",
  "Fetch.fulfillRequest",
  "Fetch.failRequest",
])
  test("cancelamento não ignora erro de " + command, async () => {
    const f = lifecycleInput();
    f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
    assert.equal(await f.tracker.handleCanceled(f.ticket, { ...f.error, command }), false);
    f.tracker.close();
  });
test("cancelamento recusa falta de terminal, ack, resposta e nova geração", async () => {
  for (const condition of ["missing", "ack", "response", "generation", "closed"]) {
    const f = lifecycleInput();
    if (condition === "ack") f.tracker.acknowledge(f.ticket);
    if (condition === "response")
      f.tracker.observe(f.session, "Network.responseReceived", {
        requestId: "network-1",
        type: "Fetch",
      });
    if (condition === "generation")
      f.tracker.observe(f.session, "Network.requestWillBeSent", {
        ...f.network,
        requestId: "next-document",
        loaderId: "loader-2",
        type: "Document",
      });
    if (condition !== "missing") f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
    if (condition === "closed") f.tracker.close();
    const running = f.tracker.handleCanceled(f.ticket, f.error);
    f.tracker.close();
    assert.equal(await running, false, condition);
  }
});

test("ciclo recusa identidade divergente, redirect, reutilização e pause duplicado", () => {
  for (const key of ["targetId", "contextId", "id"]) {
    const f = lifecycleInput();
    assert.throws(() =>
      f.tracker.observe({ ...f.session, [key]: "foreign" }, "Network.loadingFailed", f.terminal),
    );
    f.tracker.close();
  }
  for (const delta of [
    { frameId: "other" },
    { networkId: "other" },
    { request: { url: HML + "/other", method: "GET" } },
    { resourceType: "Script" },
  ]) {
    const f = lifecycleInput();
    assert.throws(() =>
      f.tracker.pause(f.session, { ...f.pause, requestId: "new-fetch", ...delta }),
    );
    f.tracker.close();
  }
  const f = lifecycleInput();
  assert.throws(() => f.tracker.pause(f.session, f.pause));
  assert.throws(() => f.tracker.observe(f.session, "Network.requestWillBeSent", f.network));
  f.tracker.close();
  const g = lifecycleInput();
  assert.throws(() =>
    g.tracker.observe(g.session, "Network.requestWillBeSent", {
      ...g.network,
      requestId: "redirect",
      redirectResponse: { status: 302 },
    }),
  );
  g.tracker.close();
});
test("ciclo tem mapas limitados e limpa pendências ao fechar", async () => {
  const f = lifecycleInput();
  for (let n = 1; n < 1024; n++)
    f.tracker.observe(f.session, "Network.requestWillBeSent", {
      ...f.network,
      requestId: "bounded-" + n,
    });
  assert.throws(() =>
    f.tracker.observe(f.session, "Network.requestWillBeSent", {
      ...f.network,
      requestId: "excess",
    }),
  );
  const waiting = f.tracker.handleCanceled(f.ticket, f.error);
  f.tracker.close();
  assert.equal(await waiting, false);
  assert.equal(f.tracker.snapshot().active, 0);
});

test("ciclo aguarda evento terminal tardio exato sem repetir continuação", async () => {
  const f = lifecycleInput();
  const running = f.tracker.handleCanceled(f.ticket, f.error);
  await new Promise((resolve) => setImmediate(resolve));
  f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
  assert.equal(await running, true);
  assert.equal(f.tracker.snapshot().canceled, 1);
  f.tracker.close();
});
test("ciclo não aceita política ou proveniência como cancelamento", async () => {
  for (const code of ["FENCE_REQUEST", "FENCE_SOURCE", "FENCE_TRANSPORT"]) {
    const f = lifecycleInput();
    f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
    assert.equal(await f.tracker.handleCanceled(f.ticket, { ...f.error, code }), false);
    f.tracker.close();
  }
});
test("tombstones sobrevivem à conclusão e têm teto fechado", () => {
  const f = lifecycleInput();
  f.tracker.observe(f.session, "Network.loadingFinished", { requestId: "network-1" });
  f.tracker.finish(f.ticket);
  assert.equal(f.tracker.snapshot().active, 0);
  assert.throws(() => f.tracker.observe(f.session, "Network.requestWillBeSent", f.network));
  // The duplicate is fatal. Use a fresh context for the independent capacity proof.
  f.tracker.close();
  const g = lifecycleInput();
  g.tracker.observe(g.session, "Network.loadingFinished", { requestId: "network-1" });
  g.tracker.finish(g.ticket);
  for (let n = 1; n < 65536; n++) {
    const requestId = "retired-" + n;
    g.tracker.observe(g.session, "Network.requestWillBeSent", { ...g.network, requestId });
    g.tracker.observe(g.session, "Network.loadingFinished", { requestId });
  }
  assert.equal(g.tracker.snapshot().active, 0);
  assert.throws(() =>
    g.tracker.observe(g.session, "Network.requestWillBeSent", {
      ...g.network,
      requestId: "overflow",
    }),
  );
  g.tracker.close();
});

test("par nativo Fetch/XHR mantém tipos originais e autoriza apenas GET cancelado", async () => {
  const f = lifecycleInput({ pause: { resourceType: "XHR" } });
  f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
  assert.equal(await f.tracker.handleCanceled(f.ticket, f.error), true);
  assert.equal(f.tracker.snapshot().canceled, 1);
  f.tracker.close();
});
for (const method of ["POST", "OPTIONS"])
  test("par Fetch/XHR não autoriza cancelamento " + method, async () => {
    const request = { url: HML + "/", method };
    const f = lifecycleInput({ network: { request }, pause: { request, resourceType: "XHR" } });
    f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
    assert.equal(await f.tracker.handleCanceled(f.ticket, f.error), false);
    f.tracker.close();
  });
test("par Fetch/XHR aceita resposta ordinária estável sem exceção", () => {
  const f = lifecycleInput({ pause: { resourceType: "XHR" } });
  f.tracker.acknowledge(f.ticket);
  f.tracker.finish(f.ticket);
  const response = f.tracker.pause(f.session, {
    ...f.pause,
    resourceType: "XHR",
    responseStatusCode: 200,
  });
  assert.equal(response.stage, "RESPONSE");
  f.tracker.finish(response);
  f.tracker.close();
});
test("tipo Fetch fica imutável entre estágios, mesmo quando outro par seria válido", () => {
  const f = lifecycleInput();
  f.tracker.acknowledge(f.ticket);
  f.tracker.finish(f.ticket);
  assert.throws(() =>
    f.tracker.pause(f.session, { ...f.pause, resourceType: "XHR", responseStatusCode: 200 }),
  );
  f.tracker.close();
});
for (const [networkType, fetchType] of [
  ["XHR", "Fetch"],
  ["Other", "XHR"],
  ["Fetch", "Other"],
  ["Preflight", "XHR"],
  [undefined, undefined],
  ["UNKNOWN", "UNKNOWN"],
])
  test("ciclo recusa par não comprovado " + networkType + "/" + fetchType, () => {
    assert.throws(() =>
      lifecycleInput({ network: { type: networkType }, pause: { resourceType: fetchType } }),
    );
  });

function ordinaryPreflight(delta = {}) {
  const request = { url: HML + "/", method: "OPTIONS" };
  return lifecycleInput({
    network: { type: "Other", frameId: undefined, loaderId: "", request, ...delta.network },
    pause: { resourceType: "XHR", request, ...delta.pause },
  });
}
test("preflight ordinário sem Networkframe segue resposta e nunca autoriza cancelamento", async () => {
  const f = ordinaryPreflight();
  f.tracker.acknowledge(f.ticket);
  f.tracker.finish(f.ticket);
  const response = f.tracker.pause(f.session, {
    ...f.pause,
    resourceType: "XHR",
    request: { url: HML + "/", method: "OPTIONS" },
    responseStatusCode: 200,
  });
  assert.equal(response.stage, "RESPONSE");
  f.tracker.finish(response);
  f.tracker.close();
  const g = ordinaryPreflight();
  g.tracker.observe(g.session, "Network.loadingFailed", { ...g.terminal, type: "Other" });
  assert.equal(await g.tracker.handleCanceled(g.ticket, g.error), false);
  assert.equal(g.tracker.snapshot().canceled, 0);
  g.tracker.finish(g.ticket);
  assert.equal(g.tracker.snapshot().active, 0);
  g.tracker.close();
});
for (const delta of [
  { network: { frameId: "main-frame" } },
  { network: { loaderId: "loader-1" } },
  { network: { frameId: null } },
  { network: { loaderId: null } },
  { network: { type: "Preflight" } },
  { network: { timestamp: NaN } },
  { pause: { frameId: "foreign" } },
  { pause: { frameId: undefined } },
  ...["GET", "POST"].map((method) => ({
    network: { request: { url: HML + "/", method } },
    pause: { request: { url: HML + "/", method } },
  })),
])
  test("preflight recusa identidade ou método não comprovado " + JSON.stringify(delta), () => {
    assert.throws(() => ordinaryPreflight(delta));
  });
test("preflight recusa mudança de frame, geração e tipo na resposta", () => {
  for (const condition of ["frame", "generation", "type"]) {
    const f = ordinaryPreflight();
    f.tracker.acknowledge(f.ticket);
    f.tracker.finish(f.ticket);
    if (condition === "generation")
      f.tracker.observe(f.session, "Page.frameNavigated", {
        frame: { id: "main-frame", loaderId: "loader-2" },
      });
    assert.throws(() =>
      f.tracker.pause(f.session, {
        ...f.pause,
        resourceType: condition === "type" ? "Other" : "XHR",
        frameId: condition === "frame" ? "foreign" : "main-frame",
        request: { url: HML + "/", method: "OPTIONS" },
        responseStatusCode: 200,
      }),
    );
    f.tracker.close();
  }
});

test("diagnóstico runtime mantém códigos exatos novos sem conteúdo privado", () => {
  for (const code of [
    "FENCE_LIFECYCLE_NO_NETWORK",
    "FENCE_LIFECYCLE_TERMINAL",
    "FENCE_LIFECYCLE_FRAME",
    "FENCE_LIFECYCLE_TYPE",
  ])
    assert.equal(
      fn("runtimeDiagnostics")({ fence: { failureCode: code } }).fence.failureCode,
      code,
    );
  assert.equal(
    fn("nativeSourceFailure")("# NATIVE_SOURCE_FAILURE FENCE_LIFECYCLE_TYPE"),
    "FENCE_LIFECYCLE_TYPE",
  );
  assert.equal(fn("nativeSourceFailure")("# NATIVE_SOURCE_FAILURE pessoa@example.com"), null);
});
test("metadados runtime são somente enums e booleanos fechados", () => {
  const allowed = {
    network: "Script",
    fetch: "Script",
    method: "GET",
    stage: "REQUEST",
    networkFramePresent: true,
    sameFrame: true,
    loaderPresent: true,
    ownFetchFrame: true,
    generationSame: true,
    terminal: false,
  };
  const d = fn("runtimeDiagnostics")({
    fence: {
      lifecycleMetadata: {
        ...allowed,
        url: "https://private.invalid",
        authorization: "Bearer SECRET",
      },
    },
  });
  assert.deepEqual(d.fence.lifecycleMetadata, allowed);
  assert.equal(
    fn("runtimeDiagnostics")({ fence: { lifecycleMetadata: { ...allowed, network: "SECRET" } } })
      .fence.lifecycleMetadata,
    null,
  );
});

function delayedLifecycle() {
  const f = lifecycleInput();
  f.tracker.close();
  f.tracker = fn("createRequestLifecycle")(f.identity);
  f.tracker.frame(f.session, { id: "main-frame", loaderId: "loader-1" });
  return f;
}
test("pause inicial espera Network original antes de devolver ticket", async () => {
  const f = delayedLifecycle();
  let settled = false;
  const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then((t) => {
    settled = true;
    return t;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  assert.equal(f.tracker.snapshot().pendingNetwork, 1);
  f.tracker.observe(f.session, "Network.requestWillBeSent", f.network);
  const ticket = await waiting;
  assert.equal(ticket.record.networkId, f.network.requestId);
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
  f.tracker.sent(ticket);
  f.tracker.close();
});
test("pause sem Network expira e evento tardio nunca ressuscita tracker", async () => {
  const f = delayedLifecycle();
  await assert.rejects(
    f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()),
    (e) => e.code === "FENCE_LIFECYCLE_NO_NETWORK",
  );
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
  assert.throws(() => f.tracker.observe(f.session, "Network.requestWillBeSent", f.network));
});
for (const condition of [
  "expired",
  "response",
  "missingId",
  "foreignFrame",
  "duplicateNetwork",
  "duplicateFetch",
  "generation",
  "wrongNetwork",
  "closed",
])
  test("espera Network falha fechada " + condition, async () => {
    const f = delayedLifecycle();
    if (["expired", "response", "missingId", "foreignFrame"].includes(condition)) {
      await assert.rejects(
        f.tracker.pauseWhenObserved(
          f.session,
          {
            ...f.pause,
            ...(condition === "response" ? { responseStatusCode: 200 } : {}),
            ...(condition === "missingId" ? { requestId: "" } : {}),
            ...(condition === "foreignFrame" ? { frameId: "foreign" } : {}),
          },
          performance.now() - (condition === "expired" ? 251 : 0),
        ),
      );
      f.tracker.close();
      return;
    }
    const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
      () => null,
      (e) => e,
    );
    if (condition === "duplicateNetwork" || condition === "duplicateFetch")
      await assert.rejects(
        f.tracker.pauseWhenObserved(
          f.session,
          {
            ...f.pause,
            ...(condition === "duplicateNetwork"
              ? { requestId: "other-fetch" }
              : { networkId: "other-network" }),
          },
          performance.now(),
        ),
      );
    if (condition === "generation") {
      f.tracker.observe(f.session, "Page.frameNavigated", {
        frame: { id: "main-frame", loaderId: "loader-2" },
      });
      f.tracker.observe(f.session, "Network.requestWillBeSent", f.network);
    }
    if (condition === "wrongNetwork") {
      f.tracker.observe(f.session, "Network.requestWillBeSent", {
        ...f.network,
        requestId: "other-network",
      });
      assert.equal(f.tracker.snapshot().pendingNetwork, 1);
      f.tracker.close();
    }
    if (condition === "closed") f.tracker.close();
    assert.ok((await waiting)?.code);
    assert.equal(f.tracker.snapshot().pendingNetwork, 0);
    f.tracker.close();
  });
test("espera Network revalida URL método e tipo recebidos sem inventar registro", async () => {
  for (const delta of [
    { type: "Script" },
    { request: { url: HML + "/different", method: "GET" } },
    { request: { url: HML + "/", method: "POST" } },
  ]) {
    const f = delayedLifecycle();
    const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
      () => null,
      (e) => e,
    );
    f.tracker.observe(f.session, "Network.requestWillBeSent", { ...f.network, ...delta });
    assert.ok((await waiting)?.code);
    f.tracker.close();
  }
});
test("espera Network tem teto1024 e fecha todas as pendências no excesso", async () => {
  const f = delayedLifecycle(),
    waiting = [];
  for (let n = 0; n < 1024; n++)
    waiting.push(
      f.tracker
        .pauseWhenObserved(
          f.session,
          { ...f.pause, requestId: "f-" + n, networkId: "n-" + n },
          performance.now(),
        )
        .then(
          () => false,
          () => true,
        ),
    );
  await assert.rejects(
    f.tracker.pauseWhenObserved(
      f.session,
      { ...f.pause, requestId: "excess", networkId: "excess" },
      performance.now(),
    ),
  );
  assert.equal((await Promise.all(waiting)).every(Boolean), true);
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
});

test("prova da ordenação nativa aceita apenas cinco indicadores fechados", () => {
  assert.deepEqual(fn("nativeSourceOrdering")("# NATIVE_SOURCE_ORDER 1 1 1 1 0"), {
    originalNetworkObserved: true,
    initialPauseObserved: true,
    networkDelivered: 1,
    initialContinuations: 1,
    continuationBeforeNetwork: false,
  });
  assert.equal(fn("nativeSourceOrdering")("# NATIVE_SOURCE_ORDER pessoa@example.com"), null);
});

test("espera Network não associa registro já terminal nem aceita sessão alheia", async () => {
  const f = delayedLifecycle();
  const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
    () => null,
    (e) => e,
  );
  f.tracker.observe(f.session, "Network.requestWillBeSent", f.network);
  f.tracker.observe(f.session, "Network.loadingFailed", f.terminal);
  assert.ok((await waiting)?.code);
  for (const field of ["id", "targetId", "contextId"]) {
    const g = delayedLifecycle();
    await assert.rejects(
      g.tracker.pauseWhenObserved({ ...g.session, [field]: "foreign" }, g.pause, performance.now()),
    );
    assert.equal(g.tracker.snapshot().pendingNetwork, 0);
    g.tracker.close();
  }
});

test("FetchID reservado não entra pelo caminho Network já conhecido", async () => {
  const f = delayedLifecycle();
  const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
    () => null,
    (e) => e,
  );
  f.tracker.observe(f.session, "Network.requestWillBeSent", {
    ...f.network,
    requestId: "known-network",
  });
  await assert.rejects(
    f.tracker.pauseWhenObserved(
      f.session,
      { ...f.pause, networkId: "known-network" },
      performance.now(),
    ),
  );
  assert.ok((await waiting)?.code);
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
});
test("Network ordinário não ocupa a reserva de outra pendência no teto1024", async () => {
  const f = delayedLifecycle();
  const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
    () => null,
    (e) => e,
  );
  for (let n = 0; n < 1023; n++)
    f.tracker.observe(f.session, "Network.requestWillBeSent", {
      ...f.network,
      requestId: "known-" + n,
    });
  assert.throws(() =>
    f.tracker.observe(f.session, "Network.requestWillBeSent", {
      ...f.network,
      requestId: "excess",
    }),
  );
  assert.ok((await waiting)?.code);
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
});
function nearReservedTombstoneLimit() {
  const f = delayedLifecycle();
  f.tracker.observe(f.session, "Network.requestWillBeSent", {
    ...f.network,
    requestId: "known-network",
  });
  for (let n = 0; n < 65534; n++) {
    const requestId = "historical-" + n;
    f.tracker.observe(f.session, "Network.requestWillBeSent", { ...f.network, requestId });
    const t = f.tracker.pause(f.session, { ...f.pause, requestId, networkId: requestId });
    f.tracker.sent(t);
    f.tracker.acknowledge(t);
    f.tracker.observe(f.session, "Network.loadingFinished", { requestId });
    f.tracker.finish(t);
  }
  return f;
}
for (const boundary of ["Network", "Fetch"])
  test("tombstones respeitam reserva65536 em caminho ordinário " + boundary, async () => {
    const f = nearReservedTombstoneLimit();
    const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
      () => null,
      (e) => e,
    );
    if (boundary === "Network")
      assert.throws(() =>
        f.tracker.observe(f.session, "Network.requestWillBeSent", {
          ...f.network,
          requestId: "excess",
        }),
      );
    else {
      const initial = f.tracker.pause(f.session, {
        ...f.pause,
        requestId: "known-fetch",
        networkId: "known-network",
      });
      f.tracker.sent(initial);
      f.tracker.acknowledge(initial);
      f.tracker.finish(initial);
      assert.throws(() =>
        f.tracker.pause(f.session, {
          ...f.pause,
          requestId: "excess-fetch",
          networkId: "known-network",
          responseStatusCode: 200,
        }),
      );
    }
    assert.ok((await waiting)?.code);
    assert.equal(f.tracker.snapshot().pendingNetwork, 0);
  });

test("FetchID reservado tampouco entra pelo caminho sem NetworkID", async () => {
  const f = delayedLifecycle();
  const waiting = f.tracker.pauseWhenObserved(f.session, f.pause, performance.now()).then(
    () => null,
    (e) => e,
  );
  await assert.rejects(
    f.tracker.pauseWhenObserved(f.session, { ...f.pause, networkId: undefined }, performance.now()),
  );
  assert.ok((await waiting)?.code);
  assert.equal(f.tracker.snapshot().pendingNetwork, 0);
});

async function emitOutstandingNetwork(fixture, fence, requestId = "outstanding") {
  fixture.emit({
    method: "Network.requestWillBeSent",
    sessionId: "initial-session",
    params: {
      requestId,
      frameId: "main-frame",
      loaderId: "fixture-loader",
      type: "Fetch",
      timestamp: 1,
      request: { url: HML + "/", method: "GET" },
    },
  });
  for (let i = 0; i < 1000 && !fence.snapshot().activeNetworkRequests; i++)
    await new Promise((resolve) => setImmediate(resolve));
  assert.ok(fence.snapshot().activeNetworkRequests > 0);
}
test("drain aguarda evento terminal Network antes de permitir navegação", async () => {
  const fixture = await cdpFixture();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
    });
    await emitOutstandingNetwork(fixture, fence);
    let returned = false;
    const waiting = fence.drain().then(() => {
      returned = true;
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(returned, false);
    fixture.emit({
      method: "Network.loadingFinished",
      sessionId: "initial-session",
      params: { requestId: "outstanding" },
    });
    await waiting;
    assert.equal(fence.snapshot().activeNetworkRequests, 0);
  } finally {
    fence?.close();
    await fixture.close();
  }
});
test("drain tem deadline global10s que outro evento não renova", { timeout: 15000 }, async () => {
  const fixture = await cdpFixture();
  let fence, timer;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
    });
    await emitOutstandingNetwork(fixture, fence);
    timer = setTimeout(
      () =>
        fixture.emit({
          method: "Network.requestWillBeSent",
          sessionId: "initial-session",
          params: {
            requestId: "late",
            frameId: "main-frame",
            loaderId: "fixture-loader",
            type: "Fetch",
            timestamp: 2,
            request: { url: HML + "/", method: "GET" },
          },
        }),
      5000,
    );
    const start = performance.now();
    await assert.rejects(fence.drain(), (e) => e.code === "FENCE_DRAIN_TIMEOUT");
    assert.ok(performance.now() - start >= 9500 && performance.now() - start < 13000);
    assert.equal(fence.snapshot().failureCode, "FENCE_DRAIN_TIMEOUT");
  } finally {
    clearTimeout(timer);
    fence?.close();
    await fixture.close();
  }
});
for (const condition of ["close", "fatal"])
  test("drain não permite avanço após " + condition, async () => {
    const fixture = await cdpFixture();
    let fence;
    try {
      fence = await fn("installNativeFence")({
        debugPort: fixture.port,
        identity: fixture.identity,
        closeContext: async () => {},
        verifyResponse: async () => true,
      });
      await emitOutstandingNetwork(fixture, fence);
      const waiting = fence.drain().then(
        () => null,
        (e) => e,
      );
      if (condition === "close") fence.close();
      else
        fixture.emit({
          method: "Network.requestWillBeSent",
          sessionId: "initial-session",
          params: {
            requestId: "outstanding",
            type: "Fetch",
            request: { url: HML + "/", method: "GET" },
          },
        });
      assert.ok((await waiting)?.code);
    } finally {
      fence?.close();
      await fixture.close();
    }
  });
test("prova de drenagem nativa não aceita identificadores ou conteúdo", () => {
  assert.deepEqual(fn("nativePreflightDrain")("# NATIVE_PREFLIGHT_DRAIN 1 0 1"), {
    originalOptionsObserved: true,
    returnedBeforeRelease: false,
    activeNetworkBeforeRelease: true,
  });
  assert.equal(fn("nativePreflightDrain")("# NATIVE_PREFLIGHT_DRAIN 1 pessoa@example.com 1"), null);
});

test("snapshot diagnóstico de falha não autoriza navegação", async () => {
  let navigated = false;
  const fence = {
    drain: async () => {
      throw Object.assign(new Error("FENCE_SOURCE"), { code: "FENCE_SOURCE" });
    },
    snapshot: () => ({ failed: true, failureCode: "FENCE_SOURCE" }),
    assertSafe: () => {
      throw Error("failed");
    },
  };
  assert.equal((await fn("settledFenceSnapshot")(fence)).failureCode, "FENCE_SOURCE");
  await assert.rejects(
    fn("navigateVerifiedPage")(
      {
        waitForLoadState: async () => {},
        goto: async () => {
          navigated = true;
        },
      },
      fence,
      HML + "/",
    ),
  );
  assert.equal(navigated, false);
});

test("drain recusa ociosidade alcançada depois do deadline antes da inspeção", async (t) => {
  const fixture = await cdpFixture();
  let fence,
    wake,
    clock = 0;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
    });
    await emitOutstandingNetwork(fixture, fence);
    const originalTimeout = globalThis.setTimeout;
    t.mock.method(performance, "now", () => clock);
    t.mock.method(globalThis, "setTimeout", (callback, delay, ...args) => {
      if (delay <= 10) {
        wake = () => callback(...args);
        return undefined;
      }
      return originalTimeout(callback, delay, ...args);
    });
    const waiting = fence.drain().then(
      () => null,
      (e) => e,
    );
    assert.equal(typeof wake, "function");
    fixture.emit({
      method: "Network.loadingFinished",
      sessionId: "initial-session",
      params: { requestId: "outstanding" },
    });
    for (let n = 0; n < 1000 && fence.snapshot().activeNetworkRequests; n++)
      await new Promise((resolve) => setImmediate(resolve));
    assert.equal(fence.snapshot().activeNetworkRequests, 0);
    clock = 10001;
    wake();
    assert.equal((await waiting)?.code, "FENCE_DRAIN_TIMEOUT");
  } finally {
    t.mock.restoreAll();
    fence?.close();
    await fixture.close();
  }
});

test("drain revalida deadline imediatamente antes de retornar ocioso", async (t) => {
  const fixture = await cdpFixture();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
    });
    await new Promise((resolve) => setImmediate(resolve));
    let reads = 0;
    t.mock.method(performance, "now", () => [0, 9999, 10001][Math.min(reads++, 2)]);
    await assert.rejects(fence.drain(), (e) => e.code === "FENCE_DRAIN_TIMEOUT");
  } finally {
    t.mock.restoreAll();
    fence?.close();
    await fixture.close();
  }
});

test("política injetada recebe corpo e estágio nativos antes da continuação", async () => {
  const fixture = await cdpFixture();
  let fence, observed;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
      policy: (request) => {
        observed = request;
        return false;
      },
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "intent-request",
        resourceType: "XHR",
        frameId: "main-frame",
        request: {
          url: API + "/rest/v1/rpc/criar_competencia",
          method: "POST",
          postData: '{"p_id_contrato":"synthetic"}',
        },
      },
    });
    for (let i = 0; i < 1000 && !fence.snapshot().failed; i++)
      await new Promise((resolve) => setImmediate(resolve));
    assert.equal(observed.postData, '{"p_id_contrato":"synthetic"}');
    assert.equal(observed.stage, "REQUEST");
    assert.equal(observed.interceptionId, "intent-request");
    assert.equal(observed.sessionId, "initial-session");
    assert.equal(fixture.received.filter((x) => x.method === "Fetch.continueRequest").length, 0);
  } finally {
    fence?.close();
    await fixture.close();
  }
});

test("política assíncrona nunca equivale a autorização booleana síncrona", async () => {
  const fixture = await cdpFixture();
  let fence;
  try {
    fence = await fn("installNativeFence")({
      debugPort: fixture.port,
      identity: fixture.identity,
      closeContext: async () => {},
      verifyResponse: async () => true,
      policy: () => Promise.resolve(true),
    });
    fixture.emit({
      method: "Fetch.requestPaused",
      sessionId: "initial-session",
      params: {
        requestId: "async-policy",
        resourceType: "XHR",
        frameId: "main-frame",
        request: { url: HML + "/", method: "GET" },
      },
    });
    for (let i = 0; i < 1000 && !fence.snapshot().failed; i++)
      await new Promise((resolve) => setImmediate(resolve));
    assert.equal(fence.snapshot().failureCode, "FENCE_REQUEST");
    assert.equal(fixture.received.filter((x) => x.method === "Fetch.continueRequest").length, 0);
  } finally {
    fence?.close();
    await fixture.close();
  }
});

// Run78: removing the readiness barrier must allow an early PNG and fail these tests.
test("Run78 captura somente depois de decode, drenagem, medidas e privacidade", async () => {
  const events = [];
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  const capture = fn("captureVisualEvidence")({
    brand: async () => {
      events.push("decode-start");
      await ready;
      events.push("decode-end");
      return { decoded: true };
    },
    drain: async () => {
      events.push("drain");
    },
    stabilize: async () => {
      events.push("raf");
    },
    measure: async () => {
      events.push("measure");
      return { passed: true };
    },
    privacy: async () => {
      events.push("privacy");
      return true;
    },
    save: async () => {
      events.push("png");
      return { file: "synthetic.png" };
    },
  });
  await Promise.resolve();
  assert.deepEqual(events, ["decode-start"]);
  release();
  const result = await capture;
  assert.deepEqual(events, [
    "decode-start",
    "decode-end",
    "drain",
    "raf",
    "measure",
    "privacy",
    "png",
  ]);
  assert.equal(result.phase, "BEFORE_PNG");
});
for (const stage of ["brand", "drain", "stabilize", "measure", "privacy"]) {
  test(`Run78 falha em ${stage} impede qualquer PNG`, async () => {
    let saved = 0;
    const steps = {
      brand: async () => ({ decoded: true }),
      drain: async () => {},
      stabilize: async () => {},
      measure: async () => ({ passed: true }),
      privacy: async () => true,
      save: async () => {
        saved++;
      },
    };
    steps[stage] = async () => {
      throw Object.assign(new Error("synthetic"), { code: "VISUAL_TEST" });
    };
    await assert.rejects(fn("captureVisualEvidence")(steps));
    assert.equal(saved, 0);
  });
}
test("Run78 medidas ou privacidade incompletas não aprovam captura", async () => {
  for (const change of [
    { measure: async () => ({}) },
    { measure: async () => ({ passed: false }) },
    { privacy: async () => false },
  ]) {
    let saved = 0;
    await assert.rejects(
      fn("captureVisualEvidence")({
        brand: async () => ({}),
        drain: async () => {},
        stabilize: async () => {},
        measure: async () => ({ passed: true }),
        privacy: async () => true,
        save: async () => {
          saved++;
        },
        ...change,
      }),
    );
    assert.equal(saved, 0);
  }
});
test("Run78 marca: espera decode pendente e rejeita imagem inválida ou timeout", async () => {
  const image = (delta = {}) => ({
    isConnected: true,
    complete: true,
    naturalWidth: 900,
    naturalHeight: 220,
    getAttribute: () => "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
    getBoundingClientRect: () => ({ width: 131, height: 32 }),
    decode: async () => {},
    ...delta,
  });
  let release;
  let complete = false;
  const pending = fn("decodeBrandImage")(
    image({
      decode: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    }),
    { context: { surface: "V110", width: 1440, theme: "light", mode: "PRIMARY" }, timeoutMs: 200 },
  ).then((v) => {
    complete = true;
    return v;
  });
  await Promise.resolve();
  assert.equal(complete, false);
  release();
  assert.equal((await pending).decoded, true);
  for (const delta of [
    { naturalWidth: 0 },
    { naturalHeight: 0 },
    { isConnected: false },
    { getAttribute: () => "/other.svg" },
    { getBoundingClientRect: () => ({ width: 0, height: 32 }) },
    {
      decode: async () => {
        throw Error("private browser message");
      },
    },
    { decode: () => new Promise(() => {}) },
  ]) {
    await assert.rejects(
      fn("decodeBrandImage")(image(delta), {
        context: { surface: "V110", width: 1440, theme: "light", mode: "PRIMARY" },
        timeoutMs: 10,
      }),
      (e) => /^VISUAL_BRAND_(INVALID|DECODE|TIMEOUT)$/.test(e.code),
    );
  }
});
test("Run78 seis baseline móveis são recapturáveis e preservam origem histórica", () => {
  const cases = fn("privateCases")();
  const mobile = cases.filter(
    (c) => ["V114", "V116", "V118"].includes(c.surface) && c.width === 390,
  );
  assert.equal(mobile.length, 6);
  for (const row of mobile) {
    assert.equal(fn("preservedPrivateCase")(row), null);
    assert.equal(fn("run78VisualSelection")(row).baselineRun, 42496235106);
    assert.equal(fn("run78VisualSelection")(row).required, true);
  }
  assert.equal(cases.filter((c) => fn("preservedPrivateCase")(c)).length, 18);
  assert.equal(cases.filter((c) => fn("run78VisualSelection")(c)?.required).length, 74);
  assert.equal(fn("run78VisualSelection")({ surface: "V114", width: 391, theme: "light" }), null);
});
test("Run78 checker geométrico rejeita interseção, caixas inválidas e oclusão", () => {
  const check = fn("visualGeometryValid");
  const box = { x: 0, y: 0, width: 44, height: 44 };
  assert.equal(
    check({
      viewport: { width: 390, height: 640 },
      targets: [{ rect: box, connected: true, visible: true, hit: true }],
      pairs: [],
    }),
    true,
  );
  for (const delta of [{ width: 0 }, { x: -1 }, { width: Infinity }, { y: NaN }, { x: 380 }])
    assert.equal(
      check({
        viewport: { width: 390, height: 640 },
        targets: [{ rect: { ...box, ...delta }, connected: true, visible: true, hit: true }],
        pairs: [],
      }),
      false,
    );
  for (const state of [{ connected: false }, { visible: false }, { hit: false }])
    assert.equal(
      check({
        viewport: { width: 390, height: 640 },
        targets: [{ rect: box, connected: true, visible: true, hit: true, ...state }],
        pairs: [],
      }),
      false,
    );
  assert.equal(
    check({
      viewport: { width: 390, height: 640 },
      targets: [],
      pairs: [[box, { ...box, x: 43 }]],
    }),
    false,
  );
  assert.equal(
    check({
      viewport: { width: 390, height: 640 },
      targets: [],
      pairs: [[box, { ...box, x: 44 }]],
    }),
    true,
  );
});

test("Run78 rejeita aprovação focal sem PNG DOM hashes identidade e medidas anteriores", () => {
  const check = fn("run78VisualEvidenceValid");
  const item = fn("privateCases")().find(
    (c) => c.surface === "V110" && c.width === 390 && c.theme === "light",
  );
  const proof = {
    phase: "BEFORE_PNG",
    measuredAt: 1,
    capturedAt: 2,
    metrics: {
      passed: true,
      geometryPassed: true,
      tablePassed: true,
      datesPassed: true,
      contrastPassed: true,
      viewport: { width: 390, height: 1000 },
      theme: "light",
      targets: [],
      pairs: [],
    },
    image: {
      count: 0,
      images: [],
      context: { surface: "V110", width: 390, theme: "light", mode: "PRIMARY" },
    },
  };
  const row = {
    ...item,
    screenshot: "screenshots/V110_390_light.png",
    sha256: "a".repeat(64),
    dom: "dom/V110_390_light.json",
    domSha256: "b".repeat(64),
    visualCapture: proof,
    sidebarSupplement: {
      passed: true,
      screenshot: "screenshots/V110_390_light_menu.png",
      sha256: "c".repeat(64),
      visualCapture: {
        ...proof,
        image: {
          count: 1,
          context: { surface: "V110", width: 390, theme: "light", mode: "MOBILE_MENU" },
          images: [
            {
              decoded: true,
              complete: true,
              naturalWidth: 900,
              naturalHeight: 220,
              width: 131,
              height: 32,
              src: "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
            },
          ],
        },
      },
    },
  };
  assert.equal(check(row), true);
  for (const delta of [
    { path: "/foreign" },
    { width: 391 },
    { sha256: null },
    { dom: null },
    { visualCapture: null },
    {
      visualCapture: {
        ...proof,
        image: {
          ...proof.image,
          context: { surface: "SYS04", width: 390, theme: "light", mode: "PRIMARY" },
        },
      },
    },
    {
      visualCapture: {
        ...proof,
        metrics: { ...proof.metrics, viewport: { width: 1280, height: 1000 } },
      },
    },
    { visualCapture: { ...proof, metrics: { ...proof.metrics, theme: "dark" } } },
    { visualCapture: { ...proof, measuredAt: 3 } },
    { visualCapture: { ...proof, metrics: {} } },
    { sidebarSupplement: { ...row.sidebarSupplement, visualCapture: proof } },
  ])
    assert.equal(check({ ...row, ...delta }), false);
});

// Additional isolated browser proof; the eight native fence tests keep their identity.
// Selected separately by --native-guard, after their independent 8/8 proof.
test(
  "Run78 Chromium isolado: decode real retardado quebrado e hit-test",
  {
    skip: process.env.CONTAOS_NATIVE_GUARD !== "1",
    timeout: 30000,
  },
  async () => {
    const { chromium } = await import("playwright");
    const { readFile } = await import("node:fs/promises");
    const image = await readFile(
      new URL(
        "../../public/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
        import.meta.url,
      ),
    );
    let release,
      observed,
      broken = false,
      browser;
    const requested = new Promise((resolve) => {
      observed = resolve;
    });
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const server = createHttpServer(async (req, res) => {
      if (req.url === "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg") {
        observed();
        await gate;
        res.setHeader("content-type", "image/svg+xml");
        res.end(broken ? "broken" : image);
      } else {
        res.setHeader("content-type", "text/html");
        res.end(
          '<!doctype html><img alt="ContaOS" width="131" height="32" src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg">',
        );
      }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      browser = await launchIsolatedProvedBrowser(chromium);
      const page = await browser.newPage({ viewport: { width: 390, height: 640 } });
      const origin = `http://127.0.0.1:${server.address().port}`;
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await requested;
      let finished = false;
      const pending = fn("readyVisualBrand")(
        page,
        { surface: "V121", width: 390, theme: "light" },
        "MOBILE_MENU",
      ).then((v) => {
        finished = true;
        return v;
      });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
      assert.equal(finished, false);
      release();
      assert.equal((await pending).images[0].decoded, true);
      await page
        .locator("img")
        .evaluate((img) => img.cloneNode(true) && img.after(img.cloneNode(true)));
      await assert.rejects(
        fn("readyVisualBrand")(
          page,
          { surface: "V121", width: 390, theme: "light" },
          "MOBILE_MENU",
        ),
        (e) => e.code === "VISUAL_BRAND_COUNT",
      );
      broken = true;
      await page.reload({ waitUntil: "load" });
      await assert.rejects(
        fn("readyVisualBrand")(
          page,
          { surface: "V121", width: 390, theme: "light" },
          "MOBILE_MENU",
        ),
        (e) => e.code === "VISUAL_BRAND_INVALID",
      );
      await page.setContent(
        '<!doctype html><main><select aria-label="Situação" style="position:absolute;left:20px;top:200px;width:200px;height:44px"><option>Todas</option></select><div id="cover" style="position:absolute;left:100px;top:200px;width:100px;height:44px;background:white;z-index:5"></div></main>',
      );
      assert.equal(
        (await fn("collectVisualMetrics")(page, { surface: "V110", width: 390, theme: "light" }))
          .passed,
        false,
      );
      await page.locator("select").evaluate((e) => {
        e.disabled = true;
        e.style.pointerEvents = "none";
      });
      assert.equal(
        (await fn("collectVisualMetrics")(page, { surface: "V110", width: 390, theme: "light" }))
          .passed,
        true,
      );
      await page.locator("select").evaluate((e) => {
        e.disabled = false;
        e.style.pointerEvents = "auto";
      });
      assert.equal(
        (await fn("collectVisualMetrics")(page, { surface: "V110", width: 390, theme: "light" }))
          .passed,
        false,
      );
      await page.locator("#cover").evaluate((e) => e.remove());
      assert.equal(
        (await fn("collectVisualMetrics")(page, { surface: "V110", width: 390, theme: "light" }))
          .passed,
        true,
      );

      // Source-backed V102 layout fragment, compiled with the installed Tailwind.
      // This is an isolated geometry regression, never a claim of real HML UI.
      const v102Native = (record) =>
        console.log("V102_NATIVE_DIAGNOSTIC " + JSON.stringify(record));
      v102Native({
        lastStage: "SOURCE_EXTRACT",
        width: null,
        theme: null,
        targetCount: null,
        notHit: null,
        geometry: null,
      });
      const v102Source = await readFile(
        new URL("../../src/components/contratantes/NovoContratante.tsx", import.meta.url),
        "utf8",
      );
      const v102Focus = v102Source.match(/const foco = "([^"]+)";/)?.[1];
      const v102Dica = v102Source.slice(
        v102Source.indexOf("function Dica("),
        v102Source.indexOf("function Aviso("),
      );
      const v102Button = v102Dica
        .match(/className=\{`([^`]+)`\}/)?.[1]
        ?.replace("${foco}", v102Focus);
      const v102Input = v102Source
        .match(/const campo = `([^`]+)`;/)?.[1]
        ?.replace("${foco}", v102Focus);
      const v102Label = v102Source.match(/const label = "([^"]+)";/)?.[1];
      const v102Rows = [
        ...v102Source.matchAll(
          /<div className="([^"]+)">\s*<div className="([^"]+)">\s*<label htmlFor=\{IDS\.(documento|email)\}/g,
        ),
      ];
      assert.ok(v102Focus && v102Button && v102Input && v102Label);
      assert.deepEqual(
        v102Rows.map((r) => r[3]),
        ["documento", "email"],
      );
      const v102Grid = v102Source.match(/<div className="(grid grid-cols-1[^"]+)"/)[1];
      const v102Main = v102Source.match(/<main className="([^"]+)"/)[1];
      const v102Classes = [
        v102Button,
        v102Input,
        v102Label,
        v102Grid,
        v102Main,
        ...v102Rows.flatMap((r) => [r[1], r[2]]),
      ];
      assert.ok(v102Classes.every((s) => typeof s === "string" && !/["<>${}]/.test(s)));
      const { compile } = await import("@tailwindcss/node");
      v102Native({
        lastStage: "CSS_COMPILE",
        width: null,
        theme: null,
        targetCount: null,
        notHit: null,
        geometry: null,
      });
      const v102Css = await compile(
        await readFile(new URL("../../src/styles.css", import.meta.url), "utf8"),
        { base: new URL("../../src/", import.meta.url).pathname, onDependency: () => {} },
      );
      const v102Compiled = v102Css.build(v102Classes.flatMap((s) => s.split(/\s+/)));
      for (const width of [1440, 1280, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ["light", "dark"]) {
          await page.setContent(
            `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><style>${v102Compiled}</style></head><body><main class="${v102Main}"><div class="${v102Grid}">${v102Rows.map((r) => `<div class="${r[1]}"><div class="${r[2]}"><label class="${v102Label}" for="isolated-${r[3]}">${r[3]}</label><button type="button" class="${v102Button}" aria-label="Ajuda isolada ${r[3]}">i</button></div><input id="isolated-${r[3]}" class="${v102Input}"></div>`).join("")}</div></main></body></html>`,
          );
          let geometry;
          try {
            geometry = await fn("collectVisualMetrics")(page, { surface: "V102", width, theme });
          } catch (error) {
            v102Native({
              lastStage: "MEASURE",
              width,
              theme: theme.toUpperCase(),
              targetCount: null,
              notHit: null,
              geometry: null,
            });
            throw error;
          }
          v102Native({
            lastStage: "MEASURE",
            width,
            theme: theme.toUpperCase(),
            targetCount: geometry.targets.length,
            notHit: geometry.targets.filter((t) => !t.hit).length,
            geometry: geometry.passed === true,
          });
          assert.equal(geometry.targets.length, 4);
          assert.equal(
            geometry.passed,
            true,
            JSON.stringify({
              isolatedV102: true,
              width,
              theme,
              notHit: geometry.targets.filter((t) => !t.hit).length,
            }),
          );
          const helps = await page.getByRole("button").all();
          for (const help of helps) {
            const box = await help.evaluate((e) => ({
              width: e.getBoundingClientRect().width,
              height: e.getBoundingClientRect().height,
            }));
            assert.ok(box.width >= 44 && box.height >= 44);
          }
        }
      }
      await page.setViewportSize({ width: 390, height: 640 });

      // Four source-shaped fields under real Chromium ARIA, without HML/Auth.
      const privacyProof = await fn("loadPrivacy78Proof")();
      const rbacProof = await fn("loadPrivacy78RbacProof")();
      const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
      for (const [surface, html] of Object.entries(privacy78Fixtures())) {
        await page.setContent(html);
        const anchor = await page.evaluate(fn("privacy78FieldAnchor"), {
          surface,
          proof: privacyProof,
        });
        assert.ok(anchor, surface);
        const field = page.locator(anchor.selector).nth(anchor.index);
        const rendered = await field.innerText(),
          snapshot = (await field.ariaSnapshot()).trim();
        const receipt = Object.freeze({
          route: fn("privateCases")().find((i) => i.surface === surface).path,
          observed: Object.freeze(
            surface === "V115"
              ? ["competence_rbac_gate", "upload"]
              : privacyProof.get_contracts.map((c) => c.name),
          ),
          age: 1,
        });
        const input = {
          surface,
          proof: privacyProof,
          rbacProof,
          rendered,
          snapshot,
          fieldSnapshot: snapshot,
          anchored: true,
          receipt,
        };
        const fieldContext = fn("privacy78FieldContext")(input);
        assert.ok(fieldContext, surface);
        assert.equal(
          fn("classifyArtifactText")(rendered, words, { fieldContext }).reason,
          "ALLOWED",
          surface,
        );
        assert.equal(
          fn("classifyArtifactText")(snapshot, words, { snapshot: true, fieldContext }).reason,
          "ALLOWED",
          surface,
        );
        assert.equal(
          fn("privacy78FieldContext")({
            ...input,
            rendered: rendered + privacyProof.generated_exact_values[surface][0],
          }),
          null,
        );
        await field.evaluate((e) => e.setAttribute("aria-label", "pessoa@example.com"));
        assert.equal(
          await page.evaluate(fn("privacy78FieldAnchor"), { surface, proof: privacyProof }),
          null,
        );
        assert.equal(
          fn("classifyArtifactText")(
            rendered + " " + (await field.getAttribute("aria-label")),
            words,
          ).reason,
          "SENSITIVE_PATTERN",
        );
      }

      const v109Proof = await fn("loadPrivacy109Proof")();
      await page.setContent(
        "<style>.flex{display:flex}.flex-wrap{flex-wrap:wrap}.inline-flex{display:inline-flex}.gap-2{gap:.5rem}</style>" +
          privacy109Fixture(v109Proof),
      );
      const v109Anchor = await page.evaluate(fn("privacy109FieldAnchor"), { proof: v109Proof });
      assert.ok(v109Anchor);
      const v109Rendered = await page.locator("body").innerText();
      const v109Snapshot = await page.locator("body").ariaSnapshot();
      const v109FieldSnapshots = await fn("privacy109FieldSnapshots")(page, v109Anchor);
      assert.equal(v109FieldSnapshots.length, 2);
      const v109Input = {
        proof: privacyProof,
        v109Proof,
        rendered: v109Rendered,
        snapshot: v109Snapshot,
        fieldSnapshots: v109FieldSnapshots,
        anchored: true,
        receipt: Object.freeze({
          route: v109Proof.context.route,
          age: 1,
          observed: Object.freeze(["contract_gate", "v109_lists_page0"]),
        }),
      };
      const v109Context = fn("privacy109FieldContext")(v109Input);
      assert.ok(v109Context, "V109 real full ARIA mapping");
      assert.equal(
        fn("classifyArtifactText")(v109Rendered, words, { fieldContext: v109Context }).reason,
        "ALLOWED",
      );
      assert.equal(
        fn("classifyArtifactText")(v109Snapshot, words, {
          snapshot: true,
          fieldContext: v109Context,
        }).reason,
        "ALLOWED",
      );
      for (const value of [
        v109Proof.approved_values.description,
        v109Proof.approved_values.formatted_updated,
      ]) {
        assert.equal(
          fn("privacy109FieldContext")({ ...v109Input, rendered: v109Rendered + value }),
          null,
        );
        assert.equal(
          fn("privacy109FieldContext")({ ...v109Input, snapshot: v109Snapshot + value }),
          null,
        );
      }
      await privacyWireChromium(browser, words);
      await c8NativeSourceProbe(browser, v102Css);
    } finally {
      release?.();
      await browser?.close();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  },
);

test("Run78 troca de src durante decode invalida prontidão", async () => {
  let calls = 0;
  await assert.rejects(
    fn("decodeBrandImage")(
      {
        isConnected: true,
        complete: true,
        naturalWidth: 900,
        naturalHeight: 220,
        getAttribute: () =>
          ++calls === 1
            ? "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"
            : "/changed.svg",
        getBoundingClientRect: () => ({ width: 131, height: 32 }),
        decode: async () => {},
      },
      {
        context: { surface: "V110", width: 1440, theme: "light", mode: "PRIMARY" },
        timeoutMs: 100,
      },
    ),
    (e) => e.code === "VISUAL_BRAND_INVALID",
  );
});

test("Run78 marca respeita contexto SYS04 navy e não libera navy na sidebar", async () => {
  const image = (src) => ({
    isConnected: true,
    complete: true,
    naturalWidth: 900,
    naturalHeight: 220,
    getAttribute: () => src,
    getBoundingClientRect: () => ({ width: 131, height: 32 }),
    decode: async () => {},
  });
  const decode = fn("decodeBrandImage");
  for (const [width, src] of [
    [1440, "/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg"],
    [390, "/brand/ContaOS_Simbolo_Navy.svg"],
  ])
    assert.equal(
      (
        await decode(image(src), {
          context: { surface: "SYS04", width, theme: "dark", mode: "PRIMARY" },
          timeoutMs: 100,
        })
      ).decoded,
      true,
    );
  for (const context of [
    { surface: "V121", width: 390, theme: "dark", mode: "MOBILE_MENU" },
    { surface: "V101", width: 1440, theme: "dark", mode: "SIDEBAR_COLLAPSED" },
    { surface: "SYS04", width: 390, theme: "light", mode: "PRIMARY" },
  ])
    await assert.rejects(
      decode(image("/brand/ContaOS_Simbolo_Navy.svg"), { context, timeoutMs: 100 }),
    );
  await assert.rejects(
    decode(image("/foreign.svg"), {
      context: { surface: "SYS04", width: 390, theme: "dark", mode: "PRIMARY" },
      timeoutMs: 100,
    }),
  );
});
test("Run78 disabled legítimo dispensa só hit-test, mantendo geometria e clipping", () => {
  const target = {
    rect: { x: 20, y: 20, width: 100, height: 44 },
    connected: true,
    visible: true,
    hit: false,
    disabled: true,
  };
  const sample = { viewport: { width: 390, height: 640 }, targets: [target], pairs: [] };
  assert.equal(fn("visualGeometryValid")(sample), true);
  assert.equal(
    fn("visualGeometryValid")({ ...sample, targets: [{ ...target, disabled: false }] }),
    false,
  );
  assert.equal(
    fn("visualGeometryValid")({
      ...sample,
      targets: [{ ...target, rect: { ...target.rect, x: -1 } }],
    }),
    false,
  );
});

// GATE372 recovery: these are fresh tests, not receipts from the lost worktree.
const privacy78ProofPath = new URL(
  "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_TECNICA_READONLY.json",
  import.meta.url,
);
const privacy78Proof = JSON.parse(
  await (await import("node:fs/promises")).readFile(privacy78ProofPath, "utf8"),
);
test("privacy78 fonte real e recibo preservam quatro rejeicoes sem contexto", async () => {
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  for (const [surface, count] of [
    ["V111", 1],
    ["V112", 1],
    ["V115", 2],
    ["V122", 3],
  ])
    assert.deepEqual(
      fn("classifyArtifactText")(privacy78Proof.generated_exact_values[surface][0], words),
      { reason: "UNKNOWN_WORDS", unknownCount: count },
    );
});
test("privacy78 GET exato rejeita filtro select origem metodo duplicata e ausencia", () => {
  const runtime = fn("privacy78Runtime")({ proof: privacy78Proof, wireProof: privacyWireRaw });
  for (const c of privacy78Proof.get_contracts) {
    const url = API + c.path + "?" + new URLSearchParams(c.query);
    assert.equal(runtime.match(url, "GET")?.name, c.name);
    assert.equal(
      runtime.match(
        API + c.path + "?" + new URLSearchParams(Object.entries(c.query).reverse()),
        "GET",
      )?.name,
      c.name,
    );
    for (const bad of [url + "&extra=1", url + "&select=x", url + "#x", url.replace(API, HML)])
      assert.equal(runtime.match(bad, "GET"), null);
    assert.equal(runtime.match(url, "POST"), null);
    for (const key of Object.keys(c.query)) {
      const bad = new URL(url);
      bad.searchParams.delete(key);
      assert.equal(runtime.match(bad.href, "GET"), null);
      bad.searchParams.set(key, "foreign");
      assert.equal(runtime.match(bad.href, "GET"), null);
    }
  }
});
test("privacy78 projecao fecha config pipeline FK shapes e nao le campos proibidos", () => {
  const runtime = fn("privacy78Runtime")({ proof: privacy78Proof, wireProof: privacyWireRaw });
  const upload = privacy78Proof.get_contracts.find((c) => c.name === "upload");
  const row = {
    extensoes_permitidas: privacy78Proof.observed.upload.extensions,
    tamanho_maximo_bytes: 524288000,
  };
  for (const key of ["user", "headers", "mimes_permitidos"])
    Object.defineProperty(row, key, {
      get() {
        throw new Error("unselected field read");
      },
    });
  assert.deepEqual(runtime.project(upload, [row]), { name: "upload", exact: true });
  assert.equal(runtime.project(upload, row), null);
  assert.equal(runtime.project(upload, [{ ...row, tamanho_maximo_bytes: 524288001 }]), null);
  assert.equal(
    runtime.project(upload, [
      {
        ...row,
        extensoes_permitidas: [...privacy78Proof.observed.upload.extensions].reverse(),
      },
    ]),
    null,
  );
  const c = privacy78Proof.context,
    p = privacy78Proof.observed.pipeline[0];
  const process = privacy78Proof.get_contracts.find((r) => r.name === "processing_page0");
  const v = {
    id: c.processing,
    id_versao_documento: c.document_version,
    etapa: p.stage,
    iniciado_em: p.started,
    concluido_em: p.completed,
    criado_em: p.created,
  };
  assert.deepEqual(runtime.project(process, [v]), { name: "processing_page0", exact: true });
  for (const bad of [
    null,
    [],
    {},
    v,
    [v, v],
    [{ ...v, id_versao_documento: c.document }],
    [{ ...v, iniciado_em: p.completed }],
    [{ ...v, etapa: "pages" }],
  ])
    assert.equal(runtime.project(process, bad), null);
  const version = privacy78Proof.get_contracts.find((r) => r.name === "document_versions_page0");
  const vr = {
    id: c.document_version,
    id_documento_contrato: c.document,
    id_arquivo: c.file,
    criado_em: p.created,
  };
  for (const key of ["enviado_por", "motivo_substituicao", "metadados_extraidos"])
    Object.defineProperty(vr, key, {
      get() {
        throw new Error("unselected version field read");
      },
    });
  assert.deepEqual(runtime.project(version, [vr]), {
    name: "document_versions_page0",
    exact: true,
  });
});
test("privacy78 recibo selado intervalo unico contexto e desconhecidos remanescentes", async () => {
  const proof = await fn("loadPrivacy78Proof")();
  const rbacProof = await fn("loadPrivacy78RbacProof")();
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  assert.ok(Object.isFrozen(proof.context));
  for (const surface of ["V111", "V115", "V122"]) {
    const value = proof.generated_exact_values[surface][0];
    const receipt = Object.freeze({
      route: fn("privateCases")().find((r) => r.surface === surface).path,
      observed: Object.freeze(
        surface === "V115"
          ? ["competence_rbac_gate", "upload"]
          : proof.get_contracts.map((c) => c.name),
      ),
      age: 1,
    });
    const input = {
      surface,
      proof,
      rbacProof,
      rendered: value,
      snapshot: value,
      fieldSnapshot: value,
      anchored: true,
      receipt,
    };
    const fieldContext = fn("privacy78FieldContext")(input);
    assert.ok(fieldContext, surface);
    assert.equal(fn("classifyArtifactText")(value, words, { fieldContext }).reason, "ALLOWED");
    assert.equal(
      fn("classifyArtifactText")(value, words, { fieldContext: {} }).reason,
      "UNKNOWN_WORDS",
    );
    for (const bad of [
      { anchored: false },
      { surface: "SYS04" },
      { proof: privacy78Proof },
      { rendered: value + value },
      { receipt: { ...receipt } },
      { receipt: Object.freeze({ ...receipt, observed: Object.freeze([]) }) },
      { receipt: Object.freeze({ ...receipt, age: 120000 }) },
      { receipt: Object.freeze({ ...receipt, route: "/" }) },
    ])
      assert.equal(fn("privacy78FieldContext")({ ...input, ...bad }), null);
    for (const extra of [
      " CANARIO_PRIVADO",
      " pessoa@example.com",
      " Bearer secret",
      " 123.456.789-00",
    ]) {
      const text = value + extra,
        ctx = fn("privacy78FieldContext")({ ...input, rendered: text, snapshot: text });
      assert.notEqual(
        fn("classifyArtifactText")(text, words, { fieldContext: ctx }).reason,
        "ALLOWED",
      );
    }
    const snapshot = value + " EXTRA_PRIVADO_A EXTRA_PRIVADO_B";
    const ctx = fn("privacy78FieldContext")({ ...input, snapshot });
    assert.deepEqual(
      fn("classifyArtifactText")(snapshot, words, { snapshot: true, fieldContext: ctx }),
      { reason: "UNKNOWN_WORDS", unknownCount: 2 },
    );
  }
});
function privacy78Fixtures() {
  const c = privacy78Proof.context;
  return {
    V111: '<section aria-label="Processamento"><h2>Processamento</h2><ul><li><div><span>Etapa: documents</span></div><p>Registrado em 08/11/2026 02:41 · Iniciado em 08/11/2026 08:21 · Concluído em 08/11/2026 08:21</p></li></ul></section>',
    V115: '<section aria-labelledby="v115-envio"><h2 id="v115-envio">Enviar documento</h2><div><label for="v115-arquivo">Arquivo</label><input id="v115-arquivo" type="file"><p>Limite: 500 MB</p></div></section>',
    V122: '<section><h2>1. Selecionar relatórios anteriores</h2><p>Formatos aceitos: PDF, XLSX, CSV, DOCX, PNG, JPG, JPEG, WEBP, TXT, JSON, XML. O limite de tamanho e o tipo real são conferidos pelo backend.</p><label for="historico-arquivos">Arquivos históricos (seleção múltipla)</label><input id="historico-arquivos" type="file" multiple></section>',
  };
}
function privacy78Browser(html = "") {
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(html, {
    url: HML + "/contratos/" + privacy78Proof.context.contract + "/historico/importar",
    runScripts: "outside-only",
  });
  const w = dom.window;
  for (const key of ["Request", "Response", "TextDecoder", "TextEncoder"]) w[key] = globalThis[key];
  w.navigation = new w.EventTarget();
  w.HTMLElement.prototype.getClientRects = function () {
    return this.closest("[hidden]") ? [] : [{}];
  };
  return { dom, w, run: (name, args) => w.eval("(" + fn(name).toString() + ")")(args) };
}
test("privacy78 DOM source-shaped associa campo e rejeita label copia atributos e cards", () => {
  for (const [surface, html] of Object.entries(privacy78Fixtures())) {
    const { dom, w, run } = privacy78Browser(html);
    try {
      const args = { surface, proof: privacy78Proof };
      const anchor = run("privacy78FieldAnchor", args);
      assert.ok(anchor, surface);
      const heading = w.document.querySelector("h2,caption"),
        old = heading.textContent;
      heading.textContent = "Outro";
      assert.equal(run("privacy78FieldAnchor", args), null);
      heading.textContent = old;
      const node = w.document.querySelectorAll(anchor.selector)[anchor.index];
      node.setAttribute("aria-label", "CANARIO_PRIVADO");
      assert.equal(run("privacy78FieldAnchor", args), null);
      node.removeAttribute("aria-label");
      if (surface === "V122") {
        const label = w.document.querySelector("label");
        label.textContent = "Arquivo";
        assert.equal(run("privacy78FieldAnchor", args), null);
        label.textContent = "Arquivos históricos (seleção múltipla)";
      }
      w.document.body.innerHTML += html;
      assert.equal(run("privacy78FieldAnchor", args), null);
      if (surface === "V112") {
        w.document.body.innerHTML = "<div><h3>11/2026</h3><p>01/11/2026 a 30/11/2026</p></div>";
        assert.equal(run("privacy78FieldAnchor", args), null);
      }
    } finally {
      dom.window.close();
    }
  }
});
test("privacy78 observer preserva fetch args promise response rejeicao e ignora Auth", async () => {
  const { dom, w, run } = privacy78Browser();
  try {
    const c = privacy78Proof.get_contracts.find((r) => r.name === "upload");
    const url = API + c.path + "?" + new URLSearchParams(c.query);
    const response = new Response(
      JSON.stringify([
        {
          extensoes_permitidas: privacy78Proof.observed.upload.extensions,
          tamanho_maximo_bytes: 524288000,
          user: "CANARIO pessoa@example.com",
        },
      ]),
    );
    Object.defineProperty(response, "url", { value: url });
    Object.defineProperty(response, "headers", {
      get() {
        throw new Error("headers read");
      },
    });
    let next = Promise.resolve(response);
    const original = next,
      calls = [];
    w.fetch = function (...args) {
      calls.push({ receiver: this, args });
      return next;
    };
    run("privacy78Runtime", { proof: privacy78Proof, wireProof: privacyWireRaw, install: true });
    const init = { method: "GET" };
    Object.defineProperty(init, "headers", {
      get() {
        throw new Error("Auth read");
      },
    });
    assert.equal(w.fetch.call(w, url, init), original);
    assert.equal(calls[0].receiver, w);
    assert.equal(calls[0].args[1], init);
    assert.equal(await original, response);
    assert.equal(w.__contaosPrivacy78.read(), null);
    await new Promise((r) => setTimeout(r, 50));
    assert.deepEqual([...w.__contaosPrivacy78.read().observed], ["upload"]);
    assert.equal(JSON.stringify(w.__contaosPrivacy78.read()).includes("CANARIO"), false);
    const auth = {
      get status() {
        throw new Error("Auth status read");
      },
      clone() {
        throw new Error("Auth clone");
      },
    };
    next = Promise.resolve(auth);
    assert.equal(w.fetch(API + "/auth/v1/user"), next);
    await next;
    await new Promise((r) => setTimeout(r, 0));
    assert.deepEqual([...w.__contaosPrivacy78.read().observed], ["upload"]);
    assert.equal(w.fetch(url + "&extra=1"), next);
    assert.equal(w.__contaosPrivacy78.read(), null);
    const rejected = Object.freeze({ code: "closed" });
    next = Promise.reject(rejected);
    assert.equal(w.fetch(url), next);
    await assert.rejects(next, (e) => e === rejected);
  } finally {
    dom.window.close();
  }
});
for (const event of [
  "pagehide",
  "popstate",
  "contaos:organizacao-alterada",
  "visibilitychange",
  "navigate",
]) {
  test("privacy78 geracao nao herda apos " + event, () => {
    const { dom, w, run } = privacy78Browser();
    try {
      w.fetch = () => Promise.resolve(new Response("{}"));
      run("privacy78Runtime", { proof: privacy78Proof, wireProof: privacyWireRaw, install: true });
      assert.ok(w.__contaosPrivacy78.read());
      (event === "visibilitychange"
        ? w.document
        : event === "navigate"
          ? w.navigation
          : w
      ).dispatchEvent(new w.Event(event));
      assert.equal(w.__contaosPrivacy78.read(), null);
      w.history.replaceState(null, "", w.location.href);
      assert.equal(w.__contaosPrivacy78.read(), null);
    } finally {
      dom.window.close();
    }
  });
}
test("privacy78 header sessao e deadline invalidam sem Auth", async () => {
  const { dom, w, run } = privacy78Browser(
    '<header aria-label="Organização atual">ContaOS HML Teste Situação: ativa</header>',
  );
  try {
    w.fetch = () => Promise.resolve(new Response("{}"));
    run("privacy78Runtime", { proof: privacy78Proof, wireProof: privacyWireRaw, install: true });
    assert.ok(w.__contaosPrivacy78.read());
    w.document.querySelector("header").textContent = "Confirmando organização…";
    assert.equal(w.__contaosPrivacy78.read(), null);
    w.document.querySelector("header").textContent = "ContaOS HML Teste Situação: ativa";
    assert.equal(w.__contaosPrivacy78.read(), null);
  } finally {
    dom.window.close();
  }
  const b = privacy78Browser();
  try {
    const deadlines = [];
    b.w.setTimeout = (cb) => {
      deadlines.push(cb);
      return deadlines.length;
    };
    b.w.clearTimeout = () => {};
    let finish;
    const native = new Promise((r) => {
      finish = r;
    });
    b.w.fetch = () => native;
    b.run("privacy78Runtime", { proof: privacy78Proof, wireProof: privacyWireRaw, install: true });
    const c = privacy78Proof.get_contracts.find((r) => r.name === "upload");
    assert.equal(b.w.fetch(API + c.path + "?" + new URLSearchParams(c.query)), native);
    deadlines[0]();
    assert.equal(b.w.__contaosPrivacy78.read(), null);
    finish({
      get status() {
        throw new Error("expired response read");
      },
    });
    await native;
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(b.w.__contaosPrivacy78.read(), null);
  } finally {
    b.dom.window.close();
  }
});
test("privacy78 quatro hashes fonte correspondem ao recibo", async () => {
  const { readFile } = await import("node:fs/promises"),
    { createHash } = await import("node:crypto");
  for (const path of [
    "src/components/contratos/DocumentoDetalhe.tsx",
    "src/components/contratos/CompetenciasContrato.tsx",
    "src/components/competencias/CompetenciaDocumentos.tsx",
    "src/components/contratos/ImportarHistorico.tsx",
  ])
    assert.equal(
      createHash("sha256")
        .update(await readFile(new URL("../../" + path, import.meta.url)))
        .digest("hex"),
      privacy78Proof.source_sha256[path].sha256,
    );
});

test("privacy78 queued mutation destruction is failclosed without background errors", async () => {
  const { JSDOM, VirtualConsole } = require("jsdom"),
    errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => errors.push("BACKGROUND_ERROR"));
  const dom = new JSDOM("<main></main>", {
    url: HML + "/contratos/" + privacy78Proof.context.contract + "/historico/importar",
    runScripts: "outside-only",
    virtualConsole,
  });
  const w = dom.window;
  for (const k of ["Request", "Response", "TextDecoder"]) w[k] = globalThis[k];
  w.navigation = new w.EventTarget();
  w.fetch = () => Promise.resolve(new Response("{}"));
  w.eval("(" + fn("privacy78Runtime").toString() + ")")({ proof: privacy78Proof, install: true });
  w.document.body.append(w.document.createElement("p"));
  dom.window.close();
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(errors, []);
});

test("privacy78 GET7 RED real DTO sem id org e query estrita", async () => {
  const { readFile } = await import("node:fs/promises");
  const raw = JSON.parse(
    await readFile(
      new URL(
        "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_RBAC_V115_READONLY.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const r = fn("privacy78Runtime")({
    proof: privacy78Proof,
    rbacProof: raw,
    wireProof: privacyWireRaw,
  });
  const c = raw.get_contract,
    url = API + c.path + "?" + new URLSearchParams(c.query);
  assert.equal(r.match(url, "GET")?.name, "competence_rbac_gate");
  assert.deepEqual(r.project(c, [{ id_contrato: raw.context.contract }]), {
    name: "competence_rbac_gate",
    exact: true,
  });
  for (const key of Object.keys(c.query)) {
    const bad = new URL(url);
    bad.searchParams.delete(key);
    assert.equal(r.match(bad.href, "GET"), null);
    bad.searchParams.set(key, "foreign");
    assert.equal(r.match(bad.href, "GET"), null);
  }
  for (const bad of [
    url + "&id=x",
    url + "&extra=1",
    url + "&select=id,id_contrato",
    url + "#x",
    url.replace(API, HML),
  ])
    assert.equal(r.match(bad, "GET"), null);
  for (const body of [
    null,
    [],
    [{ id_contrato: raw.context.contract }, { id_contrato: raw.context.contract }],
    { id_contrato: null },
    { id_contrato: "foreign" },
    {},
  ])
    assert.equal(r.project(c, body), null);
  const row = { id_contrato: raw.context.contract };
  for (const key of ["id", "id_organizacao", "user", "headers", "metadata"])
    Object.defineProperty(row, key, {
      get() {
        throw new Error("unprojected GET7 field read");
      },
    });
  assert.deepEqual(r.project(c, [row]), { name: "competence_rbac_gate", exact: true });
});
test("privacy78 GET7 exige recibo separado selado mais upload atual para V115", async () => {
  const proof = await fn("loadPrivacy78Proof")(),
    rbacProof = await fn("loadPrivacy78RbacProof")();
  const value = proof.generated_exact_values.V115[0],
    route = fn("privateCases")().find((r) => r.surface === "V115").path;
  const input = {
    surface: "V115",
    proof,
    rbacProof,
    rendered: value,
    snapshot: value,
    fieldSnapshot: value,
    anchored: true,
    receipt: Object.freeze({
      route,
      age: 1,
      observed: Object.freeze(["competence_rbac_gate", "upload"]),
    }),
  };
  assert.ok(fn("privacy78FieldContext")(input));
  for (const delta of [
    { rbacProof: null },
    { rbacProof: { ...rbacProof } },
    { surface: "V122" },
    { rendered: value + value },
    {
      receipt: Object.freeze({
        ...input.receipt,
        observed: Object.freeze(["competence_rbac_gate"]),
      }),
    },
    { receipt: Object.freeze({ ...input.receipt, observed: Object.freeze(["upload"]) }) },
    { receipt: Object.freeze({ ...input.receipt, route: "/" }) },
    { receipt: Object.freeze({ ...input.receipt, age: 120000 }) },
  ])
    assert.equal(fn("privacy78FieldContext")({ ...input, ...delta }), null);
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  for (const suffix of [" pessoa@example.com", " CANARIO_PRIVADO"]) {
    const text = value + suffix,
      ctx = fn("privacy78FieldContext")({ ...input, rendered: text, snapshot: text });
    assert.notEqual(
      fn("classifyArtifactText")(text, words, { fieldContext: ctx }).reason,
      "ALLOWED",
    );
  }
  const { readFile } = await import("node:fs/promises"),
    { createHash } = await import("node:crypto");
  assert.equal(
    createHash("sha256")
      .update(await readFile(new URL("../../" + rbacProof.source.path, import.meta.url)))
      .digest("hex"),
    rbacProof.source.sha256,
  );
});
test("privacy78 GET7 browser scope exige rota V115 e nao herda apos navegacao", async () => {
  const { readFile } = await import("node:fs/promises");
  const rbacProof = JSON.parse(
    await readFile(
      new URL(
        "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_RBAC_V115_READONLY.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const surface of ["V115", "V122"]) {
    const { dom, w, run } = privacy78Browser();
    try {
      dom.reconfigure({ url: HML + fn("privateCases")().find((r) => r.surface === surface).path });
      const contract = rbacProof.get_contract,
        url = API + contract.path + "?" + new URLSearchParams(contract.query);
      const response = new Response(
        JSON.stringify([{ id_contrato: rbacProof.context.contract, user: "CANARIO_PRIVADO" }]),
      );
      Object.defineProperty(response, "url", { value: url });
      w.fetch = () => Promise.resolve(response);
      run("privacy78Runtime", {
        proof: privacy78Proof,
        rbacProof,
        wireProof: privacyWireRaw,
        install: true,
      });
      await w.fetch(url);
      await new Promise((r) => setTimeout(r, 50));
      if (surface === "V115") {
        assert.deepEqual([...w.__contaosPrivacy78.read().observed], ["competence_rbac_gate"]);
        assert.equal(JSON.stringify(w.__contaosPrivacy78.read()).includes("CANARIO"), false);
        w.navigation.dispatchEvent(new w.Event("navigate"));
        assert.equal(w.__contaosPrivacy78.read(), null);
      } else assert.equal(w.__contaosPrivacy78.read(), null);
    } finally {
      w.__contaosPrivacy78?.invalidate();
      dom.window.close();
    }
  }
});

// GATE389: two separate V109 intervals, not global vocabulary.
const privacy109Raw = JSON.parse(
  await (
    await import("node:fs/promises")
  ).readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-remaining-v109-20261108.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
function privacy109Fixture(p = privacy109Raw) {
  const v = p.approved_values,
    id = "v109-lista-" + p.context.list;
  return (
    '<main><h1>Regras</h1><section aria-labelledby="v109-listas" class="space-y-3"><h2 id="v109-listas">Listas de verificação</h2><ul class="space-y-3"><li class="rounded-lg"><div class="flex"><div class="min-w-0"><p class="break-words font-medium">' +
    v.name +
    '</p><p class="break-words text-sm text-muted-foreground">' +
    v.description +
    '</p><p class="mt-1 flex flex-wrap gap-2 text-xs"><span class="inline-flex">Rascunho</span><span class="inline-flex">Versão atual: 1</span><span class="text-muted-foreground">' +
    v.formatted_updated +
    '</span></p></div><button type="button" aria-expanded="false" aria-controls="' +
    id +
    '" aria-label="Ver versões e itens de ' +
    v.name +
    '">Ver versões e itens</button></div></li></ul></section></main>'
  );
}
function privacy109Texts(p = privacy109Raw) {
  const v = p.approved_values,
    description = "- paragraph: " + v.description,
    metadata =
      '- paragraph:\n  - text: Rascunho\n  - text: "Versão atual: 1"\n  - text: ' +
      v.formatted_updated;
  return {
    rendered:
      "Regras\nListas de verificação\n" +
      v.name +
      "\n" +
      v.description +
      "\nRascunho\nVersão atual: 1\n" +
      v.formatted_updated +
      "\nVer versões e itens",
    snapshot:
      '- main:\n  - heading "Regras" [level=1]\n  - region "Listas de verificação":\n    - heading "Listas de verificação" [level=2]\n    - list:\n      - listitem:\n        - paragraph: ' +
      v.name +
      "\n        " +
      description +
      "\n        " +
      metadata.replaceAll("\n", "\n        ") +
      '\n        - button "Ver versões e itens de ' +
      v.name +
      '"\n',
    fieldSnapshots: [description, metadata],
  };
}
test("privacy109 RED classifier real rejeita os dois intervalos sem contexto", async () => {
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  assert.equal(Array.from(privacy109Raw.approved_values.description).length, 79);
  for (const text of [
    privacy109Raw.approved_values.description,
    privacy109Raw.approved_values.formatted_updated,
  ])
    assert.equal(fn("classifyArtifactText")(text, words).reason, "UNKNOWN_WORDS");
  const t = privacy109Texts();
  assert.equal(fn("classifyArtifactText")(t.rendered, words).reason, "UNKNOWN_WORDS");
  assert.equal(
    fn("classifyArtifactText")(t.snapshot, words, { snapshot: true }).reason,
    "UNKNOWN_WORDS",
  );
});
test("privacy109 GET exato projeta so alvo, preserva microssegundos e ignora getters", () => {
  const run = fn("privacy78Runtime")({ proof: privacy78Proof, v109Proof: privacy109Raw });
  const c = { ...privacy109Raw.get_contract, name: "v109_lists_page0" },
    url = API + c.path + "?" + new URLSearchParams(c.query);
  assert.equal(run.match(url, "GET")?.name, c.name);
  const v = privacy109Raw.approved_values,
    row = {
      id: privacy109Raw.context.list,
      nome: v.name,
      descricao: v.description,
      atualizado_em: v.updated,
    };
  for (const key of [
    "situacao",
    "versao_atual",
    "versao_registro",
    "user",
    "headers",
    "id_contrato",
    "id_organizacao",
  ])
    Object.defineProperty(row, key, {
      get() {
        throw new Error("unapproved V109 field read");
      },
    });
  assert.deepEqual(run.project(c, [row]), { name: c.name, exact: true });
  for (const date of ["2026-11-08T04:50:40.455572Z", "2026-11-08T01:50:40.455572-03:00"])
    assert.deepEqual(run.project(c, [{ ...row, atualizado_em: date }]), {
      name: c.name,
      exact: true,
    });
  for (const date of [
    "2026-11-08T04:50:40.455573+00:00",
    "2026-11-08T04:50:40.455000Z",
    "2026-11-08T04:50:40.4555721Z",
    "2026-02-30T04:50:40.455572Z",
  ])
    assert.equal(run.project(c, [{ ...row, atualizado_em: date }]), null);
  for (const body of [
    [],
    [row, row],
    row,
    null,
    [{ ...row, id: "foreign" }],
    [{ ...row, nome: "foreign" }],
    [{ ...row, descricao: v.description + " extra" }],
  ])
    assert.equal(run.project(c, body), null);
  for (const key of Object.keys(c.query)) {
    const bad = new URL(url);
    bad.searchParams.delete(key);
    assert.equal(run.match(bad.href, "GET"), null);
    bad.searchParams.set(key, "foreign");
    assert.equal(run.match(bad.href, "GET"), null);
  }
  for (const bad of [url + "&offset=0", url + "&extra=1", url + "#x", url.replace(API, HML)])
    assert.equal(run.match(bad, "GET"), null);
});
test("privacy109 selo e dois intervalos preservam full DOM ARIA e vizinhos", async () => {
  const proof = await fn("loadPrivacy78Proof")(),
    v109Proof = await fn("loadPrivacy109Proof")(),
    texts = privacy109Texts(v109Proof);
  const input = {
    proof,
    v109Proof,
    ...texts,
    anchored: true,
    receipt: Object.freeze({
      route: v109Proof.context.route,
      observed: Object.freeze(["contract_gate", "v109_lists_page0"]),
      age: 1,
    }),
  };
  const context = fn("privacy109FieldContext")(input);
  assert.ok(context);
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  assert.equal(
    fn("classifyArtifactText")(texts.rendered, words, { fieldContext: context }).reason,
    "ALLOWED",
  );
  assert.equal(
    fn("classifyArtifactText")(texts.snapshot, words, { snapshot: true, fieldContext: context })
      .reason,
    "ALLOWED",
  );
  for (const delta of [
    { anchored: false },
    { v109Proof: privacy109Raw },
    { fieldSnapshots: [texts.fieldSnapshots[1], texts.fieldSnapshots[0]] },
    { rendered: texts.rendered + v109Proof.approved_values.description },
    { snapshot: texts.snapshot + v109Proof.approved_values.formatted_updated },
    { receipt: Object.freeze({ ...input.receipt, route: "/" }) },
    { receipt: Object.freeze({ ...input.receipt, age: 120000 }) },
    { receipt: Object.freeze({ ...input.receipt, observed: Object.freeze(["v109_lists_page0"]) }) },
  ])
    assert.equal(fn("privacy109FieldContext")({ ...input, ...delta }), null);
  for (const suffix of [
    " CANARIO_PRIVADO",
    " pessoa@example.com",
    " Bearer x",
    " 123.456.789-00",
  ]) {
    const rendered = texts.rendered + suffix,
      snapshot = texts.snapshot + suffix,
      fieldContext = fn("privacy109FieldContext")({ ...input, rendered, snapshot });
    assert.notEqual(
      fn("classifyArtifactText")(rendered, words, { fieldContext }).reason,
      "ALLOWED",
    );
    assert.notEqual(
      fn("classifyArtifactText")(snapshot, words, { snapshot: true, fieldContext }).reason,
      "ALLOWED",
    );
  }
});
test("privacy109 DOM source button aria-controls fecha regiao label copia e no", () => {
  const { dom, w, run } = privacy78Browser(privacy109Fixture());
  try {
    const args = { proof: privacy109Raw };
    assert.ok(run("privacy109FieldAnchor", args));
    const control = w.document.querySelector("button");
    control.setAttribute("aria-controls", "v109-lista-foreign");
    assert.equal(run("privacy109FieldAnchor", args), null);
    control.setAttribute("aria-controls", "v109-lista-" + privacy109Raw.context.list);
    const p = w.document.querySelectorAll(".min-w-0 > p")[1];
    p.setAttribute("aria-label", "CANARIO_PRIVADO");
    assert.equal(run("privacy109FieldAnchor", args), null);
    p.removeAttribute("aria-label");
    p.textContent += " extra";
    assert.equal(run("privacy109FieldAnchor", args), null);
    p.textContent = privacy109Raw.approved_values.description;
    w.document.querySelector("h2").textContent = "Outro";
    assert.equal(run("privacy109FieldAnchor", args), null);
    w.document.body.innerHTML = privacy109Fixture() + privacy109Fixture();
    assert.equal(run("privacy109FieldAnchor", args), null);
  } finally {
    dom.window.close();
  }
});
test("privacy109 fontes e formatter permanecem byte exact", async () => {
  const { readFile } = await import("node:fs/promises"),
    { createHash } = await import("node:crypto");
  for (const source of privacy109Raw.sources) {
    const bytes = await readFile(new URL("../../" + source.path, import.meta.url));
    assert.equal(
      createHash("sha1")
        .update("blob " + bytes.length + "\0")
        .update(bytes)
        .digest("hex"),
      source.blob,
    );
  }
  const f = privacy109Raw.formatter,
    actual = new Intl.DateTimeFormat(f.locale, { timeZone: f.timeZone, ...f.options })
      .format(new Date(privacy109Raw.approved_values.updated))
      .replace(",", "");
  assert.equal("Atualizada em " + actual, privacy109Raw.approved_values.formatted_updated);
});

test("privacy109 observer so V109 e falha contexto atual sem heranca", async () => {
  for (const surface of ["V109", "V122"]) {
    const { dom, w, run } = privacy78Browser();
    try {
      dom.reconfigure({ url: HML + fn("privateCases")().find((i) => i.surface === surface).path });
      const v = privacy109Raw.approved_values,
        c = privacy109Raw.get_contract,
        url = API + c.path + "?" + new URLSearchParams(c.query);
      const body = [
        {
          id: privacy109Raw.context.list,
          nome: v.name,
          descricao: v.description,
          atualizado_em: v.updated,
          enviado_por: "CANARIO_PRIVADO",
        },
      ];
      const response = new Response(JSON.stringify(body));
      Object.defineProperty(response, "url", { value: url });
      w.fetch = () => Promise.resolve(response);
      run("privacy78Runtime", { proof: privacy78Proof, v109Proof: privacy109Raw, install: true });
      await w.fetch(url);
      await new Promise((r) => setTimeout(r, 50));
      if (surface === "V109") {
        assert.deepEqual([...w.__contaosPrivacy78.read().observed], ["v109_lists_page0"]);
        assert.equal(JSON.stringify(w.__contaosPrivacy78.read()).includes("CANARIO"), false);
        w.navigation.dispatchEvent(new w.Event("navigate"));
        assert.equal(w.__contaosPrivacy78.read(), null);
      } else assert.ok(!w.__contaosPrivacy78.read()?.observed.includes("v109_lists_page0"));
    } finally {
      w.__contaosPrivacy78?.invalidate();
      dom.window.close();
    }
  }
});

test("solicitacao unica: esquema fechado, duplicatas e operacao", () => {
  const parse = fn("parseSingleRequest");
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "b".repeat(40),
    deployment_id: "dpl_12345678",
  };
  assert.deepEqual(parse(JSON.stringify(row), "fixtures"), row);
  for (const change of [
    { extra: 1 },
    { schema_version: "1" },
    { issue: 1 },
    { operation: "audit" },
    { request_id: "unknown" },
    { frontend_sha: "x" },
  ])
    assert.throws(() => parse(JSON.stringify({ ...row, ...change }), "fixtures"));
  assert.throws(() =>
    parse(JSON.stringify(row).replace('"issue":317', '"issue":317,"issue":317'), "fixtures"),
  );
  assert.throws(() =>
    parse(JSON.stringify(row).replace('"issue":317', '"issue":317,"\\u0069ssue":317'), "fixtures"),
  );
  assert.throws(() => parse(" ".repeat(4097), "fixtures"));
});
test("solicitacao unica: origem upstream e identidade corrente exatas", () => {
  const validate = fn("validateSingleRequestEvent");
  const sha = "a".repeat(40),
    repo = { full_name: "contaos999999/contaos-hml-control" };
  const upstream = {
    id: 91,
    workflow_id: 406076025,
    path: ".github/workflows/contaos-frontend-zero-drift.yml",
    name: "ContaOS Frontend Zero-Drift",
    event: "push",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: repo,
    head_repository: repo,
  };
  const current = {
    id: 92,
    workflow_id: 411426169,
    path: ".github/workflows/contaos-trilha-a-fixtures.yml",
    name: "ContaOS Trilha A Fixtures",
    event: "workflow_run",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    repository: repo,
    head_repository: repo,
  };
  const env = {
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_REF: "refs/heads/main",
    GITHUB_REPOSITORY: repo.full_name,
    GITHUB_RUN_ID: "92",
    GITHUB_RUN_ATTEMPT: "1",
    CONTAOS_HARNESS_SHA: sha,
  };
  const event = { action: "completed", repository: repo, workflow_run: upstream };
  assert.equal(
    validate({ event, env, upstream, current, operation: "fixtures", mainSha: sha }),
    sha,
  );
  for (const change of [
    { event: "pull_request" },
    { workflow_id: 4 },
    { path: "bad" },
    { name: "bad" },
    { run_attempt: 2 },
    { conclusion: "failure" },
    { head_branch: "fork" },
    { head_sha: "b".repeat(40) },
    { repository: { full_name: "fork/repo" } },
  ])
    assert.throws(() =>
      validate({
        event,
        env,
        upstream: { ...upstream, ...change },
        current,
        operation: "fixtures",
        mainSha: sha,
      }),
    );
  assert.throws(() =>
    validate({
      event,
      env: { ...env, GITHUB_RUN_ATTEMPT: "2" },
      upstream,
      current,
      operation: "fixtures",
      mainSha: sha,
    }),
  );
  assert.throws(() =>
    validate({
      event,
      env,
      upstream,
      current: { ...current, id: 93 },
      operation: "fixtures",
      mainSha: sha,
    }),
  );
});
test("solicitacao unica: paginacao completa e limites fail closed", async () => {
  const list = fn("listSingleRequestRuns");
  let calls = 0;
  const rows = Array.from({ length: 101 }, (_, i) => ({ id: i + 1 }));
  assert.equal(
    (
      await list(async (page) => {
        calls++;
        return { total_count: 101, workflow_runs: rows.slice((page - 1) * 100, page * 100) };
      })
    ).length,
    101,
  );
  assert.equal(calls, 2);
  for (const body of [
    { total_count: 1001, workflow_runs: [] },
    { total_count: 101, workflow_runs: [] },
    { total_count: 1, workflow_runs: [{ id: 1 }, { id: 1 }] },
  ])
    await assert.rejects(() => list(async () => body));
  await assert.rejects(() =>
    list(async () => {
      throw new Error("offline");
    }),
  );
});
test("solicitacao unica: duplicatas em qualquer resultado e replay em outro SHA", () => {
  const validate = fn("validateSingleRequestRuns"),
    sha = "a".repeat(40),
    old = "b".repeat(40);
  const run = {
    id: 92,
    event: "workflow_run",
    head_sha: sha,
    run_attempt: 1,
    workflow_id: 411426169,
  };
  assert.equal(
    validate({ current: run, runs: [run], requestShas: [sha], workflowId: 411426169 }),
    true,
  );
  for (const status of ["queued", "in_progress", "completed"])
    assert.throws(() =>
      validate({
        current: run,
        runs: [run, { ...run, id: 93, status }],
        requestShas: [sha],
        workflowId: 411426169,
      }),
    );
  assert.throws(() =>
    validate({
      current: run,
      runs: [run, { ...run, id: 93, head_sha: old, conclusion: "cancelled" }],
      requestShas: [sha, old],
      workflowId: 411426169,
    }),
  );
  assert.throws(() =>
    validate({
      current: { ...run, run_attempt: 2 },
      runs: [run],
      requestShas: [sha],
      workflowId: 411426169,
    }),
  );
});

test("solicitacao unica: auditoria bloqueada ate binding real", () => {
  assert.throws(() => fn("requireSingleRequestOperation")("audit"), {
    code: "AUDIT_BINDING_PENDING",
  });
  assert.doesNotThrow(() => fn("requireSingleRequestOperation")("fixtures"));
});
test("solicitacao unica: GET publico nunca envia Authorization", async () => {
  let options;
  const get = fn("singleRequestGet")({
    publicOnly: true,
    token: "DO_NOT_SEND",
    fetchImpl: async (url, o) => {
      options = o;
      return { status: 200, text: async () => JSON.stringify({ ok: true }) };
    },
  });
  assert.deepEqual(await get(""), { ok: true });
  assert.equal(Object.hasOwn(options.headers, "Authorization"), false);
  assert.equal(options.redirect, "error");
  await assert.rejects(() => get("/unexpected"), { code: "REQUEST_API_PATH" });
  const fail = fn("singleRequestGet")({
    publicOnly: true,
    fetchImpl: async () => ({ status: 403 }),
  });
  await assert.rejects(() => fail(""), { code: "REQUEST_API_UNAVAILABLE" });
});
test("solicitacao unica: Git verifica pais, diff exclusivo, modo e bytes", async () => {
  const verify = fn("verifySingleRequestGit"),
    sha = "a".repeat(40),
    parent = "b".repeat(40);
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: parent,
    frontend_sha: "c".repeat(40),
    deployment_id: "dpl_12345678",
  };
  const raw = JSON.stringify(request),
    path = fn("parseSingleRequest") && sut.SINGLE_REQUEST.path;
  const git = async (args) => {
    if (args[0] === "show" && args[1].startsWith("bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215:"))
      return (await r8R7Fixture()).git(args);
    if (args[0] === "show" && args[1].startsWith(R5_R4_HEAD + ":"))
      return (await r5R4Fixture()).git(args);
    if (args[0] === "show") return raw;
    if (args[0] === "rev-parse") return sha + "\n";
    if (args[0] === "rev-list") return [sha, parent, "d".repeat(40)].join(" ") + "\n";
    if (args[0] === "merge-base") return "";
    if (args[0] === "diff-tree") return "A\t" + path + "\n";
    if (args[0] === "ls-tree") return "100644 blob " + "e".repeat(40) + "\t" + path + "\n";
    if (args[0] === "log") return sha + "\n";
    throw new Error("unexpected git");
  };
  assert.deepEqual(await verify(request, sha, git, raw), [sha]);
  const cases = [
    ["rev-parse", "f".repeat(40)],
    ["rev-list", [sha, "f".repeat(40), "d".repeat(40)].join(" ")],
    ["rev-list", [sha, parent].join(" ")],
    ["diff-tree", "M\tsrc/evil.ts\nA\t" + path],
    ["diff-tree", "R100\tx\t" + path],
    ["ls-tree", "120000 blob " + "e".repeat(40) + "\t" + path],
    ["log", Array(1001).fill(sha).join("\n")],
  ];
  for (const [command, value] of cases)
    await assert.rejects(() =>
      verify(request, sha, async (args) => (args[0] === command ? value : git(args)), raw),
    );
  await assert.rejects(() => verify(request, sha, git, raw + " "), { code: "REQUEST_DIRTY" });
});
test("solicitacao unica: AUTO_DISCOVER preserva recibo vazio e prova completa", async () => {
  const verify = fn("verifySingleRequest"),
    sha = "a".repeat(40),
    parent = "b".repeat(40);
  const repo = { full_name: "contaos999999/contaos-hml-control" };
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: parent,
    frontend_sha: "",
    deployment_id: "",
  };
  const raw = JSON.stringify(request),
    spec = sut.SINGLE_REQUEST;
  const upstream = {
    id: 91,
    workflow_id: 406076025,
    path: spec.upstreamPath,
    name: spec.upstreamName,
    event: "push",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: repo,
    head_repository: repo,
  };
  const current = {
    id: 92,
    workflow_id: spec.fixtures.id,
    path: spec.fixtures.path,
    name: spec.fixtures.name,
    event: "workflow_run",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    repository: repo,
    head_repository: repo,
  };
  const pull = {
    id: 300,
    number: 90,
    merged: true,
    state: "closed",
    merged_at: "2026-11-08T00:00:00Z",
    merge_commit_sha: sha,
    changed_files: 1,
    base: { ref: "main", sha: parent, repo },
    head: { sha: "d".repeat(40), ref: "request/fixtures", repo },
  };
  const review = {
    id: 301,
    state: "COMMENTED",
    user: { login: "contaos9999" },
    commit_id: pull.head.sha,
    submitted_at: "2026-11-08T00:00:00Z",
    body: JSON.stringify({
      schema: "contaos.single-request.review.v1",
      request_id: request.request_id,
      head_sha: pull.head.sha,
      critical: 0,
      important: 0,
      decision: "APROVAVEL",
    }),
  };
  const requiredCi = [
    { id: 501, workflow_id: 406076025, name: spec.upstreamName, path: spec.upstreamPath },
    {
      id: 502,
      workflow_id: 410005553,
      name: "ContaOS LOCK-TYPES-01 Double Barrier",
      path: ".github/workflows/lock-types-double-barrier.yml",
    },
  ].map((r) => ({
    ...r,
    head_sha: pull.head.sha,
    event: "pull_request",
    head_branch: pull.head.ref,
    repository: repo,
    head_repository: repo,
    status: "completed",
    conclusion: "success",
  }));
  const env = {
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_REF: "refs/heads/main",
    GITHUB_REPOSITORY: repo.full_name,
    GITHUB_RUN_ID: "92",
    GITHUB_RUN_ATTEMPT: "1",
    CONTAOS_HARNESS_SHA: sha,
    GITHUB_EVENT_PATH: "event.json",
  };
  const event = { action: "completed", repository: repo, workflow_run: upstream };
  const read = async (path) => (path === "event.json" ? JSON.stringify(event) : raw);
  const stat = async () => ({ isFile: () => true, isSymbolicLink: () => false, size: raw.length });
  const git = async (args) => {
    if (args[0] === "show" && args[1].startsWith("6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36:"))
      return r14Fixture.git(args);
    if (args[0] === "show" && args[1].startsWith("3d6bea3e938459f348130bf1d04431a072dba081:"))
      return r12Fixture.git(args);
    assert.equal(args.includes(""), false, "Git nunca recebe SHA vazio");
    if (args[0] === "show" && args[1].startsWith("bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215:"))
      return (await r8R7Fixture()).git(args);
    if (args[0] === "show" && args[1].startsWith(R5_R4_HEAD + ":"))
      return (await r5R4Fixture()).git(args);
    if (args[0] === "show") return raw;
    if (args[0] === "rev-parse") return sha;
    if (args[0] === "rev-list") return [sha, parent, "d".repeat(40)].join(" ");
    if (args[0] === "merge-base") return "";
    if (args[0] === "diff-tree") return "A\t" + spec.path;
    if (args[0] === "ls-tree") return "100644 blob " + "e".repeat(40) + "\t" + spec.path;
    if (args[0] === "log") return sha;
    throw new Error("unexpected git");
  };
  const r12Fixture = await r13R12Fixture();
  const r14Fixture = await r15R14Fixture();
  const r4Fixture = await r5R4Fixture();
  const r7Fixture = await r8R7Fixture();
  const get = async (path) => {
    if (/42694401246|42694609672|42694609740/.test(path)) return r14Fixture.get(path);
    if (/42666600147|42666864017|42666864220/.test(path)) return r12Fixture.get(path);
    if (/42601246471|42601383933|42601384052/.test(path)) return r7Fixture.get(path);
    if (path.includes(R5_R4_HEAD) || /42568309807|42568382053|42568382029/.test(path))
      return r4Fixture.get(path);
    if (path === "") return { ...repo, private: false };
    if (path.startsWith("/commits/")) return [pull];
    if (path === "/pulls/90") return pull;
    if (path.startsWith("/pulls/90/reviews?")) return [review];
    if (path.startsWith("/actions/runs?head_sha="))
      return { total_count: requiredCi.length, workflow_runs: requiredCi };
    if (path === "/git/ref/heads/main") return { object: { sha } };
    if (path === "/actions/workflows/" + spec.fixtures.id)
      return { ...spec.fixtures, state: "active" };
    if (path === "/actions/workflows/" + spec.audit.id) return { ...spec.audit, state: "active" };
    if (path === "/actions/runs/91") return upstream;
    if (path === "/actions/runs/92") return current;
    if (path.startsWith("/actions/workflows/" + spec.fixtures.id + "/runs?"))
      return { total_count: 1, workflow_runs: [current] };
    if (path.startsWith("/actions/workflows/" + spec.audit.id + "/runs?"))
      return {
        total_count: 1,
        workflow_runs: [{ ...current, id: 93, workflow_id: spec.audit.id }],
      };
    if (path.startsWith("/actions/runs/93/jobs?"))
      return { total_count: 1, jobs: [{ name: spec.audit.privateName, conclusion: "skipped" }] };
    throw new Error("unexpected API " + path);
  };
  const options = { operation: "fixtures", env, read, stat, git, get, wait: async () => {} };
  const result = await verify(options);
  assert.equal(result.selected, true);
  assert.equal(result.frontendSha, "");
  assert.equal(result.deploymentId, "");
  const identity = { harnessSha: sha, moduleHash: "e".repeat(64), testHash: "f".repeat(64) };
  const runtime = {
    schema: "contaos.single-request.runtime.v1",
    createdAt: 100000,
    ...result,
    identity,
  };
  const load = fn("loadSingleRequestProof");
  const local = {
    operation: "fixtures",
    env,
    stat,
    git,
    identity: async () => identity,
    now: () => 100000,
    fresh: true,
    read: async (path) =>
      path.includes(".audit-work/single-request.json") ? JSON.stringify(runtime) : read(path),
  };
  assert.equal(await load(local), true);
  for (const delta of [
    { sha: "f".repeat(40) },
    { currentRunId: 93 },
    { requestId: "other" },
    { requestSha256: "0".repeat(64) },
    { createdAt: 100001 },
    { createdAt: 69999 },
    { identity: { ...identity, testHash: "0".repeat(64) } },
  ])
    await assert.rejects(
      () =>
        load({
          ...local,
          read: async (path) =>
            path.includes(".audit-work/single-request.json")
              ? JSON.stringify({ ...runtime, ...delta })
              : read(path),
        }),
      { code: "REQUEST_RUNTIME" },
    );
  await load(local);
  assert.equal(sut.singleRequestEventAllowed(env, "fixtures"), true);
  let apiCalls = 0;
  assert.equal(
    (
      await verify({
        ...options,
        operation: "audit",
        get: async () => {
          apiCalls++;
          throw new Error("API forbidden");
        },
      })
    ).selected,
    false,
  );
  assert.equal(apiCalls, 0);
  assert.equal(sut.singleRequestEventAllowed(env, "fixtures"), false);
  let mainCalls = 0;
  await assert.rejects(
    () =>
      verify({
        ...options,
        get: async (path) =>
          path === "/git/ref/heads/main" && ++mainCalls === 2
            ? { object: { sha: "f".repeat(40) } }
            : get(path),
      }),
    { code: "REQUEST_STALE" },
  );
  for (const conclusion of ["success", "failure", null])
    await assert.rejects(
      () =>
        verify({
          ...options,
          get: async (path) =>
            path.startsWith("/actions/runs/93/jobs?")
              ? { total_count: 1, jobs: [{ name: spec.audit.privateName, conclusion }] }
              : get(path),
        }),
      { code: "REQUEST_OPPOSITE" },
    );
  await assert.rejects(
    () =>
      verify({
        ...options,
        stat: async () => ({ isFile: () => true, isSymbolicLink: () => true, size: 1 }),
      }),
    { code: "REQUEST_EVENT_FILE" },
  );
});

test("solicitacao unica: PR integrado revisao selada e checks obrigatorios", () => {
  const validate = fn("validateSingleRequestPull"),
    repo = { full_name: "contaos999999/contaos-hml-control" },
    sha = "a".repeat(40),
    parent = "b".repeat(40),
    head = "d".repeat(40);
  const request = { request_id: sut.SINGLE_REQUEST.fixtures.nonce, approved_parent_sha: parent };
  const pull = {
    id: 300,
    number: 90,
    merged: true,
    state: "closed",
    merged_at: "2026-11-08T00:00:00Z",
    merge_commit_sha: sha,
    changed_files: 1,
    base: { ref: "main", sha: parent, repo },
    head: { sha: head, ref: "request/fixtures", repo },
  };
  const review = {
    id: 301,
    state: "COMMENTED",
    user: { login: "contaos9999" },
    commit_id: head,
    submitted_at: "2026-11-08T00:00:00Z",
    body: JSON.stringify({
      schema: "contaos.single-request.review.v1",
      request_id: request.request_id,
      head_sha: head,
      critical: 0,
      important: 0,
      decision: "APROVAVEL",
    }),
  };
  const ci = [
    {
      id: 501,
      workflow_id: 406076025,
      name: sut.SINGLE_REQUEST.upstreamName,
      path: sut.SINGLE_REQUEST.upstreamPath,
    },
    {
      id: 502,
      workflow_id: 410005553,
      name: "ContaOS LOCK-TYPES-01 Double Barrier",
      path: ".github/workflows/lock-types-double-barrier.yml",
    },
  ].map((r) => ({
    ...r,
    head_sha: head,
    event: "pull_request",
    head_branch: pull.head.ref,
    repository: repo,
    head_repository: repo,
    status: "completed",
    conclusion: "success",
  }));
  const args = {
    pull,
    associated: [pull],
    reviews: [review],
    ci,
    request,
    sha,
    secondParent: head,
  };
  assert.equal(validate(args).pullNumber, 90);
  for (const delta of [
    { associated: [] },
    { associated: [pull, pull] },
    { pull: { ...pull, merged: false } },
    { pull: { ...pull, merge_commit_sha: parent } },
    { pull: { ...pull, base: { ...pull.base, ref: "fork" } } },
    { pull: { ...pull, head: { ...pull.head, repo: { full_name: "fork/repo" } } } },
    { pull: { ...pull, changed_files: 2 } },
    { secondParent: parent },
    { reviews: [] },
    { reviews: [{ ...review, state: "DISMISSED" }] },
    { reviews: [{ ...review, user: { login: "foreign" } }] },
    { reviews: [{ ...review, commit_id: parent }] },
    { reviews: [{ ...review, body: "APROVAVEL" }] },
    { reviews: [{ ...review, body: review.body.replace('"important":0', '"important":1') }] },
    { ci: [ci[0]] },
    { ci: [ci[0], { ...ci[1], conclusion: "failure" }] },
    { ci: [...ci, { ...ci[1], id: 600, status: "in_progress", conclusion: null }] },
  ])
    assert.throws(() => validate({ ...args, ...delta }));
});
test("solicitacao unica: barreira nativa de fork PR antecede checkout e token", async () => {
  const { readFile } = await import("node:fs/promises");
  const clauses = [
    "github.event_name == 'workflow_run'",
    "github.repository == 'contaos999999/contaos-hml-control'",
    "github.event.action == 'completed'",
    "github.event.workflow_run.event == 'push'",
    "github.event.workflow_run.repository.full_name == 'contaos999999/contaos-hml-control'",
    "github.event.workflow_run.head_repository.full_name == 'contaos999999/contaos-hml-control'",
    "github.event.workflow_run.head_branch == 'main'",
    "github.event.workflow_run.workflow_id == 406076025",
    "github.event.workflow_run.path == '.github/workflows/contaos-frontend-zero-drift.yml'",
    "github.event.workflow_run.name == 'ContaOS Frontend Zero-Drift'",
    "github.event.workflow_run.conclusion == 'success'",
    "github.event.workflow_run.run_attempt == 1",
    "github.run_attempt == '1'",
    "github.event.workflow_run.head_sha == github.sha",
  ];
  for (const file of ["contaos-trilha-a-authenticated.yml", "contaos-trilha-a-fixtures.yml"]) {
    const source = await readFile(
      new URL("../../.github/workflows/" + file, import.meta.url),
      "utf8",
    );
    const request = source.slice(source.indexOf("  request:"), source.indexOf("  protocol:"));
    const nativeIf = request.split("\n").find((l) => l.trimStart().startsWith("if:"));
    const privateIf = source
      .slice(source.indexOf("  private:"))
      .split("\n")
      .find((l) => l.trimStart().startsWith("if:"));
    for (const clause of clauses) {
      assert.ok(nativeIf.includes(clause), file + clause);
      assert.ok(privateIf.includes(clause), file + clause);
    }
    const bootstrap = request.indexOf("Bootstrap publico confiavel");
    assert.ok(bootstrap >= 0 && bootstrap < request.indexOf("uses: actions/checkout"));
    assert.ok(
      request.indexOf("body.object?.sha!==sha") < request.indexOf("uses: actions/checkout"),
    );
    assert.ok(
      request.indexOf("CONTAOS_ACTIONS_READ_TOKEN:") > request.indexOf("uses: actions/checkout"),
    );
    const body = request.slice(bootstrap, request.indexOf("uses: actions/checkout"));
    assert.equal(body.includes("Authorization"), false);
  }
});

test("solicitacao unica: protocolos independentes mantem HML serializado", async () => {
  const { readFile } = await import("node:fs/promises");
  const groups = [];
  for (const file of ["contaos-trilha-a-authenticated.yml", "contaos-trilha-a-fixtures.yml"]) {
    const source = await readFile(
      new URL("../../.github/workflows/" + file, import.meta.url),
      "utf8",
    );
    const protocol = source.slice(source.indexOf("  protocol:"), source.indexOf("  private:"));
    const privateJob = source.slice(source.indexOf("  private:"));
    groups.push(protocol.match(/group: ([^\n]+)/)[1]);
    assert.equal(privateJob.match(/group: ([^\n]+)/)[1], "trilha-a-authenticated-hml");
    assert.match(privateJob, /cancel-in-progress: false/);
  }
  assert.notEqual(groups[0], groups[1]);
});

test("solicitacao unica: somente par exatamente vazio ativa descoberta", () => {
  const parse = fn("parseSingleRequest");
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.deepEqual(parse(JSON.stringify(row), "fixtures"), row);
  for (const pair of [
    { frontend_sha: "", deployment_id: "dpl_12345678" },
    { frontend_sha: "b".repeat(40), deployment_id: "" },
    { frontend_sha: " ", deployment_id: "" },
    { frontend_sha: "", deployment_id: " " },
    { frontend_sha: null, deployment_id: "" },
    { frontend_sha: "", deployment_id: null },
    { frontend_sha: undefined, deployment_id: "" },
    { frontend_sha: "", deployment_id: undefined },
    { frontend_sha: " ", deployment_id: " " },
    { frontend_sha: "bad", deployment_id: "dpl_12345678" },
  ])
    assert.throws(() => parse(JSON.stringify({ ...row, ...pair }), "fixtures"));
  for (const delta of [
    { mode: "AUTO_DISCOVER" },
    { request_id: "unknown" },
    { operation: "audit" },
  ])
    assert.throws(() => parse(JSON.stringify({ ...row, ...delta }), "fixtures"));
  assert.throws(() =>
    parse(
      JSON.stringify(row).replace('"frontend_sha":""', '"frontend_sha":"","frontend_sha":""'),
      "fixtures",
    ),
  );
  const explicit = { ...row, frontend_sha: "b".repeat(40), deployment_id: "dpl_12345678" };
  assert.deepEqual(parse(JSON.stringify(explicit), "fixtures"), explicit);
  assert.throws(() => fn("requireSingleRequestOperation")("audit"), {
    code: "AUDIT_BINDING_PENDING",
  });
});

test("solicitacao unica: descoberta adia apenas ancestralidade da fonte declarada", async () => {
  const verify = fn("verifySingleRequestGit"),
    sha = "a".repeat(40),
    parent = "b".repeat(40);
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: parent,
    frontend_sha: "",
    deployment_id: "",
  };
  const raw = JSON.stringify(row),
    path = sut.SINGLE_REQUEST.path,
    ancestors = [];
  const git = async (args) => {
    assert.equal(args.includes(""), false, "Git nunca recebe SHA vazio");
    if (args[0] === "show" && args[1].startsWith("bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215:"))
      return (await r8R7Fixture()).git(args);
    if (args[0] === "show" && args[1].startsWith(R5_R4_HEAD + ":"))
      return (await r5R4Fixture()).git(args);
    if (args[0] === "show") return raw;
    if (args[0] === "rev-parse") return sha;
    if (args[0] === "rev-list") return [sha, parent, "d".repeat(40)].join(" ");
    if (args[0] === "merge-base") {
      ancestors.push(args[2]);
      return "";
    }
    if (args[0] === "diff-tree") return "A\t" + path;
    if (args[0] === "ls-tree") return "100644 blob " + "e".repeat(40) + "\t" + path;
    if (args[0] === "log") return sha;
    throw new Error("unexpected Git command");
  };
  assert.deepEqual(await verify(row, sha, git, raw), [sha]);
  assert.deepEqual(ancestors, [
    sut.SINGLE_REQUEST.gateSha,
    sut.SINGLE_REQUEST.fixturesSha,
    sut.SINGLE_REQUEST.recoveryGateSha,
    sut.SINGLE_REQUEST.readbackGateSha,
    sut.SINGLE_REQUEST.bootstrapGateSha,
    sut.SINGLE_REQUEST.navigationGateSha,
    sut.SINGLE_REQUEST.listSelectionGateSha,
    sut.SINGLE_REQUEST.metadataGateSha,
    sut.SINGLE_REQUEST.observationGateSha,
    sut.SINGLE_REQUEST.competenceReadGateSha,
    sut.SINGLE_REQUEST.contextualProjectionGateSha,
    sut.SINGLE_REQUEST.asynchronousOpinionGateSha,
    sut.SINGLE_REQUEST.canonicalProfileGateSha,
    sut.SINGLE_REQUEST.r13RecoveryGateSha,
    sut.SINGLE_REQUEST.r19RecoveryGateSha,
    sut.SINGLE_REQUEST.r19RecoveryPlanSha,
    sut.SINGLE_REQUEST.r18ReaderBuildSha,
    sut.SINGLE_REQUEST.r18RecoveryGateSha,
    sut.SINGLE_REQUEST.r18RecoveryPlanSha,
    sut.SINGLE_REQUEST.r17ReaderBuildSha,
    sut.SINGLE_REQUEST.r17RecoveryGateSha,
    sut.SINGLE_REQUEST.r17RecoveryPlanSha,
    sut.SINGLE_REQUEST.r16RecoveryBuildSha,
    sut.SINGLE_REQUEST.r15RecoveryGateSha,
    sut.SINGLE_REQUEST.void204GateSha,
    sut.SINGLE_REQUEST.void204BuildSha,
    sut.SINGLE_REQUEST.metadataTimeoutGateSha,
    sut.SINGLE_REQUEST.metadataTimeoutPlanSha,
    sut.SINGLE_REQUEST.uiSecurityRecoveryGateSha,
    sut.SINGLE_REQUEST.listReadinessSecuritySha,
    sut.SINGLE_REQUEST.listReadinessBuildSha,
    sut.SINGLE_REQUEST.r14PlanSha,
    sut.SINGLE_REQUEST.autoGateSha,
  ]);
  await assert.rejects(
    () =>
      verify(
        row,
        sha,
        async (args) => {
          if (args[0] === "merge-base" && args[2] === sut.SINGLE_REQUEST.readbackGateSha)
            throw Error("GATE439_MISSING");
          return git(args);
        },
        raw,
      ),
    /GATE439_MISSING/,
  );
  let calls = 0;
  await assert.rejects(() =>
    verify(
      { ...row, deployment_id: "dpl_12345678" },
      sha,
      async () => {
        calls++;
        return raw;
      },
      raw,
    ),
  );
  assert.equal(calls, 0, "par parcial rejeitado antes de Git");
});

test("solicitacao unica: identidade descoberta continua obrigatoria antes do checkout", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const file of ["contaos-trilha-a-authenticated.yml", "contaos-trilha-a-fixtures.yml"]) {
    const source = await readFile(
      new URL("../../.github/workflows/" + file, import.meta.url),
      "utf8",
    );
    const resolve = source.indexOf(
      "run: node scripts/hml/authenticated-visual-audit.mjs --resolve-deployment",
      source.indexOf("  private:"),
    );
    const ancestry = source.indexOf("'merge-base','--is-ancestor',sha,'origin/main'", resolve);
    const checkout = source.indexOf("ref: ${{ steps.deployment.outputs.frontend_sha }}", resolve);
    assert.ok(resolve >= 0 && ancestry > resolve && checkout > ancestry);
    assert.match(source.slice(resolve, ancestry), /CONTAOS_FRONTEND_SHA/);
    assert.match(source.slice(resolve, ancestry), /CONTAOS_DEPLOYMENT_ID/);
  }
  assert.throws(() => fn("deploymentWorkflowOutputs")({ frontendSha: "", deploymentId: "" }), {
    code: "DEPLOYMENT_INPUT",
  });
});

test("SYS04 closed RPC rejects unknown rows without exporting them", async () => {
  const proof = await fn("loadPrivacySys04Proof")();
  const runtime = fn("privacySys04Runtime")({ proof });
  const rows = [...proof.legacy, ...proof.constructor_closed, ...proof.discovered_closed];
  const dto = rows.map(({ id, razao_social, nome_fantasia, cnpj, situacao }) => ({
    id,
    razao_social,
    nome_fantasia,
    cnpj,
    situacao,
    perfil: "administrador_master",
  }));
  const url = API + "/rest/v1/rpc/listar_organizacoes_disponiveis";
  assert.equal(runtime.match(url, "POST", "{}"), true);
  for (const body of ["null", "[]", '{"x":1}'])
    assert.equal(runtime.match(url, "POST", body), false);
  assert.equal(runtime.match(url + "?x=1", "POST", "{}"), false);
  assert.equal(runtime.match(url, "GET", "{}"), false);
  const projected = runtime.project(dto);
  assert.deepEqual(projected, { ids: dto.map((r) => r.id) });
  for (const change of [
    (r) => r.push({ ...r[0] }),
    (r) => (r[0].cnpj = "123"),
    (r) => (r[0].razao_social = "unknown-canary"),
    (r) => (r[0].perfil = "administrador"),
    (r) => (r[0].extra = "canary"),
    (r) => (r[0].id = "00000000-0000-4000-8000-000000000001"),
  ]) {
    const altered = structuredClone(dto);
    change(altered);
    assert.equal(runtime.project(altered), null);
  }
  assert.equal(JSON.stringify(projected).includes("razao_social"), false);
});

test(
  "SYS04 source component full subtree binds duplicate labels in eight Chromium cases",
  { skip: process.env.CONTAOS_SYS04_BROWSER !== "1" && process.env.CONTAOS_NATIVE_GUARD !== "1" },
  async () => {
    const { readFile } = await import("node:fs/promises");
    const ts = (await import("typescript")).default;
    const React = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { chromium } = await import("playwright");
    const source = await readFile(
      new URL("../../src/components/organizacao/OrganizationSelector.tsx", import.meta.url),
      "utf8",
    );
    const ast = ts.createSourceFile(
      "selector.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const wanted = new Set(["formatarCnpj", "OrganizationCard", "OrganizationList"]);
    const statements = ast.statements
      .filter((s) => ts.isFunctionDeclaration(s) && wanted.has(s.name?.text))
      .map((s) => s.getText(ast).replace(/^export /, ""))
      .join("\n");
    const js = ts.transpileModule(statements, {
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
    }).outputText;
    const Component = new Function(
      "React",
      "useRef",
      "cn",
      "Check",
      "rotuloPerfil",
      js + ";return OrganizationList",
    )(
      React,
      React.useRef,
      (...v) => v.filter(Boolean).join(" "),
      () => React.createElement("svg", { "aria-hidden": true }),
      (p) => (p === "administrador_master" ? "Administrador Master" : p),
    );
    const proof = await fn("loadPrivacySys04Proof")();
    const all = [...proof.legacy, ...proof.constructor_closed, ...proof.discovered_closed];
    const duplicate = proof.discovered_closed
      .filter((r) => r.razao_social === "V117 synthetic review")
      .slice(0, 2);
    assert.equal(duplicate.length, 2);
    const chosen = all;
    const dto = chosen.map(({ id, razao_social, nome_fantasia, cnpj, situacao }) => ({
      id,
      razao_social,
      nome_fantasia,
      cnpj,
      situacao,
      perfil: "administrador_master",
    }));
    const html = renderToStaticMarkup(
      React.createElement(Component, {
        vinculos: dto.map((r) => ({ id: r.id, perfil: r.perfil, organizacao: r })),
        selecionada: dto[0].id,
        onSelecionar: () => {},
      }),
    );
    const browser = await launchIsolatedProvedBrowser(chromium);
    try {
      for (const width of [1440, 1280, 768, 390])
        for (const theme of ["light", "dark"]) {
          const page = await browser.newPage({
            viewport: { width, height: 1000 },
            colorScheme: theme,
          });
          await page.route("**/*", (route) => route.abort());
          await page.setContent('<main class="' + theme + '">' + html + "</main>");
          const receipt = {
            route: "/selecionar-organizacao",
            ids: dto.map((r) => r.id),
            revision: 1,
            age: 1,
          };
          const anchor = await page.evaluate(fn("privacySys04Anchor"), { proof, receipt });
          assert.ok(anchor, JSON.stringify({ width, theme }));
          const rendered = await page.locator("body").innerText(),
            snapshot = await page.locator("body").ariaSnapshot();
          const cards = await page.getByRole("radio").all();
          const snapshots = await Promise.all(cards.map((c) => c.ariaSnapshot()));
          const context = fn("privacySys04FieldContext")({
            proof,
            receipt,
            anchor,
            rendered,
            snapshot,
            cardSnapshots: snapshots,
            anchored: true,
          });
          assert.ok(context);
          for (const delta of [
            { proof: structuredClone(proof) },
            { anchored: false },
            { receipt: { ...receipt, age: 120000 } },
            { receipt: { ...receipt, age: -1 } },
            { receipt: { ...receipt, age: undefined } },
            { receipt: { ...receipt, age: NaN } },
            { anchor: { ...anchor, ids: [...anchor.ids].reverse() } },
          ])
            assert.equal(
              sut.privacySys04FieldContext({
                proof,
                receipt,
                anchor,
                rendered,
                snapshot,
                cardSnapshots: snapshots,
                anchored: true,
                ...delta,
              }),
              null,
            );
          assert.notEqual(sut.classifyArtifactText(rendered, new Set()).reason, "ALLOWED");
          const words = await sut.literalWords(new URL("../../", import.meta.url).pathname);
          assert.equal(
            sut.classifyArtifactText(rendered, words, { fieldContext: context }).reason,
            "ALLOWED",
          );
          assert.equal(
            sut.classifyArtifactText(snapshot, words, { snapshot: true, fieldContext: context })
              .reason,
            "ALLOWED",
          );
          assert.equal(
            sut.classifyArtifactText(rendered + " outsideunknown", words, { fieldContext: context })
              .reason,
            "INVALID_CONTENT",
          );
          assert.equal(
            sut.classifyArtifactText(rendered + " x@example.com", words, { fieldContext: context })
              .reason,
            "SENSITIVE_PATTERN",
          );
          await page
            .getByRole("radio")
            .first()
            .locator("p")
            .first()
            .evaluate((n) => (n.textContent = "unknown-canary"));
          assert.equal(await page.evaluate(sut.privacySys04Anchor, { proof, receipt }), null);
          await page.setContent("<main>" + html + "</main>");
          await page
            .getByRole("radio")
            .first()
            .evaluate((n) => n.setAttribute("title", "x@example.com"));
          assert.equal(await page.evaluate(sut.privacySys04Anchor, { proof, receipt }), null);

          if (width === 1440 && theme === "light") {
            for (const mutation of [
              "invalid",
              "missing",
              "false-selected",
              "tab-missing",
              "tab-extra",
              "selected-missing",
            ]) {
              await page.setContent("<main>" + html + "</main>");
              await page
                .getByRole("radio")
                .first()
                .evaluate((n, m) => {
                  if (m === "invalid") n.setAttribute("aria-checked", "unknown");
                  if (m === "missing") n.removeAttribute("aria-checked");
                  if (m === "false-selected") n.setAttribute("aria-checked", "false");
                  if (m === "tab-missing") n.removeAttribute("tabindex");
                  if (m === "tab-extra") n.parentElement.children[1].setAttribute("tabindex", "0");
                  if (m === "selected-missing") n.querySelector(".sr-only").remove();
                }, mutation);
              assert.equal(
                await page.evaluate(sut.privacySys04Anchor, { proof, receipt }),
                null,
                mutation,
              );
            }
          }
          await page.close();
        }
    } finally {
      await browser.close();
    }
  },
);

test("SYS04 source SDK emits readonly POST with empty object and never calls Auth", async () => {
  const { readFile } = await import("node:fs/promises");
  const ts = (await import("typescript")).default;
  const { createClient } = await import("@supabase/supabase-js");
  const source = await readFile(
    new URL("../../src/lib/auth/resolverDestinoPosLogin.ts", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile(
    "resolver.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const statement = ast.statements
    .find((s) => ts.isFunctionDeclaration(s) && s.name?.text === "listarOrganizacoesDisponiveis")
    .getText(ast)
    .replace(/^export /, "");
  const js = ts.transpileModule(statement, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const seen = [];
  const client = createClient(API, "public-fixture-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init) => {
        seen.push({ url: String(input), method: init.method, body: init.body });
        return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
      },
    },
  });
  const call = new Function(
    "supabase",
    "ErroOrganizacoes",
    "classificarErroOrganizacoes",
    js + ";return listarOrganizacoesDisponiveis",
  )(client, Error, () => "erro");
  assert.deepEqual(await call(), []);
  assert.deepEqual(seen, [
    { url: API + "/rest/v1/rpc/listar_organizacoes_disponiveis", method: "POST", body: "{}" },
  ]);
});

test(
  "SYS04 browser observer seals native response and invalidates mismatched body and route",
  { skip: process.env.CONTAOS_SYS04_BROWSER !== "1" && process.env.CONTAOS_NATIVE_GUARD !== "1" },
  async () => {
    const { chromium } = await import("playwright");
    const proof = await fn("loadPrivacySys04Proof")();
    const row = proof.legacy[0],
      dto = [
        {
          id: row.id,
          razao_social: row.razao_social,
          nome_fantasia: row.nome_fantasia,
          cnpj: null,
          situacao: row.situacao,
          perfil: "administrador_master",
        },
      ];
    const browser = await launchIsolatedProvedBrowser(chromium);
    try {
      for (const wrong of [false, true]) {
        const context = await browser.newContext();
        await context.route("**/*", (route) =>
          route.fulfill({
            status: 200,
            contentType:
              route.request().resourceType() === "document" ? "text/html" : "application/json",
            body:
              route.request().resourceType() === "document" ? "<main></main>" : JSON.stringify(dto),
          }),
        );
        await context.addInitScript(sut.privacySys04Runtime, { proof, install: true });
        const page = await context.newPage();
        await page.goto(HML + "/selecionar-organizacao");
        const response = await page.evaluate(
          async ({ API, wrong }) => {
            const r = await fetch(API + "/rest/v1/rpc/listar_organizacoes_disponiveis", {
              method: "POST",
              body: wrong ? '{"extra":1}' : "{}",
            });
            return await r.json();
          },
          { API, wrong },
        );
        assert.deepEqual(response, dto);
        await page.waitForTimeout(30);
        const receipt = await page.evaluate(() => window.__contaosPrivacySys04.read());
        if (wrong) assert.equal(receipt, null);
        else {
          assert.deepEqual(receipt.ids, [row.id]);
          assert.equal(JSON.stringify(receipt).includes("razao_social"), false);
          await page.evaluate(() => history.pushState({}, "", "/selecionar-organizacao?unknown=1"));
          assert.equal(await page.evaluate(() => window.__contaosPrivacySys04.read()), null);
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
  },
);

test("diagnóstico legado não compartilha alias mutável do erro com o relatório", async () => {
  const canary = "CANARY_PRIVATE_NEVER_EXPORT";
  let captured;
  await assert.rejects(
    () =>
      fn("captureVisualEvidence")({
        brand: async () => ({}),
        drain: async () => {},
        stabilize: async () => {},
        measure: async () => ({
          passed: false,
          identityPassed: true,
          geometryPassed: false,
          tablePassed: true,
          datesPassed: true,
          contrastPassed: true,
          targets: [],
          overflowX: 0,
        }),
        privacy: async () => true,
        save: async () => assert.fail("falha não pode salvar imagem"),
      }),
    (error) => {
      captured = error;
      return error.code === "VISUAL_MEASUREMENT";
    },
  );
  captured.visualDiagnostic.secret = canary;
  captured.visualDiagnostic.identity = false;
  const record = {};
  fn("recordCaseFailure")(record, captured, "CAPTURE_PRIMARY");
  assert.equal(JSON.stringify(record).includes(canary), false);
  assert.equal(record.visualDiagnostic.identity, true);
  assert.equal(record.status, "FAIL_UI");
});

test("V102 diagnóstico nativo projeta somente checkpoint e números fechados", () => {
  const row = {
    lastStage: "MEASURE",
    width: 1440,
    theme: "LIGHT",
    targetCount: 4,
    notHit: 2,
    geometry: false,
  };
  const text = "# V102_NATIVE_DIAGNOSTIC " + JSON.stringify(row);
  assert.deepEqual(fn("nativeVisualDiagnostic")(text), { state: "OBSERVED", ...row });
  const enter = {
    lastStage: "CSS_COMPILE",
    width: null,
    theme: null,
    targetCount: null,
    notHit: null,
    geometry: null,
  };
  assert.deepEqual(
    fn("nativeVisualDiagnostic")("# V102_NATIVE_DIAGNOSTIC " + JSON.stringify(enter)),
    { state: "OBSERVED", ...enter },
  );
});
test("V102 diagnóstico nativo rejeita dados ambíguos inválidos e canários sem eco", () => {
  const check = fn("nativeVisualDiagnostic");
  const row = {
    lastStage: "MEASURE",
    width: 390,
    theme: "DARK",
    targetCount: 4,
    notHit: 2,
    geometry: false,
  };
  const marker = (r) => "# V102_NATIVE_DIAGNOSTIC " + JSON.stringify(r);
  assert.deepEqual(check("CANARY_PRIVATE_URL_TOKEN_STACK"), { state: "MISSING" });
  for (const raw of [
    marker({ ...row, width: "390" }),
    marker({ ...row, width: 391 }),
    marker({ ...row, notHit: 5 }),
    marker({ ...row, targetCount: 65 }),
    marker({ ...row, geometry: "false" }),
    marker({ ...row, geometry: null }),
    marker({ ...row, theme: "CANARY_PRIVATE" }),
    marker({ ...row, extra: "CANARY_PRIVATE" }),
    marker({ ...row, lastStage: "CANARY_PRIVATE" }),
    marker(row) + "\n" + marker({ ...row, notHit: 0, geometry: true }),
    Array(17).fill(marker(row)).join("\n"),
    marker(row).replace('"width":390', '"width":NaN'),
    marker(row).replace('"width":390', '"width":Infinity'),
    marker(row).replace('"width":390', '"width":390,"width":390'),
  ]) {
    const result = check(raw);
    assert.deepEqual(result, { state: "INVALID" });
    assert.equal(JSON.stringify(result).includes("CANARY"), false);
  }
});

test("Run114 medição falha preserva diagnóstico fechado sem screenshot ou texto privado", async () => {
  let saved = false;
  const metrics = {
    passed: false,
    identityPassed: true,
    geometryPassed: false,
    tablePassed: true,
    datesPassed: true,
    contrastPassed: true,
    overflowX: 0,
    targets: [{ hit: false, disabled: false }, { hit: true }],
    secret: "CANARY_PRIVATE_NEVER_EXPORT",
  };
  await assert.rejects(
    () =>
      fn("captureVisualEvidence")({
        brand: async () => ({}),
        drain: async () => {},
        stabilize: async () => {},
        measure: async () => metrics,
        privacy: async () => true,
        save: async () => {
          saved = true;
        },
      }),
    (error) => {
      assert.equal(error.code, "VISUAL_MEASUREMENT");
      assert.deepEqual(error.visualDiagnostic, {
        identity: true,
        geometry: false,
        table: true,
        dates: true,
        contrast: true,
        targetCount: 2,
        failedHitCount: 1,
        overflowX: 0,
      });
      assert.equal(JSON.stringify(error.visualDiagnostic).includes("CANARY"), false);
      return true;
    },
  );
  assert.equal(saved, false);
});
test("Run114 diagnóstico limita contadores e ignora getters de campos não autorizados", () => {
  const metrics = {
    identityPassed: true,
    geometryPassed: true,
    tablePassed: true,
    datesPassed: true,
    contrastPassed: true,
    overflowX: Infinity,
    targets: Array.from({ length: 600 }, () => ({ hit: false, disabled: true })),
    get secret() {
      assert.fail("não ler campo privado");
    },
  };
  assert.deepEqual(fn("visualMeasurementDiagnostic")(metrics), {
    identity: true,
    geometry: true,
    table: true,
    dates: true,
    contrast: true,
    targetCount: 500,
    failedHitCount: 0,
    overflowX: null,
  });
  assert.equal(fn("visualMeasurementDiagnostic")({ overflowX: 40000 }).overflowX, 30000);
  assert.equal(fn("visualMeasurementDiagnostic")({ overflowX: -40000 }).overflowX, -30000);
});

test("SYS04 literal interval pattern treats metacharacters as data", () => {
  const literal = fn("privacySys04Literal");
  for (const value of ["a.b", "a[b]", "a(b)", "a+b", "a?b", "a$b", "a^b", "a|b", "a\\b"]) {
    const pattern = new RegExp("^" + literal(value) + "$", "u");
    assert.equal(pattern.test(value), true);
    assert.equal(pattern.test("other"), false);
  }
  assert.equal(new RegExp("^" + literal("a.b") + "$").test("axb"), false);
});
test("SYS04 supplement accepts only factual complete two-test TAP", () => {
  const parse = fn("privacySys04Supplement");
  assert.equal(parse("# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n"), 2);
  for (const tap of [
    "",
    "# pass 2\n",
    "# tests 2\n# pass 1\n# fail 1\n# skipped 0\n# cancelled 0\n",
    "# tests 2\n# pass 2\n# fail 0\n# skipped 1\n# cancelled 0\n",
  ])
    assert.equal(parse(tap), null);
});

function privacy112Fixture() {
  return (
    '<section aria-labelledby="v112-lista"><div><h2 id="v112-lista">Lista de competências</h2></div>' +
    '<div class="overflow-x-auto rounded-lg border border-border"><table class="w-full min-w-[56rem] text-sm"><caption class="sr-only">Competências do contrato</caption><thead class="bg-muted/50"><tr><th scope="col">Competência</th><th scope="col">Período</th><th scope="col">Data limite</th><th scope="col">Situação</th><th scope="col">Conformidade</th><th scope="col">Versão do pacote</th><th scope="col">Ações</th></tr></thead><tbody><tr class="border-t border-border"><th scope="row">11/2026</th><td>01/11/2026 a 30/11/2026</td><td>—</td><td><span class="inline-flex"><span data-status>—</span></span></td><td><span data-percentual>—</span></td><td>—</td><td><a href="/competencias/59072760-4420-4598-82dd-367f41a79e89" aria-label="Abrir competência 11/2026"><span>Abrir competência</span></a></td></tr></tbody></table></div>' +
    "</section>"
  );
}
function privacy112Texts() {
  const value = privacy78Proof.generated_exact_values.V112[0];
  const header = '- rowheader "11/2026"';
  const cell = '- cell "' + value + '"';
  const row =
    '- row "11/2026 ' +
    value +
    ' — — — — Abrir competência 11/2026":\n' +
    "  " +
    header +
    "\n  " +
    cell +
    '\n  - cell "—"\n  - cell "—"\n  - cell "—"\n  - cell "—"\n  - cell "Abrir competência 11/2026":\n    - link "Abrir competência 11/2026":\n      - /url: /competencias/' +
    privacy78Proof.context.competence;
  return {
    rendered: "Lista de competências\n11/2026 " + value + " — — — — Abrir competência",
    snapshot:
      '- heading "Lista de competências" [level=2]\n- table:\n  ' + row.replaceAll("\n", "\n  "),
    fieldSnapshots: [row, header, cell],
  };
}
test("privacy112 RED real row aggregate and cell require scoped structural exemption", async () => {
  const proof = await fn("loadPrivacy78Proof")(),
    texts = privacy112Texts();
  const input = {
    proof,
    ...texts,
    anchored: true,
    receipt: Object.freeze({
      route: fn("privateCases")().find((i) => i.surface === "V112").path,
      observed: Object.freeze(["contract_gate", "competencias_page0_no_filters"]),
      age: 1,
    }),
  };
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  assert.equal(fn("classifyArtifactText")(texts.rendered, words).unknownCount, 1);
  assert.equal(
    fn("classifyArtifactText")(texts.snapshot, words, { snapshot: true }).unknownCount,
    3,
  );
  const context = fn("privacy112FieldContext")(input);
  assert.ok(context);
  for (const channel of ["rendered", "snapshot"])
    assert.equal(
      fn("classifyArtifactText")(texts[channel], words, {
        snapshot: channel === "snapshot",
        fieldContext: context,
      }).reason,
      "ALLOWED",
    );
  for (const delta of [
    { anchored: false },
    { proof: privacy78Proof },
    { receipt: { ...input.receipt } },
    { receipt: Object.freeze({ ...input.receipt, age: 120000 }) },
    { receipt: Object.freeze({ ...input.receipt, observed: Object.freeze([]) }) },
    { receipt: Object.freeze({ ...input.receipt, route: "/" }) },
    { fieldSnapshots: texts.fieldSnapshots.slice(0, 2) },
    { snapshot: texts.snapshot + "\n" + texts.fieldSnapshots[2] },
    { rendered: texts.rendered + proof.generated_exact_values.V112[0] },
    { snapshot: texts.snapshot.replace('rowheader "11/2026"', 'rowheader "10/2026"') },
    { snapshot: texts.snapshot.replace("01/11/2026", "01/10/2026") },
  ])
    assert.equal(fn("privacy112FieldContext")({ ...input, ...delta }), null);
  for (const extra of [
    " CANARIO_PRIVADO",
    " rowheader",
    " pessoa@example.com",
    " Bearer secret",
    " 123.456.789-00",
  ]) {
    for (const channel of ["rendered", "snapshot"]) {
      const changed = { ...input, [channel]: texts[channel] + extra },
        ctx = fn("privacy112FieldContext")(changed);
      assert.notEqual(
        fn("classifyArtifactText")(changed[channel], words, {
          snapshot: channel === "snapshot",
          fieldContext: ctx,
        }).reason,
        "ALLOWED",
      );
    }
  }
});
test("privacy112 DOM closes section seven columns header same row link and plain period", () => {
  for (const mutate of [
    null,
    (d) => (d.querySelector("h2").textContent = "Outro"),
    (d) => d.querySelector("thead th").remove(),
    (d) => (d.querySelector("th[scope=row]").textContent = "10/2026"),
    (d) => d.querySelector("td").setAttribute("aria-label", "CANARIO_PRIVADO"),
    (d) => (d.querySelector("a").href = "/competencias/foreign"),
    (d) => (d.body.innerHTML += privacy112Fixture()),
    (d) => d.querySelector("td").appendChild(d.createElement("span")),
  ]) {
    const { dom, w, run } = privacy78Browser(privacy112Fixture());
    try {
      if (mutate) mutate(w.document);
      assert.equal(!!run("privacy112FieldAnchor", { proof: privacy78Proof }), !mutate);
    } finally {
      dom.window.close();
    }
  }
});

test(
  "privacy112 Chromium full DOM ARIA matrix preserves scoped intervals and unknown neighbours",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 30000 },
  async () => {
    const { chromium } = await import("playwright");
    const browser = await launchIsolatedProvedBrowser(chromium);
    const proof = await fn("loadPrivacy78Proof")(),
      words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
    try {
      const page = await browser.newPage();
      await page.route("**/*", (r) => r.abort());
      let matrixCases = 0;
      for (const width of [1440, 1280, 768, 390])
        for (const theme of ["light", "dark"]) {
          matrixCases++;
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ colorScheme: theme });
          await page.setContent(
            "<!doctype html><style>table{min-width:56rem}caption{position:absolute;width:1px;height:1px;overflow:hidden}</style>" +
              privacy112Fixture(),
          );
          const anchor = await page.evaluate(fn("privacy112FieldAnchor"), { proof });
          assert.ok(anchor);
          const fieldSnapshots = await fn("privacy112FieldSnapshots")(page, anchor);
          assert.ok(fieldSnapshots);
          const rendered = await page.evaluate(() => document.body.innerText),
            snapshot = await page.locator("body").ariaSnapshot();
          const input = {
            proof,
            rendered,
            snapshot,
            fieldSnapshots,
            anchored: true,
            receipt: Object.freeze({
              route: fn("privateCases")().find((i) => i.surface === "V112").path,
              observed: Object.freeze(["contract_gate", "competencias_page0_no_filters"]),
              age: 1,
            }),
          };
          assert.equal(fn("classifyArtifactText")(rendered, words).unknownCount, 1);
          assert.equal(
            fn("classifyArtifactText")(snapshot, words, { snapshot: true }).unknownCount,
            3,
          );
          const ctx = fn("privacy112FieldContext")(input);
          assert.ok(ctx);
          assert.equal(
            fn("classifyArtifactText")(rendered, words, { fieldContext: ctx }).reason,
            "ALLOWED",
          );
          assert.equal(
            fn("classifyArtifactText")(snapshot, words, { snapshot: true, fieldContext: ctx })
              .reason,
            "ALLOWED",
          );
          await page
            .locator("tbody tr td")
            .nth(2)
            .evaluate((n) => n.setAttribute("aria-label", "CANARIO_PRIVADO"));
          const changed = await page.locator("body").ariaSnapshot();
          const changedFields = await fn("privacy112FieldSnapshots")(page, anchor);
          const changedContext = fn("privacy112FieldContext")({
            ...input,
            snapshot: changed,
            fieldSnapshots: changedFields,
          });
          assert.notEqual(
            fn("classifyArtifactText")(changed, words, {
              snapshot: true,
              fieldContext: changedContext,
            }).reason,
            "ALLOWED",
          );
          await page
            .locator("tbody tr td")
            .nth(2)
            .evaluate((n) => n.removeAttribute("aria-label"));
          await page
            .locator("tbody a")
            .evaluate((n) => n.setAttribute("aria-labelledby", "v112-lista"));
          assert.ok(
            (await page.locator("tbody a").ariaSnapshot()).includes('link "Lista de competências"'),
          );
          assert.equal(await page.evaluate(fn("privacy112FieldAnchor"), { proof }), null);
        }
      assert.equal(matrixCases, 8);
    } finally {
      await browser.close();
    }
  },
);

test("privacy112 rejects copies cards structural injection foreign records and stale evidence", async () => {
  const proof = await fn("loadPrivacy78Proof")(),
    texts = privacy112Texts(),
    value = proof.generated_exact_values.V112[0];
  const input = {
    proof,
    ...texts,
    anchored: true,
    receipt: Object.freeze({
      route: fn("privateCases")().find((i) => i.surface === "V112").path,
      observed: Object.freeze(["contract_gate", "competencias_page0_no_filters"]),
      age: 1,
    }),
  };
  for (const delta of [
    {
      fieldSnapshots: [
        texts.fieldSnapshots[0],
        '- rowheader "11/2026 CANARIO_PRIVADO"',
        texts.fieldSnapshots[2],
      ],
    },
    {
      fieldSnapshots: [
        texts.fieldSnapshots[0].replace("  - rowheader", "  - cell"),
        texts.fieldSnapshots[1],
        texts.fieldSnapshots[2],
      ],
    },
    {
      fieldSnapshots: [
        texts.fieldSnapshots[0].replace('  - cell "—"\n', ""),
        texts.fieldSnapshots[1],
        texts.fieldSnapshots[2],
      ],
    },
    { snapshot: texts.snapshot + '\n- paragraph "' + value + '"' },
    { snapshot: texts.snapshot + "\n" + texts.fieldSnapshots[0] },
    { snapshot: texts.snapshot.replace("11/2026", "09/2026") },
    {
      receipt: Object.freeze({
        ...input.receipt,
        observed: Object.freeze(["contract_gate", "competencias_page0_no_filters", "foreign"]),
      }),
    },
    {
      receipt: Object.freeze({
        ...input.receipt,
        observed: Object.freeze([
          "contract_gate",
          "competencias_page0_no_filters",
          "contract_gate",
        ]),
      }),
    },
    { receipt: Object.freeze({ ...input.receipt, age: -1 }) },
  ])
    assert.equal(fn("privacy112FieldContext")({ ...input, ...delta }), null);
  assert.equal(
    fn("privacy78FieldContext")({
      surface: "V112",
      proof,
      rendered: value,
      snapshot: value,
      fieldSnapshot: value,
      anchored: true,
      receipt: input.receipt,
    }),
    null,
  );
  for (const mutate of [
    (d) => (d.querySelector("thead th:nth-child(2)").textContent = "Outro"),
    (d) => d.querySelector("th[scope=row]").setAttribute("aria-label", "CANARIO_PRIVADO"),
    (d) => d.querySelector("a").setAttribute("aria-label", "Abrir competência 10/2026"),
    (d) => d.querySelector("tbody").appendChild(d.querySelector("tbody tr").cloneNode(true)),
    (d) => (d.querySelector("tbody td").textContent = "01/10/2026 a 31/10/2026"),
    (d) => (d.querySelector("table").outerHTML = "<article>11/2026 " + value + "</article>"),
    (d) => (d.querySelector("h2").id = "foreign"),
    (d) => (d.querySelector("table").hidden = true),
  ]) {
    const { dom, w, run } = privacy78Browser(privacy112Fixture());
    try {
      mutate(w.document);
      assert.equal(run("privacy112FieldAnchor", { proof }), null);
    } finally {
      dom.window.close();
    }
  }
});

const diagnosticMetrics = (delta = {}) => ({
  viewport: { width: 390, height: 1000 },
  theme: "light",
  passed: false,
  identityPassed: true,
  geometryPassed: false,
  tablePassed: true,
  datesPassed: true,
  contrastPassed: true,
  overflowX: 0,
  table: null,
  dates: [],
  contrast: [],
  pairs: [],
  targets: [
    {
      ordinal: 0,
      kind: "INPUT",
      rect: { x: 16, y: 100, width: 200, height: 44 },
      connected: true,
      visible: true,
      disabled: false,
      hit: false,
    },
  ],
  ...delta,
});
test("FAIL_UI diagnóstico: guard real retém causa fechada no report sem PNG", async () => {
  let saves = 0,
    privacy = 0;
  const record = {};
  try {
    await fn("captureVisualEvidence")({
      brand: async () => ({ decoded: true }),
      drain: async () => {},
      stabilize: async () => {},
      measure: async () => diagnosticMetrics(),
      privacy: async () => {
        privacy++;
        return true;
      },
      save: async () => {
        saves++;
      },
    });
    assert.fail("guard deve falhar");
  } catch (error) {
    fn("recordCaseFailure")(record, error, "CAPTURE_PRIMARY");
  }
  assert.equal(saves, 0);
  assert.equal(privacy, 0);
  assert.equal(record.status, "FAIL_UI");
  assert.equal(record.visualFailure, "VISUAL_MEASUREMENT");
  assert.equal(record.diagnostic.stage, "CAPTURE_PRIMARY");
  assert.equal(record.diagnostic.errorKind, "KNOWN_VISUAL");
  assert.equal(record.diagnostic.visual.flags.geometryPassed, false);
  assert.equal(record.diagnostic.visual.counts.notHit, 1);
  assert.deepEqual(record.diagnostic.visual.failedTargets[0], {
    ordinal: 0,
    kind: "INPUT",
    rect: { x: 16, y: 100, width: 200, height: 44 },
    connected: true,
    visible: true,
    disabled: false,
    hit: false,
  });
});
test("FAIL_UI diagnóstico: exceção antes de privacy não exporta objeto lançado", () => {
  const canary = "private.person@example.invalid Bearer NEVER_EXPORT";
  const record = {};
  fn("recordCaseFailure")(
    record,
    Object.assign(new Error(canary), {
      name: canary,
      code: canary,
      cause: canary,
      visualDiagnostic: { raw: canary },
      stack: canary,
    }),
    "PRIVACY_PRIMARY",
  );
  assert.equal(record.status, "FAIL_UI");
  assert.equal(record.diagnostic.stage, "PRIVACY_PRIMARY");
  assert.equal(record.diagnostic.errorKind, "OTHER");
  assert.deepEqual(record.diagnostic.visual, { observed: false, state: "UNOBSERVED" });
  assert.equal(JSON.stringify(record).includes(canary), false);
  const invalid = {};
  fn("recordCaseFailure")(
    invalid,
    {
      get code() {
        throw Error(canary);
      },
    },
    canary,
  );
  assert.equal(invalid.diagnostic.stage, null);
  assert.equal(JSON.stringify(invalid).includes(canary), false);
});
test("FAIL_UI diagnóstico: métricas malformadas não viram zeros ou strings públicas", () => {
  const summary = fn("summarizeVisualFailure");
  for (const delta of [
    { viewport: { width: "390", height: 1000 } },
    { overflowX: Infinity },
    { geometryPassed: "false" },
    { targets: Array(257).fill(diagnosticMetrics().targets[0]) },
    { targets: [{ ...diagnosticMetrics().targets[0], kind: "private.person@example.invalid" }] },
    { targets: [{ ...diagnosticMetrics().targets[0], ordinal: 256 }] },
    {
      targets: [{ ...diagnosticMetrics().targets[0], rect: { x: NaN, y: 0, width: 1, height: 1 } }],
    },
  ])
    assert.deepEqual(summary(diagnosticMetrics(delta)), { observed: false, state: "INVALID" });
  const valid = summary(diagnosticMetrics({ privatePayload: "NEVER_EXPORT" }));
  assert.equal(valid.observed, true);
  assert.equal(JSON.stringify(valid).includes("NEVER_EXPORT"), false);
});
test("FAIL_UI diagnóstico: disabled dispensa apenas hit e limites continuam causais", () => {
  const summary = fn("summarizeVisualFailure"),
    geometry = fn("visualGeometryValid");
  const target = diagnosticMetrics().targets[0];
  for (const [disabled, x, expected, notHit, boundsX] of [
    [false, 16, false, 1, 0],
    [true, 16, true, 0, 0],
    [false, 16, false, 1, 0],
    [true, 380, false, 0, 1],
  ]) {
    const metrics = diagnosticMetrics({
      targets: [{ ...target, disabled, rect: { ...target.rect, x } }],
    });
    assert.equal(geometry(metrics), expected);
    const result = summary(metrics);
    assert.equal(result.counts.notHit, notHit);
    assert.equal(result.counts.boundsX, boundsX);
  }
});
test("FAIL_UI diagnóstico: no máximo oito alvos sem texto com contagem integral", () => {
  const result = fn("summarizeVisualFailure")(
    diagnosticMetrics({
      targets: Array.from({ length: 9 }, (_, ordinal) => ({
        ...diagnosticMetrics().targets[0],
        ordinal,
      })),
      table: { clipping: 2, helpTargets: [{ x: 0, y: 0, width: 20, height: 44 }] },
      dates: [
        { present: false, scheme: "light" },
        { present: true, scheme: "dark" },
      ],
      contrast: [{ ratio: 3.5, threshold: 4.5 }],
    }),
  );
  assert.equal(result.counts.targetsExamined, 9);
  assert.equal(result.counts.notHit, 9);
  assert.equal(result.failedTargets.length, 8);
  assert.deepEqual(result.table, { clipping: 2, helpBelow44: 1 });
  assert.deepEqual(result.dates, { absent: 1, schemeMismatch: 1 });
  assert.deepEqual(result.contrast, { count: 1, minimum: 3.5, threshold: 4.5 });
});
test("FAIL_UI diagnóstico: PII conserva bloqueio e código desconhecido não é publicado", () => {
  for (const code of ["PII_SUPPLEMENT", "PII_VISUAL_CAPTURE"]) {
    const record = {};
    fn("recordCaseFailure")(record, { code, message: "NEVER_EXPORT" }, "CAPTURE_SUPPLEMENT");
    assert.equal(record.status, "BLOQUEADO_PII");
    assert.equal(JSON.stringify(record).includes("NEVER_EXPORT"), false);
  }
  const record = {};
  fn("recordCaseFailure")(record, { name: "TimeoutError", code: "NEVER_EXPORT" }, "WAIT_SURFACE");
  assert.equal(record.diagnostic.errorKind, "TIMEOUT");
  assert.equal(JSON.stringify(record).includes("NEVER_EXPORT"), false);
});

const privacyWireRaw = JSON.parse(
  await (
    await import("node:fs/promises")
  ).readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-wire-cardinality-20261109.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
function privacyWireCases() {
  const c = privacy78Proof.context;
  return [
    ["contract_gate", { id: c.contract, id_organizacao: c.organization }],
    ["document_gate", { id: c.document, id_contrato: c.contract }],
    [
      "upload",
      {
        extensoes_permitidas: privacy78Proof.observed.upload.extensions,
        tamanho_maximo_bytes: privacy78Proof.observed.upload.max_bytes,
      },
    ],
    ["competence_rbac_gate", { id_contrato: c.contract }],
  ];
}
async function privacyWireRbac() {
  return JSON.parse(
    await (
      await import("node:fs/promises")
    ).readFile(
      new URL(
        "../../docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_RBAC_V115_READONLY.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
}
test("privacy wire SDK real 2.118 entrega objeto mas observador exige array unitario", async () => {
  const { PostgrestClient } = require("@supabase/postgrest-js");
  const rbacProof = await privacyWireRbac();
  const runtime = fn("privacy78Runtime")({
    proof: privacy78Proof,
    rbacProof,
    wireProof: privacyWireRaw,
  });
  for (const [name, row] of privacyWireCases()) {
    const c = [...privacy78Proof.get_contracts, rbacProof.get_contract].find(
      (x) => x.name === name,
    );
    let receipt = null,
      calls = 0;
    const client = new PostgrestClient(API + "/rest/v1", {
      fetch: async () => {
        calls++;
        const response = new Response(JSON.stringify([row]), { status: 200 });
        receipt = runtime.project(c, await response.clone().json());
        return response;
      },
    });
    let query = client.from(c.path.split("/").at(-1)).select(c.query.select);
    for (const [key, value] of Object.entries(c.query))
      if (key !== "select") query = query.eq(key, value.slice(3));
    const result = await query.maybeSingle();
    assert.equal(calls, 1);
    assert.equal(result.error, null);
    assert.deepEqual(result.data, row);
    assert.deepEqual(receipt, { name, exact: true }, name);
    assert.equal(runtime.project(c, result.data), null, "DTO nao e corpo wire");
  }
});
test("privacy wire selo separado e lista fechada de quatro contratos", async () => {
  const proof = await fn("loadPrivacyWireProof")();
  assert.ok(Object.isFrozen(proof));
  assert.ok(Object.isFrozen(proof.approved_wire.contract_names));
  assert.deepEqual(
    proof.approved_wire.contract_names,
    privacyWireCases().map(([name]) => name),
  );
});
test("privacy wire rejeita cardinalidade shape contexto e valores sem ler campos extras", async () => {
  const rbacProof = await privacyWireRbac();
  const runtime = fn("privacy78Runtime")({
    proof: privacy78Proof,
    rbacProof,
    wireProof: privacyWireRaw,
  });
  for (const [name, row] of privacyWireCases()) {
    const c = [...privacy78Proof.get_contracts, rbacProof.get_contract].find(
      (x) => x.name === name,
    );
    for (const key of ["user", "headers", "metadata"])
      Object.defineProperty(row, key, {
        get() {
          throw new Error("wire unprojected field read");
        },
      });
    assert.deepEqual(runtime.project(c, [row]), { name, exact: true });
    for (const body of [row, [], [row, row], [[row]], [null], [1], ["x"], [{}]])
      assert.equal(runtime.project(c, body), null, name);
    const missing = { ...row };
    delete missing[Object.keys(missing)[0]];
    assert.equal(runtime.project(c, [missing]), null);
    const absent = fn("privacy78Runtime")({ proof: privacy78Proof, rbacProof });
    assert.equal(absent.project(c, [row]), null);
    const tampered = fn("privacy78Runtime")({
      proof: privacy78Proof,
      rbacProof,
      wireProof: {
        ...privacyWireRaw,
        approved_wire: {
          ...privacyWireRaw.approved_wire,
          contract_names: [...privacyWireRaw.approved_wire.contract_names, "foreign"],
        },
      },
    });
    assert.equal(tampered.project(c, [row]), null);
    const url = API + c.path + "?" + new URLSearchParams(c.query);
    assert.equal(runtime.match(url + "&extra=1", "GET"), null);
    assert.equal(runtime.match(url + "&select=x", "GET"), null);
  }
});

async function privacyWireChromium(browser, words) {
  const { readFile } = await import("node:fs/promises");
  const sdkFile = require.resolve("@supabase/postgrest-js").replace(/index\.cjs$/, "index.mjs");
  const sdkModule = "data:text/javascript;base64," + (await readFile(sdkFile)).toString("base64");
  const proof = await fn("loadPrivacy78Proof")(),
    rbacProof = await fn("loadPrivacy78RbacProof")();
  const wireProof = await fn("loadPrivacyWireProof")();
  const c = proof.context,
    p = proof.observed.pipeline[0];
  const data = Object.fromEntries(privacyWireCases());
  data.document_versions_page0 = [
    {
      id: c.document_version,
      id_documento_contrato: c.document,
      id_arquivo: c.file,
      criado_em: p.created,
    },
  ];
  data.processing_page0 = [
    {
      id: c.processing,
      id_versao_documento: c.document_version,
      etapa: p.stage,
      iniciado_em: p.started,
      concluido_em: p.completed,
      criado_em: p.created,
    },
  ];
  const required = {
    V111: ["contract_gate", "document_gate", "document_versions_page0", "processing_page0"],
    V115: ["competence_rbac_gate", "upload"],
    V122: ["contract_gate", "upload"],
  };
  for (const [surface, names] of Object.entries(required)) {
    const page = await browser.newPage({ serviceWorkers: "block" });
    try {
      const html =
        '<meta charset="utf-8"><header aria-label="Organização atual">ContaOS HML Teste Situação: ativa</header>' +
        privacy78Fixtures()[surface];
      // Every browser URL is fulfilled locally; no HML or external request can leave.
      await page.route("**/*", (route) => route.fulfill({ contentType: "text/html", body: html }));
      const path = fn("privateCases")().find((item) => item.surface === surface).path;
      await page.goto(HML + path);
      const contracts = [...proof.get_contracts, rbacProof.get_contract].filter((item) =>
        names.includes(item.name),
      );
      await page.evaluate(
        ({ contracts, data, origin }) => {
          window.fetch = function (url) {
            const matched = contracts.find((item) => {
              const u = new URL(url);
              return (
                u.origin === origin &&
                u.pathname === item.path &&
                [...u.searchParams].length === Object.keys(item.query).length &&
                Object.entries(item.query).every(
                  ([k, v]) => u.searchParams.getAll(k).length === 1 && u.searchParams.get(k) === v,
                )
              );
            });
            if (!matched) throw new Error("LOCAL_WIRE_QUERY");
            const row = data[matched.name];
            const response = new Response(JSON.stringify(Array.isArray(row) ? row : [row]), {
              status: 200,
            });
            Object.defineProperty(response, "url", { value: String(url) });
            return Promise.resolve(response);
          };
        },
        { contracts, data, origin: API },
      );
      await page.evaluate(fn("privacy78Runtime"), { proof, rbacProof, wireProof, install: true });
      await page.evaluate(
        async ({ sdkModule, contracts, origin }) => {
          const { PostgrestClient } = await import(sdkModule);
          const sdk = new PostgrestClient(origin + "/rest/v1", { fetch: window.fetch });
          for (const contract of contracts) {
            let q = sdk.from(contract.path.split("/").at(-1)).select(contract.query.select);
            for (const [key, value] of Object.entries(contract.query)) {
              if (key === "order")
                for (const part of value.split(","))
                  q = q.order(part.split(".")[0], { ascending: false });
              else if (!["select", "offset", "limit"].includes(key)) q = q.eq(key, value.slice(3));
            }
            if (contract.query.limit) q = q.range(0, Number(contract.query.limit) - 1);
            const result = await (contract.shape ? q.maybeSingle() : q);
            if (result.error) throw new Error("LOCAL_SDK_REJECTION");
            if (contract.shape && (Array.isArray(result.data) || !result.data))
              throw new Error("LOCAL_SDK_DTO");
          }
        },
        { sdkModule, contracts, origin: API },
      );
      await page.waitForFunction(
        (count) => window.__contaosPrivacy78?.read()?.observed.length === count,
        names.length,
      );
      const receipt = await page.evaluate(() => window.__contaosPrivacy78.read());
      const anchor = await page.evaluate(fn("privacy78FieldAnchor"), { surface, proof });
      assert.ok(anchor, surface);
      const rendered = await page.locator("body").innerText();
      const snapshot = await page.locator("body").ariaSnapshot();
      const fieldSnapshot = (
        await page.locator(anchor.selector).nth(anchor.index).ariaSnapshot()
      ).trim();
      const context = fn("privacy78FieldContext")({
        surface,
        proof,
        rbacProof,
        rendered,
        snapshot,
        fieldSnapshot,
        anchored: true,
        receipt: Object.freeze({
          ...receipt,
          route: path,
          observed: Object.freeze(receipt.observed),
        }),
      });
      assert.ok(context, surface + " full ARIA and real SDK wire");
      assert.equal(
        fn("classifyArtifactText")(rendered, words, { fieldContext: context }).reason,
        "ALLOWED",
        surface,
      );
      assert.equal(
        fn("classifyArtifactText")(snapshot, words, { snapshot: true, fieldContext: context })
          .reason,
        "ALLOWED",
        surface,
      );
      await page.evaluate(() => window.__contaosPrivacy78.invalidate());
      assert.equal(await page.evaluate(() => window.__contaosPrivacy78.read()), null);
    } finally {
      await page.close();
    }
  }
}

test("privacy112 rejects non-source row labels and period attributes", () => {
  for (const [selector, key, value] of [
    ["tbody tr", "aria-label", "11/2026 01/11/2026 a 30/11/2026"],
    ["tbody tr", "aria-labelledby", "foreign"],
    ["tbody tr td", "scope", "CANARIO_PRIVADO"],
  ]) {
    const { dom, w, run } = privacy78Browser(privacy112Fixture());
    try {
      w.document.querySelector(selector).setAttribute(key, value);
      assert.equal(run("privacy112FieldAnchor", { proof: privacy78Proof }), null);
    } finally {
      dom.window.close();
    }
  }
});

test("privacy112 supplement accepts only its factual complete browser TAP", () => {
  const parse = fn("privacy112Supplement"),
    good =
      "ok 1 - privacy112 Chromium full DOM ARIA matrix preserves scoped intervals and unknown neighbours\n# tests 1\n# pass 1\n# fail 0\n# skipped 0\n# cancelled 0\n";
  assert.equal(parse(good), 1);
  for (const bad of [
    "",
    good.replace("# pass 1", "# pass 0"),
    good.replace("# fail 0", "# fail 1"),
    good.replace("# skipped 0", "# skipped 1"),
    good.replace("# cancelled 0", "# cancelled 1"),
    good + "# tests 1\n",
    good.replace("ok 1 - privacy112 Chromium", "ok 1 - wrong Chromium"),
  ])
    assert.equal(parse(bad), null);
});
test("privacy112 supplemental process is inside nativeGuard after causal proofs", async () => {
  const { readFile } = await import("node:fs/promises"),
    source = await readFile(new URL("./authenticated-visual-audit.mjs", import.meta.url), "utf8"),
    ts = await import("typescript");
  const ast = ts.createSourceFile(
    "auditor.mjs",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const guard = ast.statements
    .find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "nativeGuard")
    .getText(ast);
  assert.ok(guard.includes("--test-name-pattern=^privacy112 Chromium full DOM ARIA matrix"));
  assert.ok(
    guard.indexOf("--test-name-pattern=^privacy112") >
      guard.indexOf("--test-name-pattern=Run78 Chromium isolado"),
  );
  assert.ok(
    guard.indexOf("privacy112Supplement(supplement.stdout)") <
      guard.indexOf('await mkdir(".audit-work"'),
  );
  const prepare =
    ast.statements
      .find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "cli")
      ?.getText(ast) ?? "";
  assert.equal(prepare.includes("--test-name-pattern=^privacy112"), false);
});

test("privacy112 link requires source attributes and exact plain span subtree", () => {
  for (const mutate of [
    (d) => {
      const label = d.createElement("span");
      label.id = "known-literal";
      label.hidden = true;
      label.textContent = "Competências";
      d.body.appendChild(label);
      d.querySelector("tbody a").setAttribute("aria-labelledby", "known-literal");
    },
    (d) => d.querySelector("tbody a").setAttribute("aria-describedby", "known-literal"),
    (d) => d.querySelector("tbody a").setAttribute("title", "CANARIO_PRIVADO"),
    (d) => d.querySelector("tbody a").setAttribute("aria-label", "Abrir outra competência"),
    (d) => d.querySelector("tbody a span").setAttribute("aria-label", "Competências"),
    (d) => (d.querySelector("tbody a span").textContent = "Competências"),
    (d) => d.querySelector("tbody a").appendChild(d.createElement("span")),
  ]) {
    const { dom, w, run } = privacy78Browser(privacy112Fixture());
    try {
      mutate(w.document);
      assert.equal(run("privacy112FieldAnchor", { proof: privacy78Proof }), null);
    } finally {
      dom.window.close();
    }
  }
});

test("FAIL_UI diagnóstico: consumidor real decide aborto sem ler getters ou erro nulo", () => {
  const consume = fn("recordCaseFailure");
  let reads = 0;
  const poison = {};
  for (const key of ["name", "code", "message", "stack", "cause"])
    Object.defineProperty(poison, key, {
      get() {
        reads++;
        throw Error("NEVER_EXPORT");
      },
    });
  for (const error of [poison, null, undefined, "NEVER_EXPORT"]) {
    const record = {};
    assert.doesNotThrow(() => consume(record, error, "PRIVACY_PRIMARY", null, false));
    assert.equal(record.status, "FAIL_UI");
    assert.equal(record.diagnostic.errorKind, "OTHER");
    assert.equal(JSON.stringify(record).includes("NEVER_EXPORT"), false);
  }
  assert.equal(reads, 0);
  const deployment = Object.assign(new Error("NEVER_EXPORT"), { code: "DEPLOYMENT_CHANGED" });
  for (const [error, fenceFailed] of [
    [deployment, false],
    [poison, true],
  ]) {
    const record = {};
    assert.throws(
      () => consume(record, error, "CASE_NAVIGATION", null, fenceFailed),
      (caught) => caught === error,
    );
    assert.deepEqual(record, {});
  }
  assert.equal(reads, 0);
});

test("R2 nonce corrente rejeita R1 e historico reconhece apenas R1 consumido", () => {
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261108-r1",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => fn("parseSingleRequest")(JSON.stringify(row), "fixtures"));
  assert.equal(
    fn("parseSingleRequest")(JSON.stringify(row), "fixtures", { historical: true }).request_id,
    row.request_id,
  );
  assert.throws(() =>
    fn("parseSingleRequest")(JSON.stringify({ ...row, request_id: "unknown" }), "fixtures", {
      historical: true,
    }),
  );
});

test("popup policy: launch args are closed and require the restrictive switch", () => {
  const args = fn("nativeBrowserArgs")(9222);
  assert.deepEqual(args, ["--remote-debugging-port=9222", "--block-new-web-contents"]);
  assert.deepEqual(fn("nativeBrowserArgs")(9222, true), [
    ...args,
    "--proxy-bypass-list=<-loopback>",
  ]);
  for (const port of [undefined, 0, -1, 1.5, 65536, "9222"])
    assert.throws(() => fn("nativeBrowserArgs")(port), { code: "BROWSER_POLICY" });
});
function popupPolicyFixture({
  executablePath = "/trusted/chrome-headless-shell",
  debugPort = 9222,
  proxy,
} = {}) {
  const path = require("node:path");
  const root = path.dirname(require.resolve("playwright-core/package.json"));
  const { chromiumSwitches } = require(path.join(root, "lib/server/chromium/chromiumSwitches.js"));
  const args = [
    executablePath,
    ...chromiumSwitches(false),
    "--enable-unsafe-swiftshader",
    "--headless",
    "--hide-scrollbars",
    "--mute-audio",
    "--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
    ...(proxy === undefined ? [] : ["--proxy-server=" + proxy, "--proxy-bypass-list=<-loopback>"]),
    ...fn("nativeBrowserArgs")(debugPort, proxy !== undefined),
    "--user-data-dir=" +
      path.join(require("node:os").tmpdir(), "playwright_chromiumdev_profile-Test123"),
    "--remote-debugging-pipe",
    "--no-startup-window",
    "--use-gl=angle",
    "--use-angle=swiftshader-webgl",
    "--ozone-platform=headless",
    "--allow-pre-commit-input",
  ];
  return { args, expected: { executablePath, debugPort, proxy } };
}
test("popup policy: actual command line and version reject missing overrides and unsafe switches", () => {
  const check = fn("verifyNativeBrowserPolicy");
  const { args, expected } = popupPolicyFixture();
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  assert.equal(check(args, version, expected), true);
  for (const bad of [
    null,
    {},
    [],
    args.slice(0, 2),
    [...args, "--block-new-web-contents"],
    [...args, "--block-new-web-contents=false"],
    [...args, "--no-sandbox=false"],
    [...args, "--disable-web-security=false"],
    [...args, "--disable-setuid-sandbox"],
    [...args, "--ignore-certificate-errors=true"],
    [...args, "--allow-running-insecure-content"],
    [...args, null],
    [...args, "SYNTHETIC_SECRET_CANARY\n"],
  ])
    assert.throws(() => check(bad, version, expected), { code: "BROWSER_POLICY" });
  for (const product of ["Chrome/145.0.7632.6", "HeadlessChrome/146.0.0.0", undefined])
    assert.throws(() => check(args, { product }, expected), { code: "BROWSER_POLICY" });
});
test("popup policy: both authenticated consumers and native tests use the proved launcher", async () => {
  const { readFile } = await import("node:fs/promises");
  const audit = await readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const preparer = await readFile(
    new URL("./prepare-visual-fixtures.mjs", import.meta.url),
    "utf8",
  );
  assert.equal(/browser = await launchNativeBrowser\(/.test(audit), true);
  assert.equal(
    /await tracedPreparation\("PREFLIGHT", async \(\) =>\s*launchNativeBrowser\(/.test(preparer),
    true,
  );
  assert.equal(/chromium\.launch\(/.test(preparer), false);
});

test("popup policy: unknown binary blocks before filesystem access or browser launch", async () => {
  const ts = await import("typescript");
  const { readFile } = await import("node:fs/promises");
  const text = await readFile(new URL("./authenticated-visual-audit.mjs", import.meta.url), "utf8");
  const file = ts.createSourceFile(
    "audit.mjs",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const identity = file.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "nativeBinaryIdentity",
  );
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const check = new AsyncFunction(
    "path",
    "isAbsolute",
    "lstat",
    "fail",
    identity.body.getText(file).slice(1, -1),
  );
  let accesses = 0;
  const fail = (code) => {
    throw Object.assign(Error(code), { code });
  };
  for (const path of [
    "relative/chrome",
    "/untrusted/chrome",
    "/cache/chromium_headless_shell-1209/chrome-headless-shell-linux64/chrome-headless-shell",
  ])
    await assert.rejects(
      check(
        path,
        require("node:path").isAbsolute,
        () => {
          accesses++;
        },
        fail,
      ),
      { code: "BROWSER_BINARY" },
    );
  assert.equal(accesses, 0);
});

async function popupPolicyVariants() {
  const { chromium } = await import("playwright");
  const traffic = { connections: 0, bytes: 0, requests: 0 };
  const canary = createHttpServer((_req, res) => {
    traffic.requests++;
    res.end("canary");
  });
  canary.on("connection", (socket) => {
    traffic.connections++;
    socket.on("data", (data) => (traffic.bytes += data.length));
  });
  await new Promise((r) => canary.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${canary.address().port}/canary`;
  let browser, context, fence;
  try {
    // Unrestricted control is test-only and never receives credentials.
    browser = await chromium.launch({ chromiumSandbox: true });
    assert.equal(browser.version(), "145.0.7632.6");
    context = await browser.newContext();
    const control = await context.newPage();
    const opened = context.waitForEvent("page");
    await control.evaluate((url) => window.open(url), url);
    await (await opened).waitForLoadState();
    assert.ok(traffic.connections > 0 && traffic.bytes > 0 && traffic.requests > 0);
    await browser.close();
    browser = null;
    canary.closeAllConnections();
    for (const mode of ["open", "noopener", "anchor", "form"]) {
      traffic.connections = traffic.bytes = traffic.requests = 0;
      const debug = createHttpServer();
      await new Promise((r) => debug.listen(0, "127.0.0.1", r));
      const port = debug.address().port;
      await new Promise((r) => debug.close(r));
      browser = await fn("launchNativeBrowser")({ debugPort: port });
      context = await browser.newContext({ serviceWorkers: "block" });
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      const { targetInfo } = await session.send("Target.getTargetInfo");
      await session.detach();
      const detected = Promise.withResolvers(),
        release = Promise.withResolvers();
      let closePending;
      fence = await fn("installNativeFence")({
        debugPort: port,
        identity: targetInfo,
        verifyResponse: async () => true,
        closeContext: () => {
          detected.resolve();
          closePending = release.promise.then(() => context.close());
          return closePending;
        },
      });
      try {
        await page.evaluate(
          ({ url, mode }) => {
            if (mode === "open") window.open(url);
            else if (mode === "noopener") window.open(url, "_blank", "noopener");
            else if (mode === "anchor") {
              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.rel = "noopener";
              document.body.append(a);
              a.click();
            } else {
              const f = document.createElement("form");
              f.action = url;
              f.target = "_blank";
              f.method = "POST";
              document.body.append(f);
              f.submit();
            }
          },
          { url, mode },
        );
        await Promise.race([
          detected.promise,
          new Promise((_, reject) => {
            const timer = setTimeout(() => reject(Error("popup not detected")), 3000);
            timer.unref();
          }),
        ]);
        await new Promise((r) => setTimeout(r, 150));
        assert.deepEqual(traffic, { connections: 0, bytes: 0, requests: 0 });
        assert.equal(fence.snapshot().failureCode, "FENCE_POPUP");
        assert.ok(fence.snapshot().popups > 0);
      } finally {
        release.resolve();
        await closePending;
        fence.close();
        fence = null;
        await browser.close();
        browser = null;
      }
    }
  } finally {
    fence?.close();
    await browser?.close();
    canary.closeAllConnections();
    await new Promise((r) => canary.close(r));
  }
}

async function launchIsolatedProvedBrowser(chromium) {
  const debug = createHttpServer();
  await new Promise((r) => debug.listen(0, "127.0.0.1", r));
  const port = debug.address().port;
  await new Promise((r) => debug.close(r));
  return fn("launchNativeBrowser")({ debugPort: port });
}

test("popup policy: actual launcher closes on post-launch command or identity failure", async () => {
  const { readFile } = await import("node:fs/promises");
  const ts = await import("typescript");
  const { dirname, join, isAbsolute } = await import("node:path");
  const source = await readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const file = ts.createSourceFile(
    "audit.mjs",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const launch = file.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "launchNativeBrowser",
  );
  assert.ok(launch?.body);
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const run = new AsyncFunction(
    "chromium",
    "debugPort",
    "proxy",
    "require",
    "readFile",
    "process",
    "isAbsolute",
    "dirname",
    "join",
    "nativeBinaryIdentity",
    "nativeBrowserArgs",
    "browserEnvironment",
    "verifyNativeBrowserPolicy",
    "fail",
    "let browser;" +
      launch.body
        .getText(file)
        .slice(1, -1)
        .replace("let browser;", "")
        .replace('const { chromium } = await import("playwright");', ""),
  );
  const expected =
    "/cache/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell";
  for (const scenario of [
    "command",
    "version",
    "identity",
    "detach",
    "unknown",
    "bare-port",
    "proxy-override",
  ]) {
    let closed = false,
      contexts = 0;
    const browser = {
      close: async () => {
        closed = true;
      },
      newContext: () => {
        contexts++;
      },
      newBrowserCDPSession: async () => ({
        send: async (method) => {
          if (scenario === "command") throw Error("SYNTHETIC_SECRET_CANARY");
          return method === "Browser.getVersion"
            ? {
                product:
                  scenario === "version" ? "Chrome/145.0.7632.6" : "HeadlessChrome/145.0.7632.6",
              }
            : {
                arguments: [
                  ...popupPolicyFixture({
                    executablePath: scenario === "identity" ? "/foreign" : expected,
                  }).args,
                  ...(scenario === "unknown" ? ["--unknown-switch=false"] : []),
                  ...(scenario === "bare-port" ? ["--remote-debugging-port", "0"] : []),
                  ...(scenario === "proxy-override"
                    ? ["--proxy-server=http://foreign.invalid:8181"]
                    : []),
                ],
              };
        },
        detach: async () => {
          if (scenario === "detach") throw Error("SYNTHETIC_SECRET_CANARY");
        },
      }),
    };
    const chromium = {
      executablePath: () => "/cache/chromium-1208/chrome-linux64/chrome",
      launch: async (options) => {
        assert.equal(options.chromiumSandbox, true);
        assert.equal(options.executablePath, expected);
        return browser;
      },
    };
    const fail = (code) => {
      const error = Error(code);
      error.code = code;
      throw error;
    };
    await assert.rejects(
      run(
        chromium,
        9222,
        undefined,
        require,
        readFile,
        { platform: "linux", arch: "x64", env: {} },
        isAbsolute,
        dirname,
        join,
        async (path) => path,
        fn("nativeBrowserArgs"),
        fn("browserEnvironment"),
        fn("verifyNativeBrowserPolicy"),
        fail,
      ),
      (error) =>
        error.code === "BROWSER_POLICY" && !String(error).includes("SYNTHETIC_SECRET_CANARY"),
    );
    assert.equal(closed, true);
    assert.equal(contexts, 0);
  }
});

test("popup policy: unknown argv and bare overrides never authorize the real launcher", () => {
  const check = fn("verifyNativeBrowserPolicy");
  const { args, expected } = popupPolicyFixture();
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  for (const extra of [
    ["--proxy-server=http://foreign.invalid:8181"],
    ["--remote-debugging-address=0.0.0.0"],
    ["--disable-blink-features=BlockCredentialedSubresources"],
    ["--remote-debugging-port", "0"],
    ["--unknown-switch=false"],
  ])
    assert.throws(() => check([...args, ...extra], version, expected), { code: "BROWSER_POLICY" });
});

test("popup policy: exact proxy context rejects replacement omission duplication and positional overrides", () => {
  const { args, expected } = popupPolicyFixture({ proxy: "http://127.0.0.1:8181" });
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  const check = fn("verifyNativeBrowserPolicy");
  assert.equal(check(args, version, expected), true);
  for (const bad of [
    args.filter((a) => !a.startsWith("--proxy-server=")),
    args.map((a) => (a.startsWith("--proxy-server=") ? "--proxy-server=http://127.0.0.1:8182" : a)),
    [...args, "--proxy-bypass-list=*"],
    [...args, "--headless"],
    [...args, "--headless=false"],
    [...args, "--remote-debugging-port=0"],
    [...args, "--disable-features=WebSecurity"],
    [...args, "--disable-web-security=false"],
    [...args, "about:blank"],
    args.map((a) => (a.startsWith("--user-data-dir=") ? "--user-data-dir=/foreign/profile" : a)),
  ])
    assert.throws(() => check(bad, version, expected), { code: "BROWSER_POLICY" });
  assert.throws(() => check(args, version), { code: "BROWSER_POLICY" });
  assert.throws(() => check(args, version, { ...expected, debugPort: 9223 }), {
    code: "BROWSER_POLICY",
  });
  assert.throws(() => check(args, version, { ...expected, proxy: undefined }), {
    code: "BROWSER_POLICY",
  });
});

test("popup policy: production launcher resolves pinned SDK internally without injected chromium", async () => {
  const ts = await import("typescript");
  const { readFile } = await import("node:fs/promises");
  const text = await readFile(new URL("./authenticated-visual-audit.mjs", import.meta.url), "utf8");
  const file = ts.createSourceFile(
    "audit.mjs",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const launch = file.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "launchNativeBrowser",
  );
  assert.ok(launch);
  assert.equal(
    launch.parameters[0].name.elements.some((node) => node.name?.text === "chromium"),
    false,
  );
  const body = launch.body.getText(file);
  assert.ok(body.indexOf('await import("playwright")') < body.indexOf("chromium.launch"));
  assert.ok(body.includes('require("playwright/package.json").version'));
  assert.ok(body.includes('"browsers.json"'));
  assert.ok(body.indexOf('shells[0].revision !== "1208"') < body.indexOf("chromium.launch"));
});

const OBSERVED_GRAPHICS = [
  "--use-gl=angle",
  "--use-angle=swiftshader-webgl",
  "--ozone-platform=headless",
];
test("popup policy: pinned Shell internal graphics tokens must match observed argv exactly", () => {
  const { args, expected } = popupPolicyFixture();
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  const observed = [...args.filter((a) => !OBSERVED_GRAPHICS.includes(a)), ...OBSERVED_GRAPHICS];
  assert.equal(fn("verifyNativeBrowserPolicy")(observed, version, expected), true);
  for (const token of OBSERVED_GRAPHICS) {
    const name = token.split("=")[0];
    for (const bad of [
      observed.filter((a) => a !== token),
      [...observed, token],
      observed.map((a) => (a === token ? name + "=unknown" : a)),
      observed.map((a) => (a === token ? token.slice(1) : a)),
    ])
      assert.throws(() => fn("verifyNativeBrowserPolicy")(bad, version, expected), {
        code: "BROWSER_POLICY",
      });
  }
});
test("popup policy: single-prefix bypasses and switch terminator never pass", () => {
  const { args, expected } = popupPolicyFixture();
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  for (const extra of [
    ["-no-sandbox"],
    ["-disable-web-security=false"],
    ["-remote-debugging-port=0"],
    ["--"],
  ])
    assert.throws(() => fn("verifyNativeBrowserPolicy")([...args, ...extra], version, expected), {
      code: "BROWSER_POLICY",
    });
});

test("popup policy: attested pre-commit flag multiplicity is exactly two", () => {
  const { args, expected } = popupPolicyFixture();
  const version = { product: "HeadlessChrome/145.0.7632.6" };
  assert.equal(args.filter((a) => a === "--allow-pre-commit-input").length, 2);
  assert.equal(fn("verifyNativeBrowserPolicy")(args, version, expected), true);
  const stripped = args.filter((a) => a !== "--allow-pre-commit-input");
  for (const count of [0, 1, 3])
    assert.throws(
      () =>
        fn("verifyNativeBrowserPolicy")(
          [...stripped, ...Array(count).fill("--allow-pre-commit-input")],
          version,
          expected,
        ),
      { code: "BROWSER_POLICY" },
    );
});

test("popup policy: POSIX aliases terminator and duplicate debugging switches fail closed", () => {
  const check = fn("verifyNativeBrowserPolicy"),
    version = { product: "HeadlessChrome/145.0.7632.6" };
  const { args, expected } = popupPolicyFixture();
  assert.equal(check(args, version, expected), true);
  for (const value of [
    "-no-sandbox",
    "-disable-web-security=true",
    "-remote-debugging-port=9333",
    "--remote-debugging-port",
    "-block-new-web-contents",
    "-headless",
    "--unsafely-treat-insecure-origin-as-secure=http://127.0.0.1",
  ])
    assert.throws(() => check([...args, value], version, expected), { code: "BROWSER_POLICY" });
  assert.throws(() => check([args[0], "--", ...args.slice(1)], version, expected), {
    code: "BROWSER_POLICY",
  });
});

test("R3 only current nonce executes and exact R1 R2 remain spent", () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  for (const nonce of [
    "trilha-a-fixtures-20261108-r1",
    "trilha-a-fixtures-20261109-r2",
    "trilha-a-fixtures-20261109-r3",
  ]) {
    const raw = JSON.stringify({ ...request, request_id: nonce });
    assert.throws(() => sut.parseSingleRequest(raw), /REQUEST_SCHEMA/);
    assert.equal(sut.parseSingleRequest(raw, undefined, { historical: true }).request_id, nonce);
  }
});

const privacy123Raw = JSON.parse(
  await (
    await import("node:fs/promises")
  ).readFile(
    new URL(
      "../../docs/frontend/auditorias/evidencias/privacy-v123-20261109/PROVENIENCIA_V123_READONLY.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
function privacy123Values(event) {
  return privacy123Raw.visible_columns.map(({ catalog_field }) => event[catalog_field]);
}
function privacy123Texts() {
  const fieldSnapshots = privacy123Raw.events.map((event, catalogIndex) => {
    const values = privacy123Values(event);
    const cells = values.map((value) => '- cell "' + value + '"');
    return {
      catalogIndex,
      rendered: values.join("\t"),
      row: '- row "' + values.join(" ") + '":\n' + cells.map((cell) => "  " + cell).join("\n"),
      cells,
    };
  });
  return {
    rendered: "Trilha de auditoria\n" + fieldSnapshots.map((x) => x.rendered).join("\n"),
    snapshot:
      '- heading "Trilha de auditoria" [level=1]\n- region "Eventos de auditoria":\n  - table:\n' +
      fieldSnapshots.map((x) => "    " + x.row.replaceAll("\n", "\n    ")).join("\n"),
    fieldSnapshots,
  };
}
function privacy123Fixture() {
  const escape = (s) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  const labels = [
    "Evento",
    "Entidade",
    "ID do usuário",
    "Correlation ID",
    "Data inicial",
    "Data final",
  ];
  return (
    '<header aria-label="Organização atual">ContaOS HML Teste Situação: ativa</header><main><header><h1>Trilha de auditoria</h1><p>Histórico de eventos da organização. Informações sensíveis não são exibidas.</p></header><section aria-label="Filtros de auditoria" class="grid">' +
    labels
      .map(
        (label, i) =>
          '<label class="flex flex-col">' +
          label +
          "<input" +
          (i >= 4 ? ' type="date"' : "") +
          "></label>",
      )
      .join("") +
    '</section><div role="region" aria-label="Eventos de auditoria" tabindex="0"><table><caption>Eventos de auditoria da organização</caption><thead><tr>' +
    privacy123Raw.visible_columns
      .map(({ label }) => '<th scope="col">' + label + "</th>")
      .join("") +
    "</tr></thead><tbody>" +
    privacy123Raw.events
      .map(
        (e) =>
          "<tr>" +
          privacy123Values(e)
            .map((value) => '<td class="break-words">' + escape(value) + "</td>")
            .join("") +
          "</tr>",
      )
      .join("") +
    '</tbody></table></div><nav aria-label="Paginação da auditoria" class="flex"><button disabled>Anterior</button><span aria-live="polite">Página 1</span><button disabled>Próxima</button></nav></main>'
  );
}
function privacy123Receipt() {
  return Object.freeze({
    route: privacy123Raw.context.route,
    age: 1,
    observed: Object.freeze(["v123_events_page0"]),
  });
}
test("privacy123 RED real classifier requires sealed catalog and original full field intervals", async () => {
  const proof = await fn("loadPrivacy78Proof")(),
    texts = privacy123Texts();
  const words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
  assert.equal(fn("classifyArtifactText")(texts.rendered, words).reason, "UNKNOWN_WORDS");
  assert.equal(
    fn("classifyArtifactText")(texts.snapshot, words, { snapshot: true }).reason,
    "UNKNOWN_WORDS",
  );
  const v123Proof = await fn("loadPrivacy123Proof")();
  const input = { proof, v123Proof, ...texts, anchored: true, receipt: privacy123Receipt() };
  const fieldContext = fn("privacy123FieldContext")(input);
  assert.ok(fieldContext);
  for (const channel of ["rendered", "snapshot"])
    assert.equal(
      fn("classifyArtifactText")(texts[channel], words, {
        fieldContext,
        snapshot: channel === "snapshot",
      }).reason,
      "ALLOWED",
    );
  for (const delta of [
    { proof: privacy78Proof },
    { v123Proof: privacy123Raw },
    { anchored: false },
    { receipt: { ...input.receipt } },
    { receipt: Object.freeze({ ...input.receipt, route: "/" }) },
    { receipt: Object.freeze({ ...input.receipt, age: 120000 }) },
    { receipt: Object.freeze({ ...input.receipt, observed: Object.freeze([]) }) },
    { fieldSnapshots: [...texts.fieldSnapshots].reverse() },
    { rendered: texts.rendered + privacy123Raw.events[0].id_usuario },
    { rendered: texts.rendered + " " + privacy123Raw.events[0].origem },
    { rendered: texts.rendered + " " + privacy123Raw.events[0].id_entidade },
    { snapshot: texts.snapshot + " " + privacy123Raw.events[0].criado_em },
    { snapshot: texts.snapshot + texts.fieldSnapshots[0].cells[0] },
  ])
    assert.equal(fn("privacy123FieldContext")({ ...input, ...delta }), null);
  for (const suffix of [
    " CANARIO_PRIVADO",
    " pessoa@example.com",
    " Bearer secret",
    " 123.456.789-00",
  ]) {
    for (const channel of ["rendered", "snapshot"]) {
      const changed = { ...input, [channel]: texts[channel] + suffix };
      const ctx = fn("privacy123FieldContext")(changed);
      assert.notEqual(
        fn("classifyArtifactText")(changed[channel], words, {
          fieldContext: ctx,
          snapshot: channel === "snapshot",
        }).reason,
        "ALLOWED",
      );
    }
  }
});
test("privacy123 RED exact ordered eight-key GET rejects drift and unknown projection", () => {
  const runtime = fn("privacy78Runtime")({
    proof: privacy78Proof,
    wireProof: privacyWireRaw,
    v123Proof: privacy123Raw,
  });
  const c = privacy123Raw.get_contract,
    url = API + c.path + "?" + new URLSearchParams(c.query);
  assert.equal(runtime.match(url, "GET")?.name, "v123_events_page0");
  const rows = privacy123Raw.events.map(({ formatted_created, ...row }) => row);
  assert.deepEqual(runtime.project(c, rows), { name: c.name, exact: true });
  for (const bad of [url + "&extra=1", url + "&limit=25", url.replace(API, HML)])
    assert.equal(runtime.match(bad, "GET"), null);
  for (const mutate of [
    (a) => a.pop(),
    (a) => a.push({ ...a[0] }),
    (a) => a.reverse(),
    (a) => (a[0].id = a[1].id),
    (a) => (a[0].origem += "x"),
    (a) => (a[0].id_usuario = null),
    (a) => (a[0].correlation_id = ["foreign"]),
    (a) => (a[0].criado_em = "2026-11-09T00:40:31.843519+00:00"),
    (a) => (a[0].extra = "CANARIO_PRIVADO"),
  ]) {
    const bad = structuredClone(rows);
    mutate(bad);
    assert.equal(runtime.project(c, bad), null);
  }
});
test("privacy123 RED DOM maps unique complete tuples and rejects copied hidden or changed cells", () => {
  for (const mutate of [
    null,
    (d) => d.querySelector("tbody td").setAttribute("aria-label", "CANARIO_PRIVADO"),
    (d) => d.querySelector("tbody").appendChild(d.querySelector("tbody tr").cloneNode(true)),
    (d) => d.querySelector("tbody tr").remove(),
    (d) => (d.querySelector("input").value = "CANARIO_PRIVADO"),
    (d) => (d.querySelector("thead th").textContent = "Outro"),
    (d) => d.querySelector("tbody td").appendChild(d.createElement("span")),
  ]) {
    const { dom, w, run } = privacy78Browser(privacy123Fixture());
    try {
      if (mutate) mutate(w.document);
      assert.equal(!!run("privacy123FieldAnchor", { proof: privacy123Raw }), !mutate);
    } finally {
      dom.window.close();
    }
  }
});

test("privacy123 native boundary requires factual complete supplemental TAP before proof", async () => {
  const good =
    "ok 1 - privacy123 Chromium full DOM ARIA matrix binds approved ordered page\n# tests 1\n# pass 1\n# fail 0\n# skipped 0\n# cancelled 0\n";
  assert.equal(fn("privacy123Supplement")(good), 1);
  for (const bad of [
    "",
    good.replace("# pass 1", "# pass 0"),
    good.replace("# skipped 0", "# skipped 1"),
    good + "# tests 1\n",
  ])
    assert.equal(fn("privacy123Supplement")(bad), null);
  const { readFile } = await import("node:fs/promises"),
    ts = await import("typescript");
  const source = await readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile(
    "auditor.mjs",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const guard = ast.statements
    .find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "nativeGuard")
    .getText(ast);
  assert.ok(guard.includes("--test-name-pattern=^privacy123 Chromium full DOM ARIA matrix"));
  assert.ok(
    guard.indexOf("privacy123Supplement(supplement.stdout)") <
      guard.indexOf('await mkdir(".audit-work"'),
  );
});
test(
  "privacy123 Chromium full DOM ARIA matrix binds approved ordered page",
  { skip: process.env.CONTAOS_NATIVE_GUARD !== "1", timeout: 45000 },
  async () => {
    const { chromium } = await import("playwright"),
      { readFile } = await import("node:fs/promises");
    const sdkFile = require.resolve("@supabase/postgrest-js").replace(/index\.cjs$/, "index.mjs");
    const sdkModule = "data:text/javascript;base64," + (await readFile(sdkFile)).toString("base64");
    const proof = await fn("loadPrivacy78Proof")(),
      v123Proof = await fn("loadPrivacy123Proof")();
    const wireProof = await fn("loadPrivacyWireProof")(),
      words = await fn("literalWords")(new URL("../../", import.meta.url).pathname);
    const browser = await chromium.launch({ chromiumSandbox: true });
    let matrix = 0;
    try {
      for (const width of [1440, 1280, 768, 390])
        for (const theme of ["light", "dark"]) {
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            colorScheme: theme,
            serviceWorkers: "block",
          });
          try {
            const html =
              '<meta charset="utf-8"><style>.grid{display:grid}.flex{display:flex}.flex-col{flex-direction:column}table{min-width:48rem;table-layout:fixed}td{overflow-wrap:anywhere}caption{position:absolute;width:1px;height:1px;overflow:hidden}div[role=region]{overflow-x:auto}</style>' +
              privacy123Fixture();
            await page.route("**/*", (route) =>
              route.fulfill({ contentType: "text/html", body: html }),
            );
            await page.goto(HML + v123Proof.context.route);
            await page.evaluate(
              (dark) => document.documentElement.classList.toggle("dark", dark),
              theme === "dark",
            );
            await page.evaluate(
              ({ data }) => {
                window.__v123SyntheticBody = data;
                window.__v123SyntheticCalls = 0;
                window.fetch = function (url) {
                  window.__v123SyntheticCalls++;
                  const response = new Response(JSON.stringify(window.__v123SyntheticBody), {
                    status: 200,
                    headers: { "content-range": "0-9/10" },
                  });
                  Object.defineProperty(response, "url", { value: String(url) });
                  return Promise.resolve(response);
                };
              },
              { data: v123Proof.events.map(({ formatted_created, ...row }) => row) },
            );
            await page.evaluate(fn("privacy78Runtime"), {
              proof,
              wireProof,
              v123Proof,
              install: true,
            });
            assert.deepEqual(
              await page.evaluate(() => window.__contaosPrivacy78.read().observed),
              [],
            );
            const sdkResult = await page.evaluate(
              async ({ sdkModule, origin, organization }) => {
                const { PostgrestClient } = await import(sdkModule);
                const client = new PostgrestClient(origin + "/rest/v1", { fetch: window.fetch });
                const result = await client
                  .from("eventos_auditoria")
                  .select(
                    "id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id",
                    { count: "exact" },
                  )
                  .eq("id_organizacao", organization)
                  .order("criado_em", { ascending: false })
                  .order("id", { ascending: false })
                  .range(0, 24);
                return { rows: result.data?.length, sdkCount: result.count, error: !!result.error };
              },
              { sdkModule, origin: API, organization: v123Proof.context.organization },
            );
            assert.deepEqual(sdkResult, { rows: 10, sdkCount: 10, error: false });
            await page.waitForFunction(() =>
              window.__contaosPrivacy78?.read()?.observed.includes("v123_events_page0"),
            );
            assert.equal(await page.evaluate(() => window.__v123SyntheticCalls), 1);
            const collect = async () => {
              const anchor = await page.evaluate(fn("privacy123FieldAnchor"), { proof: v123Proof });
              assert.ok(anchor, "complete source DOM");
              const fieldSnapshots = await fn("privacy123FieldSnapshots")(page, anchor);
              const rendered = await page.evaluate(() => {
                const values = [document.body.innerText];
                for (const e of document.querySelectorAll(
                  "input,textarea,select,[aria-label],[title],[placeholder]",
                ))
                  if (e.getClientRects().length && getComputedStyle(e).visibility !== "hidden") {
                    for (const key of ["aria-label", "title", "placeholder"])
                      if (e.getAttribute(key)) values.push(e.getAttribute(key));
                    if ("value" in e && e.value) values.push(e.value);
                  }
                return values.join("\n");
              });
              const snapshot = await page.locator("body").ariaSnapshot();
              const receipt = await page.evaluate(() => window.__contaosPrivacy78.read());
              const input = {
                proof,
                v123Proof,
                rendered,
                snapshot,
                fieldSnapshots,
                anchored: true,
                receipt:
                  receipt &&
                  Object.freeze({
                    ...receipt,
                    route: v123Proof.context.route,
                    observed: Object.freeze(receipt.observed),
                  }),
              };
              return { input, context: fn("privacy123FieldContext")(input) };
            };
            const original = await collect();
            assert.ok(original.context, "100 ARIA and 50 rendered cell intervals");
            for (const channel of ["rendered", "snapshot"])
              assert.equal(
                fn("classifyArtifactText")(original.input[channel], words, {
                  fieldContext: original.context,
                  snapshot: channel === "snapshot",
                }).reason,
                "ALLOWED",
              );
            await page.evaluate(() => {
              const n = document.createElement("button");
              n.id = "negative";
              n.textContent = "Atualizar";
              n.setAttribute("aria-label", "CANARIO_PRIVADO");
              document.body.append(n);
            });
            const unknown = await collect();
            for (const channel of ["rendered", "snapshot"])
              assert.notEqual(
                fn("classifyArtifactText")(unknown.input[channel], words, {
                  fieldContext: unknown.context,
                  snapshot: channel === "snapshot",
                }).reason,
                "ALLOWED",
              );
            await page.locator("#negative").evaluate((n) => {
              n.textContent = "pessoa@example.com";
              n.removeAttribute("aria-label");
            });
            const sensitive = await collect();
            for (const channel of ["rendered", "snapshot"])
              assert.equal(
                fn("classifyArtifactText")(sensitive.input[channel], words, {
                  fieldContext: sensitive.context,
                  snapshot: channel === "snapshot",
                }).reason,
                "SENSITIVE_PATTERN",
              );
            await page.locator("#negative").evaluate((n) => n.remove());
            await page.evaluate((actor) => {
              const n = document.createElement("p");
              n.id = "copy";
              n.textContent = actor;
              document.body.append(n);
            }, v123Proof.events[0].id_usuario);
            assert.equal((await collect()).context, null);
            await page.locator("#copy").evaluate((n) => n.remove());
            await page
              .locator("tbody tr")
              .first()
              .evaluate((n) => n.setAttribute("aria-labelledby", "known-literal"));
            assert.equal(
              await page.evaluate(fn("privacy123FieldAnchor"), { proof: v123Proof }),
              null,
            );
            await page
              .locator("tbody tr")
              .first()
              .evaluate((n) => n.removeAttribute("aria-labelledby"));
            await page.evaluate(() => window.dispatchEvent(new PopStateEvent("popstate")));
            assert.equal(await page.evaluate(() => window.__contaosPrivacy78.read()), null);
            matrix++;
          } finally {
            await page.close();
          }
        }
      assert.equal(matrix, 8);
    } finally {
      await browser.close();
    }
  },
);

test("privacy123 header must retain the single source row and five semantic columns", () => {
  const { dom, w, run } = privacy78Browser(privacy123Fixture());
  try {
    const head = w.document.querySelector("thead"),
      row = w.document.createElement("tr");
    row.append(head.firstElementChild.lastElementChild);
    head.append(row);
    assert.equal(run("privacy123FieldAnchor", { proof: privacy123Raw }), null);
  } finally {
    dom.window.close();
  }
});
test("privacy123 source blobs and all exact formatted instants remain catalog-bound", async () => {
  const { readFile } = await import("node:fs/promises"),
    { createHash } = await import("node:crypto");
  for (const source of privacy123Raw.sources) {
    const bytes = await readFile(new URL("../../" + source.path, import.meta.url));
    assert.equal(
      createHash("sha1")
        .update("blob " + bytes.length + "\0")
        .update(bytes)
        .digest("hex"),
      source.blob,
    );
  }
  const fmt = new Intl.DateTimeFormat(privacy123Raw.formatter.locale, {
    timeZone: privacy123Raw.formatter.timeZone,
    dateStyle: "short",
    timeStyle: "medium",
  });
  for (const event of privacy123Raw.events)
    assert.equal(fmt.format(new Date(event.criado_em)), event.formatted_created);
});

test("R3 native supplement rejects incomplete skipped fabricated or failed TAP", () => {
  for (const tap of [
    "",
    "TAP version 13\n1..2\n# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0",
    "not ok 1 - failure",
  ])
    assert.equal(sut.preparerSourceFormsSupplement(tap), null);
});

async function r5R4Fixture() {
  const { execFileSync } = await import("node:child_process");
  const repo = { full_name: "contaos999999/contaos-hml-control" };
  const definitions = [
    [
      42568309807,
      406076025,
      "contaos-frontend-zero-drift.yml",
      "push",
      "failure",
      "2026-11-09T05:36:46Z",
      "2026-11-09T05:37:28Z",
    ],
    [
      42568382053,
      411426169,
      "contaos-trilha-a-fixtures.yml",
      "workflow_run",
      "skipped",
      "2026-11-09T05:37:31Z",
      "2026-11-09T05:37:41Z",
    ],
    [
      42568382029,
      411115674,
      "contaos-trilha-a-authenticated.yml",
      "workflow_run",
      "skipped",
      "2026-11-09T05:37:31Z",
      "2026-11-09T05:37:32Z",
    ],
  ];
  const runs = definitions.map(
    ([id, workflow_id, path, event, conclusion, created_at, updated_at]) => ({
      id,
      workflow_id,
      path: ".github/workflows/" + path,
      event,
      conclusion,
      created_at,
      updated_at,
      head_sha: R5_R4_HEAD,
      head_branch: "main",
      run_attempt: 1,
      status: "completed",
      repository: repo,
      head_repository: repo,
    }),
  );
  const skipped = (id, name) => ({
    id,
    name,
    status: "completed",
    conclusion: "skipped",
    steps: [],
  });
  const jobs = [
    [
      {
        id: 128999621110,
        name: "ContaOS Frontend Zero-Drift",
        status: "completed",
        conclusion: "failure",
        steps: [{ name: "Setup Bun", status: "completed", conclusion: "failure" }],
      },
      {
        id: 128999621372,
        name: "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
        status: "completed",
        conclusion: "success",
        steps: [],
      },
    ],
    [
      skipped(128999841934, "Trilha A solicitacao unica sem credenciais"),
      skipped(128999842395, "Trilha A protocolo e Chromium sem credenciais"),
      skipped(128999842616, "Trilha A preparacao sintetica HML"),
    ],
    [
      skipped(128999842036, "Trilha A solicitacao unica sem credenciais"),
      skipped(128999885461, "Trilha A auditoria privada HML"),
      skipped(128999889276, "Trilha A protocolo e Chromium sem credenciais"),
    ],
  ];
  const requests = [];
  const get = async (path) => {
    requests.push(path);
    for (let i = 0; i < runs.length; i++) {
      const r = runs[i];
      if (path === "/actions/runs/" + r.id) return structuredClone(r);
      if (path === "/actions/runs/" + r.id + "/attempts/1/jobs?per_page=100&page=1")
        return { total_count: jobs[i].length, jobs: structuredClone(jobs[i]) };
      if (
        path ===
        "/actions/workflows/" +
          r.workflow_id +
          "/runs?head_sha=" +
          R5_R4_HEAD +
          "&event=" +
          r.event +
          "&per_page=100&page=1"
      )
        return { total_count: 1, workflow_runs: [structuredClone(r)] };
    }
    throw Error("R5_UNEXPECTED_ENDPOINT");
  };
  const git = async (args) => {
    if (args[0] === "merge-base") return "";
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1048576 });
  };
  return { runs, jobs, get, git, requests };
}
test("R5 proves original R4 skipped private jobs through exact live metadata and source blobs", async () => {
  const f = await r5R4Fixture();
  const proof = await fn("verifyR4ZeroAuth")(f);
  assert.equal(proof.derivedNewBusinessIntents, 0);
  assert.equal(proof.headSha, R5_R4_HEAD);
  assert.equal(proof.proof, "GITHUB_ACTIONS_LIVE_METADATA");
  assert.equal(f.requests.length, 9);
  assert.equal(
    f.requests.some((x) => /logs|artifacts|auth|supabase/i.test(x)),
    false,
  );
  assert.equal(fn("validateR4ZeroAuthProof")(proof), true);
});
test("R5 rejects divergent R4 metadata private execution attempts duplicates and incomplete pagination", async () => {
  for (const mode of [
    "head",
    "runId",
    "attempt",
    "time",
    "private",
    "steps",
    "missing",
    "unknown",
    "duplicate",
    "extraRun",
    "http",
    "pagination",
  ]) {
    const f = await r5R4Fixture();
    if (mode === "head") f.runs[0].head_sha = "a".repeat(40);
    if (mode === "runId") f.runs[1].id++;
    if (mode === "attempt") f.runs[2].run_attempt = 2;
    if (mode === "time") f.runs[1].created_at = "2026-11-09T05:37:00Z";
    if (mode === "private") f.jobs[1][2].conclusion = "success";
    if (mode === "steps")
      f.jobs[2][1].steps = [{ name: "Auth canary-secret", conclusion: "success" }];
    if (mode === "missing") f.jobs[1].pop();
    if (mode === "unknown") f.jobs[2][0].name = "unknown";
    if (mode === "duplicate") f.jobs[1][0] = f.jobs[1][1];
    const get = async (path) => {
      if (mode === "http") throw Error("PRIVATE_CANARY_TOKEN_URL");
      const v = await f.get(path);
      if (path.includes("/runs?")) {
        if (mode === "extraRun")
          return {
            total_count: 2,
            workflow_runs: [...v.workflow_runs, { ...v.workflow_runs[0], id: 999 }],
          };
        if (mode === "pagination") return { total_count: 101, workflow_runs: v.workflow_runs };
      }
      return v;
    };
    await assert.rejects(
      () => fn("verifyR4ZeroAuth")({ ...f, get }),
      (e) => e.code === "RECOVERY_R4_PROOF" && !String(e).includes("CANARY"),
    );
  }
  const f = await r5R4Fixture();
  await assert.rejects(() => fn("verifyR4ZeroAuth")({ ...f, git: async () => "" }), {
    code: "RECOVERY_R4_PROOF",
  });
});
test("R8 is the only executable fixture nonce and R1 through R7 remain historical", () => {
  const req = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.equal(sut.parseSingleRequest(JSON.stringify(req)).request_id, req.request_id);
  for (const nonce of [
    "trilha-a-fixtures-20261108-r1",
    "trilha-a-fixtures-20261109-r2",
    "trilha-a-fixtures-20261109-r3",
    "trilha-a-fixtures-20261109-r4",
    "trilha-a-fixtures-20261109-r5",
    "trilha-a-fixtures-20261109-r6",
    "trilha-a-fixtures-20261109-r7",
  ]) {
    assert.throws(() => sut.parseSingleRequest(JSON.stringify({ ...req, request_id: nonce })), {
      code: "REQUEST_SCHEMA",
    });
    assert.equal(
      sut.parseSingleRequest(JSON.stringify({ ...req, request_id: nonce }), undefined, {
        historical: true,
      }).request_id,
      nonce,
    );
  }
});

test("R5 runtime refuses missing or forged R4 proof before exposing broker evidence", async () => {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import{getValidatedR4ZeroAuth}from'./scripts/hml/authenticated-visual-audit.mjs';try{getValidatedR4ZeroAuth();process.exitCode=2}catch(e){if(e.code!=='RECOVERY_R4_PROOF')process.exitCode=3;else console.log(e.code)}",
    ],
    { cwd: new URL("../../", import.meta.url), encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "RECOVERY_R4_PROOF");
  assert.equal(result.stderr, "");
  for (const value of [
    null,
    {},
    { ...sut.R4_ZERO_AUTH_PROOF, attempt: 2 },
    { ...sut.R4_ZERO_AUTH_PROOF, derivedNewBusinessIntents: 1 },
    { ...sut.R4_ZERO_AUTH_PROOF, extra: true },
  ])
    assert.throws(() => sut.validateR4ZeroAuthProof(value), { code: "RECOVERY_R4_PROOF" });
});

test("R8 is sole executable fixture nonce and all seven original requests remain spent", async () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.equal(sut.parseSingleRequest(JSON.stringify(request)).request_id, request.request_id);
  for (const nonce of [
    "trilha-a-fixtures-20261108-r1",
    "trilha-a-fixtures-20261109-r2",
    "trilha-a-fixtures-20261109-r3",
    "trilha-a-fixtures-20261109-r4",
    "trilha-a-fixtures-20261109-r5",
    "trilha-a-fixtures-20261109-r6",
    "trilha-a-fixtures-20261109-r7",
  ]) {
    assert.throws(() => sut.parseSingleRequest(JSON.stringify({ ...request, request_id: nonce })), {
      code: "REQUEST_SCHEMA",
    });
    assert.equal(
      sut.parseSingleRequest(JSON.stringify({ ...request, request_id: nonce }), undefined, {
        historical: true,
      }).request_id,
      nonce,
    );
  }
  const source = await (
    await import("node:fs/promises")
  ).readFile(new URL("./authenticated-visual-audit.mjs", import.meta.url), "utf8");
  const guardSource = source.slice(
    source.indexOf("function requireSingleRequestOperation("),
    source.indexOf("export async function verifySingleRequestGit("),
  );
  const guard = new Function(
    "fail",
    "resolveC8AuditScope",
    guardSource + ";return requireSingleRequestOperation;",
  )((code) => {
    throw Object.assign(new Error(code), { code });
  }, sut.resolveC8AuditScope);
  assert.throws(() => guard("audit"), { code: "AUDIT_BINDING_PENDING" });
});

async function r8InvokeMetadataCli(env) {
  const { readFile } = await import("node:fs/promises");
  const ts = (await import("typescript")).default;
  const source = await readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("audit.mjs", source, 99, true, ts.ScriptKind.JS);
  const fn = ast.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "singleRequestCli",
  );
  assert.ok(fn);
  const calls = [];
  const invoke = new Function(
    "process",
    "fail",
    "verifySingleRequest",
    "appendFile",
    "mkdir",
    "writeFile",
    "harnessIdentity",
    "console",
    "assertRequestMetadataEnvironment",
    fn.getText(ast) + ";return singleRequestCli;",
  )(
    { env },
    (code) => {
      throw Object.assign(new Error(code), { code });
    },
    async (args) => {
      calls.push(args);
      return { selected: false };
    },
    async () => assert.fail("no output"),
    async () => assert.fail("no output"),
    async () => assert.fail("no output"),
    async () => assert.fail("no identity"),
    { log() {} },
    sut.assertRequestMetadataEnvironment,
  );
  return { calls, run: () => invoke("--request-revalidate") };
}
test("R8 actual metadata CLI authenticates revalidation and rejects missing token before verification", async () => {
  const env = {
    CONTAOS_REQUEST_OPERATION: "fixtures",
    CONTAOS_ACTIONS_READ_TOKEN: "CANARY_METADATA_TOKEN",
  };
  const allowed = await r8InvokeMetadataCli(env);
  await allowed.run();
  assert.equal(allowed.calls.length, 1);
  assert.equal(allowed.calls[0].publicOnly, false, "the real CLI must authenticate revalidation");
  const denied = await r8InvokeMetadataCli({ CONTAOS_REQUEST_OPERATION: "fixtures" });
  await assert.rejects(denied.run(), { code: "REQUEST_API_TOKEN" });
  assert.equal(denied.calls.length, 0);
});
test("R8 effective caller environment refuses private aliases before the real CLI verifier", async () => {
  for (const key of [
    "CONTAOS_HML_SYNTHETIC_EMAIL",
    "CONTAOS_HML_SYNTHETIC_PASSWORD",
    "MASTER_EMAIL",
    "MASTER_PASSWORD",
    "DATABASE_URL",
    "DB_PASSWORD",
    "AUTH_ADMIN_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GITHUB_TOKEN",
    "GH_TOKEN",
  ]) {
    const fixture = await r8InvokeMetadataCli({
      CONTAOS_REQUEST_OPERATION: "fixtures",
      CONTAOS_ACTIONS_READ_TOKEN: "CANARY_METADATA_TOKEN",
      [key]: "CANARY_PRIVATE",
    });
    await assert.rejects(fixture.run(), { code: "PREPARE_SECRET_ENV" }, key);
    assert.equal(fixture.calls.length, 0, key);
  }
});
function r8WorkflowIsolation(doc) {
  const readset = { contents: "read", actions: "read", "pull-requests": "read" };
  assert.deepEqual(doc.jobs.request.permissions, readset);
  assert.deepEqual(doc.jobs.private.permissions, readset);
  assert.equal(Object.hasOwn(doc.env || {}, "CONTAOS_ACTIONS_READ_TOKEN"), false);
  let tokenSteps = 0;
  for (const [jobName, job] of Object.entries(doc.jobs)) {
    assert.equal(Object.hasOwn(job.env || {}, "CONTAOS_ACTIONS_READ_TOKEN"), false);
    for (const step of job.steps || []) {
      const metadata =
        jobName === "private" &&
        [
          "Recibo inicial publico para as fases sem credenciais",
          "Revalidar main e unicidade dentro da concorrencia antes de secrets",
        ].includes(step.name);
      const preflight =
        jobName === "request" && String(step.run || "").includes("--request-preflight");
      if (metadata || preflight) {
        assert.deepEqual(step.env, { CONTAOS_ACTIONS_READ_TOKEN: "${{ github.token }}" });
        tokenSteps++;
      } else assert.equal(Object.hasOwn(step.env || {}, "CONTAOS_ACTIONS_READ_TOKEN"), false);
    }
  }
  assert.equal(tokenSteps, 3);
}
test("R8 parsed workflows isolate ephemeral read token and exact read scopes with negative controls", async () => {
  const { readFile } = await import("node:fs/promises");
  const eslintRequire = createRequire(require.resolve("eslint"));
  const yamlRequire = createRequire(eslintRequire.resolve("@eslint/eslintrc"));
  const yaml = yamlRequire("js-yaml");
  for (const name of ["authenticated", "fixtures"]) {
    const raw = await readFile(
      new URL("../../.github/workflows/contaos-trilha-a-" + name + ".yml", import.meta.url),
      "utf8",
    );
    const doc = yaml.load(raw);
    r8WorkflowIsolation(doc);
    for (const mutate of [
      (d) => {
        delete d.jobs.private.permissions.actions;
      },
      (d) => {
        d.jobs.private.permissions.contents = "write";
      },
      (d) => {
        d.jobs.private.permissions["id-token"] = "write";
      },
      (d) => {
        d.jobs.request.permissions["pull-requests"] = "write";
      },
      (d) => {
        d.env = { CONTAOS_ACTIONS_READ_TOKEN: "CANARY" };
      },
      (d) => {
        d.jobs.private.env.CONTAOS_ACTIONS_READ_TOKEN = "CANARY";
      },
      (d) => {
        d.jobs.private.steps.find(
          (s) =>
            String(s.run || "").includes("--prepare-fixtures") ||
            String(s.run || "").endsWith("--audit"),
        ).env.CONTAOS_ACTIONS_READ_TOKEN = "CANARY";
      },
      (d) => {
        d.jobs.private.steps.find((s) => String(s.run || "").includes("--prepare")).env = {
          CONTAOS_ACTIONS_READ_TOKEN: "CANARY",
        };
      },
    ]) {
      const changed = structuredClone(doc);
      mutate(changed);
      assert.throws(() => r8WorkflowIsolation(changed));
    }
  }
});

async function r8R7Fixture() {
  const { execFileSync } = await import("node:child_process");
  const responses = structuredClone(R8_R7_RESPONSES),
    requests = [];
  return {
    responses,
    requests,
    get: async (path) => {
      requests.push(path);
      assert.ok(Object.hasOwn(responses, path), "only ten fixed R7 metadata endpoints");
      return structuredClone(responses[path]);
    },
    git: async (args) =>
      args[0] === "merge-base"
        ? ""
        : execFileSync("git", args, { encoding: "utf8", maxBuffer: 4194304 }),
  };
}

test("R8 authenticated GET sends only its isolated token and failures never retry or inspect error getters", async () => {
  for (const status of [403, 429, 500, 503, 301]) {
    let calls = 0,
      options;
    const token = "CANARY_ACTIONS_TOKEN";
    const get = sut.singleRequestGet({
      publicOnly: false,
      token,
      env: { CONTAOS_ACTIONS_READ_TOKEN: token },
      diagnostic: true,
      fetchImpl: async (_, o) => {
        calls++;
        options = o;
        return { status };
      },
    });
    await assert.rejects(get("/actions/runs/42601383933"), (error) => {
      assert.equal(error.code, "REQUEST_API_UNAVAILABLE");
      assert.deepEqual(sut.requestApiDiagnostic(error), {
        schema: "contaos.single-request.api-failure.v1",
        phase: "REQUEST_API",
        endpointKind: "RUN",
        statusHTTP: status,
        category: "HTTP",
      });
      assert.equal(JSON.stringify(sut.requestApiDiagnostic(error)).includes(token), false);
      return true;
    });
    assert.equal(calls, 1);
    assert.equal(options.headers.Authorization, "Bearer " + token);
    assert.equal(options.redirect, "error");
  }
  let traps = 0;
  const proxy = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  const token = "CANARY_ACTIONS_TOKEN";
  const get = sut.singleRequestGet({
    publicOnly: false,
    token,
    env: { CONTAOS_ACTIONS_READ_TOKEN: token },
    diagnostic: true,
    fetchImpl: async () => {
      throw proxy;
    },
  });
  await assert.rejects(get(""), (error) => {
    assert.equal(sut.requestApiDiagnostic(error).category, "TRANSPORT");
    assert.equal(sut.requestApiDiagnostic(error).statusHTTP, "NONE");
    return true;
  });
  assert.equal(traps, 0);
  for (const error of [
    proxy,
    {
      get requestApi() {
        traps++;
        throw Error("CANARY");
      },
    },
    { endpointKind: "CANARY", statusHTTP: 200, category: "HTTP" },
  ])
    assert.equal(sut.requestApiDiagnostic(error), null);
  assert.equal(traps, 0);
  let abortObserved = false;
  const slow = sut.singleRequestGet({
    publicOnly: false,
    token,
    env: { CONTAOS_ACTIONS_READ_TOKEN: token },
    diagnostic: true,
    now: (() => {
      let n = 0;
      return () => (n++ ? 59999 : 0);
    })(),
    fetchImpl: async (_, o) =>
      new Promise((_, reject) => {
        const hold = setTimeout(() => reject(proxy), 50);
        o.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(hold);
            abortObserved = true;
            reject(proxy);
          },
          { once: true },
        );
      }),
  });
  await assert.rejects(slow(""), (error) => sut.requestApiDiagnostic(error).category === "TIMEOUT");
  assert.equal(abortObserved, true);
  assert.equal(traps, 0);
});
test("R8 metadata guard uses only effective own data and Master rejects every GitHub token alias", () => {
  for (const key of [
    "CONTAOS_HML_SYNTHETIC_EMAIL",
    "CONTAOS_HML_SYNTHETIC_PASSWORD",
    "MASTER_EMAIL",
    "MASTER_PASSWORD",
    "DATABASE_URL",
    "DB_PASSWORD",
    "AUTH_ADMIN_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GITHUB_TOKEN",
    "GH_TOKEN",
  ]) {
    let reads = 0;
    const env = { CONTAOS_ACTIONS_READ_TOKEN: "CANARY" };
    Object.defineProperty(env, key, {
      enumerable: true,
      get() {
        reads++;
        throw Error("CANARY");
      },
    });
    assert.throws(() => sut.assertRequestMetadataEnvironment(env), { code: "PREPARE_SECRET_ENV" });
    assert.equal(reads, 0);
  }
  let traps = 0;
  const proxy = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      ownKeys() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  assert.throws(() => sut.assertRequestMetadataEnvironment(proxy), { code: "PREPARE_SECRET_ENV" });
  assert.equal(traps, 0);
  for (const key of ["CONTAOS_ACTIONS_READ_TOKEN", "GITHUB_TOKEN", "GH_TOKEN"])
    assert.throws(
      () =>
        sut.assertPrivateRequestEnvironment({
          CONTAOS_HML_SYNTHETIC_EMAIL: "CANARY",
          [key]: "CANARY",
        }),
      { code: "PREPARE_SECRET_ENV" },
    );
  assert.doesNotThrow(() =>
    sut.assertPrivateRequestEnvironment({
      CONTAOS_HML_SYNTHETIC_EMAIL: "CANARY",
      CONTAOS_HML_SYNTHETIC_PASSWORD: "CANARY",
    }),
  );
});
test("R8 manual legacy with private aliases stops before any GET or local authorization", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw Error("CANARY");
  };
  try {
    for (const key of [
      "CONTAOS_HML_SYNTHETIC_EMAIL",
      "CONTAOS_HML_SYNTHETIC_PASSWORD",
      "MASTER_EMAIL",
      "MASTER_PASSWORD",
      "DATABASE_URL",
      "DB_PASSWORD",
      "AUTH_ADMIN_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ])
      await assert.rejects(
        sut.loadSingleRequestProof({
          operation: "fixtures",
          env: {
            GITHUB_EVENT_NAME: "workflow_dispatch",
            GITHUB_REF: "refs/heads/main",
            [key]: "CANARY",
          },
        }),
        { code: "PREPARE_SECRET_ENV" },
      );
    assert.equal(requests, 0);
    assert.throws(() => sut.getValidatedR7ZeroAuth(), { code: "RECOVERY_R7_PROOF" });
  } finally {
    globalThis.fetch = original;
  }
});
test("R8 ten original metadata reads prove R7 zero-auth without logs or artifact contents", async () => {
  const f = await r8R7Fixture(),
    proof = await sut.verifyR7ZeroAuth(f);
  assert.deepEqual(proof, sut.R7_ZERO_AUTH_PROOF);
  assert.equal(f.requests.length, 10);
  assert.equal(new Set(f.requests).size, 10);
  assert.equal(
    f.requests.some((p) => /logs|download|auth|supabase/.test(p)),
    false,
  );
  const raw = JSON.stringify(proof, null, 2) + "\n";
  assert.equal(Buffer.byteLength(raw), 316);
  assert.equal(
    (await import("node:crypto")).createHash("sha256").update(raw).digest("hex"),
    "687712aa5ab15072afc65aceacdff52ce5d94c6ba9f2ceccf6867e4636bd1c4e",
  );
  for (const mutate of [
    (r) => {
      r["/actions/runs/42601383933"].head_sha = "a".repeat(40);
    },
    (r) => {
      r["/actions/runs/42601383933/attempts/1"].run_attempt = 2;
    },
    (r) => {
      r["/actions/runs/42601383933/attempts/1/jobs?per_page=100&page=1"].jobs[2].steps.find(
        (s) => s.number === 16,
      ).conclusion = "success";
    },
    (r) => {
      r["/actions/runs/42601383933/attempts/1/jobs?per_page=100&page=1"].total_count = 4;
    },
    (r) => {
      r["/actions/runs/42601383933/artifacts?per_page=100&page=1"] = {
        total_count: 1,
        artifacts: [{ id: 1 }],
      };
    },
    (r) => {
      r["/actions/runs/42601384052/attempts/1/jobs?per_page=100&page=1"].jobs[2].conclusion =
        "success";
    },
    (r) => {
      r["/actions/runs/42601246471"].repository.id = 1;
    },
  ]) {
    const invalid = await r8R7Fixture();
    mutate(invalid.responses);
    await assert.rejects(sut.verifyR7ZeroAuth(invalid), { code: "RECOVERY_R7_PROOF" });
  }
  const badSource = await r8R7Fixture();
  await assert.rejects(sut.verifyR7ZeroAuth({ ...badSource, git: async () => "CANARY" }), {
    code: "RECOVERY_R7_PROOF",
  });
});
test("R8 R7 proof rejects missing extra symbols proxies revoked and proxy prototypes without getters", () => {
  const clone = () => ({ ...sut.R7_ZERO_AUTH_PROOF });
  let reads = 0;
  const getter = clone();
  Object.defineProperty(getter, "headSha", {
    enumerable: true,
    get() {
      reads++;
      throw Error("CANARY");
    },
  });
  const proxy = new Proxy(clone(), {
    get() {
      reads++;
      throw Error("CANARY");
    },
    ownKeys() {
      reads++;
      throw Error("CANARY");
    },
    getPrototypeOf() {
      reads++;
      throw Error("CANARY");
    },
  });
  const revoked = Proxy.revocable(clone(), {});
  revoked.revoke();
  const prototype = new Proxy(
    {},
    {
      getOwnPropertyDescriptor() {
        reads++;
        throw Error("CANARY");
      },
    },
  );
  const wrapped = Object.assign(Object.create(prototype), clone());
  const symbol = clone();
  symbol[Symbol("extra")] = true;
  for (const value of [
    undefined,
    null,
    {},
    getter,
    proxy,
    revoked.proxy,
    wrapped,
    symbol,
    { ...clone(), attempt: 2 },
    { ...clone(), derivedNewBusinessIntents: 1 },
  ])
    assert.throws(() => sut.validateR7ZeroAuthProof(value), { code: "RECOVERY_R7_PROOF" });
  assert.equal(reads, 0);
});

test("R8 ENV inheritance proxy prototypes aliases and post-factory mutation fail before GET", async () => {
  const token = "CANARY_ACTIONS_TOKEN";
  let calls = 0,
    traps = 0;
  const transport = async () => {
    calls++;
    return { status: 200, text: async () => "{}" };
  };
  const inherited = Object.assign(Object.create({ MASTER_PASSWORD: "CANARY" }), {
    CONTAOS_ACTIONS_READ_TOKEN: token,
  });
  const protoProxy = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      getOwnPropertyDescriptor() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  const hostile = Object.assign(Object.create(protoProxy), { CONTAOS_ACTIONS_READ_TOKEN: token });
  for (const env of [inherited, hostile])
    assert.throws(
      () => sut.singleRequestGet({ env, token, publicOnly: false, fetchImpl: transport }),
      { code: "PREPARE_SECRET_ENV" },
    );
  assert.throws(
    () => sut.assertPrivateRequestEnvironment(Object.create({ GITHUB_TOKEN: "CANARY" })),
    { code: "PREPARE_SECRET_ENV" },
  );
  for (const key of [
    "PGPASSWORD",
    "SUPABASE_DB_PASSWORD",
    "SUPABASE_DB_URL",
    "SUPABASE_ADMIN_KEY",
  ]) {
    const env = { CONTAOS_ACTIONS_READ_TOKEN: token, [key]: "CANARY" };
    assert.throws(
      () => sut.singleRequestGet({ env, token, publicOnly: false, fetchImpl: transport }),
      { code: "PREPARE_SECRET_ENV" },
    );
  }
  const env = { CONTAOS_ACTIONS_READ_TOKEN: token };
  const get = sut.singleRequestGet({ env, token, publicOnly: false, fetchImpl: transport });
  env.MASTER_PASSWORD = "CANARY";
  await assert.rejects(get(""), { code: "PREPARE_SECRET_ENV" });
  delete env.MASTER_PASSWORD;
  env.CONTAOS_ACTIONS_READ_TOKEN = "CHANGED";
  await assert.rejects(get(""), { code: "REQUEST_API_TOKEN" });
  await assert.rejects(sut.loadSingleRequestProof({ operation: "fixtures", env: hostile }), {
    code: "PREPARE_SECRET_ENV",
  });
  assert.equal(calls, 0);
  assert.equal(traps, 0);
});
test("R8 actual audit CLI rejects private manual before runtime but preserves public native manual dispatch", async () => {
  const { readFile } = await import("node:fs/promises"),
    { fileURLToPath } = await import("node:url");
  const ts = (await import("typescript")).default;
  const source = await readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("audit.mjs", source, 99, true, ts.ScriptKind.JS);
  const node = ast.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "runCli");
  assert.ok(node);
  const body = node
    .getText(ast)
    .replace(/^export\s+/, "")
    .replaceAll("import.meta.url", "sourceModuleUrl");
  const env = {
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_REF: "refs/heads/main",
    CONTAOS_HARNESS_SHA: "a".repeat(40),
  };
  let gitCalls = 0,
    privateCalls = 0,
    loads = 0,
    nativeCalls = 0;
  const run = new Function(
    "process",
    "sourceModuleUrl",
    "fileURLToPath",
    "resolve",
    "join",
    "fail",
    "browserEnvironment",
    "execFile",
    "readFile",
    "loadSingleRequestProof",
    "nativeGuard",
    "runAuthenticatedAudit",
    "assertPrivateRequestEnvironment",
    "validateC8RecoveryDocument",
    "C8_RECOVERY_DOCUMENT",
    body + ";return runCli;",
  )(
    { env, argv: [] },
    new URL("./authenticated-visual-audit.mjs", import.meta.url).href,
    fileURLToPath,
    (await import("node:path")).resolve,
    (await import("node:path")).join,
    (code) => {
      throw Object.assign(new Error(code), { code });
    },
    sut.browserEnvironment,
    async (_, args) => {
      gitCalls++;
      return { stdout: args[0] === "rev-parse" ? env.CONTAOS_HARNESS_SHA : "" };
    },
    async () => "",
    async () => {
      loads++;
    },
    async () => {
      nativeCalls++;
      return "PUBLIC_ALLOWED";
    },
    async () => {
      privateCalls++;
    },
    sut.assertPrivateRequestEnvironment,
    sut.validateC8RecoveryDocument,
    sut.C8_RECOVERY_DOCUMENT,
  );
  await assert.rejects(run(["--audit"]), { code: "REQUEST_EVENT" });
  assert.equal(gitCalls, 0);
  assert.equal(privateCalls, 0);
  assert.equal(loads, 0);
  assert.equal(await run(["--native-guard"]), "PUBLIC_ALLOWED");
  assert.equal(nativeCalls, 1);
  assert.equal(privateCalls, 0);
  assert.equal(loads, 0);
});

test("R8 carregador compartilhado mantém prova R7 audit local antes de configuração sem GET", async () => {
  const { createHash } = await import("node:crypto");
  const { join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const sha = "a".repeat(40),
    parent = "b".repeat(40),
    now = 1000;
  const identity = { harnessSha: sha, moduleHash: "module", testHash: "test" };
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "audit",
    request_id: sut.SINGLE_REQUEST.audit.nonce,
    frontend_sha: "",
    deployment_id: "",
    approved_parent_sha: parent,
  };
  const raw = JSON.stringify(request);
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  const canonical = sut.validateR7ZeroAuthProof(sut.R7_ZERO_AUTH_PROOF);
  const base = {
    schema: "contaos.single-request.runtime.v1",
    selected: true,
    operation: "audit",
    sha,
    currentRunId: 12,
    createdAt: now,
    identity,
    requestSha256: digest(raw),
    requestId: request.request_id,
    frontendSha: "",
    deploymentId: "",
    parentSha: parent,
    upstreamId: 11,
    r7ZeroAuth: canonical,
    auditScope: "C8",
    c8RecoverySha256: "3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee",
  };
  const env = {
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_REF: "refs/heads/main",
    GITHUB_REPOSITORY: "contaos999999/contaos-hml-control",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_RUN_ID: "12",
    CONTAOS_HARNESS_SHA: sha,
    GITHUB_EVENT_PATH: "event",
    MASTER_EMAIL: "synthetic",
    MASTER_PASSWORD: "synthetic",
  };
  let gets = 0,
    configured = 0;
  const fail = (code) => {
    throw Object.assign(new Error(code), { code });
  };
  // Keep the actual closed C8 admission; isolate Git metadata to exercise local R7 restoration.
  const { readFile: readSource } = await import("node:fs/promises");
  const productionSource = await readSource(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const environmentSource = productionSource.slice(
    productionSource.indexOf("const REQUEST_NATIVE_ENV ="),
    productionSource.indexOf("export function assertRequestMetadataEnvironment"),
  );
  assert.ok(environmentSource.includes("function requestEnvironmentChain(env)"));
  const factory = new Function(
    "deps",
    `const {C8_RECOVERY_DOCUMENT,validateC8RecoveryDocument,resolveC8AuditScope,isProxy,assertPrivateRequestEnvironment,assertRequestMetadataEnvironment,requireSingleRequestOperation,fileURLToPath,join,sourceModuleUrl,fail,parseSingleRequest,digest,verifySingleRequestGit,validateSingleRequestEvent,SINGLE_REQUEST,validateR4ZeroAuthProof,validateR7ZeroAuthProof,singleRequestGet,validateR18RecoveryDocument,validateR18RegistrationCandidate,R18_RECOVERY_DOCUMENT,R18_REGISTRATION_CANDIDATE}=deps;
    ${environmentSource}
    let singleRequestContext=null,validatedR4ZeroAuth=null,validatedR7ZeroAuth=null,validatedR12ZeroAuth=null;
    ${sut.loadSingleRequestProof.toString().replaceAll("import.meta.url", "sourceModuleUrl")}
    return {load:loadSingleRequestProof,current:()=>validatedR7ZeroAuth};`,
  );
  const { isProxy } = await import("node:util/types");
  const loader = factory({
    C8_RECOVERY_DOCUMENT: sut.C8_RECOVERY_DOCUMENT,
    validateC8RecoveryDocument: sut.validateC8RecoveryDocument,
    resolveC8AuditScope: sut.resolveC8AuditScope,
    validateR18RecoveryDocument: sut.validateR18RecoveryDocument,
    validateR18RegistrationCandidate: sut.validateR18RegistrationCandidate,
    R18_RECOVERY_DOCUMENT: sut.R18_RECOVERY_DOCUMENT,
    R18_REGISTRATION_CANDIDATE: sut.R18_REGISTRATION_CANDIDATE,
    isProxy,
    assertPrivateRequestEnvironment: sut.assertPrivateRequestEnvironment,
    assertRequestMetadataEnvironment: sut.assertRequestMetadataEnvironment,
    requireSingleRequestOperation: (operation, request) => {
      assert.equal(operation, "audit");
      return sut.resolveC8AuditScope(request);
    },
    fileURLToPath,
    join,
    sourceModuleUrl: import.meta.url,
    fail,
    parseSingleRequest: sut.parseSingleRequest,
    digest,
    verifySingleRequestGit: async () => {},
    validateSingleRequestEvent: () => {},
    SINGLE_REQUEST: {
      repository: env.GITHUB_REPOSITORY,
      path: "request",
      audit: { id: 1, path: "audit", name: "audit" },
    },
    validateR4ZeroAuthProof: () => assert.fail("R4 is fixtures only"),
    validateR7ZeroAuthProof: sut.validateR7ZeroAuthProof,
    singleRequestGet: () => {
      gets++;
      assert.fail("local Master loader must not fetch");
    },
  });
  let proof = base;
  const options = {
    operation: "audit",
    env,
    read: async (path) =>
      path.endsWith("single-request.json")
        ? JSON.stringify(proof)
        : path === "event"
          ? JSON.stringify({ workflow_run: { id: 11 } })
          : raw,
    stat: async () => ({ isFile: () => true, isSymbolicLink: () => false, size: 100 }),
    identity: async () => identity,
    now: () => now,
    git: async () => "",
  };
  await loader.load(options);
  assert.deepEqual(loader.current(), canonical);
  configured++;
  proof = { ...base };
  delete proof.r7ZeroAuth;
  await assert.rejects(() => loader.load(options), { code: "RECOVERY_R7_PROOF" });
  assert.equal(loader.current(), null);
  assert.equal(gets, 0);
  assert.equal(configured, 1);
});

test("R9 request accepts only the new nonce and keeps R8 spent", () => {
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.deepEqual(sut.parseSingleRequest(JSON.stringify(row), "fixtures"), row);
  assert.throws(
    () =>
      sut.parseSingleRequest(
        JSON.stringify({ ...row, request_id: "trilha-a-fixtures-20261109-r8" }),
        "fixtures",
      ),
    /REQUEST_/,
  );
});

test("R10 request accepts its new nonce and keeps R9 spent", () => {
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261109-r10",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(row), "fixtures"), /REQUEST_/);
  assert.throws(
    () =>
      sut.parseSingleRequest(
        JSON.stringify({ ...row, request_id: "trilha-a-fixtures-20261109-r9" }),
        "fixtures",
      ),
    /REQUEST_/,
  );
});

test("R10 native failure diagnostic admits only the eight exact TAP titles", () => {
  const titles = [
    ["Chromium nativo: resposta alterada não executa antes do fechamento", "SOURCE_RESPONSE"],
    ["Chromium nativo: worker não transmite ao canário", "WORKER"],
    ["Chromium nativo: popup não transmite ao canário", "POPUP"],
    ["Chromium nativo: websocket não transmite ao canário", "WEBSOCKET"],
    ["Chromium nativo: proxy não transmite ao canário", "PROXY"],
    ["Chromium nativo: controle positivo e bloqueio ws", "WS"],
    ["Chromium nativo: controle positivo e bloqueio wss", "WSS"],
    [
      "Chromium nativo: cancelamento inicial real não libera corpo nem transmite ao canário",
      "CANCELLATION",
    ],
  ];
  assert.deepEqual(
    sut.nativeFailedCases(
      "TAP version 13\n" +
        titles.map(([title], i) => "not ok " + (i + 1) + " - " + title).join("\n"),
    ),
    titles.map(([, code]) => code),
  );
  for (const raw of [
    "not ok 1 - PRIVATE_CANARY",
    "not ok 1 - " + titles[0][0] + " https://private.invalid",
    "Error PRIVATE_CANARY",
    null,
  ])
    assert.deepEqual(sut.nativeFailedCases(raw), []);
  const value = sut.nativeFailedCases("not ok 1 - " + titles[0][0]);
  assert.equal(JSON.stringify(value).includes("PRIVATE_CANARY"), false);
});

test("R10 sourceforms supplement proves exactly five named successes without changing native base eight", () => {
  const names = [
    "R3 Chromium sourceforms exact controls and actual source consumer",
    "R3 Chromium sourceforms nested Radix logout actual runtime and unknown overlay",
    "R3 Chromium sourceforms competence read barriers and actual recovery consumer",
    "R3 Chromium sourceforms scoped V116 V117 projection and actual SDK parsers",
    "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer",
  ];
  const tap =
    "TAP version 13\n" +
    names.map((name, i) => "ok " + (i + 1) + " - " + name).join("\n") +
    "\n1..5\n# tests 5\n# pass 5\n# fail 0\n# cancelled 0\n# skipped 0\n";
  assert.equal(sut.preparerSourceFormsSupplement(tap), 5);
  for (const altered of [
    tap.replace("1..5", "1..2"),
    tap.replace("# pass 5", "# pass 2"),
    tap.replace(names[4], "PRIVATE_CANARY"),
    tap.replace("ok 5", "not ok 5"),
    tap + "# skipped 1\n",
  ])
    assert.equal(sut.preparerSourceFormsSupplement(altered), null);
});

test("R11 new request nonce is accepted while R10 remains spent", () => {
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261109-r11",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(row), "fixtures"), /REQUEST_/);
  assert.throws(
    () =>
      sut.parseSingleRequest(
        JSON.stringify({ ...row, request_id: "trilha-a-fixtures-20261109-r10" }),
        "fixtures",
      ),
    /REQUEST_/,
  );
});

test("R12 new request nonce is accepted while the uncertain R11 request remains spent", () => {
  const row = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261109-r12",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(row), "fixtures"), /REQUEST_/);
  assert.throws(
    () =>
      sut.parseSingleRequest(
        JSON.stringify({ ...row, request_id: "trilha-a-fixtures-20261109-r11" }),
        "fixtures",
      ),
    /REQUEST_/,
  );
});

test("R12 auth protocol validates the actual original nonempty R11 recovery document", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs");
  assert.deepEqual(
    prep.validateR11RecoveryDocument(prep.R11_RECOVERY_DOCUMENT),
    prep.R11_RECOVERY_DOCUMENT,
  );
});
test("R12 auth protocol executes the real preparer runtime budget with every original proof", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8"),
    ast = ts.createSourceFile("prep.mjs", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS),
    nodes = [];
  function visit(n) {
    nodes.push(n);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  const named = (name) => nodes.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name);
  const entry = named("runFixturePreparation"),
    init = nodes
      .find(
        (n) =>
          ts.isVariableDeclaration(n) &&
          n.pos >= entry.pos &&
          n.end <= entry.end &&
          n.name.getText(ast) === "validatedBudget",
      )
      .initializer.getText(ast);
  const env = {
    err: (code) => {
      throw Error(code);
    },
    R1_RECOVERY_DOCUMENT: prep.R1_RECOVERY_DOCUMENT,
    R3_RECOVERY_DOCUMENT: prep.R3_RECOVERY_DOCUMENT,
  };
  for (const n of [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18])
    env["validateR" + n + "RecoveryDocument"] = prep["validateR" + n + "RecoveryDocument"];
  for (const n of [4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18])
    env["r" + n + "Recovery"] = prep["R" + n + "_RECOVERY_DOCUMENT"];
  env.validateR18RegistrationCandidate = prep.validateR18RegistrationCandidate;
  env.r18Candidate = prep.R18_REGISTRATION_CANDIDATE;
  assert.deepEqual(
    new Function(
      ...Object.keys(env),
      named("recoveryBudget").getText(ast) + ";return " + init + ";",
    )(...Object.values(env)),
    { confirmedBefore: 17, priorReserved: 2, maxNewIntentions: 5 },
  );
});

test("R12 auth protocol rejects a partial pending October GET before any further recovery arm", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    { EventEmitter } = await import("node:events"),
    { randomUUID } = await import("node:crypto"),
    ts = (await import("typescript")).default;
  const source = await readFile(
      new URL("./prepare-visual-fixtures.test.mjs", import.meta.url),
      "utf8",
    ),
    ast = ts.createSourceFile(
      "prep.test.mjs",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    ),
    nodes = [];
  function visit(n) {
    nodes.push(n);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  const named = (name) =>
    nodes.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name).getText(ast);
  const fixture = prep.FIXTURE,
    identity = {
      frontendSha: "a".repeat(40),
      harnessSha: "b".repeat(40),
      deploymentId: "dpl_R12ReadOnlyFixture",
      workflowRun: "123456789",
    };
  const env = { sut: prep, FIXTURE: fixture, R6_R5_DOCUMENT: prep.R5_RECOVERY_DOCUMENT };
  const reconciliation = new Function(
    ...Object.keys(env),
    named("r2Reconciliation") + ";return r2Reconciliation();",
  )(...Object.values(env));
  const options = { identity, persist: () => true, recoveryLedger: prep.R1_RECOVERY_DOCUMENT };
  for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18])
    options["recoveryLedgerR" + n] = prep["R" + n + "_RECOVERY_DOCUMENT"];
  options.registrationCandidateR18 = prep.R18_REGISTRATION_CANDIDATE;
  const broker = prep.createIntentBroker(options),
    page = new EventEmitter(),
    observer = prep.createOfficialObserver(page, {
      identity,
      wait: () => new Promise(setImmediate),
    });
  const sdk = await readFile(
      new URL("../../src/lib/competencias/parecerInternoDados.ts", import.meta.url),
      "utf8",
    ),
    select = sdk.match(/export const COLUNAS_PARECERES\s*=\s*"([^"]+)"/)[1],
    comp = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[0].id,
    query = {
      select,
      id_competencia: "eq." + comp,
      id_organizacao: "eq." + fixture.organization,
      id_contrato: "eq." + fixture.contract,
      order: "versao.desc,id.desc",
      offset: "0",
      limit: "25",
    },
    row = {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      id_competencia: comp,
      id_organizacao: fixture.organization,
      id_contrato: fixture.contract,
      status: "aprovado",
      versao: 1,
      hash: "c".repeat(64),
      criado_em: "2026-11-09T00:00:00Z",
      aprovado_em: "2026-11-09T00:01:00Z",
      autor: null,
      texto: "Fixture local",
      aprovado_por: null,
    };
  const emit = (q, body) => {
    const url = fixture.api + "/rest/v1/pareceres_internos?" + new URLSearchParams(q),
      request = { url: () => url, method: () => "GET", postData: () => null, failure: () => null };
    page.emit("request", request);
    if (body)
      page.emit("response", {
        request: () => request,
        url: () => url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(body)),
      });
  };
  try {
    const after = observer.generation();
    const emitRecoveryData = new Function(
      "FIXTURE",
      "R6_R5_DOCUMENT",
      named("r17View") +
        ";" +
        named("r11SqlV116") +
        ";" +
        named("r17RecoveryData") +
        ";" +
        named("r17EmitRecoveryData") +
        ";return r17EmitRecoveryData;",
    )(fixture, prep.R5_RECOVERY_DOCUMENT);
    for (const c of JSON.parse(prep.R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies) {
      emit({ ...query, id_competencia: "eq." + c.id }, [
        { ...row, id: c.opinionId, id_competencia: c.id },
      ]);
      emitRecoveryData(page, c);
    }
    await observer.flush();
    broker.authorizeRecovery(
      prep.reconcileR1Recovery(reconciliation),
      observer.sealRecoveryOpinion(broker, after),
    );
    const partial = { ...query };
    delete partial.order;
    emit(partial);
    const sep = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[1].id;
    assert.throws(
      () =>
        broker.arm({
          rpc: "registrar_revisao_requisito_v117",
          payload: { p_id_competencia: sep, p_fundamento: fixture.foundation },
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
          evidence: {
            competencies: [
              {
                official: true,
                current: true,
                organization: fixture.organization,
                contract: fixture.contract,
                id: sep,
                month: "2026-09-01",
              },
            ],
          },
        }),
      { message: "RECOVERY_R11_OPINION" },
    );
    assert.equal(broker.snapshot().count, 19);
  } finally {
    observer.close();
  }
});

test("R12 auth protocol rejects a unscoped pending opinion GET before any further recovery arm", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    { EventEmitter } = await import("node:events"),
    { randomUUID } = await import("node:crypto"),
    ts = (await import("typescript")).default;
  const source = await readFile(
      new URL("./prepare-visual-fixtures.test.mjs", import.meta.url),
      "utf8",
    ),
    ast = ts.createSourceFile(
      "prep.test.mjs",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    ),
    nodes = [];
  function visit(n) {
    nodes.push(n);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  const named = (name) =>
    nodes.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name).getText(ast);
  const fixture = prep.FIXTURE,
    identity = {
      frontendSha: "a".repeat(40),
      harnessSha: "b".repeat(40),
      deploymentId: "dpl_R12ReadOnlyFixture",
      workflowRun: "123456789",
    };
  const env = { sut: prep, FIXTURE: fixture, R6_R5_DOCUMENT: prep.R5_RECOVERY_DOCUMENT };
  const reconciliation = new Function(
    ...Object.keys(env),
    named("r2Reconciliation") + ";return r2Reconciliation();",
  )(...Object.values(env));
  const options = { identity, persist: () => true, recoveryLedger: prep.R1_RECOVERY_DOCUMENT };
  for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18])
    options["recoveryLedgerR" + n] = prep["R" + n + "_RECOVERY_DOCUMENT"];
  options.registrationCandidateR18 = prep.R18_REGISTRATION_CANDIDATE;
  const broker = prep.createIntentBroker(options),
    page = new EventEmitter(),
    observer = prep.createOfficialObserver(page, {
      identity,
      wait: () => new Promise(setImmediate),
    });
  const sdk = await readFile(
      new URL("../../src/lib/competencias/parecerInternoDados.ts", import.meta.url),
      "utf8",
    ),
    select = sdk.match(/export const COLUNAS_PARECERES\s*=\s*"([^"]+)"/)[1],
    comp = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[0].id,
    query = {
      select,
      id_competencia: "eq." + comp,
      id_organizacao: "eq." + fixture.organization,
      id_contrato: "eq." + fixture.contract,
      order: "versao.desc,id.desc",
      offset: "0",
      limit: "25",
    },
    row = {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      id_competencia: comp,
      id_organizacao: fixture.organization,
      id_contrato: fixture.contract,
      status: "aprovado",
      versao: 1,
      hash: "c".repeat(64),
      criado_em: "2026-11-09T00:00:00Z",
      aprovado_em: "2026-11-09T00:01:00Z",
      autor: null,
      texto: "Fixture local",
      aprovado_por: null,
    };
  const emit = (q, body) => {
    const url = fixture.api + "/rest/v1/pareceres_internos?" + new URLSearchParams(q),
      request = { url: () => url, method: () => "GET", postData: () => null, failure: () => null };
    page.emit("request", request);
    if (body)
      page.emit("response", {
        request: () => request,
        url: () => url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(body)),
      });
  };
  try {
    const after = observer.generation();
    const emitRecoveryData = new Function(
      "FIXTURE",
      "R6_R5_DOCUMENT",
      named("r17View") +
        ";" +
        named("r11SqlV116") +
        ";" +
        named("r17RecoveryData") +
        ";" +
        named("r17EmitRecoveryData") +
        ";return r17EmitRecoveryData;",
    )(fixture, prep.R5_RECOVERY_DOCUMENT);
    for (const c of JSON.parse(prep.R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies) {
      emit({ ...query, id_competencia: "eq." + c.id }, [
        { ...row, id: c.opinionId, id_competencia: c.id },
      ]);
      emitRecoveryData(page, c);
    }
    await observer.flush();
    broker.authorizeRecovery(
      prep.reconcileR1Recovery(reconciliation),
      observer.sealRecoveryOpinion(broker, after),
    );
    const partial = { ...query };
    delete partial.id_competencia;
    emit(partial);
    const sep = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[1].id;
    assert.throws(
      () =>
        broker.arm({
          rpc: "registrar_revisao_requisito_v117",
          payload: { p_id_competencia: sep, p_fundamento: fixture.foundation },
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
          evidence: {
            competencies: [
              {
                official: true,
                current: true,
                organization: fixture.organization,
                contract: fixture.contract,
                id: sep,
                month: "2026-09-01",
              },
            ],
          },
        }),
      { message: "RECOVERY_R11_OPINION" },
    );
    assert.equal(broker.snapshot().count, 19);
  } finally {
    observer.close();
  }
});

test("R12 auth protocol rejects a non-equality pending October GET before any further recovery arm", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    { EventEmitter } = await import("node:events"),
    { randomUUID } = await import("node:crypto"),
    ts = (await import("typescript")).default;
  const source = await readFile(
      new URL("./prepare-visual-fixtures.test.mjs", import.meta.url),
      "utf8",
    ),
    ast = ts.createSourceFile(
      "prep.test.mjs",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    ),
    nodes = [];
  function visit(n) {
    nodes.push(n);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  const named = (name) =>
    nodes.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name).getText(ast);
  const fixture = prep.FIXTURE,
    identity = {
      frontendSha: "a".repeat(40),
      harnessSha: "b".repeat(40),
      deploymentId: "dpl_R12ReadOnlyFixture",
      workflowRun: "123456789",
    };
  const env = { sut: prep, FIXTURE: fixture, R6_R5_DOCUMENT: prep.R5_RECOVERY_DOCUMENT };
  const reconciliation = new Function(
    ...Object.keys(env),
    named("r2Reconciliation") + ";return r2Reconciliation();",
  )(...Object.values(env));
  const options = { identity, persist: () => true, recoveryLedger: prep.R1_RECOVERY_DOCUMENT };
  for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18])
    options["recoveryLedgerR" + n] = prep["R" + n + "_RECOVERY_DOCUMENT"];
  options.registrationCandidateR18 = prep.R18_REGISTRATION_CANDIDATE;
  const broker = prep.createIntentBroker(options),
    page = new EventEmitter(),
    observer = prep.createOfficialObserver(page, {
      identity,
      wait: () => new Promise(setImmediate),
    });
  const sdk = await readFile(
      new URL("../../src/lib/competencias/parecerInternoDados.ts", import.meta.url),
      "utf8",
    ),
    select = sdk.match(/export const COLUNAS_PARECERES\s*=\s*"([^"]+)"/)[1],
    comp = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[0].id,
    query = {
      select,
      id_competencia: "eq." + comp,
      id_organizacao: "eq." + fixture.organization,
      id_contrato: "eq." + fixture.contract,
      order: "versao.desc,id.desc",
      offset: "0",
      limit: "25",
    },
    row = {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      id_competencia: comp,
      id_organizacao: fixture.organization,
      id_contrato: fixture.contract,
      status: "aprovado",
      versao: 1,
      hash: "c".repeat(64),
      criado_em: "2026-11-09T00:00:00Z",
      aprovado_em: "2026-11-09T00:01:00Z",
      autor: null,
      texto: "Fixture local",
      aprovado_por: null,
    };
  const emit = (q, body) => {
    const url = fixture.api + "/rest/v1/pareceres_internos?" + new URLSearchParams(q),
      request = { url: () => url, method: () => "GET", postData: () => null, failure: () => null };
    page.emit("request", request);
    if (body)
      page.emit("response", {
        request: () => request,
        url: () => url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(body)),
      });
  };
  try {
    const after = observer.generation();
    const emitRecoveryData = new Function(
      "FIXTURE",
      "R6_R5_DOCUMENT",
      named("r17View") +
        ";" +
        named("r11SqlV116") +
        ";" +
        named("r17RecoveryData") +
        ";" +
        named("r17EmitRecoveryData") +
        ";return r17EmitRecoveryData;",
    )(fixture, prep.R5_RECOVERY_DOCUMENT);
    for (const c of JSON.parse(prep.R16_RECOVERY_DOCUMENT.reportRaw).bindings.competencies) {
      emit({ ...query, id_competencia: "eq." + c.id }, [
        { ...row, id: c.opinionId, id_competencia: c.id },
      ]);
      emitRecoveryData(page, c);
    }
    await observer.flush();
    broker.authorizeRecovery(
      prep.reconcileR1Recovery(reconciliation),
      observer.sealRecoveryOpinion(broker, after),
    );
    const partial = { ...query };
    partial.id_competencia =
      "in.(" +
      comp +
      "," +
      JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[1].id +
      ")";
    emit(partial);
    const sep = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[1].id;
    assert.throws(
      () =>
        broker.arm({
          rpc: "registrar_revisao_requisito_v117",
          payload: { p_id_competencia: sep, p_fundamento: fixture.foundation },
          requestId: randomUUID(),
          verified: { context: true, capability: true, reconciled: true },
          evidence: {
            competencies: [
              {
                official: true,
                current: true,
                organization: fixture.organization,
                contract: fixture.contract,
                id: sep,
                month: "2026-09-01",
              },
            ],
          },
        }),
      { message: "RECOVERY_R11_OPINION" },
    );
    assert.equal(broker.snapshot().count, 19);
  } finally {
    observer.close();
  }
});

test("R12 auth protocol rejects a newer partial September read instead of reusing an older postACK query", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    { EventEmitter } = await import("node:events");
  const sdk = await readFile(
      new URL("../../src/lib/competencias/parecerInternoDados.ts", import.meta.url),
      "utf8",
    ),
    select = sdk.match(/export const COLUNAS_PARECERES\s*=\s*"([^"]+)"/)[1],
    f = prep.FIXTURE,
    c = JSON.parse(prep.R5_RECOVERY_DOCUMENT.reportRaw).bindings.competencies[1].id;
  let now = 0;
  const page = new EventEmitter(),
    observer = prep.createOfficialObserver(page, {
      now: () => now,
      wait: async () => {
        now += 300001;
      },
    });
  const payload = { p_id_competencia: c },
    query = {
      select,
      id_competencia: "eq." + c,
      id_organizacao: "eq." + f.organization,
      id_contrato: "eq." + f.contract,
      order: "versao.desc,id.desc",
      offset: "0",
      limit: "25",
    },
    row = {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      id_competencia: c,
      id_organizacao: f.organization,
      id_contrato: f.contract,
      status: "rascunho",
      versao: 1,
      hash: "c".repeat(64),
      criado_em: "2026-11-09T00:00:00Z",
      aprovado_em: null,
      autor: null,
      texto: "Fixture local",
      aprovado_por: null,
    };
  const emit = (method, path, value, body) => {
    const url = f.api + "/rest/v1/" + path,
      r = {
        url: () => url,
        method: () => method,
        postData: () => (body ? JSON.stringify(body) : null),
        failure: () => null,
      };
    page.emit("request", r);
    if (value !== undefined)
      page.emit("response", {
        request: () => r,
        url: () => url,
        status: () => 200,
        body: async () => Buffer.from(JSON.stringify(value)),
      });
  };
  try {
    observer.markMutation("solicitar_parecer_interno", payload, {});
    emit("POST", "rpc/solicitar_parecer_interno", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", payload);
    await observer.flush();
    emit("GET", "pareceres_internos?" + new URLSearchParams(query), [row]);
    await observer.flush();
    const partial = { ...query };
    delete partial.order;
    emit("GET", "pareceres_internos?" + new URLSearchParams(partial));
    await assert.rejects(
      () =>
        observer.read("pareceres_internos", {
          id_competencia: c,
          id_organizacao: f.organization,
          id_contrato: f.contract,
        }),
      /PHASE_TIMEOUT|OBSERVATION_FAILED|RECOVERY_R11_OPINION/,
    );
  } finally {
    observer.close();
  }
});

test("R12 actual report recovery retains its ten fields while reservation stays in the intent ledger", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs"),
    { readFile } = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const src = await readFile(new URL("./prepare-visual-fixtures.mjs", import.meta.url), "utf8"),
    ast = ts.createSourceFile("prep.mjs", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS),
    nodes = [];
  function visit(n) {
    nodes.push(n);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  const entry = nodes.find(
      (n) => ts.isFunctionDeclaration(n) && n.name?.text === "runFixturePreparation",
    ),
    report = nodes.find(
      (n) =>
        ts.isVariableDeclaration(n) &&
        n.name.getText(ast) === "report" &&
        n.pos >= entry.pos &&
        n.end <= entry.end,
    ),
    recovery = report.initializer.properties
      .find((p) => p.name?.getText(ast) === "recovery")
      .initializer.getText(ast);
  const env = {
    R1_RECEIPTS_SHA256: prep.R1_RECOVERY_DOCUMENT.receiptsSha256,
    validatedBudget: { confirmedBefore: 10, priorReserved: 1, maxNewIntentions: 13 },
    R3_RECOVERY_DOCUMENT: prep.R3_RECOVERY_DOCUMENT,
    r4Recovery: prep.R4_RECOVERY_DOCUMENT,
    recoveryState: null,
  };
  const value = new Function(...Object.keys(env), "return (" + recovery + ");")(
    ...Object.values(env),
  );
  assert.deepEqual(Object.keys(value), [
    "ledgerSha256",
    "priorWorkflowRun",
    "confirmedBefore",
    "maxNewIntentions",
    "r3ReceiptsSha256",
    "r3WorkflowRun",
    "r4ZeroAuth",
    "reconciled",
    "sourceVersion",
    "sourceHash",
  ]);
  assert.equal(Object.hasOwn(value, "priorReserved"), false);
});

const R13_R12_PROOF = Object.freeze({
  schema: "contaos.single-request.r12-zero-auth.v1",
  headSha: "3d6bea3e938459f348130bf1d04431a072dba081",
  upstreamRun: 42666600147,
  fixturesRun: 42666864017,
  auditRun: 42666864220,
  privateJob: 129333370334,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
async function r13R12Fixture() {
  const { execFileSync } = await import("node:child_process"),
    responses = structuredClone(R13_R12_RESPONSES),
    requests = [];
  return {
    responses,
    requests,
    get: async (path) => {
      requests.push(path);
      assert.ok(Object.hasOwn(responses, path), "only ten fixed R12 metadata endpoints");
      return structuredClone(responses[path]);
    },
    git: async (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 4194304 }),
  };
}

const R15_R14_PROOF = Object.freeze({
  schema: "contaos.single-request.r14-zero-auth.v1",
  headSha: "6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36",
  upstreamRun: 42694401246,
  fixturesRun: 42694609672,
  auditRun: 42694609740,
  privateJob: 129423314958,
  attempt: 1,
  derivedNewBusinessIntents: 0,
  proof: "GITHUB_ACTIONS_LIVE_METADATA",
});
async function r15R14Fixture() {
  const { execFileSync } = await import("node:child_process");
  const responses = structuredClone(R15_R14_RESPONSES);
  const requests = [];
  return {
    responses,
    requests,
    get: async (path) => {
      requests.push(path);
      assert.ok(Object.hasOwn(responses, path), "only ten fixed R14 metadata endpoints");
      return structuredClone(responses[path]);
    },
    git: async (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 4194304 }),
  };
}

async function r13ControllerFixture() {
  const verify = fn("verifySingleRequest"),
    sha = "a".repeat(40),
    parent = "b".repeat(40);
  const repo = { full_name: "contaos999999/contaos-hml-control" };
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: parent,
    frontend_sha: "",
    deployment_id: "",
  };
  const raw = JSON.stringify(request),
    spec = sut.SINGLE_REQUEST;
  const upstream = {
    id: 91,
    workflow_id: 406076025,
    path: spec.upstreamPath,
    name: spec.upstreamName,
    event: "push",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    repository: repo,
    head_repository: repo,
  };
  const current = {
    id: 92,
    workflow_id: spec.fixtures.id,
    path: spec.fixtures.path,
    name: spec.fixtures.name,
    event: "workflow_run",
    head_branch: "main",
    head_sha: sha,
    run_attempt: 1,
    repository: repo,
    head_repository: repo,
  };
  const pull = {
    id: 300,
    number: 90,
    merged: true,
    state: "closed",
    merged_at: "2026-11-08T00:00:00Z",
    merge_commit_sha: sha,
    changed_files: 1,
    base: { ref: "main", sha: parent, repo },
    head: { sha: "d".repeat(40), ref: "request/fixtures", repo },
  };
  const review = {
    id: 301,
    state: "COMMENTED",
    user: { login: "contaos9999" },
    commit_id: pull.head.sha,
    submitted_at: "2026-11-08T00:00:00Z",
    body: JSON.stringify({
      schema: "contaos.single-request.review.v1",
      request_id: request.request_id,
      head_sha: pull.head.sha,
      critical: 0,
      important: 0,
      decision: "APROVAVEL",
    }),
  };
  const requiredCi = [
    { id: 501, workflow_id: 406076025, name: spec.upstreamName, path: spec.upstreamPath },
    {
      id: 502,
      workflow_id: 410005553,
      name: "ContaOS LOCK-TYPES-01 Double Barrier",
      path: ".github/workflows/lock-types-double-barrier.yml",
    },
  ].map((r) => ({
    ...r,
    head_sha: pull.head.sha,
    event: "pull_request",
    head_branch: pull.head.ref,
    repository: repo,
    head_repository: repo,
    status: "completed",
    conclusion: "success",
  }));
  const env = {
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_REF: "refs/heads/main",
    GITHUB_REPOSITORY: repo.full_name,
    GITHUB_RUN_ID: "92",
    GITHUB_RUN_ATTEMPT: "1",
    CONTAOS_HARNESS_SHA: sha,
    GITHUB_EVENT_PATH: "event.json",
  };
  const event = { action: "completed", repository: repo, workflow_run: upstream };
  const read = async (path) => (path === "event.json" ? JSON.stringify(event) : raw);
  const stat = async () => ({ isFile: () => true, isSymbolicLink: () => false, size: raw.length });
  const gitCalls = [];
  const git = async (args) => {
    gitCalls.push([...args]);
    if (args[0] === "show" && args[1].startsWith("6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36:"))
      return r14Fixture.git(args);
    if (args[0] === "show" && args[1].startsWith("3d6bea3e938459f348130bf1d04431a072dba081:"))
      return r12Fixture.git(args);
    assert.equal(args.includes(""), false, "Git nunca recebe SHA vazio");
    if (args[0] === "show" && args[1].startsWith("bc7c1625f0a7851fe7b8f0500f3bf51daf1e1215:"))
      return (await r8R7Fixture()).git(args);
    if (args[0] === "show" && args[1].startsWith(R5_R4_HEAD + ":"))
      return (await r5R4Fixture()).git(args);
    if (args[0] === "show") return raw;
    if (args[0] === "rev-parse") return sha;
    if (args[0] === "rev-list") return [sha, parent, "d".repeat(40)].join(" ");
    if (args[0] === "merge-base") return "";
    if (args[0] === "diff-tree") return "A\t" + spec.path;
    if (args[0] === "ls-tree") return "100644 blob " + "e".repeat(40) + "\t" + spec.path;
    if (args[0] === "log") return sha;
    throw new Error("unexpected git");
  };
  const r12Fixture = await r13R12Fixture();
  const r14Fixture = await r15R14Fixture();
  const r4Fixture = await r5R4Fixture();
  const r7Fixture = await r8R7Fixture();
  const get = async (path) => {
    if (/42694401246|42694609672|42694609740/.test(path)) return r14Fixture.get(path);
    if (/42666600147|42666864017|42666864220/.test(path)) return r12Fixture.get(path);
    if (/42601246471|42601383933|42601384052/.test(path)) return r7Fixture.get(path);
    if (path.includes(R5_R4_HEAD) || /42568309807|42568382053|42568382029/.test(path))
      return r4Fixture.get(path);
    if (path === "") return { ...repo, private: false };
    if (path.startsWith("/commits/")) return [pull];
    if (path === "/pulls/90") return pull;
    if (path.startsWith("/pulls/90/reviews?")) return [review];
    if (path.startsWith("/actions/runs?head_sha="))
      return { total_count: requiredCi.length, workflow_runs: requiredCi };
    if (path === "/git/ref/heads/main") return { object: { sha } };
    if (path === "/actions/workflows/" + spec.fixtures.id)
      return { ...spec.fixtures, state: "active" };
    if (path === "/actions/workflows/" + spec.audit.id) return { ...spec.audit, state: "active" };
    if (path === "/actions/runs/91") return upstream;
    if (path === "/actions/runs/92") return current;
    if (path.startsWith("/actions/workflows/" + spec.fixtures.id + "/runs?"))
      return { total_count: 1, workflow_runs: [current] };
    if (path.startsWith("/actions/workflows/" + spec.audit.id + "/runs?"))
      return {
        total_count: 1,
        workflow_runs: [{ ...current, id: 93, workflow_id: spec.audit.id }],
      };
    if (path.startsWith("/actions/runs/93/jobs?"))
      return { total_count: 1, jobs: [{ name: spec.audit.privateName, conclusion: "skipped" }] };
    throw new Error("unexpected API " + path);
  };
  const options = { operation: "fixtures", env, read, stat, git, get, wait: async () => {} };

  return { options, sha, parent, raw, env, read, stat, git, get, gitCalls, r12Fixture, r14Fixture };
}

test("R13 request nonce is accepted and the preAuth R12 nonce stays spent", () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: sut.SINGLE_REQUEST.fixtures.nonce,
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.deepEqual(sut.parseSingleRequest(JSON.stringify(request), "fixtures"), request);
  assert.throws(
    () =>
      sut.parseSingleRequest(
        JSON.stringify({ ...request, request_id: "trilha-a-fixtures-20261109-r12" }),
        "fixtures",
      ),
    /REQUEST_/,
  );
});
test("R13 actual selected controller requires the live closed R12 proof before authorizing context", async () => {
  const f = await r13ControllerFixture(),
    result = await sut.verifySingleRequest(f.options);
  assert.deepEqual(result.r12ZeroAuth, R13_R12_PROOF);
  assert.equal(f.r12Fixture.requests.length, 10);
});
test("R13 actual request Git contract requires its integrated gate in the approved parent", async () => {
  const f = await r13ControllerFixture();
  await sut.verifySingleRequest(f.options);
  assert.ok(
    f.gitCalls.some(
      (args) =>
        args.join(" ") ===
        "merge-base --is-ancestor 0024b3c6739ab6296ec12338f11cf792d3a5f84b " + f.parent,
    ),
  );
});
test("R13 actual controller refuses an R12 private Master step that executed", async () => {
  const f = await r13ControllerFixture(),
    jobs = f.r12Fixture.responses["/actions/runs/42666864017/attempts/1/jobs?per_page=100&page=1"];
  const privateJob = jobs.jobs.find((j) => j.id === 129333370334);
  privateJob.steps.find((s) => s.number === 16).conclusion = "success";
  await assert.rejects(() => sut.verifySingleRequest(f.options), { code: "RECOVERY_R12_PROOF" });
});
test("R13 actual controller refuses changed original R12 executable source", async () => {
  const f = await r13ControllerFixture();
  await assert.rejects(
    () =>
      sut.verifySingleRequest({
        ...f.options,
        git: async (args) =>
          args[0] === "show" &&
          args[1] ===
            "3d6bea3e938459f348130bf1d04431a072dba081:scripts/hml/prepare-visual-fixtures.mjs"
            ? "changed"
            : f.git(args),
      }),
    { code: "RECOVERY_R12_PROOF" },
  );
});
test("R13 actual local Master loader rejects missing R12 proof without a network call", async () => {
  const f = await r13ControllerFixture(),
    result = await sut.verifySingleRequest(f.options),
    identity = { harnessSha: f.sha, moduleHash: "e".repeat(64), testHash: "f".repeat(64) },
    runtime = {
      schema: "contaos.single-request.runtime.v1",
      createdAt: 100000,
      ...result,
      r12ZeroAuth: R13_R12_PROOF,
      identity,
    };
  const local = {
    operation: "fixtures",
    env: f.env,
    stat: f.stat,
    git: f.git,
    identity: async () => identity,
    now: () => 100000,
    fresh: true,
    read: async (path) =>
      path.includes(".audit-work/single-request.json") ? JSON.stringify(runtime) : f.read(path),
  };
  assert.equal(await sut.loadSingleRequestProof(local), true);
  delete runtime.r12ZeroAuth;
  await assert.rejects(() => sut.loadSingleRequestProof(local), { code: "RECOVERY_R12_PROOF" });
  assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
});

function r13IgnoredBuildCommand(approvedSha) {
  if (
    typeof approvedSha !== "string" ||
    approvedSha.length !== 40 ||
    !/^[a-f0-9]{40}$/.test(approvedSha)
  )
    throw Error("R13_IGNORED_BUILD_SHA");
  return (
    'if [ "$VERCEL_ENV" = "production" ] && [ "$VERCEL_GIT_COMMIT_SHA" = "' +
    approvedSha +
    '" ]; then echo CONTAOS_HML_PINNED_BUILD_ALLOW_EXIT_1; exit 1; else exit 0; fi'
  );
}
async function r13PosixExit(command, variables) {
  const { execFile } = await import("node:child_process"),
    env = Object.create(null),
    allowed = new Set(["VERCEL_ENV", "VERCEL_GIT_COMMIT_SHA"]);
  for (const [key, d] of Object.entries(Object.getOwnPropertyDescriptors(variables))) {
    assert.ok(allowed.has(key));
    assert.ok(Object.hasOwn(d, "value"));
    assert.equal(typeof d.value, "string");
    env[key] = d.value;
  }
  assert.ok(Object.keys(env).length <= 2);
  return new Promise((resolve, reject) =>
    execFile(
      "/bin/sh",
      ["-c", command],
      { env, timeout: 3000, maxBuffer: 4096 },
      (error, stdout, stderr) => {
        if (
          !["", "CONTAOS_HML_PINNED_BUILD_ALLOW_EXIT_1\n"].includes(stdout) ||
          stderr !== "" ||
          (error && error.code !== 1)
        ) {
          reject(Error("R13_POSIX_EXECUTION"));
          return;
        }
        resolve({ exit: error ? 1 : 0, stdout });
      },
    ),
  );
}
test("R13 POSIX ignored-build template admits only the approved production SHA", async () => {
  const approved = "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
    command = r13IgnoredBuildCommand(approved);
  assert.equal(
    command,
    'if [ "$VERCEL_ENV" = "production" ] && [ "$VERCEL_GIT_COMMIT_SHA" = "0024b3c6739ab6296ec12338f11cf792d3a5f84b" ]; then echo CONTAOS_HML_PINNED_BUILD_ALLOW_EXIT_1; exit 1; else exit 0; fi',
  );
  for (const bad of [
    undefined,
    null,
    {},
    "",
    "a".repeat(39),
    "a".repeat(41),
    "g".repeat(40),
    approved + "\n",
    approved + '"; exit 1; #',
  ])
    assert.throws(() => r13IgnoredBuildCommand(bad), /R13_IGNORED_BUILD_SHA/);
  for (const [env, expected] of [
    [{ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: approved }, 1],
    [{ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: approved }, 0],
    [
      {
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_SHA: "348649f6a0af5d468ad2ac401b2fd96afa125cc1",
      },
      0,
    ],
    [{ VERCEL_GIT_COMMIT_SHA: approved }, 0],
    [{ VERCEL_ENV: "production" }, 0],
    [{}, 0],
    [
      { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: "348649f6a0af5d468ad2ac401b2fd96afa125cc1" },
      0,
    ],
    [{ VERCEL_ENV: "", VERCEL_GIT_COMMIT_SHA: approved }, 0],
    [{ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "" }, 0],
    [{ VERCEL_ENV: "", VERCEL_GIT_COMMIT_SHA: "" }, 0],
    [{ VERCEL_ENV: 'production"; exit 1; #', VERCEL_GIT_COMMIT_SHA: approved }, 0],
    [{ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: approved + '"; exit 1; #' }, 0],
    [{ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "$(exit 1)" }, 0],
  ])
    assert.deepEqual(await r13PosixExit(command, env), {
      exit: expected,
      stdout: expected === 1 ? "CONTAOS_HML_PINNED_BUILD_ALLOW_EXIT_1\n" : "",
    });
  const observedOld =
    'if [ "$VERCEL_ENV" = "preview" ] && [ "$VERCEL_GIT_COMMIT_SHA" = "348649f6a0af5d468ad2ac401b2fd96afa125cc1" ]; then exit 1; else exit 0; fi';
  assert.deepEqual(
    await r13PosixExit(observedOld, {
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "348649f6a0af5d468ad2ac401b2fd96afa125cc1",
    }),
    { exit: 1, stdout: "" },
  );
  assert.deepEqual(
    await r13PosixExit(observedOld, {
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "631090724d6b85483737c60a44d322f268fc1c8c",
    }),
    { exit: 0, stdout: "" },
  );
  const { harnessSha } = await sut.harnessIdentity();
  assert.match(harnessSha, /^[a-f0-9]{40}$/);
  console.log(
    JSON.stringify({ phase: "R13_POSIX_PROOF", state: "PASS", harnessSha, approvedSha: approved }),
  );
});

test(
  "R13 canonical restored public deployment is discovered live before any new nonce",
  { timeout: 210000 },
  async () => {
    const graph = await sut.discoverPublicGraph();
    const expected = {
      frontendSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
      deploymentId: "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
    };
    assert.deepEqual(sut.resolveDeploymentIdentity(graph.modules, expected), expected);
    assert.ok(graph.modules.size > 0 && graph.modules.size <= 128);
    assert.ok(Number.isSafeInteger(graph.bytes) && graph.bytes > 0 && graph.bytes <= 8388608);
    const { harnessSha } = await sut.harnessIdentity();
    console.log(
      JSON.stringify({
        phase: "R13_PUBLIC_DEPLOYMENT_PROBE",
        state: "PASS",
        harnessSha,
        frontendSha: expected.frontendSha,
        deploymentId: expected.deploymentId,
        moduleCount: graph.modules.size,
        bytes: graph.bytes,
      }),
    );
  },
);

test("R13 actual controller rejects a foreign R12 repository owner identity", async () => {
  for (const key of ["repository", "head_repository"])
    for (const field of ["id", "login"]) {
      const f = await r13ControllerFixture(),
        row = f.r12Fixture.responses["/actions/runs/42666864017"];
      row[key].owner[field] = field === "id" ? 1 : "foreign";
      await assert.rejects(() => sut.verifySingleRequest(f.options), {
        code: "RECOVERY_R12_PROOF",
      });
    }
});
test("R13 actual controller rejects missing R12 repository owner metadata", async () => {
  for (const key of ["repository", "head_repository"]) {
    const f = await r13ControllerFixture();
    delete f.r12Fixture.responses["/actions/runs/42666864017"][key].owner;
    await assert.rejects(() => sut.verifySingleRequest(f.options), { code: "RECOVERY_R12_PROOF" });
  }
});
test("R13 actual controller rejects private or missing-public R12 repository metadata", async () => {
  for (const key of ["repository", "head_repository"])
    for (const value of [true, undefined]) {
      const f = await r13ControllerFixture();
      f.r12Fixture.responses["/actions/runs/42666864017"][key].private = value;
      await assert.rejects(() => sut.verifySingleRequest(f.options), {
        code: "RECOVERY_R12_PROOF",
      });
    }
});

async function r13WarmLocalProof() {
  const f = await r13ControllerFixture(),
    result = await sut.verifySingleRequest(f.options),
    identity = { harnessSha: f.sha, moduleHash: "e".repeat(64), testHash: "f".repeat(64) },
    runtime = {
      schema: "contaos.single-request.runtime.v1",
      createdAt: 100000,
      ...result,
      identity,
    };
  const local = {
    operation: "fixtures",
    env: f.env,
    stat: f.stat,
    git: f.git,
    identity: async () => identity,
    now: () => 100000,
    fresh: true,
    read: async (path) =>
      path.includes(".audit-work/single-request.json") ? JSON.stringify(runtime) : f.read(path),
  };
  await sut.loadSingleRequestProof(local);
  assert.deepEqual(sut.getValidatedR12ZeroAuth(), R13_R12_PROOF);
  return { f, local, runtime };
}
test("R13 actual loader clears its warm context and R12 cache before rejecting a hostile environment", async () => {
  const { f, local } = await r13WarmLocalProof();
  let traps = 0;
  const env = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  await assert.rejects(() => sut.loadSingleRequestProof({ ...local, env }), {
    code: "PREPARE_SECRET_ENV",
  });
  assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
  assert.throws(() => sut.getValidatedR12ZeroAuth(), { code: "RECOVERY_R12_PROOF" });
  assert.equal(traps, 0);
});
test("R13 actual controller clears its warm R12 cache before rejecting a hostile environment", async () => {
  const { f } = await r13WarmLocalProof();
  let traps = 0;
  const env = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  await assert.rejects(() => sut.verifySingleRequest({ ...f.options, env }), {
    code: "PREPARE_SECRET_ENV",
  });
  assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
  assert.throws(() => sut.getValidatedR12ZeroAuth(), { code: "RECOVERY_R12_PROOF" });
  assert.equal(traps, 0);
});

test("R13 R12 metadata proof is closed to altered runs attempts jobs steps artifacts and sources", async () => {
  const valid = await r13R12Fixture(),
    parentSha = "6605fbfc40359a1565abbffc8b8358ff4cf44b83";
  assert.deepEqual(
    await sut.verifyR12ZeroAuth({ get: valid.get, git: valid.git, parentSha }),
    R13_R12_PROOF,
  );
  assert.equal(valid.requests.length, 10);
  assert.equal(new Set(valid.requests).size, 10);
  const run = "/actions/runs/42666864017",
    jobs = run + "/attempts/1/jobs?per_page=100&page=1",
    artifacts = run + "/artifacts?per_page=100&page=1";
  const mutations = [
    (m) => (m[run].head_sha = "f".repeat(40)),
    (m) => (m[run].head_branch = "other"),
    (m) => (m[run].event = "push"),
    (m) => (m[run].run_attempt = 2),
    (m) => (m[run].status = "queued"),
    (m) => (m[run].conclusion = "success"),
    (m) => (m[run].workflow_id = 1),
    (m) => (m[run].path = "foreign"),
    (m) => (m[run].repository.id = 1),
    (m) => (m[run].head_repository.full_name = "foreign/repo"),
    (m) => (m[run].created_at = "invalid"),
    (m) => (m[run].updated_at = "2000-01-01T00:00:00Z"),
    (m) => (m[run + "/attempts/1"].run_attempt = 2),
    (m) => (m[run + "/attempts/1"].id = 1),
    (m) => (m[jobs].total_count = 4),
    (m) => m[jobs].jobs.push({ ...m[jobs].jobs[0] }),
    (m) => m[jobs].jobs.pop(),
    (m) => (m[jobs].jobs.find((j) => j.id === 129333370334).name = "unknown"),
    (m) => (m[jobs].jobs.find((j) => j.id === 129333370334).run_id = 1),
    (m) => (m[jobs].jobs.find((j) => j.id === 129333370334).run_attempt = 2),
    (m) => (m[jobs].jobs.find((j) => j.id === 129333370334).head_sha = "f".repeat(40)),
    (m) => (m[jobs].jobs.find((j) => j.id === 129333370334).head_branch = "other"),
    (m) =>
      (m[jobs].jobs
        .find((j) => j.id === 129333370334)
        .steps.find((s) => s.number === 7).conclusion = "success"),
    (m) =>
      (m[jobs].jobs.find((j) => j.id === 129333370334).steps.find((s) => s.number === 7).name =
        "unknown"),
    (m) =>
      (m[jobs].jobs
        .find((j) => j.id === 129333370334)
        .steps.find((s) => s.number === 16).conclusion = "success"),
    (m) =>
      (m[jobs].jobs.find((j) => j.id === 129333370334).steps = m[jobs].jobs
        .find((j) => j.id === 129333370334)
        .steps.filter((s) => s.number !== 16)),
    (m) =>
      m[jobs].jobs
        .find((j) => j.id === 129333370334)
        .steps.push({ ...m[jobs].jobs.find((j) => j.id === 129333370334).steps[0] }),
    (m) =>
      (m[jobs].jobs
        .find((j) => j.id === 129333370334)
        .steps.find((s) => s.number === 16).started_at = "invalid"),
    (m) => (m[artifacts].total_count = 1),
    (m) => m[artifacts].artifacts.push({ id: 1 }),
  ];
  for (const change of mutations) {
    const f = await r13R12Fixture();
    change(f.responses);
    await assert.rejects(() => sut.verifyR12ZeroAuth({ get: f.get, git: f.git, parentSha }), {
      code: "RECOVERY_R12_PROOF",
    });
    assert.equal(new Set(f.requests).size, f.requests.length);
    assert.ok(f.requests.length <= 10);
  }
  for (const path of [
    ".github/workflows/contaos-trilha-a-fixtures.yml",
    ".github/workflows/contaos-trilha-a-authenticated.yml",
    "scripts/hml/authenticated-visual-audit.mjs",
    "scripts/hml/prepare-visual-fixtures.mjs",
  ]) {
    const f = await r13R12Fixture();
    await assert.rejects(
      () =>
        sut.verifyR12ZeroAuth({
          get: f.get,
          git: async (args) =>
            args[0] === "show" && args[1].endsWith(":" + path) ? "changed" : f.git(args),
          parentSha,
        }),
      { code: "RECOVERY_R12_PROOF" },
    );
    assert.equal(f.requests.length, 0);
  }
  const f = await r13R12Fixture();
  await assert.rejects(
    () =>
      sut.verifyR12ZeroAuth({
        get: f.get,
        git: async () => {
          throw Error("CANARY");
        },
        parentSha,
      }),
    { code: "RECOVERY_R12_PROOF" },
  );
  assert.equal(f.requests.length, 0);
});
test("R13 R12 cache validator rejects hostile and cross proofs without reading private values", () => {
  let reads = 0,
    traps = 0;
  const getter = { ...R13_R12_PROOF };
  Object.defineProperty(getter, "headSha", {
    enumerable: true,
    get() {
      reads++;
      throw Error("CANARY");
    },
  });
  const symbol = { ...R13_R12_PROOF };
  symbol[Symbol("CANARY")] = true;
  const proxy = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("CANARY");
      },
      getPrototypeOf() {
        traps++;
        throw Error("CANARY");
      },
      ownKeys() {
        traps++;
        throw Error("CANARY");
      },
    },
  );
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  const prototype = Object.create(proxy);
  for (const value of [
    undefined,
    null,
    {},
    sut.R7_ZERO_AUTH_PROOF,
    Object.fromEntries(Object.entries(R13_R12_PROOF).reverse()),
    { ...R13_R12_PROOF, derivedNewBusinessIntents: 1 },
    { ...R13_R12_PROOF, attempt: 2 },
    { ...R13_R12_PROOF, headSha: "f".repeat(40) },
    { ...R13_R12_PROOF, extra: true },
    getter,
    symbol,
    proxy,
    revoked.proxy,
    prototype,
  ]) {
    assert.throws(() => sut.validateR12ZeroAuthProof(value), { code: "RECOVERY_R12_PROOF" });
  }
  assert.deepEqual(
    sut.validateR12ZeroAuthProof(Object.freeze({ ...R13_R12_PROOF })),
    R13_R12_PROOF,
  );
  assert.equal(reads, 0);
  assert.equal(traps, 0);
});
test("R13 local cache rejects cross proof and stale refresh before private context without metadata GET", async () => {
  const originalFetch = globalThis.fetch;
  let gets = 0;
  globalThis.fetch = async () => {
    gets++;
    throw Error("UNEXPECTED_METADATA_GET");
  };
  try {
    const { f, local, runtime } = await r13WarmLocalProof();
    for (const r12ZeroAuth of [
      undefined,
      null,
      sut.R7_ZERO_AUTH_PROOF,
      { ...R13_R12_PROOF, attempt: 2 },
      Object.fromEntries(Object.entries(R13_R12_PROOF).reverse()),
    ]) {
      await assert.rejects(
        () =>
          sut.loadSingleRequestProof({
            ...local,
            read: async (path) =>
              path.includes(".audit-work/single-request.json")
                ? JSON.stringify({ ...runtime, r12ZeroAuth })
                : f.read(path),
          }),
        { code: "RECOVERY_R12_PROOF" },
      );
      assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
      assert.throws(() => sut.getValidatedR12ZeroAuth(), { code: "RECOVERY_R12_PROOF" });
    }
    await assert.rejects(() => sut.loadSingleRequestProof({ ...local, now: () => 130001 }), {
      code: "REQUEST_RUNTIME",
    });
    assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
    assert.equal(gets, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("R14 recovery document is mandatory, byte exact, and rejects hostile authority", () => {
  const validate = fn("validateR13RecoveryDocument");
  const doc = sut.R13_RECOVERY_DOCUMENT;
  assert.equal(validate(doc).schema, "contaos.fixture.recovery-r13.v1");
  for (const bad of [
    undefined,
    null,
    {},
    { ...doc, reportRaw: doc.reportRaw + " " },
    { ...doc, receiptsRaw: '{"schema":"contaos.fixture.receipts.v1","receipts":[]}' },
  ])
    assert.throws(() => validate(bad), /RECOVERY_R13_LEDGER/);
  let calls = 0;
  const getter = { ...doc };
  Object.defineProperty(getter, "reportRaw", {
    enumerable: true,
    get() {
      calls++;
      throw Error("PRIVATE_CANARY");
    },
  });
  assert.throws(() => validate(getter), /RECOVERY_R13_LEDGER/);
  assert.throws(
    () =>
      validate(
        new Proxy(doc, {
          get() {
            calls++;
            throw Error("PRIVATE_CANARY");
          },
        }),
      ),
    /RECOVERY_R13_LEDGER/,
  );
  assert.equal(calls, 0);
  const reordered = Object.fromEntries(Object.entries(doc).reverse());
  assert.throws(() => validate(reordered), /RECOVERY_R13_LEDGER/);
});
test("R14 spends R13 and admits only the governed next fixture nonce", () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261109-r13",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(request)), /REQUEST_SCHEMA/);
  request.request_id = sut.SINGLE_REQUEST.fixtures.nonce;
  assert.equal(sut.parseSingleRequest(JSON.stringify(request)).request_id, request.request_id);
});

test("R15 transport never retries generic fetch failure or reads error getters", async () => {
  let calls = 0;
  let traps = 0;
  const token = "R15_METADATA_CANARY";
  const error = new Proxy(
    {},
    {
      get() {
        traps++;
        throw Error("PRIVATE_CANARY");
      },
    },
  );
  const get = sut.singleRequestGet({
    token,
    publicOnly: false,
    diagnostic: true,
    env: { CONTAOS_ACTIONS_READ_TOKEN: token },
    fetchImpl: async () => {
      calls++;
      throw error;
    },
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), (caught) => {
    assert.equal(sut.requestApiDiagnostic(caught).category, "TRANSPORT");
    return true;
  });
  assert.equal(calls, 1);
  assert.equal(traps, 0);
});
test("R15 body transport failure stays closed without retry or ReferenceError", async () => {
  let calls = 0;
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    diagnostic: true,
    fetchImpl: async () => {
      calls++;
      return {
        status: 200,
        text: async () => {
          throw Error("PRIVATE_BODY_CANARY");
        },
      };
    },
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), (error) => {
    assert.equal(error.code, "REQUEST_API_UNAVAILABLE");
    assert.deepEqual(sut.requestApiDiagnostic(error), {
      schema: "contaos.single-request.api-failure.v1",
      phase: "REQUEST_API",
      endpointKind: "RUN_JOBS",
      statusHTTP: 200,
      category: "TRANSPORT",
    });
    return true;
  });
  assert.equal(calls, 1);
});
test("R15 body timeout repeats the same GET once and accepts only the second complete body", async () => {
  let calls = 0;
  let ticks = 0;
  const urls = [];
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    diagnostic: true,
    now: () => (ticks++ === 0 ? 0 : 59995),
    fetchImpl: async (url, options) => {
      calls++;
      urls.push(url);
      return {
        status: 200,
        text:
          calls === 1
            ? () =>
                new Promise((resolve, reject) => {
                  const hold = setTimeout(() => reject(Error("BODY_CANARY")), 100);
                  options.signal.addEventListener(
                    "abort",
                    () => {
                      clearTimeout(hold);
                      reject(Error("BODY_CANARY"));
                    },
                    { once: true },
                  );
                })
            : async () => '{"total_count":0,"jobs":[]}',
      };
    },
  });
  assert.deepEqual(await get("/actions/runs/1/jobs?per_page=100&page=1"), {
    total_count: 0,
    jobs: [],
  });
  assert.equal(calls, 2);
  assert.equal(urls[0], urls[1]);
});
test("R15 exhausted typed timeouts have no third attempt", async () => {
  let calls = 0;
  let ticks = 0;
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    diagnostic: true,
    now: () => (ticks++ === 0 ? 0 : 59995),
    fetchImpl: async (url, options) =>
      new Promise((resolve, reject) => {
        calls++;
        const hold = setTimeout(() => reject(Error("TIMEOUT_CANARY")), 100);
        options.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(hold);
            reject(Error("TIMEOUT_CANARY"));
          },
          { once: true },
        );
      }),
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), (error) => {
    assert.equal(sut.requestApiDiagnostic(error).category, "TIMEOUT");
    return true;
  });
  assert.equal(calls, 2);
});
test("R15 revalidates the token before a timeout retry", async () => {
  let calls = 0;
  let ticks = 0;
  const token = "R15_METADATA_CANARY";
  const env = { CONTAOS_ACTIONS_READ_TOKEN: token };
  const get = sut.singleRequestGet({
    token,
    publicOnly: false,
    env,
    now: () => (ticks++ === 0 ? 0 : 59995),
    fetchImpl: async (url, options) =>
      new Promise((resolve, reject) => {
        calls++;
        const hold = setTimeout(() => reject(Error("TOKEN_CANARY")), 100);
        options.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(hold);
            env.CONTAOS_ACTIONS_READ_TOKEN = "CHANGED";
            reject(Error("TOKEN_CANARY"));
          },
          { once: true },
        );
      }),
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), {
    code: "REQUEST_API_TOKEN",
  });
  assert.equal(calls, 1);
});
test("R15 does not accept a response after the shared deadline", async () => {
  let clock = 0;
  let calls = 0;
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    now: () => clock,
    fetchImpl: async () => {
      calls++;
      clock = 60001;
      return { status: 200, text: async () => "{}" };
    },
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), {
    code: "REQUEST_API_TIMEOUT",
  });
  assert.equal(calls, 1);
});
test("R15 spends R14 and admits only the next governed fixture nonce", () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261109-r14",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(request)), /REQUEST_SCHEMA/);
  request.request_id = sut.SINGLE_REQUEST.fixtures.nonce;
  assert.equal(sut.parseSingleRequest(JSON.stringify(request)).request_id, request.request_id);
});

test("R15 original R14 proof uses ten closed endpoints and rejects any private execution", async () => {
  const f = await r15R14Fixture();
  const parentSha = sut.SINGLE_REQUEST.metadataTimeoutGateSha;
  assert.deepEqual(
    await sut.verifyR14ZeroAuth({ get: f.get, git: f.git, parentSha }),
    R15_R14_PROOF,
  );
  assert.equal(f.requests.length, 10);
  for (const change of [
    (r) => {
      r["/actions/runs/42694609672/attempts/1/jobs?per_page=100&page=1"].jobs[2].conclusion =
        "success";
    },
    (r) => {
      r["/actions/runs/42694609672/artifacts?per_page=100&page=1"].total_count = 1;
    },
    (r) => {
      r["/actions/runs/42694609740/attempts/1/jobs?per_page=100&page=1"].jobs[0].steps.find(
        (s) => s.number === 13,
      ).conclusion = "skipped";
    },
    (r) => {
      r["/actions/runs/42694609672"].run_attempt = 2;
    },
    (r) => {
      r["/actions/runs/42694401246"].head_repository.owner.id = 1;
    },
  ]) {
    const bad = await r15R14Fixture();
    change(bad.responses);
    await assert.rejects(sut.verifyR14ZeroAuth({ get: bad.get, git: bad.git, parentSha }), {
      code: "RECOVERY_R14_PROOF",
    });
  }
  await assert.rejects(
    sut.verifyR14ZeroAuth({
      get: f.get,
      parentSha,
      git: async (args) => (args[0] === "show" ? (await f.git(args)) + " " : f.git(args)),
    }),
    { code: "RECOVERY_R14_PROOF" },
  );
});
test("R15 R14 cache is nine ordered own data fields without getter or Proxy effects", () => {
  assert.equal(Object.keys(sut.validateR14ZeroAuthProof(R15_R14_PROOF)).length, 9);
  let reads = 0;
  const accessor = { ...R15_R14_PROOF };
  Object.defineProperty(accessor, "headSha", {
    enumerable: true,
    get() {
      reads++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  for (const value of [
    undefined,
    {},
    accessor,
    new Proxy(
      {},
      {
        ownKeys() {
          reads++;
          throw Error("PRIVATE_CANARY");
        },
      },
    ),
    revoked.proxy,
    { ...R15_R14_PROOF, attempt: 2 },
    Object.fromEntries(Object.entries(R15_R14_PROOF).reverse()),
  ])
    assert.throws(() => sut.validateR14ZeroAuthProof(value), /RECOVERY_R14_PROOF/);
  assert.equal(reads, 0);
});
test("R15 actual controller and Master loader require R14 proof and publish caches atomically", async () => {
  const f = await r13ControllerFixture();
  const result = await sut.verifySingleRequest(f.options);
  assert.deepEqual(result.r14ZeroAuth, R15_R14_PROOF);
  assert.equal(f.r14Fixture.requests.length, 10);
  const before = f.r14Fixture.requests.length;
  const identity = { harnessSha: f.sha, moduleHash: "e".repeat(64), testHash: "f".repeat(64) };
  const runtime = {
    schema: "contaos.single-request.runtime.v1",
    createdAt: 100000,
    ...result,
    identity,
  };
  const local = {
    operation: "fixtures",
    env: f.env,
    stat: f.stat,
    git: f.git,
    identity: async () => identity,
    now: () => 100000,
    fresh: true,
    read: async (path) =>
      path.includes(".audit-work/single-request.json") ? JSON.stringify(runtime) : f.read(path),
  };
  assert.equal(await sut.loadSingleRequestProof(local), true);
  assert.deepEqual(sut.getValidatedR14ZeroAuth(), R15_R14_PROOF);
  assert.deepEqual(sut.getValidatedR4ZeroAuth(), sut.R4_ZERO_AUTH_PROOF);
  assert.equal(f.r14Fixture.requests.length, before);
  delete runtime.r14ZeroAuth;
  await assert.rejects(sut.loadSingleRequestProof(local), { code: "RECOVERY_R14_PROOF" });
  assert.equal(sut.singleRequestEventAllowed(f.env, "fixtures"), false);
  assert.throws(() => sut.getValidatedR12ZeroAuth(), /RECOVERY_R12_PROOF/);
  assert.throws(() => sut.getValidatedR14ZeroAuth(), /RECOVERY_R14_PROOF/);
  await assert.rejects(
    sut.verifySingleRequest({
      ...f.options,
      env: { ...f.env, MASTER_PASSWORD: "PRIVATE_CANARY" },
    }),
    { code: "PREPARE_SECRET_ENV" },
  );
  assert.throws(() => sut.getValidatedR14ZeroAuth(), /RECOVERY_R14_PROOF/);
  assert.equal(f.r14Fixture.requests.length, before);
});
test("R15 signal caps each real attempt at five seconds without inspecting thrown errors", async () => {
  let calls = 0;
  const started = performance.now();
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    fetchImpl: async (url, options) => {
      calls++;
      if (calls > 1) return { status: 200, text: async () => "{}" };
      return new Promise((resolve, reject) => {
        const hold = setTimeout(() => reject(Error("UNABORTED_CANARY")), 6500);
        options.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(hold);
            reject(Error("TIMEOUT_CANARY"));
          },
          { once: true },
        );
      });
    },
  });
  assert.deepEqual(await get("/actions/runs/1/jobs?per_page=100&page=1"), {});
  assert.equal(calls, 2);
  const elapsed = performance.now() - started;
  assert.ok(elapsed >= 4500 && elapsed < 10000);
});

test("R15 named TimeoutError without an aborted own signal is never retried", async () => {
  let calls = 0;
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    diagnostic: true,
    fetchImpl: async () => {
      calls++;
      throw Object.assign(new Error("PRIVATE_CANARY"), { name: "TimeoutError" });
    },
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), (error) => {
    assert.equal(sut.requestApiDiagnostic(error).category, "TRANSPORT");
    return true;
  });
  assert.equal(calls, 1);
});
test("R15 Master ENV introduced by the first timeout blocks the second fetch", async () => {
  let calls = 0;
  let ticks = 0;
  const token = "R15_METADATA_CANARY";
  const env = { CONTAOS_ACTIONS_READ_TOKEN: token };
  const get = sut.singleRequestGet({
    token,
    publicOnly: false,
    env,
    now: () => (ticks++ === 0 ? 0 : 59995),
    fetchImpl: async (url, options) =>
      new Promise((resolve, reject) => {
        calls++;
        const hold = setTimeout(() => reject(Error("ENV_CANARY")), 100);
        options.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(hold);
            env.MASTER_PASSWORD = "PRIVATE_CANARY";
            reject(Error("ENV_CANARY"));
          },
          { once: true },
        );
      }),
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), {
    code: "PREPARE_SECRET_ENV",
  });
  assert.equal(calls, 1);
});
test("R15 a complete body after the shared deadline is rejected without retry", async () => {
  let calls = 0;
  let clock = 0;
  const get = sut.singleRequestGet({
    publicOnly: true,
    env: {},
    now: () => clock,
    fetchImpl: async () => {
      calls++;
      return {
        status: 200,
        text: async () => {
          clock = 60001;
          return "{}";
        },
      };
    },
  });
  await assert.rejects(get("/actions/runs/1/jobs?per_page=100&page=1"), {
    code: "REQUEST_API_TIMEOUT",
  });
  assert.equal(calls, 1);
});
test("R16 current nonce spends R15 and requires both recovery and void ancestors", async () => {
  const f = await r13ControllerFixture();
  const old = { ...JSON.parse(f.raw), request_id: "trilha-a-fixtures-20261109-r15" };
  assert.throws(() => sut.parseSingleRequest(JSON.stringify(old)), /REQUEST_SCHEMA/);
  assert.equal(sut.parseSingleRequest(f.raw).request_id, "trilha-a-fixtures-20261110-r20");
  for (const ancestor of [
    sut.SINGLE_REQUEST.r15RecoveryGateSha,
    sut.SINGLE_REQUEST.void204GateSha,
    sut.SINGLE_REQUEST.void204BuildSha,
  ]) {
    let missing = false;
    await assert.rejects(
      () =>
        sut.verifySingleRequest({
          ...f.options,
          git: async (args) => {
            if (args[0] === "merge-base" && args[2] === ancestor) {
              missing = true;
              throw Error("R16_REQUIRED_ANCESTOR");
            }
            return f.git(args);
          },
        }),
      /R16_REQUIRED_ANCESTOR/,
    );
    assert.equal(missing, true);
  }
});
test("R16 original recovery validator is shared by both real consumers", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs");
  assert.equal(prep.validateR15RecoveryDocument, sut.validateR15RecoveryDocument);
  const raw = JSON.stringify(sut.R15_RECOVERY_DOCUMENT, null, 2) + "\n";
  const { createHash } = await import("node:crypto");
  assert.equal(Buffer.byteLength(raw), 6244);
  assert.equal(
    createHash("sha256").update(raw).digest("hex"),
    "de792c8803bbe232871c9eac468ad8baede31a88b1ec5aa238647a15267b645a",
  );
  assert.deepEqual(
    sut.validateR15RecoveryDocument(sut.R15_RECOVERY_DOCUMENT),
    sut.R15_RECOVERY_DOCUMENT,
  );
  assert.throws(
    () =>
      sut.validateR15RecoveryDocument({ ...sut.R15_RECOVERY_DOCUMENT, workflowRun: "42705850329" }),
    /RECOVERY_R15_LEDGER/,
  );
});

test("R17 original R16 validator is shared, immutable and rejects hostile documents before effects", async () => {
  const prep = await import("./prepare-visual-fixtures.mjs");
  assert.equal(prep.validateR16RecoveryDocument, sut.validateR16RecoveryDocument);
  const doc = sut.R16_RECOVERY_DOCUMENT;
  assert.equal(Object.keys(doc).length, 12);
  const clean = sut.validateR16RecoveryDocument(doc);
  assert.equal(Object.isFrozen(clean), true);
  let effects = 0;
  const getter = { ...doc };
  Object.defineProperty(getter, "reportRaw", {
    enumerable: true,
    get() {
      effects++;
      return doc.reportRaw;
    },
  });
  const proxy = new Proxy(doc, {
    get() {
      effects++;
      throw Error("TRAP");
    },
    ownKeys() {
      effects++;
      throw Error("TRAP");
    },
  });
  for (const value of [
    undefined,
    null,
    {},
    { ...doc, artifactId: "13713326447" },
    { ...doc, reportRaw: "{}\n" },
    { ...doc, extra: true },
    Object.fromEntries(Object.entries(doc).reverse()),
    getter,
    proxy,
  ]) {
    assert.throws(() => sut.validateR16RecoveryDocument(value), /RECOVERY_R16_LEDGER/);
  }
  assert.equal(effects, 0);
  assert.equal(sut.SINGLE_REQUEST.fixtures.nonce, "trilha-a-fixtures-20261110-r20");
  assert.ok(sut.SINGLE_REQUEST.spentFixtureNonces.includes("trilha-a-fixtures-20261109-r16"));
});

test("R20 request accepts its sole nonce and keeps R19, R18 and R17 spent", () => {
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261110-r20",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.equal(
    sut.parseSingleRequest(JSON.stringify(request), "fixtures").request_id,
    request.request_id,
  );
  assert.throws(() =>
    sut.parseSingleRequest(
      JSON.stringify({ ...request, request_id: "trilha-a-fixtures-20261110-r18" }),
      "fixtures",
    ),
  );
  assert.throws(() =>
    sut.parseSingleRequest(
      JSON.stringify({ ...request, request_id: "trilha-a-fixtures-20261109-r17" }),
      "fixtures",
    ),
  );
});

test("R20 keeps preflight-failed R19 historical without authorizing replay", () => {
  const raw = JSON.stringify({
    schema_version: 1,
    issue: 317,
    operation: "fixtures",
    request_id: "trilha-a-fixtures-20261110-r19",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  });
  assert.throws(() => sut.parseSingleRequest(raw, "fixtures"), /REQUEST_SCHEMA/);
  assert.equal(
    sut.parseSingleRequest(raw, "fixtures", { historical: true }).request_id,
    "trilha-a-fixtures-20261110-r19",
  );
  assert.ok(sut.SINGLE_REQUEST.spentFixtureNonces.includes("trilha-a-fixtures-20261110-r19"));
});

test("R19 original recovery bytes and candidate order are exact and frozen", () => {
  const raw =
    JSON.stringify(sut.validateR18RecoveryDocument(sut.R18_RECOVERY_DOCUMENT), null, 2) + "\n";
  assert.equal(Buffer.byteLength(raw), 8003);
  assert.equal(
    createHash("sha256").update(raw).digest("hex"),
    "de5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac",
  );
  assert.equal(Object.keys(sut.R18_RECOVERY_DOCUMENT).length, 12);
  assert.equal(Object.keys(sut.R18_REGISTRATION_CANDIDATE).length, 19);
  assert.equal(
    Object.isFrozen(sut.validateR18RegistrationCandidate(sut.R18_REGISTRATION_CANDIDATE)),
    true,
  );
  const report = JSON.parse(sut.R18_RECOVERY_DOCUMENT.reportRaw);
  assert.deepEqual(
    [
      report.intentLedger.priorConfirmed,
      report.intentLedger.priorReserved,
      report.intentLedger.newArmedCount,
      report.intentLedger.maxNewIntentions,
    ],
    [15, 2, 2, 7],
  );
});

test("R19 request verification and proof loading reject hostile recovery inputs before environment or IO", async () => {
  const { readFile } = await import("node:fs/promises");
  const ts = (await import("typescript")).default;
  const text = await readFile(new URL("./authenticated-visual-audit.mjs", import.meta.url), "utf8");
  const ast = ts.createSourceFile(
    "audit.mjs",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const functions = ast.statements.filter((n) => ts.isFunctionDeclaration(n));
  let effects = 0;
  for (const name of ["verifySingleRequest", "loadSingleRequestProof"]) {
    const entry = functions.find((n) => n.name?.text === name);
    const first = entry.body.statements
      .slice(1, 3)
      .map((n) => n.getText(ast))
      .join("\n");
    assert.ok(first.startsWith("validateR18RecoveryDocument(R18_RECOVERY_DOCUMENT)"));
    assert.ok(first.includes("validateR18RegistrationCandidate(R18_REGISTRATION_CANDIDATE)"));
    const check = new Function(
      "validateR18RecoveryDocument",
      "validateR18RegistrationCandidate",
      "R18_RECOVERY_DOCUMENT",
      "R18_REGISTRATION_CANDIDATE",
      "effect",
      first + ";effect();",
    );
    for (const [literal, validator, index, code] of [
      [sut.R18_RECOVERY_DOCUMENT, sut.validateR18RecoveryDocument, 0, /RECOVERY_R18_LEDGER/],
      [
        sut.R18_REGISTRATION_CANDIDATE,
        sut.validateR18RegistrationCandidate,
        1,
        /RECOVERY_R18_BINDING/,
      ],
    ]) {
      const accessor = { ...literal };
      Object.defineProperty(accessor, Object.keys(literal)[0], {
        enumerable: true,
        get() {
          effects++;
          throw Error("GETTER");
        },
      });
      const revoked = Proxy.revocable({}, {});
      revoked.revoke();
      for (const bad of [
        undefined,
        null,
        {},
        accessor,
        new Proxy({}, {}),
        revoked.proxy,
        { ...literal, extra: true },
        { ...literal, [Symbol("extra")]: true },
        Object.fromEntries(Object.entries(literal).reverse()),
      ]) {
        assert.throws(() => validator(bad), code);
        const documents = [sut.R18_RECOVERY_DOCUMENT, sut.R18_REGISTRATION_CANDIDATE];
        documents[index] = bad;
        assert.throws(
          () =>
            check(
              sut.validateR18RecoveryDocument,
              sut.validateR18RegistrationCandidate,
              ...documents,
              () => {
                effects++;
              },
            ),
          code,
        );
      }
    }
  }
  assert.equal(effects, 0);
});

test("R19 sourceforms failure console diagnostic is closed and cannot release the native gate", () => {
  const title =
    "R3 Chromium sourceforms asynchronous opinion queue acceptance and actual opinion consumer";
  const tap =
    "TAP version 13\n# R19_READONLY_PHASE START\n# R19_READONLY_PHASE RESUME\nnot ok 5 - " +
    title +
    "\nPRIVATE_CANARY";
  assert.deepEqual(sut.preparerSourceFormsFailure(tap), {
    failedCases: ["OPINION"],
    lastPhase: "RESUME",
  });
  assert.equal(sut.preparerSourceFormsSupplement(tap), null);
  for (const input of [
    null,
    undefined,
    {},
    "PRIVATE_CANARY",
    "x".repeat(1048577),
    "# R19_READONLY_PHASE PRIVATE_CANARY",
    "not ok 5 - " + title + " PRIVATE_CANARY",
  ])
    assert.deepEqual(sut.preparerSourceFormsFailure(input), {
      failedCases: [],
      lastPhase: "UNKNOWN",
    });
  for (const suffix of [
    "\n# R19_READONLY_PHASE RESUME",
    "\n# R19_READONLY_PHASE START",
    "\n# R19_READONLY_PHASE PRIVATE_CANARY",
  ])
    assert.equal(sut.preparerSourceFormsFailure(tap + suffix).lastPhase, "UNKNOWN");
  assert.deepEqual(
    sut.preparerSourceFormsFailure(Object.assign(Error(), { stdout: tap })),
    sut.preparerSourceFormsFailure(tap),
  );
  let effects = 0;
  const hostile = Object.defineProperty({}, "stdout", {
    get() {
      effects++;
      throw Error("PRIVATE_CANARY");
    },
  });
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  for (const value of [
    hostile,
    Object.create({ stdout: tap }),
    new Proxy(
      {},
      {
        getOwnPropertyDescriptor() {
          effects++;
          throw Error("PRIVATE_CANARY");
        },
      },
    ),
    revoked.proxy,
  ])
    assert.deepEqual(sut.preparerSourceFormsFailure(value), {
      failedCases: [],
      lastPhase: "UNKNOWN",
    });
  assert.equal(effects, 0);
  assert.equal(
    JSON.stringify(sut.preparerSourceFormsFailure(tap)).includes("PRIVATE_CANARY"),
    false,
  );
});

// C8 is a closed request scope, never a caller-provided list of arbitrary routes.
test("C8 exact inventory selects sixty-four cases without changing the default two hundred eight", () => {
  const scope = sut.C8_AUDIT_SCOPE;
  assert.ok(scope && Object.isFrozen(scope));
  const selected = fn("privateCases")(scope);
  assert.equal(selected.length, 64);
  assert.deepEqual(
    [...new Set(selected.map((r) => r.surface))],
    ["V111", "V114", "V115", "V116", "V117", "V118", "V119", "V120"],
  );
  assert.equal(selected.filter((r) => r.fixtureBlocked || !r.path).length, 0);
  assert.equal(fn("privateCases")().length, 208);
  for (const item of selected) {
    assert.equal(fn("preservedPrivateCase")(item, scope), null);
    assert.equal(fn("run78VisualSelection")(item, scope).required, true);
  }
  assert.equal(
    selected.find((r) => r.surface === "V117").path,
    "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/analise",
  );
  assert.equal(
    selected.find((r) => r.surface === "V119").path,
    "/competencias/50c26274-a36f-48e0-b2fe-5a1caf5d6a49/apresentar",
  );
  assert.equal(
    selected.find((r) => r.surface === "V120").path,
    "/competencias/79bdc139-ed10-4c91-905e-b32b9a824d27/apresentacoes/eb6d5b1c-8b64-418b-aa82-bf1f29d41768",
  );
  assert.ok(
    selected
      .filter((r) => ["V114", "V115", "V116", "V118"].includes(r.surface))
      .every((r) => r.path.includes("59072760-4420-4598-82dd-367f41a79e89")),
  );
});

test("C8 injected scopes fail without reading getters or proxy traps", () => {
  let reads = 0;
  const bad = {
    get surfaces() {
      reads++;
      return ["SYS04"];
    },
  };
  const proxy = new Proxy(
    {},
    {
      get() {
        reads++;
        throw Error("SECRET");
      },
      ownKeys() {
        reads++;
        throw Error("SECRET");
      },
    },
  );
  for (const value of ["C8", {}, [], bad, proxy]) {
    assert.throws(() => fn("privateCases")(value), /AUDIT_SCOPE/);
    assert.throws(() => fn("completePrivateRecords")([], value), /AUDIT_SCOPE/);
    assert.throws(() => fn("summarizeCases")([], value), /AUDIT_SCOPE/);
  }
  assert.equal(reads, 0);
});

function c8TechnicalRows() {
  const scope = sut.C8_AUDIT_SCOPE;
  assert.ok(scope);
  return fn("privateCases")(scope).map((item) => {
    const key = fn("caseKey")(item),
      mobile = item.width < 768;
    const proof = (mode, count) => ({
      phase: "BEFORE_PNG",
      measuredAt: 1,
      capturedAt: 2,
      metrics: {
        passed: true,
        geometryPassed: true,
        tablePassed: true,
        datesPassed: true,
        contrastPassed: true,
        viewport: { width: item.width, height: 1000 },
        theme: item.theme,
        ...(item.surface === "V117" && mode === "PRIMARY" ? { modalPassed: true } : {}),
        targets:
          item.surface === "V117" && mode === "PRIMARY"
            ? [
                {
                  ordinal: 0,
                  kind: "BUTTON",
                  rect: { x: 0, y: 0, width: 44, height: 44 },
                  connected: true,
                  visible: true,
                  hit: true,
                  disabled: false,
                },
              ]
            : [],
        pairs: [],
      },
      image: {
        count,
        context: { surface: item.surface, width: item.width, theme: item.theme, mode },
        images: Array.from({ length: count }, () => ({
          decoded: true,
          complete: true,
          width: 131,
          height: 32,
          naturalWidth: 900,
          naturalHeight: 220,
          src:
            mode === "SIDEBAR_COLLAPSED"
              ? "/brand/ContaOS_Simbolo_Branco.svg"
              : "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
        })),
      },
    });
    return {
      ...good,
      ...item,
      observedWidth: item.width,
      observedTheme: item.theme,
      brandCount: mobile ? 0 : 1,
      status: "PASS_AUTOMATIZADO",
      screenshot: `screenshots/${key}.png`,
      dom: `dom/${key}.json`,
      visualCapture: proof("PRIMARY", mobile ? 0 : 1),
      keyboard: { passed: true },
      navigationVerified: true,
      drawerCloseVerified: true,
      langPtBr: true,
      badState: false,
      fontFamily: "Inter, Arial, sans-serif",
      accessibility: { violations: [] },
      sidebarSupplement: {
        passed: true,
        mode: mobile ? "MOBILE" : "DESKTOP",
        brandCount: 1,
        screenshot: `screenshots/${key}${mobile ? "_menu" : "_sidebar-recolhida"}.png`,
        sha256: "a".repeat(64),
        visualCapture: proof(mobile ? "MOBILE_MENU" : "SIDEBAR_COLLAPSED", 1),
      },
    };
  });
}

test("C8 summary rejects a PASS label without the complete visual and interaction proof", () => {
  const rows = c8TechnicalRows(),
    scope = sut.C8_AUDIT_SCOPE;
  for (const delta of [
    { visualCapture: null },
    { keyboard: { passed: false } },
    { navigationVerified: false },
    { sidebarSupplement: { ...rows[0].sidebarSupplement, passed: false } },
    { accessibility: { violations: [{ id: "color-contrast", count: 1 }] } },
    { langPtBr: false },
    { badState: true },
    { fontFamily: "serif" },
  ]) {
    assert.equal(
      fn("summarizeCases")(
        rows.map((r, i) => (i ? r : { ...r, ...delta })),
        scope,
      ).matrixComplete,
      false,
    );
  }
});

test("C8 summary requires sixty-four distinct valid keys with exact routes and no failed or extra cases", () => {
  const scope = sut.C8_AUDIT_SCOPE,
    rows = c8TechnicalRows();
  assert.equal(fn("summarizeCases")(rows, scope).matrixComplete, true);
  assert.equal(fn("summarizeCases")(rows, scope).passed, 64);
  assert.equal(fn("summarizeCases")(rows, scope).globalComplete, false);
  for (const changed of [
    rows.slice(1),
    [...rows, rows[0]],
    [...rows.slice(1), rows[1]],
    rows.map((r, i) => (i ? r : { ...r, path: "/administracao/usuarios" })),
    rows.map((r, i) => (i ? r : { ...r, status: "FAIL" })),
    rows.map((r, i) => (i ? r : { ...r, surface: "SYS04" })),
    rows.map((r, i) =>
      i
        ? r
        : {
            ...r,
            surface: "SYS04",
            path: undefined,
            screenshot: `screenshots/${fn("caseKey")({ ...r, surface: "SYS04" })}.png`,
            dom: `dom/${fn("caseKey")({ ...r, surface: "SYS04" })}.json`,
          },
    ),
  ])
    assert.equal(fn("summarizeCases")(changed, scope).matrixComplete, false);
  const completed = fn("completePrivateRecords")([], scope);
  assert.equal(completed.length, 64);
  assert.ok(completed.every((r) => r.status !== "PASS_AUTOMATIZADO" && !r.screenshot && !r.sha256));
});

test("C8 interrupted completion rejects injected or duplicate rows before adding any records", () => {
  const scope = sut.C8_AUDIT_SCOPE,
    one = c8TechnicalRows()[0];
  for (const rows of [[{ ...one, surface: "SYS04" }], [one, one], [{ ...one, path: "/login" }]]) {
    const before = rows.length;
    assert.throws(() => fn("completePrivateRecords")(rows, scope), /AUDIT_CASES/);
    assert.equal(rows.length, before);
  }
});

test("C8 sealed recovery document exactly preserves the inspected original without minting a current owner", () => {
  const doc = sut.C8_RECOVERY_DOCUMENT;
  const validate = fn("validateC8RecoveryDocument");
  const raw = JSON.stringify(doc, null, 2) + "\n";
  assert.equal(Object.keys(doc).length, 12);
  assert.equal(Buffer.byteLength(raw), 5430);
  assert.equal(
    createHash("sha256").update(raw).digest("hex"),
    "3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee",
  );
  assert.ok(Object.isFrozen(validate(doc)));
  const r = JSON.parse(doc.reportRaw);
  assert.equal(r.completed, true);
  assert.equal(r.logoutVerified, true);
  assert.equal(r.intentLedger.newArmedCount, 0);
  assert.equal(JSON.parse(doc.receiptsRaw).receipts.length, 0);
  let effects = 0;
  const getter = { ...doc };
  Object.defineProperty(getter, "reportRaw", {
    enumerable: true,
    get() {
      effects++;
      throw Error("SECRET");
    },
  });
  const proxy = new Proxy(doc, {
    get() {
      effects++;
      throw Error("SECRET");
    },
    ownKeys() {
      effects++;
      throw Error("SECRET");
    },
  });
  for (const changed of [
    undefined,
    null,
    {},
    { ...doc, extra: true },
    { ...doc, reportRaw: "{}\n" },
    { ...doc, harnessSha: "a".repeat(40) },
    getter,
    proxy,
  ])
    assert.throws(() => validate(changed), /C8_RECOVERY/);
  assert.equal(effects, 0);
});

test("C8 surface states require the real open drawer, registration stage and complete protocol regions", () => {
  const base = { mainText: "", statusTexts: [], regionNames: [] };
  const drawer = {
    ...base,
    headingText: "Análise da competência",
    dialogNames: ["Detalhe do requisito"],
    dialogVisible: true,
    regionNames: ["Requisito", "Fonte e versionamento", "Resultado de referência", "Evidências"],
  };
  assert.equal(fn("surfaceStateValid")("V117", drawer), true);
  assert.equal(fn("surfaceStateValid")("V117", { ...drawer, dialogVisible: false }), false);
  const wizard = {
    ...base,
    headingText: "Wizard de apresentação",
    regionNames: ["Revisão de prontidão", "Etapa 2 de 2 — Registrar apresentação"],
  };
  assert.equal(fn("surfaceStateValid")("V119", wizard), true);
  assert.equal(
    fn("surfaceStateValid")("V119", { ...wizard, regionNames: ["Etapa 1 de 2 — Aprovação"] }),
    false,
  );
  const protocol = {
    ...base,
    headingText: "Apresentação e protocolo",
    regionNames: ["Dados da apresentação", "Pacote imutável", "Itens preservados no pacote"],
  };
  assert.equal(fn("surfaceStateValid")("V120", protocol), true);
  assert.equal(
    fn("surfaceStateValid")("V120", { ...protocol, regionNames: protocol.regionNames.slice(1) }),
    false,
  );
});

test("C8 admission is bound to the exact seven-field audit request and rejects legacy or injected scopes", () => {
  const resolve = fn("resolveC8AuditScope");
  const request = {
    schema_version: 1,
    issue: 317,
    operation: "audit",
    request_id: "trilha-c-audit-20261110-c8-r1",
    approved_parent_sha: "a".repeat(40),
    frontend_sha: "",
    deployment_id: "",
  };
  assert.equal(resolve(request), sut.C8_AUDIT_SCOPE);
  assert.equal(
    sut.parseSingleRequest(JSON.stringify(request), "audit").request_id,
    request.request_id,
  );
  for (const changed of [
    undefined,
    { ...request, scope: "C8" },
    { ...request, operation: "fixtures" },
    { ...request, request_id: "trilha-a-audit-20261108-r1" },
    { ...request, approved_parent_sha: "main" },
  ])
    assert.throws(() => resolve(changed), /AUDIT_BINDING_PENDING|REQUEST_SCHEMA/);
  assert.throws(() => sut.requireSingleRequestOperation("audit"), /AUDIT_BINDING_PENDING/);
  assert.equal(sut.requireSingleRequestOperation("audit", request), undefined);
  const old = JSON.stringify({ ...request, request_id: "trilha-a-audit-20261108-r1" });
  assert.throws(() => sut.parseSingleRequest(old), /REQUEST_SCHEMA/);
  assert.equal(
    sut.parseSingleRequest(old, undefined, { historical: true }).request_id,
    "trilha-a-audit-20261108-r1",
  );
});

test("C8 recovery validation precedes metadata environment, Git, filesystem and API in both admission paths", async () => {
  for (const call of [sut.verifySingleRequest, sut.loadSingleRequestProof]) {
    let effects = 0;
    const blocked = async () => {
      effects++;
      throw Error("IO_BEFORE_RECOVERY");
    };
    await assert.rejects(
      () =>
        call({
          operation: "audit",
          env: {},
          recoveryDocumentC8: {},
          get: blocked,
          git: blocked,
          read: blocked,
          stat: blocked,
          identity: blocked,
        }),
      /C8_RECOVERY/,
    );
    assert.equal(effects, 0);
  }
});

test("C8 V117 drawer uses the original opener and close with restored focus, rejecting wrong routes", async () => {
  assert.equal(typeof sut.openC8RequirementDrawer, "function");
  const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117"),
    calls = [];
  let opened = false,
    focused = false;
  const opener = {
    count: async () => 1,
    click: async () => {
      calls.push("open");
      opened = true;
    },
    evaluate: async () => focused,
  };
  const dialog = {
    evaluate: async () => {
      calls.push("settled");
    },
    waitFor: async ({ state }) => {
      assert.equal(opened, state === "visible");
      calls.push(state);
    },
    getByRole: (role, options) => {
      assert.equal(role, "button");
      assert.deepEqual(options, { name: "Fechar", exact: true });
      return {
        click: async () => {
          calls.push("close");
          opened = false;
          focused = false;
        },
      };
    },
  };
  const page = {
    url: () => sut.HML_ORIGIN + item.path,
    waitForFunction: async (check, arg, options) => {
      assert.equal(check, sut.c8DrawerFocusValid);
      assert.equal(arg, null);
      assert.deepEqual(options, { timeout: 15000 });
      calls.push("focus");
      focused = true;
    },
    getByRole: (role, options) => {
      if (role === "button") {
        assert.deepEqual(options, { name: "Abrir requisito AUD-A-TXT-001", exact: true });
        return opener;
      }
      assert.equal(role, "dialog");
      assert.deepEqual(options, { name: "Detalhe do requisito", exact: true });
      return dialog;
    },
  };
  const close = await sut.openC8RequirementDrawer(page, item, sut.C8_AUDIT_SCOPE);
  assert.deepEqual(calls, ["open", "visible", "settled"]);
  assert.equal(await close(), true);
  assert.deepEqual(calls, ["open", "visible", "settled", "close", "hidden", "focus"]);
  let reads = 0;
  await assert.rejects(
    () =>
      sut.openC8RequirementDrawer(
        {
          getByRole() {
            reads++;
          },
        },
        { ...item, path: "/" },
        sut.C8_AUDIT_SCOPE,
      ),
    /C8_DRAWER_BINDING/,
  );
  assert.equal(reads, 0);
});

test("C8 current wire rejects foreign stale pending and inconsistent recovery bindings", () => {
  assert.equal(typeof sut.validateC8CurrentWire, "function");
  const bindings = JSON.parse(sut.C8_RECOVERY_DOCUMENT.reportRaw).bindings;
  const c = bindings.competencies[0],
    item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117");
  const analysis = {
    schema_versao: "v116-v1",
    competencia: {
      id: c.id,
      id_organizacao: bindings.organization,
      id_contrato: bindings.contract,
      competencia_referencia: c.month,
    },
    estado_analise: "complete",
    stale: false,
    execucao_atual: { id: c.executionId, status: "concluida" },
  };
  const detail = {
    schema_versao: "v117-v1",
    competencia: analysis.competencia,
    requisito: {
      id: c.requirementId,
      codigo: "AUD-A-TXT-001",
      origem_tipo: "item_lista",
      origem_id: bindings.itemId,
    },
    execucao_atual: analysis.execucao_atual,
  };
  const wire = {
    analysis,
    detail,
    context: {
      id_competencia: c.id,
      id_requisito: c.requirementId,
      id_organizacao: bindings.organization,
      id_contrato: bindings.contract,
      id_execucao_esperada: c.executionId,
    },
  };
  assert.equal(sut.validateC8CurrentWire(item, wire), true);
  assert.equal(sut.validateC8CurrentWire(item, { ...wire, context: undefined }), true);
  for (const delta of [
    { analysis: { ...analysis, stale: true } },
    { analysis: { ...analysis, estado_analise: "queued" } },
    {
      analysis: {
        ...analysis,
        competencia: { ...analysis.competencia, id_organizacao: "foreign" },
      },
    },
    { detail: { ...detail, requisito: { ...detail.requisito, id: "foreign" } } },
    { detail: { ...detail, execucao_atual: { ...detail.execucao_atual, id: "stale" } } },
    { detail: null },
  ])
    assert.equal(sut.validateC8CurrentWire(item, { ...wire, ...delta }), false);
});

async function c8SourceFixture() {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const preparer = await import("./prepare-visual-fixtures.mjs");
  const source = await fs.readFile(
    new URL("./prepare-visual-fixtures.test.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("fixture.mjs", source, 99, true, ts.ScriptKind.JS);
  const names = ["r11SqlV116", "r11SqlV117", "r17View"];
  const declarations = names.map((name) =>
    ast.statements.find((n) => ts.isFunctionDeclaration(n) && n.name?.text === name).getText(ast),
  );
  const data = new Function(
    "FIXTURE",
    "R6_R5_DOCUMENT",
    declarations.join("\n") +
      ";return {analysis:r11SqlV116(),detail:r11SqlV117(),overview:r17View(100)};",
  )(preparer.FIXTURE, sut.C8_RECOVERY_DOCUMENT);
  const b = JSON.parse(sut.C8_RECOVERY_DOCUMENT.reportRaw).bindings,
    c = b.competencies[0],
    s = b.competencies[1];
  Object.assign(data.analysis.competencia, { id: c.id, competencia_referencia: c.month });
  data.analysis.execucao_atual.id = c.executionId;
  data.analysis.execucoes[0].id = c.executionId;
  Object.assign(data.analysis.resultados[0], { id_requisito: c.requirementId });
  data.analysis.resultados[0].requisito.codigo = "AUD-A-TXT-001";
  Object.assign(data.detail.competencia, { id: c.id });
  Object.assign(data.detail.requisito, {
    id: c.requirementId,
    codigo: "AUD-A-TXT-001",
    origem_id: b.itemId,
    hash_snapshot: "b".repeat(64),
  });
  data.detail.execucao_atual.id = c.executionId;
  data.detail.execucao_atual.iniciada_em = "2026-11-10T00:00:00Z";
  data.detail.execucao_atual.concluida_em = "2026-11-10T00:01:00Z";
  data.overview.competencia.situacao = c.state;
  data.overview.blocking_summary.aprovacao_apresentacao_atual = true;
  data.context = {
    schema_versao: "v117-v1",
    id_competencia: c.id,
    id_requisito: c.requirementId,
    id_organizacao: b.organization,
    id_contrato: b.contract,
    id_execucao_esperada: c.executionId,
    id_resultado_esperado: null,
    hash_esperado: "a".repeat(64),
    pode_revisar: false,
  };
  const owner = { id_competencia: s.id, id_organizacao: b.organization, id_contrato: b.contract };
  data.presentations = [
    {
      ...owner,
      id: s.presentationId,
      id_pacote: s.packageId,
      protocolo: "HML-TRILHA-A-20261108",
      forma_apresentacao: "Ensaio sintético em homologação.",
      apresentado_em: "2026-11-10T00:00:00Z",
      tipo: "inicial",
      numero_rodada: 1,
    },
  ];
  data.packages = [
    {
      ...owner,
      id: s.packageId,
      hash_pacote: s.packageHash,
      numero: 1,
      tipo: "inicial",
      status: preparer.R18_REGISTRATION_CANDIDATE.packageStatus,
      congelado_em: "2026-11-10T00:00:00Z",
    },
  ];
  data.items = [
    {
      ...owner,
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      id_pacote: s.packageId,
      entidade_tipo: "documento_competencia",
      entidade_id: s.documentId,
      versao_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      hash: "c".repeat(64),
      ordem: 1,
    },
  ];
  return { data, bindings: b };
}

async function c8BuildSourceUI(directory) {
  const fs = await import("node:fs/promises"),
    { join, resolve } = await import("node:path"),
    { fileURLToPath } = await import("node:url");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const pg = createRequire(require.resolve("@supabase/supabase-js")).resolve(
    "@supabase/postgrest-js",
  );
  const b = JSON.parse(sut.C8_RECOVERY_DOCUMENT.reportRaw).bindings;
  await fs.writeFile(
    join(directory, "client.ts"),
    `import {PostgrestClient} from ${JSON.stringify(pg)};export const supabase=Object.assign(new PostgrestClient(${JSON.stringify(API)}+'/rest/v1'),{auth:{getUser:async()=>({data:{user:{id:'native-c8-owner'}},error:null})}});`,
  );
  await fs.writeFile(
    join(directory, "router.tsx"),
    `import React from 'react';const navigate=()=>{};export const useNavigate=()=>navigate;export const Link=({children,to,...p})=><a href={typeof to==='string'?to:'#'} {...p}>{children}</a>;`,
  );
  await fs.writeFile(
    join(directory, "org.ts"),
    `export const EVENTO_ORGANIZACAO_ALTERADA="contaos:organizacao-alterada";export const obterPreferenciaOrganizacao=()=>${JSON.stringify(b.organization)};`,
  );
  await fs.writeFile(
    join(directory, "entry.tsx"),
    `import React from 'react';import {createRoot} from 'react-dom/client';import {CompetenciaAnalise} from ${JSON.stringify(resolve(root, "src/components/competencias/CompetenciaAnalise.tsx"))};import {CompetenciaApresentar} from ${JSON.stringify(resolve(root, "src/components/competencias/CompetenciaApresentar.tsx"))};import {CompetenciaProtocolo} from ${JSON.stringify(resolve(root, "src/components/competencias/CompetenciaProtocolo.tsx"))};const root=createRoot(document.getElementById('root'));window.__mount=(surface,id,ap)=>root.render(surface==='V117'?<CompetenciaAnalise key={crypto.randomUUID()} id={id}/>:surface==='V119'?<CompetenciaApresentar key={crypto.randomUUID()} id={id}/>:<CompetenciaProtocolo key={crypto.randomUUID()} id={id} apresentacaoId={ap}/>);window.__ready=true;`,
  );
  const aliases = {
    react: require.resolve("react"),
    "react-dom/client": require.resolve("react-dom/client"),
    "react/jsx-runtime": require.resolve("react/jsx-runtime"),
    "@/integrations/supabase/client": join(directory, "client.ts"),
    "@tanstack/react-router": join(directory, "router.tsx"),
    "@/lib/organizacao/preferenciaOrganizacao": join(directory, "org.ts"),
  };
  const bunScript = `const result=await Bun.build({entrypoints:[${JSON.stringify(join(directory, "entry.tsx"))}],outdir:${JSON.stringify(directory)},target:'browser',naming:'ui.js',minify:true,define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'closed-infrastructure',setup(build){const aliases=${JSON.stringify(aliases)};build.onResolve({filter:/^(@\\/|@tanstack\\/react-router$|react$|react-dom\\/client$|react\\/jsx-runtime$)/},args=>({path:Bun.resolveSync(aliases[args.path]??${JSON.stringify(resolve(root, "src"))}+'/'+args.path.slice(2),${JSON.stringify(root)})}));}}]});if(!result.success){for(const log of result.logs)console.error(log);process.exit(1);}`;
  await fs.writeFile(join(directory, "build.mjs"), bunScript);
  const { execFile } = await import("node:child_process"),
    { promisify } = await import("node:util");
  await promisify(execFile)(
    process.env.CONTAOS_BUN_BINARY || "bun",
    [join(directory, "build.mjs")],
    { cwd: root, timeout: 15000, maxBuffer: 1048576 },
  );
  return fs.readFile(join(directory, "ui.js"));
}

async function nativeC8ObservationIdentity() {
  const { execFile } = await import("node:child_process"),
    { promisify } = await import("node:util");
  const { stdout } = await promisify(execFile)("git", ["rev-parse", "HEAD"], {
    timeout: 10000,
    maxBuffer: 1024,
  });
  const harnessSha = stdout.trim();
  assert.match(harnessSha, /^[a-f0-9]{40}$/);
  return {
    frontendSha: "0024b3c6739ab6296ec12338f11cf792d3a5f84b",
    harnessSha,
    deploymentId: "dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh",
    workflowRun: "1",
  };
}

async function c8NativeSourceProbe(browser, cssCompiler) {
  const fs = await import("node:fs/promises"),
    { join } = await import("node:path"),
    { tmpdir } = await import("node:os");
  const dir = await fs.mkdtemp(join(tmpdir(), "c8-source-real-"));
  const phase = (stage, item = null) =>
    console.log(
      "C8_NATIVE_PHASE " + stage + (item ? ` ${item.surface} ${item.width} ${item.theme}` : ""),
    );
  phase("START");
  let server,
    page,
    business = 0,
    currentObserver = null;
  try {
    phase("BUNDLE");
    const bundle = await c8BuildSourceUI(dir),
      { data, bindings: b } = await c8SourceFixture();
    const { execFile } = await import("node:child_process"),
      { promisify } = await import("node:util"),
      ts = (await import("typescript")).default;
    const oldSource = (
      await promisify(execFile)(
        "git",
        [
          "show",
          "34674fab697cbdecd4dd1d5f5f918df64ce1b286:scripts/hml/authenticated-visual-audit.mjs",
        ],
        { maxBuffer: 1048576 },
      )
    ).stdout;
    const ast = ts.createSourceFile("old.mjs", oldSource, 99, true, ts.ScriptKind.JS);
    const oldDeclaration = ast.statements
      .find((n) => ts.isFunctionDeclaration(n) && n.name?.text === "surfaceStateValid")
      .getText(ast)
      .replace(/^export /, "");
    const before = new Function(oldDeclaration + ";return surfaceStateValid;")();
    const cssAst = ts.createSourceFile(
        "native-ui.js",
        bundle.toString("utf8"),
        99,
        true,
        ts.ScriptKind.JS,
      ),
      candidates = new Set();
    const cssVisit = (node) => {
      if (ts.isStringLiteralLike(node))
        for (const token of node.text.split(/\s+/)) candidates.add(token);
      ts.forEachChild(node, cssVisit);
    };
    cssVisit(cssAst);
    const sourceCss = cssCompiler.build([...candidates]);
    const readNames = new Set();
    let surface = "V117",
      mode = "ok";
    // Fulfill native browser requests directly: SDK and observer stay original,
    // while the fixture avoids a detached APIRequestContext crossing page lifetime.
    const fixtureReply = (url, raw, requestSurface, requestMode, method) => {
      const surface = requestSurface,
        mode = requestMode;
      if (url.pathname.startsWith("/rest/v1/rpc/")) {
        assert.equal(method, "POST");
        const name = url.pathname.split("/").at(-1),
          args = JSON.parse(raw);
        readNames.add(name);
        const competency = b.competencies[surface === "V120" ? 1 : 0];
        assert.equal(args.p_id_competencia, competency.id);
        if (name === "obter_visao_geral_competencia")
          assert.deepEqual(args, { p_id_competencia: competency.id });
        if (name === "obter_detalhe_requisito_v117")
          assert.deepEqual(args, {
            p_id_competencia: competency.id,
            p_id_requisito: competency.requirementId,
            p_evidencias_offset: 0,
            p_evidencias_limite: 25,
            p_historico_offset: 0,
            p_historico_limite: 25,
            p_apontamentos_offset: 0,
            p_apontamentos_limite: 25,
          });
        if (name === "obter_analise_competencia_v116")
          assert.deepEqual(args, {
            p_id_competencia: competency.id,
            p_resultados_offset: 0,
            p_resultados_limite: 25,
            p_execucoes_offset: 0,
            p_execucoes_limite: 10,
            p_apontamentos_offset: 0,
            p_apontamentos_limite: 25,
            p_filtro_resultado: null,
            p_filtro_criticidade: null,
            p_filtro_mecanismo: null,
            p_filtro_apontamento_status: null,
            p_busca: null,
          });
        const rpc = {
          obter_analise_competencia_v116: data.analysis,
          obter_detalhe_requisito_v117: data.detail,

          obter_visao_geral_competencia: data.overview,
        };
        if (!Object.hasOwn(rpc, name)) {
          business++;
          return { status: 403, data: null };
        }
        let value = structuredClone(rpc[name]);
        if (surface === "V120" && name === "obter_visao_geral_competencia")
          Object.assign(value.competencia, {
            id: b.competencies[1].id,
            competencia_referencia: b.competencies[1].month,
            situacao: b.competencies[1].state,
          });
        if (mode === "foreign") {
          if (value.competencia) value.competencia.id_organizacao = "foreign";
          else value.id_organizacao = "foreign";
        }
        if (mode === "missing") value = null;
        if (mode === "stale" && name === "obter_analise_competencia_v116") value.stale = true;
        if (mode === "pending" && name === "obter_analise_competencia_v116")
          value.estado_analise = "queued";
        if (mode === "hostile" && name === "obter_detalhe_requisito_v117")
          value.requisito.descricao = "NATIVEC8_UNLISTED_SENTINEL_84f7";
        return { data: value, count: 1 };
      }
      assert.equal(method, "GET");
      const tables = {
        apresentacoes_contratante: data.presentations,
        pacotes_competencia: data.packages,
        itens_pacote_competencia: data.items,
      };
      const table = url.pathname.split("/").at(-1);
      if (Object.hasOwn(tables, table)) {
        const rows = structuredClone(tables[table]);
        if (mode === "hash" && table === "pacotes_competencia")
          rows[0].hash_pacote = "0".repeat(64);
        if (mode === "item" && table === "itens_pacote_competencia") rows.length = 0;
        return { data: table === "itens_pacote_competencia" ? rows : rows[0], count: rows.length };
      }
      business++;
      return { status: 403, data: null };
    };
    server = createHttpServer((req, res) => {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/ui.js") {
        res.writeHead(200, { "content-type": "text/javascript" });
        res.end(bundle);
        return;
      }
      if (url.pathname === "/favicon.ico") {
        res.writeHead(204);
        res.end();
        return;
      }
      res.writeHead(200, { "content-type": "text/html" });
      res.end(
        '<!doctype html><html lang="pt-BR"><head><style>' +
          sourceCss +
          '</style></head><body><div id="root"></div><script type="module" src="/ui.js"></script></body></html>',
      );
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    page = await browser.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    const privacyHarness = await c8PrivacyHarness();
    const preparer = await import("./prepare-visual-fixtures.mjs");
    await page.route(API + "/rest/v1/**", async (route) => {
      const request = route.request();
      if (request.method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,POST,OPTIONS",
            "access-control-allow-headers": "*",
          },
        });
        return;
      }
      const reply = fixtureReply(
        new URL(request.url()),
        request.postData() || "",
        surface,
        mode,
        request.method(),
      );
      const count = reply.count ?? 1;
      await route.fulfill({
        status: reply.status ?? 200,
        headers: {
          "content-type": "application/json",
          "content-range": count ? `0-${count - 1}/${count}` : "*/0",
          "access-control-allow-origin": "*",
          "access-control-expose-headers": "content-range",
        },
        body: JSON.stringify(reply.data),
      });
    });
    for (surface of ["V117", "V119", "V120"])
      for (const width of [1440, 1280, 768, 390])
        for (const theme of ["light", "dark"]) {
          const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find(
            (r) => r.surface === surface && r.width === width && r.theme === theme,
          );
          const localPage = {
            url: () => sut.HML_ORIGIN + item.path,
            evaluate: page.evaluate.bind(page),
          };
          currentObserver = preparer.createOfficialObserver(page, {
            identity: await nativeC8ObservationIdentity(),
          });
          const state = {
            scope: sut.C8_AUDIT_SCOPE,
            verified: true,
            closed: false,
            generation: 0,
            c8Observer: currentObserver,
          };
          privacyHarness.pages.set(localPage, state);
          const navigated = (frame) => {
            if (frame === page.mainFrame()) state.generation++;
          };
          page.on("framenavigated", navigated);
          phase("MOUNT", item);
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(origin + item.path);
          await page.waitForFunction(() => window.__ready);
          await page.evaluate(
            ({ surface, id, ap, theme }) => {
              document.documentElement.classList.toggle("dark", theme === "dark");
              window.__mount(surface, id, ap);
            },
            {
              surface,
              id: b.competencies[surface === "V120" ? 1 : 0].id,
              ap: b.competencies[1].presentationId,
              theme,
            },
          );
          const heading = page.getByRole("heading", {
            level: 1,
            name:
              surface === "V117"
                ? "Análise da competência"
                : surface === "V119"
                  ? "Wizard de apresentação"
                  : "Apresentação e protocolo",
            exact: true,
          });
          await heading.waitFor();
          let opener;
          if (surface === "V117") {
            phase("DRAWER", item);
            opener = page.getByRole("button", {
              name: "Abrir requisito AUD-A-TXT-001",
              exact: true,
            });
            await opener.click();
            await page.getByRole("dialog", { name: "Detalhe do requisito", exact: true }).waitFor();
            await page
              .getByRole("region", { name: "Fonte e versionamento", exact: true })
              .waitFor();
          } else
            await page
              .getByRole("region", {
                name:
                  surface === "V119"
                    ? "Etapa 2 de 2 — Registrar apresentação"
                    : "Itens preservados no pacote",
                exact: true,
              })
              .waitFor();
          if (surface === "V117") {
            await page.getByRole("dialog").evaluate(async (node) =>
              Promise.all(
                node
                  .getAnimations()
                  .filter((a) => Number.isFinite(a.effect?.getTiming().iterations))
                  .map((a) => a.finished.catch(() => {})),
              ),
            );
            const modalGeometry = await sut.collectVisualMetrics(
              page,
              item,
              sut.C8_AUDIT_SCOPE,
              "PRIMARY",
            );
            assert.equal(modalGeometry.passed, true);
            assert.ok(modalGeometry.targets.length > 0);
            assert.ok(
              await page.locator('main button[aria-label="Abrir requisito AUD-A-TXT-001"]').count(),
            );
          }
          phase("STATE", item);
          const observation = await page.evaluate(() => {
            const visible = (e) => e.getClientRects().length > 0;
            return {
              headingText: document.querySelector("h1")?.textContent,
              mainText: document.body.innerText,
              statusTexts: [],
              regionNames: [...document.querySelectorAll("section[aria-labelledby]")].map(
                (e) => document.getElementById(e.getAttribute("aria-labelledby"))?.textContent,
              ),
              dialogVisible: [...document.querySelectorAll('[role="dialog"]')].some(visible),
              dialogNames: [...document.querySelectorAll('[role="dialog"]')]
                .filter(visible)
                .map(
                  (e) => document.getElementById(e.getAttribute("aria-labelledby"))?.textContent,
                ),
            };
          });
          assert.equal(
            before(surface, observation),
            false,
            `causal RED ${surface}/${width}/${theme}`,
          );
          assert.equal(
            sut.surfaceStateValid(surface, observation),
            true,
            `${surface}/${width}/${theme}`,
          );
          // Actual original SDK reads feed the official observer. The local server
          // substitutes transport only; no current evidence is injected into the collector.
          phase("COLLECT", item);
          await privacyHarness.collect(localPage, item, state);
          assert.equal(state.c8Current.observer, currentObserver);
          assert.equal(state.c8Current.generation, state.generation);
          phase("PRIVACY", item);
          const rendered = await page.locator("body").innerText(),
            snapshot = await page.locator("body").ariaSnapshot();
          const token = await privacyHarness.context(localPage, state, rendered, snapshot, null);
          const technical =
            surface === "V117"
              ? b.itemId
              : surface === "V120"
                ? b.competencies[1].packageHash
                : null;
          if (technical) {
            assert.ok(rendered.includes(technical));
            assert.equal(
              privacyHarness.contexts.get(token).rendered.remainder.includes(technical),
              false,
            );
            await page.evaluate((value) => {
              const p = document.createElement("p");
              p.id = "outside-field";
              p.textContent = value;
              document.body.append(p);
            }, technical);
            const duplicated = await page.locator("body").innerText(),
              duplicatedSnapshot = await page.locator("body").ariaSnapshot();
            const rejected = await privacyHarness.context(
              localPage,
              state,
              duplicated,
              duplicatedSnapshot,
              null,
            );
            assert.equal(
              privacyHarness.contexts.get(rejected).rendered.remainder.includes(technical),
              true,
            );
            await page.locator("#outside-field").evaluate((n) => n.remove());
            if (surface === "V117" && width === 390 && theme === "dark") {
              await page.evaluate(() => {
                const root = document.querySelector('section[aria-labelledby="v117-fonte"]');
                const field = [...root.querySelectorAll("dl > div")].find(
                  (n) => n.querySelector("dt")?.textContent === "Identificador da origem: ",
                );
                const clone = field.cloneNode(true);
                clone.id = "duplicate-origin-field";
                field.after(clone);
              });
              const duplicateContext = await privacyHarness.context(
                localPage,
                state,
                await page.locator("body").innerText(),
                await page.locator("body").ariaSnapshot(),
                null,
              );
              assert.equal(
                privacyHarness.contexts
                  .get(duplicateContext)
                  .rendered.remainder.includes(technical),
                true,
              );
              await page.locator("#duplicate-origin-field").evaluate((n) => n.remove());
              const swap = () => {
                const root = document.querySelector('section[aria-labelledby="v117-fonte"]');
                const fields = [...root.querySelectorAll("dl > div")];
                const origin = fields
                  .find((n) => n.querySelector("dt")?.textContent === "Identificador da origem: ")
                  .querySelector("dd");
                const hash = fields
                  .find((n) => n.querySelector("dt")?.textContent.startsWith("Hash do snapshot"))
                  .querySelector("dd");
                [origin.textContent, hash.textContent] = [hash.textContent, origin.textContent];
              };
              await page.evaluate(swap);
              const exchanged = await privacyHarness.context(
                localPage,
                state,
                await page.locator("body").innerText(),
                await page.locator("body").ariaSnapshot(),
                null,
              );
              assert.equal(
                privacyHarness.contexts.get(exchanged).rendered.remainder.includes(technical),
                true,
              );
              await page.evaluate(swap);
            }
          }
          if (surface === "V117") {
            phase("CLOSE", item);
            await page
              .getByRole("dialog")
              .getByRole("button", { name: "Fechar", exact: true })
              .click();
            await page.getByRole("dialog").waitFor({ state: "hidden" });
            await page.waitForFunction(sut.c8DrawerFocusValid, null, { timeout: 15000 });
            assert.equal(await opener.evaluate((n) => document.activeElement === n), true);
            assert.equal(
              (await sut.collectVisualMetrics(page, item, sut.C8_AUDIT_SCOPE, "PRIMARY")).passed,
              false,
            );
            const normal = await sut.collectVisualMetrics(
              page,
              item,
              sut.C8_AUDIT_SCOPE,
              width < 768 ? "MOBILE_MENU" : "SIDEBAR_COLLAPSED",
            );
            assert.ok(normal.targets.length > 0);
            assert.equal(
              sut.surfaceStateValid(surface, { ...observation, dialogVisible: false }),
              false,
            );
          }
          if (surface === "V120") {
            assert.equal(await page.locator('section[aria-labelledby="v120-itens"] li').count(), 1);
            assert.ok(
              (await page.locator('section[aria-labelledby="v120-pacote"]').innerText()).includes(
                b.competencies[1].packageHash,
              ),
            );
          }
          currentObserver.close();
          currentObserver = null;
          page.off("framenavigated", navigated);
          await page.goto("about:blank");
        }
    for (surface of ["V117", "V119", "V120"])
      for (mode of ["missing", "foreign"]) {
        const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find(
          (r) => r.surface === surface && r.width === 390 && r.theme === "dark",
        );
        const localPage = {
          url: () => sut.HML_ORIGIN + item.path,
          evaluate: page.evaluate.bind(page),
        };
        currentObserver = preparer.createOfficialObserver(page);
        const state = {
          scope: sut.C8_AUDIT_SCOPE,
          verified: true,
          closed: false,
          generation: 1,
          c8Observer: currentObserver,
        };
        privacyHarness.pages.set(localPage, state);
        phase("NEGATIVE", item);
        await page.goto(origin + item.path);
        await page.waitForFunction(() => window.__ready);
        await page.evaluate(({ surface, id, ap }) => window.__mount(surface, id, ap), {
          surface,
          id: b.competencies[surface === "V120" ? 1 : 0].id,
          ap: b.competencies[1].presentationId,
        });
        await page.waitForFunction(
          () =>
            [...document.querySelectorAll('[role="status"],[role="alert"]')].some(
              (n) => n.textContent.trim() && !/Carregando/.test(n.textContent),
            ),
          null,
          { timeout: 5000 },
        );
        await assert.rejects(
          () => privacyHarness.collect(localPage, item, state),
          /(C8_CURRENT_BINDING|OBSERVATION_FAILED|OBSERVATION_TABLE)/,
        );
        assert.equal(state.c8Current, undefined);
        currentObserver.close();
        currentObserver = null;
        await page.goto("about:blank");
      }
    for (const vector of [
      { surface: "V117", mode: "stale" },
      { surface: "V117", mode: "pending" },
      { surface: "V117", mode: "hostile" },
      { surface: "V120", mode: "hash" },
      { surface: "V120", mode: "item" },
    ]) {
      surface = vector.surface;
      mode = vector.mode;
      const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find(
        (r) => r.surface === surface && r.width === 390 && r.theme === "dark",
      );
      const localPage = {
        url: () => sut.HML_ORIGIN + item.path,
        evaluate: page.evaluate.bind(page),
      };
      currentObserver = preparer.createOfficialObserver(page);
      const state = {
        scope: sut.C8_AUDIT_SCOPE,
        verified: true,
        closed: false,
        generation: 1,
        c8Observer: currentObserver,
      };
      privacyHarness.pages.set(localPage, state);
      phase("NEGATIVE", item);
      await page.goto(origin + item.path);
      await page.waitForFunction(() => window.__ready);
      await page.evaluate(({ surface, id, ap }) => window.__mount(surface, id, ap), {
        surface,
        id: b.competencies[surface === "V120" ? 1 : 0].id,
        ap: b.competencies[1].presentationId,
      });
      if (surface === "V117") {
        await page
          .getByRole("button", { name: "Abrir requisito AUD-A-TXT-001", exact: true })
          .click();
        await page.getByRole("region", { name: "Fonte e versionamento", exact: true }).waitFor();
      } else
        await page.waitForFunction(
          () =>
            [...document.querySelectorAll('[role="status"],[role="alert"]')].some(
              (n) => n.textContent.trim() && !/Carregando/.test(n.textContent),
            ),
          null,
          { timeout: 5000 },
        );
      if (mode === "hostile") {
        await privacyHarness.collect(localPage, item, state);
        const text = await page.locator("body").innerText(),
          snapshot = await page.locator("body").ariaSnapshot();
        const context = await privacyHarness.context(localPage, state, text, snapshot, null);
        const remainder = privacyHarness.contexts.get(context).rendered.remainder;
        assert.ok(remainder.includes("NATIVEC8_UNLISTED_SENTINEL_84f7"));
        assert.equal(sut.classifyArtifactText(remainder, new Set()).reason, "UNKNOWN_WORDS");
      } else
        await assert.rejects(
          () => privacyHarness.collect(localPage, item, state),
          /(C8_CURRENT_BINDING|OBSERVATION_FAILED|OBSERVATION_TABLE)/,
        );
      currentObserver.close();
      currentObserver = null;
      await page.goto("about:blank");
    }
    assert.equal(readNames.has("obter_contexto_revisao_v117"), false);
    assert.equal(readNames.has("obter_detalhe_requisito_v117"), true);
    assert.equal(business, 0);
    phase("DONE");
    console.log("C8_SOURCE_REAL_24 PASS");
  } finally {
    currentObserver?.close();
    if (page && !page.isClosed()) {
      await page.goto("about:blank", { waitUntil: "load", timeout: 5000 });
      await page.unrouteAll({ behavior: "wait" });
    }
    await page?.close();
    server?.closeAllConnections();
    if (server) await new Promise((resolve) => server.close(resolve));
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("C8 source fixture preserves complete actual SDK shapes and build uses original components", async () => {
  const { data } = await c8SourceFixture();
  const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117");
  assert.equal(sut.validateC8CurrentWire(item, data), true);
  const fs = await import("node:fs/promises"),
    { join } = await import("node:path"),
    { tmpdir } = await import("node:os");
  const dir = await fs.mkdtemp(join(tmpdir(), "c8-build-check-"));
  try {
    const bundle = await c8BuildSourceUI(dir);
    assert.ok(bundle.length > 10000);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

async function c8PrivacyHarness() {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await fs.readFile(
    new URL("./authenticated-visual-audit.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("audit.mjs", source, 99, true, ts.ScriptKind.JS);
  const declaration = ast.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "c8PrivacyContext",
  );
  const collector = ast.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "collectC8CurrentWire",
  );
  const fields = ast.statements.find(
    (n) =>
      ts.isVariableStatement(n) &&
      n.declarationList.declarations.some((d) => d.name.getText(ast) === "C8_SYNTHETIC_FIELDS"),
  );
  const pages = new WeakMap(),
    contexts = new WeakMap();
  const context = new Function(
    "C8_RECOVERY_DOCUMENT",
    "SYNTHETIC_FIXTURE",
    "c8TechnicalFieldContracts",
    "C8_AUDIT_SCOPE",
    "privacy78Pages",
    "privacy78Contexts",
    "validateC8CurrentWire",
    "HML_ORIGIN",
    "fail",
    fields.getText(ast) +
      "\n" +
      declaration.getText(ast) +
      "\n" +
      collector.getText(ast) +
      ";return {context:c8PrivacyContext,collect:collectC8CurrentWire};",
  )(
    sut.C8_RECOVERY_DOCUMENT,
    sut.SYNTHETIC_FIXTURE,
    sut.c8TechnicalFieldContracts,
    sut.C8_AUDIT_SCOPE,
    pages,
    contexts,
    sut.validateC8CurrentWire,
    sut.HML_ORIGIN,
    (code) => {
      throw Object.assign(new Error(code), { code });
    },
  );
  return { pages, contexts, ...context };
}

test("C8 contextual privacy refuses missing stale closed or foreign page owners before DOM evaluation", async () => {
  const h = await c8PrivacyHarness(),
    { data } = await c8SourceFixture();
  const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117");
  let evaluations = 0;
  const page = {
    url: () => sut.HML_ORIGIN + item.path,
    evaluate: async () => {
      evaluations++;
      return [];
    },
  };
  const observer = {},
    state = {
      scope: sut.C8_AUDIT_SCOPE,
      verified: true,
      closed: false,
      generation: 1,
      c8Observer: observer,
    };
  state.c8Current = { owner: state, generation: 1, observer, item, wire: data };
  h.pages.set(page, state);
  const valid = await h.context(page, state, "Texto", "Texto", null);
  assert.equal(h.contexts.get(valid).rendered.remainder, "Texto");
  assert.equal(evaluations, 1);
  for (const delta of [
    { scope: null },
    { c8Current: null },
    { generation: 2 },
    { closed: true },
    { verified: false },
    { c8Observer: {} },
  ]) {
    Object.assign(state, delta);
    await assert.rejects(() => h.context(page, state, "Texto", "Texto", null), /C8_CURRENT_OWNER/);
    assert.equal(evaluations, 1);
    Object.assign(state, {
      scope: sut.C8_AUDIT_SCOPE,
      verified: true,
      closed: false,
      generation: 1,
      c8Observer: observer,
      c8Current: { owner: state, generation: 1, observer, item, wire: data },
    });
  }
  h.pages.set(page, {});
  await assert.rejects(() => h.context(page, state, "Texto", "Texto", null), /C8_CURRENT_OWNER/);
  assert.equal(evaluations, 1);
});

test("C8 native diagnostic exports only a closed source-real phase and never raw TAP errors", () => {
  assert.equal(typeof sut.nativeC8VisualDiagnostic, "function");
  assert.deepEqual(
    sut.nativeC8VisualDiagnostic(
      "# C8_NATIVE_PHASE START\n# C8_NATIVE_PHASE STATE V117 390 dark\nsecret Bearer canary\n",
    ),
    { stage: "STATE", surface: "V117", width: 390, theme: "dark" },
  );
  assert.deepEqual(sut.nativeC8VisualDiagnostic("# C8_NATIVE_PHASE SECRET canary\n"), {
    stage: "UNKNOWN",
  });
  assert.deepEqual(sut.nativeC8VisualDiagnostic("# C8_NATIVE_PHASE STATE V117 391 dark\n"), {
    stage: "UNKNOWN",
  });
  assert.deepEqual(sut.nativeC8VisualDiagnostic(null), { stage: "UNKNOWN" });
});

test("C8 frozen protocol requires the original package binding and exactly one valid scoped item", async () => {
  const { data, bindings: b } = await c8SourceFixture(),
    c = b.competencies[1];
  const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V120");
  const wire = structuredClone(data);
  Object.assign(wire.overview.competencia, {
    id: c.id,
    competencia_referencia: c.month,
    situacao: c.state,
  });
  assert.equal(sut.validateC8CurrentWire(item, wire), true);
  for (const mutate of [
    (w) => (w.packages[0].hash_pacote = "0".repeat(64)),
    (w) => (w.packages[0].congelado_em = null),
    (w) => (w.packages[0].numero = 2),
    (w) => (w.packages[0].status = "rascunho"),
    (w) => (w.presentations[0].protocolo = "foreign"),
    (w) => (w.presentations[0].id_organizacao = "foreign"),
    (w) => (w.items = []),
    (w) => w.items.push({ ...w.items[0] }),
    (w) => (w.items[0].hash = ""),
    (w) => (w.items[0].entidade_id = null),
    (w) => (w.items[0].versao_id = "foreign"),
    (w) => (w.items[0].id_pacote = "foreign"),
    (w) => (w.items[0].id_competencia = b.competencies[0].id),
  ]) {
    const invalid = structuredClone(wire);
    mutate(invalid);
    assert.equal(sut.validateC8CurrentWire(item, invalid), false);
  }
});

test("C8 technical contracts bind each wire field to its own original UI selector and label", async () => {
  assert.equal(typeof sut.c8TechnicalFieldContracts, "function");
  const { data } = await c8SourceFixture(),
    item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117");
  const fields = sut.c8TechnicalFieldContracts(item, data);
  const origin = fields.find((f) => f.field === "detail.requisito.origem_id");
  assert.equal(origin.value, data.detail.requisito.origem_id);
  assert.equal(origin.label, "Identificador da origem");
  assert.equal(origin.selector, 'section[aria-labelledby="v117-fonte"] > dl > div > dd');
  assert.equal(
    fields.some((f) => f.field === "context.id_organizacao"),
    false,
  );
  const hash = fields.find((f) => f.field === "detail.requisito.hash_snapshot");
  assert.equal(hash.label, "Hash do snapshot");
  assert.notEqual(origin.field, hash.field);
  const hostile = structuredClone(data);
  hostile.detail.requisito.descricao = "Pessoa fora do catálogo";
  assert.equal(
    sut.c8TechnicalFieldContracts(item, hostile).some((f) => f.value === "Pessoa fora do catálogo"),
    false,
  );
});

test("C8 opinion technical fields require each observed row to retain the current tenant and competence", async () => {
  const { data, bindings: b } = await c8SourceFixture(),
    item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V118");
  const wire = {
    overview: structuredClone(data.overview),
    opinions: [
      {
        id_competencia: sut.SYNTHETIC_FIXTURE.competence,
        id_organizacao: b.organization,
        id_contrato: b.contract,
        hash: "a".repeat(64),
      },
    ],
  };
  Object.assign(wire.overview.competencia, {
    id: sut.SYNTHETIC_FIXTURE.competence,
    competencia_referencia: "2026-11-01",
  });
  assert.equal(sut.validateC8CurrentWire(item, wire), true);
  for (const delta of [
    { id_organizacao: "foreign" },
    { id_contrato: "foreign" },
    { id_competencia: b.competencies[0].id },
  ])
    assert.equal(
      sut.validateC8CurrentWire(item, { ...wire, opinions: [{ ...wire.opinions[0], ...delta }] }),
      false,
    );
  assert.equal(sut.validateC8CurrentWire(item, { ...wire, opinions: null }), false);
});

test("C8 native observer uses the checked-out Git identity without inheriting private harness ENV", async () => {
  assert.equal(
    sut.browserEnvironment({ CONTAOS_HARNESS_SHA: "a".repeat(40) }).CONTAOS_HARNESS_SHA,
    undefined,
  );
  assert.equal(typeof nativeC8ObservationIdentity, "function");
  const identity = await nativeC8ObservationIdentity();
  assert.match(identity.harnessSha, /^[a-f0-9]{40}$/);
  const { createOfficialObserver } = await import("./prepare-visual-fixtures.mjs");
  const page = { on() {}, off() {} };
  assert.throws(
    () => createOfficialObserver(page, { identity: { ...identity, harnessSha: undefined } }),
    /OBSERVATION_DIAGNOSTIC/,
  );
  const observer = createOfficialObserver(page, { identity });
  assert.equal(observer.generation(), 0);
  await assert.rejects(
    () =>
      observer.read("apresentacoes_contratante", { id: "eb6d5b1c-8b64-418b-aa82-bf1f29d41768" }),
    { message: "OBSERVATION_TABLE" },
  );
  observer.close();
});

test("C8 primary V117 measurement refuses a missing modal while complements retain the normal page", async () => {
  const item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V117");
  const measurement = {
    viewport: { width: item.width, height: 1000 },
    theme: item.theme,
    targets: [],
    pairs: [],
    dates: [],
    table: null,
    contrast: [],
    overflowX: 0,
    modalPassed: false,
  };
  const page = { evaluate: async () => measurement };
  assert.equal(
    (await sut.collectVisualMetrics(page, item, sut.C8_AUDIT_SCOPE, "PRIMARY")).passed,
    false,
  );
  assert.equal(
    (await sut.collectVisualMetrics(page, item, sut.C8_AUDIT_SCOPE, "SIDEBAR_COLLAPSED")).passed,
    true,
  );
  assert.equal((await sut.collectVisualMetrics(page, item)).passed, true);
});

test("C8 V117 reported primary proof requires the actual modal measurement", () => {
  const rows = c8TechnicalRows(),
    i = rows.findIndex((r) => r.surface === "V117");
  rows[i].visualCapture.metrics.modalPassed = true;
  assert.equal(sut.summarizeCases(rows, sut.C8_AUDIT_SCOPE).matrixComplete, true);
  rows[i].visualCapture.metrics.modalPassed = false;
  assert.equal(sut.summarizeCases(rows, sut.C8_AUDIT_SCOPE).matrixComplete, false);
});

test("C8 V116 preserves the proven historical empty state without inventing a completed October analysis", async () => {
  const { data, bindings: b } = await c8SourceFixture(),
    item = fn("privateCases")(sut.C8_AUDIT_SCOPE).find((r) => r.surface === "V116");
  const analysis = {
    ...data.analysis,
    competencia: {
      ...data.analysis.competencia,
      id: sut.SYNTHETIC_FIXTURE.competence,
      competencia_referencia: "2026-11-01",
      situacao: "rascunho",
    },
    estado_analise: "not_analyzed",
    stale: false,
    execucao_atual: null,
    resultados: [],
    execucoes: [],
    apontamentos: [],
    percentual: 0,
    blocking_summary: { ...data.analysis.blocking_summary, total: 0, liberado: false },
  };
  assert.equal(sut.validateC8CurrentWire(item, { analysis }), true);
  for (const delta of [
    { estado_analise: "queued" },
    { stale: true },
    { resultados: [{}] },
    { execucoes: [{}] },
    { competencia: { ...analysis.competencia, id: b.competencies[0].id } },
    { percentual: 100 },
  ])
    assert.equal(sut.validateC8CurrentWire(item, { analysis: { ...analysis, ...delta } }), false);
});

test("C8 native diagnostic distinguishes a TAP timeout from lifecycle failure without exporting errors", () => {
  const tap =
    "# C8_NATIVE_PHASE DONE\n# tests 1\n# pass 0\n# fail 1\n# skipped 0\n# cancelled 0\n  failureType: 'unhandledRejection'\n  error: 'Bearer secret-canary'\n";
  assert.deepEqual(sut.nativeC8VisualDiagnostic(tap), {
    stage: "DONE",
    outcome: {
      tests: 1,
      pass: 0,
      fail: 1,
      skipped: 0,
      cancelled: 0,
      kinds: ["unhandledRejection"],
      lifecycleAfterEnd: false,
      abortedRequest: false,
      targetClosed: false,
    },
  });
});

test("C8 native cleanup drains active route handlers before page and server shutdown", async () => {
  const fs = await import("node:fs/promises"),
    ts = (await import("typescript")).default;
  const source = await fs.readFile(
    new URL("./authenticated-visual-audit.test.mjs", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile("audit.test.mjs", source, 99, true, ts.ScriptKind.JS);
  const probe = ast.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === "c8NativeSourceProbe",
  );
  const cleanup = probe.body.statements.find((n) => ts.isTryStatement(n)).finallyBlock;
  const run = new Function(
    "env",
    "const {currentObserver,page,server,fs,dir}=env;return(async()=>" +
      cleanup.getText(ast) +
      ")();",
  );
  const calls = [];
  let drained = false,
    closed = false;
  await run({
    currentObserver: {
      close() {
        calls.push("observer");
      },
    },
    page: {
      isClosed: () => false,
      goto: async (url) => {
        assert.equal(url, "about:blank");
        calls.push("blank");
      },
      unrouteAll: async (options) => {
        assert.deepEqual(options, { behavior: "wait" });
        drained = true;
        calls.push("drain");
      },
      close: async () => {
        assert.equal(drained, true);
        closed = true;
        calls.push("page");
      },
    },
    server: {
      closeAllConnections() {
        assert.equal(closed, true);
        calls.push("connections");
      },
      close(done) {
        calls.push("server");
        done();
      },
    },
    fs: {
      rm: async () => {
        assert.equal(closed, true);
        calls.push("files");
      },
    },
    dir: "native-fixture",
  });
  assert.deepEqual(calls, ["observer", "blank", "drain", "page", "connections", "server", "files"]);
});

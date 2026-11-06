import { defineConfig, devices } from "@playwright/test";

/**
 * SYS-03 HML: testes públicos somente leitura.
 * Requer instalação separada e auditada de @playwright/test com bun.lock atualizado.
 * Não configura storageState, credenciais ou projetos de produção.
 */
export default defineConfig({
  testDir: "./tests/hml",
  testMatch: /sys03-harness-readiness\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  timeout: 20_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: process.env.CONTAOS_HML_FRONTEND_URL || "https://scope-and-approval-keeper.lovable.app",
    ...devices["Desktop Chrome"],
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});

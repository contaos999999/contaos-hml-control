import { expect, test } from "@playwright/test";

// SYS-03: N4 parcial, apenas URL pública sem token. Não comprova N1–N9.
test("N4: acesso direto sem token não exibe formulário de nova senha", async ({ page }) => {
  await page.goto("/redefinir-senha");
  await expect(page.getByText("Este link de redefinição é inválido ou expirou. Solicite um novo link.")).toBeVisible();
  await expect(page.getByLabel("Nova senha")).toHaveCount(0);
});

test("N4: URL com erro otp_expired bloqueia formulário", async ({ page }) => {
  await page.goto("/redefinir-senha#error=access_denied&error_code=otp_expired");
  await expect(page.getByText("Este link de redefinição é inválido ou expirou. Solicite um novo link.")).toBeVisible();
  await expect(page.getByLabel("Nova senha")).toHaveCount(0);
});

test("SYS-03: página pública de recuperação é acessível", async ({ page }) => {
  await page.goto("/esqueci-senha");
  await expect(page.getByRole("button", { name: /enviar|solicitar/i }).first()).toBeVisible();
});

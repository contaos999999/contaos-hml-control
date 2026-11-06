import { expect, test } from "@playwright/test";
import { syntheticFixturePreflight } from "./sys03-fixture";

/**
 * Real HML browser requests, NOT mocks. Never record passwords, OTPs or links.
 * This suite does not consume a mailbox or mutate an account password.
 * Full token redemption and old/new password checks remain separate gates.
 */
test.describe("SYS-03 HML authenticated browser integration", () => {
  test.beforeAll(() => {
    const check = syntheticFixturePreflight(process.env);
    if (!check.ready) throw new Error("BLOCKED: HML fixture prerequisites: " + check.missing.join(","));
  });

  test("N1: valid synthetic user can request recovery through real Supabase Auth", async ({ page }) => {
    const authResponses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/auth/v1/recover") && response.request().method() === "POST") {
        authResponses.push(response.status());
      }
    });
    await page.goto("/esqueci-senha");
    await page.getByLabel("E-mail").fill(process.env.CONTAOS_HML_SYNTHETIC_EMAIL!);
    await page.getByRole("button", { name: /enviar link|solicitar/i }).click();
    await expect(page.getByText("Solicitação recebida", { exact: true })).toBeVisible();
    expect(authResponses.length).toBe(1);
    // A 429 can be an expected rate-limit response; the UI intentionally stays neutral.
    expect([200, 429]).toContain(authResponses[0]);
  });

  test("N2: nonexistent synthetic address does not disclose account existence", async ({ page }) => {
    const email = "contaos-sys03-nonexistent-" + Date.now() + "@example.com";
    await page.goto("/esqueci-senha");
    await page.getByLabel("E-mail").fill(email);
    await page.getByRole("button", { name: /enviar link|solicitar/i }).click();
    await expect(page.getByText("Se existir uma conta vinculada a este e-mail, você receberá as instruções para redefinir sua senha.")).toBeVisible();
    await expect(page.getByText(/usuário não encontrado|user not found|não cadastrado/i)).toHaveCount(0);
  });

  test("N3: malformed email is rejected without sending Auth recovery request", async ({ page }) => {
    let calls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/auth/v1/recover") && req.method() === "POST") calls++;
    });
    await page.goto("/esqueci-senha");
    await page.getByLabel("E-mail").fill("not-an-email");
    await page.getByRole("button", { name: /enviar link|solicitar/i }).click();
    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    expect(calls).toBe(0);
  });

  test("N4: expired or invalid token URL never exposes password fields", async ({ page }) => {
    await page.goto("/redefinir-senha#error=access_denied&error_code=otp_expired");
    await expect(page.getByText("Este link de redefinição é inválido ou expirou. Solicite um novo link.")).toBeVisible();
    await expect(page.getByLabel("Nova senha")).toHaveCount(0);
  });
});

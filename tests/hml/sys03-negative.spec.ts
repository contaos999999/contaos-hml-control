import { expect, test } from "@playwright/test";

const INVALID_MESSAGE = "Este link de redefinição é inválido ou expirou. Solicite um novo link.";

test.describe("SYS-03 N4: links inválidos, somente leitura", () => {
  const cases = [
    { name: "hash otp_disabled", suffix: "#error=access_denied&error_code=otp_disabled" },
    { name: "hash invalid_grant", suffix: "#error=access_denied&error_code=invalid_grant" },
    { name: "query otp_expired", suffix: "?error=access_denied&error_code=otp_expired" },
    { name: "query error genérico", suffix: "?error=access_denied" },
  ];

  for (const scenario of cases) {
    test(scenario.name, async ({ page }) => {
      await page.goto("/redefinir-senha" + scenario.suffix);
      await expect(page.getByText(INVALID_MESSAGE)).toBeVisible();
      await expect(page.getByLabel("Nova senha")).toHaveCount(0);
    });
  }
});

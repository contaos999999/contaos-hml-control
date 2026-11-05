import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("BRAND-01 sidebar: logos com contraste em ambos os temas", () => {
  it("usa a variante navy no tema claro e branca no tema escuro", () => {
    const codigo = readFileSync(resolve(__dirname, "../components/layout/ContaOSAppShell.tsx"), "utf8");
    expect(codigo).toContain("ContaOS_Logo_Horizontal_Mono_Navy.svg");
    expect(codigo).toContain("ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg");
    expect(codigo).toMatch(/Mono_Navy\.svg[^\n]*dark:hidden/);
    expect(codigo).toMatch(/Mono_Branco_Transparente\.svg[^\n]*dark:block/);
  });
});

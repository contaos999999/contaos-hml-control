import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(resolve(__dirname, "../routes/__root.tsx"), "utf8");

describe("Root — idioma PT-BR", () => {
  it("declara lang pt-BR", () => {
    expect(src).toContain('lang="pt-BR"');
    expect(src).not.toContain('lang="en"');
  });
  it.each([
    "Página não encontrada",
    "Algo deu errado",
    "Ocorreu um erro inesperado. Tente novamente ou volte ao início.",
    "Tentar novamente",
    "Ir para o início",
  ])("exibe '%s'", (frase) => {
    expect(src).toContain(frase);
  });
  it.each(["Page not found", "Go home", "Something went wrong", "Try again"])(
    "não exibe '%s'",
    (frase) => {
      expect(src).not.toContain(frase);
    },
  );
});

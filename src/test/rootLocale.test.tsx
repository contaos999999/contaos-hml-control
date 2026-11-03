// Saneamento retrospectivo ContaOS 4.1 — idioma raiz em PT-BR.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = readFileSync(resolve(__dirname, "../routes/__root.tsx"), "utf8");

describe("root — idioma e mensagens PT-BR", () => {
  it("declara lang pt-BR no documento HTML", () => {
    expect(root).toContain('<html lang="pt-BR">');
    expect(root).not.toContain('<html lang="en">');
  });
  it("apresenta títulos, orientação e ações de 404 em português", () => {
    expect(root).toContain("Página não encontrada");
    expect(root).toContain("A página que você procura não existe ou foi movida.");
    expect(root).toContain("Voltar ao início");
    expect(root).not.toContain("Page not found");
    expect(root).not.toContain("Go home");
  });
  it("apresenta erro global, orientação e ações em português", () => {
    expect(root).toContain("Não foi possível carregar esta página");
    expect(root).toContain("Ocorreu um problema ao carregar a página. Tente novamente ou volte ao início.");
    expect(root).toContain("Tentar novamente");
    expect(root).not.toContain("This page didn't load");
    expect(root).not.toContain("Something went wrong on our end");
    expect(root).not.toContain("Try again");
  });
  it("preserva rotas, recuperação e metadados oficiais", () => {
    expect(root).toContain("router.invalidate();");
    expect(root).toContain("reset();");
    expect(root).toContain("reportLovableError(error");
    expect(root).toContain("createRootRouteWithContext");
    expect(root).toContain('href: "/favicon.svg"');
    expect(root).toContain("<Outlet />");
  });
});

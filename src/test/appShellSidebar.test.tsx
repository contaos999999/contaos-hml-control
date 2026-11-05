import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MENU_V1, MENU_ADMIN_V1, rotaSemSidebar } from "@/lib/navegacao/menuV1";

describe("P0 sidebar V1", () => {
  it("não mostra menu nas rotas públicas e seleção de organização", () => {
    for (const rota of ["/login", "/esqueci-senha", "/redefinir-senha", "/selecionar-organizacao"]) expect(rotaSemSidebar(rota)).toBe(true);
    expect(rotaSemSidebar("/")).toBe(false);
  });
  it("somente oferece destinos principais existentes e sem links administrativos por padrão", () => {
    expect(MENU_V1.map((x) => x.destino)).toEqual(["/", "/contratantes", "/contratos"]);
    expect(MENU_V1.every((x) => !x.destino.includes("$"))).toBe(true);
    expect(MENU_V1.every((x) => !MENU_ADMIN_V1.map((a) => String(a.destino)).includes(String(x.destino)))).toBe(true);
  });
});

const lerShell = () => readFileSync(resolve(__dirname, "../components/layout/ContaOSAppShell.tsx"), "utf8");

describe("P0 sidebar — invariantes de sessao e acessibilidade", () => {
  it("revalida o menu quando a autenticacao muda", () => {
    const codigo = lerShell();
    expect(codigo).toContain("onAuthStateChange");
    expect(codigo).toContain("setRevisaoSessao((atual) => atual + 1)");
    expect(codigo).toContain("[pathname, revisaoSessao]");
    expect(codigo).toContain("setAdministrador(false)");
  });
  it("mantem administracao condicionada ao retorno da verificacao", () => {
    const codigo = lerShell();
    expect(codigo).toContain("validarAdministrador(organizacao).catch(() => false)");
    expect(codigo).toContain("setAdministrador(autorizado === true)");
    expect(codigo).toContain("aria-expanded={movelAberto}");
    expect(codigo).toContain("aria-controls=\"contaos-menu-movel\"");
  });
});

describe("P0 sidebar — protecao contra respostas de autenticacao antigas", () => {
  it("invalida consultas em voo quando a sessao muda", () => {
    const codigo = lerShell();
    expect(codigo).toContain("geracaoAutenticacao.current += 1");
    expect(codigo).toContain("geracao === geracaoAutenticacao.current");
    expect(codigo).toContain("if (!sessaoAtual() || error || !data.user) return");
    expect(codigo).toContain("if (sessaoAtual()) setAdministrador(autorizado === true)");
  });
});

describe("P0 sidebar — regressões consolidadas do diálogo móvel", () => {
  it("fecha ao atingir o breakpoint desktop e libera o conteúdo", () => {
    const codigo = lerShell();
    expect(codigo).toContain('window.matchMedia("(min-width: 768px)")');
    expect(codigo).toContain('media.addEventListener("change", fecharAoExpandir)');
    expect(codigo).toContain('media.removeEventListener("change", fecharAoExpandir)');
    expect(codigo).toContain('inert={movelAberto}');
  });
  it("restaura rolagem e protege foco durante mudança de rota", () => {
    const codigo = lerShell();
    expect(codigo).toContain('document.body.style.overflow = overflowAnterior');
    expect(codigo).toContain('fechamentoPorNavegacao.current');
    expect(codigo).toContain('document.removeEventListener("keydown", controlarTeclado)');
  });
});

import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
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

import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContaOSAppShell } from "@/components/layout/ContaOSAppShell";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  getUser: vi.fn(),
  validarAdministrador: vi.fn(),
  obterPreferencia: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
  Link: ({ children, to, onClick, ...props }: {
    children: React.ReactNode; to: string; onClick?: () => void; [key: string]: unknown;
  }) => <a href={to} onClick={onClick} {...props}>{children}</a>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: mocks.getUser, onAuthStateChange: mocks.onAuthStateChange } },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: mocks.obterPreferencia,
}));
vi.mock("@/lib/administracao/admUsuariosRpc", () => ({
  validarAdministrador: mocks.validarAdministrador,
}));

describe("P0 sidebar — testes DOM reais do modal", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.getUser.mockReset().mockResolvedValue({ data: { user: { id: "usuario-teste" } }, error: null });
    mocks.obterPreferencia.mockReset().mockReturnValue("org-teste");
    mocks.validarAdministrador.mockReset().mockResolvedValue(false);
    mocks.onAuthStateChange.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    document.body.style.overflow = "";
  });
  afterEach(() => { cleanup(); document.body.style.overflow = ""; });

  it("abre o diálogo, torna o fundo inerte e restaura rolagem após Escape", async () => {
    render(<ContaOSAppShell><button type="button">Conteúdo privado</button></ContaOSAppShell>);
    const abrir = await screen.findByRole("button", { name: "Abrir menu" });
    fireEvent.click(abrir);
    const dialogo = screen.getByRole("dialog", { name: "Menu de navegação" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(abrir).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Conteúdo privado" }).parentElement).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(abrir).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
  });

  it("nega links administrativos quando a RPC retorna falso", async () => {
    render(<ContaOSAppShell><div>Conteúdo</div></ContaOSAppShell>);
    await screen.findByRole("button", { name: "Abrir menu" });
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Auditoria" })).not.toBeInTheDocument();
  });
});

describe("P0 sidebar — concorrência de autorização e responsividade", () => {
  it("não exibe administração enquanto RPC está pendente e libera somente após autorização", async () => {
    let resolver!: (valor: boolean) => void;
    mocks.validarAdministrador.mockImplementation(() => new Promise<boolean>((resolve) => { resolver = resolve; }));
    render(<ContaOSAppShell><div>Área de trabalho</div></ContaOSAppShell>);
    await screen.findByRole("button", { name: "Abrir menu" });
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    resolver(true);
    await waitFor(() => expect(screen.getAllByRole("link", { name: "Usuários" }).length).toBeGreaterThan(0));
  });

  it("mantém menu administrativo oculto quando a RPC falha", async () => {
    mocks.validarAdministrador.mockRejectedValue(new Error("indisponível"));
    render(<ContaOSAppShell><div>Área de trabalho</div></ContaOSAppShell>);
    await screen.findByRole("button", { name: "Abrir menu" });
    await waitFor(() => expect(mocks.validarAdministrador).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });

  it("fecha o diálogo ao mudar para viewport desktop e libera o conteúdo", async () => {
    const original = window.matchMedia;
    let aoMudar: ((evento: { matches: boolean }) => void) | undefined;
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({
      matches: false,
      addEventListener: (_nome: string, cb: (evento: { matches: boolean }) => void) => { aoMudar = cb; },
      removeEventListener: vi.fn(),
    })) });
    try {
      render(<ContaOSAppShell><button type="button">Conteúdo</button></ContaOSAppShell>);
      const abrir = await screen.findByRole("button", { name: "Abrir menu" });
      fireEvent.click(abrir);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const { act } = await import("@testing-library/react");
      await act(async () => { aoMudar?.({ matches: true }); });
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(abrir).not.toHaveAttribute("inert");
      expect(document.body.style.overflow).toBe("");
    } finally {
      cleanup();
      Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
    }
  });
});

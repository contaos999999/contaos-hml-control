import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MENU_V1, MENU_ADMIN_V1, rotaSemSidebar } from "@/lib/navegacao/menuV1";

describe("P0 sidebar V1", () => {
  it("não mostra menu nas rotas públicas e seleção de organização", () => {
    for (const rota of ["/login", "/esqueci-senha", "/redefinir-senha", "/selecionar-organizacao"])
      expect(rotaSemSidebar(rota)).toBe(true);
    expect(rotaSemSidebar("/")).toBe(false);
  });
  it("somente oferece destinos principais existentes e sem links administrativos por padrão", () => {
    expect(MENU_V1.map((x) => x.destino)).toEqual([
      "/",
      "/contratantes",
      "/contratantes/novo",
      "/contratos",
      "/contratos/novo",
    ]);
    expect(MENU_V1.every((x) => !x.destino.includes("$"))).toBe(true);
    expect(
      MENU_V1.every(
        (x) => !MENU_ADMIN_V1.map((a) => String(a.destino)).includes(String(x.destino)),
      ),
    ).toBe(true);
  });
});

const semEspaco = (valor: string) => valor.replace(/\s+/g, "").replace(/,\)/g, ")");
const lerShell = () =>
  readFileSync(resolve(__dirname, "../components/layout/ContaOSAppShell.tsx"), "utf8");

describe("P0 sidebar — invariantes de sessao e acessibilidade", () => {
  it("distingue rota de cadastro da listagem e mantém ícone de contratantes", () => {
    const codigo = readFileSync(
      resolve(__dirname, "../components/layout/ContaOSSidebar.tsx"),
      "utf8",
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco('destino !== "/contratantes" && destino !== "/contratos"'),
    );
    expect(semEspaco(codigo)).toContain(semEspaco('destino.startsWith("/contratantes")'));
  });
  it("revalida o menu quando a autenticacao muda", () => {
    const codigo = lerShell();
    expect(semEspaco(codigo)).toContain(semEspaco("onAuthStateChange"));
    expect(semEspaco(codigo)).toContain(semEspaco("setRevisaoSessao((atual) => atual + 1)"));
    expect(semEspaco(codigo)).toContain(semEspaco("[pathname, revisaoSessao]"));
    expect(semEspaco(codigo)).toContain(semEspaco("setAdministrador(false)"));
    expect(semEspaco(codigo)).toContain(semEspaco("setAuditoriaPermitida(false)"));
  });
  it("mantem administracao condicionada ao retorno da verificacao", () => {
    const codigo = lerShell();
    expect(semEspaco(codigo)).toContain(
      semEspaco("validarAdministrador(organizacao).catch(() => false)"),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco(
        'setAdministrador(autorizado === true && temPermissao(efetivas.permissoes, "usuarios", "administrar"))',
      ),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco("podeConsultarAuditoria(organizacao).catch(() => false)"),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco(
        'setAuditoriaPermitida(auditoriaAutorizada === true && temPermissao(efetivas.permissoes, "auditoria", "consultar"))',
      ),
    );
    expect(semEspaco(codigo)).toContain(semEspaco("aria-expanded={movelAberto}"));
    expect(semEspaco(codigo)).toContain(semEspaco('aria-controls="contaos-menu-movel"'));
  });
});

describe("P0 sidebar — protecao contra respostas de autenticacao antigas", () => {
  it("invalida consultas em voo quando a sessao muda", () => {
    const codigo = lerShell();
    expect(semEspaco(codigo)).toContain(semEspaco("geracaoAutenticacao.current += 1"));
    expect(semEspaco(codigo)).toContain(semEspaco("geracao === geracaoAutenticacao.current"));
    expect(semEspaco(codigo)).toContain(
      semEspaco("if (!sessaoAtual() || error || !data.user) return"),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco(
        'if (sessaoAtual()) setAdministrador(autorizado === true && temPermissao(efetivas.permissoes, "usuarios", "administrar"))',
      ),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco(
        'if (sessaoAtual()) setAuditoriaPermitida(auditoriaAutorizada === true && temPermissao(efetivas.permissoes, "auditoria", "consultar"))',
      ),
    );
  });
});

describe("P0 sidebar — regressões consolidadas do diálogo móvel", () => {
  it("fecha ao atingir o breakpoint desktop e libera o conteúdo", () => {
    const codigo = lerShell();
    expect(semEspaco(codigo)).toContain(semEspaco('window.matchMedia("(min-width: 768px)")'));
    expect(semEspaco(codigo)).toContain(
      semEspaco('media.addEventListener("change", fecharAoExpandir)'),
    );
    expect(semEspaco(codigo)).toContain(
      semEspaco('media.removeEventListener("change", fecharAoExpandir)'),
    );
    expect(semEspaco(codigo)).toContain(semEspaco("inert={movelAberto}"));
  });
  it("restaura rolagem e protege foco durante mudança de rota", () => {
    const codigo = lerShell();
    expect(semEspaco(codigo)).toContain(
      semEspaco("document.body.style.overflow = overflowAnterior"),
    );
    expect(semEspaco(codigo)).toContain(semEspaco("fechamentoPorNavegacao.current"));
    expect(semEspaco(codigo)).toContain(
      semEspaco('document.removeEventListener("keydown", controlarTeclado)'),
    );
  });
});

import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContaOSAppShell } from "@/components/layout/ContaOSAppShell";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  getUser: vi.fn(),
  validarAdministrador: vi.fn(),
  podeConsultarAuditoria: vi.fn(),
  obterPreferencia: vi.fn(),
  onAuthStateChange: vi.fn(),
  efetivas: vi.fn(),
  contexto: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
  Link: ({
    children,
    to,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={to} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: mocks.getUser, onAuthStateChange: mocks.onAuthStateChange } },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: mocks.obterPreferencia,
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));
vi.mock("@/lib/administracao/admUsuariosRpc", () => ({
  validarAdministrador: mocks.validarAdministrador,
  podeConsultarAuditoria: mocks.podeConsultarAuditoria,
}));

vi.mock("@/lib/administracao/rbacRpc", async () => ({
  ...(await vi.importActual<typeof import("@/lib/administracao/rbacRpc")>(
    "@/lib/administracao/rbacRpc",
  )),
  consultarPermissoesEfetivas: mocks.efetivas,
  resolverContextoRbac: mocks.contexto,
}));
describe("P0 sidebar — testes DOM reais do modal", () => {
  beforeEach(() => {
    mocks.efetivas.mockReset().mockResolvedValue({
      schema_versao: "rbac-v1",
      versao: 5,
      master: false,
      permissoes: [
        { recurso: "usuarios", acao: "administrar" },
        { recurso: "auditoria", acao: "consultar" },
        { recurso: "dashboard", acao: "consultar" },
        { recurso: "contratos", acao: "consultar" },
        { recurso: "contratos", acao: "criar" },
        { recurso: "contratantes", acao: "consultar" },
        { recurso: "contratantes", acao: "criar" },
      ],
    });
    mocks.contexto
      .mockReset()
      .mockResolvedValue({ contrato: null, competencia: null, contratante: null });
    mocks.pathname = "/";
    mocks.getUser
      .mockReset()
      .mockResolvedValue({ data: { user: { id: "usuario-teste" } }, error: null });
    mocks.obterPreferencia.mockReset().mockReturnValue("org-teste");
    mocks.validarAdministrador.mockReset().mockResolvedValue(false);
    mocks.podeConsultarAuditoria.mockReset().mockResolvedValue(false);
    mocks.onAuthStateChange
      .mockReset()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    document.body.style.overflow = "";
  });
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("abre o diálogo, torna o fundo inerte e restaura rolagem após Escape", async () => {
    render(
      <ContaOSAppShell>
        <button type="button">Conteúdo privado</button>
      </ContaOSAppShell>,
    );
    const abrir = await screen.findByRole("button", { name: "Abrir menu" });
    fireEvent.click(abrir);
    const dialogo = screen.getByRole("dialog", { name: "Menu de navegação" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(abrir).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Conteúdo privado" }).parentElement).toHaveAttribute(
      "inert",
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(abrir).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
  });

  it("nega links administrativos quando a RPC retorna falso", async () => {
    render(
      <ContaOSAppShell>
        <div>Conteúdo</div>
      </ContaOSAppShell>,
    );
    await screen.findByRole("button", { name: "Abrir menu" });
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Auditoria" })).not.toBeInTheDocument();
  });
});

describe("P0 sidebar — concorrência de autorização e responsividade", () => {
  it("não exibe administração enquanto RPC está pendente e libera somente após autorização", async () => {
    let resolver!: (valor: boolean) => void;
    mocks.validarAdministrador.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolver = resolve;
        }),
    );
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await screen.findByRole("button", { name: "Abrir menu" });
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    resolver(true);
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: "Usuários" }).length).toBeGreaterThan(0),
    );
  });

  it("mantém menu administrativo oculto quando a RPC falha", async () => {
    mocks.validarAdministrador.mockRejectedValue(new Error("indisponível"));
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await screen.findByRole("button", { name: "Abrir menu" });
    await waitFor(() => expect(mocks.validarAdministrador).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });

  it("fecha o diálogo ao mudar para viewport desktop e libera o conteúdo", async () => {
    const original = window.matchMedia;
    let aoMudar: ((evento: { matches: boolean }) => void) | undefined;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: (_nome: string, cb: (evento: { matches: boolean }) => void) => {
          aoMudar = cb;
        },
        removeEventListener: vi.fn(),
      })),
    });
    try {
      render(
        <ContaOSAppShell>
          <button type="button">Conteúdo</button>
        </ContaOSAppShell>,
      );
      const abrir = await screen.findByRole("button", { name: "Abrir menu" });
      fireEvent.click(abrir);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const { act } = await import("@testing-library/react");
      await act(async () => {
        aoMudar?.({ matches: true });
      });
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(abrir).not.toHaveAttribute("inert");
      expect(document.body.style.overflow).toBe("");
    } finally {
      cleanup();
      Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
    }
  });
});

describe("P0 V1-23 — capacidades independentes", () => {
  it("exibe Auditoria para auditor sem liberar Usuários", async () => {
    mocks.validarAdministrador.mockResolvedValue(false);
    mocks.podeConsultarAuditoria.mockResolvedValue(true);
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: "Auditoria" }).length).toBeGreaterThan(0),
    );
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });
  it("não exibe Auditoria quando RPC de capacidade falha", async () => {
    mocks.podeConsultarAuditoria.mockRejectedValue(new Error("falha"));
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await waitFor(() => expect(mocks.podeConsultarAuditoria).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Auditoria" })).not.toBeInTheDocument();
  });
});

describe("P0 V1 — invalidação local imediata na troca de organização", () => {
  beforeEach(() => {
    mocks.efetivas.mockReset().mockResolvedValue({
      schema_versao: "rbac-v1",
      versao: 5,
      master: false,
      permissoes: [
        { recurso: "usuarios", acao: "administrar" },
        { recurso: "auditoria", acao: "consultar" },
        { recurso: "dashboard", acao: "consultar" },
        { recurso: "contratos", acao: "consultar" },
        { recurso: "contratos", acao: "criar" },
        { recurso: "contratantes", acao: "consultar" },
        { recurso: "contratantes", acao: "criar" },
      ],
    });
    mocks.contexto
      .mockReset()
      .mockResolvedValue({ contrato: null, competencia: null, contratante: null });
    mocks.pathname = "/";
    mocks.getUser
      .mockReset()
      .mockResolvedValue({ data: { user: { id: "usuario-teste" } }, error: null });
    mocks.obterPreferencia.mockReset().mockReturnValue("org-teste");
    mocks.validarAdministrador.mockReset().mockResolvedValue(false);
    mocks.podeConsultarAuditoria.mockReset().mockResolvedValue(false);
    mocks.onAuthStateChange
      .mockReset()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });
  afterEach(() => cleanup());

  it("derruba link de Usuários imediatamente e revalida permissões sem mudar pathname", async () => {
    mocks.validarAdministrador.mockResolvedValueOnce(true).mockResolvedValue(false);
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: "Usuários" }).length).toBeGreaterThan(0),
    );
    fireEvent(window, new Event("contaos:organizacao-alterada"));
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    await waitFor(() => expect(mocks.validarAdministrador).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });

  it("ignora autorização antiga concluída após a troca de organização", async () => {
    let resolverPrimeira!: (valor: boolean) => void;
    mocks.validarAdministrador
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            resolverPrimeira = resolve;
          }),
      )
      .mockResolvedValue(false);
    render(
      <ContaOSAppShell>
        <div>Área de trabalho</div>
      </ContaOSAppShell>,
    );
    await waitFor(() => expect(mocks.validarAdministrador).toHaveBeenCalledTimes(1));
    fireEvent(window, new Event("contaos:organizacao-alterada"));
    await waitFor(() => expect(mocks.validarAdministrador).toHaveBeenCalledTimes(2));
    resolverPrimeira(true);
    await waitFor(() => expect(mocks.getUser).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });
});

describe("BRAND-01 P0 — contraste dos logos oficiais na sidebar", () => {
  it("seleciona logo navy em tema claro e branca em tema escuro", () => {
    const codigo = lerShell();
    expect(codigo).toMatch(/ContaOS_Logo_Horizontal_Mono_Navy\.svg[^>]*dark:hidden/);
    expect(codigo).toMatch(/ContaOS_Logo_Horizontal_Mono_Branco_Transparente\.svg[^>]*dark:block/);
    expect(codigo).toMatch(/ContaOS_Simbolo_Navy\.svg[^>]*dark:hidden/);
    expect(codigo).toMatch(/ContaOS_Simbolo_Branco\.svg[^>]*dark:block/);
  });
});

import { menuComumPermitido, menuContextualV1 } from "@/lib/navegacao/menuV1";
describe("navegação V1 por permissões e contexto", () => {
  it("nega todos os links de negócio sem confirmação do backend", () => {
    expect(menuComumPermitido([])).toEqual([]);
  });
  it("separa consultar e criar sem herança por nome de perfil", () => {
    expect(
      menuComumPermitido([{ recurso: "contratos", acao: "consultar" }]).map((x) => x.destino),
    ).toEqual(["/contratos"]);
    expect(
      menuComumPermitido([{ recurso: "contratantes", acao: "criar" }]).map((x) => x.destino),
    ).toEqual(["/contratantes/novo"]);
  });
  it("constrói apenas rotas existentes do contrato corrente", () => {
    const c = {
      contrato: "00000000-0000-4000-8000-000000000001",
      competencia: null,
      contratante: null,
    };
    const links = menuContextualV1(c, [
      { recurso: "contratos", acao: "consultar" },
      { recurso: "normativos", acao: "consultar" },
      { recurso: "historico", acao: "consultar" },
    ]);
    expect(links.map((x) => x.destino)).toEqual([
      `/contratos/${c.contrato}`,
      `/contratos/${c.contrato}/base-normativa`,
      `/contratos/${c.contrato}/historico`,
    ]);
    expect(links.some((x) => x.destino.endsWith("/importar"))).toBe(false);
  });
  it("mantém a competência exata nos links e exige permissão por ação", () => {
    const c = { contrato: "contrato-A", competencia: "competencia-A", contratante: null };
    const links = menuContextualV1(c, [
      { recurso: "documentos_competencia", acao: "consultar" },
      { recurso: "analises", acao: "consultar" },
    ]);
    expect(links.map((x) => x.destino)).toEqual([
      "/competencias/competencia-A/documentos",
      "/competencias/competencia-A/analise",
    ]);
    expect(links.some((x) => x.destino.includes("apresentar"))).toBe(false);
  });
});

describe("menu contextual autenticado", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.getUser
      .mockReset()
      .mockResolvedValue({ data: { user: { id: "usuario-teste" } }, error: null });
    mocks.obterPreferencia.mockReset().mockReturnValue("org-A");
    mocks.validarAdministrador.mockReset().mockResolvedValue(false);
    mocks.podeConsultarAuditoria.mockReset().mockResolvedValue(false);
    mocks.onAuthStateChange
      .mockReset()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mocks.contexto
      .mockReset()
      .mockResolvedValue({ contrato: null, competencia: null, contratante: null });
    mocks.efetivas
      .mockReset()
      .mockResolvedValue({ schema_versao: "rbac-v1", versao: 5, master: false, permissoes: [] });
  });
  afterEach(cleanup);
  it("não exibe links comuns enquanto permissões estão pendentes", async () => {
    let resolver!: (x: unknown) => void;
    mocks.efetivas.mockImplementation(
      () =>
        new Promise((r) => {
          resolver = r;
        }),
    );
    render(
      <ContaOSAppShell>
        <div>Conteúdo</div>
      </ContaOSAppShell>,
    );
    await waitFor(() => expect(mocks.efetivas).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Contratos" })).not.toBeInTheDocument();
    resolver({
      schema_versao: "rbac-v1",
      versao: 5,
      master: false,
      permissoes: [{ recurso: "contratos", acao: "consultar" }],
    });
    await screen.findByRole("link", { name: "Contratos" });
    expect(screen.queryByRole("link", { name: "Novo contrato" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Organizações" })).toHaveAttribute(
      "href",
      "/selecionar-organizacao",
    );
  });
  it("descarta permissões da organização anterior", async () => {
    let resolver!: (x: unknown) => void;
    mocks.efetivas
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolver = r;
          }),
      )
      .mockResolvedValue({ schema_versao: "rbac-v1", versao: 5, master: false, permissoes: [] });
    render(
      <ContaOSAppShell>
        <div>Conteúdo</div>
      </ContaOSAppShell>,
    );
    await waitFor(() => expect(mocks.efetivas).toHaveBeenCalledTimes(1));
    mocks.obterPreferencia.mockReturnValue("org-B");
    fireEvent(window, new Event("contaos:organizacao-alterada"));
    await waitFor(() => expect(mocks.efetivas).toHaveBeenLastCalledWith("org-B", null));
    resolver({
      schema_versao: "rbac-v1",
      versao: 5,
      master: true,
      permissoes: [{ recurso: "contratos", acao: "criar" }],
    });
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Novo contrato" })).not.toBeInTheDocument(),
    );
  });
  it("negativa efetiva bloqueia links mesmo com capacidade administrativa true", async () => {
    mocks.validarAdministrador.mockResolvedValue(true);
    mocks.podeConsultarAuditoria.mockResolvedValue(true);
    render(
      <ContaOSAppShell>
        <div>Conteúdo</div>
      </ContaOSAppShell>,
    );
    await waitFor(() => expect(mocks.podeConsultarAuditoria).toHaveBeenCalled());
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Auditoria" })).not.toBeInTheDocument();
  });
});

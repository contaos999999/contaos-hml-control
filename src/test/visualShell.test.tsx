import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useState, type ReactNode } from "react";
import { ContaOSAppShell } from "@/components/layout/ContaOSAppShell";

const m = vi.hoisted(() => ({
  path: "/",
  org: "org-a",
  user: "user-a" as string | null,
  rpc: vi.fn(),
  signOut: vi.fn(),
  cancelQueries: vi.fn(),
  clear: vi.fn(),
  navigate: vi.fn(),
  listeners: [] as Array<(event: string) => void>,
}));
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown;
  }) => select({ location: { pathname: m.path } }),
  useNavigate: () => m.navigate,
  Link: ({ to, children, ...p }: { to: string; children: ReactNode }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: m.rpc,
    auth: {
      getUser: async () => ({
        data: { user: m.user ? { id: m.user } : null },
        error: null,
      }),
      signOut: m.signOut,
      onAuthStateChange: (callback: (event: string) => void) => {
        m.listeners.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                m.listeners = m.listeners.filter((c) => c !== callback);
              },
            },
          },
        };
      },
    },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: () => m.org,
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));
vi.mock("@/lib/administracao/admUsuariosRpc", () => ({
  validarAdministrador: async () => false,
  podeConsultarAuditoria: async () => false,
}));
vi.mock("@/lib/administracao/rbacRpc", async () => ({
  ...(await vi.importActual<typeof import("@/lib/administracao/rbacRpc")>(
    "@/lib/administracao/rbacRpc",
  )),
  consultarPermissoesEfetivas: async () => ({
    permissoes: [{ recurso: "dashboard", acao: "consultar" }],
  }),
  resolverContextoRbac: async () => ({
    contrato: null,
    competencia: null,
    contratante: null,
  }),
}));
const resumo = (id = "org-a", nome = "Organização Alfa") => ({
  data: {
    schema_versao: "sys05-v1",
    organizacao: {
      id,
      razao_social: nome,
      nome_fantasia: null,
      situacao: "ativa",
    },
  },
  error: null,
});
const pagina = (child: ReactNode = <main>Conteúdo da página</main>) => (
  <ContaOSAppShell>{child}</ContaOSAppShell>
);
beforeEach(() => {
  m.path = "/";
  m.org = "org-a";
  m.user = "user-a";
  m.listeners = [];
  m.rpc.mockReset().mockResolvedValue(resumo());
  m.signOut.mockReset().mockResolvedValue({ error: null });
  m.cancelQueries.mockReset().mockResolvedValue(undefined);
  m.clear.mockReset();
  m.navigate.mockReset();
});
afterEach(cleanup);

describe("P0 apresentação organizacional global", () => {
  it("preserva nome e situação ao navegar entre páginas organizacionais", async () => {
    const { rerender } = render(pagina());
    await screen.findByText("Organização Alfa");
    expect(screen.getByText(/Situação: ativa/)).toBeInTheDocument();
    for (const route of [
      "/contratantes",
      "/contratos/novo",
      "/contratos",
      "/administracao/auditoria",
    ]) {
      m.path = route;
      rerender(pagina(<main>{route}</main>));
      expect(screen.getByText("Organização Alfa")).toBeInTheDocument();
    }
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("obter_resumo_dashboard", {
      p_id_organizacao: "org-a",
    });
  });
  it("remove contexto antigo imediatamente na troca A/B e descarta respostas obsoletas", async () => {
    let resolveOld!: (v: unknown) => void;
    m.rpc.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveOld = r;
        }),
    );
    render(pagina());
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(1));
    m.org = "org-b";
    m.rpc.mockResolvedValue(resumo("org-b", "Organização Beta"));
    act(() => window.dispatchEvent(new Event("contaos:organizacao-alterada")));
    await screen.findByText("Organização Beta");
    await act(async () => resolveOld(resumo()));
    expect(screen.queryByText("Organização Alfa")).not.toBeInTheDocument();
    expect(screen.getByText("Organização Beta")).toBeInTheDocument();
  });
  it.each([
    ["ID incompatível", resumo("org-b")],
    [
      "schema inválido",
      { data: { ...resumo().data, schema_versao: "invalido" }, error: null },
    ],
    ["negação", { data: null, error: { code: "42501" } }],
  ])("não exibe organização quando backend retorna %s", async (_, response) => {
    m.rpc.mockResolvedValue(response);
    render(pagina());
    await screen.findByText("Não foi possível confirmar a organização.");
    expect(screen.queryByText("Organização Alfa")).not.toBeInTheDocument();
  });
  it("limpa apresentação após logout e navega somente após sucesso", async () => {
    render(pagina());
    await screen.findByText("Organização Alfa");
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() =>
      expect(m.navigate).toHaveBeenCalledWith({ to: "/login", replace: true }),
    );
    expect(screen.queryByText("Organização Alfa")).not.toBeInTheDocument();
    expect(m.signOut).toHaveBeenCalledTimes(1);
    expect(m.cancelQueries).toHaveBeenCalledTimes(1);
    expect(m.clear).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("link", { name: "Trocar organização" }),
    ).toHaveAttribute("href", "/selecionar-organizacao");
  });
  it("apresenta falha de logout sem anunciar sucesso nem navegar", async () => {
    m.signOut.mockResolvedValue({ error: new Error("indisponivel") });
    render(pagina());
    await screen.findByText("Organização Alfa");
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await screen.findByText("Não foi possível sair. Tente novamente.");
    expect(m.navigate).not.toHaveBeenCalled();
  });
  it("limpa dados quando outra sessão substitui o usuário atual", async () => {
    render(pagina());
    await screen.findByText("Organização Alfa");
    m.user = null;
    act(() => m.listeners.forEach((callback) => callback("SIGNED_OUT")));
    expect(screen.queryByText("Organização Alfa")).not.toBeInTheDocument();
  });
  it("marca do ambiente autenticado fica exclusivamente no menu", () => {
    const files = Object.keys(
      import.meta.glob(
        "../components/{dashboard,contratos,contratantes,competencias,administracao}/**/*.tsx",
      ),
    );
    expect(files.length).toBeGreaterThan(20);
    for (const file of files)
      expect(
        readFileSync(resolve(__dirname, file), "utf8"),
        file,
      ).not.toContain("<ContaOSMarca");
  });
  it("Auditoria oferece filtros em card e tabela como região rolável acessível", () => {
    const file = readFileSync(
      resolve(
        __dirname,
        "../components/administracao/auditoria/TrilhaAuditoria.tsx",
      ),
      "utf8",
    );
    expect(file).toContain("bg-card");
    expect(file).toContain('role="region"');
    expect(file).toContain("tabIndex={0}");
  });
});

function ConteudoDaOrganizacao() {
  const [org] = useState(m.org);
  return <main>Conteúdo {org}</main>;
}
describe("P0 contexto compartilhado e ações únicas", () => {
  it("remonta conteúdo contextual na troca de organização sem trocar rota", async () => {
    render(pagina(<ConteudoDaOrganizacao />));
    await screen.findByText("Organização Alfa");
    expect(screen.getByText("Conteúdo org-a")).toBeInTheDocument();
    m.org = "org-b";
    m.rpc.mockResolvedValue(resumo("org-b", "Organização Beta"));
    act(() => window.dispatchEvent(new Event("contaos:organizacao-alterada")));
    await screen.findByText("Organização Beta");
    expect(screen.getByText("Conteúdo org-b")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo org-a")).not.toBeInTheDocument();
  });
  it("páginas não duplicam Sair nem nome/status organizacional local", () => {
    for (const file of [
      "dashboard/Dashboard.tsx",
      "contratantes/ListaContratantes.tsx",
      "contratantes/NovoContratante.tsx",
      "contratantes/EditarContratante.tsx",
      "contratos/NovoContrato.tsx",
      "administracao/usuarios/AdminUsuarios.tsx",
    ]) {
      const src = readFileSync(
        resolve(__dirname, "../components/", file),
        "utf8",
      );
      expect(src, file).not.toMatch(/onClick=\{(?:props\.onSair|sair)\}/);
    }
  });
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    cancelQueries: m.cancelQueries,
    clear: m.clear,
  }),
}));

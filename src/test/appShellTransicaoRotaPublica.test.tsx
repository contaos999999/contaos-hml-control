import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { ContaOSAppShell } from "@/components/layout/ContaOSAppShell";

// Fase 2 R10: ao navegar de uma rota do shell para uma rota pública, a página de origem
// não pode ser desmontada e remontada enquanto a nova rota ainda está pendente. A
// remontagem repete os pedidos da origem, que são abortados quando a nova rota entra.

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "usuario-r10" } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: () => Promise.resolve("organizacao-r10"),
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));
vi.mock("@/lib/administracao/admUsuariosRpc", () => ({
  validarAdministrador: () => Promise.resolve(false),
  podeConsultarAuditoria: () => Promise.resolve(false),
}));
vi.mock("@/lib/administracao/rbacRpc", async () => ({
  ...(await vi.importActual<typeof import("@/lib/administracao/rbacRpc")>(
    "@/lib/administracao/rbacRpc",
  )),
  consultarPermissoesEfetivas: () =>
    Promise.resolve({ schema_versao: "rbac-v1", versao: 5, master: false, permissoes: [] }),
  resolverContextoRbac: () =>
    Promise.resolve({ contrato: null, competencia: null, contratante: null }),
}));
vi.mock("@/components/layout/ContaOSOrganizationHeader", () => ({
  ContaOSOrganizationHeader: () => null,
}));
vi.mock("@/components/copiloto/CopilotoContrato", () => ({
  CopilotoContrato: () => null,
}));

const historicos: Array<ReturnType<typeof createMemoryHistory>> = [];
afterEach(() => {
  cleanup();
  for (const historico of historicos.splice(0)) historico.destroy();
});

async function montar() {
  const origem = { montagens: 0, pedidos: 0, abortos: 0 };
  let liberarDestino: () => void = () => undefined;
  const destinoPendente = () =>
    new Promise<void>((resolve) => {
      liberarDestino = resolve;
    });
  function Origem() {
    useEffect(() => {
      origem.montagens += 1;
      const controle = new AbortController();
      origem.pedidos += 1;
      controle.signal.addEventListener("abort", () => {
        origem.abortos += 1;
      });
      return () => controle.abort();
    }, []);
    return <h1>Origem do fixture</h1>;
  }
  const raiz = createRootRoute({
    component: () => (
      <ContaOSAppShell>
        <Outlet />
      </ContaOSAppShell>
    ),
  });
  const rotaOrigem = createRoute({
    getParentRoute: () => raiz,
    path: "/competencias/$id",
    component: Origem,
  });
  const rotaPublica = createRoute({
    getParentRoute: () => raiz,
    path: "/selecionar-organizacao",
    loader: destinoPendente,
    component: () => <h1>Selecionar organização do fixture</h1>,
  });
  const rotaInterna = createRoute({
    getParentRoute: () => raiz,
    path: "/contratos",
    loader: destinoPendente,
    component: () => <h1>Contratos do fixture</h1>,
  });
  const historico = createMemoryHistory({ initialEntries: ["/competencias/c-r10"] });
  historicos.push(historico);
  const router = createRouter({
    routeTree: raiz.addChildren([rotaOrigem, rotaPublica, rotaInterna]),
    history: historico,
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole("heading", { name: "Origem do fixture" });
  await waitFor(() => expect(origem.montagens).toBe(1));
  return { router, historico, origem, liberar: () => liberarDestino() };
}

describe("Fase 2 R10 — AppShell não remonta a rota de origem durante a navegação", () => {
  it.each([
    ["/selecionar-organizacao", "Selecionar organização do fixture"],
    ["/contratos", "Contratos do fixture"],
  ])("origem monta uma única vez ao navegar para %s", async (destino, titulo) => {
    const f = await montar();
    act(() => f.historico.push(destino));
    await waitFor(() => expect(f.router.state.location.pathname).toBe(destino));
    // Navegação pendente: a origem continua renderizada, sem nova montagem nem pedido.
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.getByRole("heading", { name: "Origem do fixture" })).toBeInTheDocument();
    expect(f.origem.montagens).toBe(1);
    expect(f.origem.pedidos).toBe(1);
    expect(f.origem.abortos).toBe(0);
    await act(async () => {
      f.liberar();
    });
    await screen.findByRole("heading", { name: titulo });
    expect(screen.queryByRole("heading", { name: "Origem do fixture" })).not.toBeInTheDocument();
    expect(f.origem.montagens).toBe(1);
    expect(f.origem.pedidos).toBe(1);
    expect(f.origem.abortos).toBe(1);
  });

  it("aplica o layout da rota renderizada: rota pública sem o menu do shell", async () => {
    const f = await montar();
    act(() => f.historico.push("/selecionar-organizacao"));
    await waitFor(() => expect(f.router.state.location.pathname).toBe("/selecionar-organizacao"));
    // O loader do destino precisa ter começado antes de ser liberado.
    await new Promise((resolve) => setTimeout(resolve, 30));
    await act(async () => {
      f.liberar();
    });
    await screen.findByRole("heading", { name: "Selecionar organização do fixture" });
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Abrir menu" })).not.toBeInTheDocument(),
    );
  });
});

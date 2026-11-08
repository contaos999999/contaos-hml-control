import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect, useState } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { ContaOSSidebar } from "@/components/layout/ContaOSSidebar";
import type { AcaoRbac, ContextoRbac } from "@/lib/administracao/rbacRpc";

const contrato = "00000000-0000-4000-8000-000000000001";
const competencia = "00000000-0000-4000-8000-000000000002";
const contratante = "00000000-0000-4000-8000-000000000003";
const cenarios = [
  {
    titulo: "Orçamento",
    destino: `/contratos/${contrato}/orcamento`,
    contexto: { contrato, competencia: null, contratante: null },
    permissoes: [{ recurso: "orcamentos", acao: "consultar" }],
  },
  {
    titulo: "Análise da competência",
    destino: `/competencias/${competencia}/analise`,
    contexto: { contrato: null, competencia, contratante: null },
    permissoes: [{ recurso: "analises", acao: "consultar" }],
  },
  {
    titulo: "Editar contratante",
    destino: `/contratantes/${contratante}/editar`,
    contexto: { contrato: null, competencia: null, contratante },
    permissoes: [{ recurso: "contratantes", acao: "editar" }],
  },
] satisfies Array<{
  titulo: string;
  destino: string;
  contexto: ContextoRbac;
  permissoes: AcaoRbac[];
}>;

const historicos: Array<ReturnType<typeof createMemoryHistory>> = [];
afterEach(() => {
  cleanup();
  for (const historico of historicos.splice(0)) historico.destroy();
});

async function montar(cenario = cenarios[0]!) {
  const navegar = vi.fn();
  const montarLayout = vi.fn();
  const desmontarLayout = vi.fn();
  const renderSidebar = {
    contexto: cenario.contexto as ContextoRbac,
    permissoes: cenario.permissoes as AcaoRbac[],
  };
  function Layout() {
    const [rascunho, setRascunho] = useState("");
    useEffect(() => {
      montarLayout();
      return desmontarLayout;
    }, []);
    return (
      <>
        <label>
          Rascunho persistente
          <input value={rascunho} onChange={(e) => setRascunho(e.target.value)} />
        </label>
        <ContaOSSidebar {...renderSidebar} aoNavegar={navegar} />
        <Outlet />
      </>
    );
  }
  const raiz = createRootRoute({ component: Layout });
  const inicio = createRoute({
    getParentRoute: () => raiz,
    path: "/",
    component: () => <h1>Início do fixture</h1>,
  });
  const destinos = [
    ["/contratos/$id/orcamento", "Orçamento do fixture"],
    ["/competencias/$id/analise", "Análise do fixture"],
    ["/contratantes/$id/editar", "Contratante do fixture"],
  ] as const;
  const rotas = destinos.map(([path, titulo]) =>
    createRoute({ getParentRoute: () => raiz, path, component: () => <h1>{titulo}</h1> }),
  );
  const historico = createMemoryHistory({ initialEntries: ["/"] });
  historicos.push(historico);
  const router = createRouter({
    routeTree: raiz.addChildren([inicio, ...rotas]),
    history: historico,
  });
  const view = render(<RouterProvider router={router} />);
  await screen.findByRole("heading", { name: "Início do fixture" });
  return { router, historico, navegar, montarLayout, desmontarLayout, renderSidebar, view };
}

// JSDOM não implementa navegação de documento. Observamos a decisão do handler real
// antes de cancelar apenas o comportamento nativo remanescente no fixture.
function clicar(link: HTMLElement, options: MouseEventInit = {}) {
  let interceptado: boolean | undefined;
  document.addEventListener(
    "click",
    (event) => {
      interceptado = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(link, { button: 0, ...options });
  return interceptado;
}

describe("P0 Trilha A — navegação contextual com TanStack real", () => {
  it.each(cenarios)("navega para $titulo sem reconstruir o layout", async (cenario) => {
    const f = await montar(cenario);
    const campo = screen.getByRole("textbox", { name: "Rascunho persistente" });
    fireEvent.change(campo, { target: { value: "rascunho próprio" } });
    const link = within(screen.getByRole("group", { name: "Contexto atual" })).getByRole("link", {
      name: cenario.titulo,
    });
    expect(link).toHaveAttribute("href", cenario.destino);
    expect(clicar(link)).toBe(true);
    await waitFor(() => expect(f.router.state.location.pathname).toBe(cenario.destino));
    expect(screen.getByRole("textbox", { name: "Rascunho persistente" })).toBe(campo);
    expect(campo).toHaveValue("rascunho próprio");
    expect(f.montarLayout).toHaveBeenCalledTimes(1);
    expect(f.desmontarLayout).not.toHaveBeenCalled();
    expect(f.navegar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("heading", { name: "Início do fixture" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /do fixture/ })).toBeVisible();
    expect(link).toHaveAttribute("aria-current", "page");
    act(() => f.historico.back());
    await screen.findByRole("heading", { name: "Início do fixture" });
    expect(campo).toHaveValue("rascunho próprio");
    act(() => f.historico.forward());
    await waitFor(() => expect(f.router.state.location.pathname).toBe(cenario.destino));
    expect(f.montarLayout).toHaveBeenCalledTimes(1);
  });

  it("aceita click sem detalhe de ponteiro como o evento nativo de ativação", async () => {
    const f = await montar();
    const link = screen.getByRole("link", { name: "Orçamento" });
    expect(clicar(link, { detail: 0 })).toBe(true);
    await waitFor(() => expect(f.router.state.location.pathname).toBe(cenarios[0]!.destino));
    expect(f.navegar).toHaveBeenCalledTimes(1);
  });

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])("preserva navegação nativa para %j", async (options) => {
    const f = await montar();
    expect(clicar(screen.getByRole("link", { name: "Orçamento" }), options)).toBe(false);
    expect(f.router.state.location.pathname).toBe("/");
    expect(f.navegar).toHaveBeenCalledTimes(1);
  });

  it("substitui o contexto atual pelos destinos permitidos novos", async () => {
    const f = await montar();
    expect(screen.getByRole("link", { name: "Orçamento" })).toBeInTheDocument();
    f.renderSidebar.contexto = cenarios[1]!.contexto;
    f.renderSidebar.permissoes = cenarios[1]!.permissoes;
    fireEvent.change(screen.getByRole("textbox", { name: "Rascunho persistente" }), {
      target: { value: "outro contexto" },
    });
    expect(screen.queryByRole("link", { name: "Orçamento" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Análise da competência" })).toHaveAttribute(
      "href",
      cenarios[1]!.destino,
    );
  });

  it("mantém ausência e revogação de capacidade sem novos destinos", async () => {
    const f = await montar();
    expect(screen.getByRole("link", { name: "Orçamento" })).toBeInTheDocument();
    f.renderSidebar.permissoes = [];
    await act(async () => f.router.invalidate());
    f.view.rerender(<RouterProvider router={f.router} />);
    // Reavalia o componente persistente por uma entrada local, sem RPC fabricada.
    fireEvent.change(screen.getByRole("textbox", { name: "Rascunho persistente" }), {
      target: { value: "reavaliar" },
    });
    expect(screen.queryByRole("group", { name: "Contexto atual" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Orçamento" })).not.toBeInTheDocument();
  });
});

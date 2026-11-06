import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

const m = vi.hoisted(() => {
  const auth = {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  };
  const state: { r: { data: unknown; error: unknown } } = { r: { data: [], error: null } };
  const rpc = vi.fn((..._a: unknown[]) => Promise.resolve(state.r));
  const from = vi.fn();
  return { auth, state, rpc, from };
});
const auth = m.auth;
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: m.auth, from: m.from, rpc: m.rpc },
}));

import { LoginForm, MENSAGENS } from "@/components/auth/LoginForm";
import { routeTree } from "@/routeTree.gen";

const org = (id: string, perfil = "administrador_master") => ({ id, razao_social: `Org ${id}`, nome_fantasia: null, cnpj: null, situacao: "ativa", perfil });

function preencher(email: string, senha: string) {
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: senha } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  m.state.r = { data: [], error: null };
});

describe("SYS-01 Login", () => {
  it("rota /login existe", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/login").at(-1)?.routeId).toBe("/login");
  });

  it("campos têm label visível", () => {
    render(<LoginForm onNavegar={vi.fn()} />);
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });

  it("valida e-mail e senha sem chamar o backend", () => {
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("invalido", "");
    expect(screen.getByText(MENSAGENS.emailInvalido)).toBeInTheDocument();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("desabilita Entrar durante o envio", async () => {
    auth.signInWithPassword.mockReturnValue(new Promise(() => {}));
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    await waitFor(() => expect(screen.getByRole("button", { name: /Entrando/ })).toBeDisabled());
  });

  it("erro de credencial usa mensagem genérica", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 400, code: "invalid_credentials" } });
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    expect(await screen.findByText(MENSAGENS.credencial)).toBeInTheDocument();
  });

  it("erro de rede mostra mensagem de conexão", async () => {
    auth.signInWithPassword.mockRejectedValue(new Error("fetch"));
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    expect(await screen.findByText(MENSAGENS.rede)).toBeInTheDocument();
  });

  it("sem vínculos mostra acesso não disponível", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    expect(await screen.findByText(MENSAGENS.semAcesso)).toBeInTheDocument();
  });

  it("autenticado sem organização acessa o cadastro pelo seletor", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    const nav = vi.fn();
    render(<LoginForm onNavegar={nav} />);
    preencher("a@b.com", "x");
    fireEvent.click(await screen.findByRole("button", { name: "Criar organização" }));
    expect(nav).toHaveBeenCalledWith("/selecionar-organizacao");
    expect(m.rpc).toHaveBeenCalledWith("listar_organizacoes_disponiveis");
    expect(m.from).not.toHaveBeenCalled();
  });

  it("vários vínculos navega para /selecionar-organizacao", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    m.state.r = { data: [org("1"), org("2")], error: null };
    const nav = vi.fn();
    render(<LoginForm onNavegar={nav} />);
    preencher("a@b.com", "x");
    await waitFor(() => expect(nav).toHaveBeenCalledWith("/selecionar-organizacao"));
  });

  it("Master sem vínculo físico e 2 organizações via RPC vai ao seletor, sem ler vinculos_usuarios", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    m.state.r = { data: [org("A"), org("B")], error: null };
    const nav = vi.fn();
    render(<LoginForm onNavegar={nav} />);
    preencher("master@b.com", "x");
    await waitFor(() => expect(nav).toHaveBeenCalledWith("/selecionar-organizacao"));
    expect(m.rpc).toHaveBeenCalledWith("listar_organizacoes_disponiveis");
    expect(m.rpc.mock.calls[0]).toHaveLength(1);
    expect(m.from).not.toHaveBeenCalled();
    expect(screen.queryByText(MENSAGENS.semAcesso)).toBeNull();
  });

  it("uma organização preserva destino /", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    m.state.r = { data: [org("A", "analista")], error: null };
    const nav = vi.fn();
    render(<LoginForm onNavegar={nav} />);
    preencher("a@b.com", "x");
    await waitFor(() => expect(nav).toHaveBeenCalledWith("/"));
  });

  it.each([[{ status: 401 }], [{ status: 403 }], [{ code: "42501" }]])("%o mostra acesso negado, não sem-acesso", async (error) => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    m.state.r = { data: null, error };
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    expect(await screen.findByText(MENSAGENS.negado)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Criar organização" })).toBeNull();
    expect(screen.queryByText(MENSAGENS.semAcesso)).toBeNull();
  });

  it("erro técnico mostra erro com retry", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    m.state.r = { data: null, error: { status: 500, message: "boom" } };
    render(<LoginForm onNavegar={vi.fn()} />);
    preencher("a@b.com", "x");
    expect(await screen.findByText(MENSAGENS.erroVinculos)).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).toBeNull();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});

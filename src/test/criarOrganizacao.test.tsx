import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrganizationSelector } from "@/components/organizacao/OrganizationSelector";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  nav: vi.fn(),
  from: vi.fn(),
  created: false,
  refreshError: false,
  create: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser, signOut: vi.fn() },
    rpc: m.rpc,
    from: m.from,
  },
}));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => m.nav }));
const ID = "11111111-1111-4111-8111-111111111111";
const U = "usuario-teste";
const org = {
  id: ID,
  razao_social: "Organização Nova",
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil: "administrador",
};
function montar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationSelector />
    </QueryClientProvider>,
  );
}
async function abrir() {
  montar();
  fireEvent.click(
    await screen.findByRole("button", { name: "Nova organização" }),
  );
  return screen.findByRole("form", { name: "Nova organização" });
}
const salvar = () =>
  fireEvent.click(screen.getByRole("button", { name: "Criar organização" }));
const criacoes = () =>
  m.rpc.mock.calls.filter((c) => c[0] === "criar_organizacao");
beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  m.created = false;
  m.refreshError = false;
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.create.mockResolvedValue({ data: ID, error: null, status: 200 });
  m.rpc.mockImplementation(async (nome: string) => {
    if (nome === "listar_organizacoes_disponiveis")
      return m.refreshError
        ? { data: null, error: { code: "XX000" } }
        : { data: m.created ? [org] : [], error: null };
    if (nome === "criar_organizacao") {
      const r = await m.create();
      if (!r.error && r.data === ID) m.created = true;
      return r;
    }
    throw new Error("RPC inesperada");
  });
});
describe("CRUD global — criar organização", () => {
  it("usuário sem organizações abre cadastro e cancelar não grava", async () => {
    await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar cadastro" }));
    expect(screen.queryByRole("form", { name: "Nova organização" })).toBeNull();
    expect(criacoes()).toHaveLength(0);
  });
  it("razão social vazia impede envio e recebe foco", async () => {
    await abrir();
    salvar();
    expect(
      await screen.findByText(
        "Informe a razão social e revise o CNPJ, quando preenchido.",
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText("Razão social")).toHaveFocus();
    expect(criacoes()).toHaveLength(0);
  });
  it("CNPJ incompleto é rejeitado sem RPC", async () => {
    await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova" },
    });
    fireEvent.change(screen.getByLabelText("CNPJ (opcional)"), {
      target: { value: "123" },
    });
    salvar();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(criacoes()).toHaveLength(0);
  });
  it("confirma no Supabase, recarrega lista e só entra após Continuar", async () => {
    await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: " Organização Nova " },
    });
    fireEvent.change(screen.getByLabelText("Nome fantasia (opcional)"), {
      target: { value: " Nova " },
    });
    fireEvent.change(screen.getByLabelText("CNPJ (opcional)"), {
      target: { value: "12.345.678/0001-90" },
    });
    salvar();
    expect(
      await screen.findByText(
        "Organização criada com sucesso. Selecione-a para continuar.",
      ),
    ).toBeTruthy();
    const radio = await screen.findByRole("radio", {
      name: /Organização Nova/,
    });
    await waitFor(() => expect(radio).toHaveAttribute("aria-checked", "true"));
    expect(criacoes()).toEqual([
      [
        "criar_organizacao",
        {
          p_razao_social: "Organização Nova",
          p_nome_fantasia: "Nova",
          p_cnpj: "12345678000190",
          p_timezone: "America/Sao_Paulo",
        },
      ],
    ]);
    expect(m.from).not.toHaveBeenCalled();
    expect(obterPreferenciaOrganizacao(U)).toBeNull();
    expect(m.nav).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(obterPreferenciaOrganizacao(U)).toBe(ID);
    expect(m.nav).toHaveBeenCalledWith({ to: "/" });
  });
  it("campos opcionais vazios usam defaults do backend", async () => {
    await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova" },
    });
    salvar();
    await screen.findByText(
      "Organização criada com sucesso. Selecione-a para continuar.",
    );
    expect(criacoes()[0]?.[1]).toEqual({
      p_razao_social: "Nova",
      p_timezone: "America/Sao_Paulo",
    });
  });
  it("duplo submit executa um comando e bloqueia cancelar durante envio", async () => {
    let resolver!: (v: unknown) => void;
    m.create.mockReturnValue(
      new Promise((r) => {
        resolver = r;
      }),
    );
    const form = await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova" },
    });
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(criacoes()).toHaveLength(1));
    expect(
      screen.getByRole("button", { name: "Cancelar cadastro" }),
    ).toBeDisabled();
    resolver({ data: ID, error: null, status: 200 });
    await screen.findByText(
      "Organização criada com sucesso. Selecione-a para continuar.",
    );
  });
  it("negação backend não cria organização nem expõe erro interno", async () => {
    m.create.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "segredo interno" },
      status: 403,
    });
    await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova" },
    });
    salvar();
    expect(
      await screen.findByText(
        "Você não tem permissão ou sua sessão não está ativa. Entre novamente.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/segredo interno/)).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(criacoes()).toHaveLength(1);
  });
  it.each(["rede", "retorno inválido"])(
    "%s informa resultado incerto, sem retry automático",
    async (modo) => {
      if (modo === "rede")
        m.create.mockRejectedValue(new Error("stack privado"));
      else
        m.create.mockResolvedValue({
          data: "invalid-uuid",
          error: null,
          status: 200,
        });
      await abrir();
      fireEvent.change(screen.getByLabelText("Razão social"), {
        target: { value: "Nova" },
      });
      salvar();
      expect(
        await screen.findByText(
          "Não foi possível confirmar a criação. Confira a lista de organizações antes de tentar novamente.",
        ),
      ).toBeTruthy();
      expect(criacoes()).toHaveLength(1);
      expect(screen.queryByText(/stack privado/)).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Criar organização" }),
      ).toBeDisabled();
    },
  );
  it("falha na recarga preserva sucesso confirmado e não repete criação", async () => {
    m.create.mockImplementation(async () => {
      m.refreshError = true;
      return { data: ID, error: null, status: 200 };
    });
    await abrir();
    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova" },
    });
    salvar();
    expect(
      await screen.findByText(
        "Organização criada com sucesso. Selecione-a para continuar.",
      ),
    ).toBeTruthy();
    expect(
      await screen.findByText(
        "Não foi possível carregar as organizações agora. Tente novamente em instantes.",
      ),
    ).toBeTruthy();
    expect(criacoes()).toHaveLength(1);
    expect(m.nav).not.toHaveBeenCalled();
  });
  it("consulta negada não disponibiliza cadastro", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
    montar();
    await screen.findByText(
      "Acesso negado. Você não tem permissão para consultar organizações.",
    );
    expect(
      screen.queryByRole("button", { name: "Nova organização" }),
    ).toBeNull();
    expect(criacoes()).toHaveLength(0);
  });
});

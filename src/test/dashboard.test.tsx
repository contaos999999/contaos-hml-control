import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({ getUser: vi.fn(), signOut: vi.fn(), rpc: vi.fn(), nav: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: m.getUser, signOut: m.signOut }, rpc: m.rpc, from: vi.fn() },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...p }: { children: ReactNode; to: string }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

import { Dashboard, MENSAGENS_SYS05 } from "@/components/dashboard/Dashboard";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { supabase } from "@/integrations/supabase/client";

const U = "user-1";
const ORG = "org-1";

function resumo(over: Record<string, unknown> = {}) {
  return {
    schema_versao: "sys05-v1",
    gerado_em: "02/11/2026 08:30",
    organizacao: { id: ORG, razao_social: "Alfa Contábil LTDA", nome_fantasia: "Alfa Contábil", situacao: "ativa" },
    resumo: {
      contratos_visiveis: 3,
      contratos_ativos: 7,
      competencias_em_fluxo: 11,
      competencias_exigem_atencao: 13,
      itens_com_prazo_vencido: 17,
      atencoes_abertas: 19,
    },
    contratos_por_situacao: [{ situacao: "ativo", quantidade: 3 }],
    competencias_por_situacao: [{ situacao: "em_preparacao", quantidade: 11 }],
    proximos_prazos: [
      { tipo: "nao_conformidade", id: "p2", contrato_numero: "CT-2", titulo: "Segundo pelo backend", prazo: "2026-11-05", status: "aberta", criticidade: "baixa" },
      { tipo: "competencia", id: "p1", contrato_numero: "CT-1", titulo: "Primeiro? não", prazo: "2026-11-04", status: "em_preparacao", criticidade: "critica" },
    ],
    atencoes_prioritarias: [
      { tipo: "apontamento_interno", id: "a1", contrato_numero: "CT-1", descricao: "Atenção A", severidade: "alta", status: "aberto", prazo: null, criado_em: "2026-11-02T13:45:00Z" },
    ],
    ...over,
  };
}

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Dashboard />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  definirPreferenciaOrganizacao(U, ORG);
});

describe("SYS-05 Dashboard", () => {
  it("sem preferência vai para /selecionar-organizacao e não chama a RPC", async () => {
    sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("preferência de outro usuário é ignorada", async () => {
    sessionStorage.clear();
    definirPreferenciaOrganizacao("outro", ORG);
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("AuthSessionMissingError vai para /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: { name: "AuthSessionMissingError", status: 400 } });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(screen.queryByText(MENSAGENS_SYS05.erro)).toBeNull();
  });

  it("erro técnico de getUser mostra erro + retry, sem navegar nem signOut", async () => {
    m.getUser.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    m.rpc.mockResolvedValue({ data: resumo(), error: null });
    montar();
    expect(await screen.findByText(MENSAGENS_SYS05.erro)).toBeTruthy();
    expect(m.nav).not.toHaveBeenCalled();
    expect(m.signOut).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Atenção A")).toBeTruthy();
    expect(m.getUser).toHaveBeenCalledTimes(2);
  });

  it("RPC chamada uma vez com p_id_organizacao da preferência e exibida literalmente", async () => {
    m.rpc.mockResolvedValue({ data: resumo(), error: null });
    montar();
    const kpis = await screen.findByRole("region", { name: "Indicadores de resumo" });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("obter_resumo_dashboard", { p_id_organizacao: ORG });
    // contratos_ativos (7) > contratos_visiveis (3): exibido como veio, sem recálculo
    for (const n of ["3", "7", "11", "13", "17", "19"]) expect(within(kpis).getByText(n)).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Atualizado em 02/11/2026 08:30")).toBeTruthy();
  });

  it("preserva a ordem do backend e formata datas BR", async () => {
    m.rpc.mockResolvedValue({ data: resumo(), error: null });
    montar();
    const itens = await screen.findAllByTestId("prazo-item");
    expect(itens[0].textContent).toContain("Segundo pelo backend");
    expect(itens[1].textContent).toContain("Primeiro? não");
    expect(itens[0].textContent).toContain("05/11/2026");
    expect(screen.getByTestId("atencao-item").textContent).toContain("02/11/2026 10:45");
  });

  it("empty real mostra organização, zeros e orientação; não é denied", async () => {
    m.rpc.mockResolvedValue({
      data: resumo({
        resumo: { contratos_visiveis: 0, contratos_ativos: 0, competencias_em_fluxo: 0, competencias_exigem_atencao: 0, itens_com_prazo_vencido: 0, atencoes_abertas: 0 },
        contratos_por_situacao: [],
        competencias_por_situacao: [],
        proximos_prazos: [],
        atencoes_prioritarias: [],
      }),
      error: null,
    });
    montar();
    expect(await screen.findByText(MENSAGENS_SYS05.vazio)).toBeTruthy();
    expect(screen.getByText(/Alfa Contábil/)).toBeTruthy();
    expect(screen.queryByText(MENSAGENS_SYS05.negado)).toBeNull();
  });

  it.each([[{ code: "42501", message: "Acesso negado ao resumo desta organização." }], [{ status: 403, message: "forbidden" }]])(
    "denied %o: acesso negado com ações, nunca empty",
    async (error) => {
      m.rpc.mockResolvedValue({ data: null, error });
      montar();
      expect(await screen.findByText(MENSAGENS_SYS05.negado)).toBeTruthy();
      expect(screen.queryByText(MENSAGENS_SYS05.vazio)).toBeNull();
      expect(screen.queryByText(/resumo desta organização|forbidden/)).toBeNull();
      expect(screen.getByRole("link", { name: "Selecionar outra organização" }).getAttribute("href")).toBe("/selecionar-organizacao");
      expect(screen.getByRole("button", { name: "Sair da conta" })).toBeTruthy();
    },
  );

  it("erro 500 genérico e retry chama a RPC de novo", async () => {
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "XX000", message: "boom interno" } });
    montar();
    expect(await screen.findByText(MENSAGENS_SYS05.erro)).toBeTruthy();
    expect(screen.queryByText(/boom/)).toBeNull();
    m.rpc.mockResolvedValue({ data: resumo(), error: null });
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Atenção A")).toBeTruthy();
    expect(m.rpc).toHaveBeenCalledTimes(2);
  });

  it("erro de rede é genérico", async () => {
    m.rpc.mockRejectedValue(new TypeError("Failed to fetch"));
    montar();
    expect(await screen.findByText(MENSAGENS_SYS05.erro)).toBeTruthy();
  });

  it("schema_versao inesperado vira erro genérico", async () => {
    m.rpc.mockResolvedValue({ data: resumo({ schema_versao: "sys05-v2" }), error: null });
    montar();
    expect(await screen.findByText(MENSAGENS_SYS05.erro)).toBeTruthy();
  });

  it("Trocar organização aponta para /selecionar-organizacao; Sair chama signOut uma vez", async () => {
    m.rpc.mockResolvedValue({ data: resumo(), error: null });
    montar();
    await screen.findByText("Atenção A");
    expect(screen.getByRole("link", { name: /Trocar organização/ }).getAttribute("href")).toBe("/selecionar-organizacao");
    const sair = screen.getByRole("button", { name: "Sair" });
    fireEvent.click(sair);
    fireEvent.click(sair);
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.signOut).toHaveBeenCalledTimes(1);
  });
});

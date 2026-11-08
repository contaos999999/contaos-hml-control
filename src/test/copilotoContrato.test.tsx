import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopilotoContrato } from "@/components/copiloto/CopilotoContrato";

const spies = vi.hoisted(() => ({
  invoke: vi.fn(), from: vi.fn(), unsubscribe: vi.fn(),
  authCallback: null as null | ((event: string) => void),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: spies.invoke }, from: spies.from,
    auth: { onAuthStateChange: (callback: (event: string) => void) => {
      spies.authCallback = callback;
      return { data: { subscription: { unsubscribe: spies.unsubscribe } } };
    } },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));
const contrato = "00000000-0000-4000-8000-000000000001";
const outro = "00000000-0000-4000-8000-000000000002";
const resposta = (texto = "Resposta permitida") => ({
  data: { ok: true, id_sessao: "00000000-0000-4000-8000-000000000003", resposta: texto,
    fontes: [{ fonte_tipo: "fragmento_documento", pagina: 3, trecho: "Fonte permitida" }] },
  error: null,
});
function perguntar(texto = "Quais as obrigações?") {
  fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), { target: { value: texto } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
}
beforeEach(() => {
  spies.invoke.mockResolvedValue(resposta());
  spies.from.mockImplementation(() => {
    const query = {
      select: vi.fn(() => query), eq: vi.fn(() => query), order: vi.fn(() => query),
      limit: vi.fn(async () => ({ data: [{ id: contrato, numero: "Contrato autorizado" }], error: null })),
    };
    return query;
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); spies.from.mockReset(); spies.invoke.mockReset(); });

describe("Trilha C: contexto autorizado do copiloto", () => {
  it("somente envia ao endpoint existente após ação explícita, sem tenant no payload", async () => {
    render(<CopilotoContrato contratoId={contrato} />);
    expect(spies.invoke).not.toHaveBeenCalled();
    perguntar();
    expect(await screen.findByText(/Resposta permitida/)).toBeInTheDocument();
    expect(spies.invoke).toHaveBeenCalledWith("copilot-query", { body: { id_contrato: contrato, pergunta: "Quais as obrigações?" } });
    expect(screen.getByText(/Fontes da última resposta/)).toBeInTheDocument();
  });
  it("exige seleção explícita de contrato nas páginas sem contrato na rota", async () => {
    render(<CopilotoContrato organizacaoId="org-a" />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    const seletor = await screen.findByRole("combobox", { name: "Contrato da consulta" });
    expect(seletor).toHaveValue("");
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
    fireEvent.change(seletor, { target: { value: contrato } });
    fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), { target: { value: "Pergunta" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByText(/Resposta permitida/)).toBeInTheDocument();
    expect(spies.invoke).toHaveBeenCalledWith("copilot-query", { body: { id_contrato: contrato, pergunta: "Pergunta" } });
    const query = spies.from.mock.results[0]?.value;
    expect(query.eq).toHaveBeenCalledWith("id_organizacao", "org-a");
  });
  it("lista vazia ou negada mantém envio bloqueado", async () => {
    spies.from.mockImplementation(() => {
      const q = { select: () => q, eq: () => q, order: () => q, limit: async () => ({ data: null, error: { code: "42501" } }) };
      return q;
    });
    render(<CopilotoContrato organizacaoId="org-a" />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/contratos/i);
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
    expect(spies.invoke).not.toHaveBeenCalled();
  });
  it.each(["organizacao", "contrato", "logout", "usuario"])("descarta resposta resolvida após mudança de %s", async (mudanca) => {
    let resolver!: (value: unknown) => void;
    spies.invoke.mockReturnValue(new Promise((r) => { resolver = r; }));
    const view = render(<CopilotoContrato contratoId={contrato} />);
    perguntar("Pergunta antiga");
    await waitFor(() => expect(spies.invoke).toHaveBeenCalledTimes(1));
    if (mudanca === "contrato") view.rerender(<CopilotoContrato contratoId={outro} />);
    else if (mudanca === "organizacao") fireEvent(window, new Event("contaos:organizacao-alterada"));
    else act(() => spies.authCallback?.(mudanca === "logout" ? "SIGNED_OUT" : "SIGNED_IN"));
    await act(async () => { resolver(resposta("Resposta antiga")); });
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    expect(screen.queryByText(/Resposta antiga/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pergunta antiga/)).not.toBeInTheDocument();
  });
  it("mensagem HTML permanece texto e erro da Edge não expõe conteúdo interno", async () => {
    spies.invoke.mockResolvedValueOnce(resposta("<img src=x onerror=alert(1)>"));
    const view = render(<CopilotoContrato contratoId={contrato} />);
    perguntar();
    expect(await screen.findByText(/<img src=x/)).toBeInTheDocument();
    expect(view.container.querySelector("img")).toBeNull();
    spies.invoke.mockResolvedValueOnce({ data: null, error: { message: "segredo-interno" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), { target: { value: "Outra pergunta" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByRole("alert")).not.toHaveTextContent("segredo-interno");
  });
});

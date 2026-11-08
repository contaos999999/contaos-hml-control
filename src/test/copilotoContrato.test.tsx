import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopilotoContrato } from "@/components/copiloto/CopilotoContrato";

const invoke = vi.fn();
const unsubscribe = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe } } }) },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));

afterEach(() => {
  cleanup();
  invoke.mockReset();
});

describe("Trilha C — copiloto contextual", () => {
  it("não chama a Edge Function até o envio e preserva contexto do contrato", async () => {
    invoke.mockResolvedValue({
      data: {
        ok: true,
        id_sessao: "sessao-1",
        resposta: "Trecho localizado, sujeito a revisão humana.",
        fontes: [{ fonte_tipo: "fragmento_documento", pagina: 3, trecho: "Fonte permitida" }],
      },
      error: null,
    });
    render(<CopilotoContrato contratoId="00000000-0000-4000-8000-000000000001" />);
    expect(invoke).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), {
      target: { value: "Quais as obrigações?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("copilot-query", {
      body: {
        id_contrato: "00000000-0000-4000-8000-000000000001",
        pergunta: "Quais as obrigações?",
      },
    }));
    expect(await screen.findByText(/Trecho localizado/)).toBeInTheDocument();
    expect(screen.getByText(/Fontes da última resposta/)).toBeInTheDocument();
  });

  it("descarta respostas atrasadas após troca de organização", async () => {
    let responder!: (value: unknown) => void;
    invoke.mockReturnValue(new Promise((resolve) => { responder = resolve; }));
    render(<CopilotoContrato contratoId="00000000-0000-4000-8000-000000000001" />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), {
      target: { value: "Pergunta confidencial" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    fireEvent(window, new Event("contaos:organizacao-alterada"));
    responder({ data: { ok: true, id_sessao: "antiga", resposta: "Resposta antiga" }, error: null });
    expect(screen.queryByText(/Resposta antiga/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consultar copiloto" })).toBeInTheDocument();
  });
});

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopilotoContrato } from "@/components/copiloto/CopilotoContrato";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mocks.invoke },
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: mocks.unsubscribe } } }),
    },
  },
}));
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
const message = (id = "recent", text = "Resposta canônica") => ({
  id,
  papel: "assistente",
  conteudo: text,
  conteudo_disponivel: true,
  fontes: [{ fonte_tipo: "documento", pagina: 1, trecho: "FONTE ANTIGA" }],
  incerteza: true,
  conflito_historico: false,
  baixa_confianca: null,
});
const history = (messages = [message()], cursor: string | null = null) => ({
  data: {
    ok: true,
    sessao: { id: "s1", status: "ativa" },
    mensagens: messages,
    proximo_cursor: cursor,
  },
  error: null,
});
let handler: (body: Record<string, unknown>) => unknown;
beforeEach(() => {
  mocks.invoke.mockReset();
  handler = (b) =>
    b["action"] === "listar_sessoes"
      ? {
          data: {
            ok: true,
            sessoes: [{ id: "s1", titulo: "Sessão", status: "ativa", data_referencia: null }],
            proximo_cursor: null,
          },
          error: null,
        }
      : history();
  mocks.invoke.mockImplementation((_name, options) => Promise.resolve(handler(options.body)));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
async function open() {
  render(<CopilotoContrato contratoId="contrato" organizacaoId="org" />);
  fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
  await screen.findByRole("button", { name: "Sessão (ativa)" });
}
async function resume() {
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Sessão (ativa)" }));
  await screen.findByText("Resposta canônica");
}
describe("C13 correções da revisão independente", () => {
  it("oculta cache no foco durante envio e revalida depois sem repetir pergunta", async () => {
    const pending = deferred<unknown>();
    const previous = handler;
    handler = (b) => (b["pergunta"] ? pending.promise : previous(b));
    await resume();
    fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: "Continuar" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    fireEvent(window, new Event("focus"));
    expect(screen.queryByText(/FONTE ANTIGA/)).not.toBeInTheDocument();
    await act(async () =>
      pending.resolve({
        data: { ok: true, id_sessao: "s1", resposta: "Nova resposta", fontes: [] },
        error: null,
      }),
    );
    await waitFor(() =>
      expect(mocks.invoke.mock.calls.filter((c) => c[1].body.action === "historico")).toHaveLength(
        2,
      ),
    );
    expect(mocks.invoke.mock.calls.filter((c) => c[1].body.pergunta)).toHaveLength(1);
    expect(screen.getByText("Resposta canônica")).toBeInTheDocument();
  });
  it("nova conversa libera leitura pendente e ignora resolução tardia", async () => {
    const pending = deferred<unknown>();
    const previous = handler;
    handler = (b) => (b["action"] === "historico" ? pending.promise : previous(b));
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Sessão (ativa)" }));
    fireEvent.click(screen.getByRole("button", { name: "Nova conversa" }));
    await act(async () => pending.resolve(history()));
    fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: "Nova pergunta" } });
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeEnabled();
    expect(screen.queryByText("Resposta canônica")).not.toBeInTheDocument();
  });
  it("mostra flags por mensagem sem tratar null como certeza", async () => {
    await resume();
    expect(screen.getByText("Incerteza: sim")).toBeInTheDocument();
    expect(screen.getByText("Conflito histórico: não")).toBeInTheDocument();
    expect(screen.getByText("Baixa confiança: desconhecida")).toBeInTheDocument();
  });
  it("preserva âncora de leitura ao antepor página deduplicada", async () => {
    const previous = handler;
    handler = (b) =>
      b["action"] === "historico"
        ? b["cursor"]
          ? history([message("old", "Mais antiga"), message()], null)
          : history([message()], "cursor-real")
        : previous(b);
    await resume();
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", {
      configurable: true,
      get: () => (log.textContent?.includes("Mais antiga") ? 160 : 100),
    });
    log.scrollTop = 40;
    fireEvent.click(screen.getByRole("button", { name: "Carregar mensagens anteriores" }));
    await screen.findByText("Mais antiga");
    expect(screen.getAllByText("Resposta canônica")).toHaveLength(1);
    expect(log.scrollTop).toBe(100);
  });
  it("encerramento pendente expira e exige reconciliação sem confirmar sucesso", async () => {
    const previous = handler;
    handler = (b) => (b["action"] === "encerrar_sessao" ? new Promise(() => {}) : previous(b));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await resume();
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Encerrar conversa" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50001);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Encerramento não confirmado");
    expect(screen.queryByText("Conversa encerrada, somente leitura.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
    expect(
      mocks.invoke.mock.calls.filter((c) => c[1].body.action === "encerrar_sessao"),
    ).toHaveLength(1);
  });
  it("rejeita fonte inválida também na resposta de perguntar", async () => {
    const previous = handler;
    handler = (b) =>
      b["pergunta"]
        ? { data: { ok: true, id_sessao: "s1", resposta: "Inválida", fontes: [null] }, error: null }
        : previous(b);
    await open();
    fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: "Pergunta" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Resultado incerto");
  });
  it.each(["listar_sessoes", "historico"])(
    "limita %s a 50s e ignora resposta tardia",
    async (action) => {
      const pending = deferred<unknown>();
      const previous = handler;
      handler = (b) => (b["action"] === action ? pending.promise : previous(b));
      if (action === "historico") {
        await open();
        vi.useFakeTimers();
        fireEvent.click(screen.getByRole("button", { name: "Sessão (ativa)" }));
      } else {
        vi.useFakeTimers();
        render(<CopilotoContrato contratoId="contrato" organizacaoId="org" />);
        fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
      }
      const call = mocks.invoke.mock.calls.find((c) => c[1].body.action === action)!;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50001);
      });
      expect(call[1].signal.aborted).toBe(true);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      await act(async () => pending.resolve(history()));
      expect(screen.queryByText("Resposta canônica")).not.toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it("cancela histórico ao trocar contrato e não restaura fontes da geração anterior", async () => {
    const pending = deferred<unknown>();
    const previous = handler;
    handler = (b) => (b["action"] === "historico" ? pending.promise : previous(b));
    const mounted = render(<CopilotoContrato contratoId="contrato" organizacaoId="org" />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar copiloto" }));
    fireEvent.click(await screen.findByRole("button", { name: "Sessão (ativa)" }));
    const call = mocks.invoke.mock.calls.find((c) => c[1].body.action === "historico")!;
    mounted.rerender(<CopilotoContrato contratoId="outro" organizacaoId="org" />);
    expect(call[1].signal.aborted).toBe(true);
    await act(async () => pending.resolve(history()));
    expect(screen.queryByText(/FONTE ANTIGA/)).not.toBeInTheDocument();
    expect(screen.queryByText("Resposta canônica")).not.toBeInTheDocument();
  });
  it("revalidação negada depois do envio mantém fontes ocultas e bloqueia continuação", async () => {
    const pending = deferred<unknown>();
    const previous = handler;
    let reads = 0;
    handler = (b) =>
      b["pergunta"]
        ? pending.promise
        : b["action"] === "historico" && ++reads > 1
          ? { data: null, error: new Error("acesso revogado") }
          : previous(b);
    await resume();
    fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: "Continuar" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    fireEvent(window, new Event("focus"));
    await act(async () =>
      pending.resolve({
        data: { ok: true, id_sessao: "s1", resposta: "Nova", fontes: [] },
        error: null,
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Histórico indisponível");
    expect(screen.queryByText(/FONTE ANTIGA/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
  });

  it("preserva âncora DOM conectada sem confundir altura com deslocamento", async () => {
    const previous = handler;
    handler = (b) =>
      b["action"] === "historico"
        ? b["cursor"]
          ? history([message("old", "Mais antiga"), message()], null)
          : history([message()], "cursor-real")
        : previous(b);
    await resume();
    const log = screen.getByRole("log");
    const anchor = log.firstElementChild as HTMLElement;
    Object.defineProperty(log, "scrollHeight", {
      configurable: true,
      get: () => (log.textContent?.includes("Mais antiga") ? 200 : 100),
    });
    vi.spyOn(anchor, "getBoundingClientRect").mockImplementation(
      () => ({ top: log.textContent?.includes("Mais antiga") ? 50 : 20, bottom: 80 }) as DOMRect,
    );
    log.scrollTop = 40;
    fireEvent.click(screen.getByRole("button", { name: "Carregar mensagens anteriores" }));
    await screen.findByText("Mais antiga");
    expect(anchor.isConnected).toBe(true);
    expect(log.scrollTop).toBe(70);
    expect(screen.getAllByText("Resposta canônica")).toHaveLength(1);
  });
  it("foco durante envio sem ID lista sessões sem selecionar nem repetir pergunta", async () => {
    const pending = deferred<unknown>();
    const previous = handler;
    handler = (b) => (b["pergunta"] ? pending.promise : previous(b));
    await open();
    fireEvent.change(screen.getByLabelText("Sua pergunta"), {
      target: { value: "Primeira pergunta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    fireEvent(window, new Event("focus"));
    await act(async () => pending.resolve({ data: null, error: new Error("rede") }));
    await waitFor(() =>
      expect(
        mocks.invoke.mock.calls.filter((c) => c[1].body.action === "listar_sessoes"),
      ).toHaveLength(2),
    );
    expect(mocks.invoke.mock.calls.filter((c) => c[1].body.action === "historico")).toHaveLength(0);
    expect(mocks.invoke.mock.calls.filter((c) => c[1].body.pergunta)).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: "Não reenviar" } });
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
  });
});

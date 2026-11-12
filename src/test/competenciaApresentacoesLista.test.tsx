import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
const m = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/lib/competencias/protocoloDados", () => ({
  listarApresentacoes: m.list,
  PAGINA_APRESENTACOES: 25,
  ErroProtocolo: class extends Error {
    constructor(public tipo: string) {
      super(tipo);
    }
  },
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: {
    to: string;
    params: Record<string, string>;
    children: ReactNode;
  }) => (
    <a href={Object.entries(params).reduce((s, [k, v]) => s.replace("$" + k, v), to)} {...props}>
      {children}
    </a>
  ),
}));
import { CompetenciaApresentacoesLista } from "@/components/competencias/CompetenciaApresentacoesLista";
const C = "44444444-4444-4444-8444-444444444444",
  C2 = "66666666-6666-4666-8666-666666666666",
  O = "11111111-1111-4111-8111-111111111111",
  K = "22222222-2222-4222-8222-222222222222",
  A = "33333333-3333-4333-8333-333333333333";
const item = {
  id: A,
  id_competencia: C,
  id_contrato: K,
  id_organizacao: O,
  id_pacote: "55555555-5555-4555-8555-555555555555",
  protocolo: null,
  forma_apresentacao: null,
  apresentado_em: "2026-11-11T12:00:00Z",
  tipo: "original",
  numero_rodada: 1,
};
const props = { competencia: C, organizacao: O, contrato: K };
beforeEach(() => {
  m.list.mockReset();
  m.list.mockResolvedValue({ itens: [item], total: 1 });
});
describe("reentrada persistente na apresentação", () => {
  it("recria link real ao montar sem nova intenção de negócio", async () => {
    const v = render(<CompetenciaApresentacoesLista {...props} />);
    const link = await screen.findByRole("link", { name: "Abrir apresentação 1" });
    expect(link).toHaveAttribute("href", `/competencias/${C}/apresentacoes/${A}`);
    expect(m.list).toHaveBeenCalledWith(C, O, K, 0, expect.any(AbortSignal));
    v.unmount();
    render(<CompetenciaApresentacoesLista {...props} />);
    expect(await screen.findByRole("link", { name: "Abrir apresentação 1" })).toBeInTheDocument();
  });
  it("exibe vazio sem fabricar link", async () => {
    m.list.mockResolvedValue({ itens: [], total: 0 });
    render(<CompetenciaApresentacoesLista {...props} />);
    expect(await screen.findByText("Nenhuma apresentação registrada.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("trata erro de autorização sem link residual e permite nova consulta", async () => {
    m.list.mockRejectedValueOnce({ tipo: "sem_permissao" });
    render(<CompetenciaApresentacoesLista {...props} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não possui permissão para consultar as apresentações.",
    );
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("link", { name: "Abrir apresentação 1" })).toBeInTheDocument();
  });
  it("pagina sem perder a consulta ao registro existente", async () => {
    m.list
      .mockResolvedValueOnce({ itens: [item], total: 26 })
      .mockResolvedValueOnce({ itens: [{ ...item, numero_rodada: 2 }], total: 26 });
    render(<CompetenciaApresentacoesLista {...props} />);
    await screen.findByRole("link", { name: "Abrir apresentação 1" });
    expect(screen.getByRole("button", { name: "Apresentações anteriores" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Próximas apresentações" }));
    await screen.findByRole("link", { name: "Abrir apresentação 2" });
    expect(m.list).toHaveBeenLastCalledWith(C, O, K, 25, expect.any(AbortSignal));
    expect(screen.getByRole("button", { name: "Próximas apresentações" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Apresentações anteriores" }));
    await waitFor(() =>
      expect(m.list).toHaveBeenLastCalledWith(C, O, K, 0, expect.any(AbortSignal)),
    );
  });
  it("ignora resposta tardia e cancela leitura ao trocar contexto", async () => {
    let resolveOld!: (value: unknown) => void;
    m.list
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolveOld = r;
          }),
      )
      .mockResolvedValueOnce({ itens: [], total: 0 });
    const v = render(<CompetenciaApresentacoesLista {...props} />);
    await waitFor(() => expect(m.list).toHaveBeenCalledTimes(1));
    const signal = m.list.mock.calls[0]![4] as AbortSignal;
    v.rerender(<CompetenciaApresentacoesLista {...props} competencia={C2} />);
    await screen.findByText("Nenhuma apresentação registrada.");
    expect(signal.aborted).toBe(true);
    await act(async () => resolveOld({ itens: [item], total: 1 }));
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("não mantém links durante troca de organização", async () => {
    const v = render(<CompetenciaApresentacoesLista {...props} />);
    await screen.findByRole("link", { name: "Abrir apresentação 1" });
    m.list.mockReturnValue(new Promise(() => {}));
    v.rerender(<CompetenciaApresentacoesLista {...props} organizacao={C2} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Consultando apresentações");
  });
});

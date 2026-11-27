import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
const f = vi.hoisted(() => ({
  abrir: vi.fn(),
  liberar: vi.fn(),
  registrar: vi.fn(),
  arquivos: vi.fn(),
  navegar: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => f.navegar,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "fixture" } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  EVENTO_ORGANIZACAO_ALTERADA: "troca-org",
  obterPreferenciaOrganizacao: () => "49000000-0000-4000-8000-000000000002",
}));
vi.mock("@/lib/diligencias/reapresentacaoDiligenciaDados", () => ({
  abrirReapresentacao: f.abrir,
  liberarRodada: f.liberar,
  registrarRodada: f.registrar,
  listarComprovantes: f.arquivos,
  PAGINA_COMPROVANTES: 20,
}));
import { ReapresentacaoDiligencia } from "@/components/diligencias/ReapresentacaoDiligencia";
import { ErroApresentacao } from "@/lib/competencias/apresentacaoDados";

const uid = (n: number) => "49000000-0000-4000-8000-" + String(n).padStart(12, "0");
const base = {
  ciclo: { id: uid(1), id_competencia: uid(4), status: "em_tratamento", numero_rodada: 2 },
  geral: {
    competencia: { situacao: "em_diligencia" },
    blocking_summary: { analise_concluida_atual: true },
  },
  portao: { liberado: true, total: 1, tratados: 1, abertos: 0 },
  anterior: uid(7),
  finalizado: false,
};
const liberado = {
  ...base,
  ciclo: { ...base.ciclo, status: "pronto_reapresentar" },
  geral: { ...base.geral, competencia: { situacao: "pode_reapresentar_contratante" } },
};
const final = {
  ...liberado,
  ciclo: { ...base.ciclo, status: "reapresentado" },
  finalizado: true,
  recibo: {
    apresentacao: { id: uid(8), protocolo: "P-49", numero_rodada: 3 },
    idPacoteReapresentacao: uid(9),
    pacote: { hash_pacote: "a".repeat(64) },
  },
};

async function prepararRegistro() {
  fireEvent.change(await screen.findByLabelText("Protocolo", { exact: true }), {
    target: { value: "P-49" },
  });
  fireEvent.change(screen.getByLabelText("Forma da reapresentação"), {
    target: { value: "Portal" },
  });
}
function confirmarRegistro() {
  fireEvent.click(screen.getByRole("button", { name: "Revisar registro" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar reapresentação" }));
}

describe("V2-06", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    f.abrir.mockResolvedValue(base);
    f.liberar.mockResolvedValue({ id_aprovacao: uid(6) });
    f.registrar.mockResolvedValue(uid(8));
    f.arquivos.mockResolvedValue({ dados: [], total: 0 });
  });

  it("libera registra e relê o recibo distinguindo a rodada anterior", async () => {
    f.abrir
      .mockResolvedValueOnce(base)
      .mockResolvedValueOnce(liberado)
      .mockResolvedValueOnce(final);
    render(<ReapresentacaoDiligencia cicloId={uid(1)} />);
    fireEvent.change(await screen.findByLabelText("Fundamento da liberação"), {
      target: { value: "Parecer conferido" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar liberação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar liberação" }));
    await prepararRegistro();
    confirmarRegistro();
    expect(await screen.findByText("Protocolo P-49 · rodada 3")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Abrir protocolo da reapresentação" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver protocolo da rodada anterior" }),
    ).toBeInTheDocument();
    expect(f.registrar).toHaveBeenCalledOnce();
  });

  it("bloqueia portão incompleto e distingue negação após releitura", async () => {
    f.abrir
      .mockResolvedValueOnce({
        ...base,
        portao: { liberado: false, total: 1, tratados: 0, abertos: 1 },
      })
      .mockRejectedValueOnce(new ErroApresentacao("sem_permissao"));
    render(<ReapresentacaoDiligencia cicloId={uid(1)} />);
    expect(await screen.findByText(/exige que todos os apontamentos/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Revisar liberação" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Atualizar situação" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("não tem permissão");
    expect(f.liberar).not.toHaveBeenCalled();
  });

  it("repete a chave da intenção original após perda de resposta", async () => {
    f.abrir.mockResolvedValue(liberado);
    f.registrar.mockRejectedValueOnce(new ErroApresentacao("erro")).mockResolvedValueOnce(uid(8));
    render(<ReapresentacaoDiligencia cicloId={uid(1)} />);
    await prepararRegistro();
    confirmarRegistro();
    expect(await screen.findByRole("alert")).toHaveTextContent("Atualize a consulta");
    expect(screen.getByLabelText("Protocolo", { exact: true })).toBeDisabled();
    f.abrir.mockResolvedValue(final);
    confirmarRegistro();
    await waitFor(() => expect(f.registrar).toHaveBeenCalledTimes(2));
    expect(f.registrar.mock.calls[0]?.[1]).toBe(f.registrar.mock.calls[1]?.[1]);
    expect(await screen.findByText("Protocolo P-49 · rodada 3")).toBeInTheDocument();
  });
});

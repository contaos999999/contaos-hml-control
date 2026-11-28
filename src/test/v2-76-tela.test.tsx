import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const f = vi.hoisted(() => ({
  getUser: vi.fn(),
  org: vi.fn(),
  visao: vi.fn(),
  listar: vi.fn(),
  apresentacoes: vi.fn(),
  conferir: vi.fn(),
  arquivo: vi.fn(),
  processamento: vi.fn(),
  ciclo: vi.fn(),
  registrar: vi.fn(),
  preparar: vi.fn(),
  config: vi.fn(),
  upload: vi.fn(),
  navegar: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => f.navegar,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    auth: {
      getUser: f.getUser,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  EVENTO_ORGANIZACAO_ALTERADA: "troca-org",
  obterPreferenciaOrganizacao: f.org,
}));
vi.mock("@/lib/competencias/competenciaVisaoGeralDados", () => ({
  obterVisaoGeral: f.visao,
  parseVisaoGeral: (valor: unknown) => valor,
}));
vi.mock("@/lib/contratos/documentosDados", () => ({
  obterConfiguracaoUpload: f.config,
  enviarArquivoCertificado: f.upload,
  motivoInvalido: () => null,
  aceiteDe: () => ".pdf",
}));
vi.mock("@/lib/diligencias/cicloDiligenciaDados", () => ({ consultarEscopoCicloDiligencia: f.ciclo }));
vi.mock("@/lib/diligencias/pareceresContratanteDados", () => ({
  listarPareceres: f.listar,
  listarApresentacoesParecer: f.apresentacoes,
  conferirApresentacaoParecer: f.conferir,
  conferirArquivoParecer: f.arquivo,
  consultarProcessamentoParecer: f.processamento,
  registrarParecer: f.registrar,
  prepararPedidoParecer: f.preparar,
  ErroParecer: class extends Error {
    constructor(public tipo: string) { super(tipo); }
  },
}));
import { PareceresContratante } from "@/components/diligencias/PareceresContratante";
import { ErroParecer } from "@/lib/diligencias/pareceresContratanteDados";

const uid = (n: number) => "76000000-0000-4000-8000-" + String(n).padStart(12, "0");
const contexto = { id_organizacao: uid(1), id_contrato: uid(2), id_competencia: uid(3) };
const ap = {
  ...contexto,
  id: uid(4),
  protocolo: "P-76",
  numero_rodada: 1,
  apresentado_em: "2026-11-27T12:00:00Z",
};
const parecer = {
  ...contexto, id: uid(6), id_apresentacao: ap.id, id_arquivo: uid(5), id_ciclo: uid(7),
  registrado_por: uid(8), numero_documento: "PARECER-76", resultado_geral: "Diligência",
  parecer_final_favoravel: false, recebido_em: ap.apresentado_em, data_emissao: "2026-11-27",
};

async function preparar() {
  const campo = await screen.findByLabelText("Classificação");
  fireEvent.change(campo, { target: { value: "Diligência" } });
  fireEvent.change(screen.getByLabelText("Arquivo privado"), {
    target: { files: [new File(["sintético"], "parecer.pdf", { type: "application/pdf" })] },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar ou retomar arquivo" }));
  await screen.findByText("Arquivo aprovado para registro.");
}

describe("V2-07 tela", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    f.getUser.mockResolvedValue({ data: { user: { id: uid(8) } }, error: null });
    f.org.mockReturnValue(uid(1));
    f.visao.mockResolvedValue({ data: { competencia: { id: uid(3), ...contexto } }, error: null, status: 200 });
    f.listar.mockResolvedValue({ itens: [parecer], total: 1 });
    f.apresentacoes.mockResolvedValue({ itens: [ap], total: 1 });
    f.conferir.mockResolvedValue(ap);
    f.arquivo.mockResolvedValue({ id: uid(5) });
    f.processamento.mockResolvedValue({ status: "enfileirado" });
    f.ciclo.mockResolvedValue({ ...contexto, id: uid(7), prazo_resposta: "2026-12-05" });
    f.config.mockResolvedValue({});
    f.upload.mockResolvedValue(uid(5));
    f.preparar.mockImplementation((pedido: unknown) => pedido);
    f.registrar.mockResolvedValue(uid(6));
  });

  it("preserva apresentação exata e exibe processamento e prazo oficiais", async () => {
    render(<PareceresContratante id={uid(3)} apresentacaoId={uid(4)} />);
    expect(await screen.findByRole("heading", { name: "PARECER-76" })).toBeInTheDocument();
    expect(await screen.findByText("Enfileirado")).toBeInTheDocument();
    expect(screen.getByLabelText("Apresentação")).toHaveValue(uid(4));
    expect(screen.getByLabelText("Apresentação")).toBeDisabled();
    expect(screen.getByText("Prazo: 05/12/2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Registrar parecer$/ })).toBeDisabled();
  });

  it("usa upload privado e repete a intenção original após resposta incerta", async () => {
    f.registrar.mockRejectedValueOnce(new ErroParecer("erro")).mockResolvedValueOnce(uid(6));
    render(<PareceresContratante id={uid(3)} apresentacaoId={uid(4)} />);
    await preparar();
    expect(f.upload).toHaveBeenCalledWith(uid(1), uid(2), expect.any(File), expect.any(Object));
    fireEvent.click(screen.getByRole("button", { name: /^Registrar parecer$/ }));
    await screen.findByText(/Não foi possível confirmar o resultado/);
    expect(screen.getByLabelText("Classificação")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Atualizar consulta" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Repetir registro" }));
    await screen.findByText(/Registro confirmado pelo servidor/);
    expect(f.registrar).toHaveBeenCalledTimes(2);
    expect(f.registrar.mock.calls[0]?.[1]).toEqual(f.registrar.mock.calls[1]?.[1]);
    expect(f.upload).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Atualizar consulta" })).toBeEnabled();
  });

  it("nega a consulta sem exibir registros nem formulário", async () => {
    f.listar.mockRejectedValueOnce(new ErroParecer("sem_permissao"));
    render(<PareceresContratante id={uid(3)} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem permissão");
    expect(screen.queryByRole("heading", { name: "PARECER-76" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Classificação")).not.toBeInTheDocument();
    expect(f.registrar).not.toHaveBeenCalled();
  });

  it("descarta a consulta anterior na mudança de organização", async () => {
    render(<PareceresContratante id={uid(3)} />);
    await screen.findByRole("heading", { name: "PARECER-76" });
    f.org.mockReturnValue(uid(99));
    fireEvent(window, new Event("troca-org"));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "PARECER-76" })).not.toBeInTheDocument());
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem permissão");
    expect(f.registrar).not.toHaveBeenCalled();
  });
});

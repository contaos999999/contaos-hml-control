import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  consulta: vi.fn(),
  getUser: vi.fn(),
  auth: vi.fn(),
  navegar: vi.fn(),
  unsubscribe: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser, onAuthStateChange: m.auth },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));
vi.mock("@/lib/diligencias/cicloDiligenciaDados", async (original) => ({
  ...(await original<typeof import("@/lib/diligencias/cicloDiligenciaDados")>()),
  consultarCicloDiligencia: m.consulta,
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.navegar,
  Link: ({
    to,
    params,
    children,
  }: {
    to: string;
    params?: Record<string, string>;
    children: ReactNode;
  }) => (
    <a href={Object.entries(params ?? {}).reduce((url, [k, v]) => url.replace("$" + k, v), to)}>
      {children}
    </a>
  ),
}));

import { CicloDiligencia } from "@/components/diligencias/CicloDiligencia";
import type { DetalheCicloDiligencia } from "@/lib/diligencias/cicloDiligenciaDados";
import { ErroDiligencias } from "@/lib/diligencias/diligenciasDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const ORG = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const APRESENTACAO = "33333333-3333-4333-8333-333333333333";
const COMPETENCIA = "44444444-4444-4444-8444-444444444444";
const OUTRA_ORG = "55555555-5555-4555-8555-555555555555";
const CICLO = "77777777-7777-4777-8777-777777777777";
const USUARIO = "usuario-sintetico-45";

const dados: DetalheCicloDiligencia = {
  ciclo: {
    id: CICLO,
    id_competencia: COMPETENCIA,
    id_contrato: CONTRATO,
    id_organizacao: ORG,
    numero_rodada: 2,
    status: "em_tratamento",
    recebido_em: "2026-11-08T15:00:00Z",
    prazo_resposta: "2026-11-21",
    encerrado_em: null,
    versao_registro: 1,
  },
  pareceres: {
    total: 1,
    itens: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        numeroDocumento: "PARECER V2",
        recebidoEm: "2026-11-08T15:00:00Z",
        dataEmissao: "2026-11-07",
        resultado: "Diligência",
        apresentacaoId: APRESENTACAO,
      },
    ],
  },
  apontamentos: {
    total: 1,
    itens: [
      {
        id: "99999999-9999-4999-8999-999999999999",
        codigo: "AP-45",
        descricao: "Item desta rodada",
        classificacao: "Financeiro",
        situacao: "em_analise",
        severidade: "alta",
        valorQuestionado: "3000.12",
        glosaPotencial: "0.00",
        valorAceito: null,
        impactoEstimado: "-0.01",
      },
    ],
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  m.auth.mockReturnValue({ data: { subscription: { unsubscribe: m.unsubscribe } } });
  m.getUser.mockResolvedValue({ data: { user: { id: USUARIO } }, error: null });
  m.consulta.mockResolvedValue(dados);
  definirPreferenciaOrganizacao(USUARIO, ORG);
});

afterEach(cleanup);

it("V2-02 retorna a lista e chega ao protocolo da propria competencia", async () => {
  render(<CicloDiligencia id={CICLO} />);
  const { getByText } = within(await screen.findByRole("region", { name: "Rodada 2" }));
  expect(getByText("21/11/2026")).toBeVisible();
  expect(screen.getByRole("link", { name: "Voltar às diligências" })).toHaveAttribute(
    "href",
    "/competencias/" + COMPETENCIA + "/diligencias",
  );
  expect(screen.getByRole("link", { name: "Ver protocolo de origem" })).toHaveAttribute(
    "href",
    "/competencias/" + COMPETENCIA + "/apresentacoes/" + APRESENTACAO,
  );
  const apontamentos = within(screen.getByRole("region", { name: "Apontamentos da rodada" }));
  expect(apontamentos.getByText("Item desta rodada")).toBeVisible();
  expect(apontamentos.getByText("R$ 3.000,12")).toBeVisible();
  expect(apontamentos.getByText("R$ 0,00")).toBeVisible();
  expect(apontamentos.getByText("-R$ 0,01")).toBeVisible();
  expect(apontamentos.getByText("Não informado")).toBeVisible();
  expect(m.consulta).toHaveBeenCalledExactlyOnceWith(
    CICLO,
    ORG,
    { pareceres: 0, apontamentos: 0 },
    expect.any(AbortSignal),
  );
});

it("V2-02 separa carregamento, vazio autorizado e recusa", async () => {
  m.consulta.mockResolvedValueOnce({
    ...dados,
    pareceres: { itens: [], total: 0 },
    apontamentos: { itens: [], total: 0 },
  });
  render(<CicloDiligencia id={CICLO} />);
  expect(screen.getByRole("status")).toHaveTextContent("Consultando ciclo");
  expect(await screen.findByText("Nenhum apontamento registrado nesta rodada.")).toBeVisible();
  expect(screen.getByText("Nenhum parecer vinculado a esta rodada.")).toBeVisible();
  m.consulta.mockRejectedValueOnce(new ErroDiligencias("sem_permissao"));
  fireEvent.click(screen.getByRole("button", { name: "Atualizar consulta" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Você não possui permissão");
  expect(screen.queryByRole("region", { name: "Rodada 2" })).not.toBeInTheDocument();
  expect(screen.queryByText("Item desta rodada")).not.toBeInTheDocument();
});

it("V2-02 cancela o ciclo anterior na troca de organizacao", async () => {
  let entregar: ((d: DetalheCicloDiligencia) => void) | undefined;
  m.consulta.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        entregar = resolve;
      }),
  );
  render(<CicloDiligencia id={CICLO} />);
  await waitFor(() => expect(m.consulta).toHaveBeenCalledTimes(1));
  const anterior = m.consulta.mock.calls[0]?.[3] as AbortSignal;
  m.consulta.mockRejectedValueOnce(new ErroDiligencias("nao_encontrado"));
  act(() => definirPreferenciaOrganizacao(USUARIO, OUTRA_ORG));
  expect(anterior.aborted).toBe(true);
  expect(await screen.findByRole("alert")).toHaveTextContent("Ciclo indisponível");
  await act(async () => entregar?.(dados));
  expect(screen.queryByText("Item desta rodada")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Ver protocolo de origem" })).not.toBeInTheDocument();
});

it("V2-02 navega paginas independentes e pode repetir uma falha", async () => {
  m.consulta.mockResolvedValue({ ...dados, apontamentos: { ...dados.apontamentos, total: 26 } });
  render(<CicloDiligencia id={CICLO} />);
  const pag = await screen.findByRole("navigation", { name: "Paginação dos apontamentos" });
  m.consulta.mockRejectedValueOnce(Error("texto de transporte privado"));
  fireEvent.click(within(pag).getByRole("button", { name: "Próxima" }));
  await waitFor(() =>
    expect(m.consulta).toHaveBeenLastCalledWith(
      CICLO,
      ORG,
      { pareceres: 0, apontamentos: 25 },
      expect.any(AbortSignal),
    ),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível consultar este ciclo",
  );
  expect(screen.queryByText("texto de transporte privado")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Atualizar consulta" }));
  expect(await screen.findByText("Item desta rodada")).toBeVisible();
  expect(m.consulta).toHaveBeenLastCalledWith(
    CICLO,
    ORG,
    { pareceres: 0, apontamentos: 0 },
    expect.any(AbortSignal),
  );
});

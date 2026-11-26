import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  consulta: vi.fn(),
  ciclo: vi.fn(),
  getUser: vi.fn(),
  auth: vi.fn(),
  navegar: vi.fn(),
  unsubscribe: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser, onAuthStateChange: m.auth },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));
vi.mock("@/lib/diligencias/apontamentoDiligenciaDados", () => ({
  consultarApontamentoDiligencia: m.consulta,
}));
vi.mock("@/lib/diligencias/cicloDiligenciaDados", async (original) => ({
  ...(await original<typeof import("@/lib/diligencias/cicloDiligenciaDados")>()),
  consultarCicloDiligencia: m.ciclo,
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.navegar,
  Link: ({
    to,
    params,
    search,
    children,
    ...props
  }: {
    to: string;
    params?: Record<string, string>;
    search?: Record<string, string | number | undefined>;
    children: ReactNode;
  }) => {
    const href = Object.entries(params ?? {}).reduce((url, [k, v]) => url.replace("$" + k, v), to);
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(search ?? {})) if (v !== undefined) query.set(k, String(v));
    return (
      <a href={query.size ? href + "?" + query.toString() : href} {...props}>
        {children}
      </a>
    );
  },
}));

import { ApontamentoDiligencia } from "@/components/diligencias/ApontamentoDiligencia";
import { CicloDiligencia } from "@/components/diligencias/CicloDiligencia";
import type { DetalheApontamentoDiligencia } from "@/lib/diligencias/apontamentoDiligenciaDados";
import { ErroDiligencias } from "@/lib/diligencias/diligenciasDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const uuid = (n: number) => "46000000-0000-4000-8000-" + String(n).padStart(12, "0");
const [
  ORG,
  CONTRATO,
  COMP,
  CICLO,
  ITEM,
  APRES,
  PACOTE,
  PARECER,
  ARQUIVO,
  ANALISE,
  TAREFA,
  REV,
  DOC,
  VERSAO,
  OUTRA,
] = [
  uuid(1),
  uuid(2),
  uuid(3),
  uuid(4),
  uuid(5),
  uuid(6),
  uuid(7),
  uuid(8),
  uuid(9),
  uuid(10),
  uuid(11),
  uuid(12),
  uuid(13),
  uuid(14),
  uuid(15),
] as const;
const USER = "usuario-fixture-v2-46";
const DATA = "2026-11-08T15:00:00Z";
const HASH = "a".repeat(64);

const dados: DetalheApontamentoDiligencia = {
  ciclo: {
    id: CICLO,
    id_competencia: COMP,
    id_organizacao: ORG,
    id_contrato: CONTRATO,
    status: "em_tratamento",
    numero_rodada: 2,
    recebido_em: DATA,
    encerrado_em: null,
    prazo_resposta: null,
    versao_registro: 1,
  },
  item: {
    id: ITEM,
    codigo: "AP-46",
    descricao: "Documento apontado pela contratante",
    situacao: "em_analise",
    severidade: "alta",
    classificacao: "inconclusivo",
    fundamento: "Fundamento oficial",
    valorQuestionado: "9999999999999999.99",
    glosaPotencial: "0.00",
    valorAceito: null,
    impactoEstimado: "-0.01",
  },
  fonte: {
    estado: "ok",
    dados: {
      estado: "REGISTRADA",
      parecerId: PARECER,
      arquivoId: ARQUIVO,
      apresentacaoId: APRES,
      nome: "parecer-segunda-origem.pdf",
      numero: "PARECER 02",
      sha256: HASH,
      pagina: 3,
      trecho: "Trecho do segundo parecer",
    },
  },
  apresentacao: { estado: "ok", dados: { id: APRES, pacoteId: PACOTE, congeladoEm: DATA } },
  analises: {
    estado: "ok",
    dados: [
      {
        id: ANALISE,
        classificacao: "inconclusivo",
        criadaEm: DATA,
        fundamento: "Sugestão registrada",
        versoes: [VERSAO],
      },
    ],
  },
  tarefas: {
    estado: "ok",
    dados: [{ id: TAREFA, descricao: "Conferir documento", versaoId: VERSAO }],
  },
  revisoes: {
    estado: "ok",
    dados: [
      {
        id: REV,
        tarefaId: TAREFA,
        tarefa: "Conferir documento",
        aprovada: true,
        fundamento: "Registro de conferência humana",
        revisadaEm: DATA,
      },
    ],
  },
  desfechos: { estado: "ok", dados: [] },
  evidencias: {
    estado: "ok",
    dados: {
      indisponiveis: 0,
      versoes: [
        {
          versaoId: VERSAO,
          numero: 1,
          hash: HASH,
          documentoId: DOC,
          titulo: "Documento contratual",
          tipo: "contrato",
          pacote: "indisponivel",
        },
      ],
    },
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  m.auth.mockReturnValue({ data: { subscription: { unsubscribe: m.unsubscribe } } });
  m.getUser.mockResolvedValue({ data: { user: { id: USER } }, error: null });
  m.consulta.mockResolvedValue(dados);
  definirPreferenciaOrganizacao(USER, ORG);
});
afterEach(cleanup);

it("V2-03 liga o item, protocolo e versao exata ao contexto de retorno", async () => {
  render(<ApontamentoDiligencia cicloId={CICLO} id={ITEM} offset={25} />);
  expect(await screen.findByText("parecer-segunda-origem.pdf")).toBeVisible();
  expect(screen.getByRole("link", { name: "Voltar ao ciclo" })).toHaveAttribute(
    "href",
    "/diligencias/" + CICLO + "?offset=25&foco=" + ITEM,
  );
  expect(screen.getByRole("link", { name: "Ver protocolo de origem" })).toHaveAttribute(
    "href",
    "/competencias/" + COMP + "/apresentacoes/" + APRES,
  );
  expect(
    screen.getByRole("link", { name: "Abrir versão 1 em Documento contratual" }),
  ).toHaveAttribute(
    "href",
    "/contratos/" +
      CONTRATO +
      "/documentos/" +
      DOC +
      "?versao=" +
      VERSAO +
      "&ciclo=" +
      CICLO +
      "&apontamento=" +
      ITEM +
      "&offset=25",
  );
  expect(
    within(screen.getByRole("region", { name: "Revisões humanas das tarefas" })).getByText(
      "Solução validada",
    ),
  ).toBeVisible();
  expect(
    within(screen.getByRole("region", { name: "Análises e sugestões" })).getByText(
      "Requer análise humana",
    ),
  ).toBeVisible();
});

it("V2-02 retorna a pagina e devolve o foco ao apontamento de origem", async () => {
  m.ciclo.mockResolvedValue({
    ciclo: dados.ciclo,
    pareceres: { total: 0, itens: [] },
    apontamentos: { total: 26, itens: [dados.item] },
  });
  render(<CicloDiligencia id={CICLO} offset={25} foco={ITEM} />);
  const link = await screen.findByRole("link", { name: "Abrir apontamento AP-46" });
  await waitFor(() => expect(link).toHaveFocus());
  expect(link).toHaveAttribute(
    "href",
    "/diligencias/" + CICLO + "/apontamentos/" + ITEM + "?offset=25",
  );
  expect(m.ciclo).toHaveBeenCalledWith(
    CICLO,
    ORG,
    { pareceres: 0, apontamentos: 25 },
    expect.any(AbortSignal),
  );
});

it("V2-03 limpa o item obsoleto na troca de organizacao ou sessao", async () => {
  let resolver: (v: DetalheApontamentoDiligencia) => void = () => undefined;
  m.consulta.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolver = r;
      }),
  );
  m.consulta.mockRejectedValueOnce(new ErroDiligencias("sem_permissao"));
  render(<ApontamentoDiligencia cicloId={CICLO} id={ITEM} />);
  await waitFor(() => expect(m.consulta).toHaveBeenCalledTimes(1));
  const abortado = m.consulta.mock.calls[0]?.[3] as AbortSignal | undefined;
  act(() => definirPreferenciaOrganizacao(USER, OUTRA));
  expect(await screen.findByRole("alert")).toHaveTextContent("não possui permissão");
  expect(abortado?.aborted).toBe(true);
  act(() => resolver(dados));
  expect(screen.queryByText("parecer-segunda-origem.pdf")).not.toBeInTheDocument();
  m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
  act(() => m.auth.mock.calls[0]?.[0]("SIGNED_OUT"));
  await waitFor(() => expect(m.navegar).toHaveBeenCalledWith({ to: "/login", replace: true }));
  expect(m.consulta).toHaveBeenCalledTimes(2);
});

it("V2-03 descarta a resposta da rota anterior ao trocar de apontamento", async () => {
  let resolver: (v: DetalheApontamentoDiligencia) => void = () => undefined;
  m.consulta.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolver = r;
      }),
  );
  m.consulta.mockResolvedValueOnce({
    ...dados,
    item: { ...dados.item, id: OUTRA, descricao: "Outro apontamento ativo" },
  });
  const { rerender } = render(<ApontamentoDiligencia cicloId={CICLO} id={ITEM} />);
  await waitFor(() => expect(m.consulta).toHaveBeenCalledTimes(1));
  const primeiro = m.consulta.mock.calls[0]?.[3] as AbortSignal | undefined;
  rerender(<ApontamentoDiligencia cicloId={CICLO} id={OUTRA} />);
  expect(await screen.findByText("Outro apontamento ativo")).toBeVisible();
  act(() => resolver(dados));
  expect(primeiro?.aborted).toBe(true);
  expect(screen.queryByText("Documento apontado pela contratante")).not.toBeInTheDocument();
});

it("V2-03 diferencia item indisponivel de erro e permite nova tentativa", async () => {
  m.consulta.mockRejectedValueOnce(new ErroDiligencias("erro"));
  m.consulta.mockRejectedValueOnce(new ErroDiligencias("nao_encontrado"));
  render(<ApontamentoDiligencia cicloId={CICLO} id={ITEM} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível consultar");
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(await screen.findByText("Apontamento indisponível nesta rodada.")).toBeVisible();
  expect(screen.queryByText("parecer-segunda-origem.pdf")).not.toBeInTheDocument();
});

it("V2-03 mostra a ausencia historica sem criar atalho de protocolo", async () => {
  m.consulta.mockResolvedValue({
    ...dados,
    fonte: { estado: "ok", dados: { estado: "ORIGEM_NAO_REGISTRADA" } },
    apresentacao: { estado: "ok", dados: null },
  });
  render(<ApontamentoDiligencia cicloId={CICLO} id={ITEM} />);
  expect(
    await screen.findByText(/vínculo com o parecer de origem não foi registrado/i),
  ).toBeVisible();
  expect(screen.queryByRole("link", { name: "Ver protocolo de origem" })).not.toBeInTheDocument();
});

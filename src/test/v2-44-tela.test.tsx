import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  authListener: vi.fn(),
  unsubscribe: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser, onAuthStateChange: m.authListener },
    from: m.from,
    rpc: m.rpc,
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, params }: {
    children: ReactNode;
    to: string;
    params?: Record<string, string>;
  }) => (
    <a href={Object.entries(params ?? {}).reduce((s, [key, value]) => s.replace("$" + key, value), to)}>
      {children}
    </a>
  ),
}));

import { CompetenciaVisaoGeral } from "@/components/competencias/CompetenciaVisaoGeral";
import { DiligenciasCompetencia } from "@/components/diligencias/DiligenciasCompetencia";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const ID = "44444444-4444-4444-8444-444444444444";
const ORG = "11111111-1111-4111-8111-111111111111";
const ORG_B = "77777777-7777-4777-8777-777777777777";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const USUARIO = "usuario-sintetico-44";

function visao(organizacao = ORG) {
  return {
    competencia: {
      id: ID, id_organizacao: organizacao, id_contrato: CONTRATO,
      competencia_referencia: "2026-11-01", situacao: "com_apontamentos",
      periodo_inicio: "2026-11-01", periodo_fim: "2026-11-30", data_limite: null,
      percentual_conformidade: 100, versao_pacote_atual: 1, versao_registro: 5,
      atualizado_em: "2026-11-08T13:00:00Z",
    },
    portao: {
      liberado: false, total: 1, conformes_ou_na_validos: 1, pendentes: 0,
      nao_conformes: 0, inconclusivos: 0, em_analise: 0,
      nao_conformidades_bloqueantes: 0, percentual: 100,
    },
    blocking_summary: {
      pendentes: 0, nao_conformes: 0, inconclusivos: 0, em_analise: 0,
      nao_conformidades_bloqueantes: 0, parecer_aprovado: true,
      analise_concluida_atual: true, aprovacao_apresentacao_atual: true,
    },
    allowed_actions: { abrir_documentos: true, analisar: true, abrir_parecer: true, apresentar: false },
  };
}

function ciclo(rodada: number, organizacao = ORG) {
  return {
    id: rodada === 1 ? "33333333-3333-4333-8333-333333333333" : "66666666-6666-4666-8666-666666666666",
    id_competencia: ID, id_organizacao: organizacao, id_contrato: CONTRATO,
    numero_rodada: rodada, status: "em_tratamento", recebido_em: "2026-11-06T16:00:00Z",
    prazo_resposta: "2026-11-21", encerrado_em: null, versao_registro: 1,
  };
}

const ok = (data: unknown[], count = data.length) => ({ data, count, error: null, status: 200 });
function consulta(resposta: unknown) {
  return {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockImplementation(() => Promise.resolve(resposta)),
  };
}

function autorizar(organizacao = ORG) {
  m.rpc.mockImplementation(() => ({
    abortSignal: () => Promise.resolve({ data: visao(organizacao), error: null, status: 200 }),
  }));
}

beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  definirPreferenciaOrganizacao(USUARIO, ORG);
  m.getUser.mockResolvedValue({ data: { user: { id: USUARIO } }, error: null });
  m.authListener.mockReturnValue({ data: { subscription: { unsubscribe: m.unsubscribe } } });
  autorizar();
  m.from.mockImplementation((tabela: string) =>
    consulta(tabela === "ciclos_diligencia" ? ok([ciclo(2), ciclo(1)]) : ok([])),
  );
});
afterEach(cleanup);

describe("V2-01 tela de diligencias", () => {
  it("V2-01 lista duas rodadas e retorna a competencia autorizada", async () => {
    render(<DiligenciasCompetencia id={ID} />);
    expect(await screen.findByText("Rodada 2")).toBeVisible();
    expect(screen.getByText("Rodada 1")).toBeVisible();
    expect(screen.getAllByText("21/11/2026")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /voltar.*competência/i })).toHaveAttribute("href", "/competencias/" + ID);
    expect(m.rpc).toHaveBeenCalledWith("obter_visao_geral_competencia", { p_id_competencia: ID });
  });

  it("V2-01 liga a entrada de diligencias a V114 sem trocar o contexto", async () => {
    render(<CompetenciaVisaoGeral id={ID} />);
    const link = await screen.findByRole("link", { name: "Diligências" });
    expect(link).toHaveAttribute("href", "/competencias/" + ID + "/diligencias");
  });

  it("V2-01 nao exibe uma lista de outro contexto", async () => {
    autorizar(ORG_B);
    render(<DiligenciasCompetencia id={ID} />);
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(m.from).not.toHaveBeenCalled();
    expect(screen.queryByText("Rodada 2")).not.toBeInTheDocument();
  });

  it("V2-01 cancela a resposta antiga apos troca de organizacao", async () => {
    let terminar: (value: unknown) => void = () => {};
    const resposta = new Promise((resolve) => { terminar = resolve; });
    const antiga = consulta(resposta);
    m.from.mockReturnValueOnce(antiga);
    m.from.mockReturnValue(consulta(ok([ciclo(2, ORG_B)])));
    render(<DiligenciasCompetencia id={ID} />);
    await waitFor(() => expect(antiga.abortSignal).toHaveBeenCalledTimes(1));
    const sinal = antiga.abortSignal.mock.calls[0]?.[0] as AbortSignal;
    autorizar(ORG_B);
    await act(async () => definirPreferenciaOrganizacao(USUARIO, ORG_B));
    expect(await screen.findByText("Rodada 2")).toBeVisible();
    expect(sinal.aborted).toBe(true);
    await act(async () => terminar(ok([ciclo(1)])));
    expect(screen.queryByText("Rodada 1")).not.toBeInTheDocument();
    expect(screen.getByText("Rodada 2")).toBeVisible();
  });

  it("V2-01 limpa dados e retorna ao login depois de perder a sessao", async () => {
    render(<DiligenciasCompetencia id={ID} />);
    expect(await screen.findByText("Rodada 2")).toBeVisible();
    const evento = m.authListener.mock.calls[0]?.[0];
    if (!evento) throw new Error("A tela deve observar mudanças de sessão.");
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await act(async () => evento("SIGNED_OUT", null));
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(screen.queryByText("Rodada 2")).not.toBeInTheDocument();
  });

  it("V2-01 apresenta negacao e permite renovar uma consulta falha", async () => {
    m.from
      .mockReturnValueOnce(consulta({ status: 403, error: { code: "42501" }, data: null, count: null }))
      .mockReturnValueOnce(consulta({ status: 503, error: {}, data: null, count: null }))
      .mockReturnValueOnce(consulta(ok([])));
    render(<DiligenciasCompetencia id={ID} />);
    expect(await screen.findByText(/não possui permissão/i)).toBeVisible();
    expect(screen.queryByText(/nenhuma diligência/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /atualizar|tentar novamente/i }));
    expect(await screen.findByText(/não foi possível consultar/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /atualizar|tentar novamente/i }));
    expect(await screen.findByText(/nenhuma diligência/i)).toBeVisible();
  });
});

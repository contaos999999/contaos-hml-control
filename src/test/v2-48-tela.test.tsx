import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  consultarContestacoes: vi.fn(),
  consultarVinculosContestacao: vi.fn(),
  registrarContestacao: vi.fn(),
  consultarPortaoRodada: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/lib/diligencias/contestacaoDiligenciaDados", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/diligencias/contestacaoDiligenciaDados")>()),
  consultarContestacoes: mocks.consultarContestacoes,
  consultarVinculosContestacao: mocks.consultarVinculosContestacao,
  registrarContestacao: mocks.registrarContestacao,
}));
vi.mock("@/lib/diligencias/planoAcaoDiligenciaDados", () => ({
  consultarPortaoRodada: mocks.consultarPortaoRodada,
}));

import { ContestacaoDiligencia } from "@/components/diligencias/ContestacaoDiligencia";
import {
  ErroContestacao,
  type PainelContestacao,
} from "@/lib/diligencias/contestacaoDiligenciaDados";
import type { CicloDiligencia } from "@/lib/diligencias/diligenciasDados";

const uuid = (n: number) => "48000000-0000-4000-8000-" + String(n).padStart(12, "0");
const ciclo: CicloDiligencia = {
  id: uuid(1),
  id_organizacao: uuid(2),
  id_contrato: uuid(3),
  id_competencia: uuid(4),
  numero_rodada: 2,
  status: "em_tratamento",
  recebido_em: "2026-11-25T12:00:00Z",
  prazo_resposta: null,
  encerrado_em: null,
  versao_registro: 1,
};
const item = uuid(5);
const contestacao = uuid(6);
const fonte = uuid(7);
const correlacao = uuid(8);
const hash = "c".repeat(64);
const pendente: PainelContestacao = {
  id_ciclo: ciclo.id,
  id_apontamento: item,
  versao_atual: 2,
  versao_apontamento: 1,
  submeter: true,
  solicitar_minuta: false,
  offset: 0,
  limite: 10,
  total: 1,
  offset_fontes: 0,
  total_fontes: 1,
  fontes: [{ id: fonte, titulo: "Fonte confirmada", numero: 3, hash, vigente: true }],
  minuta: null,
  contestacoes: [
    {
      id: contestacao,
      versao: 2,
      texto: "Manifestação registrada",
      fundamento: "Fundamento documental",
      hash,
      recomendada: false,
      justificativa_recomendacao: null,
      criado_em: ciclo.recebido_em,
      status_aprovacao: "pendente",
      aprovado_por: null,
      aprovado_em: null,
      resultado_final: null,
      resultado_registrado_em: null,
      revisar: true,
      mapa: [
        {
          id: uuid(9),
          id_versao_documento: fonte,
          titulo: "Fonte confirmada",
          versao_documento: 3,
          pagina: 4,
          descricao: "Afirmação",
          trecho: "Prova literal",
          hash,
        },
      ],
    },
  ],
};

async function abrir(aoRegistrar = vi.fn()) {
  const view = render(
    <ContestacaoDiligencia ciclo={ciclo} apontamento={item} aoRegistrar={aoRegistrar} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Abrir contestação" }));
  const painel = within(await screen.findByRole("dialog", { name: "Contestação" }));
  return { view, painel, aoRegistrar };
}

describe("V2-05", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.consultarContestacoes.mockResolvedValue(pendente);
    mocks.consultarVinculosContestacao.mockResolvedValue(new Map());
    mocks.consultarPortaoRodada.mockResolvedValue({
      total: 1,
      tratados: 0,
      abertos: 1,
      liberado: false,
    });
  });

  it("abre a contestacao mostra mapa e registra decisao humana com releitura", async () => {
    const { painel, aoRegistrar } = await abrir();
    expect(await painel.findByText("Fonte confirmada · versão 3 · página 4")).toBeInTheDocument();
    fireEvent.click(painel.getByRole("button", { name: "Revisar versão 2" }));
    fireEvent.change(painel.getByLabelText("Decisão"), { target: { value: "aprovar" } });
    fireEvent.change(painel.getByLabelText("Fundamento da revisão"), {
      target: { value: "Prova conferida" },
    });
    mocks.registrarContestacao.mockResolvedValueOnce({ tipo: "revisar", referencia: correlacao });
    mocks.consultarContestacoes.mockResolvedValue({
      ...pendente,
      contestacoes: [
        { ...pendente.contestacoes[0]!, revisar: false, status_aprovacao: "aprovada" },
      ],
    });
    mocks.consultarPortaoRodada.mockResolvedValue({
      total: 1,
      tratados: 1,
      abertos: 0,
      liberado: true,
    });
    fireEvent.click(painel.getByRole("button", { name: "Registrar decisão" }));
    expect(await painel.findByText("Revisão da contestação registrada.")).toBeInTheDocument();
    expect(await painel.findByText("Apontamentos tratados na rodada 1 de 1.")).toBeInTheDocument();
    expect(painel.getByRole("link", { name: "Abrir auditoria" })).toHaveAttribute(
      "href",
      "/administracao/auditoria",
    );
    expect(aoRegistrar).toHaveBeenCalledOnce();
    expect(mocks.registrarContestacao).toHaveBeenCalledWith(
      item,
      {
        tipo: "revisar",
        versao: 2,
        id: contestacao,
        aprovar: true,
        fundamento: "Prova conferida",
      },
      expect.any(String),
      expect.any(AbortSignal),
    );
  });

  it("nega o contexto antes de exibir evidencias ou acoes e recupera o vazio", async () => {
    mocks.consultarContestacoes.mockRejectedValueOnce(new ErroContestacao("sem_permissao"));
    const { painel } = await abrir();
    expect(await painel.findByRole("alert")).toHaveTextContent("não tem permissão");
    expect(painel.queryByText("Histórico de versões")).not.toBeInTheDocument();
    expect(painel.queryByRole("button", { name: "Nova versão" })).not.toBeInTheDocument();
    mocks.consultarContestacoes.mockResolvedValueOnce({
      ...pendente,
      total: 0,
      contestacoes: [],
      versao_atual: 0,
      solicitar_minuta: true,
    });
    fireEvent.click(painel.getByRole("button", { name: "Atualizar contestação" }));
    expect(
      await painel.findByText("Nenhuma versão registrada para este apontamento."),
    ).toBeInTheDocument();
  });

  it("reutiliza chave de minuta apos perda de resposta e oculta revisao sem capacidade", async () => {
    mocks.consultarContestacoes.mockResolvedValue({
      ...pendente,
      solicitar_minuta: true,
      contestacoes: [{ ...pendente.contestacoes[0]!, revisar: false }],
    });
    mocks.registrarContestacao
      .mockRejectedValueOnce(Error("timeout"))
      .mockResolvedValueOnce({ tipo: "minuta", referencia: uuid(10) });
    const { painel, aoRegistrar } = await abrir();
    const acao = await painel.findByRole("button", { name: "Solicitar minuta" });
    expect(painel.queryByRole("button", { name: "Revisar versão 2" })).not.toBeInTheDocument();
    fireEvent.click(acao);
    expect(await painel.findByRole("alert")).toHaveTextContent("Tente novamente");
    fireEvent.click(acao);
    expect(await painel.findByText("Solicitação de minuta registrada.")).toBeInTheDocument();
    expect(aoRegistrar).not.toHaveBeenCalled();
    expect(mocks.registrarContestacao.mock.calls[0]?.[2]).toBe(
      mocks.registrarContestacao.mock.calls[1]?.[2],
    );
  });

  it("aborta a leitura descartada ao fechar e devolve foco ao acionador", async () => {
    let liberar: (dados: PainelContestacao) => void = () => {};
    mocks.consultarContestacoes.mockImplementationOnce(
      () =>
        new Promise<PainelContestacao>((resolve) => {
          liberar = resolve;
        }),
    );
    const { painel } = await abrir();
    expect(await painel.findByText("Carregando contestação…")).toBeInTheDocument();
    fireEvent.keyDown(painel.getByRole("heading", { name: "Contestação" }), { key: "Escape" });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Abrir contestação" })).toHaveFocus(),
    );
    expect(mocks.consultarContestacoes.mock.calls[0]?.[4].aborted).toBe(true);
    await act(async () => liberar(pendente));
    expect(screen.queryByText("Manifestação registrada")).not.toBeInTheDocument();
  });
});

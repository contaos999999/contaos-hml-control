import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const dados = vi.hoisted(() => ({
  consultarPlanoAcao: vi.fn(),
  consultarPortaoRodada: vi.fn(),
  consultarEvidenciasElegiveis: vi.fn(),
  registrarAcaoTarefa: vi.fn(),
  consultarPreferenciasTarefa: vi.fn(),
  salvarPreferenciaTarefa: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/lib/diligencias/planoAcaoDiligenciaDados", async (original) => ({
  ...(await original<typeof import("@/lib/diligencias/planoAcaoDiligenciaDados")>()),
  ...dados,
}));

import { PlanoAcaoDiligencia } from "@/components/diligencias/PlanoAcaoDiligencia";
import {
  ErroPlanoAcao,
  type PlanoAcao,
  type TarefaDiligencia,
} from "@/lib/diligencias/planoAcaoDiligenciaDados";

const UUID = (n: number) => "47000000-0000-4000-8000-" + String(n).padStart(12, "0");
const CICLO = UUID(101),
  ITEM = UUID(201),
  COMP = UUID(301),
  EVIDENCIA = UUID(401);
const TAREFA = UUID(501),
  PESSOA = UUID(1),
  CORRELACAO = UUID(601);
const escopo = { id: CICLO, id_competencia: COMP, id_organizacao: UUID(21), id_contrato: UUID(31) };
const tarefa: TarefaDiligencia = {
  id: TAREFA,
  descricao: "Conferir assinatura",
  id_plano: null,
  responsavel: PESSOA,
  prazo: "2026-12-07",
  tipo_acao: "obter_assinatura",
  prioridade: "alta",
  status: "pendente",
  validacao_solucao: "pendente",
  estado_execucao: null,
  versao_registro: 1,
  depende_de: [],
  id_execucao: null,
  id_evidencia: null,
  prova: null,
  editar: true,
  submeter: true,
  revisar: false,
  aprovar: false,
};
const plano: PlanoAcao = {
  id_ciclo: CICLO,
  id_apontamento: ITEM,
  criar: true,
  total: 1,
  offset: 0,
  limite: 10,
  perfil_preferencia: "gestor_contrato",
  tarefas: [tarefa],
  dependencias: [],
  planos: [],
  responsaveis: [{ id: PESSOA, nome: "Pessoa sintética" }],
};

beforeEach(() => {
  for (const fn of Object.values(dados)) fn.mockReset();
  dados.consultarPlanoAcao.mockResolvedValue(plano);
  dados.consultarPortaoRodada.mockResolvedValue({
    total: 1,
    tratados: 0,
    abertos: 1,
    liberado: false,
  });
  dados.consultarEvidenciasElegiveis.mockResolvedValue({
    total: 1,
    opcoes: [{ id: EVIDENCIA, titulo: "Atesto", numero: 2, hash: "a".repeat(64) }],
  });
  dados.registrarAcaoTarefa.mockResolvedValue({ correlation_id: CORRELACAO });
  dados.consultarPreferenciasTarefa.mockResolvedValue([]);
  dados.salvarPreferenciaTarefa.mockResolvedValue(undefined);
});

function exibir(aoRegistrar = vi.fn()) {
  const tela = render(
    <PlanoAcaoDiligencia
      escopo={escopo}
      apontamento={ITEM}
      usuario={PESSOA}
      aoRegistrar={aoRegistrar}
    />,
  );
  const gatilho = screen.getByRole("button", { name: "Abrir plano de ação" });
  fireEvent.click(gatilho);
  const painel = within(screen.getByRole("dialog", { name: "Plano de ação" }));
  return { tela, painel, gatilho, aoRegistrar };
}

async function novaTarefa(painel: ReturnType<typeof within>) {
  fireEvent.click(await painel.findByRole("button", { name: "Nova tarefa" }));
  fireEvent.change(painel.getByLabelText("Descrição"), {
    target: { value: "Corrigir comprovante" },
  });
  fireEvent.change(painel.getByLabelText("Responsável"), { target: { value: PESSOA } });
  fireEvent.change(painel.getByLabelText("Prazo"), { target: { value: "2026-12-08" } });
  fireEvent.change(painel.getByLabelText("Tipo de ação"), {
    target: { value: "anexar_complemento" },
  });
  fireEvent.click(painel.getByRole("button", { name: "Salvar tarefa" }));
}

describe("V2-04", () => {
  it("abre o painel, registra a tarefa e rele o detalhe e o portao", async () => {
    const { painel, aoRegistrar } = exibir();
    await novaTarefa(painel);
    expect(await painel.findByText(CORRELACAO)).toBeInTheDocument();
    expect(aoRegistrar).toHaveBeenCalledTimes(1);
    expect(dados.consultarPlanoAcao).toHaveBeenCalledTimes(2);
    expect(dados.consultarPortaoRodada).toHaveBeenCalledWith(CICLO, expect.any(AbortSignal));
    expect(dados.registrarAcaoTarefa).toHaveBeenCalledWith(
      escopo,
      ITEM,
      {
        tipo: "salvar",
        tarefa: null,
        dados: {
          descricao: "Corrigir comprovante",
          responsavel: PESSOA,
          prazo: "2026-12-08",
          prioridade: "media",
          tipo_acao: "anexar_complemento",
          depende_de: [],
        },
      },
      expect.any(String),
      expect.any(AbortSignal),
    );
  });

  it("reutiliza a mesma chave apos perda de resposta", async () => {
    dados.registrarAcaoTarefa.mockRejectedValueOnce(new Error("resposta perdida"));
    const { painel } = exibir();
    await novaTarefa(painel);
    expect(await painel.findByRole("alert")).toHaveTextContent("A resposta não foi confirmada");
    fireEvent.click(painel.getByRole("button", { name: "Salvar tarefa" }));
    expect(await painel.findByText(CORRELACAO)).toBeInTheDocument();
    const [primeira, segunda] = dados.registrarAcaoTarefa.mock.calls;
    expect(primeira?.slice(0, 4)).toEqual(segunda?.slice(0, 4));
  });

  it("submete a versao escolhida e limita a decisao a capacidade oficial", async () => {
    const { painel } = exibir();
    await painel.findByText("Conferir assinatura");
    expect(painel.queryByRole("button", { name: "Revisar solução" })).not.toBeInTheDocument();
    fireEvent.click(painel.getByRole("button", { name: "Submeter evidência" }));
    const select = await painel.findByLabelText("Versão da evidência");
    expect(painel.getByRole("button", { name: "Enviar para revalidação" })).toBeDisabled();
    fireEvent.change(select, { target: { value: EVIDENCIA } });
    fireEvent.click(painel.getByRole("button", { name: "Enviar para revalidação" }));
    expect(await painel.findByText("Evidência submetida para revalidação.")).toBeInTheDocument();
    expect(dados.registrarAcaoTarefa).toHaveBeenCalledWith(
      escopo,
      ITEM,
      {
        tipo: "submeter",
        tarefa,
        evidencia: EVIDENCIA,
      },
      expect.any(String),
      expect.any(AbortSignal),
    );

    dados.consultarPlanoAcao.mockResolvedValue({
      ...plano,
      tarefas: [
        {
          ...tarefa,
          editar: false,
          submeter: false,
          revisar: true,
          aprovar: false,
          status: "concluida",
          validacao_solucao: "em_analise",
        },
      ],
    });
    fireEvent.click(await painel.findByRole("button", { name: "Atualizar plano" }));
    fireEvent.click(await painel.findByRole("button", { name: "Revisar solução" }));
    expect(painel.queryByRole("option", { name: "Validar solução" })).not.toBeInTheDocument();
    fireEvent.change(painel.getByLabelText("Fundamento da revisão"), {
      target: { value: "Assinatura ausente" },
    });
    fireEvent.click(painel.getByRole("button", { name: "Registrar revisão" }));
    await waitFor(() =>
      expect(dados.registrarAcaoTarefa).toHaveBeenLastCalledWith(
        escopo,
        ITEM,
        expect.objectContaining({
          tipo: "revisar",
          aprovar: false,
          fundamento: "Assinatura ausente",
        }),
        expect.any(String),
        expect.any(AbortSignal),
      ),
    );
  });

  it("distingue negacao, falha recuperavel e ausencia de tarefas", async () => {
    dados.consultarPlanoAcao
      .mockRejectedValueOnce(new ErroPlanoAcao("sem_permissao"))
      .mockRejectedValueOnce(new Error("rede"))
      .mockResolvedValueOnce({ ...plano, total: 0, tarefas: [], criar: false });
    const { painel } = exibir();
    expect(await painel.findByRole("alert")).toHaveTextContent("Seu perfil não tem permissão");
    expect(painel.queryByText("Nenhuma tarefa nesta página.")).not.toBeInTheDocument();
    fireEvent.click(painel.getByRole("button", { name: "Tentar novamente" }));
    expect(await painel.findByRole("alert")).toHaveTextContent("A resposta não foi confirmada");
    fireEvent.click(painel.getByRole("button", { name: "Tentar novamente" }));
    expect(await painel.findByText("Nenhuma tarefa nesta página.")).toBeInTheDocument();
  });

  it("aborta o contexto descartado e ignora a resposta antiga", async () => {
    let resposta = (_: PlanoAcao) => {};
    dados.consultarPlanoAcao.mockReturnValueOnce(
      new Promise<PlanoAcao>((resolve) => {
        resposta = resolve;
      }),
    );
    const { painel, tela } = exibir();
    expect(painel.getByText("Carregando tarefas do apontamento…")).toBeInTheDocument();
    const signal = dados.consultarPlanoAcao.mock.calls[0]?.[3] as AbortSignal;
    tela.unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => resposta(plano));
    expect(screen.queryByText(tarefa.descricao)).not.toBeInTheDocument();
  });

  it("salva aviso do papel autenticado e retorna o foco ao apontamento", async () => {
    const { painel, gatilho } = exibir();
    fireEvent.click(await painel.findByRole("button", { name: "Preferências de avisos" }));
    fireEvent.click(await painel.findByLabelText("Usar esta preferência no meu papel atual"));
    fireEvent.click(painel.getByRole("button", { name: "Salvar preferência" }));
    expect(await painel.findByText("Preferência registrada.")).toBeInTheDocument();
    expect(dados.salvarPreferenciaTarefa).toHaveBeenCalledWith(
      escopo.id_organizacao,
      PESSOA,
      {
        evento: "TarefaDiligenciaAtribuida:gestor_contrato",
        canal: "in_app",
        habilitado: true,
      },
      expect.any(AbortSignal),
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(gatilho).toHaveFocus());
  });
});

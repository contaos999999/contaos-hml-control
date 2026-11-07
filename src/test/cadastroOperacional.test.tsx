import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
const m = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: m.rpc } }));
import {
  obterCadastro,
  executarComando,
  montarComando,
  ErroCadastro,
  type ContextoCadastro,
} from "@/lib/cadastros/cadastroOperacionalDados";
import { GerenciarCadastro } from "@/components/cadastros/GerenciarCadastro";
const ORG = "11111111-1111-4111-8111-111111111111";
const ID = "22222222-2222-4222-8222-222222222222";
const REQUEST = "33333333-3333-4333-8333-333333333333";
const ctx: ContextoCadastro = {
  idUsuario: "user-a",
  idOrganizacao: ORG,
  entidade: "contratos",
  id: ID,
};
const registro = {
  id: ID,
  id_organizacao: ORG,
  versao_registro: 3,
  situacao: "ativo",
  numero: "C-01",
  objeto: "Serviços",
  tipo_contrato: null,
  unidade_vinculada: null,
  fonte_recurso: null,
  inicio: "2026-01-01",
  fim: null,
  valor_global: 1000,
  valor_mensal_referencia: null,
  periodicidade: "mensal",
  prazo_prestacao_dias: null,
  dia_limite_apresentacao: null,
  criticidade: "media",
};
const cadastro = (over: Record<string, unknown> = {}) => ({
  schema_versao: "crud-cadastro-v1",
  entidade: "contratos",
  registro: { ...registro },
  pode_editar: true,
  transicoes: [{ situacao: "encerrado", rotulo: "encerrado" }],
  exclusao_permitida: false,
  motivo_retencao: "Preservar histórico e auditoria.",
  ...over,
});
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const resposta = (over: Record<string, unknown> = {}) =>
  cadastro({
    registro: { ...registro, objeto: "Objeto revisto", versao_registro: 4 },
    request_id: REQUEST,
    evento_id: REQUEST,
    ...over,
  });
function montar(onAlterado?: () => void) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return {
    ...render(<GerenciarCadastro contexto={ctx} {...(onAlterado ? { onAlterado } : {})} />, {
      wrapper,
    }),
    qc,
  };
}
async function abrir() {
  fireEvent.click(screen.getByRole("button", { name: "Editar e gerenciar contrato" }));
  await screen.findByLabelText("Objeto");
}
beforeEach(() => {
  vi.clearAllMocks();
  m.rpc.mockResolvedValue(ok(cadastro()));
});
describe("adapter canônico de cadastro", () => {
  it("recusa comando de outro contexto antes de qualquer escrita", async () => {
    const comando = montarComando(
      ctx,
      3,
      "editar",
      { objeto: "Correção" },
      "Motivo correto",
      REQUEST,
    );
    await expect(executarComando({ ...ctx, id: ORG }, comando)).rejects.toMatchObject({
      tipo: "invalido",
    });
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it.each([{ objeto: {} }, { valor_global: "1000" }, { objeto: null }, { inicio: "ontem" }])(
    "nega tipo de campo incompatível",
    (patch) => {
      expect(() => montarComando(ctx, 3, "editar", patch, "Motivo correto", REQUEST)).toThrow(
        ErroCadastro,
      );
    },
  );
  it("consulta entidade e contexto exatos", async () => {
    expect((await obterCadastro(ctx)).registro.id).toBe(ID);
    expect(m.rpc).toHaveBeenCalledWith("obter_cadastro_operacional_v1", {
      p_id_organizacao: ORG,
      p_entidade: "contratos",
      p_id: ID,
    });
  });
  it.each([
    cadastro({ schema_versao: "inventado" }),
    cadastro({ entidade: "organizacoes" }),
    cadastro({ registro: { ...registro, id_organizacao: ID } }),
    cadastro({ registro: { ...registro, id: ORG } }),
    cadastro({ registro: { ...registro, versao_registro: 0 } }),
    cadastro({ pode_editar: "true" }),
    cadastro({ exclusao_permitida: true }),
    cadastro({ transicoes: [{ situacao: "inventada", rotulo: "Outra" }] }),
    cadastro({ registro: { ...registro, valor_global: "mil" } }),
    cadastro({ registro: { ...registro, situacao: "inventada" } }),
  ])("nega resposta incompatível sem inventar capacidade", async (data) => {
    m.rpc.mockResolvedValue(ok(data));
    await expect(obterCadastro(ctx)).rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("comando envia apenas patch permitido, contexto, versão, motivo e UUID", () => {
    const c = montarComando(
      ctx,
      3,
      "editar",
      { objeto: "Objeto revisto" },
      "Correção justificada",
      REQUEST,
    );
    expect(c.nome).toBe("atualizar_contrato_v1");
    expect(c.args).toEqual({
      p_id_organizacao: ORG,
      p_id_contrato: ID,
      p_versao_esperada: 3,
      p_alteracoes: { objeto: "Objeto revisto" },
      p_motivo: "Correção justificada",
      p_request_id: REQUEST,
    });
  });
  it.each([
    { id_organizacao: ID },
    { situacao: "encerrado" },
    { versao_registro: 99 },
    { id_contratante: ID },
    {},
  ])("nega campos protegidos ou patch vazio", (patch) => {
    expect(() => montarComando(ctx, 3, "editar", patch, "Correção justificada", REQUEST)).toThrow(
      ErroCadastro,
    );
  });
  it.each(["", "ab", "x".repeat(2001)])("motivo obrigatório limitado", (motivo) => {
    expect(() => montarComando(ctx, 3, "editar", { objeto: "X" }, motivo, REQUEST)).toThrow(
      ErroCadastro,
    );
  });
  it("organização não envia id de contrato", () => {
    const c = montarComando(
      { ...ctx, entidade: "organizacoes", id: ORG },
      1,
      "situacao",
      { situacao: "inativa" },
      "Desativação temporária",
      REQUEST,
    );
    expect(c.nome).toBe("alterar_situacao_organizacao_v1");
    expect(c.args).not.toHaveProperty("p_id_contrato");
    expect(c.args["p_situacao"]).toBe("inativa");
  });
  it("nega alvo organizacional divergente antes da API", async () => {
    await expect(obterCadastro({ ...ctx, entidade: "organizacoes" })).rejects.toMatchObject({
      tipo: "invalido",
    });
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it.each([
    [403, "42501", "negado"],
    [409, "PT409", "conflito"],
    [422, "PT422", "invalido"],
    [503, "XX000", "incerto"],
  ])("classifica erro %s", async (status, code, tipo) => {
    m.rpc.mockResolvedValue({ data: null, status, error: { code } });
    const c = montarComando(
      ctx,
      3,
      "editar",
      { objeto: "Objeto revisto" },
      "Correção justificada",
      REQUEST,
    );
    await expect(executarComando(ctx, c)).rejects.toMatchObject({ tipo });
  });
  it("confirma resultado da mutação e UUID", async () => {
    m.rpc.mockResolvedValue(ok(resposta()));
    const c = montarComando(
      ctx,
      3,
      "editar",
      { objeto: "Objeto revisto" },
      "Correção justificada",
      REQUEST,
    );
    expect((await executarComando(ctx, c)).registro.versao_registro).toBe(4);
    m.rpc.mockResolvedValue(ok(resposta({ request_id: ORG })));
    await expect(executarComando(ctx, c)).rejects.toMatchObject({ tipo: "incerto" });
  });
});
describe("gestão pela interface", () => {
  it("confirma edição uma vez, atualiza versão e notifica a tela", async () => {
    const alterado = vi.fn();
    m.rpc.mockImplementation((nome, args) =>
      Promise.resolve(
        ok(
          nome === "obter_cadastro_operacional_v1"
            ? cadastro()
            : resposta({ request_id: args.p_request_id }),
        ),
      ),
    );
    montar(alterado);
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    const confirmar = screen.getByRole("button", { name: "Confirmar edição" });
    fireEvent.click(confirmar);
    fireEvent.click(confirmar);
    await screen.findByText("Alteração confirmada e registrada na auditoria.");
    expect(m.rpc).toHaveBeenCalledTimes(2);
    expect(alterado).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Versão 4")).toBeInTheDocument();
  });
  it("cancelar confirmação conserva rascunho e não envia comando", async () => {
    montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Meu rascunho" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar confirmação" }));
    expect(screen.getByLabelText("Objeto")).toHaveValue("Meu rascunho");
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });
  it("resposta tardia de escrita não notifica tela desmontada", async () => {
    let concluir: ((valor: unknown) => void) | undefined;
    const alterado = vi.fn();
    m.rpc.mockImplementation((nome) =>
      nome === "obter_cadastro_operacional_v1"
        ? Promise.resolve(ok(cadastro()))
        : new Promise((resolve) => {
            concluir = resolve;
          }),
    );
    const tela = montar(alterado);
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edição" }));
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(2));
    const request = m.rpc.mock.calls.at(-1)?.[1].p_request_id;
    tela.unmount();
    await act(async () => {
      concluir?.(ok(resposta({ request_id: request })));
    });
    expect(alterado).not.toHaveBeenCalled();
  });
  it("mudança de situação conserva os campos ainda não enviados", async () => {
    m.rpc.mockImplementation((nome, args) =>
      Promise.resolve(
        ok(
          nome === "obter_cadastro_operacional_v1"
            ? cadastro()
            : resposta({
                registro: { ...registro, situacao: "encerrado", versao_registro: 4 },
                transicoes: [],
                request_id: args.p_request_id,
              }),
        ),
      ),
    );
    montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), {
      target: { value: "Rascunho não enviado" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Encerramento justificado" },
    });
    fireEvent.change(screen.getByLabelText("Nova situação"), { target: { value: "encerrado" } });
    fireEvent.click(screen.getByRole("button", { name: "Revisar situação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar mudança de situação" }));
    await screen.findByText("Versão 4");
    expect(screen.getByLabelText("Objeto")).toHaveValue("Rascunho não enviado");
    expect(m.rpc.mock.calls.at(-1)?.[0]).toBe("alterar_situacao_contrato_v1");
    expect(m.rpc.mock.calls.at(-1)?.[1]).not.toHaveProperty("p_alteracoes");
  });
  it("não consulta nem altera até abrir; edição exige motivo e confirmação", async () => {
    montar();
    expect(m.rpc).not.toHaveBeenCalled();
    await abrir();
    expect(screen.getByText(/Preservar histórico/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revisar edição" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Confirmar edição" })).toBeInTheDocument();
  });
  it("permissão do servidor falsa não oferece mutações", async () => {
    m.rpc.mockResolvedValue(ok(cadastro({ pode_editar: false, transicoes: [] })));
    montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar e gerenciar contrato" }));
    await screen.findByText("Você não tem permissão para alterar este cadastro.");
    expect(screen.queryByLabelText("Motivo")).not.toBeInTheDocument();
  });
  it("só mostra transições fornecidas pelo backend", async () => {
    montar();
    await abrir();
    expect(screen.getByRole("option", { name: "encerrado" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "suspenso" })).not.toBeInTheDocument();
  });
  it("não repete automaticamente escrita incerta e conserva a chave no retry explícito", async () => {
    montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    m.rpc.mockResolvedValue({ data: null, error: { code: "XX000" }, status: 503 });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edição" }));
    await screen.findByRole("button", { name: "Repetir mesmo comando" });
    const first = m.rpc.mock.calls.at(-1);
    expect(m.rpc).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Repetir mesmo comando" }));
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(3));
    expect(m.rpc.mock.calls.at(-1)).toEqual(first);
  });
  it("conflito preserva rascunho e exige revisão com a versão nova", async () => {
    montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Meu rascunho" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "PT409" }, status: 409 });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edição" }));
    await screen.findByRole("button", { name: "Recarregar versão e revisar rascunho" });
    expect(screen.getByLabelText("Objeto")).toHaveValue("Meu rascunho");
    m.rpc.mockResolvedValueOnce(
      ok(
        cadastro({
          registro: {
            ...registro,
            numero: "Número remoto novo",
            objeto: "Objeto remoto novo",
            versao_registro: 4,
          },
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Recarregar versão e revisar rascunho" }));
    await screen.findByText("Versão 4");
    expect(screen.getByLabelText("Objeto")).toHaveValue("Meu rascunho");
    expect(screen.getByLabelText("Número")).toHaveValue("Número remoto novo");
    expect(screen.getByText("No servidor: Objeto remoto novo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Usar valor do servidor em Objeto" }));
    expect(screen.getByLabelText("Objeto")).toHaveValue("Objeto remoto novo");
  });
  it("replay confirmado reconcilia versão atual e não regride cache", async () => {
    const tela = montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "XX000" }, status: 503 });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edição" }));
    await screen.findByRole("button", { name: "Repetir mesmo comando" });
    const request = m.rpc.mock.calls.at(-1)?.[1].p_request_id;
    const atual = cadastro({
      registro: { ...registro, objeto: "Edição remota posterior", versao_registro: 5 },
    });
    const chave = ["cadastro-operacional", ctx.idUsuario, ORG, "contratos", ID];
    await act(async () => {
      tela.qc.setQueryData(chave, atual);
    });
    m.rpc
      .mockResolvedValueOnce(ok(resposta({ request_id: request })))
      .mockResolvedValueOnce(ok(atual));
    fireEvent.click(screen.getByRole("button", { name: "Repetir mesmo comando" }));
    await screen.findByText("Versão 5");
    expect(screen.getByLabelText("Objeto")).toHaveValue("Edição remota posterior");
    expect(tela.qc.getQueryData(chave)).toEqual(atual);
    expect(m.rpc).toHaveBeenCalledTimes(4);
  });
  it("recibo confirmado não vira resultado incerto se a leitura posterior falha", async () => {
    montar();
    await abrir();
    fireEvent.change(screen.getByLabelText("Objeto"), { target: { value: "Objeto revisto" } });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Correção justificada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar edição" }));
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "XX000" }, status: 503 });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edição" }));
    await screen.findByRole("button", { name: "Repetir mesmo comando" });
    const request = m.rpc.mock.calls.at(-1)?.[1].p_request_id;
    m.rpc
      .mockResolvedValueOnce(ok(resposta({ request_id: request })))
      .mockResolvedValueOnce({ data: null, error: { code: "XX000" }, status: 503 });
    fireEvent.click(screen.getByRole("button", { name: "Repetir mesmo comando" }));
    await screen.findByText(/O comando foi confirmado, mas a leitura atual ficou indisponível/);
    expect(screen.getByText("Alteração confirmada e registrada na auditoria.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Repetir mesmo comando" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revisar edição" })).toBeDisabled();
  });
});

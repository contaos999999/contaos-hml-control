import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const m = vi.hoisted(() => ({ rpc: vi.fn(), listas: vi.fn(), auth: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: m.rpc,
    auth: { onAuthStateChange: m.auth },
  },
}));
vi.mock("@/lib/contratos/regrasDados", () => ({ listarListas: m.listas }));
import {
  obterLista,
  montarComandoLista,
  executarComandoLista,
  type ContextoLista,
} from "@/lib/contratos/listaOperacionalDados";
import { GerenciarListas } from "@/components/contratos/GerenciarListas";
const O = "11111111-1111-4111-8111-111111111111";
const C = "22222222-2222-4222-8222-222222222222";
const L = "33333333-3333-4333-8333-333333333333";
const V = "44444444-4444-4444-8444-444444444444";
const R = "55555555-5555-4555-8555-555555555555";
const ctx: ContextoLista = { idUsuario: "user-a", idOrganizacao: O, idContrato: C };
const acoes = {
  criar_lista: true,
  editar_lista: true,
  criar_versao: true,
  editar_vigencia_rascunho: true,
  criar_item: true,
  editar_item: true,
  remover_item: true,
  publicar_versao: true,
  encerrar_vigencia: true,
  alterar_situacao: true,
  descartar_rascunho: true,
};
const lista = {
  id: L,
  id_organizacao: O,
  id_contrato: C,
  nome: "Documentação",
  descricao: null,
  situacao: "ativa",
  versao_registro: 3,
  versao_atual: 1,
};
const versao = {
  id: V,
  id_lista: L,
  id_organizacao: O,
  id_contrato: C,
  numero_versao: 1,
  situacao: "rascunho",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
};
const item = {
  id: R,
  id_organizacao: O,
  id_contrato: C,
  id_versao_lista: V,
  codigo: "I01",
  descricao: "Documento mensal",
  categoria: null,
  obrigatorio: true,
  aplicavel: true,
  impeditivo: false,
  criticidade: "media",
  id_fonte_versao: null,
  regra_validacao: {},
  ordem: 0,
  pode_remover: true,
};
const modelo = (over: Record<string, unknown> = {}) => ({
  schema_versao: "crud-lista-v1",
  id_organizacao: O,
  id_contrato: C,
  lista,
  versao,
  versoes: [versao],
  itens: [item],
  total_versoes: 1,
  total_itens: 1,
  pagina_versoes: 0,
  pagina_itens: 0,
  acoes,
  exclusao_lista_permitida: false,
  motivo_retencao: "Histórico preservado.",
  vigencia_fim_minima: null,
  ...over,
});
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const recibo = (args: Record<string, unknown>) => ({
  schema_versao: "crud-lista-v1",
  acao: args["p_acao"],
  id_organizacao: O,
  id_contrato: C,
  lista: { ...lista, versao_registro: 4 },
  id_versao: V,
  id_item: R,
  request_id: args["p_request_id"],
  evento_id: R,
});
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  m.rpc.mockImplementation((nome: string, args: Record<string, unknown>) =>
    Promise.resolve(
      ok(
        nome === "obter_lista_operacional_v1"
          ? modelo({
              pagina_versoes: args["p_pagina_versoes"],
              pagina_itens: args["p_pagina_itens"],
            })
          : recibo(args),
      ),
    ),
  );
  m.listas.mockResolvedValue({ itens: [lista], total: 1 });
});
describe("contrato canônico de listas", () => {
  it("consulta usa IDs e páginas do contexto exato", async () => {
    expect((await obterLista(ctx, L, V, 1, 2)).lista?.id).toBe(L);
    expect(m.rpc).toHaveBeenCalledWith(
      "obter_lista_operacional_v1",
      expect.objectContaining({
        p_id_organizacao: O,
        p_id_contrato: C,
        p_id_lista: L,
        p_id_versao: V,
        p_pagina_versoes: 1,
        p_pagina_itens: 2,
      }),
    );
  });
  it.each(["id_organizacao", "id_contrato"])("recusa retorno cruzado %s", async (campo) => {
    m.rpc.mockResolvedValue(ok(modelo({ [campo]: R })));
    await expect(obterLista(ctx, L)).rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("recusa versão vinculada a outra lista", async () => {
    m.rpc.mockResolvedValue(ok(modelo({ versao: { ...versao, id_lista: R } })));
    await expect(obterLista(ctx, L)).rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("recusa capacidade textual em vez de booleana", async () => {
    m.rpc.mockResolvedValue(ok(modelo({ acoes: { ...acoes, publicar_versao: "true" } })));
    await expect(obterLista(ctx, L)).rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("recusa item de outra versão", async () => {
    m.rpc.mockResolvedValue(ok(modelo({ itens: [{ ...item, id_versao_lista: R }] })));
    await expect(obterLista(ctx, L)).rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("recusa alteração de campo protegido antes de RPC", () => {
    expect(() =>
      montarComandoLista(ctx, L, 3, "editar_lista", { id_organizacao: R }, "Correção", R),
    ).toThrow();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("recusa motivo vazio antes de RPC", () => {
    expect(() => montarComandoLista(ctx, L, 3, "editar_lista", { nome: "Novo" }, "", R)).toThrow();
  });
  it("criar lista é a única operação sem lista e versão esperada", () => {
    expect(
      montarComandoLista(ctx, null, null, "criar_lista", { nome: "Nova" }, "Cadastro", R)
        .p_id_lista,
    ).toBeNull();
    expect(() =>
      montarComandoLista(ctx, null, null, "editar_lista", { nome: "Nova" }, "Cadastro", R),
    ).toThrow();
  });
  it.each([
    [403, "negado"],
    [409, "conflito"],
    [422, "invalido"],
  ])("traduz HTTP %s sem detalhes internos", async (status, tipo) => {
    m.rpc.mockResolvedValue({ data: null, error: { message: "private detail" }, status });
    await expect(obterLista(ctx, L)).rejects.toMatchObject({ tipo });
  });
  it("valida recibo e mantém UUID do comando para replay", async () => {
    const cmd = montarComandoLista(ctx, L, 3, "editar_lista", { nome: "Novo" }, "Correção", R);
    await executarComandoLista(ctx, cmd);
    await executarComandoLista(ctx, cmd);
    expect(m.rpc.mock.calls.every(([, args]) => args["p_request_id"] === R)).toBe(true);
  });
  it("recusa recibo de outra ação como resultado incerto", async () => {
    m.rpc.mockResolvedValue(
      ok({ ...recibo({ p_acao: "editar_lista", p_request_id: R }), acao: "alterar_situacao" }),
    );
    await expect(
      executarComandoLista(
        ctx,
        montarComandoLista(ctx, L, 3, "editar_lista", { nome: "Novo" }, "Correção", R),
      ),
    ).rejects.toMatchObject({ tipo: "incerto" });
  });
});
function abrir() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={qc}>
      <GerenciarListas contexto={ctx} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Gerenciar listas" }));
  return { qc, ...view };
}
describe("gestão de listas na interface", () => {
  it("abre gestão com versões e itens reais retornados", async () => {
    abrir();
    await screen.findByText("Histórico preservado.");
    expect(screen.getByRole("button", { name: "Criar lista" })).toBeInTheDocument();
  });
  it("não oferece publicação quando capacidade é negada", async () => {
    m.rpc.mockResolvedValue(ok(modelo({ acoes: { ...acoes, publicar_versao: false } })));
    abrir();
    await screen.findByText("Histórico preservado.");
    expect(screen.queryByRole("button", { name: "Publicar versão" })).not.toBeInTheDocument();
  });
  it("exige motivo e confirmação antes da mutação", async () => {
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Editar lista" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Lista revisada" } });
    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Revisão autorizada" } });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    expect(m.rpc.mock.calls.filter(([n]) => n === "executar_comando_lista_v1")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    await waitFor(() =>
      expect(m.rpc).toHaveBeenCalledWith(
        "executar_comando_lista_v1",
        expect.objectContaining({
          p_acao: "editar_lista",
          p_versao_esperada: 3,
          p_motivo: "Revisão autorizada",
          p_payload: { nome: "Lista revisada", descricao: null },
        }),
      ),
    );
  });
  it("não remove item referenciado mesmo com capacidade geral", async () => {
    m.rpc.mockResolvedValue(ok(modelo({ itens: [{ ...item, pode_remover: false }] })));
    abrir();
    await screen.findByText("Histórico preservado.");
    expect(screen.queryByRole("button", { name: "Remover item I01" })).not.toBeInTheDocument();
  });
});

describe("comandos e limites adicionais de listas", () => {
  it.each([
    ["criar_versao", { id_versao_origem: V, vigencia_inicio: "2027-01-01", vigencia_fim: null }],
    ["editar_vigencia_rascunho", { id_versao: V, vigencia_inicio: "2027-01-01" }],
    [
      "salvar_item",
      { id_versao: V, id_item: null, codigo: "X", descricao: "Novo item", regra_validacao: {} },
    ],
    ["remover_item", { id_versao: V, id_item: R }],
    ["publicar_versao", { id_versao: V }],
    ["encerrar_vigencia", { id_versao: V, vigencia_fim: "2027-12-31" }],
    ["alterar_situacao", { situacao: "inativa" }],
    ["descartar_rascunho", { id_versao: V }],
  ] as const)("envia %s somente pela RPC canônica", async (acao, payload) => {
    const cmd = montarComandoLista(ctx, L, 3, acao, payload, "Operação autorizada", R);
    await executarComandoLista(ctx, cmd);
    expect(m.rpc).toHaveBeenCalledWith(
      "executar_comando_lista_v1",
      expect.objectContaining({ p_acao: acao, p_payload: payload, p_request_id: R }),
    );
  });
  it("não aceita exclusão de cabeçalho ou ação arbitrária", () => {
    expect(() =>
      montarComandoLista(ctx, L, 3, "excluir_lista" as never, {}, "Remoção", R),
    ).toThrow();
  });
  it.each([true, [], "{}", null])("recusa regra JSON que não seja objeto: %s", (regra) => {
    expect(() =>
      montarComandoLista(
        ctx,
        L,
        3,
        "salvar_item",
        { id_versao: V, regra_validacao: regra },
        "Correção",
        R,
      ),
    ).toThrow();
  });
  it("recusa versão esperada sem número inteiro", () => {
    expect(() =>
      montarComandoLista(ctx, L, 1.5, "editar_lista", { nome: "Novo" }, "Correção", R),
    ).toThrow();
  });
  it("recusa recibo com revisão incompatível", async () => {
    m.rpc.mockResolvedValue(
      ok({
        ...recibo({ p_acao: "editar_lista", p_request_id: R }),
        lista: { ...lista, versao_registro: 8 },
      }),
    );
    await expect(
      executarComandoLista(
        ctx,
        montarComandoLista(ctx, L, 3, "editar_lista", { nome: "Novo" }, "Correção", R),
      ),
    ).rejects.toMatchObject({ tipo: "incerto" });
  });
  it("timeout exige repetição explícita com o mesmo identificador", async () => {
    let numero = 0;
    m.rpc.mockImplementation((nome: string, args: Record<string, unknown>) => {
      if (nome === "obter_lista_operacional_v1") return Promise.resolve(ok(modelo()));
      if (++numero === 1) return Promise.reject(new Error("network timeout"));
      return Promise.resolve(ok(recibo(args)));
    });
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Publicar versão" }));
    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Publicação aprovada" } });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    const repetir = await screen.findByRole("button", {
      name: "Repetir exatamente o mesmo comando",
    });
    expect(numero).toBe(1);
    fireEvent.click(repetir);
    await waitFor(() => expect(numero).toBe(2));
    const envios = m.rpc.mock.calls.filter(([nome]) => nome === "executar_comando_lista_v1");
    expect(envios[0]?.[1]).toEqual(envios[1]?.[1]);
  });
  it("conflito preserva texto e permite recarregar antes de revisar", async () => {
    m.rpc.mockImplementation((nome: string) =>
      Promise.resolve(
        nome === "obter_lista_operacional_v1"
          ? ok(modelo())
          : { data: null, error: { code: "PT409" }, status: 409 },
      ),
    );
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Editar lista" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Meu rascunho" } });
    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Revisão autorizada" } });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    await screen.findByRole("button", { name: "Atualizar dados e revisar rascunho" });
    expect(screen.getByLabelText("Nome")).toHaveValue("Meu rascunho");
  });
});

describe("recuperação e concorrência da interface", () => {
  it("refetch em segundo plano não troca a revisão do rascunho", async () => {
    const { qc } = abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Editar lista" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Meu rascunho" } });
    fireEvent.change(screen.getByLabelText("Motivo"), { target: { value: "Revisão autorizada" } });
    m.rpc.mockImplementation((nome: string, args: Record<string, unknown>) =>
      Promise.resolve(
        ok(
          nome === "obter_lista_operacional_v1"
            ? modelo({ lista: { ...lista, versao_registro: 4 } })
            : recibo(args),
        ),
      ),
    );
    await act(async () => {
      await qc.invalidateQueries();
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    await waitFor(() =>
      expect(m.rpc).toHaveBeenCalledWith(
        "executar_comando_lista_v1",
        expect.objectContaining({ p_versao_esperada: 3 }),
      ),
    );
  });
  it("conferência mantém comando pendente quando a leitura falha", async () => {
    m.rpc.mockImplementation((nome: string) =>
      nome === "obter_lista_operacional_v1"
        ? Promise.resolve(ok(modelo()))
        : Promise.reject(new Error("timeout")),
    );
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Publicar versão" }));
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Publicação autorizada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    const conferir = await screen.findByRole("button", {
      name: "Conferir resultado antes de nova operação",
    });
    m.rpc.mockRejectedValue(new Error("offline"));
    fireEvent.click(conferir);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Repetir exatamente o mesmo comando" }),
      ).toBeEnabled(),
    );
    expect(screen.getByRole("button", { name: "Fechar gestão" })).toBeDisabled();
  });
  it("logout interrompe o formulário e descarta resultado tardio", async () => {
    let concluir!: (r: ReturnType<typeof ok>) => void;
    m.rpc.mockImplementation((nome: string) =>
      nome === "obter_lista_operacional_v1"
        ? Promise.resolve(ok(modelo()))
        : new Promise((resolve) => {
            concluir = resolve;
          }),
    );
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Publicar versão" }));
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Publicação autorizada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar operação" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar operação" }));
    const callback = m.auth.mock.calls[0]?.[0] as (e: string, s: unknown) => void;
    act(() => callback("SIGNED_OUT", null));
    expect(screen.getByRole("alert")).toHaveTextContent("Sua sessão mudou");
    await act(async () => {
      concluir(ok(recibo({ p_acao: "publicar_versao", p_request_id: R })));
    });
    expect(screen.queryByText(/Operação confirmada/)).not.toBeInTheDocument();
  });
  it("paginação de itens solicita a página exata", async () => {
    m.rpc.mockImplementation((_nome: string, args: Record<string, unknown>) =>
      Promise.resolve(ok(modelo({ total_itens: 26, pagina_itens: args["p_pagina_itens"] }))),
    );
    abrir();
    await screen.findByText("Histórico preservado.");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página de itens" }));
    await waitFor(() =>
      expect(m.rpc).toHaveBeenCalledWith(
        "obter_lista_operacional_v1",
        expect.objectContaining({ p_pagina_itens: 1 }),
      ),
    );
  });
});

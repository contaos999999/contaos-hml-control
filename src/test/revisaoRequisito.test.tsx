import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const m = vi.hoisted(() => ({
  rpc: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  authChange: null as null | ((e: string, s: unknown) => void),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: m.rpc,
    from: m.from,
    auth: {
      getUser: m.getUser,
      onAuthStateChange: (cb: typeof m.authChange) => {
        m.authChange = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
  },
}));
import { RevisaoRequisito } from "@/components/competencias/RevisaoRequisito";
import {
  montarRevisao,
  obterContextoRevisao,
  parseContextoRevisao,
  registrarRevisao,
  listarEvidencias,
} from "@/lib/competencias/revisaoRequisitoDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
const ORG = "22222222-2222-4222-8222-222222222222";
const CT = "33333333-3333-4333-8333-333333333333";
const C = "44444444-4444-4444-8444-444444444444";
const R = "55555555-5555-4555-8555-555555555555";
const EX = "66666666-6666-4666-8666-666666666666";
const KEY = "77777777-7777-4777-8777-777777777777";
const VD = "88888888-8888-4888-8888-888888888888";
const NEW = "99999999-9999-4999-8999-999999999999";
const GET = "obter_contexto_revisao_v117";
const WRITE = "registrar_revisao_requisito_v117";
const context = () => ({
  schema_versao: "revisao-v117",
  id_competencia: C,
  id_requisito: R,
  id_organizacao: ORG,
  id_contrato: CT,
  id_execucao_esperada: EX,
  id_resultado_esperado: null,
  hash_esperado: "a".repeat(64),
  pode_revisar: true,
});
const input = () => ({
  resultado: "conforme",
  justificativa: "Conferido com a fonte",
  fundamento: "",
  evidencias: [],
});
const parsed = () => parseContextoRevisao(context(), C, R, ORG)!;
function rawEvidence(id = VD) {
  return {
    id,
    numero_versao: 1,
    id_organizacao: ORG,
    id_contrato: CT,
    documentos_competencia: { id_competencia: C, titulo: "Folha", situacao: "ativo" },
    arquivos: { nome_original: "folha.pdf", status_seguranca: "aprovado" },
  };
}
const writes = () => m.rpc.mock.calls.filter((x) => x[0] === WRITE);
beforeEach(() => {
  vi.clearAllMocks();
  m.authChange = null;
  sessionStorage.clear();
  definirPreferenciaOrganizacao("actor", ORG);
  m.getUser.mockResolvedValue({ data: { user: { id: "actor" } }, error: null });
  m.rpc.mockImplementation((name: string, a: Record<string, unknown>) =>
    Promise.resolve({
      data:
        name === GET
          ? context()
          : {
              schema_versao: "revisao-v117",
              request_id: a["p_request_id"],
              id_competencia: C,
              id_requisito: R,
              id_execucao: NEW,
              id_resultado: NEW,
            },
      error: null,
    }),
  );
  const q = { eq: vi.fn(), order: vi.fn(), range: vi.fn() };
  q.eq.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.range.mockResolvedValue({ data: [rawEvidence()], count: 30, error: null });
  m.from.mockReturnValue({ select: () => q });
});
describe("revisão V117 adaptador", () => {
  it("recibo não pode reapresentar o resultado anterior como novo", async () => {
    const c = montarRevisao({ ...parsed(), id_resultado_esperado: VD }, input(), KEY);
    m.rpc.mockResolvedValue({
      data: {
        schema_versao: "revisao-v117",
        request_id: KEY,
        id_competencia: C,
        id_requisito: R,
        id_execucao: NEW,
        id_resultado: VD,
      },
      error: null,
    });
    await expect(registrarRevisao(c)).rejects.toMatchObject({ tipo: "incerto" });
  });

  it("aceita contexto exato e resultado anterior nulo", () => expect(parsed()).not.toBeNull());
  it.each([
    "schema_versao",
    "id_competencia",
    "id_requisito",
    "id_organizacao",
    "id_contrato",
    "hash_esperado",
    "pode_revisar",
  ])("nega %s inconsistente", (k) =>
    expect(parseContextoRevisao({ ...context(), [k]: "forjado" }, C, R, ORG)).toBeNull(),
  );
  it("capacidade true sem execução não é aceita", () =>
    expect(
      parseContextoRevisao({ ...context(), id_execucao_esperada: null }, C, R, ORG),
    ).toBeNull());
  it("capacidade false é retornada sem inventar permissão", () =>
    expect(
      parseContextoRevisao(
        { ...context(), pode_revisar: false, id_execucao_esperada: null },
        C,
        R,
        ORG,
      )?.pode_revisar,
    ).toBe(false));
  it("consulta apenas RPC canônica", async () => {
    await obterContextoRevisao(C, R, ORG);
    expect(m.rpc).toHaveBeenCalledWith(GET, { p_id_competencia: C, p_id_requisito: R });
  });
  it("UUID inválido não faz request", async () => {
    await expect(obterContextoRevisao("bad", R, ORG)).rejects.toThrow();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it.each(["conforme", "nao_conforme", "inconclusivo", "pendente", "em_analise"])(
    "monta resultado %s sem status crítico",
    (resultado) => {
      const c = montarRevisao(parsed(), { ...input(), resultado }, KEY);
      expect(c.p_resultado).toBe(resultado);
      expect(c.p_id_execucao_esperada).toBe(EX);
      expect(c.p_request_id).toBe(KEY);
    },
  );
  it.each([
    { resultado: "liberado" },
    { justificativa: "x" },
    { justificativa: "x".repeat(2001) },
    { fundamento: "x".repeat(4001) },
    { resultado: "nao_aplicavel" },
    { evidencias: [{ id_versao_documento: VD, pagina: 0 }] },
    { evidencias: [{ id_versao_documento: VD, hash: "fake" }] },
  ])("nega entrada fora do contrato %j", (delta) =>
    expect(() => montarRevisao(parsed(), { ...input(), ...delta }, KEY)).toThrow(),
  );
  it("N/A válido exige fundamento e evidência", () =>
    expect(
      montarRevisao(
        parsed(),
        {
          ...input(),
          resultado: "nao_aplicavel",
          fundamento: "Fonte formal",
          evidencias: [{ id_versao_documento: VD, pagina: 1, trecho: "Item" }],
        },
        KEY,
      ).p_evidencias,
    ).toHaveLength(1));
  it("nega criar intenção sem capacidade", () =>
    expect(() => montarRevisao({ ...parsed(), pode_revisar: false }, input(), KEY)).toThrow());
  it("valida recibo por intenção e contexto", async () => {
    const c = montarRevisao(parsed(), input(), KEY);
    m.rpc.mockResolvedValue({
      data: {
        schema_versao: "revisao-v117",
        request_id: EX,
        id_competencia: C,
        id_requisito: R,
        id_execucao: NEW,
        id_resultado: NEW,
      },
      error: null,
    });
    await expect(registrarRevisao(c)).rejects.toMatchObject({ tipo: "incerto" });
  });
  it.each([
    [403, "negado"],
    [409, "conflito"],
    [422, "invalido"],
    [500, "incerto"],
  ])("classifica HTTP%s sem mensagem interna", async (status, tipo) => {
    m.rpc.mockResolvedValue({ data: null, error: { message: "raw private" }, status });
    await expect(registrarRevisao(montarRevisao(parsed(), input(), KEY))).rejects.toMatchObject({
      tipo,
    });
  });
  it("paginação é server-side de25", async () => {
    const c = parsed();
    const r = await listarEvidencias(c, 1);
    expect(r.total).toBe(30);
    expect(m.from).toHaveBeenCalledWith("versoes_documento");
    const q = m.from.mock.results[0]!.value.select();
    expect(q.range).toHaveBeenCalledWith(25, 49);
    expect(q.eq).toHaveBeenCalledWith("documentos_competencia.id_competencia", C);
  });
  it("nega evidência cruzada ou arquivo não aprovado", async () => {
    const q = m.from().select();
    q.range.mockResolvedValue({
      data: [{ ...rawEvidence(), id_organizacao: CT }],
      count: 1,
      error: null,
    });
    await expect(listarEvidencias(parsed(), 0)).rejects.toThrow();
  });
});
async function open() {
  fireEvent.click(screen.getByRole("button", { name: "Revisar resultado" }));
  await screen.findByLabelText("Resultado da revisão");
}
function mount(onRevisado = vi.fn()) {
  return render(
    <RevisaoRequisito
      idCompetencia={C}
      idRequisito={R}
      onRevisado={onRevisado}
      onOcupado={() => {}}
    />,
  );
}
function fill() {
  fireEvent.change(screen.getByLabelText("Resultado da revisão"), {
    target: { value: "conforme" },
  });
  fireEvent.change(screen.getByLabelText("Justificativa da revisão"), {
    target: { value: "Conferido com a fonte" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Revisar e confirmar" }));
}
describe("revisão V117 interface real com fronteira Supabase simulada", () => {
  it("mudança de sessão durante getUser inicial descarta a abertura anterior", async () => {
    let release: (x: unknown) => void = () => {};
    m.getUser.mockImplementation(
      () =>
        new Promise((r) => {
          release = r;
        }),
    );
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Revisar resultado" }));
    await act(async () => {
      m.authChange?.("SIGNED_IN", { user: { id: "other" } });
    });
    await act(async () => {
      release({ data: { user: { id: "actor" } }, error: null });
    });
    expect(screen.queryByLabelText("Resultado da revisão")).toBeNull();
    expect(m.rpc).not.toHaveBeenCalled();
    await screen.findByText(/contexto de acesso mudou/);
  });
  it("não solicita dados antes da intenção do usuário", () => {
    mount();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("nega formulário sem capacidade efetiva", async () => {
    m.rpc.mockResolvedValue({ data: { ...context(), pode_revisar: false }, error: null });
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Revisar resultado" }));
    await screen.findByText(/Revisão indisponível/);
    expect(screen.queryByLabelText("Resultado da revisão")).toBeNull();
    expect(writes()).toHaveLength(0);
  });
  it("confirmação e duplo clique produzem uma escrita e recarga", async () => {
    const cb = vi.fn();
    mount(cb);
    await open();
    fill();
    expect(writes()).toHaveLength(0);
    const b = screen.getByRole("button", { name: "Confirmar revisão" });
    fireEvent.click(b);
    fireEvent.click(b);
    await waitFor(() => expect(cb).toHaveBeenCalledTimes(1));
    expect(writes()).toHaveLength(1);
    await screen.findByText(/Revisão registrada/);
  });
  it("timeout congela intenção; replay explícito usa UUID e payload originais", async () => {
    let n = 0;
    m.rpc.mockImplementation((name: string, a: Record<string, unknown>) =>
      name === GET
        ? Promise.resolve({ data: context(), error: null })
        : ++n === 1
          ? Promise.reject(new Error("timeout"))
          : Promise.resolve({
              data: {
                schema_versao: "revisao-v117",
                request_id: a["p_request_id"],
                id_competencia: C,
                id_requisito: R,
                id_execucao: NEW,
                id_resultado: NEW,
              },
              error: null,
            }),
    );
    mount();
    await open();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar revisão" }));
    await screen.findByText(/Resultado não confirmado/);
    expect(screen.getByLabelText("Justificativa da revisão")).toBeDisabled();
    expect(writes()).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Repetir mesma solicitação" }));
    await screen.findByText(/Revisão registrada/);
    expect(writes()).toHaveLength(2);
    expect(writes()[0]![1]).toEqual(writes()[1]![1]);
  });
  it("409 preserva rascunho e exige atualização explícita", async () => {
    m.rpc.mockImplementation((n: string) =>
      Promise.resolve(
        n === GET
          ? { data: context(), error: null }
          : { data: null, error: { code: "PT409" }, status: 409 },
      ),
    );
    mount();
    await open();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar revisão" }));
    await screen.findByText(/A análise ou o contexto foi alterado/);
    expect(screen.getByLabelText("Justificativa da revisão")).toHaveValue("Conferido com a fonte");
    expect(screen.getByRole("button", { name: "Recarregar contexto" })).toBeEnabled();
    expect(writes()).toHaveLength(1);
  });
  it("troca de organização durante comando ignora sucesso tardio", async () => {
    let release: (x: unknown) => void = () => {};
    m.rpc.mockImplementation((n: string) =>
      n === GET
        ? Promise.resolve({ data: context(), error: null })
        : new Promise((r) => {
            release = r;
          }),
    );
    const cb = vi.fn();
    mount(cb);
    await open();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar revisão" }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    await act(async () => {
      definirPreferenciaOrganizacao("actor", CT);
    });
    await act(async () => {
      release({ data: {}, error: null });
    });
    expect(cb).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Resultado da revisão")).toBeNull();
    await screen.findByText(/contexto de acesso mudou/);
  });
  it("seleção é preservada após trocar página", async () => {
    mount();
    await open();
    await screen.findByLabelText(/Selecionar folha.pdf/);
    fireEvent.click(screen.getByLabelText(/Selecionar folha.pdf/));
    fireEvent.click(
      screen.getByRole("button", { name: "Próxima página de evidências disponíveis" }),
    );
    await waitFor(() => expect(m.from).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/Evidências selecionadas: 1/)).toBeInTheDocument();
  });
});

import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  obterMatrizRbac,
  atualizarMatrizRbac,
  consultarPermissoesEfetivas,
  resolverContextoRbac,
  ErroRbac,
} from "@/lib/administracao/rbacRpc";
import { MatrizPermissoes } from "@/components/administracao/usuarios/MatrizPermissoes";
const m = vi.hoisted(() => ({
  rpc: vi.fn(),
  getUser: vi.fn(),
  onAuth: vi.fn(),
  org: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: m.rpc, from: m.from, auth: { getUser: m.getUser, onAuthStateChange: m.onAuth } },
}));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: m.org,
  EVENTO_ORGANIZACAO_ALTERADA: "contaos:organizacao-alterada",
}));
const perfis = [
  "administrador",
  "auditor",
  "contabilidade",
  "direcao_aprovador",
  "financeiro",
  "gestor_contrato",
  "juridico_conformidade",
  "leitor",
  "prestacao_contas",
  "rh_dp",
];
const pares = [
  { recurso: "organizacoes", acao: "consultar" },
  { recurso: "organizacoes", acao: "administrar" },
  { recurso: "usuarios", acao: "consultar" },
  { recurso: "usuarios", acao: "administrar" },
  { recurso: "auditoria", acao: "consultar" },
  { recurso: "contratantes", acao: "consultar" },
  { recurso: "contratantes", acao: "criar" },
  { recurso: "contratantes", acao: "editar" },
  { recurso: "contratos", acao: "consultar" },
  { recurso: "contratos", acao: "criar" },
  { recurso: "contratos", acao: "editar" },
  { recurso: "orcamentos", acao: "consultar" },
  { recurso: "orcamentos", acao: "criar" },
  { recurso: "orcamentos", acao: "editar" },
  { recurso: "orcamentos", acao: "aprovar" },
  { recurso: "normativos", acao: "consultar" },
  { recurso: "normativos", acao: "criar" },
  { recurso: "normativos", acao: "editar" },
  { recurso: "normativos", acao: "aprovar" },
  { recurso: "listas", acao: "consultar" },
  { recurso: "listas", acao: "criar" },
  { recurso: "listas", acao: "editar" },
  { recurso: "documentos_contrato", acao: "consultar" },
  { recurso: "documentos_contrato", acao: "criar" },
  { recurso: "documentos_contrato", acao: "editar" },
  { recurso: "documentos_competencia", acao: "consultar" },
  { recurso: "documentos_competencia", acao: "criar" },
  { recurso: "documentos_competencia", acao: "editar" },
  { recurso: "competencias", acao: "consultar" },
  { recurso: "competencias", acao: "criar" },
  { recurso: "analises", acao: "consultar" },
  { recurso: "analises", acao: "criar" },
  { recurso: "analises", acao: "processar" },
  { recurso: "analises", acao: "editar" },
  { recurso: "pareceres", acao: "consultar" },
  { recurso: "pareceres", acao: "criar" },
  { recurso: "pareceres", acao: "aprovar" },
  { recurso: "apresentacoes", acao: "consultar" },
  { recurso: "apresentacoes", acao: "aprovar" },
  { recurso: "apresentacoes", acao: "apresentar" },
  { recurso: "historico", acao: "consultar" },
  { recurso: "historico", acao: "criar" },
  { recurso: "historico", acao: "editar" },
  { recurso: "historico", acao: "processar" },
  { recurso: "arquivos", acao: "consultar" },
  { recurso: "arquivos", acao: "criar" },
  { recurso: "arquivos", acao: "editar" },
  { recurso: "dashboard", acao: "consultar" },
];
function matriz() {
  return {
    schema_versao: "rbac-v1",
    versao: 5,
    permissoes: perfis.flatMap((perfil) => pares.map((p) => ({ ...p, perfil, permitido: true }))),
  };
}
function ok(data: unknown) {
  return { data, error: null, status: 200 };
}
beforeEach(() => {
  m.rpc.mockReset().mockResolvedValue(ok(matriz()));
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: "usuario" } }, error: null });
  m.onAuth.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  m.org.mockReset().mockReturnValue("org");
});
afterEach(cleanup);
describe("contrato RBAC persistente", () => {
  it("lê as480combinações do backend sem editar tipos", async () => {
    expect((await obterMatrizRbac()).permissoes).toHaveLength(480);
    expect(m.rpc).toHaveBeenCalledWith("obter_matriz_rbac_master", {});
  });
  it.each([
    null,
    {},
    { ...matriz(), schema_versao: "outro" },
    { ...matriz(), versao: 0 },
    { ...matriz(), permissoes: matriz().permissoes.slice(1) },
    { ...matriz(), permissoes: Array(480).fill(matriz().permissoes[0]!) },
    {
      ...matriz(),
      permissoes: matriz().permissoes.map((p, i) => (i ? p : { ...p, permitido: "true" })),
    },
  ])("nega matriz inválida %#", async (data) => {
    m.rpc.mockResolvedValue(ok(data));
    await expect(obterMatrizRbac()).rejects.toBeInstanceOf(ErroRbac);
  });
  it("distingue403 e conflito sem expor mensagem técnica", async () => {
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "private" },
      status: 403,
    });
    await expect(obterMatrizRbac()).rejects.toMatchObject({ tipo: "negado" });
    m.rpc.mockResolvedValue({ data: null, error: { code: "PT409" }, status: 409 });
    await expect(atualizarMatrizRbac(5, "id", [])).rejects.toMatchObject({ tipo: "conflito" });
  });
  it("envia contexto exato e nega permissões malformadas", async () => {
    m.rpc.mockResolvedValue(
      ok({
        schema_versao: "rbac-v1",
        versao: 5,
        master: false,
        permissoes: [{ recurso: "contratos", acao: "consultar" }],
      }),
    );
    expect((await consultarPermissoesEfetivas("org", "contrato")).master).toBe(false);
    expect(m.rpc).toHaveBeenLastCalledWith("consultar_permissoes_efetivas", {
      p_id_organizacao: "org",
      p_id_contrato: "contrato",
    });
    m.rpc.mockResolvedValue(
      ok({
        schema_versao: "rbac-v1",
        versao: 5,
        master: true,
        permissoes: [{ recurso: "inventado", acao: "consultar" }],
      }),
    );
    await expect(consultarPermissoesEfetivas("org", null)).rejects.toBeInstanceOf(ErroRbac);
  });
});
describe("painel MASTER", () => {
  it("não apresenta controles a administrador comum negado pelo backend", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "42501" }, status: 403 });
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    await waitFor(() => expect(m.rpc).toHaveBeenCalled());
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(m.rpc.mock.calls.every((c) => c[0] === "obter_matriz_rbac_master")).toBe(true);
  });
  it("exige revisão explícita e cancela sem gravar", async () => {
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    const checkbox = (await screen.findAllByRole("checkbox"))[0]!;
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Voltar à edição" }));
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });
  it("salva uma tentativa lógica e reconsulta a fonte autoritativa", async () => {
    m.rpc.mockImplementation((nome, args) =>
      Promise.resolve(
        ok(
          nome === "atualizar_matriz_rbac_master"
            ? {
                schema_versao: "rbac-v1",
                versao: 6,
                request_id: args.p_request_id,
                evento_id: "00000000-0000-4000-8000-000000000001",
              }
            : matriz(),
        ),
      ),
    );
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar alterações" }));
    await screen.findByText("Permissões salvas.");
    const writes = m.rpc.mock.calls.filter((c) => c[0] === "atualizar_matriz_rbac_master");
    expect(writes).toHaveLength(1);
    expect(writes[0]![1]).toMatchObject({
      p_versao_esperada: 5,
      p_alteracoes: [
        { perfil: "administrador", recurso: "organizacoes", acao: "consultar", permitido: false },
      ],
    });
    expect(writes[0]![1].p_request_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(m.rpc.mock.calls.filter((c) => c[0] === "obter_matriz_rbac_master")).toHaveLength(2);
  });
  it("conflito bloqueia edição até recarregar", async () => {
    m.rpc.mockImplementation((nome) =>
      Promise.resolve(
        nome === "atualizar_matriz_rbac_master"
          ? { data: null, error: { code: "PT409" }, status: 409 }
          : ok(matriz()),
      ),
    );
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar alterações" }));
    await screen.findByText(/outra alteração/);
    expect(screen.getAllByRole("checkbox").every((x) => (x as HTMLInputElement).disabled)).toBe(
      true,
    );
    expect(screen.getByRole("button", { name: "Recarregar matriz" })).toBeEnabled();
  });
  it("retry de resultado incerto preservaUUID e payload", async () => {
    let n = 0;
    m.rpc.mockImplementation((nome, args) => {
      if (nome !== "atualizar_matriz_rbac_master") return Promise.resolve(ok(matriz()));
      if (!n++) return Promise.reject(new Error("network"));
      return Promise.resolve(
        ok({
          schema_versao: "rbac-v1",
          versao: 6,
          request_id: args.p_request_id,
          evento_id: "00000000-0000-4000-8000-000000000001",
        }),
      );
    });
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar alterações" }));
    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
    await screen.findByText("Permissões salvas.");
    const w = m.rpc.mock.calls.filter((c) => c[0] === "atualizar_matriz_rbac_master");
    expect(w).toHaveLength(2);
    expect(w[0]![1]).toEqual(w[1]![1]);
  });
  it("troca de organização descarta resposta pendente e controles", async () => {
    let resolve!: (x: unknown) => void;
    m.rpc.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    await waitFor(() => expect(m.rpc).toHaveBeenCalled());
    m.org.mockReturnValue("outra");
    fireEvent(window, new Event("contaos:organizacao-alterada"));
    resolve(ok(matriz()));
    await waitFor(() => expect(screen.queryByRole("checkbox")).not.toBeInTheDocument());
  });
});

describe("segurança de sessão e retorno", () => {
  it("aceita thenable PostgREST sem catch", async () => {
    m.rpc.mockReturnValue({
      then: (resolve: (r: unknown) => void) => Promise.resolve(ok(matriz())).then(resolve),
    });
    expect((await obterMatrizRbac()).versao).toBe(5);
  });
  it("rejeita confirmação de outra solicitação", async () => {
    m.rpc.mockResolvedValue(
      ok({
        schema_versao: "rbac-v1",
        versao: 6,
        request_id: "outra",
        evento_id: "00000000-0000-4000-8000-000000000001",
      }),
    );
    await expect(
      atualizarMatrizRbac(5, "00000000-0000-4000-8000-000000000002", []),
    ).rejects.toBeInstanceOf(ErroRbac);
  });
  it("INITIAL_SESSION não cria ciclo de consultas", async () => {
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    await screen.findAllByRole("checkbox");
    m.onAuth.mock.calls[0]![0]("INITIAL_SESSION");
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(1));
  });
  it("logout descarta resposta MASTER tardia", async () => {
    let resolve!: (x: unknown) => void;
    m.rpc.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    await waitFor(() => expect(m.rpc).toHaveBeenCalled());
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    m.onAuth.mock.calls[0]![0]("SIGNED_OUT");
    resolve(ok(matriz()));
    await waitFor(() => expect(screen.queryByRole("checkbox")).not.toBeInTheDocument());
  });
  it("mudança de filtro preserva alterações e revisão nomeia perfil original", async () => {
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
    fireEvent.change(screen.getByRole("combobox", { name: "Perfil da matriz" }), {
      target: { value: "leitor" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    expect(screen.getByRole("alertdialog").textContent).toContain(
      "administrador: organizacoes / consultar → negar",
    );
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });
  it("perda da autorização no save elimina a matriz", async () => {
    m.rpc.mockImplementation((nome) =>
      Promise.resolve(
        nome === "atualizar_matriz_rbac_master"
          ? { data: null, error: { code: "42501" }, status: 403 }
          : ok(matriz()),
      ),
    );
    render(<MatrizPermissoes idUsuario="usuario" org="org" />);
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar alterações" }));
    await waitFor(() => expect(screen.queryByRole("checkbox")).not.toBeInTheDocument());
  });
});

it("troca síncrona de sessão impede save do estado anterior", async () => {
  render(<MatrizPermissoes idUsuario="usuario" org="org" />);
  fireEvent.click((await screen.findAllByRole("checkbox"))[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Revisar alterações" }));
  const confirmar = screen.getByRole("button", { name: "Confirmar alterações" });
  m.getUser.mockResolvedValue({ data: { user: { id: "outra-pessoa" } }, error: null });
  act(() => {
    m.onAuth.mock.calls[0]![0]("SIGNED_IN");
    fireEvent.click(confirmar);
  });
  await waitFor(() => expect(screen.queryByRole("checkbox")).not.toBeInTheDocument());
  expect(m.rpc.mock.calls.some((c) => c[0] === "atualizar_matriz_rbac_master")).toBe(false);
});

describe("resolução de competência sob transporte RLS", () => {
  it("consulta ID e organização exatos antes de usar contrato", async () => {
    const eq = vi.fn();
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq,
      maybeSingle: vi.fn().mockResolvedValue({ data: { id_contrato: "contrato-A" }, error: null }),
    };
    eq.mockReturnValue(chain);
    m.from.mockReturnValue(chain);
    const id = "00000000-0000-4000-8000-000000000001";
    expect(await resolverContextoRbac(`/competencias/${id}/analise`, "org-A")).toEqual({
      contrato: "contrato-A",
      competencia: id,
      contratante: null,
    });
    expect(m.from).toHaveBeenLastCalledWith("competencias");
    expect(chain.select).toHaveBeenCalledWith("id_contrato");
    expect(eq.mock.calls).toEqual([
      ["id", id],
      ["id_organizacao", "org-A"],
    ]);
  });
  it.each([
    { data: null, error: null },
    { data: null, error: { code: "42501" } },
  ])("não cria contexto por ausência ou erro RLS %#", async (resposta) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(resposta),
    };
    m.from.mockReturnValue(chain);
    await expect(
      resolverContextoRbac(
        "/competencias/00000000-0000-4000-8000-000000000001/documentos",
        "org-B",
      ),
    ).rejects.toMatchObject({ tipo: "negado" });
  });
});

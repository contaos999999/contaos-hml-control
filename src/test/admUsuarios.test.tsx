import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({ getUser: vi.fn(), signOut: vi.fn(), rpc: vi.fn(), nav: vi.fn(), invoke: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: m.getUser, signOut: m.signOut }, rpc: m.rpc, from: vi.fn(), functions: { invoke: m.invoke } },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  Link: ({ children, to, ...p }: { children: ReactNode; to: string }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

import { AdminUsuarios } from "@/components/administracao/usuarios/AdminUsuarios";
import { MENSAGENS_ADM01 } from "@/lib/administracao/admUsuariosRpc";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const U = "admin-1";
const ORG = "org-1";
type Resp = { data: unknown; error: unknown; status: number };
type Chave =
  | "p_id_organizacao" | "p_id_usuario" | "p_email" | "p_perfil" | "p_escopo_todos_contratos" | "p_ativo"
  | "p_ids_contratos_ativar" | "p_ids_contratos_revogar" | "p_versao_esperada" | "p_chave_idempotencia"
  | "p_pagina" | "p_tamanho_pagina" | "p_busca";
type Args = Partial<Record<Chave, unknown>>;
type RpcNome = "validar_administrador_organizacao" | "listar_usuarios_vinculos_adm" | "listar_escopo_contratos_usuario_adm" | "listar_auditoria_vinculo_usuario_adm" | "salvar_vinculo_usuario_adm";
const ok = (data: unknown): Resp => ({ data, error: null, status: 200 });
const falha = (code: string, status: number): Resp => ({ data: null, error: { code, message: "detalhe técnico interno" }, status });

const PERFIS = [
  { codigo: "administrador", nome: "Administrador", descricao: null },
  { codigo: "analista", nome: "Analista", descricao: null },
];
function usuario(versao = 7, over: Record<string, unknown> = {}) {
  return {
    id_usuario: "u-a",
    nome: "Ana Souza",
    email: "ana@exemplo.com",
    telefone: null,
    situacao_usuario: "ativo",
    vinculo: {
      id: "v-a",
      perfil: "analista",
      escopo_todos_contratos: false,
      ativo: true,
      inicio_em: "2026-01-10T12:00:00Z",
      fim_em: null,
      versao_registro: versao,
      atualizado_em: "2026-10-01T12:00:00Z",
    },
    ...over,
  };
}
function lista(itens: unknown[], pagina = 1, total = itens.length) {
  return {
    schema_versao: "adm01-v2",
    pagina,
    tamanho_pagina: 25,
    total,
    total_paginas: Math.ceil(total / 25),
    itens,
    perfis_disponiveis: PERFIS,
  };
}
const contrato = (id: string, selecionado: boolean, acesso = selecionado) => ({
  id,
  numero: `CT-${id}`,
  objeto: `Objeto ${id}`,
  situacao: "ativo",
  criticidade: "media",
  selecionado,
  acesso_efetivo: acesso,
});
// 3 páginas de escopo: p1 c1(false) c2(true); p2 c3(false); p3 c9(true) — nunca visitada nos testes.
function escopoPagina(pagina: number, todos = false) {
  const itens = pagina === 1 ? [contrato("c1", false), contrato("c2", true)] : pagina === 2 ? [contrato("c3", false)] : [contrato("c9", true)];
  return { schema_versao: "adm01-v2", id_usuario: "u-a", escopo_todos_contratos: todos, pagina, tamanho_pagina: 25, total: 75, total_paginas: 3, itens };
}
function auditoria(pagina = 1) {
  return {
    schema_versao: "adm01-v2",
    id_usuario: "u-a",
    pagina,
    tamanho_pagina: 20,
    total: 40,
    total_paginas: 2,
    itens: [
      {
        id: `e${pagina}`,
        correlation_id: `corr-aud-${pagina}`,
        evento: pagina === 1 ? "vinculo_atualizado" : "vinculo_criado",
        entidade: "vinculos_usuarios",
        id_entidade: "v-a",
        id_usuario_ator: U,
        ator_nome: "Admin Teste",
        ator_email: "admin@exemplo.com",
        antes: { vinculo: { perfil: "analista", ativo: true, escopo_todos_contratos: false } },
        depois: { vinculo: { perfil: "administrador", ativo: true, escopo_todos_contratos: false } },
        metadados: {},
        criado_em: "2026-11-02T13:05:00Z",
      },
    ],
  };
}

let handlers: Record<RpcNome, (a: Args) => Resp | Promise<Resp>>;
const chamadas = (nome: RpcNome) => m.rpc.mock.calls.filter((c) => c[0] === nome).map((c) => c[1] as Args);

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminUsuarios />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, ORG);
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  handlers = {
    validar_administrador_organizacao: () => ok(true),
    listar_usuarios_vinculos_adm: () => ok(lista([usuario()])),
    listar_escopo_contratos_usuario_adm: (a) => ok(escopoPagina(Number(a.p_pagina))),
    listar_auditoria_vinculo_usuario_adm: (a) => ok(auditoria(Number(a.p_pagina))),
    salvar_vinculo_usuario_adm: () => ok({ schema_versao: "adm01-v2", correlation_id: "corr-ok-1", id_usuario: "u-a", vinculo: {} }),
  };
  m.rpc.mockImplementation(async (nome: RpcNome, a: Args) => handlers[nome](a));
  m.invoke.mockResolvedValue({
    data: {
      ok: true,
      codigo: "USUARIO_EXISTENTE",
      titulo: "Usuário existente",
      mensagem: "Conta existente localizada.",
      usuario: { id_usuario: "u-novo", email: "nova@exemplo.com", nome: "Nova Pessoa" },
      convite_enviado: false,
      proxima_acao: "salvar_vinculo_usuario_adm",
    },
    error: null,
  });
});
const edgeFalha = (status: number, codigo: string) => ({
  data: null,
  error: { name: "FunctionsHttpError", message: "Edge Function returned a non-2xx status code", context: { status, json: async () => ({ codigo, mensagem: "detalhe técnico interno" }) } },
});
afterEach(() => vi.restoreAllMocks());

async function abrirEdicao() {
  montar();
  fireEvent.click(await screen.findByRole("button", { name: "Editar vínculo de Ana Souza" }));
  const dlg = await screen.findByRole("dialog");
  await within(dlg).findByLabelText("Contrato CT-c1 — Objeto c1");
  return dlg;
}
const salvar = (dlg: HTMLElement) => fireEvent.click(within(dlg).getByRole("button", { name: "Salvar vínculo" }));
const ultimoSalvar = () => chamadas("salvar_vinculo_usuario_adm").at(-1)!;

describe("ADM-01 sessão e estados", () => {
  it("sem sessão (AuthSessionMissingError) vai para /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: { name: "AuthSessionMissingError", status: 400 } });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("erro técnico do getUser não desloga e oferece retry", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: { name: "AuthRetryableFetchError", status: 500 } });
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.erro)).toBeInTheDocument();
    expect(m.nav).not.toHaveBeenCalled();
    m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
  });

  it("sem preferência de organização vai para /selecionar-organizacao", async () => {
    window.sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });

  it("valida administrador no backend uma vez antes de listar", async () => {
    montar();
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(chamadas("validar_administrador_organizacao")).toEqual([{ p_id_organizacao: ORG }]);
    expect(m.rpc.mock.calls[0]![0]).toBe("validar_administrador_organizacao");
  });

  it("validar=false mostra 403 dedicado e não chama a lista", async () => {
    handlers.validar_administrador_organizacao = () => ok(false);
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.negado)).toBeInTheDocument();
    expect(chamadas("listar_usuarios_vinculos_adm")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Convidar ou vincular usuário" })).not.toBeInTheDocument();
  });

  it("validar 42501 mostra 403; validar 500 mostra erro genérico", async () => {
    handlers.validar_administrador_organizacao = () => falha("42501", 403);
    const r = montar();
    expect(await screen.findByText(MENSAGENS_ADM01.negado)).toBeInTheDocument();
    r.unmount();
    handlers.validar_administrador_organizacao = () => falha("XX000", 500);
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.erro)).toBeInTheDocument();
    expect(chamadas("listar_usuarios_vinculos_adm")).toHaveLength(0);
  });

  it("schema_versao adm01-v1 na lista é incompatibilidade (erro genérico)", async () => {
    handlers.listar_usuarios_vinculos_adm = () => ok({ ...lista([usuario()]), schema_versao: "adm01-v1" });
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.erro)).toBeInTheDocument();
    expect(screen.queryByText("Ana Souza")).not.toBeInTheDocument();
  });

  it("lista chama RPC 1 com org, página 1 e tamanho 25 e mostra valores literais", async () => {
    montar();
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(chamadas("listar_usuarios_vinculos_adm")[0]).toEqual({
      p_id_organizacao: ORG,
      p_pagina: 1,
      p_tamanho_pagina: 25,
      p_busca: null,
      p_ativo: null,
    });
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it.each([
    ["42501", 400],
    ["XX000", 403],
  ])("negado (%s/%s) nunca vira empty e não vaza texto técnico", async (code, status) => {
    handlers.listar_usuarios_vinculos_adm = () => falha(code, status);
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.negado)).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_ADM01.vazio)).not.toBeInTheDocument();
    expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
  });

  it("empty real mostra orientação", async () => {
    handlers.listar_usuarios_vinculos_adm = () => ok(lista([]));
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.vazio)).toBeInTheDocument();
  });

  it("erro técnico mostra mensagem genérica com retry", async () => {
    handlers.listar_usuarios_vinculos_adm = () => falha("XX000", 500);
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.erro)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});

describe("ADM-01 paginação real (093)", () => {
  it("busca e filtro reiniciam a página e vão ao backend", async () => {
    handlers.listar_usuarios_vinculos_adm = (a) => ok(lista([usuario()], Number(a.p_pagina), 60));
    montar();
    await screen.findByText("Ana Souza");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(chamadas("listar_usuarios_vinculos_adm").at(-1)!.p_pagina).toBe(2));
    fireEvent.change(screen.getByLabelText("Buscar usuários"), { target: { value: "  ana  " } });
    await waitFor(() => expect(chamadas("listar_usuarios_vinculos_adm").at(-1)).toMatchObject({ p_busca: "ana", p_pagina: 1 }));
    fireEvent.change(screen.getByLabelText("Situação do vínculo"), { target: { value: "inativos" } });
    await waitFor(() => expect(chamadas("listar_usuarios_vinculos_adm").at(-1)).toMatchObject({ p_ativo: false, p_pagina: 1 }));
  });

  it("paginação da lista chama a RPC (sem slice local)", async () => {
    handlers.listar_usuarios_vinculos_adm = (a) => ok(lista([usuario(7, { nome: `Pessoa ${a.p_pagina}` } as never)], Number(a.p_pagina), 60));
    montar();
    await screen.findByText("Pessoa 1");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(await screen.findByText("Pessoa 2")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("editar carrega o escopo pela RPC 3 com tamanho 25", async () => {
    await abrirEdicao();
    expect(chamadas("listar_escopo_contratos_usuario_adm")[0]).toEqual({
      p_id_organizacao: ORG,
      p_id_usuario: "u-a",
      p_pagina: 1,
      p_tamanho_pagina: 25,
      p_busca: null,
    });
  });
});

describe("ADM-01 deltas de escopo", () => {
  it("página 3 não visitada fica intacta: RPC 4 recebe só as linhas tocadas", async () => {
    const dlg = await abrirEdicao();
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    expect(ultimoSalvar().p_ids_contratos_ativar).toEqual(["c1"]);
    expect(ultimoSalvar().p_ids_contratos_revogar).toEqual([]);
    expect(JSON.stringify(ultimoSalvar())).not.toContain("c9");
    expect(chamadas("listar_escopo_contratos_usuario_adm").some((a) => a.p_pagina === 3)).toBe(false);
  });

  it("paginação e busca no escopo não limpam deltas", async () => {
    const dlg = await abrirEdicao();
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    fireEvent.click(within(dlg).getByRole("button", { name: "Próxima página de contratos" }));
    fireEvent.click(await within(dlg).findByLabelText("Contrato CT-c3 — Objeto c3"));
    fireEvent.change(within(dlg).getByLabelText("Buscar contratos"), { target: { value: "c" } });
    await waitFor(() => expect(chamadas("listar_escopo_contratos_usuario_adm").at(-1)).toMatchObject({ p_busca: "c", p_pagina: 1 }));
    fireEvent.click(await within(dlg).findByLabelText("Contrato CT-c2 — Objeto c2"));
    expect(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1")).toBeChecked();
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    expect(ultimoSalvar().p_ids_contratos_ativar).toEqual(["c1", "c3"]);
    expect(ultimoSalvar().p_ids_contratos_revogar).toEqual(["c2"]);
  });

  it("ida e volta ao baseline envia deltas vazios", async () => {
    const dlg = await abrirEdicao();
    const c1 = within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1");
    const c2 = within(dlg).getByLabelText("Contrato CT-c2 — Objeto c2");
    fireEvent.click(c1);
    fireEvent.click(c1);
    fireEvent.click(c2);
    fireEvent.click(c2);
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    expect(ultimoSalvar().p_ids_contratos_ativar).toEqual([]);
    expect(ultimoSalvar().p_ids_contratos_revogar).toEqual([]);
  });

  it("acesso_efetivo é só informativo e não marca a seleção explícita", async () => {
    handlers.listar_escopo_contratos_usuario_adm = () =>
      ok({ ...escopoPagina(1), itens: [contrato("c1", false, true)] });
    const dlg = await abrirEdicao();
    expect(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1")).not.toBeChecked();
    expect(within(dlg).getByText("Acesso atual: sim")).toBeInTheDocument();
  });

  it("todos=true desabilita seleção e envia deltas vazios", async () => {
    const dlg = await abrirEdicao();
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    fireEvent.click(within(dlg).getByLabelText("Acesso a todos os contratos"));
    expect(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1")).toBeDisabled();
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    expect(ultimoSalvar()).toMatchObject({ p_escopo_todos_contratos: true, p_ids_contratos_ativar: [], p_ids_contratos_revogar: [] });
  });

  it("todos→específico recarrega RPC 3, refaz baseline, limpa deltas e invalida a chave", async () => {
    const dlg = await abrirEdicao();
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    handlers.salvar_vinculo_usuario_adm = () => falha("XX000", 500);
    salvar(dlg);
    await within(dlg).findByText(MENSAGENS_ADM01.erroSalvar);
    const chave1 = ultimoSalvar().p_chave_idempotencia;
    const antes = chamadas("listar_escopo_contratos_usuario_adm").length;
    fireEvent.click(within(dlg).getByLabelText("Acesso a todos os contratos"));
    // backend agora reporta c1 como explícito
    handlers.listar_escopo_contratos_usuario_adm = (a) =>
      ok({ ...escopoPagina(Number(a.p_pagina)), itens: [contrato("c1", true), contrato("c2", true)] });
    fireEvent.click(within(dlg).getByLabelText("Acesso a todos os contratos"));
    await waitFor(() => expect(chamadas("listar_escopo_contratos_usuario_adm").length).toBeGreaterThan(antes));
    await waitFor(() => expect(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1")).toBeChecked());
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c2 — Objeto c2"));
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    expect(ultimoSalvar().p_ids_contratos_ativar).toEqual([]);
    expect(ultimoSalvar().p_ids_contratos_revogar).toEqual(["c2"]);
    expect(ultimoSalvar().p_chave_idempotencia).not.toBe(chave1);
  });
});

describe("ADM-01 salvar, concorrência (091) e idempotência (092)", () => {
  it("edição envia p_versao_esperada literal, p_email null e assinatura v2", async () => {
    const dlg = await abrirEdicao();
    fireEvent.change(within(dlg).getByLabelText("Perfil de acesso"), { target: { value: "administrador" } });
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    const a = ultimoSalvar();
    expect(Object.keys(a).sort()).toEqual(
      [
        "p_ativo",
        "p_chave_idempotencia",
        "p_email",
        "p_escopo_todos_contratos",
        "p_id_organizacao",
        "p_id_usuario",
        "p_ids_contratos_ativar",
        "p_ids_contratos_revogar",
        "p_perfil",
        "p_versao_esperada",
      ].sort(),
    );
    expect(a).toMatchObject({ p_id_organizacao: ORG, p_id_usuario: "u-a", p_email: null, p_perfil: "administrador", p_versao_esperada: 7, p_ativo: true });
    expect(typeof a.p_chave_idempotencia).toBe("string");
  });

  it("sucesso fecha, mostra correlation_id e não registra dados no console", async () => {
    const log = vi.spyOn(console, "log");
    const dlg = await abrirEdicao();
    salvar(dlg);
    expect(await screen.findByText(/Referência: corr-ok-1/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(log).not.toHaveBeenCalled();
  });

  it("duplo clique dispara uma única chamada (processing)", async () => {
    let liberar: (r: Resp) => void = () => undefined;
    handlers.salvar_vinculo_usuario_adm = () => new Promise<Resp>((r) => (liberar = r));
    const dlg = await abrirEdicao();
    const botao = within(dlg).getByRole("button", { name: "Salvar vínculo" });
    fireEvent.click(botao);
    fireEvent.click(botao);
    await waitFor(() => expect(within(dlg).getByRole("button", { name: /Salvando/ })).toBeDisabled());
    expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1);
    liberar(ok({ schema_versao: "adm01-v2", correlation_id: "c", id_usuario: "u-a", vinculo: {} }));
  });

  it("retry técnico do mesmo payload reutiliza a chave; mudar campo gera outra", async () => {
    handlers.salvar_vinculo_usuario_adm = () => falha("XX000", 500);
    const dlg = await abrirEdicao();
    salvar(dlg);
    await within(dlg).findByText(MENSAGENS_ADM01.erroSalvar);
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    const [k1, k2] = chamadas("salvar_vinculo_usuario_adm").map((a) => a.p_chave_idempotencia);
    expect(k2).toBe(k1);
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(3));
    expect(ultimoSalvar().p_chave_idempotencia).not.toBe(k1);
  });

  it("após sucesso, reabrir e salvar o mesmo payload usa chave diferente", async () => {
    let dlg = await abrirEdicao();
    salvar(dlg);
    await screen.findByText(/Referência: corr-ok-1/);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Editar vínculo de Ana Souza" }));
    dlg = await screen.findByRole("dialog");
    await within(dlg).findByLabelText("Contrato CT-c1 — Objeto c1");
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    const [a, b] = chamadas("salvar_vinculo_usuario_adm");
    expect({ ...a, p_chave_idempotencia: 0 }).toEqual({ ...b, p_chave_idempotencia: 0 });
    expect(b!.p_chave_idempotencia).not.toBe(a!.p_chave_idempotencia);
  });

  it("após cancelar, reabrir e salvar o mesmo payload usa chave diferente", async () => {
    handlers.salvar_vinculo_usuario_adm = () => falha("XX000", 500);
    let dlg = await abrirEdicao();
    salvar(dlg);
    await within(dlg).findByText(MENSAGENS_ADM01.erroSalvar);
    fireEvent.click(within(dlg).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Editar vínculo de Ana Souza" }));
    dlg = await screen.findByRole("dialog");
    await within(dlg).findByLabelText("Contrato CT-c1 — Objeto c1");
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    const [a, b] = chamadas("salvar_vinculo_usuario_adm");
    expect(b!.p_chave_idempotencia).not.toBe(a!.p_chave_idempotencia);
  });

  it("PT409 mantém edição aberta; Recarregar e revisar atualiza versão, limpa deltas e a chave", async () => {
    let versao = 7;
    handlers.listar_usuarios_vinculos_adm = () => ok(lista([usuario(versao)]));
    handlers.salvar_vinculo_usuario_adm = () => falha("PT409", 409);
    const dlg = await abrirEdicao();
    fireEvent.click(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1"));
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.conflito)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const k1 = ultimoSalvar().p_chave_idempotencia;
    versao = 8;
    handlers.salvar_vinculo_usuario_adm = () => ok({ schema_versao: "adm01-v2", correlation_id: "c2", id_usuario: "u-a", vinculo: {} });
    fireEvent.click(within(dlg).getByRole("button", { name: "Recarregar e revisar" }));
    await waitFor(() => expect(within(dlg).queryByText(MENSAGENS_ADM01.conflito)).not.toBeInTheDocument());
    await waitFor(() => expect(within(dlg).getByLabelText("Contrato CT-c1 — Objeto c1")).not.toBeChecked());
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    expect(ultimoSalvar()).toMatchObject({ p_versao_esperada: 8, p_ids_contratos_ativar: [], p_ids_contratos_revogar: [] });
    expect(ultimoSalvar().p_chave_idempotencia).not.toBe(k1);
  });
});

describe("ADM-01 vínculo novo e PT404 contextual", () => {
  async function abrirNovo() {
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Convidar ou vincular usuário" }));
    const dlg = await screen.findByRole("dialog");
    await within(dlg).findByLabelText("Contrato CT-c1 — Objeto c1");
    return dlg;
  }

  const preencher = (dlg: HTMLElement, email = " nova@exemplo.com ") => {
    fireEvent.change(within(dlg).getByLabelText("E-mail"), { target: { value: email } });
    fireEvent.change(within(dlg).getByLabelText("Perfil de acesso"), { target: { value: "analista" } });
  };

  it("resposta oficial da Edge: usuario.id_usuario u-novo segue para RPC salvar com 10 argumentos", async () => {
    const dlg = await abrirNovo();
    expect(chamadas("listar_escopo_contratos_usuario_adm")[0]).toMatchObject({ p_id_usuario: null, p_pagina: 1, p_tamanho_pagina: 25 });
    preencher(dlg);
    fireEvent.change(within(dlg).getByLabelText("Nome (opcional)"), { target: { value: " Nova Pessoa " } });
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(1));
    expect(m.invoke).toHaveBeenCalledTimes(1);
    const [nome, opts] = m.invoke.mock.calls[0]!;
    expect(nome).toBe("admin-invite-user");
    expect(Object.keys(opts.body).sort()).toEqual(["chave_idempotencia", "email", "id_organizacao", "nome"]);
    expect(opts.body).toMatchObject({ id_organizacao: ORG, email: "nova@exemplo.com", nome: "Nova Pessoa" });
    const s = ultimoSalvar();
    expect(Object.keys(s)).toHaveLength(10);
    expect(s).toMatchObject({ p_id_usuario: "u-novo", p_email: "nova@exemplo.com", p_versao_esperada: null, p_perfil: "analista" });
    expect(s.p_chave_idempotencia).not.toBe(opts.body.chave_idempotencia);
  });

  it("nome vazio não é enviado à Edge", async () => {
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    await waitFor(() => expect(m.invoke).toHaveBeenCalledTimes(1));
    expect(m.invoke.mock.calls[0]![1].body).not.toHaveProperty("nome");
  });

  it("USUARIO_EXISTENTE salva vínculo e mostra aviso", async () => {
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await screen.findByText(new RegExp(MENSAGENS_ADM01.usuarioExistente))).toBeInTheDocument();
    expect(dlg).not.toBeInTheDocument();
  });

  it("USUARIO_CONVIDADO mostra aviso de convite", async () => {
    m.invoke.mockResolvedValue({
      data: {
        ok: true,
        codigo: "USUARIO_CONVIDADO",
        titulo: "Usuário convidado",
        mensagem: "Convite enviado.",
        usuario: { id_usuario: "u-novo", email: "nova@exemplo.com", nome: null },
        convite_enviado: true,
        proxima_acao: "salvar_vinculo_usuario_adm",
      },
      error: null,
    });
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await screen.findByText(new RegExp(MENSAGENS_ADM01.usuarioConvidado))).toBeInTheDocument();
  });

  it("falha no vínculo após convite: retry não repete a Edge e reutiliza a chave do vínculo", async () => {
    let n = 0;
    handlers.salvar_vinculo_usuario_adm = () =>
      ++n === 1 ? falha("500", 500) : ok({ schema_versao: "adm01-v2", correlation_id: "corr-ok-2", id_usuario: "u-novo", vinculo: {} });
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.erroSalvar)).toBeInTheDocument();
    salvar(dlg);
    await waitFor(() => expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(2));
    expect(m.invoke).toHaveBeenCalledTimes(1);
    const [s1, s2] = chamadas("salvar_vinculo_usuario_adm");
    expect(s2!.p_chave_idempotencia).toBe(s1!.p_chave_idempotencia);
  });

  it("Edge 409 CONFLITO_IDEMPOTENCIA: mensagem e nova chave na próxima tentativa", async () => {
    m.invoke.mockResolvedValueOnce(edgeFalha(409, "CONFLITO_IDEMPOTENCIA"));
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.conflitoIdempotencia)).toBeInTheDocument();
    salvar(dlg);
    await waitFor(() => expect(m.invoke).toHaveBeenCalledTimes(2));
    expect(m.invoke.mock.calls[1]![1].body.chave_idempotencia).not.toBe(m.invoke.mock.calls[0]![1].body.chave_idempotencia);
    expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
  });

  it("Edge 409 OPERACAO_EM_PROCESSAMENTO: neutro, sem reenvio automático; Consultar novamente reusa a chave", async () => {
    m.invoke.mockResolvedValueOnce(edgeFalha(409, "OPERACAO_EM_PROCESSAMENTO"));
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.emProcessamento)).toBeInTheDocument();
    expect(within(dlg).getByRole("button", { name: "Salvar vínculo" })).toBeDisabled();
    await new Promise((r) => setTimeout(r, 50));
    expect(m.invoke).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dlg).getByRole("button", { name: "Consultar novamente" }));
    await waitFor(() => expect(m.invoke).toHaveBeenCalledTimes(2));
    expect(m.invoke.mock.calls[1]![1].body.chave_idempotencia).toBe(m.invoke.mock.calls[0]![1].body.chave_idempotencia);
  });

  it.each([
    [422, "DADOS_INVALIDOS", "validacao"],
    [422, "CONVITE_NAO_ENVIADO", "conviteNaoEnviado"],
    [413, "REQUISICAO_MUITO_GRANDE", "muitoGrande"],
    [403, "AUTH_ACESSO_NEGADO", "negado"],
    [401, "AUTH_SESSAO_INVALIDA", "sessaoInvalida"],
    [500, "ERRO_INTERNO", "erroSalvar"],
  ] as const)("Edge %i %s mostra mensagem própria, sem texto técnico e sem salvar", async (st, cod, chave) => {
    m.invoke.mockResolvedValueOnce(edgeFalha(st, cod));
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01[chave])).toBeInTheDocument();
    expect(chamadas("salvar_vinculo_usuario_adm")).toHaveLength(0);
    expect(screen.queryByText(/detalhe técnico|non-2xx/)).not.toBeInTheDocument();
  });

  it("falha de rede na Edge = erro genérico", async () => {
    m.invoke.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const dlg = await abrirNovo();
    preencher(dlg);
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.erroSalvar)).toBeInTheDocument();
  });

  it("e-mail vazio não chama a Edge", async () => {
    const dlg = await abrirNovo();
    preencher(dlg, "  ");
    salvar(dlg);
    expect(await within(dlg).findByText(MENSAGENS_ADM01.validacao)).toBeInTheDocument();
    expect(m.invoke).not.toHaveBeenCalled();
  });

  it("PT404 no escopo durante edição = vínculo desatualizado + Recarregar lista", async () => {
    handlers.listar_escopo_contratos_usuario_adm = () => falha("PT404", 404);
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Editar vínculo de Ana Souza" }));
    const dlg = await screen.findByRole("dialog");
    expect(await within(dlg).findByText(MENSAGENS_ADM01.vinculoDesatualizado)).toBeInTheDocument();
    expect(within(dlg).getByRole("button", { name: "Recarregar lista" })).toBeInTheDocument();
  });

  it("PT404 na auditoria = vínculo desatualizado + Recarregar lista", async () => {
    handlers.listar_auditoria_vinculo_usuario_adm = () => falha("PT404", 404);
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Ver auditoria de Ana Souza" }));
    const dlg = await screen.findByRole("dialog");
    expect(await within(dlg).findByText(MENSAGENS_ADM01.vinculoDesatualizado)).toBeInTheDocument();
    expect(within(dlg).getByRole("button", { name: "Recarregar lista" })).toBeInTheDocument();
  });

  it("PT404 inesperado na lista = erro genérico seguro", async () => {
    handlers.listar_usuarios_vinculos_adm = () => falha("PT404", 404);
    montar();
    expect(await screen.findByText(MENSAGENS_ADM01.erro)).toBeInTheDocument();
    expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
  });
});

describe("ADM-01 auditoria", () => {
  it("usa RPC 2 com tamanho 20, paginação real e data brasileira", async () => {
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Ver auditoria de Ana Souza" }));
    const dlg = await screen.findByRole("dialog");
    expect(await within(dlg).findByText("02/11/2026 10:05")).toBeInTheDocument();
    expect(chamadas("listar_auditoria_vinculo_usuario_adm")[0]).toEqual({ p_id_organizacao: ORG, p_id_usuario: "u-a", p_pagina: 1, p_tamanho_pagina: 20 });
    expect(within(dlg).getByText(/corr-aud-1/)).toBeInTheDocument();
    fireEvent.click(within(dlg).getByRole("button", { name: "Próxima página da auditoria" }));
    expect(await within(dlg).findByText(/corr-aud-2/)).toBeInTheDocument();
    expect(chamadas("listar_auditoria_vinculo_usuario_adm").at(-1)!.p_pagina).toBe(2);
  });

  const abrir = async () => {
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Ver auditoria de Ana Souza" }));
    return screen.findByRole("dialog");
  };

  it("A/B: antes, depois e metadados aparecem integralmente, com ator, data e correlation_id", async () => {
    handlers.listar_auditoria_vinculo_usuario_adm = () => {
      const a = auditoria(1);
      a.itens[0] = {
        ...a.itens[0],
        antes: { vinculo: { perfil: "analista", ativo: true, escopo_todos_contratos: false, inicio_em: "campo-antes-extra" } },
        depois: { vinculo: { perfil: "administrador", ativo: false, escopo_todos_contratos: false }, contratos_ativados: ["ct-depois-extra"] },
        metadados: { origem: "metadado-redigido-backend", ids_ocultos: 2 },
      } as (typeof a.itens)[0];
      return ok(a);
    };
    const dlg = await abrir();
    expect(await within(dlg).findByText(/campo-antes-extra/)).toBeInTheDocument();
    expect(within(dlg).getByText(/ct-depois-extra/)).toBeInTheDocument();
    expect(within(dlg).getByText(/metadado-redigido-backend/)).toBeInTheDocument();
    expect(within(dlg).getByText(/ids_ocultos/)).toBeInTheDocument();
    expect(within(dlg).getByText(/corr-aud-1/)).toBeInTheDocument();
    expect(within(dlg).getByText(/Admin Teste/)).toBeInTheDocument();
    expect(within(dlg).getByText("02/11/2026 10:05")).toBeInTheDocument();
  });

  it("C: mostra carregando enquanto a RPC está pendente", async () => {
    handlers.listar_auditoria_vinculo_usuario_adm = () => new Promise(() => undefined);
    const dlg = await abrir();
    expect(within(dlg).getByRole("status")).toHaveTextContent("Carregando auditoria…");
  });

  it("D: resposta vazia mostra estado vazio", async () => {
    handlers.listar_auditoria_vinculo_usuario_adm = () => ok({ ...auditoria(1), total: 0, total_paginas: 0, itens: [] });
    const dlg = await abrir();
    expect(await within(dlg).findByText(MENSAGENS_ADM01.auditoriaVazia)).toBeInTheDocument();
  });

  it("E: erro mostra mensagem PT-BR sem detalhe técnico", async () => {
    handlers.listar_auditoria_vinculo_usuario_adm = () => falha("XX000", 500);
    const dlg = await abrir();
    expect(await within(dlg).findByRole("alert")).toHaveTextContent(MENSAGENS_ADM01.erro);
    expect(dlg).not.toHaveTextContent(/detalhe técnico|XX000/);
    expect(within(dlg).getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("F: paginação pede só a página solicitada à RPC", async () => {
    const dlg = await abrir();
    await within(dlg).findByText(/corr-aud-1/);
    expect(chamadas("listar_auditoria_vinculo_usuario_adm")).toHaveLength(1);
    fireEvent.click(within(dlg).getByRole("button", { name: "Próxima página da auditoria" }));
    await within(dlg).findByText(/corr-aud-2/);
    expect(chamadas("listar_auditoria_vinculo_usuario_adm").map((c) => [c.p_pagina, c.p_tamanho_pagina])).toEqual([[1, 20], [2, 20]]);
  });
});

describe("ADM-01 varredura de código (zero drift)", () => {
  const raiz = path.resolve(__dirname, "..");
  const arquivos = [
    ...readdirSync(path.join(raiz, "components/administracao/usuarios")).map((f) => path.join(raiz, "components/administracao/usuarios", f)),
    ...readdirSync(path.join(raiz, "lib/administracao")).map((f) => path.join(raiz, "lib/administracao", f)),
    path.join(raiz, "routes/administracao.usuarios.tsx"),
  ];
  const fonte = arquivos.map((f) => readFileSync(f, "utf8")).join("\n");

  it("sem assinatura v1, writes diretos, auth.admin, service_role ou console", () => {
    expect(fonte).not.toMatch(/p_ids_contratos(?!_ativar|_revogar)/);
    expect(fonte).not.toMatch(/\.from\(\s*["'`]|\.insert\(|\.update\(|\.upsert\(|\.delete\(\s*\)/);
    expect(fonte).not.toMatch(/auth\.admin|service_role|sb_secret|client\.server/);
    expect(fonte).not.toMatch(/console\./);
  });

  it("usa somente as 5 RPCs oficiais e a Edge admin-invite-user", () => {
    const nomes = [...fonte.matchAll(/"([a-z_]+_(?:adm|organizacao))"/g)].map((x) => x[1]);
    expect(fonte.match(/supabase\.rpc/g)).toHaveLength(1);
    expect(fonte.match(/functions\.invoke\(/g)).toHaveLength(1);
    expect([...fonte.matchAll(/invoke\(\s*"([^"]+)"/g)].map((x) => x[1])).toEqual(["admin-invite-user"]);
    expect(fonte).not.toMatch(/adm01-v1|auth\.users/);
    expect(new Set(nomes)).toEqual(
      new Set(["validar_administrador_organizacao", "listar_usuarios_vinculos_adm", "listar_escopo_contratos_usuario_adm", "listar_auditoria_vinculo_usuario_adm", "salvar_vinculo_usuario_adm"]),
    );
  });
});

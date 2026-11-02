import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

type Chamada = { tabela: string; ops: Array<[string, unknown[]]> };

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  invoke: vi.fn(),
  chamadas: [] as Array<{ tabela: string; ops: Array<[string, unknown[]]> }>,
  respostas: {} as { vinculos_usuarios?: (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown; contratantes?: (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown },
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c = { tabela, ops: [] as Array<[string, unknown[]]> };
    m.chamadas.push(c);
    const b: { [k: string]: unknown; then?: unknown } = {};
    for (const op of ["select", "eq", "maybeSingle", "single", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      try {
        return Promise.resolve(m.respostas[tabela as "contratantes"]?.(c)).then(res, rej);
      } catch (e) {
        return Promise.reject(e).then(res, rej);
      }
    };
    return b;
  };
  return { supabase: { auth: { getUser: m.getUser, signOut: m.signOut }, from, rpc: m.rpc, functions: { invoke: m.invoke } } };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: () => (o: unknown) => ({ options: o }),
  Link: ({ children, to, ...p }: { children: ReactNode; to: string }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

import { NovoContratante, MENSAGENS_V102 } from "@/components/contratantes/NovoContratante";
import { montarPayload, vinculoPermiteCadastro } from "@/lib/contratantes/novoContratanteDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratantes_.novo";

const U = "user-1";
const ORG = "org-1";
const passado = "2020-01-01T00:00:00Z";
const futuro = "2099-01-01T00:00:00Z";
const vinc = (over: Record<string, unknown> = {}) => ({
  data: { perfil: "administrador", ativo: true, inicio_em: passado, fim_em: null, ...over },
  error: null,
  status: 200,
});

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <NovoContratante />
    </QueryClientProvider>,
  );
}
const inserts = () => m.chamadas.filter((c) => c.tabela === "contratantes");
const op = (c: Chamada, nome: string) => c.ops.filter((o) => o[0] === nome).map((o) => o[1]);

async function preencher(over: { razao?: string; tipo?: string; documento?: string; fantasia?: string; email?: string; telefone?: string } = {}) {
  await screen.findByLabelText(/Razão social/);
  const v = { razao: "ACME LTDA", tipo: "juridica", ...over };
  fireEvent.change(screen.getByLabelText(/Razão social/), { target: { value: v.razao } });
  if (v.tipo) fireEvent.change(screen.getByLabelText(/Tipo de pessoa/), { target: { value: v.tipo } });
  if (over.documento !== undefined) fireEvent.change(screen.getByLabelText(/^Documento/), { target: { value: over.documento } });
  if (over.fantasia !== undefined) fireEvent.change(screen.getByLabelText(/Nome fantasia/), { target: { value: over.fantasia } });
  if (over.email !== undefined) fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: over.email } });
  if (over.telefone !== undefined) fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: over.telefone } });
}
const salvar = () => fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
const okInsert = () => ({ data: { id: "c1", razao_social: "ACME LTDA", situacao: "ativo" }, error: null, status: 201 });

beforeEach(() => {
  vi.clearAllMocks();
  m.chamadas.length = 0;
  sessionStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  m.respostas = { vinculos_usuarios: () => vinc(), contratantes: okInsert };
  definirPreferenciaOrganizacao(U, ORG);
});

describe("V1-02 rota", () => {
  it("1 head PT-BR com noindex", () => {
    const head = (Route as unknown as { options: { head: () => { meta: Array<{ title?: string; name?: string; content?: string }> } } }).options.head();
    expect(head.meta).toContainEqual({ title: "Novo contratante — ContaOS" });
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex" });
    expect(head.meta.find((x) => x.name === "description")?.content).toMatch(/contratante/);
  });
});

describe("V1-02 sessão e organização", () => {
  it("2a sem sessão vai a /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
  });
  it("2b erro de getUser mostra retry sem logout", async () => {
    m.getUser.mockRejectedValueOnce(new Error("rede"));
    montar();
    const b = await screen.findByRole("button", { name: "Tentar novamente" });
    expect(m.signOut).not.toHaveBeenCalled();
    expect(m.nav).not.toHaveBeenCalled();
    fireEvent.click(b);
    expect(await screen.findByLabelText(/Razão social/)).toBeTruthy();
  });
  it("3 sem preferência vai a /selecionar-organizacao", async () => {
    sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });
});

describe("V1-02 gate UX do próprio vínculo", () => {
  it.each(["administrador", "gestor_contrato"])("4 %s ativo e vigente vê formulário; consulta exata", async (perfil) => {
    m.respostas.vinculos_usuarios = () => vinc({ perfil, fim_em: futuro });
    montar();
    await screen.findByLabelText(/Razão social/);
    const g = m.chamadas.find((c) => c.tabela === "vinculos_usuarios")!;
    expect(op(g, "select")).toEqual([["perfil,ativo,inicio_em,fim_em"]]);
    expect(op(g, "eq")).toEqual([
      ["id_organizacao", ORG],
      ["id_usuario", U],
    ]);
    expect(op(g, "maybeSingle")).toHaveLength(1);
  });
  it.each([
    ["leitor", { perfil: "leitor" }],
    ["inativo", { ativo: false }],
    ["expirado", { fim_em: passado }],
    ["futuro", { inicio_em: futuro }],
  ])("5 %s → negado sem formulário", async (_n, over) => {
    m.respostas.vinculos_usuarios = () => vinc(over);
    montar();
    expect(await screen.findByText(MENSAGENS_V102.negado)).toBeTruthy();
    expect(screen.queryByLabelText(/Razão social/)).toBeNull();
    expect(inserts()).toHaveLength(0);
  });
  it("5 vínculo nulo → negado", async () => {
    m.respostas.vinculos_usuarios = () => ({ data: null, error: null, status: 200 });
    montar();
    expect(await screen.findByText(MENSAGENS_V102.negado)).toBeTruthy();
  });
  it("vinculoPermiteCadastro respeita fronteiras de vigência", () => {
    const agora = new Date("2026-11-02T12:00:00Z");
    expect(vinculoPermiteCadastro({ perfil: "gestor_contrato", ativo: true, inicio_em: "2026-11-02T12:00:00Z", fim_em: null }, agora)).toBe(true);
    expect(vinculoPermiteCadastro({ perfil: "gestor_contrato", ativo: true, inicio_em: passado, fim_em: "2026-11-02T12:00:00Z" }, agora)).toBe(false);
  });
  it.each([
    ["401", { data: null, error: { message: "x" }, status: 401 }],
    ["403", { data: null, error: { message: "x" }, status: 403 }],
    ["42501", { data: null, error: { code: "42501" }, status: 400 }],
    ["PGRST301", { data: null, error: { code: "PGRST301" }, status: 400 }],
  ])("6 gate %s → negado", async (_n, r) => {
    m.respostas.vinculos_usuarios = () => r;
    montar();
    expect(await screen.findByText(MENSAGENS_V102.negado)).toBeTruthy();
  });
  it("6 gate 500 e rede → erro genérico com retry", async () => {
    m.respostas.vinculos_usuarios = () => ({ data: null, error: { code: "XX000", message: "stack secreto" }, status: 500 });
    montar();
    expect(await screen.findByText(MENSAGENS_V102.erroGate)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/XX000|stack/);
    m.respostas.vinculos_usuarios = () => {
      throw new TypeError("Failed to fetch");
    };
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(MENSAGENS_V102.erroGate)).toBeTruthy();
    m.respostas.vinculos_usuarios = () => vinc();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByLabelText(/Razão social/)).toBeTruthy();
  });
});

describe("V1-02 payload e validação", () => {
  it("7 payload exato com nulos e contato vazio", async () => {
    montar();
    await preencher({ documento: "  ", fantasia: "  " });
    salvar();
    await screen.findByText(MENSAGENS_V102.sucesso);
    const c = inserts()[0]!;
    const [payload] = op(c, "insert")[0] as [Record<string, unknown>];
    expect(Object.keys(payload).sort()).toEqual(
      ["contato", "documento", "id_organizacao", "nome_fantasia", "razao_social", "situacao", "tipo_pessoa"].sort(),
    );
    expect(payload).toEqual({
      id_organizacao: ORG,
      tipo_pessoa: "juridica",
      documento: null,
      razao_social: "ACME LTDA",
      nome_fantasia: null,
      contato: {},
      situacao: "ativo",
    });
    expect(op(c, "select")).toEqual([["id,razao_social,situacao"]]);
    expect(op(c, "single")).toHaveLength(1);
  });
  it("7 montarPayload: documento literal com trim; contato só chaves preenchidas", () => {
    const base = { razaoSocial: " X ", tipoPessoa: "fisica", documento: " 123.456.789-01 ", nomeFantasia: " F ", email: " a@b.co ", telefone: "", situacao: "inativo" };
    expect(montarPayload(ORG, base)).toEqual({
      id_organizacao: ORG,
      tipo_pessoa: "fisica",
      documento: "123.456.789-01",
      razao_social: "X",
      nome_fantasia: "F",
      contato: { email: "a@b.co" },
      situacao: "inativo",
    });
    expect(montarPayload(ORG, { ...base, telefone: " (11) 91234-5678 " }).contato).toEqual({ email: "a@b.co", telefone: "(11) 91234-5678" });
  });
  it("8 campos obrigatórios vazios bloqueiam INSERT e focam o primeiro inválido", async () => {
    montar();
    await preencher({ razao: "   ", tipo: "" });
    salvar();
    expect(await screen.findByText(MENSAGENS_V102.validacao)).toBeTruthy();
    const razao = screen.getByLabelText(/Razão social/);
    expect(razao.getAttribute("aria-invalid")).toBe("true");
    expect(razao.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByLabelText(/Tipo de pessoa/).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(razao);
    expect(inserts()).toHaveLength(0);
  });
  it("8 e-mail inválido bloqueia e foca e-mail", async () => {
    montar();
    await preencher({ email: "sem-arroba" });
    salvar();
    await screen.findByText(MENSAGENS_V102.validacao);
    expect(document.activeElement).toBe(screen.getByLabelText(/E-mail/));
    expect(inserts()).toHaveLength(0);
  });
  it("9 duplo clique gera um único INSERT", async () => {
    let resolver: (v: unknown) => void = () => undefined;
    m.respostas.contratantes = () => new Promise((r) => (resolver = r));
    montar();
    await preencher();
    const b = screen.getByRole("button", { name: "Salvar" });
    fireEvent.click(b);
    fireEvent.click(b);
    await waitFor(() => expect(inserts()).toHaveLength(1));
    fireEvent.click(b);
    await waitFor(() => expect(screen.getByRole("button", { name: /Salvando/ }).hasAttribute("disabled")).toBe(true));
    resolver(okInsert());
    await screen.findByText(MENSAGENS_V102.sucesso);
    expect(inserts()).toHaveLength(1);
  });
});

describe("V1-02 erros do INSERT", () => {
  it.each([
    ["23505", { code: "23505" }, 409, "duplicado"],
    ["23502", { code: "23502" }, 400, "invalido"],
    ["23514", { code: "23514" }, 400, "invalido"],
    ["500", { code: "XX000" }, 500, "erroEnvio"],
  ] as const)("10 %s → mensagem amigável, formulário mantido", async (_n, error, status, chave) => {
    m.respostas.contratantes = () => ({ data: null, error: { ...error, message: "detalhe constraint stack", details: "d", hint: "h" }, status });
    montar();
    await preencher({ documento: "123" });
    salvar();
    expect(await screen.findByText(MENSAGENS_V102[chave])).toBeTruthy();
    expect(screen.getByLabelText(/Razão social/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/23505|23502|23514|XX000|constraint|stack|detalhe/);
    if (chave === "duplicado") await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/^Documento/)));
  });
  it("10 rede → erro genérico", async () => {
    m.respostas.contratantes = () => {
      throw new TypeError("Failed to fetch");
    };
    montar();
    await preencher();
    salvar();
    expect(await screen.findByText(MENSAGENS_V102.erroEnvio)).toBeTruthy();
  });
  it.each([
    ["42501", { code: "42501" }, 403],
    ["401", { message: "x" }, 401],
    ["PGRST301", { code: "PGRST301" }, 400],
  ])("11 RLS %s no INSERT → negado sem reenvio", async (_n, error, status) => {
    m.respostas.contratantes = () => ({ data: null, error, status });
    montar();
    await preencher();
    salvar();
    expect(await screen.findByText(MENSAGENS_V102.negadoInsert)).toBeTruthy();
    expect(screen.queryByLabelText(/Razão social/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Salvar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).toBeNull();
  });
});

describe("V1-02 sucesso, navegação e apresentação", () => {
  it("12 sucesso desmonta formulário, status acessível, foco e link", async () => {
    montar();
    await preencher();
    salvar();
    const st = await screen.findByRole("status");
    expect(st.textContent).toContain(MENSAGENS_V102.sucesso);
    expect(screen.queryByLabelText(/Razão social/)).toBeNull();
    const titulo = screen.getByRole("heading", { name: MENSAGENS_V102.sucesso });
    await waitFor(() => expect(document.activeElement).toBe(titulo));
    expect(screen.getByRole("link", { name: "Voltar para contratantes" }).getAttribute("href")).toBe("/contratantes");
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs.some((h) => /\/contratantes\/.+/.test(h ?? ""))).toBe(false);
  });
  it("13 opções oficiais e situação padrão Ativo", async () => {
    montar();
    const tipo = (await screen.findByLabelText(/Tipo de pessoa/)) as HTMLSelectElement;
    expect([...tipo.options].map((o) => [o.value, o.textContent])).toEqual([
      ["", "Selecione"],
      ["juridica", "Pessoa jurídica"],
      ["fisica", "Pessoa física"],
      ["orgao_publico", "Órgão público"],
      ["outro", "Outro"],
    ]);
    expect(tipo.value).toBe("");
    const sit = screen.getByLabelText(/^Situação/) as HTMLSelectElement;
    expect([...sit.options].map((o) => [o.value, o.textContent])).toEqual([
      ["ativo", "Ativo"],
      ["inativo", "Inativo"],
    ]);
    expect(sit.value).toBe("ativo");
    expect(screen.getByLabelText(/Razão social/).hasAttribute("required")).toBe(true);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
  it("14 Cancelar aponta para /contratantes; alvos principais com 44px; Enter envia", async () => {
    montar();
    await preencher();
    const cancelar = screen.getByRole("link", { name: "Cancelar" });
    expect(cancelar.getAttribute("href")).toBe("/contratantes");
    for (const el of [cancelar, screen.getByRole("button", { name: "Salvar" }), screen.getByLabelText(/Razão social/), screen.getByRole("button", { name: "Sair" })]) {
      expect(el.className).toMatch(/\bh-11\b|\bmin-h-11\b/);
    }
    fireEvent.submit(screen.getByLabelText(/Razão social/).closest("form")!);
    await screen.findByText(MENSAGENS_V102.sucesso);
    expect(inserts()).toHaveLength(1);
  });
  it("16 Sair limpa sessão e vai a /login", async () => {
    montar();
    await screen.findByLabelText(/Razão social/);
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.signOut).toHaveBeenCalledTimes(1);
  });
});

describe("V1-02 segurança de código", () => {
  it("15 sem RPC/Edge/DML extra/segredos/storage nos arquivos novos", () => {
    const arquivos = [
      "src/components/contratantes/NovoContratante.tsx",
      "src/lib/contratantes/novoContratanteDados.ts",
      "src/routes/contratantes_.novo.tsx",
    ];
    const proibido = /service_role|sb_secret|auth\.admin|auth\.users|\.rpc\(|functions\.invoke|\.update\(|\.delete\(|\.upsert\(|localStorage|sessionStorage|placeholderData|keepPreviousData/;
    let inserts = 0;
    for (const a of arquivos) {
      const s = readFileSync(a, "utf8");
      expect(s).not.toMatch(proibido);
      inserts += (s.match(/\.insert\(/g) ?? []).length;
      if (a !== "src/lib/contratantes/novoContratanteDados.ts") expect(s).not.toMatch(/\.insert\(/);
    }
    expect(inserts).toBe(1);
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.invoke).not.toHaveBeenCalled();
  });
});

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
  useParams: () => ({ id: "c1" }),
  createFileRoute: () => (o: unknown) => ({ options: o, useParams: () => ({ id: "c1" }) }),
  Link: ({ children, to, ...p }: { children: ReactNode; to: string }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

import { EditarContratante, MENSAGENS_V103 } from "@/components/contratantes/EditarContratante";
import { classificarErroV103, montarArgsAtualizacao } from "@/lib/contratantes/editarContratanteDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratantes_.$id.editar";

const U = "user-1";
const ORG = "org-1";
const ID = "c1";
const COLS = "id,id_organizacao,tipo_pessoa,documento,razao_social,nome_fantasia,contato,situacao,versao_registro,atualizado_em";
const vinc = (over: Record<string, unknown> = {}) => ({
  data: { perfil: "administrador", ativo: true, inicio_em: "2020-01-01T00:00:00Z", fim_em: null, ...over },
  error: null,
  status: 200,
});
const reg = (over: Record<string, unknown> = {}) => ({
  id: ID,
  id_organizacao: ORG,
  tipo_pessoa: "juridica",
  documento: "12345678000199",
  razao_social: "ACME LTDA",
  nome_fantasia: "Acme",
  contato: { email: "a@acme.com", telefone: "11999" },
  situacao: "ativo",
  versao_registro: 7,
  atualizado_em: "2026-11-01T10:00:00Z",
  ...over,
});
const okGet = (over: Record<string, unknown> = {}) => () => ({ data: reg(over), error: null, status: 200 });
const okRpc = (over: Record<string, unknown> = {}) => ({
  data: { schema_versao: "v103-v1", contratante: reg({ versao_registro: 8, ...over }) },
  error: null,
  status: 200,
});

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EditarContratante id={ID} />
    </QueryClientProvider>,
  );
}
const gets = () => m.chamadas.filter((c) => c.tabela === "contratantes");
const op = (c: Chamada, nome: string) => c.ops.filter((o) => o[0] === nome).map((o) => o[1]);
const salvar = () => fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
const razao = () => screen.getByLabelText(/Razão social/) as HTMLInputElement;

beforeEach(() => {
  vi.clearAllMocks();
  m.chamadas.length = 0;
  sessionStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  m.rpc.mockResolvedValue(okRpc());
  m.respostas = { vinculos_usuarios: () => vinc(), contratantes: okGet() };
  definirPreferenciaOrganizacao(U, ORG);
});

describe("V1-03 rota", () => {
  it("head PT-BR noindex", () => {
    const head = (Route as unknown as { options: { head: () => { meta: Array<Record<string, string>> } } }).options.head();
    expect(head.meta).toContainEqual({ title: "Editar contratante — ContaOS" });
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex" });
  });
});

describe("V1-03 sessão/org/gate", () => {
  it("sem sessão → /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
  });
  it("erro getUser → retry sem logout", async () => {
    m.getUser.mockRejectedValueOnce(new Error("x"));
    montar();
    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
    expect(m.signOut).not.toHaveBeenCalled();
    expect(await screen.findByLabelText(/Razão social/)).toBeTruthy();
  });
  it("sem preferência → /selecionar-organizacao", async () => {
    sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });
  it.each([{ perfil: "leitor" }, { ativo: false }])("gate negativo %o → negado, zero GET/RPC", async (over) => {
    m.respostas.vinculos_usuarios = () => vinc(over);
    montar();
    expect(await screen.findByText(MENSAGENS_V103.negado)).toBeTruthy();
    expect(gets()).toHaveLength(0);
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("gestor_contrato liberado", async () => {
    m.respostas.vinculos_usuarios = () => vinc({ perfil: "gestor_contrato" });
    montar();
    expect(await screen.findByLabelText(/Razão social/)).toBeTruthy();
  });
});

describe("V1-03 leitura", () => {
  it("GET exato com org+id+versão e pré-preenchimento", async () => {
    montar();
    await screen.findByLabelText(/Razão social/);
    const g = gets()[0]!;
    expect(op(g, "select")).toEqual([[COLS]]);
    expect(op(g, "eq")).toEqual([
      ["id_organizacao", ORG],
      ["id", ID],
    ]);
    expect(op(g, "maybeSingle")).toHaveLength(1);
    expect(razao().value).toBe("ACME LTDA");
    expect((screen.getByLabelText(/E-mail/) as HTMLInputElement).value).toBe("a@acme.com");
    expect((screen.getByLabelText(/Telefone/) as HTMLInputElement).value).toBe("11999");
    expect(screen.getByText(/Versão 7/)).toBeTruthy();
  });
  it("null → não encontrado", async () => {
    m.respostas.contratantes = () => ({ data: null, error: null, status: 200 });
    montar();
    expect(await screen.findByText(MENSAGENS_V103.naoEncontrado)).toBeTruthy();
  });
  it.each([
    { error: { code: "42501" }, status: 403 },
    { error: { code: "PGRST301" }, status: 401 },
    { error: { message: "x" }, status: 403 },
  ])("negado %o nunca vira não encontrado", async (r) => {
    m.respostas.contratantes = () => ({ data: null, ...r });
    montar();
    expect(await screen.findByText(MENSAGENS_V103.negado)).toBeTruthy();
    expect(screen.queryByText(MENSAGENS_V103.naoEncontrado)).toBeNull();
  });
  it("500 → erro técnico com retry", async () => {
    m.respostas.contratantes = () => ({ data: null, error: { code: "XX000", message: "stack secreto" }, status: 500 });
    montar();
    expect(await screen.findByText(MENSAGENS_V103.erroCarga)).toBeTruthy();
    expect(screen.queryByText(/stack secreto|XX000/)).toBeNull();
  });
});

describe("V1-03 salvamento", () => {
  it("validação local bloqueia RPC", async () => {
    montar();
    await screen.findByLabelText(/Razão social/);
    fireEvent.change(razao(), { target: { value: "  " } });
    salvar();
    expect(await screen.findByText(MENSAGENS_V103.validacao)).toBeTruthy();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("RPC exata 9 args, versão lida sem +1, strings vazias", async () => {
    montar();
    await screen.findByLabelText(/Razão social/);
    fireEvent.change(screen.getByLabelText(/^Documento/), { target: { value: "  " } });
    fireEvent.change(screen.getByLabelText(/Nome fantasia/), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: "" } });
    salvar();
    await screen.findByText(MENSAGENS_V103.sucesso);
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("atualizar_contratante", {
      p_id_organizacao: ORG,
      p_id_contratante: ID,
      p_versao_esperada: 7,
      p_tipo_pessoa: "juridica",
      p_documento: "",
      p_razao_social: "ACME LTDA",
      p_nome_fantasia: "",
      p_contato: { email: "a@acme.com" },
      p_situacao: "ativo",
    });
    expect(screen.getByText(/Versão 8/)).toBeTruthy();
    expect(screen.queryByLabelText(/Razão social/)).toBeNull();
  });
  it("montarArgsAtualizacao não incrementa", () => {
    const a = montarArgsAtualizacao(ORG, ID, 41, { razaoSocial: "X", tipoPessoa: "fisica", documento: " 1 ", nomeFantasia: " F ", email: "", telefone: " 9 ", situacao: "inativo" });
    expect(a.p_versao_esperada).toBe(41);
    expect(a.p_documento).toBe("1");
    expect(a.p_nome_fantasia).toBe("F");
    expect(a.p_contato).toEqual({ telefone: "9" });
  });
  it("duplo submit → 1 RPC", async () => {
    let resolver: (v: unknown) => void = () => undefined;
    m.rpc.mockReturnValue(new Promise((r) => (resolver = r)));
    montar();
    await screen.findByLabelText(/Razão social/);
    const form = razao().closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(m.rpc).toHaveBeenCalledTimes(1);
    resolver(okRpc());
    await screen.findByText(MENSAGENS_V103.sucesso);
  });
  it("schema_versao inválida → erro", async () => {
    m.rpc.mockResolvedValue({ data: { schema_versao: "v0", contratante: reg() }, error: null, status: 200 });
    montar();
    await screen.findByLabelText(/Razão social/);
    salvar();
    expect(await screen.findByText(MENSAGENS_V103.erroEnvio)).toBeTruthy();
  });
  it("23505 → duplicado com foco no Documento", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "23505" }, status: 409 });
    montar();
    await screen.findByLabelText(/Razão social/);
    salvar();
    expect(await screen.findByText(MENSAGENS_V103.duplicado)).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/^Documento/)));
  });
  it("PT422 → inválido, form permanece", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "PT422" }, status: 400 });
    montar();
    await screen.findByLabelText(/Razão social/);
    salvar();
    expect(await screen.findByText(MENSAGENS_V103.invalido)).toBeTruthy();
    expect(razao()).toBeTruthy();
  });
  it("42501 no save → negado", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "42501" }, status: 403 });
    montar();
    await screen.findByLabelText(/Razão social/);
    salvar();
    expect(await screen.findByText(MENSAGENS_V103.negado)).toBeTruthy();
  });
  it("Cancelar aponta para /contratantes sem RPC", async () => {
    montar();
    await screen.findByLabelText(/Razão social/);
    expect(screen.getByRole("link", { name: "Cancelar" }).getAttribute("href")).toBe("/contratantes");
    expect(m.rpc).not.toHaveBeenCalled();
  });
});

describe("V1-03 conflito PT409", () => {
  async function conflito() {
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "PT409" }, status: 409 });
    montar();
    await screen.findByLabelText(/Razão social/);
    fireEvent.change(razao(), { target: { value: "LOCAL" } });
    salvar();
    await screen.findByText(MENSAGENS_V103.conflitoTitulo);
  }
  it("sem retry automático; valores locais preservados", async () => {
    await conflito();
    await new Promise((r) => setTimeout(r, 30));
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(razao().value).toBe("LOCAL");
    expect(screen.queryByText(MENSAGENS_V103.erroEnvio)).toBeNull();
    expect(screen.queryByRole("button", { name: /salvar assim mesmo/i })).toBeNull();
  });
  it("reload substitui form e versão; save só após clique manual com nova versão", async () => {
    await conflito();
    m.respostas.contratantes = okGet({ razao_social: "REMOTO", versao_registro: 9 });
    fireEvent.click(screen.getByRole("button", { name: "Recarregar versão atual" }));
    expect(await screen.findByText(/substituídos pela versão atual \(versão 9\)/)).toBeTruthy();
    expect(razao().value).toBe("REMOTO");
    expect(m.rpc).toHaveBeenCalledTimes(1);
    m.rpc.mockResolvedValue(okRpc({ versao_registro: 10 }));
    salvar();
    await screen.findByText(MENSAGENS_V103.sucesso);
    expect(m.rpc).toHaveBeenCalledTimes(2);
    expect(m.rpc.mock.calls[1]?.[1]).toMatchObject({ p_versao_esperada: 9, p_razao_social: "REMOTO" });
  });
  it.each([
    [() => ({ data: null, error: null, status: 200 }), "reloadNaoEncontrado"],
    [() => ({ data: null, error: { code: "42501" }, status: 403 }), "reloadNegado"],
    [() => ({ data: null, error: { code: "XX" }, status: 500 }), "reloadErro"],
  ] as const)("reload falho preserva valores locais (%#)", async (resp, chave) => {
    await conflito();
    m.respostas.contratantes = resp;
    fireEvent.click(screen.getByRole("button", { name: "Recarregar versão atual" }));
    expect(await screen.findByText(MENSAGENS_V103[chave])).toBeTruthy();
    expect(razao().value).toBe("LOCAL");
  });
  it("Cancelar conflito mantém form local sem chamadas", async () => {
    await conflito();
    const n = gets().length;
    fireEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(screen.queryByText(MENSAGENS_V103.conflitoTitulo)).toBeNull();
    expect(razao().value).toBe("LOCAL");
    expect(gets().length).toBe(n);
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });
});

describe("V1-03 classificação e superfície", () => {
  it("classifica códigos oficiais", () => {
    expect(classificarErroV103({ error: { code: "PT409" } }).tipo).toBe("conflito");
    expect(classificarErroV103({ error: { code: "PT404" } }).tipo).toBe("nao_encontrado");
    expect(classificarErroV103({ error: {}, status: 401 }).tipo).toBe("negado");
    expect(classificarErroV103({ error: { code: "23514" } }).tipo).toBe("invalido");
    expect(classificarErroV103({ error: {}, status: 500 }).tipo).toBe("erro");
  });
  it("sem DML/Edge/secrets; único rpc é atualizar_contratante", () => {
    const src = ["src/lib/contratantes/editarContratanteDados.ts", "src/components/contratantes/EditarContratante.tsx", "src/routes/contratantes_.$id.editar.tsx"]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    expect(src).not.toMatch(/\.(update|insert|delete|upsert)\(|functions\.invoke|service_role|sb_secret|localStorage|placeholderData/);
    const rpcs = [...src.matchAll(/\.rpc\(\s*"([^"]+)"/g)].map((x) => x[1]);
    expect(rpcs).toEqual(["atualizar_contratante"]);
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

type Resp = { data: unknown; error: unknown; status?: number; count?: number | null };
type Chamada = { tabela: string; ops: Array<[string, unknown[]]> };

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  invoke: vi.fn(),
  chamadas: [] as Array<{ tabela: string; ops: Array<[string, unknown[]]> }>,
  respostas: {} as Record<string, (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown>,
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c = { tabela, ops: [] as Array<[string, unknown[]]> };
    m.chamadas.push(c);
    const b: Record<string, unknown> = {};
    for (const op of ["select", "eq", "or", "order", "range", "maybeSingle", "ilike", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      try {
        const r = m.respostas[tabela]?.(c);
        return Promise.resolve(r).then(res, rej);
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

import { ListaContratantes, MENSAGENS_V101 } from "@/components/contratantes/ListaContratantes";
import { montarPadraoBusca, formatarDocumento } from "@/lib/contratantes/contratantesDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratantes";

const U = "user-1";
const ORG = "org-1";

function linha(i: number, over: Record<string, unknown> = {}) {
  return {
    id: `c${i}`,
    razao_social: `Contratante ${i} LTDA`,
    nome_fantasia: i % 2 ? `Fantasia ${i}` : null,
    documento: "12345678000190",
    tipo_pessoa: "juridica",
    situacao: "ativo",
    atualizado_em: "2026-11-02T13:05:00Z",
    ...over,
  };
}

const okOrg = (): Resp => ({ data: { id: ORG }, error: null, status: 200 });
function lista(itens: unknown[], count: number): Resp {
  return { data: itens, error: null, status: 200, count };
}

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ListaContratantes />
    </QueryClientProvider>,
  );
}

const listas = () => m.chamadas.filter((c) => c.tabela === "contratantes");
const ultima = () => listas().at(-1)!;
const op = (c: Chamada, nome: string) => c.ops.filter((o) => o[0] === nome).map((o) => o[1]);

beforeEach(() => {
  vi.clearAllMocks();
  m.chamadas.length = 0;
  sessionStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  m.respostas = { organizacoes: okOrg, contratantes: () => lista([linha(1), linha(2)], 2) };
  definirPreferenciaOrganizacao(U, ORG);
});

describe("V1-01 rota e sessão", () => {
  it("head com título único e componente renderiza h1", async () => {
    const head = (Route as unknown as { options: { head: () => { meta: Array<Record<string, string>> } } }).options.head();
    expect(head.meta.find((x) => x.title)?.title).toBe("Contratantes — ContaOS");
    montar();
    expect(await screen.findByRole("heading", { level: 1, name: "Contratantes" })).toBeInTheDocument();
  });

  it("usuário null leva a /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });

  it("erro técnico do getUser mostra retry sem redirecionar", async () => {
    m.getUser.mockRejectedValueOnce(new Error("rede"));
    montar();
    expect(await screen.findByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
    expect(m.nav).not.toHaveBeenCalled();
  });

  it("sem preferência leva a /selecionar-organizacao", async () => {
    sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
});

describe("V1-01 vazio x negado x erro", () => {
  it("organização acessível sem contratantes = vazio legítimo", async () => {
    m.respostas.contratantes = () => lista([], 0);
    montar();
    expect(await screen.findByText(MENSAGENS_V101.vazio)).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_V101.negado)).toBeNull();
  });

  it("organização invisível (0 linhas, sem erro) = negado e lista não é consultada", async () => {
    m.respostas.organizacoes = () => ({ data: null, error: null, status: 200 });
    montar();
    expect(await screen.findByText(MENSAGENS_V101.negado)).toBeInTheDocument();
    expect(listas()).toHaveLength(0);
    expect(screen.queryByText(MENSAGENS_V101.vazio)).toBeNull();
  });

  it.each([
    ["403 sem code", { data: null, error: { message: "x" }, status: 403 }],
    ["401", { data: null, error: { message: "x" }, status: 401 }],
    ["42501", { data: null, error: { code: "42501", message: "permission denied" }, status: 400 }],
    ["PGRST301", { data: null, error: { code: "PGRST301", message: "jwt" }, status: 400 }],
  ])("lista com %s = negado, nunca vazio", async (_n, r) => {
    m.respostas.contratantes = () => r;
    montar();
    expect(await screen.findByText(MENSAGENS_V101.negado)).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_V101.vazio)).toBeNull();
  });

  it("verificação de acesso com 403 = negado", async () => {
    m.respostas.organizacoes = () => ({ data: null, error: { message: "x" }, status: 403 });
    montar();
    expect(await screen.findByText(MENSAGENS_V101.negado)).toBeInTheDocument();
  });

  it.each([
    ["500", () => ({ data: null, error: { code: "XX000", message: "boom" }, status: 500 })],
    ["rede", () => { throw new TypeError("Failed to fetch"); }],
    ["data inválido", () => ({ data: { x: 1 }, error: null, status: 200, count: 1 })],
    ["count nulo", () => ({ data: [], error: null, status: 200, count: null })],
  ])("erro %s = mensagem genérica e retry refaz", async (_n, f) => {
    m.respostas.contratantes = f as () => Resp;
    montar();
    expect(await screen.findByText(MENSAGENS_V101.erro)).toBeInTheDocument();
    expect(screen.queryByText(/XX000|boom|Failed/)).toBeNull();
    const antes = listas().length;
    m.respostas.contratantes = () => lista([linha(1)], 1);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect((await screen.findAllByText("Contratante 1 LTDA")).length).toBeGreaterThan(0);
    expect(listas().length).toBeGreaterThan(antes);
  });
});

describe("V1-01 query Data API (093 paginação)", () => {
  it("SELECT exato com org, ordenação estável e range(0,24)", async () => {
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    const org = m.chamadas.find((c) => c.tabela === "organizacoes")!;
    expect(op(org, "select")[0]).toEqual(["id"]);
    expect(op(org, "eq")[0]).toEqual(["id", ORG]);
    const c = ultima();
    expect(op(c, "select")[0]).toEqual(["id,razao_social,nome_fantasia,documento,tipo_pessoa,situacao,atualizado_em", { count: "exact" }]);
    expect(op(c, "eq")).toEqual([["id_organizacao", ORG]]);
    expect(op(c, "order")).toEqual([["razao_social", { ascending: true }], ["id", { ascending: true }]]);
    expect(op(c, "range")).toEqual([[0, 24]]);
    expect(op(c, "or")).toHaveLength(0);
  });

  it("filtro situação é server-side e volta à página 1; Todos não filtra", async () => {
    m.respostas.contratantes = () => lista([linha(1)], 60);
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    await waitFor(() => expect(op(ultima(), "range")).toEqual([[25, 49]]));
    fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "inativo" } });
    await waitFor(() => expect(op(ultima(), "eq")).toContainEqual(["situacao", "inativo"]));
    expect(op(ultima(), "range")).toEqual([[0, 24]]);
    fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "todos" } });
    await waitFor(() => expect(op(ultima(), "eq")).toEqual([["id_organizacao", ORG]]));
  });

  it("busca server-side via .or sanitizado e volta à página 1", async () => {
    m.respostas.contratantes = () => lista([linha(1)], 60);
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    await waitFor(() => expect(op(ultima(), "range")).toEqual([[25, 49]]));
    fireEvent.change(screen.getByLabelText("Buscar por razão social, nome fantasia ou documento"), { target: { value: "  alfa  " } });
    await waitFor(() => expect(op(ultima(), "or")).toHaveLength(1), { timeout: 2000 });
    const p = '"*alfa*"';
    expect(op(ultima(), "or")[0]).toEqual([`razao_social.ilike.${p},nome_fantasia.ilike.${p},documento.ilike.${p}`]);
    expect(op(ultima(), "range")).toEqual([[0, 24]]);
  });

  it("entradas maliciosas viram um único valor entre aspas escapado", () => {
    expect(montarPadraoBusca("a,b")).toBe('"*a,b*"');
    expect(montarPadraoBusca("x)")).toBe('"*x)*"');
    expect(montarPadraoBusca("razao_social.eq.1")).toBe('"*razao\\\\_social.eq.1*"');
    expect(montarPadraoBusca("%_")).toBe('"*\\\\%\\\\_*"');
    expect(montarPadraoBusca('a"b')).toBe('"*a\\"b*"');
    expect(montarPadraoBusca("   ")).toBeNull();
    expect(montarPadraoBusca("x".repeat(300))!.length).toBe(100 + 4);
  });

  it("paginação mantém filtros, limites desabilitados e página além do fim volta à última", async () => {
    m.respostas.contratantes = (c) => {
      const r = op(c as Chamada, "range")[0] as number[];
      return r[0] === 0 ? lista([linha(1)], 30) : lista([linha(26)], 30);
    };
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "ativo" } });
    await waitFor(() => expect(op(ultima(), "eq")).toContainEqual(["situacao", "ativo"]));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    await waitFor(() => expect(op(ultima(), "range")).toEqual([[25, 49]]));
    expect(op(ultima(), "eq")).toContainEqual(["situacao", "ativo"]);
    expect(await screen.findByText("Página 2 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();

    // total encolhe: página 2 vazia com count 3 -> volta à página 1
    m.respostas.contratantes = (c) => {
      const r = op(c as Chamada, "range")[0] as number[];
      return r[0] === 0 ? lista([linha(1)], 3) : lista([], 3);
    };
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    await screen.findByText("Página 1 de 1");
    // força ir à página 2 inexistente via estado: simulamos com nova resposta
  });

  it("página além do fim não mostra vazio falso", async () => {
    let n = 0;
    m.respostas.contratantes = (c) => {
      n++;
      const r = op(c as Chamada, "range")[0] as number[];
      if (n === 1) return lista([linha(1)], 30);
      return r[0] === 0 ? lista([linha(1)], 3) : lista([], 3);
    };
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(await screen.findByText("Página 1 de 1")).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_V101.vazio)).toBeNull();
    expect(screen.queryByText(MENSAGENS_V101.vazioFiltro)).toBeNull();
  });
});

describe("V1-01 apresentação", () => {
  it("rótulos PT-BR, máscara visual, Não informado e data de Brasília", async () => {
    m.respostas.contratantes = () =>
      lista(
        [
          linha(1, { documento: "12345678000190" }),
          linha(2, { documento: "12345678901", tipo_pessoa: "fisica", situacao: "inativo" }),
          linha(3, { documento: null, tipo_pessoa: "orgao_publico" }),
          linha(4, { documento: "ABC-1", tipo_pessoa: "desconhecido_x", situacao: "suspenso_x" }),
        ],
        4,
      );
    montar();
    const tabela = await screen.findByRole("table");
    const t = within(tabela);
    expect(t.getByText("12.345.678/0001-90")).toBeInTheDocument();
    expect(t.getByText("123.456.789-01")).toBeInTheDocument();
    expect(t.getByText("Não informado")).toBeInTheDocument();
    expect(t.getByText("ABC-1")).toBeInTheDocument();
    expect(t.getAllByText("Pessoa jurídica").length).toBeGreaterThan(0);
    expect(t.getByText("Pessoa física")).toBeInTheDocument();
    expect(t.getByText("Órgão público")).toBeInTheDocument();
    expect(t.getByText("desconhecido_x")).toBeInTheDocument();
    expect(t.getByText("Inativo")).toBeInTheDocument();
    expect(t.getByText("suspenso_x")).toBeInTheDocument();
    expect(t.getAllByText("02/11/2026 10:05").length).toBe(4);
    expect(formatarDocumento("12345678000190")).toBe("12.345.678/0001-90");
  });

  it("cards mobile contêm razão social, documento e situação", async () => {
    montar();
    const cards = await screen.findByRole("list", { name: "Contratantes (lista compacta)" });
    const c = within(cards);
    expect(c.getByText("Contratante 1 LTDA")).toBeInTheDocument();
    expect(c.getAllByText("12.345.678/0001-90").length).toBe(2);
    expect(c.getAllByText("Ativo").length).toBe(2);
  });

  it("vazio com filtro oferece Limpar filtros", async () => {
    m.respostas.contratantes = () => lista([], 0);
    montar();
    await screen.findByText(MENSAGENS_V101.vazio);
    fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "inativo" } });
    expect(await screen.findByText(MENSAGENS_V101.vazioFiltro)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Limpar filtros" })[0]);
    expect(await screen.findByText(MENSAGENS_V101.vazio)).toBeInTheDocument();
  });
});

describe("V1-01 segurança e isolamento", () => {
  it("zero DML/RPC/Edge e nenhum link de criar/editar", async () => {
    montar();
    await screen.findAllByText("Contratante 1 LTDA");
    for (const c of m.chamadas) for (const [o] of c.ops) expect(["insert", "update", "delete", "upsert"]).not.toContain(o);
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.invoke).not.toHaveBeenCalled();
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs.some((h) => h?.startsWith("/contratantes/"))).toBe(false);
    expect(screen.queryByRole("button", { name: /novo|editar/i })).toBeNull();
  });

  it("código-fonte sem segredo, auth.admin, auth.users, DML ou select('*')", () => {
    const src = ["src/components/contratantes/ListaContratantes.tsx", "src/lib/contratantes/contratantesDados.ts", "src/routes/contratantes.tsx"]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    for (const p of [/service_role/, /sb_secret/, /auth\.admin/, /auth\.users/, /\.insert\(/, /\.update\(/, /\.delete\(/, /\.upsert\(/, /\.rpc\(/, /functions\.invoke/, /select\(\s*["']\*["']/])
      expect(src).not.toMatch(p);
  });

  it("trocar a organização preferida não mostra dados da anterior", async () => {
    m.respostas.contratantes = (c) => {
      const org = (op(c as Chamada, "eq")[0] as string[])[1];
      return lista([linha(1, { razao_social: org === ORG ? "Da Org Um" : "Da Org Dois" })], 1);
    };
    const v = montar();
    await screen.findAllByText("Da Org Um");
    v.unmount();
    definirPreferenciaOrganizacao(U, "org-2");
    m.respostas.organizacoes = () => ({ data: { id: "org-2" }, error: null, status: 200 });
    montar();
    await screen.findAllByText("Da Org Dois");
    expect(screen.queryByText("Da Org Um")).toBeNull();
    await act(async () => undefined);
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
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
  respostas: {} as { organizacoes?: (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown; contratos?: (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown },
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c = { tabela, ops: [] as Array<[string, unknown[]]> };
    m.chamadas.push(c);
    const b: { [k: string]: unknown } = {};
    for (const op of ["select", "eq", "order", "range", "maybeSingle", "abortSignal", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      try {
        return Promise.resolve(m.respostas[tabela as "organizacoes" | "contratos"]?.(c)).then(res, rej);
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

import { ListaContratos, MENSAGENS_V104 } from "@/components/contratos/ListaContratos";
import { listarContratos, COLUNAS_CONTRATO, formatarMoeda, formatarVigencia } from "@/lib/contratos/contratosDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos";

const U = "user-1";
const A = "org-A";
const B = "org-B";

const contrato = (i: number, org: string) => ({
  id: `${org}-k${i}`,
  id_organizacao: org,
  numero: `${org}-N${String(i).padStart(3, "0")}`,
  objeto: `Objeto ${org} ${i}`,
  situacao: "ativo",
  criticidade: "alta",
  inicio: "2026-01-01",
  fim: "2026-12-31",
  valor_global: 1234.5,
});
const orgOk = (c: Chamada) => ({ data: { id: (c.ops.find((o) => o[0] === "eq")![1][1]) }, error: null, status: 200 });
const orgDe = (c: Chamada) => c.ops.find((o) => o[0] === "eq" && o[1][0] === "id_organizacao")?.[1][1] as string;
const lista = (org: string, n: number, total = n) => ({ data: Array.from({ length: n }, (_, i) => contrato(i, org)), error: null, status: 200, count: total });

function montar(qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return { qc, ...render(<QueryClientProvider client={qc}><ListaContratos /></QueryClientProvider>) };
}
const consultasContratos = () => m.chamadas.filter((c) => c.tabela === "contratos");

beforeEach(() => {
  m.chamadas.length = 0;
  m.respostas = {};
  m.nav.mockReset();
  m.rpc.mockReset();
  m.invoke.mockReset();
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-04 dados", () => {
  it("Q2 exata: colunas, org, ordens, range 0..24 e 25..49, count e abort", async () => {
    m.respostas.contratos = () => lista(A, 25, 30);
    const s = new AbortController().signal;
    const r = await listarContratos({ idOrganizacao: A, pagina: 1 }, s);
    const ops = consultasContratos()[0]!.ops;
    expect(ops).toContainEqual(["select", [COLUNAS_CONTRATO, { count: "exact" }]]);
    expect(COLUNAS_CONTRATO).toBe("id,id_organizacao,numero,objeto,situacao,criticidade,inicio,fim,valor_global");
    expect(ops).toContainEqual(["eq", ["id_organizacao", A]]);
    expect(ops.filter((o) => o[0] === "order")).toEqual([["order", ["numero", { ascending: true }]], ["order", ["id", { ascending: true }]]]);
    expect(ops).toContainEqual(["range", [0, 24]]);
    expect(ops).toContainEqual(["abortSignal", [s]]);
    expect(r.totalPaginas).toBe(2);
    await listarContratos({ idOrganizacao: A, pagina: 2 });
    expect(consultasContratos()[1]!.ops).toContainEqual(["range", [25, 49]]);
  });

  it("classifica 403/42501/PGRST301 como negado e 500 como erro", async () => {
    for (const [r, t] of [[{ status: 403, error: {} }, "negado"], [{ status: 400, error: { code: "42501" } }, "negado"], [{ status: 401, error: { code: "PGRST301" } }, "negado"], [{ status: 500, error: {} }, "erro"]] as const) {
      m.respostas.contratos = () => ({ data: null, count: null, ...r });
      await expect(listarContratos({ idOrganizacao: A, pagina: 1 })).rejects.toMatchObject({ tipo: t });
    }
  });

  it("formata BRL e vigência DD/MM/AAAA", () => {
    expect(formatarMoeda(1234.5)).toMatch(/R\$\s?1\.234,50/);
    expect(formatarMoeda(null)).toBe("—");
    expect(formatarVigencia("2026-01-01", "2026-12-31")).toBe("01/01/2026 – 31/12/2026");
    expect(formatarVigencia(null, null)).toBe("—");
  });
});

describe("V1-04 sessão e contexto", () => {
  it("sem sessão vai para /login, sem consultas", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("erro técnico de sessão oferece retry sem logout", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: { name: "AuthRetryableFetchError" } });
    montar();
    expect(await screen.findByText(MENSAGENS_V104.erroSessao)).toBeInTheDocument();
    expect(m.signOut).not.toHaveBeenCalled();
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = () => lista(A, 1);
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(await screen.findByText("org-A-N000", { selector: "td" })).toBeInTheDocument();
  });
  it("sem preferência vai para /selecionar-organizacao", async () => {
    window.sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });
  it("Q1 negativo => negado e zero Q2", async () => {
    m.respostas.organizacoes = () => ({ data: null, error: null, status: 200 });
    montar();
    expect(await screen.findByText(MENSAGENS_V104.negado)).toBeInTheDocument();
    expect(consultasContratos()).toHaveLength(0);
  });
});

describe("V1-04 estados", () => {
  it("vazio (RLS 0 linhas) é distinto de negado", async () => {
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = () => lista(A, 0);
    montar();
    expect(await screen.findByText(MENSAGENS_V104.vazio)).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_V104.negado)).toBeNull();
  });
  it("Q2 403 => negado, não vazio", async () => {
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = () => ({ data: null, error: { code: "42501" }, status: 403, count: null });
    montar();
    expect(await screen.findByText(MENSAGENS_V104.negado)).toBeInTheDocument();
    expect(screen.queryByText(MENSAGENS_V104.vazio)).toBeNull();
  });
  it("erro técnico com retry e sem detalhes técnicos", async () => {
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = () => ({ data: null, error: { code: "XX000", message: "boom detail" }, status: 500, count: null });
    montar();
    expect(await screen.findByText(MENSAGENS_V104.erro)).toBeInTheDocument();
    expect(screen.queryByText(/boom|XX000/)).toBeNull();
  });
  it("sucesso: campos oficiais, um H1, paginação >=44px e próxima página", async () => {
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = (c) => (c.ops.some((o) => o[0] === "range" && o[1][0] === 25) ? { ...lista(A, 1, 26), data: [contrato(99, A)] } : lista(A, 25, 26));
    montar();
    const tabela = await screen.findByRole("table");
    expect(within(tabela).getByText("org-A-N000")).toBeInTheDocument();
    expect(within(tabela).getAllByText("alta").length).toBeGreaterThan(0);
    expect(within(tabela).getAllByText("01/01/2026 – 31/12/2026").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Selecionar organização/ })).toHaveAttribute("href", "/selecionar-organizacao");
    const prox = screen.getByRole("button", { name: /Próxima/ });
    expect(prox.className).toContain("h-11");
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    fireEvent.click(prox);
    expect(await screen.findByText("org-A-N099", { selector: "td" })).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });
});

describe("V1-04 multi-organização", () => {
  it("A -> B -> A: limpa dados, loading explícito, página 1, query por org", async () => {
    m.respostas.organizacoes = orgOk;
    m.respostas.contratos = (c) => lista(orgDe(c), 25, 60);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const r1 = montar(qc);
    await screen.findByText("org-A-N000", { selector: "td" });
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }));
    await screen.findByText("Página 2 de 3");
    // troca SYS-04: limpa cache, grava B, remonta
    r1.unmount();
    qc.clear();
    definirPreferenciaOrganizacao(U, B);
    montar(qc);
    expect(screen.queryByText(/org-A-/)).toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
    await screen.findByText("org-B-N000", { selector: "td" });
    expect(screen.queryByText(/org-A-/)).toBeNull();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    const ultima = consultasContratos().at(-1)!;
    expect(ultima.ops).toContainEqual(["eq", ["id_organizacao", B]]);
    expect(ultima.ops).toContainEqual(["range", [0, 24]]);
    // B -> A
    qc.clear();
    definirPreferenciaOrganizacao(U, A);
    const atual = screen.getByText("org-B-N000", { selector: "td" });
    expect(atual).toBeInTheDocument();
  });

  it("resposta tardia de A não sobrescreve B", async () => {
    m.respostas.organizacoes = orgOk;
    let liberarA!: () => void;
    const pendenteA = new Promise<void>((r) => (liberarA = r));
    m.respostas.contratos = (c) => (orgDe(c) === A ? pendenteA.then(() => lista(A, 2)) : lista(B, 2));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const r1 = montar(qc);
    await waitFor(() => expect(consultasContratos()).toHaveLength(1));
    r1.unmount();
    qc.clear();
    definirPreferenciaOrganizacao(U, B);
    montar(qc);
    await screen.findByText("org-B-N000", { selector: "td" });
    await act(async () => {
      liberarA();
      await pendenteA;
    });
    expect(screen.queryByText(/org-A-/)).toBeNull();
    expect(screen.getByText("org-B-N000", { selector: "td" })).toBeInTheDocument();
  });

  it("query key inclui usuário, organização e página; sem placeholderData", () => {
    const src = readFileSync("src/components/contratos/ListaContratos.tsx", "utf8");
    expect(src).toMatch(/queryKey:\s*\["contratos",\s*"lista",\s*idUsuario,\s*idOrganizacao,\s*pagina\]/);
    expect(src).not.toMatch(/placeholderData|keepPreviousData/);
  });
});

describe("V1-04 Zero-Drift", () => {
  it("sem escrita, RPC ou Edge no domínio novo", () => {
    for (const f of ["src/lib/contratos/contratosDados.ts", "src/components/contratos/ListaContratos.tsx", "src/routes/contratos.tsx"]) {
      const s = readFileSync(f, "utf8");
      expect(s).not.toMatch(/\.(insert|update|delete|upsert|rpc)\(|functions\.invoke|service_role/);
    }
  });
  it("rota com head próprio e noindex", () => {
    const o = (Route as unknown as { options: { head: () => { meta: Array<Record<string, string>> }; ssr: boolean } }).options;
    const meta = o.head().meta;
    expect(meta).toContainEqual({ title: "Contratos — ContaOS" });
    expect(meta).toContainEqual({ name: "robots", content: "noindex" });
    expect(o.ssr).toBe(false);
  });
});

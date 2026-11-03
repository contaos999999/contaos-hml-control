import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

type Chamada = { tabela: string; ops: Array<[string, unknown[]]> };

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  chamadas: [] as Chamada[],
  resposta: null as null | ((c: Chamada) => unknown),
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c: Chamada = { tabela, ops: [] };
    m.chamadas.push(c);
    const b: { [k: string]: unknown } = {};
    for (const op of [
      "select",
      "eq",
      "order",
      "range",
      "maybeSingle",
      "abortSignal",
      "insert",
      "update",
      "upsert",
      "delete",
    ]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
      Promise.resolve(m.resposta?.(c)).then(res, rej);
    return b;
  };
  const rpc = (nome: string, args: Record<string, unknown>) => {
    const b: { [k: string]: unknown } = {};
    b["abortSignal"] = () => b;
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
      Promise.resolve(m.rpc(nome, args)).then(res, rej);
    return b;
  };
  return { supabase: { auth: { getUser: m.getUser }, from, rpc } };
});
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.nav,
  createFileRoute: (p: string) => (o: unknown) => ({
    path: p,
    options: o,
    useParams: () => ({ id: "x" }),
  }),
  Link: ({
    children,
    to,
    params,
    ...p
  }: {
    children: ReactNode;
    to: string;
    params?: { id?: string };
  }) => (
    <a href={params?.id ? to.replace("$id", params.id) : to} {...p}>
      {children}
    </a>
  ),
}));

import { NovaCompetencia } from "@/components/contratos/NovaCompetencia";
import {
  PERFIS_CRIAR_COMPETENCIA,
  classificarErroNovaCompetencia,
} from "@/lib/contratos/novaCompetenciaDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.competencias_.nova";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const NOVA = "33333333-3333-4333-8333-333333333333";

const ok = (d: unknown) => ({ data: d, error: null, status: 200 });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

function cenario(perfil: string | null = "gestor_contrato", existente: unknown = null) {
  m.resposta = (c) => {
    if (c.tabela === "contratos")
      return ok({ id: K1, id_organizacao: A, numero: "CT-001", objeto: "x", situacao: "ativo" });
    if (c.tabela === "vinculos_usuarios") return ok(perfil ? { perfil } : null);
    if (c.tabela === "competencias") return ok(existente);
    return ok(null);
  };
}
function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <NovaCompetencia id={id} />
    </QueryClientProvider>,
  );
}
async function preencher(mes = "2026-11") {
  const campo = await screen.findByLabelText(/Competência \(mês\/ano\)/);
  fireEvent.change(campo, { target: { value: mes } });
  return campo;
}
const criar = () => screen.getByRole("button", { name: /Criar competência/ });

beforeEach(() => {
  m.chamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset().mockResolvedValue({ data: NOVA, error: null, status: 200 });
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  window.localStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-13 rota e gates", () => {
  it("rota /contratos/:id/competencias/nova com ssr false e head PT-BR", () => {
    const r = Route as unknown as {
      path: string;
      options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
    };
    expect(r.path).toBe("/contratos_/$id_/competencias_/nova");
    expect(r.options.ssr).toBe(false);
    expect(r.options.head().meta[0]!["title"]).toMatch(/Nova competência/);
  });
  it("UUID inválido: zero Auth, Data API e RPC", async () => {
    montar("abc");
    expect(await screen.findByText("Contrato não encontrado.")).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.chamadas).toHaveLength(0);
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("sem sessão → login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("sem organização → selecionar", async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(m.chamadas).toHaveLength(0);
  });
  it("contrato 403 sanitizado, sem perfil nem RPC", async () => {
    m.resposta = (c) =>
      c.tabela === "contratos"
        ? { data: null, error: { code: "42501", message: "permission denied raw" }, status: 403 }
        : ok(null);
    montar();
    expect(await screen.findByText("Você não tem acesso a este contrato.")).toBeInTheDocument();
    expect(screen.queryByText(/raw/)).toBeNull();
    expect(de("vinculos_usuarios")).toHaveLength(0);
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("contrato inexistente sanitizado", async () => {
    m.resposta = () => ok(null);
    m.rpc.mockResolvedValue({ data: "nao_encontrado", error: null });
    montar();
    expect(await screen.findByText("Contrato não encontrado.")).toBeInTheDocument();
  });
});

describe("V1-13 perfil (UX, backend é autoridade)", () => {
  it("perfis exatos", () => {
    expect([...PERFIS_CRIAR_COMPETENCIA]).toEqual([
      "administrador",
      "gestor_contrato",
      "prestacao_contas",
    ]);
  });
  it("ordem do gate e SELECT explícito único de perfil", async () => {
    cenario();
    montar();
    await preencher();
    expect(m.chamadas.map((c) => c.tabela)).toEqual(["contratos", "vinculos_usuarios"]);
    const v = de("vinculos_usuarios")[0]!;
    expect(op(v, "select")[0]![0]).toBe("perfil");
    expect(op(v, "eq")).toEqual([
      ["id_usuario", U],
      ["id_organizacao", A],
    ]);
  });
  it.each(["administrador", "gestor_contrato", "prestacao_contas"])(
    "%s vê formulário",
    async (p) => {
      cenario(p);
      montar();
      await preencher();
      expect(criar()).toBeEnabled();
    },
  );
  it.each(["auditor", "leitor", null])("%s recebe sem permissão, sem form", async (p) => {
    cenario(p as string | null);
    montar();
    expect(
      await screen.findByText("Seu perfil não permite criar competências neste contrato."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Competência \(mês\/ano\)/)).toBeNull();
    expect(m.rpc).not.toHaveBeenCalled();
  });
});

describe("V1-13 comando criar_competencia", () => {
  it("2026-11 → RPC única com contrato + 2026-11-01, sem escrita direta", async () => {
    cenario();
    montar();
    await preencher("2026-11");
    fireEvent.click(criar());
    expect(await screen.findByText(/Competência 11\/2026 criada/)).toBeInTheDocument();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("criar_competencia", {
      p_id_contrato: K1,
      p_competencia_referencia: "2026-11-01",
    });
    for (const c of m.chamadas)
      for (const o of ["insert", "update", "upsert", "delete"]) expect(op(c, o)).toHaveLength(0);
    const voltar = screen.getByRole("link", { name: /Voltar para competências/ });
    expect(voltar.getAttribute("href")).toBe(`/contratos/${K1}/competencias`);
    expect(
      screen.queryAllByRole("link").some((a) => (a.getAttribute("href") ?? "").includes(NOVA)),
    ).toBe(false);
  });
  it("mês vazio: validação sem RPC", async () => {
    cenario();
    montar();
    await preencher("");
    fireEvent.click(criar());
    expect(
      await screen.findByText("Informe a competência no formato MM/AAAA."),
    ).toBeInTheDocument();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("duplo clique = uma RPC", async () => {
    let solta: (v: unknown) => void = () => {};
    m.rpc.mockImplementation(() => new Promise((r) => (solta = r)));
    cenario();
    montar();
    await preencher();
    fireEvent.click(criar());
    fireEvent.click(criar());
    fireEvent.click(criar());
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(1));
    expect(criar()).toBeDisabled();
    solta({ data: NOVA, error: null, status: 200 });
    await screen.findByText(/criada/);
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });
  it("23505 → duplicada amigável, sem segunda RPC", async () => {
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key competencias_contrato_mes_uk" },
      status: 409,
    });
    cenario();
    montar();
    await preencher();
    fireEvent.click(criar());
    expect(await screen.findByText("Já existe uma competência para este mês.")).toBeInTheDocument();
    expect(screen.queryByText(/duplicate key/)).toBeNull();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(de("competencias")).toHaveLength(0);
  });
  it("42501 → sem permissão sanitizado", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "raw" }, status: 403 });
    cenario();
    montar();
    await preencher();
    fireEvent.click(criar());
    expect(
      await screen.findByText("Você não tem permissão para criar competências neste contrato."),
    ).toBeInTheDocument();
    expect(screen.queryByText("raw")).toBeNull();
  });
  it("P0001 → erro genérico, nunca sem permissão nem texto bruto", async () => {
    expect(classificarErroNovaCompetencia({ code: "P0001" }, 400)).toBe("erro");
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "competencia_invalida raw" },
      status: 400,
    });
    cenario();
    montar();
    await preencher();
    fireEvent.click(criar());
    expect(
      await screen.findByText("Não foi possível criar a competência agora. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/raw/)).toBeNull();
    expect(screen.queryByText(/não tem permissão/)).toBeNull();
    expect(de("competencias")).toHaveLength(0);
  });
  it("ambíguo + existente → reconhece efeito sem segunda RPC (leitura exata)", async () => {
    m.rpc.mockRejectedValue(new TypeError("Failed to fetch"));
    cenario("gestor_contrato", { id: NOVA });
    montar();
    await preencher("2026-11");
    fireEvent.click(criar());
    expect(await screen.findByText(/Competência 11\/2026 criada/)).toBeInTheDocument();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    const c = de("competencias");
    expect(c).toHaveLength(1);
    expect(op(c[0]!, "select")[0]![0]).toBe("id");
    expect(op(c[0]!, "eq")).toEqual([
      ["id_contrato", K1],
      ["competencia_referencia", "2026-11-01"],
    ]);
    expect(op(c[0]!, "maybeSingle")).toHaveLength(1);
  });
  it("ambíguo + inexistente → erro com retry manual, sem retry automático", async () => {
    m.rpc.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    cenario("gestor_contrato", null);
    montar();
    await preencher();
    fireEvent.click(criar());
    expect(
      await screen.findByText("Não foi possível criar a competência agora. Tente novamente."),
    ).toBeInTheDocument();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    fireEvent.click(criar());
    await screen.findByText(/criada/);
    expect(m.rpc).toHaveBeenCalledTimes(2);
  });
  it("Cancelar volta para V1-12 sem RPC", async () => {
    cenario();
    montar();
    await preencher();
    const cancelar = screen.getByRole("link", { name: "Cancelar" });
    expect(cancelar.getAttribute("href")).toBe(`/contratos/${K1}/competencias`);
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("a11y: H1 único, label associado, mensagens em role status/alert", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "23505" }, status: 409 });
    cenario();
    montar();
    const campo = await preencher();
    expect(campo.getAttribute("type")).toBe("month");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    fireEvent.click(criar());
    expect((await screen.findByRole("alert")).textContent).toMatch(/Já existe/);
  });
});

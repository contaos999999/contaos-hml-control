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
  resposta: null as null | ((c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown),
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c = { tabela, ops: [] as Array<[string, unknown[]]> };
    m.chamadas.push(c);
    const b: { [k: string]: unknown } = {};
    for (const op of ["select", "eq", "maybeSingle", "abortSignal", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      try {
        return Promise.resolve(m.resposta?.(c)).then(res, rej);
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
  createFileRoute: () => (o: unknown) => ({ options: o, useParams: () => ({ id: "x" }) }),
  Link: ({ children, to, ...p }: { children: ReactNode; to: string }) => (
    <a href={to} {...p}>
      {children}
    </a>
  ),
}));

import { VisaoGeralContrato, MENSAGENS_V106 } from "@/components/contratos/VisaoGeralContrato";
import { COLUNAS_DETALHE, formatarDataBr, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const K2 = "22222222-2222-4222-8222-222222222222";

const contrato = (id: string, numero = "CT-001") => ({
  id,
  id_organizacao: A,
  id_contratante: "c1",
  numero,
  objeto: "Serviços de limpeza",
  situacao: "ativo",
  criticidade: "alta",
  inicio: "2026-01-01",
  fim: "2026-12-31",
  tipo_contrato: null,
  unidade_vinculada: "Sede",
  fonte_recurso: null,
  valor_global: 1234.5,
  valor_mensal_referencia: null,
  periodicidade: "mensal",
  prazo_prestacao_dias: 10,
  dia_limite_apresentacao: 5,
  contratante: { razao_social: "Prefeitura X", nome_fantasia: null, documento: "123" },
});
const ok = (d: unknown) => ({ data: d, error: null, status: 200 });
const sel = () => m.chamadas.filter((c) => c.tabela === "contratos");

function montar(id = K1, qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return { qc, ...render(<QueryClientProvider client={qc}><VisaoGeralContrato id={id} /></QueryClientProvider>) };
}

beforeEach(() => {
  m.chamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset();
  m.invoke.mockReset();
  m.signOut.mockReset();
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-06 rota", () => {
  it("head com título, noindex e ssr false", () => {
    const o = (Route as unknown as { options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } } }).options;
    expect(o.ssr).toBe(false);
    const meta = o.head().meta;
    expect(meta.find((x) => x["title"])?.["title"]).toBe("Contrato — ContaOS");
    expect(meta.some((x) => x["name"] === "robots" && x["content"] === "noindex")).toBe(true);
  });
});

describe("V1-06 dados", () => {
  it("SELECT exato por id, maybeSingle, abort; sem filtro de organização; sucesso sem classificador", async () => {
    m.resposta = () => ok(contrato(K1));
    montar();
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const c = sel()[0]!;
    expect(c.ops.find((o) => o[0] === "select")![1][0]).toBe(COLUNAS_DETALHE);
    expect(COLUNAS_DETALHE).toContain("contratante:contratantes!contratos_contratante_org_fk(razao_social,nome_fantasia,documento)");
    expect(COLUNAS_DETALHE).not.toContain("!inner");
    expect(COLUNAS_DETALHE).not.toContain("conta_bancaria");
    expect(COLUNAS_DETALHE).not.toContain("configuracao");
    expect(c.ops.filter((o) => o[0] === "eq")).toEqual([["eq", ["id", K1]]]);
    expect(c.ops.some((o) => o[0] === "maybeSingle")).toBe(true);
    expect(c.ops.find((o) => o[0] === "abortSignal")![1][0]).toBeInstanceOf(AbortSignal);
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.chamadas.every((x) => x.tabela === "contratos")).toBe(true);
  });

  it("formata datas, BRL e nulos", async () => {
    m.resposta = () => ok(contrato(K1));
    montar();
    await screen.findByText("Prefeitura X");
    expect(screen.getByText("01/01/2026 – 31/12/2026")).toBeTruthy();
    expect(screen.getByText(/R\$\s1\.234,50/)).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(formatarDataBr("2026-03-01")).toBe("01/03/2026");
    expect(formatarDataBr(null)).toBe("—");
  });

  it.each([
    ["negado", MENSAGENS_V106.negado],
    ["nao_encontrado", MENSAGENS_V106.naoEncontrado],
    ["permitido", MENSAGENS_V106.consistencia],
    ["outro", MENSAGENS_V106.erro],
  ])("zero linhas + classificador %s", async (ret, msg) => {
    m.resposta = () => ok(null);
    m.rpc.mockResolvedValue({ data: ret, error: null });
    montar();
    expect(await screen.findByText(msg)).toBeTruthy();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("classificar_acesso_contrato_v106", { p_id_contrato: K1 });
    expect(sel()).toHaveLength(1);
  });

  it("classificador com erro ou rede => erro técnico, nunca 404", async () => {
    m.resposta = () => ok(null);
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "XX000", message: "detalhe interno" } });
    montar();
    expect(await screen.findByText(MENSAGENS_V106.erro)).toBeTruthy();
    expect(screen.queryByText(MENSAGENS_V106.naoEncontrado)).toBeNull();
    expect(screen.queryByText(/detalhe interno|XX000/)).toBeNull();
  });

  it("classificador rejeita (rede) => erro técnico", async () => {
    m.resposta = () => ok(null);
    m.rpc.mockRejectedValue(new TypeError("Failed to fetch"));
    montar();
    expect(await screen.findByText(MENSAGENS_V106.erro)).toBeTruthy();
  });

  it.each([
    [{ code: "42501" }, 403],
    [{ code: "PGRST301" }, 401],
    [{ code: "x" }, 401],
    [{ code: "x" }, 403],
  ])("SELECT negado %o/%i => negado, zero classificador", async (error, status) => {
    m.resposta = () => ({ data: null, error, status });
    montar();
    expect(await screen.findByText(MENSAGENS_V106.negado)).toBeTruthy();
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("SELECT 500 => erro + retry, zero classificador; retry refaz SELECT", async () => {
    m.resposta = () => ({ data: null, error: { code: "XX000", message: "stack secreto" }, status: 500 });
    montar();
    expect(await screen.findByText(MENSAGENS_V106.erro)).toBeTruthy();
    expect(screen.queryByText(/stack secreto/)).toBeNull();
    expect(m.rpc).not.toHaveBeenCalled();
    m.resposta = () => ok(contrato(K1));
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
    expect(sel()).toHaveLength(2);
  });

  it("SELECT rede => erro, zero classificador", async () => {
    m.resposta = () => {
      throw new TypeError("Failed to fetch");
    };
    montar();
    expect(await screen.findByText(MENSAGENS_V106.erro)).toBeTruthy();
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("UUID inválido => não encontrado, zero API", async () => {
    montar("abc");
    expect(await screen.findByText(MENSAGENS_V106.naoEncontrado)).toBeTruthy();
    expect(sel()).toHaveLength(0);
    expect(m.rpc).not.toHaveBeenCalled();
    expect(uuidValido(K1)).toBe(true);
    expect(uuidValido("abc")).toBe(false);
  });
});

describe("V1-06 sessão/contexto", () => {
  it("sem sessão => /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(sel()).toHaveLength(0);
  });
  it("erro técnico getUser => retry sem signOut", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: { name: "AuthRetryableFetchError" } });
    montar();
    expect(await screen.findByText(MENSAGENS_V106.erroSessao)).toBeTruthy();
    expect(m.signOut).not.toHaveBeenCalled();
    m.resposta = () => ok(contrato(K1));
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
  });
  it("sem preferência => /selecionar-organizacao", async () => {
    window.sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
    expect(sel()).toHaveLength(0);
  });
  it("leitor e Master leem sem gate de perfil (nenhuma consulta a vínculos)", async () => {
    m.resposta = () => ok(contrato(K1));
    montar();
    await screen.findByRole("heading", { level: 1 });
    expect(m.chamadas.some((c) => c.tabela === "vinculos_usuarios")).toBe(false);
  });
  it("troca de id A→B sem remount: resposta tardia de A não aparece", async () => {
    let soltarA: (v: unknown) => void = () => {};
    m.resposta = (c) => {
      const id = c.ops.find((o) => o[0] === "eq")![1][1];
      if (id === K1) return new Promise((r) => (soltarA = r));
      return ok(contrato(K2, "CT-002"));
    };
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const r = montar(K1, qc);
    await waitFor(() => expect(sel()).toHaveLength(1));
    r.rerender(<QueryClientProvider client={qc}><VisaoGeralContrato id={K2} /></QueryClientProvider>);
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-002" })).toBeTruthy();
    soltarA(ok(contrato(K1, "CT-001")));
    await new Promise((x) => setTimeout(x, 20));
    expect(screen.queryByText("Contrato CT-001")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Contrato CT-002" })).toBeTruthy();
  });
});

describe("V1-06 navegação e scan", () => {
  it("navegação futura indisponível, sem links nem carga extra; voltar seguro", async () => {
    m.resposta = () => ok(contrato(K1));
    montar();
    await screen.findByText("Prefeitura X");
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(nav.querySelectorAll("a")).toHaveLength(0);
    for (const t of ["Base normativa", "Orçamento", "Regras", "Documentos", "Competências"]) {
      const el = screen.getByText(t).closest("[aria-disabled]");
      expect(el?.getAttribute("aria-disabled")).toBe("true");
    }
    expect(screen.getByText("Visão geral").closest("[aria-current]")?.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: /Voltar para contratos/ }).getAttribute("href")).toBe("/contratos");
    expect(sel()).toHaveLength(1);
  });
  it("arquivos novos sem mutações, secrets, casts proibidos; único rpc é o classificador", () => {
    const fs = ["src/components/contratos/VisaoGeralContrato.tsx", "src/lib/contratos/contratoDetalheDados.ts", "src/routes/contratos_.$id.tsx"].map((p) => readFileSync(p, "utf8")).join("\n");
    for (const t of [".insert(", ".update(", ".delete(", ".upsert(", "functions.invoke", "service_role", "sb_secret", "localStorage", "as any", "as never", "as unknown as", "placeholderData", "keepPreviousData"]) expect(fs).not.toContain(t);
    const rpcs = fs.match(/\.rpc\(\s*"([^"]+)"/g) ?? [];
    expect(rpcs).toEqual(['.rpc("classificar_acesso_contrato_v106"']);
  });
});

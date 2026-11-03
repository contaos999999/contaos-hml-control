import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

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
    for (const op of ["select", "eq", "order", "range", "maybeSingle", "abortSignal"]) {
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
  createFileRoute: () => (o: unknown) => ({ options: o, useParams: () => ({ id: "x" }) }),
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

import { CompetenciasContrato } from "@/components/contratos/CompetenciasContrato";
import {
  COLUNAS_COMPETENCIA,
  PAGINA_COMPETENCIAS,
  SITUACOES_COMPETENCIA,
  formatarCompetencia,
  formatarPercentual,
  mesParaReferencia,
} from "@/lib/contratos/competenciasDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.competencias";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const C1 = "22222222-2222-4222-8222-222222222222";

const contrato = () => ({
  id: K1,
  id_organizacao: A,
  numero: "CT-001",
  objeto: "x",
  situacao: "ativo",
  criticidade: "alta",
  contratante: null,
});
const comp = (extra: Record<string, unknown> = {}) => ({
  id: C1,
  competencia_referencia: "2026-03-01",
  periodo_inicio: "2026-03-01",
  periodo_fim: "2026-03-31",
  data_limite: "2026-04-10",
  situacao: "em_analise",
  percentual_conformidade: 87.5,
  versao_pacote_atual: 2,
  atualizado_em: "2026-03-15T12:00:00Z",
  ...extra,
});
const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

function cenario(lista: unknown[] = [comp()], total?: number) {
  m.resposta = (c) => {
    if (c.tabela === "contratos") return ok(contrato());
    if (c.tabela === "competencias") return ok(lista, total ?? lista.length);
    return ok(null);
  };
}
function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CompetenciasContrato id={id} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  m.chamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset().mockResolvedValue({ data: "negado", error: null });
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  window.localStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-12 rota e gates", () => {
  it("rota com ssr:false e head próprio", () => {
    const o = (
      Route as unknown as {
        options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
      }
    ).options;
    expect(o.ssr).toBe(false);
    expect(o.head().meta.some((x) => x["title"] === "Competências — ContaOS")).toBe(true);
  });
  it("UUID inválido: nenhuma consulta", async () => {
    cenario();
    const preferencia = vi.spyOn(Storage.prototype, "getItem");
    montar("nao-uuid");
    await screen.findByText(/Contrato não encontrado/);
    expect(m.getUser).not.toHaveBeenCalled();
    expect(preferencia).not.toHaveBeenCalled();
    expect(m.chamadas).toHaveLength(0);
    expect(m.rpc).not.toHaveBeenCalled();
    preferencia.mockRestore();
  });
  it("UUID válido mantém sessão → organização → contrato → competências", async () => {
    const fluxo: string[] = [];
    const preferencia = vi.spyOn(Storage.prototype, "getItem");
    preferencia.mockImplementation(function (this: Storage, chave: string) {
      fluxo.push("organizacao");
      return chave === "contaos.preferenciaOrganizacao"
        ? JSON.stringify({ idUsuario: U, idOrganizacao: A })
        : null;
    });
    m.getUser.mockImplementation(async () => {
      fluxo.push("sessao");
      return { data: { user: { id: U } }, error: null };
    });
    m.resposta = (c) => {
      fluxo.push(c.tabela);
      return c.tabela === "contratos" ? ok(contrato()) : ok([comp()], 1);
    };
    montar();
    await screen.findByText("03/2026");
    expect(fluxo).toEqual(["sessao", "organizacao", "contratos", "competencias"]);
    expect(m.getUser).toHaveBeenCalledTimes(1);
    preferencia.mockRestore();
  });
  it("sem sessão → /login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(de("competencias")).toHaveLength(0);
  });
  it("sem organização → selecionar", async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(de("competencias")).toHaveLength(0);
  });
  it("contrato negado: mensagem sanitizada e zero competências", async () => {
    m.resposta = (c) => (c.tabela === "contratos" ? ok(null) : ok([]));
    m.rpc.mockResolvedValue({ data: "negado", error: null });
    montar();
    await screen.findByText(/não tem acesso/i);
    expect(de("competencias")).toHaveLength(0);
  });
  it("contrato inexistente: não encontrado e zero competências", async () => {
    m.resposta = () => ok(null);
    m.rpc.mockResolvedValue({ data: "nao_encontrado", error: null });
    montar();
    await screen.findByText(/Contrato não encontrado/);
    expect(de("competencias")).toHaveLength(0);
  });
});

describe("V1-12 consulta server-side", () => {
  it("select whitelist, eq contrato, ordem estável, range 0–24, count exact, abortSignal; uma consulta", async () => {
    cenario();
    montar();
    await screen.findByText("03/2026");
    const cs = de("competencias");
    expect(cs).toHaveLength(1);
    const c = cs[0]!;
    expect(op(c, "select")[0]).toEqual([COLUNAS_COMPETENCIA, { count: "exact" }]);
    expect(COLUNAS_COMPETENCIA).toBe(
      "id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em",
    );
    expect(op(c, "eq")).toEqual([["id_contrato", K1]]);
    expect(op(c, "order")).toEqual([
      ["competencia_referencia", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(op(c, "range")).toEqual([[0, 24]]);
    expect(PAGINA_COMPETENCIAS).toBe(25);
    expect(op(c, "abortSignal")).toHaveLength(1);
  });
  it("filtro competência → YYYY-MM-01 server-side e reseta página", async () => {
    cenario([comp()], 60);
    montar();
    await screen.findByText("03/2026");
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(op(de("competencias").at(-1)!, "range")).toEqual([[25, 49]]));
    fireEvent.change(screen.getByLabelText("Competência"), { target: { value: "2026-02" } });
    await waitFor(() => {
      const u = de("competencias").at(-1)!;
      expect(op(u, "eq")).toEqual([
        ["id_contrato", K1],
        ["competencia_referencia", "2026-02-01"],
      ]);
      expect(op(u, "range")).toEqual([[0, 24]]);
    });
  });
  it("filtro situação envia token bruto", async () => {
    cenario();
    montar();
    await screen.findByText("03/2026");
    fireEvent.change(screen.getByLabelText("Situação"), {
      target: { value: "pode_apresentar_contratante" },
    });
    await waitFor(() =>
      expect(op(de("competencias").at(-1)!, "eq")).toEqual([
        ["id_contrato", K1],
        ["situacao", "pode_apresentar_contratante"],
      ]),
    );
    expect(
      within(screen.getByLabelText("Situação")).getByRole("option", {
        name: "pode_apresentar_contratante",
      }),
    ).toBeInTheDocument();
  });
  it("helpers de formato", () => {
    expect(mesParaReferencia("2026-02")).toBe("2026-02-01");
    expect(mesParaReferencia("")).toBeNull();
    expect(formatarCompetencia("2026-03-01")).toBe("03/2026");
    expect(formatarPercentual(87.5)).toBe("87,50%");
    expect(formatarPercentual(null)).toBe("—");
  });
});

describe("V1-12 status e percentual", () => {
  it("14 tokens oficiais exatos", () => {
    expect([...SITUACOES_COMPETENCIA]).toEqual([
      "rascunho",
      "preparando",
      "em_analise",
      "pendente_correcao",
      "em_reanalise",
      "pode_apresentar_contratante",
      "apresentado",
      "aguardando_contratante",
      "com_apontamentos",
      "pode_reapresentar_contratante",
      "reapresentado",
      "validada",
      "encerrada",
      "cancelada",
    ]);
  });
  it("cada token renderizado literalmente, inclusive desconhecido", async () => {
    const tokens = [...SITUACOES_COMPETENCIA, "xpto_novo"];
    cenario(
      tokens.map((s, i) =>
        comp({
          id: `${i}`.padStart(8, "0") + C1.slice(8),
          situacao: s,
          competencia_referencia: `20${10 + i}-01-01`,
        }),
      ),
    );
    montar();
    await screen.findByText("01/2010");
    const tabela = screen.getByRole("table");
    for (const t of tokens)
      expect(within(tabela).getAllByText(t, { selector: "[data-status]" }).length).toBe(1);
  });
  it("percentual do backend exibido sem cálculo e sem habilitar ação", async () => {
    cenario([
      comp({ percentual_conformidade: 100 }),
      comp({
        id: "33333333-3333-4333-8333-333333333333",
        percentual_conformidade: null,
        competencia_referencia: "2026-02-01",
      }),
    ]);
    montar();
    await screen.findByText("100,00%");
    expect(screen.getByText("—", { selector: "[data-percentual]" })).toBeInTheDocument();
    const meter = screen.getAllByRole("meter")[0]!;
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
    for (const b of screen.getAllByText(/Abrir competência/))
      expect(b.closest("[aria-disabled]")?.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("V1-12 estados, ações e a11y", () => {
  it("vazio", async () => {
    cenario([]);
    montar();
    await screen.findByText(/Nenhuma competência encontrada/);
  });
  it("erro com retry", async () => {
    m.resposta = (c) =>
      c.tabela === "contratos"
        ? ok(contrato())
        : { data: null, error: { code: "XX000" }, status: 500 };
    montar();
    await screen.findByText(/Não foi possível carregar as competências/);
    expect(screen.getByRole("button", { name: /Tentar novamente/ })).toBeInTheDocument();
  });
  it("ações staged Em breve, sem link para V1-13/V1-14 e sem RPC", async () => {
    cenario();
    montar();
    await screen.findByText("03/2026");
    const nova = screen.getByText("Nova competência").closest("[aria-disabled]");
    expect(nova?.getAttribute("aria-disabled")).toBe("true");
    expect(nova?.textContent).toMatch(/Em breve/);
    expect(
      screen
        .queryAllByRole("link")
        .some(
          (a) =>
            /competencias\//.test(a.getAttribute("href") ?? "") ||
            /^\/competencias/.test(a.getAttribute("href") ?? ""),
        ),
    ).toBe(false);
    expect(m.rpc).not.toHaveBeenCalledWith("criar_competencia", expect.anything());
  });
  it("H1 único, nav com Competências ativo e irmãs como link", async () => {
    cenario();
    montar();
    await screen.findByText("03/2026");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(
      within(nav).getByText("Competências").closest("[aria-current]")?.getAttribute("aria-current"),
    ).toBe("page");
    expect(within(nav).getByRole("link", { name: "Documentos" }).getAttribute("href")).toBe(
      `/contratos/${K1}/documentos`,
    );
  });
  it("fonte sem escrita, sem rpc, sem any", () => {
    for (const f of [
      "src/components/contratos/CompetenciasContrato.tsx",
      "src/lib/contratos/competenciasDados.ts",
    ]) {
      const s = readFileSync(f, "utf8");
      expect(s).not.toMatch(
        /\.(insert|update|delete|upsert)\(|\.rpc\(|criar_competencia|service_role|as any/,
      );
    }
  });
});

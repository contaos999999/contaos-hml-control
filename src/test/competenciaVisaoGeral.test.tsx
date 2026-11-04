import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  sinais: [] as AbortSignal[],
}));

vi.mock("@/integrations/supabase/client", () => {
  const rpc = (nome: string, args: Record<string, unknown>) => ({
    abortSignal: (s: AbortSignal) => {
      m.sinais.push(s);
      return Promise.resolve(m.rpc(nome, args));
    },
  });
  return { supabase: { auth: { getUser: m.getUser }, from: m.from, rpc } };
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

import { CompetenciaVisaoGeral } from "@/components/competencias/CompetenciaVisaoGeral";
import {
  classificarErroVisaoGeral,
  derivarEstadoVisual,
  parseVisaoGeral,
  rotuloSituacao,
  type VisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/competencias_.$id";

const U = "user-1";
const ID = "44444444-4444-4444-8444-444444444444";
const ID2 = "55555555-5555-4555-8555-555555555555";
const K = "11111111-1111-4111-8111-111111111111";

type Acoes = {
  abrir_documentos: boolean;
  analisar: boolean;
  abrir_parecer: boolean;
  apresentar: boolean;
};
const NENHUMA: Acoes = {
  abrir_documentos: false,
  analisar: false,
  abrir_parecer: false,
  apresentar: false,
};

function vg(
  o: {
    situacao?: string;
    percentual?: number | null;
    acoes?: Partial<Acoes>;
    liberado?: boolean;
    bloqueantes?: number;
    naoConformes?: number;
  } = {},
) {
  return {
    competencia: {
      id: ID,
      id_contrato: K,
      id_organizacao: "org-A",
      competencia_referencia: "2026-03-01",
      periodo_inicio: "2026-03-01",
      periodo_fim: "2026-03-31",
      data_limite: null,
      situacao: o.situacao ?? "preparando",
      percentual_conformidade: o.percentual === undefined ? 40 : o.percentual,
      versao_pacote_atual: 1,
      versao_registro: 3,
      atualizado_em: "2026-03-10T12:00:00Z",
    },
    portao: {
      liberado: o.liberado ?? false,
      total: 10,
      avaliados: 6,
      pendentes: 4,
      nao_conformes: o.naoConformes ?? 0,
      inconclusivos: 1,
      em_analise: 2,
      nao_conformidades_bloqueantes: o.bloqueantes ?? 0,
      percentual: 60,
    },
    blocking_summary: {
      pendentes: 4,
      nao_conformes: o.naoConformes ?? 0,
      inconclusivos: 1,
      em_analise: 2,
      nao_conformidades_bloqueantes: o.bloqueantes ?? 0,
      parecer_aprovado: false,
      analise_concluida_atual: false,
      aprovacao_apresentacao_atual: false,
    },
    allowed_actions: { ...NENHUMA, ...o.acoes },
  };
}
const ok = (d: unknown) => ({ data: d, error: null, status: 200 });

beforeEach(() => {
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.nav.mockReset();
  m.rpc.mockReset().mockResolvedValue(ok(vg()));
  m.from.mockReset();
  m.sinais.length = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, "org-A");
});

const montar = (id = ID) => render(<CompetenciaVisaoGeral id={id} />);
const pronto = () => screen.findByRole("heading", { level: 1, name: "Competência 03/2026" });
const acao = (nome: string) => screen.getByTestId(`acao-${nome}`);

describe("V1-14 rota e gate", () => {
  it("rota /competencias/$id ssr:false com head PT-BR", () => {
    const r = Route as unknown as {
      path: string;
      options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
    };
    expect(r.path).toBe("/competencias_/$id");
    expect(r.options.ssr).toBe(false);
    const meta = r.options.head().meta;
    expect(meta.find((x) => x["title"])?.["title"]).toMatch(/Competência/);
    for (const k of ["og:title", "og:description", "og:type"])
      expect(meta.some((x) => x["property"] === k)).toBe(true);
    expect(meta.some((x) => x["name"] === "twitter:card")).toBe(true);
  });

  it("UUID inválido: zero Auth/RPC e mensagem sanitizada", async () => {
    montar("abc");
    expect(
      await screen.findByText("Competência não encontrada ou indisponível."),
    ).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.from).not.toHaveBeenCalled();
  });

  it("sem sessão → /login, sem RPC", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("sem organização → /selecionar-organizacao, sem RPC", async () => {
    window.sessionStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it("RPC exata chamada uma vez só com p_id_competencia; nada de from/outras RPCs", async () => {
    montar();
    await pronto();
    expect(m.rpc).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("obter_visao_geral_competencia", { p_id_competencia: ID });
    expect(m.from).not.toHaveBeenCalled();
    expect(m.getUser.mock.invocationCallOrder[0]).toBeLessThan(m.rpc.mock.invocationCallOrder[0]!);
  });
});

describe("V1-14 erros sanitizados", () => {
  it.each([
    [{ code: "42501", message: "permission denied for RAW" }, 400],
    [{ message: "RAW forbidden" }, 403],
    [{ message: "RAW jwt" }, 401],
  ])("acesso negado não vira empty (%o)", async (error, status) => {
    m.rpc.mockResolvedValue({ data: null, error, status });
    montar();
    expect(await screen.findByText("Você não tem acesso a esta competência.")).toBeInTheDocument();
    expect(screen.queryByText(/RAW/)).toBeNull();
    expect(screen.queryByText(/não encontrada/)).toBeNull();
  });

  it("P0001 → não encontrada/indisponível, sem texto bruto", async () => {
    m.rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "RAW x" },
      status: 400,
    });
    montar();
    expect(
      await screen.findByText("Competência não encontrada ou indisponível."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/RAW/)).toBeNull();
  });

  it("transporte → erro genérico e retry manual dispara exatamente 1 RPC", async () => {
    m.rpc.mockRejectedValueOnce(new TypeError("RAW fetch failed"));
    montar();
    const alerta = await screen.findByRole("alert");
    expect(alerta.textContent).toMatch(/Não foi possível carregar a competência/);
    expect(screen.queryByText(/RAW/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    await pronto();
    expect(m.rpc).toHaveBeenCalledTimes(2);
  });

  it("shape inválido → erro genérico", async () => {
    m.rpc.mockResolvedValue(ok({ competencia: { id: 1 } }));
    montar();
    expect((await screen.findByRole("alert")).textContent).toMatch(/Não foi possível carregar/);
  });

  it("classificador: P0001 nunca sem_permissao", () => {
    expect(classificarErroVisaoGeral({ code: "P0001" }, 400)).toBe("nao_encontrada");
    expect(classificarErroVisaoGeral({ code: "42501" }, 400)).toBe("sem_permissao");
    expect(classificarErroVisaoGeral({}, 403)).toBe("sem_permissao");
    expect(classificarErroVisaoGeral({}, 401)).toBe("sem_permissao");
    expect(classificarErroVisaoGeral({ code: "XX000" }, 500)).toBe("erro");
    expect(parseVisaoGeral(null)).toBeNull();
  });
});

describe("V1-14 renderização do backend", () => {
  it("renderiza status, percentual, 8 campos de bloqueio, portão e 4 ações", async () => {
    m.rpc.mockResolvedValue(ok(vg({ percentual: 40 })));
    montar();
    await pronto();
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("40");
    const bloq = screen.getByTestId("blocking-summary");
    for (const k of [
      "pendentes",
      "nao_conformes",
      "inconclusivos",
      "em_analise",
      "nao_conformidades_bloqueantes",
      "parecer_aprovado",
      "analise_concluida_atual",
      "aprovacao_apresentacao_atual",
    ])
      expect(bloq.querySelector(`[data-campo="${k}"]`)).not.toBeNull();
    expect(bloq.querySelector('[data-campo="pendentes"]')?.textContent).toMatch(/4/);
    expect(screen.getByText("Não liberado pelo backend")).toBeInTheDocument();
    for (const n of ["abrir_documentos", "analisar", "abrir_parecer", "apresentar"])
      expect(acao(n)).toBeInTheDocument();
  });

  it("voltar usa id_contrato do backend", async () => {
    montar();
    await pronto();
    expect(
      screen.getByRole("link", { name: /Voltar para competências/ }).getAttribute("href"),
    ).toBe(`/contratos/${K}/competencias`);
  });

  it("REGRESSÃO: percentual 100 + apresentar=false → Apresentar bloqueada, sem controle", async () => {
    m.rpc.mockResolvedValue(
      ok(vg({ percentual: 100, situacao: "pode_apresentar_contratante", liberado: true })),
    );
    montar();
    await pronto();
    expect(acao("apresentar").textContent).toMatch(/Bloqueada pelo backend/);
    expect(acao("apresentar").querySelector("a,button,[aria-disabled]")).toBeNull();
  });

  it("REGRESSÃO: percentual 0 + apresentar=true → Permitida pelo backend (staged)", async () => {
    m.rpc.mockResolvedValue(ok(vg({ percentual: 0, acoes: { apresentar: true } })));
    montar();
    await pronto();
    expect(acao("apresentar").textContent).toMatch(/Permitida pelo backend/);
  });

  it.each(["abrir_documentos", "analisar", "apresentar"])(
    "%s=true: staged aria-disabled Em breve, sem href, clique não navega nem chama RPC",
    async (n) => {
      m.rpc.mockResolvedValue(ok(vg({ acoes: { [n]: true } })));
      montar();
      await pronto();
      const el = acao(n);
      expect(el.textContent).toMatch(/Permitida pelo backend/);
      const staged = el.querySelector('[aria-disabled="true"]') as HTMLElement;
      expect(staged.textContent).toMatch(/Em breve/);
      expect(el.querySelector("a,button,[href]")).toBeNull();
      fireEvent.click(staged);
      expect(m.nav).not.toHaveBeenCalled();
      expect(m.rpc).toHaveBeenCalledTimes(1);
    },
  );

  it("abrir_parecer=true habilita somente a aba/ação correspondente", async () => {
    m.rpc.mockResolvedValue(ok(vg({ acoes: { abrir_parecer: true } })));
    montar();
    await pronto();
    const link = acao("abrir_parecer").querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe(`/competencias/${ID}/parecer`);
    const aba = screen.getAllByRole("tab").find((v) => v.textContent?.includes("Parecer"));
    expect(aba?.getAttribute("href")).toBe(`/competencias/${ID}/parecer`);
    expect(aba?.getAttribute("aria-disabled")).toBeNull();
    expect(m.rpc).toHaveBeenCalledTimes(1);
  });

  it("ação false: nenhum botão/link com nome da ação", async () => {
    montar();
    await pronto();
    for (const nome of [/Apresentar/, /Analisar/, /Abrir documentos/, /Abrir parecer/]) {
      expect(screen.queryAllByRole("button", { name: nome })).toHaveLength(0);
      expect(screen.queryAllByRole("link", { name: nome })).toHaveLength(0);
    }
    expect(screen.getAllByText("Bloqueada pelo backend")).toHaveLength(4);
  });

  it("copy oficial dos status críticos; nunca 'Apta'", async () => {
    expect(rotuloSituacao("pode_apresentar_contratante")).toBe("PODE APRESENTAR AO CONTRATANTE");
    expect(rotuloSituacao("pode_reapresentar_contratante")).toBe(
      "PODE REAPRESENTAR AO CONTRATANTE",
    );
    expect(rotuloSituacao("em_analise")).toBe("em_analise");
    m.rpc.mockResolvedValue(ok(vg({ situacao: "pode_reapresentar_contratante" })));
    montar();
    await pronto();
    expect(screen.getByText("PODE REAPRESENTAR AO CONTRATANTE")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Apta/i);
  });

  it("a11y: H1 único, tablist com Visão geral selecionada e futuras staged", async () => {
    montar();
    await pronto();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent?.replace("Em breve", "").trim())).toEqual([
      "Visão geral",
      "Documentos",
      "Análise",
      "Parecer",
      "Apresentação",
    ]);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("href")).toBe(`/competencias/${ID}/documentos`);
    expect(tabs[1]!.getAttribute("aria-disabled")).toBeNull();
    expect(tabs[1]!.textContent).not.toMatch(/Em breve/);
    expect(tabs[2]!.getAttribute("href")).toBe(`/competencias/${ID}/analise`);
    expect(tabs[2]!.getAttribute("aria-disabled")).toBeNull();
    expect(tabs[2]!.textContent).not.toMatch(/Em breve/);
    expect(tabs[3]!.getAttribute("aria-disabled")).toBe("true");
    expect(tabs[3]!.getAttribute("href")).toBeNull();
    expect(tabs[3]!.textContent).toMatch(/Parecer/);
    expect(tabs[4]!.getAttribute("aria-disabled")).toBe("true");
    expect(tabs[4]!.getAttribute("href")).toBeNull();
    expect(screen.getByRole("status", { name: /Situação/ })).toBeInTheDocument();
  });
});

describe("V1-14 estados visuais (apresentação apenas)", () => {
  const casos: Array<[string, Parameters<typeof vg>[0], string]> = [
    ["preparation", { situacao: "preparando" }, "Em preparação"],
    ["analysis", { situacao: "em_analise" }, "Em análise"],
    ["blocked", { situacao: "em_analise", liberado: false, bloqueantes: 2 }, "Com bloqueios"],
    [
      "ready",
      { situacao: "pode_apresentar_contratante", liberado: true },
      "Pronta conforme backend",
    ],
    ["presented", { situacao: "apresentado" }, "Apresentada"],
  ];
  it.each(casos)("%s", async (estado, o, rotulo) => {
    expect(derivarEstadoVisual(vg(o) as unknown as VisaoGeral)).toBe(estado);
    m.rpc.mockResolvedValue(ok(vg(o)));
    montar();
    await pronto();
    const painel = screen.getByTestId("estado-competencia");
    expect(painel.getAttribute("data-estado")).toBe(estado);
    expect(painel.textContent).toMatch(rotulo);
    expect(painel.querySelector("svg")).not.toBeNull();
  });

  it("ready com apresentar=false → bloqueada; blocked com analisar=true → permitida", async () => {
    m.rpc.mockResolvedValue(ok(vg({ situacao: "pode_apresentar_contratante", liberado: true })));
    const r = montar();
    await pronto();
    expect(acao("apresentar").textContent).toMatch(/Bloqueada/);
    r.unmount();
    m.rpc.mockResolvedValue(ok(vg({ bloqueantes: 3, acoes: { analisar: true } })));
    montar();
    await pronto();
    expect(screen.getByTestId("estado-competencia").getAttribute("data-estado")).toBe("blocked");
    expect(acao("analisar").textContent).toMatch(/Permitida pelo backend/);
  });
});

describe("V1-14 cancelamento", () => {
  it("desmontar com RPC pendente: sinal abortado e nenhum efeito tardio", async () => {
    let resolver: (v: unknown) => void = () => {};
    m.rpc.mockReturnValue(new Promise((r) => (resolver = r)));
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = montar();
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(1));
    r.unmount();
    expect(m.sinais[0]!.aborted).toBe(true);
    await act(async () => resolver(ok(vg())));
    expect(m.nav).not.toHaveBeenCalled();
    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  it("troca de id aborta a anterior e só a nova é exibida", async () => {
    let resolver1: (v: unknown) => void = () => {};
    m.rpc.mockReturnValueOnce(new Promise((r) => (resolver1 = r)));
    const r = montar(ID);
    await waitFor(() => expect(m.rpc).toHaveBeenCalledTimes(1));
    const novo = vg({ situacao: "apresentado" });
    novo.competencia.id = ID2;
    novo.competencia.competencia_referencia = "2026-04-01";
    m.rpc.mockResolvedValueOnce(ok(novo));
    r.rerender(<CompetenciaVisaoGeral id={ID2} />);
    await screen.findByRole("heading", { level: 1, name: "Competência 04/2026" });
    expect(m.sinais[0]!.aborted).toBe(true);
    await act(async () => resolver1(ok(vg())));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Competência 04/2026");
  });
});

describe("V1-14 estático", () => {
  it("produção sem ===100, sem avaliar_portao_conformidade, sem any, sem mutação", () => {
    const fontes = [
      readFileSync("src/components/competencias/CompetenciaVisaoGeral.tsx", "utf8"),
      readFileSync("src/lib/competencias/competenciaVisaoGeralDados.ts", "utf8"),
    ].join("\n");
    expect(fontes).not.toMatch(/===\s*100|>=\s*100/);
    expect(fontes).not.toMatch(/avaliar_portao_conformidade/);
    expect(fontes).not.toMatch(/:\s*any\b|as any\b/);
    expect(fontes).not.toMatch(/\.(insert|update|upsert|delete)\(/);
    const comp = readFileSync("src/components/competencias/CompetenciaVisaoGeral.tsx", "utf8");
    const bloco = comp.slice(comp.indexOf("function AllowedActions"));
    expect(bloco.slice(0, bloco.indexOf("\n}\n"))).not.toMatch(
      /derivarEstadoVisual|situacao|percentual/,
    );
  });
});

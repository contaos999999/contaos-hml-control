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
  rpcChamadas: [] as Array<{ nome: string; args: Record<string, unknown> }>,
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
      "is",
      "or",
      "in",
      "order",
      "range",
      "maybeSingle",
      "abortSignal",
      "insert",
      "update",
      "delete",
      "upsert",
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
    m.rpcChamadas.push({ nome, args });
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

import { RegrasContrato, MENSAGENS_V109 } from "@/components/contratos/RegrasContrato";
import {
  COLUNAS_LISTA,
  COLUNAS_ITEM,
  COLUNAS_REGRA_CONFORMIDADE,
  COLUNAS_REGRA_PREVENTIVA,
  COLUNAS_VERSAO_LISTA,
} from "@/lib/contratos/regrasDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.$id_.regras";

const U = "user-1";
const A = "org-A";
const K1 = "11111111-1111-4111-8111-111111111111";
const L1 = "22222222-2222-4222-8222-222222222222";
const VL1 = "33333333-3333-4333-8333-333333333333";
const IT1 = "44444444-4444-4444-8444-444444444444";
const RC1 = "55555555-5555-4555-8555-555555555555";
const RC2 = "56565656-5656-4565-8565-565656565656";
const RP1 = "66666666-6666-4666-8666-666666666666";
const RP2 = "77777777-7777-4777-8777-777777777777";
const VF1 = "88888888-8888-4888-8888-888888888888";
const F1 = "99999999-9999-4999-8999-999999999999";
const PROTO = "abababab-abab-4bab-8bab-abababababab";

const contrato = () => ({
  id: K1,
  id_organizacao: A,
  numero: "CT-001",
  objeto: "x",
  situacao: "ativo",
  criticidade: "alta",
  contratante: null,
});
const lista = () => ({
  id: L1,
  nome: "Checklist mensal",
  descricao: "Itens obrigatórios",
  situacao: "ativa",
  versao_atual: 2,
  versao_registro: 3,
  atualizado_em: "2026-02-01T12:00:00Z",
});
const versaoLista = () => ({
  id: VL1,
  id_lista: L1,
  numero_versao: 2,
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
  situacao: "publicada",
  aprovado_em: "2026-01-02T12:00:00Z",
});
const item = () => ({
  id: IT1,
  codigo: "IT-01",
  descricao: "Folha de pagamento",
  categoria: "Pessoal",
  obrigatorio: true,
  aplicavel: true,
  impeditivo: false,
  criticidade: "alta",
  id_fonte_versao: VF1,
  regra_validacao: { campo: "valor", minimo: 10 },
  ordem: 1,
});
const regraConf = (extra: Record<string, unknown> = {}) => ({
  id: RC1,
  codigo: "RC-01",
  descricao: "Certidão válida",
  tipo: "documental",
  efeito_portao: true,
  id_fonte_versao: VF1,
  situacao: "ativa",
  atualizado_em: "2026-02-01T12:00:00Z",
  ...extra,
});
const regraPrev = (extra: Record<string, unknown> = {}) => ({
  id: RP1,
  codigo_regra: "RP-01",
  descricao: "Limite de horas extras",
  efeito: "alertar",
  criticidade: "media",
  escopo_aplicacao: "contrato",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  numero_versao: 1,
  situacao: "candidata",
  fonte: { origem: "precedente" },
  id_fonte_formal_versao: VF1,
  versao_registro: 1,
  aprovada_em: null,
  ...extra,
});

const ok = (d: unknown, count?: number) => ({ data: d, error: null, status: 200, count });
const de = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const op = (c: Chamada, nome: string) => c.ops.filter(([o]) => o === nome).map(([, a]) => a);

type Dados = {
  listas?: unknown[];
  versoes?: unknown[];
  itens?: unknown[];
  conformidade?: unknown[];
  totalConformidade?: number;
  preventivas?: unknown[];
};
function cenario(d: Dados = {}) {
  m.resposta = (c) => {
    if (c.tabela === "contratos") return ok(contrato());
    if (c.tabela === "listas_verificacao") return ok(d.listas ?? [], (d.listas ?? []).length);
    if (c.tabela === "versoes_lista") return ok(d.versoes ?? [], (d.versoes ?? []).length);
    if (c.tabela === "itens_lista") return ok(d.itens ?? [], (d.itens ?? []).length);
    if (c.tabela === "regras_conformidade")
      return ok(d.conformidade ?? [], d.totalConformidade ?? (d.conformidade ?? []).length);
    if (c.tabela === "regras_preventivas")
      return ok(d.preventivas ?? [], (d.preventivas ?? []).length);
    if (c.tabela === "versoes_fontes_normativas") return ok([{ id: VF1, id_fonte: F1, versao: 3 }]);
    if (c.tabela === "fontes_normativas") return ok([{ id: F1, titulo: "CCT 2026" }]);
    if (c.tabela === "fontes_formais_regras_preventivas")
      return ok([
        {
          id: "f-1",
          id_versao_fonte_normativa: VF1,
          fundamento_aplicabilidade: "Cláusula 5",
          validado_em: "2026-01-03T12:00:00Z",
        },
      ]);
    return ok(null);
  };
}
function montar(id = K1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RegrasContrato id={id} />
    </QueryClientProvider>,
  );
}
const NEGOCIO = [
  "listas_verificacao",
  "versoes_lista",
  "itens_lista",
  "regras_conformidade",
  "regras_preventivas",
];
const semNegocio = () => NEGOCIO.forEach((t) => expect(de(t)).toHaveLength(0));

beforeEach(() => {
  m.chamadas.length = 0;
  m.rpcChamadas.length = 0;
  m.resposta = null;
  m.nav.mockReset();
  m.rpc.mockReset().mockResolvedValue({ data: PROTO, error: null });
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, A);
});

describe("V1-09 rota, sessão e gate", () => {
  it("rota ssr:false, título e noindex", () => {
    const o = (
      Route as unknown as {
        options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
      }
    ).options;
    expect(o.ssr).toBe(false);
    expect(o.head().meta).toContainEqual({ title: "Listas e regras — ContaOS" });
    expect(o.head().meta).toContainEqual({ name: "robots", content: "noindex" });
  });
  it("sem sessão vai a /login sem consultas", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("sem organização vai a /selecionar-organizacao sem consultas", async () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    montar();
    await waitFor(() =>
      expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }),
    );
    expect(m.chamadas).toHaveLength(0);
  });
  it("403 do contrato não consulta listas/regras", async () => {
    m.resposta = () => ({ data: null, error: { code: "42501" }, status: 403 });
    montar();
    await screen.findByText(MENSAGENS_V109.negado);
    semNegocio();
  });
  it("404 distinto de 403 via classificador", async () => {
    m.resposta = (c) => (c.tabela === "contratos" ? ok(null) : ok([]));
    m.rpc.mockResolvedValue({ data: "nao_encontrado", error: null });
    montar();
    await screen.findByText(MENSAGENS_V109.naoEncontrado);
    expect(screen.queryByText(MENSAGENS_V109.negado)).toBeNull();
    expect(m.rpcChamadas.map((r) => r.nome)).toEqual(["classificar_acesso_contrato_v106"]);
    semNegocio();
  });
});

describe("V1-09 consultas", () => {
  it("colunas explícitas, id_contrato, count exact, range(0,24) e ordens", async () => {
    cenario({ listas: [lista()], conformidade: [regraConf()], preventivas: [regraPrev()] });
    montar();
    await screen.findByText("Checklist mensal");
    await screen.findByText("RP-01");
    const esperado: Array<[string, string, unknown[]]> = [
      [
        "listas_verificacao",
        COLUNAS_LISTA,
        [
          ["atualizado_em", { ascending: false }],
          ["id", { ascending: false }],
        ],
      ],
      [
        "regras_conformidade",
        COLUNAS_REGRA_CONFORMIDADE,
        [
          ["codigo", { ascending: true }],
          ["id", { ascending: true }],
        ],
      ],
      [
        "regras_preventivas",
        COLUNAS_REGRA_PREVENTIVA,
        [
          ["situacao", { ascending: true }],
          ["codigo_regra", { ascending: true }],
          ["id", { ascending: true }],
        ],
      ],
    ];
    for (const [t, cols, ordens] of esperado) {
      const c = de(t)[0];
      if (!c) throw new Error(`consulta ${t} ausente`);
      expect(op(c, "select")[0]).toEqual([cols, { count: "exact" }]);
      expect(cols).not.toContain("*");
      expect(op(c, "eq")).toContainEqual(["id_contrato", K1]);
      expect(op(c, "range")[0]).toEqual([0, 24]);
      expect(op(c, "order")).toEqual(ordens);
    }
    // rótulos de fonte só para ids da página
    const vf = de("versoes_fontes_normativas")[0];
    if (!vf) throw new Error("fontes ausentes");
    expect(op(vf, "in")[0]).toEqual(["id", [VF1]]);
  });
  it("próxima página usa range(25,49)", async () => {
    cenario({ conformidade: [regraConf()], totalConformidade: 30 });
    montar();
    await screen.findByText("RC-01");
    const sec = screen.getByRole("region", { name: "Regras de conformidade" });
    fireEvent.click(within(sec).getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(de("regras_conformidade").length).toBeGreaterThan(1));
    const ultima = de("regras_conformidade").at(-1);
    if (!ultima) throw new Error("sem consulta");
    expect(op(ultima, "range")[0]).toEqual([25, 49]);
  });
  it("filtro de situação vai ao servidor", async () => {
    cenario({ preventivas: [regraPrev()] });
    montar();
    await screen.findByText("RP-01");
    fireEvent.change(screen.getByLabelText("Filtrar por situação"), {
      target: { value: "ativa" },
    });
    await waitFor(() =>
      expect(op(de("regras_preventivas").at(-1)!, "eq")).toContainEqual(["situacao", "ativa"]),
    );
    expect(op(de("regras_preventivas").at(-1)!, "range")[0]).toEqual([0, 24]);
  });
  it("versões e itens lazy com ordens estáveis", async () => {
    cenario({ listas: [lista()], versoes: [versaoLista()], itens: [item()] });
    montar();
    await screen.findByText("Checklist mensal");
    expect(de("versoes_lista")).toHaveLength(0);
    fireEvent.click(
      screen.getByRole("button", { name: "Ver versões e itens de Checklist mensal" }),
    );
    await screen.findByText("IT-01");
    const v = de("versoes_lista")[0]!;
    expect(op(v, "select")[0]).toEqual([COLUNAS_VERSAO_LISTA, { count: "exact" }]);
    expect(op(v, "eq")).toContainEqual(["id_lista", L1]);
    expect(op(v, "order")).toEqual([
      ["numero_versao", { ascending: false }],
      ["id", { ascending: false }],
    ]);
    expect(op(v, "range")[0]).toEqual([0, 24]);
    const i = de("itens_lista")[0]!;
    expect(op(i, "select")[0]).toEqual([COLUNAS_ITEM, { count: "exact" }]);
    expect(op(i, "eq")).toContainEqual(["id_versao_lista", VL1]);
    expect(op(i, "order")).toEqual([
      ["ordem", { ascending: true }],
      ["id", { ascending: true }],
    ]);
    expect(op(i, "range")[0]).toEqual([0, 24]);
  });
});

describe("V1-09 renderização V1-CHK-001..004", () => {
  it("lista, item, regra de conformidade e preventiva com fonte/versão/escopo/vigência", async () => {
    cenario({
      listas: [lista()],
      versoes: [versaoLista()],
      itens: [item()],
      conformidade: [regraConf(), regraConf({ id: RC2, codigo: "RC-02", efeito_portao: false })],
      preventivas: [regraPrev(), regraPrev({ id: RP2, codigo_regra: "RP-02", situacao: "ativa" })],
    });
    montar();
    await screen.findByText("Checklist mensal");
    fireEvent.click(
      screen.getByRole("button", { name: "Ver versões e itens de Checklist mensal" }),
    );
    await screen.findByText("IT-01");
    // item: Sim/Não textual e regra legível (chave/valor, sem JSON cru)
    const linhaItem = screen.getByText("IT-01").closest("tr")!;
    expect(within(linhaItem).getAllByText("Sim").length).toBeGreaterThanOrEqual(2);
    expect(within(linhaItem).getByText("Não")).toBeTruthy();
    expect(within(linhaItem).getByText("campo")).toBeTruthy();
    expect(within(linhaItem).getByText("valor")).toBeTruthy();
    expect(linhaItem.textContent).not.toContain("{");
    expect(screen.getAllByText("CCT 2026 — versão 3").length).toBeGreaterThan(0);
    // efeito_portao exatamente do backend
    const l1 = screen.getByText("RC-01").closest("tr")!;
    const l2 = screen.getByText("RC-02").closest("tr")!;
    expect(within(l1).getByText("Afeta portão: Sim")).toBeTruthy();
    expect(within(l2).getByText("Afeta portão: Não")).toBeTruthy();
    // candidata x ativa
    const p1 = screen.getByText("RP-01").closest("tr")!;
    const p2 = screen.getByText("RP-02").closest("tr")!;
    expect(within(p1).getByText("Candidata")).toBeTruthy();
    expect(within(p2).getByText("Ativa")).toBeTruthy();
    expect(
      within(p1).getByText("Candidata").closest("[data-situacao]")?.getAttribute("data-situacao"),
    ).toBe("candidata");
    expect(within(p1).getByText("01/01/2026 a 31/12/2026")).toBeTruthy();
    expect(within(p1).getByText("Contrato")).toBeTruthy();
    expect(within(p1).getByText("v1")).toBeTruthy();
    // aprovar só para candidata
    expect(within(p1).getByRole("button", { name: "Aprovar regra RP-01" })).toBeTruthy();
    expect(within(p2).queryByRole("button", { name: /Aprovar/ })).toBeNull();
  });
  it("estados vazios por seção", async () => {
    cenario();
    montar();
    await screen.findByText(MENSAGENS_V109.vazioListas);
    await screen.findByText(MENSAGENS_V109.vazioConformidade);
    await screen.findByText(MENSAGENS_V109.vazioPreventivas);
  });
});

describe("V1-09 aprovação via RPC", () => {
  async function abrirAprovacao() {
    cenario({ preventivas: [regraPrev()] });
    montar();
    const btn = await screen.findByRole("button", { name: "Aprovar regra RP-01" });
    fireEvent.click(btn);
    return { btn, dlg: await screen.findByRole("dialog") };
  }
  it("parecer vazio → null; args exatos; protocolo exibido; sem mutação direta", async () => {
    const { dlg } = await abrirAprovacao();
    expect(within(dlg).getByLabelText("Parecer (opcional)")).toBeTruthy();
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    await screen.findByText(new RegExp(PROTO));
    expect(m.rpcChamadas).toEqual([
      {
        nome: "aprovar_regra_preventiva",
        args: { p_id_regra_preventiva: RP1, p_parecer: null },
      },
    ]);
    for (const c of m.chamadas)
      for (const [o] of c.ops) expect(["insert", "update", "delete", "upsert"]).not.toContain(o);
  });
  it("parecer preenchido é enviado com trim", async () => {
    const { dlg } = await abrirAprovacao();
    fireEvent.change(within(dlg).getByLabelText("Parecer (opcional)"), {
      target: { value: "  ok  " },
    });
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    expect(m.rpcChamadas[0]!.args).toEqual({ p_id_regra_preventiva: RP1, p_parecer: "ok" });
  });
  it("duplo clique → uma única RPC e texto Aprovando…", async () => {
    let resolver: (v: unknown) => void = () => {};
    m.rpc.mockReturnValueOnce(new Promise((r) => (resolver = r)));
    const { dlg } = await abrirAprovacao();
    const b = within(dlg).getByRole("button", { name: "Confirmar aprovação" });
    fireEvent.click(b);
    fireEvent.click(b);
    await within(dlg).findByText("Aprovando…");
    expect(m.rpcChamadas).toHaveLength(1);
    resolver({ data: PROTO, error: null });
    await screen.findByText(new RegExp(PROTO));
    expect(m.rpcChamadas).toHaveLength(1);
  });
  it("403 da RPC em PT-BR", async () => {
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "42501", message: "SQL x" } });
    const { dlg } = await abrirAprovacao();
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    await within(dlg).findByText(MENSAGENS_V109.semPermissao);
    expect(screen.queryByText("SQL x")).toBeNull();
  });
  it("404 da RPC em PT-BR", async () => {
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "P0002" } });
    const { dlg } = await abrirAprovacao();
    fireEvent.click(within(dlg).getByRole("button", { name: "Confirmar aprovação" }));
    await within(dlg).findByText(MENSAGENS_V109.regraNaoEncontrada);
  });
  it("conflito bloqueia nova submissão até recarregar", async () => {
    m.rpc.mockResolvedValueOnce({ data: null, error: { code: "PT409" } });
    const { dlg } = await abrirAprovacao();
    const b = within(dlg).getByRole("button", { name: "Confirmar aprovação" });
    fireEvent.click(b);
    await within(dlg).findByText(MENSAGENS_V109.conflito);
    expect((b as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(b);
    fireEvent.submit(b.closest("form")!);
    expect(m.rpcChamadas).toHaveLength(1);
    const antes = de("regras_preventivas").length;
    fireEvent.click(within(dlg).getByRole("button", { name: "Recarregar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(de("regras_preventivas").length).toBeGreaterThan(antes));
    expect(m.rpcChamadas).toHaveLength(1);
  });
  it("Esc fecha o diálogo e devolve foco ao gatilho", async () => {
    const { btn, dlg } = await abrirAprovacao();
    fireEvent.keyDown(dlg, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(btn));
  });
  it("detalhe abre em diálogo com fontes formais lazy", async () => {
    cenario({ preventivas: [regraPrev()] });
    montar();
    const b = await screen.findByRole("button", { name: "Detalhes da regra RP-01" });
    expect(de("fontes_formais_regras_preventivas")).toHaveLength(0);
    fireEvent.click(b);
    const dlg = await screen.findByRole("dialog");
    await within(dlg).findByText("Cláusula 5");
    const f = de("fontes_formais_regras_preventivas")[0]!;
    expect(op(f, "eq")).toContainEqual(["id_regra_preventiva", RP1]);
    fireEvent.keyDown(dlg, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(b));
  });
});

describe("V1-09 a11y, nav e estático", () => {
  it("H1 único e nav com aria-current em Regras", async () => {
    cenario();
    montar();
    await screen.findByText(MENSAGENS_V109.vazioListas);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]!.textContent).toBe("Listas e regras");
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    expect(within(nav).getByText("Regras").getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Visão geral" })).toBeTruthy();
    expect(within(nav).getByRole("link", { name: "Base normativa" })).toBeTruthy();
    expect(within(nav).getByRole("link", { name: "Orçamento" })).toBeTruthy();
  });
  it("arquivos novos sem segredos, casts proibidos ou mutação direta", () => {
    for (const f of [
      "src/lib/contratos/regrasDados.ts",
      "src/components/contratos/RegrasContrato.tsx",
      "src/routes/contratos_.$id_.regras.tsx",
    ]) {
      const s = readFileSync(f, "utf8");
      expect(s).not.toMatch(/service_role|sk_|PRIVATE KEY|as any|as never/);
      expect(s).not.toMatch(/\.(insert|update|delete|upsert)\(/);
    }
  });
  it("irmãs linkam Regras real (sem Em breve)", () => {
    for (const f of [
      "src/components/contratos/VisaoGeralContrato.tsx",
      "src/components/contratos/BaseNormativaContrato.tsx",
      "src/components/contratos/OrcamentoContrato.tsx",
    ]) {
      const s = readFileSync(f, "utf8");
      expect(s).toContain('to="/contratos/$id/regras"');
      expect(s).not.toMatch(/SECOES_FUTURAS = \["Regras"/);
    }
  });
});

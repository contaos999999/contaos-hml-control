import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

type Chamada = { tabela: string; ops: Array<[string, unknown[]]> };

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  chamadas: [] as Array<{ tabela: string; ops: Array<[string, unknown[]]> }>,
  respostas: {} as Record<string, (c: { tabela: string; ops: Array<[string, unknown[]]> }) => unknown>,
}));

vi.mock("@/integrations/supabase/client", () => {
  const from = (tabela: string) => {
    const c = { tabela, ops: [] as Array<[string, unknown[]]> };
    m.chamadas.push(c);
    const b: Record<string, unknown> = {};
    for (const op of ["select", "eq", "or", "order", "range", "abortSignal", "maybeSingle", "insert", "update", "delete", "upsert"]) {
      b[op] = (...args: unknown[]) => {
        c.ops.push([op, args]);
        return b;
      };
    }
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      try {
        return Promise.resolve(m.respostas[tabela]?.(c)).then(res, rej);
      } catch (e) {
        return Promise.reject(e).then(res, rej);
      }
    };
    return b;
  };
  return { supabase: { auth: { getUser: m.getUser, signOut: m.signOut }, from, rpc: m.rpc } };
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

import { NovoContrato, MENSAGENS_V105 } from "@/components/contratos/NovoContrato";
import { montarPayloadContrato, validarFormularioContrato, converterMoedaBR, TAMANHO_PAGINA_OPCOES } from "@/lib/contratos/novoContratoDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/contratos_.novo";

const U = "user-1";
const ORG = "org-1";
const org = (perfil: string, id = ORG) => ({ id, razao_social: "Org", nome_fantasia: null, cnpj: null, situacao: "ativa", perfil });
const ct = (i: number) => ({ id: `ct-${i}`, razao_social: `Contratante ${i}`, nome_fantasia: null, documento: null });

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <NovoContrato />
    </QueryClientProvider>,
  );
}
const op = (c: Chamada, nome: string) => c.ops.filter((o) => o[0] === nome).map((o) => o[1]);
const doTipo = (t: string) => m.chamadas.filter((c) => c.tabela === t);
const inserts = () => doTipo("contratos").filter((c) => op(c, "insert").length > 0);
const buscas = () => doTipo("contratantes");

async function escolherContratante(nome = "^Contratante 1$") {
  const cb = await screen.findByRole("combobox", { name: /Contratante/ });
  fireEvent.focus(cb);
  fireEvent.click(await screen.findByRole("option", { name: new RegExp(nome) }));
}
async function preencher(over: Partial<Record<"numero" | "objeto" | "inicio" | "fim" | "valorGlobal", string>> = {}) {
  const v = { numero: "CT-001/2026", objeto: "Serviços contábeis", inicio: "2026-01-01", fim: "", valorGlobal: "", ...over };
  fireEvent.change(await screen.findByLabelText(/Número/), { target: { value: v.numero } });
  fireEvent.change(screen.getByLabelText(/Objeto/), { target: { value: v.objeto } });
  fireEvent.change(screen.getByLabelText(/Data de início/), { target: { value: v.inicio } });
  fireEvent.change(screen.getByLabelText(/Data de término/), { target: { value: v.fim } });
  fireEvent.change(screen.getByLabelText(/Valor global/), { target: { value: v.valorGlobal } });
  await escolherContratante();
}
const salvar = () => fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

beforeEach(() => {
  vi.clearAllMocks();
  m.chamadas.length = 0;
  sessionStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  definirPreferenciaOrganizacao(U, ORG);
  m.rpc.mockResolvedValue({ data: [org("administrador")], error: null });
  m.respostas = {
    contratantes: (c) => {
      const [[de]] = op(c, "range") as [[number, number]];
      const itens = Array.from({ length: 20 }, (_, i) => ct(de + i + 1)).filter((x) => Number(x.id.slice(3)) <= 30);
      return { data: itens, error: null, count: 30, status: 200 };
    },
    contratos: () => ({ data: null, error: null, status: 201 }),
  };
});

describe("V1-05 rota", () => {
  it("head com título e noindex", () => {
    const h = (Route as unknown as { options: { head: () => { meta: Array<Record<string, string>> }; ssr: boolean } }).options;
    expect(h.ssr).toBe(false);
    const meta = h.head().meta;
    expect(meta).toContainEqual({ title: "Novo contrato — ContaOS" });
    expect(meta).toContainEqual({ name: "robots", content: "noindex" });
  });
});

describe("V1-05 gate (Master por herança, sem vínculo físico)", () => {
  it("Master via RPC libera formulário e não lê vinculos_usuarios", async () => {
    m.rpc.mockResolvedValue({ data: [org("administrador_master"), org("administrador_master", "org-2")], error: null });
    montar();
    expect(await screen.findByLabelText(/Número/)).toBeTruthy();
    expect(m.rpc).toHaveBeenCalledWith("listar_organizacoes_disponiveis");
    expect(doTipo("vinculos_usuarios")).toHaveLength(0);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
  it("gestor_contrato libera", async () => {
    m.rpc.mockResolvedValue({ data: [org("gestor_contrato")], error: null });
    montar();
    expect(await screen.findByLabelText(/Número/)).toBeTruthy();
  });
  it("leitor -> negado, zero consulta e zero INSERT", async () => {
    m.rpc.mockResolvedValue({ data: [org("leitor")], error: null });
    montar();
    expect(await screen.findByText(MENSAGENS_V105.negado)).toBeTruthy();
    expect(buscas()).toHaveLength(0);
    expect(inserts()).toHaveLength(0);
  });
  it("org ativa ausente da RPC -> negado", async () => {
    m.rpc.mockResolvedValue({ data: [org("administrador", "outra")], error: null });
    montar();
    expect(await screen.findByText(MENSAGENS_V105.negado)).toBeTruthy();
  });
  it("sem sessão -> /login; sem preferência -> /selecionar-organizacao", async () => {
    m.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const r = montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/login", replace: true }));
    r.unmount();
    sessionStorage.clear();
    montar();
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/selecionar-organizacao", replace: true }));
  });
});

describe("V1-05 ContratanteCombobox paginado", () => {
  it("consulta por org, ativos, range 0..19 e Carregar mais pede 20..39", async () => {
    montar();
    const cb = await screen.findByRole("combobox", { name: /Contratante/ });
    fireEvent.focus(cb);
    await screen.findByRole("option", { name: /Contratante 1$/ });
    const c0 = buscas()[0]!;
    expect(op(c0, "select")[0]![0]).toBe("id,razao_social,nome_fantasia,documento");
    expect(op(c0, "eq")).toContainEqual(["id_organizacao", ORG]);
    expect(op(c0, "eq")).toContainEqual(["situacao", "ativo"]);
    expect(op(c0, "range")).toEqual([[0, TAMANHO_PAGINA_OPCOES - 1]]);
    expect(op(c0, "abortSignal")).toHaveLength(1);
    expect(screen.getAllByRole("option")).toHaveLength(20);
    fireEvent.click(screen.getByRole("button", { name: "Carregar mais contratantes" }));
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(30));
    expect(op(buscas()[1]!, "range")).toEqual([[20, 39]]);
    expect(screen.queryByRole("button", { name: "Carregar mais contratantes" })).toBeNull();
  });
  it("busca é escapada via .or e `*` é rejeitado sem consulta", async () => {
    montar();
    const cb = await screen.findByRole("combobox", { name: /Contratante/ });
    fireEvent.focus(cb);
    await screen.findAllByRole("option");
    fireEvent.change(cb, { target: { value: "a,b" } });
    await waitFor(() => expect(buscas().some((c) => op(c, "or").length > 0)).toBe(true), { timeout: 2000 });
    const or = op(buscas().find((c) => op(c, "or").length > 0)!, "or")[0]![0] as string;
    expect(or).toContain('razao_social.ilike."%a,b%"');
    const antes = buscas().length;
    fireEvent.change(cb, { target: { value: "x*" } });
    expect(await screen.findByText(MENSAGENS_V105.buscaAsterisco)).toBeTruthy();
    await new Promise((r) => setTimeout(r, 450));
    expect(buscas().length).toBe(antes);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});

describe("V1-05 validação e payload", () => {
  it("objeto obrigatório bloqueia INSERT", async () => {
    montar();
    await preencher({ objeto: "" });
    salvar();
    expect(await screen.findByText("Informe o objeto do contrato.")).toBeTruthy();
    expect(inserts()).toHaveLength(0);
    expect(document.activeElement?.id).toBe("v105-objeto");
  });
  it("fim anterior ao início bloqueia INSERT", async () => {
    montar();
    await preencher({ inicio: "2026-05-10", fim: "2026-05-01" });
    salvar();
    expect(await screen.findByText("A data de término não pode ser anterior à data de início.")).toBeTruthy();
    expect(inserts()).toHaveLength(0);
  });
  it("contratante obrigatório (somente da lista)", () => {
    expect(validarFormularioContrato({ numero: "1", objeto: "x", idContratante: "", inicio: "2026-01-01", fim: "", valorGlobal: "", valorMensal: "", tipoContrato: "", unidadeVinculada: "", fonteRecurso: "" })).toContain("contratante");
  });
  it("moeda BR", () => {
    expect(converterMoedaBR("1.234,56")).toBe(1234.56);
    expect(converterMoedaBR("")).toBeNull();
    expect(Number.isNaN(converterMoedaBR("abc"))).toBe(true);
  });
  it("payload exato sem defaults server-side; opcionais vazios omitidos", () => {
    const p = montarPayloadContrato(ORG, { numero: " CT-1 ", objeto: " Obj ", idContratante: "ct-1", inicio: "2026-01-01", fim: "", valorGlobal: "1.000,00", valorMensal: "", tipoContrato: "", unidadeVinculada: "Sede", fonteRecurso: "" });
    expect(p).toEqual({ id_organizacao: ORG, id_contratante: "ct-1", numero: "CT-1", objeto: "Obj", inicio: "2026-01-01", valor_global: 1000, unidade_vinculada: "Sede" });
  });
});

describe("V1-05 criar contrato", () => {
  it("INSERT único sem .select(), sucesso navega para /contratos", async () => {
    montar();
    await preencher({ valorGlobal: "10.000,00", fim: "2026-12-31" });
    const b = screen.getByRole("button", { name: "Salvar" });
    fireEvent.click(b);
    fireEvent.click(b);
    expect(await screen.findByText(MENSAGENS_V105.sucesso)).toBeTruthy();
    expect(inserts()).toHaveLength(1);
    const c = inserts()[0]!;
    expect(op(c, "select")).toHaveLength(0);
    expect(op(c, "insert")[0]![0]).toEqual({ id_organizacao: ORG, id_contratante: "ct-1", numero: "CT-001/2026", objeto: "Serviços contábeis", inicio: "2026-01-01", fim: "2026-12-31", valor_global: 10000 });
    await waitFor(() => expect(m.nav).toHaveBeenCalledWith({ to: "/contratos" }), { timeout: 2500 });
  });
  it("Cancelar aponta para /contratos", async () => {
    montar();
    expect((await screen.findByRole("link", { name: "Cancelar" })).getAttribute("href")).toBe("/contratos");
  });
  it.each([
    [{ code: "42501" }, 403, MENSAGENS_V105.negadoInsert],
    [{ code: "PGRST301" }, 401, MENSAGENS_V105.negadoInsert],
    [{ code: "PT400" }, 422, MENSAGENS_V105.invalido],
    [{ code: "23514" }, 400, MENSAGENS_V105.invalido],
    [{ code: "23505" }, 409, MENSAGENS_V105.duplicado],
    [{ code: "XX000", message: "boom stack" }, 500, MENSAGENS_V105.erroEnvio],
  ])("erro %o -> mensagem PT-BR, sem detalhes técnicos", async (error, status, msg) => {
    m.respostas["contratos"] = () => ({ data: null, error, status });
    montar();
    await preencher();
    salvar();
    expect(await screen.findByText(msg)).toBeTruthy();
    expect(screen.queryByText(/boom|XX000|stack/)).toBeNull();
    expect(m.nav).not.toHaveBeenCalledWith({ to: "/contratos" });
    expect((screen.getByLabelText(/Número/) as HTMLInputElement).value).toBe("CT-001/2026");
  });
  it("rede -> erro genérico", async () => {
    m.respostas["contratos"] = () => {
      throw new TypeError("Failed to fetch");
    };
    montar();
    await preencher();
    await act(async () => salvar());
    expect(await screen.findByText(MENSAGENS_V105.erroEnvio)).toBeTruthy();
  });
});

describe("V1-05 source scan", () => {
  it("sem operações/segredos proibidos", () => {
    for (const f of ["src/lib/contratos/novoContratoDados.ts", "src/components/contratos/NovoContrato.tsx", "src/routes/contratos_.novo.tsx"]) {
      const s = readFileSync(f, "utf8");
      for (const t of [".update(", ".delete(", ".upsert(", ".rpc(", "functions.invoke", "service_role", "sb_secret", "vinculos_usuarios", ".select().", "sessionStorage", "situacao: \"rascunho\"", "versao_registro"]) {
        expect(s.includes(t), `${f} contém ${t}`).toBe(false);
      }
    }
    expect(readFileSync("src/lib/contratos/novoContratoDados.ts", "utf8").match(/\.insert\(/g)).toHaveLength(1);
  });
});

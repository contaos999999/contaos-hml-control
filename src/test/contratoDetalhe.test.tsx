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
  rpcChamadas: [] as Array<{ nome: string; args: unknown; signal: AbortSignal | null }>,
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
  // Builder RPC realista: thenable com .abortSignal(); abort resolve com erro AbortError (como postgrest-js).
  const rpc = (nome: string, args: unknown) => {
    const reg: { nome: string; args: unknown; signal: AbortSignal | null } = { nome, args, signal: null };
    m.rpcChamadas.push(reg);
    const b: { [k: string]: unknown } = {};
    b["abortSignal"] = (s: AbortSignal) => {
      reg.signal = s;
      return b;
    };
    b["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => {
      let p: Promise<unknown>;
      try {
        p = Promise.resolve(m.rpc(nome, args));
      } catch (e) {
        p = Promise.reject(e);
      }
      const s = reg.signal;
      if (s) {
        const abortado = new Promise((r) => {
          const fim = () => r({ data: null, error: { name: "AbortError", message: "aborted", code: "20" } });
          if (s.aborted) fim();
          else s.addEventListener("abort", fim, { once: true });
        });
        p = Promise.race([p, abortado]);
      }
      return p.then(res, rej);
    };
    return b;
  };
  return { supabase: { auth: { getUser: m.getUser, signOut: m.signOut }, from, rpc, functions: { invoke: m.invoke } } };
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
  m.rpcChamadas.length = 0;
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
  it.each([
    ["leitor com escopo", "org-A"],
    ["Administrador Master sem vínculo físico", "org-M"],
  ])("%s lê o resumo; autoridade é do backend, sem consulta de perfil/vínculo local", async (_p, org) => {
    window.sessionStorage.clear();
    definirPreferenciaOrganizacao(U, org);
    m.resposta = () => ok({ ...contrato(K1), id_organizacao: org });
    montar();
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
    expect(screen.getByText("Prefeitura X")).toBeTruthy();
    expect(m.chamadas.map((c) => c.tabela)).toEqual(["contratos"]);
    expect(m.rpcChamadas).toHaveLength(0);
  });
  it("org A→B→A via unmount/qc.clear/preferência/remount; resposta tardia não invade contexto novo", async () => {
    const B = "org-B";
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let soltarA: (v: unknown) => void = () => {};
    m.resposta = () => new Promise((r) => (soltarA = r));
    const r1 = montar(K1, qc);
    await waitFor(() => expect(sel()).toHaveLength(1));
    r1.unmount();
    qc.clear();
    definirPreferenciaOrganizacao(U, B);
    m.resposta = () => ok({ ...contrato(K1, "CT-B"), id_organizacao: B });
    const r2 = montar(K1, qc);
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-B" })).toBeTruthy();
    soltarA(ok(contrato(K1, "CT-A-TARDIO")));
    await new Promise((x) => setTimeout(x, 20));
    expect(screen.queryByText("Contrato CT-A-TARDIO")).toBeNull();
    r2.unmount();
    qc.clear();
    definirPreferenciaOrganizacao(U, A);
    m.resposta = () => ok(contrato(K1, "CT-A"));
    montar(K1, qc);
    expect(screen.queryByText("Contrato CT-B")).toBeNull();
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-A" })).toBeTruthy();
    expect(sel()).toHaveLength(3);
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

const sigSelect = (i = 0) => sel()[i]!.ops.find((o) => o[0] === "abortSignal")![1][0] as AbortSignal;
const KU = "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA";
const KL = KU.toLowerCase();

describe("V1-06 revisão: UUID maiúsculo", () => {
  it("URL uppercase com letras + backend lowercase => resumo renderizado, sem classificador, sem loop", async () => {
    m.resposta = () => ok(contrato(KL));
    montar(KU);
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
    expect(screen.queryByText(MENSAGENS_V106.carregando)).toBeNull();
    await new Promise((x) => setTimeout(x, 30));
    expect(sel()).toHaveLength(1);
    expect(m.rpc).not.toHaveBeenCalled();
    expect(uuidValido(KU)).toBe(true);
  });
  it("resposta com id diferente continua bloqueada (proteção stale preservada)", async () => {
    m.resposta = () => ok(contrato(K2, "CT-OUTRO"));
    montar(KU);
    await waitFor(() => expect(sel()).toHaveLength(1));
    await new Promise((x) => setTimeout(x, 30));
    expect(screen.queryByText("Contrato CT-OUTRO")).toBeNull();
  });
});

describe("V1-06 revisão: abort do classificador", () => {
  it("SELECT zero → RPC pendente usa o MESMO signal do SELECT; unmount aborta", async () => {
    m.resposta = () => ok(null);
    m.rpc.mockReturnValue(new Promise(() => {}));
    const r = montar();
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    const s = m.rpcChamadas[0]!.signal;
    expect(s).toBeInstanceOf(AbortSignal);
    expect(s).toBe(sigSelect());
    expect(s!.aborted).toBe(false);
    r.unmount();
    await waitFor(() => expect(s!.aborted).toBe(true));
  });
  it("troca de id durante RPC pendente: aborta signal antigo e resultado velho não substitui contrato atual", async () => {
    let soltar: (v: unknown) => void = () => {};
    m.resposta = (c) => (c.ops.find((o) => o[0] === "eq")![1][1] === K1 ? ok(null) : ok(contrato(K2, "CT-002")));
    m.rpc.mockReturnValue(new Promise((r) => (soltar = r)));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const r = montar(K1, qc);
    await waitFor(() => expect(m.rpcChamadas).toHaveLength(1));
    const s = m.rpcChamadas[0]!.signal!;
    expect(s).toBe(sigSelect(0));
    r.rerender(<QueryClientProvider client={qc}><VisaoGeralContrato id={K2} /></QueryClientProvider>);
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-002" })).toBeTruthy();
    await waitFor(() => expect(s.aborted).toBe(true));
    soltar({ data: "nao_encontrado", error: null });
    await new Promise((x) => setTimeout(x, 20));
    expect(screen.queryByText(MENSAGENS_V106.naoEncontrado)).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Contrato CT-002" })).toBeTruthy();
    expect(m.rpcChamadas).toHaveLength(1);
  });
  it("signal já abortado após SELECT zero linhas => classificador não inicia", async () => {
    let soltar: (v: unknown) => void = () => {};
    m.resposta = () => new Promise((r) => (soltar = r));
    const r = montar();
    await waitFor(() => expect(sel()).toHaveLength(1));
    const s = sigSelect();
    r.unmount();
    await waitFor(() => expect(s.aborted).toBe(true));
    soltar(ok(null));
    await new Promise((x) => setTimeout(x, 20));
    expect(m.rpcChamadas).toHaveLength(0);
  });
  it("SELECT erro ou linha => nenhum classificador", async () => {
    m.resposta = () => ok(contrato(K1));
    const r = montar();
    await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" });
    r.unmount();
    m.resposta = () => ({ data: null, error: { code: "XX000" }, status: 500 });
    montar();
    await screen.findByText(MENSAGENS_V106.erro);
    expect(m.rpcChamadas).toHaveLength(0);
  });
});

describe("V1-06 navegação e scan", () => {
  it("navegação: só Base normativa é link; demais futuras indisponíveis; voltar seguro", async () => {
    m.resposta = () => ok(contrato(K1));
    montar();
    await screen.findByText("Prefeitura X");
    const nav = screen.getByRole("navigation", { name: "Seções do contrato" });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(3);
    expect(links[0]!.textContent).toBe("Base normativa");
    expect(links[0]!.getAttribute("href")).toBe("/contratos/$id/base-normativa");
    expect(links[1]!.textContent).toBe("Orçamento");
    expect(links[1]!.getAttribute("href")).toBe("/contratos/$id/orcamento");
    expect(links[2]!.textContent).toBe("Regras");
    expect(links[2]!.getAttribute("href")).toBe("/contratos/$id/regras");
    for (const t of ["Documentos", "Competências"]) {
      const el = screen.getByText(t).closest("[aria-disabled]");
      expect(el?.getAttribute("aria-disabled")).toBe("true");
    }
    expect(screen.getByText("Visão geral").closest("[aria-current]")?.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: /Voltar para contratos/ }).getAttribute("href")).toBe("/contratos");
    expect(sel()).toHaveLength(1);
  });
  it("contratante null mantém resumo; status desconhecido literal sem inferência; zero cargas pesadas", async () => {
    m.resposta = () => ok({ ...contrato(K1), contratante: null, situacao: "xpto_novo", criticidade: "zz_desconhecida" });
    montar();
    expect(await screen.findByRole("heading", { level: 1, name: "Contrato CT-001" })).toBeTruthy();
    expect(screen.getByText("Serviços de limpeza")).toBeTruthy();
    expect(screen.getByText("xpto_novo")).toBeTruthy();
    expect(screen.getByText("zz_desconhecida")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(m.chamadas.map((c) => c.tabela)).toEqual(["contratos"]);
    expect(m.rpcChamadas).toHaveLength(0);
    expect(m.invoke).not.toHaveBeenCalled();
  });
  it("arquivos novos sem mutações, secrets, casts proibidos; único rpc é o classificador", () => {
    const fs = ["src/components/contratos/VisaoGeralContrato.tsx", "src/lib/contratos/contratoDetalheDados.ts", "src/routes/contratos_.$id.tsx"].map((p) => readFileSync(p, "utf8")).join("\n");
    for (const t of [".insert(", ".update(", ".delete(", ".upsert(", "functions.invoke", "service_role", "sb_secret", "localStorage", "as any", "as never", "as unknown as", "placeholderData", "keepPreviousData"]) expect(fs).not.toContain(t);
    const rpcs = fs.match(/\.rpc\(\s*"([^"]+)"/g) ?? [];
    expect(rpcs).toEqual(['.rpc("classificar_acesso_contrato_v106"']);
  });
});

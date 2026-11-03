import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { useLayoutEffect, type ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => {
  const rpc = (nome: string, args: Record<string, unknown>) => {
    let p: Promise<unknown> | null = null;
    const run = () => (p ??= Promise.resolve().then(() => m.rpc(nome, args)));
    return {
      abortSignal: () => run(),
      then: (a: (v: unknown) => unknown, b?: (e: unknown) => unknown) => run().then(a, b),
    };
  };
  return {
    supabase: {
      auth: { getUser: m.getUser },
      from: m.from,
      rpc,
      functions: { invoke: m.invoke },
    },
  };
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

import { CompetenciaAnalise } from "@/components/competencias/CompetenciaAnalise";
import { classificarErroV116, parseAnaliseV116 } from "@/lib/competencias/competenciaAnaliseDados";
import * as preferenciaDados from "@/lib/organizacao/preferenciaOrganizacao";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { Route } from "@/routes/competencias_.$id_.analise";

const U = "user-1";
const ID = "44444444-4444-4444-8444-444444444444";
const ID_B = "55555555-5555-4555-8555-555555555555";
const ORG = "22222222-2222-4222-8222-222222222222";
const K = "11111111-1111-4111-8111-111111111111";
const EXEC = "99999999-9999-4999-8999-999999999999";
const EXEC2 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const LER = "obter_analise_competencia_v116";
const SOL = "solicitar_analise_competencia";

type Op = {
  id?: string;
  estado?: string;
  stale?: boolean;
  percentual?: number;
  exec?: string | null;
  executar?: boolean;
  reanalisar?: boolean;
  abrir?: boolean;
  resultados?: unknown[];
  resTotal?: number;
  apontamentos?: unknown[];
  apTotal?: number;
  execTotal?: number;
  mecanismos?: unknown;
  liberado?: boolean;
  ref?: string;
};
function resultado(o: { mec?: string; cod?: string; crit?: string | null } = {}) {
  return {
    id_resultado: "r-" + (o.cod ?? "R1"),
    id_requisito: "q-" + (o.cod ?? "R1"),
    requisito: {
      codigo: o.cod ?? "R1",
      descricao: "Folha de pagamento do mês",
      categoria: "trabalhista",
      criticidade: o.crit === undefined ? "alta" : o.crit,
      obrigatorio: true,
      aplicavel: true,
      impeditivo: false,
      efeito_portao: "bloqueia",
      fonte_tipo: "contrato",
      fonte_referencia: "Cláusula 7",
      fonte_detalhe: null,
    },
    resultado: "nao_conforme",
    mecanismo: o.mec ?? "deterministico",
    confianca: 0.82,
    justificativa: "Valor divergente do recibo",
    fundamento: "Cláusula 7.2",
    hash_evidencias: null,
    metadados: {},
    evidencias: [
      {
        id: "e1",
        id_versao_documento: null,
        pagina: 3,
        trecho: "Total líquido R$ 10,00",
        tipo_evidencia: "documento",
        referencia_externa: null,
        hash: null,
        criado_em: "2026-03-10T12:00:00Z",
      },
    ],
    criado_em: "2026-03-10T12:00:00Z",
  };
}
function execucao(id = EXEC, status = "concluida") {
  return {
    id,
    tipo: "completa",
    status,
    hash_entrada: "h-antigo",
    contexto_atual: false,
    motor: "motor-x",
    versao_motor: "2.1.0",
    provedor: null,
    modelo: "modelo-y",
    prompt_versao: "p3",
    iniciada_por: U,
    iniciada_em: "2026-03-10T12:00:00Z",
    concluida_em: "2026-03-10T12:05:00Z",
    erro_codigo: null,
    requisitos_afetados: [],
    metadados: {},
    criado_em: "2026-03-10T12:00:00Z",
  };
}
function apontamento() {
  return {
    id: "ap1",
    id_requisito: "q-R1",
    requisito: { codigo: "R1", descricao: "Folha", categoria: null, criticidade: "alta" },
    descricao: "Recibo ausente",
    severidade: "informativo",
    status: "aberto",
    origem: "motor",
    regra_violada: "REG-9",
    acao_sugerida: "Enviar recibo",
    fonte: {},
    criado_em: "2026-03-10T12:00:00Z",
    atualizado_em: null,
  };
}
function leitura(o: Op = {}) {
  const exec = o.exec === undefined ? EXEC : o.exec;
  return {
    schema_versao: "v116-v1",
    competencia: {
      id: o.id ?? ID,
      id_organizacao: ORG,
      id_contrato: K,
      competencia_referencia: o.ref ?? "2026-03-01",
      periodo_inicio: null,
      periodo_fim: null,
      situacao: "em_analise",
    },
    estado_analise: o.estado ?? "complete",
    stale: o.stale ?? false,
    hash_contexto_atual: "h-atual",
    execucao_atual: exec ? execucao(exec) : null,
    percentual: o.percentual ?? 40,
    blocking_summary: {
      total: 10,
      conformes_ou_na_validos: 4,
      pendentes: 3,
      nao_conformes: 2,
      inconclusivos: 1,
      em_analise: 0,
      nao_conformidades_bloqueantes: 2,
      percentual: o.percentual ?? 40,
      liberado: o.liberado ?? false,
    },
    allowed_actions: {
      executar_analise: o.executar ?? false,
      reanalisar: o.reanalisar ?? false,
      abrir_requisito: o.abrir ?? true,
    },
    mecanismos:
      o.mecanismos === undefined
        ? exec
          ? { deterministico: 1, semantico: 0, humano: 0, nao_identificado: 0 }
          : {}
        : o.mecanismos,
    resultados: o.resultados ?? (exec ? [resultado()] : []),
    resultados_paginacao: { offset: 0, limite: 25, total: o.resTotal ?? 1 },
    execucoes: exec ? [execucao(exec)] : [],
    execucoes_paginacao: { offset: 0, limite: 10, total: o.execTotal ?? (exec ? 1 : 0) },
    apontamentos: o.apontamentos ?? [apontamento()],
    apontamentos_paginacao: { offset: 0, limite: 25, total: o.apTotal ?? 1 },
  };
}

const lidas = () => m.rpc.mock.calls.filter((c) => c[0] === LER);
const ultimaLeitura = () => lidas().at(-1)![1] as Record<string, unknown>;
const solicitacoes = () => m.rpc.mock.calls.filter((c) => c[0] === SOL);
const pronto = () => screen.findByRole("heading", { level: 2, name: /Requisitos analisados/ });

function sessao() {
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  definirPreferenciaOrganizacao(U, ORG);
}
function rpcLeitura(f: (args: Record<string, unknown>) => unknown) {
  m.rpc.mockImplementation((nome: string, args: Record<string, unknown>) =>
    nome === LER ? f(args) : { data: null, error: null },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  sessao();
  rpcLeitura(() => ({ data: leitura(), error: null }));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("V1-16 rota", () => {
  it("rota literal, ssr:false e head PT-BR", () => {
    const r = Route as unknown as {
      path: string;
      options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
    };
    expect(r.path).toBe("/competencias_/$id_/analise");
    expect(r.options.ssr).toBe(false);
    const meta = r.options.head().meta;
    expect(meta.find((x) => x["title"])?.["title"]).toMatch(/Análise/);
    expect(meta.some((x) => x["property"] === "og:title")).toBe(true);
    expect(meta.some((x) => x["name"] === "twitter:card")).toBe(true);
  });
});

describe("V1-16 gate", () => {
  it("UUID inválido: zero Auth, preferência e RPC", async () => {
    const pref = vi.spyOn(preferenciaDados, "obterPreferenciaOrganizacao");
    render(<CompetenciaAnalise id="abc" />);
    expect(await screen.findByText(/Competência não encontrada/)).toBeInTheDocument();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(m.getUser).not.toHaveBeenCalled();
    expect(pref).not.toHaveBeenCalled();
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.invoke).not.toHaveBeenCalled();
  });

  it("válida → abc: zero novas chamadas e sem dados antigos", async () => {
    const { rerender } = render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const [u, r] = [m.getUser.mock.calls.length, m.rpc.mock.calls.length];
    rerender(<CompetenciaAnalise id="abc" />);
    expect(await screen.findByText(/Competência não encontrada/)).toBeInTheDocument();
    await act(async () => {
      await new Promise((x) => setTimeout(x, 20));
    });
    expect(m.getUser.mock.calls.length).toBe(u);
    expect(m.rpc.mock.calls.length).toBe(r);
    expect(screen.queryByText("Folha de pagamento do mês")).toBeNull();
  });

  it("ordem: sessão → preferência → leitura V1-16 com limites 25/10/25 e offsets 0", async () => {
    const ordem: string[] = [];
    m.getUser.mockImplementation(async () => {
      ordem.push("auth");
      return { data: { user: { id: U } }, error: null };
    });
    const pref = vi.spyOn(preferenciaDados, "obterPreferenciaOrganizacao");
    pref.mockImplementation(() => {
      ordem.push("pref");
      return ORG;
    });
    rpcLeitura(() => {
      ordem.push("rpc");
      return { data: leitura(), error: null };
    });
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(ordem.slice(0, 3)).toEqual(["auth", "pref", "rpc"]);
    expect(ultimaLeitura()).toEqual({
      p_id_competencia: ID,
      p_resultados_offset: 0,
      p_resultados_limite: 25,
      p_execucoes_offset: 0,
      p_execucoes_limite: 10,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
      p_filtro_resultado: null,
      p_filtro_criticidade: null,
      p_filtro_mecanismo: null,
      p_filtro_apontamento_status: null,
      p_busca: null,
    });
    pref.mockRestore();
  });

  it("sem preferência: vai para seleção de organização, sem RPC", async () => {
    sessionStorage.clear();
    render(<CompetenciaAnalise id={ID} />);
    await waitFor(() => expect(m.nav).toHaveBeenCalled());
    expect(m.nav.mock.calls[0]![0]).toMatchObject({ to: "/selecionar-organizacao" });
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it.each([
    [{ code: "42501", message: "permission denied for table x" }, undefined, /não tem acesso/],
    [{ code: "PGRST301", message: "jwt" }, 401, /não tem acesso/],
    [{ code: "x", message: "forbidden raw" }, 403, /não tem acesso/],
    [{ code: "PT404", message: "Não encontramos a competência informada." }, 404, /não encontrada/],
    [
      { code: "PT400", message: "O filtro de mecanismo não é válido." },
      400,
      /Não foi possível carregar/,
    ],
    [{ code: "XX000", message: "ERROR: relation secret" }, 500, /Não foi possível carregar/],
  ])("erro %o → mensagem sanitizada", async (error, status, re) => {
    rpcLeitura(() => ({ data: null, error, status }));
    render(<CompetenciaAnalise id={ID} />);
    expect(await screen.findByText(re)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(error.message);
    expect(screen.queryByText(/Nenhum requisito/)).toBeNull();
  });

  it("transporte (throw) → erro genérico", async () => {
    rpcLeitura(() => {
      throw new Error("fetch failed ECONNRESET");
    });
    render(<CompetenciaAnalise id={ID} />);
    expect(await screen.findByText(/Não foi possível carregar/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/ECONNRESET/);
  });

  it("classificarErroV116", () => {
    expect(classificarErroV116({ code: "42501" })).toBe("sem_permissao");
    expect(classificarErroV116({ code: "" }, 403)).toBe("sem_permissao");
    expect(classificarErroV116({ code: "PT404" })).toBe("nao_encontrada");
    expect(classificarErroV116({ code: "PT400" })).toBe("erro");
  });
});

describe("V1-16 parser fail-closed", () => {
  const base = () => leitura() as Record<string, unknown>;
  const com = (f: (l: Record<string, unknown>) => void) => {
    const l = base();
    f(l);
    return l;
  };
  it.each<[string, (l: Record<string, unknown>) => void]>([
    ["schema", (l) => (l["schema_versao"] = "v115-v1")],
    ["estado ausente", (l) => delete l["estado_analise"]],
    ["estado desconhecido", (l) => (l["estado_analise"] = "pronto")],
    ["stale ausente", (l) => delete l["stale"]],
    ["stale string", (l) => (l["stale"] = "false")],
    ["percentual ausente", (l) => delete l["percentual"]],
    ["percentual null", (l) => (l["percentual"] = null)],
    ["percentual string", (l) => (l["percentual"] = "40")],
    ["percentual NaN", (l) => (l["percentual"] = Number.NaN)],
    ["allowed_actions ausente", (l) => delete l["allowed_actions"]],
    [
      "allowed_actions não booleano",
      (l) => ((l["allowed_actions"] as Record<string, unknown>)["reanalisar"] = 1),
    ],
    [
      "allowed abrir ausente",
      (l) => delete (l["allowed_actions"] as Record<string, unknown>)["abrir_requisito"],
    ],
    ["blocking_summary ausente", (l) => delete l["blocking_summary"]],
    ["resultados não array", (l) => (l["resultados"] = {})],
    ["execucoes ausente", (l) => delete l["execucoes"]],
    ["apontamentos null", (l) => (l["apontamentos"] = null)],
    [
      "paginação total ausente",
      (l) => delete (l["resultados_paginacao"] as Record<string, unknown>)["total"],
    ],
    [
      "paginação offset string",
      (l) => ((l["execucoes_paginacao"] as Record<string, unknown>)["offset"] = "0"),
    ],
    ["apontamentos_paginacao ausente", (l) => delete l["apontamentos_paginacao"]],
    [
      "mecanismos contagem ausente com execução",
      (l) => delete (l["mecanismos"] as Record<string, unknown>)["humano"],
    ],
    [
      "mecanismos não numérico",
      (l) => ((l["mecanismos"] as Record<string, unknown>)["semantico"] = "0"),
    ],
    [
      "mecanismo do resultado inválido",
      (l) => ((l["resultados"] as Array<Record<string, unknown>>)[0]!["mecanismo"] = "ia"),
    ],
    [
      "mecanismo do resultado ausente",
      (l) => delete (l["resultados"] as Array<Record<string, unknown>>)[0]!["mecanismo"],
    ],
    [
      "criticidade inválida",
      (l) =>
        ((
          (l["resultados"] as Array<Record<string, unknown>>)[0]!["requisito"] as Record<
            string,
            unknown
          >
        )["criticidade"] = "urgente"),
    ],
    [
      "severidade apontamento inválida",
      (l) => ((l["apontamentos"] as Array<Record<string, unknown>>)[0]!["severidade"] = "x"),
    ],
    [
      "fonte apontamento não objeto",
      (l) => ((l["apontamentos"] as Array<Record<string, unknown>>)[0]!["fonte"] = "x"),
    ],
  ])("%s → null", (_n, f) => {
    expect(parseAnaliseV116(com(f))).toBeNull();
  });
  it("não-objeto → null", () => {
    expect(parseAnaliseV116(null)).toBeNull();
    expect(parseAnaliseV116([])).toBeNull();
  });
  it("preserva 0/false válidos", () => {
    const l = parseAnaliseV116(
      leitura({
        percentual: 0,
        executar: false,
        reanalisar: false,
        abrir: false,
        resTotal: 0,
        resultados: [],
        mecanismos: { deterministico: 0, semantico: 0, humano: 0, nao_identificado: 0 },
      }),
    )!;
    expect(l).not.toBeNull();
    expect(l.percentual).toBe(0);
    expect(l.stale).toBe(false);
    expect(l.allowed_actions).toEqual({
      executar_analise: false,
      reanalisar: false,
      abrir_requisito: false,
    });
    expect(l.mecanismos).toEqual({
      deterministico: 0,
      semantico: 0,
      humano: 0,
      nao_identificado: 0,
    });
    expect(l.resultados_paginacao.total).toBe(0);
  });
  it("not_analyzed sem execução: mecanismos {} vira ausência (null), sem inventar zeros", () => {
    const l = parseAnaliseV116(leitura({ estado: "not_analyzed", exec: null }))!;
    expect(l).not.toBeNull();
    expect(l.execucao_atual).toBeNull();
    expect(l.mecanismos).toBeNull();
  });
});

describe("V1-16 estados backend", () => {
  it.each([
    ["not_analyzed", /Não analisada/],
    ["queued", /Na fila/],
    ["processing", /Processando/],
    ["failed", /Falhou/],
    ["complete", /Concluída/],
    ["stale", /Desatualizada/],
  ])("%s → texto do estado", async (estado, re) => {
    rpcLeitura(() => ({
      data: leitura({
        estado,
        stale: estado === "stale",
        exec: estado === "not_analyzed" ? null : EXEC,
      }),
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    const st = await screen.findByRole("status", { name: /Estado da análise/ });
    expect(st.textContent).toMatch(re);
    expect(st.querySelector("svg")).not.toBeNull();
  });

  it("fixture incoerente (complete + percentual 0 + bloqueios + hashes divergentes) mostrada literalmente", async () => {
    rpcLeitura(() => ({
      data: leitura({ estado: "complete", stale: false, percentual: 0, liberado: true }),
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(screen.getByRole("status", { name: /Estado da análise/ }).textContent).toMatch(
      /Concluída/,
    );
    expect(screen.queryByText(/Desatualizada/)).toBeNull();
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("0");
    expect(screen.getByText(/Liberado pelo portão: Sim/)).toBeInTheDocument();
    expect(screen.getByText(/Não conformidades bloqueantes/).parentElement!.textContent).toMatch(
      /2/,
    );
  });

  it("percentual formatado em pt-BR a partir do backend", async () => {
    rpcLeitura(() => ({ data: leitura({ percentual: 87.5 }), error: null }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("87.5");
    expect(screen.getByRole("meter").textContent).toMatch(/87,5%/);
  });
});

describe("V1-16 mecanismos, evidência, apontamentos, histórico", () => {
  it.each([
    ["deterministico", "Determinístico"],
    ["semantico", "Semântico"],
    ["humano", "Humano"],
    ["nao_identificado", "Não identificado"],
  ])("mecanismo %s → %s", async (mec, rot) => {
    rpcLeitura(() => ({ data: leitura({ resultados: [resultado({ mec })] }), error: null }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const tabela = screen.getByRole("table", { name: /Requisitos analisados/ });
    expect(within(tabela).getByText(rot)).toBeInTheDocument();
    if (mec === "nao_identificado") expect(within(tabela).queryByText("Determinístico")).toBeNull();
  });

  it("resumo de mecanismos com contagens do backend, incluindo zero", async () => {
    rpcLeitura(() => ({
      data: leitura({
        mecanismos: { deterministico: 3, semantico: 0, humano: 2, nao_identificado: 7 },
      }),
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const r = screen.getByRole("region", { name: /Mecanismos/ });
    expect(within(r).getByText("Não identificado").parentElement!.textContent).toMatch(/7/);
    expect(within(r).getByText("Semântico").parentElement!.textContent).toMatch(/0/);
  });

  it("apontamento exibe a fonte retornada pelo backend sem inventar campos", async () => {
    rpcLeitura(() => {
      const d = leitura();
      (d.apontamentos as Array<Record<string, unknown>>)[0]!["fonte"] = {
        documento: "Recibo 03",
        pagina: 4,
      };
      return { data: d, error: null };
    });
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const apReg = screen.getByRole("region", { name: /^Apontamentos$/ });
    const fonte = within(apReg).getByText(/Fonte:/);
    expect(fonte.textContent).toMatch(/documento: Recibo 03/);
    expect(fonte.textContent).toMatch(/pagina: 4/);
  });

  it("evidência, criticidade, apontamento e histórico renderizados; ausentes omitidos", async () => {
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(screen.getByText(/Total líquido R\$ 10,00/)).toBeInTheDocument();
    expect(screen.getByText(/p\. 3/)).toBeInTheDocument();
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getByText("Recibo ausente")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: /^Apontamentos$/ })).getByText("Informativo"),
    ).toBeInTheDocument();
    expect(screen.getByText(/REG-9/)).toBeInTheDocument();
    expect(screen.getByText(/Enviar recibo/)).toBeInTheDocument();
    const apReg = screen.getByRole("region", { name: /^Apontamentos$/ });
    expect(within(apReg).getByText(/Origem: motor/)).toBeInTheDocument();
    expect(within(apReg).queryByText(/Fonte:/)).toBeNull();
    const hist = screen.getByRole("region", { name: /Histórico de execuções/ });
    expect(within(hist).getByText(/2\.1\.0/)).toBeInTheDocument();
    expect(within(hist).getByText(/modelo-y/)).toBeInTheDocument();
    expect(within(hist).getAllByText(/10\/03\/2026/).length).toBeGreaterThan(0);
    expect(within(hist).queryByText(/Provedor/)).toBeNull();
  });
});

describe("V1-16 filtros e paginação server-side", () => {
  async function montar() {
    rpcLeitura((a) => ({
      data: {
        ...leitura({ resTotal: 60, apTotal: 60, execTotal: 30 }),
        resultados_paginacao: { offset: a["p_resultados_offset"], limite: 25, total: 60 },
        execucoes_paginacao: { offset: a["p_execucoes_offset"], limite: 10, total: 30 },
        apontamentos_paginacao: { offset: a["p_apontamentos_offset"], limite: 25, total: 60 },
      },
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    for (const n of [
      /Próxima página de resultados/,
      /Próxima página de execuções/,
      /Próxima página de apontamentos/,
    ]) {
      fireEvent.click(screen.getByRole("button", { name: n }));
      await waitFor(() => expect(screen.getByRole("button", { name: n })).not.toBeDisabled());
    }
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_resultados_offset: 25,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 25,
      }),
    );
  }
  const muda = async (label: RegExp, valor: string) => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
  };

  it("paginações independentes", async () => {
    await montar();
  });
  it("resultado zera só resultados", async () => {
    await montar();
    await muda(/^Resultado$/, "conforme");
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_filtro_resultado: "conforme",
        p_resultados_offset: 0,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 25,
      }),
    );
  });
  it("mecanismo zera só resultados", async () => {
    await montar();
    await muda(/^Mecanismo$/, "nao_identificado");
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_filtro_mecanismo: "nao_identificado",
        p_resultados_offset: 0,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 25,
      }),
    );
  });
  it("criticidade zera resultados e apontamentos", async () => {
    await montar();
    await muda(/^Criticidade$/, "critica");
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_filtro_criticidade: "critica",
        p_resultados_offset: 0,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 0,
      }),
    );
  });
  it("status do apontamento zera só apontamentos", async () => {
    await montar();
    await muda(/^Status do apontamento$/, "aberto");
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_filtro_apontamento_status: "aberto",
        p_resultados_offset: 25,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 0,
      }),
    );
  });
  it("busca aplicada zera resultados e apontamentos; digitação não chama RPC", async () => {
    await montar();
    const n = lidas().length;
    fireEvent.change(screen.getByLabelText(/^Buscar requisito$/), { target: { value: "folha" } });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(lidas().length).toBe(n);
    fireEvent.click(screen.getByRole("button", { name: /^Aplicar busca$/ }));
    await waitFor(() =>
      expect(ultimaLeitura()).toMatchObject({
        p_busca: "folha",
        p_resultados_offset: 0,
        p_execucoes_offset: 10,
        p_apontamentos_offset: 0,
      }),
    );
  });
});

describe("V1-16 troca de recurso A → B", () => {
  it("B começa com offsets 0, filtros limpos, sem DOM de A", async () => {
    rpcLeitura((a) => ({
      data: {
        ...leitura({ id: a["p_id_competencia"] as string, resTotal: 60 }),
        resultados_paginacao: { offset: a["p_resultados_offset"], limite: 25, total: 60 },
      },
      error: null,
    }));
    const { rerender } = render(<CompetenciaAnalise id={ID} />);
    await pronto();
    fireEvent.change(screen.getByLabelText(/^Criticidade$/), { target: { value: "alta" } });
    fireEvent.click(screen.getByRole("button", { name: /Próxima página de resultados/ }));
    await waitFor(() => expect(ultimaLeitura()).toMatchObject({ p_resultados_offset: 25 }));
    let primeiroCommitB: string | null = null;
    function Sonda() {
      useLayoutEffect(() => {
        primeiroCommitB ??= document.body.textContent;
      });
      return null;
    }
    m.getUser.mockImplementation(() => new Promise(() => {}));
    rerender(
      <>
        <CompetenciaAnalise id={ID_B} />
        <Sonda />
      </>,
    );
    expect(primeiroCommitB).not.toContain("Folha de pagamento do mês");
    sessao();
    rerender(<CompetenciaAnalise id={ID} />);
    rerender(<CompetenciaAnalise id={ID_B} />);
    await waitFor(() =>
      expect(
        lidas().some((c) => (c[1] as Record<string, unknown>)["p_id_competencia"] === ID_B),
      ).toBe(true),
    );
    const b = lidas().filter(
      (c) => (c[1] as Record<string, unknown>)["p_id_competencia"] === ID_B,
    )[0]![1];
    expect(b).toMatchObject({ p_resultados_offset: 0, p_filtro_criticidade: null });
    expect((screen.getByLabelText(/^Criticidade$/) as HTMLSelectElement).value).toBe("");
  });

  it("resposta tardia de A não sobrescreve B", async () => {
    let soltarA: ((v: unknown) => void) | null = null;
    rpcLeitura((a) =>
      a["p_id_competencia"] === ID
        ? new Promise((r) => (soltarA = r))
        : { data: leitura({ id: ID_B, ref: "2026-04-01" }), error: null },
    );
    const { rerender } = render(<CompetenciaAnalise id={ID} />);
    await waitFor(() => expect(soltarA).not.toBeNull());
    rerender(<CompetenciaAnalise id={ID_B} />);
    expect(await screen.findByText(/Competência 04\/2026/)).toBeInTheDocument();
    await act(async () => {
      soltarA!({ data: leitura({ id: ID, ref: "2026-03-01" }), error: null });
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(screen.queryByText(/Competência 03\/2026/)).toBeNull();
    expect(screen.getByText(/Competência 04\/2026/)).toBeInTheDocument();
  });

  it("A → inválida → B: B autentica e lê normalmente", async () => {
    const { rerender } = render(<CompetenciaAnalise id={ID} />);
    await pronto();
    rerender(<CompetenciaAnalise id="abc" />);
    await screen.findByText(/Competência não encontrada/);
    const u = m.getUser.mock.calls.length;
    rerender(<CompetenciaAnalise id={ID_B} />);
    await pronto();
    expect(m.getUser.mock.calls.length).toBe(u + 1);
    expect(ultimaLeitura()["p_id_competencia"]).toBe(ID_B);
  });
});

describe("V1-16 ações", () => {
  it("allowed false: sem botões executáveis, texto de bloqueio", async () => {
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(screen.queryByRole("button", { name: /^Executar análise$/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Reanalisar$/ })).toBeNull();
    expect(screen.getByText(/Executar análise: indisponível/)).toBeInTheDocument();
    expect(screen.getByText(/Reanalisar: indisponível/)).toBeInTheDocument();
  });

  it("Executar análise → completa; duplo clique = 1 chamada; refetch", async () => {
    let soltar: ((v: unknown) => void) | null = null;
    m.rpc.mockImplementation((nome: string) =>
      nome === LER
        ? { data: leitura({ estado: "not_analyzed", exec: null, executar: true }), error: null }
        : new Promise((r) => (soltar = r)),
    );
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const b = screen.getByRole("button", { name: /^Executar análise$/ });
    fireEvent.click(b);
    fireEvent.click(b);
    await waitFor(() => expect(soltar).not.toBeNull());
    expect(solicitacoes()).toHaveLength(1);
    expect(solicitacoes()[0]![1]).toEqual({ p_id_competencia: ID, p_tipo: "completa" });
    const n = lidas().length;
    await act(async () => {
      soltar!({ data: EXEC2, error: null });
    });
    await waitFor(() => expect(lidas().length).toBe(n + 1));
  });

  it("Reanalisar → reanálise; nunca chama incremental", async () => {
    rpcLeitura(() => ({ data: leitura({ reanalisar: true }), error: null }));
    m.rpc.mockImplementation((nome: string) =>
      nome === LER
        ? { data: leitura({ reanalisar: true }), error: null }
        : { data: EXEC, error: null },
    );
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /^Reanalisar$/ }));
    await waitFor(() => expect(solicitacoes()).toHaveLength(1));
    expect(solicitacoes()[0]![1]).toEqual({ p_id_competencia: ID, p_tipo: "reanálise" });
    expect(m.rpc.mock.calls.some((c) => c[0] === "solicitar_reanalise_requisitos")).toBe(false);
  });

  it("erro ambíguo + leitura com queued → reconciliada, sem erro, sem 2ª escrita", async () => {
    let n = 0;
    m.rpc.mockImplementation((nome: string) => {
      if (nome === SOL) return { data: null, error: { code: "57014", message: "timeout raw" } };
      n += 1;
      return n === 1
        ? { data: leitura({ executar: true, estado: "failed" }), error: null }
        : { data: leitura({ estado: "queued", exec: EXEC2 }), error: null };
    });
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /^Executar análise$/ }));
    expect(await screen.findByText(/Solicitação registrada/)).toBeInTheDocument();
    expect(screen.queryByText(/Não foi possível solicitar/)).toBeNull();
    expect(document.body.textContent).not.toMatch(/timeout raw/);
    expect(solicitacoes()).toHaveLength(1);
  });

  it("erro ambíguo + leitura sem nova execução → mensagem sanitizada", async () => {
    m.rpc.mockImplementation((nome: string) =>
      nome === SOL
        ? { data: null, error: { code: "XX000", message: "raw pg" } }
        : { data: leitura({ executar: true, estado: "failed" }), error: null },
    );
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /^Executar análise$/ }));
    expect(await screen.findByText(/Não foi possível solicitar a análise/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/raw pg/);
    expect(solicitacoes()).toHaveLength(1);
  });

  it("erro ambíguo + leitura de reconciliação falha → mensagem sanitizada", async () => {
    let n = 0;
    m.rpc.mockImplementation((nome: string) => {
      if (nome === SOL) return Promise.reject(new Error("network"));
      n += 1;
      return n === 1
        ? { data: leitura({ executar: true, estado: "failed" }), error: null }
        : { data: null, error: { code: "XX000", message: "x" } };
    });
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /^Executar análise$/ }));
    expect(await screen.findByText(/Não foi possível solicitar a análise/)).toBeInTheDocument();
    expect(solicitacoes()).toHaveLength(1);
  });

  it("Abrir requisito allowed=true → botão abre drawer V1-17 com o id do requisito", async () => {
    const REQ = "66666666-6666-4666-8666-666666666666";
    rpcLeitura(() => ({
      data: leitura({ resultados: [{ ...resultado(), id_requisito: REQ }] }),
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const tabela = screen.getByRole("table", { name: /Requisitos analisados/ });
    expect(within(tabela).queryByText(/Em breve/)).toBeNull();
    const b = within(tabela).getByRole("button", { name: /Abrir requisito/ });
    expect(b.getAttribute("href")).toBeNull();
    fireEvent.click(b);
    expect(await screen.findByRole("dialog", { name: /Detalhe do requisito/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(m.rpc.mock.calls.some((c) => c[0] === "obter_detalhe_requisito_v117")).toBe(true),
    );
    const det = m.rpc.mock.calls.find((c) => c[0] === "obter_detalhe_requisito_v117")!;
    expect(det[1]).toMatchObject({ p_id_competencia: ID, p_id_requisito: REQ });
    expect(m.nav).not.toHaveBeenCalled();
  });

  it("Abrir requisito allowed=false → apenas Indisponível", async () => {
    rpcLeitura(() => ({ data: leitura({ abrir: false }), error: null }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    const tabela = screen.getByRole("table", { name: /Requisitos analisados/ });
    expect(within(tabela).queryByText(/Em breve/)).toBeNull();
    expect(within(tabela).getByText(/Indisponível/)).toBeInTheDocument();
  });
});

describe("V1-16 polling", () => {
  it.each(["queued", "processing"])("%s: backoff 5s → 10s e para em complete", async (estado) => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let n = 0;
    rpcLeitura(() => {
      n += 1;
      return { data: leitura({ estado: n < 3 ? estado : "complete" }), error: null };
    });
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(lidas()).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4900);
    });
    expect(lidas()).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(lidas()).toHaveLength(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(lidas()).toHaveLength(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(lidas()).toHaveLength(3);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120000);
    });
    expect(lidas()).toHaveLength(3);
  });

  it.each(["failed", "complete", "stale", "not_analyzed"])("%s: sem polling", async (estado) => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    rpcLeitura(() => ({
      data: leitura({ estado, exec: estado === "not_analyzed" ? null : EXEC }),
      error: null,
    }));
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120000);
    });
    expect(lidas()).toHaveLength(1);
  });

  it("unmount para polling", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    rpcLeitura(() => ({ data: leitura({ estado: "processing" }), error: null }));
    const { unmount } = render(<CompetenciaAnalise id={ID} />);
    await pronto();
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120000);
    });
    expect(lidas()).toHaveLength(1);
  });

  it("troca de id para polling de A", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    rpcLeitura((a) => ({
      data: leitura({
        id: a["p_id_competencia"] as string,
        estado: a["p_id_competencia"] === ID ? "processing" : "complete",
      }),
      error: null,
    }));
    const { rerender } = render(<CompetenciaAnalise id={ID} />);
    await pronto();
    rerender(<CompetenciaAnalise id={ID_B} />);
    await pronto();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120000);
    });
    expect(
      lidas().filter((c) => (c[1] as Record<string, unknown>)["p_id_competencia"] === ID),
    ).toHaveLength(1);
  });
});

describe("V1-16 acessibilidade", () => {
  it("H1 único e labels nos filtros", async () => {
    render(<CompetenciaAnalise id={ID} />);
    await pronto();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const l of [
      /^Resultado$/,
      /^Criticidade$/,
      /^Mecanismo$/,
      /^Status do apontamento$/,
      /^Buscar requisito$/,
    ])
      expect(screen.getByLabelText(l)).toBeInTheDocument();
  });
});

describe("V1-16 scan estático", () => {
  const fontes = [
    "src/components/competencias/CompetenciaAnalise.tsx",
    "src/lib/competencias/competenciaAnaliseDados.ts",
    "src/routes/competencias_.$id_.analise.tsx",
  ].map((f) => readFileSync(f, "utf8"));
  it.each([
    [
      "comparação de hash/stale local",
      /hash_entrada\s*[!=]==?|hash_contexto_atual\s*[!=]==?|contexto_atual\s*\?/,
    ],
    ["fórmula de percentual", /conformes_ou_na_validos\s*\/|\/\s*total|\*\s*100/],
    ["liberação local", /percentual\s*(>=|===?|>)\s*100/],
    ["REST/fetch manual", /\bfetch\(|\/rest\/v1/],
    ["segredos", /service_role|sb_secret|SUPABASE_SERVICE/],
    ["getPublicUrl", /getPublicUrl/],
    ["dangerouslySetInnerHTML", /dangerouslySetInnerHTML/],
    ["mutação direta", /\.from\([^)]*\)\s*\.(insert|update|upsert|delete)/],
    ["incremental fora do escopo", /solicitar_reanalise_requisitos/],
    ["constante de backoff duplicada", /\[\s*5000\s*,\s*10000/],
  ])("sem %s", (_n, re) => {
    for (const f of fontes) expect(f).not.toMatch(re);
  });
  it("reutiliza atrasoPolling V1-10", () => {
    expect(fontes[0]).toMatch(/atrasoPolling[\s\S]*from "@\/lib\/contratos\/documentosDados"/);
  });
});

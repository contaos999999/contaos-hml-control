import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  navigate: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  query: vi.fn(),
  writes: [] as Array<{ name: string; args: unknown }>,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser },
    rpc: (name: string, args: unknown) => {
      const p = () => {
        m.writes.push({ name, args });
        return m.rpc(name, args);
      };
      return { abortSignal: () => p(), then: (ok: (v: unknown) => void, err: (e: unknown) => void) => Promise.resolve(p()).then(ok, err) };
    },
    from: (name: string) => {
      m.from(name);
      type Query = {
        select: () => Query;
        eq: () => Query;
        order: () => Query;
        range: () => Query;
        abortSignal: () => Promise<unknown>;
      };
      const query: Query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        range: () => query,
        abortSignal: () => m.query(),
      };
      return query;
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.navigate,
  createFileRoute: (path: string) => (options: unknown) => ({
    path,
    options,
    useParams: () => ({ id: "44444444-4444-4444-8444-444444444444" }),
  }),
  Link: ({ children, to, params, ...props }: {
    children: ReactNode;
    to: string;
    params?: { id?: string };
  }) => <a href={params?.id ? to.replace("$id", params.id) : to} {...props}>{children}</a>,
}));

import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { CompetenciaParecer } from "@/components/competencias/CompetenciaParecer";
import { Route } from "@/routes/competencias_.$id_.parecer";
import {
  PAGINA_PARECERES,
  ErroParecer,
  classificarErroParecer,
  parseParecerInterno,
  solicitarParecer,
  decidirParecer,
} from "@/lib/competencias/parecerInternoDados";

const ID = "44444444-4444-4444-8444-444444444444";
const C = "11111111-1111-4111-8111-111111111111";
const P = "22222222-2222-4222-8222-222222222222";
const U = "usuario-v118";
const ORG = "org-A";

const visao = (abrir = true) => ({
  competencia: {
    id: ID, id_contrato: C, id_organizacao: ORG, competencia_referencia: "2026-03-01",
    periodo_inicio: "2026-03-01", periodo_fim: "2026-03-31", data_limite: null,
    situacao: "em_analise", percentual_conformidade: 95, versao_pacote_atual: 1,
    versao_registro: 2, atualizado_em: "2026-03-10T12:00:00Z",
  },
  portao: { liberado: false, total: 10, conformes_ou_na_validos: 8, pendentes: 2,
    nao_conformes: 0, inconclusivos: 0, em_analise: 0,
    nao_conformidades_bloqueantes: 0, percentual: 80 },
  blocking_summary: { pendentes: 2, nao_conformes: 0, inconclusivos: 0, em_analise: 0,
    nao_conformidades_bloqueantes: 0, parecer_aprovado: false,
    analise_concluida_atual: false, aprovacao_apresentacao_atual: false },
  allowed_actions: { abrir_documentos: true, analisar: true, abrir_parecer: abrir, apresentar: false },
});
const linha = (alteracoes: Record<string, unknown> = {}) => ({
  id: P, id_competencia: ID, id_organizacao: ORG, id_contrato: C,
  autor: "Auditor A", texto: "Parecer de análise.", status: "pendente",
  versao: 1, hash: "f".repeat(64), criado_em: "2026-03-10T12:00:00Z",
  aprovado_por: null, aprovado_em: null, ...alteracoes,
});
const ok = (data: unknown) => ({ data, error: null, status: 200 });

beforeEach(() => {
  vi.clearAllMocks();
  m.writes.length = 0;
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.rpc.mockImplementation((name: string) => name === "obter_visao_geral_competencia"
    ? ok(visao()) : ok(P));
  m.query.mockResolvedValue({ data: [linha()], count: 1, error: null, status: 200 });
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, ORG);
});

describe("PROMPT 39 — contrato e fail closed", () => {
  it("somente UUID válido pode gerar acesso; tela inválida tem zero Auth/SQL/RPC", async () => {
    render(<CompetenciaParecer id="invalido" />);
    expect(await screen.findByText(/Competência não encontrada/i)).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.from).not.toHaveBeenCalled();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("sem sessão redireciona e não consulta documentos", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    render(<CompetenciaParecer id={ID} />);
    await waitFor(() => expect(m.navigate).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.from).not.toHaveBeenCalled();
  });
  it("acesso negado por RPC não vira lista vazia", async () => {
    m.rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "SEGREDO" }, status: 403 });
    render(<CompetenciaParecer id={ID} />);
    expect(await screen.findByText(/não tem acesso/i)).toBeInTheDocument();
    expect(screen.queryByText("SEGREDO")).toBeNull();
    expect(m.from).not.toHaveBeenCalled();
  });
  it("allowed_actions.abrir_parecer=false não consulta tabela nem habilita mutação", async () => {
    m.rpc.mockResolvedValue(ok(visao(false)));
    render(<CompetenciaParecer id={ID} />);
    expect(await screen.findByText(/não está disponível/i)).toBeInTheDocument();
    expect(m.from).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Solicitar parecer/i })).toBeNull();
  });
  it("parser rejeita dados de outro tenant, outra competência, texto inválido e versão inválida", () => {
    expect(parseParecerInterno(linha(), ID, ORG, C)).not.toBeNull();
    expect(parseParecerInterno(linha({ id_organizacao: "org-B" }), ID, ORG, C)).toBeNull();
    expect(parseParecerInterno(linha({ id_competencia: C }), ID, ORG, C)).toBeNull();
    expect(parseParecerInterno(linha({ texto: null }), ID, ORG, C)).toBeNull();
    expect(parseParecerInterno(linha({ versao: 0 }), ID, ORG, C)).toBeNull();
    expect(PAGINA_PARECERES).toBe(25);
  });
  it("classifica 401/403, 409 e transportes sem vazar erros técnicos", () => {
    expect(classificarErroParecer({ code: "42501" }, 400)).toBe("sem_permissao");
    expect(classificarErroParecer({ code: "PT409" }, 400)).toBe("conflito");
    expect(classificarErroParecer({}, 500)).toBe("erro");
  });
  it("não repete automaticamente solicitações de parecer e só chama RPC autorizada", async () => {
    m.rpc.mockResolvedValue(ok(P));
    await expect(solicitarParecer(ID)).resolves.toBe(P);
    expect(m.writes).toEqual([{ name: "solicitar_parecer_interno", args: { p_id_competencia: ID } }]);
  });
  it("aprovação só via RPC; rejeição exige fundamento", async () => {
    await expect(decidirParecer(P, false, "")).rejects.toBeInstanceOf(ErroParecer);
    expect(m.writes).toHaveLength(0);
    m.rpc.mockResolvedValue(ok(null));
    await expect(decidirParecer(P, false, "Evidência insuficiente")).resolves.toBeUndefined();
    expect(m.writes).toEqual([{ name: "aprovar_parecer_interno",
      args: { p_id_parecer: P, p_aprovar: false, p_fundamento: "Evidência insuficiente" } }]);
  });
  it("rota protegida noindex, sem SSR, PT-BR", () => {
    const r = Route as unknown as { path: string; options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } } };
    expect(r.path).toBe("/competencias_/$id_/parecer");
    expect(r.options.ssr).toBe(false);
    expect(r.options.head().meta.some((x) => x["name"] === "robots" && x["content"] === "noindex")).toBe(true);
  });
  it("renderiza parecer e histórico RLS sem liberar portão local", async () => {
    render(<CompetenciaParecer id={ID} />);
    expect(await screen.findByText("Parecer de análise.")).toBeInTheDocument();
    expect(m.from).toHaveBeenCalledWith("pareceres_internos");
    expect(screen.getByText(/Versão 1/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Apta para apresentação/);
  });
  it("erro SQL não vira vazio nem expõe detalhes", async () => {
    m.query.mockResolvedValue({ data: null, count: null, error: { code: "42501", message: "SEGREDO" }, status: 403 });
    render(<CompetenciaParecer id={ID} />);
    expect(await screen.findByText(/não tem acesso/i)).toBeInTheDocument();
    expect(screen.queryByText("SEGREDO")).toBeNull();
  });
  it("solicitar parecer: um clique = uma RPC, resposta reconciliada por leitura", async () => {
    m.query.mockResolvedValue({ data: [], count: 0, error: null, status: 200 });
    render(<CompetenciaParecer id={ID} />);
    const btn = await screen.findByRole("button", { name: /Solicitar parecer/i });
    fireEvent.click(btn);
    await waitFor(() => expect(m.writes.filter((v) => v.name === "solicitar_parecer_interno")).toHaveLength(1));
    await waitFor(() => expect(m.query).toHaveBeenCalledTimes(2));
  });
});

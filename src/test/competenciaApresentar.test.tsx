import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  navigate: vi.fn(),
  rpc: vi.fn(),
  chamadas: [] as Array<{ nome: string; args: unknown }>,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: m.getUser },
    rpc: (nome: string, args: unknown) => {
      m.chamadas.push({ nome, args });
      if (nome === "obter_visao_geral_competencia")
        return { abortSignal: (_signal: AbortSignal) => m.rpc(nome, args) };
      return m.rpc(nome, args);
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => m.navigate,
  createFileRoute: (path: string) => (options: unknown) => ({
    path, options, useParams: () => ({ id: "44444444-4444-4444-8444-444444444444" }),
  }),
  Link: ({ children, to, params, ...rest }: {
    children: ReactNode;
    to: string;
    params?: { id?: string };
  }) => <a href={params?.id ? to.replace("$id", params.id) : to} {...rest}>{children}</a>,
}));

import { CompetenciaApresentar } from "@/components/competencias/CompetenciaApresentar";
import { Route } from "@/routes/competencias_.$id_.apresentar";
import {
  aprovarApresentacao,
  registrarApresentacao,
  classificarErroApresentacao,
  criarChaveIdempotencia,
  ErroApresentacao,
} from "@/lib/competencias/apresentacaoDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const ID = "44444444-4444-4444-8444-444444444444";
const APROV = "33333333-3333-4333-8333-333333333333";
const REG = "22222222-2222-4222-8222-222222222222";
const CONTRATO = "11111111-1111-4111-8111-111111111111";
const U = "usuario-v119";
const ORG = "org-A";
const ok = (data: unknown) => ({ data, error: null, status: 200 });
function visao(situacao = "em_analise", apresentar = true) {
  return {
    competencia: {
      id: ID, id_contrato: CONTRATO, id_organizacao: ORG,
      competencia_referencia: "2026-03-01", periodo_inicio: "2026-03-01",
      periodo_fim: "2026-03-31", data_limite: null, situacao,
      percentual_conformidade: 100, versao_pacote_atual: 1,
      versao_registro: 2, atualizado_em: "2026-03-10T12:00:00Z",
    },
    portao: {
      liberado: true, total: 10, avaliados: 10, pendentes: 0,
      nao_conformes: 0, inconclusivos: 0, em_analise: 0,
      nao_conformidades_bloqueantes: 0, percentual: 100,
    },
    blocking_summary: {
      pendentes: 0, nao_conformes: 0, inconclusivos: 0, em_analise: 0,
      nao_conformidades_bloqueantes: 0, parecer_aprovado: true,
      analise_concluida_atual: true, aprovacao_apresentacao_atual: situacao === "pode_apresentar_contratante",
    },
    allowed_actions: {
      abrir_documentos: true, analisar: true, abrir_parecer: true, apresentar,
    },
  };
}
beforeEach(() => {
  m.getUser.mockReset().mockResolvedValue({ data: { user: { id: U } }, error: null });
  m.navigate.mockReset();
  m.rpc.mockReset().mockImplementation((nome: string) =>
    Promise.resolve(ok(nome === "obter_visao_geral_competencia" ? visao() : null)),
  );
  m.chamadas.length = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();
  definirPreferenciaOrganizacao(U, ORG);
});

describe("V1-19 — adapter Supabase oficial", () => {
  it("exige UUID correto antes de qualquer mutação", async () => {
    await expect(aprovarApresentacao("invalido", "")).rejects.toBeInstanceOf(ErroApresentacao);
    await expect(registrarApresentacao("invalido", "chave", "", "")).rejects.toBeInstanceOf(ErroApresentacao);
    expect(m.chamadas).toHaveLength(0);
  });
  it("aprova somente por RPC e valida retorno autoritativo", async () => {
    m.rpc.mockResolvedValue(ok({
      id_aprovacao: APROV, situacao: "pode_apresentar_contratante", percentual_conformidade: 100,
    }));
    await expect(aprovarApresentacao(ID, "Fundamento")).resolves.toEqual({ id_aprovacao: APROV });
    expect(m.chamadas).toEqual([{
      nome: "aprovar_apresentacao", args: { p_id_competencia: ID, p_fundamento: "Fundamento" },
    }]);
  });
  it("rejeita resultado de aprovação com formato inesperado", async () => {
    m.rpc.mockResolvedValue(ok({ situacao: "pode_apresentar_contratante" }));
    await expect(aprovarApresentacao(ID, "")).rejects.toBeInstanceOf(ErroApresentacao);
  });
  it("registra somente por RPC e chave estável fornecida", async () => {
    m.rpc.mockResolvedValue(ok(REG));
    const key = "c0d570a1-bbbb-4ccc-8ddd-777777777777";
    await expect(registrarApresentacao(ID, key, "PROTO-01", "Sistema eletrônico")).resolves.toBe(REG);
    expect(m.chamadas).toEqual([{
      nome: "registrar_apresentacao", args: {
        p_id_competencia: ID, p_idempotency_key: key, p_protocolo: "PROTO-01",
        p_forma_apresentacao: "Sistema eletrônico",
      },
    }]);
  });
  it("classifica 401/403/42501, conflito 409 e mensagem técnica sem vazar detalhes", () => {
    expect(classificarErroApresentacao({ code: "42501" }, 400)).toBe("sem_permissao");
    expect(classificarErroApresentacao({}, 403)).toBe("sem_permissao");
    expect(classificarErroApresentacao({ code: "23505" }, 400)).toBe("conflito");
    expect(classificarErroApresentacao({}, 409)).toBe("conflito");
    expect(classificarErroApresentacao({ message: "SEGREDO" }, 500)).toBe("erro");
  });
  it("chave de intenção é UUID criptográfico, não Math.random", () => {
    const chave = criarChaveIdempotencia();
    expect(chave).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  });
});

describe("V1-19 — wizard de apresentação", () => {
  it("rota privada com metadados e marca institucional", () => {
    const route = Route as unknown as {
      path: string;
      options: { ssr: boolean; head: () => { meta: Array<Record<string, string>> } };
    };
    expect(route.path).toBe("/competencias_/$id_/apresentar");
    expect(route.options.ssr).toBe(false);
    expect(route.options.head().meta.some(x => x.title?.includes("Apresentação"))).toBe(true);
  });
  it("UUID inválido não dispara Auth nem RPC", async () => {
    render(<CompetenciaApresentar id="inválido" />);
    expect(await screen.findByText(/Competência não encontrada/i)).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.chamadas).toHaveLength(0);
  });
  it("sem sessão redireciona para login", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    render(<CompetenciaApresentar id={ID} />);
    await waitFor(() => expect(m.navigate).toHaveBeenCalledWith({ to: "/login", replace: true }));
    expect(m.chamadas).toHaveLength(0);
  });
  it("o backend pode bloquear mesmo com 100%, sem botões de mutação", async () => {
    m.rpc.mockResolvedValue(ok(visao("pode_apresentar_contratante", false)));
    render(<CompetenciaApresentar id={ID} />);
    expect(await screen.findByText(/Ação não autorizada pelo backend/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Registrar apresentação|Aprovar apresentação/ })).toBeNull();
  });
  it("apresentação liberada pelo backend exibe confirmação, não registro automático", async () => {
    m.rpc.mockResolvedValue(ok(visao("pode_apresentar_contratante", true)));
    render(<CompetenciaApresentar id={ID} />);
    const registrar = await screen.findByRole("button", { name: "Registrar apresentação" });
    expect(m.chamadas.map(x => x.nome)).toEqual(["obter_visao_geral_competencia"]);
    fireEvent.click(registrar);
    expect(await screen.findByText(/Confirmar envio ao contratante/)).toBeInTheDocument();
    expect(m.chamadas.map(x => x.nome)).toEqual(["obter_visao_geral_competencia"]);
  });
  it("nenhum UPDATE direto, status fictício ou credencial no frontend", () => {
    const src = [
      readFileSync("src/lib/competencias/apresentacaoDados.ts", "utf8"),
      readFileSync("src/components/competencias/CompetenciaApresentar.tsx", "utf8"),
    ].join("\n");
    expect(src).not.toMatch(/\.(insert|update|upsert|delete)\(/);
    expect(src).not.toMatch(/===\s*100|>=\s*100/);
    expect(src).not.toMatch(/service_role|VITE_SUPABASE_SERVICE_ROLE_KEY/);
    expect(src).not.toMatch(/Apta para apresentação/i);
  });
});

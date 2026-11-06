import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MatrizPermissoes } from "@/components/administracao/usuarios/MatrizPermissoes";
import { ErroRbac, atualizarMatrizRbac, obterMatrizRbac } from "@/lib/administracao/rbacRpc";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc, auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) } },
}));

const PERFIS = ["administrador", "auditor", "contabilidade", "direcao_aprovador", "financeiro", "gestor_contrato", "juridico_conformidade", "leitor", "prestacao_contas", "rh_dp"];
const ACOES = Array.from({ length: 48 }, (_, i) => ({ recurso: i === 0 ? "arquivos" : `recurso${i}`, acao: i === 0 ? "criar" : `acao${i}` }));
const linha = (perfil: string, recurso: string, acao: string, permitido = false) => ({ perfil, recurso, acao, permitido });
const MATRIZ = () => ({
  schema_versao: "rbac-v1",
  versao: 5,
  permissoes: PERFIS.flatMap((p) => ACOES.map(({ recurso, acao }) => linha(p, recurso, acao))),
});
const ok = (data: unknown) => ({ data, error: null, status: 200 });
const denied = (code = "42501", status = 403) => ({ data: null, error: { code, message: "internal" }, status });
const montar = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MatrizPermissoes idUsuario="master-1" org="org-a" />
  </QueryClientProvider>,
);

beforeEach(() => { mocks.rpc.mockReset().mockResolvedValue(ok(MATRIZ())); });

describe("P0 V1 matriz RBAC — contratos reais de RPC", () => {
  it("consulta contrato rbac-v1 com 480 entradas exclusivas", async () => {
    const data = await obterMatrizRbac();
    expect(data.permissoes).toHaveLength(480);
    expect(data.versao).toBe(5);
    expect(mocks.rpc).toHaveBeenCalledWith("obter_matriz_rbac_master", {});
  });

  it("não revela matriz quando a autoridade retorna 42501", async () => {
    mocks.rpc.mockResolvedValue(denied());
    await expect(obterMatrizRbac()).rejects.toMatchObject({ tipo: "negado" });
  });

  it("nega respostas incompletas, duplicadas, com permissão não booleana ou schema errado", async () => {
    const base = MATRIZ();
    for (const errado of [
      { ...base, permissoes: base.permissoes.slice(0, 479) },
      { ...base, permissoes: [...base.permissoes.slice(0, 479), base.permissoes[0]] },
      { ...base, permissoes: base.permissoes.map((p, i) => i ? p : { ...p, permitido: "true" }) },
      { ...base, schema_versao: "rbac-v2" },
    ]) {
      mocks.rpc.mockResolvedValueOnce(ok(errado));
      await expect(obterMatrizRbac()).rejects.toBeInstanceOf(ErroRbac);
    }
  });

  it("edita somente delta com versão esperada e request UUID preservado", async () => {
    const req = "00000000-0000-4000-8000-000000000001";
    mocks.rpc.mockResolvedValue(ok({ schema_versao: "rbac-v1", versao: 6, request_id: req, evento_id: "00000000-0000-4000-8000-000000000002" }));
    const changes = [linha("administrador", "arquivos", "criar", true)];
    await atualizarMatrizRbac(5, req, changes);
    expect(mocks.rpc).toHaveBeenCalledWith("atualizar_matriz_rbac_master", {
      p_versao_esperada: 5, p_request_id: req, p_alteracoes: changes,
    });
  });

  it("conflito de versão PT409 nunca é convertido em sucesso", async () => {
    mocks.rpc.mockResolvedValue(denied("PT409", 409));
    await expect(atualizarMatrizRbac(5, "00000000-0000-4000-8000-000000000001", [linha("leitor", "arquivos", "criar")])).rejects.toMatchObject({ tipo: "conflito" });
  });
});

describe("P0 V1 matriz RBAC — interface MASTER", () => {
  it("oculta a matriz sem autorização do backend", async () => {
    mocks.rpc.mockResolvedValue(denied());
    montar();
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalled());
    expect(screen.queryByRole("heading", { name: "Matriz de permissões" })).not.toBeInTheDocument();
  });

  it("MASTER consulta, escolhe perfil, altera checkbox e grava delta explícito", async () => {
    let versao = 5;
    const matrix = MATRIZ();
    mocks.rpc.mockImplementation(async (name: string, args: Record<string, unknown>) => {
      if (name === "obter_matriz_rbac_master") return ok({ ...matrix, versao });
      if (name === "atualizar_matriz_rbac_master") {
        expect(args.p_versao_esperada).toBe(5);
        expect(args.p_alteracoes).toEqual([linha("administrador", "arquivos", "criar", true)]);
        versao++;
        return ok({ schema_versao: "rbac-v1", versao, request_id: args.p_request_id, evento_id: "00000000-0000-4000-8000-000000000002" });
      }
      return denied();
    });
    montar();
    await screen.findByRole("heading", { name: "Matriz de permissões" });
    fireEvent.change(screen.getByRole("combobox", { name: "Perfil" }), { target: { value: "administrador" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "administrador arquivos criar" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(mocks.rpc.mock.calls.filter((c) => c[0] === "atualizar_matriz_rbac_master")).toHaveLength(1));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

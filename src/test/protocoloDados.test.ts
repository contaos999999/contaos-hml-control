import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  from: vi.fn(),
  calls: [] as [string, ...unknown[]][],
  result: { data: [] as unknown[], count: 0, error: null as unknown, status: 200 },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mock.from } }));
import * as dados from "@/lib/competencias/protocoloDados";
const C = "44444444-4444-4444-8444-444444444444",
  O = "11111111-1111-4111-8111-111111111111",
  K = "22222222-2222-4222-8222-222222222222",
  A = "33333333-3333-4333-8333-333333333333",
  P = "55555555-5555-4555-8555-555555555555";
const row = () => ({
  id: A,
  id_competencia: C,
  id_contrato: K,
  id_organizacao: O,
  id_pacote: P,
  protocolo: null,
  forma_apresentacao: null,
  apresentado_em: "2026-11-11T12:00:00Z",
  tipo: "original",
  numero_rodada: 1,
});
beforeEach(() => {
  mock.calls = [];
  mock.result = { data: [row()], count: 1, error: null, status: 200 };
  mock.from.mockReset();
  mock.from.mockImplementation((table: string) => {
    mock.calls.push(["from", table]);
    const chain: Record<string, unknown> = {};
    for (const name of ["select", "eq", "order", "range"])
      chain[name] = (...args: unknown[]) => {
        mock.calls.push([name, ...args]);
        return chain;
      };
    chain["abortSignal"] = (signal: AbortSignal) => {
      mock.calls.push(["abortSignal", signal]);
      return Promise.resolve(mock.result);
    };
    return chain;
  });
});
describe("lista persistente de apresentações", () => {
  const list = (...args: Parameters<typeof dados.listarApresentacoes>) =>
    dados.listarApresentacoes(...args);
  it("consulta somente leitura com três ownerships, projeção finita e ordem/paginação estáveis", async () => {
    const s = new AbortController().signal;
    expect(await list(C, O, K, 0, s)).toEqual({ itens: [row()], total: 1 });
    expect(mock.calls).toContainEqual(["from", "apresentacoes_contratante"]);
    for (const [field, value] of [
      ["id_competencia", C],
      ["id_organizacao", O],
      ["id_contrato", K],
    ])
      expect(mock.calls).toContainEqual(["eq", field, value]);
    expect(mock.calls.find((c) => c[0] === "select")).toEqual([
      "select",
      "id,id_competencia,id_contrato,id_organizacao,id_pacote,protocolo,forma_apresentacao,apresentado_em,tipo,numero_rodada",
      { count: "exact" },
    ]);
    expect(mock.calls).toContainEqual(["order", "apresentado_em", { ascending: false }]);
    expect(mock.calls).toContainEqual(["order", "id", { ascending: false }]);
    expect(mock.calls).toContainEqual(["range", 0, 24]);
    expect(mock.calls).toContainEqual(["abortSignal", s]);
  });
  it.each([
    ["x", O, K, 0],
    [C, "x", K, 0],
    [C, O, "x", 0],
    [C, O, K, -1],
    [C, O, K, 1],
  ])("nega entrada inválida antes de IO %j", async (c, o, k, offset) => {
    await expect(
      list(c as string, o as string, k as string, offset as number, new AbortController().signal),
    ).rejects.toMatchObject({ tipo: "invalido" });
    expect(mock.from).not.toHaveBeenCalled();
  });
  it("lista vazia e página posterior não inventam registro", async () => {
    mock.result = { data: [], count: 0, error: null, status: 200 };
    expect(await list(C, O, K, 25, new AbortController().signal)).toEqual({ itens: [], total: 0 });
    expect(mock.calls).toContainEqual(["range", 25, 49]);
  });
  it.each([401, 403])("preserva erro de autorização %i", async (status) => {
    mock.result = { data: [], count: 0, error: { code: "42501" }, status };
    await expect(list(C, O, K, 0, new AbortController().signal)).rejects.toMatchObject({
      tipo: "sem_permissao",
    });
  });
  it.each([
    "id_competencia",
    "id_organizacao",
    "id_contrato",
    "id",
    "id_pacote",
    "apresentado_em",
    "numero_rodada",
  ])("nega resposta inválida em %s", async (field) => {
    mock.result.data = [{ ...row(), [field]: "inválido" }];
    await expect(list(C, O, K, 0, new AbortController().signal)).rejects.toMatchObject({
      tipo: "erro",
    });
  });
  it("nega duplicatas e contagem incoerente", async () => {
    mock.result.data = [row(), row()];
    mock.result.count = 2;
    await expect(list(C, O, K, 0, new AbortController().signal)).rejects.toMatchObject({
      tipo: "erro",
    });
    mock.result.data = [row()];
    mock.result.count = 0;
    await expect(list(C, O, K, 0, new AbortController().signal)).rejects.toMatchObject({
      tipo: "erro",
    });
  });
  it("sinal abortado não consulta", async () => {
    const c = new AbortController();
    c.abort();
    await expect(list(C, O, K, 0, c.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(mock.from).not.toHaveBeenCalled();
  });
  it("aborta resposta tardia antes de retornar links", async () => {
    const c = new AbortController();
    mock.from.mockImplementation(() => {
      const chain: Record<string, unknown> = {};
      for (const n of ["select", "eq", "order", "range"]) chain[n] = () => chain;
      chain["abortSignal"] = async () => {
        c.abort();
        return mock.result;
      };
      return chain;
    });
    await expect(list(C, O, K, 0, c.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});

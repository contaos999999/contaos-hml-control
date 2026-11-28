import { beforeEach, expect, it, vi } from "vitest";

const transporte = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: transporte }));

import { listarCiclosDiligencia } from "@/lib/diligencias/diligenciasDados";

const COMPETENCIA = "44444444-4444-4444-8444-444444444444";
const ORG = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const OUTRO = "55555555-5555-4555-8555-555555555555";
const CICLO = {
  id: "33333333-3333-4333-8333-333333333333",
  id_competencia: COMPETENCIA,
  id_organizacao: ORG,
  id_contrato: CONTRATO,
  numero_rodada: 1,
  status: "encerrado",
  recebido_em: "2026-11-06T13:00:00-03:00",
  prazo_resposta: "2026-11-21",
  encerrado_em: "2026-11-18T12:00:00-03:00",
  versao_registro: 2,
};
const CICLO2 = {
  ...CICLO,
  id: "66666666-6666-4666-8666-666666666666",
  numero_rodada: 2,
  status: "em_tratamento",
  encerrado_em: null,
};
const ok = (data: unknown, count: number) => ({ data, count, error: null, status: 200 });

function preparar(resposta: unknown) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockResolvedValue(resposta),
  };
  transporte.from.mockReturnValue(builder);
  return builder;
}

beforeEach(() => transporte.from.mockReset());

it("V2-01 lista ciclos autenticados por competencia contrato e organizacao", async () => {
  const query = preparar(ok([CICLO2, CICLO], 2));
  const signal = new AbortController().signal;
  await expect(listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, signal)).resolves.toEqual({
    itens: [CICLO2, CICLO],
    total: 2,
  });
  expect(transporte.from).toHaveBeenCalledExactlyOnceWith("ciclos_diligencia");
  const [colunas, opcoes] = query.select.mock.calls[0] ?? [];
  expect(colunas.split(",").sort()).toEqual(Object.keys(CICLO).sort());
  expect(opcoes).toEqual({ count: "exact" });
  expect(query.eq.mock.calls).toEqual([
    ["id_competencia", COMPETENCIA],
    ["id_organizacao", ORG],
    ["id_contrato", CONTRATO],
  ]);
  expect(query.order.mock.calls).toEqual([
    ["numero_rodada", { ascending: false }],
    ["id", { ascending: false }],
  ]);
  expect(query.range).toHaveBeenCalledExactlyOnceWith(0, 24);
  expect(query.abortSignal).toHaveBeenCalledExactlyOnceWith(signal);
});

it("V2-01 pagina no servidor e distingue vazio autorizado", async () => {
  const query = preparar(ok([CICLO], 26));
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 25, new AbortController().signal),
  ).resolves.toEqual({ itens: [CICLO], total: 26 });
  expect(query.range).toHaveBeenCalledExactlyOnceWith(25, 49);
  preparar(ok([], 0));
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, new AbortController().signal),
  ).resolves.toEqual({ itens: [], total: 0 });
});

it("V2-01 rejeita linhas cruzadas duplicadas e fora do contrato", async () => {
  const invalidos = [
    [{ ...CICLO, id_contrato: OUTRO }],
    [{ ...CICLO, id_organizacao: OUTRO }],
    [{ ...CICLO, id_competencia: OUTRO }],
    [{ ...CICLO, status: "ignorado" }],
    [{ ...CICLO, prazo_resposta: "2026-11-31" }],
    [CICLO, CICLO],
    [CICLO, CICLO2],
  ];
  for (const payload of invalidos) {
    preparar(ok(payload, payload.length));
    await expect(
      listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, new AbortController().signal),
    ).rejects.toMatchObject({ tipo: "erro" });
  }
  preparar(ok([CICLO], 9));
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, new AbortController().signal),
  ).rejects.toMatchObject({ tipo: "erro" });
});

it("V2-01 preserva a negacao de leitura e os erros de transporte", async () => {
  preparar({
    data: null,
    error: { code: "42501", message: "privado" },
    status: 403,
    count: null,
  });
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, new AbortController().signal),
  ).rejects.toMatchObject({ tipo: "sem_permissao" });
  preparar({ data: null, error: {}, status: 503, count: null });
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, new AbortController().signal),
  ).rejects.toMatchObject({ tipo: "erro" });
});

it("V2-01 nao inicia consulta com escopo pagina ou sinal invalidos", async () => {
  const ctrl = new AbortController();
  await expect(
    listarCiclosDiligencia("sem-id", ORG, CONTRATO, 0, ctrl.signal),
  ).rejects.toMatchObject({ tipo: "invalido" });
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 2, ctrl.signal),
  ).rejects.toMatchObject({ tipo: "invalido" });
  ctrl.abort();
  await expect(
    listarCiclosDiligencia(COMPETENCIA, ORG, CONTRATO, 0, ctrl.signal),
  ).rejects.toMatchObject({ name: "AbortError" });
  expect(transporte.from).not.toHaveBeenCalled();
});

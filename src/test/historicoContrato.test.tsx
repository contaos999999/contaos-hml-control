import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  calls: [] as Array<{ table: string; op: string; name?: string; value?: unknown }>,
  response: {} as Record<string, { data: unknown; count: number | null; status: number; error: unknown }>,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from(table: string) {
      const q = {
        select(_columns: string, _opts?: unknown) {
          mock.calls.push({ table, op: "select" }); return q;
        },
        eq(name: string, value: unknown) {
          mock.calls.push({ table, op: "eq", name, value }); return q;
        },
        in(name: string, value: unknown) {
          mock.calls.push({ table, op: "in", name, value }); return q;
        },
        order() { return q; },
        range(start: number, end: number) {
          mock.calls.push({ table, op: "range", value: [start, end] }); return q;
        },
        abortSignal() { return q; },
        then(accept: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
          return Promise.resolve(mock.response[table]).then(accept, reject);
        },
      };
      return q;
    },
  },
}));

import {
  ErroHistorico, classificarErroHistorico, listarRelatoriosHistoricos, listarApontamentosVinculados,
  listarPrecedentesHistoricos, listarRegrasHistoricas, PAGINA_HISTORICO,
} from "@/lib/contratos/historicoContratoDados";

const ORG = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const RELATORIO = "33333333-3333-4333-8333-333333333333";
const APONTAMENTO = "44444444-4444-4444-8444-444444444444";
const ARQUIVO = "55555555-5555-4555-8555-555555555555";
const DATA = "2026-10-01T12:00:00+00:00";
const ok = (data: unknown, count = 1) => ({ data, count, status: 200, error: null });
const rel = {
  id: RELATORIO, id_contrato: CONTRATO, id_organizacao: ORG, id_arquivo: ARQUIVO,
  numero_documento: "14", tipo: "relatorio", competencia_referencia: null, data_documento: null,
  status_processamento: "concluido", resultado_geral: null, origem_temporal: "historico", criado_em: DATA,
};
const item = {
  id: APONTAMENTO, id_contrato: CONTRATO, id_organizacao: ORG, id_relatorio: RELATORIO,
  item: "1", problema: "Ausência de evidência", severidade: "alta",
  fonte_pagina: 1, fundamento: null, criado_em: DATA,
};
const prec = {
  id: "66666666-6666-4666-8666-666666666666",
  id_contrato_origem: CONTRATO, id_organizacao: ORG, id_apontamento_historico: APONTAMENTO,
  fonte_tipo: "relatorio", titulo: "Exigência anterior", problema: "Falta documento",
  solucao: null, desfecho: null, status: "revisao", criado_em: DATA,
};
const regra = {
  id: "77777777-7777-4777-8777-777777777777", id_contrato: CONTRATO, id_organizacao: ORG,
  codigo_regra: "HIS-01", descricao: "Exigir nota", efeito: "alerta",
  situacao: "proposta", criado_em: DATA,
};
beforeEach(() => {
  mock.calls.length = 0;
  mock.response = {
    relatorios_historicos_contratante: ok([rel]),
    apontamentos_historicos: ok([item]),
    respostas_historicas: ok([{
      id: "88888888-8888-4888-8888-888888888888",
      id_apontamento: APONTAMENTO, id_contrato: CONTRATO, id_organizacao: ORG,
      texto: "Apresentado", criado_em: DATA,
    }]),
    desfechos_historicos: ok([{
      id: "99999999-9999-4999-8999-999999999999",
      id_apontamento: APONTAMENTO, id_contrato: CONTRATO, id_organizacao: ORG,
      resultado: "aceito", data: null, criado_em: DATA,
    }]),
    precedentes: ok([prec]),
    regras_preventivas: ok([regra]),
  };
});
const sig = () => new AbortController().signal;

describe("PROMPT 42 / V1-21: histórico somente leitura, escopado e paginado", () => {
  it("classifica 403 como permissão negada, nunca como vazio", async () => {
    expect(classificarErroHistorico({ code: "42501" }, 403)).toBe("negado");
    mock.response["relatorios_historicos_contratante"] = {
      data: null, count: null, error: { code: "42501" }, status: 403,
    };
    await expect(listarRelatoriosHistoricos(CONTRATO, ORG, 0, sig()))
      .rejects.toMatchObject({ tipo: "negado" });
  });
  it("rejeita IDs e offset inválidos sem enviar consultas", async () => {
    await expect(listarRelatoriosHistoricos("invalido", ORG, 0, sig()))
      .rejects.toBeInstanceOf(ErroHistorico);
    await expect(listarRelatoriosHistoricos(CONTRATO, ORG, -1, sig()))
      .rejects.toMatchObject({ tipo: "invalido" });
    expect(mock.calls).toHaveLength(0);
  });
  it("aplica filtros de tenant e contrato e pagina no servidor", async () => {
    const result = await listarRelatoriosHistoricos(CONTRATO, ORG, 25, sig());
    expect(result.total).toBe(1);
    expect(result.itens).toHaveLength(1);
    expect(mock.calls.filter(x => x.op === "eq" && x.name === "id_organizacao"))
      .toEqual([{ table: "relatorios_historicos_contratante", op: "eq", name: "id_organizacao", value: ORG }]);
    expect(mock.calls.filter(x => x.op === "eq" && x.name === "id_contrato")).toHaveLength(1);
    expect(mock.calls.find(x => x.op === "range")?.value).toEqual([25, 49]);
    expect(PAGINA_HISTORICO).toBe(25);
    expect(mock.calls.every(x => ["select", "eq", "range"].includes(x.op))).toBe(true);
  });
  it("falha fechado se backend devolver registro de outra organização", async () => {
    mock.response["relatorios_historicos_contratante"] = ok([{ ...rel, id_organizacao: "outra" }]);
    await expect(listarRelatoriosHistoricos(CONTRATO, ORG, 0, sig()))
      .rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("agrega respostas e desfechos em lote por IDs da página, sem N+1", async () => {
    const r = await listarApontamentosVinculados(CONTRATO, ORG, RELATORIO, 0, sig());
    expect(r.itens).toHaveLength(1);
    expect(r.itens[0]?.respostas).toHaveLength(1);
    expect(r.itens[0]?.desfechos).toHaveLength(1);
    expect(mock.calls.filter(x => x.op === "select")).toHaveLength(3);
    const filtros = mock.calls.filter(x => x.op === "in" && x.name === "id_apontamento");
    expect(filtros).toHaveLength(2);
    expect(filtros[0]?.value).toEqual([APONTAMENTO]);
    expect(filtros[1]?.value).toEqual([APONTAMENTO]);
  });
  it("não exibe resposta de apontamento de outro contrato", async () => {
    mock.response["respostas_historicas"] = ok([{
      id: "88888888-8888-4888-8888-888888888888",
      id_apontamento: APONTAMENTO, id_contrato: "outro", id_organizacao: ORG,
      texto: "Não pode vazar", criado_em: DATA,
    }]);
    await expect(listarApontamentosVinculados(CONTRATO, ORG, RELATORIO, 0, sig()))
      .rejects.toMatchObject({ tipo: "inconsistente" });
  });
  it("traz precedentes apenas do contrato atual e regras sem promover situação", async () => {
    const p = await listarPrecedentesHistoricos(CONTRATO, ORG, 0, sig());
    const r = await listarRegrasHistoricas(CONTRATO, ORG, 0, sig());
    expect(p.itens[0]?.status).toBe("revisao");
    expect(r.itens[0]?.situacao).toBe("proposta");
    expect(mock.calls.some(x => x.name === "id_contrato_origem" && x.value === CONTRATO)).toBe(true);
    expect(mock.calls.filter(x => x.name === "id_organizacao")).toHaveLength(2);
    expect(mock.calls.some(x => !["select", "eq", "range"].includes(x.op))).toBe(false);
  });
  it("vazio real é sucesso sem resultados, não permissão negada", async () => {
    mock.response["relatorios_historicos_contratante"] = ok([], 0);
    await expect(listarRelatoriosHistoricos(CONTRATO, ORG, 0, sig()))
      .resolves.toEqual({ itens: [], total: 0, offset: 0 });
  });
});

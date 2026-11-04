import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  requests: [] as Array<{ table: string; method: string; key?: string; value?: unknown }>,
  replies: {} as Record<string, { data: unknown; error: unknown; status: number; count?: number }>,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      const q = {
        select: (_columns: string, _options?: unknown) => { m.requests.push({ table, method: "select" }); return q; },
        eq: (key: string, value: unknown) => { m.requests.push({ table, method: "eq", key, value }); return q; },
        order: () => q,
        range: () => q,
        abortSignal: () => q,
        maybeSingle: () => Promise.resolve(m.replies[table]),
        then: (resolve: (v: unknown) => void) => Promise.resolve(m.replies[table]).then(resolve),
      };
      return q;
    },
  },
}));

import { classificarErroProtocolo, consultarProtocolo, type ConsultaProtocolo } from "@/lib/competencias/protocoloDados";

const ID = "44444444-4444-4444-8444-444444444444";
const AP = "22222222-2222-4222-8222-222222222222";
const PK = "33333333-3333-4333-8333-333333333333";
const CONTRATO = "11111111-1111-4111-8111-111111111111";
const ORG = "organização-A";
const H = "a".repeat(64);
const data = "2026-11-04T13:00:00Z";
const ok = (v: unknown, count?: number) => ({ data: v, error: null, status: 200, count });
function prepara() {
  m.replies["apresentacoes_contratante"] = ok({
    id: AP, id_competencia: ID, id_contrato: CONTRATO, id_organizacao: ORG,
    id_pacote: PK, protocolo: "PROTOCOLO-1", forma_apresentacao: "Portal",
    apresentado_em: data, tipo: "apresentacao", numero_rodada: 1,
  });
  m.replies["pacotes_competencia"] = ok({
    id: PK, id_competencia: ID, id_contrato: CONTRATO, id_organizacao: ORG,
    hash_pacote: H, numero: 1, tipo: "apresentacao", status: "congelado", congelado_em: data,
  });
  m.replies["itens_pacote_competencia"] = ok([{
    id: "55555555-5555-4555-8555-555555555555",
    id_pacote: PK, id_competencia: ID, id_contrato: CONTRATO, id_organizacao: ORG,
    entidade_id: AP, entidade_tipo: "documento", versao_id: null,
    hash: H, ordem: 1,
  }], 1);
}
beforeEach(() => { m.requests.length = 0; prepara(); });

describe("PROMPT 41 — leitura oficial de protocolo e pacote congelado", () => {
  it("distingue 403 de ausência e erro de rede", () => {
    expect(classificarErroProtocolo({ code: "42501" }, 403)).toBe("sem_permissao");
    expect(classificarErroProtocolo({ code: "PGRST116" }, 404)).toBe("nao_encontrado");
    expect(classificarErroProtocolo({}, 500)).toBe("erro");
  });
  it("bloqueia UUID inválido antes de qualquer consulta", async () => {
    await expect(consultarProtocolo("invalido", AP, ORG, CONTRATO, 0, new AbortController().signal)).rejects.toMatchObject({ tipo: "invalido" });
    expect(m.requests).toHaveLength(0);
  });
  it("consulta as três tabelas exclusivamente por SELECT e escopos de tenant", async () => {
    const result: ConsultaProtocolo | null = await consultarProtocolo(ID, AP, ORG, CONTRATO, 0, new AbortController().signal);
    expect(result?.apresentacao.id).toBe(AP);
    expect(result?.pacote.hash_pacote).toBe(H);
    expect(result?.itens).toHaveLength(1);
    expect(new Set(m.requests.filter(x => x.method === "select").map(x => x.table))).toEqual(
      new Set(["apresentacoes_contratante", "pacotes_competencia", "itens_pacote_competencia"]));
    expect(m.requests.filter(x => x.method === "eq" && x.key === "id_organizacao")).toHaveLength(3);
    expect(m.requests.some(x => x.method !== "eq" && x.method !== "select")).toBe(false);
  });
  it("falha fechado com apresentação pertencente a outra organização", async () => {
    const r = m.replies["apresentacoes_contratante"]!;
    m.replies["apresentacoes_contratante"] = ok({ ...(r.data as object), id_organizacao: "outra" });
    await expect(consultarProtocolo(ID, AP, ORG, CONTRATO, 0, new AbortController().signal)).rejects.toMatchObject({ tipo: "erro" });
  });
  it("preserva negação do backend sem converter 403 em vazio", async () => {
    m.replies["pacotes_competencia"] = { data: null, error: { code: "42501" }, status: 403 };
    await expect(consultarProtocolo(ID, AP, ORG, CONTRATO, 0, new AbortController().signal)).rejects.toMatchObject({ tipo: "sem_permissao" });
  });
  it("não reconstrói snapshot se pacote ou itens forem indisponíveis", async () => {
    m.replies["pacotes_competencia"] = ok(null);
    await expect(consultarProtocolo(ID, AP, ORG, CONTRATO, 0, new AbortController().signal)).rejects.toMatchObject({ tipo: "erro" });
  });
  it("retorna vazio somente se não houver apresentação acessível", async () => {
    m.replies["apresentacoes_contratante"] = ok(null);
    await expect(consultarProtocolo(ID, AP, ORG, CONTRATO, 0, new AbortController().signal)).resolves.toBeNull();
  });
});

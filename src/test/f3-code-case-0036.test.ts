/**
 * CODE F3 C0036 — SYS01 (listar organizações) → SYS04 (seleção).
 * Exercita funções reais do frontend com RPC em fixture controlada.
 * Não atesta RLS remota nem autoriza certificação HML/PROD.
 */
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: rpcMock },
}));

import {
  listarOrganizacoesDisponiveis,
  resolverDestinoPosLogin,
} from "@/lib/auth/resolverDestinoPosLogin";

const CASE_ID = "IFV1-F3-C0036";
const ORG = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FOREIGN = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const consumer = "listar_organizacoes_disponiveis";
const observations: Record<string, unknown>[] = [];
const org = (id: string) => ({
  id,
  razao_social: "Organização fixture F3",
  nome_fantasia: null,
  cnpj: null,
  situacao: "ativa",
  perfil: "administrador_master",
});

describe("F3 CODE C0036: execução da RPC e decisão da tela SYS04", () => {
  afterEach(() => rpcMock.mockReset());

  it("positive: RPC autorizada entrega somente organização vinculada e SYS04 permite rota", async () => {
    rpcMock.mockResolvedValueOnce({ data: [org(ORG)], error: null, status: 200 });
    const result = await listarOrganizacoesDisponiveis();
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("listar_organizacoes_disponiveis");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(ORG);
    expect(result.some((item) => item.id === FOREIGN)).toBe(false);
    const destination = resolverDestinoPosLogin(result);
    expect(destination).toEqual({ tipo: "rota", rota: "/" });
    observations.push({
      caseId: CASE_ID,
      consumer,
      producerOrder: 1,
      kind: "positive",
      testId: "src/test/f3-code-case-0036.test.ts:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 200, rpc: consumer, fixture: true },
      readback: { matched: true, route: "/", linkedOrgId: ORG, foreignOrgExcluded: true },
    });
  });

  it("negative: RPC sem organizações vinculadas nunca libera seleção nem dados estrangeiros", async () => {
    rpcMock.mockResolvedValueOnce({ data: [], error: null, status: 200 });
    const result = await listarOrganizacoesDisponiveis();
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("listar_organizacoes_disponiveis");
    expect(result).toEqual([]);
    const destination = resolverDestinoPosLogin(result);
    expect(destination).toEqual({ tipo: "sem-acesso" });
    observations.push({
      caseId: CASE_ID,
      consumer,
      producerOrder: 1,
      kind: "negative",
      testId: "src/test/f3-code-case-0036.test.ts:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 200, rpc: consumer, fixture: true },
      readback: { outcome: "NO_FOREIGN_DATA", route: "sem-acesso", foreignOrgId: FOREIGN },
    });
  });

  afterAll(() => {
    // O artefato só pode ser usado quando o processo Vitest termina em 0.
    const output = process.env.F3_CODE_C0036_OBSERVATIONS;
    if (output) {
      expect(observations).toHaveLength(2);
      expect(observations.map((o) => o.kind)).toEqual(["positive", "negative"]);
      writeFileSync(output, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

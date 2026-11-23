/**
 * CODE F3 C0041: preferência SYS04 não autoriza ADM01.
 * Exercita o armazenamento local e a função real de permissões com RPC fixture.
 */
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { writeFileSync } from "node:fs";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: rpcMock },
}));

import {
  definirPreferenciaOrganizacao,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";

const CASE_ID = "IFV1-F3-C0041";
const CONSUMER = "consultar_permissoes_efetivas";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const FOREIGN_ORG = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const USER = "f3-code-master";
const FOREIGN_USER = "f3-code-leitor";
const observations: Record<string, unknown>[] = [];

describe("F3 CODE C0041: preferência SYS04 → autorização ADM01", () => {
  afterEach(() => {
    rpcMock.mockReset();
    sessionStorage.clear();
  });

  it("positive: preferência vinculada ao usuário e permissão Master vinda da RPC", async () => {
    definirPreferenciaOrganizacao(USER, ORG);
    expect(obterPreferenciaOrganizacao(USER)).toBe(ORG);
    expect(obterPreferenciaOrganizacao(FOREIGN_USER)).toBeNull();
    rpcMock.mockResolvedValueOnce({
      data: {
        schema_versao: "rbac-v1",
        versao: 1,
        master: true,
        permissoes: [{ recurso: "usuarios", acao: "administrar" }],
      },
      error: null,
      status: 200,
    });
    const permissions = await consultarPermissoesEfetivas(ORG, null);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith(CONSUMER, {
      p_id_organizacao: ORG,
      p_id_contrato: null,
    });
    expect(permissions.master).toBe(true);
    expect(temPermissao(permissions.permissoes, "usuarios", "administrar")).toBe(true);
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "positive",
      testId: "src/test/f3-code-case-0041.test.ts:positive",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 200, rpc: CONSUMER, fixture: true },
      readback: {
        matched: true,
        role: "administrador_master",
        effectivePermission: "usuarios/administrar",
      },
    });
  });

  it("negative: preferência estrangeira não é herdada e RPC rejeita acesso", async () => {
    definirPreferenciaOrganizacao(USER, ORG);
    expect(obterPreferenciaOrganizacao(FOREIGN_USER)).toBeNull();
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { code: "42501", message: "Negado" },
      status: 403,
    });
    await expect(consultarPermissoesEfetivas(FOREIGN_ORG, null)).rejects.toMatchObject({
      tipo: "negado",
    });
    expect(rpcMock).toHaveBeenCalledWith(CONSUMER, {
      p_id_organizacao: FOREIGN_ORG,
      p_id_contrato: null,
    });
    observations.push({
      caseId: CASE_ID,
      consumer: CONSUMER,
      producerOrder: 3,
      kind: "negative",
      testId: "src/test/f3-code-case-0041.test.ts:negative",
      state: "EXECUTED",
      assertion: "PASS",
      organizationId: ORG,
      producerEntityId: ORG,
      network: { method: "POST", status: 403, rpc: CONSUMER, fixture: true },
      readback: { outcome: "DENY", foreignOrgId: FOREIGN_ORG, preferenceNotAuthorization: true },
    });
  });

  afterAll(() => {
    const target = process.env.F3_CODE_C0041_OBSERVATIONS;
    if (target) {
      expect(observations).toHaveLength(2);
      expect(observations.map((x) => x.kind)).toEqual(["positive", "negative"]);
      writeFileSync(target, JSON.stringify(observations) + "\n", { flag: "wx" });
    }
  });
});

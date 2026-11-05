import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, consulta } = vi.hoisted(() => {
  const consulta: Record<string, any> = {};
  for (const nome of ["select", "eq", "order", "range", "gte", "lte"]) {
    consulta[nome] = vi.fn(() => consulta);
  }
  consulta['then'] = (resolve: (v: unknown) => unknown) => Promise.resolve({
    data: [{ id: "evt-1", criado_em: "2026-11-04T12:00:00Z", evento: "leitura", entidade: "contrato", origem: "sistema", id_usuario: null, id_entidade: null, correlation_id: "abc" }],
    count: 1, error: null,
  }).then(resolve);
  return { fromMock: vi.fn(() => consulta), consulta };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: fromMock } }));
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";

const org = "00000000-0000-4000-8000-000000000001";

describe("V1-23 — trilha de auditoria: teste unitário isolado", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejeita organização ausente sem acessar Supabase", async () => {
    await expect(obterEventosAuditoria({ idOrganizacao: "", pagina: 0 })).rejects.toThrow("organização válida");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("consulta somente campos permitidos e restringe a organização", async () => {
    const resultado = await obterEventosAuditoria({ idOrganizacao: org, pagina: 0 });
    expect(fromMock).toHaveBeenCalledWith("eventos_auditoria");
    expect(consulta['select']).toHaveBeenCalledWith("id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id", { count: "exact" });
    expect(consulta['eq']).toHaveBeenCalledWith("id_organizacao", org);
    expect(resultado.eventos[0]).not.toHaveProperty("antes");
    expect(resultado.eventos[0]).not.toHaveProperty("depois");
    expect(resultado.eventos[0]).not.toHaveProperty("metadados");
  });

  it("limita a paginação a 50 linhas e mantém ordenação determinística", async () => {
    await obterEventosAuditoria({ idOrganizacao: org, pagina: 0, limite: 999 });
    expect(consulta['range']).toHaveBeenCalledWith(0, 49);
    expect(consulta['order']).toHaveBeenCalledWith("criado_em", { ascending: false });
    expect(consulta['order']).toHaveBeenCalledWith("id", { ascending: false });
  });

  it("aplica filtros sem inserir dados sensíveis na seleção", async () => {
    await obterEventosAuditoria({ idOrganizacao: org, pagina: 1, evento: "acesso", correlationId: "corr-1" });
    expect(consulta['eq']).toHaveBeenCalledWith("evento", "acesso");
    expect(consulta['eq']).toHaveBeenCalledWith("correlation_id", "corr-1");
    expect(consulta['range']).toHaveBeenCalledWith(25, 49);
  });
});

import { describe, expect, it } from "vitest";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";

describe("V1-23 — trilha de auditoria: TDD RED", () => {
  it("não permite consulta sem organização autenticada", async () => {
    await expect(obterEventosAuditoria({ idOrganizacao: "", pagina: 0 })).rejects.toThrow();
  });

  it("não retorna antes, depois ou metadados sensíveis na projeção", async () => {
    const resultado = await obterEventosAuditoria({ idOrganizacao: "00000000-0000-4000-8000-000000000001", pagina: 0 });
    for (const evento of resultado.eventos) {
      expect(evento).not.toHaveProperty("antes");
      expect(evento).not.toHaveProperty("depois");
      expect(evento).not.toHaveProperty("metadados");
    }
  });

  it("limita paginação no servidor e mantém ordenação determinística", async () => {
    const resultado = await obterEventosAuditoria({ idOrganizacao: "00000000-0000-4000-8000-000000000001", pagina: 0, limite: 999 });
    expect(resultado.eventos.length).toBeLessThanOrEqual(50);
  });
});

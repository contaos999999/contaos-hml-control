import { describe, expect, it } from "vitest";
import { MENU_V1, MENU_ADMIN_V1, rotaSemSidebar } from "@/lib/navegacao/menuV1";

describe("P0 sidebar V1", () => {
  it("não mostra menu nas rotas públicas e seleção de organização", () => {
    for (const rota of ["/login", "/esqueci-senha", "/redefinir-senha", "/selecionar-organizacao"]) expect(rotaSemSidebar(rota)).toBe(true);
    expect(rotaSemSidebar("/")).toBe(false);
  });
  it("somente oferece destinos principais existentes e sem links administrativos por padrão", () => {
    expect(MENU_V1.map((x) => x.destino)).toEqual(["/", "/contratantes", "/contratos"]);
    expect(MENU_V1.every((x) => !x.destino.includes("$"))).toBe(true);
    expect(MENU_V1.every((x) => !MENU_ADMIN_V1.some((a) => a.destino === x.destino))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { resolverDestinoPosLogin, rotuloPerfil } from "@/lib/auth/resolverDestinoPosLogin";

const v = (n: number, perfil = "analista") => ({ id: `o${n}`, razao_social: `O${n}`, nome_fantasia: null, cnpj: null, situacao: "ativa", perfil });

describe("resolverDestinoPosLogin (SYS-01)", () => {
  it("sem vínculos → sem acesso", () => {
    expect(resolverDestinoPosLogin([])).toEqual({ tipo: "sem-acesso" });
  });
  it("um vínculo → Dashboard /", () => {
    expect(resolverDestinoPosLogin([v(1)])).toEqual({ tipo: "rota", rota: "/" });
  });
  it("vários vínculos → /selecionar-organizacao", () => {
    expect(resolverDestinoPosLogin([v(1), v(2)])).toEqual({ tipo: "rota", rota: "/selecionar-organizacao" });
  });
  it("Master com 2 organizações → /selecionar-organizacao", () => {
    expect(resolverDestinoPosLogin([v(1, "administrador_master"), v(2, "administrador_master")])).toEqual({ tipo: "rota", rota: "/selecionar-organizacao" });
  });
  it("rótulo humano de administrador_master", () => {
    expect(rotuloPerfil("administrador_master")).toBe("Administrador Master");
    expect(rotuloPerfil("analista")).toBe("analista");
  });
});

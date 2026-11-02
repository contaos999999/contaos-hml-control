import { describe, expect, it } from "vitest";

import { alternar, criarDelta, registrarBaseline, valorExibido, idsAtivar, idsRevogar } from "@/lib/administracao/deltaEscopo";
import { assinarPayload, criarGerenciadorIntencao } from "@/lib/administracao/intencaoIdempotente";
import { classificarErroAdm } from "@/lib/administracao/admUsuariosRpc";

describe("ADM-01 deltaEscopo", () => {
  it("false→true entra em ativar; true→false entra em revogar", () => {
    let d = registrarBaseline(criarDelta(), [
      { id: "c1", selecionado: false },
      { id: "c2", selecionado: true },
    ]);
    d = alternar(d, "c1", true);
    d = alternar(d, "c2", false);
    expect(idsAtivar(d)).toEqual(["c1"]);
    expect(idsRevogar(d)).toEqual(["c2"]);
    expect(valorExibido(d, "c1")).toBe(true);
    expect(valorExibido(d, "c2")).toBe(false);
  });

  it("ida e volta ao baseline remove o ID dos dois deltas", () => {
    let d = registrarBaseline(criarDelta(), [{ id: "c1", selecionado: false }, { id: "c2", selecionado: true }]);
    d = alternar(alternar(d, "c1", true), "c1", false);
    d = alternar(alternar(d, "c2", false), "c2", true);
    expect(idsAtivar(d)).toEqual([]);
    expect(idsRevogar(d)).toEqual([]);
  });

  it("recarregar a mesma página não sobrescreve o baseline já registrado", () => {
    let d = registrarBaseline(criarDelta(), [{ id: "c1", selecionado: false }]);
    d = alternar(d, "c1", true);
    d = registrarBaseline(d, [{ id: "c1", selecionado: true }]);
    expect(idsAtivar(d)).toEqual(["c1"]);
  });

  it("acesso_efetivo nunca é usado como baseline", () => {
    const d = registrarBaseline(criarDelta(), [
      { id: "c1", selecionado: false, acesso_efetivo: true } as { id: string; selecionado: boolean },
    ]);
    expect(valorExibido(d, "c1")).toBe(false);
  });
});

describe("ADM-01 intencaoIdempotente", () => {
  it("mesma intenção e mesmo payload reutilizam a chave; payload alterado gera outra", () => {
    let n = 0;
    const g = criarGerenciadorIntencao(() => `k${++n}`);
    expect(g.chavePara("a")).toBe("k1");
    expect(g.chavePara("a")).toBe("k1");
    expect(g.chavePara("b")).toBe("k2");
    expect(g.chavePara("a")).toBe("k3");
  });

  it("guarda no máximo a intenção corrente e encerrar descarta a chave", () => {
    let n = 0;
    const g = criarGerenciadorIntencao(() => `k${++n}`);
    g.chavePara("a");
    g.chavePara("b");
    expect(g.atual()).toEqual({ key: "k2", assinaturaPayload: "b" });
    g.encerrar();
    expect(g.atual()).toBeNull();
    expect(g.chavePara("b")).toBe("k3");
  });

  it("assinatura é estável para arrays em ordem diferente", () => {
    expect(assinarPayload({ a: ["y", "x"], b: 1 })).toBe(assinarPayload({ b: 1, a: ["x", "y"] }));
  });
});

describe("ADM-01 classificação de erro contextual", () => {
  const e = (code: string) => ({ code, message: "técnico" });
  it("401/403/42501 são negado em qualquer operação", () => {
    expect(classificarErroAdm("listar", e("42501"), 400)).toBe("negado");
    expect(classificarErroAdm("escopo", e("X"), 403)).toBe("negado");
    expect(classificarErroAdm("auditoria", e("X"), 401)).toBe("negado");
  });
  it("PT409 é conflito", () => {
    expect(classificarErroAdm("salvarEdicao", e("PT409"), 409)).toBe("conflito");
  });
  it("PT404 depende da operação", () => {
    expect(classificarErroAdm("salvarNovo", e("PT404"), 404)).toBe("contaInexistente");
    expect(classificarErroAdm("escopo", e("PT404"), 404)).toBe("vinculoDesatualizado");
    expect(classificarErroAdm("auditoria", e("PT404"), 404)).toBe("vinculoDesatualizado");
    expect(classificarErroAdm("salvarEdicao", e("PT404"), 404)).toBe("vinculoDesatualizado");
    expect(classificarErroAdm("listar", e("PT404"), 404)).toBe("erro");
    expect(classificarErroAdm("escopoNovo", e("PT404"), 404)).toBe("erro");
  });
  it("PT400 é validação; outros são erro genérico", () => {
    expect(classificarErroAdm("salvarNovo", e("PT400"), 400)).toBe("validacao");
    expect(classificarErroAdm("listar", e("500"), 500)).toBe("erro");
  });
});

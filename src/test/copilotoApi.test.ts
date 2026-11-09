import { describe, expect, it } from "vitest";
import { validarPaginaHistorico, validarPaginaSessoes } from "@/lib/copiloto/copilotoApi";

describe("C13 contratos de DTO", () => {
  it("aceita sessão própria com cursor opaco", () => {
    expect(
      validarPaginaSessoes({
        ok: true,
        sessoes: [{ id: "s1", titulo: null, status: "ativa", data_referencia: null }],
        proximo_cursor: "opaque",
      }).sessoes,
    ).toHaveLength(1);
  });
  it("rejeita sessão sem status válido", () => {
    expect(() =>
      validarPaginaSessoes({
        ok: true,
        sessoes: [{ id: "s1", titulo: null, status: "desconhecida", data_referencia: null }],
        proximo_cursor: null,
      }),
    ).toThrow();
  });
  it("preserva conteúdo revogado e flags null como desconhecidos", () => {
    const pagina = validarPaginaHistorico({
      ok: true,
      sessao: { id: "s1", status: "encerrada" },
      mensagens: [
        {
          id: "m1",
          papel: "assistente",
          conteudo: null,
          conteudo_disponivel: false,
          fontes: [],
          incerteza: null,
          conflito_historico: null,
          baixa_confianca: null,
        },
      ],
      proximo_cursor: null,
    });
    expect(pagina.mensagens[0]?.conteudo).toBeNull();
    expect(pagina.mensagens[0]?.incerteza).toBeNull();
  });
  it("rejeita sessões sem cursor explícito e evita assumir paginação", () => {
    expect(() =>
      validarPaginaSessoes({ ok: true, sessoes: [], proximo_cursor: undefined }),
    ).toThrow();
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "ativa" },
        mensagens: [],
        proximo_cursor: undefined,
      }),
    ).toThrow();
  });
  it("rejeita histórico com sessão inválida ou mensagem sem ID", () => {
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "revogada" },
        mensagens: [],
        proximo_cursor: null,
      }),
    ).toThrow();
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "ativa" },
        mensagens: [{ papel: "usuario", conteudo: "x", conteudo_disponivel: true }],
        proximo_cursor: null,
      }),
    ).toThrow();
  });
  it("rejeita flags não booleanas e cursor sintético", () => {
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "ativa" },
        mensagens: [
          {
            id: "m1",
            papel: "usuario",
            conteudo: "x",
            conteudo_disponivel: true,
            incerteza: "false",
          },
        ],
        proximo_cursor: null,
      }),
    ).toThrow();
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "ativa" },
        mensagens: [],
        proximo_cursor: 12,
      }),
    ).toThrow();
  });
});

describe("C13 fonte DTO defensivo", () => {
  it.each(
    [[null], [{ trecho: {} }], [{ pagina: -1 }], [{ pagina: 1.5 }], [{ fonte_tipo: 7 }]].map(
      (fontes) => ({ fontes }),
    ),
  )("rejeita fontes que não podem ser renderizadas: $fontes", ({ fontes }) => {
    expect(() =>
      validarPaginaHistorico({
        ok: true,
        sessao: { id: "s1", status: "ativa" },
        mensagens: [
          { id: "m1", papel: "assistente", conteudo: "x", conteudo_disponivel: true, fontes },
        ],
        proximo_cursor: null,
      }),
    ).toThrow();
  });
});

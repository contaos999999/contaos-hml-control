import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { useState } from "react";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  nav: vi.fn(),
  rpc: vi.fn(),
  baixar: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => {
  const rpc = (nome: string, args: Record<string, unknown>) => {
    let p: Promise<unknown> | null = null;
    const run = () => (p ??= Promise.resolve().then(() => m.rpc(nome, args)));
    return {
      abortSignal: () => run(),
      then: (a: (v: unknown) => unknown, b?: (e: unknown) => unknown) => run().then(a, b),
    };
  };
  return { supabase: { auth: { getUser: m.getUser }, rpc } };
});
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => m.nav }));
vi.mock("@/lib/contratos/documentosDados", async (orig) => ({
  ...(await orig<typeof import("@/lib/contratos/documentosDados")>()),
  baixarDocumento: m.baixar,
}));

import { RequirementDrawer } from "@/components/competencias/RequirementDrawer";
import { parseDetalheV117, OFFSETS_DETALHE_ZERO } from "@/lib/competencias/requisitoDetalheDados";
import { definirPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";

const U = "user-1";
const ORG = "22222222-2222-4222-8222-222222222222";
const C = "44444444-4444-4444-8444-444444444444";
const C_B = "55555555-5555-4555-8555-555555555555";
const R = "66666666-6666-4666-8666-666666666666";
const R_B = "77777777-7777-4777-8777-777777777777";
const EX1 = "99999999-9999-4999-8999-999999999999";
const EX2 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const RES1 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const RES2 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const EV = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const VD = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ARQ = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const AP = "12121212-1212-4212-8212-121212121212";
const LER = "obter_detalhe_requisito_v117";
const SOL = "solicitar_reanalise_requisitos";

type Op = {
  c?: string;
  r?: string;
  ref?: string | null;
  atual?: string | null;
  na?: unknown;
  reanalisar?: boolean;
  doc?: unknown;
  descricao?: string;
};
function resultado(id: string, exec: string, resultado: string) {
  return {
    id,
    id_execucao: exec,
    resultado,
    mecanismo: "semantico",
    confianca: 0.91,
    justificativa: "Justificativa do backend",
    fundamento: "Fundamento do backend",
    hash_evidencias: "hash-ev-1",
    criado_em: "2026-03-10T15:00:00Z",
  };
}
const docAprovado = {
  id_versao_documento: VD,
  numero_versao: 2,
  hash_versao: "hash-v2",
  id_arquivo: ARQ,
  nome_original: "folha.pdf",
  mime: "application/pdf",
  status_seguranca: "aprovado",
};
function detalhe(o: Op = {}) {
  const ref = o.ref === undefined ? "nao_conforme" : o.ref;
  const atual = o.atual === undefined ? ref : o.atual;
  return {
    schema_versao: "v117-v1",
    competencia: {
      id: o.c ?? C,
      id_organizacao: ORG,
      id_contrato: ORG,
      competencia_referencia: "2026-03-01",
      situacao: "em_analise",
    },
    requisito: {
      id: o.r ?? R,
      codigo: "REQ-7",
      descricao: o.descricao ?? "Folha de pagamento do mês",
      categoria: "trabalhista",
      origem_tipo: "fonte_normativa",
      origem_id: "orig-1",
      origem_versao: "3",
      obrigatorio: true,
      aplicavel: true,
      impeditivo: false,
      criticidade: "alta",
      fonte_tipo: "contrato",
      fonte_referencia: "Cláusula 7",
      fonte_detalhe: "Item 7.2",
      efeito_portao: "bloqueia",
      hash_snapshot: "hash-snap",
      regra_validacao: "Valor líquido = recibo",
      condicao_aplicabilidade: "Sempre",
    },
    execucao_atual: {
      id: EX2,
      tipo: "parcial",
      status: "concluida",
      hash_entrada: "h-in",
      motor: "motor-x",
      versao_motor: "2.1",
      provedor: "prov",
      modelo: "modelo-y",
      prompt_versao: "p3",
      iniciada_em: "2026-03-11T12:00:00Z",
      concluida_em: "2026-03-11T12:05:00Z",
      criado_em: "2026-03-11T12:00:00Z",
    },
    resultado_atual: atual ? resultado(RES2, EX2, atual) : null,
    resultado_referencia: ref ? resultado(RES1, EX1, ref) : null,
    na_validade:
      o.na !== undefined
        ? o.na
        : ref === "nao_aplicavel"
          ? {
              valido: true,
              id_resultado_referencia: RES1,
              possui_fundamento: true,
              possui_evidencia: true,
            }
          : null,
    allowed_actions: {
      executar_analise: false,
      reanalisar: o.reanalisar ?? false,
      abrir_requisito: true,
    },
    evidencias: [
      {
        id: EV,
        id_resultado: RES1,
        id_versao_documento: VD,
        pagina: 4,
        trecho: "Total líquido R$ 10,00",
        tipo_evidencia: "documento",
        referencia_externa: null,
        hash: "hash-ev",
        criado_em: "2026-03-10T15:00:00Z",
        documento: o.doc === undefined ? docAprovado : o.doc,
      },
    ],
    evidencias_paginacao: { offset: 0, limite: 25, total: 30 },
    historico: [
      {
        ...resultado(RES2, EX2, "conforme"),
        id_resultado: RES2,
        tipo_execucao: "parcial",
        status_execucao: "concluida",
        motor: "m",
        versao_motor: "1",
        provedor: null,
        modelo: null,
        prompt_versao: null,
        hash_entrada: "h2",
        iniciada_em: null,
        concluida_em: null,
      },
      {
        ...resultado(RES1, EX1, "nao_conforme"),
        id_resultado: RES1,
        tipo_execucao: "completa",
        status_execucao: "concluida",
        motor: "m",
        versao_motor: "1",
        provedor: null,
        modelo: null,
        prompt_versao: null,
        hash_entrada: "h1",
        iniciada_em: null,
        concluida_em: null,
      },
    ],
    historico_paginacao: { offset: 0, limite: 25, total: 30 },
    apontamentos: [
      {
        id: AP,
        descricao: "Recibo ausente",
        severidade: "alta",
        status: "aberto",
        origem: "motor",
        regra_violada: "REG-9",
        acao_sugerida: "Enviar recibo",
        fonte: { documento: "folha.pdf" },
        criado_em: "2026-03-10T15:00:00Z",
        atualizado_em: null,
      },
    ],
    apontamentos_paginacao: { offset: 0, limite: 25, total: 30 },
  };
}
const lidas = () => m.rpc.mock.calls.filter((c) => c[0] === LER);
const escritas = () => m.rpc.mock.calls.filter((c) => c[0] === SOL);
function rpcLeitura(f: (a: Record<string, unknown>) => unknown) {
  m.rpc.mockImplementation((n: string, a: Record<string, unknown>) =>
    n === LER ? f(a) : { data: EX2, error: null },
  );
}
const pronto = () => screen.findByText("REQ-7");
function abrir(
  p: Partial<{
    c: string;
    r: string;
    onReanalisado: () => void;
    onOpenChange: (v: boolean) => void;
  }> = {},
) {
  return render(
    <RequirementDrawer
      idCompetencia={p.c ?? C}
      idRequisito={p.r ?? R}
      aberto
      onOpenChange={p.onOpenChange ?? (() => {})}
      onReanalisado={p.onReanalisado ?? (() => {})}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  m.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });
  definirPreferenciaOrganizacao(U, ORG);
  rpcLeitura(() => ({ data: detalhe(), error: null }));
});

describe("V1-17 parser fail-closed", () => {
  const p = (d: unknown) => parseDetalheV117(d, C, R, OFFSETS_DETALHE_ZERO);
  it("aceita contrato v117-v1", () => expect(p(detalhe())).not.toBeNull());
  it("rejeita schema diferente", () =>
    expect(p({ ...detalhe(), schema_versao: "v116-v1" })).toBeNull());
  it("rejeita competência/requisito diferentes do solicitado", () => {
    expect(p(detalhe({ c: C_B }))).toBeNull();
    expect(p(detalhe({ r: R_B }))).toBeNull();
  });
  it("rejeita id não UUID", () => expect(p(detalhe({ r: "q-1" }))).toBeNull());
  it.each(["evidencias", "historico", "apontamentos"])("rejeita %s ausente", (k) => {
    const d = detalhe() as Record<string, unknown>;
    delete d[k];
    expect(p(d)).toBeNull();
  });
  it("rejeita paginação inválida ou limite diferente de 25", () => {
    expect(
      p({ ...detalhe(), historico_paginacao: { offset: 0, limite: 10, total: 1 } }),
    ).toBeNull();
    expect(
      p({ ...detalhe(), evidencias_paginacao: { offset: -1, limite: 25, total: 1 } }),
    ).toBeNull();
    expect(p({ ...detalhe(), apontamentos_paginacao: { offset: 0, limite: 25 } })).toBeNull();
  });
  it("rejeita allowed_actions sem os três booleanos", () => {
    expect(
      p({ ...detalhe(), allowed_actions: { reanalisar: true, executar_analise: false } }),
    ).toBeNull();
    expect(p({ ...detalhe(), allowed_actions: {} })).toBeNull();
  });
  it("rejeita na_validade fora de N/A e N/A sem valido boolean", () => {
    expect(p(detalhe({ na: { valido: true } }))).toBeNull();
    expect(p(detalhe({ ref: "nao_aplicavel", na: null }))).toBeNull();
    expect(p(detalhe({ ref: "nao_aplicavel", na: { valido: "sim" } }))).toBeNull();
  });
  it("na_validade.valido=false é legítimo", () => {
    const d = p(
      detalhe({
        ref: "nao_aplicavel",
        na: { valido: false, possui_fundamento: false, possui_evidencia: true },
      }),
    );
    expect(d?.na_validade?.valido).toBe(false);
  });
  it("resultado_atual nulo com referência presente é válido", () => {
    const d = p(detalhe({ atual: null }));
    expect(d?.resultado_atual).toBeNull();
    expect(d?.resultado_referencia?.resultado).toBe("nao_conforme");
  });
});

describe("V1-17 gate", () => {
  it.each([
    ["competência", "x", R],
    ["requisito", C, "q-R1"],
  ])("UUID inválido (%s) → zero Auth/RPC", async (_n, c, r) => {
    abrir({ c, r });
    expect(await screen.findByText(/Requisito não encontrado/)).toBeInTheDocument();
    expect(m.getUser).not.toHaveBeenCalled();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it("UUID válido → getUser → RPC com limites 25 e offsets 0", async () => {
    abrir();
    await pronto();
    expect(m.getUser).toHaveBeenCalledTimes(1);
    expect(lidas()[0]![1]).toEqual({
      p_id_competencia: C,
      p_id_requisito: R,
      p_evidencias_offset: 0,
      p_evidencias_limite: 25,
      p_historico_offset: 0,
      p_historico_limite: 25,
      p_apontamentos_offset: 0,
      p_apontamentos_limite: 25,
    });
  });
  it.each([
    [{ code: "42501", message: "permission denied for table x" }, /não tem acesso/],
    [{ code: "PT404", message: "Requisito não encontrado." }, /Requisito não encontrado/],
    [{ code: "PT400", message: "Paginação inválida" }, /Solicitação inválida/],
    [{ code: "XX000", message: "relation secret does not exist" }, /Não foi possível carregar/],
  ])("erro sanitizado %#", async (err, re) => {
    rpcLeitura(() => ({ data: null, error: err }));
    abrir();
    expect(await screen.findByText(re)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(
      /permission denied|relation secret|Paginação inválida/,
    );
  });
  it("contrato inválido → erro, sem dados parciais", async () => {
    rpcLeitura(() => ({ data: { ...detalhe(), schema_versao: "v0" }, error: null }));
    abrir();
    expect(await screen.findByText(/Não foi possível carregar/)).toBeInTheDocument();
    expect(screen.queryByText("REQ-7")).toBeNull();
  });
});

describe("V1-17 conteúdo e estados", () => {
  it.each([
    ["conforme", "Conforme"],
    ["nao_conforme", "Não conforme"],
    ["inconclusivo", "Inconclusivo"],
    ["valor_novo_backend", "valor_novo_backend"],
  ])("resultado %s → rótulo texto", async (v, rot) => {
    rpcLeitura(() => ({ data: detalhe({ ref: v }), error: null }));
    abrir();
    await pronto();
    const bloco = screen.getByRole("region", { name: /Resultado de referência/ });
    expect(within(bloco).getByText(rot)).toBeInTheDocument();
  });
  it("sem resultado de referência", async () => {
    rpcLeitura(() => ({ data: detalhe({ ref: null, atual: null }), error: null }));
    abrir();
    await pronto();
    expect(screen.getByText(/Sem resultado registrado para este requisito/)).toBeInTheDocument();
  });
  it("N/A válido e inválido exibidos conforme backend", async () => {
    rpcLeitura(() => ({ data: detalhe({ ref: "nao_aplicavel" }), error: null }));
    const v = abrir();
    await pronto();
    expect(screen.getByText(/Não aplicável válido/)).toBeInTheDocument();
    v.unmount();
    rpcLeitura(() => ({
      data: detalhe({
        ref: "nao_aplicavel",
        na: { valido: false, possui_fundamento: false, possui_evidencia: true },
      }),
      error: null,
    }));
    abrir();
    await pronto();
    expect(screen.getByText(/Não aplicável inválido/)).toBeInTheDocument();
    expect(screen.getByText(/Possui fundamento: Não/)).toBeInTheDocument();
    expect(screen.getByText(/Possui evidência: Sim/)).toBeInTheDocument();
  });
  it("resultado_atual nulo → usa referência e mostra última execução global separada", async () => {
    rpcLeitura(() => ({ data: detalhe({ atual: null }), error: null }));
    abrir();
    await pronto();
    const ref = screen.getByRole("region", { name: /Resultado de referência/ });
    expect(within(ref).getByText("Não conforme")).toBeInTheDocument();
    const g = screen.getByRole("region", { name: /Última execução global/ });
    expect(within(g).getByText(/Sem resultado deste requisito nesta execução/)).toBeInTheDocument();
  });
  it("histórico com duas execuções e referências distintas", async () => {
    abrir();
    await pronto();
    const h = screen.getByRole("region", { name: /Histórico de auditoria/ });
    expect(within(h).getAllByRole("listitem")).toHaveLength(2);
    expect(within(h).getByText("Conforme")).toBeInTheDocument();
    expect(within(h).getByText("Não conforme")).toBeInTheDocument();
  });
  it("fonte, origem, versão e hash exibidos", async () => {
    abrir();
    await pronto();
    const f = screen.getByRole("region", { name: /Fonte e versionamento/ });
    expect(within(f).getByText(/Cláusula 7/)).toBeInTheDocument();
    expect(within(f).getByText(/hash-snap/)).toBeInTheDocument();
    expect(within(f).getByText(/fonte_normativa/)).toBeInTheDocument();
  });
  it("apontamento com origem e fonte", async () => {
    abrir();
    await pronto();
    const a = screen.getByRole("region", { name: /Apontamentos do requisito/ });
    expect(within(a).getByText(/Recibo ausente/)).toBeInTheDocument();
    expect(within(a).getByText(/documento: folha.pdf/)).toBeInTheDocument();
  });
});

describe("V1-17 download", () => {
  it("documento aprovado → baixarDocumento(id_arquivo), nunca id_versao", async () => {
    m.baixar.mockResolvedValue(undefined);
    abrir();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Baixar folha.pdf/ }));
    await waitFor(() => expect(m.baixar).toHaveBeenCalledWith(ARQ));
    expect(m.baixar).not.toHaveBeenCalledWith(VD);
  });
  it.each([
    ["ausente", null],
    ["não aprovado", { ...docAprovado, status_seguranca: "pendente" }],
    ["sem arquivo", { ...docAprovado, id_arquivo: null }],
  ])("documento %s → sem botão Baixar", async (_n, doc) => {
    rpcLeitura(() => ({ data: detalhe({ doc }), error: null }));
    abrir();
    await pronto();
    expect(screen.queryByRole("button", { name: /Baixar/ })).toBeNull();
  });
  it("falha de download sanitizada", async () => {
    m.baixar.mockRejectedValue(new Error("storage key xyz"));
    abrir();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Baixar folha.pdf/ }));
    expect(await screen.findByText(/Não foi possível baixar o documento/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/storage key/);
  });
});

describe("V1-17 paginação independente", () => {
  it.each([
    ["evidências", "p_evidencias_offset"],
    ["histórico", "p_historico_offset"],
    ["apontamentos", "p_apontamentos_offset"],
  ])("próxima página de %s altera só seu offset", async (rot, campo) => {
    rpcLeitura((a) => {
      const d = detalhe();
      return {
        data: {
          ...d,
          evidencias_paginacao: { ...d.evidencias_paginacao, offset: a["p_evidencias_offset"] },
          historico_paginacao: { ...d.historico_paginacao, offset: a["p_historico_offset"] },
          apontamentos_paginacao: {
            ...d.apontamentos_paginacao,
            offset: a["p_apontamentos_offset"],
          },
        },
        error: null,
      };
    });
    abrir();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Próxima página de ${rot}`) }));
    await waitFor(() => expect(lidas()).toHaveLength(2));
    const a = lidas()[1]![1] as Record<string, number>;
    for (const k of ["p_evidencias_offset", "p_historico_offset", "p_apontamentos_offset"])
      expect(a[k]).toBe(k === campo ? 25 : 0);
  });
});

describe("V1-17 reanálise", () => {
  it("reanalisar=false → sem botão executável", async () => {
    abrir();
    await pronto();
    expect(screen.queryByRole("button", { name: /Reanalisar este requisito/ })).toBeNull();
  });
  it("duplo clique → 1 RPC com [idRequisito]; sucesso recarrega drawer e V1-16", async () => {
    rpcLeitura(() => ({ data: detalhe({ reanalisar: true }), error: null }));
    const onR = vi.fn();
    abrir({ onReanalisado: onR });
    await pronto();
    const b = screen.getByRole("button", { name: /Reanalisar este requisito/ });
    fireEvent.click(b);
    fireEvent.click(b);
    await waitFor(() => expect(onR).toHaveBeenCalledTimes(1));
    expect(escritas()).toHaveLength(1);
    expect(escritas()[0]![1]).toEqual({ p_id_competencia: C, p_requisitos: [R] });
    await waitFor(() => expect(lidas()).toHaveLength(2));
    expect(await screen.findByText(/Reanálise deste requisito solicitada/)).toBeInTheDocument();
  });
  it("PT409 → mensagem PT-BR, sem texto técnico, sem nova escrita", async () => {
    m.rpc.mockImplementation((n: string) =>
      n === LER
        ? { data: detalhe({ reanalisar: true }), error: null }
        : { data: null, error: { code: "PT409", message: "conflict scope raw" } },
    );
    abrir();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Reanalisar este requisito/ }));
    expect(
      await screen.findByText(/Já existe uma análise ativa com escopo diferente/),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/conflict scope raw/);
    expect(escritas()).toHaveLength(1);
  });
  it("timeout ambíguo → 1 escrita + 1 leitura de reconciliação", async () => {
    m.rpc.mockImplementation((n: string) => {
      if (n === SOL) throw new Error("network timeout");
      return { data: detalhe({ reanalisar: true }), error: null };
    });
    abrir();
    await pronto();
    fireEvent.click(screen.getByRole("button", { name: /Reanalisar este requisito/ }));
    await waitFor(() => expect(lidas()).toHaveLength(2));
    await new Promise((r) => setTimeout(r, 30));
    expect(escritas()).toHaveLength(1);
    expect(lidas()).toHaveLength(2);
    expect(document.body.textContent).not.toMatch(/network timeout/);
  });
});

describe("V1-17 troca A/B e acessibilidade", () => {
  it("troca de requisito descarta resposta tardia de A", async () => {
    let soltarA: (v: unknown) => void = () => {};
    m.rpc.mockImplementation((_n: string, a: Record<string, unknown>) =>
      a["p_id_requisito"] === R
        ? new Promise((res) => (soltarA = res))
        : { data: detalhe({ r: R_B, descricao: "Requisito B" }), error: null },
    );
    const v = abrir();
    await waitFor(() => expect(lidas()).toHaveLength(1));
    v.rerender(
      <RequirementDrawer
        idCompetencia={C}
        idRequisito={R_B}
        aberto
        onOpenChange={() => {}}
        onReanalisado={() => {}}
      />,
    );
    expect(await screen.findByText("Requisito B")).toBeInTheDocument();
    soltarA({ data: detalhe({ descricao: "Requisito A tardio" }), error: null });
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByText("Requisito A tardio")).toBeNull();
  });
  it("título h2, diálogo rotulado e Esc fecha", async () => {
    const onOpen = vi.fn();
    abrir({ onOpenChange: onOpen });
    await pronto();
    const dlg = screen.getByRole("dialog", { name: /Detalhe do requisito/ });
    expect(
      within(dlg).getByRole("heading", { level: 2, name: /Detalhe do requisito/ }),
    ).toBeInTheDocument();
    expect(within(dlg).queryByRole("heading", { level: 1 })).toBeNull();
    fireEvent.keyDown(dlg, { key: "Escape" });
    expect(onOpen).toHaveBeenCalledWith(false);
  });
  it("estático: sem URL pública, sem solicitar_analise_competencia, sem cálculo de portão", () => {
    const src =
      readFileSync("src/components/competencias/RequirementDrawer.tsx", "utf8") +
      readFileSync("src/lib/competencias/requisitoDetalheDados.ts", "utf8");
    expect(src).not.toMatch(
      /getPublicUrl|createSignedUrl|service_role|solicitar_analise_competencia\b|percentual|stale/,
    );
  });
  it("foco devolvido ao botão de origem ao fechar", async () => {
    function Host() {
      const [a, setA] = useState(false);
      return (
        <>
          <button onClick={() => setA(true)}>Abrir origem</button>
          <RequirementDrawer
            idCompetencia={C}
            idRequisito={R}
            aberto={a}
            onOpenChange={setA}
            onReanalisado={() => {}}
          />
        </>
      );
    }
    render(<Host />);
    const b = screen.getByRole("button", { name: "Abrir origem" });
    b.focus();
    fireEvent.click(b);
    await pronto();
    expect(document.activeElement?.textContent).toMatch(/Detalhe do requisito/);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(document.activeElement).toBe(b));
  });
  it("X nativo do Sheet oculto por display:none (classe) e ação Fechar PT-BR única", async () => {
    abrir();
    await pronto();
    const dlg = screen.getByRole("dialog", { name: /Detalhe do requisito/ });
    // Prova estática: a classe é aplicada ao conteúdo do Sheet (CSS real verificado no browser).
    expect(dlg.className).toContain("[&>button:first-child]:hidden");
    const primeiro = dlg.firstElementChild as HTMLElement;
    expect(primeiro.tagName).toBe("BUTTON");
    expect(primeiro.textContent).toBe("Close");
    expect(within(dlg).getAllByRole("button", { name: /^Fechar$/ })).toHaveLength(1);
  });
});

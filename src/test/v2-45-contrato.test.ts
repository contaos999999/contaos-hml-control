import { beforeEach, expect, it, vi } from "vitest";

const transport = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  return {
    supabase: createClient("https://contaos.fixture.invalid", "fixture-publishable-key", {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { fetch: transport.fetch },
    }),
  };
});

import {
  consultarCicloDiligencia,
  formatarValorDiligencia,
} from "@/lib/diligencias/cicloDiligenciaDados";

const ORG = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const APRESENTACAO = "33333333-3333-4333-8333-333333333333";
const COMPETENCIA = "44444444-4444-4444-8444-444444444444";
const OUTRO = "55555555-5555-4555-8555-555555555555";
const CICLO_ID = "77777777-7777-4777-8777-777777777777";
const recebimento = "2026-11-08T15:00:00Z";
const chaves = { id_organizacao: ORG, id_contrato: CONTRATO, id_competencia: COMPETENCIA };
const ciclo = {
  ...chaves,
  id: CICLO_ID,
  numero_rodada: 2,
  recebido_em: recebimento,
  prazo_resposta: "2026-11-21",
  encerrado_em: null,
  versao_registro: 1,
  status: "em_tratamento",
};
const parecer = {
  ...chaves,
  id: "66666666-6666-4666-8666-666666666666",
  id_ciclo: CICLO_ID,
  numero_documento: "PARECER-V2",
  recebido_em: recebimento,
  data_emissao: "2026-11-07",
  resultado_geral: "Diligência",
  id_apresentacao: APRESENTACAO,
  apresentacao: { ...chaves, id: APRESENTACAO },
};
const item = {
  ...chaves,
  id: "99999999-9999-4999-8999-999999999999",
  id_ciclo: CICLO_ID,
  codigo: "AP-V2",
  descricao: "Documento com valor em análise",
  status: "em_analise",
  classificacao_sugerida: "Financeiro",
  severidade: "alta",
  criado_em: recebimento,
  valor_questionado: "9999999999999999.99",
  glosa_potencial: "0.00",
  valor_aceito: null,
  impacto_financeiro_estimado: "-0.01",
};
const visao = {
  competencia: {
    id: COMPETENCIA,
    id_contrato: CONTRATO,
    id_organizacao: ORG,
    competencia_referencia: "2026-09-01",
    situacao: "aguardando_contratante",
    periodo_inicio: "2026-09-01",
    periodo_fim: "2026-09-30",
    data_limite: null,
    atualizado_em: recebimento,
    percentual_conformidade: 100,
    versao_pacote_atual: 1,
    versao_registro: 1,
  },
  portao: {
    liberado: true,
    total: 1,
    conformes_ou_na_validos: 1,
    pendentes: 0,
    nao_conformes: 0,
    inconclusivos: 0,
    em_analise: 0,
    nao_conformidades_bloqueantes: 0,
    percentual: 100,
  },
  blocking_summary: {
    pendentes: 0,
    nao_conformes: 0,
    inconclusivos: 0,
    em_analise: 0,
    nao_conformidades_bloqueantes: 0,
    parecer_aprovado: true,
    analise_concluida_atual: true,
    aprovacao_apresentacao_atual: true,
  },
  allowed_actions: {
    abrir_documentos: true,
    analisar: true,
    abrir_parecer: true,
    apresentar: false,
  },
};

const endpoints = {
  ciclos_diligencia: [ciclo],
  "rpc/obter_visao_geral_competencia": visao,
  pareceres_contratante: [parecer],
  apontamentos_contratante: [item],
};

function resposta(body: unknown, status = 200, count = Array.isArray(body) ? body.length : 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Content-Range": count === 0 ? "*/0" : "0-0/" + count,
    },
  });
}

function preparar(substituicoes: Partial<Record<keyof typeof endpoints, Response>> = {}) {
  const chamadas: { caminho: string; url: URL; metodo: string; body: string | undefined }[] = [];
  transport.fetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const parsed = new URL(request.url);
    if (parsed.origin !== "https://contaos.fixture.invalid")
      throw Error("Transporte fora da fixture");
    const caminho = parsed.pathname.replace(/^\/rest\/v1\//, "") as keyof typeof endpoints;
    if (!Object.hasOwn(endpoints, caminho)) throw Error("Operação inesperada");
    chamadas.push({
      caminho,
      url: parsed,
      metodo: request.method,
      body: request.method === "POST" ? await request.clone().text() : undefined,
    });
    return substituicoes[caminho] ?? resposta(endpoints[caminho]);
  });
  return chamadas;
}

const ler = (signal = new AbortController().signal, pareceres = 0, apontamentos = 0) =>
  consultarCicloDiligencia(CICLO_ID, ORG, { pareceres, apontamentos }, signal);

beforeEach(() => {
  transport.fetch.mockReset();
});

it("V2-02 consulta o ciclo autorizado com fontes e valores no escopo da rodada", async () => {
  const chamadas = preparar();
  const d = await ler();
  expect(d.ciclo).toMatchObject({ id: CICLO_ID, numero_rodada: 2, prazo_resposta: "2026-11-21" });
  expect(d.pareceres.itens[0]).toMatchObject({ id: parecer.id, apresentacaoId: APRESENTACAO });
  expect(d.apontamentos.itens[0]).toMatchObject({
    id: item.id,
    valorQuestionado: item.valor_questionado,
    glosaPotencial: "0.00",
    valorAceito: null,
    impactoEstimado: "-0.01",
  });
  expect(chamadas.map((c) => c.caminho)).toEqual(Object.keys(endpoints));
  const [cicloReq, visaoReq, parecerReq, itemReq] = chamadas;
  if (!cicloReq || !visaoReq || !parecerReq || !itemReq) throw Error("Consultas incompletas");
  expect(cicloReq.url.searchParams.get("id")).toBe("eq." + CICLO_ID);
  expect(cicloReq.url.searchParams.get("id_organizacao")).toBe("eq." + ORG);
  expect(JSON.parse(String(visaoReq.body))).toEqual({ p_id_competencia: COMPETENCIA });
  expect(visaoReq.metodo).toBe("POST");
  for (const req of [parecerReq, itemReq]) {
    expect(req.metodo).toBe("GET");
    for (const [k, id] of Object.entries({ ...chaves, id_ciclo: CICLO_ID })) {
      expect(req.url.searchParams.get(k)).toBe("eq." + id);
    }
    expect(req.url.searchParams.get("limit")).toBe("25");
    expect(req.url.searchParams.get("offset")).toBe("0");
  }
  expect(parecerReq.url.searchParams.get("order")).toBe("recebido_em.desc,id.desc");
  expect(parecerReq.url.searchParams.get("select")).toContain(
    "apresentacao:apresentacoes_contratante!",
  );
  expect(itemReq.url.searchParams.get("order")).toBe("criado_em.desc,id.desc");
  expect(itemReq.url.searchParams.get("select")).toContain("impacto_financeiro_estimado::text");
});

it("V2-02 preserva centavos sem converter o decimal de 18 digitos para Number", () => {
  const limpar = (s: string) => s.replace(/\s/g, " ");
  expect(limpar(formatarValorDiligencia("9999999999999999.99"))).toBe(
    "R$ 9.999.999.999.999.999,99",
  );
  expect(limpar(formatarValorDiligencia("-0.01"))).toBe("-R$ 0,01");
  expect(limpar(formatarValorDiligencia("0.00"))).toBe("R$ 0,00");
  expect(formatarValorDiligencia(null)).toBe("Não informado");
});

it("V2-02 preserva a negacao e nao consulta filhos de ciclo invisivel", async () => {
  let chamadas = preparar({
    ciclos_diligencia: resposta({ code: "42501", message: "privado" }, 403),
  });
  await expect(ler()).rejects.toMatchObject({ tipo: "sem_permissao" });
  expect(chamadas).toHaveLength(1);
  chamadas = preparar({ ciclos_diligencia: resposta([]) });
  await expect(ler()).rejects.toMatchObject({ tipo: "nao_encontrado" });
  expect(chamadas).toHaveLength(1);
  chamadas = preparar({ ciclos_diligencia: resposta([{ ...ciclo, id_organizacao: OUTRO }]) });
  await expect(ler()).rejects.toMatchObject({ tipo: "sem_permissao" });
  expect(chamadas).toHaveLength(1);
  chamadas = preparar({
    "rpc/obter_visao_geral_competencia": resposta({
      ...visao,
      competencia: { ...visao.competencia, id_contrato: OUTRO },
    }),
  });
  await expect(ler()).rejects.toMatchObject({ tipo: "sem_permissao" });
  expect(chamadas).toHaveLength(2);
});

it("V2-02 rejeita origem ou item cruzado e nao expoe apresentacao invisivel", async () => {
  preparar({
    pareceres_contratante: resposta([
      {
        ...parecer,
        apresentacao: { ...parecer.apresentacao, id_competencia: OUTRO },
      },
    ]),
  });
  await expect(ler()).rejects.toMatchObject({ tipo: "erro" });
  preparar({ apontamentos_contratante: resposta([{ ...item, id_ciclo: OUTRO }]) });
  await expect(ler()).rejects.toMatchObject({ tipo: "erro" });
  preparar({ apontamentos_contratante: resposta([{ ...item, valor_aceito: 10.3 }]) });
  await expect(ler()).rejects.toMatchObject({ tipo: "erro" });
  preparar({ apontamentos_contratante: resposta([item, item]) });
  await expect(ler()).rejects.toMatchObject({ tipo: "erro" });
  preparar({ pareceres_contratante: resposta([{ ...parecer, apresentacao: null }]) });
  await expect(ler()).resolves.toMatchObject({ pareceres: { itens: [{ apresentacaoId: null }] } });
});

it("V2-02 separa os offsets, vazio, falha de transporte e cancelamento", async () => {
  const chamadas = preparar({
    pareceres_contratante: resposta([], 200, 0),
    apontamentos_contratante: resposta([item], 200, 26),
  });
  const sinal = new AbortController();
  const d = await ler(sinal.signal, 0, 25);
  expect(d.pareceres).toEqual({ itens: [], total: 0 });
  expect(d.apontamentos.total).toBe(26);
  expect(chamadas[2]?.url.searchParams.get("offset")).toBe("0");
  expect(chamadas[3]?.url.searchParams.get("offset")).toBe("25");
  sinal.abort();
  await expect(ler(sinal.signal)).rejects.toMatchObject({ name: "AbortError" });
  expect(chamadas).toHaveLength(4);
  preparar({ apontamentos_contratante: resposta({ code: "error" }, 503) });
  await expect(ler()).rejects.toMatchObject({ tipo: "erro" });
});

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

import { consultarApontamentoDiligencia } from "@/lib/diligencias/apontamentoDiligenciaDados";

const uuid = (n: number) => "46000000-0000-4000-8000-" + String(n).padStart(12, "0");
const [
  org,
  contrato,
  competencia,
  ciclo,
  item,
  outro,
  parecer,
  arquivo,
  apresentacao,
  pacote,
  analise,
  documento,
  antiga,
  posterior,
  tarefa,
  evento,
  ator,
  desfecho,
  itemPacote,
] = [
  uuid(1),
  uuid(2),
  uuid(3),
  uuid(4),
  uuid(5),
  uuid(6),
  uuid(7),
  uuid(8),
  uuid(9),
  uuid(10),
  uuid(11),
  uuid(12),
  uuid(13),
  uuid(14),
  uuid(15),
  uuid(16),
  uuid(17),
  uuid(18),
  uuid(19),
] as const;
const data = "2026-11-08T15:00:00Z";
const congelado = "2026-11-07T15:00:00Z";
const hash = "a".repeat(64);
const contexto = { id_organizacao: org, id_contrato: contrato, id_competencia: competencia };
const parte = { ...contexto, id_apontamento: item };
const rodada = {
  ...contexto,
  id: ciclo,
  numero_rodada: 2,
  recebido_em: data,
  prazo_resposta: null,
  encerrado_em: null,
  versao_registro: 1,
  status: "em_tratamento",
};
const row = {
  ...contexto,
  id: item,
  id_ciclo: ciclo,
  codigo: "AP-46",
  descricao: "Item conferido",
  status: "em_analise",
  classificacao_sugerida: "inconclusivo",
  severidade: "alta",
  criado_em: data,
  valor_questionado: "9999999999999999.99",
  glosa_potencial: "0.00",
  valor_aceito: null,
  impacto_financeiro_estimado: "-0.01",
  fundamento: "Fundamento oficial da origem",
};
const fonte = {
  ...parte,
  id_ciclo: ciclo,
  estado: "REGISTRADA",
  fonte: {
    id_parecer: parecer,
    id_arquivo: arquivo,
    id_apresentacao: apresentacao,
    nome_original: "parecer-segunda-origem.pdf",
    numero_documento: "P-02",
    arquivo_sha256: hash,
    pagina: 3,
    trecho: "Trecho idêntico aos outros pareceres",
  },
};
const versao = (id: string, numero: number, criado: string) => ({
  id,
  id_contrato: contrato,
  id_organizacao: org,
  id_documento_contrato: null,
  id_documento_competencia: documento,
  numero_versao: numero,
  hash,
  criado_em: criado,
  documentoCompetencia: { ...contexto, id: documento, titulo: "Comprovante" },
  documentoContrato: null,
});
const visao = {
  competencia: {
    ...contexto,
    id: competencia,
    competencia_referencia: "2026-09-01",
    situacao: "aguardando_contratante",
    periodo_inicio: "2026-09-01",
    periodo_fim: "2026-09-30",
    data_limite: null,
    atualizado_em: data,
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
const endpoints: Record<string, unknown> = {
  ciclos_diligencia: [rodada],
  "rpc/obter_visao_geral_competencia": visao,
  apontamentos_contratante: [row],
  "rpc/obter_fonte_apontamento_contratante": fonte,
  analises_apontamentos: [
    {
      ...parte,
      id: analise,
      classificacao: "inconclusivo",
      fundamento: "Sugestão com ressalva",
      evidencias: [{ id_versao_documento: antiga }],
      criado_em: data,
    },
  ],
  tarefas_diligencia: [
    {
      ...parte,
      id: tarefa,
      id_ciclo: ciclo,
      descricao: "Validar evidência",
      id_evidencia_versao_documento: posterior,
    },
  ],
  eventos_auditoria: [
    {
      id: evento,
      id_organizacao: org,
      id_usuario: ator,
      id_entidade: tarefa,
      entidade: "tarefas_diligencia",
      evento: "SolucaoTarefaDiligenciaRevisada",
      criado_em: data,
      depois: { revisor: ator, aprovada: true, fundamento: "Conferência humana no documento" },
    },
  ],
  desfechos_apontamentos: [
    {
      ...parte,
      id: desfecho,
      tipo_desfecho: "Validado pelo contratante",
      texto: "Resultado externo registrado",
      criado_em: data,
    },
  ],
  apresentacoes_contratante: [{ ...contexto, id: apresentacao, id_pacote: pacote }],
  pacotes_competencia: [
    { ...contexto, id: pacote, hash_pacote: hash, status: "apresentado", congelado_em: congelado },
  ],
  versoes_documento: [versao(antiga, 1, "2026-11-05T12:00:00Z"), versao(posterior, 2, data)],
  itens_pacote_competencia: [
    {
      ...contexto,
      id: itemPacote,
      id_pacote: pacote,
      entidade_tipo: "documento_competencia",
      entidade_id: documento,
      versao_id: antiga,
      hash,
    },
  ],
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
function preparar(alteracoes: Record<string, unknown> = {}) {
  const chamadas: { path: string; url: URL; method: string; body: unknown }[] = [];
  transport.fetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/rest\/v1\//, "");
    const method = req.method;
    if (url.origin !== "https://contaos.fixture.invalid" || !Object.hasOwn(endpoints, path))
      throw new Error("Leitura fora do contrato da fixture");
    expect(req.headers.get("apikey")).toBe("fixture-publishable-key");
    expect(method).toBe(path.startsWith("rpc/") ? "POST" : "GET");
    chamadas.push({ path, url, method, body: method === "POST" ? await req.json() : null });
    const resposta = Object.hasOwn(alteracoes, path) ? alteracoes[path] : endpoints[path];
    return resposta instanceof Response ? resposta : json(resposta);
  });
  return chamadas;
}
const consultar = (id = item, signal = new AbortController().signal) =>
  consultarApontamentoDiligencia(ciclo, id, org, signal);

beforeEach(() => {
  transport.fetch.mockReset();
});

it("V2-03 consulta item, parecer, pacote e revisao no escopo autorizado", async () => {
  const chamadas = preparar();
  const dados = await consultar();
  expect(dados.item).toMatchObject({
    id: item,
    valorQuestionado: "9999999999999999.99",
    situacao: "em_analise",
  });
  expect(dados.fonte).toMatchObject({
    estado: "ok",
    dados: {
      estado: "REGISTRADA",
      parecerId: parecer,
      arquivoId: arquivo,
      nome: "parecer-segunda-origem.pdf",
      pagina: 3,
    },
  });
  expect(dados.apresentacao).toMatchObject({
    estado: "ok",
    dados: { id: apresentacao, pacoteId: pacote },
  });
  expect(dados.revisoes).toMatchObject({
    estado: "ok",
    dados: [{ id: evento, aprovada: true, tarefaId: tarefa }],
  });
  expect(dados.analises).toMatchObject({
    estado: "ok",
    dados: [{ id: analise, classificacao: "inconclusivo" }],
  });
  expect(dados.desfechos).toMatchObject({
    estado: "ok",
    dados: [{ id: desfecho, tipo: "Validado pelo contratante" }],
  });
  const filtros = chamadas.find((c) => c.path === "apontamentos_contratante")!.url.searchParams;
  expect(Object.fromEntries(filtros)).toMatchObject({
    id: "eq." + item,
    id_ciclo: "eq." + ciclo,
    id_competencia: "eq." + competencia,
    id_contrato: "eq." + contrato,
    id_organizacao: "eq." + org,
  });
  expect(chamadas.find((c) => c.path === "rpc/obter_fonte_apontamento_contratante")?.body).toEqual({
    p_id_ciclo: ciclo,
    p_id_apontamento: item,
  });
});

it("V2-03 distingue a evidencia do pacote de uma versao posterior e rejeita hash divergente", async () => {
  preparar();
  const dados = await consultar();
  expect(dados.evidencias).toMatchObject({
    estado: "ok",
    dados: {
      indisponiveis: 0,
      versoes: [
        { versaoId: antiga, pacote: "incluida" },
        { versaoId: posterior, pacote: "posterior" },
      ],
    },
  });
  preparar({
    itens_pacote_competencia: [
      { ...(endpoints["itens_pacote_competencia"] as object[])[0], hash: "b".repeat(64) },
    ],
  });
  expect((await consultar()).evidencias).toEqual({ estado: "erro" });
});

it("V2-03 bloqueia item invisivel ou cruzado e preserva a negacao explicita", async () => {
  let chamadas = preparar({ apontamentos_contratante: [] });
  await expect(consultar()).rejects.toMatchObject({ tipo: "nao_encontrado" });
  expect(chamadas.map((c) => c.path)).not.toContain("rpc/obter_fonte_apontamento_contratante");
  chamadas = preparar({ apontamentos_contratante: [{ ...row, id_ciclo: outro }] });
  await expect(consultar()).rejects.toMatchObject({ tipo: "erro" });
  expect(chamadas.map((c) => c.path)).not.toContain("analises_apontamentos");
  preparar({ apontamentos_contratante: json({ code: "42501" }, 403) });
  await expect(consultar()).rejects.toMatchObject({ tipo: "sem_permissao" });
});

it("V2-03 distingue origem historica, origem bloqueada e resposta cruzada", async () => {
  let chamadas = preparar({
    "rpc/obter_fonte_apontamento_contratante": {
      ...fonte,
      estado: "ORIGEM_NAO_REGISTRADA",
      fonte: null,
    },
  });
  expect((await consultar()).fonte).toEqual({
    estado: "ok",
    dados: { estado: "ORIGEM_NAO_REGISTRADA" },
  });
  expect(chamadas.map((c) => c.path)).not.toContain("apresentacoes_contratante");
  preparar({ "rpc/obter_fonte_apontamento_contratante": json({ code: "42501" }, 403) });
  expect((await consultar()).fonte).toEqual({ estado: "sem_permissao" });
  chamadas = preparar({
    "rpc/obter_fonte_apontamento_contratante": { ...fonte, id_apontamento: outro },
  });
  expect((await consultar()).fonte).toEqual({ estado: "erro" });
  expect(chamadas.map((c) => c.path)).not.toContain("apresentacoes_contratante");
});

it("V2-03 nao usa versao de outra competencia nem revisao de tarefa sem vinculo", async () => {
  preparar({
    versoes_documento: [
      {
        ...versao(antiga, 1, data),
        documentoCompetencia: {
          ...contexto,
          id: documento,
          id_competencia: outro,
          titulo: "Documento alheio",
        },
      },
    ],
    eventos_auditoria: [{ ...(endpoints["eventos_auditoria"] as object[])[0], id_entidade: outro }],
  });
  const dados = await consultar();
  expect(dados.evidencias).toEqual({ estado: "ok", dados: { versoes: [], indisponiveis: 2 } });
  expect(dados.revisoes).toEqual({ estado: "erro" });
  const ctrl = new AbortController();
  ctrl.abort();
  await expect(consultar(item, ctrl.signal)).rejects.toMatchObject({ name: "AbortError" });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: mock }));

import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";
import {
  consultarEvidenciasElegiveis,
  consultarPlanoAcao,
  consultarPortaoRodada,
  consultarPreferenciasTarefa,
  registrarAcaoTarefa,
  salvarPreferenciaTarefa,
  type DadosTarefa,
} from "@/lib/diligencias/planoAcaoDiligenciaDados";

const uuid = (n: number) => "47000000-0000-4000-8000-" + String(n).padStart(12, "0");
const [
  CICLO,
  COMP,
  CONTRATO,
  ORG,
  ITEM,
  TAREFA,
  USUARIO,
  CORRELACAO,
  EVIDENCIA,
  EXECUCAO,
  ANALISE,
  EVENTO,
] = Array.from({ length: 12 }, (_, i) => uuid(i + 1)) as [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
const escopo = { id: CICLO, id_competencia: COMP, id_contrato: CONTRATO, id_organizacao: ORG };
const sinal = () => new AbortController().signal;
const hash = "a".repeat(64);
const tarefa = {
  id: TAREFA,
  descricao: "Conferir documento",
  id_plano: null,
  responsavel: USUARIO,
  prazo: "2026-12-07",
  tipo_acao: "obter_assinatura",
  prioridade: "critica" as const,
  status: "pendente" as const,
  validacao_solucao: "pendente" as const,
  depende_de: [],
  versao_registro: 1,
  id_execucao: null,
  id_evidencia: null,
  prova: null,
  estado_execucao: null,
  editar: true,
  submeter: true,
  revisar: false,
  aprovar: false,
};
const plano = {
  id_ciclo: CICLO,
  id_apontamento: ITEM,
  total: 1,
  offset: 0,
  limite: 10,
  criar: true,
  perfil_preferencia: "gestor_contrato",
  planos: [],
  dependencias: [],
  tarefas: [tarefa],
  responsaveis: [{ id: USUARIO, nome: "Pessoa sintética" }],
};
const recibo = {
  schema_versao: "v247-v1",
  id_tarefa: TAREFA,
  versao_registro: 2,
  status: "em_execucao",
  validacao_solucao: "pendente",
  id_execucao: null,
  correlation_id: CORRELACAO,
};
const dados: DadosTarefa = {
  descricao: tarefa.descricao,
  prazo: tarefa.prazo,
  responsavel: USUARIO,
  tipo_acao: tarefa.tipo_acao,
  prioridade: "critica",
  depende_de: [],
};
const prova = {
  id_analise: ANALISE,
  id_execucao: EXECUCAO,
  id_tarefa: TAREFA,
  id_apontamento: ITEM,
  id_evidencia: EVIDENCIA,
  classificacao: "procedente",
  confianca: 0.95,
  evidencia_suficiente: true,
  registrado_em: "2026-11-27T10:00:00Z",
};

function responder(data: unknown, error: unknown = null, status = 200) {
  mock.rpc.mockReturnValueOnce({ abortSignal: async () => ({ data, error, status }) });
}

beforeEach(() => {
  mock.rpc.mockReset();
  mock.from.mockReset();
});

describe("V2-04", () => {
  it("consulta escopo, tarefas, capacidades e portao da mesma rodada", async () => {
    responder(plano);
    responder({ total: 1, tratados: 0, abertos: 1, liberado: false });
    await expect(consultarPlanoAcao(escopo, ITEM, 0, sinal())).resolves.toEqual(plano);
    await expect(consultarPortaoRodada(CICLO, sinal())).resolves.toMatchObject({
      liberado: false,
      abertos: 1,
    });
    expect(mock.rpc.mock.calls).toEqual([
      [
        "obter_plano_acao_diligencia_v2",
        {
          p_id_ciclo: CICLO,
          p_id_apontamento: ITEM,
          p_offset: 0,
          p_limite: 10,
        },
      ],
      ["avaliar_portao_reapresentacao", { p_id_ciclo: CICLO }],
    ]);
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("preserva a negacao e recusa plano de outro item ou prova de outra tarefa", async () => {
    responder(null, { code: "42501" }, 403);
    await expect(consultarPlanoAcao(escopo, ITEM, 0, sinal())).rejects.toMatchObject({
      tipo: "sem_permissao",
    });
    for (const invalido of [
      { ...plano, id_apontamento: uuid(99) },
      { ...plano, offset: 10 },
      {
        ...plano,
        tarefas: [
          {
            ...tarefa,
            id_evidencia: EVIDENCIA,
            id_execucao: EXECUCAO,
            prova: { ...prova, id_tarefa: uuid(99) },
          },
        ],
      },
      { ...plano, tarefas: [{ ...tarefa, aprovar: true, revisar: false }] },
    ]) {
      responder(invalido);
      await expect(consultarPlanoAcao(escopo, ITEM, 0, sinal())).rejects.toMatchObject({
        tipo: "erro",
      });
    }
  });

  it("seleciona somente a versao documental vigente da competencia", async () => {
    const comp = { id: COMP, id_contrato: CONTRATO, id_organizacao: ORG };
    const doc = {
      id: uuid(21),
      titulo: "Atesto",
      situacao: "ativo",
      versao_atual: 2,
      versao: { id: EVIDENCIA, numero_versao: 2, hash },
    };
    const payload = {
      competencia: comp,
      documentos_total: 3,
      documentos: [
        doc,
        { ...doc, id: uuid(22), versao_atual: 3 },
        { ...doc, id: uuid(23), situacao: "substituido" },
      ],
    };
    responder(payload);
    await expect(consultarEvidenciasElegiveis(escopo, 0, sinal())).resolves.toEqual({
      total: 3,
      opcoes: [{ id: EVIDENCIA, titulo: "Atesto", numero: 2, hash }],
    });
    expect(mock.rpc.mock.calls[0]?.[0]).toBe("obter_documentos_competencia_v115");
    expect(mock.rpc.mock.calls[0]?.[1]).toMatchObject({
      p_id_competencia: COMP,
      p_documentos_offset: 0,
    });
    responder({ ...payload, competencia: { ...comp, id: uuid(90) } });
    await expect(consultarEvidenciasElegiveis(escopo, 0, sinal())).rejects.toMatchObject({
      tipo: "erro",
    });
  });

  it("encaminha a mesma intencao e verifica versao e correlacao do recibo", async () => {
    responder(recibo);
    responder(recibo);
    const acao = { tipo: "salvar" as const, tarefa, dados };
    for (let i = 0; i < 2; i++)
      await expect(
        registrarAcaoTarefa(escopo, ITEM, acao, "mesma-chave", sinal()),
      ).resolves.toMatchObject({
        correlation_id: CORRELACAO,
      });
    expect(mock.rpc.mock.calls[0]).toEqual(mock.rpc.mock.calls[1]);
    expect(mock.rpc.mock.calls[0]).toEqual([
      "salvar_tarefa_diligencia_v2",
      {
        p_id_ciclo: CICLO,
        p_id_apontamento: ITEM,
        p_id_tarefa: TAREFA,
        p_versao_esperada: 1,
        p_chave_idempotencia: "mesma-chave",
        p_dados: dados,
      },
    ]);
    responder({
      ...recibo,
      id_execucao: EXECUCAO,
      id_evidencia: EVIDENCIA,
      status: "concluida",
      validacao_solucao: "em_analise",
    });
    await expect(
      registrarAcaoTarefa(
        escopo,
        ITEM,
        {
          tipo: "submeter",
          tarefa,
          evidencia: EVIDENCIA,
        },
        "submissao",
        sinal(),
      ),
    ).resolves.toMatchObject({ id_execucao: EXECUCAO });
    expect(mock.rpc.mock.calls[2]).toEqual([
      "submeter_solucao_tarefa_diligencia_v2",
      {
        p_id_tarefa: TAREFA,
        p_versao_esperada: 1,
        p_id_evidencia: EVIDENCIA,
        p_chave_idempotencia: "submissao",
      },
    ]);
    responder({
      ...recibo,
      id_execucao: EXECUCAO,
      id_evidencia: EVIDENCIA,
      versao_registro: 3,
      status: "concluida",
      validacao_solucao: "aprovada",
    });
    await expect(
      registrarAcaoTarefa(
        escopo,
        ITEM,
        {
          tipo: "revisar",
          tarefa: { ...tarefa, versao_registro: 2 },
          aprovar: true,
          fundamento: "Atesto conferido",
        },
        "decisao",
        sinal(),
      ),
    ).resolves.toMatchObject({ validacao_solucao: "aprovada" });
    expect(mock.rpc.mock.calls[3]).toEqual([
      "revisar_solucao_tarefa_diligencia_v2",
      {
        p_id_tarefa: TAREFA,
        p_versao_esperada: 2,
        p_aprovar: true,
        p_fundamento: "Atesto conferido",
        p_chave_idempotencia: "decisao",
      },
    ]);
  });

  it("rejeita conflito, recibo deslocado e chamada cancelada", async () => {
    const acao = { tipo: "salvar" as const, tarefa, dados };
    responder(null, { code: "PT409" }, 409);
    await expect(registrarAcaoTarefa(escopo, ITEM, acao, "chave", sinal())).rejects.toMatchObject({
      tipo: "conflito",
    });
    for (const divergente of [
      { ...recibo, id_tarefa: uuid(93) },
      { ...recibo, versao_registro: 1 },
    ]) {
      responder(divergente);
      await expect(registrarAcaoTarefa(escopo, ITEM, acao, "chave", sinal())).rejects.toMatchObject(
        { tipo: "erro" },
      );
    }
    const c = new AbortController();
    responder(plano);
    c.abort();
    await expect(consultarPlanoAcao(escopo, ITEM, 0, c.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });

  it("conserva preferencia do usuario e rastreia a correlacao na auditoria", async () => {
    const preferencia = {
      evento: "TarefaDiligenciaAtribuida:gestor_contrato",
      canal: "in_app" as const,
      habilitado: false,
    };
    const evento = {
      id: EVENTO,
      criado_em: prova.registrado_em,
      evento: "TarefaDiligenciaCriada",
      entidade: "tarefas_diligencia",
      origem: "usuario",
      id_usuario: USUARIO,
      id_entidade: TAREFA,
      correlation_id: CORRELACAO,
    };
    const encadeado = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      abortSignal: vi
        .fn()
        .mockResolvedValueOnce({ data: [preferencia], error: null, status: 200 })
        .mockResolvedValueOnce({ data: null, error: null, status: 204 }),
      then: (res: (valor: unknown) => unknown) =>
        Promise.resolve({ data: [evento], error: null, count: 1 }).then(res),
    };
    mock.from.mockReturnValue(encadeado);
    await expect(
      consultarPreferenciasTarefa(ORG, USUARIO, "gestor_contrato", sinal()),
    ).resolves.toEqual([preferencia]);
    await salvarPreferenciaTarefa(ORG, USUARIO, preferencia, sinal());
    expect(encadeado.upsert).toHaveBeenCalledWith(
      { ...preferencia, id_organizacao: ORG, id_usuario: USUARIO },
      { onConflict: "id_organizacao,id_usuario,evento,canal" },
    );
    await expect(
      obterEventosAuditoria({
        idOrganizacao: ORG,
        pagina: 0,
        entidade: "tarefas_diligencia",
        correlationId: CORRELACAO,
      }),
    ).resolves.toEqual({ eventos: [evento], total: 1 });
    expect(encadeado.eq).toHaveBeenCalledWith("correlation_id", CORRELACAO);
    expect(mock.from.mock.calls).toEqual([
      ["preferencias_notificacao"],
      ["preferencias_notificacao"],
      ["eventos_auditoria"],
    ]);
  });
});

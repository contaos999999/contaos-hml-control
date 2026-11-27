import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
import {
  consultarContestacoes,
  registrarContestacao,
} from "@/lib/diligencias/contestacaoDiligenciaDados";

const ciclo = "48000000-0000-4000-8000-000000000001";
const item = "48000000-0000-4000-8000-000000000002";
const versao = "48000000-0000-4000-8000-000000000003";
const registro = "48000000-0000-4000-8000-000000000004";
const correlacao = "48000000-0000-4000-8000-000000000005";
const chave = "48000000-0000-4000-8000-000000000006";
const hash = "a".repeat(64);
const painel = {
  id_ciclo: ciclo,
  id_apontamento: item,
  versao_atual: 0,
  versao_apontamento: 1,
  submeter: true,
  solicitar_minuta: true,
  offset: 0,
  limite: 10,
  total: 0,
  contestacoes: [],
  offset_fontes: 0,
  total_fontes: 1,
  fontes: [{ id: versao, titulo: "Comprovante", numero: 1, vigente: true, hash }],
  minuta: null,
};
const recibo = {
  schema_versao: "v248-v1",
  id_contestacao: registro,
  id_apontamento: item,
  versao: 1,
  hash,
  status_aprovacao: "pendente",
  correlation_id: correlacao,
};
const evidencias = [
  {
    id_versao_documento: versao,
    pagina: 2,
    descricao: "Afirmação",
    trecho: "Trecho comprovado",
    hash,
  },
];
const submeter = {
  tipo: "submeter" as const,
  versao: 0,
  texto: "Manifestação",
  fundamento: "Fundamento",
  evidencias,
};
function resposta(data: unknown, code?: string, status = 200) {
  rpc.mockReturnValueOnce({
    abortSignal: vi.fn().mockResolvedValue({ data, status, error: code ? { code } : null }),
  });
}
const signal = () => new AbortController().signal;

describe("V2-05", () => {
  beforeEach(() => rpc.mockReset());

  it("consulta escopo pagina versao e capacidades da fonte oficial", async () => {
    resposta(painel);
    await expect(consultarContestacoes(ciclo, item, 0, 0, signal())).resolves.toEqual(painel);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("obter_contestacoes_v2", {
      p_id_ciclo: ciclo,
      p_id_apontamento: item,
      p_offset: 0,
      p_limite: 10,
      p_offset_fontes: 0,
    });
  });

  it("preserva negacao e rejeita dados de outro apontamento ou pagina", async () => {
    resposta(null, "42501", 403);
    await expect(consultarContestacoes(ciclo, item, 0, 0, signal())).rejects.toMatchObject({
      tipo: "sem_permissao",
    });
    for (const alterado of [
      { id_apontamento: registro },
      { id_ciclo: registro },
      { offset_fontes: 20 },
      { total_fontes: 2 },
    ]) {
      resposta({ ...painel, ...alterado });
      await expect(consultarContestacoes(ciclo, item, 0, 0, signal())).rejects.toMatchObject({
        tipo: "erro",
      });
    }
  });

  it("submete somente o mapa e a versao exata com recibo correlacionado", async () => {
    resposta(recibo);
    await expect(registrarContestacao(item, submeter, chave, signal())).resolves.toEqual({
      tipo: "submeter",
      referencia: correlacao,
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("salvar_contestacao_v2", {
      p_id_apontamento: item,
      p_versao_esperada: 0,
      p_texto: "Manifestação",
      p_fundamento: "Fundamento",
      p_evidencias: evidencias,
      p_chave: chave,
    });
    resposta({ ...recibo, versao: 2 });
    await expect(registrarContestacao(item, submeter, chave, signal())).rejects.toMatchObject({
      tipo: "erro",
    });
  });

  it("confere conflito invalidade e cancelamento antes de aceitar o recibo", async () => {
    resposta(null, "PT409", 409);
    await expect(registrarContestacao(item, submeter, chave, signal())).rejects.toMatchObject({
      tipo: "conflito",
    });
    resposta(null, "PT400", 400);
    await expect(registrarContestacao(item, submeter, chave, signal())).rejects.toMatchObject({
      tipo: "invalido",
    });
    resposta(recibo);
    const controlador = new AbortController();
    controlador.abort();
    await expect(
      registrarContestacao(item, submeter, chave, controlador.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("distingue fila de minuta e aprova exclusivamente a versao revisada", async () => {
    resposta({ id_apontamento: item, versao_esperada: 0, id_execucao: registro });
    await expect(
      registrarContestacao(item, { tipo: "minuta", versao: 0 }, chave, signal()),
    ).resolves.toEqual({ tipo: "minuta", referencia: registro });
    expect(rpc).toHaveBeenNthCalledWith(1, "solicitar_minuta_contestacao_v2", {
      p_id_apontamento: item,
      p_versao_esperada: 0,
      p_chave: chave,
    });
    const revisao = {
      tipo: "revisar" as const,
      id: registro,
      versao: 1,
      aprovar: true,
      fundamento: "Prova conferida",
    };
    resposta({ ...recibo, status_aprovacao: "aprovada" });
    await expect(registrarContestacao(item, revisao, chave, signal())).resolves.toEqual({
      tipo: "revisar",
      referencia: correlacao,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "revisar_contestacao_v2", {
      p_id_contestacao: registro,
      p_versao_esperada: 1,
      p_aprovar: true,
      p_fundamento: "Prova conferida",
      p_chave: chave,
    });
    resposta({ ...recibo, id_contestacao: versao, status_aprovacao: "aprovada" });
    await expect(registrarContestacao(item, revisao, chave, signal())).rejects.toMatchObject({
      tipo: "erro",
    });
  });
});

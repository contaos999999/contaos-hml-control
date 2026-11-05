import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  rpc: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mock.rpc },
}));

import {
  competenciaPrimeiroDia,
  podeFinalizarIngestao,
  validarItemHistorico,
  registrarRelatorioHistorico,
  enfileirarRelatorioHistorico,
  vincularTratamentoHistorico,
  mensagemErroIngestao,
} from "@/lib/contratos/ingestaoHistoricoDados";

const ORG = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const ARQUIVO = "33333333-3333-4333-8333-333333333333";
const RELATORIO = "44444444-4444-4444-8444-444444444444";
const VERSAO = "55555555-5555-4555-8555-555555555555";
beforeEach(() => mock.rpc.mockReset());

describe("PROMPT 43 / V1-22 — ingestão histórica com backend autoritativo", () => {
  it("competência é sempre primeiro dia do mês em ISO, sem deslocamento de fuso", () => {
    expect(competenciaPrimeiroDia("2026-10")).toBe("2026-10-01");
    expect(() => competenciaPrimeiroDia("2026-13")).toThrow();
    expect(() => competenciaPrimeiroDia("2026-02-03")).toThrow();
  });
  it("impede finalizar antes da aprovação de segurança e da leitura documental", () => {
    expect(podeFinalizarIngestao("pendente", "concluido")).toBe(false);
    expect(podeFinalizarIngestao("aprovado", "processando")).toBe(false);
    expect(podeFinalizarIngestao("bloqueado", "concluido")).toBe(false);
    expect(podeFinalizarIngestao("aprovado", "concluido")).toBe(true);
  });
  it("não aceita arquivo de outra organização/contrato/versão", () => {
    expect(validarItemHistorico({ id_organizacao: ORG, id_contrato: CONTRATO, id_arquivo: ARQUIVO, id_versao: VERSAO }, ORG, CONTRATO, ARQUIVO, VERSAO)).toBe(true);
    expect(validarItemHistorico({ id_organizacao: "outro", id_contrato: CONTRATO, id_arquivo: ARQUIVO, id_versao: VERSAO }, ORG, CONTRATO, ARQUIVO, VERSAO)).toBe(false);
  });
  it("registra via RPC oficial e repassa somente parâmetros documentados", async () => {
    mock.rpc.mockResolvedValue({ data: RELATORIO, error: null, status: 200 });
    await expect(registrarRelatorioHistorico(ARQUIVO, "2026-10", "relatorio_contratante")).resolves.toBe(RELATORIO);
    expect(mock.rpc).toHaveBeenCalledWith("registrar_relatorio_historico_hml", {
      p_id_arquivo: ARQUIVO, p_competencia: "2026-10-01", p_tipo: "relatorio_contratante",
    });
  });
  it("enfileira por RPC oficial com relacionamento ao ID de versão", async () => {
    mock.rpc.mockResolvedValue({ data: VERSAO, error: null, status: 200 });
    await enfileirarRelatorioHistorico(RELATORIO, VERSAO);
    expect(mock.rpc).toHaveBeenCalledWith("enfileirar_ingestao_historica_hml", {
      p_id_relatorio: RELATORIO, p_id_versao_documento: VERSAO,
    });
  });
  it("impede tratamento vazio e não cria regras automaticamente", async () => {
    await expect(vincularTratamentoHistorico(RELATORIO, "", "", "")).rejects.toThrow();
    expect(mock.rpc).not.toHaveBeenCalled();
    mock.rpc.mockResolvedValue({ data: { id_resposta: ARQUIVO, id_desfecho: null }, error: null, status: 200 });
    await vincularTratamentoHistorico(RELATORIO, "Resposta fundamentada", "", "");
    expect(mock.rpc).toHaveBeenCalledWith("vincular_tratamento_historico_hml", {
      p_id_apontamento: RELATORIO, p_resposta: "Resposta fundamentada", p_desfecho: null, p_fundamento: null,
    });
  });
  it("traduz erro de autorização para texto amigável, sem apresentar erro bruto/segredo", () => {
    expect(mensagemErroIngestao({ code: "42501", message: "token privado" })).toMatch(/permissão/i);
    expect(mensagemErroIngestao({ code: "42501", message: "token privado" })).not.toMatch(/token privado/);
  });
});

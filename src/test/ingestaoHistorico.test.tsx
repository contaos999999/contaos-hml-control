import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const mock = vi.hoisted(() => ({
  rpc: vi.fn(),
  getUser: vi.fn(),
  navigate: vi.fn(),
  org: vi.fn(),
  orgs: vi.fn(),
  contrato: vi.fn(),
  config: vi.fn(),
  enviar: vi.fn(),
  criarDoc: vi.fn(),
  relatorios: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mock.rpc, auth: { getUser: mock.getUser } },
}));


vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mock.navigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/components/brand/ContaOSMarca", () => ({ ContaOSMarca: () => <span>ContaOS</span> }));
vi.mock("@/lib/organizacao/preferenciaOrganizacao", () => ({
  obterPreferenciaOrganizacao: mock.org,
}));
vi.mock("@/lib/auth/resolverDestinoPosLogin", () => ({
  listarOrganizacoesDisponiveis: mock.orgs,
}));
vi.mock("@/lib/contratos/contratoDetalheDados", () => ({
  uuidValido: (v: string) => /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v),
  uuidCanonico: (v: string) => v.toLowerCase(),
  obterContrato: mock.contrato,
}));
vi.mock("@/lib/contratos/documentosDados", () => ({
  obterConfiguracaoUpload: mock.config,
  enviarArquivoCertificado: mock.enviar,
  criarDocumentoCompleto: mock.criarDoc,
  validarArquivo: () => null,
  aceiteDe: () => ".pdf",
}));
vi.mock("@/lib/contratos/historicoContratoDados", () => ({
  listarRelatoriosHistoricos: mock.relatorios,
  listarApontamentosVinculados: vi.fn(),
  PAGINA_HISTORICO: 25,
}));

import { ImportarHistorico } from "@/components/contratos/ImportarHistorico";
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

describe("PROMPT 43 / V1-22 — interface de lote, só com mocks, sem fluxo HML real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.getUser.mockResolvedValue({ data: { user: { id: ORG } }, error: null });
    mock.org.mockReturnValue(ORG);
    mock.orgs.mockResolvedValue([{
      id: ORG, perfil: "gestor_contrato", situacao: "ativa",
      razao_social: "Organização teste", nome_fantasia: null, cnpj: null,
    }]);
    mock.contrato.mockResolvedValue({
      id: CONTRATO, id_organizacao: ORG, numero: "CT-01", objeto: "Contrato de teste",
    });
    mock.config.mockResolvedValue({
      extensoes: ["pdf"], mimes: ["application/pdf"], maximo: 5242880, limiarResumivel: 1048576,
    });
    mock.relatorios.mockResolvedValue({ itens: [], total: 0 });
    mock.enviar.mockResolvedValue(ARQUIVO);
    mock.criarDoc.mockResolvedValue({
      id_documento: RELATORIO, id_versao: VERSAO, numero_versao: 1, id_arquivo: ARQUIVO,
    });
  });
  it("gestor seleciona vários arquivos e envia o lote em sequência sem processar o worker", async () => {
    const { container } = render(<ImportarHistorico id={CONTRATO} />);
    const seletor = await screen.findByLabelText(/Arquivos históricos/i);
    const a = new File(["conteudo1"], "a.pdf", { type: "application/pdf" });
    const b = new File(["conteudo2"], "b.pdf", { type: "application/pdf" });
    fireEvent.change(seletor, { target: { files: [a, b] } });
    expect(await screen.findByText(/2 arquivo\(s\) selecionado\(s\)/)).toBeTruthy();
    for (const mes of screen.getAllByLabelText(/Competência \(mês\/ano\)/)) {
      fireEvent.change(mes, { target: { value: "2026-10" } });
    }
    fireEvent.click(screen.getByRole("button", { name: /Enviar arquivos pendentes em sequência/ }));
    await waitFor(() => expect(mock.criarDoc).toHaveBeenCalledTimes(2));
    expect(mock.enviar).toHaveBeenCalledTimes(2);
    expect(mock.rpc).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Aguardando segurança e leitura documental");
  });
  it("perfil de leitura não recebe formulário de importação, sem simular isolamento real", async () => {
    mock.orgs.mockResolvedValue([{ id: ORG, perfil: "auditor", situacao: "ativa" }]);
    render(<ImportarHistorico id={CONTRATO} />);
    expect(await screen.findByText(/Seu perfil não possui permissão para importar histórico/)).toBeTruthy();
    expect(screen.queryByLabelText(/Arquivos históricos/i)).toBeNull();
    expect(mock.enviar).not.toHaveBeenCalled();
  });
});

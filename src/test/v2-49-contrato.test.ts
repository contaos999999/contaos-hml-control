import { beforeEach, describe, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), protocolo: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: f.rpc, from: f.from } }));
vi.mock("@/lib/competencias/protocoloDados", () => ({ consultarProtocolo: f.protocolo }));
import {
  consultarReciboReapresentacao,
  liberarRodada,
  listarComprovantes,
  registrarRodada,
} from "@/lib/diligencias/reapresentacaoDiligenciaDados";
import type { CicloDiligencia } from "@/lib/diligencias/diligenciasDados";

const uid = (n: number) => "49000000-0000-4000-8000-" + String(n).padStart(12, "0");
const data = "2026-11-27T12:00:00Z";
const ciclo: CicloDiligencia = {
  id: uid(1),
  id_organizacao: uid(2),
  id_contrato: uid(3),
  id_competencia: uid(4),
  numero_rodada: 2,
  status: "reapresentado",
  recebido_em: data,
  encerrado_em: null,
  prazo_resposta: null,
  versao_registro: 1,
};
const pedido = { protocolo: "P-49", forma: "Portal", comprovante: uid(5) };
const hash = "a".repeat(64);
const signal = () => new AbortController().signal;
function retorno(data: unknown, error: unknown = null, status = 200) {
  return { abortSignal: vi.fn().mockResolvedValue({ data, error, status }) };
}
function tabela(data: unknown[], count = data.length) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
    abortSignal: vi.fn().mockResolvedValue({ data, count, error: null, status: 200 }),
  };
  for (const op of [q.select, q.eq, q.order, q.range, q.limit]) op.mockReturnValue(q);
  f.from.mockReturnValue(q);
  return q;
}

describe("V2-06", () => {
  beforeEach(() => vi.resetAllMocks());

  it("libera exclusivamente pela operação oficial com fundamento", async () => {
    f.rpc.mockReturnValue(
      retorno({
        id_aprovacao: uid(6),
        situacao: "pode_reapresentar_contratante",
        hash_contexto: hash,
      }),
    );
    await expect(liberarRodada(ciclo.id, "  Conferido  ", signal())).resolves.toMatchObject({
      id_aprovacao: uid(6),
    });
    expect(f.rpc).toHaveBeenCalledExactlyOnceWith("liberar_reapresentacao", {
      p_id_ciclo: ciclo.id,
      p_fundamento: "Conferido",
    });
  });

  it("preserva escopo pedido chave e negação do servidor", async () => {
    f.rpc
      .mockReturnValueOnce(retorno(uid(7)))
      .mockReturnValueOnce(retorno(null, { code: "42501" }, 403));
    await expect(registrarRodada(ciclo.id, uid(8), pedido, signal())).resolves.toBe(uid(7));
    expect(f.rpc).toHaveBeenNthCalledWith(1, "registrar_reapresentacao", {
      p_id_ciclo: ciclo.id,
      p_idempotency_key: uid(8),
      p_protocolo: pedido.protocolo,
      p_forma_apresentacao: pedido.forma,
      p_id_comprovante_arquivo: pedido.comprovante,
    });
    await expect(registrarRodada(ciclo.id, uid(8), pedido, signal())).rejects.toMatchObject({
      tipo: "sem_permissao",
    });
    await expect(
      registrarRodada(ciclo.id, uid(8), { ...pedido, protocolo: " " }, signal()),
    ).rejects.toMatchObject({ tipo: "invalido" });
    expect(f.rpc).toHaveBeenCalledTimes(2);
  });

  it("verifica pacote e protocolo da rodada exata", async () => {
    f.protocolo.mockResolvedValue({
      apresentacao: { tipo: "reapresentacao", numero_rodada: 3 },
      pacote: { tipo: "reapresentacao", status: "apresentado", numero: 1, hash_pacote: hash },
    });
    const pacote = {
      id: uid(9),
      id_organizacao: ciclo.id_organizacao,
      id_contrato: ciclo.id_contrato,
      id_competencia: ciclo.id_competencia,
      id_ciclo: ciclo.id,
      numero: 1,
      hash,
      reapresentado_em: data,
    };
    const q = tabela([pacote]);
    await expect(consultarReciboReapresentacao(ciclo, uid(7), signal())).resolves.toMatchObject({
      idPacoteReapresentacao: uid(9),
    });
    expect(q.eq).toHaveBeenCalledWith("id_ciclo", ciclo.id);
    expect(q.eq).toHaveBeenCalledWith("hash", hash);
    tabela([{ ...pacote, id_ciclo: uid(99) }]);
    await expect(consultarReciboReapresentacao(ciclo, uid(7), signal())).rejects.toMatchObject({
      tipo: "conflito",
    });
  });

  it("rejeita comprovante fora do escopo e requisição cancelada", async () => {
    const arquivo = {
      id: uid(5),
      id_organizacao: ciclo.id_organizacao,
      id_contrato: ciclo.id_contrato,
      nome_original: "comprovante.pdf",
      status_seguranca: "aprovado",
    };
    const q = tabela([arquivo]);
    await expect(listarComprovantes(ciclo, 0, signal())).resolves.toEqual({
      dados: [arquivo],
      total: 1,
    });
    expect(q.eq).toHaveBeenCalledWith("status_seguranca", "aprovado");
    tabela([{ ...arquivo, id_contrato: uid(99) }]);
    await expect(listarComprovantes(ciclo, 0, signal())).rejects.toMatchObject({ tipo: "erro" });
    const ctrl = new AbortController();
    ctrl.abort();
    f.rpc.mockReturnValue(retorno(uid(7)));
    await expect(registrarRodada(ciclo.id, uid(8), pedido, ctrl.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});

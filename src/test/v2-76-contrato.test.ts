import { beforeEach, describe, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: f }));
import {
  consultarProcessamentoParecer,
  listarPareceres,
  listarApresentacoesParecer,
  registrarParecer,
} from "@/lib/diligencias/pareceresContratanteDados";

const uid = (n: number) => "76000000-0000-4000-8000-" + String(n).padStart(12, "0");
const data = "2026-11-27T12:00:00Z";
const contexto = { id_organizacao: uid(1), id_contrato: uid(2), id_competencia: uid(3) };
const apresentacao = { ...contexto, id: uid(4), protocolo: "P-76", numero_rodada: 1, apresentado_em: data };
const arquivo = { id: uid(5), id_organizacao: uid(1), id_contrato: uid(2), nome_original: "parecer.pdf", status_seguranca: "aprovado", sha256: "a".repeat(64) };
const parecer = {
  ...contexto, id: uid(6), id_apresentacao: uid(4), id_arquivo: uid(5), id_ciclo: uid(7),
  registrado_por: uid(8), resultado_geral: "Com apontamentos", numero_documento: "76",
  parecer_final_favoravel: false, data_emissao: "2026-11-27", recebido_em: data,
};
const pedido = { apresentacao: uid(4), arquivo: uid(5), resultado: " Com apontamentos ", finalFavoravel: false, numero: "76", emissao: "2026-11-27", prazo: "" };
const signal = () => new AbortController().signal;
function tabela(data: unknown, count = 1) {
  const resposta = { data, count, status: 200, error: null };
  const q = {
    select: vi.fn(), eq: vi.fn(), order: vi.fn(), range: vi.fn(),
    abortSignal: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(resposta),
    then: (resolve: (value: typeof resposta) => unknown) => Promise.resolve(resposta).then(resolve),
  };
  for (const op of [q.select, q.eq, q.order, q.range, q.abortSignal]) op.mockReturnValue(q);
  return q;
}
function rpc(data: unknown, error: unknown = null, status = 200) {
  return { abortSignal: vi.fn().mockResolvedValue({ data, error, status }) };
}
describe("V2-07 contrato", () => {
  beforeEach(() => vi.resetAllMocks());
  it("pagina pareceres e apresentações pelo escopo exato e rejeita resposta cruzada", async () => {
    const q = tabela([parecer]);
    f.from.mockReturnValueOnce(q).mockReturnValueOnce(tabela([apresentacao])).mockReturnValueOnce(tabela([{ ...parecer, id_contrato: uid(99) }]));
    await expect(listarPareceres(contexto, 0, signal())).resolves.toEqual({ itens: [parecer], total: 1 });
    expect(q.eq).toHaveBeenCalledWith("id_organizacao", uid(1));
    expect(q.eq).toHaveBeenCalledWith("id_contrato", uid(2));
    expect(q.eq).toHaveBeenCalledWith("id_competencia", uid(3));
    expect(q.range).toHaveBeenCalledWith(0, 24);
    await expect(listarApresentacoesParecer(contexto, 0, signal())).resolves.toEqual({ itens: [apresentacao], total: 1 });
    await expect(listarPareceres(contexto, 0, signal())).rejects.toMatchObject({ tipo: "sem_permissao" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("registra exclusivamente pela RPC oficial e preserva a intenção em repetição", async () => {
    f.from.mockImplementation((nome: string) => tabela(nome === "arquivos" ? arquivo : apresentacao));
    f.rpc.mockReturnValueOnce(rpc(null, { code: "NETWORK" }, 503)).mockReturnValueOnce(rpc(uid(6)));
    await expect(registrarParecer(contexto, pedido, signal())).rejects.toMatchObject({ tipo: "erro" });
    await expect(registrarParecer(contexto, pedido, signal())).resolves.toBe(uid(6));
    const args = { p_id_competencia: uid(3), p_id_apresentacao: uid(4), p_id_arquivo: uid(5),
      p_resultado_geral: "Com apontamentos", p_parecer_final_favoravel: false, p_numero_documento: "76", p_data_emissao: "2026-11-27" };
    expect(f.rpc).toHaveBeenNthCalledWith(1, "registrar_parecer_contratante", args);
    expect(f.rpc).toHaveBeenNthCalledWith(2, "registrar_parecer_contratante", args);
  });
  it("nega arquivo ou apresentação divergente antes da mutação e preserva 403 e 409", async () => {
    f.from.mockReturnValueOnce(tabela({ ...apresentacao, id_competencia: uid(99) }));
    await expect(registrarParecer(contexto, pedido, signal())).rejects.toMatchObject({ tipo: "sem_permissao" });
    f.from.mockReturnValueOnce(tabela(apresentacao)).mockReturnValueOnce(tabela({ ...arquivo, id_contrato: uid(99) }));
    await expect(registrarParecer(contexto, pedido, signal())).rejects.toMatchObject({ tipo: "sem_permissao" });
    expect(f.rpc).not.toHaveBeenCalled();
    f.from.mockImplementation((nome: string) => tabela(nome === "arquivos" ? arquivo : apresentacao));
    f.rpc.mockReturnValueOnce(rpc(null, { code: "42501" }, 403)).mockReturnValueOnce(rpc(null, { code: "PT409" }, 409));
    await expect(registrarParecer(contexto, pedido, signal())).rejects.toMatchObject({ tipo: "sem_permissao" });
    await expect(registrarParecer(contexto, pedido, signal())).rejects.toMatchObject({ tipo: "conflito" });
  });
  it("consulta processamento por RPC sem ler a fila e rejeita recibo divergente", async () => {
    const resultado = { id_parecer: uid(6), id_ciclo: uid(7), id_competencia: uid(3), status: "enfileirado",
      tentativas: 0, iniciado_em: null, concluido_em: null, atualizado_em: data, correlation_id: uid(9) };
    f.rpc.mockReturnValueOnce(rpc(resultado)).mockReturnValueOnce(rpc({ ...resultado, id_parecer: uid(99) }));
    await expect(consultarProcessamentoParecer(contexto, parecer, signal())).resolves.toEqual(resultado);
    expect(f.rpc).toHaveBeenCalledWith("obter_processamento_parecer_v2", { p_id_competencia: uid(3), p_id_parecer: uid(6) });
    await expect(consultarProcessamentoParecer(contexto, parecer, signal())).rejects.toMatchObject({ tipo: "erro" });
    expect(f.from).not.toHaveBeenCalled();
    const ctrl = new AbortController(); ctrl.abort();
    await expect(consultarProcessamentoParecer(contexto, parecer, ctrl.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(f.rpc).toHaveBeenCalledTimes(2);
  });
});

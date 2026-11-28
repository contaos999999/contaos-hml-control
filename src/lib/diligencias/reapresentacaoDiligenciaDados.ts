import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import {
  classificarErroApresentacao,
  ErroApresentacao,
} from "@/lib/competencias/apresentacaoDados";
import { obterVisaoGeral, parseVisaoGeral } from "@/lib/competencias/competenciaVisaoGeralDados";
import { consultarProtocolo } from "@/lib/competencias/protocoloDados";
import { uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { sha256Diligencia } from "@/lib/diligencias/apontamentoEvidenciasDados";
import { consultarEscopoCicloDiligencia } from "@/lib/diligencias/cicloDiligenciaDados";
import { instante, type CicloDiligencia } from "@/lib/diligencias/diligenciasDados";
import { consultarPortaoRodada } from "@/lib/diligencias/planoAcaoDiligenciaDados";

const id = z.string().refine(uuidValido);
const hash = z.string().refine(sha256Diligencia);
const escopo = z.object({ id_organizacao: id, id_contrato: id });
const arquivo = escopo.extend({
  id,
  nome_original: z.string().min(1),
  status_seguranca: z.literal("aprovado"),
});
const pacote = escopo.extend({
  id,
  id_competencia: id,
  id_ciclo: id,
  numero: z.number().int().positive(),
  hash,
  reapresentado_em: z.string().refine(instante),
});
const liberacao = z.object({
  id_aprovacao: id,
  situacao: z.literal("pode_reapresentar_contratante"),
  hash_contexto: hash,
});
export const PAGINA_COMPROVANTES = 20;
export type PedidoReapresentacao = { protocolo: string; forma: string; comprovante: string };

function verificar<T>(
  schema: z.ZodType<T>,
  resposta: { data: unknown; error: unknown; status?: number | undefined },
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  if (resposta.error) {
    const erro = resposta.error as { code?: string; message?: string };
    if (erro.code === "PT400") throw new ErroApresentacao("invalido");
    if (erro.code === "P0001")
      throw new ErroApresentacao(
        /perfil|acesso|não autenticado/i.test(erro.message ?? "") ? "sem_permissao" : "conflito",
      );
    throw new ErroApresentacao(classificarErroApresentacao(erro, resposta.status));
  }
  const valor = schema.safeParse(resposta.data);
  if (!valor.success) throw new ErroApresentacao("erro");
  return valor.data;
}

function mesmoEscopo(linha: z.infer<typeof escopo>, ciclo: CicloDiligencia) {
  return linha.id_organizacao === ciclo.id_organizacao && linha.id_contrato === ciclo.id_contrato;
}

async function idRodada(ciclo: CicloDiligencia, nova: boolean, signal: AbortSignal) {
  let q = supabase
    .from("apresentacoes_contratante")
    .select("id")
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("id_competencia", ciclo.id_competencia)
    .eq("numero_rodada", ciclo.numero_rodada + Number(nova));
  if (nova) q = q.eq("tipo", "reapresentacao");
  const r = verificar(
    z.array(z.object({ id })).max(1),
    await q.limit(2).abortSignal(signal),
    signal,
  );
  return r[0]?.id;
}

export async function consultarReciboReapresentacao(
  ciclo: CicloDiligencia,
  apresentacao: string,
  signal: AbortSignal,
) {
  const r = await consultarProtocolo(
    ciclo.id_competencia,
    apresentacao,
    ciclo.id_organizacao,
    ciclo.id_contrato,
    0,
    signal,
  );
  if (
    !r ||
    r.apresentacao.tipo !== "reapresentacao" ||
    r.apresentacao.numero_rodada !== ciclo.numero_rodada + 1 ||
    r.pacote.tipo !== "reapresentacao" ||
    r.pacote.status !== "apresentado"
  )
    throw new ErroApresentacao("conflito");
  const oficiais = verificar(
    z.array(pacote).length(1),
    await supabase
      .from("pacotes_reapresentacao")
      .select("id,id_organizacao,id_contrato,id_competencia,id_ciclo,numero,hash,reapresentado_em")
      .eq("id_organizacao", ciclo.id_organizacao)
      .eq("id_contrato", ciclo.id_contrato)
      .eq("id_competencia", ciclo.id_competencia)
      .eq("id_ciclo", ciclo.id)
      .eq("hash", r.pacote.hash_pacote)
      .eq("numero", r.pacote.numero)
      .limit(2)
      .abortSignal(signal),
    signal,
  );
  const original = oficiais[0];
  if (
    !original ||
    !mesmoEscopo(original, ciclo) ||
    original.id_competencia !== ciclo.id_competencia ||
    original.id_ciclo !== ciclo.id ||
    original.numero !== r.pacote.numero ||
    original.hash !== r.pacote.hash_pacote
  )
    throw new ErroApresentacao("conflito");
  return { ...r, idPacoteReapresentacao: original.id };
}

export async function abrirReapresentacao(
  cicloId: string,
  organizacao: string,
  signal: AbortSignal,
) {
  const ciclo = await consultarEscopoCicloDiligencia(cicloId, organizacao, signal);
  const geral = parseVisaoGeral(
    verificar(z.unknown(), await obterVisaoGeral(ciclo.id_competencia, signal), signal),
  );
  if (
    !geral ||
    geral.competencia.id !== ciclo.id_competencia ||
    !mesmoEscopo(geral.competencia, ciclo)
  )
    throw new ErroApresentacao("erro");
  if (!geral.allowed_actions.apresentar) throw new ErroApresentacao("sem_permissao");
  const [portao, anterior] = await Promise.all([
    consultarPortaoRodada(ciclo.id, signal),
    idRodada(ciclo, false, signal),
  ]);
  if (
    portao.tratados + portao.abertos !== portao.total ||
    portao.liberado !== (portao.total > 0 && portao.abertos === 0)
  )
    throw new ErroApresentacao("erro");
  const finalizado = ciclo.status === "reapresentado" || ciclo.status === "encerrado";
  const emitido = finalizado ? await idRodada(ciclo, true, signal) : undefined;
  const recibo = emitido ? await consultarReciboReapresentacao(ciclo, emitido, signal) : undefined;
  return { ciclo, geral, portao, anterior, recibo, finalizado };
}

export type Reapresentacao = Awaited<ReturnType<typeof abrirReapresentacao>>;

export async function listarComprovantes(
  ciclo: CicloDiligencia,
  offset: number,
  signal: AbortSignal,
) {
  const r = await supabase
    .from("arquivos")
    .select("id,nome_original,id_organizacao,id_contrato,status_seguranca", { count: "exact" })
    .eq("id_organizacao", ciclo.id_organizacao)
    .eq("id_contrato", ciclo.id_contrato)
    .eq("status_seguranca", "aprovado")
    .order("criado_em", { ascending: false })
    .order("id")
    .range(offset, offset + PAGINA_COMPROVANTES - 1)
    .abortSignal(signal);
  const dados = verificar(z.array(arquivo).max(PAGINA_COMPROVANTES), r, signal);
  const { count } = r;
  if (
    count === null ||
    !Number.isSafeInteger(count) ||
    count < 0 ||
    dados.length !== Math.max(0, Math.min(PAGINA_COMPROVANTES, count - offset)) ||
    dados.some((item) => !mesmoEscopo(item, ciclo)) ||
    new Set(dados.map((item) => item.id)).size !== dados.length
  )
    throw new ErroApresentacao("erro");
  return { dados, total: count };
}

export async function liberarRodada(ciclo: string, fundamento: string, signal: AbortSignal) {
  if (!uuidValido(ciclo) || !fundamento.trim() || fundamento.length > 4000)
    throw new ErroApresentacao("invalido");
  return verificar(
    liberacao,
    await supabase
      .rpc("liberar_reapresentacao", {
        p_id_ciclo: ciclo,
        p_fundamento: fundamento.trim(),
      })
      .abortSignal(signal),
    signal,
  );
}

export async function registrarRodada(
  ciclo: string,
  chave: string,
  pedido: PedidoReapresentacao,
  signal: AbortSignal,
) {
  const { protocolo, forma, comprovante } = pedido;
  if (
    !uuidValido(ciclo) ||
    !uuidValido(chave) ||
    !protocolo.trim() ||
    !forma.trim() ||
    protocolo.length > 120 ||
    forma.length > 120 ||
    (comprovante && !uuidValido(comprovante))
  )
    throw new ErroApresentacao("invalido");
  return verificar(
    id,
    await supabase
      .rpc("registrar_reapresentacao", {
        p_id_ciclo: ciclo,
        p_idempotency_key: chave,
        p_protocolo: protocolo.trim(),
        p_forma_apresentacao: forma.trim(),
        ...(comprovante ? { p_id_comprovante_arquivo: comprovante } : {}),
      })
      .abortSignal(signal),
    signal,
  );
}

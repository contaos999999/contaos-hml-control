import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

type Resposta = { data: unknown; error: unknown; status?: number; count?: number | null };
const client = supabase as unknown as {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<Resposta>;
};
export type TipoErroRevisao = "negado" | "conflito" | "invalido" | "incerto" | "leitura";
export class ErroRevisao extends Error {
  constructor(public tipo: TipoErroRevisao) {
    super(tipo);
  }
}
const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const uuid = (v: unknown): v is string => typeof v === "string" && uuidValido(v);
const igual = (a: unknown, b: string) => uuid(a) && uuidCanonico(a) === uuidCanonico(b);
const hash = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{64}$/i.test(v);
export type ContextoRevisao = {
  schema_versao: "revisao-v117";
  id_competencia: string;
  id_requisito: string;
  id_organizacao: string;
  id_contrato: string;
  id_execucao_esperada: string | null;
  id_resultado_esperado: string | null;
  hash_esperado: string;
  pode_revisar: boolean;
};
export function parseContextoRevisao(
  v: unknown,
  c: string,
  r: string,
  org: string,
): ContextoRevisao | null {
  if (
    !uuid(c) ||
    !uuid(r) ||
    !uuid(org) ||
    !obj(v) ||
    v["schema_versao"] !== "revisao-v117" ||
    !igual(v["id_competencia"], c) ||
    !igual(v["id_requisito"], r) ||
    !igual(v["id_organizacao"], org) ||
    !uuid(v["id_contrato"]) ||
    typeof v["pode_revisar"] !== "boolean" ||
    !hash(v["hash_esperado"]) ||
    !(v["id_execucao_esperada"] === null || uuid(v["id_execucao_esperada"])) ||
    !(v["id_resultado_esperado"] === null || uuid(v["id_resultado_esperado"])) ||
    (v["pode_revisar"] && !uuid(v["id_execucao_esperada"]))
  )
    return null;
  return v as ContextoRevisao;
}
function tipo(error: unknown, status?: number): TipoErroRevisao {
  const code = obj(error) ? error["code"] : null;
  if (status === 401 || status === 403 || code === "42501" || code === "PGRST301") return "negado";
  if (status === 409 || code === "PT409") return "conflito";
  if (status === 422 || code === "PT422") return "invalido";
  return "incerto";
}
export async function obterContextoRevisao(
  c: string,
  r: string,
  org: string,
): Promise<ContextoRevisao> {
  if (![c, r, org]["every"](uuid)) throw new ErroRevisao("invalido");
  let response: Resposta;
  try {
    response = await client.rpc("obter_contexto_revisao_v117", {
      p_id_competencia: c,
      p_id_requisito: r,
    });
  } catch {
    throw new ErroRevisao("leitura");
  }
  if (response.error)
    throw new ErroRevisao(
      tipo(response.error, response.status) === "negado" ? "negado" : "leitura",
    );
  const ctx = parseContextoRevisao(response.data, c, r, org);
  if (!ctx) throw new ErroRevisao("leitura");
  return ctx;
}
export const RESULTADOS_REVISAO = [
  "pendente",
  "em_analise",
  "conforme",
  "nao_conforme",
  "inconclusivo",
  "nao_aplicavel",
] as const;
export type EvidenciaRevisao = { id_versao_documento: string; pagina?: number; trecho?: string };
export type EntradaRevisao = {
  resultado: string;
  justificativa: string;
  fundamento: string;
  evidencias: unknown[];
};
export type ComandoRevisao = {
  readonly p_id_competencia: string;
  readonly p_id_requisito: string;
  readonly p_id_execucao_esperada: string;
  readonly p_id_resultado_esperado: string | null;
  readonly p_hash_esperado: string;
  readonly p_resultado: string;
  readonly p_justificativa: string;
  readonly p_fundamento: string;
  readonly p_evidencias: ReadonlyArray<Readonly<EvidenciaRevisao>>;
  readonly p_request_id: string;
};
export function montarRevisao(
  ctx: ContextoRevisao,
  input: EntradaRevisao,
  requestId: string,
): ComandoRevisao {
  const bad = (): never => {
    throw new ErroRevisao("invalido");
  };
  if (
    !parseContextoRevisao(ctx, ctx.id_competencia, ctx.id_requisito, ctx.id_organizacao) ||
    !ctx.pode_revisar ||
    !ctx.id_execucao_esperada ||
    !uuid(requestId) ||
    !RESULTADOS_REVISAO.some((x) => x === input.resultado) ||
    typeof input.justificativa !== "string" ||
    input.justificativa.trim().length < 3 ||
    input.justificativa.trim().length > 2000 ||
    typeof input.fundamento !== "string" ||
    input.fundamento.length > 4000 ||
    !Array.isArray(input.evidencias) ||
    input.evidencias.length > 25
  )
    return bad();
  const evidencias = input.evidencias.map((v) => {
    if (
      !obj(v) ||
      Object.keys(v).some((k) => !["id_versao_documento", "pagina", "trecho"]["includes"](k)) ||
      !uuid(v["id_versao_documento"]) ||
      ("pagina" in v &&
        (typeof v["pagina"] !== "number" ||
          !Number.isInteger(v["pagina"]) ||
          v["pagina"] < 1 ||
          v["pagina"] > 9999999)) ||
      ("trecho" in v && (typeof v["trecho"] !== "string" || v["trecho"]["length"] > 4000))
    )
      return bad();
    return Object.freeze({ ...v }) as Readonly<EvidenciaRevisao>;
  });
  if (
    new TextEncoder().encode(JSON.stringify(evidencias)).length > 131072 ||
    (input.resultado === "nao_aplicavel" && (!input.fundamento.trim() || !evidencias.length))
  )
    return bad();
  return Object.freeze({
    p_id_competencia: ctx.id_competencia,
    p_id_requisito: ctx.id_requisito,
    p_id_execucao_esperada: ctx.id_execucao_esperada,
    p_id_resultado_esperado: ctx.id_resultado_esperado,
    p_hash_esperado: ctx.hash_esperado,
    p_resultado: input.resultado,
    p_justificativa: input.justificativa.trim(),
    p_fundamento: input.fundamento,
    p_evidencias: Object.freeze(evidencias),
    p_request_id: requestId,
  });
}
export async function registrarRevisao(cmd: ComandoRevisao): Promise<void> {
  let r: Resposta;
  try {
    r = await client.rpc("registrar_revisao_requisito_v117", { ...cmd });
  } catch {
    throw new ErroRevisao("incerto");
  }
  if (r.error) throw new ErroRevisao(tipo(r.error, r.status));
  const v = r.data;
  if (
    !obj(v) ||
    v["schema_versao"] !== "revisao-v117" ||
    !igual(v["request_id"], cmd.p_request_id) ||
    !igual(v["id_competencia"], cmd.p_id_competencia) ||
    !igual(v["id_requisito"], cmd.p_id_requisito) ||
    !uuid(v["id_execucao"]) ||
    !uuid(v["id_resultado"]) ||
    igual(v["id_execucao"], cmd.p_id_execucao_esperada) ||
    (cmd.p_id_resultado_esperado !== null && igual(v["id_resultado"], cmd.p_id_resultado_esperado))
  )
    throw new ErroRevisao("incerto");
}
export type OpcaoEvidencia = { id: string; nome: string; versao: number };
export async function listarEvidencias(
  ctx: ContextoRevisao,
  pagina: number,
): Promise<{ itens: OpcaoEvidencia[]; total: number; pagina: number }> {
  if (
    !Number.isSafeInteger(pagina) ||
    pagina < 0 ||
    !parseContextoRevisao(ctx, ctx.id_competencia, ctx.id_requisito, ctx.id_organizacao)
  )
    throw new ErroRevisao("invalido");
  try {
    const r = await supabase
      .from("versoes_documento")
      .select(
        "id,numero_versao,id_organizacao,id_contrato,documentos_competencia!inner(id_competencia,titulo,situacao),arquivos!inner(nome_original,status_seguranca)",
        { count: "exact" },
      )
      .eq("id_organizacao", ctx.id_organizacao)
      .eq("id_contrato", ctx.id_contrato)
      .eq("documentos_competencia.id_competencia", ctx.id_competencia)
      .eq("documentos_competencia.situacao", "ativo")
      .eq("arquivos.status_seguranca", "aprovado")
      .order("criado_em", { ascending: false })
      .order("id", { ascending: false })
      .range(pagina * 25, pagina * 25 + 24);
    if (r.error) throw new ErroRevisao(tipo(r.error, r.status) === "negado" ? "negado" : "leitura");
    if (
      !Array.isArray(r.data) ||
      r.data.length > 25 ||
      !Number.isSafeInteger(r.count) ||
      r.count === null ||
      r.count < 0
    )
      throw new ErroRevisao("leitura");
    const itens = (r.data as unknown[]).map((v) => {
      if (
        !obj(v) ||
        !uuid(v["id"]) ||
        !igual(v["id_organizacao"], ctx.id_organizacao) ||
        !igual(v["id_contrato"], ctx.id_contrato) ||
        !obj(v["documentos_competencia"]) ||
        !igual(v["documentos_competencia"]["id_competencia"], ctx.id_competencia) ||
        v["documentos_competencia"]["situacao"] !== "ativo" ||
        !obj(v["arquivos"]) ||
        v["arquivos"]["status_seguranca"] !== "aprovado" ||
        typeof v["arquivos"]["nome_original"] !== "string" ||
        typeof v["numero_versao"] !== "number" ||
        !Number.isSafeInteger(v["numero_versao"]) ||
        v["numero_versao"] < 1
      )
        throw new ErroRevisao("leitura");
      return { id: v["id"], nome: v["arquivos"]["nome_original"], versao: v["numero_versao"] };
    });
    return { itens, total: r.count, pagina };
  } catch (e) {
    if (e instanceof ErroRevisao) throw e;
    throw new ErroRevisao("leitura");
  }
}

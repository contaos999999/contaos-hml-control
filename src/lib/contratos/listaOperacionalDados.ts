import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
export type ContextoLista = { idUsuario: string; idOrganizacao: string; idContrato: string };
export class ErroLista extends Error {
  constructor(public tipo: "negado" | "conflito" | "invalido" | "incerto" | "inconsistente") {
    super(tipo);
  }
}
const uuid = z.string().uuid();
const registro = z.object({ id: uuid, id_organizacao: uuid, id_contrato: uuid });
const header = registro
  .extend({
    nome: z.string().min(1),
    descricao: z.string().nullable(),
    situacao: z.enum(["rascunho", "ativa", "inativa"]),
    versao_registro: z.number().int().positive(),
    versao_atual: z.number().int().nonnegative(),
  })
  .passthrough();
const versao = registro
  .extend({
    id_lista: uuid,
    numero_versao: z.number().int().positive(),
    situacao: z.enum(["rascunho", "publicada", "substituida"]),
    vigencia_inicio: z.string().nullable(),
    vigencia_fim: z.string().nullable(),
  })
  .passthrough();
const item = registro
  .extend({
    id_versao_lista: uuid,
    codigo: z.string(),
    descricao: z.string(),
    categoria: z.string().nullable(),
    obrigatorio: z.boolean(),
    aplicavel: z.boolean(),
    impeditivo: z.boolean(),
    criticidade: z.enum(["baixa", "media", "alta", "critica"]),
    id_fonte_versao: uuid.nullable(),
    regra_validacao: z.record(z.unknown()),
    ordem: z.number().int(),
    pode_remover: z.boolean(),
  })
  .passthrough();
const capacidade = z.object({
  criar_lista: z.boolean(),
  editar_lista: z.boolean(),
  criar_versao: z.boolean(),
  editar_vigencia_rascunho: z.boolean(),
  criar_item: z.boolean(),
  editar_item: z.boolean(),
  remover_item: z.boolean(),
  publicar_versao: z.boolean(),
  encerrar_vigencia: z.boolean(),
  alterar_situacao: z.boolean(),
  descartar_rascunho: z.boolean(),
});
const leitura = z.object({
  schema_versao: z.literal("crud-lista-v1"),
  id_organizacao: uuid,
  id_contrato: uuid,
  lista: header.nullable(),
  versao: versao.nullable(),
  versoes: z.array(versao).max(25),
  itens: z.array(item).max(25),
  total_versoes: z.number().int().nonnegative(),
  total_itens: z.number().int().nonnegative(),
  pagina_versoes: z.number().int().nonnegative(),
  pagina_itens: z.number().int().nonnegative(),
  acoes: capacidade,
  exclusao_lista_permitida: z.literal(false),
  motivo_retencao: z.string().min(1),
  vigencia_fim_minima: z.string().nullable(),
});
export type ListaOperacional = z.infer<typeof leitura>;
export type ItemOperacional = z.infer<typeof item>;
export const ROTULOS_LISTA = {
  criar_lista: "Criar lista",
  editar_lista: "Editar lista",
  criar_versao: "Criar versão",
  editar_vigencia_rascunho: "Editar vigência",
  salvar_item: "Salvar item",
  remover_item: "Remover item",
  publicar_versao: "Publicar versão",
  encerrar_vigencia: "Encerrar vigência",
  alterar_situacao: "Alterar situação",
  descartar_rascunho: "Descartar rascunho",
} as const;
export type AcaoLista = keyof typeof ROTULOS_LISTA;
const campos: Record<AcaoLista, string[]> = {
  criar_lista: ["nome", "descricao", "vigencia_inicio", "vigencia_fim"],
  editar_lista: ["nome", "descricao"],
  criar_versao: ["id_versao_origem", "vigencia_inicio", "vigencia_fim"],
  editar_vigencia_rascunho: ["id_versao", "vigencia_inicio", "vigencia_fim"],
  salvar_item: [
    "id_versao",
    "id_item",
    "codigo",
    "descricao",
    "categoria",
    "obrigatorio",
    "aplicavel",
    "impeditivo",
    "criticidade",
    "id_fonte_versao",
    "regra_validacao",
    "ordem",
  ],
  remover_item: ["id_versao", "id_item"],
  publicar_versao: ["id_versao"],
  encerrar_vigencia: ["id_versao", "vigencia_fim"],
  alterar_situacao: ["situacao"],
  descartar_rascunho: ["id_versao"],
};
export type ComandoLista = {
  p_id_organizacao: string;
  p_id_contrato: string;
  p_id_lista: string | null;
  p_versao_esperada: number | null;
  p_acao: AcaoLista;
  p_payload: Record<string, unknown>;
  p_motivo: string;
  p_request_id: string;
};
function contexto(c: ContextoLista) {
  if (
    !c.idUsuario ||
    !uuid.safeParse(c.idOrganizacao).success ||
    !uuid.safeParse(c.idContrato).success
  )
    throw new ErroLista("invalido");
}
function noContexto(r: { id_organizacao: string; id_contrato: string }, c: ContextoLista) {
  return r.id_organizacao === c.idOrganizacao && r.id_contrato === c.idContrato;
}
type Rpc = (
  nome: "obter_lista_operacional_v1" | "executar_comando_lista_v1",
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: unknown; status?: number }>;
async function rpc(nome: Parameters<Rpc>[0], args: Record<string, unknown>) {
  let r;
  try {
    r = await (supabase.rpc as unknown as Rpc).call(supabase, nome, args);
  } catch {
    throw new ErroLista("incerto");
  }
  if (r.error) {
    const code = (r.error as { code?: string }).code;
    throw new ErroLista(
      r.status === 401 || r.status === 403 || code === "42501"
        ? "negado"
        : r.status === 409 || code === "PT409" || code === "40001"
          ? "conflito"
          : r.status === 422 || code === "PT422"
            ? "invalido"
            : "incerto",
    );
  }
  return r.data;
}
export async function obterLista(
  c: ContextoLista,
  idLista: string | null = null,
  idVersao: string | null = null,
  pv = 0,
  pi = 0,
): Promise<ListaOperacional> {
  contexto(c);
  if (
    (idLista !== null && !uuid.safeParse(idLista).success) ||
    (idVersao !== null && (!idLista || !uuid.safeParse(idVersao).success)) ||
    ![pv, pi].every((v) => Number.isInteger(v) && v >= 0 && v <= 100000)
  )
    throw new ErroLista("invalido");
  const parsed = leitura.safeParse(
    await rpc("obter_lista_operacional_v1", {
      p_id_organizacao: c.idOrganizacao,
      p_id_contrato: c.idContrato,
      p_id_lista: idLista,
      p_id_versao: idVersao,
      p_pagina_versoes: pv,
      p_pagina_itens: pi,
    }),
  );
  if (!parsed.success) throw new ErroLista("inconsistente");
  const d = parsed.data;
  if (
    !noContexto(d, c) ||
    (idLista !== null && d.lista?.id !== idLista) ||
    (idLista === null && d.lista !== null) ||
    (idVersao !== null && d.versao?.id !== idVersao) ||
    d.pagina_versoes !== pv ||
    d.pagina_itens !== pi ||
    (d.lista && !noContexto(d.lista, c)) ||
    (d.versao && (!noContexto(d.versao, c) || d.versao.id_lista !== d.lista?.id)) ||
    d.versoes.some((v) => !noContexto(v, c) || v.id_lista !== d.lista?.id) ||
    d.itens.some((i) => !noContexto(i, c) || i.id_versao_lista !== d.versao?.id) ||
    d.total_versoes < d.versoes.length ||
    d.total_itens < d.itens.length
  )
    throw new ErroLista("inconsistente");
  return d;
}
export function montarComandoLista(
  c: ContextoLista,
  idLista: string | null,
  versaoEsperada: number | null,
  acao: AcaoLista,
  payload: Record<string, unknown>,
  motivo: string,
  requestId: string,
): ComandoLista {
  contexto(c);
  if (
    !Object.hasOwn(campos, acao) ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    !uuid.safeParse(requestId).success ||
    typeof motivo !== "string" ||
    motivo.trim().length < 3 ||
    motivo.trim().length > 2000 ||
    Object.keys(payload).some((k) => !campos[acao].includes(k))
  )
    throw new ErroLista("invalido");
  if (
    acao === "criar_lista"
      ? idLista !== null || versaoEsperada !== null
      : !uuid.safeParse(idLista).success ||
        !Number.isSafeInteger(versaoEsperada) ||
        Number(versaoEsperada) < 1
  )
    throw new ErroLista("invalido");
  for (const [k, v] of Object.entries(payload)) {
    if (k.startsWith("id_") && v !== null && !uuid.safeParse(v).success)
      throw new ErroLista("invalido");
    if (
      k.startsWith("vigencia_") &&
      v !== null &&
      (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v))
    )
      throw new ErroLista("invalido");
    if (["obrigatorio", "aplicavel", "impeditivo"].includes(k) && typeof v !== "boolean")
      throw new ErroLista("invalido");
    if (k === "ordem" && !Number.isSafeInteger(v)) throw new ErroLista("invalido");
    if (
      k === "regra_validacao" &&
      (!v || typeof v !== "object" || Array.isArray(v) || JSON.stringify(v).length > 65536)
    )
      throw new ErroLista("invalido");
    if (
      ["nome", "codigo", "descricao", "categoria"].includes(k) &&
      v !== null &&
      typeof v !== "string"
    )
      throw new ErroLista("invalido");
  }
  if (acao === "criar_lista" && (typeof payload["nome"] !== "string" || !payload["nome"].trim()))
    throw new ErroLista("invalido");
  if (
    [
      "editar_vigencia_rascunho",
      "salvar_item",
      "remover_item",
      "publicar_versao",
      "encerrar_vigencia",
      "descartar_rascunho",
    ].includes(acao) &&
    !uuid.safeParse(payload["id_versao"]).success
  )
    throw new ErroLista("invalido");
  if (acao === "remover_item" && !uuid.safeParse(payload["id_item"]).success)
    throw new ErroLista("invalido");
  if (acao === "alterar_situacao" && !["ativa", "inativa"].includes(String(payload["situacao"])))
    throw new ErroLista("invalido");
  return {
    p_id_organizacao: c.idOrganizacao,
    p_id_contrato: c.idContrato,
    p_id_lista: idLista,
    p_versao_esperada: versaoEsperada,
    p_acao: acao,
    p_payload: structuredClone(payload),
    p_motivo: motivo.trim(),
    p_request_id: requestId,
  };
}
export async function executarComandoLista(
  c: ContextoLista,
  cmd: ComandoLista,
): Promise<{ lista: z.infer<typeof header>; id_versao: string | null }> {
  const canonical = montarComandoLista(
    c,
    cmd.p_id_lista,
    cmd.p_versao_esperada,
    cmd.p_acao,
    cmd.p_payload,
    cmd.p_motivo,
    cmd.p_request_id,
  );
  if (
    cmd.p_id_organizacao !== c.idOrganizacao ||
    cmd.p_id_contrato !== c.idContrato ||
    Object.keys(cmd).some((k) => !(k in canonical))
  )
    throw new ErroLista("invalido");
  const parsed = z
    .object({
      schema_versao: z.literal("crud-lista-v1"),
      acao: z.string(),
      id_organizacao: uuid,
      id_contrato: uuid,
      lista: header,
      id_versao: uuid.nullable(),
      request_id: uuid,
      evento_id: uuid,
    })
    .safeParse(await rpc("executar_comando_lista_v1", canonical));
  if (!parsed.success) throw new ErroLista("incerto");
  const d = parsed.data;
  if (
    !noContexto(d, c) ||
    !noContexto(d.lista, c) ||
    d.acao !== cmd.p_acao ||
    d.request_id !== cmd.p_request_id ||
    (cmd.p_id_lista && d.lista.id !== cmd.p_id_lista) ||
    d.lista.versao_registro !== (cmd.p_versao_esperada === null ? 1 : cmd.p_versao_esperada + 1)
  )
    throw new ErroLista("incerto");
  return d;
}

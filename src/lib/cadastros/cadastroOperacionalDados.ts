import { supabase } from "@/integrations/supabase/client";

export type EntidadeCadastro = "organizacoes" | "contratos";
export type ContextoCadastro = {
  idUsuario: string;
  idOrganizacao: string;
  entidade: EntidadeCadastro;
  id: string;
};
export type RegistroCadastro = Record<string, string | number | null> & {
  id: string;
  id_organizacao: string;
  situacao: string;
  versao_registro: number;
};
export type CadastroOperacional = {
  schema_versao: "crud-cadastro-v1";
  entidade: EntidadeCadastro;
  registro: RegistroCadastro;
  pode_editar: boolean;
  transicoes: { situacao: string; rotulo: string }[];
  exclusao_permitida: false;
  motivo_retencao: string;
};
export class ErroCadastro extends Error {
  constructor(public tipo: "negado" | "conflito" | "invalido" | "incerto" | "inconsistente") {
    super(tipo);
  }
}
export const CAMPOS_CADASTRO: Record<
  EntidadeCadastro,
  { nome: string; rotulo: string; tipo: "text" | "date" | "number"; obrigatorio?: boolean }[]
> = {
  organizacoes: [
    { nome: "razao_social", rotulo: "Razão social", tipo: "text", obrigatorio: true },
    { nome: "nome_fantasia", rotulo: "Nome fantasia", tipo: "text" },
    { nome: "cnpj", rotulo: "CNPJ", tipo: "text" },
  ],
  contratos: [
    { nome: "numero", rotulo: "Número", tipo: "text", obrigatorio: true },
    { nome: "objeto", rotulo: "Objeto", tipo: "text", obrigatorio: true },
    { nome: "tipo_contrato", rotulo: "Tipo de contrato", tipo: "text" },
    { nome: "unidade_vinculada", rotulo: "Unidade vinculada", tipo: "text" },
    { nome: "fonte_recurso", rotulo: "Fonte de recurso", tipo: "text" },
    { nome: "inicio", rotulo: "Data de início", tipo: "date", obrigatorio: true },
    { nome: "fim", rotulo: "Data de término", tipo: "date" },
    { nome: "valor_global", rotulo: "Valor global", tipo: "number" },
    { nome: "valor_mensal_referencia", rotulo: "Valor mensal de referência", tipo: "number" },
    { nome: "periodicidade", rotulo: "Periodicidade", tipo: "text", obrigatorio: true },
    { nome: "prazo_prestacao_dias", rotulo: "Prazo de prestação em dias", tipo: "number" },
    { nome: "dia_limite_apresentacao", rotulo: "Dia-limite de apresentação", tipo: "number" },
    { nome: "criticidade", rotulo: "Criticidade", tipo: "text", obrigatorio: true },
  ],
};
const estados: Record<EntidadeCadastro, string[]> = {
  organizacoes: ["ativa", "inativa", "suspensa"],
  contratos: ["rascunho", "ativo", "suspenso", "encerrado", "cancelado"],
};
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const objeto = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
function validarContexto(c: ContextoCadastro) {
  if (
    !c.idUsuario ||
    !uuid(c.idOrganizacao) ||
    !uuid(c.id) ||
    (c.entidade !== "organizacoes" && c.entidade !== "contratos") ||
    (c.entidade === "organizacoes" && c.id !== c.idOrganizacao)
  )
    throw new ErroCadastro("invalido");
}
function lerCadastro(data: unknown, c: ContextoCadastro): CadastroOperacional {
  if (
    !objeto(data) ||
    data["schema_versao"] !== "crud-cadastro-v1" ||
    data["entidade"] !== c.entidade ||
    !objeto(data["registro"])
  )
    throw new ErroCadastro("inconsistente");
  const r = data["registro"];
  if (
    r["id"] !== c.id ||
    r["id_organizacao"] !== c.idOrganizacao ||
    !Number.isSafeInteger(r["versao_registro"]) ||
    Number(r["versao_registro"]) < 1 ||
    typeof r["situacao"] !== "string" ||
    !estados[c.entidade].includes(r["situacao"]) ||
    typeof data["pode_editar"] !== "boolean" ||
    data["exclusao_permitida"] !== false ||
    typeof data["motivo_retencao"] !== "string" ||
    !data["motivo_retencao"].trim()
  )
    throw new ErroCadastro("inconsistente");
  for (const f of CAMPOS_CADASTRO[c.entidade]) {
    const v = r[f.nome];
    if (
      v !== null &&
      (f.tipo === "number" ? typeof v !== "number" || !Number.isFinite(v) : typeof v !== "string")
    )
      throw new ErroCadastro("inconsistente");
    if (f.obrigatorio && (v === null || (typeof v === "string" && !v.trim())))
      throw new ErroCadastro("inconsistente");
  }
  if (
    !Array.isArray(data["transicoes"]) ||
    !data["transicoes"].every(
      (t) =>
        objeto(t) &&
        typeof t["situacao"] === "string" &&
        estados[c.entidade].includes(t["situacao"]) &&
        typeof t["rotulo"] === "string" &&
        t["rotulo"].trim(),
    ) ||
    new Set(data["transicoes"].map((t) => t["situacao"])).size !== data["transicoes"].length ||
    (!data["pode_editar"] && data["transicoes"].length > 0)
  )
    throw new ErroCadastro("inconsistente");
  return data as CadastroOperacional;
}
type NomeRpc =
  | "obter_cadastro_operacional_v1"
  | "atualizar_organizacao_v1"
  | "alterar_situacao_organizacao_v1"
  | "atualizar_contrato_v1"
  | "alterar_situacao_contrato_v1";
type Rpc = (
  nome: NomeRpc,
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: unknown; status: number }>;
async function chamar(nome: NomeRpc, args: Record<string, unknown>) {
  let r;
  try {
    r = await (supabase.rpc as unknown as Rpc).call(supabase, nome, args);
  } catch {
    throw new ErroCadastro("incerto");
  }
  if (r["error"]) {
    const code = objeto(r["error"]) ? r["error"]["code"] : null;
    throw new ErroCadastro(
      r["status"] === 401 || r["status"] === 403 || code === "42501"
        ? "negado"
        : r["status"] === 409 || code === "PT409" || code === "40001"
          ? "conflito"
          : r["status"] === 422 || code === "PT422"
            ? "invalido"
            : "incerto",
    );
  }
  return r["data"];
}
export async function obterCadastro(c: ContextoCadastro): Promise<CadastroOperacional> {
  validarContexto(c);
  return lerCadastro(
    await chamar("obter_cadastro_operacional_v1", {
      p_id_organizacao: c.idOrganizacao,
      p_entidade: c.entidade,
      p_id: c.id,
    }),
    c,
  );
}
export type ComandoCadastro = {
  nome: Exclude<NomeRpc, "obter_cadastro_operacional_v1">;
  args: Record<string, unknown>;
};
export function montarComando(
  c: ContextoCadastro,
  versao: number,
  acao: "editar" | "situacao",
  alteracoes: Record<string, unknown>,
  motivo: string,
  requestId: string,
): ComandoCadastro {
  validarContexto(c);
  if (
    !Number.isSafeInteger(versao) ||
    versao < 1 ||
    !uuid(requestId) ||
    typeof motivo !== "string" ||
    motivo.trim().length < 3 ||
    motivo.trim().length > 2000 ||
    !["editar", "situacao"].includes(acao) ||
    !objeto(alteracoes) ||
    !Object.keys(alteracoes).length
  )
    throw new ErroCadastro("invalido");
  const permitidos =
    acao === "situacao" ? ["situacao"] : CAMPOS_CADASTRO[c.entidade].map((f) => f.nome);
  if (
    Object.keys(alteracoes).some((k) => !permitidos.includes(k)) ||
    (acao === "situacao" && !estados[c.entidade].includes(String(alteracoes["situacao"])))
  )
    throw new ErroCadastro("invalido");
  if (acao === "editar")
    for (const [nome, valor] of Object.entries(alteracoes)) {
      const f = CAMPOS_CADASTRO[c.entidade].find((campo) => campo.nome === nome)!;
      if (
        valor === null
          ? f.obrigatorio
          : f.tipo === "number"
            ? typeof valor !== "number" || !Number.isFinite(valor)
            : typeof valor !== "string" ||
              (f.obrigatorio && !valor.trim()) ||
              (f.tipo === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(valor))
      )
        throw new ErroCadastro("invalido");
    }
  const args: Record<string, unknown> = {
    p_id_organizacao: c.idOrganizacao,
    p_versao_esperada: versao,
    p_motivo: motivo.trim(),
    p_request_id: requestId,
  };
  if (c.entidade === "contratos") args["p_id_contrato"] = c.id;
  if (acao === "editar") args["p_alteracoes"] = alteracoes;
  else args["p_situacao"] = alteracoes["situacao"];
  const nome =
    c.entidade === "organizacoes"
      ? acao === "editar"
        ? "atualizar_organizacao_v1"
        : "alterar_situacao_organizacao_v1"
      : acao === "editar"
        ? "atualizar_contrato_v1"
        : "alterar_situacao_contrato_v1";
  return { nome, args };
}
export async function executarComando(
  c: ContextoCadastro,
  comando: ComandoCadastro,
): Promise<CadastroOperacional> {
  validarContexto(c);
  const a = comando.args;
  if (
    !objeto(a) ||
    a["p_id_organizacao"] !== c.idOrganizacao ||
    (c.entidade === "contratos" && a["p_id_contrato"] !== c.id) ||
    typeof a["p_versao_esperada"] !== "number" ||
    typeof a["p_motivo"] !== "string" ||
    !uuid(a["p_request_id"])
  )
    throw new ErroCadastro("invalido");
  const acao =
    comando.nome === "alterar_situacao_organizacao_v1" ||
    comando.nome === "alterar_situacao_contrato_v1"
      ? "situacao"
      : "editar";
  const patch = acao === "situacao" ? { situacao: a["p_situacao"] } : a["p_alteracoes"];
  if (!objeto(patch)) throw new ErroCadastro("invalido");
  const canonico = montarComando(
    c,
    a["p_versao_esperada"],
    acao,
    patch,
    a["p_motivo"],
    a["p_request_id"],
  );
  if (canonico.nome !== comando.nome || Object.keys(a).some((k) => !(k in canonico.args)))
    throw new ErroCadastro("invalido");
  const data = await chamar(canonico.nome, canonico.args);
  try {
    const cadastro = lerCadastro(data, c);
    if (
      !objeto(data) ||
      data["request_id"] !== comando.args["p_request_id"] ||
      !uuid(data["evento_id"]) ||
      cadastro.registro.versao_registro !== Number(comando.args["p_versao_esperada"]) + 1
    )
      throw new ErroCadastro("incerto");
    return cadastro;
  } catch {
    throw new ErroCadastro("incerto");
  }
}

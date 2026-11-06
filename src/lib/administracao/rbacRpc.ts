import { supabase } from "@/integrations/supabase/client";

export type AcaoRbac = { recurso: string; acao: string };
export type PermissaoPerfil = AcaoRbac & { perfil: string; permitido: boolean };
export type MatrizRbac = {
  schema_versao: "rbac-v1";
  versao: number;
  permissoes: PermissaoPerfil[];
};
export type PermissoesEfetivas = {
  schema_versao: "rbac-v1";
  versao: number;
  master: boolean;
  permissoes: AcaoRbac[];
};
export type ResultadoRbac = {
  schema_versao: "rbac-v1";
  versao: number;
  request_id: string;
  evento_id: string;
};
export const PERFIS_RBAC = [
  "administrador",
  "auditor",
  "contabilidade",
  "direcao_aprovador",
  "financeiro",
  "gestor_contrato",
  "juridico_conformidade",
  "leitor",
  "prestacao_contas",
  "rh_dp",
] as const;
const CATALOGO: Record<string, string[]> = {
  organizacoes: ["consultar", "administrar"],
  usuarios: ["consultar", "administrar"],
  auditoria: ["consultar"],
  contratantes: ["consultar", "criar", "editar"],
  contratos: ["consultar", "criar", "editar"],
  orcamentos: ["consultar", "criar", "editar", "aprovar"],
  normativos: ["consultar", "criar", "editar", "aprovar"],
  listas: ["consultar", "criar", "editar"],
  documentos_contrato: ["consultar", "criar", "editar"],
  documentos_competencia: ["consultar", "criar", "editar"],
  competencias: ["consultar", "criar"],
  analises: ["consultar", "criar", "processar", "editar"],
  pareceres: ["consultar", "criar", "aprovar"],
  apresentacoes: ["consultar", "aprovar", "apresentar"],
  historico: ["consultar", "criar", "editar", "processar"],
  arquivos: ["consultar", "criar", "editar"],
  dashboard: ["consultar"],
};
const pares = new Set(Object.entries(CATALOGO).flatMap(([r, a]) => a.map((x) => `${r}/${x}`)));
export class ErroRbac extends Error {
  constructor(public tipo: "negado" | "conflito" | "erro") {
    super(tipo);
  }
}
type Rpc = (
  nome:
    "obter_matriz_rbac_master" | "atualizar_matriz_rbac_master" | "consultar_permissoes_efetivas",
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: unknown; status: number }>;
const objeto = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const versaoValida = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v > 0;
function acaoValida(v: unknown): v is AcaoRbac {
  return (
    objeto(v) &&
    typeof v["recurso"] === "string" &&
    typeof v["acao"] === "string" &&
    pares.has(`${v["recurso"]}/${v["acao"]}`)
  );
}
function permissaoValida(v: unknown): v is PermissaoPerfil {
  if (!objeto(v)) return false;
  const perfil = v["perfil"];
  const permitido = v["permitido"];
  return (
    acaoValida(v) &&
    typeof perfil === "string" &&
    PERFIS_RBAC.some((p) => p === perfil) &&
    typeof permitido === "boolean"
  );
}
async function chamar(
  nome: Parameters<Rpc>[0],
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let r;
  try {
    r = await (supabase.rpc as unknown as Rpc).call(supabase, nome, args);
  } catch {
    throw new ErroRbac("erro");
  }
  if (r.error) {
    const code = objeto(r.error) ? r.error["code"] : null;
    throw new ErroRbac(
      r.status === 401 || r.status === 403 || code === "42501"
        ? "negado"
        : code === "PT409"
          ? "conflito"
          : "erro",
    );
  }
  if (!objeto(r.data) || r.data["schema_versao"] !== "rbac-v1" || !versaoValida(r.data["versao"]))
    throw new ErroRbac("erro");
  return r.data;
}
export async function obterMatrizRbac(): Promise<MatrizRbac> {
  const r = await chamar("obter_matriz_rbac_master", {});
  if (!Array.isArray(r["permissoes"]) || r["permissoes"].length !== 480) throw new ErroRbac("erro");
  const vistos = new Set<string>();
  for (const p of r["permissoes"]) {
    if (!permissaoValida(p)) throw new ErroRbac("erro");
    const chave = `${p.perfil}/${p.recurso}/${p.acao}`;
    if (vistos.has(chave)) throw new ErroRbac("erro");
    vistos.add(chave);
  }
  return r as MatrizRbac;
}
export async function atualizarMatrizRbac(
  versao: number,
  requestId: string,
  alteracoes: PermissaoPerfil[],
): Promise<ResultadoRbac> {
  const r = await chamar("atualizar_matriz_rbac_master", {
    p_versao_esperada: versao,
    p_request_id: requestId,
    p_alteracoes: alteracoes,
  });
  if (
    r["request_id"] !== requestId ||
    typeof r["evento_id"] !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r["evento_id"])
  )
    throw new ErroRbac("erro");
  return r as ResultadoRbac;
}
export async function consultarPermissoesEfetivas(
  org: string,
  contrato: string | null,
): Promise<PermissoesEfetivas> {
  const r = await chamar("consultar_permissoes_efetivas", {
    p_id_organizacao: org,
    p_id_contrato: contrato,
  });
  if (
    typeof r["master"] !== "boolean" ||
    !Array.isArray(r["permissoes"]) ||
    !r["permissoes"].every(acaoValida) ||
    new Set(r["permissoes"].map((p) => `${p.recurso}/${p.acao}`)).size !== r["permissoes"].length
  )
    throw new ErroRbac("erro");
  return r as PermissoesEfetivas;
}
export function temPermissao(permissoes: AcaoRbac[], recurso: string, acao: string) {
  return permissoes.some((p) => p.recurso === recurso && p.acao === acao);
}
export type ContextoRbac = {
  contrato: string | null;
  competencia: string | null;
  contratante: string | null;
};
export async function resolverContextoRbac(pathname: string, org: string): Promise<ContextoRbac> {
  const c: ContextoRbac = { contrato: null, competencia: null, contratante: null };
  const m =
    /^\/(contratos|competencias|contratantes)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i.exec(
      pathname,
    );
  if (!m || !m[2]) return c;
  const id = m[2];
  if (m[1] === "contratos") c.contrato = id;
  else if (m[1] === "contratantes") c.contratante = id;
  else {
    const { data, error } = await supabase
      .from("competencias")
      .select("id_contrato")
      .eq("id", id)
      .eq("id_organizacao", org)
      .maybeSingle();
    if (error || !data?.id_contrato) throw new ErroRbac("negado");
    c.competencia = id;
    c.contrato = data.id_contrato;
  }
  return c;
}

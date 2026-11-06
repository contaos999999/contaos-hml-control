/**
 * P0 V1 / ADM-01: transporte da matriz RBAC persistente.
 * O Supabase HML decide MASTER, tenant, versionamento e auditoria; a UI não autoriza.
 * PLAN #178, GATE #179/#180. Não regenerar o arquivo de tipos congelados.
 */
import { supabase } from "@/integrations/supabase/client";

export type PermissaoPerfil = {
  perfil: string;
  recurso: string;
  acao: string;
  permitido: boolean;
};
export type MatrizRbac = {
  schema_versao: "rbac-v1";
  versao: number;
  permissoes: PermissaoPerfil[];
};
export type ResultadoRbac = {
  schema_versao: "rbac-v1";
  versao: number;
  request_id: string;
  evento_id: string;
};
export type TipoErroRbac = "negado" | "conflito" | "validacao" | "indisponivel" | "contrato";
export class ErroRbac extends Error {
  constructor(public readonly tipo: TipoErroRbac) {
    super(tipo);
    this.name = "ErroRbac";
  }
}

type RpcResult = { data: unknown; error: unknown; status: number };
type Rpc = (name: string, args: Record<string, unknown>) => PromiseLike<RpcResult>;
const rpc: Rpc = (name, args) => (supabase.rpc as unknown as Rpc).call(supabase, name, args);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const versaoValida = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 1;
const codigo = (e: unknown) => (e as { code?: unknown } | null)?.code;

function classificar(error: unknown, status: number): ErroRbac {
  const c = codigo(error);
  if (c === "42501" || c === "PGRST301" || status === 401 || status === 403) return new ErroRbac("negado");
  if (c === "PT409" || status === 409) return new ErroRbac("conflito");
  if (c === "PT400" || status === 400) return new ErroRbac("validacao");
  return new ErroRbac("indisponivel");
}

async function chamar(name: string, args: Record<string, unknown>): Promise<unknown> {
  let r: RpcResult;
  try {
    r = await rpc(name, args);
  } catch {
    throw new ErroRbac("indisponivel");
  }
  if (r.error) throw classificar(r.error, r.status);
  return r.data;
}

/** Sem matriz completa, não exibir nem permitir edição parcial. */
function validarMatriz(raw: unknown): MatrizRbac {
  const data = raw as Partial<MatrizRbac> | null;
  if (!data || data.schema_versao !== "rbac-v1" || !versaoValida(data.versao) || !Array.isArray(data.permissoes) || data.permissoes.length !== 480) {
    throw new ErroRbac("contrato");
  }
  const unicos = new Set<string>();
  const porPerfil = new Map<string, Set<string>>();
  for (const linha of data.permissoes) {
    if (!linha || typeof linha.perfil !== "string" || !linha.perfil ||
        typeof linha.recurso !== "string" || !linha.recurso ||
        typeof linha.acao !== "string" || !linha.acao ||
        typeof linha.permitido !== "boolean") throw new ErroRbac("contrato");
    const acao = JSON.stringify([linha.recurso, linha.acao]);
    const chave = JSON.stringify([linha.perfil, linha.recurso, linha.acao]);
    if (unicos.has(chave)) throw new ErroRbac("contrato");
    unicos.add(chave);
    if (!porPerfil.has(linha.perfil)) porPerfil.set(linha.perfil, new Set());
    porPerfil.get(linha.perfil)!.add(acao);
  }
  if (porPerfil.size !== 10 || [...porPerfil.values()].some((a) => a.size !== 48)) throw new ErroRbac("contrato");
  const conjunto = [...porPerfil.values()][0];
  if ([...porPerfil.values()].some((a) => [...a].some((x) => !conjunto!.has(x)))) throw new ErroRbac("contrato");
  return data as MatrizRbac;
}

export async function obterMatrizRbac(): Promise<MatrizRbac> {
  return validarMatriz(await chamar("obter_matriz_rbac_master", {}));
}

export async function atualizarMatrizRbac(versao: number, requestId: string, alteracoes: PermissaoPerfil[]): Promise<ResultadoRbac> {
  if (!versaoValida(versao) || !uuid.test(requestId) || !Array.isArray(alteracoes) || alteracoes.length < 1 || alteracoes.length > 500) {
    throw new ErroRbac("validacao");
  }
  const seen = new Set<string>();
  for (const p of alteracoes) {
    if (!p || typeof p.perfil !== "string" || !p.perfil || typeof p.recurso !== "string" || !p.recurso ||
        typeof p.acao !== "string" || !p.acao || typeof p.permitido !== "boolean") throw new ErroRbac("validacao");
    const k = JSON.stringify([p.perfil, p.recurso, p.acao]);
    if (seen.has(k)) throw new ErroRbac("validacao");
    seen.add(k);
  }
  const raw = await chamar("atualizar_matriz_rbac_master", {
    p_versao_esperada: versao,
    p_request_id: requestId,
    p_alteracoes: alteracoes.map(({ perfil, recurso, acao, permitido }) => ({ perfil, recurso, acao, permitido })),
  });
  const r = raw as Partial<ResultadoRbac> | null;
  if (!r || r.schema_versao !== "rbac-v1" || !versaoValida(r.versao) || r.versao !== versao + 1 ||
      r.request_id !== requestId || typeof r.evento_id !== "string" || !uuid.test(r.evento_id)) {
    throw new ErroRbac("contrato");
  }
  return r as ResultadoRbac;
}

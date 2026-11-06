import { supabase } from "@/integrations/supabase/client";

export type DadosNovaOrganizacao = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
};
export class ErroCriarOrganizacao extends Error {
  constructor(public tipo: "negado" | "duplicado" | "invalido" | "incerto") {
    super(tipo);
  }
}
export function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/[.\-/\s]/g, "").toUpperCase();
}
export function dadosOrganizacaoValidos(dados: DadosNovaOrganizacao): boolean {
  const cnpj = normalizarCnpj(dados.cnpj);
  return (
    dados.razaoSocial.trim().length > 0 &&
    dados.razaoSocial.trim().length <= 300 &&
    dados.nomeFantasia.trim().length <= 300 &&
    (!cnpj || /^[A-Z0-9]{14}$/.test(cnpj))
  );
}
/** Comando canônico: vínculos, recurso e auditoria são criados somente no servidor. */
export async function criarOrganizacao(
  dados: DadosNovaOrganizacao,
): Promise<string> {
  if (!dadosOrganizacaoValidos(dados))
    throw new ErroCriarOrganizacao("invalido");
  const nome = dados.nomeFantasia.trim();
  const cnpj = normalizarCnpj(dados.cnpj);
  let resposta;
  try {
    resposta = await supabase.rpc("criar_organizacao", {
      p_razao_social: dados.razaoSocial.trim(),
      p_timezone: "America/Sao_Paulo",
      ...(nome ? { p_nome_fantasia: nome } : {}),
      ...(cnpj ? { p_cnpj: cnpj } : {}),
    });
  } catch {
    throw new ErroCriarOrganizacao("incerto");
  }
  if (resposta.error) {
    const code = resposta.error.code;
    if (
      resposta.status === 401 ||
      resposta.status === 403 ||
      code === "42501" ||
      code === "PGRST301"
    )
      throw new ErroCriarOrganizacao("negado");
    if (code === "23505") throw new ErroCriarOrganizacao("duplicado");
    if (["23502", "23514", "22001", "22023"].includes(code))
      throw new ErroCriarOrganizacao("invalido");
    throw new ErroCriarOrganizacao("incerto");
  }
  if (
    typeof resposta.data !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      resposta.data,
    )
  )
    throw new ErroCriarOrganizacao("incerto");
  return resposta.data;
}

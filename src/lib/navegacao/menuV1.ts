import type { AcaoRbac, ContextoRbac } from "@/lib/administracao/rbacRpc";
/** P0 V1: somente rotas estáticas existentes. A navegação não concede autorização. */
export const ROTAS_PUBLICAS = [
  "/login",
  "/esqueci-senha",
  "/redefinir-senha",
  "/selecionar-organizacao",
] as const;
export const MENU_V1 = [
  { titulo: "Painel", destino: "/", recurso: "dashboard", acao: "consultar" },
  { titulo: "Contratantes", destino: "/contratantes", recurso: "contratantes", acao: "consultar" },
  {
    titulo: "Novo contratante",
    destino: "/contratantes/novo",
    recurso: "contratantes",
    acao: "criar",
  },
  { titulo: "Contratos", destino: "/contratos", recurso: "contratos", acao: "consultar" },
  { titulo: "Novo contrato", destino: "/contratos/novo", recurso: "contratos", acao: "criar" },
] as const;
export const MENU_ADMIN_V1 = [
  { titulo: "Usuários", destino: "/administracao/usuarios" },
  { titulo: "Auditoria", destino: "/administracao/auditoria" },
] as const;
export function rotaSemSidebar(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(rota + "/"));
}

const permitido = (permissoes: AcaoRbac[], recurso: string, acao: string) =>
  permissoes.some((p) => p.recurso === recurso && p.acao === acao);
export function menuComumPermitido(permissoes: AcaoRbac[]) {
  return MENU_V1.filter((p) => permitido(permissoes, p.recurso, p.acao));
}
export function menuContextualV1(c: ContextoRbac, permissoes: AcaoRbac[]) {
  const itens: { titulo: string; destino: string; recurso: string; acao: string }[] = [];
  const adicionar = (titulo: string, destino: string, recurso: string, acao = "consultar") =>
    itens.push({ titulo, destino, recurso, acao });
  if (c.competencia) {
    const base = `/competencias/${c.competencia}`;
    adicionar("Resumo da competência", base, "competencias");
    adicionar("Documentos da competência", base + "/documentos", "documentos_competencia");
    adicionar("Análise da competência", base + "/analise", "analises");
    adicionar("Parecer da competência", base + "/parecer", "pareceres");
    adicionar("Apresentações", base + "/apresentar", "apresentacoes");
    if (c.contrato) adicionar("Contrato da competência", `/contratos/${c.contrato}`, "contratos");
  } else if (c.contrato) {
    const base = `/contratos/${c.contrato}`;
    adicionar("Resumo do contrato", base, "contratos");
    adicionar("Base normativa", base + "/base-normativa", "normativos");
    adicionar("Orçamento", base + "/orcamento", "orcamentos");
    adicionar("Regras de conformidade", base + "/regras", "listas");
    adicionar("Documentos do contrato", base + "/documentos", "documentos_contrato");
    adicionar("Competências do contrato", base + "/competencias", "competencias");
    adicionar("Nova competência", base + "/competencias/nova", "competencias", "criar");
    adicionar("Histórico do contrato", base + "/historico", "historico");
    adicionar("Importar histórico", base + "/historico/importar", "historico", "processar");
  } else if (c.contratante)
    adicionar(
      "Editar contratante",
      `/contratantes/${c.contratante}/editar`,
      "contratantes",
      "editar",
    );
  return itens.filter((p) => permitido(permissoes, p.recurso, p.acao));
}

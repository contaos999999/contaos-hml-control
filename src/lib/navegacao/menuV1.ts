/** P0 V1: somente rotas estáticas existentes. A navegação não concede autorização. */
export const ROTAS_PUBLICAS = ["/login", "/esqueci-senha", "/redefinir-senha", "/selecionar-organizacao"] as const;
export const MENU_V1 = [
  { titulo: "Painel", destino: "/" },
  { titulo: "Contratantes", destino: "/contratantes" },
  { titulo: "Contratos", destino: "/contratos" },
] as const;
export const MENU_ADMIN_V1 = [
  { titulo: "Usuários", destino: "/administracao/usuarios" },
  { titulo: "Auditoria", destino: "/administracao/auditoria" },
] as const;
export function rotaSemSidebar(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(rota + "/"));
}

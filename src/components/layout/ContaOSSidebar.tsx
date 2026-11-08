import { Link, useRouterState } from "@tanstack/react-router";
import { menuComumPermitido, menuContextualV1 } from "@/lib/navegacao/menuV1";
import type { AcaoRbac, ContextoRbac } from "@/lib/administracao/rbacRpc";
import { LayoutDashboard, Building2, FileText } from "lucide-react";

/** Menu de rotas comuns. Itens administrativos só entram após autorização comprovada. */
export function ContaOSSidebar({
  recolhida = false,
  aoNavegar,
  permissoes = [],
  contexto = { contrato: null, competencia: null, contratante: null },
}: {
  recolhida?: boolean;
  aoNavegar?: () => void;
  permissoes?: AcaoRbac[];
  contexto?: ContextoRbac;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-3">
      {menuComumPermitido(permissoes).map(({ titulo, destino }) => {
        const ativa =
          destino === "/"
            ? pathname === "/"
            : pathname === destino ||
              (destino !== "/contratantes" &&
                destino !== "/contratos" &&
                pathname.startsWith(destino + "/"));
        return (
          <Link
            key={destino}
            to={destino}
            onClick={aoNavegar}
            aria-current={ativa ? "page" : undefined}
            aria-label={titulo}
            title={recolhida ? titulo : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${ativa ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
          >
            <span className="flex items-center gap-2">
              {destino === "/" ? (
                <LayoutDashboard aria-hidden="true" className="size-4 shrink-0" />
              ) : destino.startsWith("/contratantes") ? (
                <Building2 aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                <FileText aria-hidden="true" className="size-4 shrink-0" />
              )}
              {!recolhida && <span>{titulo}</span>}
            </span>
          </Link>
        );
      })}
      <Link
        to="/selecionar-organizacao"
        onClick={aoNavegar}
        aria-label="Organizações"
        title={recolhida ? "Organizações" : undefined}
        className="flex min-h-11 items-center gap-2 rounded px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Building2 aria-hidden="true" className="size-4 shrink-0" />
        {!recolhida && <span>Organizações</span>}
      </Link>
      {menuContextualV1(contexto, permissoes).length > 0 && (
        <div
          className="mt-3 space-y-1 border-t border-sidebar-border pt-3"
          role="group"
          aria-label="Contexto atual"
        >
          {!recolhida && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/80">Contexto atual</p>
          )}
          {menuContextualV1(contexto, permissoes).map((item) => (
            <Link
              key={item.destino}
              to={item.destino}
              onClick={aoNavegar}
              aria-label={item.titulo}
              title={recolhida ? item.titulo : undefined}
              aria-current={pathname === item.destino ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-sidebar-ring ${pathname === item.destino ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
            >
              <FileText aria-hidden="true" className="size-4 shrink-0" />
              {!recolhida && <span>{item.titulo}</span>}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

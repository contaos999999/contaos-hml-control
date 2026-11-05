import { Link, useRouterState } from "@tanstack/react-router";
import { MENU_V1 } from "@/lib/navegacao/menuV1";
import { LayoutDashboard, Building2, FileText } from "lucide-react";

/** Menu de rotas comuns. Itens administrativos só entram após autorização comprovada. */
export function ContaOSSidebar({ recolhida = false, aoNavegar }: { recolhida?: boolean; aoNavegar?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-3">
      {MENU_V1.map(({ titulo, destino }) => {
        const ativa = destino === "/" ? pathname === "/" : pathname === destino || pathname.startsWith(destino + "/");
        return (
          <Link key={destino} to={destino} onClick={aoNavegar} aria-current={ativa ? "page" : undefined}
            aria-label={titulo} title={recolhida ? titulo : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${ativa ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/60"}`}>
            <span className="flex items-center gap-2">
              {destino === "/" ? <LayoutDashboard aria-hidden="true" className="size-4 shrink-0" /> : destino === "/contratantes" ? <Building2 aria-hidden="true" className="size-4 shrink-0" /> : <FileText aria-hidden="true" className="size-4 shrink-0" />}
              {!recolhida && <span>{titulo}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

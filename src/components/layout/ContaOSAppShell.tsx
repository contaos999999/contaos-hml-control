import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { rotaSemSidebar } from "@/lib/navegacao/menuV1";
import { ContaOSSidebar } from "./ContaOSSidebar";

/** O shell é apenas apresentação; componentes e RLS preservam a autorização real. */
export function ContaOSAppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [liberado, setLiberado] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const [movelAberto, setMovelAberto] = useState(false);
  useEffect(() => {
    let ativo = true;
    setLiberado(false);
    if (rotaSemSidebar(pathname)) return;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      const organizacao = await obterPreferenciaOrganizacao(data.user.id);
      if (ativo && organizacao) setLiberado(true);
    })().catch(() => { if (ativo) setLiberado(false); });
    return () => { ativo = false; };
  }, [pathname]);
  if (rotaSemSidebar(pathname)) return <>{children}</>;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {liberado && (
        <>
          <button type="button" aria-label="Abrir menu" aria-expanded={movelAberto} aria-controls="contaos-menu-movel"
            onClick={() => setMovelAberto((v) => !v)} className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background p-3 shadow-lg focus-visible:ring-2 focus-visible:ring-ring md:hidden">Menu</button>
          {movelAberto && <div id="contaos-menu-movel" className="fixed inset-0 z-40 bg-background/95 pt-12 md:hidden"><button type="button" className="m-3 rounded border px-3 py-2" onClick={() => setMovelAberto(false)}>Fechar menu</button><ContaOSSidebar aoNavegar={() => setMovelAberto(false)} /></div>}
          <aside className={`fixed inset-y-0 left-0 hidden border-r bg-background md:block ${recolhida ? "w-20" : "w-56"}`}>
            <div className="flex items-center justify-between gap-2 border-b p-3"><span className="font-semibold">{recolhida ? "C" : "ContaOS"}</span><button type="button" aria-label={recolhida ? "Expandir menu" : "Recolher menu"} aria-expanded={!recolhida} onClick={() => setRecolhida((v) => !v)} className="rounded border px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring">{recolhida ? "»" : "«"}</button></div>
            <ContaOSSidebar recolhida={recolhida} />
          </aside>
        </>
      )}
      <div className={liberado ? (recolhida ? "md:pl-20" : "md:pl-56") : ""}>{children}</div>
    </div>
  );
}

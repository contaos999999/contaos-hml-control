import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { rotaSemSidebar } from "@/lib/navegacao/menuV1";
import { ContaOSSidebar } from "./ContaOSSidebar";
import { validarAdministrador } from "@/lib/administracao/admUsuariosRpc";
import { Link } from "@tanstack/react-router";
import { MENU_ADMIN_V1 } from "@/lib/navegacao/menuV1";

/** O shell é apenas apresentação; componentes e RLS preservam a autorização real. */
export function ContaOSAppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [liberado, setLiberado] = useState(false);
  const [revisaoSessao, setRevisaoSessao] = useState(0);
  const [administrador, setAdministrador] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const [movelAberto, setMovelAberto] = useState(false);
  useEffect(() => {
    if (!movelAberto) return;
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMovelAberto(false);
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [movelAberto]);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento !== "SIGNED_IN" && evento !== "SIGNED_OUT" && evento !== "USER_UPDATED") return;
      setLiberado(false);
      setAdministrador(false);
      setMovelAberto(false);
      setRevisaoSessao((atual) => atual + 1);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let ativo = true;
    setLiberado(false);
    setAdministrador(false);
    setMovelAberto(false);
    if (rotaSemSidebar(pathname)) return;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      const organizacao = await obterPreferenciaOrganizacao(data.user.id);
      if (ativo && organizacao) {
        setLiberado(true);
        const autorizado = await validarAdministrador(organizacao).catch(() => false);
        if (ativo) setAdministrador(autorizado === true);
      }
    })().catch(() => { if (ativo) setLiberado(false); });
    return () => { ativo = false; };
  }, [pathname, revisaoSessao]);
  if (rotaSemSidebar(pathname)) return <>{children}</>;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {liberado && (
        <>
          <button type="button" aria-label="Abrir menu" aria-expanded={movelAberto} aria-controls="contaos-menu-movel"
            onClick={() => setMovelAberto((v) => !v)} className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background p-3 shadow-lg focus-visible:ring-2 focus-visible:ring-ring md:hidden">Menu</button>
          {movelAberto && <div id="contaos-menu-movel" role="dialog" aria-modal="true" aria-label="Menu de navegação" className="fixed inset-0 z-40 overflow-y-auto bg-background/95 pt-12 md:hidden"><button type="button" className="m-3 rounded border px-3 py-2" onClick={() => setMovelAberto(false)}>Fechar menu</button><ContaOSSidebar aoNavegar={() => setMovelAberto(false)} />{administrador && <nav aria-label="Administração" className="flex flex-col gap-1 p-3">{MENU_ADMIN_V1.map((item) => <Link key={item.destino} to={item.destino} onClick={() => setMovelAberto(false)} className="rounded px-3 py-2 text-sm hover:bg-accent">{item.titulo}</Link>)}</nav>}</div>}
          <aside className={`fixed inset-y-0 left-0 hidden border-r bg-background md:block ${recolhida ? "w-20" : "w-56"}`}>
            <div className="flex items-center justify-between gap-2 border-b p-3"><img src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg" alt="ContaOS" width={131} height={32} className={recolhida ? "hidden" : "h-8 w-auto dark:hidden"} /><img src="/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg" alt="ContaOS" width={131} height={32} className={recolhida ? "hidden" : "hidden h-8 w-auto dark:block"} /><img src="/brand/ContaOS_Simbolo_Branco.svg" alt="ContaOS" width={32} height={32} className={recolhida ? "block size-8 dark:hidden" : "hidden"} /><img src="/brand/ContaOS_Simbolo_Navy.svg" alt="ContaOS" width={32} height={32} className={recolhida ? "hidden size-8 dark:block" : "hidden"} /><button type="button" aria-label={recolhida ? "Expandir menu" : "Recolher menu"} aria-expanded={!recolhida} onClick={() => setRecolhida((v) => !v)} className="rounded border px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring">{recolhida ? "»" : "«"}</button></div>
            <ContaOSSidebar recolhida={recolhida} />{administrador && <nav aria-label="Administração" className="flex flex-col gap-1 p-3">{MENU_ADMIN_V1.map((item) => <Link key={item.destino} to={item.destino} aria-label={item.titulo} title={recolhida ? item.titulo : undefined} className="rounded px-3 py-2 text-sm hover:bg-accent">{recolhida ? item.titulo.slice(0, 1) : item.titulo}</Link>)}</nav>}
          </aside>
        </>
      )}
      <div className={liberado ? (recolhida ? "md:pl-20" : "md:pl-56") : ""}>{children}</div>
    </div>
  );
}

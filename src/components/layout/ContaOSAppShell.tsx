import {
  consultarPermissoesEfetivas,
  resolverContextoRbac,
  temPermissao,
  type AcaoRbac,
  type ContextoRbac,
} from "@/lib/administracao/rbacRpc";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { rotaSemSidebar } from "@/lib/navegacao/menuV1";
import { ContaOSSidebar } from "./ContaOSSidebar";
import { ContaOSOrganizationHeader } from "./ContaOSOrganizationHeader";
import { validarAdministrador, podeConsultarAuditoria } from "@/lib/administracao/admUsuariosRpc";
import { Link } from "@tanstack/react-router";
import { MENU_ADMIN_V1 } from "@/lib/navegacao/menuV1";
import { Users, ScrollText } from "lucide-react";
import { CopilotoContrato } from "@/components/copiloto/CopilotoContrato";

/** O shell é apenas apresentação; componentes e RLS preservam a autorização real. */
export function ContaOSAppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rotaAdministrativaAtiva = (destino: string) =>
    pathname === destino || pathname.startsWith(`${destino}/`);
  const [liberado, setLiberado] = useState(false);
  const [contextoCopiloto, setContextoCopiloto] = useState<{
    rota: string;
    organizacao: string;
    contrato: string | null;
    competencia: string | null;
  } | null>(null);
  const [revisaoSessao, setRevisaoSessao] = useState(0);
  const [chaveConteudo, setChaveConteudo] = useState(0);
  const [administrador, setAdministrador] = useState(false);
  const [auditoriaPermitida, setAuditoriaPermitida] = useState(false);
  const [permissoes, setPermissoes] = useState<AcaoRbac[]>([]);
  const [contexto, setContexto] = useState<ContextoRbac>({
    contrato: null,
    competencia: null,
    contratante: null,
  });
  const [recolhida, setRecolhida] = useState(false);
  const [movelAberto, setMovelAberto] = useState(false);
  const dialogoMovelRef = useRef<HTMLDivElement>(null);
  const botaoMovelRef = useRef<HTMLButtonElement>(null);
  const geracaoAutenticacao = useRef(0);
  const fechamentoPorNavegacao = useRef(false);
  useEffect(() => {
    if (!movelAberto) return;
    fechamentoPorNavegacao.current = false;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialogo = dialogoMovelRef.current;
    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const selecionarFocaveis = () =>
      Array.from(
        dialogo?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((elemento) => elemento.getClientRects().length > 0);
    selecionarFocaveis()[0]?.focus();
    const controlarTeclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fechamentoPorNavegacao.current = false;
        setMovelAberto(false);
      }
      if (evento.key !== "Tab") return;
      const focaveis = selecionarFocaveis();
      if (!focaveis.length) {
        evento.preventDefault();
        dialogo?.focus();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (
        evento.shiftKey &&
        (document.activeElement === primeiro || !dialogo?.contains(document.activeElement))
      ) {
        evento.preventDefault();
        ultimo?.focus();
      } else if (
        !evento.shiftKey &&
        (document.activeElement === ultimo || !dialogo?.contains(document.activeElement))
      ) {
        evento.preventDefault();
        primeiro?.focus();
      }
    };
    document.addEventListener("keydown", controlarTeclado);
    return () => {
      document.removeEventListener("keydown", controlarTeclado);
      document.body.style.overflow = overflowAnterior;
      if (!fechamentoPorNavegacao.current && focoAnterior?.isConnected) focoAnterior.focus();
      else if (!fechamentoPorNavegacao.current) botaoMovelRef.current?.focus();
      fechamentoPorNavegacao.current = false;
    };
  }, [movelAberto]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const fecharAoExpandir = (evento: MediaQueryListEvent) => {
      if (evento.matches) setMovelAberto(false);
    };
    if (media.matches) setMovelAberto(false);
    media.addEventListener("change", fecharAoExpandir);
    return () => media.removeEventListener("change", fecharAoExpandir);
  }, []);
  useEffect(() => {
    const revalidarAoRetomar = () => {
      if (document.visibilityState !== "visible") return;
      geracaoAutenticacao.current += 1;
      setAdministrador(false);
      setAuditoriaPermitida(false);
      setPermissoes([]);
      setContexto({ contrato: null, competencia: null, contratante: null });
      setContextoCopiloto(null);
      setLiberado(false);
      setMovelAberto(false);
      setRevisaoSessao((atual) => atual + 1);
    };
    document.addEventListener("visibilitychange", revalidarAoRetomar);
    return () => document.removeEventListener("visibilitychange", revalidarAoRetomar);
  }, []);
  useEffect(() => {
    const revalidarAoAlterarOrganizacao = () => {
      setChaveConteudo((chave) => chave + 1);
      // Invalida RPCs pendentes antes de iniciar qualquer consulta da nova organização.
      geracaoAutenticacao.current += 1;
      setLiberado(false);
      setAdministrador(false);
      setAuditoriaPermitida(false);
      setPermissoes([]);
      setContexto({ contrato: null, competencia: null, contratante: null });
      setContextoCopiloto(null);
      setMovelAberto(false);
      setRevisaoSessao((atual) => atual + 1);
    };
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, revalidarAoAlterarOrganizacao);
    return () =>
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, revalidarAoAlterarOrganizacao);
  }, []);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento !== "SIGNED_IN" && evento !== "SIGNED_OUT" && evento !== "USER_UPDATED") return;
      geracaoAutenticacao.current += 1;
      setLiberado(false);
      setAdministrador(false);
      setAuditoriaPermitida(false);
      setPermissoes([]);
      setContexto({ contrato: null, competencia: null, contratante: null });
      setContextoCopiloto(null);
      setMovelAberto(false);
      setRevisaoSessao((atual) => atual + 1);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let ativo = true;
    const geracao = geracaoAutenticacao.current;
    const sessaoAtual = () => ativo && geracao === geracaoAutenticacao.current;
    setLiberado(false);
    setAdministrador(false);
    setAuditoriaPermitida(false);
    setPermissoes([]);
    setContexto({ contrato: null, competencia: null, contratante: null });
    setContextoCopiloto(null);
    fechamentoPorNavegacao.current = true;
    setMovelAberto(false);
    if (rotaSemSidebar(pathname)) return;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!sessaoAtual() || error || !data.user) return;
      const organizacao = await obterPreferenciaOrganizacao(data.user.id);
      if (sessaoAtual() && organizacao) {
        setLiberado(true);
        const contextoAtual = await resolverContextoRbac(pathname, organizacao);
        const efetivas = await consultarPermissoesEfetivas(organizacao, contextoAtual.contrato);
        if (!sessaoAtual()) return;
        setPermissoes(efetivas.permissoes);
        setContexto(contextoAtual);
        setContextoCopiloto({
          rota: pathname,
          organizacao,
          contrato: contextoAtual.contrato,
          competencia: contextoAtual.competencia,
        });
        const autorizado = await validarAdministrador(organizacao).catch(() => false);
        if (sessaoAtual())
          setAdministrador(
            autorizado === true && temPermissao(efetivas.permissoes, "usuarios", "administrar"),
          );
        const auditoriaAutorizada = await podeConsultarAuditoria(organizacao).catch(() => false);
        if (sessaoAtual())
          setAuditoriaPermitida(
            auditoriaAutorizada === true &&
              temPermissao(efetivas.permissoes, "auditoria", "consultar"),
          );
      }
    })().catch(() => {
      if (sessaoAtual()) setLiberado(false);
    });
    return () => {
      ativo = false;
    };
  }, [pathname, revisaoSessao]);
  if (rotaSemSidebar(pathname)) return <>{children}</>;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {liberado && (
        <>
          {movelAberto && (
            <div
              ref={dialogoMovelRef}
              tabIndex={-1}
              id="contaos-menu-movel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="fixed inset-0 z-40 overflow-y-auto bg-sidebar text-sidebar-foreground pt-12 md:hidden"
            >
              <button
                type="button"
                className="m-3 min-h-11 rounded border border-sidebar-border px-3 py-2 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                onClick={() => {
                  fechamentoPorNavegacao.current = false;
                  setMovelAberto(false);
                }}
              >
                Fechar menu
              </button>
              <div className="border-b border-sidebar-border p-4">
                <img
                  src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"
                  alt="ContaOS"
                  width={131}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              <ContaOSSidebar
                permissoes={permissoes}
                contexto={contexto}
                aoNavegar={(evento?: MouseEvent<HTMLAnchorElement>) => {
                  const destino = evento?.currentTarget.getAttribute("href");
                  if (destino && new URL(destino, window.location.origin).pathname === pathname) {
                    fechamentoPorNavegacao.current = false;
                    setMovelAberto(false);
                  } else {
                    fechamentoPorNavegacao.current = true;
                  }
                }}
              />
              {(administrador || auditoriaPermitida) && (
                <nav aria-label="Administração" className="flex flex-col gap-1 p-3">
                  {MENU_ADMIN_V1.filter((item) =>
                    item.destino === "/administracao/usuarios" ? administrador : auditoriaPermitida,
                  ).map((item) => (
                    <Link
                      key={item.destino}
                      to={item.destino}
                      onClick={() => {
                        if (item.destino === pathname) {
                          fechamentoPorNavegacao.current = false;
                          setMovelAberto(false);
                        } else {
                          fechamentoPorNavegacao.current = true;
                        }
                      }}
                      aria-current={rotaAdministrativaAtiva(item.destino) ? "page" : undefined}
                      className={`rounded px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-sidebar-ring ${rotaAdministrativaAtiva(item.destino) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                    >
                      {item.titulo}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          )}
          <aside
            className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block ${recolhida ? "w-20" : "w-56"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sidebar-border p-3">
              <img
                src={
                  recolhida
                    ? "/brand/ContaOS_Simbolo_Branco.svg"
                    : "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"
                }
                alt="ContaOS"
                width={recolhida ? 32 : 131}
                height={32}
                className={recolhida ? "size-8 shrink-0" : "h-8 w-auto min-w-0"}
              />
              <button
                type="button"
                aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
                aria-expanded={!recolhida}
                onClick={() => setRecolhida((v) => !v)}
                className="min-h-11 rounded border border-sidebar-border px-2 py-1 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                {recolhida ? "»" : "«"}
              </button>
            </div>
            <ContaOSSidebar permissoes={permissoes} contexto={contexto} recolhida={recolhida} />
            {(administrador || auditoriaPermitida) && (
              <nav aria-label="Administração" className="flex flex-col gap-1 p-3">
                {MENU_ADMIN_V1.filter((item) =>
                  item.destino === "/administracao/usuarios" ? administrador : auditoriaPermitida,
                ).map((item) => (
                  <Link
                    key={item.destino}
                    to={item.destino}
                    aria-label={item.titulo}
                    title={recolhida ? item.titulo : undefined}
                    aria-current={rotaAdministrativaAtiva(item.destino) ? "page" : undefined}
                    className={`rounded px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-sidebar-ring ${rotaAdministrativaAtiva(item.destino) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.destino === "/administracao/usuarios" ? (
                        <Users aria-hidden="true" className="size-4 shrink-0" />
                      ) : (
                        <ScrollText aria-hidden="true" className="size-4 shrink-0" />
                      )}
                      {!recolhida && <span>{item.titulo}</span>}
                    </span>
                  </Link>
                ))}
              </nav>
            )}
          </aside>
        </>
      )}
      <div
        inert={movelAberto}
        className={`min-w-0 ${liberado ? (recolhida ? "md:pl-20" : "md:pl-56") : ""}`}
      >
        <ContaOSOrganizationHeader />
        {liberado && (
          <div className="flex justify-end border-b border-border bg-background px-4 py-2 md:hidden">
            <button
              ref={botaoMovelRef}
              type="button"
              inert={movelAberto}
              aria-label="Abrir menu"
              aria-expanded={movelAberto}
              aria-controls="contaos-menu-movel"
              onClick={() => {
                fechamentoPorNavegacao.current = false;
                setMovelAberto((v) => !v);
              }}
              className="min-h-11 rounded-lg border bg-background px-3 py-2 shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              Menu
            </button>
          </div>
        )}
        <div key={chaveConteudo}>{children}</div>
        {liberado && !movelAberto && contextoCopiloto?.rota === pathname && (
          <CopilotoContrato
            key={`${chaveConteudo}:${revisaoSessao}:${pathname}:${contextoCopiloto.organizacao}`}
            contratoId={contextoCopiloto.contrato}
            organizacaoId={contextoCopiloto.organizacao}
            competenciaId={contextoCopiloto.competencia}
          />
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import { Button } from "@/components/ui/button";

type Organizacao = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  situacao: string;
};

/** Apresentação verificada pelo contrato SYS-05; nunca concede autorização. */
export function ContaOSOrganizationHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [fase, setFase] = useState<"carregando" | "pronto" | "erro">("carregando");
  const [revisao, setRevisao] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState(false);
  const geracao = useRef(0);
  const saidaEmCurso = useRef(false);
  const cabecalho = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = cabecalho.current;
    if (!header) return;
    const root = document.documentElement;
    const anterior = root.style.scrollPaddingTop;
    let frame = 0;
    const revelar = (target: Element | null) => {
      if (
        !(target instanceof HTMLElement) ||
        header.contains(target) ||
        !header.parentElement?.contains(target)
      )
        return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!target.isConnected || document.activeElement !== target) return;
        const limite = header.getBoundingClientRect().bottom + 12;
        const top = target.getBoundingClientRect().top;
        if (top < limite) window.scrollBy({ top: top - limite, behavior: "instant" });
      });
    };
    const medir = () => {
      root.style.scrollPaddingTop = `${Math.ceil(header.getBoundingClientRect().height) + 12}px`;
      revelar(document.activeElement);
    };
    const focar = (event: FocusEvent) =>
      revelar(event.target instanceof Element ? event.target : null);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(medir);
    observer?.observe(header);
    medir();
    window.addEventListener("resize", medir);
    document.addEventListener("focusin", focar);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", medir);
      document.removeEventListener("focusin", focar);
      root.style.scrollPaddingTop = anterior;
    };
  }, []);

  useEffect(() => {
    const invalidar = () => {
      geracao.current += 1;
      setOrganizacao(null);
      setFase("carregando");
      setRevisao((r) => r + 1);
    };
    const aoRetomar = () => {
      if (document.visibilityState === "visible") invalidar();
    };
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, invalidar);
    document.addEventListener("visibilitychange", aoRetomar);
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "TOKEN_REFRESHED"].includes(evento))
        invalidar();
    });
    return () => {
      geracao.current += 1;
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, invalidar);
      document.removeEventListener("visibilitychange", aoRetomar);
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    const versao = geracao.current;
    const atual = () => ativo && versao === geracao.current && !saidaEmCurso.current;
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!atual()) return;
        if (error || !data.user) throw new Error("sessao");
        const id = obterPreferenciaOrganizacao(data.user.id);
        if (!id) throw new Error("organizacao");
        const resposta = await supabase.rpc("obter_resumo_dashboard", {
          p_id_organizacao: id,
        });
        if (!atual()) return;
        const resumo = resposta.data as unknown as {
          schema_versao?: string;
          organizacao?: Organizacao;
        } | null;
        const org = resumo?.organizacao;
        if (
          resposta.error ||
          resumo?.schema_versao !== "sys05-v1" ||
          !org ||
          org.id !== id ||
          typeof org.razao_social !== "string" ||
          !org.razao_social.trim() ||
          typeof org.situacao !== "string" ||
          !org.situacao.trim() ||
          (org.nome_fantasia !== null && typeof org.nome_fantasia !== "string")
        )
          throw new Error("resumo");
        setOrganizacao(org);
        setFase("pronto");
      } catch {
        if (atual()) {
          setOrganizacao(null);
          setFase("erro");
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [revisao]);

  async function sair() {
    if (saidaEmCurso.current) return;
    saidaEmCurso.current = true;
    geracao.current += 1;
    setOrganizacao(null);
    setSaindo(true);
    setErroSaida(false);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await navigate({ to: "/login", replace: true });
    } catch {
      setErroSaida(true);
      saidaEmCurso.current = false;
      setSaindo(false);
      setFase("erro");
    }
  }

  return (
    <header
      ref={cabecalho}
      aria-label="Organização atual"
      className="sticky top-0 z-20 border-b border-border bg-card text-card-foreground"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Organização
          </p>
          {organizacao ? (
            <>
              <p className="break-words font-semibold">
                {organizacao.nome_fantasia?.trim() || organizacao.razao_social}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Situação: {organizacao.situacao}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {fase === "carregando"
                ? "Confirmando organização…"
                : "Não foi possível confirmar a organização."}
            </p>
          )}
        </div>
        <nav aria-label="Ações da sessão" className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/selecionar-organizacao">
              <Building2 className="mr-2 size-4" aria-hidden="true" />
              Trocar organização
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={sair}
            disabled={saindo}
          >
            {saindo ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="mr-2 size-4" aria-hidden="true" />
            )}
            Sair
          </Button>
        </nav>
        {erroSaida && (
          <p role="alert" className="w-full text-sm text-destructive">
            Não foi possível sair. Tente novamente.
          </p>
        )}
      </div>
    </header>
  );
}

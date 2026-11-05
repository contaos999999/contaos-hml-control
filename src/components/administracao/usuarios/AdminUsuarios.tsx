import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, ShieldAlert, UserPlus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ErroAdm, MENSAGENS_ADM01, listarUsuarios, validarAdministrador, type UsuarioVinculo } from "@/lib/administracao/admUsuariosRpc";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { AuditDrawer } from "./AuditDrawer";
import { ContractScopeDialog, type ModoVinculo } from "./ContractScopeDialog";
import { UserMembershipTable } from "./UserMembershipTable";

type Situacao = "todos" | "ativos" | "inativos";

export function AdminUsuarios() {
  const navigate = useNavigate();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const saindoRef = useRef(false);

  const [pagina, setPagina] = useState(1);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [busca, setBusca] = useState<string | null>(null);
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [editando, setEditando] = useState<ModoVinculo | null>(null);
  const [auditando, setAuditando] = useState<UsuarioVinculo | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Acessibilidade: gatilho que abriu o diálogo/gaveta, para devolver o foco após o fechamento.
  const gatilhoRef = useRef<HTMLElement | null>(null);

  function lembrarGatilho(el?: HTMLElement | null) {
    const a = el ?? document.activeElement;
    gatilhoRef.current = a instanceof HTMLElement && a !== document.body ? a : null;
  }
  function restaurarFoco() {
    const g = gatilhoRef.current;
    gatilhoRef.current = null;
    if (!g) return;
    requestAnimationFrame(() => {
      if (g.isConnected) g.focus();
    });
  }

  useEffect(() => {
    let ativo = true;
    setVerificando(true);
    setErroSessao(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" || (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user)) {
          navigate({ to: "/login", replace: true });
          return;
        }
        if (error || !data.user) {
          setErroSessao(true);
          return;
        }
        const pref = obterPreferenciaOrganizacao(data.user.id);
        if (!pref) {
          navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        setIdUsuario(data.user.id);
        setOrg(pref);
      })
      .catch(() => {
        if (ativo) setErroSessao(true);
      })
      .finally(() => {
        if (ativo) setVerificando(false);
      });
    return () => {
      ativo = false;
    };
  }, [navigate, tentativa]);

  useEffect(() => {
    const t = setTimeout(() => {
      const b = buscaTexto.trim() || null;
      setBusca((atual) => {
        if (atual !== b) setPagina(1);
        return b;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [buscaTexto]);

  const acesso = useQuery({
    queryKey: ["adm01", "validar", idUsuario, org],
    queryFn: () => validarAdministrador(org!),
    enabled: !!idUsuario && !!org,
    retry: false,
  });
  const admin = acesso.data === true;

  const p_ativo = situacao === "todos" ? null : situacao === "ativos";
  const consulta = useQuery({
    queryKey: ["adm01", "usuarios", idUsuario, org, pagina, busca, p_ativo],
    queryFn: () => listarUsuarios(org!, { pagina, busca, ativo: p_ativo }),
    enabled: !!idUsuario && !!org && admin,
    retry: false,
  });

  async function sair() {
    if (saindoRef.current) return;
    saindoRef.current = true;
    setSaindo(true);
    await supabase.auth.signOut().catch(() => undefined);
    navigate({ to: "/login", replace: true });
  }

  async function obterUsuarioAtual(id: string) {
    const r = await consulta.refetch();
    return r.data?.itens.find((x) => x.id_usuario === id) ?? null;
  }

  const pronto = !!idUsuario && !!org;
  const fase = erroSessao
    ? "erro"
    : verificando || !pronto || acesso.isPending
      ? "verificando"
      : acesso.error
        ? acesso.error instanceof ErroAdm && acesso.error.tipo === "negado"
          ? "negado"
          : "erro"
        : !admin
          ? "negado"
          : consulta.isPending
            ? "carregando"
            : consulta.error
              ? consulta.error instanceof ErroAdm && consulta.error.tipo === "negado"
                ? "negado"
                : "erro"
              : "sucesso";
  const d = fase === "sucesso" ? consulta.data : undefined;
  const perfis = d?.perfis_disponiveis ?? [];

  return (
    <div lang="pt-BR" className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="md:hidden"><ContaOSMarca /></span>
            
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-11">
              <Link to="/">Painel</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              disabled={saindo}
              onClick={sair}
            >
              {saindo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="mr-2 h-4 w-4" aria-hidden />}
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Administração</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Usuários e vínculos</h1>
          </div>
          {fase === "sucesso" && (
            <Button type="button" className="h-11" onClick={(e) => (lembrarGatilho(e.currentTarget), setAviso(null), setEditando({ tipo: "novo" }))}>
              <UserPlus className="mr-2 h-4 w-4" aria-hidden /> Convidar ou vincular usuário
            </Button>
          )}
        </div>

        <div role="status" aria-live="polite" className={aviso ? "rounded-md border border-border bg-card p-3 text-sm" : "sr-only"}>
          {aviso ?? (fase === "verificando" ? MENSAGENS_ADM01.verificando : fase === "carregando" ? MENSAGENS_ADM01.carregando : "")}
        </div>

        {pronto && admin && !erroSessao && fase !== "negado" && (
          <section aria-labelledby="adm01-filtros" className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <h2 id="adm01-filtros" className="sr-only">
              Filtros
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="adm01-busca" className="text-sm font-medium text-foreground">
                Buscar usuários
              </label>
              <input
                id="adm01-busca"
                type="search"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="adm01-situacao" className="text-sm font-medium text-foreground">
                Situação do vínculo
              </label>
              <select
                id="adm01-situacao"
                value={situacao}
                onChange={(e) => (setSituacao(e.target.value as Situacao), setPagina(1))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>
          </section>
        )}

        {(fase === "verificando" || fase === "carregando") && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-hidden>
            <Loader2 className="h-4 w-4 animate-spin" />
            {fase === "verificando" ? MENSAGENS_ADM01.verificando : MENSAGENS_ADM01.carregando}
          </p>
        )}

        {fase === "negado" && (
          <div className="max-w-xl space-y-3">
            <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <p className="text-sm text-foreground">{MENSAGENS_ADM01.negado}</p>
            </div>
            <Button asChild variant="outline" className="h-11">
              <Link to="/selecionar-organizacao">Selecionar outra organização</Link>
            </Button>
          </div>
        )}

        {fase === "erro" && (
          <div className="max-w-xl space-y-3">
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-foreground">
              {MENSAGENS_ADM01.erro}
            </div>
            <Button type="button" className="h-11" onClick={() => (erroSessao ? setTentativa((n) => n + 1) : acesso.error ? acesso.refetch() : consulta.refetch())}>
              Tentar novamente
            </Button>
          </div>
        )}

        {d && (
          <section aria-labelledby="adm01-lista" className="rounded-xl border border-border bg-card p-3 sm:p-5">
            <h2 id="adm01-lista" className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Usuários vinculados
            </h2>
            {d.itens.length === 0 ? (
              <p className="text-sm text-muted-foreground">{MENSAGENS_ADM01.vazio}</p>
            ) : (
              <UserMembershipTable
                itens={d.itens}
                perfis={perfis}
                onEditar={(u) => (lembrarGatilho(), setAviso(null), setEditando({ tipo: "editar", usuario: u }))}
                onAuditoria={(u) => (lembrarGatilho(), setAuditando(u))}
              />
            )}
            {d.total_paginas > 1 && (
              <nav aria-label="Paginação de usuários" className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <Button type="button" variant="outline" className="h-11" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                  Anterior
                </Button>
                <span>{`Página ${d.pagina} de ${d.total_paginas}`}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  aria-label="Próxima página"
                  disabled={pagina >= d.total_paginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </Button>
              </nav>
            )}
          </section>
        )}
      </main>

      {editando && org && (
        <ContractScopeDialog
          org={org}
          modo={editando}
          perfis={perfis}
          onFechar={() => (setEditando(null), restaurarFoco())}
          onSalvo={(c, extra) => {
            setAviso(`${extra ?? MENSAGENS_ADM01.salvo} Referência: ${c}`);
            consulta.refetch();
          }}
          obterUsuarioAtual={obterUsuarioAtual}
          onRecarregarLista={() => consulta.refetch()}
        />
      )}
      {auditando && org && (
        <AuditDrawer org={org} usuario={auditando} onFechar={() => (setAuditando(null), restaurarFoco())} onRecarregarLista={() => consulta.refetch()} />
      )}
    </div>
  );
}

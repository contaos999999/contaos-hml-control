import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Building2, ChevronLeft, ChevronRight, Info, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { verificarAcessoOrganizacao } from "@/lib/contratantes/contratantesDados";
import { ErroContratos, formatarMoeda, formatarVigencia, listarContratos, type Contrato } from "@/lib/contratos/contratosDados";

export const MENSAGENS_V104 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contratos…",
  vazio: "Nenhum contrato autorizado nesta organização.",
  negado: "Você não tem acesso aos contratos desta organização.",
  erro: "Não foi possível carregar os contratos agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
} as const;

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function DicaCriticidade() {
  const [aberta, setAberta] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={aberta} onOpenChange={setAberta}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Sobre Criticidade"
            onClick={(e) => {
              e.preventDefault();
              setAberta(true);
            }}
            className={`-my-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted-foreground ${foco}`}
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">Criticidade registrada no cadastro oficial do contrato.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const Selo = ({ texto }: { texto: string }) => (
  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">{texto}</span>
);

function Tabela({ itens }: { itens: Contrato[] }) {
  return (
    <div className="hidden lg:block">
      <table className="w-full table-fixed border-collapse text-sm">
        <caption className="sr-only">Contratos autorizados da organização selecionada</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="w-[12%] py-2 pr-3 font-medium">Número</th>
            <th scope="col" className="w-[22%] py-2 pr-3 font-medium">Objeto</th>
            <th scope="col" className="w-[11%] py-2 pr-3 font-medium">Situação</th>
            <th scope="col" className="w-[18%] py-2 pr-3 font-medium">
              <span className="inline-flex items-center gap-1">
                Criticidade <DicaCriticidade />
              </span>
            </th>
            <th scope="col" className="w-[19%] py-2 pr-3 font-medium">Vigência</th>
            <th scope="col" className="w-[17%] py-2 text-right font-medium">Valor global</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((c) => (
            <tr key={c.id} className="border-b border-border/60 align-top">
              <td className="break-words py-3 pr-3 font-medium tabular-nums"><Link to="/contratos/$id" params={{ id: c.id }} aria-label={`Abrir contrato ${c.numero}`} className={`inline-flex min-h-11 max-w-full items-center rounded underline underline-offset-4 hover:text-primary ${foco}`}>{c.numero}</Link></td>
              <td className="break-words py-3 pr-3">{c.objeto}</td>
              <td className="py-3 pr-3"><Selo texto={c.situacao} /></td>
              <td className="py-3 pr-3"><Selo texto={c.criticidade} /></td>
              <td className="break-words py-3 pr-3 tabular-nums">{formatarVigencia(c.inicio, c.fim)}</td>
              <td className="whitespace-nowrap py-3 text-right tabular-nums">{formatarMoeda(c.valor_global)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cards({ itens }: { itens: Contrato[] }) {
  return (
    <ul aria-label="Contratos (lista compacta)" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
      {itens.map((c) => (
        <li key={c.id} className="rounded-lg border border-border bg-background p-4">
          <p className="break-words font-medium tabular-nums"><Link to="/contratos/$id" params={{ id: c.id }} aria-label={`Abrir contrato ${c.numero}`} className={`inline-flex min-h-11 max-w-full items-center rounded underline underline-offset-4 hover:text-primary ${foco}`}>{c.numero}</Link></p>
          <p className="break-words text-sm text-muted-foreground">{c.objeto}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm min-[360px]:grid-cols-2">
            <div className="min-w-0"><dt className="text-xs text-muted-foreground">Situação</dt><dd><Selo texto={c.situacao} /></dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted-foreground">Criticidade</dt><dd><Selo texto={c.criticidade} /></dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted-foreground">Vigência</dt><dd className="break-words tabular-nums">{formatarVigencia(c.inicio, c.fim)}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted-foreground">Valor global</dt><dd className="break-words tabular-nums">{formatarMoeda(c.valor_global)}</dd></div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function ListaContratos() {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<{ idUsuario: string; idOrganizacao: string } | null>(null);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setErroSessao(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        const semSessao =
          !!error && ((error as { name?: string }).name === "AuthSessionMissingError" || (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user)) return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setErroSessao(true);
        const pref = obterPreferenciaOrganizacao(data.user.id);
        if (!pref) return void navigate({ to: "/selecionar-organizacao", replace: true });
        setCtx({ idUsuario: data.user.id, idOrganizacao: pref });
      })
      .catch(() => {
        if (ativo) setErroSessao(true);
      });
    return () => {
      ativo = false;
    };
  }, [navigate, tentativa]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="md:hidden"><ContaOSMarca /></span>
            
          </div>
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-11"><Link to="/">Painel</Link></Button>
            <Button asChild variant="secondary" className="h-11">
              <Link to="/selecionar-organizacao"><Building2 className="mr-2 h-4 w-4" aria-hidden /> Selecionar organização</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Gestão contratual</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contratos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Contratos autorizados para você na organização selecionada.</p>
        </div>
        <section aria-labelledby="v104-lista" className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 id="v104-lista" className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contratos</h2>
          {erroSessao ? (
            <Alerta mensagem={MENSAGENS_V104.erroSessao} onRetry={() => setTentativa((n) => n + 1)} />
          ) : !ctx ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V104.verificando}
            </p>
          ) : (
            // key por usuário+organização: troca de contexto remonta e zera a página.
            <Conteudo key={`${ctx.idUsuario}:${ctx.idOrganizacao}`} idUsuario={ctx.idUsuario} idOrganizacao={ctx.idOrganizacao} />
          )}
        </section>
      </main>
    </div>
  );
}

function Alerta({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />{mensagem}</p>
      <Button type="button" variant="outline" className="h-11" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente</Button>
    </div>
  );
}

function Conteudo({ idUsuario, idOrganizacao }: { idUsuario: string; idOrganizacao: string }) {
  const [pagina, setPagina] = useState(1);

  const acesso = useQuery({
    queryKey: ["contratos", "acesso", idUsuario, idOrganizacao],
    queryFn: () => verificarAcessoOrganizacao(idOrganizacao),
    retry: false,
  });
  // Sem placeholder: nova chave = loading explícito, nunca dados de outra organização/página.
  const consulta = useQuery({
    queryKey: ["contratos", "lista", idUsuario, idOrganizacao, pagina],
    queryFn: ({ signal }) => listarContratos({ idOrganizacao, pagina }, signal),
    enabled: acesso.isSuccess,
    retry: false,
  });

  const negado = (e: unknown) => (e as { tipo?: string } | null)?.tipo === "negado";
  const dados = consulta.data;
  // Defesa adicional: só renderiza linhas da organização ativa.
  const itens = dados?.itens.filter((c) => c.id_organizacao === idOrganizacao) ?? [];

  if (acesso.isError) {
    return negado(acesso.error) ? <Negado /> : <Alerta mensagem={MENSAGENS_V104.erro} onRetry={() => void acesso.refetch()} />;
  }
  if (consulta.isError) {
    return consulta.error instanceof ErroContratos && consulta.error.tipo === "negado" ? <Negado /> : <Alerta mensagem={MENSAGENS_V104.erro} onRetry={() => void consulta.refetch()} />;
  }
  if (!dados) {
    return (
      <div>
        <p role="status" className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V104.carregando}
        </p>
        <div className="space-y-2" aria-hidden>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      </div>
    );
  }
  if (dados.total === 0) return <p role="status" className="text-sm text-muted-foreground">{MENSAGENS_V104.vazio}</p>;

  return (
    <>
      <p aria-live="polite" className="mb-3 text-sm text-muted-foreground">{`${dados.total.toLocaleString("pt-BR")} contrato(s)`}</p>
      <Tabela itens={itens} />
      <Cards itens={itens} />
      <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Página {dados.pagina} de {dados.totalPaginas}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-11" disabled={dados.pagina <= 1 || consulta.isFetching} onClick={() => setPagina(dados.pagina - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Anterior
          </Button>
          <Button type="button" variant="outline" className="h-11" disabled={dados.pagina >= dados.totalPaginas || consulta.isFetching} onClick={() => setPagina(dados.pagina + 1)}>
            Próxima <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </nav>
    </>
  );
}

function Negado() {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />{MENSAGENS_V104.negado}</p>
      <Button asChild variant="outline" className="h-11"><Link to="/selecionar-organizacao">Selecionar outra organização</Link></Button>
    </div>
  );
}

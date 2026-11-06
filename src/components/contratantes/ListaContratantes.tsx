import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Building2, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, LogOut, MinusCircle, RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroContratantes,
  buscaContemAsterisco,
  formatarDataHora,
  formatarDocumento,
  listarContratantes,
  rotuloSituacao,
  rotuloTipoPessoa,
  verificarAcessoOrganizacao,
  type Contratante,
  type FiltroSituacao,
} from "@/lib/contratantes/contratantesDados";

export const MENSAGENS_V101 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contratantes…",
  vazio: "Nenhum contratante cadastrado nesta organização.",
  vazioFiltro: "Nenhum contratante encontrado para os filtros aplicados.",
  negado: "Você não tem acesso aos contratantes desta organização.",
  erro: "Não foi possível carregar os contratantes agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  buscaAsterisco: "O caractere * não é permitido na busca.",
  buscaInvalidaLista: "Corrija a busca para ver os contratantes.",
} as const;

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function DicaSituacao() {
  const [aberta, setAberta] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={aberta} onOpenChange={setAberta}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Sobre Situação"
            onClick={(e) => {
              e.preventDefault();
              setAberta(true);
            }}
            className={`-my-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted-foreground ${foco}`}
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">Situação registrada no cadastro oficial do contratante.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SeloSituacao({ s }: { s: string }) {
  const ativo = s === "ativo";
  const Icone = ativo ? CheckCircle2 : MinusCircle;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        ativo ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-muted text-muted-foreground"
      }`}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden />
      {rotuloSituacao(s)}
    </span>
  );
}

function Tabela({ itens }: { itens: Contratante[] }) {
  return (
    <div className="hidden md:block">
      <table className="w-full table-fixed border-collapse text-sm">
        <caption className="sr-only">Contratantes da organização selecionada</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="w-[26%] py-2 pr-3 font-medium">Razão social</th>
            <th scope="col" className="w-[18%] py-2 pr-3 font-medium">Nome fantasia</th>
            <th scope="col" className="w-[17%] py-2 pr-3 font-medium">Documento</th>
            <th scope="col" className="w-[13%] py-2 pr-3 font-medium">Tipo</th>
            <th scope="col" className="w-[12%] py-2 pr-3 font-medium">
              <span className="inline-flex items-center gap-1">
                Situação <DicaSituacao />
              </span>
            </th>
            <th scope="col" className="w-[14%] py-2 font-medium">Atualizado em</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((c) => (
            <tr key={c.id} className="border-b border-border/60 align-top">
              <td className="break-words py-3 pr-3 font-medium text-foreground">{c.razao_social}</td>
              <td className="break-words py-3 pr-3 text-muted-foreground">{c.nome_fantasia || "—"}</td>
              <td className="break-words py-3 pr-3 tabular-nums">{formatarDocumento(c.documento)}</td>
              <td className="break-words py-3 pr-3">{rotuloTipoPessoa(c.tipo_pessoa)}</td>
              <td className="py-3 pr-3">
                <SeloSituacao s={c.situacao} />
              </td>
              <td className="break-words py-3 tabular-nums text-muted-foreground">{formatarDataHora(c.atualizado_em)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cards({ itens }: { itens: Contratante[] }) {
  return (
    <ul aria-label="Contratantes (lista compacta)" className="space-y-3 md:hidden">
      {itens.map((c) => (
        <li key={c.id} className="rounded-lg border border-border bg-background p-4">
          <p className="break-words font-medium text-foreground">{c.razao_social}</p>
          {c.nome_fantasia && <p className="break-words text-sm text-muted-foreground">{c.nome_fantasia}</p>}
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm min-[360px]:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Documento</dt>
              <dd className="break-words tabular-nums">{formatarDocumento(c.documento)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Situação</dt>
              <dd>
                <SeloSituacao s={c.situacao} />
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Tipo</dt>
              <dd className="break-words">{rotuloTipoPessoa(c.tipo_pessoa)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Atualizado em</dt>
              <dd className="break-words tabular-nums">{formatarDataHora(c.atualizado_em)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function ListaContratantes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [pagina, setPagina] = useState(1);
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todos");

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
        setIdOrganizacao(pref);
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

  // Debounce da busca: só a busca aplicada vai ao backend; sempre volta à página 1.
  useEffect(() => {
    if (buscaContemAsterisco(buscaDigitada)) return;
    const t = setTimeout(() => {
      const v = buscaDigitada.trim();
      setBusca((atual) => {
        if (atual !== v) setPagina(1);
        return v;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [buscaDigitada]);

  const pronto = !!idUsuario && !!idOrganizacao;
  const buscaInvalida = buscaContemAsterisco(buscaDigitada);

  const acesso = useQuery({
    queryKey: ["contratantes", "acesso", idUsuario, idOrganizacao],
    queryFn: () => verificarAcessoOrganizacao(idOrganizacao!),
    enabled: pronto,
    retry: false,
  });

  // Sem placeholder: qualquer troca de chave mostra loading explícito (nunca dados de outra chave).
  const consulta = useQuery({
    queryKey: ["contratantes", "lista", idUsuario, idOrganizacao, situacao, busca, pagina],
    queryFn: () => listarContratantes({ idOrganizacao: idOrganizacao!, pagina, busca, situacao }),
    enabled: pronto && acesso.isSuccess && !buscaInvalida,
    retry: false,
  });

  // Página além do fim (total encolheu ou faixa inválida): volta à última página válida.
  const dados = consulta.data;
  const erroFaixa = consulta.error instanceof ErroContratantes && consulta.error.tipo === "faixa";
  useEffect(() => {
    if (dados && dados.itens.length === 0 && dados.total > 0 && dados.pagina > 1) setPagina(dados.totalPaginas);
    else if (erroFaixa && pagina > 1) setPagina(1);
  }, [dados, erroFaixa, pagina]);

  function limparFiltros() {
    setBuscaDigitada("");
    setBusca("");
    setSituacao("todos");
    setPagina(1);
  }

  const tipoErro = (e: unknown) => (e instanceof ErroContratantes ? e.tipo : "erro");
  const ajustandoPagina = !!dados && dados.itens.length === 0 && dados.total > 0 && dados.pagina > 1;

  type Fase = "verificando" | "erroSessao" | "carregando" | "negado" | "erro" | "buscaInvalida" | "vazio" | "vazioFiltro" | "sucesso";
  const fase: Fase = erroSessao
    ? "erroSessao"
    : verificando || !pronto
      ? "verificando"
      : acesso.isError
        ? tipoErro(acesso.error) === "negado"
          ? "negado"
          : "erro"
        : !acesso.isSuccess
          ? "carregando"
          : buscaInvalida
            ? "buscaInvalida"
            : consulta.isError && !erroFaixa
            ? tipoErro(consulta.error) === "negado"
              ? "negado"
              : "erro"
            : !dados || ajustandoPagina || erroFaixa
              ? "carregando"
              : dados.total === 0
                ? busca || situacao !== "todos"
                  ? "vazioFiltro"
                  : "vazio"
                : "sucesso";

  function tentarNovamente() {
    if (fase === "erroSessao") {
      setTentativa((n) => n + 1);
      return;
    }
    if (acesso.isError) void acesso.refetch();
    else void consulta.refetch();
  }

  const filtrosAtivos = !!buscaDigitada || situacao !== "todos";

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contratantes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte os contratantes cadastrados na organização selecionada.</p>
        </div>

        {(fase === "verificando" || fase === "erroSessao" || fase === "negado") ? null : (
          <section aria-labelledby="v101-filtros" className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 id="v101-filtros" className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Filtros
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_14rem_auto] md:items-end">
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="v101-busca" className="text-sm font-medium">
                  Buscar por razão social, nome fantasia ou documento
                </label>
                <input
                  id="v101-busca"
                  type="search"
                  maxLength={100}
                  value={buscaDigitada}
                  aria-invalid={buscaInvalida || undefined}
                  aria-describedby={buscaInvalida ? "v101-busca-erro" : undefined}
                  onChange={(e) => setBuscaDigitada(e.target.value)}
                  className={`h-11 w-full rounded-md border border-input bg-background px-3 text-sm ${foco}`}
                />
                {buscaInvalida && (
                  <p id="v101-busca-erro" role="alert" className="text-sm text-destructive">
                    {MENSAGENS_V101.buscaAsterisco}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="v101-situacao" className="text-sm font-medium">
                  Situação
                </label>
                <select
                  id="v101-situacao"
                  value={situacao}
                  onChange={(e) => {
                    setSituacao(e.target.value as FiltroSituacao);
                    setPagina(1);
                  }}
                  className={`h-11 w-full rounded-md border border-input bg-background px-3 text-sm ${foco}`}
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
              <Button type="button" variant="outline" className="h-11" onClick={limparFiltros} disabled={!filtrosAtivos}>
                Limpar filtros
              </Button>
            </div>
          </section>
        )}

        <section aria-labelledby="v101-lista" className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="v101-lista" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Contratantes cadastrados
            </h2>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {fase === "sucesso" && dados ? `${dados.total.toLocaleString("pt-BR")} contratante(s)` : ""}
            </p>
          </div>

          {fase === "verificando" && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V101.verificando}
            </p>
          )}
          {fase === "carregando" && (
            <div>
              <p role="status" className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V101.carregando}
              </p>
              <div className="space-y-2" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          )}
          {(fase === "erro" || fase === "erroSessao") && (
            <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                {fase === "erroSessao" ? MENSAGENS_V101.erroSessao : MENSAGENS_V101.erro}
              </p>
              <Button type="button" variant="outline" className="h-11" onClick={tentarNovamente}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
              </Button>
            </div>
          )}
          {fase === "negado" && (
            <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                {MENSAGENS_V101.negado}
              </p>
              <Button asChild variant="outline" className="h-11">
                <Link to="/selecionar-organizacao">Selecionar outra organização</Link>
              </Button>
            </div>
          )}
          {fase === "buscaInvalida" && <p className="text-sm text-muted-foreground">{MENSAGENS_V101.buscaInvalidaLista}</p>}
          {fase === "vazio" && <p role="status" className="text-sm text-muted-foreground">{MENSAGENS_V101.vazio}</p>}
          {fase === "vazioFiltro" && (
            <div role="status" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{MENSAGENS_V101.vazioFiltro}</p>
              <Button type="button" variant="outline" className="h-11" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            </div>
          )}
          {fase === "sucesso" && dados && (
            <>
              <Tabela itens={dados.itens} />
              <Cards itens={dados.itens} />
              <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Página {dados.pagina} de {dados.totalPaginas}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="h-11" disabled={dados.pagina <= 1 || consulta.isFetching} onClick={() => setPagina(dados.pagina - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={dados.pagina >= dados.totalPaginas || consulta.isFetching}
                    onClick={() => setPagina(dados.pagina + 1)}
                  >
                    Próxima <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </nav>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/**
 * V1-16 — Competência: análise (`/competencias/:id/analise`).
 * Gate: UUID → getUser → preferência de organização (contexto) → `obter_analise_competencia_v116`.
 * Estado, stale, percentual, blocking_summary, allowed_actions e mecanismos são autoridade do
 * backend; a tela não calcula portão, regra nem desatualização.
 * Ações: `solicitar_analise_competencia` ('completa' | 'reanálise'). Abrir requisito = V1-17 (staged).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  History,
  Info,
  Loader2,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  SearchX,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia } from "@/lib/contratos/competenciasDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { atrasoPolling } from "@/lib/contratos/documentosDados";
import { rotuloSituacao } from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  CRITICIDADES,
  FILTROS_VAZIOS,
  MECANISMOS,
  OFFSETS_ZERO,
  RESULTADOS,
  ROTULOS_BLOQUEIO,
  ROTULO_ESTADO_ANALISE,
  ROTULO_MECANISMO,
  STATUS_APONTAMENTO,
  classificarErroV116,
  obterAnaliseCompetencia,
  parseAnaliseV116,
  rotuloCriticidade,
  rotuloResultado,
  rotuloStatusApontamento,
  solicitarAnaliseCompetencia,
  type EstadoAnalise,
  type ExecucaoV116,
  type Filtros,
  type LeituraV116,
  type Offsets,
  type Paginacao,
  type TipoSolicitacao,
} from "@/lib/competencias/competenciaAnaliseDados";

export const MENSAGENS_V116 = {
  carregando: "Carregando análise da competência…",
  naoEncontrada: "Competência não encontrada ou indisponível.",
  negado: "Você não tem acesso a esta competência.",
  erro: "Não foi possível carregar a análise agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  reconciliada: "Solicitação registrada. Acompanhe o andamento abaixo.",
  falhaSolicitacao: "Não foi possível solicitar a análise agora. Tente novamente em instantes.",
  semResultados: "Nenhum requisito analisado para os filtros atuais.",
  semApontamentos: "Nenhum apontamento para os filtros atuais.",
  semExecucoes: "Nenhuma execução registrada.",
} as const;

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro_sessao" }
  | { tipo: "sem_permissao" | "nao_encontrada" | "erro" }
  | { tipo: "ok"; l: LeituraV116 };

const NAO_ENCONTRADA: Estado = { tipo: "nao_encontrada" };
const CARREGANDO: Estado = { tipo: "carregando" };
const EM_ANDAMENTO: EstadoAnalise[] = ["queued", "processing"];

const ehAbort = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

export function CompetenciaAnalise({ id }: { id: string }) {
  const navigate = useNavigate();
  const idOk = uuidValido(id);
  const idC = idOk ? uuidCanonico(id) : id;

  // Estado, filtros, offsets, busca e avisos vinculados ao recurso (idC).
  const [registro, setRegistro] = useState<{ id: string; e: Estado }>({ id: idC, e: CARREGANDO });
  const estado: Estado = !idOk ? NAO_ENCONTRADA : registro.id === idC ? registro.e : CARREGANDO;
  const [idAutorizado, setIdAutorizado] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [ctx, setCtx] = useState<{ id: string; f: Filtros; o: Offsets }>({
    id: idC,
    f: FILTROS_VAZIOS,
    o: OFFSETS_ZERO,
  });
  const f = ctx.id === idC ? ctx.f : FILTROS_VAZIOS;
  const o = ctx.id === idC ? ctx.o : OFFSETS_ZERO;
  const [rascunho, setRascunho] = useState<{ id: string; v: string }>({ id: idC, v: "" });
  const busca = rascunho.id === idC ? rascunho.v : "";
  const [aviso, setAviso] = useState<{ id: string; t: "reconciliada" | "falha" } | null>(null);
  const avisoAtual = aviso && aviso.id === idC ? aviso.t : null;
  const [enviando, setEnviando] = useState<{ id: string } | null>(null);
  const trava = useRef(false);
  const idAtual = useRef(idC);
  idAtual.current = idC;
  const [recarga, setRecarga] = useState(0);
  const polls = useRef(0);

  // Gate de sessão/organização.
  useEffect(() => {
    const setEstado = (e: Estado) => setRegistro({ id: idC, e });
    trava.current = false;
    if (!idOk) {
      setIdAutorizado(null);
      setEstado(NAO_ENCONTRADA);
      return;
    }
    let vivo = true;
    setIdAutorizado(null);
    setEstado(CARREGANDO);
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vivo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user))
          return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setEstado({ tipo: "erro_sessao" });
        if (!obterPreferenciaOrganizacao(data.user.id))
          return void navigate({ to: "/selecionar-organizacao", replace: true });
        setIdAutorizado(idC);
      } catch {
        if (vivo) setEstado({ tipo: "erro_sessao" });
      }
    })();
    return () => {
      vivo = false;
    };
  }, [idOk, idC, navigate, tentativa]);

  // Leitura autoritativa agregada (uma RPC por ciclo).
  const { resultado, criticidade, mecanismo, apStatus, busca: buscaAplicada } = f;
  const { res, exec, ap } = o;
  useEffect(() => {
    if (!idOk || idAutorizado !== idC) return;
    const setEstado = (e: Estado) => setRegistro({ id: idC, e });
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    (async () => {
      try {
        const { data, error, status } = await obterAnaliseCompetencia(
          idC,
          { resultado, criticidade, mecanismo, apStatus, busca: buscaAplicada },
          { res, exec, ap },
          signal,
        );
        if (signal.aborted) return;
        if (error) {
          if (ehAbort(error)) return;
          return void setEstado({ tipo: classificarErroV116(error, status) });
        }
        const l = parseAnaliseV116(data);
        setEstado(l ? { tipo: "ok", l } : { tipo: "erro" });
      } catch (e) {
        if (signal.aborted || ehAbort(e)) return;
        setEstado({ tipo: "erro" });
      }
    })();
    return () => ctrl.abort();
  }, [
    idOk,
    idAutorizado,
    idC,
    resultado,
    criticidade,
    mecanismo,
    apStatus,
    buscaAplicada,
    res,
    exec,
    ap,
    recarga,
  ]);

  // Polling somente quando o backend indica fila/processamento.
  const andamento = estado.tipo === "ok" && EM_ANDAMENTO.includes(estado.l.estado_analise);
  useEffect(() => {
    if (!andamento) {
      polls.current = 0;
      return;
    }
    const t = setTimeout(() => {
      polls.current += 1;
      setRecarga((n) => n + 1);
    }, atrasoPolling(polls.current));
    return () => clearTimeout(t);
  }, [andamento, estado]);

  const mudarFiltro = (k: keyof Filtros, v: string) => {
    const nf = { ...f, [k]: v };
    const no = { ...o };
    if (k === "resultado" || k === "mecanismo") no.res = 0;
    else if (k === "criticidade" || k === "busca") {
      no.res = 0;
      no.ap = 0;
    } else if (k === "apStatus") no.ap = 0;
    setCtx({ id: idC, f: nf, o: no });
  };
  const mudarOffset = (k: keyof Offsets, v: number) =>
    setCtx({ id: idC, f, o: { ...o, [k]: v } });
  const aplicarBusca = (v: string) => mudarFiltro("busca", v.trim());

  const solicitar = async (tipo: TipoSolicitacao, anterior: string | null) => {
    if (trava.current) return;
    trava.current = true;
    const alvo = idC;
    setEnviando({ id: alvo });
    setAviso(null);
    try {
      await solicitarAnaliseCompetencia(alvo, tipo);
      if (idAtual.current === alvo) setRecarga((n) => n + 1);
    } catch {
      // Erro/timeout ambíguo: uma leitura de reconciliação antes de declarar falha.
      let reconciliada: LeituraV116 | null = null;
      try {
        const r = await obterAnaliseCompetencia(alvo, f, o, new AbortController().signal);
        const l = r.error ? null : parseAnaliseV116(r.data);
        if (
          l &&
          (EM_ANDAMENTO.includes(l.estado_analise) || (l.execucao_atual?.id ?? null) !== anterior)
        )
          reconciliada = l;
      } catch {
        reconciliada = null;
      }
      if (idAtual.current === alvo) {
        if (reconciliada) setRegistro({ id: alvo, e: { tipo: "ok", l: reconciliada } });
        setAviso({ id: alvo, t: reconciliada ? "reconciliada" : "falha" });
      }
    } finally {
      if (idAtual.current === alvo) trava.current = false;
      setEnviando(null);
    }
  };

  const tentar = () => setTentativa((n) => n + 1);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <ContaOSMarca />
            <nav aria-label="Navegação" className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="h-11">
                {idOk ? (
                  <Link to="/competencias/$id" params={{ id: idC }}>
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para a competência
                  </Link>
                ) : (
                  <Link to="/contratos">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos
                  </Link>
                )}
              </Button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold">Análise da competência</h1>
            {estado.tipo === "ok" ? (
              <p className="text-sm text-muted-foreground">
                Competência {formatarCompetencia(estado.l.competencia.competencia_referencia)}
              </p>
            ) : null}
          </div>
          {estado.tipo === "nao_encontrada" ? (
            <Aviso icone={<SearchX className="h-4 w-4" aria-hidden />} mensagem={MENSAGENS_V116.naoEncontrada} />
          ) : estado.tipo === "carregando" ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V116.carregando}
            </p>
          ) : estado.tipo === "sem_permissao" ? (
            <Aviso icone={<ShieldAlert className="h-4 w-4" aria-hidden />} mensagem={MENSAGENS_V116.negado} />
          ) : estado.tipo === "erro" || estado.tipo === "erro_sessao" ? (
            <div role="alert" className="space-y-3 rounded-lg border border-destructive/40 bg-card p-4">
              <p className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
                {estado.tipo === "erro" ? MENSAGENS_V116.erro : MENSAGENS_V116.erroSessao}
              </p>
              <Button variant="outline" className="h-11" onClick={tentar}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <AnalysisHeader
                l={estado.l}
                enviando={enviando?.id === idC}
                aviso={avisoAtual}
                onSolicitar={(t) => void solicitar(t, estado.l.execucao_atual?.id ?? null)}
              />
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <PercentGauge percentual={estado.l.percentual} />
                <BlockingSummary bs={estado.l.blocking_summary} />
              </div>
              <MecanismosResumo m={estado.l.mecanismos} />
              <section aria-labelledby="v116-filtros" className="space-y-2">
                <h2 id="v116-filtros" className="sr-only">
                  Filtros
                </h2>
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-11">
                        <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden /> Filtros
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <FilterBar
                        f={f}
                        busca={busca}
                        setBusca={(v) => setRascunho({ id: idC, v })}
                        onFiltro={mudarFiltro}
                        onBusca={aplicarBusca}
                        prefixo="s"
                      />
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="hidden lg:block">
                  <FilterBar
                    f={f}
                    busca={busca}
                    setBusca={(v) => setRascunho({ id: idC, v })}
                    onFiltro={mudarFiltro}
                    onBusca={aplicarBusca}
                    prefixo="i"
                  />
                </div>
              </section>
              <RequirementTable
                l={estado.l}
                onPagina={(v) => mudarOffset("res", v)}
              />
              <ApontamentosBloco l={estado.l} onPagina={(v) => mudarOffset("ap", v)} />
              <HistoricoExecucoes l={estado.l} onPagina={(v) => mudarOffset("exec", v)} />
            </>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <p role="status" className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm">
      {icone} {mensagem}
    </p>
  );
}

/** Tooltip acessível: hover/foco no desktop e toque (clique) no mobile. */
function Dica({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Tooltip open={aberto} onOpenChange={setAberto}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={rotulo}
          onClick={() => setAberto((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-4 w-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{children}</TooltipContent>
    </Tooltip>
  );
}

const ICONE_ESTADO: Record<EstadoAnalise, ReactNode> = {
  not_analyzed: <Clock className="h-4 w-4" aria-hidden />,
  queued: <Clock className="h-4 w-4" aria-hidden />,
  processing: <Loader2 className="h-4 w-4 animate-spin" aria-hidden />,
  failed: <XCircle className="h-4 w-4 text-destructive" aria-hidden />,
  complete: <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />,
  stale: <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />,
};

function AsyncJobStatus({ l }: { l: LeituraV116 }) {
  const e = l.estado_analise;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Estado da análise"
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-muted px-3 text-sm font-medium"
    >
      {ICONE_ESTADO[e]} {ROTULO_ESTADO_ANALISE[e]}
      {e === "failed" && l.execucao_atual?.erro_codigo ? (
        <span className="font-mono text-xs text-muted-foreground">
          (código {l.execucao_atual.erro_codigo})
        </span>
      ) : null}
    </div>
  );
}

function AnalysisHeader({
  l,
  enviando,
  aviso,
  onSolicitar,
}: {
  l: LeituraV116;
  enviando: boolean;
  aviso: "reconciliada" | "falha" | null;
  onSolicitar: (t: TipoSolicitacao) => void;
}) {
  const x = l.execucao_atual;
  return (
    <section aria-labelledby="v116-cab" className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 id="v116-cab" className="text-lg font-semibold">
        Situação da análise
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <AsyncJobStatus l={l} />
        {l.estado_analise === "stale" ? (
          <Dica rotulo="O que significa desatualizada">
            O backend detectou que o contexto da competência mudou após a última execução.
          </Dica>
        ) : null}
        {l.competencia.situacao ? (
          <span className="text-sm text-muted-foreground">
            Situação da competência: {rotuloSituacao(l.competencia.situacao)}
          </span>
        ) : null}
      </div>
      {x ? (
        <p className="text-sm text-muted-foreground">
          Execução atual: {x.tipo ?? "—"} · criada em {formatarDataHoraBr(x.criado_em)}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {l.allowed_actions.executar_analise ? (
          <Button className="h-11" disabled={enviando} onClick={() => onSolicitar("completa")}>
            {enviando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Play className="mr-2 h-4 w-4" aria-hidden />}
            Executar análise
          </Button>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden /> Executar análise: indisponível no momento.
          </p>
        )}
        {l.allowed_actions.reanalisar ? (
          <Button variant="outline" className="h-11" disabled={enviando} onClick={() => onSolicitar("reanálise")}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Reanalisar
          </Button>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden /> Reanalisar: indisponível no momento.
          </p>
        )}
      </div>
      {aviso === "reconciliada" ? (
        <p role="status" className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> {MENSAGENS_V116.reconciliada}
        </p>
      ) : aviso === "falha" ? (
        <p role="alert" className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden /> {MENSAGENS_V116.falhaSolicitacao}
        </p>
      ) : null}
    </section>
  );
}

const fmtPct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function PercentGauge({ percentual }: { percentual: number }) {
  const largura = Math.min(Math.max(percentual, 0), 100);
  return (
    <section aria-labelledby="v116-pct" className="space-y-2 rounded-lg border border-border bg-card p-4">
      <h2 id="v116-pct" className="text-sm font-medium text-muted-foreground">
        Percentual de conformidade (backend)
      </h2>
      <div
        role="meter"
        aria-label="Percentual de conformidade"
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        className="space-y-2"
      >
        <p className="text-3xl font-semibold">{fmtPct.format(percentual)}%</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full bg-primary" style={{ width: `${largura}%` }} />
        </div>
      </div>
    </section>
  );
}

function BlockingSummary({ bs }: { bs: Record<string, unknown> }) {
  const lib = bs["liberado"];
  return (
    <section aria-labelledby="v116-bloq" className="space-y-2 rounded-lg border border-border bg-card p-4">
      <h2 id="v116-bloq" className="text-sm font-medium text-muted-foreground">
        Resumo do portão (backend)
      </h2>
      {typeof lib === "boolean" ? (
        <p className="flex items-center gap-2 text-sm font-medium">
          {lib ? <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
          Liberado pelo portão: {lib ? "Sim" : "Não"}
        </p>
      ) : null}
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {ROTULOS_BLOQUEIO.filter(([k]) => typeof bs[k] === "number").map(([k, r]) => (
          <div key={k} className="flex justify-between gap-2 border-b border-border py-1">
            <dt>{r}</dt>
            <dd className="font-medium">{String(bs[k])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MecanismosResumo({ m }: { m: LeituraV116["mecanismos"] }) {
  return (
    <section aria-labelledby="v116-mec" className="space-y-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-1">
        <h2 id="v116-mec" className="text-sm font-medium text-muted-foreground">
          Mecanismos
        </h2>
        <Dica rotulo="Sobre os mecanismos">
          Como cada resultado foi obtido, segundo o backend. “Não identificado” significa que o
          backend não registrou o mecanismo.
        </Dica>
      </div>
      {m ? (
        <dl className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {MECANISMOS.map((k) => (
            <div key={k} className="rounded-md border border-border p-2">
              <dt>{ROTULO_MECANISMO[k]}</dt>
              <dd className="text-lg font-semibold">{m[k]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Sem execução registrada.</p>
      )}
    </section>
  );
}

const selCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function FilterBar({
  f,
  busca,
  setBusca,
  onFiltro,
  onBusca,
  prefixo,
}: {
  f: Filtros;
  busca: string;
  setBusca: (v: string) => void;
  onFiltro: (k: keyof Filtros, v: string) => void;
  onBusca: (v: string) => void;
  prefixo: string;
}) {
  const sel = (k: keyof Filtros, rotulo: string, opcoes: readonly string[], rot: (v: string) => string) => (
    <div className="space-y-1">
      <label htmlFor={`${prefixo}-${k}`} className="text-sm font-medium">
        {rotulo}
      </label>
      <select
        id={`${prefixo}-${k}`}
        className={selCls}
        value={f[k]}
        onChange={(e) => onFiltro(k, e.target.value)}
      >
        <option value="">Todos</option>
        {opcoes.map((v) => (
          <option key={v} value={v}>
            {rot(v)}
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {sel("resultado", "Resultado", RESULTADOS, rotuloResultado)}
      {sel("criticidade", "Criticidade", CRITICIDADES, rotuloCriticidade)}
      {sel("mecanismo", "Mecanismo", MECANISMOS, (v) => ROTULO_MECANISMO[v as keyof typeof ROTULO_MECANISMO] ?? v)}
      {sel("apStatus", "Status do apontamento", STATUS_APONTAMENTO, rotuloStatusApontamento)}
      <form
        className="space-y-1"
        onSubmit={(e) => {
          e.preventDefault();
          onBusca(busca);
        }}
      >
        <label htmlFor={`${prefixo}-busca`} className="text-sm font-medium">
          Buscar requisito
        </label>
        <div className="flex gap-2">
          <Input
            id={`${prefixo}-busca`}
            className="h-11"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Button type="submit" variant="outline" className="h-11">
            Aplicar busca
          </Button>
        </div>
        {f.busca ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => {
              setBusca("");
              onBusca("");
            }}
          >
            Limpar busca
          </Button>
        ) : null}
      </form>
    </div>
  );
}

function Paginador({ rotulo, p, onPagina }: { rotulo: string; p: Paginacao; onPagina: (n: number) => void }) {
  if (p.total <= p.limite) return null;
  const pag = Math.floor(p.offset / p.limite) + 1;
  const pags = Math.max(1, Math.ceil(p.total / p.limite));
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button
        variant="outline"
        className="h-11"
        aria-label={`Página anterior de ${rotulo}`}
        disabled={p.offset <= 0}
        onClick={() => onPagina(Math.max(0, p.offset - p.limite))}
      >
        Anterior
      </Button>
      <span>
        Página {pag} de {pags} · {p.total} {rotulo}
      </span>
      <Button
        variant="outline"
        className="h-11"
        aria-label={`Próxima página de ${rotulo}`}
        disabled={p.offset + p.limite >= p.total}
        onClick={() => onPagina(p.offset + p.limite)}
      >
        Próxima
      </Button>
    </div>
  );
}

const fmtConf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function RequirementTable({ l, onPagina }: { l: LeituraV116; onPagina: (n: number) => void }) {
  return (
    <section aria-labelledby="v116-req" className="space-y-3">
      <h2 id="v116-req" className="text-lg font-semibold">
        Requisitos analisados
      </h2>
      {l.resultados.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V116.semResultados}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <caption className="sr-only">Requisitos analisados</caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="p-3">Requisito</th>
                <th scope="col" className="p-3">Resultado</th>
                <th scope="col" className="p-3">Criticidade</th>
                <th scope="col" className="p-3">Mecanismo</th>
                <th scope="col" className="p-3">Confiança</th>
                <th scope="col" className="p-3">Justificativa e evidência</th>
                <th scope="col" className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {l.resultados.map((r) => (
                <tr key={r.id_resultado} className="border-t border-border align-top">
                  <td className="p-3">
                    <p className="font-medium">{r.codigo ?? "—"}</p>
                    <p>{r.descricao ?? "—"}</p>
                    {r.fonte_referencia ? (
                      <p className="text-xs text-muted-foreground">Fonte: {r.fonte_referencia}</p>
                    ) : null}
                  </td>
                  <td className="p-3">{rotuloResultado(r.resultado)}</td>
                  <td className="p-3">{r.criticidade ? rotuloCriticidade(r.criticidade) : "—"}</td>
                  <td className="p-3">{ROTULO_MECANISMO[r.mecanismo]}</td>
                  <td className="p-3">{r.confianca === null ? "—" : fmtConf.format(r.confianca)}</td>
                  <td className="space-y-1 p-3">
                    {r.justificativa ? <p>{r.justificativa}</p> : null}
                    {r.fundamento ? (
                      <p className="text-xs text-muted-foreground">Fundamento: {r.fundamento}</p>
                    ) : null}
                    {r.evidencias.map((e, i) => (
                      <p key={e.id || i} className="text-xs text-muted-foreground">
                        {e.tipo_evidencia ? <span>{e.tipo_evidencia} </span> : null}
                        {e.pagina !== null ? <span>p. {e.pagina} </span> : null}
                        {e.trecho ? <span>“{e.trecho}”</span> : null}
                        {e.referencia_externa ? <span> {e.referencia_externa}</span> : null}
                      </p>
                    ))}
                  </td>
                  <td className="p-3">
                    {l.allowed_actions.abrir_requisito ? (
                      <span
                        aria-disabled="true"
                        className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-muted-foreground"
                      >
                        Abrir requisito
                        <span className="rounded bg-muted px-1.5 text-[10px] uppercase">Em breve</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Abrir requisito: Indisponível</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginador rotulo="resultados" p={l.resultados_paginacao} onPagina={onPagina} />
    </section>
  );
}

function ApontamentosBloco({ l, onPagina }: { l: LeituraV116; onPagina: (n: number) => void }) {
  return (
    <section aria-labelledby="v116-ap" className="space-y-3">
      <h2 id="v116-ap" className="text-lg font-semibold">
        Apontamentos
      </h2>
      {l.apontamentos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V116.semApontamentos}</p>
      ) : (
        <ul className="space-y-2">
          {l.apontamentos.map((a) => (
            <li key={a.id} className="space-y-1 rounded-lg border border-border bg-card p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {a.severidade ? (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                    {rotuloCriticidade(a.severidade)}
                  </span>
                ) : null}
                {a.status ? <span className="text-xs">{rotuloStatusApontamento(a.status)}</span> : null}
                {a.codigo ? <span className="text-xs text-muted-foreground">{a.codigo}</span> : null}
              </div>
              {a.descricao ? <p>{a.descricao}</p> : null}
              {a.regra_violada ? (
                <p className="text-xs text-muted-foreground">Regra: {a.regra_violada}</p>
              ) : null}
              {a.acao_sugerida ? (
                <p className="text-xs text-muted-foreground">Ação sugerida: {a.acao_sugerida}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Paginador rotulo="apontamentos" p={l.apontamentos_paginacao} onPagina={onPagina} />
    </section>
  );
}

function LinhaExec({ x }: { x: ExecucaoV116 }) {
  const campos: Array<[string, string | null]> = [
    ["Tipo", x.tipo],
    ["Status", x.status],
    ["Motor", x.motor],
    ["Versão do motor", x.versao_motor],
    ["Provedor", x.provedor],
    ["Modelo", x.modelo],
    ["Versão do prompt", x.prompt_versao],
    ["Hash de entrada", x.hash_entrada],
    ["Iniciada em", x.iniciada_em ? formatarDataHoraBr(x.iniciada_em) : null],
    ["Concluída em", x.concluida_em ? formatarDataHoraBr(x.concluida_em) : null],
    ["Código de erro", x.erro_codigo],
  ];
  return (
    <li className="rounded-lg border border-border bg-card p-3 text-sm">
      <dl className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {campos
          .filter(([, v]) => v !== null && v !== "")
          .map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="break-all">{v}</dd>
            </div>
          ))}
      </dl>
    </li>
  );
}

function HistoricoExecucoes({ l, onPagina }: { l: LeituraV116; onPagina: (n: number) => void }) {
  return (
    <section aria-labelledby="v116-hist" className="space-y-3">
      <h2 id="v116-hist" className="flex items-center gap-2 text-lg font-semibold">
        <History className="h-4 w-4" aria-hidden /> Histórico de execuções
      </h2>
      {l.execucoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V116.semExecucoes}</p>
      ) : (
        <ul className="space-y-2">
          {l.execucoes.map((x) => (
            <LinhaExec key={x.id} x={x} />
          ))}
        </ul>
      )}
      <Paginador rotulo="execuções" p={l.execucoes_paginacao} onPagina={onPagina} />
    </section>
  );
}

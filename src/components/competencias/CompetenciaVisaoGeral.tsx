/**
 * V1-14 — Competência: visão geral (`/competencias/:id`).
 * Gate: UUID → getUser → preferência de organização (contexto) → RPC `obter_visao_geral_competencia` (1x).
 * O backend é a autoridade de acesso, portão e ações. Nenhuma ação crítica é executada aqui.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  SearchX,
  Send,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia, formatarPercentual } from "@/lib/contratos/competenciasDados";
import {
  type AllowedActionsVG,
  type BlockingSummaryVG,
  type EstadoVisual,
  type PortaoVG,
  type TipoErroVisaoGeral,
  type VisaoGeral,
  classificarErroVisaoGeral,
  derivarEstadoVisual,
  obterVisaoGeral,
  parseVisaoGeral,
  rotuloSituacao,
} from "@/lib/competencias/competenciaVisaoGeralDados";

export const MENSAGENS_V114 = {
  carregando: "Carregando competência…",
  naoEncontrada: "Competência não encontrada ou indisponível.",
  negado: "Você não tem acesso a esta competência.",
  erro: "Não foi possível carregar a competência agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
} as const;

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro_sessao" }
  | { tipo: TipoErroVisaoGeral }
  | { tipo: "ok"; vg: VisaoGeral };

const ehAbort = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

export function CompetenciaVisaoGeral({ id }: { id: string }) {
  const navigate = useNavigate();
  const idOk = uuidValido(id);
  const idC = idOk ? uuidCanonico(id) : id;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!idOk) return;
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    setEstado({ tipo: "carregando" });
    (async () => {
      let user: { id: string } | null = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (signal.aborted) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user))
          return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setEstado({ tipo: "erro_sessao" });
        user = data.user;
      } catch {
        if (!signal.aborted) setEstado({ tipo: "erro_sessao" });
        return;
      }
      if (!obterPreferenciaOrganizacao(user.id))
        return void navigate({ to: "/selecionar-organizacao", replace: true });
      try {
        const { data, error, status } = await obterVisaoGeral(idC, signal);
        if (signal.aborted) return;
        if (error) {
          if (ehAbort(error)) return;
          return void setEstado({ tipo: classificarErroVisaoGeral(error, status) });
        }
        if (data === null || data === undefined) return void setEstado({ tipo: "nao_encontrada" });
        const vg = parseVisaoGeral(data);
        setEstado(vg ? { tipo: "ok", vg } : { tipo: "erro" });
      } catch (e) {
        if (signal.aborted || ehAbort(e)) return;
        setEstado({ tipo: "erro" });
      }
    })();
    return () => ctrl.abort();
  }, [idOk, idC, navigate, tentativa]);

  const tentar = () => {
    if (estado.tipo === "carregando") return;
    setTentativa((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <ContaOSMarca />
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-11">
              <Link to="/contratos" activeOptions={{ exact: true }}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {!idOk || estado.tipo === "nao_encontrada" ? (
          <>
            <Titulo />
            <Aviso icone={<SearchX className="h-4 w-4" aria-hidden />} mensagem={MENSAGENS_V114.naoEncontrada} />
          </>
        ) : estado.tipo === "carregando" ? (
          <>
            <Titulo />
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V114.carregando}
            </p>
          </>
        ) : estado.tipo === "sem_permissao" ? (
          <>
            <Titulo />
            <Aviso icone={<ShieldAlert className="h-4 w-4" aria-hidden />} mensagem={MENSAGENS_V114.negado} />
          </>
        ) : estado.tipo === "erro" || estado.tipo === "erro_sessao" ? (
          <>
            <Titulo />
            <div
              role="alert"
              className="flex flex-wrap items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <p className="flex-1">
                {estado.tipo === "erro" ? MENSAGENS_V114.erro : MENSAGENS_V114.erroSessao}
              </p>
              <Button variant="outline" className="h-11" onClick={tentar}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
              </Button>
            </div>
          </>
        ) : (
          <Conteudo vg={estado.vg} />
        )}
      </main>
    </div>
  );
}

function Titulo() {
  return <h1 className="text-2xl font-semibold tracking-tight">Competência</h1>;
}

function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-md border border-border bg-card p-4 text-sm">
      <span className="mt-0.5 text-muted-foreground">{icone}</span>
      <p>{mensagem}</p>
    </div>
  );
}

function Conteudo({ vg }: { vg: VisaoGeral }) {
  const c = vg.competencia;
  return (
    <>
      <PageHeader referencia={c.competencia_referencia} idContrato={c.id_contrato} situacao={c.situacao} />
      <Tabs />
      <div className="grid gap-4 lg:grid-cols-3">
        <EstadoCompetencia estado={derivarEstadoVisual(vg)} />
        <PercentGauge valor={c.percentual_conformidade} portao={vg.portao} />
        <BlockingSummary b={vg.blocking_summary} liberado={vg.portao.liberado} />
      </div>
      <AllowedActions acoes={vg.allowed_actions} />
    </>
  );
}

function PageHeader({
  referencia,
  idContrato,
  situacao,
}: {
  referencia: string;
  idContrato: string;
  situacao: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Competência {formatarCompetencia(referencia)}
        </h1>
        <StatusBadge situacao={situacao} />
      </div>
      <Button asChild variant="outline" className="h-11">
        <Link to="/contratos/$id/competencias" params={{ id: idContrato }}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para competências
        </Link>
      </Button>
    </div>
  );
}

function StatusBadge({ situacao }: { situacao: string }) {
  const rotulo = rotuloSituacao(situacao);
  return (
    <span
      role="status"
      aria-label={`Situação: ${rotulo}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold"
    >
      <ClipboardList className="h-3.5 w-3.5" aria-hidden />
      <span>{rotulo}</span>
    </span>
  );
}

const ESTADOS: Record<EstadoVisual, { rotulo: string; desc: string; icone: ReactNode }> = {
  preparation: {
    rotulo: "Em preparação",
    desc: "Documentos e requisitos em preparação, conforme dados do backend.",
    icone: <ClipboardList className="h-5 w-5" aria-hidden />,
  },
  analysis: {
    rotulo: "Em análise",
    desc: "Requisitos em análise, conforme dados do backend.",
    icone: <Search className="h-5 w-5" aria-hidden />,
  },
  blocked: {
    rotulo: "Com bloqueios",
    desc: "O backend informa não conformidades que impedem a liberação.",
    icone: <Lock className="h-5 w-5" aria-hidden />,
  },
  ready: {
    rotulo: "Pronta conforme backend",
    desc: "Status oficial informado pelo backend.",
    icone: <ShieldCheck className="h-5 w-5" aria-hidden />,
  },
  presented: {
    rotulo: "Apresentada",
    desc: "Competência já apresentada ao contratante, conforme backend.",
    icone: <Send className="h-5 w-5" aria-hidden />,
  },
};

function EstadoCompetencia({ estado }: { estado: EstadoVisual }) {
  const e = ESTADOS[estado];
  return (
    <section
      data-testid="estado-competencia"
      data-estado={estado}
      aria-labelledby="v114-estado"
      className="rounded-lg border border-border bg-card p-4"
    >
      <h2 id="v114-estado" className="text-sm font-medium text-muted-foreground">
        Estado
      </h2>
      <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
        {e.icone} {e.rotulo}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
    </section>
  );
}

function PercentGauge({ valor, portao }: { valor: number | null; portao: PortaoVG }) {
  const largura = valor === null ? 0 : Math.max(0, Math.min(100, valor));
  return (
    <section aria-labelledby="v114-perc" className="rounded-lg border border-border bg-card p-4">
      <h2 id="v114-perc" className="text-sm font-medium text-muted-foreground">
        Conformidade
      </h2>
      <p className="mt-2 text-2xl font-semibold">{formatarPercentual(valor)}</p>
      <div
        role="meter"
        aria-label="Percentual de conformidade informado pelo backend"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valor ?? undefined}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${largura}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Portão: {portao.avaliados} de {portao.total} avaliados · {formatarPercentual(portao.percentual)}
      </p>
    </section>
  );
}

const CAMPOS_BLOQUEIO: Array<[keyof BlockingSummaryVG, string]> = [
  ["pendentes", "Pendentes"],
  ["nao_conformes", "Não conformes"],
  ["inconclusivos", "Inconclusivos"],
  ["em_analise", "Em análise"],
  ["nao_conformidades_bloqueantes", "Não conformidades bloqueantes"],
  ["parecer_aprovado", "Parecer aprovado"],
  ["analise_concluida_atual", "Análise concluída (atual)"],
  ["aprovacao_apresentacao_atual", "Aprovação de apresentação (atual)"],
];

function BlockingSummary({ b, liberado }: { b: BlockingSummaryVG; liberado: boolean }) {
  return (
    <section
      data-testid="blocking-summary"
      aria-labelledby="v114-bloq"
      className="rounded-lg border border-border bg-card p-4"
    >
      <h2 id="v114-bloq" className="text-sm font-medium text-muted-foreground">
        Bloqueios
      </h2>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
        {liberado ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          <Lock className="h-4 w-4" aria-hidden />
        )}
        {liberado ? "Liberado pelo backend" : "Não liberado pelo backend"}
      </p>
      <dl className="mt-2 grid grid-cols-1 gap-1 text-sm">
        {CAMPOS_BLOQUEIO.map(([k, rotulo]) => {
          const v = b[k];
          return (
            <div key={k} data-campo={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{rotulo}</dt>
              <dd className="font-medium">{typeof v === "boolean" ? (v ? "Sim" : "Não") : v}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

const ACOES: Array<[keyof AllowedActionsVG, string]> = [
  ["abrir_documentos", "Abrir documentos"],
  ["analisar", "Analisar"],
  ["abrir_parecer", "Abrir parecer"],
  ["apresentar", "Apresentar"],
];

function AllowedActions({ acoes }: { acoes: AllowedActionsVG }) {
  return (
    <section aria-labelledby="v114-acoes" className="rounded-lg border border-border bg-card p-4">
      <h2 id="v114-acoes" className="text-sm font-medium text-muted-foreground">
        Ações permitidas
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ACOES.map(([k, rotulo]) => (
          <li
            key={k}
            data-testid={`acao-${k}`}
            className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm"
          >
            <span className="font-medium">{rotulo}</span>
            {acoes[k] ? (
              <>
                <span className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Permitida pelo backend
                </span>
                <span
                  aria-disabled="true"
                  className="inline-flex w-fit items-center rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  Em breve
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" aria-hidden /> Bloqueada pelo backend
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const ABAS_FUTURAS = ["Documentos", "Análise", "Parecer", "Apresentação"];

function Tabs() {
  return (
    <div role="tablist" aria-label="Áreas da competência" className="flex flex-wrap gap-2 border-b border-border pb-2">
      <span role="tab" aria-selected="true" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
        Visão geral
      </span>
      {ABAS_FUTURAS.map((t) => (
        <span
          key={t}
          role="tab"
          aria-selected="false"
          aria-disabled="true"
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground"
        >
          {t}
          <span className="rounded bg-muted px-1.5 text-[10px] uppercase">Em breve</span>
        </span>
      ))}
    </div>
  );
}

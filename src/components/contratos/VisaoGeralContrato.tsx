import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Building2, Loader2, RefreshCw, SearchX, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { ErroDetalhe, uuidCanonico, formatarBrl, formatarDataBr, obterContrato, texto, type ContratoDetalhe } from "@/lib/contratos/contratoDetalheDados";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";

export const MENSAGENS_V106 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia: "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
} as const;

const SECOES_FUTURAS = ["Competências"] as const;

export function VisaoGeralContrato({ id }: { id: string }) {
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
            <ContaOSMarca />
          </div>
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-11">
              <Link to="/contratos"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos</Link>
            </Button>
            <Button asChild variant="secondary" className="h-11">
              <Link to="/selecionar-organizacao"><Building2 className="mr-2 h-4 w-4" aria-hidden /> Selecionar organização</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {erroSessao ? (
          <>
            <Titulo />
            <Alerta mensagem={MENSAGENS_V106.erroSessao} onRetry={() => setTentativa((n) => n + 1)} />
          </>
        ) : !ctx ? (
          <>
            <Titulo />
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V106.verificando}
            </p>
          </>
        ) : (
          // key por usuário+organização+id: troca descarta estado e respostas tardias anteriores.
          <Conteudo key={`${ctx.idUsuario}:${ctx.idOrganizacao}:${uuidCanonico(id)}`} id={uuidCanonico(id)} idUsuario={ctx.idUsuario} idOrganizacao={ctx.idOrganizacao} />
        )}
      </main>
    </div>
  );
}

function Titulo({ numero }: { numero?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Gestão contratual</p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{numero ? `Contrato ${numero}` : "Contrato"}</h1>
    </div>
  );
}

function Conteudo({ id, idUsuario, idOrganizacao }: { id: string; idUsuario: string; idOrganizacao: string }) {
  const consulta = useQuery({
    queryKey: ["contratos", "detalhe", idUsuario, idOrganizacao, id],
    queryFn: ({ signal }) => obterContrato(id, signal),
    retry: false,
  });

  if (consulta.isError) {
    const tipo = consulta.error instanceof ErroDetalhe ? consulta.error.tipo : "erro";
    return (
      <>
        <Titulo />
        {tipo === "negado" ? (
          <Aviso icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />} mensagem={MENSAGENS_V106.negado} />
        ) : tipo === "nao_encontrado" ? (
          <Aviso icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} mensagem={MENSAGENS_V106.naoEncontrado} />
        ) : (
          <Alerta mensagem={tipo === "consistencia" ? MENSAGENS_V106.consistencia : MENSAGENS_V106.erro} onRetry={() => void consulta.refetch()} />
        )}
      </>
    );
  }
  const c = consulta.data;
  if (!c || uuidCanonico(c.id) !== id) {
    return (
      <>
        <Titulo />
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V106.carregando}
        </p>
        <div className="space-y-2" aria-hidden>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      </>
    );
  }
  return <Resumo c={c} />;
}

function Selo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
      <span className="text-muted-foreground">{rotulo}:</span> {valor}
    </span>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="break-words text-sm font-medium">{valor}</dd>
    </div>
  );
}

function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 id={id} className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">{titulo}</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Resumo({ c }: { c: ContratoDetalhe }) {
  const vigencia = !c.inicio && !c.fim ? "—" : `${formatarDataBr(c.inicio)} – ${formatarDataBr(c.fim)}`;
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Titulo numero={c.numero} />
        <div className="flex flex-wrap gap-2">
          <Selo rotulo="Situação" valor={texto(c.situacao)} />
          <Selo rotulo="Criticidade" valor={texto(c.criticidade)} />
        </div>
      </div>
      <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
        <ul className="flex flex-wrap gap-2">
          <li>
            <span aria-current="page" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Visão geral</span>
          </li>
          <li>
            <Link to="/contratos/$id/base-normativa" params={{ id: c.id }} className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Base normativa</Link>
          </li>
          <li>
            <Link
              to="/contratos/$id/orcamento"
              params={{ id: c.id }}
              className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Orçamento
            </Link>
          </li>
          <li>
            <Link
              to="/contratos/$id/regras"
              params={{ id: c.id }}
              className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Regras
            </Link>
          </li>
          <li>
            <Link
              to="/contratos/$id/documentos"
              params={{ id: c.id }}
              className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Documentos
            </Link>
          </li>
          {SECOES_FUTURAS.map((s) => (
            <li key={s}>
              <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm text-muted-foreground">
                <span>{s}</span>
                <span className="rounded border border-border px-1.5 text-[0.65rem] uppercase tracking-wide">Em breve</span>
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Secao id="v106-identificacao" titulo="Identificação">
          <Campo rotulo="Objeto" valor={texto(c.objeto)} />
          <Campo rotulo="Tipo de contrato" valor={texto(c.tipo_contrato)} />
          <Campo rotulo="Unidade vinculada" valor={texto(c.unidade_vinculada)} />
          <Campo rotulo="Fonte de recurso" valor={texto(c.fonte_recurso)} />
        </Secao>
        <Secao id="v106-contratante" titulo="Contratante">
          <Campo rotulo="Razão social" valor={texto(c.contratante?.razao_social)} />
          <Campo rotulo="Nome fantasia" valor={texto(c.contratante?.nome_fantasia)} />
          <Campo rotulo="Documento" valor={texto(c.contratante?.documento)} />
        </Secao>
        <Secao id="v106-vigencia" titulo="Vigência e prazos">
          <Campo rotulo="Vigência" valor={vigencia} />
          <Campo rotulo="Periodicidade" valor={texto(c.periodicidade)} />
          <Campo rotulo="Prazo de prestação (dias)" valor={texto(c.prazo_prestacao_dias)} />
          <Campo rotulo="Dia-limite de apresentação" valor={texto(c.dia_limite_apresentacao)} />
        </Secao>
        <Secao id="v106-valores" titulo="Valores">
          <Campo rotulo="Valor global" valor={formatarBrl(c.valor_global)} />
          <Campo rotulo="Valor mensal de referência" valor={formatarBrl(c.valor_mensal_referencia)} />
        </Secao>
      </div>
    </>
  );
}

function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm">{icone}{mensagem}</p>
      <Button asChild variant="outline" className="h-11"><Link to="/contratos">Voltar para contratos</Link></Button>
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

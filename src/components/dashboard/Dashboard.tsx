import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Building2, Info, Loader2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { formatarDataBr, formatarDataHoraBr, formatarNumero, rotuloTipo } from "./dashboardFormatacao";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";

export const MENSAGENS_SYS05 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando resumo…",
  vazio: "Ainda não há contratos ou itens visíveis para esta organização.",
  listaVazia: "Nenhum item no momento.",
  negado: "Acesso negado a esta organização.",
  erro: "Não foi possível carregar o painel agora. Tente novamente em instantes.",
} as const;

export const SCHEMA_SYS05 = "sys05-v1";

type Situacao = { situacao: string; quantidade: number };
type Prazo = {
  tipo: string;
  id: string;
  contrato_numero: string | null;
  titulo: string | null;
  prazo: string | null;
  status: string | null;
  criticidade: string | null;
};
type Atencao = {
  tipo: string;
  id: string;
  contrato_numero: string | null;
  descricao: string | null;
  severidade: string | null;
  status: string | null;
  prazo: string | null;
  criado_em: string | null;
};
export type ResumoDashboard = {
  schema_versao: string;
  gerado_em: string;
  organizacao: { id: string; razao_social: string; nome_fantasia: string | null; situacao: string };
  resumo: Record<
    | "contratos_visiveis"
    | "contratos_ativos"
    | "competencias_em_fluxo"
    | "competencias_exigem_atencao"
    | "itens_com_prazo_vencido"
    | "atencoes_abertas",
    number
  >;
  contratos_por_situacao: Situacao[];
  competencias_por_situacao: Situacao[];
  proximos_prazos: Prazo[];
  atencoes_prioritarias: Atencao[];
};

class ErroResumo extends Error {
  constructor(public tipo: "negado" | "erro") {
    super(tipo);
  }
}

async function buscarResumo(idOrganizacao: string): Promise<ResumoDashboard> {
  const { data, error, status } = await supabase.rpc("obter_resumo_dashboard", { p_id_organizacao: idOrganizacao });
  if (error) {
    const code = (error as { code?: string }).code;
    const negado = code === "42501" || code === "PGRST301" || status === 401 || status === 403;
    throw new ErroResumo(negado ? "negado" : "erro");
  }
  const r = data as unknown as ResumoDashboard | null;
  if (!r || r.schema_versao !== SCHEMA_SYS05) throw new ErroResumo("erro");
  return r;
}

const KPIS: Array<{ chave: keyof ResumoDashboard["resumo"]; rotulo: string; dica: string }> = [
  { chave: "contratos_visiveis", rotulo: "Contratos visíveis", dica: "Contratos que você pode consultar nesta organização." },
  { chave: "contratos_ativos", rotulo: "Contratos ativos", dica: "Contratos com situação ativa, conforme o sistema." },
  { chave: "competencias_em_fluxo", rotulo: "Competências em fluxo", dica: "Competências ainda não validadas, encerradas ou canceladas." },
  { chave: "competencias_exigem_atencao", rotulo: "Competências que exigem atenção", dica: "Competências pendentes de correção ou com apontamentos." },
  { chave: "itens_com_prazo_vencido", rotulo: "Itens com prazo vencido", dica: "Competências, tarefas e não conformidades em aberto com prazo já vencido." },
  { chave: "atencoes_abertas", rotulo: "Atenções abertas", dica: "Apontamentos e não conformidades ainda em tratamento." },
];

function Dica({ rotulo, texto }: { rotulo: string; texto: string }) {
  const [aberta, setAberta] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={aberta} onOpenChange={setAberta}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Sobre ${rotulo}`}
            onClick={(e) => {
              e.preventDefault();
              setAberta(true);
            }}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{texto}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Secao(props: { id: string; titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={props.id} className={`rounded-xl border border-border bg-card p-5 ${props.className ?? ""}`}>
      <h2 id={props.id} className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {props.titulo}
      </h2>
      {props.children}
    </section>
  );
}

function ResumoKpis({ resumo }: { resumo: ResumoDashboard["resumo"] }) {
  return (
    <section aria-labelledby="sys05-kpis">
      <h2 id="sys05-kpis" className="sr-only">
        Indicadores de resumo
      </h2>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border min-[420px]:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((k) => (
          <div key={k.chave} className="bg-card p-5">
            <dt className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{k.rotulo}</span>
              <Dica rotulo={k.rotulo} texto={k.dica} />
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatarNumero(resumo[k.chave])}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DistribuicaoSituacao(props: { id: string; titulo: string; itens: Situacao[] }) {
  return (
    <Secao id={props.id} titulo={props.titulo}>
      {props.itens.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_SYS05.listaVazia}</p>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">{props.titulo}</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Situação</th>
              <th scope="col" className="py-2 text-right font-medium">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {props.itens.map((s) => (
              <tr key={s.situacao} className="border-b border-border/60 last:border-0">
                <td className="break-words py-2 text-foreground">{s.situacao}</td>
                <td className="py-2 text-right tabular-nums text-foreground">{formatarNumero(s.quantidade)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Secao>
  );
}

function Par({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex gap-1">
      <dt className="text-muted-foreground">{rotulo}:</dt>
      <dd className="break-words text-foreground">{valor}</dd>
    </div>
  );
}

function ProximosPrazos({ itens }: { itens: Prazo[] }) {
  return (
    <Secao id="sys05-prazos" titulo="Próximos prazos">
      {itens.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_SYS05.listaVazia}</p>
      ) : (
        <ol className="divide-y divide-border">
          {itens.map((p) => (
            <li key={`${p.tipo}-${p.id}`} className="py-3 first:pt-0 last:pb-0" data-testid="prazo-item">
              <p className="break-words text-sm font-medium text-foreground">{p.titulo ?? "—"}</p>
              <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <Par rotulo="Prazo" valor={formatarDataBr(p.prazo)} />
                <Par rotulo="Tipo" valor={rotuloTipo(p.tipo)} />
                <Par rotulo="Contrato" valor={p.contrato_numero ?? "—"} />
                <Par rotulo="Status" valor={p.status ?? "—"} />
                <Par rotulo="Criticidade" valor={p.criticidade ?? "—"} />
              </dl>
            </li>
          ))}
        </ol>
      )}
    </Secao>
  );
}

function AtencoesPrioritarias({ itens }: { itens: Atencao[] }) {
  return (
    <Secao id="sys05-atencoes" titulo="Atenções prioritárias">
      {itens.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_SYS05.listaVazia}</p>
      ) : (
        <ol className="divide-y divide-border">
          {itens.map((a) => (
            <li key={`${a.tipo}-${a.id}`} className="py-3 first:pt-0 last:pb-0" data-testid="atencao-item">
              <p className="break-words text-sm font-medium text-foreground">{a.descricao ?? "—"}</p>
              <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <Par rotulo="Severidade" valor={a.severidade ?? "—"} />
                <Par rotulo="Status" valor={a.status ?? "—"} />
                <Par rotulo="Tipo" valor={rotuloTipo(a.tipo)} />
                <Par rotulo="Contrato" valor={a.contrato_numero ?? "—"} />
                {a.prazo && <Par rotulo="Prazo" valor={formatarDataBr(a.prazo)} />}
                <Par rotulo="Registrado em" valor={formatarDataHoraBr(a.criado_em)} />
              </dl>
            </li>
          ))}
        </ol>
      )}
    </Secao>
  );
}

function Cabecalho(props: {
  resumo: ResumoDashboard | null;
  saindo: boolean;
  onSair: () => void;
}) {
  const o = props.resumo?.organizacao;
  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <ContaOSMarca />
          <div className="min-w-0 leading-tight">
            {o && (
              <p className="break-words text-sm opacity-80">
                {o.nome_fantasia || o.razao_social} <span className="opacity-70">• Situação: {o.situacao}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="h-11">
            <Link to="/selecionar-organizacao">
              <Building2 className="mr-2 h-4 w-4" aria-hidden /> Trocar organização
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            disabled={props.saindo}
            onClick={props.onSair}
          >
            {props.saindo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="mr-2 h-4 w-4" aria-hidden />}
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const saindoRef = useRef(false);

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
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
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

  const consulta = useQuery({
    queryKey: ["sys05", "resumo", idUsuario, idOrganizacao],
    queryFn: () => buscarResumo(idOrganizacao!),
    enabled: !!idUsuario && !!idOrganizacao,
    retry: false,
  });

  async function sair() {
    if (saindoRef.current) return;
    saindoRef.current = true;
    setSaindo(true);
    await supabase.auth.signOut().catch(() => undefined);
    navigate({ to: "/login", replace: true });
  }

  const pronto = !!idUsuario && !!idOrganizacao;
  const fase: "verificando" | "carregando" | "negado" | "erro" | "sucesso" = erroSessao
    ? "erro"
    : verificando || !pronto
      ? "verificando"
      : consulta.isPending
        ? "carregando"
        : consulta.error
          ? consulta.error instanceof ErroResumo && consulta.error.tipo === "negado"
            ? "negado"
            : "erro"
          : "sucesso";
  const r = fase === "sucesso" ? consulta.data ?? null : null;
  const vazio = !!r && r.resumo.contratos_visiveis === 0 && r.proximos_prazos.length === 0 && r.atencoes_prioritarias.length === 0;
  const tentarNovamente = () => (erroSessao ? setTentativa((n) => n + 1) : consulta.refetch());

  return (
    <div lang="pt-BR" className="min-h-screen bg-background">
      <Cabecalho resumo={r} saindo={saindo} onSair={sair} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Visão geral</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Painel da organização</h1>
          </div>
          {r && <p className="text-xs text-muted-foreground">Atualizado em {r.gerado_em}</p>}
        </div>

        <div aria-live="polite" className="sr-only">
          {fase === "verificando" ? MENSAGENS_SYS05.verificando : fase === "carregando" ? MENSAGENS_SYS05.carregando : ""}
        </div>

        {(fase === "verificando" || fase === "carregando") && (
          <div className="space-y-4" aria-hidden>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {fase === "verificando" ? MENSAGENS_SYS05.verificando : MENSAGENS_SYS05.carregando}
            </p>
            {fase === "carregando" && (
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            )}
          </div>
        )}

        {fase === "negado" && (
          <div className="max-w-xl space-y-3">
            <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <p className="text-sm text-foreground">{MENSAGENS_SYS05.negado}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="h-11">
                <Link to="/selecionar-organizacao">Selecionar outra organização</Link>
              </Button>
              <Button type="button" variant="outline" className="h-11" onClick={sair} disabled={saindo}>
                Sair da conta
              </Button>
            </div>
          </div>
        )}

        {fase === "erro" && (
          <div className="max-w-xl space-y-3">
            <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <p className="text-sm text-foreground">{MENSAGENS_SYS05.erro}</p>
            </div>
            <Button type="button" variant="outline" className="h-11" onClick={tentarNovamente}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
            </Button>
          </div>
        )}

        {r && (
          <>
            {vazio && (
              <p role="status" className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">
                {MENSAGENS_SYS05.vazio}
              </p>
            )}
            <ResumoKpis resumo={r.resumo} />
            <div className="grid gap-6 lg:grid-cols-2">
              <DistribuicaoSituacao id="sys05-contratos" titulo="Contratos por situação" itens={r.contratos_por_situacao} />
              <DistribuicaoSituacao id="sys05-competencias" titulo="Competências por situação" itens={r.competencias_por_situacao} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <ProximosPrazos itens={r.proximos_prazos} />
              <AtencoesPrioritarias itens={r.atencoes_prioritarias} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

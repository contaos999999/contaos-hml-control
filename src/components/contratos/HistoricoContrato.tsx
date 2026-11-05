import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroDetalhe, formatarDataBr, obterContrato, uuidCanonico, uuidValido,
  type ContratoDetalhe,
} from "@/lib/contratos/contratoDetalheDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  ErroHistorico, MENSAGENS_HISTORICO, PAGINA_HISTORICO,
  listarRelatoriosHistoricos, listarApontamentosVinculados,
  listarPrecedentesHistoricos, listarRegrasHistoricas,
  type RelatorioHistorico, type ApontamentoVinculado,
  type PrecedenteHistorico, type RegraHistorica,
} from "@/lib/contratos/historicoContratoDados";

type Ctx = { usuario: string; org: string };
type Aba = "relatorios" | "precedentes" | "regras";
const MENU: Array<{ aba: Aba; titulo: string }> = [
  { aba: "relatorios", titulo: "Relatórios e apontamentos" },
  { aba: "precedentes", titulo: "Precedentes" },
  { aba: "regras", titulo: "Regras preventivas" },
];
const formatarData = (x: string | null) => x ? formatarDataBr(x) : "Não informado";
const formatarHora = (x: string | null) => x ? formatarDataHoraBr(x) : "Não informado";

function Mensagem({ children, erro = false, retry }: {
  children: ReactNode; erro?: boolean; retry?: () => void;
}) {
  return (
    <div role={erro ? "alert" : "status"} className={
      "flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 " +
      (erro ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")
    }>
      <p className="flex min-w-0 items-start gap-2 text-sm">
        {erro && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
        <span>{children}</span>
      </p>
      {retry && (
        <Button type="button" variant="outline" className="min-h-11" onClick={retry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      )}
    </div>
  );
}
function Carregando({ texto }: { texto: string }) {
  return <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {texto}
  </p>;
}
function Paginacao({ offset, total, onChange }: {
  offset: number; total: number; onChange: (offset: number) => void;
}) {
  return <div className="mt-4 flex flex-wrap items-center gap-3">
    <Button type="button" variant="outline" className="min-h-11" disabled={offset === 0}
      onClick={() => onChange(Math.max(0, offset - PAGINA_HISTORICO))}>
      Anterior
    </Button>
    <p role="status" className="text-sm text-muted-foreground">
      {total === 0 ? "Nenhum registro" : `Registros ${Math.min(offset + 1, total)} a ${Math.min(offset + PAGINA_HISTORICO, total)} de ${total}`}
    </p>
    <Button type="button" variant="outline" className="min-h-11"
      disabled={offset + PAGINA_HISTORICO >= total}
      onClick={() => onChange(offset + PAGINA_HISTORICO)}>
      Próxima
    </Button>
  </div>;
}
function ExibirErro({ error, refetch }: { error: unknown; refetch: () => void }) {
  const erro = error instanceof ErroHistorico
    ? MENSAGENS_HISTORICO[error.tipo]
    : "Não foi possível consultar estes registros. Atualize e tente novamente.";
  return <Mensagem erro retry={refetch}>{erro}</Mensagem>;
}
function Etiqueta({ titulo, valor }: { titulo: string; valor: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{titulo}</dt>
      <dd className="break-words text-sm font-medium">{valor || "Não informado"}</dd>
    </div>
  );
}

export function HistoricoContrato({ id }: { id: string }) {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCtx(null);
    setErroSessao(false);
    supabase.auth.getUser().then(({ data, error }) => {
      if (!ativo) return;
      const missing = !!error &&
        ((error as { name?: string }).name === "AuthSessionMissingError" ||
          (error as { code?: string }).code === "session_not_found");
      if (missing || (!error && !data.user)) {
        void navigate({ to: "/login", replace: true });
        return;
      }
      if (error || !data.user) { setErroSessao(true); return; }
      const org = obterPreferenciaOrganizacao(data.user.id);
      if (!org) { void navigate({ to: "/selecionar-organizacao", replace: true }); return; }
      setCtx({ usuario: data.user.id, org });
    }).catch(() => { if (ativo) setErroSessao(true); });
    return () => { ativo = false; };
  }, [navigate, tentativa]);

  const valido = uuidValido(id);
  const canon = valido ? uuidCanonico(id) : id;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <ContaOSMarca />
        <Button asChild variant="secondary" className="min-h-11">
          <Link to="/contratos"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Contratos</Link>
        </Button>
      </div>
    </header>
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Gestão contratual
        </p>
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          Histórico do contrato
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Relatórios anteriores, apontamentos, respostas, desfechos e precedentes oficiais.
        </p>
      </div>
      {erroSessao ? <Mensagem erro retry={() => setTentativa(n => n + 1)}>
        Não foi possível verificar sua sessão. Tente novamente.
      </Mensagem> : !valido ? <Mensagem erro>Identificador de contrato inválido.</Mensagem> : !ctx ?
        <Carregando texto="Verificando sessão…" /> :
        <Conteudo key={`${ctx.usuario}:${ctx.org}:${canon}`} id={canon} ctx={ctx} />}
    </main>
  </div>;
}
function Conteudo({ id, ctx }: { id: string; ctx: Ctx }) {
  const contrato = useQuery({
    queryKey: ["historico", "contrato", ctx.usuario, ctx.org, id],
    queryFn: ({ signal }) => obterContrato(id, signal),
    retry: false,
  });
  if (contrato.isPending) return <Carregando texto="Carregando contrato…" />;
  if (contrato.isError) {
    const tipo = contrato.error instanceof ErroDetalhe ? contrato.error.tipo : "erro";
    const mensagem = tipo === "negado" ? "Você não tem acesso a este contrato."
      : tipo === "nao_encontrado" ? "Contrato não encontrado."
        : "Não foi possível consultar este contrato. Tente novamente.";
    return <Mensagem erro retry={() => void contrato.refetch()}>
      {tipo === "negado" && <ShieldAlert className="mr-1 inline h-4 w-4" aria-hidden />}
      {mensagem}
    </Mensagem>;
  }
  if (!contrato.data || uuidCanonico(contrato.data.id) !== id ||
      uuidCanonico(contrato.data.id_organizacao) !== uuidCanonico(ctx.org)) {
    return <Mensagem erro>O vínculo do contrato com sua organização não pôde ser confirmado.</Mensagem>;
  }
  return <HistoricoConteudo contrato={contrato.data} ctx={ctx} />;
}
function HistoricoConteudo({ contrato, ctx }: { contrato: ContratoDetalhe; ctx: Ctx }) {
  const [aba, setAba] = useState<Aba>("relatorios");
  const [pagina, setPagina] = useState(0);
  const [relatorio, setRelatorio] = useState<string | null>(null);
  const [paginaApontamentos, setPaginaApontamentos] = useState(0);
  const chave = [ctx.usuario, ctx.org, contrato.id];
  const relatorios = useQuery({
    queryKey: ["historico", ...chave, "relatorios", pagina],
    queryFn: ({ signal }) => listarRelatoriosHistoricos(contrato.id, ctx.org, pagina, signal),
    enabled: aba === "relatorios", retry: false,
  });
  const precedentes = useQuery({
    queryKey: ["historico", ...chave, "precedentes", pagina],
    queryFn: ({ signal }) => listarPrecedentesHistoricos(contrato.id, ctx.org, pagina, signal),
    enabled: aba === "precedentes", retry: false,
  });
  const regras = useQuery({
    queryKey: ["historico", ...chave, "regras", pagina],
    queryFn: ({ signal }) => listarRegrasHistoricas(contrato.id, ctx.org, pagina, signal),
    enabled: aba === "regras", retry: false,
  });
  const relatorioAtual = relatorios.data?.itens.find(x => x.id === relatorio) ?? null;
  const apontamentos = useQuery({
    queryKey: ["historico", ...chave, "apontamentos", relatorioAtual?.id, paginaApontamentos],
    queryFn: ({ signal }) => listarApontamentosVinculados(
      contrato.id, ctx.org, relatorioAtual!.id, paginaApontamentos, signal),
    enabled: aba === "relatorios" && !!relatorioAtual, retry: false,
  });
  const mudarAba = (next: Aba) => {
    setAba(next); setPagina(0); setRelatorio(null); setPaginaApontamentos(0);
  };
  const mudarPagina = (next: number) => {
    setPagina(next); setRelatorio(null); setPaginaApontamentos(0);
  };
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="break-words text-sm text-muted-foreground">
        Contrato <strong className="font-semibold text-foreground">{contrato.numero}</strong>
      </p>
      <Button asChild variant="outline" className="min-h-11">
        <Link to="/contratos/$id" params={{ id: contrato.id }}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Visão geral
        </Link>
      </Button>
    </div>
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <p className="flex-1 text-sm text-muted-foreground">Importar relatórios anteriores requer perfil de gestão e autorização do backend.</p>
      <Button asChild variant="outline" className="min-h-11">
        <Link to="/contratos/$id/historico/importar" params={{id:contrato.id}}>
          Importar relatórios (gestão)
        </Link>
      </Button>
    </div>
    <nav aria-label="Áreas do histórico" className="flex flex-wrap gap-2">
      {MENU.map(x => <Button key={x.aba} type="button" className="min-h-11"
        aria-pressed={aba === x.aba} variant={aba === x.aba ? "default" : "outline"}
        onClick={() => mudarAba(x.aba)}>{x.titulo}</Button>)}
    </nav>
    {aba === "relatorios" && <section aria-labelledby="historico-relatorios"
      className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 id="historico-relatorios" className="text-lg font-semibold">Relatórios históricos</h2>
      {relatorios.isPending ? <Carregando texto="Consultando relatórios…" /> :
        relatorios.isError ? <ExibirErro error={relatorios.error} refetch={() => void relatorios.refetch()} /> :
        !relatorios.data?.itens.length ? <Mensagem>
          Nenhum relatório anterior disponível para este contrato.
        </Mensagem> : <>
          <ul className="space-y-3">
            {relatorios.data.itens.map(x => <RelatorioItem
              key={x.id} item={x} ativo={relatorio === x.id}
              onSelecionar={() => { setRelatorio(old => old === x.id ? null : x.id); setPaginaApontamentos(0); }} />)}
          </ul>
          <Paginacao offset={pagina} total={relatorios.data.total} onChange={mudarPagina} />
          {relatorioAtual && <section aria-labelledby="historico-apontamentos"
            className="space-y-4 rounded-lg border border-border bg-background p-4">
            <h3 id="historico-apontamentos" className="text-base font-semibold">
              Apontamentos do relatório {relatorioAtual.numero_documento || "selecionado"}
            </h3>
            {apontamentos.isPending ? <Carregando texto="Consultando apontamentos…" /> :
              apontamentos.isError ? <ExibirErro error={apontamentos.error}
                refetch={() => void apontamentos.refetch()} /> :
                !apontamentos.data?.itens.length ? <Mensagem>
                  Nenhum apontamento disponível para este relatório.
                </Mensagem> : <>
                  <ul className="space-y-3">
                    {apontamentos.data.itens.map(x => <ApontamentoItem key={x.id} item={x} />)}
                  </ul>
                  <Paginacao offset={paginaApontamentos} total={apontamentos.data.total}
                    onChange={setPaginaApontamentos} />
                </>}
          </section>}
        </>}
    </section>}
    {aba === "precedentes" && <section aria-labelledby="historico-precedentes"
      className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 id="historico-precedentes" className="text-lg font-semibold">Precedentes do contrato</h2>
      {precedentes.isPending ? <Carregando texto="Consultando precedentes…" /> :
        precedentes.isError ? <ExibirErro error={precedentes.error}
          refetch={() => void precedentes.refetch()} /> :
          !precedentes.data?.itens.length ? <Mensagem>
            Nenhum precedente registrado para este contrato.
          </Mensagem> : <>
            <ul className="space-y-3">
              {precedentes.data.itens.map(x => <PrecedenteItem key={x.id} item={x} />)}
            </ul>
            <Paginacao offset={pagina} total={precedentes.data.total} onChange={setPagina} />
          </>}
    </section>}
    {aba === "regras" && <section aria-labelledby="historico-regras"
      className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 id="historico-regras" className="text-lg font-semibold">Regras preventivas vinculadas</h2>
      {regras.isPending ? <Carregando texto="Consultando regras…" /> :
        regras.isError ? <ExibirErro error={regras.error}
          refetch={() => void regras.refetch()} /> :
          !regras.data?.itens.length ? <Mensagem>
            Nenhuma regra preventiva vinculada a este contrato.
          </Mensagem> : <>
            <ul className="space-y-3">
              {regras.data.itens.map(x => <RegraItem key={x.id} item={x} />)}
            </ul>
            <Paginacao offset={pagina} total={regras.data.total} onChange={setPagina} />
          </>}
    </section>}
  </>;
}
function RelatorioItem({ item, ativo, onSelecionar }: {
  item: RelatorioHistorico; ativo: boolean; onSelecionar: () => void;
}) {
  return <li className="rounded-lg border border-border p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <h3 className="break-words font-semibold">
          {item.tipo} {item.numero_documento || "sem número"}
        </h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Etiqueta titulo="Data do documento" valor={formatarData(item.data_documento)} />
          <Etiqueta titulo="Competência de referência" valor={item.competencia_referencia} />
          <Etiqueta titulo="Processamento oficial" valor={item.status_processamento} />
          <Etiqueta titulo="Resultado oficial" valor={item.resultado_geral} />
          <Etiqueta titulo="Origem temporal" valor={item.origem_temporal} />
          <Etiqueta titulo="Registrado em" valor={formatarHora(item.criado_em)} />
        </dl>
      </div>
      <Button type="button" variant={ativo ? "secondary" : "outline"}
        aria-expanded={ativo} className="min-h-11" onClick={onSelecionar}>
        {ativo ? "Ocultar apontamentos" : "Ver apontamentos"}
      </Button>
    </div>
  </li>;
}
function ApontamentoItem({ item }: { item: ApontamentoVinculado }) {
  return <li className="space-y-3 rounded-lg border border-border bg-card p-4">
    <h4 className="break-words font-semibold">
      Apontamento {item.item || "sem número"}
    </h4>
    <p className="whitespace-pre-wrap break-words text-sm">{item.problema}</p>
    <dl className="grid gap-3 sm:grid-cols-2">
      <Etiqueta titulo="Severidade oficial" valor={item.severidade} />
      <Etiqueta titulo="Página da fonte" valor={item.fonte_pagina === null ? null : String(item.fonte_pagina)} />
      <Etiqueta titulo="Fundamento" valor={item.fundamento} />
    </dl>
    <div>
      <h5 className="text-sm font-semibold">Respostas</h5>
      {item.respostas.length ? <ul className="mt-2 space-y-2">
        {item.respostas.map(x => <li key={x.id} className="rounded-md bg-muted p-3 text-sm">
          <p className="whitespace-pre-wrap break-words">{x.texto}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatarHora(x.criado_em)}</p>
        </li>)}
      </ul> : <p className="mt-1 text-sm text-muted-foreground">Nenhuma resposta vinculada.</p>}
    </div>
    <div>
      <h5 className="text-sm font-semibold">Desfechos</h5>
      {item.desfechos.length ? <ul className="mt-2 space-y-2">
        {item.desfechos.map(x => <li key={x.id} className="rounded-md bg-muted p-3 text-sm">
          <strong>{x.resultado}</strong>
          <p className="text-xs text-muted-foreground">{formatarData(x.data)}</p>
        </li>)}
      </ul> : <p className="mt-1 text-sm text-muted-foreground">Nenhum desfecho vinculado.</p>}
    </div>
  </li>;
}
function PrecedenteItem({ item }: { item: PrecedenteHistorico }) {
  return <li className="space-y-3 rounded-lg border border-border p-4">
    <h3 className="break-words font-semibold">{item.titulo || "Precedente sem título"}</h3>
    <p className="whitespace-pre-wrap break-words text-sm">{item.problema}</p>
    <dl className="grid gap-3 sm:grid-cols-2">
      <Etiqueta titulo="Situação oficial" valor={item.status} />
      <Etiqueta titulo="Origem" valor={item.fonte_tipo} />
      <Etiqueta titulo="Desfecho" valor={item.desfecho} />
      <Etiqueta titulo="Solução registrada" valor={item.solucao} />
      <Etiqueta titulo="Registrado em" valor={formatarHora(item.criado_em)} />
    </dl>
  </li>;
}
function RegraItem({ item }: { item: RegraHistorica }) {
  return <li className="space-y-3 rounded-lg border border-border p-4">
    <h3 className="break-words font-semibold">{item.codigo_regra}</h3>
    <p className="whitespace-pre-wrap break-words text-sm">{item.descricao}</p>
    <dl className="grid gap-3 sm:grid-cols-2">
      <Etiqueta titulo="Situação oficial" valor={item.situacao} />
      <Etiqueta titulo="Efeito" valor={item.efeito} />
      <Etiqueta titulo="Registrada em" valor={formatarHora(item.criado_em)} />
    </dl>
  </li>;
}

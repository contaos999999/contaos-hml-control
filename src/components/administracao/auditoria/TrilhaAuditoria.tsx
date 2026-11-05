import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { obterEventosAuditoria } from "@/lib/administracao/auditoriaDados";

export function TrilhaAuditoria() {
  const navigate = useNavigate();
  const [org, setOrg] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [evento, setEvento] = useState("");
  const [entidade, setEntidade] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!ativo) return;
      if (error || !data.user) { navigate({ to: "/login", replace: true }); return; }
      const selecionada = obterPreferenciaOrganizacao(data.user.id);
      if (!selecionada) { navigate({ to: "/selecionar-organizacao", replace: true }); return; }
      setOrg(selecionada);
    }).catch(() => { if (ativo) setErroSessao(true); }).finally(() => { if (ativo) setVerificando(false); });
    return () => { ativo = false; };
  }, [navigate]);
  const consulta = useQuery({
    queryKey: ["v1-23", org, pagina, evento, entidade, idUsuario, correlationId, inicio, fim],
    queryFn: () => obterEventosAuditoria({
      idOrganizacao: org!, pagina, evento, entidade, idUsuario, correlationId,
      ...(inicio ? { dataInicial: new Date(inicio + "T00:00:00-03:00").toISOString() } : {}),
      ...(fim ? { dataFinal: new Date(fim + "T23:59:59-03:00").toISOString() } : {}),
    }),
    enabled: !!org, retry: false,
  });
  const campos = [
    { nome: "Evento", valor: evento, mudar: setEvento },
    { nome: "Entidade", valor: entidade, mudar: setEntidade },
    { nome: "ID do usuário", valor: idUsuario, mudar: setIdUsuario },
    { nome: "Correlation ID", valor: correlationId, mudar: setCorrelationId },
  ];
  const dataBr = (v: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium" }).format(new Date(v));
  return <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
    <header className="space-y-2"><h1 className="text-2xl font-bold">Trilha de auditoria</h1>
      <p className="text-sm text-muted-foreground">Histórico de eventos da organização. Informações sensíveis não são exibidas.</p></header>
    <section aria-label="Filtros de auditoria" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {campos.map(c => <label key={c.nome} className="flex flex-col gap-1 text-sm">{c.nome}
        <input className="rounded border bg-background p-2 focus-visible:outline-2 focus-visible:outline-offset-2" value={c.valor} onChange={e => { c.mudar(e.target.value); setPagina(0); }} /></label>)}
      <label className="flex flex-col gap-1 text-sm">Data inicial<input type="date" className="rounded border bg-background p-2" value={inicio} onChange={e => { setInicio(e.target.value); setPagina(0); }} /></label>
      <label className="flex flex-col gap-1 text-sm">Data final<input type="date" className="rounded border bg-background p-2" value={fim} onChange={e => { setFim(e.target.value); setPagina(0); }} /></label>
    </section>
    {erroSessao ? <p role="alert">Não foi possível verificar sua sessão. Atualize a página ou entre novamente.</p>
      : verificando || consulta.isPending ? <p role="status">Carregando trilha de auditoria…</p>
      : consulta.isError ? <div role="alert" className="space-y-2"><p>{consulta.error instanceof Error ? consulta.error.message : "Falha ao consultar eventos."}</p><button className="rounded border p-2" onClick={() => consulta.refetch()}>Tentar novamente</button></div>
      : !consulta.data?.eventos.length ? <p role="status">Nenhum evento encontrado para os filtros selecionados.</p>
      : <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Eventos de auditoria da organização</caption>
          <thead><tr>{["Data e hora", "Evento", "Entidade", "Usuário", "Correlação"].map(h => <th scope="col" className="border-b p-2" key={h}>{h}</th>)}</tr></thead>
          <tbody>{consulta.data.eventos.map(e => <tr key={e.id}><td className="border-b p-2">{dataBr(e.criado_em)}</td><td className="border-b p-2">{e.evento}</td><td className="border-b p-2">{e.entidade}</td><td className="border-b p-2">{e.id_usuario ?? "Sistema"}</td><td className="border-b p-2">{e.correlation_id}</td></tr>)}</tbody>
        </table></div>}
    <nav aria-label="Paginação da auditoria" className="flex items-center gap-4">
      <button className="rounded border px-3 py-2 disabled:opacity-50" disabled={pagina === 0 || consulta.isFetching} onClick={() => setPagina(p => Math.max(0, p - 1))}>Anterior</button>
      <span aria-live="polite">Página {pagina + 1}</span>
      <button className="rounded border px-3 py-2" disabled={consulta.isFetching || !consulta.data || (pagina + 1) * 25 >= consulta.data.total} onClick={() => setPagina(p => p + 1)}>Próxima</button>
    </nav>
  </main>;
}

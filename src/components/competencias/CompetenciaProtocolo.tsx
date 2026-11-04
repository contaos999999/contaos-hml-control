/** PROMPT 41 / V1-20. Consulta à apresentação e ao pacote congelado no backend. */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, FileCheck2, Loader2, Lock, RefreshCw } from "lucide-react";

import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  obterVisaoGeral, parseVisaoGeral, classificarErroVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  consultarProtocolo, ErroProtocolo, MENSAGENS_PROTOCOLO,
  PAGINA_ITENS_PROTOCOLO, type ConsultaProtocolo, type TipoErroProtocolo,
} from "@/lib/competencias/protocoloDados";

type Estado =
  | { tipo: "carregando" | "sessao" | "sem_permissao" | "nao_encontrado" | "vazio" | "erro" | "invalido" }
  | { tipo: "ok"; dados: ConsultaProtocolo };

function Mensagem({ children, erro = false }: { children: React.ReactNode; erro?: boolean }) {
  return <div role={erro ? "alert" : "status"}
    className={"flex items-start gap-2 rounded-md border p-4 text-sm " +
      (erro ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")}>
    {erro ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
      : <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
    <span>{children}</span>
  </div>;
}
function rotuloData(valor: string | null) { return valor ? formatarDataHoraBr(valor) : "Não informado"; }
function erroConsulta(error: unknown): TipoErroProtocolo {
  return error instanceof ErroProtocolo ? error.tipo : "erro";
}

export function CompetenciaProtocolo({
  id, apresentacaoId,
}: { id: string; apresentacaoId: string }) {
  const navigate = useNavigate();
  const valido = uuidValido(id) && uuidValido(apresentacaoId);
  const competencia = uuidValido(id) ? uuidCanonico(id) : id;
  const apresentacao = uuidValido(apresentacaoId) ? uuidCanonico(apresentacaoId) : apresentacaoId;
  const chave = competencia + ":" + apresentacao;
  const ultima = useRef(chave);
  ultima.current = chave;

  const [pagina, setPagina] = useState<{ chave: string; offset: number }>({ chave, offset: 0 });
  const offset = pagina.chave === chave ? pagina.offset : 0;
  const [recarregar, setRecarregar] = useState(0);
  const [resposta, setResposta] = useState<{ chave: string; offset: number; estado: Estado }>({
    chave, offset: 0, estado: { tipo: "carregando" },
  });
  const estado: Estado = !valido ? { tipo: "invalido" } :
    resposta.chave === chave && resposta.offset === offset ? resposta.estado : { tipo: "carregando" };

  useEffect(() => {
    if (!valido) return;
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    setResposta({ chave, offset, estado: { tipo: "carregando" } });
    (async () => {
      try {
        const { data: sessao, error } = await supabase.auth.getUser();
        if (signal.aborted) return;
        const semSessao =
          (error as { name?: string; code?: string } | null)?.name === "AuthSessionMissingError" ||
          (error as { name?: string; code?: string } | null)?.code === "session_not_found";
        if (semSessao || (!error && !sessao.user)) {
          navigate({ to: "/login", replace: true });
          return;
        }
        if (error || !sessao.user) {
          setResposta({ chave, offset, estado: { tipo: "sessao" } });
          return;
        }
        const org = obterPreferenciaOrganizacao(sessao.user.id);
        if (!org) {
          navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        const r = await obterVisaoGeral(competencia, signal);
        if (signal.aborted) return;
        if (r.error) {
          const t = classificarErroVisaoGeral(r.error, r.status);
          setResposta({ chave, offset, estado: {
            tipo: t === "sem_permissao" ? "sem_permissao" : t === "nao_encontrada" ? "nao_encontrado" : "erro",
          } });
          return;
        }
        const vg = parseVisaoGeral(r.data);
        if (!vg || !uuidValido(vg.competencia.id) || uuidCanonico(vg.competencia.id) !== competencia ||
          vg.competencia.id_organizacao !== org || !uuidValido(vg.competencia.id_contrato)) {
          setResposta({ chave, offset, estado: { tipo: "erro" } });
          return;
        }
        const d = await consultarProtocolo(
          competencia, apresentacao, org, uuidCanonico(vg.competencia.id_contrato), offset, signal);
        if (signal.aborted || ultima.current !== chave) return;
        setResposta({ chave, offset, estado: d ? { tipo: "ok", dados: d } : { tipo: "vazio" } });
      } catch (e) {
        if (signal.aborted || ultima.current !== chave) return;
        setResposta({ chave, offset, estado: { tipo: erroConsulta(e) } });
      }
    })();
    return () => ctrl.abort();
  }, [chave, competencia, apresentacao, offset, recarregar, valido, navigate]);

  const recarregarPagina = () => setRecarregar(x => x + 1);
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <ContaOSMarca />
        <nav aria-label="Navegação">
          <Button variant="secondary" asChild className="min-h-11">
            <Link to="/competencias/$id" params={{ id: competencia }}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar à competência
            </Link>
          </Button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apresentação e protocolo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Registro oficial e pacote congelado da competência.</p>
        </div>
        <Button variant="outline" type="button" onClick={recarregarPagina} className="min-h-11">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar consulta
        </Button>
      </div>
      {estado.tipo === "carregando" ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Consultando apresentação…
      </p> : estado.tipo === "ok" ? <>
        <section aria-labelledby="v120-apresentacao" className="rounded-lg border border-border bg-card p-5">
          <h2 id="v120-apresentacao" className="text-lg font-semibold">Dados da apresentação</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-muted-foreground">Protocolo externo</dt><dd className="break-words font-medium">{estado.dados.apresentacao.protocolo || "Não informado"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Forma de apresentação</dt><dd className="break-words">{estado.dados.apresentacao.forma_apresentacao || "Não informada"}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Apresentado em</dt><dd>{rotuloData(estado.dados.apresentacao.apresentado_em)}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Rodada</dt><dd>{estado.dados.apresentacao.numero_rodada}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Identificador oficial</dt>
              <dd className="break-all font-mono text-xs">{estado.dados.apresentacao.id}</dd></div>
          </dl>
        </section>
        <section aria-labelledby="v120-pacote" className="rounded-lg border border-border bg-card p-5">
          <h2 id="v120-pacote" className="text-lg font-semibold">Pacote imutável</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-muted-foreground">Número</dt><dd>{estado.dados.pacote.numero}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Situação oficial</dt><dd className="break-words">{estado.dados.pacote.status}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Congelado em</dt><dd>{rotuloData(estado.dados.pacote.congelado_em)}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Tipo</dt><dd>{estado.dados.pacote.tipo}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Hash criptográfico do pacote</dt>
              <dd className="break-all font-mono text-xs">{estado.dados.pacote.hash_pacote}</dd></div>
          </dl>
        </section>
        <section aria-labelledby="v120-itens" className="rounded-lg border border-border bg-card p-5">
          <h2 id="v120-itens" className="text-lg font-semibold">Itens preservados no pacote</h2>
          <p className="mt-1 text-sm text-muted-foreground">{estado.dados.total} registro(s) na versão congelada.</p>
          {estado.dados.itens.length ? <ul className="mt-4 space-y-3">
            {estado.dados.itens.map(item => <li key={item.id} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">Item {item.ordem}: {item.entidade_tipo}</p>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">Hash: {item.hash}</p>
              {item.versao_id && <p className="mt-1 break-all text-xs text-muted-foreground">Versão: {item.versao_id}</p>}
            </li>)}
          </ul> : <Mensagem>Nenhum item nesta página do pacote.</Mensagem>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="min-h-11" disabled={offset === 0}
              onClick={() => setPagina({ chave, offset: Math.max(0, offset - PAGINA_ITENS_PROTOCOLO) })}>Anterior</Button>
            <p className="text-sm text-muted-foreground" role="status">
              {estado.dados.total ? Math.min(offset + 1, estado.dados.total) : 0}–{Math.min(offset + estado.dados.itens.length, estado.dados.total)} de {estado.dados.total}
            </p>
            <Button type="button" variant="outline" className="min-h-11"
              disabled={offset + PAGINA_ITENS_PROTOCOLO >= estado.dados.total}
              onClick={() => setPagina({ chave, offset: offset + PAGINA_ITENS_PROTOCOLO })}>Próxima</Button>
          </div>
        </section>
      </> : estado.tipo === "sem_permissao" ? <Mensagem erro>
        <Lock className="mr-2 inline h-4 w-4" aria-hidden />
        {MENSAGENS_PROTOCOLO.sem_permissao}
      </Mensagem> : estado.tipo === "sessao" ? <Mensagem erro>
        Não foi possível confirmar sua sessão. Atualize e tente novamente.
      </Mensagem> : estado.tipo === "vazio" ? <Mensagem>
        Nenhuma apresentação disponível para esta competência e identificador.
      </Mensagem> : <Mensagem erro>{MENSAGENS_PROTOCOLO[
        estado.tipo === "invalido" ? "invalido" : estado.tipo === "nao_encontrado" ? "nao_encontrado" : "erro"
      ]}</Mensagem>}
    </main>
  </div>;
}

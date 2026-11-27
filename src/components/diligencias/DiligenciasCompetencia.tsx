import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  classificarErroVisaoGeral,
  obterVisaoGeral,
  parseVisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { consultarUltimoParecer, ROTULOS_PROCESSAMENTO_PARECER } from "@/lib/diligencias/pareceresContratanteDados";
import { formatarDataBr, uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  ErroDiligencias,
  listarCiclosDiligencia,
  PAGINA_DILIGENCIAS,
  ROTULOS_CICLO,
  type CicloDiligencia,
} from "@/lib/diligencias/diligenciasDados";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

type Estado =
  | { tipo: "carregando" | "invalido" | "sem_permissao" | "nao_encontrada" | "erro" }
  | { tipo: "ok"; itens: CicloDiligencia[]; total: number; ultimo?: Awaited<ReturnType<typeof consultarUltimoParecer>>; falhaParecer?: boolean };

const mensagens = {
  invalido: "O endereço informado para a competência não é válido.",
  sem_permissao: "Você não possui permissão para consultar as diligências desta competência.",
  nao_encontrada: "Competência indisponível para consulta.",
  erro: "Não foi possível consultar as diligências. Tente novamente.",
} as const;

export function DiligenciasCompetencia({ id }: { id: string }) {
  const navigate = useNavigate();
  const valido = uuidValido(id);
  const competencia = valido ? uuidCanonico(id) : id;
  const atual = useRef<AbortController | null>(null);
  const [revisao, setRevisao] = useState(0);
  const chave = competencia + ":" + revisao;
  const [pagina, setPagina] = useState({ chave, offset: 0 });
  const offset = pagina.chave === chave ? pagina.offset : 0;
  const [resposta, setResposta] = useState<{
    chave: string;
    offset: number;
    estado: Estado;
  } | null>(null);
  const estado: Estado = !valido
    ? { tipo: "invalido" }
    : resposta?.chave === chave && resposta.offset === offset
      ? resposta.estado
      : { tipo: "carregando" };

  const revalidar = useCallback(() => {
    atual.current?.abort();
    setRevisao((valor) => valor + 1);
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (evento !== "INITIAL_SESSION") revalidar();
    });
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, revalidar);
    return () => {
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, revalidar);
      data.subscription.unsubscribe();
    };
  }, [revalidar]);

  useEffect(() => {
    if (!valido) return;
    const controller = new AbortController();
    atual.current = controller;
    const { signal } = controller;
    const atualizar = (proximo: Estado) => {
      if (!signal.aborted) setResposta({ chave, offset, estado: proximo });
    };
    atualizar({ tipo: "carregando" });

    const consultar = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        signal.throwIfAborted();
        const semSessao =
          error?.name === "AuthSessionMissingError" || error?.code === "session_not_found";
        if (semSessao || (!error && !data.user)) {
          void navigate({ to: "/login", replace: true });
          return;
        }
        if (error || !data.user) throw new ErroDiligencias("erro");
        const organizacao = obterPreferenciaOrganizacao(data.user.id);
        if (!organizacao || !uuidValido(organizacao)) {
          void navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        const visao = await obterVisaoGeral(competencia, signal);
        signal.throwIfAborted();
        if (visao.error) {
          atualizar({ tipo: classificarErroVisaoGeral(visao.error, visao.status) });
          return;
        }
        if (visao.data === null || visao.data === undefined) {
          atualizar({ tipo: "nao_encontrada" });
          return;
        }
        const vg = parseVisaoGeral(visao.data);
        if (!vg || !uuidValido(vg.competencia.id_contrato)) throw new ErroDiligencias("erro");
        if (
          uuidCanonico(vg.competencia.id) !== competencia ||
          vg.competencia.id_organizacao !== uuidCanonico(organizacao)
        ) {
          throw new ErroDiligencias("sem_permissao");
        }
        const ciclos = await listarCiclosDiligencia(
          competencia,
          organizacao,
          vg.competencia.id_contrato,
          offset,
          signal,
        );
        if (obterPreferenciaOrganizacao(data.user.id) !== organizacao) {
          throw new ErroDiligencias("sem_permissao");
        }
        atualizar({ tipo: "ok", ...ciclos });
        try {
          const ultimo = await consultarUltimoParecer({ id_competencia: competencia, id_organizacao: organizacao, id_contrato: vg.competencia.id_contrato }, signal);
          atualizar({ tipo: "ok", ...ciclos, ultimo });
        } catch {
          atualizar({ tipo: "ok", ...ciclos, falhaParecer: true });
        }
      } catch (erro) {
        atualizar({
          tipo:
            erro instanceof ErroDiligencias && erro.tipo === "sem_permissao"
              ? "sem_permissao"
              : "erro",
        });
      }
    };

    void consultar();
    return () => {
      controller.abort();
      if (atual.current === controller) atual.current = null;
    };
  }, [chave, competencia, navigate, offset, valido]);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <nav aria-label="Navegação da competência">
        <Button asChild variant="ghost" className="min-h-11">
          {valido ? (
            <Link to="/competencias/$id" params={{ id: competencia }}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar à competência
            </Link>
          ) : (
            <Link to="/contratos">Voltar aos contratos</Link>
          )}
        </Button>
      </nav>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Diligências</h1>
        <p className="text-sm text-muted-foreground">Acompanhe as rodadas da competência.</p>
      </header>
      {estado.tipo === "ok" && (
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/competencias/$id/pareceres-contratante" params={{ id: competencia }}>
            Pareceres do contratante
          </Link>
        </Button>
      )}
      {estado.tipo === "ok" && (
        <section aria-label="Último parecer recebido" className="rounded-md border border-border bg-card p-4 text-sm">
          <h2 className="font-semibold">Último parecer recebido</h2>
          {estado.ultimo ? <>
            <p className="break-words">{estado.ultimo.parecer.numero_documento || "Parecer sem número"}</p>
            <p>{formatarDataHoraBr(estado.ultimo.parecer.recebido_em)}</p>
            <p>Processamento: {ROTULOS_PROCESSAMENTO_PARECER[estado.ultimo.processamento.status]}</p>
          </> : <p role="status">{estado.falhaParecer ? "Parecer indisponível para consulta." : estado.ultimo === null ? "Nenhum parecer recebido." : "Consultando último parecer…"}</p>}
        </section>
      )}
      {valido && (
        <Button
          variant="outline"
          className="min-h-11"
          onClick={revalidar}
          disabled={estado.tipo === "carregando"}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Atualizar consulta
        </Button>
      )}
      {estado.tipo === "carregando" ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Consultando diligências…
        </p>
      ) : estado.tipo !== "ok" ? (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm">
          {mensagens[estado.tipo]}
        </p>
      ) : estado.total === 0 ? (
        <p role="status" className="rounded-md border border-border bg-card p-4 text-sm">
          Nenhuma diligência registrada para esta competência.
        </p>
      ) : (
        <section aria-label="Rodadas de diligência" className="space-y-3">
          <p role="status" className="text-sm text-muted-foreground">
            {estado.total} {estado.total === 1 ? "rodada registrada" : "rodadas registradas"}.
          </p>
          <ul className="space-y-3">
            {estado.itens.map((item) => (
              <li key={item.id} className="space-y-3 rounded-md border border-border bg-card p-4">
                <h2 className="text-base font-semibold">Rodada {item.numero_rodada}</h2>
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground">Situação</dt>
                    <dd>{ROTULOS_CICLO[item.status]}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Recebida em</dt>
                    <dd>{formatarDataHoraBr(item.recebido_em)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Prazo de resposta</dt>
                    <dd>
                      {item.prazo_resposta ? formatarDataBr(item.prazo_resposta) : "Não informado"}
                    </dd>
                  </div>
                  {item.encerrado_em && (
                    <div>
                      <dt className="text-muted-foreground">Encerrada em</dt>
                      <dd>{formatarDataHoraBr(item.encerrado_em)}</dd>
                    </div>
                  )}
                </dl>
                <Button asChild variant="outline" className="min-h-11">
                  <Link to="/diligencias/$cicloId" params={{ cicloId: item.id }}>
                    Abrir rodada {item.numero_rodada}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
          {(offset > 0 || offset + PAGINA_DILIGENCIAS < estado.total) && (
            <nav aria-label="Paginação das rodadas" className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={offset === 0}
                onClick={() => setPagina({ chave, offset: offset - PAGINA_DILIGENCIAS })}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={offset + PAGINA_DILIGENCIAS >= estado.total}
                onClick={() => setPagina({ chave, offset: offset + PAGINA_DILIGENCIAS })}
              >
                Próxima
              </Button>
            </nav>
          )}
        </section>
      )}
    </main>
  );
}

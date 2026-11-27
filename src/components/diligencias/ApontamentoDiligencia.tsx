import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  consultarApontamentoDiligencia,
  type DetalheApontamentoDiligencia,
  type LeituraApontamento,
} from "@/lib/diligencias/apontamentoDiligenciaDados";
import {
  ROTULOS_APONTAMENTO,
  ROTULOS_SEVERIDADE,
  formatarValorDiligencia,
} from "@/lib/diligencias/cicloDiligenciaDados";
import { ErroDiligencias } from "@/lib/diligencias/diligenciasDados";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const MENSAGENS = {
  invalido: "O endereço informado para o apontamento não é válido.",
  nao_encontrado: "Apontamento indisponível nesta rodada.",
  sem_permissao: "Você não possui permissão para consultar este apontamento.",
  erro: "Não foi possível consultar este apontamento.",
} as const;

const CLASSIFICACOES: Record<string, string> = {
  procedente: "Procedente",
  parcialmente_procedente: "Parcialmente procedente",
  nao_procedente: "Não procedente",
  inconclusivo: "Requer análise humana",
};
const PACOTE = {
  incluida: "Versão presente no pacote de origem",
  posterior: "Versão criada após o congelamento",
  fora: "Versão não localizada no pacote de origem",
  indisponivel: "Vínculo com o pacote indisponível",
};
const CARTAO = "space-y-3 rounded-md border border-border bg-card p-4 sm:p-5";

type Estado =
  | { tipo: "carregando" | keyof typeof MENSAGENS }
  | { tipo: "ok"; dados: DetalheApontamentoDiligencia };

export function ApontamentoDiligencia({
  cicloId,
  id,
  offset,
}: {
  cicloId: string;
  id: string;
  offset?: number | undefined;
}) {
  const navigate = useNavigate();
  const atual = useRef<AbortController | null>(null);
  const [revisao, setRevisao] = useState(0);
  const cicloValido = uuidValido(cicloId);
  const valido = cicloValido && uuidValido(id);
  const ciclo = cicloValido ? uuidCanonico(cicloId) : cicloId;
  const itemId = valido ? uuidCanonico(id) : id;
  const chave = ciclo + ":" + itemId + ":" + revisao;

  const [resposta, setResposta] = useState<{ chave: string; estado: Estado }>();
  const estado: Estado = !valido
    ? { tipo: "invalido" }
    : resposta?.chave === chave
      ? resposta.estado
      : { tipo: "carregando" };
  const revalidar = useCallback(() => {
    atual.current?.abort();
    setRevisao((n) => n + 1);
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
    const responder = (estado: Estado) => {
      if (!signal.aborted) setResposta({ chave, estado });
    };
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        signal.throwIfAborted();
        if (
          error?.name === "AuthSessionMissingError" ||
          error?.code === "session_not_found" ||
          (!error && !data.user)
        ) {
          void navigate({ to: "/login", replace: true });
          return;
        }
        if (error || !data.user) throw new ErroDiligencias("erro");
        const org = obterPreferenciaOrganizacao(data.user.id);
        if (!org || !uuidValido(org)) {
          void navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        const dados = await consultarApontamentoDiligencia(ciclo, itemId, org, signal);
        if (obterPreferenciaOrganizacao(data.user.id) !== org)
          throw new ErroDiligencias("sem_permissao");
        responder({ tipo: "ok", dados });
      } catch (erro) {
        responder({ tipo: erro instanceof ErroDiligencias ? erro.tipo : "erro" });
      }
    })();
    return () => {
      controller.abort();
      if (atual.current === controller) atual.current = null;
    };
  }, [chave, ciclo, itemId, navigate, valido]);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <nav aria-label="Navegação do apontamento">
        <Button asChild variant="ghost" className="min-h-11">
          {cicloValido ? (
            <Link
              to="/diligencias/$cicloId"
              params={{ cicloId: ciclo }}
              search={{
                ...(offset === undefined ? {} : { offset }),
                ...(valido ? { foco: itemId } : {}),
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar ao ciclo
            </Link>
          ) : (
            <Link to="/contratos">Voltar aos contratos</Link>
          )}
        </Button>
      </nav>
      <header className="space-y-2">
        <h1 className="break-words text-2xl font-semibold">Detalhe do apontamento</h1>
        {estado.tipo === "ok" && (
          <p className="text-sm">Rodada {estado.dados.ciclo.numero_rodada}</p>
        )}
      </header>
      {estado.tipo === "carregando" ? (
        <p role="status" className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando apontamento…
        </p>
      ) : estado.tipo === "ok" ? (
        <>
          <Conteudo dados={estado.dados} offset={offset} />
          <Button variant="outline" className="min-h-11" onClick={revalidar}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar apontamento
          </Button>
        </>
      ) : (
        <div className={CARTAO}>
          <p
            role={estado.tipo === "erro" || estado.tipo === "sem_permissao" ? "alert" : "status"}
            className="text-sm"
          >
            {MENSAGENS[estado.tipo]}
          </p>
          {estado.tipo === "erro" && (
            <Button variant="outline" className="min-h-11" onClick={revalidar}>
              Tentar novamente
            </Button>
          )}
        </div>
      )}
    </main>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="whitespace-pre-wrap break-words">{valor ?? "Não informado"}</dd>
    </div>
  );
}

function Secao<T>({
  id,
  titulo,
  leitura,
  children,
}: {
  id: string;
  titulo: string;
  leitura: LeituraApontamento<T>;
  children: (dados: T) => ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={CARTAO}>
      <h2 className="text-lg font-semibold" id={id}>
        {titulo}
      </h2>
      {leitura.estado === "ok" ? (
        children(leitura.dados)
      ) : (
        <p role="alert" className="text-sm">
          {leitura.estado === "sem_permissao"
            ? "Seu perfil não possui permissão para esta consulta."
            : "Não foi possível consultar estes registros."}
        </p>
      )}
    </section>
  );
}

function Conteudo({
  dados,
  offset,
}: {
  dados: DetalheApontamentoDiligencia;
  offset?: number | undefined;
}) {
  const { ciclo, item, apresentacao, evidencias, tarefas } = dados;
  return (
    <>
      <section aria-labelledby="dados-apontamento" className={CARTAO}>
        <h2 id="dados-apontamento" className="break-words text-lg font-semibold">
          {item.codigo ?? "Apontamento"}
        </h2>
        <p className="whitespace-pre-wrap break-words">{item.descricao}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Campo rotulo="Situação" valor={ROTULOS_APONTAMENTO[item.situacao]} />
          <Campo rotulo="Severidade" valor={ROTULOS_SEVERIDADE[item.severidade]} />
          <Campo
            rotulo="Classificação sugerida"
            valor={
              item.classificacao ? (CLASSIFICACOES[item.classificacao] ?? item.classificacao) : null
            }
          />
          <Campo
            rotulo="Valor questionado"
            valor={formatarValorDiligencia(item.valorQuestionado)}
          />
          <Campo rotulo="Glosa potencial" valor={formatarValorDiligencia(item.glosaPotencial)} />
          <Campo rotulo="Valor aceito" valor={formatarValorDiligencia(item.valorAceito)} />
          <Campo
            rotulo="Impacto financeiro estimado"
            valor={formatarValorDiligencia(item.impactoEstimado)}
          />
          <Campo rotulo="Fundamento do apontamento" valor={item.fundamento} />
        </dl>
      </section>

      <Secao id="origem-apontamento" titulo="Parecer de origem" leitura={dados.fonte}>
        {(fonte) =>
          fonte.estado !== "REGISTRADA" ? (
            <p role="status" className="text-sm">
              {fonte.estado === "ORIGEM_NAO_REGISTRADA"
                ? "O vínculo com o parecer de origem não foi registrado para este item."
                : "A fonte registrada está indisponível para consulta."}
            </p>
          ) : (
            <>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Campo rotulo="Número do parecer" valor={fonte.numero} />
                <Campo rotulo="Arquivo de origem" valor={fonte.nome} />
                <Campo rotulo="Página" valor={fonte.pagina} />
                <Campo
                  rotulo="SHA-256 do arquivo"
                  valor={<code className="break-all">{fonte.sha256}</code>}
                />
                <Campo rotulo="Trecho do parecer" valor={fonte.trecho} />
              </dl>
              {apresentacao.estado === "ok" && apresentacao.dados ? (
                <Button asChild variant="outline" className="min-h-11">
                  <Link
                    to="/competencias/$id/apresentacoes/$apresentacaoId"
                    params={{ id: ciclo.id_competencia, apresentacaoId: apresentacao.dados.id }}
                  >
                    Ver protocolo de origem
                  </Link>
                </Button>
              ) : (
                fonte.apresentacaoId && (
                  <p role={apresentacao.estado === "ok" ? "status" : "alert"} className="text-sm">
                    Protocolo de origem indisponível para consulta.
                  </p>
                )
              )}
            </>
          )
        }
      </Secao>

      <Secao id="analises-apontamento" titulo="Análises e sugestões" leitura={dados.analises}>
        {(analises) =>
          analises.length === 0 ? (
            <p className="text-sm">Sem análises acessíveis para este item.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {analises.map((analise) => (
                <li
                  key={analise.id}
                  className="space-y-1 break-words border-b border-border/60 pb-3 last:border-none"
                >
                  <p className="font-medium">
                    {CLASSIFICACOES[analise.classificacao] ?? analise.classificacao}
                  </p>
                  <p className="whitespace-pre-wrap">{analise.fundamento}</p>
                  <p className="text-muted-foreground">{formatarDataHoraBr(analise.criadaEm)}</p>
                  {evidencias.estado === "ok" &&
                    evidencias.dados.versoes
                      .filter((v) => analise.versoes.includes(v.versaoId))
                      .map((v) => (
                        <p key={v.versaoId}>
                          <a
                            className="underline underline-offset-4 focus-visible:ring-2"
                            href={"#evidencia-" + v.versaoId}
                          >
                            {v.titulo} · versão {v.numero}
                          </a>
                        </p>
                      ))}
                </li>
              ))}
            </ul>
          )
        }
      </Secao>

      <Secao
        id="revisoes-apontamento"
        titulo="Revisões humanas das tarefas"
        leitura={dados.revisoes}
      >
        {(revisoes) =>
          revisoes.length === 0 ? (
            <p className="text-sm">Sem revisões humanas acessíveis para este item.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {revisoes.map((revisao) => (
                <li key={revisao.id} className="space-y-1 break-words">
                  <p className="font-medium">
                    {revisao.aprovada ? "Solução validada" : "Solução devolvida para ajuste"}
                  </p>
                  <p>{revisao.tarefa}</p>
                  <p className="whitespace-pre-wrap">{revisao.fundamento}</p>
                  <p className="text-muted-foreground">{formatarDataHoraBr(revisao.revisadaEm)}</p>
                </li>
              ))}
            </ul>
          )
        }
      </Secao>

      <Secao id="evidencias-apontamento" titulo="Versões de evidência" leitura={evidencias}>
        {(resultado) => (
          <>
            {resultado.versoes.length === 0 && resultado.indisponiveis === 0 && (
              <p className="text-sm">Sem versões vinculadas nas análises e tarefas acessíveis.</p>
            )}
            {resultado.indisponiveis > 0 && (
              <p role="status" className="text-sm">
                Há versões referidas que estão indisponíveis para consulta.
              </p>
            )}
            {resultado.versoes.length > 0 && (
              <ul className="space-y-4 text-sm">
                {resultado.versoes.map((v) => (
                  <li
                    key={v.versaoId}
                    id={"evidencia-" + v.versaoId}
                    tabIndex={-1}
                    className="space-y-1 break-words"
                  >
                    <h3 className="font-medium">
                      {v.titulo} · versão {v.numero}
                    </h3>
                    <p>{PACOTE[v.pacote]}</p>
                    <p>
                      SHA-256 <code className="break-all">{v.hash}</code>
                    </p>
                    {tarefas.estado === "ok" &&
                      tarefas.dados
                        .filter((t) => t.versaoId === v.versaoId)
                        .map((tarefa) => (
                          <p key={tarefa.id}>Evidência da tarefa {tarefa.descricao}</p>
                        ))}
                    {v.tipo === "contrato" ? (
                      <Button
                        asChild
                        variant="link"
                        className="min-h-11 h-auto whitespace-normal px-0 text-left"
                      >
                        <Link
                          to="/contratos/$id/documentos/$idDocumento"
                          params={{ id: ciclo.id_contrato, idDocumento: v.documentoId }}
                          search={{
                            versao: v.versaoId,
                            ciclo: ciclo.id,
                            apontamento: item.id,
                            ...(offset === undefined ? {} : { offset }),
                          }}
                        >
                          Abrir versão {v.numero} em {v.titulo}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="link"
                        className="min-h-11 h-auto whitespace-normal px-0 text-left"
                      >
                        <Link
                          to="/competencias/$id/documentos"
                          params={{ id: ciclo.id_competencia }}
                        >
                          Ver documentos da competência
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Secao>

      <Secao id="desfechos-apontamento" titulo="Desfecho do apontamento" leitura={dados.desfechos}>
        {(desfechos) =>
          desfechos.length === 0 ? (
            <p className="text-sm">Sem desfecho externo acessível.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {desfechos.map((desfecho) => (
                <li key={desfecho.id} className="space-y-1 break-words">
                  <p className="font-medium">{desfecho.tipo}</p>
                  <p className="whitespace-pre-wrap">{desfecho.texto}</p>
                  <p className="text-muted-foreground">
                    {formatarDataHoraBr(desfecho.registradoEm)}
                  </p>
                </li>
              ))}
            </ul>
          )
        }
      </Secao>
    </>
  );
}

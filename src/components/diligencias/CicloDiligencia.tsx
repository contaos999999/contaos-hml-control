import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { formatarDataBr, uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  ROTULOS_APONTAMENTO,
  ROTULOS_SEVERIDADE,
  consultarCicloDiligencia,
  formatarValorDiligencia,
  type DetalheCicloDiligencia,
} from "@/lib/diligencias/cicloDiligenciaDados";
import {
  ErroDiligencias,
  PAGINA_DILIGENCIAS,
  ROTULOS_CICLO,
} from "@/lib/diligencias/diligenciasDados";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const mensagens = {
  invalido: "O endereço informado para o ciclo não é válido.",
  nao_encontrado: "Ciclo indisponível para consulta.",
  sem_permissao: "Você não possui permissão para consultar este ciclo.",
  erro: "Não foi possível consultar este ciclo. Tente novamente.",
} as const;

type Estado =
  { tipo: "carregando" | keyof typeof mensagens } | { tipo: "ok"; dados: DetalheCicloDiligencia };
const PAGINA_INICIAL = { pareceres: 0, apontamentos: 0 };
type Offsets = typeof PAGINA_INICIAL;

export function CicloDiligencia({
  id,
  offset,
  foco,
}: {
  id: string;
  offset?: number | undefined;
  foco?: string | undefined;
}) {
  const navigate = useNavigate();
  const valido = uuidValido(id);
  const cicloId = valido ? uuidCanonico(id) : id;
  const atual = useRef<AbortController | null>(null);
  const [revisao, setRevisao] = useState(0);
  const offsetsIniciais = useMemo(
    () => (offset ? { ...PAGINA_INICIAL, apontamentos: offset } : PAGINA_INICIAL),
    [offset],
  );
  const chave = cicloId + ":" + revisao + ":" + (offset ?? 0) + ":" + (foco ?? "");
  const [pagina, setPagina] = useState({ chave, offsets: offsetsIniciais });
  const offsets = pagina.chave === chave ? pagina.offsets : offsetsIniciais;
  const [resposta, setResposta] = useState<{
    chave: string;
    offsets: Offsets;
    estado: Estado;
  } | null>(null);
  const estado: Estado = !valido
    ? { tipo: "invalido" }
    : resposta?.chave === chave && resposta.offsets === offsets
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
      if (!signal.aborted) setResposta({ chave, offsets, estado });
    };

    const consultar = async () => {
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
        const dados = await consultarCicloDiligencia(cicloId, org, offsets, signal);
        if (obterPreferenciaOrganizacao(data.user.id) !== org)
          throw new ErroDiligencias("sem_permissao");
        responder({ tipo: "ok", dados });
      } catch (erro) {
        responder({ tipo: erro instanceof ErroDiligencias ? erro.tipo : "erro" });
      }
    };
    void consultar();
    return () => {
      controller.abort();
      if (atual.current === controller) atual.current = null;
    };
  }, [chave, cicloId, navigate, offsets, valido]);

  const mudarPagina = (grupo: keyof Offsets, offset: number) =>
    setPagina({ chave, offsets: { ...offsets, [grupo]: offset } });
  const dados = estado.tipo === "ok" ? estado.dados : null;
  const retornoAplicado = useRef("");
  useEffect(() => {
    if (!dados || !foco) return;
    const alvo = document.getElementById("abrir-apontamento-" + foco);
    const chaveRetorno = cicloId + ":" + foco + ":" + (offset ?? 0);
    if (!alvo || retornoAplicado.current === chaveRetorno) return;
    retornoAplicado.current = chaveRetorno;
    alvo.focus();
  }, [cicloId, dados, foco, offset]);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <nav aria-label="Navegação da diligência">
        <Button asChild variant="ghost" className="min-h-11">
          {dados ? (
            <Link to="/competencias/$id/diligencias" params={{ id: dados.ciclo.id_competencia }}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar às diligências
            </Link>
          ) : (
            <Link to="/contratos">Voltar aos contratos</Link>
          )}
        </Button>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight">Ciclo de diligência</h1>
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
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Consultando ciclo…
        </p>
      ) : estado.tipo === "ok" ? (
        <ConteudoCiclo dados={estado.dados} offsets={offsets} mudarPagina={mudarPagina} />
      ) : (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm">
          {mensagens[estado.tipo]}
        </p>
      )}
    </main>
  );
}

function ConteudoCiclo({
  dados,
  offsets,
  mudarPagina,
}: {
  dados: DetalheCicloDiligencia;
  offsets: Offsets;
  mudarPagina: (grupo: keyof Offsets, offset: number) => void;
}) {
  const { ciclo, pareceres, apontamentos } = dados;
  return (
    <>
      <section
        aria-labelledby="rodada"
        className="space-y-3 rounded-md border border-border bg-card p-4"
      >
        <h2 id="rodada" className="text-lg font-semibold">
          Rodada {ciclo.numero_rodada}
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Campo rotulo="Situação" valor={ROTULOS_CICLO[ciclo.status]} />
          <Campo rotulo="Recebida em" valor={formatarDataHoraBr(ciclo.recebido_em)} />
          <Campo
            rotulo="Prazo de resposta"
            valor={ciclo.prazo_resposta && formatarDataBr(ciclo.prazo_resposta)}
          />
          {ciclo.encerrado_em && (
            <Campo rotulo="Encerrada em" valor={formatarDataHoraBr(ciclo.encerrado_em)} />
          )}
        </dl>
      </section>
      <section aria-labelledby="origens-da-rodada" className="space-y-3">
        <h2 id="origens-da-rodada" className="text-lg font-semibold">
          Pareceres da rodada
        </h2>
        {pareceres.total === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            Nenhum parecer vinculado a esta rodada.
          </p>
        ) : (
          <ul className="space-y-3">
            {pareceres.itens.map((parecer) => (
              <li
                key={parecer.id}
                className="space-y-3 rounded-md border border-border bg-card p-4"
              >
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Campo rotulo="Número do documento" valor={parecer.numeroDocumento} />
                  <Campo rotulo="Resultado informado" valor={parecer.resultado} />
                  <Campo rotulo="Recebido em" valor={formatarDataHoraBr(parecer.recebidoEm)} />
                  <Campo
                    rotulo="Emitido em"
                    valor={parecer.dataEmissao && formatarDataBr(parecer.dataEmissao)}
                  />
                </dl>
                {parecer.apresentacaoId && (
                  <Button asChild variant="outline" className="min-h-11">
                    <Link
                      to="/competencias/$id/apresentacoes/$apresentacaoId"
                      params={{ id: ciclo.id_competencia, apresentacaoId: parecer.apresentacaoId }}
                    >
                      Ver protocolo de origem
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <Paginacao
          rotulo="Paginação dos pareceres"
          offset={offsets.pareceres}
          total={pareceres.total}
          alterar={(n) => mudarPagina("pareceres", n)}
        />
      </section>
      <section aria-labelledby="itens-da-rodada" className="space-y-3">
        <h2 id="itens-da-rodada" className="text-lg font-semibold">
          Apontamentos da rodada
        </h2>
        {apontamentos.total === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            Nenhum apontamento registrado nesta rodada.
          </p>
        ) : (
          <ul className="space-y-3">
            {apontamentos.itens.map((item) => (
              <li key={item.id} className="space-y-3 rounded-md border border-border bg-card p-4">
                {item.codigo && <h3 className="break-words font-semibold">{item.codigo}</h3>}
                <p className="break-words text-sm">
                  {item.descricao || "Descrição não informada."}
                </p>
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <Campo rotulo="Situação" valor={ROTULOS_APONTAMENTO[item.situacao]} />
                  <Campo rotulo="Severidade" valor={ROTULOS_SEVERIDADE[item.severidade]} />
                  <Campo rotulo="Classificação sugerida" valor={item.classificacao} />
                  <Campo
                    rotulo="Valor questionado"
                    valor={formatarValorDiligencia(item.valorQuestionado)}
                  />
                  <Campo
                    rotulo="Glosa potencial"
                    valor={formatarValorDiligencia(item.glosaPotencial)}
                  />
                  <Campo rotulo="Valor aceito" valor={formatarValorDiligencia(item.valorAceito)} />
                  <Campo
                    rotulo="Impacto financeiro estimado"
                    valor={formatarValorDiligencia(item.impactoEstimado)}
                  />
                </dl>
                <Button asChild variant="outline" className="min-h-11">
                  <Link
                    id={"abrir-apontamento-" + item.id}
                    to="/diligencias/$cicloId/apontamentos/$id"
                    params={{ cicloId: ciclo.id, id: item.id }}
                    search={offsets.apontamentos ? { offset: offsets.apontamentos } : {}}
                  >
                    {item.codigo ? `Abrir apontamento ${item.codigo}` : "Abrir apontamento"}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Paginacao
          rotulo="Paginação dos apontamentos"
          offset={offsets.apontamentos}
          total={apontamentos.total}
          alterar={(n) => mudarPagina("apontamentos", n)}
        />
      </section>
    </>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="break-words">{valor || "Não informado"}</dd>
    </div>
  );
}

function Paginacao({
  rotulo,
  offset,
  total,
  alterar,
}: {
  rotulo: string;
  offset: number;
  total: number;
  alterar: (offset: number) => void;
}) {
  if (offset === 0 && total <= PAGINA_DILIGENCIAS) return null;
  return (
    <nav aria-label={rotulo} className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="min-h-11"
        disabled={offset === 0}
        onClick={() => alterar(offset - PAGINA_DILIGENCIAS)}
      >
        Anterior
      </Button>
      <Button
        variant="outline"
        className="min-h-11"
        disabled={offset + PAGINA_DILIGENCIAS >= total}
        onClick={() => alterar(offset + PAGINA_DILIGENCIAS)}
      >
        Próxima
      </Button>
    </nav>
  );
}

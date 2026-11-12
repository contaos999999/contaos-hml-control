import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  listarApresentacoes,
  PAGINA_APRESENTACOES,
  type ApresentacaoProtocolo,
} from "@/lib/competencias/protocoloDados";

type Props = { competencia: string; organizacao: string; contrato: string };
type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; negado: boolean }
  | { tipo: "ok"; itens: ApresentacaoProtocolo[]; total: number };

/** Montada somente após a visão geral autorizada; cada consulta conserva seu contexto. */
export function CompetenciaApresentacoesLista({ competencia, organizacao, contrato }: Props) {
  const heading = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  const focoPendente = useRef(false);
  const contexto = `${competencia}:${organizacao}:${contrato}`;
  const [pagina, setPagina] = useState({ contexto, offset: 0 });
  const offset = pagina.contexto === contexto ? pagina.offset : 0;
  const [tentativa, setTentativa] = useState(0);
  const chave = `${contexto}:${offset}:${tentativa}`;
  const [resposta, setResposta] = useState<{ chave: string; estado: Estado }>({
    chave,
    estado: { tipo: "carregando" },
  });
  const estado: Estado = resposta.chave === chave ? resposta.estado : { tipo: "carregando" };

  useEffect(() => {
    focoPendente.current = false;
  }, [contexto]);
  useEffect(() => {
    if (estado.tipo !== "carregando" && focoPendente.current) {
      focoPendente.current = false;
      titulo.current?.focus();
    }
  }, [estado.tipo, chave]);

  useEffect(() => {
    const controller = new AbortController();
    setResposta({ chave, estado: { tipo: "carregando" } });
    void listarApresentacoes(competencia, organizacao, contrato, offset, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setResposta({ chave, estado: { tipo: "ok", ...result } });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const negado =
          typeof error === "object" &&
          error !== null &&
          "tipo" in error &&
          error.tipo === "sem_permissao";
        setResposta({ chave, estado: { tipo: "erro", negado } });
      });
    return () => controller.abort();
  }, [chave, competencia, organizacao, contrato, offset]);

  return (
    <section aria-labelledby={heading} className="rounded-lg border border-border bg-card p-5">
      <h2
        ref={titulo}
        tabIndex={-1}
        id={heading}
        className="text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Apresentações registradas
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Consulte os registros e pacotes existentes desta competência.
      </p>
      {estado.tipo === "carregando" ? (
        <p role="status" className="mt-4 text-sm">
          Consultando apresentações…
        </p>
      ) : estado.tipo === "erro" ? (
        <div className="mt-4 space-y-3">
          <p role="alert" className="text-sm">
            {estado.negado
              ? "Você não possui permissão para consultar as apresentações."
              : "Não foi possível consultar as apresentações. Tente novamente."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => {
              focoPendente.current = true;
              setTentativa((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          {estado.itens.length ? (
            <ul className="mt-4 space-y-3">
              {estado.itens.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <span className="break-words text-sm">
                    Rodada {item.numero_rodada}
                    {item.protocolo ? ` • ${item.protocolo}` : ""}
                  </span>
                  <Button asChild variant="outline" className="min-h-11">
                    <Link
                      to="/competencias/$id/apresentacoes/$apresentacaoId"
                      params={{ id: competencia, apresentacaoId: item.id }}
                    >
                      Abrir apresentação {item.numero_rodada}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma apresentação registrada.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={offset === 0}
              onClick={() => {
                focoPendente.current = true;
                setPagina({ contexto, offset: Math.max(0, offset - PAGINA_APRESENTACOES) });
              }}
            >
              Apresentações anteriores
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {Math.floor(offset / PAGINA_APRESENTACOES) + 1} • {estado.total} registro(s)
            </span>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={offset + PAGINA_APRESENTACOES >= estado.total}
              onClick={() => {
                focoPendente.current = true;
                setPagina({ contexto, offset: offset + PAGINA_APRESENTACOES });
              }}
            >
              Próximas apresentações
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

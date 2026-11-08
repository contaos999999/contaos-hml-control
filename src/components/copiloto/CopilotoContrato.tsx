import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EVENTO_ORGANIZACAO_ALTERADA } from "@/lib/organizacao/preferenciaOrganizacao";

type Mensagem = { papel: "usuario" | "assistente"; conteudo: string };
type Resposta = {
  ok?: boolean;
  id_sessao?: string;
  resposta?: string;
  fontes?: Array<{
    fonte_tipo?: string;
    pagina?: number | null;
    trecho?: string;
  }>;
  mensagem?: string;
};

/** Painel contextual; autoridade de acesso, RLS e fontes permanece na Edge Function. */
export function CopilotoContrato({
  contratoId,
  organizacaoId,
  competenciaId,
}: {
  contratoId?: string | null;
  organizacaoId?: string;
  competenciaId?: string | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [sessao, setSessao] = useState<string | null>(null);
  const [fontes, setFontes] = useState<Resposta["fontes"]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const geracao = useRef(0);
  const ocupado = useRef(false);
  const [selecionado, setSelecionado] = useState("");
  const [contratos, setContratos] = useState<
    Array<{ id: string; numero: string }>
  >([]);
  const [carregandoContratos, setCarregandoContratos] = useState(false);
  const contratoAtual = contratoId || selecionado;
  const [referencia, setReferencia] = useState<string | null>(null);
  const contextoTemporalPronto = !competenciaId || referencia !== null;

  useEffect(() => {
    const limpar = () => {
      geracao.current += 1;
      ocupado.current = false;
      setSelecionado("");
      setReferencia(null);
      setContratos([]);
      setSessao(null);
      setMensagens([]);
      setFontes([]);
      setPergunta("");
      setErro("");
      setEnviando(false);
      setAberto(false);
    };
    limpar();
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
    const { data: auth } = supabase.auth.onAuthStateChange((evento) => {
      if (
        evento === "SIGNED_OUT" ||
        evento === "SIGNED_IN" ||
        evento === "USER_UPDATED"
      )
        limpar();
    });
    return () => {
      geracao.current += 1;
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
      auth.subscription.unsubscribe();
    };
  }, [contratoId, organizacaoId, competenciaId]);

  useEffect(() => {
    if (!aberto || !competenciaId) return;
    let ativo = true;
    setReferencia(null);
    void (async () => {
      try {
        if (!organizacaoId || !contratoId) throw new Error("contexto");
        const { data, error } = await supabase
          .from("competencias")
          .select("id_contrato,competencia_referencia")
          .eq("id", competenciaId)
          .eq("id_organizacao", organizacaoId)
          .eq("id_contrato", contratoId)
          .maybeSingle();
        if (!ativo) return;
        const valor = data?.competencia_referencia ?? "";
        if (
          error ||
          data?.id_contrato !== contratoId ||
          !/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
          !Number.isFinite(Date.parse(valor)) ||
          new Date(valor).toISOString().slice(0, 10) !== valor
        )
          throw new Error("contexto");
        setReferencia(valor);
      } catch {
        if (ativo)
          setErro("Não foi possível confirmar o contexto da competência.");
      }
    })();
    return () => {
      ativo = false;
    };
  }, [aberto, competenciaId, contratoId, organizacaoId]);

  useEffect(() => {
    if (!aberto || contratoId || !organizacaoId) return;
    let ativo = true;
    setCarregandoContratos(true);
    setErro("");
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("contratos")
          .select("id,numero")
          .eq("id_organizacao", organizacaoId)
          .order("numero")
          .limit(100);
        if (!ativo) return;
        if (error || !data?.length) {
          setContratos([]);
          setErro("Não há contratos disponíveis para consulta neste contexto.");
          return;
        }
        setContratos(data);
      } catch {
        if (ativo) {
          setContratos([]);
          setErro("Não foi possível consultar os contratos permitidos.");
        }
      } finally {
        if (ativo) setCarregandoContratos(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [aberto, contratoId, organizacaoId]);

  function selecionarContrato(id: string) {
    geracao.current += 1;
    ocupado.current = false;
    setSelecionado(contratos.some((c) => c.id === id) ? id : "");
    setSessao(null);
    setMensagens([]);
    setFontes([]);
    setPergunta("");
    setErro("");
    setEnviando(false);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = pergunta.trim();
    if (
      !texto ||
      ocupado.current ||
      texto.length > 12000 ||
      !contratoAtual ||
      !contextoTemporalPronto
    )
      return;
    if (!contratoId && !contratos.some((c) => c.id === contratoAtual)) return;
    ocupado.current = true;
    const atual = ++geracao.current;
    setEnviando(true);
    setErro("");
    setPergunta("");
    setMensagens((prev) => [...prev, { papel: "usuario", conteudo: texto }]);
    try {
      const { data, error } = await supabase.functions.invoke<Resposta>(
        "copilot-query",
        {
          body: {
            id_contrato: contratoAtual,
            pergunta: texto,
            ...(referencia ? { data_referencia: referencia } : {}),
            ...(sessao ? { id_sessao: sessao } : {}),
          },
        },
      );
      if (atual !== geracao.current) return;
      if (error || !data?.ok || !data.resposta || !data.id_sessao) {
        throw new Error(
          data?.mensagem || "Não foi possível concluir a consulta.",
        );
      }
      setSessao(data.id_sessao);
      setMensagens((prev) => [
        ...prev,
        { papel: "assistente", conteudo: data.resposta! },
      ]);
      setFontes(data.fontes ?? []);
    } catch {
      if (atual === geracao.current)
        setErro("A consulta não foi concluída. Tente novamente.");
    } finally {
      if (atual === geracao.current) {
        ocupado.current = false;
        setEnviando(false);
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-[calc(100vw-2rem)]">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls="contaos-copiloto"
        onClick={() => setAberto((v) => !v)}
        className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        {aberto ? "Fechar copiloto" : "Consultar copiloto"}
      </button>
      {aberto && (
        <section
          id="contaos-copiloto"
          aria-label="Copiloto do contrato"
          className="mt-2 flex max-h-[65vh] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-lg border border-border bg-background p-3 text-foreground shadow-xl"
        >
          <h2 className="mb-2 font-semibold">Copiloto do contrato</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Respostas informativas com fontes. Aprovações e alterações exigem os
            fluxos oficiais.
          </p>
          <div
            role="log"
            aria-live="polite"
            className="min-h-20 flex-1 space-y-3 overflow-y-auto text-sm"
          >
            {mensagens.map((m, i) => (
              <p key={i} className="whitespace-pre-wrap break-words">
                <strong>{m.papel === "usuario" ? "Você" : "Copiloto"}:</strong>{" "}
                {m.conteudo}
              </p>
            ))}
            {fontes?.length ? (
              <details>
                <summary>Fontes da última resposta ({fontes.length})</summary>
                <ul className="list-inside list-disc space-y-2">
                  {fontes.map((f, i) => (
                    <li key={i} className="break-words">
                      {f.fonte_tipo ?? "Fonte"}
                      {f.pagina ? ` · página ${f.pagina}` : ""}: {f.trecho}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          {erro && (
            <p role="alert" className="my-2 text-sm text-destructive">
              {erro}
            </p>
          )}
          {!contratoId && (
            <div className="mt-2">
              <label
                htmlFor="copiloto-contrato"
                className="text-sm font-medium"
              >
                Contrato da consulta
              </label>
              <select
                id="copiloto-contrato"
                value={selecionado}
                disabled={carregandoContratos}
                onChange={(e) => selecionarContrato(e.target.value)}
                className="min-h-11 w-full rounded border border-input bg-background p-2 text-sm"
              >
                <option value="">
                  {carregandoContratos
                    ? "Carregando contratos..."
                    : "Selecione um contrato"}
                </option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero}
                  </option>
                ))}
              </select>
              {contratos.length === 100 && (
                <p className="text-xs text-muted-foreground">
                  Exibindo até 100 contratos. Use a página do contrato para
                  outros registros.
                </p>
              )}
            </div>
          )}
          <form onSubmit={enviar} className="mt-3 flex flex-col gap-2">
            <label htmlFor="copiloto-pergunta" className="text-sm font-medium">
              Sua pergunta
            </label>
            <textarea
              id="copiloto-pergunta"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              maxLength={12000}
              rows={2}
              className="w-full rounded border border-input bg-background p-2 text-sm"
            />
            <button
              type="submit"
              disabled={
                enviando ||
                !pergunta.trim() ||
                !contratoAtual ||
                carregandoContratos ||
                !contextoTemporalPronto
              }
              className="min-h-11 rounded bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50"
            >
              {enviando ? "Consultando..." : "Enviar pergunta"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

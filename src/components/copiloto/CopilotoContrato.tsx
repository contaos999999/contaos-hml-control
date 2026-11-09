import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { acaoCopiloto, type PaginaSessoes, type PaginaHistorico, type SessaoCopiloto } from "@/lib/copiloto/copilotoApi";
import { EVENTO_ORGANIZACAO_ALTERADA } from "@/lib/organizacao/preferenciaOrganizacao";

type Mensagem = {
  papel: "usuario" | "assistente";
  conteudo: string;
  fontes?: Resposta["fontes"];
};
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
  const [sessoes, setSessoes] = useState<SessaoCopiloto[]>([]);
  const [cursorSessoes, setCursorSessoes] = useState<string | null>(null);
  const [cursorHistorico, setCursorHistorico] = useState<string | null>(null);
  const [encerrada, setEncerrada] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const geracao = useRef(0);
  const ocupado = useRef(false);
  const requisicao = useRef<AbortController | null>(null);
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
      requisicao.current?.abort();
      ocupado.current = false;
      setSelecionado("");
      setReferencia(null);
      setContratos([]);
      setSessao(null);
      setSessoes([]);
      setCursorSessoes(null);
      setCursorHistorico(null);
      setEncerrada(false);
      setIncerto(false);
      setMensagens([]);
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
      requisicao.current?.abort();
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
      auth.subscription.unsubscribe();
    };
  }, [contratoId, organizacaoId, competenciaId]);

  useEffect(() => {
    if (!aberto || !competenciaId) return;
    let ativo = true;
    const epoca = geracao.current;
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
        if (!ativo || epoca !== geracao.current) return;
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
        if (ativo && epoca === geracao.current)
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
    const epoca = geracao.current;
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
        if (!ativo || epoca !== geracao.current) return;
        if (error || !data?.length) {
          setContratos([]);
          setErro("Não há contratos disponíveis para consulta neste contexto.");
          return;
        }
        setContratos(data);
      } catch {
        if (ativo && epoca === geracao.current) {
          setContratos([]);
          setErro("Não foi possível consultar os contratos permitidos.");
        }
      } finally {
        if (ativo && epoca === geracao.current) setCarregandoContratos(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [aberto, contratoId, organizacaoId]);

  function selecionarContrato(id: string) {
    geracao.current += 1;
    requisicao.current?.abort();
    ocupado.current = false;
    setSelecionado(contratos.some((c) => c.id === id) ? id : "");
    setSessao(null);
    setSessoes([]);
    setCursorSessoes(null);
    setCursorHistorico(null);
    setEncerrada(false);
    setIncerto(false);
    setMensagens([]);
    setPergunta("");
    setErro("");
    setEnviando(false);
  }

  async function listarSessoes(mais = false) {
    if (!contratoAtual || !contextoTemporalPronto || ocupado.current) return;
    const epoca = geracao.current;
    const controlador = new AbortController();
    requisicao.current?.abort();
    requisicao.current = controlador;
    setCarregandoHistorico(true);
    setErro("");
    try {
      const pagina = await acaoCopiloto<PaginaSessoes>("listar_sessoes", contratoAtual, {
        referencia, cursor: mais ? cursorSessoes : null, signal: controlador.signal,
      });
      if (epoca !== geracao.current || controlador.signal.aborted) return;
      setSessoes((anteriores) => mais
        ? [...anteriores, ...pagina.sessoes.filter((nova) => !anteriores.some((antiga) => antiga.id === nova.id))]
        : pagina.sessoes);
      setCursorSessoes(pagina.proximo_cursor);
      setIncerto(false);
    } catch {
      if (epoca === geracao.current && !controlador.signal.aborted) {
        setMensagens([]);
        setErro("Não foi possível atualizar as sessões autorizadas.");
      }
    } finally {
      if (epoca === geracao.current) setCarregandoHistorico(false);
    }
  }

  async function carregarHistorico(id: string, mais = false) {
    if (!contratoAtual || !contextoTemporalPronto || ocupado.current) return;
    const epoca = ++geracao.current;
    requisicao.current?.abort();
    const controlador = new AbortController();
    requisicao.current = controlador;
    setCarregandoHistorico(true);
    setErro("");
    if (!mais) {
      setSessao(id);
      setMensagens([]);
      setCursorHistorico(null);
    }
    try {
      const pagina = await acaoCopiloto<PaginaHistorico>("historico", contratoAtual, {
        sessaoId: id, referencia, cursor: mais ? cursorHistorico : null, signal: controlador.signal,
      });
      if (epoca !== geracao.current || controlador.signal.aborted) return;
      const convertidas: Mensagem[] = pagina.mensagens.map((m) => ({
        papel: m.papel,
        conteudo: m.conteudo_disponivel && m.conteudo !== null ? m.conteudo : "[Conteúdo indisponível ou revogado]",
        fontes: m.conteudo_disponivel ? (m.fontes ?? []) : [],
      }));
      setMensagens((anteriores) => mais ? [...convertidas, ...anteriores] : convertidas);
      setCursorHistorico(pagina.proximo_cursor);
      setEncerrada(pagina.sessao.status === "encerrada");
      setIncerto(false);
    } catch {
      if (epoca === geracao.current && !controlador.signal.aborted) {
        setMensagens([]);
        setErro("Histórico indisponível ou acesso revogado. Atualize as sessões.");
      }
    } finally {
      if (epoca === geracao.current) setCarregandoHistorico(false);
    }
  }

  async function encerrarSessao() {
    if (!sessao || !contratoAtual || ocupado.current) return;
    const epoca = geracao.current;
    setCarregandoHistorico(true);
    try {
      await acaoCopiloto("encerrar_sessao", contratoAtual, { sessaoId: sessao, referencia });
      if (epoca !== geracao.current) return;
      setEncerrada(true);
      setSessoes((anteriores) => anteriores.map((s) => s.id === sessao ? {...s, status:"encerrada"} : s));
    } catch {
      if (epoca === geracao.current) setErro("Encerramento não confirmado. Consulte novamente antes de repetir.");
    } finally {
      if (epoca === geracao.current) setCarregandoHistorico(false);
    }
  }

  function novaConversa() {
    geracao.current++;
    requisicao.current?.abort();
    ocupado.current = false;
    setSessao(null);
    setMensagens([]);
    setCursorHistorico(null);
    setEncerrada(false);
    setIncerto(false);
    setErro("");
    setEnviando(false);
  }

  useEffect(() => {
    if (!aberto || !contratoAtual || !contextoTemporalPronto) return;
    void listarSessoes();
    // Revalidar sessões a cada abertura/contexto; não reusar cache sensível.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, contratoAtual, referencia, contextoTemporalPronto]);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = pergunta.trim();
    if (
      !texto ||
      ocupado.current ||
      texto.length > 12000 ||
      !contratoAtual ||
      encerrada || incerto ||
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
    const controlador = new AbortController();
    requisicao.current = controlador;
    const temporizador = window.setTimeout(() => controlador.abort(), 50000);
    let aoAbortar: () => void = () => {};
    const cancelamento = new Promise<never>((_, reject) => {
      aoAbortar = () => reject(new Error("consulta interrompida"));
      controlador.signal.addEventListener("abort", aoAbortar, { once: true });
    });
    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke<Resposta>("copilot-query", {
          signal: controlador.signal,
          body: {
            id_contrato: contratoAtual,
            pergunta: texto,
            ...(referencia ? { data_referencia: referencia } : {}),
            ...(sessao ? { id_sessao: sessao } : {}),
          },
        }),
        cancelamento,
      ]);
      if (atual !== geracao.current) return;
      if (error || !data?.ok || !data.resposta || !data.id_sessao) {
        throw new Error(
          data?.mensagem || "Não foi possível concluir a consulta.",
        );
      }
      setSessao(data.id_sessao);
      setMensagens((prev) => [
        ...prev,
        {
          papel: "assistente",
          conteudo: data.resposta!,
          fontes: data.fontes ?? [],
        },
      ]);
    } catch {
      if (atual === geracao.current) {
        setIncerto(true);
        setErro("Resultado incerto: atualize as sessões e confira o histórico antes de reenviar. Não houve reenvio automático.");
      }
    } finally {
      window.clearTimeout(temporizador);
      controlador.signal.removeEventListener("abort", aoAbortar);
      if (requisicao.current === controlador) requisicao.current = null;
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
            Respostas informativas com fontes, sujeitas a incerteza e revisão
            humana. Aprovações e alterações exigem os fluxos oficiais.
          </p>
          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => void listarSessoes()} disabled={carregandoHistorico || enviando || !contratoAtual}>Atualizar sessões</button>
            <button type="button" onClick={novaConversa} disabled={enviando}>Nova conversa</button>
            {sessao && !encerrada && <button type="button" onClick={() => void encerrarSessao()} disabled={carregandoHistorico || enviando}>Encerrar conversa</button>}
          </div>
          {sessoes.length > 0 && <div className="mb-2 max-h-24 overflow-y-auto" aria-label="Conversas anteriores">{sessoes.map((s) => <button className="block w-full text-left text-xs underline" type="button" key={s.id} disabled={carregandoHistorico || enviando} onClick={() => void carregarHistorico(s.id)}>{s.titulo || "Conversa"} ({s.status})</button>)}{cursorSessoes && <button type="button" onClick={() => void listarSessoes(true)}>Mais conversas</button>}</div>}
          {sessao && cursorHistorico && <button type="button" disabled={carregandoHistorico || enviando} onClick={() => void carregarHistorico(sessao, true)}>Carregar mensagens anteriores</button>}
          {encerrada && <p role="status">Conversa encerrada, somente leitura.</p>}
          <div
            role="log"
            aria-live="polite"
            className="min-h-20 flex-1 space-y-3 overflow-y-auto text-sm"
          >
            {mensagens.map((m, i) => (
              <div key={i}>
                <p className="whitespace-pre-wrap break-words">
                  <strong>
                    {m.papel === "usuario" ? "Você" : "Copiloto"}:
                  </strong>{" "}
                  {m.conteudo}
                </p>
                {m.fontes?.length ? (
                  <details>
                    <summary>Fontes da resposta ({m.fontes.length})</summary>
                    <ul className="list-inside list-disc space-y-2">
                      {m.fontes.map((f, indice) => (
                        <li key={indice} className="break-words">
                          F{indice + 1}: {f.fonte_tipo ?? "Fonte"}
                          {f.pagina ? ` · página ${f.pagina}` : ""}: {f.trecho}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ))}
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
                enviando || encerrada || incerto || carregandoHistorico ||
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

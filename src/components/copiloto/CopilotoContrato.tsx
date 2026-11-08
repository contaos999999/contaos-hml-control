import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EVENTO_ORGANIZACAO_ALTERADA } from "@/lib/organizacao/preferenciaOrganizacao";

type Mensagem = { papel: "usuario" | "assistente"; conteudo: string };
type Resposta = {
  ok?: boolean;
  id_sessao?: string;
  resposta?: string;
  fontes?: Array<{ fonte_tipo?: string; pagina?: number | null; trecho?: string }>;
  mensagem?: string;
};

/** Painel contextual; autoridade de acesso, RLS e fontes permanece na Edge Function. */
export function CopilotoContrato({ contratoId }: { contratoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [sessao, setSessao] = useState<string | null>(null);
  const [fontes, setFontes] = useState<Resposta["fontes"]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const geracao = useRef(0);

  useEffect(() => {
    const limpar = () => {
      geracao.current += 1;
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
      if (evento === "SIGNED_OUT" || evento === "USER_UPDATED") limpar();
    });
    return () => {
      geracao.current += 1;
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
      auth.subscription.unsubscribe();
    };
  }, [contratoId]);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = pergunta.trim();
    if (!texto || enviando || texto.length > 12000) return;
    const atual = ++geracao.current;
    setEnviando(true);
    setErro("");
    setPergunta("");
    setMensagens((prev) => [...prev, { papel: "usuario", conteudo: texto }]);
    try {
      const { data, error } = await supabase.functions.invoke<Resposta>("copilot-query", {
        body: { id_contrato: contratoId, pergunta: texto, ...(sessao ? { id_sessao: sessao } : {}) },
      });
      if (atual !== geracao.current) return;
      if (error || !data?.ok || !data.resposta || !data.id_sessao) {
        throw new Error(data?.mensagem || "Não foi possível concluir a consulta.");
      }
      setSessao(data.id_sessao);
      setMensagens((prev) => [...prev, { papel: "assistente", conteudo: data.resposta! }]);
      setFontes(data.fontes ?? []);
    } catch {
      if (atual === geracao.current) setErro("A consulta não foi concluída. Tente novamente.");
    } finally {
      if (atual === geracao.current) setEnviando(false);
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
            Respostas informativas com fontes. Aprovações e alterações exigem os fluxos oficiais.
          </p>
          <div role="log" aria-live="polite" className="min-h-20 flex-1 space-y-3 overflow-y-auto text-sm">
            {mensagens.map((m, i) => (
              <p key={i} className="whitespace-pre-wrap break-words">
                <strong>{m.papel === "usuario" ? "Você" : "Copiloto"}:</strong> {m.conteudo}
              </p>
            ))}
            {fontes?.length ? (
              <details>
                <summary>Fontes da última resposta ({fontes.length})</summary>
                <ul className="list-inside list-disc space-y-2">
                  {fontes.map((f, i) => (
                    <li key={i} className="break-words">
                      {f.fonte_tipo ?? "Fonte"}{f.pagina ? ` · página ${f.pagina}` : ""}: {f.trecho}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          {erro && <p role="alert" className="my-2 text-sm text-destructive">{erro}</p>}
          <form onSubmit={enviar} className="mt-3 flex flex-col gap-2">
            <label htmlFor="copiloto-pergunta" className="text-sm font-medium">Sua pergunta</label>
            <textarea
              id="copiloto-pergunta"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              maxLength={12000}
              rows={2}
              className="w-full rounded border border-input bg-background p-2 text-sm"
            />
            <button type="submit" disabled={enviando || !pergunta.trim()} className="min-h-11 rounded bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50">
              {enviando ? "Consultando..." : "Enviar pergunta"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

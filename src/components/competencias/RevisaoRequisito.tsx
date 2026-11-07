import { useEffect, useId, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroRevisao,
  RESULTADOS_REVISAO,
  listarEvidencias,
  montarRevisao,
  obterContextoRevisao,
  registrarRevisao,
  type ComandoRevisao,
  type ContextoRevisao,
  type EvidenciaRevisao,
  type OpcaoEvidencia,
} from "@/lib/competencias/revisaoRequisitoDados";
import { rotuloResultado } from "@/lib/competencias/competenciaAnaliseDados";

type Props = {
  idCompetencia: string;
  idRequisito: string;
  bloqueado?: boolean;
  onRevisado: () => void;
  onOcupado: (v: boolean) => void;
};
type Fase =
  | "fechado"
  | "carregando"
  | "editar"
  | "confirmar"
  | "incerto"
  | "conflito"
  | "negado"
  | "sucesso"
  | "erro";
const CAMPO =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function RevisaoRequisito({
  idCompetencia,
  idRequisito,
  bloqueado = false,
  onRevisado,
  onOcupado,
}: Props) {
  const prefix = useId();
  const [fase, setFase] = useState<Fase>("fechado");
  const [base, setBase] = useState<ContextoRevisao | null>(null);
  const [resultado, setResultado] = useState("conforme");
  const [justificativa, setJustificativa] = useState("");
  const [fundamento, setFundamento] = useState("");
  const [selecionadas, setSelecionadas] = useState<Array<EvidenciaRevisao & { nome: string }>>([]);
  const [pagina, setPagina] = useState(0);
  const [opcoes, setOpcoes] = useState<{
    itens: OpcaoEvidencia[];
    total: number;
    pagina: number;
  } | null>(null);
  const [erroEvidencias, setErroEvidencias] = useState(false);
  const [retryEvidencias, setRetryEvidencias] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [comando, setComando] = useState<ComandoRevisao | null>(null);
  const trava = useRef(false);
  const vivo = useRef(true);
  const geracao = useRef(0);
  const ator = useRef<{ id: string; org: string } | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
      // Generation counter intentionally invalidates all pending work on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      geracao.current++;
    };
  }, []);
  const ativo = (g: number) => vivo.current && geracao.current === g;
  const busy = (v: boolean) => {
    trava.current = v;
    setOcupado(v);
    onOcupado(v);
  };
  const acessoMudou = () => {
    geracao.current++;
    setBase(null);
    setComando(null);
    setFase("negado");
    setMensagem(
      "Seu contexto de acesso mudou. Abra novamente a revisão após conferir a organização e a sessão.",
    );
    busy(false);
  };
  useEffect(() => {
    if (fase === "fechado") return;
    const mudarOrg = () => {
      const a = ator.current;
      if (!a || obterPreferenciaOrganizacao(a.id) !== a.org) acessoMudou();
    };
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, mudarOrg);
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      const a = ator.current;
      if ((a && s?.user.id !== a.id) || (!a && evento !== "INITIAL_SESSION")) acessoMudou();
    });
    return () => {
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, mudarOrg);
      data.subscription.unsubscribe();
    };
    // The subscription belongs to this opened editor and reads current refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase === "fechado"]);
  useEffect(() => {
    if (fase === "editar" || fase === "confirmar" || fase === "incerto" || fase === "conflito")
      root.current?.focus();
  }, [fase]);
  useEffect(() => {
    if (!base || !base.pode_revisar) return;
    let live = true;
    const g = geracao.current;
    setOpcoes(null);
    setErroEvidencias(false);
    listarEvidencias(base, pagina)
      .then((x) => {
        if (live && ativo(g)) setOpcoes(x);
      })
      .catch(() => {
        if (live && ativo(g)) setErroEvidencias(true);
      });
    return () => {
      live = false;
    };
  }, [base, pagina, retryEvidencias]);
  async function sessao(inicial = false) {
    const r = await supabase.auth.getUser();
    if (r.error || !r.data.user) throw new ErroRevisao("negado");
    const org = obterPreferenciaOrganizacao(r.data.user.id);
    if (!org) throw new ErroRevisao("negado");
    const a = { id: r.data.user.id, org };
    if (!inicial && (!ator.current || ator.current.id !== a.id || ator.current.org !== a.org))
      throw new ErroRevisao("negado");
    return a;
  }
  async function carregar() {
    if (trava.current || bloqueado) return;
    const g = geracao.current;
    busy(true);
    setMensagem("");
    setFase("carregando");
    try {
      const a = await sessao(ator.current === null);
      if (!ativo(g)) return;
      ator.current = a;
      const ctx = await obterContextoRevisao(idCompetencia, idRequisito, a.org);
      if (!ativo(g)) return;
      setBase(ctx);
      setComando(null);
      setFase(ctx.pode_revisar ? "editar" : "negado");
      if (!ctx.pode_revisar)
        setMensagem("Revisão indisponível para seu acesso ou para a situação atual da análise.");
    } catch (e) {
      if (ativo(g)) {
        setFase(e instanceof ErroRevisao && e.tipo === "negado" ? "negado" : "erro");
        setMensagem(
          e instanceof ErroRevisao && e.tipo === "negado"
            ? "Revisão indisponível para seu acesso."
            : "Não foi possível consultar a revisão. Tente novamente.",
        );
      }
    } finally {
      if (ativo(g)) busy(false);
    }
  }
  function preparar() {
    if (!base || trava.current || bloqueado) return;
    try {
      const c = montarRevisao(
        base,
        {
          resultado,
          justificativa,
          fundamento,
          evidencias: selecionadas.map(({ nome: _nome, ...ev }) => ev),
        },
        crypto.randomUUID(),
      );
      setComando(c);
      setMensagem("");
      setFase("confirmar");
    } catch {
      setMensagem(
        "Confira o resultado, a justificativa e as evidências. Não aplicável exige fundamento e evidência.",
      );
    }
  }
  async function enviar(c: ComandoRevisao) {
    if (trava.current || bloqueado) return;
    const g = geracao.current;
    busy(true);
    setMensagem("");
    try {
      await sessao();
      if (!ativo(g)) return;
      await registrarRevisao(c);
      if (!ativo(g)) return;
      setComando(null);
      setFase("sucesso");
      setBase(null);
      setMensagem(
        "Revisão registrada. O histórico foi preservado. Confira a análise e o parecer atualizados.",
      );
      onRevisado();
    } catch (e) {
      if (!ativo(g)) return;
      const t = e instanceof ErroRevisao ? e.tipo : "incerto";
      if (t === "negado") {
        setComando(null);
        setBase(null);
        setFase("negado");
        setMensagem("Sua sessão ou permissão não permite concluir a revisão.");
      } else if (t === "conflito") {
        setComando(null);
        setFase("conflito");
        setMensagem(
          "A análise ou o contexto foi alterado. Recarregue e revise seu rascunho antes de confirmar novamente.",
        );
      } else if (t === "invalido") {
        setComando(null);
        setFase("editar");
        setMensagem("Revise os campos e as evidências informadas.");
      } else {
        setComando(c);
        setFase("incerto");
        setMensagem(
          "Resultado não confirmado. Confira o contexto ou repita explicitamente a mesma solicitação. Não foi feito reenvio automático.",
        );
      }
    } finally {
      if (ativo(g)) busy(false);
    }
  }
  async function conferir() {
    if (trava.current || !comando || !ator.current) return;
    const g = geracao.current;
    busy(true);
    try {
      await sessao();
      const ctx = await obterContextoRevisao(idCompetencia, idRequisito, ator.current.org);
      if (ativo(g) && ctx)
        setMensagem(
          "Contexto consultado. Esta leitura não confirma a revisão. A solicitação original continua preservada para repetição explícita.",
        );
    } catch (e) {
      if (ativo(g)) {
        if (e instanceof ErroRevisao && e.tipo === "negado") {
          setFase("negado");
          setBase(null);
          setComando(null);
          setMensagem("Sua sessão ou permissão não permite consultar a revisão.");
        } else
          setMensagem(
            "Não foi possível conferir o contexto. O resultado continua não confirmado e a solicitação foi preservada.",
          );
      }
    } finally {
      if (ativo(g)) busy(false);
    }
  }
  const mostrarEditor =
    !!base && base.pode_revisar && ["editar", "confirmar", "incerto", "conflito"].includes(fase);
  const congelado = ocupado || bloqueado || fase !== "editar";
  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label="Revisão humana do requisito"
      className="space-y-3 rounded-md border border-border p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <h3 className="font-semibold">Revisão humana</h3>
      {fase === "fechado" ? (
        <Button className="min-h-11" variant="outline" disabled={bloqueado} onClick={carregar}>
          Revisar resultado
        </Button>
      ) : null}
      {fase === "carregando" ? (
        <p role="status">Verificando acesso e contexto da revisão…</p>
      ) : null}
      {mensagem ? (
        <p role={fase === "sucesso" || fase === "incerto" ? "status" : "alert"} aria-live="polite">
          {mensagem}
        </p>
      ) : null}
      {fase === "erro" ? (
        <Button variant="outline" disabled={ocupado} onClick={carregar}>
          Tentar novamente
        </Button>
      ) : null}
      {mostrarEditor ? (
        <>
          <fieldset disabled={congelado} className="space-y-3">
            <div>
              <label htmlFor={`${prefix}-resultado`}>Resultado da revisão</label>
              <select
                id={`${prefix}-resultado`}
                className={CAMPO}
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
              >
                {RESULTADOS_REVISAO.map((x) => (
                  <option key={x} value={x}>
                    {rotuloResultado(x)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${prefix}-justificativa`}>Justificativa da revisão</label>
              <Textarea
                id={`${prefix}-justificativa`}
                required
                minLength={3}
                maxLength={2000}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${prefix}-fundamento`}>Fundamento da revisão</label>
              <Textarea
                id={`${prefix}-fundamento`}
                maxLength={4000}
                value={fundamento}
                onChange={(e) => setFundamento(e.target.value)}
              />
            </div>
            <p>Não aplicável exige fundamento e ao menos uma evidência desta competência.</p>
            <h4 className="font-medium">Evidências disponíveis</h4>
            {erroEvidencias ? (
              <div role="alert">
                Não foi possível carregar as evidências.{" "}
                <Button variant="outline" onClick={() => setRetryEvidencias((n) => n + 1)}>
                  Tentar carregar evidências
                </Button>
              </div>
            ) : !opcoes ? (
              <p role="status">Carregando evidências…</p>
            ) : (
              <>
                {!opcoes.itens.length ? (
                  <p>Nenhuma versão documental aprovada nesta página.</p>
                ) : (
                  opcoes.itens.map((ev) => (
                    <label key={ev.id} className="flex min-h-11 items-center gap-2 break-words">
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${ev.nome} versão ${ev.versao}`}
                        checked={selecionadas.some((x) => x.id_versao_documento === ev.id)}
                        disabled={
                          !selecionadas.some((x) => x.id_versao_documento === ev.id) &&
                          selecionadas.length >= 25
                        }
                        onChange={(e) =>
                          setSelecionadas((xs) =>
                            e.target.checked
                              ? [...xs, { id_versao_documento: ev.id, nome: ev.nome }]
                              : xs.filter((x) => x.id_versao_documento !== ev.id),
                          )
                        }
                      />
                      {ev.nome} · versão {ev.versao}
                    </label>
                  ))
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    aria-label="Página anterior de evidências disponíveis"
                    disabled={pagina === 0}
                    onClick={() => setPagina((n) => n - 1)}
                  >
                    Anterior
                  </Button>
                  <span>Página {pagina + 1}</span>
                  <Button
                    variant="outline"
                    aria-label="Próxima página de evidências disponíveis"
                    disabled={(pagina + 1) * 25 >= opcoes.total}
                    onClick={() => setPagina((n) => n + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </>
            )}
            <p>Evidências selecionadas: {selecionadas.length}/25</p>
            {selecionadas.map((ev, i) => (
              <div
                key={ev.id_versao_documento}
                className="space-y-2 rounded-md border border-border p-2"
              >
                <p className="break-words">{ev.nome}</p>
                <label htmlFor={`${prefix}-pagina-${i}`}>Página da evidência {i + 1}</label>
                <Input
                  id={`${prefix}-pagina-${i}`}
                  type="number"
                  min={1}
                  max={9999999}
                  value={ev.pagina ?? ""}
                  onChange={(e) =>
                    setSelecionadas((xs) =>
                      xs.map((x, n) => {
                        if (n !== i) return x;
                        const { pagina: _p, ...rest } = x;
                        return e.target.value ? { ...rest, pagina: Number(e.target.value) } : rest;
                      }),
                    )
                  }
                />
                <label htmlFor={`${prefix}-trecho-${i}`}>Trecho da evidência {i + 1}</label>
                <Textarea
                  id={`${prefix}-trecho-${i}`}
                  maxLength={4000}
                  value={ev.trecho ?? ""}
                  onChange={(e) =>
                    setSelecionadas((xs) =>
                      xs.map((x, n) => (n === i ? { ...x, trecho: e.target.value } : x)),
                    )
                  }
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelecionadas((xs) =>
                      xs.filter((x) => x.id_versao_documento !== ev.id_versao_documento),
                    )
                  }
                >
                  Remover evidência {i + 1}
                </Button>
              </div>
            ))}
          </fieldset>
          {fase === "editar" ? (
            <Button className="min-h-11" disabled={ocupado || bloqueado} onClick={preparar}>
              Revisar e confirmar
            </Button>
          ) : null}
          {fase === "confirmar" && comando ? (
            <div role="group" aria-label="Confirmação da revisão" className="space-y-2">
              <p>
                Confirmar resultado: {rotuloResultado(comando.p_resultado)}. Será criada uma nova
                revisão; o parecer anterior perderá validade. Isto não libera apresentação.
              </p>
              <Button
                className="min-h-11"
                disabled={ocupado || bloqueado}
                onClick={() => enviar(comando)}
              >
                Confirmar revisão
              </Button>
              <Button
                className="min-h-11"
                variant="outline"
                disabled={ocupado}
                onClick={() => {
                  setComando(null);
                  setFase("editar");
                }}
              >
                Voltar ao rascunho
              </Button>
            </div>
          ) : null}
          {fase === "conflito" ? (
            <Button
              className="min-h-11"
              variant="outline"
              disabled={ocupado || bloqueado}
              onClick={carregar}
            >
              Recarregar contexto
            </Button>
          ) : null}
          {fase === "incerto" && comando ? (
            <div className="flex flex-wrap gap-2">
              <Button className="min-h-11" variant="outline" disabled={ocupado} onClick={conferir}>
                Conferir contexto da revisão
              </Button>
              <Button
                className="min-h-11"
                disabled={ocupado || bloqueado}
                onClick={() => enviar(comando)}
              >
                Repetir mesma solicitação
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

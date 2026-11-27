import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { criarChaveIdempotencia, ErroApresentacao } from "@/lib/competencias/apresentacaoDados";
import { rotuloSituacao } from "@/lib/competencias/competenciaVisaoGeralDados";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import {
  ErroDiligencias,
  ROTULOS_CICLO,
  type CicloDiligencia,
} from "@/lib/diligencias/diligenciasDados";
import {
  abrirReapresentacao,
  liberarRodada,
  listarComprovantes,
  PAGINA_COMPROVANTES,
  registrarRodada,
  type PedidoReapresentacao,
  type Reapresentacao,
} from "@/lib/diligencias/reapresentacaoDiligenciaDados";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";

const MENSAGENS = {
  sem_permissao: "Seu perfil não tem permissão para esta operação de reapresentação.",
  nao_encontrado: "Rodada indisponível no seu contexto.",
  invalido: "Confira os dados informados.",
  conflito:
    "A situação mudou ou o portão bloqueou a operação. Confira a rodada, a reanálise e o protocolo.",
  erro: "Não foi possível confirmar a operação. Atualize a consulta.",
};
const cartao = "space-y-3 rounded-md border border-border bg-card p-4 sm:p-5";
const mensagem = (e: unknown) =>
  MENSAGENS[e instanceof ErroApresentacao || e instanceof ErroDiligencias ? e.tipo : "erro"];
type Props = { cicloId: string; offset?: number | undefined };
type Leitura = { dados: Reapresentacao } | { erro: string };

export function ReapresentacaoDiligencia({ cicloId, offset }: Props) {
  const [contexto, atualizarContexto] = useState(0);
  useEffect(() => {
    const atualizar = () => atualizarContexto((n) => n + 1);
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (evento !== "INITIAL_SESSION") atualizar();
    });
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, atualizar);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, atualizar);
    };
  }, []);
  return <Assistente key={cicloId + ":" + contexto} cicloId={cicloId} offset={offset} />;
}

function Assistente({ cicloId, offset }: Props) {
  const navigate = useNavigate();
  const valido = uuidValido(cicloId);
  const ciclo = valido ? uuidCanonico(cicloId) : cicloId;
  const titulo = useRef<HTMLHeadingElement>(null);
  const trabalho = useRef<AbortController | null>(null);
  const consulta = useRef<AbortController | null>(null);
  const intencao = useRef<{ assinatura: string; chave: string } | null>(null);
  const idRecebido = useRef<string | undefined>(undefined);
  const [lido, setLido] = useState<Leitura>();
  const [carregando, setCarregando] = useState(true);
  const [atualizacao, atualizar] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; erro?: boolean }>();
  const [confirmando, setConfirmando] = useState(false);
  const [fundamento, setFundamento] = useState("");
  const [pedido, setPedido] = useState<PedidoReapresentacao>({
    protocolo: "",
    forma: "",
    comprovante: "",
  });

  function reler() {
    consulta.current?.abort();
    setCarregando(true);
    atualizar((n) => n + 1);
  }

  useEffect(() => {
    if (!valido) return;
    const controller = new AbortController();
    consulta.current = controller;
    const { signal } = controller;
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
        if (error || !data.user) throw new ErroApresentacao("sem_permissao");
        const org = obterPreferenciaOrganizacao(data.user.id);
        if (!org || !uuidValido(org)) {
          void navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        const dados = await abrirReapresentacao(ciclo, org, signal);
        signal.throwIfAborted();
        if (obterPreferenciaOrganizacao(data.user.id) !== org)
          throw new ErroApresentacao("sem_permissao");
        if (idRecebido.current && dados.recibo?.apresentacao.id !== idRecebido.current)
          throw new ErroApresentacao("conflito");
        setLido({ dados });
      } catch (e) {
        if (!signal.aborted) setLido({ erro: mensagem(e) });
      } finally {
        if (!signal.aborted) setCarregando(false);
      }
    })();
    return () => controller.abort();
  }, [atualizacao, ciclo, navigate, valido]);

  useEffect(() => () => trabalho.current?.abort(), []);

  const dados = lido && "dados" in lido ? lido.dados : undefined;
  const podeLiberar =
    dados?.portao.liberado &&
    dados.geral.blocking_summary.analise_concluida_atual &&
    (dados.ciclo.status === "aberto" || dados.ciclo.status === "em_tratamento");
  const podeRegistrar =
    dados?.portao.liberado &&
    dados.ciclo.status === "pronto_reapresentar" &&
    dados.geral.competencia.situacao === "pode_reapresentar_contratante";
  const registroPendente = intencao.current;
  const edicaoTravada = ocupado || confirmando;
  const atualizarPedido = (parcial: Partial<PedidoReapresentacao>) =>
    setPedido((v) => ({ ...v, ...parcial }));

  async function aplicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (carregando || trabalho.current || (!podeLiberar && !podeRegistrar)) return;
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    const controller = new AbortController();
    trabalho.current = controller;
    const { signal } = controller;
    setOcupado(true);
    setAviso(undefined);
    try {
      if (podeLiberar) {
        await liberarRodada(ciclo, fundamento, signal);
        signal.throwIfAborted();
        setAviso({ texto: "Liberação registrada." });
      } else {
        const assinatura = JSON.stringify(pedido);
        if (intencao.current?.assinatura !== assinatura)
          intencao.current = { assinatura, chave: criarChaveIdempotencia() };
        idRecebido.current = await registrarRodada(ciclo, intencao.current.chave, pedido, signal);
        signal.throwIfAborted();
        setAviso({ texto: "Registro recebido. Conferindo protocolo e pacote." });
      }
    } catch (e) {
      if (signal.aborted) return;
      if (e instanceof ErroApresentacao && e.tipo !== "erro") intencao.current = null;
      setAviso({ erro: true, texto: mensagem(e) });
    } finally {
      if (!signal.aborted) {
        trabalho.current = null;
        setOcupado(false);
        setConfirmando(false);
        reler();
        titulo.current?.focus();
      }
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      <nav aria-label="Navegação da reapresentação">
        {valido ? (
          <Button asChild variant="ghost" className="min-h-11">
            <Link
              to="/diligencias/$cicloId"
              params={{ cicloId: ciclo }}
              search={offset === undefined ? {} : { offset }}
            >
              Voltar ao ciclo
            </Link>
          </Button>
        ) : (
          <Link to="/contratos">Voltar aos contratos</Link>
        )}
      </nav>
      <h1 ref={titulo} tabIndex={-1} className="text-2xl font-semibold">
        Reapresentação
      </h1>
      {valido && (
        <Button
          variant="outline"
          className="min-h-11"
          disabled={carregando || edicaoTravada}
          onClick={reler}
        >
          Atualizar situação
        </Button>
      )}
      {!valido ? (
        <p role="alert">{MENSAGENS.nao_encontrado}</p>
      ) : carregando ? (
        <p role="status">Consultando a situação da rodada…</p>
      ) : lido && "erro" in lido ? (
        <p role="alert">{lido.erro}</p>
      ) : (
        dados && (
          <>
            <section className={cartao} aria-labelledby="v249-rodada">
              <h2 id="v249-rodada" className="font-semibold">
                Rodada {dados.ciclo.numero_rodada}
              </h2>
              <p>{ROTULOS_CICLO[dados.ciclo.status]}</p>
              <p>{rotuloSituacao(dados.geral.competencia.situacao)}</p>
              <Button asChild variant="link" className="min-h-11 px-0">
                <Link to="/competencias/$id" params={{ id: dados.ciclo.id_competencia }}>
                  Abrir competência
                </Link>
              </Button>
              {dados.anterior && (
                <Protocolo competencia={dados.ciclo.id_competencia} apresentacao={dados.anterior}>
                  Ver protocolo da rodada anterior
                </Protocolo>
              )}
            </section>
            {!dados.finalizado && (
              <section className={cartao}>
                <h2 className="font-semibold">Verificar portão</h2>
                <p>
                  Apontamentos tratados {dados.portao.tratados} de {dados.portao.total}.
                </p>
                {!dados.portao.liberado && (
                  <p role="status">
                    O portão exige que todos os apontamentos da rodada estejam tratados.
                  </p>
                )}
                {!dados.geral.blocking_summary.analise_concluida_atual && (
                  <p role="status">A liberação exige uma reanálise atual da competência.</p>
                )}
              </section>
            )}
            {(podeLiberar || podeRegistrar) && (
              <form className={cartao} onSubmit={aplicar}>
                {podeLiberar ? (
                  <>
                    <h2 className="font-semibold">Liberar reapresentação</h2>
                    <Label htmlFor="v249-fundamento">Fundamento da liberação</Label>
                    <Textarea
                      id="v249-fundamento"
                      required
                      maxLength={4000}
                      value={fundamento}
                      disabled={edicaoTravada}
                      onChange={(e) => setFundamento(e.currentTarget.value)}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="font-semibold">Registrar protocolo</h2>
                    <Label htmlFor="v249-protocolo">Protocolo</Label>
                    <Input
                      id="v249-protocolo"
                      required
                      maxLength={120}
                      disabled={edicaoTravada || !!registroPendente}
                      value={pedido.protocolo}
                      onChange={(e) => atualizarPedido({ protocolo: e.currentTarget.value })}
                    />
                    <Label htmlFor="v249-forma">Forma da reapresentação</Label>
                    <Input
                      id="v249-forma"
                      required
                      maxLength={120}
                      disabled={edicaoTravada || !!registroPendente}
                      value={pedido.forma}
                      onChange={(e) => atualizarPedido({ forma: e.currentTarget.value })}
                    />
                    <Comprovantes
                      ciclo={dados.ciclo}
                      selecionado={pedido.comprovante}
                      desabilitado={edicaoTravada || !!registroPendente}
                      selecionar={(comprovante) => atualizarPedido({ comprovante })}
                    />
                    {registroPendente && (
                      <p role="status">
                        Confirme novamente com os mesmos dados para recuperar o registro.
                      </p>
                    )}
                  </>
                )}
                {confirmando && (
                  <p role="status">
                    {podeLiberar
                      ? "Confirme a liberação da rodada."
                      : "O servidor congelará o pacote com o protocolo informado."}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    className="min-h-11"
                    disabled={
                      ocupado ||
                      (podeLiberar
                        ? !fundamento.trim()
                        : !pedido.protocolo.trim() || !pedido.forma.trim())
                    }
                  >
                    {podeLiberar
                      ? confirmando
                        ? "Confirmar liberação"
                        : "Revisar liberação"
                      : confirmando
                        ? "Confirmar reapresentação"
                        : "Revisar registro"}
                  </Button>
                  {confirmando && (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={ocupado}
                      onClick={() => setConfirmando(false)}
                    >
                      Cancelar confirmação
                    </Button>
                  )}
                </div>
              </form>
            )}
            {dados.finalizado && <Recibo dados={dados} />}
          </>
        )
      )}
      {ocupado && <p role="status">Processando a operação…</p>}
      {aviso && !carregando && <p role={aviso.erro ? "alert" : "status"}>{aviso.texto}</p>}
    </main>
  );
}

function Protocolo({
  competencia,
  apresentacao,
  children,
}: {
  competencia: string;
  apresentacao: string;
  children: string;
}) {
  return (
    <Button asChild variant="link" className="min-h-11 h-auto whitespace-normal px-0 text-left">
      <Link
        to="/competencias/$id/apresentacoes/$apresentacaoId"
        params={{ id: competencia, apresentacaoId: apresentacao }}
      >
        {children}
      </Link>
    </Button>
  );
}

function Recibo({ dados }: { dados: Reapresentacao }) {
  const { recibo } = dados;
  return (
    <section className={cartao} aria-labelledby="v249-recibo">
      <h2 id="v249-recibo" className="font-semibold">
        Recibo da reapresentação
      </h2>
      {recibo ? (
        <>
          <p>
            Protocolo {recibo.apresentacao.protocolo ?? "não informado"} · rodada{" "}
            {recibo.apresentacao.numero_rodada}
          </p>
          <p>
            Pacote <code className="break-all">{recibo.idPacoteReapresentacao}</code>
          </p>
          <p>
            SHA-256 <code className="break-all">{recibo.pacote.hash_pacote}</code>
          </p>
          <Protocolo competencia={dados.ciclo.id_competencia} apresentacao={recibo.apresentacao.id}>
            Abrir protocolo da reapresentação
          </Protocolo>
          <Button asChild variant="link" className="min-h-11 px-0">
            <Link to="/administracao/auditoria">Abrir auditoria</Link>
          </Button>
        </>
      ) : (
        <p role="status">O protocolo desta rodada está indisponível para consulta.</p>
      )}
    </section>
  );
}

function Comprovantes({
  ciclo,
  selecionado,
  desabilitado,
  selecionar,
}: {
  ciclo: CicloDiligencia;
  selecionado: string;
  desabilitado: boolean;
  selecionar: (id: string) => void;
}) {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<
    | ({ pagina: number } & Awaited<ReturnType<typeof listarComprovantes>>)
    | { pagina: number; erro: string }
  >();
  const atual = estado?.pagina === pagina ? estado : undefined;
  const arquivos = atual && "dados" in atual ? atual.dados : [];
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void listarComprovantes(ciclo, pagina, signal).then(
      (v) => {
        if (!signal.aborted) setEstado({ pagina, ...v });
      },
      (e: unknown) => {
        if (!signal.aborted) setEstado({ pagina, erro: mensagem(e) });
      },
    );
    return () => controller.abort();
  }, [ciclo, pagina]);
  return (
    <div className="space-y-2">
      <Label htmlFor="v249-comprovante">Comprovante aprovado (opcional)</Label>
      <select
        id="v249-comprovante"
        value={selecionado}
        onChange={(e) => selecionar(e.currentTarget.value)}
        disabled={desabilitado || !atual || "erro" in atual}
        className="block min-h-11 w-full rounded-md border border-input bg-background px-2"
      >
        <option value="">Sem comprovante</option>
        {selecionado && !arquivos.some((a) => a.id === selecionado) && (
          <option value={selecionado}>Comprovante selecionado</option>
        )}
        {arquivos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome_original}
          </option>
        ))}
      </select>
      {!atual && <p role="status">Consultando comprovantes…</p>}
      {atual && "erro" in atual && <p role="alert">{atual.erro}</p>}
      {atual && "total" in atual && (pagina > 0 || atual.total > PAGINA_COMPROVANTES) && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={desabilitado || pagina === 0}
            onClick={() => setPagina(pagina - PAGINA_COMPROVANTES)}
          >
            Comprovantes anteriores
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={desabilitado || pagina + PAGINA_COMPROVANTES >= atual.total}
            onClick={() => setPagina(pagina + PAGINA_COMPROVANTES)}
          >
            Mais comprovantes
          </Button>
        </div>
      )}
    </div>
  );
}

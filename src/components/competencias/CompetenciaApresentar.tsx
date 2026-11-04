/**
 * PROMPT 40 / V1-19 — Wizard de apresentação da competência.
 * O backend decide acesso, portão, aprovação e congelamento do pacote.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, ClipboardCheck, Loader2, Lock, RefreshCw, Send } from "lucide-react";

import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia, formatarPercentual } from "@/lib/contratos/competenciasDados";
import {
  classificarErroVisaoGeral, obterVisaoGeral, parseVisaoGeral,
  rotuloSituacao, type VisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  aprovarApresentacao, registrarApresentacao, criarChaveIdempotencia,
  ErroApresentacao, MENSAGENS_APRESENTACAO, type TipoErroApresentacao,
} from "@/lib/competencias/apresentacaoDados";

type Estado =
  | { tipo: "carregando" | "sessao" | "sem_permissao" | "nao_encontrado" | "erro" }
  | { tipo: "ok"; visao: VisaoGeral };
type Confirmacao = "aprovar" | "registrar" | null;
type IntencaoRegistro = { id: string; chave: string; protocolo: string; forma: string };
const situacaoRegistro = "pode_apresentar_contratante";
const abortado = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

function Mensagem({ children, erro = false }: { children: ReactNode; erro?: boolean }) {
  return (
    <div role={erro ? "alert" : "status"}
      className={"flex items-start gap-2 rounded-md border p-4 text-sm " +
        (erro ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")}>
      {erro
        ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span>{children}</span>
    </div>
  );
}
function explicarErro(e: unknown): string {
  const tipo: TipoErroApresentacao = e instanceof ErroApresentacao ? e.tipo : "erro";
  return MENSAGENS_APRESENTACAO[tipo];
}

export function CompetenciaApresentar({ id }: { id: string }) {
  const navigate = useNavigate();
  const valido = uuidValido(id);
  const idC = valido ? uuidCanonico(id) : id;
  const atual = useRef(idC);
  atual.current = idC;

  const [registro, setRegistro] = useState<{ id: string; estado: Estado }>({
    id: idC, estado: { tipo: "carregando" },
  });
  const [recarregar, setRecarregar] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
  const [fundamento, setFundamento] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [forma, setForma] = useState("");
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [registroFinal, setRegistroFinal] = useState<{ id: string; protocolo: string } | null>(null);
  const intencao = useRef<IntencaoRegistro | null>(null);
  const estado: Estado = !valido
    ? { tipo: "nao_encontrado" }
    : registro.id === idC ? registro.estado : { tipo: "carregando" };

  useEffect(() => {
    intencao.current = null;
    setRegistroFinal(null);
    setAviso(null);
    setConfirmacao(null);
    setFundamento("");
    setProtocolo("");
    setForma("");
  }, [idC]);

  useEffect(() => {
    if (!valido) return;
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    setRegistro({ id: idC, estado: { tipo: "carregando" } });
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (signal.aborted) return;
        const semSessao =
          (error as { name?: string; code?: string } | null)?.name === "AuthSessionMissingError" ||
          (error as { name?: string; code?: string } | null)?.code === "session_not_found";
        if (semSessao || (!error && !data.user))
          return void navigate({ to: "/login", replace: true });
        if (error || !data.user)
          return void setRegistro({ id: idC, estado: { tipo: "sessao" } });
        const org = obterPreferenciaOrganizacao(data.user.id);
        if (!org) return void navigate({ to: "/selecionar-organizacao", replace: true });
        const r = await obterVisaoGeral(idC, signal);
        if (signal.aborted) return;
        if (r.error) {
          const tipo = classificarErroVisaoGeral(r.error, r.status);
          return void setRegistro({
            id: idC,
            estado: { tipo: tipo === "sem_permissao" ? "sem_permissao"
              : tipo === "nao_encontrada" ? "nao_encontrado" : "erro" },
          });
        }
        if (r.data === null || r.data === undefined)
          return void setRegistro({ id: idC, estado: { tipo: "nao_encontrado" } });
        const visao = parseVisaoGeral(r.data);
        if (!visao || uuidCanonico(visao.competencia.id) !== idC ||
          visao.competencia.id_organizacao !== org ||
          !uuidValido(visao.competencia.id_contrato)) {
          return void setRegistro({ id: idC, estado: { tipo: "erro" } });
        }
        if (!visao.allowed_actions.apresentar)
          return void setRegistro({ id: idC, estado: { tipo: "sem_permissao" } });
        setRegistro({ id: idC, estado: { tipo: "ok", visao } });
      } catch (e) {
        if (signal.aborted || abortado(e)) return;
        setRegistro({ id: idC, estado: { tipo: "erro" } });
      }
    })();
    return () => ctrl.abort();
  }, [idC, valido, navigate, recarregar]);

  const atualizar = () => {
    if (ocupadoRef.current) return;
    setAviso(null);
    setRecarregar((x) => x + 1);
  };

  const executar = async (acao: "aprovar" | "registrar") => {
    if (ocupadoRef.current || estado.tipo !== "ok" ||
      !estado.visao.allowed_actions.apresentar || registroFinal?.id === idC) return;
    const prontoRegistro = estado.visao.competencia.situacao === situacaoRegistro;
    if ((acao === "aprovar" && prontoRegistro) || (acao === "registrar" && !prontoRegistro))
      return;
    const idAntes = idC;
    ocupadoRef.current = true;
    setOcupado(true);
    setAviso(null);
    try {
      if (acao === "aprovar") {
        await aprovarApresentacao(idC, fundamento);
        if (atual.current === idAntes)
          setAviso({ erro: false, texto: "Aprovação registrada. O portão será consultado novamente no backend." });
      } else {
        const p = protocolo.trim();
        const f = forma.trim();
        if (!intencao.current || intencao.current.id !== idC) {
          intencao.current = { id: idC, chave: criarChaveIdempotencia(), protocolo: p, forma: f };
        }
        if (intencao.current.protocolo !== p || intencao.current.forma !== f)
          throw new ErroApresentacao("conflito");
        const registroId = await registrarApresentacao(
          idC, intencao.current.chave, intencao.current.protocolo, intencao.current.forma);
        if (atual.current === idAntes) {
          setRegistroFinal({ id: idC, protocolo: registroId });
          setAviso({ erro: false, texto: "Registro confirmado pelo Supabase. O pacote foi criado pela operação oficial." });
        }
      }
    } catch (e) {
      if (atual.current === idAntes)
        setAviso({ erro: true, texto: explicarErro(e) });
    } finally {
      ocupadoRef.current = false;
      setOcupado(false);
      if (atual.current === idAntes) {
        setConfirmacao(null);
        setRecarregar((x) => x + 1);
      }
    }
  };

  const prontoRegistro = estado.tipo === "ok" &&
    estado.visao.competencia.situacao === situacaoRegistro;
  const concluido = registroFinal?.id === idC;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <ContaOSMarca />
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild className="min-h-11">
              <Link to="/competencias/$id" params={{ id: idC }}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar à competência
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Wizard de apresentação</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aprovação institucional e registro de apresentação ao contratante.
            </p>
          </div>
          <Button variant="outline" className="min-h-11" disabled={ocupado}
            type="button" onClick={atualizar}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar situação
          </Button>
        </div>
        {aviso && <Mensagem erro={aviso.erro}>{aviso.texto}</Mensagem>}
        {concluido && registroFinal && (
          <section className="rounded-lg border border-border bg-card p-4" aria-labelledby="v119-sucesso">
            <h2 id="v119-sucesso" className="text-lg font-semibold">Apresentação registrada</h2>
            <p className="mt-2 text-sm">Identificador oficial do registro:</p>
            <p className="mt-1 break-all font-mono text-sm">{registroFinal.protocolo}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              O registro e o pacote são mantidos pelo Supabase. Consulte a competência para acompanhar a situação.
            </p>
          </section>
        )}
        {concluido ? null : (!valido || estado.tipo === "nao_encontrado") ? (
          <Mensagem>Competência não encontrada ou indisponível.</Mensagem>
        ) : estado.tipo === "carregando" ? (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando a situação autorizada…
          </p>
        ) : estado.tipo === "sessao" ? (
          <Mensagem erro>Não foi possível confirmar sua sessão. Atualize e tente novamente.</Mensagem>
        ) : estado.tipo === "sem_permissao" ? (
          <Mensagem erro><Lock className="mr-2 inline h-4 w-4" aria-hidden />
            Ação não autorizada pelo backend ou competência indisponível para apresentação.
          </Mensagem>
        ) : estado.tipo === "erro" ? (
          <Mensagem erro>Não foi possível consultar a competência. Tente novamente.</Mensagem>
        ) : estado.tipo === "ok" && !concluido ? (
          <>
            <section aria-labelledby="v119-resumo" className="rounded-lg border border-border bg-card p-4">
              <h2 id="v119-resumo" className="text-lg font-semibold">Revisão de prontidão</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Resumo consultado no backend. Não representa um pacote congelado ou prévia definitiva.
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Competência</dt>
                  <dd className="font-medium">{formatarCompetencia(estado.visao.competencia.competencia_referencia)}</dd></div>
                <div><dt className="text-muted-foreground">Situação oficial</dt>
                  <dd className="font-medium">{rotuloSituacao(estado.visao.competencia.situacao)}</dd></div>
                <div><dt className="text-muted-foreground">Conformidade informada</dt>
                  <dd>{formatarPercentual(estado.visao.portao.percentual)}</dd></div>
                <div><dt className="text-muted-foreground">Requisitos pendentes</dt>
                  <dd>{estado.visao.portao.pendentes}</dd></div>
                <div><dt className="text-muted-foreground">Não conformidades bloqueantes</dt>
                  <dd>{estado.visao.portao.nao_conformidades_bloqueantes}</dd></div>
                <div><dt className="text-muted-foreground">Parecer interno aprovado</dt>
                  <dd>{estado.visao.blocking_summary.parecer_aprovado ? "Sim" : "Não"}</dd></div>
                <div><dt className="text-muted-foreground">Análise atual</dt>
                  <dd>{estado.visao.blocking_summary.analise_concluida_atual ? "Sim" : "Não"}</dd></div>
                <div><dt className="text-muted-foreground">Ação</dt>
                  <dd>Permitida pelo backend, com conferência definitiva nas RPCs</dd></div>
              </dl>
            </section>
            {!prontoRegistro ? (
              <section aria-labelledby="v119-aprovar" className="rounded-lg border border-border bg-card p-4">
                <h2 id="v119-aprovar" className="text-lg font-semibold">Etapa 1 de 2 — Aprovação</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A aprovação humana será validada pela operação oficial. A tela não altera estados críticos.
                </p>
                <label htmlFor="v119-fundamento" className="mt-4 block text-sm font-medium">
                  Fundamento da aprovação (opcional)
                </label>
                <textarea id="v119-fundamento" value={fundamento} maxLength={4000}
                  onChange={(e) => setFundamento(e.target.value)} rows={3}
                  disabled={ocupado}
                  className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Informe o fundamento, quando necessário." />
                <Button type="button" className="mt-4 min-h-11" disabled={ocupado}
                  onClick={() => setConfirmacao("aprovar")}>
                  <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden /> Aprovar apresentação
                </Button>
              </section>
            ) : (
              <section aria-labelledby="v119-registrar" className="rounded-lg border border-border bg-card p-4">
                <h2 id="v119-registrar" className="text-lg font-semibold">Etapa 2 de 2 — Registrar apresentação</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A situação oficial permite solicitar o registro. O Supabase verificará a aprovação e criará o pacote imutável durante a operação.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="v119-protocolo" className="block text-sm font-medium">
                      Protocolo (se disponível)
                    </label>
                    <input id="v119-protocolo" type="text" maxLength={120}
                      value={protocolo} onChange={(e) => setProtocolo(e.target.value)}
                      disabled={ocupado || intencao.current !== null}
                      className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div>
                    <label htmlFor="v119-forma" className="block text-sm font-medium">
                      Forma da apresentação (se disponível)
                    </label>
                    <input id="v119-forma" type="text" maxLength={120}
                      value={forma} onChange={(e) => setForma(e.target.value)}
                      disabled={ocupado || intencao.current !== null}
                      className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
                {intencao.current && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Nova tentativa usará a mesma chave de intenção para evitar duplicações.
                    Atualize a situação antes de repetir o envio.
                  </p>
                )}
                <Button type="button" className="mt-4 min-h-11" disabled={ocupado}
                  onClick={() => setConfirmacao("registrar")}>
                  <Send className="mr-2 h-4 w-4" aria-hidden /> Registrar apresentação
                </Button>
              </section>
            )}
          </>
        ) : null}
      </main>
      <Dialog open={confirmacao !== null}
        onOpenChange={(aberto) => { if (!aberto && !ocupado) setConfirmacao(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmacao === "aprovar" ? "Confirmar aprovação institucional" : "Confirmar envio ao contratante"}
            </DialogTitle>
            <DialogDescription>
              {confirmacao === "aprovar"
                ? "Confirme a competência e o fundamento. O backend verificará todos os critérios antes de autorizar."
                : "Este registro é uma operação oficial e cria o pacote imutável no backend. Confira as informações antes de confirmar."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">Competência: {estado.tipo === "ok"
            ? formatarCompetencia(estado.visao.competencia.competencia_referencia) : "—"}</p>
          {confirmacao === "registrar" && (
            <dl className="grid gap-2 text-sm">
              <div><dt className="font-medium">Protocolo</dt><dd>{protocolo || "Não informado"}</dd></div>
              <div><dt className="font-medium">Forma</dt><dd>{forma || "Não informada"}</dd></div>
            </dl>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" className="min-h-11"
              disabled={ocupado} onClick={() => setConfirmacao(null)}>Cancelar</Button>
            <Button type="button" className="min-h-11" disabled={ocupado}
              onClick={() => { if (confirmacao) void executar(confirmacao); }}>
              {ocupado && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {confirmacao === "aprovar" ? "Confirmar aprovação" : "Confirmar registro"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * PROMPT 39 / V1-18 — Parecer interno da competência.
 * Backend: fonte exclusiva de acesso, criação, decisão e portão.
 * Sem mutação direta de status ou edição manual de parecer.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle, ArrowLeft, CheckCircle2, ClipboardCheck, Clock3,
  FileText, Loader2, Lock, RefreshCw, SearchX, ShieldAlert,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia } from "@/lib/contratos/competenciasDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  classificarErroVisaoGeral, obterVisaoGeral, parseVisaoGeral, type VisaoGeral,
} from "@/lib/competencias/competenciaVisaoGeralDados";
import {
  MENSAGENS_V118, PAGINA_PARECERES, ErroParecer, decidirParecer,
  listarPareceres, solicitarParecer,
  type PaginaPareceres, type TipoErroParecer, type ParecerInterno,
} from "@/lib/competencias/parecerInternoDados";

type Estado =
  | { tipo: "carregando" | "sessao" | "indisponivel" }
  | { tipo: TipoErroParecer }
  | { tipo: "ok"; visao: VisaoGeral; pagina: PaginaPareceres };
type Decisao = { id: string; aprovar: boolean } | null;
const CARREGANDO: Estado = { tipo: "carregando" };
const NAO_ENCONTRADO: Estado = { tipo: "nao_encontrado" };
const abortado = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

function explicarErro(e: unknown) {
  return e instanceof ErroParecer ? MENSAGENS_V118[e.tipo] : MENSAGENS_V118.erro;
}
function Retorno({ children, erro = false }: { children: ReactNode; erro?: boolean }) {
  return (
    <p role={erro ? "alert" : "status"}
      className={"flex items-start gap-2 rounded-md border p-4 text-sm " +
        (erro ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")}>
      {erro
        ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        : <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span>{children}</span>
    </p>
  );
}
function formatoData(valor: string | null) {
  return valor ? formatarDataHoraBr(valor) : "Não informado";
}

export function CompetenciaParecer({ id }: { id: string }) {
  const navigate = useNavigate();
  const valido = uuidValido(id);
  const idC = valido ? uuidCanonico(id) : id;
  const chave = useRef(idC);
  chave.current = idC;

  const [registro, setRegistro] = useState<{ id: string; e: Estado }>({
    id: idC, e: CARREGANDO,
  });
  const [pag, setPag] = useState<{ id: string; offset: number }>({
    id: idC, offset: 0,
  });
  const offset = pag.id === idC ? pag.offset : 0;
  const [recarregar, setRecarregar] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);
  const [aviso, setAviso] = useState<{ erro: boolean; mensagem: string } | null>(null);
  const [decisao, setDecisao] = useState<Decisao>(null);
  const [fundamento, setFundamento] = useState("");
  const estado: Estado = !valido ? NAO_ENCONTRADO : registro.id === idC ? registro.e : CARREGANDO;

  useEffect(() => {
    if (!valido) return;
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    setRegistro({ id: idC, e: CARREGANDO });
    (async () => {
      try {
        const { data: usuario, error: erroSessao } = await supabase.auth.getUser();
        if (signal.aborted) return;
        const semSessao =
          (erroSessao as { name?: string; code?: string } | null)?.name === "AuthSessionMissingError" ||
          (erroSessao as { name?: string; code?: string } | null)?.code === "session_not_found";
        if (semSessao || (!erroSessao && !usuario.user))
          return void navigate({ to: "/login", replace: true });
        if (erroSessao || !usuario.user) {
          setRegistro({ id: idC, e: { tipo: "sessao" } });
          return;
        }
        const org = obterPreferenciaOrganizacao(usuario.user.id);
        if (!org) return void navigate({ to: "/selecionar-organizacao", replace: true });
        const r = await obterVisaoGeral(idC, signal);
        if (signal.aborted) return;
        if (r.error) {
          const tipo = classificarErroVisaoGeral(r.error, r.status);
          setRegistro({
            id: idC,
            e: { tipo: tipo === "sem_permissao" ? "sem_permissao" :
              tipo === "nao_encontrada" ? "nao_encontrado" : "erro" },
          });
          return;
        }
        const visao = parseVisaoGeral(r.data);
        if (!visao || uuidCanonico(visao.competencia.id) !== idC ||
            visao.competencia.id_organizacao !== org ||
            !uuidValido(visao.competencia.id_contrato)) {
          setRegistro({ id: idC, e: { tipo: "erro" } });
          return;
        }
        if (!visao.allowed_actions.abrir_parecer) {
          setRegistro({ id: idC, e: { tipo: "indisponivel" } });
          return;
        }
        const pagina = await listarPareceres(
          idC, org, uuidCanonico(visao.competencia.id_contrato), offset, signal);
        if (!signal.aborted) setRegistro({ id: idC, e: { tipo: "ok", visao, pagina } });
      } catch (e) {
        if (signal.aborted || abortado(e)) return;
        setRegistro({
          id: idC, e: { tipo: e instanceof ErroParecer ? e.tipo : "erro" },
        });
      }
    })();
    return () => ctrl.abort();
  }, [idC, valido, navigate, offset, recarregar]);

  const carregar = () => {
    if (ocupadoRef.current) return;
    setAviso(null);
    setRecarregar((v) => v + 1);
  };
  const mudarPagina = (v: number) => {
    if (ocupadoRef.current || v < 0) return;
    setAviso(null);
    setPag({ id: idC, offset: v });
  };
  const executar = async (
    operacao: () => Promise<unknown>,
    mensagemOk: string,
  ) => {
    if (ocupadoRef.current || estado.tipo !== "ok") return;
    ocupadoRef.current = true;
    setOcupado(true);
    setAviso(null);
    const idAntes = idC;
    try {
      await operacao();
      if (chave.current === idAntes) setAviso({ erro: false, mensagem: mensagemOk });
    } catch (e) {
      if (chave.current === idAntes) setAviso({ erro: true, mensagem: explicarErro(e) });
    } finally {
      ocupadoRef.current = false;
      if (chave.current === idAntes) {
        setOcupado(false);
        setDecisao(null);
        setFundamento("");
        // Reconciliar por uma leitura, inclusive após resultado ambíguo.
        // Nunca reenviar automaticamente a mutação.
        setRecarregar((v) => v + 1);
      }
    }
  };
  const solicitar = () => void executar(
    () => solicitarParecer(idC),
    "Solicitação enviada ao sistema. Consulte a versão e a situação após a atualização.",
  );
  const confirmar = () => {
    if (!decisao) return;
    const { id: parecer, aprovar } = decisao;
    void executar(
      () => decidirParecer(parecer, aprovar, fundamento),
      "Decisão recebida pelo sistema. A situação exibida será atualizada conforme o backend.",
    );
  };

  const ultima = estado.tipo === "ok" && offset === 0 ? estado.pagina.itens[0] : null;
  const podeDecidir = ultima && !ultima.aprovado_em && !["aprovado", "reprovado"].includes(ultima.status);
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
            <h1 className="text-2xl font-semibold tracking-tight">Parecer interno</h1>
            {estado.tipo === "ok" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Competência {formatarCompetencia(estado.visao.competencia.competencia_referencia)}
              </p>
            )}
          </div>
          {estado.tipo === "ok" && (
            <Button type="button" variant="outline" className="min-h-11"
              disabled={ocupado} onClick={carregar}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar
            </Button>
          )}
        </div>

        {!valido || estado.tipo === "nao_encontrado" ? (
          <Retorno>{MENSAGENS_V118.nao_encontrado}</Retorno>
        ) : estado.tipo === "carregando" ? (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {MENSAGENS_V118.carregando}
          </p>
        ) : estado.tipo === "indisponivel" ? (
          <Retorno><Lock className="mr-2 inline h-4 w-4" aria-hidden />{MENSAGENS_V118.indisponivel}</Retorno>
        ) : estado.tipo === "sessao" ? (
          <Retorno erro>{MENSAGENS_V118.sessao}</Retorno>
        ) : estado.tipo === "sem_permissao" ? (
          <Retorno erro><ShieldAlert className="mr-2 inline h-4 w-4" aria-hidden />{MENSAGENS_V118.sem_permissao}</Retorno>
        ) : estado.tipo === "ok" ? (
          <>
            <section aria-labelledby="v118-acoes" className="rounded-lg border border-border bg-card p-4">
              <h2 id="v118-acoes" className="text-lg font-semibold">Solicitações e decisões</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A solicitação e a decisão são verificadas pelo backend. Esta tela não libera
                apresentação nem altera o status da competência.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="min-h-11" disabled={ocupado} type="button" onClick={solicitar}>
                  {ocupado ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> :
                    <FileText className="mr-2 h-4 w-4" aria-hidden />}
                  Solicitar parecer
                </Button>
                {podeDecidir && (
                  <>
                    <Button type="button" className="min-h-11" variant="outline" disabled={ocupado}
                      onClick={() => { setDecisao({ id: ultima.id, aprovar: true }); setFundamento(""); }}>
                      <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden /> Aprovar parecer
                    </Button>
                    <Button type="button" className="min-h-11" variant="outline" disabled={ocupado}
                      onClick={() => { setDecisao({ id: ultima.id, aprovar: false }); setFundamento(""); }}>
                      <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden /> Reprovar parecer
                    </Button>
                  </>
                )}
              </div>
              {aviso && <div className="mt-4" aria-live="polite">
                <Retorno erro={aviso.erro}>{aviso.mensagem}</Retorno>
              </div>}
            </section>
            <section aria-labelledby="v118-historico" className="rounded-lg border border-border bg-card p-4">
              <h2 id="v118-historico" className="text-lg font-semibold">Versões do parecer</h2>
              {estado.pagina.itens.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{MENSAGENS_V118.vazio}</p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {estado.pagina.itens.map((parecer: ParecerInterno) => (
                    <li key={parecer.id} className="rounded-md border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold">Versão {parecer.versao}</h3>
                        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs">
                          Situação: {parecer.status}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="text-muted-foreground">Autor</dt>
                          <dd>{parecer.autor || "Não informado"}</dd></div>
                        <div><dt className="text-muted-foreground">Criado em</dt>
                          <dd>{formatoData(parecer.criado_em)}</dd></div>
                        <div><dt className="text-muted-foreground">Aprovado em</dt>
                          <dd>{formatoData(parecer.aprovado_em)}</dd></div>
                        <div><dt className="text-muted-foreground">Integridade (SHA-256)</dt>
                          <dd className="break-all font-mono text-xs">{parecer.hash}</dd></div>
                      </dl>
                      <div className="mt-4 border-t border-border pt-3">
                        <p className="mb-2 text-sm font-medium">Conteúdo registrado</p>
                        <p className="whitespace-pre-wrap break-words text-sm">{parecer.texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <nav aria-label="Paginação dos pareceres"
                className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">
                  {estado.pagina.total === 0 ? "0" : offset + 1} a{" "}
                  {Math.min(offset + PAGINA_PARECERES, estado.pagina.total)} de{" "}
                  {estado.pagina.total} pareceres
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" className="min-h-11" disabled={ocupado || offset === 0}
                    onClick={() => mudarPagina(Math.max(0, offset - PAGINA_PARECERES))}>
                    Anterior
                  </Button>
                  <Button variant="outline" className="min-h-11"
                    disabled={ocupado || offset + PAGINA_PARECERES >= estado.pagina.total}
                    onClick={() => mudarPagina(offset + PAGINA_PARECERES)}>Próxima</Button>
                </div>
              </nav>
            </section>
          </>
        ) : (
          <div className="space-y-3">
            <Retorno erro>{MENSAGENS_V118[estado.tipo]}</Retorno>
            <Button variant="outline" className="min-h-11" onClick={carregar}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
            </Button>
          </div>
        )}
      </main>
      <Dialog open={decisao !== null} onOpenChange={(open) => { if (!open && !ocupado) setDecisao(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisao?.aprovar ? "Confirmar aprovação" : "Confirmar reprovação"}</DialogTitle>
            <DialogDescription>
              Esta decisão será enviada à operação oficial do Supabase e registrada conforme as
              permissões e regras de aprovação. O resultado será consultado novamente.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="v118-fundamento" className="text-sm font-medium">
            Fundamento {decisao?.aprovar ? "(opcional)" : "(obrigatório)"}
          </label>
          <textarea id="v118-fundamento" value={fundamento}
            onChange={(e) => setFundamento(e.target.value)} maxLength={4000} rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Informe o fundamento da decisão." />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="min-h-11" type="button" disabled={ocupado}
              onClick={() => setDecisao(null)}>Cancelar</Button>
            <Button className="min-h-11" type="button"
              disabled={ocupado || (!decisao?.aprovar && !fundamento.trim())}
              onClick={confirmar}>Confirmar decisão</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

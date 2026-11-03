/**
 * V1-17 — Detalhe do requisito (drawer na rota existente `/competencias/:id/analise`).
 * Gate: UUID (competência e requisito) → getUser → preferência de organização (contexto) →
 * `obter_detalhe_requisito_v117`. Resultado, mecanismo, N/A, efeito no portão e ações são
 * autoridade do backend; o drawer apenas traduz literais em texto + ícone.
 * Reanálise: `solicitar_reanalise_requisitos(id, [idRequisito])` somente com allowed_actions.reanalisar.
 * Download: `baixarDocumento(id_arquivo)` (V1-10) somente para documento "aprovado".
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  MinusCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import { baixarDocumento } from "@/lib/contratos/documentosDados";
import {
  rotuloCriticidade,
  rotuloResultado,
  rotuloStatusApontamento,
} from "@/lib/competencias/competenciaAnaliseDados";
import {
  ErroReanalise,
  MENSAGENS_V117,
  OFFSETS_DETALHE_ZERO,
  classificarErroV117,
  obterDetalheRequisito,
  parseDetalheV117,
  podeBaixar,
  solicitarReanaliseRequisito,
  type DetalheV117,
  type EvidenciaV117,
  type ExecucaoV117,
  type OffsetsDetalhe,
  type PaginacaoV117,
  type ResultadoV117,
  type TipoErroV117,
} from "@/lib/competencias/requisitoDetalheDados";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro_sessao" }
  | { tipo: TipoErroV117 }
  | { tipo: "ok"; d: DetalheV117 };
type Aviso = "ok" | "reconciliada" | "falha" | "conflito" | "sem_permissao" | "invalida";

const ROT_MEC: Record<string, string> = {
  deterministico: "Determinístico (regra objetiva)",
  semantico: "Semântico (IA)",
  humano: "Humano (decisão de revisor)",
  nao_identificado: "Não identificado",
};
const fmtConf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const simNao = (v: boolean | null) => (v === null ? "—" : v ? "Sim" : "Não");
const ehAbort = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

type Props = {
  idCompetencia: string;
  idRequisito: string | null;
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  /** Recarga da visão V1-16 (que já aplica o polling compartilhado). */
  onReanalisado: () => void;
};

export function RequirementDrawer({ idCompetencia, idRequisito, aberto, onOpenChange, onReanalisado }: Props) {
  const titulo = useRef<HTMLHeadingElement>(null);
  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          titulo.current?.focus();
        }}
      >
        <SheetHeader className="border-b border-border p-4 pr-12 text-left">
          <SheetTitle ref={titulo} tabIndex={-1} className="outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Detalhe do requisito
          </SheetTitle>
          <SheetDescription>Fonte, resultado, evidências, apontamentos e histórico conforme o sistema.</SheetDescription>
        </SheetHeader>
        {aberto && idRequisito ? (
          <Conteudo
            idCompetencia={idCompetencia}
            idRequisito={idRequisito}
            onReanalisado={onReanalisado}
          />
        ) : null}
        <div className="mt-auto border-t border-border p-4">
          <Button variant="outline" className="min-h-11" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Conteudo({
  idCompetencia,
  idRequisito,
  onReanalisado,
}: {
  idCompetencia: string;
  idRequisito: string;
  onReanalisado: () => void;
}) {
  const navigate = useNavigate();
  const idsOk = uuidValido(idCompetencia) && uuidValido(idRequisito);
  const c = idsOk ? uuidCanonico(idCompetencia) : idCompetencia;
  const r = idsOk ? uuidCanonico(idRequisito) : idRequisito;
  const chave = `${c}:${r}`;

  const [reg, setReg] = useState<{ k: string; e: Estado }>({ k: chave, e: { tipo: "carregando" } });
  const estado: Estado = !idsOk
    ? { tipo: "nao_encontrado" }
    : reg.k === chave
      ? reg.e
      : { tipo: "carregando" };
  const [autorizado, setAutorizado] = useState<string | null>(null);
  const [off, setOff] = useState<{ k: string; o: OffsetsDetalhe }>({ k: chave, o: OFFSETS_DETALHE_ZERO });
  const o = off.k === chave ? off.o : OFFSETS_DETALHE_ZERO;
  const [recarga, setRecarga] = useState(0);
  const [tentativa, setTentativa] = useState(0);
  const [aviso, setAviso] = useState<{ k: string; a: Aviso } | null>(null);
  const avisoAtual = aviso && aviso.k === chave ? aviso.a : null;
  const [enviando, setEnviando] = useState<string | null>(null);
  const trava = useRef(false);
  const chaveAtual = useRef(chave);
  chaveAtual.current = chave;

  useEffect(() => {
    trava.current = false;
    setAutorizado(null);
    if (!idsOk) return;
    let vivo = true;
    setReg({ k: chave, e: { tipo: "carregando" } });
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vivo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user)) return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setReg({ k: chave, e: { tipo: "erro_sessao" } });
        if (!obterPreferenciaOrganizacao(data.user.id))
          return void navigate({ to: "/selecionar-organizacao", replace: true });
        setAutorizado(chave);
      } catch {
        if (vivo) setReg({ k: chave, e: { tipo: "erro_sessao" } });
      }
    })();
    return () => {
      vivo = false;
    };
  }, [idsOk, chave, navigate, tentativa]);

  const { ev, hist, ap } = o;
  useEffect(() => {
    if (!idsOk || autorizado !== chave) return;
    const ctrl = new AbortController();
    const offs = { ev, hist, ap };
    (async () => {
      try {
        const { data, error, status } = await obterDetalheRequisito(c, r, offs, ctrl.signal);
        if (ctrl.signal.aborted) return;
        if (error) {
          if (ehAbort(error)) return;
          return void setReg({ k: chave, e: { tipo: classificarErroV117(error, status) } });
        }
        const d = parseDetalheV117(data, c, r, offs);
        setReg({ k: chave, e: d ? { tipo: "ok", d } : { tipo: "erro" } });
      } catch (e) {
        if (ctrl.signal.aborted || ehAbort(e)) return;
        setReg({ k: chave, e: { tipo: "erro" } });
      }
    })();
    return () => ctrl.abort();
  }, [idsOk, autorizado, chave, c, r, ev, hist, ap, recarga]);

  const mudarOffset = (k: keyof OffsetsDetalhe, v: number) => setOff({ k: chave, o: { ...o, [k]: v } });

  const reanalisar = async () => {
    if (trava.current) return;
    trava.current = true;
    const alvo = chave;
    setEnviando(alvo);
    setAviso(null);
    try {
      await solicitarReanaliseRequisito(c, r);
      if (chaveAtual.current === alvo) {
        setAviso({ k: alvo, a: "ok" });
        setRecarga((n) => n + 1);
        onReanalisado();
      }
    } catch (e) {
      const t = e instanceof ErroReanalise ? e.tipo : "erro";
      if (t === "conflito" || t === "sem_permissao" || t === "invalida") {
        if (chaveAtual.current === alvo) setAviso({ k: alvo, a: t });
      } else {
        // Erro/timeout ambíguo: nenhuma segunda escrita; uma única leitura de reconciliação.
        let d: DetalheV117 | null = null;
        try {
          const x = await obterDetalheRequisito(c, r, o, new AbortController().signal);
          d = x.error ? null : parseDetalheV117(x.data, c, r, o);
        } catch {
          d = null;
        }
        if (chaveAtual.current === alvo) {
          if (d) setReg({ k: alvo, e: { tipo: "ok", d } });
          setAviso({ k: alvo, a: d ? "reconciliada" : "falha" });
          if (d) onReanalisado();
        }
      }
    } finally {
      if (chaveAtual.current === alvo) trava.current = false;
      setEnviando(null);
    }
  };

  if (estado.tipo === "carregando")
    return (
      <p role="status" aria-live="polite" className="flex items-center gap-2 p-4 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {MENSAGENS_V117.carregando}
      </p>
    );
  if (estado.tipo !== "ok") {
    const msg = estado.tipo === "erro_sessao" ? MENSAGENS_V117.erroSessao : MENSAGENS_V117[estado.tipo];
    const retry = estado.tipo === "erro" || estado.tipo === "erro_sessao";
    return (
      <div role="alert" className="space-y-3 p-4 text-sm">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          {msg}
        </p>
        {retry ? (
          <Button variant="outline" className="min-h-11" onClick={() => setTentativa((n) => n + 1)}>
            <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        ) : null}
      </div>
    );
  }

  const d = estado.d;
  const q = d.requisito;
  const enviandoAqui = enviando === chave;
  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 text-sm">
        <section aria-labelledby="v117-req" className="space-y-2">
          <h3 id="v117-req" className="text-base font-semibold">
            Requisito
          </h3>
          <p className="font-medium">{q.codigo ?? "—"}</p>
          <p>{q.descricao ?? "—"}</p>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            <Par t="Categoria" v={q.categoria} />
            <Par t="Criticidade" v={q.criticidade ? rotuloCriticidade(q.criticidade) : null} />
            <Par t="Obrigatório" v={simNao(q.obrigatorio)} />
            <Par t="Aplicável" v={simNao(q.aplicavel)} />
            <Par t="Impeditivo" v={simNao(q.impeditivo)} />
            <Par t="Efeito no portão" v={q.efeito_portao} />
            <Par t="Regra de validação" v={q.regra_validacao} />
            <Par t="Condição de aplicabilidade" v={q.condicao_aplicabilidade} />
          </dl>
        </section>

        <SourceReference d={d} />

        <Bloco id="v117-ref" titulo="Resultado de referência">
          {d.resultado_referencia ? (
            <ResultadoCard r={d.resultado_referencia} />
          ) : (
            <p className="text-muted-foreground">Sem resultado registrado para este requisito.</p>
          )}
          {d.na_validade ? (
            <div className="rounded-md border border-border p-3">
              <p className="flex items-center gap-2 font-medium">
                {d.na_validade.valido ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
                {d.na_validade.valido ? "Não aplicável válido" : "Não aplicável inválido"}
              </p>
              <p>Possui fundamento: {simNao(d.na_validade.possui_fundamento)}</p>
              <p>Possui evidência: {simNao(d.na_validade.possui_evidencia)}</p>
            </div>
          ) : null}
        </Bloco>

        <Bloco id="v117-exec" titulo="Última execução global">
          <ExecucaoCard e={d.execucao_atual} />
          {d.execucao_atual ? (
            d.resultado_atual ? (
              <ResultadoCard r={d.resultado_atual} />
            ) : (
              <p className="text-muted-foreground">Sem resultado deste requisito nesta execução.</p>
            )
          ) : null}
        </Bloco>

        {d.allowed_actions.reanalisar ? (
          <div className="space-y-2">
            <Button className="min-h-11" disabled={enviandoAqui} onClick={reanalisar}>
              {enviandoAqui ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
              )}
              Reanalisar este requisito
            </Button>
          </div>
        ) : null}
        <p role="status" aria-live="polite" className="text-sm">
          {avisoAtual === "ok"
            ? MENSAGENS_V117.reanaliseOk
            : avisoAtual === "reconciliada"
              ? MENSAGENS_V117.reanaliseReconciliada
              : avisoAtual === "falha"
                ? MENSAGENS_V117.reanaliseFalha
                : avisoAtual === "conflito"
                  ? MENSAGENS_V117.conflito
                  : avisoAtual === "sem_permissao"
                    ? MENSAGENS_V117.sem_permissao
                    : avisoAtual === "invalida"
                      ? MENSAGENS_V117.invalida
                      : ""}
        </p>

        <EvidenceList d={d} onPagina={(v) => mudarOffset("ev", v)} />

        <Bloco id="v117-ap" titulo="Apontamentos do requisito">
          {d.apontamentos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum apontamento para este requisito.</p>
          ) : (
            <ul className="space-y-2">
              {d.apontamentos.map((a) => (
                <li key={a.id} className="rounded-md border border-border p-3">
                  <p className="font-medium">{a.descricao ?? "—"}</p>
                  <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <Par t="Severidade" v={a.severidade ? rotuloCriticidade(a.severidade) : null} />
                    <Par t="Status" v={a.status ? rotuloStatusApontamento(a.status) : null} />
                    <Par t="Origem" v={a.origem} />
                    <Par t="Regra violada" v={a.regra_violada} />
                    <Par t="Ação sugerida" v={a.acao_sugerida} />
                    <Par t="Registrado em" v={formatarDataHoraBr(a.criado_em)} />
                  </dl>
                  {a.fonte.length ? (
                    <p className="text-xs text-muted-foreground">
                      Fonte: {a.fonte.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <Paginador rotulo="apontamentos" p={d.apontamentos_paginacao} onPagina={(v) => mudarOffset("ap", v)} />
        </Bloco>

        <AuditTimeline d={d} onPagina={(v) => mudarOffset("hist", v)} />
      </div>
    </TooltipProvider>
  );
}

function Bloco({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-2">
      <h3 id={id} className="text-base font-semibold">
        {titulo}
      </h3>
      {children}
    </section>
  );
}
function Par({ t, v }: { t: ReactNode; v: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="inline text-muted-foreground">{t}: </dt>
      <dd className="inline break-words">{v ?? "—"}</dd>
    </div>
  );
}
function Termo({ t, dica }: { t: string; dica: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2">
          {t}
          <HelpCircle className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">: {dica}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  );
}
const DICA_HASH = "Impressão digital do conteúdo; muda se o conteúdo mudar.";

function ResultBadge({ v }: { v: string }) {
  const Icone =
    v === "conforme" ? CheckCircle2 : v === "nao_conforme" ? XCircle : v === "nao_aplicavel" ? MinusCircle : CircleHelp;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-medium">
      <Icone className="h-4 w-4" aria-hidden="true" />
      {rotuloResultado(v)}
    </span>
  );
}

function ResultadoCard({ r }: { r: ResultadoV117 }) {
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <ResultBadge v={r.resultado} />
      <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Par
          t={<Termo t="Mecanismo" dica="Como o resultado foi produzido: regra objetiva, IA ou revisor humano." />}
          v={r.mecanismo ? (ROT_MEC[r.mecanismo] ?? r.mecanismo) : null}
        />
        <Par
          t={<Termo t="Confiança" dica="Grau de confiança informado pelo sistema para este resultado." />}
          v={r.confianca === null ? null : fmtConf.format(r.confianca)}
        />
        <Par t="Registrado em" v={formatarDataHoraBr(r.criado_em)} />
        <Par t={<Termo t="Hash das evidências" dica={DICA_HASH} />} v={r.hash_evidencias} />
      </dl>
      {r.justificativa ? <p>Justificativa: {r.justificativa}</p> : null}
      {r.fundamento ? <p className="text-muted-foreground">Fundamento: {r.fundamento}</p> : null}
    </div>
  );
}

function ExecucaoCard({ e }: { e: ExecucaoV117 | null }) {
  if (!e) return <p className="text-muted-foreground">Nenhuma execução registrada.</p>;
  return (
    <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <Par t="Tipo" v={e.tipo} />
      <Par t="Status" v={e.status} />
      <Par t="Motor" v={[e.motor, e.versao_motor].filter(Boolean).join(" ") || null} />
      <Par t="Provedor/modelo" v={[e.provedor, e.modelo].filter(Boolean).join(" / ") || null} />
      <Par t="Versão do prompt" v={e.prompt_versao} />
      <Par t={<Termo t="Hash de entrada" dica={DICA_HASH} />} v={e.hash_entrada} />
      <Par t="Iniciada em" v={formatarDataHoraBr(e.iniciada_em)} />
      <Par t="Concluída em" v={formatarDataHoraBr(e.concluida_em)} />
    </dl>
  );
}

function SourceReference({ d }: { d: DetalheV117 }) {
  const q = d.requisito;
  return (
    <Bloco id="v117-fonte" titulo="Fonte e versionamento">
      <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Par t="Tipo de fonte" v={q.fonte_tipo} />
        <Par t="Referência" v={q.fonte_referencia} />
        <Par t="Detalhe" v={q.fonte_detalhe} />
        <Par t="Origem" v={q.origem_tipo} />
        <Par t="Identificador da origem" v={q.origem_id} />
        <Par t="Versão da origem" v={q.origem_versao} />
        <Par t={<Termo t="Hash do snapshot" dica={DICA_HASH} />} v={q.hash_snapshot} />
      </dl>
    </Bloco>
  );
}

function EvidenceList({ d, onPagina }: { d: DetalheV117; onPagina: (n: number) => void }) {
  return (
    <Bloco id="v117-ev" titulo="Evidências">
      {d.evidencias.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma evidência para o resultado de referência.</p>
      ) : (
        <ul className="space-y-2">
          {d.evidencias.map((e) => (
            <EvidenciaItem key={e.id} e={e} />
          ))}
        </ul>
      )}
      <Paginador rotulo="evidências" p={d.evidencias_paginacao} onPagina={onPagina} />
    </Bloco>
  );
}
function EvidenciaItem({ e }: { e: EvidenciaV117 }) {
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const doc = e.documento;
  const baixar = async () => {
    if (!podeBaixar(doc) || baixando) return;
    setBaixando(true);
    setErro(false);
    try {
      await baixarDocumento(doc.id_arquivo);
    } catch {
      setErro(true);
    } finally {
      setBaixando(false);
    }
  };
  return (
    <li className="space-y-1 rounded-md border border-border p-3">
      <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Par t="Tipo" v={e.tipo_evidencia} />
        <Par t="Página" v={e.pagina === null ? null : String(e.pagina)} />
        <Par t="Referência externa" v={e.referencia_externa} />
        <Par t={<Termo t="Hash" dica={DICA_HASH} />} v={e.hash} />
        <Par t="Registrada em" v={formatarDataHoraBr(e.criado_em)} />
      </dl>
      {doc ? (
        <p className="flex flex-wrap items-center gap-1">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {doc.nome_original ?? "Documento"}
          {doc.numero_versao !== null ? ` · versão ${doc.numero_versao}` : ""}
          {doc.status_seguranca ? ` · segurança: ${doc.status_seguranca}` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {e.trecho ? (
          <Button variant="outline" className="min-h-11" aria-expanded={ver} onClick={() => setVer((v) => !v)}>
            {ver ? "Ocultar trecho" : "Ver trecho"}
          </Button>
        ) : null}
        {podeBaixar(doc) ? (
          <Button
            variant="outline"
            className="min-h-11"
            disabled={baixando}
            aria-label={`Baixar ${doc.nome_original ?? "documento"}`}
            onClick={baixar}
          >
            <Download className="mr-1 h-4 w-4" aria-hidden="true" />
            Baixar
          </Button>
        ) : null}
      </div>
      {ver && e.trecho ? <blockquote className="border-l-2 border-border pl-3">“{e.trecho}”</blockquote> : null}
      {erro ? (
        <p role="alert" className="text-destructive">
          {MENSAGENS_V117.downloadFalha}
        </p>
      ) : null}
    </li>
  );
}

function AuditTimeline({ d, onPagina }: { d: DetalheV117; onPagina: (n: number) => void }) {
  return (
    <Bloco id="v117-hist" titulo="Histórico de auditoria">
      {d.historico.length === 0 ? (
        <p className="text-muted-foreground">Nenhum resultado anterior registrado.</p>
      ) : (
        <ol className="space-y-2">
          {d.historico.map((h) => (
            <li key={h.id_resultado} className="space-y-1 rounded-md border border-border p-3">
              <ResultBadge v={h.resultado} />
              <dl className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Par t="Execução" v={[h.tipo_execucao, h.status_execucao].filter(Boolean).join(" · ") || null} />
                <Par t="Mecanismo" v={h.mecanismo ? (ROT_MEC[h.mecanismo] ?? h.mecanismo) : null} />
                <Par t="Motor" v={[h.motor, h.versao_motor].filter(Boolean).join(" ") || null} />
                <Par t="Provedor/modelo" v={[h.provedor, h.modelo].filter(Boolean).join(" / ") || null} />
                <Par t="Versão do prompt" v={h.prompt_versao} />
                <Par t="Hash de entrada" v={h.hash_entrada} />
                <Par t="Confiança" v={h.confianca === null ? null : fmtConf.format(h.confianca)} />
                <Par t="Registrado em" v={formatarDataHoraBr(h.criado_em)} />
              </dl>
              {h.justificativa ? <p>Justificativa: {h.justificativa}</p> : null}
            </li>
          ))}
        </ol>
      )}
      <Paginador rotulo="histórico" p={d.historico_paginacao} onPagina={onPagina} />
    </Bloco>
  );
}

function Paginador({ rotulo, p, onPagina }: { rotulo: string; p: PaginacaoV117; onPagina: (n: number) => void }) {
  if (p.total <= p.limite) return null;
  const pagina = Math.floor(p.offset / p.limite) + 1;
  const paginas = Math.max(1, Math.ceil(p.total / p.limite));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        className="min-h-11"
        disabled={p.offset === 0}
        aria-label={`Página anterior de ${rotulo}`}
        onClick={() => onPagina(Math.max(0, p.offset - p.limite))}
      >
        Anterior
      </Button>
      <span>
        Página {pagina} de {paginas}
      </span>
      <Button
        variant="outline"
        className="min-h-11"
        disabled={p.offset + p.limite >= p.total}
        aria-label={`Próxima página de ${rotulo}`}
        onClick={() => onPagina(p.offset + p.limite)}
      >
        Próxima
      </Button>
    </div>
  );
}

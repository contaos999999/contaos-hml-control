/**
 * V1-15 — Competência: documentos (`/competencias/:id/documentos`).
 * Gate: UUID → getUser → preferência de organização (contexto) → `obter_documentos_competencia_v115`.
 * Estado documental, paginação e capacidades são autoridade do backend.
 * Upload/download: pipeline certificado V1-10 (`enviarArquivoCertificado`, `baixarDocumento`).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileUp,
  Loader2,
  Lock,
  RefreshCw,
  SearchX,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia } from "@/lib/contratos/competenciasDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  ErroDoc,
  MENSAGENS_V110,
  PAGINA_DOCS,
  ROTULO_PROCESSAMENTO,
  ROTULO_SEGURANCA,
  ROTULO_TIPO,
  aceiteDe,
  atrasoPolling,
  baixarDocumento,
  enviarArquivoCertificado,
  formatarBytes,
  hashCurto,
  mensagemErroEnvio,
  obterConfiguracaoUpload,
  tituloDeArquivo,
  validarArquivo,
  type ConfigUpload,
  type EstadoEnvio,
} from "@/lib/contratos/documentosDados";
import {
  ErroV115,
  ROTULO_ESTADO_DOCUMENTAL,
  adicionarVersaoCompetencia,
  classificarErroV115,
  criarDocumentoCompetencia,
  obterDocumentosCompetencia,
  parseLeituraV115,
  tiposParaRequisito,
  type DocV115,
  type LeituraV115,
  type TipoErroV115,
} from "@/lib/competencias/competenciaDocumentosDados";

export const MENSAGENS_V115 = {
  carregando: "Carregando documentos da competência…",
  naoEncontrada: "Competência não encontrada ou indisponível.",
  negado: "Você não tem acesso a esta competência.",
  erro: "Não foi possível carregar os documentos agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  vazio: "Nenhum documento vinculado a esta competência.",
  semRequisitos: "O snapshot desta competência não declara requisitos documentais.",
  bloqueadoBackend: "Bloqueado pelo backend",
  semTipo: "Selecione o tipo do documento.",
  duplicada: "Este documento já foi registrado nesta competência.",
} as const;

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro_sessao" }
  | { tipo: "sem_permissao" | "nao_encontrada" | "erro" }
  | { tipo: "ok"; l: LeituraV115 };

const ehAbort = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError";

function mensagemFalha(e: unknown): string {
  if (e instanceof ErroDoc) return mensagemErroEnvio(e.tipo);
  const t: TipoErroV115 = e instanceof ErroV115 ? e.tipo : "erro";
  return {
    sem_permissao: MENSAGENS_V110.semPermissao,
    nao_encontrada: MENSAGENS_V110.naoEncontradoEnvio,
    duplicada: MENSAGENS_V115.duplicada,
    conflito: MENSAGENS_V110.conflito,
    erro: MENSAGENS_V110.erroEnvio,
  }[t];
}

export function CompetenciaDocumentos({ id }: { id: string }) {
  const navigate = useNavigate();
  const idOk = uuidValido(id);
  const idC = idOk ? uuidCanonico(id) : id;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [autorizado, setAutorizado] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [offDocs, setOffDocs] = useState(0);
  const [offReqs, setOffReqs] = useState(0);
  const [recarga, setRecarga] = useState(0);
  const polls = useRef(0);
  const [config, setConfig] = useState<ConfigUpload | null | "erro">(null);

  // Gate de sessão/organização (uma vez por tentativa).
  useEffect(() => {
    if (!idOk) return;
    let vivo = true;
    setAutorizado(false);
    setEstado({ tipo: "carregando" });
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vivo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user))
          return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setEstado({ tipo: "erro_sessao" });
        if (!obterPreferenciaOrganizacao(data.user.id))
          return void navigate({ to: "/selecionar-organizacao", replace: true });
        setAutorizado(true);
      } catch {
        if (vivo) setEstado({ tipo: "erro_sessao" });
      }
    })();
    return () => {
      vivo = false;
    };
  }, [idOk, idC, navigate, tentativa]);

  // Leitura autoritativa paginada.
  useEffect(() => {
    if (!autorizado) return;
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    (async () => {
      try {
        const { data, error, status } = await obterDocumentosCompetencia(
          idC,
          offDocs,
          offReqs,
          signal,
        );
        if (signal.aborted) return;
        if (error) {
          if (ehAbort(error)) return;
          const t = classificarErroV115(error, status);
          return void setEstado({
            tipo: t === "sem_permissao" || t === "nao_encontrada" ? t : "erro",
          });
        }
        const l = parseLeituraV115(data);
        setEstado(l ? { tipo: "ok", l } : { tipo: "erro" });
      } catch (e) {
        if (signal.aborted || ehAbort(e)) return;
        setEstado({ tipo: "erro" });
      }
    })();
    return () => ctrl.abort();
  }, [autorizado, idC, offDocs, offReqs, recarga]);

  // Polling somente quando o backend indica processamento.
  const processando = estado.tipo === "ok" && estado.l.estado_documental === "processing";
  useEffect(() => {
    if (!processando) {
      polls.current = 0;
      return;
    }
    const t = setTimeout(() => {
      polls.current += 1;
      setRecarga((n) => n + 1);
    }, atrasoPolling(polls.current));
    return () => clearTimeout(t);
  }, [processando, estado]);

  const podeEscrever =
    estado.tipo === "ok" &&
    (estado.l.capacidades.pode_enviar || estado.l.capacidades.pode_nova_versao);
  useEffect(() => {
    if (!podeEscrever || config !== null) return;
    const ctrl = new AbortController();
    obterConfiguracaoUpload(ctrl.signal)
      .then((c) => setConfig(c))
      .catch((e) => {
        if (!ctrl.signal.aborted && !ehAbort(e)) setConfig("erro");
      });
    return () => ctrl.abort();
  }, [podeEscrever, config]);

  const tentar = () => setTentativa((n) => n + 1);
  const recarregar = () => setRecarga((n) => n + 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <ContaOSMarca />
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-11">
              {idOk ? (
                <Link to="/competencias/$id" params={{ id: idC }}>
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para a competência
                </Link>
              ) : (
                <Link to="/contratos">
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos
                </Link>
              )}
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Titulo l={estado.tipo === "ok" ? estado.l : null} />
        {!idOk || estado.tipo === "nao_encontrada" ? (
          <Aviso
            icone={<SearchX className="h-4 w-4" aria-hidden />}
            mensagem={MENSAGENS_V115.naoEncontrada}
          />
        ) : estado.tipo === "carregando" ? (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V115.carregando}
          </p>
        ) : estado.tipo === "sem_permissao" ? (
          <Aviso
            icone={<ShieldAlert className="h-4 w-4" aria-hidden />}
            mensagem={MENSAGENS_V115.negado}
          />
        ) : estado.tipo === "erro" || estado.tipo === "erro_sessao" ? (
          <div
            role="alert"
            className="space-y-3 rounded-lg border border-destructive/40 bg-card p-4"
          >
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
              {estado.tipo === "erro" ? MENSAGENS_V115.erro : MENSAGENS_V115.erroSessao}
            </p>
            <Button variant="outline" className="h-11" onClick={tentar}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
            </Button>
          </div>
        ) : estado.tipo !== "ok" ? null : (
          <>
            <RequiredDocumentsSummary l={estado.l} off={offReqs} setOff={setOffReqs} />
            {estado.l.capacidades.pode_enviar ? (
              <UploadDropzone l={estado.l} config={config} onConcluido={recarregar} />
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" aria-hidden /> Envio: {MENSAGENS_V115.bloqueadoBackend}
              </p>
            )}
            <DocumentTable
              l={estado.l}
              off={offDocs}
              setOff={setOffDocs}
              config={config}
              onConcluido={recarregar}
            />
          </>
        )}
      </main>
    </div>
  );
}

function Titulo({ l }: { l: LeituraV115 | null }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Documentos da competência</h1>
      {l ? (
        <p className="text-sm text-muted-foreground">
          Competência {formatarCompetencia(l.competencia.competencia_referencia)}
        </p>
      ) : null}
    </div>
  );
}

function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm"
    >
      {icone} {mensagem}
    </p>
  );
}

function Paginador({
  rotulo,
  off,
  total,
  setOff,
}: {
  rotulo: string;
  off: number;
  total: number;
  setOff: (n: number) => void;
}) {
  if (total <= PAGINA_DOCS) return null;
  const pag = Math.floor(off / PAGINA_DOCS) + 1;
  const pags = Math.max(1, Math.ceil(total / PAGINA_DOCS));
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button
        variant="outline"
        className="h-11"
        aria-label={`Página anterior de ${rotulo}`}
        disabled={off === 0}
        onClick={() => setOff(Math.max(0, off - PAGINA_DOCS))}
      >
        Anterior
      </Button>
      <span aria-live="polite">
        Página {pag} de {pags}
      </span>
      <Button
        variant="outline"
        className="h-11"
        aria-label={`Próxima página de ${rotulo}`}
        disabled={off + PAGINA_DOCS >= total}
        onClick={() => setOff(off + PAGINA_DOCS)}
      >
        Próxima
      </Button>
    </div>
  );
}

function RequiredDocumentsSummary({
  l,
  off,
  setOff,
}: {
  l: LeituraV115;
  off: number;
  setOff: (n: number) => void;
}) {
  const e = l.estado_documental;
  const icone =
    e === "complete" ? (
      <CheckCircle2 className="h-5 w-5" aria-hidden />
    ) : e === "processing" ? (
      <Loader2 className="h-5 w-5" aria-hidden />
    ) : e === "error" ? (
      <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
    ) : (
      <ClipboardList className="h-5 w-5" aria-hidden />
    );
  return (
    <section
      data-testid="resumo-documental"
      data-estado={e}
      aria-labelledby="v115-resumo"
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      <h2 id="v115-resumo" className="text-sm font-medium text-muted-foreground">
        Requisitos documentais do snapshot
      </h2>
      <p role="status" aria-live="polite" className="flex items-center gap-2 text-lg font-semibold">
        {icone} {ROTULO_ESTADO_DOCUMENTAL[e]}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Num rotulo="Documentos" v={l.resumo.documentos_total} />
        <Num rotulo="Requisitos documentais" v={l.resumo.requisitos_documentais_total} />
        <Num rotulo="Aplicáveis" v={l.resumo.requisitos_documentais_aplicaveis} />
        <Num rotulo="Pendentes" v={l.resumo.requisitos_documentais_pendentes} />
      </dl>
      {l.requisitos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V115.semRequisitos}</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {l.requisitos.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{r.codigo ?? "—"}</span> {r.descricao ?? ""}
                {!r.aplicavel ? (
                  <span className="text-muted-foreground"> (não aplicável)</span>
                ) : null}
              </span>
              <span className="flex items-center gap-1 text-xs">
                {r.atendido ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Atendido
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden /> Pendente
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Paginador rotulo="requisitos" off={off} total={l.requisitos_total} setOff={setOff} />
    </section>
  );
}

function Num({ rotulo, v }: { rotulo: string; v: number }) {
  return (
    <div className="rounded-md border border-border p-2">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-base font-semibold">{v}</dd>
    </div>
  );
}

/** Hook de envio: chave idempotente estável por tentativa lógica; trava contra duplo clique. */
function useEnvio() {
  const [fase, setFase] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [msg, setMsg] = useState("");
  const [pct, setPct] = useState(0);
  const tent = useRef<(EstadoEnvio & { chave: string }) | null>(null);
  const trava = useRef(false);
  const reiniciar = useCallback(() => {
    tent.current = null;
    setFase("idle");
    setMsg("");
  }, []);
  const executar = async (
    org: string,
    contrato: string,
    f: File,
    registrar: (idArquivo: string, chave: string) => Promise<unknown>,
  ) => {
    if (trava.current) return false;
    trava.current = true;
    const p = (tent.current ??= { chave: crypto.randomUUID() });
    setFase("enviando");
    setMsg("");
    try {
      const idArq = await enviarArquivoCertificado(org, contrato, f, p, { onProgresso: setPct });
      await registrar(idArq, p.chave);
      tent.current = null;
      setFase("ok");
      setMsg(MENSAGENS_V110.sucesso);
      return true;
    } catch (e) {
      setFase("erro");
      setMsg(mensagemFalha(e));
      return false;
    } finally {
      trava.current = false;
    }
  };
  return { fase, msg, pct, executar, reiniciar, setMsg, setFase };
}

function MensagemEnvio({ fase, msg, pct }: { fase: string; msg: string; pct: number }) {
  return (
    <div aria-live="polite" className="text-sm">
      {fase === "enviando" ? (
        <p role="status" className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enviando… {pct}%
        </p>
      ) : msg ? (
        <p role={fase === "erro" ? "alert" : "status"}>{msg}</p>
      ) : null}
    </div>
  );
}

const CAMPO =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function UploadDropzone({
  l,
  config,
  onConcluido,
}: {
  l: LeituraV115;
  config: ConfigUpload | null | "erro";
  onConcluido: () => void;
}) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [invalido, setInvalido] = useState<string | null>(null);
  const [idReq, setIdReq] = useState("");
  const [tipo, setTipo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const env = useEnvio();
  const req = l.requisitos.find((r) => r.id === idReq) ?? null;
  const tipos = tiposParaRequisito(req);
  const reiniciarEnvio = env.reiniciar;

  useEffect(() => {
    if (idReq && !l.requisitos.some((r) => r.id === idReq)) {
      setIdReq("");
      setTipo("");
      reiniciarEnvio();
    }
  }, [l.requisitos, idReq, reiniciarEnvio]);

  const mudou = () => env.reiniciar();
  const escolher = (f: File | null) => {
    mudou();
    setArquivo(f);
    setInvalido(f && config && config !== "erro" ? validarArquivo(f, config) : null);
    if (f) setTitulo(tituloDeArquivo(f.name));
  };

  const enviar = async () => {
    if (!arquivo || invalido || !config || config === "erro") return;
    if (!tipo) {
      env.setFase("erro");
      env.setMsg(MENSAGENS_V115.semTipo);
      return;
    }
    if (!titulo.trim()) {
      env.setFase("erro");
      env.setMsg(MENSAGENS_V110.semTitulo);
      return;
    }
    const ok = await env.executar(
      l.competencia.id_organizacao,
      l.competencia.id_contrato,
      arquivo,
      (idArquivo, chave) =>
        criarDocumentoCompetencia({
          idCompetencia: l.competencia.id,
          tipo,
          titulo,
          categoria,
          idRequisito: req ? req.id : null,
          idArquivo,
          chave,
        }),
    );
    if (ok) onConcluido();
  };

  return (
    <section
      aria-labelledby="v115-envio"
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      <h2 id="v115-envio" className="text-sm font-medium text-muted-foreground">
        Enviar documento
      </h2>
      {config === "erro" ? (
        <p role="alert" className="text-sm">
          {MENSAGENS_V110.configIndisponivel}
        </p>
      ) : null}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          escolher(e.dataTransfer.files[0] ?? null);
        }}
        className={`rounded-md border-2 border-dashed p-4 ${arrastando ? "border-primary bg-muted" : "border-border"}`}
      >
        <label htmlFor="v115-arquivo" className="flex items-center gap-2 text-sm font-medium">
          <FileUp className="h-4 w-4" aria-hidden /> Arquivo
        </label>
        <input
          id="v115-arquivo"
          type="file"
          className="mt-2 block w-full text-sm"
          accept={config && config !== "erro" ? aceiteDe(config) : undefined}
          disabled={!config || config === "erro"}
          onChange={(e) => escolher(e.target.files?.[0] ?? null)}
        />
        {config && config !== "erro" && config.maximo !== null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Limite: {formatarBytes(config.maximo)}
          </p>
        ) : null}
        {invalido ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {invalido}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="v115-req" className="text-sm font-medium">
            Requisito documental (opcional)
          </label>
          <select
            id="v115-req"
            className={CAMPO}
            value={idReq}
            onChange={(e) => {
              mudou();
              setIdReq(e.target.value);
              setTipo("");
            }}
          >
            <option value="">Sem vínculo a requisito</option>
            {l.requisitos.map((r) => (
              <option key={r.id} value={r.id}>
                {[r.codigo, r.descricao].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="v115-tipo" className="text-sm font-medium">
            Tipo do documento
          </label>
          <select
            id="v115-tipo"
            className={CAMPO}
            value={tipo}
            onChange={(e) => {
              mudou();
              setTipo(e.target.value);
            }}
          >
            <option value="">Selecione</option>
            {tipos.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="v115-titulo" className="text-sm font-medium">
            Título
          </label>
          <input
            id="v115-titulo"
            className={CAMPO}
            value={titulo}
            onChange={(e) => {
              mudou();
              setTitulo(e.target.value);
            }}
          />
        </div>
        <div>
          <label htmlFor="v115-cat" className="text-sm font-medium">
            Categoria (opcional)
          </label>
          <input
            id="v115-cat"
            className={CAMPO}
            value={categoria}
            onChange={(e) => {
              mudou();
              setCategoria(e.target.value);
            }}
          />
        </div>
      </div>
      <Button
        className="h-11"
        disabled={!arquivo || !!invalido || env.fase === "enviando" || !config || config === "erro"}
        onClick={() => void enviar()}
      >
        Enviar
      </Button>
      <MensagemEnvio fase={env.fase} msg={env.msg} pct={env.pct} />
    </section>
  );
}

function ProcessingStatus({ d }: { d: DocV115 }) {
  const seg = d.arquivo?.status_seguranca;
  const proc = d.processamento?.status;
  return (
    <span aria-live="polite" className="flex flex-col gap-1 text-xs">
      <span>Segurança: {seg ? (ROTULO_SEGURANCA[seg] ?? seg) : "—"}</span>
      <span>Processamento: {proc ? (ROTULO_PROCESSAMENTO[proc] ?? proc) : "—"}</span>
    </span>
  );
}

function DocumentTable({
  l,
  off,
  setOff,
  config,
  onConcluido,
}: {
  l: LeituraV115;
  off: number;
  setOff: (n: number) => void;
  config: ConfigUpload | null | "erro";
  onConcluido: () => void;
}) {
  const [versaoDe, setVersaoDe] = useState<DocV115 | null>(null);
  const [erroDl, setErroDl] = useState("");
  const abrir = async (d: DocV115) => {
    setErroDl("");
    const idArq = d.versao?.id_arquivo ?? d.arquivo?.id;
    if (!idArq) return;
    try {
      await baixarDocumento(idArq);
    } catch (e) {
      setErroDl(
        e instanceof ErroDoc && e.tipo === "negado"
          ? MENSAGENS_V110.downloadNegado
          : MENSAGENS_V110.downloadErro,
      );
    }
  };
  return (
    <section
      aria-labelledby="v115-docs"
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      <h2 id="v115-docs" className="text-sm font-medium text-muted-foreground">
        Documentos vinculados
      </h2>
      {erroDl ? (
        <p role="alert" className="text-sm">
          {erroDl}
        </p>
      ) : null}
      {l.documentos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V115.vazio}</p>
      ) : (
        <div className="overflow-x-auto" tabIndex={0} aria-label="Tabela de documentos (rolável)">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="p-2">
                  Tipo
                </th>
                <th scope="col" className="p-2">
                  Título
                </th>
                <th scope="col" className="p-2">
                  Requisito
                </th>
                <th scope="col" className="p-2">
                  Versão
                </th>
                <th scope="col" className="p-2">
                  Arquivo
                </th>
                <th scope="col" className="p-2">
                  Status
                </th>
                <th scope="col" className="p-2">
                  Hash
                </th>
                <th scope="col" className="p-2">
                  Atualizado
                </th>
                <th scope="col" className="p-2">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {l.documentos.map((d) => {
                const seg = d.arquivo?.status_seguranca;
                const travado = seg === "quarentena" || seg === "bloqueado";
                const pendente = seg === "pendente";
                return (
                  <tr key={d.id}>
                    <td className="p-2">{ROTULO_TIPO[d.tipo] ?? d.tipo}</td>
                    <td className="p-2 font-medium">{d.titulo || "—"}</td>
                    <td className="p-2">{d.requisito?.codigo ?? "—"}</td>
                    <td className="p-2">{d.versao?.numero_versao ?? d.versao_atual ?? "—"}</td>
                    <td className="p-2">
                      {d.arquivo?.nome_original ?? "—"}
                      {d.arquivo?.tamanho !== null && d.arquivo?.tamanho !== undefined ? (
                        <span className="block text-xs text-muted-foreground">
                          {formatarBytes(d.arquivo.tamanho)}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-2">
                      <ProcessingStatus d={d} />
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {(d.versao?.hash ?? d.arquivo?.sha256)
                        ? hashCurto(d.versao?.hash ?? d.arquivo?.sha256)
                        : "—"}
                    </td>
                    <td className="p-2">
                      {d.atualizado_em ? formatarDataHoraBr(d.atualizado_em) : "—"}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="h-11"
                          aria-label={`Abrir ${d.titulo}`}
                          disabled={travado || pendente}
                          title={
                            travado
                              ? MENSAGENS_V110.bloqueadoSeguranca
                              : pendente
                                ? MENSAGENS_V110.verificacaoPendente
                                : undefined
                          }
                          onClick={() => void abrir(d)}
                        >
                          Abrir
                        </Button>
                        {l.capacidades.pode_nova_versao ? (
                          <Button
                            variant="outline"
                            className="h-11"
                            aria-label={`Nova versão de ${d.titulo}`}
                            onClick={() => setVersaoDe(d)}
                          >
                            Nova versão
                          </Button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" aria-hidden /> Nova versão:{" "}
                            {MENSAGENS_V115.bloqueadoBackend}
                          </span>
                        )}
                      </div>
                      {travado ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {MENSAGENS_V110.bloqueadoSeguranca}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Paginador rotulo="documentos" off={off} total={l.documentos_total} setOff={setOff} />
      <Dialog
        open={!!versaoDe && l.capacidades.pode_nova_versao}
        onOpenChange={(aberto) => {
          if (!aberto) setVersaoDe(null);
        }}
      >
        {versaoDe && l.capacidades.pode_nova_versao ? (
          <NovaVersao
            key={versaoDe.id}
            l={l}
            d={versaoDe}
            config={config}
            onFechar={() => setVersaoDe(null)}
            onConcluido={onConcluido}
          />
        ) : null}
      </Dialog>
    </section>
  );
}

function NovaVersao({
  l,
  d,
  config,
  onFechar,
  onConcluido,
}: {
  l: LeituraV115;
  d: DocV115;
  config: ConfigUpload | null | "erro";
  onFechar: () => void;
  onConcluido: () => void;
}) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [invalido, setInvalido] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const env = useEnvio();
  const obrigatorio = l.capacidades.motivo_nova_versao_obrigatorio;
  const enviar = async () => {
    if (!arquivo || invalido || !config || config === "erro") return;
    if (obrigatorio && !motivo.trim()) {
      env.setFase("erro");
      env.setMsg(MENSAGENS_V110.motivoObrigatorio);
      return;
    }
    const ok = await env.executar(
      l.competencia.id_organizacao,
      l.competencia.id_contrato,
      arquivo,
      (idArquivo, chave) =>
        adicionarVersaoCompetencia({ idDocumento: d.id, idArquivo, motivo, chave }),
    );
    if (ok) onConcluido();
  };
  return (
    <DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova versão — {d.titulo}</DialogTitle>
        <DialogDescription>
          As versões anteriores são preservadas no histórico; nada é sobrescrito.
        </DialogDescription>
      </DialogHeader>
      <div>
        <label htmlFor="v115-nv-arquivo" className="text-sm font-medium">
          Arquivo da nova versão
        </label>
        <input
          id="v115-nv-arquivo"
          type="file"
          className="mt-1 block w-full text-sm"
          accept={config && config !== "erro" ? aceiteDe(config) : undefined}
          disabled={!config || config === "erro"}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            env.reiniciar();
            setArquivo(f);
            setInvalido(f && config && config !== "erro" ? validarArquivo(f, config) : null);
          }}
        />
        {invalido ? (
          <p role="alert" className="mt-1 text-sm text-destructive">
            {invalido}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="v115-nv-motivo" className="text-sm font-medium">
          Motivo da nova versão{obrigatorio ? " (obrigatório)" : " (opcional)"}
        </label>
        <textarea
          id="v115-nv-motivo"
          className="min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-required={obrigatorio}
          value={motivo}
          onChange={(e) => {
            env.reiniciar();
            setMotivo(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className="h-11"
          disabled={!arquivo || !!invalido || env.fase === "enviando"}
          onClick={() => void enviar()}
        >
          Enviar nova versão
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={onFechar}
          disabled={env.fase === "enviando"}
        >
          Cancelar
        </Button>
      </div>
      <MensagemEnvio fase={env.fase} msg={env.msg} pct={env.pct} />
    </DialogContent>
  );
}

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bot,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock,
  Download,
  Info,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroDetalhe,
  formatarDataBr,
  obterContrato,
  uuidCanonico,
  uuidValido,
} from "@/lib/contratos/contratoDetalheDados";
import { formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  ErroDoc,
  ROTULO_PROCESSAMENTO,
  ROTULO_SEGURANCA,
  ROTULO_SITUACAO_DOC,
  ROTULO_TIPO,
  atrasoPolling,
  baixarDocumento,
  formatarBytes,
  hashCurto,
  type Documento,
} from "@/lib/contratos/documentosDados";
import {
  ErroRevisao,
  MENSAGENS_V111,
  PAGINA_FRAGMENTOS,
  PAGINA_PAGINAS,
  PAGINA_PROCESSAMENTOS,
  PAGINA_SUGESTOES,
  PAGINA_VERSOES,
  ROTULO_ORIGEM,
  ROTULO_STATUS_SUGESTAO,
  ROTULO_TIPO_SUGESTAO,
  bloqueioAprovacao,
  definirVigenciaSugestao,
  ehMaterial,
  emProcessamento,
  hashDiverge,
  listarFragmentos,
  listarPaginas,
  listarProcessamentos,
  listarSugestoes,
  listarVersoes,
  mensagemErroRevisao,
  obterDocumento,
  obterPerfilVinculo,
  podeRevisar,
  revisarSugestao,
  rotuloMetadado,
  rotuloUsuario,
  type ArquivoDetalhe,
  type BuscaCentral,
  type FiltrosSugestao,
  type Sugestao,
  type VersaoDetalhe,
} from "@/lib/contratos/documentoDetalheDados";

export { MENSAGENS_V111 };

type Ctx = { idUsuario: string; idOrganizacao: string };
const CAMPO =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const ROTULO = "text-sm font-medium";
const SECAO = "space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6";
const LIMITE_TEXTO_PAGINA = 1500;

export function DocumentoDetalhe({
  id,
  idDocumento,
  retorno,
}: {
  id: string;
  idDocumento: string;
  retorno: BuscaCentral;
}) {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setErroSessao(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" ||
            (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user))
          return void navigate({ to: "/login", replace: true });
        if (error || !data.user) return void setErroSessao(true);
        const pref = obterPreferenciaOrganizacao(data.user.id);
        if (!pref) return void navigate({ to: "/selecionar-organizacao", replace: true });
        setCtx({ idUsuario: data.user.id, idOrganizacao: pref });
      })
      .catch(() => {
        if (ativo) setErroSessao(true);
      });
    return () => {
      ativo = false;
    };
  }, [navigate, tentativa]);

  const idOk = uuidValido(id) && uuidValido(idDocumento);
  const idC = idOk ? uuidCanonico(id) : id;
  const idD = idOk ? uuidCanonico(idDocumento) : idDocumento;
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <nav aria-label="Navegação da página" className="border-b border-border bg-card text-card-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            
            <nav aria-label="Navegação" className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="h-11">
                <Link to="/contratos" activeOptions={{ exact: true }}>
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos
                </Link>
              </Button>
              
            </nav>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {erroSessao ? (
            <>
              <Titulo />
              <Alerta
                mensagem={MENSAGENS_V111.erroSessao}
                onRetry={() => setTentativa((n) => n + 1)}
              />
            </>
          ) : !ctx ? (
            <>
              <Titulo />
              <Carregando texto={MENSAGENS_V111.verificando} />
            </>
          ) : !idOk ? (
            <>
              <Titulo />
              <Aviso
                icone={
                  <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                }
                mensagem={MENSAGENS_V111.docNaoEncontrado}
              />
            </>
          ) : (
            <GateContrato
              key={`${ctx.idUsuario}:${ctx.idOrganizacao}:${idC}:${idD}`}
              id={idC}
              idDocumento={idD}
              ctx={ctx}
              retorno={retorno}
            />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Titulo({ numero, titulo }: { numero?: string | undefined; titulo?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {numero ? `Contrato ${numero} — Documento` : "Gestão contratual"}
      </p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        {titulo ?? "Detalhe do documento"}
      </h1>
    </div>
  );
}
function Carregando({ texto: t }: { texto: string }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t}
    </p>
  );
}
function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-sm">
        {icone}
        {mensagem}
      </p>
      <Button asChild variant="outline" className="h-11">
        <Link to="/contratos">Voltar para contratos</Link>
      </Button>
    </div>
  );
}
function Alerta({ mensagem, onRetry }: { mensagem: string; onRetry?: (() => void) | undefined }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        {mensagem}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      )}
    </div>
  );
}
/** Dica acessível: hover/foco no desktop, toque abre popover no mobile. */
function Dica({ rotulo: r, children }: { rotulo: string; children: ReactNode }) {
  const cls =
    "inline-flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <>
      <span className="hidden sm:inline">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={r} className={`${cls} h-6 w-6`}>
              <Info className="h-4 w-4" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs break-all">{children}</TooltipContent>
        </Tooltip>
      </span>
      <span className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={r} className={`${cls} h-11 w-11`}>
              <Info className="h-4 w-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs break-all text-sm">{children}</PopoverContent>
        </Popover>
      </span>
    </>
  );
}
function Selo({ children, classe = "" }: { children: ReactNode; classe?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${classe || "border-border bg-muted"}`}
    >
      {children}
    </span>
  );
}
function Paginacao({
  rotulo,
  pagina,
  total,
  tamanho,
  onMudar,
}: {
  rotulo: string;
  pagina: number;
  total: number;
  tamanho: number;
  onMudar: (p: number) => void;
}) {
  const paginas = Math.max(1, Math.ceil(total / tamanho));
  if (paginas <= 1) return null;
  return (
    <nav
      aria-label={`Paginação de ${rotulo}`}
      className="flex flex-wrap items-center justify-between gap-2"
    >
      <p className="text-sm text-muted-foreground">{`Página ${pagina + 1} de ${paginas}`}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={pagina === 0}
          onClick={() => onMudar(pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={pagina + 1 >= paginas}
          onClick={() => onMudar(pagina + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}
function Vazio({ texto: t }: { texto: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4 text-center">
      <p className="text-sm text-muted-foreground">{t}</p>
    </div>
  );
}

function GateContrato({
  id,
  idDocumento,
  ctx,
  retorno,
}: {
  id: string;
  idDocumento: string;
  ctx: Ctx;
  retorno: BuscaCentral;
}) {
  const contrato = useQuery({
    queryKey: ["contratos", "detalhe", ctx.idUsuario, ctx.idOrganizacao, id],
    queryFn: ({ signal }) => obterContrato(id, signal),
    retry: false,
  });
  const c = contrato.data;
  const pronto = !!c && uuidCanonico(c.id) === id;
  const documento = useQuery({
    queryKey: ["v111", "documento", ctx.idUsuario, ctx.idOrganizacao, id, idDocumento],
    queryFn: ({ signal }) => obterDocumento(id, idDocumento, signal),
    enabled: pronto,
    retry: false,
  });
  if (contrato.isError) {
    const tipo = contrato.error instanceof ErroDetalhe ? contrato.error.tipo : "erro";
    return (
      <>
        <Titulo />
        {tipo === "negado" ? (
          <Aviso
            icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
            mensagem={MENSAGENS_V111.negado}
          />
        ) : tipo === "nao_encontrado" ? (
          <Aviso
            icone={
              <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            mensagem={MENSAGENS_V111.naoEncontrado}
          />
        ) : (
          <Alerta
            mensagem={tipo === "consistencia" ? MENSAGENS_V111.consistencia : MENSAGENS_V111.erro}
            onRetry={() => void contrato.refetch()}
          />
        )}
      </>
    );
  }
  if (!pronto || !c)
    return (
      <>
        <Titulo />
        <Carregando texto={MENSAGENS_V111.carregando} />
      </>
    );
  const voltar = (
    <Button asChild variant="outline" className="h-11">
      <Link to="/contratos/$id/documentos" params={{ id: c.id }} search={retorno}>
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para Documentos
      </Link>
    </Button>
  );
  if (documento.isError) {
    const t = documento.error instanceof ErroDoc ? documento.error.tipo : "erro";
    return (
      <>
        <Titulo numero={c.numero ?? undefined} />
        {voltar}
        {t === "nao_encontrado" || t === "negado" ? (
          <p role="alert" className="flex items-start gap-2 text-sm">
            <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {MENSAGENS_V111.docNaoEncontrado}
          </p>
        ) : (
          <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void documento.refetch()} />
        )}
      </>
    );
  }
  const d = documento.data;
  if (!d)
    return (
      <>
        <Titulo numero={c.numero ?? undefined} />
        <Carregando texto={MENSAGENS_V111.carregando} />
      </>
    );
  return (
    <>
      <nav aria-label="Trilha" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/contratos" className="underline-offset-4 hover:underline">
              Contratos
            </Link>
            <span aria-hidden> / </span>
          </li>
          <li>
            <Link
              to="/contratos/$id"
              params={{ id: c.id }}
              className="underline-offset-4 hover:underline"
            >
              {`Contrato ${c.numero ?? ""}`.trim()}
            </Link>
            <span aria-hidden> / </span>
          </li>
          <li>
            <Link
              to="/contratos/$id/documentos"
              params={{ id: c.id }}
              search={retorno}
              className="underline-offset-4 hover:underline"
            >
              Documentos
            </Link>
            <span aria-hidden> / </span>
          </li>
          <li aria-current="page" className="break-words text-foreground">
            {d.titulo}
          </li>
        </ol>
      </nav>
      <Titulo numero={c.numero ?? undefined} titulo={d.titulo} />
      {voltar}
      <Detalhe doc={d} ctx={ctx} />
    </>
  );
}

function vigenciaTexto(i: string | null, f: string | null) {
  if (i && f) return `${formatarDataBr(i)} a ${formatarDataBr(f)}`;
  if (i) return `A partir de ${formatarDataBr(i)}`;
  return "Sem vigência informada";
}

function StatusSeguranca({ s }: { s: string | undefined }) {
  if (!s) return <Selo>Arquivo não disponível</Selo>;
  const icone =
    s === "aprovado" ? (
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
    ) : s === "pendente" ? (
      <Clock className="h-3.5 w-3.5" aria-hidden />
    ) : s === "quarentena" ? (
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <Ban className="h-3.5 w-3.5" aria-hidden />
    );
  const classe =
    s === "aprovado"
      ? "border-primary bg-primary/10"
      : s === "pendente"
        ? "border-dashed border-muted-foreground bg-background"
        : "border-destructive/60 bg-destructive/5";
  return (
    <Selo classe={classe}>
      {icone}
      <span>{ROTULO_SEGURANCA[s] ?? s}</span>
    </Selo>
  );
}
function StatusProcessamento({ s }: { s: string | undefined }) {
  if (!s) return <Selo>Sem processamento</Selo>;
  const icone =
    s === "concluido" ? (
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
    ) : s === "processando" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
    ) : s === "pendente" ? (
      <CircleDashed className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <XCircle className="h-3.5 w-3.5" aria-hidden />
    );
  return (
    <Selo classe={s === "falhou" ? "border-destructive/60 bg-destructive/5" : ""}>
      {icone}
      <span>{ROTULO_PROCESSAMENTO[s] ?? s}</span>
    </Selo>
  );
}

// ---------- Detalhe ----------
type Selecao = { v: VersaoDetalhe; a: ArquivoDetalhe | undefined };
function Detalhe({ doc, ctx }: { doc: Documento; ctx: Ctx }) {
  const [pagina, setPagina] = useState(0);
  const [sel, setSel] = useState<Selecao | null>(null);
  const [aviso, setAviso] = useState("");
  const chave = [ctx.idUsuario, ctx.idOrganizacao, doc.id];
  const perfil = useQuery({
    queryKey: ["v111", "perfil", ctx.idUsuario, ctx.idOrganizacao],
    queryFn: ({ signal }) => obterPerfilVinculo(ctx.idUsuario, ctx.idOrganizacao, signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  // Falha fechada: carregando, erro ou sem vínculo ⇒ somente leitura.
  const revisor = perfil.isSuccess && podeRevisar(perfil.data);
  const versoes = useQuery({
    queryKey: ["v111", "versoes", ...chave, pagina],
    queryFn: ({ signal }) => listarVersoes(doc.id, pagina, signal),
    retry: false,
  });
  const itens = versoes.data?.itens ?? [];
  const arquivos = versoes.data?.arquivos ?? {};
  const padrao = itens.find((v) => v.numero_versao === doc.versao_atual) ?? itens[0];
  const atual: Selecao | null = sel
    ? { v: itens.find((v) => v.id === sel.v.id) ?? sel.v, a: arquivos[sel.v.id_arquivo] ?? sel.a }
    : padrao
      ? { v: padrao, a: arquivos[padrao.id_arquivo] }
      : null;

  return (
    <>
      <p aria-live="polite" className="text-sm">
        {aviso}
      </p>
      <section aria-labelledby="v111-resumo" className={SECAO}>
        <h2 id="v111-resumo" className="text-lg font-semibold">
          Resumo do documento
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Campo rotulo="Tipo">{ROTULO_TIPO[doc.tipo] ?? doc.tipo}</Campo>
          <Campo rotulo="Categoria informada">{doc.categoria ?? "—"}</Campo>
          <Campo rotulo="Situação">{ROTULO_SITUACAO_DOC[doc.situacao] ?? doc.situacao}</Campo>
          <Campo rotulo="Vigência">{vigenciaTexto(doc.vigencia_inicio, doc.vigencia_fim)}</Campo>
          <Campo rotulo="Versão atual">{`Versão ${doc.versao_atual}`}</Campo>
          <Campo rotulo="Observações">{doc.observacoes ?? "—"}</Campo>
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-label="Histórico de versões" className={SECAO}>
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-semibold">Histórico de versões</h2>
            <Dica rotulo="Sobre o histórico de versões">
              Versões são imutáveis: uma correção gera nova versão e as anteriores são preservadas.
            </Dica>
          </div>
          {versoes.isPending ? (
            <Carregando texto="Carregando versões…" />
          ) : versoes.isError ? (
            <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void versoes.refetch()} />
          ) : itens.length === 0 ? (
            <Vazio texto={MENSAGENS_V111.semVersoes} />
          ) : (
            <>
              <ul className="space-y-2">
                {itens.map((v) => {
                  const ativa = atual?.v.id === v.id;
                  return (
                    <li key={v.id} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{`Versão ${v.numero_versao}`}</span>
                        {v.numero_versao === doc.versao_atual && (
                          <Selo classe="border-primary bg-primary/10">
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Versão atual
                          </Selo>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {`Enviada em ${formatarDataHoraBr(v.criado_em)}`}
                      </p>
                      <p className="break-words text-sm">
                        {`Motivo: ${v.motivo_substituicao ?? "—"}`}
                      </p>
                      <Button
                        type="button"
                        variant={ativa ? "secondary" : "outline"}
                        className="mt-2 h-11"
                        aria-pressed={ativa}
                        onClick={() => setSel({ v, a: arquivos[v.id_arquivo] })}
                      >
                        {ativa
                          ? `Versão ${v.numero_versao} selecionada`
                          : `Selecionar versão ${v.numero_versao}`}
                      </Button>
                    </li>
                  );
                })}
              </ul>
              <Paginacao
                rotulo="versões"
                pagina={pagina}
                total={versoes.data?.total ?? 0}
                tamanho={PAGINA_VERSOES}
                onMudar={setPagina}
              />
            </>
          )}
        </section>

        <div className="min-w-0 space-y-6">
          {atual && (
            <>
              <Cadeia sel={atual} ctx={ctx} />
              <Processamento key={`p-${atual.v.id}`} idVersao={atual.v.id} ctx={ctx} />
              <Metadados valor={atual.v.metadados_extraidos} />
            </>
          )}
        </div>
      </div>
      {atual && (
        <>
          <Paginas key={`pg-${atual.v.id}`} idVersao={atual.v.id} ctx={ctx} />
          <Fragmentos key={`f-${atual.v.id}`} idVersao={atual.v.id} ctx={ctx} />
          <Sugestoes
            key={`s-${atual.v.id}`}
            idVersao={atual.v.id}
            ctx={ctx}
            revisor={revisor}
            onAviso={setAviso}
          />
        </>
      )}
    </>
  );
}

function Campo({ rotulo: r, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{r}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

function Cadeia({ sel, ctx }: { sel: Selecao; ctx: Ctx }) {
  const { v, a } = sel;
  const [baixando, setBaixando] = useState(false);
  const [erroDl, setErroDl] = useState("");
  const status = a?.status_seguranca;
  const baixar = async () => {
    if (!a || baixando) return;
    setBaixando(true);
    setErroDl("");
    try {
      await baixarDocumento(a.id);
    } catch (e) {
      setErroDl(
        e instanceof ErroDoc && e.tipo === "negado"
          ? MENSAGENS_V111.downloadNegado
          : MENSAGENS_V111.downloadErro,
      );
    } finally {
      setBaixando(false);
    }
  };
  const quem = rotuloUsuario(v.enviado_por, ctx.idUsuario);
  return (
    <section aria-label="Cadeia de evidência" className={SECAO}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold">{`Cadeia de evidência — versão ${v.numero_versao}`}</h2>
          <Dica rotulo="Sobre a cadeia de evidência">
            Registro de quem enviou, quando, de onde e com qual hash. Os dados vêm do backend e não
            podem ser alterados nesta tela.
          </Dica>
        </div>
        {status === "aprovado" && a && (
          <Button
            type="button"
            variant="outline"
            className="h-11"
            aria-label={`Baixar ${a.nome_original}`}
            disabled={baixando}
            onClick={() => void baixar()}
          >
            {baixando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="mr-2 h-4 w-4" aria-hidden />
            )}
            Baixar
          </Button>
        )}
      </div>
      {hashDiverge(v.hash, a?.sha256) && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          {MENSAGENS_V111.hashDivergente}
        </p>
      )}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Campo rotulo="Arquivo">
          <span className="break-all">{a?.nome_original ?? "—"}</span>
        </Campo>
        <Campo rotulo="Tipo de arquivo (MIME)">{a?.mime ?? "—"}</Campo>
        <Campo rotulo="Tamanho">{a ? formatarBytes(a.tamanho) : "—"}</Campo>
        <Campo rotulo="Origem">{a?.origem ? (ROTULO_ORIGEM[a.origem] ?? a.origem) : "—"}</Campo>
        <Campo rotulo="Enviada em">{formatarDataHoraBr(v.criado_em)}</Campo>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Enviada por</dt>
          <dd className="flex items-center gap-1">
            <span>{quem}</span>
            {v.enviado_por && quem !== "Você" && (
              <Dica rotulo="Identificador completo do usuário">{v.enviado_por}</Dica>
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            Hash da versão
            {v.hash && <Dica rotulo="Hash completo da versão">{v.hash}</Dica>}
          </dt>
          <dd className="font-mono text-xs">{hashCurto(v.hash)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            SHA-256 do arquivo
            {a?.sha256 && <Dica rotulo="SHA-256 completo do arquivo">{a.sha256}</Dica>}
          </dt>
          <dd className="font-mono text-xs">{hashCurto(a?.sha256)}</dd>
        </div>
        <Campo rotulo="Motivo da substituição">{v.motivo_substituicao ?? "—"}</Campo>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <StatusSeguranca s={status} />
      </div>
      {(status === "quarentena" || status === "bloqueado") && (
        <p role="note" className="flex items-start gap-2 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          {MENSAGENS_V111.bloqueadoSeguranca}
        </p>
      )}
      {status === "pendente" && (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V111.verificacaoPendente}</p>
      )}
      {erroDl && (
        <p role="alert" className="text-sm text-destructive">
          {erroDl}
        </p>
      )}
    </section>
  );
}

function Processamento({ idVersao, ctx }: { idVersao: string; ctx: Ctx }) {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(0);
  const ciclos = useRef(0);
  const chave = ["v111", "processamentos", ctx.idUsuario, ctx.idOrganizacao, idVersao];
  const q = useQuery({
    queryKey: [...chave, pagina],
    queryFn: ({ signal }) => listarProcessamentos(idVersao, pagina, signal),
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: (s) => {
      if (!emProcessamento(s.state.data?.itens[0]?.status)) {
        ciclos.current = 0;
        return false;
      }
      return atrasoPolling(ciclos.current++);
    },
  });
  const itens = q.data?.itens ?? [];
  return (
    <section aria-label="Processamento" className={SECAO}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold">Processamento</h2>
          <Dica rotulo="Sobre o processamento">
            Extração de páginas e metadados em segundo plano. A tela se atualiza sozinha, em
            intervalos crescentes, apenas enquanto houver processamento em andamento.
          </Dica>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => {
            ciclos.current = 0;
            void qc.invalidateQueries({ queryKey: chave });
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar processamento
        </Button>
      </div>
      {q.isPending ? (
        <Carregando texto="Carregando processamento…" />
      ) : q.isError ? (
        <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void q.refetch()} />
      ) : itens.length === 0 ? (
        <Vazio texto={MENSAGENS_V111.semProcessamento} />
      ) : (
        <>
          <ul className="space-y-2">
            {itens.map((p) => (
              <li key={p.id} className="space-y-1 rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusProcessamento s={p.status} />
                  <span className="text-muted-foreground">{`Etapa: ${p.etapa}`}</span>
                  <span className="text-muted-foreground">{`Tentativas: ${p.tentativas}`}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {`Registrado em ${formatarDataHoraBr(p.criado_em)}`}
                  {p.iniciado_em ? ` · Iniciado em ${formatarDataHoraBr(p.iniciado_em)}` : ""}
                  {p.concluido_em ? ` · Concluído em ${formatarDataHoraBr(p.concluido_em)}` : ""}
                </p>
                {(p.status === "falhou" || p.erro_codigo) && (
                  <p className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    {MENSAGENS_V111.erroProcessamento}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <Paginacao
            rotulo="processamentos"
            pagina={pagina}
            total={q.data?.total ?? 0}
            tamanho={PAGINA_PROCESSAMENTOS}
            onMudar={setPagina}
          />
        </>
      )}
    </section>
  );
}

function ValorMetadado({ valor }: { valor: unknown }): ReactNode {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  if (typeof valor === "string" || typeof valor === "number") return String(valor);
  if (Array.isArray(valor))
    return (
      <ul className="list-disc space-y-1 pl-5">
        {valor.map((x, i) => (
          <li key={i}>
            <ValorMetadado valor={x} />
          </li>
        ))}
      </ul>
    );
  if (typeof valor === "object")
    return (
      <dl className="mt-1 grid gap-2 border-l border-border pl-3">
        {Object.entries(valor as Record<string, unknown>).map(([k, x]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{rotuloMetadado(k)}</dt>
            <dd className="break-words">
              <ValorMetadado valor={x} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return "—";
}
function Metadados({ valor }: { valor: unknown }) {
  const vazio =
    valor === null ||
    valor === undefined ||
    typeof valor !== "object" ||
    (Array.isArray(valor) ? valor.length === 0 : Object.keys(valor as object).length === 0);
  return (
    <section aria-label="Metadados extraídos" className={SECAO}>
      <div className="flex items-center gap-1">
        <h2 className="text-lg font-semibold">Metadados extraídos</h2>
        <Dica rotulo="Sobre os metadados extraídos">
          Campos extraídos do arquivo ou aplicados após revisão humana. Valores ausentes não são
          preenchidos automaticamente.
        </Dica>
      </div>
      {vazio ? (
        <Vazio texto={MENSAGENS_V111.semMetadados} />
      ) : (
        <div className="text-sm">
          <ValorMetadado valor={valor} />
        </div>
      )}
    </section>
  );
}

function TextoLongo({ texto: t }: { texto: string | null }) {
  const [aberto, setAberto] = useState(false);
  if (!t) return <p className="text-sm text-muted-foreground">Sem texto extraído.</p>;
  const longo = t.length > LIMITE_TEXTO_PAGINA;
  return (
    <div className="space-y-2">
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/40 p-3 font-sans text-sm">
        {longo && !aberto ? `${t.slice(0, LIMITE_TEXTO_PAGINA)}…` : t}
      </pre>
      {longo && (
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          aria-expanded={aberto}
          onClick={() => setAberto((x) => !x)}
        >
          {aberto ? "Mostrar menos" : "Mostrar mais"}
        </Button>
      )}
    </div>
  );
}

function Paginas({ idVersao, ctx }: { idVersao: string; ctx: Ctx }) {
  const [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ["v111", "paginas", ctx.idUsuario, ctx.idOrganizacao, idVersao, pagina],
    queryFn: ({ signal }) => listarPaginas(idVersao, pagina, signal),
    retry: false,
  });
  const itens = q.data?.itens ?? [];
  return (
    <section aria-label="Páginas extraídas" className={SECAO}>
      <h2 className="text-lg font-semibold">Páginas extraídas</h2>
      {q.isPending ? (
        <Carregando texto="Carregando páginas…" />
      ) : q.isError ? (
        <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void q.refetch()} />
      ) : itens.length === 0 ? (
        <Vazio texto={MENSAGENS_V111.semPaginas} />
      ) : (
        <>
          <ul className="space-y-3">
            {itens.map((p) => (
              <li key={p.id} className="space-y-2 rounded-lg border border-border p-3">
                <h3 className="text-sm font-semibold">{`Página ${p.numero_pagina}`}</h3>
                <TextoLongo texto={p.texto_extraido} />
              </li>
            ))}
          </ul>
          <Paginacao
            rotulo="páginas"
            pagina={pagina}
            total={q.data?.total ?? 0}
            tamanho={PAGINA_PAGINAS}
            onMudar={setPagina}
          />
        </>
      )}
    </section>
  );
}

function Fragmentos({ idVersao, ctx }: { idVersao: string; ctx: Ctx }) {
  const [pagina, setPagina] = useState(0);
  const [rascunho, setRascunho] = useState("");
  const [filtro, setFiltro] = useState<number | null>(null);
  const q = useQuery({
    queryKey: ["v111", "fragmentos", ctx.idUsuario, ctx.idOrganizacao, idVersao, filtro, pagina],
    queryFn: ({ signal }) => listarFragmentos(idVersao, pagina, filtro, signal),
    retry: false,
  });
  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(rascunho);
    setFiltro(rascunho.trim() && Number.isInteger(n) && n > 0 ? n : null);
    setPagina(0);
  };
  const itens = q.data?.itens ?? [];
  return (
    <section aria-label="Fragmentos" className={SECAO}>
      <h2 className="text-lg font-semibold">Fragmentos</h2>
      <form
        onSubmit={aplicar}
        className="flex flex-wrap items-end gap-2"
        aria-label="Filtro de fragmentos"
      >
        <label className="grid gap-1">
          <span className={ROTULO}>Filtrar por página</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            className={`${CAMPO} w-40`}
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
          />
        </label>
        <Button type="submit" variant="secondary" className="h-11">
          Aplicar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => {
            setRascunho("");
            setFiltro(null);
            setPagina(0);
          }}
        >
          Limpar
        </Button>
      </form>
      {q.isPending ? (
        <Carregando texto="Carregando fragmentos…" />
      ) : q.isError ? (
        <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void q.refetch()} />
      ) : itens.length === 0 ? (
        <Vazio texto={MENSAGENS_V111.semFragmentos} />
      ) : (
        <>
          <ul className="space-y-2">
            {itens.map((f) => (
              <li key={f.id} className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">
                  {`Fragmento ${f.indice_fragmento + 1}`}
                  {f.pagina_inicio !== null
                    ? ` · ${f.pagina_inicio === f.pagina_fim || f.pagina_fim === null ? `página ${f.pagina_inicio}` : `páginas ${f.pagina_inicio} a ${f.pagina_fim}`}`
                    : ""}
                </p>
                <TextoLongo texto={f.texto} />
              </li>
            ))}
          </ul>
          <Paginacao
            rotulo="fragmentos"
            pagina={pagina}
            total={q.data?.total ?? 0}
            tamanho={PAGINA_FRAGMENTOS}
            onMudar={setPagina}
          />
        </>
      )}
    </section>
  );
}

// ---------- Sugestões de IA + revisão humana ----------
type Acao = { tipo: "aprovar" | "rejeitar" | "vigencia"; s: Sugestao };
function Sugestoes({
  idVersao,
  ctx,
  revisor,
  onAviso,
}: {
  idVersao: string;
  ctx: Ctx;
  revisor: boolean;
  onAviso: (m: string) => void;
}) {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosSugestao>({ status: "", tipo: "" });
  const [acao, setAcao] = useState<Acao | null>(null);
  const chave = ["v111", "sugestoes", ctx.idUsuario, ctx.idOrganizacao, idVersao];
  const q = useQuery({
    queryKey: [...chave, filtros, pagina],
    queryFn: ({ signal }) => listarSugestoes(idVersao, filtros, pagina, signal),
    retry: false,
  });
  const recarregar = () => qc.invalidateQueries({ queryKey: chave });
  const concluir = async (m: string) => {
    setAcao(null);
    onAviso(m);
    // Perfil (vinculos_usuarios) é lido uma única vez por tela: nunca invalidar.
    await qc.invalidateQueries({
      queryKey: ["v111"],
      predicate: (query) => query.queryKey[1] !== "perfil",
    });
  };
  const itens = q.data?.itens ?? [];
  const mudar = (f: FiltrosSugestao) => {
    setFiltros(f);
    setPagina(0);
  };
  return (
    <section aria-label="Sugestões de IA" className={SECAO}>
      <div className="flex items-center gap-1">
        <h2 className="text-lg font-semibold">Sugestões de IA</h2>
        <Dica rotulo="Sobre as sugestões de IA">
          A IA apenas sugere. Nenhuma obrigação é criada sem fonte, página, trecho e aprovação
          humana; regras aprovadas nascem em rascunho para revisão material.
        </Dica>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1">
          <span className={ROTULO}>Status</span>
          <select
            className={CAMPO}
            value={filtros.status}
            onChange={(e) => mudar({ ...filtros, status: e.target.value })}
          >
            <option value="">Todos</option>
            {Object.entries(ROTULO_STATUS_SUGESTAO).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className={ROTULO}>Tipo de sugestão</span>
          <select
            className={CAMPO}
            value={filtros.tipo}
            onChange={(e) => mudar({ ...filtros, tipo: e.target.value })}
          >
            <option value="">Todos</option>
            {Object.entries(ROTULO_TIPO_SUGESTAO).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      {q.isPending ? (
        <Carregando texto="Carregando sugestões…" />
      ) : q.isError ? (
        <Alerta mensagem={MENSAGENS_V111.erro} onRetry={() => void q.refetch()} />
      ) : itens.length === 0 ? (
        <Vazio texto={MENSAGENS_V111.semSugestoes} />
      ) : (
        <>
          <ul className="space-y-3">
            {itens.map((s) => (
              <CartaoSugestao
                key={s.id}
                s={s}
                ctx={ctx}
                revisor={revisor}
                requisito={
                  s.id_requisito_sugerido ? q.data?.requisitos[s.id_requisito_sugerido] : undefined
                }
                onAcao={(tipo) => setAcao({ tipo, s })}
              />
            ))}
          </ul>
          <Paginacao
            rotulo="sugestões"
            pagina={pagina}
            total={q.data?.total ?? 0}
            tamanho={PAGINA_SUGESTOES}
            onMudar={setPagina}
          />
        </>
      )}
      {revisor && acao?.tipo === "vigencia" && (
        <DialogoVigencia
          s={acao.s}
          onFechar={() => setAcao(null)}
          onConcluido={concluir}
          onRecarregar={recarregar}
        />
      )}
      {revisor && (acao?.tipo === "aprovar" || acao?.tipo === "rejeitar") && (
        <DialogoRevisao
          s={acao.s}
          aprovar={acao.tipo === "aprovar"}
          onFechar={() => setAcao(null)}
          onConcluido={concluir}
          onRecarregar={recarregar}
        />
      )}
    </section>
  );
}

function CartaoSugestao({
  s,
  ctx,
  revisor,
  requisito,
  onAcao,
}: {
  s: Sugestao;
  ctx: Ctx;
  revisor: boolean;
  requisito: { codigo: string | null; descricao: string } | undefined;
  onAcao: (t: Acao["tipo"]) => void;
}) {
  const material = ehMaterial(s.tipo);
  const bloqueio = bloqueioAprovacao(s);
  const pendente = s.status === "pendente";
  return (
    <li data-testid={`sugestao-${s.id}`} className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Selo classe="border-dashed border-muted-foreground bg-background">
          <Bot className="h-3.5 w-3.5" aria-hidden />
          Sugestão de IA
        </Selo>
        <Selo>{ROTULO_TIPO_SUGESTAO[s.tipo] ?? s.tipo}</Selo>
        <Selo>{ROTULO_STATUS_SUGESTAO[s.status] ?? s.status}</Selo>
        {s.confianca !== null && s.confianca !== undefined && (
          <Selo>{`Confiança: ${Math.round(Number(s.confianca) * 100)}%`}</Selo>
        )}
      </div>
      {s.conteudo && <p className="break-words text-sm">{s.conteudo}</p>}
      {s.tipo === "classificacao" && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Campo rotulo="Categoria sugerida">{s.categoria_sugerida ?? "—"}</Campo>
          {s.id_requisito_sugerido && (
            <Campo rotulo="Item da lista de verificação">
              {requisito
                ? `Item sugerido: ${requisito.codigo ? `${requisito.codigo} — ` : ""}${requisito.descricao}`
                : "Item sugerido indisponível"}
            </Campo>
          )}
        </dl>
      )}
      {s.tipo === "metadado" && <CamposPropostos metadados={s.metadados} />}
      {(material || s.pagina !== null || s.trecho_fonte) && (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fonte
          </p>
          {s.pagina !== null || s.trecho_fonte ? (
            <>
              {s.pagina !== null && <p>{`Página ${s.pagina}`}</p>}
              {s.trecho_fonte && (
                <blockquote className="mt-1 whitespace-pre-wrap break-words border-l-2 border-border pl-3">
                  {s.trecho_fonte}
                </blockquote>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Sem fonte registrada.</p>
          )}
        </div>
      )}
      {material && (
        <p className="flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
          {`Vigência: ${vigenciaTexto(s.vigencia_inicio, s.vigencia_fim)}`}
        </p>
      )}
      {!pendente && s.revisado_por && (
        <p className="flex items-center gap-2 text-sm">
          <UserCheck className="h-4 w-4 shrink-0" aria-hidden />
          {`Decisão humana: ${(ROTULO_STATUS_SUGESTAO[s.status] ?? s.status).toLowerCase()} por ${rotuloUsuario(s.revisado_por, ctx.idUsuario)}${s.revisado_em ? ` em ${formatarDataHoraBr(s.revisado_em)}` : ""}`}
        </p>
      )}
      {pendente && revisor && (
        <>
          {bloqueio && (
            <p role="note" className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              {bloqueio === "sem_fonte" ? MENSAGENS_V111.semFonte : MENSAGENS_V111.semVigencia}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-11"
              disabled={!!bloqueio}
              onClick={() => onAcao("aprovar")}
            >
              <Check className="mr-2 h-4 w-4" aria-hidden /> Aprovar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => onAcao("rejeitar")}
            >
              <X className="mr-2 h-4 w-4" aria-hidden /> Rejeitar
            </Button>
            {material && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => onAcao("vigencia")}
              >
                <CalendarClock className="mr-2 h-4 w-4" aria-hidden /> Definir vigência
              </Button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

function CamposPropostos({ metadados }: { metadados: unknown }) {
  const campos =
    metadados && typeof metadados === "object" && !Array.isArray(metadados)
      ? (metadados as Record<string, unknown>)["campos"]
      : undefined;
  if (!campos || typeof campos !== "object") return null;
  return (
    <div className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Campos propostos
      </p>
      <ValorMetadado valor={campos} />
    </div>
  );
}

function DialogoVigencia({
  s,
  onFechar,
  onConcluido,
  onRecarregar,
}: {
  s: Sugestao;
  onFechar: () => void;
  onConcluido: (m: string) => Promise<void>;
  onRecarregar: () => Promise<void>;
}) {
  const [inicio, setInicio] = useState(s.vigencia_inicio ?? "");
  const [fim, setFim] = useState(s.vigencia_fim ?? "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const trava = useRef(false);
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (trava.current) return;
    if (!inicio) return setErro(MENSAGENS_V111.inicioObrigatorio);
    if (fim && fim < inicio) return setErro(MENSAGENS_V111.fimAntes);
    trava.current = true;
    setEnviando(true);
    setErro("");
    try {
      const r = await definirVigenciaSugestao(s.id, inicio, fim || null);
      await onConcluido(
        r === "sem_alteracao" ? MENSAGENS_V111.vigenciaSemAlteracao : MENSAGENS_V111.vigenciaSalva,
      );
    } catch (err) {
      const t = err instanceof ErroRevisao ? err.tipo : "erro";
      await onRecarregar();
      setErro(mensagemErroRevisao(t, true));
    } finally {
      trava.current = false;
      setEnviando(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && !enviando && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir vigência da sugestão</DialogTitle>
          <DialogDescription>
            O início é obrigatório para regras extraídas; o fim é opcional. A validação final é do
            backend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-3">
          <label className="grid gap-1">
            <span className={ROTULO}>Início da vigência</span>
            <input
              type="date"
              className={CAMPO}
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={ROTULO}>Fim da vigência (opcional)</span>
            <input
              type="date"
              className={CAMPO}
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </label>
          <p aria-live="assertive" className="text-sm text-destructive">
            {erro}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              disabled={enviando}
              onClick={onFechar}
            >
              Cancelar
            </Button>
            <Button type="submit" className="h-11" disabled={enviando}>
              {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Salvar vigência
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogoRevisao({
  s,
  aprovar,
  onFechar,
  onConcluido,
  onRecarregar,
}: {
  s: Sugestao;
  aprovar: boolean;
  onFechar: () => void;
  onConcluido: (m: string) => Promise<void>;
  onRecarregar: () => Promise<void>;
}) {
  const [categoria, setCategoria] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const trava = useRef(false);
  const classificacao = s.tipo === "classificacao";
  const confirmar = async () => {
    if (trava.current) return;
    trava.current = true;
    setEnviando(true);
    setErro("");
    try {
      const r = await revisarSugestao(
        s.id,
        aprovar,
        classificacao ? conteudo : "",
        classificacao ? categoria : "",
      );
      await onConcluido(
        r === "rejeitada"
          ? MENSAGENS_V111.rejeitada
          : r === "aprovada_rascunho"
            ? MENSAGENS_V111.aprovadaRascunho
            : MENSAGENS_V111.aprovadaAplicada,
      );
    } catch (err) {
      const t = err instanceof ErroRevisao ? err.tipo : "erro";
      await onRecarregar();
      setErro(mensagemErroRevisao(t));
    } finally {
      trava.current = false;
      setEnviando(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && !enviando && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {aprovar ? "Aprovar sugestão de IA" : "Rejeitar sugestão de IA"}
          </DialogTitle>
          <DialogDescription>
            {aprovar
              ? ehMaterial(s.tipo)
                ? "A aprovação gera uma regra em rascunho para revisão material; ela não afeta o portão."
                : s.tipo === "metadado"
                  ? "A aprovação aplica os campos propostos aos metadados desta versão."
                  : "A aprovação aplica a categoria ao documento."
              : "A rejeição não altera regras nem metadados."}
          </DialogDescription>
        </DialogHeader>
        {aprovar && classificacao && (
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className={ROTULO}>Categoria revisada (opcional)</span>
              <input
                className={CAMPO}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </label>
            <label className="grid gap-1">
              <span className={ROTULO}>Conteúdo revisado (opcional)</span>
              <textarea
                className={`${CAMPO} h-24 py-2`}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
              />
            </label>
          </div>
        )}
        <p aria-live="assertive" className="text-sm text-destructive">
          {erro}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            disabled={enviando}
            onClick={onFechar}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={aprovar ? "default" : "destructive"}
            className="h-11"
            disabled={enviando}
            onClick={() => void confirmar()}
          >
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
            {aprovar ? "Confirmar aprovação" : "Confirmar rejeição"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

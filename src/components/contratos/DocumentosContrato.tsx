import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Bot,
  Building2,
  CheckCircle2,
  CircleDashed,
  Clock,
  Download,
  FileUp,
  FileSearch,
  Info,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
  ShieldCheck,
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
  aceiteDe,
  formatarBytes,
  obterConfiguracaoUpload,
  type ConfigUpload,
  ErroDoc,
  FILTROS_VAZIOS,
  MENSAGENS_V110,
  PAGINA_DOCS,
  ROTULO_PROCESSAMENTO,
  ROTULO_SEGURANCA,
  ROTULO_SITUACAO_DOC,
  ROTULO_TIPO,
  TIPOS_DOCUMENTO,
  adicionarVersao,
  atrasoPolling,
  baixarDocumento,
  criarDocumentoCompleto,
  emAndamento,
  enviarArquivoCertificado,
  erroVigencia,
  hashCurto,
  listarDocumentos,
  mensagemErroEnvio,
  obterResumos,
  temMetadados,
  tituloDeArquivo,
  validarArquivo,
  type DadosDocumento,
  type Documento,
  type Filtros,
  type Resumo,
} from "@/lib/contratos/documentosDados";
import type { BuscaCentral } from "@/lib/contratos/documentoDetalheDados";

export { MENSAGENS_V110 };

const filtrosDe = (b: BuscaCentral): Filtros => ({
  busca: b.busca ?? "",
  tipo: b.tipo ?? "",
  categoria: b.categoria ?? "",
  situacao: b.situacao ?? "",
});
function buscaDe(f: Filtros, pagina: number): BuscaCentral {
  const r: BuscaCentral = {};
  if (f.busca.trim()) r.busca = f.busca.trim();
  if (f.tipo) r.tipo = f.tipo;
  if (f.categoria.trim()) r.categoria = f.categoria.trim();
  if (f.situacao) r.situacao = f.situacao;
  if (pagina > 0) r.pagina = pagina;
  return r;
}

type Ctx = { idUsuario: string; idOrganizacao: string };
const LINK_NAV =
  "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const CAMPO =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const ROTULO = "text-sm font-medium";

export function DocumentosContrato({ id, inicial = {} }: { id: string; inicial?: BuscaCentral }) {
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

  const idOk = uuidValido(id);
  const idC = idOk ? uuidCanonico(id) : id;
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
                mensagem={MENSAGENS_V110.erroSessao}
                onRetry={() => setTentativa((n) => n + 1)}
              />
            </>
          ) : !ctx ? (
            <>
              <Titulo />
              <Carregando texto={MENSAGENS_V110.verificando} />
            </>
          ) : !idOk ? (
            <>
              <Titulo />
              <Aviso
                icone={
                  <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                }
                mensagem={MENSAGENS_V110.naoEncontrado}
              />
            </>
          ) : (
            <GateContrato
              key={`${ctx.idUsuario}:${ctx.idOrganizacao}:${idC}`}
              id={idC}
              ctx={ctx}
              inicial={inicial}
            />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Titulo({ numero }: { numero?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {numero ? `Contrato ${numero}` : "Gestão contratual"}
      </p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        Central de documentos
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

function GateContrato({ id, ctx, inicial }: { id: string; ctx: Ctx; inicial: BuscaCentral }) {
  const consulta = useQuery({
    queryKey: ["contratos", "detalhe", ctx.idUsuario, ctx.idOrganizacao, id],
    queryFn: ({ signal }) => obterContrato(id, signal),
    retry: false,
  });
  if (consulta.isError) {
    const tipo = consulta.error instanceof ErroDetalhe ? consulta.error.tipo : "erro";
    return (
      <>
        <Titulo />
        {tipo === "negado" ? (
          <Aviso
            icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
            mensagem={MENSAGENS_V110.negado}
          />
        ) : tipo === "nao_encontrado" ? (
          <Aviso
            icone={
              <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            mensagem={MENSAGENS_V110.naoEncontrado}
          />
        ) : (
          <Alerta
            mensagem={tipo === "consistencia" ? MENSAGENS_V110.consistencia : MENSAGENS_V110.erro}
            onRetry={() => void consulta.refetch()}
          />
        )}
      </>
    );
  }
  const c = consulta.data;
  if (!c || uuidCanonico(c.id) !== id)
    return (
      <>
        <Titulo />
        <Carregando texto={MENSAGENS_V110.carregando} />
      </>
    );
  return (
    <>
      <Titulo numero={c.numero ?? undefined} />
      <NavSecoes id={c.id} />
      <Central contrato={c.id} ctx={ctx} inicial={inicial} />
    </>
  );
}

function NavSecoes({ id }: { id: string }) {
  return (
    <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to="/contratos/$id"
            params={{ id }}
            activeOptions={{ exact: true }}
            className={LINK_NAV}
          >
            Visão geral
          </Link>
        </li>
        <li>
          <Link to="/contratos/$id/base-normativa" params={{ id }} className={LINK_NAV}>
            Base normativa
          </Link>
        </li>
        <li>
          <Link to="/contratos/$id/orcamento" params={{ id }} className={LINK_NAV}>
            Orçamento
          </Link>
        </li>
        <li>
          <Link to="/contratos/$id/regras" params={{ id }} className={LINK_NAV}>
            Regras
          </Link>
        </li>
        <li>
          <span
            aria-current="page"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Documentos
          </span>
        </li>
        <li>
          <Link to="/contratos/$id/competencias" params={{ id }} className={LINK_NAV}>
            Competências
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// ---------- Central: FilterBar + DocumentTable + Pagination ----------
function Central({
  contrato,
  ctx,
  inicial,
}: {
  contrato: string;
  ctx: Ctx;
  inicial: BuscaCentral;
}) {
  const qc = useQueryClient();
  const [rascunho, setRascunho] = useState<Filtros>(() => filtrosDe(inicial));
  const [filtros, setFiltros] = useState<Filtros>(() => filtrosDe(inicial));
  const [pagina, setPagina] = useState(inicial.pagina ?? 0);
  const [envioAberto, setEnvioAberto] = useState(false);
  const [versaoDe, setVersaoDe] = useState<Documento | null>(null);
  const [aviso, setAviso] = useState("");
  const chave = [ctx.idUsuario, ctx.idOrganizacao, contrato];
  const lista = useQuery({
    queryKey: ["documentos", "lista", ...chave, filtros, pagina],
    queryFn: ({ signal }) => listarDocumentos(contrato, filtros, pagina, signal),
    retry: false,
  });
  const docs = lista.data?.itens ?? [];
  const ids = docs.map((d) => `${d.id}:${d.versao_atual}`);
  const ciclos = useRef(0);
  const resumos = useQuery({
    queryKey: ["documentos", "resumos", ...chave, ids],
    queryFn: ({ signal }) => obterResumos(docs, signal),
    enabled: docs.length > 0,
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: (q) => {
      if (!emAndamento(q.state.data)) {
        ciclos.current = 0;
        return false;
      }
      return atrasoPolling(ciclos.current++);
    },
  });
  const cfg = useQuery({
    queryKey: ["documentos", "config-upload", ...chave],
    queryFn: ({ signal }) => obterConfiguracaoUpload(signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const config = cfg.data;
  const total = lista.data?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / PAGINA_DOCS));
  const atualizar = () => {
    ciclos.current = 0;
    void qc.invalidateQueries({ queryKey: ["documentos"] });
  };
  const aplicar = (e: FormEvent) => {
    e.preventDefault();
    setFiltros({ ...rascunho });
    setPagina(0);
  };
  const negado = lista.error instanceof ErroDoc && lista.error.tipo === "negado";
  const retorno = buscaDe(filtros, pagina);

  return (
    <section
      aria-labelledby="v110-docs"
      className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="v110-docs" className="text-lg font-semibold">
          Documentos do contrato
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={atualizar}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Atualizar lista
          </Button>
          <Button
            type="button"
            className="h-11"
            disabled={!config}
            onClick={() => setEnvioAberto(true)}
          >
            <FileUp className="mr-2 h-4 w-4" aria-hidden /> Enviar documentos
          </Button>
        </div>
      </div>
      {cfg.isError && (
        <Alerta mensagem={MENSAGENS_V110.configIndisponivel} onRetry={() => void cfg.refetch()} />
      )}
      <p aria-live="polite" className="text-sm">
        {aviso}
      </p>

      <form
        onSubmit={aplicar}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Filtros"
      >
        <label className="grid gap-1 lg:col-span-2">
          <span className={ROTULO}>Buscar por título</span>
          <input
            className={CAMPO}
            value={rascunho.busca}
            onChange={(e) => setRascunho({ ...rascunho, busca: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          <span className={ROTULO}>Tipo</span>
          <select
            className={CAMPO}
            value={rascunho.tipo}
            onChange={(e) => setRascunho({ ...rascunho, tipo: e.target.value })}
          >
            <option value="">Todos</option>
            {TIPOS_DOCUMENTO.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className={ROTULO}>Categoria</span>
          <input
            className={CAMPO}
            value={rascunho.categoria}
            onChange={(e) => setRascunho({ ...rascunho, categoria: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          <span className={ROTULO}>Situação</span>
          <select
            className={CAMPO}
            value={rascunho.situacao}
            onChange={(e) => setRascunho({ ...rascunho, situacao: e.target.value })}
          >
            <option value="">Todas</option>
            {Object.entries(ROTULO_SITUACAO_DOC).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="secondary" className="h-11">
            Aplicar filtros
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => {
              setRascunho(FILTROS_VAZIOS);
              setFiltros(FILTROS_VAZIOS);
              setPagina(0);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </form>

      {lista.isPending ? (
        <Carregando texto={MENSAGENS_V110.carregandoSecao} />
      ) : lista.isError ? (
        <Alerta
          mensagem={negado ? MENSAGENS_V110.negadoSecao : MENSAGENS_V110.erroSecao}
          onRetry={negado ? undefined : () => void lista.refetch()}
        />
      ) : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">{MENSAGENS_V110.vazio}</p>
        </div>
      ) : (
        <>
          {resumos.isError && (
            <Alerta mensagem={MENSAGENS_V110.erroSecao} onRetry={() => void resumos.refetch()} />
          )}
          <ul className="space-y-3" aria-label="Documentos">
            {docs.map((d) => (
              <LinhaDocumento
                key={d.id}
                d={d}
                r={resumos.data?.[d.id]}
                carregandoResumo={resumos.isPending}
                envioDisponivel={!!config}
                onNovaVersao={() => setVersaoDe(d)}
                retorno={retorno}
              />
            ))}
          </ul>
          <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {`Página ${pagina + 1} de ${paginas} — ${total} documento${total === 1 ? "" : "s"}`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={pagina === 0}
                onClick={() => setPagina((p) => p - 1)}
              >
                Página anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={pagina + 1 >= paginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima página
              </Button>
            </div>
          </nav>
        </>
      )}

      {config && (
        <DialogoEnvio
          cfg={config}
          aberto={envioAberto}
          modo={{ tipo: "novo" }}
          ctx={ctx}
          contrato={contrato}
          onFechar={() => setEnvioAberto(false)}
          onConcluido={() => {
            setAviso(MENSAGENS_V110.sucesso);
            atualizar();
          }}
        />
      )}
      {versaoDe && config && (
        <DialogoEnvio
          cfg={config}
          aberto
          modo={{ tipo: "versao", doc: versaoDe }}
          ctx={ctx}
          contrato={contrato}
          onFechar={() => setVersaoDe(null)}
          onConcluido={() => {
            setAviso(MENSAGENS_V110.sucesso);
            atualizar();
          }}
        />
      )}
    </section>
  );
}

function vigenciaTexto(i: string | null, f: string | null) {
  if (i && f) return `${formatarDataBr(i)} a ${formatarDataBr(f)}`;
  if (i) return `A partir de ${formatarDataBr(i)}`;
  return "Sem vigência informada";
}
const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

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

function LinhaDocumento({
  d,
  r,
  carregandoResumo,
  envioDisponivel,
  onNovaVersao,
  retorno,
}: {
  d: Documento;
  r: Resumo | undefined;
  carregandoResumo: boolean;
  envioDisponivel: boolean;
  onNovaVersao: () => void;
  retorno: BuscaCentral;
}) {
  const [baixando, setBaixando] = useState(false);
  const [erroDl, setErroDl] = useState("");
  const status = r?.arquivo?.status_seguranca;
  const baixar = async () => {
    if (!r?.arquivo || baixando) return;
    setBaixando(true);
    setErroDl("");
    try {
      await baixarDocumento(r.arquivo.id);
    } catch (e) {
      setErroDl(
        e instanceof ErroDoc && e.tipo === "negado"
          ? MENSAGENS_V110.downloadNegado
          : MENSAGENS_V110.downloadErro,
      );
    } finally {
      setBaixando(false);
    }
  };
  const hash = r?.versao?.hash ?? r?.arquivo?.sha256;
  return (
    <li data-testid={`documento-${d.id}`} className="rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="break-words font-semibold">{d.titulo}</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Selo>{ROTULO_TIPO[d.tipo] ?? d.tipo}</Selo>
            <Selo>{`Categoria informada: ${d.categoria ?? "—"}`}</Selo>
            <Selo>{ROTULO_SITUACAO_DOC[d.situacao] ?? d.situacao}</Selo>
            <Selo>{`Versão ${d.versao_atual}`}</Selo>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "aprovado" && r?.arquivo ? (
            <Button
              type="button"
              variant="outline"
              className="h-11"
              aria-label={`Baixar ${r.arquivo.nome_original}`}
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
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-11"
            aria-label={`Nova versão de ${d.titulo}`}
            disabled={!envioDisponivel}
            onClick={onNovaVersao}
          >
            <FileUp className="mr-2 h-4 w-4" aria-hidden /> Nova versão
          </Button>
          <Button asChild variant="ghost" className="h-11">
            <Link
              to="/contratos/$id/documentos/$idDocumento"
              params={{ id: d.id_contrato, idDocumento: d.id }}
              search={retorno}
              aria-label={`Abrir detalhe de ${d.titulo}`}
            >
              <FileSearch className="mr-2 h-4 w-4" aria-hidden /> Abrir detalhe
            </Link>
          </Button>
        </div>
      </div>

      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Vigência</dt>
          <dd>{vigenciaTexto(d.vigencia_inicio, d.vigencia_fim)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Observações</dt>
          <dd className="break-words">{d.observacoes ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Arquivo da versão atual</dt>
          <dd className="break-all">
            {r?.arquivo?.nome_original ?? "—"}
            {r?.versao && (
              <span className="block text-xs text-muted-foreground">
                {`Enviado em ${formatarDataHoraBr(r.versao.criado_em)}`}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            SHA-256
            {hash && <Dica rotulo="Hash SHA-256 completo">{hash}</Dica>}
          </dt>
          <dd className="font-mono text-xs">{hashCurto(hash)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1">
          <StatusSeguranca s={status} />
          <Dica rotulo="Sobre a verificação de segurança">
            Todo arquivo passa por verificação de segurança antes de ser baixado ou analisado.
          </Dica>
        </span>
        <span className="flex items-center gap-1">
          <StatusProcessamento s={r?.processamento?.status} />
          <Dica rotulo="Sobre o processamento">
            O processamento extrai páginas e metadados em segundo plano. A lista se atualiza
            automaticamente enquanto houver processamento em andamento.
          </Dica>
        </span>
      </div>
      {(status === "quarentena" || status === "bloqueado") && (
        <p role="note" className="mt-2 flex items-start gap-2 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          {MENSAGENS_V110.bloqueadoSeguranca}
        </p>
      )}
      {status === "pendente" && (
        <p className="mt-2 text-sm text-muted-foreground">{MENSAGENS_V110.verificacaoPendente}</p>
      )}
      {erroDl && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {erroDl}
        </p>
      )}

      <div className="mt-3 rounded-md border border-dashed border-border bg-muted/40 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Bot className="h-3.5 w-3.5" aria-hidden /> Sugestões de IA — somente leitura
          <Dica rotulo="Sobre as sugestões de IA">
            Sugestões da IA não criam obrigações. A revisão humana, com fonte, página e trecho, será
            feita no detalhe do documento.
          </Dica>
        </p>
        {carregandoResumo && !r ? (
          <Carregando texto="Carregando indicadores…" />
        ) : (
          <ul className="flex flex-wrap gap-2 text-xs">
            <li>
              <Selo>
                {plural(
                  r?.iaPendentes ?? 0,
                  "sugestão de IA pendente de revisão humana",
                  "sugestões de IA pendentes de revisão humana",
                )}
              </Selo>
            </li>
            <li>
              <Selo>
                {plural(r?.semVigencia ?? 0, "sugestão sem vigência", "sugestões sem vigência")}
              </Selo>
            </li>
            <li>
              <Selo>
                {r?.classificacao?.categoria_sugerida
                  ? `Classificação (IA): ${r.classificacao.categoria_sugerida} — ${Math.round(
                      Number(r.classificacao.confianca ?? 0) * 100,
                    )}% de confiança`
                  : "Classificação (IA) pendente"}
              </Selo>
            </li>
            {r?.classificacao?.id_requisito_sugerido && (
              <li>
                <Selo>
                  {r.requisito
                    ? `Item sugerido: ${r.requisito.codigo ? `${r.requisito.codigo} — ` : ""}${r.requisito.descricao}`
                    : "Item sugerido indisponível"}
                </Selo>
              </li>
            )}
            <li>
              <Selo>
                {`Metadados extraídos: ${temMetadados(r?.versao?.metadados_extraidos) ? "disponíveis" : "pendentes"}`}
              </Selo>
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

// ---------- UploadDropzone + UploadProgress + MetadataForm ----------
type Etapa =
  "fila" | "invalido" | "enviando" | "confirmando" | "registrando" | "concluido" | "erro";
type Item = {
  id: string;
  arquivo: File;
  titulo: string;
  etapa: Etapa;
  progresso: number;
  mensagem: string;
};
type Progresso = {
  chave: string;
  path?: string;
  token?: string;
  bucket?: string;
  resumivel?: boolean;
  location?: string;
  enviado?: boolean;
  idArquivo?: string;
};
type Modo = { tipo: "novo" } | { tipo: "versao"; doc: Documento };
const ROTULO_ETAPA: Record<Etapa, string> = {
  fila: "Aguardando envio",
  invalido: "Recusado",
  enviando: "Enviando",
  confirmando: "Confirmando integridade",
  registrando: "Registrando documento",
  concluido: "Concluído",
  erro: "Falhou",
};

function DialogoEnvio({
  cfg,
  aberto,
  modo,
  ctx,
  contrato,
  onFechar,
  onConcluido,
}: {
  aberto: boolean;
  modo: Modo;
  ctx: Ctx;
  contrato: string;
  onFechar: () => void;
  onConcluido: () => void;
  cfg: ConfigUpload;
}) {
  const versao = modo.tipo === "versao";
  const [itens, setItens] = useState<Item[]>([]);
  const [meta, setMeta] = useState<Omit<DadosDocumento, "titulo">>({
    tipo: "contrato",
    categoria: "",
    vigenciaInicio: "",
    vigenciaFim: "",
    observacoes: "",
  });
  const [motivo, setMotivo] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const trava = useRef(false);
  const prog = useRef<Record<string, Progresso>>({});
  const seq = useRef(0);

  const reiniciar = () => {
    setItens([]);
    setMotivo("");
    setErroForm("");
    prog.current = {};
  };
  const atualizarItem = (id: string, p: Partial<Item>) =>
    setItens((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const adicionar = (lista: FileList | File[] | null) => {
    if (!lista) return;
    const novos = Array.from(lista).map((f): Item => {
      const inv = validarArquivo(f, cfg);
      return {
        id: `i${++seq.current}`,
        arquivo: f,
        titulo: tituloDeArquivo(f.name),
        etapa: inv ? "invalido" : "fila",
        progresso: 0,
        mensagem: inv ?? "",
      };
    });
    setItens((l) => (versao ? novos.slice(0, 1) : [...l, ...novos]));
  };

  const processar = async (it: Item) => {
    const p = (prog.current[it.id] ??= { chave: crypto.randomUUID() });
    try {
      const idArquivo = await enviarArquivoCertificado(ctx.idOrganizacao, contrato, it.arquivo, p, {
        onEtapa: (e) =>
          atualizarItem(it.id, e === "enviando" ? { etapa: e, mensagem: "" } : { etapa: e }),
        onProgresso: (pct) => atualizarItem(it.id, { progresso: pct }),
      });
      atualizarItem(it.id, { etapa: "registrando" });
      if (modo.tipo === "versao") await adicionarVersao(modo.doc.id, idArquivo, motivo, p.chave);
      else
        await criarDocumentoCompleto(contrato, { ...meta, titulo: it.titulo }, idArquivo, p.chave);
      atualizarItem(it.id, { etapa: "concluido", mensagem: "" });
      return true;
    } catch (e) {
      atualizarItem(it.id, {
        etapa: "erro",
        mensagem: mensagemErroEnvio(e instanceof ErroDoc ? e.tipo : "erro"),
      });
      return false;
    }
  };

  const executar = async (alvos: Item[]) => {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true);
    let algum = false;
    for (const it of alvos) if (await processar(it)) algum = true;
    trava.current = false;
    setOcupado(false);
    if (algum) onConcluido();
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (trava.current) return;
    setErroForm("");
    const validos = itens.filter((i) => i.etapa === "fila");
    if (validos.length === 0) return setErroForm(MENSAGENS_V110.semArquivos);
    if (versao) {
      if (!motivo.trim()) return setErroForm(MENSAGENS_V110.motivoObrigatorio);
    } else {
      if (validos.some((i) => !i.titulo.trim())) return setErroForm(MENSAGENS_V110.semTitulo);
      const v = erroVigencia(meta.vigenciaInicio, meta.vigenciaFim);
      if (v === "fim_sem_inicio") return setErroForm(MENSAGENS_V110.vigenciaFimSemInicio);
      if (v === "fim_antes") return setErroForm(MENSAGENS_V110.vigenciaFimAntes);
    }
    void executar(validos);
  };

  const idBase = versao ? "v110-versao" : "v110-novo";
  return (
    <Dialog
      open={aberto}
      onOpenChange={(o) => {
        if (!o && !trava.current) {
          reiniciar();
          onFechar();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {versao ? `Nova versão — ${modo.doc.titulo}` : "Enviar documentos"}
          </DialogTitle>
          <DialogDescription>
            {versao
              ? "A versão anterior é preservada. O arquivo vai direto para o armazenamento privado com autorização temporária."
              : "Selecione um ou mais arquivos. Cada arquivo gera um documento-base. Os envios vão direto para o armazenamento privado com autorização temporária."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <div
            className="rounded-lg border-2 border-dashed border-border p-4 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!ocupado) adicionar(e.dataTransfer.files);
            }}
          >
            <FileUp className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden />
            <label
              htmlFor={`${idBase}-arquivos`}
              className="cursor-pointer text-sm font-medium underline"
            >
              {versao ? "Escolher arquivo" : "Escolher arquivos"}
            </label>
            <p className="text-xs text-muted-foreground">
              {`ou arraste aqui. Formatos aceitos: ${cfg.extensoes.map((e) => e.toUpperCase()).join(", ")}${
                cfg.maximo !== null ? ` — até ${formatarBytes(cfg.maximo)}` : ""
              }.`}
              {cfg.limiarResumivel !== null &&
                ` Arquivos acima de ${formatarBytes(cfg.limiarResumivel)} usam envio resumível, com retomada automática.`}
            </p>
            <input
              id={`${idBase}-arquivos`}
              type="file"
              aria-label={versao ? "Arquivo" : "Arquivos"}
              multiple={!versao}
              accept={aceiteDe(cfg)}
              disabled={ocupado}
              className="sr-only"
              onChange={(e) => {
                adicionar(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {itens.length > 0 && (
            <ul className="space-y-2" aria-label="Fila de envio">
              {itens.map((i) => (
                <li key={i.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-all text-sm font-medium">{i.arquivo.name}</span>
                    <Selo
                      classe={
                        i.etapa === "erro" || i.etapa === "invalido"
                          ? "border-destructive/60 bg-destructive/5"
                          : ""
                      }
                    >
                      {i.etapa === "concluido" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      ) : i.etapa === "erro" || i.etapa === "invalido" ? (
                        <XCircle className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <CircleDashed className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {ROTULO_ETAPA[i.etapa]}
                    </Selo>
                  </div>
                  {!versao && i.etapa !== "invalido" && (
                    <label className="mt-2 grid gap-1">
                      <span className="text-xs font-medium">{`Título de ${i.arquivo.name}`}</span>
                      <input
                        className={CAMPO}
                        value={i.titulo}
                        disabled={ocupado || i.etapa === "concluido"}
                        onChange={(e) => atualizarItem(i.id, { titulo: e.target.value })}
                      />
                    </label>
                  )}
                  {(i.etapa === "enviando" || i.progresso > 0) && i.etapa !== "concluido" && (
                    <div
                      role="progressbar"
                      aria-label={`Progresso de ${i.arquivo.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={i.progresso}
                      className="mt-2 h-2 w-full overflow-hidden rounded bg-muted"
                    >
                      <div className="h-full bg-primary" style={{ width: `${i.progresso}%` }} />
                    </div>
                  )}
                  {i.mensagem && (
                    <p role="alert" className="mt-2 text-sm text-destructive">
                      {i.mensagem}
                    </p>
                  )}
                  {i.etapa === "erro" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 h-11"
                      aria-label={`Tentar novamente ${i.arquivo.name}`}
                      disabled={ocupado}
                      onClick={() => void executar([i])}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {versao ? (
            <label className="grid gap-1">
              <span className={ROTULO}>Motivo da nova versão</span>
              <textarea
                className={`${CAMPO} h-24 py-2`}
                value={motivo}
                maxLength={2000}
                disabled={ocupado}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </label>
          ) : (
            <fieldset className="grid gap-3 sm:grid-cols-2" disabled={ocupado}>
              <legend className="mb-2 text-sm font-semibold">Metadados do documento-base</legend>
              <label className="grid gap-1">
                <span className={ROTULO}>Tipo do documento</span>
                <select
                  className={CAMPO}
                  value={meta.tipo}
                  onChange={(e) => setMeta({ ...meta, tipo: e.target.value })}
                >
                  {TIPOS_DOCUMENTO.map(([v, r]) => (
                    <option key={v} value={v}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className={ROTULO}>Categoria</span>
                <input
                  className={CAMPO}
                  value={meta.categoria}
                  maxLength={200}
                  onChange={(e) => setMeta({ ...meta, categoria: e.target.value })}
                />
              </label>
              <label className="grid gap-1">
                <span className={ROTULO}>Início da vigência</span>
                <input
                  type="date"
                  lang="pt-BR"
                  className={CAMPO}
                  value={meta.vigenciaInicio}
                  onChange={(e) => setMeta({ ...meta, vigenciaInicio: e.target.value })}
                />
              </label>
              <label className="grid gap-1">
                <span className={ROTULO}>Fim da vigência</span>
                <input
                  type="date"
                  lang="pt-BR"
                  className={CAMPO}
                  value={meta.vigenciaFim}
                  onChange={(e) => setMeta({ ...meta, vigenciaFim: e.target.value })}
                />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className={ROTULO}>Observações</span>
                <textarea
                  className={`${CAMPO} h-20 py-2`}
                  value={meta.observacoes}
                  maxLength={2000}
                  onChange={(e) => setMeta({ ...meta, observacoes: e.target.value })}
                />
              </label>
            </fieldset>
          )}

          {erroForm && (
            <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {erroForm}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={ocupado}
              onClick={() => {
                reiniciar();
                onFechar();
              }}
            >
              Fechar
            </Button>
            <Button type="submit" className="h-11" disabled={ocupado} aria-busy={ocupado}>
              {ocupado && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {versao ? "Enviar nova versão" : "Enviar e registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

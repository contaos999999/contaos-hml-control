import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Building2, Info, Loader2, RefreshCw, SearchX, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { ErroDetalhe, formatarDataBr, obterContrato, uuidCanonico, uuidValido, type ContratoDetalhe } from "@/lib/contratos/contratoDetalheDados";
import { ErroBn, baixarArquivo, enviarArquivo, formatarDataHoraBr, listarArquivos, type TipoErroBn } from "@/lib/contratos/baseNormativaDados";
import {
  PAGINA_ORC, ROTULO_SITUACAO_PROPOSTA, ROTULO_SITUACAO_VERSAO, ROTULO_STATUS_ARQUIVO, chamarV108, criarGerenciadorChave, formatarBrl, lerValorBr, listarPropostas, listarRubricas,
  listarVersoesProposta, obterArquivosPorIds, valorParaCampo, type ArgsRpcV108, type ArquivoResumo, type NomeV108, type Proposta, type Rubrica, type VersaoProposta,
} from "@/lib/contratos/orcamentoDados";

export const MENSAGENS_V108 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  carregandoOrc: "Carregando orçamento…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia: "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  erroLista: "Não foi possível carregar o orçamento agora. Tente novamente em instantes.",
  negadoLista: "Você não tem acesso ao orçamento deste contrato.",
  vazio: "Nenhuma proposta orçamentária registrada para este contrato.",
  semVersoes: "Esta proposta ainda não possui versões. Registre a primeira versão com vigência e documento-base.",
  semRubricas: "Esta versão ainda não possui rubricas.",
  conflito: "Este registro foi alterado por outra pessoa. Recarregue e revise antes de salvar novamente.",
  validacao: "Os dados informados não foram aceitos. Revise os campos e tente novamente.",
  obsoleto: "Este registro não está mais disponível. Recarregue a página.",
  semPermissao: "Você não tem permissão para esta ação.",
  erroAcao: "Não foi possível concluir a ação agora. Tente novamente em instantes.",
  resumivel: "Upload retomável não está disponível nesta tela.",
  docNaoAprovado: "A publicação exige documento-base com status de segurança “Aprovado”. O servidor faz a validação final.",
  semRubricaPublicar: "A publicação exige ao menos uma rubrica.",
  semHash: "Hash da versão ainda indisponível. Recarregue antes de publicar.",
  rascunhoExistente: "Já existe uma versão em rascunho; conclua-a antes de registrar outra.",
  enviado: "Arquivo enviado e em análise de segurança. Use “Atualizar lista” para ver o status.",
  erroEnvio: "Não foi possível enviar o arquivo agora. Tente novamente em instantes.",
  erroDownload: "Não foi possível baixar o arquivo agora. Tente novamente em instantes.",
} as const;

const SECOES_FUTURAS = ["Regras", "Documentos", "Competências"] as const;
const MSG_ERRO_ACAO: Record<TipoErroBn, string> = {
  conflito: MENSAGENS_V108.conflito, validacao: MENSAGENS_V108.validacao, obsoleto: MENSAGENS_V108.obsoleto, negado: MENSAGENS_V108.semPermissao, erro: MENSAGENS_V108.erroAcao, resumivel: MENSAGENS_V108.resumivel,
};
const tipoErro = (e: unknown): TipoErroBn => (e instanceof ErroBn ? e.tipo : "erro");
const campo = "mt-1 block min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const devolverFoco = (ref: RefObject<HTMLElement | null>) => (e: Event) => {
  e.preventDefault();
  ref.current?.focus();
};
const vazio = (s: string) => (s.trim() ? s.trim() : null);
const pct = (v: number | null) => (v === null ? "—" : `${String(v).replace(".", ",")}%`);

type Ctx = { idUsuario: string; idOrganizacao: string };

export function OrcamentoContrato({ id }: { id: string }) {
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
        const semSessao = !!error && ((error as { name?: string }).name === "AuthSessionMissingError" || (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user)) return void navigate({ to: "/login", replace: true });
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
        <header className="border-b border-border bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3"><ContaOSMarca /></div>
            <nav aria-label="Navegação" className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="h-11">
                <Link to="/contratos"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos</Link>
              </Button>
              <Button asChild variant="secondary" className="h-11">
                <Link to="/selecionar-organizacao"><Building2 className="mr-2 h-4 w-4" aria-hidden /> Selecionar organização</Link>
              </Button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {erroSessao ? (
            <><Titulo /><Alerta mensagem={MENSAGENS_V108.erroSessao} onRetry={() => setTentativa((n) => n + 1)} /></>
          ) : !ctx ? (
            <><Titulo /><Carregando texto={MENSAGENS_V108.verificando} /></>
          ) : !idOk ? (
            <><Titulo /><Aviso icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} mensagem={MENSAGENS_V108.naoEncontrado} /></>
          ) : (
            <GateContrato key={`${ctx.idUsuario}:${ctx.idOrganizacao}:${idC}`} id={idC} ctx={ctx} />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Titulo({ numero }: { numero?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{numero ? `Contrato ${numero}` : "Gestão contratual"}</p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">Orçamento</h1>
    </div>
  );
}
function Carregando({ texto: t }: { texto: string }) {
  return <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t}</p>;
}
function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm">{icone}{mensagem}</p>
      <Button asChild variant="outline" className="h-11"><Link to="/contratos">Voltar para contratos</Link></Button>
    </div>
  );
}
function Alerta({ mensagem, onRetry, rotulo = "Tentar novamente" }: { mensagem: string; onRetry: () => void; rotulo?: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />{mensagem}</p>
      <Button type="button" variant="outline" className="h-11" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" aria-hidden /> {rotulo}</Button>
    </div>
  );
}
/** Dica acessível: hover/foco no desktop, toque abre popover no mobile. */
function Dica({ rotulo, children }: { rotulo: string; children: string }) {
  return (
    <>
      <span className="hidden sm:inline">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={rotulo} className="inline-flex h-6 w-6 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Info className="h-4 w-4" aria-hidden /></button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{children}</TooltipContent>
        </Tooltip>
      </span>
      <span className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={rotulo} className="inline-flex h-11 w-11 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Info className="h-4 w-4" aria-hidden /></button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs text-sm">{children}</PopoverContent>
        </Popover>
      </span>
    </>
  );
}
function Selo({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium">{children}</span>;
}

function GateContrato({ id, ctx }: { id: string; ctx: Ctx }) {
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
          <Aviso icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />} mensagem={MENSAGENS_V108.negado} />
        ) : tipo === "nao_encontrado" ? (
          <Aviso icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} mensagem={MENSAGENS_V108.naoEncontrado} />
        ) : (
          <Alerta mensagem={tipo === "consistencia" ? MENSAGENS_V108.consistencia : MENSAGENS_V108.erro} onRetry={() => void consulta.refetch()} />
        )}
      </>
    );
  }
  const c = consulta.data;
  if (!c || uuidCanonico(c.id) !== id) return <><Titulo /><Carregando texto={MENSAGENS_V108.carregando} /></>;
  return <Pagina c={c} ctx={ctx} />;
}

function NavSecoes({ id }: { id: string }) {
  const link = "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
      <ul className="flex flex-wrap gap-2">
        <li><Link to="/contratos/$id" params={{ id }} className={link}>Visão geral</Link></li>
        <li><Link to="/contratos/$id/base-normativa" params={{ id }} className={link}>Base normativa</Link></li>
        <li><span aria-current="page" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Orçamento</span></li>
        {SECOES_FUTURAS.map((s) => (
          <li key={s}>
            <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm text-muted-foreground">
              <span>{s}</span>
              <span className="rounded border border-border px-1.5 text-[0.65rem] uppercase tracking-wide">Em breve</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type Dialogo =
  | { tipo: "proposta"; proposta: Proposta | null }
  | { tipo: "versao" }
  | { tipo: "rubrica"; rubrica: Rubrica | null }
  | { tipo: "remover"; rubrica: Rubrica }
  | { tipo: "publicar" }
  | null;

function Paginador({ rotulo, pagina, total, onMudar }: { rotulo: string; pagina: number; total: number; onMudar: (p: number) => void }) {
  const ultima = Math.max(0, Math.ceil(total / PAGINA_ORC) - 1);
  if (total <= PAGINA_ORC) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button type="button" variant="outline" className="h-11" disabled={pagina === 0} onClick={() => onMudar(pagina - 1)} aria-label={`Página anterior de ${rotulo}`}>Anterior</Button>
      <span aria-live="polite">Página {pagina + 1} de {ultima + 1}</span>
      <Button type="button" variant="outline" className="h-11" disabled={pagina >= ultima} onClick={() => onMudar(pagina + 1)} aria-label={`Próxima página de ${rotulo}`}>Próxima</Button>
    </div>
  );
}

function Pagina({ c, ctx }: { c: ContratoDetalhe; ctx: Ctx }) {
  const org = c.id_organizacao;
  const qc = useQueryClient();
  const base = ["orcamento", ctx.idUsuario, org, c.id] as const;
  const [pagVersoes, setPagVersoes] = useState(0);
  const [pagRubricas, setPagRubricas] = useState(0);
  const [idVersaoSel, setIdVersaoSel] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [sucesso, setSucesso] = useState("");
  const gatilho = useRef<HTMLElement | null>(null);

  const propostas = useQuery({ queryKey: [...base, "propostas"], queryFn: ({ signal }) => listarPropostas(c.id, 0, signal), retry: false });
  const proposta = propostas.data?.itens[0] ?? null;
  const versoes = useQuery({
    queryKey: [...base, "versoes", proposta?.id, pagVersoes],
    queryFn: ({ signal }) => listarVersoesProposta(proposta!.id, pagVersoes, signal),
    enabled: !!proposta,
    retry: false,
  });
  const listaV = useMemo(() => versoes.data?.itens ?? [], [versoes.data]);
  const idsArq = useMemo(() => Array.from(new Set(listaV.map((v) => v.id_arquivo_origem).filter((x): x is string => !!x))), [listaV]);
  const arquivos = useQuery({ queryKey: [...base, "arquivos", idsArq], queryFn: ({ signal }) => obterArquivosPorIds(idsArq, signal), enabled: idsArq.length > 0, retry: false });
  const padrao = listaV.find((v) => v.situacao === "rascunho") ?? listaV.find((v) => v.situacao === "publicada") ?? listaV[0] ?? null;
  const versao = listaV.find((v) => v.id === idVersaoSel) ?? padrao;
  const rubricas = useQuery({
    queryKey: [...base, "rubricas", versao?.id, pagRubricas],
    queryFn: ({ signal }) => listarRubricas(versao!.id, pagRubricas, signal),
    enabled: !!versao,
    retry: false,
  });
  const arqDe = (v: VersaoProposta | null): ArquivoResumo | undefined => (v?.id_arquivo_origem ? arquivos.data?.find((a) => a.id === v.id_arquivo_origem) : undefined);
  const temRascunho = listaV.some((v) => v.situacao === "rascunho");

  const abrir = (d: Dialogo) => (e: { currentTarget: HTMLElement }) => {
    gatilho.current = e.currentTarget;
    setDialogo(d);
  };
  const recarregar = () => void qc.invalidateQueries({ queryKey: base });
  const concluido = (msg: string, protocolo: string | null) => {
    setDialogo(null);
    setSucesso(protocolo ? `${msg} Protocolo: ${protocolo}` : msg);
    recarregar();
  };

  if (propostas.isError) {
    const negado = tipoErro(propostas.error) === "negado";
    return (
      <>
        <Titulo numero={c.numero ?? undefined} />
        <NavSecoes id={c.id} />
        <Alerta mensagem={negado ? MENSAGENS_V108.negadoLista : MENSAGENS_V108.erroLista} onRetry={() => void propostas.refetch()} />
      </>
    );
  }

  const editavel = versao?.situacao === "rascunho";
  const arqVersao = arqDe(versao);
  const docAprovado = arqVersao?.status_seguranca === "aprovado";
  const qtdRubricas = Math.max(rubricas.data?.total ?? 0, rubricas.data?.itens.length ?? 0);

  return (
    <>
      <Titulo numero={c.numero ?? undefined} />
      <NavSecoes id={c.id} />
      <div aria-live="polite">{sucesso ? <p role="status" className="rounded-lg border border-border bg-card p-3 text-sm">{sucesso}</p> : null}</div>

      {propostas.isPending ? (
        <Carregando texto={MENSAGENS_V108.carregandoOrc} />
      ) : !proposta ? (
        <section aria-labelledby="orc-vazio" className="rounded-xl border border-border bg-card p-6">
          <h2 id="orc-vazio" className="text-lg font-semibold">Proposta orçamentária</h2>
          <p className="mt-2 text-sm text-muted-foreground">{MENSAGENS_V108.vazio}</p>
          <Button type="button" className="mt-4 h-11" onClick={abrir({ tipo: "proposta", proposta: null })}>Criar proposta</Button>
        </section>
      ) : (
        <>
          <section aria-labelledby="orc-resumo" className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="orc-resumo" className="break-words text-lg font-semibold">{proposta.titulo}</h2>
                <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                  <div><dt className="text-muted-foreground">Situação oficial</dt><dd><Selo>{ROTULO_SITUACAO_PROPOSTA[proposta.situacao] ?? proposta.situacao}</Selo></dd></div>
                  <div>
                    <dt className="flex items-center gap-1 text-muted-foreground">Versão atual <Dica rotulo="Sobre versão atual">Número da versão publicada vigente, definido pelo servidor.</Dica></dt>
                    <dd>{proposta.versao_atual ?? "Nenhuma publicada"}</dd>
                  </div>
                  <div><dt className="text-muted-foreground">Atualizada em</dt><dd>{formatarDataHoraBr(proposta.atualizado_em)}</dd></div>
                </dl>
              </div>
              <Button type="button" variant="outline" className="h-11" onClick={abrir({ tipo: "proposta", proposta })}>Editar título</Button>
            </div>
          </section>

          <section aria-labelledby="orc-versoes" className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="orc-versoes" className="text-lg font-semibold">Versões</h2>
              {!versoes.isPending && !versoes.isError ? (
                temRascunho ? <p className="text-sm text-muted-foreground">{MENSAGENS_V108.rascunhoExistente}</p> : <Button type="button" className="h-11" onClick={abrir({ tipo: "versao" })}>Nova versão</Button>
              ) : null}
            </div>
            {versoes.isPending ? <Carregando texto="Carregando versões…" /> : versoes.isError ? (
              <Alerta mensagem={tipoErro(versoes.error) === "negado" ? MENSAGENS_V108.negadoLista : MENSAGENS_V108.erroLista} onRetry={() => void versoes.refetch()} />
            ) : listaV.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{MENSAGENS_V108.semVersoes}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {listaV.map((v) => {
                  const a = arqDe(v);
                  const sel = v.id === versao?.id;
                  return (
                    <li key={v.id} className={`rounded-lg border p-3 ${sel ? "border-primary" : "border-border"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 space-y-1 text-sm">
                          <p className="font-medium">Versão {v.numero_versao} <Selo>{ROTULO_SITUACAO_VERSAO[v.situacao] ?? v.situacao}</Selo>{sel ? <span className="ml-2 text-xs text-muted-foreground">(selecionada)</span> : null}</p>
                          <p>Vigência: {formatarDataBr(v.vigencia_inicio)} a {v.vigencia_fim ? formatarDataBr(v.vigencia_fim) : "sem término"}</p>
                          <p>Valor total: {formatarBrl(v.valor_total)}</p>
                          <p className="break-words">Documento-base: {a ? `${a.nome_original} — ${ROTULO_STATUS_ARQUIVO[a.status_seguranca] ?? a.status_seguranca}` : arquivos.isPending && v.id_arquivo_origem ? "carregando…" : "—"}</p>
                          {v.aprovado_em ? <p>Publicada em {formatarDataHoraBr(v.aprovado_em)}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!sel ? <Button type="button" variant="outline" className="h-11" onClick={() => { setIdVersaoSel(v.id); setPagRubricas(0); }}>{`Ver rubricas da versão ${v.numero_versao}`}</Button> : null}
                          {a ? <BotaoDownload idArquivo={a.id} rotulo={`Baixar documento-base da versão ${v.numero_versao}`} /> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Paginador rotulo="versões" pagina={pagVersoes} total={versoes.data?.total ?? 0} onMudar={setPagVersoes} />
          </section>

          {versao ? (
            <section aria-labelledby="orc-rubricas" className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="orc-rubricas" className="text-lg font-semibold">Rubricas da versão {versao.numero_versao}</h2>
                {editavel ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="h-11" onClick={abrir({ tipo: "rubrica", rubrica: null })}>Nova rubrica</Button>
                    <Button type="button" className="h-11" disabled={!docAprovado || qtdRubricas === 0 || !versao.hash} onClick={abrir({ tipo: "publicar" })}>Publicar versão</Button>
                  </div>
                ) : <p className="text-sm text-muted-foreground">Versão {ROTULO_SITUACAO_VERSAO[versao.situacao]?.toLowerCase() ?? versao.situacao}: somente leitura.</p>}
              </div>
              {editavel ? (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {!docAprovado ? <p>{MENSAGENS_V108.docNaoAprovado}</p> : null}
                  {rubricas.isSuccess && qtdRubricas === 0 ? <p>{MENSAGENS_V108.semRubricaPublicar}</p> : null}
                  {!versao.hash ? <p>{MENSAGENS_V108.semHash}</p> : null}
                </div>
              ) : null}
              {rubricas.isPending ? <Carregando texto="Carregando rubricas…" /> : rubricas.isError ? (
                <Alerta mensagem={tipoErro(rubricas.error) === "negado" ? MENSAGENS_V108.negadoLista : MENSAGENS_V108.erroLista} onRetry={() => void rubricas.refetch()} />
              ) : rubricas.data.itens.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{MENSAGENS_V108.semRubricas}</p>
              ) : (
                <TabelaRubricas itens={rubricas.data.itens} editavel={editavel} onEditar={(r) => abrir({ tipo: "rubrica", rubrica: r })} onRemover={(r) => abrir({ tipo: "remover", rubrica: r })} />
              )}
              <Paginador rotulo="rubricas" pagina={pagRubricas} total={rubricas.data?.total ?? 0} onMudar={setPagRubricas} />
            </section>
          ) : null}
        </>
      )}

      <Dialog open={dialogo !== null} onOpenChange={(o) => { if (!o) setDialogo(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" onCloseAutoFocus={devolverFoco(gatilho)}>
          {dialogo?.tipo === "proposta" ? (
            <FormProposta org={org} contrato={c.id} proposta={dialogo.proposta} onOk={(p) => concluido("Proposta salva.", p)} onRecarregar={recarregar} />
          ) : dialogo?.tipo === "versao" && proposta ? (
            <FormVersao org={org} contrato={c.id} proposta={proposta} onOk={(p) => concluido("Versão registrada em rascunho.", p)} onRecarregar={recarregar} />
          ) : dialogo?.tipo === "rubrica" && versao ? (
            <FormRubrica org={org} versao={versao} rubrica={dialogo.rubrica} onOk={(p) => concluido("Rubrica salva.", p)} onRecarregar={recarregar} />
          ) : dialogo?.tipo === "remover" && versao ? (
            <ConfirmarRemocao org={org} versao={versao} rubrica={dialogo.rubrica} onCancelar={() => setDialogo(null)} onOk={(p) => concluido("Rubrica removida.", p)} onRecarregar={recarregar} />
          ) : dialogo?.tipo === "publicar" && versao ? (
            <FormPublicar org={org} versao={versao} arquivo={arqVersao} qtdRubricas={qtdRubricas} somaPagina={(rubricas.data?.itens ?? []).reduce((s, r) => s + (r.valor_anual_previsto ?? 0), 0)} onOk={(p) => concluido("Versão publicada.", p)} onRecarregar={recarregar} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function TabelaRubricas({ itens, editavel, onEditar, onRemover }: { itens: Rubrica[]; editavel: boolean; onEditar: (r: Rubrica) => (e: { currentTarget: HTMLElement }) => void; onRemover: (r: Rubrica) => (e: { currentTarget: HTMLElement }) => void }) {
  const acoes = (r: Rubrica) => editavel ? (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="h-11" aria-label={`Editar rubrica ${r.rubrica ?? ""}`} onClick={onEditar(r)}>Editar</Button>
      <Button type="button" variant="outline" className="h-11" aria-label={`Remover rubrica ${r.rubrica ?? ""}`} onClick={onRemover(r)}>Remover</Button>
    </div>
  ) : null;
  const remanej = (r: Rubrica) => (r.permite_remanejamento ? "Sim" : "Não");
  return (
    <>
      <div className="mt-3 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Rubricas da versão selecionada</caption>
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="p-2">Grupo</th><th scope="col" className="p-2">Rubrica</th><th scope="col" className="p-2">Subrubrica</th><th scope="col" className="p-2">Código</th>
              <th scope="col" className="p-2 text-right">Mensal previsto</th><th scope="col" className="p-2 text-right">Anual previsto</th>
              <th scope="col" className="p-2">Remanejamento</th><th scope="col" className="p-2">Limite</th><th scope="col" className="p-2">Observações</th>
              {editavel ? <th scope="col" className="p-2">Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {itens.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-2">{r.grupo ?? "—"}</td><td className="p-2">{r.rubrica ?? "—"}</td><td className="p-2">{r.subrubrica ?? "—"}</td><td className="p-2">{r.codigo ?? "—"}</td>
                <td className="p-2 text-right">{formatarBrl(r.valor_mensal_previsto)}</td><td className="p-2 text-right">{formatarBrl(r.valor_anual_previsto)}</td>
                <td className="p-2">{remanej(r)}</td><td className="p-2">{r.permite_remanejamento ? pct(r.limite_remanejamento_percentual) : "—"}</td>
                <td className="max-w-[16rem] break-words p-2">{r.observacoes ?? "—"}</td>
                {editavel ? <td className="p-2">{acoes(r)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 space-y-2 md:hidden">
        {itens.map((r) => (
          <li key={r.id} className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium break-words">{r.grupo ?? "—"} › {r.rubrica ?? "—"}{r.subrubrica ? ` › ${r.subrubrica}` : ""}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">Código</dt><dd>{r.codigo ?? "—"}</dd>
              <dt className="text-muted-foreground">Mensal previsto</dt><dd>{formatarBrl(r.valor_mensal_previsto)}</dd>
              <dt className="text-muted-foreground">Anual previsto</dt><dd>{formatarBrl(r.valor_anual_previsto)}</dd>
              <dt className="text-muted-foreground">Remanejamento</dt><dd>{remanej(r)}</dd>
              <dt className="text-muted-foreground">Limite</dt><dd>{r.permite_remanejamento ? pct(r.limite_remanejamento_percentual) : "—"}</dd>
              <dt className="text-muted-foreground">Observações</dt><dd className="break-words">{r.observacoes ?? "—"}</dd>
            </dl>
            <div className="mt-2">{acoes(r)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Envio com chave idempotente: retry de transporte preserva; PT409 nunca reenvia sozinho. */
function useEnvio<N extends NomeV108>(nome: N) {
  const chave = useRef(criarGerenciadorChave());
  const [estado, setEstado] = useState<{ salvando: boolean; erro: TipoErroBn | null }>({ salvando: false, erro: null });
  const enviar = async (args: Omit<ArgsRpcV108<N>, "p_chave_idempotencia">, onOk: (p: string | null) => void) => {
    if (estado.salvando) return;
    setEstado({ salvando: true, erro: null });
    try {
      const r = await chamarV108(nome, { ...args, p_chave_idempotencia: chave.current(args) } as ArgsRpcV108<N>);
      onOk(r.correlationId);
    } catch (e) {
      setEstado({ salvando: false, erro: tipoErro(e) });
      return;
    }
    setEstado({ salvando: false, erro: null });
  };
  return { ...estado, enviar };
}
function ErroAcao({ erro, onRecarregar }: { erro: TipoErroBn | null; onRecarregar: () => void }) {
  if (!erro) return null;
  return (
    <div role="alert" className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <p>{MSG_ERRO_ACAO[erro]}</p>
      {erro === "conflito" || erro === "obsoleto" ? <Button type="button" variant="outline" className="h-11" onClick={onRecarregar}>Recarregar</Button> : null}
    </div>
  );
}

function FormProposta({ org, contrato, proposta, onOk, onRecarregar }: { org: string; contrato: string; proposta: Proposta | null; onOk: (p: string | null) => void; onRecarregar: () => void }) {
  const [titulo, setTitulo] = useState(proposta?.titulo ?? "");
  const [erroCampo, setErroCampo] = useState(false);
  const e = useEnvio("salvar_proposta_orcamentaria_v108");
  return (
    <form noValidate onSubmit={(ev) => {
      ev.preventDefault();
      if (!titulo.trim()) return void setErroCampo(true);
      setErroCampo(false);
      void e.enviar({ p_id_organizacao: org, p_id_contrato: contrato, p_id_proposta: proposta?.id ?? null, p_titulo: titulo.trim(), p_versao_esperada: proposta?.versao_registro ?? null }, onOk);
    }}>
      <DialogHeader>
        <DialogTitle>{proposta ? "Editar proposta" : "Criar proposta"}</DialogTitle>
        <DialogDescription>A proposta nasce em rascunho; a situação oficial é definida pelo servidor.</DialogDescription>
      </DialogHeader>
      <div className="my-4 space-y-3">
        <label className="block text-sm font-medium">Título da proposta
          <input className={campo} value={titulo} maxLength={300} aria-invalid={erroCampo} aria-describedby={erroCampo ? "erro-titulo" : undefined} onChange={(x) => setTitulo(x.target.value)} />
        </label>
        {erroCampo ? <p id="erro-titulo" className="text-sm text-destructive">Informe o título.</p> : null}
        <ErroAcao erro={e.erro} onRecarregar={onRecarregar} />
      </div>
      <DialogFooter><Button type="submit" className="h-11" disabled={e.salvando} aria-busy={e.salvando}>{e.salvando ? "Salvando…" : "Salvar proposta"}</Button></DialogFooter>
    </form>
  );
}

function FormVersao({ org, contrato, proposta, onOk, onRecarregar }: { org: string; contrato: string; proposta: Proposta; onOk: (p: string | null) => void; onRecarregar: () => void }) {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [arq, setArq] = useState("");
  const [erroCampo, setErroCampo] = useState("");
  const qc = useQueryClient();
  const docs = useQuery({ queryKey: ["orcamento", "docs", org, contrato], queryFn: ({ signal }) => listarArquivos(org, contrato, 0, signal), retry: false });
  const e = useEnvio("registrar_versao_proposta_v108");
  return (
    <form noValidate onSubmit={(ev) => {
      ev.preventDefault();
      if (!inicio || !arq) return void setErroCampo("Informe o início da vigência e o documento-base.");
      if (fim && fim < inicio) return void setErroCampo("O fim da vigência não pode ser anterior ao início.");
      setErroCampo("");
      void e.enviar({ p_id_organizacao: org, p_id_proposta: proposta.id, p_vigencia_inicio: inicio, p_vigencia_fim: fim || null, p_id_arquivo_origem: arq }, onOk);
    }}>
      <DialogHeader>
        <DialogTitle>Nova versão</DialogTitle>
        <DialogDescription>A versão nasce em rascunho; a numeração é atribuída pelo servidor. O documento pode estar pendente agora, mas a publicação exige aprovação de segurança.</DialogDescription>
      </DialogHeader>
      <div className="my-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">Início da vigência<input type="date" className={campo} value={inicio} onChange={(x) => setInicio(x.target.value)} /></label>
          <label className="block text-sm font-medium">Fim da vigência (opcional)<input type="date" className={campo} value={fim} onChange={(x) => setFim(x.target.value)} /></label>
        </div>
        <label className="block text-sm font-medium">Documento-base
          <select className={campo} value={arq} onChange={(x) => setArq(x.target.value)}>
            <option value="">{docs.isPending ? "Carregando documentos…" : "Selecione um documento do contrato"}</option>
            {(docs.data?.itens ?? []).map((a) => <option key={a.id} value={a.id}>{`${a.nome_original} — ${ROTULO_STATUS_ARQUIVO[a.status_seguranca] ?? a.status_seguranca}`}</option>)}
          </select>
        </label>
        {docs.isError ? <p role="alert" className="text-sm text-destructive">{MENSAGENS_V108.erroLista}</p> : null}
        <EnvioArquivo org={org} contrato={contrato} onEnviado={() => void qc.invalidateQueries({ queryKey: ["orcamento", "docs", org, contrato] })} />
        {erroCampo ? <p role="alert" className="text-sm text-destructive">{erroCampo}</p> : null}
        <ErroAcao erro={e.erro} onRecarregar={onRecarregar} />
      </div>
      <DialogFooter><Button type="submit" className="h-11" disabled={e.salvando} aria-busy={e.salvando}>{e.salvando ? "Registrando…" : "Registrar versão"}</Button></DialogFooter>
    </form>
  );
}

function FormRubrica({ org, versao, rubrica, onOk, onRecarregar }: { org: string; versao: VersaoProposta; rubrica: Rubrica | null; onOk: (p: string | null) => void; onRecarregar: () => void }) {
  const [f, setF] = useState({
    codigo: rubrica?.codigo ?? "", grupo: rubrica?.grupo ?? "", rubrica: rubrica?.rubrica ?? "", subrubrica: rubrica?.subrubrica ?? "", descricao: rubrica?.descricao ?? "",
    mensal: valorParaCampo(rubrica?.valor_mensal_previsto), anual: valorParaCampo(rubrica?.valor_anual_previsto), permite: rubrica?.permite_remanejamento ?? false,
    limite: rubrica?.limite_remanejamento_percentual === null || rubrica?.limite_remanejamento_percentual === undefined ? "" : String(rubrica.limite_remanejamento_percentual).replace(".", ","),
    observacoes: rubrica?.observacoes ?? "",
  });
  const [erroCampo, setErroCampo] = useState("");
  const e = useEnvio("salvar_linha_orcamentaria_v108");
  const set = (k: keyof typeof f) => (x: { target: { value: string } }) => setF((o) => ({ ...o, [k]: x.target.value }));
  return (
    <form noValidate onSubmit={(ev) => {
      ev.preventDefault();
      const mensal = lerValorBr(f.mensal);
      const anual = lerValorBr(f.anual);
      const limite = f.permite ? lerValorBr(f.limite) : null;
      if (!f.grupo.trim() || !f.rubrica.trim()) return void setErroCampo("Informe grupo e rubrica.");
      if ([mensal, anual, limite].some((v) => v !== null && Number.isNaN(v))) return void setErroCampo("Use valores no formato 1.234,56.");
      if (limite !== null && (limite < 0 || limite > 100)) return void setErroCampo("O limite de remanejamento deve estar entre 0 e 100%.");
      setErroCampo("");
      void e.enviar({
        p_id_organizacao: org, p_id_versao_proposta: versao.id, p_id_linha: rubrica?.id ?? null, p_codigo: vazio(f.codigo), p_grupo: f.grupo.trim(), p_rubrica: f.rubrica.trim(), p_subrubrica: vazio(f.subrubrica),
        p_descricao: vazio(f.descricao), p_valor_mensal: mensal, p_valor_anual: anual, p_permite_remanejamento: f.permite, p_limite_remanejamento_percentual: limite, p_observacoes: vazio(f.observacoes),
        p_versao_esperada: rubrica?.versao_registro ?? null,
      }, onOk);
    }}>
      <DialogHeader>
        <DialogTitle>{rubrica ? "Editar rubrica" : "Nova rubrica"}</DialogTitle>
        <DialogDescription>Rubricas só podem ser alteradas enquanto a versão estiver em rascunho.</DialogDescription>
      </DialogHeader>
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">Grupo<input className={campo} value={f.grupo} onChange={set("grupo")} /></label>
        <label className="block text-sm font-medium">Rubrica<input className={campo} value={f.rubrica} onChange={set("rubrica")} /></label>
        <label className="block text-sm font-medium">Subrubrica (opcional)<input className={campo} value={f.subrubrica} onChange={set("subrubrica")} /></label>
        <label className="block text-sm font-medium">Código (opcional)<input className={campo} value={f.codigo} aria-describedby="ajuda-codigo" onChange={set("codigo")} /><span id="ajuda-codigo" className="mt-1 block text-xs font-normal text-muted-foreground">Se vazio, o servidor gera um código RUB-*.</span></label>
        <label className="block text-sm font-medium">Valor mensal previsto (R$)<input inputMode="decimal" className={campo} value={f.mensal} placeholder="0,00" onChange={set("mensal")} /></label>
        <label className="block text-sm font-medium">Valor anual previsto (R$)<input inputMode="decimal" className={campo} value={f.anual} placeholder="0,00" onChange={set("anual")} /></label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={f.permite} onChange={(x) => setF((o) => ({ ...o, permite: x.target.checked }))} /> Permite remanejamento</label>
        {f.permite ? (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Limite de remanejamento (%)<input inputMode="decimal" className={campo} value={f.limite} placeholder="0 a 100" onChange={set("limite")} /></label>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">Percentual máximo do valor que pode ser remanejado. <Dica rotulo="Sobre limite de remanejamento">Percentual de 0 a 100 aplicado sobre o valor previsto da rubrica; a validação final é do servidor.</Dica></p>
          </div>
        ) : null}
        <label className="block text-sm font-medium sm:col-span-2">Descrição (opcional)<textarea className={`${campo} py-2`} rows={2} value={f.descricao} onChange={set("descricao")} /></label>
        <label className="block text-sm font-medium sm:col-span-2">Observações (opcional)<textarea className={`${campo} py-2`} rows={2} value={f.observacoes} onChange={set("observacoes")} /></label>
        {erroCampo ? <p role="alert" className="text-sm text-destructive sm:col-span-2">{erroCampo}</p> : null}
        <div className="sm:col-span-2"><ErroAcao erro={e.erro} onRecarregar={onRecarregar} /></div>
      </div>
      <DialogFooter><Button type="submit" className="h-11" disabled={e.salvando} aria-busy={e.salvando}>{e.salvando ? "Salvando…" : "Salvar rubrica"}</Button></DialogFooter>
    </form>
  );
}

function ConfirmarRemocao({ org, versao, rubrica, onCancelar, onOk, onRecarregar }: { org: string; versao: VersaoProposta; rubrica: Rubrica; onCancelar: () => void; onOk: (p: string | null) => void; onRecarregar: () => void }) {
  const e = useEnvio("remover_linha_orcamentaria_v108");
  return (
    <>
      <DialogHeader>
        <DialogTitle>Remover rubrica</DialogTitle>
        <DialogDescription>{`Remover “${rubrica.rubrica ?? ""}” da versão ${versao.numero_versao} em rascunho?`}</DialogDescription>
      </DialogHeader>
      <ErroAcao erro={e.erro} onRecarregar={onRecarregar} />
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onCancelar}>Cancelar</Button>
        <Button type="button" variant="destructive" className="h-11" disabled={e.salvando} aria-busy={e.salvando} onClick={() => void e.enviar({ p_id_organizacao: org, p_id_versao_proposta: versao.id, p_id_linha: rubrica.id, p_versao_esperada: rubrica.versao_registro }, onOk)}>Confirmar remoção</Button>
      </DialogFooter>
    </>
  );
}

function FormPublicar({ org, versao, arquivo, qtdRubricas, somaPagina, onOk, onRecarregar }: { org: string; versao: VersaoProposta; arquivo: ArquivoResumo | undefined; qtdRubricas: number; somaPagina: number; onOk: (p: string | null) => void; onRecarregar: () => void }) {
  const [fundamento, setFundamento] = useState("");
  const [confirmo, setConfirmo] = useState(false);
  const e = useEnvio("publicar_versao_proposta_v108");
  const hash = versao.hash ?? "";
  return (
    <form noValidate onSubmit={(ev) => {
      ev.preventDefault();
      if (!fundamento.trim() || !confirmo || !hash) return;
      void e.enviar({ p_id_organizacao: org, p_id_versao: versao.id, p_hash_esperado: hash, p_fundamento: fundamento.trim() }, onOk);
    }}>
      <DialogHeader>
        <DialogTitle>Publicar versão {versao.numero_versao}</DialogTitle>
        <DialogDescription>Após a publicação a versão e suas rubricas ficam imutáveis e a versão publicada anterior é substituída, preservando o histórico. O servidor valida todas as condições.</DialogDescription>
      </DialogHeader>
      <dl className="my-4 grid grid-cols-1 gap-2 text-sm">
        <div><dt className="flex items-center gap-1 text-muted-foreground">Hash da versão (servidor) <Dica rotulo="Sobre o hash">Identificador do conteúdo atual da versão, calculado pelo servidor. Se a versão mudar, a publicação é recusada.</Dica></dt><dd className="break-all font-mono text-xs">{hash || "—"}</dd></div>
        <div><dt className="text-muted-foreground">Vigência</dt><dd>{formatarDataBr(versao.vigencia_inicio)} a {versao.vigencia_fim ? formatarDataBr(versao.vigencia_fim) : "sem término"}</dd></div>
        <div><dt className="text-muted-foreground">Documento-base</dt><dd className="break-words">{arquivo ? `${arquivo.nome_original} — ${ROTULO_STATUS_ARQUIVO[arquivo.status_seguranca] ?? arquivo.status_seguranca}` : "—"}</dd></div>
        <div><dt className="text-muted-foreground">Rubricas</dt><dd>{qtdRubricas}</dd></div>
        <div><dt className="text-muted-foreground">Soma anual exibida nesta página (informativa)</dt><dd>{formatarBrl(somaPagina)}</dd></div>
      </dl>
      <label className="block text-sm font-medium">Fundamento da publicação
        <textarea className={`${campo} py-2`} rows={3} value={fundamento} onChange={(x) => setFundamento(x.target.value)} />
      </label>
      <label className="mt-3 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={confirmo} onChange={(x) => setConfirmo(x.target.checked)} /> Confirmo que revisei a versão e desejo publicá-la.</label>
      <div className="mt-3"><ErroAcao erro={e.erro} onRecarregar={onRecarregar} /></div>
      <DialogFooter className="mt-4"><Button type="submit" className="h-11" disabled={!fundamento.trim() || !confirmo || !hash || e.salvando} aria-busy={e.salvando}>{e.salvando ? "Publicando…" : "Confirmar publicação"}</Button></DialogFooter>
    </form>
  );
}

function EnvioArquivo({ org, contrato, onEnviado }: { org: string; contrato: string; onEnviado: () => void }) {
  const [sel, setSel] = useState<File | null>(null);
  const [estado, setEstado] = useState<"ocioso" | "enviando" | "enviado" | "erro" | "resumivel">("ocioso");
  const enviar = async () => {
    if (!sel || estado === "enviando") return;
    setEstado("enviando");
    try {
      await enviarArquivo(org, contrato, sel);
      setEstado("enviado");
      onEnviado();
    } catch (e) {
      setEstado(e instanceof ErroBn && e.tipo === "resumivel" ? "resumivel" : "erro");
    }
  };
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <label className="block text-sm">Enviar novo documento-base<input type="file" className="mt-1 block w-full text-sm" onChange={(x) => { setSel(x.target.files?.[0] ?? null); setEstado("ocioso"); }} /></label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="h-11" disabled={!sel || estado === "enviando"} onClick={() => void enviar()}>{estado === "enviando" ? "Enviando…" : "Enviar arquivo"}</Button>
        {estado === "enviado" ? <Button type="button" variant="outline" className="h-11" onClick={onEnviado}>Atualizar lista</Button> : null}
      </div>
      <div aria-live="polite" className="text-sm">
        {estado === "enviado" ? <p>{MENSAGENS_V108.enviado}</p> : null}
        {estado === "erro" ? <p role="alert" className="text-destructive">{MENSAGENS_V108.erroEnvio}</p> : null}
        {estado === "resumivel" ? <p role="alert" className="text-destructive">{MENSAGENS_V108.resumivel}</p> : null}
      </div>
    </div>
  );
}

function BotaoDownload({ idArquivo, rotulo }: { idArquivo: string; rotulo: string }) {
  const [estado, setEstado] = useState<"ocioso" | "baixando" | "erro">("ocioso");
  return (
    <>
      <Button type="button" variant="outline" className="h-11" disabled={estado === "baixando"} onClick={() => {
        setEstado("baixando");
        baixarArquivo(idArquivo).then(() => setEstado("ocioso"), () => setEstado("erro"));
      }}>{rotulo}</Button>
      {estado === "erro" ? <p role="alert" className="w-full text-sm text-destructive">{MENSAGENS_V108.erroDownload}</p> : null}
    </>
  );
}

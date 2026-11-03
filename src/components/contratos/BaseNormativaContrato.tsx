import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Building2, Loader2, RefreshCw, SearchX, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { ErroDetalhe, formatarDataBr, obterContrato, texto, uuidCanonico, uuidValido, type ContratoDetalhe } from "@/lib/contratos/contratoDetalheDados";
import {
  ErroBn, PAGINA_BN, LIMITE_TEXTO, SITUACOES_FONTE, baixarArquivo, chamarV107, enviarArquivo, formatarDataHoraBr, listarAplicabilidades, listarArquivos, listarFontes, listarVersoes,
  obterTextoVersao, rotuloAplicabilidade, type Aplicabilidade, type Escopo, type Fonte, type TipoErroBn, type Versao,
} from "@/lib/contratos/baseNormativaDados";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";

export const MENSAGENS_V107 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  carregandoLista: "Carregando fontes normativas…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia: "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  erroLista: "Não foi possível carregar a base normativa agora. Tente novamente em instantes.",
  negadoLista: "Você não tem acesso à base normativa deste contrato.",
  vazio: "Nenhuma fonte normativa encontrada para os filtros selecionados.",
  semVersoes: "Esta fonte ainda não possui versões registradas.",
  conflito: "Este registro foi alterado por outra pessoa. Recarregue e revise antes de salvar novamente.",
  validacao: "Os dados informados não foram aceitos. Revise os campos e tente novamente.",
  obsoleto: "Este registro não está mais disponível. Recarregue a página.",
  semPermissao: "Você não tem permissão para esta ação.",
  erroAcao: "Não foi possível concluir a ação agora. Tente novamente em instantes.",
  erroEnvio: "Não foi possível enviar o arquivo agora. Tente novamente em instantes.",
  resumivel: "Upload retomável não está disponível nesta tela.",
  enviado: "Arquivo enviado e em análise de segurança. Ele só poderá ser anexado após aprovação; use “Atualizar status”.",
  erroDownload: "Não foi possível baixar o arquivo agora. Tente novamente em instantes.",
} as const;

const SECOES_FUTURAS = ["Regras", "Documentos", "Competências"] as const;
const MSG_ERRO_ACAO: Record<TipoErroBn, string> = {
  conflito: MENSAGENS_V107.conflito, validacao: MENSAGENS_V107.validacao, obsoleto: MENSAGENS_V107.obsoleto, negado: MENSAGENS_V107.semPermissao, erro: MENSAGENS_V107.erroAcao, resumivel: MENSAGENS_V107.resumivel,
};
const tipoErro = (e: unknown): TipoErroBn => (e instanceof ErroBn ? e.tipo : "erro");
const novaChave = () => crypto.randomUUID();
type Retorno = RefObject<HTMLElement | null>;
/** Devolve o foco ao gatilho (diálogos abertos por estado, não por Trigger). */
const devolverFoco = (ref: Retorno) => (e: Event) => {
  e.preventDefault();
  ref.current?.focus();
};
const campo = "mt-1 block min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Ctx = { idUsuario: string; idOrganizacao: string };

export function BaseNormativaContrato({ id }: { id: string }) {
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ContaOSMarca />
          </div>
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
          <><Titulo /><Alerta mensagem={MENSAGENS_V107.erroSessao} onRetry={() => setTentativa((n) => n + 1)} /></>
        ) : !ctx ? (
          <><Titulo /><Carregando texto={MENSAGENS_V107.verificando} /></>
        ) : !idOk ? (
          <><Titulo /><Aviso icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} mensagem={MENSAGENS_V107.naoEncontrado} /></>
        ) : (
          <GateContrato key={`${ctx.idUsuario}:${ctx.idOrganizacao}:${idC}`} id={idC} ctx={ctx} />
        )}
      </main>
    </div>
  );
}

function Titulo({ numero }: { numero?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{numero ? `Contrato ${numero}` : "Gestão contratual"}</p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">Base normativa</h1>
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
          <Aviso icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />} mensagem={MENSAGENS_V107.negado} />
        ) : tipo === "nao_encontrado" ? (
          <Aviso icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} mensagem={MENSAGENS_V107.naoEncontrado} />
        ) : (
          <Alerta mensagem={tipo === "consistencia" ? MENSAGENS_V107.consistencia : MENSAGENS_V107.erro} onRetry={() => void consulta.refetch()} />
        )}
      </>
    );
  }
  const c = consulta.data;
  if (!c || uuidCanonico(c.id) !== id) return <><Titulo /><Carregando texto={MENSAGENS_V107.carregando} /></>;
  return <Pagina c={c} ctx={ctx} />;
}

function NavSecoes({ id }: { id: string }) {
  return (
    <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link to="/contratos/$id" params={{ id }} className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Visão geral</Link>
        </li>
        <li>
          <span aria-current="page" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Base normativa</span>
        </li>
        <li>
          <Link
            to="/contratos/$id/orcamento"
            params={{ id: id }}
            className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Orçamento
          </Link>
        </li>
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

type Dialogo = { tipo: "fonte"; fonte: Fonte | null } | null;

function Pagina({ c, ctx }: { c: ContratoDetalhe; ctx: Ctx }) {
  const org = c.id_organizacao;
  const [escopo, setEscopo] = useState<Escopo>("ambos");
  const [situacao, setSituacao] = useState("");
  const [pagina, setPagina] = useState(0);
  const [detalhe, setDetalhe] = useState<Fonte | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [sucesso, setSucesso] = useState("");
  const gatilho = useRef<HTMLElement | null>(null);
  const qc = useQueryClient();

  const lista = useQuery({
    queryKey: ["bn-fontes", ctx.idUsuario, org, c.id, escopo, situacao, pagina],
    queryFn: ({ signal }) => listarFontes({ org, contrato: c.id, escopo, situacao, pagina }, signal),
    retry: false,
  });
  const concluir = (cid: string | null) => {
    setSucesso(`Operação concluída.${cid ? ` Protocolo: ${cid}` : ""}`);
    void qc.invalidateQueries({ queryKey: ["bn-fontes"] });
    void qc.invalidateQueries({ queryKey: ["bn-versoes"] });
    void qc.invalidateQueries({ queryKey: ["bn-aplic"] });
  };
  const total = lista.data?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / PAGINA_BN));

  return (
    <>
      <Titulo numero={c.numero} />
      <NavSecoes id={c.id} />
      <p role="status" aria-live="polite" className="text-sm font-medium">{sucesso}</p>
      <section aria-labelledby="bn-fontes" className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="bn-fontes" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Fontes normativas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Fontes do contrato e globais da organização. Fonte global só se aplica a este contrato com aplicabilidade aprovada.</p>
          </div>
          <Button type="button" className="h-11" onClick={(e) => { gatilho.current = e.currentTarget; setDialogo({ tipo: "fonte", fonte: null }); }}>Nova fonte</Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-xl">
          <label className="text-sm">Escopo
            <select className={campo} value={escopo} onChange={(e) => { setEscopo(e.target.value as Escopo); setPagina(0); }}>
              <option value="ambos">Todos</option>
              <option value="contrato">Do contrato</option>
              <option value="global">Globais da organização</option>
            </select>
          </label>
          <label className="text-sm">Situação
            <select className={campo} value={situacao} onChange={(e) => { setSituacao(e.target.value); setPagina(0); }}>
              <option value="">Todas</option>
              {SITUACOES_FONTE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        {lista.isError ? (
          <Alerta mensagem={tipoErro(lista.error) === "negado" ? MENSAGENS_V107.negadoLista : MENSAGENS_V107.erroLista} onRetry={() => void lista.refetch()} />
        ) : !lista.data ? (
          <><Carregando texto={MENSAGENS_V107.carregandoLista} /><div className="space-y-2" aria-hidden>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div></>
        ) : lista.data.itens.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{MENSAGENS_V107.vazio}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {lista.data.itens.map((f) => (
              <li key={f.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-medium">{f.titulo}</p>
                  <p className="break-words text-xs text-muted-foreground">{texto(f.tipo)} · {texto(f.referencia)} · Atualizada em {formatarDataHoraBr(f.atualizado_em)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Selo>{f.id_contrato ? "Do contrato" : "Global da organização"}</Selo>
                    <Selo><span className="text-muted-foreground">Situação:</span> {f.situacao}</Selo>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="h-11" aria-label={`Detalhes de ${f.titulo}`} onClick={(e) => { gatilho.current = e.currentTarget; setDetalhe(f); }}>Detalhes</Button>
                  <Button type="button" variant="outline" className="h-11" aria-label={`Editar ${f.titulo}`} onClick={(e) => { gatilho.current = e.currentTarget; setDialogo({ tipo: "fonte", fonte: f }); }}>Editar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {lista.data && total > PAGINA_BN ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Página {pagina + 1} de {paginas} · {total} fontes</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-11" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Página anterior</Button>
              <Button type="button" variant="outline" className="h-11" disabled={pagina + 1 >= paginas} onClick={() => setPagina((p) => p + 1)}>Próxima página</Button>
            </div>
          </div>
        ) : null}
      </section>
      <p className="text-xs text-muted-foreground">
        Cadastro e edição de fontes e versões: administrador, gestor de contrato ou jurídico/conformidade. Aprovação de versão e aplicabilidade: administrador ou direção aprovadora. Mudança de situação: administrador. A permissão final é sempre verificada pelo servidor.
      </p>
      {detalhe ? <DetalheFonte retorno={gatilho} fonte={detalhe} c={c} ctx={ctx} onFechar={() => setDetalhe(null)} onConcluir={concluir} /> : null}
      {dialogo?.tipo === "fonte" ? (
        <DialogoFonte retorno={gatilho} fonte={dialogo.fonte} org={org} contrato={c.id} onFechar={() => setDialogo(null)} onConcluir={(cid) => { setDialogo(null); concluir(cid); }}
          onRecarregar={() => { setDialogo(null); void qc.invalidateQueries({ queryKey: ["bn-fontes"] }); }} />
      ) : null}
    </>
  );
}

function Selo({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">{children}</span>;
}

type DialogoV = { tipo: "versao" } | { tipo: "aprovar"; v: Versao } | { tipo: "aplic"; v: Versao; a: Aplicabilidade | undefined } | null;

function DetalheFonte({ retorno, fonte, c, ctx, onFechar, onConcluir }: { retorno: Retorno; fonte: Fonte; c: ContratoDetalhe; ctx: Ctx; onFechar: () => void; onConcluir: (cid: string | null) => void }) {
  const org = c.id_organizacao;
  const [pagina, setPagina] = useState(0);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [dlg, setDlg] = useState<DialogoV>(null);
  const gatilhoV = useRef<HTMLElement | null>(null);
  const abrir = (e: { currentTarget: HTMLElement }, d: DialogoV) => { gatilhoV.current = e.currentTarget; setDlg(d); };
  const qc = useQueryClient();
  const global = fonte.id_contrato === null;
  const versoes = useQuery({
    queryKey: ["bn-versoes", ctx.idUsuario, org, c.id, fonte.id, pagina],
    queryFn: ({ signal }) => listarVersoes(fonte.id, pagina, signal),
    retry: false,
  });
  const ids = versoes.data?.itens.map((v) => v.id) ?? [];
  const aplic = useQuery({
    queryKey: ["bn-aplic", ctx.idUsuario, org, c.id, ids],
    queryFn: ({ signal }) => listarAplicabilidades(c.id, ids, signal),
    enabled: ids.length > 0,
    retry: false,
  });
  const total = versoes.data?.total ?? 0;
  const fechar = (cid: string | null) => { setDlg(null); onConcluir(cid); };
  const recarregar = () => { setDlg(null); void qc.invalidateQueries({ queryKey: ["bn-versoes"] }); void qc.invalidateQueries({ queryKey: ["bn-aplic"] }); };

  return (
    <Sheet open onOpenChange={(o) => { if (!o) onFechar(); }}>
      <SheetContent onCloseAutoFocus={devolverFoco(retorno)} side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="break-words">{fonte.titulo}</SheetTitle>
          <SheetDescription>{global ? "Global da organização" : "Do contrato"} · Situação: {fonte.situacao}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd>{texto(fonte.tipo)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Referência</dt><dd className="break-words">{texto(fonte.referencia)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Descrição</dt><dd className="break-words">{texto(fonte.descricao)}</dd></div>
          </dl>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Versões</h3>
            <Button type="button" className="h-11" onClick={(e) => abrir(e, { tipo: "versao" })}>Nova versão</Button>
          </div>
          {versoes.isError ? (
            <Alerta mensagem={MENSAGENS_V107.erroLista} onRetry={() => void versoes.refetch()} />
          ) : !versoes.data ? (
            <Carregando texto="Carregando versões…" />
          ) : versoes.data.itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{MENSAGENS_V107.semVersoes}</p>
          ) : (
            <ul className="space-y-3">
              {versoes.data.itens.map((v) => {
                const a = aplic.data?.find((x) => x.id_fonte_versao === v.id);
                return (
                  <li key={v.id} className="space-y-2 rounded-lg border border-border p-3">
                    <p className="font-medium">Versão {v.versao}</p>
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">Vigência</dt><dd>{formatarDataBr(v.inicio_vigencia)} – {formatarDataBr(v.fim_vigencia)}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Origem</dt><dd>{v.id_arquivo ? "Arquivo vinculado" : "Texto"}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Hash (calculado pelo servidor)</dt><dd className="break-all font-mono text-xs">{v.hash}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Aprovação</dt><dd>{v.aprovado_em ? `Aprovada em ${formatarDataHoraBr(v.aprovado_em)}` : "Sem aprovação registrada"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Aplicabilidade a este contrato</dt><dd>{aplic.isError ? "Não foi possível carregar" : aplic.data ? rotuloAplicabilidade(a, global) : "Carregando…"}</dd></div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="h-11" aria-expanded={expandida === v.id} onClick={() => setExpandida((x) => (x === v.id ? null : v.id))}>
                        {expandida === v.id ? "Ocultar texto" : `Ver texto registrado (versão ${v.versao})`}
                      </Button>
                      {v.id_arquivo ? <BotaoDownload idArquivo={v.id_arquivo} versao={v.versao} /> : null}
                      <Button type="button" variant="outline" className="h-11" onClick={(e) => abrir(e, { tipo: "aprovar", v })}>Aprovar versão {v.versao}</Button>
                      <Button type="button" variant="outline" className="h-11" onClick={(e) => abrir(e, { tipo: "aplic", v, a })}>Definir aplicabilidade da versão {v.versao}</Button>
                    </div>
                    {expandida === v.id ? <TextoVersaoBloco idVersao={v.id} ctx={ctx} org={org} /> : null}
                  </li>
                );
              })}
            </ul>
          )}
          {total > PAGINA_BN ? (
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-11" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Versões anteriores</Button>
              <Button type="button" variant="outline" className="h-11" disabled={(pagina + 1) * PAGINA_BN >= total} onClick={() => setPagina((p) => p + 1)}>Próximas versões</Button>
            </div>
          ) : null}
        </div>
        {dlg?.tipo === "versao" ? <DialogoVersao retorno={gatilhoV} fonte={fonte} org={org} ctx={ctx} onFechar={() => setDlg(null)} onConcluir={fechar} onRecarregar={recarregar} /> : null}
        {dlg?.tipo === "aprovar" ? <DialogoAprovar retorno={gatilhoV} v={dlg.v} org={org} onFechar={() => setDlg(null)} onConcluir={fechar} onRecarregar={recarregar} /> : null}
        {dlg?.tipo === "aplic" ? <DialogoAplic retorno={gatilhoV} v={dlg.v} a={dlg.a} org={org} contrato={c.id} onFechar={() => setDlg(null)} onConcluir={fechar} onRecarregar={recarregar} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function TextoVersaoBloco({ idVersao, ctx, org }: { idVersao: string; ctx: Ctx; org: string }) {
  const q = useQuery({ queryKey: ["bn-texto", ctx.idUsuario, org, idVersao], queryFn: ({ signal }) => obterTextoVersao(idVersao, signal), retry: false });
  if (q.isError) return <Alerta mensagem={MENSAGENS_V107.erroLista} onRetry={() => void q.refetch()} />;
  if (!q.data) return <Carregando texto="Carregando texto…" />;
  return (
    <div className="space-y-2 rounded-md bg-muted p-3">
      <p className="text-xs font-semibold">Texto registrado (não constitui aprovação normativa)</p>
      {q.data.texto ? <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{q.data.texto}</pre> : <p className="text-xs text-muted-foreground">Sem texto registrado.</p>}
      {q.data.truncado ? <p className="text-xs text-muted-foreground">Exibição limitada a {LIMITE_TEXTO.toLocaleString("pt-BR")} caracteres.</p> : null}
      {q.data.metadados ? (
        <><p className="text-xs font-semibold">Metadados registrados</p><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs">{q.data.metadados}</pre></>
      ) : (
        <p className="text-xs text-muted-foreground">Documento, página e trecho: não informados pelo servidor para esta versão.</p>
      )}
    </div>
  );
}

// ---------- Diálogos de mutação ----------
function useAcao(onConcluir: (cid: string | null) => void) {
  const [chave, setChave] = useState(novaChave);
  const mut = useMutation({ mutationFn: (f: (k: string) => Promise<{ correlationId: string | null }>) => f(chave), onSuccess: (r) => onConcluir(r.correlationId) });
  const renovar = () => { setChave(novaChave()); mut.reset(); };
  return { mut, renovar };
}

function RodapeErro({ erro, onRecarregar }: { erro: unknown; onRecarregar: () => void }) {
  if (!erro) return null;
  const t = tipoErro(erro);
  return (
    <div role="alert" className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <p>{MSG_ERRO_ACAO[t]}</p>
      {t === "conflito" || t === "obsoleto" ? <Button type="button" variant="outline" className="h-11" onClick={onRecarregar}><RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Recarregar e revisar</Button> : null}
    </div>
  );
}

type PropsDlg = { retorno: Retorno; onFechar: () => void; onConcluir: (cid: string | null) => void; onRecarregar: () => void };

function DialogoFonte({ retorno, fonte, org, contrato, onFechar, onConcluir, onRecarregar }: PropsDlg & { fonte: Fonte | null; org: string; contrato: string }) {
  const [f, setF] = useState({ escopo: "contrato", tipo: fonte?.tipo ?? "", titulo: fonte?.titulo ?? "", referencia: fonte?.referencia ?? "", descricao: fonte?.descricao ?? "", situacao: fonte?.situacao ?? "rascunho" });
  const [faltando, setFaltando] = useState(false);
  const { mut, renovar } = useAcao(onConcluir);
  const mudar = (k: keyof typeof f, v: string) => { setF((x) => ({ ...x, [k]: v })); renovar(); };
  const salvar = () => {
    if (!f.tipo.trim() || !f.titulo.trim()) return setFaltando(true);
    setFaltando(false);
    mut.mutate((k) => chamarV107("salvar_fonte_normativa_v107", {
      p_id_organizacao: org,
      p_id_contrato: fonte ? fonte.id_contrato : f.escopo === "global" ? null : contrato,
      p_id_fonte: fonte?.id ?? null,
      p_tipo: f.tipo.trim(), p_titulo: f.titulo.trim(),
      p_referencia: f.referencia.trim() || null, p_descricao: f.descricao.trim() || null,
      p_situacao: fonte ? f.situacao : "rascunho",
      p_versao_esperada: fonte ? fonte.versao_registro : null,
      p_chave_idempotencia: k,
    }));
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DialogContent onCloseAutoFocus={devolverFoco(retorno)} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fonte ? "Editar fonte" : "Nova fonte"}</DialogTitle>
          <DialogDescription>{fonte ? "Alterações usam a versão do registro lida para evitar sobrescrita." : "Toda fonte nova é criada como rascunho."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {!fonte ? (
            <label className="block text-sm">Escopo da fonte
              <select className={campo} value={f.escopo} onChange={(e) => mudar("escopo", e.target.value)}>
                <option value="contrato">Do contrato</option>
                <option value="global">Global da organização</option>
              </select>
            </label>
          ) : null}
          <label className="block text-sm">Tipo<input className={campo} value={f.tipo} onChange={(e) => mudar("tipo", e.target.value)} /></label>
          <label className="block text-sm">Título<input className={campo} value={f.titulo} onChange={(e) => mudar("titulo", e.target.value)} /></label>
          <label className="block text-sm">Referência<input className={campo} value={f.referencia} onChange={(e) => mudar("referencia", e.target.value)} /></label>
          <label className="block text-sm">Descrição<textarea className={`${campo} min-h-20 py-2`} value={f.descricao} onChange={(e) => mudar("descricao", e.target.value)} /></label>
          {fonte ? (
            <label className="block text-sm">Situação
              <select className={campo} value={f.situacao} onChange={(e) => mudar("situacao", e.target.value)}>
                {(SITUACOES_FONTE as readonly string[]).includes(fonte.situacao) ? null : <option value={fonte.situacao}>{fonte.situacao}</option>}
                {SITUACOES_FONTE.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="mt-1 block text-xs text-muted-foreground">Mudança de situação exige administrador; ativação exige versão aprovada.</span>
            </label>
          ) : null}
          {faltando ? <p role="alert" className="text-sm text-destructive">Informe tipo e título.</p> : null}
          <RodapeErro erro={mut.error} onRecarregar={onRecarregar} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={onFechar}>Cancelar</Button>
          <Button type="button" className="h-11" disabled={mut.isPending} onClick={salvar}>{mut.isPending ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_ARQUIVO: Record<string, string> = { aprovado: "Aprovado", pendente: "Em análise de segurança", processando: "Em análise de segurança", rejeitado: "Rejeitado" };

function DialogoVersao({ retorno, fonte, org, ctx, onFechar, onConcluir, onRecarregar }: PropsDlg & { fonte: Fonte; org: string; ctx: Ctx }) {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [origem, setOrigem] = useState<"texto" | "arquivo">("texto");
  const [conteudo, setConteudo] = useState("");
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [falta, setFalta] = useState("");
  const { mut, renovar } = useAcao(onConcluir);
  const arquivos = useQuery({
    queryKey: ["bn-arquivos", ctx.idUsuario, org, fonte.id_contrato, 0],
    queryFn: ({ signal }) => listarArquivos(org, fonte.id_contrato, 0, signal),
    enabled: origem === "arquivo",
    retry: false,
  });
  const alt = <X,>(set: (v: X) => void) => (v: X) => { set(v); renovar(); };
  const registrar = () => {
    if (!inicio) return setFalta("Informe o início da vigência.");
    if (origem === "texto" && !conteudo.trim()) return setFalta("Informe o texto da versão.");
    if (origem === "arquivo" && !arquivo) return setFalta("Selecione um arquivo aprovado.");
    setFalta("");
    mut.mutate((k) => chamarV107("registrar_versao_fonte_v107", {
      p_id_organizacao: org, p_id_fonte: fonte.id, p_inicio_vigencia: inicio, p_fim_vigencia: fim || null,
      p_id_arquivo: origem === "arquivo" ? arquivo : null, p_conteudo_texto: origem === "texto" ? conteudo : null,
      p_metadados: {}, p_chave_idempotencia: k,
    }));
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DialogContent onCloseAutoFocus={devolverFoco(retorno)} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova versão</DialogTitle>
          <DialogDescription>Versões não são sobrescritas: cada registro cria uma nova versão, numerada e com hash calculado pelo servidor.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">Início da vigência<input type="date" className={campo} value={inicio} onChange={(e) => alt(setInicio)(e.target.value)} /></label>
            <label className="block text-sm">Fim da vigência (opcional)<input type="date" className={campo} value={fim} onChange={(e) => alt(setFim)(e.target.value)} /></label>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Origem</legend>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="origem" checked={origem === "texto"} onChange={() => alt(setOrigem)("texto")} />Texto</label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="origem" checked={origem === "arquivo"} onChange={() => alt(setOrigem)("arquivo")} />Arquivo já aprovado</label>
          </fieldset>
          {origem === "texto" ? (
            <label className="block text-sm">Texto da versão<textarea className={`${campo} min-h-32 py-2`} value={conteudo} onChange={(e) => alt(setConteudo)(e.target.value)} /></label>
          ) : arquivos.isError ? (
            <Alerta mensagem={MENSAGENS_V107.erroLista} onRetry={() => void arquivos.refetch()} />
          ) : !arquivos.data ? (
            <Carregando texto="Carregando arquivos…" />
          ) : arquivos.data.itens.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum arquivo disponível neste escopo.</p>
          ) : (
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium">Arquivo</legend>
              {arquivos.data.itens.map((a) => {
                const apto = a.status_seguranca === "aprovado";
                return (
                  <label key={a.id} className={`flex min-h-11 items-center gap-2 text-sm ${apto ? "" : "text-muted-foreground"}`}>
                    <input type="radio" name="arquivo" disabled={!apto} checked={arquivo === a.id} onChange={() => alt(setArquivo)(a.id)} />
                    <span className="break-all">{a.nome_original}</span>
                    <span className="rounded border border-border px-1.5 text-xs">{STATUS_ARQUIVO[a.status_seguranca] ?? a.status_seguranca}</span>
                  </label>
                );
              })}
              <p className="text-xs text-muted-foreground">Arquivos em análise de segurança não podem ser anexados até serem aprovados.</p>
            </fieldset>
          )}
          {origem === "arquivo" ? <EnvioArquivo org={org} contrato={fonte.id_contrato} onEnviado={() => void arquivos.refetch()} /> : null}
          {falta ? <p role="alert" className="text-sm text-destructive">{falta}</p> : null}
          <RodapeErro erro={mut.error} onRecarregar={onRecarregar} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={onFechar}>Cancelar</Button>
          <Button type="button" className="h-11" disabled={mut.isPending} onClick={registrar}>{mut.isPending ? "Registrando…" : "Registrar versão"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoAprovar({ retorno, v, org, onFechar, onConcluir, onRecarregar }: PropsDlg & { v: Versao; org: string }) {
  const [fundamento, setFundamento] = useState("");
  const [confirmo, setConfirmo] = useState(false);
  const { mut, renovar } = useAcao(onConcluir);
  const pronto = fundamento.trim().length > 0 && confirmo;
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DialogContent onCloseAutoFocus={devolverFoco(retorno)} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovar versão {v.versao}</DialogTitle>
          <DialogDescription>Revise hash, origem e vigência. Ator, data e auditoria são registrados pelo servidor.</DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 text-sm">
          <div><dt className="text-xs text-muted-foreground">Hash</dt><dd className="break-all font-mono text-xs">{v.hash}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Origem</dt><dd>{v.id_arquivo ? "Arquivo vinculado" : "Texto"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Vigência</dt><dd>{formatarDataBr(v.inicio_vigencia)} – {formatarDataBr(v.fim_vigencia)}</dd></div>
        </dl>
        <label className="block text-sm">Fundamento<textarea className={`${campo} min-h-20 py-2`} value={fundamento} onChange={(e) => { setFundamento(e.target.value); renovar(); }} /></label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} />Confirmo que revisei hash, origem e vigência desta versão.</label>
        <RodapeErro erro={mut.error} onRecarregar={onRecarregar} />
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={onFechar}>Cancelar</Button>
          <Button type="button" className="h-11" disabled={!pronto || mut.isPending}
            onClick={() => mut.mutate((k) => chamarV107("aprovar_versao_fonte_v107", { p_id_organizacao: org, p_id_versao: v.id, p_hash_esperado: v.hash, p_fundamento: fundamento.trim(), p_chave_idempotencia: k }))}>
            {mut.isPending ? "Aprovando…" : "Aprovar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoAplic({ retorno, v, a, org, contrato, onFechar, onConcluir, onRecarregar }: PropsDlg & { v: Versao; a: Aplicabilidade | undefined; org: string; contrato: string }) {
  const [aplicavel, setAplicavel] = useState<boolean | null>(a ? a.aplicavel : null);
  const [fundamento, setFundamento] = useState("");
  const { mut, renovar } = useAcao(onConcluir);
  const pronto = aplicavel !== null && fundamento.trim().length > 0;
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DialogContent onCloseAutoFocus={devolverFoco(retorno)} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aplicabilidade da versão {v.versao}</DialogTitle>
          <DialogDescription>Somente versões aprovadas podem ter aplicabilidade definida. A decisão é registrada pelo servidor.</DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">Decisão</legend>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="aplic" checked={aplicavel === true} onChange={() => { setAplicavel(true); renovar(); }} />Aplicável</label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="aplic" checked={aplicavel === false} onChange={() => { setAplicavel(false); renovar(); }} />Não aplicável</label>
        </fieldset>
        <label className="block text-sm">Fundamento<textarea className={`${campo} min-h-20 py-2`} value={fundamento} onChange={(e) => { setFundamento(e.target.value); renovar(); }} /></label>
        <RodapeErro erro={mut.error} onRecarregar={onRecarregar} />
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={onFechar}>Cancelar</Button>
          <Button type="button" className="h-11" disabled={!pronto || mut.isPending}
            onClick={() => aplicavel !== null && mut.mutate((k) => chamarV107("definir_aplicabilidade_fonte_v107", {
              p_id_organizacao: org, p_id_contrato: contrato, p_id_versao: v.id, p_aplicavel: aplicavel, p_fundamento: fundamento.trim(), p_atualizado_em_esperado: a?.atualizado_em ?? null, p_chave_idempotencia: k,
            }))}>
            {mut.isPending ? "Salvando…" : "Salvar aplicabilidade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Aviso({ icone, mensagem }: { icone: ReactNode; mensagem: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm">{icone}{mensagem}</p>
      <Button asChild variant="outline" className="h-11"><Link to="/contratos">Voltar para contratos</Link></Button>
    </div>
  );
}

function Alerta({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />{mensagem}</p>
      <Button type="button" variant="outline" className="h-11" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente</Button>
    </div>
  );
}

function EnvioArquivo({ org, contrato, onEnviado }: { org: string; contrato: string | null; onEnviado: () => void }) {
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
      <label className="block text-sm">Enviar novo arquivo<input type="file" className="mt-1 block w-full text-sm" onChange={(e) => { setSel(e.target.files?.[0] ?? null); setEstado("ocioso"); }} /></label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="h-11" disabled={!sel || estado === "enviando"} onClick={() => void enviar()}>{estado === "enviando" ? "Enviando…" : "Enviar arquivo"}</Button>
        {estado === "enviado" ? <Button type="button" variant="outline" className="h-11" onClick={onEnviado}>Atualizar status</Button> : null}
      </div>
      <div aria-live="polite" className="text-sm">
        {estado === "enviado" ? <p>{MENSAGENS_V107.enviado}</p> : null}
        {estado === "erro" ? <p role="alert" className="text-destructive">{MENSAGENS_V107.erroEnvio}</p> : null}
        {estado === "resumivel" ? <p role="alert" className="text-destructive">{MENSAGENS_V107.resumivel}</p> : null}
      </div>
    </div>
  );
}

function BotaoDownload({ idArquivo, versao }: { idArquivo: string; versao: number }) {
  const [estado, setEstado] = useState<"ocioso" | "baixando" | "erro">("ocioso");
  const baixar = async () => {
    setEstado("baixando");
    try {
      await baixarArquivo(idArquivo);
      setEstado("ocioso");
    } catch {
      setEstado("erro");
    }
  };
  return (
    <>
      <Button type="button" variant="outline" className="h-11" disabled={estado === "baixando"} onClick={() => void baixar()}>{`Baixar arquivo da versão ${versao}`}</Button>
      {estado === "erro" ? <p role="alert" className="w-full text-sm text-destructive">{MENSAGENS_V107.erroDownload}</p> : null}
    </>
  );
}

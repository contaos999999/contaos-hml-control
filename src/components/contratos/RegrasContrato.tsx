import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  CircleDashed,
  History,
  Info,
  Loader2,
  MinusCircle,
  RefreshCw,
  SearchX,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroDetalhe,
  formatarDataBr,
  obterContrato,
  uuidCanonico,
  uuidValido,
} from "@/lib/contratos/contratoDetalheDados";
import { ErroBn, formatarDataHoraBr } from "@/lib/contratos/baseNormativaDados";
import {
  ErroAprovacao,
  PAGINA_REGRAS,
  ROTULO_CRITICIDADE,
  ROTULO_ESCOPO,
  ROTULO_SITUACAO_LISTA,
  ROTULO_SITUACAO_PREVENTIVA,
  SITUACOES_PREVENTIVA,
  aprovarRegraPreventiva,
  listarFontesFormais,
  listarItens,
  listarListas,
  listarRegrasConformidade,
  listarRegrasPreventivas,
  listarVersoesLista,
  obterRotulosFontes,
  paresLegiveis,
  rotulo,
  type Json,
  type Lista,
  type RegraPreventiva,
  type TipoErroAprovacao,
} from "@/lib/contratos/regrasDados";

export const MENSAGENS_V109 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  carregandoSecao: "Carregando…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia:
    "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  erroSecao: "Não foi possível carregar estes dados agora. Tente novamente em instantes.",
  negadoSecao: "Você não tem acesso a estes dados.",
  vazioListas: "Nenhuma lista de verificação registrada para este contrato.",
  vazioVersoes: "Esta lista ainda não possui versões.",
  vazioItens: "Esta versão ainda não possui itens.",
  vazioConformidade: "Nenhuma regra de conformidade registrada para este contrato.",
  vazioPreventivas: "Nenhuma regra preventiva encontrada para este contrato.",
  semPermissao: "Você não tem permissão para aprovar esta regra.",
  regraNaoEncontrada: "Regra não encontrada.",
  conflito: "A regra foi alterada por outra pessoa. Atualize e tente novamente.",
  validacao: "A aprovação não foi aceita pelo servidor. Revise a regra e tente novamente.",
  erroAcao: "Não foi possível concluir a aprovação agora. Tente novamente em instantes.",
  portao: "Valor definido pelo backend.",
} as const;

const MSG_APROVACAO: Record<TipoErroAprovacao, string> = {
  negado: MENSAGENS_V109.semPermissao,
  nao_encontrada: MENSAGENS_V109.regraNaoEncontrada,
  conflito: MENSAGENS_V109.conflito,
  validacao: MENSAGENS_V109.validacao,
  erro: MENSAGENS_V109.erroAcao,
};

type Ctx = { idUsuario: string; idOrganizacao: string };
const LINK_NAV =
  "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const TH = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const TD = "px-3 py-2 align-top";
const vigencia = (i: string | null, f: string | null) =>
  `${formatarDataBr(i)} a ${f ? formatarDataBr(f) : "Sem término"}`;

export function RegrasContrato({ id }: { id: string }) {
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
        <header className="border-b border-border bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <ContaOSMarca />
            </div>
            <nav aria-label="Navegação" className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="h-11">
                <Link to="/contratos">
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Voltar para contratos
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-11">
                <Link to="/selecionar-organizacao">
                  <Building2 className="mr-2 h-4 w-4" aria-hidden /> Selecionar organização
                </Link>
              </Button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {erroSessao ? (
            <>
              <Titulo />
              <Alerta
                mensagem={MENSAGENS_V109.erroSessao}
                onRetry={() => setTentativa((n) => n + 1)}
              />
            </>
          ) : !ctx ? (
            <>
              <Titulo />
              <Carregando texto={MENSAGENS_V109.verificando} />
            </>
          ) : !idOk ? (
            <>
              <Titulo />
              <Aviso
                icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                mensagem={MENSAGENS_V109.naoEncontrado}
              />
            </>
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {numero ? `Contrato ${numero}` : "Gestão contratual"}
      </p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        Listas e regras
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
function Alerta({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        {mensagem}
      </p>
      <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
      </Button>
    </div>
  );
}
/** Dica acessível: hover/foco no desktop, toque abre popover no mobile. */
function Dica({ rotulo: r, children }: { rotulo: string; children: string }) {
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
          <TooltipContent className="max-w-xs">{children}</TooltipContent>
        </Tooltip>
      </span>
      <span className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={r} className={`${cls} h-11 w-11`}>
              <Info className="h-4 w-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-xs text-sm">{children}</PopoverContent>
        </Popover>
      </span>
    </>
  );
}
function Selo({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}
function SimNao({ v }: { v: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      {v ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" aria-hidden />
      )}
      <span>{v ? "Sim" : "Não"}</span>
    </span>
  );
}
function Portao({ v }: { v: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Selo>
        {v ? <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> : <MinusCircle className="h-3.5 w-3.5" aria-hidden />}
        <span>{`Afeta portão: ${v ? "Sim" : "Não"}`}</span>
      </Selo>
      <Dica rotulo="Sobre o efeito no portão">{MENSAGENS_V109.portao}</Dica>
    </span>
  );
}
const ESTILO_SITUACAO: Record<string, { icone: ReactNode; borda: string }> = {
  candidata: {
    icone: <CircleDashed className="h-3.5 w-3.5" aria-hidden />,
    borda: "border-dashed border-2 border-muted-foreground bg-background",
  },
  ativa: {
    icone: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
    borda: "border-2 border-primary bg-primary/10",
  },
  inativa: { icone: <MinusCircle className="h-3.5 w-3.5" aria-hidden />, borda: "border border-border bg-muted" },
  rejeitada: { icone: <XCircle className="h-3.5 w-3.5" aria-hidden />, borda: "border border-destructive/60 bg-destructive/5" },
  substituida: { icone: <History className="h-3.5 w-3.5" aria-hidden />, borda: "border border-dotted border-border bg-muted" },
};
function SeloSituacao({ situacao }: { situacao: string }) {
  const e = ESTILO_SITUACAO[situacao] ?? { icone: null, borda: "border border-border bg-muted" };
  return (
    <span
      data-situacao={situacao}
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${e.borda}`}
    >
      {e.icone}
      <span>{rotulo(ROTULO_SITUACAO_PREVENTIVA, situacao)}</span>
    </span>
  );
}
function ParesChaveValor({ v }: { v: Json }) {
  const pares = paresLegiveis(v);
  if (pares.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs">
      {pares.map(([k, x], i) => (
        <div key={`${k}-${i}`} className="contents">
          <dt className="font-medium text-muted-foreground">{k}</dt>
          <dd className="break-words">{x}</dd>
        </div>
      ))}
    </dl>
  );
}
function Paginador({
  pagina,
  total,
  onMudar,
}: {
  pagina: number;
  total: number;
  onMudar: (p: number) => void;
}) {
  if (total <= PAGINA_REGRAS) return null;
  const ultima = Math.max(0, Math.ceil(total / PAGINA_REGRAS) - 1);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button type="button" variant="outline" className="h-11" disabled={pagina === 0} onClick={() => onMudar(pagina - 1)}>
        Página anterior
      </Button>
      <span aria-live="polite">{`Página ${pagina + 1} de ${ultima + 1} · ${total} registros`}</span>
      <Button type="button" variant="outline" className="h-11" disabled={pagina >= ultima} onClick={() => onMudar(pagina + 1)}>
        Próxima página
      </Button>
    </div>
  );
}
function EstadoConsulta({
  erro,
  carregando,
  onRetry,
}: {
  erro: unknown;
  carregando: boolean;
  onRetry: () => void;
}) {
  if (erro)
    return (
      <Alerta
        mensagem={erro instanceof ErroBn && erro.tipo === "negado" ? MENSAGENS_V109.negadoSecao : MENSAGENS_V109.erroSecao}
        onRetry={onRetry}
      />
    );
  if (carregando) return <Carregando texto={MENSAGENS_V109.carregandoSecao} />;
  return null;
}
function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 id={id} className="text-lg font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
function Tabela({ cabecalhos, children }: { cabecalhos: string[]; children: ReactNode }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-muted/50">
          <tr>
            {cabecalhos.map((h) => (
              <th key={h} scope="col" className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
function useRotulosFontes(chave: unknown[], ids: string[]) {
  const unicos = [...new Set(ids.filter(Boolean))].sort();
  return useQuery({
    queryKey: ["regras", "fontes", ...chave, unicos],
    queryFn: ({ signal }) => obterRotulosFontes(unicos, signal),
    enabled: unicos.length > 0,
    retry: false,
  });
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
          <Aviso
            icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
            mensagem={MENSAGENS_V109.negado}
          />
        ) : tipo === "nao_encontrado" ? (
          <Aviso
            icone={<SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
            mensagem={MENSAGENS_V109.naoEncontrado}
          />
        ) : (
          <Alerta
            mensagem={tipo === "consistencia" ? MENSAGENS_V109.consistencia : MENSAGENS_V109.erro}
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
        <Carregando texto={MENSAGENS_V109.carregando} />
      </>
    );
  const chave = [ctx.idUsuario, ctx.idOrganizacao, c.id];
  return (
    <>
      <Titulo numero={c.numero ?? undefined} />
      <NavSecoes id={c.id} />
      <SecaoListas contrato={c.id} chave={chave} />
      <SecaoConformidade contrato={c.id} chave={chave} />
      <SecaoPreventivas contrato={c.id} chave={chave} />
    </>
  );
}

function NavSecoes({ id }: { id: string }) {
  return (
    <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link to="/contratos/$id" params={{ id }} className={LINK_NAV}>
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
          <span
            aria-current="page"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Regras
          </span>
        </li>
        {(["Documentos", "Competências"] as const).map((s) => (
          <li key={s}>
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm text-muted-foreground"
            >
              <span>{s}</span>
              <span className="rounded border border-border px-1.5 text-[0.65rem] uppercase tracking-wide">
                Em breve
              </span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ---------- V1-CHK-001/002: listas, versões e itens ----------
function SecaoListas({ contrato, chave }: { contrato: string; chave: unknown[] }) {
  const [pagina, setPagina] = useState(0);
  const [aberta, setAberta] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["regras", "listas", ...chave, pagina],
    queryFn: ({ signal }) => listarListas(contrato, pagina, signal),
    retry: false,
  });
  const itens = q.data?.itens ?? [];
  return (
    <Secao id="v109-listas" titulo="Listas de verificação">
      <EstadoConsulta erro={q.error} carregando={q.isPending} onRetry={() => void q.refetch()} />
      {q.isSuccess && itens.length === 0 && (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V109.vazioListas}</p>
      )}
      {itens.length > 0 && (
        <ul className="space-y-3">
          {itens.map((l) => (
            <li key={l.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-medium">{l.nome}</p>
                  {l.descricao && <p className="break-words text-sm text-muted-foreground">{l.descricao}</p>}
                  <p className="mt-1 flex flex-wrap gap-2 text-xs">
                    <Selo>{rotulo(ROTULO_SITUACAO_LISTA, l.situacao)}</Selo>
                    <Selo>{`Versão atual: ${l.versao_atual}`}</Selo>
                    <span className="text-muted-foreground">{`Atualizada em ${formatarDataHoraBr(l.atualizado_em)}`}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0"
                  aria-expanded={aberta === l.id}
                  aria-controls={`v109-lista-${l.id}`}
                  aria-label={`Ver versões e itens de ${l.nome}`}
                  onClick={() => setAberta((a) => (a === l.id ? null : l.id))}
                >
                  {aberta === l.id ? "Ocultar versões e itens" : "Ver versões e itens"}
                </Button>
              </div>
              {aberta === l.id && (
                <div id={`v109-lista-${l.id}`} className="mt-3">
                  <PainelLista lista={l} chave={chave} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <Paginador pagina={pagina} total={q.data?.total ?? 0} onMudar={setPagina} />
    </Secao>
  );
}

function PainelLista({ lista, chave }: { lista: Lista; chave: unknown[] }) {
  const [paginaV, setPaginaV] = useState(0);
  const [paginaI, setPaginaI] = useState(0);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const qv = useQuery({
    queryKey: ["regras", "versoes", ...chave, lista.id, paginaV],
    queryFn: ({ signal }) => listarVersoesLista(lista.id, paginaV, signal),
    retry: false,
  });
  const versoes = qv.data?.itens ?? [];
  const atual = versoes.find((v) => v.numero_versao === lista.versao_atual) ?? versoes[0];
  const idVersao = escolhida ?? atual?.id ?? null;
  const qi = useQuery({
    queryKey: ["regras", "itens", ...chave, idVersao, paginaI],
    queryFn: ({ signal }) => listarItens(idVersao ?? "", paginaI, signal),
    enabled: !!idVersao,
    retry: false,
  });
  const itens = qi.data?.itens ?? [];
  const fontes = useRotulosFontes(chave, itens.map((i) => i.id_fonte_versao ?? ""));
  return (
    <div className="space-y-3">
      <EstadoConsulta erro={qv.error} carregando={qv.isPending} onRetry={() => void qv.refetch()} />
      {qv.isSuccess && versoes.length === 0 && (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V109.vazioVersoes}</p>
      )}
      {versoes.length > 0 && (
        <>
          <h3 className="text-sm font-semibold">Versões (somente leitura)</h3>
          <ul className="flex flex-wrap gap-2">
            {versoes.map((v) => (
              <li key={v.id}>
                <Button
                  type="button"
                  variant={v.id === idVersao ? "default" : "outline"}
                  className="h-auto min-h-11 flex-col items-start py-1 text-left"
                  aria-pressed={v.id === idVersao}
                  onClick={() => {
                    setEscolhida(v.id);
                    setPaginaI(0);
                  }}
                >
                  <span>{`Versão ${v.numero_versao}${v.numero_versao === lista.versao_atual ? " (atual)" : ""} · ${rotulo(ROTULO_SITUACAO_LISTA, v.situacao)}`}</span>
                  <span className="text-xs font-normal">{`Vigência: ${vigencia(v.vigencia_inicio, v.vigencia_fim)}`}</span>
                </Button>
              </li>
            ))}
          </ul>
          <Paginador pagina={paginaV} total={qv.data?.total ?? 0} onMudar={setPaginaV} />
          <h3 className="text-sm font-semibold">Itens da versão</h3>
          <EstadoConsulta erro={qi.error} carregando={qi.isPending && !!idVersao} onRetry={() => void qi.refetch()} />
          {qi.isSuccess && itens.length === 0 && (
            <p className="text-sm text-muted-foreground">{MENSAGENS_V109.vazioItens}</p>
          )}
          {itens.length > 0 && (
            <Tabela
              cabecalhos={["Código", "Descrição", "Obrigatório", "Aplicável", "Impeditivo", "Criticidade", "Fonte/versão", "Regra de validação"]}
            >
              {itens.map((i) => (
                <tr key={i.id}>
                  <td className={`${TD} font-mono text-xs`}>{i.codigo}</td>
                  <td className={TD}>
                    <span className="break-words">{i.descricao}</span>
                    {i.categoria && <span className="block text-xs text-muted-foreground">{i.categoria}</span>}
                  </td>
                  <td className={TD}><SimNao v={i.obrigatorio} /></td>
                  <td className={TD}><SimNao v={i.aplicavel} /></td>
                  <td className={TD}><SimNao v={i.impeditivo} /></td>
                  <td className={TD}><Selo>{rotulo(ROTULO_CRITICIDADE, i.criticidade)}</Selo></td>
                  <td className={TD}>{i.id_fonte_versao ? (fontes.data?.[i.id_fonte_versao] ?? "—") : "—"}</td>
                  <td className={TD}><ParesChaveValor v={i.regra_validacao} /></td>
                </tr>
              ))}
            </Tabela>
          )}
          <Paginador pagina={paginaI} total={qi.data?.total ?? 0} onMudar={setPaginaI} />
        </>
      )}
    </div>
  );
}

// ---------- V1-CHK-003: regras de conformidade ----------
function SecaoConformidade({ contrato, chave }: { contrato: string; chave: unknown[] }) {
  const [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ["regras", "conformidade", ...chave, pagina],
    queryFn: ({ signal }) => listarRegrasConformidade(contrato, pagina, signal),
    retry: false,
  });
  const itens = q.data?.itens ?? [];
  const fontes = useRotulosFontes(chave, itens.map((r) => r.id_fonte_versao ?? ""));
  return (
    <section aria-label="Regras de conformidade" className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">Regras de conformidade</h2>
      <EstadoConsulta erro={q.error} carregando={q.isPending} onRetry={() => void q.refetch()} />
      {q.isSuccess && itens.length === 0 && (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V109.vazioConformidade}</p>
      )}
      {itens.length > 0 && (
        <Tabela cabecalhos={["Código", "Descrição", "Tipo", "Efeito no portão", "Fonte/versão", "Situação", "Atualizada em"]}>
          {itens.map((r) => (
            <tr key={r.id}>
              <td className={`${TD} font-mono text-xs`}>{r.codigo}</td>
              <td className={`${TD} break-words`}>{r.descricao}</td>
              <td className={TD}>{r.tipo}</td>
              <td className={TD}><Portao v={r.efeito_portao} /></td>
              <td className={TD}>{r.id_fonte_versao ? (fontes.data?.[r.id_fonte_versao] ?? "—") : "—"}</td>
              <td className={TD}><Selo>{rotulo(ROTULO_SITUACAO_LISTA, r.situacao)}</Selo></td>
              <td className={TD}>{formatarDataHoraBr(r.atualizado_em)}</td>
            </tr>
          ))}
        </Tabela>
      )}
      <Paginador pagina={pagina} total={q.data?.total ?? 0} onMudar={setPagina} />
    </section>
  );
}

// ---------- V1-CHK-004: regras preventivas + aprovação ----------
type Dialogo = { tipo: "detalhe" | "aprovar"; regra: RegraPreventiva; sessao: number } | null;

function SecaoPreventivas({ contrato, chave }: { contrato: string; chave: unknown[] }) {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(0);
  const [situacao, setSituacao] = useState("");
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const gatilho = useRef<HTMLButtonElement | null>(null);
  const sessao = useRef(0);
  const q = useQuery({
    queryKey: ["regras", "preventivas", ...chave, situacao, pagina],
    queryFn: ({ signal }) => listarRegrasPreventivas(contrato, situacao, pagina, signal),
    retry: false,
  });
  const itens = q.data?.itens ?? [];
  const fontes = useRotulosFontes(chave, itens.map((r) => r.id_fonte_formal_versao ?? ""));
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["regras", "preventivas"] });
  const abrir = (tipo: "detalhe" | "aprovar", regra: RegraPreventiva, el: HTMLButtonElement) => {
    gatilho.current = el;
    sessao.current += 1;
    setDialogo({ tipo, regra, sessao: sessao.current });
  };
  return (
    <section aria-label="Regras preventivas" className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">Regras preventivas</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium" htmlFor="v109-filtro-situacao">
          Filtrar por situação
          <select
            id="v109-filtro-situacao"
            className="mt-1 block min-h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={situacao}
            onChange={(e) => {
              setSituacao(e.target.value);
              setPagina(0);
            }}
          >
            <option value="">Todas</option>
            {SITUACOES_PREVENTIVA.map((s) => (
              <option key={s} value={s}>
                {ROTULO_SITUACAO_PREVENTIVA[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {sucesso && (
        <p role="status" className="flex items-start gap-2 rounded-md border border-border bg-muted p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {`Regra aprovada. Protocolo da revisão: ${sucesso}`}
        </p>
      )}
      <EstadoConsulta erro={q.error} carregando={q.isPending} onRetry={() => void q.refetch()} />
      {q.isSuccess && itens.length === 0 && (
        <p className="text-sm text-muted-foreground">{MENSAGENS_V109.vazioPreventivas}</p>
      )}
      {itens.length > 0 && (
        <Tabela cabecalhos={["Código", "Descrição", "Situação", "Criticidade", "Efeito", "Escopo", "Vigência", "Versão", "Fonte/versão", "Ações"]}>
          {itens.map((r) => (
            <tr key={r.id}>
              <td className={`${TD} font-mono text-xs`}>{r.codigo_regra}</td>
              <td className={`${TD} break-words`}>{r.descricao}</td>
              <td className={TD}><SeloSituacao situacao={r.situacao} /></td>
              <td className={TD}><Selo>{rotulo(ROTULO_CRITICIDADE, r.criticidade)}</Selo></td>
              <td className={TD}>{r.efeito}</td>
              <td className={TD}>{rotulo(ROTULO_ESCOPO, r.escopo_aplicacao)}</td>
              <td className={TD}>{vigencia(r.vigencia_inicio, r.vigencia_fim)}</td>
              <td className={TD}>{`v${r.numero_versao}`}</td>
              <td className={TD}>{r.id_fonte_formal_versao ? (fontes.data?.[r.id_fonte_formal_versao] ?? "—") : "—"}</td>
              <td className={TD}>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    aria-label={`Detalhes da regra ${r.codigo_regra}`}
                    onClick={(e) => abrir("detalhe", r, e.currentTarget)}
                  >
                    Detalhes
                  </Button>
                  {r.situacao === "candidata" && (
                    <Button
                      type="button"
                      className="h-11"
                      aria-label={`Aprovar regra ${r.codigo_regra}`}
                      onClick={(e) => abrir("aprovar", r, e.currentTarget)}
                    >
                      Aprovar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Tabela>
      )}
      <Paginador pagina={pagina} total={q.data?.total ?? 0} onMudar={setPagina} />
      <Dialog open={!!dialogo} onOpenChange={(o) => !o && setDialogo(null)}>
        {dialogo && (
          <DialogContent
            key={dialogo.sessao}
            className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              gatilho.current?.focus();
            }}
          >
            {dialogo.tipo === "detalhe" ? (
              <DetalheRegra regra={dialogo.regra} chave={chave} rotuloFonte={fontes.data} />
            ) : (
              <FormAprovacao
                regra={dialogo.regra}
                onSucesso={(protocolo) => {
                  setSucesso(protocolo);
                  setDialogo(null);
                  recarregar();
                }}
                onRecarregar={() => {
                  setDialogo(null);
                  recarregar();
                }}
              />
            )}
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

function Campo({ rotulo: r, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r}</dt>
      <dd className="break-words text-sm">{children}</dd>
    </div>
  );
}

function DetalheRegra({
  regra,
  chave,
  rotuloFonte,
}: {
  regra: RegraPreventiva;
  chave: unknown[];
  rotuloFonte?: Record<string, string>;
}) {
  const q = useQuery({
    queryKey: ["regras", "fontes-formais", ...chave, regra.id],
    queryFn: ({ signal }) => listarFontesFormais(regra.id, signal),
    retry: false,
  });
  const formais = q.data ?? [];
  const rotulos = useRotulosFontes(chave, formais.map((f) => f.id_versao_fonte_normativa));
  return (
    <>
      <DialogHeader>
        <DialogTitle>{`Regra ${regra.codigo_regra}`}</DialogTitle>
        <DialogDescription>{regra.descricao}</DialogDescription>
      </DialogHeader>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo rotulo="Situação"><SeloSituacao situacao={regra.situacao} /></Campo>
        <Campo rotulo="Criticidade">{rotulo(ROTULO_CRITICIDADE, regra.criticidade)}</Campo>
        <Campo rotulo="Efeito">{regra.efeito}</Campo>
        <Campo rotulo="Escopo">{rotulo(ROTULO_ESCOPO, regra.escopo_aplicacao)}</Campo>
        <Campo rotulo="Vigência">{vigencia(regra.vigencia_inicio, regra.vigencia_fim)}</Campo>
        <Campo rotulo="Versão">{`v${regra.numero_versao}`}</Campo>
        <Campo rotulo="Fonte formal">
          {regra.id_fonte_formal_versao ? (rotuloFonte?.[regra.id_fonte_formal_versao] ?? "—") : "—"}
        </Campo>
        <Campo rotulo="Aprovada em">{formatarDataHoraBr(regra.aprovada_em)}</Campo>
        <Campo rotulo="Origem"><ParesChaveValor v={regra.fonte} /></Campo>
      </dl>
      <h3 className="text-sm font-semibold">Fontes formais vinculadas</h3>
      <EstadoConsulta erro={q.error} carregando={q.isPending} onRetry={() => void q.refetch()} />
      {q.isSuccess && formais.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma fonte formal vinculada.</p>
      )}
      {formais.length > 0 && (
        <ul className="space-y-2">
          {formais.map((f) => (
            <li key={f.id} className="rounded-md border border-border p-2 text-sm">
              <p className="font-medium">{rotulos.data?.[f.id_versao_fonte_normativa] ?? "—"}</p>
              <p className="break-words">{f.fundamento_aplicabilidade}</p>
              <p className="text-xs text-muted-foreground">{`Validada em ${formatarDataHoraBr(f.validado_em)}`}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FormAprovacao({
  regra,
  onSucesso,
  onRecarregar,
}: {
  regra: RegraPreventiva;
  onSucesso: (protocolo: string) => void;
  onRecarregar: () => void;
}) {
  const [parecer, setParecer] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<TipoErroAprovacao | null>(null);
  const emCurso = useRef(false);
  const bloqueado = erro === "conflito" || erro === "nao_encontrada";
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (emCurso.current || bloqueado) return;
    emCurso.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const protocolo = await aprovarRegraPreventiva(regra.id, parecer);
      onSucesso(protocolo);
    } catch (x) {
      setErro(x instanceof ErroAprovacao ? x.tipo : "erro");
      emCurso.current = false;
      setEnviando(false);
    }
  };
  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{`Aprovar regra ${regra.codigo_regra}`}</DialogTitle>
        <DialogDescription>
          A aprovação é registrada pelo servidor. A situação final é definida pelo backend.
        </DialogDescription>
      </DialogHeader>
      <div>
        <label htmlFor="v109-parecer" className="text-sm font-medium">
          Parecer (opcional)
        </label>
        <textarea
          id="v109-parecer"
          className="mt-1 block min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={parecer}
          onChange={(e) => setParecer(e.target.value)}
          disabled={enviando || bloqueado}
        />
      </div>
      {erro && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          {bloqueado ? <Ban className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          {MSG_APROVACAO[erro]}
        </p>
      )}
      <DialogFooter className="gap-2">
        {bloqueado && (
          <Button type="button" variant="outline" className="h-11" onClick={onRecarregar}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Recarregar
          </Button>
        )}
        <Button type="submit" className="h-11" disabled={enviando || bloqueado} aria-label="Confirmar aprovação">
          {enviando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Aprovando…
            </>
          ) : (
            "Confirmar aprovação"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

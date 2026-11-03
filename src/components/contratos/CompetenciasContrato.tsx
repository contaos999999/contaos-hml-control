/**
 * V1-12 — Competências do contrato (somente leitura).
 * Gate: UUID → sessão → preferência de organização (contexto) → obterContrato (RLS).
 * Só então lista `competencias` paginadas/filtradas no servidor.
 * Status = token bruto do backend; percentual apenas exibido. Sem escrita, sem RPC.
 */
import { useEffect, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CircleDot,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroDetalhe,
  formatarDataBr,
  obterContrato,
  uuidCanonico,
  uuidValido,
} from "@/lib/contratos/contratoDetalheDados";
import {
  ErroCompetencia,
  FILTROS_COMPETENCIA_VAZIOS,
  PAGINA_COMPETENCIAS,
  SITUACOES_COMPETENCIA,
  formatarCompetencia,
  formatarPercentual,
  listarCompetencias,
  type Competencia,
  type FiltrosCompetencia,
} from "@/lib/contratos/competenciasDados";

export const MENSAGENS_V112 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  carregandoLista: "Carregando competências…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia:
    "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  erroLista: "Não foi possível carregar as competências agora. Tente novamente em instantes.",
  negadoLista: "Você não tem acesso às competências deste contrato.",
  vazio: "Nenhuma competência encontrada para este contrato com os filtros atuais.",
} as const;

type Ctx = { idUsuario: string; idOrganizacao: string };
const LINK_NAV =
  "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const TH =
  "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const TD = "px-3 py-2 align-top";
const EM_BREVE = (
  <span className="rounded border border-border px-1.5 text-[0.65rem] uppercase tracking-wide">
    Em breve
  </span>
);

export function CompetenciasContrato({ id }: { id: string }) {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const idOk = uuidValido(id);

  useEffect(() => {
    if (!idOk) return;
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
  }, [idOk, navigate, tentativa]);

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
              <Link to="/contratos" activeOptions={{ exact: true }}>
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
        {!idOk ? (
          <>
            <Titulo />
            <Aviso
              icone={
                <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              }
              mensagem={MENSAGENS_V112.naoEncontrado}
            />
          </>
        ) : erroSessao ? (
          <>
            <Titulo />
            <Alerta
              mensagem={MENSAGENS_V112.erroSessao}
              onRetry={() => setTentativa((n) => n + 1)}
            />
          </>
        ) : !ctx ? (
          <>
            <Titulo />
            <Carregando texto={MENSAGENS_V112.verificando} />
          </>
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {numero ? `Contrato ${numero}` : "Gestão contratual"}
      </p>
      <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        Competências
      </h1>
    </div>
  );
}
function Carregando({ texto }: { texto: string }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {texto}
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
            mensagem={MENSAGENS_V112.negado}
          />
        ) : tipo === "nao_encontrado" ? (
          <Aviso
            icone={
              <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            mensagem={MENSAGENS_V112.naoEncontrado}
          />
        ) : (
          <Alerta
            mensagem={tipo === "consistencia" ? MENSAGENS_V112.consistencia : MENSAGENS_V112.erro}
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
        <Carregando texto={MENSAGENS_V112.carregando} />
      </>
    );
  return (
    <>
      <Titulo numero={c.numero ?? undefined} />
      <NavSecoes id={c.id} />
      <ListaCompetencias contrato={c.id} chave={[ctx.idUsuario, ctx.idOrganizacao, c.id]} />
    </>
  );
}

function NavSecoes({ id }: { id: string }) {
  const links: Array<
    [
      string,
      (
        | "/contratos/$id"
        | "/contratos/$id/base-normativa"
        | "/contratos/$id/orcamento"
        | "/contratos/$id/regras"
        | "/contratos/$id/documentos"
      ),
    ]
  > = [
    ["Visão geral", "/contratos/$id"],
    ["Base normativa", "/contratos/$id/base-normativa"],
    ["Orçamento", "/contratos/$id/orcamento"],
    ["Regras", "/contratos/$id/regras"],
    ["Documentos", "/contratos/$id/documentos"],
  ];
  return (
    <nav aria-label="Seções do contrato" className="rounded-xl border border-border bg-card p-2">
      <ul className="flex flex-wrap gap-2">
        {links.map(([rotulo, to]) => (
          <li key={to}>
            <Link to={to} params={{ id }} activeOptions={{ exact: true }} className={LINK_NAV}>
              {rotulo}
            </Link>
          </li>
        ))}
        <li>
          <span
            aria-current="page"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Competências
          </span>
        </li>
      </ul>
    </nav>
  );
}

function StatusBadge({ situacao }: { situacao: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
      <CircleDot className="h-3 w-3" aria-hidden />
      <span data-status>{situacao}</span>
    </span>
  );
}

function PercentGauge({ valor }: { valor: number | null }) {
  const texto = formatarPercentual(valor);
  if (valor === null || valor === undefined) return <span data-percentual>{texto}</span>;
  const largura = Math.min(100, Math.max(0, Number(valor)));
  return (
    <div className="flex min-w-32 items-center gap-2">
      <div
        role="meter"
        aria-label="Percentual de conformidade informado pelo backend"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(valor)}
        aria-valuetext={texto}
        className="h-2 w-20 overflow-hidden rounded bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${largura}%` }} />
      </div>
      <span data-percentual className="tabular-nums text-sm">
        {texto}
      </span>
    </div>
  );
}

function FilterBar({
  filtros,
  onMudar,
}: {
  filtros: FiltrosCompetencia;
  onMudar: (f: FiltrosCompetencia) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="v112-mes" className="text-sm font-medium">
          Competência
        </label>
        <input
          id="v112-mes"
          type="month"
          value={filtros.mes}
          onChange={(e) => onMudar({ ...filtros, mes: e.target.value })}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="v112-situacao" className="text-sm font-medium">
          Situação
        </label>
        <select
          id="v112-situacao"
          value={filtros.situacao}
          onChange={(e) => onMudar({ ...filtros, situacao: e.target.value })}
          className="h-11 rounded-md border border-input bg-background px-3 font-mono text-sm"
        >
          <option value="">Todas</option>
          {SITUACOES_COMPETENCIA.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={() => onMudar(FILTROS_COMPETENCIA_VAZIOS)}
      >
        Limpar filtros
      </Button>
    </div>
  );
}

function Pagination({
  pagina,
  total,
  onMudar,
}: {
  pagina: number;
  total: number;
  onMudar: (p: number) => void;
}) {
  if (total <= PAGINA_COMPETENCIAS) return null;
  const ultima = Math.max(0, Math.ceil(total / PAGINA_COMPETENCIAS) - 1);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={pagina === 0}
        onClick={() => onMudar(pagina - 1)}
      >
        Página anterior
      </Button>
      <span aria-live="polite">{`Página ${pagina + 1} de ${ultima + 1} · ${total} registros`}</span>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={pagina >= ultima}
        onClick={() => onMudar(pagina + 1)}
      >
        Próxima página
      </Button>
    </div>
  );
}

function CompetenceTable({ itens }: { itens: Competencia[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[56rem] text-sm">
        <caption className="sr-only">Competências do contrato</caption>
        <thead className="bg-muted/50">
          <tr>
            {[
              "Competência",
              "Período",
              "Data limite",
              "Situação",
              "Conformidade",
              "Versão do pacote",
              "Ações",
            ].map((h) => (
              <th key={h} scope="col" className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((c) => {
            const ref = formatarCompetencia(c.competencia_referencia);
            return (
              <tr key={c.id} className="border-t border-border">
                <th scope="row" className={`${TD} text-left font-medium`}>
                  {ref}
                </th>
                <td
                  className={TD}
                >{`${formatarDataBr(c.periodo_inicio)} a ${formatarDataBr(c.periodo_fim)}`}</td>
                <td className={TD}>{formatarDataBr(c.data_limite)}</td>
                <td className={TD}>
                  <StatusBadge situacao={c.situacao} />
                </td>
                <td className={TD}>
                  <PercentGauge valor={c.percentual_conformidade} />
                </td>
                <td className={TD}>{c.versao_pacote_atual ?? "—"}</td>
                <td className={TD}>
                  <Link
                    to="/competencias/$id"
                    params={{ id: c.id }}
                    aria-label={`Abrir competência ${ref}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>Abrir competência</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ListaCompetencias({ contrato, chave }: { contrato: string; chave: string[] }) {
  const [filtros, setFiltros] = useState<FiltrosCompetencia>(FILTROS_COMPETENCIA_VAZIOS);
  const [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ["v112", "competencias", ...chave, filtros.mes, filtros.situacao, pagina],
    queryFn: ({ signal }) => listarCompetencias(contrato, filtros, pagina, signal),
    retry: false,
    placeholderData: keepPreviousData,
  });
  return (
    <section
      aria-labelledby="v112-lista"
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="v112-lista" className="text-lg font-semibold">
          Lista de competências
        </h2>
        <Button asChild className="h-11">
          <Link to="/contratos/$id/competencias/nova" params={{ id: contrato }}>
            Nova competência
          </Link>
        </Button>
      </div>
      <FilterBar
        filtros={filtros}
        onMudar={(f) => {
          setFiltros(f);
          setPagina(0);
        }}
      />
      {q.isError ? (
        <Alerta
          mensagem={
            q.error instanceof ErroCompetencia && q.error.tipo === "negado"
              ? MENSAGENS_V112.negadoLista
              : MENSAGENS_V112.erroLista
          }
          onRetry={() => void q.refetch()}
        />
      ) : !q.data ? (
        <Carregando texto={MENSAGENS_V112.carregandoLista} />
      ) : q.data.itens.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          {MENSAGENS_V112.vazio}
        </p>
      ) : (
        <>
          <CompetenceTable itens={q.data.itens} />
          <Pagination pagina={pagina} total={q.data.total} onMudar={setPagina} />
        </>
      )}
    </section>
  );
}

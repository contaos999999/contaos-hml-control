/**
 * V1-13 — Nova competência.
 * Gate: UUID → getUser → preferência de organização → contrato RLS/contexto → capacidade efetiva.
 * Comando: RPC `criar_competencia` com contrato + `YYYY-MM-01`; snapshot é do backend.
 * Sem retry automático; resultado ambíguo é reconciliado por leitura exata.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroDetalhe,
  obterContrato,
  uuidCanonico,
  uuidValido,
} from "@/lib/contratos/contratoDetalheDados";
import { formatarCompetencia, mesParaReferencia } from "@/lib/contratos/competenciasDados";
import {
  ErroNovaCompetencia,
  criarCompetencia,
  consultarCapacidadeCriarCompetencia,
  verificarCompetenciaExistente,
} from "@/lib/contratos/novaCompetenciaDados";

export const MENSAGENS_V113 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contrato…",
  negado: "Você não tem acesso a este contrato.",
  naoEncontrado: "Contrato não encontrado.",
  consistencia:
    "Não foi possível exibir este contrato por uma inconsistência de acesso. Tente novamente mais tarde.",
  erro: "Não foi possível carregar o contrato agora. Tente novamente em instantes.",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  perfilNegado: "Seu perfil não permite criar competências neste contrato.",
  duplicada: "Já existe uma competência para este mês.",
  semPermissao: "Você não tem permissão para criar competências neste contrato.",
  erroCriar: "Não foi possível criar a competência agora. Tente novamente.",
  validacao: "Informe a competência no formato MM/AAAA.",
  criando: "Criando competência…",
} as const;

type Ctx = { idUsuario: string; idOrganizacao: string };

export function NovaCompetencia({ id }: { id: string }) {
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
      <nav
        aria-label="Navegação da página"
        className="border-b border-border bg-card text-card-foreground"
      >
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
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {!idOk ? (
          <>
            <Titulo />
            <Aviso
              icone={
                <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              }
              mensagem={MENSAGENS_V113.naoEncontrado}
            />
          </>
        ) : erroSessao ? (
          <>
            <Titulo />
            <Alerta
              mensagem={MENSAGENS_V113.erroSessao}
              onRetry={() => setTentativa((n) => n + 1)}
            />
          </>
        ) : !ctx ? (
          <>
            <Titulo />
            <Carregando texto={MENSAGENS_V113.verificando} />
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
        Nova competência
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
  const contrato = useQuery({
    queryKey: ["contratos", "detalhe", ctx.idUsuario, ctx.idOrganizacao, id],
    queryFn: ({ signal }) => obterContrato(id, signal),
    retry: false,
  });
  const c = contrato.data;
  const contextoDivergente =
    !!c &&
    (uuidCanonico(c.id) !== id ||
      uuidCanonico(c.id_organizacao) !== uuidCanonico(ctx.idOrganizacao));
  const contratoOk = !!c && !contextoDivergente;
  const perfil = useQuery({
    queryKey: ["v113", "capacidade-criar", ctx.idUsuario, ctx.idOrganizacao, id],
    queryFn: () => consultarCapacidadeCriarCompetencia(ctx.idOrganizacao, id),
    enabled: contratoOk,
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
            mensagem={MENSAGENS_V113.negado}
          />
        ) : tipo === "nao_encontrado" ? (
          <Aviso
            icone={
              <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            mensagem={MENSAGENS_V113.naoEncontrado}
          />
        ) : (
          <Alerta
            mensagem={tipo === "consistencia" ? MENSAGENS_V113.consistencia : MENSAGENS_V113.erro}
            onRetry={() => void contrato.refetch()}
          />
        )}
      </>
    );
  }
  if (contextoDivergente)
    return (
      <>
        <Titulo />
        <Aviso
          icone={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
          mensagem={MENSAGENS_V113.negado}
        />
      </>
    );
  if (!contratoOk || !c)
    return (
      <>
        <Titulo />
        <Carregando texto={MENSAGENS_V113.carregando} />
      </>
    );
  return (
    <>
      <Titulo numero={c.numero ?? undefined} />
      {perfil.isError ? (
        <Alerta mensagem={MENSAGENS_V113.erro} onRetry={() => void perfil.refetch()} />
      ) : perfil.isPending ? (
        <Carregando texto={MENSAGENS_V113.carregando} />
      ) : perfil.data !== true ? (
        <div role="alert" className="space-y-3 rounded-lg border border-border bg-card p-4">
          <p className="flex items-start gap-2 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            {MENSAGENS_V113.perfilNegado}
          </p>
          <VoltarLista id={c.id} />
        </div>
      ) : (
        <CompetenceForm idContrato={c.id} />
      )}
    </>
  );
}

function VoltarLista({ id, rotulo = "Voltar para competências" }: { id: string; rotulo?: string }) {
  return (
    <Button asChild variant="outline" className="h-11">
      <Link to="/contratos/$id/competencias" params={{ id }}>
        {rotulo}
      </Link>
    </Button>
  );
}

type Estado =
  | { k: "idle" }
  | { k: "submitting" }
  | { k: "duplicada" }
  | { k: "sem_permissao" }
  | { k: "validacao" }
  | { k: "erro" }
  | { k: "sucesso"; idCompetencia: string; ref: string };

function CompetenceForm({ idContrato }: { idContrato: string }) {
  const [mes, setMes] = useState("");
  const [estado, setEstado] = useState<Estado>({ k: "idle" });
  const pendente = useRef(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (pendente.current) return;
    if (!mesParaReferencia(mes)) return setEstado({ k: "validacao" });
    pendente.current = true;
    setEstado({ k: "submitting" });
    try {
      const idNova = await criarCompetencia(idContrato, mes);
      setEstado({ k: "sucesso", idCompetencia: idNova, ref: mes });
    } catch (err) {
      const tipo = err instanceof ErroNovaCompetencia ? err.tipo : "ambiguo";
      if (tipo === "ambiguo") {
        const existente = await verificarCompetenciaExistente(idContrato, mes);
        setEstado(existente ? { k: "sucesso", idCompetencia: existente, ref: mes } : { k: "erro" });
      } else if (tipo === "duplicada" || tipo === "sem_permissao" || tipo === "validacao") {
        setEstado({ k: tipo });
      } else setEstado({ k: "erro" });
    } finally {
      pendente.current = false;
    }
  }

  if (estado.k === "sucesso")
    return (
      <section role="status" className="space-y-3 rounded-xl border border-border bg-card p-4">
        <p className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          {`Competência ${formatarCompetencia(`${estado.ref}-01`)} criada. Os requisitos são preparados pelo sistema.`}
        </p>
        <VoltarLista id={idContrato} />
      </section>
    );

  const enviando = estado.k === "submitting";
  const msg =
    estado.k === "duplicada"
      ? MENSAGENS_V113.duplicada
      : estado.k === "sem_permissao"
        ? MENSAGENS_V113.semPermissao
        : estado.k === "validacao"
          ? MENSAGENS_V113.validacao
          : estado.k === "erro"
            ? MENSAGENS_V113.erroCriar
            : null;
  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
      aria-labelledby="v113-form"
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <h2 id="v113-form" className="text-lg font-semibold">
        Dados da competência
      </h2>
      <MonthPicker
        valor={mes}
        onMudar={setMes}
        desabilitado={enviando}
        invalido={estado.k === "validacao"}
      />
      {msg && (
        <p role="alert" className="flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          {msg}
        </p>
      )}
      {enviando && <Carregando texto={MENSAGENS_V113.criando} />}
      <FormActions idContrato={idContrato} enviando={enviando} />
    </form>
  );
}

function MonthPicker({
  valor,
  onMudar,
  desabilitado,
  invalido,
}: {
  valor: string;
  onMudar: (v: string) => void;
  desabilitado: boolean;
  invalido: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor="v113-mes" className="text-sm font-medium">
        Competência (mês/ano)
      </label>
      <input
        id="v113-mes"
        type="month"
        value={valor}
        disabled={desabilitado}
        aria-invalid={invalido || undefined}
        aria-describedby="v113-mes-ajuda"
        onChange={(e) => onMudar(e.target.value)}
        className="contaos-date-field block h-11 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p id="v113-mes-ajuda" className="text-xs text-muted-foreground">
        Formato MM/AAAA. O período e os requisitos são definidos pelo sistema.
      </p>
    </div>
  );
}

function FormActions({ idContrato, enviando }: { idContrato: string; enviando: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button asChild variant="outline" className="h-11">
        <Link to="/contratos/$id/competencias" params={{ id: idContrato }}>
          Cancelar
        </Link>
      </Button>
      <Button type="submit" className="h-11" disabled={enviando}>
        {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
        Criar competência
      </Button>
    </div>
  );
}

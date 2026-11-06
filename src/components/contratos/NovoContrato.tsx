import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import { listarOrganizacoesDisponiveis } from "@/lib/auth/resolverDestinoPosLogin";
import { consultarPermissoesEfetivas, temPermissao } from "@/lib/administracao/rbacRpc";
import { buscaContemAsterisco } from "@/lib/contratantes/contratantesDados";
import {
  ErroV105,
  buscarOpcoesContratantes,
  inserirContrato,
  montarPayloadContrato,
  validarFormularioContrato,
  type CampoContrato,
  type FormularioContrato,
  type OpcaoContratante,
} from "@/lib/contratos/novoContratoDados";

export const MENSAGENS_V105 = {
  verificando: "Verificando sessão…",
  validandoPermissao: "Validando permissão…",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  negado: "Você não tem permissão para cadastrar contratos nesta organização.",
  negadoInsert: "Você não tem permissão para cadastrar contratos nesta organização.",
  erroGate: "Não foi possível validar sua permissão agora. Tente novamente em instantes.",
  validacao: "Revise os campos destacados antes de salvar.",
  invalido: "Revise os dados informados.",
  duplicado: "Já existe um contrato com este número nesta organização.",
  erroEnvio: "Não foi possível cadastrar o contrato agora. Tente novamente em instantes.",
  sucesso: "Contrato cadastrado com sucesso.",
  carregandoOpcoes: "Carregando contratantes…",
  semOpcoes: "Nenhum contratante encontrado nesta organização.",
  erroOpcoes: "Não foi possível carregar os contratantes.",
  buscaAsterisco: "O caractere * não é permitido na busca.",
} as const;

const ERROS_CAMPO: Record<CampoContrato, string> = {
  numero: "Informe o número do contrato.",
  objeto: "Informe o objeto do contrato.",
  contratante: "Selecione um contratante da lista.",
  inicio: "Informe a data de início.",
  fim: "A data de término não pode ser anterior à data de início.",
  valorGlobal: "Informe um valor válido, por exemplo 1.234,56.",
  valorMensal: "Informe um valor válido, por exemplo 1.234,56.",
};

const IDS: Record<CampoContrato, string> = {
  numero: "v105-numero",
  objeto: "v105-objeto",
  contratante: "v105-contratante",
  inicio: "v105-inicio",
  fim: "v105-fim",
  valorGlobal: "v105-valor-global",
  valorMensal: "v105-valor-mensal",
};

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const campo = `h-11 w-full rounded-md border border-input bg-background px-3 text-sm aria-[invalid=true]:border-destructive ${foco}`;
const label = "text-sm font-medium";

const VAZIO: FormularioContrato = {
  numero: "",
  objeto: "",
  idContratante: "",
  inicio: "",
  fim: "",
  valorGlobal: "",
  valorMensal: "",
  tipoContrato: "",
  unidadeVinculada: "",
  fonteRecurso: "",
};

function Aviso(props: { icone: "negado" | "erro"; texto: string; children?: React.ReactNode }) {
  const Icone = props.icone === "negado" ? ShieldAlert : AlertCircle;
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="flex items-start gap-2">
        <Icone className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        <span>{props.texto}</span>
      </p>
      {props.children}
    </div>
  );
}

const rotuloOpcao = (o: OpcaoContratante) => o.razao_social + (o.nome_fantasia ? ` (${o.nome_fantasia})` : "");

function ContratanteCombobox(props: {
  idUsuario: string;
  idOrganizacao: string;
  valor: string;
  onSelecionar: (id: string) => void;
  invalido: boolean;
}) {
  const listaId = useId();
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const asterisco = buscaContemAsterisco(texto);

  useEffect(() => {
    if (asterisco) return;
    const t = setTimeout(() => setBusca(texto.trim().slice(0, 100)), 300);
    return () => clearTimeout(t);
  }, [texto, asterisco]);

  const q = useInfiniteQuery({
    queryKey: ["novoContrato", "contratantes", props.idUsuario, props.idOrganizacao, busca],
    queryFn: ({ pageParam, signal }) => buscarOpcoesContratantes({ idOrganizacao: props.idOrganizacao, busca, pagina: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (u) => u.proximaPagina,
    enabled: aberto && !asterisco,
    retry: false,
  });
  const opcoes = asterisco ? [] : (q.data?.pages.flatMap((p) => p.itens) ?? []);

  function escolher(o: OpcaoContratante) {
    props.onSelecionar(o.id);
    setTexto(rotuloOpcao(o));
    setAberto(false);
    setAtivo(-1);
  }

  function teclado(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberto(true);
      setAtivo((a) => Math.min(a + 1, opcoes.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && aberto && ativo >= 0 && opcoes[ativo]) {
      e.preventDefault();
      escolher(opcoes[ativo]);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAberto(false);
      }}
    >
      <input
        id={IDS.contratante}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={listaId}
        aria-required="true"
        aria-invalid={props.invalido || asterisco || undefined}
        aria-describedby={[`${IDS.contratante}-ajuda`, props.invalido && `${IDS.contratante}-erro`, asterisco && `${IDS.contratante}-busca`].filter(Boolean).join(" ")}
        aria-activedescendant={aberto && ativo >= 0 ? `${listaId}-${ativo}` : undefined}
        autoComplete="off"
        maxLength={100}
        placeholder="Buscar por razão social, nome fantasia ou documento"
        value={texto}
        onFocus={() => setAberto(true)}
        onChange={(e) => {
          setTexto(e.target.value);
          setAberto(true);
          setAtivo(-1);
          if (props.valor) props.onSelecionar("");
        }}
        onKeyDown={teclado}
        className={campo}
      />
      {asterisco && (
        <p id={`${IDS.contratante}-busca`} role="alert" className="mt-1 text-sm text-destructive">
          {MENSAGENS_V105.buscaAsterisco}
        </p>
      )}
      {aberto && !asterisco && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          {q.isPending ? (
            <p role="status" className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V105.carregandoOpcoes}
            </p>
          ) : q.isError ? (
            <div role="alert" className="flex flex-col gap-2 p-3 text-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" aria-hidden /> {MENSAGENS_V105.erroOpcoes}
              </span>
              <Button type="button" variant="outline" className="h-11 self-start" onClick={() => q.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
              </Button>
            </div>
          ) : opcoes.length === 0 ? (
            <p role="status" className="p-3 text-sm text-muted-foreground">
              {MENSAGENS_V105.semOpcoes}
            </p>
          ) : null}
          <ul id={listaId} role="listbox" aria-label="Contratantes">
            {opcoes.map((o, i) => (
              <li
                key={o.id}
                id={`${listaId}-${i}`}
                role="option"
                aria-selected={props.valor === o.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(o)}
                className={`flex min-h-11 cursor-pointer flex-col justify-center rounded px-3 py-2 text-sm ${i === ativo ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"}`}
              >
                <span className="break-words">{rotuloOpcao(o)}</span>
                <span className="text-xs text-muted-foreground">
                  {[o.documento, o.situacao === "inativo" ? "Inativo" : o.situacao === "ativo" ? "Ativo" : o.situacao].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
          {q.hasNextPage && (
            <Button type="button" variant="ghost" className="mt-1 h-11 w-full" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
              {q.isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              Carregar mais contratantes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NovoContrato() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [form, setForm] = useState<FormularioContrato>(VAZIO);
  const [invalidos, setInvalidos] = useState<CampoContrato[]>([]);
  const [erroEnvio, setErroEnvio] = useState<ErroV105["tipo"] | null>(null);
  const [negadoInsert, setNegadoInsert] = useState(false);
  const [criado, setCriado] = useState(false);
  const enviandoRef = useRef(false);
  const sucessoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let ativo = true;
    setVerificando(true);
    setErroSessao(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        const semSessao =
          !!error && ((error as { name?: string }).name === "AuthSessionMissingError" || (error as { code?: string }).code === "session_not_found");
        if (semSessao || (!error && !data.user)) {
          navigate({ to: "/login", replace: true });
          return;
        }
        if (error || !data.user) {
          setErroSessao(true);
          return;
        }
        const pref = obterPreferenciaOrganizacao(data.user.id);
        if (!pref) {
          navigate({ to: "/selecionar-organizacao", replace: true });
          return;
        }
        setIdUsuario(data.user.id);
        setIdOrganizacao(pref);
      })
      .catch(() => {
        if (ativo) setErroSessao(true);
      })
      .finally(() => {
        if (ativo) setVerificando(false);
      });
    return () => {
      ativo = false;
    };
  }, [navigate, tentativa]);

  const pronto = !!idUsuario && !!idOrganizacao;
  const gate = useQuery({
    queryKey: ["v105", "organizacoes", idUsuario, idOrganizacao],
    queryFn: async () => {
      if (!idOrganizacao) throw new Error("Contexto organizacional ausente");
      const [organizacoes, efetivas] = await Promise.all([
        listarOrganizacoesDisponiveis(), consultarPermissoesEfetivas(idOrganizacao, null),
      ]);
      return { organizacoes, permitido: temPermissao(efetivas.permissoes, "contratos", "criar") };
    },
    enabled: pronto,
    retry: false,
  });

  const mutacao = useMutation({ mutationFn: inserirContrato, retry: false });

  useEffect(() => {
    if (!criado) return;
    sucessoRef.current?.focus();
    const t = setTimeout(() => navigate({ to: "/contratos" }), 1200);
    return () => clearTimeout(t);
  }, [criado, navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviandoRef.current || !idOrganizacao) return;
    const inval = validarFormularioContrato(form);
    setInvalidos(inval);
    setErroEnvio(null);
    setNegadoInsert(false);
    const primeiro = inval[0];
    if (primeiro) {
      document.getElementById(IDS[primeiro])?.focus();
      return;
    }
    enviandoRef.current = true;
    try {
      await mutacao.mutateAsync(montarPayloadContrato(idOrganizacao, form));
      setCriado(true);
    } catch (err) {
      const tipo = err instanceof ErroV105 ? err.tipo : "erro";
      if (tipo === "negado") setNegadoInsert(true);
      else {
        setErroEnvio(tipo);
        if (tipo === "duplicado") requestAnimationFrame(() => document.getElementById(IDS.numero)?.focus());
      }
    } finally {
      enviandoRef.current = false;
    }
  }

  const set = (k: keyof FormularioContrato) => (ev: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: ev.target.value }));
  const inv = (c: CampoContrato) => invalidos.includes(c);
  const desc = (c: CampoContrato) => (inv(c) ? `${IDS[c]}-erro` : undefined);
  const Erro = ({ c }: { c: CampoContrato }) =>
    inv(c) ? (
      <p id={`${IDS[c]}-erro`} className="text-sm text-destructive">
        {ERROS_CAMPO[c]}
      </p>
    ) : null;
  const salvando = mutacao.isPending;

  const tipoGateErro = gate.error ? ((gate.error as { tipo?: string }).tipo === "negado" ? "negado" : "erro") : null;
  const autorizado = gate.isSuccess && gate.data.permitido && !!idOrganizacao &&
    gate.data.organizacoes.some((o) => o.id === idOrganizacao && o.situacao === "ativa");
  const negadoGate = tipoGateErro === "negado" || (gate.isSuccess && !autorizado);

  let corpo: React.ReactNode;
  if (verificando) {
    corpo = (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V105.verificando}
      </p>
    );
  } else if (erroSessao) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V105.erroSessao}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => setTentativa((t) => t + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (!pronto || gate.isPending) {
    corpo = (
      <div role="status" aria-label={MENSAGENS_V105.validandoPermissao} className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V105.validandoPermissao}
        </p>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  } else if (negadoGate) {
    corpo = (
      <Aviso icone="negado" texto={MENSAGENS_V105.negado}>
        <Button asChild variant="outline" className="h-11 self-start">
          <Link to="/contratos">Voltar para contratos</Link>
        </Button>
      </Aviso>
    );
  } else if (tipoGateErro) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V105.erroGate}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => gate.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (criado) {
    corpo = (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
        <h2 ref={sucessoRef} tabIndex={-1} className={`flex items-center gap-2 text-base font-semibold ${foco}`}>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {MENSAGENS_V105.sucesso}
        </h2>
        <p className="text-sm text-muted-foreground">Redirecionando para a lista de contratos…</p>
        <Button asChild className="h-11 self-start">
          <Link to="/contratos">Ir para contratos</Link>
        </Button>
      </div>
    );
  } else {
    corpo = (
      <form noValidate onSubmit={enviar} className="space-y-5" aria-labelledby="v105-dados" aria-busy={salvando}>
        <h2 id="v105-dados" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Dados do contrato
        </h2>
        {invalidos.length > 0 && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden /> {MENSAGENS_V105.validacao}
          </p>
        )}
        {negadoInsert && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden /> {MENSAGENS_V105.negadoInsert}
          </p>
        )}
        {erroEnvio && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            {erroEnvio === "duplicado" ? MENSAGENS_V105.duplicado : erroEnvio === "invalido" ? MENSAGENS_V105.invalido : MENSAGENS_V105.erroEnvio}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={IDS.numero} className={label}>
              Número <span aria-hidden>*</span>
            </label>
            <input id={IDS.numero} required aria-required="true" maxLength={100} value={form.numero} onChange={set("numero")} aria-invalid={inv("numero") || erroEnvio === "duplicado" || undefined} aria-describedby={desc("numero")} className={campo} />
            <Erro c="numero" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={IDS.contratante} className={label}>
              Contratante <span aria-hidden>*</span>
            </label>
            <p id={`${IDS.contratante}-ajuda`} className="text-xs text-muted-foreground">Digite para buscar contratantes desta organização.</p>
            {idUsuario && idOrganizacao && (
              <ContratanteCombobox
                idUsuario={idUsuario}
                idOrganizacao={idOrganizacao}
                valor={form.idContratante}
                invalido={inv("contratante")}
                onSelecionar={(id) => setForm((f) => ({ ...f, idContratante: id }))}
              />
            )}
            <Erro c="contratante" />
          </div>
          <div className="min-w-0 space-y-1.5 md:col-span-2">
            <label htmlFor={IDS.objeto} className={label}>
              Objeto <span aria-hidden>*</span>
            </label>
            <textarea id={IDS.objeto} required aria-required="true" rows={3} maxLength={2000} value={form.objeto} onChange={set("objeto")} aria-invalid={inv("objeto") || undefined} aria-describedby={desc("objeto")} className={`min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm aria-[invalid=true]:border-destructive ${foco}`} />
            <Erro c="objeto" />
          </div>
          <fieldset className="contents">
            <legend className="sr-only">Vigência</legend>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor={IDS.inicio} className={label}>
                Data de início <span aria-hidden>*</span>
              </label>
              <input id={IDS.inicio} type="date" required aria-required="true" value={form.inicio} onChange={set("inicio")} aria-invalid={inv("inicio") || undefined} aria-describedby={desc("inicio")} className={campo} />
              <Erro c="inicio" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor={IDS.fim} className={label}>
                Data de término
              </label>
              <input id={IDS.fim} type="date" min={form.inicio || undefined} value={form.fim} onChange={set("fim")} aria-invalid={inv("fim") || undefined} aria-describedby={desc("fim")} className={campo} />
              <Erro c="fim" />
            </div>
          </fieldset>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={IDS.valorGlobal} className={label}>
              Valor global (R$)
            </label>
            <input id={IDS.valorGlobal} inputMode="decimal" placeholder="0,00" value={form.valorGlobal} onChange={set("valorGlobal")} aria-invalid={inv("valorGlobal") || undefined} aria-describedby={desc("valorGlobal")} className={campo} />
            <Erro c="valorGlobal" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={IDS.valorMensal} className={label}>
              Valor mensal de referência (R$)
            </label>
            <input id={IDS.valorMensal} inputMode="decimal" placeholder="0,00" value={form.valorMensal} onChange={set("valorMensal")} aria-invalid={inv("valorMensal") || undefined} aria-describedby={desc("valorMensal")} className={campo} />
            <Erro c="valorMensal" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="v105-tipo" className={label}>
              Tipo de contrato
            </label>
            <input id="v105-tipo" maxLength={100} value={form.tipoContrato} onChange={set("tipoContrato")} className={campo} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="v105-unidade" className={label}>
              Unidade vinculada
            </label>
            <input id="v105-unidade" maxLength={200} value={form.unidadeVinculada} onChange={set("unidadeVinculada")} className={campo} />
          </div>
          <div className="min-w-0 space-y-1.5 md:col-span-2">
            <label htmlFor="v105-fonte" className={label}>
              Fonte de recurso
            </label>
            <input id="v105-fonte" maxLength={200} value={form.fonteRecurso} onChange={set("fonteRecurso")} className={campo} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <span aria-hidden>*</span> Campos obrigatórios. Situação inicial e criticidade são definidas pelo cadastro oficial.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
            <Link to="/contratos">Cancelar</Link>
          </Button>
          <Button type="submit" className="h-11 w-full sm:w-auto" disabled={salvando} aria-busy={salvando || undefined}>
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Salvando…
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav aria-label="Navegação da página" className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            
            <Button asChild variant="secondary" className="h-11">
              <Link to="/contratos">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Contratos
              </Link>
            </Button>
            
          </nav>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contratos</p>
          <h1 className="text-2xl font-semibold tracking-tight">Novo contrato</h1>
          <p className="text-sm text-muted-foreground">Cadastre um contrato e vincule-o a um contratante da organização selecionada.</p>
        </div>
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">{corpo}</section>
      </main>
    </div>
  );
}

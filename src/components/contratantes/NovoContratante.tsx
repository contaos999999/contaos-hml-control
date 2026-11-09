import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Info, Loader2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  ErroV102,
  consultarCapacidadeCadastro,
  inserirContratante,
  montarPayload,
  validarFormulario,
  capacidadePermiteCadastro,
  type CampoFormulario,
  type ContratanteCriado,
  type FormularioContratante,
} from "@/lib/contratantes/novoContratanteDados";

export const MENSAGENS_V102 = {
  verificando: "Verificando sessão…",
  validandoPermissao: "Validando permissão…",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  negado: "Você não tem permissão para cadastrar contratantes nesta organização.",
  negadoInsert: "Você não tem permissão para cadastrar contratantes nesta organização.",
  erroGate: "Não foi possível validar sua permissão agora. Tente novamente em instantes.",
  validacao: "Revise os campos destacados antes de salvar.",
  duplicado: "Já existe um contratante com este documento nesta organização.",
  invalido: "Alguns campos estão inválidos. Revise e tente novamente.",
  erroEnvio: "Não foi possível cadastrar o contratante agora. Tente novamente em instantes.",
  sucesso: "Contratante cadastrado com sucesso.",
} as const;

const ERROS_CAMPO: Record<CampoFormulario, string> = {
  razaoSocial: "Informe a razão social.",
  tipoPessoa: "Selecione o tipo de pessoa.",
  email: "Informe um e-mail válido, por exemplo nome@empresa.com.br.",
};

const IDS: Record<CampoFormulario | "documento", string> = {
  razaoSocial: "v102-razao",
  tipoPessoa: "v102-tipo",
  email: "v102-email",
  documento: "v102-documento",
};

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const campo = `h-11 w-full rounded-md border border-input bg-background px-3 text-sm aria-[invalid=true]:border-destructive ${foco}`;

const VAZIO: FormularioContratante = {
  razaoSocial: "",
  tipoPessoa: "",
  documento: "",
  nomeFantasia: "",
  email: "",
  telefone: "",
  situacao: "ativo",
};

function Dica({ rotulo, texto }: { rotulo: string; texto: string }) {
  const [aberta, setAberta] = useState(false);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={aberta} onOpenChange={setAberta}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={rotulo}
            onClick={(e) => {
              e.preventDefault();
              setAberta(true);
            }}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted-foreground ${foco}`}
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{texto}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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

export function NovoContratante() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [form, setForm] = useState<FormularioContratante>(VAZIO);
  const [invalidos, setInvalidos] = useState<CampoFormulario[]>([]);
  const [erroEnvio, setErroEnvio] = useState<ErroV102["tipo"] | null>(null);
  const [negadoInsert, setNegadoInsert] = useState(false);
  const [criado, setCriado] = useState<ContratanteCriado | null>(null);
  const enviandoRef = useRef(false);
  const tituloSucessoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let ativo = true;
    setVerificando(true);
    setErroSessao(false);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        const semSessao =
          !!error &&
          ((error as { name?: string }).name === "AuthSessionMissingError" || (error as { code?: string }).code === "session_not_found");
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
    queryKey: ["v102", "vinculo", idUsuario, idOrganizacao],
    queryFn: () => consultarCapacidadeCadastro(idOrganizacao!, idUsuario!),
    enabled: pronto,
    retry: false,
  });

  const mutacao = useMutation({
    mutationFn: inserirContratante,
    retry: false,
  });

  useEffect(() => {
    if (criado) tituloSucessoRef.current?.focus();
  }, [criado]);

  function focar(id: string) {
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviandoRef.current || !idOrganizacao) return;
    const inval = validarFormulario(form);
    setInvalidos(inval);
    setErroEnvio(null);
    const primeiro = inval[0];
    if (primeiro) {
      document.getElementById(IDS[primeiro])?.focus();
      return;
    }
    enviandoRef.current = true;
    try {
      const r = await mutacao.mutateAsync(montarPayload(idOrganizacao, form));
      setCriado(r);
      setForm(VAZIO);
    } catch (err) {
      const tipo = err instanceof ErroV102 ? err.tipo : "erro";
      if (tipo === "negado") setNegadoInsert(true);
      else {
        setErroEnvio(tipo);
        if (tipo === "duplicado") focar(IDS.documento);
      }
    } finally {
      enviandoRef.current = false;
    }
  }

  const set = (k: keyof FormularioContratante) => (ev: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: ev.target.value }));
  const inv = (c: CampoFormulario) => invalidos.includes(c);
  const desc = (c: CampoFormulario) => (inv(c) ? `${IDS[c]}-erro` : undefined);
  const salvando = mutacao.isPending;

  const gateErro = gate.error instanceof ErroV102 ? gate.error.tipo : gate.error ? "erro" : null;
  const autorizado = gate.isSuccess && capacidadePermiteCadastro(gate.data ?? null);
  const negadoGate = gateErro === "negado" || (gate.isSuccess && !autorizado);

  let corpo: React.ReactNode;
  if (verificando) {
    corpo = (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V102.verificando}
      </p>
    );
  } else if (erroSessao) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V102.erroSessao}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => setTentativa((t) => t + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (!pronto || gate.isPending) {
    corpo = (
      <div role="status" aria-label={MENSAGENS_V102.validandoPermissao} className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V102.validandoPermissao}
        </p>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  } else if (negadoGate || negadoInsert) {
    corpo = (
      <Aviso icone="negado" texto={negadoInsert ? MENSAGENS_V102.negadoInsert : MENSAGENS_V102.negado}>
        <Button asChild variant="outline" className="h-11 self-start">
          <Link to="/contratantes">Voltar para contratantes</Link>
        </Button>
      </Aviso>
    );
  } else if (gateErro) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V102.erroGate}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => gate.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (criado) {
    corpo = (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
        <h2 ref={tituloSucessoRef} tabIndex={-1} className={`flex items-center gap-2 text-base font-semibold ${foco}`}>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {MENSAGENS_V102.sucesso}
        </h2>
        <p className="break-words text-sm text-muted-foreground">{criado.razao_social}</p>
        <Button asChild className="h-11 self-start">
          <Link to="/contratantes">Voltar para contratantes</Link>
        </Button>
      </div>
    );
  } else {
    const label = "text-sm font-medium";
    corpo = (
      <form noValidate onSubmit={enviar} className="space-y-5" aria-labelledby="v102-dados">
        <h2 id="v102-dados" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Dados do contratante
        </h2>
        {invalidos.length > 0 && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden /> {MENSAGENS_V102.validacao}
          </p>
        )}
        {erroEnvio && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            {erroEnvio === "duplicado" ? MENSAGENS_V102.duplicado : erroEnvio === "invalido" ? MENSAGENS_V102.invalido : MENSAGENS_V102.erroEnvio}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1.5 md:col-span-2">
            <label htmlFor={IDS.razaoSocial} className={label}>
              Razão social <span aria-hidden>*</span>
            </label>
            <input id={IDS.razaoSocial} required aria-required="true" maxLength={300} value={form.razaoSocial} onChange={set("razaoSocial")} aria-invalid={inv("razaoSocial") || undefined} aria-describedby={desc("razaoSocial")} className={campo} />
            {inv("razaoSocial") && <p id={`${IDS.razaoSocial}-erro`} className="text-sm text-destructive">{ERROS_CAMPO.razaoSocial}</p>}
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={IDS.tipoPessoa} className={label}>
              Tipo de pessoa <span aria-hidden>*</span>
            </label>
            <select id={IDS.tipoPessoa} required aria-required="true" value={form.tipoPessoa} onChange={set("tipoPessoa")} aria-invalid={inv("tipoPessoa") || undefined} aria-describedby={desc("tipoPessoa")} className={campo}>
              <option value="">Selecione</option>
              <option value="juridica">Pessoa jurídica</option>
              <option value="fisica">Pessoa física</option>
              <option value="orgao_publico">Órgão público</option>
              <option value="outro">Outro</option>
            </select>
            {inv("tipoPessoa") && <p id={`${IDS.tipoPessoa}-erro`} className="text-sm text-destructive">{ERROS_CAMPO.tipoPessoa}</p>}
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-1">
              <label htmlFor={IDS.documento} className={label}>
                Documento
              </label>
              <Dica rotulo="Sobre Documento" texto="Opcional. CPF, CNPJ ou outro identificador; a duplicidade é verificada pelo cadastro oficial na organização." />
            </div>
            <input id={IDS.documento} maxLength={60} value={form.documento} onChange={set("documento")} aria-invalid={erroEnvio === "duplicado" || undefined} className={campo} />
          </div>
          <div className="min-w-0 space-y-1.5 md:col-span-2">
            <label htmlFor="v102-fantasia" className={label}>
              Nome fantasia
            </label>
            <input id="v102-fantasia" maxLength={300} value={form.nomeFantasia} onChange={set("nomeFantasia")} className={campo} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-1">
              <label htmlFor={IDS.email} className={label}>
                E-mail
              </label>
              <Dica rotulo="Sobre Contato" texto="E-mail e telefone são opcionais; apenas os preenchidos são registrados." />
            </div>
            <input id={IDS.email} type="email" inputMode="email" autoComplete="email" maxLength={254} value={form.email} onChange={set("email")} aria-invalid={inv("email") || undefined} aria-describedby={desc("email")} className={campo} />
            {inv("email") && <p id={`${IDS.email}-erro`} className="text-sm text-destructive">{ERROS_CAMPO.email}</p>}
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="v102-telefone" className={label}>
              Telefone
            </label>
            <input id="v102-telefone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="(11) 91234-5678" value={form.telefone} onChange={set("telefone")} className={campo} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="v102-situacao" className={label}>
              Situação
            </label>
            <select id="v102-situacao" value={form.situacao} onChange={set("situacao")} className={campo}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <span aria-hidden>*</span> Campos obrigatórios.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
            <Link to="/contratantes">Cancelar</Link>
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
      
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight">Novo contratante</h1>
          <p className="text-sm text-muted-foreground">Cadastre um contratante na organização selecionada.</p>
        </div>
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">{corpo}</section>
      </main>
    </div>
  );
}

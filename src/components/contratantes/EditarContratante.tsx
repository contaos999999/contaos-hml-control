import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Info, Loader2, LogOut, RefreshCw, ShieldAlert, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obterPreferenciaOrganizacao } from "@/lib/organizacao/preferenciaOrganizacao";
import {
  consultarVinculoProprio,
  ErroV102,
  validarFormulario,
  vinculoPermiteCadastro,
  type CampoFormulario,
  type FormularioContratante,
} from "@/lib/contratantes/novoContratanteDados";
import {
  atualizarContratante,
  buscarContratante,
  ErroV103,
  formularioDe,
  montarArgsAtualizacao,
  type ContratanteEdicao,
  type TipoErroV103,
} from "@/lib/contratantes/editarContratanteDados";

export const MENSAGENS_V103 = {
  verificando: "Verificando sessão…",
  carregando: "Carregando contratante…",
  erroSessao: "Não foi possível verificar sua sessão agora. Tente novamente em instantes.",
  negado: "Você não tem permissão para editar contratantes nesta organização.",
  erroGate: "Não foi possível validar sua permissão agora. Tente novamente em instantes.",
  naoEncontrado: "Contratante não encontrado nesta organização.",
  erroCarga: "Não foi possível carregar o contratante agora. Tente novamente em instantes.",
  validacao: "Revise os campos destacados antes de salvar.",
  duplicado: "Já existe um contratante com este documento nesta organização.",
  invalido: "Alguns campos estão inválidos. Revise e tente novamente.",
  erroEnvio: "Não foi possível salvar as alterações agora. Tente novamente em instantes.",
  sucesso: "Contratante atualizado com sucesso.",
  conflitoTitulo: "Este contratante foi alterado por outra pessoa",
  conflitoTexto:
    "Suas alterações não foram salvas. Os valores que você digitou continuam no formulário. Recarregue a versão atual para revisar antes de salvar novamente.",
  reloadNaoEncontrado: "O contratante não existe mais nesta organização. Seus valores locais foram mantidos.",
  reloadNegado: "Você não tem mais permissão para ver este contratante. Seus valores locais foram mantidos.",
  reloadErro: "Não foi possível recarregar a versão atual. Seus valores locais foram mantidos.",
} as const;

const ERROS_CAMPO: Record<CampoFormulario, string> = {
  razaoSocial: "Informe a razão social.",
  tipoPessoa: "Selecione o tipo de pessoa.",
  email: "Informe um e-mail válido, por exemplo nome@empresa.com.br.",
};

const IDS: Record<CampoFormulario | "documento", string> = {
  razaoSocial: "v103-razao",
  tipoPessoa: "v103-tipo",
  email: "v103-email",
  documento: "v103-documento",
};

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const campo = `h-11 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60 aria-[invalid=true]:border-destructive ${foco}`;

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
            className={`-my-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted-foreground ${foco}`}
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

const Voltar = () => (
  <Button asChild variant="outline" className="h-11 self-start">
    <Link to="/contratantes">Voltar para contratantes</Link>
  </Button>
);

type EstadoConflito = { reload: "ocioso" | "carregando" | "nao_encontrado" | "negado" | "erro" };

export function EditarContratante({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [form, setForm] = useState<FormularioContratante | null>(null);
  const [versaoLida, setVersaoLida] = useState<number | null>(null);
  const [invalidos, setInvalidos] = useState<CampoFormulario[]>([]);
  const [erroEnvio, setErroEnvio] = useState<TipoErroV103 | null>(null);
  const [negadoSave, setNegadoSave] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [conflito, setConflito] = useState<EstadoConflito | null>(null);
  const [recarregado, setRecarregado] = useState<number | null>(null);
  const [atualizado, setAtualizado] = useState<ContratanteEdicao | null>(null);
  const enviandoRef = useRef(false);
  const tituloSucessoRef = useRef<HTMLHeadingElement>(null);
  const tituloConflitoRef = useRef<HTMLHeadingElement>(null);
  const avisoRecargaRef = useRef<HTMLParagraphElement>(null);
  const salvarRef = useRef<HTMLButtonElement>(null);

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
    queryKey: ["v103", "vinculo", idUsuario, idOrganizacao],
    queryFn: () => consultarVinculoProprio(idOrganizacao!, idUsuario!),
    enabled: pronto,
    retry: false,
  });
  const gateErro = gate.error instanceof ErroV102 ? gate.error.tipo : gate.error ? "erro" : null;
  const autorizado = gate.isSuccess && vinculoPermiteCadastro(gate.data ?? null);
  const negadoGate = gateErro === "negado" || (gate.isSuccess && !autorizado);

  const registro = useQuery({
    queryKey: ["v103", "contratante", idUsuario, idOrganizacao, id],
    queryFn: () => buscarContratante(idOrganizacao!, id),
    enabled: pronto && autorizado,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (registro.data && form === null) {
      setForm(formularioDe(registro.data));
      setVersaoLida(registro.data.versao_registro);
    }
  }, [registro.data, form]);

  useEffect(() => {
    if (atualizado) tituloSucessoRef.current?.focus();
  }, [atualizado]);
  useEffect(() => {
    if (conflito?.reload === "ocioso") tituloConflitoRef.current?.focus();
  }, [conflito]);
  useEffect(() => {
    if (recarregado !== null) avisoRecargaRef.current?.focus();
  }, [recarregado]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviandoRef.current || !idOrganizacao || !form || versaoLida === null || conflito) return;
    const inval = validarFormulario(form);
    setInvalidos(inval);
    setErroEnvio(null);
    setRecarregado(null);
    if (inval[0]) {
      document.getElementById(IDS[inval[0]])?.focus();
      return;
    }
    enviandoRef.current = true;
    setSalvando(true);
    try {
      const r = await atualizarContratante(montarArgsAtualizacao(idOrganizacao, id, versaoLida, form));
      setAtualizado(r);
      queryClient.removeQueries({ queryKey: ["v103", "contratante"] });
    } catch (err) {
      const tipo = err instanceof ErroV103 ? err.tipo : "erro";
      if (tipo === "negado") setNegadoSave(true);
      else if (tipo === "conflito") setConflito({ reload: "ocioso" });
      else {
        setErroEnvio(tipo);
        if (tipo === "duplicado") requestAnimationFrame(() => document.getElementById(IDS.documento)?.focus());
      }
    } finally {
      enviandoRef.current = false;
      setSalvando(false);
    }
  }

  async function recarregar() {
    if (!idOrganizacao || conflito?.reload === "carregando") return;
    setConflito({ reload: "carregando" });
    try {
      const atual = await buscarContratante(idOrganizacao, id);
      setForm(formularioDe(atual));
      setVersaoLida(atual.versao_registro);
      setInvalidos([]);
      setErroEnvio(null);
      setConflito(null);
      setRecarregado(atual.versao_registro);
    } catch (err) {
      const tipo = err instanceof ErroV103 ? err.tipo : "erro";
      setConflito({ reload: tipo === "nao_encontrado" ? "nao_encontrado" : tipo === "negado" ? "negado" : "erro" });
    }
  }

  function fecharConflito() {
    setConflito(null);
    requestAnimationFrame(() => salvarRef.current?.focus());
  }

  const set = (k: keyof FormularioContratante) => (ev: { target: { value: string } }) =>
    setForm((f) => (f ? { ...f, [k]: ev.target.value } : f));
  const inv = (c: CampoFormulario) => invalidos.includes(c);
  const desc = (c: CampoFormulario) => (inv(c) ? `${IDS[c]}-erro` : undefined);
  const regErro = registro.error instanceof ErroV103 ? registro.error.tipo : registro.error ? "erro" : null;

  let corpo: React.ReactNode;
  if (verificando) {
    corpo = (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V103.verificando}
      </p>
    );
  } else if (erroSessao) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V103.erroSessao}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => setTentativa((t) => t + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (negadoGate || negadoSave || (regErro === "negado" && !form)) {
    corpo = (
      <Aviso icone="negado" texto={MENSAGENS_V103.negado}>
        <Voltar />
      </Aviso>
    );
  } else if (gateErro) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V103.erroGate}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => gate.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (atualizado) {
    corpo = (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
        <h2 ref={tituloSucessoRef} tabIndex={-1} className={`flex items-center gap-2 text-base font-semibold ${foco}`}>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {MENSAGENS_V103.sucesso}
        </h2>
        <p className="break-words text-sm text-muted-foreground">
          {atualizado.razao_social} · Versão {atualizado.versao_registro}
        </p>
        <Button asChild className="h-11 self-start">
          <Link to="/contratantes">Voltar para contratantes</Link>
        </Button>
      </div>
    );
  } else if (regErro === "nao_encontrado" && !form) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V103.naoEncontrado}>
        <Voltar />
      </Aviso>
    );
  } else if (regErro === "erro" && !form) {
    corpo = (
      <Aviso icone="erro" texto={MENSAGENS_V103.erroCarga}>
        <Button type="button" variant="outline" className="h-11 self-start" onClick={() => registro.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Tentar novamente
        </Button>
      </Aviso>
    );
  } else if (!form || versaoLida === null) {
    corpo = (
      <div role="status" aria-label={MENSAGENS_V103.carregando} className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {MENSAGENS_V103.carregando}
        </p>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  } else {
    const label = "text-sm font-medium";
    const bloq = !!conflito || salvando;
    const msgReload =
      conflito?.reload === "nao_encontrado"
        ? MENSAGENS_V103.reloadNaoEncontrado
        : conflito?.reload === "negado"
          ? MENSAGENS_V103.reloadNegado
          : conflito?.reload === "erro"
            ? MENSAGENS_V103.reloadErro
            : null;
    corpo = (
      <div className="space-y-5">
        {conflito && (
          <div role="alert" aria-labelledby="v103-conflito-titulo" className="flex flex-col gap-3 rounded-md border-2 border-destructive bg-destructive/5 p-4 text-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 id="v103-conflito-titulo" ref={tituloConflitoRef} tabIndex={-1} className={`flex items-start gap-2 text-base font-semibold ${foco}`}>
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
                {MENSAGENS_V103.conflitoTitulo}
              </h2>
              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Fechar aviso" onClick={fecharConflito}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <p>{MENSAGENS_V103.conflitoTexto}</p>
            {msgReload && <p className="font-medium text-destructive">{msgReload}</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="h-11" onClick={recarregar} disabled={conflito.reload === "carregando"} aria-busy={conflito.reload === "carregando" || undefined}>
                {conflito.reload === "carregando" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="mr-2 h-4 w-4" aria-hidden />}
                Recarregar versão atual
              </Button>
              <Button type="button" variant="outline" className="h-11" onClick={fecharConflito}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {recarregado !== null && (
          <p ref={avisoRecargaRef} tabIndex={-1} role="status" className={`flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm ${foco}`}>
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            Seus dados locais foram substituídos pela versão atual (versão {recarregado}). Revise e salve novamente.
          </p>
        )}
        <form noValidate onSubmit={enviar} className="space-y-5" aria-labelledby="v103-dados">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="v103-dados" className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Dados do contratante
            </h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Versão {versaoLida}
              <Dica
                rotulo="Sobre a versão do registro"
                texto="Se outra pessoa salvar este contratante antes de você, o sistema bloqueia o seu envio para que nada seja sobrescrito sem revisão."
              />
            </p>
          </div>
          {invalidos.length > 0 && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden /> {MENSAGENS_V103.validacao}
            </p>
          )}
          {erroEnvio && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              {erroEnvio === "duplicado" ? MENSAGENS_V103.duplicado : erroEnvio === "invalido" ? MENSAGENS_V103.invalido : MENSAGENS_V103.erroEnvio}
            </p>
          )}
          <fieldset disabled={!!conflito} className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <legend className="sr-only">Campos do contratante</legend>
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
              <label htmlFor={IDS.documento} className={label}>
                Documento
              </label>
              <input id={IDS.documento} maxLength={60} value={form.documento} onChange={set("documento")} aria-invalid={erroEnvio === "duplicado" || undefined} className={campo} />
            </div>
            <div className="min-w-0 space-y-1.5 md:col-span-2">
              <label htmlFor="v103-fantasia" className={label}>
                Nome fantasia
              </label>
              <input id="v103-fantasia" maxLength={300} value={form.nomeFantasia} onChange={set("nomeFantasia")} className={campo} />
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor={IDS.email} className={label}>
                E-mail
              </label>
              <input id={IDS.email} type="email" inputMode="email" autoComplete="email" maxLength={254} value={form.email} onChange={set("email")} aria-invalid={inv("email") || undefined} aria-describedby={desc("email")} className={campo} />
              {inv("email") && <p id={`${IDS.email}-erro`} className="text-sm text-destructive">{ERROS_CAMPO.email}</p>}
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="v103-telefone" className={label}>
                Telefone
              </label>
              <input id="v103-telefone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} value={form.telefone} onChange={set("telefone")} className={campo} />
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="v103-situacao" className={label}>
                Situação
              </label>
              <select id="v103-situacao" value={form.situacao} onChange={set("situacao")} className={campo}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </fieldset>
          <p className="text-xs text-muted-foreground">
            <span aria-hidden>*</span> Campos obrigatórios.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
              <Link to="/contratantes">Cancelar</Link>
            </Button>
            <Button ref={salvarRef} type="submit" className="h-11 w-full sm:w-auto" disabled={bloq} aria-busy={salvando || undefined}>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav aria-label="Navegação da página" className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          
          <nav aria-label="Navegação" className="flex flex-wrap gap-2">
            
            <Button asChild variant="secondary" className="h-11">
              <Link to="/contratantes">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Contratantes
              </Link>
            </Button>
            
          </nav>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight">Editar contratante</h1>
          <p className="text-sm text-muted-foreground">Altere os dados do contratante na organização selecionada.</p>
        </div>
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">{corpo}</section>
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ErroAdm,
  MENSAGENS_ADM01,
  convidarUsuario,
  listarEscopo,
  salvarVinculo,
  textoErro,
  type PayloadSalvar,
  type Perfil,
  type TipoErro,
  type UsuarioVinculo,
} from "@/lib/administracao/admUsuariosRpc";
import { alternar, criarDelta, idsAtivar, idsRevogar, registrarBaseline, valorExibido } from "@/lib/administracao/deltaEscopo";
import { assinarPayload, criarGerenciadorIntencao } from "@/lib/administracao/intencaoIdempotente";
import { InviteLinkUserForm } from "./InviteLinkUserForm";
import { RoleSelect } from "./RoleSelect";

export type ModoVinculo = { tipo: "editar"; usuario: UsuarioVinculo } | { tipo: "novo" };

const MSG_SALVAR: Record<TipoErro, string> = {
  negado: MENSAGENS_ADM01.negado,
  conflito: MENSAGENS_ADM01.conflito,
  contaInexistente: MENSAGENS_ADM01.contaInexistente,
  vinculoDesatualizado: MENSAGENS_ADM01.vinculoDesatualizado,
  validacao: MENSAGENS_ADM01.validacao,
  conflitoIdempotencia: MENSAGENS_ADM01.conflitoIdempotencia,
  emProcessamento: MENSAGENS_ADM01.emProcessamento,
  conviteNaoEnviado: MENSAGENS_ADM01.conviteNaoEnviado,
  muitoGrande: MENSAGENS_ADM01.muitoGrande,
  sessaoInvalida: MENSAGENS_ADM01.sessaoInvalida,
  erro: MENSAGENS_ADM01.erroSalvar,
};

export function ContractScopeDialog(props: {
  org: string;
  modo: ModoVinculo;
  perfis: Perfil[];
  onFechar: () => void;
  onSalvo: (correlationId: string, aviso?: string) => void;
  obterUsuarioAtual: (idUsuario: string) => Promise<UsuarioVinculo | null>;
  onRecarregarLista: () => void;
}) {
  const u = props.modo.tipo === "editar" ? props.modo.usuario : null;
  const idUsuario = u?.id_usuario ?? null;
  const intencao = useRef(criarGerenciadorIntencao());
  const intencaoConvite = useRef(criarGerenciadorIntencao());
  // Identidade já obtida pela Edge para o e-mail corrente: retry do vínculo não repete o convite.
  const identidade = useRef<{ email: string; id: string; codigo: string } | null>(null);
  const salvandoRef = useRef(false);

  const [email, setEmail] = useState("");
  const [nomeNovo, setNomeNovo] = useState("");
  const [perfil, setPerfil] = useState(u?.vinculo.perfil ?? "");
  const [ativo, setAtivo] = useState(u?.vinculo.ativo ?? true);
  const [todos, setTodos] = useState(u?.vinculo.escopo_todos_contratos ?? false);
  const [versao, setVersao] = useState<number | null>(u?.vinculo.versao_registro ?? null);
  const [delta, setDelta] = useState(criarDelta);
  const [pagina, setPagina] = useState(1);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [busca, setBusca] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<TipoErro | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const b = buscaTexto.trim() || null;
      setBusca((atual) => {
        if (atual !== b) setPagina(1);
        return b;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [buscaTexto]);

  const escopo = useQuery({
    queryKey: ["adm01", "escopo", props.org, idUsuario, pagina, busca, nonce],
    queryFn: () => listarEscopo(props.org, idUsuario, pagina, busca),
    retry: false,
  });

  useEffect(() => {
    if (escopo.data) setDelta((d) => registrarBaseline(d, escopo.data.itens));
  }, [escopo.data]);

  function fechar() {
    intencao.current.encerrar();
    intencaoConvite.current.encerrar();
    props.onFechar();
  }

  function alternarTodos(v: boolean) {
    setErro(null);
    intencao.current.encerrar();
    setTodos(v);
    if (v) {
      setDelta((d) => ({ ...d, ativar: new Set(), revogar: new Set() }));
    } else {
      setDelta(criarDelta());
      setPagina(1);
      setNonce((n) => n + 1);
    }
  }

  async function recarregarERevisar() {
    intencao.current.encerrar();
    setErro(null);
    if (idUsuario) {
      const atual = await props.obterUsuarioAtual(idUsuario);
      if (!atual) {
        setErro("vinculoDesatualizado");
        return;
      }
      setVersao(atual.vinculo.versao_registro);
      setPerfil(atual.vinculo.perfil);
      setAtivo(atual.vinculo.ativo);
      setTodos(atual.vinculo.escopo_todos_contratos);
    }
    setDelta(criarDelta());
    setPagina(1);
    setNonce((n) => n + 1);
  }

  async function salvar() {
    if (salvandoRef.current) return;
    const emailLimpo = email.trim();
    if (!perfil || (!u && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo))) {
      setErro("validacao");
      return;
    }
    salvandoRef.current = true;
    setSalvando(true);
    setErro(null);
    let idDestino = idUsuario;
    if (!u) {
      if (identidade.current?.email !== emailLimpo) {
        const nomeLimpo = nomeNovo.trim();
        const base = { id_organizacao: props.org, email: emailLimpo, ...(nomeLimpo ? { nome: nomeLimpo } : {}) };
        const chaveConvite = intencaoConvite.current.chavePara(assinarPayload(base));
        try {
          const r = await convidarUsuario({ ...base, chave_idempotencia: chaveConvite });
          identidade.current = { email: emailLimpo, id: r.id_usuario, codigo: r.codigo };
          intencaoConvite.current.encerrar();
        } catch (e) {
          const t = e instanceof ErroAdm ? e.tipo : "erro";
          if (t === "conflitoIdempotencia") intencaoConvite.current.encerrar();
          setErro(t);
          salvandoRef.current = false;
          setSalvando(false);
          return;
        }
      }
      idDestino = identidade.current!.id;
    }
    const payload: PayloadSalvar = {
      p_id_organizacao: props.org,
      p_id_usuario: idDestino,
      p_email: u ? null : emailLimpo,
      p_perfil: perfil,
      p_escopo_todos_contratos: todos,
      p_ativo: ativo,
      p_ids_contratos_ativar: todos ? [] : idsAtivar(delta),
      p_ids_contratos_revogar: todos ? [] : idsRevogar(delta),
      p_versao_esperada: u ? versao : null,
    };
    const chave = intencao.current.chavePara(assinarPayload(payload));
    try {
      const r = await salvarVinculo(payload, chave, u ? "salvarEdicao" : "salvarNovo");
      intencao.current.encerrar();
      const aviso = u
        ? undefined
        : identidade.current?.codigo === "USUARIO_CONVIDADO"
          ? MENSAGENS_ADM01.usuarioConvidado
          : MENSAGENS_ADM01.usuarioExistente;
      props.onSalvo(r.correlation_id, aviso);
    } catch (e) {
      setErro(e instanceof ErroAdm ? e.tipo : "erro");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  const erroEscopo = escopo.error instanceof ErroAdm ? escopo.error.tipo : escopo.error ? "erro" : null;
  const nome = u ? u.nome || u.email || "usuário" : null;

  return (
    <Dialog open onOpenChange={(o) => !o && fechar()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{u ? `Editar vínculo de ${nome}` : "Convidar ou vincular usuário"}</DialogTitle>
          <DialogDescription>
            {u ? `${u.email ?? ""}` : "Localiza a conta pelo e-mail ou envia convite e, em seguida, salva o vínculo nesta organização."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!u && (
            <InviteLinkUserForm
              email={email}
              nome={nomeNovo}
              onEmail={(v) => (setEmail(v), setErro(null))}
              onNome={(v) => (setNomeNovo(v), setErro(null))}
              disabled={salvando || erro === "emProcessamento"}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <RoleSelect id="adm01-perfil" valor={perfil} perfis={props.perfis} onChange={(v) => (setPerfil(v), setErro(null))} disabled={salvando} />
            <div className="flex items-end">
              <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="h-5 w-5" checked={ativo} disabled={salvando} onChange={(e) => (setAtivo(e.target.checked), setErro(null))} />
                Vínculo ativo
              </label>
            </div>
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-3">
            <legend className="px-1 text-sm font-semibold text-foreground">Escopo contratual</legend>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" className="h-5 w-5" checked={todos} disabled={salvando} onChange={(e) => alternarTodos(e.target.checked)} />
              Acesso a todos os contratos
            </label>
            <div className="space-y-1.5">
              <label htmlFor="adm01-busca-contratos" className="text-sm font-medium text-foreground">
                Buscar contratos
              </label>
              <input
                id="adm01-busca-contratos"
                type="search"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {escopo.isPending ? (
              <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando contratos…
              </p>
            ) : erroEscopo ? (
              <div role="alert" className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <p>{textoErro(escopo.error)}</p>
                {erroEscopo === "vinculoDesatualizado" ? (
                  <Button type="button" variant="outline" className="h-11" onClick={() => (props.onRecarregarLista(), fechar())}>
                    Recarregar lista
                  </Button>
                ) : erroEscopo === "erro" ? (
                  <Button type="button" variant="outline" className="h-11" onClick={() => escopo.refetch()}>
                    Tentar novamente
                  </Button>
                ) : null}
              </div>
            ) : (escopo.data?.itens ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{MENSAGENS_ADM01.escopoVazio}</p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {(escopo.data?.itens ?? []).map((c) => (
                  <li key={c.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex min-h-11 items-center gap-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        className="h-5 w-5 shrink-0"
                        checked={valorExibido(delta, c.id)}
                        disabled={todos || salvando}
                        onChange={() => (setDelta((d) => alternar(d, c.id, !valorExibido(d, c.id))), setErro(null))}
                      />
                      <span className="break-words">{`Contrato ${c.numero ?? "—"} — ${c.objeto ?? "—"}`}</span>
                    </label>
                    <p className="pl-8 text-xs text-muted-foreground sm:pl-0 sm:text-right">
                      Situação: {c.situacao ?? "—"} • Criticidade: {c.criticidade ?? "—"} •{" "}
                      <span>{`Acesso atual: ${c.acesso_efetivo ? "sim" : "não"}`}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {escopo.data && escopo.data.total_paginas > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Button type="button" variant="outline" className="h-11" aria-label="Página anterior de contratos" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                  Anterior
                </Button>
                <span>{`Página ${escopo.data.pagina} de ${escopo.data.total_paginas}`}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  aria-label="Próxima página de contratos"
                  disabled={pagina >= escopo.data.total_paginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Somente os contratos que você alterar serão enviados. Contratos não alterados permanecem como estão.
            </p>
          </fieldset>

          {erro === "emProcessamento" && (
            <div role="status" className="flex gap-2 rounded-md border border-border bg-muted p-3 text-sm text-foreground">
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="space-y-2">
                <p>{MSG_SALVAR.emProcessamento}</p>
                <Button type="button" variant="outline" className="h-11" disabled={salvando} onClick={salvar}>
                  Consultar novamente
                </Button>
              </div>
            </div>
          )}
          {erro && erro !== "emProcessamento" && (
            <div role="alert" className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <div className="space-y-2">
                <p>{MSG_SALVAR[erro]}</p>
                {erro === "conflito" && (
                  <Button type="button" variant="outline" className="h-11" onClick={recarregarERevisar}>
                    Recarregar e revisar
                  </Button>
                )}
                {erro === "vinculoDesatualizado" && (
                  <Button type="button" variant="outline" className="h-11" onClick={() => (props.onRecarregarLista(), fechar())}>
                    Recarregar lista
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={fechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="button" className="h-11" onClick={salvar} disabled={salvando || erro === "emProcessamento"} aria-busy={salvando}>
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Salvando…
              </>
            ) : (
              "Salvar vínculo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

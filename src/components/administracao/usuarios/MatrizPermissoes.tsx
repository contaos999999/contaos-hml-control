import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EVENTO_ORGANIZACAO_ALTERADA,
  obterPreferenciaOrganizacao,
} from "@/lib/organizacao/preferenciaOrganizacao";
import {
  atualizarMatrizRbac,
  obterMatrizRbac,
  PERFIS_RBAC,
  ErroRbac,
  type MatrizRbac,
  type PermissaoPerfil,
} from "@/lib/administracao/rbacRpc";
const chave = (p: PermissaoPerfil) => `${p.perfil}/${p.recurso}/${p.acao}`;
const nome = (v: string) => v.replaceAll("_", " ");
type Tentativa = { versao: number; requestId: string; alteracoes: PermissaoPerfil[] };
export function MatrizPermissoes({ idUsuario, org }: { idUsuario: string; org: string }) {
  const [matriz, setMatriz] = useState<MatrizRbac | null>(null);
  const [perfil, setPerfil] = useState<string>(PERFIS_RBAC[0]);
  const [recurso, setRecurso] = useState("");
  const [edicoes, setEdicoes] = useState<Record<string, boolean>>({});
  const [fase, setFase] = useState<
    "carregando" | "pronto" | "oculto" | "erro" | "salvando" | "incerto" | "conflito"
  >("carregando");
  const [revisando, setRevisando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [revisao, setRevisao] = useState(0);
  const geracao = useRef(0);
  const contextoValido = useRef(false);
  const tentativa = useRef<Tentativa | null>(null);
  const emAndamento = useRef(false);
  useEffect(() => {
    let ativo = true;
    const invalidar = () => {
      geracao.current++;
      contextoValido.current = false;
      setMatriz(null);
      setEdicoes({});
      tentativa.current = null;
      emAndamento.current = false;
      setRevisando(false);
      setAviso("");
      setFase("oculto");
    };
    const carregar = async () => {
      invalidar();
      const g = geracao.current;
      setFase("carregando");
      const atual = () => ativo && geracao.current === g;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!atual()) return;
        if (
          error ||
          data.user?.id !== idUsuario ||
          obterPreferenciaOrganizacao(idUsuario) !== org
        ) {
          setFase("oculto");
          return;
        }
        const m = await obterMatrizRbac();
        if (atual()) {
          contextoValido.current = true;
          setMatriz(m);
          setFase("pronto");
        }
      } catch (e) {
        if (atual()) setFase(e instanceof ErroRbac && e.tipo === "negado" ? "oculto" : "erro");
      }
    };
    const mudarOrganizacao = () => {
      invalidar();
      setRevisao((v) => v + 1);
    };
    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "INITIAL_SESSION") return;
      invalidar();
      setRevisao((v) => v + 1);
    });
    const retomar = () => {
      if (document.visibilityState === "visible") mudarOrganizacao();
    };
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, mudarOrganizacao);
    document.addEventListener("visibilitychange", retomar);
    void carregar();
    return () => {
      ativo = false;
      geracao.current++;
      listener.subscription.unsubscribe();
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, mudarOrganizacao);
      document.removeEventListener("visibilitychange", retomar);
    };
  }, [idUsuario, org, revisao]);
  const alteracoes: PermissaoPerfil[] =
    matriz?.permissoes.flatMap((p) => {
      const permitido = edicoes[chave(p)];
      return typeof permitido === "boolean" && permitido !== p.permitido
        ? [{ ...p, permitido }]
        : [];
    }) ?? [];
  async function salvar() {
    if (
      !contextoValido.current ||
      !matriz ||
      emAndamento.current ||
      (fase !== "pronto" && fase !== "incerto")
    )
      return;
    const t = tentativa.current ?? {
      versao: matriz.versao,
      requestId: crypto.randomUUID(),
      alteracoes,
    };
    if (!t.alteracoes.length) return;
    tentativa.current = t;
    emAndamento.current = true;
    const g = geracao.current;
    setFase("salvando");
    setRevisando(false);
    setAviso("");
    let confirmado = false;
    try {
      await atualizarMatrizRbac(t.versao, t.requestId, t.alteracoes);
      confirmado = true;
      if (g !== geracao.current) return;
      tentativa.current = null;
      const atual = await obterMatrizRbac();
      if (g === geracao.current) {
        setMatriz(atual);
        setEdicoes({});
        setFase("pronto");
        setAviso("Permissões salvas.");
      }
    } catch (e) {
      if (g !== geracao.current) return;
      if (e instanceof ErroRbac && e.tipo === "negado") {
        setMatriz(null);
        setEdicoes({});
        tentativa.current = null;
        setFase("oculto");
      } else if (e instanceof ErroRbac && e.tipo === "conflito") {
        tentativa.current = null;
        setFase("conflito");
        setAviso("A matriz recebeu outra alteração. Recarregue e revise antes de salvar.");
      } else if (confirmado) {
        setFase("erro");
        setAviso("Alterações salvas. Recarregue para conferir a matriz atual.");
      } else {
        setFase("incerto");
        setAviso(
          "Não foi possível confirmar o resultado. Tente novamente para consultar a mesma solicitação.",
        );
      }
    } finally {
      if (g === geracao.current) emAndamento.current = false;
    }
  }
  if (fase === "oculto") return null;
  const bloqueado = fase !== "pronto";
  return (
    <section
      aria-labelledby="rbac-titulo"
      className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6"
    >
      <h2 id="rbac-titulo" className="text-xl font-semibold">
        Matriz de permissões
      </h2>
      <p className="text-sm text-muted-foreground">
        Administração MASTER. As alterações de perfil valem para todas as organizações. As regras de
        negócio e os limites de cada vínculo continuam aplicáveis.
      </p>
      <p role="status" aria-live="polite">
        {aviso ||
          (fase === "carregando"
            ? "Verificando acesso à matriz…"
            : fase === "salvando"
              ? "Salvando permissões…"
              : "")}
      </p>
      {fase === "erro" && <p role="alert">Não foi possível carregar a matriz agora.</p>}
      {matriz && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              Perfil
              <select
                aria-label="Perfil da matriz"
                value={perfil}
                disabled={bloqueado}
                onChange={(e) => setPerfil(e.target.value)}
                className="block min-h-11 w-full rounded border border-input bg-background px-3"
              >
                {PERFIS_RBAC.map((p) => (
                  <option key={p} value={p}>
                    {nome(p)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              Recurso
              <select
                aria-label="Recurso da matriz"
                value={recurso}
                disabled={bloqueado}
                onChange={(e) => setRecurso(e.target.value)}
                className="block min-h-11 w-full rounded border border-input bg-background px-3"
              >
                <option value="">Todos os recursos</option>
                {Array.from(new Set(matriz.permissoes.map((p) => p.recurso))).map((r) => (
                  <option key={r} value={r}>
                    {nome(r)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset disabled={bloqueado} className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Permissões do perfil {nome(perfil)}</legend>
            {matriz.permissoes
              .filter((p) => p.perfil === perfil && (!recurso || p.recurso === recurso))
              .map((p) => (
                <label
                  key={chave(p)}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    disabled={bloqueado}
                    className="size-5 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${nome(p.perfil)}: ${nome(p.recurso)} / ${nome(p.acao)}`}
                    checked={edicoes[chave(p)] ?? p.permitido}
                    onChange={(e) => setEdicoes((v) => ({ ...v, [chave(p)]: e.target.checked }))}
                  />
                  <span>
                    {nome(p.recurso)} / {nome(p.acao)}
                  </span>
                </label>
              ))}
          </fieldset>
          <p className="text-sm">
            {alteracoes.length} alteração(ões) pendente(s), incluindo outros filtros.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button disabled={bloqueado || !alteracoes.length} onClick={() => setRevisando(true)}>
              Revisar alterações
            </Button>
            <Button
              variant="outline"
              disabled={bloqueado || !alteracoes.length}
              onClick={() => setEdicoes({})}
            >
              Descartar alterações
            </Button>
          </div>
        </>
      )}
      {(fase === "erro" || fase === "conflito") && (
        <Button variant="outline" onClick={() => setRevisao((v) => v + 1)}>
          Recarregar matriz
        </Button>
      )}
      {fase === "incerto" && <Button onClick={() => void salvar()}>Tentar novamente</Button>}
      <AlertDialog open={revisando} onOpenChange={setRevisando}>
        <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar permissões globais</AlertDialogTitle>
            <AlertDialogDescription>
              Revise as alterações em todos os perfis e recursos antes de salvar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="space-y-2 text-sm">
            {alteracoes.map((p) => (
              <li key={chave(p)}>
                {nome(p.perfil)}: {nome(p.recurso)} / {nome(p.acao)} →{" "}
                {p.permitido ? "permitir" : "negar"}
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar à edição</AlertDialogCancel>
            <AlertDialogAction onClick={() => void salvar()}>
              Confirmar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

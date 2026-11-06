/**
 * P0 V1 — matriz RBAC global, somente MASTER autorizado pela RPC.
 * Não utiliza papel local, user_metadata nem cache como autoridade de acesso.
 * PLAN #178, GATE #179/#180. Sem novas rotas e sem modificar a ContaOS Brand.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ErroRbac, atualizarMatrizRbac, obterMatrizRbac, type PermissaoPerfil } from "@/lib/administracao/rbacRpc";
import { EVENTO_ORGANIZACAO_ALTERADA } from "@/lib/organizacao/preferenciaOrganizacao";

type Props = { idUsuario: string; org: string };
const chave = (x: Pick<PermissaoPerfil, "perfil" | "recurso" | "acao">) => JSON.stringify([x.perfil, x.recurso, x.acao]);

function novoUuid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = [...bytes].map((n) => n.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function MatrizPermissoes({ idUsuario, org }: Props) {
  const [geracao, setGeracao] = useState(0);
  const [perfil, setPerfil] = useState("");
  const [recurso, setRecurso] = useState("");
  const [alterados, setAlterados] = useState<Record<string, boolean>>({});
  const [aviso, setAviso] = useState("");
  const [gravando, setGravando] = useState(false);
  const [incerto, setIncerto] = useState(false);
  const tentativa = useRef<{ fingerprint: string; id: string } | null>(null);
  const emVoo = useRef(false);
  const cancelado = useRef(0);

  function limpar() {
    cancelado.current += 1;
    tentativa.current = null;
    setAlterados({});
    setPerfil("");
    setRecurso("");
    setAviso("");
    setIncerto(false);
    setGravando(false);
    setGeracao((g) => g + 1);
  }

  useEffect(() => {
    // A mudança de sessão/organização invalida visibilidade antes da nova RPC.
    const subs = supabase.auth.onAuthStateChange(() => limpar());
    window.addEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
    return () => {
      cancelado.current += 1;
      subs.data.subscription.unsubscribe();
      window.removeEventListener(EVENTO_ORGANIZACAO_ALTERADA, limpar);
    };
  }, [idUsuario, org]);

  const consulta = useQuery({
    queryKey: ["rbac", "matriz", idUsuario, org, geracao],
    queryFn: obterMatrizRbac,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const matriz = consulta.data;
  const perfis = useMemo(() => [...new Set(matriz?.permissoes.map((l) => l.perfil) ?? [])].sort(), [matriz]);
  const recursos = useMemo(() => [...new Set(matriz?.permissoes.map((l) => l.recurso) ?? [])].sort(), [matriz]);
  const perfilAtual = perfil && perfis.includes(perfil) ? perfil : perfis[0] ?? "";
  const linhas = matriz?.permissoes.filter((l) => l.perfil === perfilAtual && (!recurso || l.recurso === recurso)) ?? [];
  const delta = matriz?.permissoes
    .filter((l) => Object.prototype.hasOwnProperty.call(alterados, chave(l)) && alterados[chave(l)] !== l.permitido)
    .map((l) => ({ perfil: l.perfil, recurso: l.recurso, acao: l.acao, permitido: alterados[chave(l)] })) ?? [];

  if (consulta.isPending) return null;
  if (consulta.error instanceof ErroRbac && consulta.error.tipo === "negado") return null;
  if (consulta.error || !matriz) {
    return <p role="alert" className="text-sm text-muted-foreground">Não foi possível consultar a matriz de permissões. Tente novamente mais tarde.</p>;
  }

  async function salvar() {
    if (!matriz || emVoo.current || !delta.length) return;
    const token = cancelado.current;
    const fingerprint = JSON.stringify([matriz.versao, delta]);
    const requestId = tentativa.current?.fingerprint === fingerprint ? tentativa.current.id : novoUuid();
    tentativa.current = { fingerprint, id: requestId };
    emVoo.current = true;
    setGravando(true);
    setAviso("");
    try {
      await atualizarMatrizRbac(matriz.versao, requestId, delta);
      if (token !== cancelado.current) return;
      const nova = await consulta.refetch();
      if (token !== cancelado.current) return;
      if (nova.error || !nova.data || nova.data.versao <= matriz.versao) {
        setIncerto(true);
        setAviso("Alteração recebida. A confirmação está indisponível. Recarregue a matriz antes de continuar.");
        return;
      }
      tentativa.current = null;
      setAlterados({});
      setIncerto(false);
      setAviso("Alterações registradas e conferidas no servidor.");
    } catch (e) {
      if (token !== cancelado.current) return;
      if (e instanceof ErroRbac && e.tipo === "conflito") {
        setIncerto(true);
        setAviso("A matriz foi alterada por outra sessão. Recarregue antes de revisar as permissões.");
      } else if (e instanceof ErroRbac && e.tipo === "negado") {
        limpar();
      } else {
        // Resultado HTTP incerto: nova tentativa do MESMO payload usa mesmo UUID.
        setAviso("Não foi possível confirmar a gravação. Você pode repetir esta mesma operação.");
      }
    } finally {
      emVoo.current = false;
      if (token === cancelado.current) setGravando(false);
    }
  }

  const salvarDesabilitado = gravando || incerto || delta.length === 0;
  return (
    <section aria-label="Administração MASTER da matriz de permissões" className="rounded-xl border border-border bg-card p-3 sm:p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Matriz de permissões</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Exclusivo do administrador MASTER. Mudanças afetam o controle de acesso de todas as organizações.
          Versão {matriz.versao}.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium" htmlFor="rbac-perfil">
          Perfil
          <select id="rbac-perfil" value={perfilAtual} onChange={(e) => setPerfil(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {perfis.map((p) => <option key={p} value={p}>{p.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium" htmlFor="rbac-recurso">
          Recurso
          <select id="rbac-recurso" value={recurso} onChange={(e) => setRecurso(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Todos os recursos</option>
            {recursos.map((r) => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}
          </select>
        </label>
      </div>
      <div className="max-h-80 overflow-auto rounded-md border border-border" aria-label="Permissões por recurso">
        {linhas.map((l) => {
          const id = chave(l);
          const valor = Object.prototype.hasOwnProperty.call(alterados, id) ? alterados[id] : l.permitido;
          return (
            <label key={id} className="flex min-h-11 items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-0 hover:bg-muted/40">
              <input type="checkbox" checked={valor} aria-label={`${l.perfil} ${l.recurso} ${l.acao}`}
                onChange={(event) => {
                  setAlterados((prev) => {
                    const next = { ...prev };
                    if (event.target.checked === l.permitido) delete next[id];
                    else next[id] = event.target.checked;
                    return next;
                  });
                  setAviso("");
                  setIncerto(false);
                  tentativa.current = null;
                }} className="h-4 w-4 accent-primary" disabled={gravando || incerto} />
              <span className="break-all">{l.recurso.replaceAll("_", " ")} / {l.acao.replaceAll("_", " ")}</span>
            </label>
          );
        })}
      </div>
      {delta.length > 0 && (
        <p className="text-sm text-foreground" role="note">
          {delta.length} alteração(ões) pendente(s) para revisão. Nenhuma permissão é gravada automaticamente.
        </p>
      )}
      {aviso && <p role="status" aria-live="polite" className="text-sm text-foreground">{aviso}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={salvarDesabilitado} onClick={salvar}>Salvar alterações</Button>
        <Button type="button" variant="outline" disabled={gravando} onClick={() => {
          setAlterados({}); setAviso(""); setIncerto(false); tentativa.current = null;
        }}>Cancelar alterações</Button>
        <Button type="button" variant="outline" disabled={gravando} onClick={() => limpar()}>Recarregar matriz</Button>
      </div>
    </section>
  );
}

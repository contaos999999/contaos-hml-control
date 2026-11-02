import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatarDataHoraBr } from "@/components/dashboard/dashboardFormatacao";
import { ErroAdm, MENSAGENS_ADM01, listarAuditoria, textoErro, type UsuarioVinculo } from "@/lib/administracao/admUsuariosRpc";

// Apresenta o JSON já redigido pelo backend sem filtrar, resumir ou alterar campos.
function jsonLiteral(v: unknown): string {
  if (v === null || v === undefined) return "—";
  return JSON.stringify(v, null, 2);
}

export function AuditDrawer(props: { org: string; usuario: UsuarioVinculo; onFechar: () => void; onRecarregarLista: () => void }) {
  const [pagina, setPagina] = useState(1);
  const q = useQuery({
    queryKey: ["adm01", "auditoria", props.org, props.usuario.id_usuario, pagina],
    queryFn: () => listarAuditoria(props.org, props.usuario.id_usuario, pagina),
    retry: false,
  });
  const tipoErro = q.error instanceof ErroAdm ? q.error.tipo : q.error ? "erro" : null;

  return (
    <Sheet open onOpenChange={(o) => !o && props.onFechar()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{`Auditoria de ${props.usuario.nome || props.usuario.email || "usuário"}`}</SheetTitle>
          <SheetDescription>Histórico de alterações do vínculo nesta organização.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {q.isPending ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando auditoria…
            </p>
          ) : tipoErro ? (
            <div role="alert" className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <p>{textoErro(q.error)}</p>
              {tipoErro === "vinculoDesatualizado" ? (
                <Button type="button" variant="outline" className="h-11" onClick={() => (props.onRecarregarLista(), props.onFechar())}>
                  Recarregar lista
                </Button>
              ) : tipoErro === "erro" ? (
                <Button type="button" variant="outline" className="h-11" onClick={() => q.refetch()}>
                  Tentar novamente
                </Button>
              ) : null}
            </div>
          ) : (q.data?.itens ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{MENSAGENS_ADM01.auditoriaVazia}</p>
          ) : (
            <ol className="divide-y divide-border">
              {(q.data?.itens ?? []).map((e) => (
                <li key={e.id} className="space-y-1 py-3 text-sm">
                  <p className="font-medium text-foreground">{e.evento}</p>
                  <p className="text-muted-foreground">
                    <span>{formatarDataHoraBr(e.criado_em)}</span>
                  </p>
                  <p className="break-words text-muted-foreground">{`Por: ${e.ator_nome ?? "—"}${e.ator_email ? ` (${e.ator_email})` : ""}`}</p>
                  <p className="break-words text-xs text-muted-foreground">{`Entidade: ${e.entidade}`}</p>
                  <dl className="space-y-2 text-xs">
                    {(
                      [
                        ["Antes", e.antes],
                        ["Depois", e.depois],
                        ["Metadados", e.metadados],
                      ] as const
                    ).map(([rotulo, valor]) => (
                      <div key={rotulo} className="space-y-0.5">
                        <dt className="text-muted-foreground">{`${rotulo}:`}</dt>
                        <dd>
                          <pre className="max-w-full whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-xs text-foreground">{jsonLiteral(valor)}</pre>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {e.correlation_id && <p className="break-all text-xs text-muted-foreground">{`Referência: ${e.correlation_id}`}</p>}
                </li>
              ))}
            </ol>
          )}
          {q.data && q.data.total_paginas > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Button type="button" variant="outline" className="h-11" aria-label="Página anterior da auditoria" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                Anterior
              </Button>
              <span>{`Página ${q.data.pagina} de ${q.data.total_paginas}`}</span>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                aria-label="Próxima página da auditoria"
                disabled={pagina >= q.data.total_paginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { Button } from "@/components/ui/button";
import type { Perfil, UsuarioVinculo } from "@/lib/administracao/admUsuariosRpc";

/** Uma única estrutura de tabela: linhas viram cartões abaixo de 768 px, sem rolagem lateral. */
export function UserMembershipTable(props: {
  itens: UsuarioVinculo[];
  perfis: Perfil[];
  onEditar: (u: UsuarioVinculo) => void;
  onAuditoria: (u: UsuarioVinculo) => void;
}) {
  const nomePerfil = (c: string) => props.perfis.find((p) => p.codigo === c)?.nome ?? c;
  const td = "px-3 py-2 align-top max-md:flex max-md:justify-between max-md:gap-3 max-md:px-0 max-md:py-1";
  const rot = "font-medium text-muted-foreground md:hidden";
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Usuários vinculados à organização</caption>
      <thead className="max-md:sr-only">
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th scope="col" className="px-3 py-2 font-medium">Nome</th>
          <th scope="col" className="px-3 py-2 font-medium">E-mail</th>
          <th scope="col" className="px-3 py-2 font-medium">Perfil</th>
          <th scope="col" className="px-3 py-2 font-medium">Situação do vínculo</th>
          <th scope="col" className="px-3 py-2 font-medium">Escopo</th>
          <th scope="col" className="px-3 py-2 font-medium">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.itens.map((u) => {
          const nome = u.nome || u.email || "Usuário";
          return (
            <tr key={u.id_usuario} className="border-b border-border/60 max-md:mb-3 max-md:block max-md:rounded-lg max-md:border max-md:bg-card max-md:p-3">
              <td className={`${td} font-medium text-foreground`}>
                <span className={rot}>Nome</span>
                <span className="break-words text-right md:text-left">{nome}</span>
              </td>
              <td className={td}>
                <span className={rot}>E-mail</span>
                <span className="break-all text-right md:text-left">{u.email ?? "—"}</span>
              </td>
              <td className={td}>
                <span className={rot}>Perfil</span>
                <span>{nomePerfil(u.vinculo.perfil)}</span>
              </td>
              <td className={td}>
                <span className={rot}>Situação do vínculo</span>
                <span>{u.vinculo.ativo ? "Ativo" : "Inativo"}</span>
              </td>
              <td className={td}>
                <span className={rot}>Escopo</span>
                <span>{u.vinculo.escopo_todos_contratos ? "Todos os contratos" : "Contratos específicos"}</span>
              </td>
              <td className="px-3 py-2 max-md:block max-md:px-0 max-md:pt-2">
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button type="button" variant="outline" className="h-11 max-md:flex-1" aria-label={`Editar vínculo de ${nome}`} onClick={() => props.onEditar(u)}>
                    Editar
                  </Button>
                  <Button type="button" variant="ghost" className="h-11 max-md:flex-1" aria-label={`Ver auditoria de ${nome}`} onClick={() => props.onAuditoria(u)}>
                    Auditoria
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

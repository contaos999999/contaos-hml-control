import type { Perfil } from "@/lib/administracao/admUsuariosRpc";

/** Perfis vêm do backend (`perfis_disponiveis`); o frontend não decide perfis válidos. */
export function RoleSelect(props: { id: string; valor: string; perfis: Perfil[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={props.id} className="text-sm font-medium text-foreground">
        Perfil de acesso
      </label>
      <select
        id={props.id}
        value={props.valor}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <option value="">Selecione um perfil</option>
        {props.perfis.map((p) => (
          <option key={p.codigo} value={p.codigo}>
            {p.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

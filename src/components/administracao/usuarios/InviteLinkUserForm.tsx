/**
 * "Convidar ou vincular usuário": a Edge oficial `admin-invite-user` localiza ou convida a identidade;
 * o vínculo (perfil/ativo/escopo) é salvo depois pela RPC oficial.
 */
const CAMPO =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InviteLinkUserForm(props: {
  email: string;
  nome: string;
  onEmail: (v: string) => void;
  onNome: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor="adm01-email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          id="adm01-email"
          type="email"
          required
          autoComplete="off"
          inputMode="email"
          value={props.email}
          disabled={props.disabled}
          aria-describedby="adm01-email-ajuda"
          onChange={(e) => props.onEmail(e.target.value)}
          className={CAMPO}
        />
        <p id="adm01-email-ajuda" className="text-xs text-muted-foreground">
          Se já houver conta com este e-mail, ela será vinculada; caso contrário, um convite será enviado.
        </p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="adm01-nome" className="text-sm font-medium text-foreground">
          Nome (opcional)
        </label>
        <input
          id="adm01-nome"
          type="text"
          autoComplete="off"
          value={props.nome}
          disabled={props.disabled}
          onChange={(e) => props.onNome(e.target.value)}
          className={CAMPO}
        />
      </div>
    </div>
  );
}

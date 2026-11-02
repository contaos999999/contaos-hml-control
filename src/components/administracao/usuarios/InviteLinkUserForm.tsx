/**
 * "Vincular usuário existente": somente vincula uma conta ContaOS já existente pelo e-mail.
 * Não envia convite e não cria conta; apenas a RPC oficial de vínculo é usada.
 */
export function InviteLinkUserForm(props: { email: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="adm01-email" className="text-sm font-medium text-foreground">
        E-mail da conta ContaOS
      </label>
      <input
        id="adm01-email"
        type="email"
        autoComplete="off"
        inputMode="email"
        value={props.email}
        disabled={props.disabled}
        aria-describedby="adm01-email-ajuda"
        onChange={(e) => props.onChange(e.target.value)}
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p id="adm01-email-ajuda" className="text-xs text-muted-foreground">
        A pessoa já precisa ter uma conta ContaOS com este e-mail.
      </p>
    </div>
  );
}

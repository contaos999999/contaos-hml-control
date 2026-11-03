// BRAND-01 — Marca oficial ContaOS v1.0 (SVGs originais, sem recolorir).
// Os cabeçalhos usam bg-primary: navy no tema claro e fundo claro em .dark.
// Seleção CSS por tema sem estado JS, conservando largura e acessibilidade.
export function ContaOSMarca() {
  return (
    <>
      <span className="hidden shrink-0 sm:block">
        <img
          src="/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg"
          alt="ContaOS"
          width={131}
          height={32}
          className="h-8 w-auto dark:hidden"
        />
        <img
          src="/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg"
          alt="ContaOS"
          width={131}
          height={32}
          className="hidden h-8 w-auto dark:block"
        />
      </span>
      <span className="flex shrink-0 items-center gap-2 sm:hidden">
        <img
          src="/brand/ContaOS_Simbolo_Branco.svg"
          alt=""
          width={32}
          height={32}
          className="size-8 dark:hidden"
        />
        <img
          src="/brand/ContaOS_Simbolo_Navy.svg"
          alt=""
          width={32}
          height={32}
          className="hidden size-8 dark:block"
        />
        <span className="text-lg font-semibold tracking-tight">ContaOS</span>
      </span>
    </>
  );
}

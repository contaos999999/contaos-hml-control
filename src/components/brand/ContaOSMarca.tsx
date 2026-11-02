// BRAND-01 — Marca oficial ContaOS v1.0 (assets oficiais, sem alteração).
// Logo horizontal (mín. 120 px de largura) a partir de `sm`; abaixo disso, símbolo isolado
// conforme Manual de Identidade Visual §3.1. Uso exclusivo sobre fundo escuro (bg-primary).
export function ContaOSMarca() {
  return (
    <>
      <img
        src="/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg"
        alt="ContaOS"
        width={131}
        height={32}
        className="hidden h-8 w-auto shrink-0 sm:block"
      />
      <span className="flex shrink-0 items-center gap-2 sm:hidden">
        <img
          src="/brand/ContaOS_Simbolo_Branco.svg"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0"
        />
        <span className="text-lg font-semibold tracking-tight">ContaOS</span>
      </span>
    </>
  );
}

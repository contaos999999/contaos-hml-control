import { createFileRoute } from "@tanstack/react-router";
import { ReapresentacaoDiligencia } from "@/components/diligencias/ReapresentacaoDiligencia";
import { offsetDiligenciasValido } from "@/lib/diligencias/diligenciasDados";

export const Route = createFileRoute("/diligencias_/$cicloId_/reapresentar")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { offset?: number } => {
    const { offset } = search;
    return typeof offset === "number" && offsetDiligenciasValido(offset) ? { offset } : {};
  },
  head: () => ({
    meta: [
      { title: "Reapresentação · ContaOS" },
      { name: "description", content: "Verificação, liberação e registro da reapresentação." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { cicloId } = Route.useParams();
  const { offset } = Route.useSearch();
  return <ReapresentacaoDiligencia cicloId={cicloId} offset={offset} />;
}

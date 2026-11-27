import { createFileRoute } from "@tanstack/react-router";

import { ApontamentoDiligencia } from "@/components/diligencias/ApontamentoDiligencia";
import { offsetDiligenciasValido } from "@/lib/diligencias/diligenciasDados";

export const Route = createFileRoute("/diligencias_/$cicloId_/apontamentos_/$id")({
  ssr: false,
  validateSearch: ({ offset }: Record<string, unknown>): { offset?: number } =>
    typeof offset === "number" && offsetDiligenciasValido(offset) ? { offset } : {},
  head: () => ({
    meta: [
      { title: "Detalhe do apontamento · ContaOS" },
      { name: "description", content: "Origem, análises, revisões e evidências do apontamento." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaApontamento,
});

function PaginaApontamento() {
  const { cicloId, id } = Route.useParams();
  return <ApontamentoDiligencia cicloId={cicloId} id={id} offset={Route.useSearch().offset} />;
}

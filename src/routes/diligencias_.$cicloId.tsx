import { createFileRoute } from "@tanstack/react-router";

import { CicloDiligencia } from "@/components/diligencias/CicloDiligencia";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";
import { offsetDiligenciasValido } from "@/lib/diligencias/diligenciasDados";

export const Route = createFileRoute("/diligencias_/$cicloId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { offset?: number; foco?: string } => {
    const { offset, foco } = search;
    const parametros: { offset?: number; foco?: string } = {};
    if (typeof offset === "number" && offsetDiligenciasValido(offset)) parametros.offset = offset;
    if (typeof foco === "string" && uuidValido(foco)) parametros.foco = uuidCanonico(foco);
    return parametros;
  },
  head: () => ({
    meta: [
      { title: "Ciclo de diligência · ContaOS" },
      { name: "description", content: "Rodada de diligência, pareceres e apontamentos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaCicloDiligencia,
});

function PaginaCicloDiligencia() {
  const { cicloId } = Route.useParams();
  const { offset, foco } = Route.useSearch();
  return <CicloDiligencia id={cicloId} offset={offset} foco={foco} />;
}

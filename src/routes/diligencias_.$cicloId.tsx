import { createFileRoute } from "@tanstack/react-router";

import { CicloDiligencia } from "@/components/diligencias/CicloDiligencia";

export const Route = createFileRoute("/diligencias_/$cicloId")({
  ssr: false,
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
  return <CicloDiligencia id={cicloId} />;
}

import { createFileRoute } from "@tanstack/react-router";

import { DiligenciasCompetencia } from "@/components/diligencias/DiligenciasCompetencia";

export const Route = createFileRoute("/competencias_/$id_/diligencias")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Competência · Diligências · ContaOS" },
      { name: "description", content: "Diligências e rodadas da competência." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaDiligencias,
});

function PaginaDiligencias() {
  const { id } = Route.useParams();
  return <DiligenciasCompetencia id={id} />;
}

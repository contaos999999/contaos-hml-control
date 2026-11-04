import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaApresentar } from "@/components/competencias/CompetenciaApresentar";

const TITULO = "Competência — Apresentação — ContaOS";
const DESC = "Wizard de aprovação e registro da apresentação de prestação de contas.";

export const Route = createFileRoute("/competencias_/$id_/apresentar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaApresentarCompetencia,
});

function PaginaApresentarCompetencia() {
  const { id } = Route.useParams();
  return <CompetenciaApresentar id={id} />;
}

import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaParecer } from "@/components/competencias/CompetenciaParecer";

const TITULO = "Competência — Parecer interno — ContaOS";
const DESC = "Consulta e decisão sobre pareceres internos de prestação de contas.";

export const Route = createFileRoute("/competencias_/$id_/parecer")({
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
  component: PaginaParecerCompetencia,
});

function PaginaParecerCompetencia() {
  const { id } = Route.useParams();
  return <CompetenciaParecer id={id} />;
}

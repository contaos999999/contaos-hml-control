import { createFileRoute } from "@tanstack/react-router";

import { CompetenciasContrato } from "@/components/contratos/CompetenciasContrato";

const DESC = "Competências mensais de um contrato no ContaOS, com situação e percentual de conformidade.";

export const Route = createFileRoute("/contratos_/$id_/competencias")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Competências — ContaOS" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Competências — ContaOS" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaCompetencias,
});

function PaginaCompetencias() {
  const { id } = Route.useParams();
  return <CompetenciasContrato id={id} />;
}

import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaVisaoGeral } from "@/components/competencias/CompetenciaVisaoGeral";

const DESC = "Visão geral da competência: preparação, análise, bloqueios e ações permitidas.";

export const Route = createFileRoute("/competencias_/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Competência — Visão geral — ContaOS" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Competência — Visão geral — ContaOS" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaCompetencia,
});

function PaginaCompetencia() {
  const { id } = Route.useParams();
  return <CompetenciaVisaoGeral id={id} />;
}

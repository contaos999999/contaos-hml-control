import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaAnalise } from "@/components/competencias/CompetenciaAnalise";

const TITULO = "Competência — Análise — ContaOS";
const DESC = "Executar e acompanhar a análise da competência e revisar os requisitos analisados.";

export const Route = createFileRoute("/competencias_/$id_/analise")({
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
  component: PaginaAnaliseCompetencia,
});

function PaginaAnaliseCompetencia() {
  const { id } = Route.useParams();
  return <CompetenciaAnalise id={id} />;
}

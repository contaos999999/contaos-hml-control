import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaDocumentos } from "@/components/competencias/CompetenciaDocumentos";

const TITULO = "Competência — Documentos — ContaOS";
const DESC = "Documentos vinculados à competência e requisitos documentais do snapshot.";

export const Route = createFileRoute("/competencias_/$id_/documentos")({
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
  component: PaginaDocumentosCompetencia,
});

function PaginaDocumentosCompetencia() {
  const { id } = Route.useParams();
  return <CompetenciaDocumentos id={id} />;
}

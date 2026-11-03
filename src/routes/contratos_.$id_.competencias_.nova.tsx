import { createFileRoute } from "@tanstack/react-router";

import { NovaCompetencia } from "@/components/contratos/NovaCompetencia";

const DESC = "Criação de competência mensal de um contrato no ContaOS.";

export const Route = createFileRoute("/contratos_/$id_/competencias_/nova")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova competência — ContaOS" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Nova competência — ContaOS" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaNovaCompetencia,
});

function PaginaNovaCompetencia() {
  const { id } = Route.useParams();
  return <NovaCompetencia id={id} />;
}

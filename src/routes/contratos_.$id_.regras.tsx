import { createFileRoute } from "@tanstack/react-router";

import { RegrasContrato } from "@/components/contratos/RegrasContrato";

export const Route = createFileRoute("/contratos_/$id_/regras")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Listas e regras — ContaOS" },
      {
        name: "description",
        content:
          "Listas de verificação, regras de conformidade e regras preventivas de um contrato no ContaOS.",
      },
      { property: "og:title", content: "Listas e regras — ContaOS" },
      {
        property: "og:description",
        content:
          "Listas de verificação, regras de conformidade e regras preventivas de um contrato no ContaOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaRegras,
});

function PaginaRegras() {
  const { id } = Route.useParams();
  return <RegrasContrato id={id} />;
}

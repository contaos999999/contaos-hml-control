import { createFileRoute } from "@tanstack/react-router";

import { BaseNormativaContrato } from "@/components/contratos/BaseNormativaContrato";

export const Route = createFileRoute("/contratos_/$id/base-normativa")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Base normativa — ContaOS" },
      { name: "description", content: "Fontes normativas, versões, vigência e aplicabilidade de um contrato no ContaOS." },
      { property: "og:title", content: "Base normativa — ContaOS" },
      { property: "og:description", content: "Fontes normativas, versões, vigência e aplicabilidade de um contrato no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaBaseNormativa,
});

function PaginaBaseNormativa() {
  const { id } = Route.useParams();
  return <BaseNormativaContrato id={id} />;
}

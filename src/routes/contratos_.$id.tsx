import { createFileRoute } from "@tanstack/react-router";

import { VisaoGeralContrato } from "@/components/contratos/VisaoGeralContrato";

export const Route = createFileRoute("/contratos_/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contrato — ContaOS" },
      { name: "description", content: "Visão geral somente leitura de um contrato autorizado no ContaOS." },
      { property: "og:title", content: "Contrato — ContaOS" },
      { property: "og:description", content: "Visão geral somente leitura de um contrato autorizado no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaContrato,
});

function PaginaContrato() {
  const { id } = Route.useParams();
  return <VisaoGeralContrato id={id} />;
}

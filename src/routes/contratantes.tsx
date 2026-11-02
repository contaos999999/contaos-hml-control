import { createFileRoute } from "@tanstack/react-router";

import { ListaContratantes } from "@/components/contratantes/ListaContratantes";

export const Route = createFileRoute("/contratantes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contratantes — ContaOS" },
      { name: "description", content: "Consulta paginada dos contratantes cadastrados na organização selecionada no ContaOS." },
      { property: "og:title", content: "Contratantes — ContaOS" },
      { property: "og:description", content: "Consulta paginada dos contratantes cadastrados na organização selecionada no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ListaContratantes,
});

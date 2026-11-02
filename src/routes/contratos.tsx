import { createFileRoute } from "@tanstack/react-router";

import { ListaContratos } from "@/components/contratos/ListaContratos";

export const Route = createFileRoute("/contratos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contratos — ContaOS" },
      { name: "description", content: "Consulta paginada dos contratos autorizados na organização selecionada no ContaOS." },
      { property: "og:title", content: "Contratos — ContaOS" },
      { property: "og:description", content: "Consulta paginada dos contratos autorizados na organização selecionada no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ListaContratos,
});

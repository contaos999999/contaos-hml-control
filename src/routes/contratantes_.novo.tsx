import { createFileRoute } from "@tanstack/react-router";

import { NovoContratante } from "@/components/contratantes/NovoContratante";

export const Route = createFileRoute("/contratantes_/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo contratante — ContaOS" },
      { name: "description", content: "Cadastro de novo contratante na organização selecionada no ContaOS." },
      { property: "og:title", content: "Novo contratante — ContaOS" },
      { property: "og:description", content: "Cadastro de novo contratante na organização selecionada no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NovoContratante,
});

import { createFileRoute } from "@tanstack/react-router";

import { NovoContrato } from "@/components/contratos/NovoContrato";

export const Route = createFileRoute("/contratos_/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo contrato — ContaOS" },
      { name: "description", content: "Cadastro de novo contrato vinculado a um contratante da organização selecionada no ContaOS." },
      { property: "og:title", content: "Novo contrato — ContaOS" },
      { property: "og:description", content: "Cadastro de novo contrato vinculado a um contratante da organização selecionada no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NovoContrato,
});

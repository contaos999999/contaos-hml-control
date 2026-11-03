import { createFileRoute } from "@tanstack/react-router";

import { OrcamentoContrato } from "@/components/contratos/OrcamentoContrato";

export const Route = createFileRoute("/contratos_/$id_/orcamento")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Orçamento — ContaOS" },
      { name: "description", content: "Proposta orçamentária estruturada, versões, vigência e rubricas de um contrato no ContaOS." },
      { property: "og:title", content: "Orçamento — ContaOS" },
      { property: "og:description", content: "Proposta orçamentária estruturada, versões, vigência e rubricas de um contrato no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaOrcamento,
});

function PaginaOrcamento() {
  const { id } = Route.useParams();
  return <OrcamentoContrato id={id} />;
}

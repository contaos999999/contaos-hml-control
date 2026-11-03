import { createFileRoute } from "@tanstack/react-router";

import { DocumentosContrato } from "@/components/contratos/DocumentosContrato";

export const Route = createFileRoute("/contratos_/$id_/documentos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Documentos do contrato — ContaOS" },
      {
        name: "description",
        content:
          "Central de documentos do contrato no ContaOS: envio, versões, verificação de segurança e processamento.",
      },
      { property: "og:title", content: "Documentos do contrato — ContaOS" },
      {
        property: "og:description",
        content:
          "Central de documentos do contrato no ContaOS: envio, versões, verificação de segurança e processamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaDocumentos,
});

function PaginaDocumentos() {
  const { id } = Route.useParams();
  return <DocumentosContrato id={id} />;
}

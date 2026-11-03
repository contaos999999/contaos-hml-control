import { createFileRoute } from "@tanstack/react-router";

import { DocumentosContrato } from "@/components/contratos/DocumentosContrato";
import { lerBuscaCentral } from "@/lib/contratos/documentoDetalheDados";

export const Route = createFileRoute("/contratos_/$id_/documentos")({
  ssr: false,
  validateSearch: lerBuscaCentral,
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
  const inicial = Route.useSearch();
  return <DocumentosContrato id={id} inicial={inicial} />;
}

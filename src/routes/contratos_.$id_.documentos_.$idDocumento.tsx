import { createFileRoute } from "@tanstack/react-router";

import { DocumentoDetalhe } from "@/components/contratos/DocumentoDetalhe";
import { lerBuscaCentral } from "@/lib/contratos/documentoDetalheDados";

export const Route = createFileRoute("/contratos_/$id_/documentos_/$idDocumento")({
  ssr: false,
  validateSearch: lerBuscaCentral,
  head: () => ({
    meta: [
      { title: "Detalhe do documento — ContaOS" },
      {
        name: "description",
        content:
          "Detalhe do documento do contrato no ContaOS: histórico de versões, cadeia de evidência e revisão humana das sugestões de IA.",
      },
      { property: "og:title", content: "Detalhe do documento — ContaOS" },
      {
        property: "og:description",
        content:
          "Detalhe do documento do contrato no ContaOS: histórico de versões, cadeia de evidência e revisão humana das sugestões de IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaDetalheDocumento,
});

function PaginaDetalheDocumento() {
  const { id, idDocumento } = Route.useParams();
  const retorno = Route.useSearch();
  return <DocumentoDetalhe id={id} idDocumento={idDocumento} retorno={retorno} />;
}

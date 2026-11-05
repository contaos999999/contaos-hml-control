import { createFileRoute } from "@tanstack/react-router";

import { ImportarHistorico } from "@/components/contratos/ImportarHistorico";

export const Route = createFileRoute("/contratos_/$id_/historico_/importar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Importação de histórico — ContaOS" },
      { name: "description", content: "Importação de relatórios anteriores do contrato." },
      { property: "og:title", content: "Importação de histórico — ContaOS" },
      { property: "og:description", content: "Histórico documental do contrato." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaImportarHistorico,
});
function PaginaImportarHistorico() {
  const { id } = Route.useParams();
  return <ImportarHistorico id={id} />;
}

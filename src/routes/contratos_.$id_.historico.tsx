import { createFileRoute } from "@tanstack/react-router";

import { HistoricoContrato } from "@/components/contratos/HistoricoContrato";

export const Route = createFileRoute("/contratos_/$id_/historico")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Histórico do contrato — ContaOS" },
      { name: "description", content: "Relatórios históricos e precedentes do contrato." },
      { property: "og:title", content: "Histórico do contrato — ContaOS" },
      { property: "og:description", content: "Consulta histórica contratual no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaHistorico,
});

function PaginaHistorico() {
  const { id } = Route.useParams();
  return <HistoricoContrato id={id} />;
}

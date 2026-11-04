import { createFileRoute } from "@tanstack/react-router";

import { CompetenciaProtocolo } from "@/components/competencias/CompetenciaProtocolo";

const TITULO = "Competência — Apresentação e protocolo — ContaOS";
const DESC = "Consulta ao registro oficial e ao pacote de prestação de contas congelado.";

export const Route = createFileRoute("/competencias_/$id_/apresentacoes_/$apresentacaoId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaProtocolo,
});

function PaginaProtocolo() {
  const { id, apresentacaoId } = Route.useParams();
  return <CompetenciaProtocolo id={id} apresentacaoId={apresentacaoId} />;
}

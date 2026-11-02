import { createFileRoute } from "@tanstack/react-router";

import { EditarContratante } from "@/components/contratantes/EditarContratante";

export const Route = createFileRoute("/contratantes_/$id/editar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editar contratante — ContaOS" },
      { name: "description", content: "Edição de contratante com controle de versão na organização selecionada no ContaOS." },
      { property: "og:title", content: "Editar contratante — ContaOS" },
      { property: "og:description", content: "Edição de contratante com controle de versão na organização selecionada no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RotaEditarContratante,
});

function RotaEditarContratante() {
  const { id } = Route.useParams();
  return <EditarContratante id={id} />;
}

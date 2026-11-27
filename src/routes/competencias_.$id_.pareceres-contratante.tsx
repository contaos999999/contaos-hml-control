import { createFileRoute } from "@tanstack/react-router";
import { PareceresContratante } from "@/components/diligencias/PareceresContratante";

export const Route = createFileRoute("/competencias_/$id_/pareceres-contratante")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { apresentacaoId?: string } =>
    typeof search.apresentacaoId === "string" ? { apresentacaoId: search.apresentacaoId } : {},
  head: () => ({
    meta: [
      { title: "Pareceres do contratante · ContaOS" },
      { name: "description", content: "Registro e acompanhamento dos pareceres externos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { id } = Route.useParams();
  const { apresentacaoId } = Route.useSearch();
  return <PareceresContratante id={id} {...(apresentacaoId !== undefined ? { apresentacaoId } : {})} />;
}

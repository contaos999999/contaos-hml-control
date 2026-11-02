import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel da organização — ContaOS" },
      { name: "description", content: "Resumo de contratos, competências, prazos e atenções da organização no ContaOS." },
      { property: "og:title", content: "Painel da organização — ContaOS" },
      { property: "og:description", content: "Resumo de contratos, competências, prazos e atenções da organização no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

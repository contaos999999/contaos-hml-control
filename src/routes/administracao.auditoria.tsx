import { createFileRoute } from "@tanstack/react-router";
import { TrilhaAuditoria } from "@/components/administracao/auditoria/TrilhaAuditoria";

export const Route = createFileRoute("/administracao/auditoria")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Trilha de auditoria — ContaOS" },
      { name: "description", content: "Histórico seguro e filtrável dos eventos de auditoria da organização." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrilhaAuditoria,
});

import { createFileRoute } from "@tanstack/react-router";

import { AdminUsuarios } from "@/components/administracao/usuarios/AdminUsuarios";

export const Route = createFileRoute("/administracao/usuarios")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Usuários e vínculos — ContaOS" },
      { name: "description", content: "Administração de usuários, perfis e escopo contratual da organização no ContaOS." },
      { property: "og:title", content: "Usuários e vínculos — ContaOS" },
      { property: "og:description", content: "Administração de usuários, perfis e escopo contratual da organização no ContaOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsuarios,
});

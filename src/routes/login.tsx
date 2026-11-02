import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — ContaOS" },
      { name: "description", content: "Acesso ao ContaOS: gestão e auditoria de conformidade contratual." },
      { property: "og:title", content: "Entrar — ContaOS" },
      { property: "og:description", content: "Acesso ao ContaOS: gestão e auditoria de conformidade contratual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div lang="pt-BR" className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex flex-col justify-between gap-6 bg-primary px-6 py-6 text-primary-foreground md:py-8 lg:w-[44%] lg:px-12 lg:py-12 md:w-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">ContaOS</span>
        </div>
        <div className="hidden space-y-3 lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
            Executive Command Center · Audit Workspace
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            Conformidade contratual com rastreabilidade de ponta a ponta.
          </h2>
          <p className="max-w-md text-sm opacity-80">
            Requisitos, evidências e apresentações ao contratante em um único ambiente auditável.
          </p>
        </div>
        <p className="hidden text-xs opacity-60 lg:block">Ambiente HML</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground">Use seu e-mail e senha corporativos.</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

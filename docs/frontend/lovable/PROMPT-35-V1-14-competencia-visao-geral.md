# PROMPT 35 / V1-14 — Competência: Visão geral

Base: `8b62e506a8351fba9819afb1b4508be449be7228`. Plano aprovado: `.lovable/plan/prompt-35-v1-14-competência-visão-geral-plan-2026-11-03.md`.

## Escopo
- Rota `/competencias/:id` (`src/routes/competencias_.$id.tsx`, `ssr:false`, head PT-BR).
- `CompetenciaVisaoGeral.tsx` com `PageHeader`, `StatusBadge`, `PercentGauge`, `BlockingSummary`, `AllowedActions`, `Tabs` e `EstadoCompetencia` locais.
- Adapter local tipado `competenciaVisaoGeralDados.ts` para `obter_visao_geral_competencia` com `abortSignal`, sem regenerar `types.ts`.
- V1-12: `Abrir competência` passou de staged para link `/competencias/$id`.

## Regras
- Ações renderizam exclusivamente `allowed_actions`; `false` = texto "Bloqueada pelo backend" sem controle; `true` = "Permitida pelo backend" + staged "Em breve" (V1-15/16/18/19 inexistentes).
- Estados visuais (preparation/analysis/blocked/ready/presented) derivados só de dados backend, apenas apresentação.
- Erros: 401/403/42501 → acesso negado; P0001/sem dados → "Competência não encontrada ou indisponível."; outros → erro genérico com retry manual.
- Status críticos: "PODE APRESENTAR AO CONTRATANTE" / "PODE REAPRESENTAR AO CONTRATANTE".

## TDD
- RED: arquivo de teste sem módulos de produção (falha de import).
- GREEN: `src/test/competenciaVisaoGeral.test.tsx` 32/32; regressão V1-12/V1-13 incluída.

## Zero-Drift
Sem alterações em backend, `supabase/**`, package/lock, `client.ts`, `types.ts` (blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`), `components/ui/**`, `styles.css`, `public/brand/**`, AGENTS. `routeTree.gen.ts` gerado automaticamente.

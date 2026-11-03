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

## Evidências (03/11/2026)
- Focado V1-14: 32/32. Regressão V1-13 + V1-12 + V1-11 + V1-10 + V1-14: 143/143 (5 arquivos), exit 0.
- Suíte completa serial (`--maxWorkers=1`): 576/576, 24 arquivos, exit 0.
- `tsgo --noEmit`: 0 erros. Build automático: `build OK`.
- ESLint arquivos alterados: 0 erros / 0 avisos.
- Browser (fixture simulada, sem sessão HML real): 1440/1280/768/390 claro e escuro, `scrollWidth` igual à largura, 1 RPC por página; UUID inválido = 0 requisições Supabase. Fixture com percentual 100 e `apresentar=false` exibiu "Bloqueada pelo backend".
- Security Scan nativo: 0 Critical/High/Medium/Low; 1 Info preexistente (proteção de senhas vazadas); Wiz não configurado.
- `types.ts` regenerado pela plataforma e restaurado de `e10f797`: blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- Lista V1-12: removida a constante `EM_BREVE`, que deixou de ser usada (evita erro de lint).

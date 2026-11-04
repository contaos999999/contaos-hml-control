# GOV-019 — PLAN: ensaio Vitest com dois workers sem perder regressão

**04/11/2026, Brasília | Somente PLAN; nenhuma alteração de testes ou workflows neste PR.**

## Fonte e contexto
- Frontend baseline `contaos999999/contaos-hml-control/main@ab2a10dffa590416dc1bdbc0e57c7405db7d9708`, após GOV-017 PR #39: marca branca transparente, testes e Teste C SUCCESS.
- Fonte normativa/backend `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, 25 documentos, catálogo 100/97, `types.ts` certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Não alterar backend nem types.ts.
- Baselines de `bunx vitest run --maxWorkers=1`: #41869470067 ~71s; #41861082671 ~83s; #41874233461 ~79s. O Teste C é paralelo e independe dos workers de Vitest, com 192 combinações.
- PRD 4.1, NFRs, segurança, CONTEXTO_CANONICO, BRAND-01 e ZERO-DRIFT intocados.

## Ensaio em duas fases, com critério de decisão baseado em evidências
**Fase 1, PR de BUILD próprio:** alterar unicamente `.github/workflows/contaos-frontend-zero-drift.yml` no passo `Full regression serial` para executar **três** iterações de `bunx vitest run --maxWorkers=2`, em sequência, no mesmo SHA, sem `|| true`; registrar tempos por iteração com `date +%s`. Cada iteração deve ter mesmo total de testes e todos PASS. Se um falhar, CI bloqueia PR; não suprimir nem reduzir suite. Manter TypeScript, lint, build, Zero-Drift, Context Gate, checks e Teste C. `vitest run --maxWorkers=1` continua baseline imutável na main até aprovação.
**Fase 2, se Fase 1 tiver 3/3 PASS e não houver lentidão/flakiness:** no mesmo branch de BUILD, novo commit isolado reduz o passo para **uma** execução `bunx vitest run --maxWorkers=2`; CI completa novamente sem alterar outras linhas. Se tempo mediano não melhorar ou falha intermitente surgir, reverter à linha anterior e declarar ensaio não aprovado em novo PR documental; não forçar mudança.
- Comparar execução real por `started_at/completed_at` da etapa e logs com contagem de testes, não confundir atraso da API GitHub com tempo de execução.
- Não fazer fragmentação 2×96 do Teste C nesta etapa. Isso exigiria PLAN separado e validação de agregação (a integridade das 192 combinações é mais importante que estimativas).
- Permitir que CI marque Teste C N/A em PR que altera apenas workflow da qualidade (com status check SUCCESS), mas não apagar auditorias existentes nem mudar `scripts/testc`. Validar também run na main pós-merge com dois checks.

## Escopo fechado
**Aplicação em BUILD:** exclusivamente `.github/workflows/contaos-frontend-zero-drift.yml` (máximo duas alterações mínimas) e `docs/frontend/auditorias/GOV_019_VITEST_WORKERS_BENCHMARK_2026-11-04.md` para evidências e resultados, `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` para checkpoint.
**Proibidos:** `src/**`, `public/**`, `supabase/**`, `src/integrations/supabase/**`, migrations, RLS/RPC/Auth, PROD, dependências, lockfiles, `scripts/testc/**`, ruleset e workflow do Teste C.
**Gates:** PLAN PR + dois checks verdes + merge; teste 3× PASS, regressão completa com mesmas contagens, typed build, Zero-Drift, dois checks, revisão dos logs e dos tempos; commit final com apenas 1 execução 2-workers e dois checks verdes, merge sem bypass; checkpoint de HEAD e próxima etapa PROMPT 40.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Impacto visual N/A; não há alteração em componentes, paletas, identidade ou UI; BRAND-01 e crivo visual pós-módulo preservados. Reutilizar workflow existente, sem ferramentas novas nem chamadas Lovable. O backend é autoridade para estados e regras. Revisar CI antes do merge, não aprovar resultados presumidos. Rollback por PR para `--maxWorkers=1`, mantendo ambos checks requeridos. Se não houver melhora objetiva, manter 1 worker.

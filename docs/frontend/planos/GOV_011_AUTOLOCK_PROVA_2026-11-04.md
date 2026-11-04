# GOV-011 — PLAN de ensaio operacional isolado do Auto-Lock

**Data:** 04/11/2026 · **Baseline:** frontend `13cf23629534b6294b5d2fb792826bd185fa4dae`, backend normativo `contaos999999/develop` somente leitura.

## PROMPT
A rotina Auto-Lock atual protege `src/integrations/supabase/types.ts` (blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`) e abre PR quando há drift real na `main`. Já houve fixture e workflow limpo, mas ainda não existe prova operacional de que `GITHUB_TOKEN` pode criar PR, sem escrever na `main`. O titular exige teste definitivo, sem colocar a `main` em risco.

## PLAN técnico fechado
Arquivos de mudança autorizada:
- `.github/workflows/contaos-types-autolock.yml`
- `scripts/types-autolock-workflow.test.mjs`
- `docs/frontend/planos/GOV_011_AUTOLOCK_PROVA_2026-11-04.md` (este PLAN)
- `docs/frontend/auditorias/GOV_011_AUTOLOCK_PROVA_2026-11-04.md`

Após CI verde do PLAN, criar **um job de prova isolado** no workflow existente, ativado por `push` da fusão deste GOV-011 na `main` e/ou `workflow_dispatch` com `probe_recovery=true`. O job operará apenas em **duas branches descartáveis** não protegidas: uma base com drift fictício do arquivo `types.ts`, uma com restauração do blob certificado. Exercitará `git push` nas duas branches, `gh pr create --base <drift> --head <restore>` usando `GITHUB_TOKEN`, validação por `gh pr view` (autor, base/head, diff de 1 arquivo), fechamento sem merge e exclusão dos refs descartáveis. Comparar SHA `main` antes e depois; nunca tocar `main`, nunca auto-merge. `trap` deverá tentar limpeza mesmo diante de erro e logar o resultado. Jamais reduzir proteções da branch. Se permissões de Actions impedirem PR, o job será FAIL explícito com evidência.

## TDD e controles
1. Teste unitário `node:test` deve exigir guard de evento, branches `autolock/probe-*`, criação real de PR por token, fechamento sem merge, limpeza e proibição de `push origin ...main`; usar RED/GREEN.
2. Verificar CI completo do PLAN antes de alterar workflow.
3. Com CI verde do BUILD e Teste C N/A (sem UI), merge do GOV-011 sem revisões de PR conforme ruleset; acompanhar o run `push` da `main` e verificar status real `probe-recovery`.
4. Registrar número de PR descartável e run de prova; caso FAIL, corrigir só sob novo PLAN e revalidar. Nunca anunciar restauro real em main por fixture isolada.
5. (Sem dependências/segredos novos, sem Lovable BUILD.)

## Gates
PRD/25 documentos/100 regular/97 atômico: preservados, sem alteração de requisitos. BRAND-01: sem impacto visual. Segurança: teste isolado e reversível, script não pode disparar em push funcional normal. TDD: RED/GREEN. Rollback: revert de workflow por novo PR. Prod/HML/Auth/RLS/Storage/types: **proibido alterar**. Revisão humana PR: zero segundo ruleset; gates específicos de produto permanecem.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
GitHub editor; Lovable apenas visualizar/sincronizar. Nenhum arquivo `src/**`, `public/**`, dependências, UI, marca ou backend será modificado. Teste C visual N/A por ausência de UI alterada; não alegar homologação autenticada. O workflow principal Auto-Lock não muda sua lógica de reparo, apenas recebe um ensaio operacional paralelo e não destrutivo.

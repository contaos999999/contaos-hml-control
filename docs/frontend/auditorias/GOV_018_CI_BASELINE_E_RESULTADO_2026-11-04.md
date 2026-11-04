# GOV-018 — Auditoria de desempenho e integridade de checks do CI ContaOS 4.1

**04/11/2026, horário de Brasília | Escopo: infraestrutura GitHub Actions.**
PLAN: `docs/frontend/planos/GOV_018_OTIMIZAR_CI_2026-11-04.md`, PR #35, checks `ContaOS Frontend Zero-Drift` e `ContaOS Teste C Independente` SUCCESS, integrado na main `b34e53561587d46cbf600ff3b70e35ccbdf4b8ad`.

## Dados reais ANTES (baseline coletada via GitHub REST Actions/jobs)
| Run / commit | Qualidade | Teste C | Duração processada | Observações |
| --- | ---: | ---: | ---: | --- |
| PR #32 run `41859649176`, commit `a168a8725066eafab01c2044c3e762c5ea973c61` | 15:39:53–15:41:51Z (118s) | 15:41:54–15:45:09Z (195s) | 316s (~5m16s) | Vitest 78s; Teste C Playwright 152s; instalação Chromium 27s; 192 cenários |
| main run `41861082671`, commit `f58265fd595eae5ba5bae8406dc75b2c95afc2b0` | 15:45:43–15:47:44Z (121s) | 15:47:48–15:51:04Z (196s) | 321s (~5m21s) | Vitest 83s; Teste C Playwright 154s; instalação 25s; run marcado SUCCESS apenas 16:15:24Z |

**Importante:** os quase 24 minutos adicionais entre a conclusão do job #41861082671 e o registro global de SUCCESS não foram gastos executando testes e têm causa não demonstrada. Não declarar que cache/paralelização resolvem atraso de atualização de status do GitHub.

## Alterações aprovadas no PLAN (não alterar regras de qualidade)
1. Retirar `needs: frontend-quality` do job reutilizável `teste-c`, para executar no mesmo SHA e em runners separados desde o início; manter os dois nomes de checks exigidos pelo ruleset.
2. Cache por `actions/cache@v4` de `~/.cache/ms-playwright` condicionado a auditoria requerida, com chave exata `${{ runner.os }}-contaos-playwright-chromium-1.64.1`. Continuar executando `playwright install --with-deps chromium`; dependências/axe/pngjs temporárias continuam versionadas isoladamente, sem secrets.
3. Escopo Teste C não muda: alterações no próprio workflow ativam execução integral; quando há código, auditoria integral com 24 superfícies × 4 viewports × 2 temas = **192 cenários**, screenshots e SHA256SUMS, `git diff --exit-code` read-only. Em PR só documental, Teste C N/A conscientemente, check ainda obrigatório e SUCCESS.
4. Nada em `src/`, `public/`, `supabase/`, `types.ts`, PRD, dados, Auth, RLS ou produção.

## Critérios para declarar resultado após BUILD
- CI PR BUILD, SHA fechado, dois checks SUCCESS no próprio SHA; Teste C de alteração de workflow realmente EXECUTADO e 192 casos contados.
- Registrar `started_at` e `completed_at` de cada job no GitHub REST, tempos dos passos de Vitest, install Chromium, Playwright e upload; comparar com baselines acima. `workflow run updated_at` é métrica distinta.
- Cache HIT/MISS e duração de instalação conforme logs; evitar alegar redução de instalação sem cache efetivamente restaurado.
- PR de BUILD aprovado e merge somente sem bypass, guardrails inteiros.
- Se jobs não forem disponibilizados simultaneamente, classificação do ganho = NÃO VERIFICADO por limitação operacional do runner. Se os mesmos cenários tiverem falha/cobertura incompleta, não mesclar.
- Reversão segura: PR restaurando os dois YAMLs, com duas verificações obrigatórias.
- Fase 2 (Vitest 2 workers e Teste C 2×96 shards): não incluída; novo PLAN e testes de repetibilidade antes de alterar.
## STATUS DE RESULTADO
**PENDENTE de execução do PR de BUILD.** Não inventar valores futuros.

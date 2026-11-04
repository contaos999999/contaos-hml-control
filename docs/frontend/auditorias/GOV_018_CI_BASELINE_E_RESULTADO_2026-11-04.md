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
## STATUS DE RESULTADO — EXECUÇÃO COMPROVADA E MERGE

**BUILD implementado e integrado:** PR [#36](https://github.com/contaos999999/contaos-hml-control/pull/36), commit de validação `d478b5829064f53563b9136cd4cc0f0ccc436faa`; 2 check-runs do mesmo SHA **SUCCESS**; commit de merge na `main` `070022bb72c86c221f0f02898b7b9c3e3db67b9c` (confirmado via GET /branches/main).

### Run A/B de PR após a alteração
- [Run #41869470067](https://github.com/contaos999999/contaos-hml-control/actions/runs/41869470067): **SUCCESS**, finalizado às 16:42:17Z.
- **Qualidade:** 16:39:15Z → 16:40:59Z = **104 s**, incluindo regressão Vitest **71 s**, TypeScript, build, zero-drift e verificações; check `ContaOS Frontend Zero-Drift` SUCCESS.
- **Teste C:** 16:39:06Z → 16:42:17Z = **191 s**, incluindo Playwright 16:39:44Z → 16:42:06Z = **142 s**, instalação isolada **23 s**; check `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente` SUCCESS.
- **Início simultâneo comprovado:** Teste C começou 16:39:06Z e qualidade começou 16:39:15Z, diferença de apenas 9 segundos. O navegador não precisou esperar 104 s de regressão.
- **Duração processada total:** 16:39:06Z → 16:42:17Z = **191 s (3m11s)**, contra baseline de código na main #41861082671 **321 s (5m21s)**, redução **130 s (≈40,5%)**. A diferença de hardware/disponibilidade e execução variável exige replicação, mas paralelização dos jobs foi comprovada.
- **Integridade da auditoria:** log de Teste C `PASS_ESCOPADO_PUBLICO_SESSAO_REAL_NAO_VERIFICADA, 192 combinações, 25 capturas; HML real NÃO VERIFICADO`. Artefato `contaos-teste-c-41869470067-1`, ID `13344291691`, tamanho informado **2.182.609 bytes**, não expirado no momento da conferência; upload e hash SHA256SUMS em log. `git diff --exit-code` de somente leitura PASS.
- **Cache:** primeiro acesso declarou `Cache not found for input keys: Linux-contaos-playwright-chromium-1.64.1`; post-job declarou `Cache saved with key: Linux-contaos-playwright-chromium-1.64.1`. O ganho de 130 s **não pode ser atribuído ao cache**; medir HIT em corrida subsequente, observando que caches de branches PR e main podem ter escopos diferentes.
- **Pós-merge:** run na `main` #41870259996 foi iniciado; na atualização deste relatório seu desfecho e cache HIT permanecem NÃO VERIFICADOS. Registrar separadamente quando houver resultados.

**Cobertura e segurança preservadas:** sem alterações src/public/backend/PROD/types.ts, não houve mudança de regras, mesmo Teste C 24×4×2; status checks e ruleset inalterados; testes autenticados HML continuam não verificados.

**Fase seguinte:** avaliar hit de cache no post-merge; Vitest 2 workers e split 2×96 exigem PLAN separado, provas de estabilidade e auditoria de agregação antes de entrar na main.

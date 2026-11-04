# GOV-020 — TanStack routeTree, prevenção de drift antes dos testes longos

Data: 04/11/2026. Repositório: `contaos999999/contaos-hml-control`. Baseline: `main@cffbf0532a7fe76f384130ae56df080a7a8a14ed`. Norma `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`.

## Falha concreta reproduzida e motivação
No PROMPT 41 / V1-20, CI run [41904426343](https://github.com/contaos999999/contaos-hml-control/actions/runs/41904426343) concluiu 848 testes PASS/31 arquivos e Teste C navegou por 208 combinações, 24 capturas, mas seu check obrigatório terminou FAIL: `src/routeTree.gen.ts`, versionado na branch, diferia da saída do gerador TanStack. A divergência incidiu em ordenação interna e nome de constante. O controle final de integridade detectou corretamente o drift, porém só depois do trabalho de navegação. Não suprimir esse controle.

## Decisão e escopo
O TanStack é o único autor do arquivo gerado. **Nunca editar o `src/routeTree.gen.ts` manualmente.** A rota é criada em `src/routes/`; o BUILD legítimo `bunx vite build` gera a árvore, cuja versão determinística deve constar no mesmo commit do código. O CI é estritamente somente leitura e **não** faz `git add`, `git commit`, `git reset`, `git checkout` ou push para corrigir falha.

O guard em `scripts/route-tree-drift-gate.mjs` usa `git ls-files` e `git status --porcelain` para impedir árvore removida/não versionada/divergente. Apresenta diff real e termina com exit code 1. Não cria/atualiza código; apenas inspeciona.

## Fluxo obrigatório para qualquer prompt que crie/renomeie/remova rotas
1. Após PLAN/GATE e TDD, adicionar/alterar apenas arquivo em `src/routes/` listado na allowlist e implementar conforme PRD.
2. Na branch autorizada, executar `bun install --frozen-lockfile` e `bunx vite build`, o mesmo gerador do CI, sem novas dependências.
3. Conferir `git diff -- src/routeTree.gen.ts`, incluindo nomes/ordem gerados. Se a rota mudou, registrar a saída como artefato `src/routeTree.gen.ts` no **mesmo PR** e na allowlist válida. Não reescrever o arquivo na mão.
4. Executar `node scripts/route-tree-drift-gate.mjs` **depois do commit** da árvore gerada e do build. Deve emitir `GOV-020 PASS`; se FAIL, não abrir/mesclar BUILD.
5. No CI quality, preservar regras existentes de escopo, fonte normativa e BRAND-01; depois do setup congelado executar autotestes GOV-020, lint, `bunx vite build` uma única vez e o guard GOV-020 **ANTES** da regressão Vitest longa; após PASS continuar Vitest 2 workers, tsc e Zero-Drift.
6. No job isolado Teste C, preservar Playwright e auditoria independente; após Vite dev ficar pronto, executar o mesmo guard **ANTES** dos cenários. Manter obrigatória a checagem final `git diff --exit-code --` e `git status --porcelain --untracked-files=no`.
7. Exigir que **ambos** os checks obrigatórios terminem SUCCESS **no mesmo SHA HEAD final** antes do merge. O escopo visual (4 larguras × 2 temas) não é substituído pelo gate. PR meramente documental pode marcar Teste C N/A pelo filtro existente, sem alegar E2E.

## Critérios de aceitação negativos e positivos
| Evidência | Resultado obrigatório |
| --- | --- |
| Tree versionada idêntica ao gerado | `GOV-020 PASS` |
| Nome ou ordem da rota alterado pelo gerador | `GOV-020 FAIL`, diff emitido, sem iniciar Vitest |
| Arquivo gerado removido | `GOV-020 FAIL` |
| Arquivo gerado presente mas não versionado | `GOV-020 FAIL` |
| Teste C regenerar arquivo após o gate inicial | **Check final FAIL**, nunca aprovação automática |
| Mudança não autorizada em schema/types/backend | **Gates atuais FAIL**, GOV-020 não concede exceção |
| Run com PASS de browser, mas job final FAIL | **PR não integrável**, evidência parcial preservada |

A prova automatizada dos quatro primeiros cenários usa temporários Git fora do repositório de trabalho, sem alterar arquivos versionados. Os cenários de CI com geração real e dois checks devem ser comprovados pela execução deste PR.

## Proteções preservadas
Sem alteração no ruleset/branch protection, nomes dos checks obrigatórios, fonte canônica, crosswalk 100/97, BRAND-01, `types.ts`, Supabase, Auth, RLS, PROD, política de segurança ou evidências de Teste C. Ensaio RLS real A/B continua NÃO VERIFICADO, facultativo após regular 99 conforme PR #49, não relacionado à geração do TanStack.

## Rollback
Reverter por PR apenas o novo guard, os dois steps preventivos e este complemento documental, preservando integralmente o controle final original do Teste C e demais checks. Não permitir `git reset --hard`, push direto à main, bypass de rule set ou descarte do `routeTree.gen.ts`. Uma reversão excepcional exige novo PLAN/avaliação de risco, pois removeria uma defesa adicional.

## Compatibilidade e economia
Sem novo pacote, plugin TanStack duplicado, `package.json` ou `bun.lock` alterados. A geração reutiliza `bunx vite build`, antes já exigido em quality, apenas deslocado para antes dos testes longos, evitando duplicação de build. O job Teste C reutiliza o Vite dev já ativo. O guard é Node built-in, sem instalação adicional.

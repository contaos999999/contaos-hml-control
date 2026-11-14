# Fase 3, BUILD-1: protocolo, guardas, workflow e catálogo (offline)

O BUILD da Fase 3 (PLAN #655, seção 9, passo 3) foi dividido em duas PRs, ambas dentro da lista fechada da seção 7.6. A divisão não muda os critérios do PLAN. Ela só separa o que pode ser provado sem HML.

- **BUILD-1 (esta PR):**
  - `INTEGRACAO_V1_FASE3_SCOPE`, `resolveFixturesScope` e `singleRequestFixturesScope` em `authenticated-visual-audit.mjs`, com o escopo provado na revalidação e restaurado em `loadSingleRequestProof`;
  - a guarda `FIXTURES_SCOPE_NOT_TRILHA_A` no preparador;
  - o executor `integracao-v1-fase3.mjs`, com a guarda `FIXTURES_SCOPE_NOT_F3`, o catálogo derivado da matriz e os validadores estritos, o orçamento, os enums e o `backendSha` fixo;
  - os itens a–d do workflow;
  - `F3_CASES.json`.
- **BUILD-2:** drivers de UI dos produtores e esperado por tela (MASTER e `leitor`, pela matriz RBAC), fixado no `F3_CASES.json` antes de qualquer execução; livro de intenções, negativos, relatório, ledger e inventário de isolamento.

Até o BUILD-2, o executor falha fechado com `F3_DRIVER_PENDING` depois da guarda de escopo, e nenhum REQUEST da Fase 3 deve ser criado.

## Catálogo

`F3_CASES.json` (SHA-256 `72d8e1cdc9fd661c4b020d505e5fbfb68ca26ea9d83feb431c0f93f1dc5fe9ee`) é a derivação determinística da matriz `bb7ce43` (SHA-256 `b8b4980b…`). Os números:
- 138 casos, 120 OBRIGATORIA e 18 CONDICIONAL (todos em V123);
- 20 produtores, ordenados como na seção 3 do PLAN;
- `expected.master` e `expected.leitor` ainda nulos.

O teste `validateF3Cases` exige igualdade exata com a derivação.

## Comportamento preservado

- **Operação `audit`:** não muda.
- **Trilha A:** o nonce `trilha-a-fixtures-20261110-r20` resolve `TRILHA_A`, e o preparador só roda com esse escopo.
- **Proveniência visual:** passa a receber escopo somente na operação `audit`. Isso evita tratar `TRILHA_A` como escopo de auditoria.
- **`workflow_dispatch`:** sem escopo exposto, nenhum executor fixtures roda. O preparador já exigia `workflow_run`.

## Interpretação registrada do item 7.4 do PLAN (revisão da PR #656)

Os itens a–d foram aplicados como descrito no PLAN. Três consequências diretas deles ficam registradas como interpretação, sem ampliar escopo.

1. **Evidência por escopo.** O item (d) condiciona os executores ao escopo, e a seção 7.5 exige artefato próprio. Por isso:
   - os dois passos de evidência da Trilha A (hash e upload) passaram de `always()` para `always() && scope == 'TRILHA_A'`;
   - foram criados dois passos equivalentes para a Fase 3, com `scope == 'INTEGRACAO_V1_FASE3_REL'` e artefato `integracao-v1-fase3-<run>-<attempt>`.

   Sem isso, uma execução de um escopo publicaria ou exigiria a evidência do outro.
2. **Par do MASTER no passo F3.** O passo do executor F3 recebe também o par sintético do MASTER (`CONTAOS_HML_SYNTHETIC_*`). A seção 7.2 exige que o MASTER aja como produtor. O item (c) trata só do par do 2º usuário, que continua restrito a esse passo.
3. **`workflow_dispatch`.** Sem escopo exposto, o job `private` acionado manualmente agora termina sem executar nenhum executor. Antes, ele falhava no preparador (`PREPARER_MAIN_ONLY`). Nenhum dos dois caminhos fazia mutação.

Se o revisor ou o titular entenderem que algum desses pontos precisa de emenda formal do PLAN, ela é feita antes do merge.

## Obrigações transferidas ao BUILD-2

- Gravar `SHA256SUMS` em `artifacts/integracao-v1-fase3/` também em resultado parcial ou bloqueado. Hoje, com `F3_DRIVER_PENDING`, o diretório não existe e o passo de evidência falha fechado.
- Confirmar que as provas R4, R12 e R14, exigidas para toda operação `fixtures`, valem quando o pai é o merge do BUILD da Fase 3.
- Cobrir com testes os negativos da seção 9, passo 3: falso PASS, campo livre ou credencial no relatório, mutação fora da organização F3, reenvio de intenção incerta sem readback, mutação pelo 2º usuário e perfil diferente de `leitor`.
- Fixar, antes de qualquer REQUEST, o esperado de cada tela para o MASTER e para o `leitor`, com fonte no código. Atualizar `F3_CASES_SHA256` junto, na mesma PR revisada.

## Consumo do nonce F3

O nonce F3 não nasce consumido e não consta em `spentFixtureNonces`. O consumo é provado como nos demais nonces, pela unicidade de execuções (`validateSingleRequestRuns`, em `--request-preflight` e `--request-revalidate`). Depois da execução, o sucessor só existe com um novo nonce, em novo PLAN, BUILD ou REQUEST, e o nonce consumido entra na lista histórica.

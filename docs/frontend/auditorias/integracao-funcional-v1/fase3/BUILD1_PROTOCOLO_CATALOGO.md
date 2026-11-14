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

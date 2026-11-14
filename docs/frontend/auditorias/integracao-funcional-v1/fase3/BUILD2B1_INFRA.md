# Fase 3, BUILD-2b-1: infraestrutura offline do executor

O BUILD-2b foi dividido em duas PRs por decisão do titular na conversa de 13/11/2026, às 23h (Bahia). Resposta literal: "2b-1 infra, 2b-2 drivers (Recomendado)". Esta PR é a 2b-1. Ela não faz login, não abre navegador contra a HML e não cria dado. Os drivers de UI dos produtores, a sessão do 2º usuário e a leitura das credenciais ficam no BUILD-2b-2. Até lá, a execução HML grava um relatório `BLOCKED` e falha fechada com `F3_DRIVER_PENDING`, e nenhum REQUEST da Fase 3 deve ser criado.

Arquivos alterados, todos dentro da lista fechada da seção 7.6 do PLAN:
- `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`;
- `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_LEDGER.json` (novo) e este documento;
- `docs/frontend/planos/PLANO_ATIVO.json` e o prefixo do checkpoint.

O YAML, o auditor, o preparador, `src/**`, `types.ts`, dependências, backend e PROD não mudam.

## O que entra

| Peça | Função exportada | Código de falha |
|---|---|---|
| Recibo por caso (campos da seção 16.2 do plano mestre mais os da F3) | `f3ReceiptBase`, `F3_RECEIPT_KEYS` | `F3_REPORT` |
| Status derivado das provas, nunca declarado | `deriveF3Status`, `f3Summary` | `F3_REPORT` |
| Relatório só com IDs, enums, contadores e booleanos | `validateF3Report` | `F3_REPORT`, `F3_ISOLATION`, `F3_NA_UNAPPROVED` |
| Gate quantitativo da seção 5 do PLAN | `f3Gate` | devolve `PASS` ou `FAIL` |
| Relatório bloqueado e gravação com `SHA256SUMS` | `blockedF3Report`, `writeF3Artifacts`, `f3ProvenanceFromEnv` | `F3_REPORT`, `F3_CASES_HASH` |
| Livro de intenções idempotente | `createF3IntentBook` | `F3_SECOND_USER_MUTATION`, `F3_FOREIGN_ORG`, `F3_INTENT_REPLAY`, `F3_UNCERTAIN_RESEND`, `F3_BUDGET`, `F3_INTENT_PRODUCER`, `F3_INTENT_ID` |
| Perfil do 2º usuário | `assertF3SecondUserProfile` | `F3_SECOND_USER_PROFILE` |
| Releitura do RBAC do `leitor` contra a fotografia v6 | `assertF3LeitorRbac` | `F3_RBAC_DRIFT` |
| Negação só por estado explícito | `classifyF3Access`, `F3_DENIAL_TOKENS`, `F3_PARTIAL_DENIALS` | `ERROR` na observação |
| Ledger append-only, só PASS (regra C) | `validateF3Ledger`, `validateF3LedgerExtension`, `preservedF3Cases` | `F3_LEDGER`, `F3_LEDGER_HASH` |
| Contrato do YAML (estrutura e SHA-256) | `assertF3WorkflowStructure`, `assertF3WorkflowContract` | `F3_WORKFLOW` |

## Regras que o código fixa

1. **Falso PASS.** O status de cada recibo é recalculado pelo validador. `PASS` exige positivo `PASS`, os dois negativos de leitura `NEGADO`, duplicidade `REJECTED` ou `DUPLICATE_NOT_DEFINED`, observado igual ao esperado (o `leitor` só nos 26 casos de ADM01), nenhum `errorClass` e `cleanupStatus` coerente com o produtor. Qualquer `VAZAMENTO`, `ACCEPTED`, `CLEANUP_FAILED` ou divergência de acesso vira `FAIL`. Prova ausente, `SEM_ENTIDADE` ou observação `ERROR` vira `BLOCKED`. O resumo também é recalculado.
2. **N/A.** `N_A_JUSTIFICADO` só vale para caso `CONDICIONAL` listado em `F3_NA_AMENDMENTS`, que começa vazio. Entrar nessa lista exige a emenda aprovada pelo titular da seção 4, item 5, do PLAN.
3. **Campo livre ou credencial.** Todo objeto do relatório tem chaves exatas, sem getter nem proxy. Cada string tem formato fechado (UUID, SHA de 40 ou 64, `dpl_…`, ID numérico, código em maiúsculas). E-mail, JWT, HTML ou texto livre falham.
4. **Isolamento.** A organização F3 não pode ser a `e87f7e68`. Todo registro criado pertence à organização F3, e todo `entityId` citado num recibo precisa estar no inventário. Os contadores da `e87f7e68` antes e depois têm as mesmas telas, e o gate só passa com eles iguais.
5. **Livro de intenções.** Só o MASTER sela intenção, só nos produtores mutantes (ordens 2 e 4 a 20), só na organização F3. Cada `requestId` é selado uma vez. A intenção incerta só é reenviada depois de um readback que prove ausência, e só uma vez. Readback que acha a entidade em outra organização falha com `F3_FOREIGN_ORG`. Cada envio conta no orçamento, inclusive a duplicidade rejeitada (30 por execução, 60 no total).
6. **Negação.** `DENY` exige o estado explícito registrado para a tela e nenhum conteúdo. Tela vazia, genérica, com estado de outra tela ou com conteúdo junto da negação é `ERROR`. Em V117, a negação parcial de revisão (`!pode_revisar`) é ignorada como negação da tela. Em V123, `DENY` exige a RPC `pode_consultar_auditoria_organizacao` com HTTP 200 e corpo `false`, o que impede o `catch(() => false)` da tela de transformar erro em negação. Os tokens de V111 e V120 entram por emenda no BUILD-2b-2, depois de confirmados pela UI; até lá, qualquer negação nessas telas é `ERROR`.
7. **Ledger.** `F3_LEDGER.json` nasce vazio, com SHA-256 `3cd3a1b6…` fixado em `F3_LEDGER_SHA256`. Uma extensão só acrescenta entradas `PASS` do catálogo, sem repetir caso, com proveniência completa, `artifactId`, `sha256` e `reviewId`. Um PASS só é preservado com o mesmo produto, backend e deployment e com harness ancestral. Os controles globais ficam no relatório e nunca são herdados.
8. **YAML.** O executor recusa rodar se o YAML na checkout não tiver o SHA-256 aprovado (`8da83394…`) ou a estrutura dos itens a–d. O teste prova 13 adulterações recusadas, entre elas secret do 2º usuário no `env` do job ou no passo da Trilha A, gate de escopo trocado, revalidação sem `id` ou sem restrição a `workflow_run`, barreira nativa depois do executor, arquivo F3 fora do filtro ou do `node --test`, hashes sem `always()`, permissão `write` e environment diferente de `hml`. Atende à sugestão do revisor da PR #657.
9. **Resultado parcial.** Qualquer falha depois da checagem de evento grava `artifacts/integracao-v1-fase3/F3_REPORT.json`, a cópia do catálogo e `SHA256SUMS`. Sem catálogo válido, o relatório sai sem casos. Relatório inválido nunca é gravado.

## Provas R4, R12 e R14 com o pai F3

Na operação `fixtures`, `--request-preflight` e `--request-revalidate` exigem as provas `R4_ZERO_AUTH_PROOF`, `R12_ZERO_AUTH_PROOF` e `R14_ZERO_AUTH_PROOF`. R12 e R14 recebem `parentSha` igual ao `approved_parent_sha` do REQUEST e só exigem que o `headSha` de cada prova seja ancestral dele. R4 exige ancestralidade em relação ao `HEAD`. Nenhuma delas compara o pai com um SHA fixo.

Conferência feita em 13/11/2026, às 23h30 (Bahia), com as funções do próprio auditor, metadados reais do GitHub Actions (somente leitura) e histórico git local:

| Prova | `headSha` | Pai usado | Resultado |
|---|---|---|---|
| R4 | `4c3a92b` | `HEAD` = main `d2a6557` | OK |
| R12 | `3d6bea3` | `d2a6557` | OK |
| R14 | `6a62d7d` | `d2a6557` | OK |

Os três `headSha` são ancestrais da main, e as execuções citadas continuam sem artefatos, como as provas exigem. Como o merge do BUILD-2b-2 descende da main, a ancestralidade se mantém. A prova definitiva é a própria revalidação do REQUEST.

## Ajustes em testes do BUILD-1

O teste "executor não importa preparador da Trilha A nem lê secrets fora do passo" procurava os textos `prepare-visual-fixtures` e `CONTAOS_HML_SYNTHETIC` em qualquer lugar do código. O contrato do YAML precisa citar esses nomes. O teste passou a proibir o que importa: importar o preparador e ler o ambiente. O executor continua sem importar o preparador, e o único acesso a `process.env` é o parâmetro padrão de `runCli`. A leitura das credenciais chega no BUILD-2b-2, dentro do passo do executor.

## Testes

- `integracao-v1-fase3.test.mjs`: 24 testes (11 do BUILD-1 e BUILD-2a, 13 novos), todos verdes. Os 12 primeiros novos foram escritos antes da implementação e falharam (RED).
- Suíte do job `protocol` (auditor, preparador e F3): 904 testes, 882 passam. As 2 falhas (`GET publico nunca envia Authorization` e `R13 POSIX ignored-build template`) são de ambiente local: falham igual na main `d2a6557` (891 testes, 869 passam). O CI é a prova.
- `eslint` e `prettier --check` limpos nos arquivos alterados.

## Próximo passo: BUILD-2b-2

- Drivers de UI dos 16 produtores de negócio e do vínculo ADM01, sobre o livro de intenções desta PR.
- Login, seleção da organização e logout do MASTER e do 2º usuário, com leitura das credenciais só no passo do executor e falha fechada antes do login se faltarem `CONTAOS_HML_SYNTHETIC_2_*`.
- Releitura do RBAC do `leitor` com `assertF3LeitorRbac` e perfil com `assertF3SecondUserProfile`.
- Confirmação pela UI dos estados de negação de V111 e V120 e, se for o caso, emenda de `F3_DENIAL_TOKENS` e do catálogo.
- Inventário de isolamento e contadores da `e87f7e68`.

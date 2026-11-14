# Fase 2 R12: preflight da REQUEST excede o prazo da API por listar todo o histórico

## Estado terminal R11, sem certificação

A Fase 2 continua NÃO CERTIFICADA. Cadeia integrada na `main`:
- PLAN R11: #640, merge `f54f7ec49b58d051502fc62f03b8580927a1d276` (commit do PLAN `0922b2e`).
- BUILD R11: #641, merge `217c030eba438bd652fe49fc7a495a5a528965a2` (ledger v4 `2245b4fe…`, 51 PASS da R10, pendente 52; diagnóstico do logout).
- REQUEST R11: #642, merge `de2c28d7c79c62f91470dfe4c324ec7ce002367f`. A revisão canônica `5896068955` foi a última no HEAD, conferida pela API.

Produto e HML sem mudança: `e6c8cb0` / `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`.

Execuções:
- Auth `43482958336`, attempt 1. Job de solicitação `132083907871` **FAILURE** com `{"state":"BLOCKED","code":"REQUEST_API_TIMEOUT"}`, 60 s depois do início do `--request-preflight`. O job privado foi `skipped`: **não houve login, credencial, navegador privado nem caso executado**. Não há artefato.
- Fixtures `43482958330`: SUCCESS; o job privado oposto ficou `skipped` às 18:28:54, antes do início do preflight da auditoria, então a espera pelo oposto não consumiu o prazo.

R11 está consumida, sem rerun, replay nem reuso de nonce. O ledger v4 continua válido e o índice 52 continua pendente.

## Causa

`singleRequestGet` dá **60 s** para todas as leituras da API do preflight. O preflight lista **todo o histórico** de execuções dos dois workflows (`/actions/workflows/<id>/runs`, até 10 páginas de 100) só para filtrar as execuções cujo `head_sha` pertence à REQUEST.

- O workflow autenticado já tem 611 execuções; cada lista ocupa 7 páginas de objetos completos, e são duas listas.
- O preflight levou 52 s na R9, 55 s na R10 e passou de 60 s na R11. O tempo cresce com o histórico.
- `listSingleRequestRuns` também falha fechado acima de 1000 execuções, limite que o histórico atingirá em breve.

É defeito estrutural do harness, não instabilidade a ser repetida até passar.

## BUILD R12

1. **Listagem por SHA, mesma semântica.** Para cada SHA da REQUEST (`requestShas`), consultar `/actions/workflows/<id>/runs?head_sha=<sha>&per_page=100&page=N` e unir as respostas. Manter só as execuções com `head_sha` em `requestShas`, sem duplicatas. O conjunto validado por `validateSingleRequestRuns` e pela prova do oposto é exatamente o mesmo de hoje (as execuções desses SHAs), com as mesmas regras de paginação, limites e fail-closed. O prazo de 60 s e os 5 s por chamada **não mudam**.
2. **Diagnóstico fechado do prazo.** Quando o prazo estourar, emitir só a quantidade de chamadas feitas, o tipo do endpoint em curso (lista fechada já existente) e o tempo decorrido. Sem caminho, token ou corpo.
3. **Nonce** `integracao-v1-fase2-nav-20261113-r12`, R11 consumida, este PLAN como ancestral. Ledger, produto e deployment inalterados; o índice 52 segue pendente.
4. **Compatibilidade:** o harness R12 só muda leituras do preflight anteriores a qualquer credencial e o nonce; não altera a verificação de um caso. `050beb1` continua compatível; o relatório da R11 é atualizado.

## Proibições

Continua proibido:
- aumentar prazos, repetir a R11 ou reutilizar nonce;
- ignorar `ABORTED`, suprimir `requestfailed`, zerar contadores ou desabilitar o fence;
- alterar produto, backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, YAML, lockfile, branch protection, `types.ts` ou PROD.

As regras de consolidação e certificado do PLAN R11 continuam valendo. Zero-Drift, LOCK, isolamento e fail-closed continuam obrigatórios. PLAN, BUILD e REQUEST são integrados por merge commit; a revisão canônica é a última no HEAD da REQUEST.

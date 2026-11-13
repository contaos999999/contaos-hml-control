# Fase 2 R8: ledger incremental e prova de compatibilidade dos PASS R7

Fase 2 continua NÃO CERTIFICADA. Este documento acompanha o BUILD do executor incremental exigido pela emenda de certificação incremental (PR #626, merge `78a5f4b`). O ledger ainda **não** está fixado: `NAVIGATION_LEDGER.sha256 = null`, e enquanto for nulo toda auditoria NAV falha fechada com `NAVIGATION_LEDGER`.

## Mecanismo

- **Ledger:** `docs/frontend/auditorias/integracao-funcional-v1/fase2/NAV_LEDGER.json`, schema `contaos.navigation.incremental.v1`, append-only. Ele é fixado no auditor por SHA-256 (`NAVIGATION_LEDGER.sha256`) junto com o índice de retomada esperado (`resumeFrom`).
- **Índice canônico:** a ordem de `navigationCases()` (26 superfícies × 1440/light, 390/dark). O ledger traz `catalogueSha256` dessa ordem e cada entrada confere `index`, `surface`, `width` e `theme`.
- **Entrada:** `status` PASS, `compatibility` (`valid` ou `superseded`), `runId`, `attempt` 1, `frontendSha`, `harnessSha`, `deploymentId`, `artifactId`, `artifactSha256`, `reportSha256` e `justification`. Campos extras ou ausentes são recusados.
- **Regras fail-closed:**
  - `valid` exige o mesmo produto e deployment de `NAVIGATION_DEPLOYMENT` e um harness listado em `compatibleHarnessShas`;
  - `superseded` exige um PASS anterior e justificativa, e nunca apaga o histórico;
  - não pode haver dois PASS válidos para o mesmo índice, nem evidência repetida;
  - não pode haver lacuna: nenhum PASS válido depois do primeiro índice pendente;
  - o índice de retomada calculado tem de ser igual ao fixado.
- **Execução:** `runNavigationAudit` executa somente `navigationRunCases(resumeFrom)`. Casos anteriores não são executados, não geram registro e não contam como testados nesta execução. Login, MASTER, organização, sessão e logout continuam sendo executados e exigidos em toda execução.
- **Relatório:** com `resumeFrom > 1`, o relatório passa a `contaos.navigation.audit.v4`, com `ledgerSha256` e `resumeFrom`. O resumo traz `expected` (casos do recorte), `observed`, `passed`, `failed`, `resumeFrom`, `runComplete` e `cumulativeMatrixComplete`, e **não** tem `matrixComplete`: uma execução parcial nunca afirma 52/52. O validador v4 reaproveita sem mudança todos os controles globais do v3.
- Com `resumeFrom = 1`, o fluxo v3 original permanece idêntico.

## Prova de não impacto: harness R7 `a3b6c34` → harness R8

O produto é o mesmo: fonte `3638cdd381cb911f6bdc115169891a25479b7a25`, deployment `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, pins inalterados. As diferenças do auditor entre `a3b6c34` e este BUILD estão em quatro áreas:

1. **`createRequestLifecycle` e `installNativeFence`:** aposentadoria do preflight CORS de GET cancelado, com três provas (PR #629). A mudança só remove uma condição pendente que nunca terminaria. Todo caso que passou no R7 drenou sob a regra antiga, mais estrita, então o veredito desses casos não pode piorar nem melhorar por causa dela.
2. **Nonce e ancestralidade R8** (`SINGLE_REQUEST`): afeta só a admissão da execução.
3. **Ledger e recorte** (`NAVIGATION_LEDGER`, `navigationRunCases`, `runNavigationAudit`): define quais casos rodam, não como cada caso é verificado.
4. **Relatório v4 e assinatura de `summarizeNavigation`:** os validadores de linha (`navigationRowValid`), os specs de prontidão, os probes de links e controles e a política de rede de cada caso estão inalterados.

Conclusão: os PASS da R7 nos índices 1 a 25 permanecem compatíveis, e `a3b6c34` é o único harness declarado em `compatibleHarnessShas`. Qualquer alteração futura de produto, deployment, shell ou navegação compartilhada exige marcar como `superseded` os índices afetados, presumindo impacto amplo até prova em contrário.

## Pendências antes da REQUEST R8 (PR separada)

1. Baixar o artefato R7 `14008077669` e conferir o ZIP digest `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`, CRC, membros e `sha256sum --check SHA256SUMS`. Validar o `report.json` (schema v3, ordem canônica, índices 1-25 PASS com o validador de linha do auditor, índice 26 FAIL) e registrar apenas os hashes.
2. Criar o `NAV_LEDGER.json` com as 25 entradas, fixar `NAVIGATION_LEDGER.sha256` e passar por revisão independente, CI e merge protegido.
3. Só então criar a REQUEST R8 de sete chaves, com a revisão canônica JSON pela identidade exigida no auditor.

Certificação final: 52 entradas PASS válidas e compatíveis (1-25 da R7, 26-52 da R8), artefatos originais verificáveis, controles globais verificados na R8, revisão independente do ledger consolidado e PR final integrada.

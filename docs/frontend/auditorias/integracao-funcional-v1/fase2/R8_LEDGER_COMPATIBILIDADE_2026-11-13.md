# Fase 2 R8: ledger incremental e prova de compatibilidade dos PASS R7

Fase 2 continua NÃO CERTIFICADA. Este documento acompanha o BUILD do executor incremental exigido pela emenda de certificação incremental (PR #626, merge `78a5f4b`). O ledger ainda **não** está fixado: `NAVIGATION_LEDGER.sha256 = null`, e enquanto for nulo toda auditoria NAV falha fechada com `NAVIGATION_LEDGER`.

## Mecanismo

- **Ledger:** `docs/frontend/auditorias/integracao-funcional-v1/fase2/NAV_LEDGER.json`, schema `contaos.navigation.incremental.v1`, em forma canônica exata (`JSON.stringify(…, null, 2)` + LF). Texto fora da forma canônica, com chaves duplicadas ou acima de 256 KiB é recusado.
- **Pin no auditor** (`NAVIGATION_LEDGER`): `sha256` do arquivo, `previousSha256` (cadeia append-only; nulo no primeiro ledger), `resumeFrom` esperado e `compatibleHarnessShas`.
- **Índice canônico:** a ordem de `navigationCases()` (26 superfícies × 1440/light, 390/dark), amarrada por `catalogueSha256`. Cada entrada confere `index`, `surface`, `width` e `theme`.
- **Entrada `PASS`:** `runId`, `attempt` 1, `frontendSha`, `harnessSha`, `deploymentId`, `artifactId`, `artifactSha256` e `reportSha256`, sem campos extras ou ausentes. Regras:
  - execuções em ordem crescente e índices crescentes dentro de cada execução;
  - evidência idêntica entre todas as entradas da mesma execução;
  - nunca dois PASS válidos para o mesmo índice.
- **Entrada `SUPERSEDED`:** invalida um PASS sem apagá-lo. Aponta a execução exata (`supersedesRunId`, `supersedesAttempt`) do PASS válido no mesmo índice e o commit da mudança (`changeSha`), com justificativa de 16 a 512 caracteres. Não carrega evidência de PASS. O índice pode então ser reexecutado e receber um novo PASS.
- **Compatibilidade:** exigida dos PASS que permanecem válidos: mesmo produto e deployment de `NAVIGATION_DEPLOYMENT` e harness em `compatibleHarnessShas`.
- **Sem lacuna:** nenhum PASS válido depois do primeiro índice pendente, e a retomada calculada tem de ser igual à fixada.
- **Extensão:** `validateNavigationLedgerExtension(anterior, novo)` exige que a nova versão encadeie o hash da anterior e só acrescente entradas ao fim. Todo PR que refixar o ledger deve incluir esse teste com a versão anterior.
- **Validação antes de qualquer credencial:**
  1. no preflight sem credenciais (`--request-preflight`);
  2. no `--request-revalidate` do job privado, antes dos secrets;
  3. na entrada do `--audit`;
  4. em `runNavigationAudit`, logo após as verificações de escopo e antes de qualquer ação no navegador.

  Com `sha256` nulo ou ledger inválido, a execução falha nesses pontos, antes do login no HML.
- **Execução:** só `navigationRunCases(resumeFrom)`. Casos anteriores não são executados, não geram registro e não contam como testados. Sessão, MASTER, organização e logout continuam obrigatórios em toda execução.
- **Relatório:** com `resumeFrom > 1`, schema `contaos.navigation.audit.v4`, com `ledgerSha256`, `resumeFrom` e resumo `expected`, `observed`, `passed`, `failed`, `resumeFrom`, `runComplete`, `cumulativeMatrixComplete`, **sem** `matrixComplete`. O validador v4 reaproveita sem mudança todos os controles globais do v3. A montagem final (`navigationFinalSummary`/`navigationReportLedger`) nunca lança: se o ledger faltar, a execução abortar ou o logout falhar, o relatório é gravado e lacrado com `runComplete=false` e `cumulativeMatrixComplete=false`.
- Com `resumeFrom = 1`, o fluxo v3 permanece o mesmo, apenas passando a exigir um ledger válido.
- A matriz consolidada 52/52 corresponde a `resumeFrom = 53`. Ela é validada pelo `validateNavigationLedger` e não abre execução (`navigationRunCases(53)` é recusado).

## Prova de não impacto: execução R7 → execução R8

**Produto.** É o mesmo: fonte `3638cdd381cb911f6bdc115169891a25479b7a25`, deployment HML `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, `NAVIGATION_DEPLOYMENT` inalterado.

**Backend e RBAC/RLS.** O `contaos999999/develop` continua em `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6` (09/11/2026), igual ao `baseline_backend` registrado para a R7 em `PLANO_ATIVO.json`. A última migration aplicada ao Supabase HML `gklhhhyosgasnyoxlrui` é `20261109014019 c_chat_raw_read_hardening`, de 09/11/2026, anterior à execução R7 de 13/11/2026 03:18Z (consulta só leitura).

**Fixtures e dados HML.** Desde a R7 (Fixtures `43358055500`), todas as execuções `workflow_run` de Fixtures (`43364499714`, `43374016811`) e Auth (`43364499709`, `43374016775`) tiveram os jobs privados `skipped`. Não houve preparação sintética nem sessão privada, e o estado sintético é o mesmo da R7.

**Dependências do harness.** Nenhuma mudança em `package.json`, lockfiles, `.github/` ou `scripts/ci/` entre `a3b6c34` e este BUILD.

**Código do harness.** As diferenças entre `a3b6c34` e este BUILD estão em quatro áreas:
1. **Ciclo de vida do fence (PR #629).**
   - A aposentadoria do preflight torna o drain mais permissivo apenas quando as três provas existem. Isso não pode transformar em FAIL um caso que passou sob a regra mais estrita da R7.
   - `responded()` acrescenta um caminho de falha `FENCE_REQUEST_LIFECYCLE`, alcançável só por uso fora de ordem do ciclo de vida. Essa falha só pode reprovar casos futuros, nunca aprovar um caso antigo.

   Nenhuma das duas mudanças altera o veredito já registrado dos índices 1-25.
2. **Nonce e ancestralidade R8:** afetam só a admissão.
3. **Ledger e recorte:** definem quais casos executar, não como cada caso é verificado.
4. **Relatório v4, resumo final e assinatura de `summarizeNavigation`:** os validadores de linha (`navigationRowValid`), os specs de prontidão, os probes de links e controles e a política de rede de cada caso estão inalterados.

**Controles globais.** Sessão, MASTER, organização, logout e zero erros são executados e exigidos de novo na R8, como pede o item 5 da emenda. Eles não são herdados da R7, cujo `logoutVerified` é `false`.

Conclusão: os índices 1-25 da R7 permanecem compatíveis, e `a3b6c34` é o único harness declarado em `compatibleHarnessShas`. Qualquer alteração futura de produto, deployment, backend/RLS, fixtures, dependências, shell ou navegação compartilhada exige `SUPERSEDED` nos índices afetados, presumindo impacto amplo até prova em contrário.

## Pendências antes da REQUEST R8 (PR separada)

1. Baixar o artefato R7 `14008077669` e conferir o ZIP digest `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`, CRC, membros e `sha256sum --check SHA256SUMS`. Validar o `report.json` (schema v3, ordem canônica, índices 1-25 PASS com o validador de linha do auditor, índice 26 FAIL) e registrar apenas os hashes.
2. Criar o `NAV_LEDGER.json` com as 25 entradas, fixar `NAVIGATION_LEDGER.sha256` e passar por revisão independente, CI e merge protegido.
3. Só então criar a REQUEST R8 de sete chaves, com a revisão canônica JSON pela identidade exigida no auditor.

Certificação final: 52 entradas PASS válidas e compatíveis (1-25 da R7, 26-52 da R8), artefatos originais verificáveis, controles globais verificados na R8, revisão independente do ledger consolidado e PR final integrada.

# Fase 2 R8: ledger incremental e prova de compatibilidade dos PASS R7

Fase 2 continua NÃO CERTIFICADA. Este documento acompanha o BUILD do executor incremental exigido pela emenda de certificação incremental (PR #626, merge `78a5f4b`) e o primeiro ledger, com os 25 PASS verificados da R7. O ledger está fixado em `NAVIGATION_LEDGER.sha256 = 0a8f71f2c5bc8a845d62a4cfca39511dfdcab601c860f8da2894b66a47846408`, com `previousSha256 = null` e `resumeFrom = 26`.

## Verificação do artefato R7 (feita em 13/11/2026)

- Artefato `14008077669` (`trilha-a-private-43358055422-1`, Auth `43358055422`, attempt 1, `head_sha` `a3b6c34936a095fdca98bb79c3f21d28ed0e3979`), 1900 bytes, não expirado.
- SHA-256 do ZIP: `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`, igual ao digest registrado pelo GitHub.
- CRC válido. Exatamente dois membros: `report.json` (27656 bytes) e `SHA256SUMS` (78 bytes). `sha256sum --check` deu OK, com `report.json` = `4ecc2279d8de134aaf10813d4c6330eb75d27eef7b11e69e61b9ea184c612d0d`.
- `report.json`: `contaos.navigation.audit.v3`, escopo `INTEGRACAO_V1_FASE2_NAV`, `frontendSha` `3638cdd…`, `harnessSha` `a3b6c34…`, `deploymentId` `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`. Resumo: 26 observados, 25 PASS, 1 FAIL, `matrixComplete=false`.
- Os 26 registros estão exatamente na ordem canônica de `navigationCases()`. Os índices 1-25 são PASS com `stage`/`operation` `FINISH`, e cada linha é aceita pelo validador canônico do auditor (`summarizeNavigation` linha a linha: 25/25). O índice 26 (V110/390) é `FAIL` `LINKS`/`LINK_CLICK` `FENCE_DRAIN_TIMEOUT` e é recusado pelo validador, como esperado.
- Controles globais R7: sessão, MASTER e organização `true`, `logoutVerified=false`, `fenceDiagnostic` `FENCE_DRAIN_TIMEOUT`. Por isso nenhum controle global é herdado: todos são exigidos de novo na R8.
- Nenhum conteúdo do artefato foi inserido no repositório, apenas hashes e identificadores.

## Mecanismo

- **Ledger:** `docs/frontend/auditorias/integracao-funcional-v1/fase2/NAV_LEDGER.json`, schema `contaos.navigation.incremental.v1`, em forma canônica exata (`JSON.stringify(…, null, 2)` + LF). Texto fora da forma canônica, com chaves duplicadas ou acima de 256 KiB é recusado.
- **Pin no auditor** (`NAVIGATION_LEDGER`): `sha256` do arquivo, `previousSha256` (cadeia append-only; nulo no primeiro ledger), `resumeFrom` esperado e `compatibleHarnessShas`.
- **Índice canônico:** a ordem de `navigationCases()` (26 superfícies × 1440/light, 390/dark), amarrada por `catalogueSha256`. Cada entrada confere `index`, `surface`, `width` e `theme`.
- **Entrada `PASS`:** `runId`, `attempt` 1, `frontendSha`, `harnessSha`, `deploymentId`, `artifactId`, `artifactSha256` e `reportSha256`, sem campos extras ou ausentes. Regras:
  - execuções em ordem crescente e índices crescentes dentro de cada execução;
  - evidência idêntica entre todas as entradas da mesma execução;
  - nunca dois PASS válidos para o mesmo índice.
  - `artifactId`, `artifactSha256` e `reportSha256` pertencem a uma única execução (`runId`/`attempt`): evidência de uma execução nunca é reaproveitada por outra, nem depois de `SUPERSEDED` (PR #631).
- **Entrada `SUPERSEDED`:** invalida um PASS sem apagá-lo. Aponta a execução exata (`supersedesRunId`, `supersedesAttempt`) do PASS válido no mesmo índice e o commit da mudança (`changeSha`), com justificativa de 16 a 512 caracteres. Não carrega evidência de PASS. O índice pode então ser reexecutado e receber um novo PASS.
- **Compatibilidade:** exigida dos PASS que permanecem válidos: mesmo produto e deployment de `NAVIGATION_DEPLOYMENT` e harness em `compatibleHarnessShas`.
- **Sem lacuna:** nenhum PASS válido depois do primeiro índice pendente, e a retomada calculada tem de ser igual à fixada.
- **Extensão:** `validateNavigationLedgerExtension(anterior, novo)` exige que a nova versão encadeie o hash da anterior e só acrescente entradas ao fim. Em execução, `verifyNavigationLedgerChain` procura no histórico git do harness a versão cujo SHA-256 é `previousSha256` e aplica essa verificação. Se a versão anterior não estiver no histórico ou não for prefixo exato, a execução falha fechada.
- **Validação antes de qualquer credencial:**
  1. no preflight sem credenciais (`--request-preflight`);
  2. no `--request-revalidate` do job privado, antes dos secrets;
  3. na entrada do `--audit`;
  4. em `runNavigationAudit`, logo após as verificações de escopo e antes de qualquer ação no navegador.

  Com `sha256` nulo ou ledger inválido, a execução falha nesses pontos, antes do login no HML.
- **Execução:** só `navigationRunCases(resumeFrom)`. Casos anteriores não são executados, não geram registro e não contam como testados. Sessão, MASTER, organização e logout continuam obrigatórios em toda execução.
- **Relatório:** com `resumeFrom > 1`, schema `contaos.navigation.audit.v4`, com `ledgerSha256`, `resumeFrom` e resumo `expected`, `observed`, `passed`, `failed`, `resumeFrom`, `runComplete`, `cumulativeMatrixComplete`, **sem** `matrixComplete`. O validador v4 reaproveita sem mudança todos os controles globais do v3. A montagem final (`navigationFinalSummary`/`navigationReportLedger`) nunca lança: se o ledger faltar, a execução abortar ou o logout falhar, o relatório é gravado e lacrado com `runComplete=false` e `cumulativeMatrixComplete=false`.
- Com `resumeFrom = 1`, o fluxo v3 permanece o mesmo, apenas passando a exigir um ledger válido.
- A matriz consolidada 52/52 corresponde a `resumeFrom = 53`. Ela é validada pelo `validateNavigationLedger` na PR de certificação. O carregador de execução (`loadNavigationLedger`) recusa `resumeFrom = 53` antes de qualquer credencial, e o resumo final continua sem lançar também nesse caso.

## Prova de não impacto: execução R7 → execução R8

**Produto.** É o mesmo: fonte `3638cdd381cb911f6bdc115169891a25479b7a25`, deployment HML `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, `NAVIGATION_DEPLOYMENT` inalterado.

**Backend e RBAC/RLS.** O `contaos999999/develop` continua em `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6` (09/11/2026), igual ao `baseline_backend` registrado para a R7 em `PLANO_ATIVO.json`. A última migration aplicada ao Supabase HML `gklhhhyosgasnyoxlrui` é `20261109014019 c_chat_raw_read_hardening`, de 09/11/2026, anterior à execução R7 de 13/11/2026 03:18Z (consulta só leitura).

**Fixtures e dados HML.** Desde a R7 (Fixtures `43358055500`), todas as execuções `workflow_run` de Fixtures (`43364499714`, `43374016811`) e Auth (`43364499709`, `43374016775`) tiveram os jobs privados `skipped`. Não houve preparação sintética nem sessão privada, e o estado sintético é o mesmo da R7.

**Dependências do harness.** Nenhuma mudança em `package.json`, lockfiles, `.github/` ou `scripts/ci/` entre `a3b6c34` e este BUILD.

**Código do harness.** As diferenças entre `a3b6c34` e a `main` depois da PR #631 (commit `41bdb90` e seguintes) estão em quatro áreas:
1. **Ciclo de vida do fence (PR #629).**
   - A aposentadoria do preflight torna o drain mais permissivo apenas quando as três provas existem. Isso não pode transformar em FAIL um caso que passou sob a regra mais estrita da R7.
   - `responded()` acrescenta um caminho de falha `FENCE_REQUEST_LIFECYCLE`, alcançável só por uso fora de ordem do ciclo de vida. Essa falha só pode reprovar casos futuros, nunca aprovar um caso antigo.

   Nenhuma das duas mudanças altera o veredito já registrado dos índices 1-25.
2. **Nonce e ancestralidade R8:** afetam só a admissão.
3. **Ledger e recorte, inclusive a regra de evidência única por execução (PR #631):** definem quais casos executar e quais evidências são aceitas, não como cada caso é verificado.
4. **Relatório v4, resumo final (com a proteção externa da PR #631) e assinatura de `summarizeNavigation`:** os validadores de linha (`navigationRowValid`), os specs de prontidão, os probes de links e controles e a política de rede de cada caso estão inalterados.

**Controles globais.** Sessão, MASTER, organização, logout e zero erros são executados e exigidos de novo na R8, como pede o item 5 da emenda. Eles não são herdados da R7, cujo `logoutVerified` é `false`.

Conclusão: os índices 1-25 da R7 permanecem compatíveis, e `a3b6c34` é o único harness declarado em `compatibleHarnessShas`. Qualquer alteração futura de produto, deployment, backend/RLS, fixtures, dependências, shell ou navegação compartilhada exige `SUPERSEDED` nos índices afetados, presumindo impacto amplo até prova em contrário.

## Mutações residuais (equivalentes)

As mutações que ainda sobrevivem só removem guardas sem efeito observável distinto: limite de 256 KiB e de 208 entradas (o texto acaba recusado por outra regra), `validBefore` e a exigência de `cumulativeMatrixComplete` no v4 (redundantes depois da validação do ledger) e `resumeFrom <= 1` no v4 (já coberto pela comparação com o ledger). Ficam como defesa em profundidade.

## Próximos passos

1. Revisão independente desta PR (mecanismo e ledger), Zero-Drift, LOCK, os dois workflows Trilha A e merge protegido.
2. REQUEST R8 de sete chaves, com `approved_parent_sha` igual ao merge desta PR e revisão canônica JSON pela identidade exigida no auditor. Auth attempt 1 automática, executando os índices 26 a 52.
3. Se a R8 passar com `runComplete=true` e `cumulativeMatrixComplete=true`: nova versão do ledger com os índices 26-52 da R8, encadeada a `0a8f71f2…` e com `resumeFrom = 53`; revisão independente do ledger consolidado (52/52) e PR final de certificado integrada à `main`.

## Ledger v2 e BUILD R9 (emenda R9)

**Ledger v2** (`35297ac588a9b8c57f1f3de2cee2369f111f2596e90891d364d8a20cdbd0305d`), encadeado ao v1 (`0a8f71f2…`):
- índices 1-25 da R7, sem mudança;
- índices 26-29 e 31-34 da R8: Auth `43388821235` attempt 1, harness `9a4d0ad16a8a64fa04a30208c8c36e7020ec9b01`, artefato `14020676685`, ZIP `ab15acd3…`, `report.json` `3025371b…` (v4).

Os oito registros da R8 estão na ordem canônica e são aceitos um a um pelo validador de linha. Os índices 30 e 35 (FAIL) são recusados por ele.

Pela emenda R9 (C), os PASS 31-34, posteriores ao FAIL não fatal do índice 30, são candidatos. Ficam 19 pendentes (30 e 35-52), e o primeiro é o 30.

**Compatibilidade de `9a4d0ad` com o harness do BUILD R9.** As mudanças do BUILD R9 não alteram a verificação de cada caso:
1. **Instrumentação.** São ouvintes adicionais que só emitem marcadores fechados (`NAVIGATION_TRANSPORT_DETAIL`, com classe de endpoint por lista fechada, pedido de navegação, frame, ms e documentos desde o clique; `FENCE_DRAIN_DIAGNOSTIC`) e um registro do instante do clique, com volume limitado (64 marcadores, contador de documentos até 1000). Os contadores e os validadores existentes estão inalterados.
2. **Aposentadoria do preflight estendida a `POST`, com as mesmas três provas.** Só torna o drain menos sujeito a travar quando há prova. Não pode transformar em FAIL um caso que passou. O RED/GREEN em Chromium real está em `R9_EXPERIMENTO_PREFLIGHT_POST_2026-11-13.md`.
3. **Revisão canônica aceita também `Edivan5002` e o rodapé fixo.** Afeta só a admissão.
4. **Ledger com lacunas e execução só dos pendentes.** Define quais casos executar, não como verificar cada um.

Assim `9a4d0ad` entra em `compatibleHarnessShas`. Produto, deployment, backend `5eca44a`, migrations HML (última de 09/11) e fixtures (nenhuma execução privada desde a R7, além das próprias R7 e R8) estão inalterados.

A pré-revisão por mutação (D) do BUILD R9 detectou 11 de 11 mutações das regras novas: POST, revisores, rodapé, ordem da mais recente, pendentes, contagem, recorte, tabela, RPC, diagnóstico e ordem estrita.
